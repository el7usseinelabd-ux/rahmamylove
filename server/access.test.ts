import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext() {
  const cookies: Array<{ name: string; value: string }> = [];
  const cleared: string[] = [];
  const ctx = {
    user: null,
    req: { protocol: "https", headers: {} },
    res: {
      cookie: (name: string, value: string) => cookies.push({ name, value }),
      clearCookie: (name: string) => cleared.push(name),
    },
  } as unknown as TrpcContext;
  return { ctx, cookies, cleared };
}

describe("rahma access gate", () => {
  it("rejects an incorrect password", async () => {
    const { ctx } = createContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.access.unlock({ password: "not-the-password" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("accepts the configured password and issues an access cookie", async () => {
    const { ctx, cookies } = createContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.access.unlock({ password: process.env.RAHMA_ACCESS_PASSWORD ?? "" });
    expect(result).toEqual({ unlocked: true });
    expect(cookies[0]?.name).toBe("rahma_access");
    expect(cookies[0]?.value).toContain(".");
  });
});
