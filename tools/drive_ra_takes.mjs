#!/usr/bin/env node
/**
 * ARENA-2: a headless drive of the data page's "Export my takes to the arena set" button (shared/ra-takes.js) over a
 * fixture store. A: signed out, 0 takes. B: a signed-in adult test profile opts in on the page's consent panel, two
 * synthetic-shaped takes are written into the page's own store as that learner's takes, and the button exports 2 with a
 * provenance row each. C: revoke on the consent panel, and the button exports 0. D: at 390×844 the button is at least
 * 44 px tall and the page does not scroll sideways. Reports page errors and off-host requests; prints no timing.
 *
 *     node tools/drive_ra_takes.mjs [port] [outDir]
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools/lib/pv_browser.mjs")).href);

const port = Number(process.argv[2]) || 9151, outDir = process.argv[3] || null;
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
const page = await context.newPage();
const out = { pageErrors: [], offHost: [] };
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; out.offHost.push(u); });
const url = `${base}/data/index.html`;
const press = async () => {
  await page.evaluate(() => { delete document.getElementById("ra-takes").dataset.raTakes; document.querySelector("#ra-takes .ra-takes-go").click(); });
  await page.waitForFunction(() => document.getElementById("ra-takes")?.dataset.raTakes !== undefined, null, { timeout: 30000 });
  return page.evaluate(() => ({ takes: Number(document.getElementById("ra-takes").dataset.raTakes), status: document.querySelector("#ra-takes .ra-takes-status").textContent, rows: [...document.querySelectorAll("#ra-takes .ra-takes-prov tbody tr")].map((tr) => [...tr.children].map((td) => td.textContent)) }));
};

// A: signed out
await page.goto(url, { waitUntil: "load", timeout: 120000 });
await page.waitForSelector("#ra-takes .ra-takes-go");
out.A_signedOut = await press();

// B: a signed-in adult test profile opts in on the consent panel; two takes are written into the page's own store
await page.evaluate(() => localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check" })));
await page.goto(url, { waitUntil: "load", timeout: 120000 });
await page.waitForSelector("#dx-optin");
await page.evaluate(() => { document.querySelector("#dx-adult").checked = true; document.querySelector("#dx-optin").click(); });
await page.waitForFunction(() => document.querySelector("#dx-consent [data-dx-state]")?.getAttribute("data-dx-state") === "on", null, { timeout: 20000 });
out.B_seeded = await page.evaluate(async () => {
  const dx = await import("../shared/dx-data.js"), col = await import("../shared/col-learn.js");
  let n = 0;
  for (const sc of ["rb-cell-entry", "rb-cobot-zone-setup"]) {
    const syn = col.colSyntheticDemos(sc, { n: 1, seed: 1, skill: 0.85, noise: 0.3 })[0];
    const ep = dx.dxMakeEpisode({ source: "human", world: "robotics", kind: "robot-game", scenario: sc, summary: syn.summary }, syn.steps);
    if (await dx.dxStore.put(ep)) n += 1;
  }
  return { put: n, stored: (await dx.dxStore.list()).length, collecting: dx.dxCollecting() };
});
out.B_optedIn = await press();
if (outDir) { await page.locator("#ra-takes").scrollIntoViewIfNeeded(); await page.waitForTimeout(200); await page.locator("#ra-takes").screenshot({ path: join(outDir, "ra-takes-opted-in-1920.png") }); }

// C: revoke on the consent panel
await page.evaluate(() => document.querySelector("#dx-revoke").click());
await page.waitForFunction(() => document.querySelector("#dx-consent [data-dx-state]")?.getAttribute("data-dx-state") === "off", null, { timeout: 20000 });
out.C_revoked = await press();
out.C_stored = await page.evaluate(async () => (await (await import("../shared/dx-data.js")).dxStore.list()).length);

// D: phone width
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(300);
out.D_phone = await page.evaluate(() => { const b = document.querySelector("#ra-takes .ra-takes-go").getBoundingClientRect(); return { button: `${Math.round(b.width)}x${Math.round(b.height)}`, overflow: document.documentElement.scrollWidth > window.innerWidth + 1 }; });
if (outDir) { await page.locator("#ra-takes").scrollIntoViewIfNeeded(); await page.locator("#ra-takes").screenshot({ path: join(outDir, "ra-takes-revoked-390.png") }); }

await browser.close(); await close();
const pass = out.A_signedOut.takes === 0 && out.B_optedIn.takes === 2 && out.B_optedIn.rows.length === 2 && out.C_revoked.takes === 0 && out.C_stored === 0 && Number(out.D_phone.button.split("x")[1]) >= 44 && !out.D_phone.overflow && !out.pageErrors.length && !out.offHost.length;
console.log(JSON.stringify({ ...out, pass }, null, 1));
process.exit(pass ? 0 : 1);
