"use client";

import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { AddTeacherForm } from "./AddTeacherForm";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pager } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { isoToday } from "@/shared/lib/date";
import { PAGE_SIZE } from "@/shared/lib/pagination";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Teachers & staff ───────────── */
export function TeachersView() {
  const { data, update, log } = useAppStore();
  const allClasses = useClasses();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const { ask, dialog } = useConfirm();
  const attendanceToday = data.teacherAtt[isoToday()] ?? {};

  const rows = data.teachers.filter((t) =>
    `${t.name} ${t.dept} ${t.staffId} ${t.loginId}`.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => setPage(0), [query]);

  function removeTeacher(id: number, name: string) {
    update((d) => ({ teachers: d.teachers.filter((t) => t.id !== id) }));
    log(`Removed teacher ${name}`);
  }

  /** Asks first, then removes the teacher. */
  function askToRemoveTeacher(id: number, name: string) {
    ask({
      title: `Remove ${name}?`,
      message: "Their classes will have no teacher until you add one. This cannot be undone.",
      onConfirm: () => removeTeacher(id, name),
    });
  }

  return (
    <>
      <Card>
        <CardHead
          title="Teaching staff"
          sub={`${data.teachers.length} teachers across ${allClasses.length} classes`}
          action={
            <div className="row-gap">
              <SearchBox value={query} onChange={setQuery} placeholder="Search name, subject or login ID" />
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={15} /> Add teacher
              </button>
            </div>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Staff ID</th>
                <th>Subject</th>
                <th>Class teacher of</th>
                <th>Classes taught</th>
                <th>Login ID</th>
                <th>Today</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="who">
                      <Avatar name={t.name} />
                      <b>{t.name}</b>
                    </div>
                  </td>
                  <td className="mono">{t.staffId}</td>
                  <td>{t.dept}</td>
                  <td>{t.homeroom ? `Class ${t.homeroom}` : "—"}</td>
                  <td>
                    <div className="chips tight">
                      {t.classes.slice(0, 4).map((c) => (
                        <span key={c}>{c}</span>
                      ))}
                      {t.classes.length > 4 && (
                        <span title={t.classes.join(", ")}>+{t.classes.length - 4}</span>
                      )}
                    </div>
                  </td>
                  <td className="mono">{t.loginId}</td>
                  <td>
                    {attendanceToday[t.id] ? (
                      <Pill>{attendanceToday[t.id]}</Pill>
                    ) : (
                      <Pill tone="muted">Pending</Pill>
                    )}
                  </td>
                  <td>
                    <button
                      className="icon-btn danger"
                      aria-label={`Remove ${t.name}`}
                      onClick={() => askToRemoveTeacher(t.id, t.name)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty icon={GraduationCap} title="No teachers match" />}
        </div>
        <Pager page={page} total={rows.length} size={PAGE_SIZE} onPage={setPage} />
      </Card>

      {showAddForm && (
        <Modal title="Add a new teacher" eyebrow="STAFF" onClose={() => setShowAddForm(false)}>
          <AddTeacherForm onDone={() => setShowAddForm(false)} />
        </Modal>
      )}
      {dialog}
    </>
  );
}
