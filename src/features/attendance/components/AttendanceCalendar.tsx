"use client";

import { BookOpen, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { MonthGrid } from "./MonthGrid";
import { dayStatus } from "@/features/attendance/utils/studentAttendance";
import { useChild } from "@/features/students/hooks/useChild";
import { Card, CardHead } from "@/shared/components";
import { Stat } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function AttendanceCalendar({ studentId }: { studentId: number }) {
  const s = useChild(studentId);
  const { data } = useAppStore();
  const now = new Date();
  const [off, setOff] = useState(0);
  const d = new Date(now.getFullYear(), now.getMonth() - off, 1);
  let p = 0,
    a = 0,
    l = 0;
  for (let i = 1; i <= new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); i++) {
    const st = dayStatus(data.attendance, s, d.getFullYear(), d.getMonth(), i);
    if (st === "P") p++;
    if (st === "A") a++;
    if (st === "L") l++;
  }
  return (
    <>
      <div className="stats three">
        <Stat icon={CheckCircle2} label="Days present" value={p} detail="This month" />
        <Stat icon={ClipboardCheck} label="Days absent" value={a} detail="This month" tone="bad" />
        <Stat icon={BookOpen} label="Days on leave" value={l} detail="This month" tone="warn" />
      </div>
      <Card>
        <CardHead
          title="Attendance calendar"
          sub="Each date shows the daily status saved by the school. Dates with no record are left blank."
          action={
            <select
              className="select-sm"
              value={off}
              onChange={(e) => setOff(Number(e.target.value))}
              aria-label="Month"
            >
              {[0, 1, 2].map((i) => {
                const x = new Date(now.getFullYear(), now.getMonth() - i, 1);
                return (
                  <option key={i} value={i}>
                    {x.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </option>
                );
              })}
            </select>
          }
        />
        <MonthGrid s={s} y={d.getFullYear()} m={d.getMonth()} />
      </Card>
    </>
  );
}
