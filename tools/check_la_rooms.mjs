#!/usr/bin/env node
/**
 * LA-ROOMS (console `lar`, docs/consoles/LA-ROOMS.md): the Louisiana walk-in rooms on INTERIORS' shell.
 *   1. coverage: all six rooms (hangar, fab shop, data hall + electrical room, control room, compressor building, craft hall)
 *      open on the Louisiana maps; every IX_SITE_STYLE id is a real Louisiana site and never a CLASSROOMS room site;
 *   2. launches: every object launches ONE real thing — a catalog station or a Louisiana programme simulation (LP_SIMS);
 *      the share that is in the Louisiana programme itself (lp-programme-data.js) is reported;
 *   3. budget: every room builds on both tiers with its dresser within IX_BUDGET (meshes, lights, triangles);
 *   4. use: every object's spot is inside the shell, clear of every tall collider, reachable from the door on a 0.2 m walk
 *      grid, and the nearest action at its spot is itself; running it launches exactly its launch;
 *   5. words: no digits or figures in labels, no partnership words, the craft hall carries the no-partnership line and its
 *      trade names are tools/unions.json abbreviations; the rooms say they are generic;
 *   6. a mount round trip: enter a room, walk to an object with ixWalk, E launches it, exit restores the world;
 *   7. wiring: the parishes app registers the dressers, the bundler lists the module.
 *
 *     node tools/check_la_rooms.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let passed = 0, failed = 0;
const check = (ok, msg) => { if (ok) passed++; else { failed++; if (failed <= 30) console.log(`  FAIL ${msg}`); } };
const note = (m) => console.log(`  · ${m}`);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const LAR = await imp("shared/lar-rooms.js");
const LP = await imp("shared/lp-programme-data.js");
const CR = await imp("shared/cr-classrooms.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity/catalog.json"), "utf8"));
const stations = new Set(catalog.stations.map((s) => s.id));
const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
const sims = new Set(LP.LP_SIMS.map((s) => s.id));
const lpStations = new Set([
  ...LP.LP_PATHWAYS.flatMap((p) => [...p.stations, ...(p.k12 ?? [])]),
  ...LP.LP_TRACKS.flatMap((t) => t.workTypes.flatMap((w) => w.stations)),
  ...LP.LP_SIMS.flatMap((s) => s.steps.map((x) => x.station)),
]);
const LA = /^(la-|lc-|br-|laf-|monroe-|hammond-|nola-)/;

// 1. coverage
const rooms = [];
for (const p of NP_PARISHES) for (const r of LAR.larRoomsFor(p)) rooms.push({ p, r });
const byStyle = {};
for (const { p, r } of rooms) (byStyle[r.style] ??= []).push(`${p.id}/${r.site}`);
for (const st of Object.keys(LAR.LAR_STYLES)) {
  check(!!IX.IX_STYLES[st] && (IX.IX_FEATURES[st] ?? []).length >= 2, `${st}: a shell style with signature fittings`);
  check((byStyle[st] ?? []).length >= 1, `${st}: opens on at least one Louisiana site`);
  note(`${st}: ${(byStyle[st] ?? []).length} sites — ${(byStyle[st] ?? []).join(", ")}`);
}
check(rooms.every(({ p }) => LA.test(p.id)), "every Louisiana room is on a Louisiana map");
const siteOf = new Map(NP_PARISHES.flatMap((p) => p.sites.map((s) => [s.id, { p, s }])));
const crSites = new Set(NP_PARISHES.flatMap((p) => CR.crRoomsFor(p).map((r) => r.site)));
for (const [id, st] of Object.entries(IX.IX_SITE_STYLE)) {
  const hit = siteOf.get(id);
  check(!!hit && LA.test(hit.p.id), `IX_SITE_STYLE ${id} is a real Louisiana site`);
  check(!!IX.IX_STYLES[st], `IX_SITE_STYLE ${id} -> ${st} is a style`);
  check(!crSites.has(id), `IX_SITE_STYLE ${id} is not a CLASSROOMS room site (no double dressing)`);
  check(hit && IX.ixStyleFor(hit.s.kind, id) === st, `ixStyleFor(kind, ${id}) opens ${st}`);
}
for (const k of ["hangar", "compressor", "wellpad"]) check(LAR.LAR_STYLES[IX.IX_KIND_STYLE[k]], `site kind ${k} opens a Louisiana room (${IX.IX_KIND_STYLE[k]})`);
check(IX.IX_KIND_STYLE.shipyard === "workshop", "shipyard (on ten other maps) keeps the generic workshop; the Saronic sites open the fab shop by site");

// 2. launches
let nLaunch = 0, nLp = 0, nSim = 0;
const kinds = new Set();
for (const { p, r } of rooms) for (const f of r.fixtures) {
  const l = f.launch, where = `${p.id}/${r.site}/${f.id}`;
  check(l && (l.type === "station" ? stations.has(l.id) : l.type === "sim" ? sims.has(l.id) : false), `${where}: launch ${l?.type} ${l?.id} resolves`);
  check(LAR.LAR_SHAPES[f.shape], `${where}: shape ${f.shape} exists`);
  nLaunch++; if (l.type === "sim") nSim++;
  if (l.type === "sim" || lpStations.has(l.id)) nLp++;
  kinds.add(`${l.type}:${l.id}`);
}
note(`launches: ${nLaunch} objects in ${rooms.length} rooms — ${nSim} programme simulations, ${nLp} in the Louisiana programme, all resolved; ${kinds.size} distinct`);
check(nLp / Math.max(1, nLaunch) >= 0.6, `most launches come from the Louisiana programme (${nLp} of ${nLaunch})`);

// 3 + 4. budget and use, per room on both tiers.
const reach = (room, from, to, r = to.r ?? 1.2) => {
  // BFS on a 0.2 m grid; a cell is free when the avatar (0.3 m radius) clears every collider taller than a step.
  const S = 0.2, R = 0.3, W = Math.round(room.w / S), D = Math.round(room.d / S);
  const tall = room.colliders.filter((c) => c.max[1] > 0.5 && c.kind !== "ix-wall");
  const free = (i, j) => { const x = -room.w / 2 + (i + 0.5) * S, z = -room.d / 2 + (j + 0.5) * S;
    if (Math.abs(x) > room.w / 2 - 0.4 || Math.abs(z) > room.d / 2 - 0.4) return false;
    return !tall.some((c) => x > c.min[0] - R && x < c.max[0] + R && z > c.min[2] - R && z < c.max[2] + R); };
  const cell = (x, z) => [Math.floor((x + room.w / 2) / S), Math.floor((z + room.d / 2) / S)];
  const [si, sj] = cell(from.x, from.z), seen = new Uint8Array(W * D), q = [[si, sj]];
  if (!free(si, sj)) return false;
  seen[sj * W + si] = 1;
  while (q.length) {
    const [i, j] = q.shift(); const x = -room.w / 2 + (i + 0.5) * S, z = -room.d / 2 + (j + 0.5) * S;
    if (Math.hypot(x - to.x, z - to.z) <= Math.min(r, 0.8)) return true;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + a, nj = j + b;
      if (ni < 0 || nj < 0 || ni >= W || nj >= D || seen[nj * W + ni] || !free(ni, nj)) continue; seen[nj * W + ni] = 1; q.push([ni, nj]); }
  }
  return false;
};
let worst = { meshes: 0, tris: 0, low: 0, id: "" }, nActs = 0;
for (const { p, r } of rooms) {
  const site = siteOf.get(r.site).s;
  for (const tier of ["high", "low"]) {
    const calls = [], dressers = {};
    const styles = LAR.larRegisterDressers({ ixRegisterDresser: (st, fn) => (dressers[st] ??= []).push(fn) }, { parish: p, launch: (l) => { calls.push(l); return true; } });
    check(styles.includes(r.style), `${r.id}: a dresser for ${r.style}`);
    const room = IX.ixBuild(r.style, { three: THREE, tier, site, dressers });
    const where = `${p.id}/${r.site} (${tier})`;
    const meshes = room.meshes();
    let lights = 0, tris = 0;
    room.group.traverse((o) => { if (o.isLight) lights++; if (o.isMesh) { const g = o.geometry; tris += ((g.index ? g.index.count : g.attributes.position.count) / 3) * (o.isInstancedMesh ? o.count : 1); } });
    check(meshes <= IX.IX_BUDGET.meshes, `${where}: ${meshes} meshes <= ${IX.IX_BUDGET.meshes}`);
    check(lights <= IX.IX_BUDGET.lights[tier], `${where}: ${lights} lights`);
    check(tris <= IX.IX_BUDGET.triangles[tier], `${where}: ${tris} triangles <= ${IX.IX_BUDGET.triangles[tier]}`);
    check(!!room.group.getObjectByName("lar-dress"), `${where}: dressed as one instanced mesh`);
    if (tier === "high" && meshes > worst.meshes) worst = { ...worst, meshes, id: r.id };
    if (tier === "high") worst.tris = Math.max(worst.tris, tris); else worst.low = Math.max(worst.low, tris);
    const mine = room.actions.filter((a) => /^lar-/.test(a.id));
    check(mine.length === r.fixtures.length, `${where}: every object registers an action (${mine.length}/${r.fixtures.length})`);
    if (tier !== "high") continue;
    nActs += mine.length;
    const start = { x: room.door.x, z: room.door.z - 0.8 };
    for (const a of mine) {
      const inShell = Math.abs(a.x) < room.w / 2 - 0.4 && Math.abs(a.z) < room.d / 2 - 0.4;
      check(inShell, `${where}/${a.id}: spot inside the shell (${a.x}, ${a.z})`);
      const blocked = room.colliders.some((c) => c.max[1] > 0.5 && a.x > c.min[0] && a.x < c.max[0] && a.z > c.min[2] && a.z < c.max[2]);
      check(!blocked, `${where}/${a.id}: spot clear of tall props`);
      check(IX.ixNear(room, a.x, a.z) === a, `${where}/${a.id}: the nearest action at its spot is itself`);
      check(reach(room, start, a), `${where}/${a.id}: reachable from the door`);
      const before = calls.length; a.run(a, room);
      const own = r.fixtures.find((f) => `lar-${f.id}` === a.id).launch;
      check(calls.length === before + 1 && calls.at(-1)?.type === own.type && calls.at(-1)?.id === own.id, `${where}/${a.id}: running it launches its own ${a.launch?.type}`);
    }
    for (const b of room.actions.filter((x) => !/^lar-/.test(x.id))) check(reach(room, start, b), `${where}: the shell's ${b.id} stays reachable`);
  }
}
note(`budget: worst room ${worst.id} ${worst.meshes} meshes; worst ${worst.tris} triangles desktop / ${worst.low} phone (caps ${IX.IX_BUDGET.meshes}; ${IX.IX_BUDGET.triangles.high} / ${IX.IX_BUDGET.triangles.low})`);
note(`use: ${nActs} object actions — every one inside, clear, nearest to its own spot, reachable from the door, launching its own thing`);

// 5. words
const PARTNER = /\bpartner(ship|ed|s)?\b|\bofficial\b|\bendorse|\bin association with\b|\bcertified by\b/i;
for (const { r } of rooms) {
  for (const f of r.fixtures) {
    check(!/\d|\$/.test(f.label), `${r.id}/${f.id}: no digits or figures in "${f.label}"`);
    check(!PARTNER.test(f.label), `${r.id}/${f.id}: no partnership words`);
  }
  if (r.style === "lar-craft-hall") check(r.note === LP.LP_NO_PARTNERSHIP, `${r.id}: carries the programme's no-partnership line`);
  else check(/not a model of the real building/.test(r.note), `${r.id}: says it is generic`);
}
for (const [id, abbrev] of Object.entries(LAR.LAR_CRAFT_NAMES)) {
  const u = unions.find((x) => x.id === id);
  check(!!u && [u.abbrev, ...(u.aliases ?? [])].includes(abbrev), `craft ${id} (${abbrev}) is a unions.json reference`);
}
for (const c of LP.LP_PATHWAYS.flatMap((p) => p.crafts.map((x) => x.union))) check(!!LAR.LAR_CRAFT_NAMES[c], `craft ${c} has a trade reference`);
const src = readFileSync(join(WEBXR, "shared/lar-rooms.js"), "utf8");
check(!/claude|opus|sonnet|haiku|gpt-/i.test(src), "no model identifier in the module");
check(!/\b\d[\d,.]*\s*(jobs|acres|billion|million|MW|GW)\b/i.test(src), "no project figure in the module");

// 6. a mount round trip on the data hall.
{
  const p = NP_PARISHES.find((x) => x.id === "la-meta-richland"), site = p.sites.find((s) => s.id === "lmr-data-hall-fitout");
  const launched = [], ran = [];
  IX.IX_DRESSERS["lar-data-hall"] = [];
  LAR.larRegisterDressers({ ixRegisterDresser: IX.ixRegisterDresser }, { parish: p, launch: (l) => { ran.push(l); return true; } });
  const scene = new THREE.Scene(), root = new THREE.Group(); scene.add(root);
  const m = IX.ixMountInteriors({ three: THREE, scene, hide: [root], onLaunch: (id) => launched.push(id) });
  const out0 = { x: 10, z: 20, yaw: 0.4, pitch: 0 };
  const room = m.enter(site, out0);
  check(room?.id === "lar-data-hall" && root.visible === false, `mount: ${site.id} enters the data hall and hides the world`);
  for (const id of ["lar-tile", "lar-eewp"]) {
    const a = room.actions.find((x) => x.id === id);
    for (let i = 0; i < 600 && Math.hypot(m.pose.x - a.x, m.pose.z - a.z) > 0.25; i++) {
      const dx = a.x - m.pose.x, dz = a.z - m.pose.z, L = Math.hypot(dx, dz) || 1;
      m.walk({ vx: (dx / L) * 3, vz: (dz / L) * 3 }, 1 / 30);
    }
    const u = m.use();
    check(m.near()?.id === id && u, `mount: walked to ${id} and E used it (${u?.kind})`);
  }
  check(launched[0] === "ws-raised-floor-tile-lift-and-cable-tray-safety", `mount: the tile lifter launches its station (${launched[0]})`);
  check(ran.some((l) => l.type === "sim" && l.id === "lp-sim-data-hall-energised-work"), "mount: the permit kiosk opens the energised-work simulation");
  const d = room.actions.find((x) => x.kind === "exit"); m.pose.x = d.x; m.pose.z = d.z;
  const back = m.use();
  check(back?.kind === "exit" && back.pose.x === out0.x && root.visible === true, "mount: exit returns the outdoor pose and the world");
  IX.IX_DRESSERS["lar-data-hall"] = [];
}

// 7. wiring
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/larRegisterDressers\(/.test(app) && /lar-rooms\.js/.test(app), "the parishes app registers the Louisiana dressers");
check(/lar-rooms\.js/.test(bundler), "tools/bundle_webxr.py lists shared/lar-rooms.js");

console.log(`check_la_rooms: ${failed ? "FAIL" : "ok"} — ${passed} passed, ${failed} failed · ${Date.now() - T0} ms`);
process.exit(failed ? 1 : 0);
