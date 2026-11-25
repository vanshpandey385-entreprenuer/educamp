"use client";

import { Printer } from "lucide-react";
import { useState } from "react";
import { MONTHLY_FEE, MONTHS } from "@/config/school";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Modal } from "@/shared/components";
import { money } from "@/shared/lib/format";
import { Student } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

export function ReceiptsCard({ student, paidMonths }: { student: Student; paidMonths: number[] }) {
  const { data } = useAppStore();
  const [open, setOpen] = useState<number | null>(null);
  const school = data.schools.find((x) => x.id === student.schoolId);
  return (
    <Card>
      <CardHead title="Payment receipts" sub="Open a receipt to print or save it" />
      <div className="mini-list">
        {paidMonths.map((m) => (
          <div key={m}>
            <div className="grow">
              <b>{MONTHS[m]} fee</b>
              <small>{money(MONTHLY_FEE)} · paid</small>
            </div>
            <button className="link-btn" onClick={() => setOpen(m)}>
              View receipt
            </button>
          </div>
        ))}
        {!paidMonths.length && <Empty icon={Printer} title="No payments yet" />}
      </div>
      {open != null && (
        <Modal title={`Receipt · ${MONTHS[open]}`} eyebrow="FEE RECEIPT" onClose={() => setOpen(null)}>
          <div className="print-area report">
            <header>
              <b>{school?.name}</b>
              <small>Fee receipt</small>
            </header>
            <dl className="kv-grid">
              <span>
                Receipt no.
                <b>
                  RC-{student.id % 100000}-{open + 1}
                </b>
              </span>
              <span>
                Student<b>{student.name}</b>
              </span>
              <span>
                Class · roll
                <b>
                  {student.cls} · {student.roll}
                </b>
              </span>
              <span>
                Fee month<b>{MONTHS[open]}</b>
              </span>
              <span>
                Amount paid<b>{money(MONTHLY_FEE)}</b>
              </span>
              <span>
                Status<b>Paid</b>
              </span>
            </dl>
            <footer>Demo receipt generated from sample records. No payment gateway is connected.</footer>
          </div>
          <button className="btn-primary btn-block" onClick={() => window.print()}>
            <Printer size={15} /> Print or save as PDF
          </button>
        </Modal>
      )}
    </Card>
  );
}
