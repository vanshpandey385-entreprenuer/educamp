"use client";

import { Check, CheckCheck, CheckCircle2, Circle, CreditCard } from "lucide-react";
import { useState } from "react";
import { MONTHLY_FEE, MONTHS, PAID_MONTHS } from "@/config/school";
import { ReceiptsCard } from "./ReceiptsCard";
import { useChild } from "@/features/students/hooks/useChild";
import { Card, CardHead } from "@/shared/components";
import { money } from "@/shared/lib/format";

export function StudentFees({ studentId }: { studentId: number }) {
  const child = useChild(studentId);
  const [sel, setSel] = useState<number[]>([]);
  const [requested, setRequested] = useState(false);
  const total = sel.length * MONTHLY_FEE;
  return (
    <>
      <Card>
        <CardHead
          title="Monthly fee schedule"
          sub="Academic year 2026–27 · Select unpaid months to include them in your payment"
        />
        <div className="month-grid">
          {MONTHS.map((m, i) => {
            const paid = PAID_MONTHS.includes(i),
              chosen = sel.includes(i);
            return (
              <button
                key={m}
                disabled={paid}
                className={`month ${paid ? "paid" : chosen ? "sel" : ""}`}
                onClick={() => {
                  setRequested(false);
                  setSel((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
                }}
                aria-pressed={chosen}
              >
                <span>{m}</span>
                <b>{money(MONTHLY_FEE)}</b>
                <i>{paid ? <CheckCheck size={17} /> : chosen ? <Check size={17} /> : <Circle size={17} />}</i>
                <small>{paid ? "Paid" : chosen ? "Selected" : "Unpaid"}</small>
              </button>
            );
          })}
        </div>
        <div className="legend">
          <span>
            <CheckCheck size={14} /> Paid
          </span>
          <span>
            <Check size={14} /> Selected for payment
          </span>
          <span>
            <Circle size={14} /> Unpaid
          </span>
        </div>
      </Card>
      <Card className="pay-bar">
        <div>
          <small>Total selected amount</small>
          <strong>{money(total)}</strong>
          <p>
            {sel.length} month{sel.length === 1 ? "" : "s"} selected
          </p>
        </div>
        <button className="btn-primary" disabled={!sel.length} onClick={() => setRequested(true)}>
          Pay fees <CreditCard size={15} />
        </button>
      </Card>
      {requested && (
        <div className="note ok-note">
          <CheckCircle2 size={16} /> Payment summary created for {money(total)}. The payment gateway will be
          connected later; no money has been charged.
        </div>
      )}
      <ReceiptsCard student={child} paidMonths={PAID_MONTHS} />
    </>
  );
}
