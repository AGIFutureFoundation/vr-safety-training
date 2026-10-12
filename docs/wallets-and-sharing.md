# Wallets and sharing — what is shared, what never is, and how to revoke it

**The plain statement first: sharing is off by default, and nothing about a session leaves the browser until a person explicitly presses Share.** There is no background upload, no telemetry, and no "share anonymously" default hidden in a settings screen. Opting in writes one record to this browser; pressing Share is the one and only action that sends anything, and it sends it to the one relay a deployment configured — see [agent-protocols.md](agent-protocols.md) for that side of it.

Implementation: `WebXR/shared/wallet.js` (the wallet connection) and `WebXR/shared/share-engagement.js` (the opt-in flow and the bundle). Checker: `tools/check_share.mjs`.

## Why this exists

SmartCiti.X already runs software agents through its own stations for training and calibration (`WebXR/shared/robot.js`, `docs/robot-training.md`) — episodes an agent can be scored on, the same way a human learner is. This feature lets a person who *played* a station choose to contribute their own anonymised practice data alongside that, so agent-protocol platforms and the robots and software agents trained through them have real human practice patterns to learn from too, not only simulated ones. It is entirely optional and entirely separate from playing the stations themselves — no station, badge, or export requires it.

## The wallet (optional)

`shared/wallet.js` connects to whatever wallet extension is already in the browser:

- **Detection.** It dispatches the [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963) `eip6963:requestProvider` event and collects every `eip6963:announceProvider` reply, so a browser with more than one wallet extension installed lets a person pick the one they meant rather than whichever last overwrote `window.ethereum`. A browser with only the legacy `window.ethereum` and no EIP-6963 support still gets one entry for it. A browser with neither gets none, and the card says so plainly rather than showing a dead button.
- **Connecting** is `eth_requestAccounts` — a wallet only answers it after a person approves the connection in their own extension.
- **Chain and account changes** are listened for (`chainChanged`, `accountsChanged`) so the connected address shown never goes stale if it changes in the wallet's own UI.
- **Signing consent** is `personal_sign` ([EIP-191](https://eips.ethereum.org/EIPS/eip-191)) over a plain-text statement the wallet shows in full before it signs — see below for the exact text.

**What this module never does:** it never asks for, receives, stores, or has any code path that could receive a private key or a seed phrase. The only things it ever holds are a public address, a chain id, and a signature the wallet returned. A wallet is entirely optional — opting in without one still works, as a plain, unsigned local record.

## Opting in

Pressing **Opt in** (in SmartCiti.X's "Share to train agents & robots" card, or the same card on the homepage) does exactly one thing: it builds and stores a consent record in this browser. Nothing is sent anywhere by this step.

The consent record carries:

| Field | What it is |
|---|---|
| `licence` | `CC0` (public domain dedication) or `CC-BY-4.0` (attribution required) — the only two choices offered. |
| `mode` | `"wallet"` when a connected wallet signed the statement below, `"local"` otherwise. |
| `signature`, `address`, `chainId` | Present only in wallet mode — the `personal_sign` signature and the address and chain it came from. |
| `shares` | `{ episodeDigests: true, rollupScores: true }` — stated, not implied. |
| `neverShares` | `["name", "crewTag", "freeText", "rawIdentity"]` — stated, not implied. |
| `at`, `id` | When the consent was given, and a random id for it. |

The exact text a connected wallet is asked to sign (`consentStatement()` in `share-engagement.js`, kept byte-identical in `integrations/cloudflare/worker.js` so a relay can check a signature against the same words a person actually read):

```
I opt in to share my anonymised training engagement (episode digests and
roll-up scores only — no name, no free text, no raw identity) with
agent-protocol platforms and their relay, for training software agents
and robots.
Licence: <CC0 or CC-BY-4.0>.
This consent is revocable at any time and grants nothing else.
At: <timestamp>
```

## What is shared, and what never is

**Shared, once opted in and once Share is pressed:**

- Anonymised episode digests — station, category, stars, score, unsafe-action count, corrections, time against par, whether it passed. Where `shared/episodes.js` (another module, its own trajectory recorder) is present in a build, its own richer digest is used; while it is not, `share-engagement.js` falls back to a digest built from `shared/records.js`'s own attempt log, in exactly the same shape.
- The per-category roll-up scores `TrainingRecords.summary()` already keeps for the Training Records overlay.
- The consent record itself (licence, timestamp, and, for a wallet-signed consent, the public address and signature — never a private key).

**Never shared, under any circumstance:**

- A learner's name, display name, or self-typed crew tag.
- Any free text.
- Any launch identity from `shared/identity.js` (the id, name or home origin an LMS or portal handed this page).

`recordDigest()` in `share-engagement.js` is the one function that turns a training record into what can leave the browser, and it has no field for any of the above — `tools/check_share.mjs` asserts this directly.

## The bundle and the content hash

Pressing **Share** builds one bundle: the digests, the roll-up summary, the licence, and a `SHA-256` content hash (over the payload's canonical JSON — keys sorted recursively, so the hash is the same regardless of how the payload's own keys happened to be ordered when it was built). That bundle and the consent record are handed to one configured `shared/agent-protocols.js` adapter — by default, the `cloudflare-relay` adapter pointed at whatever endpoint a deployment has configured (see [agent-protocols.md](agent-protocols.md)). The relay checks the content hash against the payload it actually received, so a receipt is never issued for something that changed in transit.

A **receipt** — when it was sent, which provider, whether it succeeded, and the reason if not — is kept in this browser (`vr-training-share-receipts-v1`) and shown in the card's receipts list. Nothing else about a share is kept anywhere in the browser beyond that receipt and the consent record itself.

## Revoking

**Revoke** deletes the local consent record. It does not, and cannot, un-send a bundle a relay already received — the card says this plainly next to the button. Revoking simply means: nothing further is sent, and the browser no longer holds a signed opt-in. Past receipts stay in the receipts list as the record of what was shared while consent was active.

## What this is not

- Not a payment or token feature. Nothing here mints, transfers, or requires a token; a fee is never charged, requested or implied by this flow itself — see `integrations/cloudflare/README.md` for the one, entirely optional, payment-header passthrough a deployment may configure on its own relay.
- Not proof of identity. A wallet address is derived from a public key, not a verified real-world identity; this flow makes no claim about who controls an address beyond what the signature itself proves.
- Not a substitute for the training record. Training Records, exports and badges (`docs/proof-of-training.md`) work exactly as before, whether or not sharing is ever opted into.
