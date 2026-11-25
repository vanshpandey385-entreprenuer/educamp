/** Collections that belong to one school. The store scopes these to the signed-in school. */
/** Placeholder schoolId on new records; the store replaces it with the signed-in school. */
export const UNSTAMPED = 0;

export const SCOPED_KEYS = [
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
  "activity",
  "classes",
  "submissions",
] as const;
