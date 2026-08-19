import { createHmac, timingSafeEqual } from "node:crypto";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const ACCESS_COOKIE = "rahma_access";
const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30;

function secretKey() {
  return process.env.RAHMA_ACCESS_PASSWORD || "";
}

function signature(payload: string) {
  return createHmac("sha256", secretKey()).update(payload).digest("hex");
}

function makeToken() {
  const payload = String(Date.now());
  return `${payload}.${signature(payload)}`;
}

function hasValidAccess(raw?: string) {
  if (!raw) return false;
  const [payload, digest] = raw.split(".");
  if (!payload || !digest || !/^\d+$/.test(payload)) return false;
  const age = Date.now() - Number(payload);
  if (age < 0 || age > ACCESS_TTL_SECONDS * 1000) return false;
  const expected = signature(payload);
  if (digest.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
}

function readAccessCookie(req: { headers: { cookie?: string } }) {
  return req.headers.cookie?.split(";").map(part => part.trim()).find(part => part.startsWith(`${ACCESS_COOKIE}=`))?.slice(ACCESS_COOKIE.length + 1);
}

const accessCookieOptions = {
  httpOnly: true,
  secure: ENV.isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: ACCESS_TTL_SECONDS,
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  access: router({
    status: publicProcedure.query(({ ctx }) => ({ unlocked: hasValidAccess(readAccessCookie(ctx.req)) })),
    unlock: publicProcedure.input(z.object({ password: z.string().min(1).max(128) })).mutation(({ ctx, input }) => {
      const expected = secretKey();
      if (!expected || input.password !== expected) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور غير صحيحة" });
      }
      ctx.res.cookie(ACCESS_COOKIE, makeToken(), accessCookieOptions);
      return { unlocked: true } as const;
    }),
    lock: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ACCESS_COOKIE, { ...accessCookieOptions, maxAge: 0 });
      return { locked: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
