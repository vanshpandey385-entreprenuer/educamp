"use client";

import { Card, CardHead, ColumnChart, Empty, LinkBtn } from "@/shared/components";
import { ClipboardCheck } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { fmtDate } from "@/shared/lib/date";

/** Column chart of the percentage of students present on the last recorded days. */
export function AttendanceTrendCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  const items = stats.attendanceTrend.map((day) => ({
    label: new Date(day.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" }),
    sub: fmtDate(day.date),
    value: day.percent,
    display: day.percent === null ? "—" : `${day.percent}%`,
  }));

  return (
    <Card>
      <CardHead
        title="Attendance trend"
        sub="Students present, last recorded days"
        action={<LinkBtn onClick={() => go("attendance")}>Open registers →</LinkBtn>}
      />
      {items.length ? (
        <ColumnChart items={items} ariaLabel="Percentage of students present on each recorded day" />
      ) : (
        <Empty icon={ClipboardCheck} title="No attendance recorded yet" />
      )}
    </Card>
  );
}
