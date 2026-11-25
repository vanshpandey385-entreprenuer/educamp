"use client";

import { Award, MessageSquareWarning } from "lucide-react";
import { KIND_TONE } from "@/features/remarks/utils/remarkTone";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtLong } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Family: remarks, report card, receipts ───────────── */
export function StudentRemarks({ studentId }: { studentId: number }) {
  const { data } = useAppStore();
  const list = data.remarks
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <Card>
      <CardHead title="Teacher remarks" sub="Feedback from your teachers" />
      <div className="mini-list">
        {list.map((r) => (
          <div key={r.id}>
            <span className="notice-ico">
              <MessageSquareWarning size={16} />
            </span>
            <div className="grow">
              <b>{data.teachers.find((t) => t.id === r.teacherId)?.name ?? "Teacher"}</b>
              <small>{r.text}</small>
              <small>{fmtLong(r.date)}</small>
            </div>
            <Pill tone={KIND_TONE[r.kind]}>{r.kind}</Pill>
          </div>
        ))}
        {!list.length && <Empty icon={Award} title="No remarks yet" />}
      </div>
    </Card>
  );
}
