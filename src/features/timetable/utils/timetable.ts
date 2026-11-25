/**
 * Timetable rules: which subject and teacher teach a class in a period, and who can cover.
 */

import { n } from "@/config/navigation";
import { PERIODS, SUBJECTS, classIndex } from "@/config/school";
import { addDays, isoToday, weekdayIdx } from "@/shared/lib/date";
import { Data, Teacher, TeacherAtt } from "@/shared/types/domain";

export const subjectAt = (cls: string, day: number, period: number) =>
  SUBJECTS[(day * 2 + period * 3 + classIndex(cls) + 1) % SUBJECTS.length];

export const teacherFor = (teachers: Teacher[], cls: string, subject: string) =>
  teachers.find((t) => t.dept === subject && t.classes.includes(cls));

export const classTeacherOf = (teachers: Teacher[], cls: string) => teachers.find((t) => t.homeroom === cls);

/** Every (class, period) a teacher is timetabled to teach on a weekday (0 = Mon). */
export function slotsOf(t: Teacher, dayIdx: number): { cls: string; period: number }[] {
  if (dayIdx < 0 || dayIdx > 4) return [];
  const out: { cls: string; period: number }[] = [];
  for (let p = 0; p < PERIODS.length; p++)
    for (const c of t.classes) if (subjectAt(c, dayIdx, p) === t.dept) out.push({ cls: c, period: p });
  return out;
}

export const isAway = (att?: TeacherAtt) => att === "Absent" || att === "On leave";

/** Teachers who are present and free in a period, so they can cover a class. */
export function freeSubstitutes(
  d: Pick<Data, "teachers" | "teacherAtt" | "substitutions">,
  date: string,
  period: number,
  absent: Teacher,
): Teacher[] {
  const di = weekdayIdx(date);
  const att = d.teacherAtt[date] ?? {};
  return d.teachers
    .filter((t) => t.id !== absent.id && !isAway(att[t.id]))
    .filter((t) => !t.classes.some((c) => subjectAt(c, di, period) === t.dept))
    .filter((t) => !d.substitutions.some((s) => s.date === date && s.period === period && s.subId === t.id))
    .sort(
      (a, b) =>
        Number(b.dept === absent.dept) - Number(a.dept === absent.dept) || a.name.localeCompare(b.name),
    );
}

/** Lessons on `date` that have no cover because the teacher is away. */
export function uncoveredLessons(d: Pick<Data, "teachers" | "teacherAtt" | "substitutions">, date: string) {
  const di = weekdayIdx(date);
  const att = d.teacherAtt[date] ?? {};
  let n = 0;
  for (const t of d.teachers)
    if (isAway(att[t.id]))
      for (const sl of slotsOf(t, di))
        if (
          !d.substitutions.some(
            (s) => s.date === date && s.cls === sl.cls && s.period === sl.period && s.absentId === t.id,
          )
        )
          n++;
  return n;
}

/** Today on a school day; on a weekend, the Friday just gone, so the timetable opens on real lessons. */
export const schoolDay = () => {
  let d = isoToday();
  while (weekdayIdx(d) > 4) d = addDays(d, -1);
  return d;
};
