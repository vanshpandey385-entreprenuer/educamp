import { getDb } from "@/server/db";
import { ok } from "@/server/http/respond";

export const dynamic = "force-dynamic";

/**
 * GET /api/demo-login  → password of the sample family, used by the "Fill demo credentials" button.
 * Remove this route before using the app with real schools.
 */
export async function GET() {
  const db = await getDb();
  const sample = db.data.students.find((s) => s.parentLoginId === "p.aarav");
  return ok({ parentPassword: sample?.parentPassword ?? "" });
}
