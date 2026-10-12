#!/usr/bin/env node
/**
 * STRANDS (docs/strands-robots.md): the arena's simulated robots behind a small JSONL bridge, so a Python process
 * (robotics/strands/sim_robot.py) can drive them one step at a time. Simulated only.
 *
 * One JSON object per line on stdin, one reply per line on stdout. Deterministic for a seed. Every step goes through
 * the VBRIDGE governor exactly as the arena's own episode loop does (ra-arena.js raEpisode: a seeded SAFE simulated job
 * at the scenario's robot site, governor.monitor() on every step, a broken safe-practice rule is a deviation and halts
 * the run with a protective stop). The job's target is always { kind: "sim" }: `physical` counts dispatches to a
 * non-sim target and is 0 by construction (and reported on every reply).
 *
 * Ops:
 *   {"op":"hello"}                                   -> { ok, version, scenarios, physical: 0 }
 *   {"op":"reset","scenario","seed"}                 -> { ok, obs, maxSteps, siteId, physical: 0 }
 *   {"op":"step","action":A}                         -> { ok, obs, done, stopped, success, violations, governor, steps, physical: 0 }
 *        A is one of: an env action {"type",...}; a decoded label {"label","params":[...]} (the repo's colAction maps it
 *        to the env action, as the clone does); {"moves":[...]} (AMR, one label per robot); {"expert":true} (the
 *        scripted expert at skill 1 reads the simulator's own state, so it runs here; labelled so).
 *   {"op":"summary"}                                 -> raEpisode's per-seed shape + { chainOk, network }
 *   {"op":"check","target":"sim"|"physical",...}     -> the governor's check() decision (a physical target is refused
 *                                                       with the governor's own reason and text)
 *   {"op":"js_run","model","scenario","seeds"}       -> the arena's own raRun on the same seeds (parity checks only)
 *   {"op":"bye"}                                     -> { ok, network } and exit
 *
 * No network: fetch, net, tls, http, https and dgram are replaced at start with functions that throw and count; the
 * count is in every summary (expected 0). No environment variable is read. Station scenarios need the full suite and
 * are refused here with a reason.
 *
 *     printf '{"op":"reset","scenario":"rb-teleop-pick-place","seed":1}\n{"op":"step","action":{"expert":true}}\n' | node tools/ra_bridge.mjs
 */
import { createInterface } from "node:readline";
import net from "node:net";
import tls from "node:tls";
import http from "node:http";
import https from "node:https";
import dgram from "node:dgram";

let stNetwork = 0;
const stBlock = (name) => function blocked() { stNetwork += 1; throw new Error(`ra_bridge: network call blocked (${name})`); };
globalThis.fetch = stBlock("fetch");
net.connect = net.createConnection = stBlock("net.connect");
net.Socket.prototype.connect = stBlock("net.Socket.connect");
tls.connect = stBlock("tls.connect");
http.request = http.get = stBlock("http.request");
https.request = https.get = stBlock("https.request");
dgram.createSocket = stBlock("dgram.createSocket");

const { rng } = await import("../WebXR/shared/robot.js");
const { rbEnv, rbScenario } = await import("../WebXR/shared/rb-env.js");
const { colF, colBase, colAction } = await import("../WebXR/shared/col-learn.js");
const { vbGovernor } = await import("../WebXR/shared/vb-governor.js");
const { VB_RIG_LIMITS, VB_TASKS } = await import("../WebXR/shared/vb-shared-data.js");
const { raSiteFor, raScenarios, raRun } = await import("../WebXR/shared/ra-arena.js");
const { raLmTaskTexts } = await import("../WebXR/shared/ra-lm.js");

export const ST_BRIDGE_VERSION = "st-bridge/1";
const r3 = (n) => Math.round(n * 1000) / 1000;
const isStation = (sc) => String(sc).startsWith("rb-station-");

let ep = null;

/** The observation a Python policy sees: the scenario's named scene features (COLEARN colF; AMR: one vector per robot,
 * null once delivered), plus a small named state for joint-style policies. */
function stObs(sc, obs, t) {
  const base = colBase(sc), F = colF(base);
  const out = { scenario: sc, t, feature_names: F.names };
  if (base === "rb-amr-fleet-routing") out.robots = F.perRobot(obs).map((r) => (r.delivered ? null : r.f));
  else out.features = F.of(obs);
  if (base === "rb-teleop-pick-place") {
    const e = obs.effector ?? [0, 0, 0];
    out.state = { "ee.x": e[0], "ee.y": e[1], "ee.z": e[2], "gripper.pos": obs.carrying ? 1 : 0 };
  }
  return out;
}

function stReset({ scenario, seed }) {
  const sc = String(scenario ?? "");
  if (!rbScenario(sc)) return { ok: false, error: `unknown scenario ${sc}` };
  if (isStation(sc)) return { ok: false, error: `${sc} is a catalog station: it needs the full station suite, which this bridge does not load` };
  const s = Number(seed) >>> 0;
  const site = raSiteFor(sc), lim = site ? VB_RIG_LIMITS[site.rig] : null;
  const env = rbEnv(sc, { seed: s });
  const obs = env.reset(s);
  const R = rng(s * 2654435761 + 1);
  const job = { jobId: `ra-${sc}-${s}`, siteId: site?.id ?? "none", speed: lim ? r3(lim.maxSpeed * 0.5) : 0, nearestPersonM: 8, target: { kind: "sim" } };
  ep = { sc, seed: s, env, obs, R, gov: vbGovernor(), job, i: 0, steps: 0, checked: 0, ruleBreaks: 0, physical: 0, stop: null, done: false };
  return { ok: true, obs: stObs(sc, obs, 0), maxSteps: env.scenario.maxSteps, siteId: job.siteId, physical: 0 };
}

function stDecode(a) {
  if (!a || typeof a !== "object") return { type: "wait" };
  if (a.expert) return ep.env.expert(ep.obs, ep.R, 1);
  if (Array.isArray(a.moves)) return { type: "route", moves: a.moves.map(String) };
  if (typeof a.label === "string") return colAction(colBase(ep.sc), a.label, Array.isArray(a.params) ? a.params : [], ep.obs);
  if (typeof a.type === "string") return a;
  return { type: "wait" };
}

function stStep({ action }) {
  if (!ep) return { ok: false, error: "reset first" };
  if (ep.done) return { ok: false, error: "episode is over", done: true, physical: ep.physical };
  const act = stDecode(action);
  const r = ep.env.step(act);
  ep.steps += 1;
  const v = r.info.violations ?? [];
  ep.ruleBreaks += v.length;
  if (ep.job.target.kind !== "sim") ep.physical += 1;
  const m = ep.gov.monitor({ jobId: ep.job.jobId, siteId: ep.job.siteId, speed: ep.job.speed, nearestPersonM: ep.job.nearestPersonM, deviation: v.length ? `rule ${v[0]}` : null });
  if (m && m.action) ep.checked += 1;
  ep.obs = r.observation;
  if (m.action === "protective-stop" || m.action === "estop") { ep.stop = { at: ep.i, action: m.action, reason: m.reason }; ep.done = true; }
  if (r.done) ep.done = true;
  if (ep.i >= ep.env.scenario.maxSteps) ep.done = true;
  ep.i += 1;
  const success = ep.done ? !ep.stop && !!ep.env.summary().passed : false;
  return { ok: true, obs: stObs(ep.sc, ep.obs, ep.i), action: act, done: ep.done, stopped: !!ep.stop, success, violations: v, governor: { action: m.action, reason: m.reason ?? null }, steps: ep.steps, physical: ep.physical };
}

function stSummary() {
  if (!ep) return { ok: false, error: "reset first" };
  const s = ep.env.summary();
  return { ok: true, scenario: ep.sc, seed: ep.seed, success: !ep.stop && !!s.passed, steps: ep.steps, ruleBreaks: ep.ruleBreaks, stopped: !!ep.stop, stopReason: ep.stop?.reason ?? null, governorChecked: ep.checked, physical: ep.physical, chainOk: ep.gov.verify().ok, network: stNetwork };
}

/** The governor's own decision on a command; a request for a physical robot is refused with its reason. */
function stCheck(c) {
  const sc = String(c.scenario ?? "rb-teleop-pick-place");
  const site = rbScenario(sc) ? raSiteFor(sc) : null, lim = site ? VB_RIG_LIMITS[site.rig] : null;
  const gov = vbGovernor();
  // The governor's task allowlist names scenarios; the port gantry's rig runs the routing task (VB_TASKS).
  const taskType = c.taskType ?? (VB_TASKS[colBase(sc)] ? colBase(sc) : site?.rig === "gantry" ? "rb-amr-fleet-routing" : "rb-teleop-pick-place");
  const d = gov.check({ jobId: `st-${c.robot ?? "robot"}`, clientId: "strands-harness", taskType, siteId: site?.id ?? "none", target: { kind: c.target === "physical" ? "physical" : "sim", robotId: String(c.robot ?? "robot") }, speed: lim ? r3(lim.maxSpeed * 0.5) : 0, nearestPersonM: 8, policyId: c.policyId ?? "vb-scripted-expert" });
  return { ok: true, decision: d.decision, reasons: d.reasons, primary: d.primary, text: d.text, physical: 0 };
}

function stJsRun({ model, scenario, seeds }) {
  // ra-lm: the gym-only build, the same one tools/ra_export_weights.mjs exports (task texts without the station suite).
  const lmOptions = String(model) === "ra-lm" ? { texts: raLmTaskTexts(() => null) } : {};
  const r = raRun({ modelId: String(model), scenarioId: String(scenario), seeds: (seeds ?? []).map(Number), lmOptions });
  return { ok: true, result: { ...r, perSeed: r.perSeed.map((p) => ({ seed: p.seed, success: p.success, steps: p.steps, ruleBreaks: p.ruleBreaks, stopped: p.stopped })) } };
}

function stHandle(msg) {
  switch (msg.op) {
    case "hello": return { ok: true, version: ST_BRIDGE_VERSION, scenarios: raScenarios().filter((s) => s.kind === "gym").map((s) => s.id), physical: 0 };
    case "reset": return stReset(msg);
    case "step": return stStep(msg);
    case "summary": return stSummary();
    case "check": return stCheck(msg);
    case "js_run": return stJsRun(msg);
    case "bye": return { ok: true, network: stNetwork, bye: true };
    default: return { ok: false, error: `unknown op ${msg.op}` };
  }
}

const rl = createInterface({ input: process.stdin, terminal: false });
rl.on("line", (line) => {
  if (!line.trim()) return;
  let out;
  try { out = stHandle(JSON.parse(line)); } catch (e) { out = { ok: false, error: String(e?.message ?? e) }; }
  process.stdout.write(JSON.stringify(out) + "\n");
  if (out.bye) process.exit(0);
});
