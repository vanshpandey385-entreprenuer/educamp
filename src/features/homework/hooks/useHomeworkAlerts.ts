"use client";

import { useMemo } from "react";
import type { Submission } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";
import { teacherMayReview } from "../utils/review";

/**
 * Homework news for the notification bell.
 *
 *  - A teacher is told about PDFs waiting for their review.
 *  - A student or parent is told about decisions they have not looked at yet.
 *
 * These are worked out from the saved submissions, so nothing extra is stored.
 */
export function useHomeworkAlerts(): { toReview: Submission[]; newDecisions: Submission[] } {
  const { data, session } = useAppStore();

  return useMemo(() => {
    const empty = { toReview: [], newDecisions: [] };
    if (!session) return empty;

    if (session.role === "Teacher") {
      const teacher = data.teachers.find((t) => t.id === session.teacherId);
      const toReview = data.submissions.filter((submission) => {
        if (submission.status !== "Pending review") return false;
        const homework = data.homework.find((h) => h.id === submission.homeworkId);
        return homework ? teacherMayReview(teacher, homework) : false;
      });
      return { toReview, newDecisions: [] };
    }

    if (session.role === "Parent / Student") {
      const newDecisions = data.submissions.filter(
        (submission) =>
          submission.studentId === session.studentId &&
          submission.status !== "Pending review" &&
          !submission.studentSeen,
      );
      return { toReview: [], newDecisions };
    }

    return empty;
  }, [data.submissions, data.homework, data.teachers, session]);
}
