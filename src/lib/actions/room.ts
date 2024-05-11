"use server";

import { rooms, users } from "@/db/schema";
import { betSchema, createRoomSchema, joinRoomSchema } from "../validations";
import { z } from "zod";
import { db } from "@/db";
import { eq } from "drizzle-orm";

import { customAlphabet } from "nanoid";
import { cookies } from "next/headers";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

export type FormState = {
  success: boolean;
  message: string;
  response?: {
    roomCode: string;
    userId: number;
  };
  fields?: Record<string, string>;
  issues?: string[];
};

export async function createRoom(prevState: FormState, data: FormData) {
  const formData = Object.fromEntries(data);
  try {
    const { userName, buyIn } = createRoomSchema.parse(formData);

    const roomCode = nanoid(6);

    const room = await db
      .insert(rooms)
      .values({
        buyIn,
        roomCode,
      })
      .returning({ id: rooms.id });

    const user = await db
      .insert(users)
      .values({
        name: userName,
        chips: buyIn,
        roomId: room[0].id,
      })
      .returning({ id: users.id });

    cookies().set("room_code", roomCode);
    cookies().set("user_id", user[0].id.toString());

    return {
      success: true,
      message: "Room created successfully",
      response: { roomCode, userId: user[0].id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }
      return {
        success: false,
        message: "Invalid form data",
        fields,
        issues: error.issues.map((issue) => issue.message),
      };
    }

    console.error(error);

    return {
      success: false,
      message: "An error occurred",
    };
  }
}

export async function joinRoom(prevState: FormState, data: FormData) {
  const formData = Object.fromEntries(data);
  console.log(data);
  try {
    const { roomCode, userName } = joinRoomSchema.parse(formData);
    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomCode, roomCode))
      .limit(1)
      .execute();

    if (room.length === 0) {
      return {
        success: false,
        message: "Room not found",
      };
    }

    const user = await db
      .insert(users)
      .values({
        name: userName,
        chips: room[0].buyIn,
        roomId: room[0].id,
      })
      .returning({ id: users.id });

    cookies().set("room_code", roomCode);
    cookies().set("user_id", user[0].id.toString());

    return {
      success: true,
      message: "Room joined successfully",
      response: { roomCode, userId: user[0].id },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }
      return {
        success: false,
        message: "Invalid form data",
        fields,
        issues: error.issues.map((issue) => issue.message),
      };
    }

    console.error(error);

    return {
      success: false,
      message: "An error occurred",
    };
  }
}

export type BetFormState = {
  success: boolean;
  message: string;
  fields?: Record<string, string>;
  response?: {
    chips: number;
    timestamp: number;
  };
  issues?: string[];
};

export async function bet(prevState: BetFormState, data: FormData) {
  const formData = Object.fromEntries(data);
  console.log({ formData });
  try {
    const { userId, chips } = betSchema.parse(formData);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user[0].chips! < chips) {
      return {
        success: false,
        message: "Not enough chips",
      };
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, user[0].roomId!))
      .limit(1)
      .execute();

    if (room.length === 0) {
      return {
        success: false,
        message: "Room not found",
      };
    }

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(rooms)
          .set({
            pot: room[0].pot! + chips,
          })
          .where(eq(rooms.id, user[0].roomId!))
          .execute();

        await tx
          .update(users)
          .set({
            chips: user[0].chips! - chips,
          })
          .where(eq(users.id, userId))
          .execute();
      });
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }

      return {
        success: true,
        message: "",
        response: { chips, timestamp: Date.now() },
        fields: {
          ...fields,
          chips: "0",
        },
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }
      return {
        success: false,
        message: "Invalid form data",
        fields,
        issues: error.issues.map((issue) => issue.message),
      };
    }

    console.error(error);

    return {
      success: false,
      message: "An error occurred",
    };
  }
}

export async function take(prevState: BetFormState, data: FormData) {
  const formData = Object.fromEntries(data);
  try {
    const { userId, chips } = betSchema.parse(formData);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
      .execute();

    if (user.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, user[0].roomId!))
      .limit(1)
      .execute();

    if (room.length === 0) {
      return {
        success: false,
        message: "Room not found",
      };
    }

    if (chips > room[0].pot!) {
      return {
        success: false,
        message: "Not enough chips in pot",
      };
    }

    const updatedPot = room[0].pot! - chips;

    try {
      await db.transaction(async (tx) => {
        await tx
          .update(rooms)
          .set({
            pot: updatedPot,
          })
          .where(eq(rooms.id, user[0].roomId!))
          .execute();

        await tx
          .update(users)
          .set({
            chips: user[0].chips! + chips,
          })
          .where(eq(users.id, userId))
          .execute();
      });

      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }

      return {
        success: true,
        message: "",
        response: { chips, timestamp: Date.now() },
        fields: {
          ...fields,
          chips: updatedPot.toString(),
        },
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred",
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formData)) {
        fields[key] = formData[key].toString();
      }
      return {
        success: false,
        message: "Invalid form data",
        fields,
        issues: error.issues.map((issue) => issue.message),
      };
    }

    console.error(error);

    return {
      success: false,
      message: "An error occurred",
    };
  }
}
