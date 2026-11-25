"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { attendanceOf } from "@/features/attendance/utils/studentAttendance";
import { gradeOf } from "@/features/results/utils/grades";
import { Modal } from "@/shared/components";
import { todayLabel } from "@/shared/lib/date";
import { Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function ReportCardButton({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const { data } = useAppStore();
  const school = data.schools.find((x) => x.id === student.schoolId);
  const a = attendanceOf(data.attendance, student.id);
  const subs: [string, number][] = [
    ["Mathematics", student.avg - 6],
    ["Science", student.avg + 6],
    ["English", student.avg + 10],
    ["Hindi", student.avg + 2],
    ["Social Science", student.avg - 9],
  ].map(([n, v]) => [n as string, Math.max(0, Math.min(100, v as number))]);
  const ct = data.teachers.find((t) => t.homeroom === student.cls);
  return (
    <>
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        <Printer size={15} /> Report card
      </button>
      {open && (
        <Modal title="Report card" eyebrow="TERM 2 · 2026–27" onClose={() => setOpen(false)}>
          <div className="print-area report">
            <header>
              <b>{school?.name}</b>
              <small>Progress report · Term 2 · 2026–27</small>
            </header>
            <dl className="kv-grid">
              <span>
                Student<b>{student.name}</b>
              </span>
              <span>
                Class · roll
                <b>
                  {student.cls} · {student.roll}
                </b>
              </span>
              <span>
                Student ID<b>{student.admission}</b>
              </span>
              <span>
                Class teacher<b>{ct?.name ?? "—"}</b>
              </span>
              <span>
                Attendance
                <b>
                  {a.pct.toFixed(1)}% ({a.present}/{a.total} days)
                </b>
              </span>
              <span>
                Overall
                <b>
                  {student.avg}% · {gradeOf(student.avg)}
                </b>
              </span>
            </dl>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(([n, v]) => (
                  <tr key={n}>
                    <td>{n}</td>
                    <td>{v}/100</td>
                    <td>{gradeOf(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <footer>
              Generated {todayLabel()} · sample data for demonstration. Official marks are issued by the
              school.
            </footer>
          </div>
          <button className="btn-primary btn-block" onClick={() => window.print()}>
            <Printer size={15} /> Print or save as PDF
          </button>
        </Modal>
      )}
    </>
  );
}
