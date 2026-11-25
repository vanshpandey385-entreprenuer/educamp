"use client";

import { attendancePct } from "@/features/attendance/utils/studentAttendance";
import { PERIODS } from "@/config/school";
import { subjectAt, teacherFor } from "@/features/timetable/utils/timetable";
import { isoToday, weekdayIdx } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/** What a homework task looks like for one student. */
export type HomeworkState = "To do" | "Waiting for teacher" | "Submitted" | "Approved" | "Not approved";

/**
 * Everything the Student and the Parent dashboards show about one child.
 * Both dashboards use this hook, so the numbers are always the same.
 */
export function useFamilyDashboard(studentId: number) {
  const { data } = useAppStore();
  const today = isoToday();
  const student = data.students.find((s) => s.id === studentId)!;

  /* ───── Attendance ───── */
  const attendancePercent = attendancePct(data.attendance, student);

  /* ───── Homework, with the state of this student's PDF ───── */
  const homeworkRows = data.homework
    .filter((h) => h.cls === student.cls)
    .map((homework) => {
      const submission = data.submissions.find(
        (s) => s.homeworkId === homework.id && s.studentId === student.id,
      );
      let state: HomeworkState = "To do";
      if (submission)
        state = submission.status === "Pending review" ? "Waiting for teacher" : submission.status;
      else if (homework.done.includes(student.id)) state = "Submitted";
      return { homework, submission, state };
    })
    .sort((a, b) => a.homework.due.localeCompare(b.homework.due));

  // Work the student still has to hand in (or hand in again).
  const homeworkToDo = homeworkRows.filter((r) => r.state === "To do" || r.state === "Not approved");

  /* ───── Today's lessons for the class ───── */
  const weekday = weekdayIdx(today);
  const lessons =
    weekday > 4
      ? []
      : PERIODS.map((time, period) => {
          const subject = subjectAt(student.cls, weekday, period);
          return { period, time, subject, teacher: teacherFor(data.teachers, student.cls, subject) };
        });

  /* ───── Exams ───── */
  const upcomingExams = data.exams
    .filter((e) => e.cls === student.cls && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  /* ───── Fees, messages and teacher remarks (the parent dashboard uses these) ───── */
  const fee = data.fees.find((f) => f.studentId === student.id);
  const feeBalance = fee && fee.status !== "Paid" ? fee.amount : 0;
  const unreadMessages = data.messages.filter(
    (m) => m.studentId === student.id && m.from === "teacher" && !m.read,
  ).length;
  const remarks = data.remarks
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
    .map((remark) => ({ remark, teacher: data.teachers.find((t) => t.id === remark.teacherId) }));

  return {
    student,
    today,
    weekday,
    attendancePercent,
    homeworkRows,
    homeworkToDo,
    lessons,
    upcomingExams,
    fee,
    feeBalance,
    unreadMessages,
    remarks,
    notices: data.notices.slice(0, 3),
  };
}

export type FamilyDashboard = ReturnType<typeof useFamilyDashboard>;
