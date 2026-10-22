/**
 * A provider-agnostic adapter over the bundle shared/share-engagement.js
 * builds: `describe()`, `offer(bundle)`, `deliver(bundle, consent)`,
 * `status(receipt)` — the one shape every agent-protocol adapter speaks, so
 * the UI and the sharing flow never know or care which platform a
 * deployment pointed a given adapter at.
 *
 * Every adapter starts fully unconfigured: no endpoint, chain id, contract
 * address, schema id, token, fee or account is ever defaulted here. A field
 * only exists to be filled in by a deployment, from that provider's own
 * current documentation, at deploy time — never invented, assumed or
 * hard-coded in this file. Until every field an adapter needs is set,
 * `offer()` and `deliver()` refuse outright, before touching the network,
 * with the one sentence: "configure per the provider's current
 * documentation". `status()` never claims a live connection either — it
 * only ever reports what the deployment's own configured endpoint answers,
 * and says so.
 *
 * Four adapters, four generic shapes — never a description of how the named
 * platform actually works beyond this:
 *   virtuals             an agent-commerce style job offer and deliverable.
 *   singularitynet       a service-descriptor style offer with a payment-
 *                        channel placeholder.
 *   generic-attestation  an on-chain attestation payload with a schema-id
 *                        placeholder — usable against any attestation
 *                        registry a deployment configures, named or not.
 *   cloudflare-relay     the relay template in integrations/cloudflare/ —
 *                        still nothing but a configured endpoint from this
 *                        side; see integrations/cloudflare/README.md.
 */

const REFUSAL = "configure per the provider's current documentation";

/** Every schema field this adapter needs, always starting unset. */
const SCHEMAS = {
  virtuals: ["endpoint", "chainId", "agentRegistryAddress", "paymentTokenAddress"],
  singularitynet: ["endpoint", "organizationId", "serviceId", "paymentChannelAddress"],
  "generic-attestation": ["endpoint", "chainId", "attestationRegistryAddress", "schemaId"],
  "cloudflare-relay": ["endpoint"],
};

function isUnset(v) { return v == null || v === ""; }

async function postJson(endpoint, body, fetchImpl) {
  const fetchFn = fetchImpl ?? (typeof fetch === "function" ? fetch : null);
  if (!fetchFn) return { ok: false, reason: "This environment cannot reach the network." };
  try {
    const res = await fetchFn(endpoint, {
      method: "POST", mode: "cors", credentials: "omit",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    let json = null;
    try { json = await res.json(); } catch (_) { /* a relay may answer with no body */ }
    return { ok: !!res?.ok, status: res?.status ?? null, body: json };
  } catch (err) { return { ok: false, reason: err?.message ?? "the request failed" }; }
}

/**
 * One fresh adapter instance with its own configuration. Every deployment
 * (and every test) gets an isolated set of fields — configuring one adapter
 * never leaks into another, or into a previous test's adapter of the same
 * kind.
 */
export function createAdapter(id, { fetchImpl } = {}) {
  const fields = SCHEMAS[id];
  if (!fields) throw new Error(`agent-protocols: unknown adapter "${id}"`);
  const config = Object.fromEntries(fields.map((f) => [f, null]));

  function missingFields() { return fields.filter((f) => isUnset(config[f])); }
  function refuse() { return { ok: false, provider: id, reason: REFUSAL, missing: missingFields() }; }

  return {
    id,
    fields: [...fields],

    /** The adapter's current configuration and what is still unset. Never
     * guesses or fills in a value that was not explicitly configured. */
    describe() {
      const missing = missingFields();
      return { id, fields: [...fields], config: { ...config }, configured: missing.length === 0, missing };
    },

    /** Merge deployment-supplied fields. A field this adapter does not have
     * is silently dropped rather than accepted and ignored elsewhere. */
    configure(next = {}) {
      for (const f of fields) if (f in next) config[f] = next[f] ?? null;
      return this.describe();
    },

    /**
     * Offer the bundle for a job/service/attestation slot on the configured
     * endpoint — the generic first step every one of these shapes has in
     * common (a job offer, a service call, an attestation request). Refuses
     * with nothing sent while any field is unset.
     */
    async offer(bundle) {
      if (missingFields().length) return refuse();
      return { ok: true, provider: id, ...(await postJson(config.endpoint, { action: "offer", provider: id, bundle }, fetchImpl)) };
    },

    /**
     * Deliver the bundle plus its signed or local consent record. Refuses
     * outright, with nothing sent, when the adapter is unconfigured or the
     * consent was never actually given — this is the one place a bundle
     * would leave the page for this provider, and it never does so silently.
     */
    async deliver(bundle, consent) {
      if (missingFields().length) return refuse();
      if (!consent?.optIn) return { ok: false, provider: id, reason: "no consent to share" };
      return { ok: true, provider: id, ...(await postJson(config.endpoint, { action: "deliver", provider: id, bundle, consent }, fetchImpl)) };
    },

    /**
     * Ask the configured endpoint about a receipt. This never polls a chain
     * or a platform on the adapter's own initiative, and never states that a
     * delivery succeeded beyond what the endpoint's own answer says.
     */
    async status(receipt) {
      if (missingFields().length) return refuse();
      const result = await postJson(config.endpoint, { action: "status", provider: id, receiptId: receipt?.id ?? null }, fetchImpl);
      return { ok: !!result.ok, provider: id, receiptId: receipt?.id ?? null, remote: result.body ?? null };
    },
  };
}

/** The set of adapter kinds this module knows the generic shape of. */
export const ADAPTER_IDS = Object.keys(SCHEMAS);

/** Default, unconfigured instances — convenient for a page that wants one of
 * each; a test that configures an adapter should use createAdapter() instead
 * so its configuration cannot leak into another test or another caller. */
export const Adapters = Object.fromEntries(ADAPTER_IDS.map((id) => [id, createAdapter(id)]));

export function adapterById(id) { return Adapters[id] ?? null; }
export function listAdapters() { return ADAPTER_IDS.map((id) => Adapters[id].describe()); }
