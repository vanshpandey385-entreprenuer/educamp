"use client";

import { LucideIcon } from "lucide-react";
import { fmtLong, isoToday } from "@/shared/lib/date";

export interface BannerAction {
  /** The page id to open, for example "attendance". */
  id: string;
  label: string;
  icon: LucideIcon;
}

/**
 * The big teal card at the top of every dashboard.
 * Each role passes its own greeting, summary line and quick action buttons.
 */
export function DashboardBanner({
  title,
  summary,
  actions,
  go,
}: {
  title: string;
  summary: string;
  actions: BannerAction[];
  go: (id: string) => void;
}) {
  return (
    <section className="welcome">
      <div className="welcome-text">
        <p className="welcome-date">{fmtLong(isoToday())}</p>
        <h2>{title}</h2>
        <p className="welcome-summary">{summary}</p>
      </div>

      <div className="welcome-actions" aria-label="Quick actions">
        {actions.map((action) => (
          <button key={action.id + action.label} type="button" onClick={() => go(action.id)}>
            <action.icon size={16} />
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}
