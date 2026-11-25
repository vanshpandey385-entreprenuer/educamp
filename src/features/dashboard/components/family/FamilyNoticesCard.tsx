"use client";

import { Bell } from "lucide-react";
import { FamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";

/** The newest school notices. */
export function FamilyNoticesCard({ stats, go }: { stats: FamilyDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="School notices"
        sub="Latest from the school"
        action={<LinkBtn onClick={() => go("notices")}>View all →</LinkBtn>}
      />
      {stats.notices.length ? (
        <div className="mini-list">
          {stats.notices.map((notice) => (
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
        <Empty icon={Bell} title="No notices yet" />
      )}
    </Card>
  );
}
