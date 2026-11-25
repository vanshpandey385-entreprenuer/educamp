"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

/**
 * A small "Are you sure?" window.
 * Use it before something that cannot be undone, such as removing a student.
 * Most pages use the `useConfirm` hook instead of this component directly.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  /** Red confirm button, for removing things. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} eyebrow="PLEASE CONFIRM" onClose={onCancel}>
      <div className="confirm-body">
        <span className={danger ? "confirm-icon danger" : "confirm-icon"}>
          <AlertTriangle size={20} />
        </span>
        <p>{message}</p>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
