/**
 * The skill-gate checker (tools/briefs/frontier-brief.md, QUESTMASTER;
 * docs/skill-gates.md).
 *
 *     node tools/check_gates.mjs
 *
 * Asserts, for every gated item on the platform:
 *   - the gate has the contract's shape and a one-line note;
 *   - every id it names resolves: stations (curricula.js), K-12 stations
 *     (classroom programmes), programmes (passport-programmes.js) and quests
 *     (Bay World quests, the Deep's dives, the side games);
 *   - every required station has a working link (shared/links.js routes it
 *     to a page that exists);
 *   - a fresh profile sees it locked, and a profile holding exactly the
 *     required completions sees it open;
 *   - side games are scored on safe practice only (a safe and an unsafe
 *     call per round, known practice keys), unlock a cosmetic, and carry no
 *     digit, purchase, gambling or violence wording;
 *   - Bay World's quest engine keeps a gated quest still while locked and
 *     lets it advance once open (the one hook in quest-engine.js);
 *   - each world page mounts the lock UI and each bundle carries the modules.
 * Other consoles plug in by exporting an array named `…GATED…` from a
 * `*-data.js` module under WebXR/ (no CDN imports): it is picked up here.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; console.log(`  FAIL [${area}] ${msg}`); };

// A Storage the whole run shares: gtStorage() reads globalThis.localStorage.
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
const G = await imp("shared/skill-gates.js");
const SG = await imp("shared/side-games-data.js");
const MX = await imp("shared/side-game-mechanics.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const { PP_PROGRAMMES } = await imp("shared/passport-programmes.js");
const BQ = await imp("bayworld/js/quests.js");
const DV = await imp("underwater/js/dives.js");
const LK = await imp("shared/links.js");
const NM = await imp("shared/gate-names-data.js");
const RG = await imp("regatta/js/courses.js");

// The New Orleans parishes (SECONDLINE, docs/parish-play.md): side games keyed by
// parish and site, in a module that is not a `*-data.js`, so it is read by name.
const SLP = await imp("shared/sl-parish-play.js");

const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
const K12 = new Set(CURRICULA.filter((c) => c.audience === "classroom").flatMap((c) => c.stations.map((s) => s.id)));
const QUEST_IDS = new Set([...BQ.ALL_QUESTS, ...BQ.GATED_QUESTS, ...DV.DV_ALL_DIVES, ...SG.QM_SIDE_GAMES, ...SLP.SL_MAIN_QUESTS, ...SLP.SL_SIDE_GAMES].map((q) => q.id));

// ------------------------------------------------------------ collect items
const items = [
  ...BQ.GATED_QUESTS.map((q) => ({ ...q, world: "bayworld", source: "bayworld/js/quests-data.js GATED_QUESTS" })),
  ...SG.QM_SIDE_GAMES.map((g) => ({ ...g, source: "shared/side-games-data.js QM_SIDE_GAMES" })),
  ...SLP.SL_GATED.map((g) => ({ ...g, source: "shared/sl-parish-play.js SL_GATED" })),
];
const own = new Set(items.map((i) => i.id));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!["dist", "vendor", "node_modules", "assets"].includes(name)) walk(p, out); }
    else if (name.endsWith("-data.js")) out.push(p);
  }
  return out;
}
let discovered = 0;
for (const file of walk(WEBXR)) {
  const src = readFileSync(file, "utf8");
  if (!/export const \w*GATED\w*\s*=/.test(src) || /from\s+["']https?:/.test(src)) continue;
  let mod;
  try { mod = await import(pathToFileURL(file)); } catch (e) { fail("discover", `${relative(ROOT, file)} would not import: ${e.message}`); continue; }
  for (const [name, v] of Object.entries(mod)) {
    if (!/GATED/.test(name) || !Array.isArray(v)) continue;
    for (const it of v) {
      if (!it || !it.gate || own.has(it.id)) continue;
      own.add(it.id);
      items.push({ ...it, source: `${relative(WEBXR, file)} ${name}` });
      discovered += 1;
    }
  }
}

// ------------------------------------------------------------ counts
const byWorld = {};
for (const it of items) byWorld[it.world ?? "?"] = (byWorld[it.world ?? "?"] ?? 0) + 1;
const fourWorlds = ["bayworld", "underwater", "regatta", "fairway"];
const inFour = items.filter((i) => fourWorlds.includes(i.world)).length;
if (inFour < 30) fail("count", `${inFour} gated side quests/games across Bay World, the Deep, the Regatta and Fairway (need 30+)`); else ok();
for (const w of fourWorlds) if ((byWorld[w] ?? 0) < 5) fail("count", `${w} has ${byWorld[w] ?? 0} gated items (need 5+)`); else ok();
// The next-phase bar (tools/briefs/next/questmaster-next.md): 60+ items across 6+ worlds, every one placed in a world.
const sixWorlds = [...fourWorlds, "summit", "redwood"];
for (const w of ["summit", "redwood"]) if ((byWorld[w] ?? 0) < 5) fail("count", `${w} has ${byWorld[w] ?? 0} gated items (need 5+)`); else ok();
if (items.length < 60) fail("count", `${items.length} gated items on the platform (need 60+)`); else ok();
if (Object.keys(byWorld).filter((w) => w !== "?").length < 6) fail("count", `gated items in ${Object.keys(byWorld).length} worlds (need 6+)`); else ok();
if (byWorld["?"]) fail("count", `${byWorld["?"]} gated items name no world`); else ok();
// The parishes (crescent brief, SECONDLINE): 25+ gated side games behind union skills, five or more in each of the five parishes.
{
  const parishItems = items.filter((i) => i.world === "parishes");
  if (parishItems.length < 25) fail("count", `${parishItems.length} gated side games across the parishes (need 25+)`); else ok();
  for (const p of SLP.SL_PARISHES) {
    const n = parishItems.filter((i) => i.parish === p.id).length;
    if (n < 5) fail("count", `${p.name} has ${n} gated side games (need 5+)`); else ok();
  }
  for (const i of parishItems) if (!SLP.SL_PARISH_IDS.includes(i.parish)) fail("count", `${i.id} names unknown parish "${i.parish}"`); else ok();
}
if (!discovered) fail("discover", "no gated items discovered from other consoles' modules"); else ok();
const ids = new Set();
for (const it of items) { if (ids.has(it.id)) fail("ids", `duplicate gated id ${it.id}`); else ok(); ids.add(it.id); }

// ------------------------------------------------------------ each gate
const BANNED = /\b(gambl\w*|bet|wager|loot ?box\w*|purchase\w*|buy|kill\w*|shoot\w*|weapon\w*|blood|casino|jackpot)\b/i;
function runnerPage(href) {
  const clean = href.split("?")[0].split("#")[0];
  return join(WEBXR, "bayworld", clean); // links are relative to a world page one level under WebXR/
}
for (const it of items) {
  const where = `${it.id} (${it.source})`;
  for (const p of G.qmGateProblems(it.gate)) fail("shape", `${where}: ${p}`);
  if (!G.qmGateProblems(it.gate).length) ok();
  for (const id of it.gate.stations ?? []) { if (!STATIONS.has(id)) fail("resolve", `${where}: unknown station "${id}"`); else ok(); }
  for (const id of it.gate.k12 ?? []) { if (!K12.has(id)) fail("resolve", `${where}: unknown K-12 station "${id}"`); else ok(); }
  for (const p of it.gate.programmes ?? []) {
    const prog = PP_PROGRAMMES[p.id];
    if (!prog) { fail("resolve", `${where}: unknown programme "${p.id}"`); continue; }
    ok();
    if (p.minStars != null && (!Number.isInteger(p.minStars) || p.minStars < 1 || p.minStars > prog.stations.length * 3)) fail("resolve", `${where}: minStars ${p.minStars} out of range for ${p.id}`); else ok();
  }
  for (const id of it.gate.quests ?? []) { if (!QUEST_IDS.has(id)) fail("resolve", `${where}: unknown quest "${id}"`); else ok(); }
  if (/\d/.test(it.gate.note.replace(/K-12/g, ""))) fail("facts", `${where}: the lock note carries a digit`); else ok();
  // a quest chain (`requires`) names a quest that exists and is not the same thing as the gate
  for (const r of it.requires ? [].concat(it.requires) : []) { if (!QUEST_IDS.has(r)) fail("requires", `${where}: requires unknown quest "${r}"`); else if ((it.gate.quests ?? []).includes(r)) fail("requires", `${where}: "${r}" is both the chain and the gate`); else ok(); }
  // links: every required station routes to a page that exists
  const req = G.qmGateStations(it.gate);
  if (!req.length && !(it.gate.programmes ?? []).length && !(it.gate.quests ?? []).length) fail("links", `${where}: nothing to link to`);
  for (const id of req) {
    // the lock UI shows the catalog's display name, never the id read aloud (tools/gen_gate_names.mjs)
    if (typeof NM.QM_STATION_NAMES[id] !== "string" || !NM.QM_STATION_NAMES[id].trim()) fail("names", `${where}: no display name for ${id} — run node tools/gen_gate_names.mjs`); else ok();
    if (G.qmLabel(id) === id.replace(/-/g, " ") && NM.QM_STATION_NAMES[id]) fail("names", `${where}: qmLabel(${id}) ignores the display name`); else ok();
    const href = LK.lkStationLink(id, { from: it.world, page: null });
    if (!href || !existsSync(runnerPage(href))) fail("links", `${where}: station link for ${id} does not resolve (${href})`); else ok();
  }
  // a fresh profile sees it locked
  globalThis.localStorage.clear(); G.qmInvalidate();
  if (G.qmIsOpen(it.gate, G.qmSnapshot())) fail("locked", `${where}: a fresh profile sees it open`); else ok();
  if (!G.qmMissing(it.gate, G.qmSnapshot()).length) fail("locked", `${where}: a fresh profile has nothing missing`); else ok();
  // a profile with exactly the required completions sees it open
  const records = [];
  for (const id of req) records.push({ simId: id, stars: 1, passed: false });
  for (const p of it.gate.programmes ?? []) {
    const prog = PP_PROGRAMMES[p.id];
    if (!prog) continue;
    if (p.minStars) { let left = p.minStars; for (const s of prog.stations) { if (left <= 0) break; const n = Math.min(3, left); records.push({ simId: s, stars: n }); left -= n; } }
    else for (const s of prog.stations) records.push({ simId: s, stars: 1 });
  }
  globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify(records));
  const byId = {};
  for (const q of it.gate.quests ?? []) byId[q] = { done: true, stepIndex: 1 };
  globalThis.localStorage.setItem("bayworld-quests-v1", JSON.stringify({ byId }));
  if (!G.qmIsOpen(it.gate, G.qmSnapshot())) fail("open", `${where}: still locked with the required completions (${G.qmMissing(it.gate, G.qmSnapshot()).map((m) => m.id).join(", ")})`); else ok();
  // one requirement short is locked again (when there is more than one thing to remove)
  if (records.length) {
    globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify(records.filter((r) => r.simId !== (req[0] ?? records[0].simId))));
    if (G.qmIsOpen(it.gate, G.qmSnapshot()) && req.length) fail("locked", `${where}: opens with one required station missing`); else ok();
  }
  // safe-practice scoring and a cosmetic reward: the side games' contract.
  // Gated quests, eggs and treasures from other worlds (Summit, Redwood,
  // TREASURE) share only the gate; they are not scored games.
  const isGame = it.kind === "side-game" || it.practices !== undefined;
  if (!isGame && it.reward && !it.reward.cosmetic && !it.reward.badge) fail("reward", `${where}: a gated quest with a reward that is neither a cosmetic nor a badge`); else ok();
  if (isGame) {
    if (!it.reward?.cosmetic) fail("reward", `${where}: no cosmetic reward`); else ok();
    const prac = it.practices ?? [];
    if (prac.length < 3) fail("scoring", `${where}: fewer than three safe-practice calls`); else ok();
    for (const k of prac) if (!SG.QM_SAFE_PRACTICES[k]) fail("scoring", `${where}: unknown practice "${k}"`);
    if (prac.every((k) => SG.QM_SAFE_PRACTICES[k])) {
      const rounds = SG.qmRounds(it);
      if (!rounds.every((r) => r.options.filter((o) => o.safe).length === 1 && r.options.length === 2)) fail("scoring", `${where}: a round without exactly one safe call`); else ok();
    }
  } else ok();
  const text = [it.title, it.summary, it.gate.note, it.reward?.cosmetic, ...(it.steps ?? []).map((s) => s.text)].filter(Boolean).join(" ");
  if (BANNED.test(text)) fail("tone", `${where}: banned wording "${text.match(BANNED)[0]}"`); else ok();
}
// ------------------------------------------------------------ mechanics
// Twelve playable mechanics (shared/side-game-mechanics.js): every item
// resolves to one, every mechanic is used, each step has exactly one safe
// move, a run is deterministic, and the text follows the facts and tone rules.
{
  if (MX.QM_MECHANIC_KEYS.length < 12) fail("mechanics", `${MX.QM_MECHANIC_KEYS.length} mechanics (need 12)`); else ok();
  const used = new Map();
  const games = items; // every gated item resolves to a mechanic; quests from a world engine keep theirs for that world to play
  for (const it of games) {
    const key = MX.qmMechanicFor(it);
    used.set(key, (used.get(key) ?? 0) + 1);
    const steps = MX.qmMechanicSteps(it);
    if (steps.length < 3) fail("mechanics", `${it.id}: ${key} has fewer than three steps`); else ok();
    for (const s of steps) {
      if (!Array.isArray(s.board) || s.board.length < 2 || !s.prompt) fail("mechanics", `${it.id}: a ${key} step has no board or prompt`); else ok();
      if (s.options.length !== 2 || s.options.filter((o) => o.safe).length !== 1) fail("mechanics", `${it.id}: a ${key} step without exactly one safe move`); else ok();
      const text = [s.prompt, ...s.board, ...s.options.map((o) => o.text)].join(" ");
      if (/\d/.test(text.replace(/K-12/g, ""))) fail("facts", `${it.id}: a ${key} step carries a digit`); else ok();
      if (BANNED.test(text)) fail("tone", `${it.id}: a ${key} step carries banned wording "${text.match(BANNED)[0]}"`); else ok();
    }
    const again = MX.qmMechanicSteps(it);
    if (JSON.stringify(again) !== JSON.stringify(steps)) fail("mechanics", `${it.id}: ${key} is not deterministic`); else ok();
    const run = MX.qmPlaySteps(it, SG.qmRounds(it));
    if (run.length !== steps.length + (it.practices ?? []).length + (it.calls ?? []).length) fail("mechanics", `${it.id}: the run does not carry the mechanic steps plus the practice calls and its own calls`); else ok();
    if (!it.practices) continue; // a gated quest is not scored here
    // a run with every safe move is clean; one unsafe move is a practice run
    globalThis.localStorage.clear(); G.qmInvalidate();
    const safeCount = run.filter((s) => s.options.some((o) => o.safe)).length;
    if (!G.qmFinishGame(it, { score: safeCount, of: run.length }).clean) fail("mechanics", `${it.id}: an all-safe run is not clean`); else ok();
    globalThis.localStorage.clear(); G.qmInvalidate();
    if (G.qmFinishGame(it, { score: run.length - 1, of: run.length }).clean) fail("mechanics", `${it.id}: a run with one unsafe move counted as clean`); else ok();
  }
  for (const key of MX.QM_MECHANIC_KEYS) { if (!used.get(key)) fail("mechanics", `mechanic ${key} is used by no item`); else ok(); }
  for (const [key, m] of Object.entries(MX.QM_MECHANICS)) {
    if (!m.name || !m.blurb || !(m.match instanceof RegExp) || typeof m.build !== "function") fail("mechanics", `${key} lacks name, blurb, match or build`); else ok();
    if (/\d/.test(`${m.name} ${m.blurb}`) || BANNED.test(`${m.name} ${m.blurb}`)) fail("facts", `${key}: name or blurb carries a digit or banned wording`); else ok();
  }
  console.log(`  mechanics: ${[...used.entries()].map(([k, n]) => `${k} ${n}`).join(", ")}`);
}
for (const [k, p] of Object.entries(SG.QM_SAFE_PRACTICES)) {
  for (const f of ["prompt", "safe", "unsafe"]) if (!p[f] || /\d/.test(p[f]) || BANNED.test(p[f])) fail("facts", `practice ${k}.${f} missing, carries a digit or banned wording`); else ok();
}

// ------------------------------------------------------------ places
{
  const SB = await imp("underwater/js/seabed.js");
  for (const g of SG.QM_WORLD_GAMES.underwater) {
    if (!SB.DV_SITES.some((s) => s.id === g.site)) fail("place", `${g.id}: site "${g.site}" is not a Deep site (no board row, no map pin)`); else ok();
  }
  const BS = await imp("bayworld/js/quests-select.js");
  for (const q of BS.BW_GATED_QUESTS) { if (!Array.isArray(q.anchor)) fail("place", `${q.id}: no Bay World site anchor (no board row, no map pin)`); else ok(); }
  for (const g of SG.QM_WORLD_GAMES.fairway) { if (!Array.isArray(g.pin)) fail("place", `${g.id}: no map position`); else ok(); }
  for (const g of SG.QM_WORLD_GAMES.regatta) {
    const c = RG.RG_COURSES.find((x) => x.id === g.course);
    if (!c) { fail("place", `${g.id}: course "${g.course}" is not a Regatta course (no pin, no briefing row)`); continue; }
    if (g.mark === "dock" || (Number.isInteger(g.mark) && g.mark >= 0 && g.mark < c.marks.length)) ok(); else fail("place", `${g.id}: mark "${g.mark}" is not on ${c.id}`);
  }
  const SMD = await imp("shared/summit-data.js");
  for (const g of SMD.SM_GATED) { if (!g.title || !g.world) fail("place", `${g.id}: Summit's gated item has no title or world`); else ok(); }
  const RWD = await imp("redwood/js/rw-data.js");
  for (const g of RWD.RW_GATED) { if (!g.title || !g.world || !g.siteName) fail("place", `${g.id}: Redwood's gated item has no title, world or site name`); else ok(); }
  // A parish game sits at one of its parish's sites (a board row and a pin once PARISH's engine binds the site), with a site name and an explicit mechanic.
  for (const g of SLP.SL_GATED) {
    const site = SLP.slSiteDef(g.parish, g.site);
    if (!site) fail("place", `${g.id}: site "${g.site}" is not a ${g.parish} site in sl-parish-play.js`); else ok();
    if (!g.title || !g.siteName || g.siteName !== site?.name) fail("place", `${g.id}: no title or a site name that is not the site's`); else ok();
    if (!MX.QM_MECHANICS[g.mechanic]) fail("place", `${g.id}: mechanic "${g.mechanic}" is not one of the twelve`); else ok();
    if (!/^sl-/.test(g.id) || !/^[a-z0-9-]+$/.test(g.site)) fail("place", `${g.id}: id lacks the sl- prefix or the site id is not kebab-case`); else ok();
  }
}

// ------------------------------------------------------------ ledger
globalThis.localStorage.clear(); G.qmInvalidate();
{
  const g = SG.QM_SIDE_GAMES[0];
  const r1 = G.qmFinishGame(g, { score: 2, of: 3 });
  if (r1.clean || G.qmSnapshot().questsDone.has(g.id)) fail("ledger", "a run with an unsafe call counted as done"); else ok();
  const r2 = G.qmFinishGame(g, { score: 3, of: 3 });
  if (!r2.clean || r2.cosmetic !== g.reward.cosmetic || !G.qmSnapshot().questsDone.has(g.id)) fail("ledger", "a clean run did not mark done and award the cosmetic"); else ok();
  if (!G.qmLedger().cosmetics.includes(g.reward.cosmetic)) fail("ledger", "the cosmetic is not in the ledger"); else ok();
  const { GT_PROFILE_KEYS } = await imp("shared/profiles.js");
  if (!GT_PROFILE_KEYS.includes(G.QM_LEDGER_KEY)) fail("ledger", "the side-game ledger is not a per-profile key"); else ok();
}

// ------------------------------------------------------------ engine hook
{
  globalThis.localStorage.clear(); G.qmInvalidate();
  const QE = await imp("bayworld/js/quest-engine.js");
  QE.bwClearQuests();
  const q = { id: "qm-test-gated", title: "t", kind: "gated", anchor: [0, 0], gate: { stations: ["crane-yard"], note: "Crane yard station before this test quest." }, steps: [{ type: "goto", target: [0, 0], text: "go" }, { type: "goto", target: [0, 0], text: "again" }] };
  QE.registerQuests([q]);
  const snap = { player: { x: 0, z: 0 }, places: [] };
  QE.bwAdvanceQuests(snap);
  if (QE.questState().find((s) => s.id === q.id)?.stepIndex !== 0) fail("engine", "a locked gated quest advanced"); else ok();
  globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify([{ simId: "crane-yard", stars: 1 }]));
  G.qmInvalidate();
  QE.bwAdvanceQuests(snap);
  if (QE.questState().find((s) => s.id === q.id)?.stepIndex !== 1) fail("engine", "an open gated quest did not advance"); else ok();
  QE.bwClearQuests();
  const src = readFileSync(join(WEBXR, "bayworld/js/quest-engine.js"), "utf8");
  if ((src.match(/qmIsOpen\(/g) ?? []).length > 3) fail("engine", "quest-engine.js carries more than the small gate hook"); else ok();
}

// ------------------------------------------------------------ wiring
const bundle = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
for (const w of sixWorlds) {
  const app = readFileSync(join(WEBXR, w, "js/app.js"), "utf8");
  if (!/qmMountSideGames\(/.test(app)) fail("wiring", `${w}/js/app.js does not mount the side-games panel`); else ok();
  const block = bundle.slice(bundle.indexOf(`"${w}": {`), bundle.indexOf(`WEBXR / "${w}/js/app.js"`));
  for (const m of ["gate-names-data.js", "skill-gates.js", "side-games-data.js", "side-game-mechanics.js", "skill-gates-ui.js", "links.js", "passport-programmes.js"]) {
    if (!block.includes(`"${m}"`)) fail("bundle", `the ${w} bundle lacks ${m}`); else ok();
  }
  // gate-names-data.js precedes skill-gates.js, which reads it at module top level
  if (block.indexOf('"gate-names-data.js"') > block.indexOf('"skill-gates.js"')) fail("bundle", `the ${w} bundle loads skill-gates.js before gate-names-data.js`); else ok();
}
// Pins, board rows and the lock toast in every world that has a map or a board.
const QM_UI = { underwater: ["qmDrawPin", "qmBoardRows", "qmLockToast"], regatta: ["qmDrawPin", "qmBoardRows", "qmLockToast"], fairway: ["qmBoardRows", "qmLockToast"], summit: ["qmDrawPin", "qmBoardRows", "qmLockToast"], redwood: ["qmDrawPin", "qmBoardRows", "qmLockToast"] };
for (const [w, fns] of Object.entries(QM_UI)) {
  const app = readFileSync(join(WEBXR, w, "js/app.js"), "utf8");
  for (const fn of fns) { if (!new RegExp(`${fn}\\(`).test(app)) fail("wiring", `${w} lacks ${fn}`); else ok(); }
}
if (!/TZ_GATED/.test(readFileSync(join(ROOT, "tools/gen_treasures.mjs"), "utf8"))) fail("wiring", "gen_treasures.mjs does not emit TZ_GATED"); else ok();
// The parishes page is PARISH's engine, built in a parallel worktree: when it is in
// this tree it must mount the lock UI over the parish games; until then, a note.
{
  const parishApp = join(WEBXR, "parishes/js/app.js");
  if (existsSync(parishApp)) {
    const app = readFileSync(parishApp, "utf8");
    if (!/qmMountSideGames\(/.test(app)) fail("wiring", "parishes/js/app.js does not mount the side-games panel"); else ok();
    for (const fn of ["qmBoardRows", "qmLockToast"]) { if (!new RegExp(`${fn}\\(`).test(app)) fail("wiring", `parishes lacks ${fn}`); else ok(); }
    if (!/slGamesFor\(|SL_SIDE_GAMES|slPathBoard\(|slMountPathBoard\(/.test(app)) fail("wiring", "parishes/js/app.js reads none of sl-parish-play.js's games or path board"); else ok();
    const block = bundle.slice(bundle.indexOf('"parishes": {'), bundle.indexOf('WEBXR / "parishes/js/app.js"'));
    if (bundle.includes('"parishes": {') && !block.includes('"sl-parish-play.js"')) fail("bundle", "the parishes bundle lacks sl-parish-play.js"); else ok();
  } else console.log("  · WebXR/parishes/js/app.js is not in this tree yet (PARISH builds it); the parish games are checked as data only");
  if (!/gen_gate_names|SL_GATED/.test(readFileSync(join(ROOT, "tools/gen_gate_names.mjs"), "utf8")) || !readFileSync(join(ROOT, "tools/gen_gate_names.mjs"), "utf8").includes("sl-parish-play.js")) fail("wiring", "gen_gate_names.mjs does not read the parish games (SL_GATED)"); else ok();
}
const bwApp = readFileSync(join(WEBXR, "bayworld/js/app.js"), "utf8");
for (const [what, re] of [["map pin", /qmDrawPin\(/], ["board rows", /qmBoardRows\(/], ["lock toast", /qmLockToast\(/], ["gated quests registered", /registerQuests\(BW_GATED_QUESTS\)/]]) {
  if (!re.test(bwApp)) fail("wiring", `Bay World lacks the ${what}`); else ok();
}
const ui = readFileSync(join(WEBXR, "shared/skill-gates-ui.js"), "utf8");
if (!/Skills to unlock/.test(ui)) fail("wiring", "the quest-log panel has no Skills to unlock section"); else ok();
if (!existsSync(join(ROOT, "docs/skill-gates.md"))) fail("docs", "docs/skill-gates.md is missing"); else ok();

const worlds = Object.entries(byWorld).map(([w, n]) => `${w} ${n}`).join(", ");
console.log(`\n  ${items.length} gated items (${worlds}; ${discovered} discovered from other modules) · ${passed} checks · ${failed} failed`);
if (failed) process.exit(1);
