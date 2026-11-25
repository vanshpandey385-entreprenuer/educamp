"use client";

import { Plus, School, Trash2 } from "lucide-react";
import { useState } from "react";
import { GRADES, gradeOfClass } from "@/config/school";
import { Card, CardHead, Empty, Modal, Pill } from "@/shared/components";
import { useConfirm } from "@/shared/hooks/useConfirm";
import { useAppStore } from "@/store/AppStore";
import { useClasses } from "../hooks/useClasses";
import { AddClassForm } from "./AddClassForm";

/** Admin page: every class of the school, with a button to add a new one. */
export function ClassesView() {
  const { data, update, log } = useAppStore();
  const allClasses = useClasses();
  const [grade, setGrade] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const { ask, dialog } = useConfirm();

  const addedNames = new Set(data.classes.map((c) => c.name));
  const visible = allClasses.filter((c) => !grade || gradeOfClass(c) === grade);

  function removeClass(name: string) {
    update((d) => ({
      classes: d.classes.filter((c) => c.name !== name),
      teachers: d.teachers.map((t) => ({
        ...t,
        classes: t.classes.filter((c) => c !== name),
        homeroom: t.homeroom === name ? undefined : t.homeroom,
      })),
    }));
    log(`Removed class ${name}`);
  }

  /** Asks first, then removes the class. */
  function askToRemoveClass(name: string) {
    ask({
      title: `Remove Class ${name}?`,
      message: "Its teachers will stop teaching this class. This cannot be undone.",
      onConfirm: () => removeClass(name),
    });
  }

  return (
    <>
      <Card>
        <CardHead
          title="Classes"
          sub={`${allClasses.length} classes · ${data.classes.length} added by your school`}
          action={
            <div className="row-gap">
              <select
                className="select-sm"
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                aria-label="Filter by grade"
              >
                <option value={0}>All grades</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    Class {g}
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={() => setShowAddForm(true)}>
                <Plus size={15} /> Add class
              </button>
            </div>
          }
        />

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Class</th>
                <th>Students</th>
                <th>Class teacher</th>
                <th>Teachers</th>
                <th>Type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((name) => {
                const studentCount = data.students.filter((s) => s.cls === name).length;
                const classTeacher = data.teachers.find((t) => t.homeroom === name);
                const teacherCount = data.teachers.filter((t) => t.classes.includes(name)).length;
                const isAdded = addedNames.has(name);

                return (
                  <tr key={name}>
                    <td>
                      <b>Class {name}</b>
                    </td>
                    <td>{studentCount}</td>
                    <td>{classTeacher ? classTeacher.name : "—"}</td>
                    <td>{teacherCount}</td>
                    <td>{isAdded ? <Pill tone="info">Added</Pill> : <Pill tone="muted">Standard</Pill>}</td>
                    <td>
                      {isAdded && (
                        <button
                          className="icon-btn danger"
                          aria-label={`Remove Class ${name}`}
                          disabled={studentCount > 0}
                          title={studentCount > 0 ? "Move the students out first" : "Remove this class"}
                          onClick={() => askToRemoveClass(name)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!visible.length && <Empty icon={School} title="No classes found" />}
        </div>
      </Card>

      {showAddForm && (
        <Modal title="Add a new class" eyebrow="CLASSES" onClose={() => setShowAddForm(false)}>
          <AddClassForm onDone={() => setShowAddForm(false)} />
        </Modal>
      )}
      {dialog}
    </>
  );
}
