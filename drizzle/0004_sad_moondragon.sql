CREATE TABLE `panic_attack_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`severity` int NOT NULL,
	`duration` int,
	`triggers` text,
	`symptoms` text,
	`coping_strategies` text,
	`notes` text,
	`start_time` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `panic_attack_logs_id` PRIMARY KEY(`id`)
);
