"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "efficht_sidebar_collapsed";

/** Remembers whether the desktop sidebar is shrunk to icons only. */
export function useSidebarCollapsed(): { collapsed: boolean; toggleCollapsed: () => void } {
  const [collapsed, setCollapsed] = useState(false);

  // Read the saved choice after the first render.
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage not available: keep the default.
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // Private mode: it still works for this visit.
    }
  }

  return { collapsed, toggleCollapsed };
}
