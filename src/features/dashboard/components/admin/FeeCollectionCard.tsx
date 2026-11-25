"use client";

import { Wallet } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Card, CardHead, ChartLegend, DonutChart, Empty, LinkBtn } from "@/shared/components";
import { money } from "@/shared/lib/format";

/** Donut chart of fees collected, pending and overdue, measured in rupees. */
export function FeeCollectionCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  const hasFees = stats.collectedAmount + stats.pendingAmount + stats.overdueAmount > 0;

  return (
    <Card>
      <CardHead
        title="Fee collection"
        sub="Amount by payment status"
        action={<LinkBtn onClick={() => go("fees")}>Open fees →</LinkBtn>}
      />
      {hasFees ? (
        <div className="chart-split">
          <DonutChart
            ariaLabel={`${stats.collectedPercent} percent of fees collected`}
            centerTop={`${stats.collectedPercent}%`}
            centerBottom="collected"
            slices={[
              { label: "Collected", value: stats.collectedAmount, color: "var(--primary)" },
              { label: "Pending", value: stats.pendingAmount, color: "var(--lemon)" },
              { label: "Overdue", value: stats.overdueAmount, color: "var(--bad)" },
            ]}
          />
          <ChartLegend
            items={[
              { label: "Collected", value: money(stats.collectedAmount), color: "var(--primary)" },
              { label: "Pending", value: money(stats.pendingAmount), color: "var(--lemon)" },
              { label: "Overdue", value: money(stats.overdueAmount), color: "var(--bad)" },
            ]}
          />
        </div>
      ) : (
        <Empty icon={Wallet} title="No fee records yet" />
      )}
    </Card>
  );
}
