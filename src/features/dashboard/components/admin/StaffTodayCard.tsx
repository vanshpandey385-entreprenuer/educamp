"use client";

import { Card, CardHead, LinkBtn, StackedBar } from "@/shared/components";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";

/** One stacked bar showing how today's teacher attendance is divided. */
export function StaffTodayCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Teachers today"
        sub={`${stats.teacherCount} teachers on staff`}
        action={<LinkBtn onClick={() => go("teacher-attendance")}>Open →</LinkBtn>}
      />
      <StackedBar
        ariaLabel="Teacher attendance today"
        parts={[
          { label: "Present", value: stats.staffPresent, color: "var(--primary)" },
          { label: "Absent", value: stats.staffAbsent, color: "var(--bad)" },
          { label: "On leave", value: stats.staffOnLeave, color: "var(--lemon)" },
          { label: "Not marked", value: stats.staffNotMarked, color: "var(--line-strong)" },
        ]}
      />
      <div className="foot-note">
        {stats.lessonsNeedingCover > 0
          ? `${stats.lessonsNeedingCover} lesson(s) need a substitute today.`
          : "No lessons need a substitute today."}
      </div>
    </Card>
  );
}
