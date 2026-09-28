/**
 * Captures the homepage's world thumbnails from the real games, headlessly.
 *
 *     node tools/capture_home_thumbs.mjs            all seven worlds
 *     HM_ONLY=bayworld node tools/capture_home_thumbs.mjs
 *
 * Serves WebXR/ in-process (as tools/check_mobile.mjs does), answers the
 * cdnjs three.js and React URLs from WebXR/vendor/, aborts every other
 * outside request, opens each world's single-file bundle from WebXR/dist/ at
 * 1280 x 720, starts it the way a player would, hides the shared help bar and
 * touch layer, and writes a 480 x 270 JPEG to WebXR/home/img/<world>.jpg,
 * stepping the quality down until the file is at most 60 KB.
 * tools/gen_home.mjs inlines these files as data URIs (the published build
 * caps its file count), so re-run this, then node tools/gen_home.mjs.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const OUT = join(WEBXR, "home", "img");
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
export const HM_THUMB_MAX = 60 * 1024;

// Each world: its dist page, the buttons a player presses to get in, and how
// long the scene is given to settle before the shot.
export const HM_CAPTURES = [
  { id: "bayworld", page: "bayworld.html", start: ["#menu-start"], keys: ["KeyV"], settle: 3500 },
  { id: "regatta", page: "regatta.html", start: ["#menu-enter", "#menu-race"], settle: 4000 },
  { id: "underwater", page: "underwater.html", start: ["#menu-start"], keys: ["KeyV"], settle: 3500 },
  { id: "summit", page: "summit.html", start: ["#menu-start"], settle: 4500 },
  { id: "fairway", page: "fairway.html", start: ["#menu-play"], settle: 3500 },
  { id: "redwood", page: "redwood.html", start: ["#menu-start"], settle: 4500 },
  { id: "atlas", page: "atlas.html", start: [], settle: 2500 },
  { id: "smartcity", page: "smartcity-x.html", start: [], settle: 4000 },
  { id: "holodeck", page: "holodeck.html", start: [], clickText: "Generate course", settle: 5000 },
];

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary" };

async function main() {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
  const REACT_DIR = join(WEBXR, "vendor/react/dist");
  const REACT_SRC = { "react.production.min.js": readFileSync(join(REACT_DIR, "react.production.min.js"), "utf8"),
    "react-dom.production.min.js": readFileSync(join(REACT_DIR, "react-dom.production.min.js"), "utf8") };
  const { chromium } = await import(PW);
  const browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
  mkdirSync(OUT, { recursive: true });
  const only = process.env.HM_ONLY ? process.env.HM_ONLY.split(",") : null;
  const shrink = await browser.newPage();
  for (const w of HM_CAPTURES) {
    if (only && !only.includes(w.id)) continue;
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
    await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
      const file = r.request().url().split("/").pop();
      return REACT_SRC[file] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT_SRC[file] }) : r.abort();
    });
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    await context.addInitScript(() => { try { localStorage.setItem("holodeck-touch-hint-v1", "1"); localStorage.setItem("holodeck-quality-tier-v1", "high"); } catch { /* private */ } });
    const page = await context.newPage();
    try {
      await page.goto(`${base}/dist/${w.page}`, { waitUntil: "load", timeout: 45000 });
      for (const sel of w.start) {
        await page.waitForSelector(sel, { state: "visible", timeout: 20000 });
        await page.evaluate((s) => document.querySelector(s).click(), sel);
        await page.waitForTimeout(500);
      }
      if (w.clickText) {
        await page.waitForTimeout(1500);
        await page.evaluate((t) => [...document.querySelectorAll("button")].find((b) => b.textContent.trim().toLowerCase() === t.toLowerCase())?.click(), w.clickText);
      }
      for (const k of w.keys ?? []) { await page.waitForTimeout(600); await page.keyboard.press(k); }
      await page.waitForTimeout(w.settle);
      await page.addStyleTag({ content: "#ctl-nav,#tc-layer,#tc-hint,.home-chip{display:none !important}" });
      await page.waitForTimeout(200);
      const png = (await page.screenshot({ type: "png" })).toString("base64");
      let q = 0.78, jpeg;
      do {
        jpeg = Buffer.from(await shrink.evaluate(async ([data, quality]) => {
          const img = new Image();
          img.src = `data:image/png;base64,${data}`;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = 480; c.height = 270;
          c.getContext("2d").drawImage(img, 0, 0, 480, 270);
          return c.toDataURL("image/jpeg", quality).split(",")[1];
        }, [png, q]), "base64");
        q -= 0.08;
      } while (jpeg.length > HM_THUMB_MAX && q > 0.2);
      writeFileSync(join(OUT, `${w.id}.jpg`), jpeg);
      console.log(`  ${w.id}: ${(jpeg.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.log(`  ${w.id}: FAILED — ${String(e.message).split("\n")[0]}`);
      process.exitCode = 1;
    }
    await context.close();
  }
  await browser.close();
  server.close();
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
