/**
 * The deploy agent (console EDGE, docs/deploy-cloudflare.md): takes the build from this repository to
 * production on Cloudflare as one planned, verified sequence.
 *
 *     node tools/deploy_agent.mjs                 # dry run (default): prints the whole plan, runs nothing, exits 0
 *     node tools/deploy_agent.mjs --apply         # executes — only with CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID set
 *     node tools/deploy_agent.mjs --log <file>    # where the run log goes (default docs/deploy/last-run.md)
 *     --domain <host>  --zone <id from env name>  --branch <name>  --skip-build  --skip-gate  --base <url>
 *
 * The steps, in order (CF_STEPS): build → gate → provision → deploy → configure → verify → rollback (only on a
 * failed verify). Every command and every check is printed in the dry run exactly as the apply would run it;
 * credentials are referred to by their environment variable names and never read into the plan or the log.
 * Secrets are set by name only (a name in the environment is piped to `wrangler pages secret put` on stdin).
 * `wrangler` and the Cloudflare API are called only in --apply with both credentials present; without them
 * --apply prints the plan, says why nothing ran, and exits 0. Nothing here deploys from a machine that has
 * no credentials, and nothing prints a value that could be one (tools/cf-config.mjs's cfFindSecret guards the log).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cfReadToml, cfFindSecret } from "./cf-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "WebXR", "dist");

export const CF_CREDENTIALS = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];
/** Secrets the configure step sets, by name; a name absent from the environment is skipped with a note. */
export const CF_SECRET_NAMES = ["PAYMENTS_WEBHOOK_SECRET"];
export const CF_KV_TITLE = "smartciti-x-enterprise";

export const CF_STEPS = [
  { id: "build", title: "Build the flat folder", what: "python3 tools/bundle_webxr.py writes WebXR/dist, then _headers, _redirects and _routes.json" },
  { id: "gate", title: "Gate on the checker suite", what: "node tools/check_all.mjs must end in its 'All N checkers pass.' line" },
  { id: "provision", title: "Provision", what: "the Pages project, the KV namespace (by title), the KV binding, the custom domain and its DNS record" },
  { id: "deploy", title: "Deploy", what: "wrangler pages deploy WebXR/dist (assets and the /api Functions); the standalone Worker only when CF_WORKER_ZONE is set" },
  { id: "configure", title: "Configure", what: "secrets present in the environment, by name; KV seeded with the enterprise block" },
  { id: "verify", title: "Verify the deployment", what: "fetch the homepage, one bundle, /api/health and the security headers; compare the sitemap's page count to the build" },
  { id: "rollback", title: "Roll back on a failed verify", what: "the previous Pages deployment is restored through the API; the run exits non-zero" },
];

/** The verify step's assertions — tools/check_deploy.mjs asserts these are the ones run. */
export const CF_VERIFY = [
  { id: "homepage", what: "GET / is 200, text/html and carries the site's <title>" },
  { id: "bundle", what: "GET /smartcity-x.html is 200 and larger than 1 MB" },
  { id: "health", what: "GET /api/health is 200 JSON with ok: true" },
  { id: "headers", what: "the homepage answers with content-security-policy, x-content-type-options and referrer-policy" },
  { id: "sitemap", what: "GET /sitemap.xml lists exactly as many pages as the built WebXR/dist/sitemap.xml" },
];

export function cfParseArgs(argv) {
  const o = { apply: false, log: join(ROOT, "docs", "deploy", "last-run.md"), skipBuild: false, skipGate: false, domain: process.env.CF_CUSTOM_DOMAIN || "", branch: process.env.CF_PAGES_BRANCH || "main", base: process.env.CF_BASE_URL || "" };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--apply") o.apply = true;
    else if (a === "--log") o.log = argv[++i];
    else if (a === "--skip-build") o.skipBuild = true;
    else if (a === "--skip-gate") o.skipGate = true;
    else if (a === "--domain") o.domain = argv[++i];
    else if (a === "--branch") o.branch = argv[++i];
    else if (a === "--base") o.base = argv[++i];
    else throw new Error(`unknown argument ${a}`);
  }
  return o;
}

export const cfHaveCredentials = (env = process.env) => CF_CREDENTIALS.every((n) => typeof env[n] === "string" && env[n].length > 0);

/** Replace every credential value that is in the environment with «NAME», then refuse anything still shaped like one. */
export function cfRedact(text, env = process.env) {
  let out = String(text);
  for (const n of [...CF_CREDENTIALS, ...CF_SECRET_NAMES, "CLOUDFLARE_ZONE_ID"]) {
    const v = env[n];
    if (typeof v === "string" && v.length >= 6) out = out.split(v).join(`«${n}»`);
  }
  // A deployment id or a namespace id from wrangler's output is 32 hex too: a line that carries one is
  // replaced whole rather than risk a token, so the log names the step and its verdict, never an id.
  const hit = cfFindSecret(out);
  return hit ? out.split("\n").map((l) => (cfFindSecret(l) ? `[redacted: this line carried ${cfFindSecret(l).name}]` : l)).join("\n") : out;
}

/**
 * The plan: every step with the commands (argv, the env names it needs) and the checks it runs. Pure — reads
 * wrangler.toml and the dist folder, touches nothing, calls nothing. Placeholders in ‹› are resolved at run time.
 */
export function cfPlan(opts = cfParseArgs([])) {
  const pages = cfReadToml(join(ROOT, "wrangler.toml"));
  const worker = cfReadToml(join(ROOT, "workers", "edge", "wrangler.toml"));
  const project = pages.name;
  const domain = opts.domain || null;
  const base = opts.base || (domain ? `https://${domain}` : `https://${project}.pages.dev`);
  const acct = "«CLOUDFLARE_ACCOUNT_ID»";
  const api = (m, p) => ({ api: `${m} https://api.cloudflare.com/client/v4${p}`, env: ["CLOUDFLARE_API_TOKEN"] });
  const cmd = (argv, env = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"], note = "") => ({ argv, env, note });
  const steps = {
    build: { commands: opts.skipBuild ? [] : [cmd(["python3", "tools/bundle_webxr.py"], [], "writes WebXR/dist and the edge files")], checks: ["WebXR/dist/index.html, _headers, _redirects and _routes.json exist after the build"] },
    gate: { commands: opts.skipGate ? [] : [cmd(["node", "tools/check_all.mjs"], [], "the whole suite; 25–40 minutes on a shared machine")], checks: ["the last line is 'All N checkers pass.'"] },
    provision: {
      commands: [
        api("GET", `/accounts/${acct}/pages/projects/${project}`),
        api("POST", `/accounts/${acct}/pages/projects`),
        api("GET", `/accounts/${acct}/storage/kv/namespaces`),
        api("POST", `/accounts/${acct}/storage/kv/namespaces`),
        api("PATCH", `/accounts/${acct}/pages/projects/${project}`),
        ...(domain ? [api("POST", `/accounts/${acct}/pages/projects/${project}/domains`), api("POST", `/zones/«CLOUDFLARE_ZONE_ID»/dns_records`)] : []),
      ],
      checks: [
        `the Pages project '${project}' exists (created with production_branch '${opts.branch}' if not)`,
        `a KV namespace titled '${CF_KV_TITLE}' exists (created if not) and its id is bound as ${pages.kv_namespaces?.[0]?.binding} on the project`,
        domain ? `the custom domain ${domain} is attached and a CNAME ${domain} → ${project}.pages.dev exists (needs CLOUDFLARE_ZONE_ID)` : "no custom domain requested (--domain or CF_CUSTOM_DOMAIN); the project's pages.dev address is used",
      ],
    },
    deploy: {
      commands: [
        cmd(["npx", "wrangler", "pages", "deploy", "WebXR/dist", "--project-name", project, "--branch", opts.branch, "--commit-dirty=true"], undefined, "assets plus functions/ (the /api router); wrangler.toml carries the resolved KV id only for the duration of this command, then is restored"),
        cmd(["npx", "wrangler", "deploy", "--config", "workers/edge/wrangler.toml", "--route", "«CF_WORKER_ZONE»/api/*"], ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "CF_WORKER_ZONE"], `only when CF_WORKER_ZONE is set; publishes '${worker.name}'`),
        api("GET", `/accounts/${acct}/pages/projects/${project}/deployments`),
      ],
      checks: ["wrangler exits 0 and the deployments list shows the new deployment first (its id and the previous one are kept for rollback)"],
    },
    configure: {
      commands: [
        ...CF_SECRET_NAMES.map((n) => cmd(["npx", "wrangler", "pages", "secret", "put", n, "--project-name", project], ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", n], `value from $${n} on stdin; skipped with a note when the name is not in the environment`)),
        cmd(["npx", "wrangler", "kv", "key", "put", "--namespace-id", "‹kv namespace id›", `${pages.vars?.CF_ENTERPRISE_KEY_PREFIX ?? "org:"}default`, "--path", "‹enterprise block json›"], undefined, "the enterprise block of $CF_ENTERPRISE_FILE, else of WebXR/auth-config.json"),
      ],
      checks: [`each of ${CF_SECRET_NAMES.join(", ")} present in the environment is set on the project by name`, "the KV key for the default organisation holds the enterprise block"],
    },
    verify: { commands: CF_VERIFY.map((v) => ({ fetch: `${base}${{ homepage: "/", bundle: "/smartcity-x.html", health: "/api/health", headers: "/", sitemap: "/sitemap.xml" }[v.id]}`, env: [] })), checks: CF_VERIFY.map((v) => v.what) },
    rollback: { commands: [api("POST", `/accounts/${acct}/pages/projects/${project}/deployments/‹previous deployment id›/rollback`)], checks: ["only when a verify assertion failed; the run then exits 1 with the failed assertion named"] },
  };
  return { project, base, domain, branch: opts.branch, apply: opts.apply, steps: CF_STEPS.map((s) => ({ ...s, ...steps[s.id] })) };
}

export function cfPlanText(plan, env = process.env) {
  const have = cfHaveCredentials(env);
  const out = [`# Deploy plan — ${plan.project} → ${plan.base}`, "",
    `Mode: ${plan.apply ? (have ? "APPLY" : "apply requested, but credentials are absent — nothing runs") : "DRY RUN (nothing runs)"}. Credentials by name: ${CF_CREDENTIALS.map((n) => `${n}=${env[n] ? "present" : "absent"}`).join(", ")}.`, ""];
  plan.steps.forEach((s, i) => {
    out.push(`## ${i + 1}. ${s.title} (${s.id})`, s.what, "");
    for (const c of s.commands) {
      if (c.argv) out.push(`    $ ${c.argv.join(" ")}${c.env.length ? `    # needs ${c.env.map((e) => "$" + e).join(", ")}` : ""}${c.note ? `  — ${c.note}` : ""}`);
      else if (c.api) out.push(`    ${c.api}    # Authorization from $CLOUDFLARE_API_TOKEN`);
      else if (c.fetch) out.push(`    GET ${c.fetch}`);
    }
    if (!s.commands.length) out.push("    (skipped by flag)");
    out.push("", ...s.checks.map((c) => `  - check: ${c}`), "");
  });
  return out.join("\n");
}

// ----------------------------------------------------------------------------- execution (apply only)
class CfLog {
  constructor(path) { this.path = path; mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, `# Deploy run — ${new Date().toISOString()}\n\n`); }
  line(s) { const t = cfRedact(s); appendFileSync(this.path, t + "\n"); console.log(t); }
  step(id, status, detail = "") { this.line(`- ${new Date().toISOString()} · ${id} · ${status}${detail ? ` · ${detail}` : ""}`); }
}

/**
 * wrangler reads bindings from wrangler.toml, and the repository's copy carries a placeholder where the KV
 * namespace id goes (an id in the tree would fail tools/check_deploy.mjs). For the duration of one wrangler
 * command the file is written with the resolved id and then restored byte for byte, whatever the outcome.
 */
export const CF_KV_PLACEHOLDER = "resolved-by-deploy-agent";
export function cfWithResolvedConfig(configPath, kvId, fn) {
  const original = readFileSync(configPath, "utf8");
  try {
    writeFileSync(configPath, original.split(CF_KV_PLACEHOLDER).join(kvId));
    return fn();
  } finally {
    writeFileSync(configPath, original);
  }
}

function cfExec(argv, { input, extraEnv = {} } = {}) {
  const r = spawnSync(argv[0], argv.slice(1), { cwd: ROOT, input, encoding: "utf8", env: { ...process.env, ...extraEnv }, maxBuffer: 64 * 1024 * 1024 });
  return { status: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

async function cfApi(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method, headers: { authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { json = null; }
  return { status: res.status, ok: res.ok && json?.success !== false, result: json?.result ?? null, errors: json?.errors ?? [] };
}

async function cfVerify(base, log) {
  const failed = [];
  const get = (p) => fetch(base + p, { redirect: "follow", headers: { "user-agent": "smartciti-deploy-agent" } });
  const home = await get("/");
  const homeText = await home.text();
  if (!(home.status === 200 && /text\/html/.test(home.headers.get("content-type") || "") && /<title>/.test(homeText))) failed.push("homepage");
  for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy"]) if (!home.headers.get(h)) failed.push(`headers (${h})`);
  const bundle = await get("/smartcity-x.html");
  const bundleText = await bundle.text();
  if (!(bundle.status === 200 && bundleText.length > 1024 * 1024)) failed.push("bundle");
  const health = await get("/api/health");
  let ok = false;
  try { ok = health.status === 200 && (await health.json()).ok === true; } catch { ok = false; }
  if (!ok) failed.push("health");
  const sm = await get("/sitemap.xml");
  const remote = ((await sm.text()).match(/<loc>/g) || []).length;
  const local = (readFileSync(join(DIST, "sitemap.xml"), "utf8").match(/<loc>/g) || []).length;
  if (!(sm.status === 200 && remote === local)) failed.push(`sitemap (${remote} deployed vs ${local} built)`);
  for (const v of CF_VERIFY) log.step("verify", failed.some((f) => f.startsWith(v.id)) ? "FAIL" : "ok", v.what);
  return failed;
}

export async function cfRun(opts) {
  const plan = cfPlan(opts);
  const text = cfPlanText(plan);
  const log = new CfLog(opts.log);
  log.line(text);
  const have = cfHaveCredentials();
  if (!opts.apply || !have) {
    log.step("all", "not executed", opts.apply ? "credentials absent: set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the environment" : "dry run");
    return 0;
  }
  const acct = process.env.CLOUDFLARE_ACCOUNT_ID;
  const P = plan.project;
  let previous = null, current = null, kvId = null;
  try {
    // build
    if (!opts.skipBuild) {
      const r = cfExec(["python3", "tools/bundle_webxr.py"]);
      log.step("build", r.status ? "FAIL" : "ok", r.out.trim().split("\n").pop());
      if (r.status) return 1;
    } else log.step("build", "skipped", "--skip-build");
    for (const f of ["index.html", "_headers", "_redirects", "_routes.json", "sitemap.xml"]) if (!existsSync(join(DIST, f))) { log.step("build", "FAIL", `${f} missing`); return 1; }
    // gate
    if (!opts.skipGate) {
      const r = cfExec(["node", "tools/check_all.mjs"]);
      const last = r.out.trim().split("\n").filter(Boolean).pop() ?? "";
      log.step("gate", /^All \d+ checkers pass\.$/.test(last) && !r.status ? "ok" : "FAIL", last);
      if (r.status || !/^All \d+ checkers pass\.$/.test(last)) return 1;
    } else log.step("gate", "skipped", "--skip-gate");
    // provision
    let proj = await cfApi("GET", `/accounts/${acct}/pages/projects/${P}`);
    if (!proj.ok) { proj = await cfApi("POST", `/accounts/${acct}/pages/projects`, { name: P, production_branch: opts.branch }); log.step("provision", proj.ok ? "ok" : "FAIL", `Pages project ${P} created (${proj.status})`); if (!proj.ok) return 1; }
    else log.step("provision", "ok", `Pages project ${P} exists`);
    const ns = await cfApi("GET", `/accounts/${acct}/storage/kv/namespaces?per_page=100`);
    kvId = (ns.result || []).find((n) => n.title === CF_KV_TITLE)?.id ?? null;
    if (!kvId) { const c = await cfApi("POST", `/accounts/${acct}/storage/kv/namespaces`, { title: CF_KV_TITLE }); kvId = c.result?.id ?? null; log.step("provision", kvId ? "ok" : "FAIL", `KV namespace ${CF_KV_TITLE} created`); if (!kvId) return 1; }
    else log.step("provision", "ok", `KV namespace ${CF_KV_TITLE} exists`);
    const binding = cfReadToml(join(ROOT, "wrangler.toml")).kv_namespaces[0].binding;
    const bind = await cfApi("PATCH", `/accounts/${acct}/pages/projects/${P}`, { deployment_configs: { production: { kv_namespaces: { [binding]: { namespace_id: kvId } } }, preview: { kv_namespaces: { [binding]: { namespace_id: kvId } } } } });
    log.step("provision", bind.ok ? "ok" : "FAIL", `${binding} bound on the project`);
    if (!bind.ok) return 1;
    if (plan.domain) {
      const d = await cfApi("POST", `/accounts/${acct}/pages/projects/${P}/domains`, { name: plan.domain });
      log.step("provision", d.ok || d.status === 409 ? "ok" : "FAIL", `custom domain ${plan.domain} (${d.status})`);
      if (process.env.CLOUDFLARE_ZONE_ID) {
        const dns = await cfApi("POST", `/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`, { type: "CNAME", name: plan.domain, content: `${P}.pages.dev`, proxied: true });
        log.step("provision", dns.ok || dns.status === 400 ? "ok" : "FAIL", `CNAME ${plan.domain} → ${P}.pages.dev (${dns.status}${dns.ok ? "" : "; exists or refused — see the dashboard"})`);
      } else log.step("provision", "skipped", "CLOUDFLARE_ZONE_ID absent: add the CNAME by hand (docs/deploy-cloudflare.md)");
    }
    // deploy
    const before = await cfApi("GET", `/accounts/${acct}/pages/projects/${P}/deployments?per_page=1`);
    previous = before.result?.[0]?.id ?? null;
    const dep = cfWithResolvedConfig(join(ROOT, "wrangler.toml"), kvId, () => cfExec(["npx", "wrangler", "pages", "deploy", "WebXR/dist", "--project-name", P, "--branch", opts.branch, "--commit-dirty=true"]));
    log.step("deploy", dep.status ? "FAIL" : "ok", dep.out.trim().split("\n").filter(Boolean).pop());
    if (dep.status) return 1;
    if (process.env.CF_WORKER_ZONE) {
      const w = cfWithResolvedConfig(join(ROOT, "workers/edge/wrangler.toml"), kvId, () => cfExec(["npx", "wrangler", "deploy", "--config", "workers/edge/wrangler.toml", "--route", `${process.env.CF_WORKER_ZONE}/api/*`]));
      log.step("deploy", w.status ? "FAIL" : "ok", "standalone Worker");
      if (w.status) return 1;
    } else log.step("deploy", "skipped", "CF_WORKER_ZONE absent: the Pages Functions serve /api/*");
    const after = await cfApi("GET", `/accounts/${acct}/pages/projects/${P}/deployments?per_page=1`);
    current = after.result?.[0]?.id ?? null;
    log.step("deploy", current ? "ok" : "FAIL", `deployment ${current ? "recorded" : "not found"}; previous ${previous ? "kept for rollback" : "none"}`);
    // configure
    for (const n of CF_SECRET_NAMES) {
      if (!process.env[n]) { log.step("configure", "skipped", `${n} not in the environment`); continue; }
      const s = cfExec(["npx", "wrangler", "pages", "secret", "put", n, "--project-name", P], { input: process.env[n] });
      log.step("configure", s.status ? "FAIL" : "ok", `secret ${n} set by name`);
      if (s.status) return 1;
    }
    const src = process.env.CF_ENTERPRISE_FILE || join(ROOT, "WebXR", "auth-config.json");
    const parsed = JSON.parse(readFileSync(src, "utf8"));
    const block = parsed.enterprise ?? parsed;
    const tmp = join(dirname(opts.log), "enterprise-seed.json");
    writeFileSync(tmp, JSON.stringify(block));
    const prefix = cfReadToml(join(ROOT, "wrangler.toml")).vars?.CF_ENTERPRISE_KEY_PREFIX ?? "org:";
    const kv = cfExec(["npx", "wrangler", "kv", "key", "put", "--namespace-id", kvId, `${prefix}default`, "--path", tmp]);
    log.step("configure", kv.status ? "FAIL" : "ok", `KV ${prefix}default seeded from ${src.replace(ROOT + "/", "")}`);
    if (kv.status) return 1;
    // verify
    const failed = await cfVerify(plan.base, log);
    if (!failed.length) { log.step("verify", "ok", `all ${CF_VERIFY.length} assertions at ${plan.base}`); log.step("rollback", "not needed"); return 0; }
    // rollback
    log.step("verify", "FAIL", failed.join("; "));
    if (previous) {
      const rb = await cfApi("POST", `/accounts/${acct}/pages/projects/${P}/deployments/${previous}/rollback`);
      log.step("rollback", rb.ok ? "ok" : "FAIL", `previous deployment restored (${rb.status})`);
    } else log.step("rollback", "skipped", "no previous deployment to restore");
    return 1;
  } catch (e) {
    log.step("agent", "FAIL", String(e.message).split("\n")[0]);
    return 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const opts = cfParseArgs(process.argv.slice(2));
  process.exit(await cfRun(opts));
}
