import type { Data, Role, Session } from "@/shared/types/domain";

export interface LoginInput {
  role: Role;
  schoolId: number | null;
  loginId: string;
  password: string;
}

export type LoginResult = { ok: true; session: Session } | { ok: false; error: string };

/** Finds a family account by parent login ID or student login ID. */
function findFamilyAccount(data: Data, schoolId: number, loginId: string) {
  const students = data.students.filter((s) => s.schoolId === schoolId);
  const asParent = students.find((s) => s.parentLoginId.toLowerCase() === loginId);
  if (asParent) return { student: asParent, isParent: true };
  const asStudent = students.find((s) => s.loginId.toLowerCase() === loginId);
  return asStudent ? { student: asStudent, isParent: false } : null;
}

/** "admin.greenwood" becomes "Admin Greenwood". */
function nameFromLoginId(loginId: string) {
  const words = loginId.split(/[.\s_-]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Admin";
}

/**
 * Checks a login attempt against the database.
 * Student and parent passwords are checked. Teacher, admin and platform accounts are demo accounts and only need to exist.
 */
export function checkLogin(data: Data, input: LoginInput): LoginResult {
  const loginId = input.loginId.trim().toLowerCase();
  const { role, schoolId } = input;

  if (role === "Super Admin") {
    if (loginId !== "platform.admin") return { ok: false, error: "No platform staff account with that ID." };
    return { ok: true, session: { role, schoolId: null, loginId, name: "Platform Admin" } };
  }

  const school = data.schools.find((s) => s.id === schoolId);
  if (!school) return { ok: false, error: "Choose an approved school." };
  if (school.status !== "Active") return { ok: false, error: `${school.name} is not approved yet.` };

  if (role === "Parent / Student") {
    const account = findFamilyAccount(data, school.id, loginId);
    if (!account)
      return { ok: false, error: `No parent or student account with that login ID at ${school.name}.` };
    const expected = account.isParent ? account.student.parentPassword : account.student.password;
    if (input.password !== expected)
      return { ok: false, error: "Incorrect password. Ask your school office for your login details." };
    return {
      ok: true,
      session: {
        role,
        schoolId: school.id,
        loginId,
        name: account.isParent ? account.student.guardian : account.student.name,
        studentId: account.student.id,
        isParentAccount: account.isParent,
      },
    };
  }

  if (role === "Teacher") {
    const teacher = data.teachers.find((t) => t.schoolId === school.id && t.loginId === loginId);
    if (!teacher) return { ok: false, error: `No teacher with that login ID at ${school.name}.` };
    return {
      ok: true,
      session: { role, schoolId: school.id, loginId, name: teacher.name, teacherId: teacher.id },
    };
  }

  return { ok: true, session: { role, schoolId: school.id, loginId, name: nameFromLoginId(loginId) } };
}
