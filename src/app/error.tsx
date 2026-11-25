"use client";

import { ErrorState } from "@/shared/components";

/** Next.js shows this page when a screen crashes, instead of a blank white page. */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="boot">
      <ErrorState title="Something went wrong" text="Please try again." onRetry={reset} />
    </div>
  );
}
