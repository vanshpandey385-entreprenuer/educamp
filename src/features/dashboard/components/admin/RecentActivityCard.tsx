"use client";

import { History } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Avatar, Card, CardHead, Empty, LinkBtn } from "@/shared/components";
import { fmtDateTime } from "@/shared/lib/date";

/** The newest lines from the school's activity log. */
export function RecentActivityCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Recent activity"
        sub="Latest changes in your school"
        action={<LinkBtn onClick={() => go("audit")}>Activity log →</LinkBtn>}
      />
      {stats.recentActivity.length ? (
        <div className="mini-list">
          {stats.recentActivity.map((item) => (
            <div key={item.id}>
              <Avatar name={item.who} size={32} />
              <div className="grow">
                <b>{item.action}</b>
                <small>
                  {item.who} · {item.role} · {fmtDateTime(item.at)}
                </small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={History} title="No activity yet" />
      )}
    </Card>
  );
}
