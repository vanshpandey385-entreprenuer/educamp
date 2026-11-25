"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, isoToday } from "@/shared/lib/date";

/** Date picker with previous / next day buttons. Past dates stay available as saved records. */
export function DayPicker({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const t = isoToday();
  return (
    <div className="day-pick" role="group" aria-label="Choose date">
      <button
        type="button"
        className="icon-btn"
        aria-label="Previous day"
        onClick={() => onChange(addDays(date, -1))}
      >
        <ChevronLeft size={16} />
      </button>
      <input
        type="date"
        value={date}
        max={t}
        onChange={(e) => e.target.value && onChange(e.target.value > t ? t : e.target.value)}
        aria-label="Attendance date"
      />
      <button
        type="button"
        className="icon-btn"
        aria-label="Next day"
        disabled={date >= t}
        onClick={() => onChange(addDays(date, 1))}
      >
        <ChevronRight size={16} />
      </button>
      {date !== t && (
        <button type="button" className="link-btn" onClick={() => onChange(t)}>
          Today
        </button>
      )}
    </div>
  );
}
