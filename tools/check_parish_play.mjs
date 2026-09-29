#!/usr/bin/env node
/**
 * The parish play layer (console SECONDLINE, docs/parish-play.md):
 *
 *     node tools/check_parish_play.mjs
 *
 * WebXR/shared/sl-parish-play.js gamifies the five New Orleans parishes on the
 * Crescent brief's shared parish schema. This checker proves that every id in
 * it resolves and that nothing in it states a fact about a real place:
 *   - the five parishes and their sites: kebab-case ids, Orleans's ten kinds,
 *     eight or more sites elsewhere, every station in curricula.js, every
 *     union in tools/unions.json, a giver (a job title) at every site;
 *   - the storm-season arc: seven quests in one acyclic `requires` chain,
 *     tiers and rewards monotone, every step's site, station, lesson, game and
 *     connector resolving, all five parishes visited over four or more
 *     connectors, the levee, the pumps, the port, the hospital and the
 *     north-shore staging yard on the way;
 *   - the side games: an explicit mechanic each, all twelve used (the gate
 *     contract itself is check_gates.mjs's), a cosmetic reward;
 *   - the field lessons' anchors (the words are check_k12.mjs's);
 *   - the NPC hand-offs: unique ids, a hand-off of every kind at every site,
 *     every target resolving, every line re-read verbatim from the module;
 *   - the "choose your path" board: three paths for every parish, rows for
 *     every site, lesson and game, a locked game shown with its note and a
 *     link to each required station, no emoji icon, station links that route
 *     to a page that exists;
 *   - the Facts rule: no digit and no fact-shaped word (built, opened,
 *     founded, population, acres, miles …) in any learner-facing text, no
 *     coordinate anywhere in the module, no gambling or violence wording;
 *   - the parish treasures: a cache at every site, every trigger site-relative;
 *   - binding: when PARISH's or DELTA's np-data-<parish>.js is in the tree,
 *     every SL site and connector binds to it (skipped with a note otherwise);
 *   - hygiene: every top-level name prefixed sl/SL_, no three.js, no CDN import,
 *     the checker in check_all, the doc present.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; console.log(`  FAIL [${area}] ${msg}`); };

class MemStore { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } clear() { this.m.clear(); } }
globalThis.localStorage = new MemStore();
globalThis.sessionStorage = new MemStore();

const imp = (p) => import(pathToFileURL(join(WEBXR, p)));
const SL = await imp("shared/sl-parish-play.js");
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const MX = await imp("shared/side-game-mechanics.js");
const SG = await imp("shared/side-games-data.js");
const G = await imp("shared/skill-gates.js");
const TZ = await imp("shared/treasures-data.js");
// The San Francisco districts ride the parishes page (GOLDEN-B, shared/sg-sf-play.js): their caches and lesson finds share the surface.
const SGP = await imp("shared/sg-sf-play.js");
// PLAYLAYER's Bay Area maps (shared/pl-bay-play.js) share the surface too, on SG's shapes.
const PLP = await imp("shared/pl-bay-play.js");
const sgSiteDef = (parish, site) => (SGP.sgDistrict(parish) ?? PLP.plDistrict(parish))?.sites.find((x) => x.id === site) ?? null;
const SRC = rd("WebXR/shared/sl-parish-play.js");
const STATIONS = new Set(CURRICULA.flatMap((c) => c.stations.map((s) => s.id)));
const K12 = new Set(CURRICULA.filter((c) => c.audience === "classroom").flatMap((c) => c.stations.map((s) => s.id)));
const UNIONS = new Set(JSON.parse(rd("tools/unions.json")).unions.map((u) => u.id));
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const FACTS = /\b(built|opened|founded|established|dedicated|acres|feet|miles|tall|population|century|anniversary|named after|oldest|largest|longest|first ever)\b/i;
const BANNED = /\b(gambl\w*|bet|wager|loot ?box\w*|purchase\w*|buy|kill\w*|shoot\w*|weapon\w*|blood|casino|jackpot)\b/i;
const digitFree = (s) => !/\d/.test(String(s ?? "").replace(/K-12/g, ""));
const factsClean = (where, text) => {
  if (!digitFree(text)) fail("facts", `${where}: states a figure`); else ok();
  if (FACTS.test(text)) fail("facts", `${where}: fact-shaped word "${text.match(FACTS)[0]}"`); else ok();
  if (BANNED.test(text)) fail("tone", `${where}: banned wording "${text.match(BANNED)[0]}"`); else ok();
};

// ------------------------------------------------------------ parishes and sites
{
  const P = SL.SL_PARISHES;
  if (P.length !== 5) fail("parishes", `${P.length} parishes, not five`); else ok();
  for (const want of ["orleans", "jefferson", "st-bernard", "plaquemines", "st-tammany"]) { if (!P.some((p) => p.id === want)) fail("parishes", `no parish "${want}"`); else ok(); }
  const ORLEANS_KINDS = ["port", "levee", "pump-station", "transit-barn", "rail-yard", "hospital", "campus", "stadium", "hospitality", "wetland"];
  for (const p of P) {
    const ids = new Set();
    if (!KEBAB.test(p.id) || !p.name || !p.short) fail("parishes", `${p.id}: bad id, name or short name`); else ok();
    if (p.sites.length < (p.id === "orleans" ? 10 : 8)) fail("parishes", `${p.name} has ${p.sites.length} sites`); else ok();
    if (p.id === "orleans") for (const k of ORLEANS_KINDS) { if (!p.sites.some((s) => s.kind === k)) fail("parishes", `Orleans has no ${k} site`); else ok(); }
    for (const s of p.sites) {
      if (!KEBAB.test(s.id)) fail("sites", `${p.id}/${s.id}: id is not kebab-case`); else ok();
      if (ids.has(s.id)) fail("sites", `${p.id}: duplicate site ${s.id}`); else ok(); ids.add(s.id);
      if (!s.name || !s.kind || !s.match || !s.giver) fail("sites", `${p.id}/${s.id}: no name, kind, match or giver`); else ok();
      try { new RegExp(s.match, "i"); ok(); } catch (_) { fail("sites", `${p.id}/${s.id}: match is not a pattern`); }
      if (!/^the /.test(s.giver) || /[A-Z]/.test(s.giver)) fail("sites", `${p.id}/${s.id}: the giver "${s.giver}" is not a plain job title`); else ok();
      if (!s.stations?.length) fail("sites", `${p.id}/${s.id}: no stations`); else ok();
      for (const st of s.stations) { if (!STATIONS.has(st)) fail("sites", `${p.id}/${s.id}: station ${st} is not in curricula.js`); else ok(); }
      for (const u of s.trades) { if (!UNIONS.has(u)) fail("sites", `${p.id}/${s.id}: union ${u} is not in tools/unions.json`); else ok(); }
      factsClean(`${p.id}/${s.id}`, `${s.name} ${s.giver}`);
      if (SL.slSiteDef(p.id, s.id) !== s || SL.slSiteName(p.id, s.id) !== s.name) fail("sites", `${p.id}/${s.id}: slSiteDef or slSiteName does not find it`); else ok();
    }
  }
  // Binding by id, then by match; nothing binds a site the data lacks.
  const fake = { id: "orleans", sites: [{ id: "port-terminal", name: "x", kind: "port" }, { id: "np-hospital", name: "Medical Row", kind: "hospital" }, { id: "np-yard", name: "Stadium Approach", kind: "stadium" }] };
  if (SL.slResolveSite(fake, "port-terminal")?.id !== "port-terminal") fail("bind", "an exact site id does not bind"); else ok();
  if (SL.slResolveSite(fake, "hospital-district")?.id !== "np-hospital") fail("bind", "a renamed hospital site does not bind by match"); else ok();
  if (SL.slResolveSite(fake, "stadium-district")?.id !== "np-yard") fail("bind", "a renamed stadium site does not bind by match"); else ok();
  if (SL.slResolveSite(fake, "pumping-station") !== null) fail("bind", "a site the data lacks bound to something"); else ok();
  const conns = [{ id: "np-x", kind: "causeway", from: { parish: "st-tammany" }, to: { parish: "jefferson" } }];
  if (SL.slResolveConnector(conns, "causeway-jefferson-st-tammany")?.id !== "np-x") fail("bind", "a connector does not bind by kind and parishes either way round"); else ok();
  if (SL.slResolveConnector(conns, "river-bridge-orleans-jefferson") !== null) fail("bind", "a connector the data lacks bound to something"); else ok();
  for (const c of SL.SL_CONNECTORS) {
    if (!KEBAB.test(c.id) || !["bridge", "causeway", "ferry", "road"].includes(c.kind)) fail("connectors", `${c.id}: bad id or kind`); else ok();
    if (!SL.SL_PARISH_IDS.includes(c.from) || !SL.SL_PARISH_IDS.includes(c.to)) fail("connectors", `${c.id}: joins unknown parishes`); else ok();
    factsClean(c.id, c.name);
  }
}

// ------------------------------------------------------------ the storm-season arc
{
  const Q = SL.SL_MAIN_QUESTS;
  if (Q.length < 7) fail("arc", `${Q.length} main quests, fewer than seven`); else ok();
  if (SL.slFindCycle(Q)) fail("arc", `the requires chain has a cycle: ${SL.slFindCycle(Q).join(" -> ")}`); else ok();
  const ids = new Set(Q.map((q) => q.id));
  const visited = new Set(), crossings = new Set(), kinds = new Set();
  let prev = null;
  for (const q of Q) {
    if (!/^sl-main-/.test(q.id) || !q.title || q.kind !== "main" || !q.giver) fail("arc", `${q.id}: bad id, title, kind or giver`); else ok();
    if (q.requires && !ids.has(q.requires)) fail("arc", `${q.id} requires unknown ${q.requires}`); else ok();
    if (!Number.isInteger(q.tier) || q.tier < 1 || q.reward?.xp !== SL.slRewardForTier(q.tier) || !q.reward?.badge) fail("arc", `${q.id}: tier or reward off the curve`); else ok();
    if (prev && !(q.tier > prev.tier && q.requires === prev.id)) fail("arc", `${q.id} does not follow ${prev.id} with a higher tier`); else ok();
    if (!SL.slSiteDef(q.parish, q.site)) fail("arc", `${q.id}: anchor ${q.parish}/${q.site} is not a site`); else ok();
    visited.add(q.parish);
    if (!Array.isArray(q.steps) || q.steps.length < 4) fail("arc", `${q.id}: fewer than four steps`); else ok();
    for (const s of q.steps ?? []) {
      const where = `${q.id} ${s.type}`;
      if (s.type === "goto") { if (!SL.slSiteDef(s.parish, s.site)) fail("arc", `${where}: ${s.parish}/${s.site} is not a site`); else ok(); visited.add(s.parish); }
      else if (s.type === "talk") { if (!/^the /.test(s.giver ?? "") || !s.text) fail("arc", `${where}: giver is not a job title or no text`); else ok(); }
      else if (s.type === "station") { if (!STATIONS.has(s.station)) fail("arc", `${where}: station ${s.station} is not in curricula.js`); else ok(); }
      else if (s.type === "lesson") { if (!SL.slLesson(s.lesson)) fail("arc", `${where}: lesson ${s.lesson} does not exist`); else ok(); }
      else if (s.type === "game") { if (!SL.slGameById(s.game)) fail("arc", `${where}: game ${s.game} does not exist`); else ok(); }
      else if (s.type === "cross") {
        const c = SL.SL_CONNECTORS.find((x) => x.id === s.connector);
        if (!c) fail("arc", `${where}: connector ${s.connector} does not exist`); else ok();
        if (!SL.slSiteDef(s.to?.parish, s.to?.site)) fail("arc", `${where}: destination ${s.to?.parish}/${s.to?.site} is not a site`); else ok();
        if (c && s.to && c.from !== s.to.parish && c.to !== s.to.parish) fail("arc", `${where}: ${c.id} does not reach ${s.to.parish}`); else ok();
        crossings.add(s.connector); if (c) kinds.add(c.kind); visited.add(s.to?.parish);
      } else fail("arc", `${where}: unknown step type`);
      factsClean(where, `${s.text ?? ""} ${s.giver ?? ""}`);
    }
    factsClean(q.id, `${q.title} ${q.giver} ${q.reward?.badge ?? ""}`);
    prev = q;
  }
  for (const p of SL.SL_PARISH_IDS) { if (!visited.has(p)) fail("arc", `the arc never reaches ${p}`); else ok(); }
  if (crossings.size < 4) fail("arc", `the arc crosses ${crossings.size} connectors, fewer than four`); else ok();
  for (const k of ["bridge", "causeway", "ferry", "road"]) { if (!kinds.has(k)) fail("arc", `the arc never uses a ${k}`); else ok(); }
  const siteKinds = new Set(Q.flatMap((q) => [SL.slSiteDef(q.parish, q.site), ...q.steps.map((s) => s.type === "goto" ? SL.slSiteDef(s.parish, s.site) : s.type === "cross" ? SL.slSiteDef(s.to.parish, s.to.site) : null)]).filter(Boolean).map((s) => s.kind));
  for (const k of ["levee", "pump-station", "port", "hospital", "staging"]) { if (!siteKinds.has(k)) fail("arc", `the storm-season arc never visits a ${k} site`); else ok(); }
}

// ------------------------------------------------------------ side games and mechanics
{
  const games = SL.SL_SIDE_GAMES;
  if (games.length < 25) fail("games", `${games.length} side games, fewer than twenty-five`); else ok();
  if (SL.SL_GATED !== games) fail("games", "SL_GATED is not the side games list"); else ok();
  const used = new Map(), ids = new Set(), cosmetics = new Set();
  for (const g of games) {
    if (ids.has(g.id)) fail("games", `duplicate id ${g.id}`); else ok(); ids.add(g.id);
    if (g.world !== SL.SL_WORLD || g.kind !== "side-game") fail("games", `${g.id}: not a parishes side game`); else ok();
    if (!MX.QM_MECHANICS[g.mechanic] || MX.qmMechanicFor(g) !== g.mechanic) fail("games", `${g.id}: mechanic "${g.mechanic}" is not explicit or not one of the twelve`); else ok();
    used.set(g.mechanic, (used.get(g.mechanic) ?? 0) + 1);
    if (!g.reward?.cosmetic) fail("games", `${g.id}: no cosmetic reward`); else ok();
    if (cosmetics.has(g.reward?.cosmetic)) fail("games", `${g.id}: cosmetic "${g.reward.cosmetic}" is another game's`); else ok(); cosmetics.add(g.reward?.cosmetic);
    if (!g.task || !g.summary) fail("games", `${g.id}: no task or summary`); else ok();
    for (const k of g.practices ?? []) { if (!SG.QM_SAFE_PRACTICES[k]) fail("games", `${g.id}: unknown practice ${k}`); else ok(); }
    if (G.qmGateProblems(g.gate).length) fail("games", `${g.id}: ${G.qmGateProblems(g.gate).join("; ")}`); else ok();
    for (const st of g.gate.stations ?? []) { if (!STATIONS.has(st)) fail("games", `${g.id}: gate station ${st}`); else ok(); }
    for (const st of g.gate.k12 ?? []) { if (!K12.has(st)) fail("games", `${g.id}: gate K-12 station ${st}`); else ok(); }
    factsClean(g.id, `${g.title} ${g.summary} ${g.gate.note} ${g.reward?.cosmetic ?? ""} ${g.task}`);
  }
  for (const k of MX.QM_MECHANIC_KEYS) { if (!used.get(k)) fail("games", `mechanic ${k} is used by no parish game`); else ok(); }
  if (!games.some((g) => g.gate.k12?.length)) fail("games", "no parish game carries a K-12 gate"); else ok();
  for (const p of SL.SL_PARISHES) { if (SL.slGamesFor(p.id).length < 5) fail("games", `${p.name} has fewer than five games`); else ok(); }
  console.log(`  mechanics: ${[...used.entries()].map(([k, n]) => `${k} ${n}`).join(", ")}`);
}

// ------------------------------------------------------------ field lessons (anchors only; the words are check_k12's)
for (const l of SL.SL_FIELD_LESSONS) {
  if (!SL.slSiteDef(l.parish, l.site)) fail("lessons", `${l.id}: ${l.parish}/${l.site} is not a site`); else ok();
  if (!K12.has(l.k12) || !STATIONS.has(l.station)) fail("lessons", `${l.id}: k12 or trade station does not resolve`); else ok();
  factsClean(l.id, [l.title, l.tradeLine, ...l.steps, l.check.q, ...l.check.options, l.check.why].join(" "));
}
for (const p of SL.SL_PARISHES) for (const s of p.sites) { if (!SL.slLessonsFor(p.id, s.id).length) fail("lessons", `${p.id}/${s.id} has no field lesson`); else ok(); }

// ------------------------------------------------------------ NPC hand-offs
{
  const H = SL.SL_HANDOFFS;
  const ids = new Set();
  const tzIds = new Set(TZ.TZ_TREASURES.map((t) => t.id));
  for (const h of H) {
    if (ids.has(h.id)) fail("handoffs", `duplicate ${h.id}`); else ok(); ids.add(h.id);
    if (!SL.SL_HANDOFF_KINDS.includes(h.kind) || !SL.slSiteDef(h.parish, h.site)) fail("handoffs", `${h.id}: bad kind or site`); else ok();
    if (h.giver !== SL.slSiteDef(h.parish, h.site)?.giver) fail("handoffs", `${h.id}: giver is not the site's`); else ok();
    if (!SRC.includes(`"${h.line}"`)) fail("handoffs", `${h.id}: line does not re-read verbatim from the module`); else ok();
    if (!h.source?.file || !existsSync(join(ROOT, h.source.file))) fail("handoffs", `${h.id}: no source file`); else ok();
    const t = SL.slHandoffTarget(h);
    if (h.kind === "station") { if (!STATIONS.has(h.target) || !t?.href?.includes(`sim=${h.target}`) || !t.href.includes("from=parishes")) fail("handoffs", `${h.id}: station target does not resolve`); else ok(); }
    else if (h.kind === "lesson") { if (!SL.slLesson(h.target) || !t?.href?.includes(`#lesson=${h.target}`) || !K12.has(t.k12)) fail("handoffs", `${h.id}: lesson target does not resolve`); else ok(); }
    else if (h.kind === "game") { if (!SL.slGameById(h.target) || !t?.href?.includes("#game=") || typeof t.open !== "boolean" || !Array.isArray(t.missing)) fail("handoffs", `${h.id}: game target does not resolve with its lock state`); else ok(); }
    else if (h.kind === "treasure") { if (!tzIds.has(h.target) || t?.href !== null || t?.id !== null) fail("handoffs", `${h.id}: treasure hint ${h.target} does not name a hidden treasure, or gives it away`); else ok(); }
    factsClean(h.id, `${h.line} ${h.giver}`);
  }
  for (const p of SL.SL_PARISHES) for (const s of p.sites) {
    const here = SL.slHandoffsFor({ parish: p.id, site: s.id });
    for (const k of ["station", "lesson", "treasure"]) { if (!here.some((h) => h.kind === k)) fail("handoffs", `${p.id}/${s.id} has no ${k} hand-off`); else ok(); }
  }
  if (SL.slHandoffsFor({ parish: "orleans", kind: "game" }).length < 5) fail("handoffs", "Orleans offers fewer than five game hand-offs"); else ok();
  if (SL.slHandoffIds().length !== H.length) fail("handoffs", "slHandoffIds does not list every hand-off"); else ok();
  // A game hand-off reads the learner's completions: locked on a fresh profile, open with its stations done.
  const gh = H.find((h) => h.kind === "game" && SL.slGameById(h.target)?.gate.stations?.length && !SL.slGameById(h.target).gate.k12);
  globalThis.localStorage.clear(); G.qmInvalidate();
  if (SL.slHandoffTarget(gh).open) fail("handoffs", `${gh.id}: open on a fresh profile`); else ok();
  globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify(SL.slGameById(gh.target).gate.stations.map((simId) => ({ simId, stars: 1 }))));
  G.qmInvalidate();
  if (!SL.slHandoffTarget(gh).open) fail("handoffs", `${gh.id}: still locked with its stations done`); else ok();
  globalThis.localStorage.clear(); G.qmInvalidate();
}

// ------------------------------------------------------------ the "choose your path" board
{
  const runnerPage = (href) => join(WEBXR, "parishes", href.split("?")[0].split("#")[0]);
  for (const p of SL.SL_PARISHES) {
    const m = SL.slPathBoard(p.id, { treasures: 3 });
    if (!m || m.paths.length !== 3 || m.paths.map((x) => x.id).join() !== "trade,classroom,play") fail("board", `${p.id}: not three paths (trade, classroom, play)`); else ok();
    const [trade, classroom, play] = m.paths;
    if (trade.rows.length !== p.sites.length) fail("board", `${p.id}: the trade path does not list every site`); else ok();
    for (const r of trade.rows) for (const st of r.stations) { if (!st.href.includes(`sim=${st.id}`) || !existsSync(runnerPage(st.href))) fail("board", `${p.id}: station link ${st.href} does not route to a page`); else ok(); }
    if (classroom.rows.length !== SL.slLessonsFor(p.id).length || classroom.rows.length < 5) fail("board", `${p.id}: the classroom path does not list its lessons`); else ok();
    if (play.rows.length !== SL.slGamesFor(p.id).length || play.rows.length < 5 || !play.arc.length || play.treasures !== 3) fail("board", `${p.id}: the play path does not list its games, arc and treasure count`); else ok();
    if (play.rows.some((r) => r.open)) fail("board", `${p.id}: a game is open on a fresh profile`); else ok();
    // Rendered: a locked game shows its note and a link to each required station; nothing is hidden; no emoji.
    const el = { innerHTML: "", querySelectorAll: () => [] };
    const model = SL.slMountPathBoard(el, p.id, { treasures: 3 });
    if (!model || !el.innerHTML.includes("Choose your path") || !el.innerHTML.includes(`aria-label="Choose your path in ${p.name}"`)) fail("board", `${p.id}: the board did not render`); else ok();
    for (const g of SL.slGamesFor(p.id)) {
      if (!el.innerHTML.includes(g.title) || !el.innerHTML.includes(g.gate.note.replace(/&/g, "&amp;").replace(/'/g, "&#39;"))) fail("board", `${p.id}: locked game ${g.id} or its note is missing from the board`); else ok();
      for (const st of g.gate.stations ?? []) { if (!el.innerHTML.includes(`sim=${st}`)) fail("board", `${p.id}: no link to required station ${st}`); else ok(); }
    }
    for (const l of SL.slLessonsFor(p.id)) { if (!el.innerHTML.includes(`#lesson=${l.id}`)) fail("board", `${p.id}: lesson ${l.id} missing from the board`); else ok(); }
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(el.innerHTML)) fail("board", `${p.id}: the board carries an emoji icon`); else ok();
    if (!el.innerHTML.includes("Locked:")) fail("board", `${p.id}: locked games do not read as locked`); else ok();
  }
  if (SL.slPathBoard("nowhere") !== null) fail("board", "an unknown parish returned a board"); else ok();
  // With the stations done, the board opens the game and drops the lock.
  const g = SL.SL_SIDE_GAMES.find((x) => x.gate.stations?.length && !x.gate.k12);
  globalThis.localStorage.setItem("vr-training-records-v1", JSON.stringify(g.gate.stations.map((simId) => ({ simId, stars: 1 }))));
  G.qmInvalidate();
  const row = SL.slPathBoard(g.parish).paths[2].rows.find((r) => r.id === g.id);
  if (!row?.open || row.missing.length) fail("board", `${g.id}: not open with its stations done`); else ok();
  globalThis.localStorage.clear(); G.qmInvalidate();
  for (const p of SL.SL_PATHS) factsClean(`path ${p.id}`, `${p.title} ${p.blurb}`);
}

// ------------------------------------------------------------ parish treasures (the caches; the ledger rules are check_treasures's)
{
  const caches = TZ.TZ_TREASURES.filter((t) => t.surface === "parishes" && t.how === "proximity");
  const finds = TZ.TZ_TREASURES.filter((t) => t.surface === "parishes" && t.how === "lesson");
  if (caches.length < 40) fail("treasures", `${caches.length} storm kit caches, fewer than forty`); else ok();
  for (const p of SL.SL_PARISHES) for (const s of p.sites) { if (!caches.some((t) => t.id === `tz-parish-${p.id}-${s.id}`)) fail("treasures", `${p.id}/${s.id} has no cache`); else ok(); }
  for (const t of caches) { if ("x" in t.trigger || "z" in t.trigger || !(SL.slSiteDef(t.trigger.parish, t.trigger.site) || sgSiteDef(t.trigger.parish, t.trigger.site))) fail("treasures", `${t.id}: not a site-relative trigger`); else ok(); }
  const nLessons = SL.SL_FIELD_LESSONS.length + SGP.SG_FIELD_LESSONS.length + PLP.PL_FIELD_LESSONS.length;
  if (finds.length !== nLessons) fail("treasures", `${finds.length} quiet lesson finds for ${nLessons} lessons`); else ok();
  for (const d of SGP.SG_DISTRICTS) for (const x of d.sites) { if (!caches.some((t) => t.id === `tz-parish-${d.id}-${x.id}`)) fail("treasures", `${d.id}/${x.id} has no fog-day kit`); else ok(); }
  for (const d of PLP.PL_DISTRICTS) for (const x of d.sites) { if (!caches.some((t) => t.id === `tz-parish-${d.id}-${x.id}`)) fail("treasures", `${d.id}/${x.id} has no crew kit`); else ok(); }
  if (!/\blonlat\b|\bposition: \[|\bxz: \[|\bapproximate: true\b/.test(SRC)) ok(); else fail("facts", "sl-parish-play.js carries a coordinate or a position");
  if (!SL.slSitePlay("orleans", "port-terminal").arc.includes("sl-main-03-tie-down-the-port")) fail("treasures", "slSitePlay does not list the arc quest at the port"); else ok();
}

// ------------------------------------------------------------ binding to the parish data modules, when present
{
  let bound = 0, skipped = 0;
  for (const p of SL.SL_PARISHES) {
    const file = join(WEBXR, "shared", `np-data-${p.id}.js`);
    if (!existsSync(file)) { skipped += 1; continue; }
    let mod;
    try { mod = await import(pathToFileURL(file)); } catch (e) { fail("bind", `np-data-${p.id}.js would not import: ${e.message}`); continue; }
    const data = Object.values(mod).find((v) => v && typeof v === "object" && Array.isArray(v.sites));
    if (!data) { fail("bind", `np-data-${p.id}.js exports no parish object with sites`); continue; }
    for (const s of p.sites) { if (!SL.slResolveSite(data, s.id)) fail("bind", `${p.id}/${s.id} binds to no site in np-data-${p.id}.js (${data.sites.map((x) => x.id).join(", ")})`); else ok(); }
    for (const c of SL.SL_CONNECTORS.filter((c) => c.from === p.id || c.to === p.id)) { if (!SL.slResolveConnector(data.connectors, c.id)) fail("bind", `${c.id} binds to no connector in np-data-${p.id}.js`); else ok(); }
    bound += 1;
  }
  console.log(`  · parish data modules: ${bound} bound, ${skipped} not in this tree yet (PARISH and DELTA build them; binding is checked when they land)`);
}

// ------------------------------------------------------------ hygiene, docs, check_all
for (const m of SRC.matchAll(/^(?:export )?(?:const|let|function|class) ([A-Za-z_$][\w$]*)/gm)) { if (!/^sl|^SL_/.test(m[1])) fail("hygiene", `top-level ${m[1]} lacks the sl prefix`); else ok(); }
if (/THREE\./.test(SRC)) fail("hygiene", "sl-parish-play.js spells the three.js global"); else ok();
if (/from\s+["']https?:/.test(SRC)) fail("hygiene", "sl-parish-play.js imports from a CDN"); else ok();
if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(SRC)) fail("hygiene", "sl-parish-play.js carries an emoji"); else ok();
if (!rd("tools/check_all.mjs").includes('"check_parish_play.mjs"')) fail("wiring", "check_all.mjs does not run check_parish_play.mjs"); else ok();
if (!existsSync(join(ROOT, "docs/parish-play.md"))) fail("docs", "docs/parish-play.md is missing"); else ok();
for (const [f, needle] of [["tools/check_gates.mjs", "SL_GATED"], ["tools/check_treasures.mjs", "slTreasureAt"], ["tools/check_k12.mjs", "SL_FIELD_LESSONS"], ["tools/gen_treasures.mjs", "SL_FIELD_LESSONS"], ["tools/gen_gate_names.mjs", "SL_GATED"]]) {
  if (!rd(f).includes(needle)) fail("wiring", `${f} does not read ${needle}`); else ok();
}

const c = SL.slCounts();
console.log(`\n  ${c.parishes} parishes · ${c.sites} sites · ${c.mainQuests} main quests · ${c.sideGames} side games · ${c.fieldLessons} field lessons · ${c.handoffs} hand-offs · ${c.connectors} connectors · ${passed} checks · ${failed} failed`);
if (failed) process.exit(1);
console.log("All parish play checks pass.");
