"use client";

import { CalendarPlus, CreditCard, FilePlus2, GraduationCap, UserPlus } from "lucide-react";
import { AdminDashboard } from "@/features/dashboard/hooks/useAdminDashboard";
import { firstNameOf, greeting } from "@/features/dashboard/utils/greeting";
import { useAppStore } from "@/store/AppStore";
import { DashboardBanner } from "../shared/DashboardBanner";

/** The Admin's quick action buttons. Each one opens a page. */
const QUICK_ACTIONS = [
  { id: "attendance", label: "Mark attendance", icon: CalendarPlus },
  { id: "admission", label: "Admit student", icon: UserPlus },
  { id: "teachers", label: "Add teacher", icon: GraduationCap },
  { id: "notices", label: "Post notice", icon: FilePlus2 },
  { id: "fees", label: "Collect fees", icon: CreditCard },
];

export function WelcomeBanner({ stats, go }: { stats: AdminDashboard; go: (id: string) => void }) {
  const { session } = useAppStore();
  const name = firstNameOf(session?.name ?? "");

  const attendanceLine = stats.markedToday
    ? `${stats.presentToday} of ${stats.markedToday} students marked are present today.`
    : "Attendance has not been marked yet today.";
  const leaveLine =
    stats.pendingLeaves > 0 ? ` ${stats.pendingLeaves} leave request(s) need your decision.` : "";

  return (
    <DashboardBanner
      title={name ? `${greeting()}, ${name}` : greeting()}
      summary={attendanceLine + leaveLine}
      actions={QUICK_ACTIONS}
      go={go}
    />
  );
}
