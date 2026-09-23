import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { disposeTree, decal, repaint, HUD, clamp, easeOut, celebrationBurst, GESTURE_HINTS } from "../../shared/kit.js";
import { Session, Progress, Sfx, UNIVERSAL_AWARDS } from "../../shared/game.js";
import { speak, speechSupported } from "../../shared/voice-assist.js";
import { TrainingRecords, toCSV, toXAPI, toOpenBadges, earnedCertifications, download } from "../../shared/records.js";
import {
  MASTERY, RUBRIC, COMPETENCIES, competencyStatus, newlyDemonstrated, transcript,
  toProofCSV, toCompetencyBadges, toCompetencyXAPI, standard, clockText as mmss,
} from "../../shared/competency.js";
import { Identity } from "../../shared/identity.js";
import { Lrs } from "../../shared/lrs.js";
import { RobotAgent, observe } from "../../shared/robot.js";
import { buildEmbodiment, observeEmbodied, probeSkill, DIFFICULTY_LADDER } from "../../shared/robot-embodiment.js";
import { Platform, FLOW_LOAD, FLOW_START, FLOW_RESUME, FLOW_STATE } from "../../shared/platform.js";

import { Perf } from "../../shared/perf.js";
import { createBroadcaster } from "../../shared/observer.js";
import { createFlowRunner, outcomeFromRecord, acknowledgedOutcome, parseFlowLink, nodeLabel } from "../../shared/flowhub.js";
import { createAnnouncer, createTargetCursor, describeTarget, reducedMotion, escapeHtml } from "../../shared/a11y.js";
import { createHandInput, HAND_HINTS } from "../../shared/hands.js";
import { buildStage } from "./stage.js";
import { buildHub } from "./hub.js";
import { SIMS_META } from "./sims-meta.js";
import { CURRICULA, allProgress, curriculumProgress } from "./curricula.js";
import { environmentFor, loadEnvironment } from "../../shared/environment.js";
import { WEATHER_KINDS } from "../../shared/weather.js";
import { detectDevice, applyProfile, weatherUnder, themeScene, describeDevice, DEVICES, PROFILES } from "../../shared/devices.js";
import { eiLine, CHECKIN_OPTIONS, checkInPrompt, recordCheckIn } from "../../shared/ei-guide.js";
import {
  createGamepad, describeGamepadMap, describeBindings, describeInputs,
  loadBindings, saveBindings, resetBindings, remapAction, actionForKey, keyToken, prettyKey,
  parseVoice, matchTargetName, INPUT_ACTIONS, KEYBOARD_PRESETS, PRESET_IDS, PAD_LABELS,
  VOICE_GRAMMAR, VOICE_HELP_LINE, CHECKIN_QUESTION, CHECKIN_REPLIES,
} from "../../shared/input.js";
import { CustomScenarios, buildCustomRoom, newScenarioId, estimateParSeconds } from "./scenarios.js";
import { createStore } from "./store.js";
import { mountUI, stripHtml, introMenu } from "./react-ui.js";

// The 20 sims are lazy-loaded: SIMS_META (see tools/gen_sims_meta.mjs) is the
// small, always-available metadata every display surface (hub kiosks,
// leaderboards, the tour, the editor's base-simulator picker) actually needs;
// a sim's real module — its steps, hazards and build() — is only fetched via
// loadSim() the moment a player actually enters it. This is why
// dist/smartcity-x.html ships as a folder (index.html + sims/ + citykit.js +
// gamify.js) rather than one self-contained file: see tools/bundle_webxr.py.
const SIMS_META_BY_ID = Object.fromEntries(SIMS_META.map((s) => [s.id, s]));
// The programme whose stations carry robot-training metadata — patient
// keep-out volumes, per-step force classes and the steps a robot must never
// perform. See WebXR/shared/robot-embodiment.js and docs/robot-training.md.
const ROBOT_PROGRAMME = "dental-hygiene-unspoken-smiles";
// Crew tags and custom-scenario names are learner-typed text that ends up
// inside HTML template strings (results card, leaderboards) rendered via
// react-ui.js's dangerouslySetInnerHTML — escape before interpolating so a
// tag like `<b>` typed as a crew name renders literally instead of as
// markup on a shared kiosk's next screen.
const AR_DIORAMA_SCALE = 0.34; // tabletop scale so a 2 m station fits on a desk

const simModuleCache = new Map();
function loadSim(id) {
  if (simModuleCache.has(id)) return simModuleCache.get(id);
  const exportName = `SIM_${id.toUpperCase().replace(/-/g, "_")}`;
  const promise = import(`./sims/${id}.js`).then((mod) => mod[exportName]);
  simModuleCache.set(id, promise);
  return promise;
}

// The 20 built-in stations plus whatever the learner has built in the
// scenario editor — the hub, the leaderboard and every sim lookup work off
// this combined roster so a custom drill is a first-class citizen everywhere
// a built-in one is, with zero special-casing downstream. This is metadata
// only (never a custom room's full steps/build) — see loadSim()/findSim()
// for what actually runs a station.
// Cached rather than rebuilt on every call: this is read on every HUD sync —
// several times a second during an active run with combos and streaks
// firing. Invalidated only where the roster can actually change: saving or
// deleting a custom scenario.
let allSimsCache = null;
function invalidateSimsCache() { allSimsCache = null; }
function customRoomMeta(entry) {
  const base = SIMS_META_BY_ID[entry.baseId];
  if (!base) return null;
  return {
    ...base,
    id: `custom:${entry.id}`,
    index: "★",
    domain: "Custom",
    name: entry.name,
    title: `${entry.name} — Custom Drill`,
    tagline: entry.tagline?.trim() || `A custom drill built from ${base.name}: ${entry.stepIds.length} of ${base.stepCount} steps.`,
    parSeconds: entry.parSeconds ?? estimateParSeconds(base.parSeconds, base.stepCount, entry.stepIds.length),
    isCustom: true,
    baseId: base.id,
    baseName: base.name,
  };
}
function allSims() {
  if (!allSimsCache) allSimsCache = [...SIMS_META, ...CustomScenarios.list().map(customRoomMeta).filter(Boolean)];
  return allSimsCache;
}
/** True the instant a real or custom sim COULD be entered, with no fetch —
 * used to decide hub-vs-enter before actually awaiting findSim(). */
function simExists(id) {
  if (SIMS_META_BY_ID[id]) return true;
  if (typeof id === "string" && id.startsWith("custom:")) {
    const entry = CustomScenarios.get(id.slice(7));
    return !!(entry && SIMS_META_BY_ID[entry.baseId]);
  }
  return false;
}
async function findSim(id) {
  if (SIMS_META_BY_ID[id]) return loadSim(id);
  if (typeof id === "string" && id.startsWith("custom:")) {
    const entry = CustomScenarios.get(id.slice(7));
    if (!entry) return null;
    const base = await loadSim(entry.baseId);
    if (!base) return null;
    return buildCustomRoom(base, entry);
  }
  return null;
}

Progress.load();

// Launch identity (an LMS/portal URL or an embedding page's postMessage)
// overrides the self-typed crew tag and locks the field: the record must be
// attributable to the person the host launched, not whatever got typed.
function identityLabel() {
  const id = Identity.current;
  if (!id) return "";
  const host = id.homePage ? ` · ${new URL(id.homePage).host}` : "";
  return `Launched as ${id.name}${id.id !== id.name ? ` (${id.id})` : ""}${host}`;
}
function applyIdentity() {
  const tag = Identity.tag();
  if (tag) Progress.setPlayerName(tag);
}
Identity.load();
applyIdentity();
Identity.listen(() => {
  applyIdentity();
  store.patch("intro", { playerName: Progress.playerName, identityLocked: true, identityLabel: identityLabel() });
});

// ------------------------------------------------------------------ renderer

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// The device in front of the learner's eye decides pixel ratio, shadows,
// weather, skyline, HUD scale and background: a monocular hardhat display
// and a see-through visor get a different run from a desktop (shared/devices.js).
// Both are `let`, not `const`: an instructor console can set the profile the
// next station runs under (CMD_PROFILE), which is the same call with a device
// taken from the table instead of from this browser.
let DEVICE = detectDevice();
let PROFILE = applyProfile(DEVICE, { renderer });
// Filmic tone mapping + correct sRGB output is a post-process color-grading
// step, not a lighting change — every prop's existing MeshStandardMaterial
// and every scene's existing light intensities stay exactly as tuned, but
// highlights roll off instead of clipping and colors read as real materials
// instead of flat, washed-out fills.
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.xr.enabled = true;
document.getElementById("stage").appendChild(renderer.domElement);

const scene = new THREE.Scene();
const rig = new THREE.Group();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.02, 90);
camera.position.set(0, 1.62, 0);
camera.rotation.order = "YXZ";
rig.add(camera);
scene.add(rig);

// The placement anchor: everything the learner sees hangs off this. In AR it is
// repositioned to the surface the learner taps; in VR/flat it stays at the origin
// of the digital-twin plaza built by stage.js.
const placement = new THREE.Group();
scene.add(placement);
const worldRoot = new THREE.Group();
placement.add(worldRoot);

// --------------------------------------------------------------- HUD binding
//
// app.js never touches the DOM directly for UI chrome any more — it writes
// state into this store, and react-ui.js (mounted near the bottom of this
// file) renders it. The Three.js scene, Session wiring and render loop below
// are otherwise unchanged.

const store = createStore({
  hud: {
    room: "SMARTCITI.X",
    step: "Choose a station",
    cue: "Select a kiosk to start that station's procedure and rank ladder.",
    gestureVerb: "", gestureVisible: false,
    score: "----", comboText: "", comboHot: false, comboFire: false,
    fillPct: 0, count: "0/20 CLEARED", timer: "",
    railState: "neutral", feedbackHtml: "Loading the training campus…",
    scorePops: [],
  },
  gestureTip: { html: "", show: false },
  arPrompt: { visible: false },
  scaleRow: { visible: false },
  intro: {
    visible: true,
    arDisabled: true, arText: "Enter AR",
    vrDisabled: true, vrText: "Enter VR",
    playerName: Progress.playerName === "YOU" ? "" : Progress.playerName,
    identityLocked: !!Identity.current, identityLabel: identityLabel(),
  },
  results: { visible: false, html: "", showNext: false, retryPrimary: true, nextLabel: "Next stop →" },
  // Flipped-classroom pre-brief: a station's steps and the reason for each,
  // shown before the first run of that station (see shared/game.js).
  prebrief: { visible: false, id: "", name: "", trade: "", category: "", tagline: "", certification: "", steps: [], hazardCount: 0 },
  // A flat briefing station (room.flat): dossier + knowledge check rendered as a
  // card instead of a walkable scene, scored by the same Session.
  flat: { visible: false, name: "", category: "", tagline: "", certification: "", dossier: [], stepIndex: 0, stepCount: 0, question: "", cue: "", options: [], picked: [], feedback: null },
  leaderboard: { visible: false, html: "" },
  records: {
    visible: false, tab: "attempts", rows: [], summary: [], total: 0, passes: 0, credentials: [],
    // The proof tier (shared/competency.js): competency cards, the transcript
    // and the rubric that explains why a run counted. `rule` and `rubric` are
    // static, carried in the slice so react-ui.js reads only the store.
    proof: {
      competencies: [], transcript: [], demonstrated: 0, consistent: 0,
      rule: MASTERY.text, rubric: RUBRIC.lines,
    },
    lrs: { configured: false, host: null, authed: false, pending: 0, last: null, endpointDraft: "", authDraft: "", busy: false, error: null },
  },
  programs: { visible: false, rows: [], assigned: null },
  // The dental programme's robot-training card: a headless calibration of
  // every station in the block, run in slices on this thread so the panel can
  // show the difficulty curve filling in rather than freezing until it is done.
  robotTraining: {
    programme: ROBOT_PROGRAMME, running: false, done: 0, total: 0, station: "", note: "",
    ladder: DIFFICULTY_LADDER, curve: [], stations: [],
  },
  // Flows: the host-orchestrated graphs (shared/flowhub.js). One row per
  // loaded flow, the node standing now and the path that got there.
  flows: { visible: false, rows: [], current: null, note: "", error: "" },
  editor: {
    visible: false,
    baseOptions: SIMS_META.map((s) => ({ id: s.id, label: `${s.name} — ${s.trade}` })),
    baseValue: "",
    stepsVisible: false,
    steps: [],
    name: "", par: "", tagline: "",
    error: "",
    library: [],
  },
  resetProgressText: "Reset progress",
  voice: { supported: !!(window.SpeechRecognition || window.webkitSpeechRecognition), listening: false, heard: "", error: "" },
  // The controls panel (shared/input.js): which tabs this device is offered,
  // the live keyboard bindings, whatever pad is plugged in, and the grammar.
  // `numbers` puts an index badge on every hub card and panel button, which a
  // voice-first monocular profile turns on by itself.
  controls: {
    visible: false, tab: "keyboard", tabs: ["keyboard", "gamepad", "voice"],
    deviceLine: "", inputSource: "profile", hands: false, voiceFirst: false,
    preset: "standard", presets: [], rows: [], remapping: null, remapNote: "",
    gamepad: { connected: false, id: "", vendor: "generic", vendorName: "Generic", mapping: "", buttons: [], axes: [] },
    padMap: [], grammar: [], heard: "",
    // A voice-first monocular display gets the numbers without being asked:
    // reading a number off a card is the only quick way to choose one there.
    numbers: PROFILE.id === "assisted",
  },
});
let vrHudDirty = true;

function setRail(kind, html) {
  store.patch("hud", { railState: kind, feedbackHtml: html });
  vrHudDirty = true;
}


// ---------------------------------------------------- interruption alarm
// An interruption arrives mid-step and runs on its own clock (see the
// interrupt layer in shared/game.js). It gets its own loud banner rather
// than the feedback rail, because the whole point is that it is not part of
// the step the learner is working on.
const alarmEl = {
  root: document.getElementById("alarm"),
  kind: document.getElementById("alarm-kind"),
  left: document.getElementById("alarm-left"),
  body: document.getElementById("alarm-body"),
  cue: document.getElementById("alarm-cue"),
  fill: document.getElementById("alarm-fill"),
};
function showAlarm(it) {
  if (!alarmEl.root) return;
  alarmEl.kind.textContent = it.kind ?? "Interruption";
  alarmEl.body.textContent = it.alert ?? "";
  alarmEl.cue.textContent = it.cue ?? "Deal with it now — the procedure can wait.";
  alarmEl.left.textContent = `${Math.ceil(it.seconds ?? 12)}s`;
  alarmEl.fill.style.width = "100%";
  alarmEl.root.hidden = false;
}
function hideAlarm() { if (alarmEl.root) alarmEl.root.hidden = true; }
function syncAlarm(s) {
  const it = s?.activeInterrupt;
  if (!it || !alarmEl.root || alarmEl.root.hidden) return;
  const total = it.seconds ?? 12;
  const left = Math.max(0, it.left ?? total);
  alarmEl.left.textContent = `${Math.ceil(left)}s`;
  alarmEl.fill.style.width = `${Math.max(0, (left / total) * 100).toFixed(1)}%`;
}

function syncHud() {
  const s = state.session;
  if (!s) {
    store.patch("hud", {
      room: "SMARTCITI.X",
      step: "Choose a station",
      cue: "Select a kiosk to start that station's procedure and rank ladder.",
      score: "----", comboText: `LV ${Progress.level} · ${Progress.levelName.toUpperCase()}`, comboHot: false, comboFire: false,
      count: `${Progress.roomsClearedIn(allSims().map((s) => s.id))}/${allSims().length} CLEARED`,
      fillPct: (Progress.roomsClearedIn(allSims().map((s) => s.id)) / allSims().length) * 100,
      timer: "",
      gestureVisible: false,
    });
    vrHudDirty = true;
    return;
  }
  const rank = Progress.simRank(s.room.id, s.room.game);
  const secs = Math.floor(s.elapsed);
  const patch = {
    room: state.tour ? `TOUR ${state.tour.i + 1}/${SIMS_META.length} · ${s.room.title.toUpperCase()}` : s.room.title.toUpperCase(),
    score: String(Math.round(s.score)).padStart(4, "0"),
    comboText: s.comboLabel ? `${s.comboLabel.toUpperCase()} ×${s.combo.toFixed(1)}` : rank.name,
    comboHot: s.streak >= 4,
    comboFire: s.combo >= 1.8,
    count: `STEP ${Math.min(s.index + 1, s.steps.length)}/${s.steps.length}`,
    fillPct: s.progress01 * 100,
    timer: `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} / ${
      String(Math.floor(s.room.parSeconds / 60)).padStart(2, "0")}:${String(s.room.parSeconds % 60).padStart(2, "0")}`,
  };
  const step = s.step;
  if (step) {
    let cue = step.cue;
    if (step.kind === "sequence" || step.kind === "find") cue += `  (${s.sequence.length}/${step.targets.length})`;
    if (step.kind === "hold" || step.kind === "track") cue += `  (${s.holdFor.toFixed(1)}s / ${step.seconds}s)`;
    if (step.kind === "turn" && s.turn) cue += `  (${Math.round((s.turn.amount / s.turn.required) * 100)}%)`;
    const hint = GESTURE_HINTS[step.kind];
    patch.step = step.title;
    patch.cue = cue;
    patch.gestureVerb = hint?.verb ?? "";
    patch.gestureVisible = !!hint;
  }
  store.patch("hud", patch);
  vrHudDirty = true;
}

// ------------------------------------------------------------- world objects

const state = {
  mode: "flat",          // "ar" | "vr" | "flat"
  roomRoot: null,
  api: null,
  room: null,
  session: null,
  hits: {},
  selectables: [],
  hovered: null,
  paused: true,
  placed: false,          // AR: has the learner tapped a surface yet
  stage: null,
  tour: null,             // { i } while walking the built-in curriculum in order
};

const hint = new THREE.Group();
const hintRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.42, 0.022, 8, 36),
  new THREE.MeshBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.85 }));
hintRing.rotation.x = -Math.PI / 2;
hint.add(hintRing);
const hintPip = new THREE.Mesh(new THREE.OctahedronGeometry(0.07), new THREE.MeshBasicMaterial({ color: 0x4fd1ff }));
hint.add(hintPip);
hint.visible = false;
worldRoot.add(hint);
const hintTargets = [];

const gauge = new THREE.Group();
gauge.visible = false;
const gaugePanel = decal(gauge, 0.62, 0.2, 0, 0, 0, () => {}, { px: 512, glow: true, ei: 0.5 });
const gaugeReadout = decal(gauge, 0.28, 0.09, 0, 0.16, 0.002, () => {}, { px: 256, glow: true, ei: 0.7 });
const gaugeMarker = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.014), new THREE.MeshBasicMaterial({ color: 0xffffff }));
gaugeMarker.position.z = 0.006;
gauge.add(gaugeMarker);
worldRoot.add(gauge);
let gaugeReadoutAt = 0;

// A hot-streak or a satisfying carry/turn completion gets a one-shot particle
// burst right where the learner's hands are — anchored to worldRoot so a
// world position just needs converting into its local space to fire it.
const burst = celebrationBurst(worldRoot, { color: 0xffe37a });
let lastActivatedId = null;
function burstAtHit(id) {
  const obj = id && state.hits[id];
  if (!obj) return;
  const p = new THREE.Vector3();
  obj.getWorldPosition(p);
  worldRoot.worldToLocal(p);
  burst.fire(p);
}

// One-time, just-in-time teaching: the first time a learner's own play
// history ever reaches a given step kind, explain the physical gesture it
// wants — after that it never interrupts again, trusting the HUD gesture
// chip (and by then, muscle memory) to carry it.
const GESTURE_SEEN_KEY = "smartcity-gestures-seen";
let gestureTipTimer = null;
function hasSeenGesture(kind) {
  try { return JSON.parse(localStorage.getItem(GESTURE_SEEN_KEY) || "[]").includes(kind); }
  catch (_) { return true; } // if storage is blocked, don't nag every single step
}
function markGestureSeen(kind) {
  try {
    const seen = new Set(JSON.parse(localStorage.getItem(GESTURE_SEEN_KEY) || "[]"));
    seen.add(kind);
    localStorage.setItem(GESTURE_SEEN_KEY, JSON.stringify([...seen]));
  } catch (_) { /* ignore */ }
}
function maybeShowGestureTip(kind) {
  const hint = GESTURE_HINTS[kind];
  if (!hint || hasSeenGesture(kind)) return;
  markGestureSeen(kind);
  store.patch("gestureTip", { html: `<b>${hint.verb}</b><br>${hint.tip}`, show: true });
  clearTimeout(gestureTipTimer);
  gestureTipTimer = setTimeout(() => store.patch("gestureTip", { show: false }), 5200);
}

function paintGaugeBand(step) {
  const [lo, hi] = step.gauge.green ?? [0.44, 0.62];
  repaint(gaugePanel, (g, w, h) => {
    g.fillStyle = "rgba(6,14,20,0.94)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = HUD.edge; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
    g.fillStyle = HUD.muted;
    g.font = `600 ${Math.round(h * 0.17)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(step.gauge.label ?? "SET THE VALUE", w * 0.05, h * 0.2);
    const barY = h * 0.5, barH = h * 0.3, x0 = w * 0.05, x1 = w * 0.95;
    g.fillStyle = "#1d2833"; g.fillRect(x0, barY - barH / 2, x1 - x0, barH);
    g.fillStyle = "rgba(89,201,123,0.85)";
    g.fillRect(x0 + (x1 - x0) * lo, barY - barH / 2, (x1 - x0) * (hi - lo), barH);
    g.strokeStyle = HUD.good; g.lineWidth = 2;
    g.strokeRect(x0 + (x1 - x0) * lo, barY - barH / 2, (x1 - x0) * (hi - lo), barH);
    g.fillStyle = HUD.muted;
    g.font = `${Math.round(h * 0.14)}px Arial, sans-serif`;
    g.textAlign = "center";
    g.fillText("select to commit", w / 2, h * 0.87);
  });
}
function placeGauge(targetObj) {
  if (!targetObj) return;
  const boxHelper = new THREE.Box3().setFromObject(targetObj);
  const c = boxHelper.getCenter(new THREE.Vector3());
  gauge.position.set(c.x, Math.min(Math.max(boxHelper.max.y + 0.3, 1.0), 2.0), c.z);
}

// ------------------------------------------------------------ scene lifecycle

function clearRoom() {
  stopRobot();
  if (state.roomRoot) { disposeTree(state.roomRoot); state.roomRoot = null; }
  if (state.stage) { disposeTree(state.stage.root); state.stage = null; }
  state.api = null;
  state.hits = {};
  state.selectables = [];
  state.hovered = null;
  hint.visible = false;
  gauge.visible = false;
  store.patch("flat", { visible: false });
}

function collectSelectables() {
  state.selectables = [];
  for (const id of Object.keys(state.hits)) {
    state.hits[id].traverse((o) => { if (o.isMesh) state.selectables.push(o); });
  }
}

function resetPlacement() {
  placement.position.set(0, 0, 0);
  placement.quaternion.identity();
  placement.scale.setScalar(state.mode === "ar" ? AR_DIORAMA_SCALE : 1);
  state.placed = state.mode !== "ar";
}

function enterHub() {
  clearRoom();
  state.session = null;
  state.room = null;
  const stage = buildStage(worldRoot, state.mode, scene);
  state.stage = stage;
  const root = new THREE.Group();
  worldRoot.add(root);
  state.roomRoot = root;
  state.api = buildHub(root, allSims());
  state.hits = state.api.hits;
  collectSelectables();
  resetPlacement();
  if (state.mode !== "ar") { rig.position.set(0.4, 0, 4.9); rig.rotation.y = 0; }
  else { rig.position.set(0, 0, 0); }
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  store.patch("arPrompt", { visible: state.mode === "ar" });
  store.patch("scaleRow", { visible: state.mode === "ar" });
  setRail("neutral", `<b>SmartCiti.X training campus.</b> ${allSims().length} stations across ${categoryCount()} categories, each with its own rank ladder. Select a kiosk to begin.${PROFILE.id === "desktop" ? "" : ` <span class="muted">Device: ${escapeHtml(describeDevice(DEVICE, PROFILE))}</span>`}`);
  syncHud();
}

// Bumped on every call so a station whose dynamic import is still in flight
// can tell, once it resolves, whether it is still the one the player wants —
// two quick kiosk picks in a row must not race and land in the wrong room.
let enterSimToken = 0;
async function enterSim(id, { briefed = false } = {}) {
  const myToken = ++enterSimToken;
  setRail("neutral", "<b>Loading station…</b>");
  const room = await findSim(id);
  if (myToken !== enterSimToken) return; // superseded by a later pick
  if (!room) { enterHub(); return; }
  const flat = !!(room.flat ?? SIMS_META_BY_ID[room.baseId]?.flat);
  if (flat && state.mode !== "flat") {
    // A dossier card cannot be shown inside an immersive session; say so
    // instead of dropping the learner into an empty scene.
    setRail("warn", `<b>${escapeHtml(room.name ?? room.title)}</b> is a flat briefing station — it runs on screen, not in AR/VR. Exit the headset view to open it.`);
    return;
  }
  // First run of a station on screen: offer the pre-brief before anything
  // is built, so the timer isn't running while the learner reads. A robot
  // trainee has no brief to read.
  if (!briefed && !flat && !robot.active && state.mode === "flat" && !Progress.isBriefed(room.id)) { showPreBrief(room); return; }
  clearRoom();
  // A station stands in its category's district unless it names another:
  // a marsh crew is filed under Water & Environmental, whose horizon is a
  // treatment works, and belongs in front of the bay instead.
  // A licensed real-world model around the station, when the station (or the
  // URL, for a preview) asks for one, replaces the generated horizon; a
  // device profile that cannot carry the horizon leaves it out too.
  // An instructor console can set the run profile and the weather for the next
  // station (CMD_PROFILE / CMD_WEATHER in shared/observer.js). Both land here,
  // where the stage is built, so the learner sees the change the moment they
  // walk in rather than on some later reload.
  if (instructorDeviceId) {
    const device = deviceForInstructor(instructorDeviceId);
    if (device) { DEVICE = device; PROFILE = applyProfile(DEVICE, { renderer }); }
  }
  const stationWeather = instructorWeather ?? room.weather;
  coachedHazards.clear();
  const envSpec = state.mode !== "ar" ? environmentFor(room) : null;
  const horizon = { skyline: PROFILE.skyline && (envSpec ? !!envSpec.skyline : true), district: PROFILE.skyline && (envSpec ? !!envSpec.district : true) };
  const stage = buildStage(worldRoot, state.mode, scene, room.accent, room.district ?? room.category, weatherUnder(PROFILE, stationWeather), room.indoor, horizon);
  state.stage = stage;
  if (state.mode !== "ar") themeScene(PROFILE, scene, stage.root, THREE);
  // The model arrives after the station is playable; a failure is reported
  // on the rail and the station plays on.
  if (envSpec) {
    loadEnvironment(stage.root, envSpec, stage)
      .then(() => setRail("ok", `Environment loaded: <b>${escapeHtml(envSpec.url)}</b>`))
      .catch((e) => { console.warn("[environment]", e); setRail("warn", escapeHtml(e.message)); });
  }
  Perf.reset();
  const root = new THREE.Group();
  worldRoot.add(root);
  state.roomRoot = root;
  state.room = room;
  state.api = room.build(root);
  state.hits = state.api.hits;
  collectSelectables();
  resetPlacement();
  if (flat) {
    hint.visible = false; gauge.visible = false;
    store.patch("flat", {
      visible: true, name: room.name ?? room.title, category: room.category ?? "", tagline: room.tagline ?? "",
      certification: room.certification ?? "", dossier: room.dossier ?? SIMS_META_BY_ID[room.baseId]?.dossier ?? [],
      stepIndex: 0, stepCount: room.steps.length, question: "", cue: "", options: [], picked: [], feedback: null,
    });
  }

  if (state.mode !== "ar") {
    // A shift starts at the gate, not standing on the work. The stage says
    // where that is — outside the site apron for an outdoor station, at the
    // door for an indoor one (see apron.js and interiors.js).
    const spawn = stage.spawn ?? { x: 0, z: (room.footprint ?? 2) + 1.4, ry: 0 };
    rig.position.set(spawn.x, 0, spawn.z);
    rig.rotation.y = spawn.ry ?? 0;
  } else {
    rig.position.set(0, 0, 0);
  }
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  document.documentElement.style.setProperty("--accent", room.accentCss);
  store.patch("arPrompt", { visible: state.mode === "ar" });
  store.patch("scaleRow", { visible: state.mode === "ar" });

  state.session = new Session(room, {
    onStep: (step, s) => {
      state.api.onStep?.(step, s);
      // A new step means a new set of controls; re-point the keyboard cursor
      // and read the step out for anyone not watching the screen.
      kbCursor.set(targetsForStep(step));
      kbCarrying = null;
      srAnnouncer.say(`Step ${(s.index | 0) + 1} of ${s.steps.length}. ${step.title}. ${step.cue}`);
      if (kbActive && kbCursor.current) kbFocus(kbCursor.current, { announceIt: false });
      if (flat) { flatSyncStep(step, s); syncHud(); return; }
      updateHintForStep(step);
      if (step.kind === "gauge") { paintGaugeBand(step); placeGauge(state.hits[step.target]); gauge.visible = true; }
      else gauge.visible = false;
      maybeShowGestureTip(step.kind);
      syncHud();
    },
    onFeedback: (fb, s) => {
      state.api.onFeedback?.(fb, s);
      setRail(fb.kind === "ok" ? "ok" : fb.kind === "danger" ? "danger" : fb.kind === "partial" ? "neutral" : "warn", fb.text);
      if (fb.kind === "danger") { flashDanger(); srAnnouncer.alert(fb.text); if (fb.speech) announce(fb.speech); }
      if (fb.kind === "ok" && fb.points) {
        scorePop(`+${fb.points}`, fb.combo >= 1.6);
        if (fb.combo >= 1.6 && !flat && !reducedMotion()) burstAtHit(lastActivatedId);
      }
      if (flat) store.patch("flat", { feedback: { kind: fb.kind, html: fb.text }, picked: [...s.sequence] });
      syncHud();
    },
    onStepComplete: (step, s) => {
      state.api.onStepComplete?.(step, s);
      observer.step({ stepId: step.id, stepTitle: step.title, ...observerSnapshot() });
      Platform.progress({ sim: room.id, step: step.id, index: s.index + 1, count: s.steps.length, score: s.score, errors: s.errors });
    },
    onInterrupt: (it) => {
      // The station makes it visible in the world: a fan that stops, a lock
      // that is gone off the hasp. An alarm you can only read is a caption.
      state.api?.onInterrupt?.(it, state.session);
      showAlarm(it);
      srAnnouncer.alert(`${it.kind ?? "Interruption"}. ${it.alert}`);
      announce(`${it.kind ?? "Interruption"}. ${it.alert}`);
      flashDanger();
      kbCursor.set(targetsForStep({ target: it.target }));
      observer.hazard({ hazardId: it.id, note: it.alert ?? "", ...observerSnapshot() });
    },
    onInterruptEnd: (it) => {
      state.api?.onInterruptEnd?.(it, state.session); hideAlarm(); kbCursor.set(targetsForStep(state.session?.step ?? {}));
      // The guide speaks to a missed or mis-answered interruption the way a
      // peer-support trainer would: what happened, what wins next time, no
      // blame. An answered one needs nothing said — the scene already showed it.
      if (it.resolved === "missed" || it.resolved === "wrong") {
        const line = eiLine(it.resolved, { kind: it.kind, seed: state.session?.interruptLog?.length ?? 0 });
        setRail("warn", line);
        announce(line);
      }
    },
    onHazard: (hitId, s) => {
      state.api.onHazard?.(hitId, s);
      // Coaching mode (CMD_HAZARD_MODE): the unsafe action is still explained —
      // the station's own call-out already ran — but it is taken back off the
      // unsafe count, so the run can still end as a pass and the learner works
      // on through it. The same hazard twice is explained once.
      if (hazardMode === "coach") {
        s.hazardHits = Math.max(0, (s.hazardHits | 0) - 1);
        s.stepHazards = Math.max(0, (s.stepHazards | 0) - 1);
        const firstTime = !coachedHazards.has(hitId);
        coachedHazards.add(hitId);
        if (firstTime) {
          setRail("warn", `<b>Coaching:</b> ${escapeHtml(room.hazards?.[hitId] ?? "that is the unsafe way to do it")} <span class="muted">Not counted against this run.</span>`);
          announce(`Coaching. ${room.hazards?.[hitId] ?? "That is the unsafe way to do it."} Not counted against this run.`);
        }
      }
      observer.hazard({ hazardId: hitId, note: room.hazards?.[hitId] ?? "", ...observerSnapshot() });
      // The hazard text itself is spoken by the station's own call-out; the
      // guide adds its line after the first repeat, when the setup — not the
      // hands — is usually what is wrong.
      const count = s.hazardHits | 0;
      if (count >= 2) announce(eiLine("hazard", { count, seed: count }));
      else setRail("warn", eiLine("hazard", { count: 1, seed: s.errors | 0 }));
    },
    onFinish: (s, summary) => {
      observer.finish({
        passed: s.stars >= 2 && s.hazardHits === 0, stars: s.stars | 0, score: s.score | 0,
        seconds: Math.round(s.elapsed ?? 0),
        verdict: s.hazardHits > 0 ? `${s.hazardHits} unsafe action${s.hazardHits === 1 ? "" : "s"}` : `${s.stars} star${s.stars === 1 ? "" : "s"}, clean`,
      });
      showResults(s, summary);
    },
  });
  state.session.start();
  if (robot.active) startRobot(room);
  if (!flat) faceFirstTask();
  // Conditions are part of the brief: every station declares the weather its
  // procedure is actually written for, and what that weather means for the work.
  const wx = state.stage?.weather;
  const wxLine = wx && wx.kind !== "clear" ? ` <b>${escapeHtml(wx.label)}:</b> ${escapeHtml(wx.note)}` : "";
  observer.hello({ learner: Progress.playerName, station: room.id, stationName: room.name ?? room.title });
  setRail("neutral", `<b>${escapeHtml(room.title)}</b> — ${escapeHtml(room.tagline)}. ${state.mode === "ar" ? "Tap a surface to place the station." : "Follow the procedure in order."}${wxLine}`);
  syncHud();
}

function faceFirstTask() {
  if (state.mode === "ar") return;
  const first = hintTargets[0];
  if (!first) return;
  const p = new THREE.Vector3();
  first.getWorldPosition(p);
  const dx = p.x - rig.position.x, dz = p.z - rig.position.z;
  if (Math.hypot(dx, dz) < 0.2) return;
  rig.rotation.y = Math.atan2(-dx, -dz);
}

function updateHintForStep(step) {
  hintTargets.length = 0;
  // A "find" step marked noHint is a search-among-decoys exercise (GESTURE_HINTS.find
  // literally tells the learner "some objects are decoys") — ringing the correct
  // targets would hand over the answer, so it gets no objective ring at all.
  if (!step || (step.kind === "find" && step.noHint)) { hint.visible = false; return; }
  const ids = step.kind === "sequence" || step.kind === "find" ? step.targets : [step.target];
  for (const id of ids) if (state.hits[id]) hintTargets.push(state.hits[id]);
  hint.visible = hintTargets.length > 0;
}

function flashDanger() {
  document.body.classList.add("danger-flash");
  setTimeout(() => document.body.classList.remove("danger-flash"), 420);
}

// ------------------------------------------------------------------- results

/** The step-by-step review under the score: where the run went slow, and
 *  where it went wrong. Built from the session's own step log, so it says
 *  the same thing the exported record and the xAPI statement say. */
function renderDebrief(s) {
  const d = s.debrief();
  if (!d.steps.length) return "";
  const worst = d.steps.reduce((m, st) => Math.max(m, st.seconds), 0) || 1;
  const rows = d.steps.map((st, i) => {
    const bar = Math.max(4, Math.round((st.seconds / worst) * 100));
    const tone = st.hazards ? "bad" : st.corrections ? "warn" : "ok";
    const note = st.hazards
      ? `${st.hazards} unsafe`
      : st.corrections ? `${st.corrections} correction${st.corrections === 1 ? "" : "s"}` : "clean";
    return `<li class="db-row ${tone}">
      <span class="db-n">${i + 1}</span>
      <span class="db-title">${escapeHtml(st.title)}</span>
      <span class="db-bar"><i style="width:${bar}%"></i></span>
      <span class="db-time">${st.seconds.toFixed(1)}s</span>
      <span class="db-note">${note}</span>
    </li>`;
  }).join("");
  const head = `${d.cleanSteps} of ${d.totalSteps} steps clean · median ${d.medianSeconds.toFixed(1)}s`;
  const slow = d.slowest ? `<p class="res-note">Longest step: <b>${escapeHtml(d.slowest.title)}</b> at ${d.slowest.seconds.toFixed(1)}s.</p>` : "";
  const bad = d.worst ? `<p class="res-note">Most trouble: <b>${escapeHtml(d.worst.title)}</b> — ${d.worst.hazards ? `${d.worst.hazards} unsafe action${d.worst.hazards === 1 ? "" : "s"}` : `${d.worst.corrections} correction${d.worst.corrections === 1 ? "" : "s"}`}.</p>` : "";
  // Interruptions get their own lines: they are the part of the run that was
  // not on the procedure, and how long you took to notice is the whole score.
  const iv = d.interrupts;
  const ivRows = iv ? iv.log.map((l) => {
    const tone = l.outcome === "answered" ? "ok" : "bad";
    const label = l.outcome === "answered" ? `caught in ${l.seconds.toFixed(1)}s`
      : l.outcome === "wrong" ? "wrong response" : "missed it";
    return `<li class="db-row ${tone}">
      <span class="db-n">!</span>
      <span class="db-title">${escapeHtml(l.alert ?? l.id)}</span>
      <span class="db-note">${label}</span>
    </li>`;
  }).join("") : "";
  const ivBlock = iv ? `<p class="res-note"><b>Interruptions:</b> ${iv.answered} of ${iv.total} caught${iv.missed ? `, ${iv.missed} missed` : ""}${iv.wrong ? `, ${iv.wrong} answered wrong` : ""}.</p>
    <ol class="db-list">${ivRows}</ol>` : "";
  return `<details class="debrief" open>
    <summary>Step-by-step debrief — ${head}</summary>
    <ol class="db-list">${rows}</ol>${slow}${bad}${ivBlock}
  </details>`;
}

function showResults(s, summary) {
  const room = s.room;
  const rank = Progress.simRank(room.id, room.game);
  const stars = "★★★".slice(0, s.stars) + "☆☆☆".slice(0, 3 - s.stars);
  const mins = Math.floor(s.elapsed / 60), secs = Math.round(s.elapsed % 60);
  const earnedNames = s.earned
    .map((id) => [...(room.game?.badges ?? []), ...(room.game?.challenges ?? []), ...UNIVERSAL_AWARDS].find((a) => a.id === id))
    .filter(Boolean);
  const bodyHtml = `
    ${s.leveledUp ? `<div class="rank-up">LEVEL UP — ${escapeHtml(s.levelName.toUpperCase())} (LEVEL ${s.level})</div>` : ""}
    ${s.rankedUp ? `<div class="rank-up">RANK UP — ${escapeHtml(rank.name.toUpperCase())}</div>` : ""}
    <div class="res-stars">${stars}</div>
    <h2>${escapeHtml(room.title)}</h2>
    <p class="res-trade">${escapeHtml(room.game?.system ?? "")} · ${escapeHtml(rank.name)}</p>
    <dl class="res-grid">
      <div><dt>Score</dt><dd>${s.score}</dd></div>
      <div><dt>Time</dt><dd>${mins}:${String(secs).padStart(2, "0")}</dd></div>
      <div><dt>Errors</dt><dd>${s.errors}</dd></div>
      <div><dt>${room.game?.currency ?? "XP"}</dt><dd>${rank.xp}</dd></div>
      <div><dt>Personal best</dt><dd>${summary.best}</dd></div>
      <div><dt>Best combo</dt><dd>×${s.peakCombo.toFixed(1)}</dd></div>
      ${s.preparedBonus ? `<div><dt>Prepared bonus</dt><dd>+${s.preparedBonus}</dd></div>` : ""}
    </dl>
    ${earnedNames.length ? `<div class="res-badges">${earnedNames.map((a) =>
      `<p class="res-badge"><b>${a.name}</b><span>${a.note}</span></p>`).join("")}</div>` : ""}
    <p class="res-note">${s.errors === 0
      ? "Clean run: every control taken in order, no unsafe action."
      : `${s.errors} correction${s.errors === 1 ? "" : "s"} — re-run for a cleaner pass.`}</p>
    ${s.leaderboard?.madeBoard
      ? `<p class="res-note"><b>New #${s.leaderboard.rank} on the local leaderboard</b> for ${escapeHtml(room.title)}, crew tag ${escapeHtml(Progress.playerName)}.</p>`
      : ""}
    ${renderDebrief(s)}
    ${renderCheckIn(s)}
    ${state.tour ? renderTourFooter() : ""}`;
  // Where the learner stood on every competency BEFORE this run, so a
  // competency this run just earned can be told apart from one they already
  // had (see shared/competency.js and the Proof tab).
  const competencyBefore = competencyStatus(TrainingRecords.list());
  // The auditable record of this attempt — separate from the gamified
  // Progress profile, exportable as CSV or xAPI from the Training Records
  // overlay. Custom scenarios record under their base station's category.
  const attempt = TrainingRecords.record({
    app: "smartcity", learner: Progress.playerName,
    learnerName: Identity.current?.name, learnerId: Identity.current?.id, homePage: Identity.current?.homePage,
    simId: room.id, simName: room.name ?? room.title, category: room.category ?? SIMS_META_BY_ID[room.baseId]?.category,
    trade: room.trade, certification: room.certification ?? SIMS_META_BY_ID[room.baseId]?.certification,
    system: room.game?.system,
    score: s.score, stars: s.stars, errors: s.errors, hazardHits: s.hazardHits, holdBreaks: s.holdBreaks,
    seconds: Math.round(s.elapsed), parSeconds: room.parSeconds,
    badges: earnedNames.map((a) => a.name), level: s.level, levelName: s.levelName,
    debrief: s.debrief(),
    // Every instructor command this attempt answered, in order. An attempt
    // driven from a console is auditable as such: what was sent, when, and
    // with what detail (see shared/observer.js, docs/instructor-console.md).
    instructorActions: [...instructorActions],
    hazardMode,
  });
  instructorActions = [];
  // Hand the attempt to the hosting LMS page, if there is one and it told
  // us who the learner is — only ever to that origin (see identity.js).
  Identity.emit("smartcitix:record", { record: attempt });
  Perf.logRun({ app: "smartcity", simId: room.id, mode: state.mode, presenting: renderer.xr.isPresenting, seconds: Math.round(s.elapsed) });
  // A passing run on a station with a real certification is a portable
  // credential: hand the Open Badges assertion to the host ecosystem too.
  if (attempt.passed && attempt.certification) Identity.emit("smartcitix:credential", { assertion: toOpenBadges([attempt], xapiOpts())[0] });
  shipToLrs([attempt]);
  announceNewCompetencies(competencyBefore);
  renderPrograms();
  // A flow standing on this station moves now, on the same verdict the record
  // carries — a flow never scores anything of its own. The run moves and the
  // host hears the transition immediately; the next node is not opened over the
  // top of the results card, it waits for "Next stop" or the panel's Continue.
  flowOnAttempt(attempt);
  const touring = !!state.tour;
  const tourDone = touring && state.tour.i + 1 >= SIMS_META.length;
  store.patch("results", {
    visible: true,
    html: bodyHtml,
    // The flow's next node is offered on the same button the guided tour uses:
    // the learner reads the verdict, then goes on when they are ready.
    showNext: (touring && !tourDone) || flowPending,
    retryPrimary: !flowPending && (!touring || tourDone),
    nextLabel: flowPending ? `Continue the flow → ${flowNextLabel()}` : "Next stop →",
  });
  state.paused = true;
  announce(`${room.title} complete. ${s.stars} star${s.stars === 1 ? "" : "s"}.` +
    (s.leveledUp ? ` Level up — ${s.levelName}, level ${s.level}.` : "") +
    (s.rankedUp ? ` Rank up — ${rank.name}.` : "") +
    (earnedNames.length ? ` ${earnedNames.map((a) => a.name).join(", ")} earned.` : "") +
    (s.leaderboard?.madeBoard ? ` New number ${s.leaderboard.rank} on the local leaderboard.` : ""));
}

/** The guide's closing line and the end-of-run check-in. The check-in is
 * never scored and never leaves the learner's browser; a rough run (a hazard
 * hit or a missed interruption) adds the pointer to real peer support. */
function renderCheckIn(s) {
  const missed = s.interruptLog?.some((l) => l.outcome === "missed") ?? false;
  const rough = (s.hazardHits | 0) > 0 || missed;
  const support = s.room.supportLine ?? SIMS_META_BY_ID[s.room.baseId ?? s.room.id]?.supportLine;
  return `
    <p class="res-note res-guide">${escapeHtml(eiLine("finish", { clean: !rough }))}</p>
    <div class="res-checkin" data-rough="${rough ? 1 : 0}">
      <p class="res-checkin-q">${escapeHtml(checkInPrompt({ rough, supportLine: support }))}</p>
      <div class="res-checkin-row">${CHECKIN_OPTIONS.map((o) =>
        `<button type="button" data-checkin="${o.id}" data-sim="${escapeHtml(s.room.id)}">${escapeHtml(o.label)}</button>`).join("")}</div>
      <p class="res-checkin-reply" aria-live="polite"></p>
    </div>`;
}

// The results card is plain HTML inside the React overlay, so the check-in
// buttons are handled by delegation; one answer per card, remembered locally.
addEventListener("click", (e) => {
  const btn = e.target?.closest?.("#results-body [data-checkin]");
  if (!btn) return;
  const opt = CHECKIN_OPTIONS.find((o) => o.id === btn.dataset.checkin);
  if (!opt) return;
  const box = btn.closest(".res-checkin");
  recordCheckIn({ simId: btn.dataset.sim, choice: opt.id, rough: box?.dataset.rough === "1" });
  for (const b of box.querySelectorAll("[data-checkin]")) { b.disabled = true; b.classList.toggle("picked", b === btn); }
  const reply = box.querySelector(".res-checkin-reply");
  if (reply) reply.textContent = opt.reply;
  announce(opt.reply);
});

/** Progress line shown on the results card while a guided tour is running. */
function renderTourFooter() {
  const done = state.tour.i + 1;
  const tourDone = done >= SIMS_META.length;
  return `<p class="res-note" style="color:var(--accent) !important">${
    tourDone
      ? `<b>That's all ${SIMS_META.length} stations.</b> The guided tour ends here — nice work.`
      : `<b>Guided tour: stop ${done} of ${SIMS_META.length} complete.</b> Next up: ${SIMS_META[done].name}.`
  }</p>`;
}

// ----------------------------------------------------------------- leaderboards

function renderLeaderboards() {
  const roster = allSims();
  const standing = Progress.suiteStanding(roster.map((s) => s.id));
  const cards = roster.map((room) => {
    const board = Progress.leaderboard(room.id);
    const rows = board.length
      ? `<table class="lb-table"><thead><tr><th>#</th><th>Crew</th><th>Score</th><th>Stars</th></tr></thead><tbody>${
          board.map((e, i) => `<tr class="${e.name === Progress.playerName ? "me" : ""}">
            <td>${i + 1}</td><td>${escapeHtml(e.name)}</td><td>${e.score}</td><td>${"★".repeat(e.stars)}</td></tr>`).join("")}
        </tbody></table>`
      : `<p class="lb-empty">No runs yet — be first.</p>`;
    return `<div class="lb-card" style="--tint:${room.accentCss}"><h3>${escapeHtml(room.name)}</h3>
      <div class="lb-top">${escapeHtml(room.game?.system ?? "")}</div>${rows}</div>`;
  }).join("");
  const html = `
    <div class="eyebrow">SmartCiti.X · suite standing</div>
    <h1>Leaderboards</h1>
    <p class="lead">Local to this device — every board here lives in this browser only.
      ${standing.simsPlayed}/${roster.length} districts played · ${standing.totalRuns} runs ·
      ${standing.totalStars}★ earned · best-score sum ${standing.totalScore}.</p>
    <div class="lb-grid">${cards}</div>`;
  store.patch("leaderboard", { html });
}
// Both reachable mid-run (voice only — there's no button once a session is
// active), so a session must not keep ticking behind the modal: a hold/track
// timer would keep counting, and a drag/turn left mid-gesture would drift.
// Remembering the prior value rather than forcing false on close matters for
// the hub's own "Leaderboards"/"Create a scenario" buttons, reachable before
// begin() has ever run — closing the modal there must leave the intro screen
// exactly as paused as it already was, not wake the camera up behind it.
let pausedBeforeOverlay = false;
function viewLeaderboard() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  renderLeaderboards();
  store.patch("leaderboard", { visible: true });
}
function closeLeaderboard() { state.paused = pausedBeforeOverlay; store.patch("leaderboard", { visible: false }); }

// ------------------------------------------------------------ flat stations
//
// A station with `flat: true` (see sims/hunters-point.js) has no walkable
// scene: a dossier and a knowledge check render as a card, and every answer
// is an invisible interactable the ordinary Session scores. Selecting an
// option is activate() — same path a kiosk click takes — so hazards, combos,
// records and the ladder all behave exactly as in a 3D station.

function categoryCount() { return new Set(allSims().map((s) => s.category).filter(Boolean)).size; }
function flatSyncStep(step, s) {
  store.patch("flat", {
    stepIndex: s.index, stepCount: s.steps.length,
    question: step.title, cue: step.cue,
    options: (step.options ?? []).map((o) => ({ id: o.id, label: o.label })),
    picked: [], feedback: null,
  });
}
function flatSelect(id) { if (state.session && !state.paused) activate(id); }

// ---------------------------------------------------------- robot trainee
//
// ?robot=<skill 0..1> lets a software agent (shared/robot.js) run the station
// live in the browser through the same activate / press / rotate / drop
// paths a learner's clicks take, so the scene, HUD, records and ladder all
// react exactly as they would to a person. Every decision is logged with its
// observation to window.__smartcityRobot.log — the same trajectory shape
// tools/robot_train.mjs writes headlessly at scale.

const robotParam = new URLSearchParams(location.search).get("robot");
const robot = { active: robotParam != null, skill: Math.max(0, Math.min(1, parseFloat(robotParam) || 0.85)), timer: null, agent: null, log: [], seed: 1 };
function stopRobot() { if (robot.timer) { clearInterval(robot.timer); robot.timer = null; } robot.agent = null; clearRobotOverlay(); }
function startRobot(room) {
  stopRobot();
  const session = state.session;
  buildRobotOverlay(room);
  robot.agent = new RobotAgent({
    skill: robot.skill, seed: robot.seed++,
    hitIds: Object.keys(state.hits), hazardIds: Object.keys(room.hazards ?? {}).filter((id) => state.hits[id]),
  });
  robot.log = [];
  setRail("neutral", `<b>Robot trainee</b> running ${escapeHtml(room.name ?? room.title)} at skill ${robot.skill.toFixed(2)} — every decision is logged to <code>window.__smartcityRobot.log</code>.`);
  robot.timer = setInterval(() => {
    const s = state.session;
    if (!s || s !== session || s.finished || state.paused) { if (!s || s.finished) stopRobot(); return; }
    const before = s.score;
    // The embodied observation when the overlay is up (it carries the pose the
    // marker draws), the plain one otherwise — same policy either way.
    const obs = robotOverlay ? observeEmbodied(s, state.api, { room }) : observe(s);
    if (robotOverlay) showRobotPose(obs.pose);
    const a = robot.agent.act(s);
    if (a.type === "wait") return;
    if (a.type === "select") activate(a.id);
    else if (a.type === "commit") { if (s.gauge) s.gauge.t = a.at; activate(a.id); }
    else if (a.type === "press") pressStart(a.id);
    else if (a.type === "release") pressEnd();
    else if (a.type === "rotate") { lastActivatedId = a.id; s.rotate(a.id, a.delta); syncHud(); }
    else if (a.type === "drop") { lastActivatedId = a.id; s.dropAt(a.id, a.distance); syncHud(); }
    robot.log.push({ t: +s.elapsed.toFixed(2), obs, action: a, reward: s.score - before });
  }, 320);
}

// ------------------------------------------------- the robot's own view
//
// Two things a person watching a robot episode has to be able to see, because
// they are the two things that decide whether the run was acceptable: where the
// robot must not go, and where it is about to put its hand. The keep-out volumes
// are drawn as translucent spheres around the people in the room, and the
// current step's target pose as a marker on the contact point with a stalk along
// the approach normal — the same numbers shared/robot-embodiment.js writes into
// a trajectory, drawn rather than logged.
let robotOverlay = null;
function clearRobotOverlay() {
  if (!robotOverlay) return;
  robotOverlay.root.parent?.remove(robotOverlay.root);
  disposeTree(robotOverlay.root);
  robotOverlay = null;
}
function buildRobotOverlay(room) {
  clearRobotOverlay();
  if (!state.roomRoot || !state.api) return null;
  let emb;
  try { emb = buildEmbodiment(room, state.api, { root: state.roomRoot }); }
  catch (err) { console.warn("[robot] embodiment", err); return null; }
  const root = new THREE.Group();
  root.renderOrder = 4;
  state.roomRoot.add(root);
  for (const zone of emb.keepOut) {
    // Warmer for the patient, cooler for anyone else at work in the room: the
    // boundary is the same, the reason for it is not.
    const colour = zone.source === "userData.crew" ? 0x7ee6ff : 0xff7a4d;
    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(zone.radius, 18, 14),
      new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
    shell.position.set(...zone.center);
    root.add(shell);
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(zone.radius, 0.005, 6, 40),
      new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.75, depthWrite: false }));
    edge.rotation.x = -Math.PI / 2;
    edge.position.set(...zone.center);
    root.add(edge);
  }
  const marker = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.075, 0.009, 6, 28),
    new THREE.MeshBasicMaterial({ color: 0x9dff8f, transparent: true, opacity: 0.95, depthWrite: false }));
  const pip = new THREE.Mesh(new THREE.OctahedronGeometry(0.026),
    new THREE.MeshBasicMaterial({ color: 0x9dff8f, depthWrite: false }));
  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 1, 6),
    new THREE.MeshBasicMaterial({ color: 0x9dff8f, transparent: true, opacity: 0.6, depthWrite: false }));
  marker.add(ring, pip, stalk);
  marker.visible = false;
  root.add(marker);
  robotOverlay = { root, marker, ring, pip, stalk, emb };
  return robotOverlay;
}
/** Put the marker on the pose the robot is working, pointing the way in. */
function showRobotPose(pose) {
  if (!robotOverlay) return;
  const { marker, ring, stalk } = robotOverlay;
  if (!pose) { marker.visible = false; return; }
  marker.visible = true;
  marker.position.set(...pose.position);
  const n = new THREE.Vector3(...pose.normal);
  // The ring lies on the surface (its own axis is the approach normal) and the
  // stalk runs from the contact point out to the standoff the robot stages at.
  ring.lookAt(n.clone().add(ring.position));
  const len = Math.max(0.02, pose.standoff ?? 0.12);
  stalk.scale.set(1, len, 1);
  stalk.position.copy(n.clone().multiplyScalar(len / 2));
  stalk.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n.clone().normalize());
}

// ------------------------------------------- robot training on a programme
//
// A headless calibration of a whole programme, run from the programme panel:
// every station built off-screen, played by the policy at each rung of the
// difficulty ladder, and the success rate at each rung drawn as a small chart.
// It runs on this thread in slices — one probe per animation frame — rather
// than in a Worker, because a Worker cannot import the station modules (they
// reach three.js through the same CDN URL the page does) and a progress line
// the panel keeps updating is the honest version of the same thing.
const robotTraining = { cancel: false, running: false };
function robotProgramme() { return CURRICULA.find((c) => c.id === ROBOT_PROGRAMME) ?? null; }
function robotCurveFrom(stations) {
  return DIFFICULTY_LADDER.map((skill) => {
    const rows = stations.map((st) => st.probes.find((p) => p.skill === skill)).filter(Boolean);
    const rate = rows.length ? rows.reduce((n, r) => n + r.successRate, 0) / rows.length : 0;
    const violations = rows.reduce((n, r) => n + r.keepOutViolations, 0);
    return { skill, pct: Math.round(rate * 100), stations: rows.length, keepOutViolations: violations };
  });
}
const nextFrame = () => new Promise((done) => requestAnimationFrame(() => done()));
async function startRobotTraining() {
  const programme = robotProgramme();
  if (!programme || robotTraining.running) return;
  const ids = programme.stations.filter((st) => st.app === "smartcity").map((st) => st.id);
  robotTraining.running = true; robotTraining.cancel = false;
  store.patch("robotTraining", { running: true, done: 0, total: ids.length, station: "", curve: [], stations: [], note: "" });
  const stations = [];
  for (const id of ids) {
    if (robotTraining.cancel) break;
    const room = await loadSim(id).catch(() => null);
    if (!room) continue;
    store.patch("robotTraining", { station: room.name ?? room.title });
    await nextFrame();
    const root = new THREE.Group();
    let api;
    try { api = room.build(root); } catch (err) { console.warn("[robot training]", id, err); disposeTree(root); continue; }
    const probes = [];
    for (const skill of DIFFICULTY_LADDER) {
      if (robotTraining.cancel) break;
      probes.push(probeSkill(room, api, { skill, episodes: 3, seed: 11, SessionClass: Session, root }));
      // One probe per frame: the panel stays live and the chart fills in.
      await nextFrame();
    }
    disposeTree(root);
    const noRobot = room.steps.filter((st) => st.noRobot).length;
    stations.push({ id, name: room.name ?? room.title, probes, steps: room.steps.length, noRobot });
    store.patch("robotTraining", { done: stations.length, stations: stations.map((st) => ({
      id: st.id, name: st.name, steps: st.steps, noRobot: st.noRobot,
      best: st.probes.reduce((a, b) => (b.successRate > a.successRate ? b : a), st.probes[0] ?? { skill: 0, successRate: 0 }),
      violations: st.probes.reduce((n, pr) => n + pr.keepOutViolations, 0),
    })), curve: robotCurveFrom(stations) });
  }
  const offLimits = stations.reduce((n, st) => n + st.noRobot, 0);
  const violations = stations.reduce((n, st) => n + st.probes.reduce((m, pr) => m + pr.keepOutViolations, 0), 0);
  const violations1 = stations.map((st) => st.probes.find((pr) => pr.skill === 1)).filter(Boolean);
  const expertViolations = violations1.reduce((n, pr) => n + pr.keepOutViolations, 0);
  robotTraining.running = false;
  store.patch("robotTraining", {
    running: false, station: "",
    note: robotTraining.cancel
      ? `Stopped after ${stations.length} of ${ids.length} stations.`
      : `${stations.length} stations calibrated · ${offLimits} steps a robot must never perform · ` +
        `${violations} keep-out violation${violations === 1 ? "" : "s"}` +
        (violations === 0 ? "." : expertViolations === 0 ? ", none of them at expert skill." : `, ${expertViolations} of them at expert skill — that is a station to fix.`),
  });
}
function stopRobotTraining() { robotTraining.cancel = true; }
// ------------------------------------------------- instructor mode
//
// A live feed of this session for an instructor console (WebXR/instructor/),
// and the commands that console can send back. On one machine the transport is
// a BroadcastChannel; with ?relay=<ws url> the same envelope also goes over a
// WebSocket. Nothing about a command is silent: each one lands in front of the
// learner AND is appended to this attempt's training record as an
// instructorAction, so a driven run is never mistaken for an unaided one.
// See shared/observer.js.
const observer = createBroadcaster("smartcity", { learner: Progress.playerName });
let observerFrozen = false;
let hazardMode = "assess";       // "coach" warns once and does not score it
let instructorWeather = null;    // the kind the NEXT station is built under
let instructorDeviceId = null;   // the device profile the NEXT station runs under
let assignedProgram = null;      // a programme pinned in the learner's panel
let instructorActions = [];      // this attempt's commands, for the record
const coachedHazards = new Set(); // hazards already explained in coach mode

/** One command, recorded and answered: the learner sees it, the console hears
 *  what happened, and the attempt's record carries it. */
function logInstructorAction(cmd, detail, { ok = true, note = "" } = {}) {
  instructorActions.push({ cmd, at: new Date().toISOString(), detail: detail ?? "" });
  if (instructorActions.length > 80) instructorActions.shift();
  observer.action({ cmd, detail: detail ?? "", ok, note, ...(observerSnapshot() ?? {}) });
}

/** The device record behind a CMD_PROFILE detail: a device id from the table,
 *  or a bare run-profile id, which is what a console picker offers when the
 *  instructor cares about the profile and not the hardware. */
function deviceForInstructor(id) {
  if (DEVICES[id]) return { id, ...DEVICES[id], how: "instructor" };
  if (PROFILES[id]) {
    return {
      id, brand: "—", product: PROFILES[id].label, kind: PROFILES[id].label, class: "flat",
      profile: id, xr: "unknown", ua: null,
      input: { primary: "mouse", voiceFirst: false, controllers: false, hands: false, keyboard: true, gaze: false },
      safety: { ansiZ87: false, intrinsicallySafe: false, helmetMount: false },
      how: "instructor",
    };
  }
  return null;
}

observer.onCommand((cmd) => {
  if (cmd.kind === "note" && cmd.text) {
    setRail("warn", `<b>Instructor:</b> ${escapeHtml(cmd.text)}`);
    announce(`Instructor: ${cmd.text}`);
    logInstructorAction("note", cmd.text, { note: "shown on the rail" });
    return;
  }
  if (cmd.kind === "freeze") {
    observerFrozen = cmd.on;
    state.paused = cmd.on ? true : pausedBeforeOverlay;
    setRail(cmd.on ? "warn" : "neutral", cmd.on
      ? "<b>Held by the instructor.</b> The clock is stopped until they release it."
      : "<b>Released.</b> Carry on from where you stopped.");
    logInstructorAction("freeze", cmd.on ? "on" : "off", { note: cmd.on ? "session held" : "session released" });
    return;
  }
  if (cmd.kind === "open") {
    const id = cmd.detail ?? "";
    const programme = CURRICULA.find((c) => c.id === id);
    if (programme) {
      // A programme opens at the first station the learner has not yet passed,
      // which is where its own Start button goes.
      const progress = curriculumProgress(programme, TrainingRecords.list());
      const next = progress.next ?? programme.stations[0];
      if (!next) { logInstructorAction("open", id, { ok: false, note: "programme has no stations" }); return; }
      if (next.app === "trades") {
        logInstructorAction("open", id, { note: `Trade Skills room ${next.id} — opening that app` });
        location.href = `../trades/index.html?room=${encodeURIComponent(next.id)}`;
        return;
      }
      setRail("neutral", `<b>Instructor:</b> ${escapeHtml(programme.name)} — opening ${escapeHtml(next.id.replace(/-/g, " "))}.`);
      openForInstructor(next.id);
      logInstructorAction("open", id, { note: `programme opened at ${next.id}` });
      return;
    }
    if (!simExists(id)) { logInstructorAction("open", id, { ok: false, note: "unknown station or programme" }); return; }
    setRail("neutral", `<b>Instructor:</b> opening ${escapeHtml(SIMS_META_BY_ID[id]?.name ?? id)}.`);
    openForInstructor(id);
    logInstructorAction("open", id, { note: "station opened" });
    return;
  }
  if (cmd.kind === "interrupt") {
    const s = state.session;
    const it = s?.interrupts?.find((i) => i.id === cmd.detail);
    if (!s || s.finished || !it) { logInstructorAction("interrupt", cmd.detail, { ok: false, note: "no such interruption in this station" }); return; }
    if (it.fired) { logInstructorAction("interrupt", cmd.detail, { ok: false, note: "already fired" }); return; }
    // Arm it for right now and let the engine fire it on the next tick: the
    // learner gets the same banner, the same clock, the same scoring and the
    // same scene change a naturally-timed one produces (see the interrupt
    // layer in shared/game.js). Nothing here shortcuts that path.
    it.armedAt = s.elapsed;
    if (observerFrozen) { observerFrozen = false; state.paused = false; }
    logInstructorAction("interrupt", cmd.detail, { note: "armed for now; the station fires it" });
    return;
  }
  if (cmd.kind === "weather") {
    if (!WEATHER_KINDS.includes(cmd.detail)) { logInstructorAction("weather", cmd.detail, { ok: false, note: "unknown weather kind" }); return; }
    instructorWeather = cmd.detail;
    setRail("neutral", `<b>Instructor:</b> the next station runs in ${escapeHtml(cmd.detail)}.`);
    announce(`Instructor: the next station runs in ${cmd.detail}.`);
    logInstructorAction("weather", cmd.detail, { note: "set for the next station" });
    return;
  }
  if (cmd.kind === "profile") {
    const device = deviceForInstructor(cmd.detail);
    if (!device) { logInstructorAction("profile", cmd.detail, { ok: false, note: "unknown device or profile id" }); return; }
    instructorDeviceId = cmd.detail;
    setRail("neutral", `<b>Instructor:</b> the next station runs on the ${escapeHtml(PROFILES[device.profile]?.label ?? device.profile)} profile.`);
    announce(`Instructor: the next station runs on the ${PROFILES[device.profile]?.label ?? device.profile} profile.`);
    logInstructorAction("profile", cmd.detail, { note: `profile ${device.profile} set for the next station` });
    return;
  }
  if (cmd.kind === "hazard-mode") {
    const mode = cmd.detail === "coach" ? "coach" : cmd.detail === "assess" ? "assess" : null;
    if (!mode) { logInstructorAction("hazard-mode", cmd.detail, { ok: false, note: "mode is coach or assess" }); return; }
    hazardMode = mode;
    coachedHazards.clear();
    setRail("neutral", mode === "coach"
      ? "<b>Instructor: coaching mode.</b> An unsafe action is explained once and does not count against this run."
      : "<b>Instructor: assessed mode.</b> An unsafe action counts, as it does in a real assessment.");
    announce(mode === "coach" ? "Coaching mode. Unsafe actions are explained, not scored." : "Assessed mode. Unsafe actions count.");
    logInstructorAction("hazard-mode", mode, { note: mode === "coach" ? "hazards warn once" : "hazards score" });
    return;
  }
  if (cmd.kind === "assign") {
    const programme = CURRICULA.find((c) => c.id === cmd.detail);
    if (!programme) { logInstructorAction("assign", cmd.detail, { ok: false, note: "unknown programme" }); return; }
    assignedProgram = programme.id;
    renderPrograms();
    setRail("neutral", `<b>Instructor assigned:</b> ${escapeHtml(programme.name)} — pinned at the top of your training programmes.`);
    announce(`Instructor assigned ${programme.name}. It is pinned in your training programmes.`);
    logInstructorAction("assign", programme.id, { note: "pinned in the programmes panel" });
    return;
  }
  if (cmd.kind === "flow") {
    // The console hands over the whole graph, not a name: a flow is not in any
    // roster here. It is validated against the catalog before it can run, and a
    // refusal says why on the console's own log.
    const res = flowRunner.load(cmd.flow, { validateAgainst: FLOW_CATALOG });
    if (!res.ok) { logInstructorAction("flow", cmd.detail, { ok: false, note: res.errors?.[0] ?? "flow refused" }); return; }
    const started = flowRunner.start(res.flow.id, { restart: true });
    renderFlows();
    setRail("neutral", `<b>Instructor:</b> flow ${escapeHtml(res.flow.title)} — starting at ${escapeHtml(nodeLabel(flowRunner.current().node))}.`);
    announce(`Instructor loaded the flow ${res.flow.title}.`);
    logInstructorAction("flow", res.flow.id, {
      ok: started.ok !== false,
      note: started.ok === false ? started.reason : `flow started at ${flowRunner.current().run?.nodeId ?? res.flow.start}`,
    });
  }
});

/** CMD_OPEN's own path into a station: the same one the platform channel uses,
 *  so an instructor and an LMS cannot land a learner in different states. */
function openForInstructor(id) {
  if (!renderer.xr.isPresenting) state.mode = "flat";
  if (store.get().intro.visible) { store.patch("intro", { visible: false }); pendingEnter = null; deepLink = null; Sfx.ensure(); }
  store.patch("results", { visible: false }); store.patch("prebrief", { visible: false });
  observerFrozen = false;
  state.paused = false;
  enterSim(id, { briefed: true });
}

addEventListener("pagehide", () => observer.close());

/** The station itself, for the console's per-learner panel: the steps in
 *  order, the interruptions it declares and which have gone off. Sent with
 *  every hello, including the one a roll call triggers. */
/** The flow's position, safe to ask for before the runner below is built. */
function flowLive() {
  try { return flowRunner.current(); } catch (_) { return { flow: null, run: null, node: null }; }
}

observer.describes(() => {
  const s = state.session;
  const live = flowLive();
  const settings = {
    hazardMode, weather: instructorWeather, profile: instructorDeviceId, assigned: assignedProgram,
    // Where the learner's flow stands, so the console's row says which node of
    // which flow this run belongs to rather than just naming a station.
    flow: live.flow?.id ?? null,
    flowNode: live.node ? `${live.node.kind}: ${nodeLabel(live.node)}` : null,
  };
  if (!s) return { steps: [], interrupts: [], fired: [], ...settings };
  return {
    steps: (s.steps ?? []).map((st) => ({ id: st.id, title: st.title, kind: st.kind })),
    interrupts: (s.interrupts ?? []).map((i) => ({ id: i.id, kind: i.kind ?? "Interruption", alert: i.alert ?? "", after: i.after ?? "" })),
    fired: (s.interrupts ?? []).filter((i) => i.fired).map((i) => i.id),
    ...settings,
    ...(observerSnapshot() ?? {}),
  };
});

/** One snapshot of where this learner is, for the console. */
function observerSnapshot() {
  const s = state.session;
  if (!s) return null;
  const iv = s.interruptLog ?? [];
  return {
    stepIndex: (s.index | 0) + 1,
    stepCount: s.steps?.length ?? 0,
    stepTitle: s.step?.title ?? "",
    score: s.score | 0, stars: s.stars | 0, errors: s.errors | 0,
    hazardHits: s.hazardHits | 0, seconds: Math.round(s.elapsed ?? 0),
    answered: iv.filter((l) => l.outcome === "answered").length,
    interruptTotal: s.interrupts?.length ?? 0,
    fired: (s.interrupts ?? []).filter((i) => i.fired).map((i) => i.id),
    hazardMode,
  };
}

window.__smartcityRobot = {
  get active() { return robot.active; }, get skill() { return robot.skill; },
  get log() { return robot.log; }, get running() { return !!robot.timer; },
  get keepOut() { return robotOverlay?.emb.keepOut ?? null; },
  get marker() { return robotOverlay ? { visible: robotOverlay.marker.visible, position: robotOverlay.marker.position.toArray() } : null; },
  training: { start: startRobotTraining, stop: stopRobotTraining, get state() { return store.get().robotTraining; } },
};

// -------------------------------------------------------- platform channel
//
// A hosting platform that has established the learner's identity (from its
// own origin) can drive this app and hear back — open a station, return to
// the hub, ask for state or the roster. See shared/platform.js and
// smartcity/catalog.json for the full surface.

function platformState() {
  const s = state.session;
  return {
    room: state.room ? { id: state.room.id, name: state.room.name ?? state.room.title, category: state.room.category ?? null } : null,
    mode: state.mode, intro: store.get().intro.visible,
    stepIndex: s ? s.index : null, stepCount: s ? s.steps.length : null, stepId: s?.step?.id ?? null,
    score: s?.score ?? null, finished: s?.finished ?? null,
    level: Progress.level, levelName: Progress.levelName, xp: Progress.data.xp, learner: Progress.playerName,
    records: TrainingRecords.count(), lrs: Lrs.status().configured,
  };
}
Platform.init({
  app: "smartcity",
  onCommand(type, data, reply) {
    if (type === "smartcitix:open") {
      const id = String(data.sim ?? data.room ?? "");
      if (!simExists(id)) { reply("smartcitix:state", { ...platformState(), error: `unknown station: ${id}` }); return; }
      if (!renderer.xr.isPresenting) state.mode = "flat";
      if (store.get().intro.visible) { store.patch("intro", { visible: false }); pendingEnter = null; deepLink = null; Sfx.ensure(); }
      store.patch("results", { visible: false }); store.patch("prebrief", { visible: false });
      state.paused = false;
      enterSim(id, { briefed: !!data.skipBrief });
      return;
    }
    if (type === "smartcitix:hub") { if (!store.get().intro.visible) backToHub(); reply("smartcitix:state", platformState()); return; }
    if (type === "smartcitix:status") { reply("smartcitix:state", platformState()); return; }
    if (type === "smartcitix:catalog") {
      reply("smartcitix:catalog", { stations: allSims().map((s) => ({ id: s.id, name: s.name, category: s.category ?? null, trade: s.trade ?? null, certification: s.certification ?? null, flat: !!s.flat, custom: !!s.isCustom })) });
      return;
    }
    // ---- the flow channel (platform protocol 2, see shared/flowhub.js) ----
    if (type === FLOW_LOAD) {
      const res = flowRunner.load(data.flow, { validateAgainst: FLOW_CATALOG });
      renderFlows();
      if (!res.ok) { reply("smartcitix:state", { ...platformState(), error: `flow refused: ${(res.errors ?? []).join("; ")}` }); return; }
      reply(FLOW_STATE, { flow: res.state, transition: null });
      return;
    }
    if (type === FLOW_START) {
      const res = flowRunner.start(data.flowId ?? null, { restart: !!data.restart });
      renderFlows();
      if (res.ok === false) reply("smartcitix:state", { ...platformState(), error: `flow.start: ${res.reason}` });
      return;
    }
    if (type === FLOW_RESUME) {
      // The host finished the external node it was handed. It cannot resume any
      // other node, so a stray resume can never skip a station still owed.
      const res = flowRunner.resume({ nodeId: data.nodeId ?? null, outcome: data.outcome ?? null });
      renderFlows();
      if (res.ok === false) reply("smartcitix:state", { ...platformState(), error: `flow.resume: ${res.reason}` });
    }
  },
});

// ------------------------------------------------------------- pre-brief
//
// Flipped classroom: before the first run of a station the learner is
// offered the procedure itself — every step and the reason behind it — as
// study material. Reading it stamps the profile (Progress.markBriefed); the
// run that follows starts `prepared`, earns the engine-wide Prepared award
// and a score bonus. Skipping is allowed and costs only that.

function showPreBrief(room) {
  state.pendingBrief = room.id;
  const meta = SIMS_META_BY_ID[room.baseId] ?? {};
  store.patch("prebrief", {
    visible: true, id: room.id, name: room.name ?? room.title, trade: room.trade ?? meta.trade ?? "",
    category: room.category ?? meta.category ?? "", tagline: room.tagline ?? "",
    certification: room.certification ?? meta.certification ?? "",
    steps: room.steps.map((s) => ({ id: s.id, title: s.title, why: s.why })),
    hazardCount: Object.keys(room.hazards ?? {}).length,
  });
}
function prebriefStart() {
  const id = state.pendingBrief; if (!id) return;
  Progress.markBriefed(id);
  store.patch("prebrief", { visible: false });
  // A brief that is a flow's own node is finished by reading it; the flow then
  // says what comes next (which may well be this same station).
  if (flowBriefAnswered()) return;
  enterSim(id, { briefed: true });
}
function prebriefSkip() {
  const id = state.pendingBrief; if (!id) return;
  store.patch("prebrief", { visible: false });
  if (flowBriefAnswered()) return;
  enterSim(id, { briefed: true });
}
function prebriefClose() { state.pendingBrief = null; store.patch("prebrief", { visible: false }); }

// ---------------------------------------------------------- training records
//
// The instructor/compliance view of the same runs the leaderboards celebrate:
// every attempt with its pass verdict, rolled up per category, exportable as
// CSV (spreadsheet/HR) or xAPI statements (Learning Record Store). Rendered
// from plain data by react-ui.js — no HTML strings, so nothing to escape.

function renderRecords() {
  const list = TrainingRecords.list();
  const rows = list.slice(-200).reverse().map((r) => ({
    id: r.id, at: r.at, simName: r.simName ?? r.simId, category: r.category ?? "—",
    score: r.score | 0, stars: r.stars | 0, errors: r.errors | 0, hazardHits: r.hazardHits | 0,
    seconds: r.seconds | 0, passed: !!r.passed, learner: r.learner ?? "",
  }));
  store.patch("records", {
    rows, summary: TrainingRecords.summary(list),
    credentials: earnedCertifications(list).map((r) => ({ id: r.id, certification: r.certification, simName: r.simName ?? r.simId, at: r.at, app: r.app })),
    total: list.length, passes: list.filter((r) => r.passed).length,
    proof: renderProof(list),
  });
}

// ------------------------------------------------------------------ proof tab
//
// The competency tier (shared/competency.js). Plain data again — a station
// name, a learner's crew tag and a standard's title all arrive here as text
// and are rendered as text nodes by react-ui.js, never as markup.
function renderProof(list = TrainingRecords.list()) {
  const status = competencyStatus(list);
  // Most-advanced first, and a competency nobody has touched is not shown at
  // all: thirty-three empty cards teach nothing.
  const competencies = COMPETENCIES
    .map((c) => {
      const st = status[c.id];
      return {
        id: c.id, title: c.title, kind: c.kind, status: st.status,
        demonstrated: st.demonstrated, consistent: st.consistent,
        stationsMet: st.stationsMet, require: st.require, total: st.total,
        masteryRuns: st.masteryRuns, attempts: st.attempts, days: st.days, earnedAt: st.earnedAt,
        standards: c.standards.map((id) => {
          const s = standard(id);
          return { id: s.id, label: `${s.body} — ${s.title}`, source: s.source };
        }),
        stations: c.stations.map((id) => {
          const s = st.stations[id];
          return {
            id, mastery: !!s?.masteryAt,
            attempted: !!s,
            note: s ? (s.masteryAt ? `mastery on ${String(s.masteryAt).slice(0, 10)}` : (s.best?.reason ?? "attempted")) : null,
          };
        }),
      };
    })
    .filter((c) => c.attempts > 0)
    .sort((a, b) => (b.demonstrated - a.demonstrated) || (b.stationsMet - a.stationsMet) || (b.attempts - a.attempts));
  return {
    competencies,
    transcript: transcript(list, { learner: Identity.current?.name ?? Progress.playerName }),
    demonstrated: competencies.filter((c) => c.demonstrated).length,
    consistent: competencies.filter((c) => c.consistent).length,
    rule: MASTERY.text,
    rubric: RUBRIC.lines,
  };
}
function setRecordsTab(tab) { store.patch("records", { tab: tab === "proof" ? "proof" : "attempts" }); }

/**
 * A competency the run just earned, handed on the two ways this engine hands
 * anything on: to the embedding page (Identity.emit, only ever to the
 * learner's own home origin) and to the Learning Record Store, as an xAPI
 * statement with verb "achieved" through the same queue the per-attempt
 * statements use — so a competency earned on a kiosk with no network still
 * reaches the LRS on the next connection.
 *
 * Only a competency that was NOT demonstrated before this run is announced:
 * earning it is an event, having it is a state.
 */
function announceNewCompetencies(before) {
  const list = TrainingRecords.list();
  const after = competencyStatus(list);
  const earned = newlyDemonstrated(before, after);
  if (!earned.length) return;
  const assertions = toCompetencyBadges(list, proofOpts());
  const byId = Object.fromEntries(assertions.map((a) => [a.competency.id, a]));
  for (const id of earned) {
    Identity.emit("smartcitix:competency", {
      competency: {
        id, title: after[id].title, kind: after[id].kind, status: after[id].status,
        standards: after[id].standards, stationsMet: after[id].stationsMet, require: after[id].require,
        earnedAt: after[id].earnedAt, masteryRule: MASTERY.text,
      },
      assertion: byId[id] ?? null,
    });
  }
  const { statements } = toCompetencyXAPI(list, { ...proofOpts(), only: earned });
  if (statements.length && Lrs.configured) {
    refreshLrs({ busy: true });
    Lrs.enqueue(statements);
    Lrs.flush().then(() => refreshLrs({ busy: false }));
  }
  const first = after[earned[0]];
  announce(earned.length === 1
    ? `Competency demonstrated: ${first.title}.`
    : `${earned.length} competencies demonstrated, including ${first.title}.`);
}
function viewRecords() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  renderRecords();
  store.patch("records", { visible: true });
}
function closeRecords() { state.paused = pausedBeforeOverlay; store.patch("records", { visible: false }); }

// ---------------------------------------------------------- programmes
//
// The ordered sets of stations a training centre runs as a block (see
// curricula.js). Progress is read from the same training record the
// certificate claim rests on — a station counts when it has a passing
// attempt — so a programme can never show complete on stations that were
// only played.
function renderPrograms() {
  // A programme an instructor assigned (CMD_ASSIGN) is pinned: marked as
  // assigned and sorted to the top, so the learner opens the panel and sees
  // the block they were put on rather than hunting for it among 23. The
  // dental block is the one with a robot-training card: its stations are
  // the ones annotated for an embodied trainee (see docs/robot-training.md).
  const rows = allProgress(TrainingRecords.list()).map((r) => ({ ...r, assigned: r.id === assignedProgram, robot: r.id === ROBOT_PROGRAMME }));
  rows.sort((a, b) => (a.assigned === b.assigned ? 0 : a.assigned ? -1 : 1));
  store.patch("programs", { rows, assigned: assignedProgram });
}
function viewPrograms() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  renderPrograms();
  store.patch("programs", { visible: true });
}
function closePrograms() { state.paused = pausedBeforeOverlay; store.patch("programs", { visible: false }); }
/** Open the next unfinished station in a programme, here or in Trade Skills. */
function programStart(app, id) {
  closePrograms();
  if (app === "trades") { location.href = `../trades/index.html?room=${encodeURIComponent(id)}`; return; }
  store.patch("intro", { visible: false });
  pendingEnter = null; deepLink = null;
  Sfx.ensure();
  enterSim(id);
}

// ------------------------------------------------------------------- flows
//
// A flow is a host's ordered graph of nodes with a condition on every edge
// (shared/flowhub.js). SmartCiti.X runs the nodes that are its to run — a
// station, a station's pre-brief, a programme, a check-in — evaluates a gate
// against the same attempt records the certificate claim rests on, hands an
// external node back to the host, and follows the portal's own cross-app link
// when the next node belongs to Trade Skills or Holodeck. The run itself lives
// in one localStorage key so it survives that app switch.
//
// The protocol is platform.js's (FLOW_LOAD / FLOW_START / FLOW_RESUME in,
// FLOW_STATE / FLOW_DONE / FLOW_EXTERNAL out) and the instructor console's
// CMD_FLOW lands in the same place. Nothing here knows anything about how a
// host's own orchestrator is built; see docs/flowhub.md.

// Flows are validated against the network's real roster. The generated catalog
// is the only place the Trade Skills rooms are also listed, so it is fetched
// when it can be; until then (and in the bundled single-file build, where the
// file sits one folder up) the local roster is the floor.
let FLOW_CATALOG = {
  stations: SIMS_META.map((s) => ({ app: "smartcity", id: s.id })),
  curricula: CURRICULA.map((c) => ({ id: c.id })),
};
for (const url of ["./catalog.json", "../catalog.json"]) {
  fetch(url).then((r) => (r.ok ? r.json() : null)).then((cat) => {
    if (cat?.stations?.length) FLOW_CATALOG = cat;
  }).catch(() => { /* offline, or a bundled build — the local roster stands */ });
}

let flowBriefNode = null; // the flow node a pre-brief on screen belongs to
let flowPending = false;  // the run has moved; the learner has not yet been sent on

const flowRunner = createFlowRunner({
  app: "smartcity",
  enter: flowEnter,
  onState: (state, transition) => { Platform.flowState(state, transition); renderFlows(); flowTellObserver(state); },
  onExternal: (payload) => {
    Platform.flowExternal(payload);
    const label = payload.node?.title ?? payload.node?.ref ?? payload.nodeId;
    store.patch("results", { visible: false });
    store.patch("flows", { note: `Waiting on your platform: ${label}. The flow continues when it sends the result back.` });
    setRail("neutral", `<b>Flow:</b> ${escapeHtml(String(label))} runs on your learning platform. This station waits for its result.`);
    announce(`Flow paused. ${label} runs on your learning platform.`);
    viewFlows();
  },
  onDone: (state) => {
    Platform.flowDone(state);
    store.patch("flows", { note: `Flow complete: ${state.title ?? state.flowId}.` });
    setRail("ok", `<b>Flow complete:</b> ${escapeHtml(String(state.title ?? state.flowId))}.`);
    announce(`Flow complete: ${state.title ?? state.flowId}.`);
    viewFlows();
  },
});

/** Do here whatever the node the run is standing on means. */
function flowEnter(node, { href }) {
  if (href) {
    // A node in Trade Skills or Holodeck: the portal's own cross-app link,
    // carrying the flow and node ids. The run is already saved under the one
    // localStorage key, so the other app picks it up on load.
    flowBriefNode = null;
    setRail("neutral", `<b>Flow:</b> next is ${escapeHtml(nodeLabel(node))} in ${escapeHtml(String(node.app))} — opening that app.`);
    location.href = href;
    return true;
  }
  if (node.kind === "station") { flowBriefNode = null; openForInstructor(node.ref); return true; }
  if (node.kind === "brief") { flowBriefNode = node.id; flowOpenBrief(node.ref); return true; }
  if (node.kind === "programme") { flowBriefNode = null; return flowEnterProgramme(node); }
  if (node.kind === "checkin") {
    flowBriefNode = null;
    store.patch("results", { visible: false });
    store.patch("flows", { note: `${nodeLabel(node)} — answer the check-in, then Continue. It is never scored and never leaves this browser.` });
    viewFlows();
    return true;
  }
  return false;
}

/** A brief node: the station's own pre-brief, with nothing else entered. */
async function flowOpenBrief(id) {
  if (!simExists(id)) { store.patch("flows", { error: `no station ${id} for this flow's brief` }); return; }
  store.patch("intro", { visible: false });
  store.patch("results", { visible: false });
  const room = await findSim(id);
  if (room) showPreBrief(room);
}

/** A programme node opens at the first station of it the learner has not passed. */
function flowEnterProgramme(node) {
  const programme = CURRICULA.find((c) => c.id === node.ref);
  if (!programme) { store.patch("flows", { error: `no programme ${node.ref}` }); return false; }
  assignedProgram = programme.id;
  renderPrograms();
  const progress = curriculumProgress(programme, TrainingRecords.list());
  const next = progress.next ?? programme.stations[0];
  if (!next) { store.patch("flows", { error: `programme ${node.ref} has no stations` }); return false; }
  if (next.app !== "smartcity") {
    location.href = `../${next.app}/index.html?room=${encodeURIComponent(next.id)}`;
    return true;
  }
  setRail("neutral", `<b>Flow:</b> ${escapeHtml(programme.name)} — opening ${escapeHtml(next.id.replace(/-/g, " "))}.`);
  openForInstructor(next.id);
  return true;
}

/**
 * A finished attempt, offered to the flow. It only counts when the flow is
 * actually standing on that node: a learner who wanders off to another station
 * mid-flow has not completed the one the flow asked for.
 */
function flowOnAttempt(attempt) {
  const { flow, run, node } = flowRunner.current();
  if (!flow || !run || run.done || !node) return;
  if (node.kind === "station") {
    if (node.ref !== attempt.simId) return;
    flowRunner.complete(outcomeFromRecord(attempt), { enterNode: false });
    flowPending = !flowRunner.current().run?.done;
    return;
  }
  if (node.kind === "programme") {
    const programme = CURRICULA.find((c) => c.id === node.ref);
    if (!programme || !programme.stations.some((s) => s.id === attempt.simId)) return;
    const progress = curriculumProgress(programme, TrainingRecords.list());
    // A programme node is done when the programme is: until then the flow
    // stays on it and the block's next station is what "Next stop" opens.
    if (!progress.complete) { flowPending = true; return; }
    flowRunner.complete(outcomeFromRecord(attempt), { enterNode: false });
    flowPending = !flowRunner.current().run?.done;
  }
}

/** What the results card's Continue button says it will open. */
function flowNextLabel() {
  const node = flowRunner.current().node;
  return node ? nodeLabel(node) : "next node";
}

/** Open the node the flow is now standing on — the results card's "Next stop"
 *  and the Flows panel's "Continue" are the same act. */
function flowResume() {
  flowPending = false;
  const { flow, run, node } = flowRunner.current();
  if (!flow || !run) return false;
  if (run.done) { viewFlows(); return true; }
  if (node?.kind === "programme") { flowEnterProgramme(node); return true; }
  const r = flowRunner.resumeHere();
  if (r.ok === false) { store.patch("flows", { error: r.reason ?? "the flow could not continue" }); viewFlows(); }
  return true;
}

/** A pre-brief that belonged to a flow's brief node: read is the outcome. */
function flowBriefAnswered() {
  if (!flowBriefNode) return false;
  const nodeId = flowBriefNode;
  flowBriefNode = null;
  flowRunner.complete(acknowledgedOutcome({ why: "pre-brief read" }), { nodeId });
  return true;
}

/**
 * Tell the instructor console where the flow stands. A transition happens once
 * per node, so this is a hello rather than a throttled heartbeat, and it
 * carries the same fields describeStation() puts on every hello.
 */
function flowTellObserver(state) {
  if (!state) return;
  observer.hello({});
}

function renderFlows() {
  const rows = flowRunner.rows();
  const { flow } = flowRunner.current();
  store.patch("flows", { rows, current: flow?.id ?? null });
}
function viewFlows() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  renderFlows();
  store.patch("flows", { visible: true });
}
function closeFlows() { state.paused = pausedBeforeOverlay; store.patch("flows", { visible: false }); }
/** Continue: answer a check-in node, or stand on the current node again. */
function flowContinue(flowId = null) {
  if (flowId) flowRunner.select(flowId);
  const { run, node } = flowRunner.current();
  store.patch("flows", { error: "" });
  if (!run) { const r = flowRunner.start(flowId); if (!r.ok) store.patch("flows", { error: r.reason }); renderFlows(); return; }
  closeFlows();
  if (node?.kind === "checkin") { flowPending = false; flowRunner.complete(acknowledgedOutcome({ why: "check-in answered" })); return; }
  flowResume();
}
function flowRestart(flowId = null) {
  closeFlows();
  const r = flowRunner.restart(flowId);
  if (!r.ok) { store.patch("flows", { error: r.reason ?? "the flow could not restart" }); viewFlows(); }
}
function flowSelect(flowId) { if (flowRunner.select(flowId)) renderFlows(); }

// A flow node in another app hands back the same way it went out: the link
// carried the flow and node ids, and the run waited in localStorage.
{
  const link = parseFlowLink(location.search);
  if (link.flowId) {
    const restored = flowRunner.restore(link);
    if (restored.ok) {
      renderFlows();
      // The station on the link is the flow's node; entering it is the flow
      // continuing, not a deep link the learner typed.
      queueMicrotask(() => flowRunner.resumeHere());
    } else {
      store.patch("flows", { error: restored.reason });
    }
  }
}

function stamp() { return new Date().toISOString().slice(0, 10); }
function exportRecordsCsv() {
  download(`smartcitix-training-records-${stamp()}.csv`, toCSV(TrainingRecords.list()), "text/csv");
}
function exportRecordsXapi() {
  const statements = toXAPI(TrainingRecords.list(), { actorName: Progress.playerName, homePage: location.origin });
  download(`smartcitix-xapi-statements-${stamp()}.json`, JSON.stringify(statements, null, 2), "application/json");
}
function exportCredentials() {
  const assertions = toOpenBadges(TrainingRecords.list(), xapiOpts());
  if (!assertions.length) return;
  download(`smartcitix-credentials-${stamp()}.json`, JSON.stringify(assertions, null, 2), "application/json");
}
// ---------------------------------------------------------------- proof export
function proofOpts() {
  return {
    ...xapiOpts(),
    learnerHome: Identity.current?.homePage ?? null,
    learnerId: Identity.current?.id ?? null,
    learnerName: Identity.current?.name ?? null,
  };
}
function exportProofCsv() {
  const rows = transcript(TrainingRecords.list(), { learner: Identity.current?.name ?? Progress.playerName });
  if (!rows.length) return;
  download(`smartcitix-proof-transcript-${stamp()}.csv`, toProofCSV(rows), "text/csv");
}
function exportCompetencyBadges() {
  const assertions = toCompetencyBadges(TrainingRecords.list(), proofOpts());
  if (!assertions.length) return;
  download(`smartcitix-competency-badges-${stamp()}.json`, JSON.stringify(assertions, null, 2), "application/json");
}

/**
 * Print the transcript.
 *
 * Built as DOM in a new window, every value set through createTextNode or
 * textContent — never innerHTML. A learner's crew tag, a station name and a
 * standard's title are all untrusted as far as this function is concerned
 * (the interface brief's rule, and the same reason the Records table is built
 * from elements): a transcript is the one artefact that gets printed, mailed
 * and filed, so it is the last place to hand markup a chance to run.
 */
function printTranscript() {
  const rows = transcript(TrainingRecords.list(), { learner: Identity.current?.name ?? Progress.playerName });
  if (!rows.length) return;
  const win = window.open("", "_blank");
  if (!win) { announce("The transcript window was blocked. Allow pop-ups for this page, or export the CSV instead."); return; }
  const doc = win.document;
  const el = (tag, text = null, parent = null) => {
    const node = doc.createElement(tag);
    if (text != null) node.appendChild(doc.createTextNode(String(text)));
    if (parent) parent.appendChild(node);
    return node;
  };
  doc.title = "SmartCiti.X — proof of training transcript";
  const style = doc.createElement("style");
  style.textContent = `
    body{ font:13px/1.5 "Helvetica Neue", Arial, sans-serif; color:#111; margin:32px; max-width:1000px }
    h1{ font-size:21px; margin:0 0 2px; text-transform:uppercase; letter-spacing:.04em }
    h2{ font-size:15px; margin:22px 0 2px; page-break-after:avoid }
    .eyebrow{ font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:#666 }
    .rule{ border:1px solid #ccc; border-left:3px solid #111; padding:8px 11px; margin:12px 0 18px; font-size:11.5px; background:#f7f7f7 }
    .chip{ display:inline-block; border:1px solid #111; border-radius:9px; padding:0 7px; font-size:10px;
      letter-spacing:.1em; text-transform:uppercase; margin-left:8px; vertical-align:2px }
    .meta{ color:#555; font-size:11.5px; margin:2px 0 6px }
    ul.std{ margin:4px 0 8px 18px; padding:0; font-size:11.5px; color:#333 }
    table{ border-collapse:collapse; width:100%; margin:4px 0 10px; font-size:11px }
    th,td{ border:1px solid #bbb; padding:4px 6px; text-align:left; vertical-align:top }
    th{ background:#eee; font-size:10px; letter-spacing:.08em; text-transform:uppercase }
    td.no{ color:#444 } tr.no td{ background:#fbfbfb }
    section{ page-break-inside:avoid }
    footer{ margin-top:24px; border-top:1px solid #ccc; padding-top:8px; font-size:10.5px; color:#555 }
    @media print{ body{ margin:12mm } }`;
  doc.head.appendChild(style);
  el("div", "SmartCiti.X ~VR Simulators · proof of training", doc.body).className = "eyebrow";
  el("h1", "Competency transcript", doc.body);
  el("div", `${rows[0].learner} · ${rows.filter((r) => r.demonstrated).length} of ${rows.length} competencies demonstrated · printed ${new Date().toLocaleString()}`, doc.body).className = "meta";
  el("div", MASTERY.text, doc.body).className = "rule";

  for (const row of rows) {
    const section = el("section", null, doc.body);
    const head = el("h2", row.competency.title, section);
    el("span", row.status, head).className = "chip";
    el("div", `${row.competency.id} · ${row.stationsMet} of ${row.require} required stations demonstrated ` +
      `(${row.total} named) · mastery runs on ${row.days} day${row.days === 1 ? "" : "s"}` +
      (row.earnedAt ? ` · earned ${String(row.earnedAt).slice(0, 10)}` : ""), section).className = "meta";
    const stds = el("ul", null, section);
    stds.className = "std";
    for (const s of row.standards) {
      el("li", `${s.body} — ${s.title}${s.source === "unverified" ? " (citation form unverified)" : ""}`, stds);
    }
    const table = el("table", null, section);
    const thead = el("tr", null, el("thead", null, table));
    for (const h of ["When", "Station", "Score", "Stars", "Unsafe", "Interruptions", "Time", "Par", "Counted", "Why not"]) el("th", h, thead);
    const tbody = el("tbody", null, table);
    for (const e of row.evidence) {
      const tr = el("tr", null, tbody);
      if (!e.mastery) tr.className = "no";
      const iv = e.interrupts;
      el("td", String(e.at ?? "").replace("T", " ").slice(0, 16), tr);
      el("td", e.stationName ?? e.stationId, tr);
      el("td", e.score, tr);
      el("td", e.stars, tr);
      el("td", e.hazardHits, tr);
      el("td", iv ? `${iv.answered} answered, ${iv.wrong} wrong, ${iv.missed} missed` : "none fired", tr);
      el("td", mmss(e.seconds), tr);
      el("td", e.parSeconds ? mmss(e.parSeconds) : "—", tr);
      el("td", e.mastery ? "mastery" : "no", tr);
      el("td", e.reason ?? "", tr).className = "no";
    }
  }
  el("footer",
    "A demonstrated competency evidences readiness against the standards named above under the mastery rule stated at the top of this " +
    "transcript. It is not a licence or a certification issued by those bodies. Records are held in the learner's own browser; this " +
    "transcript is a print of what was exported.", doc.body);
  win.focus();
  setTimeout(() => { try { win.print(); } catch (_) { /* the learner can print it themselves */ } }, 120);
}

function clearRecords() {
  if (!TrainingRecords.count()) return;
  if (!confirm("Delete every training record on this device? Export first if you need them.")) return;
  TrainingRecords.clear();
  renderRecords();
}

// ------------------------------------------------------------------ live LRS
//
// The step after exporting a file: with an endpoint connected, each finished
// attempt is sent as an xAPI statement the moment it happens, and anything
// that fails to send waits in a local queue for the next try. Configured on
// the records overlay, by the launch URL (endpoint only), or by the embedding
// page from the learner's home origin — see shared/lrs.js.

function xapiOpts() { return { actorName: Progress.playerName, homePage: location.origin }; }
function refreshLrs(extra = {}) {
  const s = Lrs.status();
  store.patch("records", { lrs: { ...store.get().records.lrs, configured: s.configured, host: s.host, authed: s.authed, pending: s.pending, last: s.last, ...extra } });
}
function shipToLrs(records) {
  if (!Lrs.configured) return;
  refreshLrs({ busy: true });
  Lrs.ship(records, xapiOpts()).then(() => refreshLrs({ busy: false }));
}
function lrsSetEndpoint(v) { refreshLrs({ endpointDraft: v, error: null }); }
function lrsSetAuth(v) { refreshLrs({ authDraft: v }); }
function lrsConnect() {
  const d = store.get().records.lrs;
  const cfg = Lrs.configure({ endpoint: d.endpointDraft, auth: d.authDraft });
  if (!cfg) { refreshLrs({ error: "The endpoint must be an https URL (http is allowed on localhost only)." }); return; }
  refreshLrs({ error: null, authDraft: "", busy: true });
  Lrs.flush().then(() => refreshLrs({ busy: false }));
}
function lrsDisconnect() { Lrs.disconnect(); refreshLrs({ error: null, busy: false }); }
function lrsSendAll() { shipToLrs(TrainingRecords.list()); }

Lrs.load();
Lrs.listen(() => Identity.current?.homePage, () => { refreshLrs(); Lrs.flush().then(() => refreshLrs()); });
refreshLrs();
if (Lrs.pending()) Lrs.flush().then(() => refreshLrs());

// ------------------------------------------------------------- scenario editor
//
// A custom scenario never invents new steps or new 3D content — it curates
// and reorders the real steps a real station already has, so it plays
// through the exact same engine, hazards and rank system as the original.

let edOrder = []; // [{ id, title, kind, on }] — the checklist's live working order

function edPopulateBaseOptions() {
  store.patch("editor", { baseValue: "", stepsVisible: false });
}

function edRenderSteps() {
  store.patch("editor", { steps: edOrder.map((s) => ({ ...s })) });
}

async function edLoadBase(simId) {
  if (!SIMS_META_BY_ID[simId]) { store.patch("editor", { baseValue: simId, stepsVisible: false }); return; }
  store.patch("editor", { baseValue: simId, stepsVisible: false });
  const sim = await loadSim(simId);
  // The picker may have moved on to a different (or no) base while this
  // station's module was still in flight — a stale response must not clobber
  // whatever the editor is showing now.
  if (store.get().editor.baseValue !== simId) return;
  if (!sim) { store.patch("editor", { error: "Could not load that simulator." }); return; }
  edOrder = sim.steps.map((s) => ({ id: s.id, title: s.title, kind: s.kind, on: true }));
  store.patch("editor", { name: "", tagline: "", par: "", error: "", stepsVisible: true });
  edRenderSteps();
}

function edToggleStep(i, on) { edOrder[i].on = on; edRenderSteps(); }
function edMoveStep(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= edOrder.length) return;
  [edOrder[i], edOrder[j]] = [edOrder[j], edOrder[i]];
  edRenderSteps();
}
function edSetName(v) { store.patch("editor", { name: v }); }
function edSetPar(v) { store.patch("editor", { par: v }); }
function edSetTagline(v) { store.patch("editor", { tagline: v }); }
function edSelectBase(v) { edLoadBase(v); }

function edValidate() {
  const ed = store.get().editor;
  if (!ed.baseValue) return "Pick a base simulator first.";
  if (!ed.name.trim()) return "Give the scenario a name.";
  if (!edOrder.some((s) => s.on)) return "Keep at least one step.";
  // A number input can still hold an unparseable transient value (a bare
  // "-", for instance) — catch it here rather than silently saving a NaN
  // par time that would poison every future run's score (timeBonus = NaN).
  if (ed.par && !Number.isFinite(Number(ed.par))) return "Par time must be a number, or left blank.";
  return null;
}

function edEnter(customId) {
  store.patch("editor", { visible: false });
  pendingEnter = customId;
  begin();
}

function edSave(andPlay) {
  const err = edValidate();
  if (err) { store.patch("editor", { error: err }); return; }
  const ed = store.get().editor;
  const par = ed.par ? Math.max(30, Math.min(900, Number(ed.par))) : null;
  const entry = {
    id: newScenarioId(),
    baseId: ed.baseValue,
    name: ed.name.trim(),
    tagline: ed.tagline.trim(),
    stepIds: edOrder.filter((s) => s.on).map((s) => s.id),
    parSeconds: par,
    createdAt: Date.now(),
  };
  CustomScenarios.save(entry);
  invalidateSimsCache();
  edRenderLibrary();
  if (andPlay) edEnter(`custom:${entry.id}`);
  else store.patch("editor", { error: "", stepsVisible: false, baseValue: "" });
}
function edSavePlay() { edSave(true); }
function edSaveOnly() { edSave(false); }
function edCancel() { store.patch("editor", { stepsVisible: false, baseValue: "" }); }

function edRenderLibrary() {
  const list = CustomScenarios.list();
  const library = list.map((entry) => {
    const base = SIMS_META_BY_ID[entry.baseId];
    return {
      id: entry.id,
      name: entry.name,
      baseName: base ? base.name : "base simulator removed",
      stepCount: entry.stepIds.length,
      playable: !!base,
    };
  });
  store.patch("editor", { library });
}

function edPlayLibrary(id) { edEnter(`custom:${id}`); }
function edDeleteLibrary(id) { CustomScenarios.remove(id); invalidateSimsCache(); edRenderLibrary(); }

function openEditor() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  edPopulateBaseOptions();
  edRenderLibrary();
  store.patch("editor", { visible: true });
}
function closeEditor() { state.paused = pausedBeforeOverlay; store.patch("editor", { visible: false }); }

// Mirrors the original <input> semantics: every keystroke updates the field
// as typed (untransformed, so typing "JOHN SMITH" keeps its space), and only
// losing focus — like the native "change" event — commits it through
// Progress.setPlayerName's trim/case/length normalization.
function setPlayerNameDraft(v) { store.patch("intro", { playerName: v }); }
function commitPlayerName() {
  Progress.setPlayerName(store.get().intro.playerName);
  store.patch("intro", { playerName: Progress.playerName });
}

function retryResult() {
  store.patch("results", { visible: false });
  state.paused = false;
  enterSim(state.room.id);
}
function backToHub() {
  state.tour = null;
  store.patch("results", { visible: false });
  state.paused = false;
  enterHub();
}
function nextTourStop() {
  // The same button carries a flow's next node; a flow takes precedence,
  // because a learner put on a flow is being driven by it.
  if (flowPending) { store.patch("results", { visible: false }); state.paused = false; flowResume(); return; }
  if (!state.tour) return;
  state.tour.i += 1;
  const next = SIMS_META[state.tour.i];
  store.patch("results", { visible: false });
  state.paused = false;
  if (next) enterSim(next.id);
  else { state.tour = null; enterHub(); }
}
function startTour() {
  // Only force flat mode when nothing real is presenting — state.mode only
  // ever becomes "ar"/"vr" once an actual immersive session is live
  // (startXr()), so overwriting it unconditionally here would desync the
  // mode flag from a still-running AR/VR session if "tour" is said mid-run,
  // rather than genuinely switching out of it.
  if (!renderer.xr.isPresenting) state.mode = "flat";
  state.tour = { i: 0 };
  pendingEnter = SIMS_META[0].id;
  begin();
}

// --------------------------------------------------------------- interaction

const raycaster = new THREE.Raycaster();
raycaster.far = 14;
const pointerNdc = new THREE.Vector2(0, 0);

// Scratch objects reused every frame by the hot paths below (controller
// raycasting, the hint marker, the gauge marker) instead of allocating a new
// Vector3/Box3/Matrix4 each call — this runs at frame rate in VR, and
// garbage-collector pauses are exactly the kind of stutter that's
// uncomfortable in a headset.
const _scratchM4 = new THREE.Matrix4();
const _scratchV1 = new THREE.Vector3();
const _scratchV2 = new THREE.Vector3();
const _scratchBox = new THREE.Box3();

function findHit(intersections) {
  for (const it of intersections) {
    let o = it.object, visible = true, found = null;
    while (o) {
      if (o.visible === false) { visible = false; break; }
      if (!found && o.userData.hitId) found = o.userData.hitId;
      o = o.parent;
    }
    if (visible && found) return { id: found, object: it.object };
  }
  return null;
}
function castFromCamera() { raycaster.setFromCamera(pointerNdc, camera); return findHit(raycaster.intersectObjects(state.selectables, false)); }
function castFromController(controller) {
  _scratchM4.identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_scratchM4);
  return findHit(raycaster.intersectObjects(state.selectables, false));
}

function setHover(id) {
  if (state.hovered === id) return;
  if (state.hovered && state.hits[state.hovered]) tint(state.hits[state.hovered], false);
  state.hovered = id;
  if (state.hovered && state.hits[state.hovered]) tint(state.hits[state.hovered], true);
  const step = state.session?.step;
  // A grab cursor on the live target of a turn/drag step signals "manipulate
  // this," distinct from the plain pointer every click-style target gets —
  // the same object shouldn't look identically interactive for two very
  // different physical gestures.
  const manipulable = step && id === step.target && (step.kind === "turn" || step.kind === "drag");
  document.body.style.cursor = id ? (manipulable ? "grab" : "pointer") : "default";
}
function tint(root, on) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || o.material.emissive === undefined) return;
    if (o.material.map) return;
    if (on) {
      if (!o.userData.baseMaterial) o.userData.baseMaterial = o.material;
      const c = o.userData.baseMaterial.clone();
      c.userData.ownMaterial = true;
      c.emissive = new THREE.Color(0x4fd1ff);
      c.emissiveIntensity = 0.4;
      o.material = c;
    } else if (o.userData.baseMaterial) {
      if (o.material !== o.userData.baseMaterial) o.material.dispose();
      o.material = o.userData.baseMaterial;
    }
  });
}

function activate(id) {
  if (!id) return;
  if (!state.session) {
    if (id.startsWith("enter-")) { Sfx.good(); enterSim(id.slice(6)); }
    return;
  }
  lastActivatedId = id;
  state.session.select(id);
  syncHud();
}

/** A floating "+120" over the score chip — cheap, satisfying, no 3D cost. */
let scorePopSeq = 0;
function scorePop(text, big) {
  const id = ++scorePopSeq;
  store.patch("hud", (hud) => ({ scorePops: [...hud.scorePops, { id, text, big }] }));
  setTimeout(() => {
    store.patch("hud", (hud) => ({ scorePops: hud.scorePops.filter((p) => p.id !== id) }));
  }, 900);
}
function pressStart(id) {
  const s = state.session;
  if (!s || !s.step) return;
  if ((s.step.kind === "hold" || s.step.kind === "track") && id === s.step.target) s.setHolding(true);
}
function pressEnd() { state.session?.setHolding(false); }

// ---------------------------------------------------- turn & drag: embodied interaction
//
// A 'select' step is a click; these two kinds ask for something closer to a
// real hand: spinning a valve wheel by dragging it round, or picking an object
// up and carrying it to where it belongs. Both route through the same
// pointer/controller plumbing the rest of the app already uses — a raycast
// finds what you grabbed, then every frame moves or rotates it while you hold.

let dragState = null;   // { id, object, homeLocal, controller, plane }
let turnState = null;   // { id, cx, cy, lastAngle } — desktop only; VR tracks per-controller
const returning = [];   // objects springing back to homeLocal after a missed drop

function beginDrag(id, controller) {
  const obj = state.hits[id];
  if (!obj || !state.session?.canDrag(id)) return false;
  const worldPos = new THREE.Vector3();
  obj.getWorldPosition(worldPos);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
  plane.setFromNormalAndCoplanarPoint(plane.normal, worldPos);
  dragState = { id, object: obj, homeLocal: obj.position.clone(), controller: controller ?? null, plane };
  document.body.style.cursor = "grabbing";
  state.api?.onDragStart?.(id);
  return true;
}

function updateDrag() {
  if (!dragState) return;
  const { object, plane, controller } = dragState;
  let ok;
  if (controller) {
    _scratchM4.identity().extractRotation(controller.matrixWorld);
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(_scratchM4);
    ok = raycaster.ray.intersectPlane(plane, _scratchV1);
  } else {
    raycaster.setFromCamera(pointerNdc, camera);
    ok = raycaster.ray.intersectPlane(plane, _scratchV1);
  }
  if (!ok) return;
  const local = _scratchV2.copy(_scratchV1);
  object.parent.worldToLocal(local);
  local.y = dragState.homeLocal.y; // carried along the ground, not lifted or dropped
  object.position.copy(local);
}

function endDrag() {
  if (!dragState) return;
  const { id, object, homeLocal } = dragState;
  const step = state.session?.step;
  let result = null;
  if (step?.kind === "drag" && step.target === id) {
    const socket = state.hits[step.drag?.to];
    let dist = null;
    if (socket) {
      // Horizontal alignment only — a carried object is dragged along a fixed
      // height while its socket (a trench floor, a shaft, a mounting point)
      // often sits at a different height, so the vertical gap between the
      // carry plane and the resting spot must never count against the player.
      const a = new THREE.Vector3(); object.getWorldPosition(a); a.y = 0;
      const b = new THREE.Vector3(); socket.getWorldPosition(b); b.y = 0;
      dist = a.distanceTo(b);
    }
    lastActivatedId = id;
    result = state.session.dropAt(id, dist);
    if (result?.kind === "ok" && socket) {
      // Snap to the socket's full transform, not just its position, so a
      // plate or panel that has to sit a particular way round lands correctly
      // — matching world rotation converted into the object's own parent
      // space, exactly like the position conversion just above it.
      const snapped = new THREE.Vector3(); socket.getWorldPosition(snapped);
      object.parent.worldToLocal(snapped);
      object.position.copy(snapped);
      const socketQuat = new THREE.Quaternion(); socket.getWorldQuaternion(socketQuat);
      const parentQuat = new THREE.Quaternion(); object.parent.getWorldQuaternion(parentQuat);
      object.quaternion.copy(parentQuat.invert().multiply(socketQuat));
    }
  }
  if (result?.kind !== "ok") returning.push({ object, from: object.position.clone(), to: homeLocal.clone(), t: 0 });
  state.api?.onDragEnd?.(id, result?.kind === "ok");
  dragState = null;
  document.body.style.cursor = "default";
  syncHud();
}

function beginTurn(id, clientX, clientY) {
  const obj = state.hits[id];
  if (!obj || state.session?.step?.kind !== "turn" || state.session.step.target !== id) return false;
  const p = new THREE.Vector3();
  obj.getWorldPosition(p);
  p.project(camera);
  const r = canvas.getBoundingClientRect();
  const cx = (p.x * 0.5 + 0.5) * r.width + r.left;
  const cy = (-p.y * 0.5 + 0.5) * r.height + r.top;
  turnState = { id, cx, cy, lastAngle: Math.atan2(clientY - cy, clientX - cx) };
  document.body.style.cursor = "grabbing";
  return true;
}

function updateTurn(clientX, clientY) {
  if (!turnState) return;
  const angle = Math.atan2(clientY - turnState.cy, clientX - turnState.cx);
  let delta = angle - turnState.lastAngle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  turnState.lastAngle = angle;
  lastActivatedId = turnState.id;
  state.session?.rotate(turnState.id, delta / (Math.PI * 2));
  syncHud();
}

function endTurn() { turnState = null; document.body.style.cursor = "default"; }

/** Drive the actual mesh rotation from engine state — a pure reflection, never
 * the source of truth, so the checker's direct rotate() calls stay in sync
 * with whatever the 3D scene shows a real player. */
function syncTurnVisual() {
  const s = state.session;
  if (s?.step?.kind !== "turn" || !s.turn) return;
  const obj = state.hits[s.step.target];
  if (!obj) return;
  const node = obj.userData.wheel ?? obj;
  const axis = s.step.turn?.axis ?? "y";
  node.rotation[axis] = s.turn.amount * Math.PI * 2 * (s.step.turn?.reverse ? -1 : 1);
}

// Desktop -------------------------------------------------------------------

let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0, downAt = 0, downId = null;
const keys = Object.create(null);
// SmartCiti.X is the only one of the three apps with real text inputs (the
// crew-tag name field, the scenario editor's name/tagline/par fields) — WASD,
// M and Escape must stay text while one of those has focus, not drive the
// rig, toggle mute, or discard whatever the learner is typing.
function isTypingTarget(e) {
  const tag = e.target?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
// ------------------------------------------------------- keyboard operation
//
// The whole procedure is operable without a pointer: Tab walks the controls
// this step can act on, in the order the procedure names them; Enter takes
// the one in focus; the arrows work an analogue control; the space bar is the
// hold. The focused control is tinted the same way a hover tints it, and is
// read out through the live region. See shared/a11y.js for why the flat mode
// is the accessible path and the headset modes are not.
const kbCursor = createTargetCursor();
let kbActive = false;          // the learner has used the keyboard at least once
let kbCarrying = null;         // the id picked up by Enter on a drag step

/** The controls this step can act on, in procedure order, plus a drag socket. */
function targetsForStep(step) {
  if (!step) return [];
  const base = step.kind === "sequence" || step.kind === "find"
    ? [...(step.targets ?? [])]
    : step.target ? [step.target] : [];
  if (step.kind === "drag" && step.drag?.to) base.push(step.drag.to);
  return base.filter((id) => state.hits[id]);
}
/** Readable names for the controls, from the step's own item names. */
function targetNames(step) {
  return { ...(step?.itemNames ?? {}) };
}
function kbFocus(id, { announceIt = true } = {}) {
  if (!id) return;
  kbActive = true;
  kbCursor.focus(id);
  setHover(id);
  if (!announceIt) return;
  const step = state.session?.step;
  const pos = [kbCursor.index + 1, kbCursor.ids.length];
  srAnnouncer.say(describeTarget(id, step, { names: targetNames(step), position: pos }));
}
function kbStep(dir) {
  const step = state.session?.step;
  kbCursor.set(targetsForStep(step));
  const id = dir > 0 ? kbCursor.next() : kbCursor.prev();
  kbFocus(id);
}
/** Enter: take the focused control the way this step expects. */
function kbActivate() {
  const s = state.session;
  const id = kbCursor.current;
  if (!s || !s.step || !id) return;
  const step = s.step;
  if (step.kind === "drag") {
    if (!kbCarrying && id === step.target) {
      kbCarrying = id;
      srAnnouncer.say(`Picked up. Tab to where it belongs, then press Enter to place it.`);
      return;
    }
    if (kbCarrying) { s.dropAt(id, 0); kbCarrying = null; syncHud(); return; }
  }
  lastActivatedId = id;
  activate(id);
}
/** Arrows: work an analogue control — a gauge reading or a valve's turns. */
function kbAdjust(delta) {
  const s = state.session;
  const step = s?.step;
  if (!step) return false;
  if (step.kind === "gauge" && s.gauge) {
    s.gauge.t = Math.max(0, Math.min(1, s.gauge.t + delta * 0.04));
    s.gauge.dir = 0;  // the arrows take over from the sweep
    syncHud();
    return true;
  }
  if (step.kind === "track" && s.track) {
    s.track.v = Math.max(0, Math.min(1, s.track.v + delta * 0.05));
    return true;
  }
  if (step.kind === "turn") { s.rotate(step.target, delta * 0.08); syncHud(); return true; }
  return false;
}

/** Put the cursor somewhere sensible before acting on it. A pad's A button
 * and a "hold" key with nothing yet focused used to do nothing at all; now
 * they take the first control the step names, which is what a learner means. */
function ensureFocus() {
  if (kbCursor.current) return kbCursor.current;
  kbCursor.set(targetsForStep(state.session?.step));
  const id = kbCursor.current;
  if (id) kbFocus(id);
  return id;
}

/** A turn step, from a key or a bumper: the same rotate() a mouse arc or a
 * wrist roll calls, in fixed increments. */
function kbTurn(dir, scale = 1) {
  const s = state.session;
  if (s?.step?.kind !== "turn") return false;
  lastActivatedId = s.step.target;
  s.rotate(s.step.target, dir * 0.08 * Math.max(0.25, scale));
  syncHud();
  return true;
}

// -------------------------------------------- bindings, the pad, one router
//
// Every device that is not a hand speaks through runAction(): a key resolved
// through the saved bindings, a gamepad button edge-detected by
// shared/input.js, or a voice command that only ever navigates. One router is
// what makes the interface brief's fallback rule structural rather than
// aspirational — an action a pad can reach is an action a key can reach,
// because they are the same action.

let bindings = loadBindings();
let remapping = null;         // the action the panel is waiting for a key for
let lastSpoken = "";          // what "repeat" says again
let hudZoom = 1;              // what "bigger"/"smaller" set outside AR

/** True while the flat-mode step actions should reach the procedure. Anything
 * that pauses the world — an overlay, the pre-brief, the instructor's freeze,
 * the results card — also parks the input, so a key press cannot work a
 * control the learner cannot see. */
function canOperate() {
  const ui = store.get();
  return !!state.session && !renderer.xr.isPresenting && !state.paused
    && !ui.prebrief.visible && !ui.controls.visible;
}

/** The Escape path: topmost overlay first, so an overlay opened mid-run
 * closes rather than ejecting the learner to the hub underneath it. */
function backAction() {
  const ui = store.get();
  if (ui.controls.visible) { closeControls(); return true; }
  if (ui.prebrief.visible) { prebriefClose(); return true; }
  if (ui.records.visible) { closeRecords(); return true; }
  if (ui.leaderboard.visible) { closeLeaderboard(); return true; }
  if (ui.programs.visible) { closePrograms(); return true; }
  if (ui.flows.visible) { closeFlows(); return true; }
  if (ui.editor.visible) { closeEditor(); return true; }
  if (state.session) { state.tour = null; store.patch("results", { visible: false }); enterHub(); return true; }
  return false;
}

/**
 * One action, whatever produced it. Returns true when it did something, which
 * is what tells the keyboard handler whether to swallow the key.
 * `info` carries a pad's `{ value, phase, repeat, analog }`.
 */
function runAction(action, info = {}) {
  switch (action) {
    case "controls": toggleControls(); return true;
    case "back": return backAction();
    case "mute":
      Sfx.muted = !Sfx.muted;
      srAnnouncer.say(Sfx.muted ? "Muted." : "Sound on.");
      return true;
    case "voice": toggleVoice(); return true;
    case "speakHint": Sfx.ensure(); announce(currentHintLine()); return true;
    default: break;
  }
  if (!canOperate()) return false;
  switch (action) {
    case "focusNext": kbStep(1); return true;
    case "focusPrev": kbStep(-1); return true;
    case "activate": ensureFocus(); kbActivate(); return true;
    case "hold": {
      if (info.phase === "end") { pressEnd(); return true; }
      if (info.repeat) return true;   // a held key repeats; the hold is already on
      const id = ensureFocus();
      if (id) pressStart(id);
      return true;
    }
    case "adjustUp":
    case "adjustDown": {
      const magnitude = info.analog ? Math.max(0.3, Math.min(1, info.value ?? 1)) : 1;
      const dir = action === "adjustUp" ? 1 : -1;
      if (state.session?.step?.kind === "turn") return kbTurn(dir, magnitude);
      const did = kbAdjust(dir * magnitude);
      if (did) kbActive = true;
      return did;
    }
    case "turnLeft": return kbTurn(-1, info.analog ? info.value : 1);
    case "turnRight": return kbTurn(1, info.analog ? info.value : 1);
    default: return false;
  }
}

function onKeyDown(e) {
  if (isTypingTarget(e)) return;
  keys[e.code] = true;
  const token = keyToken(e);
  // Click-to-remap: while the panel is waiting, this press is data, not a
  // command, so nothing it happens to be bound to runs.
  if (remapping) {
    e.preventDefault?.();
    if (/^(Shift|Control|Alt|Meta)(Left|Right)$/.test(e.code)) return;
    if (e.code === "Escape") { remapping = null; syncControlsPanel({ remapNote: "Remap cancelled — nothing changed." }); return; }
    const action = remapping;
    remapping = null;
    bindings = saveBindings(remapAction(bindings, action, token));
    syncControlsPanel({ remapNote: `${prettyKey(token)} now runs “${ACTION_LABELS[action] ?? action}”.` });
    return;
  }
  const action = actionForKey(bindings, token);
  if (!action) return;
  // Tab must not walk the browser's own focus while it is walking the step's
  // controls, and the space bar must not scroll the page — but a key that did
  // nothing (Tab at the hub, with no station running) is left to the browser.
  if (runAction(action, { source: "key", repeat: !!e.repeat })) e.preventDefault?.();
}

function onKeyUp(e) {
  if (isTypingTarget(e)) return;
  keys[e.code] = false;
  if (actionForKey(bindings, keyToken(e)) === "hold" && state.session) { e.preventDefault?.(); pressEnd(); }
}

addEventListener("keydown", onKeyDown);
addEventListener("keyup", onKeyUp);

// ------------------------------------------------------- the controls panel
//
// Opened from the toolbar button, the bound key (`/` or F1 by default), a
// pad's Start button, or the voice command "controls". It is an overlay like
// the others, so it pauses the world and Escape closes it topmost-first.

const ACTION_LABELS = Object.fromEntries(INPUT_ACTIONS.map((a) => [a.id, a.label]));
let tabPicked = false;   // has the learner chosen a tab, or is the device choosing

function syncControlsPanel(extra = {}) {
  store.patch("controls", {
    preset: bindings.preset,
    presets: PRESET_IDS.map((id) => ({ id, label: KEYBOARD_PRESETS[id].label, note: KEYBOARD_PRESETS[id].note })),
    rows: describeBindings(bindings),
    remapping,
    ...extra,
  });
}

function openControls() {
  pausedBeforeOverlay = state.paused;
  state.paused = true;
  // Which tabs this device is offered, and in what order: a DEVICES entry's
  // own `input` object when it has one, the run profile otherwise. The app
  // never sniffs the hardware itself (shared/devices.js owns that).
  const io = describeInputs(DEVICE, PROFILE);
  // Until the learner picks a tab themselves, the panel opens on the one the
  // device leads with: a voice-first monocular should not open on a keyboard
  // page nobody on that device can read comfortably.
  const held = tabPicked ? store.get().controls.tab : null;
  store.patch("controls", {
    visible: true,
    tabs: io.tabs,
    tab: io.tabs.includes(held) ? held : io.tabs[0],
    inputSource: io.source, hands: io.hands, voiceFirst: io.voiceFirst,
    deviceLine: describeDevice(DEVICE, PROFILE),
    padMap: describeGamepadMap(gamepad.vendor),
    grammar: VOICE_GRAMMAR.map((g) => ({ type: g.type, say: g.phrases, what: g.what, scope: g.scope })),
    heard: store.get().voice.heard,
    remapNote: "",
  });
  syncControlsPanel();
  srAnnouncer.say("Controls. Keyboard, gamepad and voice.");
}
function closeControls() {
  remapping = null;
  state.paused = pausedBeforeOverlay;
  store.patch("controls", { visible: false, remapping: null, remapNote: "" });
}
function toggleControls() { if (store.get().controls.visible) closeControls(); else openControls(); }
function controlsTab(tab) { tabPicked = true; store.patch("controls", { tab }); }
function controlsPreset(id) {
  bindings = saveBindings({ preset: id, keys: KEYBOARD_PRESETS[id]?.keys });
  remapping = null;
  syncControlsPanel({ remapNote: `${KEYBOARD_PRESETS[bindings.preset].label} preset loaded.` });
}
function controlsRemap(action) {
  remapping = remapping === action ? null : action;
  syncControlsPanel({ remapNote: remapping ? `Press the key for “${ACTION_LABELS[action] ?? action}”. Esc cancels.` : "" });
}
function controlsResetBindings() {
  bindings = resetBindings(bindings.preset);
  remapping = null;
  syncControlsPanel({ remapNote: "Back to this preset's own keys." });
}
function controlsNumbers(on) {
  store.patch("controls", { numbers: !!on });
  srAnnouncer.say(on ? "Numbers shown." : "Numbers hidden.");
}

// ----------------------------------------------------------- the gamepad
//
// Flat/desktop mode only: inside an immersive session the controllers arrive
// as XRInputSource.gamepad and xrMove() below already reads those. The
// mapping, the deadzone and the edge detection are all in shared/input.js so
// tools/check_input.mjs can drive them with a fake pad.

let fakePads = null;            // set only by the headless test hook
let padReadoutAt = 0;

function padLook({ dx = 0, dy = 0, dt = 1 / 60 } = {}) {
  if (renderer.xr.isPresenting) return;
  yaw -= dx * 2.6 * dt;
  pitch = clamp(pitch - dy * 2.0 * dt, -1.2, 1.2);
  camera.rotation.set(pitch, yaw, 0);
}
function padWalk({ dx = 0, dy = 0, dt = 1 / 60 } = {}) {
  if (renderer.xr.isPresenting || state.mode === "ar") return;
  const speed = 2.6 * dt;
  const f = _scratchV1.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  const r = _scratchV2.set(-f.z, 0, f.x);
  rig.position.addScaledVector(f, -dy * speed);
  rig.position.addScaledVector(r, dx * speed);
  clampRoam();
}

const gamepad = createGamepad({
  getGamepads: () => fakePads ?? (navigator.getGamepads ? navigator.getGamepads() : []),
  shouldPoll: () => !renderer.xr.isPresenting,
  onAction: (action, info) => {
    if (action === "look") { padLook(info); return; }
    if (action === "walk") { padWalk(info); return; }
    runAction(action, info);
  },
  onConnect: (snap) => {
    store.patch("controls", {
      gamepad: { ...snap, vendorName: PAD_LABELS[snap.vendor]?.name ?? "Generic" },
      padMap: describeGamepadMap(snap.vendor),
    });
    if (snap.connected) srAnnouncer.say(`${PAD_LABELS[snap.vendor]?.name ?? "A"} gamepad connected. Start opens the controls panel.`);
  },
});

function pollGamepad(dt) {
  const snap = gamepad.poll(dt);
  // The live readout only matters while the panel is open, and a React render
  // per frame for a button nobody is watching is pure waste.
  if (!snap || !store.get().controls.visible) return;
  if (elapsedTotal - padReadoutAt < 0.08) return;
  padReadoutAt = elapsedTotal;
  store.patch("controls", { gamepad: { ...snap, vendorName: PAD_LABELS[snap.vendor]?.name ?? "Generic" } });
}

// Publish the bindings once at start-up, not only when the panel opens: the
// HUD's crib line in the corner names the live keys, and on a saved non-default
// preset the defaults would be a lie.
syncControlsPanel({ padMap: describeGamepadMap(gamepad.vendor) });

const canvas = renderer.domElement;
canvas.addEventListener("pointerdown", (e) => {
  if (renderer.xr.isPresenting) return;
  updateNdc(e);
  const hit = castFromCamera();
  if (hit?.id && beginDrag(hit.id, null)) { downAt = performance.now(); return; }
  if (hit?.id && beginTurn(hit.id, e.clientX, e.clientY)) { downAt = performance.now(); return; }
  dragging = true; lastX = e.clientX; lastY = e.clientY; downAt = performance.now();
  downId = hit?.id ?? null;
  if (downId) pressStart(downId);
});
addEventListener("pointerup", (e) => {
  if (renderer.xr.isPresenting) return;
  if (dragState) { endDrag(); return; }
  if (turnState) { endTurn(); return; }
  dragging = false; pressEnd();
  if (performance.now() - downAt < 280 && downId) {
    updateNdc(e);
    const hit = castFromCamera();
    if (hit && hit.id === downId) activate(hit.id);
  }
  downId = null;
});
// A touch can be cancelled by the OS (an incoming call, a system gesture) with
// no pointerup at all — without this a phone could get stuck mid-drag/turn.
addEventListener("pointercancel", () => {
  if (renderer.xr.isPresenting) return;
  if (dragState) { endDrag(); return; }
  if (turnState) { endTurn(); return; }
  dragging = false; pressEnd();
  downId = null;
});
addEventListener("pointermove", (e) => {
  if (renderer.xr.isPresenting) return;
  updateNdc(e);
  if (turnState) { updateTurn(e.clientX, e.clientY); return; }
  if (dragState) return; // followed every frame in the render loop instead
  if (dragging) {
    yaw -= (e.clientX - lastX) * 0.0038;
    pitch = clamp(pitch - (e.clientY - lastY) * 0.0038, -1.2, 1.2);
    lastX = e.clientX; lastY = e.clientY;
    camera.rotation.set(pitch, yaw, 0);
  }
});
function updateNdc(e) {
  const r = canvas.getBoundingClientRect();
  pointerNdc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}
function desktopMove(dt) {
  const speed = (keys.ShiftLeft ? 4.4 : 2.6) * dt;
  const f = _scratchV1.set(-Math.sin(yaw), 0, -Math.cos(yaw));
  const r = _scratchV2.set(-f.z, 0, f.x);
  if (keys.KeyW || keys.ArrowUp) rig.position.addScaledVector(f, speed);
  if (keys.KeyS || keys.ArrowDown) rig.position.addScaledVector(f, -speed);
  if (keys.KeyD || keys.ArrowRight) rig.position.addScaledVector(r, speed);
  if (keys.KeyA || keys.ArrowLeft) rig.position.addScaledVector(r, -speed);
  clampRoam();
}
// How far the learner may walk. The stage owns this now: the site apron's
// fence line outdoors, the room's walls indoors. It used to be the station's
// own footprint plus 2.4m, which fenced the learner into the middle of a
// 15-metre plaza and made every station a diorama you turned on the spot in.
// Shared with the gamepad's right stick, which walks the same rig.
function clampRoam() {
  const limit = state.stage?.roam ?? (state.session ? (state.room?.footprint ?? 2) + 2.4 : 9.5);
  const len = Math.hypot(rig.position.x, rig.position.z);
  if (len > limit) { rig.position.x *= limit / len; rig.position.z *= limit / len; }
}

// XR controllers (VR) --------------------------------------------------------

const controllers = [];
for (let i = 0; i < 2; i++) {
  const c = renderer.xr.getController(i);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]),
    new THREE.LineBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.7 }));
  c.add(line);
  c.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), new THREE.MeshBasicMaterial({ color: 0x4fd1ff })));
  c.addEventListener("selectstart", () => {
    if (state.mode === "ar" && !state.placed) { placeFromReticle(); return; }
    const hit = castFromController(c);
    if (hit?.id && beginDrag(hit.id, c)) return;
    if (hit?.id && state.session?.step?.kind === "turn" && state.session.step.target === hit.id) {
      c.userData.turning = true; c.userData.lastRoll = c.rotation.z;
      return;
    }
    c.userData.downId = hit?.id ?? null;
    if (hit?.id) pressStart(hit.id);
  });
  c.addEventListener("selectend", () => {
    pressEnd();
    if (dragState?.controller === c) { endDrag(); return; }
    if (c.userData.turning) { c.userData.turning = false; return; }
    if (state.mode === "ar" && !state.placed) return;
    const hit = castFromController(c);
    if (hit && hit.id === c.userData.downId) activate(hit.id);
    c.userData.downId = null;
  });
  rig.add(c);
  controllers.push(c);
}
// XR hands -------------------------------------------------------------------
//
// The same verbs as the controllers, driven by the learner's actual hands on a
// headset that tracks them. A pinch is the trigger, a fist is the grip, and a
// wrist roll while gripping turns whatever a turn step is asking for — which
// is the gesture the real tool needs anyway. Nothing below knows or cares
// which device produced the verb. See shared/hands.js.
const handInput = createHandInput(renderer, rig, {
  decorate(hand) {
    // Joint spheres, so the learner can see where the runtime thinks their
    // hand is. Cheap: twenty-five instances of one geometry and one material.
    const geo = new THREE.SphereGeometry(0.008, 8, 6);
    const matl = new THREE.MeshBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.85 });
    const dots = new THREE.InstancedMesh(geo, matl, 25);
    dots.frustumCulled = false;
    dots.userData.handDots = true;
    hand.add(dots);
  },
  onSelectStart(hand) {
    if (state.mode === "ar" && !state.placed) { placeFromReticle(); return; }
    const hit = castFromController(hand);
    hand.userData.downId = hit?.id ?? null;
    if (hit?.id) pressStart(hit.id);
  },
  onSelectEnd(hand) {
    pressEnd();
    if (state.mode === "ar" && !state.placed) return;
    const hit = castFromController(hand);
    if (hit && hit.id === hand.userData.downId) activate(hit.id);
    hand.userData.downId = null;
  },
  onGrabStart(hand) {
    const hit = castFromController(hand);
    if (hit?.id && beginDrag(hit.id, hand)) return;
    // A fist on a turn step's target takes hold of it; the roll below turns it.
    if (hit?.id && state.session?.step?.kind === "turn" && state.session.step.target === hit.id) {
      hand.userData.turning = hit.id;
    }
  },
  onGrabEnd(hand) {
    if (dragState?.controller === hand) { endDrag(); return; }
    hand.userData.turning = null;
  },
  onRoll(hand, delta) {
    if (hand.userData.turning) state.session?.rotate(hand.userData.turning, delta / (Math.PI * 2));
  },
  onPose(hand, pose) {
    // Point to aim: the ray only shows when the learner is actually pointing,
    // so an open hand at rest does not paint a line across the station.
    const dots = hand.children.find((c) => c.userData?.handDots);
    if (dots) dots.visible = pose.tracked;
    hand.userData.pose = pose;
  },
});
void HAND_HINTS;

let snapReady = true;
function xrMove(dt) {
  if (state.mode === "ar") return; // AR: the learner physically walks
  const session = renderer.xr.getSession();
  if (!session) return;
  for (const source of session.inputSources) {
    const gp = source.gamepad;
    if (!gp || gp.axes.length < 2) continue;
    const fourAxis = gp.axes.length >= 4;
    const axX = fourAxis ? gp.axes[2] : gp.axes[0];
    const axY = fourAxis ? gp.axes[3] : gp.axes[1];
    if (source.handedness === "left") {
      const head = _scratchV1;
      camera.getWorldDirection(head); head.y = 0;
      if (head.lengthSq() < 1e-6) continue;
      head.normalize();
      const right = _scratchV2.set(-head.z, 0, head.x);
      rig.position.addScaledVector(head, -axY * 2.2 * dt);
      rig.position.addScaledVector(right, axX * 2.2 * dt);
    } else if (source.handedness === "right") {
      if (Math.abs(axX) < 0.35) snapReady = true;
      else if (snapReady) { rig.rotation.y -= Math.sign(axX) * (Math.PI / 6); snapReady = false; }
    }
  }
}

// ------------------------------------------------------------------ AR mode

let xrSession = null, hitTestSource = null, refSpace = null, viewerSpace = null;
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(0.06, 0.08, 32),
  new THREE.MeshBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.9 }));
reticle.rotation.x = -Math.PI / 2;
reticle.visible = false;
scene.add(reticle);
let lastHitPose = null;

function placeFromReticle() {
  if (!lastHitPose || state.placed) return;
  placement.position.set(lastHitPose.x, lastHitPose.y, lastHitPose.z);
  placement.quaternion.set(0, 0, 0, 1); // upright, ignore surface tilt for stable footing
  state.placed = true;
  reticle.visible = false;
  store.patch("arPrompt", { visible: false });
  Sfx.good();
}
function scaleUp() { placement.scale.multiplyScalar(1.15); }
function scaleDown() { placement.scale.multiplyScalar(1 / 1.15); }

async function startXr(mode) {
  const opts = mode === "ar"
    ? { requiredFeatures: ["hit-test"], optionalFeatures: ["local-floor", "dom-overlay", "hand-tracking"], domOverlay: { root: document.body } }
    : { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"] };
  const session = await navigator.xr.requestSession(mode === "ar" ? "immersive-ar" : "immersive-vr", opts);
  xrSession = session;
  await renderer.xr.setSession(session);
  state.mode = mode;
  if (mode === "ar") {
    refSpace = renderer.xr.getReferenceSpace();
    viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
  }
  begin();
  vrPanel.visible = true;
  vrHudDirty = true;
  session.addEventListener("end", () => {
    vrPanel.visible = false;
    hitTestSource = null;
    xrSession = null;
  });
}

// In-headset / in-AR HUD panel, low-centre so it never masks the work surface.
const vrCanvas = document.createElement("canvas");
vrCanvas.width = 1024; vrCanvas.height = 340;
const vrCtx = vrCanvas.getContext("2d");
const vrTexture = new THREE.CanvasTexture(vrCanvas);
const vrPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), new THREE.MeshBasicMaterial({ map: vrTexture, transparent: true, toneMapped: false }));
vrPanel.position.set(0, -0.4, -1.0);
vrPanel.rotation.x = -0.35;
vrPanel.renderOrder = 10;
vrPanel.visible = false;
camera.add(vrPanel);

function wrapText(g, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  let line = "", lines = 0;
  for (const word of words) {
    if (g.measureText(line + word).width > maxWidth) {
      g.fillText(line, x, y); y += lineHeight; line = ""; lines++;
      if (lines >= maxLines) { g.fillText("…", x, y); return; }
    }
    line += word + " ";
  }
  g.fillText(line, x, y);
}
function drawVrHud() {
  const g = vrCtx, w = vrCanvas.width, h = vrCanvas.height;
  const accent = state.room?.accentCss ?? HUD.accent;
  const hud = store.get().hud;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(10,17,23,0.9)"; g.fillRect(0, 0, w, h);
  const stateColour = { ok: HUD.good, warn: HUD.warn, danger: HUD.danger, neutral: HUD.edge }[hud.railState] ?? HUD.edge;
  g.fillStyle = stateColour; g.fillRect(0, 0, 12, h);
  g.fillStyle = accent;
  g.font = `600 34px 'Barlow Condensed', Arial, sans-serif`;
  g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(hud.room, 36, 40);
  g.fillStyle = HUD.text;
  g.font = `600 40px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(hud.step, 36, 90);
  g.fillStyle = HUD.muted; g.font = `26px Arial, sans-serif`;
  wrapText(g, hud.cue, 36, 140, w - 300, 32, 3);
  g.fillStyle = HUD.text; g.font = `26px Arial, sans-serif`;
  wrapText(g, stripHtml(hud.feedbackHtml), 36, 236, w - 300, 30, 2);
  g.textAlign = "right"; g.fillStyle = accent;
  g.font = `600 56px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(hud.score, w - 34, 62);
  g.fillStyle = HUD.muted; g.font = `600 26px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(hud.comboText, w - 34, 108);
  g.fillText(hud.count + "   " + hud.timer, w - 34, 144);
  g.textAlign = "left";
  g.fillStyle = "#1d2833"; g.fillRect(36, h - 34, w - 70, 10);
  g.fillStyle = accent;
  g.fillRect(36, h - 34, (w - 70) * (state.session ? state.session.progress01 : Progress.roomsClearedIn(allSims().map((s) => s.id)) / allSims().length), 10);
  if (Perf.enabled) { g.fillStyle = HUD.muted; g.font = "22px ui-monospace, Menlo, Consolas, monospace"; g.fillText(Perf.text(), 36, h - 58); }
  vrTexture.needsUpdate = true;
}

// -------------------------------------------------------------------- intro

let deepLink = new URLSearchParams(location.search).get("sim");
let pendingEnter = null; // set by the scenario editor's "Save & play" / "Play"
function begin() {
  store.patch("intro", { visible: false });
  state.paused = false;
  Sfx.ensure();
  if (state.mode === "ar") {
    resetPlacement();
    store.patch("arPrompt", { visible: true });
    store.patch("scaleRow", { visible: true });
  }
  const target = pendingEnter ?? deepLink;
  // One-shot, like pendingEnter: otherwise the next bare begin() — e.g.
  // enterFlat() from the voice "hub" command once no session is active —
  // would silently re-enter the ?sim= station instead of landing on the hub.
  pendingEnter = null;
  deepLink = null;
  if (target && simExists(target)) enterSim(target);
  else enterHub();
}

function enterFlat() { state.mode = "flat"; begin(); }
function resetProgress() {
  Progress.reset(); state.api?.refresh?.(); syncHud();
  store.set({ resetProgressText: "Progress cleared" });
}
if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported("immersive-ar").then((ok) => {
    store.patch("intro", ok ? { arDisabled: false } : { arText: "AR unavailable here" });
  }).catch(() => store.patch("intro", { arText: "AR unavailable here" }));
  navigator.xr.isSessionSupported("immersive-vr").then((ok) => {
    store.patch("intro", ok ? { vrDisabled: false } : { vrText: "VR unavailable here" });
  }).catch(() => store.patch("intro", { vrText: "VR unavailable here" }));
} else {
  store.patch("intro", { arText: "AR unavailable here", vrText: "VR unavailable here" });
}
async function enterAr() {
  try { await startXr("ar"); }
  catch (err) { begin(); setRail("warn", `<b>Could not start AR.</b> ${err?.message ?? err}. Falling back to the desktop view.`); }
}
async function enterVr() {
  try { await startXr("vr"); }
  catch (err) { begin(); setRail("warn", `<b>Could not start VR.</b> ${err?.message ?? err}. Falling back to the desktop view.`); }
}

// ------------------------------------------------------------------- voice
//
// Navigation and assistive narration only, deliberately: "go to the valve
// vault," "leaderboards," "guided tour," "campus," "hint," "brief," "status."
// Every navigation command routes through the exact same action a click
// already triggers — nothing new to verify in the procedure engine itself.
// This never activates a step inside a running procedure; the hands-on
// click/drag/turn is the point of a hands-on trainer, and voice-skipping it
// would undermine the training, not assist it. "Hint"/"brief"/"status" only
// ever read something back — they change nothing in the session.

/** Speak a line unless the player has muted the room with M. */
const srAnnouncer = createAnnouncer();
function announce(text) {
  // Everything spoken is also written to the live region, so a screen reader
  // user gets it whether or not the synthesised voice is on or muted.
  lastSpoken = text;   // what the voice command "repeat" says again
  srAnnouncer.say(text);
  if (!Sfx.muted) speak(text);
}

/** The line the speaker button/voice "hint" command reads back: the live
 * step's title and cue while a procedure is running, otherwise how to start one. */
function currentHintLine() {
  const s = state.session;
  if (s?.step) return `${s.step.title}. ${s.step.cue}`;
  return "Select a station kiosk to begin its procedure.";
}

function speakBrief() {
  if (!state.room) return `${allSims().length} simulators on the campus. Say a station name to begin, like ${SIMS_META[0].name}.`;
  return `${state.room.trade}. ${state.room.tagline}.`;
}

function speakStatus() {
  const ids = allSims().map((s) => s.id);
  return `${Progress.roomsClearedIn(ids)} of ${allSims().length} stations cleared. ${Progress.starsIn(ids)} stars. ` +
    `Level ${Progress.level}, ${Progress.levelName}.`;
}

/** The live step read back in full: where the learner is in the procedure,
 * what the step is called and what it asks for. "read step", and the F-key
 * or the pad's Y button, all land here. */
function currentStepLine() {
  const s = state.session;
  if (!s?.step) return currentHintLine();
  const names = targetNames(s.step);
  const focused = kbCursor.current ? ` Focused: ${names[kbCursor.current] ?? String(kbCursor.current).replace(/[-_]/g, " ")}.` : "";
  return `Step ${Math.min(s.index + 1, s.steps.length)} of ${s.steps.length}. ${s.step.title}. ${s.step.cue}.${focused}`;
}

/** The controls the live step names, as `{ id, name }` — what "focus the tag
 * bag" and "where is the gauge" are matched against. */
function stepTargets() {
  const step = state.session?.step;
  if (!step) return [];
  const names = targetNames(step);
  return targetsForStep(step).map((id) => ({ id, name: names[id] ?? String(id).replace(/[-_]/g, " ") }));
}

/** Where a control is from where the learner is standing and looking. This
 * only describes; the hands still have to go there. */
function describeWhere(id, name) {
  const obj = state.hits[id];
  if (!obj) return `I cannot see the ${name} from here.`;
  const there = obj.getWorldPosition(new THREE.Vector3());
  const here = camera.getWorldPosition(new THREE.Vector3());
  const look = camera.getWorldDirection(new THREE.Vector3());
  look.y = 0;
  const to = there.clone().sub(here);
  const metres = Math.hypot(to.x, to.z);
  to.y = 0;
  let side = "straight ahead";
  if (look.lengthSq() > 1e-6 && to.lengthSq() > 1e-6) {
    look.normalize(); to.normalize();
    const dot = look.x * to.x + look.z * to.z;
    const cross = look.z * to.x - look.x * to.z;
    const angle = Math.atan2(cross, dot) * (180 / Math.PI);
    if (Math.abs(angle) > 140) side = "behind you";
    else if (angle > 35) side = "to your right";
    else if (angle < -35) side = "to your left";
    else if (Math.abs(angle) > 12) side = angle > 0 ? "slightly right" : "slightly left";
  }
  const height = there.y - here.y;
  const level = height > 0.5 ? ", above head height" : height < -0.6 ? ", down at your feet" : "";
  return `The ${name} is about ${metres < 1 ? "a metre" : `${metres.toFixed(1)} metres`} away, ${side}${level}.`;
}

/** Bigger / smaller: the diorama in AR, the 2D chrome everywhere else. On a
 * monocular hardhat display this is the command a learner reaches for most. */
function scaleView(dir) {
  if (state.mode === "ar" && state.placed) {
    if (dir > 0) scaleUp(); else scaleDown();
    return dir > 0 ? "Larger." : "Smaller.";
  }
  hudZoom = clamp(hudZoom + dir * 0.15, 0.8, 2.2);
  const root = document.documentElement;
  root.dataset.hudZoom = "1";
  root.style.setProperty("--hud-scale", String((PROFILE.hudScale ?? 1) * hudZoom));
  return `Display at ${Math.round(hudZoom * 100)} per cent.`;
}

const VoiceSR = window.SpeechRecognition || window.webkitSpeechRecognition;
let voiceRecognition = null;
if (VoiceSR) {
  voiceRecognition = new VoiceSR();
  voiceRecognition.lang = "en-US";
  voiceRecognition.interimResults = false;
  voiceRecognition.maxAlternatives = 1;
  voiceRecognition.onresult = (e) => {
    const transcript = e.results?.[0]?.[0]?.transcript ?? "";
    store.patch("voice", { heard: transcript, listening: false, error: "" });
    handleVoiceCommand(transcript);
  };
  voiceRecognition.onerror = (e) => {
    store.patch("voice", { listening: false, error: `Voice error: ${e.error ?? "unknown"}.` });
  };
  voiceRecognition.onend = () => store.patch("voice", { listening: false });
}

function toggleVoice() {
  if (!voiceRecognition) return;
  if (store.get().voice.listening) { voiceRecognition.stop(); return; }
  Sfx.ensure();
  try {
    store.patch("voice", { listening: true, heard: "", error: "" });
    voiceRecognition.start();
  } catch (err) {
    store.patch("voice", { listening: false, error: String(err?.message ?? err) });
  }
}

/** Longest name first, so "dock crane" cannot shadow-match inside a longer
 * phrase that happens to contain it as a substring. */
const VOICE_SIMS = [...SIMS_META].sort((a, b) => b.name.length - a.name.length);

/** The numbered menu "select item N" resolves against: the intro panel's own
 * buttons first, then every station card, in exactly the order react-ui.js
 * badges them (introMenu() is the single source of that order, so the badge a
 * learner reads and the number this resolves can never drift apart). */
function voiceMenu() {
  return introMenu().map((entry) => ({
    ...entry,
    run: entry.kind === "sim"
      ? () => { pendingEnter = entry.id; begin(); announce(`Entering ${SIMS_META_BY_ID[entry.id]?.name ?? entry.label}.`); }
      : () => { const fn = uiActions[entry.action]; if (fn) { fn(); announce(`${entry.label}.`); } },
  }));
}

/** Station names stay here — this module owns the roster (the built-ins plus
 * the learner's own custom drills) — and everything else is delegated to the
 * grammar in shared/input.js. */
function parseVoiceCommand(text) {
  const lower = String(text ?? "").toLowerCase();
  const sim = VOICE_SIMS.find((s) => lower.includes(s.name.toLowerCase()));
  if (sim) return { type: "sim", id: sim.id };
  return parseVoice(text, { menu: voiceMenu(), targets: stepTargets() });
}

function handleVoiceCommand(text) {
  const cmd = parseVoiceCommand(text);
  store.patch("controls", { heard: String(text ?? "") });
  switch (cmd.type) {
    case "sim": pendingEnter = cmd.id; begin(); announce(`Entering ${SIMS_META_BY_ID[cmd.id]?.name ?? "station"}.`); return;
    case "hub": if (state.session) backToHub(); else enterFlat(); announce("Back at the campus."); return;
    case "leaderboard": viewLeaderboard(); return;
    case "records": viewRecords(); return;
    case "programs": viewPrograms(); return;
    case "tour": startTour(); announce("Starting the guided tour."); return;
    case "editor": openEditor(); return;
    case "reset": resetProgress(); announce("Progress cleared."); return;
    case "help": announce(VOICE_HELP_LINE); return;
    case "hint": announce(currentHintLine()); return;
    case "brief": announce(speakBrief()); return;
    case "status": announce(speakStatus()); return;
    case "controls": openControls(); announce("Controls panel open."); return;
    case "readStep": announce(currentStepLine()); return;
    case "repeat": announce(lastSpoken || currentHintLine()); return;
    case "mute": Sfx.muted = true; srAnnouncer.say("Muted."); return;
    case "unmute": Sfx.muted = false; announce("Sound on."); return;
    case "bigger": announce(scaleView(1)); return;
    case "smaller": announce(scaleView(-1)); return;
    case "showNumbers": controlsNumbers(cmd.on); return;
    case "checkIn": announce(CHECKIN_QUESTION); return;
    case "checkInAnswer": announce(CHECKIN_REPLIES[cmd.answer] ?? CHECKIN_REPLIES.steady); return;
    case "selectItem": {
      const item = cmd.item;
      if (!item) { announce(`There is no item ${cmd.index} on this screen. Say "show numbers" to see them.`); return; }
      item.run();
      return;
    }
    // Focus and "where is" are the whole of what voice may do to a procedure:
    // they move the keyboard cursor and describe. Taking the control is a
    // hand's job — see the interface brief.
    case "next": case "previous": {
      if (!canOperate()) { announce("No station is running. Say a station name to begin."); return; }
      kbStep(cmd.type === "next" ? 1 : -1);
      return;
    }
    case "focus": {
      if (!canOperate()) { announce("No station is running yet."); return; }
      const hit = matchTargetName(cmd.name, stepTargets());
      if (!hit) { announce(`This step does not name a ${cmd.name}. Say "read step" for what it asks for.`); return; }
      kbCursor.set(targetsForStep(state.session?.step));
      kbFocus(hit.id);
      lastSpoken = `Focused ${hit.name}.`;
      return;
    }
    case "whereIs": {
      const hit = matchTargetName(cmd.name, stepTargets());
      if (!hit) { announce(`I cannot place a ${cmd.name} in this step.`); return; }
      announce(describeWhere(hit.id, hit.name));
      return;
    }
    default: break;
  }
  store.patch("voice", { error: `Didn't recognize "${text}" — say "help" for the full list, or "controls" for the panel.` });
  announce('Didn\'t catch that. Say "help" for commands.');
}

// Hoisted rather than passed inline: voiceMenu() runs the same handlers by
// name when a learner says "select item 4", so the panel's buttons and the
// voice path cannot diverge.
const uiActions = {
  viewLeaderboard, closeLeaderboard,
  viewRecords, closeRecords, exportRecordsCsv, exportRecordsXapi, exportCredentials, clearRecords,
  setRecordsTab, exportProofCsv, exportCompetencyBadges, printTranscript,
  viewPrograms, closePrograms, programStart,
  startRobotTraining, stopRobotTraining,
  viewFlows, closeFlows, flowContinue, flowRestart, flowSelect,
  prebriefStart, prebriefSkip, prebriefClose,
  lrsSetEndpoint, lrsSetAuth, lrsConnect, lrsDisconnect, lrsSendAll,
  openEditor, closeEditor, edSelectBase, edToggleStep, edMoveStep,
  edSetName, edSetPar, edSetTagline, edSavePlay, edSaveOnly, edCancel,
  edPlayLibrary, edDeleteLibrary,
  setPlayerNameDraft, commitPlayerName,
  retryResult, backToHub, nextTourStop, startTour, flatSelect,
  enterAr, enterVr, enterFlat, resetProgress,
  scaleUp, scaleDown, toggleVoice,
  speechSupported, speakHint: () => { Sfx.ensure(); speak(currentHintLine()); },
  openControls, closeControls, controlsTab, controlsPreset, controlsRemap, controlsResetBindings,
};
mountUI(store, uiActions);

// Test-only hook: headless test runners can't grant microphone permission
// or produce a real SpeechRecognition result, but the interesting logic is
// the command parsing/routing in handleVoiceCommand, not the browser's own
// recognizer — so expose that directly, the same pattern as Holodeck's
// window.__holodeckTest.
window.__smartcityVoiceTest = { simulate: (text) => handleVoiceCommand(text) };

// Test-only hook for the deep input layer: a headless runner cannot plug in a
// gamepad or hold a key down, but it can hand the poller a fake Standard
// Gamepad and push synthetic key events through the very same handlers a real
// press reaches. Nothing here is a shortcut past the bindings or the edge
// detection — `gamepad()` calls the real poll, `key()` calls the real keydown
// handler — so a passing drive proves the wiring, not a stub.
window.__smartcityInputTest = {
  /** Feed one fake pad (or an array, nulls allowed) and poll it. */
  gamepad: (fakePad, { polls = 1, dt = 1 / 60 } = {}) => {
    fakePads = fakePad == null ? null : (Array.isArray(fakePad) ? fakePad : [fakePad]);
    let snap = null;
    for (let i = 0; i < polls; i++) snap = pollGamepad(dt) ?? gamepad.snapshot();
    return { snapshot: gamepad.snapshot(), focus: kbCursor.current, snap };
  },
  /** "Tab", "Shift+Tab", "KeyM"… down then up, unless `up: false`. */
  key: (code, { up = true, repeat = false } = {}) => {
    const raw = String(code ?? "");
    const shifted = raw.startsWith("Shift+");
    const event = { code: shifted ? raw.slice(6) : raw, shiftKey: shifted, repeat, target: document.body, preventDefault() {} };
    onKeyDown(event);
    if (up) onKeyUp(event);
    return { action: actionForKey(bindings, keyToken(event)), focus: kbCursor.current };
  },
  voice: (text) => handleVoiceCommand(text),
  bindings: () => bindings,
  preset: (id) => { controlsPreset(id); return bindings.preset; },
  pad: () => gamepad.snapshot(),
  action: (name, info) => runAction(name, info ?? {}),
  focus: () => ({ ids: kbCursor.ids, index: kbCursor.index, current: kbCursor.current, active: kbActive }),
  controls: () => store.get().controls,
  menu: () => voiceMenu().map((m, i) => ({ index: i + 1, kind: m.kind, id: m.id, label: m.label })),
};

// Test-only hook: precisely clicking a 3D object's exact screen position
// from an automated browser test is brittle, but the click/turn handlers
// just forward to state.session.select()/rotate() — the same calls this
// exposes directly, so a test can drive the real Session and verify the
// UI reacts correctly without needing to replicate the camera projection.
// Same pattern as Holodeck's window.__holodeckTest.
window.__smartcityTest = {
  select: (id) => state.session?.select(id),
  rotate: (id, delta) => state.session?.rotate(id, delta),
  press: (id) => pressStart(id),
  release: () => pressEnd(),
  session: () => state.session,
  // Scene and camera for live verification scripts (screenshots of the
  // stage districts, headset-budget spot checks); read-only by convention.
  scene: () => scene,
  camera: () => camera,
  // What the renderer actually did for the last frame. A visual upgrade that
  // claims to cost texture memory rather than draw calls has to be checkable,
  // and renderer.info is the only honest place to check it.
  renderInfo: () => ({
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    textures: renderer.info.memory.textures,
    geometries: renderer.info.memory.geometries,
    programs: renderer.info.programs?.length ?? null,
  }),
  stage: () => state.stage,
  // The flow runner, so a live browser test can drive a host's flow the way a
  // host would and read back exactly what the panel and the channel report.
  flow: () => ({
    state: flowRunner.state(), rows: flowRunner.rows(),
    current: (() => { const c = flowRunner.current(); return { flowId: c.flow?.id ?? null, nodeId: c.run?.nodeId ?? null, kind: c.node?.kind ?? null, done: !!c.run?.done }; })(),
  }),
  // The same two handlers the panel's own buttons run, so a live test drives the
  // real actions rather than a copy of them.
  flowContinue: () => flowContinue(),
  openFlows: () => viewFlows(),
  // The station's built controls by id, the group they live in, and the THREE
  // namespace — so a live probe can raycast from the camera to a control and
  // see whether anything is in front of it. The headless checkers know where
  // a control IS; only the renderer knows whether it can be reached. These
  // were missing, and the probe that wanted them reported "no test hook" and
  // then printed a clean bill of health, which is the worst of both.
  hits: () => state.hits,
  stationRoot: () => state.roomRoot,
  THREE: () => THREE,
  perf: () => Perf.snapshot({ enabled: Perf.enabled, log: Perf.list().length }),
  // The keyboard cursor, so an accessibility test can assert that Tab walks
  // the controls the procedure names rather than the scene-graph order.
  keyboard: () => ({ ids: kbCursor.ids, index: kbCursor.index, current: kbCursor.current, active: kbActive }),
};
Perf.mountOverlay();

// --------------------------------------------------------------- frame loop

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let elapsedTotal = 0;

renderer.setAnimationLoop((_, frame) => {
  const rawDt = clock.getDelta();
  const dt = Math.min(rawDt, 0.05);
  elapsedTotal += dt;
  const presenting = renderer.xr.isPresenting;
  // Headset-pass instrument (?perf=1): real frame time, not the clamped one.
  Perf.frame(rawDt);
  if (Perf.sample(renderer, elapsedTotal) && presenting) vrHudDirty = true;

  // AR hit-test: keep the reticle tracking the tapped surface until placed.
  if (state.mode === "ar" && presenting && frame && hitTestSource && !state.placed) {
    const results = frame.getHitTestResults(hitTestSource);
    if (results.length) {
      const pose = results[0].getPose(refSpace);
      if (pose) {
        lastHitPose = pose.transform.position;
        reticle.visible = true;
        reticle.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
      }
    } else reticle.visible = false;
  } else reticle.visible = false;

  // The pad is polled every frame, paused or not: Start has to be able to open
  // the controls panel from the intro card, and Back has to close it again.
  // Inside an immersive session the poller stands down (the XR input sources
  // own the controllers) — see createGamepad's `shouldPoll`.
  if (!presenting) pollGamepad(dt);

  if (!state.paused) {
    if (presenting) { xrMove(dt); handInput.update(); } else desktopMove(dt);
    if (state.session && !state.session.finished) {
      state.session.tick(dt);
      syncAlarm(state.session);
      if (state.session.step?.kind === "hold" || state.session.step?.kind === "track") syncHud();
    }
  }

  const canInteract = state.mode !== "ar" || state.placed;
  let hovering = null;
  if (canInteract) {
    if (presenting) { for (const c of controllers) { const hit = castFromController(c); if (hit) { hovering = hit.id; break; } } }
    else hovering = castFromCamera()?.id ?? null;
  }
  setHover(hovering);

  if (hint.visible && hintTargets.length && canInteract) {
    let best = null, bestDist = Infinity;
    camera.getWorldPosition(_scratchV1);
    for (const t of hintTargets) {
      t.getWorldPosition(_scratchV2);
      const d = _scratchV2.distanceToSquared(_scratchV1);
      if (d < bestDist) { bestDist = d; best = t; }
    }
    if (best) {
      _scratchBox.setFromObject(best);
      const c = _scratchBox.getCenter(_scratchV1);
      hint.position.set(c.x, 0.02, c.z);
      hintPip.position.set(0, Math.max(_scratchBox.max.y + 0.18, 0.6) + Math.sin(elapsedTotal * 2.6) * 0.05, 0);
      hintPip.rotation.y = elapsedTotal * 1.4;
      hintRing.scale.setScalar(1 + Math.sin(elapsedTotal * 2.2) * 0.06);
    }
  }

  const gg = state.session?.gauge;
  if (gauge.visible && gg && canInteract) {
    const halfWidth = 0.62 * 0.45;
    gaugeMarker.position.x = -halfWidth + gg.t * halfWidth * 2;
    const inBand = gg.t >= gg.green[0] && gg.t <= gg.green[1];
    gaugeMarker.material.color.set(inBand ? 0x59c97b : 0xffffff);
    camera.getWorldPosition(_scratchV1);
    gauge.lookAt(_scratchV1.x, gauge.position.y, _scratchV1.z);
    if (elapsedTotal - gaugeReadoutAt > 0.08) {
      gaugeReadoutAt = elapsedTotal;
      const text = state.session.step?.gauge?.readout?.(gg.t) ?? `${Math.round(gg.t * 100)}%`;
      repaint(gaugeReadout, (ctx, w, h) => {
        ctx.fillStyle = "rgba(6,14,20,0.95)"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = inBand ? HUD.good : HUD.text;
        ctx.font = `600 ${Math.round(h * 0.66)}px 'Barlow Condensed', Arial, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(text, w / 2, h * 0.56);
      });
    }
  }

  if (canInteract) {
    // Continuous twist-to-open: sample controller roll each frame while a
    // 'turn' step's target is grabbed, same idea as the desktop screen-angle
    // drag but driven by wrist rotation instead of mouse position.
    if (presenting) {
      for (const c of controllers) {
        if (!c.userData.turning) continue;
        let d = c.rotation.z - c.userData.lastRoll;
        c.userData.lastRoll = c.rotation.z;
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        const targetId = state.session?.step?.target;
        if (targetId) { lastActivatedId = targetId; state.session.rotate(targetId, d / (Math.PI * 2)); syncHud(); }
      }
    }
    updateDrag();
    syncTurnVisual();
  }
  for (let i = returning.length - 1; i >= 0; i--) {
    const r = returning[i];
    r.t = Math.min(1, r.t + dt / 0.3);
    r.object.position.lerpVectors(r.from, r.to, easeOut(r.t));
    if (r.t >= 1) returning.splice(i, 1);
  }
  burst.update(dt);

  if (canInteract) state.api?.animate?.(elapsedTotal, dt, state.session);
  if (state.session && !state.session.finished) { const snap = observerSnapshot(); if (snap) observer.state(snap); }
  state.stage?.animate?.(elapsedTotal, dt);

  if (presenting && vrHudDirty) { drawVrHud(); vrHudDirty = false; }
  renderer.render(scene, camera);
});

state.paused = true;
