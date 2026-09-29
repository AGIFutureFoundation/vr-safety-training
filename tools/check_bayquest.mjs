#!/usr/bin/env node
// BAYQUEST's checker (docs/consoles/BAYQUEST.md): the Bay Keeper's Trail, the four games, Crew Credits, the two
// businesses, the side stories and the DEAN template.
//
//   - every treasure's line is sourced (verbatim station why, or a facts line matching the facts file) and no
//     treasure sits on water or a road, 15 m clear of every other treasure;
//   - every game has a station gate that resolves and scores safe practice (all safe = clean, one unsafe = not);
//     the tidal dig scores spoil in a bin safe and spoil in the water unsafe on NEWTON bodies;
//   - credit arithmetic balances, payouts are once only, nothing reaches billing;
//   - every story branch ends at a real station or lesson; the DEAN template resolves.
//
//   node tools/check_bayquest.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const mem = {};
globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; }, clear() { for (const k in mem) delete mem[k]; } };
globalThis.sessionStorage = globalThis.localStorage;

let n = 0, failed = 0;
const groups = {};
function check(ok, group, msg) { n += 1; groups[group] = (groups[group] ?? 0) + 1; if (!ok) { failed += 1; console.log(`  FAIL [${group}] ${msg}`); } }

const { CURRICULA } = await imp("WebXR/smartcity/js/curricula.js");
const { SIMS_META } = await imp("WebXR/smartcity/js/sims-meta.js");
const catalog = JSON.parse(rd("WebXR/smartcity/catalog.json"));
const STATIONS = new Set(catalog.stations.map((s) => s.id));
const META = new Map(SIMS_META.map((m) => [m.id, m]));
const CURR_SRC = rd("WebXR/smartcity/js/curricula.js");
const WHY = new Map();
for (const c of CURRICULA) for (const s of c.stations) if (!WHY.has(s.id) && typeof s.why === "string") WHY.set(s.id, s.why);
const BW = await imp("WebXR/shared/bayworld-data.js");
const { TZ_TREASURES } = await imp("WebXR/shared/treasures-data.js");
const F = await imp("WebXR/shared/bq-facts.js");
const TR = await imp("WebXR/shared/bq-trail-data.js");
const GD = await imp("WebXR/shared/bq-games-data.js");
const SG = await imp("WebXR/shared/side-games-data.js");
const T = await imp("WebXR/shared/ty-economy.js");
const B = await imp("WebXR/shared/bq-bayquest.js");
const S = await imp("WebXR/shared/st-stories.js");
const DV = await imp("WebXR/shared/drivables-data.js");

// ------------------------------------------------------------ facts
const FACTS_FILE = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad/epa/epa-2026-facts.md";
const fold = (s) => s.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
{
  const factsSrc = fs.existsSync(FACTS_FILE) ? fold(fs.readFileSync(FACTS_FILE, "utf8")) : null;
  for (const f of F.BQ_FACTS) {
    check(/^https:\/\/www\.(epa\.gov|portofoakland\.com)\//.test(f.source), "facts", `${f.id}: cites the release or the port's page`);
    if (factsSrc) check(factsSrc.includes(fold(f.text)), "facts", `${f.id}: verbatim in the facts file`);
  }
  check(F.BQ_UNNAMED === "and twelve more projects across tidal marsh and wetland restoration, nutrient reduction, sediment management and fish habitat", "facts", "the twelve unnamed projects said the brief's way");
  console.log(`  facts: ${F.BQ_FACTS.length} lines${factsSrc ? " re-read against the facts file" : " (facts file not present: source links only)"}`);
}

// ------------------------------------------------------------ the trail
{
  const up = (() => { try { execFileSync(process.execPath, [path.join(ROOT, "tools/gen_bq_trail.mjs"), "--check"], { stdio: "pipe" }); return true; } catch (_) { return false; } })();
  check(up, "trail", "bq-trail-data.js is up to date with gen_bq_trail.mjs");
  check(TR.BQ_TRAIL.id === "bq-bay-keepers-trail" && TR.BQ_TRAIL.total === TR.BQ_TREASURES.length, "trail", "the set id and its total");
  check(TR.BQ_TREASURES.length >= 20, "trail", `${TR.BQ_TREASURES.length} treasures (need 20+)`);
  const others = TZ_TREASURES.filter((t) => t.trigger?.world === "bayworld").map((t) => [t.trigger.x, t.trigger.z]);
  const mine = [];
  const ids = new Set();
  for (const t of TR.BQ_TREASURES) {
    check(!ids.has(t.id) && /^bq-t-/.test(t.id), "trail", `${t.id}: a unique bq-t- id`); ids.add(t.id);
    check(!!BW.BAY_SITES.find((s) => s.id === t.site), "trail", `${t.id}: at a real Bay World site`);
    if (t.source.station) check(WHY.get(t.source.station) === t.lesson && CURR_SRC.includes(JSON.stringify(t.lesson)), "sourced", `${t.id}: lesson verbatim from ${t.source.station}'s why`);
    else { const f = F.bqFact(t.source.fact); check(!!f && f.text === t.lesson && t.source.page === f.source, "sourced", `${t.id}: lesson is facts line ${t.source.fact} with its page`); }
    const { x, z } = t.trigger;
    const water = BW.txWaterTopAt(x, z) !== null && BW.txQuayAt(x, z, 2) < 0;
    check(!water, "placement", `${t.id}: not on water (${x}, ${z})`);
    check(![[0, 0], [3, 0], [-3, 0], [0, 3], [0, -3]].some(([dx, dz]) => BW.bayRoadAt(x + dx, z + dz)), "placement", `${t.id}: not on a road (${x}, ${z})`);
    check([...others, ...mine].every(([ox, oz]) => Math.hypot(ox - x, oz - z) >= 15), "placement", `${t.id}: 15 m clear of every other treasure`);
    mine.push([x, z]);
  }
  // the rule itself bites: open water and a road centreline are both refused
  const wet = BW.TX_BAY_WATER.map(([cx, cz]) => [cx, cz]).find(([x, z]) => BW.txQuayAt(x, z, 2) < 0);
  check(!!wet && BW.txWaterTopAt(...wet) !== null, "placement", `the water test refuses open water (${wet})`);
  check(!!BW.bayRoadAt(...BW.BAY_ROADS[0].points[0]), "placement", "the road test refuses a road centreline");
  const stations = TR.BQ_TREASURES.filter((t) => t.source.station).map((t) => t.source.station);
  check(new Set(stations).size === stations.length, "sourced", "no station why used twice");
  // the find flow
  localStorage.clear();
  const first = B.bqFind(TR.BQ_TREASURES[0].id), again = B.bqFind(TR.BQ_TREASURES[0].id);
  check(first.ok && first.first && again.ok && !again.first && B.bqTrail().count === 1, "trail", "a find is recorded once");
  console.log(`  trail: ${TR.BQ_TREASURES.length} treasures (${stations.length} station lines, ${TR.BQ_TREASURES.length - stations.length} facts lines), none on water or a road`);
}

// ------------------------------------------------------------ games
{
  const want = ["bq-trash-capture-cleanout", "bq-rain-garden-build", "bq-tidal-channel-dig", "bq-zero-emission-yard-shuffle"];
  check(JSON.stringify(GD.BQ_GAME_IDS) === JSON.stringify(want), "games", "the four published game ids");
  check(GD.BQ_GATED === GD.BQ_GAMES, "games", "BQ_GATED is the games list (check_gates discovery)");
  for (const g of GD.BQ_GAMES) {
    check(g.gate?.stations?.length >= 1 && g.gate.stations.every((id) => STATIONS.has(id)), "gate", `${g.id}: a station gate that resolves (${g.gate.stations.join(", ")})`);
    check(!!g.gate.note && !/\d/.test(g.gate.note), "gate", `${g.id}: a lock note with no digit`);
    check(g.practices.length >= 3 && g.practices.every((k) => SG.QM_SAFE_PRACTICES[k]), "scoring", `${g.id}: three or more safe-practice calls`);
    const run = GD.bqGameRun(g);
    check(run.every((s) => s.options.length === 2 && s.options.filter((o) => o.safe).length === 1), "scoring", `${g.id}: every step has exactly one safe move`);
    const safe = GD.bqSafePicks(g), unsafe = safe.map((i) => 1 - i);
    const a = GD.bqGameScore(g, safe), b = GD.bqGameScore(g, unsafe), c = GD.bqGameScore(g, [unsafe[0], ...safe.slice(1)]);
    check(a.score === 100 && a.clean, "scoring", `${g.id}: all safe moves score 100, clean`);
    check(b.score === 0 && !b.clean, "scoring", `${g.id}: all unsafe moves score 0`);
    check(!c.clean && c.score < 100, "scoring", `${g.id}: one unsafe move is not a clean run`);
    check(!!g.reward?.cosmetic, "games", `${g.id}: a cosmetic reward`);
    const text = [g.title, g.summary, ...g.calls.flatMap((k) => [k.prompt, k.safe, k.unsafe])].join(" ");
    check(!/\d/.test(text), "facts", `${g.id}: no digits in its text`);
    check(!/\b(injur\w*|blood|die|death|kill\w*)\b/i.test(text), "tone", `${g.id}: no injury or fear framing`);
  }
  const dig = B.bqTidalDig({ swings: [[6, 0], [-3, 0], [2, 0]] });
  check(dig.landed[0].inBin && !dig.landed[0].inWater, "physics", "tidal dig: spoil swung to the bin lands in the bin");
  check(dig.landed[1].inWater && !dig.landed[1].inBin, "physics", "tidal dig: spoil dropped at the channel lands in the water (unsafe)");
  check(dig.safe === 1 && dig.total === 3, "physics", "tidal dig: only the bin drop scores safe");
  const dvIds = new Map((DV.DV_DRIVABLES ?? DV.DRIVABLES ?? []).map((d) => [d.id, d]));
  const yard = GD.bqGame("bq-zero-emission-yard-shuffle");
  check(dvIds.size === 0 || dvIds.has(yard.drivables.fallback), "games", `yard shuffle: fallback drivable ${yard.drivables.fallback} resolves`);
  check(B.bqYardDrivable((id) => dvIds.get(id) ?? null)?.id === (dvIds.size ? yard.drivables.fallback : undefined), "games", "yard shuffle: picks CLEANPORTS' drivable when present, the fallback otherwise");
}

// ------------------------------------------------------------ credits
{
  localStorage.clear();
  const b0 = T.tyLedger().balance;
  const s1 = B.bqEarnStation("br-trash-capture-device-service", { level: 1 });
  const s2 = B.bqEarnStation("br-trash-capture-device-service", { level: 1 });
  const s3 = B.bqEarnStation("receiving-dock-food", { level: 1 });
  const g1 = B.bqEarnGame("bq-rain-garden-build", 100);
  const g2 = B.bqEarnGame("bq-rain-garden-build", 100);
  const g3 = B.bqEarnGame("bq-tidal-channel-dig", 75);
  const g4 = B.bqEarnGame("bq-trash-capture-cleanout", 40);
  check(s1.paid && s1.amount === T.tyPayFor(1), "credits", `a Bay Program station pays ${T.tyPayFor(1)}`);
  check(!s2.paid && s2.duplicate, "credits", "a station pays once");
  check(!s3.paid, "credits", "a station outside the Bay Program is not paid by BAYQUEST");
  check(g1.paid && g1.amount === T.tyPayFor(3) && !g2.paid, "credits", `a clean game pays ${T.tyPayFor(3)}, once`);
  check(g3.paid && g3.amount === T.tyPayFor(1), "credits", `a passing game pays ${T.tyPayFor(1)}`);
  check(!g4.paid, "credits", "a run under the pass mark pays nothing");
  const L = T.tyLedger();
  const sum = L.entries.reduce((a, e) => a + (e.amount ?? 0), 0);
  check(L.balance === b0 + s1.amount + g1.amount + g3.amount, "credits", `balance ${L.balance} = ${b0} + ${s1.amount} + ${g1.amount} + ${g3.amount}`);
  check(sum === L.balance - b0, "credits", "the ledger entries sum to the balance");
  check(L.currency === "Crew Credits", "credits", "paid in Crew Credits");
  for (const f of ["WebXR/shared/bq-bayquest.js", "WebXR/shared/bq-games-data.js", "WebXR/shared/bq-trail-data.js", "WebXR/shared/bq-facts.js"]) {
    const code = rd(f).replace(/^\s*(\/\/|\*|\/\*).*$/gm, "");
    check(!/workers\/payments|billing|stripe|checkout|purchase/i.test(code), "credits", `${f}: nothing touches billing`);
  }
  console.log(`  credits: station ${s1.amount}, clean game ${g1.amount}, passing game ${g3.amount}, balance ${L.balance}`);
}

// ------------------------------------------------------------ businesses
{
  check(T.TY_BUSINESSES.length === 5, "businesses", "TYCOON's five stay the five");
  check(B.BQ_BUSINESSES.length === 2, "businesses", "two Bay Program businesses");
  for (const b of B.BQ_BUSINESSES) {
    const m = META.get(b.station);
    check(T.tyBusiness(b.id) === b, "businesses", `${b.id}: registered with TYCOON (tyBusiness)`);
    check(!!m && STATIONS.has(b.station), "businesses", `${b.id}: tied to real station ${b.station}`);
    check(b.checklist.length >= 4 && b.checklist.every((i) => m?.tagline?.includes(i)), "businesses", `${b.id}: checklist verbatim from ${b.station}'s tagline`);
    check(!/\d/.test(`${b.name} ${b.blurb}`) && [b.open, b.upkeep, b.perVisit].every((v) => Number.isInteger(v) && v > 0), "businesses", `${b.id}: no digits, whole play figures`);
  }
  check(T.tyInspect(B.BQ_BUSINESSES[0].checklist.map(() => true)).ok !== undefined, "businesses", "the inspection reads the checklist");
}

// ------------------------------------------------------------ stories
{
  const paths = new Set(B.BQ_STORIES.map((s) => s.path));
  for (const p of ["union-trades", "k12", "disaster-relief", "roam"]) check(paths.has(p), "stories", `a story on the ${p} path`);
  const lessonIds = new Set();
  for (const f of ["tools/k12-data"]) if (fs.existsSync(path.join(ROOT, f))) for (const x of fs.readdirSync(path.join(ROOT, f))) lessonIds.add(x.replace(/\.json$/, ""));
  for (const s of B.BQ_STORIES) {
    check(s.branches.length === 2, "stories", `${s.id}: two branches`);
    for (const br of s.branches) check((br.end.kind === "station" && STATIONS.has(br.end.id)) || (br.end.kind === "lesson" && (STATIONS.has(br.end.id) || lessonIds.has(br.end.id))), "stories", `${s.id} ${br.id}: ends at a real station or lesson (${br.end.id})`);
    const src = s.line.src;
    check(src.station ? WHY.get(src.station) === s.line.text : F.bqFact(src.fact)?.text === s.line.text, "stories", `${s.id}: the told line is sourced`);
    for (const c of s.chain) if (!c.guarded) check(c.kind === "game" ? !!GD.bqGame(c.id) : STATIONS.has(c.id), "stories", `${s.id}: chain ${c.kind} ${c.id} resolves`);
    check(!!BW.BAY_SITES.find((x) => x.id === s.site), "stories", `${s.id}: at a real Bay World site`);
    check(S.stStory(s.id) === s, "stories", `${s.id}: registered with STORYLINE`);
  }
  check(S.stQuestsFor("roam", "bayworld").every((s) => s.roam) && S.stQuestsFor("roam", "bayworld").length >= 1, "stories", "Just Roam sees only the roam-friendly story");
  check(S.stQuestsFor("union-trades", "bayworld").length >= 2, "stories", "Union Trades sees its Bay Program stories in Bay World");
}

// ------------------------------------------------------------ DEAN template
{
  const tpl = B.bqDeanTemplate();
  check(tpl.title === "Bay Program week" && tpl.days.length === 5, "dean", "the Bay Program week template has five days");
  for (const d of tpl.days) for (const it of d.items) {
    if (it.guarded) continue;
    const ok = it.kind === "station" ? STATIONS.has(it.id) : it.kind === "game" ? !!GD.bqGame(it.id) : it.kind === "trail" ? it.id === TR.BQ_TRAIL.id : it.kind === "story" ? !!S.stStory(it.id) : false;
    check(ok, "dean", `day ${d.day}: ${it.kind} ${it.id} resolves`);
  }
}

// ------------------------------------------------------------ wiring
{
  const app = rd("WebXR/parishes/js/app.js");
  check(/import \{ bqMount \} from "..\/..\/shared\/bq-bayquest.js"/.test(app) && /bqMount\(\{ el/.test(app), "wiring", "the parishes app mounts the Bay Program board");
  const bundler = rd("tools/bundle_webxr.py");
  for (const f of ["bq-facts.js", "bq-games-data.js", "bq-trail-data.js", "bq-bayquest.js"]) check(bundler.indexOf(`SHARED / "${f}"`) > bundler.indexOf(`SHARED / "st-stories.js"`), "wiring", `the parishes bundle lists ${f} after st-stories.js`);
  const dist = path.join(ROOT, "WebXR/parishes/dist/parishes.html");
  check(fs.existsSync(dist) && fs.readFileSync(dist, "utf8").includes("function bqMount"), "wiring", "the parishes bundle carries bqMount (python3 tools/bundle_webxr.py parishes)");
}

console.log(`  groups: ${Object.entries(groups).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`bayquest: ${GD.BQ_GAMES.length} games, ${TR.BQ_TREASURES.length} treasures, ${B.BQ_BUSINESSES.length} businesses, ${B.BQ_STORIES.length} stories · ${n} checks · ${failed} failed`);
process.exit(failed ? 1 : 0);
