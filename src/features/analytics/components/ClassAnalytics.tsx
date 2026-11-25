"use client";

import { Award, BookOpen, ClipboardCheck, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { attendanceOf } from "@/features/attendance/utils/studentAttendance";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { Stat } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Teacher: class analytics ───────────── */
export function ClassAnalytics({ teacherId }: { teacherId: number }) {
  const { data } = useAppStore();
  const t = data.teachers.find((x) => x.id === teacherId)!;
  const [cls, setCls] = useState(t.classes[0]);
  const roster = data.students.filter((s) => s.cls === cls);
  const dates = Object.keys(data.attendance)
    .filter((d) => roster.some((s) => data.attendance[d][s.id]))
    .sort()
    .slice(-8);
  const trend = dates.map((d) => {
    const m = roster.filter((s) => data.attendance[d][s.id]);
    return m.length
      ? Math.round((m.filter((s) => data.attendance[d][s.id] === "Present").length / m.length) * 100)
      : 0;
  });
  const entered = roster.filter((s) => data.marks[s.id] != null);
  const avgMarks = entered.length ? entered.reduce((a, s) => a + data.marks[s.id], 0) / entered.length : 0;
  const hw = data.homework.filter((h) => h.cls === cls);
  const hwDone =
    hw.length && roster.length
      ? (hw.reduce((a, h) => a + h.done.filter((id) => roster.some((s) => s.id === id)).length, 0) /
          (hw.length * roster.length)) *
        100
      : 0;
  const risk = roster
    .map((s) => {
      const a = attendanceOf(data.attendance, s.id);
      const why: string[] = [];
      if (a.pct < 85) why.push(`Attendance ${a.pct.toFixed(0)}%`);
      if (s.avg && s.avg < 65) why.push(`Average ${s.avg}%`);
      const pending = hw.filter((h) => !h.done.includes(s.id)).length;
      if (pending >= 2) why.push(`${pending} homework pending`);
      return { s, why };
    })
    .filter((x) => x.why.length);
  const bands = [
    ["A+ (90+)", 90, 101],
    ["A (80–89)", 80, 90],
    ["B (70–79)", 70, 80],
    ["C (60–69)", 60, 70],
    ["Below 60", 0, 60],
  ] as const;
  return (
    <>
      <div className="stats">
        <Stat icon={Users} label="Students" value={roster.length} detail={`Class ${cls}`} />
        <Stat
          icon={ClipboardCheck}
          label="Attendance (recent)"
          value={trend.length ? `${trend[trend.length - 1]}%` : "—"}
          detail={dates.length ? `Latest record · ${fmtDate(dates[dates.length - 1])}` : "No records"}
          tone="info"
        />
        <Stat
          icon={BookOpen}
          label="Homework submitted"
          value={`${Math.round(hwDone)}%`}
          detail={`${hw.length} assignments`}
          tone="warn"
        />
        <Stat
          icon={GraduationCap}
          label="Unit test average"
          value={entered.length ? avgMarks.toFixed(1) : "—"}
          detail={`${entered.length} of ${roster.length} marks entered`}
          tone="info"
        />
      </div>
      <div className="grid-2">
        <Card>
          <CardHead
            title="Attendance trend"
            sub="Last recorded school days"
            action={
              t.classes.length > 1 ? (
                <select
                  className="select-sm"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  aria-label="Class"
                >
                  {t.classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              ) : undefined
            }
          />
          {trend.length ? (
            <div className="chart" role="img" aria-label="Attendance trend">
              {trend.map((v, i) => (
                <div key={dates[i]}>
                  <b>{v}</b>
                  <span className={i === trend.length - 1 ? "hl" : ""} style={{ height: `${v}%` }} />
                  <small>{fmtDate(dates[i])}</small>
                </div>
              ))}
            </div>
          ) : (
            <Empty icon={TrendingUp} title="No attendance recorded" />
          )}
        </Card>
        <Card>
          <CardHead title="Grade distribution" sub="Unit Test 2" />
          <div className="bars">
            {bands.map(([label, lo, hi]) => {
              const n = entered.filter((s) => data.marks[s.id] >= lo && data.marks[s.id] < hi).length;
              return (
                <div key={label} className="bar-row">
                  <span>{label}</span>
                  <Progress value={entered.length ? (n / entered.length) * 100 : 0} tone="lime" />
                  <b>{n}</b>
                </div>
              );
            })}
          </div>
          {!entered.length && <p className="muted-p">Enter marks to see the distribution.</p>}
        </Card>
      </div>
      <Card>
        <CardHead
          title="Students who may need support"
          sub="Low attendance, low average or repeated pending homework"
        />
        <div className="mini-list">
          {risk.map(({ s, why }) => (
            <div key={s.id}>
              <Avatar name={s.name} size={32} />
              <div className="grow">
                <b>{s.name}</b>
                <small>
                  Roll {s.roll} · {why.join(" · ")}
                </small>
              </div>
              <Pill tone="warn">Follow up</Pill>
            </div>
          ))}
          {!risk.length && (
            <Empty
              icon={Award}
              title="Nobody flagged"
              text="No student in this class meets the support criteria."
            />
          )}
        </div>
      </Card>
    </>
  );
}
