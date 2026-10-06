// The "Data governance" view of the instructor console (console ENTERPRISE-3,
// docs/enterprise.md section 6): an organisation's consent registry, its
// dataset cards (DATAWORKS' datasheets), lineage from dataset id to policy id
// to eval, the robot fleet / agent registry over the sim's robot sites, one-tap
// revoke, the append-only audit log with its chain check, and the billing
// adapter's status (off unless the deployment configures it).
//
// Built from createElement/textContent only — tools/check_console.mjs forbids
// markup from strings on this page, and every id and name here is untrusted.
// Every top-level name starts with `ent3` (the bundler shares one scope).

import { ent3Consents, ent3Datasets, ent3DatasetCard, ent3Policies, ent3LineageRows, ent3Fleet, ent3Revoke, ent3AuditList, ent3VerifyAudit, ent3LoadSample, ent3Deploy, ENT3_METHODS } from "../../shared/ent3-governance.js";
import { ent3BillingAdapter, ent3BillingConfig } from "../../shared/ent3-billing.js";

function ent3El(tag, cls, text) { const node = document.createElement(tag); if (cls) node.className = cls; if (text !== undefined) node.textContent = text; return node; }
const ent3View = { root: null, toast: null, config: null, card: null };

function ent3Say(t) { try { ent3View.toast?.(t); } catch (_) { /* no toast */ } }
function ent3Btn(label, onClick, cls = "small") { const b = ent3El("button", cls, label); b.type = "button"; b.addEventListener("click", onClick); return b; }
function ent3Panel(title, note) { const p = ent3El("section", "panel"); p.append(ent3El("h2", null, title)); if (note) p.append(ent3El("p", "fine", note)); return p; }
function ent3Table(headers, rows, empty) {
  const wrap = ent3El("div", "ent3-scroll"); const t = ent3El("table");
  const hr = ent3El("tr"); for (const h of headers) hr.append(ent3El("th", null, h)); const th = ent3El("thead"); th.append(hr); t.append(th);
  const tb = ent3El("tbody");
  for (const cells of rows) { const tr = ent3El("tr"); for (const c of cells) { const td = ent3El("td"); if (c && c.nodeType) td.append(c); else td.textContent = String(c ?? ""); tr.append(td); } tb.append(tr); }
  if (!rows.length) { const tr = ent3El("tr"); const td = ent3El("td", "muted", empty); td.colSpan = headers.length; tr.append(td); tb.append(tr); }
  t.append(tb); wrap.append(t); return wrap;
}
function ent3Method(id) { return ENT3_METHODS.find((m) => m.id === id)?.label ?? id; }
function ent3Score(e) { return e ? `${e.metric} ${e.value}${e.measured ? "" : " (sample figure)"} — ${e.suite}, n=${e.n}` : "no eval"; }

function ent3Render() {
  const root = ent3View.root; if (!root) return;
  const consents = ent3Consents(); const datasets = ent3Datasets(); const policies = ent3Policies();
  const out = [];

  const intro = ent3Panel("Training-data governance", "A registry, not a training system: it records which consented learners' episodes (DATAWORKS receipts — consent id, time, licence, statement hash; never a name or an episode) went into which dataset, which dataset trained which robot policy or agent tutor, how each was evaluated and where it runs in the sim. Revoking a consent marks every dataset holding it for rebuild and every policy trained on it — or based on such a policy — stale. Kept with the signed-in profile on this device; nothing is sent anywhere.");
  if (!datasets.length) intro.append(ent3Btn("Load the sample registry", () => { ent3LoadSample(); ent3Say("Sample registry loaded (sample figures are marked)."); ent3Render(); }));
  out.push(intro);

  const cp = ent3Panel("Consent registry", "Adults only, opt-in only; K-12, demo and signed-out sessions are never collected (DATAWORKS). Revoke is one tap and cannot be undone.");
  cp.append(ent3Table(["Consent", "Organisation", "Licence", "Given", "State", ""], consents.map((c) => [c.consentId, c.orgId, c.licence, c.at.slice(0, 10), c.state === "revoked" ? `revoked ${String(c.revokedAt).slice(0, 10)}` : "active",
    c.state === "revoked" ? "" : ent3Btn("Revoke", () => { const r = ent3Revoke({ consentId: c.consentId }, "revoked from the console"); ent3Say(`Revoked ${c.consentId}: ${r.datasetsAffected.length} dataset(s) to rebuild, ${r.policiesStale.length} policy(ies) stale, ${r.deploymentsFlagged.length} deployment(s) flagged.`); ent3Render(); }, "small danger")]), "No consents registered."));
  out.push(cp);

  const dp = ent3Panel("Datasets and their cards", "Each card is DATAWORKS' datasheet (every required section) with the registry's governance lines.");
  dp.append(ent3Table(["Dataset", "Source", "Episodes", "Consents", "Status", ""], datasets.map((d) => [d.id, d.source, d.episodes, d.consentIds.length, d.status, ent3Btn(ent3View.card === d.id ? "Hide card" : "Card", () => { ent3View.card = ent3View.card === d.id ? null : d.id; ent3Render(); })]), "No datasets registered."));
  if (ent3View.card) { const pre = ent3El("pre", "ent3-card", ent3DatasetCard(ent3View.card) ?? ""); pre.tabIndex = 0; dp.append(pre); }
  out.push(dp);

  const lp = ent3Panel("Lineage: dataset → policy → eval", "Methods are named for what they are (behaviour cloning, a scripted expert, a bandit tutor). Figures marked \"sample\" are illustrative; measured figures come from rb-env rollouts on held-out seeds.");
  lp.append(ent3Table(["Dataset", "Policy", "Method", "Status", "Latest eval", "Deployed at"], ent3LineageRows().map((r) => [`${r.datasetId} (${r.datasetStatus})`, `${r.policyId} @${r.version}`, ent3Method(r.method), r.status, ent3Score(r.evals[r.evals.length - 1]), r.sites.join(", ") || "—"]), "No policies registered."));
  out.push(lp);

  const fp = ent3Panel("Robot fleet and agent registry (sim)", "Which policy version runs at each robot site in the parish maps, with its latest eval. A stale policy cannot be deployed; a deployed one that goes stale is flagged here.");
  const current = policies.filter((p) => p.status === "current" && p.kind === "robot");
  fp.append(ent3Table(["Site", "Map", "Rig", "Policy", "Eval", "Flag", ""], ent3Fleet().map((r) => {
    const sel = ent3El("select"); sel.setAttribute("aria-label", `Policy for ${r.name}`);
    for (const p of [{ id: "", name: "Deploy a policy…" }, ...current]) { const o = ent3El("option", null, p.id ? `${p.id} @${p.version}` : p.name); o.value = p.id; sel.append(o); }
    sel.addEventListener("change", () => { if (!sel.value) return; const res = ent3Deploy({ policyId: sel.value, siteId: r.siteId }); ent3Say(res.ok ? `Deployed ${sel.value} to ${r.name} (sim).` : res.reason); ent3Render(); });
    return [r.name, r.parish, r.rig, r.deployment ? `${r.deployment.policyId} @${r.deployment.version}` : "—", r.evalScore == null ? "—" : `${r.evalScore}${r.evalMeasured ? "" : " (sample)"}`, r.stale ? "STALE — retrain" : (r.deployment ? "ok" : ""), sel];
  }), "No robot sites."));
  const agents = policies.filter((p) => p.kind === "agent");
  fp.append(ent3El("h3", null, "Agent tutors"));
  fp.append(ent3Table(["Agent", "Method", "Status", "Latest eval"], agents.map((p) => [`${p.id} @${p.version}`, ent3Method(p.method), p.status, ent3Score(p.evals[p.evals.length - 1])]), "No agent tutors registered."));
  out.push(fp);

  const bp = ent3Panel("Billing adapters", "Organisation seat licences through Chargebee (subscriptions and entitlements) or PayPal (invoices) — off unless this deployment's auth-config.json has a billing block. No key ships; the browser only ever sends a request description to the deployment's own proxy. Crew Credits are play currency and never touch billing. No price is shown here.");
  const d = ent3BillingAdapter(ent3BillingConfig(ent3View.config)).describe();
  bp.append(ent3El("p", null, d.enabled ? `Provider: ${d.provider} · capabilities: ${d.capabilities.join(", ")} · proxy: ${d.proxy ?? "on-device mock"}` : "Billing: off (not configured for this deployment)."));
  out.push(bp);

  const ap = ent3Panel("Audit log (append-only)", "Every registry change, oldest first. Each line carries the hash of the one before it; the check below re-walks the chain. Tamper-evident on this device, not cryptographic proof.");
  const v = ent3VerifyAudit();
  ap.append(ent3El("p", v.ok ? "ent3-ok" : "ent3-bad", v.ok ? `Chain verified: ${v.lines} line(s) intact.` : `Chain broken at line ${v.brokenAt} of ${v.lines}.`));
  ap.append(ent3Table(["#", "When", "Action", "Detail"], ent3AuditList().slice(-60).reverse().map((a) => [a.seq, a.at.slice(0, 19).replace("T", " "), a.action, a.detail]), "Nothing recorded yet."));
  out.push(ap);

  root.replaceChildren(...out);
}

const ENT3_CSS = "#ent3-root .ent3-scroll{overflow-x:auto}#ent3-root pre.ent3-card{white-space:pre-wrap;max-height:360px;overflow:auto;background:var(--bg,transparent);border:1px solid var(--edge);border-radius:10px;padding:12px;font-size:12px}#ent3-root .ent3-ok{color:var(--ok,inherit)}#ent3-root .ent3-bad{color:var(--danger,inherit);font-weight:600}#ent3-root h2{font-size:16px;margin:0 0 6px}#ent3-root h3{font-size:14px;margin:14px 0 6px}#ent3-root select{max-width:220px}";

/** Mount the view; `config` is the parsed auth-config (for the billing block). Returns { render, setConfig }. */
export function ent3MountGovernanceView(root, { toast = null, config = null } = {}) {
  if (!root) return null;
  ent3View.root = root; ent3View.toast = toast; ent3View.config = config;
  if (!document.getElementById("ent3-style")) { const s = document.createElement("style"); s.id = "ent3-style"; s.textContent = ENT3_CSS; document.head.appendChild(s); }
  try { addEventListener("gt:profile", ent3Render); } catch (_) { /* headless */ }
  ent3Render();
  return { render: ent3Render, setConfig: (c) => { ent3View.config = c ?? null; ent3Render(); } };
}
