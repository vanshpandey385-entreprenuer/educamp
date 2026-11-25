"use client";

import { Check, FileText, X } from "lucide-react";
import { useState } from "react";
import { Empty, Modal, Pill } from "@/shared/components";
import { fmtDateTime } from "@/shared/lib/date";
import type { Homework, Submission, SubmissionStatus } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";
import { fileSizeLabel, pdfUrl } from "../utils/uploadPdf";

/** Pop-up where a teacher opens each student's PDF and approves it or not. */
export function ReviewSubmissionsModal({ homework, onClose }: { homework: Homework; onClose: () => void }) {
  const { data } = useAppStore();

  // Waiting ones first, then the rest by newest.
  const rows = data.submissions
    .filter((s) => s.homeworkId === homework.id)
    .sort((a, b) => {
      const aWaiting = a.status === "Pending review" ? 0 : 1;
      const bWaiting = b.status === "Pending review" ? 0 : 1;
      return aWaiting - bWaiting || b.submittedAt - a.submittedAt;
    });

  const classSize = data.students.filter((s) => s.cls === homework.cls).length;

  return (
    <Modal title={homework.title} eyebrow={`CLASS ${homework.cls} · ${homework.subject}`} onClose={onClose}>
      <p className="muted-p">
        {rows.length} of {classSize} students have added a PDF.
      </p>
      {!rows.length && <Empty icon={FileText} title="No PDFs yet" text="Students' files will appear here." />}
      <div className="review-list">
        {rows.map((submission) => (
          <ReviewRow key={submission.id} homework={homework} submission={submission} />
        ))}
      </div>
    </Modal>
  );
}

/** One student's PDF with its buttons. */
function ReviewRow({ homework, submission }: { homework: Homework; submission: Submission }) {
  const { data, session, update, log, notify } = useAppStore();
  const student = data.students.find((s) => s.id === submission.studentId);

  // True while the teacher is typing a remark for "Not approve".
  const [writingRemark, setWritingRemark] = useState(false);
  const [remark, setRemark] = useState(submission.remark ?? "");

  function decide(status: SubmissionStatus, note: string) {
    update((d) => ({
      submissions: d.submissions.map((s) =>
        s.id === submission.id
          ? {
              ...s,
              status,
              remark: note.trim() || undefined,
              reviewedBy: session?.name,
              reviewedAt: Date.now(),
              studentSeen: false,
            }
          : s,
      ),
    }));
    log(`${status}: "${homework.title}" by ${student?.name ?? "a student"}`);
    notify(
      status === "Approved"
        ? "Approved. The student has been told."
        : "Marked not approved. The student has been told.",
    );
    setWritingRemark(false);
  }

  const reviewed = submission.status !== "Pending review";

  return (
    <div className="review-row">
      <div className="review-who">
        <b>{student?.name ?? "Student"}</b>
        <small>
          Roll {student?.roll} · {fmtDateTime(submission.submittedAt)}
        </small>
      </div>

      <a className="hw-file" href={pdfUrl(submission.fileId)} target="_blank" rel="noreferrer">
        <FileText size={14} /> View file ({fileSizeLabel(submission.fileSize)})
      </a>

      {/* After a decision the buttons below stay visible, so the teacher can change their mind. */}
      {reviewed && !writingRemark && (
        <div className="review-result">
          <Pill tone={submission.status === "Approved" ? "ok" : "bad"}>{submission.status}</Pill>
          {submission.remark && <p className="hw-remark">{submission.remark}</p>}
        </div>
      )}

      {writingRemark ? (
        <div className="review-remark">
          <label className="field">
            <span>Remark for the student (optional)</span>
            <textarea
              rows={3}
              value={remark}
              maxLength={500}
              autoFocus
              placeholder="For example: Please rewrite question 3 and upload again."
              onChange={(e) => setRemark(e.target.value)}
            />
          </label>
          <div className="row-gap">
            <button className="btn-primary btn-sm" onClick={() => decide("Not approved", remark)}>
              Save as not approved
            </button>
            <button className="btn-ghost btn-sm" onClick={() => setWritingRemark(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="review-actions">
          <button
            className="btn-primary btn-sm"
            disabled={submission.status === "Approved"}
            onClick={() => decide("Approved", "")}
          >
            <Check size={14} /> Approve
          </button>
          <button className="btn-ghost btn-sm danger" onClick={() => setWritingRemark(true)}>
            <X size={14} /> Not approve
          </button>
        </div>
      )}
    </div>
  );
}
