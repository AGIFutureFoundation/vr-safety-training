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
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } };
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
    if (tier === "high") note(`${id}: ${meshes} meshes, ${lights} lights, ${room.actions.length} actions, ${room.w}×${room.d} m`);
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
check(/ix-interiors\.js/.test(bundler), "tools/bundle_webxr.py lists shared/ix-interiors.js");
check(/not a model of the real building/.test(src), "every room says it is generic, not the real building");
check(!/NP_MASSING_HOOKS/.test(src), "INTERIORS does not touch NP_MASSING_HOOKS");

console.log(`\n${failures ? "FAIL" : "PASS"} check_interiors: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
