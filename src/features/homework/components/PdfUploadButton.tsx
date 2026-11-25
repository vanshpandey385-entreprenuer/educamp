"use client";

import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { UNSTAMPED } from "@/shared/lib/records";
import type { Submission } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";
import { checkPdf, uploadPdf } from "../utils/uploadPdf";

/**
 * The "Add PDF" button on a homework card.
 * Steps: choose a file, check it, upload it, then save a submission that points to it.
 */
export function PdfUploadButton({
  homeworkId,
  label,
  existing,
  primary,
}: {
  homeworkId: number;
  label: string;
  /** The student's current submission for this homework, if any. It is replaced. */
  existing?: Submission;
  primary?: boolean;
}) {
  const { session, update, notify, log } = useAppStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // lets the student choose the same file again later
    if (!file || session?.studentId == null) return;

    const problem = checkPdf(file);
    if (problem) return notify(problem);

    setBusy(true);
    try {
      const uploaded = await uploadPdf(file);
      const studentId = session.studentId;

      update((d) => ({
        submissions: [
          ...d.submissions.filter((s) => s.homeworkId !== homeworkId),
          {
            id: existing?.id ?? Date.now(),
            schoolId: UNSTAMPED,
            homeworkId,
            studentId,
            fileId: uploaded.id,
            fileName: uploaded.name,
            fileSize: uploaded.size,
            submittedAt: Date.now(),
            status: "Pending review",
            studentSeen: true,
          },
        ],
      }));
      log(`Submitted homework PDF "${uploaded.name}"`);
      notify("Homework sent to your teacher.");
    } catch (error) {
      notify((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={fileInput} type="file" accept="application/pdf,.pdf" hidden onChange={onFileChosen} />
      <button
        type="button"
        className={primary ? "btn-primary btn-sm" : "btn-ghost btn-sm"}
        disabled={busy}
        onClick={() => fileInput.current?.click()}
      >
        <FileUp size={14} /> {busy ? "Uploading…" : label}
      </button>
    </>
  );
}
