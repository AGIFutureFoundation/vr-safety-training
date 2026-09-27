import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor, driveInputFrom, DRIVE_KEYS, driveActionForKey } from "../../shared/input.js";
import { TrainingRecords } from "../../shared/records.js";
import { buildQuiz, recordRadioScore, bestRadioScore } from "../../shared/radio-quiz.js";
import { BW_SITES, BW_LANDMARKS, BW_ZONES } from "./city.js";
import {
  BW_VEHICLES, BW_SPEED_CAP, bwStepPlayer, bwStepVehicle, bwVehicleParams, bwMissionLink,
  bwSpawnTraffic, bwStepTraffic, bwCreatePedestrian, bwStepPedestrian,
  bwAdvanceClock, bwWeatherFor, bwNearestPlace, bwZoneAt,
} from "./sim.js";
import {
  bwCareerState, bwAwardMission, bwAwardQuestReward, bwCollectMissionReturns, bwSiteProgress,
  bwIsVehicleUnlocked, bwIsFastTravelUnlocked, bwIsSiteVisited,
} from "./career.js";
import { registerQuests, questState, onQuestStep, onQuestDone, bwAdvanceQuests, bwNoteStationReturn } from "./quest-engine.js";
import { BW_QUESTS } from "./quests-select.js";
import { bwMapRoads, bwMapZones, bwMapLandmarks, bwMapSites, bwWorldToMap } from "./map.js";
import { bwBuildWorld } from "./world.js";

// Bay World — the app: menus, the phone-style HUD, keyboard/touch/gamepad
// input for on-foot and vehicle play, the map, the car radio and the render
// loop. Every rule that must run the same way twice lives in sim.js,
// career.js, quest-engine.js and map.js (pure, headless — see
// tools/check_bayworld_game.mjs); this file only wires input, the DOM and
// three.js around them.

const $ = (id) => document.getElementById(id);
const bwStore = (() => { try { return window.localStorage; } catch { return null; } })();
const PLACES = [...BW_SITES, ...BW_LANDMARKS];

const bwApp = {
  screen: "menu",
  scene: null, camera: null, renderer: null, world: null,
  mode: "foot",              // "foot" | "vehicle"
  cameraMode: "chase",       // "chase" | "first"
  player: { x: -40, z: -50, heading: 0, speed: 0 }, // beside the downtown motor pool (world.js's BW_DEPOT)
  vehicleId: null,
  vehicleState: null,
  hours: 9,                  // the day clock, 0-24
  weather: "clear",
  traffic: [],
  pedestrians: [],
  nearSite: null, nearVehicle: null, nearLandmark: null,
  interactPressed: false,
  lastMissionSite: null,
  radio: { on: false, station: null, quiz: null, quizIndex: 0, quizScore: 0, chiptune: null },
  mapOpen: false,
};

// ------------------------------------------------------------------ toast

let bwToastTimer = null;
function bwToast(text, ms = 3200) {
  const el = $("toast");
  if (!el) return;
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(bwToastTimer);
  bwToastTimer = setTimeout(() => el.classList.remove("on"), ms);
}

// ------------------------------------------------------------------ keys

const bwKeys = new Set();
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  bwKeys.add(e.code);
  if (e.code === "KeyV") bwToggleCamera();
  if (e.code === "KeyM") bwToggleMap();
  if (e.code === "KeyF") bwTryEnterExit();
  if (e.code === "KeyE") bwApp.interactPressed = true;
  if (e.code === "Escape") { if (bwApp.mapOpen) bwToggleMap(false); else if (bwApp.screen !== "menu") bwOpenScreen("game"); }
});
window.addEventListener("keyup", (e) => bwKeys.delete(e.code));
window.addEventListener("blur", () => bwKeys.clear());
const heldFoot = () => ({
  forward: (bwKeys.has("KeyW") || bwKeys.has("ArrowUp") ? 1 : 0) - (bwKeys.has("KeyS") || bwKeys.has("ArrowDown") ? 1 : 0),
  strafe: (bwKeys.has("KeyD") ? 1 : 0) - (bwKeys.has("KeyA") ? 1 : 0),
  turn: (bwKeys.has("ArrowRight") ? 1 : 0) - (bwKeys.has("ArrowLeft") ? 1 : 0),
  run: bwKeys.has("ShiftLeft") || bwKeys.has("ShiftRight"),
});
function heldDrive() {
  const held = {};
  for (const code of bwKeys) { const a = driveActionForKey(code); if (a) held[a] = true; }
  return held;
}

// ------------------------------------------------------------------ touch

let bwStick = { active: false, id: null, dx: 0, dy: 0 };
function bwWireTouch() {
  const base = $("touch-stick");
  if (!base) return;
  const knob = $("touch-knob");
  const R = 44;
  const move = (t) => {
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    let dx = t.clientX - cx, dz = t.clientY - cy;
    const d = Math.hypot(dx, dz);
    if (d > R) { dx = (dx / d) * R; dz = (dz / d) * R; }
    bwStick.dx = dx / R; bwStick.dy = dz / R;
    knob.style.transform = `translate(${dx}px, ${dz}px)`;
  };
  base.addEventListener("pointerdown", (e) => { bwStick.active = true; bwStick.id = e.pointerId; base.setPointerCapture(e.pointerId); move(e); });
  base.addEventListener("pointermove", (e) => { if (bwStick.active && e.pointerId === bwStick.id) move(e); });
  const end = (e) => { if (e.pointerId === bwStick.id) { bwStick.active = false; bwStick.dx = 0; bwStick.dy = 0; knob.style.transform = "translate(0,0)"; } };
  base.addEventListener("pointerup", end);
  base.addEventListener("pointercancel", end);
  $("touch-run")?.addEventListener("pointerdown", () => { bwTouch.run = true; });
  $("touch-run")?.addEventListener("pointerup", () => { bwTouch.run = false; });
  $("touch-interact")?.addEventListener("pointerdown", () => { bwApp.interactPressed = true; bwTryEnterExit(); });
  $("touch-view")?.addEventListener("pointerdown", () => bwToggleCamera());
  $("touch-map")?.addEventListener("pointerdown", () => bwToggleMap());
  $("touch-brake")?.addEventListener("pointerdown", () => { bwTouch.brake = true; });
  $("touch-brake")?.addEventListener("pointerup", () => { bwTouch.brake = false; });
}
const bwTouch = { run: false, brake: false };

// ------------------------------------------------------------------ gamepad

const bwPad = createGamepad({ getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []), bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) bwToast(`Gamepad connected (${detectPadVendor(info.id)} labels).`); } });

function bwPadSnapshot() { return bwPad.poll(1 / 60); }

// -------------------------------------------------------------- boot / DOM

function bwOpenScreen(name) {
  bwApp.screen = name;
  for (const id of ["scr-menu", "scr-jobboard", "scr-radio"]) $(id)?.toggleAttribute("hidden", true);
  $("hud")?.toggleAttribute("hidden", name !== "game");
  $("view-toggle")?.toggleAttribute("hidden", name !== "game");
  if (name === "menu") $("scr-menu")?.removeAttribute("hidden");
  if (name === "jobboard") $("scr-jobboard")?.removeAttribute("hidden");
  if (name === "radio") $("scr-radio")?.removeAttribute("hidden");
}

function bwToggleCamera() { bwApp.cameraMode = bwApp.cameraMode === "chase" ? "first" : "chase"; $("view-toggle").textContent = bwApp.cameraMode === "chase" ? "First person (V)" : "Chase camera (V)"; }

function bwToggleMap(force) {
  bwApp.mapOpen = force ?? !bwApp.mapOpen;
  $("scr-map")?.toggleAttribute("hidden", !bwApp.mapOpen);
  if (bwApp.mapOpen) bwDrawFullMap();
}

// ------------------------------------------------------------- vehicles

function bwTryEnterExit() {
  if (bwApp.mode === "vehicle") {
    const veh = bwVehicleParams(bwApp.vehicleId);
    bwApp.player.x = bwApp.vehicleState.x; bwApp.player.z = bwApp.vehicleState.z; bwApp.player.heading = bwApp.vehicleState.heading;
    const mesh = bwApp.world.vehicles[bwApp.vehicleId];
    if (mesh) { mesh.position.set(bwApp.vehicleState.x, 0, bwApp.vehicleState.z); mesh.rotation.y = bwApp.vehicleState.heading; }
    bwApp.mode = "foot"; bwApp.vehicleId = null; bwApp.vehicleState = null;
    bwToast(`Parked the ${veh.name}.`);
    return;
  }
  if (bwApp.nearVehicle) {
    const id = bwApp.nearVehicle;
    if (!bwIsVehicleUnlocked(id, bwStore)) { bwToast(`${bwVehicleParams(id).name} is locked — raise your reputation to unlock it.`); return; }
    bwApp.mode = "vehicle"; bwApp.vehicleId = id;
    bwApp.vehicleState = { x: bwApp.player.x, z: bwApp.player.z, heading: bwApp.player.heading, speed: 0, vehicleId: id };
    bwToast(`Climbed into the ${bwVehicleParams(id).name}.`);
  }
}

// ------------------------------------------------------------- job board

function bwOpenJobBoard(site) {
  bwApp.lastMissionSite = site;
  $("jb-title").textContent = site.name;
  $("jb-zone").textContent = BW_ZONES.find((z) => z.id === site.zone)?.name ?? site.zone;
  const progress = bwSiteProgress(TrainingRecords.list(), site);
  $("jb-progress").textContent = progress.attempts
    ? `${progress.attempts} attempt${progress.attempts === 1 ? "" : "s"} · last run ${progress.lastStation ?? "—"}${progress.badgesEarned.length ? ` · badges: ${progress.badgesEarned.join(", ")}` : ""}`
    : "No attempts yet at this site.";
  $("jb-programmes").textContent = (site.programmes ?? []).length
    ? `Programme: ${site.programmes.join(", ")}`
    : "No training programme posted here yet.";
  // Some of BAY1's sites (a lighting shed, a fire watch, a maintenance yard)
  // carry no station at all — a real place on the map with nothing to launch
  // yet, rather than an invented one just to fill the button.
  $("jb-launch")?.toggleAttribute("hidden", !(site.stations ?? []).length);
  bwOpenScreen("jobboard");
}
$("jb-launch")?.addEventListener("click", () => {
  const site = bwApp.lastMissionSite;
  if (!site || !(site.stations ?? []).length) return;
  const link = bwMissionLink(site);
  bwToast(`Launching ${site.name}…`);
  window.location.href = link;
});
$("jb-close")?.addEventListener("click", () => bwOpenScreen("game"));

// ------------------------------------------------------------- mission return

function bwCheckMissionReturns() {
  const results = bwCollectMissionReturns(TrainingRecords.list(), BW_SITES, { storage: bwStore });
  for (const r of results) {
    bwToast(`${r.site.name}: ${r.entry.passed ? "passed" : "logged"} — +${r.award.reputationGain} reputation, +${r.award.creditsGain} credits.`, 4200);
    // A quest's own "station" step may name either the site (what the job
    // board shows) or the underlying sim id TrainingRecords stamps the
    // attempt with — bwNoteStationReturn() is a no-op for whichever one a
    // quest's current step is not waiting on, so both are always tried.
    bwNoteStationReturn(r.site.id, { storage: bwStore });
    bwNoteStationReturn(r.entry.simId, { storage: bwStore });
    for (const u of r.award.unlocked) bwToast(`Unlocked: ${u.label}`, 4200);
  }
  bwRefreshHudCareer();
}

// -------------------------------------------------------------------- radio

function bwOpenRadio() { bwOpenScreen("radio"); }
$("radio-close")?.addEventListener("click", () => bwOpenScreen("game"));
$("radio-station-quiz")?.addEventListener("click", () => bwStartQuizStation());
$("radio-station-loop")?.addEventListener("click", () => bwToggleChiptune());

let bwAudioCtx = null;
function bwAudio() { bwAudioCtx = bwAudioCtx ?? new (window.AudioContext || window.webkitAudioContext)(); return bwAudioCtx; }

/** A short, original four-bar chiptune loop: two square-wave voices over a
 *  triangle bass, scheduled with the Web Audio clock so it never drifts. */
function bwToggleChiptune() {
  if (bwApp.radio.chiptune) { bwApp.radio.chiptune.stop(); bwApp.radio.chiptune = null; $("radio-loop-state").textContent = "Off"; return; }
  const ctx = bwAudio();
  const bpm = 128, beat = 60 / bpm;
  const lead = [523, 659, 784, 659, 587, 698, 880, 698];
  const bass = [131, 131, 165, 165, 147, 147, 175, 175];
  let step = 0, stopped = false, nextTime = ctx.currentTime;
  const master = ctx.createGain(); master.gain.value = 0.06; master.connect(ctx.destination);
  function note(freq, type, t, dur, gain) {
    const osc = ctx.createOscillator(); osc.type = type; osc.frequency.value = freq;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur);
  }
  function scheduler() {
    if (stopped) return;
    while (nextTime < ctx.currentTime + 0.2) {
      note(lead[step % lead.length], "square", nextTime, beat * 0.9, 0.5);
      note(bass[step % bass.length], "triangle", nextTime, beat * 0.95, 0.7);
      nextTime += beat; step += 1;
    }
    requestAnimationFrame(scheduler);
  }
  scheduler();
  bwApp.radio.chiptune = { stop() { stopped = true; master.disconnect(); } };
  $("radio-loop-state").textContent = "Playing";
}

function bwStartQuizStation() {
  const quiz = buildQuiz(6);
  bwApp.radio.quiz = quiz; bwApp.radio.quizIndex = 0; bwApp.radio.quizScore = 0;
  bwRenderQuizQuestion();
}
function bwRenderQuizQuestion() {
  const q = bwApp.radio.quiz?.[bwApp.radio.quizIndex];
  const box = $("radio-quiz");
  if (!q) {
    const best = recordRadioScore(bwApp.radio.quizScore, bwApp.radio.quiz?.length ?? 0, bwStore);
    box.innerHTML = `<p>Foreman's Radio — ${bwApp.radio.quizScore}/${bwApp.radio.quiz?.length ?? 0}${best.isNewBest ? " — new best!" : ""} (best ${best.best}/${best.of})</p>`;
    return;
  }
  box.innerHTML = `<p>${q.text}</p>` + q.choices.map((c, i) => `<button class="btn quiz-choice" data-i="${i}">${c}</button>`).join("");
  box.querySelectorAll(".quiz-choice").forEach((btn) => btn.addEventListener("click", () => {
    if (Number(btn.dataset.i) === q.answerIndex) bwApp.radio.quizScore += 1;
    bwApp.radio.quizIndex += 1;
    bwRenderQuizQuestion();
  }));
}
{
  const best = bestRadioScore(bwStore);
  if (best) { const el = $("radio-best"); if (el) el.textContent = `Best: ${best.best}/${best.of}`; }
}

// -------------------------------------------------------------------- quests

function bwRenderQuestHud() {
  const list = questState(bwStore);
  const active = list.find((q) => !q.done) ?? list[0];
  const el = $("hud-objective");
  if (!el) return;
  if (!active) { el.textContent = "No active job."; return; }
  el.textContent = active.done ? `${active.title} — complete` : `${active.title}: ${active.currentStep?.text ?? ""}`;
}
onQuestStep(({ quest }) => bwToast(`${quest.title}: step complete.`));
onQuestDone(({ quest, reward }) => {
  bwToast(`${quest.title} complete!${reward ? ` +${reward.reputation ?? 0} reputation, +${reward.credits ?? 0} credits.` : ""}`, 4200);
  if (reward) bwAwardQuestReward(reward, { storage: bwStore, siteId: quest.site, title: quest.title });
  bwRefreshHudCareer(); bwRenderQuestHud();
});

// --------------------------------------------------------------- HUD + map

function bwRefreshHudCareer() {
  const c = bwCareerState(bwStore);
  $("hud-reputation").textContent = c.reputation;
  $("hud-credits").textContent = c.credits;
}
function bwFormatClock(hours) {
  const h = Math.floor(hours), m = Math.floor((hours - h) * 60);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function bwDrawMinimap() {
  const canvas = $("hud-minimap");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(6,14,22,0.72)"; ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
  for (const z of bwMapZones(size)) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "rgba(230,240,250,0.5)"; ctx.lineWidth = 2;
  for (const r of bwMapRoads(size)) { ctx.beginPath(); r.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  for (const s of bwMapSites(size, bwStore)) { ctx.fillStyle = s.visited ? "#8cff5a" : "#f2c14b"; ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); ctx.fill(); }
  const p = bwWorldToMap(bwApp.player.x, bwApp.player.z, size);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(bwApp.player.heading);
  ctx.fillStyle = "#4fd1ff"; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function bwDrawFullMap() {
  const canvas = $("map-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  ctx.fillStyle = "#0a1420"; ctx.fillRect(0, 0, size, size);
  for (const z of bwMapZones(size)) {
    ctx.fillStyle = `#${(z.color & 0xffffff).toString(16).padStart(6, "0")}22`;
    ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9fc3d8"; ctx.font = "12px sans-serif"; ctx.fillText(z.name, z.x - 30, z.y);
  }
  ctx.strokeStyle = "#4a5a68"; ctx.lineWidth = 3;
  for (const r of bwMapRoads(size)) { ctx.beginPath(); r.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  for (const l of bwMapLandmarks(size)) { ctx.fillStyle = "#a079ff"; ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2); ctx.fill(); }
  const listEl = $("map-sites");
  listEl.innerHTML = "";
  for (const s of bwMapSites(size, bwStore)) {
    ctx.fillStyle = s.visited ? "#8cff5a" : "#f2c14b";
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill();
    const row = document.createElement("div");
    row.className = "map-site-row";
    const btn = s.fastTravel ? `<button class="btn" data-fast="${s.id}">Fast travel</button>` : `<span class="locked">Visit to unlock</span>`;
    row.innerHTML = `<b>${s.name}</b><span>${s.visited ? "Visited" : "Not yet visited"}</span>${btn}`;
    listEl.appendChild(row);
  }
  listEl.querySelectorAll("[data-fast]").forEach((btn) => btn.addEventListener("click", () => {
    const site = BW_SITES.find((s) => s.id === btn.dataset.fast);
    if (!site) return;
    bwApp.player.x = site.position[0]; bwApp.player.z = site.position[2];
    bwToggleMap(false);
    bwToast(`Fast-travelled to ${site.name}.`);
  }));
  const p = bwWorldToMap(bwApp.player.x, bwApp.player.z, size);
  ctx.fillStyle = "#4fd1ff"; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
}

// ---------------------------------------------------------------- bootstrap

function bwSetup3D() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("stage").appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6fb8ea);
  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 900);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  const root = new THREE.Group();
  scene.add(root);
  const world = bwBuildWorld(root, THREE, { detail: "high", scene });
  bwApp.scene = scene; bwApp.camera = camera; bwApp.renderer = renderer; bwApp.world = world;

  bwApp.traffic = bwSpawnTraffic(2);
  world.trafficMeshes = world.bwSpawnTrafficMeshes(bwApp.traffic.length);
  // One pedestrian every third site is plenty of life across a world the
  // size of BAY_BOUNDS without spawning one per site, however many sites the
  // shared map carries.
  bwApp.pedestrians = BW_SITES.filter((_, i) => i % 3 === 0).map((s, i) => bwCreatePedestrian(`ped-${i}`, s.position[0] + 6, s.position[2] + 6, 10));
  world.pedestrianMeshes = world.bwSpawnPedestrianMeshes(bwApp.pedestrians.length);
}

function bwStep(dt) {
  bwApp.hours = bwAdvanceClock(bwApp.hours, dt);
  const newWeather = bwWeatherFor(bwApp.hours, 0);
  if (newWeather !== bwApp.weather) { bwApp.weather = newWeather; bwApp.world.bwSetWeather(bwApp.weather); }
  bwApp.world.bwApplyLighting(bwApp.scene, bwApp.hours);

  const pad = bwPadSnapshot();
  if (bwApp.mode === "vehicle") {
    const held = heldDrive();
    const input = driveInputFrom({ held, pad, touch: { throttle: bwStick.dy < -0.15, brake: bwTouch.brake || bwStick.dy > 0.4, steer: bwStick.dx } });
    bwApp.vehicleState = bwStepVehicle(bwApp.vehicleState, input, dt);
    bwApp.player.x = bwApp.vehicleState.x; bwApp.player.z = bwApp.vehicleState.z; bwApp.player.heading = bwApp.vehicleState.heading;
    bwApp.player.speed = bwApp.vehicleState.speed;
    const mesh = bwApp.world.vehicles[bwApp.vehicleId];
    if (mesh) { mesh.position.set(bwApp.vehicleState.x, 0, bwApp.vehicleState.z); mesh.rotation.y = bwApp.vehicleState.heading; }
  } else {
    const k = heldFoot();
    const ax = pad?.connected ? (Math.abs(pad.axes?.[0]?.value ?? 0) > GAMEPAD_DEADZONE ? pad.axes[0].value : 0) : 0;
    const ay = pad?.connected ? (Math.abs(pad.axes?.[1]?.value ?? 0) > GAMEPAD_DEADZONE ? pad.axes[1].value : 0) : 0;
    const input = {
      forward: k.forward || -ay || -bwStick.dy,
      strafe: k.strafe || ax || bwStick.dx,
      turn: k.turn,
      run: k.run || bwTouch.run,
    };
    const next = bwStepPlayer(bwApp.player, input, dt);
    bwApp.player = { ...bwApp.player, ...next };
  }

  bwStepTraffic(bwApp.traffic, dt);
  bwApp.traffic.forEach((v, i) => { const m = bwApp.world.trafficMeshes[i]; if (m) { m.position.set(v.x, 0, v.z); m.rotation.y = v.heading; } });
  bwApp.pedestrians = bwApp.pedestrians.map((p, i) => {
    const np = bwStepPedestrian(p, dt);
    const m = bwApp.world.pedestrianMeshes[i]; if (m) { m.position.set(np.x, 0, np.z); m.rotation.y = np.heading; }
    return np;
  });

  const playerMesh = bwApp.world.player;
  if (bwApp.mode === "foot") { playerMesh.visible = true; playerMesh.position.set(bwApp.player.x, 0, bwApp.player.z); playerMesh.rotation.y = bwApp.player.heading; }
  else playerMesh.visible = false;
  bwApp.world.placeCamera(bwApp.camera, bwApp.cameraMode, bwApp.player.x, 0, bwApp.player.z, bwApp.player.heading);

  bwApp.nearSite = bwNearestPlace(bwApp.player.x, bwApp.player.z, BW_SITES, 14);
  bwApp.nearLandmark = bwNearestPlace(bwApp.player.x, bwApp.player.z, BW_LANDMARKS, 16);
  bwApp.nearVehicle = null;
  if (bwApp.mode === "foot") {
    for (const v of BW_VEHICLES) {
      const mesh = bwApp.world.vehicles[v.id];
      if (mesh && Math.hypot(bwApp.player.x - mesh.position.x, bwApp.player.z - mesh.position.z) < 4) { bwApp.nearVehicle = v.id; break; }
    }
  }
  const prompt = $("hud-prompt");
  if (prompt) {
    if (bwApp.mode === "vehicle") prompt.textContent = "Press F to park";
    else if (bwApp.nearVehicle) prompt.textContent = `Press F to enter the ${bwVehicleParams(bwApp.nearVehicle).name}`;
    else if (bwApp.nearSite) prompt.textContent = `Press E — ${bwApp.nearSite.name}`;
    else prompt.textContent = "";
    prompt.toggleAttribute("hidden", !prompt.textContent);
  }
  if (bwApp.interactPressed) {
    if (bwApp.mode === "foot" && bwApp.nearSite) bwOpenJobBoard(bwApp.nearSite);
  }

  const advanced = bwAdvanceQuests({
    player: { x: bwApp.player.x, z: bwApp.player.z }, places: PLACES,
    interact: bwApp.interactPressed, inVehicle: bwApp.mode === "vehicle", speed: Math.abs(bwApp.player.speed ?? 0),
  }, { storage: bwStore });
  if (advanced.length) bwRenderQuestHud();
  bwApp.interactPressed = false;

  $("hud-clock").textContent = bwFormatClock(bwApp.hours);
  $("hud-zone").textContent = BW_ZONES.find((z) => z.id === bwZoneAt(bwApp.player.x, bwApp.player.z))?.name ?? "";
  $("hud-weather").textContent = bwApp.weather;
  if (!bwApp._mapTick || bwApp._mapTick > 6) { bwDrawMinimap(); bwApp._mapTick = 0; }
  bwApp._mapTick = (bwApp._mapTick ?? 0) + 1;
}

let bwLast = performance.now();
function bwLoop(now) {
  const dt = Math.min(0.1, (now - bwLast) / 1000);
  bwLast = now;
  if (bwApp.screen === "game" && !bwApp.mapOpen) bwStep(dt);
  bwApp.renderer?.render(bwApp.scene, bwApp.camera);
  requestAnimationFrame(bwLoop);
}

function bwStart() {
  registerQuests(BW_QUESTS);
  bwSetup3D();
  bwWireTouch();
  bwOpenScreen("game");
  bwRefreshHudCareer();
  bwRenderQuestHud();
  bwCheckMissionReturns();
  requestAnimationFrame(bwLoop);
}

$("menu-start")?.addEventListener("click", bwStart);
$("hud-radio-btn")?.addEventListener("click", bwOpenRadio);
$("hud-map-btn")?.addEventListener("click", () => bwToggleMap());
$("map-close")?.addEventListener("click", () => bwToggleMap(false));

window.addEventListener("pageshow", () => { if (bwApp.screen === "game") bwCheckMissionReturns(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden && bwApp.screen === "game") bwCheckMissionReturns(); });

window.__bayworldTest = {
  app: bwApp,
  step: bwStep,
  jobBoard: bwOpenJobBoard,
  camera: () => bwApp.camera,
};
