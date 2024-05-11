"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { createRoomSchema } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { createRoom } from "@/lib/actions/room";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { redirect } from "next/navigation";

export default function CreateRoomForm() {
  const [state, formAction] = useFormState(createRoom, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.success) {
      redirect(`/${state.response?.roomCode}`);
    }
  }, [state.success, state.response, state.fields]);

  const form = useForm<z.output<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      userName: "",
      buyIn: 0,
      ...state?.fields,
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  return (
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
          name="buyIn"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Buy In</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder=""
                  {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Amount of chips a user gets when they buy in.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
