#!/usr/bin/env node
/**
 * check_silica — console SILICA (docs/consoles/SILICA.md): the ConstructionVR drilling-dust study ported as a
 * Holodeck station and an opt-in reaction-time eval.
 *
 *   node tools/check_silica.mjs
 *
 *  1 station    the station's shape (station brief): 12–15 steps over ≥5 kinds, 4 hazards on registered objects,
 *               2 interruptions armed on hold/track steps and answered by a control that is not the host step's,
 *               Table 1 of 29 CFR 1926.1153 cited, reactionEval maps each cue to a study condition
 *  2 registry   in the catalog, a programme, a pack and on a Louisiana construction site
 *  3 eval       the reaction-time eval end to end on the scripted agent (synthetic, labelled so): cue times per
 *               condition from real engine runs
 *  4 privacy    nothing recorded without consent; demo / signed-out / K-12 / unknown never record; an opted-in
 *               run yields a valid DATAWORKS episode with info.interrupt timings; revoke deletes it; no network code
 *  5 study      the aggregates page matches SIL_STUDY, says the data are not for training, holds no raw rows;
 *               when the read-only clone is on this machine the aggregates are recomputed from it (aggregates only)
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR", "shared");
const ID = "sil-concrete-drilling-and-silica-dust-cues";
let passes = 0, failures = 0;
function check(ok, what, detail = "") {
  if (ok) { passes += 1; console.log(`  ✓ ${what}`); } else { failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); }
}

// Headless browser storage before profiles.js / dx-data.js are imported (as check_dataworks does).
class Mem { constructor() { this.m = new Map(); } getItem(k) { return this.m.has(k) ? this.m.get(k) : null; } setItem(k, v) { this.m.set(k, String(v)); } removeItem(k) { this.m.delete(k); } keys() { return [...this.m.keys()]; } }
globalThis.localStorage = new Mem();
globalThis.sessionStorage = new Mem();
const dx = await import("../WebXR/shared/dx-data.js");
const sil = await import("../WebXR/shared/sil-reaction.js");
const store = dx.dxUseStore(dx.dxMakeStore(dx.dxMemBackend()));
const { loadSmartCity } = await import("./lib/headless.mjs");
const city = await loadSmartCity();

console.log("check_silica — ConstructionVR drilling-dust study as a station and a reaction-time eval");

// ------------------------------------------------------------------ 1 station
console.log("1 station");
const room = city.ROOMS.find((r) => r.id === ID);
check(!!room, `${ID} loads in the SmartCiti.X suite`);
const steps = room?.steps ?? [];
const kinds = new Set(steps.map((s) => s.kind));
check(steps.length >= 12 && steps.length <= 15 && kinds.size >= 5, `${steps.length} steps over ${kinds.size} kinds (${[...kinds].join(", ")})`);
const root = new city.THREE.Group();
const api = room.build(root);
const hitIds = Object.keys(api.hits ?? {});
let meshes = 0; root.traverse((o) => { if (o.isMesh) meshes++; });
check(meshes >= 150 && meshes <= 280, `${meshes} meshes, ${hitIds.length} interactables (brief: 150–280 meshes)`);
const hz = Object.keys(room.hazards ?? {});
check(hz.length === 4 && hz.every((h) => hitIds.includes(h)), `4 hazards, each on a registered object: ${hz.join(", ")}`);
const its = room.interrupts ?? [];
const armOk = its.every((it) => { const host = steps.find((s) => s.id === it.after); return host && ["hold", "track"].includes(host.kind) && it.target !== host.target && hitIds.includes(it.target); });
check(its.length === 2 && armOk, `2 interruptions armed on hold/track steps, answered by another registered control: ${its.map((i) => `${i.id}→${i.target}`).join(", ")}`);
const whys = steps.map((s) => (s.why ?? "").length).sort((a, b) => a - b);
check(whys[0] >= 40 && whys[whys.length >> 1] >= 200, `a why on every step, median ${whys[whys.length >> 1]} chars`);
check(/1926\.1153/.test(room.certification) && /Table 1/.test(room.certification) && /1926\.103/.test(room.certification), "certification cites 29 CFR 1926.1153 Table 1 and 29 CFR 1926.103");
const cueMap = room.reactionEval?.cues ?? {};
check(Object.keys(cueMap).length === 2 && its.every((i) => ["active", "passive"].includes(cueMap[i.id])) && new Set(Object.values(cueMap)).size === 2,
  `reactionEval maps each cue to a study condition: ${Object.entries(cueMap).map(([k, v]) => `${k}=${v}`).join(", ")}`);
const src = readFileSync(join(ROOT, "WebXR/smartcity/js/sims", `${ID}.js`), "utf8");
check(/prefers-reduced-motion/.test(src) && (src.match(/particles\(g, (\d+)/g) ?? []).reduce((n, m) => n + Number(m.match(/\d+$/)[0]), 0) <= 150,
  `particle budget ${(src.match(/particles\(g, (\d+)/g) ?? []).reduce((n, m) => n + Number(m.match(/\d+$/)[0]), 0)} points (≤150), still under reduced motion`);

// ------------------------------------------------------------------ 2 registry
console.log("2 registry");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
check(catalog.stations.some((s) => s.id === ID), "in WebXR/smartcity/catalog.json");
const progs = catalog.curricula.filter((c) => c.stations.some((s) => s.id === ID)).map((c) => c.id);
check(progs.length >= 1, `in programme(s): ${progs.join(", ")}`);
const packs = readdirSync(join(ROOT, "WebXR/packs")).filter((f) => f.endsWith(".json") && readFileSync(join(ROOT, "WebXR/packs", f), "utf8").includes(ID));
check(packs.length >= 1, `in ${packs.length} pack(s): ${packs.slice(0, 4).join(", ")}${packs.length > 4 ? ", …" : ""}`);
const laSites = readdirSync(SHARED).filter((f) => /^np-data-l[a-z]-/.test(f) && readFileSync(join(SHARED, f), "utf8").includes(`"${ID}"`));
const siteLine = laSites.length ? readFileSync(join(SHARED, laSites[0]), "utf8").split("\n").find((l) => l.includes(`"${ID}"`)) : "";
check(laSites.length >= 1 && /"kind":"construction"/.test(siteLine), `on a Louisiana construction site: ${laSites.join(", ")} (${siteLine.match(/"id":"([^"]+)"/)?.[1] ?? "?"})`);

// ------------------------------------------------------------------ 3 eval (synthetic agent runs)
console.log("3 eval — reaction-time eval on the scripted agent (synthetic, not people)");
const allCues = [];
let runs = 0, finished = 0;
for (const skill of [0.6, 0.8, 1]) for (let seed = 1; seed <= 6; seed++) {
  const r = city.runEpisode(room, room.build(new city.THREE.Group()), { skill, seed, SessionClass: city.Session });
  runs++; if (r.session.finished) finished++;
  allCues.push(...sil.silCueTimes(room, r.session.interruptLog));
}
const sumAll = sil.silSummary(allCues);
check(finished === runs, `${finished}/${runs} seeded agent runs finish the station`);
check(allCues.length === runs * 2 && allCues.every((c) => c.responseS != null && c.responseS >= 0), `${allCues.length} cue timings recorded (2 per run), each with a response time`);
const fmt = (s) => (s.n ? `median ${s.median} s (IQR ${s.q1}–${s.q3}), n=${s.n}` : "n=0");
check(sumAll.active.n > 0 && sumAll.passive.n > 0, `scripted agent (answers in the tick a cue fires, so ~0 s is expected) — active cue ${fmt(sumAll.active)}; passive cue ${fmt(sumAll.passive)}; answered ${sumAll.answered}, missed ${sumAll.missed}, wrong ${sumAll.wrong}`);
// Calibration: the same agent made to wait a known delay after each cue before acting. The eval must read that
// delay back (the engine rounds to 0.1 s and ticks at 0.05 s), and a wait past the window must read as missed.
const calib = [];
for (const delay of [0.5, 1.5, 3.0, 6.0, 13.0]) {
  const s2 = new city.Session(room, {});
  const agent = new city.RobotAgent({ skill: 1, seed: 3, hitIds, hazardIds: hz });
  s2.start();
  let ticks = 0;
  while (!s2.finished && ticks < 40000) {
    const it = s2.activeInterrupt;
    const waiting = it && (s2.elapsed - it.firedAt) < delay;
    if (!waiting) city.applyAction(s2, agent.act(s2));
    s2.tick(0.05); ticks++;
  }
  const cs = sil.silCueTimes(room, s2.interruptLog);
  calib.push({ delay, cs });
}
const calibOk = calib.filter((c) => c.delay < 12).every((c) => c.cs.length === 2 && c.cs.every((x) => x.outcome === "answered" && Math.abs(x.responseS - c.delay) <= 0.15));
check(calibOk, `calibration — injected delays read back: ${calib.filter((c) => c.delay < 12).map((c) => `${c.delay}s→${c.cs.map((x) => x.responseS).join("/")}`).join(", ")}`);
const late = calib.find((c) => c.delay === 13.0);
check(late.cs.length === 2 && late.cs.every((x) => x.outcome === "missed"), `a 13 s wait outlasts the 12 s window and reads as missed (${late.cs.map((x) => x.outcome).join("/")})`);
const st = sil.silStats([3, 1, 2, 4]);
check(st.n === 4 && st.median === 2.5 && st.q1 === 1.75 && st.q3 === 3.25, "silStats: linear-interpolated quartiles (1,2,3,4 → 1.75 / 2.5 / 3.25)");

// ------------------------------------------------------------------ 4 privacy
console.log("4 privacy");
const fakeSession = { elapsed: 120, interruptLog: [{ id: "shroud-hose-off", outcome: "answered", seconds: 2.4 }, { id: "dust-drift", outcome: "answered", seconds: 3.1 }] };
const flush = () => new Promise((r) => setTimeout(r, 20));
check(sil.silRecordRun(fakeSession, room) === null && (await store.list()).length === 0, "no consent: nothing recorded");
for (const [label, sg] of [["demo", { demo: true, signedIn: true, k12: false, adult: true }], ["signed out", { demo: false, signedIn: false, k12: false, adult: true }],
  ["K-12", { demo: false, signedIn: true, k12: true, adult: true }], ["unknown signals", { demo: null, signedIn: null, k12: null, adult: null }]]) {
  check(sil.silRecordRun(fakeSession, room, { signals: sg }) === null, `${label}: never recorded`);
}
localStorage.setItem("vr-training-auth-v1", JSON.stringify({ id: "learner-check@example.invalid" }));
const ADULT_OK = { demo: false, signedIn: true, k12: false, adult: true };
const opt = dx.dxOptIn({ licence: "CC0-1.0", adult: true, signals: ADULT_OK });
check(opt.ok, "an adult, signed-in, non-K-12 learner can opt in");
check(sil.silRecordRun(fakeSession, { ...room, reactionEval: undefined }, { signals: ADULT_OK }) === null, "a station without reactionEval records nothing even when opted in");
const ep = sil.silRecordRun(fakeSession, room, { signals: ADULT_OK });
await flush();
const v = ep ? dx.dxValidateEpisode(ep) : { ok: false, errors: ["no episode"] };
check(v.ok && ep.source === "human" && !!ep.consent?.consentId, "opted in: a valid DATAWORKS episode with a consent receipt", v.errors.join("; "));
check(ep?.steps?.length === 2 && ep.steps.every((s) => typeof s.info?.interrupt?.responseS === "number" && ["active", "passive"].includes(s.observation?.condition)),
  `per-cue info.interrupt timings: ${ep?.steps?.map((s) => `${s.info.interrupt.id} ${s.info.interrupt.responseS}s (${s.observation.condition})`).join(", ")}`);
check((await store.list()).length === 1, "stored locally (dxStore)");
await dx.dxRevoke({ store });
check((await store.list()).length === 0 && sil.silRecordRun(fakeSession, room, { signals: ADULT_OK }) === null, "revoke deletes it and stops recording");
const silSrc = readFileSync(join(SHARED, "sil-reaction.js"), "utf8").replace(/^\s*\/\/.*$/gm, "");
check(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource/.test(silSrc), "sil-reaction.js has no network code");
check(!/import\s*\{[^}]*\bas\b/.test(readFileSync(join(SHARED, "sil-reaction.js"), "utf8")), "no `import { x as y }` aliases (flat bundler)");
const app = readFileSync(join(ROOT, "WebXR/smartcity/js/app.js"), "utf8");
const bundler = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
check(/silRecordRun\(s, room\)/.test(app) && /room\.reactionEval/.test(app) && /SHARED \/ "sil-reaction\.js"/.test(bundler), "mounted in the SmartCiti.X app on finish, and in its bundle");

// ------------------------------------------------------------------ 5 study aggregates
console.log("5 study aggregates");
const doc = readFileSync(join(ROOT, "docs/sources/constructionvr-study.md"), "utf8");
const S = sil.SIL_STUDY.conditions;
for (const [k, c] of Object.entries(S)) {
  const row = doc.split("\n").find((l) => l.startsWith(`| ${k} |`)) ?? "";
  check(row.includes(`| ${c.responses} |`) && row.includes(`| ${c.median.toFixed(2)} |`) && row.includes(`${c.q1.toFixed(2)}–${c.q3.toFixed(2)}`),
    `${k}: n=${c.responses} responses, median ${c.median} s, IQR ${c.q1}–${c.q3} (doc row = SIL_STUDY)`);
}
check(/not\*\* used to train/.test(doc) && /consent covered research use/.test(doc) && sil.SIL_STUDY.usedForTraining === false, "the page says the study data are not used for training (consent covered research use)");
check(/ConstructionVR user study/.test(doc), "credited to the ConstructionVR user study");
check(!/PID\d|Data_PID|\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(doc + readFileSync(join(SHARED, "sil-reaction.js"), "utf8") + src), "no participant codes, file names or timestamps in the page, the module or the station");
const CLONE = "/home/user/agifuturefoundation/constructionvr/Assets/Data_Collected";
if (existsSync(CLONE)) {
  const agg = {};
  for (const f of readdirSync(CLONE).filter((f) => f.endsWith(".csv"))) {
    const cond = f.includes("ActiveDrilling") ? "ActiveDrilling" : "PassiveMoving";
    const lines = readFileSync(join(CLONE, f), "utf8").split(/\r?\n/).filter(Boolean);
    const h = lines[0].split(","), iT = h.indexOf("TimeToResponse"), iR = h.indexOf("ResponseTimes");
    const a = agg[cond] ??= { all: [] };
    for (const l of lines.slice(1)) { const c = l.split(","); if (+c[iT] >= 0 && +c[iR] >= 1) a.all.push(+c[iT]); }
  }
  for (const [k, a] of Object.entries(agg)) {
    const s = sil.silStats(a.all);
    check(s.n === S[k].responses && s.median === S[k].median && s.q1 === S[k].q1 && s.q3 === S[k].q3, `recomputed from the read-only clone: ${k} n=${s.n}, median ${s.median}, IQR ${s.q1}–${s.q3}`);
  }
} else console.log("  · read-only clone not on this machine — recompute skipped");

console.log(`\ncheck_silica: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
