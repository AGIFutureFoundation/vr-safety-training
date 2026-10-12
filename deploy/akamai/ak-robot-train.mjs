#!/usr/bin/env node
/**
 * The robot training job on an hourly GPU instance on Akamai Cloud (console AKAMAI, deploy/akamai/robot-train.md).
 *
 *     node deploy/akamai/ak-robot-train.mjs                # dry run (default): prints the plan, calls nothing, exits 0
 *     node deploy/akamai/ak-robot-train.mjs --discover     # read-only: lists the account's instance types and regions (needs LINODE_TOKEN)
 *     node deploy/akamai/ak-robot-train.mjs --apply        # provisions, runs, copies back, destroys — needs LINODE_TOKEN and every AK_TRAIN_* name
 *     --declaration <file>   the declared protocol (default docs/evals/arena-declared.json; must be committed and unmodified)
 *     --log <file>           where the run log goes (default: stdout only)
 *
 * What it does with --apply (AK_TRAIN_STEPS): preflight → declare → provision → wait → run → collect → destroy.
 * The declared-protocol rules hold: the declaration file is committed before the run; its sha256 is appended to the
 * ledger (deploy/akamai/runs.jsonl) BEFORE the instance is created, so a declaration runs once — a second --apply on
 * the same declaration is refused, and so is one whose protocol version already has committed results in
 * docs/evals/arena.json (those held-out seeds were measured once already). The instance receives the exact commit
 * (`git archive`), runs `node tools/arena_eval.mjs` (the arena and the small model's training, which refuse on their
 * own if the code differs from the declaration), and the eval JSON is copied back under deploy/akamai/out/<declaration
 * sha256, first 12>/. It never overwrites docs/evals/arena.json: the owner reads the result and decides what to commit.
 * The instance is destroyed in a finally block whatever happened, and the destroy is confirmed by a 404.
 *
 * Environment (by name only; nothing defaults to an account value, nothing is printed):
 *   LINODE_TOKEN             personal access token with Linodes read/write (a separate token from the read-only one)
 *   AK_TRAIN_TYPE            the instance type id (a GPU plan from --discover; the arena itself is CPU-only Node today)
 *   AK_TRAIN_REGION          a region id from --discover where that type is offered
 *   AK_TRAIN_IMAGE           an image id (an Ubuntu LTS image from Cloud Manager's image list)
 *   AK_TRAIN_SSH_PUBKEY      path to the public key installed on the instance
 *   AK_TRAIN_SSH_KEY         path to the matching private key, used by ssh and scp from this machine
 *   AK_TRAIN_MAX_MINUTES     optional: the remote run's time limit (default 120); the instance is destroyed after it
 *   AK_TRAIN_NODE_VERSION    optional: the Node.js release installed on the instance (default 22.11.0)
 */
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, mkdtempSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const AK_TRAIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const AK_TRAIN_API = "https://api.linode.com/v4";
export const AK_TRAIN_LEDGER = join(AK_TRAIN_ROOT, "deploy", "akamai", "runs.jsonl");
export const AK_TRAIN_OUT = join(AK_TRAIN_ROOT, "deploy", "akamai", "out");
export const AK_TRAIN_TAG = "smartciti-x-robot-train";
export const AK_TRAIN_REQUIRED = ["LINODE_TOKEN", "AK_TRAIN_TYPE", "AK_TRAIN_REGION", "AK_TRAIN_IMAGE", "AK_TRAIN_SSH_PUBKEY", "AK_TRAIN_SSH_KEY"];
/** The remote commands: the arena (which trains the small model before it runs it) on the declared held-out seeds. */
export const AK_TRAIN_REMOTE = ["node tools/arena_eval.mjs --quiet"];
/** The files copied back as the run's eval JSON. */
export const AK_TRAIN_COLLECT = ["docs/evals/arena.json"];

export const AK_TRAIN_STEPS = [
  { id: "preflight", what: "LINODE_TOKEN and every AK_TRAIN_* name present; the declaration committed and unmodified; tools/arena_eval.mjs in the tree; the declaration not already run (ledger) and its protocol version not already measured (docs/evals/arena.json)" },
  { id: "declare", what: "append { declaration sha256, commit, started } to deploy/akamai/runs.jsonl before anything is created — the run counts as the one run from here on" },
  { id: "provision", what: `POST ${AK_TRAIN_API}/linode/instances with type $AK_TRAIN_TYPE, region $AK_TRAIN_REGION, image $AK_TRAIN_IMAGE, the public key, tag ${AK_TRAIN_TAG}, a one-time root password generated here and never written anywhere` },
  { id: "wait", what: "GET the instance until its status is running, then until ssh answers" },
  { id: "run", what: "install the pinned Node.js release; send the exact commit with git archive; run the arena under `timeout` $AK_TRAIN_MAX_MINUTES" },
  { id: "collect", what: "scp docs/evals/arena.json back to deploy/akamai/out/<sha12>/ with run.json (commit, declaration, exit code, start and end times)" },
  { id: "destroy", what: "DELETE the instance — always, in a finally block — and confirm the GET answers 404; a failed destroy exits 2 and names the instance to delete by hand" },
];

export function akTrainParseArgs(argv) {
  const o = { apply: false, discover: false, declaration: join(AK_TRAIN_ROOT, "docs", "evals", "arena-declared.json"), log: "" };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--discover") o.discover = true;
    else if (a === "--declaration") o.declaration = resolve(argv[++i]);
    else if (a === "--log") o.log = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  if (o.apply && o.discover) throw new Error("--apply and --discover are separate runs");
  return o;
}

export const akTrainMissing = (env = process.env) => AK_TRAIN_REQUIRED.filter((n) => !(typeof env[n] === "string" && env[n].length > 0));

const akTrainGit = (args) => spawnSync("git", args, { cwd: AK_TRAIN_ROOT, encoding: "utf8" });
const akTrainSha256 = (text) => createHash("sha256").update(text).digest("hex");

/**
 * The declared-protocol gate, pure (reads files and git, calls nothing): { ok, reasons, sha, protocolVersion }.
 * Refuses a declaration that is missing, uncommitted or modified, already in the ledger, or whose protocol version
 * already has committed results.
 */
export function akTrainDeclarationGate(path, { ledger = AK_TRAIN_LEDGER, results = join(AK_TRAIN_ROOT, "docs", "evals", "arena.json") } = {}) {
  const reasons = [];
  if (!existsSync(path)) return { ok: false, reasons: [`no declaration at ${relative(AK_TRAIN_ROOT, path)}: declare (and commit) the protocol first`], sha: null, protocolVersion: null };
  const text = readFileSync(path, "utf8");
  const sha = akTrainSha256(text);
  let decl = null;
  try { decl = JSON.parse(text); } catch { reasons.push("the declaration is not JSON"); }
  const rel = relative(AK_TRAIN_ROOT, path);
  if (akTrainGit(["ls-files", "--error-unmatch", rel]).status !== 0) reasons.push(`${rel} is not committed: the protocol is declared in a commit before the run`);
  else if (akTrainGit(["diff", "--quiet", "HEAD", "--", rel]).status !== 0) reasons.push(`${rel} has uncommitted changes`);
  const protocolVersion = decl?.protocol?.version ?? null;
  if (!protocolVersion) reasons.push("the declaration names no protocol.version");
  if (!decl?.protocol?.seeds) reasons.push("the declaration names no held-out seeds");
  if (existsSync(ledger)) {
    for (const line of readFileSync(ledger, "utf8").split("\n").filter(Boolean)) {
      try { if (JSON.parse(line).declarationSha256 === sha) reasons.push(`this declaration already ran (ledger entry from ${JSON.parse(line).started}): a declaration runs once`); } catch { reasons.push("the ledger has a line that is not JSON"); }
    }
  }
  if (existsSync(results)) {
    try {
      const r = JSON.parse(readFileSync(results, "utf8"));
      if (protocolVersion && r.version === protocolVersion) reasons.push(`docs/evals/arena.json already holds results for protocol ${protocolVersion}: its held-out seeds were measured once; declare a new version with new held-out seeds`);
    } catch { reasons.push("docs/evals/arena.json is not JSON"); }
  }
  if (!existsSync(join(AK_TRAIN_ROOT, "tools", "arena_eval.mjs"))) reasons.push("tools/arena_eval.mjs is not in this tree (it lands with ROBO-ARENA)");
  return { ok: reasons.length === 0, reasons, sha, protocolVersion };
}

/** The remote script, as one string sent over ssh. No credential is in it. */
export function akTrainRemoteScript(env = process.env) {
  const v = env.AK_TRAIN_NODE_VERSION || "22.11.0";
  const minutes = Number(env.AK_TRAIN_MAX_MINUTES || 120);
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error("AK_TRAIN_NODE_VERSION must look like 22.11.0");
  if (!(minutes > 0 && minutes <= 24 * 60)) throw new Error("AK_TRAIN_MAX_MINUTES must be between 1 and 1440");
  return [
    "set -euo pipefail",
    "export DEBIAN_FRONTEND=noninteractive",
    "apt-get update -qq && apt-get install -y -qq python3 xz-utils >/dev/null",
    `curl -fsSL https://nodejs.org/dist/v${v}/node-v${v}-linux-x64.tar.xz | tar -xJ -C /opt`,
    `export PATH=/opt/node-v${v}-linux-x64/bin:$PATH`,
    "cd /root/repo",
    ...AK_TRAIN_REMOTE.map((c) => `timeout ${minutes}m ${c}`),
  ].join("\n");
}

export function akTrainPlanText(opts, env = process.env) {
  const gate = akTrainDeclarationGate(opts.declaration);
  const missing = akTrainMissing(env);
  const out = ["# Robot training job on Akamai Cloud — plan", "",
    `Mode: ${opts.apply ? (missing.length || !gate.ok ? "apply requested, but refused — nothing runs" : "APPLY") : opts.discover ? "DISCOVER (read-only listing)" : "DRY RUN (nothing runs)"}.`,
    `By name: ${AK_TRAIN_REQUIRED.map((n) => `${n}=${missing.includes(n) ? "absent" : "present"}`).join(", ")}.`,
    `Declaration: ${relative(AK_TRAIN_ROOT, opts.declaration)} — ${gate.sha ? `sha256 ${gate.sha.slice(0, 12)}…, protocol ${gate.protocolVersion}` : "absent"}; ${gate.ok ? "may run (once)" : `refused: ${gate.reasons.join("; ")}`}.`, ""];
  AK_TRAIN_STEPS.forEach((s, i) => out.push(`## ${i + 1}. ${s.id}`, s.what, ""));
  out.push("Remote script (sent over ssh; no credential in it):", "", ...akTrainRemoteScript(env).split("\n").map((l) => `    ${l}`), "",
    `Copied back: ${AK_TRAIN_COLLECT.join(", ")} → deploy/akamai/out/${gate.sha ? gate.sha.slice(0, 12) : "<sha12>"}/`, "");
  return out.join("\n");
}

// ----------------------------------------------------------------------------- execution (apply / discover only)
async function akTrainApi(method, path, body) {
  const res = await fetch(`${AK_TRAIN_API}${path}`, { method, headers: { authorization: `Bearer ${process.env.LINODE_TOKEN}`, "content-type": "application/json", accept: "application/json" }, body: body ? JSON.stringify(body) : undefined });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

async function akTrainList(path) {
  const all = [];
  for (let page = 1, pages = 1; page <= pages; page += 1) {
    const r = await akTrainApi("GET", `${path}?page=${page}`);
    if (!r.ok) throw new Error(`${path} answered ${r.status}`);
    pages = Number(r.json?.pages) || 1;
    all.push(...(r.json?.data || []));
  }
  return all;
}

export async function akTrainRun(opts, env = process.env) {
  const say = (s) => { console.log(s); if (opts.log) appendFileSync(opts.log, s + "\n"); };
  if (opts.log) { mkdirSync(dirname(opts.log), { recursive: true }); writeFileSync(opts.log, ""); }
  say(akTrainPlanText(opts, env));
  if (opts.discover) {
    if (!env.LINODE_TOKEN) { say("- discover · not executed · LINODE_TOKEN absent"); return 0; }
    // Whatever the account's API answers is printed as it comes; nothing here is a list of its own.
    const types = await akTrainList("/linode/types");
    say("Instance types the API lists (id · class · label):");
    for (const t of types) say(`    ${t.id} · ${t.class} · ${t.label}`);
    const regions = await akTrainList("/regions");
    say("Regions the API lists (id · label · capabilities):");
    for (const r of regions) say(`    ${r.id} · ${r.label} · ${(r.capabilities || []).join(", ")}`);
    return 0;
  }
  const missing = akTrainMissing(env);
  const gate = akTrainDeclarationGate(opts.declaration);
  if (!opts.apply) { say("- all · not executed · dry run"); return 0; }
  if (missing.length) { say(`- all · not executed · absent: ${missing.join(", ")}`); return 0; }
  if (!gate.ok) { say(`- all · refused · ${gate.reasons.join("; ")}`); return 1; }
  for (const n of ["AK_TRAIN_SSH_PUBKEY", "AK_TRAIN_SSH_KEY"]) if (!existsSync(env[n])) { say(`- preflight · FAIL · the file named by ${n} does not exist`); return 1; }

  const commit = akTrainGit(["rev-parse", "HEAD"]).stdout.trim();
  const started = new Date().toISOString();
  const label = `smartciti-train-${gate.sha.slice(0, 12)}`;
  mkdirSync(dirname(AK_TRAIN_LEDGER), { recursive: true });
  appendFileSync(AK_TRAIN_LEDGER, JSON.stringify({ declarationSha256: gate.sha, protocol: gate.protocolVersion, commit, started, label }) + "\n");
  say(`- declare · ok · ledger entry written for ${gate.sha.slice(0, 12)} at ${commit.slice(0, 12)}`);

  const known = join(mkdtempSync(join(tmpdir(), "ak-train-")), "known_hosts");
  const sshBase = ["-i", env.AK_TRAIN_SSH_KEY, "-o", "StrictHostKeyChecking=accept-new", "-o", `UserKnownHostsFile=${known}`, "-o", "ConnectTimeout=10", "-o", "BatchMode=yes"];
  let id = null, exitCode = null, code = 1;
  try {
    const created = await akTrainApi("POST", "/linode/instances", {
      label, region: env.AK_TRAIN_REGION, type: env.AK_TRAIN_TYPE, image: env.AK_TRAIN_IMAGE, booted: true, tags: [AK_TRAIN_TAG],
      authorized_keys: [readFileSync(env.AK_TRAIN_SSH_PUBKEY, "utf8").trim()], root_pass: randomBytes(24).toString("base64url"),
    });
    id = created.json?.id ?? null;
    say(`- provision · ${created.ok && id ? "ok" : "FAIL"} · ${created.status}${created.ok ? ` · instance ${label}` : ` · ${JSON.stringify(created.json?.errors ?? []).slice(0, 300)}`}`);
    if (!created.ok || !id) return 1;
    let ip = null;
    for (let i = 0; i < 90 && !ip; i += 1) {
      const g = await akTrainApi("GET", `/linode/instances/${id}`);
      if (g.json?.status === "running") ip = g.json?.ipv4?.[0] ?? null;
      else await new Promise((r) => setTimeout(r, 10000));
    }
    if (!ip) { say("- wait · FAIL · the instance did not reach running in 15 minutes"); return 1; }
    let sshOk = false;
    for (let i = 0; i < 30 && !sshOk; i += 1) {
      sshOk = spawnSync("ssh", [...sshBase, `root@${ip}`, "true"], { encoding: "utf8" }).status === 0;
      if (!sshOk) await new Promise((r) => setTimeout(r, 10000));
    }
    say(`- wait · ${sshOk ? "ok" : "FAIL"} · running${sshOk ? ", ssh answers" : ", ssh did not answer in 5 minutes"}`);
    if (!sshOk) return 1;
    const archive = spawnSync("git", ["archive", "--format=tar", commit], { cwd: AK_TRAIN_ROOT, maxBuffer: 2 * 1024 * 1024 * 1024 });
    const put = spawnSync("ssh", [...sshBase, `root@${ip}`, "mkdir -p /root/repo && tar -x -C /root/repo"], { input: archive.stdout, maxBuffer: 64 * 1024 * 1024 });
    say(`- run · ${put.status === 0 ? "ok" : "FAIL"} · commit ${commit.slice(0, 12)} sent with git archive`);
    if (put.status !== 0) return 1;
    const run = spawnSync("ssh", [...sshBase, `root@${ip}`, "bash -s"], { input: akTrainRemoteScript(env), encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
    exitCode = run.status;
    say(`- run · ${run.status === 0 ? "ok" : "FAIL"} · exit ${run.status} · ${(run.stdout + run.stderr).trim().split("\n").pop()?.slice(0, 200) ?? ""}`);
    const dest = join(AK_TRAIN_OUT, gate.sha.slice(0, 12));
    mkdirSync(dest, { recursive: true });
    let copied = 0;
    for (const f of AK_TRAIN_COLLECT) {
      const c = spawnSync("scp", [...sshBase, `root@${ip}:/root/repo/${f}`, join(dest, f.split("/").pop())], { encoding: "utf8" });
      if (c.status === 0) copied += 1;
    }
    writeFileSync(join(dest, "run.json"), JSON.stringify({ declarationSha256: gate.sha, protocol: gate.protocolVersion, commit, started, finished: new Date().toISOString(), remote: AK_TRAIN_REMOTE, exitCode, collected: copied, type: env.AK_TRAIN_TYPE, region: env.AK_TRAIN_REGION }, null, 1) + "\n");
    say(`- collect · ${copied === AK_TRAIN_COLLECT.length ? "ok" : "FAIL"} · ${copied}/${AK_TRAIN_COLLECT.length} file(s) in ${relative(AK_TRAIN_ROOT, dest)}`);
    code = run.status === 0 && copied === AK_TRAIN_COLLECT.length ? 0 : 1;
    return code;
  } catch (e) {
    say(`- agent · FAIL · ${String(e.message).split("\n")[0]}`);
    return 1;
  } finally {
    if (id) {
      const del = await akTrainApi("DELETE", `/linode/instances/${id}`).catch(() => ({ ok: false, status: "no answer" }));
      const gone = await akTrainApi("GET", `/linode/instances/${id}`).catch(() => ({ status: "no answer" }));
      if (del.ok && gone.status === 404) say(`- destroy · ok · instance ${label} deleted (GET answers 404)`);
      else { say(`- destroy · FAIL · INSTANCE ${label} MAY STILL BE RUNNING AND BILLING — delete it in Cloud Manager now (tag ${AK_TRAIN_TAG})`); process.exitCode = 2; }
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const code = await akTrainRun(akTrainParseArgs(process.argv.slice(2)));
  process.exit(process.exitCode === 2 ? 2 : code);
}
