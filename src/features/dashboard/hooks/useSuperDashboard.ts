"use client";

import { useSchoolStats } from "@/features/platform/hooks/useSchoolStats";
import { useAppStore } from "@/store/AppStore";

/** Numbers for the Super Admin dashboard, worked out from the platform's real records. */
export function useSuperDashboard() {
  const { data } = useAppStore();
  const perSchool = useSchoolStats();

  const activeSchools = data.schools.filter((s) => s.status === "Active");
  const pendingSchools = data.schools.filter((s) => s.status === "Pending");
  const suspendedSchools = data.schools.filter((s) => s.status === "Suspended");

  // Students and teachers in every school, biggest school first.
  const schoolSizes = data.schools
    .map((school) => ({
      school,
      students: perSchool.get(school.id)?.students ?? 0,
      teachers: perSchool.get(school.id)?.teachers ?? 0,
    }))
    .sort((a, b) => b.students - a.students);

  const totalStudents = schoolSizes.reduce((sum, row) => sum + row.students, 0);
  const totalTeachers = schoolSizes.reduce((sum, row) => sum + row.teachers, 0);

  const openTickets = data.tickets.filter((t) => t.status !== "Resolved");
  const highPriorityTickets = openTickets.filter((t) => t.priority === "High");

  // How many schools are on each subscription plan.
  const plans = new Map<string, number>();
  for (const school of data.schools) plans.set(school.plan, (plans.get(school.plan) ?? 0) + 1);

  return {
    schools: data.schools,
    activeSchools,
    pendingSchools,
    suspendedSchools,
    schoolSizes,
    totalStudents,
    totalTeachers,
    openTickets,
    highPriorityTickets,
    plans: [...plans.entries()].map(([plan, count]) => ({ plan, count })),
  };
}

export type SuperDashboard = ReturnType<typeof useSuperDashboard>;
