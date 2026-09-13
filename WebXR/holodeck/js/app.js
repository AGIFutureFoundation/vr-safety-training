import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, celebrationBurst, disposeTree, clamp,
} from "../../shared/kit.js";
import { Sfx, Session } from "../../shared/game.js";
import { THEMES, findTheme, DEFAULT_THEME_ID } from "./themes.js";
import { localInterpreter, interpretPrompt } from "./prompt-parser.js";
import { BALL_RADIUS, buildCourse, createBall, putt, stepBall } from "./minigolf.js";
import { buildTrainingRoom } from "./training.js";
import { createStore } from "./store.js";
import { mountUI } from "./react-ui.js";

// This is the engine half of Holodeck: the Three.js scene, the ball
// physics tick and the pointer-drag putting interaction. react-ui.js
// (mounted at the bottom of this file) owns every DOM element — this file
// never touches the DOM except to mount the canvas and the renderer.

// --------------------------------------------------------------- renderer

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
document.getElementById("stage").appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.05, 60);
const worldRoot = new THREE.Group();
scene.add(worldRoot);

scene.add(new THREE.HemisphereLight(0xdfe9f4, 0x201530, 1.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(3, 6, 2);
scene.add(keyLight);

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const burst = celebrationBurst(worldRoot, { color: 0xffe37a });

// ------------------------------------------------------------------ store

const speechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const store = createStore({
  // A single hud slice shared by both generators — `mode` decides which
  // fields the chips read, so the DOM structure and CSS never change
  // between a mini-golf hole and a training procedure, only the content.
  hud: {
    visible: false, mode: "golf",
    holeName: "", holeSub: "", strokes: 0, par: 0,           // golf-mode fields
    step: "", cue: "", score: "0000", comboText: "", count: "", // training-mode fields
    feedback: "", powerVisible: false, powerPct: 0, railState: "neutral", // shared
  },
  intro: {
    visible: true, promptText: "", listening: false, speechSupported,
    error: "", heard: "", themeId: DEFAULT_THEME_ID, userPickedTheme: false,
  },
  holeResult: { visible: false, stars: "", title: "", note: "", isLast: false },
  final: { visible: false, rows: [], totalPar: 0, totalStrokes: 0, summary: "" },
  trainingResult: { visible: false, stars: "", title: "", scoreText: "", note: "", rankName: "", rankedUp: false, boardRows: [] },
});

// ----------------------------------------------------------- prop dressing
//
// Small, cheap primitive assemblies per theme. Adding a theme only needs an
// entry in themes.js plus cases here for whatever new prop names it lists —
// the course generator and physics never change.

function buildProp(g, kind, x, z, theme) {
  switch (kind) {
    case "pine": {
      const t = group(g, x, 0, z);
      cyl(t, 0.05, 0.06, 0.3, 0, 0.15, 0, 0x5a3a22, { rough: 0.85 });
      cyl(t, 0, 0.3, 0.5, 0, 0.52, 0, 0x2f6b4a, { rough: 0.75 });
      cyl(t, 0, 0.22, 0.4, 0, 0.8, 0, 0x2f6b4a, { rough: 0.75 });
      cyl(t, 0, 0.14, 0.32, 0, 1.04, 0, 0x2f6b4a, { rough: 0.75 });
      break;
    }
    case "igloo":
      ball(g, 0.3, x, 0.0, z, 0xeaf3f8, { rough: 0.6 });
      break;
    case "iceberg": {
      const t = group(g, x, 0, z, Math.random() * Math.PI);
      box(t, 0.4, 0.5, 0.3, 0, 0.2, 0, 0xbfe6f2, { rough: 0.3, metal: 0.1 });
      box(t, 0.22, 0.28, 0.2, 0.12, 0.48, 0, 0xd8f0f8, { rough: 0.3 });
      break;
    }
    case "cactus": {
      const t = group(g, x, 0, z);
      cyl(t, 0.06, 0.07, 0.6, 0, 0.3, 0, 0x2f7d4a, { rough: 0.85 });
      const arm = cyl(t, 0.04, 0.045, 0.3, 0.09, 0.45, 0, 0x2f7d4a, { rough: 0.85 });
      arm.rotation.z = 0.6;
      break;
    }
    case "mesa":
      cyl(g, 0.5, 0.65, 0.5, x, 0.25, z, 0xa8703f, { rough: 0.9, seg: 8 });
      break;
    case "dune": {
      const d = ball(g, 0.5, x, -0.18, z, theme.ground, { rough: 0.95 });
      d.scale.set(1.4, 0.5, 1.2);
      break;
    }
    case "palm": {
      const t = group(g, x, 0, z);
      cyl(t, 0.04, 0.06, 1.2, 0.05, 0.6, 0, 0x8a6b3f, { rough: 0.8 });
      for (let i = 0; i < 5; i++) {
        const frond = box(t, 0.5, 0.03, 0.14, 0.05, 1.2, 0, 0x2f8c4a, { rough: 0.7 });
        frond.rotation.y = (i / 5) * Math.PI * 2;
        frond.rotation.z = 0.5;
      }
      break;
    }
    case "tiki": {
      const t = group(g, x, 0, z);
      cyl(t, 0.09, 0.11, 0.9, 0, 0.45, 0, 0x6b4a2f, { rough: 0.8 });
      decal(t, 0.14, 0.16, 0, 0.6, 0.1, signFace(":", { bg: "#3a2a1a", accent: "#ffcc66", scale: 0.6 }), { px: 96 });
      break;
    }
    case "lagoon":
      box(g, 0.7, 0.02, 0.5, x, 0.005, z, 0x1a8c9c, { rough: 0.2, opacity: 0.85, transparent: true });
      break;
    default:
      break;
  }
}

function scatterProps(g, hole, theme) {
  const count = 6;
  for (let i = 0; i < count; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (hole.width / 2 + 0.5 + Math.random() * 0.6);
    const z = 0.4 + (i / count) * (hole.length - 0.8) + (Math.random() - 0.5) * 0.4;
    const kind = theme.props[i % theme.props.length];
    buildProp(g, kind, x, z, theme);
  }
}

// -------------------------------------------------------------- hole scene

function buildHoleScene(g, hole, theme) {
  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.Fog(theme.fog, 6, 22);

  box(g, hole.width + 3, 0.02, hole.length + 3, 0, -0.03, hole.length / 2, theme.ground, { rough: 0.95, cast: false });
  box(g, hole.width, 0.04, hole.length, 0, -0.02, hole.length / 2, theme.fairway, { rough: 0.8 });

  const curbH = 0.12;
  const halfW = hole.width / 2;
  box(g, 0.06, curbH, hole.length, -halfW - 0.03, curbH / 2, hole.length / 2, theme.wall, { rough: 0.6, metal: 0.3 });
  box(g, 0.06, curbH, hole.length, halfW + 0.03, curbH / 2, hole.length / 2, theme.wall, { rough: 0.6, metal: 0.3 });
  box(g, hole.width + 0.12, curbH, 0.06, 0, curbH / 2, -0.03, theme.wall, { rough: 0.6, metal: 0.3 });
  box(g, hole.width + 0.12, curbH, 0.06, 0, curbH / 2, hole.length + 0.03, theme.wall, { rough: 0.6, metal: 0.3 });
  for (const w of hole.walls) box(g, w.w, curbH * 1.4, w.d, w.x, curbH * 0.7, w.z, theme.wall, { rough: 0.6, metal: 0.3 });

  // Tee marker.
  const teeRing = torus(g, 0.14, 0.008, hole.tee.x, 0.011, hole.tee.z, theme.accent, { emissive: theme.accent, ei: 0.7, rough: 0.5, cast: false });
  teeRing.rotation.x = Math.PI / 2;

  // Cup, ring and flag.
  cyl(g, hole.cup.r * 0.85, hole.cup.r * 0.85, 0.05, hole.cup.x, -0.015, hole.cup.z, 0x0a0a0a, { rough: 0.9, cast: false });
  const cupRing = torus(g, hole.cup.r, 0.012, hole.cup.x, 0.012, hole.cup.z, theme.cupRing, { emissive: theme.cupRing, ei: 1.1, rough: 0.4, cast: false });
  cupRing.rotation.x = Math.PI / 2;
  cyl(g, 0.006, 0.006, 0.5, hole.cup.x, 0.25, hole.cup.z, 0xd8d8d8, { rough: 0.4, metal: 0.6, seg: 6 });
  box(g, 0.14, 0.09, 0.006, hole.cup.x + 0.07, 0.44, hole.cup.z, theme.accent, { rough: 0.5 });

  scatterProps(g, hole, theme);

  const ballMesh = ball(g, BALL_RADIUS, hole.tee.x, BALL_RADIUS, hole.tee.z, 0xffffff, { rough: 0.35, metal: 0.05 });
  return { ballMesh };
}

function positionCamera(hole) {
  const cx = (hole.tee.x + hole.cup.x) / 2;
  const cz = (hole.tee.z + hole.cup.z) / 2;
  camera.position.set(cx * 0.4, 2.3 + hole.length * 0.24, hole.tee.z - 1.9);
  camera.lookAt(cx, 0, cz);
}

// ---------------------------------------------------------------- game state

let course = null;
let holeIndex = 0;
let hole = null;
let ballState = null;
let holeGroup = null;
let ballMesh = null;
let ballMoving = false;
let strokesLog = [];

function clearHole() {
  if (holeGroup) { disposeTree(holeGroup); worldRoot.remove(holeGroup); holeGroup = null; }
}

function enterHole() {
  clearHole();
  hole = course.holes[holeIndex];
  ballState = createBall(hole);
  ballMoving = false;
  holeGroup = new THREE.Group();
  worldRoot.add(holeGroup);
  const theme = findTheme(course.themeId);
  const built = buildHoleScene(holeGroup, hole, theme);
  ballMesh = built.ballMesh;
  positionCamera(hole);
  store.patch("hud", {
    visible: true, mode: "golf",
    holeName: hole.name,
    holeSub: `HOLE ${holeIndex + 1} OF ${course.holes.length}`,
    strokes: 0,
    par: hole.par,
    feedback: "Drag back from the ball, then release to putt.",
    powerVisible: false,
    powerPct: 0,
  });
}

function handleSunk() {
  Sfx.good();
  burst.fire(new THREE.Vector3(ballState.x, 0.1, ballState.z));
  strokesLog.push({ name: hole.name, par: hole.par, strokes: ballState.strokes });
  const diff = ballState.strokes - hole.par;
  const stars = diff <= -1 ? "★★★" : diff === 0 ? "★★☆" : "★☆☆";
  const title = diff <= -1 ? "Eagle!" : diff === 0 ? "Par!" : diff === 1 ? "Bogey" : "Sunk it";
  const note = `Sunk it in ${ballState.strokes} stroke${ballState.strokes === 1 ? "" : "s"} — par is ${hole.par}.`;
  const isLast = holeIndex >= course.holes.length - 1;
  store.patch("holeResult", { visible: true, stars, title, note, isLast });
}

function nextHole() {
  store.patch("holeResult", { visible: false });
  if (holeIndex >= course.holes.length - 1) { showFinal(); return; }
  holeIndex += 1;
  enterHole();
}

function showFinal() {
  const totalStrokes = strokesLog.reduce((a, r) => a + r.strokes, 0);
  const totalPar = strokesLog.reduce((a, r) => a + r.par, 0);
  const diff = totalStrokes - totalPar;
  const summary = diff <= -2 ? "Outstanding round — well under par."
    : diff <= 0 ? "Nice round, at or under par."
    : "Round complete — every course plays easier the second time.";
  store.patch("hud", { visible: false });
  store.patch("final", { visible: true, rows: strokesLog.slice(), totalPar, totalStrokes, summary });
}

function playAgain() {
  if (mode === "training") {
    store.patch("trainingResult", { visible: false });
    enterTraining(lastTrainingParams.templateId, lastTrainingParams.equipmentId);
    return;
  }
  store.patch("final", { visible: false });
  holeIndex = 0;
  strokesLog = [];
  enterHole();
}

function newPrompt() {
  store.patch("final", { visible: false });
  store.patch("trainingResult", { visible: false });
  store.patch("hud", { visible: false });
  clearHole();
  clearTraining();
  scene.background = null;
  scene.fog = null;
  mode = null;
  store.patch("intro", { visible: true });
}

// ----------------------------------------------------------- training scene
//
// A generic renderer for any generated procedure: the same handful of
// primitives (a control panel, a disconnect, a hasp, a meter, a vent fan,
// an attendant stand-in) serve every equipment noun and every template —
// only labels, colors and which pieces appear change.

function simplePerson(g, x, z, accent) {
  const p = group(g, x, 0, z);
  cyl(p, 0.14, 0.16, 0.9, 0, 0.45, 0, 0x2b3138, { rough: 0.6 });
  ball(p, 0.13, 0, 1.0, 0, 0xd8b48c, { rough: 0.7 });
  box(p, 0.3, 0.1, 0.3, 0, 0.95, 0, accent, { rough: 0.5 });
  return p;
}

function buildTrainingScene(g, room) {
  const eq = room.equipment;
  const accent = new THREE.Color(eq.accent).getHex();
  const isConfinedSpace = room.templateId === "confined-space";
  const refs = {};

  box(g, 6, 0.05, 6, 0, -0.03, 0, 0x14101f, { rough: 0.95, cast: false });

  // The equipment itself — every step ultimately concerns this one object.
  const equipGroup = group(g, 0, 0, -0.9);
  box(equipGroup, 1.0, 1.2, 0.5, 0, 0.6, 0, accent, { rough: 0.45, metal: 0.35 });
  const readout = decal(equipGroup, 0.6, 0.3, 0, 1.0, 0.26,
    signFace(eq.noun.toUpperCase(), { bg: "#0d0a18", accent: eq.accent, scale: 0.4 }), { glow: true, ei: 0.7, px: 220 });
  equipGroup.userData.hitId = "task-point";
  refs.taskPoint = equipGroup;

  // Disconnect: a post with a rotating handle — the "turn" step's target.
  const discPost = group(g, -1.1, 0, 0.2);
  cyl(discPost, 0.06, 0.07, 0.9, 0, 0.45, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
  const discHandle = box(discPost, 0.05, 0.28, 0.05, 0, 0.85, 0.1, 0xf0645b, { rough: 0.5 });
  discPost.userData.hitId = "disconnect";
  refs.disconnectHandle = discHandle;
  refs.disconnectPost = discPost;

  // Lockout hasp beside the disconnect.
  const hasp = torus(g, 0.05, 0.01, -1.1, 0.6, 0.28, 0xc8ccd0, { rough: 0.4, metal: 0.7 });
  hasp.rotation.y = Math.PI / 2;
  hasp.userData.hitId = "hasp";
  const appliedLock = box(g, 0.05, 0.08, 0.03, -1.1, 0.6, 0.3, 0xf2c14b, { rough: 0.5 });
  appliedLock.visible = false;
  refs.appliedLock = appliedLock;

  // Meter — used by both the lockout "verify" gauge and the confined-space
  // "atmosphere" gauge.
  const meterPost = group(g, 1.1, 0, 0.2);
  box(meterPost, 0.24, 0.16, 0.05, 0, 0.9, 0, 0x1b1e22, { rough: 0.5 });
  const meterScreen = decal(meterPost, 0.2, 0.1, 0, 0.9, 0.027,
    signFace("--", { bg: "#0d1c24", accent: eq.accent, fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.85, px: 160 });
  cyl(meterPost, 0.03, 0.03, 0.85, 0, 0.42, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
  meterPost.userData.hitId = "meter";
  refs.meterScreen = meterScreen;

  // Work order / permit board, always present.
  const board = group(g, -1.3, 0, -1.3, 0.5);
  box(board, 0.5, 0.36, 0.03, 0, 1.1, 0, 0x1b1e22, { rough: 0.6 });
  decal(board, 0.44, 0.3, 0, 1.1, 0.02,
    signFace(isConfinedSpace ? "ENTRY PERMIT" : "WORK ORDER", { bg: "#11181f", accent: eq.accent, scale: 0.34 }), { px: 220 });
  board.userData.hitId = isConfinedSpace ? "permit-board" : "work-order";

  if (isConfinedSpace) {
    // Ventilation fan.
    const fanGroup = group(g, 1.3, 0, -1.1);
    cyl(fanGroup, 0.22, 0.22, 0.08, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 16 });
    const blades = group(fanGroup, 0, 0.9, 0.05);
    for (let i = 0; i < 4; i++) {
      const blade = box(blades, 0.18, 0.02, 0.05, 0, 0, 0, 0x8d959d, { rough: 0.4, cast: false });
      blade.rotation.z = (i * Math.PI) / 2;
    }
    fanGroup.userData.hitId = "vent-fan";
    refs.ventBlades = blades;

    // Attendant, posted at the entry.
    const attendant = simplePerson(g, 1.6, 1.1, accent);
    attendant.userData.hitId = "attendant";
    refs.attendant = attendant;
  }

  return refs;
}

function positionTrainingCamera() {
  camera.position.set(0.1, 1.9, 2.6);
  camera.lookAt(0, 0.7, -0.5);
}

// -------------------------------------------------------- training lifecycle

let mode = null; // "golf" | "training" | null
let trainingSession = null;
let trainingRoom = null;
let trainingGroup = null;
let trainingRefs = null;
let lastTrainingParams = null;
let hits = {};
let selectables = [];

function collectSelectables() {
  selectables = [];
  for (const id of Object.keys(hits)) hits[id].traverse((o) => { if (o.isMesh) selectables.push(o); });
}

function clearTraining() {
  if (trainingGroup) { disposeTree(trainingGroup); worldRoot.remove(trainingGroup); trainingGroup = null; }
  trainingSession = null;
  hits = {};
  selectables = [];
  trainingTurnState = null;
  ventOn = false;
}

function syncTrainingHud() {
  const s = trainingSession;
  if (!s) return;
  const step = s.step;
  store.patch("hud", {
    score: String(Math.round(s.score)).padStart(4, "0"),
    comboText: s.comboLabel ? `${s.comboLabel.toUpperCase()} ×${s.combo.toFixed(1)}` : "",
    count: `STEP ${Math.min(s.index + 1, s.steps.length)}/${s.steps.length}`,
    step: step ? step.title : "",
    cue: step ? step.cue : "",
  });
}

let ventOn = false;

function onTrainingStepComplete(step) {
  if (step.id === "isolate") Sfx.tick();
  if (step.id === "lock") trainingRefs.appliedLock.visible = true;
  if (step.id === "restore") { trainingRefs.appliedLock.visible = false; trainingRefs.disconnectHandle.rotation.z = 0; }
  if (step.id === "ventilate") ventOn = true;
}

function showTrainingResult(s) {
  const stars = "★".repeat(s.stars) + "☆".repeat(3 - s.stars);
  const mins = Math.floor(s.elapsed / 60), secs = Math.round(s.elapsed % 60);
  Sfx.great();
  store.patch("hud", { visible: false });
  // s.leaderboard/s.rank come straight from Progress via Session.finish() —
  // the same real local-device leaderboard every union-trade sim uses,
  // keyed by this procedure's stable generated id (template + equipment).
  const board = s.leaderboard?.board ?? [];
  store.patch("trainingResult", {
    visible: true, stars,
    title: s.errors === 0 ? "Clean Run" : "Procedure Complete",
    scoreText: `Score ${s.score} · ${mins}:${String(secs).padStart(2, "0")} · ${s.errors} error${s.errors === 1 ? "" : "s"}`,
    note: s.errors === 0
      ? "Every control taken in order, no unsafe action."
      : `${s.errors} correction${s.errors === 1 ? "" : "s"} — run it again for a clean pass.`,
    rankName: s.rank?.name ?? "",
    rankedUp: !!s.rankedUp,
    boardRows: board.map((entry, i) => ({
      place: i + 1, name: entry.name, score: entry.score,
      time: `${Math.floor(entry.seconds / 60)}:${String(entry.seconds % 60).padStart(2, "0")}`,
      isThisRun: s.leaderboard.madeBoard && i === s.leaderboard.rank - 1,
    })),
  });
}

function enterTraining(templateId, equipmentId) {
  clearTraining();
  lastTrainingParams = { templateId, equipmentId };
  trainingRoom = buildTrainingRoom({ templateId, equipmentId });
  trainingGroup = new THREE.Group();
  worldRoot.add(trainingGroup);
  scene.background = new THREE.Color(0x0a0714);
  scene.fog = null;
  trainingRefs = buildTrainingScene(trainingGroup, trainingRoom);
  hits = {};
  trainingGroup.traverse((o) => { if (o.userData.hitId) hits[o.userData.hitId] = o; });
  collectSelectables();
  positionTrainingCamera();

  trainingSession = new Session(trainingRoom, {
    onStep: () => syncTrainingHud(),
    onFeedback: (fb) => {
      const railState = fb.kind === "ok" ? "ok" : fb.kind === "danger" ? "danger" : fb.kind === "partial" ? "neutral" : "warn";
      store.patch("hud", { feedback: fb.text, railState });
      syncTrainingHud();
    },
    onStepComplete: (step) => onTrainingStepComplete(step),
    onHazard: () => {},
    onFinish: (s) => showTrainingResult(s),
  });
  trainingSession.start();
  store.patch("hud", {
    visible: true, mode: "training",
    feedback: `<b>${trainingRoom.title}</b> — follow the procedure in order.`,
    powerVisible: false, powerPct: 0,
  });
  syncTrainingHud();
}

async function generate() {
  Sfx.ensure();
  const { promptText, themeId, userPickedTheme } = store.get().intro;
  const parsed = await interpretPrompt(promptText);
  store.patch("intro", { visible: false });
  if (parsed.gameType === "training") {
    mode = "training";
    enterTraining(parsed.templateId, parsed.equipmentId);
    return;
  }
  mode = "golf";
  const finalThemeId = userPickedTheme ? themeId : parsed.themeId;
  course = buildCourse(findTheme(finalThemeId));
  holeIndex = 0;
  strokesLog = [];
  enterHole();
}

function setPromptText(v) {
  const { userPickedTheme } = store.get().intro;
  const patch = { promptText: v };
  if (!userPickedTheme) patch.themeId = localInterpreter(v).themeId;
  store.patch("intro", patch);
}

function selectTheme(id) {
  store.patch("intro", { themeId: id, userPickedTheme: true });
}

// ------------------------------------------------------------------ speech

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SR) {
  recognition = new SR();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (e) => {
    const transcript = e.results?.[0]?.[0]?.transcript ?? "";
    setPromptText(transcript);
    store.patch("intro", { heard: transcript, listening: false, error: "" });
    generate();
  };
  recognition.onerror = (e) => {
    store.patch("intro", { listening: false, error: `Voice input error: ${e.error ?? "unknown"}. Try typing instead.` });
  };
  recognition.onend = () => store.patch("intro", { listening: false });
}

function toggleMic() {
  if (!recognition) return;
  if (store.get().intro.listening) { recognition.stop(); return; }
  try {
    store.patch("intro", { error: "", heard: "", listening: true });
    recognition.start();
  } catch (err) {
    store.patch("intro", { listening: false, error: String(err?.message ?? err) });
  }
}

// -------------------------------------------------------- putting interaction
//
// Drag back from the ball, release to putt — the whole interaction budget
// on this canvas, since the camera is fixed per hole and there is nothing
// else to click.

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const canvas = renderer.domElement;

const aimGeom = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
const aimLine = new THREE.Line(aimGeom, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
aimLine.visible = false;
scene.add(aimLine);

const MAX_DRAG = 2.2;
const MIN_POWER = 0.06;
let aiming = false;
let dragAnchor = null;
let lastDir = { x: 0, z: 1 };

function raycastGround(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  pointerNdc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointerNdc, camera);
  const hit = new THREE.Vector3();
  return raycaster.ray.intersectPlane(groundPlane, hit) ? hit : null;
}

function canPutt() {
  return mode === "golf" && hole && ballState && !ballState.sunk && !ballMoving &&
    !store.get().intro.visible && !store.get().holeResult.visible && !store.get().final.visible;
}

// ------------------------------------------------------- training interaction
//
// Click to select, drag horizontally on the disconnect to turn it — the
// same two gestures every hand-authored sim in this project uses, just
// against the generic props buildTrainingScene() creates.

function findHit(intersections) {
  for (const it of intersections) {
    let o = it.object;
    while (o) { if (o.userData.hitId) return o.userData.hitId; o = o.parent; }
  }
  return null;
}
function castFromCameraObjects() {
  raycaster.setFromCamera(pointerNdc, camera);
  return findHit(raycaster.intersectObjects(selectables, false));
}
function updateNdc(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  pointerNdc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
}

let trainingTurnState = null; // { id, lastX }
let trainingDownId = null;
let trainingDownAt = 0;

function activateTraining(id) {
  trainingSession?.select(id);
}
function beginTrainingTurn(id, clientX) {
  if (!trainingSession || trainingSession.step?.kind !== "turn" || trainingSession.step.target !== id) return false;
  trainingTurnState = { id, lastX: clientX };
  return true;
}
function updateTrainingTurn(clientX) {
  if (!trainingTurnState) return;
  const delta = (clientX - trainingTurnState.lastX) * 0.003;
  trainingTurnState.lastX = clientX;
  trainingSession.rotate(trainingTurnState.id, delta);
  syncTrainingHud();
}
function endTrainingTurn() { trainingTurnState = null; }

function trainingPointerDown(e) {
  if (mode !== "training" || !trainingSession) return;
  updateNdc(e.clientX, e.clientY);
  const hit = castFromCameraObjects();
  if (hit && beginTrainingTurn(hit, e.clientX)) { trainingDownAt = performance.now(); return; }
  trainingDownId = hit ?? null;
  trainingDownAt = performance.now();
}
function trainingPointerMove(e) {
  if (mode !== "training") return;
  updateNdc(e.clientX, e.clientY);
  if (trainingTurnState) { updateTrainingTurn(e.clientX); return; }
  const hit = castFromCameraObjects();
  canvas.style.cursor = hit ? (hit === trainingSession?.step?.target && trainingSession?.step?.kind === "turn" ? "grab" : "pointer") : "default";
}
function trainingPointerUp(e) {
  if (mode !== "training") return;
  if (trainingTurnState) { endTrainingTurn(); return; }
  if (performance.now() - trainingDownAt < 280 && trainingDownId) {
    updateNdc(e.clientX, e.clientY);
    const hit = castFromCameraObjects();
    if (hit && hit === trainingDownId) activateTraining(hit);
  }
  trainingDownId = null;
}
function trainingPointerCancel() {
  trainingTurnState = null;
  trainingDownId = null;
}

function updateAimVisual(power) {
  if (!aiming) { aimLine.visible = false; return; }
  aimLine.visible = true;
  const len = 0.4 + power * 1.6;
  aimLine.geometry.setFromPoints([
    new THREE.Vector3(ballState.x, BALL_RADIUS, ballState.z),
    new THREE.Vector3(ballState.x + lastDir.x * len, BALL_RADIUS, ballState.z + lastDir.z * len),
  ]);
}

canvas.addEventListener("pointerdown", (e) => {
  if (mode === "training") { trainingPointerDown(e); return; }
  if (!canPutt()) return;
  dragAnchor = raycastGround(e.clientX, e.clientY);
  if (!dragAnchor) return;
  aiming = true;
  store.patch("hud", { powerVisible: true, powerPct: 0 });
});
addEventListener("pointermove", (e) => {
  if (mode === "training") { trainingPointerMove(e); return; }
  if (!aiming) return;
  const cur = raycastGround(e.clientX, e.clientY);
  if (!cur) return;
  const dx = dragAnchor.x - cur.x, dz = dragAnchor.z - cur.z;
  const dist = Math.hypot(dx, dz);
  const power = clamp(dist / MAX_DRAG, 0, 1);
  if (dist > 0.001) lastDir = { x: dx / dist, z: dz / dist };
  store.patch("hud", { powerPct: Math.round(power * 100) });
  updateAimVisual(power);
});
function endAim(commit) {
  if (!aiming) return;
  aiming = false;
  aimLine.visible = false;
  const power = clamp(store.get().hud.powerPct / 100, 0, 1);
  store.patch("hud", { powerVisible: false, powerPct: 0 });
  if (commit && power >= MIN_POWER) {
    putt(ballState, lastDir.x, lastDir.z, power);
    ballMoving = true;
    Sfx.tick();
    store.patch("hud", { strokes: ballState.strokes, feedback: "Rolling…" });
  }
}
addEventListener("pointerup", (e) => { if (mode === "training") trainingPointerUp(e); else endAim(true); });
addEventListener("pointercancel", () => { if (mode === "training") trainingPointerCancel(); else endAim(false); });

// --------------------------------------------------------------- frame loop

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === "golf" && ballMoving && ballState) {
    const { moving, sunk } = stepBall(ballState, hole, dt);
    ballMesh.position.set(ballState.x, BALL_RADIUS, ballState.z);
    if (!moving) {
      ballMoving = false;
      if (sunk) handleSunk();
      else store.patch("hud", { feedback: "Drag back from the ball, then release to putt." });
    }
  }
  if (mode === "training" && trainingSession && !trainingSession.finished) {
    trainingSession.tick(dt);
    const step = trainingSession.step;
    if (step?.kind === "turn") {
      const amount = trainingSession.turn?.amount ?? 0;
      const reverse = step.turn?.reverse ? -1 : 1;
      trainingRefs.disconnectHandle.rotation.z = amount * Math.PI * 2 * reverse;
    }
    if (trainingRefs.ventBlades && ventOn) trainingRefs.ventBlades.rotation.z += dt * 6;
    const gg = trainingSession.gauge;
    if (gg && !gg.committed && step?.kind === "gauge") {
      const text = step.gauge?.readout?.(gg.t) ?? `${Math.round(gg.t * 100)}%`;
      const inBand = gg.t >= step.gauge.green[0] && gg.t <= step.gauge.green[1];
      repaint(trainingRefs.meterScreen, signFace(text, {
        bg: "#0d1c24", accent: inBand ? "#59c97b" : trainingRoom.equipment.accent, fg: "#bfeaf7", scale: 0.55,
      }));
    }
  }
  burst.update(dt);
  renderer.render(scene, camera);
});

mountUI(store, {
  setPromptText, toggleMic, selectTheme, generate,
  nextHole, playAgain, newPrompt,
});

// Test-only hook: precisely clicking a 3D object's exact screen position
// from an automated browser test is brittle, but the click/turn handlers
// just forward to trainingSession.select()/rotate() — the same calls this
// exposes directly, so a test can drive the real Session and verify the
// UI reacts correctly without needing to replicate the camera projection.
window.__holodeckTest = {
  select: (id) => trainingSession?.select(id),
  rotate: (id, delta) => trainingSession?.rotate(id, delta),
  getMode: () => mode,
  session: () => trainingSession,
};
