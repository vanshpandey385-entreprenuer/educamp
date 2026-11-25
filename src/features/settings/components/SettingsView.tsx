"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardHead } from "@/shared/components";
import { Field } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function SettingsView() {
  const { data, update, notify, session, resetDemo } = useAppStore();
  const school = useStoreSchool();
  const p = data.schoolProfile;
  return (
    <Card className="narrow">
      <CardHead title="School profile" sub={school?.name} />
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          update((d) => ({
            schoolProfile: {
              principal: String(f.get("principal")),
              email: String(f.get("email")),
              address: String(f.get("address")),
            },
            schools: d.schools.map((s) =>
              s.id === session?.schoolId ? { ...s, name: String(f.get("name")) } : s,
            ),
          }));
          notify("Settings saved in this browser.");
        }}
      >
        <Field label="School name">
          <input name="name" defaultValue={school?.name} required />
        </Field>
        <Field label="Principal">
          <input name="principal" defaultValue={p.principal} />
        </Field>
        <div className="form-2">
          <Field label="Office email">
            <input name="email" type="email" defaultValue={p.email} />
          </Field>
          <Field label="Address">
            <input name="address" defaultValue={p.address} />
          </Field>
        </div>
        <div className="note">
          <AlertCircle size={15} /> Stored only in this browser. Production settings will be saved to
          Supabase.
        </div>
        <div className="row-gap">
          <button className="btn-primary">Save changes</button>
          {session?.role === "Super Admin" && (
            <button type="button" className="btn-ghost" onClick={resetDemo}>
              Reset demo data
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}

function useStoreSchool() {
  const { data, session } = useAppStore();
  return data.schools.find((s) => s.id === session?.schoolId);
}
