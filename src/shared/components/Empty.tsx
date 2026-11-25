"use client";

import { Inbox, LucideIcon } from "lucide-react";

export function Empty({
  icon: Icon = Inbox,
  title,
  text,
}: {
  icon?: LucideIcon;
  title: string;
  text?: string;
}) {
  return (
    <div className="empty">
      <span>
        <Icon size={22} />
      </span>
      <b>{title}</b>
      {text && <p>{text}</p>}
    </div>
  );
}
