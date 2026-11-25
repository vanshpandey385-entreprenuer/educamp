"use client";

import { MessageSquare } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Thread } from "./Thread";
import { Avatar } from "@/shared/components";
import { Card } from "@/shared/components";
import { Empty } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function MessagesView({
  mode,
  studentId,
  teacherId,
}: {
  mode: "family" | "teacher";
  studentId?: number;
  teacherId?: number;
}) {
  const { data, update, notify, log } = useAppStore();
  const student = data.students.find((s) => s.id === studentId);
  const teacher = data.teachers.find((t) => t.id === teacherId);

  const contacts = useMemo(() => {
    if (mode === "family" && student)
      return data.teachers
        .filter((t) => t.classes.includes(student.cls))
        .map((t) => ({ key: t.id, sid: student.id, tid: t.id, name: t.name, sub: `${t.dept} teacher` }));
    if (mode === "teacher" && teacher)
      return data.students
        .filter((s) => teacher.classes.includes(s.cls))
        .map((s) => ({
          key: s.id,
          sid: s.id,
          tid: teacher.id,
          name: `${s.guardian} (${s.name})`,
          sub: `Class ${s.cls}`,
        }));
    return [];
  }, [mode, student, teacher, data.teachers, data.students]);

  const unreadFor = (sid: number, tid: number) =>
    data.messages.filter((m) => m.studentId === sid && m.teacherId === tid && m.from !== mode && !m.read)
      .length;
  const lastAt = (sid: number, tid: number) =>
    Math.max(0, ...data.messages.filter((m) => m.studentId === sid && m.teacherId === tid).map((m) => m.at));
  const ordered = [...contacts].sort((a, b) => lastAt(b.sid, b.tid) - lastAt(a.sid, a.tid));
  const [sel, setSel] = useState<number | null>(null);
  const current = ordered.find((c) => c.key === sel) ?? ordered[0];
  const msgs = current
    ? data.messages
        .filter((m) => m.studentId === current.sid && m.teacherId === current.tid)
        .sort((a, b) => a.at - b.at)
    : [];
  const unreadHere = current ? unreadFor(current.sid, current.tid) : 0;

  useEffect(() => {
    if (!current || !unreadHere) return;
    update((d) => ({
      messages: d.messages.map((m) =>
        m.studentId === current.sid && m.teacherId === current.tid && m.from !== mode && !m.read
          ? { ...m, read: true }
          : m,
      ),
    }));
  }, [current?.sid, current?.tid, unreadHere]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!contacts.length)
    return (
      <Card>
        <Empty
          icon={MessageSquare}
          title="No one to message yet"
          text="Conversations appear once teachers are assigned to the class."
        />
      </Card>
    );

  return (
    <Card pad={false} className="msg-card">
      <div className="msg-layout">
        <aside className="msg-list" aria-label="Conversations">
          <p className="msg-cap">
            {mode === "family" ? "Your child's teachers" : "Families in your classes"}
          </p>
          {ordered.map((c) => {
            const u = unreadFor(c.sid, c.tid);
            return (
              <button
                key={c.key}
                className={current?.key === c.key ? "on" : ""}
                onClick={() => setSel(c.key)}
              >
                <Avatar name={c.name} size={34} />
                <div className="grow">
                  <b>{c.name}</b>
                  <small>{c.sub}</small>
                </div>
                {u > 0 && <span className="badge-n">{u}</span>}
              </button>
            );
          })}
        </aside>
        {current && (
          <Thread
            msgs={msgs}
            me={mode}
            title={current.name}
            sub={current.sub}
            onSend={(text) => {
              update((d) => ({
                messages: [
                  ...d.messages,
                  {
                    id: Date.now(),
                    studentId: current.sid,
                    teacherId: current.tid,
                    from: mode,
                    text,
                    at: Date.now(),
                    read: false,
                  },
                ],
              }));
              log(`Sent a message to ${mode === "family" ? current.name : "a family"}`);
              notify("Message sent.");
            }}
          />
        )}
      </div>
    </Card>
  );
}
