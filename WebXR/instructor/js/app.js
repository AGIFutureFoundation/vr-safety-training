import { createConsole, reduceRoster } from "../../shared/observer.js";

// The instructor console. It owns no simulation and no records: it listens to
// whatever sessions are running in other tabs on this machine, shows where
// each learner is, and can put a line in front of one of them or hold them.
// Everything here is rebuilt from the roster on each event — plain text nodes,
// never innerHTML, because a learner's crew tag is untrusted input.

const $ = (id) => document.getElementById(id);
let roster = new Map();
let selected = null;

const bus = createConsole((ev) => { roster = reduceRoster(roster, ev); render(); });

const fmtTime = (s) => `${Math.floor((s | 0) / 60)}:${String((s | 0) % 60).padStart(2, "0")}`;
const ago = (at) => {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  return s < 2 ? "now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
};
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

function render() {
  const rows = [...roster.values()].sort((a, b) => (a.live === b.live ? b.at - a.at : a.live ? -1 : 1));
  const live = rows.filter((r) => r.live).length;
  $("count").textContent = rows.length === 0
    ? (bus.available ? "No sessions yet." : "This browser has no BroadcastChannel, so the console cannot listen.")
    : `${rows.length} session${rows.length === 1 ? "" : "s"} · ${live} live`;
  const list = $("list");
  list.replaceChildren();
  if (selected && !roster.has(selected)) selected = null;

  for (const r of rows) {
    const card = el("article", `sess${r.live ? "" : " gone"}${r.id === selected ? " sel" : ""}`);
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", String(r.id === selected));
    const pick = () => { selected = r.id === selected ? null : r.id; render(); };
    card.addEventListener("click", pick);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });

    const head = el("header", "sess-head");
    const who = el("div");
    who.append(el("h2", null, r.learner || "Unnamed"),
      el("div", "sess-station", `${r.stationName ?? r.station ?? "—"} · ${r.app ?? "—"}`));
    const badge = el("span", `pill ${r.finished ? (r.passed ? "pass" : "fail") : r.live ? "live" : "idle"}`,
      r.finished ? (r.passed ? "PASSED" : "NOT PASSED") : r.live ? "LIVE" : "LEFT");
    head.append(who, badge);
    card.append(head);

    if (r.stepCount) {
      const bar = el("div", "bar");
      const fill = el("span");
      fill.style.width = `${Math.round(((r.stepIndex ?? 0) / r.stepCount) * 100)}%`;
      bar.append(fill);
      card.append(bar);
      card.append(el("p", "sess-step", `Step ${r.stepIndex ?? 0} of ${r.stepCount}${r.stepTitle ? ` — ${r.stepTitle}` : ""}`));
    }

    // Each label/value pair is wrapped, or a three-column grid would lay the
    // dt and dd of one stat into different columns and mis-pair every label.
    const stats = el("dl", "sess-stats");
    for (const [k, v] of [["Score", r.score ?? 0], ["Stars", "★".repeat(r.stars ?? 0) || "—"],
      ["Corrections", r.errors ?? 0], ["Unsafe", r.hazardHits ?? 0], ["Time", fmtTime(r.seconds)], ["Heard", ago(r.at)]]) {
      const cell = el("div", "stat");
      cell.append(el("dt", null, k), el("dd", (k === "Unsafe" && (r.hazardHits ?? 0) > 0) ? "bad" : null, String(v)));
      stats.append(cell);
    }
    card.append(stats);

    if (r.events?.length) {
      const log = el("ul", "sess-log");
      for (const e of [...r.events].reverse()) {
        const li = el("li", e.kind);
        li.append(el("time", null, new Date(e.at).toLocaleTimeString()), el("span", null, e.text));
        log.append(li);
      }
      card.append(log);
    }
    list.append(card);
  }

  const has = !!selected;
  $("note").disabled = !has;
  $("send").disabled = !has;
  $("hold").disabled = !has;
  $("release").disabled = !has;
  $("target").textContent = has ? (roster.get(selected)?.learner ?? selected) : "no session selected";
}

$("send").addEventListener("click", () => {
  const text = $("note").value.trim();
  if (!selected || !text) return;
  bus.note(selected, text);
  $("note").value = "";
  $("sent").textContent = `Sent to ${roster.get(selected)?.learner ?? selected}.`;
  setTimeout(() => { $("sent").textContent = ""; }, 4000);
});
$("note").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("send").click(); } });
$("hold").addEventListener("click", () => { if (selected) { bus.freeze(selected, true); $("sent").textContent = "Held."; setTimeout(() => { $("sent").textContent = ""; }, 4000); } });
$("release").addEventListener("click", () => { if (selected) { bus.freeze(selected, false); $("sent").textContent = "Released."; setTimeout(() => { $("sent").textContent = ""; }, 4000); } });
$("roll").addEventListener("click", () => bus.roll());

bus.roll();
setInterval(() => bus.roll(), 15000);
setInterval(render, 1000);
render();
