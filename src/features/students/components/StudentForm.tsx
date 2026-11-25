"use client";

import { AlertCircle, CheckCircle2, Copy, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { createStudent } from "@/features/students/utils/studentFactory";
import { Field } from "@/shared/components";
import { Secret } from "@/shared/components";
import { Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Student form (modal + admission page) ───────────── */
export function StudentForm({ onDone }: { onDone: () => void }) {
  const allClasses = useClasses();
  const { data, update, notify, log, session } = useAppStore();
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<Student | null>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const loginId = String(f.get("loginId") || "")
      .trim()
      .toLowerCase();
    const pw = String(f.get("pw") || "");
    if (pw && pw.length < 8)
      return setErr("Password must be at least 8 characters, or leave it blank to generate one.");
    if (loginId && data.students.some((s) => s.loginId === loginId))
      return setErr("That login ID is already in use.");
    const s = createStudent(data, {
      schoolId: session?.schoolId ?? 1,
      name: String(f.get("name")),
      cls: String(f.get("cls")),
      guardian: String(f.get("guardian")),
      phone: String(f.get("phone") || ""),
      loginId: loginId || undefined,
      password: pw || undefined,
      source: "Admission",
    });
    update((d) => ({ students: [s, ...d.students] }));
    log(`Admitted ${s.name} to Class ${s.cls}`);
    notify(`${s.name} admitted to Class ${s.cls}, roll ${s.roll}.`);
    setErr("");
    setCreated(s);
  }

  if (created) {
    return (
      <div className="cred-done">
        <div className="note ok-note">
          <CheckCircle2 size={16} /> {created.name} has been admitted to Class {created.cls}.
        </div>
        <dl className="dl">
          <div>
            <dt>Class · roll number</dt>
            <dd>
              {created.cls} · {created.roll}
            </dd>
          </div>
          <div>
            <dt>Student ID</dt>
            <dd className="mono">{created.admission}</dd>
          </div>
          <div>
            <dt>Student login ID</dt>
            <dd className="mono">{created.loginId}</dd>
          </div>
          <div>
            <dt>Student password</dt>
            <dd>
              <Secret value={created.password} />
            </dd>
          </div>
          <div>
            <dt>Parent login ID</dt>
            <dd className="mono">{created.parentLoginId}</dd>
          </div>
          <div>
            <dt>Parent password</dt>
            <dd>
              <Secret value={created.parentPassword} />
            </dd>
          </div>
        </dl>
        <div className="row-gap">
          <button
            className="btn-ghost"
            onClick={() => {
              void navigator.clipboard?.writeText(
                `Student: ${created.loginId} / ${created.password}\nParent: ${created.parentLoginId} / ${created.parentPassword}`,
              );
              notify("Login details copied.");
            }}
          >
            <Copy size={14} /> Copy login details
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setCreated(null);
              onDone();
            }}
          >
            Admit another student
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="form">
      <Field label="Student full name">
        <input name="name" required autoFocus />
      </Field>
      <div className="form-2">
        <Field label="Class and section" hint="Roll number is assigned automatically">
          <select name="cls" defaultValue="6 B">
            {allClasses.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Contact number">
          <input name="phone" inputMode="tel" />
        </Field>
      </div>
      <Field label="Parent / guardian">
        <input name="guardian" required />
      </Field>
      <div className="form-2">
        <Field label="Student login ID" hint="Leave blank to generate from the name">
          <input name="loginId" placeholder="Auto-generated" autoCapitalize="none" />
        </Field>
        <Field label="Password" hint="Leave blank to generate one">
          <input name="pw" placeholder="Auto-generated" autoComplete="new-password" />
        </Field>
      </div>
      <div className="note">
        <ShieldAlert size={15} /> Prototype only: passwords are stored in this browser so the school can see
        them. A production system must store only hashed passwords and issue reset links instead.
      </div>
      {err && (
        <div className="form-error" role="alert">
          <AlertCircle size={15} />
          {err}
        </div>
      )}
      <button className="btn-primary btn-block">Create student account</button>
    </form>
  );
}
