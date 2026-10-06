#!/usr/bin/env node
/**
 * ENTERPRISE-3's gate (docs/consoles/ENTERPRISE-3.md, docs/billing-adapters.md):
 * the training-data governance layer, the robot fleet / agent registry and the
 * off-by-default billing adapters.
 *
 *     node tools/check_enterprise3.mjs
 *
 * Every check is independent (a missing module fails its own checks, not the
 * run), so the same script measures the before and the after:
 *
 *   1. the consent registry keeps receipt metadata only (no personal key, adults only);
 *   2. every dataset card carries every DATAWORKS datasheet section;
 *   3. lineage runs dataset id -> policy id -> eval;
 *   4. the audit log is append-only and hash-chained (tampering is detected);
 *   5. one-tap revoke marks every dependent policy stale (transitively) and flags
 *      its deployments — exact on 200 seeded random lineage graphs;
 *   6. the fleet covers every robot site; deploy refuses a stale policy or an
 *      unknown site; evals recorded from real rb-env rollouts;
 *   7. billing is off by default: no provider, no transport call, no fetch;
 *   8. a config carrying a secret, a vendor host or plain http is refused;
 *   9. the mock provider is deterministic; Chargebee and PayPal map to request
 *      descriptors sent only through the transport a deployment hands in;
 *  10. Crew Credits never touch billing; no price in the public build;
 *  11. no network API in any ent3 file; the console view sets no markup from strings;
 *  12. the Data governance tab is in the console and the bundle;
 *  13. no model identifier in any ent3 file.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : "");
let passed = 0; let failed = 0;
const check = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`); }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

// Any network reach during the run is recorded and fails check 7.
const net = [];
globalThis.fetch = async (u) => { net.push(String(u)); return { ok: false, json: async () => ({}) }; };

const memStorage = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m }; };

let gov = null; let bill = null; let rbEnvMod = null; let rbData = null; let dx = null;
try { gov = await import("../WebXR/shared/ent3-governance.js"); } catch (e) { console.log(`  (ent3-governance.js not loadable: ${e.message.split("\n")[0]})`); }
try { bill = await import("../WebXR/shared/ent3-billing.js"); } catch (e) { console.log(`  (ent3-billing.js not loadable: ${e.message.split("\n")[0]})`); }
try { rbEnvMod = await import("../WebXR/shared/rb-env.js"); rbData = await import("../WebXR/shared/rb-robotics-data.js"); } catch (_) { /* robotics absent */ }
try { dx = await import("../WebXR/shared/dx-data.js"); } catch (_) { /* dataworks absent */ }
const need = (m, n) => { assert(m, `${n} is missing`); return m; };

const fresh = () => { need(gov, "ent3-governance.js"); const s = memStorage(); gov.ent3UseStorage(s); return s; };
const AT = "2026-10-06T03:00:00.000Z";

console.log("ENTERPRISE-3 — data governance, fleet registry, billing adapters\n");

await check("1. the consent registry keeps receipt metadata only, adults only, nothing personal", () => {
  fresh();
  const ok = gov.ent3RegisterConsent({ orgId: "org-a", consentId: "c1", licence: "CC0-1.0", at: AT, statementHash: "abcd", adult: true });
  assert(ok.ok, `a valid receipt was refused: ${ok.reason}`);
  assert(!gov.ent3RegisterConsent({ orgId: "org-a", consentId: "c2", licence: "CC0-1.0", at: AT, adult: false }).ok, "a non-adult receipt was accepted");
  assert(!gov.ent3RegisterConsent({ orgId: "org-a", consentId: "c3", licence: "CC0-1.0", at: AT, adult: true, email: "x@y.z" }).ok, "a receipt with an e-mail was accepted");
  assert(!gov.ent3RegisterConsent({ orgId: "org-a", consentId: "c4", licence: "MIT", at: AT, adult: true }).ok, "a licence DATAWORKS does not offer was accepted");
  assert(!gov.ent3RegisterConsent({ orgId: "org-a", consentId: "c5", licence: "CC0-1.0", at: AT, adult: true, k12: true }).ok, "a K-12 receipt was accepted");
  const list = gov.ent3Consents("org-a");
  eq(list.length, 1, "consents kept");
  eq(Object.keys(list[0]).sort(), ["adult", "at", "consentId", "licence", "orgId", "revokedAt", "state", "statementHash"].sort(), "stored keys");
});

await check("2. every dataset card carries every DATAWORKS datasheet section", () => {
  fresh(); need(dx, "dx-data.js");
  gov.ent3LoadSample({ at: AT });
  const ds = gov.ent3Datasets();
  assert(ds.length >= 2, "the sample has fewer than two datasets");
  for (const d of ds) {
    const card = gov.ent3DatasetCard(d.id);
    for (const h of dx.DX_CARD_SECTIONS) assert(card.includes(`## ${h}`), `${d.id}'s card lacks "${h}"`);
    assert(card.includes(d.id), `${d.id}'s card does not name its dataset id`);
  }
  console.log(`      ${ds.length} dataset cards × ${dx.DX_CARD_SECTIONS.length} sections`);
});

await check("3. lineage runs dataset id -> policy id -> eval", () => {
  fresh(); gov.ent3LoadSample({ at: AT });
  const { nodes, edges } = gov.ent3Lineage();
  const kinds = new Set(edges.map((e) => e.kind));
  assert(kinds.has("trained-on") && kinds.has("evaluated-by"), `edge kinds ${[...kinds]}`);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const e of edges) assert(byId.has(e.from) && byId.has(e.to), `edge ${e.from} -> ${e.to} names a missing node`);
  for (const e of edges.filter((x) => x.kind === "trained-on")) eq([byId.get(e.from).type, byId.get(e.to).type], ["dataset", "policy"], "trained-on direction");
  const rows = gov.ent3LineageRows();
  assert(rows.length && rows.every((r) => r.datasetId && r.policyId && Array.isArray(r.evals)), "lineage rows lack dataset/policy/evals");
  console.log(`      ${nodes.length} nodes, ${edges.length} edges, ${rows.length} dataset→policy rows`);
});

await check("4. the audit log is append-only and hash-chained; tampering is detected", () => {
  const s = fresh(); gov.ent3LoadSample({ at: AT });
  const before = gov.ent3AuditList().length;
  gov.ent3RegisterConsent({ orgId: "org-sample", consentId: "c-extra", licence: "CC-BY-4.0", at: AT, statementHash: "ff", adult: true });
  const list = gov.ent3AuditList();
  assert(list.length === before + 1, "a registry write was not audited");
  assert(gov.ent3VerifyAudit().ok, "the untouched chain does not verify");
  for (const name of ["ent3Clear", "ent3ClearAudit", "ent3DeleteAudit", "ent3RemoveAudit"]) assert(typeof gov[name] !== "function", `${name} is exported`);
  const raw = JSON.parse(s.getItem(gov.ENT3_KEY));
  raw.audit[1].detail = "edited";
  s.setItem(gov.ENT3_KEY, JSON.stringify(raw));
  const v = gov.ent3VerifyAudit();
  assert(!v.ok && v.brokenAt === 1, `an edited line was not caught (${JSON.stringify(v)})`);
  const raw2 = JSON.parse(s.getItem(gov.ENT3_KEY)); raw2.audit[1].detail = raw.audit[1].detail; raw2.audit.splice(2, 1);
  s.setItem(gov.ENT3_KEY, JSON.stringify(raw2));
  assert(!gov.ent3VerifyAudit().ok, "a deleted line was not caught");
});

// Ground truth for check 5: a policy is stale when any dataset it was trained on
// holds a revoked consent, or any policy it is based on is stale (closure).
function truth(g, revoked) {
  const badDs = new Set(g.datasets.filter((d) => d.consentIds.some((c) => revoked.has(c))).map((d) => d.id));
  const stale = new Set(); let grew = true;
  while (grew) { grew = false; for (const p of g.policies) if (!stale.has(p.id) && (p.trainedOn.some((d) => badDs.has(d)) || p.basedOn.some((b) => stale.has(b)))) { stale.add(p.id); grew = true; } }
  return { badDs, stale };
}
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

await check("5. one-tap revoke marks dependent policies stale (transitively) and flags deployments — 200 seeded graphs", () => {
  need(gov, "ent3-governance.js"); need(rbData, "rb-robotics-data.js");
  let tp = 0; let fp = 0; let fn = 0; let flaggedOk = 0; let flaggedAll = 0;
  for (let trial = 0; trial < 200; trial += 1) {
    fresh(); const R = lcg(trial + 11);
    const nC = 3 + Math.floor(R() * 6); const nD = 2 + Math.floor(R() * 4); const nP = 2 + Math.floor(R() * 6);
    const consents = Array.from({ length: nC }, (_, i) => `c${i}`);
    for (const c of consents) gov.ent3RegisterConsent({ orgId: "org-t", consentId: c, licence: "CC0-1.0", at: AT, statementHash: c, adult: true });
    const g = { datasets: [], policies: [] };
    for (let i = 0; i < nD; i += 1) {
      const ids = consents.filter(() => R() < 0.35);
      const d = { id: `ds${i}`, orgId: "org-t", name: `d${i}`, source: ids.length ? "human" : "synthetic", episodes: 10, steps: 100, consentIds: ids, licences: ["CC0-1.0"], scenarios: ["rb-cell-entry"], worlds: ["robotics"] };
      gov.ent3RegisterDataset(d); g.datasets.push(d);
    }
    for (let i = 0; i < nP; i += 1) {
      const trainedOn = g.datasets.filter(() => R() < 0.4).map((d) => d.id);
      if (!trainedOn.length) trainedOn.push(g.datasets[Math.floor(R() * nD)].id);
      const basedOn = g.policies.filter(() => R() < 0.25).map((p) => p.id);
      const p = { id: `pol${i}`, version: "1", name: `p${i}`, method: "behaviour-cloning-knn", trainedOn, basedOn };
      const r = gov.ent3RegisterPolicy(p); assert(r.ok, `policy refused: ${r.reason}`); g.policies.push(p);
    }
    const sites = rbData.RB_SITES.map((s) => s.id);
    g.policies.forEach((p, i) => gov.ent3Deploy({ policyId: p.id, siteId: sites[i % sites.length] }));
    const revoked = new Set([consents[Math.floor(R() * nC)]]);
    const out = gov.ent3Revoke({ consentId: [...revoked][0] }, "learner withdrew");
    const t = truth(g, revoked);
    const got = new Set(gov.ent3Policies().filter((p) => p.status === "stale").map((p) => p.id));
    for (const id of got) (t.stale.has(id) ? (tp += 1) : (fp += 1));
    for (const id of t.stale) if (!got.has(id)) fn += 1;
    assert(out.policiesStale.length === t.stale.size, `trial ${trial}: revoke reported ${out.policiesStale.length}, expected ${t.stale.size}`);
    for (const row of gov.ent3Fleet().filter((r) => r.deployment)) {
      flaggedAll += 1;
      if (row.stale === t.stale.has(row.deployment.policyId)) flaggedOk += 1;
    }
    assert(gov.ent3VerifyAudit().ok, `trial ${trial}: the chain broke`);
  }
  const precision = tp + fp ? tp / (tp + fp) : 1; const recall = tp + fn ? tp / (tp + fn) : 1;
  console.log(`      stale marking: precision ${precision.toFixed(3)}, recall ${recall.toFixed(3)} (${tp} stale policies across 200 graphs); deployments flagged correctly ${flaggedOk}/${flaggedAll}`);
  assert(precision === 1 && recall === 1 && flaggedOk === flaggedAll, "stale marking or deployment flags were wrong");
});

await check("6. the fleet covers every robot site; deploy refuses stale or unknown; evals come from real rb-env rollouts", () => {
  need(gov, "ent3-governance.js"); need(rbEnvMod, "rb-env.js");
  fresh(); gov.ent3LoadSample({ at: AT });
  const fleet = gov.ent3Fleet();
  eq(fleet.map((r) => r.siteId).sort(), rbData.RB_SITES.map((s) => s.id).sort(), "fleet sites");
  assert(!gov.ent3Deploy({ policyId: gov.ent3Policies()[0].id, siteId: "no-such-site" }).ok, "an unknown site was accepted");
  // Measure: the scripted expert and a lapsing scripted policy on held-out seeds of the cell-entry game.
  const env = rbEnvMod.rbEnv("rb-cell-entry", { seed: 101 });
  const measure = (skill) => { let ok = 0; const seeds = [101, 102, 103, 104, 105, 106, 107, 108]; for (const s of seeds) { const r = rbEnvMod.rbRollout(env, { skill, seed: s }); if (r.summary?.success ?? r.summary?.passed) ok += 1; } return { value: ok / seeds.length, n: seeds.length, seeds }; };
  const expert = measure(1); const lapsing = measure(0.5);
  gov.ent3RegisterDataset({ id: "ds-rb-cell-synthetic", orgId: "org-sample", name: "Cell entry rollouts (synthetic)", source: "synthetic", episodes: 8, steps: 400, consentIds: [], licences: ["CC0-1.0"], scenarios: ["rb-cell-entry"], worlds: ["robotics"] });
  for (const [id, m, skill] of [["pol-scripted-expert", expert, 1], ["pol-scripted-lapsing", lapsing, 0.5]]) {
    assert(gov.ent3RegisterPolicy({ id, version: "1", name: `scripted skill ${skill}`, method: "scripted", trainedOn: ["ds-rb-cell-synthetic"] }).ok, `${id} refused`);
    assert(gov.ent3RecordEval(id, { suite: "rb-cell-entry held-out seeds 101-108", metric: "success rate", value: m.value, n: m.n, seeds: m.seeds, measured: true, at: AT }).ok, `${id} eval refused`);
  }
  assert(gov.ent3Deploy({ policyId: "pol-scripted-expert", siteId: "rb-site-soma-robot-cell" }).ok, "deploying a fresh policy failed");
  const row = gov.ent3Fleet().find((r) => r.siteId === "rb-site-soma-robot-cell");
  eq(row.deployment.policyId, "pol-scripted-expert", "fleet row policy");
  eq(row.evalScore, expert.value, "fleet row shows the policy's eval");
  const stale = gov.ent3Policies().find((p) => p.status === "stale") ?? (gov.ent3Revoke({ consentId: gov.ent3Consents()[0].consentId }, "test"), gov.ent3Policies().find((p) => p.status === "stale"));
  assert(stale, "the sample has no consent-dependent policy to go stale");
  assert(!gov.ent3Deploy({ policyId: stale.id, siteId: "rb-site-orleans-warehouse" }).ok, "a stale policy was deployed");
  const methods = gov.ENT3_METHODS.map((m) => m.id);
  assert(!gov.ent3RegisterPolicy({ id: "pol-x", version: "1", name: "x", method: "general intelligence", trainedOn: ["ds-rb-cell-synthetic"] }).ok, "an unnamed method was accepted");
  console.log(`      measured on rb-cell-entry seeds 101-108: scripted expert ${expert.value.toFixed(3)}, lapsing (skill 0.5) ${lapsing.value.toFixed(3)}; methods named: ${methods.join(", ")}`);
});

await check("7. billing is off by default: no provider, no transport call, no fetch", async () => {
  need(bill, "ent3-billing.js");
  const authConfig = JSON.parse(read("WebXR/auth-config.json") || "{}");
  eq(bill.ent3BillingConfig(authConfig), null, "the public auth-config enables billing");
  eq(bill.ent3BillingConfig(null), null, "a missing config enables billing");
  let calls = 0; const transport = async () => { calls += 1; return { ok: true }; };
  const off = bill.ent3BillingAdapter(null, { transport });
  assert(off.enabled === false && off.provider === null, "the adapter is on without a config");
  for (const r of [await off.getSeatLicence("org-a"), await off.setSeats("org-a", 5), await off.listEntitlements("org-a"), await off.createInvoice({ orgId: "org-a", seats: 5 })]) assert(r.ok === false && r.off === true, "an off adapter answered");
  const half = bill.ent3BillingAdapter(bill.ent3BillingConfig({ billing: { provider: "chargebee", proxyEndpoint: "https://billing.example.org/holodeck" } }));
  const r = await half.setSeats("org-a", 5);
  assert(r.ok === false && /transport/.test(r.reason), "a provider without a transport did not refuse");
  eq(calls, 0, "transport calls"); eq(net.length, 0, "global fetch calls");
});

await check("8. a config with a secret, a vendor host, plain http or an unknown provider is refused", () => {
  need(bill, "ent3-billing.js");
  const base = { provider: "chargebee", proxyEndpoint: "https://billing.example.org/holodeck" };
  assert(bill.ent3BillingConfig({ billing: base }), "a clean config was refused");
  for (const [bad, why] of [
    [{ ...base, apiKey: "anything" }, "an apiKey field"], [{ ...base, secret: "x" }, "a secret field"], [{ ...base, site: "live_abcdefghijklmnop" }, "a live-key-shaped value"],
    [{ ...base, clientSecret: "x" }, "a clientSecret field"], [{ ...base, token: "x" }, "a token field"],
    [{ ...base, proxyEndpoint: "http://billing.example.org" }, "plain http"], [{ ...base, proxyEndpoint: "https://acme.chargebee.com/api/v2" }, "a Chargebee host"],
    [{ ...base, proxyEndpoint: "https://api-m.paypal.com/v2/invoicing" }, "a PayPal host"], [{ ...base, provider: "stripe" }, "an unknown provider"],
    [{ ...base, currency: "crew-credits" }, "Crew Credits as a currency"],
  ]) assert(bill.ent3BillingConfig({ billing: bad }) === null, `${why} was accepted`);
});

await check("9. the mock is deterministic; Chargebee and PayPal map to descriptors sent only through the transport", async () => {
  need(bill, "ent3-billing.js");
  const run = async () => { const a = bill.ent3BillingAdapter({ provider: "mock" }, { now: () => AT }); await a.setSeats("org-a", 12); return [await a.getSeatLicence("org-a"), await a.listEntitlements("org-a"), await a.createInvoice({ orgId: "org-a", seats: 12, reference: "cohort-1" })]; };
  const [x, y] = [await run(), await run()];
  eq(x, y, "two mock runs differ");
  assert(x[0].ok && x[0].seats === 12 && x[1].entitlements.some((e) => e.feature === bill.ENT3_SEAT_FEATURE && e.value === 12), "mock seats or entitlements wrong");
  assert(x[2].ok && x[2].invoice.amount === null, "a mock invoice carries an amount the public build never configured");
  const sent = []; const transport = async (endpoint, d) => { sent.push([endpoint, d]); return { ok: true, data: { seats: d.body?.quantity ?? 3, entitlements: [], invoiceId: "inv-1" } }; };
  const cb = bill.ent3BillingAdapter(bill.ent3BillingConfig({ billing: { provider: "chargebee", proxyEndpoint: "https://billing.example.org/holodeck", subscriptionRef: "sub-ref" } }), { transport });
  await cb.setSeats("org-a", 7); await cb.getSeatLicence("org-a"); await cb.listEntitlements("org-a");
  const cbInv = await cb.createInvoice({ orgId: "org-a", seats: 7 });
  assert(cbInv.ok === false && cbInv.unsupported, "Chargebee answered a direct invoice (it invoices from the subscription)");
  const pp = bill.ent3BillingAdapter(bill.ent3BillingConfig({ billing: { provider: "paypal", proxyEndpoint: "https://billing.example.org/holodeck" } }), { transport });
  await pp.createInvoice({ orgId: "org-a", seats: 7, reference: "cohort-1" });
  const ppSeats = await pp.setSeats("org-a", 7);
  assert(ppSeats.ok === false && ppSeats.unsupported, "PayPal answered a seat quantity (it has invoices, not subscriptions, in this design)");
  eq(sent.map(([, d]) => `${d.provider}:${d.resource}.${d.action}`), ["chargebee:subscription.update-seat-quantity", "chargebee:subscription.retrieve", "chargebee:subscription-entitlements.list", "paypal:invoice.create-draft"], "descriptors");
  assert(sent.every(([e]) => e === "https://billing.example.org/holodeck"), "a descriptor went somewhere other than the deployment's proxy");
  assert(sent.every(([, d]) => !JSON.stringify(d).match(/amount"?:\s*\d/)), "a descriptor carries an amount");
  eq(net.length, 0, "global fetch calls");
  console.log(`      ${sent.length} descriptors through the handed-in transport, 0 global fetches`);
});

await check("10. Crew Credits never touch billing; no price in the public build", async () => {
  need(bill, "ent3-billing.js");
  const a = bill.ent3BillingAdapter({ provider: "mock" });
  const r = await a.createInvoice({ orgId: "org-a", seats: 3, currency: "crew-credits" });
  assert(r.ok === false && /crew credits/i.test(r.reason), "a Crew Credits invoice was accepted");
  const billSrc = read("WebXR/shared/ent3-billing.js"); const ty = read("WebXR/shared/ty-economy.js");
  assert(!/ty-economy|tyLedger|tyEarn/.test(billSrc), "ent3-billing reads the play economy");
  assert(!/ent3/.test(ty), "the play economy reads ent3 billing");
  const pub = [billSrc, read("WebXR/shared/ent3-governance.js"), read("WebXR/instructor/js/governance.js"), read("WebXR/auth-config.json")];
  for (const t of pub) assert(!/[$€£]\s?\d|\b\d+(\.\d+)?\s?(USD|EUR|GBP)\b|"(unitAmount|amountMinor|price)"\s*:\s*\d/.test(t), "a price appears in a public file");
});

const ENT3_FILES = ["WebXR/shared/ent3-governance.js", "WebXR/shared/ent3-billing.js", "WebXR/instructor/js/governance.js"];
await check("11. no network API in any ent3 file; the console view sets no markup from strings", () => {
  for (const f of ENT3_FILES) {
    const code = read(f).replace(/^\s*(\/\/|\*).*$/gm, "");
    assert(code.length, `${f} is missing`);
    for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "import(", "innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) assert(!code.includes(api), `${f} uses ${api}`);
    assert(!/import\s*\{[^}]*\bas\b/.test(code), `${f} uses an import alias (the flat bundler drops them)`);
  }
});

await check("12. the Data governance tab is in the console and the bundle", () => {
  const html = read("WebXR/instructor/index.html"); const app = read("WebXR/instructor/js/app.js"); const py = read("tools/bundle_webxr.py");
  assert(html.includes('id="tab-governance"') && html.includes('id="view-governance"') && html.includes('id="ent3-root"'), "the tab or its panel is missing");
  assert(/ent3MountGovernanceView/.test(app), "app.js does not mount the view");
  for (const m of ["ent3-governance.js", "ent3-billing.js", "instructor/js/governance.js", "rb-robotics-data.js", "dx-data.js"]) assert(py.slice(py.indexOf('"instructor": {'), py.indexOf('"holodeck": {')).includes(m), `the instructor bundle lacks ${m}`);
  assert(read("WebXR/shared/profiles.js").includes('"ent3-governance-v1"'), "the governance store is not a profile key");
});

await check("13. no model identifier in any ent3 file or doc", () => {
  for (const f of [...ENT3_FILES, "docs/billing-adapters.md", "docs/consoles/ENTERPRISE-3.md", "tools/check_enterprise3.mjs"]) {
    const t = read(f);
    assert(t.length, `${f} is missing`);
    assert(!/\b(claude-[a-z0-9-]+|gpt-[0-9][\w.-]*|opus[- ]?\d|sonnet[- ]?\d|haiku[- ]?\d|gemini-[0-9][\w.-]*|llama-?[0-9][\w.-]*)\b/i.test(t), `${f} names a model`);
  }
});

console.log(`\n${failed ? "✗" : "✓"} ENTERPRISE-3 — ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
