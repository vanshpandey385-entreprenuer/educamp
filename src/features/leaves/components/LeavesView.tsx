"use client";

import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { addDays, fmtDate, isoToday, weekdayIdx } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Leave inbox ───────────── */
/** Every weekday between two dates (capped), used to mirror approved leave into the attendance records. */
function weekdaysBetween(from: string, to: string) {
  const out: string[] = [];
  for (let d = from, n = 0; d <= to && n < 45; d = addDays(d, 1), n++) if (weekdayIdx(d) <= 4) out.push(d);
  return out;
}

export function LeavesView({
  mode,
  personName,
  cls,
  studentId,
}: {
  mode: "admin" | "teacher" | "family";
  personName?: string;
  cls?: string;
  studentId?: number;
}) {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState(false);
  const [from, setFrom] = useState(isoToday());
  const list =
    mode === "admin"
      ? data.leaves
      : mode === "teacher"
        ? data.leaves.filter((l) => l.role === "Teacher" && l.person === personName)
        : data.leaves.filter((l) => l.studentId === studentId);

  function set(id: number, status: "Approved" | "Rejected") {
    const l = data.leaves.find((x) => x.id === id);
    update((d) => {
      const patch: Partial<typeof d> = { leaves: d.leaves.map((x) => (x.id === id ? { ...x, status } : x)) };
      if (l && status === "Approved") {
        const days = weekdaysBetween(l.from, l.to);
        if (l.role === "Student" && l.studentId != null) {
          const att = { ...d.attendance };
          for (const day of days) att[day] = { ...(att[day] ?? {}), [l.studentId]: "Leave" };
          patch.attendance = att;
        } else if (l.role === "Teacher") {
          const t = d.teachers.find((x) => x.name === l.person);
          if (t) {
            const ta = { ...d.teacherAtt };
            for (const day of days) ta[day] = { ...(ta[day] ?? {}), [t.id]: "On leave" };
            patch.teacherAtt = ta;
          }
        }
      }
      return patch;
    });
    log(`${status} leave for ${l?.person}`);
    notify(`Leave ${status.toLowerCase()}${status === "Approved" ? " and recorded in attendance" : ""}.`);
  }

  return (
    <>
      <Card>
        <CardHead
          title={mode === "admin" ? "Leave approval inbox" : "My leave requests"}
          sub={
            mode === "admin"
              ? "Teacher and student leave applications. Approved leave is marked in the attendance records."
              : "Track the School Admin's response"
          }
          action={
            mode !== "admin" && (
              <button className="btn-primary" onClick={() => setModal(true)}>
                <Plus size={15} /> Request leave
              </button>
            )
          }
        />
        <div className="leave-list">
          {list.map((l) => (
            <article key={l.id}>
              <Avatar name={l.person} size={40} />
              <div className="grow">
                <b>
                  {l.person} <Pill>{l.status}</Pill>
                </b>
                <small>
                  {l.role} · {l.cls} · {fmtDate(l.from)}
                  {l.to !== l.from ? ` – ${fmtDate(l.to)}` : ""}
                </small>
                <p>{l.reason}</p>
              </div>
              {mode === "admin" && l.status === "Pending" && (
                <div className="row-gap">
                  <button className="btn-approve" onClick={() => set(l.id, "Approved")}>
                    Approve
                  </button>
                  <button className="btn-reject" onClick={() => set(l.id, "Rejected")}>
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
          {!list.length && <Empty icon={CalendarDays} title="No leave requests" />}
        </div>
      </Card>
      {modal && (
        <Modal title="Leave application" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const st = studentId != null ? data.students.find((s) => s.id === studentId) : undefined;
              update((d) => ({
                leaves: [
                  {
                    id: Date.now(),
                    schoolId: UNSTAMPED,
                    person: st ? st.name : (personName ?? "Teacher"),
                    role: st ? "Student" : "Teacher",
                    cls: st ? st.cls : (cls ?? "—"),
                    from: String(f.get("from")),
                    to: String(f.get("to")),
                    reason: String(f.get("reason")),
                    status: "Pending",
                    studentId: st?.id,
                  },
                  ...d.leaves,
                ],
              }));
              setModal(false);
              notify("Leave request sent to School Admin.");
            }}
          >
            <div className="form-2">
              <Field label="From">
                <input
                  name="from"
                  type="date"
                  required
                  value={from}
                  min={isoToday()}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </Field>
              <Field label="To">
                <input name="to" type="date" required min={from} defaultValue={from} key={from} />
              </Field>
            </div>
            <Field label="Reason for leave">
              <textarea name="reason" rows={3} required />
            </Field>
            <button className="btn-primary btn-block">Send leave request</button>
          </form>
        </Modal>
      )}
    </>
  );
}
