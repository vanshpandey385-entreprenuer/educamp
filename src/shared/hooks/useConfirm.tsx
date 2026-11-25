"use client";

import { ReactNode, useState } from "react";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

interface Question {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  onConfirm: () => void;
}

/**
 * Replaces `window.confirm` with a styled dialog.
 *
 *   const { ask, dialog } = useConfirm();
 *   ask({ title: "Remove student?", message: "...", onConfirm: () => removeStudent() });
 *   return <>{...your page...}{dialog}</>;
 */
export function useConfirm(): {
  ask: (question: {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => void;
  dialog: ReactNode;
} {
  const [question, setQuestion] = useState<Question | null>(null);

  const ask = (input: {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) =>
    setQuestion({
      title: input.title,
      message: input.message,
      confirmLabel: input.confirmLabel ?? "Remove",
      danger: input.danger ?? true,
      onConfirm: input.onConfirm,
    });

  const dialog = question ? (
    <ConfirmDialog
      title={question.title}
      message={question.message}
      confirmLabel={question.confirmLabel}
      danger={question.danger}
      onCancel={() => setQuestion(null)}
      onConfirm={() => {
        question.onConfirm();
        setQuestion(null);
      }}
    />
  ) : null;

  return { ask, dialog };
}
