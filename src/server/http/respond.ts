import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "../config/env";
import { readSessionToken } from "../auth/sessionCookie";
import type { Session } from "@/shared/types/domain";

/** Sends a JSON success response. */
export function ok<T>(body: T, status = 200) {
  return NextResponse.json(body, { status });
}

/** Sends a JSON error response: { error: "message" }. */
export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Returns the signed-in session from the cookie, or null. */
export function currentSession(): Session | null {
  return readSessionToken(cookies().get(SESSION_COOKIE)?.value);
}
