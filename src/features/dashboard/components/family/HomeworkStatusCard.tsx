"use client";

import { BookOpen } from "lucide-react";
import { FamilyDashboard, HomeworkState } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill, Tone } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";

const STATE_TONE: Record<HomeworkState, Tone> = {
  "To do": "warn",
  "Waiting for teacher": "info",
  Submitted: "ok",
  Approved: "ok",
  "Not approved": "bad",
};

/** Homework for the class, newest due dates first, with the state of the PDF. */
export function HomeworkStatusCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  const rows = stats.homeworkRows.slice(0, 5);

  return (
    <Card>
      <CardHead
        title="Homework"
        sub={`${stats.homeworkToDo.length} to hand in`}
        action={<LinkBtn onClick={() => go("homework")}>Open homework →</LinkBtn>}
      />
      {rows.length ? (
        <div className="mini-list">
          {rows.map(({ homework, state }) => (
            <div key={homework.id}>
              <span className="notice-ico">
                <BookOpen size={16} />
              </span>
              <div className="grow">
                <b>{homework.title}</b>
                <small>
                  {homework.subject} · due {fmtDate(homework.due)}
                </small>
              </div>
              <Pill tone={STATE_TONE[state]}>{state}</Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={BookOpen} title="No homework set" />
      )}
    </Card>
  );
}
