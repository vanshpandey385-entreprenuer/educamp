import type { Data, Session } from "@/shared/types/domain";
import type { Database } from "../db/types";

/**
 * Decides which rows a signed-in person may see.
 *  - Platform admin: everything.
 *  - School admin / teacher: rows of their own school.
 *  - Parent / student: only their own child's rows.
 */

function inSchool<T extends { schoolId?: number | null }>(rows: T[], schoolId: number) {
  return rows.filter((row) => row.schoolId === schoolId);
}

function schoolView(all: Data, schoolId: number): Data {
  const students = inSchool(all.students, schoolId);
  const studentIds = new Set(students.map((s) => s.id));
  const teachers = inSchool(all.teachers, schoolId);
  const teacherIds = new Set(teachers.map((t) => t.id));

  return {
    ...all,
    students,
    teachers,
    fees: all.fees.filter((f) => studentIds.has(f.studentId)),
    leaves: inSchool(all.leaves, schoolId),
    homework: inSchool(all.homework, schoolId),
    classes: inSchool(all.classes, schoolId),
    submissions: inSchool(all.submissions, schoolId),
    notices: inSchool(all.notices, schoolId),
    events: inSchool(all.events, schoolId),
    exams: inSchool(all.exams, schoolId),
    resources: inSchool(all.resources, schoolId),
    books: inSchool(all.books, schoolId),
    routes: inSchool(all.routes, schoolId),
    activity: inSchool(all.activity, schoolId),
    messages: all.messages.filter((m) => studentIds.has(m.studentId)),
    remarks: all.remarks.filter((r) => studentIds.has(r.studentId)),
    slots: all.slots.filter((s) => teacherIds.has(s.teacherId)),
    substitutions: all.substitutions.filter((s) => teacherIds.has(s.absentId)),
    attendance: filterByIds(all.attendance, studentIds),
    teacherAtt: filterByIds(all.teacherAtt, teacherIds),
    marks: Object.fromEntries(Object.entries(all.marks).filter(([id]) => studentIds.has(Number(id)))),
    tickets: [],
  };
}

/** Keeps only the people in `ids` for every date. */
function filterByIds<V>(byDate: Record<string, Record<number, V>>, ids: Set<number>) {
  const result: Record<string, Record<number, V>> = {};
  for (const [date, entries] of Object.entries(byDate)) {
    const kept: Record<number, V> = {};
    for (const [id, value] of Object.entries(entries)) if (ids.has(Number(id))) kept[Number(id)] = value;
    result[date] = kept;
  }
  return result;
}

/** A parent or student sees one child, plus the teachers and school-wide notices. */
function familyView(all: Data, schoolId: number, studentId: number): Data {
  const school = schoolView(all, schoolId);
  const classOfChild = school.students.find((s) => s.id === studentId)?.cls;
  const ownRow = (ids: number[]) => ids.includes(studentId);

  return {
    ...school,
    students: school.students.filter((s) => s.id === studentId),
    fees: school.fees.filter((f) => f.studentId === studentId),
    messages: school.messages.filter((m) => m.studentId === studentId),
    remarks: school.remarks.filter((r) => r.studentId === studentId),
    leaves: school.leaves.filter((l) => l.studentId === studentId),
    homework: school.homework.filter((h) => h.cls === classOfChild),
    submissions: school.submissions.filter((s) => s.studentId === studentId),
    attendance: filterByIds(school.attendance, new Set([studentId])),
    marks: Object.fromEntries(Object.entries(school.marks).filter(([id]) => ownRow([Number(id)]))),
    activity: [],
    routes: school.routes.filter((r) => r.studentIds.includes(studentId)),
  };
}

/** The data one signed-in person is allowed to download. */
export function dataFor(db: Database, session: Session): Data {
  const profile = session.schoolId != null ? db.profiles[session.schoolId] : undefined;
  const base =
    session.schoolId == null
      ? db.data
      : session.role === "Parent / Student" && session.studentId != null
        ? familyView(db.data, session.schoolId, session.studentId)
        : schoolView(db.data, session.schoolId);
  return { ...base, schoolProfile: profile ?? db.data.schoolProfile };
}

/** The only thing the login page may see: the list of schools, with no student data. */
export function publicSchools(db: Database) {
  return db.data.schools;
}
