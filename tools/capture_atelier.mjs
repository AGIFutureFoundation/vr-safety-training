/**
 * Before/after captures for the design-system pass (console ATELIER,
 * docs/design-system/README.md): the homepage, a track page, the Atlas and
 * the instructor console at 1440 x 900 and 390 x 844, written to
 * docs/img/atelier/<page>-<width>-<label>.png.
 *
 *     node tools/capture_atelier.mjs after                  this checkout's WebXR/dist/
 *     ATELIER_DIST=/path/to/old/WebXR/dist node tools/capture_atelier.mjs before
 *
 * Serves the dist folder in-process on ATELIER_PORT (default 8937), answers the cdnjs three.js and React
 * URLs from WebXR/vendor/ and aborts every other outside request, as
 * tools/check_ui.mjs does.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = process.env.ATELIER_DIST || join(WEBXR, "dist");
const OUT = join(ROOT, "docs", "img", "atelier");
const LABEL = process.argv[2] || "after";
const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);

export const AT_SHOTS = [
  { id: "home", page: "index.html", start: [], settle: 1500 },
  { id: "track", page: "tracks/electrical-first-period.html", start: [], settle: 1200 },
  { id: "atlas", page: "atlas.html", start: [], settle: 2500 },
  { id: "instructor", page: "instructor-console.html", start: [], settle: 1500 },
  // ATELIER-2: the frontier worlds' start screens, the Treasure Map, the privacy page and the Cohorts tab.
  { id: "summit", page: "summit.html", start: [], settle: 2500 },
  { id: "redwood", page: "redwood.html", start: [], settle: 2500 },
  { id: "treasures", page: "treasures.html", start: [], settle: 1200 },
  { id: "privacy", page: "privacy.html", start: [], settle: 1000 },
  { id: "cohorts", page: "instructor-console.html", start: ["#tab-cohort"], settle: 1200 },
];
// ATELIER_SHOTS=summit,redwood limits a run to those ids.
const AT_ONLY = (process.env.ATELIER_SHOTS || "").split(",").map((s) => s.trim()).filter(Boolean);
const SIZES = [{ w: 1440, h: 900 }, { w: 390, h: 844 }];

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(DIST, path);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
// The first free port from ATELIER_PORT upward within 89xx, skipping 8970/8971.
for (let port = Number(process.env.ATELIER_PORT || 8937); ; port += 1) {
  if (port === 8970 || port === 8971) continue;
  if (port > 8999) throw new Error("no free port in 89xx");
  const ok = await new Promise((r) => {
    server.once("error", () => r(false));
    server.listen(port, "127.0.0.1", () => r(true));
  });
  if (ok) break;
}
const base = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await pwModule();
const browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const REACT = Object.fromEntries(["react.production.min.js", "react-dom.production.min.js"].map((f) => [f, readFileSync(join(WEBXR, "vendor/react/dist", f), "utf8")]));
mkdirSync(OUT, { recursive: true });
for (const shot of AT_SHOTS) {
  if (AT_ONLY.length && !AT_ONLY.includes(shot.id)) continue;
  for (const size of SIZES) {
    const phone = size.w < 600;
    const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, hasTouch: phone, isMobile: phone, deviceScaleFactor: 1 });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
    await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
      const f = r.request().url().split("/").pop();
      return REACT[f] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT[f] }) : r.abort();
    });
    await context.addInitScript(() => { try { localStorage.setItem("holodeck-touch-hint-v1", "1"); } catch { /* private */ } });
    const page = await context.newPage();
    try {
      await page.goto(`${base}/${shot.page}`, { waitUntil: "load", timeout: 45000 });
      for (const sel of shot.start) {
        await page.waitForSelector(sel, { state: "visible", timeout: 20000 });
        await page.evaluate((s) => document.querySelector(s).click(), sel);
      }
      await page.waitForTimeout(shot.settle);
      const file = join(OUT, `${shot.id}-${size.w}-${LABEL}.png`);
      await page.screenshot({ path: file });
      console.log(`wrote ${file.replace(ROOT + "/", "")}`);
    } catch (e) { console.log(`✗ ${shot.id} ${size.w}: ${String(e.message).split("\n")[0]}`); }
    await context.close();
  }
}
await browser.close();
server.close();
