import { slugOf } from "@/shared/lib/credentials";
import { Data, Teacher } from "@/shared/types/domain";

/**
 * Create a teacher with the next free staff ID and a unique login ID.
 * Classes the new teacher takes over are removed from other teachers of the same
 * subject, so each (class, subject) pair always has exactly one teacher.
 */
export function createTeacher(
  all: Pick<Data, "teachers">,
  input: { schoolId: number; name: string; dept: string; classes: string[]; homeroom?: string },
): Teacher {
  const colleagues = all.teachers.filter((t) => t.schoolId === input.schoolId);
  const takenLogins = new Set(colleagues.map((t) => t.loginId));

  const baseLogin = slugOf(input.name.replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, ""));
  let loginId = baseLogin;
  let suffix = 1;
  while (takenLogins.has(loginId)) {
    suffix += 1;
    loginId = `${baseLogin}${suffix}`;
  }

  const highestStaffNumber = colleagues.reduce(
    (highest, t) => Math.max(highest, Number(t.staffId.replace(/\D/g, "")) || 0),
    200,
  );

  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    schoolId: input.schoolId,
    name: input.name.trim(),
    staffId: `TCH${highestStaffNumber + 1}`,
    loginId,
    dept: input.dept,
    classes: input.classes,
    homeroom: input.homeroom || undefined,
  };
}
