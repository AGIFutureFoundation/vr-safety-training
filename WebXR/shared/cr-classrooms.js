// CLASSROOMS — interiors that teach (docs/consoles/CLASSROOMS.md).
//
// Rooms where the learning happens, generic by kind and never a real building's interior:
//   k12       a K-12 classroom at every school site: a board (a SCHOLAR session), a science bench (the lesson's
//             K-12 lab station), a reading corner (a K-12 station at the site) and a flow desk (a COGNITION flow);
//             only K-12 content, at the room's age band's reading ceiling, no fear framing.
//   union     a union training centre at every union-hall site: a lobby board with the hall's programmes and trades
//             (trade references from tools/unions.json, no partnership claim) and five craft bays (electrical, pipe,
//             rigging, equipment, hazmat), each launching real catalog stations and a PROJECTSIM simulation.
//   academy   a Bay Restoration Academy room on the Bay Program maps (the ACADEMY console's programme; its stations
//             and simulations, read from its tracks when ea-academy.js merges — guarded).
//   robotics  a robotics bay (robot-cell / AMR / cobot stations and the ROBOTICS console's games, guarded).
//
// SEAM (the room contract, matching INTERIORS' shell so the content swaps onto shared/ix-interiors.js at merge):
//   crRoomsFor(parish) -> [{ id, kind, parish, site, name, band?, door:[x,z], size:[w,d], fixtures:[{ id, kind, label,
//                             at:[x,z] (room-local), launch:{ type:"lesson"|"station"|"sim"|"flow"|"game", id } }] }]
//   crBuildRoom({ THREE, room, tier }) -> THREE.Group (≤ CR_BUDGET.meshes meshes; phone tier drops the desks)
//   crMountClassrooms({ three, scene, root, parish, groundAt, launch, toast, host, shell? })
//     -> { rooms, tick(x,z), near(), enter(id), exit(), inside(), clamp(x,z), use(fixtureId), useNear(x,z) }
//   `launch(launch, room)` is the world's handler (SCHOLAR's scSession.open, a station link, PROJECTSIM's open, …).
//   `shell` is INTERIORS' mount when present (guarded): enter/exit then go through it and this module only furnishes.
//
// Every top-level name carries the `cr`/`CR_` prefix (the bundler shares one scope).

import { byLessonsFor, BY_BAND_CEILING } from "./by-parish-lessons.js";
import { esSessionLessons } from "./es-bay-lessons.js";
import { cgLessonsAt } from "./cg-runner.js";

/** The mesh budget of one built room (INTERIORS' interior budget: a room is a small fraction of a chunk). */
export const CR_BUDGET = { meshes: 24, phoneMeshes: 16, triangles: 6000 };

/** Every K-12 classroom's age band; its reading ceiling is BY_BAND_CEILING's. */
export const CR_K12_BAND = "upper primary";

/** The union training centre's craft bays: real catalog stations and a PROJECTSIM simulation per craft. */
export const CR_CRAFT_BAYS = [
  { id: "electrical", label: "Electrical bay", stations: ["arc-flash-label-study", "pm-electrical-room", "et-ev-fleet-depot-charging-and-arc-flash"], sim: "ps-zero-emission-charging-yard" },
  { id: "pipe", label: "Pipe bay", stations: ["valve-vault", "ut-pe-pipe-fusion-and-squeeze-off", "pl-steam-trap-and-condensate-line-repair"], sim: "ps-green-stormwater-build" },
  { id: "rigging", label: "Rigging bay", stations: ["rigging-loft", "chain-hoist", "rl-critical-lift-plan-and-signalperson"], sim: "ps-trash-capture-cleanout" },
  { id: "equipment", label: "Equipment bay", stations: ["trench-box", "op-excavator-trench-and-utility-locate", "forklift-dock"], sim: "ps-tidal-channel-dig" },
  { id: "hazmat", label: "Hazmat bay", stations: ["hazwoper-site-orientation", "hazmat-container-inspection", "spill-boom-deploy"], sim: "ps-pcb-sampling" },
];

/** Trade references for the halls' trade ids (checked against tools/unions.json's abbrev by check_classrooms). */
export const CR_TRADE_NAMES = { carpenters: "Carpenters", ibew: "IBEW", liuna: "LIUNA", "unite-here": "UNITE HERE", ilwu: "ILWU", iuoe: "IUOE", teamsters: "Teamsters", ua: "UA", ironworkers: "Ironworkers", smart: "SMART", seiu: "SEIU", afscme: "AFSCME", ila: "ILA", aft: "AFT", csea: "CSEA" };

/** The robotics bay: catalog stations, and ROBOTICS' games (rb-env.js scenarios; resolved when that module merges). */
export const CR_ROBOTICS = {
  stations: ["robot-cell", "ad-robot-cell-lockout-and-safe-reentry", "ad-amr-fleet-traffic-and-estop-drill", "ad-cobot-risk-assessment-and-speed-separation"],
  games: ["rb-teleop-pick-place", "rb-amr-fleet-routing", "rb-cobot-zone-setup", "rb-cell-entry"],
};
/** Where the robotics bays stand (a site id per map; ROBOTICS' own sites are on these maps). */
export const CR_ROBOTICS_SITES = { "bay-san-jose": "university-campus-plant-sj", "oak-west-oakland": "mandela-parkway-union-hall" };

/** The Bay Restoration Academy room: the first track's stations and simulation (ACADEMY's abag-strip-marsh-east work types). */
export const CR_ACADEMY = {
  stations: ["br-tidal-marsh-grading-amphibious-excavator", "br-levee-inspection-and-seepage", "br-turbidity-curtain-deployment", "br-native-planting-and-erosion-mats"],
  sim: "ps-tidal-channel-dig",
  note: "The Bay Restoration Academy is the platform's own training programme; union names are trade references, not partners.",
};

// ---- reading level (the same Flesch–Kincaid yardstick as tools/lib/reading-level.mjs, inlined: no tools/ in a bundle)
function crSyl(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, g ? g.length : 1);
}
/** The reading grade of a text (Flesch–Kincaid). */
export function crGrade(text) {
  const s = String(text).split(/[.!?]+(?:\s|$)/).filter((x) => /[a-z]/i.test(x)).length;
  const w = String(text).split(/\s+/).map((x) => x.replace(/[^A-Za-z'-]/g, "")).filter(Boolean);
  const syl = w.reduce((n, x) => n + crSyl(x), 0);
  return 0.39 * (w.length / Math.max(1, s)) + 11.8 * (syl / Math.max(1, w.length)) - 15.59;
}
/** The text a lesson reads out (title, steps, the check's question) — what check_k12 measures. */
export function crLessonText(l) { return [`${l.title}.`, ...(l.steps ?? []), l.check?.q ?? l.check?.question ?? ""].join(" "); }

/** The session lessons a parish's rooms can open (the same list the parishes app registers with SCHOLAR). */
export function crLessonsOf(parish) {
  return [...(parish.fieldLessons ?? []), ...byLessonsFor(parish.id), ...esSessionLessons(parish.id)].filter((l) => l && l.id && l.title);
}
/** Lessons within a band's reading ceiling, the site's own first, then the easiest. */
export function crK12Lessons(parish, siteId, band = CR_K12_BAND) {
  const ceil = BY_BAND_CEILING[band] ?? 8;
  return crLessonsOf(parish).map((l) => ({ l, g: crGrade(crLessonText(l)) })).filter((x) => x.g <= ceil)
    .sort((a, b) => (b.l.site === siteId) - (a.l.site === siteId) || a.g - b.g).map((x) => x.l);
}

const crIsSchool = (s) => s.kind === "school" || (s.kind === "campus" && /school/i.test(`${s.id} ${s.name}`));
const crR = (n) => Math.round(n * 100) / 100;

function crK12Room(parish, site) {
  const lessons = crK12Lessons(parish, site.id);
  const board = lessons[0] ?? null;
  const lab = lessons.find((l) => /^k12-/.test(l.k12 ?? "")) ?? null;
  const siteK12 = (site.stations ?? []).find((s) => /^k12-/.test(s)) ?? lab?.k12 ?? null;
  const flow = cgLessonsAt({ world: "parishes", parish: parish.id }).find((l) => /^k12-/.test(l.station ?? "")) ?? null;
  const fx = [];
  if (board) fx.push({ id: "board", kind: "board", label: `Board: ${board.title}`, at: [0, -4.2], launch: { type: "lesson", id: board.id } });
  if (lab) fx.push({ id: "bench", kind: "bench", label: `Science bench: the lab step (${lab.title})`, at: [3.4, -1.5], launch: { type: "station", id: lab.k12 } });
  if (siteK12) fx.push({ id: "reading", kind: "reading", label: "Reading corner", at: [-3.4, 2.6], launch: { type: "station", id: siteK12 } });
  if (flow) fx.push({ id: "flow", kind: "desk", label: `Learning desk: ${flow.title ?? flow.station}`, at: [3.2, 2.8], launch: { type: "flow", id: flow.station } });
  return { id: `cr-k12-${site.id}`, kind: "k12", parish: parish.id, site: site.id, name: `Classroom at ${site.name.replace(/^an? /, "")}`, band: CR_K12_BAND, size: [10, 10], fixtures: fx };
}

function crUnionRoom(parish, site) {
  const trades = (site.trades ?? []).map((t) => CR_TRADE_NAMES[t] ?? t);
  const fx = [{ id: "lobby", kind: "lobby", label: `Lobby: ${(site.programmes ?? []).join(", ")} · trades: ${trades.join(", ")}`, at: [0, 5], launch: { type: "station", id: (site.stations ?? [])[0] } }];
  CR_CRAFT_BAYS.forEach((b, i) => {
    const x = -8 + i * 4;
    fx.push({ id: `bay-${b.id}`, kind: "bay", label: b.label, at: [x, -3], launch: { type: "station", id: b.stations[0] }, more: [...b.stations.slice(1).map((id) => ({ type: "station", id })), { type: "sim", id: b.sim }] });
  });
  return { id: `cr-union-${site.id}`, kind: "union", parish: parish.id, site: site.id, name: `Training centre at ${site.name}`, trades: site.trades ?? [], size: [22, 14], fixtures: fx,
    note: "Programmes and trades are trade references; no partnership is claimed." };
}

function crAcademyRoom(parish, site) {
  const fx = CR_ACADEMY.stations.map((id, i) => ({ id: `st-${i}`, kind: "bench", label: `Work station ${i + 1}`, at: [-4.5 + i * 3, -3], launch: { type: "station", id } }));
  fx.push({ id: "sim", kind: "board", label: "Project simulation", at: [0, 4], launch: { type: "sim", id: CR_ACADEMY.sim } });
  return { id: `cr-academy-${parish.id}`, kind: "academy", parish: parish.id, site: site.id, name: "Bay Restoration Academy room", size: [14, 12], fixtures: fx, note: CR_ACADEMY.note };
}

function crRoboticsRoom(parish, site) {
  const fx = CR_ROBOTICS.stations.map((id, i) => ({ id: `st-${i}`, kind: "bench", label: `Robot station ${i + 1}`, at: [-4.5 + i * 3, -3.5], launch: { type: "station", id } }));
  CR_ROBOTICS.games.forEach((id, i) => fx.push({ id: `game-${i}`, kind: "bay", label: `Robotics game ${i + 1}`, at: [-4.5 + i * 3, 3.5], launch: { type: "game", id } }));
  return { id: `cr-robotics-${parish.id}`, kind: "robotics", parish: parish.id, site: site.id, name: "Robotics bay", size: [14, 12], fixtures: fx };
}

/** Every room of one parish map (see the SEAM). Deterministic; no three.js. */
export function crRoomsFor(parish) {
  if (!parish?.sites) return [];
  const out = [];
  const door = (site, room) => { room.door = [crR(site.position[0] + 6), crR(site.position[1] + 6)]; return room; };
  for (const s of parish.sites) if (crIsSchool(s)) out.push(door(s, crK12Room(parish, s)));
  for (const s of parish.sites) if (s.kind === "union-hall") out.push(door(s, crUnionRoom(parish, s)));
  if (/^bp-/.test(parish.id) && parish.sites[0]) out.push(door(parish.sites[0], crAcademyRoom(parish, parish.sites[0])));
  const rs = parish.sites.find((s) => s.id === CR_ROBOTICS_SITES[parish.id]);
  if (rs) { const r = crRoboticsRoom(parish, rs); r.door = [crR(rs.position[0] - 6), crR(rs.position[1] + 6)]; out.push(r); }
  return out.filter((r) => r.fixtures.length);
}

/** Build a room's furniture as a small group (floor, walls, and one mesh per fixture; desks instanced). */
export function crBuildRoom({ THREE, room, tier = "desktop" }) {
  const g = new THREE.Group(); g.name = room.id;
  const [w, d] = room.size, h = 3.2;
  const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
  const box = (sx, sy, sz, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat(c)); m.position.set(x, y, z); g.add(m); return m; };
  box(w, 0.1, d, room.kind === "k12" ? 0xc9b48a : 0x8f959c, 0, -0.05, 0);
  box(w, h, 0.2, 0xe8e2d4, 0, h / 2, -d / 2); box(w, h, 0.2, 0xe8e2d4, 0, h / 2, d / 2);
  box(0.2, h, d, 0xe8e2d4, -w / 2, h / 2, 0); box(0.2, h, d, 0xe8e2d4, w / 2, h / 2, 0);
  const COL = { board: 0x1f4d3a, bench: 0x6b5a45, reading: 0x9b6bc4, desk: 0x4f86c6, lobby: 0x2a3f5f, bay: 0xf2a33a };
  for (const f of room.fixtures) {
    const tall = f.kind === "board" || f.kind === "lobby";
    const m = box(tall ? 3.2 : 1.6, tall ? 1.4 : 0.9, tall ? 0.12 : 0.8, COL[f.kind] ?? 0x888888, f.at[0], tall ? 1.6 : 0.45, f.at[1]);
    m.userData.crFixture = f.id;
  }
  if (room.kind === "k12" && tier !== "phone") {
    const desks = new THREE.InstancedMesh(new THREE.BoxGeometry(1.1, 0.75, 0.6), mat(0xa3835c), 12);
    const q = new THREE.Object3D();
    for (let i = 0; i < 12; i++) { q.position.set(-2.4 + (i % 4) * 1.6, 0.375, -1.6 + Math.floor(i / 4) * 1.5); q.updateMatrix(); desks.setMatrixAt(i, q.matrix); }
    g.add(desks);
  }
  return g;
}

/** Count a built group's meshes and triangles (the checker's budget line). */
export function crStats(group) {
  let meshes = 0, triangles = 0;
  group.traverse((o) => { if (!o.isMesh) return; meshes++; const gi = o.geometry; const t = (gi.index ? gi.index.count : gi.attributes.position.count) / 3; triangles += t * (o.isInstancedMesh ? o.count : 1); });
  return { meshes, triangles };
}

const CR_CSS = `.cr-chip{position:fixed;left:12px;bottom:132px;z-index:30;background:#0b141dee;color:#edf6fb;border:1px solid #f2c14b88;border-radius:12px;padding:8px 12px;font:14px/1.35 system-ui,sans-serif;display:flex;gap:8px;align-items:center}
.cr-panel{position:fixed;left:12px;top:72px;z-index:31;width:min(360px,calc(100vw - 24px));max-height:calc(100vh - 96px);overflow:auto;background:#0b141df2;color:#edf6fb;border:1px solid #f2c14b66;border-radius:14px;padding:12px 14px;font:14px/1.4 system-ui,sans-serif}
.cr-panel h2{font-size:16px;margin:0 0 6px}.cr-panel p{margin:0 0 8px;color:#a9c3d2;font-size:12.5px}.cr-panel ul{list-style:none;padding:0;margin:0;display:grid;gap:6px}
.cr-chip button,.cr-panel button{font:inherit;min-height:40px;padding:6px 10px;border-radius:10px;border:1px solid #f2c14b88;background:#142130;color:#edf6fb;cursor:pointer;text-align:left;width:100%}
.cr-chip button{width:auto}[hidden].cr-chip,[hidden].cr-panel{display:none!important}`;

/** Mount the rooms in a world page (the SEAM above). Works headless (no DOM) for the checker. */
export function crMountClassrooms({ three: THREE = null, scene = null, root = null, parish, groundAt = () => 0, launch = () => false, toast = () => {}, host = null, tier = "desktop", shell = null } = {}) {
  const rooms = crRoomsFor(parish);
  const hasDom = typeof document !== "undefined";
  let near = null, cur = null, group = null, back = null, origin = [0, 0, 0];
  let chip = null, chipText = null, panel = null;
  if (hasDom) {
    if (!document.getElementById("cr-style")) { const st = document.createElement("style"); st.id = "cr-style"; st.textContent = CR_CSS; document.head.appendChild(st); }
    const h = host ?? document.body;
    chip = document.createElement("div"); chip.className = "cr-chip"; chip.hidden = true; chip.setAttribute("role", "status");
    chipText = document.createElement("span"); const go = document.createElement("button"); go.textContent = "Go in (E)";
    go.addEventListener("click", () => near && api.enter(near.id)); chip.append(chipText, go); h.appendChild(chip);
    panel = document.createElement("section"); panel.className = "cr-panel"; panel.hidden = true; panel.setAttribute("aria-label", "Room"); h.appendChild(panel);
  }
  const fire = (l) => { if (!l?.id) return false; const ok = launch(l, cur); if (ok === false) toast("That one opens from its station page."); return ok; };
  function renderPanel() {
    if (!panel) return;
    panel.textContent = "";
    const h2 = document.createElement("h2"); h2.textContent = cur.name; panel.appendChild(h2);
    if (cur.note) { const p = document.createElement("p"); p.textContent = cur.note; panel.appendChild(p); }
    const ul = document.createElement("ul");
    for (const f of cur.fixtures) {
      for (const l of [f.launch, ...(f.more ?? [])]) {
        const li = document.createElement("li"), b = document.createElement("button");
        b.textContent = l === f.launch ? f.label : `${f.label}: ${l.type === "sim" ? "simulation" : "station"} ${l.id}`;
        b.dataset.crFixture = f.id; b.addEventListener("click", () => fire(l)); li.appendChild(b); ul.appendChild(li);
      }
    }
    const li = document.createElement("li"), out = document.createElement("button"); out.textContent = "Go out to the door (E at the door)"; out.addEventListener("click", () => api.exit());
    li.appendChild(out); ul.appendChild(li); panel.appendChild(ul); panel.hidden = false;
  }
  const api = {
    rooms,
    tick(x, z) {
      if (cur) return;
      near = rooms.find((r) => Math.hypot(x - r.door[0], z - r.door[1]) < 5) ?? null;
      if (chip) { chip.hidden = !near; if (near) chipText.textContent = near.name; }
    },
    near: () => near,
    inside: () => cur,
    /** Go in: hide the outdoor world, build the room at the door, return where to stand. */
    enter(id, from = null) {
      const r = rooms.find((x) => x.id === id);
      if (!r || cur) return null;
      cur = r; back = from ?? r.door;
      const y = groundAt(r.door[0], r.door[1]);
      origin = [r.door[0], y, r.door[1]];
      if (shell?.enter) shell.enter(r);
      else if (THREE && scene) { group = crBuildRoom({ THREE, room: r, tier }); group.position.set(origin[0], origin[1], origin[2]); scene.add(group); if (root) root.visible = false; }
      if (chip) chip.hidden = true;
      renderPanel(); toast(`${r.name}. Walk to the board or a bay and press E, or pick from the list.`);
      return { x: origin[0], z: origin[2] + r.size[1] / 2 - 1.5 };
    },
    /** Go out: remove the room, show the world, stand at the door. */
    exit() {
      if (!cur) return null;
      if (shell?.exit) shell.exit(cur);
      if (group) { scene.remove(group); group.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); }); group = null; }
      if (root) root.visible = true;
      if (panel) panel.hidden = true;
      const at = { x: back[0], z: back[1] + 1.5 }; cur = null; return at;
    },
    /** Keep the learner inside the walls (the minimal room's collider until INTERIORS' shell lands). */
    clamp(x, z) {
      if (!cur) return { x, z };
      const hw = cur.size[0] / 2 - 0.5, hd = cur.size[1] / 2 - 0.5;
      return { x: Math.min(origin[0] + hw, Math.max(origin[0] - hw, x)), z: Math.min(origin[2] + hd, Math.max(origin[2] - hd, z)) };
    },
    use(fixtureId) { const f = cur?.fixtures.find((x) => x.id === fixtureId); return f ? fire(f.launch) : false; },
    /** E inside: the nearest fixture within reach, or out when at the door wall. */
    useNear(x, z) {
      if (!cur) return false;
      let best = null, bd = 2.2;
      for (const f of cur.fixtures) { const d = Math.hypot(x - (origin[0] + f.at[0]), z - (origin[2] + f.at[1])); if (d < bd) { bd = d; best = f; } }
      if (best) return fire(best.launch);
      if (z > origin[2] + cur.size[1] / 2 - 1.2) return api.exit();
      return false;
    },
    origin: () => origin,
  };
  return api;
}
