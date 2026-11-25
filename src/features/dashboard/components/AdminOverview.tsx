"use client";

import { CalendarDays, ClipboardCheck, Users, Wallet } from "lucide-react";
import { useAdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { Stat } from "@/shared/components";
import { money } from "@/shared/lib/format";
import { AnnouncementsCard } from "./admin/AnnouncementsCard";
import { AttendanceTrendCard } from "./admin/AttendanceTrendCard";
import { FeeCollectionCard } from "./admin/FeeCollectionCard";
import { NeedsAttentionCard } from "./admin/NeedsAttentionCard";
import { RecentActivityCard } from "./admin/RecentActivityCard";
import { StaffTodayCard } from "./admin/StaffTodayCard";
import { StudentsByGradeCard } from "./admin/StudentsByGradeCard";
import { UpcomingEventsCard } from "./admin/UpcomingEventsCard";
import { WelcomeBanner } from "./admin/WelcomeBanner";

/**
 * School Admin dashboard.
 * All numbers come from `useAdminDashboard`, which reads the school's real data.
 * Each card below is its own small file in the `admin` folder.
 */
export function AdminOverview({ go }: { go: (id: string) => void }) {
  const stats = useAdminDashboard();

  return (
    <>
      <WelcomeBanner stats={stats} go={go} />

      <div className="stats">
        <Stat
          icon={Users}
          label="Total students"
          value={stats.studentCount.toLocaleString("en-IN")}
          detail={`${stats.teacherCount} teachers`}
        />
        <Stat
          icon={ClipboardCheck}
          label="Student attendance"
          value={stats.markedToday ? `${stats.attendancePercent.toFixed(1)}%` : "—"}
          detail={`${stats.markedToday.toLocaleString("en-IN")} of ${stats.studentCount.toLocaleString("en-IN")} marked today`}
          tone="info"
        />
        <Stat
          icon={Wallet}
          label="Fees outstanding"
          value={money(stats.outstandingAmount)}
          detail={`${money(stats.collectedAmount)} collected`}
          tone="warn"
        />
        <Stat
          icon={CalendarDays}
          label="Leave requests"
          value={stats.pendingLeaves}
          detail="Awaiting approval"
          tone={stats.pendingLeaves ? "bad" : "ok"}
        />
      </div>

      <div className="grid-2">
        <AttendanceTrendCard stats={stats} go={go} />
        <FeeCollectionCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <StudentsByGradeCard stats={stats} go={go} />
        <StaffTodayCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <NeedsAttentionCard stats={stats} go={go} />
        <UpcomingEventsCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <RecentActivityCard stats={stats} go={go} />
        <AnnouncementsCard stats={stats} go={go} />
      </div>
    </>
  );
}
