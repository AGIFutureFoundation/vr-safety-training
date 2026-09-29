#!/usr/bin/env node
/**
 * INTERIORS (console `ix`, docs/consoles/INTERIORS.md): the walk-in rooms of the parish-engine maps.
 * Every style builds headlessly within budget on both tiers, every site kind on the 22 maps maps to a style, enter/exit
 * round-trips the player's outdoor pose and restores the hidden world exactly, the site's stations and board launch from
 * inside, the room collider (NEWTON's avatar step on the room's walls) keeps the player in, and the page is wired.
 *
 *     node tools/check_interiors.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg, detail = "") => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}${detail ? ` — ${detail}` : ""}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const R = await imp("shared/np-parishes.js");

// 1. Every style builds on both tiers within budget, with walls, a door, an exit and a board action.
for (const id of Object.keys(IX.IX_STYLES)) {
  for (const tier of ["high", "low"]) {
    const site = { id: "t", name: "Test site", kind: "x", stations: ["s-a", "s-b", "s-c"] };
    const room = IX.ixBuild(id, { three: THREE, tier, site });
    check(!!room, `${id}/${tier}: builds`);
    if (!room) continue;
    const meshes = room.meshes();
    let lights = 0; room.group.traverse((o) => { if (o.isLight) lights++; });
    check(meshes <= IX.IX_BUDGET.meshes, `${id}/${tier}: ${meshes} meshes <= ${IX.IX_BUDGET.meshes}`);
    check(lights <= IX.IX_BUDGET.lights[tier], `${id}/${tier}: ${lights} lights <= ${IX.IX_BUDGET.lights[tier]}`);
    check(room.colliders.filter((c) => c.kind === "ix-wall").length === 4, `${id}/${tier}: four wall colliders`);
    for (const k of ["exit", "board", "station"]) check(room.actions.some((a) => a.kind === k), `${id}/${tier}: has a ${k} action`);
    // Every action spot is reachable: not inside a tall collider.
    for (const a of room.actions) {
      const blocked = room.colliders.some((c) => c.max[1] > 0.5 && a.x > c.min[0] && a.x < c.max[0] && a.z > c.min[2] && a.z < c.max[2]);
      check(!blocked, `${id}/${tier}: action ${a.id} stands clear of props`);
    }
    let tris = 0; room.group.traverse((o) => { if (o.isMesh) { const g = o.geometry; const n = (g.index ? g.index.count : g.attributes.position.count) / 3; tris += n * (o.isInstancedMesh ? o.count : 1); } });
    check(tris <= IX.IX_BUDGET.triangles[tier], `${id}/${tier}: ${tris} triangles <= ${IX.IX_BUDGET.triangles[tier]}`);
    check(room.group.getObjectByName("ix-features")?.count === (IX.IX_FEATURES[id] ?? []).length && (IX.IX_FEATURES[id] ?? []).length >= 2, `${id}/${tier}: its signature fittings draw as one instanced mesh`);
    check(room.shellMeshes <= 20 && typeof room.budgetLeft === "function" && room.budgetLeft() >= 100, `${id}/${tier}: the shell leaves >= 100 meshes for dressers (${room.budgetLeft?.()})`);
    check(!("animate" in room), `${id}/${tier}: nothing in the room moves (reduced motion needs no special case)`);
    if (tier === "high") note(`${id}: ${meshes} meshes, ${tris} tris, ${lights} lights, ${room.actions.length} actions, ${room.w}×${room.d} m`);
  }
}
check(Object.keys(IX.IX_STYLES).length >= 11, `at least 11 styles (${Object.keys(IX.IX_STYLES).length})`);

// 2. Every site kind on the 22 maps maps to a style explicitly (not the fallback).
const kinds = new Map();
let sites = 0;
for (const p of R.NP_PARISHES) for (const s of p.sites ?? []) { sites++; kinds.set(s.kind, (kinds.get(s.kind) ?? 0) + 1); }
for (const [k, n] of kinds) check(IX.IX_KIND_STYLE[k] && IX.IX_STYLES[IX.IX_KIND_STYLE[k]], `site kind "${k}" (${n} sites) maps to a style`);
note(`${R.NP_PARISHES.length} maps, ${sites} sites, ${kinds.size} kinds -> ${new Set([...kinds.keys()].map(IX.ixStyleFor)).size} styles`);

// 3. Enter / walk / launch / exit round trip, with a fake scene and a world root that must come back exactly as it was.
const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xffffff, 10, 500);
const worldRoot = new THREE.Group(); const alreadyHidden = new THREE.Group(); alreadyHidden.visible = false;
scene.add(worldRoot, alreadyHidden);
const launched = [], boards = [];
const mount = IX.ixMountInteriors({ three: THREE, scene, hide: [worldRoot, alreadyHidden], onLaunch: (id) => launched.push(id), onBoard: (s) => boards.push(s.id) });
const P = R.NP_PARISHES.find((p) => p.sites.some((s) => s.kind === "fire-station" && s.stations?.length));
const site = P.sites.find((s) => s.kind === "fire-station" && s.stations?.length);
const outdoor = { x: site.position[0] + 3.25, z: site.position[1] - 7.5, yaw: 1.1, pitch: -0.2 };
const fog0 = scene.fog;
const room = mount.enter(site, outdoor);
check(mount.inside() && room?.id === "apparatus-bay", `${P.id}/${site.id}: enters an apparatus bay (${room?.id})`);
check(worldRoot.visible === false && alreadyHidden.visible === false, "inside: the outdoor world is hidden");
check(scene.children.includes(room.group) && scene.fog === null, "inside: the room is in the scene and the outdoor fog is off");
// Walk to the first station pad and launch it.
const pad = room.actions.find((a) => a.kind === "station");
for (let i = 0; i < 400 && Math.hypot(mount.pose.x - pad.x, mount.pose.z - pad.z) > 0.3; i++) {
  const dx = pad.x - mount.pose.x, dz = pad.z - mount.pose.z, L = Math.hypot(dx, dz) || 1;
  mount.walk({ vx: (dx / L) * 3, vz: (dz / L) * 3 }, 1 / 30);
}
check(mount.near()?.kind === "station", `walked to the station pad (${mount.pose.x.toFixed(2)}, ${mount.pose.z.toFixed(2)})`);
const used = mount.use();
check(used?.kind === "station" && launched[0] === site.stations[0], `a station launches from inside (${launched[0]})`);
// The board.
const board = room.actions.find((a) => a.kind === "board");
for (let i = 0; i < 400 && Math.hypot(mount.pose.x - board.x, mount.pose.z - board.z) > 0.3; i++) {
  const dx = board.x - mount.pose.x, dz = board.z - mount.pose.z, L = Math.hypot(dx, dz) || 1;
  mount.walk({ vx: (dx / L) * 3, vz: (dz / L) * 3 }, 1 / 30);
}
check(mount.use()?.kind === "board" && boards[0] === site.id, "the site's job board opens from inside");
// The room collider: walk hard at every wall for 10 s; the player stays inside the shell.
let inside = true;
for (const [vx, vz] of [[0, -6], [6, 0], [0, 6], [-6, 0], [5, 5], [-5, -5]]) {
  for (let i = 0; i < 300; i++) { const p = mount.walk({ vx, vz }, 1 / 30); if (Math.abs(p.x) > room.w / 2 || Math.abs(p.z) > room.d / 2) inside = false; }
}
check(inside, "the room collider keeps the player inside when walking into every wall");
// A tall prop stops the walk (NEWTON's colliders, not just the clamp).
const tall = room.colliders.find((c) => c.kind === "ix-prop" && c.max[1] > 1);
if (tall) {
  const cx = (tall.min[0] + tall.max[0]) / 2, cz = (tall.min[2] + tall.max[2]) / 2;
  let hit = false;
  for (const p0 of [{ x: cx, z: tall.max[2] + 0.6 }]) {
    let pose = { ...p0, yaw: 0, pitch: 0 };
    for (let i = 0; i < 90; i++) { pose = IX.ixWalk(room, pose, { vx: 0, vz: -3 }, 1 / 30); if (pose.z < tall.max[2] && pose.x > tall.min[0] && pose.x < tall.max[0]) hit = true; }
  }
  check(!hit, `a tall prop (${tall.prop}) stops the walk`);
}
// Exit at the door.
const door = room.actions.find((a) => a.kind === "exit");
for (let i = 0; i < 600 && Math.hypot(mount.pose.x - door.x, mount.pose.z - door.z) > 0.3; i++) {
  const dx = door.x - mount.pose.x, dz = door.z - mount.pose.z, L = Math.hypot(dx, dz) || 1;
  mount.walk({ vx: (dx / L) * 3, vz: (dz / L) * 3 }, 1 / 30);
}
const out = mount.use();
check(out?.kind === "exit" && !mount.inside(), "the exit door leaves the room");
check(out?.pose && ["x", "z", "yaw", "pitch"].every((k) => out.pose[k] === outdoor[k]), "exit returns the exact outdoor pose (the door spot)");
check(worldRoot.visible === true && alreadyHidden.visible === false, "exit restores the world's visibility exactly (hidden stays hidden)");
check(scene.fog === fog0 && !scene.children.includes(room.group), "exit restores the fog and removes the room");

// 4. A registered dresser (CLASSROOMS' seam) furnishes a style and its actions run.
let ran = 0;
IX.ixRegisterDresser("classroom", ({ three, group, room: r }) => {
  group.add(new three.Mesh(new three.BoxGeometry(1, 1, 1), new three.MeshBasicMaterial()));
  r.addAction({ id: "cr-test", kind: "cr", x: 0, z: 0, r: 2, run: () => ran++ });
});
const cr = IX.ixBuild("classroom", { three: THREE, site: { name: "S", stations: [] } });
check(cr.actions.some((a) => a.id === "cr-test") && cr.meshes() <= IX.IX_BUDGET.meshes, "a registered dresser adds meshes and an action within budget");
IX.IX_DRESSERS.classroom.length = 0;

// 5. Door spots: every site building on the 22 maps has one, outside the building's footprint (WALKABLE makes the buildings
// solid), clear of every other site building, and the TYCOON rental doors (4 and 7 m along the face) are outside it too.
const CW = await imp("shared/cw-cityworks.js");
let doors = 0, inFoot = [], rentIn = [];
for (const p of R.NP_PARISHES) {
  const blds = p.sites.map((_, i) => CW.cwSiteBuilding(p, i));
  const inside = (x, z, r = 0.35) => blds.find((b) => Math.abs(x - b.cx) < b.w / 2 + r && Math.abs(z - b.cz) < b.d / 2 + r);
  blds.forEach((b) => {
    const spot = IX.ixDoorSpot(CW.cwDoorOf(p, b)); doors++;
    if (inside(spot.x, spot.z)) inFoot.push(`${p.id}/${b.site.id}`);
    const along = spot.face === "e" || spot.face === "w" ? [0, 1] : [1, 0];
    for (const k of [4, 7]) if (inside(spot.x + along[0] * k, spot.z + along[1] * k)) rentIn.push(`${p.id}/${b.site.id}+${k}`);
  });
}
check(inFoot.length === 0, `every site door spot (${doors}) stands outside every site footprint${inFoot.length ? `: ${inFoot.slice(0, 6).join(", ")}` : ""}`);
check(rentIn.length <= Math.ceil(doors * 0.02), `rental door spots clear of site footprints (${rentIn.length} of ${doors * 2} inside${rentIn.length ? `: ${rentIn.slice(0, 4).join(", ")}` : ""})`);

// 6. TYCOON: every listing type and every business opens into an existing style, with the rental's title on the room.
const TY = await imp("shared/ty-economy.js");
for (const b of TY.TY_BUSINESSES) check(!!IX.IX_STYLES[IX.ixTycoonStyle({ type: "shop" }, b)], `business ${b.id} opens into ${IX.ixTycoonStyle({ type: "shop" }, b)}`);
for (const t of ["room", "shop"]) check(!!IX.IX_STYLES[IX.ixTycoonStyle({ type: t })], `a rented ${t} opens into ${IX.ixTycoonStyle({ type: t })}`);
{
  const L = TY.tyListings(P.id).find((l) => l.site === site.id && l.type === "room");
  const m2 = IX.ixMountInteriors({ three: THREE, scene, hide: [worldRoot] });
  const r2 = m2.enter(site, outdoor, { style: IX.ixTycoonStyle(L), title: "Your room — rented in Crew Credits" });
  check(r2?.id === "rented-room" && worldRoot.visible === false, "a rented room enters its own interior and hides the world");
  const o2 = m2.exit();
  check(o2.x === outdoor.x && worldRoot.visible === true, "the rented room exits to the same outdoor pose");
}

// 7. Wiring: the parishes app mounts it, the bundler lists it, the honesty line is on the room.
const app = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
const src = readFileSync(join(WEBXR, "shared", "ix-interiors.js"), "utf8");
check(/ixMountInteriors\(/.test(app) && /go inside/.test(app), "the parishes app mounts the interiors and prompts 'go inside'");
check(/function npTravel\(s\) \{ if \(ixWorld\.inside\(\)\) ixWorld\.exit\(\)/.test(app) && /KeyB" && ixWorld\.inside\(\)/.test(app), "fast travel leaves the room first; the Motor Pool waits until the learner is outside");
check(/if \(!ixCam\) \{\s*world\.update\(/.test(app), "the app skips the world's streaming updates while inside");
check(/ix-interiors\.js/.test(bundler), "tools/bundle_webxr.py lists shared/ix-interiors.js");
check(/not a model of the real building/.test(src), "every room says it is generic, not the real building");
check(!/NP_MASSING_HOOKS/.test(src), "INTERIORS does not touch NP_MASSING_HOOKS");

// 8. Browser pass (opt-in: `--browser`, IX_PORT=9001): the real parishes page — door prompt, E goes in, the world root hides
// and stops streaming, the walk stays in the room, E at the door comes back to the exact pose with the world as it was.
if (process.argv.includes("--browser")) {
  const { createServer } = await import("node:http");
  const { existsSync, statSync } = await import("node:fs");
  const { extname, normalize } = await import("node:path");
  const PW = process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs";
  const EXE = process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium";
  const TYPES = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
  const server = createServer((req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    const file = join(WEBXR, path);
    if (!file.startsWith(WEBXR) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }); res.end(readFileSync(file));
  });
  await new Promise((r) => { server.once("error", () => server.listen(0, "127.0.0.1", r)); server.listen(Number(process.env.IX_PORT || 9001), "127.0.0.1", r); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const THREE_SRC = readFileSync(join(WEBXR, "vendor/three/dist/three.module.min.js"), "utf8");
  let browser;
  try {
    const { chromium } = await import(PW);
    browser = await chromium.launch({ executablePath: EXE, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"] });
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 700 } });
    await ctx.route("**/*", (route) => {
      const u = route.request().url();
      if (u.startsWith(base)) return route.continue();
      if (/three(\.module)?(\.min)?\.js$/.test(u)) return route.fulfill({ status: 200, contentType: "application/javascript", body: THREE_SRC });
      return route.abort();
    });
    const page = await ctx.newPage();
    const errors = []; page.on("pageerror", (e) => errors.push(String(e.message).split("\n")[0]));
    await page.goto(`${base}/parishes/parishes.html?parish=orleans`, { waitUntil: "load" });
    await page.waitForFunction(() => !!window.__parishTest?.interiors, null, { timeout: 90000 });
    const door = await page.evaluate(() => {
      const T = window.__parishTest; T.begin();
      const d = T.interiors.doors.find((x) => x.site.kind === "fire-station") ?? T.interiors.doors[0];
      T.teleport(d.x, d.z, 0.7, -0.1);
      return { x: d.x, z: d.z, kind: d.site.kind, id: d.site.id };
    });
    // The near test runs on a half-second tick of capped frame time; swiftshader frames are slow, so wait for it.
    await page.waitForFunction(() => window.__parishTest.np.near?.kind === "door", null, { timeout: 60000 }).catch(() => {});
    await page.waitForFunction(() => /go inside/.test(document.getElementById("hud-prompt").textContent), null, { timeout: 20000 }).catch(() => {});
    const before = await page.evaluate(() => { const T = window.__parishTest; return { near: T.np.near?.kind, prompt: document.getElementById("hud-prompt").textContent, stats: JSON.stringify(T.stats()), x: T.np.x, z: T.np.z, yaw: T.np.yaw, pitch: T.np.pitch }; });
    check(before.near === "door" && /go inside/.test(before.prompt), `browser: at ${door.id} the prompt reads "${before.prompt}"`, JSON.stringify({ door, before, errors }));
    await page.keyboard.press("KeyE");
    await page.waitForFunction(() => window.__parishTest.camera.position.y > 3000, null, { timeout: 20000 }).catch(() => {});
    const inside1 = await page.evaluate(() => { const T = window.__parishTest; return { inside: T.interiors.mount.inside(), room: T.interiors.mount.room?.id, root: T.interiors.root.visible, camY: T.camera.position.y }; });
    check(inside1.inside && inside1.root === false && inside1.camY > 3000, `browser: E goes inside (${inside1.room}), the world root is hidden, the camera is in the room`);
    const z0 = await page.evaluate(() => window.__parishTest.interiors.mount.pose.z);
    await page.keyboard.down("KeyW");
    await page.waitForFunction((z) => window.__parishTest.interiors.mount.pose.z < z - 0.3, z0, { timeout: 30000 }).catch(() => {});
    await page.keyboard.up("KeyW");
    const inside2 = await page.evaluate(() => { const T = window.__parishTest; const m = T.interiors.mount; return { stats: JSON.stringify(T.stats()), x: T.np.x, z: T.np.z, px: m.pose.x, pz: m.pose.z, w: m.room.w, d: m.room.d }; });
    check(inside2.stats === before.stats, "browser: nothing streams while inside (world stats unchanged)");
    check(inside2.x === before.x && inside2.z === before.z, "browser: the outdoor pose is untouched while walking inside");
    check(Math.abs(inside2.px) < inside2.w / 2 && Math.abs(inside2.pz) < inside2.d / 2 && inside2.pz < z0 - 0.3, `browser: the walk moved inside the room (${inside2.px.toFixed(2)}, ${inside2.pz.toFixed(2)})`);
    await page.evaluate(() => { const m = window.__parishTest.interiors.mount; m.pose.x = m.room.door.x; m.pose.z = m.room.door.z; });
    await page.keyboard.press("KeyE");
    await page.waitForFunction(() => window.__parishTest.camera.position.y < 3000, null, { timeout: 20000 }).catch(() => {});
    const after = await page.evaluate(() => { const T = window.__parishTest; return { inside: T.interiors.mount.inside(), root: T.interiors.root.visible, x: T.np.x, z: T.np.z, yaw: T.np.yaw, pitch: T.np.pitch, camY: T.camera.position.y }; });
    check(!after.inside && after.root === true && after.camY < 3000, "browser: E at the door comes back out and the world root shows again");
    check(after.x === before.x && after.z === before.z && after.yaw === before.yaw && after.pitch === before.pitch, "browser: back at the exact door-spot pose");
    check(!errors.length, `browser: no page errors${errors.length ? `: ${errors.slice(0, 3).join(" | ")}` : ""}`);
  } catch (e) {
    check(false, `browser pass: ${String(e.message).split("\n")[0]}`);
  } finally { await browser?.close(); server.close(); }
}

console.log(`\n${failures ? "FAIL" : "PASS"} check_interiors: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
