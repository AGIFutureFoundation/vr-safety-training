# Training-engagement relay (Cloudflare Workers template)

A small Cloudflare Worker that accepts one thing: a training-engagement
share bundle a person explicitly opted in to send, from
`WebXR/shared/share-engagement.js`. It checks the bundle, checks the consent
behind it, stores a receipt, and hands the receipt back. It is a template —
every account-specific value in it is a placeholder, and the wallet and
payment pieces are pointers to Cloudflare's own current documentation, not a
description of a product this repository can verify or keep up to date.

## What this is not

- Not a wallet. It never asks for, receives or stores a private key or a
  seed phrase; the only cryptographic material it ever sees is a public
  signature, and the only thing it does with it is recover the public
  address that produced it (`crypto/secp256k1.js`) to check against the
  address the sender's own consent record claims.
- Not a payment processor. `PAYMENT_REQUIRED` and the `x-payment` /
  `x-payment-response` headers are a passthrough placeholder for an
  x402-style payment flow — this template names no fee, no token and no
  account, and charges nothing on its own. If your deployment wants a real
  payment or wallet feature that Cloudflare offers, configure it from your
  own dashboard against Cloudflare's current documentation for that
  product; this repository does not track or restate what that product does.
- Not an integration with Virtuals Protocol, SingularityNET, or any other
  named agent-protocol platform. It is the one relay adapter
  `shared/agent-protocols.js` calls `cloudflare-relay`; the other adapters
  in that module point at whatever endpoint a deployment configures for
  those platforms, following each platform's own current documentation.

## What it does

1. Rejects anything with no consent, or a consent whose `optIn` is not
   `true`. Nothing is stored without one.
2. For a wallet-signed consent (`consent.mode === "wallet"`), recovers the
   address behind its `personal_sign` (EIP-191) signature with a plain-JS
   Keccak-256 and secp256k1 implementation (`crypto/keccak256.js`,
   `crypto/secp256k1.js` — no WebCrypto algorithm covers this curve or hash),
   and rejects the request if that address does not match the one the
   consent declares. A `"local"` consent (no wallet was connected when the
   person opted in) is accepted as the unsigned, browser-only record it
   says it is.
3. Recomputes the bundle's content hash (`SHA-256` of the payload's
   canonical JSON, via `crypto.subtle` — a standard WebCrypto algorithm, used
   here because it is one) and rejects the request if it does not match the
   hash the sender declared, so a receipt is never issued for a payload that
   changed in transit.
4. Writes a small receipt — id, received-at time, the consent id, the
   licence and the content hash, nothing else — into whichever binding is
   configured (`RECEIPTS_KV` or `RECEIPTS_R2`; see `wrangler.toml`). Storage
   is best-effort: the handler still returns a receipt if neither binding is
   bound, which is useful while testing the flow before wiring one up.
5. Returns `{ ok: true, receipt }` on success, or `{ ok: false, reason }`
   with a 400/401/405 status on any of the refusals above.

Read the handler itself (`worker.js`) for the exact rules; the list above is
a summary, not a substitute for it.

## Configuring your own deployment

This template ships with **no** real endpoint, chain id, contract address,
KV namespace, R2 bucket, fee, token or account — every one of those is a
placeholder in `wrangler.toml`, marked `PLACEHOLDER-…`. Before deploying:

1. Read Cloudflare's current Workers documentation for `wrangler.toml`'s
   format (it changes over time; this file does not attempt to track it) and
   fill in your own `name`, `compatibility_date`, and either a `kv_namespaces`
   or an `r2_buckets` binding named `RECEIPTS_KV` / `RECEIPTS_R2` — get the
   real namespace id or bucket name from your own Cloudflare dashboard.
2. If your deployment wants payment enforcement, read Cloudflare's current
   documentation for whatever payment or wallet product you intend to use,
   configure it there, and only then set `PAYMENT_REQUIRED = "true"` — this
   template does not implement a payment product itself, only a header
   passthrough placeholder for one.
3. Point `WebXR/shared/agent-protocols.js`'s `cloudflare-relay` adapter's
   `endpoint` field at the deployed Worker's URL, from your own
   configuration — never hard-coded in that module (see
   `docs/agent-protocols.md`).
4. Deploy with `npx wrangler deploy`, again following Cloudflare's own
   current CLI documentation for authentication and account selection.

## Privacy posture

The relay only ever receives what a person explicitly chose to share by
pressing Share on an opt-in that defaults to off: anonymised episode digests
and roll-up scores, plus the consent record itself (a licence choice, a
timestamp, and — for a wallet-signed consent — a public address and
signature). It never receives a name, free text, or a launch identity from
`WebXR/shared/identity.js`; `WebXR/shared/share-engagement.js` is the one
place that decides what a bundle contains, and it does not carry those
fields to begin with. The relay does not verify who a wallet address
belongs to in the real world — it verifies only that the address in the
consent record is the one that actually produced the signature attached to
it.

## Testing

`tools/check_share.mjs` imports `handleRequest()` directly (a plain
`Request` and a fake `env` with an in-memory KV-like store — no Cloudflare
runtime, and no network, involved) and checks: a request with no consent is
refused, a wallet-mode consent with a valid signature (built from a
keypair generated at test time) is accepted and stored, a tampered
signature or a tampered bundle hash is refused, and a `"local"` consent
needs no signature at all. Run the whole suite with:

```
node tools/check_share.mjs
```
