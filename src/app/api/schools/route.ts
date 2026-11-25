import { getDb } from "@/server/db";
import { publicSchools } from "@/server/data/scope";
import { ok } from "@/server/http/respond";

export const dynamic = "force-dynamic";

/** GET /api/schools  → the list of schools for the login page. Public. */
export async function GET() {
  const db = await getDb();
  return ok({ schools: publicSchools(db) });
}
