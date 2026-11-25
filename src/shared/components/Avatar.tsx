"use client";

import { initials } from "@/shared/lib/format";

/** Five soft colour variants (defined in styles/components.css as .av-0 to .av-4). */
const VARIANTS = 5;

export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const variant = [...name].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % VARIANTS;
  return (
    <span className={`avatar av-${variant}`} style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials(name)}
    </span>
  );
}
