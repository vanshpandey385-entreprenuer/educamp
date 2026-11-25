"use client";

import { Award, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { KIND_TONE } from "@/features/remarks/utils/remarkTone";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtLong, isoToday } from "@/shared/lib/date";
import { RemarkKind } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Teacher: remarks & behaviour ───────────── */
export function RemarksView({ teacherId }: { teacherId: number }) {
  const { data, update, notify, log } = useAppStore();
  const t = data.teachers.find((x) => x.id === teacherId)!;
  const [cls, setCls] = useState(t.classes[0]);
  const [modal, setModal] = useState(false);
  const roster = data.students.filter((s) => s.cls === cls).sort((a, b) => Number(a.roll) - Number(b.roll));
  const mine = data.remarks
    .filter((r) => r.teacherId === teacherId)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  return (
    <>
      <Card>
        <CardHead
          title="Remarks you have written"
          sub="Families see these in the student's Results page"
          action={
            <button className="btn-primary" onClick={() => setModal(true)}>
              <Plus size={15} /> New remark
            </button>
          }
        />
        <div className="mini-list big">
          {mine.map((r) => {
            const s = data.students.find((x) => x.id === r.studentId);
            return (
              <div key={r.id}>
                <Avatar name={s?.name ?? "?"} size={36} />
                <div className="grow">
                  <b>
                    {s?.name} <small className="inline">Class {s?.cls}</small>
                  </b>
                  <small>{r.text}</small>
                  <small>{fmtLong(r.date)}</small>
                </div>
                <Pill tone={KIND_TONE[r.kind]}>{r.kind}</Pill>
                <button
                  className="icon-btn danger"
                  aria-label="Delete remark"
                  onClick={() => update((d) => ({ remarks: d.remarks.filter((x) => x.id !== r.id) }))}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
          {!mine.length && (
            <Empty
              icon={Award}
              title="No remarks yet"
              text="Recognise good work or flag a concern for a family."
            />
          )}
        </div>
      </Card>
      {modal && (
        <Modal title="New remark" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const sid = Number(f.get("sid"));
              const s = data.students.find((x) => x.id === sid);
              update((d) => ({
                remarks: [
                  {
                    id: Date.now(),
                    studentId: sid,
                    teacherId,
                    kind: f.get("kind") as RemarkKind,
                    text: String(f.get("text")),
                    date: isoToday(),
                  },
                  ...d.remarks,
                ],
              }));
              log(`Wrote a ${String(f.get("kind")).toLowerCase()} remark for ${s?.name}`);
              setModal(false);
              notify("Remark saved. The family can now see it.");
            }}
          >
            <div className="form-2">
              <Field label="Class">
                <select value={cls} onChange={(e) => setCls(e.target.value)}>
                  {t.classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Student">
                <select name="sid" required>
                  {roster.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.roll}. {s.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Type">
              <select name="kind" defaultValue="Praise">
                <option>Praise</option>
                <option>Concern</option>
                <option>Note</option>
              </select>
            </Field>
            <Field label="Remark">
              <textarea
                name="text"
                rows={3}
                required
                maxLength={400}
                placeholder="Be specific and constructive."
              />
            </Field>
            <button className="btn-primary btn-block">Save remark</button>
          </form>
        </Modal>
      )}
    </>
  );
}
