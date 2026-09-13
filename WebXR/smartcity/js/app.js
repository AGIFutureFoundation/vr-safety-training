import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { disposeTree, decal, repaint, HUD, clamp, easeOut, celebrationBurst, GESTURE_HINTS } from "../../shared/kit.js";
import { Session, Progress, Sfx } from "../../shared/game.js";
import { buildStage } from "./stage.js";
import { buildHub } from "./hub.js";
import { SIMS_META } from "./sims-meta.js";
import { CustomScenarios, buildCustomRoom, newScenarioId } from "./scenarios.js";
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
    parSeconds: entry.parSeconds ?? base.parSeconds,
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

// ------------------------------------------------------------------ renderer

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    step: "Choose a district",
    cue: "Select a simulator to begin its own procedure and its own rank system.",
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
  },
  results: { visible: false, html: "", showNext: false, retryPrimary: true },
  leaderboard: { visible: false, html: "" },
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

function syncHud() {
  const s = state.session;
  if (!s) {
    store.patch("hud", {
      room: "SMARTCITI.X",
      step: "Choose a district",
      cue: "Select a simulator to begin its own procedure and its own rank system.",
      score: "----", comboText: "", comboHot: false, comboFire: false,
      count: `${Progress.completedRooms}/${allSims().length} CLEARED`,
      fillPct: (Progress.completedRooms / allSims().length) * 100,
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
  if (state.roomRoot) { disposeTree(state.roomRoot); state.roomRoot = null; }
  if (state.stage) { disposeTree(state.stage.root); state.stage = null; }
  state.api = null;
  state.hits = {};
  state.selectables = [];
  state.hovered = null;
  hint.visible = false;
  gauge.visible = false;
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
  setRail("neutral", `<b>SmartCiti.X training campus.</b> ${allSims().length} simulators, each its own gamified system and its own rank. Select a kiosk to begin.`);
  syncHud();
}

// Bumped on every call so a station whose dynamic import is still in flight
// can tell, once it resolves, whether it is still the one the player wants —
// two quick kiosk picks in a row must not race and land in the wrong room.
let enterSimToken = 0;
async function enterSim(id) {
  const myToken = ++enterSimToken;
  setRail("neutral", "<b>Loading station…</b>");
  const room = await findSim(id);
  if (myToken !== enterSimToken) return; // superseded by a later pick
  if (!room) { enterHub(); return; }
  clearRoom();
  const stage = buildStage(worldRoot, state.mode, scene);
  state.stage = stage;
  const root = new THREE.Group();
  worldRoot.add(root);
  state.roomRoot = root;
  state.room = room;
  state.api = room.build(root);
  state.hits = state.api.hits;
  collectSelectables();
  resetPlacement();

  if (state.mode !== "ar") {
    const spawnR = (room.footprint ?? 2) + 1.4;
    rig.position.set(0, 0, spawnR);
    rig.rotation.y = 0;
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
      updateHintForStep(step);
      if (step.kind === "gauge") { paintGaugeBand(step); placeGauge(state.hits[step.target]); gauge.visible = true; }
      else gauge.visible = false;
      maybeShowGestureTip(step.kind);
      syncHud();
    },
    onFeedback: (fb, s) => {
      state.api.onFeedback?.(fb, s);
      setRail(fb.kind === "ok" ? "ok" : fb.kind === "danger" ? "danger" : fb.kind === "partial" ? "neutral" : "warn", fb.text);
      if (fb.kind === "danger") flashDanger();
      if (fb.kind === "ok" && fb.points) {
        scorePop(`+${fb.points}`, fb.combo >= 1.6);
        if (fb.combo >= 1.6) burstAtHit(lastActivatedId);
      }
      syncHud();
    },
    onStepComplete: (step, s) => { state.api.onStepComplete?.(step, s); },
    onHazard: (hitId, s) => { state.api.onHazard?.(hitId, s); },
    onFinish: (s, summary) => showResults(s, summary),
  });
  state.session.start();
  faceFirstTask();
  setRail("neutral", `<b>${room.title}</b> — ${room.tagline}. ${state.mode === "ar" ? "Tap a surface to place the station." : "Follow the procedure in order."}`);
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
  if (!step) { hint.visible = false; return; }
  const ids = step.kind === "sequence" || step.kind === "find" ? step.targets : [step.target];
  for (const id of ids) if (state.hits[id]) hintTargets.push(state.hits[id]);
  hint.visible = hintTargets.length > 0;
}

function flashDanger() {
  document.body.classList.add("danger-flash");
  setTimeout(() => document.body.classList.remove("danger-flash"), 420);
}

// ------------------------------------------------------------------- results

function showResults(s, summary) {
  const room = s.room;
  const rank = Progress.simRank(room.id, room.game);
  const stars = "★★★".slice(0, s.stars) + "☆☆☆".slice(0, 3 - s.stars);
  const mins = Math.floor(s.elapsed / 60), secs = Math.round(s.elapsed % 60);
  const earnedNames = s.earned
    .map((id) => [...(room.game?.badges ?? []), ...(room.game?.challenges ?? [])].find((a) => a.id === id))
    .filter(Boolean);
  const bodyHtml = `
    ${s.rankedUp ? `<div class="rank-up">RANK UP — ${rank.name.toUpperCase()}</div>` : ""}
    <div class="res-stars">${stars}</div>
    <h2>${room.title}</h2>
    <p class="res-trade">${room.game?.system ?? ""} · ${rank.name}</p>
    <dl class="res-grid">
      <div><dt>Score</dt><dd>${s.score}</dd></div>
      <div><dt>Time</dt><dd>${mins}:${String(secs).padStart(2, "0")}</dd></div>
      <div><dt>Errors</dt><dd>${s.errors}</dd></div>
      <div><dt>${room.game?.currency ?? "XP"}</dt><dd>${rank.xp}</dd></div>
      <div><dt>Personal best</dt><dd>${summary.best}</dd></div>
      <div><dt>Best combo</dt><dd>×${s.peakCombo.toFixed(1)}</dd></div>
    </dl>
    ${earnedNames.length ? `<div class="res-badges">${earnedNames.map((a) =>
      `<p class="res-badge"><b>${a.name}</b><span>${a.note}</span></p>`).join("")}</div>` : ""}
    <p class="res-note">${s.errors === 0
      ? "Clean run: every control taken in order, no unsafe action."
      : `${s.errors} correction${s.errors === 1 ? "" : "s"} — re-run for a cleaner pass.`}</p>
    ${s.leaderboard?.madeBoard
      ? `<p class="res-note"><b>New #${s.leaderboard.rank} on the local leaderboard</b> for ${room.title}, crew tag ${Progress.playerName}.</p>`
      : ""}
    ${state.tour ? renderTourFooter() : ""}`;
  const touring = !!state.tour;
  const tourDone = touring && state.tour.i + 1 >= SIMS_META.length;
  store.patch("results", {
    visible: true,
    html: bodyHtml,
    showNext: touring && !tourDone,
    retryPrimary: !touring || tourDone,
  });
  state.paused = true;
}

/** Progress line shown on the results card while a guided tour is running. */
function renderTourFooter() {
  const done = state.tour.i + 1;
  const tourDone = done >= SIMS_META.length;
  return `<p class="res-note" style="color:var(--accent) !important">${
    tourDone
      ? `<b>That's all twenty stations.</b> The guided tour ends here — nice work.`
      : `<b>Guided tour: stop ${done} of ${SIMS_META.length} complete.</b> Next up: ${SIMS_META[done].name}.`
  }</p>`;
}

// ----------------------------------------------------------------- leaderboards

function renderLeaderboards() {
  const standing = Progress.suiteStanding();
  const roster = allSims();
  const cards = roster.map((room) => {
    const board = Progress.leaderboard(room.id);
    const rows = board.length
      ? `<table class="lb-table"><thead><tr><th>#</th><th>Crew</th><th>Score</th><th>Stars</th></tr></thead><tbody>${
          board.map((e, i) => `<tr class="${e.name === Progress.playerName ? "me" : ""}">
            <td>${i + 1}</td><td>${e.name}</td><td>${e.score}</td><td>${"★".repeat(e.stars)}</td></tr>`).join("")}
        </tbody></table>`
      : `<p class="lb-empty">No runs yet — be first.</p>`;
    return `<div class="lb-card" style="--tint:${room.accentCss}"><h3>${room.name}</h3>
      <div class="lb-top">${room.game?.system ?? ""}</div>${rows}</div>`;
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
function viewLeaderboard() { renderLeaderboards(); store.patch("leaderboard", { visible: true }); }
function closeLeaderboard() { store.patch("leaderboard", { visible: false }); }

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
  edPopulateBaseOptions();
  edRenderLibrary();
  store.patch("editor", { visible: true });
}
function closeEditor() { store.patch("editor", { visible: false }); }

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
  state.mode = "flat";
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
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Escape" && state.session) { state.tour = null; store.patch("results", { visible: false }); enterHub(); }
  if (e.code === "KeyM") { Sfx.muted = !Sfx.muted; }
});
addEventListener("keyup", (e) => { keys[e.code] = false; });

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
  const f = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const r = new THREE.Vector3(-f.z, 0, f.x);
  if (keys.KeyW || keys.ArrowUp) rig.position.addScaledVector(f, speed);
  if (keys.KeyS || keys.ArrowDown) rig.position.addScaledVector(f, -speed);
  if (keys.KeyD || keys.ArrowRight) rig.position.addScaledVector(r, speed);
  if (keys.KeyA || keys.ArrowLeft) rig.position.addScaledVector(r, -speed);
  const limit = state.session ? (state.room?.footprint ?? 2) + 2.4 : 9.5;
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
    ? { requiredFeatures: ["hit-test"], optionalFeatures: ["local-floor", "dom-overlay"], domOverlay: { root: document.body } }
    : { optionalFeatures: ["local-floor", "bounded-floor"] };
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
const vrPanel = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), new THREE.MeshBasicMaterial({ map: vrTexture, transparent: true }));
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
  g.fillRect(36, h - 34, (w - 70) * (state.session ? state.session.progress01 : Progress.completedRooms / allSims().length), 10);
  vrTexture.needsUpdate = true;
}

// -------------------------------------------------------------------- intro

const deepLink = new URLSearchParams(location.search).get("sim");
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
  pendingEnter = null;
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
// Navigation only, deliberately: "go to the valve vault," "leaderboards,"
// "guided tour," "campus." Every command routes through the exact same
// action a click already triggers — nothing new to verify in the procedure
// engine itself. This never activates a step inside a running procedure;
// the hands-on click/drag/turn is the point of a hands-on trainer, and
// voice-skipping it would undermine the training, not assist it.

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
  if (/\btour\b/.test(lower)) return { type: "tour" };
  if (/\b(scenario|editor)\b/.test(lower)) return { type: "editor" };
  if (/\breset\b/.test(lower)) return { type: "reset" };
  return { type: "unknown" };
}

function handleVoiceCommand(text) {
  const cmd = parseVoiceCommand(text);
  if (cmd.type === "sim") { pendingEnter = cmd.id; begin(); return; }
  if (cmd.type === "hub") { if (state.session) backToHub(); else enterFlat(); return; }
  if (cmd.type === "leaderboard") { viewLeaderboard(); return; }
  if (cmd.type === "tour") { startTour(); return; }
  if (cmd.type === "editor") { openEditor(); return; }
  if (cmd.type === "reset") { resetProgress(); return; }
  store.patch("voice", { error: `Didn't recognize "${text}" — try a station name, "hub," "leaderboards," "tour," "editor" or "reset."` });
}

mountUI(store, {
  viewLeaderboard, closeLeaderboard,
  openEditor, closeEditor, edSelectBase, edToggleStep, edMoveStep,
  edSetName, edSetPar, edSetTagline, edSavePlay, edSaveOnly, edCancel,
  edPlayLibrary, edDeleteLibrary,
  setPlayerNameDraft, commitPlayerName,
  retryResult, backToHub, nextTourStop, startTour,
  enterAr, enterVr, enterFlat, resetProgress,
  scaleUp, scaleDown, toggleVoice,
});

// Test-only hook: headless test runners can't grant microphone permission
// or produce a real SpeechRecognition result, but the interesting logic is
// the command parsing/routing in handleVoiceCommand, not the browser's own
// recognizer — so expose that directly, the same pattern as Holodeck's
// window.__holodeckTest.
window.__smartcityVoiceTest = { simulate: (text) => handleVoiceCommand(text) };

// --------------------------------------------------------------- frame loop

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let elapsedTotal = 0;

renderer.setAnimationLoop((_, frame) => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsedTotal += dt;
  const presenting = renderer.xr.isPresenting;

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
    if (presenting) xrMove(dt); else desktopMove(dt);
    if (state.session && !state.session.finished) {
      state.session.tick(dt);
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
  state.stage?.animate?.(elapsedTotal, dt);

  if (presenting && vrHudDirty) { drawVrHud(); vrHudDirty = false; }
  renderer.render(scene, camera);
});

state.paused = true;
