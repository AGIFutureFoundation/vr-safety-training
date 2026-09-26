import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor } from "../../shared/input.js";
import { ARCADE_CABINETS } from "./cabinets.js";
import { arLoadScores, arSubmitScore, ARCADE_TABLE_SIZE } from "./scores.js";
import { arCreateAudio } from "./audio.js";
import { psBoardSize } from "./games/palletstacker.js";

// Break Room Arcade — the app: cabinet select, title/controls cards, the
// game loop, pause, game over, high scores and the CRT toggle. Each
// cabinet's own engine (create/step/render) is pure and lives under
// games/*.js; this file only wires input, canvas and audio around it.

const $ = (id) => document.getElementById(id);
const aaStore = (() => { try { return window.localStorage; } catch { return null; } })();
const aaAudio = arCreateAudio();

const aa = {
  screen: "menu",
  cabinet: null,
  players: 1,
  state: null,
  paused: false,
  crt: true,
  attract: ARCADE_CABINETS.map((c, i) => ({ cab: c, state: c.engine.create({ seed: i + 11, players: c.players === 2 ? 1 : undefined }) })),
  t: 0,
  lastScores: null,
  initials: ["C", "R", "W"],
  initialsSlot: 0,
};

// ------------------------------------------------------------------- input

const AA_SOLO_SETS = [
  { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" },
  { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" },
];
const AA_DUO_SETS = [
  { up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD", rotate: "KeyW", hard: "Space" },
  { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", rotate: "ArrowUp", hard: "Enter" },
];
const AA_GAME_KEYS = new Set([...AA_SOLO_SETS, ...AA_DUO_SETS].flatMap((k) => Object.values(k)));

const aaKeys = new Set();
window.addEventListener("keydown", (e) => {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  if (e.repeat) return;
  aaKeys.add(e.code);
  aaAudio.resume();
  if (aa.screen === "playing") {
    if (AA_GAME_KEYS.has(e.code) || e.code === "Space" || e.code === "Enter") e.preventDefault();
    if (e.code === "Escape" || e.code === "KeyP") aaTogglePause();
    if (e.code === "KeyM") { aaAudio.setMuted(!aaAudio.muted); aaToast(aaAudio.muted ? "Sound off" : "Sound on"); }
  } else if (aa.screen === "pause" && (e.code === "Escape" || e.code === "KeyP")) {
    aaTogglePause();
  } else if (e.code === "Escape") {
    document.querySelector(".screen:not([hidden]) [data-back]")?.click();
  }
});
window.addEventListener("keyup", (e) => aaKeys.delete(e.code));
window.addEventListener("blur", () => aaKeys.clear());
window.addEventListener("pointerdown", () => aaAudio.resume(), { passive: true });

const aaPads = [0, 1].map((i) => createGamepad({
  getGamepads: () => {
    const all = navigator.getGamepads ? navigator.getGamepads() : [];
    const p = all?.[i];
    return p ? [p] : [];
  },
  bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) aaToast(`Gamepad ${i + 1} connected (${detectPadVendor(info.id)} labels).`); },
}));
const aaPadState = [0, 1].map(() => ({ prev: {}, edge: {} }));
function aaPollPads(dt) {
  aaPads.forEach((p, i) => {
    const st = aaPadState[i];
    const snap = p.poll(dt);
    st.snap = snap;
    const b = snap?.buttons ?? [];
    st.edge = {};
    for (const k of [0, 1, 7, 9, 12, 13, 14, 15]) {
      const now = !!b[k]?.pressed;
      st.edge[k] = now && !st.prev[k];
      st.prev[k] = now;
    }
  });
}

function aaPadAxis(i) {
  const s = aaPadState[i]?.snap;
  if (!s?.connected) return { x: 0, y: 0 };
  const ax = s.axes?.[0]?.value ?? 0, ay = s.axes?.[1]?.value ?? 0;
  return { x: Math.abs(ax) > GAMEPAD_DEADZONE ? ax : 0, y: Math.abs(ay) > GAMEPAD_DEADZONE ? ay : 0 };
}

function aaReadSolo() {
  const inp = { up: false, down: false, left: false, right: false };
  for (const k of AA_SOLO_SETS) {
    if (aaKeys.has(k.up)) inp.up = true;
    if (aaKeys.has(k.down)) inp.down = true;
    if (aaKeys.has(k.left)) inp.left = true;
    if (aaKeys.has(k.right)) inp.right = true;
  }
  const st = aaPadState[0]?.snap;
  const ax = aaPadAxis(0);
  if (ax.x < 0) inp.left = true;
  if (ax.x > 0) inp.right = true;
  if (ax.y < 0) inp.up = true;
  if (ax.y > 0) inp.down = true;
  const dp = st?.buttons ?? [];
  if (dp[12]?.pressed) inp.up = true;
  if (dp[13]?.pressed) inp.down = true;
  if (dp[14]?.pressed) inp.left = true;
  if (dp[15]?.pressed) inp.right = true;
  if (dp[0]?.pressed) inp.up = true; // A: jump, in Crew Run
  if (dp[1]?.pressed) inp.down = true; // B: duck, in Crew Run
  if (st?.connected && aaPadState[0].edge?.[9] && aa.screen === "playing") aaTogglePause();
  return inp;
}

function aaReadDuo(i) {
  const k = AA_DUO_SETS[i];
  const inp = { left: false, right: false, down: false, rotate: false, hardDrop: false };
  if (aaKeys.has(k.left)) inp.left = true;
  if (aaKeys.has(k.right)) inp.right = true;
  if (aaKeys.has(k.down)) inp.down = true;
  if (aaKeys.has(k.rotate)) inp.rotate = true;
  if (aaKeys.has(k.hard)) inp.hardDrop = true;
  const ax = aaPadAxis(i);
  const st = aaPadState[i]?.snap;
  if (ax.x < 0) inp.left = true;
  if (ax.x > 0) inp.right = true;
  const dp = st?.buttons ?? [];
  if (dp[14]?.pressed) inp.left = true;
  if (dp[15]?.pressed) inp.right = true;
  if (dp[13]?.pressed) inp.down = true;
  if (dp[0]?.pressed) inp.rotate = true;
  if (dp[7]?.pressed) inp.hardDrop = true;
  if (st?.connected && aaPadState[i].edge?.[9] && aa.screen === "playing") aaTogglePause();
  return inp;
}

function aaReadInput() {
  if (aa.cabinet.id === "palletstacker") {
    const inputs = { 0: aaReadDuo(0) };
    if (aa.players === 2) inputs[1] = aaReadDuo(1);
    return inputs;
  }
  return aaReadSolo();
}

// ------------------------------------------------------------------- canvas

const canvas = $("game");
const ctx = canvas.getContext("2d");
function aaCanvasSize() {
  if (aa.cabinet?.id === "palletstacker") {
    const { w, h } = psBoardSize();
    return { w: aa.players * w + (aa.players - 1) * 24 + 8, h: h + 40 };
  }
  return { w: aa.cabinet?.width ?? 256, h: aa.cabinet?.height ?? 224 };
}
function aaFitCanvas() {
  const { w, h } = aaCanvasSize();
  canvas.width = w; canvas.height = h;
  // #stage-wrap is `position:fixed;inset:0`, so the viewport size stands in
  // for its box even while it is still [hidden] (and so has no layout box).
  const availW = window.innerWidth - 24, availH = window.innerHeight - 24;
  const scale = Math.max(1, Math.floor(Math.min(availW / w, availH / h, 5)));
  canvas.style.width = `${w * scale}px`;
  canvas.style.height = `${h * scale}px`;
}
window.addEventListener("resize", () => { if (aa.screen === "playing" || aa.screen === "pause") aaFitCanvas(); });

// ------------------------------------------------------------------- screens

// "playing" has no scr-playing card — the canvas in #stage-wrap is the screen.
const AA_SCREENS = ["menu", "title", "pause", "gameover", "scores"];
function aaShow(name) {
  aa.screen = name;
  for (const s of AA_SCREENS) $(`scr-${s}`).hidden = s !== name;
  $("stage-wrap").hidden = !(name === "playing" || name === "pause");
  $("crt").hidden = !(name === "playing" || name === "pause") || !aa.crt;
  if (name === "menu") aaRenderMenu();
  if (name === "title") aaRenderTitle();
  if (name === "scores") aaRenderScores(null);
  aaAudio.play("select");
}

let aaToastT = null;
function aaToast(text, ms = 2400) {
  const t = $("toast");
  t.textContent = text; t.classList.add("on");
  clearTimeout(aaToastT);
  aaToastT = setTimeout(() => t.classList.remove("on"), ms);
}

// ---- menu: three cabinets, attract-mode preview canvases

function aaRenderMenu() {
  const row = $("cab-row");
  row.textContent = "";
  ARCADE_CABINETS.forEach((cab, i) => {
    const card = document.createElement("button");
    card.className = "cabinet";
    card.setAttribute("aria-label", `Play ${cab.name}`);
    const cv = document.createElement("canvas");
    cv.width = 128; cv.height = cab.id === "palletstacker" ? 112 : Math.round(128 * (cab.height / cab.width));
    cv.className = "cab-screen";
    card.innerHTML = `<div class="marquee"></div>`;
    card.querySelector(".marquee").textContent = cab.name;
    card.append(cv);
    const meta = document.createElement("div");
    meta.className = "cab-meta";
    meta.innerHTML = `<b></b><span></span>`;
    meta.querySelector("b").textContent = cab.genre;
    meta.querySelector("span").textContent = cab.players === 2 ? "1-2 players" : "1 player";
    card.append(meta);
    card.addEventListener("click", () => { aa.cabinet = cab; aa.players = 1; aaShow("title"); });
    row.append(card);
    aa.attract[i].canvas = cv;
  });
}

function aaAttractInput(id, t) {
  if (id === "spoolyard") return { left: Math.sin(t * 0.7) > 0.25, right: Math.sin(t * 0.7) < -0.25, up: Math.sin(t * 1.3) > 0.55, down: Math.sin(t * 1.3 + 1) > 0.85 };
  if (id === "crewrun") return { up: Math.sin(t * 1.05) > 0.88, down: Math.sin(t * 1.7 + 2) < -0.9 };
  return { 0: { left: Math.sin(t * 0.9) > 0.35, right: Math.sin(t * 0.9) < -0.35, rotate: Math.sin(t * 2.3) > 0.92, down: Math.sin(t * 1.6) > 0.8 } };
}

function aaStepAttract(dt) {
  for (const a of aa.attract) {
    if (!a.canvas || a.state.over) { if (a.state.over) a.state = a.cab.engine.create({ seed: Math.random() * 1e6 | 0, players: a.cab.players === 2 ? 1 : undefined }); continue; }
    a.cab.engine.step(a.state, dt, aaAttractInput(a.cab.id, aa.t));
    const c = a.canvas.getContext("2d");
    a.cab.engine.render(c, a.state, a.canvas.width, a.canvas.height);
  }
}

// ---- title card

function aaRenderTitle() {
  const cab = aa.cabinet;
  $("title-name").textContent = cab.name;
  $("title-genre").textContent = cab.genre;
  $("title-blurb").textContent = cab.blurb;
  $("title-controls").textContent = cab.controls;
  $("title-teaches").textContent = `What this teaches: ${cab.teaches}`;
  $("title-players").hidden = cab.players !== 2;
  $("title-players-solo").hidden = cab.players === 2;
  const table = arLoadScores(aaStore)[cab.id] ?? [];
  const list = $("title-scores");
  list.textContent = "";
  table.slice(0, 5).forEach((row, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${row.name} — ${row.score}`;
    list.append(li);
  });
  if (!table.length) { const li = document.createElement("li"); li.textContent = "No scores yet — be the first."; list.append(li); }
}
$("title-1p").addEventListener("click", () => { aa.players = 1; aaStartGame(); });
$("title-2p").addEventListener("click", () => { aa.players = 2; aaStartGame(); });
$("title-start").addEventListener("click", () => { aa.players = 1; aaStartGame(); });

function aaStartGame() {
  aa.state = aa.cabinet.engine.create({ seed: (Date.now() / 1000 | 0) % 1e6, players: aa.players });
  aa.paused = false;
  aaFitCanvas();
  aaShow("playing");
  aaAudio.play("start");
  aaAudio.resume();
  if (aaStore) aaAudio.music(true);
}

function aaTogglePause() {
  if (!aa.state) return;
  aa.paused = !aa.paused;
  if (aa.paused) { aaShow("pause"); aaAudio.play("pause"); } else { aaShow("playing"); aaFitCanvas(); }
}
$("pause-resume").addEventListener("click", aaTogglePause);
$("pause-restart").addEventListener("click", () => aaStartGame());
$("pause-quit").addEventListener("click", () => aaQuitToMenu());

function aaQuitToMenu() {
  aa.paused = false; aa.state = null; aa.cabinet = null;
  aaAudio.stop();
  aaShow("menu");
}

// ---- game over + high scores

function aaBoardScores(state) {
  if (aa.cabinet.id === "palletstacker") return state.boards.map((b) => b.score);
  return [state.score];
}

function aaShowGameOver() {
  aaAudio.stop();
  const scores = aaBoardScores(aa.state).map(Math.round);
  aa.lastScores = scores;
  const table = arLoadScores(aaStore)[aa.cabinet.id] ?? [];
  const lowest = table.length < ARCADE_TABLE_SIZE ? -1 : table[table.length - 1].score;
  const qualifies = scores.some((s) => s > lowest);
  aaAudio.play(aa.state.win ? "win" : "over");
  $("go-title").textContent = aa.state.win ? "Board cleared!" : "Game over";
  $("go-score").innerHTML = scores.map((s, i) => `<div>${scores.length > 1 ? `Player ${i + 1}: ` : "Score: "}<b>${s}</b></div>`).join("");
  $("go-entry").hidden = !qualifies;
  $("go-noentry").hidden = qualifies;
  if (qualifies) {
    aa.initials = ["C", "R", "W"];
    aa.pendingIdx = scores.findIndex((s) => s > lowest);
    $("go-initials").value = "CRW";
    aaAudio.play("highscore");
  }
  aaRenderScores(aa.cabinet.id, "scores-tables-go");
  aaShow("gameover");
}
$("go-save").addEventListener("click", () => {
  const name = ($("go-initials").value || "CRW").slice(0, 3);
  const score = aa.lastScores[aa.pendingIdx ?? 0];
  arSubmitScore(aaStore, aa.cabinet.id, name, score);
  aaRenderScores(aa.cabinet.id, "scores-tables-go");
  $("go-entry").hidden = true;
  $("go-noentry").hidden = false;
  $("go-noentry").textContent = "Saved to the high score table.";
});
$("go-again").addEventListener("click", () => aaStartGame());
$("go-menu").addEventListener("click", () => aaQuitToMenu());

function aaRenderScores(highlightGame, targetId = "scores-tables-view") {
  const wrap = $(targetId);
  wrap.textContent = "";
  const all = arLoadScores(aaStore);
  for (const cab of ARCADE_CABINETS) {
    const box = document.createElement("div");
    box.className = "score-box";
    if (cab.id === highlightGame) box.classList.add("hi");
    const rows = all[cab.id] ?? [];
    box.innerHTML = `<h3></h3><ol></ol>`;
    box.querySelector("h3").textContent = cab.name;
    const ol = box.querySelector("ol");
    if (!rows.length) { const li = document.createElement("li"); li.textContent = "—"; ol.append(li); }
    rows.forEach((r) => { const li = document.createElement("li"); li.textContent = `${r.name} — ${r.score}`; ol.append(li); });
    wrap.append(box);
  }
}
$("btn-scores").addEventListener("click", () => aaShow("scores"));
document.querySelectorAll("[data-back]").forEach((b) => b.addEventListener("click", () => aaShow("menu")));

// ---- CRT toggle

$("btn-crt").addEventListener("click", () => {
  aa.crt = !aa.crt;
  $("btn-crt").setAttribute("aria-pressed", String(aa.crt));
  $("btn-crt").textContent = `CRT scanlines: ${aa.crt ? "on" : "off"}`;
  $("crt").hidden = !aa.crt || !(aa.screen === "playing" || aa.screen === "pause");
});

// ------------------------------------------------------------------- loop

let aaLast = performance.now();
function aaFrame(now) {
  requestAnimationFrame(aaFrame);
  let dt = Math.min(0.05, (now - aaLast) / 1000);
  aaLast = now;
  aa.t += dt;
  aaPollPads(dt);
  if (aa.screen === "menu") { aaStepAttract(dt); return; }
  if (aa.screen !== "playing" || !aa.state) return;
  const before = aa.state.over;
  const events = aa.cabinet.engine.step(aa.state, dt, aaReadInput());
  for (const e of events) aaOnEvent(e);
  aa.cabinet.engine.render(ctx, aa.state, canvas.width, canvas.height);
  if (!before && aa.state.over) aaShowGameOver();
}

const AA_EVENT_SOUND = {
  floor: "step", anchor: "anchor", "board-complete": "levelup",
  hit: "hit", ppe: "ppe", stomp: "stomp", checkpoint: "checkpoint",
  ship: "ship", shift: "shift", lock: null,
};
function aaOnEvent(e) {
  if (e.type === "ship" && e.rows >= 4) return aaAudio.play("tetris");
  const s = AA_EVENT_SOUND[e.type];
  if (s) aaAudio.play(s);
}

requestAnimationFrame(aaFrame);
aaShow("menu");
