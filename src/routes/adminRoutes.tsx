import { SchoolAnalytics } from "@/features/analytics/components/SchoolAnalytics";
import { Register } from "@/features/attendance/components/Register";
import { TeacherAttendance } from "@/features/attendance/components/TeacherAttendance";
import { AuditView } from "@/features/audit/components/AuditView";
import { AdminOverview } from "@/features/dashboard/components/AdminOverview";
import { Academics } from "@/features/events/components/Academics";
import { ExamsView } from "@/features/exams/components/ExamsView";
import { FeesView } from "@/features/fees/components/FeesView";
import { HomeworkView } from "@/features/homework/components/HomeworkView";
import { LeavesView } from "@/features/leaves/components/LeavesView";
import { LibraryAdmin } from "@/features/library/components/LibraryAdmin";
import { Notices } from "@/features/notices/components/Notices";
import { ReportsView } from "@/features/reports/components/ReportsView";
import { ResourcesView } from "@/features/resources/components/ResourcesView";
import { SettingsView } from "@/features/settings/components/SettingsView";
import { AdmissionView } from "@/features/students/components/AdmissionView";
import { StudentsView } from "@/features/students/components/StudentsView";
import { TeachersView } from "@/features/teachers/components/TeachersView";
import { TimetableView } from "@/features/timetable/components/TimetableView";
import { TransportAdmin } from "@/features/transport/components/TransportAdmin";
import { ClassesView } from "@/features/classes/components/ClassesView";
import type { GoTo, RouteTable } from "./types";

/** Pages for the school administrator. */
export function adminRoutes(go: GoTo, classes: string[]): RouteTable {
  return {
    overview: <AdminOverview go={go} />,
    students: <StudentsView />,
    admission: <AdmissionView go={go} />,
    teachers: <TeachersView />,
    classes: <ClassesView />,
    attendance: <Register classes={classes} />,
    "teacher-attendance": <TeacherAttendance />,
    leaves: <LeavesView mode="admin" />,
    notices: <Notices canEdit />,
    academics: <Academics />,
    homework: <HomeworkView mode="admin" />,
    timetable: <TimetableView classes={classes} canArrange />,
    exams: <ExamsView classes={classes} canEdit />,
    resources: <ResourcesView canPost byName="School Admin" />,
    library: <LibraryAdmin />,
    transport: <TransportAdmin />,
    analytics: <SchoolAnalytics />,
    audit: <AuditView />,
    fees: <FeesView />,
    reports: <ReportsView />,
    settings: <SettingsView />,
  };
}
