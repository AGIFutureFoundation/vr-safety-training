import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { ctlMount } from "../../shared/controls.js";
import { gdMount } from "../../shared/guide.js";
import { createGamepad, GAMEPAD_DEADZONE, detectPadVendor } from "../../shared/input.js";
import { tcTier, tcApplyRenderer } from "../../shared/perf.js";
import { tcMountTouch, tcMountQuality } from "../../shared/touch.js";
import { YACHT_FLEET, yachtById, rgYachtsForEvent, rgYachtBerthSite } from "../../shared/yacht-fleet.js";
import { bwCareerState } from "../../bayworld/js/career.js";
import { RG_COURSES, rgCourseById, rgCourseToMap, regattaCourseAt } from "./courses.js";
import { rgCreateRace, rgStepRace, rgScoreRace, rgLearner, rgTargetFor, rgGiveWayDuty, RG_YACHT } from "./race.js";
import { rgCalendar, rgEventById, rgBriefingChecklist, rgBriefingResult, rgAwardEvent, rgStationLink, rgLifeJacketsNeeded } from "./events.js";
import { ppAward, ppCompleted, ppCompleteReturns, ppProgressChip, ppReturnSite, ppHerePage } from "../../shared/passport.js";
import { rgBuildWorld } from "./world.js";

// Bay Regatta — the app: the events calendar, the briefing, the yacht and
// course pick, the race HUD and the render loop. Every rule that must run the
// same way twice lives in courses.js, race.js and events.js (pure, headless —
// see tools/check_regatta.mjs); this file only wires input, the DOM and
// three.js around them, the way Bay World's app.js does.

const $ = (id) => document.getElementById(id);
const rgStore = (() => { try { return window.localStorage; } catch { return null; } })();

const rgApp = {
  screen: "menu", scene: null, camera: null, renderer: null, world: null,
  event: null, yachtId: YACHT_FLEET[0].id, courseId: RG_COURSES[0].id, briefingOk: true,
  race: null, marks: [], cameraMode: "chase", hours: 10, weather: "clear", paused: false, done: false,
};

let rgToastTimer = null;
function rgToast(text, ms = 3200) {
  const el = $("toast"); if (!el) return;
  el.textContent = text; el.classList.add("on");
  clearTimeout(rgToastTimer); rgToastTimer = setTimeout(() => el.classList.remove("on"), ms);
}

// ------------------------------------------------------------------ input

const rgKeys = new Set();
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  rgKeys.add(e.code);
  if (e.code === "KeyV") rgToggleCamera();
  if (e.code === "Escape" && rgApp.screen === "race") rgOpenScreen("menu");
});
window.addEventListener("keyup", (e) => rgKeys.delete(e.code));
window.addEventListener("blur", () => rgKeys.clear());

// The shared touch layer (shared/touch.js): the stick is throttle and rudder.
let rgStick = { active: false, id: null, dx: 0, dy: 0 };
function rgWireTouch() {
  const t = tcMountTouch({
    hint: "Push the stick forward for throttle, left and right for the rudder. View switches the camera.",
    buttons: [{ id: "touch-view", label: "View", aria: "Switch camera", onDown: () => rgToggleCamera() }],
  });
  rgStick = t.stick;
  tcMountQuality($("hud-helm"), (q) => tcApplyRenderer(rgApp.renderer, tcTier(q)));
}

const rgPad = createGamepad({ getGamepads: () => (navigator.getGamepads ? navigator.getGamepads() : []), bindings: [], axisBindings: [],
  onConnect: (info) => { if (info.connected) rgToast(`Gamepad connected (${detectPadVendor(info.id)} labels).`); } });

/** The helm input this frame: keyboard (W/S throttle, A/D rudder), the touch stick, or the pad's left stick. */
function rgHelmInput() {
  const pad = rgPad.poll(1 / 60);
  let throttle = (rgKeys.has("KeyW") || rgKeys.has("ArrowUp") ? 1 : 0) - (rgKeys.has("KeyS") || rgKeys.has("ArrowDown") ? 1 : 0);
  let rudder = (rgKeys.has("KeyD") || rgKeys.has("ArrowRight") ? 1 : 0) - (rgKeys.has("KeyA") || rgKeys.has("ArrowLeft") ? 1 : 0);
  if (rgStick.active) { throttle = -rgStick.dy; rudder = rgStick.dx; }
  if (pad?.connected) {
    const ax = pad.axes?.[0]?.value ?? 0, ay = pad.axes?.[1]?.value ?? 0;
    if (Math.abs(ax) > GAMEPAD_DEADZONE) rudder = ax;
    if (Math.abs(ay) > GAMEPAD_DEADZONE) throttle = -ay;
  }
  // Rudder input is "turn to starboard" positive on the stick; race.js's rudder turns the bow to port when positive.
  return { throttle: Math.max(-1, Math.min(1, throttle)), rudder: Math.max(-1, Math.min(1, -rudder)) };
}

// ------------------------------------------------------------------ screens

function rgOpenScreen(name) {
  rgApp.screen = name;
  for (const id of ["scr-menu", "scr-briefing", "scr-results"]) $(id)?.toggleAttribute("hidden", true);
  $("hud")?.toggleAttribute("hidden", name !== "race");
  $("view-toggle")?.toggleAttribute("hidden", name !== "race");
  if (name === "menu") { $("scr-menu")?.removeAttribute("hidden"); rgRenderMenu(); }
  if (name === "briefing") $("scr-briefing")?.removeAttribute("hidden");
  if (name === "results") $("scr-results")?.removeAttribute("hidden");
}
function rgToggleCamera() { rgApp.cameraMode = rgApp.cameraMode === "chase" ? "helm" : "chase"; const b = $("view-toggle"); if (b) b.textContent = rgApp.cameraMode === "chase" ? "Helm view (V)" : "Chase camera (V)"; }

function rgRenderMenu() {
  const c = bwCareerState(rgStore);
  $("menu-career").textContent = `Reputation ${c.reputation} · Shift credits ${c.credits} — the same ledger as Bay World.`;
  const cal = $("calendar"); cal.innerHTML = "";
  for (const e of rgCalendar()) {
    const row = document.createElement("div"); row.className = "event-row";
    const yachts = rgYachtsForEvent(e.id).map((y) => y.name).join(", ");
    const berth = rgYachtBerthSite({ berth: e.berth })?.name ?? e.berth;
    const b = document.createElement("b"); b.textContent = `Day ${e.day + 1}, ${e.hour}:00 — ${e.name}`;
    const p = document.createElement("span"); p.textContent = `${e.blurb} Hosted at ${berth}; ${rgCourseById(e.course)?.name}. Yachts: ${yachts}.`;
    const btn = document.createElement("button"); btn.className = "btn"; btn.textContent = e.kind === "race" ? "Brief and race" : "Brief and cast off";
    btn.addEventListener("click", () => rgOpenBriefing(e));
    row.append(b, p, btn); cal.appendChild(row);
  }
  const yachtSel = $("pick-yacht"); yachtSel.innerHTML = "";
  for (const y of YACHT_FLEET) { const o = document.createElement("option"); o.value = y.id; o.textContent = `${y.name} — ${rgYachtBerthSite(y)?.name ?? y.berth} (${y.flybridge} flybridge, ${Math.round(24 * y.length)} m)`; yachtSel.appendChild(o); }
  yachtSel.value = rgApp.yachtId;
  const courseSel = $("pick-course"); courseSel.innerHTML = "";
  for (const c2 of RG_COURSES) { const o = document.createElement("option"); o.value = c2.id; o.textContent = `${c2.name} — ${c2.marks.length} marks`; courseSel.appendChild(o); }
  courseSel.value = rgApp.courseId;
}
$("pick-yacht")?.addEventListener("change", (e) => { rgApp.yachtId = e.target.value; });
$("pick-course")?.addEventListener("change", (e) => { rgApp.courseId = e.target.value; });
$("menu-race")?.addEventListener("click", () => { rgApp.event = null; rgApp.briefingOk = true; rgStartRace(); });

// ------------------------------------------------------------------ briefing

function rgOpenBriefing(event) {
  rgApp.event = event;
  rgApp.courseId = event.course;
  const rostered = rgYachtsForEvent(event.id);
  if (!rostered.some((y) => y.id === rgApp.yachtId)) rgApp.yachtId = rostered[0]?.id ?? rgApp.yachtId;
  $("br-title").textContent = event.name;
  $("br-blurb").textContent = `${event.blurb} You helm ${yachtById(rgApp.yachtId)?.name}.`;
  const list = $("br-items"); list.innerHTML = "";
  for (const item of rgBriefingChecklist(event)) {
    const li = document.createElement("li");
    const label = document.createElement("label"); label.textContent = item.text.replace(/\s*\(.*\)\.?$/, "").replace(/:.*$/, "") + " ";
    let input;
    if (item.id === "guests" || item.id === "jackets") { input = document.createElement("input"); input.type = "number"; input.min = "0"; input.value = ""; }
    else if (item.id === "muster") {
      input = document.createElement("select");
      for (const opt of [event.musterPoint, "engine-room hatch", "the flybridge helm", "the tender in its davit"].sort()) { const o = document.createElement("option"); o.value = opt; o.textContent = opt; input.appendChild(o); }
    } else {
      input = document.createElement("select");
      for (const c of RG_COURSES) { const o = document.createElement("option"); o.value = c.id; o.textContent = c.name; input.appendChild(o); }
    }
    input.id = `br-${item.id}`;
    label.appendChild(input); li.appendChild(label); list.appendChild(li);
  }
  $("br-hint").textContent = `${event.guests} guests and ${event.crew} crew are aboard; life jackets are one per person plus a spare. Muster point: ${event.musterPoint}.`;
  const st = $("br-stations"); st.innerHTML = "";
  // Each station opens with the way home on it (docs/interop.md); a station
  // already passed anywhere on the platform shows its tick from the passport.
  for (const id of event.stations) {
    const a = document.createElement("a"); a.className = "btn ghost";
    a.href = rgStationLink(id, { page: ppHerePage(), eventId: event.id });
    a.textContent = `${ppCompleted(id) ? "✓ " : ""}${id.replace(/^yc-/, "").replace(/-/g, " ")}`;
    st.appendChild(a);
  }
  ppProgressChip($("br-chip"), RG_PROGRAMME);
  $("br-result").textContent = "";
  rgOpenScreen("briefing");
}
$("br-go")?.addEventListener("click", () => {
  const e = rgApp.event; if (!e) return;
  const answers = { guests: Number($("br-guests")?.value), jackets: Number($("br-jackets")?.value), muster: $("br-muster")?.value, course: $("br-course")?.value };
  const res = rgBriefingResult(e, answers);
  rgApp.briefingOk = res.ok;
  if (!res.ok) { $("br-result").textContent = `Briefing not right yet: ${res.wrong.join(", ")}. You can still cast off, at half the reward — or fix it. (Jackets needed: ${rgLifeJacketsNeeded(e)}.)`; }
  else $("br-result").textContent = "Briefing complete. Lines off.";
  if (res.ok || $("br-result").dataset.warned === "1") rgStartRace();
  else $("br-result").dataset.warned = "1";
});
$("br-back")?.addEventListener("click", () => rgOpenScreen("menu"));

// ------------------------------------------------------------------ race

function rgStartRace() {
  const course = rgCourseById(rgApp.courseId);
  rgApp.hours = rgApp.event?.hour ?? 10;
  rgApp.weather = rgApp.event?.kind === "cruise" && rgApp.event.hour >= 18 ? "overcast" : ["clear", "overcast", "fog", "wind"][Math.floor(Math.random() * 4)];
  rgApp.race = rgCreateRace(course.id, rgApp.yachtId, { weather: rgApp.weather });
  rgApp.done = false;
  const laid = rgApp.world.rgLayCourse(course);
  rgApp.marks = laid.marks;
  rgApp.world.rgSetWeather(rgApp.weather);
  $("hud-course").textContent = course.name;
  $("hud-yacht").textContent = yachtById(rgApp.yachtId)?.name ?? "";
  rgDrawCourseCard();
  rgOpenScreen("race");
  rgToast(`${course.name}: hold no-wake speed to the harbour mouth, keep every mark on its side, the give-way vessel keeps clear, dock clean.`, 5200);
}

function rgFormatTime(s) { const m = Math.floor(s / 60), r = Math.floor(s % 60); return `${m}:${String(r).padStart(2, "0")}`; }

function rgDrawCourseCard() {
  const canvas = $("hud-course-map"); if (!canvas || !rgApp.race) return;
  const ctx = canvas.getContext("2d"), size = canvas.width, c = rgApp.race.course;
  const toMap = rgCourseToMap(c, size);
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "rgba(6,14,22,0.75)"; ctx.fillRect(0, 0, size, size);
  const nw = toMap(c.noWake.x, c.noWake.z);
  ctx.fillStyle = "rgba(242,193,75,0.18)"; ctx.beginPath(); ctx.arc(nw.x, nw.y, c.noWake.r * nw.scale, 0, Math.PI * 2); ctx.fill();
  const a = toMap(c.start.a[0], c.start.a[1]), b = toMap(c.start.b[0], c.start.b[1]);
  ctx.strokeStyle = "#f4f5f2"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  const me = rgLearner(rgApp.race);
  c.marks.forEach((m, i) => {
    const p = toMap(m.x, m.z);
    const vis = Math.hypot(m.x - me.x, m.z - me.z) <= rgApp.race.wind.visibility;
    ctx.fillStyle = m.side === "port" ? (vis ? "#d8322c" : "rgba(216,50,44,0.3)") : (vis ? "#59c97b" : "rgba(89,201,123,0.3)");
    ctx.beginPath(); ctx.arc(p.x, p.y, i === me.next % c.marks.length && me.next < c.marks.length ? 6 : 4, 0, Math.PI * 2); ctx.fill();
  });
  const d = toMap(c.dock.x, c.dock.z); ctx.fillStyle = "#8a7a62"; ctx.fillRect(d.x - 4, d.y - 4, 8, 8);
  for (const boat of rgApp.race.boats) {
    const p = toMap(boat.x, boat.z);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(boat.heading);
    ctx.fillStyle = boat.id === me.id ? "#4fd1ff" : "#9cc0d6";
    ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(3.5, 4); ctx.lineTo(-3.5, 4); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  const w = rgApp.race.wind;
  ctx.save(); ctx.translate(size - 18, 18); ctx.rotate(w.dir + Math.PI);
  ctx.strokeStyle = "#f2c14b"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.lineTo(-4, 4); ctx.moveTo(0, 9); ctx.lineTo(4, 4); ctx.stroke(); ctx.restore();
}

function rgStep(dt) {
  const race = rgApp.race; if (!race) return;
  const me = rgLearner(race);
  if (!me.finished) rgStepRace(race, rgHelmInput(), dt);
  else if (!rgApp.done) { rgApp.done = true; setTimeout(rgShowResults, 900); }
  for (const boat of race.boats) { const mesh = rgApp.world.yachts[boat.id]; if (mesh) rgApp.world.rgPlaceYacht(mesh, boat, race.t); }
  rgApp.world.rgFadeMarks(rgApp.marks, me.x, me.z, race.wind.visibility);
  rgApp.world.rgApplyLighting(rgApp.scene, rgApp.hours + race.t / 600);
  rgApp.world.placeCamera(rgApp.camera, rgApp.cameraMode, me);

  const tgt = rgTargetFor(race, me);
  const here = regattaCourseAt(race.course, me.x, me.z);
  $("hud-speed").textContent = `${(Math.abs(me.speed) * 1.944).toFixed(1)} kn`;
  $("hud-time").textContent = rgFormatTime(race.t);
  $("hud-next").textContent = tgt.kind === "mark" ? `Next: ${tgt.mark.id.toUpperCase()} — keep it to ${tgt.side} (${Math.round(Math.hypot(tgt.x - me.x, tgt.z - me.z))} m)`
    : tgt.kind === "line" ? `Next: the finish line (${Math.round(Math.hypot(tgt.x - me.x, tgt.z - me.z))} m)` : `Home: dock bow-first, under ${(1.2 * 1.944).toFixed(1)} kn`;
  const giveWay = rgGiveWayDuty(race, me);
  const warn = $("hud-warn");
  if (here.kind === "no-wake" || (here.kind === "dock")) warn.textContent = me.speed > race.course.noWake.cap ? `No-wake zone — slow to ${(race.course.noWake.cap * 1.944).toFixed(0)} kn` : "No-wake zone — speed held";
  else if (giveWay) warn.textContent = `${giveWay.name} crossing from starboard — you are the give-way vessel: ease down or turn away`;
  else warn.textContent = "";
  warn.toggleAttribute("hidden", !warn.textContent);
  $("hud-checks").textContent = `Marks ${me.roundings.filter((r) => r.ok).length}/${race.course.marks.length} · no-wake ${race.noWake.violations ? "broken" : "held"} · give-way ${race.giveWay.violations ? "broken" : "kept"} · wind ${(race.wind.speed * 1.944).toFixed(0)} kn ${race.weather}`;
  if (!rgApp._tick || rgApp._tick > 5) { rgDrawCourseCard(); rgApp._tick = 0; }
  rgApp._tick = (rgApp._tick ?? 0) + 1;
}

function rgShowResults() {
  const score = rgScoreRace(rgApp.race);
  const lines = [
    `${yachtById(score.yacht)?.name} on ${rgCourseById(score.course)?.name}: ${score.time != null ? rgFormatTime(score.time) : "did not finish"}${score.place ? `, ${score.place}${["st", "nd", "rd"][score.place - 1] ?? "th"} of ${score.fleet} across the line` : ""}.`,
    `Marks on the correct side: ${score.marksOk}/${score.marksTotal}.`,
    `Harbour-mouth no-wake zone: ${score.noWakeOk ? "held" : `exceeded ${score.noWakeViolations} time(s)`}.`,
    `Right of way at crossings: ${score.giveWayOk ? "the give-way vessel kept clear every time" : `held on ${score.giveWayViolations} time(s) when this yacht was the give-way vessel`}.`,
    `Docking: ${score.dockingOk ? "clean — slow, bow-first" : "not clean"}.`,
    `${score.stars} of 3 stars.`,
  ];
  $("res-title").textContent = rgApp.event ? rgApp.event.name : "Race result";
  const ul = $("res-lines"); ul.innerHTML = "";
  for (const l of lines) { const li = document.createElement("li"); li.textContent = l; ul.appendChild(li); }
  if (rgApp.event) {
    const award = rgAwardEvent(rgApp.event, { briefingOk: rgApp.briefingOk, score, storage: rgStore });
    // Paid into Bay World's store by rgAwardEvent; the passport keeps the source.
    ppAward("regatta", { reputation: award.reputationGain, credits: award.creditsGain, native: true, reason: `${rgApp.event.name}: ${score.stars} of 3 stars` });
    $("res-award").textContent = `+${award.reputationGain} reputation, +${award.creditsGain} credits to the shared career ledger${rgApp.briefingOk ? "" : " (halved: the briefing was not right)"}. Reputation is now ${award.reputation}.`;
    for (const u of award.unlocked ?? []) rgToast(`Unlocked: ${u.label}`, 4200);
  } else $("res-award").textContent = "A free race pays nothing — pick an event from the calendar to earn reputation and credits.";
  rgOpenScreen("results");
}
$("res-again")?.addEventListener("click", () => rgOpenScreen("menu"));

// ------------------------------------------------------------------ boot

function rgSetup3D() {
  const tier = tcTier();
  const renderer = new THREE.WebGLRenderer({ antialias: tier.tier !== "low", alpha: false });
  tcApplyRenderer(renderer, tier);
  renderer.setSize(window.innerWidth, window.innerHeight);
  $("stage").appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6fb8ea);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 1600);
  window.addEventListener("resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
  const root = new THREE.Group(); scene.add(root);
  rgApp.world = rgBuildWorld(root, THREE, { detail: "high", scene });
  rgApp.scene = scene; rgApp.camera = camera; rgApp.renderer = renderer;
  rgApp.world.rgApplyLighting(scene, rgApp.hours);
}

let rgLast = performance.now();
function rgLoop(now) {
  const dt = Math.min(0.1, (now - rgLast) / 1000); rgLast = now;
  if (rgApp.screen === "race") rgStep(dt);
  rgApp.renderer?.render(rgApp.scene, rgApp.camera);
  requestAnimationFrame(rgLoop);
}

$("menu-enter")?.addEventListener("click", () => {
  if (!rgApp.renderer) { rgSetup3D(); rgWireTouch(); requestAnimationFrame(rgLoop); }
  $("menu-enter").toggleAttribute("hidden", true);
  $("menu-body").removeAttribute("hidden");
  rgRenderMenu();
});
rgRenderMenu();

// ------------------------------------------------------------ the round trip
//
// A briefing station's return (docs/interop.md): every fresh attempt at one of
// an event's stations is paid once into the passport ledger with the regatta
// as its source, and a return to `#site=<event id>` reopens that briefing.
const RG_PROGRAMME = "yacht-and-charter-crew";
function rgCheckStationReturns() {
  const events = rgCalendar().map((e) => ({ id: e.id, name: e.name, stations: e.stations }));
  const paid = ppCompleteReturns("regatta", events, {
    pay: (r) => (r.passed ? { reputation: 3 + (r.stars | 0), credits: 15 + 5 * (r.stars | 0) } : { reputation: 1, credits: 5 }),
  });
  for (const x of paid) if (!x.duplicate) rgToast(`${x.site.name}: ${x.record.passed ? "station passed" : "station logged"} — +${x.award.reputation} reputation, +${x.award.credits} credits.`, 4200);
  const back = ppReturnSite(window.location?.hash);
  const event = back ? rgEventById(back) : null;
  if (event) {
    // The same setup "Enter the harbour" does, so "Lines off" can race from here.
    if (!rgApp.renderer) { rgSetup3D(); rgWireTouch(); requestAnimationFrame(rgLoop); }
    rgOpenBriefing(event);
  }
}
rgCheckStationReturns();
window.addEventListener("pageshow", (e) => { if (e.persisted) rgCheckStationReturns(); });

window.__regattaTest = { app: rgApp, step: rgStep, startRace: rgStartRace };

// The shared control grammar and help overlay (shared/controls.js, docs/ui-review.md).
// The Guide (shared/guide.js): the floating help button and its question panel.
gdMount();
ctlMount({
  world: "the Regatta", quality: true,
  except: { map: "The course map is always on screen in a race.", interact: "Nothing to pick up on the water: the helm is the whole job." },
  unique: [
    { label: "Throttle and rudder (the helm)", keys: ["W", "S", "A", "D"], pad: "Left stick", touch: "Stick: forward throttle, sideways rudder" },
  ],
});
