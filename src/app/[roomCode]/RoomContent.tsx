"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { rooms, users } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";
import { socket } from "@/lib/socket";
import ChipsTab from "./ChipsTab";
import { ScrollArea } from "@/components/ui/scroll-area";
import Feed from "./Feed";
import BetForm from "./BetForm";
import TakeForm from "./TakeForm";

type User = InferSelectModel<typeof users>;

interface RoomContentProps {
  room: InferSelectModel<typeof rooms>;
  user: User;
  users: User[];
}

export interface Message {
  user: User;
  message: string;
}

export default function RoomContent({ room, user, users }: RoomContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chipsData, setChipsData] = useState<User[]>(users);
  const [pot, setPot] = useState<number>(room.pot || 0);
  const [userChips, setUserChips] = useState<number>(user.chips || 0);
  const feedScrollAreaRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"bet" | "take">("bet");

  useEffect(() => {
    if (room.roomCode && user) {
      socket.emit("join-room", room.roomCode, user);
    }

    socket.on("user-connected", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          user: data,
          message: `${data.name} joined the room`,
        },
      ]);

      setChipsData((prev) => {
        if (prev.find((u) => u.id === data.id)) {
          return prev;
        }
        return [...prev, data];
      });

      feedScrollAreaRef.current?.scrollIntoView(false);
    });

    socket.on("bet", (betUser, chips) => {
      setMessages((prev) => [
        ...prev,
        {
          user: betUser,
          message: `${betUser.name} bet ${chips} chips`,
        },
      ]);

      setChipsData((prev) =>
        prev.map((u) => {
          if (u.id === betUser.id) {
            return { ...u, chips: u.chips! - chips };
          }
          return u;
        }),
      );

      setPot((prev) => prev + chips);

      if (betUser.id === user.id) {
        setUserChips((prev) => prev - chips);
      }

      feedScrollAreaRef.current?.scrollIntoView(false);
    });

    socket.on("take", (betUser, chips) => {
      setMessages((prev) => [
        ...prev,
        {
          user: betUser,
          message: `${betUser.name} has taken ${chips} chips`,
        },
      ]);

      setChipsData((prev) =>
        prev.map((u) => {
          if (u.id === betUser.id) {
            return { ...u, chips: u.chips! + chips };
          }
          return u;
        }),
      );

      setPot((prev) => prev - chips);

      if (betUser.id === user.id) {
        setUserChips((prev) => prev + chips);
      }
      setTab("bet");

      feedScrollAreaRef.current?.scrollIntoView(false);
    });

    return () => {
      socket.off("user-connected");
      socket.off("bet");
      socket.off("take");
    };
  }, [room.roomCode, user]);

  return (
    <>
      <CardContent>
        <Tabs defaultValue="feed" className="w-full h-full">
          <TabsList className="w-full">
            <TabsTrigger value="feed">Activity Feed</TabsTrigger>
            <TabsTrigger value="chips">Chips</TabsTrigger>
          </TabsList>
          <TabsContent value="feed">
            <ScrollArea className="w-full h-[calc(100vh-70px-70px-40px-40px-24px-120px)]">
              <Feed messages={messages} ref={feedScrollAreaRef} />
            </ScrollArea>
          </TabsContent>
          <TabsContent value="chips">
            <ScrollArea className="w-full h-[calc(100vh-70px-70px-40px-40px-24px-120px)]">
              <ChipsTab users={chipsData} />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
      <Separator />
      <CardFooter className="w-full pt-6">
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as "bet" | "take")}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="bet">Bet</TabsTrigger>
            <TabsTrigger value="take">Take</TabsTrigger>
          </TabsList>
          <TabsContent value="bet">
            <BetForm
              roomCode={room.roomCode}
              user={user}
              maxChips={userChips}
            />
          </TabsContent>
          <TabsContent value="take">
            <TakeForm roomCode={room.roomCode} user={user} maxChips={pot} />
          </TabsContent>
        </Tabs>
      </CardFooter>
    </>
  );
}
