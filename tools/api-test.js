// API checks for classes + homework PDFs. Run: BASE=http://localhost:3000 node tools/api-test.js
const BASE = process.env.BASE || "http://localhost:3241";
let failures = 0;
const check = (name, ok, extra = "") => {
  console.log(ok ? "PASS" : "FAIL", name, ok ? "" : extra);
  if (!ok) failures++;
};

async function login(body) {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const cookie = (res.headers.get("set-cookie") || "").split(";")[0];
  return { cookie, json: await res.json() };
}
const call = async (who, path, opts = {}) => {
  const res = await fetch(BASE + path, { ...opts, headers: { ...(opts.headers || {}), cookie: who.cookie } });
  return res;
};
const getData = async (who) => (await (await call(who, "/api/data")).json()).data;
const patch = (who, p) =>
  call(who, "/api/data", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ patch: p }),
  });
const pdf = (text = "hello") =>
  new File([Buffer.from("%PDF-1.4\n" + text + "\n%%EOF")], "my homework.pdf", { type: "application/pdf" });
const upload = async (who, file) => {
  const f = new FormData();
  f.append("file", file);
  const r = await call(who, "/api/files", { method: "POST", body: f });
  return { status: r.status, json: await r.json() };
};

(async () => {
  const admin = await login({ role: "Admin", schoolId: 1, loginId: "admin.greenwood", password: "x" });
  let d = await getData(admin);
  check("old database migrated: classes list exists", Array.isArray(d.classes));
  check("old database migrated: submissions list exists", Array.isArray(d.submissions));

  // ---- classes ----
  const created = { id: Date.now(), schoolId: 0, name: "6 D", grade: 6, section: "D", createdAt: Date.now() };
  let r = await patch(admin, { classes: [...d.classes, created] });
  check("admin can add class", r.status === 200);
  d = await getData(admin);
  check(
    "class saved and stamped with school",
    d.classes.some((c) => c.name === "6 D" && c.schoolId === 1),
  );
  const sa = await login({ role: "Teacher", schoolId: 1, loginId: d.teachers[0].loginId, password: "x" });
  r = await patch(sa, { classes: [] });
  check("teacher cannot change classes", r.status === 403);

  // ---- homework flow ----
  const student = d.students.find((s) => s.parentLoginId === "p.aarav");
  const hw = d.homework.find((h) => h.cls === student.cls);
  check("found a homework for the demo student's class", !!hw);
  const parent = await login({
    role: "Parent / Student",
    schoolId: 1,
    loginId: "p.aarav",
    password: student.parentPassword,
  });
  const other = d.students.find((s) => s.cls !== student.cls && s.cls !== "x");
  const otherLogin = await login({
    role: "Parent / Student",
    schoolId: 1,
    loginId: other.loginId,
    password: other.password,
  });

  let up = await upload(
    parent,
    new File([Buffer.from("not a pdf at all")], "x.pdf", { type: "application/pdf" }),
  );
  check("non-PDF rejected", up.status === 400, JSON.stringify(up));
  up = await upload(
    parent,
    new File([Buffer.alloc(5 * 1024 * 1024, 65)], "big.pdf", { type: "application/pdf" }),
  );
  check("5 MB file rejected", up.status === 400, JSON.stringify(up));
  up = await upload(admin, pdf());
  check("admin cannot upload", up.status === 403);
  up = await upload(parent, pdf("real"));
  check("PDF accepted", up.status === 200 && up.json.file?.id, JSON.stringify(up));
  const fileId = up.json.file.id;

  const sub = (extra = {}) => ({
    id: Date.now(),
    schoolId: 0,
    homeworkId: hw.id,
    studentId: student.id,
    fileId,
    fileName: "evil",
    fileSize: 1,
    submittedAt: 1,
    status: "Approved",
    remark: "x",
    studentSeen: true,
    ...extra,
  });
  r = await patch(parent, { submissions: [sub()] });
  d = await (async () => getData(parent))();
  let mine = d.submissions.find((s) => s.homeworkId === hw.id);
  check("student submission saved", r.status === 200 && !!mine);
  check(
    "student cannot approve own work (status forced to Pending review)",
    mine?.status === "Pending review",
    mine?.status,
  );
  check(
    "file name comes from the server, not the client",
    mine?.fileName === "my homework.pdf",
    mine?.fileName,
  );

  const otherFile = (await upload(otherLogin, pdf("theirs"))).json.file.id;
  r = await patch(parent, { submissions: [sub({ fileId: otherFile, id: mine.id })] });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check("cannot attach someone else's file", mine.fileId === fileId);

  let fr = await call(parent, "/api/files/" + fileId);
  check("owner can open the file", fr.status === 200 && fr.headers.get("content-type") === "application/pdf");
  fr = await call(otherLogin, "/api/files/" + fileId);
  check("another student cannot open it", fr.status === 403);
  fr = await fetch(BASE + "/api/files/" + fileId);
  check("signed-out cannot open it", fr.status === 401);
  fr = await call(parent, "/api/files/..%2f..%2fetc");
  check("odd file id rejected", fr.status === 404);

  // teacher who set the homework
  const t = d.teachers.find((x) => x.name === hw.by);
  const teacher = await login({ role: "Teacher", schoolId: 1, loginId: t.loginId, password: "x" });
  let td = await getData(teacher);
  const row = td.submissions.find((s) => s.id === mine.id);
  check("teacher sees the submission", !!row);
  fr = await call(teacher, "/api/files/" + fileId);
  check("teacher can open the file", fr.status === 200);
  r = await patch(teacher, {
    submissions: [{ ...row, status: "Not approved", remark: "Redo question 3", fileId: "tampered" }],
  });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check(
    "teacher decision saved with remark",
    mine.status === "Not approved" && mine.remark === "Redo question 3",
  );
  check("teacher cannot change the file", mine.fileId === fileId);
  check("student has not seen decision yet (bell)", mine.studentSeen === false);
  check("reviewer name set by server", mine.reviewedBy === t.name);

  // student marks seen, then re-uploads after Not approved
  r = await patch(parent, { submissions: [{ ...mine, studentSeen: true, status: "Approved" }] });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check(
    "student can only mark seen (status unchanged)",
    mine.studentSeen === true && mine.status === "Not approved",
  );
  const second = (await upload(parent, pdf("fixed"))).json.file.id;
  await patch(parent, { submissions: [{ ...mine, fileId: second }] });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check(
    "re-upload resets to Pending review and clears remark",
    mine.status === "Pending review" && !mine.remark && mine.fileId === second,
  );

  // a different teacher (not owner, not class teacher) cannot approve
  const stranger = d.teachers.find((x) => x.name !== hw.by && x.homeroom !== hw.cls);
  const st = await login({ role: "Teacher", schoolId: 1, loginId: stranger.loginId, password: "x" });
  const srow = (await getData(st)).submissions.find((s) => s.id === mine.id);
  await patch(st, { submissions: [{ ...srow, status: "Approved" }] });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check("unrelated teacher cannot approve", mine.status === "Pending review");

  await patch(teacher, { submissions: [{ ...srow, id: mine.id, status: "Approved" }] });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check("owner teacher approves", mine.status === "Approved");
  await patch(parent, {
    submissions: [{ ...mine, fileId: (await upload(parent, pdf("late"))).json.file.id }],
  });
  mine = (await getData(parent)).submissions.find((s) => s.homeworkId === hw.id);
  check("approved work is final (cannot be replaced)", mine.fileId === second && mine.status === "Approved");

  // student sees only own submissions
  check(
    "student only receives own submissions",
    (await getData(parent)).submissions.every((s) => s.studentId === student.id),
  );

  // activity log is append-only
  const before = (await getData(admin)).activity.length;
  await patch(parent, {
    activity: [
      { id: Math.random(), schoolId: 1, who: "Principal", role: "Admin", action: "forged", at: Date.now() },
    ],
  });
  const after = (await getData(admin)).activity;
  check("activity log not wiped by a student", after.length >= before);
  check(
    "activity author comes from the session",
    after.find((a) => a.action === "forged")?.who !== "Principal",
  );

  console.log(failures ? `\n${failures} FAILED` : "\nALL PASSED");
  process.exit(failures ? 1 : 0);
})();
