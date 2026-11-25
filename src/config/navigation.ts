/**
 * Sidebar menu for each role. Add a menu item here.
 */

import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Clock,
  CreditCard,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  School as SchoolIcon,
  Library,
  LifeBuoy,
  LucideIcon,
  Megaphone,
  MessageSquare,
  NotebookPen,
  QrCode,
  ScrollText,
  Settings,
  ShieldCheck,
  ToggleRight,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { Role, School } from "@/shared/types/domain";

/* ───────────── Navigation ───────────── */
export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const n = (id: string, label: string, icon: LucideIcon): NavItem => ({ id, label, icon });

export const NAV: Record<Role, NavSection[]> = {
  "Super Admin": [
    {
      title: "Platform",
      items: [
        n("overview", "Overview", LayoutDashboard),
        n("schools", "Schools", Building2),
        n("approvals", "Approvals", ShieldCheck),
        n("analytics", "Platform analytics", TrendingUp),
      ],
    },
    {
      title: "Business",
      items: [
        n("subscriptions", "Plans & billing", Wallet),
        n("support", "Support tickets", LifeBuoy),
        n("broadcast", "Broadcasts", Megaphone),
      ],
    },
    {
      title: "Control",
      items: [n("modules", "Feature control", ToggleRight), n("audit", "Audit log", ScrollText)],
    },
  ],
  Admin: [
    {
      title: "Main menu",
      items: [
        n("overview", "Overview", LayoutDashboard),
        n("students", "Students", Users),
        n("admission", "Student admission", UserPlus),
        n("teachers", "Teachers", GraduationCap),
        n("classes", "Classes", SchoolIcon),
      ],
    },
    {
      title: "Daily",
      items: [
        n("attendance", "Student attendance", ClipboardCheck),
        n("teacher-attendance", "Teacher attendance", UserCheck),
        n("leaves", "Leave requests", CalendarDays),
        n("notices", "Notices", Bell),
      ],
    },
    {
      title: "Academics",
      items: [
        n("academics", "Academics & sports", Trophy),
        n("exams", "Exam schedule", CalendarCheck),
        n("homework", "Homework", BookOpen),
        n("resources", "Study materials", FolderOpen),
        n("timetable", "Timetable", Clock),
      ],
    },
    { title: "Campus", items: [n("library", "Library", Library), n("transport", "Transport", Bus)] },
    {
      title: "Finance & insights",
      items: [
        n("fees", "Fees", CreditCard),
        n("analytics", "Analytics", TrendingUp),
        n("reports", "Reports", BarChart3),
        n("audit", "Activity log", ScrollText),
        n("settings", "Settings", Settings),
      ],
    },
  ],
  Teacher: [
    {
      title: "Main menu",
      items: [
        n("overview", "Overview", LayoutDashboard),
        n("classes", "My classes", GraduationCap),
        n("attendance", "Student attendance", ClipboardCheck),
        n("marks", "Marks & grades", NotebookPen),
        n("analytics", "Class analytics", TrendingUp),
      ],
    },
    {
      title: "Teaching",
      items: [
        n("homework", "Homework", BookOpen),
        n("resources", "Study materials", FolderOpen),
        n("exams", "Exam schedule", CalendarCheck),
        n("timetable", "Timetable", Clock),
        n("remarks", "Remarks & behaviour", Award),
      ],
    },
    {
      title: "Connect",
      items: [
        n("messages", "Messages", MessageSquare),
        n("meetings", "Parent meetings", CalendarClock),
        n("notices", "Notices", Bell),
        n("leaves", "Leave requests", CalendarDays),
      ],
    },
  ],
  "Parent / Student": [
    {
      title: "Main menu",
      items: [
        n("overview", "Overview", LayoutDashboard),
        n("profile", "Student profile", UserRound),
        n("attendance", "Attendance calendar", ClipboardCheck),
        n("results", "Results & progress", BarChart3),
      ],
    },
    {
      title: "School life",
      items: [
        n("fees", "Fees & payment", CreditCard),
        n("homework", "Homework", BookOpen),
        n("resources", "Study materials", FolderOpen),
        n("exams", "Exam schedule", CalendarCheck),
        n("timetable", "Timetable", Clock),
        n("campus", "Library & transport", Library),
      ],
    },
    {
      title: "Connect",
      items: [
        n("messages", "Messages", MessageSquare),
        n("meetings", "Parent meetings", CalendarClock),
        n("leaves", "Apply for leave", CalendarDays),
        n("notices", "Notices", Bell),
        n("id", "Digital ID", QrCode),
      ],
    },
  ],
};

/* Modules a platform admin can switch off per school. Each maps to the nav pages it controls. */
export const MODULES: { id: string; label: string; detail: string; pages: string[] }[] = [
  {
    id: "messages",
    label: "Parent–teacher messaging",
    detail: "Direct messages between families and class teachers.",
    pages: ["messages"],
  },
  {
    id: "meetings",
    label: "Parent meeting booking",
    detail: "Teachers publish slots; parents book them.",
    pages: ["meetings"],
  },
  {
    id: "resources",
    label: "Study materials",
    detail: "Notes, worksheets and links shared per class.",
    pages: ["resources"],
  },
  { id: "exams", label: "Exam schedule", detail: "Class-wise exam timetable.", pages: ["exams"] },
  {
    id: "campus",
    label: "Library & transport",
    detail: "Book lending and bus routes.",
    pages: ["campus", "library", "transport"],
  },
  {
    id: "remarks",
    label: "Remarks & behaviour",
    detail: "Teacher remarks visible to families.",
    pages: ["remarks"],
  },
];

export function navFor(role: Role, school?: School | null): NavSection[] {
  const base = NAV[role] ?? NAV["Parent / Student"];
  const off = new Set((school?.off ?? []).flatMap((m) => MODULES.find((x) => x.id === m)?.pages ?? []));
  if (role === "Super Admin" || !off.size) return base;
  return base
    .map((sec) => ({ ...sec, items: sec.items.filter((i) => !off.has(i.id)) }))
    .filter((sec) => sec.items.length);
}
