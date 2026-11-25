"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { StudentForm } from "./StudentForm";
import { Card, CardHead } from "@/shared/components";

export function AdmissionView({ go }: { go: (id: string) => void }) {
  const [k, setK] = useState(0);
  return (
    <div className="grid-side">
      <Card>
        <CardHead
          title="New student admission"
          sub="Create the student profile and issue school login credentials"
        />
        <StudentForm key={k} onDone={() => setK(k + 1)} />
      </Card>
      <Card>
        <CardHead title="Admission checklist" />
        <ol className="steps">
          <li>
            <b>Enter profile details</b>
            <small>Name, class and section, and guardian.</small>
          </li>
          <li>
            <b>Roll number and IDs are assigned</b>
            <small>The next roll number in the class and a student ID are issued automatically.</small>
          </li>
          <li>
            <b>Share login details</b>
            <small>Give the student and parent their login ID and password securely.</small>
          </li>
        </ol>
        <button className="btn-ghost btn-block" onClick={() => go("students")}>
          View student records <ArrowRight size={15} />
        </button>
      </Card>
    </div>
  );
}
