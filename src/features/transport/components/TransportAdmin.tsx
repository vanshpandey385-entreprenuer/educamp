"use client";

import { Bus, Plus, Trash2, UserMinus } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Transport ───────────── */
export function TransportAdmin() {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState(false);
  const assigned = new Set(data.routes.flatMap((r) => r.studentIds));
  const free = data.students.filter((s) => !assigned.has(s.id));
  return (
    <>
      <Card>
        <CardHead
          title="Bus routes"
          sub={`${data.routes.length} routes · ${assigned.size} students using school transport`}
          action={
            <button className="btn-primary" onClick={() => setModal(true)}>
              <Plus size={15} /> Add route
            </button>
          }
        />
        <div className="route-grid">
          {data.routes.map((r) => (
            <article key={r.id} className="route-card">
              <div className="between">
                <h3>{r.name}</h3>
                <button
                  className="icon-btn danger"
                  aria-label={`Delete ${r.name}`}
                  onClick={() => {
                    update((d) => ({ routes: d.routes.filter((x) => x.id !== r.id) }));
                    log(`Deleted ${r.name}`);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="muted-p">
                {r.vehicle} · {r.driver}
              </p>
              <ol className="stops">
                {r.stops.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <div className="chips">
                {r.studentIds.map((id) => {
                  const s = data.students.find((x) => x.id === id);
                  return s ? (
                    <span key={id}>
                      {s.name}
                      <button
                        type="button"
                        aria-label={`Remove ${s.name} from route`}
                        onClick={() =>
                          update((d) => ({
                            routes: d.routes.map((x) =>
                              x.id === r.id ? { ...x, studentIds: x.studentIds.filter((i) => i !== id) } : x,
                            ),
                          }))
                        }
                      >
                        <UserMinus size={11} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
              {free.length > 0 && (
                <select
                  className="select-sm route-add"
                  value=""
                  aria-label={`Assign student to ${r.name}`}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (!id) return;
                    update((d) => ({
                      routes: d.routes.map((x) =>
                        x.id === r.id ? { ...x, studentIds: [...x.studentIds, id] } : x,
                      ),
                    }));
                    log(`Assigned ${data.students.find((s) => s.id === id)?.name} to ${r.name}`);
                    notify("Student assigned.");
                  }}
                >
                  <option value="">+ Assign student…</option>
                  {free.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} · {s.cls}
                    </option>
                  ))}
                </select>
              )}
            </article>
          ))}
        </div>
        {!data.routes.length && <Empty icon={Bus} title="No routes yet" />}
      </Card>
      {modal && (
        <Modal title="Add bus route" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((d) => ({
                routes: [
                  ...d.routes,
                  {
                    id: Date.now(),
                    schoolId: UNSTAMPED,
                    name: String(f.get("name")),
                    stops: String(f.get("stops"))
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                    driver: String(f.get("driver")),
                    phone: String(f.get("phone") || "—"),
                    vehicle: String(f.get("vehicle")),
                    studentIds: [],
                  },
                ],
              }));
              log(`Added ${f.get("name")}`);
              setModal(false);
              notify("Route added.");
            }}
          >
            <Field label="Route name">
              <input name="name" required autoFocus placeholder="Route 4 · Jayanagar" />
            </Field>
            <Field label="Stops" hint="Separate stops with commas">
              <input name="stops" required placeholder="Stop 1, Stop 2, School" />
            </Field>
            <div className="form-2">
              <Field label="Driver">
                <input name="driver" required />
              </Field>
              <Field label="Driver contact">
                <input name="phone" inputMode="tel" />
              </Field>
            </div>
            <Field label="Vehicle number">
              <input name="vehicle" required />
            </Field>
            <button className="btn-primary btn-block">Add route</button>
          </form>
        </Modal>
      )}
    </>
  );
}
