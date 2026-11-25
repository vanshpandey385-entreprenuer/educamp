"use client";

import { CheckCircle2, Coffee, Wand2, X } from "lucide-react";
import { PERIODS } from "@/config/school";
import { freeSubstitutes, isAway, slotsOf } from "@/features/timetable/utils/timetable";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtLong, weekdayIdx } from "@/shared/lib/date";
import { Substitution } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/** Sidebar listing teachers who are away on a date, with the cover arranged for each of their lessons. */
export function SubstitutionPanel({
  date,
  canArrange,
  classes,
}: {
  date: string;
  canArrange: boolean;
  classes?: string[];
}) {
  const { data, update, notify, log } = useAppStore();
  const di = weekdayIdx(date);
  const att = data.teacherAtt[date] ?? {};
  const away = data.teachers.filter((t) => isAway(att[t.id]));
  const rows = away
    .map((t) => ({ t, slots: slotsOf(t, di).filter((s) => !classes || classes.includes(s.cls)) }))
    .filter((r) => !classes || r.slots.length);
  const subFor = (absentId: number, cls: string, period: number) =>
    data.substitutions.find(
      (s) => s.date === date && s.absentId === absentId && s.cls === cls && s.period === period,
    );
  const nameOf = (id: number) => data.teachers.find((t) => t.id === id)?.name ?? "—";
  const pending = rows.reduce(
    (n, r) => n + r.slots.filter((s) => !subFor(r.t.id, s.cls, s.period)).length,
    0,
  );

  const assign = (absentId: number, cls: string, period: number, subId: number) => {
    update((d) => ({
      substitutions: [
        ...d.substitutions.filter(
          (s) => !(s.date === date && s.absentId === absentId && s.cls === cls && s.period === period),
        ),
        { id: Date.now() + Math.random(), date, cls, period, absentId, subId },
      ],
    }));
    log(`Arranged ${nameOf(subId)} to cover Class ${cls}, period ${period + 1} on ${date}`);
  };
  const remove = (id: number) =>
    update((d) => ({ substitutions: d.substitutions.filter((s) => s.id !== id) }));

  function autoArrange() {
    const added: Substitution[] = [];
    for (const { t, slots } of rows)
      for (const sl of slots) {
        if (subFor(t.id, sl.cls, sl.period)) continue;
        const pick = freeSubstitutes(
          {
            teachers: data.teachers,
            teacherAtt: data.teacherAtt,
            substitutions: [...data.substitutions, ...added],
          },
          date,
          sl.period,
          t,
        )[0];
        if (pick)
          added.push({
            id: Date.now() + added.length + Math.random(),
            date,
            cls: sl.cls,
            period: sl.period,
            absentId: t.id,
            subId: pick.id,
          });
      }
    if (!added.length) return notify("No free teachers are available for the remaining lessons.");
    update((d) => ({ substitutions: [...d.substitutions, ...added] }));
    log(`Auto-arranged ${added.length} substitute lessons for ${date}`);
    notify(`${added.length} substitute lesson${added.length === 1 ? "" : "s"} arranged.`);
  }

  if (classes && !rows.length) return null;
  return (
    <Card className="sub-panel">
      <CardHead
        title="Absent teachers"
        sub={fmtLong(date)}
        action={
          canArrange && pending > 0 ? (
            <button className="btn-ghost" onClick={autoArrange}>
              <Wand2 size={14} /> Auto-arrange
            </button>
          ) : undefined
        }
      />
      {di > 4 ? (
        <div className="note">
          <Coffee size={15} /> There are no lessons on weekends, so no cover is needed. Pick a weekday to
          arrange substitutes.
        </div>
      ) : !rows.length ? (
        <div className="note ok-note">
          <CheckCircle2 size={15} /> Every teacher is present on this date.
        </div>
      ) : (
        <>
          {canArrange && (
            <p className={`sub-count ${pending ? "bad" : "ok"}`}>
              {pending
                ? `${pending} lesson${pending === 1 ? "" : "s"} still need a substitute`
                : "All lessons are covered"}
            </p>
          )}
          <div className="sub-list">
            {rows.map(({ t, slots }) => (
              <section key={t.id} className="sub-teacher">
                <div className="sub-who">
                  <Avatar name={t.name} size={34} />
                  <div className="grow">
                    <b>{t.name}</b>
                    <small>
                      {t.dept}
                      {t.homeroom ? ` · Class teacher of ${t.homeroom}` : ""}
                    </small>
                  </div>
                  <Pill tone={att[t.id] === "Absent" ? "bad" : "warn"}>{att[t.id] ?? ""}</Pill>
                </div>
                {slots.length === 0 && <p className="muted-p">No lessons scheduled on this day.</p>}
                {slots.map((sl) => {
                  const cur = subFor(t.id, sl.cls, sl.period);
                  const free = canArrange ? freeSubstitutes(data, date, sl.period, t) : [];
                  return (
                    <div key={sl.cls + sl.period} className="sub-slot">
                      <div className="sub-slot-info">
                        <b>
                          Period {sl.period + 1} · Class {sl.cls}
                        </b>
                        <small>
                          {PERIODS[sl.period].split(" – ")[0]} · {t.dept}
                        </small>
                      </div>
                      {cur ? (
                        <div className="sub-assigned">
                          <Pill tone="ok">{`Covered by ${nameOf(cur.subId)}`}</Pill>
                          {canArrange && (
                            <button
                              className="icon-btn"
                              aria-label="Remove substitute"
                              onClick={() => remove(cur.id)}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ) : canArrange ? (
                        <select
                          className="select-sm"
                          value=""
                          aria-label={`Substitute for Class ${sl.cls} period ${sl.period + 1}`}
                          onChange={(e) =>
                            e.target.value && assign(t.id, sl.cls, sl.period, Number(e.target.value))
                          }
                        >
                          <option value="">
                            {free.length ? "Arrange other teacher…" : "No free teacher"}
                          </option>
                          {free.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} · {f.dept}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Pill tone="warn">Substitute pending</Pill>
                      )}
                    </div>
                  );
                })}
              </section>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
