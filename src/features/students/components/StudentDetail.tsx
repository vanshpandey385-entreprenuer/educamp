"use client";

import { Copy, KeyRound } from "lucide-react";
import { classTeacherOf } from "@/features/timetable/utils/timetable";
import { Avatar } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Secret } from "@/shared/components";
import { randomPassword } from "@/shared/lib/credentials";
import { fmtLong } from "@/shared/lib/date";
import { Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function StudentDetail({ student, onClose }: { student: Student; onClose: () => void }) {
  const { data, update, notify, log } = useAppStore();
  const s = data.students.find((x) => x.id === student.id) ?? student;
  const ct = classTeacherOf(data.teachers, s.cls);
  const rows: [string, React.ReactNode][] = [
    ["Full name", s.name],
    ["Class · roll number", `Class ${s.cls} · Roll ${s.roll}`],
    [
      "Student ID (admission)",
      <span key="a" className="mono">
        {s.admission}
      </span>,
    ],
    ["Class teacher", ct?.name ?? "—"],
    ["Parent / guardian", s.guardian],
    ["Contact", s.phone],
    ["Joined", s.joined ? fmtLong(s.joined) : "—"],
    ["Enrolled via", s.source ?? "Admission"],
  ];
  const creds: [string, React.ReactNode][] = [
    [
      "Student login ID",
      <span key="l" className="mono">
        {s.loginId}
      </span>,
    ],
    ["Student password", <Secret key="p" value={s.password} />],
    [
      "Parent login ID",
      <span key="pl" className="mono">
        {s.parentLoginId}
      </span>,
    ],
    ["Parent password", <Secret key="pp" value={s.parentPassword} />],
  ];
  return (
    <Modal title={s.name} eyebrow="STUDENT PROFILE" onClose={onClose}>
      <div className="profile-hero">
        <Avatar name={s.name} size={60} />
        <div>
          <h2>{s.name}</h2>
          <p>
            Class {s.cls} · Roll {s.roll}
          </p>
          <Pill>{s.status}</Pill>
        </div>
      </div>
      <dl className="dl">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <h3 className="sub-head">
        <KeyRound size={14} /> Login details
      </h3>
      <dl className="dl">
        {creds.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="row-gap modal-actions">
        <button
          className="btn-ghost"
          onClick={() => {
            update((d) => ({
              students: d.students.map((x) =>
                x.id === s.id ? { ...x, password: randomPassword(), parentPassword: randomPassword() } : x,
              ),
            }));
            log(`Reset passwords for ${s.name}`);
            notify("New passwords generated.");
          }}
        >
          <KeyRound size={14} /> Reset passwords
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            void navigator.clipboard?.writeText(
              `Student: ${s.loginId} / ${s.password}\nParent: ${s.parentLoginId} / ${s.parentPassword}`,
            );
            notify("Login details copied.");
          }}
        >
          <Copy size={14} /> Copy
        </button>
        <button
          className="btn-ghost"
          onClick={() => {
            update((d) => ({
              students: d.students.map((x) =>
                x.id === s.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x,
              ),
            }));
            log(`${s.status === "Active" ? "Deactivated" : "Activated"} ${s.name}`);
          }}
        >
          {s.status === "Active" ? "Deactivate account" : "Activate account"}
        </button>
      </div>
    </Modal>
  );
}
