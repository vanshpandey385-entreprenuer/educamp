"use client";

import { CheckCircle2, Download } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtDateTime } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Audit / activity log ───────────── */
export function AuditView() {
  const { data } = useAppStore();
  const [q, setQ] = useState("");
  const rows = data.activity.filter((a) =>
    `${a.who} ${a.role} ${a.action}`.toLowerCase().includes(q.toLowerCase()),
  );
  const schoolName = (id?: number | null) => data.schools.find((s) => s.id === id)?.name ?? "Platform";
  return (
    <Card>
      <CardHead
        title="Activity log"
        sub="Important actions, newest first"
        action={
          <div className="row-gap">
            <SearchBox value={q} onChange={setQ} placeholder="Search activity" />
            <button
              className="btn-ghost"
              onClick={() =>
                downloadCsv("activity-log.csv", [
                  ["When", "Who", "Role", "School", "Action"],
                  ...rows.map((a) => [
                    new Date(a.at).toISOString(),
                    a.who,
                    a.role,
                    schoolName(a.schoolId),
                    a.action,
                  ]),
                ])
              }
            >
              <Download size={15} /> Export
            </button>
          </div>
        }
      />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>School</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 100).map((a) => (
              <tr key={a.id}>
                <td className="nowrap">{fmtDateTime(a.at)}</td>
                <td>
                  <b>{a.who}</b>
                  <small className="sub-line">{a.role}</small>
                </td>
                <td>{a.action}</td>
                <td>{schoolName(a.schoolId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty icon={CheckCircle2} title="No activity recorded" />}
      </div>
      <p className="muted-p">
        Showing the latest {Math.min(100, rows.length)} entries. This log lives in the browser; a production
        system keeps it on the server.
      </p>
    </Card>
  );
}
