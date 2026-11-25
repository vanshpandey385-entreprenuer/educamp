"use client";

import { BookOpen, CalendarDays, ClipboardCheck, GraduationCap, QrCode, TrendingUp } from "lucide-react";
import { useFamilyDashboard } from "@/features/dashboard/hooks/useFamilyDashboard";
import { firstNameOf, greeting } from "@/features/dashboard/utils/greeting";
import { Stat } from "@/shared/components";
import { AttendanceSnapshotCard } from "./family/AttendanceSnapshotCard";
import { FamilyExamsCard } from "./family/FamilyExamsCard";
import { FamilyNoticesCard } from "./family/FamilyNoticesCard";
import { HomeworkStatusCard } from "./family/HomeworkStatusCard";
import { LessonsTodayCard } from "./family/LessonsTodayCard";
import { ProgressCard } from "./family/ProgressCard";
import { DashboardBanner } from "./shared/DashboardBanner";

/** Student dashboard: lessons, homework, exams and progress. No fees: those belong to the parent. */
export function StudentOverview({ studentId, go }: { studentId: number; go: (id: string) => void }) {
  const stats = useFamilyDashboard(studentId);
  const { student } = stats;

  const todo = stats.homeworkToDo.length;
  const summary = `Class ${student.cls} · Roll ${student.roll} · ${todo} homework task${todo === 1 ? "" : "s"} to hand in.`;

  return (
    <>
      <DashboardBanner
        title={`${greeting()}, ${firstNameOf(student.name)}`}
        summary={summary}
        go={go}
        actions={[
          { id: "homework", label: "My homework", icon: BookOpen },
          { id: "timetable", label: "Timetable", icon: CalendarDays },
          { id: "results", label: "Results", icon: TrendingUp },
          { id: "id", label: "Digital ID", icon: QrCode },
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
          icon={GraduationCap}
          label="Current class"
          value={student.cls}
          detail={`Roll number ${student.roll}`}
          tone="info"
        />
        <Stat
          icon={BookOpen}
          label="Homework to hand in"
          value={todo}
          detail={todo ? "Add your PDF in Homework" : "All done"}
          tone={todo ? "warn" : "ok"}
        />
        <Stat
          icon={TrendingUp}
          label="Overall progress"
          value={`${student.avg}%`}
          detail="Latest assessment"
          tone="info"
        />
      </div>

      <div className="grid-2">
        <LessonsTodayCard stats={stats} go={go} />
        <HomeworkStatusCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <AttendanceSnapshotCard stats={stats} go={go} />
        <ProgressCard stats={stats} go={go} />
      </div>

      <div className="grid-2">
        <FamilyExamsCard stats={stats} go={go} />
        <FamilyNoticesCard stats={stats} go={go} />
      </div>
    </>
  );
}
