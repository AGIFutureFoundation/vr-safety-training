/**
 * The one browser the PROVING tools share (console PROVING,
 * docs/consoles/PROVING.md): an in-process static server over WebXR/, one
 * headless Chromium under SwiftShader, and a context whose off-host requests
 * are answered from WebXR/vendor/ (three.js, React) or stubbed (fonts) or
 * aborted — the same arrangement tools/check_mobile.mjs and check_ui.mjs use,
 * in one place so measure_frames, phone_pass and soak agree on it.
 *
 * Nothing here is a checker: the callers decide what passes.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { loadavg } from "node:os";
import { pwLaunch, PW, EXE } from "./pw.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const PV_ROOT = join(here, "..", "..");
export const PV_WEBXR = join(PV_ROOT, "WebXR");
export const PV_DIST = join(PV_WEBXR, "dist");
const THREE_FILE = join(PV_WEBXR, "vendor/three/dist/three.module.min.js");
const REACT_DIR = join(PV_WEBXR, "vendor/react/dist");

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".webm": "video/webm", ".mp4": "video/mp4" };

/** The one-minute load average, for the note beside every number. */
export const pvLoad = () => +loadavg()[0].toFixed(2);

/** The short commit the tree is at, or "unknown" outside git. */
export function pvCommit() {
  try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: PV_ROOT, encoding: "utf8" }).trim(); } catch { return "unknown"; }
}

/** Serve WebXR/ on a free loopback port (or PV_PORT); returns { base, close }. */
export async function pvServe(port = Number(process.env.PV_PORT) || 0) {
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(PV_WEBXR, path);
    if (!file.startsWith(PV_WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));
  return { base: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

/** Launch the one headless Chromium. Throws with a clear message when it cannot. */
export async function pvLaunch() {
  if (!existsSync(THREE_FILE)) throw new Error(`the vendored three.js is missing at ${THREE_FILE}`);
  try { return await pwLaunch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] }); }
  catch (e) { throw new Error(`could not launch headless Chromium (Playwright ${PW}, Chromium ${EXE}): ${String(e.message).split("\n")[0]}`); }
}

const THREE_SRC = existsSync(THREE_FILE) ? readFileSync(THREE_FILE, "utf8") : "";
const REACT_SRC = {};
for (const f of ["react.production.min.js", "react-dom.production.min.js"]) if (existsSync(join(REACT_DIR, f))) REACT_SRC[f] = readFileSync(join(REACT_DIR, f), "utf8");

/** A context with the routes in place. `opts` are Playwright context options
 *  (viewport, hasTouch, isMobile, deviceScaleFactor, userAgent…). */
export async function pvContext(browser, opts = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, ...opts });
  // Playwright tries the most recently added route first, so the catch-all goes in first.
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
  await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
    const file = r.request().url().split("/").pop();
    return REACT_SRC[file] ? r.fulfill({ status: 200, contentType: "application/javascript", body: REACT_SRC[file] }) : r.abort();
  });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  return context;
}

/** The phone the pass emulates, at a given CSS size. */
export const pvPhone = (width, height) => ({
  viewport: { width, height }, hasTouch: true, isMobile: true, deviceScaleFactor: 2,
  userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
});

/** Every page and how to start it — the worlds and the two station apps.
 *  `handle` is the in-page expression that yields { scene, renderer } once
 *  the world is up; `walk` says whether W/A/D move the viewer there. */
export const PV_PAGES = [
  { id: "bayworld", name: "Bay World", page: "bayworld.html", start: ["#menu-start"], handle: "window.__bayworldTest.app", walk: true },
  { id: "redwood", name: "Redwood Reach", page: "redwood.html", start: ["#menu-start"], handle: "window.__redwoodTest.app", walk: true },
  { id: "summit", name: "Sierra Summit", page: "summit.html", start: ["#menu-start"], handle: "({ scene: window.__summitTest.scene, renderer: window.__summitTest.smRenderer })", walk: true },
  { id: "underwater", name: "The Deep", page: "underwater.html", start: ["#menu-start"], handle: "window.__underwaterTest.app", walk: true },
  { id: "regatta", name: "Bay Regatta", page: "regatta.html", start: ["#menu-enter", "#menu-race"], handle: "window.__regattaTest.app", walk: true },
  { id: "fairway", name: "Fairway Park", page: "fairway.html", start: ["#menu-play"], handle: "window.__fairwayTest.app", walk: false },
  { id: "trades", name: "Trade Skills (station runner, hub)", page: "trade-skills-simulator.html", start: [], handle: "({ scene: window.__tradesTest.scene(), renderer: window.__tradesTest.renderer() })", walk: true },
  { id: "smartcity", name: "SmartCiti.X (station runner)", page: "smartcity-x.html", start: [], handle: "({ scene: window.__smartcityTest.scene(), renderer: window.__smartcityTest.renderer() })", walk: true },
];

/** Open a page and press its start buttons; returns { page, errors }. */
export async function pvOpen(context, base, spec, { query = "", timeout = 60000 } = {}) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  await page.goto(`${base}/dist/${spec.page}${query}`, { waitUntil: "load", timeout });
  for (const sel of spec.start) {
    await page.waitForSelector(sel, { state: "visible", timeout: 30000 });
    await page.evaluate((s) => document.querySelector(s).click(), sel);
    await page.waitForTimeout(400);
  }
  return { page, errors };
}

/** Wait until the page's handle yields a renderer that has drawn a frame. */
export async function pvWaitReady(page, spec, timeout = 45000) {
  await page.waitForFunction((h) => {
    try { const o = eval(h); return !!(o && o.renderer && o.renderer.info && o.renderer.info.render.frame > 0); } catch { return false; }
  }, spec.handle, { timeout, polling: 250 });
}

/** Counts from the live scene: meshes, instanced meshes and their instances,
 *  plus what the renderer drew in its last frame. */
export function pvSceneStats(page, spec) {
  return page.evaluate((h) => {
    const o = eval(h);
    let meshes = 0, instanced = 0, instances = 0, points = 0, lines = 0, sprites = 0;
    o.scene.traverse((n) => {
      if (n.isInstancedMesh) { instanced += 1; instances += n.count; }
      else if (n.isMesh) meshes += 1;
      else if (n.isPoints) points += 1;
      else if (n.isLine) lines += 1;
      else if (n.isSprite) sprites += 1;
    });
    const r = o.renderer.info;
    return { meshes, instanced, instances, points, lines, sprites, calls: r.render.calls, triangles: r.render.triangles,
      geometries: r.memory.geometries, textures: r.memory.textures, programs: r.programs?.length ?? null,
      pixelRatio: o.renderer.getPixelRatio(), shadows: !!o.renderer.shadowMap?.enabled };
  }, spec.handle);
}
