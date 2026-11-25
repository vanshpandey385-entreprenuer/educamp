import { applyPatch } from "@/server/data/applyPatch";
import { dataFor } from "@/server/data/scope";
import { getDb, saveDb } from "@/server/db";
import { currentSession, fail, ok } from "@/server/http/respond";
import type { Data } from "@/shared/types/domain";

export const dynamic = "force-dynamic";

/** GET /api/data  → everything the signed-in person may see. */
export async function GET() {
  const session = currentSession();
  if (!session) return fail("Please sign in.", 401);
  const db = await getDb();
  return ok({ data: dataFor(db, session) });
}

/** PATCH /api/data  { patch: { fees: [...] } }  → saves the changed collections. */
export async function PATCH(request: Request) {
  const session = currentSession();
  if (!session) return fail("Please sign in.", 401);

  const body = (await request.json().catch(() => null)) as { patch?: Partial<Data> } | null;
  if (!body?.patch || typeof body.patch !== "object") return fail("Missing patch.");

  const db = await getDb();
  const result = await applyPatch(db, session, body.patch);
  if (!result.ok) return fail(result.error, 403);

  await saveDb();
  return ok({ applied: result.applied });
}
