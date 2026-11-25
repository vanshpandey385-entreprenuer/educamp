"use client";

import { classTeacherOf, slotsOf } from "@/features/timetable/utils/timetable";
import { teacherMayReview } from "@/features/homework/utils/review";
import { isoToday, weekdayIdx } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/** Everything the Teacher dashboard shows, worked out from the teacher's own classes. */
export function useTeacherDashboard(teacherId: number) {
  const { data } = useAppStore();
  const today = isoToday();
  const teacher = data.teachers.find((t) => t.id === teacherId)!;

  /* ───── Students in the classes this teacher teaches ───── */
  const myStudents = data.students.filter((s) => teacher.classes.includes(s.cls));
  const todayRecord = data.attendance[today] ?? {};

  // One row per class: how many students, how many marked, how many present.
  const classRows = teacher.classes.map((cls) => {
    const students = data.students.filter((s) => s.cls === cls);
    const marked = students.filter((s) => todayRecord[s.id]);
    const present = marked.filter((s) => todayRecord[s.id] === "Present");
    return {
      cls,
      total: students.length,
      marked: marked.length,
      present: present.length,
      isClassTeacher: classTeacherOf(data.teachers, cls)?.id === teacher.id,
    };
  });
  const markedTotal = classRows.reduce((sum, row) => sum + row.marked, 0);

  /* ───── Today's lessons and any cover periods ───── */
  const weekday = weekdayIdx(today);
  const lessons = slotsOf(teacher, weekday).map((slot) => ({ ...slot, isCover: false }));
  const coverLessons = data.substitutions
    .filter((x) => x.date === today && x.subId === teacher.id)
    .map((x) => ({ cls: x.cls, period: x.period, isCover: true }));
  const todaysSchedule = [...lessons, ...coverLessons].sort((a, b) => a.period - b.period);

  /* ───── Homework: PDFs waiting for this teacher's decision ───── */
  const homeworkIds = new Set(data.homework.filter((h) => teacherMayReview(teacher, h)).map((h) => h.id));
  const toReview = data.submissions
    .filter((s) => s.status === "Pending review" && homeworkIds.has(s.homeworkId))
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .map((submission) => ({
      submission,
      student: data.students.find((s) => s.id === submission.studentId),
      homework: data.homework.find((h) => h.id === submission.homeworkId),
    }));

  const myHomework = data.homework.filter((h) => teacher.classes.includes(h.cls));
  const openHomework = myHomework.filter((h) => h.due >= today);

  /* ───── Upcoming exams in this teacher's classes ───── */
  const upcomingExams = data.exams
    .filter((e) => teacher.classes.includes(e.cls) && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);

  return {
    teacher,
    today,
    weekday,
    myStudents,
    classRows,
    markedTotal,
    todaysSchedule,
    toReview,
    openHomework,
    upcomingExams,
  };
}

export type TeacherDashboard = ReturnType<typeof useTeacherDashboard>;
