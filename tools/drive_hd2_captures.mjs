#!/usr/bin/env node
/**
 * ENV-HD-2 (docs/consoles/ENV-HD-2.md): captures for the reel and the deck, in the built parishes page (not in the gate).
 * 1920×1080 stills of every skinned INTERIORS room (window.__parishTest.hd2.room) and of a robot site's neighbourhood by
 * day and by night (window.__parishTest.hd2.hood), with each room's measured meshes, draw calls and texture bytes, page
 * errors and off-host requests. Rebuild the bundle first: python3 tools/bundle_webxr.py parishes
 *
 *     node tools/drive_hd2_captures.mjs [port=9103] [tier=high] [outDir] [site=rb-site-west-oakland-warehouse] [all|rooms|hood]
 *
 * Exits 1 when a capture fails, a page error is thrown or a request leaves the host.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext, pvLoad } = await imp("tools/lib/pv_browser.mjs");
const { RB_SITES } = await imp("WebXR/shared/rb-robotics-data.js");
const { HD2_SKIN_STYLES } = await imp("WebXR/shared/hd2-room-skins.js");

const port = Number(process.argv[2]) || 9103, tier = process.argv[3] || "high", outDir = process.argv[4] || null;
const part = process.argv[6] || "all";
const siteId = process.argv[5] || "rb-site-west-oakland-warehouse", siteParish = RB_SITES.find((s) => s.id === siteId)?.parish ?? "oak-west-oakland";
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], shots: 0, failed: 0 };
const context = await pvContext(browser, { viewport: { width: 1920, height: 1080 } });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; out.offHost.push(u); });
const t0 = Date.now();
console.log(`drive_hd2_captures: tier ${tier}, port ${port}, load ${pvLoad()}`);
const frames = (n) => page.evaluate((n) => new Promise((res) => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const open = async (parishId) => {
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${parishId}&tier=${tier}`, { waitUntil: "load", timeout: 180000 });
  await page.waitForFunction(() => !!window.__parishTest?.hd2 && !!window.__parishTest?.exteriors, null, { timeout: 180000 });
};

// 1. the skinned rooms (Orleans opens every style; a style no site there opens is entered at the first site)
if (part !== "hood") {
await open("orleans");
await page.evaluate(() => window.__parishTest.setTime(1));
for (const st of Object.keys(HD2_SKIN_STYLES)) {
  const r = await page.evaluate((st) => window.__parishTest.hd2.room(st), st);
  await frames(12);
  const m = await page.evaluate(() => {
    const t = window.__parishTest, x = t.roboInteriors.measure(), rr = t.npRenderer; rr.info.autoReset = true; rr.render(t.threeScene, t.camera);
    return { ...x, calls: rr.info.render.calls, drawn: rr.info.render.triangles };
  });
  const res = tier === "high" ? 1024 : 256;
  const ok = !!r && r.skin?.res === res && m.inside && m.style === st && m.textures.some((t) => t.w === res);
  out.shots++; if (!ok) out.failed++;
  if (outDir) await page.screenshot({ path: join(outDir, `room-${st}-${tier}.png`) });
  console.log(`${ok ? "ok  " : "FAIL"} room ${st}: ${m.meshes} meshes, ${m.calls} draw calls, ${m.drawn} triangles drawn, textures ${(m.textureBytes / 1048576).toFixed(2)} MiB measured (${m.textures.map((t) => `${t.name} ${t.w}`).join(", ")})`);
}
await page.evaluate(() => { const t = window.__parishTest; if (t.interiors.mount.inside()) t.interiors.mount.exit(); });
}

// 2. a robot site's neighbourhood by day and by night
if (part !== "rooms") {
await open(siteParish);
for (const [label, idx] of [["day", 1], ["night", 3]]) {
  await page.evaluate((i) => window.__parishTest.setTime(i), idx);
  const sc = await page.evaluate((id) => window.__parishTest.hd2.hood(id), siteId);
  await frames(30);
  const c = await page.evaluate(() => {
    const t = window.__parishTest, rr = t.npRenderer; rr.info.autoReset = true; rr.render(t.threeScene, t.camera);
    let rob = 0; t.threeScene.traverse((o) => { if (o.isInstancedMesh && /-robotics$/.test(o.name) && o.visible) rob += o.count; });
    return { calls: rr.info.render.calls, triangles: rr.info.render.triangles, robotics: rob, lit: t.exteriors.counts().lit };
  });
  const ok = !!sc?.ok && c.robotics > 0;
  out.shots++; if (!ok) out.failed++;
  if (outDir) await page.screenshot({ path: join(outDir, `hood-${siteId}-${label}-${tier}.png`) });
  console.log(`${ok ? "ok  " : "FAIL"} neighbourhood ${siteId} ${label}: ${c.calls} draw calls, ${c.triangles} triangles, robotics-variant buildings in the scene ${c.robotics}, windows lit ${c.lit}`);
}
}

await browser.close(); await close();
const bad = out.failed || out.pageErrors.length || out.offHost.length;
console.log(`drive_hd2_captures: ${out.shots} captures, ${out.failed} failed, page errors ${out.pageErrors.length}${out.pageErrors.length ? ` (${out.pageErrors.slice(0, 3).join(" | ")})` : ""}, external requests ${out.offHost.length}, ${((Date.now() - t0) / 1000).toFixed(0)} s, load ${pvLoad()}`);
process.exit(bad ? 1 : 0);
