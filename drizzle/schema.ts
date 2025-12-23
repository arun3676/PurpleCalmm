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
  chatPersonality: mysqlEnum("chatPersonality", ["comforting", "funny", "rude"]).default("comforting").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// BTS Army Journal - daily BTS quotes
export const btsJournal = mysqlTable("bts_journal", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  quote: text("quote").notNull(),
  member: varchar("member", { length: 50 }), // RM, Jin, Suga, J-Hope, Jimin, V, Jungkook
  reflection: text("reflection"), // User's thoughts on the quote
  mood: mysqlEnum("mood", ["very_bad", "bad", "neutral", "good", "very_good"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BtsJournalEntry = typeof btsJournal.$inferSelect;
export type InsertBtsJournalEntry = typeof btsJournal.$inferInsert;

// Weight Gain Journey Tracker
export const weightTracking = mysqlTable("weight_tracking", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  weight: int("weight").notNull(), // Weight in kg or lbs (stored as integer)
  unit: mysqlEnum("unit", ["kg", "lbs"]).default("kg").notNull(),
  goalWeight: int("goalWeight"), // Target weight
  notes: text("notes"), // How they're feeling, what they ate, etc.
  photoUrl: text("photoUrl"), // Progress photo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeightEntry = typeof weightTracking.$inferSelect;
export type InsertWeightEntry = typeof weightTracking.$inferInsert;

// TODO: Add your tables here

/**
 * Journal entries table for tracking thoughts and feelings
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
/**
 * Panic attack logs
 */
export const panicAttackLogs = mysqlTable("panic_attack_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  severity: int("severity").notNull(), // 1-10 scale
  duration: int("duration"), // minutes
  triggers: text("triggers"), // JSON array
  symptoms: text("symptoms"), // JSON array
  copingStrategies: text("coping_strategies"), // JSON array - what helped
  notes: text("notes"),
  startTime: timestamp("start_time").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PanicAttackLog = typeof panicAttackLogs.$inferSelect;
export type InsertPanicAttackLog = typeof panicAttackLogs.$inferInsert;
