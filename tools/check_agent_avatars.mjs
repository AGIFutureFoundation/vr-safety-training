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

// ---------------------------------------------------------------- the eval
console.log(`\n  eval: agents embodied 0 → ${OHA.length} hive agents (the real hive, ohHive seed ${HIVE_SEED}) + ${AP.AA_VBRIDGE_PERSONAS.length} VBRIDGE personas; meshes + sprites per figure ≤ ${AA.AA_AGENT_BUDGET}; over the real hive's run the talk light is exact, every speak event has a caption and every move ends at its named site (lines above)`);
console.log(failures ? `\n${failures} agent-avatar problem(s) found (${passes} passed).` : `\nAll ${passes} agent-avatar checks pass.`);
process.exit(failures ? 1 : 0);
