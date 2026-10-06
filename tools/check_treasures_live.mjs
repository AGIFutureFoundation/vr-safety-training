#!/usr/bin/env node
/**
 * The treasure layer in a real browser (console TREASURE-2, docs/treasures.md):
 *
 *     node tools/check_treasures_live.mjs
 *
 * check_treasures.mjs proves the data and the ledger headless. This one loads
 * the published flat build (WebXR/dist/) in headless Chromium the way
 * check_links.mjs does and asserts `window.__treasuresTest` after each find:
 *
 *   - the homepage: the account chip arms the page (the seven-star
 *     constellation is in the hero); lighting all seven stars finds it; the
 *     upside-down key code finds it; seven knocks on the brand line find it;
 *     the reveal card shows the treasure's verbatim lesson
 *   - the Guide: a secret question finds the union's lore treasure and answers with its line
 *   - two worlds (Sierra Summit, Redwood Reach): tzWatchWorld plants every marker;
 *     walking (teleporting) onto an open one finds it; walking onto a gated
 *     one on a fresh profile shows the lock and records nothing; in Redwood the L
 *     key lists nearby markers by distance and Enter picks one (no pointer); a
 *     frame-time sample with the markers spinning vs hidden is printed (relative)
 *
 * Needs the vendored three.js and the same Playwright + Chromium as
 * check_links.mjs; without a browser it FAILS with a clear message.
 */
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = join(WEBXR, "dist");
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`ok   ${what}`); return true; }
  failures += 1; console.log(`FAIL ${what}${detail ? ` — ${detail}` : ""}`);
  return false;
}
function die(msg) { console.log(`FAIL ${msg}`); console.log("check_treasures_live: FAILED (no browser run)"); process.exit(1); }

if (!existsSync(THREE_FILE)) die(`the vendored three.js is missing at ${THREE_FILE}`);
for (const f of ["index.html", "summit.html", "shared/treasures.js"]) if (!existsSync(join(DIST, f))) die(`WebXR/dist/${f} is missing — run python3 tools/bundle_webxr.py`);

const { TZ_TREASURES } = await import(pathToFileURL(join(WEBXR, "shared/treasures-data.js")));
const summit = TZ_TREASURES.filter((t) => t.how === "proximity" && t.trigger.world === "summit");
const openOne = summit.find((t) => !t.gate);
const gatedOne = summit.find((t) => t.gate);
const konami = TZ_TREASURES.find((t) => t.id === "tz-home-konami");
const lore = TZ_TREASURES.find((t) => t.id === "tz-guide-lore-ilwu");
const redwood = TZ_TREASURES.filter((t) => t.how === "proximity" && t.trigger.world === "redwood");
const rwOpen = redwood.find((t) => !t.gate);
const rwGated = redwood.find((t) => t.gate);
const rwLook = redwood.find((t) => !t.gate && t !== rwOpen);
for (const f of ["redwood.html"]) if (!existsSync(join(DIST, f))) die(`WebXR/dist/${f} is missing — run python3 tools/bundle_webxr.py`);

// ------------------------------------------------------------ server + browser
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".md": "text/markdown" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(DIST, path);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const origin = `http://127.0.0.1:${server.address().port}`;

let chromium, browser;
try {
  ({ chromium } = await pwModule());
  browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close();
  die(`could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`);
}
const THREE_SRC = readFileSync(THREE_FILE, "utf8");
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
await context.addInitScript(() => { try { localStorage.setItem("holodeck-touch-hint-v1", "1"); } catch { /* private */ } });
const page = await context.newPage();
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e.message).split("\n")[0]));
const tzt = () => page.evaluate(() => window.__treasuresTest ?? null);
const revealText = () => page.evaluate(() => { const b = document.getElementById("tz-reveal"); return b && !b.hidden ? b.textContent : ""; });

try {
  // ------------------------------------------------------------ the homepage
  await page.goto(`${origin}/index.html`, { waitUntil: "load", timeout: 60000 });
  await page.waitForSelector("#tz-constellation circle", { timeout: 20000 });
  const stars = await page.$$("#tz-constellation circle");
  check(stars.length === 7, `homepage: the account chip armed the hero constellation (${stars.length} stars)`);
  for (const s of stars) await s.click({ force: true });
  await page.waitForTimeout(300);
  let t = await tzt();
  check(t?.last === "tz-home-constellation", "homepage: lighting all seven stars finds the constellation", JSON.stringify(t));
  const constellation = TZ_TREASURES.find((x) => x.id === "tz-home-constellation");
  check((await revealText()).includes(constellation.lesson), "homepage: the reveal card shows the verbatim lesson");
  check(!(await page.$("#tz-constellation circle:not(.tz-lit)")), "homepage: every star is lit after the find");

  await page.mouse.click(640, 700); // focus the page body, away from inputs
  for (const k of konami.trigger.seq) await page.keyboard.press(k.length === 1 ? k : k);
  await page.waitForTimeout(300);
  t = await tzt();
  check(t?.last === "tz-home-konami", "homepage: the upside-down key code finds its treasure", JSON.stringify(t));

  const brand = await page.$(".brandline");
  for (let i = 0; i < 7; i += 1) await brand.click({ force: true, delay: 10 });
  await page.waitForTimeout(300);
  t = await tzt();
  check(t?.last === "tz-home-logo7" && t.found >= 3, `homepage: seven knocks on the brand line find the third treasure (${t?.found} found)`, JSON.stringify(t));
  // The Guide's secret question: the registry line comes back and the lore treasure is found.
  await page.click("#gd-btn");
  await page.fill("#gd-q", `tell me the lore of ${lore.trigger.names[0]}`);
  await page.press("#gd-q", "Enter");
  await page.waitForFunction((id) => window.__treasuresTest?.last === id, lore.id, { timeout: 8000 }).catch(() => {});
  t = await tzt();
  check(t?.last === lore.id, `homepage: asking the Guide for the lore of ${lore.trigger.names[0]} finds ${lore.id}`, JSON.stringify(t));
  check((await page.evaluate(() => document.querySelector("#gd-panel .gd-log")?.textContent ?? "")).includes(lore.lesson), "homepage: the Guide answers with the union's verbatim registry line");
  await page.click("#gd-close").catch(() => {});
  const ledger = await page.evaluate(() => JSON.parse(localStorage.getItem("vr-treasures-v1") || "null"));
  check(ledger?.found?.["tz-home-constellation"] && ledger.found["tz-home-konami"] && ledger.found["tz-home-logo7"], "homepage: the three finds are in the profile ledger");
  check(pageErrors.length === 0, "homepage: no page errors", pageErrors.join("; "));

  // ------------------------------------------------------------ one world: Sierra Summit
  pageErrors.length = 0;
  await page.goto(`${origin}/summit.html`, { waitUntil: "load", timeout: 90000 });
  await page.waitForFunction(() => window.__summitTest && window.__treasuresTest?.world === "summit", null, { timeout: 60000 });
  t = await tzt();
  check(t?.markers === summit.length, `summit: tzWatchWorld planted every Summit marker (${t?.markers} of ${summit.length})`);
  const planted = await page.evaluate((id) => { let n = 0; window.__summitTest.scene.traverse((o) => { if (o.name === `treasure:${id}`) n += 1; }); return n; }, openOne.id);
  check(planted === 1, `summit: ${openOne.id}'s marker is in the scene`);
  await page.evaluate(([x, z]) => window.__summitTest.teleport(x, z), [openOne.trigger.x, openOne.trigger.z]);
  await page.waitForFunction((id) => window.__treasuresTest?.last === id, openOne.id, { timeout: 5000 }).catch(() => {});
  t = await tzt();
  check(t?.last === openOne.id, `summit: walking onto ${openOne.id} finds it`, JSON.stringify(t));
  check((await revealText()).includes(openOne.lesson), "summit: the reveal shows the cairn's verbatim lesson");
  const hidden = await page.evaluate((id) => { let v = null; window.__summitTest.scene.traverse((o) => { if (o.name === `treasure:${id}`) v = o.visible; }); return v; }, openOne.id);
  check(hidden === false, "summit: the found marker is hidden");

  await page.evaluate(([x, z]) => window.__summitTest.teleport(x, z), [gatedOne.trigger.x, gatedOne.trigger.z]);
  await page.waitForFunction(() => { const b = document.getElementById("tz-reveal"); return b && !b.hidden && /Locked treasure/.test(b.textContent); }, null, { timeout: 5000 }).catch(() => {});
  const lock = await revealText();
  t = await tzt();
  check(/Locked treasure/.test(lock) && lock.includes(gatedOne.gate.note), `summit: a fresh profile walking onto ${gatedOne.id} sees the lock and its note`, lock.slice(0, 120));
  check(t?.last === openOne.id, "summit: the locked treasure was not recorded");
  const links = await page.$$eval("#tz-reveal a", (as) => as.map((a) => a.getAttribute("href")));
  check(links.some((h) => /smartcity-x\.html\?sim=/.test(h)), "summit: the lock links to the station it needs", links.join(" "));
  check(pageErrors.length === 0, "summit: no page errors", pageErrors.join("; "));

  // A frame-cost sample, markers spinning vs hidden (SwiftShader: relative, not a device number).
  const frameMs = () => page.evaluate(() => new Promise((res) => {
    let n = 0; const t0 = performance.now();
    const step = () => { n += 1; if (performance.now() - t0 < 1200) requestAnimationFrame(step); else res((performance.now() - t0) / n); };
    requestAnimationFrame(step);
  }));
  const withMarkers = await frameMs();
  await page.evaluate(() => window.__summitTest.scene.traverse((o) => { if (/^treasure:/.test(o.name)) o.visible = false; }));
  const without = await frameMs();
  check(Number.isFinite(withMarkers) && Number.isFinite(without), `summit: frame time sampled — ${withMarkers.toFixed(1)} ms/frame with ${summit.length} markers, ${without.toFixed(1)} ms/frame hidden (SwiftShader, relative)`);

  // ------------------------------------------------------------ Redwood Reach: the menu start, the fire roads, the look-around key
  pageErrors.length = 0;
  await page.goto(`${origin}/redwood.html`, { waitUntil: "load", timeout: 90000 });
  await page.click("#menu-start");
  await page.waitForFunction(() => window.__redwoodTest && window.__treasuresTest?.world === "redwood", null, { timeout: 60000 });
  t = await tzt();
  check(t?.markers === redwood.length, `redwood: tzWatchWorld planted every Redwood marker (${t?.markers} of ${redwood.length})`);
  await page.evaluate(([x, z]) => window.__redwoodTest.teleport(x, z), [rwOpen.trigger.x, rwOpen.trigger.z]);
  await page.waitForFunction((id) => window.__treasuresTest?.last === id, rwOpen.id, { timeout: 5000 }).catch(() => {});
  t = await tzt();
  check(t?.last === rwOpen.id, `redwood: walking onto ${rwOpen.id} finds it`, JSON.stringify(t));
  check((await revealText()).includes(rwOpen.lesson), "redwood: the reveal shows the page's verbatim lesson");
  await page.evaluate(([x, z]) => window.__redwoodTest.teleport(x, z), [rwGated.trigger.x, rwGated.trigger.z]);
  await page.waitForFunction(() => { const b = document.getElementById("tz-reveal"); return b && !b.hidden && /Locked treasure/.test(b.textContent); }, null, { timeout: 5000 }).catch(() => {});
  const rwLock = await revealText();
  t = await tzt();
  check(/Locked treasure/.test(rwLock) && rwLock.includes(rwGated.gate.note), `redwood: a fresh profile walking onto ${rwGated.id} sees the lock and its note`, rwLock.slice(0, 120));
  check(t?.last === rwOpen.id, "redwood: the locked treasure was not recorded");
  // The look-around key: stand 40 m off a marker, press L, pick it from the list — no pointer on the canvas.
  await page.evaluate(([x, z]) => window.__redwoodTest.teleport(x, z), [rwLook.trigger.x + 40, rwLook.trigger.z]);
  await page.waitForTimeout(500);
  await page.mouse.click(640, 30); // focus the page, off the canvas
  await page.keyboard.press("l");
  await page.waitForSelector("#tz-reveal [data-tz-look]", { timeout: 5000 }).catch(() => {});
  const rows = await page.$$eval("#tz-reveal [data-tz-look]", (bs) => bs.map((b) => ({ id: b.getAttribute("data-tz-look"), text: b.textContent })));
  check(rows.some((r) => r.id === rwLook.id) && rows.every((r) => /^Marker \d+: \d+ m away/.test(r.text)), `redwood: the L key lists ${rows.length} nearby markers by distance only`, JSON.stringify(rows));
  check(!rows.some((r) => r.text.includes(rwLook.name)), "redwood: the look-around list gives away no name");
  await page.focus(`#tz-reveal [data-tz-look="${rwLook.id}"]`); // keyboard only: focus the row and press Enter
  await page.keyboard.press("Enter");
  await page.waitForFunction((id) => window.__treasuresTest?.last === id, rwLook.id, { timeout: 5000 }).catch(() => {});
  t = await tzt();
  check(t?.last === rwLook.id, `redwood: choosing ${rwLook.id} from the look-around list finds it`, JSON.stringify(t));
  check(pageErrors.length === 0, "redwood: no page errors", pageErrors.join("; "));
} catch (e) {
  check(false, `live run threw: ${String(e.message).split("\n")[0]}`);
}

await browser.close();
server.close();
console.log(failures ? `\n${failures} check(s) failed (${passes} passed).` : `\nAll ${passes} live checks pass: the homepage finders, the Guide question, Sierra Summit and Redwood Reach markers and the look-around key work in the browser.`);
process.exit(failures ? 1 : 0);
