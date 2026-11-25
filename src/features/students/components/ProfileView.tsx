"use client";

import { useChild } from "@/features/students/hooks/useChild";
import { Avatar } from "@/shared/components";
import { Card, CardHead } from "@/shared/components";
import { Pill } from "@/shared/components";
import { Progress } from "@/shared/components";
import { Secret } from "@/shared/components";
import { useAppStore } from "@/store/AppStore";

export function ProfileView({ studentId, parent }: { studentId: number; parent: boolean }) {
  const s = useChild(studentId);
  const { data, session } = useAppStore();
  const school = data.schools.find((x) => x.id === session?.schoolId);
  const rows: [string, string][] = [
    ["Full name", s.name],
    ["Class", `Class ${s.cls}`],
    ["Roll number", s.roll],
    ["Student ID (admission)", s.admission],
    ["Parent / guardian", s.guardian],
    ["Emergency contact", s.phone],
    ["School", school?.name ?? "—"],
    [
      "Joined",
      s.joined
        ? new Date(s.joined + "T00:00:00").toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "—",
    ],
  ];
  return (
    <div className="grid-side">
      <Card>
        <div className="profile-hero">
          <Avatar name={s.name} size={72} />
          <div>
            <h2>{s.name}</h2>
            <p>
              {parent ? "Your child" : "Student"} · Class {s.cls}
            </p>
            <Pill>{s.status}</Pill>
          </div>
        </div>
        <dl className="dl">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <h3 className="sub-head">Login details</h3>
        {s.source === "Online enrolment" && (
          <div className="note ok-note">
            Your account was created automatically when you enrolled. Use these details to sign in next time.
          </div>
        )}
        <dl className="dl">
          <div>
            <dt>Student login ID</dt>
            <dd className="mono">{s.loginId}</dd>
          </div>
          <div>
            <dt>Student password</dt>
            <dd>
              <Secret value={s.password} />
            </dd>
          </div>
          <div>
            <dt>Parent login ID</dt>
            <dd className="mono">{s.parentLoginId}</dd>
          </div>
          <div>
            <dt>Parent password</dt>
            <dd>
              <Secret value={s.parentPassword} />
            </dd>
          </div>
        </dl>
        <p className="muted-p">Keep these details private. Ask the school office if you need them changed.</p>
      </Card>
      <Card>
        <CardHead title="Academic standing" />
        <div className="mini-prog">
          <b>{s.avg}%</b>
          <span>Overall average</span>
        </div>
        <Progress value={s.avg} tone="lime" />
        <p className="muted-p">
          Official details are managed by the school. Contact the school office to request a correction.
        </p>
      </Card>
    </div>
  );
}
