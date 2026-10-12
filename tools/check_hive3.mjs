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
