"use client";

import { useState } from "react";
import { MODULES } from "@/config/navigation";
import { Card, CardHead } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Feature control ───────────── */
export function ModulesView() {
  const { data, update, notify, log } = useAppStore();
  const [sid, setSid] = useState(data.schools[0]?.id ?? 1);
  const school = data.schools.find((s) => s.id === sid);
  const off = new Set(school?.off ?? []);
  const toggle = (id: string) => {
    const next = new Set(off);
    next.has(id) ? next.delete(id) : next.add(id);
    update((d) => ({ schools: d.schools.map((s) => (s.id === sid ? { ...s, off: [...next] } : s)) }));
    log(
      `${school?.name}: ${MODULES.find((m) => m.id === id)?.label} ${next.has(id) ? "switched off" : "switched on"}`,
    );
    notify("Module setting saved. It applies the next time the school's users open the app.");
  };
  return (
    <Card>
      <CardHead
        title="Feature control"
        sub="Switch optional modules on or off for a school"
        action={
          <select
            className="select-sm"
            value={sid}
            onChange={(e) => setSid(Number(e.target.value))}
            aria-label="School"
          >
            {data.schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="mini-list big">
        {MODULES.map((m) => (
          <div key={m.id}>
            <div className="grow">
              <b>{m.label}</b>
              <small>{m.detail}</small>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                role="switch"
                checked={!off.has(m.id)}
                onChange={() => toggle(m.id)}
                aria-label={`${m.label} for ${school?.name}`}
              />
              <i />
            </label>
          </div>
        ))}
      </div>
    </Card>
  );
}
