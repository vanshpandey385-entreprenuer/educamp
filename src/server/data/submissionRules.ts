import type { Data, Session, Submission } from "@/shared/types/domain";
import { getFileStore } from "../files";

/**
 * Rules for homework submissions. These run on the SERVER, so a student cannot approve their own work
 * by sending a hand-made request.
 *
 *  - A student may add a PDF, replace it (unless it is already approved) and mark the teacher's answer as seen.
 *  - A teacher or the admin may only change the decision: status and remark.
 */

const MAX_REMARK_LENGTH = 500;

/** What a student's request is allowed to do to their own submissions. */
export async function mergeFamilySubmissions(
  all: Data,
  session: Session,
  incoming: Submission[],
): Promise<Submission[]> {
  const studentId = session.studentId;
  const schoolId = session.schoolId;
  if (studentId == null || schoolId == null) return all.submissions;

  const student = all.students.find((s) => s.id === studentId);
  const result = [...all.submissions];

  for (const row of incoming) {
    if (row.studentId !== studentId) continue; // never touch someone else's work

    const position = result.findIndex((s) => s.studentId === studentId && s.homeworkId === row.homeworkId);
    const existing = position >= 0 ? result[position] : null;

    // The same file as before: the only change allowed is "I have read the teacher's answer".
    if (existing && existing.fileId === row.fileId) {
      result[position] = { ...existing, studentSeen: existing.studentSeen || row.studentSeen === true };
      continue;
    }

    // A new file. Check the homework, the class and the file itself.
    const homework = all.homework.find((h) => h.id === row.homeworkId && h.schoolId === schoolId);
    if (!homework || homework.cls !== student?.cls) continue;
    if (existing?.status === "Approved") continue; // approved work is final

    const file = await getFileStore().findMeta(row.fileId);
    if (!file || file.studentId !== studentId || file.schoolId !== schoolId) continue;

    const fresh: Submission = {
      id: existing?.id ?? row.id,
      schoolId,
      homeworkId: homework.id,
      studentId,
      fileId: file.id,
      fileName: file.name,
      fileSize: file.size,
      submittedAt: Date.now(),
      status: "Pending review",
      studentSeen: true,
    };
    if (position >= 0) result[position] = fresh;
    else result.push(fresh);
  }
  return result;
}

/** What a teacher's (or the admin's) request is allowed to do: change the decision on existing rows. */
export function mergeStaffSubmissions(all: Data, session: Session, incoming: Submission[]): Submission[] {
  const teacher = session.role === "Teacher" ? all.teachers.find((t) => t.id === session.teacherId) : null;

  return all.submissions.map((existing) => {
    if (existing.schoolId !== session.schoolId) return existing;

    const row = incoming.find((s) => s.id === existing.id);
    if (!row) return existing;

    // A teacher may review homework they set, or homework of the class they are class teacher of.
    const homework = all.homework.find((h) => h.id === existing.homeworkId);
    if (teacher && homework && homework.by !== teacher.name && teacher.homeroom !== homework.cls)
      return existing;

    const remark = (row.remark ?? "").slice(0, MAX_REMARK_LENGTH);
    const decisionChanged = row.status !== existing.status || remark !== (existing.remark ?? "");
    const validStatus = ["Pending review", "Approved", "Not approved"].includes(row.status);
    if (!decisionChanged || !validStatus) return existing;

    return {
      ...existing,
      status: row.status,
      remark: remark || undefined,
      reviewedBy: session.name,
      reviewedAt: Date.now(),
      // The student has not seen this new decision yet, so their bell lights up.
      studentSeen: false,
    };
  });
}
