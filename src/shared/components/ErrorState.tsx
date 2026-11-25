"use client";

import { AlertCircle } from "lucide-react";

/** Shown when something went wrong. The retry button is optional. */
export function ErrorState({
  title = "Something went wrong",
  text,
  onRetry,
}: {
  title?: string;
  text?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="empty error-state" role="alert">
      <span>
        <AlertCircle size={22} />
      </span>
      <b>{title}</b>
      {text && <p>{text}</p>}
      {onRetry && (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
