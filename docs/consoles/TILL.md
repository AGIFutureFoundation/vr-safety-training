# Console TILL — enterprise seat billing and the budget agent

Team: TILL (Crescent run). Brief: `$SP/crescent/crescent-brief.md`, section TILL, plus the coordinator's scope addition
(the agentic payments track: `WebXR/shared/pm-agent.js`). Branch: `worktree-agent-aad8ef5f08e5127b5` off the
coordinator's local tip `01539ab` (`claude/vr-ar-safety-training-wkwmve`). Prefix `pm`, port 8995.

## Plan (18:52 UTC)

The only money in the platform is an organisation's seat licence; a learner never buys anything. Everything below runs
on-device against a mock provider; a real provider is configuration a deployment fills in, never code here.

1. **Configuration** — `WebXR/auth-config.json` gains a `payments` block: `provider` (null = no provider; `"mock"` =
   on-device stub), `publishableKey` (null), `currency` (null), `currencyExponent`, `plans` (ids, names, period,
   `amountMinor: null`). No amount is written in code or in the shipped file; a quote shows the amount *as configured*,
   or "not configured". `auth.js` gets `cleanPayments()` and `parseAuthConfig` carries `payments` from the file only
   (a launch URL cannot name a provider or a price).
2. **Adapter** — `WebXR/shared/payments.js` mirrors `agent-protocols.js`: `pmCreateAdapter(config)` with
   `describe()`, `quote(planId, seats, ctx)`, `checkout(quote)` (null with no request when no provider; a hosted-redirect
   *stub* — a `#pm-checkout/<session>` fragment, no navigation — for the mock), `webhook(event)` (idempotent by event
   id; a paid event writes one receipt and licenses the seats to the cohort), `status(receipt)`. Store `vr-payments-v1`
   through `gtStorage()` (a private profile key): sessions, receipts, licences, the agent's state. Invoices are a
   procedural SVG marked "PROTOTYPE — NOT AN INVOICE" twice. Audit lines go through `enAudit` so they sit in the
   organisation's own log. `enSetCohortSeats` (org.js, audited) is the provisioning hook.
3. **Agent** — `WebXR/shared/pm-agent.js`: a pure, deterministic `pmAgentStep(state, policy, events) → { actions,
   state }` (seen event ids skipped; every action carries a reason and becomes a decision; nothing over the ceiling
   ever becomes a buy; anything over the approval threshold becomes a queue entry a human confirms) and an impure
   runner `pmAgentRun(adapter, policy, events)` that executes the actions against the adapter on-device, provisions
   cohorts and audits each decision.
4. **Billing tab** — `WebXR/instructor/js/billing.js`, fifth tab of the console, `el()`/`textContent` only: seats used /
   licensed per cohort, quote and checkout (mock), invoices, the payment audit lines, and a **Budget** panel (policy
   form, spend against ceiling, last ten decisions, approval queue with confirm / decline).
5. **Worker handler** — `workers/payments/handler.mjs`: `export default handle(request, env)` → Response and
   `export const ROUTES`; HMAC-SHA256 signature over the raw body against `env.PAYMENTS_WEBHOOK_SECRET` (503 when unset,
   nothing processed); idempotent receipts in `env.PAYMENTS_KV` when bound, else per-isolate memory. Self-contained (no
   browser module), for EDGE to import by that exact path.
6. **Docs and checker** — `docs/payments.md`; `tools/check_payments.mjs` in `check_all`: no key or secret committed
   and every shipped amount null; quote maths; checkout with no provider → null, no request; webhook idempotency; the
   billing tab renders with sample data; the enterprise block honoured; the agent never exceeds the ceiling,
   over-threshold lands in the queue, replayed events are idempotent, the audit trail re-reads every decision; the
   handler's signature check, 503 without a secret, idempotent receipts, ROUTES exported.

## Log
- 18:49 UTC · worktree sat on the initial commit; `git reset --hard 01539ab` onto the coordinator's local tip (no origin fetch) · next: read org.js, enterprise.md, agent-protocols.js, the console, the checker
- 18:52 UTC · plan above written after the reading; coordinator's scope addition (pm-agent.js, Budget panel, four agent assertions) folded in · next: config block, auth.js cleaner, payments.js
- 19:00 UTC · payments block, `cleanPayments`, `vr-payments-v1` profile key, `enSetCohortSeats`, payments.js, pm-agent.js, the Billing tab, bundler order; smoke test passes (quote 12 × 100 = 1200, stub redirect, replay duplicate, ceiling refusal) · cf1e83d · next: Worker handler, checker, docs
- 19:05 UTC · design fix: releasing unused seats mid-period oscillated with "fill → buy to planned"; release now only in the renewal window, renewal keeps max(used, floor), release lowers planned seats · next: handler
- 19:08 UTC · `workers/payments/handler.mjs` (default `handle(request, env)`, `ROUTES`, HMAC over the raw body against `env.PAYMENTS_WEBHOOK_SECRET`, 503 unbound, idempotent receipts in KV or memory), `docs/payments.md`, `tools/check_payments.mjs` (10 checks) in check_all and the perf baseline · next: fix the four first-run failures
- 19:11 UTC · failures fixed: `pmPolicyClean`'s `int()` turned null into 0 (a null threshold queued everything); the DOM stub's selector matched only two-part chains (`#pm-seat-table tbody tr` counted the header row); the import scan matched a comment in profiles.js; `pmSelect` now sets the first option (a real select does) · check_payments 10/10 in 1.4 s · next: neighbouring checkers, commit
