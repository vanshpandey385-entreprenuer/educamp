// Browser test for the Classes page and the homework PDF flow. Sessions are created through the API.
const { chromium } = require("playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://localhost:3241";
const SHOTS = process.env.SHOTS || "/tmp";
let failures = 0;
const check = (name, ok) => {
  console.log(ok ? "PASS" : "FAIL", name);
  if (!ok) failures++;
};

async function apiLogin(body) {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { cookie: (res.headers.get("set-cookie") || "").split(";")[0], json: await res.json() };
}
const dataOf = async (who) =>
  (await (await fetch(BASE + "/api/data", { headers: { cookie: who.cookie } })).json()).data;

(async () => {
  fs.writeFileSync("/tmp/homework-test.pdf", "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");
  const platform = await apiLogin({
    role: "Super Admin",
    schoolId: null,
    loginId: "platform.admin",
    password: "x",
  });
  await fetch(BASE + "/api/data/reset", { method: "POST", headers: { cookie: platform.cookie } });

  const admin = await apiLogin({ role: "Admin", schoolId: 1, loginId: "admin.greenwood", password: "x" });
  const d = await dataOf(admin);
  const student = d.students.find((s) => s.parentLoginId === "p.aarav");
  const hw = d.homework.find((h) => h.cls === student.cls);
  const teacherRow = d.teachers.find((t) => t.name === hw.by);
  const parent = await apiLogin({
    role: "Parent / Student",
    schoolId: 1,
    loginId: "p.aarav",
    password: student.parentPassword,
  });
  const teacher = await apiLogin({
    role: "Teacher",
    schoolId: 1,
    loginId: teacherRow.loginId,
    password: "x",
  });

  const browser = await chromium.launch();
  const errors = [];
  async function open(who, label) {
    const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
    const [name, value] = who.cookie.split("=");
    await ctx.addCookies([{ name, value, url: BASE }]);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${label}: ${e.message}`));
    await page.goto(BASE);
    await page.waitForSelector(".nav-item");
    return { ctx, page };
  }
  const nav = (page, text) => page.locator(".nav-item", { hasText: text }).first().click();
  const bell = async (page) => {
    await page.locator("[aria-label^='Notifications']").click();
    const t = await page
      .locator(".popover, .pop, [class*=pop]")
      .first()
      .innerText()
      .catch(() => "");
    await page.keyboard.press("Escape");
    return t;
  };

  // ---- 1. Admin adds a class ----
  {
    const { ctx, page } = await open(admin, "admin");
    await nav(page, "Classes");
    await page.getByRole("button", { name: /Add class/ }).click();
    await page.screenshot({ path: `${SHOTS}/f-addclass.png` });
    await page
      .locator(".modal")
      .getByRole("button", { name: /^Add Class/ })
      .click();
    await page.waitForTimeout(1200);
    check(
      "new class appears in Classes list",
      (await page.locator("body").innerText()).includes("Class 6 D"),
    );
    await page.reload();
    await page.waitForSelector(".nav-item");
    await nav(page, "Classes");
    check("new class survives reload", (await page.locator("body").innerText()).includes("Class 6 D"));
    await nav(page, "Student attendance");
    await page.waitForTimeout(300);
    await page.getByRole("tab", { name: "Class 6", exact: true }).click();
    check(
      "new class has a register card in attendance",
      (await page.locator(".class-card h3", { hasText: "Class 6 D" }).count()) === 1,
    );
    await nav(page, "Timetable");
    await page.waitForTimeout(300);
    await page.locator("select[aria-label='Class']").selectOption("6 D");
    check("timetable opens for the new class", (await page.locator("table.tt").count()) === 1);
    await ctx.close();
  }

  // ---- 2. Student adds PDF ----
  {
    const { ctx, page } = await open(parent, "student");
    await nav(page, "Homework");
    await page.waitForSelector(".hw-card");
    await page.screenshot({ path: `${SHOTS}/f-student-before.png` });
    const card = page.locator(".hw-card", { hasText: hw.title });
    check("card has Add PDF button", (await card.getByRole("button", { name: /Add PDF/ }).count()) === 1);
    await card.locator("input[type=file]").setInputFiles("/tmp/homework-test.pdf");
    await page.waitForTimeout(1500);
    check("status becomes Waiting for teacher", (await card.innerText()).includes("Waiting for teacher"));
    check("file name shown", (await card.innerText()).includes("homework-test.pdf"));
    await page.screenshot({ path: `${SHOTS}/f-student-submitted.png` });
    await ctx.close();
  }

  // ---- 3. Teacher is notified and reviews ----
  {
    const { ctx, page } = await open(teacher, "teacher");
    await page.locator("[aria-label^='Notifications']").click();
    await page.waitForTimeout(300);
    check(
      "teacher bell mentions homework to review",
      (await page.locator("body").innerText()).includes("to review"),
    );
    await page.screenshot({ path: `${SHOTS}/f-teacher-bell.png` });
    await page.keyboard.press("Escape");
    await page.mouse.click(5, 5);
    await nav(page, "Homework");
    const card = page.locator(".hw-card", { hasText: hw.title });
    await card.getByRole("button", { name: /Review PDFs/ }).click();
    await page.waitForSelector(".review-row");
    await page.screenshot({ path: `${SHOTS}/f-teacher-review.png` });
    // Headless Chrome cannot show a PDF viewer, so check the link itself. The server's reply is covered by api-test.js.
    const link = page.locator(".review-row .hw-file").first();
    check(
      "View file link opens /api/files/... in a new tab",
      (await link.getAttribute("href")).startsWith("/api/files/") &&
        (await link.getAttribute("target")) === "_blank",
    );
    await page
      .locator(".review-row")
      .first()
      .getByRole("button", { name: /Not approve/ })
      .click();
    await page.locator(".review-row textarea").fill("Please rewrite question 3.");
    await page.getByRole("button", { name: /Save as not approved/ }).click();
    await page.waitForTimeout(1200);
    check(
      "teacher sees Not approved status",
      (await page.locator(".review-row").first().innerText()).includes("Not approved"),
    );
    await ctx.close();
  }

  // ---- 4. Student is notified of the decision ----
  {
    const { ctx, page } = await open(parent, "student2");
    await page.locator("[aria-label^='Notifications']").click();
    await page.waitForTimeout(300);
    check(
      "student bell mentions teacher checked homework",
      (await page.locator("body").innerText()).includes("Your teacher checked"),
    );
    await page.keyboard.press("Escape");
    await page.mouse.click(5, 5);
    await nav(page, "Homework");
    const card = page.locator(".hw-card", { hasText: hw.title });
    const text = await card.innerText();
    check(
      "student sees Not approved + teacher remark",
      text.includes("Not approved") && text.includes("Please rewrite question 3."),
    );
    check(
      "student sees Upload again button",
      (await card.getByRole("button", { name: /Upload again/ }).count()) === 1,
    );
    await page.screenshot({ path: `${SHOTS}/f-student-notapproved.png` });
    await card.locator("input[type=file]").setInputFiles("/tmp/homework-test.pdf");
    await page.waitForTimeout(1500);
    check(
      "after upload again, waiting for teacher",
      (await card.innerText()).includes("Waiting for teacher"),
    );
    await ctx.close();
  }

  // ---- 5. Teacher approves ----
  {
    const { ctx, page } = await open(teacher, "teacher2");
    await nav(page, "Homework");
    await page
      .locator(".hw-card", { hasText: hw.title })
      .getByRole("button", { name: /Review PDFs/ })
      .click();
    await page
      .locator(".review-row")
      .first()
      .getByRole("button", { name: /Approve/ })
      .click();
    await page.waitForTimeout(1200);
    check("teacher approves", (await page.locator(".review-row").first().innerText()).includes("Approved"));
    await ctx.close();
  }
  {
    const { ctx, page } = await open(parent, "student3");
    await nav(page, "Homework");
    const card = page.locator(".hw-card", { hasText: hw.title });
    check("student sees Approved", (await card.innerText()).includes("Approved"));
    check(
      "no upload button once approved",
      (await card.getByRole("button", { name: /PDF|Upload/ }).count()) === 0,
    );
    await ctx.close();
  }

  await browser.close();
  console.log(errors.length ? "PAGE ERRORS:\n" + errors.join("\n") : "no page errors");
  console.log(failures ? `${failures} FAILED` : "ALL PASSED");
})();
