/**
 * Builds the demo schools, students, teachers and history. Server only.
 */

import { CLASSES, SUBJECTS, gradeOfClass } from "@/config/school";
import { genPassword } from "@/shared/lib/credentials";
import { addDays, isoToday, weekdayIdx } from "@/shared/lib/date";
import { AttStatus, Data, Fee, Homework, Student, Teacher, TeacherAtt } from "@/shared/types/domain";

/* Deterministic pseudo-random numbers so every browser gets the same demo school. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Aanya",
  "Aditi",
  "Advik",
  "Ananya",
  "Arjun",
  "Avni",
  "Ayaan",
  "Bhavya",
  "Chaitanya",
  "Darsh",
  "Diya",
  "Eshaan",
  "Farhan",
  "Gauri",
  "Harsh",
  "Hiya",
  "Ira",
  "Ishita",
  "Jai",
  "Kavya",
  "Krish",
  "Lavanya",
  "Mihir",
  "Myra",
  "Naman",
  "Navya",
  "Nikhil",
  "Pari",
  "Pranav",
  "Rhea",
  "Riya",
  "Rudra",
  "Saanvi",
  "Samar",
  "Shaurya",
  "Siya",
  "Tanvi",
  "Uday",
  "Vanya",
  "Veer",
  "Yash",
  "Zoya",
  "Ritvik",
  "Kiara",
  "Reyansh",
  "Mahika",
  "Atharv",
  "Sanya",
  "Zayan",
  "Anvi",
];

const LAST = [
  "Sharma",
  "Verma",
  "Reddy",
  "Nair",
  "Iyer",
  "Kapoor",
  "Joshi",
  "Bose",
  "Menon",
  "Pillai",
  "Chopra",
  "Desai",
  "Bhat",
  "Kulkarni",
  "Saxena",
  "Agarwal",
  "Banerjee",
  "Chatterjee",
  "Das",
  "Fernandes",
  "Gill",
  "Hegde",
  "Jain",
  "Kaur",
  "Lal",
  "Mishra",
  "Naidu",
  "Pandey",
  "Rastogi",
  "Shetty",
  "Tiwari",
  "Varma",
  "Yadav",
  "Zaidi",
  "Ahmed",
  "D'Souza",
];

const PARENT_FIRST = [
  "Rajesh",
  "Sunita",
  "Vikram",
  "Meena",
  "Anil",
  "Kavita",
  "Suresh",
  "Pooja",
  "Manoj",
  "Rekha",
  "Sanjay",
  "Neelam",
  "Rahul",
  "Anjali",
  "Deepak",
  "Shobha",
];

const TEACHER_FIRST_F = [
  "Anita",
  "Bindu",
  "Charu",
  "Divya",
  "Geeta",
  "Hema",
  "Jyoti",
  "Kalpana",
  "Lata",
  "Mamta",
  "Nandini",
  "Pallavi",
  "Radha",
  "Sudha",
  "Usha",
  "Vandana",
];

const TEACHER_FIRST_M = [
  "Ajay",
  "Bharat",
  "Chetan",
  "Dinesh",
  "Gopal",
  "Harish",
  "Jayant",
  "Kiran",
  "Mohan",
  "Naveen",
  "Prakash",
  "Ramesh",
  "Sandeep",
  "Tarun",
  "Umesh",
  "Vinod",
];

const pad2 = (n: number) => String(n).padStart(2, "0");

interface SchoolSpec {
  id: number;
  students: number;
  seed: number;
}

function buildSchool(spec: SchoolSpec, demoStudents: Student[], legacyTeachers: Teacher[]) {
  const r = rng(spec.seed);
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];
  const sid = spec.id;
  const base = sid * 100000;

  /* ── Students: spread evenly across 36 classes ── */
  const perClass = Math.floor(spec.students / CLASSES.length),
    extra = spec.students % CLASSES.length;
  const takenLogin = new Set(demoStudents.map((s) => s.loginId));
  const students: Student[] = [...demoStudents];
  let seq = demoStudents.length,
    n = 0;
  CLASSES.forEach((cls, ci) => {
    const want = perClass + (ci < extra ? 1 : 0);
    const have = demoStudents.filter((s) => s.cls === cls).length;
    for (let k = have; k < want; k++) {
      const first = pick(FIRST),
        last = pick(LAST);
      let login = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, ""),
        v = 1;
      const root = login;
      while (takenLogin.has(login)) login = `${root}${++v}`;
      takenLogin.add(login);
      seq++;
      n++;
      const g = gradeOfClass(cls);
      students.push({
        id: base + n,
        schoolId: sid,
        name: `${first} ${last}`,
        cls,
        roll: "",
        admission: `STU${1000 + seq}`,
        loginId: login,
        password: genPassword(spec.seed + n * 3),
        parentLoginId: `p.${login}`,
        parentPassword: genPassword(spec.seed + n * 5 + 1),
        guardian: `${pick(PARENT_FIRST)} ${last}`,
        phone: `9${String(Math.floor(r() * 1e9)).padStart(9, "0")}`,
        status: "Active",
        avg: Math.min(98, Math.max(48, Math.round(60 + r() * 34 - (g > 9 ? 3 : 0)))),
        source: "Admission",
        joined: "2026-04-06",
      });
    }
  });
  // Roll numbers run 1…n within each class, in alphabetical order.
  for (const cls of CLASSES)
    students
      .filter((s) => s.cls === cls)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((s, i) => {
        s.roll = String(i + 1);
      });

  /* ── Teachers: every subject in every class is taught by a named teacher ── */
  const teachers: Teacher[] = legacyTeachers.map((t) => ({ ...t }));
  let tn = 0;
  const usedLogin = new Set(teachers.map((t) => t.loginId));
  for (const subject of SUBJECTS) {
    const pool: Teacher[] = [];
    CLASSES.forEach((cls, ci) => {
      if (teachers.some((t) => t.dept === subject && t.classes.includes(cls))) return;
      let t = pool.find(
        (x) => x.classes.length < 7 && !x.classes.some((c) => CLASSES.indexOf(c) % 7 === ci % 7),
      );
      if (!t) {
        tn++;
        const female = r() < 0.55,
          first = pick(female ? TEACHER_FIRST_F : TEACHER_FIRST_M),
          last = pick(LAST);
        let login = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, ""),
          v = 1;
        const root = login;
        while (usedLogin.has(login)) login = `${root}${++v}`;
        usedLogin.add(login);
        t = {
          id: base + 50000 + tn,
          schoolId: sid,
          name: `${female ? "Ms." : "Mr."} ${first} ${last}`,
          staffId: `TCH${300 + tn}`,
          loginId: login,
          dept: subject,
          classes: [],
        };
        pool.push(t);
        teachers.push(t);
      }
      t.classes.push(cls);
    });
  }
  // Class teachers: one per class, drawn from the teachers who teach it.
  for (const cls of CLASSES) {
    if (teachers.some((t) => t.homeroom === cls)) continue;
    const cands = teachers.filter((t) => t.classes.includes(cls) && !t.homeroom);
    const t = cands.find((x) => x.dept === "English" || x.dept === "Mathematics") ?? cands[0];
    if (t) t.homeroom = cls;
  }

  /* ── Fees: one term-fee record per student ── */
  const fees: Fee[] = [];
  students.forEach((s, i) => {
    const x = r();
    fees.push({
      id: base + i + 1,
      studentId: s.id,
      amount: 6000 + gradeOfClass(s.cls) * 900,
      due: `2026-11-${pad2(2 + (i % 9))}`,
      status: x < 0.64 ? "Paid" : x < 0.9 ? "Pending" : "Overdue",
    });
  });

  /* ── Homework: one assignment per class ── */
  const homework: Homework[] = CLASSES.map((cls, ci) => {
    const subject = SUBJECTS[(ci + sid) % 5];
    const t = teachers.find((x) => x.dept === subject && x.classes.includes(cls));
    const mates = students.filter((s) => s.cls === cls);
    return {
      id: base + ci + 1,
      schoolId: sid,
      cls,
      subject,
      title: `${subject} · Chapter ${1 + (ci % 9)} practice questions`,
      due: addDays(isoToday(), 1 + (ci % 6)),
      by: t?.name ?? "Class teacher",
      done: mates.filter(() => r() < 0.35).map((s) => s.id),
    };
  });

  return { students, teachers, fees, homework };
}

/* The ten original demo students keep their IDs and logins. */
const demo = (id: number, name: string, cls: string, guardian: string, avg: number): Student => {
  const slug = name.toLowerCase().replace(/\s+/g, ".");
  return {
    id,
    schoolId: 1,
    name,
    cls,
    roll: "",
    admission: `STU${1000 + id}`,
    loginId: slug,
    password: genPassword(id * 11),
    parentLoginId: `p.${slug.split(".")[0]}`,
    parentPassword: genPassword(id * 13 + 1),
    guardian,
    phone: `98765432${10 + id}`,
    status: "Active",
    avg,
    source: "Admission",
    joined: "2026-04-06",
  };
};

const DEMO_STUDENTS = [
  demo(1, "Anika Gupta", "5 A", "Neha Gupta", 86),
  demo(2, "Meera Iyer", "5 A", "Lakshmi Iyer", 92),
  demo(3, "Rohan Mehta", "8 B", "Amit Mehta", 78),
  demo(4, "Dev Malhotra", "8 B", "Sunil Malhotra", 71),
  demo(5, "Sara Khan", "7 A", "Farah Khan", 88),
  demo(6, "Kabir Singh", "7 A", "Harpreet Singh", 74),
  demo(7, "Vihaan Patel", "4 C", "Kunal Patel", 81),
  demo(8, "Tara Nair", "4 C", "Deepa Nair", 90),
  demo(9, "Aarav Mehta", "6 B", "Amit Mehta", 78),
  demo(10, "Ishaan Rao", "6 B", "Padma Rao", 69),
];

const LEGACY_TEACHERS: Teacher[] = [
  {
    id: 1,
    schoolId: 1,
    name: "Ms. Priya Sharma",
    staffId: "TCH201",
    loginId: "priya.sharma",
    dept: "Mathematics",
    classes: ["5 A"],
    homeroom: "5 A",
  },
  {
    id: 2,
    schoolId: 1,
    name: "Mr. Rahul Verma",
    staffId: "TCH202",
    loginId: "rahul.verma",
    dept: "Science",
    classes: ["8 B"],
    homeroom: "8 B",
  },
  {
    id: 3,
    schoolId: 1,
    name: "Ms. Ayesha Khan",
    staffId: "TCH203",
    loginId: "ayesha.khan",
    dept: "English",
    classes: ["7 A"],
    homeroom: "7 A",
  },
  {
    id: 4,
    schoolId: 1,
    name: "Mr. Karan Patel",
    staffId: "TCH204",
    loginId: "karan.patel",
    dept: "Hindi",
    classes: ["4 C"],
    homeroom: "4 C",
  },
  {
    id: 5,
    schoolId: 1,
    name: "Ms. Neha Mehta",
    staffId: "TCH205",
    loginId: "neha.mehta",
    dept: "Mathematics",
    classes: ["6 B", "7 A", "8 B"],
    homeroom: "6 B",
  },
];

function build(): Data {
  const schools = [
    {
      id: 1,
      name: "Greenwood Public School",
      city: "Bengaluru",
      students: 597,
      status: "Active" as const,
      plan: "Growth",
    },
    {
      id: 2,
      name: "Riverdale School",
      city: "Pune",
      students: 972,
      status: "Active" as const,
      plan: "Starter",
    },
    {
      id: 3,
      name: "Northstar Academy",
      city: "Delhi",
      students: 860,
      status: "Pending" as const,
      plan: "Trial",
    },
  ];
  const g1 = buildSchool({ id: 1, students: 597, seed: 1101 }, DEMO_STUDENTS, LEGACY_TEACHERS);
  const g2 = buildSchool({ id: 2, students: 972, seed: 2202 }, [], []);
  const g3 = buildSchool({ id: 3, students: 860, seed: 3303 }, [], []);
  // Keep the original demo story for the ten sample students' fees.
  const demoFee: Record<number, Fee["status"]> = {
    1: "Overdue",
    3: "Overdue",
    5: "Pending",
    7: "Paid",
    2: "Paid",
    9: "Pending",
    6: "Paid",
    10: "Pending",
  };
  g1.fees.forEach((f) => {
    if (demoFee[f.studentId]) f.status = demoFee[f.studentId];
  });
  const students = [...g1.students, ...g2.students, ...g3.students];
  const teachers = [...g1.teachers, ...g2.teachers, ...g3.teachers];

  /* Dated attendance history: today plus the previous 14 school days. */
  const t0 = isoToday();
  const dates: string[] = [t0];
  for (let d = addDays(t0, -1); dates.length < 15; d = addDays(d, -1)) if (weekdayIdx(d) <= 4) dates.push(d);
  const r = rng(77);
  const attendance: Data["attendance"] = {};
  const teacherAtt: Data["teacherAtt"] = {};
  for (const date of dates) {
    const a: Record<number, AttStatus> = {},
      ta: Record<number, TeacherAtt> = {};
    for (const s of students) {
      // Today the section C classes of the senior grades are left unmarked so registers have something to do.
      if (date === t0 && s.cls.endsWith("C") && gradeOfClass(s.cls) >= 9 && s.id > 10) continue;
      const x = r();
      a[s.id] = x < 0.93 ? "Present" : x < 0.97 ? "Absent" : "Leave";
    }
    for (const t of teachers) {
      const x = r();
      ta[t.id] = x < 0.94 ? "Present" : x < 0.98 ? "Absent" : "On leave";
    }
    attendance[date] = a;
    teacherAtt[date] = ta;
  }
  // Keep the original demo story for today: Sara on leave, Rohan absent, Ms. Ayesha Khan absent.
  Object.assign(attendance[t0], {
    1: "Present",
    2: "Present",
    3: "Absent",
    4: "Present",
    5: "Leave",
    6: "Present",
    7: "Present",
    8: "Present",
    9: "Present",
  });
  delete attendance[t0][10];
  Object.assign(teacherAtt[t0], { 1: "Present", 2: "Present", 3: "Absent", 4: "Present", 5: "Present" });
  // The latest school day had absent teachers too, so substitutes can be reviewed on a weekday.
  const lastSchool = dates.find((d) => d !== t0 && weekdayIdx(d) <= 4);
  if (lastSchool) teacherAtt[lastSchool] = { ...teacherAtt[lastSchool], 3: "Absent", 4: "On leave" };

  const ev = (
    id: number,
    schoolId: number,
    title: string,
    date: string,
    venue: string,
    kind: "Sports" | "Academic",
  ) => ({ id: schoolId * 100 + id, schoolId, title, date, venue, kind });
  const events = [1, 2, 3].flatMap((sid) => [
    ev(1, sid, "Annual athletics meet", "2026-11-24", "Main ground", "Sports"),
    ev(2, sid, "Inter-house football", "2026-11-28", "Sports complex", "Sports"),
    ev(3, sid, "Science exhibition", "2026-12-05", "Auditorium", "Academic"),
    ev(4, sid, "Term 2 examinations begin", "2026-12-01", "All classes", "Academic"),
  ]);
  const notices = [1, 2, 3].flatMap((sid) => [
    {
      id: sid * 100 + 1,
      schoolId: sid,
      title: "Term 2 examination schedule",
      body: "The Term 2 examination timetable is now available. Classes 6–8 begin on 1 December.",
      date: "14 Nov 2026",
      type: "Exam" as const,
      pinned: true,
    },
    {
      id: sid * 100 + 2,
      schoolId: sid,
      title: "Sports day registrations",
      body: "Inter-house sports registrations are open until 25 November. Please register with your class teacher.",
      date: "12 Nov 2026",
      type: "Event" as const,
    },
    {
      id: sid * 100 + 3,
      schoolId: sid,
      title: "Winter vacation notice",
      body: "The school will remain closed from 24 December to 1 January.",
      date: "10 Nov 2026",
      type: "Holiday" as const,
    },
  ]);
  const exams = [1, 2, 3].flatMap((sid) =>
    CLASSES.flatMap((cls, ci) =>
      ["Mathematics", "English", "Science", "Hindi", "Social Science"].map((subject, i) => ({
        id: sid * 10000 + ci * 10 + i + 1,
        schoolId: sid,
        cls,
        subject,
        date: ["2026-12-01", "2026-12-03", "2026-12-05", "2026-12-08", "2026-12-10"][i],
        time: "09:00 – 11:00",
        room: `Room ${100 + ci}`,
      })),
    ),
  );

  const legacyHw: Homework[] = [
    {
      id: 9001,
      schoolId: 1,
      cls: "6 B",
      subject: "Mathematics",
      title: "Exercise 4 · Fractions and decimals",
      due: "2026-11-18",
      by: "Ms. Neha Mehta",
      done: [10],
    },
    {
      id: 9002,
      schoolId: 1,
      cls: "6 B",
      subject: "Science",
      title: "Plant cell diagram",
      due: "2026-11-20",
      by: "Ms. Neha Mehta",
      done: [9],
    },
    {
      id: 9003,
      schoolId: 1,
      cls: "7 A",
      subject: "English",
      title: "Essay · My favourite season",
      due: "2026-11-19",
      by: "Ms. Ayesha Khan",
      done: [5],
    },
    {
      id: 9004,
      schoolId: 1,
      cls: "5 A",
      subject: "Mathematics",
      title: "Worksheet · Multiplication tables",
      due: "2026-11-18",
      by: "Ms. Priya Sharma",
      done: [],
    },
    {
      id: 9005,
      schoolId: 1,
      cls: "8 B",
      subject: "Science",
      title: "Electricity and circuits worksheet",
      due: "2026-11-21",
      by: "Mr. Rahul Verma",
      done: [3],
    },
  ];

  const routesFor = (sid: number, list: typeof students) => [
    {
      id: sid * 10 + 1,
      schoolId: sid,
      name: "Route 1 · North",
      stops: ["Market Square", "Lake View", "School"],
      driver: "Mr. Suresh Kumar",
      phone: "9800000001",
      vehicle: `KA 01 AB ${2000 + sid}`,
      studentIds: list.slice(0, 8).map((s) => s.id),
    },
    {
      id: sid * 10 + 2,
      schoolId: sid,
      name: "Route 2 · South",
      stops: ["Station Road", "Garden Colony", "School"],
      driver: "Mr. Anil Das",
      phone: "9800000002",
      vehicle: `KA 01 CD ${7000 + sid}`,
      studentIds: list.slice(8, 16).map((s) => s.id),
    },
  ];
  const routes = [
    {
      id: 1,
      schoolId: 1,
      name: "Route 1 · Indiranagar",
      stops: ["Indiranagar 100ft Rd", "Domlur", "Old Airport Rd", "School"],
      driver: "Mr. Suresh Kumar",
      phone: "9800000001",
      vehicle: "KA 01 AB 2210",
      studentIds: [9, 10, 1],
    },
    {
      id: 2,
      schoolId: 1,
      name: "Route 2 · Koramangala",
      stops: ["Sony Signal", "Forum Mall", "Ejipura", "School"],
      driver: "Mr. Anil Das",
      phone: "9800000002",
      vehicle: "KA 01 CD 7781",
      studentIds: [5, 6, 3],
    },
    {
      id: 3,
      schoolId: 1,
      name: "Route 3 · Whitefield",
      stops: ["ITPL Gate", "Kadugodi", "Hope Farm", "School"],
      driver: "Mr. Imran Pasha",
      phone: "9800000003",
      vehicle: "KA 03 EF 4402",
      studentIds: [7, 8],
    },
    ...routesFor(2, g2.students),
    ...routesFor(3, g3.students),
  ];
  const bookTitles: [string, string][] = [
    ["Wings of Fire (Young Readers)", "A. P. J. Abdul Kalam"],
    ["The Jungle Book", "Rudyard Kipling"],
    ["Malgudi Days", "R. K. Narayan"],
    ["Science Experiments at Home", "Fiona Watt"],
    ["Panchatantra Tales", "Vishnu Sharma"],
    ["A Brief History of Everything", "Bill Bryson"],
    ["Gitanjali (Selected)", "Rabindranath Tagore"],
    ["Mathematics Is Fun", "Lakshmi Rao"],
  ];
  const books = [1, 2, 3].flatMap((sid) =>
    bookTitles.map(([title, author], i) => ({ id: sid * 100 + i + 1, schoolId: sid, title, author })),
  );
  Object.assign(books[0], { issuedTo: 9, due: "2026-11-25" });
  Object.assign(books[1], { issuedTo: 5, due: "2026-11-10" });

  return {
    schools,
    students,
    teachers,
    fees: [...g1.fees, ...g2.fees, ...g3.fees],
    leaves: [
      {
        id: 1,
        schoolId: 1,
        person: "Ms. Neha Mehta",
        role: "Teacher",
        cls: "Mathematics",
        from: "2026-11-20",
        to: "2026-11-21",
        reason: "Family commitment",
        status: "Pending",
      },
      {
        id: 2,
        schoolId: 1,
        person: "Sara Khan",
        role: "Student",
        cls: "7 A",
        from: "2026-11-18",
        to: "2026-11-18",
        reason: "Not feeling well",
        status: "Pending",
        studentId: 5,
      },
      {
        id: 3,
        schoolId: 1,
        person: "Mr. Karan Patel",
        role: "Teacher",
        cls: "Hindi",
        from: "2026-11-09",
        to: "2026-11-09",
        reason: "Medical appointment",
        status: "Approved",
      },
    ],
    homework: [...legacyHw, ...g1.homework, ...g2.homework, ...g3.homework],
    notices,
    events,
    exams,
    books,
    routes,
    messages: [
      {
        id: 1,
        studentId: 9,
        teacherId: 5,
        from: "teacher",
        text: "Aarav did very well in the fractions quiz. Please encourage him to keep practising decimals.",
        at: new Date("2026-11-17T16:10:00").getTime(),
        read: false,
      },
      {
        id: 2,
        studentId: 5,
        teacherId: 5,
        from: "family",
        text: "Sara will be absent on 18 November as she is unwell. Please share the classwork.",
        at: new Date("2026-11-17T20:30:00").getTime(),
        read: false,
      },
      {
        id: 3,
        studentId: 9,
        teacherId: 5,
        from: "family",
        text: "Thank you, ma'am. Could you also share extra practice worksheets?",
        at: new Date("2026-11-16T18:05:00").getTime(),
        read: true,
      },
    ],
    resources: [
      {
        id: 1,
        schoolId: 1,
        cls: "6 B",
        subject: "Mathematics",
        title: "Fractions and decimals · revision notes",
        kind: "Notes",
        by: "Ms. Neha Mehta",
        date: "2026-11-15",
        url: "https://example.com/fractions-notes",
      },
      {
        id: 2,
        schoolId: 1,
        cls: "6 B",
        subject: "Science",
        title: "Plant cell · labelled diagram guide",
        kind: "Worksheet",
        by: "Ms. Neha Mehta",
        date: "2026-11-14",
      },
      {
        id: 3,
        schoolId: 1,
        cls: "7 A",
        subject: "English",
        title: "Essay writing · structure and examples",
        kind: "Notes",
        by: "Ms. Ayesha Khan",
        date: "2026-11-13",
      },
      {
        id: 4,
        schoolId: 1,
        cls: "8 B",
        subject: "Science",
        title: "Electricity · animated explainer",
        kind: "Video",
        by: "Mr. Rahul Verma",
        date: "2026-11-12",
        url: "https://example.com/electricity-video",
      },
      {
        id: 5,
        schoolId: 1,
        cls: "5 A",
        subject: "Mathematics",
        title: "Multiplication tables · practice sheet",
        kind: "Worksheet",
        by: "Ms. Priya Sharma",
        date: "2026-11-11",
      },
    ],
    slots: [
      { id: 1, teacherId: 5, date: "2026-11-26", time: "16:00 – 16:15", bookedBy: 9 },
      { id: 2, teacherId: 5, date: "2026-11-26", time: "16:15 – 16:30" },
      { id: 3, teacherId: 5, date: "2026-11-27", time: "15:30 – 15:45" },
      { id: 4, teacherId: 1, date: "2026-11-26", time: "15:00 – 15:15" },
      { id: 5, teacherId: 2, date: "2026-11-27", time: "16:00 – 16:15" },
    ],
    remarks: [
      {
        id: 1,
        studentId: 9,
        teacherId: 5,
        kind: "Praise",
        text: "Volunteered to explain the fractions method to the class. Excellent confidence.",
        date: "2026-11-14",
      },
      {
        id: 2,
        studentId: 10,
        teacherId: 5,
        kind: "Concern",
        text: "Homework has been incomplete for the last two weeks. Please follow up at home.",
        date: "2026-11-13",
      },
      {
        id: 3,
        studentId: 5,
        teacherId: 3,
        kind: "Note",
        text: "Lovely handwriting and a thoughtful essay draft.",
        date: "2026-11-12",
      },
    ],
    tickets: [
      {
        id: 1,
        school: "Greenwood Public School",
        topic: "Login support",
        status: "Open",
        priority: "High",
        note: "Two parents cannot find their login IDs.",
        created: "2026-11-17",
      },
      {
        id: 2,
        school: "Riverdale School",
        topic: "Subscription query",
        status: "In progress",
        priority: "Normal",
        note: "Asked about upgrading from Starter to Growth.",
        created: "2026-11-15",
      },
      {
        id: 3,
        school: "Greenwood Public School",
        topic: "Report card format",
        status: "Open",
        priority: "Low",
        note: "Would like the school logo on report cards.",
        created: "2026-11-12",
      },
      {
        id: 4,
        school: "Riverdale School",
        topic: "Bulk student import",
        status: "Resolved",
        priority: "Normal",
        note: "Imported 120 students from CSV.",
        created: "2026-11-05",
      },
    ],
    activity: [
      {
        id: 1,
        schoolId: 1,
        who: "Ms. Neha Mehta",
        role: "Teacher",
        action: "Published study material: Fractions and decimals · revision notes",
        at: new Date("2026-11-15T10:20:00").getTime(),
      },
      {
        id: 2,
        schoolId: 1,
        who: "Admin Greenwood",
        role: "Admin",
        action: "Approved leave for Mr. Karan Patel",
        at: new Date("2026-11-09T09:05:00").getTime(),
      },
      {
        id: 3,
        schoolId: 1,
        who: "Admin Greenwood",
        role: "Admin",
        action: "Published notice: Term 2 examination schedule",
        at: new Date("2026-11-14T11:40:00").getTime(),
      },
    ],
    attendance,
    teacherAtt,
    substitutions: [],
    classes: [],
    submissions: [],
    marks: {},
    schoolProfile: {
      principal: "Dr. Meenakshi Rao",
      email: "office@greenwood.example",
      address: "12 Lake Road, Bengaluru",
    },
  };
}

export const seed: Data = build();
