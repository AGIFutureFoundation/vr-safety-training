#!/usr/bin/env node
/**
 * ENV-HD-3 (docs/consoles/ENV-HD-3.md): stills for the reel and the deck, in the built parishes page (not in the gate).
 * The six non-robot establishing shots (hd3-scenes.js: the three busiest non-robot sites x "wide" / "street"), each by day
 * and by night, at 1920x1080 through window.__parishTest.scene, with each frame's draw calls and triangles, page errors and
 * off-host requests. Files are named <map>-<kind>-<shot>-<day|night>.jpg (JPEG q92 since ENV-HD-5: the machine's disk is
 * shared). ENV-HD-5: the seven sites (+ park, fire station, hospital, school); one page load per map. Rebuild the bundle first:
 * python3 tools/bundle_webxr.py parishes
 *
 *     node tools/drive_hd3_scenes.mjs [port=9112] [tier=high] [outDir] [shots=wide,street] [sites=<id>,...]
 *
 * Exits 1 when a capture fails, a page error is thrown or a request leaves the host.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext, pvLoad } = await imp("tools/lib/pv_browser.mjs");
const { HD3_SCENE_SITES, HD3_SHOTS } = await imp("WebXR/shared/hd3-scenes.js");

const port = Number(process.argv[2]) || 9112, tier = process.argv[3] || "high", outDir = process.argv[4] || null;
const only = (process.argv[5] || HD3_SHOTS.join(",")).split(","); // optional: re-shoot some shots only (e.g. "wide")
const sites = process.argv[6] ? process.argv[6].split(",") : HD3_SCENE_SITES.map((s) => s.id); // optional: some sites only
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], shots: 0, failed: 0, files: [] };
const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; out.offHost.push(u); });
const t0 = Date.now();
console.log(`drive_hd3_scenes: tier ${tier}, port ${port}, load ${pvLoad()}`);
const frames = (n) => page.evaluate((n) => new Promise((res) => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);

let loaded = null;
for (const site of HD3_SCENE_SITES.filter((s) => sites.includes(s.id)).sort((a, b) => a.parish.localeCompare(b.parish))) {
  if (loaded !== site.parish) { // one load per map: the sites on a map share the page
    await page.goto(`${base}/parishes/dist/parishes.html?parish=${site.parish}&tier=${tier}`, { waitUntil: "load", timeout: 240000 });
    await page.waitForFunction(() => typeof window.__parishTest?.scene === "function" && !!window.__parishTest?.exteriors, null, { timeout: 240000 });
    loaded = site.parish;
  }
  const presets = await page.evaluate(() => window.__parishTest.scenePresets?.().length ?? 0);
  for (const [label, idx] of [["day", 1], ["night", 3]]) {
    await page.evaluate((i) => window.__parishTest.setTime(i), idx);
    for (const shot of HD3_SHOTS.filter((x) => only.includes(x))) {
      const sc = await page.evaluate(([id, s]) => window.__parishTest.scene(id, s), [site.id, shot]);
      await frames(40);
      const c = await page.evaluate((want) => {
        const t = window.__parishTest, rr = t.npRenderer; rr.info.autoReset = true; rr.render(t.threeScene, t.camera);
        const p = t.camera.position, d = want ? Math.hypot(p.x - want[0], p.y - want[1], p.z - want[2]) : 99;
        return { calls: rr.info.render.calls, triangles: rr.info.render.triangles, camOff: d };
      }, sc?.position ?? null);
      const ok = !!sc?.ok && c.camOff < 0.5 && c.calls > 10;
      out.shots++; if (!ok) out.failed++;
      const file = `${site.parish}-${site.kind}-${shot}-${label}.jpg`;
      // a clean frame for the deck: the page's buttons and panels (fixed or absolute, not holding the canvas) are hidden
      const hidden = await page.evaluate(() => { let n = 0; for (const el of document.body.querySelectorAll("*")) { if (el.tagName === "CANVAS" || el.querySelector("canvas")) continue; const cs = getComputedStyle(el); if ((cs.position === "fixed" || cs.position === "absolute") && cs.visibility !== "hidden") { el.dataset.hd3Hid = "1"; el.style.visibility = "hidden"; n++; } } return n; });
      await frames(2);
      if (outDir) { await page.screenshot({ path: join(outDir, file), type: "jpeg", quality: 92 }); out.files.push(file); }
      await page.evaluate(() => { for (const el of document.querySelectorAll("[data-hd3-hid]")) { el.style.visibility = ""; delete el.dataset.hd3Hid; } });
      console.log(`${ok ? "ok  " : "FAIL"} ${file}: preset ${site.id}:${shot}, ${c.calls} draw calls, ${c.triangles} triangles, camera ${c.camOff.toFixed(2)} m from the preset, ${hidden} overlay element(s) hidden for the still (presets listed by the page: ${presets})`);
    }
  }
}

await browser.close(); await close();
const bad = out.failed || out.pageErrors.length || out.offHost.length;
console.log(`drive_hd3_scenes: ${out.shots} captures, ${out.failed} failed, page errors ${out.pageErrors.length}${out.pageErrors.length ? ` (${out.pageErrors.slice(0, 3).join(" | ")})` : ""}, external requests ${out.offHost.length}${out.offHost.length ? ` (${out.offHost.slice(0, 3).join(" | ")})` : ""}, ${((Date.now() - t0) / 1000).toFixed(0)} s, load ${pvLoad()}`);
process.exit(bad ? 1 : 0);
