"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pager({
  page,
  total,
  size,
  onPage,
}: {
  page: number;
  total: number;
  size: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (total <= size) return null;
  const from = page * size + 1,
    to = Math.min(total, (page + 1) * size);
  return (
    <div className="pager">
      <small>
        Showing {from}–{to} of {total.toLocaleString("en-IN")}
      </small>
      <div className="row-gap">
        <button className="btn-ghost btn-sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={14} /> Previous
        </button>
        <span>
          Page {page + 1} of {pages}
        </span>
        <button className="btn-ghost btn-sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
