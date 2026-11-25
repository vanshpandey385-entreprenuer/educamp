import type { ReactNode } from "react";

/** Map of page id → the page to show. The ids match the ones in `config/navigation.ts`. */
export type RouteTable = Record<string, ReactNode>;

/** Function that moves to another page by id. */
export type GoTo = (pageId: string) => void;
