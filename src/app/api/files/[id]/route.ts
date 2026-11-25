import { getDb } from "@/server/db";
import { getFileStore } from "@/server/files";
import { currentSession, fail } from "@/server/http/respond";

export const dynamic = "force-dynamic";

/** File ids are random UUIDs. Anything else is rejected before touching the store. */
const ID_PATTERN = /^[a-f0-9-]{36}$/;

/**
 * GET /api/files/<id>
 * Opens a homework PDF. Allowed for:
 *   - the student who uploaded it,
 *   - teachers and the admin of the same school.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = currentSession();
  if (!session) return fail("Please sign in.", 401);
  if (!ID_PATTERN.test(params.id)) return fail("File not found.", 404);

  const found = await getFileStore().find(params.id);
  if (!found) return fail("File not found.", 404);

  const sameSchool = session.schoolId != null && session.schoolId === found.meta.schoolId;
  const isStaff = session.role === "Teacher" || session.role === "Admin";
  const isOwner = session.role === "Parent / Student" && session.studentId === found.meta.studentId;

  // Staff may open a file only when it has been submitted to a homework.
  let allowed = isOwner;
  if (!allowed && isStaff && sameSchool) {
    const db = await getDb();
    allowed = db.data.submissions.some((s) => s.fileId === found.meta.id);
  }
  if (!allowed) return fail("You may not open this file.", 403);

  const encodedName = encodeURIComponent(found.meta.name);
  return new Response(new Uint8Array(found.bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodedName}`,
      "Content-Length": String(found.bytes.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
