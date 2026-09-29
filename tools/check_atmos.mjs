#!/usr/bin/env node
/**
 * check_atmos.mjs — ATMOS's weather, light and sound (console ATMOS, docs/consoles/ATMOS.md). Node, no browser:
 *   - weather is deterministic by seed and time (same seed same weather, another seed another; fronts ease in);
 *   - lamps switch at dusk and dawn (atLightsOn over the day; the mounted lamp mesh shows only when on);
 *   - fog never hides a site board within its read distance (every map, every hour, every weather, over water or not);
 *   - clear nights carry a moon and stars, storms darken the light, wet ground lingers after rain;
 *   - the audio graph builds headlessly against a stand-in AudioContext, is silent by default and under reduced motion;
 *   - budgets: a headless build (vendored three.js) of engine + CITYWORKS + TERRAFORM + ATMOS at sites of every map inside
 *     the parish's 260 meshes, ATMOS adding at most AT_BUDGET.meshes, the phone tier fewer lamps and no fog sheets.
 * Prints one line per claim and "check_atmos: N checks, M failed".
 */
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const S = (p) => import(pathToFileURL(join(ROOT, "WebXR/shared", p)).href);
const t0 = Date.now();
const { NP_PARISHES } = await S("np-parishes.js");
const np = await S("np-parish.js");
const A = await S("at-atmos.js");
const AS = await S("at-sound.js");

let checks = 0, failed = 0;
const fails = [];
function ok(cond, msg) { checks++; if (!cond) { failed++; if (fails.length < 40) fails.push(msg); } return cond; }

// ---------------------------------------------------------------- weather determinism
{
  let same = true, differs = 0, kinds = new Set(), smooth = true;
  for (const p of NP_PARISHES) {
    for (let h = 0; h < 24 * 7; h += 0.5) {
      const a = A.atWeather(p.id, h, 3), b = A.atWeather(p.id, h, 3), c = A.atWeather(p.id, h, 4);
      if (JSON.stringify(a) !== JSON.stringify(b)) same = false;
      if (JSON.stringify(a) !== JSON.stringify(c)) differs++;
      kinds.add(a.kind);
      const n = A.atWeather(p.id, h + 0.05, 3);
      if (Math.abs(n.storm - a.storm) > 0.1 || Math.abs(n.fog - a.fog) > 0.1) smooth = false;
    }
  }
  ok(same, "weather: the same seed and hour gave different weather");
  ok(differs > 0, "weather: another seed gave the same weather everywhere");
  ok(kinds.size === A.AT_KINDS.length, `weather: only ${[...kinds].join(", ")} occur over a week`);
  ok(smooth, "weather: a front switches in under 3 minutes instead of rolling in");
  console.log(`weather: deterministic by seed and hour over ${NP_PARISHES.length} maps × a week, ${differs} half-hours differ under another seed, all ${kinds.size} kinds occur, fronts ease in over an hour`);
}

// ---------------------------------------------------------------- dusk and dawn
{
  const on = [];
  for (let h = 0; h < 24; h += 0.25) on.push(A.atLightsOn(h));
  let switches = 0; for (let i = 0; i < on.length; i++) if (on[i] !== on[(i + 1) % on.length]) switches++;
  ok(switches === 2, `lights: ${switches} switches a day (want 2)`);
  ok(A.atLightsOn(A.AT_DUSK) && !A.atLightsOn(A.AT_DUSK - 0.25) && !A.atLightsOn(A.AT_DAWN) && A.atLightsOn(A.AT_DAWN - 0.25), "lights: not switching at AT_DUSK / AT_DAWN");
  ok(!A.atLightsOn(A.AT_BUCKET_HOUR.day) && !A.atLightsOn(A.AT_BUCKET_HOUR.dawn) && A.atLightsOn(A.AT_BUCKET_HOUR.dusk) && A.atLightsOn(A.AT_BUCKET_HOUR.night), "lights: the app's buckets do not map to off/off/on/on");
  console.log(`lights: on at ${A.AT_DUSK} h (dusk), off at ${A.AT_DAWN} h (dawn), 2 switches a day; buckets dawn/day off, dusk/night on`);
}

// ---------------------------------------------------------------- fog never hides a board
{
  let worst = Infinity, combos = 0, hidden = 0;
  for (const p of NP_PARISHES) for (let h = 0; h < 48; h += 1) for (const nearWater of [0, 1]) {
    const w = A.atWeather(p.id, h, 1, { nearWater: !!nearWater });
    const f = A.atFog({ weather: w, band: w.band, nearWater });
    combos++;
    if (A.atFogHides(f, A.AT_BOARD_READ)) hidden++;
    worst = Math.min(worst, f.far);
  }
  for (const kind of A.AT_KINDS) for (const band of ["dawn", "day", "dusk", "night"]) {
    const w = { fog: 1, rain: 1, storm: 1 }, f = A.atFog({ weather: w, band, nearWater: 1 });
    combos++; if (A.atFogHides(f, A.AT_BOARD_READ)) hidden++; worst = Math.min(worst, f.far);
  }
  const thick = A.atFog({ weather: { fog: 1, rain: 0, storm: 0 }, band: "night", nearWater: 1 }), clear = A.atFog({ weather: { fog: 0, rain: 0, storm: 0 }, band: "day" });
  ok(hidden === 0, `fog: ${hidden} of ${combos} combinations hide a board at ${A.AT_BOARD_READ} m`);
  ok(thick.far < clear.far * 0.2, "fog: a fog bank over water is not much thicker than a clear day");
  console.log(`fog: ${combos} map × hour × water × weather combinations, none hides a board at its ${A.AT_BOARD_READ} m read distance (nearest fog far ${worst} m; a fog bank over water ${thick.far} m vs clear ${clear.far} m)`);
}

// ---------------------------------------------------------------- moon, stars, storms, wet ground
{
  let clearNight = 0, starry = 0, stormDark = true, wetAfter = 0, rainSlots = 0;
  for (const p of NP_PARISHES) for (let h = 0; h < 24 * 14; h += 1) {
    const w = A.atWeather(p.id, h, 1);
    if (w.kind === "clear" && w.band === "night" && w.next === "clear") { clearNight++; if (w.stars > 0.5 && w.moon > 0.5) starry++; }
    if (w.storm >= 1 && A.atDarken(w) > 0.55) stormDark = false;
    if ((w.kind === "rain" || w.kind === "storm")) { const after = A.atWeather(p.id, (Math.floor(h / A.AT_SLOT) + 1) * A.AT_SLOT + 0.5, 1); rainSlots++; if (after.wet > 0.3) wetAfter++; }
  }
  ok(clearNight > 0 && starry === clearNight, `sky: ${starry} of ${clearNight} clear night hours carry a moon and stars`);
  ok(stormDark && A.atDarken({ cloud: 0, storm: 0 }) === 1, "sky: a full storm does not darken the light to 0.55 or below");
  ok(rainSlots > 0 && wetAfter === rainSlots, `wet: ${wetAfter} of ${rainSlots} rain hours leave the ground wet the slot after`);
  console.log(`sky: moon and stars on all ${clearNight} clear night hours; a storm front darkens light to ${A.atDarken({ cloud: 1, storm: 1 })}; wet ground lingers after all ${rainSlots} rain hours`);
}

// ---------------------------------------------------------------- the soundscape (headless, stand-in AudioContext)
{
  let made = 0;
  class Param { constructor(v = 0) { this.value = v; } }
  class Node { constructor() { made++; } connect() {} start() {} }
  class FakeCtx {
    constructor() { this.sampleRate = 8000; this.destination = {}; }
    createGain() { const n = new Node(); n.gain = new Param(1); return n; }
    createBiquadFilter() { const n = new Node(); n.frequency = new Param(); n.Q = new Param(); return n; }
    createOscillator() { const n = new Node(); n.frequency = new Param(); return n; }
    createBufferSource() { return new Node(); }
    createBuffer(ch, len) { const d = new Float32Array(len); return { getChannelData: () => d }; }
    resume() {}
  }
  const s = AS.atMountSound({ AudioContext: FakeCtx });
  const g = s.graph();
  ok(!!g && Object.keys(g.voices).join() === AS.AT_VOICES.join(), "sound: the graph lacks a voice");
  ok(s.master() === 0 && !s.enabled(), "sound: not silent by default");
  s.update({ wind: 1, rain: 1, water: 1, traffic: 1, birds: 1, crickets: 1, horn: 1 }, 1);
  ok(s.master() === 0, "sound: an update made it audible while muted");
  ok(s.setEnabled(true) && s.master() === AS.AT_MASTER, "sound: the toggle does not turn it on");
  s.setEnabled(false); ok(s.master() === 0, "sound: the toggle does not mute it again");
  const r = AS.atMountSound({ AudioContext: FakeCtx, reduced: true });
  r.graph(); ok(r.setEnabled(true) === false && r.master() === 0, "sound: audible under reduced motion");
  const p = NP_PARISHES[0], near = { water: 1, arterial: 1, port: 1 };
  const night = A.atSoundMix({ hour: 23, near }), day = A.atSoundMix({ hour: 12, near }), storm = A.atSoundMix({ hour: 12, weather: { rain: 1, storm: 1, fog: 0 }, near });
  ok(day.birds > 0 && night.birds === 0 && night.crickets > 0 && day.crickets === 0, "sound: birds by day and crickets by night do not hold");
  ok(storm.rain === 1 && storm.wind > day.wind && day.traffic > 0 && day.water > 0 && day.horn > 0, "sound: rain, wind, traffic, water or the port horn does not follow its cause");
  const far = A.atSoundMix({ hour: 12, near: { water: 0, arterial: 0, port: 0 } });
  ok(far.water === 0 && far.traffic === 0 && far.horn === 0, "sound: water, traffic or a horn far from any");
  const nn = A.atNearness(p, 0, 0); ok(nn.water >= 0 && nn.water <= 1 && nn.arterial >= 0 && nn.arterial <= 1, "sound: nearness out of 0..1");
  console.log(`sound: graph of ${AS.AT_VOICES.length} synthesised voices (${made} Web Audio nodes, no audio files) builds headlessly; silent by default and under reduced motion; birds by day, crickets by night, rain/wind/water/traffic/horn follow their causes`);
}

// ---------------------------------------------------------------- headless build + budgets
{
  const THREE = await import(pathToFileURL(join(ROOT, "WebXR/vendor/three/dist/three.module.min.js")).href);
  const W = await S("np-world.js"), TW = await S("tf-world.js"), CW = await S("cw-streets-world.js"), CWC = await S("cw-cityworks.js"), AW = await S("at-world.js");
  let worst = 0, worstMap = "", atM = { low: 0, high: 0 }, lampsT = { low: 0, high: 0 }, fogT = { low: 0, high: 0 }, switched = true, wetOk = true, still = true;
  for (const parish of NP_PARISHES) for (const tier of ["low", "high"]) {
    const root = new THREE.Group(), start = np.npStartSite(parish);
    const world = W.npBuildParish(root, THREE, parish, { tier, start: start.position, massFilter: CWC.cwMassFilter(parish) });
    const cw = CW.cwMountStreets({ THREE, root, parish, tier });
    const land = TW.tfMountTerraform({ THREE, root, parish, tier, reduced: false, waters: world.waters, trees: world.treeMaterial });
    TW.tfMountRain({ THREE, root, tier, reduced: false });
    const wetMats = []; cw.group.traverse((o) => { if (o.isMesh && /^cw-streets-/.test(o.name) && !wetMats.includes(o.material)) wetMats.push(o.material); });
    const at = AW.atMountAtmos({ THREE, root, parish, tier, reduced: false, massFilter: CWC.cwMassFilter(parish), siteLights: world.siteBoards, wetMaterials: [...wetMats, ...(world.roadMeshes ?? []).map((m) => m.material)] });
    for (const s of [start, ...parish.sites.slice(0, 3)]) {
      const [x, z] = s.position;
      world.update(x, z, 999); cw.update(x, z, 999); land.update(x, z, 99); at.update(x, z);
      let meshes = 0; root.traverse((o) => { if (o.isMesh || o.isLine || o.isPoints) meshes++; });
      if (meshes > worst) { worst = meshes; worstMap = `${parish.id}/${tier}`; }
      ok(meshes <= np.NP_BUDGET.drawCalls, `${parish.id}/${tier}: ${meshes} meshes with ATMOS over ${np.NP_BUDGET.drawCalls}`);
    }
    const c = at.counts();
    atM[tier] = Math.max(atM[tier], c.meshes); lampsT[tier] = Math.max(lampsT[tier], c.lamps); fogT[tier] = Math.max(fogT[tier], c.fogSheets);
    ok(c.meshes <= A.AT_BUDGET.meshes[tier], `${parish.id}/${tier}: ATMOS adds ${c.meshes} meshes`);
    ok(c.lamps <= A.AT_BUDGET.lamps[tier], `${parish.id}/${tier}: ${c.lamps} lamps over the cap`);
    at.set({ hour: 12, weather: A.atWeather(parish.id, 12, 1) }); const dayOn = at.counts().lampsLit;
    at.set({ hour: 21, weather: { fog: 1, rain: 0, storm: 0, wet: 0.9 } }); const nightOn = at.counts().lampsLit, fogShown = at.counts().fogShown, wet = at.counts().wet;
    if (dayOn !== 0 || (c.lamps > 0 && nightOn !== c.lamps)) switched = false;
    if (tier === "high" && c.fogSheets > 0 && !fogShown) switched = false;
    if (!(wet === 0.9 && at.counts().wetMaterials > 0)) wetOk = false;
    if (tier === "high") {
      const stillAt = AW.atMountAtmos({ THREE, root: new THREE.Group(), parish, tier, reduced: true });
      stillAt.update(start.position[0], start.position[1]); stillAt.set({ hour: 21, weather: { fog: 1, rain: 0, storm: 0, wet: 0 } });
      const before = stillAt.fogBanks ? Array.from(stillAt.fogBanks.instanceMatrix.array.slice(0, 16)) : [];
      stillAt.animate(50, 0.016); const after = stillAt.fogBanks ? Array.from(stillAt.fogBanks.instanceMatrix.array.slice(0, 16)) : [];
      if (JSON.stringify(before) !== JSON.stringify(after)) still = false;
    }
  }
  ok(switched, "lamps: the lamp mesh is not hidden by day and shown at dusk (or fog sheets not shown in a fog bank)");
  ok(wetOk, "wet: the street materials do not take the wet sheen");
  ok(still, "reduced motion: the fog sheets drift");
  ok(lampsT.low < lampsT.high && fogT.low === 0, `phone tier: ${lampsT.low} lamps / ${fogT.low} fog sheets vs ${lampsT.high} / ${fogT.high}`);
  console.log(`lamps: windows, porches and site lights hidden by day, all lit at dusk; fog sheets shown in a fog bank; wet sheen on the street materials; reduced motion holds the fog still`);
  console.log(`budget: engine + CITYWORKS + TERRAFORM + ATMOS at up to 4 sites of ${NP_PARISHES.length} maps, worst ${worst} meshes (${worstMap}) of ${np.NP_BUDGET.drawCalls}; ATMOS adds ${atM.low} mesh (phone) / ${atM.high} (desktop); lamps ${lampsT.low} / ${lampsT.high}, fog sheets ${fogT.low} / ${fogT.high}`);
}

for (const f of fails) console.log(`  FAIL ${f}`);
console.log(`check_atmos: ${checks} checks, ${failed} failed (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
process.exit(failed ? 1 : 0);
