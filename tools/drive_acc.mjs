#!/usr/bin/env node
/**
 * ACCESS (docs/consoles/ACCESS.md): the built parishes page, one load. At a cued fire station's door: a still of the marked, lit
 * entrance and its sign; in and out by each of the four inputs (E, the touch Use button, a gamepad's A through a stubbed
 * navigator.getGamepads, a stubbed XR session's select); a still inside each new room reached on this map; page errors.
 *
 *     python3 tools/bundle_webxr.py && node tools/drive_acc.mjs [port=9168] [outDir] [parish=orleans]
 */
import { createServer } from "node:http";
import { existsSync, statSync, readFileSync, mkdirSync } from "node:fs";
import { dirname, join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const PORT = Number(process.argv[2] || 9168), OUT = process.argv[3] || null, PARISH = process.argv[4] || "orleans";
if (OUT) mkdirSync(OUT, { recursive: true });
const { pwModule, pwExecutable } = await import(new URL("./lib/pw.mjs", import.meta.url).href);
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
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.route("**/*", (route) => {
    const u = route.request().url();
    if (u.startsWith(base)) return route.continue();
    if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
    external++; return route.abort();
  });
  // A gamepad stub the page polls: button 0 is pressed while window.__accPad is true.
  await ctx.addInitScript(() => {
    window.__accPad = false;
    navigator.getGamepads = () => [{ id: "stub", index: 0, connected: true, mapping: "standard", axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: i === 0 && window.__accPad, value: i === 0 && window.__accPad ? 1 : 0 })) }];
  });
  const page = await ctx.newPage();
  const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
  await page.goto(`${base}/parishes/dist/parishes.html?parish=${PARISH}&tier=high`, { waitUntil: "load", timeout: 240000 });
  await page.waitForFunction(() => !!window.__parishTest?.access, null, { timeout: 240000 });
  const info = await page.evaluate(() => { const T = window.__parishTest; T.begin(); return { mesh: T.access.mesh(), styled: T.access.styled, n: T.access.entrances().length }; });
  line(info.mesh && info.mesh.meshes === 2, `entrances mounted: ${JSON.stringify(info)}`);
  const kinds = { "fire-station": "acc-fire-bay", hospital: "acc-drop-off-lobby", school: "acc-classroom-wing", park: "acc-park-pavilion" };
  const doors = await page.evaluate((kinds) => {
    const T = window.__parishTest, out = {};
    for (const d of T.interiors.doors) if (kinds[d.site.kind] && !out[d.site.kind]) out[d.site.kind] = { x: d.x, z: d.z, face: d.face, id: d.site.id };
    return out;
  }, kinds);
  const INPUTS = ["keyboard", "touch", "gamepad", "headset"];
  const press = async (input) => {
    if (input === "keyboard") await page.keyboard.press("KeyE");
    else if (input === "touch") await page.evaluate(() => window.__parishTest.access.use());
    else if (input === "gamepad") { await page.evaluate(() => { window.__accPad = true; }); await page.waitForTimeout(1500); await page.evaluate(() => { window.__accPad = false; }); await page.waitForTimeout(800); }
    else if (input === "headset") await page.evaluate(() => { window.__accSel?.(); });
  };
  let inputsOk = 0;
  const kindList = Object.keys(doors);
  for (let k = 0; k < INPUTS.length; k++) {
    const input = INPUTS[k], kind = kindList[k % kindList.length], d = doors[kind];
    if (input === "headset") {
      await page.evaluate(async () => {
        const handlers = {};
        const stub = { addEventListener: (t, f) => { handlers[t] = f; }, removeEventListener: () => {}, requestReferenceSpace: async () => ({}), requestAnimationFrame: () => 0, end: () => {} };
        window.__accSel = () => handlers.select?.({ type: "select" });
        await window.__parishTest.access.xrBegin(stub);
      });
    }
    const face = { n: Math.PI, s: 0, e: -Math.PI / 2, w: Math.PI / 2 }[d.face] ?? 0;
    await page.evaluate(({ x, z, yaw }) => { window.__parishTest.teleport(x, z, yaw, 0.05); }, { x: d.x, z: d.z, yaw: face + Math.PI });
    await page.waitForFunction(() => window.__parishTest.np.near?.kind === "door", null, { timeout: 60000 }).catch(() => {});
    if (OUT && input === "keyboard") {
      // Step back for the entrance still: 7 m out, facing the door.
      await page.evaluate(({ x, z, f }) => { const o = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[f]; window.__parishTest.teleport(x + o[0] * 7, z + o[1] * 7, Math.atan2(o[0], o[1]), -0.05); }, { x: d.x, z: d.z, f: d.face });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: join(OUT, `${PARISH}-${kind}-entrance-day.jpg`), type: "jpeg", quality: 88 });
      await page.evaluate(({ x, z, yaw }) => { window.__parishTest.teleport(x, z, yaw, 0.05); }, { x: d.x, z: d.z, yaw: face + Math.PI });
      await page.waitForFunction(() => window.__parishTest.np.near?.kind === "door", null, { timeout: 60000 }).catch(() => {});
    }
    await press(input);
    await page.waitForFunction(() => window.__parishTest.interiors.mount.inside(), null, { timeout: 20000 }).catch(() => {});
    const inside = await page.evaluate(() => { const m = window.__parishTest.interiors.mount; return { inside: m.inside(), room: m.room?.id, zone: document.getElementById("hud-zone").textContent, pads: m.room?.actions.filter((a) => a.kind === "station").length, agents: m.room?.agentSpots?.length }; });
    if (OUT && inside.inside) {
      await page.waitForTimeout(2500);
      await page.screenshot({ path: join(OUT, `${PARISH}-${inside.room}-inside.jpg`), type: "jpeg", quality: 88 });
    }
    await page.evaluate(() => { const m = window.__parishTest.interiors.mount; m.pose.x = m.room.door.x; m.pose.z = m.room.door.z; });
    await press(input);
    await page.waitForFunction(() => !window.__parishTest.interiors.mount.inside(), null, { timeout: 20000 }).catch(() => {});
    const out = await page.evaluate(() => ({ inside: window.__parishTest.interiors.mount.inside(), zone: document.getElementById("hud-zone").textContent, x: window.__parishTest.np.x, z: window.__parishTest.np.z }));
    const good = inside.inside && inside.room === kinds[kind] && !out.inside && Math.abs(out.x - d.x) < 1e-6 && Math.abs(out.z - d.z) < 1e-6;
    if (good) inputsOk++;
    line(good, `${input}: in at ${d.id} -> ${inside.room} (HUD "${inside.zone}", ${inside.pads} pads, ${inside.agents} agent spots), out to the door spot (HUD "${out.zone}")`);
    if (input === "headset") await page.evaluate(() => window.__parishTest.access.xrEnd());
  }
  line(inputsOk === 4, `in and out by all four inputs: ${inputsOk} of 4`);
  line(errors.length === 0, `page errors ${errors.length}${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
} catch (e) {
  line(false, `drive: ${String(e.message).split("\n")[0]}`);
} finally { await browser.close(); server.close(); }
console.log(`${bad ? "FAIL" : "PASS"} drive_acc: ${ok} ok, ${bad} failed, external requests ${external}, ${Math.round((Date.now() - t0) / 1000)} s`);
process.exit(bad ? 1 : 0);
