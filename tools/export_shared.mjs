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
 *
 * Packs: PACKS' registry (`WebXR/shared/pk-packs.js`, `pkPacks()`) when it is in the tree, else one
 * fallback pack per catalogue programme (`packsSource` says which).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SHARED = join(ROOT, "WebXR/shared");
export const DN_SHARED_VERSION = "1.0.0";
const OUT = join(ROOT, "exports/shared");

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
  const SP = process.env.SP ?? "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
  const streets = Object.entries(DN_PARISH_FIPS).map(([parish, fips]) => {
    const f = join(SP, `packs/tcacademy/parishes/maps/streets/${fips}.json`);
    let stamp = null, origin = null;
    if (existsSync(f)) { try { const d = JSON.parse(readFileSync(f, "utf8")); stamp = d.source_stamp ?? null; origin = d.frame_origin ? [d.frame_origin.lng, d.frame_origin.lat] : null; } catch (_) { /* unreadable */ } }
    return { parish, fips, sourceStamp: stamp, frameOrigin: origin };
  });
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

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const doc = await dnBuildShared();
  const bad = dnValidateSchema(doc);
  if (bad.length) { console.error(bad.slice(0, 20).join("\n")); process.exit(1); }
  if (!process.argv.includes("--check")) {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(join(OUT, "holodeck-shared.json"), `${JSON.stringify(doc, null, 1)}\n`);
    writeFileSync(join(OUT, "holodeck-shared.schema.json"), `${JSON.stringify(DN_SHARED_SCHEMA, null, 2)}\n`);
  }
  console.log(`export_shared: v${doc.version} · ${doc.packs.length} packs (${doc.packsSource}) · ${doc.paths.length} paths · ${Object.keys(doc.worlds).length} worlds · ${doc.parishes.length} parishes/districts · valid${process.argv.includes("--check") ? " (not written)" : " → exports/shared/holodeck-shared.json"}`);
}
