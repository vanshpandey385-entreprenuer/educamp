"use client";

import { QrCode } from "lucide-react";
import { useChild } from "@/features/students/hooks/useChild";
import { initials } from "@/shared/lib/format";
import { useAppStore } from "@/store/AppStore";

export function DigitalId({ studentId }: { studentId: number }) {
  const s = useChild(studentId);
  const { data, session } = useAppStore();
  const school = data.schools.find((x) => x.id === session?.schoolId);
  return (
    <div className="id-wrap">
      <article className="id-card">
        <header>
          <span className="emblem">{initials(school?.name ?? "G")[0]}</span>
          <div>
            <b>{(school?.name ?? "School").toUpperCase()}</b>
            <small>STUDENT IDENTITY CARD · 2026–27</small>
          </div>
        </header>
        <div className="id-body">
          <div className="photo">{initials(s.name)}</div>
          <div className="id-info">
            <h2>{s.name}</h2>
            <p>Student · Class {s.cls}</p>
            <dl>
              <dt>Admission No.</dt>
              <dd>{s.admission}</dd>
              <dt>Roll Number</dt>
              <dd>{s.roll}</dd>
              <dt>Parent / Guardian</dt>
              <dd>{s.guardian}</dd>
              <dt>Emergency Contact</dt>
              <dd>{s.phone}</dd>
              <dt>Blood Group</dt>
              <dd>Not provided</dd>
            </dl>
          </div>
          <div className="qr" aria-hidden>
            <QrCode size={64} strokeWidth={1.4} />
            <small>{s.admission}</small>
          </div>
        </div>
        <footer>This is a sample digital ID preview. Official details are managed by the school.</footer>
      </article>
    </div>
  );
}
