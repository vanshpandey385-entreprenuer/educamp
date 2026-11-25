"use client";

export type Tone = "ok" | "warn" | "bad" | "info" | "muted" | "lime";

const TONES: Record<string, Tone> = {
  Active: "ok",
  Paid: "ok",
  Present: "ok",
  Approved: "ok",
  Submitted: "ok",
  Improving: "ok",
  Sports: "ok",
  Done: "ok",
  Overdue: "bad",
  Absent: "bad",
  Rejected: "bad",
  Suspended: "bad",
  Failed: "bad",
  Pending: "warn",
  Leave: "warn",
  "On leave": "warn",
  Trial: "warn",
  Open: "warn",
  "Needs practice": "warn",
  "Revision suggested": "warn",
  Holiday: "warn",
  Inactive: "muted",
  General: "muted",
  "In progress": "info",
  PTM: "info",
  Exam: "info",
  Academic: "info",
  Event: "lime",
};

export const toneOf = (s: string): Tone => TONES[s] ?? "muted";

export function Pill({ children, tone }: { children: string; tone?: Tone }) {
  return <span className={`pill pill-${tone ?? toneOf(children)}`}>{children}</span>;
}
