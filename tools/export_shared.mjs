#!/usr/bin/env node
/**
 * The shared-data contract with SmartCiti.X Trade Craft Academy (console DEAN, docs/modules.md §4):
 * writes `exports/shared/holodeck-shared.json` and `exports/shared/holodeck-shared.schema.json` —
 * the packs, the STORYLINE paths, the module and version schemas, the lesson and station ids by
 * world, and every parish/district id with its lat/lng frame, versioned, with the provenance of
 * the Trade Craft Academy parish data this platform already reuses (its procedural street fabric).
 * The Trade Craft Academy site and TradeQuest read this file; nothing here is fetched.
 *
 *     node tools/export_shared.mjs            # write both files
 *     node tools/export_shared.mjs --check    # build and validate, write nothing (exit 1 on a schema error)
 *     node tools/export_shared.mjs --refresh-streets [dir]   # first copy the street artifact's stamps into tools/tcacademy-streets.json
 *
 * v2 (console TQ-BRIDGE, docs/tradequest-bridge.md): `dnBuildShared()` still builds the v1 document;
 * `dnBuildSharedV2()` extends it through tools/tq_bridge.mjs (maps, palette, facades, vehicles, robotics,
 * dataset — each read from its owner behind a guard, `pending` until it exists), and the files written are
 * v2 with the v2 schema (a superset of v1). exports/shared/tradequest-adapter.js maps v2 for TradeQuest.
 *
 * Packs: PACKS' registry (`WebXR/shared/pk-packs.js`, `pkPacks()`) when it is in the tree, else one
 * fallback pack per catalogue programme (`packsSource` says which).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { tqExtend, tqSchemaV2, tqValidate, TQ_BUDGET_BYTES, TQ_BUDGET_GZIP_BYTES } from "./tq_bridge.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR/shared");
export const DN_SHARED_VERSION = "1.0.0";
const OUT = join(ROOT, "exports/shared");
const STREETS_FILE = join(ROOT, "tools/tcacademy-streets.json");

/** The committed provenance of the Trade Craft Academy street artifact: `[{ parish, fips, sourceStamp, frameOrigin }]`. */
export function dnStreetsProvenance() {
  try { return JSON.parse(readFileSync(STREETS_FILE, "utf8")).files ?? []; } catch (_) { return []; }
}

/** Copy the artifact's stamps and frame origins into tools/tcacademy-streets.json; `dir` holds `<fips>.json` files.
 *  Returns the rows written, or null when the artifact is not on this machine (the committed copy stands). */
export function dnRefreshStreets(dir, fipsByParish) {
  if (!existsSync(dir)) return null;
  const files = Object.entries(fipsByParish).map(([parish, fips]) => {
    const f = join(dir, `${fips}.json`);
    let sourceStamp = null, frameOrigin = null;
    if (existsSync(f)) { try { const d = JSON.parse(readFileSync(f, "utf8")); sourceStamp = d.source_stamp ?? null; const o = typeof d.frame_origin === "string" ? JSON.parse(d.frame_origin) : d.frame_origin; frameOrigin = o ? [o.lng, o.lat] : null; } catch (_) { /* unreadable: keep null */ } }
    return { parish, fips, sourceStamp, frameOrigin };
  });
  const prev = (() => { try { return JSON.parse(readFileSync(STREETS_FILE, "utf8")); } catch (_) { return {}; } })();
  writeFileSync(STREETS_FILE, JSON.stringify({ what: prev.what ?? "Provenance of the Trade Craft Academy street artifact.", files }, null, 2).replace(/\[\n\s+(-?\d[^\]]*?)\n\s+\]/g, (m, inner) => `[${inner.replace(/,\n\s+/g, ", ")}]`) + "\n");
  return files;
}

// A headless storage for the modules that read gtStorage at import time.
if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; }

/** The contract's JSON Schema (draft 2020-12 subset: type, required, properties, items, enum, pattern, const). */
export const DN_SHARED_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "holodeck-shared.schema.json",
  title: "SmartCiti.X Holodeck shared data (Trade Craft Academy contract)",
  type: "object",
  required: ["contract", "version", "generatedBy", "packsSource", "packs", "paths", "schemas", "worlds", "parishes", "provenance"],
  properties: {
    contract: { const: "smartcitix-holodeck-shared" },
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    generatedBy: { type: "string" },
    packsSource: { enum: ["pk-packs", "fallback-programmes"] },
    packs: { type: "array", items: { type: "object", required: ["id", "title", "stations"], properties: { id: { type: "string", pattern: "^[a-z0-9-]+$" }, title: { type: "string" }, stations: { type: "array", items: { type: "string" } } } } },
    paths: { type: "array", items: { type: "string", pattern: "^[a-z0-9-]+$" } },
    schemas: { type: "object", required: ["module", "version"], properties: { module: { type: "object" }, version: { type: "object" } } },
    worlds: { type: "object" },
    parishes: { type: "array", items: { type: "object", required: ["id", "name", "region", "centre", "bounds"], properties: {
      id: { type: "string", pattern: "^[a-z0-9-]+$" }, name: { type: "string" }, region: { type: "string" },
      centre: { type: "array", items: { type: "number" } },
      bounds: { type: "object", required: ["minLng", "minLat", "maxLng", "maxLat"] },
    } } },
    provenance: { type: "array", items: { type: "object", required: ["what", "source", "provenance"] } },
  },
};

/** Validate `doc` against the subset of JSON Schema above; returns a list of `path: problem`. */
export function dnValidateSchema(doc, schema = DN_SHARED_SCHEMA, at = "$") {
  const bad = [];
  const type = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);
  if ("const" in schema && doc !== schema.const) bad.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(doc)) bad.push(`${at}: must be one of ${schema.enum.join(", ")}`);
  if (schema.type && type(doc) !== schema.type) { bad.push(`${at}: must be ${schema.type}`); return bad; }
  if (schema.pattern && typeof doc === "string" && !new RegExp(schema.pattern).test(doc)) bad.push(`${at}: does not match ${schema.pattern}`);
  if (type(doc) === "object") {
    for (const k of schema.required ?? []) if (!(k in doc)) bad.push(`${at}: missing ${k}`);
    for (const [k, sub] of Object.entries(schema.properties ?? {})) if (k in doc) bad.push(...dnValidateSchema(doc[k], sub, `${at}.${k}`));
  }
  if (type(doc) === "array" && schema.items) doc.forEach((v, i) => bad.push(...dnValidateSchema(v, schema.items, `${at}[${i}]`)));
  return bad;
}

/** Build the contract document (pure apart from reading the tree). */
export async function dnBuildShared() {
  const imp = (f) => import(pathToFileURL(join(SHARED, f)).href);
  const { dnLessonIndex, dnFrames, DN_PARISH_FIPS } = await imp("dn-index.js");
  const { DN_PATHS, DN_WORLDS, DN_LESSON_KINDS, dnPacks, dnUsePacks, DN_SCHEMA_VERSION } = await imp("dn-modules.js");
  if (existsSync(join(SHARED, "pk-packs.js"))) { try { dnUsePacks((await imp("pk-packs.js")).pkPacks); } catch (_) { /* fall back */ } }
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
  const index = dnLessonIndex({ catalogIds: catalog.stations.map((s) => s.id) });
  const packs = dnPacks();
  // The street artifact's provenance comes from the committed copy (tools/tcacademy-streets.json), never from the
  // artifact's own files: those live outside the repo, so a build that read them differed between the machine that
  // holds them and a clean checkout (CI's). `--refresh-streets` copies them in when they are present.
  const known = new Map(dnStreetsProvenance().map((s) => [s.fips, s]));
  const streets = Object.entries(DN_PARISH_FIPS).map(([parish, fips]) => ({ parish, fips, sourceStamp: known.get(fips)?.sourceStamp ?? null, frameOrigin: known.get(fips)?.frameOrigin ?? null }));
  return {
    contract: "smartcitix-holodeck-shared",
    version: DN_SHARED_VERSION,
    generatedBy: "tools/export_shared.mjs (console DEAN)",
    note: "SmartCiti.X · Powered by AGI Corp. Ids and frames only: no learner data, no real addresses or figures. Parish and district frames are approximate affine fits of stylised maps (docs/parishes.md), not survey data.",
    packsSource: packs[0]?.source === "pk-packs" ? "pk-packs" : "fallback-programmes",
    packs: packs.map((p) => ({ id: p.id, title: p.title, programmes: p.programmes ?? [], stations: (p.stations ?? []).map((s) => (typeof s === "string" ? s : s.id)), worlds: p.worlds ?? null, path: p.path ?? null })),
    paths: DN_PATHS,
    schemas: {
      module: { v: DN_SCHEMA_VERSION, kind: "module", id: "mod-…", title: "string", lessons: [{ kind: DN_LESSON_KINDS, id: "string", world: "string|null" }], due: "YYYY-MM-DD|null", requiredScore: "0..100", assign: [{ classCode: "XXXX-XXXX", at: "ISO" }], doc: "docs/modules.md" },
      version: { v: DN_SCHEMA_VERSION, kind: "version", id: "ver-…", name: "string", scope: { kind: ["class", "org", "device"], id: "string|null" }, packs: "string[]|null", worlds: DN_WORLDS, paths: DN_PATHS, programmes: "string[]|null", locked: "boolean", lockedPath: "path id|null", doc: "docs/modules.md" },
    },
    worlds: index.byWorld(),
    parishes: dnFrames(),
    provenance: [
      { what: "procedural street fabric of the five New Orleans parishes", source: "SmartCiti.X Trade Craft Academy artifact, parishes/maps/streets/<fips>.json", provenance: "AUTHORED — procedural polylines in local metres around each parish's frame origin; not the real street grid", files: streets },
      { what: "parish and district maps, sites and lessons", source: "WebXR/shared/np-data-*.js, field-lessons.js, by-parish-lessons.js", provenance: "authored for this platform; places named only as places" },
      { what: "stations and programmes", source: "WebXR/smartcity/catalog.json, WebXR/shared/passport-programmes.js", provenance: "generated from SmartCiti.X curricula" },
    ],
  };
}

/** The v2 JSON Schema (DEAN's v1 schema plus the TQ-BRIDGE sections). */
export const TQ_SHARED_SCHEMA_V2 = tqSchemaV2(DN_SHARED_SCHEMA);

/** Build the v2 document: v1 + the TQ-BRIDGE sections (tools/tq_bridge.mjs). */
export async function dnBuildSharedV2() { return tqExtend(await dnBuildShared(), { shared: SHARED }); }

/** The file as written (and as the size budget measures it): compact JSON, one top-level section per line, so readers
 * (TradeQuest) parse every field as before, the whitespace no longer spends the budget, and diffs stay per section. */
export const dnSharedText = (doc) => `{\n${Object.entries(doc).map(([k, v]) => `${JSON.stringify(k)}:${JSON.stringify(v)}`).join(",\n")}\n}\n`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--refresh-streets")) {
    const at = process.argv.indexOf("--refresh-streets");
    const dir = process.argv[at + 1] && !process.argv[at + 1].startsWith("--") ? process.argv[at + 1] : join(process.env.SP ?? "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad", "packs/tcacademy/parishes/maps/streets");
    const { DN_PARISH_FIPS } = await import(pathToFileURL(join(SHARED, "dn-index.js")).href);
    const rows = dnRefreshStreets(dir, DN_PARISH_FIPS);
    console.log(rows ? `export_shared: tools/tcacademy-streets.json refreshed from ${dir} (${rows.filter((r) => r.sourceStamp).length}/${rows.length} stamped)` : `export_shared: ${dir} is not on this machine; tools/tcacademy-streets.json kept`);
  }
  const doc = await dnBuildSharedV2();
  const bad = [...dnValidateSchema(doc), ...tqValidate(doc, TQ_SHARED_SCHEMA_V2, dnValidateSchema)];
  const text = dnSharedText(doc);
  const bytes = Buffer.byteLength(text);
  const gz = gzipSync(text).length;
  if (bytes > TQ_BUDGET_BYTES) bad.push(`size ${bytes} B over the budget of ${TQ_BUDGET_BYTES} B`);
  if (gz > TQ_BUDGET_GZIP_BYTES) bad.push(`gzipped ${gz} B over the budget of ${TQ_BUDGET_GZIP_BYTES} B`);
  if (bad.length) { console.error(bad.slice(0, 20).join("\n")); process.exit(1); }
  if (!process.argv.includes("--check")) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, "holodeck-shared.json"), text);
    writeFileSync(join(OUT, "holodeck-shared.schema.json"), `${JSON.stringify(TQ_SHARED_SCHEMA_V2, null, 2)}\n`);
  }
  const st = Object.entries(doc.sections).map(([k, s]) => `${k} ${s.status}`).join(", ");
  console.log(`export_shared: v${doc.version} · ${doc.packs.length} packs (${doc.packsSource}) · ${doc.paths.length} paths · ${Object.keys(doc.worlds).length} worlds · ${doc.parishes.length} parishes/districts · sections: ${st} · ${(bytes / 1024).toFixed(1)} KiB of ${TQ_BUDGET_BYTES / 1024} KiB (gzip ${(gz / 1024).toFixed(1)} of ${TQ_BUDGET_GZIP_BYTES / 1024}) · valid${process.argv.includes("--check") ? " (not written)" : " → exports/shared/holodeck-shared.json"}`);
}
