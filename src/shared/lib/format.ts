/* ───────────── Helpers ───────────── */
export const money = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export const initials = (name: string) =>
  name
    .replace(/^(Mr|Ms|Mrs|Dr)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
