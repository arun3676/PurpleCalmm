import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Journal entries for tracking thoughts and feelings
 */
export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  mood: mysqlEnum("mood", ["very_bad", "bad", "neutral", "good", "very_good"]).notNull(),
  tags: text("tags"), // JSON array of tags
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

/**
 * Migraine tracking logs
 */
export const migraineLogs = mysqlTable("migraine_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  severity: int("severity").notNull(), // 1-10 scale
  duration: int("duration"), // minutes
  triggers: text("triggers"), // JSON array
  symptoms: text("symptoms"), // JSON array
  medication: varchar("medication", { length: 255 }),
  notes: text("notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type MigraineLog = typeof migraineLogs.$inferSelect;
export type InsertMigraineLog = typeof migraineLogs.$inferInsert;

/**
 * Sleep sessions tracking
 */
export const sleepSessions = mysqlTable("sleep_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  soundType: varchar("sound_type", { length: 100 }), // rain, ocean, forest, etc.
  duration: int("duration"), // minutes
  quality: int("quality"), // 1-5 rating
  notes: text("notes"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SleepSession = typeof sleepSessions.$inferSelect;
export type InsertSleepSession = typeof sleepSessions.$inferInsert;

/**
 * Breathing exercise sessions
 */
export const breathingSessions = mysqlTable("breathing_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  exerciseType: varchar("exercise_type", { length: 100 }), // box, 4-7-8, calm, etc.
  duration: int("duration").notNull(), // seconds
  completed: int("completed").default(1).notNull(), // boolean as int
  moodBefore: mysqlEnum("mood_before", ["very_bad", "bad", "neutral", "good", "very_good"]),
  moodAfter: mysqlEnum("mood_after", ["very_bad", "bad", "neutral", "good", "very_good"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BreathingSession = typeof breathingSessions.$inferSelect;
export type InsertBreathingSession = typeof breathingSessions.$inferInsert;

/**
 * Chat messages with AI cat companion
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;