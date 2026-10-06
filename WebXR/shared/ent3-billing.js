// Billing adapters for organisation seat licences — OFF BY DEFAULT (console
// ENTERPRISE-3, docs/billing-adapters.md). A design with a mock provider and
// tests; it follows shared/mapbox.js's rule: nothing ships that could reach a
// vendor, and nothing is requested until a deployment configures it.
//
// The rules this module keeps, and tools/check_enterprise3.mjs proves:
//
//   - Off unless the deployment's auth-config.json carries a `billing` block
//     (it does not out of the box). ent3BillingConfig() returns null for the
//     public build, and an adapter made from null answers every call with
//     { ok: false, off: true } before touching anything.
//   - No key ships, ever. A block with a field named like a key, secret,
//     token, password or credential, or a value shaped like a live/test key,
//     is refused whole. Chargebee and PayPal both need SERVER-SIDE secrets, so
//     the browser never talks to either: it sends a plain request DESCRIPTOR
//     ({ provider, resource, action, body }) to the deployment's own https
//     proxy (`proxyEndpoint`, never a vendor host), and only through a
//     `transport` function the deployment hands in. This module has no fetch.
//   - The deployment's server maps each descriptor to the vendor's current API
//     (Chargebee: subscriptions with a per-seat item quantity, and entitlements
//     on a seat feature; PayPal: draft invoices) using its own credentials. The
//     descriptor names are this design's, not the vendors' endpoint paths.
//   - No price appears in the public build: descriptors carry seat counts and
//     references, never an amount — the vendor's catalogue (or the server)
//     prices the seat. The mock's invoices have `amount: null`.
//   - Crew Credits (TYCOON's play currency) never touch billing: any call that
//     names them is refused, and this module does not read the play economy.
//
// Every top-level name starts with `ent3`/`ENT3_` (the bundler shares one scope).

export const ENT3_BILLING_PROVIDERS = Object.freeze(["mock", "chargebee", "paypal"]);
/** The entitlement feature a seat licence grants (Chargebee "feature" in the server's catalogue). */
export const ENT3_SEAT_FEATURE = "holodeck-seats";
export const ENT3_MAX_SEATS = 1000;

/** What each provider does in this design. */
export const ENT3_BILLING_CAPABILITIES = Object.freeze({
  mock: ["seat-licence", "set-seats", "entitlements", "invoice"],
  chargebee: ["seat-licence", "set-seats", "entitlements"],
  paypal: ["seat-licence", "invoice"],
});

const ENT3_SECRET_FIELD = /(key|secret|token|password|passwd|credential|bearer|auth)/i;
const ENT3_SECRET_VALUE = /^(sk|rk|pk|live|test)_[A-Za-z0-9]{8,}|^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const ENT3_VENDOR_HOST = /(^|\.)(chargebee\.com|paypal\.com|paypalobjects\.com|braintreegateway\.com)$/i;
const ENT3_CREW = /crew[\s_-]?credit/i;

function ent3BillText(v, max = 80) { return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max); }

/** Clean one `billing` block; null when absent, unknown, or carrying anything secret. */
export function ent3CleanBilling(block) {
  if (!block || typeof block !== "object" || Array.isArray(block)) return null;
  for (const [k, v] of Object.entries(block)) {
    if (ENT3_SECRET_FIELD.test(k)) return null;
    if (typeof v === "string" && ENT3_SECRET_VALUE.test(v.trim()) && k !== "proxyEndpoint") return null;
    if (typeof v === "string" && ENT3_CREW.test(v)) return null;
  }
  const provider = ENT3_BILLING_PROVIDERS.includes(block.provider) ? block.provider : null;
  if (!provider) return null;
  if (provider === "mock") return { provider };
  let url = null;
  try { url = new URL(String(block.proxyEndpoint ?? "")); } catch (_) { return null; }
  if (url.protocol !== "https:" || ENT3_VENDOR_HOST.test(url.hostname) || url.username || url.password || url.search) return null;
  const out = { provider, proxyEndpoint: url.href.replace(/\/$/, "") };
  for (const k of ["site", "subscriptionRef", "itemPriceRef", "invoicerRef"]) if (block[k] != null) out[k] = ent3BillText(block[k], 80);
  return out;
}

/** The deployment's billing config from a parsed auth-config.json, or null (the public build). */
export function ent3BillingConfig(authConfig) { return ent3CleanBilling(authConfig?.billing ?? null); }

function ent3Seats(v) { const n = Number(v); return Number.isInteger(n) && n >= 0 && n <= ENT3_MAX_SEATS ? n : null; }
function ent3NamesCrew(args) { try { return ENT3_CREW.test(JSON.stringify(args ?? {})); } catch (_) { return true; } }

/**
 * An adapter over a cleaned config (or { provider: "mock" }). Options:
 * `transport(endpoint, descriptor) -> Promise<{ ok, data }>` — the only way a
 * hosted provider is reached; `now()` for deterministic tests.
 * Interface: describe(), getSeatLicence(orgId), setSeats(orgId, seats),
 * listEntitlements(orgId), createInvoice({ orgId, seats, reference }).
 */
export function ent3BillingAdapter(config, { transport = null, now = null } = {}) {
  const cfg = config?.provider === "mock" ? { provider: "mock" } : ent3CleanBilling(config);
  const clock = () => (typeof now === "function" ? now() : new Date().toISOString());
  const provider = cfg?.provider ?? null;
  const caps = provider ? ENT3_BILLING_CAPABILITIES[provider] : [];
  const mock = { subs: new Map(), invoices: [] };
  const off = () => ({ ok: false, off: true, reason: "billing is not configured for this deployment (no billing block in auth-config.json)" });
  const crew = () => ({ ok: false, reason: "Crew Credits are play currency and never touch billing" });
  const unsupported = (what) => ({ ok: false, unsupported: true, reason: `${provider} does not ${what} in this design (see docs/billing-adapters.md)` });

  async function send(resource, action, body) {
    if (typeof transport !== "function") return { ok: false, reason: "no transport: a hosted provider is reached only through the deployment's own transport and proxy" };
    const descriptor = { provider, resource, action, body };
    try {
      const r = await transport(cfg.proxyEndpoint, descriptor);
      return r && r.ok ? { ok: true, data: r.data ?? {} } : { ok: false, reason: r?.reason ?? "the deployment's proxy refused" };
    } catch (e) { return { ok: false, reason: `transport failed: ${ent3BillText(e?.message, 120)}` }; }
  }

  return {
    provider,
    enabled: !!provider,
    describe() { return { provider, enabled: !!provider, capabilities: caps.slice(), proxy: cfg?.proxyEndpoint ?? null, prices: "never in the public build" }; },

    async getSeatLicence(orgId) {
      if (!provider) return off();
      const org = ent3BillText(orgId, 80);
      if (provider === "mock") { const s = mock.subs.get(org); return { ok: true, seats: s?.seats ?? 0, status: s ? "active" : "none" }; }
      const r = provider === "chargebee"
        ? await send("subscription", "retrieve", { orgRef: org, subscriptionRef: cfg.subscriptionRef ?? null })
        : await send("invoice", "search-paid", { orgRef: org });
      return r.ok ? { ok: true, seats: ent3Seats(r.data.seats) ?? 0, status: ent3BillText(r.data.status, 20) || "unknown" } : r;
    },

    async setSeats(orgId, seats) {
      if (!provider) return off();
      if (ent3NamesCrew({ orgId, seats })) return crew();
      const n = ent3Seats(seats);
      if (n == null) return { ok: false, reason: `seats must be a whole number from 0 to ${ENT3_MAX_SEATS}` };
      const org = ent3BillText(orgId, 80);
      if (provider === "paypal") return unsupported("hold a seat quantity (it invoices; create an invoice instead)");
      if (provider === "mock") { mock.subs.set(org, { seats: n, at: clock() }); return { ok: true, seats: n }; }
      const r = await send("subscription", "update-seat-quantity", { orgRef: org, subscriptionRef: cfg.subscriptionRef ?? null, itemPriceRef: cfg.itemPriceRef ?? null, quantity: n });
      return r.ok ? { ok: true, seats: ent3Seats(r.data.seats) ?? n } : r;
    },

    async listEntitlements(orgId) {
      if (!provider) return off();
      const org = ent3BillText(orgId, 80);
      if (provider === "paypal") return unsupported("keep entitlements (seats come from paid invoices)");
      if (provider === "mock") { const s = mock.subs.get(org); return { ok: true, entitlements: s ? [{ feature: ENT3_SEAT_FEATURE, value: s.seats }] : [] }; }
      const r = await send("subscription-entitlements", "list", { orgRef: org, subscriptionRef: cfg.subscriptionRef ?? null, feature: ENT3_SEAT_FEATURE });
      return r.ok ? { ok: true, entitlements: (Array.isArray(r.data.entitlements) ? r.data.entitlements : []).map((e) => ({ feature: ent3BillText(e.feature, 60), value: e.value })) } : r;
    },

    async createInvoice(args = {}) {
      if (!provider) return off();
      if (ent3NamesCrew(args)) return crew();
      const n = ent3Seats(args.seats);
      if (!n) return { ok: false, reason: `an invoice needs 1 to ${ENT3_MAX_SEATS} seats` };
      const org = ent3BillText(args.orgId, 80); const reference = ent3BillText(args.reference, 80) || null;
      if (provider === "chargebee") return unsupported("raise a free-standing invoice (it invoices from the subscription; set seats instead)");
      if (provider === "mock") {
        const invoice = { id: `inv-mock-${String(mock.invoices.length + 1).padStart(4, "0")}`, orgId: org, seats: n, reference, amount: null, status: "draft", at: clock() };
        mock.invoices.push(invoice);
        return { ok: true, invoice: { ...invoice } };
      }
      const r = await send("invoice", "create-draft", { orgRef: org, invoicerRef: cfg.invoicerRef ?? null, reference, items: [{ name: "Holodeck seat licence", quantity: n }] });
      return r.ok ? { ok: true, invoice: { id: ent3BillText(r.data.invoiceId, 80), orgId: org, seats: n, reference, amount: null, status: "draft", at: clock() } } : r;
    },
  };
}
