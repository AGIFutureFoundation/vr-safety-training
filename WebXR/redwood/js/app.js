import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
import { cnMount } from "../../shared/cinema.js";
import { gdMount } from "../../shared/guide.js";
import { createGamepad, GAMEPAD_DEADZONE } from "../../shared/input.js";
import { tcTier, tcTierChoice, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { gtStorage } from "../../shared/profiles.js";
import { ppCompleteReturns, ppHerePage, ppReturnSite } from "../../shared/passport.js";
import { qmMissing, qmCachedSnapshot, qmInvalidate } from "../../shared/skill-gates.js";
import { lkStationLink, lkRenderStations, lkSiteHeading, lkStationLabel } from "../../shared/links.js";
// Skill-gated side quests (docs/skill-gates.md): the shared chip, quest-log panel, board rows, map pins and lock toast.
import { qmMountSideGames, qmBoardRows, qmDrawPin, qmLockToast } from "../../shared/skill-gates-ui.js";
import { qmIsOpen, qmSnapshot } from "../../shared/skill-gates.js";
import { k2RenderLessonList } from "../../shared/field-lessons.js";
import { k2AdaptLesson, k2RecordLesson, k2FieldNotes, K2_FIELD_NOTES_BADGE } from "../../shared/field-kiosk.js";
import {
  RW_BOUNDS, RW_SITES, RW_ROADS, RW_TRAILS, RW_RIVER, RW_MAIN_ARC, RW_SIDE_QUESTS, RW_ACTIVITIES, RW_MAP_LAYERS, RW_FUEL_BREAK, RW_GATED,
  rwHeightAt, rwIsWater, rwSite, rwCoastZ,
} from "./rw-data.js";
import { RW_EGGS, RW_FIELD_LESSONS } from "./rw-lore-data.js";
import {
  rwLoad, rwSave, rwGateOpen, rwGateMissing, rwQuestStatus, rwCurrentObjective, rwAdvance, rwVisit, rwFind,
  rwScoreActivity, rwRecordActivity,
} from "./rw-career.js";
import { rwBuildWorld } from "./rw-world.js";
import { tzWatchWorld, tzLessonAnswered } from "../../shared/treasures.js";
// NPC characters that pass knowledge along (console GRIOT, shared/npc.js): figures at the sites, G to talk.
import { grMount } from "../../shared/npc.js";

// Redwood Reach — the app: the menu, the walk (and the fire-road vehicle),
// the HUD, the job boards, the quest log with its skill gates, the field tins,
// the field lessons, the three scored activities, the map with layers and
// fast travel. Rules live in rw-career.js and rw-data.js (headless — see
// tools/check_redwood.mjs); this file wires input, the DOM and three.js.

const $ = (id) => document.getElementById(id);
const RW_RUNNER = "../smartcity/index.html";
const RW_EYE = 1.65;
const rwApp = {
  screen: "menu", scene: null, camera: null, renderer: null, world: null,
  x: 320, z: 612, yaw: 0, pitch: 0.04, driving: false, started: false,
  state: rwLoad(gtStorage()), near: null, activity: null, layers: new Set(RW_MAP_LAYERS.map((l) => l.id)),
};
// A station counts as complete the way every world's gates count it: one or
// more stars in the learner's records (the shared engine's snapshot).
const rwDone = (id) => !qmMissing({ stations: [id] }, qmCachedSnapshot(gtStorage())).length;
function rwPersist() { rwSave(gtStorage(), rwApp.state); }

// ---------------------------------------------------------------- toast
let rwToastT = null;
function rwToast(text, ms = 3200) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("on");
  clearTimeout(rwToastT);
  rwToastT = setTimeout(() => t.classList.remove("on"), ms);
}

// ---------------------------------------------------------------- scene
function rwInitScene() {
  const tierName = tcTierChoice().tier;
  const tier = tcTier(tierName);
  const renderer = new THREE.WebGLRenderer({ antialias: tierName !== "low", alpha: false });
  tcApplyRenderer(renderer, tier);
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("stage").appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 2400);
  const world = rwBuildWorld(scene, { tier: tierName, hour: 10 });
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  Object.assign(rwApp, { scene, camera, renderer, world, tierName });
  for (const id of rwApp.state.found) world.markFound(id);
  // The treasure layer's logbook pages and trail blazes (docs/treasures.md):
  // markers along the fire roads and foot trails, found by walking or driving
  // up to them; the field tins stay the world's own. It raycasts for itself.
  tzWatchWorld("redwood", { scene, THREE, pos: () => [rwApp.x, rwApp.z], camera: () => rwApp.camera, groundAt: rwHeightAt, size: 0.7, lift: 1.3 });
  // The characters at the sites (docs/consoles/GRIOT.md): a crew figure on each pad with a work/walk/break loop; G talks.
  rwApp.npc = grMount("redwood", {
    three: THREE, root: scene, sites: RW_SITES, groundAt: rwHeightAt, from: "redwood", page: ppHerePage(),
    pos: () => (rwApp.screen === "playing" && !rwApp.driving ? [rwApp.x, rwApp.z] : null),
    openLesson: (id) => { const fl = RW_FIELD_LESSONS.find((x) => x.id === id); if (fl) rwRunLesson(fl); },
    openQuest: () => rwOpenQuests(),
  });
  rwPlaceCamera();
  world.stream(rwApp.x, rwApp.z, { all: true });
  // For the headless checkers and the still captures.
  window.__redwoodTest = { app: rwApp, world, teleport: rwTeleport, stats: () => ({ ...world.stats(), render: { ...renderer.info.render } }), sites: RW_SITES };
}

function rwGround(x, z) { return rwHeightAt(x, z); }
function rwPlaceCamera() {
  const c = rwApp.camera;
  const eye = rwApp.driving ? 2.4 : RW_EYE;
  c.position.set(rwApp.x, rwGround(rwApp.x, rwApp.z) + eye, rwApp.z);
  c.rotation.order = "YXZ";
  c.rotation.set(rwApp.pitch, rwApp.yaw, 0);
  // The UTV sits under the driver: its centre a metre ahead of the eye so the hood and the light bar read in the view.
  rwApp.world?.vehicle?.place(rwApp.x - Math.sin(rwApp.yaw) * 1.1, rwApp.z - Math.cos(rwApp.yaw) * 1.1, rwApp.yaw, rwApp.driving, c.position.y - eye);
}
/** Where a traveller lands at a site: in its cleared yard, south of the buildings, facing them. */
function rwArrival(s) { return [s.position[0], s.position[1] + s.pad * 0.75, 0]; }
function rwTeleport(x, z, yaw = rwApp.yaw) {
  rwApp.x = Math.max(RW_BOUNDS.minX + 5, Math.min(RW_BOUNDS.maxX - 5, x));
  rwApp.z = Math.max(RW_BOUNDS.minZ + 5, Math.min(RW_BOUNDS.maxZ - 5, z));
  rwApp.yaw = yaw;
  if (rwApp.camera) { rwPlaceCamera(); rwApp.world.stream(rwApp.x, rwApp.z, { all: true }); }
}

// ---------------------------------------------------------------- input
const rwKeys = new Set();
const rwEdge = new Set();
window.addEventListener("keydown", (e) => {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  if (!e.repeat) rwEdge.add(e.code);
  rwKeys.add(e.code);
  if (e.code === "Escape") rwCloseAll();
});
window.addEventListener("keyup", (e) => rwKeys.delete(e.code));
window.addEventListener("blur", () => rwKeys.clear());
// Drag to look (mouse and touch alike), anywhere on the stage.
let rwDrag = null;
$("stage").addEventListener("pointerdown", (e) => { rwDrag = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
window.addEventListener("pointermove", (e) => {
  if (!rwDrag || e.pointerId !== rwDrag.id || rwApp.screen !== "playing") return;
  rwApp.yaw -= (e.clientX - rwDrag.x) * 0.005;
  rwApp.pitch = Math.max(-1.2, Math.min(1.0, rwApp.pitch - (e.clientY - rwDrag.y) * 0.004));
  rwDrag.x = e.clientX; rwDrag.y = e.clientY;
});
window.addEventListener("pointerup", (e) => { if (rwDrag?.id === e.pointerId) rwDrag = null; });
const rwPad = createGamepad({ getGamepads: () => { const all = navigator.getGamepads ? navigator.getGamepads() : []; return all?.[0] ? [all[0]] : []; }, bindings: [], axisBindings: [] });
const rwPadPrev = {};
let rwPadSnap = null;
function rwPollPad(dt) {
  rwPadSnap = rwPad.poll(dt);
  const b = rwPadSnap?.buttons ?? [];
  for (const i of [0, 1, 3]) { const now = !!b[i]?.pressed; if (now && !rwPadPrev[i]) rwEdge.add(`Pad${i}`); rwPadPrev[i] = now; }
}
const rwAxis = (i) => { const a = rwPadSnap?.axes?.[i]?.value ?? 0; return Math.abs(a) > GAMEPAD_DEADZONE ? a : 0; };
let rwStick = { active: false, dx: 0, dy: 0 };

// ---------------------------------------------------------------- screens
function rwShow(id) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== id;
  rwApp.screen = id ? id.replace("scr-", "") : "playing";
  $("hud").hidden = !rwApp.started || !!id;
  rwTouch?.show?.(!id && rwApp.started);
}
function rwCloseAll() {
  if (rwApp.screen === "question") return;
  if (rwApp.started) rwShow(null); else rwShow("scr-menu");
}
for (const b of document.querySelectorAll("[data-close]")) b.addEventListener("click", rwCloseAll);

let rwTouch = null;
function rwStart() {
  if (!rwApp.scene) rwInitScene();
  if (!rwTouch) {
    rwTouch = tcMountTouch({
      hint: "Drag the stick to walk; drag the view to look. Use opens a board, a tin or a lesson.",
      buttons: [
        { id: "tc-use", label: "Use", aria: "Use", onDown: () => rwEdge.add("KeyE") },
        { id: "tc-map", label: "Map", aria: "Map", onDown: () => rwEdge.add("KeyM") },
        { id: "tc-drive", label: "Drive", aria: "Fire-road vehicle", onDown: () => rwEdge.add("KeyR") },
        { id: "tc-log", label: "Log", aria: "Quest log", onDown: () => rwEdge.add("KeyJ") },
      ],
    });
    rwStick = rwTouch.stick;
    tcMountQuality($("hud-stats"), (q) => tcApplyRenderer(rwApp.renderer, tcTier(q)));
  }
  rwApp.started = true;
  rwShow(null);
  if (!rwApp.state.visited.length) rwToast("Welcome to Redwood Reach. Report to the fire station's job board — press E there.");
}
$("menu-start").addEventListener("click", rwStart);
// The start screen's background loop, recorded in the old growth (console
// CINEMA, shared/cinema.js, docs/home-backgrounds.md): muted, only while the
// menu is on screen, poster only under reduced motion or Save-Data.
cnMount($("scr-menu"), "start-redwood", { scrim: "linear-gradient(180deg,rgba(5,10,16,.55),rgba(5,10,16,.78))" });
$("menu-map").addEventListener("click", () => { if (!rwApp.scene) rwInitScene(); rwOpenMap(); });
$("menu-quests").addEventListener("click", () => rwOpenQuests());
$("btn-map").addEventListener("click", () => rwOpenMap());
$("btn-quests").addEventListener("click", () => rwOpenQuests());
$("btn-drive").addEventListener("click", () => rwToggleDrive());

function rwToggleDrive() {
  rwApp.driving = !rwApp.driving;
  $("btn-drive").textContent = rwApp.driving ? "Walk" : "Drive";
  if (rwApp.camera) rwPlaceCamera();
  rwToast(rwApp.driving ? "Fire-road vehicle: seatbelt on, lights on, stay on the graded road." : "On foot.");
}

// ---------------------------------------------------------------- nearby
let rwQmNear = null;
/** Walking up to a board with a locked gated quest: the lock toast with the stations to complete, once per approach. */
function rwQmApproach(near) {
  const site = near?.kind === "board" ? near.site : null;
  if (!site) { rwQmNear = null; return; }
  if (rwQmNear === site.id) return;
  rwQmNear = site.id;
  const locked = RW_GATED.find((g) => g.site === site.id && !qmIsOpen(g.gate, qmSnapshot()));
  if (locked) qmLockToast(locked, { from: "redwood", page: ppHerePage(), link: { runner: RW_RUNNER, siteId: site.id } });
}

function rwNearest() {
  const { x, z } = rwApp;
  for (const s of RW_SITES) {
    const bz = s.position[1] - s.pad * 0.5;
    if (Math.hypot(x - s.position[0], z - bz) < 9) return { kind: "board", site: s };
  }
  for (const e of RW_EGGS) {
    if (rwApp.state.found.includes(e.id)) continue;
    if (Math.hypot(x - e.position[0], z - e.position[1]) < 4) return { kind: "egg", egg: e };
  }
  const act = rwApp.activity;
  if (act) {
    const w = act.def.waypoints[act.i];
    if (w && Math.hypot(x - w.at[0], z - w.at[1]) < 14) return { kind: "waypoint", act, w };
  }
  return null;
}
function rwSiteAt(x, z) {
  let best = null, bd = Infinity;
  for (const s of RW_SITES) { const d = Math.hypot(x - s.position[0], z - s.position[1]); if (d < bd) { bd = d; best = s; } }
  return { site: best, d: bd };
}

// -------------------------------------------------------------- job board
function rwOpenBoard(site) {
  lkSiteHeading($("jb-site"), site);
  $("jb-blurb").textContent = site.blurb;
  $("jb-trade").textContent = `Trades here: ${site.trade}. Finish a station and come back — this board counts it.`;
  const link = (id) => lkStationLink(id, { runner: RW_RUNNER, from: "redwood", page: ppHerePage(), siteId: site.id });
  lkRenderStations($("jb-stations"), site.stations, link, { done: rwDone });
  const single = $("jb-single");
  single.textContent = "";
  if (site.stations.length === 1) {
    const a = document.createElement("a");
    a.className = "btn primary"; a.href = link(site.stations[0]); a.textContent = `Start ${lkStationLabel(site.stations[0])}`;
    single.appendChild(a);
  }
  const ql = $("jb-quests");
  ql.textContent = "";
  for (const q of RW_SIDE_QUESTS.filter((x) => x.site === site.id)) ql.appendChild(rwQuestRow(q));
  if (!ql.children.length) ql.innerHTML = "<li>None posted here.</li>";
  // The shared lock rows for the gated quests posted here (padlock, reason, a link to each station).
  document.getElementById("jb-qm")?.remove();
  const qmBox = document.createElement("div"); qmBox.id = "jb-qm";
  ql.insertAdjacentElement("afterend", qmBox);
  qmBoardRows(qmBox, RW_GATED.filter((g) => g.site === site.id), { from: "redwood", page: ppHerePage(), link: { runner: RW_RUNNER, siteId: site.id }, heading: "Skill locks here", done: (id) => rwQuestStatus(rwApp.state, RW_SIDE_QUESTS.find((q) => q.id === id), rwDone) === "done" });
  const ll = $("jb-lessons");
  ll.textContent = "";
  for (const fl of RW_FIELD_LESSONS.filter((l) => l.site === site.id)) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.textContent = `${rwApp.state.lessons.includes(fl.id) ? "✓ " : ""}${fl.title} · ${fl.minutes} min · ${fl.trade}`;
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = "Take it";
    b.addEventListener("click", () => rwRunLesson(fl));
    li.append(span, b);
    ll.appendChild(li);
  }
  if (!ll.children.length) ll.innerHTML = "<li>None at this site.</li>";
  rwShow("scr-board");
}

function rwQuestRow(q) {
  const li = document.createElement("li");
  const st = rwQuestStatus(rwApp.state, q, rwDone);
  const name = document.createElement("span");
  name.textContent = `${st === "done" ? "✓ " : st === "locked" ? "🔒 " : ""}${q.title}`;
  li.appendChild(name);
  if (st === "locked" && q.gate) {
    const lock = document.createElement("span");
    lock.className = "lock";
    lock.textContent = `${q.gate.note} `;
    for (const id of rwGateMissing(q.gate, rwDone)) {
      const a = document.createElement("a");
      a.href = lkStationLink(id, { runner: RW_RUNNER, from: "redwood", page: ppHerePage(), siteId: q.site });
      a.textContent = lkStationLabel(id);
      lock.appendChild(a);
    }
    li.appendChild(lock);
  } else if (st !== "done") {
    const s = document.createElement("span");
    s.className = "note";
    const p = rwApp.state.quests[q.id]?.step ?? 0;
    s.textContent = q.steps[p]?.text ?? "";
    li.appendChild(s);
  }
  return li;
}

// ------------------------------------------------------------- quest log
function rwOpenQuests() {
  const main = $("ql-main"), side = $("ql-side"), skills = $("ql-skills"), acts = $("ql-acts");
  main.textContent = ""; side.textContent = ""; skills.textContent = ""; acts.textContent = "";
  for (const q of RW_MAIN_ARC) main.appendChild(rwQuestRow(q));
  for (const q of RW_SIDE_QUESTS) side.appendChild(rwQuestRow(q));
  const need = new Map();
  for (const q of RW_SIDE_QUESTS) for (const id of rwGateMissing(q.gate, rwDone)) need.set(id, [...(need.get(id) ?? []), q.title]);
  for (const [id, titles] of need) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = lkStationLink(id, { runner: RW_RUNNER, from: "redwood", page: ppHerePage() });
    a.textContent = lkStationLabel(id);
    const s = document.createElement("span"); s.className = "note"; s.textContent = `unlocks ${titles.join(", ")}`;
    li.append(a, s); skills.appendChild(li);
  }
  if (!need.size) skills.innerHTML = "<li class=\"done\">Every side quest is unlocked.</li>";
  for (const a of RW_ACTIVITIES) {
    const li = document.createElement("li");
    const best = rwApp.state.activities[a.id]?.best;
    const s = document.createElement("span"); s.textContent = `${a.name}${best != null ? ` · best ${best}` : ""}`;
    const b = document.createElement("button"); b.className = "btn"; b.textContent = "Start";
    b.addEventListener("click", () => rwStartActivity(a.id));
    li.append(s, b); acts.appendChild(li);
  }
  $("ql-tins").textContent = `${rwApp.state.found.length} of ${RW_EGGS.length} field tins found · ${rwApp.state.badges.length} badges · ${rwApp.state.cosmetics.length} cosmetics.`;
  rwShow("scr-quests");
}

// ------------------------------------------------------------ activities
function rwStartActivity(id) {
  const def = RW_ACTIVITIES.find((a) => a.id === id);
  rwApp.activity = { def, i: 0, answers: [] };
  if (!rwApp.started) rwStart();
  const s = rwSite(def.site);
  const w = def.waypoints[0];
  rwTeleport(s.position[0], s.position[1] + s.pad * 0.3, Math.atan2(-(w.at[0] - s.position[0]), -(w.at[1] - s.position[1])));
  rwShow(null);
  rwToast(`${def.name}: ${def.blurb}`, 5200);
}
function rwAsk({ eyebrow, title, text, options, onPick, note = "" }) {
  $("q-eyebrow").textContent = eyebrow; $("q-title").textContent = title; $("q-text").textContent = text; $("q-note").textContent = note;
  const wrap = $("q-options");
  wrap.textContent = "";
  options.forEach((o, i) => {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = o;
    b.addEventListener("click", () => onPick(i));
    wrap.appendChild(b);
  });
  rwShow("scr-question");
  wrap.firstChild?.focus();
}
function rwWaypoint(act, w) {
  rwAsk({
    eyebrow: `${act.def.name} · point ${act.i + 1} of ${act.def.waypoints.length}`, title: "Call the safe move", text: w.q, options: w.options,
    onPick: (i) => {
      act.answers.push(i);
      act.i += 1;
      rwShow(null);
      rwToast(i === w.answer ? "That's the crew's call." : `The crew's call: ${w.options[w.answer]}`);
      if (act.i >= act.def.waypoints.length) {
        const r = rwScoreActivity(act.def.id, act.answers);
        rwRecordActivity(rwApp.state, act.def.id, r.score);
        rwAdvance(rwApp.state, { type: "activity", activity: act.def.id }, rwDone).forEach(rwQuestDone);
        rwApp.activity = null;
        rwPersist();
        rwToast(`${act.def.name} complete — ${r.correct} of ${r.total} safe calls, score ${r.score}.`, 5200);
      }
    },
  });
}

// ------------------------------------------------------------- lessons
// Redwood's lessons in the shared K-12 shape: one passport award kind and one
// Field Notes badge across every world (WebXR/shared/field-kiosk.js).
const RW_K2 = RW_FIELD_LESSONS.map((l) => k2AdaptLesson(l, "redwood"));
function rwRunLesson(fl) {
  let i = 0;
  const next = () => {
    if (i < fl.steps.length) {
      rwAsk({ eyebrow: `Field lesson · ${fl.trade}`, title: fl.title, text: fl.steps[i], options: [i + 1 < fl.steps.length ? "Next" : "To the check question"], onPick: () => { i += 1; next(); }, note: i === 0 ? fl.tradeLine : "" });
      return;
    }
    rwAsk({
      eyebrow: `Field lesson · check`, title: fl.title, text: fl.check.q, options: fl.check.options,
      onPick: (k) => {
        if (k === fl.check.answer) {
          if (!rwApp.state.lessons.includes(fl.id)) { rwApp.state.lessons.push(fl.id); rwApp.state.xp += 30; rwPersist(); }
          tzLessonAnswered(fl.id); // a quiet treasure (docs/treasures.md)
          const k2 = k2RecordLesson(RW_K2.find((x) => x.id === fl.id), RW_K2);
          rwToast(k2.badge ? `Right. ${K2_FIELD_NOTES_BADGE.name} badge earned: ${k2.notes.done} lessons answered in the Reach.`
            : "Right. Lesson logged" + (k2.first ? " on your passport" : "") + " — it ties to the K-12 station " + lkStationLabel(fl.k12) + ".");
          rwShow(null);
        } else { rwToast("Not quite — read the steps again."); i = 0; next(); }
      },
    });
  };
  next();
}

// ------------------------------------------------------------ quests
function rwQuestDone(q) {
  rwToast(`Quest complete: ${q.title}${q.reward?.badge ? ` — badge "${q.reward.badge}"` : ""}${q.reward?.cosmetic ? ` — ${q.reward.cosmetic}` : ""}.`, 5200);
}
function rwCheckReturns() {
  qmInvalidate();
  const paid = ppCompleteReturns("redwood", RW_SITES, {
    pay: (r) => (r.passed ? { reputation: 5 + 3 * (r.stars | 0), credits: 20 + 10 * (r.stars | 0) } : { reputation: 1, credits: 5 }),
    advance: (r) => { if (r.passed) rwAdvance(rwApp.state, { type: "station", station: r.simId }, rwDone).forEach(rwQuestDone); },
  });
  for (const x of paid) if (!x.duplicate) rwToast(`${x.record.simName ?? x.record.simId}: ${x.record.passed ? "passed" : "logged"} at ${x.site.name}.`, 4200);
  // Stations passed elsewhere still count for this world's quest steps.
  for (const q of RW_MAIN_ARC) for (const s of q.steps) if (s.type === "station" && rwDone(s.station)) rwAdvance(rwApp.state, { type: "station", station: s.station }, rwDone).forEach(rwQuestDone);
  rwPersist();
}
rwCheckReturns();
window.addEventListener("pageshow", (e) => { if (e.persisted) rwCheckReturns(); });

// ------------------------------------------------------------------ map
const rwMapImg = (() => {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 256;
  const g = c.getContext("2d");
  if (!g) return c;
  const img = g.createImageData(256, 256);
  for (let j = 0; j < 256; j += 1) for (let i = 0; i < 256; i += 1) {
    const x = RW_BOUNDS.minX + (i + 0.5) * 16, z = RW_BOUNDS.minZ + (j + 0.5) * 16;
    const h = rwHeightAt(x, z), k = (j * 256 + i) * 4;
    const shade = Math.max(0, Math.min(1, (rwHeightAt(x - 16, z - 16) - h) / 20 + 0.6));
    let r, gg, b;
    if (rwIsWater(x, z)) { r = 60; gg = 120; b = 150; } else { r = 50 + h * 0.25; gg = 76 + h * 0.18; b = 40 + h * 0.1; }
    img.data[k] = r * shade + 20; img.data[k + 1] = gg * shade + 20; img.data[k + 2] = b * shade + 16; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
})();
function rwToMap(x, z, size) { return [((x - RW_BOUNDS.minX) / (RW_BOUNDS.maxX - RW_BOUNDS.minX)) * size, ((z - RW_BOUNDS.minZ) / (RW_BOUNDS.maxZ - RW_BOUNDS.minZ)) * size]; }
function rwDrawMap(canvas, { mini = false } = {}) {
  const g = canvas.getContext("2d");
  if (!g) return;
  const S = canvas.width;
  g.save();
  if (mini) {
    // The minimap: a 1 km window around the player.
    const span = 1000, [px, pz] = [rwApp.x, rwApp.z];
    const sx = ((px - span / 2 - RW_BOUNDS.minX) / 16), sz = ((pz - span / 2 - RW_BOUNDS.minZ) / 16);
    g.drawImage(rwMapImg, sx, sz, span / 16, span / 16, 0, 0, S, S);
    const tm = (x, z) => [((x - (px - span / 2)) / span) * S, ((z - (pz - span / 2)) / span) * S];
    g.strokeStyle = "#d8c08a"; g.lineWidth = 1.5;
    for (const r of RW_ROADS) { g.beginPath(); r.points.forEach(([x, z], i) => { const [a, b] = tm(x, z); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); }
    g.fillStyle = "#e0a040";
    for (const s of RW_SITES) { const [a, b] = tm(...s.position); g.fillRect(a - 3, b - 3, 6, 6); }
    const w = rwApp.activity?.def.waypoints[rwApp.activity.i];
    if (w) { const [a, b] = tm(...w.at); g.strokeStyle = "#8fd06a"; g.lineWidth = 2; g.beginPath(); g.arc(a, b, 6, 0, 7); g.stroke(); }
    g.translate(S / 2, S / 2); g.rotate(-rwApp.yaw); g.fillStyle = "#fff";
    g.beginPath(); g.moveTo(0, -7); g.lineTo(5, 5); g.lineTo(-5, 5); g.closePath(); g.fill();
    g.restore();
    return;
  }
  g.drawImage(rwMapImg, 0, 0, S, S);
  const L = rwApp.layers;
  const line = (pts, color, w, dash = []) => { g.strokeStyle = color; g.lineWidth = w; g.setLineDash(dash); g.beginPath(); pts.forEach(([x, z], i) => { const [a, b] = rwToMap(x, z, S); i ? g.lineTo(a, b) : g.moveTo(a, b); }); g.stroke(); g.setLineDash([]); };
  if (L.has("water")) line(RW_RIVER, "#6ac0d8", 3);
  if (L.has("roads")) { for (const r of RW_ROADS) line(r.points, "#e8d4a0", 2.5); line(RW_FUEL_BREAK, "#c8a050", 2, [6, 4]); }
  if (L.has("trails")) for (const t of RW_TRAILS) line(t.points, "#c89a70", 1.5, [3, 3]);
  g.font = "600 13px Barlow, Arial, sans-serif";
  if (L.has("sites")) for (const s of RW_SITES) {
    const [a, b] = rwToMap(...s.position, S);
    g.fillStyle = rwApp.state.visited.includes(s.id) ? "#e0a040" : "#a08a60"; g.fillRect(a - 5, b - 5, 10, 10);
    g.fillStyle = "#fff"; g.fillText(s.name, a + 8, b + 4);
  }
  if (L.has("lessons")) for (const fl of RW_FIELD_LESSONS) {
    const s = rwSite(fl.site); const [a, b] = rwToMap(s.position[0] + 30, s.position[1] - 30, S);
    g.fillStyle = rwApp.state.lessons.includes(fl.id) ? "#8fd06a" : "#4fa0ff"; g.beginPath(); g.arc(a, b, 4, 0, 7); g.fill();
  }
  if (L.has("quests")) for (const q of RW_SIDE_QUESTS) {
    const s = rwSite(q.site); const [a, b] = rwToMap(s.position[0] - 40, s.position[1] + 30, S);
    const st = rwQuestStatus(rwApp.state, q, rwDone);
    if (st === "done") { g.fillStyle = "#8fd06a"; g.fillText("✓", a, b); } else qmDrawPin(g, a, b - 4, st !== "locked");
  }
  if (L.has("found")) for (const id of rwApp.state.found) {
    const e = RW_EGGS.find((x) => x.id === id); if (!e) continue;
    const [a, b] = rwToMap(...e.position, S); g.fillStyle = "#3adab0"; g.fillRect(a - 2, b - 2, 4, 4);
  }
  const [pa, pb] = rwToMap(rwApp.x, rwApp.z, S);
  g.fillStyle = "#fff"; g.beginPath(); g.arc(pa, pb, 5, 0, 7); g.fill();
  g.restore();
}
function rwOpenMap() {
  const lw = $("map-layers");
  lw.textContent = "";
  for (const l of RW_MAP_LAYERS) {
    const lab = document.createElement("label");
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.checked = rwApp.layers.has(l.id);
    cb.addEventListener("change", () => { cb.checked ? rwApp.layers.add(l.id) : rwApp.layers.delete(l.id); rwDrawMap($("map-canvas")); });
    lab.append(cb, document.createTextNode(l.label));
    lw.appendChild(lab);
  }
  const tv = $("map-travel");
  tv.textContent = "";
  for (const s of RW_SITES) {
    const b = document.createElement("button");
    b.className = "btn"; b.textContent = s.name;
    const ok = rwApp.state.visited.includes(s.id);
    b.disabled = !ok;
    b.title = ok ? `Travel to ${s.name}` : "Walk or drive there once to unlock fast travel";
    b.addEventListener("click", () => { if (!rwApp.started) rwStart(); rwTeleport(...rwArrival(s)); rwShow(null); rwToast(`At ${s.name}.`); });
    tv.appendChild(b);
  }
  rwDrawMap($("map-canvas"));
  const ll = $("map-lessons");
  if (ll) {
    ll.textContent = "";
    k2RenderLessonList(ll, RW_K2, lkStationLink);
    const notes = k2FieldNotes("redwood", RW_K2);
    const p = document.createElement("p"); p.className = "note";
    p.textContent = `Field Notes: ${notes.done} of ${notes.total} lessons on your passport${notes.earned ? " — badge earned" : ` (badge at ${notes.need})`}.`;
    ll.appendChild(p);
  }
  rwShow("scr-map");
}

// ---------------------------------------------------------------- loop
let rwLast = performance.now();
let rwHudT = 0;
function rwFrame(now) {
  requestAnimationFrame(rwFrame);
  const dt = Math.min(0.05, (now - rwLast) / 1000);
  rwLast = now;
  rwPollPad(dt);
  if (rwApp.screen === "playing" && rwApp.world) rwTick(dt);
  if (rwApp.world && rwApp.renderer) {
    rwApp.world.update(dt, rwApp.camera);
    rwApp.npc?.animate(now / 1000, dt);
    rwApp.renderer.render(rwApp.scene, rwApp.camera);
  }
  rwEdge.clear();
}

function rwTick(dt) {
  if (rwEdge.has("KeyM")) { rwOpenMap(); return; }
  if (rwEdge.has("KeyJ")) { rwOpenQuests(); return; }
  if (rwEdge.has("KeyR") || rwEdge.has("Pad3")) rwToggleDrive();
  if (rwEdge.has("KeyT")) { const band = rwApp.world.setHour(rwApp.world.hour + 3); rwApp.world.band = band; rwToast(`The clock moves on — ${band}.`); }
  let fwd = 0, strafe = 0, turn = 0;
  if (rwKeys.has("KeyW") || rwKeys.has("ArrowUp")) fwd += 1;
  if (rwKeys.has("KeyS") || rwKeys.has("ArrowDown")) fwd -= 1;
  if (rwKeys.has("KeyA")) strafe -= 1;
  if (rwKeys.has("KeyD")) strafe += 1;
  if (rwKeys.has("ArrowLeft")) turn += 1;
  if (rwKeys.has("ArrowRight")) turn -= 1;
  fwd -= rwAxis(1); strafe += rwAxis(0); turn -= rwAxis(2) * 1.2;
  rwApp.pitch = Math.max(-1.2, Math.min(1.0, rwApp.pitch - rwAxis(3) * dt * 1.5));
  if (rwStick.active) { fwd -= rwStick.dy; strafe += rwStick.dx; }
  rwApp.yaw += turn * dt * 1.6;
  const speed = rwApp.driving ? 16 : (rwKeys.has("ShiftLeft") || rwKeys.has("ShiftRight") ? 7 : 3.6);
  const sx = Math.sin(rwApp.yaw), cz = Math.cos(rwApp.yaw);
  const mag = Math.min(1, Math.hypot(fwd, strafe));
  if (mag > 0.05) {
    const k = (speed * dt) / Math.max(1, Math.hypot(fwd, strafe));
    const nx = rwApp.x + (-sx * fwd + cz * strafe) * k, nz = rwApp.z + (-cz * fwd - sx * strafe) * k;
    // Walkers and the vehicle stay out of the channel and the sea.
    const hit = (x, z) => rwApp.world.blocked(x, z, rwApp.driving ? 1.4 : 0.7);
    // Slide along a trunk rather than stopping dead: try the full step, then each axis.
    let tx = nx, tz = nz;
    if (hit(tx, tz)) { if (!hit(nx, rwApp.z)) tz = rwApp.z; else if (!hit(rwApp.x, nz)) tx = rwApp.x; else { tx = rwApp.x; tz = rwApp.z; } }
    if (!rwIsWater(tx, tz) && (tx !== rwApp.x || tz !== rwApp.z) && nx > RW_BOUNDS.minX + 4 && nx < RW_BOUNDS.maxX - 4 && nz > RW_BOUNDS.minZ + 4 && nz < RW_BOUNDS.maxZ - 4) { rwApp.x = tx; rwApp.z = tz; }
  }
  rwPlaceCamera();

  const near = rwNearest();
  rwApp.near = near;
  rwQmApproach(near);
  const prompt = $("hud-prompt");
  if (near) {
    prompt.hidden = false;
    prompt.textContent = near.kind === "board" ? `E / Use — ${near.site.name} job board` : near.kind === "egg" ? "E / Use — a field tin is tucked here" : `E / Use — ${near.act.def.name}, point ${near.act.i + 1}`;
  } else prompt.hidden = true;
  if ((rwEdge.has("KeyE") || rwEdge.has("Pad0")) && near) {
    if (near.kind === "board") rwOpenBoard(near.site);
    else if (near.kind === "egg") {
      const r = rwFind(rwApp.state, near.egg.id);
      rwApp.world.markFound(near.egg.id);
      rwAdvance(rwApp.state, { type: "find", egg: near.egg.id }, rwDone);
      rwPersist();
      rwToast(`${near.egg.title}: "${near.egg.lesson}" — from ${lkStationLabel(near.egg.cites.stationId)}.${r.setDone ? " Set complete: badge earned!" : ""}`, 6500);
    } else rwWaypoint(near.act, near.w);
    return;
  }

  // Arriving at a site: visit, unlock fast travel, advance goto steps.
  const { site, d } = rwSiteAt(rwApp.x, rwApp.z);
  if (site && d < site.pad + 10) {
    if (rwVisit(rwApp.state, site.id)) rwToast(`${site.name} — fast travel unlocked.`);
    const fin = rwAdvance(rwApp.state, { type: "goto", site: site.id }, rwDone);
    fin.forEach(rwQuestDone);
    if (fin.length || rwApp.state.visited.length) rwPersist();
  }

  rwHudT -= dt;
  if (rwHudT <= 0) {
    rwHudT = 0.25;
    $("hud-site").querySelector(".n").textContent = site && d < site.pad + 120 ? site.name : "Redwood Reach";
    const h = rwApp.world.hour;
    $("hud-site").querySelector(".sub").textContent = `${rwApp.driving ? "Fire-road vehicle" : "On foot"} · ${site ? `${Math.round(d)} m from ${site.name}` : ""}`;
    const obj = rwCurrentObjective(rwApp.state, rwDone);
    const act = rwApp.activity;
    $("obj-text").textContent = act ? `${act.def.name}: head to point ${act.i + 1} (green ring on the minimap).` : obj ? `${obj.quest.title} — ${obj.step.text}` : "Main arc complete. Side quests and tins remain.";
    $("stat-clock").textContent = `${String(Math.floor(h)).padStart(2, "0")}:00 · ${rwApp.world.band}`;
    $("stat-tins").textContent = `Tins ${rwApp.state.found.length}/${RW_EGGS.length}`;
    $("stat-xp").textContent = `${rwApp.state.xp} XP`;
    rwDrawMap($("minimap"), { mini: true });
  }
}
requestAnimationFrame(rwFrame);

// ----------------------------------------------------- deep links (?site=)
{
  const q = new URLSearchParams(location.search);
  const back = ppReturnSite(location.hash, location.search);
  const want = q.get("site") || back;
  const s = want ? rwSite(want) : null;
  if (s) { rwStart(); rwTeleport(...rwArrival(s)); if (!q.get("site")) rwOpenBoard(s); }
  else rwShow("scr-menu");
}

gdMount();
ctlMount({
  world: "Redwood Reach", quality: true,
  unique: [
    { label: "Jog", keys: ["Shift"], pad: "—", touch: "—" },
    { label: "Fire-road vehicle", keys: ["R"], pad: "Y", touch: "Drive button" },
    { label: "Quest log", keys: ["J"], pad: "—", touch: "Quests button" },
    { label: "Advance the clock", keys: ["T"], pad: "—", touch: "—" },
    { label: "Talk to a crew member at a site", keys: ["G"], pad: "—", touch: "Talk button" },
    { label: "Look around for treasure markers", keys: ["L"], pad: "—", touch: "—" },
  ],
});
// The shared "Side games" chip and quest-log panel: every gated quest here, open rows first, then the Skills to unlock roll-up.
qmMountSideGames({ world: "redwood", worldName: "Redwood Reach", items: RW_GATED, from: "redwood", page: ppHerePage() });
