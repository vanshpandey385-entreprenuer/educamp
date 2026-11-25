"use client";

import { Megaphone } from "lucide-react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { fmtDateTime, todayLabel } from "@/shared/lib/date";
import { NoticeType } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Broadcasts ───────────── */
export function BroadcastView() {
  const { data, update, notify, log } = useAppStore();
  const active = data.schools.filter((s) => s.status === "Active");
  const past = data.activity.filter((a) => a.action.startsWith("Broadcast:")).slice(0, 6);
  return (
    <div className="grid-side">
      <Card>
        <CardHead
          title="Send a platform announcement"
          sub={`Appears on the notice board of ${active.length} active schools`}
        />
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const title = `[Platform] ${f.get("title")}`;
            update((d) => ({
              notices: [
                ...active.map((s, i) => ({
                  id: Date.now() + i,
                  schoolId: s.id,
                  title,
                  body: String(f.get("body")),
                  type: f.get("type") as NoticeType,
                  date: todayLabel(),
                  audience: "Everyone" as const,
                  pinned: f.get("pinned") === "on",
                })),
                ...d.notices,
              ],
            }));
            log(`Broadcast: ${f.get("title")} → ${active.length} schools`);
            notify(`Announcement sent to ${active.length} schools.`);
            e.currentTarget.reset();
          }}
        >
          <Field label="Title">
            <input name="title" required placeholder="Scheduled maintenance on Sunday" />
          </Field>
          <Field label="Type">
            <select name="type" defaultValue="General">
              <option>General</option>
              <option>Holiday</option>
              <option>Event</option>
              <option>Exam</option>
            </select>
          </Field>
          <Field label="Message">
            <textarea name="body" rows={4} required />
          </Field>
          <label className="toggle-row">
            <input type="checkbox" name="pinned" /> Pin to the top of every school's notice board
          </label>
          <button className="btn-primary btn-block">
            <Megaphone size={15} /> Send to all schools
          </button>
        </form>
      </Card>
      <Card>
        <CardHead title="Recent broadcasts" />
        <div className="mini-list">
          {past.map((a) => (
            <div key={a.id}>
              <span className="notice-ico">
                <Megaphone size={16} />
              </span>
              <div className="grow">
                <b>{a.action.replace("Broadcast: ", "")}</b>
                <small>{fmtDateTime(a.at)}</small>
              </div>
            </div>
          ))}
          {!past.length && <Empty icon={Megaphone} title="No broadcasts yet" />}
        </div>
      </Card>
    </div>
  );
}
