import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("BTS Journal", () => {
  it("creates a BTS journal entry successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.btsJournal.create({
      quote: "Love yourself, love myself, peace.",
      member: "RM",
      reflection: "This quote reminds me to be kind to myself",
      mood: "very_good",
    });

    expect(result).toEqual({ success: true });
  });

  it("lists BTS journal entries for a user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry first
    await caller.btsJournal.create({
      quote: "Teamwork makes the dream work",
      member: "Jin",
      mood: "good",
    });

    const entries = await caller.btsJournal.list();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    
    const latestEntry = entries[0];
    expect(latestEntry).toHaveProperty("quote");
    expect(latestEntry).toHaveProperty("member");
    expect(latestEntry).toHaveProperty("userId");
  });

  it("deletes a BTS journal entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry
    await caller.btsJournal.create({
      quote: "Test quote for deletion",
      member: "V",
    });

    // Get the entry
    const entries = await caller.btsJournal.list();
    const entryToDelete = entries.find(e => e.quote === "Test quote for deletion");
    
    if (entryToDelete) {
      const result = await caller.btsJournal.delete({ id: entryToDelete.id });
      expect(result).toEqual({ success: true });
    }
  });
});

describe("Weight Tracking", () => {
  it("creates a weight entry successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weight.create({
      weight: 65,
      unit: "kg",
      goalWeight: 70,
      notes: "Feeling good today!",
    });

    expect(result).toEqual({ success: true });
  });

  it("lists weight entries for a user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry first
    await caller.weight.create({
      weight: 68,
      unit: "kg",
      goalWeight: 72,
    });

    const entries = await caller.weight.list();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    
    const latestEntry = entries[0];
    expect(latestEntry).toHaveProperty("weight");
    expect(latestEntry).toHaveProperty("unit");
    expect(latestEntry).toHaveProperty("userId");
  });

  it("creates weight entry with lbs unit", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.weight.create({
      weight: 150,
      unit: "lbs",
      goalWeight: 160,
      notes: "Switching to lbs",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a weight entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry
    await caller.weight.create({
      weight: 66,
      unit: "kg",
      notes: "Test entry for deletion",
    });

    // Get the entry
    const entries = await caller.weight.list();
    const entryToDelete = entries.find(e => e.notes === "Test entry for deletion");
    
    if (entryToDelete) {
      const result = await caller.weight.delete({ id: entryToDelete.id });
      expect(result).toEqual({ success: true });
    }
  });
});
