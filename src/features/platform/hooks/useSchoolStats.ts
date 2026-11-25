"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/AppStore";

/** Live counts per school, derived from the records rather than the registration form. */
export function useSchoolStats() {
  const { data } = useAppStore();
  return useMemo(() => {
    const m = new Map<number, { students: number; teachers: number }>();
    for (const s of data.schools) m.set(s.id, { students: 0, teachers: 0 });
    for (const s of data.students) {
      const x = m.get(s.schoolId);
      if (x) x.students++;
    }
    for (const t of data.teachers) {
      const x = m.get(t.schoolId);
      if (x) x.teachers++;
    }
    return m;
  }, [data.schools, data.students, data.teachers]);
}
