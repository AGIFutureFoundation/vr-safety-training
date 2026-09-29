#!/usr/bin/env node
/**
 * SURVEYOR's walker (docs/consoles/SURVEYOR.md): every parish-engine map at 1280×720 and 390×844, then Bay World,
 * the Deep, Redwood Reach, Sierra Summit, the Packs page, the scoreboard and the instructor console — one headless
 * page at a time. Per page: page errors, boot ms (navigation start to the first WebGL draw), median frame ms over two
 * seconds, draw calls and triangles per frame (counted at the GL calls, so every world is measured the same way),
 * the menu's buttons, which features are reachable, and a still of each map (docs/screenshots/review/<map>.jpg).
 *
 *     node tools/sv_survey.mjs                     # everything (port SV_PORT, default 8960)
 *     node tools/sv_survey.mjs --only orleans,summit
 *     node tools/sv_survey.mjs --json <file>       # default docs/evals/platform-review.json
 *     node tools/sv_survey.mjs --no-stills
 *
 * A review tool, not a gate: exits 0, prints one line per page.
 */
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const argv = process.argv.slice(2);
const argOf = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const PORT = Number(process.env.SV_PORT ?? 8960);
const ONLY = argOf("--only")?.split(",") ?? null;
const STILLS = !argv.includes("--no-stills");
const OUT = argOf("--json") ?? join(ROOT, "docs/evals/platform-review.json");
const SHOTS = join(ROOT, "docs/screenshots/review");

const { NP_PARISHES } = await import(pathToFileURL(join(WEBXR, "shared/np-parishes.js")).href);

// The parishes app's first- and second-wave features: the test-handle key and the menu mount each console owns.
export const SV_FEATURES = [
  { id: "terraform", owner: "TERRAFORM", handle: "terraform" },
  { id: "cityworks", owner: "CITYWORKS", handle: "cityworks" },
  { id: "newton", owner: "NEWTON", handle: "newton" },
  { id: "menagerie", owner: "MENAGERIE", handle: "life" },
  { id: "storyline", owner: "STORYLINE", handle: "storyline", mount: "menu-storyline" },
  { id: "tycoon", owner: "TYCOON", handle: "tycoon", mount: "menu-ledger" },
  { id: "packs", owner: "PACKS", mount: "menu-packs" },
  { id: "dean", owner: "DEAN", handle: "dean" },
  { id: "drills", owner: "DRILLS", handle: "drills", mount: "menu-drills" },
  { id: "cognition", owner: "COGNITION", handle: "cognition", mount: "menu-cognition" },
  { id: "atmos", owner: "ATMOS", handle: "atmos" },
  { id: "krewe", owner: "KREWE", handle: "krewe", mount: "menu-krewe" },
  { id: "motorpool", owner: "MOTORPOOL", mount: "menu-motorpool" },
  { id: "paths", owner: "GOLDEN/QUESTMASTER", mount: "menu-paths" },
  { id: "griot", owner: "GRIOT", handle: "npc" },
];

const DESK = { width: 1280, height: 720 }, PHONE = { width: 390, height: 844 };
const pages = [
  ...NP_PARISHES.map((p) => ({ id: p.id, name: p.name, kind: "parish", url: `parishes/parishes.html?parish=${p.id}`, vps: [DESK, PHONE] })),
  { id: "bayworld", name: "Bay World", kind: "world", url: "bayworld/index.html", vps: [DESK, PHONE] },
  { id: "deep", name: "The Deep", kind: "world", url: "underwater/underwater.html", vps: [DESK, PHONE] },
  { id: "redwood", name: "Redwood Reach", kind: "world", url: "redwood/redwood.html", vps: [DESK, PHONE] },
  { id: "summit", name: "Sierra Summit", kind: "world", url: "summit/index.html", vps: [DESK, PHONE] },
  { id: "packs-page", name: "Packs page", kind: "page", url: "packs/index.html", vps: [DESK, PHONE] },
  { id: "scoreboard", name: "Scoreboard", kind: "page", url: "scholar/index.html", vps: [DESK, PHONE] },
  { id: "instructor", name: "Instructor console", kind: "page", url: "instructor/index.html", vps: [DESK] },
].filter((p) => !ONLY || ONLY.includes(p.id));

// Counted at the GL calls: draws per frame and triangles (TRIANGLES mode × instances), and the first draw's time.
const GL_PROBE = () => {
  window.__sv = { firstDraw: null, calls: 0, tris: 0, frames: [] };
  const wrap = (proto) => {
    if (!proto) return;
    const add = (mode, count, inst = 1) => { const s = window.__sv; if (s.firstDraw == null) s.firstDraw = performance.now(); s.calls++; if (mode === 4) s.tris += (count / 3) * inst; };
    const de = proto.drawElements, da = proto.drawArrays, dei = proto.drawElementsInstanced, dai = proto.drawArraysInstanced;
    proto.drawElements = function (m, c, t, o) { add(m, c); return de.call(this, m, c, t, o); };
    proto.drawArrays = function (m, f, c) { add(m, c); return da.call(this, m, f, c); };
    if (dei) proto.drawElementsInstanced = function (m, c, t, o, n) { add(m, c, n); return dei.call(this, m, c, t, o, n); };
    if (dai) proto.drawArraysInstanced = function (m, f, c, n) { add(m, c, n); return dai.call(this, m, f, c, n); };
  };
  wrap(window.WebGL2RenderingContext?.prototype);
  wrap(window.WebGLRenderingContext?.prototype);
};

async function sample(page, ms = 2000) {
  return page.evaluate(async (ms) => {
    const s = window.__sv; const deltas = []; const perFrame = [];
    let last = performance.now(); const end = last + ms;
    while (performance.now() < end) {
      const c0 = s.calls, t0 = s.tris;
      await new Promise((r) => requestAnimationFrame(r));
      const now = performance.now(); deltas.push(now - last); last = now; perFrame.push({ calls: s.calls - c0, tris: s.tris - t0 });
    }
    deltas.sort((a, b) => a - b); const busy = perFrame.filter((f) => f.calls > 0);
    const med = (a) => a.length ? a[Math.floor(a.length / 2)] : 0;
    return {
      frameMs: Math.round(med(deltas)), frames: deltas.length,
      calls: med(busy.map((f) => f.calls).sort((a, b) => a - b)), triangles: Math.round(med(busy.map((f) => f.tris).sort((a, b) => a - b))),
    };
  }, ms);
}

const TYPES = { ".html": "text/html", ".js": "application/javascript", ".mjs": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".glb": "model/gltf-binary", ".webmanifest": "application/json", ".wasm": "application/wasm" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  let file = join(WEBXR, path);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!file.startsWith(WEBXR) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise((r, j) => { server.once("error", j); server.listen(PORT, "127.0.0.1", r); });
const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const { chromium } = await import(PW);
const browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
if (STILLS) mkdirSync(SHOTS, { recursive: true });

const results = existsSync(OUT) && ONLY ? JSON.parse(readFileSync(OUT, "utf8")) : { at: null, pages: {} };
for (const pg of pages) {
  const row = { id: pg.id, name: pg.name, kind: pg.kind, url: pg.url, vps: {} };
  for (const vp of pg.vps) {
    const phone = vp.width < 500;
    const context = await browser.newContext({ viewport: vp, hasTouch: phone, isMobile: phone });
    await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
    await context.route("**/cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC }));
    await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    await context.addInitScript(GL_PROBE);
    const page = await context.newPage();
    const errors = [], consoleErrors = [];
    page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0].slice(0, 160)));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR/.test(m.text())) consoleErrors.push(m.text().split("\n")[0].slice(0, 160)); });
    const r = { errors, consoleErrors };
    try {
      await page.goto(`http://127.0.0.1:${PORT}/${pg.url}`, { waitUntil: "load", timeout: 60000 });
      await page.waitForTimeout(2500);
      Object.assign(r, await page.evaluate(() => {
        const vis = (el) => !!el && !el.closest("[hidden]") && el.getBoundingClientRect().width > 0;
        const buttons = [...document.querySelectorAll("button, a.btn")].filter(vis).map((b) => b.textContent.trim().replace(/\s+/g, " ").slice(0, 40)).filter(Boolean);
        const mounts = Object.fromEntries([...document.querySelectorAll("[id^=menu-]")].map((el) => [el.id, { vis: vis(el), text: el.textContent.trim().length, kids: el.children.length }]));
        const small = [...document.querySelectorAll("button, a.btn, [role=button]")].filter(vis).filter((b) => { const q = b.getBoundingClientRect(); return q.height < 44 || q.width < 44; }).length;
        return { title: document.title, h1: document.querySelector("h1")?.textContent.trim().slice(0, 60) ?? "", bootMs: window.__sv.firstDraw == null ? null : Math.round(window.__sv.firstDraw), buttons: buttons.slice(0, 40), buttonCount: buttons.length, mounts, overflow: document.documentElement.scrollWidth > innerWidth + 1, smallTargets: small, menuHeight: Math.round(document.getElementById("menu")?.scrollHeight ?? 0) };
      }));
      // Enter the world: the parish handle's begin, else the page's own start button.
      const began = await page.evaluate(() => {
        const T = window.__parishTest ?? window.__summitTest;
        if (T?.begin) { T.begin(); return "begin"; }
        const b = document.getElementById("menu-start"); if (b && b.getBoundingClientRect().width > 0) { b.click(); return "menu-start"; }
        return null;
      });
      r.began = began;
      await page.waitForTimeout(began ? 2500 : 500);
      Object.assign(r, await sample(page, 2000));
      if (pg.kind === "parish") {
        r.features = await page.evaluate((feats) => {
          const T = window.__parishTest ?? {};
          const out = {};
          for (const f of feats) {
            const el = f.mount ? document.getElementById(f.mount) : null;
            out[f.id] = { handle: f.handle ? T[f.handle] != null : null, mount: f.mount ? !!el && (el.textContent.trim().length > 0 || el.tagName === "BUTTON") : null };
          }
          let st = null; try { st = T.stats?.(); } catch (_) { /* keep */ }
          out._stats = st ? { meshes: st.meshes ?? st.drawn ?? null, triangles: st.triangles ?? null, chunks: st.chunks ?? null } : null;
          let meshes = 0; T.scene?.traverse((o) => { if (o.isMesh && o.visible) meshes++; }); out._sceneMeshes = meshes;
          // The duplicate-key test handle (a merge artifact) drops the streets and ground updates on teleport.
          out._teleportUpdatesStreets = /cwStreetsMount|tfLand/.test(String(T.teleport));
          // Motor Pool, Crew Credits and the map open without an error.
          const tries = {};
          for (const [k, fn] of [["motorPool", () => T.motorPool?.()], ["ledger", () => T.tycoon?.open?.()], ["map", () => T.openMap?.()]]) {
            try { fn(); tries[k] = T.np?.modal ?? "ok"; } catch (e) { tries[k] = "error: " + String(e.message).slice(0, 80); }
            document.querySelectorAll("[data-close]").forEach((b) => { if (b.getBoundingClientRect().width) b.click(); });
          }
          out._opens = tries;
          return out;
        }, SV_FEATURES);
      }
      if (STILLS && (vp === DESK || pg.vps.length === 1)) await page.screenshot({ path: join(SHOTS, `${pg.id}.jpg`), type: "jpeg", quality: 45 });
      if (STILLS && phone && pg.kind === "parish" && pg.id === "orleans") await page.screenshot({ path: join(SHOTS, `${pg.id}-phone.jpg`), type: "jpeg", quality: 45 });
    } catch (e) { errors.push(`navigation: ${String(e.message).split("\n")[0].slice(0, 160)}`); }
    await context.close();
    row.vps[`${vp.width}x${vp.height}`] = r;
    console.log(`  ${pg.id.padEnd(22)} ${String(vp.width).padStart(4)}  errors ${errors.length}  boot ${r.bootMs ?? "—"} ms  frame ${r.frameMs ?? "—"} ms  calls ${r.calls ?? "—"}  tris ${r.triangles ?? "—"}  buttons ${r.buttonCount ?? "—"}${errors.length ? "  · " + errors[0] : ""}`);
  }
  results.pages[pg.id] = row;
}
await browser.close();
server.close();
results.at = new Date().toISOString();
writeFileSync(OUT, JSON.stringify(results, null, 1));
const n = Object.values(results.pages).reduce((s, p) => s + Object.values(p.vps).filter((v) => !v.errors.length).length, 0);
const all = Object.values(results.pages).reduce((s, p) => s + Object.keys(p.vps).length, 0);
console.log(`sv_survey: ${Object.keys(results.pages).length} pages, ${n}/${all} views without a page error → ${OUT.replace(ROOT + "/", "")}`);
process.exit(0);
