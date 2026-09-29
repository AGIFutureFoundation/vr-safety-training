#!/usr/bin/env node
/**
 * SMILES (docs/consoles/SMILES.md): the Unspoken Smiles District and its games.
 *   - the map is registered in region `programmes`, labelled procedural, held strict, twelve or more sites, every
 *     site's stations exist in the catalog and each site carries a station of the two Unspoken Smiles programmes;
 *   - every game line traces to a station's own text (the quote re-reads verbatim in its sim file; a K-12 line uses only
 *     words that station's text uses; an adult line is the quote itself); no digits; K-12 lines short and free of fear words;
 *   - K-12 content only in K-12 spots (games, field lessons, treasures), the adult-only sterilisation order only at an adult
 *     site and never offered in a K-12 session;
 *   - games are deterministic, one safe move per step, a clean run scores and pays once;
 *   - the treasures (gen_treasures.mjs) sit at this map's K-12 sites and re-read their lessons;
 *   - the panel is wired (app import and mount, the Play tab, check_interface, the bundler).
 *
 *     node tools/check_smiles.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let passes = 0, failures = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.error(`  FAIL ${msg}`); } return ok; };
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);

const R = await imp("shared/np-parishes.js");
const S = await imp("shared/sm-smiles.js");
const catalog = JSON.parse(rd("WebXR/smartcity/catalog.json"));
const stations = new Set(catalog.stations.map((s) => s.id));
const { CURRICULA } = await imp("smartcity/js/curricula.js");
const programmeStations = new Set(CURRICULA.filter((c) => /unspoken-smiles/.test(c.id)).flatMap((c) => c.stations.map((s) => s.id)));

// ---------------------------------------------------------------- the map
const P = R.npParish(S.SMILES_MAP);
check(!!P, `${S.SMILES_MAP} is registered`);
const src = rd("WebXR/shared/np-data-sm-unspoken-smiles.js");
check(P?.region === "programmes" && R.npRegion("programmes")?.name === "Programme Worlds", "region programmes (Programme Worlds)");
check(/PROCEDURAL/.test(src) && /NOT A REAL PLACE/.test(src) && P?.procedural === true && /procedural/i.test(P?.blurb ?? "") && /not a real place/i.test(P?.blurb ?? ""), "the module, the flag and the blurb label the world procedural and not a real place");
check(/"sm-unspoken-smiles"/.test(rd("tools/check_parishes.mjs").match(/NP_ENGINE_STRICT = new Set\(\[[^\]]*\]\)/)?.[0] ?? ""), "held to the strict engine in check_parishes");
check(P?.anchors.every((a) => Math.abs(a.lonlat[0]) < 0.05 && Math.abs(a.lonlat[1]) < 0.05 && /nominal/.test(a.name)), "the anchors sit on the nominal frame and say so");
check((P?.sites ?? []).length >= 12, `twelve or more sites (${P?.sites.length})`);
for (const s of P?.sites ?? []) {
  check(s.stations.length >= 2 && s.stations.every((id) => stations.has(id)), `${s.id}: every station exists in the catalog`);
  check(s.stations.some((id) => programmeStations.has(id)), `${s.id}: carries a station of the Unspoken Smiles programmes`);
  check(s.programmes.every((id) => /unspoken-smiles/.test(id)), `${s.id}: programmes are the Unspoken Smiles programmes`);
}
for (const kind of ["clinic", "school", "outreach", "civic", "market", "plaza", "park", "campus"]) check(P?.sites.some((s) => s.kind === kind), `a ${kind} site`);
const k12Sites = new Set((P?.sites ?? []).filter((s) => s.k12).map((s) => s.id));
const ADULT_ONLY = /sterilis|surgical|service yard|sharps|amalgam/i;
for (const s of P?.sites ?? []) if (ADULT_ONLY.test(`${s.name} ${s.stations.join(" ")}`) && s.stations.some((id) => /instrument-reprocessing|sterilisation|surgery|sharps|amalgam/.test(id))) check(!s.k12, `${s.id}: an adult-only procedure site is not a K-12 spot`);

// ---------------------------------------------------------------- lines trace to the stations
const FEAR = /\b(die|dies|death|dead|lose|lost|pain|hurt|scary|scare|rot|rotten|infect\w*|disease|bleed\w*|blood|cancer|decay|germs?|danger\w*|kill\w*|bad)\b/i;
const GAME_WORDS = new Set(["your", "you", "goes", "there", "often", "look", "after", "with", "that", "this", "what", "which"]);
const fileWords = new Map();
const words = (t) => (t.toLowerCase().match(/[a-z][a-z'-]*/g) ?? []).map((w) => w.replace(/'s$/, ""));
for (const l of S.SMILES_LINES) {
  const file = `WebXR/smartcity/js/sims/${l.station}.js`;
  if (!check(existsSync(join(ROOT, file)) && stations.has(l.station), `${l.id}: station ${l.station} and its sim file exist`)) continue;
  const text = rd(file);
  if (!fileWords.has(file)) fileWords.set(file, new Set(words(text)));
  check(text.includes(l.quote), `${l.id}: the quote re-reads verbatim in ${file}`);
  check(!/\d/.test(l.text + l.quote), `${l.id}: no digits`);
  if (l.band === "adult") check(l.text === l.quote, `${l.id}: an adult line is the station's own words`);
  else {
    const extra = words(l.text).filter((w) => w.length >= 4 && !GAME_WORDS.has(w) && !fileWords.get(file).has(w));
    check(extra.length === 0, `${l.id}: every word of the K-12 line is the station's own (${extra.join(", ") || "ok"})`);
    check(words(l.text).length <= 16, `${l.id}: at the K-12 reading ceiling (${words(l.text).length} words)`);
    check(!FEAR.test(l.text), `${l.id}: no fear framing`);
  }
}

// ---------------------------------------------------------------- games
const lineById = new Map(S.SMILES_LINES.map((l) => [l.id, l]));
check(S.SMILES_GAMES.length >= 6, `six or more games (${S.SMILES_GAMES.length})`);
for (const want of ["brushing", "floss", "sugar", "plaque", "sterilisation", "handwashing"]) check(S.SMILES_GAMES.some((g) => g.id.includes(want)), `a ${want} game`);
for (const g of S.SMILES_GAMES) {
  const site = P?.sites.find((s) => s.id === g.site);
  check(!!site, `${g.id}: sits at a site of the map`);
  check(stations.has(g.station) && programmeStations.has(g.station), `${g.id}: pays through an Unspoken Smiles station`);
  check(g.lines.every((id) => lineById.get(id)?.station && lineById.get(id)), `${g.id}: every line exists`);
  if (g.audience === "k12") {
    check(k12Sites.has(g.site), `${g.id}: a K-12 game sits at a K-12 spot`);
    check(g.lines.every((id) => lineById.get(id)?.band === "k12"), `${g.id}: a K-12 game teaches only K-12 lines`);
  } else check(g.audience === "adult" && !k12Sites.has(g.site), `${g.id}: an adult game sits away from every K-12 spot`);
  const steps = S.smilesSteps(g.id);
  check(steps.length >= 3 && JSON.stringify(steps) === JSON.stringify(S.smilesSteps(g.id)), `${g.id}: three or more steps, deterministic`);
  check(steps.every((s) => s.options.filter((o) => o.safe).length === 1 && s.options.length >= 2), `${g.id}: exactly one safe move per step`);
  const taught = new Set(g.lines.map((id) => lineById.get(id)?.text));
  check(steps.every((s) => taught.has(s.teach)), `${g.id}: every step teaches one of the game's traced lines`);
  const ui = steps.flatMap((s) => [...s.board, s.prompt, ...s.options.map((o) => o.text)]).join(" ");
  check(!/\d/.test(ui + g.title + g.blurb), `${g.id}: no digits in the game text`);
  if (g.audience === "k12") check(!FEAR.test(ui + g.title + g.blurb), `${g.id}: no fear framing in the game text`);
  const clean = steps.map((s) => s.options.findIndex((o) => o.safe));
  const r = S.smilesScore(g.id, clean), miss = S.smilesScore(g.id, clean.map((k) => 1 - k));
  check(r.clean && r.correct === steps.length && !miss.clean && miss.correct === 0, `${g.id}: a clean run scores in full, a missed run does not`);
  let paid = 0; const earn = () => { paid++; return { paid: true }; };
  const p1 = S.smilesPay(g.id, clean, earn), p2 = S.smilesPay(g.id, clean, earn);
  check(p1.paid && !p2.paid && paid === 1, `${g.id}: pays once`);
}
check(S.smilesGamesFor(S.SMILES_MAP, { k12: true }).every((g) => g.audience === "k12") && S.smilesGamesFor(S.SMILES_MAP).some((g) => g.audience === "adult"), "a K-12 session is never offered the adult game");
check(S.smilesGamesFor("orleans").length === 0, "no games off the Unspoken Smiles map");

// ---------------------------------------------------------------- field lessons: K-12 only in K-12 spots
for (const f of P?.fieldLessons ?? []) {
  check(k12Sites.has(f.site), `${f.id}: at a K-12 spot`);
  check(f.id.startsWith("sm-fl-") && stations.has(f.station) && programmeStations.has(f.station), `${f.id}: an sm-fl- lesson with an Unspoken Smiles station`);
  const t = [f.title, f.tradeLine, ...f.steps, f.check.q, ...f.check.options, f.check.why].join(" ");
  check(!FEAR.test(t) && !/\d/.test(t), `${f.id}: no fear framing and no figures`);
  check(!/steril|autoclave|scalpel|needle/i.test(t), `${f.id}: no adult-only procedure`);
}

// ---------------------------------------------------------------- treasures
const TD = await imp("shared/treasures-data.js");
const tz = (TD.TZ_TREASURES ?? TD.TREASURES ?? []).filter((t) => t.trigger?.parish === S.SMILES_MAP);
check(tz.length >= 6, `six or more treasures on the map (${tz.length})`);
for (const t of tz) {
  check(k12Sites.has(t.trigger.site), `${t.id}: at a K-12 spot`);
  check(t.source?.file && rd(t.source.file).includes(`"${t.lesson}"`), `${t.id}: the lesson re-reads in ${t.source?.file}`);
  check(!/\d/.test(t.lesson) && !FEAR.test(t.lesson + t.name + (t.hint ?? "")), `${t.id}: no figures, no fear framing`);
}

// ---------------------------------------------------------------- wiring
const app = rd("WebXR/parishes/js/app.js"), html = rd("WebXR/parishes/parishes.html");
check(/import \{ smilesMount \} from "\.\.\/\.\.\/shared\/sm-smiles\.js";/.test(app) && /smilesMount\(\{/.test(app), "the parishes app imports and mounts the panel");
const playPanel = html.match(/id="ux-panel-play"[\s\S]*?(?=<div class="ux-panel")/)?.[0] ?? "";
check(playPanel.includes('id="menu-smiles"'), "menu-smiles sits in the Play tab");
check(/play: \[[^\]]*"menu-smiles"/.test(rd("tools/check_interface.mjs")), "check_interface lists menu-smiles in the Play tab");
check(rd("tools/bundle_webxr.py").includes('SHARED / "sm-smiles.js"'), "the bundler carries sm-smiles.js");

console.log(`check_smiles: ${P?.sites.length ?? 0} sites, ${S.SMILES_GAMES.length} games, ${S.SMILES_LINES.length} traced lines, ${(P?.fieldLessons ?? []).length} K-12 field lessons, ${tz.length} treasures — ${passes} checks pass, ${failures} fail`);
process.exit(failures ? 1 : 0);
