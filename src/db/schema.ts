import { relations } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey(),
  roomCode: text("room_code").notNull().unique(),
  buyIn: integer("buy_in").notNull(),
  pot: integer("pot").notNull().default(0),
  // smallBlindUserId: integer("small_blind_user_id"),
  // bigBlindUserId: integer("big_blind_user_id"),
});

export const roomRelations = relations(rooms, ({ one, many }) => ({
  users: many(users),
  // smallBlindUser: one(users),
  // bigBlindUser: one(users),
}));

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  name: text("name"),
  chips: integer("chips"),
  roomId: integer("room_id"),
});

export const userRelations = relations(users, ({ one }) => ({
  room: one(rooms),
}));
