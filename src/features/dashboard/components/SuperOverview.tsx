"use client";

import { Building2, CheckCircle2, ClipboardList, LifeBuoy, ShieldCheck, Users } from "lucide-react";
import { SchoolTable } from "@/features/platform/components/SchoolTable";
import { useSuperDashboard } from "@/features/dashboard/hooks/useSuperDashboard";
import { greeting } from "@/features/dashboard/utils/greeting";
import { Card, CardHead, LinkBtn, Stat } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";
import { PlansCard } from "./super/PlansCard";
import { SchoolStatusCard } from "./super/SchoolStatusCard";
import { StudentsPerSchoolCard } from "./super/StudentsPerSchoolCard";
import { SupportCard } from "./super/SupportCard";
import { DashboardBanner } from "./shared/DashboardBanner";

/** Platform owner dashboard: every school, approvals, subscriptions and support. */
export function SuperOverview({ go }: { go: (id: string) => void }) {
  const stats = useSuperDashboard();
  const { session } = useAppStore();
  const name = session?.name ?? "";

  const summary = `${stats.pendingSchools.length} school(s) waiting for approval · ${stats.openTickets.length} open support ticket(s).`;

  return (
    <>
      <DashboardBanner
        title={name ? `${greeting()}, ${name}` : greeting()}
        summary={summary}
        go={go}
        actions={[
          { id: "approvals", label: "Review approvals", icon: ShieldCheck },
          { id: "schools", label: "Manage schools", icon: Building2 },
          { id: "support", label: "Support tickets", icon: LifeBuoy },
          { id: "subscriptions", label: "Subscriptions", icon: ClipboardList },
        ]}
      />

      <div className="stats">
        <Stat
          icon={Building2}
          label="Total schools"
          value={stats.schools.length}
          detail="Registered on Efficht"
        />
        <Stat
          icon={CheckCircle2}
          label="Active schools"
          value={stats.activeSchools.length}
          detail="Platform tenants"
          tone="info"
        />
        <Stat
          icon={ShieldCheck}
          label="Pending approvals"
          value={stats.pendingSchools.length}
          detail="Require review"
          tone={stats.pendingSchools.length ? "warn" : "ok"}
        />
        <Stat
          icon={Users}
          label="Enrolled students"
          value={stats.totalStudents.toLocaleString("en-IN")}
          detail="Across all schools"
          tone="info"
        />
      </div>

      <div className="grid-2">
        <SchoolStatusCard stats={stats} go={go} />
        <StudentsPerSchoolCard stats={stats} />
      </div>

      <div className="grid-2">
        <SupportCard stats={stats} go={go} />
        <PlansCard stats={stats} go={go} />
      </div>

      <Card>
        <CardHead
          title="School registrations"
          sub="Every school on the platform"
          action={<LinkBtn onClick={() => go("schools")}>Manage schools →</LinkBtn>}
        />
        <SchoolTable schools={stats.schools} />
      </Card>
    </>
  );
}
