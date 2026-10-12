// HIVE-4 — the instructor console's "Omega Hive" tab (docs/consoles/HIVE-4.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Read-only and local. The tab replays the hive's seeded day on this device (ohHive with the talk on, `audit: null`, no learner:
// requests that name a robot stay waiting, because only the learner approves them in the parishes app) and shows each agent's
// card (portrait, traits, voice), its queue and last ten lines, the governor's refusals with their reasons, and the evals table
// from the committed JSON (docs/evals/hive4.json, written by tools/check_hive4.mjs). It approves nothing, declines nothing,
// writes nothing (no registry line, no storage), speaks nothing and listens to nothing; every agent is labelled a software agent.
// Built from createElement/textContent only (the console's rule: ids and lines are data, never markup).
//
// SEAM: h4MountHiveTab(root, { seed, steps }) -> { render(steps), hive(), state() }
//   The portrait is AGENT-AVATARS' roster portrait (aaPortraitImg); when AVATARS-HD's new portrait export lands, swap it in here.
//
// Every top-level name starts with `h4`/`H4_` (the bundler shares one scope).

import { OH_AGENTS, OH_REASON_PHRASES, ohTraitChips } from "../../shared/oh-hive-data.js";
import { ohHive, ohClock } from "../../shared/oh-hive.js";
import { VB_REASONS } from "../../shared/vb-shared-data.js";
import { RB_SITES } from "../../shared/rb-robotics-data.js";
import { aaPortraitImg } from "../../shared/aa-agent-portraits.js";

export const H4_TAB_SEED = 1;
export const H4_TAB_STEPS = Object.freeze([60, 120, 240, 480]);
export const H4_EVALS_URL = "../../docs/evals/hive4.json";
const H4_CSS = "#h4-root .h4-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:10px}#h4-root .h4-card{border:1px solid var(--edge);border-radius:12px;padding:10px;min-width:0}#h4-root .h4-head{display:flex;gap:10px;align-items:center}#h4-root .h4-head img{border-radius:10px;flex:none}#h4-root .h4-chip{display:inline-block;font-size:11px;padding:1px 6px;border-radius:9px;border:1px solid currentColor;margin:2px 4px 0 0;opacity:.85}#h4-root .h4-role{font-size:12px;opacity:.85;overflow-wrap:anywhere}#h4-root .h4-traits{display:grid;grid-template-columns:auto 1fr auto;gap:2px 8px;font-size:12px;margin:6px 0;align-items:center}#h4-root meter{width:100%}#h4-root ol.h4-lines{margin:4px 0 0;padding-left:18px;font-size:12px;max-height:220px;overflow:auto}#h4-root ol.h4-lines li{margin:2px 0;overflow-wrap:anywhere}#h4-root ol.h4-lines li[data-x='1']{margin-left:10px}#h4-root .h4-q{font-size:12px;margin:4px 0}#h4-root .h4-scroll{overflow-x:auto}#h4-root select{min-height:44px;min-width:44px;font-size:14px}#h4-root h3{font-size:14px;margin:10px 0 4px}";

function h4El(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; }
function h4Table(headers, rows, empty) {
  const wrap = h4El("div", "h4-scroll"); const t = h4El("table");
  const hr = h4El("tr"); for (const h of headers) hr.append(h4El("th", null, h)); const th = h4El("thead"); th.append(hr); t.append(th);
  const tb = h4El("tbody");
  for (const cells of rows) { const tr = h4El("tr"); for (const c of cells) tr.append(h4El("td", null, String(c ?? ""))); tb.append(tr); }
  if (!rows.length) { const tr = h4El("tr"); const td = h4El("td", "muted", empty); td.colSpan = headers.length; tr.append(td); tb.append(tr); }
  t.append(tb); wrap.append(t); return wrap;
}
const h4Site = (id) => RB_SITES.find((s) => s.id === id)?.name ?? id;
const h4Reason = (id) => VB_REASONS.find((r) => r.id === id)?.text ?? OH_REASON_PHRASES[id] ?? id;

export function h4MountHiveTab(root, { seed = H4_TAB_SEED, steps = 120 } = {}) {
  if (!root || typeof document === "undefined") return null;
  if (!document.getElementById("h4-style")) { const s = document.createElement("style"); s.id = "h4-style"; s.textContent = H4_CSS; document.head.appendChild(s); }
  let hive = null, at = steps, evals = null, evalsNote = "Reading docs/evals/hive4.json…";
  fetch(H4_EVALS_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then((j) => { evals = j; render(at); }).catch(() => { evalsNote = "The evals file (docs/evals/hive4.json) could not be read from this origin."; render(at); });

  function replay(n) {
    hive = ohHive({ seed, audit: null, exchanges: true, memory: true, variety: true });
    hive.run(n);
    return hive;
  }

  function render(n = at) {
    at = n; if (!hive || hive.now() !== n) replay(n);
    const ev = hive.events(); const speaks = ev.filter((e) => e.type === "speak");
    const out = [];
    const intro = h4El("section", "panel");
    intro.append(h4El("h2", null, "Omega Hive (read-only)"));
    intro.append(h4El("p", "fine", `A replay of the hive's seeded day (seed ${seed}) on this device, to hive minute ${n} (${ohClock(n)} on the hive clock). Every agent is software: its lines are built on the device from its persona and the hive's own events, with no model or network call. Requests that name a robot wait for the learner, who decides in the parishes app; this tab approves nothing, writes nothing and speaks nothing.`));
    const lab = h4El("label", null, "Replay to hive minute ");
    const sel = h4El("select"); sel.id = "h4-steps"; sel.setAttribute("aria-label", "Replay the hive's day to this hive minute");
    for (const s of H4_TAB_STEPS) { const o = h4El("option", null, `${s} (${ohClock(s)})`); o.value = String(s); if (s === n) o.selected = true; sel.append(o); }
    sel.addEventListener("change", () => render(Number(sel.value)));
    lab.append(sel); intro.append(lab);
    const m = hive.metrics();
    intro.append(h4El("p", "fine", `Completed ${m.completed} · refused by the governor ${m.refused} · vetoed ${m.vetoed} · waiting for the learner ${m.awaitingApproval} · exchanges ${m.exchanges} · memory lines ${m.memories} · dispatched steps checked ${m.dispatchedChecked} of ${m.dispatched} · physical dispatches ${m.physicalDispatched}.`));
    out.push(intro);

    const cp = h4El("section", "panel"); cp.append(h4El("h2", null, "Agents"));
    const cards = h4El("div", "h4-cards"); cards.setAttribute("role", "list");
    const jobs = hive.jobs(); const pend = hive.pending();
    for (const a of OH_AGENTS) {
      const card = h4El("div", "h4-card"); card.setAttribute("role", "listitem"); card.dataset.agent = a.id;
      const head = h4El("div", "h4-head");
      let img = null; try { img = aaPortraitImg(a, { size: 64 }); } catch (_) { img = null; }
      if (img) head.append(img);
      const who = h4El("div"); who.append(h4El("b", null, a.name), h4El("span", "h4-chip", "software agent"));
      who.append(h4El("div", "h4-role", `${a.role} Home: ${h4Site(a.homeSite)}.`));
      head.append(who); card.append(head);
      const tr = h4El("div", "h4-traits");
      for (const k of ["warmth", "formality", "verbosity", "caution"]) { const me = h4El("meter"); me.min = 0; me.max = 1; me.value = a.traits[k]; me.setAttribute("aria-label", `${k} ${a.traits[k]}`); tr.append(h4El("span", null, k), me, h4El("span", null, String(a.traits[k]))); }
      card.append(tr);
      const chips = h4El("div"); for (const c of ohTraitChips(a.traits)) chips.append(h4El("span", "h4-chip", c)); card.append(chips);
      card.append(h4El("p", "h4-q", `Voice: ${a.voice.lang}, rate ${a.voice.rate}, pitch ${a.voice.pitch}; prefers ${a.voice.prefer.join(", ")} when the device has them. On-device voices only, off until the learner turns them on; captions always show; nothing listens.`));
      const mine = jobs.filter((j) => j.winner === a.id && ["queued", "moving", "running", "awaiting-approval"].includes(j.status));
      const q = a.key === "consent-keeper" ? pend.map((p) => `${p.jobId} at ${p.siteName}: waiting for the learner (${p.reason})`) : mine.map((j) => `${j.jobId} at ${h4Site(j.site)}: ${j.status}`);
      card.append(h4El("h3", null, `Queue (${q.length})`));
      if (q.length) { const ul = h4El("ul", "h4-q"); for (const line of q) ul.append(h4El("li", null, line)); card.append(ul); } else card.append(h4El("p", "h4-q muted", "Nothing held."));
      const last = speaks.filter((e) => e.agent === a.id).slice(-10);
      card.append(h4El("h3", null, `Last ${last.length} lines`));
      const ol = h4El("ol", "h4-lines");
      for (const e of last) { const li = h4El("li", null, `${ohClock(e.t)} ${e.caption}`); if (e.exchange) li.dataset.x = String(e.exchange.turn); if (e.memory) li.dataset.memory = "true"; ol.append(li); }
      card.append(ol);
      cards.append(card);
    }
    cp.append(cards); out.push(cp);

    const rp = h4El("section", "panel"); rp.append(h4El("h2", null, "The governor's refusals, with reasons"));
    rp.append(h4El("p", "fine", "Every job passes VBRIDGE's safety governor: the e-stop comes first and the physical path is disabled. A steward veto only ever adds a refusal; the learner's decline closes a job."));
    rp.append(h4Table(["Hive clock", "Job", "Site", "By", "Reason", "Why"], ev.filter((e) => e.type === "refused").slice(-40).reverse().map((e) => [ohClock(e.t), e.jobId, e.siteName ?? h4Site(e.to), e.by ?? "", e.veto ?? e.reason, h4Reason(e.veto ?? e.reason)]), "No refusals yet in this replay."));
    out.push(rp);

    const ep = h4El("section", "panel"); ep.append(h4El("h2", null, "Evals (from docs/evals/hive4.json)"));
    if (evals?.rows) { ep.append(h4El("p", "fine", evals.note ?? "")); ep.append(h4Table(["Measure", "Before", "After", "Source"], evals.rows.map((r) => [r.measure, r.before, r.after, r.source]), "No rows.")); }
    else ep.append(h4El("p", "fine", evalsNote));
    out.push(ep);
    root.replaceChildren(...out);
    return n;
  }
  render(at);
  return { render, hive: () => hive, state: () => ({ at, seed, metrics: hive?.metrics() ?? null, evals: !!evals }) };
}
