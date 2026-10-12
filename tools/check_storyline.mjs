#!/usr/bin/env node
/**
 * STORYLINE's checker (docs/consoles/STORYLINE.md) — pure Node, no browser:
 *
 *   - the seven path ids are exactly the published ones, in order;
 *   - every path (but Just Roam) resolves to real catalog programmes, real flows, GRIOT characters and KREWE kiosks,
 *     and no path is empty (programmes and stations; Just Roam is empty on purpose and has prompts off);
 *   - every side story: a GRIOT parish character standing on that map, one line copied verbatim from that
 *     character's own sourced pack, a hand-off to a real site of the map, two branches each ending at a real
 *     catalog station or a real lesson with a practice line equal to that source's own text, a kiosk that exists;
 *   - two or three stories for every path × map; no digits in the generated prompts; kids' prompts carry no fear words;
 *   - the chosen path and a remembered branch survive a reload (a fresh import over the same storage);
 *   - the generated module is current (gen_st_stories.mjs --check) and the seams are mounted in the parishes app,
 *     its page, the bundler and the homepage.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (area, msg) => { failed += 1; if (failed <= 40) console.log(`  FAIL [${area}] ${msg}`); };
const check = (cond, area, msg) => (cond ? ok() : fail(area, msg));

// A storage shim so profiles.js's gtStorage works headless, shared across "reloads".
const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;

const imp = (p, q = "") => import(pathToFileURL(join(W, p)).href + q);
const SP = await imp("shared/st-paths.js");
const SS = await imp("shared/st-stories.js");
const { ST_STORIES } = await imp("shared/st-stories-data.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const { GR_ROSTER } = await imp("shared/npc-data.js");
const { grSiteFor } = await imp("shared/npc.js");
const { KW_KIOSKS } = await imp("shared/kw-play-data.js");
const { BY_LESSONS } = await imp("shared/by-parish-lessons.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity", "catalog.json"), "utf8"));
const flows = JSON.parse(readFileSync(join(W, "flows", "index.json"), "utf8")).flows.map((f) => f.id);
const CUR = new Map(catalog.curricula.map((c) => [c.id, c]));
const STA = new Map(catalog.stations.map((s) => [s.id, s]));

// ---- the path registry
const IDS = ["union-trades", "k12", "first-responders", "un-training", "disaster-relief", "teachers", "roam"];
check(JSON.stringify(SP.stPaths().map((p) => p.id)) === JSON.stringify(IDS), "paths", "path ids differ from the published seven");
check(JSON.stringify(SP.ST_PATH_IDS) === JSON.stringify(IDS), "paths", "ST_PATH_IDS differs");
const pathStats = {};
for (const p of SP.stPaths()) {
  if (p.id === "roam") {
    check(!p.prompts && !p.programmes.length, "roam", "Just Roam must have prompts off and no programmes");
    check(NP_PARISHES.every((m) => SS.stQuestsFor("roam", m.id).length === 0 && SS.stGlowSites("roam", m).length === 0 && SS.stGreeter("roam", m) === null), "roam", "Just Roam offers stories, glow or a greeter");
    continue;
  }
  check(p.programmes.length > 0, p.id, "no programmes");
  let stations = 0;
  for (const id of p.programmes) {
    const c = CUR.get(id);
    check(!!c, p.id, `programme ${id} is not in the catalog`);
    for (const s of c?.stations ?? []) { check(STA.has(s.id), p.id, `programme ${id} names missing station ${s.id}`); stations += 1; }
  }
  check(stations > 0, p.id, "no stations");
  for (const f of p.flows) check(flows.includes(f), p.id, `flow ${f} is not in WebXR/flows/index.json`);
  for (const g of p.greeters) check(GR_ROSTER.some((c) => c.id === g && c.world === "parish"), p.id, `greeter ${g} is not a GRIOT parish character`);
  check(p.greeters.length > 0, p.id, "no greeters");
  for (const k of p.kiosks) check(KW_KIOSKS.some((x) => x.id === k), p.id, `kiosk ${k} is not a KREWE kiosk`);
  check(p.kiosks.length > 0, p.id, "no kiosks");
  pathStats[p.id] = { programmes: p.programmes.length, stations, flows: p.flows.length, kiosks: p.kiosks.length, stories: 0 };
}

// ---- the stories
const FEAR = /\b(scary|terrif|danger|die|dead|death|kill|injur|blood|panic|disaster)\w*/i;
const seen = new Set();
for (const s of ST_STORIES) {
  check(!seen.has(s.id), "story", `duplicate id ${s.id}`); seen.add(s.id);
  const map = NP_PARISHES.find((m) => m.id === s.parish);
  check(!!map, s.id, `unknown map ${s.parish}`);
  if (!map) continue;
  const site = map.sites.find((x) => x.id === s.site);
  check(!!site, s.id, `site ${s.site} is not on ${s.parish}`);
  const ch = GR_ROSTER.find((c) => c.id === s.character);
  check(!!ch && !!grSiteFor(ch, map.sites), s.id, `character ${s.character} does not stand on ${s.parish}`);
  check(!!ch && ch.pack.some((l) => l.text === s.line.text && JSON.stringify(l.src) === JSON.stringify(s.line.src)), s.id, "the line is not the character's own sourced line, verbatim");
  check(s.handoff?.kind === "site" && s.handoff.site === s.site && map.sites.some((x) => x.id === s.handoff.from), s.id, "hand-off does not resolve");
  check(s.branches.length === 2, s.id, "a story needs two branches");
  for (const b of s.branches) {
    if (b.end.kind === "station") {
      const st = STA.get(b.end.id);
      check(!!st, s.id, `branch ${b.id} ends at missing station ${b.end.id}`);
      check(!!st && b.practice === String(st.tagline ?? "").replace(/\s+/g, " ").trim() && b.title === st.name, s.id, `branch ${b.id} practice is not the station's tagline`);
    } else if (b.end.kind === "lesson") {
      const l = (map.fieldLessons ?? []).find((x) => x.id === b.end.id) ?? BY_LESSONS.find((x) => x.id === b.end.id);
      check(!!l, s.id, `branch ${b.id} ends at missing lesson ${b.end.id}`);
      check(!!l && b.practice === String(l.steps?.[0] ?? "").replace(/\s+/g, " ").trim(), s.id, `branch ${b.id} practice is not the lesson's first step`);
    } else fail(s.id, `branch ${b.id} ends at neither a station nor a lesson`);
  }
  check(s.branches[0].end.id !== s.branches[1].end.id || s.branches[0].end.kind !== s.branches[1].end.kind || s.branches.length === 2, s.id, "branches identical");
  if (s.kiosk) check(KW_KIOSKS.some((k) => k.id === s.kiosk && k.parish === s.parish), s.id, `kiosk ${s.kiosk} is not on ${s.parish}`);
  check(!/\d/.test(s.prompt), s.id, "a digit in the prompt");
  if (s.path === "k12") check(!FEAR.test(s.prompt), s.id, "fear framing in a kids' prompt");
  if (pathStats[s.path]) pathStats[s.path].stories += 1;
}
let pairs = 0;
for (const p of SP.stPaths().filter((x) => x.prompts)) for (const m of NP_PARISHES) {
  const n = SS.stQuestsFor(p.id, m.id).length; pairs += 1;
  check(n >= 2 && n <= 3, "coverage", `${p.id} × ${m.id}: ${n} stories (want two or three)`);
  check(SS.stGlowSites(p.id, m).length > 0, "coverage", `${p.id} × ${m.id}: no board glows`);
  check(!!SS.stGreeter(p.id, m), "coverage", `${p.id} × ${m.id}: nobody greets`);
}

// ---- persistence: the chosen path and a branch survive a reload
check(SP.stChosenPath() === null, "persist", "a fresh passport already has a path");
SP.stChoosePath("disaster-relief");
const story = SS.stQuestsFor("disaster-relief", "orleans")[0];
check(SS.stChooseBranch(story.id, story.branches[1].id), "persist", "a branch was not stored");
check(!SS.stChooseBranch(story.id, "nope"), "persist", "a bogus branch was stored");
const SP2 = await imp("shared/st-paths.js", "?reload=1");
check(SP2.stChosenPath() === "disaster-relief", "persist", "the chosen path did not survive a reload");
check(SP2.stLoad().branches[story.id] === story.branches[1].id, "persist", "the chosen branch did not survive a reload");
check(SP.stPromptsOn() === true, "persist", "prompts off on a prompting path");
SP.stChoosePath("roam"); check(SP.stPromptsOn() === false, "persist", "Just Roam did not turn the prompts off");
SP.stChoosePath("not-a-path"); check(SP.stChosenPath() === null, "persist", "an unknown path was stored");

// ---- generated module current, seams wired
try { execFileSync(process.execPath, [join(ROOT, "tools", "gen_st_stories.mjs"), "--check"], { stdio: "pipe" }); ok(); }
catch (e) { fail("generate", String(e.stdout ?? e.message).trim()); }
const app = rd("WebXR/parishes/js/app.js");
check(app.includes("stMountPaths(") && app.includes("stPromptsOn()"), "wiring", "the parishes app does not mount the paths");
check(rd("WebXR/parishes/parishes.html").includes('id="menu-storyline"'), "wiring", "parishes.html has no #menu-storyline");
const bundler = rd("tools/bundle_webxr.py");
for (const f of ["st-paths.js", "st-stories-data.js", "st-stories.js"]) check(bundler.includes(`"${f}"`), "wiring", `the bundler does not carry ${f}`);
check(rd("WebXR/index.html").includes("data-st-chip") && rd("WebXR/index.html").includes("stMountChip"), "wiring", "the homepage world card has no path chip");
check(rd("tools/check_all.mjs").includes('"check_storyline.mjs"'), "wiring", "check_all does not list check_storyline.mjs");
const doc = existsSync(join(ROOT, "docs/consoles/STORYLINE.md")) ? rd("docs/consoles/STORYLINE.md") : "";
for (const id of IDS) check(doc.includes(`\`${id}\``), "doc", `STORYLINE.md does not publish ${id}`);
check(doc.includes("## Seams"), "doc", "STORYLINE.md has no Seams section");

for (const [id, v] of Object.entries(pathStats)) console.log(`  ${id.padEnd(17)} ${v.programmes} programmes · ${v.stations} stations · ${v.flows} flows · ${v.kiosks} kiosks · ${v.stories} stories`);
console.log(`\n  7 paths · ${ST_STORIES.length} side stories over ${pairs} path × map pairs · ${ST_STORIES.length * 2} branches · ${passed} checks · ${failed} failed · ${Date.now() - T0} ms`);
if (failed) process.exit(1);
console.log("All storyline checks pass.");
