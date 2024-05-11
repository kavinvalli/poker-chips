CREATE TABLE `rooms` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`pot` integer NOT NULL,
	`buy_in` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`chips` integer,
	`room_id` integer
);
