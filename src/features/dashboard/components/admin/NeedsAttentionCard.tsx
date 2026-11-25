"use client";

import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, UserCheck, UserX } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Card, CardHead, Empty } from "@/shared/components";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** A short list of things the Admin should act on. Items with nothing to do are hidden. */
export function NeedsAttentionCard({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  const items = [
    {
      icon: CalendarDays,
      text: `${plural(stats.pendingLeaves, "leave request")} awaiting approval`,
      to: "leaves",
      show: stats.pendingLeaves > 0,
    },
    {
      icon: UserX,
      text: `${plural(stats.lessonsNeedingCover, "lesson")} need a substitute teacher`,
      to: "teacher-attendance",
      show: stats.lessonsNeedingCover > 0,
    },
    {
      icon: CreditCard,
      text: `${plural(stats.overdueCount, "fee account")} overdue`,
      to: "fees",
      show: stats.overdueCount > 0,
    },
    {
      icon: UserCheck,
      text: `${plural(stats.staffNotMarked, "teacher")} not marked for today`,
      to: "teacher-attendance",
      show: stats.staffNotMarked > 0,
    },
  ].filter((item) => item.show);

  return (
    <Card>
      <CardHead title="Needs attention" sub="Items that need a decision" />
      <div className="todo">
        {items.map((item) => (
          <button key={item.text} type="button" onClick={() => go(item.to)}>
            <span>
              <item.icon size={16} />
            </span>
            {item.text}
            <ArrowRight size={15} />
          </button>
        ))}
        {!items.length && <Empty icon={CheckCircle2} title="All caught up" />}
      </div>
    </Card>
  );
}
