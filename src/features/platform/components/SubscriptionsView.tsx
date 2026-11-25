"use client";

import { Building2, ShieldCheck, Wallet } from "lucide-react";
import { PLANS, PLAN_PRICE } from "@/features/platform/config/plans";
import { useSchoolStats } from "@/features/platform/hooks/useSchoolStats";
import { Card, CardHead } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Stat } from "@/shared/components";
import { money } from "@/shared/lib/format";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Plans & billing ───────────── */
export function SubscriptionsView() {
  const { data, update, notify, log } = useAppStore();
  const stats = useSchoolStats();
  const mrr = data.schools
    .filter((s) => s.status === "Active")
    .reduce((a, s) => a + (PLAN_PRICE[s.plan] ?? 0), 0);
  return (
    <>
      <div className="stats three">
        <Stat
          icon={Wallet}
          label="Monthly recurring revenue"
          value={money(mrr)}
          detail="Active schools only"
        />
        <Stat
          icon={Building2}
          label="Paying schools"
          value={data.schools.filter((s) => s.status === "Active" && s.plan !== "Trial").length}
          detail="Not on a trial"
          tone="info"
        />
        <Stat
          icon={ShieldCheck}
          label="On trial"
          value={data.schools.filter((s) => s.plan === "Trial").length}
          detail="Convert to a paid plan"
          tone="warn"
        />
      </div>
      <Card>
        <CardHead title="School subscriptions" sub="Change a school's plan and see what it pays" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>School</th>
                <th>Students</th>
                <th>Plan</th>
                <th>Price / month</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.schools.map((s) => (
                <tr key={s.id}>
                  <td>
                    <b>{s.name}</b>
                    <small className="sub-line">{s.city}</small>
                  </td>
                  <td>{(stats.get(s.id)?.students ?? 0).toLocaleString("en-IN")}</td>
                  <td>
                    <select
                      className="select-sm"
                      value={s.plan}
                      aria-label={`Plan for ${s.name}`}
                      onChange={(e) => {
                        update((d) => ({
                          schools: d.schools.map((x) => (x.id === s.id ? { ...x, plan: e.target.value } : x)),
                        }));
                        log(`${s.name}: plan changed to ${e.target.value}`);
                        notify(`${s.name} moved to ${e.target.value}.`);
                      }}
                    >
                      {PLANS.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </td>
                  <td>{money(PLAN_PRICE[s.plan] ?? 0)}</td>
                  <td>
                    <Pill>{s.status}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
