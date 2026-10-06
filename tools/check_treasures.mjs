#!/usr/bin/env node
/**
 * Headless checks for the treasure layer (console TREASURE, docs/treasures.md):
 *
 *     node tools/check_treasures.mjs
 *
 * - counts: 120+ treasures, every surface the brief names at its floor
 * - every treasure has a reveal, a lesson and a source, and the lesson is
 *   re-read verbatim from that source (nothing invented)
 * - every set's members exist, and completing a set stamps its badge once
 * - the ledger is idempotent, persists, and is private per profile
 *   (GT_PROFILE_KEYS lists it; two storages never see each other's finds)
 * - gates: every station id exists; a fresh profile sees a gated treasure
 *   locked, a profile with the station passed finds it
 * - the Treasure Map model never leaks an unfound treasure (no id, name,
 *   hint, trigger or position)
 * - finders: the Guide's secret questions answer with the registry line; the
 *   DOM anchors exist on their pages; station plants sit inside reach; world
 *   markers sit inside their world's bounds; every app is wired and bundled
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`ok   ${name}`); } catch (e) { failures += 1; console.log(`FAIL ${name}\n     ${e.message}`); }
}
function assert(c, msg) { if (!c) throw new Error(msg); }

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}
// A browser-shaped global localStorage for profiles.js's gtStorage().
globalThis.localStorage = fakeStorage();
globalThis.sessionStorage = fakeStorage();

const D = await import(join(WEBXR, "shared/treasures-data.js"));
const Z = await import(join(WEBXR, "shared/treasures.js"));
const P = await import(join(WEBXR, "shared/profiles.js"));
const { CURRICULA } = await import(join(WEBXR, "smartcity/js/curricula.js"));
const { BAY_BOUNDS } = await import(join(WEBXR, "shared/bayworld-data.js"));
const { DEEP_BOUNDS } = await import(join(WEBXR, "shared/underwater-data.js"));
const { FAIRWAY_BOUNDS } = await import(join(WEBXR, "shared/fairway-data.js"));
const { SM_BOUNDS, SM_EGGS, SM_FIELD_LESSONS, smInLake } = await import(join(WEBXR, "shared/summit-data.js"));
const { RW_BOUNDS, rwIsWater } = await import(join(WEBXR, "redwood/js/rw-data.js"));
const { RW_EGGS, RW_FIELD_LESSONS } = await import(join(WEBXR, "redwood/js/rw-lore-data.js"));
const { PP_PROGRAMMES } = await import(join(WEBXR, "shared/passport-programmes.js"));
// The New Orleans parishes (SECONDLINE, docs/parish-play.md): site-relative triggers and field-lesson finds.
const SLP = await import(join(WEBXR, "shared/sl-parish-play.js"));
// The San Francisco districts on the parishes page (GOLDEN-B): their lessons and sites ride the same surface.
const SGP = await import(join(WEBXR, "shared/sg-sf-play.js"));
// PLAYLAYER's Bay Area maps (shared/pl-bay-play.js) ride the same surface on SG's shapes.
const PLP = await import("../WebXR/shared/pl-bay-play.js");
const sgSiteDef = (parish, site) => (SGP.sgDistrict(parish) ?? PLP.plDistrict(parish))?.sites.find((s) => s.id === site) ?? null;
// The programme worlds on the parishes page (console SMILES): the Unspoken Smiles District binds its treasures by exact site id.
const { NP_SM_UNSPOKEN_SMILES } = await import(join(WEBXR, "shared/np-data-sm-unspoken-smiles.js"));
const smilesSiteDef = (parish, site) => (parish === NP_SM_UNSPOKEN_SMILES.id ? NP_SM_UNSPOKEN_SMILES.sites.find((s) => s.id === site) ?? null : null);
const T = D.TZ_TREASURES;
const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));

const FLOORS = { home: 3, guide: 5, trades: 9, runner: 2, atlas: 1, arcade: 1, race: 1, bayworld: 10, deep: 10, regatta: 5, fairway: 5, summit: 15, redwood: 15, parishes: 40 };

await check(`at least 120 treasures, every surface at its floor (${T.length} total)`, () => {
  assert(T.length >= 120, `only ${T.length} treasures`);
  const ids = new Set();
  for (const t of T) { assert(!ids.has(t.id), `duplicate id ${t.id}`); ids.add(t.id); assert(t.id.startsWith("tz-"), `${t.id} lacks the tz- prefix`); }
  for (const [s, n] of Object.entries(FLOORS)) {
    const have = T.filter((t) => t.surface === s).length;
    assert(have >= n, `${s} has ${have} treasures, floor ${n}`);
  }
  for (const s of D.TZ_SURFACES) assert(s.count === T.filter((t) => t.surface === s.id).length, `TZ_SURFACES count drifted for ${s.id}`);
  const home = new Set(T.filter((t) => t.surface === "home").map((t) => t.how));
  for (const how of ["constellation", "keys", "clicks"]) assert(home.has(how), `the homepage has no ${how} treasure`);
  assert(T.some((t) => t.id === "tz-runner-tool-crib"), "no hidden tool in the tool crib");
  assert(T.some((t) => t.how === "records" && t.trigger.rule === "perfect"), "no perfect-run secret");
});

await check("every treasure has a reveal, a lesson and a source, re-read verbatim", () => {
  const unions = JSON.parse(rd("tools/unions.json")).unions;
  const standards = JSON.parse(rd("tools/standards.json")).standards;
  const cache = new Map();
  const text = (f) => { if (!cache.has(f)) cache.set(f, rd(f)); return cache.get(f); };
  for (const t of T) {
    assert(t.reveal && typeof t.reveal === "string", `${t.id} has no reveal`);
    assert(typeof t.lesson === "string" && t.lesson.length >= 12, `${t.id} has no lesson`);
    assert(t.source?.file && existsSync(join(ROOT, t.source.file)), `${t.id} names no real source file`);
    const s = t.source;
    if (s.union) assert(unions.find((u) => u.id === s.union)?.note === t.lesson, `${t.id}: lesson is not unions.json ${s.union}'s note`);
    else if (s.standard) assert(standards.find((u) => u.id === s.standard)?.title === t.lesson, `${t.id}: lesson is not standards.json ${s.standard}'s title`);
    else if (s.station) {
      const st = CURRICULA.flatMap((c) => c.stations).find((x) => x.id === s.station && x.why === t.lesson);
      assert(st, `${t.id}: lesson is not ${s.station}'s why in curricula.js`);
    } else assert(text(s.file).includes(`"${t.lesson}"`), `${t.id}: lesson is not a string in ${s.file}`);
    if (t.tool) assert(text(t.toolSource.file).includes(`note: "${t.tool}"`), `${t.id}: tool name is not a toolkit note`);
    assert(!/\d{4}s?\b.*(founded|established)/i.test(t.lesson), `${t.id} carries a founding claim`);
  }
});

await check("themed lessons: a station lesson's programme is one of its place's; no pooled why on a placed treasure", () => {
  const prog = new Map();
  for (const c of CURRICULA) for (const s of c.stations) if (!prog.has(s.id)) prog.set(s.id, c.id);
  let placed = 0;
  for (const t of T.filter((x) => x.source?.station)) {
    if (!t.place) continue; // the runner's tools and the Guide's lore have no place of their own
    assert(t.place.id && Array.isArray(t.place.stations), `${t.id}'s place is malformed`);
    const progs = new Set(t.place.stations.map((id) => prog.get(id)).filter(Boolean));
    if (!progs.size) continue; // a site with no stations at all cannot be judged
    placed += 1;
    assert(progs.has(prog.get(t.source.station)), `${t.id}: lesson station ${t.source.station} (${prog.get(t.source.station)}) is not in ${t.place.id}'s programmes ${[...progs].join(", ")}`);
  }
  assert(placed >= 60, `only ${placed} placed station lessons were judged`);
  for (const s of ["bayworld", "deep", "summit", "redwood", "race", "trades"]) assert(T.some((t) => t.surface === s && t.place), `${s} carries no placed lesson`);
  // The field-lesson treasures name their lesson and its world; the lesson is the field lesson's own trade line.
  const lessons = T.filter((t) => t.how === "lesson");
  assert(lessons.length >= 20, `only ${lessons.length} field-lesson treasures`);
  for (const t of lessons) {
    const l = (t.trigger.world === "summit" ? SM_FIELD_LESSONS : t.trigger.world === "parishes" ? [...SLP.SL_FIELD_LESSONS, ...SGP.SG_FIELD_LESSONS, ...PLP.PL_FIELD_LESSONS] : RW_FIELD_LESSONS).find((x) => x.id === t.trigger.lesson);
    assert(l, `${t.id} names unknown field lesson ${t.trigger.lesson} in ${t.trigger.world}`);
    assert(t.lesson === (l.tradeLine ?? l.trade), `${t.id}'s lesson is not the field lesson's trade line`);
    assert(t.set === "field-scholar" && t.place?.id, `${t.id} is not in the Field Scholar set with a place`);
  }
});

await check("sets: members exist, each set has 3+, completing one stamps its badge once", () => {
  assert(D.TZ_SETS.length >= 8, `only ${D.TZ_SETS.length} sets`);
  for (const s of D.TZ_SETS) {
    assert(s.members.length >= 3, `${s.id} has ${s.members.length} members`);
    for (const m of s.members) assert(Z.tzById(m)?.set === s.id, `${s.id} lists ${m}, which is not in it`);
    assert(s.badge && s.name, `${s.id} has no badge`);
  }
  const bells = D.TZ_SETS.find((s) => s.id === "harbour-bells");
  assert(bells?.members.length === 7, "the harbour bells are not seven");
  const st = fakeStorage();
  let last = null;
  for (const m of bells.members) last = Z.tzRecord(m, st);
  assert(last.completed.some((s) => s.id === "harbour-bells"), "the seventh bell did not complete the set");
  assert(Z.tzLoad(st).badges["harbour-bells"], "the set badge was not stamped");
  const again = Z.tzRecord(bells.members[0], st);
  assert(!again.added && again.completed.length === 0, "a repeat find re-stamped the badge");
});

await check("the ledger is idempotent, persists and is private per profile", () => {
  assert(P.GT_PROFILE_KEYS.includes(Z.TZ_KEY), "profiles.js GT_PROFILE_KEYS does not list the treasure ledger");
  const a = fakeStorage(); const b = fakeStorage();
  const id = T[0].id;
  assert(Z.tzRecord(id, a).added, "first find not added");
  assert(!Z.tzRecord(id, a).added, "second find added again");
  assert(Z.tzRecord("tz-not-a-treasure", a).added === false, "an unknown id was recorded");
  assert(JSON.parse(a.getItem(Z.TZ_KEY)).found[id], "the find is not persisted under the ledger key");
  assert(Z.tzFoundIds(b).length === 0, "a second profile's storage sees the first profile's find");
  // Through gtStorage(): the device profile and the demo tab are separate keys.
  Z.tzClear();
  Z.tzRecord(id);
  assert(Z.tzIsFound(id), "gtStorage() did not keep the find");
  P.gtEnterDemo();
  assert(!Z.tzIsFound(id), "the demo tab sees the device's treasures");
  Z.tzRecord(T[1].id);
  assert(sessionStorage.getItem(`${Z.TZ_KEY}::demo`), "the demo find did not land in sessionStorage");
  P.gtLeaveDemo({ discard: true });
  assert(Z.tzIsFound(id) && !Z.tzIsFound(T[1].id), "leaving the demo mixed the ledgers");
  Z.tzClear();
});

await check("gates: the shared engine answers; every id resolves; fresh profile locked, the completions open it", async () => {
  const gated = T.filter((t) => t.gate);
  assert(gated.length >= 5, `only ${gated.length} gated treasures`);
  assert(gated.length < T.length / 3, "most treasures should be pure exploration");
  // The gates are answered by shared/skill-gates.js, not a local reading of the records.
  const mod = rd("WebXR/shared/treasures.js");
  assert(/import \{[^}]*\bqmIsOpen\b[^}]*\} from "\.\/skill-gates\.js"/.test(mod) && mod.includes("qmMissing(gate,") && mod.includes("qmIsOpen(gate,"), "treasures.js does not answer its gates through skill-gates.js");
  assert(Array.isArray(D.TZ_GATED) && D.TZ_GATED.length === gated.length, "TZ_GATED does not list every gated treasure (check_gates.mjs discovers it)");
  for (const g of D.TZ_GATED) assert(Z.tzById(g.id)?.gate === g.gate || JSON.stringify(Z.tzById(g.id)?.gate) === JSON.stringify(g.gate), `TZ_GATED ${g.id} drifted from its treasure`);
  assert(gated.some((t) => t.gate.programmes?.length), "no treasure carries a programme gate");
  for (const t of gated) {
    assert(t.gate.note && t.gate.note.length > 10, `${t.id}'s gate has no note`);
    assert(!/\d/.test(t.gate.note), `${t.id}'s lock note carries a digit`);
    for (const s of t.gate.stations ?? []) assert(STATIONS.has(s), `${t.id} gates on unknown station ${s}`);
    for (const p of t.gate.programmes ?? []) assert(PP_PROGRAMMES[p.id], `${t.id} gates on unknown programme ${p.id}`);
    const st = fakeStorage();
    const locked = Z.tzFind(t.id, { storage: st, records: [], silent: true });
    assert(locked.locked && !locked.added && locked.missing.length, `${t.id} is open on a fresh profile`);
    assert(locked.missing.every((m) => m.kind && m.id && m.label), `${t.id}'s missing rows are not the engine's display rows`);
    // Exactly the required completions open it: each station at one star, a
    // programme's stations until its minStars (or all of them) are met.
    const recs = (t.gate.stations ?? []).map((simId) => ({ simId, stars: 1 }));
    for (const p of t.gate.programmes ?? []) {
      const prog = PP_PROGRAMMES[p.id];
      if (p.minStars) { let left = p.minStars; for (const s of prog.stations) { if (left <= 0) break; const n = Math.min(3, left); recs.push({ simId: s, stars: n }); left -= n; } }
      else for (const s of prog.stations) recs.push({ simId: s, stars: 1 });
    }
    const short = Z.tzFind(t.id, { storage: st, records: recs.slice(1), silent: true });
    assert(short.locked, `${t.id} opens one completion short`);
    const open = Z.tzFind(t.id, { storage: st, records: recs, silent: true });
    assert(!open.locked && open.added, `${t.id} stays locked with its completions in place`);
  }
  // Without injected records the engine reads the learner's own stores (through gtStorage()).
  const bell = gated.find((t) => t.gate.programmes?.length);
  Z.tzClear();
  assert(Z.tzFind(bell.id, { silent: true }).locked, "a fresh device profile finds the programme-gated capstone");
  const prog = PP_PROGRAMMES[bell.gate.programmes[0].id];
  localStorage.setItem("vr-training-records-v1", JSON.stringify(prog.stations.map((simId) => ({ simId, stars: 3 }))));
  assert(!Z.tzFind(bell.id, { silent: true }).locked, "the engine did not read the device records for the capstone");
  localStorage.removeItem("vr-training-records-v1");
  Z.tzClear();
  assert(Z.tzStationHref("valve-vault", "../").endsWith("smartcity/index.html?sim=valve-vault"), "folder-layout station link is wrong");
  assert(Z.tzStationHref("valve-vault", "./") === "./smartcity-x.html?sim=valve-vault", "flat-layout station link is wrong");
});

await check("the Treasure Map model never leaks an unfound treasure; the earlier eggs are counted read-only", async () => {
  const st = fakeStorage();
  const foundOne = T.find((t) => !t.gate);
  Z.tzRecord(foundOne.id, st);
  const m = Z.tzMapModel(st);
  const json = JSON.stringify(m);
  assert(m.count === 1 && m.total === T.length, "map counts are wrong");
  for (const t of T) {
    if (t.id === foundOne.id) continue;
    assert(!json.includes(`"${t.id}"`), `the map model names unfound ${t.id}`);
    if (!T.some((x) => x.id !== t.id && x.name === t.name)) assert(!json.includes(t.name), `the map model shows unfound ${t.name}`);
    assert(!json.includes(t.hint), `the map model shows ${t.id}'s hint`);
  }
  assert(!/"trigger"|"x":|"pos":|"hint"/.test(json), "the map model carries a trigger, position or hint");
  // The earlier egg layers are counted read-only from their own stores: the
  // totals match their registries, a find in a store counts, nothing is
  // copied into the treasure ledger and no egg id leaves the counts.
  const { HARD_HAT_TOTAL, IN_APP_EGGS } = await import(join(WEBXR, "shared/eggs.js"));
  const { EGG_QUESTS, FIELD_GUIDE_EGGS } = await import(join(WEBXR, "bayworld/js/quests.js"));
  const { DV_EGG_DIVES } = await import(join(WEBXR, "underwater/js/dives.js"));
  const totals = { "hard-hats": HARD_HAT_TOTAL, "field-notes": IN_APP_EGGS.length, "bay-eggs": EGG_QUESTS.length + FIELD_GUIDE_EGGS.length, "deep-lanterns": DV_EGG_DIVES.length, "summit-notes": SM_EGGS.length, "redwood-tins": RW_EGGS.length };
  const es = fakeStorage();
  const fresh = Z.tzEarlierEggs(es);
  for (const [id, n] of Object.entries(totals)) assert(fresh.find((e) => e.id === id)?.total === n && fresh.find((e) => e.id === id).found === 0, `earlier eggs: ${id} total ${n} expected on a fresh profile`);
  es.setItem("vr-training-hardhats-v1", JSON.stringify(["a", "b", "b"]));
  es.setItem("vr-training-egg-ledger-v1", JSON.stringify([{ id: IN_APP_EGGS[0].id, programme: "x" }, { id: IN_APP_EGGS[0].id, programme: "y" }, { id: "nope", programme: "x" }]));
  es.setItem("bayworld-quests-v1", JSON.stringify({ byId: { [EGG_QUESTS[0].id]: { done: true }, [EGG_QUESTS[1].id]: { done: false }, "bw-main-1": { done: true } } }));
  es.setItem("underwater-dives-v1", JSON.stringify({ byId: { [DV_EGG_DIVES[0].id]: { done: true }, [DV_EGG_DIVES[1].id]: { done: true } } }));
  es.setItem("summit-v1", JSON.stringify({ eggs: [SM_EGGS[0].id, "not-an-egg"] }));
  es.setItem("redwood-career-v1", JSON.stringify({ v: 1, found: [RW_EGGS[0].id, RW_EGGS[1].id, RW_EGGS[2].id] }));
  const seeded = Object.fromEntries(Z.tzEarlierEggs(es).map((e) => [e.id, e.found]));
  assert(seeded["hard-hats"] === 2 && seeded["field-notes"] === 1 && seeded["bay-eggs"] === 1 && seeded["deep-lanterns"] === 2 && seeded["summit-notes"] === 1 && seeded["redwood-tins"] === 3,
    `earlier eggs miscounted: ${JSON.stringify(seeded)}`);
  assert(!es.getItem(Z.TZ_KEY), "counting the earlier eggs wrote the treasure ledger");
  const ej = JSON.stringify(Z.tzEarlierEggs(es));
  for (const id of [...EGG_QUESTS, ...DV_EGG_DIVES, ...SM_EGGS, ...RW_EGGS, ...IN_APP_EGGS].map((e) => e.id)) assert(!ej.includes(`"${id}"`), `earlier eggs name ${id}`);
  const page = readFileSync(join(WEBXR, "treasures.html"), "utf8");
  assert(page.includes("tzMapModel") && page.includes("tzEarlierEggs()") && page.includes('id="tz-earlier"') && !/TZ_TREASURES|treasures-data/.test(page), "treasures.html reads more than the map model and the earlier-egg counts");
  assert(page.includes('class="home-chip') || page.includes("ctlMount("), "treasures.html has no Home chip");
  assert(page.includes("gdMount("), "treasures.html has no Guide");
  const acct = rd("WebXR/shared/account.js");
  assert(acct.includes("tzMapHref()") && acct.includes("gt-treasure-map"), "the account dialog does not link the Treasure Map");
  assert(existsSync(join(WEBXR, "dist", "treasures.html")), "WebXR/dist/treasures.html is missing — run python3 tools/bundle_webxr.py");
});

await check("finders: Guide secret questions, DOM anchors, plants in reach, world markers in bounds", () => {
  for (const t of T.filter((x) => x.how === "guide")) {
    const q = `tell me the secret of ${t.trigger.names[0]}`;
    const ans = Z.tzGuideLore(q);
    assert(ans?.matched && ans.text.includes(t.lesson) && ans.treasure === t.id, `the Guide does not answer "${q}" with ${t.id}`);
  }
  assert(Z.tzGuideLore("how do I lock out a panel") === null, "an ordinary question was taken as a secret");
  const pages = { home: ["WebXR/index.html", "WebXR/home.html"], atlas: ["WebXR/bayworld/atlas.html"] };
  for (const t of T.filter((x) => x.trigger?.anchor && pages[x.surface])) {
    for (const f of pages[t.surface]) {
      const html = rd(f);
      const ok = t.trigger.anchor.split(",").map((s) => s.trim()).some((sel) =>
        sel.startsWith("#") ? html.includes(`id="${sel.slice(1)}"`) : sel.startsWith(".") ? new RegExp(`class="[^"]*\\b${sel.slice(1)}\\b`).test(html) : html.includes(`<${sel}`));
      assert(ok, `${t.id}'s anchor ${t.trigger.anchor} is not on ${f}`);
    }
  }
  const sims = new Set(CURRICULA.flatMap((c) => c.stations.filter((s) => s.app === "smartcity").map((s) => s.id)));
  const rooms = rd("WebXR/shared/links.js");
  for (const t of T.filter((x) => x.how === "plant")) {
    const [app, id] = t.trigger.host.split("/");
    const [x, y, z] = t.trigger.pos;
    if (app === "smartcity") {
      assert(sims.has(id) && existsSync(join(WEBXR, "smartcity/js/sims", `${id}.js`)), `${t.id} is planted at unknown station ${id}`);
      assert(Math.hypot(x, z) <= 4.4 && y >= 0 && y <= 2.2, `${t.id} sits outside the roam circle's reach`);
    } else {
      assert(app === "trades" && rooms.includes(`"${id}"`) && existsSync(join(WEBXR, "trades/js/rooms", `${id}.js`)), `${t.id} is planted in unknown room ${id}`);
      assert(Math.hypot(x, z) <= 2 && y >= 0 && y <= 2, `${t.id} sits outside the room`);
    }
  }
  const bounds = { bayworld: BAY_BOUNDS, underwater: DEEP_BOUNDS, fairway: FAIRWAY_BOUNDS, regatta: BAY_BOUNDS, summit: SM_BOUNDS, redwood: RW_BOUNDS };
  // A parish treasure carries no coordinate: its trigger names the parish, one of
  // that parish's sites and a small offset, resolved at watch time by
  // slTreasureAt(parishData) (the site positions belong to np-data-<parish>.js).
  const parishTreasures = T.filter((x) => x.how === "proximity" && x.trigger.world === "parishes");
  assert(parishTreasures.length >= 40, `only ${parishTreasures.length} parish storm kit caches`);
  for (const t of parishTreasures) {
    const tr = t.trigger;
    assert(tr.x === undefined && tr.z === undefined, `${t.id} carries a coordinate; parish positions belong to PARISH's data`);
    assert(SLP.slSiteDef(tr.parish, tr.site) || sgSiteDef(tr.parish, tr.site) || smilesSiteDef(tr.parish, tr.site), `${t.id} names unknown parish site ${tr.parish}/${tr.site}`);
    assert(Number.isFinite(tr.dx) && Number.isFinite(tr.dz) && Math.hypot(tr.dx, tr.dz) >= 6 && Math.hypot(tr.dx, tr.dz) <= 25, `${t.id}'s offset is not a short walk off the site`);
    assert(tr.r > 0 && tr.r <= 25, `${t.id} has an odd radius`);
  }
  for (const p of SLP.SL_PARISHES) for (const s of p.sites) assert(parishTreasures.some((t) => t.trigger.parish === p.id && t.trigger.site === s.id), `${p.id}/${s.id} has no storm kit cache`);
  {
    // The resolver places a trigger at the bound site plus its offset, binds a renamed site by its match, and places nothing it cannot bind.
    const fake = { id: "orleans", sites: [{ id: "port-terminal", name: "Port Terminal", kind: "port", position: [100, -200] }, { id: "np-levee-yard", name: "Levee Yard", kind: "levee", position: [40, 60] }] };
    const at = SLP.slTreasureAt(fake);
    const port = parishTreasures.find((t) => t.trigger.parish === "orleans" && t.trigger.site === "port-terminal");
    const levee = parishTreasures.find((t) => t.trigger.parish === "orleans" && t.trigger.site === "levee-crew");
    const other = parishTreasures.find((t) => t.trigger.parish === "jefferson");
    const xz = Z.tzTriggerAt(port, at);
    assert(xz && xz[0] === 100 + port.trigger.dx && xz[1] === -200 + port.trigger.dz, "slTreasureAt does not place a site-relative trigger at the site plus its offset");
    const lz = Z.tzTriggerAt(levee, at);
    assert(lz && lz[0] === 40 + levee.trigger.dx, "slTreasureAt does not bind a renamed site by its match pattern");
    assert(Z.tzTriggerAt(other, at) === null, "slTreasureAt placed another parish's trigger");
    assert(Z.tzTriggerAt(parishTreasures.find((t) => t.trigger.site === "pumping-station" && t.trigger.parish === "orleans"), at) === null, "slTreasureAt placed a trigger at a site the data does not carry");
    assert(Z.tzTriggerAt({ trigger: { x: 3, z: 4 } }) [0] === 3, "tzTriggerAt ignores a trigger's own coordinates");
  }
  for (const t of T.filter((x) => x.how === "proximity" && x.trigger.world !== "parishes")) {
    const b = bounds[t.trigger.world];
    assert(b, `${t.id} names unknown world ${t.trigger.world}`);
    assert(t.trigger.x >= b.minX && t.trigger.x <= b.maxX && t.trigger.z >= b.minZ && t.trigger.z <= b.maxZ, `${t.id} sits outside ${t.trigger.world}'s bounds`);
    assert(t.trigger.r > 0 && t.trigger.r <= 25, `${t.id} has an odd radius`);
  }
  // Summit and Redwood keep their own field notes and tins: a treasure never
  // shares a spot with one (15 m apart at least) and never sits in the water.
  const eggAt = (e) => e.at ?? e.position ?? [e.x, e.z];
  for (const t of T.filter((x) => x.how === "proximity" && x.trigger.world === "summit")) {
    assert(!smInLake(t.trigger.x, t.trigger.z), `${t.id} sits in the lake`);
    for (const e of SM_EGGS) assert(Math.hypot(eggAt(e)[0] - t.trigger.x, eggAt(e)[1] - t.trigger.z) >= 15, `${t.id} sits on Summit field note ${e.id}`);
  }
  for (const t of T.filter((x) => x.how === "proximity" && x.trigger.world === "redwood")) {
    assert(!rwIsWater(t.trigger.x, t.trigger.z), `${t.id} sits in the water`);
    for (const e of RW_EGGS) assert(Math.hypot(eggAt(e)[0] - t.trigger.x, eggAt(e)[1] - t.trigger.z) >= 15, `${t.id} sits on Redwood field tin ${e.id}`);
  }
  for (const s of ["summit", "redwood"]) assert(D.TZ_SURFACES.some((x) => x.id === s && x.count >= 15), `the Treasure Map has no ${s} count`);
  assert(D.TZ_SURFACES.some((x) => x.id === "parishes" && x.count >= 40), "the Treasure Map has no parishes count");
  for (const p of SLP.SL_PARISHES) { const set = D.TZ_SETS.find((s) => s.id === `storm-kits-${p.id}`); assert(set && set.members.length === p.sites.length, `${p.id} has no complete storm-kit set`); }
  for (const d of SGP.SG_DISTRICTS) { const set = D.TZ_SETS.find((s) => s.id === `fog-kits-${d.id}`); assert(set && set.members.length === d.sites.length, `${d.id} has no complete fog-day kit set`); }
  for (const d of PLP.PL_DISTRICTS) { const set = D.TZ_SETS.find((s) => s.id === `bay-kits-${d.id}`); assert(set && set.members.length === d.sites.length, `${d.id} has no complete crew kit set`); }
  // tzWatchWorld takes the resolver and plants only what it can place (a headless three.js stand-in).
  {
    const src = rd("WebXR/shared/treasures.js");
    assert(/tzWatchWorld\(world, \{[^}]*\bat = null\b/.test(src) && src.includes("tzTriggerAt(t, at)") && src.includes("w.spots"), "tzWatchWorld does not take an `at` resolver for site-relative triggers");
  }
  // A cabinet round and a race finish find their treasure; a mirrored course counts as its original.
  const cab = T.find((x) => x.how === "arcade");
  const race = T.find((x) => x.how === "race");
  Z.tzClear();
  assert(Z.tzArcadeRound(cab.trigger.cabinet)?.added, "a finished cabinet round found nothing");
  assert(Z.tzRaceFinish(`${race.trigger.track}-mirror`)?.added, "a mirrored race finish found nothing");
  // A field lesson answered right is a quiet find; an unknown lesson finds nothing.
  const fl = T.find((x) => x.how === "lesson");
  assert(Z.tzLessonAnswered(fl.trigger.lesson)?.added && Z.tzIsFound(fl.id), "an answered field lesson found nothing");
  assert(Z.tzLessonAnswered("not-a-lesson") === null, "an unknown lesson found a treasure");
  // Without a pointer: a look-around key lists nearby markers as buttons (nothing watched headless → -1);
  // the constellation reads to a screen reader; reduced motion stops the marker spin.
  assert(Z.TZ_LOOK_KEY === "KeyL" && Z.tzLookAround() === -1, "tzLookAround is not the pointer-free finder");
  const modSrc = rd("WebXR/shared/treasures.js");
  assert(/tzArmLookKey\(key\)/.test(modSrc) && /"data-tz-look"/.test(modSrc), "tzWatchWorld does not arm the look-around key");
  assert(/function tzSpin[\s\S]{0,120}tzReducedMotion\(\)/.test(modSrc) && modSrc.includes("prefers-reduced-motion: reduce"), "tzSpin ignores prefers-reduced-motion");
  assert(!/tz-constellation"\); svg\.setAttribute\("viewBox", "0 0 150 90"\); svg\.setAttribute\("aria-hidden"/.test(modSrc) && modSrc.includes('c.setAttribute("role", "button"); c.setAttribute("tabindex", "0")'), "the constellation is not keyboard- and screen-reader-reachable");
  for (const f of ["WebXR/summit/js/app.js", "WebXR/redwood/js/app.js"]) assert(rd(f).includes('keys: ["L"]'), `${f} does not list the look-around key in its controls`);
  // The perfect run reads the records only.
  Z.tzCheckRecords([{ simId: "valve-vault", stars: 2, errors: 1, hazardHits: 0 }]);
  assert(!Z.tzIsFound("tz-runner-perfect"), "an imperfect run found the perfect-run secret");
  Z.tzCheckRecords([{ simId: "valve-vault", stars: 3, errors: 0, hazardHits: 0 }]);
  assert(Z.tzIsFound("tz-runner-perfect"), "a perfect run did not find the perfect-run secret");
  Z.tzClear();
});

await check("every surface is wired, bundled and registered", () => {
  const wires = [
    ["WebXR/shared/account.js", "tzArmPage()"], ["WebXR/shared/guide.js", "tzGuideLore(question)"],
    ["WebXR/smartcity/js/app.js", "tzPlantHost(root, THREE, `smartcity/${room.id}`)"], ["WebXR/trades/js/app.js", "tzPlantHost(root, THREE, `trades/${room.id}`)"],
    ["WebXR/bayworld/js/app.js", 'tzWatchWorld("bayworld"'], ["WebXR/underwater/js/app.js", 'tzWatchWorld("underwater"'],
    ["WebXR/regatta/js/app.js", 'tzWatchWorld("regatta"'], ["WebXR/fairway/js/app.js", 'tzWatchWorld("fairway"'],
    ["WebXR/arcade/js/app.js", "tzArcadeRound(aa.cabinet.id)"], ["WebXR/race/js/app.js", "tzRaceFinish(race.track.id)"],
    ["WebXR/summit/js/app.js", 'tzWatchWorld("summit"'], ["WebXR/redwood/js/app.js", 'tzWatchWorld("redwood"'],
    ["WebXR/summit/js/app.js", "tzLessonAnswered(l.id)"], ["WebXR/redwood/js/app.js", "tzLessonAnswered(fl.id)"],
  ];
  for (const [f, needle] of wires) assert(rd(f).includes(needle), `${f} never calls ${needle}`);
  for (const f of ["smartcity/dist/smartcity-x.html", "trades/dist/trade-skills-simulator.html", "bayworld/dist/bayworld.html", "underwater/dist/underwater.html",
    "regatta/dist/regatta.html", "fairway/dist/fairway.html", "arcade/dist/arcade.html", "race/dist/race.html", "bayworld/dist/atlas.html",
    "summit/dist/summit.html", "redwood/dist/redwood.html"]) {
    const p = join(WEBXR, f);
    assert(existsSync(p), `${f} is not built`);
    const html = readFileSync(p, "utf8");
    assert(html.includes("function tzWatchWorld") && html.includes("const TZ_TREASURES"), `${f} does not bundle the treasure layer — run python3 tools/bundle_webxr.py`);
    assert(html.includes("function qmIsOpen"), `${f} bundles the treasure layer without the gate engine — run python3 tools/bundle_webxr.py`);
  }
  for (const n of ["treasures.js", "treasures-data.js", "skill-gates.js", "passport-programmes.js"]) assert(existsSync(join(WEBXR, "dist", "shared", n)), `WebXR/dist/shared/${n} is missing`);
  // Shared chrome never spells the three.js global: the bundler would load
  // three.js on every flat page that carries the account chip. The library
  // comes from the caller as T3.
  assert(!/THREE\./.test(rd("WebXR/shared/treasures.js")), "treasures.js spells the three.js global; take the library from the caller as T3");
  const data = rd("WebXR/shared/treasures-data.js");
  for (const m of data.matchAll(/^(?:export )?(?:const|let|function|class) ([A-Za-z_$][\w$]*)/gm)) assert(/^tz|^TZ_/.test(m[1]), `treasures-data.js top-level ${m[1]} lacks the tz prefix`);
  const mod = rd("WebXR/shared/treasures.js");
  for (const m of mod.matchAll(/^(?:export )?(?:const|let|function|class) ([A-Za-z_$][\w$]*)/gm)) assert(/^tz|^TZ_/.test(m[1]), `treasures.js top-level ${m[1]} lacks the tz prefix`);
  assert(rd("tools/check_all.mjs").includes('"check_treasures.mjs"'), "check_all.mjs does not run check_treasures.mjs");
  assert(existsSync(join(ROOT, "docs", "treasures.md")), "docs/treasures.md is missing");
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll checks pass: ${T.length} treasures on ${D.TZ_SURFACES.length} surfaces, ${D.TZ_SETS.length} sets, ${T.filter((t) => t.gate).length} gated, nothing leaked.`);
process.exit(failures ? 1 : 0);
