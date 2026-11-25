"use client";

import { CalendarClock, Check, Plus, Trash2, Users, X } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtDate, fmtLong, isoToday } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Parent meetings ───────────── */
export function MeetingsView({
  mode,
  studentId,
  teacherId,
  canBook = true,
}: {
  mode: "family" | "teacher";
  studentId?: number;
  teacherId?: number;
  canBook?: boolean;
}) {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState(false);
  const student = data.students.find((s) => s.id === studentId);
  const upcoming = (d: string) => d >= isoToday();

  if (mode === "teacher") {
    const mine = data.slots
      .filter((s) => s.teacherId === teacherId)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const booked = mine.filter((s) => s.bookedBy != null).length;
    return (
      <>
        <Card>
          <CardHead
            title="My meeting slots"
            sub={`${mine.length} slots · ${booked} booked`}
            action={
              <button className="btn-primary" onClick={() => setModal(true)}>
                <Plus size={15} /> Add slot
              </button>
            }
          />
          <div className="mini-list big">
            {mine.map((s) => {
              const who = data.students.find((x) => x.id === s.bookedBy);
              return (
                <div key={s.id}>
                  <span className="notice-ico">
                    <CalendarClock size={17} />
                  </span>
                  <div className="grow">
                    <b>
                      {fmtLong(s.date)} · {s.time}
                    </b>
                    <small>
                      {who
                        ? `Booked by ${who.guardian} (parent of ${who.name}, ${who.cls})`
                        : "Open for booking"}
                    </small>
                  </div>
                  <Pill tone={who ? "ok" : "muted"}>{who ? "Booked" : "Open"}</Pill>
                  <button
                    className="icon-btn danger"
                    aria-label="Delete slot"
                    onClick={() => update((d) => ({ slots: d.slots.filter((x) => x.id !== s.id) }))}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
            {!mine.length && (
              <Empty
                icon={CalendarClock}
                title="No slots yet"
                text="Add slots so parents can book a meeting."
              />
            )}
          </div>
        </Card>
        {modal && (
          <Modal title="Add meeting slot" onClose={() => setModal(false)}>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                update((d) => ({
                  slots: [
                    ...d.slots,
                    {
                      id: Date.now(),
                      teacherId: teacherId!,
                      date: String(f.get("date")),
                      time: `${f.get("from")} – ${f.get("to")}`,
                    },
                  ],
                }));
                log("Added a parent-meeting slot");
                setModal(false);
                notify("Slot added.");
              }}
            >
              <Field label="Date">
                <input name="date" type="date" min={isoToday()} required />
              </Field>
              <div className="form-2">
                <Field label="From">
                  <input name="from" type="time" required defaultValue="16:00" />
                </Field>
                <Field label="To">
                  <input name="to" type="time" required defaultValue="16:15" />
                </Field>
              </div>
              <button className="btn-primary btn-block">Add slot</button>
            </form>
          </Modal>
        )}
      </>
    );
  }

  const teachers = data.teachers.filter((t) => student && t.classes.includes(student.cls));
  return (
    <div className="grid-2">
      {teachers.map((t) => {
        const slots = data.slots
          .filter((s) => s.teacherId === t.id && upcoming(s.date))
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        const mineBooked = slots.find((s) => s.bookedBy === studentId);
        return (
          <Card key={t.id}>
            <CardHead
              title={t.name}
              sub={`${t.dept} · available slots`}
              action={mineBooked && <Pill tone="ok">You have a booking</Pill>}
            />
            <div className="mini-list">
              {slots.map((s) => {
                const isMine = s.bookedBy === studentId,
                  taken = s.bookedBy != null && !isMine;
                return (
                  <div key={s.id}>
                    <span className="time-chip">{fmtDate(s.date)}</span>
                    <div className="grow">
                      <b>{s.time}</b>
                      <small>{fmtLong(s.date)}</small>
                    </div>
                    {isMine ? (
                      canBook ? (
                        <button
                          className="btn-ghost"
                          onClick={() => {
                            update((d) => ({
                              slots: d.slots.map((x) => (x.id === s.id ? { ...x, bookedBy: undefined } : x)),
                            }));
                            notify("Booking cancelled.");
                          }}
                        >
                          <X size={14} /> Cancel
                        </button>
                      ) : (
                        <Pill tone="ok">Booked</Pill>
                      )
                    ) : taken ? (
                      <Pill tone="muted">Taken</Pill>
                    ) : canBook ? (
                      <button
                        className="btn-primary btn-sm"
                        disabled={!!mineBooked}
                        onClick={() => {
                          update((d) => ({
                            slots: d.slots.map((x) => (x.id === s.id ? { ...x, bookedBy: studentId } : x)),
                          }));
                          log(`Booked a meeting with ${t.name}`);
                          notify(`Meeting booked with ${t.name}.`);
                        }}
                      >
                        <Check size={14} /> Book
                      </button>
                    ) : (
                      <Pill tone="info">Open</Pill>
                    )}
                  </div>
                );
              })}
              {!slots.length && (
                <Empty
                  icon={CalendarClock}
                  title="No open slots"
                  text="This teacher hasn't published meeting times yet."
                />
              )}
            </div>
            {mineBooked && !canBook && (
              <p className="muted-p">Booked meetings can be changed by a parent or guardian.</p>
            )}
          </Card>
        );
      })}
      {!teachers.length && (
        <Card>
          <Empty icon={Users} title="No teachers assigned" />
        </Card>
      )}
    </div>
  );
}
