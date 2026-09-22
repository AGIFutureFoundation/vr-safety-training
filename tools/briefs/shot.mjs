// Screenshot a station from its own spawn look, without walking or dragging —
// the quality script turns the camera, which is no good for judging whether a
// below-grade scene reads.
import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs";
import { mkdirSync } from "node:fs";
import { makePage } from "./pro/helpers.mjs";
const SP = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
const OUT = `${SP}/quality`; mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
for (const sim of process.argv.slice(2)) {
  const { context, page } = await makePage(browser, { viewport: { width: 1280, height: 720 } });
  await context.addInitScript((sid) => { try {
    const k = "vr-training-profile-v1"; const p = JSON.parse(localStorage.getItem(k) || "{}");
    p.briefed = p.briefed || {}; p.briefed[sid] = "2026-01-01T00:00:00.000Z";
    localStorage.setItem(k, JSON.stringify(p));
  } catch (e) {} }, sim);
  await page.goto(`http://localhost:8970/smartcity/dist/smartcity-x.html?sim=${sim}&time=day`, { waitUntil: "load" });
  await page.waitForSelector("#enter-flat", { timeout: 20000 });
  await page.evaluate(() => document.querySelector("#enter-flat").click());
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/${sim}_spawn.png` });
  console.log(`${OUT}/${sim}_spawn.png`);
  await context.close();
}
await browser.close();
