#!/usr/bin/env node
/**
 * AGENT-AVATARS checker (docs/consoles/AGENT-AVATARS.md): the Omega Hive's software agents and the four VBRIDGE
 * personas embodied, tested against a FIXTURE hive (three agents emitting the loop-10 contract's events — OMEGA-HIVE's
 * modules are not imported) and against the real VBRIDGE job lifecycle (vb-bridge.js + vb-governor.js).
 *
 *     node tools/check_agent_avatars.mjs
 *
 * Proves, headlessly (three.js stub, DOM stub):
 *   - every figure is ctAvatarFigure plus the agent marker and outfit set, inside AA_AGENT_BUDGET meshes + sprites
 *     (crew.js CT_AVATAR_BUDGET, GRIOT's ceiling), labelled "software agent · <role>", hologram-tinted (no skin);
 *   - each stands at its home site on a free standing spot outside the robot's warning zone and pad;
 *   - the talk light is on exactly during each speak event's window (sampled at 20 Hz), N of N, and a caption bubble
 *     carries every speak event's line, N of N;
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
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");

console.log("Agent avatars — fixture hive (3 agents), seven-role roster fixture, VBRIDGE personas\n");

// ---------------------------------------------------------------- the fixture: a map holding every robot site, and a hive
const SITE_XY = Object.fromEntries(rbData.RB_SITES.map((s, i) => [s.id, { x: i * 60, y: 0.5, z: (i % 2) * 40 }])); // 60 m apart: walkable
const siteAt = (id) => SITE_XY[id] ?? null;
const FIX = [ // contract shape (OH_AGENTS): names here are fixture labels, not OMEGA-HIVE's agents
  { id: "fx-dispatcher", name: "Fixture dispatcher", role: "dispatcher", homeSite: "rb-site-west-oakland-warehouse", avatar: { glyph: "dispatch", accent: 0x5ec8d8, outfit: "agent" }, voice: { lang: "en-US", rate: 1, pitch: 1, prefer: [] }, traits: { warmth: 0.6, formality: 0.4, verbosity: 0.5, caution: 0.5 }, style: {} },
  { id: "fx-safety-steward", name: "Fixture steward", role: "safety steward", homeSite: "rb-site-west-oakland-warehouse", avatar: { glyph: "steward", accent: 0xd8322c, outfit: "agent" }, voice: { lang: "en-US", rate: 0.95, pitch: 0.9, prefer: [] }, traits: { warmth: 0.4, formality: 0.8, verbosity: 0.3, caution: 0.95 }, style: {} },
  { id: "fx-logistics", name: "Fixture logistics", role: "logistics", homeSite: "rb-site-west-oakland-port-automation", avatar: { glyph: "logistics", accent: 0xf2c14b, outfit: "agent" }, voice: { lang: "en-US", rate: 1.05, pitch: 1.1, prefer: [] }, traits: { warmth: 0.7, formality: 0.3, verbosity: 0.7, caution: 0.4 }, style: {} },
];
function fixtureHive() {
  const em = AA.aaEmitter(); const events = []; let t = 0;
  const push = (ev) => { events.push({ t: (t += 1), ...ev }); };
  // A short seeded job: announce, bid, award, dispatch, move, a veto, an approval request, completion — the contract's eight types.
  push({ type: "speak", agent: "fx-dispatcher", text: "Job j-0001 is up: AMR fleet routing at Automated Warehouse Aisle.", jobId: "j-0001" });
  push({ type: "bid", agent: "fx-logistics", jobId: "j-0001", caption: "Bid: 60 m away, load 1." });
  push({ type: "bid", agent: "fx-safety-steward", jobId: "j-0001" });
  push({ type: "award", agent: "fx-dispatcher", jobId: "j-0001", caption: "Awarded to logistics." });
  push({ type: "speak", agent: "fx-dispatcher", text: "Awarded j-0001 to logistics.", jobId: "j-0001" });
  push({ type: "move", agent: "fx-logistics", to: "rb-site-west-oakland-warehouse", jobId: "j-0001" });
  push({ type: "dispatch", agent: "fx-logistics", to: "rb-site-west-oakland-warehouse", jobId: "j-0001" });
  push({ type: "speak", agent: "fx-logistics", text: "On my way to the warehouse aisle for j-0001.", jobId: "j-0001" });
  push({ type: "speak", agent: "fx-logistics", text: "Arrived. Holding at the walkway until it is clear.", jobId: "j-0001" });
  push({ type: "refused", agent: "fx-safety-steward", jobId: "j-0002", reason: "speed over the site limit", text: "Veto on j-0002: speed over the site limit." });
  push({ type: "approval-request", agent: "fx-safety-steward", jobId: "j-0003", caption: "j-0003 needs the supervisor's approval." });
  push({ type: "speak", agent: "fx-safety-steward", text: "j-0003 would touch the physical path, which stays disabled. Asking the supervisor.", jobId: "j-0003" });
  push({ type: "complete", agent: "fx-logistics", jobId: "j-0001" });
  push({ type: "speak", agent: "fx-dispatcher", text: "j-0001 complete. Next job in the queue.", jobId: "j-0001" });
  return { on: em.on, off: em.off, emit: em.emit, events, play: (i) => em.emit(events[i]) };
}

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

// ---------------------------------------------------------------- 2. the fixture hive embodied
const hive = fixtureHive();
const parent = new THREE.Group();
const world = AA.aaMountAgentAvatars({ three: THREE, parent, agents: FIX, source: hive, siteAt, reducedMotion: false });
{
  const c = world.counts();
  ok(c.figures === 3 && parent.children.length === 1, `3 fixture agents embodied on one root`, `${c.meshes} meshes + ${c.sprites} sprites`);
  ok(c.worstPerFigure <= AA.AA_AGENT_BUDGET, `meshes + sprites per figure ≤ ${AA.AA_AGENT_BUDGET}`, `worst ${c.worstPerFigure}`);
  let labelled = 0, holo = 0, marker = 0, outfit = 0;
  for (const a of FIX) {
    const g = world.figure(a.id), parts = g.userData.parts;
    const label = g.children.find((o) => o.name === "aa-label");
    if (label?.userData.text === `software agent · ${AP.aaRoleLabel(a)}` && /^software agent · /.test(label.userData.text)) labelled += 1;
    if (["legs", "torso", "head"].every((k) => parts[k]?.material?.transparent && parts[k].material.emissive)) holo += 1;
    if (parts.visor && parts.halo) marker += 1;
    if (parts.vest && parts.badge && parts.tablet) outfit += 1;
  }
  ok(labelled === 3, `every figure floats a "software agent · <role>" label`, `${labelled}/3 (e.g. "${world.state(FIX[0].id).label}")`);
  ok(holo === 3 && marker === 3 && outfit === 3, "visibly not a person: hologram body (no skin tone), visor and halo, vest with a glyph badge and a tablet", `${holo}/${marker}/${outfit} of 3`);
  let home = 0; const spots = new Set();
  for (const a of FIX) {
    const s = world.state(a.id), c0 = SITE_XY[a.homeSite], d = Math.hypot(s.x - c0.x, s.z - c0.z);
    if (s.site === a.homeSite && d > rbData.RB_SSM.warn + 3 && d < 17 && s.visible) home += 1;
    spots.add(`${s.site}#${s.slot}`);
  }
  ok(home === 3 && spots.size === 3, "each stands at its home site, outside the warning zone, on its own spot", `${home}/3, ${spots.size} distinct spots`);
}

// ---------------------------------------------------------------- 3. the events, played in time: talk light and captions exact
{
  let t = 0; const dt = 0.05;
  const step = (n = 1) => { for (let i = 0; i < n; i++) { t += dt; world.animate(t, dt, null); sample(); } };
  const byKey = new Map(); // the state after everything at a timestamp has happened (an event at t is heard after the frame at t)
  function sample() { for (const a of FIX) { const s = world.state(a.id); byKey.set(`${a.id}@${t.toFixed(4)}`, { t, id: a.id, talk: s.talkVisible, cap: s.captionVisible, capText: s.caption }); } }
  world.animate(t, 0, null);
  const capAtStart = [];
  for (let i = 0; i < hive.events.length; i++) {
    const ev = hive.events[i];
    hive.play(i); sample();
    if (ev.type === "speak") { const s = world.state(ev.agent); capAtStart.push({ text: ev.text, queued: s.queued, captionNow: s.caption }); }
    step(i === 5 ? 4 : 14); // ~0.7 s between most events; the move gets 0.2 s before the next
  }
  step(900); // let every line and walk finish (45 s)
  const samples = [...byKey.values()];
  const log = world.talkLog(), caps = world.captionLog();
  const speaks = hive.events.filter((e) => e.type === "speak");
  ok(log.length === speaks.length, `every speak event became a line: ${log.length}/${speaks.length}`);
  // exactness: at every sample the light is on iff the sample time is inside one of that agent's windows
  let exact = 0;
  for (const w of log) {
    const mine = samples.filter((s) => s.id === w.agent);
    const inside = mine.filter((s) => s.t >= w.start && s.t < w.end), outsideAll = mine.filter((s) => !log.some((x) => x.agent === w.agent && s.t >= x.start && s.t < x.end));
    if (inside.length > 0 && inside.every((s) => s.talk) && outsideAll.every((s) => !s.talk) && Math.abs((w.end - w.start) * 1000 - AA.aaLineMs(w.text)) < 1) exact += 1;
  }
  ok(exact === speaks.length, `the talk light is on exactly during each speak event's window (sampled at 20 Hz): ${exact} of ${speaks.length}`);
  const overlapSelf = log.some((a, i) => log.some((b, j) => j > i && a.agent === b.agent && b.start < a.end - 1e-9));
  ok(!overlapSelf, "an agent never talks over itself (its lines queue end to start)");
  let bubbles = 0;
  for (const w of log) { const c = caps.find((x) => x.kind === "speak" && x.agent === w.agent && x.text === w.text && x.start === w.start && x.end === w.end); const seen = samples.some((s) => s.id === w.agent && s.t >= w.start && s.t < w.end && s.cap && s.capText === w.text); if (c && seen) bubbles += 1; }
  ok(bubbles === speaks.length, `a caption bubble shows each speak event's line above its figure: ${bubbles} of ${speaks.length}`);
  ok(samples.filter((s) => s.cap === false && s.capText).length === 0 && samples.every((s) => s.t < log[log.length - 1].end + 3 || (!s.talk && !s.cap)), "captions and lights clear when the lines are done");
  // the move: logistics walked from the port yard to the warehouse aisle (60 m) with property writes, and arrived on a free spot
  const s = world.state("fx-logistics"), wh = SITE_XY["rb-site-west-oakland-warehouse"];
  ok(s.site === "rb-site-west-oakland-warehouse" && !s.walking && Math.hypot(s.x - wh.x, s.z - wh.z) < 17, `move: logistics walked to the warehouse aisle and stands on spot ${s.slot}`);
  const spots = new Set(FIX.map((a) => world.state(a.id)).filter((x) => x.site === "rb-site-west-oakland-warehouse").map((x) => x.slot));
  ok(spots.size === 3, "three agents now share that site on three different spots");
  const gestures = hive.events.filter((e) => e.type === "refused" || e.type === "complete").length;
  ok(caps.some((c) => c.kind === "refused" && /Veto on j-0002/.test(c.text)), "refused: the veto's own text shows as a caption");
  ok(gestures === 2, "the fixture carries a refusal and a completion");
}

// ---------------------------------------------------------------- 4. walking, radii, gestures, reduced motion, off-map, tiers
{
  const p2 = new THREE.Group();
  const src = AA.aaEmitter();
  const w2 = AA.aaMountAgentAvatars({ three: THREE, parent: p2, agents: [FIX[2]], source: src, siteAt, reducedMotion: false });
  let t = 0; w2.animate(t, 0, null);
  const a0 = w2.state("fx-logistics");
  src.emit({ type: "move", agent: "fx-logistics", to: "rb-site-west-oakland-warehouse" });
  t += 5; w2.animate(t, 5, null);
  const mid = w2.state("fx-logistics"), g = w2.figure("fx-logistics");
  ok(mid.walking && mid.x !== a0.x && g.position.x === mid.x, `move walks: after 5 s at ${AA.AA_WALK_SPEED} m/s the figure is mid-way and its position is written`, `x ${a0.x.toFixed(1)} → ${mid.x.toFixed(1)}`);
  const frozen = g.position.x;
  t += 2; w2.animate(t, 2, [mid.x + AA.AA_ANIMATE_RADIUS + 50, mid.z]);
  ok(g.position.x === frozen && w2.state("fx-logistics").x !== frozen && g.visible, `beyond ${AA.AA_ANIMATE_RADIUS} m: no per-frame writes (the walk advances logically), still shown`);
  t += 1; w2.animate(t, 1, [mid.x + AA.AA_HIDE_RADIUS + 50, mid.z]);
  ok(!g.visible, `beyond ${AA.AA_HIDE_RADIUS} m: hidden`);
  t += 60; w2.animate(t, 60, null);
  ok(!w2.state("fx-logistics").walking && g.visible, "arrives and shows again within range");
  // gestures
  src.emit({ type: "refused", agent: "fx-logistics", reason: "speed over the site limit" });
  const ty0 = g.userData.parts.tablet.position.y; t += 0.1; w2.animate(t, 0.1, null);
  ok(w2.state("fx-logistics").gesture === "stop" && g.userData.parts.tablet.position.y > ty0 - 0.01 && g.userData.parts.tablet.rotation.x === 0, "refused: a calm stop gesture (the tablet raised, palm-out)");
  t += 2; w2.animate(t, 2, null);
  ok(w2.state("fx-logistics").gesture === null && g.userData.parts.tablet.rotation.x !== 0, "the stop gesture ends after its time");
  src.emit({ type: "complete", agent: "fx-logistics" }); t += 0.45; w2.animate(t, 0.45, null);
  ok(w2.state("fx-logistics").gesture === "nod" && Math.abs(g.userData.parts.head.rotation.x) > 0.2, "complete: a nod (the head dips)", `pitch ${g.userData.parts.head.rotation.x.toFixed(2)}`);
  t += 1; w2.animate(t, 1, null); ok(g.userData.parts.head.rotation.x === 0, "and comes back up");
  // a long move re-projects (jump): the agent does not walk across the map
  src.emit({ type: "move", agent: "fx-logistics", to: "rb-site-soma-robot-cell" });
  const far = w2.state("fx-logistics");
  ok(!far.walking && far.site === "rb-site-soma-robot-cell", `a move longer than ${AA.AA_WALK_MAX} m jumps (a software agent re-projects at the site)`);
  // off-map: a site this map does not hold hides the figure; coming back shows it
  src.emit({ type: "move", agent: "fx-logistics", to: "rb-site-nowhere" }); t += 0.1; w2.animate(t, 0.1, null);
  ok(!g.visible && w2.state("fx-logistics").offMap, "a site not on this map hides the figure");
  src.emit({ type: "move", agent: "fx-logistics", to: "rb-site-orleans-warehouse" }); t += 0.1; w2.animate(t, 0.1, null);
  ok(g.visible && !w2.state("fx-logistics").walking, "a move back onto this map shows it at once");
  // reduced motion
  const p3 = new THREE.Group(), s3 = AA.aaEmitter();
  const w3 = AA.aaMountAgentAvatars({ three: THREE, parent: p3, agents: [FIX[2]], source: s3, siteAt, reducedMotion: true });
  w3.animate(0, 0, null);
  s3.emit({ type: "move", agent: "fx-logistics", to: "rb-site-west-oakland-warehouse" });
  const r1 = w3.state("fx-logistics"), wh = SITE_XY["rb-site-west-oakland-warehouse"];
  s3.emit({ type: "speak", agent: "fx-logistics", text: "Arrived at the aisle." }); w3.animate(0.2, 0.2, null);
  s3.emit({ type: "complete", agent: "fx-logistics" }); w3.animate(0.5, 0.3, null);
  const r2 = w3.state("fx-logistics");
  ok(!r1.walking && Math.hypot(r1.x - wh.x, r1.z - wh.z) < 17, "reduced motion: no walking — the figure jumps to the site");
  ok(r2.captionVisible && r2.caption === "Arrived at the aisle." && r2.talkVisible && w3.figure("fx-logistics").userData.parts.head.rotation.x === 0, "reduced motion: the caption and the (still) talk light show; the nod holds still");
  // tiers: the phone tier builds nothing
  const p4 = new THREE.Group();
  const w4 = AA.aaMountAgentAvatars({ three: THREE, parent: p4, agents: FIX, source: AA.aaEmitter(), siteAt, tier: "low" });
  ok(w4.counts().figures === 0 && w4.counts().meshes === 0 && p4.children.length === 0 && w4.agents().length === 3, "phone tier: no figures, 0 meshes, 0 texture bytes (its budgets do not move); the state machine still runs");
  const wb = AA.aaMountAgentAvatars({ three: THREE, parent: new THREE.Group(), agents: FIX, siteAt, tier: "balanced" });
  ok(wb.counts().figures === 3, "balanced and high tiers build the figures");
  ok(world.counts().textureBytes <= 3 * AA.AA_TEXTURE_BYTES_PER_FIGURE, `texture bytes ≤ ${AA.AA_TEXTURE_BYTES_PER_FIGURE} per figure (label at mount, caption on first line)`, `${world.counts().textureBytes} B for 3 figures`);
  // the voice seam: an on-device voice can hold the light for the real utterance
  const s5 = AA.aaEmitter(), w5 = AA.aaMountAgentAvatars({ three: THREE, parent: new THREE.Group(), agents: [FIX[0]], source: s5, siteAt });
  w5.animate(0, 0, null); s5.emit({ type: "speak", agent: "fx-dispatcher", text: "Short." }); w5.talkStart("fx-dispatcher");
  w5.animate(5, 5, null); const held = w5.state("fx-dispatcher").talkVisible; w5.talkEnd("fx-dispatcher"); w5.animate(5.05, 0.05, null);
  ok(held && !w5.state("fx-dispatcher").talkVisible, "talkStart/talkEnd: a voice's onstart/onend hold the light for the utterance, then release it");
}

// ---------------------------------------------------------------- 5. seven roles (the hive's roster shape) + 4 VBRIDGE personas, and the site budgets
const ROLES7 = ["dispatcher", "safety steward", "maintenance planner", "consent keeper", "trainer", "auditor", "logistics"];
{
  const sites = rbData.RB_SITES.map((s) => s.id);
  const seven = ROLES7.map((r, i) => ({ id: `fx7-${r.replace(/ /g, "-")}`, name: `Fixture ${r}`, role: r, homeSite: sites[i % sites.length], avatar: { glyph: r.split(" ")[0], accent: 0x305070 + i * 0x101010, outfit: "agent" } }));
  const vbHome = sites[0];
  const all = [...seven, ...AA.aaVbridgeAgents(vbHome)];
  const p = new THREE.Group();
  const w = AA.aaMountAgentAvatars({ three: THREE, parent: p, agents: all, siteAt });
  const c = w.counts();
  const perSite = {}; for (const s of w.agents()) perSite[s.site] = (perSite[s.site] ?? 0) + 1;
  ok(c.figures === 11 && c.worstPerFigure <= AA.AA_AGENT_BUDGET, `embodied: ${seven.length} hive roles + ${AA.aaVbridgeAgents().length} VBRIDGE personas = ${c.figures} figures, worst ${c.worstPerFigure} meshes + sprites (≤ ${AA.AA_AGENT_BUDGET})`, `${c.meshes} meshes + ${c.sprites} sprites in all`);
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
  const agents = [...FIX, ...ROLES7.map((r, i) => ({ id: `fx7-${r}`, name: r, role: r, avatar: { accent: 0x305070 + i * 0x101010 } })), ...AP.AA_VBRIDGE_PERSONAS];
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
  const outfitSvg = AP.aaPortraitSvg(FIX[0], { kind: "portrait" });
  ok(/fill="#d8ff3a"/.test(outfitSvg) && /fill="#dfe8ee"/.test(outfitSvg) && /fill="#1d2a33"/.test(outfitSvg) && /fill="#0b1a24"/.test(outfitSvg), "the agent outfit set: high-visibility vest with bands and a glyph badge, tablet, visor");
  const calls = [];
  const raster = (svg, px) => { calls.push(px); return Promise.resolve(`data:image/png;base64,stub${px}`); };
  const u1 = await AP.aaPortraitPng(FIX[1], { size: 48, dpr: 2, raster });
  const u2 = await AP.aaPortraitPng(FIX[1], { size: 48, dpr: 2, raster });
  const u3 = await AP.aaPortraitPng(FIX[1], { size: 48, dpr: 1, raster });
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
  ok(read("tools/check_all.mjs").includes("check_agent_avatars.mjs") && /check_agent_avatars/.test(read("docs/perf/checkers-baseline.json")), "check_all.mjs lists this checker; checkers-baseline.json carries its estimated row");
}

// ---------------------------------------------------------------- the eval
console.log(`\n  eval: agents embodied 0 → ${3} fixture hive agents (contract-ready for 7: ${ROLES7.length} roles built) + ${AP.AA_VBRIDGE_PERSONAS.length} VBRIDGE personas; meshes + sprites per figure ≤ ${AA.AA_AGENT_BUDGET}; talk light exact and a caption per speak event (lines above)`);
console.log(failures ? `\n${failures} agent-avatar problem(s) found (${passes} passed).` : `\nAll ${passes} agent-avatar checks pass.`);
process.exit(failures ? 1 : 0);
