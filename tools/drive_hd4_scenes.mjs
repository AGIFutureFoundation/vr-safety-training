#!/usr/bin/env node
/**
 * ENV-HD-4 (docs/consoles/ENV-HD-4.md): stills and frame times in the built parishes page (not in the gate).
 * Each robot site's wide shot under the six looks (hd4-looks.js: dawn, day, dusk, night, fog at dawn, rain at dusk) through
 * window.__parishTest.scene(siteId, "wide", look), the six lit robot rooms (ixScene) and the hive operations room
 * (__parishTest.hd4.opsRoom()), at 1920x1080, with each frame's draw calls and triangles, page errors and off-host requests.
 * With `ultra`, the page opens with ?ultra=1 (the opt-in setting) and the drive reports what Ultra allocated. `time` measures
 * the frame time (hd4.frameTime: the view rendered n times, each waiting on the GPU) at the West Oakland warehouse's night shot
 * and in the cell hall. Files: <site>-wide-<look>-<time>.jpg and room-<style>-lit.jpg (JPEG q92: the machine's disk is shared).
 * Rebuild the bundle first: python3 tools/bundle_webxr.py parishes
 *
 *     node tools/drive_hd4_scenes.mjs [port=9123] [tier=high] [outDir] [maps=oak-west-oakland] [looks=all] [rooms|norooms] [ultra|high] [time|notime]
 *
 * Exits 1 when a capture fails, a page error is thrown or a request leaves the host.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext, pvLoad } = await imp("tools/lib/pv_browser.mjs");
const { HD4_LOOKS, HD4_LOOK_IDS } = await imp("WebXR/shared/hd4-looks.js");
const { IXR_ROOMS } = await imp("WebXR/shared/ixr-robo-interiors.js");

const port = Number(process.argv[2]) || 9123, tier = process.argv[3] || "high", outDir = process.argv[4] || null;
const maps = (process.argv[5] || "oak-west-oakland").split(",");
const looks = !process.argv[6] || process.argv[6] === "all" ? HD4_LOOK_IDS : process.argv[6].split(",");
const rooms = (process.argv[7] || "rooms") === "rooms", ultra = process.argv[8] === "ultra", timing = (process.argv[9] || "time") === "time";
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], shots: 0, failed: 0, files: [] };
const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; out.offHost.push(u); });
const t0 = Date.now();
console.log(`drive_hd4_scenes: tier ${tier}${ultra ? " + Ultra" : ""}, port ${port}, maps ${maps.join(", ")}, looks ${looks.join(", ")}, load ${pvLoad()}`);
const frames = (n) => page.evaluate((n) => new Promise((res) => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const measure = () => page.evaluate(() => { const t = window.__parishTest, rr = t.npRenderer; rr.info.autoReset = true; rr.render(t.threeScene, t.camera); return { calls: rr.info.render.calls, triangles: rr.info.render.triangles }; });
async function still(file) {
  // a clean frame for the deck: the page's buttons and panels (fixed or absolute, not holding the canvas) are hidden
  const hidden = await page.evaluate(() => { let n = 0; for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.hd4Hid = "1"; el.style.visibility = "hidden"; n++; } } return n; });
  await frames(2);
  if (outDir) { await page.screenshot({ path: join(outDir, file), type: "jpeg", quality: 92 }); out.files.push(file); }
  await page.evaluate(() => { for (const el of document.querySelectorAll("[data-hd4-hid]")) { el.style.visibility = ""; delete el.dataset.hd4Hid; } });
  return hidden;
}

let first = true;
for (const map of maps) {
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${map}&tier=${tier}${ultra ? "&ultra=1" : ""}`, { waitUntil: "load", timeout: 300000 });
  await page.waitForFunction(() => typeof window.__parishTest?.scene === "function" && !!window.__parishTest?.hd4, null, { timeout: 300000 });
  const info = await page.evaluate(() => ({ ultra: window.__parishTest.hd4.ultra, presets: window.__parishTest.hd4.lookPresets().length, sites: window.__parishTest.hd4.lookPresets().filter((p) => p.parish === new URLSearchParams(location.search).get("parish")).map((p) => p.siteId), opsDoors: window.__parishTest.hd4.opsDoors.length }));
  const siteIds = [...new Set(info.sites)];
  console.log(`  ${map}: Ultra ${info.ultra.on ? "on" : "off"} (${info.ultra.source}), ${info.presets} look presets listed, robot sites here: ${siteIds.join(", ")}, ops-room doors here: ${info.opsDoors}`);
  for (const siteId of siteIds) {
    let firstLook = true;
    for (const look of looks) {
      const sc = await page.evaluate(([id, l]) => window.__parishTest.scene(id, "wide", l), [siteId, look]);
      await frames(firstLook ? 36 : 14); firstLook = false;
      const c = await measure();
      const cam = await page.evaluate((want) => { const p = window.__parishTest.camera.position; return want ? Math.hypot(p.x - want[0], p.y - want[1], p.z - want[2]) : 99; }, sc?.position ?? null);
      const sl = await page.evaluate(() => window.__parishTest.hd4.sites());
      const ok = !!sc?.ok && !!sc?.lookOk && cam < 0.5 && c.calls > 10;
      out.shots++; if (!ok) out.failed++;
      const file = `${siteId.replace(/^rb-site-/, "")}-wide-${look}-${HD4_LOOKS[look].time}${ultra ? "-ultra" : ""}.jpg`;
      const hidden = await still(file);
      console.log(`${ok ? "ok  " : "FAIL"} ${file}: preset ${siteId}:wide:${look}, ${c.calls} draw calls, ${c.triangles} triangles, fog ${sc?.fog?.near ?? "?"}-${sc?.fog?.far ?? "?"} m (density ${sc?.fog?.density ?? "?"}), wet ${sc?.wet ?? "?"}, site lights ${sl?.built ? `${sl.level} (${sl.masts} masts, ${sl.docks} dock lamps)` : "not built"}, camera ${cam.toFixed(2)} m from the preset, ${hidden} overlays hidden`);
      if (timing && look === "night" && /west-oakland-warehouse/.test(siteId)) {
        const ft = await page.evaluate(() => window.__parishTest.hd4.frameTime(12));
        console.log(`     frame time (${ultra ? "Ultra" : tier}, ${siteId}:wide:night): median ${ft.medianMs} ms, p90 ${ft.p90Ms} ms over ${ft.n} renders, ${ft.calls} draw calls, ${ft.triangles} triangles, ${ft.textures} textures, load ${pvLoad()}`);
      }
    }
  }
  if (ultra || first) {
    const ex = await page.evaluate(() => ({ fx: window.__parishTest.hd4.exteriors(), u: window.__parishTest.hd4.ultraSites() }));
    console.log(`     exteriors here: ${ex.fx?.meshes} meshes, ${ex.fx?.triangles} triangles, facade texture bytes allocated ${((ex.fx?.textureBytes ?? 0) / 1048576).toFixed(2)} MiB; Ultra detail: ${ex.u ? `${ex.u.meshes} meshes, ${ex.u.triangles} triangles` : "none (Ultra off)"}`);
  }
  if (rooms && first) {
    for (const style of [...Object.keys(IXR_ROOMS), "hd4-hive-ops"]) {
      const r = await page.evaluate((st) => (st === "hd4-hive-ops" ? window.__parishTest.hd4.opsRoom() : window.__parishTest.ixScene(st)), style);
      await frames(18);
      const c = await measure();
      const m = await page.evaluate(() => window.__parishTest.hd4.measure());
      const ok = !!r && m.inside && m.style === style && c.calls > 5;
      out.shots++; if (!ok) out.failed++;
      const file = `room-${style}-lit${ultra ? "-ultra" : ""}.jpg`;
      const hidden = await still(file);
      console.log(`${ok ? "ok  " : "FAIL"} ${file}: ${m.meshes} meshes, ${m.trianglesBuilt} triangles built, ${c.calls} draw calls, ${c.triangles} triangles drawn, ${m.lights} lights, ${(m.textureBytes / 1048576).toFixed(2)} MiB textures, lighting ${m.hd4Lights ? `${m.hd4Lights.panels} panels / ${m.hd4Lights.pendants} pendants / ${m.hd4Lights.beacons} beacons` : "none"}${m.ultra ? `, Ultra hero ${m.ultra.hero.join("+")} + ${m.ultra.triangles} tris` : ""}, ${hidden} overlays hidden`);
      if (timing && style === "ixr-cell-hall") {
        const ft = await page.evaluate(() => window.__parishTest.hd4.frameTime(12));
        console.log(`     frame time (${ultra ? "Ultra" : tier}, cell hall): median ${ft.medianMs} ms, p90 ${ft.p90Ms} ms over ${ft.n} renders, ${ft.calls} draw calls, ${ft.triangles} triangles, load ${pvLoad()}`);
      }
    }
    await page.evaluate(() => { const t = window.__parishTest; if (t.interiors?.mount?.inside?.()) t.interiors.mount.exit(); });
  }
  first = false;
}

await browser.close(); await close();
const bad = out.failed || out.pageErrors.length || out.offHost.length;
console.log(`drive_hd4_scenes: ${out.shots} captures, ${out.failed} failed, page errors ${out.pageErrors.length}${out.pageErrors.length ? ` (${out.pageErrors.slice(0, 3).join(" | ")})` : ""}, external requests ${out.offHost.length}${out.offHost.length ? ` (${out.offHost.slice(0, 3).join(" | ")})` : ""}, ${((Date.now() - t0) / 1000).toFixed(0)} s, load ${pvLoad()}`);
process.exit(bad ? 1 : 0);
