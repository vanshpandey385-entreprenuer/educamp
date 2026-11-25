"use client";

import { Bell, Pin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { todayLabel } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { Audience, NoticeType } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Notices ───────────── */
const NOTICE_TYPES: NoticeType[] = ["General", "Holiday", "PTM", "Event", "Exam"];

const AUDIENCES: Audience[] = ["Everyone", "Parents & students", "Teachers"];

export function Notices({
  canEdit,
  viewer = "admin",
}: {
  canEdit: boolean;
  viewer?: "admin" | "teacher" | "family";
}) {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState(false);
  const visible = data.notices
    .filter(
      (n) =>
        viewer === "admin" ||
        !n.audience ||
        n.audience === "Everyone" ||
        (viewer === "teacher" && n.audience === "Teachers") ||
        (viewer === "family" && n.audience === "Parents & students"),
    )
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  function publish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    update((d) => ({
      notices: [
        {
          id: Date.now(),
          schoolId: UNSTAMPED,
          title: String(f.get("title")),
          body: String(f.get("body")),
          type: f.get("type") as NoticeType,
          audience: f.get("audience") as Audience,
          pinned: f.get("pinned") === "on",
          date: todayLabel(),
        },
        ...d.notices,
      ],
    }));
    log(`Published notice: ${f.get("title")} (${f.get("audience")})`);
    setModal(false);
    notify("Notice published.");
  }

  return (
    <>
      <Card>
        <CardHead
          title="School circulars & notices"
          sub="Official updates published by the school"
          action={
            canEdit && (
              <button className="btn-primary" onClick={() => setModal(true)}>
                <Plus size={15} /> Publish notice
              </button>
            )
          }
        />
        <div className="notice-list">
          {visible.map((n) => (
            <article key={n.id}>
              <span className="notice-ico">
                <Bell size={17} />
              </span>
              <div className="grow">
                <h3>
                  {n.pinned && <Pin size={13} className="pin-ico" />}
                  {n.title}
                </h3>
                <p>{n.body}</p>
                <small>
                  {n.date}
                  {canEdit && n.audience && n.audience !== "Everyone"
                    ? ` · For ${n.audience.toLowerCase()}`
                    : ""}
                </small>
              </div>
              <Pill>{n.type}</Pill>
              {canEdit && (
                <button
                  className="icon-btn"
                  aria-label={n.pinned ? `Unpin ${n.title}` : `Pin ${n.title}`}
                  onClick={() =>
                    update((d) => ({
                      notices: d.notices.map((x) => (x.id === n.id ? { ...x, pinned: !x.pinned } : x)),
                    }))
                  }
                >
                  <Pin size={15} />
                </button>
              )}
              {canEdit && (
                <button
                  className="icon-btn danger"
                  aria-label={`Delete ${n.title}`}
                  onClick={() => update((d) => ({ notices: d.notices.filter((x) => x.id !== n.id) }))}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </article>
          ))}
          {!visible.length && (
            <Empty icon={Bell} title="No notices yet" text="Published notices appear here." />
          )}
        </div>
      </Card>
      {modal && (
        <Modal title="Publish school notice" onClose={() => setModal(false)}>
          <form onSubmit={publish} className="form">
            <Field label="Notice title">
              <input name="title" required autoFocus />
            </Field>
            <div className="form-2">
              <Field label="Notice type">
                <select name="type" defaultValue="General">
                  {NOTICE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Send to">
                <select name="audience" defaultValue="Everyone">
                  {AUDIENCES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Details">
              <textarea name="body" rows={4} required />
            </Field>
            <label className="toggle-row">
              <input type="checkbox" name="pinned" /> Pin to the top of the notice board
            </label>
            <button className="btn-primary btn-block">Publish notice</button>
          </form>
        </Modal>
      )}
    </>
  );
}
