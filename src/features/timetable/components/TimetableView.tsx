"use client";

import { Coffee, UserX } from "lucide-react";
import { Fragment, useState } from "react";
import { DAYS, PERIODS } from "@/config/school";
import { SubstitutionPanel } from "./SubstitutionPanel";
import { isAway, schoolDay, subjectAt, teacherFor } from "@/features/timetable/utils/timetable";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { fmtLong, isoToday, weekdayIdx } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/** Weekly timetable. Each period shows its subject and teacher; absent teachers are flagged with their substitute. */
export function TimetableView({
  classes,
  canArrange,
  teacherId,
}: {
  classes: string[];
  canArrange?: boolean;
  teacherId?: number;
}) {
  const { data } = useAppStore();
  const [cls, setCls] = useState(classes[0]);
  const [date, setDate] = useState(schoolDay());
  const di = weekdayIdx(date);
  const att = data.teacherAtt[date] ?? {};
  const nameOf = (id: number) => data.teachers.find((t) => t.id === id)?.name ?? "—";
  const away = data.teachers.filter((t) => isAway(att[t.id])).length;

  return (
    <div className="tt-layout">
      <Card>
        <CardHead
          title="Weekly timetable"
          sub={`Class ${cls} · week of ${fmtLong(date)}`}
          action={
            <div className="row-gap">
              <label className="date-pick">
                <span>Date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => e.target.value && setDate(e.target.value)}
                  aria-label="Pick a date"
                />
              </label>
              {classes.length > 1 && (
                <select
                  className="select-sm"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  aria-label="Class"
                >
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>
          }
        />
        <div className="table-wrap">
          <table className="tt">
            <thead>
              <tr>
                <th>Time</th>
                {DAYS.map((d, i) => (
                  <th key={d} className={i === di ? "today" : ""}>
                    {d}
                    {i === di && <em>{date === isoToday() ? "Today" : "Selected"}</em>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((p, pi) => (
                <Fragment key={p}>
                  {pi === 2 && (
                    <tr className="break">
                      <td colSpan={6}>
                        <Coffee size={14} /> Short break · 09:30 – 09:45
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="mono">{p}</td>
                    {DAYS.map((d, dIdx) => {
                      const subject = subjectAt(cls, dIdx, pi);
                      const t = teacherFor(data.teachers, cls, subject);
                      const isSel = dIdx === di;
                      const gone = isSel && t && isAway(att[t.id]);
                      const cover =
                        gone && t
                          ? data.substitutions.find(
                              (s) =>
                                s.date === date && s.cls === cls && s.period === pi && s.absentId === t.id,
                            )
                          : undefined;
                      const mine = teacherId != null && (t?.id === teacherId || cover?.subId === teacherId);
                      return (
                        <td key={d} className={`${isSel ? "today" : ""} ${mine ? "mine" : ""}`}>
                          <span className="subj">{subject}</span>
                          {t && <small className={`tt-teacher ${gone ? "gone" : ""}`}>{t.name}</small>}
                          {gone &&
                            (cover ? (
                              <small className="tt-cover">Cover: {nameOf(cover.subId)}</small>
                            ) : (
                              <small className="tt-cover pending">Substitute pending</small>
                            ))}
                        </td>
                      );
                    })}
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {!classes.length && <Empty icon={UserX} title="No class selected" />}
      </Card>
      {(canArrange || away > 0) && (
        <SubstitutionPanel date={date} canArrange={!!canArrange} classes={canArrange ? undefined : classes} />
      )}
    </div>
  );
}
