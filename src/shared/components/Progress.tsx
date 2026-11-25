"use client";

export function Progress({ value, tone = "ok" }: { value: number; tone?: "ok" | "warn" | "bad" | "lime" }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className={`bar-${tone}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
