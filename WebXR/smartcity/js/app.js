import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { disposeTree, decal, repaint, HUD, clamp } from "../../shared/kit.js";
import { Session, Progress, Sfx } from "../../shared/game.js";
import { buildStage } from "./stage.js";
import { buildHub } from "./hub.js";
import { SIM_CHARGE_POINT } from "./sims/charge-point.js";
import { SIM_SIGNAL_CABINET } from "./sims/signal-cabinet.js";
import { SIM_VALVE_VAULT } from "./sims/valve-vault.js";
import { SIM_SOLAR_DECK } from "./sims/solar-deck.js";
import { SIM_SPLICE_NODE } from "./sims/splice-node.js";
import { SIM_FLIGHT_DECK } from "./sims/flight-deck.js";
import { SIM_TRACK_ACCESS } from "./sims/track-access.js";
import { SIM_TRIAGE_POINT } from "./sims/triage-point.js";
import { SIM_ROBOT_CELL } from "./sims/robot-cell.js";
import { SIM_CHILLER_PLANT } from "./sims/chiller-plant.js";

const SIMS = [
  SIM_CHARGE_POINT, SIM_SIGNAL_CABINET, SIM_VALVE_VAULT, SIM_SOLAR_DECK, SIM_SPLICE_NODE,
  SIM_FLIGHT_DECK, SIM_TRACK_ACCESS, SIM_TRIAGE_POINT, SIM_ROBOT_CELL, SIM_CHILLER_PLANT,
];
const SIM_BY_ID = Object.fromEntries(SIMS.map((s) => [s.id, s]));
const AR_DIORAMA_SCALE = 0.34; // tabletop scale so a 2 m station fits on a desk

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
  results: document.getElementById("results"),
  resultsBody: document.getElementById("results-body"),
  intro: document.getElementById("intro"),
  hint: document.getElementById("hud-hint"),
  arPrompt: document.getElementById("ar-prompt"),
  scaleRow: document.getElementById("scale-row"),
  leaderboard: document.getElementById("leaderboard"),
  leaderboardBody: document.getElementById("leaderboard-body"),
  playerName: document.getElementById("player-name"),
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
    ui.room.textContent = "SMARTCITI.X";
    ui.step.textContent = "Choose a district";
    ui.cue.textContent = "Select a simulator to begin its own procedure and its own rank system.";
    ui.score.textContent = "----";
    ui.combo.textContent = "";
    ui.count.textContent = `${Progress.completedRooms}/10 CLEARED`;
    ui.fill.style.width = `${(Progress.completedRooms / 10) * 100}%`;
    ui.timer.textContent = "";
    vrHudDirty = true;
    return;
  }
  const rank = Progress.simRank(s.room.id, s.room.game);
  ui.room.textContent = s.room.title.toUpperCase();
  ui.score.textContent = String(Math.round(s.score)).padStart(4, "0");
  ui.combo.textContent = `${s.combo > 1.05 ? `×${s.combo.toFixed(1)} · ` : ""}${rank.name}`;
  ui.count.textContent = `STEP ${Math.min(s.index + 1, s.steps.length)}/${s.steps.length}`;
  ui.fill.style.width = `${s.progress01 * 100}%`;
  const secs = Math.floor(s.elapsed);
  ui.timer.textContent = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")} / ${
    String(Math.floor(s.room.parSeconds / 60)).padStart(2, "0")}:${String(s.room.parSeconds % 60).padStart(2, "0")}`;
  const step = s.step;
  if (step) {
    ui.step.textContent = step.title;
    let cue = step.cue;
    if (step.kind === "sequence" || step.kind === "find") cue += `  (${s.sequence.length}/${step.targets.length})`;
    if (step.kind === "hold" || step.kind === "track") cue += `  (${s.holdFor.toFixed(1)}s / ${step.seconds}s)`;
    ui.cue.textContent = cue;
  }
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
  state.api = buildHub(root, SIMS);
  state.hits = state.api.hits;
  collectSelectables();
  resetPlacement();
  if (state.mode !== "ar") { rig.position.set(0.4, 0, 4.9); rig.rotation.y = 0; }
  else { rig.position.set(0, 0, 0); }
  yaw = 0; pitch = 0;
  camera.rotation.set(0, 0, 0);
  ui.arPrompt.hidden = state.mode !== "ar";
  ui.scaleRow.hidden = state.mode !== "ar";
  setRail("neutral", "<b>SmartCiti.X training campus.</b> Ten simulators, each its own gamified system and its own rank. Select a kiosk to begin.");
  syncHud();
}

function enterSim(id) {
  const room = SIM_BY_ID[id];
  if (!room) return;
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
  ui.arPrompt.hidden = state.mode !== "ar";
  ui.scaleRow.hidden = state.mode !== "ar";

  state.session = new Session(room, {
    onStep: (step, s) => {
      state.api.onStep?.(step, s);
      updateHintForStep(step);
      if (step.kind === "gauge") { paintGaugeBand(step); placeGauge(state.hits[step.target]); gauge.visible = true; }
      else gauge.visible = false;
      syncHud();
    },
    onFeedback: (fb, s) => {
      state.api.onFeedback?.(fb, s);
      setRail(fb.kind === "ok" ? "ok" : fb.kind === "danger" ? "danger" : fb.kind === "partial" ? "neutral" : "warn", fb.text);
      if (fb.kind === "danger") flashDanger();
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
  ui.resultsBody.innerHTML = `
    <div class="res-stars">${stars}</div>
    <h2>${room.title}</h2>
    <p class="res-trade">${room.game?.system ?? ""} · ${rank.name}</p>
    <dl class="res-grid">
      <div><dt>Score</dt><dd>${s.score}</dd></div>
      <div><dt>Time</dt><dd>${mins}:${String(secs).padStart(2, "0")}</dd></div>
      <div><dt>Errors</dt><dd>${s.errors}</dd></div>
      <div><dt>${room.game?.currency ?? "XP"}</dt><dd>${rank.xp}</dd></div>
      <div><dt>Personal best</dt><dd>${summary.best}</dd></div>
      <div><dt>Runs</dt><dd>${summary.runs}</dd></div>
    </dl>
    ${earnedNames.length ? `<div class="res-badges">${earnedNames.map((a) =>
      `<p class="res-badge"><b>${a.name}</b><span>${a.note}</span></p>`).join("")}</div>` : ""}
    <p class="res-note">${s.errors === 0
      ? "Clean run: every control taken in order, no unsafe action."
      : `${s.errors} correction${s.errors === 1 ? "" : "s"} — re-run for a cleaner pass.`}</p>
    ${s.leaderboard?.madeBoard
      ? `<p class="res-note"><b>New #${s.leaderboard.rank} on the local leaderboard</b> for ${room.title}, crew tag ${Progress.playerName}.</p>`
      : ""}`;
  ui.results.hidden = false;
  state.paused = true;
}

// ----------------------------------------------------------------- leaderboards

function renderLeaderboards() {
  const standing = Progress.suiteStanding();
  const cards = SIMS.map((room) => {
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
  ui.leaderboardBody.innerHTML = `
    <div class="eyebrow">SmartCiti.X · suite standing</div>
    <h1>Leaderboards</h1>
    <p class="lead">Local to this device — every board here lives in this browser only.
      ${standing.simsPlayed}/${SIMS.length} districts played · ${standing.totalRuns} runs ·
      ${standing.totalStars}★ earned · best-score sum ${standing.totalScore}.</p>
    <div class="lb-grid">${cards}</div>`;
}
document.getElementById("view-leaderboard").addEventListener("click", () => {
  renderLeaderboards();
  ui.leaderboard.hidden = false;
});
document.getElementById("lb-close").addEventListener("click", () => { ui.leaderboard.hidden = true; });

ui.playerName.value = Progress.playerName === "YOU" ? "" : Progress.playerName;
ui.playerName.addEventListener("change", () => {
  Progress.setPlayerName(ui.playerName.value);
  ui.playerName.value = Progress.playerName;
});

document.getElementById("res-retry").addEventListener("click", () => {
  ui.results.hidden = true; state.paused = false; enterSim(state.room.id);
});
document.getElementById("res-hub").addEventListener("click", () => {
  ui.results.hidden = true; state.paused = false; enterHub();
});

// --------------------------------------------------------------- interaction

const raycaster = new THREE.Raycaster();
raycaster.far = 14;
const pointerNdc = new THREE.Vector2(0, 0);

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
  const m = new THREE.Matrix4().identity().extractRotation(controller.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(m);
  return findHit(raycaster.intersectObjects(state.selectables, false));
}

function setHover(id) {
  if (state.hovered === id) return;
  if (state.hovered && state.hits[state.hovered]) tint(state.hits[state.hovered], false);
  state.hovered = id;
  if (state.hovered && state.hits[state.hovered]) tint(state.hits[state.hovered], true);
  document.body.style.cursor = id ? "pointer" : "default";
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
  state.session.select(id);
  syncHud();
}
function pressStart(id) {
  const s = state.session;
  if (!s || !s.step) return;
  if ((s.step.kind === "hold" || s.step.kind === "track") && id === s.step.target) s.setHolding(true);
}
function pressEnd() { state.session?.setHolding(false); }

// Desktop -------------------------------------------------------------------

let yaw = 0, pitch = 0, dragging = false, lastX = 0, lastY = 0, downAt = 0, downId = null;
const keys = Object.create(null);
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Escape" && state.session) { ui.results.hidden = true; enterHub(); }
  if (e.code === "KeyM") { Sfx.muted = !Sfx.muted; }
});
addEventListener("keyup", (e) => { keys[e.code] = false; });

const canvas = renderer.domElement;
canvas.addEventListener("pointerdown", (e) => {
  if (renderer.xr.isPresenting) return;
  dragging = true; lastX = e.clientX; lastY = e.clientY; downAt = performance.now();
  updateNdc(e);
  const hit = castFromCamera();
  downId = hit?.id ?? null;
  if (downId) pressStart(downId);
});
addEventListener("pointerup", (e) => {
  if (renderer.xr.isPresenting) return;
  dragging = false; pressEnd();
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
    c.userData.downId = hit?.id ?? null;
    if (hit?.id) pressStart(hit.id);
  });
  c.addEventListener("selectend", () => {
    pressEnd();
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
    const ax = gp.axes.length >= 4 ? [gp.axes[2], gp.axes[3]] : [gp.axes[0], gp.axes[1]];
    if (source.handedness === "left") {
      const head = new THREE.Vector3();
      camera.getWorldDirection(head); head.y = 0;
      if (head.lengthSq() < 1e-6) continue;
      head.normalize();
      const right = new THREE.Vector3(-head.z, 0, head.x);
      rig.position.addScaledVector(head, -ax[1] * 2.2 * dt);
      rig.position.addScaledVector(right, ax[0] * 2.2 * dt);
    } else if (source.handedness === "right") {
      if (Math.abs(ax[0]) < 0.35) snapReady = true;
      else if (snapReady) { rig.rotation.y -= Math.sign(ax[0]) * (Math.PI / 6); snapReady = false; }
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
  ui.arPrompt.hidden = true;
  Sfx.good();
}
document.getElementById("scale-up").addEventListener("click", () => {
  placement.scale.multiplyScalar(1.15);
});
document.getElementById("scale-down").addEventListener("click", () => {
  placement.scale.multiplyScalar(1 / 1.15);
});

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
  g.clearRect(0, 0, w, h);
  g.fillStyle = "rgba(10,17,23,0.9)"; g.fillRect(0, 0, w, h);
  const stateColour = { ok: HUD.good, warn: HUD.warn, danger: HUD.danger, neutral: HUD.edge }[ui.rail.dataset.state] ?? HUD.edge;
  g.fillStyle = stateColour; g.fillRect(0, 0, 12, h);
  g.fillStyle = accent;
  g.font = `600 34px 'Barlow Condensed', Arial, sans-serif`;
  g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText(ui.room.textContent, 36, 40);
  g.fillStyle = HUD.text;
  g.font = `600 40px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(ui.step.textContent, 36, 90);
  g.fillStyle = HUD.muted; g.font = `26px Arial, sans-serif`;
  wrapText(g, ui.cue.textContent, 36, 140, w - 300, 32, 3);
  g.fillStyle = HUD.text; g.font = `26px Arial, sans-serif`;
  wrapText(g, ui.feedback.textContent, 36, 236, w - 300, 30, 2);
  g.textAlign = "right"; g.fillStyle = accent;
  g.font = `600 56px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(ui.score.textContent, w - 34, 62);
  g.fillStyle = HUD.muted; g.font = `600 26px 'Barlow Condensed', Arial, sans-serif`;
  g.fillText(ui.combo.textContent, w - 34, 108);
  g.fillText(ui.count.textContent + "   " + ui.timer.textContent, w - 34, 144);
  g.textAlign = "left";
  g.fillStyle = "#1d2833"; g.fillRect(36, h - 34, w - 70, 10);
  g.fillStyle = accent;
  g.fillRect(36, h - 34, (w - 70) * (state.session ? state.session.progress01 : Progress.completedRooms / 10), 10);
  vrTexture.needsUpdate = true;
}

// -------------------------------------------------------------------- intro

const deepLink = new URLSearchParams(location.search).get("sim");
function begin() {
  ui.intro.hidden = true;
  state.paused = false;
  Sfx.ensure();
  if (state.mode === "ar") { resetPlacement(); ui.arPrompt.hidden = false; ui.scaleRow.hidden = false; }
  if (deepLink && SIM_BY_ID[deepLink]) enterSim(deepLink);
  else enterHub();
}

const btnAr = document.getElementById("enter-ar");
const btnVr = document.getElementById("enter-vr");
const btnFlat = document.getElementById("enter-flat");
btnFlat.addEventListener("click", () => { state.mode = "flat"; begin(); });
document.getElementById("reset-progress").addEventListener("click", () => {
  Progress.reset(); state.api?.refresh?.(); syncHud();
  document.getElementById("reset-progress").textContent = "Progress cleared";
});
if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported("immersive-ar").then((ok) => { if (ok) btnAr.disabled = false; else btnAr.textContent = "AR unavailable here"; })
    .catch(() => { btnAr.textContent = "AR unavailable here"; });
  navigator.xr.isSessionSupported("immersive-vr").then((ok) => { if (ok) btnVr.disabled = false; else btnVr.textContent = "VR unavailable here"; })
    .catch(() => { btnVr.textContent = "VR unavailable here"; });
} else {
  btnAr.textContent = "AR unavailable here"; btnVr.textContent = "VR unavailable here";
}
btnAr.addEventListener("click", async () => {
  try { await startXr("ar"); }
  catch (err) { begin(); setRail("warn", `<b>Could not start AR.</b> ${err?.message ?? err}. Falling back to the desktop view.`); }
});
btnVr.addEventListener("click", async () => {
  try { await startXr("vr"); }
  catch (err) { begin(); setRail("warn", `<b>Could not start VR.</b> ${err?.message ?? err}. Falling back to the desktop view.`); }
});

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
    const camPos = new THREE.Vector3(); camera.getWorldPosition(camPos);
    for (const t of hintTargets) {
      const p = new THREE.Vector3(); t.getWorldPosition(p);
      const d = p.distanceToSquared(camPos);
      if (d < bestDist) { bestDist = d; best = t; }
    }
    if (best) {
      const bb = new THREE.Box3().setFromObject(best);
      const c = bb.getCenter(new THREE.Vector3());
      const localScale = worldRoot.getWorldScale(new THREE.Vector3()).x || 1;
      hint.position.set(c.x, 0.02, c.z);
      hintPip.position.set(0, Math.max(bb.max.y + 0.18, 0.6) + Math.sin(elapsedTotal * 2.6) * 0.05, 0);
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
    const camPos = new THREE.Vector3(); camera.getWorldPosition(camPos);
    gauge.lookAt(camPos.x, gauge.position.y, camPos.z);
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

  if (canInteract) state.api?.animate?.(elapsedTotal, dt, state.session);
  state.stage?.animate?.(elapsedTotal, dt);

  if (presenting && vrHudDirty) { drawVrHud(); vrHudDirty = false; }
  renderer.render(scene, camera);
});

state.paused = true;
