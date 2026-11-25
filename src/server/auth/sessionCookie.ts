import { createHmac, timingSafeEqual } from "crypto";
import { SESSION_MAX_AGE, SESSION_SECRET } from "../config/env";
import type { Session } from "@/shared/types/domain";

/**
 * Cookie format:  <base64url(json)>.<signature>
 * The signature means nobody can edit the cookie to pretend to be someone else.
 */

function sign(payload: string): string {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
}

export function createSessionToken(session: Session): string {
  const body = Buffer.from(JSON.stringify({ session, exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString(
    "base64url",
  );
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      session: Session;
      exp: number;
    };
    if (parsed.exp < Date.now()) return null;
    return parsed.session;
  } catch {
    return null;
  }
}
