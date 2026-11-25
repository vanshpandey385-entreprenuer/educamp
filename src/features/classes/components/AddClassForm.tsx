"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { GRADES, NEW_SECTION_LETTERS, SUBJECTS, classIndex } from "@/config/school";
import { Field } from "@/shared/components";
import { UNSTAMPED } from "@/shared/lib/records";
import type { ClassInfo, Teacher } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";
import { useClasses } from "../hooks/useClasses";

/**
 * Form to add a new class, for example "6 D".
 * The admin picks the grade and section letter, and may choose a teacher for each subject.
 */
export function AddClassForm({ onDone }: { onDone: () => void }) {
  const { data, update, log, notify } = useAppStore();
  const allClasses = useClasses();

  const [grade, setGrade] = useState(6);
  const [chosenSection, setChosenSection] = useState("D");
  // For each subject: a teacher id as text, "" for "no teacher yet". Missing = use the suggested teacher.
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [classTeacherId, setClassTeacherId] = useState("");
  const [error, setError] = useState("");

  // Only section letters that this grade does not have yet.
  const freeLetters = NEW_SECTION_LETTERS.filter((letter) => !allClasses.includes(`${grade} ${letter}`));
  const section = freeLetters.includes(chosenSection) ? chosenSection : (freeLetters[0] ?? "");
  const className = `${grade} ${section}`;

  /**
   * A teacher cannot teach two classes that have the same subject in the same period.
   * Classes share a period pattern when their numbers have the same remainder after dividing by 7.
   */
  function isFree(teacher: Teacher): boolean {
    const pattern = classIndex(className) % 7;
    return !teacher.classes.some((c) => classIndex(c) % 7 === pattern);
  }

  /** Teachers of a subject who can take this class, those with the fewest classes first. */
  function eligibleTeachers(subject: string): Teacher[] {
    return data.teachers
      .filter((t) => t.dept === subject && isFree(t))
      .sort((a, b) => a.classes.length - b.classes.length);
  }

  /** The teacher shown in the dropdown: the admin's choice, or the first suggestion. */
  function selectedTeacherId(subject: string): string {
    if (picks[subject] !== undefined) return picks[subject];
    const suggestion = eligibleTeachers(subject)[0];
    return suggestion ? String(suggestion.id) : "";
  }

  const pickedTeachers = SUBJECTS.map((s) => data.teachers.find((t) => String(t.id) === selectedTeacherId(s)))
    .filter((t): t is Teacher => Boolean(t))
    .filter((t) => !t.homeroom);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!section) return setError(`Class ${grade} already has every section letter.`);

    const newClass: ClassInfo = {
      id: Date.now(),
      schoolId: UNSTAMPED,
      name: className,
      grade,
      section,
      createdAt: Date.now(),
    };
    const teacherIds = new Set(
      SUBJECTS.map((s) => selectedTeacherId(s))
        .filter(Boolean)
        .map(Number),
    );
    const homeroomTeacher = Number(classTeacherId);

    update((d) => ({
      classes: [...d.classes, newClass],
      teachers: d.teachers.map((t) =>
        teacherIds.has(t.id)
          ? {
              ...t,
              classes: [...t.classes, className],
              homeroom: t.id === homeroomTeacher ? className : t.homeroom,
            }
          : t,
      ),
    }));
    log(`Added class ${className}`);
    notify(`Class ${className} added.`);
    onDone();
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="form-2">
        <Field label="Class (grade)">
          <select value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="New section letter" hint="A, B and C already exist for every class">
          <select value={section} onChange={(e) => setChosenSection(e.target.value)}>
            {freeLetters.map((letter) => (
              <option key={letter}>{letter}</option>
            ))}
          </select>
        </Field>
      </div>

      <p className="note">
        You are adding <b>Class {className}</b>. Students can be admitted to it, and it appears in attendance,
        timetable, homework and exams.
      </p>

      <div className="field">
        <span>Teachers for each subject (optional)</span>
        <div className="subject-teachers">
          {SUBJECTS.map((subject) => {
            const options = eligibleTeachers(subject);
            return (
              <label key={subject} className="subject-teacher-row">
                <span>{subject}</span>
                <select
                  className="select-sm"
                  value={selectedTeacherId(subject)}
                  onChange={(e) => setPicks({ ...picks, [subject]: e.target.value })}
                >
                  <option value="">{options.length ? "No teacher yet" : "No free teacher"}</option>
                  {options.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.classes.length} classes)
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
        <small>Only teachers who are free in this class's periods are listed.</small>
      </div>

      <Field label="Class teacher (optional)">
        <select value={classTeacherId} onChange={(e) => setClassTeacherId(e.target.value)}>
          <option value="">No class teacher yet</option>
          {pickedTeachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} · {t.dept}
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

      <button className="btn-primary btn-block" disabled={!section}>
        Add Class {className}
      </button>
    </form>
  );
}
