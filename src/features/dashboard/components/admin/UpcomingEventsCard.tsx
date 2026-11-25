"use client";

import { CalendarDays } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";

/** Events happening today or later, soonest first. */
export function UpcomingEventsCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  return (
    <Card>
      <CardHead
        title="Upcoming events"
        sub="Sports and academic events"
        action={<LinkBtn onClick={() => go("academics")}>View all →</LinkBtn>}
      />
      {stats.upcomingEvents.length ? (
        <div className="mini-list">
          {stats.upcomingEvents.map((event) => {
            const date = new Date(event.date + "T00:00:00");
            return (
              <div key={event.id}>
                <span className="date-chip">
                  <b>{date.toLocaleDateString("en-GB", { day: "2-digit" })}</b>
                  <small>{date.toLocaleDateString("en-GB", { month: "short" })}</small>
                </span>
                <div className="grow">
                  <b>{event.title}</b>
                  <small>{event.venue}</small>
                </div>
                <Pill tone={event.kind === "Sports" ? "lime" : "info"}>{event.kind}</Pill>
              </div>
            );
          })}
        </div>
      ) : (
        <Empty icon={CalendarDays} title="No upcoming events" />
      )}
    </Card>
  );
}
