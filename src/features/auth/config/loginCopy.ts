import { Role } from "@/shared/types/domain";

export const DEMO_LOGIN: Record<Role, string> = {
  "Parent / Student": "p.aarav",
  Teacher: "neha.mehta",
  Admin: "admin.greenwood",
  "Super Admin": "platform.admin",
};

/** Wording on the sign-in form, so every role sees labels that match who they are. */
export const LOGIN_COPY: Record<Role, { sub: string; idLabel: string; idHint: string; note: string }> = {
  "Parent / Student": {
    sub: "Choose your school, then sign in with the parent or student login ID issued by the school.",
    idLabel: "Parent / student login ID",
    idHint: "e.g. aarav.mehta or p.aarav",
    note: "Use the parent login ID or the student login ID issued by your school.",
  },
  Teacher: {
    sub: "Choose your school, then sign in with your teacher login ID.",
    idLabel: "Teacher login ID",
    idHint: "e.g. neha.mehta",
    note: "Your teacher login ID is issued by the school administrator.",
  },
  Admin: {
    sub: "Choose your school, then sign in with your school administrator ID.",
    idLabel: "Admin ID",
    idHint: "e.g. admin.greenwood",
    note: "Administrator IDs are issued when your school is approved on the platform.",
  },
  "Super Admin": {
    sub: "Platform staff sign in here.",
    idLabel: "Platform staff ID",
    idHint: "e.g. platform.admin",
    note: "Platform staff access is limited to authorised Efficht team members.",
  },
};
