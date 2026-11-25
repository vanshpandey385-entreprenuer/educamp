"use client";

import { StudentRemarks } from "@/features/remarks/components/StudentRemarks";
import { ReportCardButton } from "./ReportCardButton";
import { useChild } from "@/features/students/hooks/useChild";
import { Card, CardHead } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";

export function ResultsView({ studentId }: { studentId: number }) {
  const s = useChild(studentId);
  const trend = [-20, -14, -17, -6, -10, 0].map((x) => Math.max(0, s.avg + x));
  const subs: [string, number][] = [
    ["Mathematics", s.avg - 6],
    ["Science", s.avg + 6],
    ["English", s.avg + 10],
    ["Social Science", s.avg - 9],
  ];
  return (
    <>
      <Card>
        <CardHead
          title="Academic progress"
          sub="Overall performance · Term 2"
          action={<ReportCardButton student={s} />}
        />
        <div className="prog-layout">
          <div>
            <div className="score">
              {s.avg}
              <small>/100</small>
            </div>
            <Pill tone="ok">Improving</Pill>
          </div>
          <div className="chart" role="img" aria-label="Monthly score trend">
            {trend.map((v, i) => (
              <div key={i}>
                <b>{v}</b>
                <span className={i === 5 ? "hl" : ""} style={{ height: `${v}%` }} />
                <small>{["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}</small>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="grid-2">
        <Card>
          <CardHead title="Subject performance" />
          <div className="bars">
            {subs.map(([n, v]) => (
              <div key={n} className="bar-row">
                <span>{n}</span>
                <Progress value={Math.min(100, v)} tone={v >= 75 ? "ok" : "lime"} />
                <b>{Math.min(100, v)}%</b>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Critical topics to improve" />
          <div className="mini-list">
            {[
              ["Fractions and decimals", "Mathematics · Accuracy below target", "Needs practice"],
              [
                "Electricity and circuits",
                "Science · Review core concepts and diagrams",
                "Revision suggested",
              ],
              ["Map interpretation", "Social Science · Practice map-based questions", "Needs practice"],
            ].map(([t, d, p]) => (
              <div key={t}>
                <div className="grow">
                  <b>{t}</b>
                  <small>{d}</small>
                </div>
                <Pill>{p}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <StudentRemarks studentId={studentId} />
    </>
  );
}
