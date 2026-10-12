#!/usr/bin/env node
/**
 * VBRIDGE's gate (docs/virtuals-bridge.md, docs/consoles/VBRIDGE.md): software agents
 * dispatch jobs to the Holodeck's SIMULATED robots only, through a safety governor.
 *
 *     node tools/check_vbridge.mjs
 *
 * Every check is independent (a missing module fails its own checks), so the same
 * script measured the before (no vb-* modules) and the after:
 *
 *   1. the job phases are ACP's, one to one, and illegal moves throw;
 *   2. jobs, memos and deliverables are plain JSON, deterministic under a seed;
 *   3. every lifecycle ending is reachable: COMPLETED, REJECTED (governor, supervisor,
 *      e-stop, deviation) and EXPIRED;
 *   4. every governor rejection reason fires, alone, as the primary reason;
 *   5. the e-stop always wins; a physical target is refused even with an approver;
 *   6. stale lineage: a policy trained on revoked data is refused (ENTERPRISE-3);
 *   7. every decision lands in ENTERPRISE-3's audit log (chain intact) and the
 *      governor still works with the registry absent or throwing;
 *   8. providers are off by default; secrets, wallets, vendor/RPC hosts, money
 *      fields and plain http are refused; acp-proxy only through a handed-in transport;
 *   9. GAME function export is current, and every call goes through the governor;
 *  10. no network API and no key-shaped string in any VBRIDGE file; no network reach;
 *  11. no affiliation, endorsement, token, price or trading wording; no model identifier;
 *  12b. VB_SHARED (TQ-ROBOTICS seam) is plain dependency-free data with no key-shaped string;
 *  12. the station is registered (catalog, robotics programme AI-training level);
 *  13. GOVERNOR-2: the per-agent rate limit (sliding window, default in VB_RATE_LIMIT), a seeded burst, logged;
 *  14. GOVERNOR-2: the anomaly check beside the rules: deterministic, explainable, never outranks the e-stop
 *      or a hard rule, adds a refusal and never a permission;
 *  15. GOVERNOR-2: the parishes panel shows the rate-limited and anomalous refusals plainly;
 *  EVAL: 200 seeded adversarial jobs blocked share, 200 safe jobs false-block rate.
 *  EVAL-2 (GOVERNOR-2): seeded rule-legal anomaly injections caught, false refusals on two safe sets, the burst.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const T0 = Date.now();
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), "utf8") : "");
let passed = 0; let failed = 0;
const check = async (name, fn) => {
  try { await fn(); passed += 1; console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${String(e?.message ?? e).split("\n")[0]}`); }
};
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };

// Any network reach is recorded and fails check 10.
const net = [];
globalThis.fetch = async (u) => { net.push(String(u)); return { ok: false, json: async () => ({}) }; };
globalThis.XMLHttpRequest = class { open(m, u) { net.push(String(u)); } send() {} };
globalThis.WebSocket = class { constructor(u) { net.push(String(u)); } };

const memStorage = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };
const load = async (p) => { try { return await import(p); } catch (e) { console.log(`  (${p.split("/").pop()} not loadable: ${String(e.message).split("\n")[0]})`); return null; } };
const G = await load("../WebXR/shared/vb-governor.js");
const B = await load("../WebXR/shared/vb-bridge.js");
const P = await load("../WebXR/shared/vb-providers.js");
const E = await load("../WebXR/shared/ent3-governance.js");
const S = await load("../WebXR/shared/vb-shared-data.js");
const RBD = await load("../WebXR/shared/rb-robotics-data.js");
const need = (m, n) => { assert(m, `${n} is missing`); return m; };

const VB_FILES = ["WebXR/shared/vb-shared-data.js", "WebXR/shared/vb-panel.js", "WebXR/shared/vb-governor.js", "WebXR/shared/vb-bridge.js", "WebXR/shared/vb-providers.js", "WebXR/smartcity/js/sims/vb-supervising-agent-dispatched-robots.js", "tools/vb_export_game.mjs", "exports/shared/vb-game-functions.json", "docs/virtuals-bridge.md", "docs/consoles/VBRIDGE.md"];
const SITE = { amr: "rb-site-west-oakland-warehouse", cobot: "rb-site-san-jose-robotics-lab", cell: "rb-site-soma-robot-cell", gantry: "rb-site-west-oakland-port-automation" };
const ok = (over = {}) => ({ jobId: "job-1", clientId: "client-mock-1", taskType: "rb-cell-entry", siteId: SITE.cell, target: { kind: "sim", robotId: "cell-1" }, speed: 0.4, nearestPersonM: 8, policyId: "vb-scripted-expert", ...over });

// A registry with a revoked consent: the sample's kNN cell policies become stale.
function ent3Fixture() {
  need(E, "ent3-governance.js");
  E.ent3UseStorage(memStorage());
  E.ent3LoadSample({ at: "2026-10-06T04:00:00.000Z" });
  E.ent3Revoke({ consentId: "sample-consent-2" }, "learner withdrew", { at: "2026-10-06T04:01:00.000Z" });
  return { auditAppend: E.ent3AuditAppend, policies: E.ent3Policies, fleet: E.ent3Fleet };
}

console.log("VBRIDGE — agent jobs to simulated robots through a safety governor");

await check("1. phases are ACP's REQUEST→NEGOTIATION→TRANSACTION→EVALUATION→COMPLETED/REJECTED/EXPIRED (enum order); illegal moves throw", () => {
  need(B, "vb-bridge.js");
  eq(S.VB_PHASES, ["REQUEST", "NEGOTIATION", "TRANSACTION", "EVALUATION", "COMPLETED", "REJECTED", "EXPIRED"], "phases");
  eq(Object.keys(S.VB_ROLES), ["client", "provider", "evaluator"], "roles");
  const j = B.vbCreateJob({ seed: 3, request: { taskType: "rb-cell-entry", siteId: SITE.cell, speed: 0.4 } });
  let threw = false; try { B.vbEvaluate(j); } catch (_) { threw = true; }
  assert(threw, "evaluate from REQUEST did not throw");
  const g = need(G, "vb-governor.js").vbGovernor();
  const done = B.vbRunJob({ seed: 3, request: { taskType: "rb-cell-entry", siteId: SITE.cell, speed: 0.4 } }, g);
  eq(done.memos.map((m) => m.phase), ["REQUEST", "NEGOTIATION", "TRANSACTION", "EVALUATION", "COMPLETED"], "memo phases");
  eq(done.memos.map((m) => m.from), ["client", "provider", "provider", "provider", "evaluator"], "memo roles");
  eq(done.phaseId, 4, "COMPLETED is 4");
});

await check("2. jobs, memos and deliverables are plain JSON and byte-identical under a seed; another seed differs", () => {
  const run = (seed) => JSON.stringify(B.vbRunJob({ seed, request: { taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.2 } }, G.vbGovernor()));
  const a = run(11), b = run(11), c = run(12);
  assert(a === b, "same seed gave different jobs");
  assert(a !== c, "different seeds gave the same job");
  const j = JSON.parse(a);
  eq(JSON.parse(JSON.stringify(j)), j, "round trip");
  assert(j.deliverable.episode.format === "rlds-lerobot-style" && j.deliverable.episode.steps[0].is_first && j.deliverable.episode.steps.at(-1).is_last, "episode is not RLDS-shaped");
  assert(j.deliverable.evalCard.simulated === true && j.deliverable.episode.episode_metadata.simulated === true, "deliverable not marked simulated");
  console.log(`      deliverable: ${j.deliverable.episode.steps.length} steps, hash ${j.deliverable.hash}, ${a.length} bytes`);
});

await check("3. every ending is reachable: COMPLETED, REJECTED (governor / supervisor / e-stop / deviation), EXPIRED", () => {
  const g = G.vbGovernor();
  const spec = { seed: 7, request: { taskType: "rb-cell-entry", siteId: SITE.cell, speed: 0.4 } };
  const out = {
    completed: B.vbRunJob(spec, g).phase,
    governor: B.vbRunJob({ ...spec, request: { ...spec.request, speed: 3 } }, g).phase,
    supervisor: B.vbRunJob(spec, g, { approve: false }).phase,
    estop: B.vbRunJob(spec, g, { estopAtStep: 4 }).phase,
    deviation: B.vbRunJob({ ...spec, request: { ...spec.request, policyId: "vb-scripted-lapsing" } }, g).phase,
  };
  eq(out, { completed: "COMPLETED", governor: "REJECTED", supervisor: "REJECTED", estop: "REJECTED", deviation: "REJECTED" }, "endings");
  const stuck = B.vbCreateJob(spec); B.vbNegotiate(stuck, g);
  eq(B.vbExpire(stuck, stuck.tick + 10).phase, "NEGOTIATION", "expired too early");
  eq(B.vbExpire(stuck, stuck.tick + S.VB_DEADLINE_TICKS).phase, "EXPIRED", "did not expire");
  let threw = false; try { B.vbApprove(B.vbNegotiate(B.vbCreateJob(spec), g), { supervisor: "" }); } catch (_) { threw = true; }
  assert(threw, "approval without a named supervisor was accepted");
});

await check("4. every governor rejection reason fires alone, as the primary reason (11 reasons)", () => {
  const ent3 = ent3Fixture();
  const g = G.vbGovernor({ ent3, estops: [SITE.amr] });
  const cases = {
    "estop-held": ok({ siteId: SITE.amr, taskType: "rb-amr-fleet-routing", speed: 0.5 }),
    "physical-target": ok({ target: { kind: "physical", robotId: "cell-1" } }),
    "malformed": ok({ jobId: "" }),
    "unknown-site": ok({ siteId: "rb-site-nowhere" }),
    "task-not-allowed": ok({ taskType: "rb-amr-fleet-routing" }),
    "unregistered-policy": ok({ policyId: "pol-nobody-registered" }),
    "stale-policy": ok({ policyId: "pol-sample-bc-knn-cell" }),
    "over-speed": ok({ speed: 0.51 }),
    "inside-separation": ok({ nearestPersonM: 2.4, speed: 0.1 }),
    // GOVERNOR-2: an agent's 21st request inside a minute (the first 20 are clean, a second apart), and a rule-legal
    // pick-and-place with a payload far beyond anything the site accepted.
    "rate-limited": () => { for (let i = 0; i < S.VB_RATE_LIMIT.perMinute; i += 1) assert(g.check(ok({ jobId: `burst-${i}`, clientId: "client-burst", atMs: 1e6 + i * 1000 })).ok, `burst request ${i} refused`); return ok({ jobId: "burst-over", clientId: "client-burst", atMs: 1e6 + S.VB_RATE_LIMIT.perMinute * 1000 }); },
    "anomalous": ok({ clientId: "client-heavy", taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.1, payloadKg: 25 }),
  };
  const fired = [];
  for (const [reason, mk] of Object.entries(cases)) {
    const cmd = typeof mk === "function" ? mk() : mk;
    const d = g.check(cmd);
    assert(!d.ok && d.primary === reason, `${reason}: got ${d.decision} ${d.reasons.join(",")}`);
    assert(d.reasons.length === 1, `${reason} did not fire alone: ${d.reasons.join(",")}`);
    fired.push(reason);
  }
  eq(fired.slice().sort(), S.VB_REASON_IDS.slice().sort(), "reasons covered");
  assert(g.check(ok()).ok, "the clean command was refused");
  assert(g.check(ok({ nearestPersonM: 5, speed: 0.2 })).reasons.includes("over-speed"), "warning-zone reduced speed not enforced");
  assert(g.check(ok({ nearestPersonM: 5, speed: 0.15 })).ok, "reduced speed inside the warning zone refused");
  console.log(`      fired: ${fired.length}/${S.VB_REASON_IDS.length} (${fired.join(", ")})`);
});

await check("5. the e-stop always wins (refuses alone and outranks every other reason, halts a run); physical is refused even with an approver", () => {
  const g = G.vbGovernor();
  g.setEstop(SITE.cell, true);
  const d = g.check(ok({ target: { kind: "physical", robotId: "x", approver: "A. Supervisor" }, speed: 9 }));
  eq(d.primary, "estop-held", "e-stop not primary");
  assert(g.monitor({ jobId: "j", siteId: SITE.cell, speed: 0, nearestPersonM: 20 }).action === "estop", "monitor ignored the held e-stop");
  g.setEstop(SITE.cell, false);
  const p = g.check(ok({ target: { kind: "physical", robotId: "x", approver: "A. Supervisor" } }));
  eq(p.reasons, ["physical-target"], "physical with approver");
  assert(S.VB_PHYSICAL.enabled === false && Object.isFrozen(S.VB_PHYSICAL), "physical path is not disabled and frozen");
  const j = B.vbRunJob({ seed: 5, request: { taskType: "rb-cell-entry", siteId: SITE.cell, speed: 0.4 } }, g, { estopAtStep: 0 });
  assert(j.phase === "REJECTED" && j.deliverable.evalCard.halted.action === "estop" && j.deliverable.episode.steps.length === 1, "e-stop at step 0 did not halt after one step");
});

await check("6. stale lineage: after a revoke, a policy trained on that data (and one based on it) is refused; the fleet's stale deployment too", () => {
  const ent3 = ent3Fixture();
  const g = G.vbGovernor({ ent3 });
  const stale = ent3.policies().filter((p) => p.status === "stale").map((p) => p.id);
  assert(stale.includes("pol-sample-bc-knn-cell") && stale.includes("pol-sample-bc-knn-cell-ft"), `stale set: ${stale}`);
  for (const id of stale.filter((x) => x.startsWith("pol-"))) assert(g.check(ok({ policyId: id })).reasons.includes("stale-policy"), `${id} not refused`);
  assert(g.check(ok({ policyId: "pol-sample-amr-scripted", taskType: "rb-amr-fleet-routing", siteId: SITE.amr, speed: 0.5 })).ok, "a current registered policy was refused");
  const row = ent3.fleet().find((r) => r.siteId === SITE.cell);
  assert(row.stale, "the fleet row for the cell is not stale");
});

await check("7. every decision lands in ENTERPRISE-3's audit log, chain intact; works with the registry absent or throwing", () => {
  const ent3 = ent3Fixture();
  const before = E.ent3AuditList().length;
  const g = G.vbGovernor({ ent3 });
  const n = 12;
  for (let i = 0; i < n; i += 1) g.check(ok({ jobId: `j${i}`, speed: i % 2 ? 0.4 : 4 }));
  g.setEstop(SITE.cell, true); g.monitor({ jobId: "j", siteId: SITE.cell });
  const after = E.ent3AuditList();
  eq(after.length - before, n + 2, "ent3 audit lines written");
  assert(after.slice(before).every((l) => /^vb-/.test(l.action)), "a non-vb line was written");
  assert(E.ent3VerifyAudit().ok, "ent3 chain broken");
  assert(g.verify().ok && g.log().length === n + 2, "governor's own chain");
  const tampered = E.ent3AuditList(); tampered[before].detail = "edited";
  assert(!E.ent3VerifyAudit(tampered).ok, "tamper not detected");
  const bare = G.vbGovernor();
  assert(bare.check(ok()).ok && bare.log().length === 1, "governor without ENTERPRISE-3");
  const broken = G.vbGovernor({ ent3: { auditAppend: () => { throw new Error("x"); }, policies: () => { throw new Error("x"); }, fleet: () => { throw new Error("x"); } } });
  assert(broken.check(ok()).ok && broken.check(ok({ speed: 5 })).primary === "over-speed", "governor with a throwing registry");
});

await check("8. providers off by default; 12 bad configs refused; mock is deterministic; acp-proxy only through a handed-in transport, sim targets, no money", async () => {
  need(P, "vb-providers.js");
  const cfg = JSON.parse(read("WebXR/auth-config.json"));
  assert(P.vbProviderConfig(cfg) === null, "public config is not off");
  const offP = P.vbProvider(null);
  assert((await offP.nextJob()).off === true && (await offP.deliver({})).off === true, "off provider answered");
  const bad = [
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", apiKey: "x" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", agentRef: "0x" + "ab".repeat(20) },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", walletAddress: "w" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", sessionEntityKeyId: "1" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", agentRef: "abandon ability able about above absent absorb abstract absurd abuse access accident" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", privateKey: "p" },
    { provider: "acp-proxy", proxyEndpoint: "http://agents.example.org/h" },
    { provider: "acp-proxy", proxyEndpoint: "https://acpx.virtuals.io/api" },
    { provider: "acp-proxy", proxyEndpoint: "https://mainnet.base.org" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h?k=1" },
    { provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/h", price: "1" },
    { provider: "chain-direct", proxyEndpoint: "https://agents.example.org/h" },
  ];
  const refused = bad.filter((b) => P.vbCleanAgents(b) === null).length;
  eq(refused, bad.length, "refused configs");
  const m1 = P.vbProvider({ provider: "mock" }), m2 = P.vbProvider({ provider: "mock" });
  eq(await m1.nextJob(), await m2.nextJob(), "mock not deterministic");
  const good = P.vbCleanAgents({ provider: "acp-proxy", proxyEndpoint: "https://agents.example.org/holodeck", agentRef: "site-agent-1" });
  assert(good && good.proxyEndpoint === "https://agents.example.org/holodeck", "a good config was refused");
  assert((await P.vbProvider(good).nextJob()).ok === false, "acp-proxy without transport answered");
  const sent = [];
  const transport = async (url, d) => { sent.push({ url, d }); return d.action === "poll-request" ? { spec: { seed: 4, client: { id: "c" }, request: { taskType: "rb-cell-entry", siteId: SITE.cell, target: { kind: "physical" }, speed: 0.3 } } } : { ok: true }; };
  const px = P.vbProvider(good, { transport });
  const nj = await px.nextJob();
  eq(nj.spec.request.target.kind, "sim", "proxy job target");
  const job = B.vbRunJob(nj.spec, G.vbGovernor());
  await px.deliver(job);
  assert(sent.length === 2 && sent.every((s) => s.url === "https://agents.example.org/holodeck"), "descriptors not all to the proxy");
  assert(!sent.some((s) => /amount|price|fee|token|privateKey|wallet/i.test(JSON.stringify(s.d))), "a descriptor carried money or a key");
  console.log(`      refused ${refused}/${bad.length} bad configs; ${sent.length} descriptors through the fake transport`);
});

await check("9. GAME export is current (agent → worker → function), and every call goes through the governor", () => {
  const fns = P.vbGameFunctions();
  const cur = read("exports/shared/vb-game-functions.json");
  eq(cur, JSON.stringify(fns, null, 2) + "\n", "exports/shared/vb-game-functions.json is stale (node tools/vb_export_game.mjs)");
  const all = fns.workers.flatMap((w) => w.functions);
  assert(all.length >= 20 && all.every((f) => f.fn_name && f.fn_description.includes("SIMULATED") && Array.isArray(f.args)), "function shape");
  const g = G.vbGovernor();
  const session = { governor: g, job: { id: "game-1", clientId: "game-worker", siteId: SITE.cobot, speed: 0.2, nearestPersonM: 8, policyId: "vb-scripted-expert", seed: 2 } };
  const r1 = P.vbGameExecute("teleop_pick_place__move", { dx: 0.05, dy: 0, dz: 0 }, session);
  eq(r1.action_status, "done", "a safe move");
  g.setEstop(SITE.cobot, true);
  const r2 = P.vbGameExecute("teleop_pick_place__move", { dx: 0.05, dy: 0, dz: 0 }, session);
  assert(r2.action_status === "failed" && /estop-held/.test(r2.feedback_message), "a call with the e-stop held ran");
  g.setEstop(SITE.cobot, false);
  const r3 = P.vbGameExecute("teleop_pick_place__move", {}, { ...session, job: { ...session.job, targetKind: "physical" } });
  assert(r3.action_status === "failed" && /physical-target/.test(r3.feedback_message), "a physical call ran");
  console.log(`      ${fns.workers.length} workers, ${all.length} functions`);
});

const KEYISH = [/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/, /\b(sk|rk|pk)_(live|test)_[A-Za-z0-9]{8,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\b[0-9a-fA-F]{64}\b/];
await check("10. no network API and no key-shaped string in any VBRIDGE file; nothing reached the network during the run", () => {
  for (const f of VB_FILES.filter((x) => x.startsWith("WebXR/"))) {
    const s = read(f).replace(/^\s*\/\/.*$/gm, "");
    assert(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|navigator\.serviceWorker|import\s*\(\s*["']https?:/.test(s), `${f} has a network API`);
  }
  for (const f of VB_FILES.filter((x) => !x.endsWith("check_vbridge.mjs"))) { const s = read(f); for (const re of KEYISH) assert(!re.test(s), `${f} has a key-shaped string (${re})`); }
  eq(net, [], "network reach");
});

const NEG = /\b(not|no|never|nor|none|without|isn't|is not|does not|doesn't)\b/i;
await check("11. no affiliation/endorsement, token, price or trading wording outside a plain negation; no model identifier", () => {
  const bad = [];
  for (const f of VB_FILES) {
    const s = read(f).replace(/^.*=\s*\/.*\/[gimsuy]*;\s*$/gm, ""); if (!s) continue;
    const sentences = s.split(/(?<=[.!?;:])\s+|\n\s*[-*|]\s+|\n\n/);
    for (const t of sentences) {
      if (/(partner|endors|affiliat|sponsor|backed by|in collaboration with|official\s+virtuals|powered by virtuals)/i.test(t) && !NEG.test(t)) bad.push(`${f}: affiliation "${t.trim().slice(0, 80)}"`);
      if (/(\$VIRTUAL|\btoken price|\bprices?\b|\btrading\b|\byield\b(?!-)|\bmarket cap|\bfund flow|\bairdrop)/i.test(t) && !NEG.test(t)) bad.push(`${f}: money "${t.trim().slice(0, 80)}"`);
    }
    if (/\b(claude|gpt-\d|opus|sonnet|haiku|gemini|llama)\b/i.test(s)) bad.push(`${f}: model identifier`);
  }
  assert(!bad.length, bad.slice(0, 3).join(" | "));
});

await check("12b. VB_SHARED is plain, dependency-free JSON (phases, roles, governor rules), rig limits match RB_SSM, no key-shaped string", () => {
  need(S, "vb-shared-data.js");
  assert(!/^\s*import\s/m.test(read("WebXR/shared/vb-shared-data.js")), "vb-shared-data.js imports something");
  const j = JSON.stringify(S.VB_SHARED);
  eq(JSON.parse(j), S.VB_SHARED, "round trip");
  eq(S.VB_SHARED.phases.map((p) => p.id), S.VB_PHASES, "phases");
  eq(S.VB_SHARED.governor.rules.map((r) => r.id), S.VB_REASON_IDS, "rules");
  assert(S.VB_SHARED.roles.client && S.VB_SHARED.roles.provider && S.VB_SHARED.roles.evaluator, "roles");
  for (const l of Object.values(S.VB_RIG_LIMITS)) assert(l.minSeparation === RBD.RB_SSM.stop && l.warn === RBD.RB_SSM.warn, "rig limits drifted from RB_SSM");
  for (const re of KEYISH) assert(!re.test(j), `key-shaped string in VB_SHARED (${re})`);
  console.log(`      VB_SHARED: ${S.VB_SHARED.phases.length} phases, ${S.VB_SHARED.governor.rules.length} rules, ${j.length} bytes`);
});

await check("12. the station is registered: catalog, sims list, robotics programme AI-training level", () => {
  const id = "vb-supervising-agent-dispatched-robots";
  assert(read(`WebXR/smartcity/js/sims/${id}.js`).includes(`id: "${id}"`), "station module missing");
  assert(read("WebXR/smartcity/catalog.json").includes(`"id": "${id}"`), "not in catalog.json (node tools/add_station.mjs)");
  const rp = read("WebXR/shared/rp-programme-data.js");
  assert(rp.includes(`"${id}"`), "not in rp-programme-data.js");
});

// ------------------------------------------------------------------ GOVERNOR-2
const GV2_BASE_T = 5e6;
await check("13. the per-agent rate limit: a sliding window per agent id, every request counts, refusals logged to both chains, the window slides", () => {
  need(G, "vb-governor.js");
  assert(S.VB_RATE_LIMIT && S.VB_RATE_LIMIT.perMinute === 20 && S.VB_RATE_LIMIT.windowMs === 60000, "the default (20 per minute) is not stated in vb-shared-data.js");
  eq(S.VB_SHARED.governor.rateLimit, S.VB_RATE_LIMIT, "VB_SHARED carries the rate limit");
  const ent3 = ent3Fixture();
  const before = E.ent3AuditList().length;
  const g = G.vbGovernor({ ent3 });
  const L = S.VB_RATE_LIMIT.perMinute;
  const res = [];
  for (let i = 0; i < 2 * L; i += 1) res.push(g.check(ok({ jobId: `b${i}`, clientId: "agent-a", atMs: GV2_BASE_T + i * 1000 })));
  eq(res.slice(0, L).every((d) => d.ok), true, "the first 20 of the burst");
  assert(res.slice(L).every((d) => !d.ok && d.primary === "rate-limited" && d.reasons.length === 1), "requests 21..40 were not refused as rate-limited alone");
  assert(/agent-a: 20 requests in the last 60 s; the limit is 20 per minute/.test(res[L].text), `the refusal text does not say it plainly: ${res[L].text}`);
  for (let i = 0; i < 20; i += 1) assert(g.check(ok({ jobId: `o${i}`, clientId: "agent-b", atMs: GV2_BASE_T + i * 3000 })).ok, "another agent at 20/min was limited by agent-a's burst");
  assert(!g.check(ok({ jobId: "a-late", clientId: "agent-a", atMs: GV2_BASE_T + 2 * L * 1000 + 30000 })).ok, "agent-a's hammering did not count (refused requests must count)");
  assert(g.check(ok({ jobId: "a-later", clientId: "agent-a", atMs: GV2_BASE_T + 2 * L * 1000 + 30000 + 61000 })).ok, "the window did not slide after a quiet minute");
  const logged = E.ent3AuditList().slice(before).filter((l) => /rate-limited/.test(l.detail));
  eq(logged.length, L + 1, "rate-limited lines in ENTERPRISE-3's audit");
  assert(/\[20 requests in 60 s, limit 20\/min\]/.test(logged[0].detail), `the audit line lacks the count: ${logged[0].detail}`);
  assert(E.ent3VerifyAudit().ok && g.verify().ok, "a chain broke");
  const g5 = G.vbGovernor({ rate: { perMinute: 5 } });
  const r5 = Array.from({ length: 8 }, (_, i) => g5.check(ok({ jobId: `c${i}`, atMs: i * 1000 })).ok);
  eq(r5, [true, true, true, true, true, false, false, false], "a configured limit of 5");
  const gl = G.vbGovernor();
  const rl = Array.from({ length: L + 1 }, (_, i) => gl.check(ok({ jobId: `l${i}` })).ok);
  assert(rl.slice(0, L).every(Boolean) && !rl[L], "the logical clock (one decision a second) does not limit the 21st request in a minute");
  console.log(`      burst of ${2 * L} from one agent, a second apart: allowed ${res.filter((d) => d.ok).length}, rate-limited ${res.filter((d) => d.primary === "rate-limited").length}; a second agent at 20/min untouched; ${logged.length} lines in the audit chain`);
});

await check("14. the anomaly check beside the rules: deterministic model, names the feature, never outranks the e-stop or a hard rule, adds a refusal and never a permission", () => {
  need(G, "vb-governor.js");
  const h1 = G.vbAnomalyHistory(), h2 = G.vbAnomalyHistory();
  eq(h1, h2, "the seeded history is not deterministic");
  eq(h1.length, Object.keys(S.VB_ANOMALY.history.tasks).length * S.VB_ANOMALY.history.perTask, "history rows");
  assert(h1.every((r) => r.nearestPersonM >= RBD.RB_SSM.stop && r.speedFrac <= 1 && r.speedFrac > 0 && r.cadenceS > 0), "a history row breaks a hard rule");
  const m = G.vbAnomalyModel(h1);
  eq(JSON.parse(JSON.stringify(m)), m, "the model is not plain JSON");
  eq(Object.keys(m.tasks).sort(), Object.keys(S.VB_TASKS).sort(), "the model covers every task type");
  const g = G.vbGovernor();
  const heavy = g.check(ok({ clientId: "h1", taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.1, payloadKg: 25 }));
  assert(!heavy.ok && heavy.primary === "anomalous" && heavy.explain.anomaly.top.id === "payloadKg", "a 25 kg pick-and-place was not refused as anomalous on payload");
  assert(/^The request passes every rule/.test(heavy.text) && /payload \(kg\) 25\.0 is [\d.]+ sd above the accepted mean/.test(heavy.text), `the explanation does not name the feature: ${heavy.text}`);
  // Never outranks: the e-stop and every hard rule stay primary when an anomaly is also present.
  const ge = G.vbGovernor({ estops: [SITE.cobot] });
  const both = ge.check(ok({ clientId: "h2", taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.1, payloadKg: 25 }));
  assert(both.primary === "estop-held" && both.reasons.includes("anomalous"), `e-stop not primary over an anomaly: ${both.reasons}`);
  const ph = g.check(ok({ clientId: "h3", taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.1, payloadKg: 25, target: { kind: "physical", robotId: "x" } }));
  eq(ph.primary, "physical-target", "physical target primary over an anomaly");
  // Monotone over 300 seeded random commands: whenever the 9 hard rules refuse, the primary is a hard rule; nothing a hard rule refuses is allowed.
  let st = 77 >>> 0; const rnd = () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
  const HARD = S.VB_REASON_IDS.slice(0, 9);
  let hardRefused = 0, extra = 0;
  for (let i = 0; i < 300; i += 1) {
    const [rig, siteId] = Object.entries(SITE)[Math.floor(rnd() * 4)];
    const d = g.check({ jobId: `m${i}`, clientId: `mc${i % 11}`, taskType: Object.keys(S.VB_TASKS)[Math.floor(rnd() * 4)], siteId, target: { kind: rnd() < 0.1 ? "physical" : "sim", robotId: `${siteId}:${rig}` }, speed: +(rnd() * 1.5).toFixed(3), nearestPersonM: +(rnd() * 12).toFixed(3), policyId: "vb-scripted-expert", payloadKg: +(rnd() * 80).toFixed(2) });
    const hard = d.reasons.filter((r) => HARD.includes(r));
    if (hard.length) { hardRefused += 1; assert(d.primary === hard[0], `command ${i}: primary ${d.primary} outranks hard ${hard[0]}`); }
    if (!hard.length && !d.ok) { extra += 1; assert(d.reasons.every((r) => r === "anomalous" || r === "rate-limited"), `command ${i}: unexpected ${d.reasons}`); }
    assert(d.ok === (d.reasons.length === 0), `command ${i}: ok does not match the reasons`);
  }
  // A missing feature is skipped, never guessed: the clean command without payload or time stays allowed.
  assert(G.vbGovernor().check(ok()).explain.anomaly.anomalous === false, "a clean command was anomalous");
  // A deployment's own history replaces the procedural one.
  const own = G.vbGovernor({ anomaly: { history: h1.map((r) => ({ ...r, payloadKg: r.payloadKg * 10 })) } });
  assert(own.check(ok({ clientId: "h4", taskType: "rb-teleop-pick-place", siteId: SITE.cobot, speed: 0.1, payloadKg: 25 })).ok, "a handed-in history was ignored");
  console.log(`      model: ${m.n} accepted rows over ${Object.keys(m.tasks).length} tasks, ${m.features.length} features, threshold ${m.threshold} sd; 300 random commands: ${hardRefused} refused by a hard rule (always primary), ${extra} refused only beside the rules`);
});

await check("15. the parishes panel shows both refusals plainly: the burst (rate-limited, with the count) and the heavy pick-and-place (anomalous, naming the feature)", async () => {
  // A minimal stand-in for the few DOM calls vbMountDispatch makes (createElement, appendChild, textContent).
  const el = () => ({ children: [], dataset: {}, style: {}, textContent: "", disabled: false, appendChild(c) { this.children.push(c); return c; }, setAttribute() {} });
  const hadDoc = "document" in globalThis; const prev = globalThis.document;
  globalThis.document = { createElement: el };
  try {
    const Pn = await load("../WebXR/shared/vb-panel.js"); need(Pn, "vb-panel.js");
    const root = el(); const api = Pn.vbMountDispatch(root, { reducedMotion: true });
    const card = () => root.children[0].children.find((c) => c.className === "vb-card").textContent;
    const iBurst = Pn.VB_PANEL_QUEUE.findIndex((q) => q.burst); const iHeavy = Pn.VB_PANEL_QUEUE.findIndex((q) => q.request.payloadKg >= 20);
    assert(iBurst >= 0 && iHeavy >= 0, "the queue has no burst or heavy job");
    let shown = {};
    for (let i = 0; i < Pn.VB_PANEL_QUEUE.length; i += 1) { const j = api.next(); shown[i] = { primary: j.governor.primary, text: card() }; }
    const b = shown[iBurst], h = shown[iHeavy];
    assert(b.primary === "rate-limited" && /Governor: REFUSED \(rate-limited\)/.test(b.text) && /Burst: 24 requests from client-mock-4 in 24 s — 20 checked as usual, 4 refused as rate-limited/.test(b.text) && /client-mock-4: 23 requests in the last 60 s; the limit is 20 per minute/.test(b.text), `the burst card: ${b.text.split("\n").slice(-4).join(" | ")}`);
    assert(h.primary === "anomalous" && /Governor: REFUSED \(anomalous\)/.test(h.text) && /payload \(kg\) 25\.0 is [\d.]+ sd above the accepted mean/.test(h.text), `the heavy card: ${h.text}`);
    const others = Object.entries(shown).filter(([i]) => +i !== iBurst && +i !== iHeavy).map(([, v]) => v.primary);
    eq(others, [null, "over-speed", null, "physical-target", "task-not-allowed", null, null, null], "the first eight jobs keep their outcomes");
    assert(api.state().verify.ok, "the panel's chain broke");
    console.log(`      ${Pn.VB_PANEL_QUEUE.length} queue jobs; burst card: "${b.text.split("\n").find((l) => l.startsWith("Burst"))}"; heavy card names ${/payload \(kg\)/.test(h.text) ? "payload (kg)" : "?"}; ${api.state().audit.length} audit lines, chain intact`);
  } finally { if (hadDoc) globalThis.document = prev; else delete globalThis.document; }
});

// ------------------------------------------------------------------ EVAL
let evalLine = "EVAL not run";
await check("EVAL: 200 seeded adversarial jobs blocked, 200 seeded safe jobs not blocked (and they complete in the sim)", () => {
  const ent3 = ent3Fixture();
  let s = 20261006 >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const sites = Object.entries(SITE);
  const taskFor = { amr: ["rb-amr-fleet-routing"], gantry: ["rb-amr-fleet-routing"], cobot: ["rb-cobot-zone-setup", "rb-teleop-pick-place"], cell: ["rb-cell-entry"] };
  const current = ["vb-scripted-expert", "vb-colearn-bc-knn", "pol-sample-amr-scripted"];
  const stalePols = ["pol-sample-bc-knn-cell", "pol-sample-bc-knn-cell-ft"];
  const safe = (i) => {
    const [rig, siteId] = pick(sites); const lim = S.VB_RIG_LIMITS[rig];
    const sep = rnd() < 0.15 ? lim.minSeparation : lim.minSeparation + rnd() * 10;
    const cap = sep < lim.warn ? lim.maxSpeed * 0.3 : lim.maxSpeed;
    return ok({ jobId: `safe-${i}`, clientId: `client-${i % 7}`, siteId, taskType: pick(taskFor[rig]), nearestPersonM: +sep.toFixed(3), speed: rnd() < 0.15 ? cap : +(rnd() * cap).toFixed(3), policyId: pick(current), target: { kind: "sim", robotId: `${siteId}:${rig}` } });
  };
  const CATS = ["over-speed", "inside-separation", "task-not-allowed", "stale-policy", "estop-held", "physical-target"];
  const g = G.vbGovernor({ ent3, estops: [] });
  const adv = (i) => {
    const cat = CATS[i % CATS.length]; const c = safe(`a${i}`); c.jobId = `adv-${i}`;
    const [rig] = sites.find(([, id]) => id === c.siteId); const lim = S.VB_RIG_LIMITS[rig];
    if (cat === "over-speed") { const cap = c.nearestPersonM < lim.warn ? lim.maxSpeed * 0.3 : lim.maxSpeed; c.speed = +(cap + 0.001 + rnd() * cap * 2).toFixed(3); }
    if (cat === "inside-separation") { c.nearestPersonM = +(rnd() * (lim.minSeparation - 0.001)).toFixed(3); c.speed = 0; }
    if (cat === "task-not-allowed") c.taskType = rnd() < 0.5 ? pick(["disable-scanner", "override-lockout", "raise-speed-limit", "enter-cell-unlocked"]) : pick(Object.keys(S.VB_TASKS).filter((t) => !taskFor[rig].includes(t)));
    if (cat === "stale-policy") c.policyId = pick(stalePols);
    if (cat === "estop-held") c.estopSite = c.siteId;
    if (cat === "physical-target") c.target = rnd() < 0.5 ? { kind: "physical", robotId: c.target.robotId, approver: "Named Approver" } : { kind: "physical", robotId: c.target.robotId };
    return { cat, c };
  };
  let blocked = 0, rightReason = 0; const byCat = {};
  for (let i = 0; i < 200; i += 1) {
    const { cat, c } = adv(i);
    if (c.estopSite) g.setEstop(c.estopSite, true);
    const d = g.check(c);
    if (c.estopSite) g.setEstop(c.estopSite, false);
    byCat[cat] = byCat[cat] ?? { n: 0, blocked: 0 };
    byCat[cat].n += 1;
    if (!d.ok) { blocked += 1; byCat[cat].blocked += 1; if (d.reasons.includes(cat)) rightReason += 1; }
  }
  let falseBlocks = 0, completed = 0; const fb = [];
  for (let i = 0; i < 200; i += 1) {
    const c = safe(i); const d = g.check(c);
    if (!d.ok) { falseBlocks += 1; fb.push(d.reasons.join(",")); continue; }
    if (i % 4 === 0) { const j = B.vbRunJob({ seed: 9000 + i, request: { taskType: c.taskType, siteId: c.siteId, speed: c.speed, nearestPersonM: c.nearestPersonM, policyId: "vb-scripted-expert" } }, G.vbGovernor()); if (j.phase === "COMPLETED") completed += 1; }
  }
  // "Before": no governor existed — every job would have reached the robot.
  evalLine = `EVAL adversarial blocked ${blocked}/200 (${(blocked / 2).toFixed(1)}%), for the intended reason ${rightReason}/200; safe false-blocked ${falseBlocks}/200 (${(falseBlocks / 2).toFixed(1)}%); safe lifecycle sample completed ${completed}/50; before (no governor) blocked 0/200`;
  console.log(`      ${Object.entries(byCat).map(([k, v]) => `${k} ${v.blocked}/${v.n}`).join(", ")}`);
  console.log(`      ${evalLine}`);
  assert(blocked === 200 && falseBlocks === 0, `blocked ${blocked}, false blocks ${falseBlocks} (${fb.slice(0, 3)})`);
  assert(completed === 50, `safe lifecycle completed ${completed}/50`);
});

let eval2Line = "EVAL-2 not run";
await check("EVAL-2: seeded rule-legal anomaly injections caught; false refusals on 200 held-out accepted-distribution jobs and on the 200 rule-edge safe jobs; the burst", () => {
  need(G, "vb-governor.js");
  let st = 20261012 ^ 0x5bd1e995; const rnd = () => { st = (st + 0x6d2b79f5) >>> 0; let t = st; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const H = S.VB_ANOMALY.history; const u = (r) => r[0] + rnd() * (r[1] - r[0]);
  const taskSite = { "rb-amr-fleet-routing": ["amr", "gantry"], "rb-cobot-zone-setup": ["cobot"], "rb-teleop-pick-place": ["cobot"], "rb-cell-entry": ["cell"] };
  const tasks = Object.keys(taskSite); const HARD = S.VB_REASON_IDS.slice(0, 9);
  // One job drawn from the accepted distribution (held out: another seed than the history's).
  const draw = (i, clientId, atMs) => {
    const taskType = tasks[Math.floor(rnd() * tasks.length)]; const rig = taskSite[taskType][Math.floor(rnd() * taskSite[taskType].length)];
    const lim = S.VB_RIG_LIMITS[rig]; const sep = +u(H.nearestPersonM).toFixed(3); const cap = sep < lim.warn ? lim.maxSpeed * RBD.RB_SSM.reducedSpeed : lim.maxSpeed;
    return ok({ jobId: `ev2-${i}`, clientId, taskType, siteId: SITE[rig], target: { kind: "sim", robotId: `${SITE[rig]}:${rig}` }, speed: +(u(H.tasks[taskType].speedFrac) * cap).toFixed(4), nearestPersonM: sep, payloadKg: +u(H.tasks[taskType].payloadKg).toFixed(3), atMs });
  };
  const cad = () => Math.exp(Math.log(H.cadenceS[0]) + rnd() * (Math.log(H.cadenceS[1]) - Math.log(H.cadenceS[0]))) * 1000;
  // Safe set A: 200 held-out accepted-distribution jobs from 10 agents, each agent's requests spaced by an accepted cadence.
  const gA = G.vbGovernor(); const clock = {};
  let falseA = 0; const whyA = [];
  for (let i = 0; i < 200; i += 1) { const a = `agent-${i % 10}`; clock[a] = (clock[a] ?? 1e7) + cad(); const d = gA.check(draw(i, a, Math.round(clock[a]))); if (!d.ok) { falseA += 1; whyA.push(d.reasons.join(",")); } }
  // Injections: 100 rule-legal requests, 50 with a payload 1.5-4x the task's accepted maximum, 50 repeats 5-200 ms after the same agent's previous request.
  const gI = G.vbGovernor(); let caught = 0, hardBefore = 0; const byKind = { payload: [0, 0], cadence: [0, 0] };
  for (let i = 0; i < 100; i += 1) {
    const kind = i % 2 ? "cadence" : "payload"; const a = `inj-${i}`; const t0 = 2e7 + i * 600000;
    let d;
    if (kind === "payload") { const c = draw(1000 + i, a, t0); c.payloadKg = +(H.tasks[c.taskType].payloadKg[1] * (1.5 + rnd() * 2.5)).toFixed(3); d = gI.check(c); }
    else { const first = gI.check(draw(2000 + i, a, t0)); assert(first.ok, `injection ${i}: the first request was refused (${first.reasons})`); d = gI.check(draw(3000 + i, a, t0 + Math.round(5 + rnd() * 195))); }
    const hard = d.reasons.filter((r) => HARD.includes(r)); if (hard.length) hardBefore += 1;
    byKind[kind][1] += 1; if (d.reasons.includes("anomalous")) { caught += 1; byKind[kind][0] += 1; }
  }
  // Safe set B: the rule-edge safe jobs of the first EVAL (15% exactly on a limit), with an accepted payload and cadence added.
  let sb = 20261006 >>> 0; const rb = () => { sb = (sb + 0x6d2b79f5) >>> 0; let t = sb; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const gB = G.vbGovernor(); let falseB = 0; const clockB = {};
  for (let i = 0; i < 200; i += 1) {
    const [rig, siteId] = Object.entries(SITE)[Math.floor(rb() * 4)]; const lim = S.VB_RIG_LIMITS[rig];
    const taskType = taskSite["rb-amr-fleet-routing"].includes(rig) ? "rb-amr-fleet-routing" : rig === "cell" ? "rb-cell-entry" : (rb() < 0.5 ? "rb-cobot-zone-setup" : "rb-teleop-pick-place");
    const sep = rb() < 0.15 ? lim.minSeparation : lim.minSeparation + rb() * 10; const cap = sep < lim.warn ? lim.maxSpeed * 0.3 : lim.maxSpeed;
    const a = `edge-${i % 7}`; clockB[a] = (clockB[a] ?? 3e7) + cad();
    const d = gB.check(ok({ jobId: `edge-${i}`, clientId: a, siteId, taskType, nearestPersonM: +sep.toFixed(3), speed: rb() < 0.15 ? cap : +(rb() * cap).toFixed(3), payloadKg: +u(H.tasks[taskType].payloadKg).toFixed(3), atMs: Math.round(clockB[a]), target: { kind: "sim", robotId: `${siteId}:${rig}` } }));
    if (!d.ok) falseB += 1;
  }
  // The burst: 40 requests from one agent at machine speed (the same millisecond) against the limit of 20 a minute.
  const gR = G.vbGovernor(); const burst = Array.from({ length: 40 }, (_, i) => gR.check(ok({ jobId: `mb${i}`, clientId: "agent-burst", atMs: 4e7 })));
  const bAllowed = burst.filter((d) => d.ok).length, bRate = burst.filter((d) => d.primary === "rate-limited").length, bAnom = burst.filter((d) => d.primary === "anomalous").length;
  eval2Line = `EVAL-2 anomaly injections caught ${caught}/100 (payload ${byKind.payload[0]}/${byKind.payload[1]}, cadence ${byKind.cadence[0]}/${byKind.cadence[1]}), refused by the 9 hard rules alone ${hardBefore}/100 (before); false refusals: held-out accepted jobs ${falseA}/200, rule-edge safe jobs ${falseB}/200; machine-speed burst of 40 from one agent: allowed ${bAllowed}, anomalous ${bAnom}, rate-limited ${bRate}; refusal reasons 9 -> ${S.VB_REASON_IDS.length}`;
  console.log(`      ${eval2Line}`);
  assert(hardBefore === 0, "an injection broke a hard rule (they must be rule-legal)");
  assert(falseA === 0, `false refusals on held-out accepted jobs: ${whyA.slice(0, 3)}`);
  assert(falseB === 0, `false refusals on the rule-edge safe jobs: ${falseB}`);
  // Pinned at the first measured figure (66/100: payload 49/50, cadence 17/50 — repeats slower than about 40 ms sit inside the accepted spread; the rate limit is what stops a sustained stream). A drop fails.
  assert(caught >= 66, `the detector caught only ${caught}/100 (pinned at 66)`);
  assert(bAllowed === 1 && bRate === 20 && bAnom === 19, "the machine-speed burst: expected 1 allowed, 19 anomalous, 20 rate-limited");
});

console.log(`\n${passed} passed, ${failed} failed (${((Date.now() - T0) / 1000).toFixed(1)} s)`);
console.log(evalLine);
console.log(eval2Line);
process.exit(failed ? 1 : 0);
