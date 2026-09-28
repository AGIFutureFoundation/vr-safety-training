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
 *   - one world (Sierra Summit): tzWatchWorld plants every Summit marker;
 *     walking (teleporting) onto an open one finds it; walking onto a gated
 *     one on a fresh profile shows the lock and records nothing
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
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

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
  ({ chromium } = await import(PW));
  browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
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
} catch (e) {
  check(false, `live run threw: ${String(e.message).split("\n")[0]}`);
}

await browser.close();
server.close();
console.log(failures ? `\n${failures} check(s) failed (${passes} passed).` : `\nAll ${passes} live checks pass: the homepage's three finders and Sierra Summit's markers work in the browser.`);
process.exit(failures ? 1 : 0);
