"use client";

import { Bell } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";

/** The three newest school notices. */
export function AnnouncementsCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Latest announcements"
        sub="Important school updates"
        action={<LinkBtn onClick={() => go("notices")}>View all →</LinkBtn>}
      />
      {stats.latestNotices.length ? (
        <div className="mini-list">
          {stats.latestNotices.map((notice) => (
            <div key={notice.id}>
              <span className="notice-ico">
                <Bell size={16} />
              </span>
              <div className="grow">
                <b>{notice.title}</b>
                <small>{notice.date}</small>
              </div>
              <Pill>{notice.type}</Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={Bell} title="No announcements yet" />
      )}
    </Card>
  );
}
