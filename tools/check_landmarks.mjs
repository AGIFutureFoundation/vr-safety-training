#!/usr/bin/env node
/**
 * LANDMARKS (docs/consoles/LANDMARKS.md): the procedural landmark kit WebXR/shared/lm-landmarks.js.
 *
 *   - every registry kind builds headlessly (vendored three.js) on the desktop and phone tiers, as one mesh, within its
 *     LM_BUDGET triangles, the phone tier no heavier than the desktop, with a finite, grounded bounding box;
 *   - the kit is still (nothing animates, nothing random) and says it is schematic (no claim of accuracy);
 *   - every San Francisco and Oakland map landmark of a registry kind draws with the kit in np-world.js (and none other does),
 *     a bridge kind fitted to a bridge road, a ground kind on dry ground and clear of the sites' pads;
 *   - the engine's budgets hold with the kit in (meshes and triangles at every site, both tiers — the check_parishes rule);
 *   - wiring: the bundler lists the kit before np-world.js, check_all runs this checker, the doc lists every kind.
 *
 *     node tools/check_landmarks.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const t0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const THREE = await imp("vendor/three/dist/three.module.min.js");
const L = await imp("shared/lm-landmarks.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");

// 1. every kind builds within budget on both tiers
const kinds = L.lmKinds();
check(kinds.length >= 14, `fourteen or more kinds (${kinds.length})`);
const want = ["golden-gate-bridge", "bay-bridge-suspension", "bay-bridge-east-tower", "coit-tower", "transamerica-pyramid", "ferry-building", "painted-ladies", "cable-car", "cable-car-turntable", "container-cranes", "lake-merritt-pergola", "victorian-house", "wharf-pier-shed", "lighthouse"];
for (const k of want) check(L.lmHas(k), `the registry has ${k}`);
const budgetLine = [];
for (const k of kinds) {
  const b = L.LM_BUDGET[k];
  check(!!b && b.meshes >= 1 && b.high > 0 && b.low > 0 && b.low <= b.high, `${k}: has a budget with a phone tier`);
  const tri = {};
  for (const tier of ["high", "low"]) {
    const g = L.lmBuild(k, { three: THREE, tier });
    check(g && g.isGroup && g.name === `lm-${k}`, `${k}/${tier}: builds a group`);
    if (!g) continue;
    let meshes = 0, t = 0;
    g.traverse((o) => { if (o.isMesh) { meshes++; const n = o.geometry.attributes.position.count / 3; t += o.isInstancedMesh ? n * o.count : n; } });
    tri[tier] = Math.round(t);
    check(meshes === b.meshes, `${k}/${tier}: ${meshes} mesh(es), budget ${b.meshes}`);
    check(t > 0 && t <= b[tier], `${k}/${tier}: ${Math.round(t)} triangles within ${b[tier]}`);
    check(g.userData.triangles === Math.round(t) && g.userData.schematic === true, `${k}/${tier}: reports its triangles and that it is schematic`);
    const box = new THREE.Box3().setFromObject(g);
    check([box.min.x, box.min.y, box.max.y].every(Number.isFinite) && box.max.y > 2 && box.min.y > -8, `${k}/${tier}: a finite bounding box standing on its base (y ${box.min.y.toFixed(1)} … ${box.max.y.toFixed(1)})`);
    const g2 = L.lmBuild(k, { three: THREE, tier, scale: 2 });
    check(g2.scale.x === 2, `${k}/${tier}: scale applies`);
  }
  check(tri.low <= tri.high, `${k}: the phone tier (${tri.low}) is no heavier than the desktop (${tri.high})`);
  budgetLine.push(`${k} ${tri.high}/${tri.low}`);
}
check(L.lmBuild("nowhere", { three: THREE }) === null && L.lmBuild("coit-tower", {}) === null, "an unknown kind or a missing three.js builds nothing");
check(L.lmKindOf({ kind: "bridge", lm: "golden-gate-bridge" }) === "golden-gate-bridge" && L.lmKindOf({ kind: "lighthouse" }) === "lighthouse" && L.lmKindOf({ kind: "place" }) === null, "lmKindOf reads `lm`, then a registry `kind`, else null");
const bridge = L.lmBuild("golden-gate-bridge", { three: THREE, span: 400, deck: 20 }), bridgeBox = new THREE.Box3().setFromObject(bridge);
check(bridgeBox.max.z - bridgeBox.min.z > 400 && bridgeBox.max.z - bridgeBox.min.z < 700, "a bridge kit spans its `span` along +Z");

// 2. still and schematic
const src = readFileSync(join(WEBXR, "shared", "lm-landmarks.js"), "utf8");
check(!/Math\.random|Date\.now|performance\.now|requestAnimationFrame|\.rotation\.[xyz]\s*\+=|animate\s*\(/.test(src), "the kit is still and deterministic (no randomness, clock or animation) — reduced motion safe");
check(/SCHEMATIC SILHOUETTES/.test(src) && /no shape claims to be\s*\n?\/\/?\s*accurate|claims to be/.test(src) && /nothing here is measured/i.test(src), "the kit says it is schematic, unmeasured and claims no accuracy");
check(!/\bimport\b/.test(src.split("\n").filter((l) => !l.trim().startsWith("//")).join("\n")), "the kit imports nothing (three.js comes from the caller)");

// 3. every SF and Oakland map landmark of a registry kind draws with the kit; budgets hold
// LANDMARKS-2: every map now (22), not only San Francisco and Oakland
const bay = R.NP_PARISHES;
check(bay.length >= 22, `the 22 parish-engine maps are in the tree (${bay.length})`);
const LX_WET = new Set(["wharf-pier-shed", "container-cranes", "canal-lock", "levee-pump-station", "marsh-boardwalk", "tide-gate"]);
const worstChunk = [];
const drawn = [];
for (const p of bay) {
  const kitLms = p.landmarks.filter((l) => L.lmKindOf(l));
  for (const l of p.landmarks) if (l.lm !== undefined) check(L.lmHas(l.lm), `${p.id}/${l.id}: its lm "${l.lm}" is a registry kind`);
  for (const tier of ["low", "high"]) {
    const root = new THREE.Group(), start = E.npStartSite(p);
    const world = W.npBuildParish(root, THREE, p, { tier, start: start.position });
    const kitRoot = root.getObjectByName("parish-lm-kit");
    check(!!kitRoot && Array.isArray(world.lmKits), `${p.id}/${tier}: the world carries the kit root and lmKits`);
    check(world.lmKits.length === kitLms.length, `${p.id}/${tier}: ${world.lmKits.length} kit landmarks drawn of ${kitLms.length} named`);
    for (const l of kitLms) {
      const k = world.lmKits.find((x) => x.id === l.id), kind = L.lmKindOf(l);
      check(k && k.kind === kind && kitRoot.getObjectByName(`lm-${l.id}`)?.children[0]?.isMesh, `${p.id}/${tier}/${l.id}: draws with lmBuild("${kind}")`);
      if (!k) continue;
      if (L.LM_BRIDGES.has(kind)) {
        const onRoad = p.roads.some((r) => E.NP_ROAD_KINDS[r.kind]?.clearance && E.npPointsAlong(r.pts, 10).some(([x, z]) => Math.hypot(x - k.x, z - k.z) < 12));
        check(onRoad, `${p.id}/${tier}/${l.id}: the bridge kit stands on a bridge road`);
      } else {
        const wet = E.npWaterAt(p, k.x, k.z);
        check(!wet || wet.kind === "wetland" || LX_WET.has(kind), `${p.id}/${tier}/${l.id}: a ground kit stands on dry ground`);
        const near = Math.min(...p.sites.map((s) => Math.hypot(s.position[0] - k.x, s.position[1] - k.z)));
        check(near >= 30, `${p.id}/${tier}/${l.id}: clear of the sites' pads (nearest site ${Math.round(near)} m)`);
      }
    }
    for (const l of p.landmarks.filter((x) => !L.lmKindOf(x))) check(!world.lmKits.some((k) => k.id === l.id), `${p.id}/${tier}/${l.id}: a landmark of no registry kind keeps the generic sign alone`);
    let worstTri = 0, worstMesh = 0;
    for (const s of [start, ...p.sites]) { world.update(s.position[0], s.position[1], 999); const st = world.stats(); worstTri = Math.max(worstTri, st.triangles); worstMesh = Math.max(worstMesh, st.meshes); }
    const kitTri = world.lmKits.reduce((s, k) => s + k.triangles, 0);
    check(worstMesh <= E.NP_BUDGET.drawCalls, `${p.id}/${tier}: at most ${E.NP_BUDGET.drawCalls} meshes at every site with the kit (worst ${worstMesh})`);
    check(worstTri <= E.NP_BUDGET.triangles, `${p.id}/${tier}: at most ${E.NP_BUDGET.triangles} triangles at every site with the kit (worst ${worstTri})`);
    check(kitTri <= (tier === "low" ? 6000 : 12000), `${p.id}/${tier}: the kit adds ${world.lmKits.length} mesh(es) and ${kitTri} triangles (map cap ${tier === "low" ? 6000 : 12000})`);
    if (tier === "high" && world.lmKits.length) worstChunk.push(`${p.id} ${worstMesh}`);
    if (tier === "high") drawn.push(`${p.id} ${world.lmKits.length} (${world.lmKits.map((k) => k.kind).join(", ") || "none"})`);
    note(`${p.id}/${tier}: ${world.lmKits.length} kit landmarks, +${kitTri} triangles; worst ${worstMesh} meshes / ${worstTri} triangles`);
  }
}
const withKit = bay.filter((p) => p.landmarks.some((l) => L.lmKindOf(l)));
check(withKit.length >= 4, `four or more Bay Area maps draw landmarks with the kit (${withKit.map((p) => p.id).join(", ")})`);
for (const [pid, lid, kind] of [["sf-marina", "golden-gate-bridge", "golden-gate-bridge"], ["sf-downtown", "coit-tower", "coit-tower"], ["sf-downtown", "the-ferry-building", "ferry-building"], ["oak-west-oakland", "the-port-cranes", "container-cranes"], ["oak-downtown-lake", "lake-merritt-pergola", "lake-merritt-pergola"]])
  check(L.lmKindOf(R.npParish(pid)?.landmarks.find((l) => l.id === lid)) === kind, `${pid}/${lid} draws as ${kind}`);

// 3b. LANDMARKS-2: walk-in landmark interiors (WebXR/shared/lx-walkin.js)
const X = await imp("shared/lx-walkin.js");
const styles = Object.keys(X.LX_STYLES);
check(styles.length >= 3 && styles.length <= 4, `three or four walk-in styles (${styles.join(", ")})`);
const walkLine = [];
for (const st of styles) {
  for (const k of X.LX_STYLES[st].kinds) check(L.lmHas(k) && X.lxWalkinStyleOf(k) === st, `walk-in ${st}: opens from the kit kind ${k}`);
  check(/generic, schematic/.test(X.LX_STYLES[st].label), `walk-in ${st}: its label says it is generic and schematic`);
  for (const tier of ["high", "low"]) {
    const r = X.lxBuildRoom(st, { three: THREE, tier });
    check(r && r.group.isGroup && r.via === "lx", `walk-in ${st}/${tier}: builds its own minimal room (no ix yet)`);
    check(r.meshes <= X.LX_BUDGET.meshes && r.triangles <= (tier === "low" ? X.LX_BUDGET.trianglesLow : X.LX_BUDGET.trianglesHigh), `walk-in ${st}/${tier}: ${r.meshes} meshes, ${r.triangles} triangles within ${X.LX_BUDGET.meshes} / ${tier === "low" ? X.LX_BUDGET.trianglesLow : X.LX_BUDGET.trianglesHigh}`);
    if (tier === "high") walkLine.push(`${st} ${r.meshes}m/${r.triangles}t`);
  }
  // enter and exit: the outdoor world hides and comes back, the player returns to the door, the collider keeps them in
  const scene = new THREE.Scene(), outdoor = new THREE.Group(); scene.add(outdoor);
  const door = { id: "t", kind: X.LX_STYLES[st].kinds[0], style: st, x: 120, z: -40, yaw: 0 };
  const ctl = X.lxWalkin({ three: THREE, scene, outdoor, tier: "high" });
  const p = ctl.enter(door, { x: 118, z: -39 });
  check(ctl.inside && outdoor.visible === false && scene.getObjectByName(`lx-room-${st}`) && Number.isFinite(p.x), `walk-in ${st}: enter hides the outdoor world and adds the room`);
  const c = ctl.clamp(999, -999);
  check(Math.abs(c.x) <= ctl.room.hw && Math.abs(c.z) <= ctl.room.hd, `walk-in ${st}: the room collider keeps the player in (${c.x.toFixed(1)}, ${c.z.toFixed(1)})`);
  check(ctl.eyeY(1.6) < -100, `walk-in ${st}: the room stands below the map`);
  const back = ctl.exit();
  check(!ctl.inside && outdoor.visible === true && !scene.getObjectByName(`lx-room-${st}`) && back.x === 120 && back.z === -40, `walk-in ${st}: exit restores the world and returns the player to the door`);
  check(ctl.exit() === null && ctl.enter({ style: "nowhere" }) === null, `walk-in ${st}: a second exit or an unknown style does nothing`);
}
// the guarded INTERIORS import: a working ix shell is used; a throwing or unknown one falls back
const fake = { ixBuildRoom: (style, o) => { const g = new o.three.Group(); g.add(new o.three.Mesh(new o.three.BoxGeometry(1, 1, 1))); return g; } };
check(X.lxBuildRoom("pier-shed", { three: THREE, ix: fake }).via === "ix", "walk-in: INTERIORS' ixBuildRoom is used when it returns a group");
check(X.lxBuildRoom("pier-shed", { three: THREE, ix: { ixBuildRoom: () => { throw new Error("x"); } } }).via === "lx" && X.lxBuildRoom("pier-shed", { three: THREE, ix: { ixBuildRoom: () => null } }).via === "lx", "walk-in: a throwing or empty ix falls back to the minimal room");
const wsrc = readFileSync(join(WEBXR, "shared", "lx-walkin.js"), "utf8");
check(!/Math\.random|Date\.now|requestAnimationFrame/.test(wsrc) && !/^\s*import\b/m.test(wsrc), "walk-in: still, deterministic, imports nothing (ix is passed in, guarded)");
// every walk-in kit on the 22 maps gets a door
let doorCount = 0;
for (const p of R.NP_PARISHES) {
  const wk = p.landmarks.filter((l) => X.lxWalkinStyleOf(L.lmKindOf(l)));
  if (!wk.length) continue;
  const root = new THREE.Group(), world = W.npBuildParish(root, THREE, p, { tier: "low", start: E.npStartSite(p).position });
  const doors = X.lxWalkinDoors(world.lmKits);
  check(doors.length === wk.length, `${p.id}: ${doors.length} walk-in door(s) for ${wk.length} walk-in landmark(s)`);
  for (const d of doors) { const wet = E.npWaterAt(p, d.x, d.z); check(!wet || wet.kind === "wetland" || d.style === "pier-shed", `${p.id}/${d.id}: the ${d.style} door stands on dry ground`); }
  doorCount += doors.length;
}
check(doorCount >= 6, `walk-in doors on the maps (${doorCount})`);
const appSrc = readFileSync(join(WEBXR, "parishes", "js", "app.js"), "utf8");
check(/import \{ lxWalkinDoors, lxWalkin \} from "\.\.\/\.\.\/shared\/lx-walkin\.js"/.test(appSrc) && /E — go inside/.test(appSrc) && /if \(!lxRoom\?\.inside\) \{ world\.update/.test(appSrc), "the parishes app mounts the walk-ins (door prompt, streaming stops inside)");
note(`walk-in rooms (desktop): ${walkLine.join("; ")}; ${doorCount} doors on the maps`);

// 4. wiring
const world =readFileSync(join(WEBXR, "shared", "np-world.js"), "utf8");
check(/import \{ lmBuild, lmKindOf, LM_BRIDGES \} from "\.\/lm-landmarks\.js"/.test(world) && /typeof lmBuild !== "function"/.test(world), "np-world.js imports the kit and guards the call");
const bundler = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
check(/SHARED \/ "lm-landmarks\.js",[\s\S]{0,40}SHARED \/ "np-world\.js"/.test(bundler), "the parishes bundle lists lm-landmarks.js before np-world.js");
check(readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8").includes('"check_landmarks.mjs"'), "check_all runs this checker");
check(JSON.parse(readFileSync(join(ROOT, "docs", "perf", "checkers-baseline.json"), "utf8")).checkers?.["check_landmarks.mjs"] > 0, "checkers-baseline.json records this checker");
const doc = readFileSync(join(ROOT, "docs", "consoles", "LANDMARKS.md"), "utf8") + readFileSync(join(ROOT, "docs", "consoles", "LANDMARKS-2.md"), "utf8");
for (const k of kinds) check(doc.includes(`\`${k}\``), `docs/consoles/LANDMARKS(-2).md lists ${k}`);

note(`kinds (desktop/phone triangles): ${budgetLine.join("; ")}`);
note(`maps drawing the kit: ${drawn.join("; ")}`);
note(`worst chunk meshes (full build, desktop) on maps with kit landmarks: ${worstChunk.join("; ")}`);
const kitCount = R.NP_PARISHES.reduce((s, p) => s + p.landmarks.filter((l) => L.lmKindOf(l)).length, 0), lmTotal = R.NP_PARISHES.reduce((s, p) => s + p.landmarks.length, 0);
check(kitCount >= 59, `59 or more landmarks draw with the kit (${kitCount} of ${lmTotal})`);
check(kinds.length >= 35, `35 or more kinds (${kinds.length})`);
console.log(`check_landmarks: ${kinds.length} kinds, ${kitCount} of ${lmTotal} landmarks on ${withKit.length} maps draw with the kit — ${passes} passed, ${failures} failed (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failures ? 1 : 0);
