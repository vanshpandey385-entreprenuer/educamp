"use client";

import { CreditCard } from "lucide-react";
import { SuperDashboard } from "@/features/dashboard/hooks/useSuperDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";

/** How many schools are on each subscription plan, plus shortcuts to approvals. */
export function PlansCard({ stats, go }: { stats: SuperDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Subscriptions"
        sub="Schools by plan"
        action={<LinkBtn onClick={() => go("subscriptions")}>Monitor →</LinkBtn>}
      />
      {stats.plans.length ? (
        <div className="mini-list">
          {stats.plans.map((row) => (
            <div key={row.plan}>
              <span className="notice-ico">
                <CreditCard size={16} />
              </span>
              <div className="grow">
                <b>{row.plan}</b>
              </div>
              <Pill tone="lime">{`${row.count} school${row.count === 1 ? "" : "s"}`}</Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={CreditCard} title="No subscriptions yet" />
      )}
    </Card>
  );
}
