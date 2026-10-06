// Training-data governance for organisations (console ENTERPRISE-3,
// docs/enterprise.md section 6, docs/consoles/ENTERPRISE-3.md): which consented
// learners' episodes went into which dataset, which dataset trained which robot
// policy or agent tutor, how each was evaluated, where each policy is deployed
// in the sim's robot sites, and an append-only audit log of every change.
//
// What this is, named plainly:
//   * a REGISTRY, not a training system. It records what other modules did
//     (DATAWORKS' consented episodes, ROBOTICS' rollouts, COLEARN's behaviour-
//     cloning policies and tutors) and never trains or runs anything itself;
//   * the consent registry keeps DATAWORKS' receipt METADATA only (consent id,
//     time, licence, statement hash, adult flag) — never a name, an e-mail, an
//     episode or anything that points back at a person. Adults only; a receipt
//     flagged K-12 is refused, as DATAWORKS refuses the collection itself;
//   * revoke is one tap: the consent is marked revoked, every dataset holding it
//     needs a rebuild without it, every policy trained on such a dataset — or
//     based on such a policy, transitively — is marked STALE, and every
//     deployment of a stale policy is flagged. When the revoked consent is this
//     device's own DATAWORKS consent, dxRevoke() deletes the local episodes too;
//   * the audit log is append-only: each line carries the FNV-1a hash of the
//     line before it, ent3VerifyAudit() re-walks the chain, and this module
//     exports no way to clear or edit it. A local tamper-evidence aid, not
//     cryptographic proof (FNV is not a secure hash);
//   * no network code. Everything lives in one store, `ent3-governance-v1`,
//     through profiles.js's gtStorage() (a profile key like vr-org-v1).
//
// SEAMS (code against these):
//   ent3RegisterConsent({ orgId, consentId, licence, at, statementHash, adult })   -> { ok, reason? }
//   ent3RegisterDataset({ id, orgId, name, source, episodes, steps, consentIds, licences, scenarios, worlds, generator? }) -> { ok }
//   ent3RegisterPolicy({ id, version, name, method, trainedOn: [datasetId], basedOn?: [policyId], kind? }) -> { ok }
//   ent3RecordEval(policyId, { suite, metric, value, n, seeds?, baseline?, measured, at? })  -> { ok }
//   ent3Deploy({ policyId, siteId })  -> { ok }   (siteId from RB_SITES)
//   ent3Revoke({ consentId } | { datasetId }, reason) -> { revokedConsents, datasetsAffected, policiesStale, deploymentsFlagged }
//   ent3Lineage() -> { nodes: [{ id, type, label, status }], edges: [{ from, to, kind }] }
//   ent3Fleet() -> one row per robot site: { siteId, name, parish, rig, deployment, evalScore, stale }
//   ent3AuditList(), ent3VerifyAudit() -> { ok, brokenAt }
//
// Every top-level name starts with `ent3`/`ENT3_` (the bundler shares one scope).

import { gtStorage } from "./profiles.js";
import { dxDatasetCard, dxConsent, dxRevoke, DX_LICENCES, DX_SCHEMA_ID, DX_SCHEMA_VERSION } from "./dx-data.js";
import { RB_SITES } from "./rb-robotics-data.js";

export const ENT3_KEY = "ent3-governance-v1";
export const ENT3_SCHEMA_VERSION = 1;

/** The training methods a registered policy may name — each for what it is. */
export const ENT3_METHODS = Object.freeze([
  { id: "scripted", label: "Scripted policy (hand-written rules, the demonstration expert)" },
  { id: "behaviour-cloning-knn", label: "Behaviour cloning — k-nearest-neighbour over demonstrations" },
  { id: "behaviour-cloning-mlp", label: "Behaviour cloning — a small multilayer perceptron" },
  { id: "bandit-tutor", label: "Agent tutor — a multi-armed bandit over hint styles" },
  { id: "heuristic-tutor", label: "Agent tutor — per-step error rates that re-order hints" },
  { id: "random-baseline", label: "Random baseline (uniform over legal actions)" },
]);
const ENT3_METHOD_IDS = new Set(ENT3_METHODS.map((m) => m.id));
const ENT3_PERSONAL = /^(name|learnerName|learner|crewTag|email|e-mail|freeText|text|voice|audio|image|lat|lng|lon|latitude|longitude|geo|address|wallet|accountId|userId|sessionHash|episodes|k12)$/i;

// ------------------------------------------------------------------ store

let ent3Storage = null;
/** Point the registry at a Storage-shaped object (tests); null returns to gtStorage(). */
export function ent3UseStorage(s) { ent3Storage = s ?? null; }
function ent3Store() { if (ent3Storage) return ent3Storage; try { return gtStorage(); } catch (_) { return null; } }

function ent3Text(v, max = 120) { return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max); }
function ent3Id(v) { const t = ent3Text(v, 80); return /^[A-Za-z0-9][A-Za-z0-9._:@-]*$/.test(t) ? t : null; }
function ent3Now() { return new Date().toISOString(); }

function ent3Empty() { return { v: ENT3_SCHEMA_VERSION, consents: [], datasets: [], policies: [], deployments: [], audit: [] }; }

function ent3Load() {
  try {
    const raw = JSON.parse(ent3Store()?.getItem(ENT3_KEY) || "null");
    if (!raw || raw.v !== ENT3_SCHEMA_VERSION) return ent3Empty();
    const arr = (k) => (Array.isArray(raw[k]) ? raw[k] : []);
    return { v: ENT3_SCHEMA_VERSION, consents: arr("consents"), datasets: arr("datasets"), policies: arr("policies"), deployments: arr("deployments"), audit: arr("audit") };
  } catch (_) { return ent3Empty(); }
}
function ent3Save(state) {
  try { ent3Store()?.setItem(ENT3_KEY, JSON.stringify(state)); } catch (_) { /* private mode */ }
  try { globalThis.dispatchEvent?.(new CustomEvent("ent3:change")); } catch (_) { /* headless */ }
}

// ------------------------------------------------------------------ audit (append-only, hash-chained)

function ent3Fnv(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, "0");
}
function ent3LineHash(line) { const body = `${line.seq}|${line.at}|${line.action}|${line.detail}|${line.prev}`; return ent3Fnv(body) + ent3Fnv(body.split("").reverse().join("")); }

function ent3Audit(state, action, detail, at = ent3Now()) {
  const last = state.audit[state.audit.length - 1];
  const line = { seq: state.audit.length, at, action, detail: ent3Text(detail, 240), prev: last ? last.hash : "genesis" };
  line.hash = ent3LineHash(line);
  state.audit.push(line);
  return line;
}

/** The audit log, oldest first (a copy). */
export function ent3AuditList() { return ent3Load().audit.map((a) => ({ ...a })); }

/**
 * Append one line to the audit log from another module (VBRIDGE's safety
 * governor writes every dispatch decision here). Append-only, like every other
 * line: there is still no way to clear or edit the chain. `action` is a short
 * id ("vb-allow", "vb-refuse", "vb-estop"); `detail` is plain text, no person.
 */
export function ent3AuditAppend(action, detail, { at = null } = {}) {
  const id = ent3Id(action);
  if (!id) return { ok: false, reason: "an audit line needs an action id" };
  const state = ent3Load();
  const line = ent3Audit(state, id, detail, at ?? ent3Now());
  ent3Save(state);
  return { ok: true, line: { ...line } };
}

/** Re-walk the chain: every line's hash, its back-link and its sequence. */
export function ent3VerifyAudit(list = null) {
  const audit = list ?? ent3Load().audit;
  let prev = "genesis";
  for (let i = 0; i < audit.length; i += 1) {
    const a = audit[i];
    if (a.seq !== i || a.prev !== prev || ent3LineHash(a) !== a.hash) return { ok: false, brokenAt: i, lines: audit.length };
    prev = a.hash;
  }
  return { ok: true, brokenAt: null, lines: audit.length };
}

// ------------------------------------------------------------------ consent registry

/** Register a DATAWORKS consent receipt's metadata for an organisation. */
export function ent3RegisterConsent(r = {}, { at = null } = {}) {
  const extra = Object.keys(r).filter((k) => ENT3_PERSONAL.test(k));
  if (extra.length) return { ok: false, reason: `a consent record carries no personal field (${extra.join(", ")})` };
  if (r.adult !== true) return { ok: false, reason: "adults only: DATAWORKS never collects without the learner's own 18+ confirmation" };
  if (!DX_LICENCES.includes(r.licence)) return { ok: false, reason: `licence must be one DATAWORKS offers: ${DX_LICENCES.join(" or ")}` };
  const orgId = ent3Id(r.orgId); const consentId = ent3Id(r.consentId);
  if (!orgId || !consentId) return { ok: false, reason: "orgId and consentId are required" };
  const state = ent3Load();
  if (state.consents.some((c) => c.consentId === consentId)) return { ok: false, reason: "that consent is already registered" };
  const rec = { orgId, consentId, licence: r.licence, at: ent3Text(r.at, 40) || ent3Now(), statementHash: ent3Text(r.statementHash, 64), adult: true, state: "active", revokedAt: null };
  state.consents.push(rec);
  ent3Audit(state, "consent-register", `${consentId} (${rec.licence}) for ${orgId}`, at ?? ent3Now());
  ent3Save(state);
  return { ok: true, consent: { ...rec } };
}

/** Register this device's own DATAWORKS consent (if any) for an organisation. */
export function ent3RegisterLocalConsent(orgId) {
  const c = (() => { try { return dxConsent(); } catch (_) { return null; } })();
  if (!c) return { ok: false, reason: "no DATAWORKS consent on this device" };
  return ent3RegisterConsent({ orgId, consentId: c.id, licence: c.licence, at: c.at, statementHash: c.statementHash, adult: c.adult === true });
}

export function ent3Consents(orgId = null) { return ent3Load().consents.filter((c) => !orgId || c.orgId === orgId).map((c) => ({ ...c })); }

// ------------------------------------------------------------------ datasets and cards

/** Register a dataset (a manifest: counts, the consents it holds, licences). */
export function ent3RegisterDataset(d = {}, { at = null } = {}) {
  const id = ent3Id(d.id);
  if (!id) return { ok: false, reason: "a dataset needs an id" };
  const state = ent3Load();
  if (state.datasets.some((x) => x.id === id)) return { ok: false, reason: "that dataset is already registered" };
  const consentIds = (Array.isArray(d.consentIds) ? d.consentIds : []).map(ent3Id).filter(Boolean);
  const unknown = consentIds.filter((c) => !state.consents.some((k) => k.consentId === c && k.state === "active"));
  if (unknown.length) return { ok: false, reason: `consents not registered or revoked: ${unknown.join(", ")}` };
  const source = ["human", "synthetic", "mixed"].includes(d.source) ? d.source : (consentIds.length ? "human" : "synthetic");
  if (source !== "synthetic" && !consentIds.length) return { ok: false, reason: "a human dataset must name the consents it holds" };
  const rec = {
    id, orgId: ent3Id(d.orgId), name: ent3Text(d.name, 100) || id, source,
    episodes: Math.max(0, Math.floor(Number(d.episodes) || 0)), steps: Math.max(0, Math.floor(Number(d.steps) || 0)),
    consentIds, licences: (d.licences ?? []).filter((l) => DX_LICENCES.includes(l)),
    scenarios: (d.scenarios ?? []).map((s) => ent3Text(s, 80)).slice(0, 40), worlds: (d.worlds ?? []).map((s) => ent3Text(s, 40)).slice(0, 20),
    generator: ent3Text(d.generator, 80) || null, status: "current", revokedConsents: [], createdAt: ent3Text(d.createdAt, 40) || (at ?? ent3Now()),
  };
  state.datasets.push(rec);
  ent3Audit(state, "dataset-register", `${id}: ${rec.episodes} episodes, ${consentIds.length} consents, ${source}`, at ?? ent3Now());
  ent3Save(state);
  return { ok: true, dataset: { ...rec } };
}

export function ent3Datasets() { return ent3Load().datasets.map((d) => ({ ...d })); }
export function ent3Dataset(id) { const d = ent3Load().datasets.find((x) => x.id === id); return d ? { ...d } : null; }

/** DATAWORKS' datasheet for a registered dataset, with its governance lines appended. */
export function ent3DatasetCard(id) {
  const state = ent3Load();
  const d = state.datasets.find((x) => x.id === id);
  if (!d) return null;
  const human = d.source === "synthetic" ? 0 : d.episodes;
  const card = dxDatasetCard({
    name: `${d.name} (${d.id})`, createdAt: d.createdAt, generator: d.generator ?? "shared/ent3-governance.js",
    schema: { id: DX_SCHEMA_ID, version: DX_SCHEMA_VERSION },
    counts: { episodes: d.episodes, human, synthetic: d.episodes - human, steps: d.steps, scenarios: d.scenarios.length, worlds: d.worlds },
    licences: d.licences, consentReceipts: d.consentIds.length, shards: [],
  });
  const used = state.policies.filter((p) => p.trainedOn.includes(d.id)).map((p) => `${p.id}@${p.version} (${p.status})`);
  return `${card}\n## Governance (ENTERPRISE-3 registry)\n\nDataset id ${d.id}; status ${d.status}; consents held ${d.consentIds.length}${d.revokedConsents.length ? `; revoked since registration ${d.revokedConsents.length} (rebuild without them before reuse)` : ""}. Trained: ${used.join(", ") || "no registered policy"}.\n`;
}

// ------------------------------------------------------------------ policies and evals

export function ent3RegisterPolicy(p = {}, { at = null } = {}) {
  const id = ent3Id(p.id);
  if (!id) return { ok: false, reason: "a policy needs an id" };
  if (!ENT3_METHOD_IDS.has(p.method)) return { ok: false, reason: `method must be one of ${[...ENT3_METHOD_IDS].join(", ")}` };
  const state = ent3Load();
  if (state.policies.some((x) => x.id === id)) return { ok: false, reason: "that policy is already registered" };
  const trainedOn = (p.trainedOn ?? []).map(ent3Id).filter(Boolean);
  const basedOn = (p.basedOn ?? []).map(ent3Id).filter(Boolean);
  if (!trainedOn.length && p.method !== "random-baseline" && p.method !== "scripted") return { ok: false, reason: "a learned policy must name the datasets it was trained on" };
  const missing = trainedOn.filter((d) => !state.datasets.some((x) => x.id === d)).concat(basedOn.filter((b) => !state.policies.some((x) => x.id === b)));
  if (missing.length) return { ok: false, reason: `unknown lineage: ${missing.join(", ")}` };
  const badDs = trainedOn.filter((d) => state.datasets.find((x) => x.id === d).status !== "current");
  const badBase = basedOn.filter((b) => state.policies.find((x) => x.id === b).status !== "current");
  if (badDs.length || badBase.length) return { ok: false, reason: `lineage is revoked or stale: ${[...badDs, ...badBase].join(", ")}` };
  const rec = { id, version: ent3Text(p.version, 20) || "1", name: ent3Text(p.name, 100) || id, method: p.method, kind: p.kind === "agent" ? "agent" : "robot", trainedOn, basedOn, evals: [], status: "current", staleReason: null, createdAt: at ?? ent3Now() };
  state.policies.push(rec);
  ent3Audit(state, "policy-register", `${id}@${rec.version} (${rec.method}) trained on ${trainedOn.join(", ") || "nothing"}${basedOn.length ? `, based on ${basedOn.join(", ")}` : ""}`, at ?? ent3Now());
  ent3Save(state);
  return { ok: true, policy: { ...rec } };
}

export function ent3Policies() { return ent3Load().policies.map((p) => ({ ...p, evals: p.evals.map((e) => ({ ...e })) })); }

/** Record an evaluation. `measured: false` marks illustrative sample figures, shown as such. */
export function ent3RecordEval(policyId, e = {}) {
  const state = ent3Load();
  const p = state.policies.find((x) => x.id === policyId);
  if (!p) return { ok: false, reason: "unknown policy" };
  const value = Number(e.value);
  if (!Number.isFinite(value)) return { ok: false, reason: "an eval needs a numeric value" };
  const rec = { suite: ent3Text(e.suite, 120), metric: ent3Text(e.metric, 60) || "score", value, n: Math.max(0, Math.floor(Number(e.n) || 0)), seeds: Array.isArray(e.seeds) ? e.seeds.slice(0, 50).map(Number) : [], baseline: e.baseline != null && Number.isFinite(Number(e.baseline)) ? Number(e.baseline) : null, measured: e.measured === true, at: ent3Text(e.at, 40) || ent3Now() };
  p.evals.push(rec);
  ent3Audit(state, "policy-eval", `${p.id}@${p.version}: ${rec.metric} ${rec.value} on ${rec.suite} (n=${rec.n}${rec.measured ? "" : ", sample figure"})`, rec.at);
  ent3Save(state);
  return { ok: true, eval: { ...rec } };
}

// ------------------------------------------------------------------ fleet / agent registry

export function ent3Deploy({ policyId, siteId } = {}, { at = null } = {}) {
  const site = RB_SITES.find((s) => s.id === siteId);
  if (!site) return { ok: false, reason: "unknown robot site" };
  const state = ent3Load();
  const p = state.policies.find((x) => x.id === policyId);
  if (!p) return { ok: false, reason: "unknown policy" };
  if (p.status !== "current") return { ok: false, reason: `policy ${p.id} is ${p.status}: retrain before deploying` };
  state.deployments = state.deployments.filter((d) => d.siteId !== siteId);
  state.deployments.push({ siteId, policyId: p.id, version: p.version, at: at ?? ent3Now() });
  ent3Audit(state, "deploy", `${p.id}@${p.version} -> ${siteId} (sim)`, at ?? ent3Now());
  ent3Save(state);
  return { ok: true };
}

/** One row per robot site in the sim: what is deployed, its latest eval, whether it is stale. */
export function ent3Fleet() {
  const state = ent3Load();
  return RB_SITES.map((s) => {
    const d = state.deployments.find((x) => x.siteId === s.id) ?? null;
    const p = d ? state.policies.find((x) => x.id === d.policyId) : null;
    const last = p?.evals?.length ? p.evals[p.evals.length - 1] : null;
    return { siteId: s.id, name: s.name, parish: s.parish, rig: s.rig, scenario: s.scenario, deployment: d ? { ...d, method: p?.method ?? null } : null, evalScore: last ? last.value : null, evalMeasured: last ? last.measured : null, stale: !!p && p.status !== "current" };
  });
}

// ------------------------------------------------------------------ lineage

export function ent3Lineage() {
  const state = ent3Load();
  const nodes = []; const edges = [];
  for (const c of state.consents) nodes.push({ id: `consent:${c.consentId}`, type: "consent", label: c.consentId, status: c.state });
  for (const d of state.datasets) {
    nodes.push({ id: d.id, type: "dataset", label: d.name, status: d.status });
    for (const c of d.consentIds) edges.push({ from: `consent:${c}`, to: d.id, kind: "consent-in" });
  }
  for (const p of state.policies) {
    nodes.push({ id: p.id, type: "policy", label: `${p.name} @${p.version}`, status: p.status });
    for (const d of p.trainedOn) edges.push({ from: d, to: p.id, kind: "trained-on" });
    for (const b of p.basedOn) edges.push({ from: b, to: p.id, kind: "based-on" });
    p.evals.forEach((e, i) => { const id = `eval:${p.id}:${i}`; nodes.push({ id, type: "eval", label: `${e.metric} ${e.value} — ${e.suite}`, status: e.measured ? "measured" : "sample" }); edges.push({ from: p.id, to: id, kind: "evaluated-by" }); });
  }
  for (const d of state.deployments) { const id = `site:${d.siteId}`; if (!nodes.some((n) => n.id === id)) nodes.push({ id, type: "site", label: d.siteId, status: "sim" }); edges.push({ from: d.policyId, to: id, kind: "deployed-to" }); }
  return { nodes, edges };
}

/** Flat rows for the console: dataset id -> policy id -> evals. */
export function ent3LineageRows() {
  const state = ent3Load(); const rows = [];
  for (const p of state.policies) for (const d of p.trainedOn) {
    const ds = state.datasets.find((x) => x.id === d);
    rows.push({ datasetId: d, datasetStatus: ds?.status ?? "missing", policyId: p.id, version: p.version, method: p.method, status: p.status, evals: p.evals.map((e) => ({ ...e })), sites: state.deployments.filter((x) => x.policyId === p.id).map((x) => x.siteId) });
  }
  return rows;
}

// ------------------------------------------------------------------ revoke

function ent3MarkStale(state, at) {
  const stale = [];
  let grew = true;
  while (grew) {
    grew = false;
    for (const p of state.policies) {
      if (p.status === "stale") continue;
      const ds = p.trainedOn.find((d) => state.datasets.find((x) => x.id === d)?.status !== "current");
      const base = p.basedOn.find((b) => state.policies.find((x) => x.id === b)?.status === "stale");
      if (ds || base) {
        p.status = "stale"; p.staleReason = ds ? `trained on ${ds}, which holds a revoked consent` : `based on ${base}, which is stale`;
        stale.push(p.id); grew = true;
        ent3Audit(state, "policy-stale", `${p.id}@${p.version}: ${p.staleReason}`, at);
      }
    }
  }
  return stale;
}

/**
 * One-tap revoke of a consent (or a whole dataset). Returns what changed.
 * A revoked consent is never reactivated; datasets that held it need a rebuild
 * (a new dataset id) and policies trained on them are stale until retrained.
 */
export function ent3Revoke(target = {}, reason = "", { at = null } = {}) {
  const when = at ?? ent3Now();
  const state = ent3Load();
  const out = { ok: true, revokedConsents: [], datasetsAffected: [], policiesStale: [], deploymentsFlagged: [], localDeleted: false };
  if (target.consentId) {
    const c = state.consents.find((x) => x.consentId === target.consentId);
    if (!c) return { ...out, ok: false, reason: "unknown consent" };
    if (c.state !== "revoked") { c.state = "revoked"; c.revokedAt = when; out.revokedConsents.push(c.consentId); ent3Audit(state, "consent-revoke", `${c.consentId}${reason ? `: ${reason}` : ""}`, when); }
    for (const d of state.datasets) if (d.consentIds.includes(c.consentId) && !d.revokedConsents.includes(c.consentId)) {
      d.revokedConsents.push(c.consentId); d.status = "needs-rebuild"; out.datasetsAffected.push(d.id);
      ent3Audit(state, "dataset-revoke", `${d.id} holds ${c.consentId}: rebuild without it`, when);
    }
    try { if (dxConsent()?.id === c.consentId) { dxRevoke(); out.localDeleted = true; } } catch (_) { /* no local consent */ }
  } else if (target.datasetId) {
    const d = state.datasets.find((x) => x.id === target.datasetId);
    if (!d) return { ...out, ok: false, reason: "unknown dataset" };
    if (d.status !== "withdrawn") { d.status = "withdrawn"; out.datasetsAffected.push(d.id); ent3Audit(state, "dataset-withdraw", `${d.id}${reason ? `: ${reason}` : ""}`, when); }
  } else return { ...out, ok: false, reason: "name a consentId or a datasetId" };
  out.policiesStale = ent3MarkStale(state, when);
  const stale = new Set(state.policies.filter((p) => p.status === "stale").map((p) => p.id));
  out.deploymentsFlagged = state.deployments.filter((d) => stale.has(d.policyId)).map((d) => d.siteId);
  if (out.deploymentsFlagged.length) ent3Audit(state, "deploy-flag", `stale policy deployed at ${out.deploymentsFlagged.join(", ")}`, when);
  ent3Save(state);
  return out;
}

// ------------------------------------------------------------------ sample

/**
 * A labelled sample for the console's empty state and the checker: one
 * organisation, three consent receipts (sample metadata, no person), a
 * synthetic rollout dataset, a consented human dataset, a behaviour-cloning
 * policy, a tutor and a fine-tune, two deployments. Eval figures here are
 * marked `measured: false` — the console shows them as sample figures.
 * Idempotent.
 */
export function ent3LoadSample({ at = null } = {}) {
  if (ent3Load().datasets.some((d) => d.id === "ds-sample-human-cell-entry")) return false;
  const t = at ?? ent3Now(); const o = { at: t };
  for (const [i, lic] of [["1", "CC0-1.0"], ["2", "CC-BY-4.0"], ["3", "CC0-1.0"]]) ent3RegisterConsent({ orgId: "org-sample", consentId: `sample-consent-${i}`, licence: lic, at: t, statementHash: `sample${i}`, adult: true }, o);
  ent3RegisterDataset({ id: "ds-sample-synthetic-rollouts", orgId: "org-sample", name: "Robot-game rollouts (synthetic, tools/rb_rollout.mjs)", source: "synthetic", episodes: 42, steps: 5856, consentIds: [], licences: ["CC0-1.0"], scenarios: ["rb-teleop-pick-place", "rb-amr-fleet-routing", "rb-cobot-zone-setup", "rb-cell-entry"], worlds: ["robotics"], generator: "tools/rb_rollout.mjs" }, o);
  ent3RegisterDataset({ id: "ds-sample-human-cell-entry", orgId: "org-sample", name: "Consented cell-entry episodes (sample)", source: "human", episodes: 18, steps: 1440, consentIds: ["sample-consent-1", "sample-consent-2", "sample-consent-3"], licences: ["CC0-1.0", "CC-BY-4.0"], scenarios: ["rb-cell-entry"], worlds: ["robotics", "smartcity"] }, o);
  ent3RegisterPolicy({ id: "pol-sample-bc-knn-cell", version: "1", name: "Cell entry — behaviour cloning (kNN)", method: "behaviour-cloning-knn", trainedOn: ["ds-sample-human-cell-entry", "ds-sample-synthetic-rollouts"] }, o);
  ent3RegisterPolicy({ id: "pol-sample-bc-knn-cell-ft", version: "2", name: "Cell entry — kNN, fine-tuned on new rollouts", method: "behaviour-cloning-knn", trainedOn: ["ds-sample-synthetic-rollouts"], basedOn: ["pol-sample-bc-knn-cell"] }, o);
  ent3RegisterPolicy({ id: "pol-sample-amr-scripted", version: "1", name: "AMR routing — scripted expert", method: "scripted", trainedOn: ["ds-sample-synthetic-rollouts"] }, o);
  ent3RegisterPolicy({ id: "tutor-sample-bandit", version: "1", name: "Hint tutor — bandit over hint styles", method: "bandit-tutor", kind: "agent", trainedOn: ["ds-sample-human-cell-entry"] }, o);
  ent3RecordEval("pol-sample-bc-knn-cell", { suite: "rb-cell-entry held-out seeds (sample)", metric: "success rate", value: 0.75, n: 8, baseline: 0, measured: false, at: t });
  ent3RecordEval("pol-sample-bc-knn-cell-ft", { suite: "rb-cell-entry held-out seeds (sample)", metric: "success rate", value: 0.875, n: 8, measured: false, at: t });
  ent3RecordEval("pol-sample-amr-scripted", { suite: "rb-amr-fleet-routing seeds (sample)", metric: "success rate", value: 1, n: 8, measured: false, at: t });
  ent3RecordEval("tutor-sample-bandit", { suite: "simulated learners (sample)", metric: "mean steps-to-pass", value: 6.5, n: 50, baseline: 7.25, measured: false, at: t });
  ent3Deploy({ policyId: "pol-sample-bc-knn-cell-ft", siteId: "rb-site-soma-robot-cell" }, o);
  ent3Deploy({ policyId: "pol-sample-amr-scripted", siteId: "rb-site-west-oakland-warehouse" }, o);
  const s = ent3Load(); ent3Audit(s, "sample-load", "sample governance registry (org-sample)", t); ent3Save(s);
  return true;
}
