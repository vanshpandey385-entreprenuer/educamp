"use client";

import { CalendarCheck } from "lucide-react";
import { DAYS, PERIODS } from "@/config/school";
import { TeacherDashboard } from "@/features/dashboard/hooks/useTeacherDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { todayLabel } from "@/shared/lib/date";

/** Today's lessons in time order, with cover periods marked. */
export function TeacherScheduleCard({ stats, go }: { stats: TeacherDashboard; go: (id: string) => void }) {
  const dayName = DAYS[Math.min(stats.weekday, 4)];

  return (
    <Card>
      <CardHead
        title="Today's schedule"
        sub={`${dayName} · ${todayLabel()}`}
        action={<LinkBtn onClick={() => go("timetable")}>Full timetable →</LinkBtn>}
      />
      {stats.todaysSchedule.length ? (
        <div className="mini-list">
          {stats.todaysSchedule.map((lesson) => (
            <div key={`${lesson.cls}-${lesson.period}-${lesson.isCover}`}>
              <span className="time-chip">{PERIODS[lesson.period].split(" – ")[0]}</span>
              <div className="grow">
                <b>{lesson.isCover ? "Substitute cover" : stats.teacher.dept}</b>
                <small>
                  Class {lesson.cls} · Period {lesson.period + 1}
                </small>
              </div>
              {lesson.isCover && <Pill tone="warn">Cover</Pill>}
            </div>
          ))}
        </div>
      ) : (
        <Empty
          icon={CalendarCheck}
          title={stats.weekday > 4 ? "No lessons on weekends" : "No lessons today"}
        />
      )}
    </Card>
  );
}
