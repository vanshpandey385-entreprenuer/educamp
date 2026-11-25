"use client";

import { Users } from "lucide-react";
import { TeacherDashboard } from "@/features/dashboard/hooks/useTeacherDashboard";
import { Card, CardHead, Empty, LinkBtn, Progress } from "@/shared/components";

/** One bar per class: how much of today's attendance has been marked, and how many are present. */
export function ClassAttendanceCard({ stats, go }: { stats: TeacherDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Attendance today"
        sub="Marked students in each of your classes"
        action={<LinkBtn onClick={() => go("attendance")}>Open registers →</LinkBtn>}
      />
      {stats.classRows.length ? (
        <div className="bars">
          {stats.classRows.map((row) => (
            <div key={row.cls} className="bar-row">
              <span>
                Class {row.cls}
                {row.isClassTeacher && <small className="inline-note"> · class teacher</small>}
              </span>
              <Progress
                value={row.total ? (row.marked / row.total) * 100 : 0}
                tone={row.marked === row.total && row.total > 0 ? "ok" : "lime"}
              />
              <b>{row.total ? `${row.marked}/${row.total}` : "—"}</b>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={Users} title="No classes assigned yet" />
      )}
    </Card>
  );
}
