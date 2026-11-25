"use client";

import { Building2 } from "lucide-react";
import { SuperDashboard } from "@/features/dashboard/hooks/useSuperDashboard";
import { Card, CardHead, ChartLegend, DonutChart, Empty, LinkBtn } from "@/shared/components";

/** Donut chart: how many schools are active, pending approval or suspended. */
export function SchoolStatusCard({ stats, go }: { stats: SuperDashboard; go: (id: string) => void }) {
  const active = stats.activeSchools.length;
  const pending = stats.pendingSchools.length;
  const suspended = stats.suspendedSchools.length;

  return (
    <Card>
      <CardHead
        title="Schools by status"
        sub={`${stats.schools.length} schools on the platform`}
        action={<LinkBtn onClick={() => go("schools")}>Manage schools →</LinkBtn>}
      />
      {stats.schools.length ? (
        <div className="chart-split">
          <DonutChart
            ariaLabel={`${active} active, ${pending} pending and ${suspended} suspended schools`}
            centerTop={active}
            centerBottom="active"
            slices={[
              { label: "Active", value: active, color: "var(--primary)" },
              { label: "Pending", value: pending, color: "var(--lemon)" },
              { label: "Suspended", value: suspended, color: "var(--bad)" },
            ]}
          />
          <ChartLegend
            items={[
              { label: "Active", value: active, color: "var(--primary)" },
              { label: "Pending approval", value: pending, color: "var(--lemon)" },
              { label: "Suspended", value: suspended, color: "var(--bad)" },
            ]}
          />
        </div>
      ) : (
        <Empty icon={Building2} title="No schools registered yet" />
      )}
    </Card>
  );
}
