import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
// Skill-gated side games (docs/skill-gates.md): the "Side games" chip, quest-log panel and lock toast.
import { qmMountSideGames, qmBoardRows, qmLockToast } from "../../shared/skill-gates-ui.js";
import { qmIsOpen, qmSnapshot } from "../../shared/skill-gates.js";
import { QM_WORLD_GAMES } from "../../shared/side-games-data.js";
import { cnMount } from "../../shared/cinema.js";
import { gdMount } from "../../shared/guide.js";
// Hidden treasures (shared/treasures.js, docs/treasures.md).
import { tzWatchWorld } from "../../shared/treasures.js";
import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor } from "../../shared/input.js";
import { tcTier, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { WEATHER } from "../../shared/weather.js";
import { TrainingRecords } from "../../shared/records.js";
import { ppRecordStation, ppProgressChip, ppCompleteReturns, ppCompleted, ppBoardDone, ppHerePage } from "../../shared/passport.js";
import { PP_PROGRAMMES } from "../../shared/passport-programmes.js";
import { lkStationLink } from "../../shared/links.js";
import { FAIRWAY_HOLES, fairwayHeight } from "./course.js";
import { GOLF_CLUBS, CARE_HABITS, glCreateRound, glCurrentHole, glSetClub, glAdjustAim, glAimYaw, glDistanceToPin, glCanPutt, glSwing, glPutt, glSetWind, glCareEvent, glSummary } from "./golf.js";
import { sprintCreate, sprintStep, freethrowCreate, freethrowStep, penaltyCreate, penaltyStep, FAIRWAY_MINIGAMES_INFO } from "./minigames.js";
import { fgCrewTag, fgLoadScores, fgSubmitRound, fgSubmitMinigame, FAIRWAY_TABLE_SIZE } from "./scores.js";
import { fwBuildWorld } from "./world.js";
// The K-12 layer (shared/field-lessons.js): the park's field lessons listed on the facility screen.
import { k2LessonsFor, k2RenderLessonList } from "../../shared/field-lessons.js";

// Fairway Park — the app: menus, the golf HUD and swing meter, camera and
// input for the course, and the three sports-facility mini-games. Every
// scoring rule lives in golf.js / minigames.js / scores.js (pure, headless —
// see tools/check_fairway_game.mjs); this file only wires input, the DOM and
// three.js around them.

const $ = (id) => document.getElementById(id);
const fwStore = (() => { try { return window.localStorage; } catch { return null; } })();

const CREW_KEY = "fairway-crew-tag";
const WEATHER_ROTATION = ["clear", "overcast", "wind"]; // outdoor conditions this park actually models

const app = {
  screen: "menu",
  crewTag: fgCrewTag(fwStore?.getItem(CREW_KEY) ?? "CREW"),
  round: null,
  scene: null, camera: null, renderer: null, world: null,
  cameraMode: "follow", // "follow" | "address"
  aimRate: 1.1, // rad/s at full stick or held key
  meter: { stage: "idle", t: 0, power: 0, timing: 0 },
  mg: null, // { id, state, kind }
  lastHoleCount: 0,
};

// -------------------------------------------------------------------- toast

let toastT = null;
function toast(text, ms = 2600) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove("on"), ms);
}

// ------------------------------------------------------------------- input

const fwKeys = new Set();
const fwEdge = new Set(); // codes that went down THIS frame — cleared after each read
window.addEventListener("keydown", (e) => {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  if (e.repeat) return;
  if (["ArrowLeft", "ArrowRight", "Space", "KeyV", "KeyC", "Digit1", "Digit2", "Digit3", "Digit4"].includes(e.code)) e.preventDefault();
  fwKeys.add(e.code);
  fwEdge.add(e.code);
  if (e.code === "Escape") fwOnEscape();
});
window.addEventListener("keyup", (e) => fwKeys.delete(e.code));
window.addEventListener("blur", () => fwKeys.clear());

const fwPad = createGamepad({
  getGamepads: () => { const all = navigator.getGamepads ? navigator.getGamepads() : []; return all?.[0] ? [all[0]] : []; },
  bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) toast(`Gamepad connected (${detectPadVendor(info.id)} labels).`); },
});
const fwPadPrev = {};
let fwPadSnap = null;
function fwPollPad(dt) {
  fwPadSnap = fwPad.poll(dt);
  const b = fwPadSnap?.buttons ?? [];
  for (const i of [0, 1, 4, 5]) {
    const now = !!b[i]?.pressed;
    if (now && !fwPadPrev[i]) fwEdge.add(`Pad${i}`);
    fwPadPrev[i] = now;
  }
}
function fwPadAxisX() {
  const a = fwPadSnap?.axes?.[0]?.value ?? 0;
  return Math.abs(a) > GAMEPAD_DEADZONE ? a : 0;
}

function fwOnEscape() {
  if (app.screen === "playing") { fwToMenu(); return; }
  if (app.screen === "mg-playing") { fwEndMinigame(true); return; }
}

// -------------------------------------------------------------------- scene

function fwInitScene() {
  const tier = tcTier();
  const renderer = new THREE.WebGLRenderer({ antialias: tier.tier !== "low", alpha: false });
  tcApplyRenderer(renderer, tier);
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("stage").appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd0ec);
  scene.fog = new THREE.Fog(0x8fd0ec, 80 / tier.fogScale, 420 / tier.fogScale);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.05, 900);
  const root = new THREE.Group();
  scene.add(root);

  const world = fwBuildWorld(root, THREE, { scene });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  app.scene = scene; app.camera = camera; app.renderer = renderer; app.world = world;
  tzWatchWorld("fairway", { scene, THREE, pos: () => (app.round?.ball ? [app.round.ball.x, app.round.ball.z] : null), camera: () => app.camera, groundAt: fairwayHeight, size: 0.25, lift: 0.6 });
}

// -------------------------------------------------------------------- menu

$("crew-tag").value = app.crewTag;
$("crew-tag").addEventListener("change", () => {
  app.crewTag = fgCrewTag($("crew-tag").value);
  $("crew-tag").value = app.crewTag;
  try { fwStore?.setItem(CREW_KEY, app.crewTag); } catch { /* private mode */ }
});

function fwShow(id) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
}

// ------------------------------------------------------ grounds crew board
//
// Fairway's job board for its grounds programme (docs/interop.md): every
// station opens in SmartCiti.X with the way home on it, a finished one is
// paid once into the passport ledger with Fairway as its source, and the chip
// and the done mark read only the passport.
const FW_RUNNER = "../smartcity/index.html";
const FW_GROUNDS = { id: "grounds", name: "Grounds crew board", programme: "grounds-and-landscaping", stations: PP_PROGRAMMES["grounds-and-landscaping"]?.stations ?? [] };
function fwRenderGroundsBoard() {
  ppProgressChip($("grounds-chip"), FW_GROUNDS.programme);
  $("grounds-done")?.toggleAttribute("hidden", !ppBoardDone("fairway", FW_GROUNDS.id));
  const row = $("grounds-stations");
  if (!row) return;
  row.textContent = "";
  for (const id of FW_GROUNDS.stations) {
    const a = document.createElement("a");
    a.className = "gs-link";
    // A Trade Skills room opens in the Trade Skills app (shared/links.js).
    a.href = lkStationLink(id, { runner: FW_RUNNER, from: "fairway", page: ppHerePage(), siteId: FW_GROUNDS.id });
    a.textContent = `${ppCompleted(id) ? "✓ " : ""}${id.replace(/^gk-/, "").replace(/-/g, " ")}`;
    row.appendChild(a);
  }
  // The skill-gated side games around the course, as board rows under the grounds board (docs/skill-gates.md).
  const gb = $("grounds-board");
  if (gb) { gb.querySelector(".qm-board")?.remove(); qmBoardRows(gb, QM_WORLD_GAMES.fairway, { from: "fairway", page: ppHerePage(), link: { runner: FW_RUNNER, siteId: FW_GROUNDS.id } }); }
}
let fwQmNear = null;
/** The ball comes up on a side game's pin: the lock toast with the stations to complete, once per approach. */
function fwQmApproach(x, z) {
  const g = QM_WORLD_GAMES.fairway.find((it) => Array.isArray(it.pin) && Math.hypot(x - it.pin[0], z - it.pin[1]) < 25);
  if (!g) { fwQmNear = null; return; }
  if (fwQmNear === g.id) return;
  fwQmNear = g.id;
  if (!qmIsOpen(g.gate, qmSnapshot())) qmLockToast(g, { from: "fairway", page: ppHerePage(), link: { runner: FW_RUNNER } });
  else toast(`${g.title} is open here — see Side games.`, 4200);
}
function fwCheckGroundsReturns() {
  const paid = ppCompleteReturns("fairway", [FW_GROUNDS], {
    pay: (r) => (r.passed ? { reputation: 5 + 3 * (r.stars | 0), credits: 20 + 10 * (r.stars | 0) } : { reputation: 1, credits: 5 }),
  });
  for (const x of paid) if (!x.duplicate) toast(`${x.record.simName ?? x.record.simId}: ${x.record.passed ? "passed" : "logged"} — +${x.award.reputation} reputation, +${x.award.credits} credits.`, 4200);
  fwRenderGroundsBoard();
}
fwCheckGroundsReturns();
window.addEventListener("pageshow", (e) => { if (e.persisted) fwCheckGroundsReturns(); });

$("menu-play").addEventListener("click", fwStartRound);
$("menu-facility").addEventListener("click", () => { fwRenderFacilityMenu(); fwShow("scr-facility"); });
$("menu-scores").addEventListener("click", () => { fwRenderScoresScreen(); fwShow("scr-scores"); });
$("facility-back").addEventListener("click", () => fwShow("scr-menu"));
$("scores-back").addEventListener("click", () => fwShow("scr-menu"));
$("sc-again").addEventListener("click", fwStartRound);
$("sc-menu").addEventListener("click", () => fwShow("scr-menu"));

function fwToMenu() {
  app.screen = "menu";
  $("hud").hidden = true;
  $("view-toggle").hidden = true;
  fwShow("scr-menu");
}

// -------------------------------------------------------------------- round

function fwStartRound() {
  if (!app.scene) { fwInitScene(); fwWireTouch(); }
  const seed = (Date.now() % 1e6) + Math.floor(Math.random() * 1000);
  app.round = glCreateRound({ seed, holes: FAIRWAY_HOLES });
  const kind = WEATHER_ROTATION[Math.floor(Math.random() * WEATHER_ROTATION.length)];
  const gust = WEATHER[kind]?.gust ?? 0;
  glSetWind(app.round, { speed: gust * 6, dir: Math.random() * Math.PI * 2 });
  app.weatherLabel = WEATHER[kind]?.label ?? "Clear";
  app.meter = { stage: "idle", t: 0, power: 0, timing: 0 };
  app.cameraMode = "follow";
  app.lastHoleCount = 0;
  app.screen = "playing";
  $("hud").hidden = false;
  $("view-toggle").hidden = false;
  fwShow(null);
  document.querySelectorAll(".screen").forEach((s) => { s.hidden = true; });
  fwRenderClubs();
  fwSyncBall();
  toast(`Nine holes, par 35 — ${app.weatherLabel.toLowerCase()} today.`);
}

function fwSyncBall() {
  const r = app.round;
  app.world.placeBall(r.ball.x, r.ball.z);
  fwQmApproach(r.ball.x, r.ball.z);
  app.world.placeCamera(app.camera, app.cameraMode, r.ball.x, r.ball.z, glAimYaw(r));
}

function fwRenderClubs() {
  const wrap = $("hud-clubs");
  wrap.textContent = "";
  for (const c of GOLF_CLUBS) {
    const b = document.createElement("button");
    b.textContent = c.name;
    b.dataset.club = c.id;
    b.addEventListener("click", () => fwSelectClub(c.id));
    wrap.append(b);
  }
  fwUpdateClubButtons();
}
function fwUpdateClubButtons() {
  const r = app.round;
  if (!r) return;
  for (const b of $("hud-clubs").children) {
    b.classList.toggle("on", b.dataset.club === r.club);
    b.disabled = b.dataset.club === "putter" && !glCanPutt(r);
  }
}
function fwSelectClub(id) {
  const r = app.round;
  if (!r || r.finished) return;
  if (id === "putter" && !glCanPutt(r)) { toast("Only on the green."); return; }
  glSetClub(r, id);
  fwUpdateClubButtons();
}

// The shared touch layer (shared/touch.js): the stick's left-right aims,
// Swing drives the meter, View switches the camera.
let fwStick = { active: false, id: null, dx: 0, dy: 0 };
function fwWireTouch() {
  const t = tcMountTouch({
    hint: "Drag the stick left or right to aim. Tap Swing to start the power meter, again to lock it, again to strike.",
    buttons: [
      { id: "swing-btn", label: "Swing", aria: "Swing meter", onDown: () => fwAdvanceMeter() },
      { id: "touch-view", label: "View", aria: "Switch camera", onDown: () => fwToggleView() },
    ],
  });
  fwStick = t.stick;
  tcMountQuality($("hud-score"), (q) => tcApplyRenderer(app.renderer, tcTier(q)));
}

// ---------------------------------------------------------------- swing meter

const POWER_HZ = 0.62; // one full 0->1->0 sweep every ~1.6 s
const TIMING_HZ = 1.05;

function meterPowerAt(t) { return (Math.sin(t * POWER_HZ * Math.PI * 2 - Math.PI / 2) + 1) / 2; }
function meterTimingAt(t) { return Math.sin(t * TIMING_HZ * Math.PI * 2); }

function fwAdvanceMeter() {
  const r = app.round;
  if (!r || r.finished) return;
  const m = app.meter;
  if (m.stage === "idle") {
    m.stage = "power"; m.t = 0;
    $("hud-meter").hidden = false;
    $("meter-label").textContent = "Power — tap again to lock it";
    return;
  }
  if (m.stage === "power") {
    m.power = meterPowerAt(m.t);
    m.stage = "timing"; m.t = 0;
    $("meter-label").textContent = "Accuracy — tap on centre";
    return;
  }
  if (m.stage === "timing") {
    m.timing = meterTimingAt(m.t);
    fwExecuteSwing(m.power, m.timing);
    m.stage = "idle";
    $("hud-meter").hidden = true;
  }
}

function fwExecuteSwing(power, timing) {
  const r = app.round;
  const holesBefore = r.scorecard.length;
  let ev;
  try {
    ev = r.club === "putter" ? glPutt(r, { power, timing }) : glSwing(r, { power, timing });
  } catch (err) {
    toast(String(err.message ?? err));
    return;
  }
  if (ev.penalty) toast(`Into the ${ev.newLie === "fairway" ? "hazard" : ev.newLie} — stroke and distance, replay from where you were.`);
  else if (ev.holed) toast(`Holed it! ${ev.club === "putter" ? "Nice putt." : "Chip-in!"}`);
  else toast(`${ev.club[0].toUpperCase()}${ev.club.slice(1)} — now in the ${ev.newLie}.`);

  if (r.scorecard.length > holesBefore) fwOnHoleOut(r.scorecard[r.scorecard.length - 1]);
  fwUpdateClubButtons();
  fwSyncBall();
  if (r.finished) fwFinishRound();
}

function fwOnHoleOut(entry) {
  const rel = entry.rel;
  const word = rel <= -2 ? "Eagle or better" : rel === -1 ? "Birdie" : rel === 0 ? "Par" : rel === 1 ? "Bogey" : "Over par";
  toast(`Hole ${entry.hole}: ${entry.strokes} strokes (${word}).`, 3200);
}

// ------------------------------------------------------------ groundskeeper

function fwRenderCare() {
  const r = app.round;
  if (!r) return;
  $("care-score").textContent = r.care.score;
  const wrap = $("care-actions");
  wrap.textContent = "";
  for (const id of Object.keys(r.care.pending)) {
    const h = CARE_HABITS.find((x) => x.id === id);
    if (!h) continue;
    const b = document.createElement("button");
    b.className = "courtesy";
    b.textContent = h.label;
    b.addEventListener("click", () => { glCareEvent(r, id); fwRenderCare(); toast(`${h.label} — logged.`); });
    wrap.append(b);
  }
}
function fwDoFirstCourtesy() {
  const r = app.round;
  if (!r) return;
  const id = Object.keys(r.care.pending)[0];
  if (!id) return;
  glCareEvent(r, id);
  fwRenderCare();
  const h = CARE_HABITS.find((x) => x.id === id);
  toast(`${h.label} — logged.`);
}

// -------------------------------------------------------------------- view

$("view-toggle").addEventListener("click", fwToggleView);
function fwToggleView() {
  app.cameraMode = app.cameraMode === "follow" ? "address" : "follow";
  $("view-toggle").textContent = app.cameraMode === "follow" ? "First person (V)" : "Third person (V)";
  fwSyncBall();
}

// -------------------------------------------------------------------- finish

function fwFinishRound() {
  const r = app.round;
  const summary = glSummary(r);
  const submit = fgSubmitRound(fwStore, app.crewTag, summary.totalStrokes, summary.totalPar);
  const habitsTried = summary.care.opportunities;
  const habitsMet = summary.care.met;
  ppRecordStation({
    app: "fairway",
    simId: "fairway-course",
    simName: "Fairway Park — the nine",
    category: "Grounds & Facilities Care",
    trade: "Groundskeeping",
    certification: null,
    score: summary.care.score,
    stars: summary.care.score >= 85 ? 3 : summary.care.score >= 60 ? 2 : summary.care.score >= 35 ? 1 : 0,
    errors: Math.max(0, habitsTried - habitsMet),
    hazardHits: 0,
    seconds: null,
    parSeconds: null,
    learner: app.crewTag,
    debrief: {
      cleanSteps: habitsMet,
      steps: summary.care.log.map((l, i) => ({ id: `${l.habit}-${i}`, seconds: 0, corrections: l.ok ? 0 : 1, hazards: 0 })),
    },
    note: `Nine holes, ${summary.totalStrokes} strokes (par ${summary.totalPar}, ${summary.relative >= 0 ? "+" : ""}${summary.relative}); course-care score ${summary.care.score}/100 over ${habitsTried} opportunit${habitsTried === 1 ? "y" : "ies"}.`,
  });

  $("sc-title").textContent = `Round complete — ${summary.totalStrokes} (par ${summary.totalPar}, ${summary.relative >= 0 ? "+" : ""}${summary.relative})`;
  const table = $("sc-table");
  table.innerHTML = "<tr><th>Hole</th><th>Par</th><th>Strokes</th><th>+/-</th></tr>" +
    summary.scorecard.map((h) => `<tr><td>${h.hole}</td><td>${h.par}</td><td>${h.strokes}</td><td>${h.rel > 0 ? "+" : ""}${h.rel || "E"}</td></tr>`).join("");
  $("sc-summary").textContent = `${summary.penalties} penalt${summary.penalties === 1 ? "y" : "ies"} stroke${summary.penalties === 1 ? "" : "s"} taken.`;
  $("sc-care-summary").textContent = `Care score ${summary.care.score}/100 — ${habitsMet} of ${habitsTried} courtesies kept, per the course's maintenance plan.`;
  $("sc-care-log").innerHTML = summary.care.log.map((l) => `<div class="care-line ${l.ok ? "ok" : "miss"}">${l.line}</div>`).join("") || "<div class=\"care-line\">No bunkers, divots or ball marks came up this round.</div>";
  const board = fgLoadScores(fwStore).rounds;
  $("sc-board").innerHTML = board.map((row) => `<li>${row.name} — ${row.strokes} (${row.rel > 0 ? "+" : ""}${row.rel || "E"})${submit.rank && row === board[submit.rank - 1] ? " ← you" : ""}</li>`).join("") || "<li>No rounds posted yet.</li>";

  app.screen = "scorecard";
  $("hud").hidden = true;
  $("view-toggle").hidden = true;
  fwShow("scr-scorecard");
}

// -------------------------------------------------------------- scores screen

function fwRenderScoresScreen() {
  const data = fgLoadScores(fwStore);
  $("scores-best").textContent = data.best ? `Best round: ${data.best.name} — ${data.best.strokes} (par ${data.best.par}, ${data.best.rel > 0 ? "+" : ""}${data.best.rel || "E"})` : "No rounds posted yet.";
  $("scores-board").innerHTML = data.rounds.map((r) => `<li>${r.name} — ${r.strokes} (${r.rel > 0 ? "+" : ""}${r.rel || "E"})</li>`).join("") || "<li>—</li>";
  const wrap = $("scores-minigames");
  wrap.innerHTML = FAIRWAY_MINIGAMES_INFO.map((g) => {
    const rows = data[g.id] ?? [];
    return `<h2>${g.name}</h2><ol class="board">${rows.map((r) => `<li>${r.name} — ${r.score}</li>`).join("") || "<li>—</li>"}</ol>`;
  }).join("");
}

// ---------------------------------------------------------------- facility

function fwRenderFacilityMenu() {
  const wrap = $("facility-list");
  wrap.textContent = "";
  const lessons = $("facility-lessons"); if (lessons) { lessons.textContent = ""; k2RenderLessonList(lessons, k2LessonsFor("fairway"), lkStationLink); }
  for (const g of FAIRWAY_MINIGAMES_INFO) {
    const b = document.createElement("button");
    b.className = "mode";
    b.innerHTML = `<b>${g.name}</b><span>${g.blurb}</span>`;
    b.addEventListener("click", () => fwStartMinigame(g.id));
    wrap.append(b);
  }
}

const MG_ENGINES = {
  sprint: { create: sprintCreate, step: sprintStep },
  freethrow: { create: freethrowCreate, step: freethrowStep },
  penalties: { create: penaltyCreate, step: penaltyStep },
};

function fwStartMinigame(id) {
  const info = FAIRWAY_MINIGAMES_INFO.find((g) => g.id === id);
  app.mg = { id, info, state: MG_ENGINES[id].create({ seed: Date.now() % 1e6 }), meter: { stage: "idle", t: 0 }, side: 0 };
  app.screen = "mg-playing";
  $("mg-name").textContent = info.name;
  $("mg-stat-label").textContent = id === "sprint" ? "Metres" : id === "freethrow" ? "Makes" : "Goals";
  fwRenderMgControls();
  fwShow(null);
  document.querySelectorAll(".screen").forEach((s) => { s.hidden = true; });
  $("mg").hidden = false;
}

function fwRenderMgControls() {
  const wrap = $("mg-controls");
  wrap.textContent = "";
  const { id } = app.mg;
  if (id === "sprint") {
    $("mg-bar1").hidden = false; $("mg-bar2").hidden = true;
    $("mg-message").textContent = "Wait for it… then alternate left/right taps.";
    const l = document.createElement("button"); l.className = "btn"; l.textContent = "Left (←)";
    l.addEventListener("pointerdown", () => fwEdge.add("MgTapLeft"));
    const rr = document.createElement("button"); rr.className = "btn"; rr.textContent = "Right (→)";
    rr.addEventListener("pointerdown", () => fwEdge.add("MgTapRight"));
    wrap.append(l, rr);
  } else if (id === "freethrow") {
    $("mg-bar1").hidden = false; $("mg-bar2").hidden = false;
    $("mg-message").textContent = "Tap to charge power, tap again to lock it and read the arc, tap again to shoot.";
    const b = document.createElement("button"); b.className = "btn primary"; b.textContent = "Shoot";
    b.addEventListener("click", fwFreethrowAdvance);
    wrap.append(b);
  } else if (id === "penalties") {
    $("mg-bar1").hidden = false; $("mg-bar2").hidden = false;
    $("mg-message").textContent = "Pick a side, tap to lock power, then kick.";
    const left = document.createElement("button"); left.className = "btn"; left.textContent = "← Side";
    left.addEventListener("click", () => { app.mg.side = Math.max(-1, app.mg.side - 0.2); });
    const right = document.createElement("button"); right.className = "btn"; right.textContent = "Side →";
    right.addEventListener("click", () => { app.mg.side = Math.min(1, app.mg.side + 0.2); });
    const kick = document.createElement("button"); kick.className = "btn primary"; kick.textContent = "Power / Kick";
    kick.addEventListener("click", fwPenaltyAdvance);
    wrap.append(left, right, kick);
  }
}

function fwFreethrowAdvance() {
  const m = app.mg.meter;
  if (m.stage === "idle") { m.stage = "power"; m.t = 0; $("mg-message").textContent = "Charging power…"; return; }
  if (m.stage === "power") { m.power = meterPowerAt(m.t); m.stage = "arc"; m.t = 0; $("mg-message").textContent = "Reading the arc…"; return; }
  const arc = meterPowerAt(m.t);
  const events = freethrowStep(app.mg.state, 0, { shoot: true, power: m.power, arc });
  $("mg-message").textContent = events.some((e) => e.type === "make") ? "Nothing but net." : "Off the rim.";
  m.stage = "idle";
}
function fwPenaltyAdvance() {
  const m = app.mg.meter;
  if (m.stage === "idle") { m.stage = "power"; m.t = 0; $("mg-message").textContent = "Charging power…"; return; }
  const power = meterPowerAt(m.t);
  const events = penaltyStep(app.mg.state, 0, { kick: true, side: app.mg.side, power });
  const kind = events[0]?.type;
  $("mg-message").textContent = kind === "goal" ? "Goal!" : kind === "saved" ? "Saved!" : "Wide!";
  m.stage = "idle";
}

function fwEndMinigame(cancelled) {
  const { id, state } = app.mg;
  if (!cancelled) {
    const submit = fgSubmitMinigame(fwStore, id, app.crewTag, state.score);
    $("mgo-venue").textContent = FAIRWAY_MINIGAMES_INFO.find((g) => g.id === id).venue;
    $("mgo-title").textContent = `Round over — ${state.score} points`;
    $("mgo-summary").textContent = id === "sprint"
      ? (state.finishTime != null ? `Finished in ${state.finishTime.toFixed(2)} s (${state.falseStarts} false start${state.falseStarts === 1 ? "" : "s"}).` : "Didn't finish inside sixty seconds.")
      : id === "freethrow" ? `${state.makes} of ${state.attempts} made, best streak ${state.bestStreak}.`
      : `${state.goals} of ${state.kicks} scored (${state.saved} saved, ${state.wide} wide).`;
    $("mgo-board").innerHTML = (fgLoadScores(fwStore)[id] ?? []).map((r, i) => `<li>${r.name} — ${r.score}${submit.rank === i + 1 ? " ← you" : ""}</li>`).join("") || "<li>—</li>";
    app.screen = "mg-over";
    $("mg").hidden = true;
    fwShow("scr-mg-over");
  } else {
    app.mg = null;
    app.screen = "facility";
    $("mg").hidden = true;
    fwRenderFacilityMenu();
    fwShow("scr-facility");
  }
}
$("mgo-again").addEventListener("click", () => fwStartMinigame(app.mg.id));
$("mgo-menu").addEventListener("click", () => { app.mg = null; app.screen = "facility"; fwRenderFacilityMenu(); fwShow("scr-facility"); });

// ------------------------------------------------------------------- loop

let fwLast = performance.now();
function fwFrame(now) {
  requestAnimationFrame(fwFrame);
  const dt = Math.min(0.05, (now - fwLast) / 1000);
  fwLast = now;
  fwPollPad(dt);
  app.world?.stepSky?.(dt, app.camera);

  if (app.screen === "playing") fwTickPlaying(dt);
  else if (app.screen === "mg-playing") fwTickMinigame(dt);

  fwEdge.clear();
}

function fwTickPlaying(dt) {
  const r = app.round;
  if (!r || r.finished) return;

  let turn = 0;
  if (fwKeys.has("ArrowLeft") || fwKeys.has("KeyA")) turn -= 1;
  if (fwKeys.has("ArrowRight") || fwKeys.has("KeyD")) turn += 1;
  turn += fwPadAxisX();
  if (fwStick.active && Math.abs(fwStick.dx) > 0.12) turn += fwStick.dx;
  if (turn) { glAdjustAim(r, turn * app.aimRate * dt); fwSyncBall(); }

  if (fwEdge.has("Space") || fwEdge.has("Pad0")) fwAdvanceMeter();
  if (fwEdge.has("KeyV")) fwToggleView();
  if (fwEdge.has("KeyC") || fwEdge.has("Pad1")) fwDoFirstCourtesy();
  for (const [i, code] of ["Digit1", "Digit2", "Digit3", "Digit4"].entries()) {
    if (fwEdge.has(code)) fwSelectClub(GOLF_CLUBS[i].id);
  }

  const m = app.meter;
  if (m.stage === "power") { m.t += dt; fwRenderMeterBar(meterPowerAt(m.t)); }
  else if (m.stage === "timing") { m.t += dt; fwRenderMeterBar((meterTimingAt(m.t) + 1) / 2); }

  $("hud-hole").querySelector(".n").textContent = `Hole ${glCurrentHole(r).number} · Par ${glCurrentHole(r).par}`;
  $("hud-hole").querySelector(".sub").textContent = `${glCurrentHole(r).yards} yd · ${glDistanceToPin(r).toFixed(0)} m to pin · Stroke ${r.strokesThisHole + 1}`;
  const relSoFar = r.scorecard.reduce((s, h) => s + h.rel, 0);
  $("hud-score").querySelector("b").textContent = `${r.totalStrokes + r.strokesThisHole} (${relSoFar >= 0 ? "+" : ""}${relSoFar || "E"})`;
  $("hud-wind").textContent = r.wind.speed > 0.4 ? `Wind ${r.wind.speed.toFixed(1)} m/s` : "Calm";
  $("hud-lie").textContent = `Lie: ${r.lastLie}`;
  fwRenderCare();

  app.renderer.render(app.scene, app.camera);
}

function fwRenderMeterBar(v) {
  $("meter-fill").style.width = `${Math.round(v * 100)}%`;
}

function fwTickMinigame(dt) {
  const { id, state, meter } = app.mg;
  const engine = MG_ENGINES[id];
  const input = {};
  if (id === "sprint") {
    if (fwEdge.has("ArrowLeft") || fwEdge.has("MgTapLeft") || fwEdge.has("Pad0")) { input.tap = true; input.side = "left"; }
    else if (fwEdge.has("ArrowRight") || fwEdge.has("MgTapRight") || fwEdge.has("Pad1")) { input.tap = true; input.side = "right"; }
  }
  engine.step(state, dt, input);

  if (id === "sprint") {
    $("mg-bar1-fill").style.width = `${Math.min(100, (state.position / 100) * 100)}%`;
    $("mg-stat-value").textContent = state.position.toFixed(0);
    $("mg-message").textContent = state.phase === "set" ? "Steady… don't jump the gun." : state.phase === "running" ? "Go! Alternate left/right." : state.phase === "finished" ? "Finished!" : "";
  } else if (id === "freethrow") {
    $("mg-stat-value").textContent = `${state.makes}/${state.attempts}`;
    if (meter.stage === "power") { meter.t += dt; $("mg-bar1-fill").style.width = `${meterPowerAt(meter.t) * 100}%`; }
    if (meter.stage === "arc") { meter.t += dt; $("mg-bar2-fill").style.width = `${meterPowerAt(meter.t) * 100}%`; }
  } else if (id === "penalties") {
    $("mg-stat-value").textContent = `${state.goals}/${state.kicks}`;
    $("mg-bar1-fill").style.width = `${((app.mg.side + 1) / 2) * 100}%`;
    if (meter.stage === "power") { meter.t += dt; $("mg-bar2-fill").style.width = `${meterPowerAt(meter.t) * 100}%`; }
  }
  $("mg-time").textContent = `${state.timeLeft.toFixed(0)}s`;

  if (state.over) fwEndMinigame(false);
}

requestAnimationFrame(fwFrame);
fwShow("scr-menu");

// The shared control grammar and help overlay (shared/controls.js, docs/ui-review.md).
// The Guide (shared/guide.js): the floating help button and its question panel.
gdMount();
ctlMount({
  world: "Fairway Park", quality: true,
  except: { move: "Left and right arrows aim; the ball is walked to for you.", interact: "Space swings instead: the course has nothing else to use.", map: "The hole card at the top shows the hole." },
  unique: [
    { label: "Aim", keys: ["←", "→"], pad: "Left stick", touch: "Stick, left and right" },
    { label: "Swing (start, lock power, strike)", keys: ["Space"], pad: "A", touch: "Swing button" },
    { label: "Pick a club", keys: ["1", "2", "3", "4"], pad: "—", touch: "Club buttons" },
  ],
});

// The "Side games" chip and quest-log panel (shared/skill-gates-ui.js), after ctlMount's nav exists.
qmMountSideGames({ world: "fairway", worldName: "Fairway Park", items: QM_WORLD_GAMES.fairway, from: "fairway", page: ppHerePage() });
// The start screen plays a recorded loop of this world behind the menu card
// (console CINEMA, shared/cinema.js, docs/home-backgrounds.md): muted, only
// while the menu is on screen, poster only under reduced motion or Save-Data.
cnMount($("scr-menu"), "start-fairway", { scrim: "linear-gradient(180deg,rgba(5,10,16,.55),rgba(5,10,16,.78))" });

// Live-test handle (tools/measure_frames.mjs, tools/phone_pass.mjs): the app
// state with its scene and renderer once the course is up; read-only by convention.
window.__fairwayTest = { app };
