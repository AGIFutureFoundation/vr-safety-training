// VBRIDGE — the safety governor every software-agent command passes before it
// can reach a robot (docs/virtuals-bridge.md, docs/consoles/VBRIDGE.md).
//
// The robot rule, as code:
//   * an agent-originated command can only reach a SIMULATED robot in this
//     build. A physical target is refused: commanding a physical robot would
//     need a named human approver, and that path ships disabled
//     (VB_PHYSICAL.enabled === false, and nothing in this module turns it on);
//   * the e-stop always wins: a held e-stop refuses every command at that site,
//     whatever else the command says, and stops a running job at once;
//   * only task types on the allowlist run, and only at a site whose rig does
//     that task;
//   * the site's speed and separation limits hold: inside the stop distance the
//     command is refused, inside the warning distance the speed must be the
//     reduced speed (RB_SSM, procedural values like the rest of the gym);
//   * a policy trained on revoked data is refused (ENTERPRISE-3's stale lineage:
//     ent3Revoke marks dependent policies stale), and so is a policy nobody
//     registered;
//   * GOVERNOR-2: a per-agent rate limit (a sliding window per clientId, the
//     default in VB_RATE_LIMIT) and a learned anomaly check (a one-sided
//     per-feature z-score against a history of accepted jobs, VB_ANOMALY) sit
//     beside the rules. Both come after every hard rule in the precedence
//     order: they add a refusal, never a permission, and never outrank the
//     e-stop or a hard rule. The anomaly refusal names the feature, its value,
//     the accepted mean and how many standard deviations away it sits;
//   * every decision — allow or refuse, and every stop during a run — is
//     written to an append-only, hash-chained log here AND, when ENTERPRISE-3's
//     registry is handed in, to its audit log (ent3AuditAppend).
//
// Guarded: this module imports no ENTERPRISE-3 code. The caller hands in
// `ent3: { auditAppend, policies, fleet }` (any of them may be missing); with
// none, the governor keeps its own chain and uses the provider's own policy
// table (VB_PROVIDER_POLICIES). No network code, no keys, no wallet, no chain.
//
// SEAM:
//   vbGovernor({ ent3, limits, estops, at, now, rate, anomaly }) -> {
//     check(command)   -> { ok, decision: "allow-sim" | "refuse", reasons: [id], primary, text, line,
//                           explain: { rate: { agent, count, perMinute, windowS } | null, anomaly: vbAnomalyScore(...) | null } }
//     monitor(sample)  -> { action: "continue" | "slow" | "protective-stop" | "estop", reason, line? }
//     setEstop(siteId, held), estopHeld(siteId), log(), verify()
//   }
//   command = { jobId, clientId, taskType, siteId, target: { kind: "sim" | "physical", robotId, approver? },
//               speed (m/s), nearestPersonM (m), policyId, payloadKg?, atMs? }
//   `now()` (ms) is the clock for the rate limit when a command has no atMs; `rate` = { perMinute, windowMs } overrides
//   VB_RATE_LIMIT; `anomaly` = { history } | { model } replaces the seeded procedural history.
//   vbAnomalyHistory(cfg) -> [{ taskType, payloadKg, speedFrac, nearestPersonM, cadenceS }]   (seeded, every row rule-legal)
//   vbAnomalyModel(history) -> { threshold, features, tasks: { [taskType]: { [featureId]: { mean, sd, n } } } }
//   vbAnomalyScore(model, taskType, features) -> { anomalous, top: { id, label, value, mean, sd, z } | null, z, text }
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope).

import { RB_SITES, RB_SSM } from "./rb-robotics-data.js";
import { VB_REASONS, VB_REASON_IDS, VB_PHYSICAL, VB_TASKS, VB_RIG_LIMITS, VB_PROVIDER_POLICIES, VB_RATE_LIMIT, VB_ANOMALY } from "./vb-shared-data.js";


const VB_FIELDS = ["jobId", "clientId", "taskType", "siteId", "policyId"];

function vbFnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
function vbLineHash(l) { const b = `${l.seq}|${l.at}|${l.action}|${l.detail}|${l.prev}`; return vbFnv(b) + vbFnv(b.split("").reverse().join("")); }
function vbText(v, max = 80) { return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max); }

/** The site's limits: its rig's, or null for an unknown site. */
export function vbSiteLimits(siteId, limits = VB_RIG_LIMITS) {
  const site = RB_SITES.find((s) => s.id === siteId);
  return site ? { site, ...limits[site.rig] } : null;
}

// ------------------------------------------------------------------ GOVERNOR-2: the anomaly check beside the rules

function vbMulberry(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function vbNum(v) { if (v === null || v === undefined || v === "") return undefined; const n = Number(v); return Number.isFinite(n) ? n : undefined; }
function vbFmt(n) { const a = Math.abs(n); return a >= 100 ? n.toFixed(0) : a >= 10 ? n.toFixed(1) : a >= 0.1 ? n.toFixed(2) : n.toFixed(3); }

/**
 * The seeded accepted-job history: a procedural stand-in for a site's log of jobs it accepted (VB_ANOMALY.history's
 * ranges). Every row is rule-legal: the person is outside the stop distance and the speed is a share of the limit
 * that applies (the reduced speed inside the warning distance). Deterministic for a seed.
 */
export function vbAnomalyHistory(cfg = VB_ANOMALY.history) {
  const rnd = vbMulberry(cfg.seed);
  const u = (r) => r[0] + rnd() * (r[1] - r[0]);
  const [c0, c1] = cfg.cadenceS;
  const rows = [];
  for (const [taskType, r] of Object.entries(cfg.tasks)) {
    for (let i = 0; i < cfg.perTask; i += 1) {
      rows.push({ taskType, payloadKg: +u(r.payloadKg).toFixed(3), speedFrac: +u(r.speedFrac).toFixed(4), nearestPersonM: +u(cfg.nearestPersonM).toFixed(3), cadenceS: +Math.exp(Math.log(c0) + rnd() * (Math.log(c1) - Math.log(c0))).toFixed(3) });
    }
  }
  return rows;
}

/** Fit the per-task, per-feature mean and standard deviation (log scale for `log` features). Plain JSON. */
export function vbAnomalyModel(history = vbAnomalyHistory(), cfg = VB_ANOMALY) {
  const byTask = {};
  for (const row of Array.isArray(history) ? history : []) { if (row && typeof row.taskType === "string") (byTask[row.taskType] = byTask[row.taskType] ?? []).push(row); }
  const model = { threshold: cfg.threshold, features: cfg.features.map((f) => ({ ...f })), tasks: {}, n: 0 };
  for (const [t, rows] of Object.entries(byTask)) {
    model.tasks[t] = {};
    model.n += rows.length;
    for (const f of cfg.features) {
      const xs = rows.map((r) => vbNum(r[f.id])).filter((x) => x !== undefined).map((x) => (f.log ? Math.log(Math.max(x, 0.001)) : x));
      if (xs.length < 2) continue;
      const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const sd = Math.max(cfg.minSd, Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (xs.length - 1)));
      model.tasks[t][f.id] = { mean: +mean.toFixed(6), sd: +sd.toFixed(6), n: xs.length };
    }
  }
  return model;
}

/**
 * Score one request's features against the model for its task. One-sided: only the risky direction counts
 * (a heavier payload, a faster request, a closer person, a quicker repeat). Explainable: `top` names the feature
 * furthest past the accepted mean, and `text` says it in a sentence. An unknown task or a missing feature is skipped.
 */
export function vbAnomalyScore(model, taskType, feats = {}) {
  const stats = model?.tasks?.[taskType];
  const z = {};
  let top = null;
  if (stats) {
    for (const f of model.features) {
      const v = vbNum(feats[f.id]); const st = stats[f.id];
      if (v === undefined || !st) continue;
      const x = f.log ? Math.log(Math.max(v, 0.001)) : v;
      const zz = (f.dir * (x - st.mean)) / st.sd;
      z[f.id] = +zz.toFixed(2);
      if (!top || zz > top.z) top = { id: f.id, label: f.label, value: v, mean: f.log ? Math.exp(st.mean) : st.mean, sd: st.sd, z: +zz.toFixed(2), dir: f.dir, log: f.log };
    }
  }
  const anomalous = !!top && top.z > model.threshold;
  const text = top ? `${top.label} ${vbFmt(top.value)} is ${vbFmt(Math.abs(top.z))} sd ${top.dir > 0 ? "above" : "below"} the accepted ${top.log ? "typical value" : "mean"} ${vbFmt(top.mean)} for ${taskType}${top.log ? " (log scale)" : ""}; the threshold is ${model.threshold} sd` : "no feature to compare";
  return { anomalous, top, z, text };
}

let vbDefaultModelCache = null;
function vbDefaultModel() { if (!vbDefaultModelCache) vbDefaultModelCache = vbAnomalyModel(); return vbDefaultModelCache; }

/** Build a governor. Deterministic: `at(seq)` gives each line's time (a logical clock by default). */
export function vbGovernor({ ent3 = null, limits = VB_RIG_LIMITS, estops = [], at = null, now = null, rate = null, anomaly = null } = {}) {
  const held = new Set(estops);
  const chain = [];
  const rateCfg = { ...VB_RATE_LIMIT, ...(rate && typeof rate === "object" ? rate : {}) };
  if (!(rateCfg.perMinute >= 1)) rateCfg.perMinute = VB_RATE_LIMIT.perMinute;
  if (!(rateCfg.windowMs >= 1)) rateCfg.windowMs = VB_RATE_LIMIT.windowMs;
  const model = anomaly?.model ?? (anomaly?.history ? vbAnomalyModel(anomaly.history) : vbDefaultModel());
  const perAgent = new Map();
  let decisions = 0;
  const clock = typeof at === "function" ? at : (seq) => `T+${String(seq).padStart(5, "0")}`;

  function write(action, detail) {
    const last = chain[chain.length - 1];
    const line = { seq: chain.length, at: clock(chain.length), action, detail: vbText(detail, 240), prev: last ? last.hash : "genesis" };
    line.hash = vbLineHash(line);
    chain.push(line);
    let ent3Line = null;
    try { ent3Line = ent3?.auditAppend?.(action, line.detail, { at: line.at })?.line ?? null; } catch (_) { ent3Line = null; }
    return { ...line, ent3: !!ent3Line };
  }

  function policyStatus(policyId, siteId) {
    let list = null;
    try { list = ent3?.policies?.() ?? null; } catch (_) { list = null; }
    const table = [...(Array.isArray(list) ? list : []), ...VB_PROVIDER_POLICIES.filter((p) => !(list ?? []).some((x) => x.id === p.id))];
    const p = table.find((x) => x.id === policyId);
    let fleetStale = false;
    try { fleetStale = !!(ent3?.fleet?.() ?? []).find((r) => r.siteId === siteId && r.deployment?.policyId === policyId && r.stale); } catch (_) { fleetStale = false; }
    if (!p) return "unregistered";
    return p.status !== "current" || fleetStale ? "stale" : "current";
  }

  function check(cmd = {}) {
    const reasons = new Set();
    const c = cmd && typeof cmd === "object" ? cmd : {};
    if (held.has(c.siteId)) reasons.add("estop-held");
    if (c.target && c.target.kind !== "sim") reasons.add("physical-target");
    const speed = Number(c.speed); const sep = Number(c.nearestPersonM);
    if (VB_FIELDS.some((f) => !vbText(c[f])) || !c.target || !vbText(c.target.robotId) || !Number.isFinite(speed) || speed < 0 || !Number.isFinite(sep) || sep < 0) reasons.add("malformed");
    const lim = vbSiteLimits(c.siteId, limits);
    if (!lim) reasons.add("unknown-site");
    if (lim) {
      const task = VB_TASKS[c.taskType];
      if (!task || !task.rigs.includes(lim.site.rig)) reasons.add("task-not-allowed");
      if (Number.isFinite(speed)) {
        const cap = Number.isFinite(sep) && sep < lim.warn ? lim.maxSpeed * RB_SSM.reducedSpeed : lim.maxSpeed;
        if (speed > cap + 1e-9) reasons.add("over-speed");
      }
      if (Number.isFinite(sep) && sep < lim.minSeparation) reasons.add("inside-separation");
    } else if (!VB_TASKS[c.taskType]) reasons.add("task-not-allowed");
    if (vbText(c.policyId)) { const st = policyStatus(c.policyId, c.siteId); if (st === "unregistered") reasons.add("unregistered-policy"); if (st === "stale") reasons.add("stale-policy"); }
    // GOVERNOR-2: the per-agent sliding window. Every new request counts, refused ones included. A repeat check of a
    // job id this agent already had admitted inside the window is a step of that job (a GAME session's function calls
    // share one job id), so it is not counted again and has no cadence.
    const atMs = vbNum(c.atMs);
    const t = atMs !== undefined ? atMs : (typeof now === "function" ? Number(now()) : decisions * rateCfg.logicalTickMs);
    decisions += 1;
    const agent = vbText(c.clientId, 40); const jobKey = vbText(c.jobId, 80);
    let rateInfo = null; let cadenceS;
    if (agent) {
      const past = perAgent.get(agent) ?? [];
      const inWindow = past.filter((x) => x.t > t - rateCfg.windowMs && x.t <= t);
      const step = !!jobKey && inWindow.some((x) => x.jobId === jobKey && x.admitted);
      if (!step) {
        if (past.length) cadenceS = Math.max(0, (t - past[past.length - 1].t) / 1000);
        const counted = inWindow.length;
        const entry = { t, jobId: jobKey, admitted: counted < rateCfg.perMinute };
        if (!entry.admitted) { reasons.add("rate-limited"); rateInfo = { agent, count: counted, perMinute: rateCfg.perMinute, windowS: rateCfg.windowMs / 1000 }; }
        inWindow.push(entry);
      }
      perAgent.set(agent, inWindow);
    }
    // GOVERNOR-2: the anomaly check, beside the rules (it only ever adds a reason).
    let anomalyInfo = null;
    if (lim && VB_TASKS[c.taskType]) {
      const cap = Number.isFinite(sep) && sep < lim.warn ? lim.maxSpeed * RB_SSM.reducedSpeed : lim.maxSpeed;
      anomalyInfo = vbAnomalyScore(model, c.taskType, { payloadKg: vbNum(c.payloadKg), speedFrac: Number.isFinite(speed) && cap > 0 ? speed / cap : undefined, nearestPersonM: Number.isFinite(sep) ? sep : undefined, cadenceS });
      if (anomalyInfo.anomalous) reasons.add("anomalous");
    }
    const ordered = VB_REASON_IDS.filter((r) => reasons.has(r));
    const ok = ordered.length === 0;
    const decision = ok ? "allow-sim" : "refuse";
    const why = [rateInfo ? `${rateInfo.count} requests in ${rateInfo.windowS} s, limit ${rateInfo.perMinute}/min` : "", anomalyInfo?.anomalous ? `${anomalyInfo.top.id} ${vbFmt(anomalyInfo.top.value)} at ${vbFmt(anomalyInfo.top.z)} sd` : ""].filter(Boolean).join("; ");
    const line = write(ok ? "vb-allow" : "vb-refuse", `${vbText(c.jobId, 40) || "?"} ${vbText(c.taskType, 40) || "?"} @ ${vbText(c.siteId, 60) || "?"} by ${agent || "?"}: ${ok ? "allowed in the sim" : `refused (${ordered.join(", ")})${why ? ` [${why}]` : ""}`}`);
    let text = ok ? "Allowed to run on the simulated robot, under supervision." : VB_REASONS.find((r) => r.id === ordered[0]).text;
    if (ordered[0] === "rate-limited") text += ` (${rateInfo.agent}: ${rateInfo.count} requests in the last ${rateInfo.windowS} s; the limit is ${rateInfo.perMinute} per minute.)`;
    if (ordered[0] === "anomalous") text += ` Why: ${anomalyInfo.text}.`;
    return { ok, decision, reasons: ordered, primary: ordered[0] ?? null, text, line, explain: { rate: rateInfo, anomaly: anomalyInfo } };
  }

  /** One sample during a run: the e-stop wins, then separation, then speed. */
  function monitor(s = {}) {
    const lim = vbSiteLimits(s.siteId, limits);
    if (held.has(s.siteId) || s.estop) return { action: "estop", reason: "estop-held", line: write("vb-estop", `${vbText(s.jobId, 40)} @ ${vbText(s.siteId, 60)}: e-stop, run halted`) };
    if (!lim) return { action: "protective-stop", reason: "unknown-site", line: write("vb-stop", `${vbText(s.jobId, 40)}: unknown site, run halted`) };
    const sep = Number(s.nearestPersonM); const speed = Number(s.speed);
    if (Number.isFinite(sep) && sep < lim.minSeparation) return { action: "protective-stop", reason: "inside-separation", line: write("vb-stop", `${vbText(s.jobId, 40)} @ ${lim.site.id}: person inside ${lim.minSeparation} m, protective stop`) };
    if (s.deviation) return { action: "protective-stop", reason: vbText(s.deviation, 40), line: write("vb-stop", `${vbText(s.jobId, 40)} @ ${lim.site.id}: deviation (${vbText(s.deviation, 40)}), protective stop`) };
    if (Number.isFinite(speed) && Number.isFinite(sep) && sep < lim.warn && speed > lim.maxSpeed * RB_SSM.reducedSpeed + 1e-9) return { action: "slow", reason: "over-speed" };
    return { action: "continue", reason: null };
  }

  return {
    check,
    monitor,
    setEstop(siteId, on = true) { if (on) held.add(siteId); else held.delete(siteId); write(on ? "vb-estop-press" : "vb-estop-reset", `${vbText(siteId, 60)}: e-stop ${on ? "pressed" : "reset by a person"}`); },
    estopHeld(siteId) { return held.has(siteId); },
    log() { return chain.map((l) => ({ ...l })); },
    verify() {
      let prev = "genesis";
      for (let i = 0; i < chain.length; i += 1) { const l = chain[i]; if (l.seq !== i || l.prev !== prev || vbLineHash(l) !== l.hash) return { ok: false, brokenAt: i, lines: chain.length }; prev = l.hash; }
      return { ok: true, brokenAt: null, lines: chain.length };
    },
    physical: VB_PHYSICAL,
    rateLimit: { perMinute: rateCfg.perMinute, windowMs: rateCfg.windowMs },
    anomalyModel: model,
  };
}
