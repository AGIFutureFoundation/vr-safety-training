# TILL-2 brief — seat billing, one phase further

What TILL shipped (`docs/payments.md`, `docs/consoles/TILL.md`), measured on 2026-09-28: `check_payments` 10/10 in
1.4 s (headless, no browser); the instructor bundle 37 modules / 1528 KB; the Billing tab renders in headless Chromium
with the sample (seat row `4 | 12 | 12`, one receipt, no page error, 0 px sideways at 1280); the agent held the ceiling
across 60 fills of 1–40 seats (spend 4600 of a 5000 fixture ceiling, the rest refused and queued); every shipped amount
is null; the Worker handler answers 503 / 401 / 200 / duplicate / 404 as documented.

## Take it further
1. **A live browser pass in `check_payments`** the way `check_enterprise` check 8 runs: serve `WebXR/dist`, inject a
   payments block by fulfilling `auth-config.json` (`provider: "mock"`, `currency: "XTS"`, fixture amounts), load the
   sample from the Billing tab, quote → checkout → complete through the page's own buttons, save a policy, run the
   agent, confirm a queued item — and capture `docs/img/payments/*.png` from the same run (`PM_SHOTS=` like `EN_SHOTS`).
   Budget ~15 s under load; weigh it two in `check_all`.
2. **The flat build.** `WebXR/dist/instructor-console.html` and `dist/shared/auth.js` are rebuilt only by the full
   `python3 tools/bundle_webxr.py`; TILL rebuilt the instructor dist only. Run the full bundle once after the merge and
   confirm `check_links`/`check_home` still pass with the Billing tab in the flat console.
3. **A real hosted provider, as configuration only.** The adapter's hosted path posts `{ action: "checkout", quote,
   publishableKey }` to `checkoutEndpoint` and expects `{ redirectUrl, sessionId }`; document that contract for the
   deployment's own relay (EDGE's Worker could implement it against the provider the deployment picks), keep every
   value in the environment, and add a `check_payments` case with a fake fetch returning a non-https URL (refused).
4. **Agent in the Worker.** `pmAgentStep` is pure; give EDGE a `workers/payments/agent.mjs` that runs it on a cron
   trigger against KV-held state and the same policy shape, with the same four invariants asserted there.
5. **Receipts across devices.** A receipt export/import in the cohort file shape (`kind: "billing"`), so a coordinator
   can carry licences with the cohort; the audit line on import.
6. **Numbers a coordinator types.** The Budget form takes minor units; offer major-unit entry using `currencyExponent`
   (display only — storage stays minor, integer), and validate against `PM_MAX_SEATS` inline.

## Keep
No learner surface imports `payments.js` / `pm-agent.js` / `billing.js` (check 10 enforces it); no amount in code;
`fetch(` never spelled in the browser modules; the release-only-at-period-end rule (the oscillation is in TILL's memory).
