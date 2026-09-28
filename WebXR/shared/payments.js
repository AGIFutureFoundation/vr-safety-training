// Enterprise seat billing on the organisation layer (console TILL,
// docs/payments.md). The platform trains individuals for free; an
// organisation licenses seats for its cohorts. A learner never buys anything
// here, and nothing in this file is a price: amounts are whatever the
// `payments` block of auth-config.json says (null in the public build, shown
// as "not configured").
//
// The adapter mirrors shared/agent-protocols.js — `describe()`, `quote()`,
// `checkout()`, `webhook()`, `status()` — so the console never knows which
// provider a deployment pointed it at:
//
//   provider null    no provider: checkout() returns null and requests nothing.
//   provider "mock"  the on-device stub: a checkout is a session with a
//                    hosted-redirect *stub* (a fragment, no navigation); the
//                    mock "completes" it by feeding a signed-shape event to
//                    webhook(). Nothing leaves the device.
//   any other name   a hosted-checkout provider the deployment operates,
//                    reached only through a fetch implementation the caller
//                    hands in and a checkoutEndpoint the block names; until
//                    both exist checkout() refuses with nothing sent.
//
// One store, `vr-payments-v1`, through profiles.js's gtStorage() (a private
// profile key like vr-org-v1): checkout sessions, receipts, licences, the
// event ids already applied (idempotency) and the budget agent's state
// (pm-agent.js). Coordinator-facing lines go through org.js's enAudit so they
// sit in the organisation's own audit log.
//
// The bundler concatenates every module into one scope and erases import
// aliases, so every top-level name here starts with `pm`/`PM_`.

import { gtStorage } from "./profiles.js";
import { enAudit, enCohort, enCohorts, enMembers, enOrg, enSetCohortSeats, enLoadSample } from "./org.js";

export const PM_KEY = "vr-payments-v1";
export const PM_SCHEMA_VERSION = 1;
export const PM_MOCK = "mock";
export const PM_REFUSAL = "configure per the provider's current documentation";
export const PM_EVENT_TYPES = ["checkout.completed", "checkout.failed", "payment.refunded"];
export const PM_MAX_SEATS = 1000;
const PM_MAX_EVENTS = 2000;

// ------------------------------------------------------------------ store

function pmStore() { try { return gtStorage(); } catch (_) { return null; } }

function pmText(v, max = 80) { return String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").trim().slice(0, max); }

function pmId(prefix, random = null) {
  const bytes = new Uint8Array(6);
  if (typeof random === "function") { for (let i = 0; i < 6; i += 1) bytes[i] = Math.floor(random() * 256) & 255; }
  else { try { globalThis.crypto.getRandomValues(bytes); } catch (_) { for (let i = 0; i < 6; i += 1) bytes[i] = Math.floor(Math.random() * 256); } }
  return `${prefix}-${[...bytes].map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

/** An empty store. */
export function pmEmpty() { return { v: PM_SCHEMA_VERSION, sessions: [], receipts: [], licences: [], events: [], agent: null }; }

/** The store as it stands (never throws; a damaged value reads as empty). */
export function pmLoad() {
  try {
    const raw = JSON.parse(pmStore()?.getItem(PM_KEY) || "null");
    if (!raw || raw.v !== PM_SCHEMA_VERSION) return pmEmpty();
    return {
      v: PM_SCHEMA_VERSION,
      sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
      receipts: Array.isArray(raw.receipts) ? raw.receipts : [],
      licences: Array.isArray(raw.licences) ? raw.licences : [],
      events: Array.isArray(raw.events) ? raw.events : [],
      agent: raw.agent && typeof raw.agent === "object" ? raw.agent : null,
    };
  } catch (_) { return pmEmpty(); }
}

export function pmSave(state) {
  try { pmStore()?.setItem(PM_KEY, JSON.stringify(state)); return true; } catch (_) { return false; }
}

function pmEmit(kind) {
  try { globalThis.dispatchEvent?.(new CustomEvent("pm:change", { detail: { kind } })); } catch (_) { /* headless */ }
}

/** Forget every session, receipt, licence and agent decision of this profile. */
export function pmClear() { try { pmStore()?.removeItem(PM_KEY); } catch (_) { /* ignore */ } pmEmit("clear"); }

// ------------------------------------------------------------------ money

/** A configured amount as text, or "not configured" — never a number this file made up. */
export function pmMoney(amountMinor, config = {}) {
  if (!Number.isInteger(amountMinor)) return "not configured";
  const exp = Number.isInteger(config?.currencyExponent) ? config.currencyExponent : 2;
  const major = (amountMinor / 10 ** exp).toFixed(exp);
  return config?.currency ? `${major} ${config.currency}` : `${major} (currency not configured)`;
}

/** The plan with this id from a cleaned `payments` block, or null. */
export function pmPlan(config, planId) { return (config?.plans ?? []).find((p) => p.id === planId) ?? null; }

/** Whole seats between 1 and PM_MAX_SEATS, or null. */
export function pmSeatCount(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= PM_MAX_SEATS ? n : null;
}

/**
 * A quote, pure: seats × the plan's configured amount per seat per period.
 * `priced` is false while the plan's amount is null; the quote still exists
 * so the console can show what would be licensed. Nothing about tax is
 * computed here — that is the provider's at checkout, per its own rules.
 */
export function pmQuote(config, planId, seats, { orgId = null, cohortId = null, now = new Date().toISOString(), random = null } = {}) {
  const plan = pmPlan(config, planId);
  const n = pmSeatCount(seats);
  if (!plan || !n) return null;
  const unit = Number.isInteger(plan.amountMinor) ? plan.amountMinor : null;
  const subtotal = unit == null ? null : unit * n;
  return {
    id: pmId("q", random), planId: plan.id, plan: { id: plan.id, name: plan.name, period: plan.period, periodDays: plan.periodDays },
    seats: n, unitMinor: unit, subtotalMinor: subtotal, totalMinor: subtotal,
    currency: config?.currency ?? null, currencyExponent: Number.isInteger(config?.currencyExponent) ? config.currencyExponent : 2,
    priced: unit != null,
    display: { unit: pmMoney(unit, config), total: pmMoney(subtotal, config) },
    orgId: orgId ?? null, cohortId: cohortId ?? null, provider: config?.provider ?? null, createdAt: now,
    note: "Seats × the configured amount per seat per period, before anything the provider adds at checkout.",
  };
}

// ------------------------------------------------------------------ events

/** What is wrong with a webhook event, as a list (empty when it is well formed). */
export function pmValidateEvent(ev) {
  const errors = [];
  if (!ev || typeof ev !== "object") return ["not an object"];
  if (!/^evt-[A-Za-z0-9._-]{4,80}$/.test(String(ev.id ?? ""))) errors.push("id must read evt-…");
  if (!PM_EVENT_TYPES.includes(ev.type)) errors.push(`type must be one of ${PM_EVENT_TYPES.join(", ")}`);
  if (!/^(cs|sess)-[A-Za-z0-9._-]{4,80}$/.test(String(ev.sessionId ?? ""))) errors.push("sessionId must name a checkout session");
  if (ev.amountMinor != null && !(Number.isInteger(ev.amountMinor) && ev.amountMinor >= 0)) errors.push("amountMinor must be a non-negative integer or null");
  if (ev.seats != null && !pmSeatCount(ev.seats)) errors.push(`seats must be 1–${PM_MAX_SEATS}`);
  if (ev.currency != null && !/^[A-Z]{3}$/.test(String(ev.currency))) errors.push("currency must be a three-letter code");
  if (typeof ev.at !== "string" || Number.isNaN(new Date(ev.at).getTime())) errors.push("at must be an ISO date");
  return errors;
}

// ---------------------------------------------------------------- licences

/**
 * Seats for a cohort: `used` (learners joined), `planned` (the cohort's own
 * seat count), `licensed` (paid seats whose period has not ended) and the
 * licences behind that number.
 */
export function pmSeats(cohortId, now = new Date().toISOString()) {
  const cohort = enCohort(cohortId);
  if (!cohort) return null;
  const licences = pmLoad().licences.filter((l) => l.cohortId === cohortId && l.state === "active" && (!l.periodEnd || l.periodEnd >= now));
  const licensed = licences.reduce((a, l) => a + (l.seats | 0), 0);
  const used = enMembers(cohortId).filter((m) => m.role === "learner").length;
  return { cohortId, used, planned: cohort.seats, licensed, licences };
}

/** Every cohort's seats, for the billing tab. */
export function pmSeatsAll(now = new Date().toISOString()) { return enCohorts().map((c) => pmSeats(c.id, now)).filter(Boolean); }

/** Licences ending within `days` of `now` (the agent's renewals). */
export function pmExpiring(days = 14, now = new Date().toISOString()) {
  const limit = new Date(new Date(now).getTime() + days * 86400000).toISOString();
  return pmLoad().licences.filter((l) => l.state === "active" && l.periodEnd && l.periodEnd >= now && l.periodEnd <= limit);
}

/**
 * Release unused seats of a cohort: the newest licences shrink by `seats`,
 * never below the learners already joined. No refund is implied or computed
 * here — a release only narrows what the organisation keeps licensed.
 */
export function pmReleaseSeats(cohortId, seats, reason = "") {
  const n = pmSeatCount(seats);
  const view = pmSeats(cohortId);
  if (!n || !view) return { ok: false, released: 0 };
  const canRelease = Math.max(0, Math.min(n, view.licensed - view.used));
  if (!canRelease) return { ok: true, released: 0 };
  const s = pmLoad();
  let left = canRelease;
  for (const l of s.licences.filter((x) => x.cohortId === cohortId && x.state === "active").reverse()) {
    if (!left) break;
    const take = Math.min(left, l.seats);
    l.seats -= take; left -= take;
    if (l.seats === 0) l.state = "released";
  }
  pmSave(s);
  enAudit("payment-release", `${enCohort(cohortId)?.name ?? cohortId}: ${canRelease} seat(s) released${reason ? ` (${pmText(reason, 120)})` : ""}`);
  pmEmit("licence");
  return { ok: true, released: canRelease };
}

// ----------------------------------------------------------------- adapter

/**
 * One adapter over a cleaned `payments` block (auth.js's cleanPayments). A
 * fresh instance per caller, like agent-protocols.js's createAdapter: its
 * configuration never leaks into another. `fetchImpl` is the only way a
 * hosted provider is ever reached; `now`/`random` make a test deterministic.
 */
export function pmCreateAdapter(config = {}, { fetchImpl = null, now = null, random = null } = {}) {
  const cfg = {
    provider: config?.provider ?? null, publishableKey: config?.publishableKey ?? null, checkoutEndpoint: config?.checkoutEndpoint ?? null,
    currency: config?.currency ?? null, currencyExponent: Number.isInteger(config?.currencyExponent) ? config.currencyExponent : 2,
    plans: (config?.plans ?? []).map((p) => ({ ...p })),
  };
  const clock = () => (typeof now === "function" ? now() : new Date().toISOString());
  const isMock = () => cfg.provider === PM_MOCK;
  const missing = () => {
    const out = [];
    if (!cfg.provider) out.push("provider");
    if (!cfg.currency) out.push("currency");
    if (!cfg.plans.length) out.push("plans");
    else if (!cfg.plans.some((p) => Number.isInteger(p.amountMinor))) out.push("plans[].amountMinor");
    if (cfg.provider && !isMock() && !cfg.checkoutEndpoint) out.push("checkoutEndpoint");
    return out;
  };

  function applyEvent(ev, state) {
    const session = state.sessions.find((s) => s.id === ev.sessionId) ?? null;
    if (ev.type === "checkout.completed") {
      if (!session) return { ok: false, reason: "unknown checkout session" };
      const q = session.quote;
      const seats = pmSeatCount(ev.seats) ?? q.seats;
      const plan = pmPlan(cfg, ev.planId ?? q.planId) ?? q.plan;
      const start = ev.at;
      const end = plan?.periodDays ? new Date(new Date(start).getTime() + plan.periodDays * 86400000).toISOString() : null;
      const receipt = {
        id: `r-${ev.id.slice(4)}`, eventId: ev.id, sessionId: session.id, quoteId: q.id, provider: cfg.provider,
        orgId: q.orgId, cohortId: q.cohortId, planId: plan?.id ?? q.planId, seats,
        amountMinor: Number.isInteger(ev.amountMinor) ? ev.amountMinor : q.totalMinor, currency: ev.currency ?? q.currency,
        state: "paid", at: ev.at, periodStart: start, periodEnd: end, number: `PM-${String(ev.at).slice(0, 4)}-${String(state.receipts.length + 1).padStart(4, "0")}`,
      };
      state.receipts.push(receipt);
      session.state = "completed"; session.receiptId = receipt.id;
      if (receipt.cohortId) state.licences.push({ id: `lic-${receipt.id.slice(2)}`, receiptId: receipt.id, cohortId: receipt.cohortId, planId: receipt.planId, seats, state: "active", periodStart: start, periodEnd: end });
      return { ok: true, receipt, session };
    }
    if (ev.type === "checkout.failed") {
      if (!session) return { ok: false, reason: "unknown checkout session" };
      session.state = "failed"; session.failedAt = ev.at; session.reason = pmText(ev.reason, 120) || "declined by the provider";
      return { ok: true, receipt: null, session };
    }
    // payment.refunded: the receipt of that session is marked and its licence ends now.
    const receipt = state.receipts.find((r) => r.sessionId === ev.sessionId) ?? null;
    if (!receipt) return { ok: false, reason: "no receipt for that session" };
    receipt.state = "refunded"; receipt.refundedAt = ev.at;
    for (const l of state.licences) if (l.receiptId === receipt.id) { l.state = "refunded"; l.periodEnd = ev.at; }
    return { ok: true, receipt, session };
  }

  return {
    id: cfg.provider,

    /** The configuration as it stands; the key is reported as set or not, never echoed. */
    describe() {
      const miss = missing();
      return {
        provider: cfg.provider, mock: isMock(), configured: miss.length === 0, missing: miss,
        currency: cfg.currency, currencyExponent: cfg.currencyExponent, publishableKey: cfg.publishableKey ? "set" : null,
        checkoutEndpoint: cfg.checkoutEndpoint ? "set" : null,
        plans: cfg.plans.map((p) => ({ ...p, display: pmMoney(p.amountMinor, cfg) })),
      };
    },

    /** Merge a deployment's fields; unknown ones are dropped. */
    configure(next = {}) {
      for (const f of ["provider", "publishableKey", "checkoutEndpoint", "currency", "currencyExponent"]) if (f in next) cfg[f] = next[f] ?? null;
      if (Array.isArray(next.plans)) cfg.plans = next.plans.map((p) => ({ ...p }));
      return this.describe();
    },

    /** A quote for `seats` on `planId` (pure; nothing stored, nothing sent). */
    quote(planId, seats, ctx = {}) { return pmQuote(cfg, planId, seats, { ...ctx, now: clock(), random }); },

    /**
     * Start a checkout for a quote. No provider → null, and nothing was
     * requested. The mock → a session with a hosted-redirect stub. A hosted
     * provider → refuses until configured; then posts the quote through the
     * fetch implementation the caller handed in and returns what came back.
     */
    async checkout(quote) {
      if (!cfg.provider) return null;
      if (!quote?.id || !pmPlan(cfg, quote.planId) || !pmSeatCount(quote.seats)) return { ok: false, provider: cfg.provider, reason: "not a quote from this adapter" };
      const miss = missing();
      if (miss.length && !(isMock() && miss.every((m) => m === "currency" || m.startsWith("plans")))) return { ok: false, provider: cfg.provider, reason: PM_REFUSAL, missing: miss };
      const s = pmLoad();
      const session = { id: pmId("cs", random), quoteId: quote.id, quote: { ...quote }, provider: cfg.provider, state: "open", createdAt: clock() };
      if (isMock()) {
        session.redirect = { kind: "hosted-redirect-stub", href: `#pm-checkout/${session.id}`, note: "The mock provider never leaves this device: nothing is navigated to and nothing is charged. Complete or fail the session from the console." };
      } else {
        if (typeof fetchImpl !== "function") return { ok: false, provider: cfg.provider, reason: "This page was given no way to reach the provider.", missing: ["fetchImpl"] };
        let res = null;
        try {
          res = await fetchImpl(cfg.checkoutEndpoint, { method: "POST", mode: "cors", credentials: "omit", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "checkout", provider: cfg.provider, quote, publishableKey: cfg.publishableKey }) });
        } catch (err) { return { ok: false, provider: cfg.provider, reason: err?.message ?? "the request failed" }; }
        let body = null; try { body = await res.json(); } catch (_) { /* no body */ }
        if (!res?.ok || typeof body?.redirectUrl !== "string" || !/^https:\/\//.test(body.redirectUrl)) return { ok: false, provider: cfg.provider, reason: "the provider did not return a hosted checkout", status: res?.status ?? null };
        session.redirect = { kind: "hosted-redirect", href: body.redirectUrl, note: "Open the provider's hosted checkout; the receipt arrives by webhook." };
        if (typeof body.sessionId === "string" && /^[A-Za-z0-9._-]{4,80}$/.test(body.sessionId)) session.providerSessionId = body.sessionId;
      }
      s.sessions.push(session);
      pmSave(s);
      enAudit("payment-checkout", `${enCohort(quote.cohortId)?.name ?? "no cohort"}: ${quote.seats} seat(s) on ${quote.plan?.name ?? quote.planId}, ${quote.display?.total ?? pmMoney(quote.totalMinor, cfg)} · session ${session.id}${isMock() ? " (mock)" : ""}`);
      pmEmit("session");
      return { ok: true, provider: cfg.provider, session, redirect: session.redirect };
    },

    /**
     * Apply a provider event. Idempotent by event id: a replay answers
     * `duplicate: true` and changes nothing. A paid checkout writes one
     * receipt and one licence, and provisions the cohort's seats (org.js).
     */
    webhook(event) {
      const errors = pmValidateEvent(event);
      if (errors.length) return { ok: false, reason: errors[0], errors };
      const s = pmLoad();
      const seen = s.events.find((e) => e.id === event.id);
      if (seen) return { ok: true, duplicate: true, receipt: s.receipts.find((r) => r.eventId === event.id) ?? s.receipts.find((r) => r.sessionId === event.sessionId) ?? null };
      const r = applyEvent(event, s);
      if (!r.ok) return { ok: false, duplicate: false, reason: r.reason };
      s.events.push({ id: event.id, type: event.type, at: event.at });
      if (s.events.length > PM_MAX_EVENTS) s.events.splice(0, s.events.length - PM_MAX_EVENTS);
      pmSave(s);
      if (event.type === "checkout.completed" && r.receipt) {
        enAudit("payment-receipt", `${r.receipt.number}: ${r.receipt.seats} seat(s) for ${enCohort(r.receipt.cohortId)?.name ?? "no cohort"}, ${pmMoney(r.receipt.amountMinor, cfg)}`);
        // Provision: paying for more seats than the cohort planned grows it; paying for fewer never cuts anyone.
        if (r.receipt.cohortId) { const v = pmSeats(r.receipt.cohortId, event.at); if (v && v.licensed > v.planned) enSetCohortSeats(r.receipt.cohortId, v.licensed, `licence ${r.receipt.number}`); }
      } else if (event.type === "checkout.failed") enAudit("payment-failed", `session ${event.sessionId}: ${r.session.reason}`);
      else if (event.type === "payment.refunded") enAudit("payment-refund", `${r.receipt.number} refunded; its licence ended`);
      pmEmit("receipt");
      return { ok: true, duplicate: false, receipt: r.receipt, session: r.session };
    },

    /** What this device knows about a receipt or a session — never a claim beyond the events applied here. */
    status(receipt) {
      const s = pmLoad();
      const id = typeof receipt === "string" ? receipt : receipt?.id ?? receipt?.receiptId ?? null;
      const r = s.receipts.find((x) => x.id === id) ?? null;
      if (r) return { ok: true, provider: cfg.provider, kind: "receipt", id: r.id, state: r.state, receipt: r, session: s.sessions.find((x) => x.id === r.sessionId) ?? null };
      const sess = s.sessions.find((x) => x.id === id) ?? null;
      if (sess) return { ok: true, provider: cfg.provider, kind: "session", id: sess.id, state: sess.state, session: sess, receipt: s.receipts.find((x) => x.sessionId === sess.id) ?? null };
      return { ok: false, provider: cfg.provider, reason: "unknown receipt or session" };
    },

    /** The mock provider completes an open session: one deterministic event (replay-safe) through webhook(). */
    mockComplete(sessionId) {
      if (!isMock()) return { ok: false, reason: "only the mock provider completes a session on this device" };
      const sess = pmLoad().sessions.find((x) => x.id === sessionId);
      if (!sess) return { ok: false, reason: "unknown checkout session" };
      const q = sess.quote;
      return this.webhook({ id: `evt-${sess.id}-completed`, type: "checkout.completed", sessionId: sess.id, at: clock(), amountMinor: q.totalMinor, currency: q.currency, seats: q.seats, planId: q.planId, cohortId: q.cohortId, orgId: q.orgId });
    },

    /** The mock provider declines an open session. */
    mockFail(sessionId, reason = "declined (mock)") {
      if (!isMock()) return { ok: false, reason: "only the mock provider fails a session on this device" };
      const sess = pmLoad().sessions.find((x) => x.id === sessionId);
      if (!sess) return { ok: false, reason: "unknown checkout session" };
      return this.webhook({ id: `evt-${sess.id}-failed`, type: "checkout.failed", sessionId: sess.id, at: clock(), reason });
    },

    /** The mock provider refunds a paid session. */
    mockRefund(sessionId) {
      if (!isMock()) return { ok: false, reason: "only the mock provider refunds on this device" };
      return this.webhook({ id: `evt-${sessionId}-refunded`, type: "payment.refunded", sessionId, at: clock() });
    },
  };
}

// ----------------------------------------------------------------- invoice

function pmEsc(s) { return String(s ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }

/**
 * A receipt as a printable procedural SVG (A4 portrait in millimetres):
 * organisation, cohort, plan, seats, period, the configured amount (or "not
 * configured") — and "PROTOTYPE — NOT AN INVOICE" twice. No logo, no image,
 * no script; every text is escaped. It evidences a mock or configured
 * checkout on this device; it is not a tax document.
 */
export function pmInvoiceSVG(receipt, { org = null, cohort = null, config = {} } = {}) {
  if (!receipt?.id) return null;
  const W = 210, H = 297;
  const colour = /^#[0-9a-fA-F]{6}$/.test(String(org?.colour ?? "")) ? org.colour : "#4fd1ff";
  const plan = pmPlan(config, receipt.planId);
  const money = (v) => pmMoney(v, { currency: receipt.currency ?? config?.currency ?? null, currencyExponent: config?.currencyExponent });
  const unit = Number.isInteger(receipt.amountMinor) && receipt.seats ? Math.round(receipt.amountMinor / receipt.seats) : null;
  const row = (y, label, value) => `<text x="22" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="4.2" fill="#3a4656">${pmEsc(label)}</text><text x="${W - 22}" y="${y}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="4.2" fill="#1a2230">${pmEsc(value)}</text>`;
  const line = (y) => `<line x1="20" y1="${y}" x2="${W - 20}" y2="${y}" stroke="${colour}" stroke-width="0.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}mm" height="${H}mm" viewBox="0 0 ${W} ${H}" role="img" aria-label="Seat licence receipt — prototype, not an invoice">
<rect width="${W}" height="${H}" fill="#fbfbf7"/>
<rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="${colour}" stroke-width="1.2"/>
<text x="22" y="28" font-family="Georgia, serif" font-size="7" letter-spacing="1" fill="#1a2230">${pmEsc((org?.name ?? "Organisation").toUpperCase())}</text>
<text x="${W - 22}" y="28" text-anchor="end" font-family="Georgia, serif" font-size="9" fill="#1a2230">Seat licence receipt</text>
<text x="${W - 22}" y="36" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="4.2" fill="#3a4656">${pmEsc(receipt.number ?? receipt.id)} · ${pmEsc(String(receipt.at ?? "").slice(0, 10))}</text>
${line(42)}
${row(54, "Cohort", `${cohort?.name ?? "—"}${cohort?.edition ? ` · ${cohort.edition}` : ""}`)}
${row(62, "Plan", `${plan?.name ?? receipt.planId ?? "—"} (${plan?.period ?? "period as configured"})`)}
${row(70, "Seats licensed", String(receipt.seats ?? "—"))}
${row(78, "Licence period", `${String(receipt.periodStart ?? "").slice(0, 10) || "—"} to ${String(receipt.periodEnd ?? "").slice(0, 10) || "open"}`)}
${row(86, "Provider", `${receipt.provider ?? "none"}${receipt.provider === PM_MOCK ? " (on-device mock — nothing was charged)" : ""}`)}
${row(94, "Status", String(receipt.state ?? "—"))}
${line(100)}
${row(110, "Amount per seat, as configured", money(unit))}
${row(118, "Seats", `× ${receipt.seats ?? "—"}`)}
<text x="22" y="130" font-family="Georgia, serif" font-size="5.4" fill="#1a2230">Total, as configured</text><text x="${W - 22}" y="130" text-anchor="end" font-family="Georgia, serif" font-size="6.4" fill="${colour}">${pmEsc(money(receipt.amountMinor))}</text>
${line(136)}
<text x="22" y="146" font-family="Arial, Helvetica, sans-serif" font-size="3.6" fill="#5a6676">Amounts are the deployment's configuration (auth-config.json, payments block), shown as configured; nothing here is a price the platform set. No tax is computed on this page.</text>
<text x="22" y="152" font-family="Arial, Helvetica, sans-serif" font-size="3.6" fill="#5a6676">This page evidences a checkout event recorded on this device. It is not a tax invoice, a contract or a statement of account.</text>
<g transform="translate(${W / 2} ${H / 2}) rotate(-24)" opacity="0.16"><text text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="14" fill="#b0262e">PROTOTYPE — NOT AN INVOICE</text></g>
<text x="${W / 2}" y="${H - 16}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="4.4" fill="#b0262e">PROTOTYPE — NOT AN INVOICE</text>
</svg>`;
}

// ------------------------------------------------------------- sample data

/**
 * Sample billing for the console's empty state and the checker: the sample
 * organisation and cohort (org.js), one mock checkout for the cohort's
 * planned seats, completed. Amounts are whatever the config says (null in
 * the public build → "not configured"). Idempotent.
 */
export function pmLoadSample(config = {}) {
  const { org, cohort } = enLoadSample();
  const have = pmLoad().receipts.find((r) => r.cohortId === cohort.id);
  if (have) return { org, cohort, receipt: have, fresh: false };
  const adapter = pmCreateAdapter({ ...config, provider: PM_MOCK, plans: config?.plans?.length ? config.plans : [{ id: "seat-annual", name: "Seat, annual", period: "year", periodDays: 365, amountMinor: null }] });
  const planId = adapter.describe().plans[0].id;
  const quote = adapter.quote(planId, cohort.seats, { orgId: org.id, cohortId: cohort.id });
  let receipt = null;
  // The mock checkout is synchronous in effect (no awaited network), so the promise resolves on the next tick;
  // callers that need the receipt right away read the store after a microtask, or use pmLoadSampleAsync.
  const done = adapter.checkout(quote).then((r) => { if (r?.ok) { const w = adapter.mockComplete(r.session.id); receipt = w.receipt ?? null; } return receipt; });
  return { org, cohort, receipt, fresh: true, done };
}

/** The sample, awaited: the receipt is there when this resolves. */
export async function pmLoadSampleAsync(config = {}) {
  const r = pmLoadSample(config);
  if (r.done) r.receipt = await r.done;
  return r;
}

/** Payment-related audit lines (org.js's log), newest first. */
export function pmAuditList(all) { return (all ?? []).filter((a) => /^(payment-|agent-|cohort-seats)/.test(a.action)); }

/** The organisation a receipt belongs to (for the invoice), or null. */
export function pmOrgOf(receipt) { return receipt?.orgId ? enOrg(receipt.orgId) : null; }
