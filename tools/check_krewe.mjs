/**
 * KREWE's parish kits, kiosks and side quests, held to what they declare (docs/consoles/KREWE.md).
 *
 *     node tools/check_krewe.mjs
 *
 *   - kits: the eleven kits the Bayou brief names exist in KW_BUDGET and KW_KIT_BUILDERS; every
 *     builder builds on a counting three.js stub; its triangles as drawn equal the declared `tri`
 *     (and kw-place.js's KW_TRI); mesh counts stay under the fleet's 45 ceiling (check_fleet holds
 *     meshes and footprints);
 *   - placement, per parish (all five np-data modules): deterministic; at least four kits in every
 *     parish; one draw call per kit at most and the triangles inside KW_DRESS_BUDGET on high and
 *     low; the engine's own worst-case estimate plus the dressing inside NP_BUDGET.triangles;
 *     boats on open water, streetcars on a road and only in Orleans, floodwalls and floodgates on a
 *     levee, every other kit on dry ground off every road;
 *   - kiosks: exactly the five ids; each at a SECONDLINE site that binds in its parish data; a
 *     mechanic of the twelve; gate stations that are union stations in CURRICULA (not classroom);
 *     safe-practice keys that exist; three or more own calls; a unique cosmetic and a kw-stamp;
 *     a GRIOT parish character of the kiosk's kind; the sandbag relay's Motor Pool drivable
 *     exists; a clean headless run (every safe call) earns the cosmetic and one unsafe call does not;
 *   - quests: ten, each lesson → union station → game, the lesson a BAYOU placeholder `by-<topic>`,
 *     the game a KREWE kiosk or a SECONDLINE side game in the same parish;
 *   - facts and tone: no digit, no fact-shaped word, no banned wording in any title, call or step;
 *   - wiring: the parishes app dresses the parish and lists the kiosks, the bundler carries the
 *     three modules, check_fleet holds the kits, check_all runs this checker; hygiene: kw/KW_
 *     prefixes, no three.js in the two pure modules.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; console.log(`  FAIL [${area}] ${msg}`); };
const check = (cond, area, msg) => (cond ? ok() : fail(area, msg));

class MemStore { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } clear() { this.m.clear(); } }
globalThis.localStorage = new MemStore();
globalThis.sessionStorage = new MemStore();

const imp = (p) => import(pathToFileURL(join(WEBXR, p)));
const KP = await imp("shared/kw-play-data.js");
const PL = await imp("shared/kw-place.js");
const NP = await imp("shared/np-parish.js");
const SL = await imp("shared/sl-parish-play.js");
const MX = await imp("shared/side-game-mechanics.js");
const SG = await imp("shared/side-games-data.js");
const G = await imp("shared/skill-gates.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const { GR_ROSTER } = await imp("shared/npc-data.js");
const { DV_DRIVABLES } = await imp("shared/drivables-data.js");

const UNION_STATIONS = new Set(CURRICULA.filter((c) => c.audience !== "classroom" && c.union).flatMap((c) => c.stations.map((s) => s.id)));
const FACTS = /\b(built|opened|founded|established|dedicated|acres|feet|miles|tall|population|century|anniversary|named after|oldest|largest|longest|first ever)\b/i;
const BANNED = /\b(gambl\w*|bet|wager|loot ?box\w*|purchase\w*|buy|kill\w*|shoot\w*|weapon\w*|blood|casino|jackpot)\b/i;
const clean = (where, text) => {
  check(!/\d/.test(String(text)), "facts", `${where}: states a figure`);
  check(!FACTS.test(text), "facts", `${where}: fact-shaped word "${String(text).match(FACTS)?.[0]}"`);
  check(!BANNED.test(text), "tone", `${where}: banned wording "${String(text).match(BANNED)?.[0]}"`);
};

// ------------------------------------------------------------ kits (a counting stub)
const WANT_KITS = ["streetcar", "pumpHouse", "leveeWall", "floodgate", "shrimpBoat", "oysterLugger", "shotgunBlock", "liveOak", "bandstand", "paradeBarriers", "ferryLanding", "kioskBoard", "sandbagStack"];
const dir = mkdtempSync(join(tmpdir(), "krewe-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch */ } });
writeFileSync(join(dir, "three.mjs"), `
class E { constructor(){this.x=0;this.y=0;this.z=0;this.order="XYZ";} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} }
class O { constructor(){this.children=[];this.userData={};this.position=new E();this.rotation=new E();this.scale=new E().set(1,1,1);this.name="";}
  add(c){this.children.push(c);c.parent=this;return this;} traverse(f){f(this);for(const c of this.children)c.traverse(f);} }
export class Group extends O {}
export class Mesh extends O { constructor(g,m){super();this.geometry=g;this.material=m;this.isMesh=true;} }
export class BoxGeometry { constructor(){this.tri=12;} }
export class CylinderGeometry { constructor(rt,rb,h,seg=20,hs=1,open=false){this.tri=seg*hs*2+(open?0:(rt>0?seg:0)+(rb>0?seg:0));} }
export class SphereGeometry { constructor(r,w=18,h=14){this.tri=2*w*h-2*w;} }
`);
writeFileSync(join(dir, "kit.mjs"), `import * as THREE from "./three.mjs";
const place = (parent, g, x, y, z, color) => { const m = new THREE.Mesh(g, { color }); m.position.set(x, y, z); parent.add(m); return m; };
export const box = (p, w, h, d, x, y, z, c) => place(p, new THREE.BoxGeometry(w, h, d), x, y, z, c);
export const cyl = (p, rt, rb, h, x, y, z, c, o = {}) => place(p, new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 20, 1, !!o.open), x, y, z, c);
export const ball = (p, r, x, y, z, c, o = {}) => place(p, new THREE.SphereGeometry(r, o.seg ?? 18, o.seg2 ?? 14), x, y, z, c);
`);
const kitSrc = rd("WebXR/shared/kw-kits.js")
  .replace(/from\s+"https:[^"]+three[^"]*"/, 'from "./three.mjs"')
  .replace(/from\s+"\.\/kit\.js"/, 'from "./kit.mjs"')
  .replace(/import\s*\{[^}]*\}\s*from\s*"\.\/kw-place\.js";/, "const kwPlacements = () => []; const KW_DRESS_BUDGET = {};");
writeFileSync(join(dir, "kw-kits.mjs"), kitSrc);
const KK = await import(pathToFileURL(join(dir, "kw-kits.mjs")));
{
  const B = KK.KW_BUDGET;
  for (const k of WANT_KITS) check(!!B[k], "kits", `no "${k}" kit in KW_BUDGET`);
  for (const [key, e] of Object.entries(B)) {
    const fn = KK.KW_KIT_BUILDERS[e.build];
    if (typeof fn !== "function") { fail("kits", `${key}: no builder ${e.build}`); continue; }
    let g; try { g = fn(null, 0, 0, 0, {}); } catch (err) { fail("kits", `${key}: build threw — ${err.message}`); continue; }
    let tri = 0, raw = 0; g.traverse((o) => { if (o.isMesh) { tri += o.geometry.tri; raw += 1; } });
    check(tri === e.tri, "kits", `${key}: draws ${tri} triangles, declared ${e.tri}`);
    check(PL.KW_TRI[key] === e.tri, "kits", `${key}: kw-place.js KW_TRI ${PL.KW_TRI[key]} is not KW_BUDGET's ${e.tri}`);
    check(e.meshes <= 45 && raw <= 45, "kits", `${key}: over the fleet's forty-five mesh ceiling`);
    check(tri <= 800, "kits", `${key}: ${tri} triangles is heavy for a kit drawn many times`);
    check(typeof PL.KW_CAPS[key] === "number", "kits", `${key}: no placement cap`);
  }
}

// ------------------------------------------------------------ placement in the five parishes
const PARISH_IDS = ["orleans", "jefferson", "st-bernard", "plaquemines", "st-tammany"];
const PARISHES = {};
for (const id of PARISH_IDS) {
  const m = await imp(`shared/np-data-${id}.js`);
  PARISHES[id] = Object.values(m).find((v) => v && Array.isArray(v.sites) && v.id === id);
  check(!!PARISHES[id], "place", `np-data-${id}.js exports no parish`);
}
const dressLines = [];
for (const [id, parish] of Object.entries(PARISHES)) {
  if (!parish) continue;
  const spots = PL.kwPlacements(parish);
  check(JSON.stringify(spots) === JSON.stringify(PL.kwPlacements(parish)), "place", `${id}: placements are not deterministic`);
  const cost = PL.kwDressCost(spots);
  const low = PL.kwDressCost(PL.kwPlacements(parish, { tier: "low" }));
  check(Object.keys(cost.byKit).length >= 4, "place", `${id}: only ${Object.keys(cost.byKit).length} kits placed (want four or more)`);
  check(cost.drawCalls <= PL.KW_DRESS_BUDGET.drawCalls, "budget", `${id}: ${cost.drawCalls} draw calls over ${PL.KW_DRESS_BUDGET.drawCalls}`);
  check(cost.triangles <= PL.KW_DRESS_BUDGET.triangles, "budget", `${id}: ${cost.triangles} triangles over ${PL.KW_DRESS_BUDGET.triangles}`);
  check(low.triangles <= cost.triangles, "budget", `${id}: the low tier draws more than high`);
  const engine = NP.npTriangleEstimate(parish, "high");
  check(engine + cost.triangles <= NP.NP_BUDGET.triangles, "budget", `${id}: engine ${engine} + dressing ${cost.triangles} over ${NP.NP_BUDGET.triangles}`);
  for (const [kit, n] of Object.entries(cost.byKit)) check(n <= PL.KW_CAPS[kit], "budget", `${id}: ${n} ${kit} over its cap`);
  for (const s of spots) {
    const where = `${id} ${s.kit} at ${s.x},${s.z}`;
    const w = NP.npWaterAt(parish, s.x, s.z);
    const cover = NP.npCoverAt(parish, s.x, s.z);
    check([s.x, s.z, s.y, s.ry].every(Number.isFinite), "place", `${where}: not a finite spot`);
    if (s.kit === "shrimpBoat" || s.kit === "oysterLugger") check(!!w && w.kind !== "wetland", "place", `${where}: a boat off open water`);
    else if (s.kit === "streetcar") { check(id === "orleans", "facts", `${where}: a streetcar outside Orleans`); check(cover === "road" || cover === "pad", "place", `${where}: a streetcar off the road (${cover})`); }
    else if (s.kit === "leveeWall" || s.kit === "floodgate") check(NP.npLeveeRise(parish, s.x, s.z) > 0.5 && (!w || w.kind === "wetland"), "place", `${where}: a floodwall off the levee`);
    else if (s.kit === "ferryLanding") check(!w, "place", `${where}: a ferry landing in the water`);
    else {
      // A site's pad is flattened over a levee (npHeightAt), so "levee" cover inside a pad is flat ground.
      const onPad = parish.sites.some((st) => Math.hypot(st.position[0] - s.x, st.position[1] - s.z) < NP.NP_PAD);
      check(!w && cover !== "road" && (cover !== "levee" || onPad), "place", `${where}: on ${cover}`);
    }
  }
  dressLines.push(`${id} ${cost.placements} kits / ${cost.drawCalls} draws / ${cost.triangles} tri`);
}

// ------------------------------------------------------------ a real build on the vendored three.js, with the engine
// kw-kits.js and kit.js import three.js from the CDN; copies here point them at WebXR/vendor/three.
{
  const threeUrl = pathToFileURL(join(WEBXR, "vendor/three/dist/three.module.min.js")).href;
  const cdn = /"https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/[^"]+"/g;
  writeFileSync(join(dir, "kit-real.mjs"), rd("WebXR/shared/kit.js").replace(cdn, JSON.stringify(threeUrl)));
  writeFileSync(join(dir, "kw-kits-real.mjs"), rd("WebXR/shared/kw-kits.js").replace(cdn, JSON.stringify(threeUrl))
    .replace(/from\s+"\.\/kit\.js"/, 'from "./kit-real.mjs"').replace(/from\s+"\.\/kw-place\.js"/, `from ${JSON.stringify(pathToFileURL(join(WEBXR, "shared/kw-place.js")).href)}`));
  const THREE = await import(threeUrl);
  const KR = await import(pathToFileURL(join(dir, "kw-kits-real.mjs")));
  const W = await imp("shared/np-world.js");
  for (const [id, parish] of Object.entries(PARISHES)) {
    if (!parish) continue;
    for (const tier of ["low", "high"]) {
      const root = new THREE.Group();
      const start = NP.npStartSite(parish);
      const world = W.npBuildParish(root, THREE, parish, { tier, start: start.position });
      let dress;
      try { dress = KR.kwDressParish(root, THREE, parish, { tier }); } catch (err) { fail("build", `${id}/${tier}: kwDressParish threw — ${err.message}`); continue; }
      const ds = dress.stats();
      check(ds.triangles === PL.kwDressCost(dress.spots).triangles, "build", `${id}/${tier}: built ${ds.triangles} triangles, kw-place.js counts ${PL.kwDressCost(dress.spots).triangles}`);
      check(ds.drawCalls <= PL.KW_DRESS_BUDGET.drawCalls, "build", `${id}/${tier}: ${ds.drawCalls} draw calls`);
      let worstMesh = 0, worstTri = 0;
      for (const s of [start, ...parish.sites]) { world.update(s.position[0], s.position[1], 999); const st = world.stats(); worstMesh = Math.max(worstMesh, st.meshes); worstTri = Math.max(worstTri, st.triangles); }
      // world.stats() walks the whole root, so it already counts the dressing.
      check(worstMesh <= NP.NP_BUDGET.drawCalls, "budget", `${id}/${tier}: ${worstMesh} meshes with the dressing, over ${NP.NP_BUDGET.drawCalls}`);
      check(worstTri <= NP.NP_BUDGET.triangles, "budget", `${id}/${tier}: ${worstTri} triangles with the dressing, over ${NP.NP_BUDGET.triangles}`);
      if (tier === "high") dressLines.push(`${id} worst ${worstMesh} meshes / ${worstTri} tri with the engine`);
    }
  }
}

// ------------------------------------------------------------ kiosks
const WANT_KIOSKS = ["kw-sandbag-relay", "kw-pump-startup", "kw-floodgate-closeout", "kw-container-sort", "kw-ferry-lineup"];
{
  const K = KP.KW_KIOSKS;
  check(K.length === 5 && WANT_KIOSKS.every((id) => K.some((k) => k.id === id)), "kiosks", `the kiosk ids are not exactly ${WANT_KIOSKS.join(", ")}`);
  check(KP.KW_GATED === K, "kiosks", "KW_GATED is not the kiosk list (check_gates discovers it)");
  const otherCosmetics = new Set([...SG.QM_SIDE_GAMES, ...SL.SL_SIDE_GAMES].map((g) => g.reward?.cosmetic));
  const seen = new Set();
  const siteKinds = new Set(GR_ROSTER.filter((c) => c.world === "parish").map((c) => c.siteKind));
  for (const k of K) {
    check(!!SL.slSiteDef(k.parish, k.site) && k.siteName === SL.slSiteName(k.parish, k.site), "kiosks", `${k.id}: site ${k.parish}/${k.site} is not a SECONDLINE site`);
    check(!!SL.slResolveSite(PARISHES[k.parish], k.site), "kiosks", `${k.id}: site does not bind in np-data-${k.parish}.js`);
    check(!!MX.QM_MECHANICS[k.mechanic], "kiosks", `${k.id}: mechanic ${k.mechanic} is not one of the twelve`);
    check(k.gate?.stations?.length > 0 && k.gate.note, "kiosks", `${k.id}: no gate stations or note`);
    for (const st of k.gate?.stations ?? []) check(UNION_STATIONS.has(st), "kiosks", `${k.id}: gate station ${st} is not a union station in curricula.js`);
    for (const p of k.practices) check(!!SG.QM_SAFE_PRACTICES[p], "kiosks", `${k.id}: practice ${p} unknown`);
    check((k.calls ?? []).length >= 3 && k.calls.every((c) => c.prompt && c.safe && c.unsafe && c.safe !== c.unsafe), "kiosks", `${k.id}: fewer than three calls or a call without two moves`);
    check(k.reward?.cosmetic && !otherCosmetics.has(k.reward.cosmetic) && !seen.has(k.reward.cosmetic), "kiosks", `${k.id}: cosmetic missing or not unique`);
    seen.add(k.reward?.cosmetic);
    check(k.reward?.stamp === `kw-stamp-${k.id.slice(3)}`, "kiosks", `${k.id}: stamp is not kw-stamp-<game>`);
    check(siteKinds.has(k.character), "kiosks", `${k.id}: no GRIOT parish character keyed by "${k.character}"`);
    check(!!KK.KW_BUDGET[k.kit.replace(/^kw/, "").replace(/^./, (c) => c.toLowerCase())], "kiosks", `${k.id}: kit ${k.kit} is not a KREWE kit`);
    if (k.drivable) check(DV_DRIVABLES.some((d) => d.id === k.drivable), "kiosks", `${k.id}: drivable ${k.drivable} is not in the Motor Pool`);
    clean(k.id, [k.title, k.summary, k.gate?.note, k.reward?.cosmetic, ...(k.calls ?? []).flatMap((c) => [c.prompt, c.safe, c.unsafe])].join(" "));
    // Headless: every safe call earns the reward; one unsafe call does not.
    const steps = MX.qmPlaySteps(k, SG.qmRounds(k));
    check(steps.length >= 3 + k.practices.length + 3 && steps.every((s) => s.options.filter((o) => o.safe).length === 1), "kiosks", `${k.id}: a step without exactly one safe move`);
    check(SG.qmRounds(k).filter((r) => r.key.startsWith("call-")).length === k.calls.length, "kiosks", `${k.id}: qmRounds leaves out the kiosk's own calls`);
    globalThis.localStorage.clear(); G.qmInvalidate();
    const bad = G.qmFinishGame(k, { score: steps.length - 1, of: steps.length });
    check(!bad.clean, "kiosks", `${k.id}: a run with one unsafe call counted as clean`);
    const good = G.qmFinishGame(k, { score: steps.length, of: steps.length });
    check(good.clean && good.cosmetic === k.reward.cosmetic, "kiosks", `${k.id}: a clean run did not earn the cosmetic`);
    check(KP.kwStampsEarned(G.qmSnapshot()).includes(k.reward.stamp), "kiosks", `${k.id}: a clean run did not earn the stamp`);
  }
  for (const [id, parish] of Object.entries(PARISHES)) {
    const gs = KP.kwGriotSites(parish);
    check(gs.length === KP.kwKiosksFor(id).length, "griot", `${id}: a kiosk has no GRIOT site`);
    for (const s of gs) check(s.id && s.name && s.kind && Array.isArray(s.position) && s.position.every(Number.isFinite), "griot", `${id}: ${s.id} is not in grMount's site shape`);
  }
}

// ------------------------------------------------------------ side quests
{
  const Q = KP.KW_QUESTS;
  check(Q.length === 10, "quests", `${Q.length} side quests, not ten`);
  check(new Set(Q.map((q) => q.id)).size === Q.length, "quests", "duplicate quest id");
  for (const q of Q) {
    check(/^kw-q-[a-z-]+$/.test(q.id), "quests", `${q.id}: id not kw-q-*`);
    check(!!SL.slSiteDef(q.parish, q.site), "quests", `${q.id}: site ${q.parish}/${q.site} unknown`);
    const types = q.steps.map((s) => s.type).join(",");
    check(types === "goto,lesson,station,game", "quests", `${q.id}: steps are ${types}, not goto → lesson → station → game`);
    const lesson = q.steps.find((s) => s.type === "lesson")?.lesson, station = q.steps.find((s) => s.type === "station")?.station, gameId = q.steps.find((s) => s.type === "game")?.game;
    check(/^by-[a-z-]+$/.test(lesson) && KP.KW_BAYOU_LESSONS.includes(lesson), "quests", `${q.id}: lesson ${lesson} is not a BAYOU placeholder by-<topic>`);
    check(UNION_STATIONS.has(station), "quests", `${q.id}: station ${station} is not a union station`);
    const game = KP.kwGameFor(gameId);
    check(!!game && game.parish === q.parish, "quests", `${q.id}: game ${gameId} does not resolve in ${q.parish}`);
    check(/^the [a-z ]+$/.test(q.giver), "quests", `${q.id}: giver is not a plain job title`);
    clean(q.id, [q.title, ...q.steps.map((s) => s.text)].join(" "));
  }
  check(new Set(Q.map((q) => q.steps[1].lesson)).size === Q.length, "quests", "two quests share a lesson");
  // The menu's quest board: a row per quest, a station link with the way back, the game named.
  globalThis.localStorage.clear(); G.qmInvalidate();
  let rows = 0;
  for (const id of PARISH_IDS) for (const r of KP.kwQuestBoard(id, { snap: G.qmSnapshot() })) {
    rows += 1;
    check(/from=parishes/.test(r.station.href) && r.game.title && !r.game.done && r.lesson.id.startsWith("by-"), "board", `${r.id}: board row lacks a station link, a game or its lesson slot`);
  }
  check(rows === Q.length, "board", `the quest boards show ${rows} rows for ${Q.length} quests`);
}

// ------------------------------------------------------------ wiring and hygiene
{
  const app = rd("WebXR/parishes/js/app.js");
  check(/kwDressParish\(/.test(app), "wiring", "parishes/js/app.js does not dress the parish (kwDressParish)");
  check(/kwKiosksFor\(/.test(app), "wiring", "parishes/js/app.js does not list the kiosks (kwKiosksFor)");
  check(/kwMountQuestBoard\(\$\("menu-krewe"\)/.test(app) && rd("WebXR/parishes/parishes.html").includes('id="menu-krewe"'), "wiring", "the parish menu does not mount the side-quest board");
  const bundle = rd("tools/bundle_webxr.py");
  const block = bundle.slice(bundle.indexOf('"parishes": {'), bundle.indexOf('"entry"', bundle.indexOf('"parishes": {')));
  for (const f of ["kw-play-data.js", "kw-place.js", "kw-kits.js"]) check(block.includes(`"${f}"`), "bundle", `the parishes bundle lacks ${f}`);
  check(block.indexOf('"sl-parish-play.js"') < block.indexOf('"kw-play-data.js"'), "bundle", "kw-play-data.js must follow sl-parish-play.js");
  check(/kw-kits\.js/.test(rd("tools/check_fleet.mjs")), "wiring", "check_fleet does not hold kw-kits.js");
  check(/check_krewe\.mjs/.test(rd("tools/check_all.mjs")), "wiring", "check_all does not run check_krewe.mjs");
  for (const f of ["kw-play-data.js", "kw-place.js", "kw-kits.js"]) {
    const src = rd(`WebXR/shared/${f}`);
    const names = [...src.matchAll(/^(?:export\s+)?(?:const|let|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    for (const n of names) check(/^(kw|KW_)/.test(n), "hygiene", `${f}: top-level ${n} lacks the kw/KW_ prefix`);
    if (f !== "kw-kits.js") check(!/THREE\.|from\s+["']https?:/.test(src), "hygiene", `${f}: a pure module touches three.js or a CDN`);
  }
}

console.log(failed
  ? `\n${failed} KREWE problem(s); ${passed} checks passed.`
  : `\nKREWE: ${passed} checks passed — ${Object.keys(KK.KW_BUDGET).length} kits, ${KP.KW_KIOSKS.length} kiosks, ${KP.KW_QUESTS.length} side quests; ${dressLines.join("; ")}.`);
process.exit(failed ? 1 : 0);
