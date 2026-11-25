"use client";

import { CalendarDays } from "lucide-react";
import { TeacherDashboard } from "@/features/dashboard/hooks/useTeacherDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";

/** The next exams in the classes this teacher teaches. */
export function TeacherExamsCard({ stats, go }: { stats: TeacherDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Upcoming exams"
        sub="In your classes"
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
                  Class {exam.cls} · {exam.time} · {exam.room}
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
