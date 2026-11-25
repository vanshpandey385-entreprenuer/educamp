"use client";

import { ClipboardCheck, Download, GraduationCap, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "@/features/attendance/components/DayPicker";
import { useAttendanceStats } from "@/features/attendance/hooks/useAttendanceStats";
import { exportFeesCsv } from "@/features/fees/utils/exportFees";
import { Card, CardHead } from "@/shared/components";
import { Stat } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtDate, isoToday } from "@/shared/lib/date";
import { money } from "@/shared/lib/format";
import { useAppStore } from "@/store/AppStore";

export function ReportsView() {
  const { data, notify } = useAppStore();
  const [date, setDate] = useState(isoToday());
  const att = useAttendanceStats(date);
  const collected = data.fees.filter((f) => f.status === "Paid").reduce((a, f) => a + f.amount, 0);
  const rec = data.attendance[date] ?? {},
    trec = data.teacherAtt[date] ?? {};
  const rowsOut: [string, string, () => void][] = [
    [
      "Fee collection report",
      "Student, class, amount, due date and payment status.",
      () => exportFeesCsv(data),
    ],
    [
      "Student directory",
      "Every student with class, roll number and student ID.",
      () =>
        downloadCsv("student-directory.csv", [
          ["Class", "Roll", "Student", "Student ID", "Guardian", "Contact", "Status"],
          ...data.students.map((s) => [s.cls, s.roll, s.name, s.admission, s.guardian, s.phone, s.status]),
        ]),
    ],
    [
      `Student attendance · ${fmtDate(date)}`,
      "Status of every student on the selected date.",
      () =>
        downloadCsv(`student-attendance-${date}.csv`, [
          ["Class", "Roll", "Student", "Date", "Status"],
          ...data.students.map((s) => [s.cls, s.roll, s.name, date, rec[s.id] ?? "Not marked"]),
        ]),
    ],
    [
      `Teacher attendance · ${fmtDate(date)}`,
      "Status of every teacher on the selected date.",
      () =>
        downloadCsv(`teacher-attendance-${date}.csv`, [
          ["Teacher", "Staff ID", "Subject", "Date", "Status"],
          ...data.teachers.map((t) => [t.name, t.staffId, t.dept, date, trec[t.id] ?? "Not marked"]),
        ]),
    ],
  ];
  return (
    <>
      <div className="stats">
        <Stat
          icon={Users}
          label="Student records"
          value={data.students.length.toLocaleString("en-IN")}
          detail="Current dataset"
        />
        <Stat
          icon={GraduationCap}
          label="Teachers"
          value={data.teachers.length}
          detail="On staff"
          tone="info"
        />
        <Stat
          icon={ClipboardCheck}
          label={`Attendance · ${fmtDate(date)}`}
          value={`${att.pct.toFixed(0)}%`}
          detail={`${att.marked.toLocaleString("en-IN")} students marked`}
        />
        <Stat
          icon={Wallet}
          label="Fees collected"
          value={money(collected)}
          detail="Marked paid"
          tone="warn"
        />
      </div>
      <Card>
        <CardHead
          title="Downloads"
          sub="Export school records as CSV"
          action={<DayPicker date={date} onChange={setDate} />}
        />
        {rowsOut.map(([t, d, fn]) => (
          <div key={t} className="report-row">
            <div>
              <b>{t}</b>
              <small>{d}</small>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                fn();
                notify("CSV downloaded.");
              }}
            >
              <Download size={15} /> Download CSV
            </button>
          </div>
        ))}
      </Card>
    </>
  );
}
