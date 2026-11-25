import { n } from "@/config/navigation";
import { randomPassword, slugOf } from "@/shared/lib/credentials";
import { isoToday } from "@/shared/lib/date";
import { Data, Student } from "@/shared/types/domain";

/** Create a student with an auto-assigned roll number, admission ID, login ID and password. */
export function createStudent(
  all: Pick<Data, "students">,
  i: {
    schoolId: number;
    name: string;
    cls: string;
    guardian: string;
    phone: string;
    loginId?: string;
    password?: string;
    source: "Admission" | "Online enrolment";
  },
): Student {
  const mates = all.students.filter((s) => s.schoolId === i.schoolId);
  const taken = new Set(mates.map((s) => s.loginId.toLowerCase()));
  const base = slugOf(i.name);
  let loginId = i.loginId?.trim().toLowerCase() || base,
    n = 1;
  if (!i.loginId) while (taken.has(loginId)) loginId = `${base}${++n}`;
  const roll = String(
    mates.filter((s) => s.cls === i.cls).reduce((m, s) => Math.max(m, Number(s.roll) || 0), 0) + 1,
  );
  const adm = mates.reduce((m, s) => Math.max(m, Number(s.admission.replace(/\D/g, "")) || 0), 1000) + 1;
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    schoolId: i.schoolId,
    name: i.name.trim(),
    cls: i.cls,
    roll,
    admission: `STU${adm}`,
    loginId,
    password: i.password || randomPassword(),
    parentLoginId: `p.${loginId}`,
    parentPassword: randomPassword(),
    guardian: i.guardian.trim() || "Parent / Guardian",
    phone: i.phone || "—",
    status: "Active",
    avg: 0,
    source: i.source,
    joined: isoToday(),
  };
}
