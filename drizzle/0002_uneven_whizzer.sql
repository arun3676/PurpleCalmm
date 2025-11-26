CREATE TABLE `bts_journal` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`quote` text NOT NULL,
	`member` varchar(50),
	`reflection` text,
	`mood` enum('very_bad','bad','neutral','good','very_good'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bts_journal_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weight_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weight` int NOT NULL,
	`unit` enum('kg','lbs') NOT NULL DEFAULT 'kg',
	`goalWeight` int,
	`notes` text,
	`photoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `weight_tracking_id` PRIMARY KEY(`id`)
);
