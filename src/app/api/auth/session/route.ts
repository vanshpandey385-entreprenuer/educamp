import { currentSession, ok } from "@/server/http/respond";

export const dynamic = "force-dynamic";

/** GET /api/auth/session  → { session } for the signed-in person, or { session: null }. */
export async function GET() {
  return ok({ session: currentSession() });
}
