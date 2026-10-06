/**
 * Before/after captures for the SEO and usability pass (console WAYFINDER):
 * the homepage and one track page at 1440 x 900 and 390 x 844, written to
 * docs/img/wayfinder/<page>-<width>-<label>.png.
 *
 *     node tools/capture_wayfinder.mjs after               this checkout's WebXR/dist/
 *     WF_DIST=/path/to/old/WebXR/dist node tools/capture_wayfinder.mjs before
 *
 * Serves the dist folder in-process, answers the cdnjs three.js and React
 * URLs from WebXR/vendor/ and aborts every other outside request, as
 * tools/check_ui.mjs does.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const DIST = process.env.WF_DIST || join(WEBXR, "dist");
const OUT = join(ROOT, "docs", "img", "wayfinder");
const LABEL = process.argv[2] || "after";
const { pwModule, pwExecutable, PW, EXE } = await import(new URL("./lib/pw.mjs", import.meta.url).href);

export const WF_SHOTS = [
  { id: "home", page: "index.html", start: [], settle: 1500 },
  { id: "track", page: "tracks/electrical-first-period.html", start: [], settle: 1200 },
];
const SIZES = [{ w: 1440, h: 900 }, { w: 390, h: 844 }];

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(DIST, path);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r) => server.listen(Number(process.env.WF_PORT || 8942), "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const { chromium } = await pwModule();
const browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const REACT = Object.fromEntries(["react.production.min.js", "react-dom.production.min.js"].map((f) => [f, readFileSync(join(WEBXR, "vendor/react/dist", f), "utf8")]));
mkdirSync(OUT, { recursive: true });
for (const shot of WF_SHOTS) {
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
