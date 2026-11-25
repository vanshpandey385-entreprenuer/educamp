"use client";

import { LifeBuoy } from "lucide-react";
import { SuperDashboard } from "@/features/dashboard/hooks/useSuperDashboard";
import { Card, CardHead, Empty, LinkBtn, Pill } from "@/shared/components";

/** The open support tickets, newest first. */
export function SupportCard({ stats, go }: { stats: SuperDashboard; go: (id: string) => void }) {
  const tickets = stats.openTickets.slice(0, 4);

  return (
    <Card>
      <CardHead
        title="Open support tickets"
        sub={`${stats.openTickets.length} open · ${stats.highPriorityTickets.length} high priority`}
        action={<LinkBtn onClick={() => go("support")}>Open support →</LinkBtn>}
      />
      {tickets.length ? (
        <div className="mini-list">
          {tickets.map((ticket) => (
            <div key={ticket.id}>
              <span className="notice-ico">
                <LifeBuoy size={16} />
              </span>
              <div className="grow">
                <b>{ticket.topic}</b>
                <small>{ticket.school}</small>
              </div>
              <Pill
                tone={ticket.priority === "High" ? "bad" : ticket.priority === "Normal" ? "warn" : "muted"}
              >
                {ticket.priority}
              </Pill>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={LifeBuoy} title="No open tickets" />
      )}
    </Card>
  );
}
