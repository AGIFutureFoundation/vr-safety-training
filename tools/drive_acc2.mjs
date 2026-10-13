#!/usr/bin/env node
/**
 * ACCESS-2 (docs/consoles/ACCESS-2.md): the built parishes page, one load per tier (high, balanced).
 *  - The combined chunk count in the built page: at every kind-cued site's door, once the detail pool has drained, the chunk's
 *    FACADES groups (userData.fc, under the chunk's group) + the kind-cue triangles charged there (hd6 userData.sites, by the
 *    site building's chunk, plus 48 a board lamp) + the entrance parts there (access.chunks()) against FC_BUDGET.
 *  - On high: a day still of a marked door close up (the recessed panel), the same door at night (setTime night: the lamp's
 *    lit face), and a night wide still; page errors.
 *
 *     python3 tools/bundle_webxr.py && node tools/drive_acc2.mjs [port=9176] [outDir] [parish=orleans] [tiers=high,balanced]
 */
import { createServer } from "node:http";
import { existsSync, statSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const PORT = Number(process.argv[2] || 9176), OUT = process.argv[3] || null, PARISH = process.argv[4] || "orleans", TIERS = (process.argv[5] || "high,balanced").split(",");
if (OUT) mkdirSync(OUT, { recursive: true });
const { pwModule, pwExecutable } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
const F = await import(pathToFileURL(join(WEBXR, "shared/fc-facades.js")).href);
const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
  const file = join(WEBXR, path);
  if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
});
await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
const base = `http://127.0.0.1:${PORT}`;
const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
const t0 = Date.now(); let external = 0, ok = 0, bad = 0;
const line = (good, msg) => { if (good) ok++; else bad++; console.log(`${good ? "ok  " : "FAIL"} ${msg}`); };
const { chromium } = await pwModule();
const browser = await chromium.launch({ executablePath: pwExecutable(), args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
try {
  for (const tier of TIERS) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith(base)) return route.continue();
      if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
      external++; return route.abort();
    });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    await page.goto(`${base}/parishes/dist/parishes.html?parish=${PARISH}&tier=${tier}`, { waitUntil: "load", timeout: 240000 });
    await page.waitForFunction(() => !!window.__parishTest?.access?.chunks, null, { timeout: 240000 });
    await page.evaluate(() => window.__parishTest.begin());
    const info = await page.evaluate(() => { const T = window.__parishTest; return { mesh: T.access.mesh(), cues: T.hd6()?.cues ? { sites: T.hd6().cues.sites.length, triangles: T.hd6().cues.triangles, lamps: T.hd6().cues.lamps } : null }; });
    line(info.mesh && info.mesh.meshes === 2, `${tier}: entrances mounted ${JSON.stringify(info.mesh)}, kind cues ${JSON.stringify(info.cues)}`);
    // The cued sites: every site the hd6 cue mesh lists, with its door and building from the entrances.
    const cued = await page.evaluate(() => {
      const T = window.__parishTest, sites = T.hd6()?.cues?.sites ?? [], out = [];
      for (const s of sites) { const e = T.access.entrances().find((q) => q.site.id === s.id); if (e) out.push({ id: s.id, kind: s.kind, tris: s.triangles, cx: e.b.cx, cz: e.b.cz, dx: e.door.x, dz: e.door.z, face: e.face, sx: e.site.position[0], sz: e.site.position[1] }); }
      return out;
    });
    line(cued.length > 0, `${tier}: ${cued.length} kind-cued sites with an entrance on ${PARISH}`);
    const measured = new Map(); let over = 0, worst = null;
    for (const s of cued) {
      await page.evaluate(({ x, z }) => { window.__parishTest.teleport(x, z, 0, 0); }, { x: s.dx, z: s.dz });
      // let the streamed chunks build (np-world builds at most three a frame), then drain SMOOTH's detail pool in one go
      await page.waitForTimeout(1200);
      await page.evaluate(() => { try { window.__parishTest.detail?.drain?.(); } catch (_) {} });
      await page.waitForFunction(() => { const st = window.__parishTest.detail?.stats?.(); return !st || st.pending === 0; }, null, { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(300);
      const row = await page.evaluate(({ cx, cz, sx, sz }) => {
        const T = window.__parishTest, key = T.np.chunkOf ? T.np.chunkOf(cx, cz).key : null;
        // the chunk key the way np-parish keys it: floor((x + 2048) / 256)
        const k = `${Math.max(0, Math.min(15, Math.floor((cx + 2048) / 256)))},${Math.max(0, Math.min(15, Math.floor((cz + 2048) / 256)))}`;
        let fc = 0, fcMeshes = 0, groups = 0;
        T.scene.traverse((o) => {
          if (!o.userData?.fc) return;
          // np-world names the FACADES group `mass-details-<key>` under the chunk's root
          let ck = typeof o.name === "string" && o.name.startsWith("mass-details-") ? o.name.slice(13) : null;
          for (let p = o.parent; !ck && p; p = p.parent) if (typeof p.name === "string" && p.name.startsWith("chunk-")) ck = p.name.slice(6);
          if (ck === k) { fc += o.userData.fc.triangles; fcMeshes += o.userData.fc.meshes; groups++; }
        });
        const sites = T.hd6()?.cues?.sites ?? [], ents = T.access.entrances();
        let cue = 0; for (const s of sites) { const e = ents.find((q) => q.site.id === s.id); if (!e) continue; const ek = `${Math.floor((e.b.cx + 2048) / 256)},${Math.floor((e.b.cz + 2048) / 256)}`; if (ek === k) cue += s.triangles; }
        let lamps = 0; for (const s of T.np.parish?.sites ?? ents.map((e) => e.site)) { const bk = `${Math.floor((s.position[0] + 2048) / 256)},${Math.floor((s.position[1] + 6 + 2048) / 256)}`; if (bk === k) lamps += 48; }
        const acc = T.access.chunks()[k] ?? 0;
        return { key: k, keyNp: key, fc, fcMeshes, groups, cue, lamps, acc, total: fc + cue + lamps + acc };
      }, s);
      measured.set(row.key, row);
      const budget = F.FC_BUDGET.trianglesPerChunk[tier];
      if (row.total > budget) over++;
      if (!worst || row.total > worst.total) worst = { ...row, site: s.id };
      // a chunk at the map's edge may hold no massing, so no FACADES group: 0 is a measurement, not a miss
      line(row.total <= budget, `${tier}: ${s.id} (${s.kind}) chunk ${row.key}: FACADES ${row.fc} (${row.groups} group${row.groups === 1 ? "" : "s"}, ${row.fcMeshes} meshes) + cues ${row.cue} + lamps ${row.lamps} + entrances ${row.acc} = ${row.total} <= ${budget}`);
    }
    line(over === 0, `${tier}: combined chunk count inside FC_BUDGET on every cued chunk in the built page (${measured.size - over} of ${measured.size}; worst ${worst ? `${worst.site} ${worst.key}: ${worst.total}` : "none"})`);
    if (OUT && tier === "high") {
      // The stills: a cued door close up by day (the recessed panel and push bar), the same at night (the lamp's lit face), and a wide night view.
      const pick = cued.find((s) => s.kind === "hospital") ?? cued.find((s) => s.kind === "fire-station") ?? cued[0];
      const o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[pick.face];
      const yaw = Math.atan2(o[0], o[1]);
      await page.evaluate(({ x, z, yaw }) => { window.__parishTest.teleport(x, z, yaw, -0.02); }, { x: pick.dx + o[0] * 3.2, z: pick.dz + o[1] * 3.2, yaw });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `${PARISH}-${pick.kind}-door-day.jpg`), type: "jpeg", quality: 88 });
      await page.evaluate(() => { window.__parishTest.setTime(3); });
      await page.waitForTimeout(3500);
      await page.screenshot({ path: join(OUT, `${PARISH}-${pick.kind}-door-night.jpg`), type: "jpeg", quality: 88 });
      await page.evaluate(({ x, z, yaw }) => { window.__parishTest.teleport(x, z, yaw, -0.05); }, { x: pick.dx + o[0] * 9, z: pick.dz + o[1] * 9, yaw });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: join(OUT, `${PARISH}-${pick.kind}-entrance-night.jpg`), type: "jpeg", quality: 88 });
      line(true, `stills: ${pick.id} door by day and night, entrance at night -> ${OUT}`);
    }
    line(errors.length === 0, `${tier}: page errors ${errors.length}${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
    await ctx.close();
  }
} catch (e) {
  line(false, `drive: ${String(e.message).split("\n")[0]}`);
} finally { await browser.close(); server.close(); }
console.log(`${bad ? "FAIL" : "PASS"} drive_acc2: ${ok} ok, ${bad} failed, external requests ${external}, ${Math.round((Date.now() - t0) / 1000)} s`);
process.exit(bad ? 1 : 0);
