export const gradeOf = (m: number) =>
  m >= 90 ? "A+" : m >= 80 ? "A" : m >= 70 ? "B" : m >= 60 ? "C" : m >= 40 ? "D" : "F";
