import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, celebrationBurst, disposeTree, clamp, easeOut,
  GESTURE_HINTS,
} from "../../shared/kit.js";
import { Sfx, Session, Progress } from "../../shared/game.js";
import { speak, speechSupported } from "../../shared/voice-assist.js";
import { TrainingRecords } from "../../shared/records.js";
import { Identity } from "../../shared/identity.js";
import { Lrs } from "../../shared/lrs.js";
import { createAnnouncer, createTargetCursor, describeTarget, reducedMotion, escapeHtml } from "../../shared/a11y.js";
import { lessonProgress } from "../../shared/lessons.js";
import { makeVariant } from "../../shared/variants.js";
import { buildReplay } from "../../shared/incidents.js";
import { stageReplay } from "../../shared/incident-stage.js";
import { splitByRole, roleView, describeSplit } from "../../shared/crew.js";

// Progress is the profile shared with SmartCiti.X and Trade Skills. It has
// to be loaded before any Session finishes: Session.finish() calls
// Progress.record()/submitScore(), which save the in-memory profile — and
// without this load that in-memory profile was the empty default, so one
// finished Holodeck run overwrote the learner's XP, badges and leaderboards
// from the other two apps with nothing.
Progress.load();
Identity.load();
if (Identity.tag()) Progress.setPlayerName(Identity.tag());
Identity.listen(() => { if (Identity.tag()) Progress.setPlayerName(Identity.tag()); });
// Live LRS delivery, configured by launch URL or the embedding page; a
// queue left by an earlier tab is retried on load.
Lrs.load();
Lrs.listen(() => Identity.current?.homePage, () => Lrs.flush());
if (Lrs.pending()) Lrs.flush();
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
// Every prop's mesh already defaults to castShadow/receiveShadow (see
// shared/kit.js) — shadows were simply never turned on at the renderer, so
// nothing has ever actually cast one. Filmic tone mapping + correct sRGB
// output is a post-process color-grading step, not a lighting change: every
// existing light intensity stays as tuned, but highlights roll off instead
// of clipping and colors read as real materials instead of flat fills.
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5;
renderer.xr.enabled = true;
document.getElementById("stage").appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.05, 60);
// Neither generator has locomotion even on desktop — one fixed vantage per
// hole or procedure, reach out and click. A VR headset gets the same fixed
// seat: `rig` is the vantage point positionCamera()/positionTrainingCamera()
// place in the world, and the headset's own pose composes on top of it, the
// same rig-plus-child-camera pattern SmartCiti.X and the Trade Skills
// Simulator use for room-scale movement.
const rig = new THREE.Group();
rig.add(camera);
// Group.lookAt() (unlike Camera.lookAt()) orients an object's forward axis
// AWAY from the target, not toward it — the right convention for something
// like a bone or an arrow, the wrong one for a camera rig. This builds the
// camera-style look-at matrix directly instead.
const _lookMat = new THREE.Matrix4();
function orientRig(tx, ty, tz) {
  _lookMat.lookAt(rig.position, new THREE.Vector3(tx, ty, tz), rig.up);
  rig.quaternion.setFromRotationMatrix(_lookMat);
}
const worldRoot = new THREE.Group();
scene.add(worldRoot);
scene.add(rig);

scene.add(new THREE.HemisphereLight(0xdfe9f4, 0x201530, 1.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
keyLight.position.set(3, 6, 2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1536, 1536);
keyLight.shadow.bias = -0.0015;
// Generously sized rather than fit tightly per-scene: the mini-golf holes
// (up to ~9m long, tee near the origin) and the training procedure's fixed
// 6x6 pad sit in different parts of world space, and this light's frustum
// is defined in its own tilted view direction, not raw world x/z — one
// frustum comfortably covering the union of both is simpler and safer than
// re-fitting it every time a new scene is entered.
keyLight.shadow.camera.left = -10;
keyLight.shadow.camera.right = 10;
keyLight.shadow.camera.top = 10;
keyLight.shadow.camera.bottom = -10;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 22;
scene.add(keyLight);

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const burst = celebrationBurst(worldRoot, { color: 0xffe37a });

// ------------------------------------------------------------------ store

// Speech RECOGNITION (dictating a prompt) is a separate capability from the
// speech SYNTHESIS this file also imports from voice-assist.js (reading a
// hint aloud) — kept as two names since a browser can support either
// independently of the other.
const micInputSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const store = createStore({
  // A single hud slice shared by both generators — `mode` decides which
  // fields the chips read, so the DOM structure and CSS never change
  // between a mini-golf hole and a training procedure, only the content.
  hud: {
    visible: false, mode: "golf",
    holeName: "", holeSub: "", strokes: 0, par: 0,           // golf-mode fields
    step: "", cue: "", score: "0000", comboText: "", count: "", // training-mode fields
    gestureVerb: "", gestureVisible: false,                  // training-mode fields
    feedback: "", powerVisible: false, powerPct: 0, railState: "neutral", // shared
  },
  gestureTip: { html: "", show: false },
  intro: {
    visible: true, promptText: "", listening: false, speechSupported: micInputSupported,
    error: "", heard: "", themeId: DEFAULT_THEME_ID, userPickedTheme: false,
    xrSupported: false,
  },
  holeResult: { visible: false, stars: "", title: "", note: "", isLast: false },
  final: { visible: false, rows: [], totalPar: 0, totalStrokes: 0, summary: "" },
  trainingResult: { visible: false, stars: "", title: "", scoreText: "", note: "", rankName: "", rankedUp: false, boardRows: [] },
  // A composed programme rather than a scene: the third thing a prompt can
  // produce. See shared/lessons.js.
  lesson: { visible: false, html: "" },
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
  rig.position.set(cx * 0.4, 2.3 + hole.length * 0.24, hole.tee.z - 1.9);
  orientRig(cx, 0, cz);
  rig.updateMatrixWorld(true);
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
    // Play Again re-runs the same thing, not the station underneath it: a
    // replay of last week's near-miss is the drill the learner asked for, and
    // a crew view is a different exercise from the whole procedure.
    if (lastTrainingParams.kind === "incident") enterIncident(lastTrainingParams.incident);
    else if (lastTrainingParams.kind === "crew") enterCrewRole(lastTrainingParams.simId, lastTrainingParams.roleId);
    else if (lastTrainingParams.kind === "real") enterRealSim(lastTrainingParams.simId, lastTrainingParams.variantLevel);
    else enterGenericTraining(lastTrainingParams.templateId, lastTrainingParams.equipmentId);
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
  store.patch("lesson", { visible: false });
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
  const isPressureBleed = room.templateId === "pressure-bleed";
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

  let ventBlades = null;
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
    ventBlades = blades;
    refs.ventBlades = blades;

    // Attendant, posted at the entry.
    const attendant = simplePerson(g, 1.6, 1.1, accent);
    attendant.userData.hitId = "attendant";
    refs.attendant = attendant;
  }

  let blindDisc = null;
  if (isPressureBleed) {
    // Bleed valve: a small wheeled valve beside the disconnect post — the
    // "hold" step's target, bled by holding it rather than a single click.
    const bleedPost = group(g, -0.75, 0, 0.5);
    cyl(bleedPost, 0.035, 0.035, 0.4, 0, 0.2, 0, 0x2b3138, { rough: 0.5, metal: 0.4 });
    torus(bleedPost, 0.09, 0.02, 0, 0.42, 0, 0xf2c14b, { rough: 0.4, metal: 0.5 });
    bleedPost.userData.hitId = "bleed-valve";

    // Flange stub — always visible and clickable, the "blind"/"restore"
    // steps' actual target. blindDisc is the physical barrier itself,
    // invisible until installed, exactly like hasp/appliedLock above.
    const flangeStub = group(g, -1.1, 0, 0.42);
    cyl(flangeStub, 0.1, 0.1, 0.04, 0, 0.6, 0, 0x8a949d, { rough: 0.4, metal: 0.6, seg: 20 });
    flangeStub.userData.hitId = "flange";
    blindDisc = cyl(g, 0.13, 0.13, 0.025, -1.1, 0.6, 0.45, 0xc8ccd0, { rough: 0.3, metal: 0.75, seg: 20 });
    blindDisc.visible = false;
    refs.blindDisc = blindDisc;
  }

  // Bundling the step-reaction and per-frame visual logic onto the returned
  // refs — rather than in a module-level closure keyed on hardcoded step ids
  // — is exactly the shape every real SmartCiti.X sim's own build() already
  // returns. That shared shape is what lets enterTraining() below run either
  // kind of room through one unified path, including a real station loaded
  // straight from the SmartCiti.X library (see loadRealSim()).
  let ventOn = false;
  refs.onStepComplete = (step) => {
    if (step.id === "isolate") Sfx.tick();
    if (step.id === "lock") appliedLock.visible = true;
    if (step.id === "restore") { appliedLock.visible = false; discHandle.rotation.z = 0; if (blindDisc) blindDisc.visible = false; }
    if (step.id === "ventilate") ventOn = true;
    if (step.id === "blind" && blindDisc) blindDisc.visible = true;
  };
  refs.animate = (t, dt, session) => {
    const step = session?.step;
    if (step?.kind === "turn") {
      const amount = session.turn?.amount ?? 0;
      const reverse = step.turn?.reverse ? -1 : 1;
      discHandle.rotation.z = amount * Math.PI * 2 * reverse;
    }
    if (ventBlades && ventOn) ventBlades.rotation.z += dt * 6;
    const gg = session?.gauge;
    if (gg && !gg.committed && step?.kind === "gauge") {
      const text = step.gauge?.readout?.(gg.t) ?? `${Math.round(gg.t * 100)}%`;
      const inBand = gg.t >= step.gauge.green[0] && gg.t <= step.gauge.green[1];
      repaint(meterScreen, signFace(text, {
        bg: "#0d1c24", accent: inBand ? "#59c97b" : eq.accent, fg: "#bfeaf7", scale: 0.55,
      }));
    }
  };

  return refs;
}

function positionTrainingCamera(footprint) {
  // The generic Mad-Libs procedure has one fixed, hand-tuned layout. A real
  // SmartCiti.X station reports its own footprint (its build() sizes the
  // whole scene around it) and has no fixed layout Holodeck knows in
  // advance, so it gets a generic distance-from-footprint vantage instead —
  // the same "footprint + margin" formula SmartCiti.X's own app.js uses.
  if (footprint == null) {
    rig.position.set(0.1, 1.9, 2.6);
    orientRig(0, 0.7, -0.5);
  } else {
    rig.position.set(0, 1.7, footprint + 1.6);
    orientRig(0, 0.9, 0);
  }
  rig.updateMatrixWorld(true);
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
  trainingRefs = null;
  hits = {};
  selectables = [];
  trainingTurnState = null;
  trainingDragState = null;
  trainingReturning.length = 0;
}

function syncTrainingHud() {
  const s = trainingSession;
  if (!s) return;
  const step = s.step;
  const hint = step ? GESTURE_HINTS[step.kind] : null;
  store.patch("hud", {
    score: String(Math.round(s.score)).padStart(4, "0"),
    comboText: s.comboLabel ? `${s.comboLabel.toUpperCase()} ×${s.combo.toFixed(1)}` : "",
    count: `STEP ${Math.min(s.index + 1, s.steps.length)}/${s.steps.length}`,
    step: step ? step.title : "",
    cue: step ? step.cue : "",
    gestureVerb: hint?.verb ?? "",
    gestureVisible: !!hint,
  });
}

/** Speak a line unless the player has muted the room with M. */
const srAnnouncer = createAnnouncer();
function announce(text) {
  srAnnouncer.say(text);
  if (!Sfx.muted) speak(text);
}

/** The line the speaker button reads back: the live step's title and cue
 * while a procedure is running, otherwise how to get one started. */
function currentHintLine() {
  const step = trainingSession?.step;
  if (step) return `${step.title}. ${step.cue}`;
  return "Speak or type a procedure to begin.";
}

// One-time, just-in-time teaching, exactly like SmartCiti.X and Trade
// Skills: the first time a learner's own play history ever reaches a given
// step kind, explain the physical gesture it wants — after that it trusts
// the HUD gesture chip to carry it.
const GESTURE_SEEN_KEY = "holodeck-gestures-seen";
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

function showTrainingResult(s) {
  const stars = "★".repeat(s.stars) + "☆".repeat(3 - s.stars);
  const mins = Math.floor(s.elapsed / 60), secs = Math.round(s.elapsed % 60);
  Sfx.great();
  store.patch("hud", { visible: false });
  // s.leaderboard/s.rank come straight from Progress via Session.finish() —
  // the same real local-device leaderboard every union-trade sim uses,
  // keyed by this procedure's stable generated id (template + equipment).
  const board = s.leaderboard?.board ?? [];
  // Same attempt record SmartCiti.X writes, shape-tolerant: a real station
  // loaded from the SmartCiti.X library carries category/certification, a
  // generated procedure records under its template as the category.
  const room = trainingRoom;
  const attempt = TrainingRecords.record({
    app: "holodeck", source: lastTrainingParams?.kind ?? "generic",
    learner: Progress.playerName, learnerName: Identity.current?.name, learnerId: Identity.current?.id, homePage: Identity.current?.homePage,
    simId: room.id, simName: room.name ?? room.title,
    category: room.category ?? `Holodeck — ${room.title.split(" — ")[1] ?? "Generated procedure"}`,
    trade: room.trade, certification: room.certification, system: room.game?.system,
    score: s.score, stars: s.stars, errors: s.errors, hazardHits: s.hazardHits, holdBreaks: s.holdBreaks,
    seconds: Math.round(s.elapsed), parSeconds: room.parSeconds,
    badges: s.earned ?? [], level: s.level, levelName: s.levelName,
  });
  Identity.emit("smartcitix:record", { record: attempt });
  Lrs.ship([attempt], { actorName: Progress.playerName, homePage: location.origin });
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
  announce(`${trainingRoom.title} complete. ${s.stars} star${s.stars === 1 ? "" : "s"}.` +
    (s.rankedUp && s.rank?.name ? ` Rank up — ${s.rank.name}.` : "") +
    (s.leaderboard?.madeBoard ? ` New number ${s.leaderboard.rank} on the local leaderboard.` : ""));
}

/**
 * Drives ANY Session-compatible room through Holodeck's training UI — the
 * generic Mad-Libs procedure buildTrainingScene() renders, or a real
 * SmartCiti.X station loaded straight from its own module (see
 * loadRealSim()). Session hooks forward to whatever the room's own build()
 * returned, exactly like SmartCiti.X's own enterSim() — this file never
 * special-cases which kind of room it got.
 */
function enterTraining(room, buildFn) {
  clearTraining();
  trainingRoom = room;
  trainingGroup = new THREE.Group();
  worldRoot.add(trainingGroup);
  scene.background = new THREE.Color(0x0a0714);
  scene.fog = null;
  trainingRefs = buildFn(trainingGroup);
  hits = {};
  trainingGroup.traverse((o) => { if (o.userData.hitId) hits[o.userData.hitId] = o; });
  // A real SmartCiti.X room's own build() return already carries a complete
  // hits map (see loadRealSim()) — merge it in on top of the traversal.
  // Needed for entries like a drag step's socket: a permanently invisible,
  // non-clickable marker that never gets a userData.hitId (nothing should
  // ever raycast onto it), registered only so app.js can look up its
  // transform for the snap/distance check. The traversal alone would drop it.
  if (trainingRefs.hits) Object.assign(hits, trainingRefs.hits);
  collectSelectables();
  positionTrainingCamera(room.footprint);

  trainingSession = new Session(room, {
    onStep: (step, s) => {
      trainingRefs.onStep?.(step, s);
      kbCursor.set(targetsForStep(step));
      kbCarrying = null;
      srAnnouncer.say(`Step ${(s.index | 0) + 1} of ${s.steps.length}. ${step.title}. ${step.cue}`);
      if (kbActive && kbCursor.current) kbFocus(kbCursor.current, { announceIt: false });
      maybeShowGestureTip(step.kind);
      syncTrainingHud();
    },
    onFeedback: (fb, s) => {
      trainingRefs.onFeedback?.(fb, s);
      const railState = fb.kind === "ok" ? "ok" : fb.kind === "danger" ? "danger" : fb.kind === "partial" ? "neutral" : "warn";
      store.patch("hud", { feedback: fb.text, railState });
      if (fb.kind === "danger") { srAnnouncer.alert(fb.text); if (fb.speech) announce(fb.speech); }
      syncTrainingHud();
    },
    onStepComplete: (step, s) => trainingRefs.onStepComplete?.(step, s),
    onHazard: (id, s) => trainingRefs.onHazard?.(id, s),
    onFinish: (s) => showTrainingResult(s),
  });
  trainingSession.start();
  store.patch("hud", {
    visible: true, mode: "training",
    feedback: `<b>${room.title}</b> — follow the procedure in order.`,
    powerVisible: false, powerPct: 0,
  });
  syncTrainingHud();
}

function enterGenericTraining(templateId, equipmentId) {
  lastTrainingParams = { kind: "generic", templateId, equipmentId };
  const room = buildTrainingRoom({ templateId, equipmentId });
  enterTraining(room, (g) => buildTrainingScene(g, room));
}

// -------------------------------------------------------- real SmartCiti.X sims
//
// Holodeck's own generic procedures are Mad-Libs stand-ins built from a
// small vocabulary of equipment nouns; SmartCiti.X's walkable stations are the
// real, hand-authored thing — a full hazard set and a purpose-built 3D
// station per trade. Naming one directly loads its actual module and runs
// it through the exact same engine and UI a generic prompt does, so
// "speak a simulation into existence" can reach the whole real library, not
// just the generated one.
//
// Covers every walkable station — the pick-up-and-carry "drag" gesture (see
// beginTrainingDrag() below) closed the last gap, so every interaction kind
// a SmartCiti.X step can use now has a Holodeck pointer/controller path.
const realSimCache = new Map();
function loadRealSim(id) {
  if (realSimCache.has(id)) return realSimCache.get(id);
  const exportName = `SIM_${id.toUpperCase().replace(/-/g, "_")}`;
  // Reaches the real station module SmartCiti.X's own dist ships for lazy
  // loading (tools/bundle_webxr.py) — this makes Holodeck's dist depend on
  // SmartCiti.X's dist being deployed alongside it under the same WebXR/
  // root, unlike its generic-only predecessor.
  const promise = import(`../../smartcity/dist/sims/${id}.js`).then((mod) => mod[exportName]);
  realSimCache.set(id, promise);
  return promise;
}

/**
 * Run a station with one reported event added — see shared/incidents.js.
 *
 * The report is the crew's own sentence; nothing about it is rewritten, and
 * buildReplay refuses rather than inventing a control when the station has
 * nothing that would answer the event. A refusal loads the plain station and
 * says why, because a near-miss report that produced silence would look like
 * the app had simply not understood it.
 */
async function enterIncident(incident) {
  const simId = incident.stationId;
  lastTrainingParams = { kind: "incident", simId, incident };
  clearTraining();
  store.patch("hud", { visible: true, mode: "training", feedback: "<b>Building the replay…</b>" });
  let base;
  try { base = await loadRealSim(simId); }
  catch (err) { base = null; }
  if (!base) {
    store.patch("hud", { feedback: "<b>Could not load that station.</b> Try describing a generic procedure instead." });
    return;
  }
  // stageReplay is what puts the event in the room rather than only in the
  // banner — see shared/incident-stage.js.
  const replay = buildReplay(base, incident, { stage: stageReplay });
  if (!replay) {
    store.patch("hud", { feedback: `<b>${escapeHtml(base.name ?? simId)}</b><br>Nothing in this station answers that kind of event, so it runs as authored rather than as a drill built on a guess.` });
    enterTraining(base, (g) => base.build(g));
    return;
  }
  const r = replay.replay;
  const placed = r.placement === "unplaced" ? "the report did not say where in the job" : `at "${r.stepTitle}"`;
  store.patch("hud", { feedback: `<b>Incident replay · ${escapeHtml(r.baseName)}</b><br>${escapeHtml(r.eventLabel)} ${escapeHtml(placed)} · ${escapeHtml(r.placement)} placement${r.grounded ? "" : " · the station never explains this control, so the reason is the report's own words"}` });
  enterTraining(replay, (g) => replay.build(g));
}

/**
 * Run a station from one post of a two-person crew — see shared/crew.js.
 *
 * Most stations decline: they are written from one point of view and the
 * second person is scenery. A decline loads the whole procedure and says so,
 * rather than pretending a role exists.
 */
async function enterCrewRole(simId, roleId) {
  lastTrainingParams = { kind: "crew", simId, roleId };
  clearTraining();
  store.patch("hud", { visible: true, mode: "training", feedback: "<b>Loading station…</b>" });
  let base;
  try { base = await loadRealSim(simId); }
  catch (err) { base = null; }
  if (!base) {
    store.patch("hud", { feedback: "<b>Could not load that station.</b> Try describing a generic procedure instead." });
    return;
  }
  const split = splitByRole(base);
  const view = split.split ? roleView(base, roleId, split) : null;
  if (!view) {
    store.patch("hud", { feedback: `<b>${escapeHtml(base.name ?? simId)}</b><br>${escapeHtml(describeSplit(base, split))}. Running the whole procedure instead.` });
    enterTraining(base, (g) => base.build(g));
    return;
  }
  store.patch("hud", { feedback: `<b>${escapeHtml(view.name)}</b><br>${escapeHtml(view.tagline ?? "")}<br>You perform ${view.crew.owns} of ${view.steps.length} steps; the other ${view.crew.watches} belong to the ${escapeHtml(view.crew.counterpartName.toLowerCase())} and you confirm them.` });
  enterTraining(view, (g) => view.build(g));
}

async function enterRealSim(simId, variantLevel = null) {
  lastTrainingParams = { kind: "real", simId, variantLevel };
  // Cleared up front, not just on success: a failed reload (Play Again on a
  // finished real-sim run, then the fetch rejects) must not leave the prior
  // run's finished scene/session sitting under the "Could not load" message.
  clearTraining();
  store.patch("hud", { visible: true, mode: "training", feedback: "<b>Loading station…</b>" });
  let room;
  try { room = await loadRealSim(simId); }
  catch (err) { room = null; }
  if (!room) {
    store.patch("hud", { feedback: `<b>Could not load that station.</b> Try describing a generic procedure instead.` });
    return;
  }
  // An assessment request runs the same station with the hint rail off, a
  // tighter clock and the alarms rehung — see shared/variants.js. The seed is
  // shown, so an instructor can reissue this exact run to a whole class.
  if (variantLevel) {
    const v = makeVariant(room, { seed: Math.floor(Math.random() * 1e6), level: variantLevel });
    if (v) {
      room = v;
      store.patch("hud", { feedback: `<b>${escapeHtml(v.name)}</b><br>${escapeHtml(v.variant.differs.join(" · "))} · seed ${v.variant.seed}` });
    }
  }
  enterTraining(room, (g) => room.build(g));
}

/**
 * Render a composed lesson: the stations in order, why each is in the block,
 * the points target, and a launch link per station. Progress comes from the
 * learner's own training records, so a station finished in SmartCiti.X or
 * Trade Skills ticks here without this app having to watch them do it.
 */
function showLesson(lesson) {
  const done = lessonProgress(lesson, TrainingRecords.list?.() ?? []);
  const rows = lesson.stations.map((st) => `
    <li class="lesson-row">
      <span class="lesson-n">${st.order}</span>
      <span class="lesson-body">
        <a class="lesson-launch" href="../../smartcity/dist/smartcity-x.html?sim=${encodeURIComponent(st.id)}">${escapeHtml(st.name)}</a>
        <small>${escapeHtml(st.why)} · ${st.steps} steps${st.interrupts ? ` · ${st.interrupts} interruptions` : ""}</small>
      </span>
    </li>`).join("");
  store.patch("lesson", {
    visible: true,
    html: `
      <h2>${escapeHtml(lesson.title)}</h2>
      <p class="lesson-meta">${lesson.stations.length} stations · about ${lesson.estimate.minutes} minutes ·
        ${escapeHtml(lesson.unions.join(", ") || "cross-craft")}</p>
      <ol class="lesson-list">${rows}</ol>
      <p class="lesson-meta"><b>${done.points} / ${lesson.points.target} points</b> to pass
        (${Math.round(lesson.points.pass * 100)}% of a clean run across the block) ·
        ${done.stationsDone} of ${done.stationsTotal} stations done</p>
      ${lesson.standards.length ? `<p class="lesson-meta">Standards: ${escapeHtml(lesson.standards.join(" · "))}</p>` : ""}`,
  });
}

/**
 * What a prompt can turn into, in the order the interpretation is trusted.
 *
 * This started as a chain of `if (parsed.x)` returns and grew a branch every
 * time a generator was added — a programme, a named station, an assessment
 * variant. As a list it stays honest about two things the chain hid: that
 * order is a decision (a named station beats a keyword match because it is
 * the more specific signal), and that every generator has to declare what it
 * sets `mode` to, which is what the HUD and the Escape handler read.
 *
 * `when` decides from the parse alone. `run` does the work. Adding a
 * generator is an entry here plus whatever it needs from the parser.
 */
const GENERATORS = [
  {
    id: "lesson",
    mode: "lesson",
    // A programme is not a scene: it renders as a plan the learner works
    // through, each station launching into the app that owns it.
    when: (p) => p.gameType === "lesson" && !!p.lesson,
    run: (p) => showLesson(p.lesson),
  },
  {
    id: "incident",
    mode: "training",
    // Checked before the plain station: an incident prompt names a station
    // too, and loading it as an ordinary visit would drop the report.
    when: (p) => p.gameType === "incident" && !!p.incident,
    run: (p) => enterIncident(p.incident),
  },
  {
    id: "crew-role",
    mode: "training",
    when: (p) => !!p.realSimId && !!p.crewRole,
    run: (p) => enterCrewRole(p.realSimId, p.crewRole),
  },
  {
    id: "real-station",
    mode: "training",
    when: (p) => !!p.realSimId,
    run: (p) => enterRealSim(p.realSimId, p.variantLevel),
  },
  {
    id: "generic-training",
    mode: "training",
    when: (p) => p.gameType === "training",
    run: (p) => enterGenericTraining(p.templateId, p.equipmentId),
  },
  {
    id: "minigolf",
    mode: "golf",
    // The fallback, so it matches anything that reached it.
    when: () => true,
    run: (p, { themeId, userPickedTheme }) => {
      course = buildCourse(findTheme(userPickedTheme ? themeId : p.themeId));
      holeIndex = 0;
      strokesLog = [];
      enterHole();
    },
  },
];

async function generate() {
  Sfx.ensure();
  const intro = store.get().intro;
  const parsed = await interpretPrompt(intro.promptText);
  store.patch("intro", { visible: false });
  const gen = GENERATORS.find((g) => g.when(parsed)) ?? GENERATORS[GENERATORS.length - 1];
  mode = gen.mode;
  await gen.run(parsed, intro);
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
// "hold" steps (several real SmartCiti.X stations use them — teach-run
// dry-runs, sustained comms checks) need the session told when the press
// actually starts and ends, not just a quick click on release; Holodeck's
// own generic procedures never happened to use this kind, so this path was
// never wired up until a real station exposed the gap.
function pressStart(id) {
  if (trainingSession?.step?.kind === "hold" && id === trainingSession.step.target) trainingSession.setHolding(true);
}
function pressEnd() {
  trainingSession?.setHolding(false);
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

// "drag" steps (blanking plates, shoring, a rigging shackle — five real
// SmartCiti.X stations use them) need a pick-up-and-carry gesture Holodeck
// never had: its own generic procedures only ever used click/turn, so this
// path, like "hold" above, was missing until a real station exposed the gap.
// It reuses the exact carry/socket-snap/spring-back logic SmartCiti.X and
// Trade Skills already ship, just against `hits`/`trainingSession` instead
// of their own state.
let trainingDragState = null; // { id, object, homeLocal, controller, plane }
const trainingReturning = []; // objects springing back to homeLocal after a missed drop
const _dragPlaneHit = new THREE.Vector3();
const _dragLocal = new THREE.Vector3();
const _dragM4 = new THREE.Matrix4();

function beginTrainingDrag(id, controller) {
  const obj = hits[id];
  if (!obj || !trainingSession?.canDrag(id)) return false;
  const worldPos = new THREE.Vector3();
  obj.getWorldPosition(worldPos);
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));
  plane.setFromNormalAndCoplanarPoint(plane.normal, worldPos);
  trainingDragState = { id, object: obj, homeLocal: obj.position.clone(), controller: controller ?? null, plane };
  return true;
}
function updateTrainingDrag() {
  if (!trainingDragState) return;
  const { object, plane, controller } = trainingDragState;
  let ok;
  if (controller) {
    _dragM4.identity().extractRotation(controller.matrixWorld);
    xrRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    xrRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(_dragM4);
    ok = xrRaycaster.ray.intersectPlane(plane, _dragPlaneHit);
  } else {
    raycaster.setFromCamera(pointerNdc, camera);
    ok = raycaster.ray.intersectPlane(plane, _dragPlaneHit);
  }
  if (!ok) return;
  _dragLocal.copy(_dragPlaneHit);
  object.parent.worldToLocal(_dragLocal);
  _dragLocal.y = trainingDragState.homeLocal.y; // carried along the ground, not lifted or dropped
  object.position.copy(_dragLocal);
}
function endTrainingDrag() {
  if (!trainingDragState) return;
  const { id, object, homeLocal } = trainingDragState;
  const step = trainingSession?.step;
  let result = null;
  if (step?.kind === "drag" && step.target === id) {
    const socket = hits[step.drag?.to];
    let dist = null;
    if (socket) {
      const a = new THREE.Vector3(); object.getWorldPosition(a); a.y = 0;
      const b = new THREE.Vector3(); socket.getWorldPosition(b); b.y = 0;
      dist = a.distanceTo(b);
    }
    result = trainingSession.dropAt(id, dist);
    if (result?.kind === "ok" && socket) {
      const snapped = new THREE.Vector3(); socket.getWorldPosition(snapped);
      object.parent.worldToLocal(snapped);
      object.position.copy(snapped);
      const socketQuat = new THREE.Quaternion(); socket.getWorldQuaternion(socketQuat);
      const parentQuat = new THREE.Quaternion(); object.parent.getWorldQuaternion(parentQuat);
      object.quaternion.copy(parentQuat.invert().multiply(socketQuat));
    }
  }
  if (result?.kind !== "ok") trainingReturning.push({ object, from: object.position.clone(), to: homeLocal.clone(), t: 0 });
  trainingDragState = null;
  syncTrainingHud();
}

function trainingPointerDown(e) {
  if (mode !== "training" || !trainingSession) return;
  updateNdc(e.clientX, e.clientY);
  const hit = castFromCameraObjects();
  if (hit && beginTrainingDrag(hit, null)) { trainingDownAt = performance.now(); return; }
  if (hit && beginTrainingTurn(hit, e.clientX)) { trainingDownAt = performance.now(); return; }
  trainingDownId = hit ?? null;
  trainingDownAt = performance.now();
  if (trainingDownId) pressStart(trainingDownId);
}
function trainingPointerMove(e) {
  if (mode !== "training") return;
  updateNdc(e.clientX, e.clientY);
  if (trainingDragState) return; // followed every frame in the render loop instead
  if (trainingTurnState) { updateTrainingTurn(e.clientX); return; }
  const hit = castFromCameraObjects();
  const step = trainingSession?.step;
  canvas.style.cursor = hit
    ? (hit === step?.target && (step?.kind === "turn" || step?.kind === "drag") ? "grab" : "pointer")
    : "default";
}
function trainingPointerUp(e) {
  if (mode !== "training") return;
  if (trainingDragState && !trainingDragState.controller) { endTrainingDrag(); return; }
  if (trainingTurnState) { endTrainingTurn(); return; }
  pressEnd();
  if (performance.now() - trainingDownAt < 280 && trainingDownId) {
    updateNdc(e.clientX, e.clientY);
    const hit = castFromCameraObjects();
    if (hit && hit === trainingDownId) activateTraining(hit);
  }
  trainingDownId = null;
}
function trainingPointerCancel() {
  if (trainingDragState && !trainingDragState.controller) endTrainingDrag();
  trainingTurnState = null;
  pressEnd();
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
function updateAimTo(cur) {
  if (!cur) return;
  const dx = dragAnchor.x - cur.x, dz = dragAnchor.z - cur.z;
  const dist = Math.hypot(dx, dz);
  const power = clamp(dist / MAX_DRAG, 0, 1);
  if (dist > 0.001) lastDir = { x: dx / dist, z: dz / dist };
  store.patch("hud", { powerPct: Math.round(power * 100) });
  updateAimVisual(power);
}
addEventListener("pointermove", (e) => {
  if (mode === "training") { trainingPointerMove(e); return; }
  if (!aiming) return;
  updateAimTo(raycastGround(e.clientX, e.clientY));
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

// --------------------------------------------------------------------- XR
//
// Same two gestures as desktop — point and click to select/putt, point and
// twist to turn a valve — just driven by a controller ray instead of the
// mouse. There is no locomotion to add: the desktop experience never moves
// the camera either, so a seated headset reaching out to the same fixed
// diorama is a natural fit, not a cut-down version of a bigger VR mode.

const xrRaycaster = new THREE.Raycaster();
xrRaycaster.far = 20;
const _xrM4 = new THREE.Matrix4();
let aimingController = null;

function controllerRay(controller) {
  _xrM4.identity().extractRotation(controller.matrixWorld);
  xrRaycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  xrRaycaster.ray.direction.set(0, 0, -1).applyMatrix4(_xrM4);
  return xrRaycaster;
}
function rayGroundHit(controller) {
  const hit = new THREE.Vector3();
  return controllerRay(controller).ray.intersectPlane(groundPlane, hit) ? hit : null;
}
function castFromController(controller) {
  return findHit(controllerRay(controller).intersectObjects(selectables, false));
}

const controllers = [];
for (let i = 0; i < 2; i++) {
  const c = renderer.xr.getController(i);
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }));
  c.add(line);
  c.addEventListener("selectstart", () => {
    if (mode === "golf") {
      if (!canPutt() || aimingController) return;
      dragAnchor = rayGroundHit(c);
      if (!dragAnchor) return;
      aimingController = c;
      aiming = true;
      store.patch("hud", { powerVisible: true, powerPct: 0 });
      return;
    }
    if (mode === "training") {
      const hit = castFromController(c);
      if (hit && beginTrainingDrag(hit, c)) return;
      if (hit && beginTrainingTurn(hit, 0)) { c.userData.turning = true; c.userData.lastRoll = c.rotation.z; trainingTurnState.controller = c; return; }
      c.userData.downId = hit ?? null;
      if (c.userData.downId) pressStart(c.userData.downId);
    }
  });
  c.addEventListener("selectend", () => {
    if (aimingController === c) { aimingController = null; endAim(true); return; }
    if (mode === "training") {
      if (trainingDragState?.controller === c) { endTrainingDrag(); return; }
      if (c.userData.turning) { c.userData.turning = false; endTrainingTurn(); return; }
      pressEnd();
      const hit = castFromController(c);
      if (hit && hit === c.userData.downId) activateTraining(hit);
      c.userData.downId = null;
    }
  });
  rig.add(c);
  controllers.push(c);
}

async function enterXR() {
  if (!navigator.xr) return;
  try {
    const session = await navigator.xr.requestSession("immersive-vr", { optionalFeatures: ["local-floor", "hand-tracking"] });
    await renderer.xr.setSession(session);
  } catch (err) {
    // err.message is browser/driver text, not ours — escape it before it
    // lands in an innerHTML sink.
    const detail = String(err?.message ?? err).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    store.patch("hud", { feedback: `<b>Could not start the VR session.</b> ${detail}` });
  }
}
async function generateInVR() {
  await generate();
  await enterXR();
}

if (navigator.xr?.isSessionSupported) {
  navigator.xr.isSessionSupported("immersive-vr").then((ok) => store.patch("intro", { xrSupported: ok }))
    .catch(() => store.patch("intro", { xrSupported: false }));
}

// --------------------------------------------------------------- frame loop

const clock = new THREE.Clock();
let elapsedTotal = 0;
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsedTotal += dt;
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
    trainingRefs.animate?.(elapsedTotal, dt, trainingSession);
    updateTrainingDrag();
    for (let i = trainingReturning.length - 1; i >= 0; i--) {
      const r = trainingReturning[i];
      r.t = Math.min(1, r.t + dt / 0.3);
      r.object.position.lerpVectors(r.from, r.to, easeOut(r.t));
      if (r.t >= 1) trainingReturning.splice(i, 1);
    }
  }
  if (renderer.xr.isPresenting) {
    if (aimingController) updateAimTo(rayGroundHit(aimingController));
    for (const c of controllers) {
      if (!c.userData.turning) continue;
      let delta = c.rotation.z - c.userData.lastRoll;
      c.userData.lastRoll = c.rotation.z;
      if (delta > Math.PI) delta -= Math.PI * 2;
      if (delta < -Math.PI) delta += Math.PI * 2;
      trainingSession?.rotate(trainingTurnState?.id, delta / (Math.PI * 2));
      syncTrainingHud();
    }
  }
  burst.update(dt);
  renderer.render(scene, camera);
});

mountUI(store, {
  setPromptText, toggleMic, selectTheme, generate, generateInVR,
  nextHole, playAgain, newPrompt,
  speechSupported, speakHint: () => { Sfx.ensure(); speak(currentHintLine()); },
});

// Test-only hook: precisely clicking a 3D object's exact screen position
// from an automated browser test is brittle, but the click/turn handlers
// just forward to trainingSession.select()/rotate() — the same calls this
// exposes directly, so a test can drive the real Session and verify the
// UI reacts correctly without needing to replicate the camera projection.
window.__holodeckTest = {
  select: (id) => trainingSession?.select(id),
  rotate: (id, delta) => trainingSession?.rotate(id, delta),
  press: (id) => pressStart(id),
  release: () => pressEnd(),
  getMode: () => mode,
  session: () => trainingSession,
};

// Keyboard parity with the sibling apps: Escape returns to the prompt screen
// (Holodeck's "hub"), M toggles sound — never while the learner is typing in
// the prompt box.
// Keyboard operation of a generated procedure, on the same shared helpers
// the other two apps use — a Holodeck procedure is the same Session with the
// same step kinds, so the same keys work. See WebXR/ACCESSIBILITY.md.
const kbCursor = createTargetCursor();
let kbActive = false, kbCarrying = null;
function targetsForStep(step) {
  if (!step) return [];
  const base = step.kind === "sequence" || step.kind === "find"
    ? [...(step.targets ?? [])]
    : step.target ? [step.target] : [];
  if (step.kind === "drag" && step.drag?.to) base.push(step.drag.to);
  return base.filter((id) => hits[id]);
}
function kbFocus(id, { announceIt = true } = {}) {
  if (!id) return;
  kbActive = true;
  kbCursor.focus(id);
  if (!announceIt) return;
  const step = trainingSession?.step;
  srAnnouncer.say(describeTarget(id, step, { names: { ...(step?.itemNames ?? {}) }, position: [kbCursor.index + 1, kbCursor.ids.length] }));
}
function kbStep(dir) {
  kbCursor.set(targetsForStep(trainingSession?.step));
  kbFocus(dir > 0 ? kbCursor.next() : kbCursor.prev());
}
function kbActivate() {
  const s = trainingSession, id = kbCursor.current;
  if (!s || !s.step || !id) return;
  if (s.step.kind === "drag") {
    if (!kbCarrying && id === s.step.target) { kbCarrying = id; srAnnouncer.say("Picked up. Tab to where it belongs, then press Enter to place it."); return; }
    if (kbCarrying) { s.dropAt(id, 0); kbCarrying = null; return; }
  }
  activateTraining(id);
}
function kbAdjust(delta) {
  const s = trainingSession, step = s?.step;
  if (!step) return false;
  if (step.kind === "gauge" && s.gauge) { s.gauge.t = Math.max(0, Math.min(1, s.gauge.t + delta * 0.04)); s.gauge.dir = 0; return true; }
  if (step.kind === "track" && s.track) { s.track.v = Math.max(0, Math.min(1, s.track.v + delta * 0.05)); return true; }
  if (step.kind === "turn") { s.rotate(step.target, delta * 0.08); return true; }
  return false;
}

addEventListener("keydown", (e) => {
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.code === "Escape" && !store.get().intro.visible) newPrompt();
  if (e.code === "KeyM") Sfx.muted = !Sfx.muted;
  // --- keyboard operation of the running procedure ---
  if (!trainingSession || renderer.xr.isPresenting) return;
  if (e.code === "Tab") { e.preventDefault(); kbStep(e.shiftKey ? -1 : 1); return; }
  if (e.code === "Enter" || e.code === "NumpadEnter") { e.preventDefault(); kbActivate(); return; }
  if (e.code === "Space") { e.preventDefault(); if (!e.repeat && kbCursor.current) pressStart(kbCursor.current); return; }
  if (e.code === "ArrowUp" || e.code === "ArrowDown") { if (kbAdjust(e.code === "ArrowUp" ? 1 : -1)) { e.preventDefault(); kbActive = true; } return; }
  if (e.code === "ArrowRight" || e.code === "ArrowLeft") { e.preventDefault(); kbStep(e.code === "ArrowRight" ? 1 : -1); }
});
addEventListener("keyup", (e) => {
  const tag = e.target?.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  if (e.code === "Space" && trainingSession) { e.preventDefault(); pressEnd(); }
});
