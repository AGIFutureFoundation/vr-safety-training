/**
 * LESSONS-X: lessons led by software agents, and lesson packs across the worlds.
 *
 *     node tools/check_lx.mjs
 *
 * 1. The generated pack data matches a fresh build from the worlds' site lists and the sims' own steps.
 * 2. Packs compose from the real roster: every station exists and is enterable (in the catalog, not flat, with a sim
 *    module), standards come off the stations, the points target is reachable; K-12 stations are never in a pack.
 * 3. Agent-led lessons: brief → demo → try → debrief, every line labelled "software agent", every line grounded in its
 *    station (a step title or cue quoted verbatim from the sim file, a standard from the station's certification, or
 *    the points arithmetic), led by a hive agent or a VBRIDGE persona.
 * 4. Impossible requests are refused: a pack with a missing station, a K-12 station, a standard no station carries, a
 *    target above a clean run; a prompt the world cannot satisfy.
 * 5. The figure API is called with the leader and a contract source; voice is off by default and captions always show.
 * 6. Progress is stored only for opted-in adults (never K-12, demo or signed-out), and revoke deletes it.
 * Needs no network and no sibling clone.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };

const { composePack, lessonProgress } = await import("../WebXR/shared/lessons.js");
const LX = await import("../WebXR/shared/lx-lessons.js");
const { LX_PACK_DECLS, LX_STATION_STEPS } = await import("../WebXR/shared/lx-packs-data.js");
const { OH_AGENTS } = await import("../WebXR/shared/oh-hive-data.js");
const { AA_VBRIDGE_PERSONAS } = await import("../WebXR/shared/aa-agent-portraits.js");
const { dxEligibility } = await import("../WebXR/shared/dx-data.js");

let pass = 0, fail = 0;
let ps6 = null;
const section = (name, fn) => { const errs = []; let detail = ""; try { detail = fn(errs) ?? ""; } catch (e) { errs.push(`threw: ${e.message}`); }
  if (errs.length) { fail += 1; console.log(`  ✗ ${name}`); for (const e of errs.slice(0, 12)) console.log(`      ${e}`); }
  else { pass += 1; console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ""}`); } };

console.log("LESSONS-X — agent-led lessons and packs across the worlds\n");

const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const roster = LX.lxRoster(catalog);
const byId = new Map(roster.map((s) => [s.id, s]));
const simSrc = (id) => { const f = join(ROOT, "WebXR/smartcity/js/sims", `${id}.js`); return existsSync(f) ? readFileSync(f, "utf8") : null; };
const unescape = (src) => src.replace(/\\"/g, '"').replace(/\\u2014/g, "—");

section("1. lx-packs-data.js matches a fresh build (worlds' site lists, sims' own steps)", (errs) => {
  try { execFileSync(process.execPath, [join(ROOT, "tools/gen_lx_packs.mjs"), "--check"], { stdio: "pipe" }); }
  catch (e) { errs.push(String(e.stdout ?? e.message).trim()); }
  let n = 0;
  for (const [id, steps] of Object.entries(LX_STATION_STEPS)) {
    const cat = catalog.stations.find((s) => s.id === id);
    if (cat && steps.length !== cat.steps) errs.push(`${id}: ${steps.length} steps read, catalog says ${cat.steps}`);
    n += steps.length;
  }
  return `${Object.keys(LX_STATION_STEPS).length} stations, ${n} steps, step counts = catalog`;
});

const { packs, refused, pending } = LX.lxPacks(roster);
section("2. packs compose from the real roster; every station exists and is enterable", (errs) => {
  if (refused.length) for (const r of refused) errs.push(`${r.id} refused: ${r.reasons.join("; ")}`);
  if (packs.length < LX_PACK_DECLS.length) errs.push(`${packs.length} of ${LX_PACK_DECLS.length} packs composed`);
  const worlds = new Set(packs.map((p) => p.world));
  let st = 0;
  for (const p of packs) {
    if (!p.stations.length) errs.push(`${p.id} is empty`);
    for (const s of p.stations) {
      st += 1;
      const cat = catalog.stations.find((c) => c.id === s.id);
      if (!cat || cat.flat) errs.push(`${p.id}: ${s.id} is not an enterable catalog station`);
      if (!simSrc(s.id)) errs.push(`${p.id}: ${s.id} has no sim module`);
      if (/^k12-/.test(s.id)) errs.push(`${p.id}: K-12 station ${s.id} in an adult pack`);
    }
    if (!(p.points.target > 0 && p.points.target <= p.points.perfect)) errs.push(`${p.id}: target ${p.points.target} not in 1..${p.points.perfect}`);
    const clean = lessonProgress(p, p.stations.map((s) => ({ simId: s.id, score: s.steps * 100 + s.interrupts * 120 })));
    if (!clean.passed) errs.push(`${p.id}: a clean run does not pass`);
    if (lessonProgress(p, p.stations.slice(1).map((s) => ({ simId: s.id, score: 99999 }))).passed) errs.push(`${p.id}: passes without every station`);
  }
  return `packs 0 → ${packs.length} across ${worlds.size} worlds (${[...worlds].join(", ")}), ${st} stations, ${pending.length} pending (${pending.map((p) => p.id).join(", ")})`;
});

section("2a. ACCESS's interiors: every pack station is on a pad of its room on every tier", (errs) => {
  const p = packs.find((x) => x.id === "lx-pack-access-interiors");
  if (!p) { errs.push("the interiors pack did not compose"); return ""; }
  const decl = LX_PACK_DECLS.find((x) => x.id === p.id);
  const sfSrc = readFileSync(join(ROOT, "WebXR/shared/np-data-sf-downtown.js"), "utf8");
  const rooms = new Set();
  for (const s of decl.stations) {
    rooms.add(s.interior);
    if (!(s.pad >= 0 && s.pad < 4)) errs.push(`${s.id}: pad ${s.pad} is not inside the 4 pads every tier builds`);
    const m = sfSrc.match(new RegExp(`"id":\\s*"${s.site}"[\\s\\S]*?"stations":\\s*(\\[[^\\]]*\\])`)) ?? sfSrc.match(new RegExp(`id:\\s*"${s.site}"[\\s\\S]*?stations:\\s*(\\[[^\\]]*\\])`));
    let list = null; try { list = m ? JSON.parse(m[1]) : null; } catch { list = null; }
    if (!list || list[s.pad] !== s.id) errs.push(`${s.id}: not station ${s.pad} of ${s.site} on sf-downtown`);
  }
  if (rooms.size !== 4) errs.push(`${rooms.size} rooms, expected the four ACCESS kinds`);
  const ix = readFileSync(join(ROOT, "WebXR/shared/ix-interiors.js"), "utf8");
  const landed = [...rooms].filter((r) => ix.includes(`"${r}"`));
  if (landed.length && landed.length !== rooms.size) errs.push(`only ${landed.join(", ")} of the four styles are in ix-interiors.js`);
  return `${decl.stations.length} stations on pads in ${rooms.size} rooms (${[...rooms].join(", ")}); styles in this tree's ix-interiors.js: ${landed.length} of 4${landed.length ? "" : " (ACCESS's b98b57fe, joins at integration)"}`;
});

section("2b. standards taken from the stations, N of N", (errs) => {
  let n = 0, total = 0;
  for (const p of packs) for (const std of p.standards) {
    total += 1;
    if (p.stations.some((s) => (byId.get(s.id)?.certification ?? "").replace(/\s+/g, " ").includes(std))) n += 1; else errs.push(`${p.id}: ${std} on no station`);
  }
  return `${n} of ${total}`;
});

const lessons = [];
for (const p of packs) for (const s of p.stations) {
  const l = LX.lxAgentLesson(s.id, roster, { leader: p.leader, site: p.world === "parishes" ? s.site : null });
  lessons.push([p, l]);
}
section("3. agent-led lessons: brief → demo → try → debrief, labelled, led by a hive agent or a VBRIDGE persona", (errs) => {
  const hive = new Set(OH_AGENTS.map((a) => a.id)), vb = new Set(AA_VBRIDGE_PERSONAS.map((a) => a.id));
  let ok = 0, hiveLed = 0, vbLed = 0;
  for (const [p, l] of lessons) {
    if (l.refused) { errs.push(`${p.id}/${l.reasons}`); continue; }
    const order = [...new Set(l.lines.map((x) => x.phase))];
    if (order.join() !== LX.LX_PHASES.join()) errs.push(`${l.id}: phases ${order.join(" → ")}`);
    if (l.lines.some((x) => x.label !== "software agent" || !x.caption.includes("(software agent)"))) errs.push(`${l.id}: a line without the software agent label`);
    if (!(hive.has(l.leader.id) || vb.has(l.leader.id))) errs.push(`${l.id}: leader ${l.leader.id} is neither a hive agent nor a VBRIDGE persona`);
    if (hive.has(l.leader.id)) hiveLed += 1; else vbLed += 1;
    if (p.world === "parishes" && l.site) { const home = OH_AGENTS.find((a) => a.homeSite === l.site); if (home && home.id !== l.leader.id) errs.push(`${l.id}: led by ${l.leader.id}, home agent is ${home.id}`); }
    if (l.lines.filter((x) => x.phase === "demo").length !== LX_STATION_STEPS[l.station.id].length) errs.push(`${l.id}: demo lines ≠ steps`);
    ok += 1;
  }
  return `agent-led lessons 0 → ${ok} (hive-led ${hiveLed}, VBRIDGE-led ${vbLed})`;
});

section("3b. every lesson line grounded in its station, N of N (quoted from the sim file or the certification)", (errs) => {
  let n = 0, total = 0;
  const withResult = lessons.slice(0, 6).map(([p, l]) => [p, LX.lxAgentLesson(l.station.id, roster, { leader: p.leader, site: l.site, result: { score: 300, missed: [LX_STATION_STEPS[l.station.id][1].id] } })]);
  for (const [, l] of [...lessons, ...withResult]) {
    if (l.refused) continue;
    const src = unescape(simSrc(l.station.id) ?? "");
    const cert = (byId.get(l.station.id)?.certification ?? "").replace(/\s+/g, " ");
    const steps = LX_STATION_STEPS[l.station.id];
    for (const line of l.lines) {
      total += 1;
      const g = line.ground ?? {};
      let good = g.station === l.station.id;
      const ids = [g.step, ...(g.steps ?? [])].filter(Boolean);
      for (const id of ids) {
        const s = steps.find((x) => x.id === id);
        if (!s) { good = false; continue; }
        const tt = s.title.replace(/[.\s]+$/, "");
        const quoted = line.text.includes(tt) || line.text.toLowerCase().includes(tt.toLowerCase()) || line.text.includes(s.cue);
        if (!quoted || !src.includes(s.title)) good = false;
      }
      for (const std of g.standards ?? []) if (!line.text.includes(std) || !cert.includes(std)) good = false;
      if (g.points) { const p = l.points; if (g.points.target !== p.target || g.points.perfect !== p.perfect || !line.text.includes(String(p.target))) good = false; }
      if (!ids.length && !(g.standards ?? []).length && !g.points) good = false;
      if (good) n += 1; else errs.push(`${l.id} [${line.phase}] "${line.text.slice(0, 80)}"`);
    }
  }
  return `${n} of ${total} lines`;
});

section("4. impossible requests refused", (errs) => {
  const base = LX_PACK_DECLS[0];
  const cases = [
    ["a station not in the roster", { ...base, stations: [...base.stations, { id: "no-such-station" }] }],
    ["a K-12 station in an adult pack", { ...base, stations: [{ id: "k12-simple-machines-at-a-crane" }] }],
    ["a standard no station carries", { ...base, standards: ["NFPA 1999"] }],
    ["a target above a clean run", { ...base, target: 10 ** 7 }],
    ["no stations", { ...base, stations: [] }],
  ];
  for (const [what, spec] of cases) { const r = composePack(spec, roster, { stepsOf: LX.lxStepsOf }); if (r.ok) errs.push(`composed ${what}`); }
  const robot = packs.filter((p) => p.id === "lx-pack-parish-robot-sites");
  const imp = LX.lxComposeIn("underwater wet welding block for divers", roster, robot);
  if (!imp.refused) errs.push("the robot sites composed a diving lesson");
  for (const junk of ["make me a sandwich", "hello"]) if (!LX.lxComposeIn(junk, roster, packs).refused) errs.push(`"${junk}" composed`);
  const real = LX.lxComposeIn("lockout refresher for journeymen", roster, robot);
  if (real.refused || !real.stations.every((s) => robot[0].stations.some((x) => x.id === s.id))) errs.push("a real prompt at the robot sites did not compose from their stations");
  if (!LX.lxAgentLesson("no-such-station", roster).refused) errs.push("a lesson at a missing station composed");
  return `${cases.length} pack cases + 3 prompts refused; "${imp.reasons?.[0]}"`;
});

section("5. the figure API is called with the leader and a contract source; voice off by default, captions always", (errs) => {
  const [p, l] = lessons[0];
  let got = null;
  const heard = [];
  const fake = (opts) => { got = opts; opts.source.on("speak", (e) => heard.push(e)); opts.source.on("move", (e) => heard.push(e)); return { ok: true }; };
  const { world, source } = LX.lxMountLessonFigure({ mount: fake, lesson: l, three: {}, parent: {}, tier: "high" });
  if (!world || !got) errs.push("mount not called");
  if (got?.agents?.[0]?.id !== l.leader.id) errs.push("mount not given the leader");
  if (typeof got?.source?.on !== "function") errs.push("source has no on()");
  source.play();
  const speaks = heard.filter((e) => e.type === "speak");
  if (speaks.length !== l.lines.length) errs.push(`${speaks.length} speak events for ${l.lines.length} lines`);
  if (p.world === "parishes" && !heard.some((e) => e.type === "move" && e.to === l.site)) errs.push("no move to the site");
  if (LX.lxMountLessonFigure({ mount: null, lesson: l }).world !== null) errs.push("a missing mount did not degrade to captions");
  const caps = [], spoken = [];
  const v = LX.lxVoice({ caption: (c) => caps.push(c), speak: (a, t) => spoken.push(t) });
  for (const line of l.lines) v.say(line, l.leader);
  if (v.on) errs.push("voice on by default");
  if (spoken.length) errs.push("spoke with voice off");
  if (caps.length !== l.lines.length) errs.push("captions missing with voice off");
  v.set(true); v.say(l.lines[0], l.leader);
  if (spoken.length !== 1 || caps.length !== l.lines.length + 1) errs.push("voice on: caption and voice not both");
  const src = readFileSync(join(ROOT, "WebXR/shared/lx-lessons.js"), "utf8");
  if (/fetch\(|XMLHttpRequest|WebSocket|getUserMedia|SpeechRecognition/.test(src)) errs.push("lx-lessons.js reaches the network or listens");
  if (!/ohSpeakAs/.test(src)) errs.push("voice not through ohSpeakAs (local voices only)");
  return `${speaks.length} speak events to the mount, voice off by default, ${caps.length} captions`;
});

section("5b. in the world: the page's figure mount gets the leader and the lesson, paced, captions always", (errs) => {
  const added = [], attached = [], detached = [], heard = [];
  const world = { agents: () => [{ id: "agent-evaluator" }], addAgents: (l) => added.push(...l), attach: (s) => { attached.push(s); s.on("speak", (e) => heard.push(e)); s.on("move", (e) => heard.push(e)); }, detach: (s) => detached.push(s) };
  const timers = [];
  const caps = [];
  const sites = [{ id: "rb-site-soma-robot-cell", station: "ad-robot-cell-lockout-and-safe-reentry" }];
  const run = LX.lxLessonAtRobotSite(world, sites, "ad-robot-cell-lockout-and-safe-reentry", { caption: (c) => caps.push(c), schedule: (fn, ms) => { timers.push(ms); fn(); return timers.length; }, cancel: () => {} });
  if (!run || run.refused) { errs.push("no run"); return ""; }
  if (added[0]?.id !== "oh-safety-steward") errs.push(`leader ${added[0]?.id} added, expected the site's home agent oh-safety-steward`);
  if (attached.length !== 1 || detached.length !== 1) errs.push(`attached ${attached.length}, detached ${detached.length}`);
  const speaks = heard.filter((e) => e.type === "speak");
  if (speaks.length !== run.lesson.lines.length) errs.push(`${speaks.length} lines reached the figure of ${run.lesson.lines.length}`);
  if (!heard.some((e) => e.type === "move" && e.to === "rb-site-soma-robot-cell")) errs.push("no move to the site");
  if (caps.length !== run.lesson.lines.length || caps.some((c) => !c.includes("(software agent)"))) errs.push("captions not shown for every line");
  if (run.voice.on) errs.push("voice on by default");
  if (timers.some((ms) => ms < 400 || ms > 12000)) errs.push("pacing outside 0.4–12 s");
  const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
  if (!/lxLessonAtRobotSite\(aaWorld, rbWorld\?\.sites/.test(app) || !/npParams\.get\("lxLesson"\)/.test(app)) errs.push("the parishes page does not wire lxLessonAtRobotSite");
  if (!LX.lxLessonAtRobotSite(world, sites, "no-such-station", { caption: () => {} }).refused) errs.push("a missing station ran");
  return `${speaks.length} lines to the figure of Selka (software agent) at the robot cell, ${caps.length} captions, ${Math.round(timers.reduce((a, b) => a + b, 0) / 1000)} s paced`;
});

section("6. progress stored only for opted-in adults; revoke deletes", (errs) => {
  const pack = packs[0];
  const consentOn = { id: "c", adult: true, schema: "smartcitix.holodeck.episode" };
  const cases = [
    ["opted-in adult", { demo: false, signedIn: true, k12: false, adult: true }, consentOn, true],
    ["K-12", { demo: false, signedIn: true, k12: true, adult: true }, consentOn, false],
    ["demo", { demo: true, signedIn: true, k12: false, adult: true }, consentOn, false],
    ["signed-out", { demo: false, signedIn: false, k12: false, adult: true }, consentOn, false],
    ["no adult attestation", { demo: false, signedIn: true, k12: false, adult: false }, consentOn, false],
    ["not opted in", { demo: false, signedIn: true, k12: false, adult: true }, null, false],
  ];
  for (const [what, signals, consent, expect] of cases) {
    store.clear();
    const ps = LX.lxProgressStore({ signals, consent: () => consent, collecting: (s) => !!consent && consent.adult === true && dxEligibility(s).eligible, revoke: async () => ({ ok: true }) });
    const r = ps.record(pack.id, { simId: pack.stations[0].id, score: 500 });
    const kept = store.has(LX.LX_PROGRESS_KEY);
    if (r.stored !== expect || kept !== expect) errs.push(`${what}: stored ${r.stored}, key ${kept}, expected ${expect}`);
  }
  store.clear();
  let consent = consentOn;
  const ps = LX.lxProgressStore({ signals: cases[0][1], consent: () => consent, collecting: () => !!consent, revoke: async () => { consent = null; return { ok: true }; } });
  ps.record(pack.id, { simId: pack.stations[0].id, score: 500 });
  if (ps.progress(pack).stationsDone !== 1) errs.push("progress not read back");
  ps6 = ps;
  return `stored in ${cases.filter((c) => c[3]).length} of ${cases.length} cases (the opted-in adult only)`;
});

const revoked = ps6 ? await ps6.revoke() : null;
const leftAfterRevoke = store.has(LX.LX_PROGRESS_KEY);
section("6b. revoke deletes; revoke elsewhere deletes on the next read; the assignment holds a pack id only", (errs) => {
  if (!revoked?.ok || leftAfterRevoke) errs.push("revoke left progress");
  store.clear();
  store.set(LX.LX_PROGRESS_KEY, JSON.stringify({ x: [{ simId: "a", score: 1 }] }));
  const ps = LX.lxProgressStore({ consent: () => null, collecting: () => false });
  ps.all();
  if (store.has(LX.LX_PROGRESS_KEY)) errs.push("progress survived a missing consent");
  const a = LX.lxAssign(packs[0].id, { packs });
  if (!a.ok || LX.lxAssigned() !== packs[0].id) errs.push("assignment not kept");
  if (Object.keys(JSON.parse(store.get(LX.LX_ASSIGN_KEY))).join() !== "pack") errs.push("assignment holds more than a pack id");
  if (LX.lxAssign("lx-pack-nope", { packs }).ok) errs.push("assigned a pack that does not exist");
});

// LESSONS-X-2 (round 9): the four VBRIDGE personas, the menu entry, the real try in the debrief, lessons in ACCESS's rooms, page weight.
section("8. all four VBRIDGE personas take part in every VBRIDGE-led lesson; a hive lesson keeps one voice", (errs) => {
  const vb = new Set(AA_VBRIDGE_PERSONAS.map((a) => a.id));
  let vbLessons = 0, full = 0, oneVoice = 0, hiveLessons = 0;
  for (const [p, l] of lessons) {
    if (l.refused) continue;
    const speakers = new Set(l.lines.map((x) => x.agent));
    if (p.leader === "vbridge") {
      vbLessons += 1;
      if (speakers.size === 4 && [...speakers].every((id) => vb.has(id))) full += 1; else errs.push(`${l.id}: speakers ${[...speakers].join(", ")}`);
      const part = (ph) => new Set(l.lines.filter((x) => x.phase === ph).map((x) => x.agent));
      if (![...part("demo")].every((id) => id === "agent-provider")) errs.push(`${l.id}: the demonstration is not the provider's`);
      if (![...part("debrief")].every((id) => id === "agent-evaluator")) errs.push(`${l.id}: the debrief is not the evaluator's`);
      if (l.lines[0].agent !== "agent-governor" || (l.station.standards.length && !l.lines[0].text.includes(l.station.standards[0]))) errs.push(`${l.id}: the governor does not state the standards in the brief`);
      if (![...part("try")].every((id) => id === "agent-client")) errs.push(`${l.id}: the try handoff is not the client's`);
      if (l.leader.id !== "agent-evaluator" || (l.cast ?? []).length !== 4) errs.push(`${l.id}: leader ${l.leader.id}, cast ${(l.cast ?? []).length}`);
      for (const line of l.lines) { const who = AA_VBRIDGE_PERSONAS.find((a) => a.id === line.agent); if (!who || !line.caption.startsWith(`${who.name} (software agent)`)) errs.push(`${l.id}: caption not the speaker's: ${line.caption.slice(0, 50)}`); }
    } else { hiveLessons += 1; if (speakers.size === 1 && speakers.has(l.leader.id)) oneVoice += 1; else errs.push(`${l.id}: ${speakers.size} speakers on a hive lesson`); }
  }
  return `${full} of ${vbLessons} VBRIDGE lessons with all four personas (governor: standards; provider: demo; client: try; evaluator: order and debrief); ${oneVoice} of ${hiveLessons} hive lessons one voice`;
});

section("9. the menu entry arms a lesson that starts when the learner reaches the site, not at load", (errs) => {
  const started = [], toasts = [];
  const sites = [{ id: "rb-site-soma-robot-cell", name: "Robot cell", station: "ad-robot-cell-lockout-and-safe-reentry", position: [100, 40] }, { id: "rb-site-no-station", name: "No station" }];
  const me = { x: 0, z: 0 };
  let playing = false;
  const arm = LX.lxArmLesson(null, { sites, start: (id) => { started.push(id); return { ok: true }; }, where: () => me, playing: () => playing, toast: (t) => toasts.push(t), schedule: null });
  if (arm.tick() !== null || started.length) errs.push("ran before anything was armed");
  if (arm.arm("rb-site-no-station")) errs.push("armed a site with no station");
  if (!arm.arm("rb-site-soma-robot-cell")) errs.push("could not arm the robot cell");
  if (started.length) errs.push("started at arm time (should wait for arrival)");
  arm.tick(); if (started.length) errs.push("started while not playing (the menu still open)");
  playing = true; arm.tick(); if (started.length) errs.push("started 108 m away");
  me.x = 94; me.z = 40; const r = arm.tick();
  if (started.length !== 1 || started[0] !== "ad-robot-cell-lockout-and-safe-reentry" || !r) errs.push(`started ${started.length} at 6 m`);
  if (arm.armed()) errs.push("still armed after the start");
  arm.tick(); if (started.length !== 1) errs.push("started twice");
  if (!toasts[0]?.includes("Robot cell")) errs.push("no toast naming the site");
  const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
  const html = readFileSync(join(ROOT, "WebXR/parishes/parishes.html"), "utf8");
  if (!/id="menu-lx"/.test(html)) errs.push("parishes.html has no #menu-lx mount");
  if (!/lxArmLesson\(\$\("menu-lx"\)/.test(app)) errs.push("the parishes app does not mount lxArmLesson into #menu-lx");
  const ci = readFileSync(join(ROOT, "tools/check_interface.mjs"), "utf8");
  if (!/"menu-lx"/.test(ci)) errs.push("check_interface does not list #menu-lx under a tab");
  return `armed, waited (menu open, 108 m), started once at 6 m; #menu-lx in the Learn tab`;
});

section("10. the real try feeds the debrief: missed steps named N of N; nothing read or stored for K-12, demo or signed-out", (errs) => {
  const stationId = "ad-robot-cell-lockout-and-safe-reentry";
  const steps = LX_STATION_STEPS[stationId];
  const sites = [{ id: "rb-site-soma-robot-cell", station: stationId }];
  const consentOn = { id: "c", adult: true, schema: "smartcitix.holodeck.episode" };
  const mkStore = (signals, consent) => LX.lxProgressStore({ signals, consent: () => consent, collecting: (s) => !!consent && consent.adult === true && dxEligibility(s).eligible, revoke: async () => ({ ok: true }) });
  const adult = { demo: false, signedIn: true, k12: false, adult: true };
  // The passport record of a real run: the station's own step log, two steps with corrections, one with a hazard, one never reached.
  const log = steps.slice(0, -1).map((s, i) => ({ id: s.id, title: s.title, seconds: 4, corrections: i === 1 ? 2 : 0, hazards: i === 3 ? 1 : 0, clean: !(i === 1 || i === 3), points: 100 }));
  const records = [{ simId: stationId, score: 120, debrief: { steps: [] } }, { simId: "other-station", score: 999, debrief: { steps: [] } }, { simId: stationId, score: 540, passed: false, debrief: { steps: log } }];
  const expectMissed = [steps[1].id, steps[3].id, steps[steps.length - 1].id];
  const res = LX.lxResultOf(LX.lxLatestRecord(stationId, records), stationId);
  if (res?.score !== 540 || res.missed.join() !== expectMissed.join()) errs.push(`result ${JSON.stringify(res)}`);
  store.clear();
  const caps = [], heard = [];
  const world = { agents: () => [], addAgents: () => {}, attach: (s) => s.on("speak", (e) => heard.push(e)), detach: () => {} };
  const run = LX.lxDebriefAtRobotSite(world, sites, stationId, { records, store: mkStore(adult, consentOn), caption: (c) => caps.push(c), schedule: (fn) => { fn(); return 1; }, cancel: () => {} });
  if (run.refused) errs.push(`refused: ${run.reasons}`);
  const named = expectMissed.filter((id) => run.lesson?.lines.some((l) => l.phase === "debrief" && l.ground.step === id && l.text.includes(steps.find((s) => s.id === id).cue)));
  if (named.length !== expectMissed.length) errs.push(`missed steps named ${named.length} of ${expectMissed.length}`);
  if (heard.some((e) => e.lx.phase !== "debrief")) errs.push("the debrief run spoke other phases");
  if (!caps[0]?.includes("You scored 540") || !caps[0].includes(String(run.lesson.points.target))) errs.push(`first caption: ${caps[0]}`);
  if (run.stored < 1) errs.push("the attempt was not recorded under its pack");
  const kept = JSON.parse(store.get(LX.LX_PROGRESS_KEY) ?? "{}");
  if (!Object.values(kept).some((l) => l.some((r) => r.simId === stationId && r.score === 540))) errs.push("progress does not hold the real score");
  let gated = 0;
  for (const [what, signals, consent] of [["K-12", { ...adult, k12: true }, consentOn], ["demo", { ...adult, demo: true }, consentOn], ["signed-out", { ...adult, signedIn: false }, consentOn], ["not opted in", adult, null]]) {
    store.clear(); const c2 = [];
    const r = LX.lxDebriefAtRobotSite(world, sites, stationId, { records, store: mkStore(signals, consent), caption: (c) => c2.push(c), schedule: (fn) => { fn(); return 1; }, cancel: () => {} });
    if (r.refused && !r.stored && !store.has(LX.LX_PROGRESS_KEY) && !c2.length && !r.result) gated += 1; else errs.push(`${what}: refused ${r.refused}, stored ${r.stored}, captions ${c2.length}`);
  }
  // A record with points but no step log: the points line only, no "every step held".
  const l2 = LX.lxAgentLesson(stationId, roster, { site: sites[0].id, result: LX.lxResultOf({ simId: stationId, score: 300, debrief: { steps: [] } }) });
  if (l2.lines.filter((l) => l.phase === "debrief").length !== 1) errs.push("a record without steps got step lines");
  const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
  if (!/lxDebriefAtRobotSite\(aaWorld/.test(app) || !/ppRecords\(\)/.test(app)) errs.push("the parishes page does not feed the passport record into the debrief on return");
  return `missed steps named ${named.length} of ${expectMissed.length} from a real record (score 540); stored under ${run.stored} pack; ${gated} of 4 ineligible sessions read nothing and stored nothing`;
});

section("11. lessons in ACCESS's rooms: the leader stands at agentSpots[0] through the room figure mount, 4 of 4 rooms", (errs) => {
  const ix = readFileSync(join(ROOT, "WebXR/shared/ix-interiors.js"), "utf8");
  const spotsSrc = ix.match(/export const IX_AGENT_SPOTS[\s\S]*?\n\};/)?.[0] ?? "";
  let rooms = 0;
  for (const style of ["acc-fire-bay", "acc-drop-off-lobby", "acc-classroom-wing", "acc-park-pavilion"]) {
    const st = LX.lxRoomStation(style);
    if (!st) { errs.push(`${style}: no pack station`); continue; }
    const m = spotsSrc.match(new RegExp(`"${style}":\\s*\\[\\[([^\\]]*)\\]`));
    if (!m) { errs.push(`${style}: no agent spots in ix-interiors.js`); continue; }
    const [x, z, yaw] = m[1].split(",").map(Number);
    const room = { id: style, group: { kind: "group" }, agentSpots: [{ id: "agent-1", x, z, yaw }, { id: "agent-2", x: -x, z, yaw }] };
    const pack = packs.find((p) => p.id === st.pack);
    const lesson = LX.lxAgentLesson(st.id, roster, { leader: pack?.leader ?? "hive" });
    let got = null; const heard = [];
    const mount = (o) => { got = o; o.source.on("speak", (e) => heard.push(e)); return { dispose() {} }; };
    const run = LX.lxRoomLesson({ room, three: {}, mount, lesson, caption: () => {}, schedule: (fn) => { fn(); return 1; }, cancel: () => {} });
    if (!run || !got) { errs.push(`${style}: the mount was not called`); continue; }
    if (got.parent !== room.group) errs.push(`${style}: figure not in the room's group`);
    const spot = got.spotFor(null, got.agents[0].homeSite);
    if (got.agents[0].id !== lesson.leader.id || !spot || spot.x !== x || spot.z !== z) errs.push(`${style}: leader not at agentSpots[0] (${JSON.stringify(spot)})`);
    if (got.siteAt(got.agents[0].homeSite) === null || got.siteAt("rb-site-soma-robot-cell") !== null) errs.push(`${style}: siteAt does not keep the figure in the room`);
    if (heard.length !== lesson.lines.length) errs.push(`${style}: ${heard.length} lines reached the figure of ${lesson.lines.length}`);
    rooms += 1;
  }
  if (LX.lxRoomLesson({ room: { id: "x", group: {}, agentSpots: [] }, mount: () => ({}), lesson: lessons[0][1] }) !== null) errs.push("a room without agent spots mounted a figure");
  const app = readFileSync(join(ROOT, "WebXR/parishes/js/app.js"), "utf8");
  if (!/lxRoomLesson\(/.test(app) || !/aaRoomMount/.test(app)) errs.push("the parishes page does not run the room lesson through aaRoomAvatarMount");
  return `in-room lessons 0 → ${rooms} of 4 (leader at agentSpots[0], in the room's group, every line to the figure)`;
});

section("12. page weight: the pack data's bytes in each bundle that carries it", () => {
  const py = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  const bytes = (f) => { try { return readFileSync(join(ROOT, "WebXR/shared", f)).length; } catch { return 0; } };
  const carried = ["lx-packs-data.js", "lx-lessons.js", "lx-panel.js"].map((f) => `${f} ${bytes(f).toLocaleString("en-US")} B × ${(py.match(new RegExp(`"${f.replace(".", "\\.")}"`, "g")) ?? []).length} bundles`);
  return carried.join("; ");
});

section("7. wiring: bundle lists, the instructor tab, check_all and the baseline", (errs) => {
  const py = readFileSync(join(ROOT, "tools/bundle_webxr.py"), "utf8");
  for (const m of ["lx-packs-data.js", "lx-lessons.js"]) if (!py.includes(`"${m}"`)) errs.push(`${m} not in tools/bundle_webxr.py`);
  const html = readFileSync(join(ROOT, "WebXR/instructor/index.html"), "utf8");
  if (!/id="tab-lx"/.test(html) || !/id="view-lx"/.test(html)) errs.push("instructor tab-lx/view-lx missing");
  const all = readFileSync(join(ROOT, "tools/check_all.mjs"), "utf8");
  if (!all.includes("check_lx.mjs")) errs.push("check_lx not in check_all");
  const base = readFileSync(join(ROOT, "docs/perf/checkers-baseline.json"), "utf8");
  if (!base.includes("check_lx")) errs.push("check_lx not in checkers-baseline.json");
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
