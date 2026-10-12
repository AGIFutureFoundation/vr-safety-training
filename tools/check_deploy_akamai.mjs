/**
 * The Akamai Cloud deploy path and the GPU training job (console AKAMAI, docs/deploy-akamai.md).
 *
 *     node tools/check_deploy_akamai.mjs
 *
 * 1. Both deploy workflows are gated on their secrets, proven by running each probe step under bash with the
 *    secrets absent (have_secrets=false), partly present (false) and present (true); every other job needs the probe
 *    and runs only on true, so a run without secrets executes one step that writes one output and nothing else.
 *    The Akamai workflow is started by hand only, and its deploy job runs the checker suite before the agent.
 * 2. The deploy agent's plan: build → gate → preflight → snapshot → upload → verify → rollback, the five verify
 *    assertions, Cache-Control from the generated _headers for every file, redirects that shadow nothing, the CDN
 *    header list equal to the "/*" rule.
 * 3. The agent and the training job default to a dry run: run with a trapped fetch and a PATH of recording shims,
 *    without credentials, with fake ones and with --apply but names absent, they exit 0, make no request and start no
 *    process (read-only local git queries excepted); the job refuses an uncommitted, already-run or already-measured
 *    declaration before it calls anything.
 * 4. No token or key literal anywhere in the repository (tracked and untracked text files): no credential name
 *    assigned a literal, no API client token shape, no private key block; the Akamai files also carry nothing shaped
 *    like a token or a 32/64-hex id; no .mcp.json, .env or .edgerc tracked.
 * 5. .mcp.json.example: the akamai-cloud-mcp server via uvx, LINODE_TOKEN from the environment.
 * 6. docs/deploy-akamai.md names every variable the agent and the job read, covers setup, CDN, headers, rollback and
 *    the MCP server, states no price; docs/README.md lists both deploy targets.
 */
import { existsSync, readFileSync, writeFileSync, mkdtempSync, mkdirSync, chmodSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { cfParseHeaders, cfParseRedirects, cfFindSecret } from "./cf-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let failures = 0, passes = 0;
function check(ok, what, detail = "") { if (ok) { passes += 1; return true; } failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`); return false; }
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const TMP = mkdtempSync(join(tmpdir(), "ak-check-"));

// ------------------------------------------------------------------ 1. the workflows' secret gating
function akLoadYaml(path) {
  const r = spawnSync("python3", ["-c", "import sys,json,yaml; d=yaml.safe_load(open(sys.argv[1])); d['on']=d.get('on', d.get(True)); d.pop(True, None); print(json.dumps(d))", join(ROOT, path)], { encoding: "utf8" });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}
/** Run a probe step's script under bash with each env expression replaced by "true"/"false"; return have_secrets. */
function akRunProbe(step, truth) {
  const out = join(TMP, `out-${Math.random().toString(36).slice(2)}`);
  writeFileSync(out, "");
  const env = { PATH: process.env.PATH, GITHUB_OUTPUT: out };
  for (const [k, v] of Object.entries(step.env ?? {})) env[k] = truth(k, String(v)) ? "true" : "false";
  const r = spawnSync("bash", ["-euo", "pipefail", "-c", step.run], { env, encoding: "utf8" });
  const m = readFileSync(out, "utf8").match(/^have_secrets=(\w+)$/m);
  return { status: r.status, value: m ? m[1] : null };
}
const gated = [];
for (const [file, secretNames] of [[".github/workflows/deploy-cloudflare.yml", ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]], [".github/workflows/deploy-akamai.yml", ["LINODE_TOKEN", "AK_S3_ACCESS_KEY_ID", "AK_S3_SECRET_ACCESS_KEY"]]]) {
  const wf = akLoadYaml(file);
  if (!check(!!wf, `${file} parses as YAML`)) continue;
  const probeJob = wf.jobs?.secrets;
  const probe = probeJob?.steps?.find((s) => s.id === "probe");
  check(!!probe && probeJob.steps.length === 1 && !probe.uses && probeJob.outputs?.have_secrets?.includes("steps.probe.outputs.have_secrets"), `${file}: the first job is one probe step that only sets have_secrets`);
  if (!probe) continue;
  const envText = JSON.stringify(probe.env ?? {});
  for (const n of secretNames) check(new RegExp(`secrets\\.${n} != ''`).test(envText), `${file}: the probe asks whether ${n} is set`);
  const none = akRunProbe(probe, () => false);
  const all = akRunProbe(probe, () => true);
  const partial = akRunProbe(probe, (k, v) => v.includes(`secrets.${secretNames[0]}`));
  check(none.status === 0 && none.value === "false", `${file}: with the secrets absent the probe writes have_secrets=false and exits 0`, JSON.stringify(none));
  check(partial.status === 0 && partial.value === "false", `${file}: with only ${secretNames[0]} set the probe still writes false`, JSON.stringify(partial));
  check(all.status === 0 && all.value === "true", `${file}: with every secret set the probe writes have_secrets=true`, JSON.stringify(all));
  const others = Object.entries(wf.jobs).filter(([id]) => id !== "secrets");
  const allGated = others.length > 0 && others.every(([, j]) => [].concat(j.needs ?? []).includes("secrets") && /^\$\{\{\s*needs\.secrets\.outputs\.have_secrets == 'true'\s*\}\}$/.test(String(j.if ?? "")));
  check(allGated, `${file}: every other job needs the probe and runs only when have_secrets is 'true'`);
  // What a run without secrets executes: the jobs whose condition holds when have_secrets is false.
  const runs = Object.entries(wf.jobs).filter(([id, j]) => id === "secrets" || !String(j.if ?? "").includes("have_secrets == 'true'"));
  check(runs.length === 1 && runs[0][0] === "secrets", `${file}: a run without secrets executes the probe job only (1 step, no checkout, no deploy)`, runs.map(([id]) => id).join(", "));
  if (none.value === "false" && all.value === "true" && allGated && runs.length === 1) gated.push(file);
  for (const [id, j] of others) {
    const steps = (j.steps ?? []).map((s) => `${s.run ?? ""} ${s.uses ?? ""}`);
    const suite = steps.findIndex((s) => /node tools\/check_all\.mjs/.test(s));
    const agent = steps.findIndex((s) => /(deploy_agent|ak_deploy)\.mjs --apply/.test(s));
    check(suite >= 0 && agent > suite, `${file} (${id}): the checker suite runs before the agent uploads`);
  }
}
{
  const wf = akLoadYaml(".github/workflows/deploy-akamai.yml");
  if (wf) {
    const on = wf.on ?? {};
    check(on && typeof on === "object" && Object.keys(on).length === 1 && "workflow_dispatch" in on, "deploy-akamai.yml is started by hand only (no push or pull_request trigger): off the default path");
    const step = wf.jobs?.deploy?.steps?.find((s) => /ak_deploy\.mjs --apply/.test(s.run ?? ""));
    const env = step?.env ?? {};
    check(["LINODE_TOKEN", "AK_S3_ACCESS_KEY_ID", "AK_S3_SECRET_ACCESS_KEY"].every((n) => env[n] === `\${{ secrets.${n} }}`), "the agent step takes the three credentials from GitHub secrets by name");
    check(["AK_BUCKET", "AK_REGION", "AK_S3_ENDPOINT", "AK_CDN_HOSTNAME"].every((n) => env[n] === `\${{ vars.${n} }}`), "the agent step takes the bucket, region, endpoint and CDN hostname from repository variables");
    check(/--skip-build --skip-gate/.test(step?.run ?? "") && wf.jobs.deploy.steps.some((s) => /bundle_webxr\.py/.test(s.run ?? "")), "the workflow builds once and gates once, before the agent");
  }
}

// ------------------------------------------------------------------ 2. the deploy agent's plan
const ak = await import(join(ROOT, "tools/ak_deploy.mjs"));
check(JSON.stringify(ak.AK_STEPS.map((s) => s.id)) === JSON.stringify(["build", "gate", "preflight", "snapshot", "upload", "verify", "rollback"]), "the agent's plan is build → gate → preflight → snapshot → upload → verify → rollback", ak.AK_STEPS.map((s) => s.id).join(" → "));
check(JSON.stringify(ak.AK_VERIFY.map((v) => v.id)) === JSON.stringify(["homepage", "bundle", "config", "headers", "sitemap"]), "the verify step's assertions are the homepage, a bundle, auth-config.json, the security headers and the sitemap count");
check(ak.akParseArgs([]).apply === false, "the deploy agent defaults to a dry run");
{
  const src = read("tools/ak_deploy.mjs");
  const verifyFn = src.slice(src.indexOf("async function akVerify"), src.indexOf("export async function akRun"));
  check(/smartcity-x\.html/.test(verifyFn) && /auth-config\.json/.test(verifyFn) && /content-security-policy/.test(verifyFn) && /x-content-type-options/.test(verifyFn) && /referrer-policy/.test(verifyFn) && /sitemap\.xml/.test(verifyFn) && /<title>/.test(verifyFn) && /1024 \* 1024/.test(verifyFn), "akVerify runs exactly those assertions");
  const run = src.slice(src.indexOf("export async function akRun"));
  const iGate = run.indexOf('"tools/check_all.mjs"'), iSnap = run.indexOf(`${"`${B}/${AK_ROLLBACK_PREFIX}`"}`), iUp = run.indexOf('"--cache-control", g.cacheControl'), iRb = run.lastIndexOf(`${"`${B}/${AK_ROLLBACK_PREFIX}`"}, ${"`${B}/`"}`);
  check(iGate > 0 && iSnap > iGate && iUp > iSnap, "in the apply path the gate runs before the snapshot, and the snapshot before the upload");
  check(iRb > iUp && /if \(snapshot\)/.test(run) && /catch \(e\)/.test(run), "a failure after the snapshot (upload or verify) syncs the snapshot back: rollback exists");
  check(!/console\.log\([^)]*process\.env\.(LINODE_TOKEN|AK_S3_SECRET_ACCESS_KEY|AK_S3_ACCESS_KEY_ID)/.test(src) && !/"--(access|secret)[-_]key/.test(src), "the agent never prints a credential or puts one in an argv");
}
const plan = ak.akPlan(ak.akParseArgs([]));
const headerRules = cfParseHeaders(read("WebXR/dist/_headers"));
const files = ak.akDistFiles();
check(plan.files === files.length && files.length > 100 && plan.groups.reduce((n, g) => n + g.files.length, 0) === files.length, "every file of WebXR/dist is in exactly one Cache-Control group", `${files.length} files, ${plan.groups.length} groups`);
const ccOf = (f) => ak.akCacheFor(f, headerRules);
check(ccOf("index.html") === "no-store" && ccOf("auth-config.json") === "no-store" && ccOf("sitemap.xml") === "no-store", "the homepage, auth-config.json and the sitemap upload as no-store, as _headers gives them");
check(/max-age=0, must-revalidate/.test(ccOf("smartcity-x.html")) && /max-age=0, must-revalidate/.test(ccOf("holodeck.html")), "the bundles upload as revalidate-every-load");
const sharedFile = files.find((f) => f.startsWith("shared/")), vendorFile = files.find((f) => f.startsWith("vendor/")), trackImg = files.find((f) => f.startsWith("tracks/img/")), trackPage = files.find((f) => f.startsWith("tracks/") && !f.startsWith("tracks/img/"));
check(!sharedFile || /max-age=3600/.test(ccOf(sharedFile)), "shared/* uploads with an hour's revalidating cache", sharedFile);
check(!vendorFile || /immutable/.test(ccOf(vendorFile)), "vendor/* uploads as immutable", vendorFile);
check((!trackImg || /immutable/.test(ccOf(trackImg))) && (!trackPage || ccOf(trackPage) === "no-store"), "the most specific rule wins (tracks/img/* immutable, tracks/* no-store)");
const red = ak.akRedirects(cfParseRedirects(read("WebXR/dist/_redirects")));
check(red.objects.length > 0 && red.objects.every((r) => !files.includes(r.key) && !r.key.startsWith(ak.AK_ROLLBACK_PREFIX) && files.includes(r.to.slice(1))), "every redirect object shadows no real file and points at one", `${red.objects.length} objects`);
check(red.cdn.every((r) => /\*/.test(r.from)), "only wildcard redirects are left for the CDN property", red.cdn.map((r) => r.from).join(", "));
check(JSON.stringify(plan.security) === JSON.stringify(headerRules.find((r) => r.path === "/*").headers), "the CDN header list is exactly the '/*' rule of _headers (the same headers Cloudflare serves)");
const planText = ak.akPlanText(plan, {});
check(!cfFindSecret(planText) && /\$LINODE_TOKEN/.test(planText) && /«AK_BUCKET»/.test(planText), "the plan names credentials by variable name only");

// ------------------------------------------------------------------ 3. dry runs: no request, no process
const SHIM = join(TMP, "bin");
mkdirSync(SHIM);
const CALLS = join(TMP, "calls.log");
const realGit = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).stdout.trim();
for (const n of ["aws", "ssh", "scp", "python3", "node", "curl", "npx", "uvx", "linode-cli", "bash", "sh"]) {
  writeFileSync(join(SHIM, n), `#!/bin/sh\necho "${n} $*" >> "${CALLS}"\nexit 1\n`);
  chmodSync(join(SHIM, n), 0o755);
}
// git: recorded; read-only local queries pass through so the declaration gate can answer.
writeFileSync(join(SHIM, "git"), `#!/bin/sh\necho "git $*" >> "${CALLS}"\ncase "$1" in ls-files|diff|rev-parse) exec "${realGit}" "$@";; esac\nexit 1\n`);
chmodSync(join(SHIM, "git"), 0o755);
// Built at run time so this file carries nothing shaped like a credential.
const FAKE = { LINODE_TOKEN: "fake" + "0f".repeat(30), AK_S3_ACCESS_KEY_ID: "FAKEKEY" + "X".repeat(13), AK_S3_SECRET_ACCESS_KEY: "fake/" + "Zz".repeat(18) };
const VARS = { AK_BUCKET: "example-bucket", AK_REGION: "example-region", AK_S3_ENDPOINT: "objects.example.invalid", AK_CDN_HOSTNAME: "train.example.invalid" };
const TRAINVARS = { AK_TRAIN_TYPE: "example-type", AK_TRAIN_REGION: "example-region", AK_TRAIN_IMAGE: "example-image", AK_TRAIN_SSH_PUBKEY: join(TMP, "k.pub"), AK_TRAIN_SSH_KEY: join(TMP, "k") };
writeFileSync(TRAINVARS.AK_TRAIN_SSH_PUBKEY, "ssh-ed25519 example\n");
writeFileSync(TRAINVARS.AK_TRAIN_SSH_KEY, "example\n");
const baseEnv = { HOME: process.env.HOME ?? TMP, PATH: SHIM };
function akSpy(modPath, runExpr, args, env) {
  writeFileSync(CALLS, "");
  const spy = `
    let calls = 0; globalThis.fetch = async () => { calls += 1; throw new Error("request in a dry run"); };
    const m = await import(${JSON.stringify(join(ROOT, modPath))});
    const code = await ${runExpr};
    console.log(JSON.stringify({ code, calls, exitCode: process.exitCode ?? 0 }));`;
  const r = spawnSync(process.execPath, ["--input-type=module", "-e", spy, "--", ...args], { cwd: ROOT, encoding: "utf8", env });
  let res = null; try { res = JSON.parse(r.stdout.trim().split("\n").pop()); } catch { res = null; }
  const procs = readFileSync(CALLS, "utf8").split("\n").filter(Boolean);
  return { r, res, procs, nonGit: procs.filter((l) => !/^git (ls-files|diff|rev-parse) /.test(l)), out: r.stdout };
}
const agentLog = join(TMP, "ak-run.md");
for (const [label, env, args] of [
  ["without credentials", baseEnv, []],
  ["with fake credentials and variables", { ...baseEnv, ...FAKE, ...VARS }, []],
  ["--apply without credentials", { ...baseEnv, ...VARS }, ["--apply"]],
  ["--apply with credentials but no variables", { ...baseEnv, ...FAKE }, ["--apply"]],
]) {
  const s = akSpy("tools/ak_deploy.mjs", `m.akRun(m.akParseArgs(["--log", ${JSON.stringify(agentLog)}, ...process.argv.slice(1)]), process.env)`, args, env);
  check(s.r.status === 0 && s.res?.code === 0 && s.res.calls === 0 && s.procs.length === 0, `the deploy agent ${label} exits 0, makes no request and starts no process`, (s.r.stderr || "").trim().split("\n").pop() || JSON.stringify({ res: s.res, procs: s.procs }));
  const log = existsSync(agentLog) ? readFileSync(agentLog, "utf8") : "";
  check(log.includes("## 7. Roll back") && log.includes("not executed") && Object.values(FAKE).every((v) => !log.includes(v)) && !cfFindSecret(log), `the agent's log ${label} holds the whole plan and no credential value`);
}
const job = await import(join(ROOT, "deploy/akamai/ak-robot-train.mjs"));
check(job.akTrainParseArgs([]).apply === false && job.akTrainParseArgs([]).discover === false, "the training job defaults to a dry run (1 of 1 job scripts)");
for (const [label, env, args] of [
  ["without a token", baseEnv, []],
  ["with a fake token and every name, no flag", { ...baseEnv, LINODE_TOKEN: FAKE.LINODE_TOKEN, ...TRAINVARS }, []],
  ["--apply without a token", { ...baseEnv, ...TRAINVARS }, ["--apply"]],
  ["--apply with a token but names absent", { ...baseEnv, LINODE_TOKEN: FAKE.LINODE_TOKEN }, ["--apply"]],
  ["--discover without a token", baseEnv, ["--discover"]],
]) {
  const s = akSpy("deploy/akamai/ak-robot-train.mjs", "m.akTrainRun(m.akTrainParseArgs(process.argv.slice(1)), process.env)", args, env);
  check(s.r.status === 0 && s.res?.code === 0 && s.res.calls === 0 && s.nonGit.length === 0, `the training job ${label} exits 0, makes no request and starts no process`, (s.r.stderr || "").trim().split("\n").pop() || JSON.stringify({ res: s.res, procs: s.nonGit }));
  check(!s.out.includes(FAKE.LINODE_TOKEN), `the training job ${label} prints no token`);
}
{
  // An uncommitted declaration, with --apply, a fake token and every name: refused before any request or process.
  const decl = join(TMP, "declared.json");
  writeFileSync(decl, JSON.stringify({ protocol: { version: "check/1", seeds: { gym: "1–2" } } }));
  const s = akSpy("deploy/akamai/ak-robot-train.mjs", "m.akTrainRun(m.akTrainParseArgs(process.argv.slice(1)), process.env)", ["--apply", "--declaration", decl], { ...baseEnv, LINODE_TOKEN: FAKE.LINODE_TOKEN, ...TRAINVARS });
  check(s.res?.code === 1 && s.res.calls === 0 && s.nonGit.length === 0 && /refused/.test(s.out) && /not committed/.test(s.out), "--apply on an uncommitted declaration is refused with no request and no process", JSON.stringify({ res: s.res, procs: s.nonGit }));
  check(!existsSync(job.AK_TRAIN_LEDGER) || !readFileSync(job.AK_TRAIN_LEDGER, "utf8").includes("check/1"), "a refused run writes no ledger entry");
  // The ledger and committed results each refuse a second look at the same declaration.
  const text = readFileSync(decl, "utf8");
  const sha = (await import("node:crypto")).createHash("sha256").update(text).digest("hex");
  const ledger = join(TMP, "runs.jsonl");
  writeFileSync(ledger, JSON.stringify({ declarationSha256: sha, started: "earlier" }) + "\n");
  const results = join(TMP, "arena.json");
  writeFileSync(results, JSON.stringify({ version: "check/1" }));
  const g = job.akTrainDeclarationGate(decl, { ledger, results });
  check(!g.ok && g.reasons.some((r) => /already ran/.test(r)), "a declaration already in the ledger is refused: it runs once");
  check(!g.ok && g.reasons.some((r) => /measured once/.test(r)), "a declaration whose protocol version already has committed results is refused");
  check(job.akTrainDeclarationGate(join(TMP, "absent.json")).ok === false, "a missing declaration is refused");
  const remote = job.akTrainRemoteScript({});
  check(/arena_eval\.mjs/.test(remote) && /timeout \d+m/.test(remote) && !cfFindSecret(remote) && !/LINODE_TOKEN/.test(remote), "the remote script runs the arena under a time limit and carries no credential");
  const src = read("deploy/akamai/ak-robot-train.mjs");
  check(/finally\s*\{[\s\S]*DELETE[\s\S]*linode\/instances/.test(src) && /status === 404/.test(src), "the instance is destroyed in a finally block and the destroy is confirmed by a 404");
  check(src.indexOf("appendFileSync(AK_TRAIN_LEDGER") < src.indexOf('akTrainApi("POST", "/linode/instances"'), "the ledger entry is written before the instance is created");
}

// ------------------------------------------------------------------ 4. no token or key literal anywhere
{
  const CRED_NAMES = "LINODE_TOKEN|LINODE_TOKEN_READONLY|LINODE_CLI_TOKEN|AK_S3_ACCESS_KEY_ID|AK_S3_SECRET_ACCESS_KEY|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AKAMAI_CLIENT_TOKEN|AKAMAI_CLIENT_SECRET|AKAMAI_ACCESS_TOKEN|CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|PAYMENTS_WEBHOOK_SECRET";
  const PATTERNS = [
    ["a credential name assigned a literal", `(${CRED_NAMES})["']?\\s*[=:]\\s*["']?[A-Za-z0-9+/_-]{12,}`],
    ["an API client token shape", "akab-[a-z0-9]{16}-[a-z0-9]{16}"],
    ["an .edgerc secret line", "^\\s*client_secret\\s*=\\s*[A-Za-z0-9+/=]{20,}"],
    ["a private key block", "-----BEGIN [A-Z ]*PRIVATE KEY-----"],
    ["an S3-style access key id", "\\bAKIA[0-9A-Z]{16}\\b"],
  ];
  let hits = 0;
  for (const [name, re] of PATTERNS) {
    const r = spawnSync(realGit || "git", ["grep", "-I", "-n", "--untracked", "-E", "-e", re, "--", ".", ":!tools/check_deploy_akamai.mjs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const lines = (r.stdout || "").split("\n").filter(Boolean);
    hits += lines.length;
    check(r.status === 1 && lines.length === 0, `no ${name} in any text file of the repository`, lines.slice(0, 3).map((l) => l.slice(0, 120)).join(" | "));
  }
  const counted = spawnSync(realGit || "git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).stdout.split("\n").filter(Boolean);
  check(!counted.some((f) => /(^|\/)(\.mcp\.json|\.env|\.edgerc|\.linode-cli|linode-cli)$/.test(f)), "no .mcp.json, .env, .edgerc or linode-cli config is in the tree");
  const AK_FILES = ["tools/ak_deploy.mjs", ".github/workflows/deploy-akamai.yml", "deploy/akamai/ak-robot-train.mjs", "deploy/akamai/robot-train.md", "docs/deploy-akamai.md", ".mcp.json.example", "tools/check_deploy_akamai.mjs"];
  for (const f of AK_FILES) {
    if (!check(existsSync(join(ROOT, f)), `${f} exists`)) continue;
    const t = read(f);
    const hit = cfFindSecret(t);
    check(!hit && !/\b[0-9a-f]{64}\b/.test(t), `${f} carries nothing shaped like a token or a 32/64-hex id`, hit ? `${hit.name} (${hit.sample})` : "");
  }
  console.log(`token literals in the repository: ${hits} (in ${counted.length} files scanned by git grep)`);
}

// ------------------------------------------------------------------ 5. the MCP example
{
  let mcp = null;
  try { mcp = JSON.parse(read(".mcp.json.example")); } catch (e) { check(false, ".mcp.json.example parses", e.message); }
  const s = mcp?.mcpServers?.["akamai-cloud"];
  check(s?.command === "uvx" && JSON.stringify(s.args) === JSON.stringify(["akamai-cloud-mcp"]), ".mcp.json.example runs akamai-cloud-mcp through uvx");
  check(/^\$\{[A-Z_]+\}$/.test(s?.env?.LINODE_TOKEN ?? "") && Object.keys(s?.env ?? {}).length === 1, "the server's LINODE_TOKEN is expanded from the environment, never a literal", s?.env?.LINODE_TOKEN);
}

// ------------------------------------------------------------------ 6. the docs
{
  const doc = read("docs/deploy-akamai.md");
  for (const n of [...ak.AK_CREDENTIALS, ...ak.AK_VARIABLES, ...job.AK_TRAIN_REQUIRED, "LINODE_TOKEN_READONLY"]) check(doc.includes(n), `docs/deploy-akamai.md names ${n}`);
  for (const k of ["read-only token", "separately scoped token", "Object Storage", "CDN", "Cache-Control", "Content-Security-Policy", "rollback", "verify", "claude mcp add", "uvx akamai-cloud-mcp", ".mcp.json.example", "not enabled", "api.linode.com", "deploy/akamai/robot-train.md"]) check(doc.toLowerCase().includes(k.toLowerCase()), `docs/deploy-akamai.md covers "${k}"`);
  for (const f of [doc, read("deploy/akamai/robot-train.md")]) check(!/\$\s?\d|\d+(\.\d+)?\s?(USD|EUR|per hour|\/hr|\/mo|per month)/i.test(f), "the Akamai docs state no price");
  const idx = read("docs/README.md");
  const targets = (idx.match(/\]\(deploy-[a-z]+\.md\)/g) || []).map((m) => m.slice(2, -1));
  check(targets.includes("deploy-cloudflare.md") && targets.includes("deploy-akamai.md"), "docs/README.md lists both deployment targets", targets.join(", "));
  console.log(`deploy targets documented: ${new Set(targets).size} (${[...new Set(targets)].join(", ")}); workflows gated on their secrets: ${gated.length} (${gated.map((f) => f.split("/").pop()).join(", ")})`);
}

if (failures) { console.log(`\n${failures} Akamai deploy check(s) failed, ${passes} passed.`); process.exit(1); }
console.log(`All Akamai deploy checks pass: ${passes} checks, ${ak.AK_STEPS.length} plan steps, ${ak.AK_VERIFY.length} verify assertions, ${plan.groups.length} cache groups, ${red.objects.length} redirect objects, 2 workflows gated, job dry run by default.`);
