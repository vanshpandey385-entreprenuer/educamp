import { downloadCsv } from "@/shared/lib/csv";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Fees / reports ───────────── */
export function exportFeesCsv(data: ReturnType<typeof useAppStore>["data"]) {
  const byId = new Map(data.students.map((s) => [s.id, s]));
  downloadCsv("efficht-fees-report.csv", [
    ["Student", "Class", "Amount", "Due date", "Status"],
    ...data.fees.map((f) => {
      const s = byId.get(f.studentId);
      return [s?.name ?? "", s?.cls ?? "", String(f.amount), f.due, f.status];
    }),
  ]);
}
