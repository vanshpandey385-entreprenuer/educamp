"use client";

import { MonthGrid } from "@/features/attendance/components/MonthGrid";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, LinkBtn } from "@/shared/components";

/** This month's attendance calendar for the child. */
export function AttendanceSnapshotCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  const now = new Date();

  return (
    <Card>
      <CardHead
        title="Attendance snapshot"
        sub={`This month · ${stats.attendancePercent.toFixed(1)}% present`}
        action={<LinkBtn onClick={() => go("attendance")}>View calendar →</LinkBtn>}
      />
      <MonthGrid s={stats.student} y={now.getFullYear()} m={now.getMonth()} compact />
    </Card>
  );
}
