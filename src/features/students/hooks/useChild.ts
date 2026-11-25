"use client";

import { useAppStore } from "@/store/AppStore";

export const useChild = (id: number) => {
  const { data } = useAppStore();
  return data.students.find((s) => s.id === id)!;
};
