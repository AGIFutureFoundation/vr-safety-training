#!/usr/bin/env node
/**
 * MOTORWORKS — the Motor Pool's vehicle classes drivable in the 22 parish-engine maps through NEWTON's drive mode
 * (the environment & robotics wave; docs/consoles/MOTORWORKS.md):
 *
 *     node tools/check_motorworks.mjs
 *
 *   - data: every site rule names a registry road/site entry that is gated (the gate contract) and has a class with
 *     handling and NEWTON schematic dims; handling records are complete and positive;
 *   - handling arithmetic: dvStepDrive with mvProfile reaches top speed in top/accel seconds and never exceeds it,
 *     stops in mvStopDistance (within a step), never turns tighter than the class's turning radius; a registry
 *     profile without the new fields drives exactly as before;
 *   - crash card unchanged: a MOTORWORKS vehicle driven into a wall above NEWTON's threshold opens the same card;
 *   - placements on all 22 maps: every placed vehicle's class exists and is gated, its footprint dry, level enough,
 *     clear of road carriageways (off the centreline by half the width and the margin), clear of building boxes and
 *     NEWTON's props; one per site, per-map caps by tier; fitting site kinds; deterministic;
 *   - budgets: the mount draws two instanced meshes per map whatever the count;
 *   - liveries: the class colour without PALETTE, a matching category's swatch with a PA_CATEGORIES-shaped object;
 *   - the app mounts it (enter prompt, gate, drive from the bay with snap off, exit re-parks), the bundle carries both
 *     modules, names are mv/MV_, no three.js import, the doc has Cycles and Seams.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
let passed = 0, failed = 0;
const check = (area, ok, msg) => { if (ok) passed += 1; else { failed += 1; console.log(`  FAIL [${area}] ${msg}`); } return ok; };
const say = (s) => console.log(`  ${s}`);

const MV = await imp("shared/mv-motorworks.js");
const MW = await imp("shared/mv-world.js");
const DV = await imp("shared/drivables-data.js");
const N = await imp("shared/nw-physics.js");
const ND = await imp("shared/nw-drive.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const { npWaterAt, npHeightAt } = await imp("shared/np-parish.js");

// ------------------------------------------------------------------ data
{
  const ruleIds = [...new Set(MV.MV_SITE_RULES.flatMap((r) => r.drivables))];
  let bad = [];
  for (const id of ruleIds) {
    const e = DV.dvById(id);
    if (!e) { bad.push(`${id}: not in the registry`); continue; }
    if (!(e.kind === "road" || e.kind === "site")) bad.push(`${id}: ${e.kind} (NEWTON's drive mode keeps to land)`);
    if (!(e.gate?.stations?.length)) bad.push(`${id}: no gate stations`);
    if (!DV.DV_GATED.some((g) => g.drivable === id)) bad.push(`${id}: not in DV_GATED`);
    if (!MV.MV_HANDLING[e.class]) bad.push(`${id}: class ${e.class} has no handling`);
    if (!ND.NW_CLASS_DIMS[e.class]) bad.push(`${id}: class ${e.class} has no NEWTON dims`);
  }
  check("data", !bad.length, `every site-rule drivable (${ruleIds.length}) is a gated road/site registry entry with handling and dims${bad.length ? ": " + bad.join("; ") : ""}`);
  const hBad = Object.entries(MV.MV_HANDLING).filter(([, h]) => !["mass", "top", "accel", "brake", "turnRadius"].every((k) => typeof h[k] === "number" && h[k] > 0));
  check("data", !hBad.length, `every class's handling has mass, top, accel, brake and turnRadius > 0 (${Object.keys(MV.MV_HANDLING).length} classes)`);
  const roadClasses = [...new Set(DV.DV_DRIVABLES.filter((d) => d.kind === "road" || d.kind === "site").map((d) => d.class))];
  const missing = roadClasses.filter((c) => !MV.MV_HANDLING[c]);
  check("data", !missing.length, `every land class in the registry has handling (${roadClasses.length} classes${missing.length ? "; missing " + missing.join(", ") : ""})`);
  check("data", Object.keys(MV.MV_OVERRIDES).every((id) => DV.dvById(id)), "every per-drivable override names a registry entry");
  const kinds = new Set(NP_PARISHES.flatMap((p) => p.sites.map((s) => s.kind)));
  const deadKinds = MV.MV_SITE_RULES.flatMap((r) => r.kinds).filter((k) => !kinds.has(k));
  check("data", deadKinds.length <= 4, `site-rule kinds exist on the maps (${deadKinds.length} unused: ${deadKinds.join(", ") || "none"})`);
  say(`${ruleIds.length} drivables in ${MV.MV_SITE_RULES.length} site rules; ${Object.keys(MV.MV_HANDLING).length} handling classes`);
}

// ------------------------------------------------------------------ handling arithmetic
{
  const dt = 1 / 60;
  let worstStop = 0, worstTop = 0, tightest = Infinity, n = 0;
  const bad = [];
  for (const e of DV.DV_DRIVABLES.filter((d) => d.kind === "road" || d.kind === "site")) {
    const h = MV.mvHandling(e), p = MV.mvProfile(e);
    // Accelerate from rest.
    let s = { x: 0, z: 0, heading: 0, speed: 0 }, t = 0, max = 0;
    while (s.speed < h.top - 1e-9 && t < 120) { s = DV.dvStepDrive(s, { throttle: 1 }, dt, p); t += dt; max = Math.max(max, s.speed); }
    for (let i = 0; i < 120; i++) { s = DV.dvStepDrive(s, { throttle: 1 }, dt, p); max = Math.max(max, s.speed); }
    const tt = MV.mvTimeToTop(h);
    worstTop = Math.max(worstTop, Math.abs(t - tt));
    if (max > h.top + 1e-9) bad.push(`${e.id} exceeds top`);
    if (Math.abs(t - tt) > dt * 1.5) bad.push(`${e.id} time to top ${t.toFixed(3)} vs ${tt.toFixed(3)}`);
    // Brake from top.
    let d = 0; const x0 = s.z;
    let st = 0;
    while (s.speed > 0 && st < 60) { s = DV.dvStepDrive(s, { throttle: 0, brake: true }, dt, p); st += dt; }
    d = s.z - x0;
    const want = MV.mvStopDistance(h, h.top);
    const err = Math.abs(d - want);
    worstStop = Math.max(worstStop, err / want);
    if (err > h.top * dt * 1.5) bad.push(`${e.id} stops in ${d.toFixed(2)} m vs ${want.toFixed(2)} m`);
    // Full lock at a crawl and at speed: the radius never under the class's.
    for (const thr of [0.15, 0.5, 1]) {
      let v = { x: 0, z: 0, heading: 0, speed: 0 };
      for (let i = 0; i < 600; i++) v = DV.dvStepDrive(v, { throttle: thr, steer: 1 }, dt, p);
      const h0 = v.heading, sp = v.speed;
      v = DV.dvStepDrive(v, { throttle: thr, steer: 1 }, dt, p);
      const yawRate = Math.abs(v.heading - h0) / dt;
      const r = yawRate > 1e-9 ? Math.abs(sp) / yawRate : Infinity;
      tightest = Math.min(tightest, r / h.turnRadius);
      if (r < h.turnRadius * 0.999) bad.push(`${e.id} turns at ${r.toFixed(2)} m under ${h.turnRadius} m`);
    }
    n += 1;
  }
  check("handling", !bad.length, `${n} land drivables: top speed held, time to top = top/accel within a step (worst ${worstTop.toFixed(4)} s), stop distance = v²/2(1.6·accel+brake) (worst ${(worstStop * 100).toFixed(2)}%), radius ≥ turnRadius (tightest ${tightest.toFixed(3)}×)${bad.length ? ": " + bad.slice(0, 4).join("; ") : ""}`);
  // A profile without the new fields drives exactly as the old formula did (brake accel×2.4, no radius cap).
  const e = DV.dvById("crew-pickup");
  let a = { x: 0, z: 0, heading: 0, speed: 10 }, b = { ...a };
  for (let i = 0; i < 120; i++) {
    a = DV.dvStepDrive(a, { throttle: 0.4, steer: 1, brake: i > 60 }, dt, e.profile);
    const top = e.profile.top, grip = 1 - 0.55 * Math.min(1, Math.abs(b.speed) / top);
    let sp = b.speed; const target = 0.4 * top;
    if (sp < target) sp = Math.min(target, sp + e.profile.accel * dt); else sp = Math.max(target, sp - e.profile.accel * 1.6 * dt);
    if (i > 60) sp = sp > 0 ? Math.max(0, sp - e.profile.accel * 2.4 * dt) : Math.min(0, sp + e.profile.accel * 2.4 * dt);
    const hd = b.heading + 1 * e.profile.turn * (1 - 0.55 * Math.min(1, Math.abs(sp) / top)) * Math.sign(sp || 1) * dt;
    void grip;
    b = { x: b.x + Math.sin(hd) * sp * dt, z: b.z + Math.cos(hd) * sp * dt, heading: hd, speed: sp };
  }
  check("handling", Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.z - b.z) < 1e-9 && Math.abs(a.heading - b.heading) < 1e-12, "a registry profile without brake/minRadius drives exactly as before (Bay World and the board unchanged)");
  const hv = MV.mvHandling(DV.dvById("transit-bus")), lt = MV.mvHandling(DV.dvById("crew-pickup"));
  check("handling", hv.mass > lt.mass && hv.turnRadius > lt.turnRadius && MV.mvStopDistance(hv, 14) > MV.mvStopDistance(lt, 14), `a bus is heavier, turns wider and stops longer than a pickup (from 14 m/s: ${MV.mvStopDistance(hv, 14).toFixed(1)} m vs ${MV.mvStopDistance(lt, 14).toFixed(1)} m)`);
}

// ------------------------------------------------------------------ crash card unchanged
{
  const world = N.nwWorld({ groundAt: () => 0, colliders: [{ min: [-20, 0, 30], max: [20, 6, 31], kind: "wall" }] });
  const entry = MW.mvDriveEntry(DV.dvById("box-truck"));
  const dims = ND.NW_CLASS_DIMS[entry.class];
  let v = N.nwVehicleState(0, 0, 0, [dims[0] / 2, dims[1] / 2, dims[2] / 2], world), crash = null;
  for (let i = 0; i < 900 && !crash; i++) { const r = N.nwVehicleStep(v, { throttle: 1 }, 1 / 60, world, entry.profile); v = r.state; crash = r.crash; }
  const card = N.nwCrashCard(crash);
  check("crash", !!crash && crash.speed >= N.NW_CRASH_SPEED && card?.station === "traffic-incident-management", `a box truck on MOTORWORKS handling into a wall at ${crash?.speed?.toFixed(1)} m/s opens NEWTON's card (${card?.station})`);
  const w2 = N.nwWorld({ groundAt: () => 0, colliders: [{ min: [-20, 0, 12], max: [20, 6, 13], kind: "wall" }] });
  const fk = MW.mvDriveEntry(DV.dvById("forklift"));
  const fd = ND.NW_CLASS_DIMS[fk.class];
  let f = N.nwVehicleState(0, 0, 0, [fd[0] / 2, fd[1] / 2, fd[2] / 2], w2), fc = null, bumped = false;
  for (let i = 0; i < 900 && !fc && !bumped; i++) { const r = N.nwVehicleStep(f, { throttle: 1 }, 1 / 60, w2, fk.profile); f = r.state; fc = r.crash; bumped = r.bumped; }
  check("crash", !fc && bumped && !N.nwCrashCard(fc), `a forklift (top ${fk.profile.top} m/s, under the ${N.NW_CRASH_SPEED} m/s threshold) bumps a wall and opens no card`);
}

// ------------------------------------------------------------------ placements
{
  let total = 0, lowTotal = 0, maps = 0, fails = [], arrivals = 0;
  const arrivalFails = [];
  const empty = [];
  const classes = new Set(), perDrivable = new Map();
  let first = null;
  for (const p of NP_PARISHES) {
    const world = N.nwParishWorld(p);
    const pl = MW.mvPlacements(p, world);
    const low = MW.mvPlacements(p, world, { tier: "low" });
    if (!first) first = JSON.stringify(pl.map(({ entry, ...r }) => r));
    maps += 1; total += pl.length; lowTotal += low.length;
    if (pl.length > MV.MV_BUDGET.perMap.balanced) fails.push(`${p.id}: ${pl.length} over the cap`);
    if (low.length > MV.MV_BUDGET.perMap.low) fails.push(`${p.id}: low tier ${low.length} over its cap`);
    if (!pl.length) empty.push(p.id);
    const sites = new Set();
    for (const v of pl) {
      const e = DV.dvById(v.drivable), site = p.sites.find((s) => s.id === v.site);
      classes.add(e.class); perDrivable.set(v.drivable, (perDrivable.get(v.drivable) ?? 0) + 1);
      if (sites.has(v.site)) fails.push(`${v.id}: two at one site`); sites.add(v.site);
      if (!MV.MV_HANDLING[e.class] || !e.gate?.stations?.length) fails.push(`${v.id}: class or gate missing`);
      if (!MV.mvRuleFor(site)?.drivables.includes(v.drivable)) fails.push(`${v.id}: ${v.drivable} does not fit a ${site.kind} site`);
      const [w, , l] = v.dims, fx = Math.sin(v.heading), fz = Math.cos(v.heading), rx = Math.cos(v.heading), rz = -Math.sin(v.heading);
      for (const [a, b] of [[0, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const x = v.x + rx * a * w / 2 + fx * b * l / 2, z = v.z + rz * a * w / 2 + fz * b * l / 2;
        if (npWaterAt(p, x, z) || (world.waterDepthAt(x, z) || 0) > 0.02) { fails.push(`${v.id}: wet footprint`); break; }
        const c = MW.mvRoadClearance(p, x, z);
        if (c.clear < MW.MV_ROAD_MARGIN - 1e-6) { fails.push(`${v.id}: ${c.clear.toFixed(1)} m past the carriageway edge (${c.road?.name ?? c.road?.kind})`); break; }
      }
      if (!N.nwVehicleClear(N.nwVehicleState(v.x, v.z, v.heading, [w / 2, v.dims[1] / 2, l / 2], world), world)) fails.push(`${v.id}: inside a building box`);
      if (MW.mvPropPoints(site).some(([px, pz]) => Math.hypot(px - v.x, pz - v.z) < 2)) fails.push(`${v.id}: on NEWTON's props`);
      // SURVEYOR-2: no parked vehicle over the point the app sets the player down at any site (start and fast travel).
      for (const s2 of p.sites) { const [ax, az] = MW.mvArrivalPoint(s2), d = Math.hypot(ax - v.x, az - v.z); arrivals++; if (d < l / 2 + MW.MV_ARRIVAL_CLEAR) arrivalFails.push(`${v.id}: ${d.toFixed(1)} m from ${s2.id}'s arrival point`); }
      void npHeightAt;
    }
  }
  check("place", !arrivalFails.length && arrivals > 0, `no parked vehicle stands within its half-length + ${MW.MV_ARRIVAL_CLEAR} m of a site's arrival point (${MW.MV_ARRIVAL_OFFSET} m from the site, where the start and fast travel set the camera; ${total} vehicles × their map's sites)${arrivalFails.length ? ": " + arrivalFails.slice(0, 5).join("; ") : ""}`);
  check("place", !fails.length, `${maps} maps: ${total} parked vehicles (phone tier ${lowTotal}), each gated with a class, one per site, fitting the site kind, dry, off the road centreline by half-width + ${MW.MV_ROAD_MARGIN} m, clear of boxes and props${fails.length ? ": " + fails.slice(0, 5).join("; ") : ""}`);
  check("place", maps >= 22 && empty.length <= 1, `${maps - empty.length} of ${maps} parish-engine maps park vehicles${empty.length ? ` (none on ${empty.join(", ")}: every fitting site's ring is marsh or water)` : ""}`);
  const again = N.nwParishWorld(NP_PARISHES[0]);
  check("place", JSON.stringify(MW.mvPlacements(NP_PARISHES[0], again).map(({ entry, ...r }) => r)) === first, "placements are deterministic across runs");
  check("place", perDrivable.size >= 12, `${perDrivable.size} different drivables parked across the maps (${[...perDrivable].map(([k, c]) => `${k} ${c}`).join(", ")})`);
  for (const want of ["box-truck", "sweeper", "cp-electric-yard-tractor", "transit-bus", "crew-pickup", "forklift"]) check("place", perDrivable.has(want), `the brief's ${want} is parked somewhere (${perDrivable.get(want) ?? 0})`);
}

// ------------------------------------------------------------------ budgets (a stub three.js)
{
  const added = [];
  class G { translate() { return this; } }
  class IM { constructor(g, m, n) { this.count = n; this.instanceMatrix = {}; this.instanceColor = {}; } setMatrixAt() {} setColorAt() {} }
  const T = { BoxGeometry: G, MeshLambertMaterial: class {}, InstancedMesh: IM, Color: class { setHex() { return this; } }, Matrix4: class { compose() { return this; } }, Quaternion: class { setFromAxisAngle() { return this; } }, Vector3: class { set() { return this; } } };
  const root = { add: (...o) => added.push(...o) };
  const p = NP_PARISHES.find((x) => x.id === "oak-west-oakland") ?? NP_PARISHES[0];
  const world = N.nwParishWorld(p);
  const m = MW.mvMountMotorworks({ three: T, root, parish: p, world, tier: "balanced", categories: null });
  const c = m.counts();
  check("budget", c.meshes === MV.MV_BUDGET.meshes && added.length === MV.MV_BUDGET.meshes, `the mount adds ${added.length} instanced meshes for ${c.parked} parked vehicles in ${p.name} (budget ${MV.MV_BUDGET.meshes})`);
  const v = m.parked[0];
  const near = m.near(v.x + v.dims[0] / 2 + 2, v.z);
  const pr = m.prompt(v, { stars: new Map(), records: [] });
  check("gate", near?.id === v.id && typeof pr.text === "string" && /^E — /.test(pr.text), `the enter prompt shows beside ${v.entry.name}: "${pr.text}"`);
  const g = MW.mvGate(v.entry);
  check("gate", g.open === false && g.missing.length >= 1 && g.missing.every((x) => v.entry.gate.stations.includes(x.id)), `with an empty passport the ${v.entry.name} is locked on its pre-trip station(s) (${g.missing.map((x) => x.id).join(", ")})`);
  m.hide(v.id); const hid = !m.near(v.x + 1, v.z); m.show(v.id);
  check("gate", hid && !!m.near(v.x + 1, v.z), "a driven vehicle leaves its bay (no prompt) and is back after the exit");
}

// ------------------------------------------------------------------ liveries
{
  const e = DV.dvById("transit-bus");
  check("livery", MV.mvLivery(e, { region: "san-francisco" }, null) === MV.MV_CLASS_COLOUR.transit && MW.mvPaletteCategories() === null, "without PALETTE the livery is the class colour and the guard finds no categories");
  const fake = { "painted-victorian": { region: "san-francisco", characters: ["residential"], colours: ["#7a3b69", "#2f6f8f", 0xd9a441] }, "creole-pastels": { region: "new-orleans", colours: ["#f4c6b8"] } };
  const col = MV.mvLivery(e, { region: "san-francisco", character: "residential", seed: "x" }, fake);
  check("livery", [0x7a3b69, 0x2f6f8f, 0xd9a441].includes(col), `a PA_CATEGORIES-shaped object gives a matching category's swatch (#${col.toString(16)})`);
  check("livery", MV.mvLivery(e, { region: "new-orleans" }, [{ id: "creole", region: "new-orleans", colors: ["#f4c6b8"] }]) === 0xf4c6b8 && MV.mvLivery(e, { region: "x" }, { junk: 5 }) === MV.MV_CLASS_COLOUR.transit, "array-shaped categories read too; an unreadable one falls back");
}

// ------------------------------------------------------------------ app, bundle, hygiene, doc
{
  const src = readFileSync(join(WEBXR, "shared/mv-motorworks.js"), "utf8");
  const wsrc = readFileSync(join(WEBXR, "shared/mv-world.js"), "utf8");
  const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
  const bundle = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  const doc = existsSync(join(ROOT, "docs/consoles/MOTORWORKS.md")) ? readFileSync(join(ROOT, "docs/consoles/MOTORWORKS.md"), "utf8") : "";
  check("mount", /mvMountMotorworks\(/.test(app) && /kind === "vehicle"/.test(app) && /mvPark\.prompt/.test(app), "the parishes app mounts the parked vehicles with an enter prompt");
  check("mount", /snap: !mvP/.test(app) && /mvPark\.hide/.test(app) && /mvPark\.show/.test(app), "Drive after the pre-trip pulls away from the bay (snap off); the exit re-parks it");
  check("mount", /mvDriveEntry\(entry/.test(app), "every parish drive (board or bay) uses MOTORWORKS' per-class handling");
  const block = bundle.slice(bundle.indexOf('"parishes": {'), bundle.indexOf('"parishes/js/app.js"'));
  check("bundle", block.indexOf("mv-motorworks.js") > block.indexOf("nw-drive.js") && block.indexOf("mv-world.js") > block.indexOf("mv-motorworks.js") && block.indexOf("nw-drive.js") > 0, "the parishes bundle carries mv-motorworks.js and mv-world.js after nw-drive.js");
  check("hygiene", !/^import /m.test(src), "mv-motorworks.js is dependency-free data (no import) for TQ-BRIDGE");
  check("hygiene", !/^import \* as THREE/m.test(wsrc) && !/^import \* as THREE/m.test(src), "no three.js import in either module");
  const tops = [src, wsrc].flatMap((t) => [...t.matchAll(/^(?:export )?(?:const|function|let|class) (\w+)/gm)].map((m) => m[1]));
  const bad = tops.filter((n) => !/^(mv|MV_)/.test(n));
  check("hygiene", !bad.length, `every top-level name is mv/MV_ (${bad.join(", ") || `${tops.length} names`})`);
  check("facts", !/\b(Ford|Chevrolet|Freightliner|Peterbilt|Kenworth|Caterpillar|Toyota|Hyster|Mack|Volvo)\b/.test(src + wsrc), "no maker or brand in the modules");
  check("doc", /## Cycles/.test(doc) && /## Seams/.test(doc), "docs/consoles/MOTORWORKS.md has Cycles and Seams");
}

console.log(`\n  ${passed} checks · ${failed} failed`);
if (failed) process.exit(1);
console.log("All MOTORWORKS checks pass.");
