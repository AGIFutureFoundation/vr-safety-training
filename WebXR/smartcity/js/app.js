import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { disposeTree, decal, repaint, HUD, clamp, easeOut, celebrationBurst, GESTURE_HINTS } from "../../shared/kit.js";
import { Session, Progress, Sfx, UNIVERSAL_AWARDS } from "../../shared/game.js";
import { speak, speechSupported } from "../../shared/voice-assist.js";
import { TrainingRecords, toCSV, toXAPI, toOpenBadges, earnedCertifications, download } from "../../shared/records.js";
import { Identity } from "../../shared/identity.js";
import { Lrs } from "../../shared/lrs.js";
import { RobotAgent, observe } from "../../shared/robot.js";
import { Platform } from "../../shared/platform.js";
import { Perf } from "../../shared/perf.js";
import { createBroadcaster } from "../../shared/observer.js";
import { createAnnouncer, createTargetCursor, describeTarget, reducedMotion, escapeHtml } from "../../shared/a11y.js";
import { createHandInput, HAND_HINTS } from "../../shared/hands.js";
import { buildStage } from "./stage.js";
import { buildHub } from "./hub.js";
import { SIMS_META } from "./sims-meta.js";
import { CURRICULA, allProgress } from "./curricula.js";
import { CustomScenarios, buildCustomRoom, newScenarioId, estimateParSeconds } from "./scenarios.js";
import { createStore } from "./store.js";
import { mountUI, stripHtml } from "./react-ui.js";

// The 20 sims are lazy-loaded: SIMS_META (see tools/gen_sims_meta.mjs) is the
// small, always-available metadata every display surface (hub kiosks,
// leaderboards, the tour, the editor's base-simulator picker) actually needs;
// a sim's real module — its steps, hazards and build() — is only fetched via
// loadSim() the moment a player actually enters it. This is why
// dist/smartcity-x.html ships as a folder (index.html + sims/ + citykit.js +
// gamify.js) rather than one self-contained file: see tools/bundle_webxr.py.
const SIMS_META_BY_ID = Object.fromEntries(SIMS_META.map((s) => [s.id, s]));
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
  results: { visible: false, html: "", showNext: false, retryPrimary: true },
  // Flipped-classroom pre-brief: a station's steps and the reason for each,
  // shown before the first run of that station (see shared/game.js).
  prebrief: { visible: false, id: "", name: "", trade: "", category: "", tagline: "", certification: "", steps: [], hazardCount: 0 },
  // A flat briefing station (room.flat): dossier + knowledge check rendered as a
  // card instead of a walkable scene, scored by the same Session.
  flat: { visible: false, name: "", category: "", tagline: "", certification: "", dossier: [], stepIndex: 0, stepCount: 0, question: "", cue: "", options: [], picked: [], feedback: null },
  leaderboard: { visible: false, html: "" },
  records: {
    visible: false, rows: [], summary: [], total: 0, passes: 0, credentials: [],
    lrs: { configured: false, host: null, authed: false, pending: 0, last: null, endpointDraft: "", authDraft: "", busy: false, error: null },
  },
  programs: { visible: false, rows: [] },
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
  setRail("neutral", `<b>SmartCiti.X training campus.</b> ${allSims().length} stations across ${categoryCount()} categories, each with its own rank ladder. Select a kiosk to begin.`);
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
  const stage = buildStage(worldRoot, state.mode, scene, room.accent, room.category, room.weather, room.indoor);
  state.stage = stage;
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
    onInterruptEnd: (it) => { state.api?.onInterruptEnd?.(it, state.session); hideAlarm(); kbCursor.set(targetsForStep(state.session?.step ?? {})); },
    onHazard: (hitId, s) => {
      state.api.onHazard?.(hitId, s);
      observer.hazard({ hazardId: hitId, note: room.hazards?.[hitId] ?? "", ...observerSnapshot() });
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
    ${state.tour ? renderTourFooter() : ""}`;
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
  });
  // Hand the attempt to the hosting LMS page, if there is one and it told
  // us who the learner is — only ever to that origin (see identity.js).
  Identity.emit("smartcitix:record", { record: attempt });
  Perf.logRun({ app: "smartcity", simId: room.id, mode: state.mode, presenting: renderer.xr.isPresenting, seconds: Math.round(s.elapsed) });
  // A passing run on a station with a real certification is a portable
  // credential: hand the Open Badges assertion to the host ecosystem too.
  if (attempt.passed && attempt.certification) Identity.emit("smartcitix:credential", { assertion: toOpenBadges([attempt], xapiOpts())[0] });
  shipToLrs([attempt]);
  renderPrograms();
  const touring = !!state.tour;
  const tourDone = touring && state.tour.i + 1 >= SIMS_META.length;
  store.patch("results", {
    visible: true,
    html: bodyHtml,
    showNext: touring && !tourDone,
    retryPrimary: !touring || tourDone,
  });
  state.paused = true;
  announce(`${room.title} complete. ${s.stars} star${s.stars === 1 ? "" : "s"}.` +
    (s.leveledUp ? ` Level up — ${s.levelName}, level ${s.level}.` : "") +
    (s.rankedUp ? ` Rank up — ${rank.name}.` : "") +
    (earnedNames.length ? ` ${earnedNames.map((a) => a.name).join(", ")} earned.` : "") +
    (s.leaderboard?.madeBoard ? ` New number ${s.leaderboard.rank} on the local leaderboard.` : ""));
}

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
function stopRobot() { if (robot.timer) { clearInterval(robot.timer); robot.timer = null; } robot.agent = null; }
function startRobot(room) {
  stopRobot();
  const session = state.session;
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
    const obs = observe(s);
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
// ------------------------------------------------- instructor mode
//
// A live feed of this session for an instructor console open on the same
// machine (WebXR/instructor/). Same-origin, same-device, nothing stored:
// see shared/observer.js for why that is the honest boundary. A note from
// the instructor lands on the rail; a freeze pauses the session the way an
// overlay does.
const observer = createBroadcaster("smartcity", { learner: Progress.playerName });
let observerFrozen = false;
observer.onCommand((cmd) => {
  if (cmd.kind === "note" && cmd.text) {
    setRail("warn", `<b>Instructor:</b> ${escapeHtml(cmd.text)}`);
    announce(`Instructor: ${cmd.text}`);
    return;
  }
  if (cmd.kind === "freeze") {
    observerFrozen = cmd.on;
    state.paused = cmd.on ? true : pausedBeforeOverlay;
    setRail(cmd.on ? "warn" : "neutral", cmd.on
      ? "<b>Held by the instructor.</b> The clock is stopped until they release it."
      : "<b>Released.</b> Carry on from where you stopped.");
  }
});
addEventListener("pagehide", () => observer.close());
/** One snapshot of where this learner is, for the console. */
function observerSnapshot() {
  const s = state.session;
  if (!s) return null;
  return {
    stepIndex: (s.index | 0) + 1,
    stepCount: s.steps?.length ?? 0,
    stepTitle: s.step?.title ?? "",
    score: s.score | 0, stars: s.stars | 0, errors: s.errors | 0,
    hazardHits: s.hazardHits | 0, seconds: Math.round(s.elapsed ?? 0),
  };
}

window.__smartcityRobot = { get active() { return robot.active; }, get skill() { return robot.skill; }, get log() { return robot.log; }, get running() { return !!robot.timer; } };

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
  enterSim(id, { briefed: true });
}
function prebriefSkip() {
  const id = state.pendingBrief; if (!id) return;
  store.patch("prebrief", { visible: false });
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
  });
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
  store.patch("programs", { rows: allProgress(TrainingRecords.list()) });
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

addEventListener("keydown", (e) => {
  if (isTypingTarget(e)) return;
  keys[e.code] = true;
  if (e.code === "Escape") {
    // Topmost overlay first: an overlay opened by voice mid-run (records,
    // leaderboards, editor) should close on Escape, not eject the learner to
    // the hub underneath it.
    const ui = store.get();
    if (ui.prebrief.visible) { prebriefClose(); return; }
    if (ui.records.visible) closeRecords();
    else if (ui.leaderboard.visible) closeLeaderboard();
    else if (ui.editor.visible) closeEditor();
    else if (state.session) { state.tour = null; store.patch("results", { visible: false }); enterHub(); }
  }
  if (e.code === "KeyM") { Sfx.muted = !Sfx.muted; }
  // --- keyboard operation of the running procedure ---
  if (!state.session || renderer.xr.isPresenting || store.get().prebrief.visible) return;
  if (e.code === "Tab") { e.preventDefault(); kbStep(e.shiftKey ? -1 : 1); return; }
  if (e.code === "Enter" || e.code === "NumpadEnter") { e.preventDefault(); kbActivate(); return; }
  if (e.code === "Space") {
    e.preventDefault();
    if (!e.repeat && kbCursor.current) pressStart(kbCursor.current);
    return;
  }
  if (e.code === "ArrowUp" || e.code === "ArrowDown") {
    if (kbAdjust(e.code === "ArrowUp" ? 1 : -1)) { e.preventDefault(); kbActive = true; }
    return;
  }
  if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
    e.preventDefault(); kbStep(e.code === "ArrowRight" ? 1 : -1);
  }
});
addEventListener("keyup", (e) => {
  if (isTypingTarget(e)) return;
  keys[e.code] = false;
  if (e.code === "Space" && state.session) { e.preventDefault(); pressEnd(); }
});

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
  // How far the learner may walk. The stage owns this now: the site apron's
  // fence line outdoors, the room's walls indoors. It used to be the station's
  // own footprint plus 2.4m, which fenced the learner into the middle of a
  // 15-metre plaza and made every station a diorama you turned on the spot in.
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

const VOICE_HELP = 'Say a station name, "hub," "leaderboards," "records," "programmes," "tour," "editor," "reset," "hint," "brief," "status," or "help."';

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

function parseVoiceCommand(text) {
  const lower = text.toLowerCase();
  const sim = VOICE_SIMS.find((s) => lower.includes(s.name.toLowerCase()));
  if (sim) return { type: "sim", id: sim.id };
  if (/\b(hub|campus|home|back)\b/.test(lower)) return { type: "hub" };
  if (/\bleaderboards?\b/.test(lower)) return { type: "leaderboard" };
  if (/\b(programme?s?|programs?|curricul(?:um|a)|pathway)\b/.test(lower)) return { type: "programs" };
  if (/\b(records?|training records?|transcript)\b/.test(lower)) return { type: "records" };
  if (/\btour\b/.test(lower)) return { type: "tour" };
  if (/\b(scenario|editor)\b/.test(lower)) return { type: "editor" };
  if (/\breset\b/.test(lower)) return { type: "reset" };
  if (/\b(help|commands|what can i say)\b/.test(lower)) return { type: "help" };
  if (/\b(hint|what now|what next|current step|repeat)\b/.test(lower)) return { type: "hint" };
  if (/\b(brief|briefing|about this station)\b/.test(lower)) return { type: "brief" };
  if (/\b(status|progress|score)\b/.test(lower)) return { type: "status" };
  return { type: "unknown" };
}

function handleVoiceCommand(text) {
  const cmd = parseVoiceCommand(text);
  if (cmd.type === "sim") { pendingEnter = cmd.id; begin(); announce(`Entering ${SIMS_META_BY_ID[cmd.id]?.name ?? "station"}.`); return; }
  if (cmd.type === "hub") { if (state.session) backToHub(); else enterFlat(); announce("Back at the campus."); return; }
  if (cmd.type === "leaderboard") { viewLeaderboard(); return; }
  if (cmd.type === "records") { viewRecords(); return; }
  if (cmd.type === "programs") { viewPrograms(); return; }
  if (cmd.type === "tour") { startTour(); announce("Starting the guided tour."); return; }
  if (cmd.type === "editor") { openEditor(); return; }
  if (cmd.type === "reset") { resetProgress(); announce("Progress cleared."); return; }
  if (cmd.type === "help") { announce(VOICE_HELP); return; }
  if (cmd.type === "hint") { announce(currentHintLine()); return; }
  if (cmd.type === "brief") { announce(speakBrief()); return; }
  if (cmd.type === "status") { announce(speakStatus()); return; }
  store.patch("voice", { error: `Didn't recognize "${text}" — try a station name, "hub," "leaderboards," "programmes," "tour," "editor," "reset," "hint," "brief," "status," or "help."` });
  announce('Didn\'t catch that. Say "help" for commands.');
}

mountUI(store, {
  viewLeaderboard, closeLeaderboard,
  viewRecords, closeRecords, exportRecordsCsv, exportRecordsXapi, exportCredentials, clearRecords,
  viewPrograms, closePrograms, programStart,
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
});

// Test-only hook: headless test runners can't grant microphone permission
// or produce a real SpeechRecognition result, but the interesting logic is
// the command parsing/routing in handleVoiceCommand, not the browser's own
// recognizer — so expose that directly, the same pattern as Holodeck's
// window.__holodeckTest.
window.__smartcityVoiceTest = { simulate: (text) => handleVoiceCommand(text) };

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
