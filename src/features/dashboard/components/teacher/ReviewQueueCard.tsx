"use client";

import { FileText } from "lucide-react";
import { TeacherDashboard } from "@/features/dashboard/hooks/useTeacherDashboard";
import { Avatar, Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { fmtDateTime } from "@/shared/lib/date";

/** Homework PDFs that students have sent and that still need approve / not approve. */
export function ReviewQueueCard({ stats, go }: { stats: TeacherDashboard; go: (id: string) => void }) {
  const rows = stats.toReview.slice(0, 5);

  return (
    <Card>
      <CardHead
        title="Homework to review"
        sub={`${stats.toReview.length} PDF${stats.toReview.length === 1 ? "" : "s"} waiting for your decision`}
        action={<LinkBtn onClick={() => go("homework")}>Open homework →</LinkBtn>}
      />
      {rows.length ? (
        <div className="mini-list">
          {rows.map(({ submission, student, homework }) => (
            <div key={submission.id}>
              <Avatar name={student?.name ?? "?"} size={32} />
              <div className="grow">
                <b>{student?.name ?? "Student"}</b>
                <small>
                  {homework?.title ?? "Homework"} · {fmtDateTime(submission.submittedAt)}
                </small>
              </div>
              <Pill tone="info">PDF</Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={FileText} title="Nothing to review" text="New homework PDFs will appear here." />
      )}
    </Card>
  );
}
