/**
 * TQ-BRIDGE (console TQ-BRIDGE, docs/tradequest-bridge.md): the v2 sections of the shared export that
 * SmartCiti.X Holodeck and SmartCiti.X TradeQuest (the Trade Craft Academy site) both read.
 *
 * `tools/export_shared.mjs` builds DEAN's v1 document and hands it to `tqExtend(v1)`, which keeps every
 * v1 field and adds `sections` (status per section), `maps`, `palette`, `facades`, `vehicles`, `robotics`,
 * `dataset`, `changelog` and `budget`. Each section is read from its owner's module behind a guard:
 *
 *   - the owner module is imported only if its file exists, inside try/catch;
 *   - the preferred seam is a plain, dependency-free `<PREFIX>_SHARED` object (e.g. `PA_SHARED`), then the
 *     named exports listed per section below (the names in the wave brief), then nothing;
 *   - a section whose source is missing is written `{ status: "pending", data: null }` with the sources it
 *     looked for, so re-running `node tools/export_shared.mjs` after the owner merges fills it in with no
 *     code change here.
 *
 * Pure apart from reading the tree. No network. Every top-level name is prefixed tq/TQ_.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const TQ_VERSION = "2.0.0";
/** The export's size budget: the written JSON file (indent 1) must stay at or under this many bytes. */
export const TQ_BUDGET_BYTES = 768 * 1024;
/** And gzipped (what a site actually transfers). */
export const TQ_BUDGET_GZIP_BYTES = 128 * 1024;
export const TQ_STATUSES = ["ready", "partial", "pending"];

export const TQ_CHANGELOG = [
  { version: "2.0.0", date: "2026-09-29", by: "TQ-BRIDGE", changes: [
    "Adds `sections`: status (ready | partial | pending), owner and sources per section; a pending section fills in when its owner merges and the exporter is re-run.",
    "Adds `maps`: the parish-engine maps by region with sites (kind, stations), landmarks (lm kind) and hills.",
    "Adds `palette` (PALETTE, PA_CATEGORIES), `facades` (FACADES, detail kinds and generic sign list), `vehicles` (Motor Pool classes and drive profiles; MOTORWORKS per-class handling), `robotics` (ROBOTICS scenarios), `dataset` (episode schema, embodiment observation/action schema, DATAWORKS dataset-card template).",
    "Adds `changelog` and `budget`; the schema file is now the v2 schema (a superset: every v1 field and requirement is kept).",
    "Adds exports/shared/tradequest-adapter.js, the TradeQuest mapping of this document.",
  ] },
  { version: "1.0.0", date: "2026-09-28", by: "DEAN", changes: ["First contract: packs, paths, module and version schemas, lesson and station ids by world, parish/district frames, provenance."] },
];

// A section's owner, the modules it may live in (a string, or a RegExp over WebXR/shared/ file names) and the
// exports that carry it, in preference order.
export const TQ_SECTIONS = {
  maps: { owner: "PARISH engine (np-*) + LANDMARKS (lm-*)", files: ["np-parishes.js"], exports: ["NP_PARISHES"] },
  palette: { owner: "PALETTE", files: ["pa-palette.js", /^pa-.*\.js$/], exports: ["PA_SHARED", "PA_CATEGORIES"] },
  facades: { owner: "FACADES", files: ["fc-facades.js", /^fc-.*\.js$/], exports: ["FC_SHARED", "FC_DETAIL_KINDS", "FC_KINDS", "FC_DETAILS", "FC_SIGN_WORDS", "FC_SIGN_TRADES", "FC_SIGNS", "FC_GENERIC_SIGNS", "FC_KITS"] },
  vehicles: { owner: "Motor Pool (drivables-data) + MOTORWORKS (mv-*)", files: ["drivables-data.js", /^mv-.*\.js$/], exports: ["MV_SHARED", "MV_CLASSES", "MV_VEHICLE_CLASSES", "MV_HANDLING", "MV_SITE_RULES", "DV_DRIVABLES"] },
  robotics: { owner: "ROBOTICS", files: [/^rb-.*\.js$/], exports: ["RB_SHARED", "rbSharedData", "RB_SCENARIOS", "rbScenarios"] },
  dataset: { owner: "dataset layer (episodes, robot-embodiment) + DATAWORKS (dx-*)", files: ["episodes.js", "robot-embodiment.js", /^dx-.*\.js$/], exports: ["DX_SHARED", "DX_EPISODE_SCHEMA", "DX_SCHEMA", "DX_DATASET_CARD", "DX_DATASET_CARD_TEMPLATE", "dxDatasetCardTemplate", "dxDatasetCard", "DX_CARD_SECTIONS", "EPISODE_SCHEMA_VERSION", "observationSchema", "actionSpace"] },
};

/** Plain JSON copy (drops functions, THREE objects, cycles → throws, caught by the caller). */
const plain = (v) => JSON.parse(JSON.stringify(v));

/** Import every file a section may live in; returns `{ found: { export: value }, sources: [{ file, exports, found }] }`. */
export async function tqReadSection(shared, key) {
  const spec = TQ_SECTIONS[key];
  const names = existsSync(shared) ? readdirSync(shared) : [];
  const files = [...new Set(spec.files.flatMap((f) => (typeof f === "string" ? [f] : names.filter((n) => f.test(n)).sort())))];
  const found = {};
  const sources = [];
  for (const f of files) {
    const path = join(shared, f);
    const row = { file: `WebXR/shared/${f}`, found: [] };
    if (existsSync(path)) {
      try {
        const mod = await import(pathToFileURL(path).href);
        for (const e of spec.exports) if (mod[e] !== undefined && found[e] === undefined) { found[e] = mod[e]; row.found.push(e); }
        // The convention seam: any `<PREFIX>_SHARED` of this file's prefix.
        const px = f.split("-")[0].toUpperCase();
        if (mod[`${px}_SHARED`] !== undefined && !row.found.includes(`${px}_SHARED`)) { found[`${px}_SHARED`] = mod[`${px}_SHARED`]; row.found.push(`${px}_SHARED`); }
      } catch (e) { row.error = String(e?.message ?? e).slice(0, 160); }
    } else row.missing = true;
    sources.push(row);
  }
  if (!files.length) sources.push({ file: spec.files.map((f) => (typeof f === "string" ? `WebXR/shared/${f}` : `WebXR/shared/${f.source}`)).join(" | "), found: [], missing: true });
  return { found, sources };
}

const call = (v, ...a) => (typeof v === "function" ? v(...a) : v);
const section = (key, status, sources, data, extra = {}) => ({ status, owner: TQ_SECTIONS[key].owner, sources, ...extra, data });

// ---------------------------------------------------------------- per-section readers

async function tqMaps(shared) {
  const { found, sources } = await tqReadSection(shared, "maps");
  if (!found.NP_PARISHES) return section("maps", "pending", sources, null);
  const { NP_REGIONS, npRegionOf } = await import(pathToFileURL(join(shared, "np-parishes.js")).href);
  let lmKinds = null;
  try { const lm = await import(pathToFileURL(join(shared, "lm-landmarks.js")).href); lmKinds = typeof lm.lmKinds === "function" ? [...lm.lmKinds()] : null; sources.push({ file: "WebXR/shared/lm-landmarks.js", found: ["lmKinds"] }); } catch (_) { sources.push({ file: "WebXR/shared/lm-landmarks.js", found: [], missing: true }); }
  const maps = found.NP_PARISHES.map((p) => ({
    id: p.id, name: p.name, region: npRegionOf ? npRegionOf(p) : (p.region ?? "new-orleans"),
    sites: (p.sites ?? []).map((s) => ({ id: s.id, name: s.name, kind: s.kind ?? null, stations: [...(s.stations ?? [])] })),
    landmarks: (p.landmarks ?? []).map((l) => ({ id: l.id, name: l.name, kind: l.kind ?? null, lm: l.lm ?? null })),
    hills: (p.hills ?? []).map((h) => ({ id: h.id, name: h.name })),
  }));
  const regions = (NP_REGIONS ?? []).map((r) => ({ id: r.id, name: r.name, noun: r.noun ?? null, maps: maps.filter((m) => m.region === r.id).map((m) => m.id) }));
  return section("maps", "ready", sources, { regions, lmKinds, maps }, {
    note: "Places named only as places (facts rule). Sites and their layouts are authored for this platform; hills are listed by name only — their shape in the stylised maps is procedural, not survey data.",
  });
}

async function tqPalette(shared) {
  const { found, sources } = await tqReadSection(shared, "palette");
  const v = found.PA_SHARED?.categories ?? found.PA_CATEGORIES;
  if (v === undefined) return section("palette", "pending", sources, null);
  try { return section("palette", "ready", sources, { categories: plain(call(v)) }); } catch (e) { return section("palette", "pending", [...sources, { error: String(e.message).slice(0, 160) }], null); }
}

async function tqFacades(shared) {
  const { found, sources } = await tqReadSection(shared, "facades");
  const S = found.FC_SHARED ? call(found.FC_SHARED) : null;
  const kinds = S?.detailKinds ?? S?.kinds ?? found.FC_DETAIL_KINDS ?? found.FC_KINDS ?? found.FC_DETAILS;
  const signs = S?.signs ?? S?.genericSigns ?? found.FC_GENERIC_SIGNS ?? found.FC_SIGN_WORDS ?? found.FC_SIGN_TRADES ?? found.FC_SIGNS;
  const kits = S?.kits ?? found.FC_KITS;
  if (kinds === undefined && signs === undefined) return section("facades", "pending", sources, null);
  try {
    const data = { detailKinds: kinds === undefined ? null : plain(call(kinds)), signs: signs === undefined ? null : plain(call(signs)) };
    if (kits !== undefined) data.kits = plain(call(kits));
    return section("facades", data.detailKinds && data.signs ? "ready" : "partial", sources, data, { note: "Sign text is generic trades only — never a real business name or brand." });
  } catch (e) { return section("facades", "pending", [...sources, { error: String(e.message).slice(0, 160) }], null); }
}

async function tqVehicles(shared) {
  const { found, sources } = await tqReadSection(shared, "vehicles");
  if (!found.DV_DRIVABLES && !found.MV_SHARED && !found.MV_CLASSES && !found.MV_VEHICLE_CLASSES) return section("vehicles", "pending", sources, null);
  const r3 = (n) => (typeof n === "number" ? Math.round(n * 1000) / 1000 : n);
  const drivables = (found.DV_DRIVABLES ?? []).map((d) => ({
    id: d.id, name: d.name, medium: d.kind, class: d.class, trades: [...(d.trades ?? [])],
    gate: { stations: [...(d.gate?.stations ?? [])] },
    profile: Object.fromEntries(Object.entries(d.profile ?? {}).filter(([, v]) => typeof v === "number" || typeof v === "boolean").map(([k, v]) => [k, r3(v)])),
  }));
  let mv = null;
  try {
    const M = found.MV_SHARED ? call(found.MV_SHARED) : null;
    const classes = M?.classes ?? found.MV_CLASSES ?? found.MV_VEHICLE_CLASSES;
    const handling = M?.handling ?? found.MV_HANDLING;
    const rules = M?.siteRules ?? found.MV_SITE_RULES;
    if (classes !== undefined || handling !== undefined) mv = { classes: classes === undefined ? (handling === undefined ? null : Object.keys(call(handling))) : plain(call(classes)), handling: handling === undefined ? null : plain(call(handling)), siteRules: rules === undefined ? null : plain(call(rules)) };
  } catch (_) { mv = null; }
  return section("vehicles", mv ? "ready" : "partial", sources, {
    drivables,
    classes: [...new Set(drivables.map((d) => d.class))].sort(),
    motorworks: mv ?? { status: "pending", note: "MOTORWORKS' per-class handling (mass, top speed, turning radius, braking) fills in when mv-* merges." },
  }, { note: "Drive profiles are the game's own arcade units (world metres per second and radians per second), not vehicle specifications. Every drivable is gated on its pre-trip station(s)." });
}

async function tqRobotics(shared) {
  const { found, sources } = await tqReadSection(shared, "robotics");
  let S = null;
  try { S = found.RB_SHARED ? call(found.RB_SHARED) : found.rbSharedData ? plain(found.rbSharedData()) : null; } catch (_) { S = null; }
  const v = S?.scenarios ?? found.RB_SCENARIOS ?? found.rbScenarios;
  if (v === undefined) return section("robotics", "pending", sources, null);
  try {
    const list = plain(call(v));
    const scenarios = (Array.isArray(list) ? list : Object.entries(list).map(([id, s]) => ({ id, ...s })));
    const { scenarios: _s, ...rest } = S ?? {};
    return section("robotics", "ready", sources, { scenarios, api: S?.api ?? "rbEnv(scenarioId) → { reset(seed), step(action) → { observation, reward, done, info } }", ...rest });
  } catch (e) { return section("robotics", "pending", [...sources, { error: String(e.message).slice(0, 160) }], null); }
}

async function tqDataset(shared) {
  const { found, sources } = await tqReadSection(shared, "dataset");
  const S = found.DX_SHARED ? call(found.DX_SHARED) : null;
  const data = {};
  try {
    if (found.EPISODE_SCHEMA_VERSION !== undefined) data.episodes = { schemaVersion: found.EPISODE_SCHEMA_VERSION, source: "WebXR/shared/episodes.js", doc: "docs/robot-datasets.md" };
    if (found.observationSchema || found.actionSpace) data.embodiment = { observation: found.observationSchema ? plain(found.observationSchema()) : null, action: found.actionSpace ? plain(found.actionSpace()) : null };
    const schema = S?.episodeSchema ?? found.DX_EPISODE_SCHEMA ?? found.DX_SCHEMA;
    const card = S?.datasetCard ?? found.DX_DATASET_CARD_TEMPLATE ?? found.DX_DATASET_CARD ?? found.dxDatasetCardTemplate ?? found.dxDatasetCard ?? (found.DX_CARD_SECTIONS ? { sections: found.DX_CARD_SECTIONS } : undefined);
    if (found.DX_CARD_SECTIONS) data.cardSections = plain(found.DX_CARD_SECTIONS);
    data.episodeSchema = schema === undefined ? null : plain(call(schema));
    data.datasetCard = card === undefined ? null : plain(call(card));
  } catch (e) { sources.push({ error: String(e.message).slice(0, 160) }); }
  const dx = data.episodeSchema && data.datasetCard;
  const any = data.episodes || data.embodiment || data.episodeSchema || data.datasetCard;
  return section("dataset", dx ? "ready" : any ? "partial" : "pending", sources, any ? data : null, {
    note: "Schemas and templates only — no episode, no learner data. DATAWORKS' episode schema and dataset-card template fill in when dx-* merges.",
  });
}

/** Extend DEAN's v1 document to v2 (every v1 field kept). */
export async function tqExtend(v1, { shared }) {
  const [maps, palette, facades, vehicles, robotics, dataset] = await Promise.all([tqMaps(shared), tqPalette(shared), tqFacades(shared), tqVehicles(shared), tqRobotics(shared), tqDataset(shared)]);
  const all = { maps, palette, facades, vehicles, robotics, dataset };
  const sections = Object.fromEntries(Object.entries(all).map(([k, s]) => [k, { status: s.status, owner: s.owner, sources: s.sources.map((r) => r.file).filter(Boolean) }]));
  sections.packs = { status: v1.packs?.length ? "ready" : "pending", owner: "PACKS (pk-packs) via DEAN", sources: ["WebXR/shared/pk-packs.js"] };
  sections.paths = { status: v1.paths?.length ? "ready" : "pending", owner: "STORYLINE via DEAN", sources: ["WebXR/shared/dn-modules.js"] };
  return {
    ...v1,
    version: TQ_VERSION,
    generatedBy: "tools/export_shared.mjs (console DEAN, v2 sections by TQ-BRIDGE: tools/tq_bridge.mjs)",
    readers: ["SmartCiti.X Holodeck", "SmartCiti.X TradeQuest (Trade Craft Academy) via exports/shared/tradequest-adapter.js"],
    changelog: TQ_CHANGELOG,
    budget: { maxBytes: TQ_BUDGET_BYTES, maxGzipBytes: TQ_BUDGET_GZIP_BYTES, measures: "exports/shared/holodeck-shared.json as written (JSON, indent 1); v1 was 344 KiB, the maps section adds ~172 KiB, the rest is headroom for the pending sections" },
    sections,
    ...all,
  };
}

// ---------------------------------------------------------------- the v2 schema

const STATUS = { enum: TQ_STATUSES };
const sectionSchema = (data) => ({ type: "object", required: ["status", "owner", "sources", "data"], properties: { status: STATUS, owner: { type: "string" }, sources: { type: "array" }, ...(data ? { data } : {}) } });

/** v2 = v1 (every property and requirement) + the TQ-BRIDGE sections. `v1Schema` is DEAN's DN_SHARED_SCHEMA. */
export function tqSchemaV2(v1Schema) {
  const id = { type: "string", pattern: "^[a-z0-9-]+$" };
  return {
    ...v1Schema,
    $id: "holodeck-shared.schema.json",
    title: "SmartCiti.X Holodeck shared data v2 (Holodeck + TradeQuest / Trade Craft Academy contract)",
    required: [...v1Schema.required, "changelog", "budget", "sections", "maps", "palette", "facades", "vehicles", "robotics", "dataset"],
    properties: {
      ...v1Schema.properties,
      changelog: { type: "array", items: { type: "object", required: ["version", "date", "changes"], properties: { version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" }, changes: { type: "array", items: { type: "string" } } } } },
      budget: { type: "object", required: ["maxBytes"], properties: { maxBytes: { type: "number" } } },
      sections: { type: "object", required: ["maps", "palette", "facades", "vehicles", "robotics", "dataset", "packs", "paths"], properties: Object.fromEntries(["maps", "palette", "facades", "vehicles", "robotics", "dataset", "packs", "paths"].map((k) => [k, { type: "object", required: ["status", "owner", "sources"], properties: { status: STATUS } }])) },
      maps: sectionSchema(null),
      palette: sectionSchema(null),
      facades: sectionSchema(null),
      vehicles: sectionSchema(null),
      robotics: sectionSchema(null),
      dataset: sectionSchema(null),
    },
    $defs: {
      mapsData: { type: "object", required: ["regions", "maps"], properties: {
        regions: { type: "array", items: { type: "object", required: ["id", "name", "maps"], properties: { id, maps: { type: "array", items: id } } } },
        maps: { type: "array", items: { type: "object", required: ["id", "name", "region", "sites", "landmarks", "hills"], properties: {
          id, name: { type: "string" }, region: id,
          sites: { type: "array", items: { type: "object", required: ["id", "name", "kind", "stations"], properties: { id, stations: { type: "array", items: id } } } },
          landmarks: { type: "array", items: { type: "object", required: ["id", "name", "lm"], properties: { id } } },
          hills: { type: "array", items: { type: "object", required: ["id", "name"], properties: { id } } },
        } } },
      } },
      vehiclesData: { type: "object", required: ["drivables", "classes", "motorworks"], properties: { drivables: { type: "array", items: { type: "object", required: ["id", "name", "medium", "class", "gate", "profile"], properties: { id, medium: { enum: ["road", "rail", "site", "water"] }, gate: { type: "object", required: ["stations"] } } } } } },
    },
  };
}

/** Validate a v2 document: the v2 schema, plus each ready/partial section's data against its $def. */
export function tqValidate(doc, schema, validate) {
  const bad = validate(doc, schema);
  if (doc.maps?.status !== "pending" && doc.maps?.data) bad.push(...validate(doc.maps.data, schema.$defs.mapsData, "$.maps.data"));
  if (doc.vehicles?.status !== "pending" && doc.vehicles?.data) bad.push(...validate(doc.vehicles.data, schema.$defs.vehiclesData, "$.vehicles.data"));
  for (const k of ["maps", "palette", "facades", "vehicles", "robotics", "dataset"]) {
    const s = doc[k];
    if (s && s.status === "pending" && s.data !== null) bad.push(`$.${k}: a pending section carries data null`);
    if (s && s.status !== "pending" && (s.data === null || s.data === undefined)) bad.push(`$.${k}: a ${s.status} section needs data`);
  }
  return bad;
}
