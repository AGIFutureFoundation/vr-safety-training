/**
 * STUB — console EDGE wrote this so the edge router and tools/check_deploy.mjs can run before console
 * TILL's Wallet pass handler lands in this tree. TILL's module replaces this file wholesale; on an add/add
 * merge conflict, take TILL's side entirely.
 *
 * The contract the router (workers/edge/router.mjs) is written to:
 *   - default export `handle(request, env)` returning a Response;
 *   - named `ROUTES`: the routes the handler answers, as `{ method, path }` (or "METHOD /path" strings),
 *     all under /api/passes/.
 */
export const ROUTES = [
  { method: "GET", path: "/api/passes/:id" },
  { method: "POST", path: "/api/passes" },
];

export default async function handle() {
  return new Response(JSON.stringify({ ok: false, stub: true, note: "passes handler not installed" }), {
    status: 501,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}
