"use client";

import { useSchoolStats } from "@/features/platform/hooks/useSchoolStats";
import { Card, CardHead } from "@/shared/components";
import { Progress } from "@/shared/components";
import { isoToday } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Platform analytics ───────────── */
export function PlatformAnalytics() {
  const { data } = useAppStore();
  const stats = useSchoolStats();
  const t0 = isoToday();
  const rows = data.schools.map((s) => {
    const st = data.students.filter((x) => x.schoolId === s.id);
    const rec = data.attendance[t0] ?? {};
    const marked = st.filter((x) => rec[x.id]);
    const att = marked.length
      ? (marked.filter((x) => rec[x.id] === "Present").length / marked.length) * 100
      : 0;
    const ids = new Set(st.map((x) => x.id));
    const fees = data.fees.filter((f) => ids.has(f.studentId));
    const paid = fees.filter((f) => f.status === "Paid").reduce((a, f) => a + f.amount, 0),
      all = fees.reduce((a, f) => a + f.amount, 0);
    return {
      s,
      att,
      coll: all ? (paid / all) * 100 : 0,
      n: stats.get(s.id)?.students ?? 0,
      t: stats.get(s.id)?.teachers ?? 0,
    };
  });
  return (
    <Card>
      <CardHead title="School comparison" sub="Today's attendance and fee collection across the platform" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>School</th>
              <th>Students</th>
              <th>Teachers</th>
              <th>Student : teacher</th>
              <th>Attendance today</th>
              <th>Fees collected</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, att, coll, n, t }) => (
              <tr key={s.id}>
                <td>
                  <b>{s.name}</b>
                  <small className="sub-line">{s.city}</small>
                </td>
                <td>{n.toLocaleString("en-IN")}</td>
                <td>{t}</td>
                <td>{t ? (n / t).toFixed(1) : "—"} : 1</td>
                <td className="meter">
                  <Progress value={att} tone={att >= 90 ? "ok" : "lime"} />
                  <b>{att ? `${att.toFixed(0)}%` : "—"}</b>
                </td>
                <td className="meter">
                  <Progress value={coll} tone="lime" />
                  <b>{coll.toFixed(0)}%</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
