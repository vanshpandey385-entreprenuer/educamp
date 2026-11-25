import { n } from "@/config/navigation";

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

export const today = () => new Date();

export const todayLabel = () =>
  today().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const fmtDateTime = (ms: number) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const fmtLong = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const isoToday = () => toIso(new Date());

export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toIso(d);
};

/** 0 = Monday … 6 = Sunday */
export const weekdayIdx = (iso: string) => (new Date(iso + "T00:00:00").getDay() + 6) % 7;
