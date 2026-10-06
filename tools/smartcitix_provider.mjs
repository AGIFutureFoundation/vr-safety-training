#!/usr/bin/env node
/**
 * SmartCiti.X local provider stub — implements the four offerings in
 * agents/smartcitix/offerings/ against this platform, for dry runs only.
 *
 * It takes a job event shaped like the one acp-cli's SKILL.md describes for
 * the provider loop (jobId, chainId, status, roles, availableTools, and an
 * entry whose contentType is "requirement" and whose content is a JSON
 * string), validates the requirement against the offering's JSON schema, runs
 * the matching handler and returns a deliverable. It never submits anything:
 * no network call, no signing, no wallet, no acp command. The owner's provider
 * loop (agents/smartcitix/runbook.md) is what would submit a deliverable.
 *
 *   node tools/smartcitix_provider.mjs --dry-run                 # three jobs: evaluation, dataset slice, curriculum query
 *   node tools/smartcitix_provider.mjs --job event.json          # one job event from a file
 *   node tools/smartcitix_provider.mjs --offering curriculum-query --requirement '{"programmeId":"confined-space"}'
 *
 * The `offering` field on an event is this stub's own: how a live event names
 * its offering is to verify against the official docs.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const OFFERINGS_DIR = join(ROOT, "agents", "smartcitix", "offerings");
export const NOTICE = "Evidence of how a procedure plays out under the SmartCiti.X Holodeck engine's scoring, in simulation. Not a certification and not a credential issued by any body.";

/** Every offering file, by offering name. */
export function loadOfferings() {
  const out = {};
  for (const f of readdirSync(OFFERINGS_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const o = JSON.parse(readFileSync(join(OFFERINGS_DIR, f), "utf8"));
    out[o.name] = o;
  }
  return out;
}

/** A small JSON-schema check for the subset the offerings use. Returns issues. */
export function validateRequirement(schema, value, path = "requirement") {
  const issues = [];
  if (typeof schema !== "object" || schema === null) return issues;
  const t = schema.type;
  const typeOk = t === "object" ? value && typeof value === "object" && !Array.isArray(value)
    : t === "array" ? Array.isArray(value)
    : t === "integer" ? Number.isInteger(value)
    : t === "number" ? typeof value === "number" && Number.isFinite(value)
    : t === "string" ? typeof value === "string"
    : t === "boolean" ? typeof value === "boolean" : true;
  if (!typeOk) return [`${path} should be ${t}`];
  if (schema.enum && !schema.enum.includes(value)) issues.push(`${path} should be one of ${schema.enum.join(", ")}`);
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) issues.push(`${path} is below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) issues.push(`${path} is above ${schema.maximum}`);
  }
  if (t === "object") {
    for (const r of schema.required ?? []) if (!(r in value)) issues.push(`${path}.${r} is required`);
    for (const [k, v] of Object.entries(value)) {
      if (!schema.properties?.[k]) { if (schema.additionalProperties === false) issues.push(`${path}.${k} is not a field of this offering`); continue; }
      issues.push(...validateRequirement(schema.properties[k], v, `${path}.${k}`));
    }
  }
  if (t === "array" && schema.items) value.forEach((v, i) => issues.push(...validateRequirement(schema.items, v, `${path}[${i}]`)));
  return issues;
}

async function registry() { return import(pathToFileURL(join(ROOT, "WebXR", "shared", "skill-registry.js")).href); }

function graphOf(st, reg) {
  return {
    id: st.id, app: st.app, name: st.name, category: st.category, union: st.union, programmes: st.programmes,
    primitives: st.nodes.map((n, i) => ({ step: i, id: n.id, primitive: n.p, preconditions: reg.skPreconditionsAt(st, i) })),
    preconditions: st.preconditions, failures: st.failures,
  };
}

// ------------------------------------------------------------------ handlers

const suites = new Map();
async function suiteFor(app) {
  if (!suites.has(app)) {
    const h = await import(pathToFileURL(join(ROOT, "tools", "lib", "headless.mjs")).href);
    suites.set(app, app === "smartcity" ? await h.loadSmartCity() : await h.loadTrades());
  }
  return suites.get(app);
}

/** station-evaluation: a policy through a station on the real engine (WebXR/shared/robot.js runEpisode). */
export async function evaluateStation(req) {
  const reg = await registry();
  const st = reg.skStation(req.stationId, req.app);
  if (!st) throw new Error(`no station ${req.app}/${req.stationId} in the skill registry`);
  const suite = await suiteFor(req.app);
  suite.Sfx.muted = true;
  const room = suite.ROOMS.find((r) => r.id === req.stationId);
  if (!room) throw new Error(`station ${req.stationId} is in the registry but not in the ${req.app} suite`);
  const root = new suite.THREE.Group();
  const api = room.build(root);
  const skill = req.skill ?? 1, seed = req.seed ?? 1;
  const { summary } = suite.runEpisode(room, api, { skill, seed, trajectory: false, SessionClass: suite.Session });
  return {
    station: graphOf(st, reg),
    policy: { kind: "reference-robot-agent", skill, seed, note: "Locally the policy is the platform's reference robot agent at this skill; evaluating a buyer-supplied policy is a later milestone." },
    summary,
    notice: NOTICE,
  };
}

/** robot-skill-dataset: a synthetic slice through tools/export_dataset.mjs, with its licence and consent fields. */
export async function exportDatasetSlice(req, { out = null, keep = false } = {}) {
  const dir = out ?? mkdtempSync(join(tmpdir(), "smartcitix-dataset-"));
  try {
    const args = [join(ROOT, "tools", "export_dataset.mjs"), "--apps", req.app, "--stations", String(req.stations ?? 2), "--seeds", String(req.seeds ?? 1),
      "--skills", (req.skills ?? [1]).join(","), "--out", dir];
    const r = spawnSync(process.execPath, args, { encoding: "utf8", cwd: ROOT });
    if (r.status !== 0) throw new Error(`export failed: ${(r.stderr || r.stdout).trim().split("\n").pop()}`);
    const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8"));
    const { validateFormats } = await import(pathToFileURL(join(ROOT, "tools", "lib", "dataset_formats.mjs")).href);
    const v = validateFormats(dir);
    return {
      manifest: { schemaVersion: manifest.schemaVersion, stations: manifest.stations, totals: manifest.totals, formats: manifest.formats ?? null, human: manifest.human },
      layouts: { lerobot: { valid: v.lerobot.valid, frames: v.lerobot.frames }, rlds: { valid: v.rlds.valid, steps: v.rlds.steps } },
      licence: manifest.licence,
      consent: "Synthetic rollouts only; no learner episode is included without the learner's opt-in and the distributor's permission.",
      files: readdirSync(dir).sort(),
      delivery: "Local files only. How the owner hands files to a buyer is decided by the owner; nothing is uploaded from here.",
      notice: manifest.notice ?? NOTICE,
    };
  } finally { if (!out && !keep) rmSync(dir, { recursive: true, force: true }); }
}

/** curriculum-query: a programme's stations, or one station's task graph, from the skill registry. */
export async function curriculumQuery(req) {
  const reg = await registry();
  if (req.stationId) {
    const st = reg.skStation(req.stationId, req.app ?? null);
    if (!st) throw new Error(`no station ${req.stationId} in the skill registry`);
    return { station: graphOf(st, reg) };
  }
  if (req.programmeId) {
    const list = reg.skStationsForProgramme(req.programmeId);
    if (!list.length) throw new Error(`no station names programme ${req.programmeId}`);
    return { programme: req.programmeId, stations: list.map((s) => ({ id: s.id, app: s.app, name: s.name, union: s.union, steps: s.nodes.length })) };
  }
  const programmes = [...new Set(reg.SK_STATIONS.flatMap((s) => s.programmes))].sort();
  return { programmes, stations: reg.SK_STATIONS.length, primitives: reg.SK_PRIMITIVES.map((p) => p.id) };
}

/** lesson-service: composeLesson (WebXR/shared/lessons.js) over the published station roster. */
export async function composeLessonJob(req) {
  const { composeLesson } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "lessons.js")).href);
  const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR", "smartcity", "catalog.json"), "utf8"));
  const roster = catalog.stations.map((s) => ({ ...s, stepCount: s.steps, interruptCount: s.interrupts }));
  const lesson = composeLesson(req.prompt, roster, { max: req.max ?? 6 });
  if (!lesson) throw new Error("nothing in that sentence names a topic, union or sector the station roster covers");
  return { lesson: { ...lesson, id: `lesson-${lesson.stations.map((s) => s.id).join("-").slice(0, 60)}` }, notice: NOTICE };
}

export const HANDLERS = { evaluateStation, exportDatasetSlice, curriculumQuery, composeLessonJob };

// ------------------------------------------------------------------ job model

/** The requirement from an event: entry.content is a JSON string when contentType is "requirement". */
export function requirementOf(event) {
  const e = event?.entry;
  if (!e || e.contentType !== "requirement") throw new Error("the event carries no requirement message");
  return typeof e.content === "string" ? JSON.parse(e.content) : e.content;
}

/** Validate and run one job event; returns the deliverable. Nothing is submitted. */
export async function handleJob(event, opts = {}) {
  const offerings = loadOfferings();
  const off = offerings[event?.offering];
  if (!off) throw new Error(`unknown offering ${event?.offering} (have: ${Object.keys(offerings).join(", ")})`);
  const req = requirementOf(event);
  const issues = validateRequirement(off.requirements, req);
  if (issues.length) return { jobId: event.jobId, offering: off.name, status: "rejected-locally", issues, submitted: false };
  const handler = HANDLERS[off["x-smartcitix"].handler];
  if (typeof handler !== "function") throw new Error(`offering ${off.name} names no stub handler`);
  const deliverable = await handler(req, opts);
  return {
    jobId: event.jobId, offering: off.name, status: "deliverable-ready",
    deliverable, deliverableText: JSON.stringify(deliverable),
    submitted: false,
    note: "Dry run: produced locally; not submitted. The owner's provider loop would pass deliverableText to the provider submit step in agents/smartcitix/runbook.md.",
  };
}

/** A job event in the shape acp-cli's SKILL.md describes; no chain, because nothing is on-chain here. */
export function jobEvent(jobId, offering, requirement) {
  return {
    jobId, chainId: null, status: "funded", roles: ["provider"], availableTools: ["submit"], offering,
    entry: { contentType: "requirement", content: JSON.stringify(requirement) },
  };
}

export const DRY_RUNS = [
  jobEvent("dry-run-1", "station-evaluation", { stationId: "electrical", app: "trades", skill: 1, seed: 1 }),
  jobEvent("dry-run-2", "robot-skill-dataset", { app: "trades", stations: 2, seeds: 1, skills: [1] }),
  jobEvent("dry-run-3", "curriculum-query", { programmeId: "electrical-first-period" }),
];

export async function dryRuns() {
  const results = [];
  for (const ev of DRY_RUNS) results.push(await handleJob(ev));
  return results;
}

// ------------------------------------------------------------------ CLI

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
  try {
    let out;
    if (args.includes("--dry-run")) out = await dryRuns();
    else if (opt("job")) {
      const p = opt("job");
      if (!existsSync(p)) throw new Error(`no such file ${p}`);
      out = await handleJob(JSON.parse(readFileSync(p, "utf8")));
    } else if (opt("offering")) out = await handleJob(jobEvent("local-1", opt("offering"), JSON.parse(opt("requirement") ?? "{}")));
    else { console.log("usage: node tools/smartcitix_provider.mjs --dry-run | --job <event.json> | --offering <name> --requirement '<json>'"); process.exit(2); }
    console.log(JSON.stringify(out, null, 2));
  } catch (err) { console.error(JSON.stringify({ error: err.message })); process.exit(1); }
}
