"use client";

import { Building2 } from "lucide-react";
import { useSchoolStats } from "@/features/platform/hooks/useSchoolStats";
import { Empty } from "@/shared/components";
import { LinkBtn } from "@/shared/components";
import { Pill } from "@/shared/components";
import { School } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function SchoolTable({ schools, actions }: { schools: School[]; actions?: boolean }) {
  const { update, notify, log } = useAppStore();
  const stats = useSchoolStats();
  const set = (s: School, status: School["status"]) => {
    update((d) => ({ schools: d.schools.map((x) => (x.id === s.id ? { ...x, status } : x)) }));
    log(`${s.name}: status set to ${status}`);
    notify(`School ${status === "Active" ? "activated" : status.toLowerCase()}.`);
  };
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>School</th>
            <th>City</th>
            <th>Students</th>
            <th>Teachers</th>
            <th>Plan</th>
            <th>Status</th>
            {actions && <th />}
          </tr>
        </thead>
        <tbody>
          {schools.map((s) => (
            <tr key={s.id}>
              <td>
                <b>{s.name}</b>
              </td>
              <td>{s.city}</td>
              <td>{(stats.get(s.id)?.students ?? 0).toLocaleString("en-IN")}</td>
              <td>{stats.get(s.id)?.teachers ?? 0}</td>
              <td>{s.plan}</td>
              <td>
                <Pill>{s.status}</Pill>
              </td>
              {actions && (
                <td>
                  {s.status === "Pending" ? (
                    <LinkBtn onClick={() => set(s, "Active")}>Approve</LinkBtn>
                  ) : (
                    <LinkBtn onClick={() => set(s, s.status === "Active" ? "Suspended" : "Active")}>
                      {s.status === "Active" ? "Suspend" : "Activate"}
                    </LinkBtn>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!schools.length && <Empty icon={Building2} title="No schools here" />}
    </div>
  );
}
