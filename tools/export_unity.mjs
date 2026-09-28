/**
 * The Unity content bridge: every station, programme, world and model the
 * WebXR modules author, exported for a Unity runtime.
 *
 *     node tools/export_unity.mjs              # content + runtime package → exports/unity/SmartCitiX/
 *     node tools/export_unity.mjs --models     # also the glTF models (needs a real three.js, see below)
 *     node tools/export_unity.mjs --out DIR    # write somewhere else (the checker diffs against the committed copy)
 *
 * The content stays authored in the WebXR modules; nothing here is written by
 * hand. Stations are read headlessly the way tools/lib/headless.mjs and
 * eval_content.mjs read them, so a station's steps, hazards, interruptions,
 * hit ids and equipment come from the same code the browser runs. The output
 * is deterministic — keys sorted, no timestamps — so `git diff` after a re-run
 * is the up-to-date check (tools/check_unity_export.mjs).
 *
 * Models: the fleet and equipment builders are exported through three's
 * GLTFExporter, which needs the real three.js (the headless stub has no
 * geometry). Put three r160 where Node can find it — `npm install three@0.160.0`
 * at the repo root, or point SMARTCITIX_THREE at a folder holding
 * `build/three.module.js` and `examples/jsm/exporters/GLTFExporter.js` — and
 * run with --models. Without it the content half still exports and the
 * committed Models/ folder is left alone.
 *
 * Licence rule: only the platform's own CC0 builders are exported. The
 * ready-player avatar and the track GLB are never touched; no token, secret or
 * model name is written.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { loadSmartCity, loadTrades, buildSuite, installDomStubs, strip, THREE_STUB, ROOT, WEBXR } from "./lib/headless.mjs";
import { RUNTIME_FILES } from "./lib/unity_runtime.mjs";

const args = process.argv.slice(2);
const WANT_MODELS = args.includes("--models");
const OUT = args.includes("--out") ? args[args.indexOf("--out") + 1] : join(ROOT, "exports", "unity", "SmartCitiX");
const QUIET = args.includes("--quiet");
const log = (...a) => { if (!QUIET) console.log(...a); };

export const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag", "drive"];
const PACKAGE_VERSION = "1.0.0";

// ------------------------------------------------------------------ helpers

/** JSON with every object's keys sorted, functions dropped, 2-space indent, trailing newline. */
function stable(value) {
  const walk = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "function" || typeof v === "symbol") return undefined;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (Array.isArray(v)) return v.map((x) => { const w = walk(x); return w === undefined ? null : w; });
    if (typeof v === "object") {
      const out = {};
      for (const k of Object.keys(v).sort()) { const w = walk(v[k]); if (w !== undefined) out[k] = w; }
      return out;
    }
    return v;
  };
  return JSON.stringify(walk(value), null, 2) + "\n";
}
function write(rel, text) {
  const p = join(OUT, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
}
function clean(rel) { const p = join(OUT, rel); if (existsSync(p)) rmSync(p, { recursive: true, force: true }); }
/** Every `export const NAME` in a pure data module, so its constants can be serialised without naming them here. */
function exportedConsts(rel) {
  const src = readFileSync(join(WEBXR, rel), "utf8");
  return [...src.matchAll(/^export const ([A-Za-z_$][\w$]*)\s*=/gm)].map((m) => m[1]);
}
async function loadData(rel, label) {
  const names = exportedConsts(rel);
  const suite = await buildSuite([rel], `export { ${names.join(", ")} };`, label);
  const out = {};
  for (const n of names) if (typeof suite[n] !== "function") out[n] = suite[n];
  return out;
}

// --------------------------------------------------------------- citations

const REGISTRY = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8"));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const BY_CITE = new Map();
for (const s of REGISTRY.standards) for (const c of s.cites) if (!BY_CITE.has(c)) BY_CITE.set(c, s);
const CITE_RE = new RegExp(`(?<![A-Za-z0-9])(?:${[...BY_CITE.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})(?![A-Za-z0-9])(?!\\.\\d)`, "g");

/** The registry standards a station's own text cites, plus the sources the catalog lists for it. */
function citations(room, cat) {
  const parts = [room.certification ?? ""];
  for (const s of room.steps ?? []) parts.push(s.title ?? "", s.cue ?? "", s.why ?? "");
  for (const v of Object.values(room.hazards ?? {})) parts.push(v);
  for (const it of room.interrupts ?? []) parts.push(it.alert ?? "", it.why ?? "", it.missNote ?? "", it.wrongNote ?? "");
  const text = parts.join(" ");
  const hit = new Map();
  for (const m of text.matchAll(CITE_RE)) { const e = BY_CITE.get(m[0]); if (e) hit.set(e.id, { id: e.id, body: e.body, title: e.title, citedAs: m[0] }); }
  return {
    standards: [...hit.values()].sort((a, b) => a.id.localeCompare(b.id)),
    sources: (cat?.sources ?? []).map((s) => ({ label: s.label ?? null, url: s.url ?? null })),
  };
}

// ------------------------------------------------------------------ steps

const STEP_KEYS = ["id", "kind", "target", "targets", "title", "cue", "why", "anyOrder", "itemNames", "itemNotes", "decoyNotes", "outOfOrderNote",
  "seconds", "holdBreakNote", "gauge", "track", "turn", "drag", "drive", "noHint", "forceClass", "robotNote", "noRobot", "options"];

function step(s) {
  const out = {};
  for (const k of STEP_KEYS) if (s[k] !== undefined) out[k] = s[k];
  out.prompt = s.cue ?? null;                        // the brief's name for the learner-facing line
  if (!KINDS.includes(s.kind)) out.unknownKind = true;
  return out;
}

// -------------------------------------------------------------- equipment

/** A rig's builder, recovered from the footprint the builder stamped on it. */
function budgetIndex(suite) {
  const idx = [];
  for (const [kit, table] of [["fleet", suite.FLEET_BUDGET], ["equipment", suite.EQUIPMENT_BUDGET], ["toolkit", suite.TOOLKIT_BUDGET]]) {
    for (const [key, e] of Object.entries(table ?? {})) if (Array.isArray(e.footprint)) idx.push({ kit, key, build: e.build, fp: e.footprint });
  }
  return idx;
}
function rigsIn(root, idx) {
  const found = new Map();
  root.traverse((o) => {
    const fp = o.userData?.footprint;
    if (!Array.isArray(fp) || fp.length !== 3) return;
    const e = idx.find((x) => x.fp.every((v, i) => Math.abs(v - fp[i]) < 1e-6));
    const key = e ? `${e.kit}/${e.key}` : `unknown/${fp.map((v) => Math.round(v * 100) / 100).join("x")}`;
    found.set(key, (found.get(key) ?? 0) + 1);
  });
  return [...found.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, n]) => ({ kit: k.split("/")[0], builder: k.split("/")[1], count: n }));
}

// --------------------------------------------------------------- stations

function station(app, room, cat, suite, idx) {
  let hits = [], equipment = [], sceneError = null;
  if (!room.flat && typeof room.build === "function") {
    try {
      const root = new suite.THREE.Group();
      const api = room.build(root);
      hits = Object.keys(api?.hits ?? {}).sort();
      equipment = rigsIn(root, idx);
    } catch (e) { sceneError = String(e.message ?? e); }
  }
  const programmes = (cat?.programmes ?? PROGRAMME_IDS_BY_STATION.get(`${app}/${room.id}`) ?? []).slice().sort();
  return {
    schema: "smartcitix.station/1",
    app, id: room.id,
    title: room.title ?? room.name ?? room.id,
    name: room.name ?? room.id,
    tagline: room.tagline ?? null,
    category: room.category ?? cat?.category ?? null,
    domain: room.domain ?? null,
    trade: room.trade ?? null,
    certification: room.certification ?? null,
    district: room.district ?? null,
    weather: room.weather ?? null,
    indoor: room.indoor ?? null,
    flat: !!room.flat,
    underwater: room.underwater ?? null,
    parSeconds: room.parSeconds ?? 150,
    programmes,
    steps: (room.steps ?? []).map(step),
    stepKinds: [...new Set((room.steps ?? []).map((s) => s.kind))].sort(),
    hazards: room.hazards ?? {},
    lateNotes: room.lateNotes ?? {},
    interrupts: (room.interrupts ?? []).map((it) => ({
      id: it.id, after: it.after ?? null, delay: it.delay ?? 3, seconds: it.seconds ?? 12, kind: it.kind ?? null,
      alert: it.alert ?? null, cue: it.cue ?? null, target: it.target ?? null, why: it.why ?? null, missNote: it.missNote ?? null, wrongNote: it.wrongNote ?? null,
    })),
    citations: citations(room, cat),
    supportLine: room.supportLine ?? null,
    badge: room.badge ?? null,
    game: room.game ? {
      system: room.game.system ?? null, currency: room.game.currency ?? null, ranks: room.game.ranks ?? [], rankAt: room.game.rankAt ?? [],
      badges: (room.game.badges ?? []).map((b) => ({ id: b.id, name: b.name, note: b.note ?? null })),
      challenges: (room.game.challenges ?? []).map((b) => ({ id: b.id, name: b.name, note: b.note ?? null })),
    } : null,
    scene: { hits, equipment, error: sceneError, footprint: room.footprint ?? null, meshes: cat?.meshes ?? null },
    passRule: { stars: 2, hazardHits: 0, note: "stars >= 2 and no unsafe action (WebXR/shared/records.js passed())" },
  };
}

// ------------------------------------------------------------- programmes

const PROGRAMME_IDS_BY_STATION = new Map();

function programme(c, catC, comp, anchors) {
  return {
    schema: "smartcitix.programme/1",
    id: c.id, name: c.name, union: c.union ?? null, certification: c.certification ?? null, summary: c.summary ?? null, accent: c.accent ?? null,
    guides: c.guides ?? [],
    stations: (c.stations ?? []).map((s) => ({ app: s.app, id: s.id, why: s.why ?? null })),
    completionRule: catC?.completionRule ?? "every station has a passing attempt (stars >= 2, no unsafe action)",
    ladder: catC?.ladder ?? null,
    competency: comp ? { id: comp.id, title: comp.title, kind: comp.kind, standards: comp.standards ?? [], stations: comp.stations ?? [], require: comp.require ?? null } : null,
    anchors,
  };
}

// -------------------------------------------------------------------- main

export async function exportContent() {
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR", "smartcity", "catalog.json"), "utf8"));
  const city = await loadSmartCity();
  const trades = await loadTrades();
  const kits = await buildSuite(["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js"],
    "export { FLEET_BUDGET, EQUIPMENT_BUDGET, TOOLKIT_BUDGET };", "unity-kits");
  const idx = budgetIndex(kits);
  const cur = await buildSuite(["smartcity/js/curricula.js"], "export { CURRICULA };", "unity-curricula");
  const comp = await buildSuite(["shared/game.js", "shared/competency.js"], "export { PROGRAMME_COMPETENCIES };", "unity-competency");
  const worlds = { bayworld: await loadData("shared/bayworld-data.js", "unity-bay"), fairway: await loadData("shared/fairway-data.js", "unity-fairway") };
  if (existsSync(join(WEBXR, "shared", "underwater-data.js"))) worlds.underwater = await loadData("shared/underwater-data.js", "unity-underwater");
  if (existsSync(join(WEBXR, "shared", "summit-data.js"))) worlds.summit = await loadData("shared/summit-data.js", "unity-summit");
  if (existsSync(join(WEBXR, "redwood", "js", "rw-data.js"))) worlds.redwood = await loadData("redwood/js/rw-data.js", "unity-redwood");

  for (const c of cur.CURRICULA) for (const s of c.stations ?? []) {
    const k = `${s.app}/${s.id}`;
    if (!PROGRAMME_IDS_BY_STATION.has(k)) PROGRAMME_IDS_BY_STATION.set(k, []);
    PROGRAMME_IDS_BY_STATION.get(k).push(c.id);
  }

  // Anchors: every site in a world's data whose `programmes` names the programme.
  const anchorsFor = (id) => {
    const out = [];
    for (const [world, data] of Object.entries(worlds)) {
      for (const [name, list] of Object.entries(data)) {
        if (!Array.isArray(list)) continue;
        for (const site of list) {
          if (site && Array.isArray(site.programmes) && site.programmes.includes(id)) {
            out.push({ world, table: name, id: site.id ?? null, name: site.name ?? null, zone: site.zone ?? null, position: site.position ?? null, stations: site.stations ?? [] });
          }
        }
      }
    }
    return out.sort((a, b) => `${a.world}/${a.id}`.localeCompare(`${b.world}/${b.id}`));
  };

  clean("Content");
  const roomsBy = { smartcity: new Map(city.ROOMS.map((r) => [r.id, r])), trades: new Map(trades.ROOMS.map((r) => [r.id, r])) };
  const suites = { smartcity: city, trades };
  const stationIds = [];
  const missing = [];
  for (const cat of catalog.stations) {
    const room = roomsBy[cat.app]?.get(cat.id);
    if (!room) { missing.push(`${cat.app}/${cat.id}`); continue; }
    const data = station(cat.app, room, cat, suites[cat.app], idx);
    write(`Content/stations/${cat.app === "smartcity" ? "" : cat.app + "--"}${cat.id}.json`, stable(data));
    stationIds.push({ app: cat.app, id: cat.id, file: `stations/${cat.app === "smartcity" ? "" : cat.app + "--"}${cat.id}.json`, category: data.category, steps: data.steps.length, flat: data.flat });
  }
  const compBy = new Map(comp.PROGRAMME_COMPETENCIES.map((c) => [c.id, c]));
  const catCur = new Map((catalog.curricula ?? []).map((c) => [c.id, c]));
  const programmeIds = [];
  for (const c of cur.CURRICULA) {
    write(`Content/programmes/${c.id}.json`, stable(programme(c, catCur.get(c.id), compBy.get(c.id), anchorsFor(c.id))));
    programmeIds.push({ id: c.id, file: `programmes/${c.id}.json`, stations: c.stations.length });
  }
  const WORLD_SOURCES = { redwood: "WebXR/redwood/js/rw-data.js" };
  for (const [name, data] of Object.entries(worlds)) write(`Content/worlds/${name}.json`, stable({ schema: "smartcitix.world/1", id: name, source: WORLD_SOURCES[name] ?? `WebXR/shared/${name}-data.js`, ...data }));

  write("Content/index.json", stable({
    schema: "smartcitix.index/1",
    protocol: catalog.protocol ?? null,
    network: catalog.network ?? null,
    stepKinds: KINDS,
    passRule: { stars: 2, hazardHits: 0 },
    stations: stationIds.sort((a, b) => `${a.app}/${a.id}`.localeCompare(`${b.app}/${b.id}`)),
    programmes: programmeIds.sort((a, b) => a.id.localeCompare(b.id)),
    worlds: Object.keys(worlds).sort().map((w) => ({ id: w, file: `worlds/${w}.json` })),
    categories: (catalog.categories ?? []).map((c) => (typeof c === "string" ? c : c.id ?? c.name ?? null)).filter(Boolean).sort(),
  }));

  for (const [rel, text] of Object.entries(RUNTIME_FILES({ version: PACKAGE_VERSION, stations: stationIds.length, programmes: programmeIds.length }))) write(rel, text);
  return { stations: stationIds.length, programmes: programmeIds.length, worlds: Object.keys(worlds), missing, kits, idx };
}

// -------------------------------------------------------------------- models

function findThree() {
  const candidates = [process.env.SMARTCITIX_THREE, join(ROOT, "node_modules", "three")].filter(Boolean);
  for (const dir of candidates) if (existsSync(join(dir, "build", "three.module.js")) && existsSync(join(dir, "examples", "jsm", "exporters", "GLTFExporter.js"))) return dir;
  return null;
}

/** A seeded PRNG in place of Math.random while the builders run, so the same builder always yields the same bytes. */
function seeded(seed = 0x5eed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export async function exportModels(kits) {
  const threeDir = findThree();
  if (!threeDir) {
    console.log("Models skipped: no real three.js found. `npm install three@0.160.0` at the repo root or set SMARTCITIX_THREE, then re-run with --models.");
    return null;
  }
  installDomStubs();
  // Node polyfills the exporter expects from a browser.
  if (typeof globalThis.FileReader === "undefined") {
    globalThis.FileReader = class FileReader {
      readAsArrayBuffer(blob) { blob.arrayBuffer().then((b) => { this.result = b; this.onloadend?.({ target: this }); this.onload?.({ target: this }); }); }
      readAsDataURL(blob) { blob.arrayBuffer().then((b) => { this.result = `data:${blob.type};base64,${Buffer.from(b).toString("base64")}`; this.onloadend?.({ target: this }); this.onload?.({ target: this }); }); }
    };
  }
  globalThis.window = globalThis.window ?? globalThis;
  globalThis.self = globalThis.self ?? globalThis;
  const { mkdtempSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const dir = mkdtempSync(join(tmpdir(), "unity-models-"));
  process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch */ } });
  writeFileSync(join(dir, "three-real.mjs"), `export * from ${JSON.stringify(pathToFileURL(join(threeDir, "build", "three.module.js")).href)};\n`);
  const parts = ["shared/kit.js", "shared/textures.js", "shared/perf.js", "shared/fleet.js", "shared/equipment.js", "shared/toolkit.js"].map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8")));
  writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-real.mjs";\n\n${parts.join("\n\n")}\n\nexport { THREE, FLEET_BUDGET, EQUIPMENT_BUDGET, TOOLKIT_BUDGET, FLEET_BUILDERS, EQUIPMENT_BUILDERS, TOOLKIT_BUILDERS };`);
  const suite = await import(pathToFileURL(join(dir, "suite.mjs")).href);
  const { GLTFExporter } = await import(pathToFileURL(join(threeDir, "examples", "jsm", "exporters", "GLTFExporter.js")).href);
  const { mergeVertices } = await import(pathToFileURL(join(threeDir, "examples", "jsm", "utils", "BufferGeometryUtils.js")).href);
  void THREE_STUB;

  clean("Models");
  const manifest = { schema: "smartcitix.models/1", licence: "CC0-1.0 — the platform's own procedural builders (WebXR/shared/fleet.js, equipment.js, toolkit.js). No third-party model, no avatar, no track GLB.", generator: "three GLTFExporter r160 via tools/export_unity.mjs --models", units: "metres, +Z forward, +X driver's side, y = 0 ground; Unity flips X on import (glTF is right-handed)", entries: [] };
  let bytes = 0, ok = 0;
  const realRandom = Math.random;
  // The exporter warns once per non-normalised normal attribute; hundreds of
  // those lines are noise, and a builder that fails is reported in the manifest.
  const realWarn = console.warn;
  console.warn = (...a) => { if (!String(a[0] ?? "").startsWith("THREE.GLTFExporter")) realWarn(...a); };
  for (const [kit, table, builders] of [["fleet", suite.FLEET_BUDGET, suite.FLEET_BUILDERS], ["equipment", suite.EQUIPMENT_BUDGET, suite.EQUIPMENT_BUILDERS], ["toolkit", suite.TOOLKIT_BUDGET, suite.TOOLKIT_BUILDERS]]) {
    for (const [key, e] of Object.entries(table ?? {})) {
      const file = `${kit}--${key.replace(/[^A-Za-z0-9_-]+/g, "_")}.glb`;
      const entry = { kit, key, build: e.build, note: e.note ?? null, footprint: e.footprint ?? null, parts: e.parts ?? [], meshesDeclared: e.meshes ?? null };
      const fn = builders?.[e.build];
      if (typeof fn !== "function") { entry.reason = `no builder named "${e.build}"`; manifest.entries.push(entry); continue; }
      Math.random = seeded(0x5eed);
      let root, g;
      try {
        root = new suite.THREE.Group();
        g = fn(root, 0, 0, 0, { ...(e.opts ?? {}) });
        root.updateMatrixWorld(true);
      } catch (err) { Math.random = realRandom; entry.reason = `build threw: ${err.message}`; manifest.entries.push(entry); continue; }
      Math.random = realRandom;
      // Textures are canvases the builders paint at runtime; they are not
      // exported (the rule is geometry and vertex colours only), so every
      // material goes out as its base colour and finish.
      let meshes = 0, dropped = 0, repaired = 0;
      const seen = new Set();
      const doomed = [];
      g.traverse((o) => {
        const parts = o.userData?.parts;
        if (parts) for (const [name, p] of Object.entries(parts)) for (const x of Array.isArray(p) ? p : [p]) if (x && typeof x === "object" && !x.name) x.name = name;
        o.userData = {};
        if (!o.isMesh && !o.isLine && !o.isPoints) return;
        // A drawable with no vertex data cannot be written; it is dropped and counted.
        if (!o.geometry?.attributes?.position) { doomed.push(o); dropped += 1; return; }
        meshes += 1;
        // A colour number where a material belongs (a builder slip the browser
        // paints black) becomes a plain standard material of that colour.
        if (o.isMesh && (typeof o.material !== "object" || o.material === null)) {
          o.material = new suite.THREE.MeshStandardMaterial({ color: typeof o.material === "number" ? o.material : 0x888888 });
          repaired += 1;
        }
        // mergeStatic() leaves non-indexed triangle soup; re-index it and drop
        // the UVs (no texture is exported) so each file is a fraction of the size.
        if (o.isMesh) {
          let geo = o.geometry.clone();
          for (const k of ["uv", "uv1", "uv2", "uv3", "tangent"]) if (geo.attributes[k]) geo.deleteAttribute(k);
          if (!geo.index) geo = mergeVertices(geo, 1e-4);
          o.geometry = geo;
        }
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          if (!m || typeof m !== "object" || seen.has(m)) continue;
          seen.add(m);
          for (const k of ["map", "emissiveMap", "normalMap", "roughnessMap", "metalnessMap", "alphaMap", "aoMap", "bumpMap", "displacementMap", "envMap", "lightMap"]) if (m[k]) m[k] = null;
          m.userData = {};
        }
      });
      for (const o of doomed) o.parent?.remove(o);
      g.name = key;
      try {
        const buf = await new Promise((resolve, reject) => {
          new GLTFExporter().parse(g, resolve, reject, { binary: true, onlyVisible: false, truncateDrawRange: true, includeCustomExtensions: false });
        });
        const u8 = Buffer.from(buf);
        write(`Models/${file}`, u8);
        entry.file = file; entry.bytes = u8.length; entry.meshes = meshes; entry.materials = seen.size;
        if (dropped) entry.dropped = dropped;
        if (repaired) entry.repairedMaterials = repaired;
        bytes += u8.length; ok += 1;
      } catch (err) { entry.reason = `GLTFExporter failed: ${err.message}`; }
      manifest.entries.push(entry);
    }
  }
  console.warn = realWarn;
  manifest.entries.sort((a, b) => `${a.kit}/${a.key}`.localeCompare(`${b.kit}/${b.key}`));
  manifest.exported = ok;
  manifest.total = manifest.entries.length;
  manifest.bytes = bytes;
  write("Models/MANIFEST.json", stable(manifest));
  void kits;
  return { ok, total: manifest.entries.length, bytes };
}

function dirSize(p) {
  if (!existsSync(p)) return 0;
  const st = statSync(p);
  if (!st.isDirectory()) return st.size;
  return readdirSync(p).reduce((n, f) => n + dirSize(join(p, f)), 0);
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  const r = await exportContent();
  log(`Content: ${r.stations} stations, ${r.programmes} programmes, worlds ${r.worlds.join(", ")} → ${OUT.replace(ROOT + "/", "")}/Content (${(dirSize(join(OUT, "Content")) / 1e6).toFixed(1)} MB)`);
  if (r.missing.length) log(`  ${r.missing.length} catalog station(s) with no headless module: ${r.missing.join(", ")}`);
  log(`Runtime: ${Object.keys(RUNTIME_FILES({ version: PACKAGE_VERSION, stations: 0, programmes: 0 })).length} files → Runtime/ + package.json`);
  if (WANT_MODELS) {
    const m = await exportModels(r.kits);
    if (m) log(`Models: ${m.ok}/${m.total} builders → Models/ (${(m.bytes / 1e6).toFixed(1)} MB)`);
  }
  log(`Total export ${(dirSize(OUT) / 1e6).toFixed(1)} MB`);
}
