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

const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
const K12 = new Set(CURRICULA.filter((c) => c.audience === "classroom").flatMap((c) => c.stations.map((s) => s.id)));
const QUEST_IDS = new Set([...BQ.ALL_QUESTS, ...BQ.GATED_QUESTS, ...DV.DV_ALL_DIVES, ...SG.QM_SIDE_GAMES].map((q) => q.id));

// ------------------------------------------------------------ collect items
const items = [
  ...BQ.GATED_QUESTS.map((q) => ({ ...q, world: "bayworld", source: "bayworld/js/quests-data.js GATED_QUESTS" })),
  ...SG.QM_SIDE_GAMES.map((g) => ({ ...g, source: "shared/side-games-data.js QM_SIDE_GAMES" })),
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
  // links: every required station routes to a page that exists
  const req = G.qmGateStations(it.gate);
  if (!req.length && !(it.gate.programmes ?? []).length && !(it.gate.quests ?? []).length) fail("links", `${where}: nothing to link to`);
  for (const id of req) {
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
  const isGame = it.kind === "side-game" || it.practices !== undefined || it.reward !== undefined;
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
    if (run.length !== steps.length + (it.practices ?? []).length) fail("mechanics", `${it.id}: the run does not carry the mechanic steps plus the practice calls`); else ok();
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
for (const w of fourWorlds) {
  const app = readFileSync(join(WEBXR, w, "js/app.js"), "utf8");
  if (!/qmMountSideGames\(/.test(app)) fail("wiring", `${w}/js/app.js does not mount the side-games panel`); else ok();
  const block = bundle.slice(bundle.indexOf(`"${w}": {`), bundle.indexOf(`WEBXR / "${w}/js/app.js"`));
  for (const m of ["skill-gates.js", "side-games-data.js", "side-game-mechanics.js", "skill-gates-ui.js", "links.js", "passport-programmes.js"]) {
    if (!block.includes(`"${m}"`)) fail("bundle", `the ${w} bundle lacks ${m}`); else ok();
  }
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
