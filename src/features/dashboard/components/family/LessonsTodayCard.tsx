"use client";

import { Clock } from "lucide-react";
import { DAYS } from "@/config/school";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn } from "@/shared/components";
import { todayLabel } from "@/shared/lib/date";

/** The class timetable for today, period by period. */
export function LessonsTodayCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Today's lessons"
        sub={`${DAYS[Math.min(stats.weekday, 4)]} · ${todayLabel()}`}
        action={<LinkBtn onClick={() => go("timetable")}>Full timetable →</LinkBtn>}
      />
      {stats.lessons.length ? (
        <div className="mini-list">
          {stats.lessons.map((lesson) => (
            <div key={lesson.period}>
              <span className="time-chip">{lesson.time.split(" – ")[0]}</span>
              <div className="grow">
                <b>{lesson.subject}</b>
                <small>{lesson.teacher?.name ?? "Teacher not assigned"}</small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={Clock} title="No lessons today" text="Classes run Monday to Friday." />
      )}
    </Card>
  );
}
