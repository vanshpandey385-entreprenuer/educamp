"use client";

import { GRADES, gradeOfClass } from "@/config/school";
import { uncoveredLessons } from "@/features/timetable/utils/timetable";
import { isoToday } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/** How many recorded school days the attendance chart shows. */
const TREND_DAYS = 7;

/** How many upcoming events and recent activity lines the dashboard shows. */
const EVENT_COUNT = 4;
const ACTIVITY_COUNT = 5;

/**
 * Every number the Admin dashboard shows, worked out from the school's real data.
 * Nothing here is made up: if there is no data yet, the values are zero or empty.
 */
export function useAdminDashboard() {
  const { data } = useAppStore();
  const today = isoToday();

  /* ───── Students ───── */
  const todayRecord = data.attendance[today] ?? {};
  const markedToday = data.students.filter((s) => todayRecord[s.id]);
  const presentToday = markedToday.filter((s) => todayRecord[s.id] === "Present").length;
  const attendancePercent = markedToday.length ? (presentToday / markedToday.length) * 100 : 0;

  // Number of students in each grade (Class 1, Class 2 …)
  const studentsByGrade = GRADES.map((grade) => ({
    grade,
    count: data.students.filter((s) => gradeOfClass(s.cls) === grade).length,
  }));

  /* ───── Attendance trend: the last recorded days, oldest first ───── */
  const recordedDates = Object.keys(data.attendance)
    .filter((date) => date <= today && Object.keys(data.attendance[date] ?? {}).length > 0)
    .sort()
    .slice(-TREND_DAYS);

  const attendanceTrend = recordedDates.map((date) => {
    const record = data.attendance[date];
    const marked = data.students.filter((s) => record[s.id]);
    const present = marked.filter((s) => record[s.id] === "Present").length;
    return {
      date,
      percent: marked.length ? Math.round((present / marked.length) * 100) : null,
    };
  });

  /* ───── Teachers ───── */
  const teacherRecord = data.teacherAtt[today] ?? {};
  const staffPresent = data.teachers.filter((t) => teacherRecord[t.id] === "Present").length;
  const staffAbsent = data.teachers.filter((t) => teacherRecord[t.id] === "Absent").length;
  const staffOnLeave = data.teachers.filter((t) => teacherRecord[t.id] === "On leave").length;
  const staffNotMarked = data.teachers.filter((t) => !teacherRecord[t.id]).length;
  const lessonsNeedingCover = uncoveredLessons(data, today);

  /* ───── Fees ───── */
  const paidFees = data.fees.filter((f) => f.status === "Paid");
  const pendingFees = data.fees.filter((f) => f.status === "Pending");
  const overdueFees = data.fees.filter((f) => f.status === "Overdue");
  const sumOf = (list: { amount: number }[]) => list.reduce((total, f) => total + f.amount, 0);

  const collectedAmount = sumOf(paidFees);
  const pendingAmount = sumOf(pendingFees);
  const overdueAmount = sumOf(overdueFees);
  const outstandingAmount = pendingAmount + overdueAmount;
  const totalAmount = collectedAmount + outstandingAmount;
  const collectedPercent = totalAmount ? Math.round((collectedAmount / totalAmount) * 100) : 0;

  /* ───── Leaves ───── */
  const pendingLeaves = data.leaves.filter((l) => l.status === "Pending").length;

  /* ───── Upcoming events (today or later, soonest first) ───── */
  const upcomingEvents = data.events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, EVENT_COUNT);

  /* ───── Recent activity (newest first) ───── */
  const recentActivity = [...data.activity].sort((a, b) => b.at - a.at).slice(0, ACTIVITY_COUNT);

  /* ───── Latest notices ───── */
  const latestNotices = data.notices.slice(0, 3);

  return {
    today,

    studentCount: data.students.length,
    teacherCount: data.teachers.length,
    markedToday: markedToday.length,
    presentToday,
    attendancePercent,
    studentsByGrade,
    attendanceTrend,

    staffPresent,
    staffAbsent,
    staffOnLeave,
    staffNotMarked,
    lessonsNeedingCover,

    paidCount: paidFees.length,
    pendingCount: pendingFees.length,
    overdueCount: overdueFees.length,
    overdueFees,
    collectedAmount,
    pendingAmount,
    overdueAmount,
    outstandingAmount,
    collectedPercent,

    pendingLeaves,
    upcomingEvents,
    recentActivity,
    latestNotices,
  };
}

export type AdminDashboard = ReturnType<typeof useAdminDashboard>;
