import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "test-user-2",
    email: "test2@example.com",
    name: "Test User 2",
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

describe("migraine procedures", () => {
  it("creates a migraine log successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.migraine.create({
      severity: 7,
      duration: 120,
      triggers: ["Stress", "Bright lights"],
      symptoms: ["Throbbing pain", "Nausea"],
      medication: "Ibuprofen 400mg",
      notes: "Started after work meeting",
      startTime: new Date(),
    });

    expect(result).toEqual({ success: true });
  });

  it("lists migraine logs for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const logs = await caller.migraine.list();
    expect(Array.isArray(logs)).toBe(true);
  });

  it("validates severity range", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.migraine.create({
        severity: 11, // Invalid: should be 1-10
        startTime: new Date(),
      })
    ).rejects.toThrow();
  });

  it("requires authentication for migraine operations", async () => {
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
      caller.migraine.create({
        severity: 5,
        startTime: new Date(),
      })
    ).rejects.toThrow();
  });
});
