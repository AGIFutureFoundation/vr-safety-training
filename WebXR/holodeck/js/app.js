import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, signFace, particles, celebrationBurst, disposeTree, clamp,
} from "../../shared/kit.js";
import { Sfx } from "../../shared/game.js";
import { THEMES, findTheme, DEFAULT_THEME_ID } from "./themes.js";
import { localInterpreter, interpretPrompt } from "./prompt-parser.js";
import { BALL_RADIUS, buildCourse, createBall, putt, stepBall } from "./minigolf.js";
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
  hud: { visible: false, holeName: "", holeSub: "", strokes: 0, par: 0, feedback: "", powerVisible: false, powerPct: 0 },
  intro: {
    visible: true, promptText: "", listening: false, speechSupported,
    error: "", heard: "", themeId: DEFAULT_THEME_ID, userPickedTheme: false,
  },
  holeResult: { visible: false, stars: "", title: "", note: "", isLast: false },
  final: { visible: false, rows: [], totalPar: 0, totalStrokes: 0, summary: "" },
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
    visible: true,
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
  store.patch("final", { visible: false });
  holeIndex = 0;
  strokesLog = [];
  enterHole();
}

function newPrompt() {
  store.patch("final", { visible: false });
  store.patch("hud", { visible: false });
  clearHole();
  scene.background = null;
  scene.fog = null;
  store.patch("intro", { visible: true });
}

async function generate() {
  Sfx.ensure();
  const { promptText, themeId, userPickedTheme } = store.get().intro;
  const parsed = await interpretPrompt(promptText);
  const finalThemeId = userPickedTheme ? themeId : parsed.themeId;
  course = buildCourse(findTheme(finalThemeId));
  holeIndex = 0;
  strokesLog = [];
  store.patch("intro", { visible: false });
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
  return hole && ballState && !ballState.sunk && !ballMoving &&
    !store.get().intro.visible && !store.get().holeResult.visible && !store.get().final.visible;
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
  if (!canPutt()) return;
  dragAnchor = raycastGround(e.clientX, e.clientY);
  if (!dragAnchor) return;
  aiming = true;
  store.patch("hud", { powerVisible: true, powerPct: 0 });
});
addEventListener("pointermove", (e) => {
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
addEventListener("pointerup", () => endAim(true));
addEventListener("pointercancel", () => endAim(false));

// --------------------------------------------------------------- frame loop

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (ballMoving && ballState) {
    const { moving, sunk } = stepBall(ballState, hole, dt);
    ballMesh.position.set(ballState.x, BALL_RADIUS, ballState.z);
    if (!moving) {
      ballMoving = false;
      if (sunk) handleSunk();
      else store.patch("hud", { feedback: "Drag back from the ball, then release to putt." });
    }
  }
  burst.update(dt);
  renderer.render(scene, camera);
});

mountUI(store, {
  setPromptText, toggleMic, selectTheme, generate,
  nextHole, playAgain, newPrompt,
});
