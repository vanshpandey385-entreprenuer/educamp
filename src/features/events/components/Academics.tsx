"use client";

import { GraduationCap, Plus, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtLong } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Academics & sports ───────────── */
export function Academics() {
  const { data, update, notify, log } = useAppStore();
  const [title, setTitle] = useState(""),
    [date, setDate] = useState(""),
    [venue, setVenue] = useState(""),
    [kind, setKind] = useState<"Sports" | "Academic">("Sports");
  const events = [...data.events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="grid-side">
      <Card>
        <CardHead
          title="Academics & sports calendar"
          sub="School events, inter-house competitions and academic programmes"
        />
        <div className="mini-list big">
          {events.map((e) => (
            <div key={e.id}>
              <span className={`notice-ico ${e.kind === "Sports" ? "lime" : ""}`}>
                {e.kind === "Sports" ? <Trophy size={17} /> : <GraduationCap size={17} />}
              </span>
              <div className="grow">
                <b>{e.title}</b>
                <small>
                  {fmtLong(e.date)} · {e.venue}
                </small>
              </div>
              <Pill>{e.kind}</Pill>
              <button
                className="icon-btn danger"
                aria-label={`Delete ${e.title}`}
                onClick={() => update((d) => ({ events: d.events.filter((x) => x.id !== e.id) }))}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {!events.length && <Empty icon={Trophy} title="No events scheduled" />}
        </div>
      </Card>
      <Card>
        <CardHead title="Add an event" />
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !date || !venue.trim()) return;
            update((d) => ({
              events: [
                { id: Date.now(), schoolId: UNSTAMPED, title: title.trim(), date, venue: venue.trim(), kind },
                ...d.events,
              ],
            }));
            log(`Added ${kind.toLowerCase()} event: ${title}`);
            setTitle("");
            setDate("");
            setVenue("");
            notify("Event added to the calendar.");
          }}
        >
          <Field label="Event name">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Badminton trials"
              required
            />
          </Field>
          <Field label="Type">
            <select value={kind} onChange={(e) => setKind(e.target.value as "Sports" | "Academic")}>
              <option>Sports</option>
              <option>Academic</option>
            </select>
          </Field>
          <Field label="Date">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </Field>
          <Field label="Venue">
            <input
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Indoor court"
              required
            />
          </Field>
          <button className="btn-primary btn-block">
            <Plus size={15} /> Add event
          </button>
        </form>
      </Card>
    </div>
  );
}
