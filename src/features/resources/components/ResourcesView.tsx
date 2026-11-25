"use client";

import { ExternalLink, FileText, FolderOpen, Link2, Plus, Trash2, Video } from "lucide-react";
import { useState } from "react";
import { useClasses } from "@/features/classes/hooks/useClasses";
import { Card, CardHead } from "@/shared/components";
import { Empty } from "@/shared/components";
import { Field } from "@/shared/components";
import { Modal } from "@/shared/components";
import { Pill } from "@/shared/components";
import { SearchBox } from "@/shared/components";
import { fmtDate, isoToday } from "@/shared/lib/date";
import { UNSTAMPED } from "@/shared/lib/records";
import { ResourceKind } from "@/shared/types/domain";
import { useAppStore } from "@/store/AppStore";

/* ───────────── Study materials ───────────── */
const KIND_ICON = { Notes: FileText, Worksheet: FileText, Video: Video, Link: Link2 } as const;

const safeUrl = (u?: string) => (u && /^https?:\/\//i.test(u) ? u : undefined);

export function ResourcesView({
  classes,
  canPost,
  byName,
}: {
  classes?: string[];
  canPost?: boolean;
  byName?: string;
}) {
  const { data, update, notify, log } = useAppStore();
  const allClasses = useClasses();
  const pool = classes ?? allClasses;
  const [modal, setModal] = useState(false);
  const [q, setQ] = useState("");
  const [cls, setCls] = useState("All");
  const list = data.resources
    .filter(
      (r) =>
        pool.includes(r.cls) &&
        (cls === "All" || r.cls === cls) &&
        `${r.title} ${r.subject}`.toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <Card>
        <CardHead
          title="Study materials"
          sub="Shared by teachers for each class"
          action={
            <div className="row-gap">
              <SearchBox value={q} onChange={setQ} placeholder="Search title or subject" />
              {pool.length > 1 && (
                <select
                  className="select-sm"
                  value={cls}
                  onChange={(e) => setCls(e.target.value)}
                  aria-label="Filter by class"
                >
                  <option>All</option>
                  {pool.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              )}
              {canPost && (
                <button className="btn-primary" onClick={() => setModal(true)}>
                  <Plus size={15} /> Share material
                </button>
              )}
            </div>
          }
        />
        <div className="hw-grid">
          {list.map((r) => {
            const Ico = KIND_ICON[r.kind];
            const url = safeUrl(r.url);
            return (
              <article key={r.id} className="hw-card">
                <div className="hw-top">
                  <span className="hw-ico">
                    <Ico size={17} />
                  </span>
                  <div className="row-gap">
                    <Pill tone="info">{`Class ${r.cls}`}</Pill>
                    <Pill tone="lime">{r.kind}</Pill>
                  </div>
                </div>
                <h3>{r.title}</h3>
                <p>
                  {r.subject} · {r.by}
                </p>
                <div className="hw-foot">
                  <small>Shared {fmtDate(r.date)}</small>
                  <div className="row-gap">
                    {url ? (
                      <a className="btn-ghost btn-sm" href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} /> Open
                      </a>
                    ) : (
                      <small>Provided in class</small>
                    )}
                    {canPost && (
                      <button
                        className="icon-btn danger"
                        aria-label={`Delete ${r.title}`}
                        onClick={() =>
                          update((d) => ({ resources: d.resources.filter((x) => x.id !== r.id) }))
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!list.length && (
          <Empty
            icon={FolderOpen}
            title="No study materials"
            text="Nothing has been shared for this selection yet."
          />
        )}
      </Card>
      {modal && (
        <Modal title="Share study material" onClose={() => setModal(false)}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const url = String(f.get("url") || "").trim();
              if (url && !safeUrl(url)) return notify("Link must start with http:// or https://");
              update((d) => ({
                resources: [
                  {
                    id: Date.now(),
                    schoolId: UNSTAMPED,
                    cls: String(f.get("cls")),
                    subject: String(f.get("subject")),
                    title: String(f.get("title")),
                    kind: f.get("kind") as ResourceKind,
                    by: byName ?? "School Admin",
                    date: isoToday(),
                    url: url || undefined,
                  },
                  ...d.resources,
                ],
              }));
              log(`Shared study material: ${f.get("title")}`);
              setModal(false);
              notify("Material shared with the class.");
            }}
          >
            <div className="form-2">
              <Field label="Class">
                <select name="cls">
                  {pool.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <input name="subject" required placeholder="Mathematics" />
              </Field>
            </div>
            <Field label="Title">
              <input name="title" required autoFocus placeholder="Chapter 4 · revision notes" />
            </Field>
            <div className="form-2">
              <Field label="Type">
                <select name="kind" defaultValue="Notes">
                  <option>Notes</option>
                  <option>Worksheet</option>
                  <option>Video</option>
                  <option>Link</option>
                </select>
              </Field>
              <Field label="Link (optional)" hint="Starts with https://">
                <input name="url" inputMode="url" placeholder="https://" />
              </Field>
            </div>
            <button className="btn-primary btn-block">Share material</button>
          </form>
        </Modal>
      )}
    </>
  );
}
