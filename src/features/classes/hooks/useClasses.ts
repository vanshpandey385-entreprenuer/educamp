"use client";

import { useMemo } from "react";
import { CLASSES, sortClasses } from "@/config/school";
import { useAppStore } from "@/store/AppStore";

/**
 * Every class name the school has: the built-in Class 1-12 with sections A, B, C,
 * plus the classes the admin added. Sorted by grade, then section.
 *
 * Use this instead of CLASSES whenever a screen shows a list of classes.
 */
export function useClasses(): string[] {
  const { data } = useAppStore();

  return useMemo(() => {
    const names = new Set([...CLASSES, ...data.classes.map((c) => c.name)]);
    return sortClasses([...names]);
  }, [data.classes]);
}
