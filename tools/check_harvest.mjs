#!/usr/bin/env node
/**
 * HARVEST (docs/consoles/HARVEST.md): hidden, regional and seasonal activities on the parish-engine maps.
 *
 *     node tools/check_harvest.mjs
 *
 * Proves, headlessly, over every map in NP_PARISHES:
 *   - every spot sits on dry ground, beside water (a fishing spot within HV_BESIDE, the rice field within a flooding
 *     reach) and off every road's carriageway; ids are unique; every water-bearing map with fishable water has spots;
 *   - every species, crab and crawfish a spot can yield is of the spot's region family and water class;
 *   - every learner-facing line (the activity lines, every game step) carries no digit, no regulation-shaped figure
 *     and no graphic word; every activity line names its source; fishing and crabbing say "check the current rules";
 *   - alligator content is gated to adult sessions: the default, demo, device and K-12 path sessions see gator watch,
 *     whose steps never mention hunting, tags or hooks;
 *   - the play calendar is deterministic (same ms, same season), cycles all four play seasons and opens every activity;
 *   - the games score (a wrong move lowers the score and pays nothing) and a clean run pays Crew Credits once;
 *   - the parishes app mounts it once into the Play tab (menu-harvest) and the bundler lists the module.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SH = join(ROOT, "WebXR/shared");
const memStore0 = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
globalThis.localStorage = memStore0(); globalThis.sessionStorage = memStore0(); // profiles.js gtStorage() for the treasure ledger
const { NP_PARISHES } = await import(join(SH, "np-parishes.js"));
const H = await import(join(SH, "hv-harvest.js"));
const { tyUseStore, tyLedger } = await import(join(SH, "ty-economy.js"));
const { npWaterAt } = await import(join(SH, "np-parish.js"));

let failures = 0, passes = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); return; }
  failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`);
}
const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
tyUseStore(memStore()); H.hvUseStore(memStore());

// 1. Spots: on dry ground, beside water, off the road.
console.log("Spots");
const all = [], perMap = {}, bad = [];
for (const p of NP_PARISHES) {
  const spots = H.hvSpotsFor(p);
  perMap[p.id] = spots;
  for (const s of spots) {
    all.push(s);
    const [x, z] = s.position;
    if (!H.hvDry(p, x, z)) bad.push(`${s.id} wet`);
    if (H.hvOnRoad(p, x, z, s.kind === "field" ? 6 : 1)) bad.push(`${s.id} on a road`);
    const b = H.hvWaterBeside(p, x, z, s.kind === "field" ? 45 : H.HV_BESIDE);
    if (!b) bad.push(`${s.id} not beside water`);
    if (s.kind !== "field" && b && H.hvWaterClass(p, b.w) !== s.water.cls) bad.push(`${s.id} water class ${s.water.cls} vs ${H.hvWaterClass(p, b.w)}`);
    if (!s.procedural) bad.push(`${s.id} not labelled procedural`);
  }
  check(H.hvSpotsFor(p) === spots && JSON.stringify(H.hvSpotsFor({ ...p })) === JSON.stringify(spots), `${p.id}: ${spots.length} spots, deterministic`, "");
}
check(bad.length === 0, `every spot (${all.length}) on dry ground, beside water, off the road`, bad.slice(0, 6).join("; "));
check(new Set(all.map((s) => s.id)).size === all.length, "spot ids unique");
const fishable = NP_PARISHES.filter((p) => (p.water ?? []).some((w) => { const c = H.hvWaterClass(p, w); return c && c !== "marsh"; }));
const lacking = fishable.filter((p) => perMap[p.id].filter((s) => s.activities.includes("fish")).length < 2);
check(lacking.length === 0, `every map with fishable water (${fishable.length}) has two or more fishing spots`, lacking.map((p) => p.id).join(", "));
const act = (a) => all.filter((s) => s.activities.includes(a));
console.log(`    activities: fish ${act("fish").length}, crab ${act("crab").length}, gator ${act("gator").length}, crawfish ${act("crawfish").length}, rice ${act("rice").length}`);
check(act("crawfish").length >= 3 && act("rice").length >= 3, "rice-and-crawfish fields on the rural New Orleans maps");
check(act("gator").every((s) => s.family === "new-orleans"), "gator spots only on New Orleans maps");

// 2. Species regional to the water.
console.log("Species");
const wrong = [];
for (const s of all) for (const a of s.activities.filter((x) => ["fish", "crab", "crawfish"].includes(x))) {
  const seen = new Set();
  for (const bait of [null, ...H.HV_BAITS.map((b) => b.id)]) for (const hour of [6.5, 12, 19, 23]) for (let attempt = 0; attempt < 6; attempt++) {
    const c = H.hvCatch(s, { bait, hour, attempt, activity: a });
    if (!c) { wrong.push(`${s.id} ${a}: nothing to catch`); continue; }
    seen.add(c.id);
    if (c.family !== s.family || !c.waters.includes(s.water.cls)) wrong.push(`${s.id} ${a}: ${c.id}`);
  }
}
check(wrong.length === 0, "every catch is regional to its spot's water", [...new Set(wrong)].slice(0, 5).join("; "));
const orphan = [...H.HV_SPECIES, ...H.HV_CRABS].filter((sp) => !all.some((s) => s.family === sp.family && sp.waters.includes(s.water.cls)));
check(orphan.length === 0, `every species (${H.HV_SPECIES.length} fish, ${H.HV_CRABS.length} crabs) has a spot to be caught at`, orphan.map((s) => s.id).join(", "));

// 3. Lines: sourced or figure-free, no graphic words.
console.log("Lines");
const GRAPHIC = /\b(blood|kill|killed|gore|injur\w*|wound\w*|dead|death|shoot|gun|rifle|bang|stab)\b/i;
const FIGURE = /\d|\b(per day|bag limit of|inches|feet long|pounds|minimum size)\b/i;
const texts = [];
for (const [k, l] of Object.entries(H.HV_LINES)) {
  check(!!l.source && typeof l.source === "string", `line ${k} names its source (${l.source})`);
  texts.push([`line ${k}`, l.text]);
}
for (const k of ["fish", "crab"]) check(/check the current rules/.test(H.HV_LINES[k].text), `the ${k} line says "check the current rules"`);
check(/set by \{agency\}/.test(H.HV_LINES.fish.text) && Object.values(H.HV_AGENCY).every((a) => /Department of (Wildlife and Fisheries|Fish and Wildlife)/.test(a)), "seasons and limits are pointed to the state agency");
texts.push(["calendar", H.HV_CALENDAR_NOTE], ["procedural", H.HV_PROCEDURAL]);
const seasonsFor = (a) => H.HV_SEASONS.filter((se) => H.hvActivityOpen(a, se));
for (const s of all) for (const a of [...s.activities, "gator-watch"]) for (const season of H.HV_SEASONS) for (const adult of [false, true]) {
  for (const st of H.hvGameSteps(s, a, { adult, season })) {
    texts.push([`${s.id} ${a}`, [...st.board, st.prompt, ...st.options.map((o) => o.text)].join(" ")]);
    if (st.options.filter((o) => o.safe).length !== 1 || st.options.length !== 2) texts.push([`${s.id} ${a}`, "BAD-OPTIONS 0"]);
  }
}
const figs = texts.filter(([, t]) => FIGURE.test(t)), graphic = texts.filter(([, t]) => GRAPHIC.test(t));
check(figs.length === 0, `no digit or regulation figure in ${texts.length} learner-facing texts`, figs.slice(0, 3).map(([k, t]) => `${k}: ${t.slice(0, 80)}`).join(" | "));
check(graphic.length === 0, "no graphic wording anywhere", graphic.slice(0, 3).map(([k]) => k).join(", "));

// 4. Alligator content gated to adults.
console.log("Adult gate");
check(!H.hvAdultAllowed(), "default session: not adult");
check(!H.hvAdultAllowed({ profileKind: "demo", confirmed: true }) && !H.hvAdultAllowed({ profileKind: "device", confirmed: true }), "demo and device sessions: not adult, even confirmed");
check(!H.hvAdultAllowed({ profileKind: "account", path: "k12", confirmed: true }), "the K-12 path: not adult");
check(!H.hvAdultAllowed({ profileKind: "account", path: "roam", confirmed: false }), "an account without the learner's confirmation: not adult");
check(H.hvAdultAllowed({ profileKind: "account", path: "roam", confirmed: true }), "a signed-in, confirmed adult off the K-12 path: adult");
check(H.hvGatorActivity(false) === "gator-watch" && H.hvGatorActivity(true) === "gator", "gator watch for everyone else");
const gs = act("gator")[0];
const watchText = H.hvGameSteps(gs, "gator", { adult: false }).map((st) => [...st.board, st.prompt, ...st.options.map((o) => o.text)].join(" ")).join(" ");
check(!/hunt|tag|hook|licen/i.test(watchText) && /never feed/i.test(watchText), "non-adult gator steps are gator watch (distance, never feed, call the agency)");
const adultText = H.hvGameSteps(gs, "gator", { adult: true }).map((st) => [...st.board, st.prompt, ...st.options.map((o) => o.text)].join(" ")).join(" ");
check(/licensed hunter/i.test(adultText) && /agency/i.test(adultText) && /Life jackets/.test(adultText), "the adult version is framed around licensed hunters, agents and boat safety");
check(H.HV_LINES.gator.adult === true && !/hunt/i.test(H.HV_LINES["gator-watch"].text), "the hunting line is adult-only; gator watch's line has none");
const src = readFileSync(join(SH, "hv-harvest.js"), "utf8");
check(/activity === "gator" && adult/.test(src) && /activity === "gator" && !adult \? "gator-watch"/.test(src), "the adult steps and line need adult === true");

// 5. The play calendar.
console.log("Calendar");
const t0 = 1_800_000_000_000;
check(JSON.stringify(H.hvSeasonAt(t0)) === JSON.stringify(H.hvSeasonAt(t0)), "same ms, same play season");
const day = 180 * 1000;
const cycle = new Set(Array.from({ length: 28 }, (_, i) => H.hvSeasonAt(i * day).season));
check(cycle.size === 4 && H.hvSeasonAt(0).season === "winter" && H.hvSeasonAt(7 * day).season === "spring" && H.hvSeasonAt(28 * day).season === "winter", "four play seasons, one per TYCOON week, cycling");
check(Object.keys(H.HV_OPEN).every((a) => seasonsFor(a).length >= 1), "every activity opens in at least one play season");
check(H.hvActivityOpen("fish", "winter") && !H.hvActivityOpen("crawfish", "summer") && H.hvActivityOpen("rice", "fall"), "fishing runs all year, crawfish and rice come and go");

// 6. Score and pay once.
console.log("Games");
const fishSpot = act("fish").find((s) => s.parish === "orleans") ?? act("fish")[0];
const bestMoves = (s, a, o = {}) => H.hvGameSteps(s, a, o).map((st) => st.options.findIndex((x) => x.safe));
const worstMoves = (s, a, o = {}) => H.hvGameSteps(s, a, o).map((st) => st.options.findIndex((x) => !x.safe));
const b0 = tyLedger().balance;
const r1 = H.hvFinish(fishSpot, "fish", bestMoves(fishSpot, "fish"), { hour: 12 });
check(r1.clean && r1.score === 100 && r1.catch && r1.paid && r1.amount > 0, `a clean fishing run at ${fishSpot.id} scores and pays (${r1.score}%, ${r1.catch?.name}, +${r1.amount})`);
check(tyLedger().balance === b0 + r1.amount, "the Crew Credits ledger shows the pay");
check(r1.treasure?.treasure?.id === "tz-harvest-fish", "the first clean fishing run finds the Tackle Box treasure", JSON.stringify(r1.treasure ?? null).slice(0, 80));
const r2 = H.hvFinish(fishSpot, "fish", bestMoves(fishSpot, "fish"), { hour: 23, attempt: 1 });
check(r2.clean && !r2.paid && tyLedger().balance === b0 + r1.amount, "a second clean run logs a catch but pays nothing");
const r3 = H.hvFinish(act("fish")[1], "fish", worstMoves(act("fish")[1], "fish"));
check(!r3.clean && r3.score === 0 && !r3.paid && !r3.catch, "an unsafe run scores low, catches nothing and pays nothing");
check(H.hvLog().length === 2 && Object.values(H.hvAlbum()).reduce((a, b) => a + b, 0) === 2, "the catch log and album hold both catches");
for (const a of ["crab", "crawfish", "rice", "gator"]) {
  const s = act(a)[0];
  const r = H.hvFinish(s, a, bestMoves(s, a, { season: "fall" }), { season: "fall" });
  const again = H.hvFinish(s, a, bestMoves(s, a, { season: "fall" }), { season: "fall" });
  check(r.clean && r.paid && !again.paid && r.line.length > 20, `${a} at ${s.id}: scores, pays once, teaches its line`);
}
check(H.hvFind(fishSpot.id) === true && H.hvFind(fishSpot.id) === false, "a spot is found once");

// Treasures: one per activity through gen_treasures.mjs, each lesson re-read verbatim from the module.
const D = await import(join(SH, "treasures-data.js"));
const hvT = D.TZ_TREASURES.filter((t) => t.how === "harvest");
check(Object.keys(H.HV_TREASURE_LINES).every((a) => hvT.some((t) => t.trigger.activity === a && t.lesson === H.HV_TREASURE_LINES[a])) && D.TZ_SETS.some((s) => s.id === "harvest-hands"), `harvest treasures (${hvT.length}) and the Harvest Hands set are generated`);
check(Object.values(H.HV_TREASURE_LINES).every((l) => !/\d/.test(l) && !GRAPHIC.test(l)), "treasure lines are figure-free");

// 7. The mount (headless) and the wiring.
console.log("Mount and wiring");
const orl = NP_PARISHES.find((p) => p.id === "orleans");
const target = perMap.orleans[0];
let where = [0, 0], toasts = [];
const m = H.hvMount({ parish: orl, pos: () => where, toast: (t) => toasts.push(t) });
check(m && m.spots.length === perMap.orleans.length, "hvMount builds headlessly with the map's spots");
where = target.position.slice(); m.tick();
check(toasts.some((t) => /hand-painted sign/.test(t)), "walking to a spot finds it with a toast");
const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
const html = readFileSync(join(ROOT, "WebXR/parishes/parishes.html"), "utf8");
const bundle = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
const ux = readFileSync(join(ROOT, "tools/check_interface.mjs"), "utf8");
check((app.match(/from "\.\.\/\.\.\/shared\/hv-harvest\.js"/g) ?? []).length === 1 && (app.match(/hvMount\(/g) ?? []).length === 1 && /el: \$\("menu-harvest"\)/.test(app), "the parishes app imports and mounts HARVEST once, into menu-harvest");
const play = html.slice(html.indexOf('id="ux-panel-play"'), html.indexOf('id="ux-panel-map"'));
check(play.includes('id="menu-harvest"'), "menu-harvest sits inside the Play tab");
check(/"menu-harvest"/.test(ux), "check_interface lists menu-harvest");
check(/SHARED \/ "hv-harvest\.js"/.test(bundle), "the bundler lists hv-harvest.js for the parishes app");
check(!/\bfetch\(|XMLHttpRequest|WebSocket/.test(src), "no network at runtime");

console.log(`\ncheck_harvest: ${failures ? "FAIL" : "OK"} — ${passes} passed, ${failures} failed · ${all.length} spots on ${NP_PARISHES.filter((p) => perMap[p.id].length).length} maps (fish ${act("fish").length}, crab ${act("crab").length}, gator ${act("gator").length}, crawfish ${act("crawfish").length}, rice ${act("rice").length})`);
process.exit(failures ? 1 : 0);
