// VBRIDGE — where agent jobs come from, OFF BY DEFAULT (docs/virtuals-bridge.md).
//
// Follows ENTERPRISE-3's billing-adapter pattern (docs/billing-adapters.md):
//   * nothing that could reach a chain, an RPC node or an agent network ships.
//     vbProviderConfig(authConfig) returns null for the public build (its
//     auth-config.json has no `agents` block), and a provider made from null
//     answers every call with { ok: false, off: true } before touching anything;
//   * `mock`: in memory, deterministic, for tests and the station — it hands out
//     seeded client jobs and records deliverables. No network;
//   * `acp-proxy`: a DESCRIPTOR only. The deployment's own https server (never a
//     vendor, RPC or chain host) would hold the ACP SDK, the agent's wallet and
//     its keys SERVER-SIDE; the browser only builds plain request descriptors
//     { provider, resource, action, body } and hands them to a `transport`
//     function the deployment passes in. This module has no fetch, no XHR, no
//     socket, no signing and no wallet code;
//   * no key ships: a block with a field named like a key, secret, seed, mnemonic,
//     wallet, private or session entity, or a value shaped like a key or a
//     wallet address, is refused whole;
//   * descriptors never carry a physical target, a price, an amount or a fee;
//     a job's target is always `sim`. The build holds no token and makes no payments.
//   * GAME function descriptors (vbGameFunctions) describe each Holodeck robot
//     action as a GAME-style function, so a GAME worker on the deployment's
//     server could call the sim; vbGameExecute runs one through the governor.
//
// Every top-level name starts with `vb`/`VB_` (the bundler shares one scope).

import { RB_SCENARIOS, RB_SITES } from "./rb-robotics-data.js";
import { rbEnv } from "./rb-env.js";
import { VB_TASKS } from "./vb-shared-data.js";

export const VB_PROVIDER_KINDS = Object.freeze(["mock", "acp-proxy"]);
const VB_SECRET_FIELD = /(key|secret|token|password|passwd|credential|bearer|auth|seed|mnemonic|wallet|private|signer|session.?entity)/i;
const VB_SECRET_VALUE = /^0x[0-9a-fA-F]{40}$|^0x[0-9a-fA-F]{64}$|^(sk|rk|pk|live|test)_[A-Za-z0-9]{8,}|^[A-Za-z0-9+/_-]{40,}={0,2}$|^(\w+\s){11,23}\w+$/;
const VB_VENDOR_HOST = /(^|\.)(virtuals\.io|base\.org|alchemy\.com|infura\.io|alchemyapi\.io|quiknode\.pro|ankr\.com)$/i;
const VB_MONEY = /(price|amount|fee|budget|payment|token|usdc|\$virtual)/i;

function vbPText(v, max = 120) { return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max); }

/** Clean one `agents` block; null when absent, unknown, or carrying anything secret. */
export function vbCleanAgents(block) {
  if (!block || typeof block !== "object" || Array.isArray(block)) return null;
  for (const [k, v] of Object.entries(block)) {
    if (VB_SECRET_FIELD.test(k)) return null;
    if (typeof v === "string" && k !== "proxyEndpoint" && VB_SECRET_VALUE.test(v.trim())) return null;
    if (typeof v === "string" && VB_MONEY.test(v) && k !== "proxyEndpoint") return null;
    if (VB_MONEY.test(k)) return null;
  }
  const provider = VB_PROVIDER_KINDS.includes(block.provider) ? block.provider : null;
  if (!provider) return null;
  if (provider === "mock") return { provider };
  let url;
  try { url = new URL(String(block.proxyEndpoint ?? "")); } catch (_) { return null; }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return null;
  if (VB_VENDOR_HOST.test(url.hostname)) return null;
  return { provider, proxyEndpoint: url.href, agentRef: vbPText(block.agentRef, 60) || null };
}

/** The deployment's agents config, or null (the public build). */
export function vbProviderConfig(authConfig) { return vbCleanAgents(authConfig?.agents ?? null); }

/** A seeded mock client job spec (what an external agent might ask for). */
export function vbMockJobSpec(seed = 1) {
  const site = RB_SITES[seed % RB_SITES.length];
  const task = Object.keys(VB_TASKS).find((t) => VB_TASKS[t].rigs.includes(site.rig));
  return { seed, client: { id: `client-mock-${(seed % 3) + 1}`, name: `Mock client agent ${(seed % 3) + 1}` }, request: { taskType: task, siteId: site.id, target: { kind: "sim" }, speed: 0.2, nearestPersonM: 8, policyId: "vb-scripted-expert", note: "mock request" } };
}

/** A provider. `transport(endpoint, descriptor)` is required for acp-proxy and never defaulted. */
export function vbProvider(config, { transport = null } = {}) {
  const off = { ok: false, off: true };
  if (!config) return { describe: () => ({ provider: null, enabled: false, note: "off: no agents block in this deployment's config" }), nextJob: async () => off, deliver: async () => off, history: () => [] };
  if (config.provider === "mock") {
    let n = 0; const delivered = [];
    return {
      describe: () => ({ provider: "mock", enabled: true, network: false }),
      nextJob: async () => ({ ok: true, spec: vbMockJobSpec(++n) }),
      deliver: async (job) => { delivered.push({ id: job.id, phase: job.phase, hash: job.deliverable?.hash ?? null }); return { ok: true }; },
      history: () => delivered.slice(),
    };
  }
  if (typeof transport !== "function") return { describe: () => ({ provider: config.provider, enabled: false, note: "refused: no transport handed in" }), nextJob: async () => ({ ok: false, reason: "no transport" }), deliver: async () => ({ ok: false, reason: "no transport" }), history: () => [] };
  const send = (resource, action, body) => transport(config.proxyEndpoint, { provider: "acp-proxy", resource, action, body: { ...body, agentRef: config.agentRef } });
  return {
    describe: () => ({ provider: "acp-proxy", enabled: true, proxy: config.proxyEndpoint, keys: "held by the deployment's server, never here" }),
    async nextJob() { const r = await send("job", "poll-request", {}); return r && r.spec ? { ok: true, spec: { ...r.spec, request: { ...r.spec.request, target: { kind: "sim" } } } } : { ok: false, reason: "no job" }; },
    async deliver(job) { return send("job", "deliver", { jobId: job.id, phase: job.phase, deliverableHash: job.deliverable?.hash ?? null, evalCard: job.deliverable?.evalCard ?? null }); },
    history: () => [],
  };
}

// ------------------------------------------------------------------ GAME function descriptors

const VB_ARG_TYPES = { d: "number", dx: "number", dy: "number", dz: "number", force: "number", moves: "array", param: "string", value: "number", what: "string" };

/** Each robot action of each allowlisted scenario as a GAME-style function: fn_name, fn_description, args, hint, and the result shape. */
export function vbGameFunctions() {
  const workers = [];
  for (const sc of RB_SCENARIOS.filter((s) => VB_TASKS[s.id])) {
    const fns = (sc.actions ?? []).map((a) => {
      const name = a.split(" ")[0];
      const argStr = (a.match(/\{([^}]*)\}/) ?? [null, ""])[1];
      const args = argStr ? argStr.split(",").map((x) => x.split(":")[0].trim()).filter(Boolean).map((n) => ({ name: n, description: `${n} for ${name}${a.includes("(") ? ` ${a.slice(a.indexOf("("))}` : ""}`, type: VB_ARG_TYPES[n] ?? "string", optional: false })) : [];
      return { fn_name: `${sc.id.replace(/^rb-/, "").replace(/-/g, "_")}__${name.replace(/-/g, "_")}`, fn_description: `${sc.name}: ${a} — on the SIMULATED robot only, through the safety governor.`, args, hint: "Returns done or failed with feedback; a governor refusal or an e-stop returns failed.", result: { action_status: ["done", "failed"], feedback_message: "string" } };
    });
    workers.push({ id: `vb-worker-${sc.id}`, name: `${sc.name} (sim)`, description: `${sc.blurb} Simulated robot only; every call passes the Holodeck safety governor.`, sites: RB_SITES.filter((s) => VB_TASKS[sc.id].rigs.includes(s.rig)).map((s) => s.id), functions: fns });
  }
  return { schema: "smartcitix.holodeck.vb-game-functions@1", shape: "GAME agent -> worker -> function (modelled on game-node src/function.ts and worker.ts; not the SDK)", simulatedOnly: true, network: false, workers };
}

/**
 * Run one GAME-style function call on the sim, through the governor. `session`
 * = { governor, env?, job: { id, clientId, siteId, speed, nearestPersonM, policyId } }.
 * Returns the SDK's result shape: { action_status: "done" | "failed", feedback_message }.
 */
export function vbGameExecute(fnName, args = {}, session) {
  const [scKey, act] = String(fnName).split("__");
  const scId = `rb-${String(scKey ?? "").replace(/_/g, "-")}`;
  const j = session.job;
  const d = session.governor.check({ jobId: j.id, clientId: j.clientId, taskType: scId, siteId: j.siteId, target: { kind: j.targetKind ?? "sim", robotId: `${j.siteId}:robot` }, speed: j.speed, nearestPersonM: j.nearestPersonM, policyId: j.policyId });
  if (!d.ok) return { action_status: "failed", feedback_message: `Refused by the safety governor: ${d.reasons.join(", ")}` };
  if (!session.env || session.env.id !== scId) session.env = rbEnv(scId, { seed: j.seed ?? 1 });
  const action = { type: String(act ?? "wait").replace(/_/g, "-"), ...args };
  const r = session.env.step(action);
  const m = session.governor.monitor({ jobId: j.id, siteId: j.siteId, speed: j.speed, nearestPersonM: j.nearestPersonM, deviation: (r.info.violations ?? [])[0] ? `rule ${r.info.violations[0]}` : null });
  if (m.action === "estop" || m.action === "protective-stop") return { action_status: "failed", feedback_message: `Stopped: ${m.action} (${m.reason})` };
  return { action_status: "done", feedback_message: String(r.info.feedback ?? "ok") + (r.done ? " (episode done)" : "") };
}
