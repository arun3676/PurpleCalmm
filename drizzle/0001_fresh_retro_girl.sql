CREATE TABLE `breathing_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`exercise_type` varchar(100),
	`duration` int NOT NULL,
	`completed` int NOT NULL DEFAULT 1,
	`mood_before` enum('very_bad','bad','neutral','good','very_good'),
	`mood_after` enum('very_bad','bad','neutral','good','very_good'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `breathing_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`mood` enum('very_bad','bad','neutral','good','very_good') NOT NULL,
	`tags` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `migraine_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`severity` int NOT NULL,
	`duration` int,
	`triggers` text,
	`symptoms` text,
	`medication` varchar(255),
	`notes` text,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `migraine_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`sound_type` varchar(100),
	`duration` int,
	`quality` int,
	`notes` text,
	`start_time` timestamp NOT NULL,
	`end_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_sessions_id` PRIMARY KEY(`id`)
);
