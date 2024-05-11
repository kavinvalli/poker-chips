"use client";
import * as React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "./RoomContent";

const Feed = React.forwardRef<HTMLDivElement, { messages: Message[] }>(
  ({ messages }, ref) => {
    return (
      <div className="flex flex-col gap-2 p-4 h-full overflow-y-auto" ref={ref}>
        {messages.map((message, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Avatar>
              <AvatarFallback>
                {(message.user.name || "")
                  .split(" ")
                  .map((word) => word[0].toUpperCase())
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>{message.message}</div>
          </div>
        ))}
      </div>
    );
  },
);
Feed.displayName = "Feed";

export default Feed;
