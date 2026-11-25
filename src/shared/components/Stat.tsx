"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function Stat({
  icon: Icon,
  label,
  value,
  detail,
  tone = "ok",
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "ok" | "warn" | "bad" | "info";
}) {
  return (
    <section className="card stat">
      <span className={`stat-icon tone-${tone}`}>
        <Icon size={18} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <small>{detail}</small>}
      </div>
    </section>
  );
}
