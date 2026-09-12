import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { disposeTree, decal, repaint, box, cyl, torus, ball, group, mat, HUD, clamp, easeOut, celebrationBurst, GESTURE_HINTS } from "../shared/kit.js";
import { Session, Progress, Sfx } from "../shared/game.js";
import { buildHub } from "./hub.js";
import { ROOM_ELECTRICAL } from "./rooms/electrical.js";
import { ROOM_SALON } from "./rooms/salon.js";
import { ROOM_KITCHEN } from "./rooms/kitchen.js";
import { ROOM_PHLEBOTOMY } from "./rooms/phlebotomy.js";
import { ROOM_WELDING } from "./rooms/welding.js";

const ROOMS = [ROOM_ELECTRICAL, ROOM_SALON, ROOM_KITCHEN, ROOM_PHLEBOTOMY, ROOM_WELDING];
const ROOM_BY_ID = Object.fromEntries(ROOMS.map((r) => [r.id, r]));

Progress.load();

// ------------------------------------------------------------------ renderer

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;
renderer.xr.setFoveation(0.6);
document.getElementById("stage").appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a1016);
scene.fog = new THREE.Fog(0x0a1016, 16, 40);

const rig = new THREE.Group();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.04, 90);
camera.position.set(0, 1.62, 0);
camera.rotation.order = "YXZ";
rig.add(camera);
scene.add(rig);

// --------------------------------------------------------------- HUD binding

const ui = {
  room: document.getElementById("hud-room"),
  step: document.getElementById("hud-step"),
  cue: document.getElementById("hud-cue"),
  feedback: document.getElementById("hud-feedback"),
  score: document.getElementById("hud-score"),
  combo: document.getElementById("hud-combo"),
  fill: document.getElementById("hud-fill"),
  count: document.getElementById("hud-count"),
  timer: document.getElementById("hud-timer"),
  rail: document.getElementById("hud-rail"),
  panel: document.getElementById("hud"),
  results: document.getElementById("results"),
  resultsBody: document.getElementById("results-body"),
  intro: document.getElementById("intro"),
  hint: document.getElementById("hud-hint"),
  gesture: document.getElementById("hud-gesture"),
  gestureTip: document.getElementById("gesture-tip"),
};
let vrHudDirty = true;

function setRail(kind, html) {
  ui.rail.dataset.state = kind;
  ui.feedback.innerHTML = html;
  vrHudDirty = true;
}

function syncHud() {
  const s = state.session;
  if (!s) {
    ui.room.textContent = "TRAINING HUB";
    ui.step.textContent = "Choose a trade";
    ui.cue.textContent = "Walk into a doorway to start that room's procedure.";
    ui.score.textContent = String(Progress.data.xp).padStart(4, "0");
    ui.combo.textContent = `LV ${Progress.level}`;
    ui.count.textContent = `${Progress.completedRooms}/5 ROOMS · ${Progress.totalStars}★`;
    ui.fill.style.width = `${(Progress.completedRooms / 5) * 100}%`;
    ui.timer.textContent = "";
    ui.gesture.hidden = true;
    vrHudDirty = true;
    return;
  }
  ui.room.textContent = s.room.title.toUpperCase();
  ui.score.textContent = String(Math.round(s.score)).padStart(4, "0");
  ui.combo.textContent = s.comboLabel ? `${s.comboLabel.toUpperCase()} ×${s.combo.toFixed(1)}` : (s.combo > 1.05 ? `×${s.combo.toFixed(1)}` : "×1.0");
  ui.combo.classList.toggle("hot", s.streak >= 4);
  ui.combo.classList.toggle("fire", s.combo >= 1.8);
  ui.count.textContent = `STEP ${Math.min(s.index + 1, s.steps.length)}/${s.steps.length}`;
  ui.fill.style.width = `${s.progress01 * 100}%`;
  const secs = Math.floor(s.elapsed);
  ui.timer.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} / ${
    String(Math.floor(s.room.parSeconds / 60)).padStart(2, "0")}:${String(s.room.parSeconds % 60).padStart(2, "0")}`;
  const step = s.step;
  if (step) {
    ui.step.textContent = step.title;
    let cue = step.cue;
    if (step.kind === "sequence") cue += `  (${s.sequence.length}/${step.targets.length})`;
    if (step.kind === "hold") cue += `  (${s.holdFor.toFixed(1)}s / ${step.seconds}s)`;
    if (step.kind === "turn" && s.turn) cue += `  (${Math.round((s.turn.amount / s.turn.required) * 100)}%)`;
    ui.cue.textContent = cue;
    const hint = GESTURE_HINTS[step.kind];
    ui.gesture.textContent = hint?.verb ?? "";
    ui.gesture.hidden = !hint;
  }
  vrHudDirty = true;
}

// ------------------------------------------------------------- world objects

const worldRoot = new THREE.Group();
scene.add(worldRoot);

const state = {
  roomRoot: null,
  api: null,
  room: null,
  session: null,
  hits: {},
  selectables: [],
  hovered: null,
  paused: true,
};

// Objective marker: floor ring plus a bobbing diamond over the live target.
const hint = new THREE.Group();
const hintRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.42, 0.022, 8, 36),
  new THREE.MeshBasicMaterial({ color: 0x37d6c0, transparent: true, opacity: 0.85 }));
hintRing.rotation.x = -Math.PI / 2;
hint.add(hintRing);
const hintPip = new THREE.Mesh(
  new THREE.OctahedronGeometry(0.07),
  new THREE.MeshBasicMaterial({ color: 0x37d6c0 }));
hint.add(hintPip);
hint.visible = false;
worldRoot.add(hint);
const hintTargets = [];

// Gauge widget: static band panel, geometry marker, and a slow-refresh readout.
const gauge = new THREE.Group();
gauge.visible = false;
const gaugePanel = decal(gauge, 0.62, 0.2, 0, 0, 0, () => {}, { px: 512, glow: true, ei: 0.5 });
const gaugeReadout = decal(gauge, 0.28, 0.09, 0, 0.16, 0.002, () => {}, { px: 256, glow: true, ei: 0.7 });
const gaugeMarker = new THREE.Mesh(
  new THREE.BoxGeometry(0.012, 0.1, 0.014),
  new THREE.MeshBasicMaterial({ color: 0xffffff }));
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
const GESTURE_SEEN_KEY = "trades-gestures-seen";
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
  ui.gestureTip.innerHTML = `<b>${hint.verb}</b><br>${hint.tip}`;
  ui.gestureTip.classList.add("show");
  clearTimeout(gestureTipTimer);
  gestureTipTimer = setTimeout(() => ui.gestureTip.classList.remove("show"), 5200);
}

function paintGaugeBand(step) {
  const [lo, hi] = step.gauge.green ?? [0.44, 0.62];
  repaint(gaugePanel, (g, w, h) => {
    g.fillStyle = "rgba(10,17,23,0.94)"; g.fillRect(0, 0, w, h);
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
  const top = boxHelper.max.y;
  gauge.position.set(c.x, Math.min(Math.max(top + 0.3, 1.15), 2.0), c.z);
}

// ------------------------------------------------------------ room lifecycle

function clearRoom() {
  if (state.roomRoot) {
    disposeTree(state.roomRoot);
    state.roomRoot = null;
  }
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

function enterHub() {
  clearRoom();
  state.session = null;
  state.room = null;
  const root = new THREE.Group();
  worldRoot.add(root);
  state.roomRoot = root;
  state.api = buildHub(root, ROOMS);
  state.hits = state.api.hits;
  collectSelectables();
  rig.position.set(0.4, 0, 4.9);
  rig.rotation.y = 0;
  camera.rotation.set(0, 0, 0);
  yaw = 0; pitch = 0;
  scene.background = new THREE.Color(0x0a1016);
  scene.fog = new THREE.Fog(0x0a1016, 16, 46);
  document.body.dataset.accent = "#37d6c0";
  document.documentElement.style.setProperty("--accent", "#37d6c0");
  setRail("neutral", "<b>Training hub.</b> Five trades, one procedure each. Step into a doorway to begin — the room scores every action against the real order of operations.");
  syncHud();
}

function enterRoom(id) {
  const room = ROOM_BY_ID[id];
  if (!room) return;
  clearRoom();
  const root = new THREE.Group();
  worldRoot.add(root);
  state.roomRoot = root;
  state.room = room;
  state.api = room.build(root);
  state.hits = state.api.hits;
  collectSelectables();

  rig.position.set(room.spawn.x, 0, room.spawn.z);
  rig.rotation.y = room.spawn.ry ?? 0;
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  scene.background = new THREE.Color(0x080d12);
  scene.fog = new THREE.Fog(0x080d12, 14, 32);
  document.documentElement.style.setProperty("--accent", room.accentCss);

  state.session = new Session(room, {
    onStep: (step, s) => {
      state.api.onStep?.(step, s);
      updateHintForStep(step);
      if (step.kind === "gauge") {
        paintGaugeBand(step);
        placeGauge(state.hits[step.target]);
        gauge.visible = true;
      } else gauge.visible = false;
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
  setRail("neutral", `<b>${room.title}</b> — ${room.tagline}. Follow the procedure in order; the room will tell you why each step matters.`);
  syncHud();
}

/**
 * Turn the learner toward the opening task. Rooms author where you stand; the
 * first thing you are asked to do decides which way you are looking, so nobody
 * starts a run staring at a blank wall.
 */
function faceFirstTask() {
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
  const ids = step.kind === "sequence" ? step.targets : [step.target];
  for (const id of ids) if (state.hits[id]) hintTargets.push(state.hits[id]);
  hint.visible = hintTargets.length > 0;
}

function flashDanger() {
  document.body.classList.add("danger-flash");
  setTimeout(() => document.body.classList.remove("danger-flash"), 420);
}

// ------------------------------------------------------------------- results

function showResults(s, summary) {
  const stars = "★★★".slice(0, s.stars) + "☆☆☆".slice(0, 3 - s.stars);
  const mins = Math.floor(s.elapsed / 60), secs = Math.round(s.elapsed % 60);
  ui.resultsBody.innerHTML = `
    <div class="res-stars">${stars}</div>
    <h2>${s.room.title} complete</h2>
    <p class="res-trade">${s.room.trade}</p>
    <dl class="res-grid">
      <div><dt>Score</dt><dd>${s.score}</dd></div>
      <div><dt>Time</dt><dd>${mins}:${String(secs).padStart(2, "0")}</dd></div>
      <div><dt>Errors</dt><dd>${s.errors}</dd></div>
      <div><dt>Time bonus</dt><dd>+${s.timeBonus ?? 0}</dd></div>
      <div><dt>Personal best</dt><dd>${summary.best}</dd></div>
      <div><dt>Best combo</dt><dd>×${s.peakCombo.toFixed(1)}</dd></div>
    </dl>
    ${s.badgeEarned ? `<p class="res-badge">Badge earned — <b>${s.room.badge.name}</b><span>${s.room.badge.note}</span></p>` : ""}
    <p class="res-note">${s.errors === 0
      ? "Clean run: every control taken in order, no unsafe action."
      : `${s.errors} correction${s.errors === 1 ? "" : "s"} — re-run it to clear the room without a penalty.`}</p>`;
  ui.results.hidden = false;
  state.paused = true;
}

document.getElementById("res-retry").addEventListener("click", () => {
  ui.results.hidden = true;
  state.paused = false;
  enterRoom(state.room.id);
});
document.getElementById("res-hub").addEventListener("click", () => {
  ui.results.hidden = true;
  state.paused = false;
  enterHub();
});

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
    // three.js raycasts hidden meshes too, and rooms hide props until a step
    // reveals them — walk the chain and drop anything not actually on screen.
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

function castFromCamera() {
  raycaster.setFromCamera(pointerNdc, camera);
  return findHit(raycaster.intersectObjects(state.selectables, false));
}

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
  const manipulable = step && id === step.target && (step.kind === "turn" || step.kind === "drag");
  document.body.style.cursor = id ? (manipulable ? "grab" : "pointer") : "default";
}

function tint(root, on) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || o.material.emissive === undefined) return;
    if (o.material.map) return;   // canvas decals own their texture; cloning it leaks
    if (on) {
      if (!o.userData.baseMaterial) o.userData.baseMaterial = o.material;
      const clone = o.userData.baseMaterial.clone();
      clone.userData.ownMaterial = true;
      clone.emissive = new THREE.Color(0x37d6c0);
      clone.emissiveIntensity = 0.4;
      o.material = clone;
    } else if (o.userData.baseMaterial) {
      if (o.material !== o.userData.baseMaterial) o.material.dispose();
      o.material = o.userData.baseMaterial;
    }
  });
}

function activate(id) {
  if (!id) return;
  if (!state.session) {
    if (id.startsWith("door-")) { Sfx.good(); enterRoom(id.slice(5)); }
    return;
  }
  lastActivatedId = id;
  state.session.select(id);
  syncHud();
}

/** A floating "+120" over the score chip — cheap, satisfying, no 3D cost. */
function scorePop(text, big) {
  const el = document.createElement("div");
  el.className = big ? "score-pop big" : "score-pop";
  el.textContent = text;
  ui.score.parentElement.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

function pressStart(id) {
  const s = state.session;
  if (!s || !s.step) return;
  if (s.step.kind === "hold" && id === s.step.target) s.setHolding(true);
}
function pressEnd() {
  state.session?.setHolding(false);
}

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

// Desktop input -------------------------------------------------------------

let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0, downAt = 0, downId = null;
const keys = Object.create(null);
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "KeyH" && !state.session) return;
  if (e.code === "Escape" && state.session) { ui.results.hidden = true; enterHub(); }
  if (e.code === "KeyM") { Sfx.muted = !Sfx.muted; ui.hint.textContent = Sfx.muted ? "sound off" : "sound on"; }
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
  dragging = false;
  pressEnd();
  if (performance.now() - downAt < 280 && downId) {
    updateNdc(e);
    const hit = castFromCamera();
    if (hit && hit.id === downId) activate(hit.id);
  }
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
  clampRig();
}

function clampRig() {
  const limit = state.session ? 3.6 : 6.6;
  const len = Math.hypot(rig.position.x, rig.position.z);
  if (len > limit) { rig.position.x *= limit / len; rig.position.z *= limit / len; }
}

// XR input ------------------------------------------------------------------

const controllers = [];
for (let i = 0; i < 2; i++) {
  const c = renderer.xr.getController(i);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]),
    new THREE.LineBasicMaterial({ color: 0x37d6c0, transparent: true, opacity: 0.7 }));
  c.add(line);
  c.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 10, 10), new THREE.MeshBasicMaterial({ color: 0x37d6c0 })));
  // A stubby grip so the hand reads as holding something.
  const grip = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.07, 4, 8),
    new THREE.MeshStandardMaterial({ color: 0x1d242b, roughness: 0.6 }));
  grip.rotation.x = 0.5;
  grip.position.set(0, -0.012, 0.03);
  c.add(grip);
  c.addEventListener("selectstart", () => {
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
    const hit = castFromController(c);
    if (hit && hit.id === c.userData.downId) activate(hit.id);
    c.userData.downId = null;
  });
  rig.add(c);
  controllers.push(c);
}

let snapReady = true;
function xrMove(dt) {
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
      camera.getWorldDirection(head);
      head.y = 0;
      if (head.lengthSq() < 1e-6) continue;
      head.normalize();
      const right = _scratchV2.set(-head.z, 0, head.x);
      rig.position.addScaledVector(head, -axY * 2.2 * dt);
      rig.position.addScaledVector(right, axX * 2.2 * dt);
      clampRig();
    } else if (source.handedness === "right") {
      if (Math.abs(axX) < 0.35) snapReady = true;
      else if (snapReady) { rig.rotation.y -= Math.sign(axX) * (Math.PI / 6); snapReady = false; }
    }
  }
}

// In-headset HUD panel, low-centre so it never masks the work surface.
const vrCanvas = document.createElement("canvas");
vrCanvas.width = 1024; vrCanvas.height = 340;
const vrCtx = vrCanvas.getContext("2d");
const vrTexture = new THREE.CanvasTexture(vrCanvas);
const vrPanel = new THREE.Mesh(
  new THREE.PlaneGeometry(0.9, 0.3),
  new THREE.MeshBasicMaterial({ map: vrTexture, transparent: true }));
vrPanel.position.set(0, -0.4, -1.0);
vrPanel.rotation.x = -0.35;
vrPanel.renderOrder = 10;
vrPanel.visible = false;
camera.add(vrPanel);

function drawVrHud() {
  const g = vrCtx, w = vrCanvas.width, h = vrCanvas.height;
  const accent = state.room?.accentCss ?? HUD.accent;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(16,28,39,0.9)"; g.fillRect(0, 0, w, h);
  const stateColour = { ok: HUD.good, warn: HUD.warn, danger: HUD.danger, neutral: HUD.edge }[ui.rail.dataset.state] ?? HUD.edge;
  g.fillStyle = stateColour; g.fillRect(0, 0, 12, h);
  g.fillStyle = accent;
  g.font = `600 34px 'Barlow Condensed', Arial, sans-serif`;
  g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(ui.room.textContent, 36, 40);
  g.fillStyle = HUD.text;
  g.font = `600 40px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(ui.step.textContent, 36, 90);
  g.fillStyle = HUD.muted;
  g.font = `26px Arial, sans-serif`;
  wrapText(g, ui.cue.textContent, 36, 140, w - 300, 32, 3);
  g.fillStyle = HUD.text;
  g.font = `26px Arial, sans-serif`;
  wrapText(g, ui.feedback.textContent, 36, 236, w - 300, 30, 2);
  g.textAlign = "right";
  g.fillStyle = accent;
  g.font = `600 56px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(ui.score.textContent, w - 34, 62);
  g.fillStyle = HUD.muted;
  g.font = `600 28px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(`${ui.combo.textContent}   ${ui.count.textContent}`, w - 34, 110);
  g.fillText(ui.timer.textContent, w - 34, 148);
  g.textAlign = "left";
  g.fillStyle = "#1d2833"; g.fillRect(36, h - 34, w - 70, 10);
  g.fillStyle = accent;
  g.fillRect(36, h - 34, (w - 70) * (state.session ? state.session.progress01 : Progress.completedRooms / 5), 10);
  vrTexture.needsUpdate = true;
}

function wrapText(g, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = String(text).split(/\s+/);
  let line = "", lines = 0;
  for (const word of words) {
    if (g.measureText(line + word).width > maxWidth) {
      g.fillText(line, x, y);
      y += lineHeight; line = ""; lines++;
      if (lines >= maxLines) { g.fillText("…", x, y); return; }
    }
    line += word + " ";
  }
  g.fillText(line, x, y);
}

// -------------------------------------------------------------------- intro

// ?room=<id> opens straight into one trade, so a single bay can be linked or
// embedded on its own without the learner walking the hub first.
const deepLink = new URLSearchParams(location.search).get("room");
function begin() {
  ui.intro.hidden = true;
  state.paused = false;
  Sfx.ensure();
  if (deepLink && ROOM_BY_ID[deepLink]) enterRoom(deepLink);
}

const enterVrBtn = document.getElementById("enter-vr");
document.getElementById("enter-flat").addEventListener("click", begin);
document.getElementById("reset-progress").addEventListener("click", () => {
  Progress.reset();
  state.api?.refresh?.();
  syncHud();
  document.getElementById("reset-progress").textContent = "Progress cleared";
});
if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported("immersive-vr").then((ok) => {
    if (ok) enterVrBtn.disabled = false;
    else enterVrBtn.textContent = "VR unavailable in this browser";
  }).catch(() => { enterVrBtn.textContent = "VR unavailable in this browser"; });
} else {
  enterVrBtn.textContent = "VR unavailable in this browser";
}
enterVrBtn.addEventListener("click", async () => {
  try {
    const session = await navigator.xr.requestSession("immersive-vr",
      { optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"] });
    await renderer.xr.setSession(session);
    begin();
    vrPanel.visible = true;
    vrHudDirty = true;
    session.addEventListener("end", () => { vrPanel.visible = false; });
  } catch (err) {
    begin();
    setRail("warn", `<b>Could not start the VR session.</b> ${err?.message ?? err}. Open this page in its own tab in a WebXR browser and try again.`);
  }
});

// --------------------------------------------------------------- frame loop

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();
let elapsedTotal = 0;

renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsedTotal += dt;
  const presenting = renderer.xr.isPresenting;

  if (!state.paused) {
    if (presenting) xrMove(dt);
    else desktopMove(dt);
    if (state.session && !state.session.finished) {
      state.session.tick(dt);
      if (state.session.step?.kind === "hold") syncHud();
    }
  }

  // Hover from whichever pointer is live.
  let hovering = null;
  if (presenting) {
    for (const c of controllers) {
      const hit = castFromController(c);
      if (hit) { hovering = hit.id; break; }
    }
  } else {
    hovering = castFromCamera()?.id ?? null;
  }
  setHover(hovering);

  // Objective marker rides the nearest live target.
  if (hint.visible && hintTargets.length) {
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

  // Gauge marker and readout.
  const g = state.session?.gauge;
  if (gauge.visible && g) {
    const halfWidth = 0.62 * 0.45;
    gaugeMarker.position.x = -halfWidth + g.t * halfWidth * 2;
    const inBand = g.t >= g.green[0] && g.t <= g.green[1];
    gaugeMarker.material.color.set(inBand ? 0x59c97b : 0xffffff);
    camera.getWorldPosition(_scratchV1);
    gauge.lookAt(_scratchV1.x, gauge.position.y, _scratchV1.z);
    if (elapsedTotal - gaugeReadoutAt > 0.08) {
      gaugeReadoutAt = elapsedTotal;
      const text = state.session.step?.gauge?.readout?.(g.t) ?? `${Math.round(g.t * 100)}%`;
      repaint(gaugeReadout, (ctx, w, h) => {
        ctx.fillStyle = "rgba(10,17,23,0.95)"; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = inBand ? HUD.good : HUD.text;
        ctx.font = `600 ${Math.round(h * 0.66)}px 'Barlow Condensed', Arial, sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(text, w / 2, h * 0.56);
      });
    }
  }

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
  for (let i = returning.length - 1; i >= 0; i--) {
    const r = returning[i];
    r.t = Math.min(1, r.t + dt / 0.3);
    r.object.position.lerpVectors(r.from, r.to, easeOut(r.t));
    if (r.t >= 1) returning.splice(i, 1);
  }
  burst.update(dt);

  state.api?.animate?.(elapsedTotal, dt, state.session);

  if (presenting && vrHudDirty) { drawVrHud(); vrHudDirty = false; }
  renderer.render(scene, camera);
});

// Kick off in the hub so the first frame already shows the five trades.
enterHub();
state.paused = true;
