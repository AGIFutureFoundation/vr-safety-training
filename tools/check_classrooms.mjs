#!/usr/bin/env node
// CLASSROOMS checker (docs/consoles/CLASSROOMS.md): rooms that teach, headless.
//   1. coverage: every map with a school site gets a K-12 classroom per school, every union-hall site a training centre,
//      each Bay Program map an Academy room, the robotics maps a robotics bay;
//   2. budget: every room builds (desktop and phone) within CR_BUDGET's meshes and triangles;
//   3. launches: every fixture's launch resolves — a catalog station, a session lesson SCHOLAR registers, a PROJECTSIM
//      simulation, a K-12 station for a COGNITION flow; a ROBOTICS game resolves once rb-robotics-data.js is in the tree
//      (pending before, never a fail);
//   4. K-12 rooms launch only K-12 content (k12- stations, lessons with a k12- station), every lesson within the room
//      band's reading ceiling, no fear words, no digits in labels;
//   5. union rooms: trade names are unions.json references, a no-partnership note, no partnership words;
//   6. the enter / use / exit contract end to end on one K-12 classroom (the board opens a real lesson).
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readingStats } from "./lib/reading-level.mjs";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SH = join(ROOT, "WebXR/shared");
const { NP_PARISHES } = await import("../WebXR/shared/np-parishes.js");
const CR = await import("../WebXR/shared/cr-classrooms.js");
const { SC_LESSONS } = await import("../WebXR/shared/sc-lessons.js");
const { PS_SIMS } = await import("../WebXR/shared/ps-projectsim-data.js");
const { BY_BAND_CEILING } = await import("../WebXR/shared/by-parish-lessons.js");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const stations = new Set(catalog.stations.map((s) => s.id));
const unions = JSON.parse(readFileSync(join(ROOT, "tools/unions.json"), "utf8")).unions;
let rbIds = null;
if (existsSync(join(SH, "rb-robotics-data.js"))) { try { rbIds = new Set((await import("../WebXR/shared/rb-robotics-data.js")).RB_SCENARIOS.map((s) => s.id)); } catch { rbIds = null; } }
const ixShell = existsSync(join(SH, "ix-interiors.js"));

let passed = 0, failed = 0;
const fail = (where, msg) => { failed++; if (failed <= 25) console.log(`  FAIL ${where}: ${msg}`); };
const check = (cond, where, msg) => (cond ? passed++ : fail(where, msg));

// A counting three.js stand-in (a box is 12 triangles).
class O3 { constructor() { this.children = []; this.position = { set() {} }; this.userData = {}; this.visible = true; } add(c) { this.children.push(c); } remove(c) { this.children = this.children.filter((x) => x !== c); } traverse(f) { f(this); for (const c of this.children) c.traverse(f); } }
class Geo { constructor() { this.index = { count: 36 }; this.attributes = { position: { count: 24 } }; } dispose() {} }
class Mesh extends O3 { constructor(g, m) { super(); this.geometry = g; this.material = m; this.isMesh = true; } }
class InstancedMesh extends Mesh { constructor(g, m, n) { super(g, m); this.count = n; this.isInstancedMesh = true; } setMatrixAt() {} }
const THREE = { Group: O3, Object3D: class extends O3 { updateMatrix() {} matrix = {}; }, Mesh, InstancedMesh, BoxGeometry: Geo, MeshLambertMaterial: class { dispose() {} } };

const FEAR = /\b(die|dies|death|dead|kill|scary|terrif|horror|disaster|deadly|danger)\w*/i;
const PARTNER = /\bpartner(ship|ed)?\b|\bofficial\b|\bendorse|\bin association with\b|\bcertified by\b/i;
const k12Lesson = new Map(SC_LESSONS.map((l) => [l.id, l]));
const counts = { k12: 0, union: 0, academy: 0, robotics: 0 }, launches = { ok: 0, pending: 0 };
let worst = { meshes: 0, triangles: 0, id: "" };

for (const p of NP_PARISHES) {
  const rooms = CR.crRoomsFor(p);
  const ids = new Set(rooms.map((r) => r.id));
  check(ids.size === rooms.length, p.id, "duplicate room ids");
  // 1. coverage
  for (const s of p.sites) {
    if (s.kind === "school") check(rooms.some((r) => r.kind === "k12" && r.site === s.id), `${p.id}/${s.id}`, "school site has no K-12 classroom");
    if (s.kind === "union-hall") check(rooms.some((r) => r.kind === "union" && r.site === s.id), `${p.id}/${s.id}`, "union-hall site has no training centre");
  }
  if (/^bp-/.test(p.id)) check(rooms.some((r) => r.kind === "academy"), p.id, "Bay Program map has no Academy room");
  if (CR.CR_ROBOTICS_SITES[p.id]) check(rooms.some((r) => r.kind === "robotics"), p.id, "robotics map has no robotics bay");
  const lessonIds = new Set(CR.crLessonsOf(p).map((l) => l.id));
  for (const r of rooms) {
    counts[r.kind]++;
    const where = `${p.id}/${r.id}`;
    check(Array.isArray(r.door) && r.door.every(Number.isFinite) && Array.isArray(r.size), where, "room has no door or size");
    check(!/\binterior of\b|\bfloor plan\b/i.test(r.name), where, "room name describes a real building's interior");
    // 2. budget
    for (const tier of ["desktop", "phone"]) {
      const st = CR.crStats(CR.crBuildRoom({ THREE, room: r, tier }));
      const cap = tier === "phone" ? CR.CR_BUDGET.phoneMeshes : CR.CR_BUDGET.meshes;
      check(st.meshes <= cap && st.triangles <= CR.CR_BUDGET.triangles, `${where} (${tier})`, `${st.meshes} meshes / ${st.triangles} triangles over ${cap} / ${CR.CR_BUDGET.triangles}`);
      if (tier === "desktop" && st.meshes > worst.meshes) worst = { ...st, id: r.id };
    }
    // 3. launches
    for (const f of r.fixtures) for (const l of [f.launch, ...(f.more ?? [])]) {
      let ok = false, pending = false;
      if (l.type === "station" || l.type === "flow") ok = stations.has(l.id);
      else if (l.type === "lesson") ok = lessonIds.has(l.id) && k12Lesson.has(l.id);
      else if (l.type === "sim") ok = PS_SIMS.some((s) => s.id === l.id);
      else if (l.type === "game") { if (rbIds) ok = rbIds.has(l.id); else { ok = /^rb-/.test(l.id); pending = true; } }
      check(ok, `${where}/${f.id}`, `launch ${l.type} ${l.id} does not resolve`);
      if (ok) pending ? launches.pending++ : launches.ok++;
      // 4. K-12 rooms: only K-12 content at the band's ceiling
      if (r.kind === "k12") {
        const ceil = BY_BAND_CEILING[r.band];
        if (l.type === "lesson") {
          const L = k12Lesson.get(l.id);
          check(/^k12-/.test(L?.k12 ?? ""), `${where}/${f.id}`, `lesson ${l.id} carries no K-12 station`);
          const g = readingStats(CR.crLessonText(L ?? {})).grade;
          check(g <= ceil, `${where}/${f.id}`, `lesson ${l.id} reads at ${g.toFixed(1)}, over the ${r.band} ceiling ${ceil}`);
        } else check(/^k12-/.test(l.id) && ["station", "flow"].includes(l.type), `${where}/${f.id}`, `K-12 room launches non-K-12 ${l.type} ${l.id}`);
        check(!FEAR.test(f.label) && !/\d/.test(f.label), `${where}/${f.id}`, `label "${f.label}" has fear words or a digit`);
      }
    }
    // 5. union rooms
    if (r.kind === "union") {
      for (const t of r.trades) {
        const u = unions.find((x) => x.id === t);
        const nm = CR.CR_TRADE_NAMES[t];
        check(!!u && !!nm && [u.abbrev, u.name, ...(u.aliases ?? [])].some((a) => a && a.toLowerCase() === nm.toLowerCase()), where, `trade ${t} (${nm}) is not a unions.json reference`);
      }
      check(CR.CR_CRAFT_BAYS.every((b) => r.fixtures.some((f) => f.id === `bay-${b.id}`)), where, "a craft bay is missing");
      check(/no partnership/i.test(r.note ?? ""), where, "no no-partnership note");
    }
    for (const f of r.fixtures) check(!PARTNER.test(f.label) || r.kind === "k12", `${where}/${f.id}`, `label claims a partnership: ${f.label}`);
  }
}

// 6. the contract end to end on one K-12 classroom.
{
  const p = NP_PARISHES.find((x) => x.id === "orleans");
  const calls = [];
  const scene = new O3(), root = new O3();
  const w = CR.crMountClassrooms({ three: THREE, scene, root, parish: p, launch: (l) => { calls.push(l); return true; } });
  const r = w.rooms.find((x) => x.kind === "k12");
  w.tick(r.door[0], r.door[1]);
  check(w.near()?.id === r.id, "contract", "the door does not offer the room");
  const at = w.enter(r.id, r.door);
  check(!!at && w.inside()?.id === r.id && root.visible === false && scene.children.length === 1, "contract", "enter does not build the room and hide the world");
  const o = w.origin(), board = r.fixtures.find((f) => f.id === "board");
  w.useNear(o[0] + board.at[0], o[2] + board.at[1] + 0.8);
  check(calls[0]?.type === "lesson" && k12Lesson.has(calls[0].id), "contract", "the board does not open a real SCHOLAR lesson");
  const c = w.clamp(o[0] + 99, o[2] - 99);
  check(Math.abs(c.x - o[0]) < r.size[0] / 2 && Math.abs(c.z - o[2]) < r.size[1] / 2, "contract", "clamp lets the learner through the wall");
  const out = w.exit();
  check(!!out && !w.inside() && root.visible === true && scene.children.length === 0, "contract", "exit does not restore the world");
  console.log(`  contract: ${p.id} ${r.id} — door offers it, enter builds it, the board opens ${calls[0]?.id}, walls hold, exit restores the world`);
}

console.log(`  rooms: ${counts.k12} K-12 classrooms · ${counts.union} union training centres · ${counts.academy} Academy rooms · ${counts.robotics} robotics bays`);
console.log(`  launches: ${launches.ok} resolved · ${launches.pending} ROBOTICS games pending (rb-robotics-data.js ${rbIds ? "present" : "not in this tree"}) · INTERIORS shell ${ixShell ? "present" : "pending (minimal room in use)"}`);
console.log(`  budget: worst room ${worst.id} ${worst.meshes} meshes / ${worst.triangles} triangles (cap ${CR.CR_BUDGET.meshes} / ${CR.CR_BUDGET.triangles})`);
console.log(`check_classrooms: ${failed ? "FAIL" : "ok"} — ${passed} passed, ${failed} failed · ${Date.now() - T0} ms`);
process.exit(failed ? 1 : 0);
