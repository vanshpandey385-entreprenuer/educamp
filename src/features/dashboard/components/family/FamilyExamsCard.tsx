"use client";

import { CalendarDays } from "lucide-react";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";

/** The next exams for the child's class. */
export function FamilyExamsCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Upcoming exams"
        sub={`Class ${stats.student.cls}`}
        action={<LinkBtn onClick={() => go("exams")}>Exam schedule →</LinkBtn>}
      />
      {stats.upcomingExams.length ? (
        <div className="mini-list">
          {stats.upcomingExams.map((exam) => (
            <div key={exam.id}>
              <span className="time-chip">{fmtDate(exam.date)}</span>
              <div className="grow">
                <b>{exam.subject}</b>
                <small>
                  {exam.time} · {exam.room}
                </small>
              </div>
              <Pill tone="info">Exam</Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={CalendarDays} title="No upcoming exams" />
      )}
    </Card>
  );
}
