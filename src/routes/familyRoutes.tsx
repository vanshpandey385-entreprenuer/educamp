import { AttendanceCalendar } from "@/features/attendance/components/AttendanceCalendar";
import { CampusView } from "@/features/campus/components/CampusView";
import { ParentOverview } from "@/features/dashboard/components/ParentOverview";
import { StudentOverview } from "@/features/dashboard/components/StudentOverview";
import { ExamsView } from "@/features/exams/components/ExamsView";
import { StudentFees } from "@/features/fees/components/StudentFees";
import { HomeworkView } from "@/features/homework/components/HomeworkView";
import { LeavesView } from "@/features/leaves/components/LeavesView";
import { MeetingsView } from "@/features/meetings/components/MeetingsView";
import { MessagesView } from "@/features/messages/components/MessagesView";
import { Notices } from "@/features/notices/components/Notices";
import { ResourcesView } from "@/features/resources/components/ResourcesView";
import { ResultsView } from "@/features/results/components/ResultsView";
import { DigitalId } from "@/features/students/components/DigitalId";
import { ProfileView } from "@/features/students/components/ProfileView";
import { TimetableView } from "@/features/timetable/components/TimetableView";
import type { Student } from "@/shared/types/domain";
import type { GoTo, RouteTable } from "./types";

/** Pages for a parent or a student. `isParent` turns on parent-only actions. */
export function familyRoutes(student: Student, isParent: boolean, go: GoTo): RouteTable {
  const id = student.id;
  return {
    overview: isParent ? (
      <ParentOverview studentId={id} go={go} />
    ) : (
      <StudentOverview studentId={id} go={go} />
    ),
    profile: <ProfileView studentId={id} parent={isParent} />,
    attendance: <AttendanceCalendar studentId={id} />,
    results: <ResultsView studentId={id} />,
    fees: <StudentFees studentId={id} />,
    homework: <HomeworkView mode={isParent ? "parent" : "student"} classes={[student.cls]} studentId={id} />,
    timetable: <TimetableView classes={[student.cls]} />,
    notices: <Notices canEdit={false} viewer="family" />,
    id: <DigitalId studentId={id} />,
    exams: <ExamsView classes={[student.cls]} />,
    resources: <ResourcesView classes={[student.cls]} />,
    campus: <CampusView studentId={id} />,
    messages: <MessagesView mode="family" studentId={id} />,
    meetings: <MeetingsView mode="family" studentId={id} canBook={isParent} />,
    leaves: <LeavesView mode="family" studentId={id} />,
  };
}
