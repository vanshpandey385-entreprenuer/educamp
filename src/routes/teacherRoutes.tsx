import { ClassAnalytics } from "@/features/analytics/components/ClassAnalytics";
import { Register } from "@/features/attendance/components/Register";
import { TeacherOverview } from "@/features/dashboard/components/TeacherOverview";
import { ExamsView } from "@/features/exams/components/ExamsView";
import { HomeworkView } from "@/features/homework/components/HomeworkView";
import { LeavesView } from "@/features/leaves/components/LeavesView";
import { MeetingsView } from "@/features/meetings/components/MeetingsView";
import { MessagesView } from "@/features/messages/components/MessagesView";
import { Notices } from "@/features/notices/components/Notices";
import { RemarksView } from "@/features/remarks/components/RemarksView";
import { ResourcesView } from "@/features/resources/components/ResourcesView";
import { MarksView } from "@/features/results/components/MarksView";
import { MyClasses } from "@/features/teachers/components/MyClasses";
import { TimetableView } from "@/features/timetable/components/TimetableView";
import type { Teacher } from "@/shared/types/domain";
import type { GoTo, RouteTable } from "./types";

/** Pages for a signed-in teacher. */
export function teacherRoutes(teacher: Teacher, go: GoTo): RouteTable {
  return {
    overview: <TeacherOverview teacherId={teacher.id} go={go} />,
    classes: <MyClasses teacherId={teacher.id} />,
    attendance: <Register classes={teacher.classes} />,
    marks: <MarksView teacherId={teacher.id} />,
    homework: <HomeworkView mode="teacher" classes={teacher.classes} teacherName={teacher.name} />,
    timetable: <TimetableView classes={teacher.classes} teacherId={teacher.id} />,
    notices: <Notices canEdit={false} viewer="teacher" />,
    leaves: <LeavesView mode="teacher" personName={teacher.name} cls={teacher.dept} />,
    analytics: <ClassAnalytics teacherId={teacher.id} />,
    exams: <ExamsView classes={teacher.classes} />,
    resources: <ResourcesView classes={teacher.classes} canPost byName={teacher.name} />,
    remarks: <RemarksView teacherId={teacher.id} />,
    messages: <MessagesView mode="teacher" teacherId={teacher.id} />,
    meetings: <MeetingsView mode="teacher" teacherId={teacher.id} />,
  };
}
