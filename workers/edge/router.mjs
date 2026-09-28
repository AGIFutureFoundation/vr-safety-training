/**
 * The edge router (console EDGE, docs/deploy-cloudflare.md): every `/api/*` request of the platform's
 * Cloudflare deployment, plus the same-origin `/auth-config.json` read every page makes.
 *
 * Two entry points, one table:
 *   - `onRequest(context)` — a Pages Function (functions/ re-exports it);
 *   - `default.fetch(request, env)` — the same router as a standalone Worker (workers/edge/wrangler.toml).
 *
 * Routes (`CF_ROUTES`, what tools/check_deploy.mjs compares to the payments handler's `ROUTES`):
 *   GET  /api/health              — liveness, the service name and the build stamp; nothing secret.
 *   GET  /api/auth-config         — the deployment's auth-config.json with the organisation's `enterprise`
 *   GET  /auth-config.json          block merged in from KV (binding CF_ENTERPRISE): the key is
 *                                   `<prefix><host>`, then `<prefix><?org=slug>`, then `<prefix>default`.
 *                                   Only the enterprise block's own keys are taken from KV (docs/enterprise.md § 3);
 *                                   a token or a key stored there by mistake never reaches a browser.
 *   POST /api/payments/webhook    — TILL's workers/payments/handler.mjs (default `handle(request, env)`).
 *
 * The router never logs a header, a body or an environment value. It reads `env` for bindings and names only.
 */
import cfPaymentsHandle, { ROUTES as CF_PAYMENT_ROUTES } from "../payments/handler.mjs";

/** The keys of auth-config.json's `enterprise` block a KV entry may set (docs/enterprise.md § 3). */
export const CF_ENTERPRISE_KEYS = ["organisation", "signInMethods", "defaultLanguage", "worlds", "programmes", "dataRetention", "sso"];

/** Normalise a route spelled as "METHOD /path" or `{ method, path }` (or `pattern`) to `{ method, path }`. */
export function cfRoute(r) {
  if (typeof r === "string") {
    const [method, path] = r.trim().split(/\s+/);
    return path ? { method: method.toUpperCase(), path } : { method: "POST", path: method };
  }
  return { method: String(r.method ?? "POST").toUpperCase(), path: String(r.path ?? r.pattern ?? r.route ?? "") };
}

export const CF_OWN_ROUTES = [
  { method: "GET", path: "/api/health" },
  { method: "GET", path: "/api/auth-config" },
  { method: "GET", path: "/auth-config.json" },
];

/** Every route this router answers: its own, then the payments handler's, as it declares them. */
export const CF_ROUTES = [...CF_OWN_ROUTES, ...(Array.isArray(CF_PAYMENT_ROUTES) ? CF_PAYMENT_ROUTES.map(cfRoute) : [])];

const CF_JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

export function cfJson(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...CF_JSON_HEADERS, ...extra } });
}

/** Read the static auth-config.json beside the pages: the Pages ASSETS binding when there is one, else the origin. */
async function cfReadStaticConfig(request, env) {
  const url = new URL("/auth-config.json", request.url);
  const origin = env?.CF_ORIGIN ? new URL("/auth-config.json", env.CF_ORIGIN) : url;
  const res = env?.ASSETS?.fetch ? await env.ASSETS.fetch(new Request(url.href, { method: "GET" })) : await fetch(origin.href, { headers: { accept: "application/json" } });
  if (!res || !res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

/** The KV keys tried for this request, most specific first. */
export function cfEnterpriseKeys(request, env) {
  const prefix = env?.CF_ENTERPRISE_KEY_PREFIX ?? "org:";
  const url = new URL(request.url);
  const keys = [];
  const host = (request.headers.get("host") || url.host || "").toLowerCase().split(":")[0];
  if (host) keys.push(prefix + host);
  const org = url.searchParams.get("org");
  if (org && /^[a-z0-9][a-z0-9.-]{0,62}$/i.test(org)) keys.push(prefix + org.toLowerCase());
  keys.push(prefix + "default");
  return [...new Set(keys)];
}

/** Whitelist an organisation block read from KV. Anything not in CF_ENTERPRISE_KEYS is dropped. */
export function cfPickEnterprise(block) {
  if (!block || typeof block !== "object" || Array.isArray(block)) return null;
  const out = {};
  for (const k of CF_ENTERPRISE_KEYS) if (k in block) out[k] = block[k];
  return Object.keys(out).length ? out : null;
}

export async function cfAuthConfig(request, env) {
  const config = (await cfReadStaticConfig(request, env)) ?? {};
  let injected = null, key = null;
  const kv = env?.CF_ENTERPRISE;
  if (kv && typeof kv.get === "function") {
    for (const k of cfEnterpriseKeys(request, env)) {
      let value = null;
      try { value = await kv.get(k, "json"); } catch { value = null; }
      const picked = cfPickEnterprise(value);
      if (picked) { injected = picked; key = k; break; }
    }
  }
  const body = injected ? { ...config, enterprise: { ...(config.enterprise ?? {}), ...injected } } : config;
  return cfJson(body, 200, { "x-cf-enterprise": injected ? "kv" : "file", vary: "host" });
}

export function cfHealth(request, env) {
  return cfJson({ ok: true, service: env?.CF_SERVICE ?? "smartciti-x", build: env?.CF_BUILD ?? null, time: new Date().toISOString(), routes: CF_ROUTES.map((r) => `${r.method} ${r.path}`) });
}

/** The router. `env` carries the bindings (ASSETS, CF_ENTERPRISE) and the vars; nothing in it is echoed. */
export async function cfHandle(request, env = {}) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const method = request.method.toUpperCase();
  if (path === "/api/health") return method === "GET" || method === "HEAD" ? cfHealth(request, env) : cfJson({ error: "method not allowed" }, 405, { allow: "GET, HEAD" });
  if (path === "/api/auth-config" || path === "/auth-config.json") {
    return method === "GET" || method === "HEAD" ? cfAuthConfig(request, env) : cfJson({ error: "method not allowed" }, 405, { allow: "GET, HEAD" });
  }
  const payment = CF_ROUTES.find((r) => r.path === path && !CF_OWN_ROUTES.includes(r));
  if (payment) {
    if (payment.method !== method) return cfJson({ error: "method not allowed" }, 405, { allow: payment.method });
    const res = await cfPaymentsHandle(request, env);
    return res instanceof Response ? res : cfJson({ error: "handler returned no response" }, 502);
  }
  return cfJson({ error: "not found", path }, 404);
}

/** Pages Functions entry. */
export const onRequest = (context) => cfHandle(context.request, context.env);

/** Standalone Worker entry. */
export default { fetch: (request, env) => cfHandle(request, env) };
