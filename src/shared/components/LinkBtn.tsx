"use client";

import { ReactNode } from "react";

export function LinkBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="link-btn" onClick={onClick}>
      {children}
    </button>
  );
}
