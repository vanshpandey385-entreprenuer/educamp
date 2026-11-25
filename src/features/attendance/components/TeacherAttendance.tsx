"use client";

import { CalendarDays, Download, Users } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "./DayPicker";
import { SubstitutionPanel } from "@/features/timetable/components/SubstitutionPanel";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtDate, fmtLong, isoToday } from "@/shared/lib/date";
import { TeacherAtt } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function TeacherAttendance() {
  const { data, update, notify, log } = useAppStore();
  const [date, setDate] = useState(isoToday());
  const [q, setQ] = useState("");
  const att = data.teacherAtt[date] ?? {};
  const set = (ids: number[], v: TeacherAtt) =>
    update((d) => ({
      teacherAtt: {
        ...d.teacherAtt,
        [date]: { ...(d.teacherAtt[date] ?? {}), ...Object.fromEntries(ids.map((id) => [id, v])) },
      },
    }));
  const rows = data.teachers.filter((t) => `${t.name} ${t.dept}`.toLowerCase().includes(q.toLowerCase()));
  const c = (v: TeacherAtt) => data.teachers.filter((t) => att[t.id] === v).length;
  const recorded = Object.keys(data.teacherAtt)
    .filter((d) => Object.keys(data.teacherAtt[d]).length)
    .sort()
    .reverse();
  return (
    <div className="grid-side">
      <Card>
        <CardHead
          title="Teacher & staff attendance"
          sub="Pick any date to view or correct its record"
          action={
            <div className="row-gap">
              <DayPicker date={date} onChange={setDate} />
              <button
                className="btn-ghost"
                onClick={() =>
                  downloadCsv(`teacher-attendance-${date}.csv`, [
                    ["Teacher", "Staff ID", "Subject", "Date", "Status"],
                    ...data.teachers.map((t) => [t.name, t.staffId, t.dept, date, att[t.id] ?? "Not marked"]),
                  ])
                }
              >
                <Download size={15} /> Export
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  set(
                    data.teachers.map((t) => t.id),
                    "Present",
                  );
                  log(`Marked all teachers present for ${date}`);
                  notify("All teachers marked present.");
                }}
              >
                Mark all present
              </button>
            </div>
          }
        />
        {date !== isoToday() && (
          <div className="note">
            <CalendarDays size={15} /> Viewing the saved record for {fmtLong(date)}. Corrections are logged.
          </div>
        )}
        <div className="reg-summary">
          <span>
            <Users size={14} /> {data.teachers.length} teachers
          </span>
          <b className="c-ok">{c("Present")} present</b>
          <b className="c-bad">{c("Absent")} absent</b>
          <b className="c-warn">{c("On leave")} on leave</b>
          <span>
            {data.teachers.length -
              Object.keys(att).filter((k) => data.teachers.some((t) => t.id === Number(k))).length}{" "}
            not marked
          </span>
        </div>
        <div className="filters">
          <SearchBox value={q} onChange={setQ} placeholder="Search teacher or subject" />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="who">
                      <Avatar name={t.name} />
                      <div>
                        <b>{t.name}</b>
                        <small className="mono">{t.staffId}</small>
                      </div>
                    </div>
                  </td>
                  <td>{t.dept}</td>
                  <td>
                    <div className="att-seg wide">
                      {(["Present", "Absent", "On leave"] as TeacherAtt[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={att[t.id] === v}
                          className={`${att[t.id] === v ? "on" : ""} t-${v === "Present" ? "P" : v === "Absent" ? "A" : "L"}`}
                          onClick={() => set([t.id], v)}
                        >
                          {v}
                        </button>
                      ))}
                      {!att[t.id] && <Pill tone="muted">Pending</Pill>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted-p">
          Records saved for {recorded.length} days
          {recorded.length
            ? ` · latest ${fmtDate(recorded[0])}, earliest ${fmtDate(recorded[recorded.length - 1])}`
            : ""}
          .
        </p>
      </Card>
      <SubstitutionPanel date={date} canArrange />
    </div>
  );
}
