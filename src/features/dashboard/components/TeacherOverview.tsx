"use client";

import {
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  NotebookPen,
  Users,
} from "lucide-react";
import { useTeacherDashboard } from "@/features/dashboard/hooks/useTeacherDashboard";
import { firstNameOf, greeting } from "@/features/dashboard/utils/greeting";
import { Stat } from "@/shared/components";
import { ClassAttendanceCard } from "./teacher/ClassAttendanceCard";
import { ReviewQueueCard } from "./teacher/ReviewQueueCard";
import { TeacherExamsCard } from "./teacher/TeacherExamsCard";
import { TeacherScheduleCard } from "./teacher/TeacherScheduleCard";
import { DashboardBanner } from "./shared/DashboardBanner";

/** Teacher dashboard: today's lessons, attendance to mark and homework to review. */
export function TeacherOverview({ teacherId, go }: { teacherId: number; go: (id: string) => void }) {
  const stats = useTeacherDashboard(teacherId);
  const { teacher } = stats;

  const lessonCount = stats.todaysSchedule.length;
  const summary =
    `${lessonCount} lesson${lessonCount === 1 ? "" : "s"} today · ` +
    `${stats.toReview.length} homework PDF${stats.toReview.length === 1 ? "" : "s"} to review.`;

  return (
    <>
      <DashboardBanner
        title={`${greeting()}, ${firstNameOf(teacher.name)}`}
        summary={summary}
        go={go}
        actions={[
          { id: "attendance", label: "Mark attendance", icon: ClipboardCheck },
          { id: "homework", label: "Assign homework", icon: BookOpen },
          { id: "marks", label: "Enter marks", icon: NotebookPen },
          { id: "leaves", label: "Request leave", icon: CalendarCheck },
        ]}
      />

      <div className="stats">
        <Stat
          icon={GraduationCap}
          label="Assigned classes"
          value={teacher.classes.length}
          detail={teacher.homeroom ? `Class teacher of ${teacher.homeroom}` : teacher.dept}
        />
        <Stat
          icon={Users}
          label="Students"
          value={stats.myStudents.length}
          detail="Across assigned classes"
          tone="info"
        />
        <Stat
          icon={ClipboardCheck}
          label="Attendance marked"
          value={
            stats.myStudents.length
              ? `${Math.round((stats.markedTotal / stats.myStudents.length) * 100)}%`
              : "—"
          }
          detail={`${stats.markedTotal} of ${stats.myStudents.length} today`}
          tone="warn"
        />
        <Stat
          icon={FileText}
          label="PDFs to review"
          value={stats.toReview.length}
          detail={`${stats.openHomework.length} homework tasks open`}
          tone={stats.toReview.length ? "bad" : "ok"}
        />
      </div>

      <div className="grid-2">
        <TeacherScheduleCard stats={stats} go={go} />
        <ClassAttendanceCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <ReviewQueueCard stats={stats} go={go} />
        <TeacherExamsCard stats={stats} go={go} />
      </div>
    </>
  );
}
