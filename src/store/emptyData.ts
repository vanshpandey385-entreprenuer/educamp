import type { Data } from "@/shared/types/domain";

/** What the app shows before anything has loaded from the server. */
export const EMPTY_DATA: Data = {
  schools: [],
  students: [],
  teachers: [],
  fees: [],
  leaves: [],
  homework: [],
  notices: [],
  events: [],
  messages: [],
  exams: [],
  resources: [],
  slots: [],
  remarks: [],
  books: [],
  routes: [],
  tickets: [],
  activity: [],
  attendance: {},
  teacherAtt: {},
  substitutions: [],
  classes: [],
  submissions: [],
  marks: {},
  schoolProfile: { principal: "", email: "", address: "" },
};
