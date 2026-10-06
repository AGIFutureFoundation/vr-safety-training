// VBRIDGE — an agent-commerce-shaped job model over the Holodeck's robot gym
// (docs/virtuals-bridge.md, docs/consoles/VBRIDGE.md).
//
// SmartCiti.X's plan is to let software agents that run on-chain coordinate the
// Holodeck's robots. This module is the seam for that, modelled — in our own
// small code — on the concepts in Virtuals Protocol's open-source Agent
// Commerce Protocol SDK (github.com/Virtual-Protocol/acp-node, ISC licence;
// acp-python) and GAME framework (github.com/game-by-virtuals/game-node and
// game-python, MIT). Nothing from those SDKs is installed, bundled or called.
// It is not a partnership and implies no endorsement by anyone.
//
// What it is, named plainly:
//   * a JOB is plain JSON that moves through the ACP job phases, one to one:
//     REQUEST(0) -> NEGOTIATION(1) -> TRANSACTION(2) -> EVALUATION(3) ->
//     COMPLETED(4) | REJECTED(5) | EXPIRED(6) (the numbers are the SDK's enum);
//   * three ROLES: the CLIENT (an external software agent; mocked here), the
//     PROVIDER (a SmartCiti.X robot-site agent that runs a policy in the SIM —
//     the scripted expert or a COLEARN behaviour-cloning policy), and the
//     EVALUATOR (the scenario's own safe-practice scoring, rb-env summary());
//   * MEMOS are the job's messages, one per phase change, each from a role;
//   * the DELIVERABLE is an RLDS/LeRobot-style episode plus an eval card;
//   * TRANSACTION here is the work phase only. No funds, fees, tokens or
//     payments exist in this build: it holds no token and makes no payments;
//   * every command passes vb-governor.js first, and again on every step of the
//     run (the e-stop wins; a deviation stops the robot). Simulated robots only.
//   * deterministic under a seed: ids are hashes, times are a logical clock.
//
// SEAM:
//   vbCreateJob({ seed, client, request })        -> job (phase REQUEST)
//   vbNegotiate(job, governor)                    -> job (NEGOTIATION, or REJECTED with the governor's reasons)
//   vbApprove(job, { supervisor, approve })       -> job (TRANSACTION, or REJECTED "refused by the supervisor")
//   vbRun(job, governor, { estopAtStep, policyFor }) -> job (EVALUATION, with the deliverable)
//   vbEvaluate(job)                               -> job (COMPLETED or REJECTED)
//   vbExpire(job, tick)                           -> job (EXPIRED when past its deadline and not terminal)
//   vbRunJob(spec, governor, opts)                -> the whole lifecycle in one call
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope).

import { rbEnv, rbPolicy } from "./rb-env.js";
import { RB_SITES } from "./rb-robotics-data.js";
import { VB_TASKS, VB_SCHEMA, VB_PHASES, VB_TERMINAL, VB_MOVES, VB_DEADLINE_TICKS } from "./vb-shared-data.js";


function vbHash(v) {
  const s = JSON.stringify(v);
  let a = 0x811c9dc5, b = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { a ^= s.charCodeAt(i); a = Math.imul(a, 0x01000193) >>> 0; b ^= s.charCodeAt(s.length - 1 - i); b = Math.imul(b, 0x01000193) >>> 0; }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}
const vbR3 = (n) => Math.round(n * 1000) / 1000;

function vbMove(job, to, from, type, content) {
  const allowed = VB_MOVES[job.phase] ?? [];
  if (!allowed.includes(to)) throw new Error(`vb: ${job.phase} -> ${to} is not a legal phase move`);
  job.tick += 1;
  job.phase = to;
  job.phaseId = VB_PHASES.indexOf(to);
  job.memos.push({ seq: job.memos.length, tick: job.tick, phase: to, from, type, content });
  return job;
}

/** A new job in REQUEST. `request` = { taskType, siteId, robotId, target, speed, nearestPersonM, policyId, note }. */
export function vbCreateJob({ seed = 1, client = { id: "client-mock-1", name: "Mock client agent" }, request = {} } = {}) {
  const site = RB_SITES.find((s) => s.id === request.siteId) ?? null;
  const req = {
    taskType: String(request.taskType ?? ""), siteId: String(request.siteId ?? ""),
    target: { kind: request.target?.kind ?? "sim", robotId: String(request.target?.robotId ?? (site ? `${site.id}:${site.rig}` : "")), ...(request.target?.approver ? { approver: String(request.target.approver) } : {}) },
    speed: Number(request.speed ?? 0), nearestPersonM: Number(request.nearestPersonM ?? 10),
    policyId: String(request.policyId ?? "vb-scripted-expert"), note: String(request.note ?? "").slice(0, 160),
  };
  const id = `vbjob-${vbHash({ seed, client: client.id, req })}`;
  const job = { schema: VB_SCHEMA, id, seed: seed >>> 0, tick: 0, phase: "REQUEST", phaseId: 0, client: { id: String(client.id), name: String(client.name ?? client.id) }, provider: { id: site ? `provider-${site.id}` : "provider-unknown", policyId: req.policyId }, evaluator: { id: "evaluator-scenario-scoring" }, request: req, governor: null, approval: null, deliverable: null, evaluation: null, memos: [] };
  job.memos.push({ seq: 0, tick: 0, phase: "REQUEST", from: "client", type: "MESSAGE", content: { ask: VB_TASKS[req.taskType]?.label ?? req.taskType, siteId: req.siteId, note: req.note } });
  return job;
}

/** The governor's command for a job. */
export function vbCommand(job) {
  return { jobId: job.id, clientId: job.client.id, taskType: job.request.taskType, siteId: job.request.siteId, target: job.request.target, speed: job.request.speed, nearestPersonM: job.request.nearestPersonM, policyId: job.request.policyId };
}

/** NEGOTIATION: the provider checks the job with the governor and states its terms, or the job is REJECTED. */
export function vbNegotiate(job, governor) {
  const d = governor.check(vbCommand(job));
  job.governor = { decision: d.decision, reasons: d.reasons, primary: d.primary, auditSeq: d.line?.seq ?? null };
  if (!d.ok) return vbMove(job, "REJECTED", "provider", "NOTIFICATION", { refusedBy: "safety governor", reasons: d.reasons, text: d.text });
  return vbMove(job, "NEGOTIATION", "provider", "MESSAGE", { terms: ["runs on the simulated robot only", "a human supervisor approves before it starts", "the e-stop wins at any moment", "every decision is logged"], policyId: job.request.policyId });
}

/** The human supervisor's decision moves NEGOTIATION to TRANSACTION (the work phase), or REJECTED. */
export function vbApprove(job, { supervisor = "", approve = true } = {}) {
  const who = String(supervisor ?? "").trim().slice(0, 60);
  if (!who) throw new Error("vb: a supervisor must be named to approve or refuse");
  job.approval = { supervisor: who, approve: !!approve, tick: job.tick + 1 };
  if (!approve) return vbMove(job, "REJECTED", "provider", "NOTIFICATION", { refusedBy: "human supervisor", supervisor: who });
  return vbMove(job, "TRANSACTION", "provider", "NOTIFICATION", { approvedBy: who, startsOn: "simulated robot" });
}

function vbDefaultPolicy(env, policyId, seed) {
  if (policyId === "vb-scripted-lapsing") return rbPolicy(env, { skill: 0.5, seed });
  return rbPolicy(env, { skill: 1, seed });
}

/**
 * TRANSACTION -> EVALUATION: the provider runs the policy on the sim. The governor
 * monitors every step; the supervisor's e-stop (`estopAtStep`) or a deviation
 * (a broken safe-practice rule) halts the run. `policyFor(policyId, env, seed)`
 * may return a COLEARN policy; otherwise the scripted policies run.
 */
export function vbRun(job, governor, { estopAtStep = null, policyFor = null } = {}) {
  if (job.phase !== "TRANSACTION") throw new Error(`vb: run needs TRANSACTION, not ${job.phase}`);
  const env = rbEnv(job.request.taskType, { seed: job.seed });
  let obs = env.reset(job.seed);
  const pol = (policyFor && policyFor(job.request.policyId, env, job.seed)) || vbDefaultPolicy(env, job.request.policyId, job.seed);
  const steps = []; let halted = null;
  for (let i = 0; i <= env.scenario.maxSteps; i += 1) {
    const action = pol(obs);
    const r = env.step(action);
    const dev = (r.info.violations ?? [])[0] ?? null;
    const m = governor.monitor({ jobId: job.id, siteId: job.request.siteId, speed: job.request.speed, nearestPersonM: job.request.nearestPersonM, estop: estopAtStep != null && i >= estopAtStep, deviation: dev ? `rule ${dev}` : null });
    steps.push({ observation: obs, action, reward: r.reward, is_first: i === 0, is_last: r.done || m.action === "estop" || m.action === "protective-stop", is_terminal: r.done, info: { t: r.info.t, violations: r.info.violations ?? [], governor: m.action } });
    obs = r.observation;
    if (m.action === "estop" || m.action === "protective-stop") { halted = { at: i, action: m.action, reason: m.reason }; break; }
    if (r.done) break;
  }
  const s = env.summary();
  const passed = !halted && !!s.passed;
  const episode = {
    format: "rlds-lerobot-style", episode_id: `${job.id}-ep`, scenario: job.request.taskType, seed: job.seed, source: "synthetic",
    episode_metadata: { site: job.request.siteId, robot: job.request.target.robotId, policy: job.request.policyId, simulated: true, consent: null },
    steps,
  };
  const evalCard = {
    scenario: job.request.taskType, policy: job.request.policyId, seed: job.seed, steps: steps.length,
    finished: !!s.finished && !halted, passed, score: vbR3(s.score ?? 0), violations: (s.violationRules ?? []).slice(), halted,
    evaluator: "scenario safe-practice scoring (rb-env summary)", measured: true, simulated: true,
  };
  job.deliverable = { episode, evalCard, hash: vbHash({ steps: steps.map((x) => [x.action, x.reward]), evalCard }) };
  return vbMove(job, "EVALUATION", "provider", "OBJECT", { deliverable: { episodeId: episode.episode_id, steps: steps.length, hash: job.deliverable.hash }, evalCard });
}

/** EVALUATION -> COMPLETED when the run passed with no stop; REJECTED otherwise. `note` is the supervisor's filed evaluation. */
export function vbEvaluate(job, { note = "" } = {}) {
  if (job.phase !== "EVALUATION") throw new Error(`vb: evaluate needs EVALUATION, not ${job.phase}`);
  const c = job.deliverable.evalCard;
  const ok = c.passed && !c.halted;
  job.evaluation = { accepted: ok, by: "evaluator", reason: ok ? "finished with every safe practice kept" : c.halted ? `halted: ${c.halted.action} (${c.halted.reason})` : `not passed (${c.violations.join(", ") || "unfinished"})`, note: String(note).slice(0, 200) };
  return vbMove(job, ok ? "COMPLETED" : "REJECTED", "evaluator", "MESSAGE", job.evaluation);
}

/** EXPIRED when a non-terminal job has sat past its deadline. */
export function vbExpire(job, tick) {
  if (VB_TERMINAL.includes(job.phase) || job.phase === "EVALUATION") return job;
  if (tick - job.tick < VB_DEADLINE_TICKS) return job;
  return vbMove(job, "EXPIRED", "provider", "NOTIFICATION", { reason: `no progress for ${VB_DEADLINE_TICKS} ticks` });
}

/** The whole lifecycle: create, negotiate, approve (named supervisor), run, evaluate. */
export function vbRunJob(spec, governor, { supervisor = "Supervisor (sim)", approve = true, estopAtStep = null, policyFor = null } = {}) {
  const job = vbCreateJob(spec);
  vbNegotiate(job, governor);
  if (job.phase !== "NEGOTIATION") return job;
  vbApprove(job, { supervisor, approve });
  if (job.phase !== "TRANSACTION") return job;
  vbRun(job, governor, { estopAtStep, policyFor });
  return vbEvaluate(job);
}

/** A compact view for panels and the shared export (no steps). */
export function vbJobSummary(job) {
  return { id: job.id, phase: job.phase, phaseId: job.phaseId, client: job.client.id, task: job.request.taskType, site: job.request.siteId, policy: job.request.policyId, governor: job.governor, approval: job.approval, evalCard: job.deliverable?.evalCard ?? null, memos: job.memos.length };
}
