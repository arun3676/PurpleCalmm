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

describe("journal procedures", () => {
  it("creates a journal entry successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.journal.create({
      title: "Test Entry",
      content: "This is a test journal entry",
      mood: "good",
      tags: ["test", "wellness"],
    });

    expect(result).toEqual({ success: true });
  });

  it("lists journal entries for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an entry first
    await caller.journal.create({
      content: "Another test entry",
      mood: "neutral",
    });

    const entries = await caller.journal.list();
    expect(Array.isArray(entries)).toBe(true);
  });

  it("requires authentication for journal operations", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: () => {},
      } as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.journal.create({
        content: "Test",
        mood: "good",
      })
    ).rejects.toThrow();
  });
});
