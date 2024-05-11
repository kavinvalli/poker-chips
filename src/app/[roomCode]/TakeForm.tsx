"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { take } from "@/lib/actions/room";
import { socket } from "@/lib/socket";
import { betSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferSelectModel } from "drizzle-orm";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { users } from "@/db/schema";

type User = InferSelectModel<typeof users>;

export default function BetForm({
  user,
  maxChips,
  roomCode,
}: {
  user: User;
  maxChips: number;
  roomCode: string;
}) {
  const [state, formAction] = useFormState(take, {
    success: false,
    message: "",
  });

  useEffect(() => {
    if (state.success) {
      socket.emit("take", roomCode, user, state.response?.chips);
      form.setValue("chips", maxChips - state.response?.chips!);
    }
  }, [
    state.success,
    state.response?.chips,
    state.response?.timestamp,
    user,
    roomCode,
  ]);

  const form = useForm<z.output<typeof betSchema>>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      userId: user.id,
      chips: maxChips!,
    },
  });

  console.log({ maxChips, value: form.getValues("chips") });

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
        className="space-y-2 w-full"
      >
        <FormField
          control={form.control}
          name="chips"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={5}
                  max={maxChips}
                  step={5}
                  {...field}
                  value={[field.value]}
                  defaultValue={[field.value]}
                  onValueChange={(val: number[]) => {
                    field.onChange(+val[0]);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <Input type="hidden" placeholder="" {...field} />
          )}
        />
        <Button type="submit" className="w-full mt-2">
          Take
        </Button>
      </form>
    </Form>
  );
}
