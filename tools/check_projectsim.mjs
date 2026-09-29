#!/usr/bin/env node
/**
 * PROJECTSIM's checker (docs/consoles/PROJECTSIM.md) — pure Node, no browser (add `--live` for the parishes page on port 8969):
 *
 *   - five simulations (trash capture cleanout, green stormwater build, tidal channel dig, zero-emission charging yard, PCB sampling),
 *     5–8 steps each; every step resolves to a real catalog station carrying its sourced standard AND one of that station's own
 *     step ids in WebXR/smartcity/js/sims/<station>.js; every `requires` names a gate step of the same sim;
 *   - the order-sensitive steps penalise a skipped permit or lockout (and every other gate), and a clean run carries no penalty;
 *   - scoring arithmetic, the mistake log and the debrief;
 *   - every simulation is reachable at a real site of a real map in this tree; guarded placements (BAYMAP / TIDELANDS maps) resolve
 *     only through the lookup, and not when the map is absent;
 *   - TERRAFORM's water gives the tidal sim a tide reading, NEWTON settles the excavator on the mats, the GSI cell is dry;
 *   - Crew Credits through tyEarn (once per sim), the passport award through the recorder, the best score survives a reload,
 *     DEAN's module shape resolves;
 *   - no injury, gore or fear words; no project figure from the facts file appears in a simulation;
 *   - the mount is wired in the parishes app (board + menu), its page, the bundler, and check_all lists this checker.
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
const PS = await imp("shared/ps-projectsim.js");
const { NP_PARISHES, npParish } = await imp("shared/np-parishes.js");
const TY = await imp("shared/ty-economy.js");
const catalog = JSON.parse(readFileSync(join(W, "smartcity", "catalog.json"), "utf8"));
const stations = new Map(catalog.stations.map((s) => [s.id, s]));
const simSteps = new Map();
const stepsOf = (id) => {
  if (!simSteps.has(id)) {
    const f = join(W, "smartcity", "js", "sims", `${id}.js`);
    // A step is an `id:` whose object carries a title and a cue (hazards and awards carry neither) — DRILLS' reading. The keys
    // may be written bare (`id: "…"`) or JSON-quoted (`"id": "…"`, as CLEANPORTS' generated stations write them).
    const src = existsSync(f) ? readFileSync(f, "utf8") : null;
    simSteps.set(id, src ? new Set([...src.matchAll(/\b"?id"?: "([^"]+)"/g)].filter((m) => { const w = src.slice(m.index, m.index + 1500); const end = w.indexOf("\n    },"); const body = end > 0 ? w.slice(0, end) : w; return /\b"?title"?: "/.test(body) && /\b"?cue"?: "/.test(body); }).map((m) => m[1])) : null);
  }
  return simSteps.get(id);
};

// ---- simulations and steps
const sims = PS.psSims();
const KINDS = ["trash-capture", "green-stormwater", "tidal-channel", "charging-yard", "pcb-sampling"];
check(sims.length === 5 && KINDS.every((k) => sims.some((s) => s.kind === k)), "sims", `expected the five project kinds, found ${sims.map((s) => s.kind).join(",")}`);
const FEAR = /\b(injur\w*|blood\w*|gore|dead body|death|die[sd]?|dying|kill\w*|corpse|victim|terrif\w*|scar(y|ed)|panic|horror|wound\w*|casualt\w*|fatal\w*|electrocut\w*|burn(ed|s)? )\b/i;
const FIGURES = /\$|million|4,700|427 acres|100,000|663|475|188|322|24,000/;
let steps = 0, resolved = 0;
const stationSet = new Set();
for (const sim of sims) {
  check(sim.id.startsWith("ps-") && sim.name && sim.briefing?.length > 60, "sims", `${sim.id}: id, name or briefing missing`);
  check(sim.steps.length >= 5 && sim.steps.length <= 8, "sims", `${sim.id}: ${sim.steps.length} steps (5–8)`);
  check(new Set(sim.steps.map((s) => s.id)).size === sim.steps.length, "sims", `${sim.id}: duplicate step ids`);
  const text = [sim.name, sim.briefing, ...sim.steps.flatMap((s) => [s.title, s.practice, s.safe, s.unsafe])].join(" ");
  check(!FEAR.test(text), "safety", `${sim.id}: injury/fear word "${FEAR.exec(text)?.[0]}"`);
  check(!FIGURES.test(text), "facts", `${sim.id}: carries a program figure "${FIGURES.exec(text)?.[0]}"`);
  check(sim.steps.some((s) => s.gate) && sim.steps.some((s) => s.requires.length), "order", `${sim.id}: no order gate`);
  for (const s of sim.steps) {
    steps += 1;
    const st = stations.get(s.station);
    check(!!st && String(st.certification ?? "").length > 40, "resolve", `${sim.id}/${s.id}: station ${s.station} missing or carries no sourced standard`);
    const ids = stepsOf(s.station);
    check(!!ids && ids.has(s.step), "resolve", `${sim.id}/${s.id}: step ${s.step} is not a step of ${s.station}`);
    if (st && ids?.has(s.step)) { resolved += 1; stationSet.add(s.station); }
    for (const g of s.requires) check(sim.steps.some((x) => x.id === g && x.gate), "order", `${sim.id}/${s.id}: requires ${g}, not a gate step of this sim`);
    check(s.safe && s.unsafe && s.safe !== s.unsafe && s.practice?.length > 30, "calls", `${sim.id}/${s.id}: calls or practice missing`);
  }
}
const trash = PS.psSim("ps-trash-capture-cleanout"), yard = PS.psSim("ps-zero-emission-charging-yard");
for (const sim of [trash, yard]) for (const g of ["permit", "lockout"]) check(sim.steps.some((s) => s.gate === g), "order", `${sim.id}: no ${g} gate`);
console.log(`  steps: ${sims.length} simulations · steps resolved ${resolved}/${steps} to real station steps · ${stationSet.size} stations`);

// ---- order penalties and scoring
const clean = (sim) => ({ order: sim.steps.map((s) => s.id), calls: Object.fromEntries(sim.steps.map((s) => [s.id, true])) });
const orderLines = [];
for (const sim of sims) {
  const c = PS.psScore(sim, clean(sim));
  check(c.score === 100 && c.penalties === 0 && c.passed, "score", `${sim.id}: clean run → ${c.score} (${c.penalties} penalties)`);
  check(PS.psMistakes(sim, clean(sim)).length === 0 && PS.psDebrief(sim, clean(sim)).improvement === null, "debrief", `${sim.id}: clean run has mistakes`);
  for (const gate of sim.steps.filter((s) => s.gate)) {
    const dependents = sim.steps.filter((s) => s.requires.includes(gate.id));
    // Skipped gate: never done.
    const skip = { order: clean(sim).order.filter((id) => id !== gate.id), calls: clean(sim).calls };
    const sk = PS.psScore(sim, skip);
    const want = (sim.steps.length - 1) * 100 - dependents.length * PS.PS_ORDER_PENALTY;
    check(sk.points === want && sk.penalties === dependents.length, "order", `${sim.id}: skipped ${gate.id} → ${sk.points}, want ${want}`);
    check(PS.psMistakes(sim, skip).filter((m) => m.kind === "order" && m.gate === gate.id).length === dependents.length, "order", `${sim.id}: mistake log misses skipped ${gate.id}`);
    check(PS.psDebrief(sim, skip).improvement?.step === gate.id || dependents.length === 0, "debrief", `${sim.id}: improvement does not point at skipped ${gate.id}`);
    // Late gate: done last.
    const late = { order: [...skip.order, gate.id], calls: clean(sim).calls };
    check(PS.psScore(sim, late).penalties === dependents.length, "order", `${sim.id}: late ${gate.id} not penalised`);
    // Unsafe gate: done in order but with the unsafe call counts as not done.
    const bad = { order: clean(sim).order, calls: { ...clean(sim).calls, [gate.id]: false } };
    check(PS.psScore(sim, bad).penalties === dependents.length, "order", `${sim.id}: unsafe ${gate.id} still opens its gate`);
    if (gate.gate === "permit" || gate.gate === "lockout") orderLines.push(`${sim.id.replace("ps-", "")} −${sk.max - sk.points} for a skipped ${gate.gate}`);
  }
  const oneBad = { ...clean(sim), calls: { ...clean(sim).calls, [sim.steps.at(-1).id]: false } };
  const ob = PS.psScore(sim, oneBad);
  check(ob.points === ob.max - 100 && ob.score === Math.round(((ob.max - 100) / ob.max) * 100), "score", `${sim.id}: one unsafe → ${ob.points}/${ob.max}`);
  check(PS.psScore(sim, {}).score === 0 && PS.psMistakes(sim, {}).length === sim.steps.length, "score", `${sim.id}: empty run`);
  const db = PS.psDebrief(sim, oneBad);
  check(db.wentWell.length === sim.steps.length - 1 && db.mistakes.length === 1 && db.mistakes[0].kind === "unsafe", "debrief", `${sim.id}: debrief of one unsafe`);
}
console.log(`  order: ${orderLines.join(" · ")}`);
console.log(`  scoring: clean 100 · one unsafe of 8 → ${PS.psScore(trash, { ...clean(trash), calls: { ...clean(trash).calls, closeout: false } }).score} · pass mark ${PS.PS_PASS} · order penalty ${PS.PS_ORDER_PENALTY}`);

// ---- placements
const reach = new Map(sims.map((s) => [s.id, 0]));
for (const p of PS.PS_PLACES) {
  const map = NP_PARISHES.find((m) => m.id === p.parish);
  check(!!PS.psSim(p.sim) && !!map && map.sites.some((s) => s.id === p.site), "places", `${p.sim} @ ${p.parish}/${p.site}: not a real site`);
  reach.set(p.sim, (reach.get(p.sim) ?? 0) + 1);
}
for (const [id, n] of reach) check(n >= 1, "places", `${id}: not reachable at any site`);
for (const g of PS.PS_GUARDED) {
  const absent = NP_PARISHES.some((m) => m.id === g.parish);
  const none = PS.psPlacesFor(g.parish, { lookup: () => null }).filter((x) => x.guarded);
  check(none.length === 0, "places", `${g.parish}: guarded placement resolved without its map`);
  const fake = { id: g.parish, sites: [{ id: g.site ?? "x-site", kind: g.kinds?.[0] ?? "port" }] };
  check(PS.psPlacesFor(g.parish, { lookup: () => fake }).some((x) => x.guarded && x.sim === g.sim), "places", `${g.sim} @ ${g.parish}: guarded placement does not resolve when the map lands`);
  if (absent) check(true, "places", "");
}
const guardedLive = PS.PS_GUARDED.filter((g) => PS.psPlacesFor(g.parish).some((x) => x.guarded)).length;
console.log(`  placements: ${PS.PS_PLACES.length} in-tree sites across ${new Set(PS.PS_PLACES.map((p) => p.parish)).size} maps, every sim reachable (${[...reach.values()].join("/")}) · ${PS.PS_GUARDED.length} guarded (${guardedLive} resolve in this tree)`);

// ---- systems: TERRAFORM tide, NEWTON excavator, GSI cell
const bv = npParish("sf-bayview"), ms = npParish("sf-mission");
const slough = bv.sites.find((s) => s.id === "yosemite-slough-restoration");
const tide = PS.psTideWindow(bv, slough);
check(!!tide && tide.depth > 0, "systems", "TERRAFORM gives no water near the tidal channel site");
const onMats = PS.psPlaceExcavator(bv, slough, { mats: true }), bare = PS.psPlaceExcavator(bv, slough, { mats: false });
check(onMats.settled && onMats.onMat && !bare.onMat && bare.settled, "systems", `NEWTON excavator: mats ${JSON.stringify(onMats)} bare ${JSON.stringify(bare)}`);
const cell = PS.psInfiltration(ms, ms.sites.find((s) => s.id === "mission-bay-construction-site"), 30);
check(cell.dry && cell.drained && PS.psInfiltration(ms, ms.sites.find((s) => s.id === "mission-bay-construction-site"), 0).level === 1, "systems", "GSI cell not dry / drain-down wrong");
console.log(`  systems: tide ${tide?.depth} m at the slough (window ${tide?.open ? "open" : "closed"}) · excavator settles on mats at ${onMats.restY} (ground ${onMats.groundY}) in ${onMats.seconds}s · GSI cell dry, drains`);

// ---- records: credits, passport, DEAN
const awards = [];
PS.psSetRecorder((src, o) => { awards.push({ src, ...o }); return { duplicate: false }; });
const bal0 = TY.tyLedger().balance;
const r1 = PS.psRecord("ps-pcb-sampling", { score: 60, passed: false }, { attemptId: "a1" });
const r2 = PS.psRecord("ps-pcb-sampling", { score: 95, passed: true }, { attemptId: "a2" });
const r3 = PS.psRecord("ps-pcb-sampling", { score: 100, passed: true }, { attemptId: "a3" });
const bal1 = TY.tyLedger().balance;
check(!r1.credits.paid && r2.credits.paid && r2.credits.amount === TY.tyPayFor(PS.psCreditLevel(95)) && r3.credits.duplicate, "records", `credits: ${JSON.stringify([r1.credits, r2.credits, r3.credits])}`);
check(bal1 - bal0 === r2.credits.amount, "records", `ledger moved ${bal1 - bal0}, want ${r2.credits.amount}`);
const PS2 = await imp("shared/ps-projectsim.js", "?reload=1");
check(PS2.psLoad().best["ps-pcb-sampling"] === 100 && PS2.psLoad().runs === 3, "records", "best score does not survive a reload");
check(awards.length === 3 && awards[1].src === "projectsim:ps-pcb-sampling" && awards[1].reputation === 10, "records", "award not sent through the recorder");
const mods = PS.psDeanModules();
check(mods.length === sims.length && mods.every((m) => m.kind === "projectsim" && m.stations.every((s) => stations.has(s)) && NP_PARISHES.some((p) => p.id === m.launch.parish && p.sites.some((s) => s.id === m.launch.site))), "records", "DEAN module shape does not resolve");
console.log(`  records: tyEarn paid ${r2.credits.amount} CC once (level ${PS.psCreditLevel(95)}), fail pays 0, repeat is a duplicate · ${awards.length} passport awards · best ${PS2.psLoad().best["ps-pcb-sampling"]} after reload · ${mods.length} DEAN modules`);

// ---- wiring
const app = rd("WebXR/parishes/js/app.js");
check(app.includes("psMountProjectSim(") && app.includes("psSetRecorder(ppAward)") && app.includes('psWorld?.boardRows($("board-ps"), site.id)'), "wiring", "the parishes app does not mount the simulations at the boards");
const page = rd("WebXR/parishes/parishes.html");
check(page.includes('id="menu-ps"') && page.includes('id="board-ps"'), "wiring", "parishes.html lacks #menu-ps / #board-ps");
const bundler = rd("tools/bundle_webxr.py");
for (const f of ["ps-projectsim-data.js", "ps-projectsim.js"]) check(bundler.includes(`"${f}"`), "wiring", `the bundler does not carry ${f}`);
check(rd("tools/check_all.mjs").includes('"check_projectsim.mjs"'), "wiring", "check_all does not list check_projectsim.mjs");
const doc = existsSync(join(ROOT, "docs/consoles/PROJECTSIM.md")) ? rd("docs/consoles/PROJECTSIM.md") : "";
check(doc.includes("## Seams") && doc.includes("## Cycles"), "doc", "PROJECTSIM.md needs Seams and Cycles");
console.log(`  wiring: parishes app board + menu, page, bundler, check_all`);

// ---- live (optional): the parishes page on port 8969 runs the trash capture simulation end to end, in order.
if (process.argv.includes("--live")) {
  const { pvServe, pvLaunch, pvContext } = await import(pathToFileURL(join(ROOT, "tools", "lib", "pv_browser.mjs")).href);
  const srv = await pvServe(Number(process.env.PS_PORT) || 8969);
  const browser = await pvLaunch();
  try {
    const pg = await (await pvContext(browser)).newPage();
    const errors = [];
    pg.on("pageerror", (e) => errors.push(String(e.message)));
    await pg.goto(`${srv.base}/parishes/parishes.html?parish=sf-bayview`, { waitUntil: "load" });
    await pg.waitForFunction(() => !!window.__parishTest?.projectsim, null, { timeout: 60000 });
    const menu = await pg.evaluate(() => document.querySelectorAll("#menu-ps [data-ps-open]").length);
    check(menu === PS.psPlacesFor("sf-bayview").length, "live", `menu lists ${menu}`);
    // The simulation starts at its site's board.
    await pg.evaluate(() => window.__parishTest.openBoard("yosemite-slough-restoration"));
    const board = await pg.evaluate(() => [...document.querySelectorAll("#board-ps [data-ps-open]")].map((b) => b.getAttribute("data-ps-open")));
    check(board.length === 1 && board[0] === "ps-tidal-channel-dig", "live", `board lists ${board.join(",")}`);
    await pg.click('#board-ps [data-ps-open="ps-tidal-channel-dig"]');
    await pg.click("[data-ps-go]");
    for (const s of PS.psSim("ps-tidal-channel-dig").steps) { await pg.click(`#ps-panel [data-ps-step="${s.id}"]`); await pg.click('#ps-panel [data-ps="safe"]'); }
    const debrief = await pg.evaluate(() => document.getElementById("ps-panel").innerText);
    const meshes = await pg.evaluate(() => window.__parishTest.projectsim.counts().meshes);
    await pg.click("[data-ps-close]");
    check(/100\/100/.test(debrief) && /Mistake log · 0/.test(debrief), "live", `debrief: ${debrief.slice(0, 160)}`);
    check(errors.length === 0, "live", `page errors: ${errors.slice(0, 2).join(" | ")}`);
    console.log(`  live: sf-bayview menu ${menu} sims · board at yosemite-slough-restoration starts ${board.join(",")} · tidal dig run in order → "${(debrief.split("\n").find((l) => l.includes("/100")) ?? "").trim()}" · excavator meshes ${meshes} · ${errors.length} page errors`);
  } finally { await browser.close(); srv.close(); }
}

console.log(`check_projectsim: ${failed ? "FAIL" : "ok"} — ${passed} passed, ${failed} failed · ${sims.length} sims, ${resolved}/${steps} steps resolved · ${Date.now() - T0} ms`);
process.exit(failed ? 1 : 0);
