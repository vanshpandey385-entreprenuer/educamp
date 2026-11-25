"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { SchoolTable } from "./SchoolTable";
import { Card, CardHead } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function SchoolsView({ pendingOnly }: { pendingOnly?: boolean }) {
  const { data, update, notify, log } = useAppStore();
  const [modal, setModal] = useState(false);
  const list = pendingOnly ? data.schools.filter((s) => s.status === "Pending") : data.schools;
  return (
    <>
      <Card>
        <CardHead
          title={pendingOnly ? "Awaiting approval" : "School directory"}
          sub="Super Admin manages school onboarding and platform access"
          action={
            !pendingOnly && (
              <button className="btn-primary" onClick={() => setModal(true)}>
                <Plus size={15} /> Add school
              </button>
            )
          }
        />
        <SchoolTable schools={list} actions />
      </Card>
      {modal && (
        <Modal title="Register school" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              update((d) => ({
                schools: [
                  {
                    id: Date.now(),
                    name: String(f.get("name")),
                    city: String(f.get("city")),
                    students: 0,
                    status: "Pending",
                    plan: "Trial",
                  },
                  ...d.schools,
                ],
              }));
              log(`Registered school ${f.get("name")}`);
              setModal(false);
              notify("School registration added for review.");
            }}
          >
            <Field label="School name">
              <input name="name" required autoFocus />
            </Field>
            <Field label="City">
              <input name="city" required />
            </Field>
            <button className="btn-primary btn-block">Submit school</button>
          </form>
        </Modal>
      )}
    </>
  );
}
