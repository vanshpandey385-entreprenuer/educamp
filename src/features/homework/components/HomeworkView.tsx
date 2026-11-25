"use client";

import { BookOpen, CalendarClock, ClipboardCheck, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";
import { teacherMayReview } from "../utils/review";
import { ReviewSubmissionsModal } from "./ReviewSubmissionsModal";
import { StudentSubmission } from "./StudentSubmission";

/* ───────────── Homework ───────────── */
export function HomeworkView({
  mode,
  classes,
  studentId,
  teacherName,
}: {
  mode: "admin" | "teacher" | "student" | "parent";
  classes?: string[];
  studentId?: number;
  teacherName?: string;
}) {
  const { data, update, notify } = useAppStore();
  const allClasses = useClasses();
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("All");
  // The homework whose PDFs the teacher is reviewing right now.
  const [reviewing, setReviewing] = useState<number | null>(null);
  const currentTeacher = data.teachers.find((t) => t.name === teacherName);
  const isFamily = mode === "student" || mode === "parent";
  const list = data.homework.filter(
    (h) => (!classes || classes.includes(h.cls)) && (filter === "All" || h.cls === filter),
  );
  const canAssign = mode === "teacher" || mode === "admin";

  function assign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update((d) => ({
      homework: [
        {
          id: Date.now(),
          schoolId: UNSTAMPED,
          cls: String(f.get("cls")),
          subject: String(f.get("subject")),
          title: String(f.get("title")),
          due: String(f.get("due")),
          by: teacherName ?? "School Admin",
          done: [],
        },
        ...d.homework,
      ],
    }));
    setModal(false);
    notify("Homework assigned.");
  }
  // Once the student has looked at the teacher's decisions, mark them as seen so the bell goes quiet.
  useEffect(() => {
    if (!isFamily || studentId == null) return;
    const unseen = data.submissions.filter(
      (s) => s.studentId === studentId && s.status !== "Pending review" && !s.studentSeen,
    );
    if (!unseen.length) return;

    const timer = setTimeout(() => {
      update((d) => ({
        submissions: d.submissions.map((s) =>
          unseen.some((u) => u.id === s.id) ? { ...s, studentSeen: true } : s,
        ),
      }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [isFamily, studentId, data.submissions, update]);

  const pool = classes ?? allClasses;

  return (
    <>
      <Card>
        <CardHead
          title={isFamily ? "Assigned homework" : "Homework register"}
          sub="Due dates and submission progress"
          action={
            <div className="row-gap">
              {pool.length > 1 && (
                <select
                  className="select-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filter by class"
                >
                  <option>All</option>
                  {pool.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
              {canAssign && (
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <Plus size={15} /> Assign homework
                </button>
              )}
            </div>
          }
        />
        <div className="hw-grid">
          {list.map((h) => {
            const cohort = data.students.filter((s) => s.cls === h.cls);
            const homeworkSubmissions = data.submissions.filter((s) => s.homeworkId === h.id);

            // A student counts as submitted if they added a PDF, or were ticked as done in older records.
            const submittedIds = new Set([...h.done, ...homeworkSubmissions.map((s) => s.studentId)]);
            const submittedCount = cohort.filter((s) => submittedIds.has(s.id)).length;
            const pct = cohort.length ? (submittedCount / cohort.length) * 100 : 0;

            const mySubmission = homeworkSubmissions.find((s) => s.studentId === studentId);
            const waitingForReview = homeworkSubmissions.filter((s) => s.status === "Pending review").length;
            const canReview = mode === "admin" || (mode === "teacher" && teacherMayReview(currentTeacher, h));
            return (
              <article key={h.id} className="hw-card">
                <div className="hw-top">
                  <span className="hw-ico">
                    <BookOpen size={17} />
                  </span>
                  <Pill tone="info">{`Class ${h.cls}`}</Pill>
                </div>
                <h3>{h.title}</h3>
                <p>
                  {h.subject} · {h.by}
                </p>
                <div className="hw-due">
                  <CalendarClock size={14} /> Due {fmtDate(h.due)}
                </div>
                {isFamily ? (
                  <StudentSubmission
                    homework={h}
                    submission={mySubmission}
                    markedDoneBefore={studentId != null && h.done.includes(studentId)}
                  />
                ) : (
                  <div className="hw-foot col">
                    <div className="between">
                      <small>Submitted</small>
                      <b>{Math.round(pct)}%</b>
                    </div>
                    <Progress value={pct} />
                    {canReview && (
                      <button className="btn-ghost btn-sm" onClick={() => setReviewing(h.id)}>
                        <ClipboardCheck size={14} /> Review PDFs ({homeworkSubmissions.length})
                        {waitingForReview > 0 && <Pill tone="warn">{`${waitingForReview} new`}</Pill>}
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
        {!list.length && (
          <Empty icon={BookOpen} title="No homework found" text="Nothing is assigned for this selection." />
        )}
      </Card>
      {reviewing !== null && data.homework.find((h) => h.id === reviewing) && (
        <ReviewSubmissionsModal
          homework={data.homework.find((h) => h.id === reviewing)!}
          onClose={() => setReviewing(null)}
        />
      )}
      {modal && (
        <Modal title="Assign homework" onClose={() => setModal(false)}>
          <form onSubmit={assign} className="form">
            <div className="form-2">
              <Field label="Class">
                <select name="cls">
                  {pool.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <input name="subject" required placeholder="Mathematics" />
              </Field>
            </div>
            <Field label="Title">
              <input name="title" required autoFocus placeholder="Exercise 5 · Ratios" />
            </Field>
            <Field label="Due date">
              <input name="due" type="date" required />
            </Field>
            <button className="btn-primary btn-block">Assign homework</button>
          </form>
        </Modal>
      )}
    </>
  );
}
