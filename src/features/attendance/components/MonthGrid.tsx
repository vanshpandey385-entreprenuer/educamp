"use client";

import { dayStatus } from "@/features/attendance/utils/studentAttendance";
import { Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function MonthGrid({ s, y, m, compact }: { s: Student; y: number; m: number; compact?: boolean }) {
  const { data } = useAppStore();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className={`cal ${compact ? "compact" : ""}`}>
      <div className="cal-labels">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <b key={d}>{compact ? d[0] : d}</b>
        ))}
      </div>
      <div className="cal-days">
        {cells.map((d, i) => {
          if (d == null) return <span key={"e" + i} />;
          const st = dayStatus(data.attendance, s, y, m, d);
          return (
            <span
              key={d}
              className={`day d-${st}`}
              title={
                st === "P"
                  ? "Present"
                  : st === "A"
                    ? "Absent"
                    : st === "L"
                      ? "Leave"
                      : st === "off"
                        ? "Weekend"
                        : st === "none"
                          ? "No record"
                          : ""
              }
            >
              <b>{d}</b>
              {!compact && (st === "P" || st === "A" || st === "L") && <small>{st}</small>}
            </span>
          );
        })}
      </div>
      <div className="legend">
        <span>
          <i className="dot ok" />P · Present
        </span>
        <span>
          <i className="dot bad" />A · Absent
        </span>
        <span>
          <i className="dot warn" />L · Leave
        </span>
      </div>
    </div>
  );
}
