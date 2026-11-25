"use client";

import { LifeBuoy, Plus } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { LinkBtn } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { isoToday } from "@/shared/lib/date";
import { Ticket } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Support tickets ───────────── */
export function SupportView() {
  const { data, update, notify, log } = useAppStore();
  const [tab, setTab] = useState<"All" | Ticket["status"]>("All");
  const [modal, setModal] = useState(false);
  const list = data.tickets
    .filter((t) => tab === "All" || t.status === tab)
    .sort((a, b) => b.created.localeCompare(a.created));
  const set = (t: Ticket, patch: Partial<Ticket>) => {
    update((d) => ({ tickets: d.tickets.map((x) => (x.id === t.id ? { ...x, ...patch } : x)) }));
    if (patch.status) {
      log(`Ticket "${t.topic}" (${t.school}) marked ${patch.status}`);
      notify(`Ticket marked ${patch.status.toLowerCase()}.`);
    }
  };
  return (
    <>
      <Card>
        <CardHead
          title="Platform support queue"
          sub="Requests from schools"
          action={
            <button className="btn-primary" onClick={() => setModal(true)}>
              <Plus size={15} /> New ticket
            </button>
          }
        />
        <div className="tabs">
          {(["All", "Open", "In progress", "Resolved"] as const).map((t) => (
            <button key={t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t}
              {t !== "All" ? ` (${data.tickets.filter((x) => x.status === t).length})` : ""}
            </button>
          ))}
        </div>
        <div className="ticket-list">
          {list.map((t) => (
            <article key={t.id}>
              <span className="notice-ico">
                <LifeBuoy size={17} />
              </span>
              <div className="grow">
                <b>
                  {t.topic}{" "}
                  <Pill tone={t.priority === "High" ? "bad" : t.priority === "Low" ? "muted" : "info"}>
                    {t.priority}
                  </Pill>
                </b>
                <small>
                  {t.school} · opened {t.created}
                </small>
                <p>{t.note}</p>
              </div>
              <Pill>{t.status}</Pill>
              <div className="row-gap">
                <select
                  className="select-sm"
                  value={t.priority}
                  aria-label="Priority"
                  onChange={(e) => set(t, { priority: e.target.value as Ticket["priority"] })}
                >
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </select>
                {t.status === "Open" && (
                  <LinkBtn onClick={() => set(t, { status: "In progress" })}>Start</LinkBtn>
                )}
                {t.status !== "Resolved" ? (
                  <LinkBtn onClick={() => set(t, { status: "Resolved" })}>Resolve</LinkBtn>
                ) : (
                  <LinkBtn onClick={() => set(t, { status: "Open" })}>Reopen</LinkBtn>
                )}
              </div>
            </article>
          ))}
          {!list.length && <Empty icon={LifeBuoy} title="No tickets here" />}
        </div>
      </Card>
      {modal && (
        <Modal title="New support ticket" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((d) => ({
                tickets: [
                  {
                    id: Date.now(),
                    school: String(f.get("school")),
                    topic: String(f.get("topic")),
                    status: "Open",
                    priority: f.get("priority") as Ticket["priority"],
                    note: String(f.get("note")),
                    created: isoToday(),
                  },
                  ...d.tickets,
                ],
              }));
              log(`Opened ticket: ${f.get("topic")}`);
              setModal(false);
              notify("Ticket created.");
            }}
          >
            <Field label="School">
              <select name="school">
                {data.schools.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <div className="form-2">
              <Field label="Topic">
                <input name="topic" required autoFocus />
              </Field>
              <Field label="Priority">
                <select name="priority" defaultValue="Normal">
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                </select>
              </Field>
            </div>
            <Field label="Details">
              <textarea name="note" rows={3} required />
            </Field>
            <button className="btn-primary btn-block">Create ticket</button>
          </form>
        </Modal>
      )}
    </>
  );
}
