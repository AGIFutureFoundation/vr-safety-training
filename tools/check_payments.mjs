#!/usr/bin/env node
/**
 * Enterprise seat billing (WebXR/shared/payments.js, pm-agent.js, the
 * console's Billing tab, the payments block of auth-config.json, the Worker
 * handler at workers/payments/handler.mjs — docs/payments.md). Headless:
 * Map-backed storage and a small DOM stub; no browser, no network.
 *
 *     node tools/check_payments.mjs
 *
 *   1. nothing committed: provider, key, endpoint, currency and every amount
 *      null in the shipped block; no secret in the tree; the handler reads
 *      its secret from the environment only; the block is read from the
 *      file, never the launch URL;
 *   2. quote maths on a fixture block (seats × the configured amount; unpriced
 *      plans quote "not configured");
 *   3. checkout with no provider returns null and nothing is requested; a
 *      hosted provider refuses until configured and reached only through the
 *      fetch it is handed;
 *   4. webhook idempotency: one receipt per event id, a replay is a duplicate,
 *      the licence provisions the cohort, a refund ends it;
 *   5. the invoice: well-formed SVG, "prototype — not an invoice" twice,
 *      escaped, no image or script;
 *   6. the Billing tab renders with the sample data; no markup from strings;
 *   7. the enterprise block is honoured (organisation named, cohorts limited
 *      to the enabled programmes);
 *   8. the agent step: never over the ceiling, over-threshold queued, replays
 *      idempotent, deterministic; the runner audits every decision;
 *   9. the Worker handler: ROUTES and a default handle(request, env); 503
 *      with no secret, 401 on a bad signature, idempotent receipts, status;
 *  10. no learner surface imports the billing modules; no network call in them.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failures += 1; console.log(`  ✗ ${name}\n      ${e.stack ?? e}`); }
}
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, m) => { if (a !== b) throw new Error(`${m}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

// ------------------------------------------------------------ a small DOM
class PmNode {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.attrs = {}; this.children = []; this.parent = null; this.listeners = {}; this.style = {}; this._text = ""; this.value = ""; this.dataset = {}; this.checked = false; }
  get id() { return this.attrs.id ?? ""; }
  set id(v) { this.attrs.id = v; }
  get hidden() { return "hidden" in this.attrs; }
  set hidden(v) { if (v) this.attrs.hidden = ""; else delete this.attrs.hidden; }
  get className() { return this.attrs.class ?? ""; }
  set className(v) { this.attrs.class = v; }
  get disabled() { return "disabled" in this.attrs; }
  set disabled(v) { if (v) this.attrs.disabled = ""; else delete this.attrs.disabled; }
  set title(v) { this.attrs.title = String(v); }
  get title() { return this.attrs.title ?? ""; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(""); }
  set textContent(v) { this.children = []; this._text = String(v ?? ""); }
  append(...kids) { for (const k of kids) this.appendChild(typeof k === "string" ? Object.assign(new PmNode("#text"), { _text: k }) : k); }
  appendChild(k) { k.parent?.children.splice(k.parent.children.indexOf(k), 1); k.parent = this; this.children.push(k); return k; }
  prepend(k) { this.appendChild(k); this.children.unshift(this.children.pop()); }
  replaceChildren(...kids) { this.children = []; this._text = ""; this.append(...kids); }
  remove() { if (this.parent) { this.parent.children.splice(this.parent.children.indexOf(this), 1); this.parent = null; } }
  addEventListener(t, f) { (this.listeners[t] ??= []).push(f); }
  click() { if (!this.disabled) for (const f of this.listeners.click ?? []) f({ target: this }); }
  *walk() { for (const c of this.children) { yield c; yield* c.walk(); } }
  matches(sel) {
    return sel.split(",").some((part) => {
      const chain = part.trim().split(/\s+/);
      const one = (n, s) => { const m = /^([a-z]*)(?:#([\w-]+))?(?:\.([\w-]+))?$/.exec(s); if (!m) return false; if (m[1] && n.tagName !== m[1].toUpperCase()) return false; if (m[2] && n.id !== m[2]) return false; if (m[3] && !n.className.split(/\s+/).includes(m[3])) return false; return true; };
      if (!one(this, chain[chain.length - 1])) return false;
      // Descendant chains of any length: each earlier part must match some ancestor, in order.
      let i = chain.length - 2;
      for (let p = this.parent; p && i >= 0; p = p.parent) if (one(p, chain[i])) i -= 1;
      return i < 0;
    });
  }
  querySelector(sel) { for (const n of this.walk()) if (n.tagName !== "#TEXT" && n.matches(sel)) return n; return null; }
  querySelectorAll(sel) { return [...this.walk()].filter((n) => n.tagName !== "#TEXT" && n.matches(sel)); }
}
const html = new PmNode("html"); const head = new PmNode("head"); const body = new PmNode("body"); html.append(head, body);
globalThis.document = { head, body, documentElement: html, createElement: (t) => new PmNode(t), getElementById: (id) => html.querySelector(`#${id}`), querySelector: (s) => html.querySelector(s), querySelectorAll: (s) => html.querySelectorAll(s), addEventListener() {} };
const localStore = new Map(), sessionStore = new Map();
const mkStore = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) });
globalThis.localStorage = mkStore(localStore);
globalThis.sessionStorage = mkStore(sessionStore);
globalThis.window = globalThis;
globalThis.addEventListener = () => {};
globalThis.confirm = () => true;
const net = [];
globalThis.fetch = async (u) => { net.push(String(u)); return { ok: false }; };

const pm = await import("../WebXR/shared/payments.js");
const ag = await import("../WebXR/shared/pm-agent.js");
const org = await import("../WebXR/shared/org.js");
const auth = await import("../WebXR/shared/auth.js");
const { GT_PROFILE_KEYS } = await import("../WebXR/shared/profiles.js");
const { PP_PROGRAMMES } = await import("../WebXR/shared/passport-programmes.js");
const billing = await import("../WebXR/instructor/js/billing.js");
const worker = await import("../workers/payments/handler.mjs");

const NOW = "2026-09-28T12:00:00.000Z";
const file = JSON.parse(read("WebXR/auth-config.json"));
const shipped = auth.cleanPayments(file.payments);
// A fixture, not a price: 100 minor units per seat in XTS (the ISO 4217 code reserved for testing).
const FIXTURE = { ...shipped, provider: "mock", currency: "XTS", plans: shipped.plans.map((p) => ({ ...p, amountMinor: 100 })) };

console.log("Enterprise seat billing — self-test\n");

// ------------------------------------------------------------ 1. nothing committed
await check("nothing committed: provider, key, endpoint, currency and every amount null; no secret in the tree; the block from the file only", () => {
  const p = file.payments;
  for (const k of ["provider", "publishableKey", "checkoutEndpoint", "currency", "currencyExponent", "plans"]) assert(k in p, `payments block lacks ${k}`);
  for (const k of ["provider", "publishableKey", "checkoutEndpoint", "currency"]) eq(p[k], null, `payments.${k} in the public build`);
  assert(Array.isArray(p.plans) && p.plans.length >= 1, "at least one plan id");
  for (const pl of p.plans) eq(pl.amountMinor, null, `plan ${pl.id} ships an amount`);
  eq(shipped.provider, null, "cleaned provider"); eq(shipped.plans.length, p.plans.length, "cleaned plans");
  assert(shipped.plans.every((x) => x.amountMinor === null), "a cleaned plan carries an amount");
  // The cleaner drops junk and never invents a number.
  const c = auth.cleanPayments({ provider: " Mock ", publishableKey: "sk_live_" + "x".repeat(24), checkoutEndpoint: "http://insecure.example", currency: "usd", currencyExponent: 9, plans: [{ id: "A B", amountMinor: 5 }, { id: "ok-plan", period: "weekly", amountMinor: 12.5 }, { id: "ok-plan", amountMinor: 7 }, { id: "priced", period: "year", periodDays: 365, amountMinor: 250 }] });
  eq(c.provider, "mock", "provider lower-cased"); eq(c.publishableKey, null, "a secret-shaped key is dropped"); eq(c.checkoutEndpoint, null, "http endpoint dropped");
  eq(c.currency, "USD", "currency upper-cased"); eq(c.currencyExponent, 2, "a silly exponent falls back");
  eq(c.plans.map((x) => x.id).join(","), "ok-plan,priced", "bad ids dropped, duplicates dropped");
  eq(c.plans[0].amountMinor, null, "a fractional amount is not an amount"); eq(c.plans[0].period, "once", "an unknown period"); eq(c.plans[1].amountMinor, 250, "an integer amount kept");
  // From the file only.
  const viaUrl = auth.parseAuthConfig(null, "?payments=%7B%22provider%22%3A%22evil%22%7D&provider=evil");
  eq(viaUrl.payments.provider, null, "the launch URL named a provider");
  eq(auth.parseAuthConfig(file).payments.provider, null, "parseAuthConfig carries the block");
  assert(GT_PROFILE_KEYS.includes(pm.PM_KEY), `${pm.PM_KEY} is not a per-profile key`);
  // No secret anywhere TILL touched, and none in the tree by shape.
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter((f) => /\.(js|mjs|json|html|md|py|toml|ya?ml|env|txt)$/.test(f) && !f.includes("/dist/") && existsSync(join(ROOT, f)));
  const patterns = [[/\bsk_(live|test)_[0-9A-Za-z]{16,}\b/, "a secret API key"], [/\bwhsec_[0-9A-Za-z]{16,}\b/, "a webhook secret"], [/\bpk_(live|test)_[0-9A-Za-z]{16,}\b/, "a publishable key"], [/PAYMENTS_WEBHOOK_SECRET\s*[:=]\s*["'][^"'\s]{8,}["']/, "a webhook secret value"]];
  for (const f of tracked) { const t = readFileSync(join(ROOT, f), "utf8"); for (const [re, what] of patterns) assert(!re.test(t), `${f} carries ${what}`); }
  const h = read("workers/payments/handler.mjs");
  assert(h.includes("env?.PAYMENTS_WEBHOOK_SECRET") || h.includes("env.PAYMENTS_WEBHOOK_SECRET"), "the handler does not read its secret from the environment");
  assert(!/const\s+\w*SECRET\w*\s*=\s*["']/.test(h), "the handler holds a secret literal");
});

// ------------------------------------------------------------ 2. quote maths
await check("quote maths: seats × the configured amount; an unpriced plan quotes 'not configured'; bad seats refused", () => {
  const a = pm.pmCreateAdapter(FIXTURE, { now: () => NOW });
  const q = a.quote("seat-annual", 12, { orgId: "o", cohortId: "c" });
  eq(q.unitMinor, 100, "unit"); eq(q.subtotalMinor, 1200, "subtotal"); eq(q.totalMinor, 1200, "total"); eq(q.seats, 12, "seats");
  eq(q.display.total, "12.00 XTS", "display"); eq(q.display.unit, "1.00 XTS", "unit display"); eq(q.priced, true, "priced"); eq(q.createdAt, NOW, "now injected");
  eq(a.quote("seat-annual", "7").seats, 7, "a numeric string is fine"); eq(a.quote("seat-annual", 1000).totalMinor, 100000, "the cap");
  for (const bad of [0, 1001, -1, 2.5, "x", null]) eq(a.quote("seat-annual", bad), null, `seats ${bad} refused`);
  eq(a.quote("no-such-plan", 3), null, "an unknown plan");
  eq(pm.pmMoney(12345, { currency: "XTS", currencyExponent: 2 }), "123.45 XTS", "money");
  eq(pm.pmMoney(7, { currency: "XTS", currencyExponent: 0 }), "7 XTS", "exponent 0");
  eq(pm.pmMoney(null, FIXTURE), "not configured", "null money");
  eq(pm.pmMoney(500, { currencyExponent: 2 }), "5.00 (currency not configured)", "no currency");
  const none = pm.pmCreateAdapter(shipped);
  const q0 = none.quote("seat-annual", 12);
  eq(q0.priced, false, "unpriced"); eq(q0.totalMinor, null, "no total invented"); eq(q0.display.total, "not configured", "unpriced display");
  const d = none.describe();
  eq(d.configured, false, "the shipped block is not configured"); assert(d.missing.includes("provider") && d.missing.includes("plans[].amountMinor"), `missing: ${d.missing}`);
  assert(d.plans.every((p) => p.display === "not configured"), "a shipped plan displays an amount");
  const docs = read("docs/payments.md");
  for (const k of ["payments", "amountMinor", "not configured", "publishableKey", "pmCreateAdapter", "quote(", "checkout(", "webhook(", "status(", "PAYMENTS_WEBHOOK_SECRET", "pmAgentStep", "PROTOTYPE — NOT AN INVOICE", "never buys"]) assert(docs.includes(k), `docs/payments.md does not document ${k}`);
});

// -------------------------------------------------------- 3. checkout, no provider
await check("checkout without a provider returns null with no request; a hosted provider refuses until configured and only uses the fetch it is handed", async () => {
  const none = pm.pmCreateAdapter(shipped);
  const before = net.length;
  eq(await none.checkout(none.quote("seat-annual", 5)), null, "no provider → null");
  eq(await none.checkout(null), null, "no provider, no quote → null");
  eq(net.length, before, "a request was made");
  eq(pm.pmLoad().sessions.length, 0, "a session was stored");
  const hosted = pm.pmCreateAdapter({ ...FIXTURE, provider: "hosted-example", checkoutEndpoint: null });
  const r1 = await hosted.checkout(hosted.quote("seat-annual", 5));
  assert(r1 && r1.ok === false && r1.reason === pm.PM_REFUSAL && r1.missing.includes("checkoutEndpoint"), `unconfigured hosted: ${JSON.stringify(r1)}`);
  const cfgd = pm.pmCreateAdapter({ ...FIXTURE, provider: "hosted-example", checkoutEndpoint: "https://checkout.example.org/session" });
  const r2 = await cfgd.checkout(cfgd.quote("seat-annual", 5));
  assert(r2.ok === false && r2.missing?.includes("fetchImpl"), "a hosted adapter reached for the global fetch");
  eq(net.length, before, "the global fetch was used");
  const posts = [];
  const fake = async (url, init) => { posts.push({ url, body: JSON.parse(init.body) }); return { ok: true, status: 200, json: async () => ({ redirectUrl: "https://checkout.example.org/s/abc", sessionId: "abc123" }) }; };
  const live = pm.pmCreateAdapter({ ...FIXTURE, provider: "hosted-example", checkoutEndpoint: "https://checkout.example.org/session" }, { fetchImpl: fake });
  const r3 = await live.checkout(live.quote("seat-annual", 5));
  assert(r3.ok && r3.redirect.kind === "hosted-redirect" && r3.redirect.href.startsWith("https://"), `hosted redirect: ${JSON.stringify(r3)}`);
  eq(posts.length, 1, "one post"); eq(posts[0].body.action, "checkout", "the post's action"); eq(posts[0].body.quote.seats, 5, "the quote travelled");
  eq(net.length, before, "the global fetch was used by the hosted adapter");
  pm.pmClear();
});

// -------------------------------------------------------- 4. webhook idempotency
await check("webhook idempotency: one receipt per event, a replay is a duplicate, the licence provisions the cohort, a refund ends it", async () => {
  localStore.clear(); sessionStore.clear();
  const s = org.enLoadSample();
  const a = pm.pmCreateAdapter(FIXTURE, { now: () => NOW });
  const q = a.quote("seat-annual", 20, { orgId: s.org.id, cohortId: s.cohort.id });
  const co = await a.checkout(q);
  assert(co.ok && co.redirect.kind === "hosted-redirect-stub" && co.redirect.href === `#pm-checkout/${co.session.id}`, "the mock's redirect stub");
  eq(a.status(co.session.id).state, "open", "session open");
  eq(org.enAuditList()[0].action, "payment-checkout", "a checkout is audited");
  const w1 = a.mockComplete(co.session.id);
  assert(w1.ok && w1.duplicate === false && w1.receipt?.state === "paid", `first completion: ${JSON.stringify(w1)}`);
  eq(w1.receipt.amountMinor, 2000, "receipt amount"); eq(w1.receipt.seats, 20, "receipt seats"); eq(w1.receipt.number, "PM-2026-0001", "receipt number");
  eq(w1.receipt.periodEnd, "2027-09-28T12:00:00.000Z", "a 365-day period");
  const w2 = a.mockComplete(co.session.id);
  assert(w2.ok && w2.duplicate === true && w2.receipt?.id === w1.receipt.id, "the replay is not a duplicate");
  const w3 = a.webhook({ id: `evt-${co.session.id}-completed`, type: "checkout.completed", sessionId: co.session.id, at: NOW, seats: 999, amountMinor: 1 });
  eq(w3.duplicate, true, "a differing replay of the same id is still a duplicate");
  eq(pm.pmLoad().receipts.length, 1, "receipts"); eq(pm.pmLoad().licences.length, 1, "licences");
  const seats = pm.pmSeats(s.cohort.id, NOW);
  eq(seats.used, 4, "learners joined"); eq(seats.licensed, 20, "licensed"); eq(seats.planned, 20, "the cohort grew to the licensed seats");
  assert(org.enAuditList().some((x) => x.action === "cohort-seats"), "provisioning was not audited");
  eq(a.status(w1.receipt).state, "paid", "status by receipt"); eq(a.status("r-nope").ok, false, "unknown receipt");
  for (const bad of [null, {}, { id: "x", type: "checkout.completed", sessionId: co.session.id, at: NOW }, { id: "evt-abcdef", type: "nope", sessionId: co.session.id, at: NOW }, { id: "evt-abcdef", type: "checkout.completed", sessionId: co.session.id, at: "yesterday" }]) assert(a.webhook(bad).ok === false, `a malformed event was accepted: ${JSON.stringify(bad)}`);
  assert(a.webhook({ id: "evt-unknown-session", type: "checkout.completed", sessionId: "cs-nothere00", at: NOW }).ok === false, "an unknown session was accepted");
  eq(pm.pmLoad().receipts.length, 1, "a refused event wrote a receipt");
  const rf = a.mockRefund(co.session.id);
  assert(rf.ok && rf.receipt.state === "refunded", "refund");
  eq(pm.pmSeats(s.cohort.id, NOW).licensed, 0, "a refunded licence still counts");
  eq(pm.pmLoad().events.length, 2, "event ids kept for idempotency");
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
});

// ------------------------------------------------------------ 5. the invoice
await check("the invoice: well-formed SVG, 'prototype — not an invoice' twice, escaped, no image or script, 'not configured' when unpriced", () => {
  const r = pm.pmLoad().receipts[0];
  const s = org.enLoadSample();
  const svg = pm.pmInvoiceSVG(r, { org: { ...s.org, name: "Hall & <Sons>" }, cohort: { ...s.cohort, name: "Crew <A>" }, config: FIXTURE });
  assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"') && svg.trim().endsWith("</svg>"), "envelope");
  eq((svg.match(/PROTOTYPE — NOT AN INVOICE/g) ?? []).length, 2, "the prototype line, twice");
  assert(svg.includes("HALL &amp; &lt;SONS&gt;") && svg.includes("Crew &lt;A&gt;"), "names escaped");
  assert(svg.includes("20.00 XTS") && svg.includes("1.00 XTS"), "the configured amounts");
  for (const bad of ["<image", "<script", "href=", "<foreignObject"]) assert(!svg.includes(bad), `invoice carries ${bad}`);
  eq((svg.match(/<(\w+)[\s>]/g) ?? []).length, (svg.match(/<\/(\w+)>/g) ?? []).length + (svg.match(/\/>/g) ?? []).length, "tags balance");
  const unpriced = pm.pmInvoiceSVG({ ...r, amountMinor: null, currency: null }, { org: s.org, cohort: s.cohort, config: shipped });
  assert(unpriced.includes("not configured") && !/\d+\.\d\d [A-Z]{3}/.test(unpriced), "an unpriced invoice shows a number");
  eq(pm.pmInvoiceSVG(null), null, "no receipt, no invoice");
});

// ------------------------------------------------------------ 6. the view
await check("the Billing tab renders with the sample: provider, seats, receipts with an invoice button, budget, audit; no markup from strings", async () => {
  localStore.clear(); sessionStore.clear();
  const root = new PmNode("div"); root.id = "pm-root"; body.append(root);
  const toasts = [];
  billing.pmMountBillingView(root, { enterprise: null, payments: shipped, toast: (t) => toasts.push(t) });
  for (const id of ["pm-plans", "pm-seats", "pm-invoices", "pm-budget", "pm-audit"]) assert(root.querySelector(`#${id}`), `no ${id} panel`);
  assert(root.querySelector("#pm-provider").textContent.includes("on-device mock"), "with no provider the tab does not say the mock stands in");
  assert(root.querySelector("#pm-plans").textContent.includes("not configured"), "shipped plans do not read 'not configured'");
  const sample = await pm.pmLoadSampleAsync(billing.pmEffectiveConfig(shipped));
  assert(sample.receipt && sample.receipt.provider === "mock", "the sample did not license through the mock");
  billing.pmRender(root);
  const rows = root.querySelectorAll("#pm-seat-table tbody tr");
  eq(rows.length, 1, "one cohort row");
  const cells = rows[0].children.map((c) => c.textContent);
  eq(cells[0], "Sample cohort", "cohort"); eq(cells[2], "4", "used"); eq(cells[3], "12", "licensed"); eq(cells[4], "12", "planned");
  const receipts = root.querySelectorAll("#pm-receipts tbody tr");
  eq(receipts.length, 1, "one receipt row");
  assert(receipts[0].textContent.includes("not configured") && receipts[0].textContent.includes("paid (mock)"), `receipt row: ${receipts[0].textContent}`);
  const inv = receipts[0].querySelector("button");
  assert(inv && inv.textContent === "Invoice SVG", "no invoice button");
  const svg = billing.pmOpenInvoice(pm.pmLoad().receipts[0]);
  assert(svg && svg.includes("PROTOTYPE — NOT AN INVOICE"), "the invoice from the view");
  assert(root.textContent.includes("prototype — not an invoice"), "the receipts heading says prototype");
  assert(root.querySelector("#pm-policy") && root.querySelector("#pm-spend") && root.querySelector("#pm-decisions") && root.querySelector("#pm-queue"), "the budget panel's parts");
  assert(root.querySelector("#pm-spend").textContent.includes("no ceiling is set"), "with no policy the spend line does not say so");
  assert(root.querySelectorAll("#pm-audit tbody tr").length >= 2, "payment audit rows");
  assert(root.querySelector("#pm-quote") && root.querySelector("#pm-checkout")?.disabled, "the checkout button is enabled before a quote");
  // Quote → checkout through the view's own buttons.
  const quoteBtn = root.querySelectorAll("#pm-seats button").find((b) => b.textContent === "Quote");
  quoteBtn.click();
  assert(root.querySelector("#pm-quote").textContent.includes("12 seat(s)") && !root.querySelector("#pm-checkout").disabled, "a quote did not arm the checkout");
  root.querySelector("#pm-checkout").click(); await new Promise((r) => setTimeout(r, 0));
  billing.pmRender(root);
  eq(root.querySelectorAll("#pm-sessions li").length, 1, "an open mock session listed");
  root.querySelectorAll("#pm-sessions button").find((b) => b.textContent === "Complete (mock)").click();
  eq(pm.pmLoad().receipts.length, 2, "the mock completion wrote a receipt");
  for (const f of ["WebXR/instructor/js/billing.js", "WebXR/shared/payments.js", "WebXR/shared/pm-agent.js"]) {
    const src = read(f);
    for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) assert(!src.includes(sink), `${f} uses ${sink}`);
  }
  assert(read("WebXR/instructor/index.html").includes('id="tab-billing"') && read("WebXR/instructor/index.html").includes('id="pm-root"'), "the console page lacks the tab");
  assert(read("WebXR/instructor/js/app.js").includes("pmMountBillingView(") && read("WebXR/instructor/js/app.js").includes("pmSetConfig("), "the console does not mount the view");
  const bundler = read("tools/bundle_webxr.py");
  for (const m of ['SHARED / "payments.js"', 'SHARED / "pm-agent.js"', 'instructor/js/billing.js'] ) assert(bundler.includes(m), `the bundler does not carry ${m}`);
  assert(bundler.indexOf('SHARED / "org.js"') < bundler.indexOf('SHARED / "payments.js"') && bundler.indexOf('SHARED / "payments.js"') < bundler.indexOf('SHARED / "pm-agent.js"') && bundler.indexOf('SHARED / "pm-agent.js"') < bundler.indexOf('instructor/js/billing.js'), "bundle order");
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
});

// ---------------------------------------------------- 7. the enterprise block
await check("the enterprise block is honoured: the organisation named, cohorts limited to the enabled programmes, the payments block applied on config", () => {
  const root = document.getElementById("pm-root");
  const sampleProg = org.enCohorts()[0].programme;
  const other = Object.keys(PP_PROGRAMMES).find((id) => id !== sampleProg);
  billing.pmSetConfig({ enterprise: auth.cleanEnterprise({ organisation: "Harbour Training Hall", programmes: [other] }), payments: shipped });
  assert(root.querySelector("#pm-plans").textContent.includes("Harbour Training Hall"), "the organisation is not named");
  eq(billing.pmVisibleCohorts().length, 0, "a cohort of a disabled programme is listed");
  eq(root.querySelectorAll("#pm-seat-table tbody tr").length, 1, "the empty row"); assert(root.querySelector("#pm-seat-table").textContent.includes("No cohort"), "the seat table lists a disabled programme's cohort");
  billing.pmSetConfig({ enterprise: auth.cleanEnterprise({ organisation: "Harbour Training Hall", programmes: [sampleProg] }), payments: shipped });
  eq(billing.pmVisibleCohorts().length, 1, "the enabled programme's cohort");
  billing.pmSetConfig({ enterprise: null, payments: auth.cleanPayments({ ...file.payments, provider: "hosted-example", currency: "XTS" }) });
  assert(root.querySelector("#pm-provider").textContent.includes("Provider: hosted-example") && root.querySelector("#pm-provider").textContent.includes("not fully configured"), `provider line: ${root.querySelector("#pm-provider").textContent}`);
  billing.pmSetConfig({ enterprise: null, payments: shipped });
});

// ------------------------------------------------------------- 8. the agent
await check("the agent: never over the ceiling, over-threshold queued, replays idempotent, deterministic; the runner audits every decision", async () => {
  const policy = { planId: "seat-annual", ceilingMinor: 5000, periodDays: 30, seatFloor: 4, seatCap: 40, autoRenew: true, releaseUnused: true, approvalThresholdMinor: 1500 };
  const at = (m) => `2026-09-28T12:${String(m).padStart(2, "0")}:00.000Z`;
  const events = [
    { id: "ev-1", type: "cohort.filled", at: at(0), cohortId: "c1", cohortName: "Crew A", used: 12, licensed: 12, planned: 20 }, // +8 → 800, buys
    { id: "ev-2", type: "cohort.filled", at: at(1), cohortId: "c2", cohortName: "Crew B", used: 20, licensed: 0, planned: 20 },   // 2000 > threshold → queue
    { id: "ev-3", type: "cohort.filled", at: at(2), cohortId: "c3", cohortName: "Crew C", used: 45, licensed: 0, planned: 60 },   // cap 40 → 4000 > remaining 4200? no: 4000 ≤ 4200 but > threshold → queue
    { id: "ev-4", type: "cohort.filled", at: at(3), cohortId: "c4", cohortName: "Crew D", used: 3, licensed: 3, planned: 3 },     // floor 4 → +1 → 100, buys
    { id: "ev-5", type: "licence.expiring", at: at(4), cohortId: "c1", cohortName: "Crew A", licenceId: "lic-x", seats: 20, used: 9, periodEnd: at(30) }, // renew max(9,4)=9 → 900, buys
    { id: "ev-6", type: "cohort.unused", at: at(5), cohortId: "c1", cohortName: "Crew A", used: 9, licensed: 20, planned: 20 },   // release 11
    { id: "ev-1", type: "cohort.filled", at: at(0), cohortId: "c1", cohortName: "Crew A", used: 12, licensed: 12, planned: 20 },  // replay
    { id: "ev-7", type: "receipt.paid", at: at(6), cohortId: "c1", cohortName: "Crew A", receiptId: "PM-2026-0007", seats: 8 },
  ];
  const r1 = ag.pmAgentStep(ag.pmAgentEmpty(), policy, events, { config: FIXTURE });
  const buys = r1.actions.filter((a) => a.kind === "checkout");
  eq(buys.map((a) => a.amountMinor).join(","), "800,100,900", "the checkouts");
  eq(r1.state.spentMinor, 1800, "spend counted");
  assert(r1.state.spentMinor <= policy.ceilingMinor, "spend over the ceiling");
  const queued = r1.actions.filter((a) => a.kind === "queue");
  eq(queued.map((a) => a.why).join(","), "approval,approval", "over-threshold actions queued");
  eq(r1.state.queue.length, 2, "two queue entries");
  eq(r1.actions.filter((a) => a.kind === "release").length, 1, "one release"); eq(r1.actions.find((a) => a.kind === "release").seats, 11, "released seats"); eq(r1.actions.find((a) => a.kind === "release").keep, 9, "kept seats");
  eq(r1.actions.filter((a) => a.kind === "provision").length, 1, "one provision");
  assert(r1.actions.every((a) => typeof a.reason === "string" && a.reason.length > 8), "an action without a reason");
  assert(r1.state.decisions.every((d) => d.reason && d.eventId && d.at), "a decision without a reason");
  // Approvals: the first queued (2000) fits the remaining 3200 → checkout; the second (4000) does not → refused and re-queued as over-ceiling.
  const r2 = ag.pmAgentStep(r1.state, policy, [{ id: "ev-8", type: "approval.granted", at: at(7), queueId: r1.state.queue[0].id }], { config: FIXTURE });
  eq(r2.actions.map((a) => a.kind).join(","), "dequeue,checkout", "an approved item is bought"); eq(r2.state.spentMinor, 3800, "spend after approval");
  const r3 = ag.pmAgentStep(r2.state, policy, [{ id: "ev-9", type: "approval.granted", at: at(8), queueId: r2.state.queue[0].id }], { config: FIXTURE });
  eq(r3.actions.map((a) => `${a.kind}${a.why ? ":" + a.why : ""}`).join(","), "dequeue,refuse,queue:over-ceiling", "an approval cannot beat the ceiling");
  eq(r3.state.spentMinor, 3800, "no spend on refusal");
  const r4 = ag.pmAgentStep(r3.state, policy, [{ id: "ev-10", type: "approval.denied", at: at(9), queueId: r3.state.queue[0].id }], { config: FIXTURE });
  eq(r4.state.queue.length, 0, "a denial empties the queue"); eq(r4.actions[0].kind, "dequeue", "denied → dequeue");
  // Never over the ceiling, across a run of fills of every size.
  let st = ag.pmAgentEmpty(); let spent = 0;
  for (let i = 0; i < 60; i += 1) {
    const seats = 1 + ((i * 7) % 40);
    const out = ag.pmAgentStep(st, { ...policy, approvalThresholdMinor: null }, [{ id: `ev-fill-${i}`, type: "cohort.filled", at: at(10 + (i % 40)), cohortId: `c${i}`, used: seats, licensed: 0, planned: seats }], { config: FIXTURE });
    for (const a of out.actions) if (a.kind === "checkout") { spent += a.amountMinor; assert(a.amountMinor <= policy.ceilingMinor, "a single buy over the ceiling"); }
    assert(out.state.spentMinor <= policy.ceilingMinor, `spend ${out.state.spentMinor} over the ceiling after ${i}`);
    st = out.state;
  }
  eq(st.spentMinor, spent, "spend accounts for every buy"); assert(st.queue.some((q) => q.why === "over-ceiling"), "an over-ceiling refusal did not reach the queue");
  // Replays: the whole event list again changes nothing and yields no action.
  const again = ag.pmAgentStep(r1.state, policy, events, { config: FIXTURE });
  eq(again.actions.length, 0, "replayed events acted"); eq(JSON.stringify(again.state), JSON.stringify(r1.state), "replayed events changed the state");
  // Determinism and purity.
  const twin = ag.pmAgentStep(ag.pmAgentEmpty(), policy, events, { config: FIXTURE });
  eq(JSON.stringify(twin), JSON.stringify(r1), "the step is not deterministic");
  const frozen = ag.pmAgentEmpty(); const snapshot = JSON.stringify(frozen); ag.pmAgentStep(frozen, policy, events, { config: FIXTURE }); eq(JSON.stringify(frozen), snapshot, "the input state was mutated");
  // Unpriced plan, no ceiling: nothing is bought, a human is asked.
  const un = ag.pmAgentStep(ag.pmAgentEmpty(), policy, [events[0]], { config: shipped });
  eq(un.actions.map((a) => `${a.kind}:${a.why}`).join(","), "queue:unpriced", "an unpriced plan was bought");
  const noCeil = ag.pmAgentStep(ag.pmAgentEmpty(), { ...policy, ceilingMinor: null }, [events[0]], { config: FIXTURE });
  eq(noCeil.actions.map((a) => `${a.kind}:${a.why}`).join(","), "queue:no-ceiling", "bought with no ceiling set");
  const off = ag.pmAgentStep(ag.pmAgentEmpty(), { ...policy, autoRenew: false }, [events[4]], { config: FIXTURE });
  eq(off.actions.map((a) => `${a.kind}:${a.why}`).join(","), "queue:renewal-off", "renewed with auto-renew off");
  // The runner on this device: the sample cohort filled (used ≥ licensed) → buy → receipt → provision; every decision audited.
  localStore.clear(); sessionStore.clear();
  const s = org.enLoadSample();
  ag.pmAgentSetPolicy({ ...policy, seatFloor: 0 });
  const ad = pm.pmCreateAdapter(FIXTURE, { now: () => NOW });
  const evs = ag.pmAgentEvents({ now: NOW });
  assert(evs.some((e) => e.type === "cohort.filled" && e.cohortId === s.cohort.id), `device events: ${evs.map((e) => e.type)}`);
  const run = await ag.pmAgentRun(ad, evs, { config: FIXTURE, now: NOW });
  eq(run.actions.filter((a) => a.kind === "checkout").length, 1, "one buy"); eq(run.actions[0].seats, 12, "the planned seats");
  eq(pm.pmSeats(s.cohort.id, NOW).licensed, 12, "licensed after the run"); eq(run.results.some((r) => r.action.kind === "provision"), true, "the receipt provisioned");
  const audit = org.enAuditList().filter((a) => a.action === "agent-decision");
  const decisions = ag.pmAgentLoad().state.decisions;
  assert(decisions.length >= 2, "decisions recorded");
  for (const d of decisions) assert(audit.some((a) => a.detail === `${d.kind}: ${d.reason}`.slice(0, 200)), `decision not in the audit trail: ${d.kind}: ${d.reason}`);
  assert(org.enAuditList().some((a) => a.action === "agent-policy"), "the policy was not audited");
  const rerun = await ag.pmAgentRun(ad, ag.pmAgentEvents({ now: NOW }), { config: FIXTURE, now: NOW });
  eq(rerun.actions.filter((a) => a.kind === "checkout").length, 0, "a second run bought again");
  eq(pm.pmLoad().receipts.length, 1, "a second run wrote a receipt");
  // Confirm through the queue: an over-threshold cohort.
  const big = org.enCreateCohort({ orgId: s.org.id, name: "Big crew", programme: s.cohort.programme, seats: 30 });
  const run2 = await ag.pmAgentRun(ad, ag.pmAgentEvents({ now: NOW }), { config: FIXTURE, now: NOW });
  eq(run2.actions.filter((a) => a.kind === "queue" && a.why === "approval").length, 1, "the big cohort was not queued");
  const q = ag.pmAgentLoad().state.queue[0];
  const res = await ag.pmAgentResolve(ad, q.id, true, { config: FIXTURE, now: NOW });
  assert(res.actions.some((a) => a.kind === "checkout" && a.approved), "the approval did not buy");
  eq(pm.pmSeats(big.id, NOW).licensed, 30, "the approved seats licensed");
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
});

// ------------------------------------------------------------ 9. the Worker
await check("the Worker handler: ROUTES and default handle(); 503 with no secret, 401 on a bad signature, idempotent receipts, status, health", async () => {
  assert(Array.isArray(worker.ROUTES) && worker.ROUTES.includes("/api/payments/webhook") && worker.ROUTES.every((r) => r.startsWith("/api/")), "ROUTES");
  assert(typeof worker.default === "function" && worker.default.length >= 1, "default export handle(request, env)");
  const secret = "test-only-secret-" + "x".repeat(16);
  const ev = { id: "evt-cs-worker0001-completed", type: "checkout.completed", sessionId: "cs-worker0001", at: NOW, seats: 10, amountMinor: 1000, currency: "XTS", planId: "seat-annual", cohortId: "cohort-x" };
  const body = JSON.stringify(ev);
  const post = (b, sig, env) => worker.default(new Request("https://edge.example/api/payments/webhook", { method: "POST", headers: sig ? { [worker.SIGNATURE_HEADER]: sig } : {}, body: b }), env);
  eq((await post(body, "deadbeef", {})).status, 503, "no secret → 503");
  const env = { PAYMENTS_WEBHOOK_SECRET: secret };
  eq((await post(body, null, env)).status, 401, "no signature → 401");
  eq((await post(body, "00".repeat(32), env)).status, 401, "a wrong signature → 401");
  const sig = await worker.sign(secret, body);
  eq((await post(body + " ", sig, env)).status, 401, "a body that changed → 401");
  const r1 = await post(body, sig, env); const j1 = await r1.json();
  eq(r1.status, 200, "signed → 200"); eq(j1.duplicate, false, "first delivery"); eq(j1.receiptId, "r-cs-worker0001-completed", "receipt id"); eq(j1.state, "paid", "paid");
  const r2 = await post(body, `sha256=${sig}`, env); const j2 = await r2.json();
  eq(r2.status, 200, "replay → 200"); eq(j2.duplicate, true, "replay is a duplicate"); eq(j2.receiptId, j1.receiptId, "same receipt");
  const st = await (await worker.default(new Request(`https://edge.example/api/payments/status?receipt=${j1.receiptId}`), env)).json();
  eq(st.state, "paid", "status"); eq(st.receipt.seats, 10, "the receipt");
  eq((await worker.default(new Request("https://edge.example/api/payments/status?receipt=r-nope"), env)).status, 404, "unknown → 404");
  const bad = JSON.stringify({ ...ev, id: "evt-bad", type: "nope" });
  eq((await post(bad, await worker.sign(secret, bad), env)).status, 422, "a malformed event → 422");
  const health = await (await worker.default(new Request("https://edge.example/api/payments/health"), env)).json();
  assert(health.ok && health.secret === "bound" && health.store === "memory", `health: ${JSON.stringify(health)}`);
  eq((await worker.default(new Request("https://edge.example/api/other"), env)).status, 404, "another route → 404");
  // A KV-shaped store is used when bound, and a replay is idempotent through it too.
  const kv = new Map(); const kvEnv = { PAYMENTS_WEBHOOK_SECRET: secret, PAYMENTS_KV: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } };
  const ev2 = JSON.stringify({ ...ev, id: "evt-cs-worker0002-completed", sessionId: "cs-worker0002" }); const sig2 = await worker.sign(secret, ev2);
  eq((await (await post(ev2, sig2, kvEnv)).json()).duplicate, false, "kv first"); eq((await (await post(ev2, sig2, kvEnv)).json()).duplicate, true, "kv replay");
  assert([...kv.keys()].some((k) => k.startsWith("receipt:")) && [...kv.keys()].some((k) => k.startsWith("event:")), "kv holds the receipt and the event id");
  // The handler's validator agrees with the browser adapter's on the same fixtures.
  for (const e of [ev, { ...ev, id: "x" }, { ...ev, seats: 0 }, { ...ev, at: "nope" }, null]) eq(worker.validateEvent(e).length === 0, pm.pmValidateEvent(e).length === 0, `validators disagree on ${JSON.stringify(e)}`);
  const src = read("workers/payments/handler.mjs");
  assert(!/from\s+["'][^"']*WebXR/.test(src) && !src.includes("fetch("), "the handler imports a browser module or reaches for the network");
  assert(src.includes("export const ROUTES") && src.includes("export default async function handle("), "the handler's exports");
});

// ------------------------------------------------------ 10. learner surfaces
await check("no learner surface imports the billing modules; no network call in them; the checker is in check_all", () => {
  const files = execFileSync("git", ["ls-files", "WebXR"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter((f) => /\.(js|html)$/.test(f) && !f.includes("/dist/") && existsSync(join(ROOT, f)));
  // pm-membership.js is the one learner-side module: a person's own upgrade (docs/payments.md §7); worlds and games never import it (check 11).
  const allowed = new Set(["WebXR/shared/pm-agent.js", "WebXR/shared/pm-membership.js", "WebXR/instructor/js/billing.js", "WebXR/instructor/js/app.js"]);
  const importRe = /import[^;]*?from\s+["'][^"']*(?:payments|pm-agent|billing)\.js["']/;
  for (const f of files) if (importRe.test(readFileSync(join(ROOT, f), "utf8"))) assert(allowed.has(f), `${f} imports the billing modules — a learner surface must not`);
  for (const f of ["WebXR/shared/payments.js", "WebXR/shared/pm-agent.js", "WebXR/instructor/js/billing.js"]) {
    const code = read(f).replace(/^\s*\/\/.*$/gm, "");
    for (const api of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket", "EventSource", "import(", "<img", ".src =", "location.href =", "location.assign", "window.open"]) assert(!code.includes(api), `${f} reaches for ${api}`);
  }
  assert(!read("WebXR/shared/account.js").includes("payments.js") && !read("tools/gen_home.mjs").includes("payments.js"), "the sign-in dialog or the homepage reaches the billing module");
  assert(read("tools/check_all.mjs").includes('"check_payments.mjs"'), "check_payments.mjs is not in check_all");
  const docs = read("docs/payments.md");
  assert(/never buys|no learner/i.test(docs) && /workers\/payments\/handler\.mjs/.test(docs) && /ROUTES/.test(docs), "docs/payments.md misses the learner rule or the Worker contract");
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
});

// ---------------------------------------------------- 11. membership levels
await check("membership levels validate and gate; the level lives in the private profile; a paid membership receipt sets it; no in-game item is for sale", async () => {
  const ms = await import("../WebXR/shared/pm-membership.js");
  assert(GT_PROFILE_KEYS.includes(ms.PM_MEMBER_KEY), "the membership key is not a private profile key");
  // Levels are configuration; the fixture names entitlements and, for the test only, an amount in XTS.
  const raw = { ...file.payments, provider: "mock", currency: "XTS", levels: [
    { id: "member", name: "Member", period: "once", amountMinor: null, entitlements: { worlds: null, programmes: null, certificates: false, cohortSeats: 0, guideVoice: false } },
    { id: "member-plus", name: "Member Plus", period: "year", periodDays: 365, amountMinor: 500, entitlements: { worlds: ["bayworld", "Summit"], programmes: null, certificates: true, cohortSeats: 5, guideVoice: true } },
    { id: "Bad Id", name: "x", amountMinor: 1 }, { id: "member", name: "dup" }, { id: "seat-annual", name: "clashes with a plan" },
  ] };
  const cfg = auth.cleanPayments(raw);
  eq(cfg.levels.map((l) => l.id).join(","), "member,member-plus", "bad, duplicate and plan-clashing level ids dropped");
  eq(cfg.levels[0].amountMinor, null, "the base level has no amount"); eq(cfg.levels[1].amountMinor, 500, "a configured amount kept");
  eq(JSON.stringify(cfg.levels[1].entitlements), JSON.stringify({ worlds: ["bayworld", "summit"], programmes: null, certificates: true, cohortSeats: 5, guideVoice: true }), "entitlements cleaned");
  eq(auth.cleanPayments({}).levels.length, 0, "no levels without a block"); eq(auth.cleanPayments({ levels: [{ id: "x", amountMinor: 12.5 }] }).levels[0].amountMinor, null, "a fractional amount is not an amount");
  // Gating: with no levels everything is granted; with levels, the base level applies until an upgrade.
  localStore.clear(); sessionStore.clear();
  assert(ms.pmHas("worlds", shipped, "summit") && ms.pmHas("certificates", shipped), "the public build gates something behind a membership");
  eq(ms.pmMyLevel(cfg).id, "member", "the base level by default");
  eq(ms.pmHas("worlds", cfg, "summit"), true, "the base level opens every world"); eq(ms.pmHas("certificates", cfg), false, "no certificates at the base level"); eq(ms.pmHas("cohortSeats", cfg, 1), false, "no seats at the base level");
  assert(ms.pmSetLevel("member-plus"), "set level");
  eq(ms.pmMyLevel(cfg).id, "member-plus", "the stored level"); eq(ms.pmHas("worlds", cfg, "summit"), true, "a listed world"); eq(ms.pmHas("worlds", cfg, "redwood"), false, "an unlisted world"); eq(ms.pmHas("certificates", cfg), true, "certificates"); eq(ms.pmHas("cohortSeats", cfg, 5), true, "five seats"); eq(ms.pmHas("cohortSeats", cfg, 6), false, "not six"); eq(ms.pmHas("guideVoice", cfg), true, "voice"); eq(ms.pmHas("nonsense", cfg), false, "an unknown entitlement");
  eq(ms.pmMyLevel({ ...cfg, levels: [cfg.levels[0]] }).id, "member", "a level no longer configured falls back to the base level");
  ms.pmClearLevel(); eq(ms.pmMyLevel(cfg).id, "member", "cleared");
  // The one purchase: a membership quote through the adapter, a mock checkout, the webhook completing the membership.
  const ad = ms.pmMembershipAdapter(cfg);
  const q = ms.pmMembershipQuote(ad, "member-plus");
  eq(q.kind, "membership", "kind"); eq(q.seats, 1, "one membership"); eq(q.totalMinor, 500, "the configured amount"); eq(q.levelId, "member-plus", "level");
  eq(ms.pmMembershipQuote(ad, "member").display.total, "not configured", "the base level quotes 'not configured'"); eq(ms.pmMembershipQuote(ad, "nope"), null, "an unknown level");
  const co = await ad.checkout(q); assert(co?.ok, "membership checkout");
  const w = ad.mockComplete(co.session.id);
  assert(w.ok && w.receipt.kind === "membership" && w.receipt.levelId === "member-plus", `membership receipt: ${JSON.stringify(w.receipt)}`);
  eq(ms.pmMyLevel(cfg).id, "member-plus", "the paid receipt set the level"); eq(ms.pmMemberLoad().receiptId, w.receipt.id, "the receipt is remembered");
  eq(pm.pmLoad().licences.length, 0, "a membership wrote a seat licence");
  eq(ad.mockComplete(co.session.id).duplicate, true, "replay");
  assert(ms.pmEntitlementLines(cfg.levels[1]).join(" ").includes("Certificates: yes") && ms.pmLevelLine(cfg.levels[1], cfg) === "Member Plus — 5.00 XTS per year", "the view lines");
  // Nothing in a world, a game, a treasure or a reward carries a price or a buy path.
  const worlds = execFileSync("git", ["ls-files", "WebXR"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter((f) => /\.(js)$/.test(f) && !f.includes("/dist/") && /(bayworld|summit|redwood|underwater|regatta|fairway|treasures|side-game|eggs|quest)/.test(f) && existsSync(join(ROOT, f)));
  assert(worlds.length > 10, "world modules to scan");
  for (const f of worlds) { const t = readFileSync(join(ROOT, f), "utf8"); assert(!/pm-membership|payments\.js|amountMinor|PaymentRequest|checkout\(/.test(t), `${f} reaches for a purchase`); }
});

// -------------------------------------------- 12. wallets: Payment Request
await check("Payment Request: never constructed without a configured merchant, a secure context and the API; both wallet methods offered only from the block; the mock path stays", async () => {
  let constructed = 0;
  class FakePR { constructor(methods, details) { constructed += 1; this.methods = methods; this.details = details; } async canMakePayment() { return true; } async show() { return { methodName: this.methods[0].supportedMethods, details: { token: "opaque" }, complete: async () => {} }; } }
  const secure = { isSecureContext: true, PaymentRequest: FakePR };
  const q = pm.pmCreateAdapter(FIXTURE).quote("seat-annual", 3);
  eq(pm.pmPaymentMethods(shipped, secure).length, 0, "the shipped block offers a wallet method");
  eq(await pm.pmRequestPayment(shipped, q, secure), null, "a request was built without a merchant");
  eq(pm.pmPaymentMethods(FIXTURE, secure).length, 0, "a fixture with no merchant offers a method");
  const withApple = { ...FIXTURE, applePay: { merchantIdentifier: "merchant.example.placeholder", countryCode: "US", supportedNetworks: ["visa"] } };
  const withBoth = { ...withApple, googlePay: { merchantId: "PLACEHOLDER-merchant", merchantName: "Example Hall", gateway: "example", gatewayMerchantId: "PLACEHOLDER-gateway", environment: "TEST", allowedCardNetworks: ["VISA"] } };
  eq(pm.pmPaymentMethods(withApple, secure).map((m) => m.supportedMethods).join(","), pm.PM_APPLE_PAY, "Apple Pay from the block");
  eq(pm.pmPaymentMethods(withBoth, secure).map((m) => m.supportedMethods).join(","), `${pm.PM_APPLE_PAY},${pm.PM_GOOGLE_PAY}`, "both wallets from the block");
  eq(pm.pmPaymentMethods(withBoth, { isSecureContext: false, PaymentRequest: FakePR }).length, 0, "an insecure context offers a wallet");
  eq(pm.pmPaymentMethods(withBoth, { isSecureContext: true }).length, 0, "a browser without PaymentRequest offers a wallet");
  eq(pm.pmPaymentMethods(withBoth, { isSecureContext: true, PaymentRequest: FakePR }).find((m) => m.supportedMethods === pm.PM_GOOGLE_PAY).data.merchantInfo.merchantId, "PLACEHOLDER-merchant", "the merchant id comes from the block");
  eq(constructed, 0, "a PaymentRequest was constructed before any request");
  eq(await pm.pmRequestPayment(withBoth, pm.pmCreateAdapter(shipped).quote("seat-annual", 3), secure), null, "an unpriced quote reached the wallet sheet");
  eq(constructed, 0, "constructed for an unpriced quote");
  const r = await pm.pmRequestPayment(withBoth, q, secure);
  assert(r?.ok && r.methodName === pm.PM_APPLE_PAY && r.details.token === "opaque", `wallet response: ${JSON.stringify(r)}`);
  eq(constructed, 1, "one request for one priced quote");
  eq(pm.pmCreateAdapter(withBoth).paymentMethods(secure).length, 2, "the adapter reports its methods");
  eq(net.length, 0, `requests made: ${net.join(", ")}`);
  // Nothing merchant-like in the shipped block or the tree.
  for (const k of ["applePay", "googlePay"]) if (file.payments[k]) for (const [kk, v] of Object.entries(file.payments[k])) if (kk !== "environment") assert(v === null || (Array.isArray(v) && v.length === 0), `payments.${k}.${kk} is set in the public build`);
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter((f) => /\.(js|mjs|json|html|md|toml|ya?ml)$/.test(f) && !f.includes("/dist/") && existsSync(join(ROOT, f)));
  for (const f of tracked) { const t = readFileSync(join(ROOT, f), "utf8"); assert(!/merchant\.[a-z0-9-]+\.[a-z0-9.-]+\.[a-z]{2,}/i.test(t.replace(/merchant\.example\.placeholder/g, "")) || f.endsWith("check_payments.mjs"), `${f} carries a merchant identifier`); assert(!/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(t), `${f} carries a private key`); assert(!/"private_key_id"\s*:/.test(t), `${f} carries a service-account key`); }
});

// ------------------------------------------------------- 13. wallet passes
await check("wallet passes: the unsigned Apple bundle and the Google class/object validate, sign only with environment paths, the routes match, no issuer id anywhere", async () => {
  const ap = await import("../workers/passes/apple-pass.mjs");
  const gp = await import("../workers/passes/google-pass.mjs");
  const ph = await import("../workers/passes/handler.mjs");
  const who = { level: { id: "member-plus", name: "Member Plus" }, memberName: "A. Member", membershipId: "m-0123456789ab" };
  const a = await ap.buildApplePass({ ...who, now: NOW });
  assert(a.ok && a.signed === false && /unsigned/.test(a.note) && a.placeholders, "the unsigned bundle");
  eq(ap.validateApplePass(a.pass).length, 0, `pass.json: ${ap.validateApplePass(a.pass)}`);
  eq(a.pass.generic.primaryFields[0].value, "Member Plus", "the level"); eq(a.pass.serialNumber, who.membershipId, "the membership id");
  assert(/^[0-9a-f]{40}$/.test(a.manifest["pass.json"]), "the manifest's SHA-1");
  assert(!("barcode" in a.pass) && !JSON.stringify(a.pass).includes("@"), "no barcode, no address");
  eq((await ap.signApplePass(a, { APPLE_PASS_CERT_PATH: "/nonexistent/cert.pem", APPLE_PASS_KEY_PATH: "/nonexistent/key.pem", APPLE_WWDR_CERT_PATH: "/nonexistent/wwdr.pem" })).signed, false, "signed without the files");
  assert(ap.validateApplePass({ ...a.pass, barcode: {} }).length === 1 && ap.validateApplePass(null).length === 1, "the validator");
  const g = gp.buildGooglePass({ ...who, now: NOW });
  assert(g.ok && g.jwt === null && g.placeholders && /no Save/.test(g.note), "the unsigned Google bundle");
  eq(gp.validateGooglePass(g.genericObject).length, 0, `generic object: ${gp.validateGooglePass(g.genericObject)}`);
  eq(g.genericObject.header.defaultValue.value, "Member Plus", "the level"); assert(g.genericObject.id.startsWith("PLACEHOLDER_ISSUER."), "a placeholder issuer");
  eq((await gp.buildGoogleSaveJwt(g, { GOOGLE_WALLET_SA_KEY_PATH: "/nonexistent/sa.json" })).jwt, null, "a JWT without the key file");
  // A JWT is signed when a key file exists: a throwaway RSA key generated here, never stored.
  const { generateKeyPairSync } = await import("node:crypto");
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
  const fakeFs = { existsSync: (p) => p === "/virtual/sa.json", readFileSync: () => JSON.stringify({ client_email: "issuer@example.invalid", private_key: privateKey }) };
  const signed = await gp.buildGoogleSaveJwt(gp.buildGooglePass({ ...who, env: { GOOGLE_WALLET_ISSUER_ID: "1234567890" } }), { GOOGLE_WALLET_SA_KEY_PATH: "/virtual/sa.json" }, { fs: fakeFs });
  assert(signed.jwt && signed.jwt.split(".").length === 3 && signed.saveUrl.startsWith("https://pay.google.com/gp/v/save/"), "the Save JWT");
  const payload = JSON.parse(Buffer.from(signed.jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
  eq(payload.typ, "savetowallet", "typ"); eq(payload.aud, "google", "aud"); eq(payload.payload.genericObjects[0].id, "1234567890.m-0123456789ab", "the object id under the issuer");
  // The routes, in the same contract as the payments handler.
  assert(Array.isArray(ph.ROUTES) && ph.ROUTES.every((r) => r.startsWith("/api/passes/")) && typeof ph.default === "function", "the passes handler's exports");
  eq((await ph.default(new Request("https://edge.example/api/passes/apple", { method: "POST", body: JSON.stringify({ ...who, membershipId: "someone@example.org" }) }), {})).status, 422, "an e-mail as the membership id is refused");
  const res = await ph.default(new Request("https://edge.example/api/passes/apple", { method: "POST", body: JSON.stringify(who) }), {});
  const j = await res.json(); eq(res.status, 200, "apple route"); eq(j.signed, false, "unsigned from the route"); assert(j.files["pass.json"] && j.files["manifest.json"] && j.files.signature === null, "the files");
  const gres = await (await ph.default(new Request("https://edge.example/api/passes/google", { method: "POST", body: JSON.stringify(who) }), {})).json();
  assert(gres.ok && gres.jwt === null && gres.genericObject, "google route");
  const h = await (await ph.default(new Request("https://edge.example/api/passes/health"), {})).json();
  eq(JSON.stringify(h.issuers), JSON.stringify({ apple: false, google: false }), "no issuer configured");
  for (const f of ["workers/passes/apple-pass.mjs", "workers/passes/google-pass.mjs", "workers/passes/handler.mjs"]) { const t = read(f); assert(!/from\s+["'][^"']*WebXR/.test(t) && !t.includes("fetch("), `${f} imports a browser module or reaches for the network`); assert(!/\b\d{15,}\b/.test(t), `${f} carries a number shaped like an issuer id`); }
  const docs = read("docs/payments.md");
  for (const k of ["Payment Request", "apple.com/apple-pay", "google.com/pay", "pm-membership.js", "pmHas(", "/api/passes/", "APPLE_PASS_CERT_PATH", "GOOGLE_WALLET_SA_KEY_PATH", "Apple developer account", "Google Wallet"]) assert(docs.includes(k), `docs/payments.md does not document ${k}`);
});

console.log(failures ? `\n${failures} seat-billing check(s) failed.` : "\nAll seat-billing checks pass.");
process.exit(failures ? 1 : 0);
