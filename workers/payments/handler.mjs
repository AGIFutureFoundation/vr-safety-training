/**
 * STUB — console EDGE wrote this so the edge router and tools/check_deploy.mjs can run before console
 * TILL's real handler lands. TILL's module replaces this file wholesale; on an add/add merge conflict,
 * take TILL's side entirely (nothing here is needed once it exists).
 *
 * The contract the router (workers/edge/router.mjs) is written to:
 *   - default export `handle(request, env)` returning a Response;
 *   - named `ROUTES`: the routes the handler answers, as `{ method, path }` (or "METHOD /path" strings).
 * The webhook secret is read from the environment by name (env.PAYMENTS_WEBHOOK_SECRET, a Pages secret
 * the deploy agent sets by name only); no value is ever in the repository.
 */
export const ROUTES = [{ method: "POST", path: "/api/payments/webhook" }];

export default async function handle(request, env = {}) {
  const configured = typeof env.PAYMENTS_WEBHOOK_SECRET === "string" && env.PAYMENTS_WEBHOOK_SECRET.length > 0;
  return new Response(JSON.stringify({ ok: false, stub: true, configured, note: "payments handler not installed" }), {
    status: 501,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
