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
    chatPersonality: "comforting",
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
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("personality mode procedures", () => {
  it("sets personality to funny", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.setPersonality({ personality: "funny" });

    expect(result).toEqual({ success: true });
  });

  it("sets personality to rude", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.setPersonality({ personality: "rude" });

    expect(result).toEqual({ success: true });
  });

  it("sets personality to comforting", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.setPersonality({ personality: "comforting" });

    expect(result).toEqual({ success: true });
  });

  it("requires authentication for setting personality", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.setPersonality({ personality: "funny" })
    ).rejects.toThrow();
  });
});
