"use client";

/** Grey placeholder blocks shown while a page waits for its data. */
export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="loading-state" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <span key={i} className="skeleton" style={{ width: `${92 - i * 11}%` }} />
      ))}
    </div>
  );
}
