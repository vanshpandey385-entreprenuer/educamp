"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/shared/hooks/useTheme";

/** Round button that switches between light and dark mode. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const goingDark = theme === "light";

  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggleTheme}
      aria-label={goingDark ? "Switch to dark mode" : "Switch to light mode"}
      title={goingDark ? "Dark mode" : "Light mode"}
    >
      {goingDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
