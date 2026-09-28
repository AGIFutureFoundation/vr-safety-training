#!/usr/bin/env node
// Records the background loops (docs/home-backgrounds.md) inside the
// platform's own worlds, headless, and encodes them into WebXR/home/media.
//
//   node tools/record_backgrounds.mjs summit redwood          record + encode
//   node tools/record_backgrounds.mjs summit --probe          stills of the probe poses only
//   node tools/record_backgrounds.mjs underwater --encode     re-encode recorded frames
//   node tools/record_backgrounds.mjs --list
//
// The shots live in tools/record_backgrounds.json (one entry per clip: the
// page, how to start it, the camera path as data, the world hooks, the
// grade). The recording is deterministic: requestAnimationFrame,
// performance.now and Date.now are stepped by exactly 1/24 s per frame, so
// the software renderer's speed never changes the footage. three.js is
// answered from WebXR/vendor through a wrapper that hooks the scene's
// onBeforeRender and copies a scripted camera's matrices into the game's
// camera; no game code is edited. Every DOM overlay is hidden and only the
// WebGL canvas is captured.
//
// Environment: CN_PORT (default 8997), CN_FRAMES (frames folder, default the
// session scratchpad or os.tmpdir()), PLAYWRIGHT_MODULE, CHROMIUM_PATH,
// CN_PARALLEL (pages recorded at once, default 2).
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, rmSync } from "node:fs";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const MEDIA = join(WEBXR, "home", "media");
const SHOTS = JSON.parse(readFileSync(join(ROOT, "tools", "record_backgrounds.json"), "utf8")).shots;
const FRAMES = process.env.CN_FRAMES || join(process.env.SP || tmpdir(), "holodeck", "cinema-2", "frames");
const FPS = 24, XFADE = 1.2;

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
// A slot written as name:probe takes stills only, in the same run as recordings.
const probeOnly = new Set(args.filter((a) => /^[a-z0-9-]+:probe$/.test(a)).map((a) => a.split(":")[0]));
const slots = args.filter((a) => !a.startsWith("--")).map((a) => a.split(":")[0]);
if (flag("--list") || !slots.length) {
  for (const [id, s] of Object.entries(SHOTS)) console.log(`${id.padEnd(12)} ${s.page.padEnd(28)} ${s.size.join("x")}  ${s.seconds}s  ${s.grade}`);
  process.exit(0);
}
for (const id of slots) if (!SHOTS[id]) { console.error(`no shot ${id} in tools/record_backgrounds.json`); process.exit(2); }

// ------------------------------------------------------------ the camera
const lerp = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
const ease = (u) => u * u * (3 - 2 * u);
/** A pose {p, t, fov} at u in [0,1) from a declarative path. */
function poseAt(path, u) {
  const e = path.ease ? ease(u) : u;
  if (path.type === "dolly") return { p: lerp(path.from.p, path.to.p, e), t: lerp(path.from.t, path.to.t, e), fov: path.fov ?? 50 };
  if (path.type === "orbit") {
    const a = path.angle[0] + (path.angle[1] - path.angle[0]) * e, r = path.radius[0] + (path.radius[1] - path.radius[0]) * e;
    const y = path.height[0] + (path.height[1] - path.height[0]) * e, [cx, cy, cz] = path.centre;
    return { p: [cx + r * Math.cos(a), y, cz + r * Math.sin(a)], t: [cx, path.lookY ?? cy, cz], fov: path.fov ?? 50 };
  }
  throw new Error(`unknown path type ${path.type}`);
}

// ------------------------------------------------------- the world hooks
// Each hook is source text evaluated in the page: pre(u, pose) runs before
// every frame, patch(scene, renderer, T) once when the scene first renders.
const HOOKS = {
  "bay-dusk": {
    pre: (u) => { const a = window.__bayworldTest?.app; if (a) { a.hours = 18.55; a.weather = "clear"; } },
    patch: (scene) => { if (scene.fog && scene.fog.density) scene.fog.density = 0.0013; },
  },
  // Chunked worlds stream round the player: keep the player under the camera.
  "summit-follow": { pre: (u, pose) => { const t = window.__summitTest; if (t) t.teleport(pose.p[0], pose.p[2]); } },
  "redwood-follow": {
    pre: (u, pose) => { const t = window.__redwoodTest; if (t) t.teleport(pose.p[0], pose.p[2]); },
    // The floating site labels are sprites; a background loop has no captions.
    patch: (scene) => { scene.traverse((o) => { if (o.isSprite) o.visible = false; }); },
  },
  // The race fleet drifts: orbit its live centre.
  "regatta-fleet": {
    pre: (u) => {
      const a = window.__regattaTest?.app; if (!a) return; a.hours = 17.6;
      const bs = a.race?.boats ?? []; if (!bs.length) return;
      let cx = 0, cz = 0; for (const b of bs) { cx += b.x; cz += b.z; } cx /= bs.length; cz /= bs.length;
      const ang = 0.9 + 0.45 * u; window.__cnPose = { p: [cx + 48 * Math.cos(ang), 8, cz + 48 * Math.sin(ang)], t: [cx, 2, cz], fov: 46 };
    },
  },
  // Sunbeams for the Deep: additive light columns from the surface to the
  // seabed round the diver, swaying over the loop. Capture-time only.
  "deep-sunbeams": {
    patch: (scene, renderer, T) => {
      if (window.__cnBeams) return;
      // Soft camera-facing planes: bright at the surface, gone before the
      // seabed, feathered at the sides, additive so the water lightens.
      const cv = document.createElement("canvas"); cv.width = 64; cv.height = 256;
      const ctx = cv.getContext("2d"), img = ctx.createImageData(64, 256);
      for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) {
        const v = y / 255, hx = Math.abs(x / 63 - 0.5) * 2;
        const side = Math.pow(Math.max(0, 1 - hx), 1.6), tall = Math.min(1, v / 0.12) * Math.pow(Math.max(0, 1 - (v - 0.12) / 0.78), 1.7);
        const a = Math.round(255 * side * tall); const i = (y * 64 + x) * 4;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a;
      }
      ctx.putImageData(img, 0, 0);
      const tex = new T.CanvasTexture(cv);
      const g = new T.Group(); g.name = "cn-sunbeams";
      const cx = -716, cz = -526;
      for (let i = 0; i < 12; i++) {
        const a = i * 2.399 + 0.4, r = 2.6 + (i % 4) * 1.5, w = 0.7 + (i % 3) * 0.45;
        const m = new T.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.12, alphaMap: tex, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false });
        const beam = new T.Mesh(new T.PlaneGeometry(w, 10), m);
        beam.position.set(cx + r * Math.cos(a), -3.6, cz + r * Math.sin(a));
        beam.userData.phase = i * 0.7; beam.userData.base = 0.09 + (i % 3) * 0.025; beam.userData.lean = 0.12 * Math.sin(a * 2.3);
        g.add(beam);
      }
      scene.add(g); window.__cnBeams = g;
    },
    pre: (u, pose) => {
      const g = window.__cnBeams; if (!g) return;
      for (const b of g.children) {
        b.material.opacity = b.userData.base + 0.05 * Math.sin(u * Math.PI * 4 + b.userData.phase);
        b.rotation.set(0, Math.atan2(pose.p[0] - b.position.x, pose.p[2] - b.position.z), 0);
        b.rotateZ(b.userData.lean + 0.03 * Math.sin(u * Math.PI * 2 + b.userData.phase));
      }
    },
  },
};

// ---------------------------------------------------------- the server
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
});
const PORT = Number(process.env.CN_PORT || 8997);

// ------------------------------------------------------------ the browser
const THREE_SRC = () => readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const WRAP = `export * from "https://cdnjs.cloudflare.com/cn-real-three.js";
import * as T from "https://cdnjs.cloudflare.com/cn-real-three.js";
const OBR = T.Object3D.prototype.onBeforeRender;
T.Object3D.prototype.onBeforeRender = function (renderer, scene, cam, rt) {
  const h = window.__cnHook;
  if (h && this.isScene && !rt) { const c = h(renderer, scene, cam, T); if (c) { cam.matrixWorld.copy(c.matrixWorld); cam.matrixWorldInverse.copy(c.matrixWorldInverse); cam.projectionMatrix.copy(c.projectionMatrix); cam.projectionMatrixInverse.copy(c.projectionMatrixInverse); } }
  return OBR.call(this, renderer, scene, cam, rt);
};`;
const REACT_DIR = join(WEBXR, "vendor/react/dist");

function initScript() {
  try { localStorage.setItem("holodeck-touch-hint-v1", "1"); localStorage.setItem("holodeck-quality-tier-v1", "high"); } catch {}
  const realRAF = window.requestAnimationFrame.bind(window); const realNow = performance.now.bind(performance); const realDate = Date.now;
  let manual = false, vt = 0, dOff = 0, q = [];
  performance.now = () => (manual ? vt : realNow());
  Date.now = () => (manual ? vt + dOff : realDate());
  window.requestAnimationFrame = (cb) => { if (manual) { q.push(cb); return q.length; } return realRAF(cb); };
  window.__cnManual = () => { vt = realNow(); dOff = realDate() - vt; manual = true; };
  window.__cnStep = (dt) => { vt += dt; const cbs = q; q = []; for (const cb of cbs) { try { cb(vt); } catch (e) { console.error("raf", e.message); } } };
  window.__cnHook = (renderer, scene, cam, T) => {
    window.__cnScene = scene; window.__cnCamIn = cam; window.__cnRenderer = renderer; window.__cnT = T;
    for (const p of window.__cnPatches ?? []) { try { p(scene, renderer, T); } catch (e) { console.error("patch", e.message); } }
    if (!renderer.domElement.dataset.cn) renderer.domElement.dataset.cn = "1";
    const p = window.__cnPose; if (!p) return null;
    const c = (window.__cnCam ||= new T.PerspectiveCamera(50, 1, 0.5, 5000));
    const el = renderer.domElement; c.aspect = el.clientWidth / el.clientHeight || 16 / 9;
    c.fov = p.fov ?? 50; c.far = p.far ?? 5000; c.near = p.near ?? 0.5;
    c.position.set(...p.p); c.up.set(0, 1, 0); c.lookAt(...p.t); c.updateProjectionMatrix(); c.updateMatrixWorld(true);
    return c;
  };
}

async function openShot(browser, id, S) {
  const [W, H] = S.size;
  const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await context.route("https://cdnjs.cloudflare.com/cn-real-three.js", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC() }));
  await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: WRAP }));
  await context.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/react(-dom)?\/18\.3\.1\/umd\//, (r) => {
    const f = r.request().url().split("/").pop(); const p = join(REACT_DIR, f);
    return existsSync(p) ? r.fulfill({ status: 200, contentType: "application/javascript", body: readFileSync(p, "utf8") }) : r.abort();
  });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await context.addInitScript(initScript);
  const page = await context.newPage();
  page.on("pageerror", (e) => console.log(id, "pageerror", String(e.message).slice(0, 160)));
  await page.goto(`http://127.0.0.1:${PORT}/dist/${S.page}`, { waitUntil: "load", timeout: 90000 });
  for (const sel of S.start ?? []) {
    await page.waitForSelector(sel, { state: "visible", timeout: 30000 });
    await page.evaluate((s) => document.querySelector(s).click(), sel);
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(S.settle ?? 3000);
  const hooks = (S.hooks ?? []).map((h) => { if (!HOOKS[h]) throw new Error(`unknown hook ${h}`); return HOOKS[h]; });
  await page.evaluate((srcs) => { window.__cnPatches = srcs.map((s) => (0, eval)("(" + s + ")")); }, hooks.filter((h) => h.patch).map((h) => h.patch.toString()));
  await page.evaluate((srcs) => { window.__cnPres = srcs.map((s) => (0, eval)("(" + s + ")")); }, hooks.filter((h) => h.pre).map((h) => h.pre.toString()));
  await page.addStyleTag({ content: "body *{visibility:hidden !important;} canvas[data-cn]{visibility:visible !important;} body{background:#000 !important}" });
  return { page, context };
}
const stepOnce = ([pose, u]) => { window.__cnPose = pose; for (const f of window.__cnPres ?? []) f(u, pose); window.__cnStep(1000 / 24); };

async function record(browser, id) {
  const S = SHOTS[id];
  const { page, context } = await openShot(browser, id, S);
  const out = join(FRAMES, id);
  rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
  await page.evaluate(() => window.__cnManual());
  if (flag("--probe") || probeOnly.has(id)) {
    const info = await page.evaluate(() => {
      const T = window.__cnT, s = window.__cnScene, c = window.__cnCamIn; if (!s) return "no scene";
      const cp = new T.Vector3(); c.getWorldPosition(cp);
      return { cam: cp.toArray().map((v) => +v.toFixed(1)), fog: s.fog ? [s.fog.constructor.name, s.fog.density ?? s.fog.far] : null };
    });
    console.log(id, JSON.stringify(info));
    const poses = (S.probe ?? [0, 0.5, 0.99]).map((x) => (typeof x === "number" ? poseAt(S.path, x) : x));
    for (const [i, pose] of poses.entries()) {
      for (let k = 0; k < 4; k++) await page.evaluate(stepOnce, [pose, 0]);
      await page.screenshot({ path: join(out, `probe-${i}.jpg`), type: "jpeg", quality: 85 });
    }
    console.log(id, "probes in", out);
  } else {
    const n = Math.round(S.seconds * FPS), t0 = Date.now();
    for (let i = 0; i < 6; i++) await page.evaluate(stepOnce, [poseAt(S.path, 0), 0]);
    for (let i = 0; i < n; i++) {
      const u = i / n;
      await page.evaluate(stepOnce, [poseAt(S.path, u), u]);
      await page.screenshot({ path: join(out, `f${String(i).padStart(4, "0")}.jpg`), type: "jpeg", quality: 93 });
      if (i % 48 === 0) console.log(id, i, "/", n, ((Date.now() - t0) / 1000).toFixed(0) + "s");
    }
    console.log(id, "recorded", n, "frames in", ((Date.now() - t0) / 1000).toFixed(0) + "s");
  }
  await context.close();
}

// -------------------------------------------------------------- encoding
const GRADES = {
  neutral: "colorbalance=rh=0.03:bh=-0.02:bs=0.02",
  dusk: "colorbalance=rs=0.03:bs=0.05:rh=0.05:bh=-0.04",
  warm: "colorbalance=rm=0.04:bm=-0.03:rh=0.06:gh=0.02:bh=-0.05",
  sea: "colorbalance=bs=0.03:gs=0.02:rh=0.02",
  alpine: "colorbalance=bs=0.05:rs=-0.02:rh=0.05:gh=0.02:bh=-0.03",
  forest: "colorbalance=gs=0.02:bs=-0.02:rm=0.02:gm=0.03:rh=0.05:gh=0.03:bh=-0.05",
};
function run(cmd, a) { const r = spawnSync(cmd, a, { stdio: ["ignore", "pipe", "pipe"] }); if (r.status !== 0) throw new Error(`${cmd} failed:\n${r.stderr}`); return r.stdout.toString(); }
function encode(id) {
  const S = SHOTS[id], dir = join(FRAMES, id);
  const n = readdirSync(dir).filter((f) => /^f\d{4}\.jpg$/.test(f)).length;
  if (!n) throw new Error(`${id}: no frames in ${dir}`);
  const total = n / FPS, L = total - XFADE, off = L - XFADE, [W, H] = S.size;
  const filt = `scale=${W}:${H}:flags=lanczos,gblur=sigma=0.55,eq=contrast=1.06:saturation=1.1:gamma=0.97,curves=all='0/0.025 0.25/0.23 0.5/0.5 0.78/0.8 1/0.965',${GRADES[S.grade] ?? GRADES.neutral},vignette=angle=PI/5,noise=alls=3:allf=t,format=yuv420p`;
  const mp4 = join(MEDIA, `${id}.mp4`), webm = join(MEDIA, `${id}.webm`), jpg = join(MEDIA, `${id}.jpg`);
  run("ffmpeg", ["-loglevel", "error", "-y", "-framerate", String(FPS), "-i", join(dir, "f%04d.jpg"), "-filter_complex",
    `[0]${filt},split[a][b];[a]trim=start=${XFADE},setpts=PTS-STARTPTS[A];[b]trim=end=${XFADE},setpts=PTS-STARTPTS[B];[A][B]xfade=transition=fade:duration=${XFADE}:offset=${off.toFixed(3)},format=yuv420p[v]`,
    "-map", "[v]", "-an", "-c:v", "libx264", "-preset", "slow", "-crf", String(S.crf ?? 25), "-profile:v", "high", "-tune", "film", "-g", "48", "-movflags", "+faststart", "-r", String(FPS), mp4]);
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-frames:v", "1", "-q:v", "5", jpg]);
  run("ffmpeg", ["-loglevel", "error", "-y", "-i", mp4, "-an", "-c:v", "libvpx-vp9", "-crf", String(S.webmCrf ?? 38), "-b:v", "0", "-row-mt", "1", "-cpu-used", "4", "-deadline", "good", "-g", "48", "-pix_fmt", "yuv420p", webm]);
  const kb = (f) => (statSync(f).size / 1024).toFixed(0) + " KB";
  console.log(`${id}: ${L.toFixed(1)} s loop, mp4 ${kb(mp4)}, webm ${kb(webm)}, poster ${kb(jpg)}`);
}

// ------------------------------------------------------------------ main
if (!flag("--encode")) {
  await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const { chromium } = await import(PW);
  const browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
  const queue = [...slots], par = Number(process.env.CN_PARALLEL || 2);
  const worker = async () => { while (queue.length) { const id = queue.shift(); try { await record(browser, id); } catch (e) { console.error(id, "failed:", e.message); process.exitCode = 1; } } };
  await Promise.all(Array.from({ length: Math.min(par, slots.length) }, worker));
  await browser.close(); server.close();
}
if (!flag("--probe")) for (const id of slots) { if (probeOnly.has(id)) continue; try { encode(id); } catch (e) { console.error(e.message); process.exitCode = 1; } }
