"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

/** A credential that stays hidden until the viewer chooses to reveal it. */
export function Secret({ value }: { value: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="secret">
      <code>{show ? value : "•".repeat(Math.max(8, Math.min(12, value.length)))}</code>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </span>
  );
}
