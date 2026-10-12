#!/usr/bin/env node
/**
 * AGENT-AVATARS checker (docs/consoles/AGENT-AVATARS.md, docs/consoles/HIVE-IN-WORLD.md): the Omega Hive's software
 * agents and the four VBRIDGE personas embodied, tested against the REAL hive (OMEGA-HIVE's ohHive, seed 1, its seven
 * OH_AGENTS, run for at least 50 steps and until it has made at least 30 moves) and against the real VBRIDGE job
 * lifecycle (vb-bridge.js + vb-governor.js). The avatar modules still import nothing of OMEGA-HIVE's: the checker does.
 *
 *     node tools/check_agent_avatars.mjs
 *
 * Proves, headlessly (three.js stub, DOM stub):
 *   - every figure is ctAvatarFigure plus the agent marker and outfit set, inside AA_AGENT_BUDGET meshes + sprites
 *     (crew.js CT_AVATAR_BUDGET, GRIOT's ceiling), labelled "software agent · <role>", hologram-tinted (no skin);
 *   - each stands at its home site on a free standing spot outside the robot's warning zone and pad;
 *   - over the real hive's run: the talk light is on exactly during each speak event's window (sampled at 20 Hz), N of
 *     N; a caption bubble carries every speak event's caption (the hive's, naming the agent as a software agent), N of N;
 *     every move ends with the figure standing at its named site, N of N; every refusal raises the stop gesture and
 *     every completion nods;
 *   - move walks with per-frame writes only within GRIOT's animate radius, hides beyond its hide radius, and jumps
 *     under reduced motion or across the map; refused raises the calm stop gesture, complete nods;
 *   - the phone tier builds no figures (its budgets do not move); each robot site's own mesh count is unchanged;
 *   - the VBRIDGE personas mirror the registry, and a real job run through the panel's state turns into events that
 *     put the provider at the job's site; a governor refusal and an evaluation are embodied;
 *   - portraits: procedural SVG with no face, distinct per agent, rasterised at size × dpr and cached;
 *   - the atlas stays inside AV_ATLAS_BUDGET_BYTES; the app, the instructor console and the bundler are wired.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { ROOT, WEBXR, THREE_STUB, installDomStubs } from "./lib/headless.mjs";

let failures = 0, passes = 0;
const ok = (cond, what, detail = "") => { if (cond) { passes += 1; console.log(`  ✓ ${what}${detail ? ` — ${detail}` : ""}`); } else { failures += 1; console.log(`  ✗ ${what}${detail ? ` — ${detail}` : ""}`); } return !!cond; };
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

installDomStubs();
const dir = mkdtempSync(join(tmpdir(), "aa-check-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ } });
writeFileSync(join(dir, "three-stub.mjs"), THREE_STUB);
const stub = await import(pathToFileURL(join(dir, "three-stub.mjs")).href);
class Sprite extends stub.Mesh { constructor(m) { super(null, m); this.isMesh = false; this.isSprite = true; } }
class SpriteMaterial extends stub.MeshBasicMaterial {}
const THREE = { ...stub, Sprite, SpriteMaterial };

const AA = await imp("WebXR/shared/aa-agent-avatars.js");
const AP = await imp("WebXR/shared/aa-agent-portraits.js");
const crew = await imp("WebXR/shared/crew.js");
const npc = await imp("WebXR/shared/npc.js");
const rbData = await imp("WebXR/shared/rb-robotics-data.js");
const reg = await imp("WebXR/shared/av-characters.js");
const sprites = await imp("WebXR/shared/av-sprites.js");
const OHD = await imp("WebXR/shared/oh-hive-data.js");
const OHH = await imp("WebXR/shared/oh-hive.js");
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const fmtMiB = (b) => `${(b / 1048576).toFixed(2)} MiB`;

console.log("Agent avatars — the real hive (ohHive seed 1, 7 agents), VBRIDGE personas\n");

// ---------------------------------------------------------------- a map holding every robot site, and the REAL hive (OMEGA-HIVE)
const SITE_XY = Object.fromEntries(rbData.RB_SITES.map((s, i) => [s.id, { x: i * 60, y: 0.5, z: (i % 2) * 40 }])); // 60 m apart: walkable
const siteAt = (id) => SITE_XY[id] ?? null;
const OHA = OHD.OH_AGENTS;
const AG = Object.fromEntries(OHA.map((a) => [a.key, a])); // the hive's agents by role key (dispatcher, logistics, …)
/** The real hive's run: seed 1, at least HIVE_MIN_STEPS steps and until it has made HIVE_MIN_MOVES moves (cap HIVE_MAX_STEPS). */
const HIVE_SEED = 1, HIVE_MIN_STEPS = 50, HIVE_MIN_MOVES = 30, HIVE_MAX_STEPS = 400;

// ---------------------------------------------------------------- 1. contract and statics
{
  const files = ["WebXR/shared/aa-agent-avatars.js", "WebXR/shared/aa-agent-portraits.js"];
  for (const f of files) {
    const src = read(f);
    const names = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class|async\s+function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
    const badNames = names.filter((n) => !/^(aa|AA_)/.test(n));
    ok(!badNames.length, `${f}: every top-level name carries the aa/AA_ prefix (${names.length})`, badNames.join(", "));
    ok(!/import \{[^}]*\bas\b[^}]*\}/.test(src), `${f}: no import aliases`);
    ok(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|getUserMedia|speechSynthesis|SpeechRecognition|\bTHREE\./.test(src), `${f}: no network, no voice, no microphone, three.js only from the caller`);
    ok(!/\.(png|jpe?g|webp|gif|glb|gltf)["')]/i.test(src) && !/oh-hive/.test(src.replace(/\/\/.*$/gm, "")), `${f}: no image or model files, no import of OMEGA-HIVE's modules`);
  }
  ok(typeof AA.aaMountAgentAvatars === "function" && AA.aaMountAgentAvatars.length <= 1, "aaMountAgentAvatars({ three, parent, agents, source, siteAt, reducedMotion }) is exported (the contract's seam)");
  ok(AA.AA_ANIMATE_RADIUS === npc.GR_ANIMATE_RADIUS && AA.AA_HIDE_RADIUS === npc.GR_HIDE_RADIUS, `GRIOT's radii: animate ${AA.AA_ANIMATE_RADIUS} m, hide ${AA.AA_HIDE_RADIUS} m (npc.js)`);
  ok(AA.AA_AGENT_BUDGET === crew.CT_AVATAR_BUDGET && AA.AA_AGENT_BUDGET <= 12, `agent budget ${AA.AA_AGENT_BUDGET} meshes + sprites per figure = crew.js CT_AVATAR_BUDGET (GRIOT's figures)`);
  ok(JSON.stringify(AA.AA_EVENT_TYPES) === JSON.stringify(["speak", "move", "bid", "award", "dispatch", "refused", "approval-request", "complete"]), "listens for the contract's eight event types");
  const minSlot = Math.min(...AA.AA_SLOTS.map(([x, z]) => Math.hypot(x, z)));
  const inPad = AA.AA_SLOTS.filter(([x, z]) => Math.abs(x) <= 8 && Math.abs(z) <= 6).length, south = AA.AA_SLOTS.filter(([x, z]) => z > 0 && Math.abs(x) < 8).length;
  ok(minSlot > rbData.RB_SSM.warn + 3 && !inPad && !south, `${AA.AA_SLOTS.length} standing spots, nearest ${minSlot.toFixed(1)} m out (warning zone ${rbData.RB_SSM.warn} m), none on the pad, none in the south corridor`);
}

// ---------------------------------------------------------------- 2. the real hive's seven agents embodied
const hive = OHH.ohHive({ seed: HIVE_SEED });
const parent = new THREE.Group();
const world = AA.aaMountAgentAvatars({ three: THREE, parent, agents: OHA, source: hive, siteAt, reducedMotion: false });
{
  const c = world.counts();
  ok(OHA.length === 7 && c.figures === 7 && parent.children.length === 1, `the hive's ${OHA.length} agents (OH_AGENTS) embodied on one root`, `${c.meshes} meshes + ${c.sprites} sprites`);
  ok(c.worstPerFigure <= AA.AA_AGENT_BUDGET, `meshes + sprites per figure ≤ ${AA.AA_AGENT_BUDGET}`, `worst ${c.worstPerFigure}`);
  let labelled = 0, holo = 0, marker = 0, outfit = 0;
  for (const a of OHA) {
    const g = world.figure(a.id), parts = g.userData.parts;
    const label = g.children.find((o) => o.name === "aa-label");
    if (label?.userData.text === `software agent · ${AP.aaRoleLabel(a)}` && /^software agent · /.test(label.userData.text)) labelled += 1;
    if (["legs", "torso", "head"].every((k) => parts[k]?.material?.transparent && parts[k].material.emissive)) holo += 1;
    if (parts.visor && parts.halo) marker += 1;
    if (parts.vest && parts.badge && parts.tablet) outfit += 1;
  }
  ok(labelled === 7, `every figure floats a "software agent · <role>" label`, `${labelled}/7 (e.g. "${world.state(OHA[0].id).label}")`);
  ok(holo === 7 && marker === 7 && outfit === 7, "visibly not a person: hologram body (no skin tone), visor and halo, vest with a glyph badge and a tablet", `${holo}/${marker}/${outfit} of 7`);
  let home = 0; const spots = new Set();
  for (const a of OHA) {
    const s = world.state(a.id), c0 = SITE_XY[a.homeSite], d = Math.hypot(s.x - c0.x, s.z - c0.z);
    if (s.site === a.homeSite && d > rbData.RB_SSM.warn + 3 && d < 17 && s.visible) home += 1;
    spots.add(`${s.site}#${s.slot}`);
  }
  ok(home === 7 && spots.size === 7, "each stands at its home site, outside the warning zone, on its own spot (the steward and the auditor share the SoMa cell)", `${home}/7, ${spots.size} distinct spots`);
}

// ---------------------------------------------------------------- 2b. every label fits its canvas: "software agent" is never cut off
{
  // A 2D context that records fillText and measures 0.62 em a character (wider than system-ui's average), so a label that
  // fits here fits on the page; the drive measures the real font too.
  let font = ""; const calls = [];
  const em = () => parseFloat(/(\d+(?:\.\d+)?)px/.exec(font)?.[1] ?? "10");
  const ctx = new Proxy({}, {
    get: (_t, k) => (k === "measureText" ? (s) => ({ width: String(s).length * 0.62 * em() }) : k === "fillText" ? (s, x, y, mw) => calls.push({ s: String(s), x, y, mw, px: em() }) : k === "font" ? font : () => {}),
    set: (_t, k, v) => { if (k === "font") font = String(v); return true; },
  });
  const saved = globalThis.document;
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
  const all = [...OHA, ...AA.aaVbridgeAgents("rb-site-soma-robot-cell")];
  const wl = AA.aaMountAgentAvatars({ three: THREE, parent: new THREE.Group(), agents: all, siteAt });
  let fit = 0, smallest = Infinity, smallestText = ""; const bad = [];
  for (const a of all) {
    const f = wl.figure(a.id)?.children.find((o) => o.name === "aa-label")?.userData.fit, want = `software agent · ${AP.aaRoleLabel(a)}`;
    const drawn = calls.find((c) => c.s === want);
    const good = f && f.role.text === want && f.role.fits && f.role.px >= AA.AA_LABEL_TEXT.minPx && f.name.fits && drawn && drawn.mw <= AA.AA_LABEL_TEXT.maxWidth && drawn.x === AA.AA_LABEL_PX[0] / 2;
    if (good) { fit += 1; if (f.role.px < smallest) { smallest = f.role.px; smallestText = want; } } else bad.push(`${a.id}: ${want} ${f ? `${f.role.px} px, ${Math.round(f.role.width)} px wide` : "no fit"}`);
  }
  globalThis.document = saved;
  ok(all.length === 11 && fit === all.length, `every one of the ${all.length} agents' labels fits its ${AA.AA_LABEL_PX[0]} px canvas: "software agent · <role>" drawn whole, centred, within ${AA.AA_LABEL_TEXT.maxWidth} px at ≥ ${AA.AA_LABEL_TEXT.minPx} px (measured at 0.62 em a character), with fillText's maxWidth holding the rest: ${fit} of ${all.length}`, bad.slice(0, 3).join("; ") || `smallest ${smallest} px ("${smallestText}")`);
  wl.dispose();
}

// ---------------------------------------------------------------- 3. the real hive's run, played in time: talk light, captions and moves exact
{
  const dt = 0.05; let t = 0;
  const ids = OHA.map((a) => a.id);
  const times = []; const litAt = new Map(ids.map((id) => [id, []])), capAt = new Map(ids.map((id) => [id, []]));
  // Every frame is sampled after the frame's own animate: an event handled between frames at clock t is first seen at t + dt.
  const frame = () => { t += dt; world.animate(t, dt, null); times.push(t); for (const id of ids) { const s = world.state(id); litAt.get(id).push(s.talkVisible ? 1 : 0); capAt.get(id).push(s.captionVisible ? s.caption : null); } };
  // A step's events are heard between frames at the last frame's clock t, so a line can start exactly at t: the frame at t is
  // re-sampled after the step (the state after everything at t has happened), as the fixture loop before it did.
  const resample = () => { const i = times.length - 1; if (i < 0) return; for (const id of ids) { const s = world.state(id); litAt.get(id)[i] = s.talkVisible ? 1 : 0; capAt.get(id)[i] = s.captionVisible ? s.caption : null; } };
  const busy = () => ids.some((id) => { const s = world.state(id); return s.walking || s.queued > 0 || s.speaking; });
  const speaks = [], moves = [], refusals = [], completes = [];
  let steps = 0, movedAtOnce = 0, ended = 0, superseded = 0; const missed = [];
  hive.on("move", (e) => { if (world.state(e.agent)?.site === e.to) movedAtOnce += 1; }); // heard after the avatars' own listener
  world.animate(0, 0, null);
  while (steps < HIVE_MAX_STEPS && (steps < HIVE_MIN_STEPS || moves.length < HIVE_MIN_MOVES)) {
    const evs = hive.step(); steps += 1; resample();
    for (const e of evs) { if (e.type === "speak") speaks.push(e); else if (e.type === "refused") refusals.push(e); else if (e.type === "complete") completes.push(e); }
    const stepMoves = evs.filter((e) => e.type === "move");
    let guard = 0; do { frame(); guard += 1; } while (guard < 6000 && busy()); // let every walk and line of this step finish
    for (let i = 0; i < 4; i++) frame();
    const last = new Map(stepMoves.map((e) => [e.agent, e]));
    for (const e of stepMoves) {
      moves.push(e);
      if (last.get(e.agent) !== e) { superseded += 1; continue; } // a later move of the same agent in the same step replaced it
      const s = world.state(e.agent), c0 = SITE_XY[e.to], d = Math.hypot(s.x - c0.x, s.z - c0.z);
      if (s.site === e.to && !s.walking && s.visible && d > rbData.RB_SSM.warn + 3 && d < 17) ended += 1; else missed.push(`${e.agent}→${e.to} at ${d.toFixed(1)} m`);
    }
  }
  const log = world.talkLog(), caps = world.captionLog();
  ok(steps >= HIVE_MIN_STEPS && moves.length >= HIVE_MIN_MOVES, `the real hive (seed ${HIVE_SEED}) ran ${steps} steps: ${speaks.length} speak, ${moves.length} move, ${refusals.length} refused, ${completes.length} complete events`, `${times.length} frames at 20 Hz`);
  ok(log.length === speaks.length, `every speak event became a line: ${log.length}/${speaks.length}`);
  // Exactness, per agent, one sweep over its windows: every frame inside a window is lit, no frame between windows is lit,
  // and each window lasts exactly aaLineMs(line). The k-th window of an agent is its k-th speak event (lines queue in order).
  let exact = 0, bubbles = 0, strayLit = 0, n = 0;
  for (const id of ids) {
    const wins = log.filter((w) => w.agent === id), mine = speaks.filter((e) => e.agent === id), capWins = caps.filter((c) => c.agent === id && c.kind === "speak");
    const lit = litAt.get(id), cap = capAt.get(id);
    const inN = new Array(wins.length).fill(0), inLit = new Array(wins.length).fill(0), gapLit = new Array(wins.length).fill(0), seen = new Array(wins.length).fill(false);
    let k = 0;
    for (let i = 0; i < times.length; i++) {
      const x = times[i];
      while (k < wins.length && wins[k].end <= x) k += 1;
      if (k < wins.length && wins[k].start <= x) { inN[k] += 1; if (lit[i]) inLit[k] += 1; if (cap[i] === capWins[k]?.text) seen[k] = true; }
      else if (lit[i]) { if (k > 0) gapLit[k - 1] += 1; else strayLit += 1; }
    }
    wins.forEach((w, j) => {
      n += 1;
      if (inN[j] > 0 && inLit[j] === inN[j] && gapLit[j] === 0 && Math.abs((w.end - w.start) * 1000 - AA.aaLineMs(w.text)) < 1 && w.text === mine[j]?.text) exact += 1;
      const c = capWins[j];
      if (c && mine[j] && c.text === mine[j].caption && /\(software agent\): /.test(c.text) && c.start === w.start && c.end === w.end && seen[j]) bubbles += 1;
    });
  }
  ok(exact === speaks.length && n === speaks.length && speaks.length >= 30 && strayLit === 0, `the talk light is on exactly during each speak event's window (sampled at 20 Hz): ${exact} of ${speaks.length}`);
  const overlapSelf = ids.some((id) => { const w = log.filter((x) => x.agent === id); return w.some((a, i) => i > 0 && a.start < w[i - 1].end - 1e-9); });
  ok(!overlapSelf, "an agent never talks over itself (its lines queue end to start)");
  ok(bubbles === speaks.length, `a caption bubble shows each speak event's caption above its figure (the hive's caption, naming the agent as a software agent): ${bubbles} of ${speaks.length}`);
  ok(ids.every((id) => { const s = world.state(id); return !s.talkVisible && !s.speaking && s.queued === 0; }), "the lights are off and the queues empty when the lines are done");
  ok(movedAtOnce === moves.length, `every move retargets the figure to the named site at once: ${movedAtOnce} of ${moves.length}`);
  ok(ended === moves.length - superseded && superseded === 0 && moves.length >= HIVE_MIN_MOVES, `every move ends with the figure standing on a free spot at its named site: ${ended} of ${moves.length}`, missed.slice(0, 3).join("; ") || `${superseded} superseded within a step`);
  const g = world.gestureLog();
  const stops = refusals.filter((e) => g.some((x) => x.agent === e.agent && x.kind === "stop" && x.reason === (e.reason ?? null))).length;
  ok(stops === refusals.length && g.filter((x) => x.kind === "stop").length === refusals.length && g.filter((x) => x.kind === "nod").length === completes.length, `every refusal raises the calm stop gesture (${stops} of ${refusals.length}) and every completion nods (${g.filter((x) => x.kind === "nod").length} of ${completes.length})`);
}

// ---------------------------------------------------------------- 4. walking, radii, gestures, reduced motion, off-map, tiers
{
  const p2 = new THREE.Group();
  const src = AA.aaEmitter();
  const w2 = AA.aaMountAgentAvatars({ three: THREE, parent: p2, agents: [AG.logistics], source: src, siteAt, reducedMotion: false });
  let t = 0; w2.animate(t, 0, null);
  const a0 = w2.state(AG.logistics.id);
  src.emit({ type: "move", agent: AG.logistics.id, to: "rb-site-west-oakland-warehouse" });
  t += 5; w2.animate(t, 5, null);
  const mid = w2.state(AG.logistics.id), g = w2.figure(AG.logistics.id);
  ok(mid.walking && mid.x !== a0.x && g.position.x === mid.x, `move walks: after 5 s at ${AA.AA_WALK_SPEED} m/s the figure is mid-way and its position is written`, `x ${a0.x.toFixed(1)} → ${mid.x.toFixed(1)}`);
  const frozen = g.position.x;
  t += 2; w2.animate(t, 2, [mid.x + AA.AA_ANIMATE_RADIUS + 50, mid.z]);
  ok(g.position.x === frozen && w2.state(AG.logistics.id).x !== frozen && g.visible, `beyond ${AA.AA_ANIMATE_RADIUS} m: no per-frame writes (the walk advances logically), still shown`);
  t += 1; w2.animate(t, 1, [mid.x + AA.AA_HIDE_RADIUS + 50, mid.z]);
  ok(!g.visible, `beyond ${AA.AA_HIDE_RADIUS} m: hidden`);
  t += 60; w2.animate(t, 60, null);
  ok(!w2.state(AG.logistics.id).walking && g.visible, "arrives and shows again within range");
  // gestures
  src.emit({ type: "refused", agent: AG.logistics.id, reason: "speed over the site limit" });
  const ty0 = g.userData.parts.tablet.position.y; t += 0.1; w2.animate(t, 0.1, null);
  ok(w2.state(AG.logistics.id).gesture === "stop" && g.userData.parts.tablet.position.y > ty0 - 0.01 && g.userData.parts.tablet.rotation.x === 0, "refused: a calm stop gesture (the tablet raised, palm-out)");
  t += 2; w2.animate(t, 2, null);
  ok(w2.state(AG.logistics.id).gesture === null && g.userData.parts.tablet.rotation.x !== 0, "the stop gesture ends after its time");
  src.emit({ type: "complete", agent: AG.logistics.id }); t += 0.45; w2.animate(t, 0.45, null);
  ok(w2.state(AG.logistics.id).gesture === "nod" && Math.abs(g.userData.parts.head.rotation.x) > 0.2, "complete: a nod (the head dips)", `pitch ${g.userData.parts.head.rotation.x.toFixed(2)}`);
  t += 1; w2.animate(t, 1, null); ok(g.userData.parts.head.rotation.x === 0, "and comes back up");
  // a long move re-projects short of the site and walks the last stretch in (it does not walk a kilometre through buildings)
  src.emit({ type: "move", agent: AG.logistics.id, to: "rb-site-soma-robot-cell" });
  const far = w2.state(AG.logistics.id), soma = SITE_XY["rb-site-soma-robot-cell"];
  const gap = Math.hypot(far.x - soma.x, far.z - soma.z);
  t += 3; w2.animate(t, 3, null); const mid2 = w2.state(AG.logistics.id);
  t += 30; w2.animate(t, 30, null); const in2 = w2.state(AG.logistics.id);
  ok(far.walking && far.site === "rb-site-soma-robot-cell" && gap < AA.AA_WALK_IN + 17 && mid2.walking && !in2.walking && Math.hypot(in2.x - soma.x, in2.z - soma.z) < 17, `a move longer than ${AA.AA_WALK_MAX} m re-projects ${AA.AA_WALK_IN} m short of the spot and walks in`, `${gap.toFixed(1)} m from the site centre at the start, walking after 3 s, standing after 33 s`);
  ok(w2.gestureLog().filter((g) => g.agent === AG.logistics.id).map((g) => g.kind).join(",") === "stop,nod", "the gesture log records the stop and the nod");
  // off-map: a site this map does not hold hides the figure; coming back shows it
  src.emit({ type: "move", agent: AG.logistics.id, to: "rb-site-nowhere" }); t += 0.1; w2.animate(t, 0.1, null);
  ok(!g.visible && w2.state(AG.logistics.id).offMap, "a site not on this map hides the figure");
  const p6 = new THREE.Group(), s6 = AA.aaEmitter();
  const w6 = AA.aaMountAgentAvatars({ three: THREE, parent: p6, agents: [{ ...AG.dispatcher, homeSite: "rb-site-elsewhere" }], source: s6, siteAt });
  const lazy0 = w6.counts().figures === 0 && w6.counts().agents === 1 && w6.counts().meshes === 0 && w6.counts().textureBytes === 0;
  s6.emit({ type: "move", agent: AG.dispatcher.id, to: "rb-site-orleans-warehouse" }); w6.animate(0.1, 0.1, null);
  ok(lazy0 && w6.counts().meshes > 0 && w6.figure(AG.dispatcher.id)?.visible, "an agent homed on another map costs nothing here until it arrives, then its figure is built and shown");
  src.emit({ type: "move", agent: AG.logistics.id, to: "rb-site-orleans-warehouse" }); t += 0.1; w2.animate(t, 0.1, null);
  ok(g.visible && !w2.state(AG.logistics.id).walking, "a move back onto this map shows it at once");
  // reduced motion
  const p3 = new THREE.Group(), s3 = AA.aaEmitter();
  const w3 = AA.aaMountAgentAvatars({ three: THREE, parent: p3, agents: [AG.logistics], source: s3, siteAt, reducedMotion: true });
  w3.animate(0, 0, null);
  s3.emit({ type: "move", agent: AG.logistics.id, to: "rb-site-west-oakland-warehouse" });
  const r1 = w3.state(AG.logistics.id), wh = SITE_XY["rb-site-west-oakland-warehouse"];
  s3.emit({ type: "speak", agent: AG.logistics.id, text: "Arrived at the aisle." }); w3.animate(0.2, 0.2, null);
  s3.emit({ type: "complete", agent: AG.logistics.id }); w3.animate(0.5, 0.3, null);
  const r2 = w3.state(AG.logistics.id);
  ok(!r1.walking && Math.hypot(r1.x - wh.x, r1.z - wh.z) < 17, "reduced motion: no walking — the figure jumps to the site");
  ok(r2.captionVisible && r2.caption === "Arrived at the aisle." && r2.talkVisible && w3.figure(AG.logistics.id).userData.parts.head.rotation.x === 0, "reduced motion: the caption and the (still) talk light show; the nod holds still");
  // tiers: the phone tier builds nothing
  const p4 = new THREE.Group();
  const w4 = AA.aaMountAgentAvatars({ three: THREE, parent: p4, agents: OHA, source: AA.aaEmitter(), siteAt, tier: "low" });
  ok(w4.counts().figures === 0 && w4.counts().meshes === 0 && p4.children.length === 0 && w4.agents().length === OHA.length, "phone tier: no figures, 0 meshes, 0 texture bytes (its budgets do not move); the state machine still runs");
  const wb = AA.aaMountAgentAvatars({ three: THREE, parent: new THREE.Group(), agents: OHA, siteAt, tier: "balanced" });
  ok(wb.counts().figures === OHA.length, "balanced and high tiers build the figures");
  ok(world.counts().textureBytes <= OHA.length * AA.AA_TEXTURE_BYTES_PER_FIGURE, `texture bytes ≤ ${AA.AA_TEXTURE_BYTES_PER_FIGURE} per figure (label at mount, caption on first line)`, `${world.counts().textureBytes} B for ${OHA.length} figures`);
  // the voice seam: an on-device voice can hold the light for the real utterance
  const s5 = AA.aaEmitter(), w5 = AA.aaMountAgentAvatars({ three: THREE, parent: new THREE.Group(), agents: [AG.dispatcher], source: s5, siteAt });
  w5.animate(0, 0, null); s5.emit({ type: "speak", agent: AG.dispatcher.id, text: "Short." }); w5.talkStart(AG.dispatcher.id);
  w5.animate(5, 5, null); const held = w5.state(AG.dispatcher.id).talkVisible; w5.talkEnd(AG.dispatcher.id); w5.animate(5.05, 0.05, null);
  ok(held && !w5.state(AG.dispatcher.id).talkVisible, "talkStart/talkEnd: a voice's onstart/onend hold the light for the utterance, then release it");
}

// ---------------------------------------------------------------- 5. seven roles (the hive's roster shape) + 4 VBRIDGE personas, and the site budgets
const ROLES7 = OHA.map((a) => a.key);
{
  const sites = rbData.RB_SITES.map((s) => s.id);
  const seven = OHA; // the hive's own seven (OH_AGENTS), at their own home sites
  const vbHome = sites[0];
  const all = [...seven, ...AA.aaVbridgeAgents(vbHome)];
  const p = new THREE.Group();
  const w = AA.aaMountAgentAvatars({ three: THREE, parent: p, agents: all, siteAt });
  const c = w.counts();
  const perSite = {}; for (const s of w.agents()) perSite[s.site] = (perSite[s.site] ?? 0) + 1;
  ok(c.figures === 11 && c.worstPerFigure <= AA.AA_AGENT_BUDGET, `embodied: ${seven.length} hive agents + ${AA.aaVbridgeAgents().length} VBRIDGE personas = ${c.figures} figures, worst ${c.worstPerFigure} meshes + sprites (≤ ${AA.AA_AGENT_BUDGET})`, `${c.meshes} meshes + ${c.sprites} sprites in all`);
  ok(Math.max(...Object.values(perSite)) <= AA.AA_SLOTS.length && new Set(w.agents().map((s) => `${s.site}#${s.slot}`)).size === 11, `no two agents on one spot (most at one site: ${Math.max(...Object.values(perSite))}, ${AA.AA_SLOTS.length} spots a site)`);
  // each robot site's own count (what check_robotics / check_robotrain report) is untouched: the agents live on their own root
  const { rbMountRobotics, RB_MESHES_PER_SITE } = await imp("WebXR/shared/rb-world.js");
  const { npParish } = await imp("WebXR/shared/np-parishes.js");
  const stubRb = (() => {
    class O { constructor() { this.children = []; this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } }; this.rotation = { x: 0, y: 0, z: 0 }; this.userData = {}; this.name = ""; } add(c) { this.children.push(c); c.parent = this; } }
    const G = class {}; const M = class { constructor(o) { Object.assign(this, o); } };
    return { Group: O, Mesh: class extends O { constructor(g, m) { super(); this.isMesh = true; this.geometry = g; this.material = m; } }, BoxGeometry: G, RingGeometry: G, CylinderGeometry: G, MeshLambertMaterial: M };
  })();
  const rows = [];
  let inside = true;
  for (const id of [...new Set(rbData.RB_SITES.map((s) => s.parish))]) {
    for (const tier of ["balanced", "low"]) {
      const root = new stubRb.Group(); const rw = rbMountRobotics({ three: stubRb, root, parish: npParish(id), tier });
      const per = rw.meshes / rw.sites.length;
      if (per > (tier === "low" ? 3 : RB_MESHES_PER_SITE)) inside = false;
      if (tier === "balanced") rows.push(`${id} ${per}/site`);
    }
  }
  ok(inside, `every robot site's own total stays inside its budget (≤ ${RB_MESHES_PER_SITE} balanced, ≤ 3 phone); agents add 0 to a site group`, rows.join(", "));
}

// ---------------------------------------------------------------- 6. VBRIDGE: the personas, and a real job through the panel's state
{
  const vb = await imp("WebXR/shared/vb-bridge.js");
  const gov = (await imp("WebXR/shared/vb-governor.js")).vbGovernor();
  const panel = await imp("WebXR/shared/vb-panel.js");
  let mirror = 0;
  for (const p of AP.AA_VBRIDGE_PERSONAS) { const e = reg.avCharacter(p.id); if (e && e.kind === "agent" && e.name === p.name && e.role === p.role && e.glyph === p.avatar.glyph && e.accent === p.avatar.accent) mirror += 1; }
  ok(mirror === 4, `the four VBRIDGE personas mirror the registry (client, provider, evaluator, governor): ${mirror}/4`);
  let job = null; const api = { state: () => ({ job }) };
  const src = AA.aaVbridgeSource(api);
  const p = new THREE.Group();
  const home = "rb-site-west-oakland-port-automation";
  const w = AA.aaMountAgentAvatars({ three: THREE, parent: p, agents: AA.aaVbridgeAgents(home), source: src, siteAt });
  let t = 0; const tick = (s = 0.5) => { t += s; w.animate(t, s, null); };
  tick();
  // queue entry 1: a cell-entry job at the SoMa robot cell — negotiate, approve, run, evaluate
  const spec = panel.VB_PANEL_QUEUE[0];
  job = vb.vbCreateJob({ ...spec, request: { ...spec.request, atMs: 45000 } }); vb.vbNegotiate(job, gov); tick();
  const askedLine = w.state("agent-client").caption ?? "";
  ok(/^Job [0-9a-f]{6}: /.test(askedLine) && askedLine.includes(rbData.RB_SITES.find((s) => s.id === spec.request.siteId).name), "the client agent asks for the job, every fact from the job (id, task, site)", askedLine);
  ok(/allowed in the sim/.test(w.state("agent-governor").caption ?? ""), "the governor's check is spoken");
  vb.vbApprove(job, { supervisor: "Supervisor (check)", approve: true }); tick();
  t += 60; w.animate(t, 60, null);
  const prov = w.state("agent-provider"), site = SITE_XY[spec.request.siteId];
  ok(prov.site === spec.request.siteId && Math.hypot(prov.x - site.x, prov.z - site.z) < 17 && prov.visible, "when the panel runs a job, the provider's figure stands at the job's site", `${spec.request.siteId}, spot ${prov.slot}`);
  vb.vbRun(job, gov, {}); vb.vbEvaluate(job); tick(0.1);
  const evs = src.events();
  ok(evs.some((e) => e.type === "complete" && e.agent === "agent-evaluator") && w.state("agent-evaluator").gesture === "nod", `the evaluator nods at the completed job (${job.phase})`);
  // queue entry 4: the physical-target job, refused by the governor
  const spec4 = panel.VB_PANEL_QUEUE[3];
  job = vb.vbCreateJob({ ...spec4, request: { ...spec4.request, atMs: 180000 } }); vb.vbNegotiate(job, gov); tick(0.1);
  const g = w.state("agent-governor");
  ok(job.phase === "REJECTED" && g.gesture === "stop" && /refused/.test(g.caption ?? ""), "a governor refusal is embodied: the governor's stop gesture with its own reason", g.caption ?? "");
  ok(evs.every((e) => AA.AA_EVENT_TYPES.includes(e.type) && AP.AA_VBRIDGE_PERSONAS.some((x) => x.id === e.agent)), `${src.events().length} VBRIDGE events, every one a contract event from a persona`);
}

// ---------------------------------------------------------------- 7. portraits: procedural, faceless, distinct, crisp at 2× and cached
{
  const agents = [...OHA, ...AP.AA_VBRIDGE_PERSONAS];
  let good = 0; const keys = new Set();
  for (const a of agents) {
    for (const kind of ["portrait", "token"]) {
      const svg = AP.aaPortraitSvg(a, { kind, size: 48 });
      const wf = /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]*>[\s\S]*<\/svg>$/.test(svg);
      const open = (svg.match(/<(path|rect|circle|ellipse|g|svg|clipPath|title)\b/g) ?? []).length, close = (svg.match(/\/>|<\/(path|rect|circle|ellipse|g|svg|clipPath|title)>/g) ?? []).length;
      const faceless = !/fill="#f2ece6"|FACE/.test(svg), noRaster = !/<image|base64|href="http/i.test(svg), labelled = /software agent · /.test(svg);
      if (wf && open === close && faceless && noRaster && labelled && svg === AP.aaPortraitSvg(a, { kind, size: 48 })) good += 1;
    }
    keys.add(AP.aaPortraitSvg(a, { kind: "portrait", size: 48 }).replace(/<title>.*<\/title>|aria-label="[^"]*"|id="aac\w+"|url\(#aac\w+\)/g, ""));
  }
  ok(good === agents.length * 2, `${good} portraits and tokens: well-formed procedural SVG, no face, no raster, labelled "software agent", deterministic`);
  ok(keys.size === agents.length, `every agent's portrait is its own (${keys.size} distinct of ${agents.length})`);
  const outfitSvg = AP.aaPortraitSvg(AG.dispatcher, { kind: "portrait" });
  ok(/fill="#d8ff3a"/.test(outfitSvg) && /fill="#dfe8ee"/.test(outfitSvg) && /fill="#1d2a33"/.test(outfitSvg) && /fill="#0b1a24"/.test(outfitSvg), "the agent outfit set: high-visibility vest with bands and a glyph badge, tablet, visor");
  const calls = [];
  const raster = (svg, px) => { calls.push(px); return Promise.resolve(`data:image/png;base64,stub${px}`); };
  const u1 = await AP.aaPortraitPng(AG["safety-steward"], { size: 48, dpr: 2, raster });
  const u2 = await AP.aaPortraitPng(AG["safety-steward"], { size: 48, dpr: 2, raster });
  const u3 = await AP.aaPortraitPng(AG["safety-steward"], { size: 48, dpr: 1, raster });
  ok(calls[0] === 96 && u1 === u2 && calls.length === 2 && u3 !== u1, "portraits rasterise at size × dpr (48 px at 2× → 96 px), cached: the same agent, size and dpr again is no new raster", `rasters ${calls.join(", ")}; cache ${JSON.stringify(AP.aaPortraitCacheStats())}`);
  // the atlas: no registry entry changed, and it stays inside its budget
  const bytes = Buffer.byteLength(read("WebXR/assets/avatars/av-atlas.svg")) + Buffer.byteLength(read("WebXR/assets/avatars/av-atlas.json"));
  ok(bytes <= sprites.AV_ATLAS_BUDGET_BYTES, `atlas ${(bytes / 1024).toFixed(1)} KiB of ${(sprites.AV_ATLAS_BUDGET_BYTES / 1024).toFixed(0)} KiB (hive portraits are drawn at runtime, not packed)`);
}

// ---------------------------------------------------------------- 8. the wiring
{
  const app = read("WebXR/parishes/js/app.js");
  ok(/from "\.\.\/\.\.\/shared\/aa-agent-avatars\.js"/.test(app) && /aaMountAgentAvatars\(\{/.test(app) && /aaVbridgeSource\(window\.__parishTest\.vbridge\)/.test(app) && /aaVbridgeAgents\(/.test(app), "parishes app: mounts the VBRIDGE personas over the agent-jobs panel's job stream");
  ok(/window\.__parishTest\.agentAvatars\s*=/.test(app) && /aaWorld\?\.animate\(/.test(app), "parishes app: animates the agents in the frame loop and exposes window.__parishTest.agentAvatars");
  ok(/window\.__parishTest\.hive/.test(app), "parishes app: attaches the hive when OMEGA-HIVE's window.__parishTest.hive is present (guarded; the coordinator orders the mounts)");
  const gov = read("WebXR/instructor/js/governance.js");
  ok(/aaMountAgentRoster\(/.test(gov) && !/innerHTML/.test(gov), "instructor console: an agent roster with portraits on the governance tab (createElement only)");
  const bundler = read("tools/bundle_webxr.py");
  const block = (name) => { const i = bundler.indexOf(`"${name}": {`); return i < 0 ? "" : bundler.slice(i, bundler.indexOf('"entry"', i)); };
  const par = block("parishes"), ins = block("instructor");
  ok(par.includes('SHARED / "aa-agent-portraits.js"') && par.includes('SHARED / "aa-agent-avatars.js"') && par.indexOf('"aa-agent-portraits.js"') < par.indexOf('"aa-agent-avatars.js"'), "bundle_webxr.py: the parishes bundle lists the portraits before the avatars");
  ok(ins.includes('SHARED / "aa-agent-portraits.js"') && ins.indexOf('"av-sprites.js"') < ins.indexOf('"aa-agent-portraits.js"') && ins.indexOf('"aa-agent-portraits.js"') < ins.indexOf("instructor/js/app.js"), "bundle_webxr.py: the instructor bundle lists av-sprites.js, then the portraits, before the console's app.js (governance.js reads them at render time)");
  const trailing = ["WebXR/parishes/js/app.js", "WebXR/instructor/js/governance.js"].filter((f) => /^import [^\n]*aa-agent-(avatars|portraits)\.js";[ \t]*\S/m.test(read(f)));
  ok(!trailing.length, "the aa import lines end at the semicolon (the flat bundler's import pattern does not strip a line with a trailing comment)", trailing.join(", "));
  ok(read("tools/check_all.mjs").includes("check_agent_avatars.mjs") && /check_agent_avatars/.test(read("docs/perf/checkers-baseline.json")), "check_all.mjs lists this checker; checkers-baseline.json carries its estimated row");
}

// ---------------------------------------------------------------- 9. AVATARS-HD: the high-detail figure on the desktop high tier
const HDV = {};
{
  const HD = await imp("WebXR/shared/aa-agent-hd.js");
  const RT = await imp("WebXR/vendor/three/dist/three.module.min.js"); // the real three.js (skinning, bones, buffer geometry); nothing renders
  const RTS = { ...RT }; // three.js's own classes plus the canvas-free sprite stand-in the checker's DOM stub needs
  console.log(`\n  AVATARS-HD — the high-detail figure (real three.js r${RT.REVISION}, rendered for silhouettes by aa-agent-hd.js's own rasteriser)`);
  // 9a. statics
  const src = read("WebXR/shared/aa-agent-hd.js");
  const names = [...src.matchAll(/^(?:export\s+)?(?:const|let|var|function|class|async\s+function)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]);
  ok(names.length > 10 && names.every((n) => /^(aa|AA_)/.test(n)) && !/^import /m.test(src), `aa-agent-hd.js: every top-level name carries the aa/AA_ prefix (${names.length}), no imports (the instructor bundle draws portraits from it)`);
  ok(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|getUserMedia|speechSynthesis|SpeechRecognition|\bTHREE\./.test(src) && !/\.(png|jpe?g|webp|gif|glb|gltf)["')]/i.test(src), "aa-agent-hd.js: no network, no voice, no microphone, no image or model files; three.js only from the caller");
  ok(HD.AA_HD_BUDGET.meshesAndSprites === crew.CT_AVATAR_BUDGET && Object.entries(HD.AA_HD_BODY_DIMS).every(([id, d]) => { const o = crew.ctAvatarOption("body", id); return o.id === id && o.h === d.h && o.w === d.w; }), `the copied numbers equal crew.js: ceiling ${HD.AA_HD_BUDGET.meshesAndSprites} meshes + sprites, six body types`);
  // 9b. per tier: the seven agents on one site, real three.js; draw calls = visible meshes + visible sprites (one material each)
  const one = Object.fromEntries(OHA.map((a) => [a.homeSite, true]));
  const tierRow = {};
  for (const tier of ["low", "balanced", "high"]) {
    const par = new RT.Group();
    const w = AA.aaMountAgentAvatars({ three: RTS, parent: par, agents: OHA, source: null, siteAt, tier, hd: true });
    w.animate(0, 0, null);
    const c = w.counts();
    const calls = (speaking) => { let n = 0; const figs = OHA.map((a) => w.figure(a.id)).filter(Boolean); for (const g of figs) g.traverse((o) => { let vis = true; for (let p = o; p && p !== par; p = p.parent) if (!p.visible) vis = false; if (!vis && !(speaking && (o.name === "aa-talk" || o.name === "aa-caption"))) return; if (o.isMesh || o.isSprite) n += 1; }); return figs.length ? n / figs.length : 0; };
    tierRow[tier] = { figures: c.figures, hd: c.hd, perFigure: c.figures ? c.triangles / c.figures : 0, worst: c.worstPerFigure, silent: calls(false), speaking: calls(true), tex: c.textureBytes, meshes: c.meshes, sprites: c.sprites };
    let worstTri = 0; for (const a of OHA) { const g = w.figure(a.id); if (!g) continue; let tri = 0; g.traverse((o) => { if (o.isMesh) tri += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; if (o.isSprite) tri += 2; }); worstTri = Math.max(worstTri, tri); }
    tierRow[tier].worstTri = worstTri;
    w.dispose();
  }
  const L = tierRow.low, Bt = tierRow.balanced, Hi = tierRow.high;
  ok(L.figures === 0 && L.meshes === 0 && L.tex === 0, "phone tier (low): no figure, no mesh, no texture — unchanged");
  ok(Bt.figures === 7 && Bt.hd === 0, `balanced keeps today's figure: 7 figures, 0 high-detail, ${Bt.perFigure.toFixed(0)} triangles and ${Bt.silent} draw calls per figure silent (${Bt.speaking} speaking)`);
  ok(Hi.figures === 7 && Hi.hd === 7 && Hi.worst <= HD.AA_HD_BUDGET.meshesAndSprites && Hi.worstTri <= HD.AA_HD_BUDGET.triangles, `high builds the high-detail figure: 7 of 7, worst ${Hi.worst} meshes + sprites (≤ ${HD.AA_HD_BUDGET.meshesAndSprites}), worst ${Hi.worstTri} triangles (≤ ${HD.AA_HD_BUDGET.triangles}), mean ${Hi.perFigure.toFixed(0)}`);
  ok(Hi.silent <= HD.AA_HD_BUDGET.drawCallsSilent && Hi.speaking <= HD.AA_HD_BUDGET.drawCallsSpeaking, `high draw calls per figure: ${Hi.silent} silent (≤ ${HD.AA_HD_BUDGET.drawCallsSilent}), ${Hi.speaking} speaking (≤ ${HD.AA_HD_BUDGET.drawCallsSpeaking}); today's figure: ${Bt.silent} / ${Bt.speaking}`);
  const roomish = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: OHA.slice(0, 2), siteAt, tier: "high" }); // a mount that does not ask (the rooms)
  ok(roomish.counts().hd === 0 && roomish.counts().figures === 2, "a mount that does not ask for hd (the robotics rooms, inside IX_BUDGET) keeps today's figure on high");
  roomish.dispose();
  HDV.tiers = tierRow;
  // 9c. software, never a person: no skin tone where a person's skin would show; the label; the visor band, the eyes, the halo
  const tones = crew.CT_AVATAR_STYLES.skin.map((s) => [((s.hex >> 16) & 255) / 255, ((s.hex >> 8) & 255) / 255, (s.hex & 255) / 255]);
  let minD = Infinity, labelled = 0, glowing = 0;
  for (const a of [...OHA, ...AA.aaVbridgeAgents("rb-site-soma-robot-cell")]) {
    const spec = HD.aaHdSpec(a), geo = HD.aaHdGeometry(spec);
    for (let i = 0; i < geo.body.si.length / 4; i += 1) {
      const bone = Object.keys(HD.AA_HD_BONES)[geo.body.si[4 * i]];
      if (!/^(head|wristL|wristR)$/.test(bone)) continue;
      const c = [geo.body.c[3 * i], geo.body.c[3 * i + 1], geo.body.c[3 * i + 2]];
      if (bone !== "head" && spec.tablet && bone === "wristL" && c[0] < 0.3) continue; // the tablet's dark case is not a hand
      for (const tn of tones) minD = Math.min(minD, Math.hypot(c[0] - tn[0], c[1] - tn[1], c[2] - tn[2]));
    }
    const fig = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [a], siteAt: () => ({ x: 0, y: 0, z: 0 }), tier: "high", hd: true });
    const g = fig.figure(a.id); const lab = g?.children.find((o) => o.name === "aa-label");
    if (g?.userData.aaAgent?.hd && /^software agent · /.test(lab?.userData.text ?? "")) labelled += 1;
    if (geo.glow.i.length && geo.triangles.glow >= 300) glowing += 1;
    fig.dispose();
  }
  ok(minD >= 0.15, `no skin: the head and hands are at least 0.15 (RGB) from every one of crew.js's ${tones.length} skin tones — closest ${minD.toFixed(3)}`);
  ok(labelled === 11 && glowing === 11, `every high-detail figure is labelled "software agent · <role>" (${labelled} of 11) and carries the visor band, eyes, halo and badge (${glowing} of 11)`);
  // 9d. the seven silhouettes: front masks (64 × 128, the same box), every pair compared; before = today's figure, rendered the same way
  const box = [-0.75, -0.02, 0.75, 2.05], MW = 64, MH = 128;
  const maskOf = (group, view) => { // today's figure from its three.js geometry, orthographic, coverage at pixel centres
    group.updateMatrixWorld(true); const m = new Uint8Array(MW * MH), v = new RT.Vector3();
    group.traverse((o) => {
      if (!o.isMesh) return; for (let p = o; p; p = p.parent) if (!p.visible) return;
      const pos = o.geometry.attributes.position, idx = o.geometry.index, P = [];
      for (let i = 0; i < pos.count; i += 1) { v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); P.push([((view === "side" ? -v.z : v.x) - box[0]) * MW / (box[2] - box[0]), (box[3] - v.y) * MH / (box[3] - box[1])]); }
      const n = idx ? idx.count : pos.count;
      for (let t = 0; t < n; t += 3) {
        const [A, B, C] = [0, 1, 2].map((k) => P[idx ? idx.getX(t + k) : t + k]);
        const area = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]); if (Math.abs(area) < 1e-12) continue;
        for (let y = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))); y <= Math.min(MH - 1, Math.ceil(Math.max(A[1], B[1], C[1]))); y += 1) for (let x = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))); x <= Math.min(MW - 1, Math.ceil(Math.max(A[0], B[0], C[0]))); x += 1) {
          const qx = x + 0.5, qy = y + 0.5, w0 = ((B[0] - qx) * (C[1] - qy) - (C[0] - qx) * (B[1] - qy)) / area, w1 = ((C[0] - qx) * (A[1] - qy) - (A[0] - qx) * (C[1] - qy)) / area;
          if (w0 >= 0 && w1 >= 0 && 1 - w0 - w1 >= 0) m[y * MW + x] = 1;
        }
      }
    });
    return m;
  };
  const before = OHA.map((a) => { const w = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [a], siteAt: () => ({ x: 0, y: 0, z: 0 }), tier: "balanced" }); const g = w.figure(a.id); g.position.set(0, 0, 0); g.rotation.y = 0; const m = maskOf(g, "front"); w.dispose(); return m; });
  const after = OHA.map((a) => HD.aaHdSilhouette(a, { w: MW, h: MH, view: "front" }));
  const DISTINCT = 0.9; // a pair is distinct when its front silhouettes overlap by at most 90% (intersection over union)
  const pairsOf = (ms) => { const out = []; for (let i = 0; i < ms.length; i += 1) for (let j = i + 1; j < ms.length; j += 1) out.push({ a: OHA[i].key, b: OHA[j].key, iou: HD.aaHdMaskIoU(ms[i], ms[j]) }); return out; };
  const pb = pairsOf(before), pa = pairsOf(after);
  const nb = pb.filter((p) => p.iou <= DISTINCT).length, na = pa.filter((p) => p.iou <= DISTINCT).length;
  const worstA = pa.reduce((x, y) => (y.iou > x.iou ? y : x)), worstB = pb.reduce((x, y) => (y.iou > x.iou ? y : x));
  const med = (ps) => { const s = ps.map((p) => p.iou).sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  ok(na === 21, `the seven silhouettes are distinct (front IoU ≤ ${DISTINCT}): ${na} of 21 pairs (today's figure: ${nb} of 21); most alike ${worstA.a}/${worstA.b} ${worstA.iou.toFixed(3)}, median ${med(pa).toFixed(3)} (today's: most alike ${worstB.a}/${worstB.b} ${worstB.iou.toFixed(3)}, median ${med(pb).toFixed(3)})`);
  HDV.silhouettes = { before: nb, after: na, worstAfter: worstA, worstBefore: worstB, medAfter: med(pa), medBefore: med(pb) };
  // 9e. personality in the body: each trait against its body measure across the seven (Spearman rank correlation)
  const rank = (xs) => { const o = xs.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]); const r = new Array(xs.length); let i = 0; while (i < o.length) { let j = i; while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j += 1; for (let k = i; k <= j; k += 1) r[o[k][1]] = (i + j) / 2; i = j + 1; } return r; };
  const spearman = (x, y) => { const rx = rank(x), ry = rank(y), mx = rx.reduce((a, b) => a + b) / rx.length, my = ry.reduce((a, b) => a + b) / ry.length; let n = 0, dx = 0, dy = 0; for (let i = 0; i < rx.length; i += 1) { n += (rx[i] - mx) * (ry[i] - my); dx += (rx[i] - mx) ** 2; dy += (ry[i] - my) ** 2; } return n / Math.sqrt(dx * dy || 1); };
  // Measured on the built figure's bones in figure space (rest pose; facing +z, x is lateral), each divided by the body's height:
  //   upright = -(head z - pelvis z)            the head over the hips (a forward lean is negative)
  //   stance  = feet spread beyond the hips     |ankleL x - ankleR x| - |hipL x - hipR x|
  //   hands   = right-wrist travel over 3 s of speech with one fixed beat signal (the same words for every agent)
  //   tidy    = -(right elbow out beyond its shoulder + the knees' fore-aft difference)   arms close, weight even
  const measures = OHA.map((a) => {
    const spec = HD.aaHdSpec(a), fig = HD.aaHdBuild(RT, a, spec), H = spec.body.H;
    const at = (st) => { fig.apply(HD.aaHdPose(spec, st)); fig.group.updateMatrixWorld(true); const p = (n) => fig.bones[n].getWorldPosition(new RT.Vector3()); return { head: p("head"), pelvis: p("pelvis"), wr: p("wristR"), er: p("elbowR"), sr: p("shoulderR"), al: p("ankleL"), ar: p("ankleR"), hl: p("hipL"), hr: p("hipR"), kl: p("kneeL"), kr: p("kneeR") }; };
    const rest = at({ t: 0 });
    let travel = 0, prev = null; for (let k = 0; k <= 60; k += 1) { const s = at({ t: 0, speaking: true, beat: 0.5 + 0.5 * Math.sin(k * 1.3), mouth: 0.5 }); if (prev) travel += s.wr.distanceTo(prev); prev = s.wr.clone(); }
    return { a, upright: -(rest.head.z - rest.pelvis.z) / H, stance: (Math.abs(rest.al.x - rest.ar.x) - Math.abs(rest.hl.x - rest.hr.x)) / H, hands: travel / H,
      tidy: -((Math.abs(rest.er.x) - Math.abs(rest.sr.x)) + Math.abs(rest.kl.z - rest.kr.z)) / H };
  });
  HDV.measures = measures.map((m) => ({ key: m.a.key, upright: +m.upright.toFixed(4), stance: +m.stance.toFixed(4), hands: +m.hands.toFixed(3), tidy: +m.tidy.toFixed(4) }));
  const tr = (k) => OHA.map((a) => a.traits[k]);
  const rho = { caution: spearman(tr("caution"), measures.map((m) => m.upright)), warmth: spearman(tr("warmth"), measures.map((m) => m.stance)), verbosity: spearman(tr("verbosity"), measures.map((m) => m.hands)), formality: spearman(tr("formality"), measures.map((m) => m.tidy)) };
  HDV.rho = rho;
  ok(Object.values(rho).every((r) => r >= 0.7), `personality in the body (Spearman ρ over the seven): caution ↔ upright ${rho.caution.toFixed(2)}, warmth ↔ open stance ${rho.warmth.toFixed(2)}, verbosity ↔ hand motion while speaking ${rho.verbosity.toFixed(2)}, formality ↔ tidy silhouette ${rho.formality.toFixed(2)} (each ≥ 0.70)`, JSON.stringify(HDV.measures));
  // 9f. speech in the body: the mouth opens on each word boundary (a stubbed voice), and on the caption's word timing with voice off
  // Sampled at 60 Hz; "open" is 15% of the mouth's travel. Tolerance, fixed before the run: one 60 Hz frame plus the mouth's rise to
  // 15% open (a few ms) = 25 ms.
  const FPS = 60, THR = 0.15, TOL = 25;
  const text = "Job 7 at the San Jose robotics lab is mine; I will coach the pick and place after the run.";
  const words = [...text.matchAll(/\S+/g)].map((m) => ({ char: m.index, len: m[0].length }));
  const runMouth = (voiced) => {
    const src = AA.aaEmitter(), w = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [AG.trainer], source: src, siteAt, tier: "high", hd: true });
    let t = 0; w.animate(t, 0, null); src.emit({ type: "speak", agent: AG.trainer.id, text });
    const hooks = AA.aaVoiceHooks(w, AG.trainer.id), sched = [];
    if (voiced) { // the stubbed voice's clock: starts 0.35 s in, a boundary per word at 90 ms + 28 ms a letter, ends 0.3 s after the last word
      let tv = 0.35; sched.push([tv, () => hooks.onstart()]); tv += 0.04;
      for (const wd of words) { const at = tv; sched.push([at, () => hooks.onboundary({ name: "word", charIndex: wd.char })]); tv += 0.09 + 0.028 * wd.len; }
      sched.push([tv + 0.3, () => hooks.onend()]);
    }
    const bounds = voiced ? sched.slice(1, -1).map((s) => s[0]) : w.state(AG.trainer.id) && null;
    const onsetsOff = voiced ? null : (() => { const st = w.state(AG.trainer.id); void st; return null; })();
    void onsetsOff;
    const samples = []; let speakingAt = null;
    for (let k = 1; k <= FPS * 9; k += 1) {
      t = k / FPS; while (sched.length && sched[0][0] <= t) sched.shift()[1]();
      w.animate(t, 1 / FPS, null); const s = w.state(AG.trainer.id); samples.push([t, s.mouth, s.talkVisible, s.speaking]); if (speakingAt === null && s.speaking) speakingAt = t;
    }
    w.dispose();
    return { samples, bounds };
  };
  const err = (samples, bounds) => { const out = []; for (let i = 0; i < bounds.length; i += 1) { const b = bounds[i], next = bounds[i + 1] ?? Infinity; const hit = samples.find(([t, m]) => t >= b - 1e-9 && t < next && m >= THR); out.push(hit ? (hit[0] - b) * 1000 : Infinity); } return out; };
  const v = runMouth(true), ev = err(v.samples, v.bounds);
  // a mount without `voiced` runs the line on the caption's timing until onstart (the light and mouth start when the line arrives);
  // with `voiced` (the page's, AVATARS-HD-2) they wait for onstart: measured below over the real hive's lines
  const closedAfter = v.samples.filter(([t]) => t > v.bounds[v.bounds.length - 1] + 0.32).every(([, m]) => m === 0);
  const maxV = Math.max(...ev), within = ev.filter((e) => e <= TOL).length;
  ok(within === ev.length && closedAfter, `voice on (a stubbed utterance's word boundaries): the mouth opens within ${maxV.toFixed(1)} ms of each boundary, ${within} of ${ev.length} within ${TOL} ms; shut after onend`);
  const off = runMouth(false);
  const ons = HD.aaWordOnsets(text, AA.aaLineMs(text)).map((o) => o.at / 1000 + 0); // the line starts at the first frame after the speak (t = 0)
  const eo = err(off.samples, ons), maxO = Math.max(...eo), withinO = eo.filter((e) => e <= TOL).length;
  const lineEnd = AA.aaLineMs(text) / 1000, shutAfter = off.samples.filter(([t]) => t > lineEnd + 0.02).every(([, m]) => m === 0);
  let closes = 0; for (let i = 0; i + 1 < ons.length; i += 1) if (off.samples.some(([t, m]) => t > ons[i] && t < ons[i + 1] && m < THR)) closes += 1;
  ok(withinO === eo.length && shutAfter && closes === ons.length - 1, `voice off (the caption's word timing): the mouth opens within ${maxO.toFixed(1)} ms of each word onset, ${withinO} of ${eo.length}; it closes between words ${closes} of ${ons.length - 1} and is shut after the line`);
  HDV.mouth = { on: { max: maxV, n: ev.length, within }, off: { max: maxO, n: eo.length, within: withinO } };
  // the real voice controller (oh-voice.js) with a stubbed speechSynthesis: one local voice and one network voice.
  // AVATARS-HD-2: the stub's word boundaries are word-length based, like the stub above (onstart 0.1 s after speak, then a boundary per
  // word at 90 ms + 28 ms a letter). Before, it fired one every 0.2 s whatever the word (about 300 words a minute), which no voice does.
  // The claim is per word now: the mouth opens within TOL of each boundary the controller forwards and closes before the next one.
  const OHV = await imp("WebXR/shared/oh-voice.js");
  const voices = [{ name: "Local Voice", lang: "en-US", localService: true }, { name: "Network Voice", lang: "en-US", localService: false }];
  class Utter { constructor(text2) { this.text = text2; } }
  /** A stubbed speechSynthesis on a simulated clock: word-length based boundaries; `log` keeps each utterance's onstart, boundaries and onend. */
  const stubSynth = (clockRef, log) => {
    const timers = [];
    return { timers, getVoices: () => voices, cancel() {}, speak(u) {
      const rec = { text: u.text, start: null, end: null, bounds: [] }; log.push(rec);
      const t0 = clockRef.now; timers.push([t0 + 0.1, () => { rec.start = t0 + 0.1; u.onstart?.(); }]); let tv = t0 + 0.14;
      for (const m of u.text.matchAll(/\S+/g)) { const ci = m.index, at = tv; timers.push([at, () => { if (typeof u.onboundary === "function") { rec.bounds.push(at); u.onboundary({ name: "word", charIndex: ci }); } }]); tv += 0.09 + 0.028 * m[0].length; }
      const te = tv + 0.2; timers.push([te, () => { rec.end = te; u.onend?.(); }]); timers.sort((p, q) => p[0] - q[0]);
    } };
  };
  const fire = (sy, t) => { while (sy.timers.length && sy.timers[0][0] <= t) sy.timers.shift()[1](); };
  const clk2 = { now: 0 }, log2 = [], synth = stubSynth(clk2, log2);
  const ctl = OHV.ohVoiceController({ synth, Utterance: Utter, doc: null, win: null, enabled: true, now: () => clk2.now * 1000 });
  const src2 = AA.aaEmitter(), w2 = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [AG.trainer], source: src2, siteAt, tier: "high", hd: true });
  w2.animate(0, 0, null); src2.emit({ type: "speak", agent: AG.trainer.id, text }); ctl.say(AG.trainer, text, AA.aaVoiceHooks(w2, AG.trainer.id, text));
  const s2 = []; for (let k = 1; k <= FPS * 6; k += 1) { clk2.now = k / FPS; fire(synth, clk2.now); w2.animate(clk2.now, 1 / FPS, null); const s = w2.state(AG.trainer.id); s2.push([clk2.now, s.mouth, s.voiced]); }
  /** Per word: the mouth opens (≥ THR) within TOL ms of the boundary and is shut (< THR) again before the next boundary (or onend). */
  const perWord = (samples, bounds, endT) => { let n = 0, worst = 0; for (let i = 0; i < bounds.length; i += 1) { const b = bounds[i], next = bounds[i + 1] ?? endT; const op = samples.find(([t, m]) => t >= b - 1e-9 && t < next && m >= THR); if (!op) continue; worst = Math.max(worst, (op[0] - b) * 1000); if ((op[0] - b) * 1000 <= TOL && samples.some(([t, m]) => t > op[0] && t < next && m < THR)) n += 1; } return { n, worst }; };
  const bForwarded = log2[0]?.bounds.length ?? 0, pw = perWord(s2, log2[0]?.bounds ?? [], log2[0]?.end ?? Infinity);
  ok(ctl.chosen(AG.trainer.id)?.localService === true && bForwarded === words.length && pw.n === bForwarded, `with oh-voice.js and a stubbed speechSynthesis (one local, one network voice; word-length boundaries): the local voice is chosen; boundaries forwarded by the controller: ${bForwarded} of ${words.length} words; the mouth opens on each word within ${pw.worst.toFixed(1)} ms and closes before the next: ${pw.n} of ${bForwarded}`);
  HDV.voiceCtl = { forwarded: bForwarded, words: words.length, perWord: pw.n, worst: pw.worst };
  w2.dispose();
  // AVATARS-HD-2: the light and the mouth start at the voice's onstart, over the real hive's lines (seed 1). The page's wiring: the panel's
  // voice hears each speak event first (say(), then onstart / onboundary / onend with the line), then the figures; `voiced` is the
  // controller's pending. Before = the same run with a mount that has no `voiced` (the light came on when the line arrived).
  const lightRun = (withVoiced) => {
    const hv2 = OHH.ohHive({ seed: HIVE_SEED }), clk = { now: 0 }, log = [], sy = stubSynth(clk, log);
    const vc = OHV.ohVoiceController({ synth: sy, Utterance: Utter, doc: null, win: null, enabled: true, now: () => clk.now * 1000 });
    const byId = new Map(OHA.map((a) => [a.id, a])), lines = [];
    let wl = null;
    hv2.on("speak", (e) => { const a = byId.get(e.agent); if (!a) return; const L = { agent: e.agent, text: String(e.text).trim(), at: clk.now, start: null, end: null }; lines.push(L);
      vc.say(a, e.text, { onstart: () => { L.start = clk.now; wl?.talkStart(e.agent, e.text); }, onboundary: (b) => { if (!b?.name || b.name === "word") wl?.talkWord(e.agent, b.charIndex, e.text); }, onend: () => { L.end = clk.now; wl?.talkEnd(e.agent, e.text); } }); });
    wl = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: OHA, source: hv2, siteAt, tier: "high", hd: true, ...(withVoiced ? { voiced: (id, t) => vc.pending(id, t) } : {}) });
    wl.animate(0, 0, null);
    const frames = new Map(OHA.map((a) => [a.id, []]));
    let nextStep = 0;
    for (let k = 1; k <= FPS * 60; k += 1) {
      clk.now = k / FPS;
      if (clk.now >= nextStep && vc.queued() <= 2) { hv2.step(); nextStep = clk.now + 0.4; } // the panel's run: a step every 0.4 s, held while the voices catch up
      fire(sy, clk.now); wl.animate(clk.now, 1 / FPS, null);
      for (const a of OHA) { const st = wl.state(a.id); frames.get(a.id).push([clk.now, st.talkVisible, st.mouth, st.line, st.captionVisible]); }
    }
    let n = 0, good = 0, captioned = 0; const eps = 1 / FPS + 1e-6;
    for (const L of lines) {
      if (L.start == null || L.end == null) continue; n += 1;
      const mine = lines.filter((x) => x.agent === L.agent && x !== L && x.start != null && x.end != null);
      const prevEnd = Math.max(L.at, ...mine.filter((x) => x.end <= L.start).map((x) => x.end));
      const fr = frames.get(L.agent);
      const offBefore = fr.filter(([t]) => t > prevEnd + eps && t < L.start - eps).every(([, lit, m]) => !lit && m === 0);
      const onDuring = fr.filter(([t]) => t > L.start + eps && t < L.end - eps).every(([, lit, , line]) => lit && line === L.text);
      if (offBefore && onDuring) good += 1;
      if (fr.some(([t, , , line, cap]) => t >= L.at - eps && t <= L.end + eps && cap && line === L.text)) captioned += 1;
    }
    const bounds = log.flatMap((r) => r.bounds.map((b) => ({ b, r })));
    let words = 0, opened = 0;
    for (const L of lines) {
      const rec = log.find((r) => r.text === L.text && r.start === L.start); if (!rec || L.start == null || L.end == null) continue; // a line still speaking when the run ends is not counted (as above)
      const fr = frames.get(L.agent).map(([t, , m]) => [t, m]);
      const pwl = perWord(fr, rec.bounds, rec.end ?? Infinity); words += rec.bounds.length; opened += pwl.n;
    }
    wl.dispose();
    return { lines: n, good, captioned, boundaries: bounds.length, words, opened, waited: wl.talkLog().filter((x) => x.waited).length };
  };
  const LB = lightRun(false), LA = lightRun(true);
  ok(LA.lines >= 10 && LA.good === LA.lines && LA.captioned === LA.lines, `with voice on, the light and the mouth start at onstart: off before it and on from onstart to onend for ${LA.good} of ${LA.lines} spoken lines (the real hive, seed ${HIVE_SEED}, 60 s; a mount without \`voiced\`: ${LB.good} of ${LB.lines}); the caption is up for ${LA.captioned} of ${LA.lines}`);
  ok(LA.words > 50 && LA.opened === LA.words, `over the same run, the mouth opens on each forwarded word boundary within ${TOL} ms and closes before the next: ${LA.opened} of ${LA.words} words (${LA.lines} lines)`);
  HDV.light = { before: LB, after: LA };
  // 9g. gestures driven by the hive's own events: the real hive (seed 1), every event type → its gesture, N of N
  // the learner is a seeded stand-in (not a person) who approves every request, so approvals happen; supervise every job is on
  const hv = OHH.ohHive({ seed: HIVE_SEED, supervise: true, decide: () => "approve" });
  const wg = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: OHA, source: hv, siteAt, tier: "high", hd: true });
  const evs = []; hv.on("*", (e) => evs.push(e));
  let tg = 0; wg.animate(tg, 0, null);
  const seen = []; // every frame: each agent's gesture as posed
  for (let s = 0; s < 120; s += 1) { hv.step(); for (let k = 0; k < 10; k += 1) { tg += 0.1; wg.animate(tg, 0.1, null); for (const a of OHA) seen.push([tg, a.id, wg.state(a.id).gesture]); } }
  const gl = wg.gestureLog();
  // a refusal's stop hand is never cut short by a bid's raise or an award's accept (those wait behind it)
  const stopsG = gl.filter((g) => g.kind === "stop");
  let cut = 0; for (const g of stopsG) if (seen.some(([t, id, k]) => id === g.agent && t >= g.start + 0.05 && t < g.end - 0.05 && (k === "raise" || k === "accept"))) cut += 1;
  const waited = gl.filter((g) => g.queued).length, dropped = gl.filter((g) => g.dropped).length;
  ok(cut === 0 && stopsG.length > 0, `a stop hand holds its full ${AA.AA_GESTURE_MS.stop} ms: ${stopsG.length - cut} of ${stopsG.length}; ${waited} raise/accept gestures waited behind one (${dropped} replaced while waiting by a newer one)`);
  const want = { bid: "raise", award: "accept", refused: "stop", approved: "approve", complete: "nod" };
  const rows = Object.entries(want).map(([on, kind]) => {
    const n = on === "approved" ? evs.filter((e) => e.type === "speak" && e.about === "approved").length : evs.filter((e) => e.type === on).length;
    const fired = gl.filter((g) => g.on === on && g.kind === kind); return { on, kind, n, got: fired.length, shown: fired.filter((g) => !g.dropped).length };
  });
  ok(rows.every((r) => r.got === r.n && r.n > 0), `gestures from the hive's events (seed ${HIVE_SEED}, 120 steps): ${rows.map((r) => `${r.on} → ${r.kind} ${r.got} of ${r.n}`).join(", ")}`, `shown in full or after a stop: ${rows.map((r) => `${r.kind} ${r.shown}`).join(", ")}`);
  HDV.gestures = rows;
  wg.dispose();
  // the pose each gesture makes (one agent, each event once, sampled mid-gesture in figure space)
  const src3 = AA.aaEmitter(), w3 = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [AG.logistics], source: src3, siteAt: () => ({ x: 0, y: 0, z: 0 }), tier: "high", hd: true });
  const g3 = w3.figure(AG.logistics.id); let t3 = 0; w3.animate(t3, 0, null);
  const fp = (name) => { g3.updateMatrixWorld(true); const bone = g3.userData.parts.body.skeleton.bones.find((b) => b.name === `aa-bone-${name}`); return g3.worldToLocal(bone.getWorldPosition(new RT.Vector3())); };
  const restH = fp("head"), restWr = fp("wristR"), restChest = fp("chest");
  const mid = (type, extra = {}) => { src3.emit({ type, agent: AG.logistics.id, ...extra }); const kind = AA.AA_GESTURE_FOR[type === "speak" ? "approved" : type]; t3 += (AA.AA_GESTURE_MS[kind] / 1000) * 0.5; w3.animate(t3, 0.05, null); const r = { head: fp("head"), wr: fp("wristR"), el: fp("elbowR"), pitch: g3.userData.parts.head.rotation.x }; t3 += 2.5; w3.animate(t3, 0.05, null); return r; };
  const pr = mid("bid"), pa2 = mid("award"), ps = mid("refused", { reason: "speed over the site limit" }), pn = mid("speak", { about: "approved", text: "Approved for the sim." }), pc = mid("complete");
  const poses = [
    ["raise: the right hand above the head", pr.wr.y > restH.y + 0.1],
    ["accept: the right hand up at the chest", pa2.wr.y > restChest.y - 0.05 && pa2.wr.y < restH.y],
    ["stop: the hand forward, up, palm out", ps.wr.z > restWr.z + 0.25 && ps.wr.y > ps.el.y + 0.1],
    ["approve: a nod", pn.pitch > 0.2],
    ["complete: a nod", pc.pitch > 0.2],
  ];
  ok(poses.every((p) => p[1]), `each gesture's pose, measured on the figure's bones mid-gesture: ${poses.filter((p) => p[1]).length} of ${poses.length}`, poses.filter((p) => !p[1]).map((p) => p[0]).join("; "));
  w3.dispose();
  // 9h. reduced motion: no idle, blink or walk on the high figure; a gesture holds still at its pose
  const src4 = AA.aaEmitter(), w4 = AA.aaMountAgentAvatars({ three: RTS, parent: new RT.Group(), agents: [AG.trainer], source: src4, siteAt, tier: "high", hd: true, reducedMotion: true });
  const g4 = w4.figure(AG.trainer.id), bones4 = g4.userData.parts.body.skeleton.bones;
  const snap = () => bones4.map((b) => `${b.rotation.x.toFixed(4)},${b.rotation.y.toFixed(4)},${b.rotation.z.toFixed(4)},${b.scale.y.toFixed(3)}`).join("|");
  w4.animate(1, 0.05, null); const s1 = snap(); w4.animate(2.7, 0.05, null); const s2b = snap();
  src4.emit({ type: "refused", agent: AG.trainer.id, reason: "x" }); w4.animate(2.8, 0.05, null); const a1 = snap(); w4.animate(3.9, 0.05, null); const a2 = snap();
  ok(s1 === s2b && a1 === a2 && a1 !== s1, "reduced motion: the high figure stands still (no idle, breathing or blink), and a gesture holds still at its pose");
  w4.dispose();
  // 9j. portraits from the new figure at 2× and 3× (48 px cards: 96 and 144 px), same card layout
  const keysP = new Set(); let goodP = 0;
  const fnv = (u8) => { let h = 2166136261; for (let i = 0; i < u8.length; i += 7) { h ^= u8[i]; h = Math.imul(h, 16777619) >>> 0; } return h; };
  const allAgents = [...OHA, ...AA.aaVbridgeAgents()];
  for (const a of allAgents) for (const px of [96, 144]) {
    const p1 = AP.aaPortraitFigureRgba(a, px), p2 = AP.aaPortraitFigureRgba(a, px);
    const corner = p1[3], centre = p1[((px >> 1) * px + (px >> 1)) * 4 + 3];
    if (p1.length === px * px * 4 && fnv(p1) === fnv(p2) && corner === 0 && centre === 255) goodP += 1;
    if (px === 96) keysP.add(fnv(p1));
  }
  ok(goodP === allAgents.length * 2 && keysP.size === allAgents.length, `portraits drawn from the high-detail figure: ${goodP} of ${allAgents.length * 2} at 96 px (2×) and 144 px (3×), deterministic, rounded card corners; distinct ${keysP.size} of ${allAgents.length}`);
  const apSrc = read("WebXR/shared/aa-agent-portraits.js");
  ok(typeof AP.aaPortrait === "function" && /export function aaPortraitImg[^]*?return aaPortrait\(agent, \{ size, scale: dpr, kind \}\)/.test(apSrc) && /aaPortraitImg\(a, \{ size \}\)/.test(apSrc) && AP.aaPortrait(OHA[0], { size: 48, scale: 3 })?.width === 48, "aaPortrait(agent, { size, scale }) is exported for HIVE-4's tab; aaPortraitImg and the roster draw it (same card layout: a 48 px image)");
  // 9k. AVATARS-HD-2: the room level in the six robotics rooms on high. Each room is built as the page builds it on a desktop (ROBO-
  // INTERIORS' dresser, ENV-HD-4's lighting, ENV-HD-2's skins), then H3_ROOM_FIGURES figures (the most a room holds) stand in it, each
  // with a caption up (the worst case for meshes, triangles and textures); measured with ixrMeasure as check_hive_world does (the
  // shell's sign canvases added; the room's own textures as size stubs, a canvas stub for the figures' label and caption).
  {
    const IX = await imp("WebXR/shared/ix-interiors.js"), IXR = await imp("WebXR/shared/ixr-robo-interiors.js"), H4R = await imp("WebXR/shared/hd4-rooms.js"), HD2 = await imp("WebXR/shared/hd2-room-skins.js"), H3 = await imp("WebXR/shared/h3-hive-day.js");
    const DESK = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
    const dz = {}; const regD = { ixRegisterDresser: (st, fn) => (dz[st] ??= []).push(fn) };
    IXR.ixrRegisterDressers(regD); H4R.hd4RegisterDressers(regD, { ultra: false, ua: DESK }); HD2.hd2RegisterSkins(regD);
    const signBytes = IXR.IXR_SHELL_SIGNS.reduce((a, [w, h]) => a + Math.round(w * h * 4 * 4 / 3), 0);
    const ctx = new Proxy({}, { get: (_t, k) => (k === "measureText" ? () => ({ width: 10 }) : () => {}), set: () => true });
    const savedDoc = globalThis.document, N3 = H3.H3_ROOM_FIGURES;
    const mounts = { today: (o) => AA.aaMountAgentAvatars(o), room: AA.aaRoomAvatarMount(), full: (o) => AA.aaMountAgentAvatars({ ...o, hd: true }) };
    const measureRoom = (st, kind, tier = "high") => {
      const rb = rbData.RB_SITES.find((x) => IXR.IXR_SITE_STYLE[x.id] === st);
      delete globalThis.document;
      const room = IX.ixBuild(st, { three: RT, tier, site: IXR.ixrSiteFor(rb, null), dressers: dz });
      const shell = IXR.ixrMeasure(room);
      globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
      const spots = room.spots?.agent ?? [], who = OHA.slice(0, N3).map((a) => ({ ...a, homeSite: "ah2-room" }));
      const m = mounts[kind]({ three: RTS, parent: room.group, agents: who, tier, siteAt: (id) => (id === "ah2-room" ? { x: 0, y: 0, z: 0 } : null),
        spotFor: (a) => { const i = who.findIndex((x) => x.id === a.id), q = spots[i] ?? { x: -1.2 + i * 1.2, z: 1.5, yaw: 0 }; return { x: q.x, y: 0, z: q.z, yaw: (q.yaw ?? 0) + Math.PI }; },
        textureScale: tier === "balanced" ? 0.5 : 1 });
      m.animate(0, 0, null); for (const a of who) m.handle({ type: "speak", agent: a.id, text: "Checking the cell before the next simulated run." }); m.animate(0.2, 0.2, null);
      const all = IXR.ixrMeasure(room), c = m.counts();
      let worstTri = 0; for (const a of who) { const g = m.figure(a.id); let tri = 0; g?.traverse((o) => { if (o.isMesh) tri += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; }); worstTri = Math.max(worstTri, tri); }
      m.dispose(); globalThis.document = savedDoc;
      const tex = all.textureBytes + signBytes, lt = tier === "low" ? "low" : "high";
      return { st, shell, all, c, tex, worstTri, inside: all.meshes <= IX.IX_BUDGET.meshes && all.triangles <= IX.IX_BUDGET.triangles[lt] && tex <= IXR.IXR_TEX_BUDGET[tier] };
    };
    const styles = Object.keys(IXR.IXR_ROOMS), R = styles.map((st) => ({ st, today: measureRoom(st, "today"), room: measureRoom(st, "room"), full: measureRoom(st, "full") }));
    for (const x of R) console.log(`     ${x.st.padEnd(18)} high, ${N3} figures: shell ${x.room.shell.triangles} tris; today's figure → ${x.today.all.triangles} tris / ${x.today.all.meshes} meshes; room level → ${x.room.all.triangles} tris / ${x.room.all.meshes} meshes (${x.room.c.hd} HD, ${x.room.c.hdLevel}); outdoor HD would be ${x.full.all.triangles} tris; textures ${fmtMiB(x.room.tex)}`);
    const inRoom = R.filter((x) => x.room.inside && x.room.c.hd === N3 && x.room.c.hdLevel === "room").length, overFull = R.filter((x) => !x.full.inside).length;
    const worstRoomTri = Math.max(...R.map((x) => x.room.worstTri)), worstRoom = R.reduce((a, b) => (b.room.all.triangles > a.room.all.triangles ? b : a));
    ok(inRoom === styles.length, `the six robotics rooms on high with ${N3} high-detail figures (the room level) and their captions: inside IX_BUDGET (≤ ${IX.IX_BUDGET.meshes} meshes, ${IX.IX_BUDGET.triangles.high} triangles) and IXR_TEX_BUDGET: ${inRoom} of ${styles.length}; busiest ${worstRoom.st} ${worstRoom.room.all.triangles} triangles (today's figure: ${worstRoom.today.all.triangles}); the outdoor figure would put ${overFull} of ${styles.length} over`);
    ok(worstRoomTri <= HD.AA_HD_ROOM_BUDGET.triangles && worstRoomTri <= Math.min(...R.map((x) => x.today.worstTri)), `the room level per figure: worst ${worstRoomTri} triangles (≤ ${HD.AA_HD_ROOM_BUDGET.triangles}, and no more than today's figure's ${Math.min(...R.map((x) => x.today.worstTri))}), 3 meshes against today's 9`);
    const bal = measureRoom("ixr-cell-hall", "room", "balanced"), low = measureRoom("ixr-cell-hall", "room", "low"), balToday = measureRoom("ixr-cell-hall", "today", "balanced");
    ok(bal.c.hd === 0 && bal.all.triangles === balToday.all.triangles && bal.all.meshes === balToday.all.meshes && bal.tex === balToday.tex && low.c.figures === 0, `balanced and the phone unchanged in a room: balanced builds today's figure (${bal.all.triangles} triangles, ${bal.all.meshes} meshes, as without the room level), the phone tier none`);
    const appSrc = read("WebXR/parishes/js/app.js");
    ok(/var aaRoomMount = aaRoomAvatarMount\(\{ voiced: aaVoiced \}\);/.test(appSrc) && /hwSyncRoom\(hwRoomMount, \{[^\n]*mount: aaRoomMount \}\)/.test(appSrc), "wiring: the page's robotics-room mount (hwSyncRoom's mount) is aaRoomAvatarMount with the voice's pending");
    HDV.rooms = R.map((x) => ({ st: x.st, shell: x.room.shell.triangles, today: x.today.all.triangles, room: x.room.all.triangles, full: x.full.all.triangles, meshesToday: x.today.all.meshes, meshesRoom: x.room.all.meshes, inside: x.room.inside }));
    HDV.roomsInside = { n: inRoom, of: styles.length, fullOver: overFull, worstTri: worstRoomTri };
  }
  // 9i. the wiring: the outdoor mount asks for hd; the bundles list the module before the portraits
  const app = read("WebXR/parishes/js/app.js"), bundler = read("tools/bundle_webxr.py");
  const block = (name) => { const i = bundler.indexOf(`"${name}": {`); return i < 0 ? "" : bundler.slice(i, bundler.indexOf('"entry"', i)); };
  const par2 = block("parishes"), ins2 = block("instructor");
  ok(/aaMountAgentAvatars\(\{[^\n]*\bhd: true\b/.test(app) && par2.indexOf('"aa-agent-hd.js"') > 0 && par2.indexOf('"aa-agent-hd.js"') < par2.indexOf('"aa-agent-portraits.js"') && ins2.indexOf('"aa-agent-hd.js"') > 0 && ins2.indexOf('"aa-agent-hd.js"') < ins2.indexOf('"aa-agent-portraits.js"'), "wiring: the parishes app's outdoor mount asks for hd; both bundles list aa-agent-hd.js before the portraits");
}

// ---------------------------------------------------------------- the eval
if (HDV.tiers) {
  const T9 = HDV.tiers;
  console.log(`\n  EVAL AVATARS-HD: triangles per figure low 0 / balanced ${T9.balanced.perFigure.toFixed(0)} / high ${T9.high.perFigure.toFixed(0)} (worst ${T9.high.worstTri}, budget ${3000}); draw calls per figure balanced ${T9.balanced.silent}/${T9.balanced.speaking}, high ${T9.high.silent}/${T9.high.speaking} (silent/speaking)`);
  if (HDV.roomsInside) console.log(`  EVAL AVATARS-HD-2: robotics rooms inside IX_BUDGET on high with ${3} high-detail figures 0 → ${HDV.roomsInside.n} of ${HDV.roomsInside.of} (room level, worst ${HDV.roomsInside.worstTri} triangles a figure; the outdoor figure would put ${HDV.roomsInside.fullOver} over)`);
  if (HDV.light) console.log(`  EVAL AVATARS-HD-2: boundaries forwarded by the real controller 0 → ${HDV.voiceCtl.forwarded} of ${HDV.voiceCtl.words}; mouth opens per word (word-length stub) ${HDV.voiceCtl.perWord} of ${HDV.voiceCtl.forwarded}, real hive ${HDV.light.after.opened} of ${HDV.light.after.words}; talk light from onstart ${HDV.light.before.good} of ${HDV.light.before.lines} → ${HDV.light.after.good} of ${HDV.light.after.lines}`);
  console.log(`  EVAL AVATARS-HD: distinct silhouettes ${HDV.silhouettes.before} → ${HDV.silhouettes.after} of 21; mouth within ${HDV.mouth.on.max.toFixed(1)} ms of word boundaries (stubbed voice, ${HDV.mouth.on.within} of ${HDV.mouth.on.n}), ${HDV.mouth.off.max.toFixed(1)} ms of caption word onsets (${HDV.mouth.off.within} of ${HDV.mouth.off.n}); gestures ${HDV.gestures.map((r) => `${r.on} ${r.got}/${r.n}`).join(", ")}`);
}
console.log(`\n  eval: agents embodied 0 → ${OHA.length} hive agents (the real hive, ohHive seed ${HIVE_SEED}) + ${AP.AA_VBRIDGE_PERSONAS.length} VBRIDGE personas; meshes + sprites per figure ≤ ${AA.AA_AGENT_BUDGET}; over the real hive's run the talk light is exact, every speak event has a caption and every move ends at its named site (lines above)`);
console.log(failures ? `\n${failures} agent-avatar problem(s) found (${passes} passed).` : `\nAll ${passes} agent-avatar checks pass.`);
process.exit(failures ? 1 : 0);
