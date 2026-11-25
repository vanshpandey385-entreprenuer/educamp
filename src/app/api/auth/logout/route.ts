import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/server/config/env";
import { ok } from "@/server/http/respond";

/** POST /api/auth/logout  → clears the cookie. */
export async function POST() {
  cookies().delete(SESSION_COOKIE);
  return ok({ ok: true });
}
