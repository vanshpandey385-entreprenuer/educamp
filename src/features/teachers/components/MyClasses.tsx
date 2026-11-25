"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function MyClasses({ teacherId }: { teacherId: number }) {
  const { data } = useAppStore();
  const t = data.teachers.find((x) => x.id === teacherId)!;
  const [q, setQ] = useState("");
  const [cf, setCf] = useState("All");
  const rows = useMemo(
    () =>
      data.students
        .filter(
          (s) =>
            t.classes.includes(s.cls) &&
            (cf === "All" || s.cls === cf) &&
            `${s.name} ${s.cls} ${s.loginId}`.toLowerCase().includes(q.toLowerCase()),
        )
        .sort(
          (a, b) =>
            a.cls.localeCompare(b.cls, undefined, { numeric: true }) || Number(a.roll) - Number(b.roll),
        ),
    [data.students, t, q, cf],
  );
  return (
    <Card>
      <CardHead
        title="Student records"
        sub={`Classes ${t.classes.join(", ")}`}
        action={
          <div className="row-gap">
            <SearchBox value={q} onChange={setQ} placeholder="Search name, class or login ID" />
            <select
              className="select-sm"
              value={cf}
              onChange={(e) => setCf(e.target.value)}
              aria-label="Class"
            >
              <option>All</option>
              {t.classes.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        }
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Student</th>
              <th>Student ID</th>
              <th>Class</th>
              <th>Login ID</th>
              <th>Average</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.roll}</td>
                <td>
                  <div className="who">
                    <Avatar name={s.name} />
                    <b>{s.name}</b>
                  </div>
                </td>
                <td className="mono">{s.admission}</td>
                <td>{s.cls}</td>
                <td className="mono">{s.loginId}</td>
                <td>
                  <Pill tone={s.avg >= 80 ? "ok" : s.avg ? "warn" : "muted"}>
                    {s.avg ? `${s.avg}%` : "—"}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty icon={Users} title="No students found" />}
      </div>
    </Card>
  );
}
