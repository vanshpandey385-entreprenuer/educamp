// Takes screenshots of key screens in light/dark and desktop/mobile. Usage: OUT=/folder node tools/screenshots.js
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3241";
const OUT = process.env.OUT || "/tmp";
async function apiLogin(body) {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return (res.headers.get("set-cookie") || "").split(";")[0];
}
(async () => {
  const browser = await chromium.launch();
  const admin = await apiLogin({ role: "Admin", schoolId: 1, loginId: "admin.greenwood", password: "x" });
  const jobs = [
    { name: "login", cookie: null, pages: [""] },
    { name: "admin", cookie: admin, pages: ["", "Students", "Homework", "Fees"] },
  ];
  for (const theme of ["light", "dark"]) {
    for (const size of [
      { n: "desktop", w: 1360, h: 860 },
      { n: "mobile", w: 390, h: 844 },
    ]) {
      for (const job of jobs) {
        const ctx = await browser.newContext({
          viewport: { width: size.w, height: size.h },
          deviceScaleFactor: 1,
        });
        await ctx.addInitScript((t) => localStorage.setItem("efficht_theme", t), theme);
        if (job.cookie) {
          const [name, value] = job.cookie.split("=");
          await ctx.addCookies([{ name, value, url: BASE }]);
        }
        const page = await ctx.newPage();
        await page.goto(BASE);
        await page.waitForSelector(job.cookie ? ".nav-item" : ".login-form");
        for (const p of job.pages) {
          if (p) {
            if (size.n === "mobile") await page.locator(".menu-btn").click();
            await page.locator(".nav-item", { hasText: p }).first().click();
          }
          await page.waitForTimeout(900);
          await page.screenshot({
            fullPage: true,
            path: `${OUT}/s-${job.name}-${p || "home"}-${theme}-${size.n}.png`,
          });
        }
        await ctx.close();
      }
    }
  }
  // collapsed sidebar
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
  const [name, value] = admin.split("=");
  await ctx.addCookies([{ name, value, url: BASE }]);
  const page = await ctx.newPage();
  await page.goto(BASE);
  await page.waitForSelector(".nav-item");
  await page.locator(".side-collapse").click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/s-admin-collapsed.png` });
  await browser.close();
})();
