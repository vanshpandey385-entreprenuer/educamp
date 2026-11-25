import type { Homework, Teacher } from "@/shared/types/domain";

/**
 * A teacher may review the homework they set, and the homework of the class they are class teacher of.
 * (The server checks the same rule, so this only decides which buttons to show.)
 */
export function teacherMayReview(teacher: Teacher | undefined, homework: Homework): boolean {
  if (!teacher) return false;
  return homework.by === teacher.name || teacher.homeroom === homework.cls;
}
