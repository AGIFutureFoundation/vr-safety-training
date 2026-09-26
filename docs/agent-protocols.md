# Agent protocols — a provider-agnostic adapter, deliberately unfilled

**The plain statement first: every adapter in `WebXR/shared/agent-protocols.js` ships with no endpoint, chain id, contract address, schema id, token or fee — every one of those fields starts `null`, and each adapter refuses to send anything until a deployment fills them in from that provider's own current documentation.** This file describes the generic shape the module offers, not how any named platform actually works: no version of a real protocol's API is restated here, because this repository has no way to keep that current, and a wrong restatement would be worse than none.

Implementation: `WebXR/shared/agent-protocols.js`. Checker: `tools/check_share.mjs`. See also [wallets-and-sharing.md](wallets-and-sharing.md) for the opt-in flow that hands a bundle to one of these adapters, and `integrations/cloudflare/README.md` for the one adapter this repository ships a working relay template for.

## The interface

Every adapter — whichever provider it is configured for — answers to the same four calls:

```js
adapter.describe()          // { id, fields, config, configured, missing }
adapter.offer(bundle)       // the first step: a job/service/attestation slot
adapter.deliver(bundle, consent)   // send the bundle plus its consent record
adapter.status(receipt)     // ask the configured endpoint about a receipt
```

`configure(fields)` sets an adapter's fields from a deployment's own values (never invented, never defaulted). `createAdapter(id)` returns a fresh, independently-configured instance — the module's own `Adapters` singleton is a convenience for a page that wants one of each, never a template for a value.

**Until every field an adapter needs is set, `offer()` and `deliver()` refuse outright, before touching the network, with exactly this message:**

```
configure per the provider's current documentation
```

`status()` never states or implies a live connection either — it only ever reports whatever the deployment's own configured endpoint answers, verbatim.

## The four adapters, and what "generic shape" means for each

| Adapter id | Generic shape | Fields (all start unset) |
|---|---|---|
| `virtuals` | An agent-commerce style job offer and deliverable — a work item is offered, and a bundle is delivered against it. | `endpoint`, `chainId`, `agentRegistryAddress`, `paymentTokenAddress` |
| `singularitynet` | A service-descriptor style offer with a payment-channel placeholder — a service call is offered, with a channel reference alongside it. | `endpoint`, `organizationId`, `serviceId`, `paymentChannelAddress` |
| `generic-attestation` | An on-chain attestation payload with a schema-id placeholder — usable against any attestation registry a deployment configures, named or not. | `endpoint`, `chainId`, `attestationRegistryAddress`, `schemaId` |
| `cloudflare-relay` | The relay template this repository actually ships and tests (`integrations/cloudflare/`) — still just a configured endpoint from this side. | `endpoint` |

Nothing above claims that Virtuals Protocol or SingularityNET actually work exactly this way, that these are their real field names, or that this module has ever spoken to either platform's live API. It is the generic shape an agent-commerce offer, a service-descriptor call, or an on-chain attestation takes — filled in against whichever real API a deployment is pointed at, per that platform's own current documentation, at deploy time. Before configuring an adapter for a named platform, read that platform's current developer documentation directly; this file and this module are not a substitute for it and will not track its changes.

## What never happens here

- **No default endpoint, chain, contract, token, fee or account, ever.** `describe()` shows every field exactly as it was left — `null` until a deployment sets it — and never fills a gap with a guess.
- **No send while unconfigured.** `offer()` and `deliver()` check every field before doing anything else; a partially-configured adapter (three of four fields set) still refuses, and `missing` in the refusal names exactly which fields are still unset.
- **No send without consent.** `deliver()` additionally refuses, separately from the configuration check, when the consent record handed to it does not carry `optIn: true` — even against a fully configured adapter.
- **No claim of live connectivity.** `status()` reports only what the endpoint answered; nothing here polls a chain, a platform, or an endpoint on its own initiative, and nothing here asserts that a delivery "succeeded on-chain" or similarly beyond what that one HTTP response actually said.

## Configuring an adapter

```js
import { createAdapter } from "./shared/agent-protocols.js";

const relay = createAdapter("cloudflare-relay");
relay.configure({ endpoint: "https://your-deployed-worker.example.workers.dev/share" });
// relay.describe().configured === true only once every field above is set.
```

Every value passed to `configure()` is a deployment's own choice, read from wherever that deployment's own current documentation says to find it — never from this repository. `WebXR/shared/share-engagement.js`'s `ShareEngagement.share(adapter)` is the one call in this codebase that actually invokes `deliver()`, and only ever after a person has both opted in and pressed Share.
