import { resetDb } from "@/server/db";
import { currentSession, fail, ok } from "@/server/http/respond";

/** POST /api/data/reset  → puts the demo data back. Platform admin only. */
export async function POST() {
  const session = currentSession();
  if (session?.role !== "Super Admin") return fail("Only platform staff can reset demo data.", 403);
  await resetDb();
  return ok({ ok: true });
}
