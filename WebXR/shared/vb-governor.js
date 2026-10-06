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
//   vbGovernor({ ent3, limits, estops, at }) -> {
//     check(command)   -> { ok, decision: "allow-sim" | "refuse", reasons: [id], primary, text, line }
//     monitor(sample)  -> { action: "continue" | "slow" | "protective-stop" | "estop", reason, line? }
//     setEstop(siteId, held), estopHeld(siteId), log(), verify()
//   }
//   command = { jobId, clientId, taskType, siteId, target: { kind: "sim" | "physical", robotId, approver? },
//               speed (m/s), nearestPersonM (m), policyId }
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope).

import { RB_SITES, RB_SSM } from "./rb-robotics-data.js";

/** Every reason the governor can refuse, in precedence order (the first that applies is `primary`). */
export const VB_REASONS = Object.freeze([
  { id: "estop-held", text: "The site's e-stop is held. The e-stop always wins; nothing moves until a person resets it." },
  { id: "physical-target", text: "The command names a physical robot. Agent commands reach simulated robots only; a physical robot would need a named human approver, and that path is disabled in this build." },
  { id: "malformed", text: "The command is missing a field the governor needs (job, client, task, site, robot, speed, separation or policy)." },
  { id: "unknown-site", text: "No robot site with that id exists in the sim." },
  { id: "task-not-allowed", text: "That task type is not on the allowlist for this site's rig." },
  { id: "unregistered-policy", text: "The policy is not in the registry, so nobody can say what it was trained on." },
  { id: "stale-policy", text: "The policy is stale: it was trained on (or built from) data whose consent was revoked. Retrain before it runs." },
  { id: "over-speed", text: "The requested speed is above the site's limit (or above the reduced speed with a person inside the warning distance)." },
  { id: "inside-separation", text: "A person is closer than the site's minimum separation distance. The robot holds a protective stop." },
]);
export const VB_REASON_IDS = Object.freeze(VB_REASONS.map((r) => r.id));

/** The physical-robot path: needs a named human approver and ships disabled. Frozen; there is no setter. */
export const VB_PHYSICAL = Object.freeze({ enabled: false, requires: "a named human approver at the site, on top of every governor rule", note: "disabled in this build: agent commands reach simulated robots only" });

/** Task types an agent may request (the robot gym's game scenarios), and the rigs that do each. */
export const VB_TASKS = Object.freeze({
  "rb-amr-fleet-routing": { label: "Route warehouse robots to drop-offs", rigs: ["amr", "gantry"] },
  "rb-cobot-zone-setup": { label: "Set and test a cobot's safety zones", rigs: ["cobot"] },
  "rb-teleop-pick-place": { label: "Pick and place parts within force limits", rigs: ["cobot"] },
  "rb-cell-entry": { label: "Cell entry with lockout, verify and restart", rigs: ["cell"] },
});

/** Per-rig limits (procedural simulation parameters, not ratings of any machine). */
export const VB_RIG_LIMITS = Object.freeze({
  amr: { maxSpeed: 1.0, minSeparation: RB_SSM.stop, warn: RB_SSM.warn },
  gantry: { maxSpeed: 0.8, minSeparation: RB_SSM.stop, warn: RB_SSM.warn },
  cobot: { maxSpeed: 0.25, minSeparation: RB_SSM.stop, warn: RB_SSM.warn },
  cell: { maxSpeed: 0.5, minSeparation: RB_SSM.stop, warn: RB_SSM.warn },
});

/** The provider's own policy table, used when no ENTERPRISE-3 registry is handed in. */
export const VB_PROVIDER_POLICIES = Object.freeze([
  { id: "vb-scripted-expert", method: "scripted", status: "current" },
  { id: "vb-colearn-bc-knn", method: "behaviour-cloning-knn", status: "current" },
  { id: "vb-scripted-lapsing", method: "scripted", status: "current" },
]);

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

/** Build a governor. Deterministic: `at(seq)` gives each line's time (a logical clock by default). */
export function vbGovernor({ ent3 = null, limits = VB_RIG_LIMITS, estops = [], at = null } = {}) {
  const held = new Set(estops);
  const chain = [];
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
    const ordered = VB_REASON_IDS.filter((r) => reasons.has(r));
    const ok = ordered.length === 0;
    const decision = ok ? "allow-sim" : "refuse";
    const line = write(ok ? "vb-allow" : "vb-refuse", `${vbText(c.jobId, 40) || "?"} ${vbText(c.taskType, 40) || "?"} @ ${vbText(c.siteId, 60) || "?"} by ${vbText(c.clientId, 40) || "?"}: ${ok ? "allowed in the sim" : `refused (${ordered.join(", ")})`}`);
    return { ok, decision, reasons: ordered, primary: ordered[0] ?? null, text: ok ? "Allowed to run on the simulated robot, under supervision." : VB_REASONS.find((r) => r.id === ordered[0]).text, line };
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
  };
}
