#!/usr/bin/env node
/**
 * ROBO-EXTERIORS (loop 10, docs/consoles/ROBO-EXTERIORS.md): shared/fx-exteriors.js gives each of the six robot sites a
 * generic building of its kind beside its pad. Proves, headless on the vendored three.js:
 *   - data: five kinds, every robot site mapped to one (6/6), pictogram-only signs (no text is ever drawn);
 *   - lots: every lot is clear of the pad and its warning zone, massing, site buildings and boards, roads and water, and
 *     inside the map; the door faces the pad and the walk from the pad to the door is open;
 *   - budgets: meshes and triangles per site per tier inside FX_BUDGET, the phone kit the cheapest (one mesh, no skin);
 *     the site's chunk with FACADES' details and this kit inside FC_BUDGET per tier; the full streamed build at every
 *     robot site inside the engine's budget (meshes = draw calls, triangles), before (no kit) -> after (kit), per tier;
 *   - night: lit windows on from ATMOS's dusk to dawn, off by day; scenes: two establishing shots per site (12);
 *   - ENV-HD-5: the non-robot scenes add the busiest park, fire station, hospital and school (the four busiest kinds by
 *     catalog stations without a preset; generic labels), two shots each: 18 -> 26 presets;
 *   - determinism, and the page and bundle wiring.
 *
 *     node tools/check_exteriors.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } return ok; };
const note = (msg) => console.log(`  · ${msg}`);
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const t0 = performance.now();

const THREE = await imp("vendor/three/dist/three.module.min.js");
const E = await imp("shared/np-parish.js");
const R = await imp("shared/np-parishes.js");
const W = await imp("shared/np-world.js");
const CW = await imp("shared/cw-cityworks.js");
const F = await imp("shared/fc-facades.js");
const RD = await imp("shared/rb-robotics-data.js");
const AT = await imp("shared/at-atmos.js");
const FX = await imp("shared/fx-exteriors.js");
const SRC = readFileSync(join(WEBXR, "shared/fx-exteriors.js"), "utf8");
const TIERS = ["low", "balanced", "high"];

// 1. data
const kinds = Object.keys(FX.FX_KINDS);
check(kinds.length === 5, `${kinds.length} building kinds: ${kinds.join(", ")}`);
const mapped = RD.RB_SITES.filter((s) => FX.FX_KINDS[FX.FX_SITE_KIND[s.id]]);
check(mapped.length === RD.RB_SITES.length && RD.RB_SITES.length === 6, `robot sites with a dedicated exterior kit: ${mapped.length} of ${RD.RB_SITES.length}`);
check(Object.keys(FX.FX_SITE_KIND).every((id) => RD.RB_SITES.some((s) => s.id === id)), "every kit names a real robot site");
check(kinds.every((k) => Object.values(FX.FX_SITE_KIND).includes(k)), "every kind is used by at least one site");
check(!/fillText|strokeText|\.font\s*=/.test(SRC), "no text is drawn anywhere in the kit: the safety signs are pictograms only");
check(Object.keys(FX.FX_PICTOGRAMS).every((id) => new RegExp(`id === "${id}"`).test(SRC)), `${Object.keys(FX.FX_PICTOGRAMS).length} pictograms, each one painted`);
check(!/https?:\/\/|\.glb|\.gltf|\.png|\.jpg|new Image\(|fetch\(/.test(SRC), "procedural only: no URL, model file, image file or fetch");
check(!/NP_MASSING_HOOKS|fcDetails\s*=/.test(SRC.replace(/^\s*\*.*$/gm, "")), "registers beside FACADES: never touches NP_MASSING_HOOKS or fcDetails");
check(FX.FX_BUDGET.meshesPerSite.low <= FX.FX_BUDGET.meshesPerSite.balanced && FX.FX_BUDGET.textureBytes.low === 0, "the phone budget is the smallest (and carries no texture)");

// 2. lots
const maps = [...new Set(RD.RB_SITES.map((s) => s.parish))];
const layouts = [];
for (const id of maps) {
  const p = R.npParish(id);
  for (const l of FX.fxLayoutsFor(p)) layouts.push([p, l]);
}
check(layouts.length === 6, `${layouts.length} lots laid out over ${maps.length} maps`);
const inBox = (b, x, z, m = 0) => x > b.min[0] - m && x < b.max[0] + m && z > b.min[2] - m && z < b.max[2] + m;
for (const [p, l] of layouts) {
  check(l.clear, `${l.id}: the lot is clear (${l.kind}, ${l.dir} of the pad, gap ${l.gap} m)`);
  const [px, , pz] = l.pad;
  const near = [];
  const { cx, cz } = E.npChunkOf(l.x, l.z);
  for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) near.push(...CW.cwColliders(p, `${cx + dx},${cz + dz}`));
  for (const b of l.boxes) {
    check(!near.some((o) => b.min[0] < o.max[0] && b.max[0] > o.min[0] && b.min[2] < o.max[2] && b.max[2] > o.min[2]), `${l.id}: ${b.kind} box overlaps no massing or site building collider`);
    check(!inBox(b, px, pz, RD.RB_SSM.warn), `${l.id}: ${b.kind} box keeps out of the pad's warning zone`);
    check(Math.abs(b.min[0]) < E.NP_SIZE / 2 && Math.abs(b.max[2]) < E.NP_SIZE / 2, `${l.id}: inside the map`);
    let wet = 0; for (const u of [0.1, 0.5, 0.9]) for (const v of [0.1, 0.5, 0.9]) if (E.npWaterAt(p, b.min[0] + u * (b.max[0] - b.min[0]), b.min[2] + v * (b.max[2] - b.min[2]))) wet++;
    check(wet === 0, `${l.id}: ${b.kind} box stands on dry ground`);
  }
  // the door faces the pad, its outside spot is open, and the walk from the pad to it crosses no solid
  const [ox, oz] = l.door.out;
  check(Math.hypot(ox - px, oz - pz) < Math.hypot(l.x - px, l.z - pz), `${l.id}: the door (${l.door.face} face) is on the side facing the pad`);
  const solids = [...near, ...FX.fxColliders(p)];
  check(!solids.some((b) => inBox(b, ox, oz)), `${l.id}: the door's outside spot is open`);
  // the approach (straight, or an L round a corner) re-checked here against every building collider and the kit's own solids
  const path = l.approach ?? [];
  let blocked = 0, len = 0;
  for (let i = 1; i < path.length; i++) {
    const [ax, az] = path[i - 1], [bx, bz] = path[i], n = Math.ceil(Math.hypot(bx - ax, bz - az)); len += Math.hypot(bx - ax, bz - az);
    for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, z = az + (bz - az) * k / n; if (Math.hypot(x - px, z - pz) >= 3 && solids.some((b) => inBox(b, x, z, 0.3))) blocked++; }
  }
  const ends = path.length >= 2 && Math.hypot(path[0][0] - px, path[0][1] - pz) < 0.01 && Math.hypot(path.at(-1)[0] - ox, path.at(-1)[1] - oz) < 0.01;
  check(ends && blocked === 0, `${l.id}: the walk from the pad to the door is open (${path.length === 2 ? "straight" : "round one corner"}, ${len.toFixed(0)} m, ${blocked} blocked samples)`);
  check(JSON.stringify(FX.fxDoorFor(p, l.id)) === JSON.stringify(l.door), `${l.id}: fxDoorFor returns the lot's door`);
}

// 3. budgets per site and the chunk with FACADES
const perTier = { low: [], balanced: [], high: [] };
const worstChunk = { low: [0, ""], balanced: [0, ""], high: [0, ""] }; // ENV-HD-3: the worst robot-site chunk per tier (FACADES + kit meshes)
for (const [p, l] of layouts) {
  const counts = {}, chunkRow = [];
  for (const tier of TIERS) {
    const g = FX.fxBuildSite(THREE, l, tier), fx = g.userData.fx;
    counts[tier] = fx; perTier[tier].push(fx.triangles);
    check(fx.meshes <= FX.FX_BUDGET.meshesPerSite[tier], `${l.id}/${tier}: ${fx.meshes} meshes ≤ ${FX.FX_BUDGET.meshesPerSite[tier]}`);
    check(fx.triangles <= FX.FX_BUDGET.trianglesPerSite[tier], `${l.id}/${tier}: ${fx.triangles} triangles ≤ ${FX.FX_BUDGET.trianglesPerSite[tier]}`);
    check(g.children.every((o) => o.isMesh && !o.isInstancedMesh && o.material), `${l.id}/${tier}: merged meshes only`);
    // the whole kit is charged to every chunk it touches (the pad's and the lot's), on top of FACADES' details there
    const keys = [...new Set([E.npChunkOf(l.pad[0], l.pad[2]).key, E.npChunkOf(l.lot[0], l.lot[1]).key, E.npChunkOf(l.lot[2], l.lot[3]).key, E.npChunkOf(l.lot[0], l.lot[3]).key, E.npChunkOf(l.lot[2], l.lot[1]).key])];
    for (const key of keys) {
      const [cx, cz] = key.split(",").map(Number);
      const spots = E.npMassingForChunk(p, cx, cz).filter(CW.cwMassFilter(p));
      const det = spots.length ? F.fcDetails({ THREE, parish: p, chunk: { cx, cz, key, ring: 0, lod: 0 }, spots, tier }) : null;
      const dm = det?.userData.fc.meshes ?? 0, dt = det?.userData.fc.triangles ?? 0;
      check(dm + fx.meshes <= F.FC_BUDGET.meshesPerChunk[tier], `${l.id}/${tier}: chunk ${key} FACADES ${dm} + kit ${fx.meshes} meshes ≤ FC_BUDGET ${F.FC_BUDGET.meshesPerChunk[tier]}`);
      check(dt + fx.triangles <= F.FC_BUDGET.trianglesPerChunk[tier], `${l.id}/${tier}: chunk ${key} FACADES ${dt} + kit ${fx.triangles} triangles ≤ FC_BUDGET ${F.FC_BUDGET.trianglesPerChunk[tier]}`);
      chunkRow.push(`${tier} ${key} ${dm}+${fx.meshes} meshes / ${dt}+${fx.triangles} tris`);
      if (dm + fx.meshes > worstChunk[tier][0]) worstChunk[tier] = [dm + fx.meshes, `${l.id} ${key}`];
      det?.dispose();
    }
    g.dispose();
  }
  note(`${l.id} chunks (FACADES + kit vs FC_BUDGET ${F.FC_BUDGET.meshesPerChunk.low}/${F.FC_BUDGET.meshesPerChunk.high} meshes, ${F.FC_BUDGET.trianglesPerChunk.low}/${F.FC_BUDGET.trianglesPerChunk.high} tris): ${chunkRow.join("; ")}`);
  check(counts.low.meshes === 1 && counts.low.triangles < counts.balanced.triangles, `${l.id}: the phone kit is the cheapest (${counts.low.meshes} mesh / ${counts.low.triangles} tris vs balanced ${counts.balanced.meshes} / ${counts.balanced.triangles}, high ${counts.high.meshes} / ${counts.high.triangles})`);
}
check(worstChunk.high[0] < F.FC_BUDGET.meshesPerChunk.high, `worst robot-site chunk on high: ${worstChunk.high[0]} meshes (FACADES + kit), below FC_BUDGET ${F.FC_BUDGET.meshesPerChunk.high} (${worstChunk.high[1]})`);
note(`worst robot-site chunk, FACADES + kit meshes: low ${worstChunk.low[0]} (${worstChunk.low[1]}), balanced ${worstChunk.balanced[0]} (${worstChunk.balanced[1]}), high ${worstChunk.high[0]} (${worstChunk.high[1]})`);
note(`triangles per site: low ${perTier.low.join("/")}, balanced ${perTier.balanced.join("/")}, high ${perTier.high.join("/")}`);
note(`texture bytes per map (planned atlas + quarter-size glow mask, RGBA, mipmapped): low 0, balanced ${Math.round((512 ** 2 + 128 ** 2) * 4 * 4 / 3)}, high ${Math.round((1024 ** 2 + 256 ** 2) * 4 * 4 / 3)} (budget ${FX.FX_BUDGET.textureBytes.balanced} / ${FX.FX_BUDGET.textureBytes.high}; the browser drive measures the canvases drawn)`);
check((1024 ** 2 + 256 ** 2) * 4 * 4 / 3 <= FX.FX_BUDGET.textureBytes.high && (512 ** 2 + 128 ** 2) * 4 * 4 / 3 <= FX.FX_BUDGET.textureBytes.balanced, "the atlas sizes fit the stated texture budgets");

// 4. the full streamed build at every robot site, before (engine + FACADES) -> after (+ the kit), per tier
for (const id of maps) {
  const p = R.npParish(id);
  for (const tier of TIERS) {
    const root = new THREE.Group(), filt = CW.cwMassFilter(p), sites = FX.fxSitesFor(p);
    const world = W.npBuildParish(root, THREE, p, { tier, start: sites[0].position, massFilter: filt });
    const fx = FX.fxMountExteriors({ THREE, root, parish: p, tier, hour: 12 });
    let worst = { before: [0, 0], after: [0, 0] };
    for (const s of sites) {
      world.update(s.position[0], s.position[1], 999);
      let m = 0, t = 0, km = 0, kt = 0;
      root.traverse((o) => {
        if (!o.isMesh && !o.isLine && !o.isLineSegments) return;
        const g = o.geometry, tri = (g.index ? g.index.count : g.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1);
        m++; t += tri; let k = o; while (k && k.name !== "fx-exteriors") k = k.parent; if (k) { km++; kt += tri; }
      });
      worst.before = [Math.max(worst.before[0], m - km), Math.max(worst.before[1], Math.round(t - kt))];
      worst.after = [Math.max(worst.after[0], m), Math.max(worst.after[1], Math.round(t))];
    }
    check(worst.after[0] <= E.NP_BUDGET.drawCalls, `${id}/${tier}: full build worst ${worst.after[0]} meshes ≤ ${E.NP_BUDGET.drawCalls}`);
    check(worst.after[1] <= E.NP_BUDGET.triangles, `${id}/${tier}: full build worst ${worst.after[1]} triangles ≤ ${E.NP_BUDGET.triangles}`);
    note(`${id}/${tier}: full build at its robot sites, meshes (draw calls) / triangles: before ${worst.before[0]} / ${worst.before[1]} -> after ${worst.after[0]} / ${worst.after[1]} (kit ${fx.counts().meshes} / ${fx.counts().triangles})`);
    fx.dispose();
  }
}

// 5. night windows (ATMOS's clock) and the scenes
{
  const p = R.npParish("sf-downtown"), fx = FX.fxMountExteriors({ THREE, root: new THREE.Group(), parish: p, tier: "high", hour: 12 });
  const skin = fx.group.children[0].children.find((o) => o.name.startsWith("fx-skin"));
  check(!fx.counts().lit && skin.material.emissive.getHex() === 0, "by day the windows are dark");
  fx.setHour(21);
  check(fx.counts().lit && skin.material.emissive.getHex() !== 0 && AT.atLightsOn(21), "at night (21 h) the windows light, on ATMOS's clock");
  fx.setHour(AT.AT_DAWN + 0.5);
  check(!fx.counts().lit, `after ATMOS's dawn (${AT.AT_DAWN} h) they go dark again`);
  fx.dispose();
}
let shots = 0;
for (const [p, l] of layouts) for (const shot of FX.FX_SHOTS) {
  const s = FX.fxScene(p, l.id, shot), s2 = FX.fxScene(p, l.id, shot);
  const ok = s && [...s.position, ...s.target].every(Number.isFinite) && JSON.stringify(s) === JSON.stringify(s2);
  const d = s ? Math.hypot(s.position[0] - l.x, s.position[2] - l.z) : 0, dd = s ? Math.hypot(s.position[0] - l.door.x, s.position[2] - l.door.z) : 0;
  const framed = shot === "wide" ? d > 30 && s.position[1] > l.y + 10 : dd < 15 && Math.abs(s.position[1] - (s.target[1] - 0.5)) < 2.5;
  if (check(ok && framed, `${l.id}: the ${shot} shot is set (camera ${shot === "wide" ? d.toFixed(0) + " m from the building" : dd.toFixed(1) + " m from the door"}), deterministic`)) shots++;
}
check(shots === 12, `scene presets: ${shots} of 12`);
check(FX.fxScene(R.npParish("orleans"), "rb-site-soma-robot-cell", "wide") === null && FX.fxSiteParish("rb-site-soma-robot-cell") === "sf-downtown", "a scene asked on the wrong map is null and names its map");
// ENV-HD-3: two establishing shots for each of the three busiest non-robot sites (hd3-scenes.js), through the same handle
{
  const H = await imp("shared/hd3-scenes.js");
  const all = {};
  for (const p of R.NP_PARISHES) for (const s of p.sites ?? []) all[s.id] = { p, s, n: (s.stations ?? []).length };
  const robotAnchors = new Set(RD.RB_SITES.map((r) => r.anchor));
  const nonRobot = Object.values(all).filter((x) => !robotAnchors.has(x.s.id)).sort((a, b) => b.n - a.n);
  // ENV-HD-5: seven locations — ENV-HD-3's three (by "site": among the catalog's three busiest non-robot sites) and four by
  // "kind": the busiest site of each of the four busiest kinds (catalog stations) that had no preset, a tie of the busiest
  // count going to a map the "site" presets already open. Labels name the kind only (generic by kind, no site's own name).
  const bySite = H.HD3_SCENE_SITES.filter((x) => x.by === "site"), byKind = H.HD3_SCENE_SITES.filter((x) => x.by === "kind");
  check(H.HD3_SCENE_SITES.length === 7 && bySite.length === 3 && byKind.length === 4 && new Set(H.HD3_SCENE_SITES.map((x) => x.kind)).size === 7, `seven non-robot locations, seven kinds (${H.HD3_SCENE_SITES.map((x) => `${x.kind} by ${x.by}`).join(", ")})`);
  const kindStations = {};
  for (const x of Object.values(all)) kindStations[x.s.kind] = (kindStations[x.s.kind] ?? 0) + x.n;
  const nextKinds = Object.entries(kindStations).filter(([k]) => !bySite.some((x) => x.kind === k)).sort((a, b) => b[1] - a[1]).slice(0, 4);
  check(nextKinds.map(([k]) => k).sort().join() === byKind.map((x) => x.kind).sort().join(), `the four "kind" presets are the four busiest kinds without a preset: ${nextKinds.map(([k, n]) => `${k} ${n} stations`).join(", ")}`);
  const siteMaps = new Set(bySite.map((x) => x.parish));
  const GENERIC = new Set(["bridge", "yard", "port", "terminal", "construction", "site", "park", "crew", "fire", "station", "hospital", "campus", "school"]);
  for (const spec of H.HD3_SCENE_SITES) {
    const got = all[spec.id];
    check(!!got && got.p.id === spec.parish && got.s.kind === spec.kind && got.n === spec.stations && !robotAnchors.has(spec.id), `${spec.id}: a ${spec.kind} site on ${spec.parish} with ${got?.n} catalog stations, not a robot site`);
    const busiestOfKind = nonRobot.find((x) => x.s.kind === spec.kind);
    if (spec.by === "site") check(got && got.n >= nonRobot[2].n && got.n === busiestOfKind.n, `${spec.id}: among the busiest non-robot sites (${got?.n} stations; the busiest of its kind has ${busiestOfKind?.n}; third busiest overall ${nonRobot[2].n})`);
    else {
      const tied = nonRobot.filter((x) => x.s.kind === spec.kind && x.n === busiestOfKind.n);
      const onListed = tied.filter((x) => siteMaps.has(x.p.id));
      check(got && got.n === busiestOfKind.n && (onListed.length ? siteMaps.has(spec.parish) : true), `${spec.id}: the busiest ${spec.kind} site (${got?.n} stations; ${tied.length} tied${tied.length > 1 ? `, ${onListed.length} on a map already listed — ${spec.parish}` : ""})`);
    }
    const words = spec.label.toLowerCase().split(/[^a-z]+/).filter(Boolean);
    check(words.every((w) => GENERIC.has(w)), `${spec.id}: the label "${spec.label}" names the kind only (not "${got?.s.name}")`);
  }
  let hd3Shots = 0;
  for (const pr of H.hd3ScenePresets()) {
    const p = R.npParish(pr.parish), i = p.sites.findIndex((s) => s.id === pr.siteId), site = p.sites[i];
    const s = H.hd3Scene(p, pr.siteId, pr.shot), s2 = H.hd3Scene(p, pr.siteId, pr.shot);
    const ok = s && [...s.position, ...s.target].every(Number.isFinite) && JSON.stringify(s) === JSON.stringify(s2);
    const d = s ? Math.hypot(s.position[0] - s.target[0], s.position[2] - s.target[2]) : 0, gy = s ? E.npHeightAt(p, s.position[0], s.position[2]) : 0;
    const toSite = s ? Math.hypot(s.target[0] - site.position[0], s.target[2] - site.position[1]) : 99;
    const framed = pr.shot === "wide" ? d > 50 && s.position[1] > gy + 20 : d > 12 && d < 50 && Math.abs(s.position[1] - gy - 1.7) < 0.05;
    const dry = s && !E.npWaterAt(p, s.position[0], s.position[2]);
    if (check(ok && framed && dry && toSite < 20, `${pr.siteId}: the ${pr.shot} shot is set (camera ${d.toFixed(0)} m from the subject, ${(s?.position[1] - gy).toFixed(1)} m above the ground, dry), deterministic`)) hd3Shots++;
    if (pr.shot === "street") { // ENV-HD-5: the site's own wall does not fill the street shot's near side (the hospital's camera stood 8.3 m from it)
      let ob = null; try { ob = CW.cwSiteBuilding(p, i); } catch { ob = null; }
      const od = ob ? Math.hypot(Math.max(Math.abs(s.position[0] - ob.cx) - ob.w / 2, 0), Math.max(Math.abs(s.position[2] - ob.cz) - ob.d / 2, 0)) : 99;
      check(od >= 12, `${pr.siteId}: the street camera stands ${od.toFixed(1)} m from the site's own building (>= 12 m)`);
    }
  }
  check(H.hd3Scene(R.npParish("orleans"), "bridge-yard", "wide") === null && H.hd3Scene(R.npParish("orleans"), "port-terminal", "door") === null, "a non-robot scene asked on the wrong map, or for an unknown shot, is null");
  check(hd3Shots === 14, `non-robot scene presets: ${hd3Shots} of 14 (ENV-HD-3's 6 + ENV-HD-5's 8)`);
  note(`scene presets: 12 (ROBO-EXTERIORS, six robot sites x wide/door) -> 18 (ENV-HD-3) -> ${shots + hd3Shots} (ENV-HD-5) (+ ${H.HD3_SCENE_SITES.map((x) => `${x.label.toLowerCase()} on ${x.parish} (${x.stations} stations)`).join(", ")}, x ${H.HD3_SHOTS.join("/")})`);
  const appSrc = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
  check(/import\s*\{[^}]*\bhd3Scene\b[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/hd3-scenes\.js"/.test(appSrc) && /hd3Scene\(parish, siteId, shot\)/.test(appSrc) && /__parishTest\.scenePresets\s*=/.test(appSrc), "the app routes __parishTest.scene to the non-robot presets and lists every preset");
  const bsrc = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8"), ih = bsrc.indexOf('SHARED / "hd3-scenes.js"');
  check(ih > bsrc.indexOf('SHARED / "cw-cityworks.js"') && ih > bsrc.indexOf('SHARED / "np-parish.js"') && ih > 0, "the bundler lists hd3-scenes.js after its imports");
  const hsrc = readFileSync(join(WEBXR, "shared/hd3-scenes.js"), "utf8");
  const tops = [...hsrc.matchAll(/^(?:export\s+)?(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  check(tops.every((n) => /^(hd3|HD3_)/.test(n)) && !/import\s*\{[^}]*\bas\b/.test(hsrc), `hd3-scenes.js: every top-level name carries the hd3 prefix (${tops.length}), no import aliases`);
}

// 6. determinism
{
  const p = R.npParish("oak-west-oakland"), l = FX.fxLayoutsFor(p)[0];
  const a = FX.fxBuildSite(THREE, l, "high"), b = FX.fxBuildSite(THREE, l, "high");
  const sig = (g) => g.children.map((o) => `${o.name}:${o.geometry.attributes.position.count}:${Array.from(o.geometry.attributes.position.array.slice(0, 24)).map((v) => v.toFixed(3))}`).join("|");
  check(sig(a) === sig(b) && sig(a).length > 40, "the same site builds the same geometry twice");
  a.dispose(); b.dispose();
}

// 7. wiring
const app = readFileSync(join(WEBXR, "parishes/js/app.js"), "utf8");
check(/import\s*\{[^}]*\bfxMountExteriors\b[^}]*\}\s*from\s*"\.\.\/\.\.\/shared\/fx-exteriors\.js"/.test(app), "the parishes app imports fx-exteriors.js");
check(/fxMountExteriors\(\{/.test(app) && /__parishTest\.scene\s*=/.test(app) && /__parishTest\.exteriors\s*=/.test(app), "the app mounts the kit and exposes __parishTest.scene and .exteriors");
check(/fxColliders\(parish\)/.test(app) && /wkColliderSeam\([^;]*fxSolid/.test(app), "the app makes the buildings solid through WALKABLE's collider seam");
check(/fxWorld\?\.setHour\(atHour\)/.test(app), "the app hands the sky's hour to the lit windows");
check(/__parishTest\.threeScene\s*=\s*scene/.test(app) && /fxSceneHandle\[k\]\s*=/.test(app), "the old scene handle stays reachable (threeScene, and traverse/getObjectByName delegated)");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const irb = bundler.indexOf('SHARED / "rb-world.js"'), ifx = bundler.indexOf('SHARED / "fx-exteriors.js"');
check(irb > 0 && ifx > irb && bundler.indexOf('SHARED / "cw-cityworks.js"') < ifx && bundler.indexOf('SHARED / "at-atmos.js"') < ifx, "the bundler lists fx-exteriors.js after its imports");
const dist = join(WEBXR, "parishes/dist/parishes.html");
note(existsSync(dist) && readFileSync(dist, "utf8").includes("function fxMountExteriors") ? "the committed parishes bundle carries the kit" : "the committed parishes bundle predates the kit (run tools/bundle_webxr.py at integration)");

console.log(failures ? `\n${failures} ROBO-EXTERIORS check(s) failed, ${passes} passed (${((performance.now() - t0) / 1000).toFixed(1)} s).` : `\nROBO-EXTERIORS: all ${passes} checks pass (${((performance.now() - t0) / 1000).toFixed(1)} s).`);
process.exit(failures ? 1 : 0);
