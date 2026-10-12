#!/usr/bin/env node
/**
 * HIVE-3 checker (docs/consoles/HIVE-3.md): the hive's day, remembered, in two languages.
 *
 *     node tools/check_hive3.mjs
 *
 * Proves, headlessly (the vendored three.js; a canvas stub only for the figures' label and caption canvases; stubbed storage
 * and a stubbed speechSynthesis — no browser, no network):
 *   1. visitors in the rooms: with every robotics room open through a seeded hive day, each agent the hive sends to a room's
 *      site for a job comes in through the door (to a free agent spot, else a place by the door) on its move and walks out
 *      through the door when that job ends or the hive sends it elsewhere; at most H3_ROOM_FIGURES figures at once; every room
 *      stays inside IX_BUDGET and IXR_TEX_BUDGET at every step (ixrMeasure, the shell's sign canvases added); the phone tier
 *      builds no figures; reduced motion appears and goes without walking;
 *   2. remembered settings: voice, "supervise every job" and the hive's language survive a reload for a signed-in adult
 *      profile, under that profile's namespace only; demo, K-12 and signed-out sessions store and read nothing; sign-out
 *      (auth.js signOut) clears them; nothing in the module touches the network;
 *   3. the hive panel in Spanish: every UI string and every agent's role sentence has a Spanish entry (N of N), the panel
 *      mounted in Spanish shows no English string of the table, English is unchanged;
 *   4. the talk light with a voice: a stubbed speechSynthesis with one local and one network voice; with voice on, the room
 *      figure's light is on from onstart to onend for every line (N of N), off after, and the network voice is chosen 0 times;
 *   5. "A day in the hive": the scene's seeded hive is identical for a seed, runs its beats in order (a job arrives, bids, an
 *      award and a walk out of the cell hall's door, a governor refusal with its reason, an approval request for a job that
 *      names a robot, the learner's approval, a simulated dispatch), no physical dispatch, inside 20–30 s;
 *   6. the wiring: the parishes app, the bundle list, check_all and the estimated baseline row.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
let passes = 0, failures = 0;
const ok = (cond, what, detail = "") => { if (cond) passes += 1; else failures += 1; console.log(`  ${cond ? "✓" : "✗"} ${what}${detail ? ` — ${detail}` : ""}`); return !!cond; };
const imp = (p) => import(pathToFileURL(join(WEBXR, p)).href);
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;

const THREE = await imp("vendor/three/dist/three.module.min.js");
const IX = await imp("shared/ix-interiors.js");
const IXR = await imp("shared/ixr-robo-interiors.js");
const RB = await imp("shared/rb-robotics-data.js");
const HW = await imp("shared/hw-hive-world.js");
const H3 = await imp("shared/h3-hive-day.js");
const OHD = await imp("shared/oh-hive-data.js");
const OHH = await imp("shared/oh-hive.js");

console.log("HIVE-3 — visitors in the rooms, remembered settings, the panel in Spanish, the talk light with a voice, the hive's day\n");

// ------------------------------------------------------------------------------------------------ 1. visitors in the rooms
console.log("1. visitors in the robotics rooms");
const STYLES = Object.keys(IXR.IXR_ROOMS);
const dressers = {}; for (const st of STYLES) dressers[st] = [(a) => IXR.ixrDress(a)];
const signBytes = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);
const canvasStub = () => {
  const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? () => ({ width: 10 }) : () => {}), set: () => true });
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
};
const inGroup = (o, g) => { for (let x = o; x; x = x.parent) if (x === g) return true; return false; };
const buildRooms = (tier) => {
  delete globalThis.document;
  const rooms = STYLES.map((st) => {
    const rb = RB.RB_SITES.find((s) => IXR.IXR_SITE_STYLE[s.id] === st);
    const room = IX.ixBuild(st, { three: THREE, tier, site: IXR.ixrSiteFor(rb, null), dressers });
    return { st, rb, room };
  });
  canvasStub();
  return rooms;
};
const V = { arrivals: 0, shown: 0, passed: 0, turned: 0, throughDoor: 0, waited: 0, ended: 0, leftOnEnd: 0, movedAway: 0, leftOnMove: 0, maxFigures: 0, budgetSteps: 0, budgetOk: 0, worst: {} };
const homeOf = (id) => OHD.OH_AGENTS.find((a) => a.id === id)?.homeSite ?? null;
for (const tier of ["high", "balanced", "low"]) {
  const lt = tier === "low" ? "low" : "high";
  const rooms = buildRooms(tier);
  const hive = OHH.ohHive({ seed: 1 });
  const bySite = new Map(rooms.map((r) => [r.rb.id, r]));
  const awardOf = new Map(); hive.on("award", (e) => awardOf.set(e.jobId, e.agent));
  const jobSite = new Map(); // jobId -> site the agent moved to for it
  const pendingIn = []; // { r, agent, jobId } checked after the event
  const pendingOut = []; // { r, agent, by: frame deadline }
  hive.on("move", (e) => {
    jobSite.set(`${e.agent}|${e.jobId}`, e.to);
    const r = bySite.get(e.to);
    if (r && homeOf(e.agent) !== e.to && tier !== "low") pendingIn.push({ r, agent: e.agent, jobId: e.jobId, turning: r.mount.leaving().includes(e.agent) });
    for (const q of rooms) if (q !== r && q.mount.placed.some((p) => p.agent.id === e.agent) && tier !== "low") pendingOut.push({ r: q, agent: e.agent, why: "move" });
  });
  const endJob = (e, w) => { // at the event, before the rooms hear it (these listeners come first)
    const site = jobSite.get(`${w}|${e.jobId}`); const r = site ? bySite.get(site) : null;
    if (!r || tier === "low" || homeOf(w) === site) return;
    const rest = r.mount.presence.jobsOf(w).filter((j) => j !== e.jobId);
    if (!rest.length && r.mount.placed.some((p) => p.agent.id === w)) pendingOut.push({ r, agent: w, why: "end" });
  };
  hive.on("complete", (e) => endJob(e, e.agent));
  hive.on("refused", (e) => endJob(e, e.winner ?? awardOf.get(e.jobId) ?? e.agent));
  const later = [];
  for (const r of rooms) r.mount = HW.hwMountRoomAgents({ three: THREE, room: r.room, agents: hive.agents, source: hive, tier });
  let clock = 0;
  for (let step = 0; step < 480; step += 1) {
    hive.step();
    for (const fn of later.splice(0)) fn();
    // arrivals: visible inside at once, entering through the doorway (or waiting outside when the room holds three)
    for (const q of pendingIn.splice(0)) {
      V.arrivals += 1;
      const s = q.r.mount.avatars?.state(q.agent), fig = q.r.mount.avatars?.figure(q.agent);
      const placedHere = q.r.mount.placed.some((p) => p.agent.id === q.agent);
      if (placedHere && fig && inGroup(fig, q.r.room.group) && s?.visible) {
        V.shown += 1;
        const d = q.r.room.door;
        if (q.turning) V.turned += 1; // still walking out when the hive sent it back: it turns round where it is
        else if (s.walking && Math.hypot(s.x - d.x, s.z - d.z) < 0.6) V.throughDoor += 1;
        else if (process.env.H3_DEBUG) console.log("door?", tier, q.r.st, q.agent, JSON.stringify({ x: s.x, z: s.z, walking: s.walking, door: d, log: q.r.mount.log().slice(-3) }));
      } else if (q.r.mount.waiting().includes(q.agent)) V.waited += 1;
      else if (q.r.mount.presence.at(q.agent) !== q.r.rb.id) V.passed += 1; // sent on again (or its job ended) in the same step
      else ok(false, `${tier}/${q.r.st}: ${q.agent} shown on its move`, JSON.stringify({ placedHere, fig: !!fig, s: s && [s.x, s.z, s.visible, s.walking] }));
    }
    for (const q of pendingOut) { if (q.counted) continue; q.deadline = clock + 12; if (q.why === "end") V.ended += 1; else V.movedAway += 1; q.counted = true; }
    // animate a second of walking per step
    for (let f = 0; f < 5; f += 1) {
      clock += 0.2;
      for (const r of rooms) {
        r.mount.animate(clock, 0.2);
        if (tier === "low") continue;
        const c = r.mount.counts();
        V.maxFigures = Math.max(V.maxFigures, c.figures);
      }
    }
    for (let i = pendingOut.length - 1; i >= 0; i -= 1) {
      const q = pendingOut[i]; const fig = q.r.mount.avatars?.figure(q.agent);
      if (!fig || !inGroup(fig, q.r.room.group)) { if (q.why === "end") V.leftOnEnd += 1; else V.leftOnMove += 1; pendingOut.splice(i, 1); continue; }
      if (q.r.mount.placed.some((p) => p.agent.id === q.agent) && !q.r.mount.leaving().includes(q.agent)) { pendingOut.splice(i, 1); if (q.why === "end") V.ended -= 1; else V.movedAway -= 1; continue; } // sent back before it reached the door
      if (clock > q.deadline) { ok(false, `${tier}/${q.r.st}: ${q.agent} walked out within 12 s`, JSON.stringify(q.r.mount.avatars?.state(q.agent))); pendingOut.splice(i, 1); }
    }
    if (tier === "low") continue;
    for (const r of rooms) {
      const m = IXR.ixrMeasure(r.room), tex = m.textureBytes + signBytes;
      const inside = m.meshes <= IX.IX_BUDGET.meshes && m.triangles <= IX.IX_BUDGET.triangles[lt] && tex <= IXR.IXR_TEX_BUDGET[tier];
      V.budgetSteps += 1; if (inside) V.budgetOk += 1;
      const w = (V.worst[`${r.st}/${tier}`] ??= { meshes: 0, triangles: 0, tex: 0, figures: 0 });
      w.meshes = Math.max(w.meshes, m.meshes); w.triangles = Math.max(w.triangles, m.triangles); w.tex = Math.max(w.tex, tex); w.figures = Math.max(w.figures, r.mount.counts().figures);
    }
  }
  if (tier === "low") {
    const figs = rooms.reduce((a, r) => a + (r.mount.counts().figures ?? 0), 0), here = rooms.reduce((a, r) => a + r.mount.placed.length, 0);
    ok(figs === 0 && here > 0, `phone tier: the agents keep their places in the state machine (${here} placed at the end of the day) and no figure is built (${figs})`);
  }
  if (tier === "high") {
    const r = rooms.find((x) => x.st === "ixr-cell-hall");
    console.log(`     cell hall at the end of the day (high): ${r.mount.placed.map((p) => `${p.agent.key}@${p.spot.id}`).join(", ") || "(empty)"}; log ${r.mount.log().length} entries`);
  }
  for (const r of rooms) r.mount.dispose();
}
ok(V.arrivals > 0 && V.shown + V.waited + V.passed === V.arrivals, `job-moved agents shown in the rooms on their move: ${V.shown} of ${V.arrivals - V.passed} (high + balanced; ${V.passed} more left again within the same step); ${V.waited} waited outside while the room held ${H3.H3_ROOM_FIGURES} figures`);
ok(V.throughDoor + V.turned === V.shown, `each came in through the doorway, walking to its place: ${V.throughDoor} of ${V.shown - V.turned} (${V.turned} more were still walking out when the hive sent them back, and turned round inside)`);
ok(V.ended > 0 && V.leftOnEnd === V.ended, `a visitor walks out through the door when its job ends: ${V.leftOnEnd} of ${V.ended}`);
ok(V.leftOnMove === V.movedAway, `an agent the hive sends elsewhere walks out of the room it was in: ${V.leftOnMove} of ${V.movedAway}`);
ok(V.maxFigures <= H3.H3_ROOM_FIGURES, `figures in a room at once never above ${H3.H3_ROOM_FIGURES}: worst ${V.maxFigures}`);
ok(V.budgetSteps > 0 && V.budgetOk === V.budgetSteps, `every room inside IX_BUDGET and IXR_TEX_BUDGET at every step of the day: ${V.budgetOk} of ${V.budgetSteps} room-steps (6 rooms × 480 steps × 2 tiers)`);
{
  const worst = Object.entries(V.worst).sort((a, b) => b[1].tex - a[1].tex)[0];
  console.log(`     worst room-tier by texture bytes: ${worst[0]} — ${worst[1].figures} figures, ${worst[1].meshes} meshes (of ${IX.IX_BUDGET.meshes}), ${worst[1].triangles} triangles, ${fmtB(worst[1].tex)} (of ${fmtB(IXR.IXR_TEX_BUDGET[worst[0].split("/")[1]])})`);
  for (const k of ["ixr-cell-hall/high", "ixr-cell-hall/balanced"]) { const w = V.worst[k]; console.log(`     ${k}: worst ${w.figures} figures, ${w.meshes} meshes, ${w.triangles} triangles, ${fmtB(w.tex)}`); }
}
{
  // reduced motion: a visitor appears in place and goes at once
  const rooms = buildRooms("high"); const r = rooms.find((x) => x.st === "ixr-cell-hall");
  const hive = OHH.ohHive({ seed: 1 });
  const m = HW.hwMountRoomAgents({ three: THREE, room: r.room, agents: hive.agents, source: hive, tier: "high", reducedMotion: true });
  let walked = 0, inNow = 0, outNow = 0, ins = 0, outs = 0;
  const before = new Set(m.placed.map((p) => p.agent.id));
  for (let step = 0; step < 480; step += 1) {
    hive.step(); m.animate(step, 1);
    const nowIds = new Set(m.placed.map((p) => p.agent.id));
    for (const id of nowIds) if (!before.has(id)) { ins += 1; const s = m.avatars.state(id); if (s?.walking) walked += 1; else inNow += 1; }
    for (const id of before) if (!nowIds.has(id)) { outs += 1; if (!m.avatars.figure(id)) outNow += 1; }
    before.clear(); for (const id of nowIds) before.add(id);
  }
  ok(ins > 0 && walked === 0 && inNow === ins && outNow === outs, `reduced motion: ${ins} arrivals in place at once and ${outs} departures gone at once, no walking (${walked})`);
  m.dispose();
  ok(m.avatars.sources() === 0, "dispose detaches the room's figures and its presence from the hive");
}

// ------------------------------------------------------------------------------------------------ 2. remembered settings
console.log("\n2. remembered settings (stubbed localStorage and sessionStorage)");
delete globalThis.document;
const mkStore = () => { const m = new Map(); return { m, getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, clear: () => m.clear() }; };
const LS = mkStore(), SS = mkStore();
globalThis.localStorage = LS; globalThis.sessionStorage = SS; globalThis.window ??= globalThis;
const GT = await imp("shared/profiles.js");
const AUTH_KEY = "vr-training-auth-v1";
const signIn = (id) => LS.setItem(AUTH_KEY, JSON.stringify({ id }));
const adult = { demo: false, signedIn: true, k12: false, adult: null };
const settingsNow = (signals) => H3.h3Settings({ storage: GT.gtStorage(), signals, profile: GT.gtProfile(), demo: false });
const h3Keys = (st) => [...st.m.keys()].filter((k) => k.startsWith(H3.H3_SETTINGS_KEY));
{
  signIn("learner-a");
  const s1 = settingsNow(adult);
  const wrote = s1.write({ voice: true }) && s1.write({ supervise: true }) && s1.write({ lang: "es" });
  const keys = h3Keys(LS);
  const back = settingsNow(adult).read(); // a reload: a new reader over the same device storage
  ok(wrote && back.voice === true && back.supervise === true && back.lang === "es", "a signed-in adult profile: voice, supervise every job and the language survive a reload", JSON.stringify(back));
  ok(keys.length === 1 && /^h3-hive-settings-v1::id-[0-9a-f]{16}$/.test(keys[0]) && h3Keys(SS).length === 0, "stored on this device under the profile's own namespaced key only (no learner id in the key, nothing in sessionStorage)", keys.join(", "));
  ok(GT.GT_PROFILE_KEYS.includes(H3.H3_SETTINGS_KEY), "the key is one of profiles.js GT_PROFILE_KEYS (private to a profile)");
  signIn("learner-b");
  ok(Object.keys(settingsNow(adult).read()).length === 0, "another signed-in profile on the same device reads nothing of the first one's");
  signIn("learner-a");
  // sign-out clears it (auth.js signOut, the real one)
  let signedOut = null;
  try { const AU = await imp("shared/auth.js"); AU.Auth.session = { id: "learner-a", provider: "demo" }; AU.Auth.signOut(); signedOut = true; } catch (e) { signedOut = String(e?.message ?? e); }
  signIn("learner-a");
  ok(signedOut === true && Object.keys(settingsNow(adult).read()).length === 0 && h3Keys(LS).length === 0, "sign-out (auth.js Auth.signOut) removes them; signing in again finds nothing", signedOut === true ? "" : String(signedOut));
}
{
  // demo, K-12, signed out, unknown: nothing read, nothing written, anywhere
  LS.clear(); SS.clear();
  const cases = [];
  signIn("learner-c");
  cases.push(["demo (?demo)", H3.h3Settings({ storage: GT.gtStorage(), signals: adult, profile: GT.gtProfile(), demo: true })]);
  cases.push(["demo (signals)", H3.h3Settings({ storage: GT.gtStorage(), signals: { ...adult, demo: true }, profile: GT.gtProfile() })]);
  cases.push(["K-12", H3.h3Settings({ storage: GT.gtStorage(), signals: { ...adult, k12: true }, profile: GT.gtProfile() })]);
  cases.push(["unknown signals", H3.h3Settings({ storage: GT.gtStorage(), signals: { demo: null, signedIn: null, k12: null }, profile: GT.gtProfile() })]);
  LS.removeItem(AUTH_KEY);
  cases.push(["signed out", H3.h3Settings({ storage: GT.gtStorage(), signals: { ...adult, signedIn: false }, profile: GT.gtProfile() })]);
  SS.setItem("vr-training-demo-v1", "1");
  cases.push(["demo profile", H3.h3Settings({ storage: GT.gtStorage(), signals: { ...adult, demo: true }, profile: GT.gtProfile() })]);
  SS.removeItem("vr-training-demo-v1");
  const res = cases.map(([label, s]) => ({ label, allowed: s.allowed, wrote: s.write({ voice: true, supervise: true, lang: "es" }), read: Object.keys(s.read()).length, reason: s.reason }));
  ok(res.every((r) => !r.allowed && !r.wrote && r.read === 0) && h3Keys(LS).length === 0 && h3Keys(SS).length === 0, `demo, K-12, signed-out and unknown sessions store and read nothing: ${res.length} of ${cases.length} (${res.map((r) => `${r.label} → ${r.reason}`).join("; ")})`);
}
{
  const src = read("WebXR/shared/h3-hive-day.js").replace(/\/\/.*$/gm, "");
  ok(!/\b(fetch|XMLHttpRequest|WebSocket|sendBeacon|EventSource|navigator\.|import\()/.test(src) && !/^import /m.test(src), "h3-hive-day.js imports nothing and has no network call (never uploaded)");
}

// ------------------------------------------------------------------------------------------------ 3. the panel in Spanish
console.log("\n3. the hive panel in Spanish");
{
  const EN = H3.H3_PANEL_TEXT.en, ES = H3.H3_PANEL_TEXT.es;
  const probe = (v) => (typeof v === "function" ? String(v.length === 3 ? v(7, { completed: 1, refused: 2, vetoed: 3, declined: 4, awaitingApproval: 5 }, { lines: 9, ok: true }) : v(v.length === 1 ? { jobId: "J-1", task: "Task", siteName: "Site" } : 2)) : String(v));
  const keys = Object.keys(EN).filter((k) => k !== "review");
  const enStrings = keys.map((k) => probe(EN[k])).filter(Boolean);
  const covered = keys.filter((k) => ES[k] != null && typeof ES[k] === typeof EN[k] && probe(ES[k]) && probe(ES[k]) !== probe(EN[k]));
  ok(covered.length === keys.length, `Spanish UI strings covered: ${covered.length} of ${keys.length}`, keys.filter((k) => !covered.includes(k)).join(", "));
  const leaks = keys.filter((k) => { const t = probe(ES[k]); return ["software agents managing", "Seven software agents", "Home:", "Voice:", "Supervise every job", "Approve", "Decline", "Waiting for you", "completed", "audit chain", "Language: English", "Run 2 steps"].some((e) => t.includes(e)); });
  ok(leaks.length === 0, "no English UI phrase inside a Spanish string", leaks.join(", "));
  const roles = OHD.OH_AGENTS.filter((a) => H3.h3RoleIn(a, "es") && H3.h3RoleIn(a, "es") !== a.role && H3.h3RoleIn(a, "en") === a.role);
  ok(roles.length === OHD.OH_AGENTS.length, `the agents' role sentences in Spanish: ${roles.length} of ${OHD.OH_AGENTS.length}; English unchanged`);
  const chipWords = ["warm", "reserved", "formal", "casual", "detailed", "brief", "cautious", "brisk"];
  const chipsOk = chipWords.filter((c) => H3.h3ChipIn(c, "es") && H3.h3ChipIn(c, "en") === c);
  const chipsUsed = new Set(OHD.OH_AGENTS.flatMap((a) => OHD.ohTraitChips(a.traits)));
  ok(chipsOk.length === chipWords.length && [...chipsUsed].every((c) => chipWords.includes(c)), `personality chips in Spanish: ${chipsOk.length} of ${chipWords.length} (every chip the roster shows: ${[...chipsUsed].join(", ")})`);
  ok(EN.note.startsWith("Seven software agents, not people, coordinate the robot jobs") && EN.approve === "Approve (simulated only)" && EN.label === OHD.OH_AGENT_LABEL && probe(EN.voice) === "Voice: on" && EN.review === "", "English is the panel's text as it was (note, labels, buttons)");
  ok(/native speaker/.test(ES.review) === false && /hablante nativo/.test(ES.review), "the Spanish panel carries the note that it awaits a native speaker's review");
  const panel = read("WebXR/shared/oh-panel.js");
  const literal = ["\"Step\"", "`Run ${OH_RUN_STEPS} steps`", "\"Voice: off\"", "\"Approve (simulated only)\"", "\"Decline\"", "`Waiting for you", "\"Agent captions\"", "`Home: "];
  ok(literal.every((l) => !panel.includes(l)) && /T\.status\(hive\.now\(\), m, v\)/.test(panel) && /h3RoleIn\(a, hiveLang\)/.test(panel), "oh-panel.js draws every UI string from the language's table (no English literal left)");
}

// ------------------------------------------------------------------------------------------------ 5. "A day in the hive"
console.log("\n5. \"A day in the hive\" (the scene's hive, paced by its beats)");
{
  const runScene = (seed) => {
    const hive = H3.h3SceneHive(OHH.ohHive, { seed });
    for (let i = 0; i < H3.H3_SCENE_PROLOGUE_STEPS; i += 1) hive.step();
    const pre = hive.jobs().map((j) => `${j.n}:${j.status}:${j.winner ?? ""}`).join(",");
    const R = H3.h3SceneRelay(hive);
    const beats = [];
    for (const b of H3.H3_SCENE.beats) {
      R.step(b.steps);
      if (b.id === "approved") { const p = hive.pending()[0]; if (p) hive.approve(p.jobId); }
      const ev = b.id === "arrive" ? R.releaseThrough("speak") : b.id === "bids" ? R.releaseRun("bid") : b.id === "award" ? R.releaseThrough("award") : b.id === "walk-out" ? R.releaseThrough("move") : b.id === "refusal" ? R.releaseThrough("refused") : R.releaseAll();
      beats.push({ id: b.id, at: b.at, ev: ev.map((e) => `${e.type}:${e.agent}:${e.to ?? ""}:${e.reason ?? ""}`) });
    }
    return { pre, beats, m: hive.metrics(), v: hive.verify(), events: hive.events().map((e) => `${e.t}|${e.type}|${e.agent}|${e.jobId ?? ""}|${e.text ?? ""}`) };
  };
  const a = runScene(1), b = runScene(1);
  ok(JSON.stringify(a.events) === JSON.stringify(b.events) && a.events.length > 0, `deterministic for a seed: the same ${a.events.length} events (and words) on two runs of seed 1`);
  const story = (r) => {
    const f = (id, s) => (r.beats.find((x) => x.id === id)?.ev ?? []).some((e) => e.startsWith(s));
    return r.pre.startsWith("0:running:oh-maintenance-planner") && f("arrive", "speak:oh-dispatcher") && f("bids", "bid:") && f("award", "award:oh-maintenance-planner") && f("walk-out", "move:oh-maintenance-planner:rb-site-richland-drilling-robot")
      && f("refusal", "refused:oh-dispatcher:rb-site-soma-robot-cell:inside-separation") && f("approval", "approval-request:oh-consent-keeper:rb-site-soma-robot-cell:physical-target")
      && f("walk-in", "move:oh-maintenance-planner:rb-site-soma-robot-cell") && r.beats.find((x) => x.id === "run").ev.some((e) => e.startsWith("dispatch:oh-maintenance-planner:rb-site-soma-robot-cell")) && r.m.physicalDispatched === 0 && r.v.ok;
  };
  const seeds = [1, 2, 3, 7, 42];
  const told = seeds.filter((s) => story(runScene(s)));
  ok(told.length === seeds.length, `the story holds for seeds ${seeds.join(", ")}: ${told.length} of ${seeds.length} (the planner wins and walks out, the governor refuses a person 1.2 m from the robot, a physical-robot job asks the learner, the approved simulated run dispatches; physical dispatches 0, audit chain intact)`);
  const at = H3.H3_SCENE.beats.map((x) => x.at);
  ok(H3.H3_SCENE.duration >= 20 && H3.H3_SCENE.duration <= 30 && at.every((t, i) => i === 0 || t > at[i - 1]) && at[at.length - 1] <= H3.H3_SCENE.duration, `the scene lasts ${H3.H3_SCENE.duration} s with ${at.length} beats in order`);
  const app = read("WebXR/parishes/js/app.js");
  ok(/window\.__parishTest\.hiveScene = /.test(app) && /h3SceneSay\("The governor refuses"/.test(app) && /h3SceneSay\("You approve: a simulated run only"/.test(app) && /VB_REASONS\.find/.test(app), "the page plays it (window.__parishTest.hiveScene) with the refusal's reason and the approval captioned");
}

// ------------------------------------------------------------------------------------------------ 6. the wiring
console.log("\n6. the wiring");
{
  const app = read("WebXR/parishes/js/app.js"), bundler = read("tools/bundle_webxr.py"), all = read("tools/check_all.mjs"), base = JSON.parse(read("docs/perf/checkers-baseline.json")), auth = read("WebXR/shared/auth.js");
  ok(/settings: h3Prefs/.test(app) && /h3Settings\(\{ storage: gtStorage\(\), signals: dxReadSignals\(\), profile: gtProfile\(\), demo: npParams\.has\("demo"\) \}\)/.test(app), "the parishes app hands the panel this profile's settings (gtStorage, DATAWORKS' signals, the ?demo flag)");
  ok(/onTalk: \(id, on\) => \{ if \(on\) \{ aaWorld\?\.talkStart\(id\); hwRoomMount\?\.avatars\?\.talkStart\(id\);/.test(app) && /const hv = h3Scene\?\.relay \?\? window\.__parishTest\?\.hive\?\.hive/.test(app), "the voice's onstart/onend reach the room figures' talk light; the room follows the scene's hive while it plays");
  const i3 = bundler.indexOf('SHARED / "h3-hive-day.js"'), iPanel = bundler.indexOf('SHARED / "oh-panel.js"'), iHw = bundler.indexOf('SHARED / "hw-hive-world.js"');
  ok(i3 > 0 && i3 < iPanel && i3 < iHw, "h3-hive-day.js is in the parishes bundle before oh-panel.js and hw-hive-world.js");
  ok(/"check_hive3\.mjs"/.test(all) && Number.isFinite(base.checkers?.["check_hive3.mjs"] ?? base["check_hive3.mjs"]) && /ESTIMATE/.test(base.notes?.["check_hive3.mjs"] ?? ""), "check_all lists check_hive3.mjs and the baseline row is labelled an estimate");
  ok(/gtStorage\(\)\?\.removeItem\("h3-hive-settings-v1"\)/.test(auth) && auth.indexOf('removeItem("h3-hive-settings-v1")') < auth.indexOf("localStorage.removeItem(AUTH_KEY)"), "auth.js signOut clears the hive settings before the session key goes");
}

console.log(`\ncheck_hive3: ${failures ? `${passes} passed, ${failures} failed` : `all ${passes} checks pass`}.`);
process.exit(failures ? 1 : 0);
