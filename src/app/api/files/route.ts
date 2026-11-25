import { randomUUID } from "crypto";
import { MAX_FILE_BYTES, getFileStore, looksLikePdf } from "@/server/files";
import { currentSession, fail, ok } from "@/server/http/respond";

export const dynamic = "force-dynamic";

/** Removes folders and odd characters from a file name, and keeps it short. */
function cleanFileName(raw: string): string {
  const justName = raw.split(/[\\/]/).pop() ?? "homework.pdf";
  const safe = justName.replace(/[^\w.\- ()]/g, "_").slice(0, 100);
  return safe || "homework.pdf";
}

/**
 * POST /api/files   (form data with one field called "file")
 * A student uploads a homework PDF. The answer is { file: { id, name, size } }.
 * The student then saves a submission that points to this id.
 */
export async function POST(request: Request) {
  const session = currentSession();
  if (!session) return fail("Please sign in.", 401);
  if (session.role !== "Parent / Student" || session.studentId == null || session.schoolId == null) {
    return fail("Only a student or parent can upload homework.", 403);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return fail("Choose a PDF file first.");

  if (file.size > MAX_FILE_BYTES) return fail("That file is too big. The limit is 4 MB.");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!looksLikePdf(bytes)) return fail("Only PDF files are accepted.");

  const meta = {
    id: randomUUID(),
    name: cleanFileName(file.name),
    size: bytes.length,
    mime: "application/pdf",
    schoolId: session.schoolId,
    studentId: session.studentId,
    createdAt: Date.now(),
  };
  await getFileStore().save({ meta, bytes });

  return ok({ file: { id: meta.id, name: meta.name, size: meta.size } });
}
