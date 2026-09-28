import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
// Hidden treasures (shared/treasures.js, docs/treasures.md).
import { tzWatchWorld } from "../../shared/treasures.js";
import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor } from "../../shared/input.js";
import { tcTier, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { TrainingRecords } from "../../shared/records.js";
import { ppAward, ppMarkBoard, ppBoardDone, ppProgressChip, ppReturnSite, ppHerePage, ppCompleted } from "../../shared/passport.js";
import { lkRenderStations, lkSiteHeading, lkStationLink } from "../../shared/links.js";
import { k2DrawFieldLayer } from "../../shared/field-lessons.js";
import { DV_SITES, DV_LANDMARKS, DV_ZONES, DEEP_DEPTH_RANGE, dvZoneAt, dvFloorY } from "./seabed.js";
import {
  dvStepDiver, dvStepRov, dvReserveStep, dvReserveLabel, dvStepBuddy, dvBuddyLine, dvAscentLines, dvNearestAscentLine,
  dvAdvanceClock, dvMissionLink, dvNearestPlace, dvDepthFraction, DV_SURFACE_Y,
} from "./dive-sim.js";
import {
  dvCareerState, dvAwardDiveReward, dvCollectDiveReturns, dvSiteProgress, dvIsCraftUnlocked, dvIsAscentUnlocked,
} from "./dive-career.js";
import { dvRegisterDives, dvDiveState, dvOnDiveStep, dvOnDiveDone, dvAdvanceDives, dvNoteStationReturn } from "./dive-engine.js";
import { DV_DIVES } from "./dives-select.js";
import { DV_ACTIVITIES } from "./dives.js";
import { dvStartActivity, dvStepActivity, dvRecordActivityScore, dvBestActivityScore } from "./activities.js";
import { dvMapLines, dvMapZones, dvMapLandmarks, dvMapSites, dvWorldToMap, dvMapFieldLessons } from "./dive-map.js";
import { dvBuildWorld } from "./world.js";

// The Deep — the app: the menu, the dive slate HUD (a reserve bar and a
// word, never a number; no depth readout anywhere), keyboard/touch/gamepad
// input for swimming and ROV piloting, the map, the activities board and the
// render loop. Every rule that must run the same way twice lives in
// dive-sim.js, dive-career.js, dive-engine.js, activities.js and dive-map.js
// (pure, headless — see tools/check_underwater_game.mjs); this file only
// wires input, the DOM and three.js around them.

const $ = (id) => document.getElementById(id);
const dvStore = (() => { try { return window.localStorage; } catch { return null; } })();
const DV_PLACES = [...DV_SITES, ...DV_LANDMARKS];
const DV_ASCENT = dvAscentLines(DV_SITES);

/** `?site=<id>` names the site the dive starts beside; anything else starts
 *  at the pier dive station. */
export function dvStartSiteFrom(search, sites = DV_SITES) {
  let params = null;
  try { params = new URLSearchParams(search || ""); } catch { return null; }
  const site = params.get("site");
  return site ? sites.find((s) => s.id === site) ?? null : null;
}
// A return from a finished station lands on `#site=<id>` (docs/interop.md).
const dvReturnSiteId = typeof window !== "undefined" ? ppReturnSite(window.location?.hash) : null;
const dvStartSite = (dvReturnSiteId ? DV_SITES.find((x) => x.id === dvReturnSiteId) : null)
  ?? dvStartSiteFrom(typeof window !== "undefined" ? window.location?.search : "") ?? DV_SITES[1] ?? DV_SITES[0];

const dvApp = {
  screen: "menu",
  scene: null, camera: null, renderer: null, world: null,
  mode: "swim",              // "swim" | "rov"
  cameraMode: "chase",
  diver: { x: dvStartSite.position[0] + 5, y: dvStartSite.position[1] + 2, z: dvStartSite.position[2] + 5, heading: 0, speed: 0, exertion: 0 },
  buddy: { x: dvStartSite.position[0] + 2, y: dvStartSite.position[1] + 2, z: dvStartSite.position[2] + 3, heading: 0 },
  rov: null,
  reserve: 1,
  hours: 9,
  nearSite: null, nearLandmark: null, nearAscent: null,
  interactPressed: false, rovPressed: false, ascendPressed: false,
  lastSite: null,
  activity: null,
  mapOpen: false,
  light: { band: "shallow", daylight: 1 },
};

// ------------------------------------------------------------------ toast

let dvToastTimer = null;
function dvToast(text, ms = 3200) {
  const el = $("toast");
  if (!el) return;
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(dvToastTimer);
  dvToastTimer = setTimeout(() => el.classList.remove("on"), ms);
}

// ------------------------------------------------------------------ keys

const dvKeys = new Set();
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  dvKeys.add(e.code);
  if (e.code === "KeyV") dvToggleCamera();
  if (e.code === "KeyM") dvToggleMap();
  if (e.code === "KeyE") dvApp.interactPressed = true;
  if (e.code === "KeyR") dvApp.rovPressed = true;
  if (e.code === "KeyU") dvApp.ascendPressed = true;
  if (e.code === "Escape") { if (dvApp.mapOpen) dvToggleMap(false); else if (dvApp.screen !== "menu") dvOpenScreen("game"); }
});
window.addEventListener("keyup", (e) => dvKeys.delete(e.code));
window.addEventListener("blur", () => dvKeys.clear());
const heldSwim = () => ({
  forward: (dvKeys.has("KeyW") || dvKeys.has("ArrowUp") ? 1 : 0) - (dvKeys.has("KeyS") || dvKeys.has("ArrowDown") ? 1 : 0),
  strafe: (dvKeys.has("KeyD") ? 1 : 0) - (dvKeys.has("KeyA") ? 1 : 0),
  turn: (dvKeys.has("ArrowRight") ? 1 : 0) - (dvKeys.has("ArrowLeft") ? 1 : 0),
  rise: (dvKeys.has("Space") ? 1 : 0) - (dvKeys.has("KeyC") ? 1 : 0),
  sprint: dvKeys.has("ShiftLeft") || dvKeys.has("ShiftRight"),
});

// ------------------------------------------------------------------ touch

// The shared touch layer (shared/touch.js). The map has its own HUD button.
let dvStick = { active: false, id: null, dx: 0, dy: 0 };
const dvTouch = { up: false, down: false, sprint: false };
function dvWireTouch() {
  const hold = (key) => ({ onDown: () => { dvTouch[key] = true; }, onUp: () => { dvTouch[key] = false; } });
  const t = tcMountTouch({
    hint: "Drag the stick to swim. Up and Down rise and sink, Fin sprints, E uses, View switches the camera.",
    buttons: [
      { id: "touch-interact", label: "E", aria: "Use", onDown: () => { dvApp.interactPressed = true; } },
      { id: "touch-up", label: "Up", aria: "Rise", ...hold("up") },
      { id: "touch-view", label: "View", aria: "Switch camera", onDown: () => dvToggleCamera() },
      { id: "touch-sprint", label: "Fin", aria: "Sprint", ...hold("sprint") },
      { id: "touch-down", label: "Down", aria: "Sink", ...hold("down") },
    ],
  });
  dvStick = t.stick;
  tcMountQuality($("hud-stats"), (q) => tcApplyRenderer(dvApp.renderer, tcTier(q)));
}

// ------------------------------------------------------------------ gamepad

const dvPad = createGamepad({ getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []), bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) dvToast(`Gamepad connected (${detectPadVendor(info.id)} labels).`); } });

// -------------------------------------------------------------- screens

function dvOpenScreen(name) {
  dvApp.screen = name;
  for (const id of ["scr-menu", "scr-jobboard", "scr-activities"]) $(id)?.toggleAttribute("hidden", true);
  $("hud")?.toggleAttribute("hidden", name !== "game");
  $("view-toggle")?.toggleAttribute("hidden", name !== "game");
  if (name === "menu") $("scr-menu")?.removeAttribute("hidden");
  if (name === "jobboard") $("scr-jobboard")?.removeAttribute("hidden");
  if (name === "activities") { dvRenderActivities(); $("scr-activities")?.removeAttribute("hidden"); }
}

function dvToggleCamera() { dvApp.cameraMode = dvApp.cameraMode === "chase" ? "first" : "chase"; $("view-toggle").textContent = dvApp.cameraMode === "chase" ? "First person (V)" : "Chase camera (V)"; }

function dvToggleMap(force) {
  dvApp.mapOpen = force ?? !dvApp.mapOpen;
  $("scr-map")?.toggleAttribute("hidden", !dvApp.mapOpen);
  if (dvApp.mapOpen) dvDrawFullMap();
}

// ------------------------------------------------------------------- ROV

function dvTryRov() {
  if (dvApp.mode === "rov") {
    // Recover: the diver takes over where the ROV was launched (its tether point).
    dvApp.mode = "swim";
    dvApp.world.rov.visible = false; dvApp.world.tether.visible = false;
    dvApp.rov = null;
    dvToast("ROV recovered to the stage.");
    return;
  }
  if (!dvApp.nearSite) { dvToast("Launch the ROV at a site: its stage is beside the job board."); return; }
  if (!dvIsCraftUnlocked("rov", dvStore)) { dvToast("The ROV is locked — raise your dive reputation to pilot it."); return; }
  dvApp.mode = "rov";
  dvApp.rov = { x: dvApp.diver.x, y: dvApp.diver.y, z: dvApp.diver.z, heading: dvApp.diver.heading, speed: 0, tether: [dvApp.diver.x, dvApp.diver.z] };
  dvApp.world.rov.visible = true; dvApp.world.tether.visible = true;
  dvToast("ROV launched — tether tended from here.");
}

// ------------------------------------------------------------ ascent line

function dvTryAscend() {
  if (dvApp.mode === "rov") { dvToast("Recover the ROV first (R)."); return; }
  const line = dvApp.nearAscent;
  if (!line) { dvToast("No ascent line within reach — every site has one beside its job board."); return; }
  dvApp.diver.y = DV_SURFACE_Y;
  dvApp.reserve = 1;
  dvToast("Up the ascent line to the surface — reserve topped up.");
}

// ------------------------------------------------------------- job board

function dvOpenJobBoard(site) {
  dvApp.lastSite = site;
  lkSiteHeading($("jb-title"), site);
  $("jb-zone").textContent = DV_ZONES.find((z) => z.id === site.zone)?.name ?? site.zone;
  const progress = dvSiteProgress(TrainingRecords.list(), site);
  $("jb-progress").textContent = progress.attempts
    ? `${progress.attempts} attempt${progress.attempts === 1 ? "" : "s"} · last run ${progress.lastStation ?? "—"}${progress.badgesEarned.length ? ` · badges: ${progress.badgesEarned.join(", ")}` : ""}`
    : "No attempts yet at this site.";
  $("jb-programmes").textContent = (site.programmes ?? []).length ? `Programme: ${site.programmes.join(", ")}` : "No training programme posted here yet.";
  // The programme chip and the board's done mark read only the passport.
  ppProgressChip($("jb-chip"), site.programmes?.[0] ?? null);
  $("jb-done")?.toggleAttribute("hidden", !ppBoardDone("underwater", site));
  // A board with several stations lists each with its own Start link (every
  // one routed by shared/links.js); "Start the station" stays for a board of one.
  const lkCount = lkRenderStations($("jb-stations"), site.stations, (id) => dvMissionLink(site, { station: id, page: ppHerePage() }), { done: ppCompleted });
  $("jb-launch")?.toggleAttribute("hidden", lkCount !== 1);
  dvOpenScreen("jobboard");
}
$("jb-launch")?.addEventListener("click", () => {
  const site = dvApp.lastSite;
  if (!site || !(site.stations ?? []).length) return;
  dvToast(`Launching ${site.name}…`);
  window.location.href = dvMissionLink(site, { page: ppHerePage() });
});
$("jb-close")?.addEventListener("click", () => dvOpenScreen("game"));

// ------------------------------------------------------------- returns

function dvCheckDiveReturns() {
  const results = dvCollectDiveReturns(TrainingRecords.list(), DV_SITES, { storage: dvStore });
  for (const r of results) {
    dvToast(`${r.site.name}: ${r.entry.passed ? "passed" : "logged"} — +${r.award.reputationGain} reputation, +${r.award.creditsGain} survey credits.`, 4200);
    dvNoteStationReturn(r.site.id, { storage: dvStore });
    dvNoteStationReturn(r.entry.simId, { storage: dvStore });
    for (const u of r.award.unlocked) dvToast(`Unlocked: ${u.label}`, 4200);
    // Into the one ledger, source kept, once per attempt id; dive-career.js
    // has already added the gain to the Deep's own store, so it is `native`.
    ppAward("underwater", { reputation: r.award.reputationGain, credits: r.award.creditsGain, attemptId: r.entry.id, native: true, reason: `${r.site.name}: ${r.entry.passed ? "passed" : "attempted"} ${r.entry.simName ?? r.entry.simId}` });
    if (r.entry.passed) ppMarkBoard("underwater", r.site.id, r.entry.id);
  }
  dvRefreshHudCareer();
}

// ------------------------------------------------------------------ dives

function dvRenderDiveHud() {
  const list = dvDiveState(dvStore);
  const active = list.find((q) => !q.done && q.kind !== "egg") ?? list.find((q) => !q.done) ?? list[0];
  const el = $("hud-objective");
  if (!el) return;
  if (!active) { el.textContent = "No active dive."; return; }
  el.textContent = active.done ? `${active.title} — complete` : `${active.title}: ${active.currentStep?.text ?? ""}`;
}
dvOnDiveStep(({ dive }) => dvToast(`${dive.title}: step complete.`));
dvOnDiveDone(({ dive, reward }) => {
  dvToast(`${dive.title} complete!${reward ? ` +${reward.reputation ?? 0} reputation, +${reward.credits ?? 0} survey credits.` : ""}`, 4200);
  if (reward) dvAwardDiveReward(reward, { storage: dvStore, siteId: dive.kind === "egg" ? null : dive.site, title: dive.title });
  if (dive.kind === "egg" && dvApp.world?.lanterns[dive.id]) dvApp.world.lanterns[dive.id].visible = false;
  dvRefreshHudCareer(); dvRenderDiveHud();
});

// ------------------------------------------------------------- activities

function dvRenderActivities() {
  const list = $("activity-list");
  if (!list) return;
  list.innerHTML = "";
  for (const def of DV_ACTIVITIES) {
    const best = dvBestActivityScore(def.id, dvStore);
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.innerHTML = `<b></b><span></span><span class="best"></span>`;
    btn.querySelector("b").textContent = def.title;
    btn.querySelectorAll("span")[0].textContent = def.description;
    btn.querySelector(".best").textContent = best == null ? "No run yet" : def.kind === "time-trial" ? `Best: ${best} s` : def.kind === "drift" ? `Best: ${Math.round(best * 100)}% held` : `Best: ${best}`;
    btn.addEventListener("click", () => dvStartActivityRun(def));
    list.appendChild(btn);
  }
}
function dvStartActivityRun(def) {
  dvApp.activity = dvStartActivity(def);
  dvApp.world.dvSetMarkers(dvApp.activity.markers);
  dvOpenScreen("game");
  const site = DV_SITES.find((s) => s.name === def.site);
  if (site && dvIsAscentUnlocked(site.id, dvStore)) { dvApp.diver.x = site.position[0]; dvApp.diver.z = site.position[2]; dvApp.diver.y = site.position[1] + 2; }
  dvToast(`${def.title} — swim to the first marker.${site && !dvIsAscentUnlocked(site.id, dvStore) ? ` It starts at ${site.name}.` : ""}`, 4200);
}
function dvStepActivityRun(dt) {
  const a = dvApp.activity;
  if (!a) { $("hud-activity")?.toggleAttribute("hidden", true); return; }
  const before = a.hit.length;
  const next = dvStepActivity(a, { player: { x: dvApp.diver.x, z: dvApp.diver.z }, interact: dvApp.interactPressed }, dt);
  for (const id of next.hit.slice(before)) dvApp.world.dvMarkHit(id);
  dvApp.activity = next;
  const el = $("hud-activity");
  if (el) {
    el.removeAttribute("hidden");
    el.textContent = `${next.title}: ${next.hit.length}/${next.markers.length || "—"}${next.kind === "drift" ? ` · holding ${Math.round(((next.held ?? 0) / next.elapsed || 0) * 100)}%` : ""} · ${Math.round(next.elapsed)} s`;
  }
  if (next.done) {
    const best = dvRecordActivityScore(next.id, next.kind, next.score, dvStore);
    dvToast(`${next.title} — ${next.summary} · score ${next.score}${best.isNewBest ? " — new best!" : ""}`, 5000);
    dvApp.activity = null;
    dvApp.world.dvSetMarkers([]);
  }
}
$("hud-activities-btn")?.addEventListener("click", () => dvOpenScreen("activities"));
$("activities-close")?.addEventListener("click", () => dvOpenScreen("game"));

// --------------------------------------------------------------- HUD + map

function dvRefreshHudCareer() {
  const c = dvCareerState(dvStore);
  $("hud-reputation").textContent = c.reputation;
  $("hud-credits").textContent = c.credits;
}
function dvFormatClock(hours) {
  const h = Math.floor(hours), m = Math.floor((hours - h) * 60);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
/** The reserve gauge: a bar width and a word. Never a figure. */
function dvRenderReserve() {
  const fill = $("hud-reserve-fill"), word = $("hud-reserve-word");
  if (fill) { fill.style.width = `${Math.round(dvApp.reserve * 100)}%`; fill.classList.toggle("low", dvApp.reserve <= 0.35); }
  if (word) word.textContent = dvReserveLabel(dvApp.reserve);
}

function dvDrawMinimap() {
  const canvas = $("hud-minimap");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(4,20,30,0.72)"; ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
  for (const z of dvMapZones(size)) { ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "rgba(230,240,250,0.5)"; ctx.lineWidth = 1.5;
  for (const l of dvMapLines(size)) { ctx.beginPath(); l.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  for (const s of dvMapSites(size, dvStore)) { ctx.fillStyle = s.visited ? "#8cff5a" : "#f2c14b"; ctx.beginPath(); ctx.arc(s.x, s.y, 3, 0, Math.PI * 2); ctx.fill(); }
  const p = dvWorldToMap(dvApp.diver.x, dvApp.diver.z, size);
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(dvApp.diver.heading);
  ctx.fillStyle = "#4fd1ff"; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function dvDrawFullMap() {
  const canvas = $("map-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width;
  ctx.fillStyle = "#04141e"; ctx.fillRect(0, 0, size, size);
  for (const z of dvMapZones(size)) {
    ctx.fillStyle = `#${(z.color & 0xffffff).toString(16).padStart(6, "0")}22`;
    ctx.beginPath(); ctx.arc(z.x, z.y, z.radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9fd0e0"; ctx.font = "12px sans-serif"; ctx.fillText(z.name, z.x - 30, z.y);
  }
  ctx.strokeStyle = "#5a7a88"; ctx.lineWidth = 2;
  for (const l of dvMapLines(size)) { ctx.beginPath(); l.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke(); }
  for (const l of dvMapLandmarks(size)) { ctx.fillStyle = "#f0c07a"; ctx.beginPath(); ctx.arc(l.x, l.y, 4, 0, Math.PI * 2); ctx.fill(); }
  const listEl = $("map-sites");
  listEl.innerHTML = "";
  for (const s of dvMapSites(size, dvStore)) {
    ctx.fillStyle = s.visited ? "#8cff5a" : "#f2c14b";
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI * 2); ctx.fill();
    const row = document.createElement("div");
    row.className = "map-site-row";
    const btn = s.ascent ? `<button class="btn" data-ascent="${s.id}">Take the ascent line</button>` : `<span class="locked">Dive here to open its line</span>`;
    row.innerHTML = `<b></b><span>${s.visited ? "Dived" : "Not yet dived"}</span>${btn}`;
    row.querySelector("b").textContent = s.name;
    listEl.appendChild(row);
  }
  listEl.querySelectorAll("[data-ascent]").forEach((btn) => btn.addEventListener("click", () => {
    const site = DV_SITES.find((s) => s.id === btn.dataset.ascent);
    if (!site) return;
    dvApp.diver.x = site.position[0]; dvApp.diver.z = site.position[2]; dvApp.diver.y = site.position[1] + 2;
    dvApp.reserve = 1;
    dvToggleMap(false);
    dvToast(`Down the ascent line at ${site.name}.`);
  }));
  k2DrawFieldLayer(ctx, dvMapFieldLessons(size), listEl, lkStationLink); // the K-12 layer
  const p = dvWorldToMap(dvApp.diver.x, dvApp.diver.z, size);
  ctx.fillStyle = "#4fd1ff"; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
}

// ---------------------------------------------------------------- bootstrap

function dvSetup3D() {
  const tier = tcTier();
  const renderer = new THREE.WebGLRenderer({ antialias: tier.tier !== "low", alpha: false });
  tcApplyRenderer(renderer, tier);
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("stage").appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x14505f);
  const camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 600);
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  const root = new THREE.Group();
  scene.add(root);
  const world = dvBuildWorld(root, THREE, { detail: "high", fogScale: tier.fogScale });
  dvApp.scene = scene; dvApp.camera = camera; dvApp.renderer = renderer; dvApp.world = world;
  tzWatchWorld("underwater", { scene, THREE, pos: () => (dvApp.diver ? [dvApp.diver.x, dvApp.diver.z] : null), camera: () => dvApp.camera, groundAt: dvFloorY, size: 0.35, lift: 0.8 });
  // One lantern per egg dive, at the egg's own anchor, hidden once found.
  const done = new Set(dvDiveState(dvStore).filter((q) => q.done).map((q) => q.id));
  for (const q of DV_DIVES) if (q.kind === "egg" && Array.isArray(q.anchor)) world.dvPlaceLantern(q.id, q.anchor[0] + 2, q.anchor[1] + 2).visible = !done.has(q.id);
}

function dvStep(dt) {
  dvApp.hours = dvAdvanceClock(dvApp.hours, dt);
  const pad = dvPad.poll(dt);
  const ax = pad?.connected ? (Math.abs(pad.axes?.[0]?.value ?? 0) > GAMEPAD_DEADZONE ? pad.axes[0].value : 0) : 0;
  const ay = pad?.connected ? (Math.abs(pad.axes?.[1]?.value ?? 0) > GAMEPAD_DEADZONE ? pad.axes[1].value : 0) : 0;
  const k = heldSwim();
  const rise = k.rise || (dvTouch.up ? 1 : 0) - (dvTouch.down ? 1 : 0);

  if (dvApp.mode === "rov" && dvApp.rov) {
    const input = { throttle: k.forward || -ay || -dvStick.dy, steer: k.strafe || k.turn || ax || dvStick.dx, rise };
    dvApp.rov = dvStepRov(dvApp.rov, input, dt);
    const m = dvApp.world.rov;
    m.position.set(dvApp.rov.x, dvApp.rov.y, dvApp.rov.z); m.rotation.y = dvApp.rov.heading;
    dvApp.world.dvSetLine(dvApp.world.tether, [dvApp.diver.x, dvApp.diver.y, dvApp.diver.z], [dvApp.rov.x, dvApp.rov.y, dvApp.rov.z]);
    if (dvApp.rov.taut) dvToast("Tether taut — the ROV holds at the end of its line.", 1200);
  } else {
    const input = { forward: k.forward || -ay || -dvStick.dy, strafe: k.strafe || ax || dvStick.dx, turn: k.turn, rise, sprint: k.sprint || dvTouch.sprint };
    dvApp.diver = { ...dvApp.diver, ...dvStepDiver(dvApp.diver, input, dt) };
  }

  // The reserve: shrinks with time, faster deeper and finning hard; refills at the surface.
  const depth = -dvApp.diver.y;
  const atSurface = dvApp.diver.y >= DV_SURFACE_Y - 0.05;
  dvApp.reserve = dvReserveStep(dvApp.reserve, { depthFrac: dvDepthFraction(dvApp.diver.y, DEEP_DEPTH_RANGE), exertion: dvApp.mode === "swim" ? dvApp.diver.exertion ?? 0 : 0, atSurface }, dt);
  if (dvApp.reserve <= 0.15 && !dvApp._turnBackSaid) { dvApp._turnBackSaid = true; dvToast("Reserve says turn back — take the nearest ascent line (U).", 4200); }
  if (dvApp.reserve > 0.35) dvApp._turnBackSaid = false;

  // The buddy and the buddy line.
  dvApp.buddy = dvStepBuddy(dvApp.buddy, dvApp.diver, dt);
  const bm = dvApp.world.buddy;
  bm.position.set(dvApp.buddy.x, dvApp.buddy.y, dvApp.buddy.z); bm.rotation.y = dvApp.buddy.heading;
  dvApp.world.dvSetLine(dvApp.world.buddyLine, [dvApp.diver.x, dvApp.diver.y, dvApp.diver.z], [dvApp.buddy.x, dvApp.buddy.y, dvApp.buddy.z]);
  const line = dvBuddyLine(dvApp.diver, dvApp.buddy);

  const dm = dvApp.world.diver;
  dm.position.set(dvApp.diver.x, dvApp.diver.y, dvApp.diver.z); dm.rotation.y = dvApp.diver.heading;
  const subject = dvApp.mode === "rov" && dvApp.rov ? dvApp.rov : dvApp.diver;
  dvApp.world.placeCamera(dvApp.camera, dvApp.cameraMode, subject.x, subject.y, subject.z, subject.heading);
  dvApp.light = dvApp.world.dvApplyLighting(dvApp.scene, depth, dvApp.hours);

  dvApp.nearSite = dvNearestPlace(dvApp.diver.x, dvApp.diver.z, DV_SITES, 14);
  dvApp.nearLandmark = dvNearestPlace(dvApp.diver.x, dvApp.diver.z, DV_LANDMARKS, 16);
  dvApp.nearAscent = dvNearestAscentLine(dvApp.diver.x, dvApp.diver.z, DV_ASCENT, 10);
  const prompt = $("hud-prompt");
  if (prompt) {
    if (dvApp.mode === "rov") prompt.textContent = "Press R to recover the ROV";
    else if (line.taut) prompt.textContent = "Buddy line taut — wait for your buddy";
    else if (dvApp.nearSite) prompt.textContent = `Press E — ${dvApp.nearSite.name} · R for the ROV · U for the ascent line`;
    else if (dvApp.nearLandmark) prompt.textContent = `${dvApp.nearLandmark.name} — press E to look`;
    else prompt.textContent = "";
    prompt.toggleAttribute("hidden", !prompt.textContent);
  }
  if (dvApp.interactPressed && dvApp.mode === "swim" && dvApp.nearSite && !dvApp.activity) dvOpenJobBoard(dvApp.nearSite);
  if (dvApp.rovPressed) dvTryRov();
  if (dvApp.ascendPressed) dvTryAscend();

  const advanced = dvAdvanceDives({
    player: { x: subject.x, z: subject.z }, places: DV_PLACES,
    interact: dvApp.interactPressed, inRov: dvApp.mode === "rov", speed: Math.abs(subject.speed ?? 0),
  }, { storage: dvStore });
  if (advanced.length) dvRenderDiveHud();
  dvStepActivityRun(dt);
  dvApp.interactPressed = false; dvApp.rovPressed = false; dvApp.ascendPressed = false;

  $("hud-clock").textContent = dvFormatClock(dvApp.hours);
  $("hud-zone").textContent = DV_ZONES.find((z) => z.id === dvZoneAt(dvApp.diver.x, dvApp.diver.z))?.name ?? "";
  $("hud-light").textContent = dvApp.light.band === "shallow" ? "sun-lit" : dvApp.light.band === "mid" ? "dim" : "lamp-lit";
  $("hud-craft").textContent = dvApp.mode === "rov" ? "ROV" : "scuba";
  dvRenderReserve();
  if (!dvApp._mapTick || dvApp._mapTick > 6) { dvDrawMinimap(); dvApp._mapTick = 0; }
  dvApp._mapTick = (dvApp._mapTick ?? 0) + 1;
}

let dvLast = performance.now();
function dvLoop(now) {
  const dt = Math.min(0.1, (now - dvLast) / 1000);
  dvLast = now;
  if (dvApp.screen === "game" && !dvApp.mapOpen) dvStep(dt);
  dvApp.renderer?.render(dvApp.scene, dvApp.camera);
  requestAnimationFrame(dvLoop);
}

function dvStart() {
  dvRegisterDives(DV_DIVES);
  dvSetup3D();
  dvWireTouch();
  dvOpenScreen("game");
  dvRefreshHudCareer();
  dvRenderDiveHud();
  dvRenderReserve();
  dvCheckDiveReturns();
  const returned = dvReturnSiteId ? DV_SITES.find((x) => x.id === dvReturnSiteId) : null;
  if (returned) dvOpenJobBoard(returned);
  requestAnimationFrame(dvLoop);
}

$("menu-start")?.addEventListener("click", dvStart);
if (dvStartSite && dvStartSiteFrom(window.location?.search)) { const b = $("menu-start"); if (b) b.textContent = `Splash in at ${dvStartSite.name}`; }
$("hud-map-btn")?.addEventListener("click", () => dvToggleMap());
$("hud-surface-btn")?.addEventListener("click", () => { dvApp.ascendPressed = true; });
$("map-close")?.addEventListener("click", () => dvToggleMap(false));

window.addEventListener("pageshow", () => { if (dvApp.screen === "game") dvCheckDiveReturns(); });
document.addEventListener("visibilitychange", () => { if (!document.hidden && dvApp.screen === "game") dvCheckDiveReturns(); });

window.__underwaterTest = { app: dvApp, step: dvStep, jobBoard: dvOpenJobBoard, camera: () => dvApp.camera };

// The shared control grammar and help overlay (shared/controls.js, docs/ui-review.md).
// The Guide (shared/guide.js): the floating help button and its question panel.
gdMount();
ctlMount({
  world: "the Deep", quality: true,
  helpWhen: () => !dvApp.mapOpen,
  unique: [
    { label: "Rise / sink", keys: ["Space", "C"], pad: "Bumpers", touch: "Up and Down buttons" },
    { label: "Fin sprint", keys: ["Shift"], pad: "Hold left stick", touch: "Fin button" },
    { label: "Launch the ROV", keys: ["R"], pad: "—", touch: "—" },
    { label: "Ascend to the boat", keys: ["U"], pad: "—", touch: "—" },
  ],
});
