"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { joinRoom } from "@/lib/actions/room";
import { joinRoomSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface JoinRoomFormProps {
  roomCode: string;
}

export default function JoinRoomForm({ roomCode }: JoinRoomFormProps) {
  const [state, formAction] = useFormState(joinRoom, {
    success: false,
    message: "",
  });

  const form = useForm<z.output<typeof joinRoomSchema>>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      userName: "",
      roomCode,
      ...state?.fields,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
    <CardContent>
      <Form {...form}>
        {state?.message !== "" && !state?.issues && (
          <div className="text-red-500">{state?.message}</div>
        )}
        {state?.issues && (
          <div className="text-red-500">
            <ul>
              {state.issues.map((issue) => (
                <li key={issue} className="flex gap-1">
                  <X fill="red" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        <form
          ref={formRef}
          action={formAction}
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(() => {
              formAction(new FormData(formRef.current!));
            })(e);
          }}
          className="space-y-2"
        >
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>User Name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormDescription>Your name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roomCode"
            render={({ field }) => (
              <Input type="hidden" placeholder="" {...field} />
            )}
          />
          <Button type="submit">Join Room</Button>
        </form>
      </Form>
    </CardContent>
  );
}
