/**
 * School-wide constants: grades, sections, periods, subjects, fee settings.
 */

/* ───────────── Classes: 1–12, sections A / B / C ───────────── */
export const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export const SECTIONS = ["A", "B", "C"];

export const CLASSES = GRADES.flatMap((g) => SECTIONS.map((s) => `${g} ${s}`));

export const gradeOfClass = (cls: string) => Number(cls.split(" ")[0]);

/** The section letter of a class name: "6 D" gives "D". */
export const sectionOfClass = (cls: string) => cls.split(" ")[1] ?? "";

/** Letters an admin may use for a new section. A, B and C already exist for every grade. */
export const NEW_SECTION_LETTERS = "DEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * A number that stays the same for a class forever. The timetable uses it to pick subjects.
 * Built-in classes use their place in CLASSES. Added classes get a number made from their name.
 */
export function classIndex(cls: string): number {
  const builtIn = CLASSES.indexOf(cls);
  if (builtIn >= 0) return builtIn;

  let total = 0;
  for (const letter of cls) total = (total * 31 + letter.charCodeAt(0)) % 1000;
  return CLASSES.length + total;
}

/** Sorts class names by grade, then by section letter: "2 A", "2 B", "10 A". */
export function sortClasses(list: string[]): string[] {
  return [...list].sort(
    (a, b) => gradeOfClass(a) - gradeOfClass(b) || sectionOfClass(a).localeCompare(sectionOfClass(b)),
  );
}

export const MONTHS = [
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
  "March",
];

export const MONTHLY_FEE = 3500;

export const PAID_MONTHS = [0, 1, 2, 3, 4, 5, 6];

/* ───────────── Timetable, teachers and substitutions ───────────── */
export const PERIODS = ["08:00 – 08:45", "08:45 – 09:30", "09:45 – 10:30", "10:30 – 11:15", "11:30 – 12:15"];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export const SUBJECTS = [
  "English",
  "Mathematics",
  "Science",
  "Hindi",
  "Social Science",
  "Art & craft",
  "Computer lab",
];
