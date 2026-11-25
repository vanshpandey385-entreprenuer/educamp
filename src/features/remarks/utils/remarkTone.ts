import { RemarkKind } from "@/shared/types/domain";

export const KIND_TONE: Record<RemarkKind, "ok" | "bad" | "info"> = {
  Praise: "ok",
  Concern: "bad",
  Note: "info",
};
