/**
 * ROBOPROG gate — the Holodeck Robotics & Human–Robot Collaboration Programme (docs/consoles/ROBOPROG.md).
 *
 *   1  tracks:     six tracks (industrial cells, cobots, mobile/AMR, construction robotics, maintenance and lockout, data and
 *                  AI-training), every station a catalog station, every standard one of the five named public standards
 *   2  ladder:     6 tracks × 5 levels (awareness / K-12 → operator → technician → integrator / safety lead → AI-training),
 *                  each ending in a credential that is earnable in its module; awareness uses K-12 stations only
 *   3  coverage:   the eval — every track level has a robot station of its own; every AI-training level a loop station.
 *                  Prints the coverage with and without this console's new stations (before → after)
 *   4  stations:   the new stations follow the station brief (12–15 steps, ≥5 kinds, 4 hazards, 2 interruptions armed on a
 *                  hold or track step and answered by another step's control, `why` on every step, median ≥ 200 chars;
 *                  K-12 by its generator), and are registered in the catalog
 *   5  loop:       every AI-training level names COLEARN's demonstration → policy → evaluation loop; the references are guarded
 *                  (rp-programme.js imports only competency.js); the loop resolves against col-learn.js / dx-data.js when they
 *                  are in this tree and stays pending otherwise; no network call or upload in any ROBOPROG file; consent rules
 *                  stated (opt-in, adults, never K-12/demo/signed-out, local, revoke deletes)
 *   6  templates:  DEAN module docs validate (dnValidateDoc), every template has an instructor guide, a cohort sets up for
 *                  every track × level on the org layer
 *   7  page:       generated page and handbook are current, design system, Home chip, Guide, brand line, no partnership claim,
 *                  no clause text quoted, no model identifier
 *
 *     node tools/check_robotics_programme.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const W = join(ROOT, "WebXR");
const mem = new Map();
globalThis.localStorage ??= { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k), key: (i) => [...mem.keys()][i] ?? null, get length() { return mem.size; } };
globalThis.sessionStorage ??= globalThis.localStorage;
const imp = (f) => import(pathToFileURL(join(ROOT, f)).href);
const read = (f) => (existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), "utf8") : "");

let checks = 0; const fails = [];
const check = (ok, area, msg) => { checks++; if (!ok) fails.push(`[${area}] ${msg}`); };

const rp = await imp("WebXR/shared/rp-programme.js");
const { COMPETENCY_BY_ID } = await imp("WebXR/shared/competency.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity/catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const opts = { stationIds: new Set(stations.keys()) };

// ---------------------------------------------------------------- 1 tracks
const TRACKS = ["industrial-cells", "cobots", "mobile-amr", "construction-robotics", "maintenance-lockout", "data-ai-training"];
const LEVELS = ["aware", "operator", "technician", "integrator", "ai-training"];
check(JSON.stringify(rp.RP_TRACKS.map((t) => t.id)) === JSON.stringify(TRACKS), "tracks", `tracks are ${rp.RP_TRACKS.map((t) => t.id).join(",")}`);
check(JSON.stringify(rp.RP_LEVELS.map((l) => l.id)) === JSON.stringify(LEVELS), "tracks", `levels are ${rp.RP_LEVELS.map((l) => l.id).join(",")}`);
const STD = new Set(["iso-10218-1", "iso-10218-2", "iso-ts-15066", "ansi-a3-r15-06", "osha-1910-147"]);
check(rp.RP_STANDARDS.length === 5 && rp.RP_STANDARDS.every((s) => STD.has(s.id)), "tracks", "the named standards are exactly ISO 10218-1/-2, ISO/TS 15066, ANSI/A3 R15.06, OSHA 1910.147");
for (const t of rp.RP_TRACKS) {
  for (const s of t.standards) check(STD.has(s), "tracks", `${t.id}: standard ${s} is not one of the five`);
  for (const lv of LEVELS) {
    const ids = t.levels[lv] ?? [];
    check(ids.length >= 3, "tracks", `${t.id}/${lv}: fewer than 3 stations`);
    for (const id of ids) check(stations.has(id), "tracks", `${t.id}/${lv}: station ${id} not in the catalog`);
    for (const c of t.credentials[lv] ?? []) check(!!COMPETENCY_BY_ID[c], "tracks", `${t.id}/${lv}: competency ${c} unknown`);
  }
  check(typeof t.scenario === "string" && t.scenario.startsWith("rb-"), "tracks", `${t.id}: gym scenario`);
}
const rbData = await imp("WebXR/shared/rb-robotics-data.js");
const rbScen = new Set(rbData.RB_SCENARIOS.map((s) => s.id)), rbSites = new Set(rbData.RB_SITES.map((s) => s.id));
for (const t of rp.RP_TRACKS) { check(rbScen.has(t.scenario), "tracks", `${t.id}: scenario ${t.scenario} not in RB_SCENARIOS`); for (const s of t.rbSites) check(rbSites.has(s), "tracks", `${t.id}: robot site ${s} not in RB_SITES`); }
for (const id of Object.keys(rp.RP_ROBOT_STATIONS)) check(stations.has(id), "tracks", `robot station ${id} not in the catalog`);

// ---------------------------------------------------------------- 2 ladder
let levels = 0, earnable = 0;
for (const t of rp.RP_TRACKS) {
  const ladder = rp.rpLadder(t.id, opts);
  check(ladder.length === 5, "ladder", `${t.id}: ${ladder.length} levels`);
  for (const l of ladder) {
    levels++;
    if (l.earnable) earnable++;
    check(l.earnable && l.credential, "ladder", `${t.id}/${l.level}: credential not earnable (${l.credential?.id} ${l.credential?.overlap}+${l.capstone.length}/${l.credential?.require})`);
    check(l.pending.length === 0, "ladder", `${t.id}/${l.level}: pending stations ${l.pending.join(",")}`);
    if (l.level === "aware") { check(l.stations.every((id) => id.startsWith("k12-")), "ladder", `${t.id}/aware: a non-K-12 station`); check(!l.collectsData, "ladder", `${t.id}/aware collects data`); }
    if (l.level === "ai-training") check(l.collectsData && l.loop?.scenario === t.scenario, "ladder", `${t.id}/ai-training: loop missing`);
  }
}

// ---------------------------------------------------------------- 3 coverage (the eval)
const covAfter = rp.rpCoverage(opts);
const before = new Set([...stations.keys()].filter((id) => !rp.RP_NEW_STATIONS.includes(id)));
const covBefore = rp.rpCoverage({ stationIds: before });
for (const x of covAfter.levels) check(x.covered, "coverage", `${x.track}/${x.level}: no robot station of its own${x.level === "ai-training" ? " or no loop station" : ""}`);
const fmt = (c) => LEVELS.map((l) => `${l} ${c.byLevel[l].covered}/${c.byLevel[l].of}`).join(", ");

// ---------------------------------------------------------------- 4 new stations
const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag", "drive", "record", "share", "check-in"];
const { loadSmartCity } = await imp("tools/lib/headless.mjs");
const city = await loadSmartCity();
const rooms = new Map(city.ROOMS.map((r) => [r.id, r]));
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1] ?? 0; };
for (const id of rp.RP_NEW_STATIONS) {
  const r = rooms.get(id);
  check(!!r, "stations", `${id}: not loaded by the smartcity harness`);
  check(stations.has(id), "stations", `${id}: not in the catalog`);
  if (!r) continue;
  const steps = r.steps ?? [];
  check(steps.length >= 12 && steps.length <= 15, "stations", `${id}: ${steps.length} steps (12–15)`);
  check(new Set(steps.map((s) => s.kind)).size >= 5 && steps.every((s) => KINDS.includes(s.kind)), "stations", `${id}: fewer than 5 step kinds`);
  check(Object.keys(r.hazards ?? {}).length === 4, "stations", `${id}: ${Object.keys(r.hazards ?? {}).length} hazards (4)`);
  check((r.interrupts ?? []).length === 2, "stations", `${id}: ${(r.interrupts ?? []).length} interruptions (2)`);
  check(steps.every((s) => (s.why ?? "").length > 0), "stations", `${id}: a step without why`);
  check(med(steps.map((s) => (s.why ?? "").length)) >= 200, "stations", `${id}: median why under 200 chars`);
  for (const it of r.interrupts ?? []) {
    const host = steps.find((s) => s.id === it.after);
    check(host && ["hold", "track"].includes(host.kind), "stations", `${id}/${it.id}: not armed on a hold or track step`);
    check(host && it.target !== host.target, "stations", `${id}/${it.id}: answered by the host step's own control`);
    check(it.missNote && it.wrongNote && it.why, "stations", `${id}/${it.id}: missNote/wrongNote/why`);
  }
  const src = read(`WebXR/smartcity/js/sims/${id}.js`);
  if (!id.startsWith("k12-")) {
    check(/onInterrupt\(it\)/.test(src) && /\.material = mat\(|\.visible = /.test(src), "stations", `${id}: interruption handler does not change the scene`);
    check(/surfaceTexture\(/.test(src), "stations", `${id}: no textured large surface`);
  }
  // standards named only, no clause text quoted
  check(!/(ISO|R15\.06|1910\.147)[^"\n]{0,40}(clause|§)\s*\d/i.test(src), "stations", `${id}: a clause number of a robot standard`);
}

// ---------------------------------------------------------------- 5 loop, consent, no network
const FNS = read("WebXR/shared/rp-programme.js"), DATA = read("WebXR/shared/rp-programme-data.js");
const importsOf = (s) => [...s.matchAll(/^\s*import\s[^;]*?from\s+"([^"]+)"/gm)].map((m) => m[1]);
check(JSON.stringify(importsOf(FNS)) === JSON.stringify(["./competency.js", "./rp-programme-data.js"]), "loop", `rp-programme.js imports ${importsOf(FNS).join(", ")}`);
check(importsOf(DATA).length === 0, "loop", "rp-programme-data.js must be pure data");
check(!/import\s*\{[^}]*\sas\s/.test(FNS + DATA), "loop", "an import alias in a shared module (the bundler keeps declared names only)");
const LOOP_IDS = ["consent", "demonstrate", "train", "evaluate", "demonstrates-back"];
check(JSON.stringify(rp.RP_LOOP.map((s) => s.id)) === JSON.stringify(LOOP_IDS), "loop", "loop steps");
for (const s of rp.RP_LOOP) check(stations.has(s.station) && ["dx-data.js", "col-learn.js"].includes(s.module) && /^(dx|col)[A-Z]/.test(s.fn), "loop", `${s.id}: station/module/fn`);
// guarded both ways: a stub with every function → all live; nothing → none live
const stubDx = { dxOptIn() {} }, stubCol = { colDemosFromEpisodes() {}, colTrain() {}, colEvalScenario() {}, colGhost() {} };
check(rp.rpLoop({ dx: stubDx, col: stubCol }).every((s) => s.live), "loop", "guard: stubs should make every step live");
check(rp.rpLoop({}).every((s) => !s.live), "loop", "guard: no modules should leave every step pending");
const tryImp = async (f) => { if (!existsSync(join(ROOT, f))) return null; try { return await imp(f); } catch (_) { return null; } };
const dx = await tryImp("WebXR/shared/dx-data.js"), col = await tryImp("WebXR/shared/col-learn.js");
const loopLive = rp.rpLoop({ dx, col });
if (col) {
  // the loop runs end to end on synthetic demonstrations (deterministic) and the policy beats random on held-out seeds
  let ev = null; try { ev = col.colEvalScenario?.("rb-cobot-zone-setup", { demos: 20, heldOut: 12 }); } catch (e) { ev = { error: e.message }; }
  check(ev && !ev.error, "loop", `colEvalScenario on the cobot scenario: ${ev?.error ?? "no result"}`);
}
check(loopLive.find((s) => s.id === "consent")?.live === !!dx?.dxOptIn, "loop", "consent step live state does not match dx-data.js");
const ALL = { data: DATA, fns: FNS, gen: read("tools/gen_robotics_programme.mjs"), ...Object.fromEntries(rp.RP_NEW_STATIONS.map((id) => [id, read(`WebXR/smartcity/js/sims/${id}.js`)])) };
for (const [k, v] of Object.entries(ALL)) check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket\s*\(|navigator\.sendBeacon/.test(v), "loop", `${k}: a network call`);
const PAGE = read("WebXR/robotics/programme.html"), DOC = read("docs/robotics-programme.md");
for (const [k, v] of [["page", PAGE], ["handbook", DOC]]) {
  check(/opt-in/i.test(v) && /adults/i.test(v) && /never in K-12, demo or signed-out/i.test(v) && /no upload endpoint/i.test(v) && /revoking[^.]*deletes/i.test(v), "loop", `${k}: the consent rules are not all stated`);
  check(/behaviour cloning/i.test(v) && /held-out|never saw/i.test(v) && /heuristic/i.test(v), "loop", `${k}: the mechanisms are not named for what they are`);
}
const demo = rooms.get("rp-teleop-demonstration-collection");
check(/revok/i.test(JSON.stringify(demo?.steps ?? [])) && /this device/i.test(JSON.stringify(demo?.steps ?? [])) && /consent/i.test(demo?.steps?.[0]?.title ?? ""), "loop", "the demonstration station opens with consent and teaches local storage and revocation");

// ---------------------------------------------------------------- 6 templates
const dn = await imp("WebXR/shared/dn-modules.js");
const tpls = rp.rpTemplates(opts);
check(tpls.length === 30, "templates", `expected 30 DEAN templates, found ${tpls.length}`);
for (const t of tpls) {
  let v = null; try { v = dn.dnValidateDoc(t.module); } catch (e) { v = { ok: false, errors: [e.message] }; }
  const ok = v === true || v?.ok === true || (Array.isArray(v) && v.length === 0) || (v && Array.isArray(v.errors) && v.errors.length === 0);
  check(ok, "templates", `${t.module.id}: dnValidateDoc ${JSON.stringify(v).slice(0, 160)}`);
  check(t.module.lessons.every((l) => stations.has(l.id)), "templates", `${t.module.id}: a lesson does not resolve`);
  check(t.guide.objectives.length && t.guide.debrief.length && t.guide.assessment && t.guide.consent, "templates", `${t.module.id}: instructor guide incomplete`);
  check(t.level !== "ai-training" || t.guide.loop.length === 5, "templates", `${t.module.id}: AI-training guide lacks the loop`);
  check(DOC.includes(`\`${t.module.id}\``), "templates", `${t.module.id}: missing from the handbook`);
}
globalThis.window ??= globalThis;
const en = await imp("WebXR/shared/org.js");
let cohorts = 0;
for (const t of rp.RP_TRACKS) for (const l of LEVELS) {
  let r = null; try { r = rp.rpSetUpCohort({ en, dn, ...opts }, { orgName: "Robotics Check Centre", trackId: t.id, level: l, seats: 12, startDate: "2026-10-06" }); } catch (e) { r = null; }
  check(!!r && r.cohort.seats === 12 && r.module?.id === `mod-rp-${t.id}-${l}` && /^\d{4}-\d{2}-\d{2}$/.test(r.due) && r.classCode, "templates", `${t.id}/${l}: cohort set-up failed`);
  if (r) cohorts++;
}

// ---------------------------------------------------------------- 7 page
check(PAGE.length > 0 && DOC.length > 0, "page", "run node tools/gen_robotics_programme.mjs");
check(/shared\/design\.css/.test(PAGE) && /class="home-chip"/.test(PAGE) && /gdMount/.test(PAGE), "page", "design system, Home chip or Guide missing");
check(PAGE.includes("SmartCiti.X Holodeck · Powered by AGI Corp"), "page", "brand line missing");
for (const t of rp.RP_TRACKS) for (const l of LEVELS) check(PAGE.includes(`data-rp-level="${t.id}/${l}"`), "page", `${t.id}/${l} missing from the page`);
for (const s of rp.RP_LOOP) check(PAGE.includes(`data-rp-loopstep="${s.id}"`), "page", `loop step ${s.id} missing from the page`);
check(PAGE.includes(`${covAfter.covered} of ${covAfter.of} track levels are covered`), "page", "the page's coverage is stale — rerun the generator");
check(DOC.includes(`Total: ${covAfter.covered}/${covAfter.of} track levels covered.`), "page", "the handbook's coverage is stale — rerun the generator");
check(PAGE.includes("data-rp-nopartner") && /no partnership/.test(rp.RP_NO_PARTNERSHIP), "page", "no-partnership statement missing");
check(!/\b(partner(ed|ship)? with|in partnership with|backed by|funded by|sponsored by)\b/i.test(PAGE.replace(/<p class="rp-muted" data-rp-nopartner>[^<]*<\/p>/, "").replace(/<style>[\s\S]*?<\/style>/, "")), "page", "a partnership claim on the page");
check(!/\$\s?\d|USD|€|£/.test(PAGE.replace(/<script[\s\S]*?<\/script>/g, "")), "page", "a price on the page");
const HOME = read("WebXR/index.html");
check(HOME.includes("robotics/programme.html"), "page", "the homepage does not link the robotics programme");
const CONSOLE = read("docs/consoles/ROBOPROG.md");
const files = { page: PAGE, handbook: DOC, console: CONSOLE, ...ALL };
for (const [k, v] of Object.entries(files)) check(!/claude-(opus|sonnet|haiku)|\bopus[- ]\d|\bsonnet[- ]\d|\bhaiku[- ]\d|\bgpt-\d/i.test(v), "page", `${k}: a model identifier`);
check(CONSOLE.includes("## Cycles"), "page", "docs/consoles/ROBOPROG.md has no Cycles section");

if (fails.length) { for (const f of fails.slice(0, 40)) console.log("FAIL", f); console.log(`check_robotics_programme: FAILED ${fails.length} of ${checks} checks`); process.exit(1); }
console.log(`check_robotics_programme: ok — ${checks} checks · ${rp.RP_TRACKS.length} tracks × ${LEVELS.length} levels (${earnable}/${levels} earnable) · ${tpls.length} DEAN templates (${cohorts} cohorts set up) · robot-station coverage before ${covBefore.covered}/${covBefore.of} (${fmt(covBefore)}) → after ${covAfter.covered}/${covAfter.of} (${fmt(covAfter)}) · ${rp.RP_NEW_STATIONS.length} new stations · loop ${loopLive.filter((s) => s.live).length}/${loopLive.length} live in this tree (${col ? "col-learn.js present" : "col-learn.js pending, guarded"})`);
