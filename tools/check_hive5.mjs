#!/usr/bin/env node
/**
 * HIVE-5 — the hive in its own room, live (docs/consoles/HIVE-5.md). Single checker; never run check_all here. Headless, no browser.
 *   1. the operations room's screens show the hive: seven console cells and the video wall painted from the hive's own data
 *      (each card's name, "software agent" label, lines and queue; the wall's feed and the governor's refusals with reasons), on
 *      the room's own canvases (texture bytes unchanged, inside IXR_TEX_BUDGET); small screens take no words;
 *   2. the hive stands in its room: through hwSyncRoom, seven agents at their seven consoles on entering (high and balanced; the
 *      phone tier builds none), each at its role's spot facing the video wall; the room inside IX_BUDGET and IXR_TEX_BUDGET with
 *      seven figures (lightened) speaking, and at every step of a seeded day in which agents walk out to jobs and back;
 *   3. the console tab, live: the panel's hive reaches a reader through a stand-in BroadcastChannel only while the learner's link
 *      is on, each line is one of the hive's own captions, "off" makes the reader drop what it holds, a silent page goes stale, and
 *      the tab and the link write no storage and make no request;
 *   4. home after a job, outdoors too: with `homeward`, every agent whose last job ends away from home walks home (a move and its
 *      own grounded line), the outdoor figures follow, the default hive has no home move, and the governor still checks every step
 *      with 0 physical dispatches;
 *   5. wiring and hygiene: the bundles, the app, hwSyncRoom, the prefix, no import alias, no network or model call, check_all and
 *      the baseline row.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);
const read = (rel) => { try { return readFileSync(join(ROOT, rel), "utf8"); } catch (_) { return ""; } };
let passed = 0, failed = 0;
const evals = [];
function ok(cond, msg) { if (!cond) throw new Error(msg); }
async function check(name, fn) {
  try { const r = await fn(); passed += 1; console.log(`PASS ${name}${r ? ` — ${r}` : ""}`); }
  catch (e) { failed += 1; console.log(`FAIL ${name} — ${e.message}`); }
}
const fmtB = (b) => `${(b / 1048576).toFixed(2)} MiB`;

const THREE = await imp("WebXR/vendor/three/dist/three.module.min.js");
const IX = await imp("WebXR/shared/ix-interiors.js");
const IXR = await imp("WebXR/shared/ixr-robo-interiors.js");
const HD2 = await imp("WebXR/shared/hd2-room-skins.js");
const HD4 = await imp("WebXR/shared/hd4-rooms.js");
const HW = await imp("WebXR/shared/hw-hive-world.js");
const AA = await imp("WebXR/shared/aa-agent-avatars.js");
const D = await imp("WebXR/shared/oh-hive-data.js");
const S = await imp("WebXR/shared/oh-say.js");
const H = await imp("WebXR/shared/oh-hive.js");
const RB = await imp("WebXR/shared/rb-robotics-data.js");
const O = await imp("WebXR/shared/h5-ops-room.js");
const L = await imp("WebXR/shared/h5-hive-live.js");

const PANEL = { exchanges: true, memory: true, variety: true, homeward: true }; // the panel's configuration (oh-panel.js)
const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const SITE_NAMES = RB.RB_SITES.map((s) => s.name);
const SHELL = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);

// A recording canvas: each canvas has its own context, which logs fillText with the translation in force (hd4's paint translates to a cell).
function canvasStub() {
  const canvases = [];
  globalThis.document = {
    createElement: () => {
      const log = [], stack = [], at = { x: 0, y: 0 };
      let font = "10px sans-serif";
      const ctx = new Proxy({}, {
        get: (_t, k) => {
          if (k === "font") return font;
          if (k === "measureText") return (s) => ({ width: String(s).length * (Number(/(\d+)px/.exec(font)?.[1]) || 10) * 0.52 });
          if (k === "fillText") return (s, x, y) => log.push({ text: String(s), x: x + at.x, y: y + at.y, ox: at.x, oy: at.y });
          if (k === "save") return () => stack.push({ ...at });
          if (k === "restore") return () => { const p = stack.pop(); if (p) { at.x = p.x; at.y = p.y; } };
          if (k === "translate") return (x, y) => { at.x += x; at.y += y; };
          if (typeof k === "string" && k.startsWith("create")) return () => ({ addColorStop() {} }); // gradients and patterns (ENV-HD-2's skins)
          if (k === "getImageData") return (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, 4 * (w | 0) * (h | 0))) });
          return () => {};
        },
        set: (_t, k, v) => { if (k === "font") font = String(v); return true; },
      });
      const c = { width: 0, height: 0, getContext: () => ctx, log };
      canvases.push(c);
      return c;
    },
  };
  return canvases;
}
const reg = () => { const d = {}; return { d, ixRegisterDresser: (st, fn) => (d[st] ??= []).push(fn) }; };
const dressers = (() => { const r = reg(); IXR.ixrRegisterDressers(r); HD4.hd4RegisterDressers(r, { ultra: false, ua: DESK }); HD2.hd2RegisterSkins(r); return r.d; })();
const buildOps = (tier) => IX.ixBuild(HD4.HD4_OPS_STYLE, { three: THREE, tier, site: HD4.hd4OpsSite(HD4.hd4OpsHome(), null), dressers });
const measure = (room) => { const m = IXR.ixrMeasure(room); const signs = m.textures.some((t) => /sign|label|board/i.test(t.name)) ? 0 : SHELL; return { meshes: m.meshes, triangles: m.triangles, bytes: m.textureBytes + signs }; };
const inside = (s, tier) => s.meshes <= IX.IX_BUDGET.meshes && s.triangles <= IX.IX_BUDGET.triangles[tier === "low" ? "low" : "high"] && s.bytes <= IXR.IXR_TEX_BUDGET[tier];

// ------------------------------------------------------------------------------------------------ 1. the screens
await check("1 the operations room's screens show the hive (7 consoles + the wall), on the room's own canvases", () => {
  const out = [];
  for (const tier of ["high", "balanced"]) {
    canvasStub();
    const room = buildOps(tier), scr = HD4.hd4OpsScreens(room);
    ok(scr?.canvas && scr.wall?.canvas, `${tier}: the room's screens seam`);
    const placeholder = scr.canvas.log.length + scr.wall.canvas.log.length; // ENV-HD-4's placeholders draw no words
    const before = measure(room);
    const hive = H.ohHive({ seed: 1, ...PANEL });
    hive.run(150);
    const mount = HW.hwSyncRoom(null, { room, three: THREE, agents: hive.agents, source: hive, tier, mount: () => null }); // the screens alone (figures: section 2)
    ok(mount && typeof mount.paint === "function", `${tier}: hwSyncRoom hands the ops room to the hive's ops mount`);
    scr.canvas.log.length = 0; scr.wall.canvas.log.length = 0;
    const n = mount.paint();
    const painted = mount.painted();
    ok(n === 8 && painted.includes("wall") && D.OH_AGENTS.every((a) => painted.includes(a.id)), `${tier}: painted ${n} of 8 (${painted.join(", ")})`);
    const after = measure(room);
    ok(after.bytes === before.bytes && after.meshes === before.meshes && after.triangles === before.triangles, `${tier}: the screens add no texture byte, mesh or triangle (${fmtB(before.bytes)} -> ${fmtB(after.bytes)})`);
    ok(after.bytes <= IXR.IXR_TEX_BUDGET[tier], `${tier}: inside IXR_TEX_BUDGET (${fmtB(after.bytes)})`);
    if (tier === "high") {
      ok(placeholder === 0, "the base placeholders drew words");
      const model = O.h5HiveModel(hive, hive.agents);
      const speaks = hive.events().filter((e) => e.type === "speak");
      for (const cell of scr.cells) {
        const words = scr.canvas.log.filter((l) => l.ox === cell.x && l.oy === cell.y).map((l) => l.text);
        const a = hive.agents.find((x) => x.id === cell.agentId), card = model.card(a.id);
        ok(words.some((w) => w.startsWith(a.name.slice(0, 3))) && words.some((w) => /software agent/.test(w)), `${a.id}: the card names the agent and says "software agent" (${words.slice(0, 2).join(" | ")})`);
        // every painted line is the head of one of this agent's own lines (after its hive-clock time)
        const lineWords = words.filter((w) => /^\d\d:\d\d /.test(w)).map((w) => w.replace(/^\d\d:\d\d /, "").replace(/…$/, ""));
        const mine = speaks.filter((e) => e.agent === a.id).map((e) => e.text);
        ok(lineWords.length >= 1 && lineWords.every((w) => mine.some((t) => t.startsWith(w))), `${a.id}: every painted line is one of its own lines (${lineWords.length})`);
        ok(card.queue.every((q) => words.some((w) => w.includes(q.jobId.slice(0, 8)))) || card.queue.length > 2, `${a.id}: the queue shows the jobs it holds`);
      }
      const wall = scr.wall.canvas.log.map((l) => l.text);
      const refs = model.refusals(4), feed = model.feed(5);
      ok(wall.some((w) => /^Today's feed/.test(w)) && wall.some((w) => /^Governor refusals/.test(w)), "the wall's two panels: the feed and the governor's refusals");
      ok(refs.length > 0 && refs.every((r) => wall.some((w) => w.includes(r.jobId))), `the wall lists the last ${refs.length} refusals by job id`);
      ok(feed.every((f) => wall.some((w) => f.caption.startsWith(w.replace(/^\d\d:\d\d /, "").replace(/…$/, "")) && w.length > 8)), "the wall's feed lines are the hive's own captions");
      ok(wall.some((w) => /physical dispatches 0/.test(w)), "the wall shows the day's counts (physical dispatches 0)");
      out.push(`high: ${scr.canvas.log.length} words on 7 console cells, ${wall.length} on the wall; ${refs.length} refusals, ${feed.length} feed lines`);
      evals.push(`ops-room screens painted from the hive: 0 -> ${n} (7 consoles + the wall), texture bytes unchanged ${fmtB(before.bytes)} (IXR_TEX_BUDGET ${fmtB(IXR.IXR_TEX_BUDGET.high)}), high tier`);
    } else {
      ok(scr.canvas.log.length === 0 && scr.wall.canvas.log.length === 0, "balanced: small screens take no words");
      out.push(`balanced: ${n} painted, no words (128 × 64 cells)`);
    }
    mount.dispose();
  }
  delete globalThis.document;
  return out.join("; ");
});

// ------------------------------------------------------------------------------------------------ 2. the hive stands in its room
await check("2 the hive stands in its operations room: seven at their consoles, inside IX_BUDGET, out to jobs and back", () => {
  const out = [];
  for (const tier of ["high", "balanced", "low"]) {
    canvasStub();
    const room = buildOps(tier), base = measure(room);
    ok(!HW.hwIsRobotRoom(room), "the ops room is not an ixr room (before: hwSyncRoom returned null for it)");
    const hive = H.ohHive({ seed: 1, ...PANEL });
    const mount = HW.hwSyncRoom(null, { room, three: THREE, agents: hive.agents, source: hive, tier });
    const standing = mount.standing();
    if (tier === "low") { ok(standing.length === 0 && (mount.avatars?.counts().figures ?? 0) === 0, "low: no figures"); ok(measure(room).triangles === base.triangles, "low: the room unchanged"); out.push("low: 0 figures (the phone tier builds none)"); mount.dispose(); continue; }
    ok(standing.length === 7, `${tier}: ${standing.length} of 7 standing on entering`);
    for (const a of hive.agents) {
      const s = mount.avatars.state(a.id), spot = room.spots.agent.find((x) => x.role === a.key), fig = mount.avatars.figure(a.id);
      ok(s && spot && Math.hypot(s.x - spot.x, s.z - spot.z) < 0.05, `${tier}/${a.id}: at its role's spot`);
      ok(fig && Math.abs(((fig.rotation.y - (spot.yaw + Math.PI)) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI) < 1e-6, `${tier}/${a.id}: facing the video wall`);
      ok(fig.userData.h5Lite && fig.userData.h5Lite.after < fig.userData.h5Lite.before, `${tier}/${a.id}: lightened`);
    }
    for (const a of hive.agents) mount.avatars.handle({ type: "speak", agent: a.id, text: `${a.name} speaks a line long enough to fill its caption bubble with words.` });
    const full = measure(room);
    const lite = mount.avatars.figure(hive.agents[0].id).userData.h5Lite;
    ok(inside(full, tier), `${tier}: 7 figures speaking: ${full.meshes} meshes <= ${IX.IX_BUDGET.meshes}, ${full.triangles} triangles <= ${IX.IX_BUDGET.triangles.high}, ${fmtB(full.bytes)} <= ${fmtB(IXR.IXR_TEX_BUDGET[tier])}`);
    out.push(`${tier}: 7 standing; room ${base.meshes}/${base.triangles}/${fmtB(base.bytes)} -> with 7 speaking ${full.meshes}/${full.triangles}/${fmtB(full.bytes)}; a figure ${lite.before} -> ${lite.after} triangles`);
    if (tier === "high") evals.push(`agents standing in the ops room on entering: 0 -> 7 (high and balanced; phone 0); high room with 7 speaking figures ${full.meshes} meshes, ${full.triangles} triangles, ${fmtB(full.bytes)} (IX_BUDGET 120 / 6,000; 24 MiB); a figure lightened ${lite.before} -> ${lite.after} triangles (7 standard figures would make ${base.triangles + 7 * lite.before})`);
    if (tier === "balanced") evals.push(`balanced ops room with 7 speaking figures: ${full.meshes} meshes, ${full.triangles} triangles, ${fmtB(full.bytes)} (3 MiB)`);
    // the day: out to jobs and back, inside the budget at every step
    let steps = 0, okSteps = 0, clock = 0, worst = { triangles: 0, bytes: 0 }, consistent = 0, checks = 0;
    for (let k = 0; k < 480; k += 1) {
      hive.step();
      for (let f = 0; f < 5; f += 1) { clock += 0.2; mount.animate(clock, 0.2); }
      const s = measure(room); steps += 1; if (inside(s, tier)) okSteps += 1;
      worst = { triangles: Math.max(worst.triangles, s.triangles), bytes: Math.max(worst.bytes, s.bytes) };
      for (const a of hive.agents) { checks += 1; const held = mount.presence.jobsOf(a.id).length > 0, here = mount.placed.some((p) => p.agent.id === a.id); if (held !== here) consistent += 1; }
    }
    const log = mount.log(), outs = log.filter((l) => l.what === "out").length, backs = log.filter((l) => l.what === "in" && l.walked).length;
    ok(okSteps === steps, `${tier}: inside the budget at every step (${okSteps} of ${steps})`);
    ok(consistent === checks, `${tier}: at its console exactly while it holds no job (${consistent} of ${checks} agent-steps)`);
    ok(outs > 0 && backs > 0 && mount.leaving().length <= 7, `${tier}: walked out to jobs ${outs}, walked back in ${backs}`);
    out.push(`${tier} day: out ${outs}, back ${backs}, ${okSteps} of ${steps} steps inside (worst ${worst.triangles} triangles, ${fmtB(worst.bytes)})`);
    if (tier === "high") evals.push(`ops room through the seeded day (seed 1, 480 steps): walked out to jobs ${outs}, walked back to their consoles ${backs}; inside IX_BUDGET and IXR_TEX_BUDGET ${okSteps} of ${steps} steps (worst ${worst.triangles} triangles, ${fmtB(worst.bytes)})`);
    mount.dispose();
  }
  delete globalThis.document;
  return out.join("; ");
});

// ------------------------------------------------------------------------------------------------ 3. the console tab, live
await check("3 the console tab, live: the panel's hive on this device only while the link is on; receive only; nothing stored", async () => {
  const bus = new Map();
  class FakeChannel { constructor(name) { this.name = name; this.onmessage = null; (bus.get(name) ?? bus.set(name, new Set()).get(name)).add(this); } postMessage(d) { const data = JSON.parse(JSON.stringify(d)); for (const c of bus.get(this.name)) if (c !== this) c.onmessage?.({ data }); } close() { bus.get(this.name)?.delete(this); } }
  let now = 1000;
  const got = [];
  const reader = L.h5LiveReader({ Channel: FakeChannel, now: () => now, onSnapshot: (s) => got.push(s) });
  const hive = H.ohHive({ seed: 1, ...PANEL });
  const timers = [];
  const pub = L.h5LivePublisher({ hive, Channel: FakeChannel, setTimer: (fn) => { timers.push(fn); return timers.length; }, clearTimer: () => { timers.length = 0; } });
  ok(pub.enabled() === false, "the link starts off");
  hive.run(20); await Promise.resolve();
  ok(got.length === 0 && pub.posts() === 0 && reader.snapshot() === null, "off: nothing reaches the console");
  ok(pub.set(true) === true, "the learner turns it on");
  let busy = 0;
  for (let k = 0; k < 40; k += 1) { if (hive.step().length) busy += 1; await Promise.resolve(); }
  const snap = reader.snapshot();
  ok(snap && snap.t === hive.now() && pub.posts() === busy + 1, `on: one snapshot on turning on, then one per step with events (${pub.posts()} posts: 1 + ${busy} steps with events of 40)`);
  const caps = hive.events().filter((e) => e.type === "speak").map((e) => e.caption);
  ok(snap.lines.length > 0 && snap.lines.every((l) => caps.includes(l.caption)), `every live line is one of the hive's own captions (${snap.lines.length})`);
  const refs = hive.events().filter((e) => e.type === "refused");
  ok(snap.refusals.length === Math.min(40, refs.length) && snap.metrics.physicalDispatched === 0, `the refusals (${snap.refusals.length}) and the counts (physical dispatches ${snap.metrics.physicalDispatched})`);
  const keys = Object.keys(snap).sort().join(","), lineKeys = [...new Set(snap.lines.flatMap((l) => Object.keys(l)))].sort().join(",");
  ok(keys === "at,jobs,lines,metrics,pending,refusals,schema,t" && lineKeys === "agent,caption,memory,t,x", `the snapshot carries the panel's lines, jobs, requests, refusals and counts only, no learner identity (${keys}; a line: ${lineKeys})`);
  now += L.H5_LIVE_STALE_MS + 1;
  ok(reader.snapshot() === null && !reader.live(), "a silent page goes stale: the tab falls back to the replay");
  hive.step(); await Promise.resolve();
  ok(reader.live(), "live again on the next step");
  pub.set(false);
  ok(reader.snapshot() === null && pub.enabled() === false, "off: the console drops what it holds");
  hive.run(5); await Promise.resolve();
  ok(reader.snapshot() === null, "off: nothing more reaches the console");
  const tab = read("WebXR/instructor/js/h4-hive.js"), live = read("WebXR/shared/h5-hive-live.js").replace(/^\s*(\/\/|\*).*$/gm, "");
  ok(/h5LiveReader\(/.test(tab) && !/postMessage|localStorage|sessionStorage|indexedDB/.test(tab), "the tab reads through h5LiveReader and posts or stores nothing");
  ok(/onmessage/.test(live) && !/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|localStorage|sessionStorage|indexedDB|document\.cookie|getUserMedia/.test(live), "the link makes no request and writes no storage");
  const reader2 = L.h5LiveReader({ Channel: FakeChannel });
  ok(!/postMessage/.test(L.h5LiveReader.toString()), "the reader never posts");
  reader2.close(); reader.close();
  evals.push(`console tab live lines (seed 1, 40 steps with the link on): ${snap.lines.length} lines, ${snap.refusals.length} refusals, one snapshot per step; 0 network requests, 0 storage writes; off by default and on "off" the tab drops them`);
  return `${pub.posts()} snapshots, ${snap.lines.length} lines (all the hive's own captions), stale after ${L.H5_LIVE_STALE_MS} ms, dropped on off`;
});

// ------------------------------------------------------------------------------------------------ 4. home after a job, outdoors too
await check("4 home after a job, outdoors too: every agent whose last job ends away from home walks home; the governor unchanged", () => {
  const base = H.ohHiveDay(1, { exchanges: true, memory: true, variety: true });
  ok(!base.events.some((e) => e.type === "move" && e.home) && !base.events.some((e) => e.about === "home"), "homeward off (the default and round 4's panel): no home move");
  const hive = H.ohHive({ seed: 1, ...PANEL });
  const homeOf = new Map(hive.agents.map((a) => [a.id, a.homeSite]));
  // expected: right after each completion or decline that leaves the agent holding nothing, away from home
  let expected = 0, met = 0, lines = 0, grounded = 0;
  const pts = new Map(RB.RB_SITES.map((s, i) => [s.id, { x: i * 40, y: 0, z: 0 }]));
  const root = new THREE.Group();
  const outdoors = AA.aaMountAgentAvatars({ three: THREE, parent: root, agents: hive.agents, source: hive, siteAt: (id) => pts.get(id) ?? null, tier: "high", reducedMotion: true });
  let owed = null; // the agent a completion left away from home holding nothing: its home move must come before the next completion
  hive.on("*", (e) => {
    if (e.type === "complete") { ok(owed === null, `${owed}: no home move after its last job`); const s = hive.agentState(e.agent); if (s.load === 0 && s.site !== homeOf.get(e.agent)) { expected += 1; owed = e.agent; } }
    if (e.type === "move" && e.home) { met += 1; ok(e.to === homeOf.get(e.agent) && !e.jobId && e.agent === owed, `${e.agent}: home move to its home site, right after its last job`); owed = null; }
    if (e.type === "speak" && e.about === "home") { lines += 1; if (S.ohGrounded(e.text, e, { siteNames: SITE_NAMES }).ok && e.text.includes(e.siteName)) grounded += 1; }
  });
  for (let k = 0; k < 480; k += 1) { hive.step(); ok(owed === null, `${owed}: no home move after its last job`); }
  const m = hive.metrics();
  ok(m.homeMoves === met && met === expected && expected > 0, `home moves ${met} of ${expected} completions that left the agent away from home holding nothing`);
  ok(lines === met && grounded === lines, `each home move has its own line: ${lines}, grounded ${grounded} of ${lines}`);
  // the outdoor figures follow: every agent's figure stands where the hive says it is
  const atHive = hive.agents.filter((a) => outdoors.state(a.id)?.site === hive.agentState(a.id).site).length;
  ok(atHive === hive.agents.length, `the outdoor figures stand where the hive says: ${atHive} of ${hive.agents.length}`);
  const idle = hive.agents.filter((a) => hive.agentState(a.id).load === 0), home = idle.filter((a) => hive.agentState(a.id).site === a.homeSite && outdoors.state(a.id)?.site === a.homeSite);
  ok(home.length === idle.length, `agents holding no job at the day's end stand at home outdoors: ${home.length} of ${idle.length}`);
  ok(m.dispatchedChecked === m.dispatched && m.stepsMonitored === m.steps && m.physicalDispatched === 0, `governor: ${m.dispatchedChecked} of ${m.dispatched} dispatched jobs checked, ${m.stepsMonitored} of ${m.steps} steps monitored, ${m.physicalDispatched} physical`);
  const vetoGrants = hive.events().filter((e) => e.type === "refused" && e.by === "steward").filter((e) => hive.jobs().find((j) => j.jobId === e.jobId)?.status === "completed").length;
  ok(vetoGrants === 0, "a veto never lets a job run");
  outdoors.dispose();
  evals.push(`outdoor go-home (seed 1, 480 steps, the panel's hive): ${met} of ${expected} home moves (one after every completion that left the agent away from home holding nothing), ${grounded} of ${lines} home lines grounded; the outdoor figures at the hive's site ${atHive} of 7; idle agents home at the day's end ${home.length} of ${idle.length}; governor ${m.dispatchedChecked} of ${m.dispatched} checked, ${m.stepsMonitored} of ${m.steps} steps, physical ${m.physicalDispatched}; completed ${m.completed} (homeward off: ${base.metrics.completed})`);
  return `${met} home moves, ${grounded}/${lines} lines grounded, ${atHive}/7 outdoor figures where the hive says, governor ${m.dispatchedChecked}/${m.dispatched}, physical 0`;
});

// ------------------------------------------------------------------------------------------------ 5. wiring and hygiene
await check("5 wiring and hygiene: bundles, app, hwSyncRoom, prefix, no alias, no network or model call, check_all and baseline", () => {
  const py = read("tools/bundle_webxr.py"), app = read("WebXR/parishes/js/app.js"), hw = read("WebXR/shared/hw-hive-world.js"), panel = read("WebXR/shared/oh-panel.js");
  // Integration guard (loop 10 round 5): AVATARS-HD-2's room-level HD figure fits the robot rooms, not the ops room (seven of them
  // measured 46 meshes / 8,508 triangles against IX_BUDGET's 6,000), so the app must not hand that mount to the ops room.
  ok(/mount: h5IsOpsRoom\(ixWorld\.room\) \? undefined : aaRoomMount/.test(app), "the app hands the ops room the default (lightened) figure, not the room-level HD mount");
  const par = py.slice(py.indexOf('"parishes": {')), i0 = py.indexOf('"instructor": {'), ins = py.slice(i0, py.indexOf('"instructor/js/app.js"', i0) + 30);
  const at = (s, f) => s.indexOf(`SHARED / "${f}"`);
  ok(at(par, "h5-ops-room.js") > at(par, "hd4-rooms.js") && at(par, "h5-ops-room.js") > at(par, "aa-agent-avatars.js") && at(par, "h5-ops-room.js") > at(par, "h3-hive-day.js") && at(par, "h5-ops-room.js") < at(par, "hw-hive-world.js") && at(par, "h5-hive-live.js") > 0 && at(par, "h5-hive-live.js") < par.indexOf('"parishes/js/app.js"'), "the parishes bundle lists h5-ops-room.js (after hd4-rooms, before hw-hive-world) and h5-hive-live.js");
  ok(at(ins, "h5-hive-live.js") > 0 && at(ins, "h5-hive-live.js") < ins.indexOf('"instructor/js/h4-hive.js"'), "the instructor bundle lists h5-hive-live.js before the tab");
  ok(/if \(h5IsOpsRoom\(room\) && agents\?\.length\) return h5MountOpsRoom\(/.test(hw), "hwSyncRoom hands the ops room to h5MountOpsRoom");
  ok(/homeward: true/.test(panel), "the panel's hive walks agents home (homeward: true)");
  ok(/^import \{ h5LivePublisher, h5MountLiveToggle \} from "\.\.\/\.\.\/shared\/h5-hive-live\.js";$/m.test(app) && /const p = window\.__parishTest\.hive; if \(!p\?\.hive\) return null; const pub = h5LivePublisher\(\{ hive: p\.hive \}\); h5MountLiveToggle\(p, pub\); addEventListener\("pagehide", \(\) => pub\.set\(false\)\)/.test(app), "the app: the link only where the hive panel is mounted, off when the page goes");
  ok(/@media \(pointer:coarse\),\(max-width:600px\)\{\.oh-panel button\{min-height:44px;min-width:44px\}\}/.test(panel) && /panel\?\.el\?\.querySelector\?\.\("\.oh-row"\)/.test(read("WebXR/shared/h5-hive-live.js")), "the link's button sits in the panel's row (the panel's 44 px rule on a phone)");
  const model = new RegExp(["cla", "ude-[a-z]+-\\d|gpt-\\d|gem", "ini-\\d"].join(""), "i");
  for (const f of ["WebXR/shared/h5-ops-room.js", "WebXR/shared/h5-hive-live.js"]) {
    const src = read(f), code = src.replace(/^\s*(\/\/|\*).*$/gm, "");
    const tops = [...src.matchAll(/^(?:export\s+)?(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    ok(tops.length && tops.every((n) => /^(h5|H5_)/.test(n)), `${f}: a top-level name without the h5 prefix (${tops.filter((n) => !/^(h5|H5_)/.test(n)).join(", ")})`);
    ok(!/import \{[^}]*\bas\b[^}]*\}/.test(src), `${f}: an import alias`);
    ok(!model.test(src), `${f}: a model identifier`);
    ok(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|getUserMedia|SpeechRecognition|speechSynthesis/.test(code), `${f}: a network, voice or listening call`);
  }
  ok(!/fillText/.test(read("WebXR/shared/hd4-rooms.js")), "hd4-rooms.js still draws no words (the words are h5's, on the screens only)");
  ok(read("tools/check_all.mjs").includes('"check_hive5.mjs"'), "check_all.mjs lists check_hive5.mjs");
  const base = JSON.parse(read("docs/perf/checkers-baseline.json"));
  ok(Object.values(base).some((v) => typeof v === "object" && Number.isFinite(v?.["check_hive5.mjs"])) && /ESTIMATE/.test(base.notes?.["check_hive5.mjs"] ?? ""), "docs/perf/checkers-baseline.json: an estimated row for check_hive5.mjs");
  for (const f of ["docs/consoles/HIVE-5.md", "docs/consoles/memory/HIVE-5.md", "tools/briefs/next/h5-next.md"]) ok(existsSync(join(ROOT, f)), `missing ${f}`);
  return "bundles, app, hwSyncRoom, panel, prefix, hygiene, check_all, baseline, docs";
});

console.log(`\n${passed} passed, ${failed} failed`);
for (const e of evals) console.log(`EVAL ${e}`);
process.exitCode = failed ? 1 : 0;
