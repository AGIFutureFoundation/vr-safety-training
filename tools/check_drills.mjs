#!/usr/bin/env node
/**
 * DRILLS' checker (docs/consoles/DRILLS.md) — pure Node, no browser:
 *
 *   - four drills (flood, traffic, shelter, cluster), each with a briefing and 3–6 timed objectives;
 *   - every objective resolves to a real catalog station that carries its sourced standards (`certification`), AND to one of that station's own step
 *     ids in WebXR/smartcity/js/sims/<station>.js; its role is a GRIOT parish character; a kiosk, when named, is KREWE's;
 *   - every placement is a real site of a real map, every drill runs somewhere in New Orleans and in San Francisco;
 *   - every drill is reachable from each of its STORYLINE paths (drDrillsFor(path, map) offers it on at least one map),
 *     and the three paths the brief names each offer at least one drill;
 *   - timers and scoring arithmetic (on time, late, unsafe, pass mark), the debrief lists only the drill's objectives
 *     and gives exactly one improvement when something was missed;
 *   - the best score survives a reload and the award goes through the recorder; DEAN's module shape resolves;
 *   - no injury, gore or fear words in any drill text (K-12 visible);
 *   - the mount is wired in the parishes app, its page and the bundler, and check_all lists this checker.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const rd = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const fail = (area, msg) => { failed += 1; if (failed <= 40) console.log(`  FAIL [${area}] ${msg}`); };
const check = (cond, area, msg) => (cond ? (passed += 1) : fail(area, msg));

const mem = new Map();
globalThis.localStorage = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
globalThis.sessionStorage = globalThis.localStorage;
globalThis.window = globalThis;

const imp = (p, q = "") => import(pathToFileURL(join(W, p)).href + q);
const DR = await imp("shared/dr-drills.js");
const SP = await imp("shared/st-paths.js");
const { NP_PARISHES } = await imp("shared/np-parishes.js");
const { GR_ROSTER } = await imp("shared/npc-data.js");
const { KW_KIOSKS } = await imp("shared/kw-play-data.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity", "catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const simSteps = new Map();
const stepsOf = (id) => {
  if (!simSteps.has(id)) {
    const f = join(W, "smartcity", "js", "sims", `${id}.js`);
    // A step is an `id:` whose object carries a title and a cue (hazards and awards carry neither).
    const src = existsSync(f) ? readFileSync(f, "utf8") : null;
    simSteps.set(id, src ? new Set([...src.matchAll(/\bid: "([^"]+)"/g)].filter((m) => { const w = src.slice(m.index, m.index + 1500); const end = w.indexOf("\n    },"); const body = end > 0 ? w.slice(0, end) : w; return /\btitle: "/.test(body) && /\bcue: "/.test(body); }).map((m) => m[1])) : null);
  }
  return simSteps.get(id);
};

// ---- drills and objectives
const drills = DR.drDrills();
check(drills.length === 4, "drills", `expected four drills, found ${drills.length}`);
check(["flood", "traffic", "shelter", "cluster"].every((k) => drills.some((d) => d.kind === k)), "drills", "missing one of flood / traffic / shelter / cluster");
const FEAR = /\b(injur\w*|blood\w*|gore|dead|death|die[sd]?|dying|kill\w*|corpse|victim|terrif\w*|scar(y|ed)|panic|horror|wound\w*|casualt\w*|fatal\w*)\b/i;
let objectives = 0, resolved = 0;
const roles = new Set();
for (const d of drills) {
  check(d.id.startsWith("dr-") && d.name && d.briefing?.length > 40, "drills", `${d.id}: id, name or briefing missing`);
  check(d.objectives.length >= 3 && d.objectives.length <= 6, "drills", `${d.id}: ${d.objectives.length} objectives (3–6)`);
  check(new Set(d.objectives.map((o) => o.id)).size === d.objectives.length, "drills", `${d.id}: duplicate objective ids`);
  const text = [d.name, d.briefing, ...d.objectives.flatMap((o) => [o.title, o.practice, o.safe, o.unsafe])].join(" ");
  check(!FEAR.test(text), "kids", `${d.id}: injury/fear word "${FEAR.exec(text)?.[0]}"`);
  for (const o of d.objectives) {
    objectives += 1;
    const st = stations.get(o.station);
    check(!!st, "resolve", `${d.id}/${o.id}: station ${o.station} is not in the catalog`);
    check(!!st && String(st.certification ?? "").length > 40, "resolve", `${d.id}/${o.id}: station ${o.station} carries no sourced standard (certification)`);
    const steps = stepsOf(o.station);
    check(!!steps && steps.has(o.step), "resolve", `${d.id}/${o.id}: step ${o.step} is not a step of ${o.station}`);
    if (st && steps?.has(o.step)) resolved += 1;
    check(Number.isInteger(o.seconds) && o.seconds >= 15 && o.seconds <= 120, "timer", `${d.id}/${o.id}: ${o.seconds}s outside 15–120`);
    const c = GR_ROSTER.find((r) => r.id === o.role);
    check(!!c && c.world === "parish", "roles", `${d.id}/${o.id}: role ${o.role} is not a GRIOT parish character`);
    roles.add(o.role);
    if (o.kiosk) check(KW_KIOSKS.some((k) => k.id === o.kiosk), "resolve", `${d.id}/${o.id}: kiosk ${o.kiosk} is not KREWE's`);
    check(o.safe && o.unsafe && o.safe !== o.unsafe && o.practice?.length > 30, "calls", `${d.id}/${o.id}: calls or practice missing`);
  }
}
const flood = DR.drDrill("dr-flood");
check(flood?.objectives.some((o) => o.kiosk === "kw-floodgate-closeout"), "resolve", "the flood drill does not close the floodgate at KREWE's kw-floodgate-closeout");
check(DR.drDrill("dr-traffic")?.objectives.every((o) => o.station === "traffic-incident-management"), "resolve", "the traffic drill strays from traffic-incident-management");

// ---- placements
const sfOrNo = { no: new Set(), sf: new Set() };
for (const p of DR.DR_PLACES) {
  const map = NP_PARISHES.find((m) => m.id === p.parish);
  check(!!DR.drDrill(p.drill), "places", `placement names unknown drill ${p.drill}`);
  check(!!map && map.sites.some((s) => s.id === p.site), "places", `${p.drill} @ ${p.parish}/${p.site}: not a real site`);
  (p.parish.startsWith("sf-") ? sfOrNo.sf : sfOrNo.no).add(p.drill);
}
for (const d of drills) check(sfOrNo.no.has(d.id) && sfOrNo.sf.has(d.id), "places", `${d.id}: not placed in both New Orleans and San Francisco`);

// ---- reachable from paths
for (const d of drills) for (const pid of d.paths) {
  check(!!SP.stPath(pid) && SP.stPath(pid).prompts, "paths", `${d.id}: path ${pid} is not a STORYLINE path with prompts`);
  check(NP_PARISHES.some((m) => DR.drDrillsFor(pid, m.id).some((x) => x.drill === d.id)), "paths", `${d.id}: not offered on ${pid} anywhere`);
}
for (const pid of ["first-responders", "disaster-relief", "un-training"]) check(drills.some((d) => d.paths.includes(pid)), "paths", `path ${pid} offers no drill`);
check(DR.drDrillsFor("roam", "st-tammany").length === DR.drPlacesFor("st-tammany").length, "paths", "Just Roam does not leave every drill open");
check(DR.drDrillsFor("k12", "st-tammany").length === 0, "paths", "the K-12 path is offered a responder drill");

// ---- timers and scoring
const o0 = flood.objectives[0];
check(DR.drTimer(o0, 0).left === o0.seconds && !DR.drTimer(o0, 0).late, "timer", "timer at 0");
check(DR.drTimer(o0, o0.seconds - 0.5).left === 1 && DR.drTimer(o0, o0.seconds + 1).late && DR.drTimer(o0, 999).left === 0, "timer", "timer countdown / late");
check(DR.drObjectivePoints(o0, { safe: true, seconds: o0.seconds }) === 100 && DR.drObjectivePoints(o0, { safe: true, seconds: o0.seconds + 1 }) === DR.DR_LATE_POINTS && DR.drObjectivePoints(o0, { safe: false, seconds: 1 }) === 0 && DR.drObjectivePoints(o0, undefined) === 0, "score", "objective points");
const all = Object.fromEntries(flood.objectives.map((o) => [o.id, { safe: true, seconds: 5 }]));
const s1 = DR.drScore(flood, all);
check(s1.score === 100 && s1.points === s1.max && s1.passed, "score", `all safe on time → ${s1.score}`);
const oneLate = { ...all, [flood.objectives[1].id]: { safe: true, seconds: 999 } };
const s2 = DR.drScore(flood, oneLate);
check(s2.points === s2.max - 40 && s2.score === Math.round(((s2.max - 40) / s2.max) * 100), "score", `one late → ${s2.points}/${s2.max}`);
const oneBad = { ...all, [flood.objectives[2].id]: { safe: false, seconds: 5 } };
const s3 = DR.drScore(flood, oneBad);
check(s3.score === 80 && s3.passed === (80 >= DR.DR_PASS), "score", `one unsafe of five → ${s3.score}`);
check(DR.drScore(flood, {}).score === 0 && !DR.drScore(flood, {}).passed, "score", "empty run scores 0");

// ---- debrief
for (const d of drills) {
  const ids = new Set(d.objectives.map((o) => o.title));
  const miss = Object.fromEntries(d.objectives.map((o, i) => [o.id, { safe: i !== 1, seconds: 3 }]));
  const db = DR.drDebrief(d, miss);
  check(db.wentWell.every((t) => ids.has(t)) && db.wentWell.length === d.objectives.length - 1, "debrief", `${d.id}: went-well list`);
  check(db.improvement && db.improvement.objective === d.objectives[1].id && d.objectives.some((o) => o.id === db.improvement.objective), "debrief", `${d.id}: improvement not the missed objective`);
  const clean = DR.drDebrief(d, Object.fromEntries(d.objectives.map((o) => [o.id, { safe: true, seconds: 1 }])));
  check(clean.improvement === null && clean.score === 100, "debrief", `${d.id}: clean run debrief`);
}

// ---- passport: best score survives a reload, award through the recorder
const awards = [];
DR.drSetRecorder((src, o) => { awards.push({ src, ...o }); return { duplicate: false, award: { id: `${src}:${o.attemptId}` } }; });
DR.drRecord("dr-shelter", { score: 60 }, { attemptId: "a1" });
DR.drRecord("dr-shelter", { score: 90 }, { attemptId: "a2" });
DR.drRecord("dr-shelter", { score: 70 }, { attemptId: "a3" });
const DR2 = await imp("shared/dr-drills.js", "?reload=1");
check(DR2.drLoad().best["dr-shelter"] === 90 && DR2.drLoad().runs === 3, "passport", `best after reload ${DR2.drLoad().best["dr-shelter"]}`);
check(awards.length === 3 && awards[1].src === "drills:dr-shelter" && awards[1].reputation === 9, "passport", "award not sent through the recorder");

// ---- DEAN modules
const mods = DR.drDeanModules();
check(mods.length === drills.length && mods.every((m) => m.kind === "drill" && m.stations.every((s) => stations.has(s)) && NP_PARISHES.some((p) => p.id === m.launch.parish && p.sites.some((s) => s.id === m.launch.site))), "dean", "DEAN module shape does not resolve");

// ---- wiring
const app = rd("WebXR/parishes/js/app.js");
check(app.includes("drMountDrills(") && app.includes("drSetRecorder(ppAward)"), "wiring", "the parishes app does not mount the drills");
check(/drWorld\?\.offer\("dr-traffic"\)/.test(app), "wiring", "NEWTON's crash card does not offer the traffic drill");
check(rd("WebXR/parishes/parishes.html").includes('id="menu-drills"'), "wiring", "parishes.html has no #menu-drills");
const bundler = rd("tools/bundle_webxr.py");
for (const f of ["dr-drills-data.js", "dr-drills.js"]) check(bundler.includes(`"${f}"`), "wiring", `the bundler does not carry ${f}`);
check(rd("tools/check_all.mjs").includes('"check_drills.mjs"'), "wiring", "check_all does not list check_drills.mjs");
const doc = existsSync(join(ROOT, "docs/consoles/DRILLS.md")) ? rd("docs/consoles/DRILLS.md") : "";
check(doc.includes("## Seams") && doc.includes("## Cycles"), "doc", "DRILLS.md needs Seams and Cycles");

for (const d of drills) console.log(`  ${d.id.padEnd(11)} ${d.objectives.length} objectives · ${d.objectives.reduce((a, o) => a + o.seconds, 0)}s · ${[...new Set(d.objectives.map((o) => o.station))].length} stations · paths ${d.paths.join(", ")} · ${DR.DR_PLACES.filter((p) => p.drill === d.id).length} sites`);
console.log(`\n  ${drills.length} drills · ${objectives} objectives (${resolved} resolve to a station step) · ${DR.DR_PLACES.length} placements · ${roles.size} GRIOT roles · ${passed} checks · ${failed} failed · ${Date.now() - T0} ms`);
if (failed) process.exit(1);
console.log("All drills checks pass.");
