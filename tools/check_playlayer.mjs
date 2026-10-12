#!/usr/bin/env node
/**
 * The Bay Area play layer (console PLAYLAYER, docs/consoles/PLAYLAYER.md), and
 * since LA-PLAY (docs/consoles/LA-PLAY.md) the Louisiana maps on it too:
 *
 *     node tools/check_playlayer.mjs
 *
 * WebXR/shared/pl-bay-play.js brings every San Francisco, Oakland, North East
 * Bay, South Bay and Bay Program map up to the New Orleans play layer. This
 * checker proves, for every one of those maps:
 *   - three or more play-layer field lessons (sg-sf-play.js + pl-bay-play.js),
 *     each at a site of the map, its `k12` a classroom station and its `station`
 *     a catalog station, an answerable check, no figure and no fact-shaped word;
 *   - every field lesson in the map's own data names a `station` (nothing left
 *     off the play layer);
 *   - KREWE-style side quests (kw-play-data.js's shape) so #menu-krewe is never
 *     empty: goto → classroom station → trade station → the map's own field
 *     lesson, every id resolving, the last step a real lesson of that map;
 *   - a path board (sl-parish-play.js's slPathBoard shape) with trade,
 *     classroom and play rows so #menu-paths is never empty;
 *   - the parishes app mounts both boards as the fallback of SECONDLINE's and
 *     KREWE's, the eval counts the lessons, the treasure layer carries a crew
 *     kit off every site and a quiet find for every lesson;
 *   - hygiene: pl/PL_ prefixes, no three.js, no coordinate, the checker in
 *     check_all and the baseline.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; console.log(`  FAIL [${area}] ${msg}`); };
const t0 = Date.now();

class MemStore { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } clear() { this.m.clear(); } }
globalThis.localStorage = new MemStore();

const imp = (p) => import(pathToFileURL(join(WEBXR, p)));
const PL = await imp("shared/pl-bay-play.js");
const SGP = await imp("shared/sg-sf-play.js");
const R = await imp("shared/np-parishes.js");
const catalog = JSON.parse(rd("WebXR/smartcity/catalog.json"));
const STATIONS = new Set(catalog.stations.map((s) => s.id));
const K12 = new Set([...STATIONS].filter((id) => id.startsWith("k12-")));
// "feet" and "tall" are left out: the maps' lessons use them as plain words ("under your feet", "a tall house front").
const FACTS = /\b(built|opened|founded|established|dedicated|acres|miles|population|century|anniversary|named after|oldest|largest|longest|first ever)\b/i;
const factsClean = (where, text) => {
  if (/\d/.test(String(text).replace(/K-12/g, ""))) fail("facts", `${where}: states a figure`); else ok();
  if (FACTS.test(text)) fail("facts", `${where}: fact-shaped word "${text.match(FACTS)[0]}"`); else ok();
};

// ---- the maps
const bay = R.NP_PARISHES.filter((p) => PL.PL_REGIONS.includes(p.region));
if (bay.length < 13) fail("maps", `${bay.length} Bay Area maps, fewer than thirteen`); else ok();
// LA-PLAY: every map of the three Louisiana regions is on the layer (keyed by region, so a later map is held too).
const laMaps = R.NP_PARISHES.filter((p) => (PL.PL_LA_REGIONS ?? []).includes(p.region));
if (laMaps.length < 17) fail("maps", `${laMaps.length} Louisiana maps on the play layer, fewer than seventeen`); else ok();
for (const p of laMaps) if (!PL.PL_LA_MAPS.some((d) => d.id === p.id)) fail("maps", `${p.id} (Louisiana) is not on the play layer`); else ok();
for (const d of PL.PL_LA_MAPS) if (!/Louisiana/.test(d.hint)) fail("maps", `${d.id}: the crew-kit hint does not name Louisiana`); else ok();
if (PL.PL_BAY_MAPS.length !== bay.length) fail("maps", `PL_BAY_MAPS has ${PL.PL_BAY_MAPS.length} of ${bay.length} Bay Area maps`); else ok();
const sgIds = new Set(SGP.SG_DISTRICTS.map((d) => d.id));
if (PL.PL_DISTRICTS.some((d) => sgIds.has(d.id))) fail("maps", "PL_DISTRICTS repeats a GOLDEN-B district (its lessons would count twice)"); else ok();

let lessonsN = 0, questsN = 0;
for (const p of bay) {
  // every field lesson in the map's data names a trade station
  for (const l of p.fieldLessons ?? []) if (!l.station) fail(p.id, `${l.id} has no trade station (it stays off the play layer)`); else ok();
  // three or more play-layer lessons, every id resolving
  const lessons = PL.plBayLessons(p.id);
  const counted = [...SGP.sgLessonsFor(p.id), ...PL.plLessonsFor(p.id)];
  if (counted.length < 3) fail(p.id, `the play layer offers ${counted.length} field lessons, fewer than three`); else ok();
  if (counted.length !== lessons.length) fail(p.id, "plBayLessons and the eval's count disagree"); else ok();
  lessonsN += lessons.length;
  for (const l of lessons) {
    if (!p.sites.some((s) => s.id === l.site)) fail(l.id, `site ${l.site} is not a site of ${p.id}`); else ok();
    if (!K12.has(l.k12)) fail(l.id, `k12 ${l.k12} is not a classroom station`); else ok();
    if (!STATIONS.has(l.station) || l.station.startsWith("k12-")) fail(l.id, `station ${l.station} is not a trade station in the catalog`); else ok();
    const c = l.check;
    if (!c?.q || !Array.isArray(c.options) || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length) fail(l.id, "check not answerable"); else ok();
    factsClean(l.id, [l.title, l.tradeLine, ...(l.steps ?? []), c?.q, ...(c?.options ?? []), c?.why].join(" "));
  }
  // side quests
  const quests = PL.plQuestsFor(p.id);
  if (!quests.length) fail(p.id, "no side quests (#menu-krewe would be empty)"); else ok();
  questsN += quests.length;
  for (const q of quests) {
    const [go, les, st, fin] = q.steps ?? [];
    if (!/^pl-q-/.test(q.id) || q.kind !== "side-quest" || q.world !== "parishes") fail(q.id, "not in KREWE's quest shape"); else ok();
    if (go?.type !== "goto" || !p.sites.some((s) => s.id === go.site)) fail(q.id, "the goto step's site is not on the map"); else ok();
    if (les?.type !== "lesson" || !K12.has(les.lesson)) fail(q.id, "the lesson step is not a classroom station"); else ok();
    if (st?.type !== "station" || !STATIONS.has(st.station)) fail(q.id, "the station step is not a catalog station"); else ok();
    if (fin?.type !== "field" || !(p.fieldLessons ?? []).some((l) => l.id === fin.lesson)) fail(q.id, "the quest does not end at a real field lesson of the map"); else ok();
    if (!q.reward?.stamp) fail(q.id, "no stamp"); else ok();
    factsClean(q.id, [q.title, q.giver, ...q.steps.map((s) => s.text)].join(" "));
  }
  const rows = PL.plQuestBoard(p.id);
  if (rows.length !== quests.length || rows.some((r) => !r.lesson.href.includes(`sim=${r.lesson.id}`) || !r.station.href.includes(`sim=${r.station.id}`))) fail(p.id, "the quest board's links do not launch their stations"); else ok();
  // path board
  const board = PL.plPathBoard(p.id);
  const ids = board?.paths?.map((x) => x.id).join(",");
  if (ids !== "trade,classroom,play") fail(p.id, `path board paths are ${ids}`); else ok();
  if (board && board.paths.some((x) => !x.rows.length)) fail(p.id, "a path on the board has no rows (#menu-paths would be thin)"); else ok();
  if (board && board.paths[0].rows.length !== p.sites.length) fail(p.id, "the trade path lacks a row for every site"); else ok();
}

// ---- mounts, eval, treasures
const app = rd("WebXR/parishes/js/app.js");
if (!/plMountPathBoard\(\$\("menu-paths"\)/.test(app)) fail("mount", "the app does not mount the Bay Area path board in #menu-paths"); else ok();
if (!/plMountQuestBoard\(\$\("menu-krewe"\)/.test(app)) fail("mount", "the app does not mount the Bay Area side quests in #menu-krewe"); else ok();
if (!/PLP\.plLessonsFor\(p\.id\)/.test(rd("tools/eval_worlds.mjs"))) fail("eval", "eval_worlds does not count the Bay Area lessons"); else ok();
const TZ = await imp("shared/treasures-data.js");
const tz = TZ.TZ_TREASURES ?? TZ.TREASURES ?? [];
for (const d of PL.PL_DISTRICTS) for (const s of d.sites) if (!tz.some((t) => t.id === `tz-parish-${d.id}-${s.id}`)) fail("treasures", `${d.id}/${s.id} has no crew kit (run node tools/gen_treasures.mjs)`); else ok();
for (const l of PL.PL_FIELD_LESSONS) if (!tz.some((t) => t.id === `tz-lesson-${l.id}`)) fail("treasures", `${l.id} has no quiet lesson find`); else ok();

// ---- hygiene
const src = rd("WebXR/shared/pl-bay-play.js");
const tops = [...src.matchAll(/^(?:export )?(?:const|let|function|class) ([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
for (const n of tops) if (!/^(pl|PL_)/.test(n)) fail("hygiene", `top-level ${n} lacks the pl/PL_ prefix`); else ok();
if (/three|https?:\/\//.test(src.replace(/\/\/.*$/gm, ""))) fail("hygiene", "three.js or a URL in the module"); else ok();
if (/-?\d+\.\d+\s*,\s*-?\d+\.\d+/.test(src.replace(/\/\/.*$/gm, ""))) fail("hygiene", "a coordinate in the module"); else ok();
if (!rd("tools/check_all.mjs").includes('"check_playlayer.mjs"')) fail("hygiene", "not in check_all"); else ok();
if (!rd("docs/perf/checkers-baseline.json").includes('"check_playlayer.mjs"')) fail("hygiene", "not in the checkers baseline"); else ok();

console.log(`  · ${bay.length} maps (${bay.length - laMaps.length} Bay Area, ${laMaps.length} Louisiana) · ${lessonsN} play-layer field lessons · ${questsN} side quests · ${bay.length} path boards · ${Date.now() - t0} ms`);
console.log(failed ? `check_playlayer: ${failed} FAILED, ${passed} passed` : `check_playlayer: all ${passed} checks pass`);
process.exit(failed ? 1 : 0);
