// The Billing view of the instructor console (console TILL, docs/payments.md):
// enterprise seat billing on the organisation layer, rendered as plain text
// nodes — nothing here sets markup from a string (tools/check_console.mjs),
// and an organisation's name or a cohort's is untrusted input by the time it
// reaches this page.
//
// Panels: the provider and plans as configured (amounts shown as configured,
// never invented); seats used / licensed / planned per cohort with a quote
// and a mock checkout; receipts with a procedural SVG invoice each, marked
// "prototype — not an invoice"; the Budget panel (the agent's policy, spend
// against the ceiling, its last ten decisions, the approval queue); and the
// payment lines of this device's audit log. A learner never sees this page
// buy anything: only a coordinator's organisation licenses seats.
//
// Every top-level name starts with `pm` (the bundler shares one scope).

import { pmCreateAdapter, pmLoad, pmSeatsAll, pmInvoiceSVG, pmLoadSample, pmMoney, pmClear, pmAuditList, PM_MOCK, PM_MAX_SEATS } from "../../shared/payments.js";
import { pmAgentLoad, pmAgentSetPolicy, pmAgentEvents, pmAgentRun, pmAgentResolve, pmAgentAdapter } from "../../shared/pm-agent.js";
import { enOrgs, enCohorts, enCohort, enAuditList } from "../../shared/org.js";
import { PP_PROGRAMMES } from "../../shared/passport-programmes.js";
import { enEnabledProgrammes } from "./cohort.js";

const pmEl = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const pmState = { root: null, enterprise: null, payments: null, adapter: null, toast: null, quote: null, busy: false };

function pmSay(text) { try { pmState.toast?.(text); } catch (_) { /* no toast */ } }

function pmDownload(name, text, type) {
  if (typeof URL?.createObjectURL !== "function") return false;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return true;
}

function pmButton(label, onClick, cls = "small") { const b = pmEl("button", cls, label); b.type = "button"; b.addEventListener("click", onClick); return b; }
function pmField(label, input) { const wrap = pmEl("label", "pm-field"); wrap.append(pmEl("span", "muted", label), input); return wrap; }
function pmInput(type, placeholder, attrs = {}) {
  const i = pmEl("input"); i.type = type; i.placeholder = placeholder; i.autocomplete = "off"; i.setAttribute("aria-label", placeholder);
  for (const [k, v] of Object.entries(attrs)) i.setAttribute(k, String(v));
  return i;
}
function pmSelect(options, value = null) {
  const s = pmEl("select");
  for (const [v, label] of options) { const o = pmEl("option", null, label); o.value = v; s.append(o); }
  s.value = value != null ? value : options[0]?.[0] ?? "";
  return s;
}
function pmTable(headers, rows, empty) {
  const wrap = pmEl("div", "pm-scroll"); const table = pmEl("table");
  const thead = pmEl("thead"); const hr = pmEl("tr"); for (const h of headers) hr.append(pmEl("th", null, h)); thead.append(hr); table.append(thead);
  const tbody = pmEl("tbody");
  for (const cells of rows) { const tr = pmEl("tr"); for (const c of cells) { if (c instanceof Object && c.tagName) { const td = pmEl("td"); td.append(c); tr.append(td); } else tr.append(pmEl("td", null, String(c ?? ""))); } tbody.append(tr); }
  if (!rows.length) { const tr = pmEl("tr"); const td = pmEl("td", "muted", empty); td.colSpan = headers.length; tr.append(td); tbody.append(tr); }
  table.append(tbody); wrap.append(table);
  return wrap;
}

/** The block the tab works from: the deployment's, or the mock standing in when no provider is named. */
export function pmEffectiveConfig(payments = pmState.payments) {
  const p = payments ?? { provider: null, currency: null, currencyExponent: 2, plans: [] };
  return p.provider ? p : { ...p, provider: PM_MOCK };
}

/** The cohorts this deployment's programmes allow (docs/enterprise.md), for the seat table and the quote form. */
export function pmVisibleCohorts(enterprise = pmState.enterprise) {
  const on = new Set(enEnabledProgrammes(enterprise));
  return enCohorts().filter((c) => on.has(c.programme));
}

// ------------------------------------------------------------ provider panel

function pmProviderPanel() {
  const panel = pmEl("section", "panel"); panel.id = "pm-plans";
  panel.append(pmEl("h2", null, "Provider and plans"));
  const d = pmState.adapter.describe();
  const org = pmState.enterprise?.organisation;
  if (org) panel.append(pmEl("p", "fine", `This deployment is configured for ${org}; its seats are licensed here, by a coordinator. Learners never buy anything.`));
  const line = pmEl("p", "fine"); line.id = "pm-provider";
  line.textContent = pmState.payments?.provider
    ? `Provider: ${d.provider}${d.configured ? "" : ` — not fully configured (${d.missing.join(", ")}); checkout refuses until it is`}. Publishable key ${d.publishableKey ? "set" : "not set"}; currency ${d.currency ?? "not configured"}.`
    : `No provider is configured (auth-config.json, payments block), so the on-device mock stands in: a checkout here is a stub, nothing is charged and nothing leaves this device. Currency ${d.currency ?? "not configured"}.`;
  panel.append(line);
  panel.append(pmTable(["Plan", "Period", "Amount per seat, as configured"], d.plans.map((p) => [p.name, `${p.period}${p.periodDays ? ` (${p.periodDays} days)` : ""}`, p.display]), "No plan is configured."));
  panel.append(pmEl("p", "fine", "Amounts are the deployment's configuration and are shown exactly as configured; the platform sets no price. A quote is seats × the configured amount, before anything the provider adds at checkout."));
  const tools = pmEl("div", "row");
  tools.append(pmButton("Load sample billing", () => { const r = pmLoadSample(pmEffectiveConfig()); (r.done ?? Promise.resolve()).then(() => { pmSay(r.fresh ? "Sample cohort licensed through the mock." : "The sample billing is already here."); pmRender(); }); }),
    pmButton("Forget billing on this device", () => { if (typeof confirm === "function" && !confirm("Forget every checkout session, receipt, licence and agent decision kept for this profile on this device?")) return; pmClear(); pmState.quote = null; pmRender(); }));
  panel.append(tools);
  return panel;
}

// --------------------------------------------------------------- seat panel

function pmSeatPanel() {
  const panel = pmEl("section", "panel"); panel.id = "pm-seats";
  panel.append(pmEl("h2", null, "Seats — used, licensed, planned"));
  const visible = new Set(pmVisibleCohorts().map((c) => c.id));
  const rows = pmSeatsAll().filter((v) => visible.has(v.cohortId)).map((v) => {
    const c = enCohort(v.cohortId);
    const end = v.licences.map((l) => l.periodEnd).filter(Boolean).sort().pop();
    return [c?.name ?? v.cohortId, PP_PROGRAMMES[c?.programme]?.name ?? c?.programme ?? "", String(v.used), String(v.licensed), String(v.planned), end ? end.slice(0, 10) : (v.licensed ? "open" : "—")];
  });
  const table = pmTable(["Cohort", "Programme", "Used", "Licensed", "Planned", "Licence ends"], rows, "No cohort yet — create one on the Cohorts tab, or load the sample.");
  table.id = "pm-seat-table";
  panel.append(table);
  panel.append(pmEl("p", "fine", "Used is learners joined; licensed is paid seats whose period has not ended; planned is the cohort's own seat count. Paying for more seats than planned grows the cohort; paying for fewer never removes anyone."));
  // Quote and checkout.
  const cohorts = pmVisibleCohorts();
  const plans = pmState.adapter.describe().plans;
  if (cohorts.length && plans.length) {
    const cohort = pmSelect(cohorts.map((c) => [c.id, c.name]));
    const plan = pmSelect(plans.map((p) => [p.id, `${p.name} — ${p.display}`]));
    const seats = pmInput("number", "Seats", { min: 1, max: PM_MAX_SEATS }); seats.value = String(cohorts[0].seats);
    cohort.addEventListener("change", () => { seats.value = String(enCohort(cohort.value)?.seats ?? seats.value); });
    const out = pmEl("p", "fine"); out.id = "pm-quote";
    const row = pmEl("div", "row");
    row.append(pmField("Cohort", cohort), pmField("Plan", plan), pmField("Seats", seats));
    const buy = pmButton(`Checkout${pmState.adapter.id === PM_MOCK ? " (mock)" : ""}`, async () => {
      if (!pmState.quote) { pmSay("Quote first."); return; }
      const r = await pmState.adapter.checkout(pmState.quote);
      if (r === null) { pmSay("No provider is configured: nothing was requested."); return; }
      if (!r.ok) { pmSay(`Checkout refused: ${r.reason}.`); return; }
      pmSay(`Checkout session ${r.session.id} opened — ${r.redirect.kind}. ${r.redirect.note}`);
      pmState.quote = null; pmRender();
    }, "primary small");
    buy.disabled = true; buy.id = "pm-checkout";
    row.append(pmButton("Quote", () => {
      const c = enCohort(cohort.value);
      const q = pmState.adapter.quote(plan.value, seats.value, { orgId: c?.orgId ?? null, cohortId: c?.id ?? null });
      if (!q) { pmSay(`A quote needs a plan and 1–${PM_MAX_SEATS} seats.`); pmState.quote = null; buy.disabled = true; return; }
      pmState.quote = q; buy.disabled = false;
      out.textContent = `Quote ${q.id}: ${q.seats} seat(s) × ${q.display.unit} = ${q.display.total} per ${q.plan.period}${q.priced ? "" : " — the plan's amount is not configured, so the checkout would carry no amount"}. ${q.note}`;
    }), buy);
    panel.append(pmEl("h3", null, "Quote and checkout"), row, out);
  }
  // Open sessions (the mock completes or declines them here; a hosted provider answers by webhook).
  const open = pmLoad().sessions.filter((s) => s.state === "open");
  if (open.length) {
    const list = pmEl("ul", "ints"); list.id = "pm-sessions";
    for (const s of open) {
      const li = pmEl("li", "int");
      li.append(pmEl("p", "int-kind", `Session ${s.id} · ${enCohort(s.quote.cohortId)?.name ?? "no cohort"} · ${s.quote.seats} seat(s) · ${s.quote.display?.total ?? ""}`));
      li.append(pmEl("p", null, `${s.redirect?.kind ?? "pending"}: ${s.redirect?.href ?? ""} — ${s.redirect?.note ?? ""}`));
      if (s.provider === PM_MOCK) {
        const row = pmEl("div", "row");
        row.append(pmButton("Complete (mock)", () => { const w = pmState.adapter.mockComplete(s.id); pmSay(w.ok ? `Receipt ${w.receipt?.number ?? ""} landed.` : w.reason); pmRender(); }, "primary small"),
          pmButton("Decline (mock)", () => { pmState.adapter.mockFail(s.id); pmSay("The mock declined the session."); pmRender(); }));
        li.append(row);
      }
      list.append(li);
    }
    panel.append(pmEl("h3", null, "Open checkout sessions"), list);
  }
  return panel;
}

// ------------------------------------------------------------ invoice panel

/** Download a receipt's invoice SVG (prototype — not an invoice). */
export function pmOpenInvoice(receipt) {
  const org = enOrgs().find((o) => o.id === receipt.orgId) ?? null;
  const svg = pmInvoiceSVG(receipt, { org, cohort: enCohort(receipt.cohortId), config: pmEffectiveConfig() });
  if (!svg) return null;
  const name = `receipt-${String(receipt.number ?? receipt.id).toLowerCase()}.svg`;
  pmDownload(name, svg, "image/svg+xml");
  pmSay(`${receipt.number} written as ${name} — a prototype, not an invoice.`);
  return svg;
}

function pmInvoicePanel() {
  const panel = pmEl("section", "panel"); panel.id = "pm-invoices";
  panel.append(pmEl("h2", null, "Receipts and invoices (prototype — not an invoice)"));
  const cfg = pmEffectiveConfig();
  const receipts = pmLoad().receipts.slice().reverse();
  const rows = receipts.map((r) => [r.number, String(r.at).slice(0, 10), enCohort(r.cohortId)?.name ?? "—", String(r.seats), pmMoney(r.amountMinor, { currency: r.currency ?? cfg.currency, currencyExponent: cfg.currencyExponent }), `${r.state}${r.provider === PM_MOCK ? " (mock)" : ""}`, pmButton("Invoice SVG", () => pmOpenInvoice(r))]);
  const table = pmTable(["Number", "Date", "Cohort", "Seats", "Amount, as configured", "State", ""], rows, "No receipt yet.");
  table.id = "pm-receipts";
  panel.append(table);
  panel.append(pmEl("p", "fine", "Each invoice is a procedural SVG of the receipt recorded on this device, marked \"PROTOTYPE — NOT AN INVOICE\": it is not a tax document."));
  return panel;
}

// ------------------------------------------------------------- budget panel

function pmBudgetPanel() {
  const panel = pmEl("section", "panel"); panel.id = "pm-budget";
  panel.append(pmEl("h2", null, "Budget — the agent's policy and decisions"));
  panel.append(pmEl("p", "fine", "A coordinator sets the policy; the agent plans within it: it quotes and buys seats when a cohort fills, renews before a licence ends, releases unused seats at period end, provisions the cohort once the receipt lands, refuses anything over the ceiling and queues it for a human, and writes every decision with its reason to the audit log. On this device it runs against the mock; amounts are the configured plan's."));
  const { policy, state } = pmAgentLoad();
  const cfg = pmEffectiveConfig();
  const plans = pmState.adapter.describe().plans;
  // Policy form. Amounts are typed in the currency's minor unit, as the block stores them.
  const plan = pmSelect([["", "— plan —"], ...plans.map((p) => [p.id, `${p.name} — ${p.display}`])], policy.planId ?? "");
  const ceiling = pmInput("number", "Ceiling (minor units)", { min: 0 }); if (policy.ceilingMinor != null) ceiling.value = String(policy.ceilingMinor);
  const period = pmInput("number", "Period (days)", { min: 1, max: 3660 }); period.value = String(policy.periodDays);
  const floor = pmInput("number", "Seat floor", { min: 0, max: 1000 }); floor.value = String(policy.seatFloor);
  const cap = pmInput("number", "Seat cap", { min: 1, max: 1000 }); cap.value = String(policy.seatCap);
  const threshold = pmInput("number", "Approval above (minor units)", { min: 0 }); if (policy.approvalThresholdMinor != null) threshold.value = String(policy.approvalThresholdMinor);
  const renew = pmEl("input"); renew.type = "checkbox"; renew.id = "pm-autorenew"; renew.checked = policy.autoRenew;
  const renewLabel = pmEl("label", "muted"); renewLabel.setAttribute("for", "pm-autorenew"); renewLabel.append(renew, " Auto-renew");
  const release = pmEl("input"); release.type = "checkbox"; release.id = "pm-release"; release.checked = policy.releaseUnused;
  const releaseLabel = pmEl("label", "muted"); releaseLabel.setAttribute("for", "pm-release"); releaseLabel.append(release, " Release unused seats at period end");
  const form = pmEl("div", "row"); form.id = "pm-policy";
  form.append(pmField("Plan", plan), pmField("Ceiling per period", ceiling), pmField("Period (days)", period), pmField("Seat floor", floor), pmField("Seat cap", cap), pmField("Human approval above", threshold), renewLabel, releaseLabel);
  form.append(pmButton("Save policy", () => {
    const p = pmAgentSetPolicy({ planId: plan.value || null, ceilingMinor: ceiling.value === "" ? null : Number(ceiling.value), periodDays: Number(period.value), seatFloor: Number(floor.value), seatCap: Number(cap.value), autoRenew: renew.checked, releaseUnused: release.checked, approvalThresholdMinor: threshold.value === "" ? null : Number(threshold.value) });
    pmSay(`Policy saved: ceiling ${p.ceilingMinor == null ? "not set" : pmMoney(p.ceilingMinor, cfg)} per ${p.periodDays} days.`); pmRender();
  }, "primary small"));
  panel.append(pmEl("h3", null, "Policy"), form);
  // Spend against ceiling.
  const spend = pmEl("div"); spend.id = "pm-spend";
  const spent = state.spentMinor | 0;
  const text = policy.ceilingMinor == null ? `Spent this period: ${pmMoney(spent, cfg)} — no ceiling is set, so the agent buys nothing and asks a human.` : `Spent this period: ${pmMoney(spent, cfg)} of ${pmMoney(policy.ceilingMinor, cfg)}${state.period ? ` (period ${state.period.start.slice(0, 10)} to ${state.period.end.slice(0, 10)})` : ""}.`;
  spend.append(pmEl("p", "fine", text));
  const bar = pmEl("div", "bar"); const fill = pmEl("span"); fill.style.width = `${policy.ceilingMinor ? Math.min(100, Math.round((spent / Math.max(1, policy.ceilingMinor)) * 100)) : 0}%`; bar.append(fill); spend.append(bar);
  const run = pmEl("div", "row");
  run.append(pmButton("Run the agent now", async () => {
    if (pmState.busy) return; pmState.busy = true;
    try { const r = await pmAgentRun(pmAgentAdapter(cfg), pmAgentEvents(), { config: cfg }); pmSay(`${r.actions.length} action(s): ${r.actions.map((a) => a.kind).join(", ") || "nothing to do"}.`); }
    finally { pmState.busy = false; pmRender(); }
  }, "primary small"));
  spend.append(run);
  panel.append(pmEl("h3", null, "Spend against the ceiling"), spend);
  // Last ten decisions.
  const decisions = pmEl("ul", "ints"); decisions.id = "pm-decisions";
  for (const d of state.decisions.slice(-10).reverse()) { const li = pmEl("li", `int pm-${d.kind}`); li.append(pmEl("p", "int-kind", `${String(d.at).replace("T", " ").slice(0, 16)} · ${d.kind}`), pmEl("p", null, d.reason)); decisions.append(li); }
  if (!state.decisions.length) decisions.append(pmEl("li", "muted", "No decision yet — save a policy and run the agent."));
  panel.append(pmEl("h3", null, "Last ten decisions"), decisions);
  // Approval queue.
  const queue = pmEl("ul", "ints"); queue.id = "pm-queue";
  for (const q of state.queue) {
    const li = pmEl("li", "int pm-queued");
    li.append(pmEl("p", "int-kind", `${q.why} · ${q.proposed.cohortName ?? q.proposed.cohortId ?? ""} · ${q.proposed.seats} seat(s)${Number.isInteger(q.proposed.amountMinor) ? ` · ${pmMoney(q.proposed.amountMinor, cfg)}` : ""}`), pmEl("p", null, q.reason));
    const row = pmEl("div", "row");
    row.append(pmButton("Confirm", async () => { const r = await pmAgentResolve(pmAgentAdapter(cfg), q.id, true, { config: cfg }); pmSay(`Confirmed: ${r.actions.map((a) => a.kind).join(", ")}.`); pmRender(); }, "primary small"),
      pmButton("Decline", async () => { await pmAgentResolve(pmAgentAdapter(cfg), q.id, false, { config: cfg }); pmSay("Declined."); pmRender(); }));
    li.append(row); queue.append(li);
  }
  if (!state.queue.length) queue.append(pmEl("li", "muted", "Nothing waits for approval."));
  panel.append(pmEl("h3", null, "Approval queue — a human confirms"), queue);
  return panel;
}

// -------------------------------------------------------------- audit panel

function pmAuditPanel() {
  const panel = pmEl("section", "panel"); panel.id = "pm-audit";
  panel.append(pmEl("h2", null, "Audit log — payment and agent lines on this device"));
  const list = pmAuditList(enAuditList());
  const rows = list.slice(0, 100).map((a) => [String(a.at).replace("T", " ").slice(0, 19), a.action, a.detail]);
  panel.append(pmTable(["Time", "Action", "Detail"], rows, "Nothing yet."));
  return panel;
}

/** Rebuild the whole view from the stores (plain text nodes only). */
export function pmRender(root = pmState.root) {
  if (!root) return null;
  if (!pmState.adapter) pmState.adapter = pmCreateAdapter(pmEffectiveConfig());
  root.replaceChildren();
  root.append(pmProviderPanel(), pmSeatPanel(), pmInvoicePanel(), pmBudgetPanel(), pmAuditPanel());
  return root;
}

const PM_CSS = `
#view-billing .pm-field{display:inline-flex;flex-direction:column;gap:3px;font-size:12px}
#view-billing .pm-field input,#view-billing .pm-field select{min-width:120px;flex:0 0 auto;height:auto}
#view-billing .pm-field select{max-width:320px}
#view-billing .pm-scroll{overflow:auto;max-width:100%}
#view-billing .int.pm-refuse,#view-billing .int.pm-deny{border-left:3px solid var(--bad)}
#view-billing .int.pm-queue,#view-billing .int.pm-queued{border-left:3px solid var(--warn)}
#view-billing .int.pm-checkout,#view-billing .int.pm-provision{border-left:3px solid var(--good)}
#view-billing .int.pm-release,#view-billing .int.pm-hold,#view-billing .int.pm-period{border-left:3px solid var(--edge)}
`;

/**
 * Mount the view into `root` (the console's #pm-root). `enterprise` and
 * `payments` are the deployment's blocks (Auth.config) once auth-config.json
 * has been read; `toast` is the console's status line.
 */
export function pmMountBillingView(root, { enterprise = null, payments = null, toast = null } = {}) {
  if (!root) return null;
  pmState.root = root; pmState.enterprise = enterprise; pmState.payments = payments; pmState.toast = toast;
  pmState.adapter = pmCreateAdapter(pmEffectiveConfig(payments));
  if (!document.getElementById("pm-style")) { const s = document.createElement("style"); s.id = "pm-style"; s.textContent = PM_CSS; document.head.appendChild(s); }
  try { addEventListener("gt:profile", () => pmRender(root)); addEventListener("en:change", () => pmRender(root)); } catch (_) { /* headless */ }
  return pmRender(root);
}

/** Let the console hand over the blocks after the config loads. */
export function pmSetConfig({ enterprise = null, payments = null } = {}) {
  pmState.enterprise = enterprise ?? null; pmState.payments = payments ?? null;
  pmState.adapter = pmCreateAdapter(pmEffectiveConfig(pmState.payments));
  if (pmState.root) pmRender(pmState.root);
}
