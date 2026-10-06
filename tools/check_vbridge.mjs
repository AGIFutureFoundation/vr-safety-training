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
 *  EVAL: 200 seeded adversarial jobs blocked share, 200 safe jobs false-block rate.
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

await check("4. every governor rejection reason fires alone, as the primary reason (9 reasons)", () => {
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
  };
  const fired = [];
  for (const [reason, cmd] of Object.entries(cases)) {
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

console.log(`\n${passed} passed, ${failed} failed (${((Date.now() - T0) / 1000).toFixed(1)} s)`);
console.log(evalLine);
process.exit(failed ? 1 : 0);
