import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { createGamepad, GAMEPAD_DEADZONE } from "../../shared/input.js";
import { tcTier, tcTierChoice, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { weatherFor } from "../../shared/weather.js";
import { buildSky } from "../../shared/sky.js";
import { buildWildlife } from "../../shared/wildlife.js";
import { pickup } from "../../shared/fleet.js";
import { ppCompleted, ppHerePage, ppReturnSite } from "../../shared/passport.js";
import { lkStationLink, lkStationLabel } from "../../shared/links.js";
import { k2DrawFieldLayer } from "../../shared/field-lessons.js";
import { SM_BOUNDS, SM_SIZE, SM_SITES, SM_LANDMARKS, SM_EGGS, SM_FIELD_LESSONS, SM_MAIN_QUESTS, SM_SIDE_QUESTS, SM_ACTIVITIES, SM_LAKE, SM_PASS_ROAD, SM_SERVICE_ROAD, SM_TRANSMISSION, SM_GONDOLA, SM_TRAILS, SM_RIVER, SM_WATER_LEVEL, SM_RIDES, SM_ROAD_LENGTH, smHeightAt, smSlopeAt, smZoneAt, smInLake, smInRiver, smPlace, smRoadPointAt, // Skill-gated side quests (docs/skill-gates.md): the shared chip, quest-log panel, board rows, map pins and lock toast.
import { qmMountSideGames, qmBoardRows, qmDrawPin, qmLockToast } from "../../shared/skill-gates-ui.js";
import { qmIsOpen, qmSnapshot } from "../../shared/skill-gates.js";
import { SM_BOUNDS, SM_SIZE, SM_SITES, SM_LANDMARKS, SM_EGGS, SM_FIELD_LESSONS, SM_MAIN_QUESTS, SM_SIDE_QUESTS, SM_ACTIVITIES, SM_GATED, SM_LAKE, SM_PASS_ROAD, SM_SERVICE_ROAD, SM_TRANSMISSION, SM_GONDOLA, SM_TRAILS, SM_WATER_LEVEL, SM_SNOWLINE, smHeightAt, smSlopeAt, smZoneAt, smInLake, smPlace } from "../../shared/summit-data.js";
import { smBuildSummit, smGroundColour } from "../../shared/summit.js";
import { smLoad, smSave, smGateMissing, smGateOpen, smCurrentMain, smAdvanceQuests, smVisit, smFindEgg, smAnswerLesson, smActStart, smActStep, smActFinish, smRideStart, smRideStep, smRideFinish, smStepDone } from "./state.js";

// Sierra Summit — the app: a first-person walker over the streamed mountain,
// the HUD, job boards, field notes, field lessons, the map with layers and
// fast travel, the quest log with its skill locks, and the two activities.

const $ = (id) => document.getElementById(id);
const SM_RUNNER = "../smartcity/index.html";
const SM_EYE = 1.7;
const SM_TIMES = ["dawn", "day", "dusk", "night"];
const SM_WEATHERS = ["clear", "overcast", "fog", "wind", "storm"];

const sm = {
  state: smLoad(), playing: false, yaw: -0.25, pitch: 0.04, x: -1500, z: 1440,
  timeIdx: 1, weatherIdx: 0, run: null, near: null, modal: null, touchMove: [0, 0],
};

let smToastT = 0;
function smToast(text, ms = 3200) { const t = $("toast"); t.textContent = text; t.classList.add("on"); clearTimeout(smToastT); smToastT = setTimeout(() => t.classList.remove("on"), ms); }

// ------------------------------------------------------------------ scene

const smTierName = tcTierChoice().tier;
const smTierSet = tcTier();
const smRenderer = new THREE.WebGLRenderer({ antialias: smTierName !== "low", preserveDrawingBuffer: true });
tcApplyRenderer(smRenderer, smTierSet);
smRenderer.setSize(innerWidth, innerHeight);
$("stage").appendChild(smRenderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9cc8e8);
scene.fog = new THREE.Fog(0x9cc8e8, 400, 2600);
const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.3, 6000);
const root = new THREE.Group(); scene.add(root);
const hemi = new THREE.HemisphereLight(0xdfefff, 0x3a3226, 1.0);
const sun = new THREE.DirectionalLight(0xfff1d8, 1.1); sun.position.set(600, 900, 300);
root.add(hemi, sun);

// A return from a station lands at that site (#site=<id>), or ?site= deep links.
const smStartSite = ppReturnSite(location.hash, location.search) ?? new URLSearchParams(location.search).get("site");
const smStart = smPlace(smStartSite ?? "") ?? SM_SITES[0];
sm.x = smStart.at[0]; sm.z = smStart.at[1] + 16;
if (smStart.stations) smVisit(sm.state, smStart.id);

const world = smBuildSummit(root, THREE, { tier: smTierName, start: [sm.x, sm.z] });
for (const id of sm.state.eggs) world.hideEgg(id);

let sky = null, smRecipe = null;
function smApplySky() {
  if (sky) { root.remove(sky.root); }
  const weather = weatherFor(SM_WEATHERS[sm.weatherIdx]);
  sky = buildSky(root, { time: SM_TIMES[sm.timeIdx], weather, radius: 3000 });
  smRecipe = sky.recipe;
  scene.background.setHex(smRecipe.sky);
  scene.fog.color.setHex(smRecipe.fog);
  const vis = Math.max(900, (smRecipe.visibility ?? 1200) * 2.2) / (smTierSet.fogScale ?? 1);
  scene.fog.near = vis * 0.18; scene.fog.far = vis;
  const night = SM_TIMES[sm.timeIdx] === "night";
  sun.intensity = night ? 0.12 : SM_TIMES[sm.timeIdx] === "day" ? 1.1 : 0.6;
  hemi.intensity = night ? 0.25 : 0.95;
  $("hud-clock").textContent = SM_TIMES[sm.timeIdx];
  $("hud-weather").textContent = SM_WEATHERS[sm.weatherIdx];
}
smApplySky();
// Wildlife from the shared budget table: gulls over the reservoir, raptors
// soaring over the transmission ridge, a deer group at the meadow edge by
// the ranger station (the pad is flat there, so the group stands level).
const smRanger = smPlace("ranger-station");
const smRidgeTop = smPlace("ridge-line");
const smWild = [
  buildWildlife(root, { zone: { x: SM_LAKE.centre[0], z: SM_LAKE.centre[1], w: 500, d: 500, y: SM_WATER_LEVEL + 20 }, kind: "gulls", count: 6 }),
  buildWildlife(root, { zone: { x: smRidgeTop.at[0], z: smRidgeTop.at[1] - 120, w: 420, d: 420, y: smHeightAt(smRidgeTop.at[0], smRidgeTop.at[1]) + 40 }, kind: "raptors", count: 3 }),
  buildWildlife(root, { zone: { x: smRanger.at[0] + 34, z: smRanger.at[1] + 26, w: 26, d: 22, y: smHeightAt(smRanger.at[0], smRanger.at[1]) }, kind: "deer", count: 4 }),
];

// The crew pickup: drives the pass road end to end and back (through the
// tunnel, where the ridge hides it), so the road reads as a road. Distance
// along the road is kept in metres (smRoadPointAt); the road profile gives
// its height. During a ride (sm.ride, state.js) the pickup follows the ride
// instead and the learner's camera sits in its cab.
const smTruck = pickup(root, 0, 0, 0, { livery: { colour: 0xf2a53a, fleetName: "PASS ROAD CREW" } });
const smRoadTotal = SM_ROAD_LENGTH;
let smTruckD = smRoadTotal * 0.12, smTruckDir = 1;
function smDriveTruck(dt) {
  if (sm.ride) { smTruckD = sm.ride.d; smTruckDir = sm.ride.dir; }
  else {
    smTruckD += smTruckDir * 11 * dt;
    if (smTruckD > smRoadTotal - 40) { smTruckD = smRoadTotal - 40; smTruckDir = -1; }
    if (smTruckD < 40) { smTruckD = 40; smTruckDir = 1; }
  }
  const p = smRoadPointAt(smTruckD);
  smTruck.position.set(p.x, smHeightAt(p.x, p.z) + 0.35, p.z);
  smTruck.rotation.y = p.yaw + (smTruckDir > 0 ? 0 : Math.PI);
  return p;
}
smDriveTruck(0);

/** Board the crew pickup for a ride (the quest's `ride` step). */
function smBoard(ride) {
  sm.ride = smRideStart(ride.id);
  sm.rideLook = 0;
  smToast(`${ride.name}. ${ride.blurb}`, 9000);
  smHud();
}
/** The engine brake (E while riding). */
function smSetBrake() {
  if (!sm.ride || sm.ride.brake) return;
  smRideStep(sm.ride, 0, { brake: true });
  smToast(sm.ride.brakeAt === "pullout" ? "Engine brake on at the pull-out — ready the moment you lift off the throttle." : "Engine brake on — late, on the grade. It counts, but the pull-out is where it belongs.", 5000);
  smHud();
}
/** The ride's frame: the pickup moves, the camera rides in the cab, the learner's position follows. */
function smRideFrame(dt) {
  const run = sm.ride;
  smRideStep(run, dt);
  const p = smDriveTruck(0);
  sm.x = p.x; sm.z = p.z;
  sm.yaw = p.yaw + (run.dir > 0 ? Math.PI : 0) + (sm.rideLook ?? 0);
  if (run.phase === "stopped" && !run.saidAdvice) { run.saidAdvice = true; smToast(`Pull-out. ${SM_RIDES.find((r) => r.id === run.id).advice.text}`, 9000); }
  if (run.done) {
    const passed = smRideFinish(sm.state, run);
    smToast(passed ? `At the tunnel portal — ride done, score ${run.score}. The engine brake went on where it should.` : `At the tunnel portal — score ${run.score}. ${run.brake ? "The brake went on late; ride again and set it at the pull-out." : "No engine brake at all; ride again and set it at the pull-out."}`, 8000);
    sm.ride = null; smSave(sm.state); smProgress();
  }
}

addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); smRenderer.setSize(innerWidth, innerHeight); });

// ------------------------------------------------------------------ input

const smKeys = new Set();
addEventListener("keydown", (e) => {
  if (e.target?.tagName === "INPUT") return;
  if (e.code === "Escape" && sm.modal) { smClose(); return; }
  if (!sm.playing) return;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
  smKeys.add(e.code);
  if (e.repeat) return;
  if (e.code === "KeyE") smUse();
  if (e.code === "KeyM") smToggle("map");
  if (e.code === "KeyQ") smToggle("quests");
  if (e.code === "KeyT") { sm.timeIdx = (sm.timeIdx + 1) % SM_TIMES.length; smApplySky(); }
  if (e.code === "KeyF") { sm.weatherIdx = (sm.weatherIdx + 1) % SM_WEATHERS.length; smApplySky(); }
  if (e.code === "KeyR" && sm.run) { sm.radioed = true; smToast("Radio check: position and next point called in."); }
});
addEventListener("keyup", (e) => smKeys.delete(e.code));
addEventListener("blur", () => smKeys.clear());
let smDrag = null;
smRenderer.domElement.addEventListener("pointerdown", (e) => { smDrag = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
addEventListener("pointermove", (e) => {
  if (!smDrag || e.pointerId !== smDrag.id) return;
  if (sm.ride) sm.rideLook = Math.max(-1.3, Math.min(1.3, (sm.rideLook ?? 0) - (e.clientX - smDrag.x) * 0.004));
  else sm.yaw -= (e.clientX - smDrag.x) * 0.004; sm.pitch = Math.max(-1.2, Math.min(1.0, sm.pitch - (e.clientY - smDrag.y) * 0.003));
  smDrag.x = e.clientX; smDrag.y = e.clientY;
});
addEventListener("pointerup", () => { smDrag = null; });
const smPad = createGamepad({ getGamepads: () => { const all = navigator.getGamepads ? navigator.getGamepads() : []; return all?.[0] ? [all[0]] : []; }, bindings: [], axisBindings: [] });
const smPadPrev = {};

// ------------------------------------------------------------------ modals

function smClose() { if (!sm.modal) return; $(sm.modal).hidden = true; sm.modal = null; }
function smOpen(id) { smClose(); $(id).hidden = false; sm.modal = id; $(id).querySelector("[data-close]")?.focus(); }
function smToggle(id) { if (sm.modal === id) smClose(); else { if (id === "map") smRenderMap(); if (id === "quests") smRenderQuests(); smOpen(id); } }
for (const b of document.querySelectorAll("[data-close]")) b.addEventListener("click", smClose);

function smLink(id, siteId) { return lkStationLink(id, { runner: SM_RUNNER, from: "summit", page: ppHerePage(), siteId }); }
function smLockHtml(gate) {
  const miss = smGateMissing(gate, sm.state);
  if (!miss.length) return "";
  const links = miss.map((m) => (m.kind === "station" || m.kind === "k12") ? `<a href="${smLink(m.id, sm.near?.site?.id ?? null)}">${lkStationLabel(m.id)}</a>` : `${m.kind} ${m.label ?? lkStationLabel(m.id)}${m.detail ? ` (${m.detail})` : ""}`).join(", ");
  return `<p class="lock">🔒 ${gate.note} — needs ${links}</p>`;
}

function smOpenBoard(site) {
  $("board-title").textContent = site.name;
  $("board-trade").textContent = site.trade ?? "Crew muster";
  $("board-blurb").textContent = site.blurb;
  const ul = $("board-stations"); ul.textContent = "";
  for (const id of site.stations) {
    const li = document.createElement("li");
    const name = document.createElement("span"); name.textContent = `${ppCompleted(id) ? "✓ " : ""}${lkStationLabel(id)}`;
    if (ppCompleted(id)) name.className = "done";
    const a = document.createElement("a"); a.className = "btn primary"; a.href = smLink(id, site.id); a.dataset.station = id; a.textContent = "Start";
    a.setAttribute("aria-label", `Start ${lkStationLabel(id)}`);
    li.append(name, a); ul.appendChild(li);
  }
  if (!site.stations.length) ul.innerHTML = "<li>No stations here — this is where the crew musters. Open the map (M) to pick a site.</li>";
  const side = SM_SIDE_QUESTS.filter((q) => q.site === site.id);
  $("board-side").innerHTML = side.map((q) => `<div class="quest"><b>${q.title}</b>${sm.state.quests.includes(q.id) ? ' <span class="done">✓ done</span>' : ""}<small>${q.steps.map((s) => s.text).join(" ")}</small>${smLockHtml(q.gate)}</div>`).join("");
  // The shared lock rows for the gated quests posted here (padlock, reason, a link to each station).
  qmBoardRows($("board-side"), SM_GATED.filter((g) => g.site === site.id), { from: "summit", page: ppHerePage(), link: { siteId: site.id }, heading: "Skill locks here", done: (id) => sm.state.quests.includes(id) });
  smOpen("board");
}

function smOpenLesson(l) {
  $("lesson-title").textContent = l.title; $("lesson-min").textContent = l.minutes; $("lesson-trade").textContent = `${l.trade} · ${l.tradeLine} (${l.band})`;
  $("lesson-steps").innerHTML = l.steps.map((s) => `<li>${s}</li>`).join("");
  $("lesson-q").textContent = l.check.question;
  const box = $("lesson-choices"); box.textContent = "";
  l.check.options.forEach((c, i) => {
    const b = document.createElement("button"); b.className = "btn"; b.type = "button"; b.textContent = c;
    b.addEventListener("click", () => {
      const r = smAnswerLesson(sm.state, l.id, i); smSave(sm.state);
      smToast(r.ok ? `Right — ${l.check.why}` : "Not quite — read the steps again and try another answer.", r.ok ? 6000 : 3200);
      b.classList.toggle("on", r.ok); smHud();
    });
    box.appendChild(b);
  });
  $("lesson-links").innerHTML = `K-12 station: <a href="${smLink(l.station, l.anchor.id)}">${lkStationLabel(l.station)}</a> · Trade station: <a href="${smLink(l.tradeStation, l.anchor.id)}">${lkStationLabel(l.tradeStation)}</a>`;
  smOpen("lesson");
}

// --------------------------------------------------------------------- map

const SM_LAYERS = { sites: true, roads: true, trails: true, lessons: true, notes: true, locks: true, activities: true, you: true };
let smMapBaseDone = false;
function smMapXY(x, z, W) { return [(x - SM_BOUNDS.minX) / SM_SIZE * W, (z - SM_BOUNDS.minZ) / SM_SIZE * W]; }
function smRenderMap() {
  const base = $("map-base"), W = base.width;
  if (!smMapBaseDone) {
    const ctx = base.getContext("2d"), img = ctx.createImageData(W, W), c = [0, 0, 0];
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const x = SM_BOUNDS.minX + (i + 0.5) / W * SM_SIZE, z = SM_BOUNDS.minZ + (j + 0.5) / W * SM_SIZE;
      const h = smHeightAt(x, z), hx = smHeightAt(x + 8, z) - h, hz = smHeightAt(x, z + 8) - h, sl = Math.hypot(hx, hz) / 8;
      smGroundColour(x, z, h, sl, c, sl > 0.02 ? -(hz / 8) / sl : 0);
      let shade = 1 - (hx * 0.6 + hz * 0.4) * 0.05; shade = Math.max(0.55, Math.min(1.3, shade));
      if (smInLake(x, z) || smInRiver(x, z)) { c[0] = 0.18; c[1] = 0.42; c[2] = 0.56; shade = 1; }
      const contour = Math.abs((h % 100) - 50) > 48.5 ? 0.82 : 1;
      const k = (j * W + i) * 4;
      img.data[k] = Math.min(255, c[0] * 255 * shade * contour); img.data[k + 1] = Math.min(255, c[1] * 255 * shade * contour); img.data[k + 2] = Math.min(255, c[2] * 255 * shade * contour); img.data[k + 3] = 255;
    }
    ctx.putImageData(img, 0, 0); smMapBaseDone = true;
  }
  const over = $("map-over"), o = over.getContext("2d");
  o.clearRect(0, 0, W, W);
  const line = (pts, col, w, dash = []) => { o.strokeStyle = col; o.lineWidth = w; o.setLineDash(dash); o.beginPath(); pts.forEach(([x, z], i) => { const [px, pz] = smMapXY(x, z, W); if (i) o.lineTo(px, pz); else o.moveTo(px, pz); }); o.stroke(); o.setLineDash([]); };
  if (SM_LAYERS.roads) { line(SM_RIVER, "#4aa3cf", 2); line(SM_PASS_ROAD, "#222", 3); line(SM_SERVICE_ROAD, "#5b4b3a", 2); line(SM_TRANSMISSION, "#ffd24a", 1.5, [4, 3]); line(SM_GONDOLA, "#e8492f", 2, [2, 2]); }
  if (SM_LAYERS.trails) for (const t of SM_TRAILS) line(t.pts, "#fff3c4", 1.5, [3, 3]);
  const dot = (x, z, col, r, label) => { const [px, pz] = smMapXY(x, z, W); o.fillStyle = col; o.beginPath(); o.arc(px, pz, r, 0, Math.PI * 2); o.fill(); if (label) { o.font = "11px system-ui"; o.fillStyle = "#fff"; o.strokeStyle = "#000"; o.lineWidth = 3; o.strokeText(label, px + r + 2, pz + 4); o.fillText(label, px + r + 2, pz + 4); } };
  if (SM_LAYERS.sites) for (const s of SM_SITES) dot(s.at[0], s.at[1], sm.state.visited.includes(s.id) ? "#ffb020" : "#b0b8c0", 5, s.name);
  if (SM_LAYERS.lessons) {
    // SCHOLAR-2's K-12 layer draws the squares; a green dot marks a lesson passed.
    k2DrawFieldLayer(o, SM_FIELD_LESSONS.map((l) => { const [x, y] = smMapXY(l.position[0], l.position[1], W); return { ...l, x, y }; }), null, null);
    for (const l of SM_FIELD_LESSONS) if (sm.state.lessons.includes(l.id)) dot(l.position[0], l.position[1], "#8be28b", 2.5);
  }
  if (SM_LAYERS.notes) for (const e of SM_EGGS) if (sm.state.eggs.includes(e.id)) dot(e.at[0], e.at[1], "#f2e6b8", 2.5);
  if (SM_LAYERS.locks) { const qmSnap = qmSnapshot(); for (const q of SM_SIDE_QUESTS) if (q.gate) { const s = smPlace(q.site); const [px, pz] = smMapXY(s.at[0], s.at[1], W); qmDrawPin(o, px - 12, pz - 8, qmIsOpen(q.gate, qmSnap)); } }
  if (SM_LAYERS.activities) for (const a of SM_ACTIVITIES) (a.controls ?? a.points).forEach(([x, z], i) => dot(x, z, "#ff5ad0", 2.5, i === 0 ? a.kind : ""));
  if (SM_LAYERS.you) { const [px, pz] = smMapXY(sm.x, sm.z, W); o.fillStyle = "#ff3b3b"; o.beginPath(); o.moveTo(px - Math.sin(sm.yaw) * 9, pz - Math.cos(sm.yaw) * 9); o.lineTo(px + 5, pz + 5); o.lineTo(px - 5, pz + 5); o.fill(); }
  // Layer toggles and fast travel.
  const lay = $("map-layers");
  if (!lay.childElementCount) for (const k of Object.keys(SM_LAYERS)) {
    const l = document.createElement("label"); const cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = SM_LAYERS[k];
    cb.addEventListener("change", () => { SM_LAYERS[k] = cb.checked; smRenderMap(); }); l.append(cb, ` ${k}`); lay.appendChild(l);
  }
  const tr = $("map-travel"); tr.textContent = "";
  for (const s of SM_SITES) {
    const b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = s.name;
    const ok = sm.state.visited.includes(s.id); b.disabled = !ok; b.title = ok ? "Fast travel" : "Visit on foot first";
    b.addEventListener("click", () => { smTravel(s); smClose(); });
    tr.appendChild(b);
  }
}
function smTravel(s) { sm.x = s.at[0]; sm.z = s.at[1] + 16; sm.yaw = 0; world.update(sm.x, sm.z, 999); smToast(`Fast travel: ${s.name}.`); }

// ------------------------------------------------------------------ quests

function smRenderQuests() {
  const cur = smCurrentMain(sm.state);
  const mains = SM_MAIN_QUESTS.map((q) => `<div class="quest"><b>${sm.state.quests.includes(q.id) ? "✓ " : q === cur ? "▶ " : ""}${q.title}</b><small>${q.steps.map((s) => s.text).join(" ")}</small></div>`).join("");
  const sides = SM_SIDE_QUESTS.map((q) => `<div class="quest"><b>${sm.state.quests.includes(q.id) ? "✓ " : ""}${q.title}</b> <small>${smPlace(q.site)?.name}: ${q.steps.map((s) => s.text).join(" ")}</small></div>`).join("");
  $("quests-list").innerHTML = `<p class="eyebrow">Main arc</p>${mains}<p class="eyebrow">Side quests</p>${sides}`;
  $("quests-locks").innerHTML = [...SM_SIDE_QUESTS, ...SM_EGGS].filter((q) => q.gate).map((q) => `<div class="quest"><b>${q.title}</b>${smGateOpen(q.gate, sm.state) ? ' <span class="done">open</span>' : smLockHtml(q.gate)}</div>`).join("");
  $("quests-acts").innerHTML = SM_ACTIVITIES.map((a) => `<div class="quest"><b>${a.name}</b> — best ${sm.state.acts[a.id]?.best ?? "none yet"}<small>${a.blurb} Start at ${smPlace(a.start).name} (E at the board).</small></div>`).join("");
}

// ------------------------------------------------------------------- use

let smQmNear = null;
/** Walking up to a board with a locked gated quest: the lock toast with the stations to complete, once per approach. */
function smQmApproach(near) {
  const site = near?.kind === "board" ? near.site : null;
  if (!site) { smQmNear = null; return; }
  if (smQmNear === site.id) return;
  smQmNear = site.id;
  const locked = SM_GATED.find((g) => g.site === site.id && !qmIsOpen(g.gate, qmSnapshot()));
  if (locked) qmLockToast(locked, { from: "summit", page: ppHerePage(), link: { siteId: site.id } });
}

function smNearest() {
  let best = null, bd = 9;
  for (const b of world.siteBoards) { const d = Math.hypot(sm.x - b.x, sm.z - b.z); if (d < bd) { bd = d; best = { kind: "board", site: b.site }; } }
  for (const e of SM_EGGS) { if (sm.state.eggs.includes(e.id)) continue; const d = Math.hypot(sm.x - e.at[0], sm.z - e.at[1]); if (d < Math.min(bd, 5)) { bd = d; best = { kind: "egg", egg: e }; } }
  for (const l of SM_FIELD_LESSONS) { const d = Math.hypot(sm.x - l.position[0], sm.z - l.position[1]); if (d < Math.min(bd, 5)) { bd = d; best = { kind: "lesson", lesson: l }; } }
  return best;
}

function smUse() {
  if (sm.ride) { smSetBrake(); return; }
  const n = sm.near;
  if (!n) return;
  if (n.kind === "board") {
    const act = SM_ACTIVITIES.find((a) => a.start === n.site.id);
    if (act && !sm.run && confirm(`${act.name}\n\n${act.blurb}\n\nStart the activity now? (Cancel opens the job board.)`)) { sm.run = smActStart(act.id); smToast(`${act.name} started. R radios a check; M opens the map.`); return; }
    const ride = SM_RIDES.find((r) => r.from === n.site.id);
    if (ride && !sm.run && confirm(`${ride.name}\n\n${ride.blurb}\n\nBoard the pickup now? (Cancel opens the job board.)`)) { smBoard(ride); return; }
    smOpenBoard(n.site);
  } else if (n.kind === "egg") {
    const r = smFindEgg(sm.state, n.egg.id);
    if (r.locked) smToast(`🔒 ${n.egg.gate.note}`);
    else if (r.ok) { world.hideEgg(n.egg.id); smToast(`Field note found: "${n.egg.lesson}"`, 7000); smSave(sm.state); }
  } else if (n.kind === "lesson") smOpenLesson(n.lesson);
  smProgress();
}

function smProgress() {
  const fresh = smAdvanceQuests(sm.state);
  for (const id of fresh) { const q = [...SM_MAIN_QUESTS, ...SM_SIDE_QUESTS].find((x) => x.id === id); smToast(`Quest complete: ${q.title} — ${q.reward.badge}${q.reward.cosmetic ? ` (cosmetic: ${q.reward.cosmetic})` : ""}.`, 5000); }
  if (fresh.length) smSave(sm.state);
  smHud();
}

// -------------------------------------------------------------------- HUD

$("hud-eggs-total").textContent = SM_EGGS.length;
function smHud() {
  const h = smHeightAt(sm.x, sm.z);
  const zone = smZoneAt(sm.x, sm.z);
  let near = SM_SITES[0], nd = Infinity;
  for (const p of [...SM_SITES, ...SM_LANDMARKS]) { const d = Math.hypot(sm.x - p.at[0], sm.z - p.at[1]); if (d < nd) { nd = d; near = p; } }
  $("hud-zone").textContent = zone.name;
  $("hud-near").textContent = `${near.name} · ${Math.round(nd)} m`;
  $("hud-alt").textContent = `${Math.round(h)} m`;
  $("hud-slope").textContent = `${Math.round(smSlopeAt(sm.x, sm.z) * 100)}% slope`;
  $("hud-eggs").textContent = sm.state.eggs.length;
  $("hud-lessons").textContent = `${sm.state.lessons.length}/${SM_FIELD_LESSONS.length}`;
  const cur = smCurrentMain(sm.state);
  $("hud-quest-text").textContent = cur ? `${cur.title}: ${cur.steps.find((s) => !smStepDone(s, sm.state))?.text ?? "report back"}` : "The mountain is yours — every site worked.";
  const p = $("hud-prompt");
  if (sm.ride) { p.hidden = false; p.textContent = sm.ride.brake ? "Engine brake on" : sm.ride.phase === "stopped" ? "E — set the engine brake at the pull-out" : "E — engine brake"; }
  else if (sm.near) { p.hidden = false; p.textContent = sm.near.kind === "board" ? `E — ${sm.near.site.name} job board` : sm.near.kind === "egg" ? "E — look under the cairn" : `E — field lesson: ${sm.near.lesson.title}`; }
  else p.hidden = true;
  const ah = $("hud-act");
  if (sm.ride) {
    const r = SM_RIDES.find((v) => v.id === sm.ride.id), g = Math.round(sm.ride.grade * 100);
    const phase = { climb: "climbing the switchbacks", stopped: "at the pull-out", descent: "down the grade", done: "arrived" }[sm.ride.phase];
    ah.hidden = false;
    ah.innerHTML = `<b>${r.name}</b><br>${phase} · grade ${g > 0 ? "+" : ""}${g}% · engine brake ${sm.ride.brake ? "on" : "off"} · score ${sm.ride.score}${sm.ride.phase === "stopped" ? `<br><small>${r.advice.text}</small>` : ""}`;
  } else if (sm.run) { ah.hidden = false; const a = SM_ACTIVITIES.find((v) => v.id === sm.run.id); ah.innerHTML = `<b>${a.name}</b><br>Next ${sm.run.next + 1}/${(a.controls ?? a.points).length} · score ${sm.run.score}${sm.run.pendingCheck ? `<br>${a.kind === "orienteering" ? "Check the map (M)" : "Radio a buddy check (R)"}` : ""}`; }
  else ah.hidden = true;
}

// ------------------------------------------------------------------- loop

let last = performance.now(), smHudT = 0, smVisitT = 0;
function frame(now) {
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  if (sm.playing && !sm.modal && sm.ride) smRideFrame(dt);
  else if (sm.playing && !sm.modal) {
    let f = 0, s = 0, turn = 0;
    if (smKeys.has("KeyW") || smKeys.has("ArrowUp")) f += 1;
    if (smKeys.has("KeyS") || smKeys.has("ArrowDown")) f -= 1;
    if (smKeys.has("KeyA")) s -= 1;
    if (smKeys.has("KeyD")) s += 1;
    if (smKeys.has("ArrowLeft")) turn += 1;
    if (smKeys.has("ArrowRight")) turn -= 1;
    const snap = smPad.poll(dt);
    const ax = (i) => { const v = snap?.axes?.[i]?.value ?? 0; return Math.abs(v) > GAMEPAD_DEADZONE ? v : 0; };
    f -= ax(1); s += ax(0); turn -= ax(2) * 1.4; sm.pitch = Math.max(-1.2, Math.min(1, sm.pitch - ax(3) * dt * 1.5));
    const b0 = !!snap?.buttons?.[0]?.pressed; if (b0 && !smPadPrev[0]) smUse(); smPadPrev[0] = b0;
    if (smTouch?.stick?.active) { f -= smTouch.stick.dy; s += smTouch.stick.dx; }
    sm.yaw += turn * dt * 1.6;
    const run = smKeys.has("ShiftLeft") || smKeys.has("ShiftRight") || !!snap?.buttons?.[10]?.pressed;
    const speed = (run ? 14 : 5) * (smSlopeAt(sm.x, sm.z) > 0.8 ? 0.55 : 1);
    const fx = -Math.sin(sm.yaw), fz = -Math.cos(sm.yaw);
    let nx = sm.x + (fx * f - fz * s) * speed * dt, nz = sm.z + (fz * f + fx * s) * speed * dt;
    nx = Math.max(SM_BOUNDS.minX + 5, Math.min(SM_BOUNDS.maxX - 5, nx)); nz = Math.max(SM_BOUNDS.minZ + 5, Math.min(SM_BOUNDS.maxZ - 5, nz));
    if (!smInLake(nx, nz)) { sm.x = nx; sm.z = nz; }
    // Fording the river is allowed, just slow: the speed factor above already eases on steep banks.
    if (sm.run) {
      smActStep(sm.run, sm.x, sm.z, dt, { mapOpen: false, radioed: !!sm.radioed }); sm.radioed = false;
      if (sm.run.done && !sm.run.pendingCheck) { const best = smActFinish(sm.state, sm.run); smToast(`Activity finished: score ${sm.run.score}${best ? " — a new best" : ""}.`, 6000); sm.run = null; smSave(sm.state); }
    }
  } else if (sm.run && sm.modal === "map") smActStep(sm.run, sm.x, sm.z, 0, { mapOpen: true });
  const gy = smHeightAt(sm.x, sm.z);
  // In the cab the eye sits at the pickup's window height; the pickup itself is drawn 0.35 m over the road.
  camera.position.set(sm.x, gy + (sm.ride ? 2.15 : SM_EYE) + (sm.lift ?? 0), sm.z);
  camera.rotation.set(sm.pitch, sm.yaw, 0, "YXZ");
  world.update(sm.x, sm.z, 2);
  world.animate(dt);
  sky?.animate(now / 1000, dt, camera);
  for (const w of smWild) w.animate(now / 1000, dt);
  if (!sm.ride) smDriveTruck(dt);
  smHudT += dt; smVisitT += dt;
  if (smVisitT > 0.5) {
    smVisitT = 0;
    sm.near = smNearest();
    smQmApproach(sm.near);
    for (const s of [...SM_SITES, ...SM_LANDMARKS]) if (Math.hypot(sm.x - s.at[0], sm.z - s.at[1]) < 40 && smVisit(sm.state, s.id)) { smToast(`Visited: ${s.name}.${s.stations ? " Fast travel unlocked." : ""}`); smSave(sm.state); smProgress(); }
  }
  if (smHudT > 0.25 && sm.playing) { smHudT = 0; smHud(); }
  smRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function smBegin() {
  $("menu").hidden = true; $("hud").hidden = false; sm.playing = true;
  smProgress(); smHud();
  smToast(smStartSite ? `Back at ${smStart.name}.` : "Welcome to Sierra Summit. Walk to the orange job board (E), or open the map (M).");
}
$("menu-start").addEventListener("click", smBegin);
if (smStartSite) smBegin();

// Touch: a stick to walk, buttons for use / map / quests.
let smTouch = null;
try {
  smTouch = tcMountTouch({
    hint: "Drag the stick to walk; smDrag the view to look; tap Use at a board, cairn or sign.",
    buttons: [
      { id: "sm-use", label: "Use", aria: "Use", onDown: () => smUse() },
      { id: "sm-map", label: "Map", aria: "Map", onDown: () => smToggle("map") },
      { id: "sm-quests", label: "Quests", aria: "Quests", onDown: () => smToggle("quests") },
    ],
  });

} catch { /* no touch layer */ }
tcMountQuality?.($("hud-stats"), (q) => tcApplyRenderer(smRenderer, tcTier(q)));

gdMount();
ctlMount({
  world: "Sierra Summit", quality: true,
  except: { move: "WASD or arrows walk; Shift runs; smDrag the view to look.", interact: "E at a job board, a cairn or a lesson sign.", map: "M opens the map with its layers and fast travel." },
  unique: [
    { label: "Quests", keys: ["Q"], pad: "—", touch: "Quests button" },
    { label: "Time of day / weather", keys: ["T", "F"], pad: "—", touch: "—" },
    { label: "Radio check (activities)", keys: ["R"], pad: "—", touch: "—" },
    { label: "Engine brake (riding the pickup)", keys: ["E"], pad: "A", touch: "Use button" },
  ],
});

// Live-test handle (tools/check_summit.mjs and the capture scripts).
window.__summitTest = {
  THREE, camera, scene, smRenderer, world, sm,
  teleport(x, z, yaw = sm.yaw, pitch = sm.pitch, lift = 0) { sm.x = x; sm.z = z; sm.yaw = yaw; sm.pitch = pitch; sm.lift = lift; world.update(x, z, 999); },
  begin: smBegin, stats: () => world.stats(), setTime(i) { sm.timeIdx = i; smApplySky(); }, setWeather(i) { sm.weatherIdx = i; smApplySky(); },
  wildlife: smWild, truck: smTruck, truckAt: () => ({ d: smTruckD, dir: smTruckDir }),
  board(id = SM_RIDES[0].id) { smBoard(SM_RIDES.find((r) => r.id === id)); }, brake: smSetBrake, ride: () => sm.ride,
};

void SM_SNOWLINE;
// The shared "Side games" chip and quest-log panel: every gated quest and field note here, open rows first, then the Skills to unlock roll-up.
qmMountSideGames({ world: "summit", worldName: "Sierra Summit", items: SM_GATED, from: "summit", page: ppHerePage() });
