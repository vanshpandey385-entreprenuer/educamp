"use client";

import { BookOpen, Bus, Library as LibraryIcon, Phone } from "lucide-react";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Pill } from "@/shared/components";
import { fmtLong, isoToday } from "@/shared/lib/date";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Library & transport (family view) ───────────── */
export function CampusView({ studentId }: { studentId: number }) {
  const { data } = useAppStore();
  const mine = data.books.filter((b) => b.issuedTo === studentId);
  const available = data.books.filter((b) => b.issuedTo == null);
  const route = data.routes.find((r) => r.studentIds.includes(studentId));
  return (
    <div className="grid-2">
      <Card>
        <CardHead title="Books issued" sub="Return by the due date to avoid a reminder" />
        <div className="mini-list">
          {mine.map((b) => {
            const late = !!b.due && b.due < isoToday();
            return (
              <div key={b.id}>
                <span className="notice-ico">
                  <BookOpen size={16} />
                </span>
                <div className="grow">
                  <b>{b.title}</b>
                  <small>
                    {b.author} · due {b.due ? fmtLong(b.due) : "—"}
                  </small>
                </div>
                <Pill tone={late ? "bad" : "warn"}>{late ? "Overdue" : "Issued"}</Pill>
              </div>
            );
          })}
          {!mine.length && (
            <Empty icon={LibraryIcon} title="No books issued" text="Visit the library to borrow a book." />
          )}
        </div>
        <h3 className="sub-head">Available in the library</h3>
        <div className="chips">
          {available.map((b) => (
            <span key={b.id} title={b.author}>
              {b.title}
            </span>
          ))}
        </div>
      </Card>
      <Card>
        <CardHead title="School bus" sub={route ? route.name : "Transport"} />
        {route ? (
          <>
            <dl className="dl">
              <div>
                <dt>Vehicle</dt>
                <dd>{route.vehicle}</dd>
              </div>
              <div>
                <dt>Driver</dt>
                <dd>{route.driver}</dd>
              </div>
              <div>
                <dt>Driver contact</dt>
                <dd>{route.phone}</dd>
              </div>
            </dl>
            <h3 className="sub-head">Route stops</h3>
            <ol className="stops">
              {route.stops.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <p className="muted-p">
              <Phone size={13} /> Contact the school office for any change to pick-up or drop-off.
            </p>
          </>
        ) : (
          <Empty
            icon={Bus}
            title="Not using school transport"
            text="Ask the school office to assign a route."
          />
        )}
      </Card>
    </div>
  );
}
