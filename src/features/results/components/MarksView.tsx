"use client";

import { NotebookPen, Users } from "lucide-react";
import { useState } from "react";
import { gradeOf } from "@/features/results/utils/grades";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function MarksView({ teacherId }: { teacherId: number }) {
  const { data, update, notify } = useAppStore();
  const t = data.teachers.find((x) => x.id === teacherId)!;
  const [cls, setCls] = useState(t.classes[0]);
  const roster = data.students.filter((s) => s.cls === cls);
  const entered = roster.filter((s) => data.marks[s.id] != null);
  const avg = entered.length ? entered.reduce((a, s) => a + data.marks[s.id], 0) / entered.length : 0;
  return (
    <Card>
      <CardHead
        title={`Unit Test 2 · ${t.dept}`}
        sub="Out of 100 marks"
        action={
          <div className="row-gap">
            {t.classes.length > 1 && (
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
            )}
            <button className="btn-primary" onClick={() => notify("Marks saved for this class.")}>
              Save marks
            </button>
          </div>
        }
      />
      <div className="note ok-note">
        <NotebookPen size={15} /> {entered.length} of {roster.length} entered
        {entered.length ? ` · class average ${avg.toFixed(1)}` : ""}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll no.</th>
              <th>Marks</th>
              <th>Grade</th>
              <th className="hide-sm">Progress</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              const m = data.marks[s.id];
              return (
                <tr key={s.id}>
                  <td>
                    <div className="who">
                      <Avatar name={s.name} />
                      <b>{s.name}</b>
                    </div>
                  </td>
                  <td className="mono">{s.roll}</td>
                  <td>
                    <input
                      className="marks-input"
                      type="number"
                      min={0}
                      max={100}
                      value={m ?? ""}
                      placeholder="—"
                      aria-label={`Marks for ${s.name}`}
                      onChange={(e) => {
                        const v =
                          e.target.value === ""
                            ? undefined
                            : Math.max(0, Math.min(100, Number(e.target.value)));
                        update((d) => {
                          const mk = { ...d.marks };
                          if (v === undefined) delete mk[s.id];
                          else mk[s.id] = v;
                          return { marks: mk };
                        });
                      }}
                    />
                  </td>
                  <td>
                    {m != null ? (
                      <Pill tone={m >= 70 ? "ok" : m >= 40 ? "warn" : "bad"}>{gradeOf(m)}</Pill>
                    ) : (
                      <Pill tone="muted">Pending</Pill>
                    )}
                  </td>
                  <td className="hide-sm" style={{ minWidth: 140 }}>
                    <Progress value={m ?? 0} tone={m != null && m >= 70 ? "ok" : "lime"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!roster.length && <Empty icon={Users} title="No students in this class" />}
      </div>
    </Card>
  );
}
