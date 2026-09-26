import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor } from "../../shared/input.js";
import { RACE_TRACKS, rcTrackDef } from "./tracks.js";
import { rcCompileTrack } from "./track.js";
import {
  RC_VEHICLES, RC_CLASSES, RC_ITEMS, RC_POINTS, rcCreateRace, rcStep, rcStandings, rcRacePoints,
  rcLoadSave, rcStoreSave, rcClassUnlocked, rcApplyGrandPrix, rcGhostDecode, rcGhostAt, rcOfferGhost,
  rcSnapshot, rcApplySnapshot,
} from "./sim.js";
import { rcBuildWorld, rcEnvironment, rcBuildVehicle, RC_PLAYER_COLOURS } from "./world.js";
import { rcCreateAudio } from "./audio.js";
import { rcOpenLink } from "./net.js";
import { liveryList } from "./liveries.js";
import { hardHatsFound } from "../../shared/eggs.js";
import { TrainingRecords } from "../../shared/records.js";

// Night Highway Circuit — the app: menus, input, split-screen cameras, HUD,
// Grand Prix, time trial and the two-tab link. The game itself is sim.js;
// the scenery is world.js. Local multiplayer only: up to four players on one
// machine (a keyboard cluster or a gamepad each), or two tabs of one browser
// over BroadcastChannel. There is no server.

const RC_Q = new URLSearchParams(location.search);
const rcStore = (() => { try { return window.localStorage; } catch (e) { return null; } })();
let rcSave = rcLoadSave(rcStore);
const rcAudio = rcCreateAudio();
const $ = (id) => document.getElementById(id);

/** The four keyboard clusters. Codes, so a non-US layout keeps its shape. */
const RC_KEYSETS = [
  { label: "WASD", up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD", drift: "Space", item: "KeyF", look: "KeyR", sigL: "KeyQ", sigR: "KeyE" },
  { label: "Arrows", up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", drift: "ShiftRight", item: "Enter", look: "Slash", sigL: "Comma", sigR: "Period" },
  { label: "IJKL", up: "KeyI", down: "KeyK", left: "KeyJ", right: "KeyL", drift: "KeyH", item: "KeyY", look: "KeyN", sigL: "KeyU", sigR: "KeyO" },
  { label: "Numpad", up: "Numpad8", down: "Numpad5", left: "Numpad4", right: "Numpad6", drift: "Numpad0", item: "NumpadEnter", look: "NumpadDecimal", sigL: "Numpad7", sigR: "Numpad9" },
];
const RC_GAME_KEYS = new Set(RC_KEYSETS.flatMap((k) => [k.up, k.down, k.left, k.right, k.drift, k.item, k.look, k.sigL, k.sigR]));
const RC_PRETTY = { Space: "Space", ShiftRight: "R-Shift", Enter: "Enter", Slash: "/", Comma: ",", Period: ".", NumpadEnter: "Num Enter", NumpadDecimal: "Num .", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" };
const rcKeyName = (c) => RC_PRETTY[c] ?? c.replace(/^Key/, "").replace(/^Numpad/, "Num ");

// Item glyphs, drawn for this game.
const RC_ICONS = {
  cones: `<svg viewBox="0 0 48 48"><path d="M24 5 L35 40 H13 Z" fill="#f06a1c"/><path d="M19.5 20 H28.5 L30 25 H18 Z M17 29 H31 L32.3 33 H15.7 Z" fill="#f4f6f8"/><rect x="9" y="40" width="30" height="4" rx="1" fill="#2b2f36"/></svg>`,
  paint: `<svg viewBox="0 0 48 48"><path d="M8 34 C8 26 18 24 24 26 C31 28 40 26 40 33 C40 40 30 42 24 41 C16 40 8 41 8 34 Z" fill="#f4f6f0"/><path d="M12 33 H36" stroke="#f2c230" stroke-width="4"/><path d="M26 8 C26 14 21 16 21 21 A5 5 0 0 0 31 21 C31 16 26 14 26 8 Z" fill="#f4f6f0"/></svg>`,
  hardhat: `<svg viewBox="0 0 48 48"><path d="M9 32 C9 20 16 12 24 12 C32 12 39 20 39 32 Z" fill="#f2c230"/><rect x="5" y="31" width="38" height="5" rx="2" fill="#e0a81e"/><rect x="21" y="12" width="6" height="19" rx="2" fill="#ffd862"/></svg>`,
  horn: `<svg viewBox="0 0 48 48"><path d="M8 20 H16 L32 10 V38 L16 28 H8 Z" fill="#dfe6ee"/><rect x="6" y="19" width="6" height="10" rx="1" fill="#e8742a"/><path d="M36 16 Q41 24 36 32 M40 12 Q47 24 40 36" stroke="#ffc93c" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  tow: `<svg viewBox="0 0 48 48"><path d="M6 24 H30" stroke="#ffb020" stroke-width="6" stroke-linecap="round"/><path d="M30 24 C38 24 40 16 34 14 C30 13 29 18 32 19" stroke="#c9d1da" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="4" y="18" width="8" height="12" rx="2" fill="#6b7280"/></svg>`,
  flatbed: `<svg viewBox="0 0 48 48"><rect x="14" y="22" width="28" height="5" fill="#dfe6ee"/><path d="M30 14 H40 L44 22 H30 Z" fill="#4fd1ff"/><circle cx="20" cy="31" r="4" fill="#20242b"/><circle cx="37" cy="31" r="4" fill="#20242b"/><path d="M2 16 H12 M4 22 H11 M2 28 H10" stroke="#ffc93c" stroke-width="3" stroke-linecap="round"/></svg>`,
};

const rcTrackCache = new Map();
function rcTrack(id) {
  if (!rcTrackCache.has(id)) rcTrackCache.set(id, rcCompileTrack(rcTrackDef(id)));
  return rcTrackCache.get(id);
}
const rcOrd = (n) => `${n}<small>${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}</small>`;
const rcOrdText = (n) => `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;
const rcTime = (t) => (t == null || !Number.isFinite(t) ? "—" : `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`);
const rcCss = (n) => `#${(n >>> 0).toString(16).padStart(6, "0")}`;

// ------------------------------------------------------------------ renderer

const rcRenderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
rcRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
rcRenderer.setSize(window.innerWidth, window.innerHeight);
rcRenderer.outputColorSpace = THREE.SRGBColorSpace;
rcRenderer.toneMapping = THREE.ACESFilmicToneMapping;
$("stage").appendChild(rcRenderer.domElement);

const app = {
  screen: "menu", mode: "race", cls: RC_Q.get("class") ?? rcSave.settings.cls ?? "apprentice",
  trackId: RC_Q.get("track") ?? rcSave.settings.track ?? RACE_TRACKS[0].id,
  nPlayers: 1, players: [0, 1, 2, 3].map((i) => ({ vehicle: rcSave.settings.vehicles?.[i] ?? RC_VEHICLES[i].id })),
  scene: null, world: null, race: null, views: [], gp: null, tt: null, net: null, paused: false,
  timeScale: Math.max(0.1, Math.min(40, Number(RC_Q.get("fast")) || 1)), demo: 0, acc: 0, backdrop: false, showroom: null,
  msgs: [], lastEvents: [], history: [],
};
if (!rcClassUnlocked(rcSave, app.cls)) app.cls = "apprentice";

function rcDisposeScene() {
  if (!app.scene) return;
  app.scene.traverse((o) => { if (o.geometry?.dispose) o.geometry.dispose(); });
  app.scene = null; app.world = null;
}

function rcLoadWorld(race) {
  rcDisposeScene();
  const scene = new THREE.Scene();
  const root = new THREE.Group();
  scene.add(root);
  const env = rcEnvironment(root, race.track.def);
  scene.fog = env.fog ? new THREE.Fog(env.fog.colour, env.fog.near, env.fog.far) : null;
  scene.background = env.background;
  rcRenderer.toneMappingExposure = env.exposure;
  app.world = rcBuildWorld(root, race);
  app.scene = scene;
  app.root = root;
}

// ------------------------------------------------------------------ input

const rcKeys = new Set();
const rcPressed = new Set();
window.addEventListener("keydown", (e) => {
  if (e.repeat && rcKeys.has(e.code)) { if (app.screen === "race" && RC_GAME_KEYS.has(e.code)) e.preventDefault(); return; }
  rcKeys.add(e.code);
  rcPressed.add(e.code);
  rcAudio.resume();
  if (app.screen === "race") {
    if (RC_GAME_KEYS.has(e.code)) e.preventDefault();
    if (e.code === "Escape" || e.code === "KeyP") rcTogglePause();
    if (e.code === "KeyM") { rcAudio.setMuted(!rcAudio.muted); rcToast(rcAudio.muted ? "Sound off" : "Sound on"); }
  } else if (app.screen === "pause") {
    if (e.code === "Escape" || e.code === "KeyP") rcTogglePause();
  } else if (app.screen === "garage") {
    rcGarageKey(e.code);
  } else if (e.code === "Escape") {
    document.querySelector(".screen:not([hidden]) [data-back]")?.click();
  }
});
window.addEventListener("keyup", (e) => { rcKeys.delete(e.code); });
window.addEventListener("blur", () => rcKeys.clear());
window.addEventListener("pointerdown", () => rcAudio.resume(), { passive: true });

const rcPads = [0, 1, 2, 3].map((i) => createGamepad({
  getGamepads: () => {
    const all = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = all?.[i];
    return p ? [p] : [];
  },
  bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) rcToast(`Gamepad ${i + 1} connected (${detectPadVendor(info.id)} labels).`); },
}));
const rcPadState = [0, 1, 2, 3].map(() => ({ prev: {}, snap: null }));

function rcPollPads(dt) {
  rcPads.forEach((p, i) => {
    const st = rcPadState[i];
    st.snap = p.poll(dt);
    const b = st.snap?.buttons ?? [];
    st.edge = {};
    for (const k of [0, 1, 2, 4, 5, 9, 12, 13, 14, 15]) {
      const now = !!b[k]?.pressed;
      st.edge[k] = now && !st.prev[k];
      st.prev[k] = now;
    }
  });
}

/** One player's controls this frame, from their key cluster and their gamepad. */
function rcReadPlayer(i, n) {
  const sets = n === 1 ? [RC_KEYSETS[0], RC_KEYSETS[1]] : [RC_KEYSETS[i]];
  const inp = { steer: 0, throttle: 0, brake: 0, drift: false, item: false, lookback: false, signal: 0 };
  for (const k of sets) {
    if (rcKeys.has(k.left)) inp.steer += 1;
    if (rcKeys.has(k.right)) inp.steer -= 1;
    if (rcKeys.has(k.up)) inp.throttle = 1;
    if (rcKeys.has(k.down)) inp.brake = 1;
    if (rcKeys.has(k.drift)) inp.drift = true;
    if (rcKeys.has(k.look)) inp.lookback = true;
    if (rcPressed.has(k.item)) inp.item = true;
    if (rcPressed.has(k.sigL)) inp.signal = 1;
    if (rcPressed.has(k.sigR)) inp.signal = -1;
  }
  const st = rcPadState[i];
  const s = st?.snap;
  if (s?.connected) {
    const ax = s.axes?.[0]?.value ?? 0;
    if (Math.abs(ax) > GAMEPAD_DEADZONE) inp.steer -= ax;
    const bv = (k) => s.buttons?.[k]?.value ?? 0;
    inp.throttle = Math.max(inp.throttle, bv(7), bv(0) > 0.5 ? 1 : 0);
    inp.brake = Math.max(inp.brake, bv(6), bv(1) > 0.5 ? 1 : 0);
    if (bv(5) > 0.5) inp.drift = true;
    if (bv(4) > 0.5) inp.lookback = true;
    if (st.edge?.[2]) inp.item = true;
    if (st.edge?.[14]) inp.signal = 1;
    if (st.edge?.[15]) inp.signal = -1;
    if (st.edge?.[9] && app.screen === "race") rcTogglePause();
  }
  inp.steer = Math.max(-1, Math.min(1, inp.steer));
  return inp;
}

// ------------------------------------------------------------------ screens

const RC_SCREENS = ["menu", "class", "track", "garage", "net", "help", "results", "pause"];
function rcShow(name) {
  app.screen = name;
  for (const s of RC_SCREENS) $(`scr-${s}`).hidden = s !== name;
  const inRace = name === "race" || name === "pause";
  $("huds").hidden = !inRace;
  $("minimap").hidden = !inRace;
  $("brand").hidden = inRace;
  if (name === "class") rcRenderClasses();
  if (name === "track") rcRenderTracks();
  if (name === "garage") rcRenderGarage();
  if (name === "help") rcRenderHelp();
  if (name === "net") rcRenderNet();
  const first = $(`scr-${name}`)?.querySelector("button:not([disabled]), a");
  if (first && name !== "race") setTimeout(() => first.focus({ preventScroll: true }), 30);
  rcAudio.play("select");
}

let rcToastT = null;
function rcToast(text, ms = 2600) {
  const t = $("toast");
  t.textContent = text; t.classList.add("on");
  clearTimeout(rcToastT);
  rcToastT = setTimeout(() => t.classList.remove("on"), ms);
}

const rcFlow = () => (app.mode === "gp" ? ["class", "garage"] : app.mode === "tt" ? ["class", "track", "garage"] : ["class", "track", "garage"]);

document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => {
  const go = b.dataset.go;
  rcAudio.resume();
  if (go === "help") return rcShow("help");
  if (go === "net") { app.mode = "net"; return rcShow("net"); }
  app.mode = go;
  if (go === "tt" || go === "net") app.nPlayers = 1;
  rcShow("class");
}));
document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => {
  const flow = rcFlow();
  const i = flow.indexOf(app.screen);
  rcShow(i > 0 ? flow[i - 1] : "menu");
}));
$("btn-music").addEventListener("click", () => {
  rcSave.settings.music = !rcSave.settings.music;
  rcStoreSave(rcStore, rcSave);
  rcAudio.resume();
  rcAudio.music(rcSave.settings.music);
  $("btn-music").textContent = `Music: ${rcSave.settings.music ? "on" : "off"}`;
  $("btn-music").setAttribute("aria-pressed", String(rcSave.settings.music));
});
$("btn-music").textContent = `Music: ${rcSave.settings.music ? "on" : "off"}`;
$("btn-watch").addEventListener("click", () => rcStartDemo(1));
{
  const p = location.pathname;
  $("btn-home").href = /\/race\/dist\//.test(p) ? "../../index.html" : /\/race\//.test(p) ? "../index.html" : "./index.html";
}

function rcRenderClasses() {
  $("class-step").textContent = app.mode === "gp" ? "Grand Prix · step 1 of 2" : app.mode === "tt" ? "Time trial · step 1 of 3" : "Single race · step 1 of 3";
  const list = $("class-list");
  list.textContent = "";
  for (const c of RC_CLASSES) {
    const open = rcClassUnlocked(rcSave, c.id);
    const b = document.createElement("button");
    b.className = `pick${app.cls === c.id ? " on" : ""}`;
    b.setAttribute("aria-disabled", String(!open));
    b.setAttribute("aria-pressed", String(app.cls === c.id));
    const best = rcSave.gp[c.id]?.best;
    b.innerHTML = `<b></b><span class="d"></span><span class="m"></span>${open ? "" : '<span class="lock">LOCKED</span>'}`;
    b.querySelector("b").textContent = `${c.name} class`;
    b.querySelector(".d").textContent = c.blurb;
    b.querySelector(".m").textContent = `Speed ×${c.speedMul.toFixed(2)} · AI skill ${Math.round(c.aiSkill * 100)} · traffic ×${c.traffic.toFixed(1)}${best ? ` · best Grand Prix ${rcOrdText(best)}` : ""}`;
    b.addEventListener("click", () => {
      if (!open) { rcToast(`${c.name} class is locked. ${c.blurb.split(". ").slice(1).join(". ")}`); return; }
      app.cls = c.id; rcRenderClasses(); rcAudio.play("select");
    });
    list.append(b);
  }
  $("class-note").textContent = `Unlock ladder: Apprentice is open from the start; a top-three Grand Prix finish opens the next class. Unlocked here: ${rcSave.unlocked.map((id) => RC_CLASSES.find((c) => c.id === id)?.name).join(", ")}.`;
}
$("class-next").addEventListener("click", () => rcShow(app.mode === "gp" ? "garage" : "track"));

function rcDrawTrackPreview(canvas, tr) {
  const g = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  g.fillStyle = "#070b14"; g.fillRect(0, 0, W, H);
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < tr.n; i++) { x0 = Math.min(x0, tr.x[i]); x1 = Math.max(x1, tr.x[i]); z0 = Math.min(z0, tr.z[i]); z1 = Math.max(z1, tr.z[i]); }
  const sc = Math.min((W - 24) / (x1 - x0), (H - 24) / (z1 - z0));
  const ox = (W - (x1 - x0) * sc) / 2, oz = (H - (z1 - z0) * sc) / 2;
  const P = (i) => [ox + (tr.x[i] - x0) * sc, H - (oz + (tr.z[i] - z0) * sc)];
  let ymin = Infinity, ymax = -Infinity;
  for (let i = 0; i < tr.n; i++) { ymin = Math.min(ymin, tr.y[i]); ymax = Math.max(ymax, tr.y[i]); }
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = "#1c2940"; g.lineWidth = 9;
  g.beginPath(); for (let i = 0; i <= tr.n; i++) { const [x, y] = P(i % tr.n); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  // Draw low first, high last, so an overpass reads as over.
  const order = [...Array(tr.n).keys()].sort((a, b) => tr.y[a] - tr.y[b]);
  g.lineWidth = 4;
  for (const i of order) {
    const f = ymax > ymin ? (tr.y[i] - ymin) / (ymax - ymin) : 0;
    g.strokeStyle = `rgb(${Math.round(255 * (0.4 + 0.6 * f))},${Math.round(190 - 60 * f)},${Math.round(80 + 40 * (1 - f))})`;
    const [ax, ay] = P(i), [bx, by] = P((i + 1) % tr.n);
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  }
  const [sx, sy] = P(0);
  g.fillStyle = "#fff"; g.fillRect(sx - 4, sy - 4, 8, 8);
}

function rcRenderTracks() {
  $("track-step").textContent = app.mode === "tt" ? "Time trial · step 2 of 3" : "Single race · step 2 of 3";
  const list = $("track-list");
  list.textContent = "";
  for (const def of RACE_TRACKS) {
    const tr = rcTrack(def.id);
    const b = document.createElement("button");
    b.className = `pick${app.trackId === def.id ? " on" : ""}`;
    b.setAttribute("aria-pressed", String(app.trackId === def.id));
    const cv = document.createElement("canvas");
    cv.width = 320; cv.height = 180;
    rcDrawTrackPreview(cv, tr);
    const best = rcSave.tt[`${def.id}|${app.cls}`]?.best;
    b.append(cv);
    const t = document.createElement("b"); t.textContent = def.name;
    const d = document.createElement("span"); d.textContent = def.blurb;
    const m = document.createElement("span"); m.textContent = `${(tr.L / 1000).toFixed(2)} km lap · 3 laps${best ? ` · best lap ${rcTime(best)}` : ""}`;
    b.append(t, d, m);
    b.addEventListener("click", () => { app.trackId = def.id; rcRenderTracks(); rcBackdrop(def.id); });
    list.append(b);
  }
}
$("track-next").addEventListener("click", () => rcShow("garage"));

function rcRenderGarage() {
  const tt = app.mode === "tt", net = app.mode === "net";
  $("garage-step").textContent = app.mode === "gp" ? "Grand Prix · step 2 of 2" : tt ? "Time trial · step 3 of 3" : "Single race · step 3 of 3";
  const seg = $("pcount");
  seg.textContent = "";
  $("count-row").hidden = tt || net;
  for (let n = 1; n <= 4; n++) {
    const b = document.createElement("button");
    b.textContent = `${n}`; b.className = n === app.nPlayers ? "on" : "";
    b.setAttribute("aria-label", `${n} player${n > 1 ? "s" : ""}`);
    b.addEventListener("click", () => { app.nPlayers = n; rcRenderGarage(); });
    seg.append(b);
  }
  const cards = $("player-cards");
  cards.textContent = "";
  const n = tt || net ? 1 : app.nPlayers;
  for (let i = 0; i < n; i++) {
    const v = RC_VEHICLES.find((x) => x.id === app.players[i].vehicle) ?? RC_VEHICLES[i];
    const c = document.createElement("div");
    c.className = "pcard";
    c.style.setProperty("--pc", rcCss(RC_PLAYER_COLOURS[i]));
    const ks = n === 1 ? [RC_KEYSETS[0], RC_KEYSETS[1]] : [RC_KEYSETS[i]];
    c.innerHTML = `<div class="who">Player ${i + 1}</div>
      <div class="veh"><button class="btn arrow" data-d="-1" aria-label="Previous vehicle">◀</button><b></b><button class="btn arrow" data-d="1" aria-label="Next vehicle">▶</button></div>
      <div class="desc" style="font-size:12.5px;color:var(--muted);min-height:34px"></div>
      ${["speed", "handling", "weight"].map((k) => `<div class="stat"><span>${k}</span><div class="bar"><i style="width:${v.stats[k] * 20}%"></i></div></div>`).join("")}
      <div class="keys"></div>`;
    c.querySelector("b").textContent = v.name;
    c.querySelector(".desc").textContent = v.blurb;
    c.querySelector(".keys").textContent = `${ks.map((k) => k.label).join(" or ")} · or gamepad ${i + 1}`;
    c.querySelectorAll("[data-d]").forEach((btn) => btn.addEventListener("click", () => rcCycleVehicle(i, Number(btn.dataset.d))));
    cards.append(c);
  }
  rcRenderLiveries();
  rcShowroom();
}

/** Every livery, unlocked or not — see WebXR/race/js/liveries.js. */
function rcLiveries() {
  return liveryList(TrainingRecords.list(), hardHatsFound(rcStore).length);
}

/** Player 1's chosen livery, if any and if it is still unlocked. */
function rcActiveLivery() {
  const id = rcSave.settings.livery;
  if (!id) return null;
  const l = rcLiveries().find((x) => x.id === id);
  return l && l.unlocked ? l : null;
}

function rcRenderLiveries() {
  const list = $("livery-list");
  if (!list) return;
  list.textContent = "";
  const active = rcSave.settings.livery;
  for (const l of rcLiveries()) {
    const b = document.createElement("button");
    b.className = `pick${active === l.id && l.unlocked ? " on" : ""}`;
    b.setAttribute("aria-disabled", String(!l.unlocked));
    b.setAttribute("aria-pressed", String(active === l.id && l.unlocked));
    b.style.setProperty("--tint", rcCss(l.colour));
    b.innerHTML = `<b></b><span></span>${l.unlocked ? "" : '<span class="lock">LOCKED</span>'}`;
    b.querySelector("b").textContent = l.name;
    b.querySelector("span").textContent = l.unlocked ? "Tap to wear it on the grid." : l.note;
    b.addEventListener("click", () => {
      if (!l.unlocked) { rcToast(`${l.name} is locked. ${l.note}.`); return; }
      rcSave.settings.livery = active === l.id ? null : l.id;
      rcStoreSave(rcStore, rcSave);
      rcAudio.play("select");
      rcRenderLiveries();
      rcShowroom();
    });
    list.append(b);
  }
}

function rcCycleVehicle(i, d) {
  const idx = RC_VEHICLES.findIndex((v) => v.id === app.players[i].vehicle);
  app.players[i].vehicle = RC_VEHICLES[(idx + d + RC_VEHICLES.length) % RC_VEHICLES.length].id;
  rcAudio.play("select");
  rcRenderGarage();
}

function rcGarageKey(code) {
  const n = app.mode === "tt" || app.mode === "net" ? 1 : app.nPlayers;
  for (let i = 0; i < n; i++) {
    const sets = n === 1 ? [RC_KEYSETS[0]] : [RC_KEYSETS[i]];
    for (const k of sets) {
      if (code === k.left) rcCycleVehicle(i, -1);
      if (code === k.right) rcCycleVehicle(i, 1);
    }
  }
  if (code === "Escape") document.querySelector("#scr-garage [data-back]").click();
}

$("garage-go").addEventListener("click", () => {
  rcSave.settings.vehicles = app.players.map((p) => p.vehicle);
  rcSave.settings.cls = app.cls; rcSave.settings.track = app.trackId;
  rcStoreSave(rcStore, rcSave);
  if (app.mode === "gp") rcStartGrandPrix();
  else if (app.mode === "tt") rcStartRace({ trackId: app.trackId, mode: "tt", humans: 1 });
  else rcStartRace({ trackId: app.trackId, mode: "race", humans: app.nPlayers });
});

function rcRenderHelp() {
  const grid = $("help-grid");
  const rows = RC_KEYSETS.map((k, i) => `<div><h3>Player ${i + 1} · ${k.label}</h3>
    Drive <span class="kbd">${rcKeyName(k.up)}</span> <span class="kbd">${rcKeyName(k.left)}</span> <span class="kbd">${rcKeyName(k.down)}</span> <span class="kbd">${rcKeyName(k.right)}</span><br>
    Drift (hold while steering, release to boost) <span class="kbd">${rcKeyName(k.drift)}</span><br>
    Use item <span class="kbd">${rcKeyName(k.item)}</span> · Mirrors (look back) <span class="kbd">${rcKeyName(k.look)}</span><br>
    Signal left / right <span class="kbd">${rcKeyName(k.sigL)}</span> <span class="kbd">${rcKeyName(k.sigR)}</span></div>`).join("");
  grid.innerHTML = `${rows}
    <div><h3>Gamepad (any standard pad)</h3>Steer with the left stick · accelerate with RT or A · brake and reverse with LT or B · drift RB · item X · mirrors LB · signal with the D-pad left and right · Start pauses. Pad 1 is player 1, pad 2 player 2, and so on.<br>One player alone can use WASD or the arrows.</div>
    <div><h3>The safety bonus</h3>Signal, check your mirrors, then change lanes: a lane change of a full lane within a few seconds of the signal earns a small boost, and a bigger one if you looked in your mirrors first. The AI drivers do it too. Esc pauses, M mutes.</div>
    <div><h3>Items</h3>${RC_ITEMS.map((it) => `<div class="item-row">${RC_ICONS[it.id]}<span><b style="color:var(--text)">${it.name}.</b> ${it.blurb}</span></div>`).join("")}</div>
    <div><h3>On the course</h3>Blue chevron pads boost you. Striped supply crates hold an item. Civilian traffic, crossing straddle carriers and haul trucks, work zones, toll booths and wet concrete are hazards. Get stuck for a few seconds and roadside assist puts you back on the line.</div>`;
}

function rcRenderNet() {
  const cls = RC_CLASSES.find((c) => c.id === app.cls);
  const v = RC_VEHICLES.find((x) => x.id === app.players[0].vehicle);
  $("net-sel").textContent = `Class: ${cls.name} · course: ${rcTrackDef(app.trackId).name} · your vehicle: ${v.name}. Change them from Single race first if you like.`;
}

// ------------------------------------------------------------------ race

function rcLayout(n) {
  const W = window.innerWidth, H = window.innerHeight;
  if (n <= 1) return [[0, 0, W, H]];
  if (n === 2) return [[0, 0, W, Math.floor(H / 2) - 1], [0, Math.ceil(H / 2) + 1, W, Math.floor(H / 2) - 1]];
  const w = Math.floor(W / 2) - 1, h = Math.floor(H / 2) - 1;
  return [[0, 0, w, h], [W - w, 0, w, h], [0, H - h, w, h], [W - w, H - h, w, h]];
}

function rcMakeViews(followIds, playerIdx) {
  const huds = $("huds");
  huds.textContent = "";
  const rects = rcLayout(followIds.length);
  app.views = followIds.map((rid, k) => {
    const cam = new THREE.PerspectiveCamera(68, 1, 0.3, 2400);
    const el = document.createElement("div");
    const n = followIds.length;
    el.className = `hud${n > 1 ? " small" : ""}${n >= 3 ? (k % 2 ? " col-r" : " col-l") : ""}`;
    el.innerHTML = `<div class="pos"></div><div class="tag-p"></div><div class="lap"></div><div class="delta"></div><div class="item empty"></div><div class="item-name"></div>
      <div class="speed"></div><div class="msg"></div><div class="sig l">◀</div><div class="sig r">▶</div><div class="rear" hidden>Mirrors · rear view</div>`;
    huds.append(el);
    const pi = playerIdx?.[k] ?? k;
    el.querySelector(".tag-p").textContent = app.demo ? `AI · CAM ${k + 1}` : `Player ${pi + 1}`;
    el.querySelector(".tag-p").style.color = rcCss(RC_PLAYER_COLOURS[pi] ?? 0xffffff);
    return { racer: rid, player: pi, cam, camPos: null, camH: 0, el, msg: { text: "", until: 0, cls: "" }, rect: rects[k] };
  });
  if (followIds.length === 3) {
    const cam = new THREE.PerspectiveCamera(55, 1, 1, 4000);
    app.overview = { cam, rect: rects[3] };
  } else app.overview = null;
  rcPlaceHuds();
}

function rcPlaceHuds() {
  const rects = rcLayout(app.views.length);
  app.views.forEach((v, k) => {
    v.rect = rects[k];
    const [x, y, w, h] = v.rect;
    Object.assign(v.el.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
  });
  if (app.overview) app.overview.rect = rects[3];
  const mm = $("minimap");
  const n = app.views.length, W = window.innerWidth, H = window.innerHeight;
  const size = n === 1 ? Math.min(210, Math.round(Math.min(W, H) * 0.3)) : n === 2 ? 150 : n === 3 ? Math.min(240, Math.round(Math.min(W, H) * 0.4)) : 150;
  mm.style.width = mm.style.height = `${size}px`;
  if (n === 1) { mm.style.left = `${W - size - 14}px`; mm.style.top = `${Math.min(110, H * 0.16)}px`; }
  else if (n === 2) { mm.style.left = `${W / 2 - size / 2}px`; mm.style.top = `${H / 2 - size / 2}px`; }
  else if (n === 3) { mm.style.left = `${W * 0.75 - size / 2}px`; mm.style.top = `${H * 0.75 - size / 2}px`; }
  else { mm.style.left = `${W / 2 - size / 2}px`; mm.style.top = `${H / 2 - size / 2}px`; }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  mm.width = mm.height = Math.round(size * dpr);
  app.mmScale = null;
}

function rcSeed() { return Number(RC_Q.get("seed")) || ((Date.now() / 1000) | 0) % 100000; }

/**
 * Start a race. `humans` local players (split-screen), or `demo` AI-only
 * views, or a Grand Prix round with a fixed driver list, or a two-tab race.
 */
function rcStartRace({ trackId, mode = "race", humans = 1, demo = 0, drivers = null, seed = null, remote = null, joinAs = null }) {
  const tr = rcTrack(trackId);
  const cls = RC_CLASSES.find((c) => c.id === app.cls) ?? RC_CLASSES[0];
  let racers;
  if (drivers) racers = drivers;
  else if (demo) racers = [];
  else racers = app.players.slice(0, humans).map((p, i) => ({ vehicle: p.vehicle, human: true, player: i, name: humans > 1 ? `P${i + 1}` : "You", eggLivery: i === 0 ? rcActiveLivery() : null }));
  if (remote) racers.push(remote);
  app.demo = demo;
  const race = rcCreateRace({
    track: tr, cls, laps: 3, racers, mode: mode === "tt" ? "timetrial" : demo ? "demo" : "race",
    seed: seed ?? rcSeed(), traffic: mode !== "tt",
  });
  app.race = race;
  app.raceMode = mode;
  app.backdrop = false;
  app.acc = 0;
  app.paused = false;
  rcLoadWorld(race);
  let follow, pidx;
  if (joinAs != null) { follow = [joinAs]; pidx = [1]; }
  else if (demo) { follow = race.racers.slice(0, demo).map((r) => r.id); pidx = follow.map((_, k) => k); }
  else {
    const local = race.racers.filter((r) => r.human && !r.remote);
    follow = local.map((r) => r.id); pidx = local.map((r) => r.player);
  }
  rcMakeViews(follow, pidx);
  app.tt = null;
  if (mode === "tt") {
    const key = `${trackId}|${app.cls}`;
    const ghost = rcGhostDecode(rcSave.tt[key]?.ghost);
    app.tt = { key, ghost, best: rcSave.tt[key]?.best ?? null, buf: [], lastCross: 0, sampleT: 0, lastLap: null, newBest: false };
    if (ghost.length) app.world.setGhost(race.racers[0].vehicle);
  }
  rcShow("race");
  rcAudio.resume();
  if (rcSave.settings.music) rcAudio.music(true);
  window.__race.started = (window.__race.started ?? 0) + 1;
  return race;
}

function rcStartDemo(n = 1) {
  app.mode = "demo";
  return rcStartRace({ trackId: app.trackId, mode: "demo", demo: Math.max(1, Math.min(4, n)) });
}

function rcTogglePause() {
  if (!app.race || app.net) return;
  app.paused = !app.paused;
  if (app.paused) { rcShow("pause"); rcAudio.stopEngines(); }
  else rcShow("race");
}
$("pause-resume").addEventListener("click", () => rcTogglePause());
$("pause-restart").addEventListener("click", () => {
  app.paused = false;
  if (app.gp) rcStartGrandPrixRound();
  else rcStartRace({ trackId: app.race.track.id, mode: app.raceMode, humans: app.nPlayers, demo: app.demo });
});
$("pause-quit").addEventListener("click", () => rcQuitToMenu());

function rcQuitToMenu() {
  app.paused = false; app.gp = null; app.tt = null; app.demo = 0;
  if (app.net) { app.net.link?.close(); clearInterval(app.net.timer); app.net = null; }
  rcAudio.stopEngines();
  rcBackdrop(app.trackId);
  rcShow("menu");
}

// ------------------------------------------------------------------ Grand Prix

function rcStartGrandPrix() {
  const seed = rcSeed();
  const humans = app.players.slice(0, app.nPlayers).map((p, i) => ({ vehicle: p.vehicle, human: true, player: i, name: app.nPlayers > 1 ? `P${i + 1}` : "You", eggLivery: i === 0 ? rcActiveLivery() : null }));
  // Fix the AI field for the whole cup so the points table means something.
  const probe = rcCreateRace({ track: rcTrack(RACE_TRACKS[0].id), cls: app.cls, racers: humans, seed });
  const drivers = probe.racers.map((r) => ({ vehicle: r.vehicle, human: r.human, player: r.player, name: r.name, eggLivery: r.eggLivery ?? null }));
  app.gp = { round: 0, drivers, totals: drivers.map(() => 0), seed, results: [] };
  rcStartGrandPrixRound();
}

function rcStartGrandPrixRound() {
  const gp = app.gp;
  const def = RACE_TRACKS[gp.round];
  rcStartRace({ trackId: def.id, mode: "gp", drivers: gp.drivers.map((d) => ({ ...d })), seed: gp.seed + gp.round * 17 });
}

// ------------------------------------------------------------------ two-tab

function rcNetStatus(t) { $("net-status").textContent = t; }

$("net-host").addEventListener("click", () => {
  if (app.net) { app.net.link?.close(); clearInterval(app.net.timer); }
  const link = rcOpenLink((m) => rcOnNet(m));
  if (!link) { rcNetStatus("This browser has no BroadcastChannel, so the two-tab mode is unavailable here."); return; }
  app.net = { role: "host", link, remote: null, input: {}, edges: { item: false, signal: 0 }, lastSeen: 0, sendT: 0 };
  app.net.timer = setInterval(() => { if (!app.net?.remote) link.send({ t: "host" }); }, 700);
  rcNetStatus("Hosting. Waiting for a second tab of this browser to choose Join…");
});
$("net-join").addEventListener("click", () => {
  if (app.net) { app.net.link?.close(); clearInterval(app.net.timer); }
  const link = rcOpenLink((m) => rcOnNet(m));
  if (!link) { rcNetStatus("This browser has no BroadcastChannel, so the two-tab mode is unavailable here."); return; }
  app.net = { role: "join", link, host: null, lastSeen: 0, sendT: 0, edges: { item: false, signal: 0 } };
  rcNetStatus("Looking for a hosting tab in this browser…");
});

function rcOnNet(m) {
  const net = app.net;
  if (!net) return;
  if (net.role === "host") {
    if (m.t === "join" && !net.remote) {
      net.remote = m.from;
      clearInterval(net.timer);
      const seed = rcSeed();
      const me = { vehicle: app.players[0].vehicle, human: true, player: 0, name: "Tab 1" };
      const them = { vehicle: RC_VEHICLES.some((v) => v.id === m.vehicle) ? m.vehicle : "pickup", human: true, player: 1, remote: true, name: "Tab 2" };
      net.lastSeen = performance.now();
      net.link.send({ t: "setup", to: m.from, trackId: app.trackId, cls: app.cls, seed, me, them });
      rcStartRace({ trackId: app.trackId, mode: "net", drivers: [me], remote: them, seed });
      rcToast("Second tab joined. Local multiplayer over BroadcastChannel — no server.");
    } else if (m.t === "input" && m.from === net.remote) {
      net.input = m.input ?? {};
      if (m.input?.item) net.edges.item = true;
      if (m.input?.signal) net.edges.signal = m.input.signal;
      net.lastSeen = performance.now();
    }
  } else if (net.role === "join") {
    if (m.t === "host" && !net.host) {
      net.link.send({ t: "join", to: m.from, vehicle: app.players[0].vehicle });
      rcNetStatus("Found a hosting tab. Joining…");
    } else if (m.t === "setup" && !net.host) {
      net.host = m.from;
      app.cls = m.cls;
      rcStartRace({ trackId: m.trackId, mode: "net", drivers: [m.me], remote: m.them, seed: m.seed, joinAs: 1 });
      net.lastSeen = performance.now();
      rcToast("Joined the hosting tab. Local multiplayer over BroadcastChannel — no server.");
    } else if (m.t === "state" && m.from === net.host && app.race) {
      rcApplySnapshot(app.race, m.snap);
      net.lastSeen = performance.now();
      for (const e of m.ev ?? []) rcHandleEvent(e);
      if (app.race.phase === "done" && app.screen === "race") rcShowResults();
    }
  }
}

// ------------------------------------------------------------------ events and HUD

function rcViewFor(id) { return app.views.find((v) => v.racer === id); }
function rcSay(id, text, cls = "", ms = 1600) {
  const v = rcViewFor(id);
  if (!v) return;
  v.msg = { text, cls, until: rcClock + ms };
}

function rcHandleEvent(e) {
  const race = app.race;
  const r = e.id != null ? race.racers[e.id] : null;
  const mine = r && app.views.some((v) => v.racer === r.id);
  const near = r && app.views.some((v) => { const o = race.racers[v.racer]; return o && Math.hypot(o.x - r.x, o.z - r.z) < 45; });
  switch (e.type) {
    case "count": rcCount(String(e.n)); rcAudio.play("count"); break;
    case "go": rcCount("GO!", true); rcAudio.play("go"); break;
    case "item": if (mine || near) rcAudio.play(e.item); if (mine) rcSay(e.id, RC_ITEMS.find((i) => i.id === e.item)?.name ?? ""); break;
    case "gotitem": if (mine) { rcAudio.play("gotitem"); } break;
    case "box": if (mine) rcAudio.play("box"); break;
    case "pad": if (mine) rcAudio.play("pad"); break;
    case "miniboost": if (mine) { rcAudio.play("miniboost"); rcSay(e.id, e.level === 2 ? "Super mini boost" : "Mini boost"); } break;
    case "drift": if (mine) rcAudio.play("drift"); break;
    case "hit": if (mine) { rcAudio.play("hit"); rcSay(e.id, { traffic: "Traffic!", cone: "Clipped a cone", paint: "Wet paint!", horn: "Air horn!", straddleCarrier: "Straddle carrier!", haulTruck: "Haul truck!" }[e.why] ?? "Spun out", "warn"); } break;
    case "shield": if (mine) { rcAudio.play("shield"); rcSay(e.id, "Hard hat took it"); } break;
    case "wall": if (mine) rcAudio.play("wall"); break;
    case "bump": case "traffic": if (mine) rcAudio.play("bump"); if (mine && e.type === "traffic") rcSay(e.id, "Traffic!", "warn"); break;
    case "cone": if (mine) rcAudio.play("cone"); break;
    case "safety": if (mine) { rcAudio.play("safety"); rcSay(e.id, e.mirrors ? "Safety bonus · signal + mirrors" : "Safety bonus · signalled", "safety", 2000); } break;
    case "signal": if (mine) rcAudio.play("signal"); break;
    case "startboost": if (mine) { rcAudio.play("startboost"); rcSay(e.id, "Perfect start"); } break;
    case "lap": if (mine) { rcAudio.play("lap"); rcSay(e.id, `Lap ${rcTime(e.time)}`); } rcTTLap(e); break;
    case "finallap": if (mine) { rcAudio.play("finallap"); rcSay(e.id, "Final lap", "", 2000); } break;
    case "finish": if (mine) { rcAudio.play("finish"); rcSay(e.id, `Finished ${rcOrdText(e.place)}`, "safety", 4000); } break;
    case "recover": if (mine) rcSay(e.id, "Roadside assist", "warn"); break;
    case "tow": if (mine) rcAudio.play("miniboost"); break;
    default: break;
  }
}

let rcCountT = null;
function rcCount(text, go = false) {
  const c = $("count");
  c.textContent = text; c.classList.add("on"); c.classList.toggle("go", go);
  clearTimeout(rcCountT);
  rcCountT = setTimeout(() => c.classList.remove("on"), go ? 900 : 700);
}

function rcTTLap(e) {
  const tt = app.tt;
  if (!tt || e.id !== 0) return;
  tt.lastLap = e.time;
  if (tt.buf.length > 10) {
    const improved = rcOfferGhost(rcSave, app.race.track.id, app.cls, e.time, tt.buf);
    if (improved) {
      rcStoreSave(rcStore, rcSave);
      tt.newBest = true;
      tt.best = e.time;
      tt.ghost = rcGhostDecode(rcSave.tt[tt.key].ghost);
      if (!app.world.ghost) app.world.setGhost(app.race.racers[0].vehicle);
      rcSay(0, `New best lap ${rcTime(e.time)} · ghost saved`, "safety", 2400);
    }
  }
  tt.buf = [];
}

function rcUpdateHud(now) {
  const race = app.race;
  const L = race.laps;
  for (const v of app.views) {
    const r = race.racers[v.racer];
    const el = v.el;
    const finished = r.finishT != null;
    el.querySelector(".pos").innerHTML = `${rcOrd(r.place)}<em>of ${race.racers.length}</em>`;
    const lapN = Math.max(1, Math.min(L, r.crossings || 1));
    const t = race.phase === "countdown" ? 0 : race.t;
    el.querySelector(".lap").innerHTML = finished ? `Finished<span>${rcTime(r.finishT)}</span>` : `Lap ${lapN}/${L}<span>${rcTime(t)}</span>`;
    const itemEl = el.querySelector(".item");
    const name = el.querySelector(".item-name");
    if (r.rolling) {
      const ids = Object.keys(RC_ICONS);
      itemEl.innerHTML = RC_ICONS[ids[Math.floor(now / 90) % ids.length]];
      itemEl.classList.remove("empty"); name.textContent = "";
    } else if (r.item) {
      if (itemEl.dataset.item !== r.item) itemEl.innerHTML = RC_ICONS[r.item];
      itemEl.classList.remove("empty");
      name.textContent = RC_ITEMS.find((i) => i.id === r.item)?.name ?? "";
    } else { itemEl.innerHTML = ""; itemEl.classList.add("empty"); name.textContent = ""; }
    itemEl.dataset.item = r.item ?? "";
    if (app.raceMode === "tt") { itemEl.hidden = true; name.hidden = true; }
    el.querySelector(".speed").innerHTML = `${Math.round(Math.abs(r.v) * 3.6)}<span>km/h</span>`;
    const blink = Math.floor(now / 330) % 2 === 0;
    el.querySelector(".sig.l").classList.toggle("on", !!r.signal && r.signal.dir > 0 && blink);
    el.querySelector(".sig.r").classList.toggle("on", !!r.signal && r.signal.dir < 0 && blink);
    el.querySelector(".rear").hidden = !v.look;
    const msg = el.querySelector(".msg");
    let text = v.msg.until > now ? v.msg.text : "", cls = v.msg.until > now ? v.msg.cls : "";
    if (!text && r.wrong && !finished) { text = "Wrong way"; cls = "warn"; }
    msg.textContent = text;
    msg.className = `msg${text ? " on" : ""}${cls ? ` ${cls}` : ""}`;
    const delta = el.querySelector(".delta");
    if (app.tt) {
      const best = app.tt.best;
      delta.textContent = best ? `Best ${rcTime(best)}${app.tt.lastLap ? ` · last ${rcTime(app.tt.lastLap)}` : ""}` : (app.tt.lastLap ? `Last ${rcTime(app.tt.lastLap)}` : "No ghost yet");
      delta.style.color = app.tt.lastLap && best && app.tt.lastLap <= best + 1e-6 ? "var(--green)" : "var(--muted)";
    } else delta.textContent = "";
  }
}

function rcDrawMinimap(now) {
  const race = app.race, tr = race.track;
  const cv = $("minimap");
  const g = cv.getContext("2d");
  const W = cv.width, H = cv.height;
  if (!app.mmScale || app.mmScale.id !== tr.id || app.mmScale.W !== W) {
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < tr.n; i++) { x0 = Math.min(x0, tr.x[i]); x1 = Math.max(x1, tr.x[i]); z0 = Math.min(z0, tr.z[i]); z1 = Math.max(z1, tr.z[i]); }
    const pad = W * 0.08;
    const sc = Math.min((W - 2 * pad) / (x1 - x0), (H - 2 * pad) / (z1 - z0));
    app.mmScale = { id: tr.id, W, x0, z0, sc, ox: (W - (x1 - x0) * sc) / 2, oz: (H - (z1 - z0) * sc) / 2 };
  }
  const m = app.mmScale;
  const P = (x, z) => [m.ox + (x - m.x0) * m.sc, H - (m.oz + (z - m.z0) * m.sc)];
  g.clearRect(0, 0, W, H);
  g.lineCap = "round"; g.lineJoin = "round";
  g.strokeStyle = "rgba(255,255,255,0.18)"; g.lineWidth = Math.max(4, tr.width * m.sc + 3);
  g.beginPath(); for (let i = 0; i <= tr.n; i += 2) { const [x, y] = P(tr.x[i % tr.n], tr.z[i % tr.n]); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.stroke();
  g.strokeStyle = "rgba(120,170,230,0.75)"; g.lineWidth = Math.max(2, tr.width * m.sc * 0.55);
  g.stroke();
  const [sx, sy] = P(tr.x[0], tr.z[0]);
  g.fillStyle = "#fff"; g.fillRect(sx - 3, sy - 3, 6, 6);
  g.fillStyle = "rgba(200,200,200,0.7)";
  for (const t of race.traffic) { const [x, y] = P(t.x, t.z); g.fillRect(x - 1.5, y - 1.5, 3, 3); }
  const blink = Math.floor(now / 250) % 2 === 0;
  for (const c of race.crossings) { if (!c.warn || blink) { const [x, y] = P(c.x, c.z); g.fillStyle = "#ffa21a"; g.fillRect(x - 3, y - 3, 6, 6); } }
  const dpr = W / parseFloat(cv.style.width || W);
  for (const r of race.racers.slice().reverse()) {
    const [x, y] = P(r.x, r.z);
    const view = app.views.find((v) => v.racer === r.id);
    g.beginPath(); g.arc(x, y, (view ? 5 : 3.4) * dpr, 0, Math.PI * 2);
    g.fillStyle = view ? rcCss(RC_PLAYER_COLOURS[view.player] ?? 0xffffff) : rcCss(r.veh.colour);
    g.fill();
    if (view) { g.lineWidth = 2 * dpr; g.strokeStyle = "#fff"; g.stroke(); }
  }
  if (app.tt?.ghost?.length && app.world?.ghostPose) {
    const [x, y] = P(app.world.ghostPose.x, app.world.ghostPose.z);
    g.beginPath(); g.arc(x, y, 3.5 * dpr, 0, Math.PI * 2); g.strokeStyle = "#8fe3ff"; g.lineWidth = 1.5 * dpr; g.stroke();
  }
}

// ------------------------------------------------------------------ results

function rcShowResults() {
  const race = app.race;
  const cls = race.cls;
  const rows = rcStandings(race);
  const gp = app.gp;
  let points = null;
  if (gp && app.raceMode === "gp" && gp.results.length === gp.round) {
    points = rcRacePoints(race);
    for (const [id, p] of Object.entries(points)) gp.totals[id] += p;
    gp.results.push(rows);
  } else if (gp) points = rcRacePoints(race);
  const badges = $("res-badges");
  const mode = app.raceMode === "gp" ? `Grand Prix · race ${gp.round + 1} of ${RACE_TRACKS.length}` : app.raceMode === "tt" ? "Time trial" : app.raceMode === "net" ? "Two-tab race" : app.raceMode === "demo" ? "AI exhibition" : "Single race";
  badges.innerHTML = `<span class="tag"></span><span class="tag cyan"></span><span class="tag cyan"></span>`;
  badges.children[0].textContent = cls.badge;
  badges.children[1].textContent = mode;
  badges.children[2].textContent = race.track.def.name;
  $("t-results").textContent = app.raceMode === "tt" ? "Time trial" : "Results";
  const table = $("res-table");
  if (app.raceMode === "tt") {
    const r = race.racers[0];
    table.innerHTML = `<thead><tr><th>Lap</th><th>Time</th><th></th></tr></thead><tbody></tbody>`;
    const tb = table.querySelector("tbody");
    r.lapTimes.forEach((t, i) => {
      const tr = document.createElement("tr");
      if (t === r.bestLap) tr.className = "me";
      tr.innerHTML = `<td class="pos">${i + 1}</td><td></td><td></td>`;
      tr.children[1].textContent = rcTime(t);
      tr.children[2].textContent = t === r.bestLap ? "best of this run" : "";
      tb.append(tr);
    });
    $("res-note").textContent = `Total ${rcTime(r.finishT)}. Course best lap on ${cls.name} class: ${rcTime(app.tt?.best)}${app.tt?.newBest ? " — a new best; its ghost is saved in this browser." : "."}`;
  } else {
    table.innerHTML = `<thead><tr><th>Pos</th><th>Driver</th><th>Vehicle</th><th>Time</th><th>Best lap</th><th>Safety</th><th>Items</th>${points ? "<th>Points</th>" : ""}</tr></thead><tbody></tbody>`;
    const tb = table.querySelector("tbody");
    for (const row of rows) {
      const tr = document.createElement("tr");
      if (row.human) tr.className = "me";
      const veh = RC_VEHICLES.find((v) => v.id === row.vehicle);
      tr.innerHTML = `<td class="pos">${row.place}</td><td><span class="chip"></span><span class="n"></span></td><td></td><td></td><td></td><td></td><td></td>${points ? "<td></td>" : ""}`;
      tr.querySelector(".chip").style.background = row.human ? rcCss(RC_PLAYER_COLOURS[row.player ?? 0]) : rcCss(veh.colour);
      tr.querySelector(".n").textContent = row.name + (row.human ? "" : " (AI)");
      tr.children[2].textContent = row.vehicleName;
      tr.children[3].textContent = rcTime(row.time) + (row.projected ? "*" : "");
      tr.children[4].textContent = rcTime(row.bestLap);
      tr.children[5].textContent = String(row.safety);
      tr.children[6].textContent = String(row.items);
      if (points) tr.children[7].textContent = `+${points[row.id] ?? 0}`;
      tb.append(tr);
    }
    const anyProjected = rows.some((r) => r.projected);
    $("res-note").textContent = `${anyProjected ? "* still running when the race closed: time projected from pace. " : ""}Safety = safety bonuses earned (signalled lane changes; two points when the mirrors were checked first).${app.raceMode === "net" ? " Two-tab race: local multiplayer over BroadcastChannel, no server." : ""}`;
  }
  const act = $("res-actions");
  act.textContent = "";
  const btn = (label, fn, primary = false) => { const b = document.createElement("button"); b.className = `btn${primary ? " primary" : ""}`; b.textContent = label; b.addEventListener("click", fn); act.append(b); };
  if (gp && app.raceMode === "gp") {
    // Cup standings under the race table.
    const order = gp.totals.map((p, i) => ({ i, p })).sort((a, b) => b.p - a.p);
    const lines = order.map((o, k) => `${k + 1}. ${gp.drivers[o.i].name}${gp.drivers[o.i].human ? "" : " (AI)"} ${o.p}`).join(" · ");
    $("res-note").textContent += ` Cup standings after ${gp.round + 1} of ${RACE_TRACKS.length}: ${lines}.`;
    if (gp.round + 1 < RACE_TRACKS.length) btn(`Next: ${RACE_TRACKS[gp.round + 1].name}`, () => { gp.round += 1; rcStartGrandPrixRound(); }, true);
    else btn("Podium", () => rcPodium(), true);
    btn("Quit the cup", () => rcQuitToMenu());
  } else if (app.raceMode === "tt") {
    btn("Go again", () => rcStartRace({ trackId: race.track.id, mode: "tt", humans: 1 }), true);
    btn("Change course", () => { app.mode = "tt"; rcShow("track"); });
    btn("Menu", () => rcQuitToMenu());
  } else if (app.raceMode === "net") {
    btn("Menu", () => rcQuitToMenu(), true);
  } else {
    btn("Race again", () => rcStartRace({ trackId: race.track.id, mode: app.raceMode, humans: app.nPlayers, demo: app.demo }), true);
    btn("Change course", () => { app.mode = app.raceMode === "demo" ? "race" : app.raceMode; rcShow("track"); });
    btn("Menu", () => rcQuitToMenu());
  }
  rcAudio.stopEngines();
  rcShow("results");
  window.__race.results = (window.__race.results ?? 0) + 1;
}

/** The end of a Grand Prix: the top three on a podium, and the unlock rule. */
function rcPodium() {
  const gp = app.gp;
  const order = gp.totals.map((p, i) => ({ i, p })).sort((a, b) => b.p - a.p);
  const humansAt = order.map((o, k) => ({ k: k + 1, d: gp.drivers[o.i] })).filter((x) => x.d.human);
  const bestHuman = humansAt.length ? Math.min(...humansAt.map((x) => x.k)) : 99;
  const res = rcApplyGrandPrix(rcSave, app.cls, bestHuman);
  rcSave = res.save;
  rcStoreSave(rcStore, rcSave);
  // Build the podium scene.
  rcDisposeScene();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b16);
  scene.fog = new THREE.Fog(0x070b16, 40, 140);
  scene.add(new THREE.HemisphereLight(0xbfd0ff, 0x1a1a22, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(10, 20, 14); scene.add(sun);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 48), new THREE.MeshStandardMaterial({ color: 0x151b2a, roughness: 0.6, metalness: 0.2 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const heights = [3.2, 2.2, 1.4], xs = [0, -7.5, 7.5];
  const blockCol = [0xffc93c, 0xc9d1da, 0xd0894a];
  for (let k = 0; k < 3; k++) {
    const o = order[k];
    if (!o) continue;
    const blk = new THREE.Mesh(new THREE.BoxGeometry(6.6, heights[k], 6.6), new THREE.MeshStandardMaterial({ color: blockCol[k], roughness: 0.4, metalness: 0.3, emissive: blockCol[k], emissiveIntensity: 0.12 }));
    blk.position.set(xs[k], heights[k] / 2, 0); scene.add(blk);
    const d = gp.drivers[o.i];
    const veh = RC_VEHICLES.find((v) => v.id === d.vehicle);
    const skin = d.eggLivery;
    const w = rcBuildVehicle(scene, veh.builder, veh.scale, { colour: skin?.colour ?? veh.colour, fleetName: skin?.fleetName ?? "NIGHT CIRCUIT", unitNumber: String(o.i + 1) });
    w.position.set(xs[k], heights[k], 0); w.rotation.y = Math.PI * 0.15 * (k === 1 ? 1 : k === 2 ? -1 : 0);
  }
  // Confetti.
  const n = 500, arr = new Float32Array(n * 3), cols = new Float32Array(n * 3);
  const pal = [[1, 0.79, 0.24], [0.31, 0.82, 1], [1, 0.35, 0.48], [0.55, 1, 0.35]];
  for (let i = 0; i < n; i++) { arr[i * 3] = (Math.random() - 0.5) * 30; arr[i * 3 + 1] = Math.random() * 24; arr[i * 3 + 2] = (Math.random() - 0.5) * 20; const c = pal[i % 4]; cols.set(c, i * 3); }
  const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.BufferAttribute(arr, 3)); cg.setAttribute("color", new THREE.BufferAttribute(cols, 3));
  const confetti = new THREE.Points(cg, new THREE.PointsMaterial({ size: 0.35, vertexColors: true }));
  scene.add(confetti);
  app.scene = scene;
  app.podium = { confetti, arr, cam: new THREE.PerspectiveCamera(50, 1, 0.3, 400), t: 0 };
  app.race = null;
  app.views = [];
  rcAudio.play("finish");
  if (res.unlocked) setTimeout(() => rcAudio.play("unlock"), 900);
  // The final table.
  $("res-badges").innerHTML = `<span class="tag"></span><span class="tag cyan">Grand Prix · final standings</span>`;
  $("res-badges").children[0].textContent = RC_CLASSES.find((c) => c.id === app.cls).badge;
  $("t-results").textContent = "Podium";
  const table = $("res-table");
  table.innerHTML = `<thead><tr><th>Pos</th><th>Driver</th><th>Vehicle</th><th>Points</th></tr></thead><tbody></tbody>`;
  const tb = table.querySelector("tbody");
  order.forEach((o, k) => {
    const d = gp.drivers[o.i];
    const tr = document.createElement("tr");
    if (d.human) tr.className = "me";
    tr.innerHTML = `<td class="pos">${k + 1}</td><td></td><td></td><td></td>`;
    tr.children[1].textContent = d.name + (d.human ? "" : " (AI)");
    tr.children[2].textContent = RC_VEHICLES.find((v) => v.id === d.vehicle).name;
    tr.children[3].textContent = String(o.p);
    tb.append(tr);
  });
  const cls = RC_CLASSES.find((c) => c.id === app.cls);
  const next = res.unlocked ? RC_CLASSES.find((c) => c.id === res.unlocked) : null;
  $("res-note").textContent = next
    ? `Top three on ${cls.name} class: ${next.name} class is now open. Unlocks are kept in this browser.`
    : bestHuman <= 3 ? `Top three on ${cls.name} class. ${cls.id === "master" ? "That is the top of the ladder." : "The next class was already open."}`
      : `Finish in the top three to open the next class. Best human finish this cup: ${bestHuman < 99 ? rcOrdText(bestHuman) : "—"}.`;
  const act = $("res-actions");
  act.textContent = "";
  const b1 = document.createElement("button"); b1.className = "btn primary"; b1.textContent = "Menu"; b1.addEventListener("click", () => { app.podium = null; rcQuitToMenu(); }); act.append(b1);
  $("scr-results").style.alignItems = "flex-end";
  rcShow("results");
}

// ------------------------------------------------------------------ showroom and backdrop

function rcBackdrop(trackId) {
  const tr = rcTrack(trackId);
  const race = rcCreateRace({ track: tr, cls: app.cls, mode: "demo", seed: 11 });
  app.race = race;
  app.backdrop = true;
  app.raceMode = "backdrop";
  app.podium = null;
  rcLoadWorld(race);
  app.views = [];
  app.showroom = null;
  $("scr-results").style.alignItems = "";
  if (app.screen === "garage") rcShowroom();
}

function rcShowroom() {
  if (!app.scene || !app.root) return;
  if (app.showroom) { app.root.remove(app.showroom.group); }
  const g = new THREE.Group();
  g.position.set(0, -300, 0);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.6, 48), new THREE.MeshStandardMaterial({ color: 0x151b2a, roughness: 0.4, metalness: 0.4 }));
  disc.position.y = -0.3; g.add(disc);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(16, 0.12, 8, 64), new THREE.MeshBasicMaterial({ color: 0xffc93c }));
  ring.rotation.x = Math.PI / 2; g.add(ring);
  const light = new THREE.PointLight(0xffffff, 400, 60); light.position.set(6, 14, 10); g.add(light);
  const light2 = new THREE.PointLight(0x9fc4ff, 250, 60); light2.position.set(-10, 8, -8); g.add(light2);
  const n = app.mode === "tt" || app.mode === "net" ? 1 : app.nPlayers;
  const turn = new THREE.Group(); g.add(turn);
  const livery = rcActiveLivery();
  for (let i = 0; i < n; i++) {
    const veh = RC_VEHICLES.find((v) => v.id === app.players[i].vehicle);
    const skin = i === 0 && livery ? livery : null;
    const w = rcBuildVehicle(turn, veh.builder, veh.scale, { colour: skin?.colour ?? veh.colour, fleetName: skin?.fleetName ?? "NIGHT CIRCUIT", unitNumber: String(i + 1) });
    w.position.set((i - (n - 1) / 2) * 6.5, 0, 0);
  }
  app.root.add(g);
  app.showroom = { group: g, turn, n };
}

// ------------------------------------------------------------------ cameras and loop

const rcTmp = new THREE.Vector3();
function rcFollow(v, r, dt, lookBack) {
  const veh = r.veh;
  const l = veh.dims[2] * veh.scale, h = veh.dims[1] * veh.scale;
  // Follow the travel direction more than the nose, so a drift reads as a drift.
  const hm = r.m + Math.atan2(Math.sin(r.h - r.m), Math.cos(r.h - r.m)) * 0.35;
  v.camH = v.camPos ? v.camH + Math.atan2(Math.sin(hm - v.camH), Math.cos(hm - v.camH)) * Math.min(1, 5 * dt) : hm;
  const dirX = Math.sin(v.camH), dirZ = Math.cos(v.camH);
  const back = 5.0 + l * 0.5 + Math.max(0, r.v) * 0.04;
  const up = 2.1 + h * 0.5;
  const sgn = lookBack ? -1 : 1;
  rcTmp.set(r.x - dirX * back * sgn, r.y + up, r.z - dirZ * back * sgn);
  if (!v.camPos || v.camPos.distanceTo(rcTmp) > 40) { v.camPos = rcTmp.clone(); v.camH = hm; }
  else v.camPos.lerp(rcTmp, lookBack ? 1 : Math.min(1, 9 * dt));
  v.cam.position.copy(v.camPos);
  v.cam.lookAt(r.x + dirX * 6 * sgn, r.y + 1.4, r.z + dirZ * 6 * sgn);
  const fov = 66 + (r.boostT > 0 ? 9 : 0) + Math.min(6, Math.max(0, r.v - 20) * 0.3);
  v.cam.fov += (fov - v.cam.fov) * Math.min(1, 4 * dt);
}

let rcLast = performance.now();
let rcSendT = 0;
let rcClock = 0;
function rcLoop(now) {
  requestAnimationFrame(rcLoop);
  const real = Math.min(0.05, (now - rcLast) / 1000);
  rcLast = now;
  if (app.frozen) return;
  rcClock = now;
  rcTick(real, now, true);
}

/**
 * One frame: poll, step the simulation by `real` seconds (times the time
 * scale), and draw if `draw`. The browser calls it from requestAnimationFrame;
 * window.__race.tick() calls it directly for lockstep capture on a slow
 * machine.
 */
function rcTick(real, now, draw = true) {
  rcPollPads(real);
  const W = window.innerWidth, H = window.innerHeight;
  const race = app.race;
  // Menus: the gamepad walks the buttons.
  if (app.screen !== "race") {
    const e = rcPadState[0].edge ?? {};
    const btns = [...document.querySelectorAll(`#scr-${app.screen} button:not([disabled]), #scr-${app.screen} a.btn`)];
    if (btns.length && (e[13] || e[15] || e[12] || e[14])) {
      const i = btns.indexOf(document.activeElement);
      const d = e[13] || e[15] ? 1 : -1;
      btns[(i + d + btns.length) % btns.length].focus();
    }
    if (e[0] && document.activeElement?.click) document.activeElement.click();
  }
  if (race && app.scene) {
    const net = app.net;
    const client = net?.role === "join" && net.host;
    if (!app.paused && !client) {
      const dt = real * (app.backdrop ? 1 : app.timeScale);
      app.acc += dt;
      const step = app.timeScale > 8 ? 1 / 30 : 1 / 60;
      let first = true;
      const inputs = {};
      for (const v of app.views) {
        const r = race.racers[v.racer];
        if (r?.human && !r.remote) inputs[r.id] = rcReadPlayer(v.player, app.views.length);
      }
      rcPressed.clear();
      for (const v of app.views) v.look = !!inputs[v.racer]?.lookback;
      if (net?.role === "host" && net.remote) {
        const rr = race.racers.find((r) => r.remote);
        if (rr) {
          inputs[rr.id] = { ...net.input, item: net.edges.item, signal: net.edges.signal };
          if (performance.now() - net.lastSeen > 6000 && rr.human) { rr.human = false; rcToast("The other tab went quiet; an AI driver took its seat."); }
        }
      }
      let guard = 0;
      while (app.acc >= step && guard++ < 400) {
        const inp = first ? inputs : Object.fromEntries(Object.entries(inputs).map(([k, x]) => [k, { ...x, item: false, signal: 0 }]));
        first = false;
        if (net?.role === "host") { net.edges.item = false; net.edges.signal = 0; }
        rcStep(race, step, inp);
        app.acc -= step;
        if (app.tt) {
          const r = race.racers[0];
          if (r.crossings !== app.tt.lastCross) { if (app.tt.lastCross === 0) app.tt.buf = []; app.tt.lastCross = r.crossings; }
          app.tt.sampleT += step;
          if (app.tt.sampleT >= 0.1 && r.crossings >= 1 && r.finishT == null) { app.tt.sampleT -= 0.1; app.tt.buf.push([r.x, r.y, r.z, r.h]); }
        }
        if (!app.backdrop) {
          if (net?.role === "host") app.lastEvents.push(...race.events);
          for (const e of race.events) rcHandleEvent(e);
        }
        race.events.length = 0;
        if (race.phase === "done") break;
      }
      if (net?.role === "host" && net.remote) {
        rcSendT += real;
        if (rcSendT > 1 / 30) {
          rcSendT = 0;
          const rid = race.racers.find((r) => r.remote)?.id;
          net.link.send({ t: "state", to: net.remote, snap: rcSnapshot(race), ev: app.lastEvents.filter((e) => e.id === rid || e.type === "count" || e.type === "go" || e.type === "done") });
          app.lastEvents = [];
        }
      }
      if (race.phase === "done") {
        if (app.backdrop) rcBackdrop(race.track.id);
        else if (app.screen === "race" && !race.resultsQueued) {
          race.resultsQueued = true;
          setTimeout(() => { if (app.race === race && app.screen === "race") rcShowResults(); }, app.timeScale > 1 ? 50 : 1400);
        }
      }
    } else if (client) {
      rcSendT += real;
      const v = app.views[0];
      const inp = rcReadPlayer(0, 1);
      if (inp.item) net.edges.item = true;
      if (inp.signal) net.edges.signal = inp.signal;
      rcPressed.clear();
      if (v) v.look = inp.lookback;
      if (rcSendT > 1 / 30) {
        rcSendT = 0;
        net.link.send({ t: "input", to: net.host, input: { ...inp, item: net.edges.item, signal: net.edges.signal } });
        net.edges.item = false; net.edges.signal = 0;
      }
      if (performance.now() - net.lastSeen > 4000 && app.screen === "race") { rcToast("The hosting tab has closed."); rcQuitToMenu(); return; }
    }
    if (app.tt?.ghost?.length && race.racers[0].crossings >= 1 && race.racers[0].finishT == null) {
      app.world.ghostPose = rcGhostAt(app.tt.ghost, race.t - race.racers[0].lapStart);
    } else if (app.world) app.world.ghostPose = null;
    if (app.world && app.race) app.world.update(app.race, real * (app.backdrop ? 1 : Math.min(3, app.timeScale)), now / 1000);
  }

  if (!draw) return;
  // Render.
  rcRenderer.setScissorTest(false);
  rcRenderer.setViewport(0, 0, W, H);
  rcRenderer.clear();
  if (app.podium && app.scene) {
    const p = app.podium;
    p.t += real;
    p.cam.aspect = W / H; p.cam.updateProjectionMatrix();
    p.cam.position.set(Math.sin(p.t * 0.25) * 22, 9, Math.cos(p.t * 0.25) * 22);
    p.cam.lookAt(0, 3, 0);
    for (let i = 0; i < p.arr.length; i += 3) { p.arr[i + 1] -= real * 2.2; if (p.arr[i + 1] < 0) p.arr[i + 1] = 24; }
    p.confetti.geometry.attributes.position.needsUpdate = true;
    rcRenderer.render(app.scene, p.cam);
  } else if (app.scene && race) {
    if (app.views.length && !app.backdrop) {
      rcRenderer.setScissorTest(true);
      for (const v of app.views) {
        const r = race.racers[v.racer];
        rcFollow(v, r, real, v.look);
        const [x, y, w, h] = v.rect;
        rcRenderer.setViewport(x, H - y - h, w, h);
        rcRenderer.setScissor(x, H - y - h, w, h);
        v.cam.aspect = w / h; v.cam.updateProjectionMatrix();
        // Your own marker would sit in front of your camera; the others see it.
        const own = app.world.racerModels[v.racer]?.userData.fx.marker;
        if (own) own.visible = false;
        rcRenderer.render(app.scene, v.cam);
        if (own) own.visible = true;
        if (!app.demo || app.views.length) {
          const r0 = r;
          if (r0.human && !r0.remote && app.views.length <= 4 && !app.paused) rcAudio.engine(v.player, Math.min(1, Math.abs(r0.v) / (r0.p.top * 1.2)), r0.boostT > 0, app.screen === "race");
        }
      }
      if (app.overview) {
        const o = app.overview, tr = race.track;
        const [x, y, w, h] = o.rect;
        let cx = 0, cz = 0;
        for (let i = 0; i < tr.n; i += 10) { cx += tr.x[i]; cz += tr.z[i]; }
        cx /= Math.ceil(tr.n / 10); cz /= Math.ceil(tr.n / 10);
        o.cam.position.set(cx + Math.sin(now / 9000) * 380, 330, cz + Math.cos(now / 9000) * 380);
        o.cam.lookAt(cx, 0, cz);
        rcRenderer.setViewport(x, H - y - h, w, h); rcRenderer.setScissor(x, H - y - h, w, h);
        o.cam.aspect = w / h; o.cam.updateProjectionMatrix();
        rcRenderer.render(app.scene, o.cam);
      }
      rcRenderer.setScissorTest(false);
      rcUpdateHud(now);
      rcDrawMinimap(now);
    } else {
      // Menu backdrop: a slow cinematic orbit round the race leader, or the showroom.
      const cam = app.menuCam ?? (app.menuCam = new THREE.PerspectiveCamera(55, 1, 0.3, 2400));
      cam.aspect = W / H; cam.updateProjectionMatrix();
      if (app.screen === "garage" && app.showroom) {
        const s = app.showroom;
        s.turn.rotation.y += real * 0.35;
        const dist = 9 + s.n * 3.2;
        cam.position.set(Math.sin(now / 7000) * 2 + 0, -300 + 4.5, dist);
        cam.lookAt(0, -300 + 1.3, 0);
      } else {
        const lead = race.racers.reduce((a, b) => (b.progress > a.progress ? b : a), race.racers[0]);
        const a = now / 6000;
        const tgt = new THREE.Vector3(lead.x, lead.y + 1.5, lead.z);
        const want = new THREE.Vector3(lead.x + Math.sin(a) * 18, lead.y + 7, lead.z + Math.cos(a) * 18);
        cam.position.lerp(want, cam.position.lengthSq() < 1 ? 1 : Math.min(1, 2 * real));
        cam.lookAt(tgt);
      }
      rcRenderer.render(app.scene, cam);
    }
  }
}

window.addEventListener("resize", () => {
  rcRenderer.setSize(window.innerWidth, window.innerHeight);
  if (app.views.length) rcPlaceHuds();
});

// ------------------------------------------------------------------ boot

window.__race = {
  get race() { return app.race; },
  get app() { return app; },
  get world() { return app.world; },
  renderer: rcRenderer,
  start: (o) => rcStartRace(o),
  demo: (n) => rcStartDemo(n),
  show: (s) => rcShow(s),
  meshCount: () => app.world?.meshCount() ?? 0,
  /** Lockstep: stop the animation loop driving the game, then step it by hand. */
  freeze: (on = true) => { app.frozen = !!on; rcLast = performance.now(); },
  tick: (dt = 1 / 30, draw = true) => { rcClock += dt * 1000; rcTick(dt, rcClock, draw); },
  advance: (sec, dt = 1 / 30) => { for (let t = 0; t < sec; t += dt) { rcClock += dt * 1000; rcTick(dt, rcClock, false); } },
  drawCalls: () => rcRenderer.info.render.calls,
  save: () => rcSave,
};

rcBackdrop(app.trackId);
rcShow("menu");
requestAnimationFrame(rcLoop);
{
  const demo = Number(RC_Q.get("demo"));
  const players = Number(RC_Q.get("players"));
  const mode = RC_Q.get("mode");
  const screen = RC_Q.get("screen");
  if (demo) rcStartDemo(demo);
  else if (mode === "tt") { app.mode = "tt"; rcStartRace({ trackId: app.trackId, mode: "tt", humans: 1 }); }
  else if (mode === "gp") { app.mode = "gp"; app.nPlayers = Math.max(1, Math.min(4, players || 1)); rcStartGrandPrix(); }
  else if (players) { app.mode = "race"; app.nPlayers = Math.max(1, Math.min(4, players)); rcStartRace({ trackId: app.trackId, mode: "race", humans: app.nPlayers }); }
  else if (screen && RC_SCREENS.includes(screen)) { app.mode = RC_Q.get("for") ?? "race"; rcShow(screen); }
  void RC_POINTS;
}
