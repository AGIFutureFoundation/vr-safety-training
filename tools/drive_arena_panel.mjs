#!/usr/bin/env node
/**
 * ROBO-ARENA: a headless drive of the read-only "Robot arena" panel on the robotics programme page. Reports page errors,
 * off-host requests and the panel's rows, and (with an output directory) writes 1920×1080 stills of the panel in the
 * dark and light schemes. Prints no timing.
 *
 *     node tools/drive_arena_panel.mjs [port] [outDir]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const port = Number(process.argv[2]) || 9145, outDir = process.argv[3] || null;
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], rows: 0, cards: 0, stills: [] };
for (const scheme of ["dark", "light"]) {
  const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, colorScheme: scheme });
  const page = await context.newPage();
  page.on("pageerror", (e) => out.pageErrors.push(e.message));
  page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; out.offHost.push(u); });
  await page.goto(`${base}/robotics/programme.html#arena`, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(600);
  out.rows = await page.locator("[data-ra-row]").count();
  out.cards = await page.locator("[data-ra-scenario]").count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  out.horizontalOverflow = overflow;
  if (outDir) {
    await page.locator("#h-arena").scrollIntoViewIfNeeded();
    await page.evaluate(() => { const el = document.getElementById("arena"); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 16); });
    await page.waitForTimeout(300);
    const p = join(outDir, `arena-panel-${scheme}-1920x1080.png`);
    await page.screenshot({ path: p });
    out.stills.push(p);
    await page.evaluate(() => { const el = document.querySelector(".ra-grid"); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60); });
    await page.waitForTimeout(300);
    const q = join(outDir, `arena-bars-${scheme}-1920x1080.png`);
    await page.screenshot({ path: q });
    out.stills.push(q);
  }
  await context.close();
}
await browser.close();
await close();
console.log(JSON.stringify(out, null, 1));
process.exit(out.pageErrors.length || out.offHost.length ? 1 : 0);
