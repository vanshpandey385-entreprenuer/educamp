"use client";

import { ClipboardCheck, Download, GraduationCap, TrendingUp, UserX } from "lucide-react";
import { useMemo } from "react";
import { GRADES, gradeOfClass } from "@/config/school";
import { attendanceOf } from "@/features/attendance/utils/studentAttendance";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { Stat } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtDate } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Admin: school analytics ───────────── */
export function SchoolAnalytics() {
  const { data } = useAppStore();
  const dates = Object.keys(data.attendance).sort().slice(-10);
  const trend = useMemo(
    () =>
      dates.map((d) => {
        const m = data.students.filter((s) => data.attendance[d][s.id]);
        return m.length
          ? Math.round((m.filter((s) => data.attendance[d][s.id] === "Present").length / m.length) * 100)
          : 0;
      }),
    [data.students, data.attendance],
  ); // eslint-disable-line react-hooks/exhaustive-deps
  const low = useMemo(
    () =>
      data.students
        .map((s) => ({ s, a: attendanceOf(data.attendance, s.id) }))
        .filter((x) => x.a.total >= 5 && x.a.pct < 85)
        .sort((a, b) => a.a.pct - b.a.pct),
    [data.students, data.attendance],
  );
  const gradeAvg = GRADES.map((g) => {
    const l = data.students.filter((s) => gradeOfClass(s.cls) === g && s.avg);
    return { g, v: l.length ? l.reduce((a, s) => a + s.avg, 0) / l.length : 0 };
  });
  const fee = (st: string) => data.fees.filter((f) => f.status === st).length;
  const feeTotal = data.fees.length || 1;
  return (
    <>
      <div className="stats">
        <Stat
          icon={ClipboardCheck}
          label="Attendance (latest day)"
          value={trend.length ? `${trend[trend.length - 1]}%` : "—"}
          detail={dates.length ? fmtDate(dates[dates.length - 1]) : ""}
        />
        <Stat
          icon={UserX}
          label="Low attendance"
          value={low.length}
          detail="Students below 85%"
          tone={low.length ? "bad" : "ok"}
        />
        <Stat
          icon={GraduationCap}
          label="School average"
          value={`${Math.round(data.students.reduce((a, s) => a + s.avg, 0) / Math.max(1, data.students.filter((s) => s.avg).length))}%`}
          detail="Latest assessment"
          tone="info"
        />
        <Stat
          icon={TrendingUp}
          label="Fees collected"
          value={`${Math.round((fee("Paid") / feeTotal) * 100)}%`}
          detail={`${fee("Overdue")} overdue accounts`}
          tone="warn"
        />
      </div>
      <div className="grid-2">
        <Card>
          <CardHead title="Attendance trend" sub="Last 10 recorded days" />
          <div className="chart" role="img" aria-label="School attendance trend">
            {trend.map((v, i) => (
              <div key={dates[i]}>
                <b>{v}</b>
                <span className={i === trend.length - 1 ? "hl" : ""} style={{ height: `${v}%` }} />
                <small>{fmtDate(dates[i])}</small>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Average score by class" sub="Latest assessment" />
          <div className="bars">
            {gradeAvg.map(({ g, v }) => (
              <div key={g} className="bar-row">
                <span>Class {g}</span>
                <Progress value={v} tone={v >= 75 ? "ok" : "lime"} />
                <b>{v ? `${Math.round(v)}%` : "—"}</b>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardHead
          title="Students with low attendance"
          sub="Below 85% across recorded days"
          action={
            <button
              className="btn-ghost"
              onClick={() =>
                downloadCsv("low-attendance.csv", [
                  ["Class", "Roll", "Student", "Guardian", "Contact", "Attendance %"],
                  ...low.map(({ s, a }) => [s.cls, s.roll, s.name, s.guardian, s.phone, a.pct.toFixed(1)]),
                ])
              }
            >
              <Download size={15} /> Export
            </button>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Present / recorded</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {low.slice(0, 15).map(({ s, a }) => (
                <tr key={s.id}>
                  <td>
                    <div className="who">
                      <Avatar name={s.name} />
                      <div>
                        <b>{s.name}</b>
                        <small>
                          {s.guardian} · {s.phone}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>{s.cls}</td>
                  <td>
                    {a.present} / {a.total}
                  </td>
                  <td>
                    <Pill tone="bad">{`${a.pct.toFixed(0)}%`}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!low.length && <Empty icon={ClipboardCheck} title="No one below 85%" />}
        </div>
      </Card>
    </>
  );
}
