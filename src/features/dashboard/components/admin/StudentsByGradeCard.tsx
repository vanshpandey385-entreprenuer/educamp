"use client";

import { Users } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Card, CardHead, ColumnChart, Empty, LinkBtn } from "@/shared/components";

/** Column chart: how many students are in each grade. */
export function StudentsByGradeCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  const biggest = Math.max(1, ...stats.studentsByGrade.map((g) => g.count));

  return (
    <Card>
      <CardHead
        title="Students by grade"
        sub={`${stats.studentCount.toLocaleString("en-IN")} students in total`}
        action={<LinkBtn onClick={() => go("students")}>View students →</LinkBtn>}
      />
      {stats.studentCount ? (
        <ColumnChart
          max={biggest}
          height={150}
          ariaLabel="Number of students in each grade"
          items={stats.studentsByGrade.map((g) => ({
            label: String(g.grade),
            value: g.count,
          }))}
        />
      ) : (
        <Empty icon={Users} title="No students admitted yet" />
      )}
    </Card>
  );
}
