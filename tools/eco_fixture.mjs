#!/usr/bin/env node
/**
 * ECOSYSTEM-3 — the cross-repo fixture: one seeded run of the bus adapter, as JSONL (docs/ecosystem.md, seam 3–4).
 *
 *     node tools/eco_fixture.mjs            # writes docs/ecosystem/bus-fixture.jsonl
 *     node tools/eco_fixture.mjs --stdout   # prints the same bytes (tools/check_eco.mjs leg 10 compares them)
 *
 * Line 1 is a header that states the provenance. Every other line is one adapter output in the shape SmartCiti.X documents
 * at 398f287: a `telemetry.event` bus message ({ topic, role, schema_version, event_id, payload: ACP-01 envelope }) or an
 * audit entry ({ seq, ts, actor, action, before, after, why, learner, skill }). The inputs are entirely synthetic:
 *   * the first 8 ticks of the round-7 hive day (oh-hive.js ohHive, seed 3, a 160-tick day: the same day leg 4 of
 *     tools/check_eco.mjs replays in full; all 160 ticks come to about 724 KB, so the fixture keeps the opening — the first
 *     jobs, bids, awards, dispatches and the agents' lines — inside the 50 KB limit),
 *     three governor decisions (one simulated dispatch allowed, one physical target refused, one unknown site refused) and
 *     two arena rows;
 *   * a synthetic learner: two runs of a two-step check room through the real shared/game.js Session, wired by eco-learn.js
 *     exactly as the smartcity and trades apps wire it, with injected probes (consent on, a fixed pseudonym, a fixed clock).
 *     No real person's events are ever read: the probes never touch dx-data.js's stores, storage or a page.
 * Deterministic: the same sources give byte-identical output (fixed clock, no timestamps of its own). The SmartCiti.X brief
 * (tools/briefs/ecosystem/smartcitix-adopt-bus-adapter.md) points its loop agent at this file as the input to replay.
 * Local only: nothing is fetched and nothing is sent. Every top-level name carries the eco/ECO_ prefix.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ECO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ecoImp = (rel) => import(pathToFileURL(join(ECO_ROOT, rel)).href);

export const ECO_FIXTURE_PATH = "docs/ecosystem/bus-fixture.jsonl";
export const ECO_FIXTURE_LIMIT = 50 * 1024;
export const ECO_FIXTURE_SEED = 3;
export const ECO_FIXTURE_DAY = 160;
export const ECO_FIXTURE_TICKS = 8;
export const ECO_FIXTURE_LEARNER = "fx-learner-000001";
export const ECO_FIXTURE_T0 = Date.parse("2026-10-12T19:00:00.000Z");

/** The two-step check room the synthetic learner plays (the same shape tools/check_eco.mjs leg 8 uses). */
export function ecoFixtureRoom() {
  return { id: "eco-check-room", name: "Eco Check Room", parSeconds: 60, hazards: { haz1: "that one bites." }, interrupts: [],
    steps: [{ id: "s1", kind: "select", target: "a", title: "Touch A", why: "first." }, { id: "s2", kind: "gauge", target: "g", title: "Set the gauge", why: "green.", gauge: { green: [0.4, 0.6] } }] };
}

/** Build the fixture lines (header first). Pure apart from the module imports; no storage, no page, no network. */
export async function ecoFixtureLines() {
  const BUS = await ecoImp("WebXR/shared/eco-bus.js");
  const OH = await ecoImp("WebXR/shared/oh-hive.js");
  const VB = await ecoImp("WebXR/shared/vb-governor.js");
  let t = ECO_FIXTURE_T0;
  const clock = () => (t += 1000);

  // The robot side: the seeded hive day, the governor's own decisions and two arena rows, as audit entries (learner: null).
  const robots = BUS.ecoBus({ consent: { demo: false, signedIn: true, k12: false, adult: true, optedIn: true }, clock, sessionId: "fx-robots" });
  const hive = OH.ohHive({ seed: ECO_FIXTURE_SEED, ticksPerDay: ECO_FIXTURE_DAY });
  const hiveEvents = hive.run(ECO_FIXTURE_TICKS); // the first ticks of the same seeded day leg 4 replays in full
  for (const ev of hiveEvents) robots.hive(ev);
  const gov = VB.vbGovernor({});
  const base = { clientId: "fx-c1", policyId: "vb-scripted-expert", siteId: "rb-site-soma-robot-cell", taskType: "rb-cell-entry", speed: 0.1, nearestPersonM: 6, agentId: "oh-dispatcher" };
  const cmds = [{ ...base, jobId: "j1", target: { kind: "sim", robotId: "rb-site-soma-robot-cell:cell" } },
    { ...base, jobId: "j2", target: { kind: "physical", robotId: "rb-site-soma-robot-cell:cell" } },
    { ...base, jobId: "j3", siteId: "nowhere", target: { kind: "sim", robotId: "r" } }];
  for (const c of cmds) robots.governor(gov.check(c), c);
  robots.arena({ modelId: "bc", scenarioId: "rb-cell-entry", k: 50, n: 60, lo: 0.72, hi: 0.91 });
  robots.arena({ modelId: "dagger", scenarioId: "rb-cobot-zone-setup", k: 41, n: 60 });

  // The learner side: a real Session, wired by eco-learn.js, under injected probes (never dx-data.js's stores).
  globalThis.window = globalThis.window ?? {};
  const { Session, Sfx } = await ecoImp("WebXR/shared/game.js");
  Sfx.muted = true;
  const LEARN = await ecoImp("WebXR/shared/eco-learn.js");
  const probes = { collecting: () => true, signals: () => ({ demo: false, signedIn: true, k12: false, adult: true }), pseudonym: () => ECO_FIXTURE_LEARNER, clock };
  const play = (hazard) => {
    const session = new Session(ecoFixtureRoom(), {});
    LEARN.ecoAttachLearner(session, { station: "eco-check-room", skills: ["loto"], probes });
    session.start(); if (hazard) session.select("haz1"); session.select("a"); session.gauge.t = 0.5; session.select("g");
  };
  play(false); // a clean pass: attempted, answered, answered, completed
  play(true); // a hazard hit: attempted, answered (wrong), answered, answered, failed
  const learner = LEARN.ecoLearnMessages();
  LEARN.ecoLearnRevoke();

  const header = {
    fixture: "eco-bus adapter output, one seeded run", version: 1, generator: "tools/eco_fixture.mjs", rows: robots.audit().length + learner.length,
    shapes: { source: BUS.ECO_BUS_SOURCE, message: "bus/bus.mjs message with a bus/telemetry.mjs ACP-01 envelope as payload", audit: "bus/audit.mjs entry" },
    inputs: { hive: { module: "WebXR/shared/oh-hive.js", seed: ECO_FIXTURE_SEED, ticksPerDay: ECO_FIXTURE_DAY, ticks: ECO_FIXTURE_TICKS, events: hiveEvents.length }, governor: { module: "WebXR/shared/vb-governor.js", decisions: cmds.length }, arena: { rows: 2 },
      learner: { module: "WebXR/shared/game.js + eco-learn.js", runs: 2, pseudonym: ECO_FIXTURE_LEARNER, synthetic: true, realPerson: false } },
    clock: { t0: new Date(ECO_FIXTURE_T0).toISOString(), stepMs: 1000, deterministic: true },
    rules: ["no real person's events", "adults only, opted in (DATAWORKS)", "affect, mood and free text never leave (ACP-08)", "robot-side entries carry no learner", "physical dispatches 0", "local only: nothing fetched, nothing sent"],
  };
  return [JSON.stringify(header), ...robots.audit().map((a) => JSON.stringify({ kind: "audit", entry: a })), ...learner.map((m) => JSON.stringify({ kind: "message", message: m }))];
}

export async function ecoFixtureText() { return `${(await ecoFixtureLines()).join("\n")}\n`; }

const ecoIsMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (ecoIsMain) {
  const text = await ecoFixtureText();
  if (process.argv.includes("--stdout")) { process.stdout.write(text); }
  else {
    const out = join(ECO_ROOT, ECO_FIXTURE_PATH);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, text);
    console.log(`${ECO_FIXTURE_PATH}: ${text.split("\n").length - 1} lines, ${Buffer.byteLength(text)} bytes (limit ${ECO_FIXTURE_LIMIT})`);
  }
}
