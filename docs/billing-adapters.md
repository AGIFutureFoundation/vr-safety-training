# Billing adapters for organisation seat licences (off by default)

Console ENTERPRISE-3 (`docs/consoles/ENTERPRISE-3.md`). Module `WebXR/shared/ent3-billing.js`; checker
`node tools/check_enterprise3.mjs` (checks 7–10). This is a **design with a mock provider and tests**. No live
Chargebee or PayPal call was made to build it, none ships, and none can happen from the public build.

## Where it sits

TILL's `shared/payments.js` (docs/payments.md) is the seat-checkout layer: quotes, a mock checkout, receipts and
licences per cohort. The adapters here are the narrower vendor seam an organisation's deployment would plug in
behind it: keep a **seat licence** in step with a billing system. They follow the Mapbox pattern
(`shared/mapbox.js`, docs/mapbox.md): nothing that could reach a vendor ships, and nothing is requested until the
deployment configures it.

## The interface

```js
import { ent3BillingConfig, ent3BillingAdapter } from "./shared/ent3-billing.js";
const adapter = ent3BillingAdapter(ent3BillingConfig(authConfig), { transport });
adapter.describe();                       // { provider, enabled, capabilities, proxy, prices: "never in the public build" }
await adapter.getSeatLicence(orgId);      // { ok, seats, status }
await adapter.setSeats(orgId, seats);     // { ok, seats }            (Chargebee, mock)
await adapter.listEntitlements(orgId);    // { ok, entitlements: [{ feature: "holodeck-seats", value }] }  (Chargebee, mock)
await adapter.createInvoice({ orgId, seats, reference }); // { ok, invoice: { id, seats, amount: null, status: "draft" } }  (PayPal, mock)
```

Every call answers `{ ok: false, off: true }` when billing is not configured, `{ ok: false, unsupported: true }`
when the provider does not do that in this design, and `{ ok: false, reason }` otherwise.

| Provider | What it does here | Request descriptors (`resource.action`) |
|---|---|---|
| `null` (default) | nothing: every call is refused before anything is touched | — |
| `mock` | in memory, deterministic, for tests and demos; invoices carry `amount: null` | — |
| `chargebee` | a subscription per organisation with a per-seat item quantity; entitlements on the `holodeck-seats` feature | `subscription.retrieve`, `subscription.update-seat-quantity`, `subscription-entitlements.list` |
| `paypal` | draft invoices for a number of seats; the seat licence is read from paid invoices | `invoice.create-draft`, `invoice.search-paid` |

Chargebee invoices from the subscription, so a free-standing `createInvoice` is unsupported; PayPal holds invoices,
not a seat quantity, so `setSeats` and `listEntitlements` are unsupported.

## The deployment config (none ships)

`WebXR/auth-config.json` carries no `billing` block, so `ent3BillingConfig()` returns `null`. A deployment that
wants billing adds:

```jsonc
"billing": {
  "provider": "chargebee",                          // or "paypal", or "mock"
  "proxyEndpoint": "https://billing.example.org/holodeck",  // the deployment's OWN server, https, never a vendor host
  "site": "…", "subscriptionRef": "…", "itemPriceRef": "…", "invoicerRef": "…"   // optional references, never secrets
}
```

A block is refused whole when any field is named like a key, secret, token, password or credential, when a value is
shaped like a live or test key, when the endpoint is plain http, carries credentials or a query, or is a Chargebee,
PayPal or Braintree host, when the provider is unknown, or when anything names Crew Credits.

## Why the browser never talks to the vendor

Both vendors authenticate with server-side secrets. So the browser builds a plain **request descriptor**
`{ provider, resource, action, body }` and hands it to a `transport(endpoint, descriptor)` function the deployment
passes in, addressed to the deployment's own proxy. The proxy maps each descriptor to the vendor's current API with
its own credentials, per the vendor's current documentation. The descriptor names are this design's, not the
vendors' endpoint paths, and this module contains no network call of its own (`fetch`, XHR, beacons and sockets are
checked absent).

## What it never does

- **No price in the public build.** Descriptors carry seat counts and references, never an amount; the vendor's
  catalogue or the deployment's server prices the seat. The checker scans the ent3 files and auth-config for prices.
- **Crew Credits never touch billing.** TYCOON's play currency (`shared/ty-economy.js`) is not read by this module,
  does not read it, and any call naming Crew Credits is refused.
- **No learner pays.** Seat licences belong to an organisation; the learner side has no purchase flow.
- **No partnership claim.** Chargebee and PayPal are named as the integration targets this design is shaped for,
  not as partners.

## Tests

`tools/check_enterprise3.mjs`: off by default (public auth-config → null; an off adapter answers nothing; a provider
without a transport refuses; zero transport and zero global fetch calls), ten refused configs, a deterministic mock,
the exact descriptor sequence through a fake transport (all to the deployment's proxy, none with an amount), and the
Crew Credits and price guards.
