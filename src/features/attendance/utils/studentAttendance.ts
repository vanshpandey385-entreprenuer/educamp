import { toIso } from "@/shared/lib/date";
import { Data, Student } from "@/shared/types/domain";

/** Status for one date, read from the school's saved attendance record for that day. */
export function dayStatus(
  att: Data["attendance"],
  s: Student,
  y: number,
  m: number,
  d: number,
): "P" | "A" | "L" | "off" | "future" | "none" {
  const date = new Date(y, m, d),
    dow = date.getDay();
  if (dow === 0 || dow === 6) return "off";
  if (date > new Date()) return "future";
  const r = att[toIso(date)]?.[s.id];
  return r === "Present" ? "P" : r === "Absent" ? "A" : r === "Leave" ? "L" : "none";
}

export function attendancePct(att: Data["attendance"], s: Student) {
  const now = new Date();
  let p = 0,
    t = 0;
  for (let d = 1; d <= now.getDate(); d++) {
    const st = dayStatus(att, s, now.getFullYear(), now.getMonth(), d);
    if (st === "P" || st === "A" || st === "L") {
      t++;
      if (st === "P") p++;
    }
  }
  return t ? (p / t) * 100 : 100;
}

/** Attendance of one student across every date the school has recorded. */
export function attendanceOf(att: Record<string, Record<number, string>>, id: number) {
  let p = 0,
    t = 0;
  for (const day of Object.values(att)) {
    const v = day[id];
    if (v) {
      t++;
      if (v === "Present") p++;
    }
  }
  return { present: p, total: t, pct: t ? (p / t) * 100 : 100 };
}
