// PROJECTSIM — full-procedure training simulations for each Bay Program project type (console PROJECTSIM,
// docs/consoles/PROJECTSIM.md). SmartCiti.X Powered by AGI Corp.
//
// SEAMS (documented shapes):
//
//   psSims() -> PS_SIMS       [{ id, name, kind, work, briefing, live?, steps: [{ id, title, station, step, practice, safe, unsafe,
//                                gate?, requires: [stepId], live? }] }]
//   psSim(id) -> sim | null
//   psPlacesFor(parishId, { lookup = npParish }) -> [{ sim, parish, site, guarded? }]
//        the in-tree placements plus the guarded ones (BAYMAP / TIDELANDS maps) whose map and site resolve through lookup(id)
//   psScore(sim, run) -> { points, max, score (0..100), passed (score >= PS_PASS), penalties }
//        run: { order: [stepId in the order done], calls: { [stepId]: true safe | false unsafe } }
//        a step: 100 when done with the safe call, 0 unsafe or skipped; PS_ORDER_PENALTY off (floor 0) when done before one of
//        its `requires` gates was done safely (a skipped permit or lockout)
//   psMistakes(sim, run) -> [{ step, kind: "unsafe" | "order" | "skipped", gate?, text }]   the mistake log
//   psDebrief(sim, run) -> { wentWell: [title], mistakes, improvement: { step, text } | null, score }
//   psCreditLevel(score) -> 1..5 (TYCOON pay level)
//   psRecord(simId, result, { attemptId }) -> { best, award, credits }  best score under PS_KEY; award via psSetRecorder (ppAward);
//        Crew Credits through TYCOON tyEarn(simId, { recordId: "projectsim:<id>", level, passed }) — paid once per simulation
//   psDeanModules() -> [{ id: "projectsim:<id>", title, kind: "projectsim", stations, minutes, launch: { world: "parishes", parish, site } }]
//   psTideWindow(parish, site) -> { depth, x, z, open } | null    TERRAFORM's tfWaterDepthAt at the nearest water to the site;
//        `open` is the schematic low-water window (depth under PS_TIDE_OPEN — a game value, not a tide figure)
//   psPlaceExcavator(parish, site, { mats }) -> { settled, restY, groundY, seconds }   a NEWTON body dropped at the site on the
//        parish ground (on a mat box when mats are laid), stepped until it sleeps
//   psInfiltration(parish, site, t) -> { dry, level (0..1 schematic), drained }   the build site is dry by tfWaterDepthAt; the test
//        water drains down a schematic curve (no figures)
//   psMountProjectSim({ three, root, parish, el, tier, reducedMotion, toast, stationHref, siteName, onOpen })
//        -> { open(simId, siteId), boardRows(el, siteId), list(), active(), counts() }
//
// Every top-level name is prefixed ps/PS_ (the bundler shares one scope). No injury is shown or described.

import { PS_SIMS, PS_PLACES, PS_GUARDED } from "./ps-projectsim-data.js";
import { npParish } from "./np-parishes.js";
import { npHeightAt } from "./np-parish.js";
import { tfWaterDepthAt } from "./tf-terraform.js";
import { nwWorld } from "./nw-physics.js";
import { tyEarn } from "./ty-economy.js";
import { gtStorage } from "./profiles.js";

export { PS_SIMS, PS_PLACES, PS_GUARDED };
export const PS_KEY = "vr-passport-projectsim-v1";
export const PS_PASS = 80;
export const PS_ORDER_PENALTY = 50;
export const PS_TIDE_OPEN = 0.6;
export const PS_SITE_REACH = 240;

export function psSims() { return PS_SIMS; }
export function psSim(id) { return PS_SIMS.find((s) => s.id === id) ?? null; }

export function psPlacesFor(parishId, { lookup = npParish } = {}) {
  const here = PS_PLACES.filter((p) => p.parish === parishId);
  for (const g of PS_GUARDED) {
    if (g.parish !== parishId) continue;
    let map = null;
    try { map = lookup?.(g.parish) ?? null; } catch (_) { map = null; }
    const site = g.site ? map?.sites?.find((s) => s.id === g.site) : map?.sites?.find((s) => g.kinds.includes(s.kind));
    if (site) here.push({ sim: g.sim, parish: g.parish, site: site.id, guarded: true });
  }
  return here;
}

/** For each step: was it done, safely, and were its gates done safely before it? */
function psWalk(sim, run = {}) {
  const order = Array.isArray(run.order) ? run.order : [];
  const calls = run.calls ?? {};
  const at = new Map(order.map((id, i) => [id, i]));
  return sim.steps.map((s) => {
    const done = at.has(s.id);
    const safe = done && calls[s.id] === true;
    const missing = s.requires.filter((g) => !(at.has(g) && at.get(g) < at.get(s.id) && calls[g] === true));
    return { s, done, safe, missing: done ? missing : [] };
  });
}

export function psScore(sim, run = {}) {
  const max = sim.steps.length * 100;
  let points = 0, penalties = 0;
  for (const w of psWalk(sim, run)) {
    if (!w.safe) continue;
    let p = 100;
    if (w.missing.length) { p = Math.max(0, p - PS_ORDER_PENALTY); penalties += 1; }
    points += p;
  }
  const score = max ? Math.round((points / max) * 100) : 0;
  return { points, max, score, passed: score >= PS_PASS, penalties };
}

export function psMistakes(sim, run = {}) {
  const out = [];
  for (const w of psWalk(sim, run)) {
    if (!w.done) { out.push({ step: w.s.id, kind: "skipped", text: `Skipped: ${w.s.title}.` }); continue; }
    if (!w.safe) out.push({ step: w.s.id, kind: "unsafe", text: `Not the safe call at "${w.s.title}" — ${w.s.practice}` });
    for (const g of w.missing) {
      const gate = sim.steps.find((x) => x.id === g);
      out.push({ step: w.s.id, kind: "order", gate: g, text: `"${w.s.title}" came before the ${gate?.gate ?? "gate"} step "${gate?.title ?? g}" was done safely.` });
    }
  }
  return out;
}

export function psDebrief(sim, run = {}) {
  const walk = psWalk(sim, run);
  const wentWell = walk.filter((w) => w.safe && !w.missing.length).map((w) => w.s.title);
  const mistakes = psMistakes(sim, run);
  const first = mistakes.find((m) => m.kind === "order") ?? mistakes.find((m) => m.kind === "unsafe") ?? mistakes[0] ?? null;
  const step = first ? sim.steps.find((s) => s.id === (first.kind === "order" ? first.gate : first.step)) : null;
  const improvement = step ? { step: step.id, text: `${step.title}: ${step.practice}` } : null;
  return { wentWell, mistakes, improvement, score: psScore(sim, run).score };
}

export function psCreditLevel(score) { return Math.max(1, Math.min(5, 1 + Math.floor((Math.max(PS_PASS, score) - PS_PASS) / 5))); }

let psRecorder = null;
export function psSetRecorder(fn) { psRecorder = typeof fn === "function" ? fn : null; }
function psStore() { try { return gtStorage(); } catch (_) { return null; } }
export function psLoad() {
  try { const raw = JSON.parse(psStore()?.getItem(PS_KEY) || "null"); return raw && typeof raw === "object" && raw.best ? raw : { v: 1, best: {}, runs: 0 }; }
  catch (_) { return { v: 1, best: {}, runs: 0 }; }
}
export function psRecord(simId, result, { attemptId = null } = {}) {
  const sim = psSim(simId);
  if (!sim) return null;
  const s = psLoad();
  s.best[simId] = Math.max(s.best[simId] ?? 0, result.score);
  s.runs = (s.runs ?? 0) + 1;
  try { psStore()?.setItem(PS_KEY, JSON.stringify(s)); } catch (_) { /* private window */ }
  let award = null, credits = null;
  try { award = psRecorder?.(`projectsim:${simId}`, { reputation: Math.round(result.score / 10), reason: `${sim.name} simulation: ${result.score}/100 on safe practice`, attemptId }) ?? null; } catch (_) { award = null; }
  try { credits = tyEarn(simId, { recordId: `projectsim:${simId}`, level: psCreditLevel(result.score), passed: !!result.passed }); } catch (_) { credits = null; }
  return { best: s.best[simId], award, credits };
}

export function psDeanModules() {
  return PS_SIMS.map((sim) => {
    const place = PS_PLACES.find((p) => p.sim === sim.id);
    return { id: `projectsim:${sim.id}`, title: `${sim.name} simulation`, kind: "projectsim", stations: [...new Set(sim.steps.map((s) => s.station))],
      paths: ["union-trades"], minutes: sim.steps.length * 2 + 2, launch: { world: "parishes", parish: place?.parish ?? null, site: place?.site ?? null } };
  });
}

// ------------------------------------------------------------------ TERRAFORM / NEWTON readings

export function psTideWindow(parish, site) {
  const [sx, sz] = site.position;
  let best = null;
  for (let r = 0; r <= PS_SITE_REACH; r += 12) {
    const n = r === 0 ? 1 : Math.max(8, Math.round(r / 6));
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2, x = sx + Math.cos(a) * r, z = sz + Math.sin(a) * r;
      const d = tfWaterDepthAt(parish, x, z);
      if (d > 0) { best = { depth: +d.toFixed(2), x: Math.round(x), z: Math.round(z) }; break; }
    }
    if (best) break;
  }
  return best ? { ...best, open: best.depth < PS_TIDE_OPEN } : null;
}

export function psPlaceExcavator(parish, site, { mats = true } = {}) {
  const [x, z] = site.position;
  const ground = (px, pz) => npHeightAt(parish, px, pz);
  const g = ground(x, z);
  const matBox = { min: [x - 3, g, z - 3], max: [x + 3, g + 0.15, z + 3], kind: "mat" };
  const world = nwWorld({ groundAt: ground, colliders: mats ? [matBox] : [] });
  const body = world.addBody({ id: "ps-excavator", pos: [x, g + 3, z], half: [1.4, 1.2, 2.2], mass: 1200, restitution: 0.05 });
  let t = 0;
  while (t < 6 && !body.sleeping) { world.step(1 / 60); t += 1 / 60; }
  const restY = +(body.pos[1] - body.half[1]).toFixed(3);
  return { settled: !!body.sleeping || Math.abs(body.vel[1]) < 0.05, restY, groundY: +g.toFixed(3), onMat: mats && restY >= g + 0.14, seconds: +t.toFixed(2) };
}

export function psInfiltration(parish, site, t = 0) {
  const [x, z] = site.position;
  const dry = tfWaterDepthAt(parish, x, z) === 0;
  const level = dry ? Math.max(0, +(1 - Math.min(1, Math.max(0, t) / 30)).toFixed(3)) : 1;
  return { dry, level, drained: dry && level === 0 };
}

// ------------------------------------------------------------------ the mount

const psEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let psCssDone = false;
function psCss() {
  if (psCssDone || typeof document === "undefined") return;
  psCssDone = true;
  const st = document.createElement("style");
  st.textContent = `#ps-panel{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(480px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;z-index:41;background:rgba(16,24,30,.97);color:#eef2f6;border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:16px;font:14px/1.45 system-ui,sans-serif}
  #ps-panel h2{margin:0 0 6px;font-size:18px}#ps-panel .ps-meta{opacity:.8;font-size:12px}#ps-panel .ps-live{color:#9fd8ff}
  #ps-panel .ps-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#ps-panel button,#ps-panel a{min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);color:inherit;font:inherit;text-decoration:none;cursor:pointer;text-align:left}
  #ps-panel ul,#ps-panel ol{margin:6px 0 6px 18px;padding:0}`;
  document.head.appendChild(st);
}
/** A stable shuffle by id, so the learner must know the order (the list never gives it away). */
function psShuffle(steps, seed) {
  let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return steps.map((s, i) => [((h ^ Math.imul(i + 1, 2654435761)) >>> 0) % 1000, s]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
}

/** Mount the simulations in a parish page (see the header). */
export function psMountProjectSim({ three = null, root = null, parish, el = null, tier = "balanced", reducedMotion = false, toast = null, stationHref = null, siteName = null, onOpen = null } = {}) {
  const T = three;
  let run = null, rig = null;
  const nameOf = (siteId) => siteName?.(siteId) ?? parish.sites.find((s) => s.id === siteId)?.name ?? siteId;
  const panel = () => {
    psCss();
    let p = document.getElementById("ps-panel");
    if (!p) { p = document.createElement("div"); p.id = "ps-panel"; p.setAttribute("role", "dialog"); p.setAttribute("aria-modal", "true"); p.setAttribute("aria-labelledby", "ps-title"); document.body.appendChild(p); }
    p.hidden = false; return p;
  };
  const dropRig = () => { if (rig) { rig.parent?.remove(rig); rig.geometry.dispose(); rig.material.dispose(); rig = null; } };
  const close = () => { run = null; dropRig(); const p = typeof document !== "undefined" && document.getElementById("ps-panel"); if (p) p.hidden = true; };
  const addRig = (site, placed) => {
    if (!T || !root || tier === "low" || rig) return;
    rig = new T.Mesh(new T.BoxGeometry(2.8, 2.4, 4.4), new T.MeshStandardMaterial({ color: 0xe0a526, roughness: 0.7 }));
    rig.name = "ps-excavator";
    const [x, z] = site.position;
    rig.position.set(x + 10, placed.restY + 1.2, z + 10);
    root.add(rig);
  };
  const liveLine = (step) => {
    const kind = step.live ?? (step.id === "tide" ? "tide" : step.id === "drain-test" ? "infiltration" : null);
    if (kind === "tide") {
      const w = psTideWindow(parish, run.site);
      return w ? `TERRAFORM water at the nearest channel: ${w.depth} m on the staff (a game value) — the schematic work window is ${w.open ? "open" : "closed; wait for the ebb"}.` : "No water within reach of this site in the map — read the staff at the channel mouth per the plan.";
    }
    if (kind === "excavator") {
      const r = psPlaceExcavator(parish, run.site, { mats: run.order.includes("mats") && run.calls.mats === true });
      run.placed = r;
      return `NEWTON: the machine settled ${r.onMat ? "on the mats" : "on bare marsh ground — lay the mats first"} in ${r.seconds}s.`;
    }
    if (kind === "infiltration") {
      const r = psInfiltration(parish, run.site, 30);
      return r.dry ? "TERRAFORM: the cell sits on dry ground; the test water drains down (a schematic curve, no figures) — read and log it." : "TERRAFORM shows standing water here — a bioretention cell is not built in standing water.";
    }
    return null;
  };
  function renderPick() {
    const p = panel(), left = psShuffle(run.sim.steps.filter((s) => !run.order.includes(s.id)), run.sim.id);
    p.innerHTML = `<p class="ps-meta">${psEsc(run.sim.name)} · ${run.order.length} of ${run.sim.steps.length} steps done · ${psMistakes(run.sim, run).filter((m) => m.kind !== "skipped").length} in the mistake log</p>` +
      `<h2 id="ps-title">What comes next?</h2><p>Pick the next step of the procedure. The order matters.</p>` +
      `<div class="ps-row">${left.map((s) => `<button type="button" data-ps-step="${psEsc(s.id)}">${psEsc(s.title)}</button>`).join("")}</div>` +
      `<div class="ps-row"><button type="button" data-ps-finish>Finish here</button></div>`;
    for (const b of p.querySelectorAll("[data-ps-step]")) b.addEventListener("click", () => renderStep(b.getAttribute("data-ps-step")));
    p.querySelector("[data-ps-finish]").addEventListener("click", finish);
  }
  function renderStep(stepId) {
    const s = run.sim.steps.find((x) => x.id === stepId), p = panel();
    run.order.push(s.id);
    const flip = run.order.length % 2 === 0;
    const choices = flip ? [["unsafe", s.unsafe], ["safe", s.safe]] : [["safe", s.safe], ["unsafe", s.unsafe]];
    const href = stationHref?.(s.station, run.site.id);
    const live = liveLine(s);
    p.innerHTML = `<p class="ps-meta">${psEsc(run.sim.name)} · step ${run.order.length} of ${run.sim.steps.length}</p><h2 id="ps-title">${psEsc(s.title)}</h2>` +
      `<p>${psEsc(s.practice)}</p>${live ? `<p class="ps-live">${psEsc(live)}</p>` : ""}` +
      `<p class="ps-meta">From the station ${href ? `<a href="${psEsc(href)}">${psEsc(s.station)}</a>` : psEsc(s.station)} · step ${psEsc(s.step)}</p>` +
      `<div class="ps-row">${choices.map(([k, t]) => `<button type="button" data-ps="${k}">${psEsc(t)}</button>`).join("")}</div>`;
    for (const b of p.querySelectorAll("[data-ps]")) b.addEventListener("click", () => answer(s, b.getAttribute("data-ps") === "safe"));
  }
  function answer(s, safe) {
    run.calls[s.id] = safe;
    const order = psMistakes(run.sim, run).filter((m) => m.kind === "order" && m.step === s.id);
    toast?.(safe ? (order.length ? `Safe call, but out of order — ${order[0].text}` : `Safe call: ${s.title}.`) : `Not the safe call — ${s.practice}`, 3500);
    if (s.live === "excavator" && safe && run.placed) addRig(run.site, run.placed);
    if (run.order.length < run.sim.steps.length) renderPick(); else finish();
  }
  function finish() {
    const sim = run.sim, sc = psScore(sim, run), db = psDebrief(sim, run);
    const rec = psRecord(sim.id, sc, { attemptId: `${run.site.id}-${run.started}` });
    const p = panel();
    const credit = rec?.credits?.paid ? ` · +${rec.credits.amount} Crew Credits` : "";
    p.innerHTML = `<h2 id="ps-title">Debrief — ${psEsc(sim.name)}</h2><p><b>${sc.score}/100</b> on safe practice${sc.passed ? " — simulation passed" : ""}. Best: ${rec?.best ?? sc.score}${credit}.</p>` +
      `<p class="ps-meta">What went well</p><ul>${db.wentWell.length ? db.wentWell.map((t) => `<li>${psEsc(t)}</li>`).join("") : "<li>You started the procedure — run it again to build the order in.</li>"}</ul>` +
      `<p class="ps-meta">Mistake log · ${db.mistakes.length}</p><ul>${db.mistakes.length ? db.mistakes.map((m) => `<li>${psEsc(m.text)}</li>`).join("") : "<li>None.</li>"}</ul>` +
      `<p class="ps-meta">One improvement</p><p>${psEsc(db.improvement ? db.improvement.text : "Keep the same order next time.")}</p>` +
      `<div class="ps-row"><button type="button" data-ps-close>Close</button></div>`;
    p.querySelector("[data-ps-close]").addEventListener("click", close);
  }
  function open(simId, siteId) {
    const sim = psSim(simId), site = parish.sites.find((s) => s.id === siteId);
    if (!sim || !site || typeof document === "undefined") return false;
    close();
    try { onOpen?.(sim.id, site.id); } catch (_) { /* the host's modal close never blocks a run */ }
    run = { sim, site, order: [], calls: {}, started: Date.now().toString(36), placed: null };
    const p = panel();
    p.innerHTML = `<p class="ps-meta">Training simulation at ${psEsc(nameOf(site.id))} · SmartCiti.X Powered by AGI Corp</p><h2 id="ps-title">${psEsc(sim.name)}</h2><p>${psEsc(sim.briefing)}</p>` +
      `<p class="ps-meta">${sim.steps.length} steps, each a step of a real catalog station. The work this practises is funded under the Bay Program awards and Clean Ports (the platform's resource hub carries the sources); no project figures are used here.</p>` +
      `<div class="ps-row"><button type="button" data-ps-go>Start the simulation</button><button type="button" data-ps-close>Not now</button></div>`;
    p.querySelector("[data-ps-go]").addEventListener("click", renderPick);
    p.querySelector("[data-ps-close]").addEventListener("click", close);
    return true;
  }
  function list() { return psPlacesFor(parish.id); }
  function boardRows(box, siteId) {
    if (!box) return 0;
    box.textContent = "";
    const items = list().filter((it) => it.site === siteId);
    if (!items.length) return 0;
    box.innerHTML = `<p class="eyebrow" style="margin-top:12px">Project simulations here · ${items.length}</p><div class="row" style="flex-wrap:wrap">${items.map((it) =>
      `<button type="button" class="btn" data-ps-open="${psEsc(it.sim)}" data-ps-site="${psEsc(it.site)}">${psEsc(psSim(it.sim).name)}</button>`).join("")}</div>`;
    for (const b of box.querySelectorAll("[data-ps-open]")) b.addEventListener("click", () => open(b.getAttribute("data-ps-open"), b.getAttribute("data-ps-site")));
    return items.length;
  }
  function render() {
    if (!el) return;
    const items = list();
    el.textContent = "";
    if (!items.length) return;
    el.innerHTML = `<p class="eyebrow" style="margin-top:16px">Project simulations here · ${items.length}</p><div class="row" style="flex-wrap:wrap">${items.map((it) =>
      `<button type="button" class="btn" data-ps-open="${psEsc(it.sim)}" data-ps-site="${psEsc(it.site)}">${psEsc(psSim(it.sim).name)} · ${psEsc(nameOf(it.site))}</button>`).join("")}</div>`;
    for (const b of el.querySelectorAll("[data-ps-open]")) b.addEventListener("click", () => open(b.getAttribute("data-ps-open"), b.getAttribute("data-ps-site")));
  }
  render();
  return {
    open, boardRows, list,
    active() { return run ? { sim: run.sim.id, site: run.site.id, done: run.order.length } : null; },
    counts() { return { places: list().length, meshes: rig ? 1 : 0, reducedMotion: !!reducedMotion }; },
  };
}
