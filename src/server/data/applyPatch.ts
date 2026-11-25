import type { Data, Session } from "@/shared/types/domain";
import type { Database } from "../db/types";
import { canWrite } from "./rules";
import { mergeFamilySubmissions, mergeStaffSubmissions } from "./submissionRules";

/**
 * Applying a change from the browser.
 *
 * The browser sends whole collections that it received from us (already limited to what that person may see).
 * We replace ONLY that person's slice of each collection, so other schools' rows are never touched.
 */

const hasSchoolId = [
  "students",
  "teachers",
  "leaves",
  "homework",
  "notices",
  "events",
  "exams",
  "resources",
  "books",
  "routes",
  "classes",
] as const;

export type PatchResult = { ok: true; applied: string[] } | { ok: false; error: string };

/**
 * The activity log only grows. We add rows we have not seen before and never delete,
 * and we write the real name and role of the person, so nobody can sign an entry as someone else.
 */
function addActivity(
  existing: Data["activity"],
  incoming: Data["activity"],
  session: Session,
  schoolId: number,
) {
  const known = new Set(existing.map((row) => row.id));
  const fresh = incoming
    .filter((row) => !known.has(row.id))
    .map((row) => ({ ...row, schoolId, who: session.name, role: session.role }));
  return [...fresh, ...existing].slice(0, 3000);
}

/** Replaces rows of one school inside a list. */
function replaceBySchool<T extends { schoolId?: number | null }>(
  existing: T[],
  incoming: T[],
  schoolId: number,
): T[] {
  const others = existing.filter((row) => row.schoolId !== schoolId);
  const stamped = incoming.map((row) => ({ ...row, schoolId }));
  return [...others, ...stamped];
}

/** Replaces rows whose owner id (student or teacher) belongs to the school. */
function replaceByOwner<T>(
  existing: T[],
  incoming: T[],
  ownerOf: (row: T) => number,
  ownerIds: Set<number>,
): T[] {
  const others = existing.filter((row) => !ownerIds.has(ownerOf(row)));
  const allowed = incoming.filter((row) => ownerIds.has(ownerOf(row)));
  return [...others, ...allowed];
}

/** Replaces the entries of the owners in a date map such as attendance. */
function replaceByDate<V>(
  existing: Record<string, Record<number, V>>,
  incoming: Record<string, Record<number, V>>,
  ownerIds: Set<number>,
) {
  const result: Record<string, Record<number, V>> = {};
  for (const [date, entries] of Object.entries(existing)) {
    const kept: Record<number, V> = {};
    for (const [id, value] of Object.entries(entries))
      if (!ownerIds.has(Number(id))) kept[Number(id)] = value;
    result[date] = kept;
  }
  for (const [date, entries] of Object.entries(incoming)) {
    result[date] = result[date] ?? {};
    for (const [id, value] of Object.entries(entries))
      if (ownerIds.has(Number(id))) result[date][Number(id)] = value;
  }
  return result;
}

export async function applyPatch(db: Database, session: Session, patch: Partial<Data>): Promise<PatchResult> {
  const keys = Object.keys(patch) as (keyof Data)[];

  for (const key of keys) {
    if (!canWrite(session.role, key)) return { ok: false, error: `${session.role} may not change "${key}".` };
  }

  const all = db.data;

  // Platform admin replaces the global lists.
  if (session.schoolId == null) {
    for (const key of keys) (all as unknown as Record<string, unknown>)[key] = patch[key];
    return { ok: true, applied: keys };
  }

  const schoolId = session.schoolId;
  const studentIds = new Set(all.students.filter((s) => s.schoolId === schoolId).map((s) => s.id));
  const teacherIds = new Set(all.teachers.filter((t) => t.schoolId === schoolId).map((t) => t.id));
  const isFamily = session.role === "Parent / Student";

  // New students and teachers must be allowed through before rows that refer to them.
  if (patch.students) {
    all.students = replaceBySchool(all.students, patch.students, schoolId);
    all.students.filter((s) => s.schoolId === schoolId).forEach((s) => studentIds.add(s.id));
  }
  if (patch.teachers) {
    all.teachers = replaceBySchool(all.teachers, patch.teachers, schoolId);
    all.teachers.filter((t) => t.schoolId === schoolId).forEach((t) => teacherIds.add(t.id));
  }

  for (const key of keys) {
    const value = patch[key] as never;

    if (key === "students" || key === "teachers") continue;

    // Homework files and the activity log have their own rules (see submissionRules.ts).
    if (key === "submissions") {
      all.submissions = isFamily
        ? await mergeFamilySubmissions(all, session, patch.submissions!)
        : mergeStaffSubmissions(all, session, patch.submissions!);
      continue;
    }
    if (key === "activity") {
      all.activity = addActivity(all.activity, patch.activity!, session, schoolId);
      continue;
    }

    // A family may only change rows about their own child.
    if (isFamily && session.studentId != null) {
      const own = new Set([session.studentId]);
      if (key === "fees") all.fees = replaceByOwner(all.fees, patch.fees!, (f) => f.studentId, own);
      else if (key === "messages")
        all.messages = replaceByOwner(all.messages, patch.messages!, (m) => m.studentId, own);
      else if (key === "leaves")
        all.leaves = replaceBySchoolRows(all.leaves, patch.leaves!, schoolId, session.studentId);
      else if (key === "slots")
        all.slots = replaceByOwner(all.slots, patch.slots!, (s) => s.teacherId, teacherIds);
      continue;
    }

    if ((hasSchoolId as readonly string[]).includes(key)) {
      (all as unknown as Record<string, unknown>)[key] = replaceBySchool(
        (all as never)[key],
        value,
        schoolId,
      );
    } else if (key === "fees")
      all.fees = replaceByOwner(all.fees, patch.fees!, (f) => f.studentId, studentIds);
    else if (key === "messages")
      all.messages = replaceByOwner(all.messages, patch.messages!, (m) => m.studentId, studentIds);
    else if (key === "remarks")
      all.remarks = replaceByOwner(all.remarks, patch.remarks!, (r) => r.studentId, studentIds);
    else if (key === "slots")
      all.slots = replaceByOwner(all.slots, patch.slots!, (s) => s.teacherId, teacherIds);
    else if (key === "substitutions")
      all.substitutions = replaceByOwner(
        all.substitutions,
        patch.substitutions!,
        (s) => s.absentId,
        teacherIds,
      );
    else if (key === "attendance")
      all.attendance = replaceByDate(all.attendance, patch.attendance!, studentIds);
    else if (key === "teacherAtt")
      all.teacherAtt = replaceByDate(all.teacherAtt, patch.teacherAtt!, teacherIds);
    else if (key === "marks") {
      const others = Object.entries(all.marks).filter(([id]) => !studentIds.has(Number(id)));
      const mine = Object.entries(patch.marks!).filter(([id]) => studentIds.has(Number(id)));
      all.marks = Object.fromEntries([...others, ...mine]);
    } else if (key === "schoolProfile") db.profiles[schoolId] = patch.schoolProfile!;
  }

  return { ok: true, applied: keys };
}

/** Replaces the leave requests that belong to one student, keeping everyone else's. */
function replaceBySchoolRows(
  existing: Data["leaves"],
  incoming: Data["leaves"],
  schoolId: number,
  studentId: number,
) {
  const others = existing.filter((leave) => !(leave.schoolId === schoolId && leave.studentId === studentId));
  const mine = incoming
    .filter((leave) => leave.studentId === studentId)
    .map((leave) => ({ ...leave, schoolId }));
  return [...others, ...mine];
}
