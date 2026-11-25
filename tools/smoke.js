// Browser smoke test: signs in as every role, opens every menu page, adds a teacher, checks saving.
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://localhost:3222";
const SHOTS = process.env.SHOTS || "/tmp";
(async () => {
  const browser = await chromium.launch();
  const problems = [];
  async function session(label, fn) {
    const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`${label}: pageerror ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error" && !/favicon|fonts/.test(m.text()))
        problems.push(`${label}: console ${m.text().slice(0, 140)}`);
    });
    await page.goto(BASE);
    await fn(page);
    await ctx.close();
  }
  async function walk(page, label) {
    const items = await page.$$eval(".nav-item:not(.signout)", (els) => els.map((e) => e.textContent.trim()));
    for (const name of items) {
      await page.locator(".nav-item", { hasText: name }).first().click();
      await page.waitForTimeout(120);
      const txt = await page.locator("main, .content, body").first().innerText();
      if (/Application error|Something went wrong/.test(txt)) problems.push(`${label}: crash on ${name}`);
    }
    console.log(label, "pages:", items.length);
  }
  async function loginAs(page, roleTab, demo) {
    if (roleTab) await page.getByRole("tab", { name: roleTab }).click();
    await page.getByText("Fill demo credentials").click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /^Sign in/ }).click();
    await page.waitForSelector(".nav-item", { timeout: 8000 });
  }

  await session("login", async (page) => {
    await page.waitForSelector(".login-form");
    await page.screenshot({ path: `${SHOTS}/v12-login.png` });
  });

  await session("parent", async (p) => {
    await loginAs(p, "Parent / Student");
    await p.screenshot({ path: `${SHOTS}/v12-parent.png` });
    await walk(p, "parent");
  });
  await session("teacher", async (p) => {
    await loginAs(p, "Teacher");
    await walk(p, "teacher");
  });
  await session("super", async (p) => {
    await p.getByText("Platform staff sign in").click();
    await loginAs(p, null);
    await p.screenshot({ path: `${SHOTS}/v12-super.png` });
    await walk(p, "super");
  });

  await session("admin", async (p) => {
    await loginAs(p, "Admin");
    await p.screenshot({ path: `${SHOTS}/v12-admin.png` });
    await walk(p, "admin");
    await p.locator(".nav-item", { hasText: "Teachers" }).first().click();
    await p.getByRole("button", { name: /Add teacher/ }).click();
    const modal = p.locator(".modal");
    await modal.locator("input[type=text], input:not([type])").first().fill("Zara Smoketest");
    await modal.locator(".pick").first().click();
    await p.screenshot({ path: `${SHOTS}/v12-addteacher.png` });
    const before = await p.locator("body").innerText();
    await modal.getByRole("button", { name: "Add teacher" }).click();
    await p.waitForTimeout(1500);
    const after = await p.locator("body").innerText();
    console.log("add teacher shows name:", after.includes("Zara Smoketest"));
    // Reload: data must come back from the server.
    await p.reload();
    await p.waitForSelector(".nav-item");
    await p.locator(".nav-item", { hasText: "Teachers" }).first().click();
    await p
      .getByPlaceholder(/search/i)
      .first()
      .fill("Zara");
    await p.waitForTimeout(400);
    console.log("persisted after reload:", (await p.locator("body").innerText()).includes("Zara Smoketest"));
  });

  await browser.close();
  console.log(problems.length ? "PROBLEMS:\n" + problems.join("\n") : "NO PROBLEMS");
})();
