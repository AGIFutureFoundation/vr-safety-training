/**
 * The Motor Pool (console MOTORPOOL, the Crescent brief): fifty drivable
 * vehicles and twenty watercraft, each with a kit builder, a drive or helm
 * profile, the trades that operate it, the gate that qualifies a learner and
 * a pre-trip step.
 *
 *     node tools/check_drivables.mjs
 *
 * Asserts:
 *   - the registry holds 50 road/site/rail entries and 20 watercraft with
 *     unique ids; DV_GATED mirrors it one for one (the gate contract);
 *   - every entry's builder resolves and renders headlessly (check_fleet's
 *     own stub, so mergeStatic is counted the same way) inside its declared
 *     mesh budget and the Motor Pool ceiling; a watercraft carries a draft;
 *   - every gate station is a catalog station (curricula.js), every K-12 id
 *     a classroom station, every one has a display name for the lock UI,
 *     and its lock note carries no digit;
 *   - every trade is a tools/unions.json id (or the entry says why it has
 *     none); every pre-trip has three or more items; no text carries a digit
 *     or banned wording; no brand or maker is named;
 *   - each entry drives or floats a scripted twenty-second headless run
 *     clean (moves, stays inside bounds, no collision or grounding, stops),
 *     deterministically;
 *   - the board renders every row without a browser: a fresh profile sees
 *     every row locked, a profile holding one entry's stations sees that one
 *     available with its pre-trip step;
 *   - Bay World carries the hook (sim.js registry, the board screen, the
 *     bundle's module list) and bwStepVehicle drives a registered drivable.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; console.log(`  FAIL [${area}] ${msg}`); };

class MemStore {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStore();
globalThis.sessionStorage = new MemStore();

const imp = (p) => import(pathToFileURL(join(WEBXR, p)));
const D = await imp("shared/drivables-data.js");
const B = await imp("shared/drivables-board.js");
const G = await imp("shared/skill-gates.js");
const NM = await imp("shared/gate-names-data.js");
const SIM = await imp("bayworld/js/sim.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
const K12 = new Set(CURRICULA.filter((c) => c.audience === "classroom").flatMap((c) => c.stations.map((s) => s.id)));
const unionsRaw = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8"));
const UNIONS = new Set((Array.isArray(unionsRaw) ? unionsRaw : unionsRaw.unions ?? []).map((u) => u.id));

const BANNED = /\b(gambl\w*|bet|wager|loot ?box\w*|purchase\w*|buy|kill\w*|shoot\w*|weapon\w*|blood|casino|jackpot)\b/i;
// The facts rule: no maker, model or brand. A short list of the names most likely to slip into a vehicle registry.
const BRANDS = /\b(caterpillar|cat\b|deere|komatsu|volvo|kenworth|peterbilt|freightliner|mack|ford|chevrolet|chevy|dodge|ram\b|toyota|honda|yamaha|mercury|evinrude|hyster|toyota|jlg|genie|grove|liebherr|bobcat|kubota|gillig|new flyer|blue bird|thomas built|boeing|airbus|siemens|alstom|brunswick|boston whaler|zodiac)\b/i;

// ------------------------------------------------------------ registry
const all = D.DV_DRIVABLES;
const road = all.filter((d) => d.kind !== "water"), water = all.filter((d) => d.kind === "water");
if (road.length !== 55) fail("count", `${road.length} road/site/rail drivables (need 55: MOTORPOOL's 50 and CLEANPORTS' five zero-emission machines)`); else ok();
if (water.length !== 20) fail("count", `${water.length} watercraft (need 20)`); else ok();
if (D.DV_ROAD_COUNT !== road.length || D.DV_WATER_COUNT !== water.length) fail("count", "DV_ROAD_COUNT / DV_WATER_COUNT disagree with the registry"); else ok();
const ids = new Set();
for (const d of all) { if (ids.has(d.id)) fail("ids", `duplicate id ${d.id}`); else ok(); ids.add(d.id); }
if (D.DV_GATED.length !== all.length) fail("gated", `DV_GATED has ${D.DV_GATED.length} items for ${all.length} drivables`); else ok();
for (const g of D.DV_GATED) {
  if (g.id !== `dv-${g.drivable}` || !ids.has(g.drivable) || !g.title || !g.world || !g.gate?.note) fail("gated", `${g.id}: not a well-formed gate item`); else ok();
}

// ------------------------------------------------------------ each entry
for (const d of all) {
  const where = d.id;
  for (const f of ["id", "name", "kind", "class", "kit", "profile", "trades", "gate", "pretrip"]) if (d[f] === undefined) fail("shape", `${where}: no ${f}`);
  if (!["road", "site", "rail", "water"].includes(d.kind)) fail("shape", `${where}: kind ${d.kind}`); else ok();
  if (!["fleet", "equipment", "drivables"].includes(d.kit?.module) || !d.kit?.build) fail("shape", `${where}: kit must name a module and a builder`); else ok();
  // profile shape
  if (d.kind === "water") { for (const f of ["max", "accel", "drag", "turn", "reverse", "draft"]) if (typeof d.profile[f] !== "number") fail("profile", `${where}: helm profile lacks ${f}`); else ok(); }
  else { for (const f of ["top", "accel", "turn"]) if (typeof d.profile[f] !== "number") fail("profile", `${where}: drive profile lacks ${f}`); else ok(); }
  // trades
  for (const t of d.trades) { if (!UNIONS.has(t)) fail("trades", `${where}: "${t}" is not a tools/unions.json id`); else ok(); }
  if (!d.trades.length && !d.tradeNote) fail("trades", `${where}: no trade and no tradeNote`); else ok();
  // gate
  for (const p of G.qmGateProblems(d.gate)) fail("gate", `${where}: ${p}`);
  if (!G.qmGateProblems(d.gate).length) ok();
  if (!(d.gate.stations ?? []).length && !(d.gate.k12 ?? []).length) fail("gate", `${where}: no qualifying station`); else ok();
  for (const s of d.gate.stations ?? []) {
    if (!STATIONS.has(s)) fail("gate", `${where}: unknown station "${s}"`); else ok();
    if (typeof NM.QM_STATION_NAMES[s] !== "string") fail("names", `${where}: no display name for ${s} — run node tools/gen_gate_names.mjs`); else ok();
  }
  for (const s of d.gate.k12 ?? []) { if (!K12.has(s)) fail("gate", `${where}: unknown K-12 station "${s}"`); else ok(); }
  // pre-trip
  if (!Array.isArray(d.pretrip.items) || d.pretrip.items.length < 3) fail("pretrip", `${where}: fewer than three pre-trip items`); else ok();
  if (!/^(Pre-trip|Pre-departure)$/.test(d.pretrip.title)) fail("pretrip", `${where}: pre-trip title "${d.pretrip.title}"`); else ok();
  // facts and tone
  const text = [d.name, d.class, d.gate.note, d.tradeNote, ...d.pretrip.items].filter(Boolean).join(" ");
  if (/\d/.test(text.replace(/K-12/g, ""))) fail("facts", `${where}: text carries a digit`); else ok();
  if (BANNED.test(text)) fail("tone", `${where}: banned wording "${text.match(BANNED)[0]}"`); else ok();
  if (BRANDS.test(text)) fail("facts", `${where}: names a maker or brand "${text.match(BRANDS)[0]}"`); else ok();
  // the scripted run
  const run = D.dvScriptedRun(d);
  if (!run.ok) fail("run", `${where}: the twenty-second run is not clean (moved ${run.dist.toFixed(1)} m, collisions ${run.collisions}, stopped ${run.stopped}, in bounds ${run.inBounds})`); else ok();
  const again = D.dvScriptedRun(d);
  if (JSON.stringify(again.trace) !== JSON.stringify(run.trace)) fail("run", `${where}: the run is not deterministic`); else ok();
  if (run.trace.length < 15) fail("run", `${where}: the run traced ${run.trace.length} samples of a twenty-second drive`); else ok();
}
// The drive engine refuses a blocked move and stops at the end of a track; the helm stops on the shore.
{
  const truck = D.dvById("box-truck");
  let s = { x: 0, z: 0, heading: 0, speed: 0 };
  for (let i = 0; i < 100; i++) s = D.dvStepDrive(s, { throttle: 1 }, 0.05, truck.profile, { blocked: (x, z) => z > 10 });
  if (s.z > 10 || !(s.collided || s.speed <= 0.01)) fail("engine", `a blocked move was not refused (z ${s.z.toFixed(1)})`); else ok();
  const rail = D.dvById("rail-switcher");
  let r = { x: 0, z: 0, heading: 0, speed: 0, s: 0 };
  for (let i = 0; i < 400; i++) r = D.dvStepDrive(r, { throttle: 1 }, 0.05, rail.profile, { rails: [[0, 0], [0, 40], [20, 60]] });
  if (Math.abs(r.x - 20) > 0.01 || Math.abs(r.z - 60) > 0.01 || r.speed !== 0) fail("engine", `the rail vehicle did not stop at the end of its track (${r.x.toFixed(1)}, ${r.z.toFixed(1)}, v ${r.speed})`); else ok();
  const boat = D.dvById("pilot-boat");
  let b = { x: 0, z: 0, heading: 0, speed: 0 };
  for (let i = 0; i < 200; i++) b = D.dvStepHelm(b, { throttle: 1 }, 0.05, boat.profile, { onWater: (x, z) => z < 15, wind: { speed: 0, dir: 0 } });
  if (b.z > 15 || !b.aground) fail("engine", `the shore did not stop the hull (z ${b.z.toFixed(1)})`); else ok();
  const dinghy = D.dvById("sailing-dinghy");
  let up = { x: 0, z: 0, heading: 0, speed: 0 }, down = { x: 0, z: 0, heading: 0, speed: 0 };
  for (let i = 0; i < 200; i++) { up = D.dvStepHelm(up, { throttle: 1 }, 0.05, dinghy.profile, { wind: { speed: 5, dir: Math.PI } }); down = D.dvStepHelm(down, { throttle: 1 }, 0.05, dinghy.profile, { wind: { speed: 5, dir: 0 } }); }
  if (!(down.speed > up.speed)) fail("engine", `the dinghy sails as fast into the wind as off it (${up.speed.toFixed(2)} vs ${down.speed.toFixed(2)})`); else ok();
}

// ------------------------------------------------------------ builders
// The same stub three.js check_fleet.mjs measures with, so mergeStatic is counted alike.
const fleetSrc = readFileSync(join(ROOT, "tools/check_fleet.mjs"), "utf8");
const stubMatch = fleetSrc.match(/const THREE_STUB = `([\s\S]*?)`;\n/);
if (!stubMatch) { fail("builders", "tools/check_fleet.mjs no longer carries THREE_STUB; the Motor Pool kit cannot be measured"); }
else {
  const ctx2d = new Proxy({}, { get(_t, prop) { if (prop === "measureText") return () => ({ width: 10 }); if (prop === "createLinearGradient") return () => ({ addColorStop() {} }); if (prop === "canvas") return { width: 1, height: 1 }; return () => {}; }, set() { return true; } });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx2d }), head: { appendChild() {} } };
  globalThis.window = globalThis.window ?? {};
  const IMPORT_RE = /^(?:import\s+[\s\S]*?from|export\s*\*\s*from)\s+["'][^"']+["'];\s*$/gm;
  const EXPORT_BLOCK_RE = /^export\s*\{[^}]*\}\s*;\s*$/gm;
  const EXPORT_KEYWORD_RE = /^export\s+(?=(const|let|var|function|class|async))/gm;
  const strip = (src) => src.replace(IMPORT_RE, "").replace(EXPORT_BLOCK_RE, "").replace(EXPORT_KEYWORD_RE, "");
  const dir = mkdtempSync(join(tmpdir(), "drivables-"));
  process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ } });
  writeFileSync(join(dir, "three-mock.mjs"), stubMatch[1]);
  const parts = ["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/equipment.js", "shared/drivables-data.js", "shared/drivables.js"].map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
  writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\nimport { __bounds } from "./three-mock.mjs";\n\n${parts.join("\n\n")}\n\nexport { THREE, __bounds, DV_DRIVABLES, DV_BUDGET, DV_BUILDERS, dvBuild, dvBudgetFor, dvUnresolved };`);
  const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);
  const mergedCount = (root) => {
    const groups = new Map(); let loose = 0;
    root.traverse((o) => {
      if (o.isPoints || o.isLine) { loose += 1; return; }
      if (!o.isMesh) return;
      let anc = o.parent;
      while (anc && !anc.userData?.fleetBake) { if (anc === root) { anc = null; break; } anc = anc.parent; }
      if (!anc) { loose += 1; return; }
      let g = groups.get(anc); if (!g) { g = { mats: new Set(), solo: 0 }; groups.set(anc, g); }
      const solo = o.userData?.interactiveId || o.userData?.noMerge || o.userData?.canvas || o.material?.userData?.ownMaterial || Array.isArray(o.material) || !o.geometry?.attributes?.position;
      if (solo) g.solo += 1; else g.mats.add(o.material);
    });
    let merged = loose; for (const g of groups.values()) merged += g.mats.size + g.solo; return merged;
  };
  const unresolved = suite.dvUnresolved();
  if (unresolved.length) fail("builders", `no builder for: ${unresolved.join(", ")}`); else ok();
  const CEILING = 45; // one kit build; a composite (a push boat with its barges) at most this
  let heaviest = 0, sum = 0;
  for (const d of suite.DV_DRIVABLES) {
    const budget = suite.dvBudgetFor(d);
    if (!budget) { fail("builders", `${d.id}: no budget row for ${d.kit.module}.${d.kit.build}`); continue; }
    let g;
    try { g = suite.dvBuild(new suite.THREE.Group(), d, 0, 0, 0, {}); } catch (e) { fail("builders", `${d.id}: build threw — ${e.message}`); continue; }
    const n = mergedCount(g);
    heaviest = Math.max(heaviest, n); sum += n;
    if (n > budget.meshes) fail("budget", `${d.id}: ${n} meshes after merge, declared ${budget.meshes}`); else ok();
    if (n > CEILING) fail("budget", `${d.id}: ${n} meshes, over the Motor Pool ceiling of ${CEILING}`); else ok();
    if (g.userData?.drivable !== d.id) fail("builders", `${d.id}: userData.drivable not stamped`); else ok();
    if (d.kind === "water" && typeof g.userData?.draft !== "number") fail("builders", `${d.id}: a watercraft with no draft`); else ok();
    if (d.articulated && !g.userData?.articulation) fail("builders", `${d.id}: articulated but not re-hung for driving`); else ok();
    const b = suite.__bounds(g);
    if (b.mn[1] < -0.02 && !budget.belowGround) fail("builders", `${d.id}: geometry below the ground (y ${b.mn[1].toFixed(2)})`); else ok();
  }
  console.log(`  kit: ${suite.DV_DRIVABLES.length} builds, ${sum} meshes in all, heaviest ${heaviest} (ceiling ${CEILING})`);
}

// ------------------------------------------------------------ the board
{
  globalThis.localStorage.clear(); G.qmInvalidate();
  const fresh = B.dvBoardRows(G.qmSnapshot());
  const rows = (fresh.match(/class="dv-row/g) ?? []).length, locked = (fresh.match(/dv-locked/g) ?? []).length;
  if (rows !== all.length) fail("board", `${rows} board rows for ${all.length} drivables`); else ok();
  if (locked !== all.length) fail("board", `a fresh profile sees ${all.length - locked} drivables available`); else ok();
  if (!/href="[^"]*(smartcity|trades)[^"]*"/.test(fresh)) fail("board", "locked rows carry no station link"); else ok();
  const counts = B.dvBoardCounts(G.qmSnapshot());
  if (Object.values(counts).reduce((a, c) => a + c.total, 0) !== all.length) fail("board", "section counts do not add up"); else ok();
  // one entry's stations on the passport opens exactly that entry
  const pick = D.dvById("forklift");
  const records = [...(pick.gate.stations ?? []), ...(pick.gate.k12 ?? [])].map((id) => ({ simId: id, stars: 1 }));
  globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify(records)); G.qmInvalidate();
  const snap = G.qmSnapshot();
  const row = B.dvRowHtml(pick, snap, { from: "bayworld" });
  if (/dv-locked/.test(row) || !/data-dv-open="forklift"/.test(row)) fail("board", "the forklift is not available with its station passed"); else ok();
  const pre = B.dvPretripHtml(pick);
  if ((pre.match(/data-dv-check=/g) ?? []).length !== pick.pretrip.items.length || !/data-dv-go="forklift"[^>]*disabled/.test(pre)) fail("board", "the pre-trip step does not list every item with the drive button held until they are ticked"); else ok();
  const open = B.dvBoardCounts(snap);
  const openTotal = Object.values(open).reduce((a, c) => a + c.open, 0);
  // the reach truck shares the forklift's gate, so it opens too; nothing else does
  if (openTotal !== all.filter((d) => G.qmIsOpen(d.gate, snap)).length || openTotal > 3) fail("board", `${openTotal} drivables open with one station passed`); else ok();
  const boardSrc = readFileSync(join(WEBXR, "shared/drivables-board.js"), "utf8");
  if (/THREE\./.test(boardSrc)) fail("board", "drivables-board.js spells THREE. (the bundler would import three.js for it)"); else ok();
  globalThis.localStorage.clear(); G.qmInvalidate();
}

// ------------------------------------------------------------ Bay World hook
{
  const entry = D.dvById("dump-truck");
  if (typeof SIM.bwRegisterVehicles !== "function") fail("bayworld", "sim.js has no bwRegisterVehicles"); else {
    ok();
    SIM.bwRegisterVehicles([D.dvRoadParams(entry, [3, 3, 9.6])]);
    let s = { x: 0, z: -300, heading: 0, speed: 0, vehicleId: "dv-dump-truck" };
    let threw = null;
    try { for (let i = 0; i < 60; i++) s = SIM.bwStepVehicle(s, { throttle: 1, steer: 0 }, 0.05); } catch (e) { threw = e.message; }
    if (threw) fail("bayworld", `bwStepVehicle would not drive a registered drivable: ${threw}`); else if (s.speed <= 0) fail("bayworld", "a registered drivable does not move"); else ok();
    if (SIM.bwVehicleParams("dv-dump-truck").top > SIM.BW_SPEED_CAP) fail("bayworld", "the city cap is not applied to a registered drivable"); else ok();
    if (SIM.BW_VEHICLES.length !== 4) fail("bayworld", `BW_VEHICLES changed (${SIM.BW_VEHICLES.length}); the depot should still park four`); else ok();
  }
  const app = readFileSync(join(WEBXR, "bayworld/js/app.js"), "utf8");
  const html = readFileSync(join(WEBXR, "bayworld/index.html"), "utf8");
  for (const needle of ["dvMountMotorPool", "bwRegisterVehicles", "dvBuild(", "scr-motorpool"]) { if (!app.includes(needle)) fail("bayworld", `app.js lacks ${needle}`); else ok(); }
  for (const needle of ['id="scr-motorpool"', 'id="dv-board"', 'id="hud-motorpool-btn"']) { if (!html.includes(needle)) fail("bayworld", `index.html lacks ${needle}`); else ok(); }
  const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  const bay = bundler.slice(bundler.indexOf('"bayworld": {'), bundler.indexOf('"entry"', bundler.indexOf('"bayworld": {')));
  const order = ["fleet.js", "equipment.js", "drivables-data.js", "drivables.js", "drivables-board.js", "bayworld/js/app.js"].map((m) => bay.indexOf(m));
  if (order.some((i) => i < 0) || order.some((v, i) => i && v < order[i - 1])) fail("bundle", `the bayworld bundle does not list the Motor Pool modules in dependency order (${order.join(", ")})`); else ok();
  if (existsSync(join(WEBXR, "dist/bayworld.html"))) {
    const dist = readFileSync(join(WEBXR, "dist/bayworld.html"), "utf8");
    if (!dist.includes("dvMountMotorPool")) console.log("  note: WebXR/dist/bayworld.html predates the Motor Pool — run python3 tools/bundle_webxr.py bayworld");
  }
  const checkAll = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
  if (!checkAll.includes('"check_drivables.mjs"')) fail("suite", "check_all.mjs does not run check_drivables.mjs"); else ok();
  const fleetKits = readFileSync(join(ROOT, "tools/check_fleet.mjs"), "utf8");
  if (!fleetKits.includes('"shared/drivables.js"')) fail("suite", "check_fleet.mjs does not hold the Motor Pool kit"); else ok();
}

console.log(failed
  ? `\n${failed} Motor Pool problem(s) (${passed} checks passed).`
  : `\nMotor Pool: ${road.length} drivables and ${water.length} watercraft, every builder inside budget, every gate resolved, every entry drove or floated its twenty-second run clean (${passed} checks).`);
process.exit(failed ? 1 : 0);
