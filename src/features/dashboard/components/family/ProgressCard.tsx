"use client";

import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, LinkBtn, Progress } from "@/shared/components";

/** Overall academic average from the latest results. */
export function ProgressCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Learning progress"
        sub="Latest assessment average"
        action={<LinkBtn onClick={() => go("results")}>View results →</LinkBtn>}
      />
      <div className="mini-prog">
        <b>{stats.student.avg}%</b>
        <span>Overall academic progress</span>
      </div>
      <Progress value={stats.student.avg} tone="lime" />
    </Card>
  );
}
