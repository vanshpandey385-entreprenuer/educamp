"use client";

import { CalendarDays, Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { fmtLong, isoToday } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Exam schedule ───────────── */
export function ExamsView({ classes, canEdit }: { classes: string[]; canEdit?: boolean }) {
  const { data, update, notify, log } = useAppStore();
  const allClasses = useClasses();
  const [cls, setCls] = useState(classes[0] ?? allClasses[0]);
  const [modal, setModal] = useState(false);
  const rows = data.exams.filter((e) => e.cls === cls).sort((a, b) => a.date.localeCompare(b.date));
  const days = (iso: string) =>
    Math.ceil(
      (new Date(iso + "T00:00:00").getTime() - new Date(isoToday() + "T00:00:00").getTime()) / 86400000,
    );
  return (
    <>
      <Card>
        <CardHead
          title="Term 2 examination schedule"
          sub={`Class ${cls}`}
          action={
            <div className="row-gap">
              {classes.length > 1 && (
                <select
                  className="select-sm"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  aria-label="Class"
                >
                  {classes.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
              <button
                className="btn-ghost"
                onClick={() =>
                  downloadCsv(`exam-schedule-${cls.replace(" ", "")}.csv`, [
                    ["Class", "Subject", "Date", "Time", "Room"],
                    ...rows.map((e) => [e.cls, e.subject, e.date, e.time, e.room]),
                  ])
                }
              >
                <Download size={15} /> Export
              </button>
              {canEdit && (
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <Plus size={15} /> Add exam
                </button>
              )}
            </div>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Room</th>
                <th>Countdown</th>
                {canEdit && <th />}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const d = days(e.date);
                return (
                  <tr key={e.id}>
                    <td>
                      <b>{e.subject}</b>
                    </td>
                    <td>{fmtLong(e.date)}</td>
                    <td className="mono">{e.time}</td>
                    <td>{e.room}</td>
                    <td>
                      <Pill tone={d < 0 ? "muted" : d <= 7 ? "warn" : "info"}>
                        {d < 0 ? "Completed" : d === 0 ? "Today" : `In ${d} day${d === 1 ? "" : "s"}`}
                      </Pill>
                    </td>
                    {canEdit && (
                      <td>
                        <button
                          className="icon-btn danger"
                          aria-label={`Delete ${e.subject} exam`}
                          onClick={() => {
                            update((x) => ({ exams: x.exams.filter((y) => y.id !== e.id) }));
                            log(`Removed ${e.subject} exam for Class ${e.cls}`);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <Empty
              icon={CalendarDays}
              title="No exams scheduled"
              text="The timetable will appear here once published."
            />
          )}
        </div>
      </Card>
      {modal && (
        <Modal title="Add exam" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((d) => ({
                exams: [
                  ...d.exams,
                  {
                    id: Date.now(),
                    schoolId: UNSTAMPED,
                    cls: String(f.get("cls")),
                    subject: String(f.get("subject")),
                    date: String(f.get("date")),
                    time: String(f.get("time")),
                    room: String(f.get("room")),
                  },
                ],
              }));
              log(`Scheduled ${f.get("subject")} exam for Class ${f.get("cls")}`);
              setModal(false);
              notify("Exam added.");
            }}
          >
            <div className="form-2">
              <Field label="Class">
                <select name="cls" defaultValue={cls}>
                  {allClasses.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <input name="subject" required autoFocus />
              </Field>
            </div>
            <div className="form-2">
              <Field label="Date">
                <input name="date" type="date" required />
              </Field>
              <Field label="Time">
                <input name="time" required defaultValue="09:00 – 11:00" />
              </Field>
            </div>
            <Field label="Room">
              <input name="room" required placeholder="Room 101" />
            </Field>
            <button className="btn-primary btn-block">Add exam</button>
          </form>
        </Modal>
      )}
    </>
  );
}
