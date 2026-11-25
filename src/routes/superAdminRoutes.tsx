import { AuditView } from "@/features/audit/components/AuditView";
import { BroadcastView } from "@/features/platform/components/BroadcastView";
import { ModulesView } from "@/features/platform/components/ModulesView";
import { PlatformAnalytics } from "@/features/platform/components/PlatformAnalytics";
import { SchoolsView } from "@/features/platform/components/SchoolsView";
import { SubscriptionsView } from "@/features/platform/components/SubscriptionsView";
import { SupportView } from "@/features/platform/components/SupportView";
import { SuperOverview } from "@/features/dashboard/components/SuperOverview";
import type { GoTo, RouteTable } from "./types";

/** Pages for platform staff (Super Admin). */
export function superAdminRoutes(go: GoTo): RouteTable {
  return {
    overview: <SuperOverview go={go} />,
    schools: <SchoolsView />,
    approvals: <SchoolsView pendingOnly />,
    subscriptions: <SubscriptionsView />,
    support: <SupportView />,
    analytics: <PlatformAnalytics />,
    broadcast: <BroadcastView />,
    modules: <ModulesView />,
    audit: <AuditView />,
  };
}
