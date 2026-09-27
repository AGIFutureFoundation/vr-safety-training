/**
 * The investor data pack: the platform's inventory, programme overviews and
 * figures, every one computed from this repository and carrying the file or
 * command it came from. Nothing here is typed by hand, estimated or projected,
 * and no commercial figure of any kind is stated (see
 * tools/briefs/investor-data-brief.md).
 *
 *     node tools/gen_investor.mjs            # writes docs/investor/ and docs/programmes/
 *     node tools/gen_investor.mjs --out DIR  # writes the same tree under DIR (the checker uses this)
 *
 * Deterministic: every list is sorted or kept in the source's own order, and
 * no timestamp is written, so a re-run on an unchanged tree diffs clean.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outArg = process.argv.indexOf("--out");
const outRoot = outArg > 0 ? process.argv[outArg + 1] : root;

const read = (p) => readFileSync(join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));
const mod = (p) => import(pathToFileURL(join(root, p)).href);

// ------------------------------------------------------------------ text rules

/** Words the pack never carries (the brief's forbidden list), and model names. */
export const FORBIDDEN = /\b(revenues?|prices?|pricing|customers?|valuations?|market size|users?)\b|\bARR\b/i;
// Stored encoded so that this file itself names no model.
export const MODEL_NAMES = new RegExp(Buffer.from("XGIoY2xhdWRlfG9wdXN8c29ubmV0fGhhaWt1fGdwdC0/XGRcdyp8Y2hhdGdwdHxnZW1pbml8bGxhbWEpXGI=", "base64").toString(), "i");
const safe = (s) => typeof s === "string" && !FORBIDDEN.test(s) && !MODEL_NAMES.test(s);
/** The first candidate text that passes the rules, or an em dash. */
const pick = (...xs) => xs.find((x) => typeof x === "string" && x.trim() && safe(x)) ?? "—";
const firstSentence = (s) => (typeof s === "string" ? (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim() : s);

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : Array.isArray(v) ? v.join("; ") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCSV = (header, rows) => [header.join(","), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(","))].join("\n") + "\n";
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;
const mean = (xs) => (xs.length ? round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ------------------------------------------------------------------ sources

const catalog = json("WebXR/smartcity/catalog.json");
const evalContent = json("tools/eval-content.json");
const unionsFile = json("tools/unions.json");
const standardsFile = json("tools/standards.json");
const manifest = json("exports/unity/SmartCitiX/Models/MANIFEST.json");
const { CURRICULA } = await mod("WebXR/smartcity/js/curricula.js");
const { COMPETENCIES, PROGRAMME_COMPETENCIES, CORE_COMPETENCIES } = await mod("WebXR/shared/competency.js");
const bay = await mod("WebXR/shared/bayworld-data.js");
const deep = await mod("WebXR/shared/underwater-data.js");
const fair = await mod("WebXR/shared/fairway-data.js");
const courses = await mod("WebXR/regatta/js/courses.js");
const rgEvents = await mod("WebXR/regatta/js/events.js");
const quests = await mod("WebXR/bayworld/js/quests-data.js");
const dives = await mod("WebXR/underwater/js/dives-data.js");

/** An exported object or array literal read out of a module that imports
 *  three.js from a CDN (so it cannot be imported headlessly). The literal is
 *  data only — numbers, strings, arrays and objects. */
function literal(file, name) {
  const src = read(file);
  const at = src.indexOf(`export const ${name} =`);
  if (at < 0) throw new Error(`${name} not found in ${file}`);
  let i = src.indexOf("=", at) + 1;
  while (/\s/.test(src[i])) i++;
  const open = src[i], close = open === "{" ? "}" : "]";
  let depth = 0, j = i, str = null;
  for (; j < src.length; j++) {
    const c = src[j];
    if (str) { if (c === "\\") j++; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === open) depth++;
    else if (c === close && --depth === 0) break;
  }
  return new Function(`return (${src.slice(i, j + 1)});`)();
}

/** `/** … *\/` doc comment directly above `export function name(`. */
function docComment(file, name) {
  const src = read(file);
  const at = src.indexOf(`export function ${name}(`);
  if (at < 0) return null;
  const before = src.slice(0, at).trimEnd();
  if (!before.endsWith("*/")) return null;
  const start = before.lastIndexOf("/**");
  return before.slice(start + 3, -2).split("\n").map((l) => l.replace(/^\s*\*\s?/, "").trim()).join(" ").replace(/\s+/g, " ").trim();
}

const S = {
  catalog: "WebXR/smartcity/catalog.json",
  curricula: "WebXR/smartcity/js/curricula.js",
  competency: "WebXR/shared/competency.js",
  eval: "tools/eval-content.json",
  unions: "tools/unions.json",
  standards: "tools/standards.json",
  checkAll: "tools/check_all.mjs",
  manifest: "exports/unity/SmartCitiX/Models/MANIFEST.json",
  bay: "WebXR/shared/bayworld-data.js",
  deep: "WebXR/shared/underwater-data.js",
  fair: "WebXR/shared/fairway-data.js",
  yachts: "WebXR/shared/yacht-fleet.js",
  courses: "WebXR/regatta/js/courses.js",
  rgEvents: "WebXR/regatta/js/events.js",
  quests: "WebXR/bayworld/js/quests-data.js",
  dives: "WebXR/underwater/js/dives-data.js",
  districts: "WebXR/smartcity/js/districts.js",
  wojrc: "tools/briefs/wojrc-brief.md",
};

const stations = catalog.stations;
const stationKey = (app, id) => `${app}:${id}`;
const stationBy = new Map(stations.map((s) => [stationKey(s.app, s.id), s]));
const evalBy = new Map(evalContent.results.map((r) => [stationKey(r.app, r.id), r]));
const scores = evalContent.results.map((r) => r.score);
const currBy = new Map(catalog.curricula.map((c) => [c.id, c]));
const compBy = new Map(PROGRAMME_COMPETENCIES.map((c) => [c.id, c]));
const guidesBy = new Map(CURRICULA.map((c) => [c.id, c.guides ?? []]));
const standardBy = new Map(standardsFile.standards.map((s) => [s.id, s]));
const programmesOf = new Map();
for (const c of catalog.curricula) for (const s of c.stations) {
  const k = stationKey(s.app, s.id);
  if (!programmesOf.has(k)) programmesOf.set(k, []);
  programmesOf.get(k).push(c.id);
}
const checkers = [...read(S.checkAll).matchAll(/"(check_[a-z0-9_]+\.mjs)"/g)].map((m) => m[1]);
const wojrcIds = new Set(["job-readiness-edition", "wojrc-pathway-edition"]);

// Unions named by a programme: any alias or abbreviation as a whole word in its union line.
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const unionNamedIn = (u, text) => [u.abbrev, ...(u.aliases ?? [])].filter(Boolean)
  .some((a) => new RegExp(`(^|[^A-Za-z0-9])${esc(a)}([^A-Za-z0-9]|$)`).test(text ?? ""));
const unionsOfProgramme = (c) => unionsFile.unions.filter((u) => unionNamedIn(u, c.union)).map((u) => u.id).sort(byStr);

// ------------------------------------------------------------------ assets

const FAMILIES = [
  { file: "WebXR/shared/equipment.js", name: "EQUIPMENT_BUDGET", family: "equipment", kit: "equipment" },
  { file: "WebXR/shared/fleet.js", name: "FLEET_BUDGET", family: "vehicle", kit: "fleet" },
  { file: "WebXR/shared/props.js", name: "PROPS_BUDGET", family: "prop", kit: "props" },
  { file: "WebXR/shared/toolkit.js", name: "TOOLKIT_BUDGET", family: "tool", kit: "toolkit" },
  { file: "WebXR/shared/wildlife.js", name: "WILDLIFE_BUDGET", family: "wildlife", kit: "wildlife" },
  { file: "WebXR/shared/sky.js", name: "SKY_BUDGET", family: "sky", kit: "sky" },
];
// A fleet builder is a boat when its source sits at or after the marine
// section, which opens with the workboat.
const fleetSrc = read("WebXR/shared/fleet.js");
const marineFrom = fleetSrc.indexOf("export function workboat(");
const isBoat = (build) => { const p = fleetSrc.indexOf(`export function ${build}(`); return p >= marineFrom && marineFrom >= 0; };

// Which stations import which builder: every sim and room module's named
// imports from the six builder modules.
const simDirs = [["smartcity", "WebXR/smartcity/js/sims"], ["trades", "WebXR/trades/js/rooms"]];
const usersOf = new Map(); // `${module}:${builder}` -> Set(station id)
for (const [app, dir] of simDirs) {
  for (const f of readdirSync(join(root, dir)).filter((x) => x.endsWith(".js")).sort()) {
    const id = f.replace(/\.js$/, "");
    if (!stationBy.has(stationKey(app, id))) continue;
    const src = read(`${dir}/${f}`);
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*"[^"]*shared\/(equipment|fleet|props|toolkit|wildlife|sky)\.js"/g)) {
      for (const n of m[1].split(",").map((x) => x.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
        const k = `${m[2]}:${n}`;
        if (!usersOf.has(k)) usersOf.set(k, new Set());
        usersOf.get(k).add(id);
      }
    }
  }
}
const manifestKeys = new Set(manifest.entries.map((e) => `${e.kit}:${e.key}`));
const assets = [];
for (const F of FAMILIES) {
  const budget = literal(F.file, F.name);
  const modName = F.file.split("/").pop().replace(".js", "");
  if (F.family === "wildlife") {
    for (const [k, v] of Object.entries(budget)) {
      if (k === "total") continue;
      assets.push({ name: k, family: "wildlife", build: k, meshes: v.meshes, footprint: "", parts: "", note: `${v.count} per group, ${v.motion}`, module: modName, source: `${F.file} ${F.name}` });
    }
  } else if (F.family === "sky") {
    assets.push({ name: "skyDome", family: "sky", build: "sky dome", meshes: budget.meshes, footprint: "", parts: "", note: `${budget.vertices} vertices, ${budget.clouds} clouds, ${budget.stars} stars`, module: modName, source: `${F.file} ${F.name}` });
  } else {
    for (const [k, v] of Object.entries(budget)) {
      const family = F.family === "vehicle" && isBoat(v.build) ? "boat" : F.family;
      assets.push({ name: k, family, build: v.build, meshes: v.meshes, footprint: (v.footprint ?? []).join(" x "), parts: v.parts ?? [], note: v.note ?? "", module: modName, kit: F.kit, source: `${F.file} ${F.name}` });
    }
  }
}
for (const a of assets) {
  a.stations = [...(usersOf.get(`${a.module}:${a.build}`) ?? [])].sort(byStr);
  a.stationCount = a.stations.length;
  a.unity = a.kit ? (manifestKeys.has(`${a.kit}:${a.name}`) ? "yes" : "no") : "no";
  a.note = pick(a.note);
}

// ------------------------------------------------------------------ worlds

const yachtFleet = literal(S.yachts, "YACHT_FLEET");
const districtsSrc = read(S.districts);
const districtsBlock = districtsSrc.slice(districtsSrc.indexOf("export const DISTRICTS = {"));
const districtNames = [...districtsBlock.matchAll(/^ {2}"([^"]+)": \{/gm)].map((m, i, all) => {
  const start = m.index, end = all[i + 1]?.index ?? districtsBlock.indexOf("\n};");
  return { name: m[1], scenic: /plaza:\s*false/.test(districtsBlock.slice(start, end)) };
});
const scenicBudget = Number(districtsSrc.match(/export const SCENIC_BUDGET = (\d+)/)?.[1]);
const bounds = (b) => `x ${b.minX}..${b.maxX}, z ${b.minZ}..${b.maxZ}`;
const worlds = [
  { name: "Bay World", page: "WebXR/dist/bayworld.html", bounds: bounds(bay.BAY_BOUNDS), zones: bay.BAY_ZONES.length, sites: bay.BAY_SITES.length, landmarks: bay.BAY_LANDMARKS.length, routes: `${bay.BAY_ROADS.length} roads`, meshBudget: `${bay.BAY_MESH_BUDGET.low}-${bay.BAY_MESH_BUDGET.high}`, quests: quests.MAIN_QUESTS.length + quests.SIDE_QUESTS.length, eggs: quests.EGG_QUESTS.length + quests.FIELD_GUIDE_EGGS.length, activities: quests.SIDE_ACTIVITIES.length, source: `${S.bay}; ${S.quests}` },
  { name: "The Deep", page: "WebXR/dist/underwater.html", bounds: bounds(deep.DEEP_BOUNDS), zones: deep.DEEP_ZONES.length, sites: deep.DEEP_SITES.length, landmarks: deep.DEEP_LANDMARKS.length, routes: `${deep.DEEP_LINES.length} lines`, meshBudget: `${deep.DEEP_MESH_BUDGET.low}-${deep.DEEP_MESH_BUDGET.high}`, quests: dives.DV_MAIN_DIVES.length + dives.DV_SIDE_DIVES.length, eggs: dives.DV_EGG_DIVES.length, activities: dives.DV_ACTIVITIES.length, source: `${S.deep}; ${S.dives}` },
  { name: "Fairway Park", page: "WebXR/dist/fairway.html", bounds: bounds(fair.FAIRWAY_BOUNDS), zones: Object.keys(fair.FAIRWAY_FACILITY).length, sites: `${fair.FAIRWAY_HOLES.length} holes`, landmarks: "", routes: `par ${fair.FAIRWAY_HOLES.reduce((a, h) => a + h.par, 0)} over ${fair.FAIRWAY_HOLES.length} holes`, meshBudget: `${fair.FAIRWAY_MESH_BUDGET.low}-${fair.FAIRWAY_MESH_BUDGET.high}`, quests: "", eggs: "", activities: "", source: S.fair },
  { name: "Bay Regatta", page: "WebXR/dist/regatta.html", bounds: bounds(bay.BAY_BOUNDS), zones: courses.RG_WATER.length, sites: `${yachtFleet.length} yachts`, landmarks: "", routes: `${courses.RG_COURSES.length} courses`, meshBudget: "", quests: "", eggs: "", activities: rgEvents.RG_EVENTS.length, source: `${S.yachts}; ${S.courses}; ${S.rgEvents}; bounds from ${S.bay}` },
  ...districtNames.filter((d) => d.scenic).map((d) => ({ name: `${d.name} (scenic district)`, page: "WebXR/dist/smartcity-x.html", bounds: "", zones: "", sites: "", landmarks: "", routes: "", meshBudget: String(scenicBudget), quests: "", eggs: "", activities: "", source: `${S.districts} DISTRICTS (plaza: false), SCENIC_BUDGET` })),
];

// ------------------------------------------------------------------ UI surfaces

const distDir = "WebXR/dist";
const pages = [
  ...readdirSync(join(root, distDir)).filter((f) => f.endsWith(".html")).sort().map((f) => `${distDir}/${f}`),
  ...readdirSync(join(root, distDir, "tracks")).filter((f) => f.endsWith(".html")).sort().map((f) => `${distDir}/tracks/${f}`),
];
const uiSurfaces = pages.map((p) => {
  const src = read(p);
  const title = (src.match(/<title>([^<$]*)<\/title>/)?.[1] ?? "").replace(/&amp;/g, "&").replace(/\s*\(Powered by[^)]*\)/i, "").trim();
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1];
  const h1 = src.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1];
  const modes = ["flat"];
  if (/immersive-vr/.test(src)) modes.push("vr");
  if (/immersive-ar/.test(src)) modes.push("ar");
  if (/keydown/.test(src)) modes.push("keyboard");
  if (/touchstart|pointerdown/.test(src)) modes.push("touch");
  if (/getGamepads/.test(src)) modes.push("gamepad");
  if (/hand-tracking|XRHand|\.hand\b/.test(src)) modes.push("hands");
  const panels = [...new Set([...src.matchAll(/id="([A-Za-z0-9_-]*(?:hud|panel|Panel|Hud|HUD)[A-Za-z0-9_-]*)"/g)].map((m) => m[1]))].sort(byStr);
  return { name: pick(title, relative(distDir, p)), path: p, purpose: pick(firstSentence(desc), h1, title), inputModes: modes, hudPanels: panels, hudPanelCount: panels.length, source: `${p} (<title>, meta description, input listeners, element ids)` };
});

// ------------------------------------------------------------------ programmes

const bayOf = (id) => bay.BAY_SITES.filter((s) => (s.programmes ?? []).includes(id)).map((s) => s.id).sort(byStr);
const deepOf = (id) => deep.DEEP_SITES.filter((s) => (s.programmes ?? []).includes(id)).map((s) => s.id).sort(byStr);
const programmes = catalog.curricula.map((c) => {
  const cats = {};
  for (const s of c.stations) { const st = stationBy.get(stationKey(s.app, s.id)); cats[st?.category ?? "?"] = (cats[st?.category ?? "?"] ?? 0) + 1; }
  const unionIds = unionsOfProgramme(c);
  const bodies = new Set([
    ...unionIds.map((u) => unionsFile.unions.find((x) => x.id === u).trainingBody).filter(Boolean),
    ...(guidesBy.get(c.id) ?? []).filter((g) => standardBy.get(g)?.body === "union"),
  ]);
  const ev = c.stations.map((s) => evalBy.get(stationKey(s.app, s.id))?.score).filter((x) => typeof x === "number");
  return {
    id: c.id, name: c.name,
    categoryMix: Object.entries(cats).sort((a, b) => b[1] - a[1] || byStr(a[0], b[0])).map(([k, v]) => `${k}: ${v}`),
    stationCount: c.stations.length,
    unions: unionIds, trainingBodies: [...bodies].sort(byStr),
    competencyRequire: compBy.get(c.id)?.require ?? "",
    ladderLevels: c.ladder?.levels ?? "", ladderLevelsFull: c.ladder?.atBar ?? "",
    bayWorldSites: bayOf(c.id), deepSites: deepOf(c.id),
    evalMean: mean(ev),
  };
});

// ------------------------------------------------------------------ stations

const stationRows = stations.map((s) => {
  const e = evalBy.get(stationKey(s.app, s.id));
  return {
    id: s.id, app: s.app, title: pick(s.title, s.name, s.id), category: s.category,
    programmes: (programmesOf.get(stationKey(s.app, s.id)) ?? []).slice().sort(byStr),
    steps: s.steps, kinds: s.stepKinds ?? [], hazards: s.hazards, interruptions: s.interrupts,
    citations: e?.d?.standards?.cited ?? "", evalScore: e?.score ?? "",
    standardsScore: typeof e?.d?.standards?.score === "number" ? Math.round(e.d.standards.score * 100) : "",
    meshes: typeof s.meshes === "number" ? s.meshes : "",
  };
}).sort((a, b) => byStr(a.app + a.id, b.app + b.id));

// ------------------------------------------------------------------ unions

const unionRows = unionsFile.unions.map((u) => ({
  id: u.id, abbrev: u.abbrev, name: u.name, trainingBody: u.trainingBody ?? "",
  programmes: catalog.curricula.filter((c) => unionNamedIn(u, c.union)).map((c) => c.id).sort(byStr),
})).sort((a, b) => byStr(a.id, b.id));

// ------------------------------------------------------------------ summary

const band = (lo, hi) => scores.filter((x) => x >= lo && x <= hi).length;
const kitCounts = {};
for (const e of manifest.entries) kitCounts[e.kit] = (kitCounts[e.kit] ?? 0) + 1;
const facts = [
  ["procedures", stations.length, `${S.catalog} stations.length`],
  ["smartcityStations", stations.filter((s) => s.app === "smartcity").length, `${S.catalog} stations where app = smartcity`],
  ["tradeSkillsRooms", stations.filter((s) => s.app === "trades").length, `${S.catalog} stations where app = trades`],
  ["programmes", CURRICULA.length, `${S.curricula} CURRICULA.length`],
  ["categories", catalog.categories.length, `${S.catalog} categories.length`],
  ["unions", unionsFile.unions.length, `${S.unions} unions.length`],
  ["trainingBodies", standardsFile.standards.filter((s) => s.body === "union").length, `${S.standards} standards where body = union`],
  ["standards", standardsFile.standards.length, `${S.standards} standards.length`],
  ["competencies", COMPETENCIES.length, `${S.competency} COMPETENCIES.length`],
  ["programmeCompetencies", PROGRAMME_COMPETENCIES.length, `${S.competency} PROGRAMME_COMPETENCIES.length`],
  ["coreCompetencies", CORE_COMPETENCIES.length, `${S.competency} CORE_COMPETENCIES.length`],
  ["profileLevels", catalog.profile.levels, `${S.catalog} profile.levels`],
  ["programmeLadderLevels", catalog.curricula.reduce((a, c) => a + (c.ladder?.levels ?? 0), 0), `${S.catalog} sum of curricula[].ladder.levels`],
  ["programmeLadderLevelsFull", catalog.curricula.reduce((a, c) => a + (c.ladder?.atBar ?? 0), 0), `${S.catalog} sum of curricula[].ladder.atBar`],
  ["checkers", checkers.length, `${S.checkAll} CHECKERS array`],
  ["evalProceduresScored", scores.length, `${S.eval} results.length`],
  ["evalCorpusMean", mean(scores), `${S.eval} mean of results[].score`],
  ["evalBand95plus", band(95, 100), `${S.eval} results with score >= 95`],
  ["evalBand90to94", band(90, 94), `${S.eval} results with score 90-94`],
  ["evalBandBelow90", scores.filter((x) => x < 90).length, `${S.eval} results with score < 90`],
  ["bayWorldZones", bay.BAY_ZONES.length, `${S.bay} BAY_ZONES.length`],
  ["bayWorldSites", bay.BAY_SITES.length, `${S.bay} BAY_SITES.length`],
  ["bayWorldLandmarks", bay.BAY_LANDMARKS.length, `${S.bay} BAY_LANDMARKS.length`],
  ["bayWorldRoads", bay.BAY_ROADS.length, `${S.bay} BAY_ROADS.length`],
  ["bayWorldMainQuests", quests.MAIN_QUESTS.length, `${S.quests} MAIN_QUESTS.length`],
  ["bayWorldSideQuests", quests.SIDE_QUESTS.length, `${S.quests} SIDE_QUESTS.length`],
  ["bayWorldEggQuests", quests.EGG_QUESTS.length, `${S.quests} EGG_QUESTS.length`],
  ["bayWorldFieldGuideEggs", quests.FIELD_GUIDE_EGGS.length, `${S.quests} FIELD_GUIDE_EGGS.length`],
  ["bayWorldActivities", quests.SIDE_ACTIVITIES.length, `${S.quests} SIDE_ACTIVITIES.length`],
  ["deepZones", deep.DEEP_ZONES.length, `${S.deep} DEEP_ZONES.length`],
  ["deepSites", deep.DEEP_SITES.length, `${S.deep} DEEP_SITES.length`],
  ["deepLandmarks", deep.DEEP_LANDMARKS.length, `${S.deep} DEEP_LANDMARKS.length`],
  ["deepLines", deep.DEEP_LINES.length, `${S.deep} DEEP_LINES.length`],
  ["deepMainDives", dives.DV_MAIN_DIVES.length, `${S.dives} DV_MAIN_DIVES.length`],
  ["deepSideDives", dives.DV_SIDE_DIVES.length, `${S.dives} DV_SIDE_DIVES.length`],
  ["deepEggDives", dives.DV_EGG_DIVES.length, `${S.dives} DV_EGG_DIVES.length`],
  ["deepActivities", dives.DV_ACTIVITIES.length, `${S.dives} DV_ACTIVITIES.length`],
  ["fairwayHoles", fair.FAIRWAY_HOLES.length, `${S.fair} FAIRWAY_HOLES.length`],
  ["regattaYachts", yachtFleet.length, `${S.yachts} YACHT_FLEET.length`],
  ["regattaCourses", courses.RG_COURSES.length, `${S.courses} RG_COURSES.length`],
  ["regattaEvents", rgEvents.RG_EVENTS.length, `${S.rgEvents} RG_EVENTS.length`],
  ["scenicDistricts", districtNames.filter((d) => d.scenic).length, `${S.districts} DISTRICTS entries with plaza: false`],
  ["assetBuilders", assets.length, "tools/gen_investor.mjs: entries of EQUIPMENT_BUDGET, FLEET_BUDGET, PROPS_BUDGET, TOOLKIT_BUDGET, WILDLIFE_BUDGET (kinds), SKY_BUDGET (one dome)"],
  ["unityModels", manifest.entries.length, `${S.manifest} entries.length`],
  ...Object.keys(kitCounts).sort(byStr).map((k) => [`unityModels.${k}`, kitCounts[k], `${S.manifest} entries where kit = ${k}`]),
  ["unityExportBytes", manifest.bytes, `${S.manifest} bytes`],
  ["uiPages", uiSurfaces.length, `ls ${distDir}/*.html ${distDir}/tracks/*.html`],
].map(([key, value, source]) => ({ key, value, source }));

// ------------------------------------------------------------------ programme overviews

const wojrcSrc = read(S.wojrc);
const wojrcQuote = wojrcSrc.split("\n").filter((l) => l.startsWith("> ")).map((l) => l.slice(2));
const mdEsc = (s) => String(s).replace(/\|/g, "\\|");

function overview(c) {
  const isW = wojrcIds.has(c.id);
  const p = programmes.find((x) => x.id === c.id);
  const comp = compBy.get(c.id);
  const L = [];
  L.push(`# ${c.name}`, "");
  L.push(`Programme id \`${c.id}\` · ${c.stations.length} stations · generated by \`tools/gen_investor.mjs\` from \`${S.catalog}\`, \`${S.curricula}\`, \`${S.competency}\`, \`${S.bay}\`, \`${S.deep}\`, \`${S.standards}\` and \`${S.eval}\`. Do not edit by hand.`, "");
  L.push("## About this programme", "");
  if (isW) {
    L.push(`The only statements this edition makes about the organisation, wojrc.org, are its own words as supplied by the sponsor (source: \`${S.wojrc}\`):`, "");
    for (const q of wojrcQuote) L.push(`> ${q}`);
    L.push("", "The person who runs the programmes is named by the sponsor of this edition. Nothing else about the organisation or its staff is stated here.", "");
  } else {
    L.push(pick(c.summary), "");
    L.push(`**Unions:** ${pick(c.union)}`, "");
  }
  L.push(`**Certification line:** ${pick(c.certification)}`, "");
  L.push("## Who it is for", "");
  const trades = [...new Set(c.stations.map((s) => stationBy.get(stationKey(s.app, s.id))?.trade).filter((t) => t && safe(t)))].sort(byStr);
  L.push(`The trades its stations are written for (from each station's \`trade\` field): ${trades.join("; ") || "—"}.`, "");
  L.push("Why each station is in the programme is given in the station list below, from the programme's own `why` lines.", "");
  L.push("## Stations", "");
  L.push("| # | Station | Category | Summary | Why it is here | Eval |", "|---|---|---|---|---|---|");
  c.stations.forEach((s, i) => {
    const st = stationBy.get(stationKey(s.app, s.id));
    const why = isW && /wojrc|sponsor/i.test(s.why ?? "") ? "—" : pick(firstSentence(s.why));
    const summary = pick(st?.tagline, firstSentence(s.why), st?.name);
    L.push(`| ${i + 1} | \`${s.id}\` ${mdEsc(pick(st?.name, s.id))} | ${mdEsc(st?.category ?? "")} | ${mdEsc(summary)} | ${mdEsc(why)} | ${evalBy.get(stationKey(s.app, s.id))?.score ?? "—"} |`);
  });
  L.push("", "## Competency rule", "");
  if (comp) L.push(`**${pick(comp.title)}** — demonstrated by a mastery run on ${comp.require} of its ${comp.stations.length} stations. Programme completion: ${c.completionRule ?? "—"}.`, "");
  else L.push(`Programme completion: ${c.completionRule ?? "—"}.`, "");
  L.push("## Ladder", "");
  if (c.ladder) L.push(`${c.ladder.levels} levels, ${c.ladder.lessons} lessons, ${c.ladder.tasks} tasks; ${c.ladder.atBar} levels full at a lesson bar of ${c.ladder.lessonBar}. ${pick(c.ladder.note)}`, "");
  L.push("## Where it sits in Bay World and the Deep", "");
  const bs = bay.BAY_SITES.filter((s) => (s.programmes ?? []).includes(c.id));
  const ds = deep.DEEP_SITES.filter((s) => (s.programmes ?? []).includes(c.id));
  L.push(bs.length ? `Bay World: ${bs.map((s) => `${s.name} (\`${s.id}\`, zone ${s.zone})`).join("; ")}.` : "Bay World: no site anchors this programme.");
  L.push("", ds.length ? `The Deep: ${ds.map((s) => `${s.name} (\`${s.id}\`, zone ${s.zone})`).join("; ")}.` : "The Deep: no site anchors this programme.", "");
  L.push("## Standards it cites", "");
  const cited = [...new Set([...(guidesBy.get(c.id) ?? []), ...(comp?.standards ?? [])])].sort(byStr);
  for (const id of cited) { const s = standardBy.get(id); L.push(`- \`${id}\` — ${s ? `${s.body}: ${pick(s.title)}` : "not in the registry"}`); }
  if (!cited.length) L.push("- none listed");
  L.push("", "## Track page", "");
  const track = `WebXR/dist/tracks/${c.id}.html`;
  L.push(existsSync(join(root, track)) ? `[${track}](../../${track})` : "No track page is built for this programme.", "");
  L.push("## Figures", "");
  L.push(`Stations ${p.stationCount}; eval mean of its stations ${p.evalMean ?? "—"} (\`${S.eval}\`); competency require ${p.competencyRequire || "—"}; category mix ${p.categoryMix.join(", ")}.`, "");
  return L.join("\n");
}

// ------------------------------------------------------------------ write

const files = new Map();
const put = (p, s) => files.set(p, s);
put("docs/investor/platform-summary.json", JSON.stringify({
  note: "Every value is computed from this repository by tools/gen_investor.mjs and names its source file or command. No commercial figure of any kind is stated.",
  facts,
}, null, 2) + "\n");
put("docs/investor/platform-summary.csv", toCSV(["key", "value", "source"], facts));
put("docs/investor/programmes.csv", toCSV(["id", "name", "categoryMix", "stationCount", "unions", "trainingBodies", "competencyRequire", "ladderLevels", "ladderLevelsFull", "bayWorldSites", "deepSites", "evalMean"], programmes));
put("docs/investor/stations.csv", toCSV(["id", "app", "title", "category", "programmes", "steps", "kinds", "hazards", "interruptions", "citations", "evalScore", "standardsScore", "meshes"], stationRows));
put("docs/investor/assets.csv", toCSV(["name", "family", "build", "meshes", "footprint", "parts", "note", "stationCount", "stations", "unity", "source"], assets));
put("docs/investor/vehicles-and-boats.csv", toCSV(["name", "family", "build", "meshes", "footprint", "description", "stationCount", "unity", "source"],
  assets.filter((a) => a.family === "vehicle" || a.family === "boat").map((a) => ({ ...a, description: pick(firstSentence(docComment("WebXR/shared/fleet.js", a.build)), a.note), source: `WebXR/shared/fleet.js ${a.build}() doc comment; FLEET_BUDGET` }))));
put("docs/investor/worlds.csv", toCSV(["name", "page", "bounds", "zones", "sites", "landmarks", "routes", "meshBudget", "quests", "eggs", "activities", "source"], worlds));
put("docs/investor/ui-surfaces.csv", toCSV(["name", "path", "purpose", "inputModes", "hudPanelCount", "hudPanels", "source"], uiSurfaces));
put("docs/investor/unions.csv", toCSV(["id", "abbrev", "name", "trainingBody", "programmes"], unionRows));
put("docs/investor/README.md", [
  "# Investor data pack",
  "",
  "Generated by `node tools/gen_investor.mjs`; checked by `tools/check_investor.mjs`. Every figure is computed from the repository and names its source; nothing is estimated or projected, and no commercial figure is stated.",
  "",
  "| File | Rows | What it holds |",
  "|---|---|---|",
  ["platform-summary.csv", facts.length, "Platform-wide counts, each with its source (also as platform-summary.json)"],
  ["programmes.csv", programmes.length, "One row per training programme"],
  ["stations.csv", stationRows.length, "One row per procedure"],
  ["assets.csv", assets.length, "Every budgeted builder: equipment, vehicles, boats, props, tools, wildlife, sky"],
  ["vehicles-and-boats.csv", assets.filter((a) => a.family === "vehicle" || a.family === "boat").length, "The vehicle and vessel subset with a description from each builder's doc comment"],
  ["worlds.csv", worlds.length, "Open-world scenes and scenic districts"],
  ["ui-surfaces.csv", uiSurfaces.length, "Every built page with its purpose, input modes and HUD panel ids"],
  ["unions.csv", unionRows.length, "Every union with its training body and the programmes that name it"],
].map((r) => (Array.isArray(r) ? `| [${r[0]}](${r[0]}) | ${r[1]} | ${r[2]} |` : r)).join("\n") + "\n\nProgramme overviews: [docs/programmes/](../programmes/README.md).\n");

for (const c of catalog.curricula) put(`docs/programmes/${c.id}.md`, overview(c));
put("docs/programmes/README.md", [
  "# Programme overviews",
  "",
  `One page per training programme (${catalog.curricula.length}), generated by \`tools/gen_investor.mjs\` from \`${S.catalog}\`. Do not edit by hand.`,
  "",
  "| Programme | Stations | Eval mean |",
  "|---|---|---|",
  ...catalog.curricula.map((c) => { const p = programmes.find((x) => x.id === c.id); return `| [${mdEsc(c.name)}](${c.id}.md) | ${p.stationCount} | ${p.evalMean ?? "—"} |`; }),
  "",
].join("\n"));

for (const [p, s] of [...files].sort((a, b) => byStr(a[0], b[0]))) {
  const full = join(outRoot, p);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, s);
}
console.log(`gen_investor: ${files.size} files written under ${outRoot === root ? "docs/" : outRoot}`);
