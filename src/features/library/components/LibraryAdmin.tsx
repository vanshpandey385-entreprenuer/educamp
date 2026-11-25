"use client";

import { BookOpen, CalendarClock, Library as LibraryIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { LinkBtn } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { fmtDate, isoToday } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Library ───────────── */
export function LibraryAdmin() {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState<"" | "book" | number>("");
  const [q, setQ] = useState("");
  const rows = data.books.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(q.toLowerCase()));
  const issued = data.books.filter((b) => b.issuedTo != null);
  const overdue = issued.filter((b) => b.due && b.due < isoToday());
  const plus14 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  return (
    <>
      <div className="stats three">
        <section className="card stat">
          <span className="stat-icon tone-ok">
            <LibraryIcon size={18} />
          </span>
          <div>
            <p>Books in catalogue</p>
            <strong>{data.books.length}</strong>
          </div>
        </section>
        <section className="card stat">
          <span className="stat-icon tone-info">
            <BookOpen size={18} />
          </span>
          <div>
            <p>Currently issued</p>
            <strong>{issued.length}</strong>
          </div>
        </section>
        <section className="card stat">
          <span className={`stat-icon tone-${overdue.length ? "bad" : "ok"}`}>
            <CalendarClock size={18} />
          </span>
          <div>
            <p>Overdue returns</p>
            <strong>{overdue.length}</strong>
          </div>
        </section>
      </div>
      <Card>
        <CardHead
          title="Library catalogue"
          sub="Issue and receive books"
          action={
            <div className="row-gap">
              <SearchBox value={q} onChange={setQ} placeholder="Search title or author" />
              <button className="btn-primary" onClick={() => setModal("book")}>
                <Plus size={15} /> Add book
              </button>
            </div>
          }
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const who = data.students.find((s) => s.id === b.issuedTo);
                const late = b.due && b.due < isoToday();
                return (
                  <tr key={b.id}>
                    <td>
                      <b>{b.title}</b>
                    </td>
                    <td>{b.author}</td>
                    <td>
                      {who ? (
                        <div>
                          <Pill tone={late ? "bad" : "warn"}>{late ? "Overdue" : "Issued"}</Pill>
                          <small className="sub-line">
                            {who.name} · due {b.due ? fmtDate(b.due) : "—"}
                          </small>
                        </div>
                      ) : (
                        <Pill tone="ok">Available</Pill>
                      )}
                    </td>
                    <td>
                      <div className="row-gap">
                        {who ? (
                          <LinkBtn
                            onClick={() => {
                              update((d) => ({
                                books: d.books.map((x) =>
                                  x.id === b.id ? { ...x, issuedTo: undefined, due: undefined } : x,
                                ),
                              }));
                              log(`Received book "${b.title}" from ${who.name}`);
                              notify("Book returned.");
                            }}
                          >
                            Mark returned
                          </LinkBtn>
                        ) : (
                          <LinkBtn onClick={() => setModal(b.id)}>Issue</LinkBtn>
                        )}
                        {!who && (
                          <button
                            className="icon-btn danger"
                            aria-label={`Remove ${b.title}`}
                            onClick={() => update((d) => ({ books: d.books.filter((x) => x.id !== b.id) }))}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && <Empty icon={LibraryIcon} title="No books match" />}
        </div>
      </Card>
      {modal === "book" && (
        <Modal title="Add book" onClose={() => setModal("")}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((d) => ({
                books: [
                  ...d.books,
                  {
                    id: Date.now(),
                    schoolId: UNSTAMPED,
                    title: String(f.get("title")),
                    author: String(f.get("author")),
                  },
                ],
              }));
              log(`Added book "${f.get("title")}" to the library`);
              setModal("");
              notify("Book added.");
            }}
          >
            <Field label="Title">
              <input name="title" required autoFocus />
            </Field>
            <Field label="Author">
              <input name="author" required />
            </Field>
            <button className="btn-primary btn-block">Add book</button>
          </form>
        </Modal>
      )}
      {typeof modal === "number" && (
        <Modal title="Issue book" onClose={() => setModal("")}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const sid = Number(f.get("sid"));
              const book = data.books.find((x) => x.id === modal);
              update((d) => ({
                books: d.books.map((x) =>
                  x.id === modal ? { ...x, issuedTo: sid, due: String(f.get("due")) } : x,
                ),
              }));
              log(`Issued "${book?.title}" to ${data.students.find((s) => s.id === sid)?.name}`);
              setModal("");
              notify("Book issued.");
            }}
          >
            <Field label="Student">
              <select name="sid" required>
                {data.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.cls}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date">
              <input name="due" type="date" required defaultValue={plus14()} />
            </Field>
            <button className="btn-primary btn-block">Issue book</button>
          </form>
        </Modal>
      )}
    </>
  );
}
