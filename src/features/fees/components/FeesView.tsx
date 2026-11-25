"use client";

import { AlertCircle, BellRing, CheckCircle2, CreditCard, Download, ShieldAlert, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GRADES, gradeOfClass } from "@/config/school";
import { exportFeesCsv } from "@/features/fees/utils/exportFees";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { LinkBtn } from "@/shared/components";
import { Pager } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { Stat } from "@/shared/components";
import { fmtDate } from "@/shared/lib/date";
import { money } from "@/shared/lib/format";
import { PAGE_SIZE } from "@/shared/lib/pagination";
import { Fee } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function FeesView() {
  const { data, update, notify, log } = useAppStore();
  const [q, setQ] = useState(""),
    [page, setPage] = useState(0),
    [grade, setGrade] = useState(0);
  const [tab, setTab] = useState<"All" | "Paid" | "Pending" | "Overdue">("All");
  const byId = useMemo(() => new Map(data.students.map((s) => [s.id, s])), [data.students]);
  const rows = useMemo(
    () =>
      data.fees
        .map((f) => ({ f, s: byId.get(f.studentId) }))
        .filter(
          ({ f, s }) =>
            s &&
            (tab === "All" || f.status === tab) &&
            (!grade || gradeOfClass(s.cls) === grade) &&
            `${s.name} ${s.cls}`.toLowerCase().includes(q.toLowerCase()),
        ),
    [data.fees, byId, tab, grade, q],
  );
  useEffect(() => setPage(0), [q, tab, grade]);
  const cnt = (st: string) => data.fees.filter((f) => f.status === st).length;
  const outstanding = data.fees.filter((f) => f.status !== "Paid").reduce((a, f) => a + f.amount, 0);
  const remind = (ids: number[]) => {
    update((d) => ({
      fees: d.fees.map((x) => (ids.includes(x.id) ? { ...x, reminded: (x.reminded ?? 0) + 1 } : x)),
    }));
    log(`Sent fee reminders to ${ids.length} famil${ids.length === 1 ? "y" : "ies"}`);
    notify(
      `Reminder sent to ${ids.length} famil${ids.length === 1 ? "y" : "ies"} (demo: no SMS or email is sent).`,
    );
  };
  return (
    <>
      <div className="stats">
        <Stat
          icon={CheckCircle2}
          label="Paid accounts"
          value={cnt("Paid").toLocaleString("en-IN")}
          detail="Payment recorded"
        />
        <Stat
          icon={AlertCircle}
          label="Pending accounts"
          value={cnt("Pending").toLocaleString("en-IN")}
          detail="Not yet paid"
          tone="warn"
        />
        <Stat
          icon={ShieldAlert}
          label="Overdue accounts"
          value={cnt("Overdue").toLocaleString("en-IN")}
          detail="Past due date"
          tone="bad"
        />
        <Stat
          icon={Wallet}
          label="Outstanding amount"
          value={money(outstanding)}
          detail="Total due"
          tone="info"
        />
      </div>
      <Card>
        <CardHead
          title="Fee payment register"
          sub="Update a student's status after confirming receipt"
          action={
            <div className="row-gap">
              <button
                className="btn-ghost"
                disabled={!cnt("Overdue")}
                onClick={() => remind(data.fees.filter((f) => f.status === "Overdue").map((f) => f.id))}
              >
                <BellRing size={15} /> Remind all overdue
              </button>
              <button
                className="btn-ghost"
                onClick={() => {
                  exportFeesCsv(data);
                  notify("CSV downloaded.");
                }}
              >
                <Download size={15} /> Export
              </button>
            </div>
          }
        />
        <div className="filters">
          <SearchBox value={q} onChange={setQ} placeholder="Search student or class" />
          <select
            className="select-sm"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            aria-label="Class"
          >
            <option value={0}>All classes</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
        </div>
        <div className="tabs">
          {(["All", "Paid", "Pending", "Overdue"] as const).map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Amount</th>
                <th>Due date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map(({ f, s }) => (
                <tr key={f.id}>
                  <td>
                    <div className="who">
                      <Avatar name={s?.name ?? "?"} />
                      <div>
                        <b>{s?.name}</b>
                        {f.reminded ? <small>Reminded {f.reminded}×</small> : null}
                      </div>
                    </div>
                  </td>
                  <td>{s?.cls}</td>
                  <td>
                    <b>{money(f.amount)}</b>
                  </td>
                  <td>{fmtDate(f.due)}</td>
                  <td>
                    <Pill>{f.status}</Pill>
                  </td>
                  <td>
                    {f.status !== "Paid" && (
                      <div className="row-gap">
                        <LinkBtn onClick={() => remind([f.id])}>Remind</LinkBtn>
                        <LinkBtn
                          onClick={() => {
                            update((d) => ({
                              fees: d.fees.map((x): Fee => (x.id === f.id ? { ...x, status: "Paid" } : x)),
                            }));
                            log(`Marked fee paid for ${s?.name}`);
                            notify("Fee marked as paid (demo only, no payment collected).");
                          }}
                        >
                          Mark as paid
                        </LinkBtn>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty icon={CreditCard} title="No fee records match" />}
        </div>
        <Pager page={page} total={rows.length} size={PAGE_SIZE} onPage={setPage} />
      </Card>
    </>
  );
}
