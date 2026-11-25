// Layout QA. Signs in as every role, opens every menu page at desktop and phone width, in light and dark mode.
// Reports: page crashes, JavaScript errors, and pages that scroll sideways (a sign that something does not fit).
// Usage: BASE=http://localhost:3241 node tools/qa-layout.js
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3241";

async function login(body) {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (res.headers.get("set-cookie") || "").split(";")[0];
}

(async () => {
  const admin = await login({ role: "Admin", schoolId: 1, loginId: "admin.greenwood", password: "x" });
  const { data } = await (await fetch(BASE + "/api/data", { headers: { cookie: admin } })).json();
  const student = data.students[0];
  const roles = {
    "Super Admin": await login({
      role: "Super Admin",
      schoolId: null,
      loginId: "platform.admin",
      password: "x",
    }),
    Admin: admin,
    Teacher: await login({ role: "Teacher", schoolId: 1, loginId: data.teachers[0].loginId, password: "x" }),
    Student: await login({
      role: "Parent / Student",
      schoolId: 1,
      loginId: student.loginId,
      password: student.password,
    }),
    Parent: await login({
      role: "Parent / Student",
      schoolId: 1,
      loginId: student.parentLoginId,
      password: student.parentPassword,
    }),
  };

  const browser = await chromium.launch();
  const problems = [];
  let checked = 0;

  for (const [role, cookie] of Object.entries(roles)) {
    for (const size of [
      { name: "desktop", w: 1360, h: 860 },
      { name: "phone", w: 390, h: 844 },
    ]) {
      for (const theme of ["light", "dark"]) {
        const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h } });
        await ctx.addInitScript((t) => localStorage.setItem("efficht_theme", t), theme);
        const [n, v] = cookie.split("=");
        await ctx.addCookies([{ name: n, value: v, url: BASE }]);
        const page = await ctx.newPage();
        const label = `${role} · ${size.name} · ${theme}`;
        page.on("pageerror", (e) => problems.push(`${label}: JS error ${e.message}`));
        await page.goto(BASE);
        await page.waitForSelector(".nav-item");

        const names = await page.$$eval(".nav-item:not(.signout)", (els) =>
          els.map((e) => e.textContent.trim()),
        );
        for (const name of names) {
          if (size.name === "phone") await page.locator(".menu-btn").click();
          await page.locator(".nav-item", { hasText: name }).first().click();
          await page.waitForTimeout(150);
          const text = await page.locator("body").innerText();
          if (/Application error|Something went wrong/.test(text))
            problems.push(`${label}: crash on "${name}"`);
          const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          );
          if (overflow > 2) problems.push(`${label}: "${name}" scrolls sideways by ${overflow}px`);
          checked++;
        }
        await ctx.close();
      }
    }
  }

  await browser.close();
  console.log(`Checked ${checked} page views.`);
  console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "NO PROBLEMS");
})();
