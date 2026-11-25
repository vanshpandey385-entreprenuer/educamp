"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCheck,
  ChevronLeft,
  Download,
  GraduationCap,
  Users,
} from "lucide-react";
import { useState } from "react";
import { GRADES, gradeOfClass } from "@/config/school";
import { DayPicker } from "./DayPicker";
import { classTeacherOf } from "@/features/timetable/utils/timetable";
import { Avatar } from "@/shared/components";
import { Card } from "@/shared/components";
import { Empty } from "@/shared/components";
import { LinkBtn } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtLong, isoToday } from "@/shared/lib/date";
import { AttStatus, Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Attendance register (admin / teacher) ───────────── */
const STATES: { s: AttStatus; k: string }[] = [
  { s: "Present", k: "P" },
  { s: "Absent", k: "A" },
  { s: "Leave", k: "L" },
];

export function Register({ classes }: { classes: string[] }) {
  const { data, update, notify, log } = useAppStore();
  const [date, setDate] = useState(isoToday());
  const grades = GRADES.filter((g) => classes.some((c) => gradeOfClass(c) === g));
  const [grade, setGrade] = useState(grades[0] ?? 1);
  const [sel, setSel] = useState<string | null>(null);
  const [profile, setProfile] = useState<Student | null>(null);
  const att = data.attendance[date] ?? {};
  const isPast = date !== isoToday();
  const setMany = (ids: number[], s: AttStatus) =>
    update((d) => ({
      attendance: {
        ...d.attendance,
        [date]: { ...(d.attendance[date] ?? {}), ...Object.fromEntries(ids.map((id) => [id, s])) },
      },
    }));
  const mark = (id: number, s: AttStatus) => setMany([id], s);

  const pastNote = isPast && (
    <div className="note">
      <CalendarClock size={15} /> Viewing the saved record for {fmtLong(date)}. Any correction is saved
      against this date and logged.
    </div>
  );

  if (!sel) {
    const shown = classes.filter((c) => (grades.length > 1 ? gradeOfClass(c) === grade : true));
    const scope = data.students.filter((s) => classes.includes(s.cls));
    const marked = scope.filter((s) => att[s.id]);
    const present = marked.filter((s) => att[s.id] === "Present").length;
    return (
      <>
        <div className="intro">
          <div>
            <h2>Class-wise attendance</h2>
            <p>
              Select a class to open its register.{" "}
              {marked.length
                ? `${marked.length} of ${scope.length} students marked · ${Math.round((present / marked.length) * 100)}% present.`
                : "No attendance recorded for this date yet."}
            </p>
          </div>
          <DayPicker date={date} onChange={setDate} />
        </div>
        {pastNote}
        {grades.length > 1 && (
          <div className="tabs grade-tabs" role="tablist" aria-label="Grade">
            {grades.map((g) => (
              <button
                key={g}
                role="tab"
                aria-selected={grade === g}
                className={grade === g ? "on" : ""}
                onClick={() => setGrade(g)}
              >
                Class {g}
              </button>
            ))}
          </div>
        )}
        <div className="class-grid">
          {shown.map((c) => {
            const list = data.students.filter((s) => s.cls === c);
            const cnt = (st: AttStatus) => list.filter((s) => att[s.id] === st).length;
            const done = list.filter((s) => att[s.id]).length;
            const ct = classTeacherOf(data.teachers, c);
            return (
              <button key={c} className="class-card" onClick={() => setSel(c)}>
                <div className="between">
                  <span className="class-ico">
                    <GraduationCap size={18} />
                  </span>
                  <span className="link-btn">Open register →</span>
                </div>
                <h3>Class {c}</h3>
                <p>Class teacher · {ct?.name ?? "—"}</p>
                <Progress value={list.length ? (done / list.length) * 100 : 0} tone="lime" />
                <div className="class-counts">
                  <span>{list.length} students</span>
                  <b className="c-ok">{cnt("Present")} P</b>
                  <b className="c-bad">{cnt("Absent")} A</b>
                  <b className="c-warn">{cnt("Leave")} L</b>
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  }

  const roster = data.students.filter((s) => s.cls === sel).sort((a, b) => Number(a.roll) - Number(b.roll));
  const ct = classTeacherOf(data.teachers, sel);
  const ctAway =
    ct && (data.teacherAtt[date]?.[ct.id] === "Absent" || data.teacherAtt[date]?.[ct.id] === "On leave");
  const cover = ct
    ? data.substitutions.find((x) => x.date === date && x.cls === sel && x.absentId === ct.id)
    : undefined;
  const coverName = cover ? data.teachers.find((t) => t.id === cover.subId)?.name : undefined;
  const count = (st: AttStatus) => roster.filter((s) => att[s.id] === st).length;
  return (
    <Card>
      <div className="card-head">
        <div>
          <button
            className="link-btn back"
            onClick={() => {
              setSel(null);
              setProfile(null);
            }}
          >
            <ChevronLeft size={14} /> All classes
          </button>
          <h2 className="mt">Class {sel} · Attendance register</h2>
          <p>
            {ct?.name ?? "No class teacher"} · {fmtLong(date)}
          </p>
        </div>
        <div className="row-gap">
          <DayPicker date={date} onChange={setDate} />
          <button
            className="btn-ghost"
            onClick={() =>
              downloadCsv(`attendance-${sel.replace(" ", "")}-${date}.csv`, [
                ["Roll", "Student", "Date", "Status"],
                ...roster.map((s) => [s.roll, s.name, date, att[s.id] ?? "Not marked"]),
              ])
            }
          >
            <Download size={15} /> Export
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setMany(
                roster.map((s) => s.id),
                "Present",
              );
              log(`Marked Class ${sel} present for ${date}`);
              notify(`Class ${sel} marked present.`);
            }}
          >
            <CheckCheck size={15} /> Mark all present
          </button>
        </div>
      </div>
      {pastNote}
      <div className="reg-summary">
        <span>
          <Users size={14} /> {roster.length} students
        </span>
        <b className="c-ok">{count("Present")} present</b>
        <b className="c-bad">{count("Absent")} absent</b>
        <b className="c-warn">{count("Leave")} on leave</b>
        <span>{roster.length - roster.filter((s) => att[s.id]).length} not marked</span>
      </div>
      {ctAway && ct && (
        <div className="note warn">
          <AlertCircle size={16} /> {ct.name} (class teacher) is{" "}
          {data.teacherAtt[date]?.[ct.id] === "Absent" ? "absent" : "on leave"} on this date.{" "}
          {coverName
            ? `${coverName} is covering the first period and can mark attendance.`
            : "No substitute has been arranged yet. Ask the School Admin to arrange cover from Teacher attendance."}
        </div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Roll</th>
              <th>Student</th>
              <th>Attendance</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.roll}</td>
                <td>
                  <div className="who">
                    <Avatar name={s.name} />
                    <b>{s.name}</b>
                  </div>
                </td>
                <td>
                  <div className="att-seg" role="radiogroup" aria-label={`Attendance for ${s.name}`}>
                    {STATES.map(({ s: st, k }) => (
                      <button
                        key={st}
                        type="button"
                        role="radio"
                        aria-checked={att[s.id] === st}
                        className={`${att[s.id] === st ? "on" : ""} a-${k}`}
                        onClick={() => mark(s.id, st)}
                        title={st}
                      >
                        {k}
                      </button>
                    ))}
                    {!att[s.id] && <Pill tone="muted">Pending</Pill>}
                  </div>
                </td>
                <td>
                  <LinkBtn onClick={() => setProfile(s)}>View profile</LinkBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!roster.length && (
          <Empty
            icon={Users}
            title="No students in this class yet"
            text="Admit students from the Student admission page."
          />
        )}
      </div>

      {profile && (
        <div className="profile-panel">
          <div className="between">
            <div>
              <p className="eyebrow">STUDENT PROFILE</p>
              <h3>{profile.name}</h3>
            </div>
            <button className="icon-btn" onClick={() => setProfile(null)} aria-label="Close profile">
              ✕
            </button>
          </div>
          <div className="kv-grid">
            <span>
              Class<b>{profile.cls}</b>
            </span>
            <span>
              Roll number<b>{profile.roll}</b>
            </span>
            <span>
              Admission ID<b>{profile.admission}</b>
            </span>
            <span>
              Parent / Guardian<b>{profile.guardian}</b>
            </span>
            <span>
              Contact<b>{profile.phone}</b>
            </span>
            <span>
              Account status<b>{profile.status}</b>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
