/**
 * Every data shape used by the app. Frontend and backend both import from here.
 */

/* ───────────── Types ───────────── */
export type Role = "Super Admin" | "Admin" | "Teacher" | "Parent / Student";

export type AttStatus = "Present" | "Absent" | "Leave";

export type TeacherAtt = "Present" | "Absent" | "On leave";

export interface School {
  id: number;
  name: string;
  city: string;
  students: number;
  status: "Active" | "Pending" | "Suspended";
  plan: string;
  off?: string[];
}

export interface Student {
  id: number;
  schoolId: number;
  name: string;
  cls: string;
  roll: string;
  admission: string;
  loginId: string;
  password: string;
  parentLoginId: string;
  parentPassword: string;
  guardian: string;
  phone: string;
  status: "Active" | "Inactive";
  avg: number;
  source?: "Admission" | "Online enrolment";
  joined?: string;
}

export interface Teacher {
  id: number;
  schoolId: number;
  name: string;
  staffId: string;
  loginId: string;
  dept: string;
  classes: string[];
  homeroom?: string;
}

export interface Fee {
  id: number;
  studentId: number;
  amount: number;
  due: string;
  status: "Paid" | "Pending" | "Overdue";
  reminded?: number;
}

export interface Leave {
  id: number;
  schoolId: number;
  person: string;
  role: "Teacher" | "Student";
  cls: string;
  from: string;
  to: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  studentId?: number;
}

export interface Homework {
  id: number;
  schoolId: number;
  cls: string;
  subject: string;
  title: string;
  due: string;
  by: string;
  done: number[];
}

export type NoticeType = "General" | "Holiday" | "PTM" | "Event" | "Exam";

export type Audience = "Everyone" | "Parents & students" | "Teachers";

export interface Notice {
  id: number;
  schoolId: number;
  title: string;
  body: string;
  date: string;
  type: NoticeType;
  audience?: Audience;
  pinned?: boolean;
}

export interface EventItem {
  id: number;
  schoolId: number;
  title: string;
  date: string;
  venue: string;
  kind: "Sports" | "Academic";
}

export interface Message {
  id: number;
  studentId: number;
  teacherId: number;
  from: "family" | "teacher";
  text: string;
  at: number;
  read: boolean;
}

export interface Exam {
  id: number;
  schoolId: number;
  cls: string;
  subject: string;
  date: string;
  time: string;
  room: string;
}

export type ResourceKind = "Notes" | "Worksheet" | "Video" | "Link";

export interface Resource {
  id: number;
  schoolId: number;
  cls: string;
  subject: string;
  title: string;
  kind: ResourceKind;
  by: string;
  date: string;
  url?: string;
}

export interface Slot {
  id: number;
  teacherId: number;
  date: string;
  time: string;
  bookedBy?: number;
}

export type RemarkKind = "Praise" | "Concern" | "Note";

export interface Remark {
  id: number;
  studentId: number;
  teacherId: number;
  kind: RemarkKind;
  text: string;
  date: string;
}

export interface Book {
  id: number;
  schoolId: number;
  title: string;
  author: string;
  issuedTo?: number;
  due?: string;
}

export interface Route {
  id: number;
  schoolId: number;
  name: string;
  stops: string[];
  driver: string;
  phone: string;
  vehicle: string;
  studentIds: number[];
}

export interface Ticket {
  id: number;
  school: string;
  topic: string;
  status: "Open" | "In progress" | "Resolved";
  priority: "Low" | "Normal" | "High";
  note: string;
  created: string;
}

export interface Activity {
  id: number;
  schoolId?: number | null;
  who: string;
  role: string;
  action: string;
  at: number;
}

export interface Substitution {
  id: number;
  date: string;
  cls: string;
  period: number;
  absentId: number;
  subId: number;
}

/**
 * A class the school admin added on top of the built-in Class 1-12, sections A/B/C.
 * Example: name "6 D" means Class 6, section D.
 */
export interface ClassInfo {
  id: number;
  schoolId: number;
  /** Full name, for example "6 D". */
  name: string;
  grade: number;
  section: string;
  createdAt: number;
}

/** Where a student's homework file is in the teacher's review. */
export type SubmissionStatus = "Pending review" | "Approved" | "Not approved";

/**
 * One student's PDF for one homework.
 * The PDF itself is stored separately (see server/files); this record only points to it with `fileId`.
 */
export interface Submission {
  id: number;
  schoolId: number;
  homeworkId: number;
  studentId: number;
  fileId: string;
  fileName: string;
  fileSize: number;
  submittedAt: number;
  status: SubmissionStatus;
  /** The teacher's note, filled in when the homework is not approved. */
  remark?: string;
  reviewedBy?: string;
  reviewedAt?: number;
  /** False until the student has opened the homework page after the teacher's decision. */
  studentSeen: boolean;
}

/** Attendance is kept per calendar date: attendance["2026-11-20"][studentId] */
export interface Data {
  schools: School[];
  students: Student[];
  teachers: Teacher[];
  fees: Fee[];
  leaves: Leave[];
  homework: Homework[];
  notices: Notice[];
  events: EventItem[];
  messages: Message[];
  exams: Exam[];
  resources: Resource[];
  slots: Slot[];
  remarks: Remark[];
  books: Book[];
  routes: Route[];
  tickets: Ticket[];
  activity: Activity[];
  attendance: Record<string, Record<number, AttStatus>>;
  teacherAtt: Record<string, Record<number, TeacherAtt>>;
  substitutions: Substitution[];
  classes: ClassInfo[];
  submissions: Submission[];
  marks: Record<number, number>;
  schoolProfile: { principal: string; email: string; address: string };
}

export interface Session {
  role: Role;
  schoolId: number | null;
  loginId: string;
  name: string;
  studentId?: number;
  teacherId?: number;
  isParentAccount?: boolean;
  landing?: string;
}
