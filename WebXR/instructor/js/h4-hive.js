// HIVE-4 — the instructor console's "Omega Hive" tab (docs/consoles/HIVE-4.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Read-only and local. The tab replays the hive's seeded day on this device (ohHive with the talk on, `audit: null`, no learner:
// requests that name a robot stay waiting, because only the learner approves them in the parishes app) and shows each agent's
// card (portrait, traits, voice), its queue and last ten lines, the governor's refusals with their reasons, and the evals table
// from the committed JSON (WebXR/instructor/hive4-evals.json, written by tools/check_hive4.mjs). It approves nothing, declines nothing,
// writes nothing (no registry line, no storage), speaks nothing and listens to nothing; every agent is labelled a software agent.
// Built from createElement/textContent only (the console's rule: ids and lines are data, never markup).
//
// HIVE-5: live. When the learner's own hive runs in the parishes page in this browser on this device and the learner has turned
// "Show on the console" on, the tab shows that hive's lines, held jobs, waiting requests, refusals and counts (h5LiveReader: a
// same-origin BroadcastChannel, receive only; nothing uploaded, nothing stored). The seeded replay stays the fallback: it shows when
// no snapshot has arrived, when the learner turns the link off, or when the page has been silent for H5_LIVE_STALE_MS.
//
// HIVE-6: moods and the morning briefing. A panel shows each agent's mood at the replayed minute with its cause (the hive event it
// comes from), the day's mood changes so far, and the morning briefing's lines with their labelled captions, from a second replay
// of the same seeded day with ohHive({ moods, briefing }) on (the first replay above is unchanged). Read-only like the rest.
//
// SEAM: h4MountHiveTab(root, { seed, steps, Channel }) -> { render(steps), hive(), state() }
//   The portrait is AGENT-AVATARS' roster portrait (aaPortraitImg); when AVATARS-HD's new portrait export lands, swap it in here.
//
// Every top-level name starts with `h4`/`H4_` (the bundler shares one scope).

import { OH_AGENTS, OH_REASON_PHRASES, ohTraitChips } from "../../shared/oh-hive-data.js";
import { ohHive, ohClock } from "../../shared/oh-hive.js";
import { VB_REASONS } from "../../shared/vb-shared-data.js";
import { RB_SITES } from "../../shared/rb-robotics-data.js";
import { aaPortraitImg } from "../../shared/aa-agent-portraits.js";
import { h5LiveReader } from "../../shared/h5-hive-live.js";

export const H4_TAB_SEED = 1;
export const H4_TAB_STEPS = Object.freeze([60, 120, 240, 480]);
export const H4_EVALS_URLS = Object.freeze(["../hive4-evals.json", "./hive4-evals.json"]); // the dist page, then the source page
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
/** HIVE-6: a mood's cause in words, from the cause the hive recorded (never more than it says). */
function h4MoodCause(c) {
  if (!c) return "";
  if (c.type === "start") return "the start of the day";
  if (c.type === "refused") return `after the ${c.by === "steward" ? "steward's veto" : c.by === "supervisor" ? "learner's decline" : "governor's refusal"} of ${c.jobId} (${c.reason}) at ${ohClock(c.t)}`;
  if (c.type === "audit") return `after a clean audit at ${ohClock(c.t)} (${c.lines} chain lines intact)`;
  if (c.type === "expired") return `the ${c.mood} mood ran out at ${ohClock(c.t)}`;
  return `holding ${(c.held ?? []).length} job(s) at ${ohClock(c.t)}${(c.held ?? []).length ? `: ${c.held.join(", ")}` : ""}`;
}
/** HIVE-6: the moods and the morning briefing of the seeded day at hive minute n (a replay with moods and the briefing on).
 * HIVE-7: with a live snapshot that carries moods (the learner's own hive, h5LiveSnapshot), the moods and the briefing are the live
 * hive's; without one the replay stays. Receive only: nothing is stored or sent. */
function h4MoodPanel(seed, n, live = null) {
  if (live && Array.isArray(live.moods)) return h4LiveMoodPanel(live);
  const hv = ohHive({ seed, audit: null, exchanges: true, memory: true, variety: true, homeward: true, moods: true, briefing: true });
  const brief = hv.brief() ?? [];
  hv.run(n);
  const ev = hv.events(), changes = ev.filter((e) => e.type === "mood");
  const sec = h4El("section", "panel"); sec.id = "h4-moods"; sec.dataset.live = "false";
  sec.append(h4El("h2", null, "Moods and the morning briefing (read-only)"));
  sec.append(h4El("p", "fine", `A replay of the same seeded day (seed ${seed}) with moods and the briefing on, to hive minute ${n} (${ohClock(n)}). Each mood comes only from the hive's own events: busy while an agent holds two jobs or more, concerned after a refusal or a veto that names it, relieved after a clean audit, calm otherwise. Safety lines carry no mood phrase. Mood changes so far: ${changes.length}.`));
  const rows = hv.agents.map((a) => { const md = hv.mood(a.id); return [a.name, "software agent", md?.mood ?? "calm", h4MoodCause(md?.cause)]; });
  sec.append(h4Table(["Agent", "", "Mood", "Because"], rows, "No agents."));
  sec.append(h4El("h3", null, `Morning briefing (hive minute ${brief[0]?.t ?? 0}, ${brief.length} turns, one at a time)`));
  const ol = h4El("ol", "h4-lines"); ol.id = "h4-briefing";
  for (const e of brief) { const li = h4El("li", null, e.caption); li.dataset.turn = String(e.briefing?.turn ?? ""); ol.append(li); }
  sec.append(ol);
  return { sec, changes: changes.length, brief: brief.length, live: false, rows: rows.map((r) => r[2]) };
}
/** HIVE-7: the live hive's moods and briefing, from the snapshot only. */
function h4LiveMoodPanel(live) {
  const name = (id) => OH_AGENTS.find((a) => a.id === id)?.name ?? id;
  const brief = Array.isArray(live.briefing) ? live.briefing : [];
  const sec = h4El("section", "panel"); sec.id = "h4-moods"; sec.dataset.live = "true";
  sec.append(h4El("h2", null, "Moods and the morning briefing (live, read-only)"));
  sec.append(h4El("p", "fine", `Live: the learner's own hive on this device at hive minute ${live.t} (${ohClock(live.t)}). Each mood comes only from that hive's own events: busy while an agent holds two jobs or more, concerned after a refusal or a veto that names it, relieved after a clean audit, calm otherwise. Safety lines carry no mood phrase. Mood changes so far: ${Number(live.moodChanges) || 0}. Nothing is stored; this tab only reads.`));
  const rows = live.moods.map((x) => [name(x.agent), "software agent", x.mood ?? "calm", h4MoodCause(x.cause)]);
  sec.append(h4Table(["Agent", "", "Mood", "Because"], rows, "No agents."));
  sec.append(h4El("h3", null, brief.length ? `Morning briefing (hive minute ${brief[0].t}, ${brief.length} turns, one at a time)` : "Morning briefing: none in the learner's hive (it runs once, when the learner enters the operations room in the hive's first 30 minutes)"));
  const ol = h4El("ol", "h4-lines"); ol.id = "h4-briefing";
  for (const e of brief) { const li = h4El("li", null, e.caption); li.dataset.turn = String(e.turn ?? ""); ol.append(li); }
  sec.append(ol);
  return { sec, changes: Number(live.moodChanges) || 0, brief: brief.length, live: true, rows: rows.map((r) => r[2]) };
}

export function h4MountHiveTab(root, { seed = H4_TAB_SEED, steps = 120, Channel } = {}) {
  if (!root || typeof document === "undefined") return null;
  if (!document.getElementById("h4-style")) { const s = document.createElement("style"); s.id = "h4-style"; s.textContent = H4_CSS; document.head.appendChild(s); }
  let moodInfo = null; // HIVE-6
  let hive = null, at = steps, evals = null, evalsNote = "Reading WebXR/instructor/hive4-evals.json…", shownLive = false, soon = null;
  const h4Try = (i) => (i >= H4_EVALS_URLS.length ? Promise.reject(new Error("none")) : fetch(H4_EVALS_URLS[i]).then((r) => (r.ok ? r.json() : h4Try(i + 1)), () => h4Try(i + 1)));
  h4Try(0).then((j) => { evals = j; render(at); }).catch(() => { evalsNote = "The evals file (hive4-evals.json) could not be read from this origin."; render(at); });
  // HIVE-5: the learner's own hive on this device, when its page shares it (receive only); a render at most every 300 ms.
  const h4Soon = () => { if (soon == null) soon = setTimeout(() => { soon = null; render(at); }, 300); };
  const reader = h5LiveReader({ ...(Channel !== undefined ? { Channel } : {}), onSnapshot: h4Soon });
  if (typeof setInterval === "function") setInterval(() => { if (shownLive && !reader.live()) render(at); }, 2000); // the page went quiet: back to the replay

  function replay(n) {
    hive = ohHive({ seed, audit: null, exchanges: true, memory: true, variety: true });
    hive.run(n);
    return hive;
  }
  /** What the tab shows: the live snapshot when there is one, else the seeded replay to hive minute n. */
  function h4View(n) {
    const live = reader.snapshot();
    if (live) return { live: true, t: live.t, lines: live.lines, refusals: live.refusals.map((r) => ({ ...r, siteName: r.site })), jobs: live.jobs, pend: live.pending.map((p) => ({ ...p, siteName: p.site })), m: live.metrics ?? {} };
    if (!hive || hive.now() !== n) replay(n);
    const ev = hive.events();
    return {
      live: false, t: n,
      lines: ev.filter((e) => e.type === "speak").map((e) => ({ t: e.t, agent: e.agent, caption: e.caption, x: e.exchange ? e.exchange.turn : null, memory: !!e.memory })),
      refusals: ev.filter((e) => e.type === "refused").map((e) => ({ t: e.t, jobId: e.jobId, siteName: e.siteName ?? h4Site(e.to), by: e.by ?? "", reason: e.veto ?? e.reason })),
      jobs: hive.jobs(), pend: hive.pending(), m: hive.metrics(),
    };
  }

  function render(n = at) {
    at = n;
    const v = h4View(n); shownLive = v.live;
    const out = [];
    const intro = h4El("section", "panel"); intro.dataset.live = String(v.live);
    intro.append(h4El("h2", null, v.live ? "Omega Hive (live, read-only)" : "Omega Hive (read-only)"));
    if (v.live) intro.append(h4El("p", "fine", `Live: the learner's own hive in the parishes page on this device, at hive minute ${v.t} (${ohClock(v.t)} on the hive clock). That page shares it only while the learner keeps "Show on the console" on; nothing is uploaded or stored, and this tab only reads. Every agent is software: its lines are built on the device from its persona and the hive's own events, with no model or network call. Requests that name a robot wait for the learner, who decides in the parishes app; this tab approves nothing, writes nothing and speaks nothing.`));
    else {
      intro.append(h4El("p", "fine", `A replay of the hive's seeded day (seed ${seed}) on this device, to hive minute ${n} (${ohClock(n)} on the hive clock). Every agent is software: its lines are built on the device from its persona and the hive's own events, with no model or network call. Requests that name a robot wait for the learner, who decides in the parishes app; this tab approves nothing, writes nothing and speaks nothing. The learner's own hive shows here live when they turn "Show on the console" on in the parishes page in this browser.`));
      const lab = h4El("label", null, "Replay to hive minute ");
      const sel = h4El("select"); sel.id = "h4-steps"; sel.setAttribute("aria-label", "Replay the hive's day to this hive minute");
      for (const s of H4_TAB_STEPS) { const o = h4El("option", null, `${s} (${ohClock(s)})`); o.value = String(s); if (s === n) o.selected = true; sel.append(o); }
      sel.addEventListener("change", () => render(Number(sel.value)));
      lab.append(sel); intro.append(lab);
    }
    const m = v.m, c = (k) => (Number.isFinite(m?.[k]) ? m[k] : "–");
    intro.append(h4El("p", "fine", `Completed ${c("completed")} · refused by the governor ${c("refused")} · vetoed ${c("vetoed")} · waiting for the learner ${c("awaitingApproval")} · exchanges ${c("exchanges")} · memory lines ${c("memories")} · dispatched steps checked ${c("dispatchedChecked")} of ${c("dispatched")} · physical dispatches ${c("physicalDispatched")}.`));
    out.push(intro);
    try { const mp = h4MoodPanel(seed, v.live ? Math.min(480, Math.max(1, Number(v.t) || 1)) : n, v.live ? reader.snapshot() : null); out.push(mp.sec); moodInfo = { changes: mp.changes, brief: mp.brief, live: mp.live, moods: mp.rows }; } catch (_) { moodInfo = null; } // HIVE-6; HIVE-7: live when the snapshot carries moods

    const cp = h4El("section", "panel"); cp.append(h4El("h2", null, "Agents"));
    const cards = h4El("div", "h4-cards"); cards.setAttribute("role", "list");
    const jobs = v.jobs; const pend = v.pend;
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
      const last = v.lines.filter((e) => e.agent === a.id).slice(-10);
      card.append(h4El("h3", null, `Last ${last.length} lines`));
      const ol = h4El("ol", "h4-lines");
      for (const e of last) { const li = h4El("li", null, `${ohClock(e.t)} ${e.caption}`); if (e.x != null) li.dataset.x = String(e.x); if (e.memory) li.dataset.memory = "true"; ol.append(li); }
      card.append(ol);
      cards.append(card);
    }
    cp.append(cards); out.push(cp);

    const rp = h4El("section", "panel"); rp.append(h4El("h2", null, "The governor's refusals, with reasons"));
    rp.append(h4El("p", "fine", "Every job passes VBRIDGE's safety governor: the e-stop comes first and the physical path is disabled. A steward veto only ever adds a refusal; the learner's decline closes a job."));
    rp.append(h4Table(["Hive clock", "Job", "Site", "By", "Reason", "Why"], v.refusals.slice(-40).reverse().map((e) => [ohClock(e.t), e.jobId, e.siteName, e.by ?? "", e.reason, h4Reason(e.reason)]), v.live ? "No refusals yet in the learner's hive." : "No refusals yet in this replay."));
    out.push(rp);

    const ep = h4El("section", "panel"); ep.append(h4El("h2", null, "Evals (from WebXR/instructor/hive4-evals.json)"));
    if (evals?.rows) { ep.append(h4El("p", "fine", evals.note ?? "")); ep.append(h4Table(["Measure", "Before", "After", "Source"], evals.rows.map((r) => [r.measure, r.before, r.after, r.source]), "No rows.")); }
    else ep.append(h4El("p", "fine", evalsNote));
    out.push(ep);
    root.replaceChildren(...out);
    return n;
  }
  render(at);
  return { render, hive: () => hive, state: () => { const live = reader.snapshot(); return { at, seed, moods: moodInfo, live: !!live, liveT: live?.t ?? null, liveLines: live?.lines?.length ?? 0, snapshots: reader.count(), metrics: live ? live.metrics : hive?.metrics() ?? null, evals: !!evals }; } };
}
