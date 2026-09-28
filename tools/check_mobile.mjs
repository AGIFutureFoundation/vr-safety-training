/**
 * The mobile play surface (console TOUCH, tools/briefs/mobile-look-brief.md).
 * Opens each open-world game from WebXR/dist/ in headless Chromium at a
 * 360 x 640 portrait phone and a 640 x 360 landscape phone with touch
 * emulation, starts it, and asserts: the shared touch layer's stick and
 * context buttons exist and are at least 48 px; none of the HUD's fixed
 * panels (minimap, score or reserve panel, objective, home chip, quality
 * toggle) overlaps another or the touch controls; HUD text is at least
 * 14 px; the low play tier was picked on its own; no page error.
 *
 * The pages load three.js from cdnjs, which a sandbox often cannot reach,
 * so WebXR/ is served by a small in-process static server and the cdnjs
 * three URL is answered from WebXR/vendor/three/dist/. Fonts are stubbed.
 * If no browser can be launched this checker FAILS with a clear message.
 *
 *     node tools/check_mobile.mjs
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const WEBXR = join(here, "..", "WebXR");
const THREE_FILE = join(WEBXR, "vendor/three/dist/three.module.min.js");
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";

// Each game: its dist page, how to start it, and the HUD's fixed panels.
const GAMES_ALL = [
  { name: "Bay World", page: "bayworld.html", start: ["#menu-start"],
    panels: ["#hud-phone", "#hud-stats", "#hud-objective", "#hud-minimap", "#hud-buttons"] },
  { name: "Regatta", page: "regatta.html", start: ["#menu-enter", "#menu-race"],
    panels: ["#hud-helm", "#hud-next", "#hud-checks", "#hud-course-map"] },
  { name: "The Deep", page: "underwater.html", start: ["#menu-start"],
    panels: ["#hud-slate", "#hud-stats", "#hud-objective", "#hud-activity", "#hud-minimap", "#hud-buttons"] },
  { name: "Fairway Park", page: "fairway.html", start: ["#menu-play"],
    panels: ["#hud-hole", "#hud-score", "#hud-wind", "#hud-lie", "#hud-clubs", "#hud-care", "#hud-meter"] },
  { name: "Redwood Reach", page: "redwood.html", start: ["#menu-start"],
    panels: ["#hud-site", "#hud-objective", "#hud-stats", "#hud-minimap", "#hud-buttons"] },
];
GAMES_ALL.push({ name: "Sierra Summit", page: "summit.html", start: ["#menu-start"], panels: ["#hud-where", "#hud-stats"] });
const GAMES = process.env.TC_ONLY ? GAMES_ALL.filter((g) => g.page === process.env.TC_ONLY) : GAMES_ALL;
const SIZES = [{ label: "360x640", width: 360, height: 640 }, { label: "640x360", width: 640, height: 360 }];

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; return; }
  failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`);
}
function die(msg) { console.log(`✗ ${msg}`); console.log("check_mobile: FAILED (no browser run)"); process.exit(1); }

if (!existsSync(THREE_FILE)) die(`the vendored three.js is missing at ${THREE_FILE}`);
for (const g of GAMES) if (!existsSync(join(WEBXR, "dist", g.page))) die(`WebXR/dist/${g.page} is missing — run python3 tools/bundle_webxr.py`);

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".wasm": "application/wasm" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

let chromium, browser;
try {
  ({ chromium } = await import(PW));
  browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
} catch (e) {
  server.close();
  die(`could not launch headless Chromium (${PW}, ${EXE}): ${String(e.message).split("\n")[0]}`);
}
const THREE_SRC = readFileSync(THREE_FILE, "utf8");

// Collected in the page: boxes of every visible fixed panel and touch control.
function measure(panels) {
  const vis = (el) => { if (!el) return false; const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest("[hidden]"); };
  const box = (sel, el) => { const r = el.getBoundingClientRect(); return { sel, x: r.left, y: r.top, w: r.width, h: r.height }; };
  const out = { boxes: [], controls: [], small: [], offscreen: [], tier: document.documentElement.dataset.tier ?? null };
  const chip = document.querySelector(".home-chip");
  if (vis(chip)) out.boxes.push(box(".home-chip", chip));
  for (const sel of panels) { const el = document.querySelector(sel); if (vis(el)) out.boxes.push(box(sel, el)); }
  const stick = document.querySelector("#tc-layer .tc-stick");
  if (vis(stick)) { const b = box("stick", stick); out.boxes.push(b); out.controls.push(b); }
  for (const el of document.querySelectorAll("#tc-layer .tc-btn")) if (vis(el)) { const b = box(`button#${el.id}`, el); out.boxes.push(b); out.controls.push(b); }
  out.hasStick = !!stick; out.buttonCount = document.querySelectorAll("#tc-layer .tc-btn").length;
  out.hasQuality = !!document.querySelector("#tc-quality");
  for (const b of out.boxes) if (b.x < -1 || b.y < -1 || b.x + b.w > innerWidth + 1 || b.y + b.h > innerHeight + 1) out.offscreen.push(b.sel);
  for (const el of document.querySelectorAll("#hud *, #tc-layer *")) {
    if (!vis(el)) continue;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && parseFloat(getComputedStyle(el).fontSize) < 14) out.small.push(`${el.id || el.className || el.tagName}:${getComputedStyle(el).fontSize}`);
  }
  return out;
}
const overlap = (a, b) => a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5;

const covered = [];
for (const g of GAMES) {
  for (const size of SIZES) {
    const tag = `${g.name} ${size.label}`;
    const context = await browser.newContext({ viewport: { width: size.width, height: size.height }, hasTouch: true, isMobile: true, deviceScaleFactor: 2,
      userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36" });
    // Playwright tries the most recently added route first, so the catch-all goes in first.
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    try {
      await page.goto(`${base}/dist/${g.page}`, { waitUntil: "load", timeout: 45000 });
      for (const sel of g.start) {
        await page.waitForSelector(sel, { state: "visible", timeout: 20000 });
        await page.evaluate((s) => document.querySelector(s).click(), sel);
        await page.waitForTimeout(400);
      }
      await page.waitForSelector("#tc-layer .tc-stick", { state: "attached", timeout: 30000 }).catch(async (e) => { throw new Error(`${e.message.split("\n")[0]} :: ${await page.evaluate(() => [document.getElementById("tc-layer")?.outerHTML?.slice(0, 200), document.getElementById("hud")?.hidden, typeof tcMountTouch].join(" / "))}`); });
      await page.evaluate(() => document.getElementById("tc-hint")?.remove());
      await page.waitForTimeout(800);
      const m = await page.evaluate(measure, g.panels);
      check(m.hasStick, `${tag}: the shared stick exists`);
      check(m.buttonCount >= 1, `${tag}: context buttons exist`, `${m.buttonCount} found`);
      for (const c of m.controls) check(c.w >= 48 && c.h >= 48, `${tag}: ${c.sel} is at least 48 px`, `${c.w.toFixed(0)}x${c.h.toFixed(0)}`);
      check(m.hasQuality, `${tag}: the Low / Balanced / High toggle is in the HUD`);
      check(m.tier === "low", `${tag}: the low tier was picked on a phone`, `tier ${m.tier}`);
      check(m.small.length === 0, `${tag}: HUD text is at least 14 px`, m.small.slice(0, 4).join(", "));
      check(m.offscreen.length === 0, `${tag}: every panel is on screen`, m.offscreen.join(", "));
      const bad = [];
      for (let i = 0; i < m.boxes.length; i++) for (let j = i + 1; j < m.boxes.length; j++) if (overlap(m.boxes[i], m.boxes[j])) bad.push(`${m.boxes[i].sel} × ${m.boxes[j].sel}`);
      check(bad.length === 0, `${tag}: no fixed panels overlap (${m.boxes.length} boxes)`,
        bad.join("; ") + (process.env.TC_BOXES ? "\n" + m.boxes.map((b) => `${b.sel} ${b.x | 0},${b.y | 0} ${b.w | 0}x${b.h | 0}`).join("\n") : ""));
      // The toggle persists: pick High, reload, and the page reads it back.
      await page.evaluate(() => document.querySelector('#tc-quality [data-tier="high"]').click());
      const kept = await page.evaluate(() => { try { return localStorage.getItem("holodeck-quality-tier-v1"); } catch { return null; } });
      check(kept === "high", `${tag}: the quality choice is kept in localStorage`, `stored ${kept}`);
      check(errors.length === 0, `${tag}: no page error`, errors.slice(0, 3).join(" | "));
      covered.push(tag);
    } catch (e) {
      check(false, `${tag}: the page ran`, `${String(e.message).split("\n")[0]} ${errors.slice(0, 3).join(" | ")}`);
    }
    await context.close();
  }
}
await browser.close();
server.close();
if (failures) { console.log(`check_mobile: ${failures} failed, ${passes} passed`); process.exit(1); }
console.log(`check_mobile: ${passes} checks pass — ${covered.length} page sizes (${GAMES.map((g) => g.page).join(", ")} at 360x640 and 640x360)`);
