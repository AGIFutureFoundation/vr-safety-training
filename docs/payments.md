# Enterprise seat billing — plans as configuration, a provider-agnostic adapter, a budget agent, the Billing tab, the Worker handler

The platform trains individuals for free. An enterprise — a union hall, a school district, a company — licenses **seats**
for its cohorts on the organisation layer (`docs/enterprise.md`). That is the only money in the platform: **a learner
never buys anything**, nothing here is a price the platform set, and no key or secret is committed. Console:
`docs/consoles/TILL.md`. Checker: `node tools/check_payments.mjs`.

**The hard rules, stated once:** amounts are configuration (the `payments` block), null in the public build and shown
as "not configured" until a deployment writes its own; the shipped provider is null, so checkout returns null and
requests nothing; the on-device mock never leaves the device; the webhook secret lives only in the Worker's environment.

## 1. Configuration — the `payments` block of `WebXR/auth-config.json`

```jsonc
"payments": {
  "provider": null,            // null = no provider; "mock" = the on-device stub; any other name = a hosted-checkout provider you operate
  "publishableKey": null,      // a *publishable* key or null — never a secret (a key shaped sk_/rk_/whsec_ is dropped by the cleaner)
  "checkoutEndpoint": null,    // the https endpoint of your hosted provider's session creation (the mock needs none)
  "currency": null,            // ISO 4217 code, e.g. "USD"
  "currencyExponent": 2,       // minor-unit digits of that currency
  "plans": [                   // ids the console, the agent and the Worker refer to
    { "id": "seat-monthly", "name": "Seat, monthly", "period": "month", "periodDays": 30,  "amountMinor": null },
    { "id": "seat-annual",  "name": "Seat, annual",  "period": "year",  "periodDays": 365, "amountMinor": null }
  ]
}
```

`cleanPayments()` in `auth.js` parses it into `Auth.config.payments`; `parseAuthConfig` reads it **from the file only** —
a launch URL can neither name a provider nor set a price. An `amountMinor` is an integer in the currency's minor unit or
null; a fractional or negative value reads as null. Periods are `month`, `quarter`, `year` or `once`.

## 2. The adapter — `WebXR/shared/payments.js`

`pmCreateAdapter(config, { fetchImpl, now, random })` returns a fresh instance in the shape of `agent-protocols.js`:

| Call | What it does |
|---|---|
| `describe()` | provider, `configured`, what is `missing`, currency, plans with each amount displayed as configured; the key is reported as set or not, never echoed. |
| `quote(planId, seats, { orgId, cohortId })` | Pure: seats (1–1000) × the plan's configured amount → `{ unitMinor, subtotalMinor, totalMinor, priced, display }`. An unpriced plan quotes `priced: false` and "not configured". Nothing about tax is computed. |
| `checkout(quote)` | **No provider → `null`, nothing requested.** The mock → a stored session with a hosted-redirect *stub* (`#pm-checkout/<session>`, no navigation). A hosted provider refuses with `configure per the provider's current documentation` until `checkoutEndpoint` is set, then posts the quote through the `fetchImpl` it was handed (never the global fetch) and returns the provider's `https` redirect. Audited as `payment-checkout`. |
| `webhook(event)` | Validates the event (`pmValidateEvent`), applies it **once per event id** — a replay answers `duplicate: true` and changes nothing. `checkout.completed` writes one receipt and one licence and **provisions** the cohort (`enSetCohortSeats`: paying for more seats than planned grows the cohort; paying for fewer never removes anyone). `checkout.failed` closes the session; `payment.refunded` marks the receipt and ends its licence. Audited as `payment-receipt` / `payment-failed` / `payment-refund`. |
| `status(receipt)` | What this device holds about a receipt or session — never a claim beyond the events applied here. |
| `mockComplete(sessionId)`, `mockFail`, `mockRefund` | The mock provider's side: a deterministic event id per session (`evt-<session>-completed`), fed through `webhook()`. |

Store: **`vr-payments-v1`** through `gtStorage()` (a `GT_PROFILE_KEYS` entry, so private to the profile and gone with the
demo tab): `sessions`, `receipts` (`PM-<year>-<n>` numbers), `licences` (`active` / `released` / `refunded`, with a
period), `events` (ids applied) and `agent`. Helpers: `pmSeats(cohortId)` → `{ used, licensed, planned, licences }`;
`pmReleaseSeats(cohortId, n)` narrows licences never below the learners joined (no refund is implied);
`pmInvoiceSVG(receipt, { org, cohort, config })` — a procedural A4 SVG marked **"PROTOTYPE — NOT AN INVOICE"** twice,
escaped, no image or script; `pmLoadSample()` licenses the sample cohort through the mock.

Webhook event shape (the Worker accepts the same):
```jsonc
{ "id": "evt-…", "type": "checkout.completed" | "checkout.failed" | "payment.refunded", "sessionId": "cs-…", "at": "ISO",
  "seats": 12, "amountMinor": 1200, "currency": "USD", "planId": "seat-annual", "cohortId": "cohort-…", "orgId": "org-…" }
```

## 3. The Billing tab — `WebXR/instructor/js/billing.js`

The instructor console's fifth tab, built from `el()`/`textContent` only (`check_console` forbids markup from strings).
Panels: **Provider and plans** (as configured; with no provider "the on-device mock stands in — nothing is charged";
*Load sample billing*), **Seats** (used / licensed / planned per cohort, licence end; a quote form and *Checkout (mock)*;
open sessions with *Complete* / *Decline*), **Receipts and invoices (prototype — not an invoice)** with an *Invoice SVG*
download per receipt, **Budget** (§4) and the **payment lines of the audit log**. The enterprise block is honoured: the
organisation is named and the cohorts shown are those of the enabled programmes (`enEnabledProgrammes`). `pmSetConfig`
receives both blocks once `auth-config.json` is read.

## 4. The budget agent — `WebXR/shared/pm-agent.js`

A coordinator writes a **policy**: `planId`, `ceilingMinor` per `periodDays`, `seatFloor` and `seatCap` per cohort,
`autoRenew`, `releaseUnused`, `approvalThresholdMinor`. Every number is the coordinator's; none has a default amount.

The step is **pure and deterministic**: `pmAgentStep(state, policy, events, { config, now }) → { actions, state }`.
Events already in `state.seen` are skipped (idempotent across replays); the input state is never mutated; every action
carries a `reason` and becomes a decision (`state.decisions`, last 50). Event types and what the agent does:

| Event | Action |
|---|---|
| `cohort.filled` (used ≥ licensed) | Buy up to `min(cap, max(floor, planned, used)) − licensed` seats. |
| `licence.expiring` | With `autoRenew`: renew `max(used, floor)` seats (or the licence as it was when releasing is off); otherwise queue for a human (`renewal-off`). |
| `cohort.unused` (only at period end) | Release `licensed − max(used, floor)` seats and lower the planned seats to what is kept — so a release and a fill never chase each other. |
| `receipt.paid` | Provision the cohort. |
| `approval.granted` / `approval.denied` | Take the item off the queue and buy it (re-checking the ceiling) or drop it. |

Money is committed in one place, `pmConsider`: an **unpriced** plan → queue (`unpriced`); **no ceiling** set → queue
(`no-ceiling`); over the **remaining ceiling** → `refuse` and queue (`over-ceiling`) — a human approval cannot beat the
ceiling, only a new policy can; over the **approval threshold** → queue (`approval`); else a `checkout` action and the
spend is counted at once. **No action ever exceeds the ceiling.** The period rolls over when an event lands past its end.

`pmAgentRun(adapter, events, { config, now })` is the impure runner on this device: it executes the actions against the
adapter (quote → checkout → mock completion → receipt → `receipt.paid` → provision), releases through `pmReleaseSeats`,
and writes every new decision as an `agent-decision` audit line, so the trail re-reads the agent's reasoning.
`pmAgentEvents()` derives the events from the stores with deterministic ids (a second run of the same picture is a
replay). `pmAgentResolve(adapter, queueId, granted)` is the human's confirm or decline. A deployment can run the same
`pmAgentStep` in a Worker against a real provider — the step does not know where it runs.

## 5. The Worker handler — `workers/payments/handler.mjs`

Self-contained (no browser module, no provider SDK) for console EDGE's Worker to import by that exact path:

```js
import handle, { ROUTES } from "./workers/payments/handler.mjs";   // ROUTES = ["/api/payments/webhook", "/api/payments/status", "/api/payments/health"]
export default { fetch: (request, env) => handle(request, env) };
```

- **Signature check.** `x-pm-signature` is an HMAC-SHA256 (hex, optionally `sha256=`-prefixed) of the raw body under
  **`env.PAYMENTS_WEBHOOK_SECRET`** — read from the environment only, never a file here. No secret bound → **503** and
  nothing is processed; a missing or wrong signature → **401**; a malformed event → 422.
- **Idempotent receipts.** An event id is applied once; a replay answers 200 with `duplicate: true`. Receipts live in the
  KV namespace bound as `env.PAYMENTS_KV` (`get`/`put`), else in the isolate's memory (a dry run, honest about being
  per-isolate).
- `GET /api/payments/status?receipt=r-…` (or `?session=cs-…`) returns what the store holds; `/api/payments/health` says
  whether the secret and a store are bound. `validateEvent` is kept in step with `pmValidateEvent`.

## 7. Membership levels — `WebXR/shared/pm-membership.js`

The one purchase a person may make on this platform is an upgrade of **their own membership**. In-game items, rewards,
treasures and badges are never for sale (check 11 scans every world, game, quest and treasure module for a buy path).
Levels are configuration, the `levels` list of the `payments` block:

```jsonc
"levels": [
  { "id": "member",      "name": "Member",      "period": "once", "amountMinor": null,
    "entitlements": { "worlds": null, "programmes": null, "certificates": false, "cohortSeats": 0, "guideVoice": false } },
  { "id": "member-plus", "name": "Member Plus", "period": "year", "periodDays": 365, "amountMinor": null,
    "entitlements": { "worlds": null, "programmes": null, "certificates": true, "cohortSeats": 0, "guideVoice": true } }
]
```

The first level is the one every profile has. `worlds` / `programmes` null means all; `certificates` and `guideVoice`
are booleans; `cohortSeats` a number. A level's amount is whatever the block says — null in the repository, so no amount
is ever written in code or shown when the block has none (`pmLevelLine` reads "not configured"). The person's current
level lives in their private profile (`vr-membership-v1`, a `GT_PROFILE_KEYS` entry). `pmMyLevel(config)`,
`pmSetLevel(id)`, `pmHas(entitlement, config, value?)` — with no levels configured everything is granted, so the public
platform gates nothing. `pmMembershipQuote(adapter, levelId)` is a quote of one membership for its period; a paid
receipt whose quote is `kind: "membership"` sets the level through the hook `pmOnMembership` (no seat licence is
written). The public build ships `levels: null` (and `applePay`, `googlePay` null), so the platform stays free until a deployment configures them; the
"Upgrade" view reached from the account chip is the next phase (`tools/briefs/next/till-next.md`).

## 8. Wallet checkout — the W3C Payment Request API

`pmPaymentMethods(config, env)` offers **Apple Pay** (method identifier `https://apple.com/apple-pay`) and **Google Pay**
(`https://google.com/pay`) only when the block's `applePay` (`merchantIdentifier`, `countryCode`, `supportedNetworks`)
or `googlePay` (`merchantId`, `merchantName`, `gateway`, `gatewayMerchantId`, `allowedCardNetworks`, `environment`)
is filled in, the page is a secure context and the browser has `PaymentRequest`. Merchant identifiers, gateway names and
keys come from the block alone and are null in the repository; the checker (check 12) proves a `PaymentRequest` is never
constructed without a configured merchant, with an insecure context, without the API, or for an unpriced quote — the
wallet buttons stay hidden and the mock (or hosted) path stays. `pmRequestPayment(config, quote, env)` builds one
request for one priced quote and returns the wallet's own response (an opaque token for the deployment's relay to
verify with its processor — never parsed here) and `complete()`. What a deployment needs, in the vendors' own terms: an
Apple Pay merchant identifier and payment-processing certificate from an Apple developer account, and a Google Pay
merchant id with a supported gateway from the Google Pay & Wallet Console; the token then goes to that gateway, and its
webhook completes the receipt through `workers/payments/handler.mjs`.

## 9. Wallet passes as the membership card — `workers/passes/`

- `apple-pass.mjs` — `buildApplePass({ level, memberName, membershipId, env })` builds the `pass.json` (a *generic*
  pass: level, member name, membership id; no photo, no barcode, no location) and `manifest.json` (SHA-1 per file);
  `signApplePass` signs the manifest through `openssl smime` only when `APPLE_PASS_CERT_PATH`, `APPLE_PASS_KEY_PATH`
  and `APPLE_WWDR_CERT_PATH` exist in the environment — a Pass Type ID certificate from an Apple developer account and
  Apple's WWDR certificate — else the unsigned bundle comes back with `signed: false` and a note that says so. The pass
  type identifier and team identifier come from `APPLE_PASS_TYPE_ID` / `APPLE_TEAM_ID`, placeholders until set. The
  `.pkpass` zip (pass.json, manifest.json, signature, icons) is the deployment's packaging step.
- `google-pass.mjs` — `buildGooglePass(...)` builds the Generic pass class and object under `GOOGLE_WALLET_ISSUER_ID`
  (a placeholder until set); `buildGoogleSaveJwt` signs the "Save to Google Wallet" JWT (RS256, `typ: savetowallet`)
  only when `GOOGLE_WALLET_SA_KEY_PATH` names a Google Wallet issuer's service-account key file; else `jwt: null`.
- `handler.mjs` — the same contract as the payments handler (`export default handle(request, env)`, `ROUTES =
  ["/api/passes/apple", "/api/passes/google", "/api/passes/health"]`); the membership id must be the local handle
  (an e-mail or wallet address is refused). No identifier, certificate or key lives in the repository (check 13).

## 10. Checker — `tools/check_payments.mjs`

In `check_all`. Headless (Map storage, a DOM stub, no browser): nothing committed (every shipped value and amount null,
no secret by shape in the tree, the handler's secret from the environment, the block from the file only); quote maths on
a fixture block (`XTS`, the test currency); checkout without a provider → null with no request, a hosted provider only
through the fetch it is handed; webhook idempotency, provisioning and refund; the invoice; the Billing tab with the
sample (seat row, receipt row, invoice button, budget parts, a quote → checkout → completion through its own buttons);
the enterprise block honoured; the agent (never over the ceiling across sixty fills, over-threshold queued, approval
within and over the ceiling, replays idempotent, deterministic and pure, unpriced / no-ceiling / renewal-off queued; the
runner on the sample with every decision in the audit trail, a second run buying nothing, a confirm through the queue);
the Worker handler (503 / 401 / 200 / duplicate / status / health / KV); and that no learner surface imports the billing
modules.
