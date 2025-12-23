import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users,
  journalEntries,
  InsertJournalEntry,
  migraineLogs,
  InsertMigraineLog,
  sleepSessions,
  InsertSleepSession,
  breathingSessions,
  InsertBreathingSession,
  chatMessages,
  InsertChatMessage,
  btsJournal,
  InsertBtsJournalEntry,
  weightTracking,
  InsertWeightEntry,
  panicAttackLogs,
  InsertPanicAttackLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Journal queries
export async function createJournalEntry(entry: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(journalEntries).values(entry);
  return result;
}

export async function getUserJournalEntries(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(journalEntries).where(eq(journalEntries.userId, userId)).orderBy(desc(journalEntries.createdAt)).limit(limit);
}

export async function updateJournalEntry(id: number, userId: number, data: Partial<InsertJournalEntry>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(journalEntries).set(data).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

export async function deleteJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

// Migraine queries
export async function createMigraineLog(log: InsertMigraineLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(migraineLogs).values(log);
}

export async function getUserMigraineLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(migraineLogs).where(eq(migraineLogs.userId, userId)).orderBy(desc(migraineLogs.startTime)).limit(limit);
}

export async function updateMigraineLog(id: number, userId: number, data: Partial<InsertMigraineLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(migraineLogs).set(data).where(and(eq(migraineLogs.id, id), eq(migraineLogs.userId, userId)));
}

export async function deleteMigraineLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(migraineLogs).where(and(eq(migraineLogs.id, id), eq(migraineLogs.userId, userId)));
}

// Sleep session queries
export async function createSleepSession(session: InsertSleepSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sleepSessions).values(session);
}

export async function getUserSleepSessions(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sleepSessions).where(eq(sleepSessions.userId, userId)).orderBy(desc(sleepSessions.startTime)).limit(limit);
}

// Breathing session queries
export async function createBreathingSession(session: InsertBreathingSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(breathingSessions).values(session);
}

export async function getUserBreathingSessions(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(breathingSessions).where(eq(breathingSessions.userId, userId)).orderBy(desc(breathingSessions.createdAt)).limit(limit);
}

// Chat message queries
export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(chatMessages).values(message);
}

export async function getUserChatMessages(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.userId, userId)).orderBy(chatMessages.createdAt).limit(limit);
}

export async function clearUserChatHistory(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}

// BTS Journal queries
export async function createBtsJournalEntry(entry: InsertBtsJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(btsJournal).values(entry);
}

export async function getBtsJournalEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(btsJournal).where(eq(btsJournal.userId, userId)).orderBy(desc(btsJournal.createdAt));
}

export async function deleteBtsJournalEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(btsJournal).where(eq(btsJournal.id, id));
}

// Weight tracking queries
export async function createWeightEntry(entry: InsertWeightEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(weightTracking).values(entry);
}

export async function getWeightEntries(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weightTracking).where(eq(weightTracking.userId, userId)).orderBy(desc(weightTracking.createdAt));
}

export async function deleteWeightEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(weightTracking).where(eq(weightTracking.id, id));
}

// Panic attack queries
export async function createPanicAttackLog(log: InsertPanicAttackLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(panicAttackLogs).values(log);
}

export async function getUserPanicAttackLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(panicAttackLogs).where(eq(panicAttackLogs.userId, userId)).orderBy(desc(panicAttackLogs.startTime)).limit(limit);
}

export async function updatePanicAttackLog(id: number, userId: number, data: Partial<InsertPanicAttackLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(panicAttackLogs).set(data).where(and(eq(panicAttackLogs.id, id), eq(panicAttackLogs.userId, userId)));
}

export async function deletePanicAttackLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(panicAttackLogs).where(and(eq(panicAttackLogs.id, id), eq(panicAttackLogs.userId, userId)));
}
