"use client";

import { MessageSquareText } from "lucide-react";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";

/** Parent only: the newest remarks teachers wrote about the child. */
export function TeacherRemarksCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Teacher remarks"
        sub="Latest notes about your child"
        action={<LinkBtn onClick={() => go("messages")}>Messages →</LinkBtn>}
      />
      {stats.remarks.length ? (
        <div className="mini-list">
          {stats.remarks.map(({ remark, teacher }) => (
            <div key={remark.id}>
              <span className="notice-ico">
                <MessageSquareText size={16} />
              </span>
              <div className="grow">
                <b>{remark.text}</b>
                <small>
                  {teacher?.name ?? "Teacher"} · {fmtDate(remark.date)}
                </small>
              </div>
              <Pill tone={remark.kind === "Praise" ? "ok" : remark.kind === "Concern" ? "warn" : "muted"}>
                {remark.kind}
              </Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={MessageSquareText} title="No remarks yet" />
      )}
    </Card>
  );
}
