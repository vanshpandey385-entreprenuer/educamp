"use client";

import { Wallet } from "lucide-react";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";
import { money } from "@/shared/lib/format";

/** Parent only: the current fee amount, due date and status. */
export function FeeStatusCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  const fee = stats.fee;

  return (
    <Card>
      <CardHead
        title="Fees"
        sub="Current instalment"
        action={<LinkBtn onClick={() => go("fees")}>Open fees →</LinkBtn>}
      />
      {fee ? (
        <>
          <div className="fee-top">
            <div>
              <small>Amount</small>
              <b>{money(fee.amount)}</b>
            </div>
            <div>
              <small>{fee.status === "Paid" ? "Status" : "Due date"}</small>
              <b>{fee.status === "Paid" ? "Paid" : fmtDate(fee.due)}</b>
            </div>
          </div>
          <Pill tone={fee.status === "Paid" ? "ok" : fee.status === "Overdue" ? "bad" : "warn"}>
            {fee.status}
          </Pill>
        </>
      ) : (
        <Empty icon={Wallet} title="No fee record yet" />
      )}
    </Card>
  );
}
