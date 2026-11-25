"use client";

import { useEffect, useState } from "react";
import { Theme, currentTheme, setTheme } from "@/shared/lib/theme";

/** Gives a component the current theme and a function to flip it. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setThemeState] = useState<Theme>("light");

  // Read the real theme after the first render (the server does not know it).
  useEffect(() => {
    setThemeState(currentTheme());
  }, []);

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return { theme, toggleTheme };
}
