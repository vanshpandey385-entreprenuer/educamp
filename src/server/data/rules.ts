import type { Data, Role } from "@/shared/types/domain";

/**
 * Which collections each role may change.
 * If a role is not listed for a collection, the server rejects the change.
 * This is the one place to edit when permissions change.
 */
export const WRITABLE: Record<Role, (keyof Data)[]> = {
  "Super Admin": ["schools", "tickets", "activity"],
  Admin: [
    "students",
    "teachers",
    "fees",
    "leaves",
    "homework",
    "notices",
    "events",
    "messages",
    "exams",
    "resources",
    "slots",
    "remarks",
    "books",
    "routes",
    "activity",
    "attendance",
    "teacherAtt",
    "substitutions",
    "marks",
    "schoolProfile",
    "classes",
    "submissions",
  ],
  Teacher: [
    "leaves",
    "homework",
    "notices",
    "events",
    "messages",
    "exams",
    "resources",
    "slots",
    "remarks",
    "activity",
    "attendance",
    "marks",
    "submissions",
  ],
  // Students no longer change homework rows themselves; they add submissions instead.
  "Parent / Student": ["leaves", "messages", "slots", "fees", "activity", "submissions"],
};

export function canWrite(role: Role, key: string): boolean {
  return (WRITABLE[role] as string[]).includes(key);
}
