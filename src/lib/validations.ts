import { number, z } from "zod";

export const createRoomSchema = z.object({
  userName: z.string().min(1, {
    message: "User name is required",
  }),
  buyIn: z.coerce.number().min(1, {
    message: "Default buy in must be at least 1",
  }),
});

export const joinRoomSchema = z.object({
  roomCode: z.string().length(6, {
    message: "Room code must be 6 characters",
  }),
  userName: z.string().min(1, {
    message: "User name is required",
  }),
});

export const betSchema = z.object({
  userId: z.coerce.number(),
  chips: z.coerce.number().min(5, {
    message: "Bet must be at least 5",
  }),
});

export type CreateRoomSchema = z.infer<typeof createRoomSchema>;
