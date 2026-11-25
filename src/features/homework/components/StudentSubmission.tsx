"use client";

import { FileText } from "lucide-react";
import { Pill } from "@/shared/components";
import type { Homework, Submission } from "@/shared/types/domain";
import { pdfUrl } from "../utils/uploadPdf";
import { PdfUploadButton } from "./PdfUploadButton";

/**
 * The bottom part of a homework card, as the student or parent sees it:
 * the status, the teacher's remark, and the right button for that status.
 */
export function StudentSubmission({
  homework,
  submission,
  markedDoneBefore,
}: {
  homework: Homework;
  submission?: Submission;
  /** True for older records that were ticked as done without a file. */
  markedDoneBefore: boolean;
}) {
  // 1. Nothing uploaded yet.
  if (!submission) {
    return (
      <div className="hw-foot">
        <Pill tone={markedDoneBefore ? "ok" : "warn"}>{markedDoneBefore ? "Submitted" : "Pending"}</Pill>
        <PdfUploadButton homeworkId={homework.id} label="Add PDF" primary />
      </div>
    );
  }

  const fileLink = (
    <a className="hw-file" href={pdfUrl(submission.fileId)} target="_blank" rel="noreferrer">
      <FileText size={14} /> {submission.fileName}
    </a>
  );

  // 2. Waiting for the teacher.
  if (submission.status === "Pending review") {
    return (
      <div className="hw-foot col">
        <div className="between">
          <Pill tone="info">Waiting for teacher</Pill>
          <PdfUploadButton homeworkId={homework.id} label="Replace PDF" existing={submission} />
        </div>
        {fileLink}
      </div>
    );
  }

  // 3. Approved. This is final, so there is no upload button.
  if (submission.status === "Approved") {
    return (
      <div className="hw-foot col">
        <div className="between">
          <Pill tone="ok">Approved</Pill>
          {!submission.studentSeen && <Pill tone="lime">New</Pill>}
        </div>
        {fileLink}
        <small className="muted-p">Checked by {submission.reviewedBy}</small>
      </div>
    );
  }

  // 4. Not approved. Show the remark and let the student upload again.
  return (
    <div className="hw-foot col">
      <div className="between">
        <Pill tone="bad">Not approved</Pill>
        {!submission.studentSeen && <Pill tone="lime">New</Pill>}
      </div>
      {submission.remark && (
        <p className="hw-remark">
          <b>{submission.reviewedBy}:</b> {submission.remark}
        </p>
      )}
      {fileLink}
      <PdfUploadButton homeworkId={homework.id} label="Upload again" existing={submission} primary />
    </div>
  );
}
