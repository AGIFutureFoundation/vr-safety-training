// STORYLINE — pick your own adventure: the path registry and the learner's chosen path
// (docs/consoles/STORYLINE.md). SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes; PACKS, TYCOON and the worlds code against these):
//
//   stPaths() -> [{ id, label, blurb, audience, programmes: [curriculum id], flows: [flow id],
//                  greeters: [GRIOT parish character id], siteKinds: [site kind], kiosks: [KREWE kiosk id],
//                  prompts: bool }]
//       The seven paths, in picker order. `id` is one of ST_PATH_IDS — PACKS' `path` field uses exactly
//       these strings. `roam` has no programmes and `prompts: false` (it turns the prompts off).
//   stPath(id) -> path | null
//   stChosenPath() -> path id | null     the learner's pick, read from the passport's storage
//   stChoosePath(id) -> path id | null   store a pick (null clears it); fires "st:path" on globalThis
//   stPromptsOn() -> bool                false only when the learner chose Just Roam
//   stMountChip(el, { href }) -> void    the small path chip on the homepage's world card
//   stMountPicker(el, { onPick }) -> void  the seven path buttons (menu and world start)
//
// Storage: the passport's identity-scoped storage (profiles.js gtStorage, the same backing store as
// `vr-passport-v1`), under its own key `vr-passport-storyline-v1` — passport.js's loader keeps only its
// own three fields, so a field inside `vr-passport-v1` would be dropped on the next award.
//
// No three.js here and nothing heavy: the homepage imports this module for its chip. Every top-level name
// is prefixed st/ST_ (the bundler shares one scope).

import { gtStorage } from "./profiles.js";
import { dnCanSwitchPath } from "./dn-modules.js";

export const ST_KEY = "vr-passport-storyline-v1";
export const ST_PATH_IDS = ["union-trades", "k12", "first-responders", "un-training", "disaster-relief", "teachers", "roam"];

const stDef = (id, label, blurb, audience, o) => ({ id, label, blurb, audience, programmes: o.programmes ?? [], flows: o.flows ?? [],
  greeters: o.greeters ?? [], siteKinds: o.siteKinds ?? [], kiosks: o.kiosks ?? [], prompts: o.prompts ?? true });

/** The seven paths. Programmes are catalog curriculum ids; flows are WebXR/flows ids; greeters GRIOT parish ids. */
export const ST_PATHS = [
  stDef("union-trades", "Union Trades", "Work the job boards the way an apprentice does: the union programmes at the port, the rail yard, the barn, the bridge and the stage.", "apprentices and journeyworkers", {
    programmes: ["electrical-first-period", "confined-space", "fall-protection", "rigging-lifting", "stationary-engineer", "port-operations", "transit-ramp",
      "builders-trades", "bridge-and-structural", "plumbers-and-pipefitters", "railroad-crafts", "heavy-equipment-operators", "hotel-workers",
      "culinary-kitchen", "live-events", "water-and-gas-utility-crews", "aviation-maintenance-and-ground", "bay-area-union-edition"],
    flows: ["new-apprentice-safety"],
    greeters: ["gr-np-port-foreman", "gr-np-rail-conductor", "gr-np-streetcar-mechanic", "gr-np-stadium-rigger", "gr-np-hospitality-lead", "gr-np-pump-operator"],
    siteKinds: ["port", "rail", "rail-yard", "transit", "transit-barn", "streetcar", "bridge", "bridge-yard", "stadium", "hospitality", "airport", "pump", "shipyard", "construction", "union-hall", "ferry"],
    kiosks: ["kw-container-sort", "kw-pump-startup", "kw-ferry-lineup"],
  }),
  stDef("k12", "K-12", "Short field lessons at the sites, each tied to a classroom station and the trade that uses the idea.", "classroom learners", {
    programmes: ["k12-practical-math", "k12-science", "k12-history-and-civics", "k12-literacy-and-life-skills"],
    flows: ["k12-practical-math", "k12-science", "k12-history-and-civics", "k12-literacy-and-life-skills", "by-levee", "by-pump", "by-wetlands", "by-river",
      "by-family-plan", "by-water-cycle", "by-streetcar", "by-ferry", "by-catch", "by-flood-map", "by-containers", "by-floodwall"],
    greeters: ["gr-np-campus-teacher", "gr-np-wetlands-ranger", "gr-np-levee-inspector", "gr-np-pump-operator"],
    siteKinds: ["campus", "school", "wetland", "levee", "pump", "park", "nursery"],
    kiosks: ["kw-sandbag-relay", "kw-pump-startup", "kw-floodgate-closeout", "kw-container-sort", "kw-ferry-lineup"],
  }),
  stDef("first-responders", "First Responders", "Fire, EMS, police, crisis and relief: the stations for the people who run toward the call, with the crew's own check-in.", "fire, EMS, police and crisis crews", {
    programmes: ["first-responders", "situational-awareness", "hazmat-environmental"],
    flows: ["first-responder-refresher"],
    greeters: ["gr-np-nurse", "gr-np-pump-operator", "gr-np-levee-inspector"],
    siteKinds: ["hospital", "fire", "fire-station", "rescue-station", "lifeguard", "staging", "levee"],
    kiosks: ["kw-sandbag-relay", "kw-floodgate-closeout"],
  }),
  stDef("un-training", "UN Training", "Outbreak and disease response the WHO and UN way: surveillance, risk communication, isolation, water and sanitation, and the after-action review.", "public-health and humanitarian staff", {
    programmes: ["outbreak-response-who"],
    greeters: ["gr-np-nurse", "gr-np-campus-teacher", "gr-np-wetlands-ranger"],
    siteKinds: ["hospital", "campus", "school", "pump", "pumping-station", "staging"],
    kiosks: ["kw-pump-startup"],
  }),
  stDef("disaster-relief", "Disaster Relief", "Storm season on the delta and the bay: shelters, damage assessment, sandbag lines, pumps and floodgates, and a family readiness plan.", "relief crews and volunteers", {
    programmes: ["first-responders", "hazmat-environmental", "water-and-gas-utility-crews", "situational-awareness"],
    flows: ["by-family-plan", "by-flood-map", "by-levee", "by-floodwall", "by-pump", "first-responder-refresher"],
    greeters: ["gr-np-levee-inspector", "gr-np-pump-operator", "gr-np-nurse", "gr-np-wetlands-ranger"],
    siteKinds: ["levee", "floodwall", "pump", "pumping-station", "floodgate", "staging", "hospital", "wetland", "seawall", "remediation", "shoreline"],
    kiosks: ["kw-sandbag-relay", "kw-pump-startup", "kw-floodgate-closeout"],
  }),
  stDef("teachers", "Teachers", "Run the classroom flows, walk the lessons before the class does, and the school's own support-staff stations.", "teachers and school staff", {
    programmes: ["education-support-staff", "k12-practical-math", "k12-science", "k12-history-and-civics", "k12-literacy-and-life-skills", "civic-leadership-and-ei"],
    flows: ["k12-practical-math", "k12-science", "k12-history-and-civics", "k12-literacy-and-life-skills", "by-family-plan", "by-water-cycle"],
    greeters: ["gr-np-campus-teacher", "gr-np-wetlands-ranger", "gr-np-nurse"],
    siteKinds: ["campus", "school", "wetland", "park", "nursery"],
    kiosks: ["kw-container-sort", "kw-ferry-lineup"],
  }),
  stDef("roam", "Just Roam", "No prompts, no path: the world stays open. Every board, lesson and kiosk is still there when you walk up to it.", "everyone", { prompts: false }),
];

export function stPaths() { return ST_PATHS; }
export function stPath(id) { return ST_PATHS.find((p) => p.id === id) ?? null; }

function stStore() { try { return gtStorage(); } catch (_) { return null; } }

/** The stored state: `{ v: 1, path, branches: { [storyId]: branchId } }`. */
export function stLoad() {
  try {
    const raw = JSON.parse(stStore()?.getItem(ST_KEY) || "null");
    if (!raw || typeof raw !== "object") return { v: 1, path: null, branches: {} };
    return { v: 1, path: stPath(raw.path) ? raw.path : null, branches: raw.branches && typeof raw.branches === "object" ? raw.branches : {} };
  } catch (_) { return { v: 1, path: null, branches: {} }; }
}
export function stSave(state) { try { stStore()?.setItem(ST_KEY, JSON.stringify(state)); return true; } catch (_) { return false; } }

export function stChosenPath() { return stLoad().path; }
export function stChoosePath(id) {
  const s = stLoad();
  // A teacher or admin can lock a class's version to one path (DEAN): a locked path does not switch.
  // An unknown id clears the pick (as null does); the lock is asked only about real paths.
  try { if (id && stPath(id) && !dnCanSwitchPath(id)) return s.path; } catch (_) { /* no version set */ }
  s.path = stPath(id) ? id : null;
  stSave(s);
  try { globalThis.dispatchEvent?.(new CustomEvent("st:path", { detail: { path: s.path } })); } catch (_) { /* headless */ }
  return s.path;
}
export function stPromptsOn() { const p = stPath(stChosenPath()); return p ? p.prompts : true; }

const stEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** The seven path buttons; the chosen one is on. `onPick(id)` after the pick is stored. */
export function stMountPicker(el, { onPick = null, heading = "Pick your path" } = {}) {
  if (!el) return;
  const render = () => {
    const cur = stChosenPath();
    el.innerHTML = `<div class="st-picker" role="group" aria-label="${stEsc(heading)}"><p class="eyebrow">${stEsc(heading)}</p><div class="row">${ST_PATHS.map((p) =>
      `<button type="button" class="btn${p.id === cur ? " on" : ""}" data-st-path="${stEsc(p.id)}" aria-pressed="${p.id === cur}" title="${stEsc(p.blurb)}">${stEsc(p.label)}</button>`).join("")}</div>${cur ? `<p class="note">${stEsc(stPath(cur).blurb)}</p>` : ""}</div>`;
    for (const b of el.querySelectorAll("[data-st-path]")) b.addEventListener("click", () => { const id = stChoosePath(b.getAttribute("data-st-path")); render(); onPick?.(id); });
  };
  render();
}

/** The homepage world card's chip: "Path: <label>" or "Pick a path", linking to the world. */
export function stMountChip(el, { href = null } = {}) {
  if (!el) return;
  const p = stPath(stChosenPath());
  el.textContent = p ? `Path: ${p.label}` : "Pick a path";
  el.classList.add("st-chip");
  if (href && el.tagName === "A") el.href = href;
  el.title = p ? p.blurb : "Union Trades, K-12, First Responders, UN Training, Disaster Relief, Teachers or Just Roam";
}
