import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { rooms, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import RoomContent from "./RoomContent";
import JoinRoomForm from "./JoinRoomForm";
import { cookies } from "next/headers";

type RoomPageProps = {
  params: {
    roomCode: string;
  };
};

export default async function RoomPage({
  params: { roomCode },
}: RoomPageProps) {
  const cookieRoomCode = cookies().get("room_code")?.value;
  const userId = cookies().get("user_id")?.value;

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.roomCode, roomCode))
    .limit(1)
    .execute();

  if (room.length === 0) {
    return notFound();
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, parseInt(userId || "")))
    .limit(1)
    .execute();

  const roomUsers = await db
    .select()
    .from(users)
    .where(eq(users.roomId, room[0].id))
    .execute();

  if (!cookieRoomCode || !userId || !user || roomCode != cookieRoomCode)
    return (
      <div className="h-screen w-full flex justify-center items-center p-4">
        <Card className="w-full max-w-3xl h-full">
          <CardHeader>
            <CardTitle>Room {roomCode}</CardTitle>
          </CardHeader>
          <JoinRoomForm roomCode={room[0].roomCode} />
        </Card>
      </div>
    );

  return (
    <div className="h-screen w-full flex justify-center items-center p-4">
      <Card className="w-full max-w-3xl h-full">
        <CardHeader>
          <CardTitle>Room {roomCode}</CardTitle>
        </CardHeader>
        <RoomContent room={room[0]} user={user[0]} users={roomUsers} />
      </Card>
    </div>
  );
}
