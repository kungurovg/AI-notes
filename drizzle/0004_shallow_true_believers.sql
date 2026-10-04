ALTER TABLE `chats` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `chats_userId_idx` ON `chats` (`user_id`);--> statement-breakpoint
ALTER TABLE `notes` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `notes_userId_idx` ON `notes` (`user_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`chat_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_messages`("id", "chat_id", "role", "content", "created_at") SELECT "id", "chat_id", "role", "content", "created_at" FROM `messages`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
ALTER TABLE `__new_messages` RENAME TO `messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `messages_chatId_idx` ON `messages` (`chat_id`);