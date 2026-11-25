"use client";

import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useFamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { greeting } from "@/features/dashboard/utils/greeting";
import { Stat } from "@/shared/components";
import { money } from "@/shared/lib/format";
import { AttendanceSnapshotCard } from "./family/AttendanceSnapshotCard";
import { FamilyExamsCard } from "./family/FamilyExamsCard";
import { FamilyNoticesCard } from "./family/FamilyNoticesCard";
import { FeeStatusCard } from "./family/FeeStatusCard";
import { HomeworkStatusCard } from "./family/HomeworkStatusCard";
import { TeacherRemarksCard } from "./family/TeacherRemarksCard";
import { DashboardBanner } from "./shared/DashboardBanner";

/** Parent dashboard: about one child, with fees, teacher remarks and messages. */
export function ParentOverview({ studentId, go }: { studentId: number; go: (id: string) => void }) {
  const stats = useFamilyDashboard(studentId);
  const { student } = stats;

  const summary =
    stats.feeBalance > 0
      ? `${student.name} · Class ${student.cls} · ${money(stats.feeBalance)} fee balance.`
      : `${student.name} · Class ${student.cls} · no fee dues.`;

  return (
    <>
      <DashboardBanner
        title={`${greeting()}, ${student.guardian}`}
        summary={summary}
        go={go}
        actions={[
          { id: "fees", label: "Pay fees", icon: CreditCard },
          { id: "messages", label: "Message teacher", icon: MessageSquare },
          { id: "meetings", label: "Book meeting", icon: CalendarClock },
          { id: "homework", label: "Homework", icon: BookOpen },
        ]}
      />

      <div className="stats">
        <Stat
          icon={ClipboardCheck}
          label="Attendance"
          value={`${stats.attendancePercent.toFixed(1)}%`}
          detail="This month"
        />
        <Stat
          icon={Wallet}
          label="Fee balance"
          value={money(stats.feeBalance)}
          detail={stats.feeBalance ? "Payment due" : "No dues"}
          tone={stats.feeBalance ? "warn" : "ok"}
        />
        <Stat
          icon={BookOpen}
          label="Homework to hand in"
          value={stats.homeworkToDo.length}
          detail="Tasks not yet approved"
          tone={stats.homeworkToDo.length ? "warn" : "ok"}
        />
        <Stat
          icon={MessageSquare}
          label="Unread messages"
          value={stats.unreadMessages}
          detail="From teachers"
          tone={stats.unreadMessages ? "bad" : "ok"}
        />
      </div>

      <div className="grid-2">
        <FeeStatusCard stats={stats} go={go} />
        <AttendanceSnapshotCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <HomeworkStatusCard stats={stats} go={go} />
        <TeacherRemarksCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <FamilyExamsCard stats={stats} go={go} />
        <FamilyNoticesCard stats={stats} go={go} />
      </div>
    </>
  );
}
