#!/usr/bin/env node
/**
 * The Akamai Cloud deploy agent (console AKAMAI, docs/deploy-akamai.md): the flat build in WebXR/dist served as a
 * static website from an Object Storage bucket, behind a CDN hostname, as one planned, verified sequence.
 *
 *     node tools/ak_deploy.mjs                  # dry run (default): prints the whole plan, runs nothing, exits 0
 *     node tools/ak_deploy.mjs --apply          # executes — only with every credential AND every variable below set
 *     node tools/ak_deploy.mjs --log <file>     # where the run log goes (default docs/deploy/akamai-last-run.md)
 *     --skip-build  --skip-gate
 *
 * Credentials (environment only, by name; never read into the plan or the log):
 *   LINODE_TOKEN               a personal access token scoped to Object Storage (read only is enough for this agent:
 *                              it lists the buckets to confirm AK_BUCKET exists; uploads use the access key below)
 *   AK_S3_ACCESS_KEY_ID        an Object Storage access key limited to AK_BUCKET (read/write)
 *   AK_S3_SECRET_ACCESS_KEY    its secret
 * Variables (not secret, but nothing defaults — the owner names each one from their own account):
 *   AK_BUCKET                  the bucket's label
 *   AK_REGION                  the bucket's region id as Cloud Manager shows it
 *   AK_S3_ENDPOINT             the bucket's S3 endpoint hostname as Cloud Manager shows it
 *   AK_CDN_HOSTNAME            the CDN hostname that fronts the bucket's website endpoint (what learners open)
 *
 * The steps, in order (AK_STEPS): build → gate → preflight → snapshot → upload → verify → rollback (only on a failed
 * verify). The Cache-Control of every object is taken from the generated WebXR/dist/_headers (the same rules the
 * Cloudflare deployment serves); the security headers in its "/*" rule cannot be object metadata, so the plan prints
 * them for the CDN property and the verify step checks the CDN serves them. The `aws` CLI (S3-compatible) does the
 * transfers; the Linode API is called once, read-only. Nothing runs without --apply and all seven names present;
 * without them --apply prints the plan, says which names are absent, and exits 0. No price, region or limit is stated
 * anywhere here: every account-specific value comes from the environment.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cfParseHeaders, cfParseRedirects, cfPathMatches, cfFindSecret } from "./cf-config.mjs";

const AK_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const AK_DIST = join(AK_ROOT, "WebXR", "dist");

export const AK_CREDENTIALS = ["LINODE_TOKEN", "AK_S3_ACCESS_KEY_ID", "AK_S3_SECRET_ACCESS_KEY"];
export const AK_VARIABLES = ["AK_BUCKET", "AK_REGION", "AK_S3_ENDPOINT", "AK_CDN_HOSTNAME"];
export const AK_API = "https://api.linode.com/v4";
export const AK_ROLLBACK_PREFIX = "_rollback/";
export const AK_DEFAULT_CACHE = "public, max-age=0, must-revalidate";

export const AK_STEPS = [
  { id: "build", title: "Build the flat folder", what: "python3 tools/bundle_webxr.py writes WebXR/dist and the generated _headers and _redirects" },
  { id: "gate", title: "Gate on the checker suite", what: "node tools/check_all.mjs must end in its 'All N checkers pass.' line" },
  { id: "preflight", title: "Preflight", what: "the bucket named by AK_BUCKET is listed by the Linode API (read-only) and answers on its S3 endpoint; website hosting is set (index.html, 404.html)" },
  { id: "snapshot", title: "Snapshot the live site", what: `a server-side copy of the bucket's current objects under ${AK_ROLLBACK_PREFIX} (private), for the rollback` },
  { id: "upload", title: "Upload", what: "WebXR/dist uploaded group by group with the Cache-Control _headers gives each path; the repo-layout redirects as redirect objects; objects no longer in the build removed" },
  { id: "verify", title: "Verify through the CDN", what: "fetch the homepage, one bundle, auth-config.json, the security headers and the sitemap at https://$AK_CDN_HOSTNAME" },
  { id: "rollback", title: "Roll back on a failed verify", what: `the ${AK_ROLLBACK_PREFIX} copy is synced back over the site; the run exits non-zero` },
];

/** The verify step's assertions — tools/check_deploy_akamai.mjs asserts these are the ones run. */
export const AK_VERIFY = [
  { id: "homepage", path: "/", what: "GET / is 200, text/html and carries the site's <title>" },
  { id: "bundle", path: "/smartcity-x.html", what: "GET /smartcity-x.html is 200 and larger than 1 MB" },
  { id: "config", path: "/auth-config.json", what: "GET /auth-config.json is 200 and parses as JSON" },
  { id: "headers", path: "/", what: "the homepage answers with content-security-policy, x-content-type-options and referrer-policy (set on the CDN property)" },
  { id: "sitemap", path: "/sitemap.xml", what: "GET /sitemap.xml lists exactly as many pages as the built WebXR/dist/sitemap.xml" },
];

export function akParseArgs(argv) {
  const o = { apply: false, log: join(AK_ROOT, "docs", "deploy", "akamai-last-run.md"), skipBuild: false, skipGate: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--log") o.log = argv[++i];
    else if (a === "--skip-build") o.skipBuild = true;
    else if (a === "--skip-gate") o.skipGate = true;
    else throw new Error(`unknown argument ${a}`);
  }
  return o;
}

const akSet = (env, n) => typeof env[n] === "string" && env[n].length > 0;
/** The names (credentials and variables) absent from an environment. Empty means the agent may apply. */
export const akMissing = (env = process.env) => [...AK_CREDENTIALS, ...AK_VARIABLES].filter((n) => !akSet(env, n));

/** Replace every credential value present in the environment with «NAME», then any line still shaped like one whole. */
export function akRedact(text, env = process.env) {
  let out = String(text);
  for (const n of AK_CREDENTIALS) {
    const v = env[n];
    if (typeof v === "string" && v.length >= 6) out = out.split(v).join(`«${n}»`);
  }
  const lines = out.split("\n");
  return lines.map((l) => (cfFindSecret(l) || /\b[0-9a-f]{64}\b/.test(l) ? "[redacted: this line carried something shaped like a credential]" : l)).join("\n");
}

/** Every file of the flat folder (dist-relative), sorted. */
export function akDistFiles(dist = AK_DIST) {
  const out = [];
  (function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else out.push(relative(dist, p).split("\\").join("/")); } })(dist);
  return out.filter((f) => !["_headers", "_redirects", "_routes.json"].includes(f)).sort();
}

/**
 * The Cache-Control each file gets, from the generated _headers: the matching rule with the longest pattern that sets
 * Cache-Control (so /tracks/img/* beats /tracks/*); a file no rule names gets AK_DEFAULT_CACHE (revalidate).
 */
export function akCacheFor(file, rules) {
  let best = null;
  for (const r of rules) {
    if (r.path === "/*" || r.path.startsWith("/api/")) continue;
    const cc = r.headers.find(([n]) => /^cache-control$/i.test(n))?.[1];
    if (!cc || !cfPathMatches(r.path, file)) continue;
    if (!best || r.path.length > best.path.length) best = { path: r.path, cc };
  }
  return best ? best.cc : AK_DEFAULT_CACHE;
}

/** Files grouped by Cache-Control value: [{ cacheControl, files }], in a stable order. */
export function akCacheGroups(files, rules) {
  const m = new Map();
  for (const f of files) { const cc = akCacheFor(f, rules); if (!m.has(cc)) m.set(cc, []); m.get(cc).push(f); }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([cacheControl, fs]) => ({ cacheControl, files: fs }));
}

/** The _redirects rules as S3 website redirect objects (concrete paths) and CDN rules (wildcards). */
export function akRedirects(rules) {
  const objects = [], cdn = [];
  const seen = new Set();
  for (const r of rules) {
    if (/[*:]/.test(r.from)) { cdn.push(r); continue; }
    let key = r.from.replace(/^\/+/, "");
    if (!key || key.endsWith("/")) key += "index.html";
    if (seen.has(key)) continue;
    seen.add(key);
    objects.push({ key, to: r.to, status: r.status });
  }
  return { objects, cdn };
}

/** The security headers of the "/*" rule — set on the CDN property, since object metadata cannot carry them. */
export const akSecurityHeaders = (rules) => rules.find((r) => r.path === "/*")?.headers ?? [];

/**
 * The plan: every step with its commands (argv, the env names it needs) and its checks. Pure — reads the dist folder
 * and its generated files, touches nothing, calls nothing. Values in «» are environment variables, read at run time.
 */
export function akPlan(opts = akParseArgs([])) {
  const headers = existsSync(join(AK_DIST, "_headers")) ? cfParseHeaders(readFileSync(join(AK_DIST, "_headers"), "utf8")) : [];
  const redirects = existsSync(join(AK_DIST, "_redirects")) ? cfParseRedirects(readFileSync(join(AK_DIST, "_redirects"), "utf8")) : [];
  const files = existsSync(AK_DIST) ? akDistFiles() : [];
  const groups = akCacheGroups(files, headers);
  const red = akRedirects(redirects);
  const S3 = ["AK_S3_ACCESS_KEY_ID", "AK_S3_SECRET_ACCESS_KEY", "AK_S3_ENDPOINT", "AK_REGION"];
  const aws = (args, note = "") => ({ argv: ["aws", "--endpoint-url", "https://«AK_S3_ENDPOINT»", "--region", "«AK_REGION»", ...args], env: S3, note });
  const B = "s3://«AK_BUCKET»";
  const steps = {
    build: { commands: opts.skipBuild ? [] : [{ argv: ["python3", "tools/bundle_webxr.py"], env: [], note: "writes WebXR/dist, _headers and _redirects" }], checks: ["WebXR/dist/index.html, smartcity-x.html, sitemap.xml, auth-config.json and _headers exist after the build"] },
    gate: { commands: opts.skipGate ? [] : [{ argv: ["node", "tools/check_all.mjs"], env: [], note: "the whole suite" }], checks: ["the last line is 'All N checkers pass.' — otherwise nothing is uploaded"] },
    preflight: {
      commands: [
        { api: `GET ${AK_API}/object-storage/buckets`, env: ["LINODE_TOKEN"], note: "read-only; every page is read" },
        aws(["s3api", "head-bucket", "--bucket", "«AK_BUCKET»"]),
        aws(["s3", "website", B, "--index-document", "index.html", "--error-document", "404.html"], "idempotent"),
      ],
      checks: ["a bucket labelled $AK_BUCKET is in the API's list", "head-bucket succeeds with the access key", "website hosting answers index.html and 404.html"],
    },
    snapshot: {
      commands: [aws(["s3", "sync", `${B}/`, `${B}/${AK_ROLLBACK_PREFIX}`, "--delete", "--exclude", `${AK_ROLLBACK_PREFIX}*`, "--acl", "private"], "server-side copy; skipped on the first deploy (an empty bucket)")],
      checks: [`the ${AK_ROLLBACK_PREFIX} copy holds as many objects as the live site had`],
    },
    upload: {
      commands: [
        ...groups.map((g) => aws(["s3", "sync", "WebXR/dist", `${B}/`, "--exclude", "*", ...g.files.flatMap((f) => ["--include", f]), "--cache-control", g.cacheControl, "--acl", "public-read"], `${g.files.length} file(s) with Cache-Control "${g.cacheControl}"`)),
        ...red.objects.map((r) => aws(["s3api", "put-object", "--bucket", "«AK_BUCKET»", "--key", r.key, "--website-redirect-location", r.to, "--cache-control", "no-store", "--acl", "public-read"], `redirect /${r.key} → ${r.to}`)),
        aws(["s3api", "list-objects-v2", "--bucket", "«AK_BUCKET»", "--query", "Contents[].Key", "--output", "json"], `then delete-objects for every key not in the build, not a redirect object and not under ${AK_ROLLBACK_PREFIX}`),
      ],
      checks: [`${files.length} files in ${groups.length} Cache-Control group(s), as _headers gives them`, `${red.objects.length} redirect objects; ${red.cdn.length} wildcard redirect(s) belong on the CDN property (printed below)`, "no stale object remains outside the snapshot"],
    },
    verify: { commands: AK_VERIFY.map((v) => ({ fetch: `https://«AK_CDN_HOSTNAME»${v.path}`, env: ["AK_CDN_HOSTNAME"] })), checks: AK_VERIFY.map((v) => v.what) },
    rollback: {
      commands: [aws(["s3", "sync", `${B}/${AK_ROLLBACK_PREFIX}`, `${B}/`, "--delete", "--exclude", `${AK_ROLLBACK_PREFIX}*`, "--acl", "public-read"], "only on a failed verify, and only when a snapshot was taken")],
      checks: ["only when a verify assertion failed; the run then exits 1 with the failed assertion named"],
    },
  };
  return { files: files.length, groups, redirects: red, security: akSecurityHeaders(headers), apply: opts.apply, steps: AK_STEPS.map((s) => ({ ...s, ...steps[s.id] })) };
}

export function akPlanText(plan, env = process.env) {
  const missing = akMissing(env);
  const out = ["# Akamai Cloud deploy plan — WebXR/dist → Object Storage website → CDN", "",
    `Mode: ${plan.apply ? (missing.length ? "apply requested, but names are absent — nothing runs" : "APPLY") : "DRY RUN (nothing runs)"}. ` +
    `By name: ${[...AK_CREDENTIALS, ...AK_VARIABLES].map((n) => `${n}=${akSet(env, n) ? "present" : "absent"}`).join(", ")}.`, ""];
  plan.steps.forEach((s, i) => {
    out.push(`## ${i + 1}. ${s.title} (${s.id})`, s.what, "");
    for (const c of s.commands) {
      if (c.argv) {
        const argv = c.argv.length > 24 ? [...c.argv.slice(0, 12), `… (${c.argv.length - 18} more arguments) …`, ...c.argv.slice(-6)] : c.argv;
        out.push(`    $ ${argv.join(" ")}${c.env.length ? `    # needs ${c.env.map((e) => "$" + e).join(", ")}` : ""}${c.note ? `  — ${c.note}` : ""}`);
      } else if (c.api) out.push(`    ${c.api}    # Authorization from $LINODE_TOKEN${c.note ? `  — ${c.note}` : ""}`);
      else if (c.fetch) out.push(`    GET ${c.fetch}`);
    }
    if (!s.commands.length) out.push("    (skipped by flag)");
    out.push("", ...s.checks.map((c) => `  - check: ${c}`), "");
  });
  out.push("## On the CDN property (set once by the owner, checked by step 6)", "", "Response headers on every path, exactly as the Cloudflare deployment's _headers gives them:", "");
  for (const [n, v] of plan.security) out.push(`    ${n}: ${v}`);
  out.push("", "Wildcard redirects the bucket cannot express:", "");
  for (const r of plan.redirects.cdn) out.push(`    ${r.from} → ${r.to} (${r.status})`);
  out.push("", "Cache: honour the origin's Cache-Control (each object carries the value above).", "");
  return out.join("\n");
}

// ----------------------------------------------------------------------------- execution (apply only)
class AkLog {
  constructor(path) { this.path = path; mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `# Akamai deploy run — ${new Date().toISOString()}\n\n`); }
  line(s) { const t = akRedact(s); appendFileSync(this.path, t + "\n"); console.log(t); }
  step(id, status, detail = "") { this.line(`- ${new Date().toISOString()} · ${id} · ${status}${detail ? ` · ${detail}` : ""}`); }
}

/** Run one command; credentials reach only the child's environment (the aws CLI's own names), never the argv or the log. */
function akExec(argv, env = process.env) {
  const childEnv = { ...process.env, AWS_ACCESS_KEY_ID: env.AK_S3_ACCESS_KEY_ID ?? "", AWS_SECRET_ACCESS_KEY: env.AK_S3_SECRET_ACCESS_KEY ?? "", AWS_PAGER: "" };
  const real = argv.map((a) => a.replace(/«(AK_[A-Z0-9_]+)»/g, (_, n) => env[n] ?? ""));
  const r = spawnSync(real[0], real.slice(1), { cwd: AK_ROOT, encoding: "utf8", env: childEnv, maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}`, stdout: r.stdout ?? "" };
}

async function akApiGet(path) {
  const res = await fetch(`${AK_API}${path}`, { headers: { authorization: `Bearer ${process.env.LINODE_TOKEN}`, accept: "application/json" } });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok, json };
}

async function akVerify(host, log) {
  const failed = [];
  const get = (p) => fetch(`https://${host}${p}`, { redirect: "follow", headers: { "user-agent": "smartciti-ak-deploy" } });
  const home = await get("/");
  const homeText = await home.text();
  if (!(home.status === 200 && /text\/html/.test(home.headers.get("content-type") || "") && /<title>/.test(homeText))) failed.push("homepage");
  const bundle = await get("/smartcity-x.html");
  if (!(bundle.status === 200 && (await bundle.text()).length > 1024 * 1024)) failed.push("bundle");
  const cfg = await get("/auth-config.json");
  let cfgOk = false;
  try { cfgOk = cfg.status === 200 && typeof (await cfg.json()) === "object"; } catch { cfgOk = false; }
  if (!cfgOk) failed.push("config");
  for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy"]) if (!home.headers.get(h)) failed.push(`headers (${h})`);
  const sm = await get("/sitemap.xml");
  const remote = ((await sm.text()).match(/<loc>/g) || []).length;
  const local = (readFileSync(join(AK_DIST, "sitemap.xml"), "utf8").match(/<loc>/g) || []).length;
  if (!(sm.status === 200 && remote === local)) failed.push(`sitemap (${remote} deployed vs ${local} built)`);
  for (const v of AK_VERIFY) log.step("verify", failed.some((f) => f.startsWith(v.id)) ? "FAIL" : "ok", v.what);
  return failed;
}

export async function akRun(opts, env = process.env) {
  const plan = akPlan(opts);
  const log = new AkLog(opts.log);
  log.line(akPlanText(plan, env));
  const missing = akMissing(env);
  if (!opts.apply || missing.length) {
    log.step("all", "not executed", opts.apply ? `absent: ${missing.join(", ")} — set them in the environment (docs/deploy-akamai.md)` : "dry run");
    return 0;
  }
  const S3 = (args) => ["aws", "--endpoint-url", `https://${env.AK_S3_ENDPOINT}`, "--region", env.AK_REGION, ...args];
  const B = `s3://${env.AK_BUCKET}`;
  let snapshot = false;
  try {
    if (!opts.skipBuild) {
      const r = akExec(["python3", "tools/bundle_webxr.py"], env);
      log.step("build", r.status ? "FAIL" : "ok", r.out.trim().split("\n").pop());
      if (r.status) return 1;
    } else log.step("build", "skipped", "--skip-build");
    for (const f of ["index.html", "smartcity-x.html", "sitemap.xml", "auth-config.json", "_headers"]) if (!existsSync(join(AK_DIST, f))) { log.step("build", "FAIL", `${f} missing`); return 1; }
    if (!opts.skipGate) {
      const r = akExec(["node", "tools/check_all.mjs"], env);
      const last = r.out.trim().split("\n").filter(Boolean).pop() ?? "";
      const ok = !r.status && /^All \d+ checkers pass\.$/.test(last);
      log.step("gate", ok ? "ok" : "FAIL", last);
      if (!ok) return 1;
    } else log.step("gate", "skipped", "--skip-gate (the workflow ran the suite in an earlier step)");
    // preflight: one read-only API listing, then the S3 endpoint
    let found = false;
    for (let page = 1, pages = 1; page <= pages && !found; page += 1) {
      const r = await akApiGet(`/object-storage/buckets?page=${page}`);
      if (!r.ok) { log.step("preflight", "FAIL", `bucket list answered ${r.status}`); return 1; }
      pages = Number(r.json?.pages) || 1;
      found = (r.json?.data || []).some((b) => b.label === env.AK_BUCKET);
    }
    log.step("preflight", found ? "ok" : "FAIL", found ? "the bucket is listed" : "no bucket with the label in $AK_BUCKET");
    if (!found) return 1;
    const head = akExec(S3(["s3api", "head-bucket", "--bucket", env.AK_BUCKET]), env);
    log.step("preflight", head.status ? "FAIL" : "ok", "head-bucket with the access key");
    if (head.status) return 1;
    const web = akExec(S3(["s3", "website", B, "--index-document", "index.html", "--error-document", "404.html"]), env);
    log.step("preflight", web.status ? "FAIL" : "ok", "website hosting: index.html, 404.html");
    if (web.status) return 1;
    // snapshot
    const list = akExec(S3(["s3api", "list-objects-v2", "--bucket", env.AK_BUCKET, "--query", "Contents[].Key", "--output", "json"]), env);
    if (list.status) { log.step("snapshot", "FAIL", "could not list the bucket"); return 1; }
    let remote = [];
    try { remote = JSON.parse(list.stdout || "null") || []; } catch { remote = []; }
    const live = remote.filter((k) => !k.startsWith(AK_ROLLBACK_PREFIX));
    if (live.length) {
      const s = akExec(S3(["s3", "sync", `${B}/`, `${B}/${AK_ROLLBACK_PREFIX}`, "--delete", "--exclude", `${AK_ROLLBACK_PREFIX}*`, "--acl", "private"]), env);
      snapshot = !s.status;
      log.step("snapshot", s.status ? "FAIL" : "ok", `${live.length} live object(s) copied under ${AK_ROLLBACK_PREFIX}`);
      if (s.status) return 1;
    } else log.step("snapshot", "skipped", "the bucket holds no site yet (first deploy): nothing to roll back to");
    // upload
    for (const g of plan.groups) {
      const u = akExec(S3(["s3", "sync", "WebXR/dist", `${B}/`, "--exclude", "*", ...g.files.flatMap((f) => ["--include", f]), "--cache-control", g.cacheControl, "--acl", "public-read"]), env);
      log.step("upload", u.status ? "FAIL" : "ok", `${g.files.length} file(s), Cache-Control "${g.cacheControl}"`);
      if (u.status) throw new Error("upload failed");
    }
    for (const r of plan.redirects.objects) {
      const u = akExec(S3(["s3api", "put-object", "--bucket", env.AK_BUCKET, "--key", r.key, "--website-redirect-location", r.to, "--cache-control", "no-store", "--acl", "public-read"]), env);
      if (u.status) { log.step("upload", "FAIL", `redirect /${r.key}`); throw new Error("redirect upload failed"); }
    }
    log.step("upload", "ok", `${plan.redirects.objects.length} redirect object(s)`);
    const keep = new Set([...akDistFiles(), ...plan.redirects.objects.map((r) => r.key)]);
    const stale = live.filter((k) => !keep.has(k));
    for (let i = 0; i < stale.length; i += 500) {
      const batch = JSON.stringify({ Objects: stale.slice(i, i + 500).map((Key) => ({ Key })), Quiet: true });
      const d = akExec(S3(["s3api", "delete-objects", "--bucket", env.AK_BUCKET, "--delete", batch]), env);
      if (d.status) { log.step("upload", "FAIL", "removing stale objects"); throw new Error("stale removal failed"); }
    }
    log.step("upload", "ok", `${stale.length} stale object(s) removed`);
    // verify
    const failed = await akVerify(env.AK_CDN_HOSTNAME, log);
    if (!failed.length) { log.step("verify", "ok", `all ${AK_VERIFY.length} assertions through the CDN`); log.step("rollback", "not needed"); return 0; }
    log.step("verify", "FAIL", failed.join("; "));
    throw new Error("verify failed");
  } catch (e) {
    log.step("agent", "FAIL", String(e.message).split("\n")[0]);
    if (snapshot) {
      const rb = akExec(S3(["s3", "sync", `${B}/${AK_ROLLBACK_PREFIX}`, `${B}/`, "--delete", "--exclude", `${AK_ROLLBACK_PREFIX}*`, "--acl", "public-read"]), env);
      log.step("rollback", rb.status ? "FAIL" : "ok", "the snapshot synced back over the site");
    } else log.step("rollback", "skipped", "no snapshot was taken (first deploy, or the run stopped before uploading)");
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(await akRun(akParseArgs(process.argv.slice(2))));
}
