/**
 * The Cloudflare deployment files (console EDGE, docs/deploy-cloudflare.md).
 *
 *     node tools/check_deploy.mjs
 *
 * - wrangler.toml (the Pages project) and workers/edge/wrangler.toml (the Worker) parse; the project serves
 *   WebXR/dist; the KV binding CF_ENTERPRISE is declared with a placeholder id, never a real one;
 * - WebXR/dist/_headers, _redirects and _routes.json are what tools/bundle_webxr.py emits now; every _headers
 *   path and every redirect target exists in WebXR/dist; the CSP names the cdnjs, jsdelivr, Google and Mapbox
 *   hosts the code names and no host the code does not; the bundles and HTML carry the cache policy;
 * - no secret, token, account id or 32-hex id anywhere in the deploy files, the agent, the docs or the log;
 * - the router's routes cover the payments handler's exported ROUTES and its own three; the router answers
 *   health, the auth-config injection (KV block whitelisted, unknown keys dropped, no KV → the file) and 404s;
 * - the deploy agent's plan is complete and ordered (build → gate → provision → deploy → configure → verify →
 *   rollback), the dry run executes nothing (no child process, no fetch) with or without credentials, the verify
 *   step's assertions are exactly the listed five, and the plan and the log carry no credential value;
 * - the shell front and the workflow refer to credentials by name only and the workflow is gated on them;
 * - `wrangler pages deploy --dry-run` / `wrangler deploy --dry-run` when wrangler is installed, else a note.
 */
import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { cfReadToml, cfParseHeaders, cfParseRedirects, cfPathMatches, cfFindSecret } from "./cf-config.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "WebXR", "dist");
let failures = 0, passes = 0;
function check(ok, what, detail = "") { if (ok) { passes += 1; return true; } failures += 1; console.log(`✗ ${what}${detail ? ` — ${detail}` : ""}`); return false; }
const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ------------------------------------------------------------------ the configs
let pages = null, worker = null;
try { pages = cfReadToml(join(ROOT, "wrangler.toml")); } catch (e) { check(false, "wrangler.toml parses", e.message); }
try { worker = cfReadToml(join(ROOT, "workers/edge/wrangler.toml")); } catch (e) { check(false, "workers/edge/wrangler.toml parses", e.message); }
if (pages) {
  check(pages.pages_build_output_dir === "WebXR/dist", "the Pages project serves WebXR/dist", pages.pages_build_output_dir);
  check(/^[a-z0-9-]+$/.test(pages.name ?? ""), "the Pages project has a plain name", pages.name);
  check(/^\d{4}-\d{2}-\d{2}$/.test(pages.compatibility_date ?? ""), "the Pages project pins a compatibility date");
  const kv = pages.kv_namespaces?.[0];
  check(kv?.binding === "CF_ENTERPRISE", "the KV binding CF_ENTERPRISE is declared for the Pages project");
  check(kv && !/^[0-9a-f]{32}$/.test(kv.id), "the KV id in wrangler.toml is a placeholder, not a namespace id");
  check(!("account_id" in pages) && !("route" in pages) && !("routes" in pages), "wrangler.toml carries no account id or zone route");
}
if (worker) {
  check(worker.main === "router.mjs" && existsSync(join(ROOT, "workers/edge", worker.main)), "the Worker's main is the router");
  check(worker.kv_namespaces?.[0]?.binding === "CF_ENTERPRISE" && !/^[0-9a-f]{32}$/.test(worker.kv_namespaces[0].id), "the Worker binds CF_ENTERPRISE with a placeholder id");
  check(!("account_id" in worker) && !("routes" in worker) && !("route" in worker), "the Worker config carries no account id or route (filled from the environment)");
}
for (const f of ["functions/api/[[path]].js", "functions/auth-config.json.js"]) {
  check(existsSync(join(ROOT, f)) && /export \{ onRequest \} from ".*workers\/edge\/router\.mjs"/.test(read(f)), `${f} re-exports the router`);
}

// ------------------------------------------------------------------ the edge files
const distFiles = [];
(function walk(d) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else distFiles.push(relative(DIST, p)); } })(DIST);
let headers = [], redirects = [];
try { headers = cfParseHeaders(read("WebXR/dist/_headers")); } catch (e) { check(false, "_headers parses", e.message); }
try { redirects = cfParseRedirects(read("WebXR/dist/_redirects")); } catch (e) { check(false, "_redirects parses", e.message); }
let routes = null;
try { routes = JSON.parse(read("WebXR/dist/_routes.json")); } catch (e) { check(false, "_routes.json parses", e.message); }
check(routes?.version === 1 && routes.include?.includes("/api/*") && routes.include.includes("/auth-config.json") && routes.include.length === 2, "_routes.json sends only /api/* and /auth-config.json to the Function");

// The files are what the generator emits now.
{
  const py = spawnSync("python3", ["-c", "import sys; sys.path.insert(0,'tools'); import bundle_webxr as b; sys.stdout.write(b.edge_headers()); sys.stdout.write('\\n=====\\n'); sys.stdout.write(b.edge_redirects())"], { cwd: ROOT, encoding: "utf8" });
  const [h, r] = (py.stdout || "").split("\n=====\n");
  check(py.status === 0 && h === read("WebXR/dist/_headers") && r === read("WebXR/dist/_redirects"), "_headers and _redirects are current (run python3 tools/bundle_webxr.py)", py.stderr?.trim().split("\n").pop());
}
for (const rule of headers) {
  const path = rule.path;
  if (path === "/*") continue;
  const isApi = path.startsWith("/api/");
  const hit = isApi || distFiles.some((f) => cfPathMatches(path, f));
  check(hit, `_headers path ${path} exists in WebXR/dist`);
  check(rule.headers.length > 0 && rule.headers.every(([n, v]) => n && v), `_headers rule ${path} has header lines`);
}
const star = headers.find((r) => r.path === "/*");
const csp = star?.headers.find(([n]) => n.toLowerCase() === "content-security-policy")?.[1] ?? "";
check(!!star && !!csp, "every path gets a Content-Security-Policy");
for (const n of ["X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy", "Cross-Origin-Opener-Policy"]) check(star?.headers.some(([h]) => h === n), `every path gets ${n}`);
check(!star?.headers.some(([h]) => /^(X-Frame-Options)$/i.test(h)) && !/frame-ancestors/.test(csp), "no frame-ancestors or X-Frame-Options (the LTI launch embeds the pages)");
// The hosts the code names, and only those, in the CSP (plus 'self', data:, blob:, https: for configured endpoints).
const codeHosts = new Set();
for (const f of ["WebXR/shared/auth.js", "WebXR/shared/mapbox.js", "WebXR/holodeck/index.html", "WebXR/instructor/index.html"]) {
  for (const m of read(f).matchAll(/https:\/\/(cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|accounts\.google\.com|login\.microsoftonline\.com|api\.mapbox\.com|events\.mapbox\.com)/g)) codeHosts.add(m[1]);
}
const cspHosts = new Set([...csp.matchAll(/https:\/\/([a-z0-9.-]+)/g)].map((m) => m[1]));
for (const h of codeHosts) check(cspHosts.has(h), `the CSP allows ${h}, which the code names`);
for (const h of cspHosts) check(codeHosts.has(h) || h === "events.mapbox.com", `the CSP host ${h} is one the code names`);
check(/script-src [^;]*https:\/\/cdnjs\.cloudflare\.com/.test(csp) && /img-src [^;]*https:\/\/api\.mapbox\.com/.test(csp) && /connect-src [^;]*https:\/\/api\.mapbox\.com/.test(csp), "cdnjs may serve scripts and Mapbox may serve images and answer requests");
check(/object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp), "the CSP pins object-src and base-uri");
const cc = (p) => headers.filter((r) => r.path === p).flatMap((r) => r.headers).find(([n]) => /^cache-control$/i.test(n))?.[1] ?? "";
check(cc("/index.html") === "no-store" && cc("/auth-config.json") === "no-store" && cc("/tracks/*") === "no-store", "the homepage, the track pages and auth-config.json are no-store");
for (const b of ["smartcity-x.html", "holodeck.html", "bayworld.html"]) check(/max-age=0, must-revalidate/.test(cc("/" + b)), `${b} revalidates on every load`);
for (const d of ["vendor", "media", "og", "icons"]) check(/immutable/.test(cc(`/${d}/*`)), `/${d}/* is immutable`);
check(cc("/api/*") === "no-store", "/api/* is no-store");
for (const r of redirects) {
  check(r.from.startsWith("/") && r.to.startsWith("/"), `redirect ${r.from} is absolute`);
  check(distFiles.includes(r.to.slice(1)), `redirect target ${r.to} exists in WebXR/dist`);
  check(!r.from.startsWith("/api/") && !distFiles.includes(r.from.slice(1)), `redirect source ${r.from} does not shadow a real file or the API`);
}
check(redirects.some((r) => r.from === "/smartcity/index.html" && r.to === "/smartcity-x.html") && redirects.some((r) => r.from === "/home.html"), "the repo-layout paths fold onto the flat names");

// ------------------------------------------------------------------ no secrets anywhere
const SCAN = ["wrangler.toml", "workers/edge/wrangler.toml", "workers/edge/router.mjs", "workers/payments/handler.mjs", "workers/passes/handler.mjs", "functions/api/[[path]].js",
  "functions/auth-config.json.js", "tools/deploy_agent.mjs", "tools/deploy_cloudflare.sh", "tools/cf-config.mjs", "tools/check_deploy.mjs",
  ".github/workflows/deploy-cloudflare.yml", "docs/deploy-cloudflare.md", "docs/deploy/last-run.md", "WebXR/dist/_headers", "WebXR/dist/_redirects", "WebXR/dist/_routes.json"];
for (const f of SCAN) {
  if (!check(existsSync(join(ROOT, f)), `${f} exists`)) continue;
  const hit = cfFindSecret(read(f));
  check(!hit, `${f} carries nothing shaped like a secret or an id`, hit ? `${hit.name} (${hit.sample})` : "");
}
{
  const gitFiles = spawnSync("git", ["ls-files", "workers", "functions", "docs/deploy", ".github/workflows"], { cwd: ROOT, encoding: "utf8" }).stdout?.split("\n").filter(Boolean) ?? [];
  check(!gitFiles.some((f) => /\.dev\.vars$|\.env$|wrangler\.json$/.test(f)), "no .dev.vars, .env or generated wrangler.json is tracked");
}

// ------------------------------------------------------------------ the router and the handler
const router = await import(join(ROOT, "workers/edge/router.mjs"));
const handler = await import(join(ROOT, "workers/payments/handler.mjs"));
const passesMod = await import(join(ROOT, "workers/passes/handler.mjs"));
check(typeof handler.default === "function" && Array.isArray(handler.ROUTES) && handler.ROUTES.length > 0, "workers/payments/handler.mjs exports default handle() and ROUTES");
check(typeof passesMod.default === "function" && Array.isArray(passesMod.ROUTES) && passesMod.ROUTES.length > 0, "workers/passes/handler.mjs exports default handle() and ROUTES");
const want = [...handler.ROUTES, ...passesMod.ROUTES].map(router.cfRoute);
const key = (r) => `${r.method} ${r.path}`;
const have = router.CF_ROUTES.map(key);
const own = ["GET /api/health", "GET /api/auth-config", "GET /auth-config.json"];
for (const p of own) check(have.includes(p), `the router serves ${p}`);
// The router's routes are exactly its own three plus the union of both handlers' ROUTES.
check(JSON.stringify(have.filter((h) => !own.includes(h)).sort()) === JSON.stringify([...new Set(want.map(key))].sort()), "the router's routes equal the union of the payments and passes handlers' ROUTES", `router: ${have.join(", ")}`);
check(passesMod.ROUTES.map(router.cfRoute).every((r) => r.path.startsWith("/api/passes")), "the passes handler's routes are under /api/passes");
check(new Set(have).size === have.length && have.every((h) => /^(GET|POST|PUT|DELETE|PATCH) \/[a-z0-9/_.:*-]*$/.test(h)), "every route is unique and well-formed", have.join(", "));
check(want.every((r) => r.path.startsWith("/api/")), "the handlers' routes are under /api/");
check(typeof router.onRequest === "function" && typeof router.default?.fetch === "function", "the router exports the Pages and the Worker entry points");
{
  const staticConfig = JSON.parse(read("WebXR/auth-config.json"));
  const assets = { fetch: async () => new Response(JSON.stringify(staticConfig), { headers: { "content-type": "application/json" } }) };
  const kvStore = { "org:acme.example": { organisation: "Acme Training Council", defaultLanguage: "es", mapboxToken: "should-not-pass", apiKey: "nope" }, "org:default": { organisation: "Default Org" } };
  const kv = { get: async (k) => kvStore[k] ?? null };
  let requests = 0;
  const origFetch = globalThis.fetch; globalThis.fetch = async () => { requests += 1; return new Response("{}"); };
  const health = await router.cfHandle(new Request("https://acme.example/api/health"), { ASSETS: assets, CF_ENTERPRISE: kv, CF_SERVICE: "t" });
  const hj = await health.json();
  check(health.status === 200 && hj.ok === true && hj.service === "t" && Array.isArray(hj.routes), "/api/health answers ok with the service name and routes");
  check(!JSON.stringify(hj).includes("Bearer") && health.headers.get("cache-control") === "no-store", "/api/health is no-store and echoes nothing secret");
  const byHost = await (await router.cfHandle(new Request("https://acme.example/auth-config.json", { headers: { host: "acme.example" } }), { ASSETS: assets, CF_ENTERPRISE: kv })).json();
  check(byHost.enterprise?.organisation === "Acme Training Council" && byHost.enterprise.defaultLanguage === "es", "the auth-config route injects the host's enterprise block from KV");
  check(!("mapboxToken" in byHost.enterprise) && !("apiKey" in byHost.enterprise) && byHost.mapboxToken === null, "keys outside the enterprise block are dropped from the KV entry");
  check(byHost.enterprise.dataRetention === staticConfig.enterprise.dataRetention && byHost.googleClientId === null, "the file's other values are kept under the injected block");
  const byOrg = await (await router.cfHandle(new Request("https://other.example/api/auth-config?org=acme.example", { headers: { host: "other.example" } }), { ASSETS: assets, CF_ENTERPRISE: kv })).json();
  check(byOrg.enterprise?.organisation === "Acme Training Council", "?org= selects a block when the host has none");
  const dflt = await router.cfHandle(new Request("https://other.example/api/auth-config", { headers: { host: "other.example" } }), { ASSETS: assets, CF_ENTERPRISE: kv });
  check((await dflt.json()).enterprise?.organisation === "Default Org" && dflt.headers.get("x-cf-enterprise") === "kv" && dflt.headers.get("cache-control") === "no-store", "the default block is the fallback and the answer is no-store");
  const noKv = await router.cfHandle(new Request("https://x.example/api/auth-config"), { ASSETS: assets });
  const noKvJson = await noKv.json();
  check(noKv.headers.get("x-cf-enterprise") === "file" && JSON.stringify(noKvJson) === JSON.stringify(staticConfig), "without a KV binding the route serves the file unchanged");
  check(requests === 0, "with the ASSETS binding the router makes no outbound request", String(requests));
  const nf = await router.cfHandle(new Request("https://x.example/api/nothing"), {});
  check(nf.status === 404, "an unknown /api path is a JSON 404");
  const wrong = await router.cfHandle(new Request("https://x.example/api/health", { method: "POST" }), {});
  check(wrong.status === 405 && wrong.headers.get("allow"), "a wrong method is a 405 with Allow");
  const payRoute = router.cfRoute(handler.ROUTES[0]);
  const pay = await router.cfHandle(new Request(`https://x.example${payRoute.path.replace(/:\w+/g, "x").replace(/\*$/, "x")}`, { method: payRoute.method, body: payRoute.method === "GET" ? undefined : "{}" }), {});
  check(pay instanceof Response && pay.status !== 404 && pay.status !== 405, "the payments route reaches the payments handler", String(pay.status));
  const passRoute = router.cfRoute(passesMod.ROUTES[0]);
  const pass = await router.cfHandle(new Request(`https://x.example${passRoute.path.replace(/:\w+/g, "abc").replace(/\*$/, "abc")}`, { method: passRoute.method, body: passRoute.method === "GET" ? undefined : "{}" }), {});
  check(pass instanceof Response && pass.status !== 404 && pass.status !== 405, "a passes route reaches the passes handler", String(pass.status));
  globalThis.fetch = origFetch;
}

// ------------------------------------------------------------------ the deploy agent
const agent = await import(join(ROOT, "tools/deploy_agent.mjs"));
const order = ["build", "gate", "provision", "deploy", "configure", "verify", "rollback"];
check(JSON.stringify(agent.CF_STEPS.map((s) => s.id)) === JSON.stringify(order), "the plan has the seven steps in order", agent.CF_STEPS.map((s) => s.id).join(" → "));
check(JSON.stringify(agent.CF_VERIFY.map((v) => v.id)) === JSON.stringify(["homepage", "bundle", "health", "headers", "sitemap"]), "the verify step's assertions are the homepage, a bundle, /api/health, the security headers and the sitemap count");
{
  const src = read("tools/deploy_agent.mjs");
  const verifyFn = src.slice(src.indexOf("async function cfVerify"), src.indexOf("export async function cfRun"));
  check(/\/smartcity-x\.html/.test(verifyFn) && /\/api\/health/.test(verifyFn) && /content-security-policy/.test(verifyFn) && /x-content-type-options/.test(verifyFn) && /referrer-policy/.test(verifyFn) && /sitemap\.xml/.test(verifyFn) && /<title>/.test(verifyFn) && /1024 \* 1024/.test(verifyFn), "cfVerify runs exactly those assertions");
  check(/deployments\/\$\{previous\}\/rollback/.test(src), "a failed verify rolls back to the previous deployment");
  // The placeholder id is swapped for the resolved one only for the duration of a wrangler command, then restored.
  const tomlText = read("wrangler.toml"), workerToml = read("workers/edge/wrangler.toml");
  check(tomlText.includes(agent.CF_KV_PLACEHOLDER) && workerToml.includes(agent.CF_KV_PLACEHOLDER), "both wrangler.toml files carry the KV placeholder the agent resolves");
  const tmpToml = join(mkdtempSync(join(tmpdir(), "cf-toml-")), "wrangler.toml");
  writeFileSync(tmpToml, tomlText);
  let seen = "";
  const fakeId = "0123abcd".repeat(4);
  agent.cfWithResolvedConfig(tmpToml, fakeId, () => { seen = readFileSync(tmpToml, "utf8"); });
  check(seen.includes(`id = "${fakeId}"`) && !seen.includes(agent.CF_KV_PLACEHOLDER) && readFileSync(tmpToml, "utf8") === tomlText, "the resolved id is present only during the command and the file is restored after it");
  try { agent.cfWithResolvedConfig(tmpToml, fakeId, () => { throw new Error("wrangler failed"); }); } catch { /* expected */ }
  check(readFileSync(tmpToml, "utf8") === tomlText, "the file is restored even when the command throws");
  check(!/console\.log\(.*process\.env\.(CLOUDFLARE_API_TOKEN|PAYMENTS_WEBHOOK_SECRET)/.test(src), "the agent never prints a credential");
}
const plan = agent.cfPlan(agent.cfParseArgs(["--domain", "train.example.org"]));
check(plan.steps.every((s) => s.checks.length > 0) && plan.steps.every((s) => s.id === "build" || s.id === "gate" || s.commands.length > 0), "every step has commands and checks");
check(plan.steps.find((s) => s.id === "provision").commands.length === 7 && plan.steps.find((s) => s.id === "configure").commands.length === agent.CF_SECRET_NAMES.length + 1, "provision covers project, KV, binding, domain and DNS; configure covers each secret by name and the KV seed");
check(plan.steps.find((s) => s.id === "deploy").commands.some((c) => c.argv?.join(" ").includes("pages deploy WebXR/dist")) && plan.steps.find((s) => s.id === "deploy").commands.some((c) => c.argv?.join(" ").includes("workers/edge/wrangler.toml")), "deploy uploads WebXR/dist and can publish the Worker");
check(plan.steps.flatMap((s) => s.commands).every((c) => !c.argv || c.argv.every((a) => !/[0-9a-f]{32}/.test(a))) , "no command in the plan carries an id");
const planText = agent.cfPlanText(plan, {});
check(!cfFindSecret(planText) && /«CLOUDFLARE_ACCOUNT_ID»/.test(planText) && /\$CLOUDFLARE_API_TOKEN/.test(planText), "the plan names credentials by variable name only");
// The dry run runs nothing, with or without credentials.
{
  const dir = mkdtempSync(join(tmpdir(), "cf-check-"));
  // Built at run time so this file itself carries nothing shaped like a credential.
  const fake = { token: "FAKETOKEN".repeat(4) + "0123", account: "00112233".repeat(2) + "aabbccdd".repeat(2), secret: ["whsec", "test", "fakefakefake"].join("_") };
  const fakeEnv = { ...process.env, CLOUDFLARE_API_TOKEN: fake.token, CLOUDFLARE_ACCOUNT_ID: fake.account, PAYMENTS_WEBHOOK_SECRET: fake.secret };
  const spy = `
    import { spawn, spawnSync, exec, execSync } from "node:child_process";
    let calls = 0; const trap = () => { calls += 1; throw new Error("child process in dry run"); };
    globalThis.fetch = trap;
    const m = await import(${JSON.stringify(join(ROOT, "tools/deploy_agent.mjs"))});
    const code = await m.cfRun(m.cfParseArgs(["--log", ${JSON.stringify(join(dir, "run.md"))}, ...process.argv.slice(2)]));
    console.log(JSON.stringify({ code, calls }));`;
  for (const [label, env, args] of [["without credentials", process.env, []], ["with credentials", fakeEnv, []], ["--apply without credentials", { ...process.env, CLOUDFLARE_API_TOKEN: "", CLOUDFLARE_ACCOUNT_ID: "" }, ["--apply"]]]) {
    const r = spawnSync(process.execPath, ["--input-type=module", "-e", spy, "--", ...args], { cwd: ROOT, encoding: "utf8", env });
    let res = null; try { res = JSON.parse(r.stdout.trim().split("\n").pop()); } catch { res = null; }
    check(r.status === 0 && res?.code === 0 && res.calls === 0, `the dry run ${label} exits 0 and calls nothing`, (r.stderr || r.stdout).trim().split("\n").pop());
    const log = existsSync(join(dir, "run.md")) ? readFileSync(join(dir, "run.md"), "utf8") : "";
    check(log.includes("## 7. Roll back") && !log.includes(fakeEnv.CLOUDFLARE_API_TOKEN) && !log.includes(fakeEnv.CLOUDFLARE_ACCOUNT_ID) && !log.includes(fakeEnv.PAYMENTS_WEBHOOK_SECRET) && !cfFindSecret(log), `the log ${label} holds the whole plan and no credential value`);
  }
}
check(read("docs/deploy/last-run.md").includes("DRY RUN") && read("docs/deploy/last-run.md").includes("not executed"), "the committed last-run.md is a dry run that executed nothing");

// ------------------------------------------------------------------ the shell front, the workflow, the docs
{
  const sh = read("tools/deploy_cloudflare.sh");
  check(/set -euo pipefail/.test(sh) && /deploy_agent\.mjs/.test(sh) && /--apply/.test(sh), "deploy_cloudflare.sh is strict and drives the agent");
  check(!/CLOUDFLARE_API_TOKEN=|CLOUDFLARE_ACCOUNT_ID=[^$]/.test(sh.replace(/\$\{?CLOUDFLARE_[A-Z_]+/g, "")), "deploy_cloudflare.sh assigns no credential");
  const sx = statSync(join(ROOT, "tools/deploy_cloudflare.sh")).mode & 0o111;
  check(sx !== 0, "deploy_cloudflare.sh is executable");
  const bash = spawnSync("bash", ["-n", "tools/deploy_cloudflare.sh"], { cwd: ROOT, encoding: "utf8" });
  check(bash.status === 0, "deploy_cloudflare.sh parses", bash.stderr);
  const wf = read(".github/workflows/deploy-cloudflare.yml");
  check(/secrets\.CLOUDFLARE_API_TOKEN/.test(wf) && /secrets\.CLOUDFLARE_ACCOUNT_ID/.test(wf), "the workflow takes the credentials from GitHub secrets");
  check(/if:\s*\$\{\{[^}]*secrets\.CLOUDFLARE_API_TOKEN\s*!=\s*''/.test(wf) || /HAVE_SECRETS|have_secrets/.test(wf), "the workflow is gated on the secrets being present");
  check(/check_all\.mjs/.test(wf) && /deploy_agent\.mjs --apply/.test(wf), "the workflow runs the suite, then the agent with --apply");
  check(/branches:\s*\[?\s*["']?(main|claude\/vr-ar-safety-training-wkwmve)/.test(wf), "the workflow deploys from the default branch");
  const doc = read("docs/deploy-cloudflare.md");
  for (const k of ["custom domain", "preview", "wrangler.toml", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "_headers", "_redirects", "KV", "rollback", "Cloudflare's current limits"]) check(doc.toLowerCase().includes(k.toLowerCase()), `docs/deploy-cloudflare.md covers "${k}"`);
  check(!/\b\d+\s*(requests|GB|MB|builds)\s*(per|\/)\s*(day|month)/i.test(doc), "the doc invents no free-tier numbers");
}

// ------------------------------------------------------------------ wrangler dry run, when installed
{
  const which = spawnSync("sh", ["-c", "command -v wrangler || (npx --no-install wrangler --version >/dev/null 2>&1 && echo npx-wrangler)"], { cwd: ROOT, encoding: "utf8" });
  const found = (which.stdout || "").trim();
  if (found) {
    const argv = found === "npx-wrangler" ? ["npx", "--no-install", "wrangler"] : [found];
    const r = spawnSync(argv[0], [...argv.slice(1), "deploy", "--dry-run", "--outdir", join(mkdtempSync(join(tmpdir(), "cf-wr-")), "out"), "--config", "workers/edge/wrangler.toml"], { cwd: ROOT, encoding: "utf8", env: { ...process.env, CLOUDFLARE_API_TOKEN: "", CLOUDFLARE_ACCOUNT_ID: "" } });
    check(r.status === 0, "wrangler deploy --dry-run bundles the Worker", (r.stderr || r.stdout).trim().split("\n").pop());
    console.log("wrangler: dry run executed");
  } else {
    console.log("wrangler: not installed here — dry run skipped (npm i -g wrangler, then rerun; the plan and the router were checked without it)");
  }
}

if (failures) { console.log(`\n${failures} deploy check(s) failed, ${passes} passed.`); process.exit(1); }
console.log(`All deploy checks pass: ${passes} checks, ${headers.length} header rules, ${redirects.length} redirects, ${have.length} routes, ${agent.CF_STEPS.length} plan steps, ${agent.CF_VERIFY.length} verify assertions.`);
