"use client";

import { MessageSquare, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/shared/components";
import { Empty } from "@/shared/components";
import { fmtDateTime } from "@/shared/lib/date";

/* ───────────── Messages (family ↔ teacher) ───────────── */
export function Thread({
  msgs,
  me,
  onSend,
  title,
  sub,
}: {
  msgs: { id: number; from: "family" | "teacher"; text: string; at: number }[];
  me: "family" | "teacher";
  onSend: (t: string) => void;
  title: string;
  sub: string;
}) {
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [msgs.length]);
  return (
    <div className="thread">
      <div className="thread-head">
        <Avatar name={title} size={38} />
        <div>
          <b>{title}</b>
          <small>{sub}</small>
        </div>
      </div>
      <div className="thread-body" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={`bubble ${m.from === me ? "mine" : "theirs"}`}>
            <p>{m.text}</p>
            <small>{fmtDateTime(m.at)}</small>
          </div>
        ))}
        {!msgs.length && (
          <Empty icon={MessageSquare} title="No messages yet" text="Start the conversation below." />
        )}
        <div ref={end} />
      </div>
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          onSend(t);
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          maxLength={500}
        />
        <button className="btn-primary" disabled={!text.trim()}>
          <Send size={15} /> Send
        </button>
      </form>
    </div>
  );
}
