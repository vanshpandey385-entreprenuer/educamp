"use client";

import { Download, Plus, Trash2, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GRADES, gradeOfClass, sectionOfClass } from "@/config/school";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { StudentDetail } from "./StudentDetail";
import { StudentForm } from "./StudentForm";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pager } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { downloadCsv } from "@/shared/lib/csv";
import { PAGE_SIZE } from "@/shared/lib/pagination";
import { Student } from "@/shared/types/domain";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { useAppStore } from "@/store/AppStore";

export function StudentsView() {
  const { data, update, notify } = useAppStore();
  const allClasses = useClasses();
  const { ask, dialog } = useConfirm();
  // Section letters that exist in this school: A, B, C and any the admin added.
  const sectionLetters = Array.from(new Set(allClasses.map(sectionOfClass))).sort();
  const [q, setQ] = useState(""),
    [grade, setGrade] = useState(0),
    [section, setSection] = useState(""),
    [page, setPage] = useState(0);
  const [modal, setModal] = useState(false);
  const [open, setOpen] = useState<Student | null>(null);
  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    return data.students
      .filter(
        (s) =>
          (!grade || gradeOfClass(s.cls) === grade) &&
          (!section || s.cls.endsWith(` ${section}`)) &&
          (!k || `${s.name} ${s.cls} ${s.loginId} ${s.admission} ${s.guardian}`.toLowerCase().includes(k)),
      )
      .sort(
        (a, b) =>
          gradeOfClass(a.cls) - gradeOfClass(b.cls) ||
          sectionOfClass(a.cls).localeCompare(sectionOfClass(b.cls)) ||
          Number(a.roll) - Number(b.roll),
      );
  }, [data.students, q, grade, section]);
  useEffect(() => setPage(0), [q, grade, section]);
  const view = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHead
          title="Student records"
          sub={`${data.students.length.toLocaleString("en-IN")} students · select a student to see their profile and login details`}
          action={
            <div className="row-gap">
              <button
                className="btn-ghost"
                onClick={() => {
                  downloadCsv("students-with-logins.csv", [
                    [
                      "Class",
                      "Roll",
                      "Student",
                      "Student ID",
                      "Login ID",
                      "Password",
                      "Parent login ID",
                      "Parent password",
                      "Guardian",
                      "Contact",
                    ],
                    ...rows.map((s) => [
                      s.cls,
                      s.roll,
                      s.name,
                      s.admission,
                      s.loginId,
                      s.password,
                      s.parentLoginId,
                      s.parentPassword,
                      s.guardian,
                      s.phone,
                    ]),
                  ]);
                  notify("Student list downloaded.");
                }}
              >
                <Download size={15} /> Export
              </button>
              <button className="btn-primary" onClick={() => setModal(true)}>
                <Plus size={15} /> Add student
              </button>
            </div>
          }
        />
        <div className="filters">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, login ID or student ID" />
          <select
            className="select-sm"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            aria-label="Class"
          >
            <option value={0}>All classes</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
          <select
            className="select-sm"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            aria-label="Section"
          >
            <option value="">All sections</option>
            {sectionLetters.map((x) => (
              <option key={x} value={x}>
                Section {x}
              </option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Roll</th>
                <th>Student ID</th>
                <th>Login ID</th>
                <th>Average</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {view.map((s) => (
                <tr key={s.id} className="row-click" onClick={() => setOpen(s)}>
                  <td>
                    <div className="who">
                      <Avatar name={s.name} />
                      <div>
                        <b>{s.name}</b>
                        <small>{s.guardian}</small>
                      </div>
                    </div>
                  </td>
                  <td>{s.cls}</td>
                  <td className="mono">{s.roll}</td>
                  <td className="mono">{s.admission}</td>
                  <td className="mono">{s.loginId}</td>
                  <td>
                    <Pill tone={s.avg >= 80 ? "ok" : s.avg ? "warn" : "muted"}>
                      {s.avg ? `${s.avg}%` : "—"}
                    </Pill>
                  </td>
                  <td>
                    <Pill>{s.status}</Pill>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="icon-btn danger"
                      aria-label={`Remove ${s.name}`}
                      onClick={() =>
                        ask({
                          title: `Remove ${s.name}?`,
                          message:
                            "The student will be removed from the school records. This cannot be undone.",
                          onConfirm: () =>
                            update((d) => ({ students: d.students.filter((x) => x.id !== s.id) })),
                        })
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty icon={Users} title="No students match your search" />}
        </div>
        <Pager page={page} total={rows.length} size={PAGE_SIZE} onPage={setPage} />
      </Card>
      {modal && (
        <Modal title="Create student account" onClose={() => setModal(false)}>
          <StudentForm onDone={() => setModal(false)} />
        </Modal>
      )}
      {open && <StudentDetail student={open} onClose={() => setOpen(null)} />}
      {dialog}
    </>
  );
}
