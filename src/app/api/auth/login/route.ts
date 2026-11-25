import { cookies } from "next/headers";
import { checkLogin } from "@/server/auth/authService";
import { createSessionToken } from "@/server/auth/sessionCookie";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/server/config/env";
import { getDb } from "@/server/db";
import { fail, ok } from "@/server/http/respond";
import type { Role } from "@/shared/types/domain";

export const dynamic = "force-dynamic";

const ROLES: Role[] = ["Parent / Student", "Teacher", "Admin", "Super Admin"];

/** POST /api/auth/login  { role, schoolId, loginId, password } → { session } and sets the cookie. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !ROLES.includes(body.role)) return fail("Invalid request.");
  if (!String(body.loginId ?? "").trim() || !body.password) return fail("Enter your login ID and password.");

  const db = await getDb();
  const result = checkLogin(db.data, {
    role: body.role,
    schoolId: typeof body.schoolId === "number" ? body.schoolId : null,
    loginId: String(body.loginId),
    password: String(body.password),
  });
  if (!result.ok) return fail(result.error, 401);

  cookies().set(SESSION_COOKIE, createSessionToken(result.session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return ok({ session: result.session });
}
