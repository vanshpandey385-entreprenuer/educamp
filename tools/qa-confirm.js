// Checks the confirm dialog: Cancel keeps the record, Remove deletes it, and no browser popup appears.
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3241";
const SHOT = process.env.SHOT;
(async () => {
  const res = await fetch(BASE + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role: "Admin", schoolId: 1, loginId: "admin.greenwood", password: "x" }),
  });
  const [name, value] = (res.headers.get("set-cookie") || "").split(";")[0].split("=");
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
  await ctx.addInitScript(() => localStorage.setItem("efficht_theme", "dark"));
  await ctx.addCookies([{ name, value, url: BASE }]);
  const page = await ctx.newPage();
  let nativePopup = false;
  page.on("dialog", (d) => {
    nativePopup = true;
    d.dismiss();
  });
  await page.goto(BASE);
  await page.waitForSelector(".nav-item");
  await page.locator(".nav-item", { hasText: "Teachers" }).first().click();
  await page.waitForTimeout(300);
  const firstTeacher = await page.locator("tbody tr").first().innerText();
  await page.locator("button.icon-btn.danger").first().click();
  await page.waitForSelector("[role=dialog]");
  if (SHOT) await page.screenshot({ path: SHOT });
  await page.getByRole("button", { name: "Cancel" }).click();
  const firstAfterCancel = await page.locator("tbody tr").first().innerText();
  console.log(
    firstAfterCancel === firstTeacher ? "PASS cancel keeps the teacher" : "FAIL cancel removed a teacher",
  );
  await page.locator("button.icon-btn.danger").first().click();
  await page.waitForSelector("[role=dialog]");
  await page.locator("[role=dialog]").getByRole("button", { name: "Remove", exact: true }).click();
  await page.waitForTimeout(300);
  const firstAfterRemove = await page.locator("tbody tr").first().innerText();
  console.log(
    firstAfterRemove !== firstTeacher ? "PASS remove deletes the teacher" : "FAIL teacher is still listed",
  );
  console.log(nativePopup ? "FAIL a browser popup appeared" : "PASS no browser popup");
  await browser.close();
})();
