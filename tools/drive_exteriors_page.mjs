#!/usr/bin/env node
/**
 * ROBO-EXTERIORS (docs/consoles/ROBO-EXTERIORS.md): the page-level proof in the BUILT parishes page. For every robot site
 * it frames both establishing shots through `__parishTest.scene(siteId, shot)`, and measures the renderer on that view with
 * the kit hidden (before) and shown (after): draw calls, triangles, geometries and textures, plus the texture bytes of the
 * canvases the kit drew. Then night (setTime(3)): the kit's windows are lit. Page errors 0, external requests 0.
 *
 * Not in the gate (it boots the full page five times). Build first, then run:
 *     python3 tools/bundle_webxr.py parishes && node tools/drive_exteriors_page.mjs [port] [tier] [outDir]
 * Prints one line per shot; writes PNGs to outDir when given; exits 1 when a shot or the error/request count fails.
 */
import { pathToFileURL, fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const { pvServe, pvLaunch, pvContext, pvLoad } = await imp("tools/lib/pv_browser.mjs");
const { RB_SITES } = await imp("WebXR/shared/rb-robotics-data.js");

const port = Number(process.argv[2]) || 9094, tier = process.argv[3] || "high", outDir = process.argv[4] || null;
if (outDir) mkdirSync(outDir, { recursive: true });
const { base, close } = await pvServe(port);
const browser = await pvLaunch();
const out = { pageErrors: [], offHost: [], shots: 0, failed: 0 };
const context = await pvContext(browser, { viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
page.on("pageerror", (e) => out.pageErrors.push(e.message));
page.on("request", (r) => { const u = r.url(); if (u.startsWith("http://127.0.0.1") || u.startsWith("data:") || u.startsWith("blob:")) return; if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\//.test(u)) return; out.offHost.push(u); });
const t0 = Date.now();
console.log(`drive_exteriors: tier ${tier}, port ${port}, load ${pvLoad()}`);
const frames = (n) => page.evaluate((n) => new Promise((res) => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
const measure = () => page.evaluate(() => {
  const t = window.__parishTest, r = t.npRenderer; r.info.autoReset = true; r.render(t.threeScene, t.camera);
  return { calls: r.info.render.calls, triangles: r.info.render.triangles, geometries: r.info.memory.geometries, textures: r.info.memory.textures };
});
for (const parishId of [...new Set(RB_SITES.map((s) => s.parish))]) {
  const sites = RB_SITES.filter((s) => s.parish === parishId);
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${parishId}&tier=${tier}`, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => !!window.__parishTest?.exteriors && typeof window.__parishTest.scene === "function", null, { timeout: 120000 });
  await page.evaluate(() => window.__parishTest.setTime(1));
  for (const s of sites) for (const shot of ["wide", "door"]) {
    const sc = await page.evaluate(([id, shot]) => window.__parishTest.scene(id, shot), [s.id, shot]);
    await frames(20);
    const hidden = await page.evaluate(() => { window.__parishTest.exteriors.group.visible = false; return true; }) && await measure();
    await page.evaluate(() => { window.__parishTest.exteriors.group.visible = true; });
    const shown = await measure();
    const c = await page.evaluate(() => window.__parishTest.exteriors.counts());
    const ok = sc?.ok && shown.calls > hidden.calls && c.sites === sites.length;
    out.shots++; if (!ok) out.failed++;
    if (outDir) await page.screenshot({ path: join(outDir, `${s.id}-${shot}-${tier}.png`) });
    console.log(`${ok ? "ok  " : "FAIL"} ${s.id} ${shot}: draw calls ${hidden.calls} -> ${shown.calls}, triangles ${hidden.triangles} -> ${shown.triangles}, textures ${shown.textures}, kit ${c.meshes} meshes / ${c.triangles} tris, kit texture bytes ${c.textureBytes}`);
  }
  // night: the kit's windows light on ATMOS's clock
  await page.evaluate(() => window.__parishTest.setTime(3));
  const night = await page.evaluate(() => window.__parishTest.exteriors.counts().lit);
  await page.evaluate(([id]) => window.__parishTest.scene(id, "wide"), [sites[0].id]); await frames(10);
  if (outDir) await page.screenshot({ path: join(outDir, `${sites[0].id}-night-${tier}.png`) });
  const okN = tier === "low" ? true : night; if (!okN) out.failed++;
  console.log(`${okN ? "ok  " : "FAIL"} ${parishId} night: windows lit ${night}`);
}
await browser.close(); close();
console.log(`drive_exteriors: ${out.shots} shots, ${out.failed} failed, page errors ${out.pageErrors.length}, external requests ${out.offHost.length}, ${((Date.now() - t0) / 1000).toFixed(0)} s, load ${pvLoad()}`);
if (out.pageErrors.length) console.log("  page errors:", out.pageErrors.slice(0, 5).join(" | "));
if (out.offHost.length) console.log("  external:", out.offHost.slice(0, 5).join(" | "));
process.exit(out.failed || out.pageErrors.length || out.offHost.length ? 1 : 0);
