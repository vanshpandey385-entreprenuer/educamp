"use client";

import { School } from "lucide-react";
import { SuperDashboard } from "@/features/dashboard/hooks/useSuperDashboard";
import { Card, CardHead, Empty, Progress } from "@/shared/components";

/** Horizontal bars: students in each school (the biggest eight). */
export function StudentsPerSchoolCard({ stats }: { stats: SuperDashboard }) {
  const rows = stats.schoolSizes.slice(0, 8);
  const biggest = Math.max(1, ...rows.map((row) => row.students));

  return (
    <Card>
      <CardHead
        title="Students per school"
        sub={`${stats.totalStudents.toLocaleString("en-IN")} students · ${stats.totalTeachers.toLocaleString("en-IN")} teachers`}
      />
      {rows.length ? (
        <div className="bars">
          {rows.map((row) => (
            <div key={row.school.id} className="bar-row wide-label">
              <span title={row.school.name}>{row.school.name}</span>
              <Progress value={(row.students / biggest) * 100} tone="lime" />
              <b>{row.students.toLocaleString("en-IN")}</b>
            </div>
          ))}
        </div>
      ) : (
        <Empty icon={School} title="No schools yet" />
      )}
    </Card>
  );
}
