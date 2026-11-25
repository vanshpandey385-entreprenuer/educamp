"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { GRADES, SUBJECTS, classIndex, gradeOfClass, sectionOfClass } from "@/config/school";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { createTeacher } from "@/features/teachers/utils/teacherFactory";
import { Field } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Teachers & staff ───────────── */
/* ───────────── Add teacher form ───────────── */
export function AddTeacherForm({ onDone }: { onDone: () => void }) {
  const { data, update, notify, log, session } = useAppStore();
  const allClasses = useClasses();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [classes, setClasses] = useState<string[]>([]);
  const [homeroom, setHomeroom] = useState("");
  const [error, setError] = useState("");

  function toggleClass(cls: string) {
    setClasses((current) => (current.includes(cls) ? current.filter((c) => c !== cls) : [...current, cls]));
    if (homeroom === cls) setHomeroom("");
  }

  function selectWholeGrade(grade: number) {
    const gradeClasses = allClasses.filter((c) => gradeOfClass(c) === grade);
    const allSelected = gradeClasses.every((c) => classes.includes(c));
    setClasses((current) =>
      allSelected
        ? current.filter((c) => !gradeClasses.includes(c))
        : Array.from(new Set([...current, ...gradeClasses])),
    );
  }

  /** Two classes whose timetable slots collide cannot share one teacher. */
  function findClash(): string | null {
    const seen = new Map<number, string>();
    for (const cls of classes) {
      const slotGroup = classIndex(cls) % 7;
      const other = seen.get(slotGroup);
      if (other)
        return `Class ${other} and Class ${cls} have this subject in the same period, so one teacher cannot take both.`;
      seen.set(slotGroup, cls);
    }
    return null;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 3) return setError("Enter the teacher's full name.");
    const clash = findClash();
    if (clash) return setError(clash);

    const teacher = createTeacher(data, {
      schoolId: session?.schoolId ?? 1,
      name,
      dept: subject,
      classes,
      homeroom,
    });
    update((d) => ({
      teachers: [
        // Classes handed to the new teacher are taken off other teachers of the same subject.
        ...d.teachers.map((t) =>
          t.schoolId === teacher.schoolId && t.dept === subject
            ? { ...t, classes: t.classes.filter((c) => !classes.includes(c)) }
            : t,
        ),
        teacher,
      ],
    }));
    log(`Added teacher ${teacher.name} (${subject})`);
    notify(`${teacher.name} added. Login ID: ${teacher.loginId}`);
    onDone();
  }

  return (
    <form className="form" onSubmit={submit}>
      <Field label="Teacher full name" hint="Include Mr. or Ms. if you like, for example Ms. Kavita Rao">
        <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      </Field>

      <Field label="Subject">
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          {SUBJECTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </Field>

      <div className="field">
        <span>Classes this teacher will teach ({classes.length} selected)</span>
        <div className="class-picker">
          {GRADES.map((grade) => (
            <div key={grade} className="class-picker-row">
              <button type="button" className="link-btn" onClick={() => selectWholeGrade(grade)}>
                Class {grade}
              </button>
              {allClasses
                .filter((cls) => gradeOfClass(cls) === grade)
                .map((cls) => {
                  const section = sectionOfClass(cls);
                  const taken = data.teachers.find((t) => t.dept === subject && t.classes.includes(cls));
                  return (
                    <label
                      key={cls}
                      className={`pick ${classes.includes(cls) ? "on" : ""}`}
                      title={taken ? `Currently taught by ${taken.name}` : "No teacher yet"}
                    >
                      <input
                        type="checkbox"
                        checked={classes.includes(cls)}
                        onChange={() => toggleClass(cls)}
                      />
                      {section}
                      {taken ? " •" : ""}
                    </label>
                  );
                })}
            </div>
          ))}
        </div>
        <small>
          A dot means another teacher currently teaches {subject} in that class. Selecting it moves the class
          to the new teacher.
        </small>
      </div>

      <Field label="Class teacher of (optional)">
        <select value={homeroom} onChange={(e) => setHomeroom(e.target.value)}>
          <option value="">Not a class teacher</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              Class {c}
            </option>
          ))}
        </select>
      </Field>

      {error && (
        <div className="form-error" role="alert">
          <AlertCircle size={15} />
          {error}
        </div>
      )}
      <button className="btn-primary btn-block">Add teacher</button>
    </form>
  );
}
