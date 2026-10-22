/**
 * Opt-in sharing of training engagement, so agent-protocol platforms
 * (shared/agent-protocols.js) and the robots and software agents run
 * through them can train on real practice patterns.
 *
 * The default is off, and it stays off until a person presses Share:
 *   1. Opt in — build and store a consent record (what is shared, what
 *      never is, the licence choice, revocable at any time). Signed with a
 *      connected wallet (personal_sign / EIP-191, shared/wallet.js) when one
 *      is connected; otherwise a plain, unsigned local record. Either way
 *      this step only ever writes to this browser.
 *   2. Share — build a bundle from the consent and this browser's own
 *      training data, and POST it to one configured adapter
 *      (shared/agent-protocols.js). This is the only network call this
 *      module makes, and it never runs on its own.
 *
 * What is shared: anonymised episode digests and the per-category roll-up
 * scores shared/records.js already keeps.
 * What is never shared: a learner's name, crew tag, free text, or any
 * launch identity from shared/identity.js. `recordDigest()` below is the one
 * function that turns a training record into what leaves the browser, and it
 * carries no field that could name a person.
 *
 * ROBO2's shared/episodes.js (getEpisodes(), sessionDigest()) is a richer
 * trajectory recorder than the roll-up here, and this module speaks its
 * small interface the moment it exists — `loadEpisodesApi()` tries to import
 * it and falls back to a records.js-based digest while it is not yet in this
 * build, so this module works whether or not that file has landed.
 */

import { TrainingRecords } from "./records.js";
import { Wallet } from "./wallet.js";

const CONSENT_KEY = "vr-training-share-consent-v1";
const RECEIPTS_KEY = "vr-training-share-receipts-v1";
const MAX_RECEIPTS = 200;

/** The only two choices offered, spelled exactly as the licences themselves are. */
export const LICENCES = ["CC0", "CC-BY-4.0"];
export function cleanLicence(v) { return LICENCES.includes(v) ? v : null; }

// ---------------------------------------------------------- episodes.js hook

let episodesApiPromise = null;

/**
 * `{ getEpisodes(), sessionDigest(ep), source }` — ROBO2's module when it is
 * present in this build, a records.js-based fallback otherwise. Cached after
 * the first attempt so a missing module is not re-imported on every call.
 */
export function loadEpisodesApi() {
  if (episodesApiPromise) return episodesApiPromise;
  episodesApiPromise = (async () => {
    try {
      // A relative dynamic import, not in bundle_webxr.py's static module
      // chain: the bundler only tracks `import … from` lines, so this file
      // works whether shared/episodes.js exists in this checkout or not, and
      // a bundle built before it lands simply keeps the fallback below.
      const mod = await import("./episodes.js");
      if (typeof mod.getEpisodes === "function" && typeof mod.sessionDigest === "function") {
        return { getEpisodes: mod.getEpisodes, sessionDigest: mod.sessionDigest, source: "episodes" };
      }
    } catch (_) { /* shared/episodes.js is another team's module and may not be in this build yet */ }
    return { getEpisodes: () => TrainingRecords.list(), sessionDigest: recordDigest, source: "records-fallback" };
  })();
  return episodesApiPromise;
}

/** The anonymised shape of one attempt while shared/episodes.js is not yet
 * present: a station roll-up's worth of fields, nothing a person is named
 * by — no learner, learnerName, learnerId, homePage or crew tag. */
export function recordDigest(r) {
  return {
    app: r.app ?? null, simId: r.simId ?? null, category: r.category ?? null,
    stars: r.stars | 0, score: r.score | 0, hazardHits: r.hazardHits | 0, errors: r.errors | 0,
    seconds: r.seconds ?? null, parSeconds: r.parSeconds ?? null, passed: !!r.passed,
    interrupts: r.interrupts ?? null, at: r.at ?? null,
  };
}

// --------------------------------------------------------------- storage

function loadJson(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v ?? fallback; } catch (_) { return fallback; }
}
function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* private mode */ } }

// --------------------------------------------------------------- consent

/**
 * The exact text a connected wallet is asked to sign, and the text a plain
 * local consent carries verbatim — built once, deterministically, from only
 * the fields that make it into the stored record. `integrations/cloudflare/
 * worker.js` keeps a byte-identical copy so it can rebuild the same text and
 * check it against the signature without trusting anything else the page
 * sends; `tools/check_share.mjs` asserts the two never drift apart.
 */
export function consentStatement({ licence, at }) {
  return [
    "I opt in to share my anonymised training engagement (episode digests and",
    "roll-up scores only — no name, no free text, no raw identity) with",
    "agent-protocol platforms and their relay, for training software agents",
    "and robots.",
    `Licence: ${licence}.`,
    "This consent is revocable at any time and grants nothing else.",
    `At: ${at}`,
  ].join("\n");
}

function makeConsentId(crypto = globalThis.crypto) {
  const bytes = new Uint8Array(8);
  if (crypto?.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------- content hashing

/** A value with every object key sorted, recursively — so two payloads that
 * differ only in key order hash identically. */
function canonical(v) {
  if (Array.isArray(v)) return v.map(canonical);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])]));
  return v;
}
export function canonicalJson(value) { return JSON.stringify(canonical(value)); }

/** SHA-256 of the payload's canonical JSON, hex-encoded — deterministic
 * regardless of key order or object identity. Falls back to a small non-
 * cryptographic hash only where SubtleCrypto is unavailable (never in a
 * signed record, only as a last resort for the determinism check itself). */
export async function contentHash(payload, subtle = globalThis.crypto?.subtle) {
  const json = canonicalJson(payload);
  if (subtle?.digest) {
    const digest = await subtle.digest("SHA-256", new TextEncoder().encode(json));
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < json.length; i++) { h ^= json.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// ------------------------------------------------------------ the flow

export const ShareEngagement = {
  consent: null,

  load() { this.consent = loadJson(CONSENT_KEY, null); return this.consent; },

  get optedIn() { return !!this.consent?.optIn; },

  /**
   * Opt in. `wallet` defaults to the page's shared Wallet singleton; pass a
   * stub for a headless test. When a wallet is connected the consent is
   * signed with `personal_sign`; otherwise it is a plain local record. This
   * call only ever writes to this browser — nothing is sent anywhere yet.
   */
  async optIn({ licence, wallet = Wallet, crypto = globalThis.crypto } = {}) {
    const cleanLic = cleanLicence(licence);
    if (!cleanLic) return { ok: false, reason: `Choose a licence: ${LICENCES.join(" or ")}.` };
    const at = new Date().toISOString();
    const statement = consentStatement({ licence: cleanLic, at });
    let mode = "local", address = null, chainId = null, signature = null;
    if (wallet?.connected) {
      const signed = await wallet.signConsent(statement);
      if (!signed.signed) return { ok: false, reason: signed.reason || "The wallet did not sign the consent." };
      mode = "wallet"; address = wallet.address; chainId = wallet.chainId ?? null; signature = signed.signature;
    }
    const consent = {
      id: makeConsentId(crypto), at, licence: cleanLic, mode, address, chainId, signature, statement,
      optIn: true,
      shares: { episodeDigests: true, rollupScores: true },
      neverShares: ["name", "crewTag", "freeText", "rawIdentity"],
    };
    this.consent = consent;
    saveJson(CONSENT_KEY, consent);
    return { ok: true, consent };
  },

  /** Revoke. The local consent is deleted; a bundle already delivered to a
   * relay is not un-sent, which the UI says plainly. Past receipts are kept
   * as the record of what was shared while consent was active. */
  revoke() {
    this.consent = null;
    try { localStorage.removeItem(CONSENT_KEY); } catch (_) { /* ignore */ }
    return true;
  },

  /** Build the share bundle: digests + the roll-up summary + a content hash.
   * Returns null while not opted in — there is nothing to build without a
   * consent record to attach. */
  async buildBundle() {
    if (!this.optedIn) return null;
    const api = await loadEpisodesApi();
    const episodes = api.getEpisodes() ?? [];
    const digests = episodes.map((ep) => api.sessionDigest(ep));
    const payload = {
      digests, summary: TrainingRecords.summary(), licence: this.consent.licence,
      generatedAt: new Date().toISOString(), source: api.source,
    };
    const hash = await contentHash(payload);
    return { payload, hash, consentId: this.consent.id };
  },

  receipts() { return loadJson(RECEIPTS_KEY, []); },
  addReceipt(receipt) {
    const list = this.receipts();
    list.push(receipt);
    if (list.length > MAX_RECEIPTS) list.splice(0, list.length - MAX_RECEIPTS);
    saveJson(RECEIPTS_KEY, list);
    return list;
  },
  clearReceipts() { try { localStorage.removeItem(RECEIPTS_KEY); } catch (_) { /* ignore */ } },

  /**
   * The only call in this module that reaches the network, and only when a
   * person presses it: build the bundle, hand it and the consent to the
   * given shared/agent-protocols.js adapter, and record the receipt.
   * Refuses outright, with nothing built or sent, when not opted in.
   */
  async share(adapter) {
    if (!this.optedIn) return { ok: false, reason: "Opt in first — nothing is shared by default." };
    const bundle = await this.buildBundle();
    const result = await adapter.deliver(bundle, this.consent);
    const receipt = {
      at: new Date().toISOString(), provider: adapter.id, ok: !!result.ok,
      reason: result.reason ?? null, hash: bundle.hash, consentId: this.consent.id,
      receiptId: result.body?.receipt?.id ?? null,
    };
    this.addReceipt(receipt);
    return { ok: !!result.ok, receipt, result };
  },
};
