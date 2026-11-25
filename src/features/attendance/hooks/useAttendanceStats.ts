"use client";

import { isoToday } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

export const useAttendanceStats = (date = isoToday()) => {
  const { data } = useAppStore();
  const rec = data.attendance[date] ?? {};
  const marked = data.students.filter((s) => rec[s.id]);
  const present = marked.filter((s) => rec[s.id] === "Present").length;
  return { pct: marked.length ? (present / marked.length) * 100 : 0, marked: marked.length, present };
};
