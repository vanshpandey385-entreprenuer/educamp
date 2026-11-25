"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SCOPED_KEYS } from "@/shared/lib/records";
import type { Data, Role, School, Session } from "@/shared/types/domain";
import { api } from "./api";
import { EMPTY_DATA } from "./emptyData";

/** What a component receives from `useAppStore()`. */
interface AppStore {
  /** False until the first load from the server finishes. */
  ready: boolean;
  /** True when the first load could not reach the server. */
  loadFailed: boolean;
  /** Data this person is allowed to see. Before sign-in it only holds the school list. */
  data: Data;
  session: Session | null;
  /** Change data. Return only the collections you changed; the store saves them to the server. */
  update: (change: (current: Data) => Partial<Data>) => void;
  /** Signs in through the server. Returns an error message, or null on success. */
  login: (input: {
    role: Role;
    schoolId: number | null;
    loginId: string;
    password: string;
  }) => Promise<string | null>;
  signOut: () => void;
  resetDemo: () => void;
  toast: string;
  notify: (message: string) => void;
  /** Adds a line to the activity log. */
  log: (action: string) => void;
}

const StoreContext = createContext<AppStore | null>(null);

export function useAppStore(): AppStore {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useAppStore must be used inside <AppStoreProvider>.");
  return value;
}

/** How long to wait after the last edit before saving, so typing does not send a request per letter. */
const SAVE_DELAY_MS = 400;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [data, setData] = useState<Data>(EMPTY_DATA);
  const [session, setSession] = useState<Session | null>(null);
  const [toast, setToast] = useState("");

  // Refs hold the latest values for code that runs later (timers, callbacks).
  const dataRef = useRef<Data>(EMPTY_DATA);
  const sessionRef = useRef<Session | null>(null);
  const changedKeys = useRef<Set<keyof Data>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const replaceData = useCallback((next: Data) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  /** Loads either the full data (signed in) or just the school list (signed out). */
  const loadForSession = useCallback(
    async (current: Session | null) => {
      if (current) {
        const { data: loaded } = await api<{ data: Data }>("/api/data");
        replaceData(loaded);
      } else {
        const { schools } = await api<{ schools: School[] }>("/api/schools");
        replaceData({ ...EMPTY_DATA, schools });
      }
    },
    [replaceData],
  );

  // First load: ask the server who is signed in.
  useEffect(() => {
    (async () => {
      try {
        const { session: existing } = await api<{ session: Session | null }>("/api/auth/session");
        sessionRef.current = existing;
        setSession(existing);
        await loadForSession(existing);
      } catch {
        setLoadFailed(true);
      }
      setReady(true);
    })();
  }, [loadForSession, notify]);

  /** Sends every collection changed since the last save. */
  const flush = useCallback(async () => {
    const keys = [...changedKeys.current];
    changedKeys.current.clear();
    if (!keys.length || !sessionRef.current) return;

    const patch: Record<string, unknown> = {};
    for (const key of keys) patch[key] = dataRef.current[key];
    try {
      await api("/api/data", { method: "PATCH", body: { patch } });
    } catch (error) {
      notify((error as Error).message);
      // The server said no, so show what the server really has.
      await loadForSession(sessionRef.current);
    }
  }, [loadForSession, notify]);

  const update = useCallback(
    (change: (current: Data) => Partial<Data>) => {
      const current = dataRef.current;
      const patch = change(current) as Record<string, unknown>;
      const schoolId = sessionRef.current?.schoolId;

      // Records created inside a school belong to that school.
      if (schoolId != null) {
        for (const key of SCOPED_KEYS) {
          const rows = patch[key] as { schoolId?: number | null }[] | undefined;
          if (rows?.some((row) => !row.schoolId))
            patch[key] = rows.map((row) => (row.schoolId ? row : { ...row, schoolId }));
        }
      }

      replaceData({ ...current, ...patch });
      (Object.keys(patch) as (keyof Data)[]).forEach((key) => changedKeys.current.add(key));

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush, replaceData],
  );

  const log = useCallback(
    (action: string) => {
      const who = sessionRef.current;
      update((current) => ({
        activity: [
          {
            id: Date.now() + Math.random(),
            schoolId: who?.schoolId ?? null,
            who: who?.name ?? "System",
            role: who?.role ?? "System",
            action,
            at: Date.now(),
          },
          ...current.activity,
        ].slice(0, 300),
      }));
    },
    [update],
  );

  const login = useCallback(
    async (input: { role: Role; schoolId: number | null; loginId: string; password: string }) => {
      try {
        const { session: created } = await api<{ session: Session }>("/api/auth/login", {
          method: "POST",
          body: input,
        });
        sessionRef.current = created;
        await loadForSession(created);
        setSession(created);
        return null;
      } catch (error) {
        return (error as Error).message;
      }
    },
    [loadForSession],
  );

  const signOut = useCallback(async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    await flush();
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    sessionRef.current = null;
    setSession(null);
    await loadForSession(null);
  }, [flush, loadForSession]);

  const resetDemo = useCallback(async () => {
    try {
      await api("/api/data/reset", { method: "POST" });
      await loadForSession(sessionRef.current);
      notify("Demo data reset.");
    } catch (error) {
      notify((error as Error).message);
    }
  }, [loadForSession, notify]);

  const value = useMemo<AppStore>(
    () => ({ ready, loadFailed, data, session, update, login, signOut, resetDemo, toast, notify, log }),
    [ready, loadFailed, data, session, update, login, signOut, resetDemo, toast, notify, log],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
