import { createConsole, reduceRoster, COMMAND_LABELS, relayFromSearch } from "../../shared/observer.js";
import { validateFlow, flowFromJSON } from "../../shared/flowhub.js";
import { DEVICES, PROFILES } from "../../shared/devices.js";
import { buildRoster, matchStation, matchProgramme } from "./roster.js";

// The instructor console. It owns no simulation and no records: it listens to
// the sessions it can hear — other tabs on this machine over a
// BroadcastChannel, plus anything on the relay when ?relay= is given — shows
// where each learner is, and sends the commands the learner apps answer.
//
// Three views: the live class, the whole catalog (categories → programmes →
// stations, read from the generated catalog.json and nothing else), and the
// session log of both directions, exportable as CSV.
//
// Everything is rebuilt from the roster on each event, as plain text nodes: no
// markup is ever set from a string here, because a learner's crew tag, a
// station's tagline and an instructor's own note are all untrusted input by the
// time they reach this page. tools/check_console.mjs enforces that.

const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };

const WEATHER_FALLBACK = ["clear", "overcast", "rain", "fog", "wind", "storm", "smoke"];
const MAX_LOG = 2000;

let roster = new Map();
let selected = null;
let view = "live";
let catalog = null;          // the folded roster tree, once catalog.json lands
let rawCatalog = null;       // the same catalog unfolded, for validating a flow
let logRows = [];            // newest last; rendered newest first
let query = "";
// A running session posts a position snapshot twice a second. Those are what
// the roster is built from, and they bury the commands and the verdicts in the
// log, so the table folds them away until they are asked for.
let showHeartbeats = false;

const bus = createConsole(
  (ev) => { roster = reduceRoster(roster, ev); logEvent(ev); render(); },
  { onSend: (msg) => { logSent(msg); render(); } },
);

const fmtTime = (s) => `${Math.floor((s | 0) / 60)}:${String((s | 0) % 60).padStart(2, "0")}`;
const ago = (at) => {
  const s = Math.max(0, Math.round((Date.now() - at) / 1000));
  return s < 2 ? "now" : s < 60 ? `${s}s ago` : `${Math.round(s / 60)}m ago`;
};
const learnerName = (id) => roster.get(id)?.learner ?? id ?? "—";
const liveRows = () => [...roster.values()].filter((r) => r.live);

// ---------------------------------------------------------------- session log

function pushLog(entry) {
  logRows.push(entry);
  if (logRows.length > MAX_LOG) logRows.splice(0, logRows.length - MAX_LOG);
}

function logSent(msg) {
  pushLog({
    at: msg.at ?? Date.now(), dir: "sent", kind: msg.kind,
    learner: msg.to ? learnerName(msg.to) : "all sessions",
    station: msg.to ? (roster.get(msg.to)?.station ?? "") : "",
    detail: [msg.detail, msg.text, msg.on === undefined ? "" : msg.on ? "on" : "off"].filter(Boolean).join(" · "),
  });
}

function logEvent(ev) {
  const detail = ev.kind === "state"
    ? `step ${ev.stepIndex ?? "?"}/${ev.stepCount ?? "?"} · score ${ev.score ?? 0}`
    : ev.kind === "step" ? `${ev.stepId ?? ""} ${ev.stepTitle ?? ""}`.trim()
      : ev.kind === "hazard" ? `${ev.hazardId ?? ""} ${ev.note ?? ""}`.trim()
        : ev.kind === "action" ? `${ev.cmd ?? ""} ${ev.detail ?? ""} — ${ev.ok ? "done" : "refused"}: ${ev.note ?? ""}`
          : ev.kind === "finish" ? `${ev.passed ? "passed" : "not passed"} · ${ev.stars ?? 0}★ · ${ev.verdict ?? ""}`
            : ev.kind === "hello" ? `${ev.stepCount ?? 0} steps · ${(ev.interrupts ?? []).length} interruptions` : "";
  pushLog({
    at: ev.at ?? Date.now(), dir: "recv", kind: ev.kind,
    learner: ev.learner || "Unnamed", station: ev.stationName ?? ev.station ?? "",
    detail,
  });
}

const shownRows = () => (showHeartbeats ? logRows : logRows.filter((r) => r.kind !== "state"));

function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv() {
  const head = ["at", "direction", "kind", "learner", "station", "detail"];
  const lines = [head.join(",")];
  for (const r of shownRows()) {
    lines.push([new Date(r.at).toISOString(), r.dir, r.kind, r.learner, r.station, r.detail].map(csvCell).join(","));
  }
  const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `instructor-session-log-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.csv`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

// ------------------------------------------------------------------ the class

function toast(text) {
  $("sent").textContent = text;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { $("sent").textContent = ""; }, 4000);
}

function renderClass() {
  const rows = [...roster.values()].sort((a, b) => (a.live === b.live ? b.at - a.at : a.live ? -1 : 1));
  const live = rows.filter((r) => r.live).length;
  $("count").textContent = rows.length === 0
    ? (bus.available ? "No sessions yet." : "This browser has no BroadcastChannel and no relay, so the console cannot listen.")
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
    const pills = el("div", "row");
    if (r.hazardMode === "coach") pills.append(el("span", "pill coach", "COACHING"));
    pills.append(el("span", `pill ${r.finished ? (r.passed ? "pass" : "fail") : r.live ? "live" : "idle"}`,
      r.finished ? (r.passed ? "PASSED" : "NOT PASSED") : r.live ? "LIVE" : "LEFT"));
    head.append(who, pills);
    card.append(head);

    if (r.stepCount) {
      const bar = el("div", "bar");
      const fill = el("span");
      fill.style.width = `${Math.round(((r.stepIndex ?? 0) / r.stepCount) * 100)}%`;
      bar.append(fill);
      card.append(bar);
      card.append(el("p", "sess-step", `Step ${r.stepIndex ?? 0} of ${r.stepCount}${r.stepTitle ? ` — ${r.stepTitle}` : ""}`));
    }

    // Each label/value pair is wrapped, or the grid would lay the dt and dd of
    // one stat into different columns and mis-pair every label.
    const stats = el("dl", "sess-stats");
    const answered = `${r.answered ?? 0}/${r.interruptTotal ?? (r.interrupts?.length ?? 0)}`;
    for (const [k, v] of [["Score", r.score ?? 0], ["Stars", "★".repeat(r.stars ?? 0) || "—"],
      ["Corrections", r.errors ?? 0], ["Unsafe", r.hazardHits ?? 0],
      ["Interrupts", answered], ["Commands", r.actions ?? 0],
      ["Time", fmtTime(r.seconds)], ["Heard", ago(r.at)]]) {
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
  $("hold").disabled = !has;
  $("release").disabled = !has;
  $("target").textContent = has ? learnerName(selected) : "no session selected";
  $("transport").textContent = bus.relay
    ? `Relay: ${bus.relay} — sessions on other machines are included.`
    : "Same machine only (BroadcastChannel). Add ?relay=<ws url> on both pages to cross the network.";
  renderPanel(has ? roster.get(selected) : null);
}

/** The per-learner panel: this station's own steps and interruptions, and the
 *  controls that change what the learner meets next. */
function renderPanel(row) {
  const panel = $("panel");
  panel.hidden = !row;
  if (!row) return;
  $("panel-who").textContent = row.learner || "Unnamed";
  $("panel-where").textContent = `${row.stationName ?? row.station ?? "no station"} · ${row.app ?? "—"} · step ${row.stepIndex ?? 0} of ${row.stepCount ?? 0}`
    + (row.weather ? ` · next station in ${row.weather}` : "")
    + (row.profile ? ` · next station on ${row.profile}` : "")
    + (row.assigned ? ` · assigned ${row.assigned}` : "")
    + (row.flow ? ` · flow ${row.flow}` : "")
    + (row.flowNode ? ` · ${row.flowNode}` : "");

  const steps = $("panel-steps");
  steps.replaceChildren();
  const list = row.steplist ?? [];
  if (!list.length) steps.append(el("li", null, "No station open — this learner is at the hub."));
  const here = (row.stepIndex ?? 0) - 1;
  list.forEach((st, i) => {
    const li = el("li", i === here ? "now" : i < here ? "done" : null);
    li.append(el("span", "num", String(i + 1)));
    const body = el("div");
    body.append(el("b", null, st.title ?? st.id ?? ""), el("span", null, ` ${st.kind ?? ""}`));
    li.append(body);
    steps.append(li);
  });

  const ints = $("panel-ints");
  ints.replaceChildren();
  const declared = row.interrupts ?? [];
  if (!declared.length) ints.append(el("p", "muted", "This station declares no interruptions, or none has been reported yet."));
  for (const it of declared) {
    const fired = (row.fired ?? []).includes(it.id);
    const box = el("div", "int");
    box.append(el("p", "int-kind", `${it.kind ?? "Interruption"} · ${it.id}`));
    box.append(el("p", null, it.alert ?? ""));
    if (it.after) box.append(el("p", null, `Armed on step ${it.after}`));
    const btn = el("button", "small", fired ? "Already fired" : "Fire now");
    btn.disabled = fired || !row.live;
    btn.addEventListener("click", () => {
      bus.interrupt(row.id, it.id);
      toast(`Fired ${it.id} on ${row.learner}.`);
    });
    box.append(btn);
    ints.append(box);
  }

  $("hazard-mode-now").textContent = row.hazardMode === "coach" ? "coaching — hazards warn once" : "assessed — hazards count";
  $("coach").classList.toggle("on", row.hazardMode === "coach");
  $("assess").classList.toggle("on", row.hazardMode !== "coach");
}

// -------------------------------------------------------------- catalog views

function fillPickers() {
  const weather = $("weather");
  if (!weather.options.length) {
    for (const kind of (catalog?.weatherKinds?.length ? catalog.weatherKinds : WEATHER_FALLBACK)) {
      const opt = el("option", null, kind);
      opt.value = kind;
      weather.append(opt);
    }
  }
  const profile = $("profile");
  if (!profile.options.length) {
    const byProfile = el("optgroup");
    byProfile.label = "Run profile";
    for (const [id, p] of Object.entries(PROFILES)) {
      const opt = el("option", null, `${p.label} (${id})`);
      opt.value = id;
      byProfile.append(opt);
    }
    const byDevice = el("optgroup");
    byDevice.label = "Device";
    for (const [id, d] of Object.entries(DEVICES)) {
      const opt = el("option", null, `${d.brand} ${d.product} — ${d.profile}`);
      opt.value = id;
      byDevice.append(opt);
    }
    profile.append(byProfile, byDevice);
  }
  const programme = $("programme");
  if (!programme.options.length && catalog?.programmes?.length) {
    for (const p of catalog.programmes) {
      const opt = el("option", null, p.name);
      opt.value = p.id;
      programme.append(opt);
    }
  }
}

/** Send one station (or programme) to the selected learner, or to everyone. */
function sendOpen(id, { all = false } = {}) {
  const targets = all ? liveRows().map((r) => r.id) : selected ? [selected] : [];
  if (!targets.length) { toast(all ? "No live sessions to send." : "Select a learner on the Live class view first."); return; }
  for (const to of targets) bus.open(to, id);
  toast(`Sent ${id} to ${targets.length} session${targets.length === 1 ? "" : "s"}.`);
}

function renderRoster() {
  const count = $("roster-count");
  if (!catalog) { count.textContent = "Loading the catalog…"; return; }
  const stations = catalog.stations.filter((s) => matchStation(s, query));
  const programmes = catalog.programmes.filter((p) => matchProgramme(p, query));
  count.textContent = `${stations.length} of ${catalog.total} stations · ${programmes.length} of ${catalog.programmes.length} programmes`
    + (query ? ` matching “${query}”` : "") + ` · ${liveRows().length} live session(s)`;

  const progWrap = $("roster-programmes");
  progWrap.replaceChildren();
  for (const p of programmes) {
    const box = el("details", "prog");
    box.open = !!query;
    const sum = el("summary", null, `${p.name} — ${p.stations.length} stations`);
    box.append(sum);
    box.append(el("p", "fine", p.union || ""));
    box.append(el("p", "fine", p.summary || ""));
    const ol = el("ol");
    for (const s of p.stations) {
      const li = el("li");
      li.append(el("b", null, s.id), el("span", null, s.app === "trades" ? " (Trade Skills)" : ""), el("span", null, s.why ? ` — ${s.why}` : ""));
      ol.append(li);
    }
    box.append(ol);
    const row = el("div", "row");
    const one = el("button", "small", "Send selected");
    one.addEventListener("click", () => sendOpen(p.id));
    const allBtn = el("button", "small", "Send all live learners here");
    allBtn.addEventListener("click", () => sendOpen(p.id, { all: true }));
    const assign = el("button", "small", "Assign to selected");
    assign.addEventListener("click", () => {
      if (!selected) { toast("Select a learner on the Live class view first."); return; }
      bus.assign(selected, p.id);
      toast(`Assigned ${p.id} to ${learnerName(selected)}.`);
    });
    row.append(one, allBtn, assign);
    box.append(row);
    progWrap.append(box);
  }

  const tree = $("roster-tree");
  tree.replaceChildren();
  for (const cat of catalog.categories) {
    const rows = cat.stations.filter((s) => matchStation(s, query));
    if (!rows.length) continue;
    const box = el("details", "cat");
    box.open = !!query;
    box.append(el("summary", null, `${cat.name} — ${rows.length} station${rows.length === 1 ? "" : "s"}`));
    const ul = el("ul", "stations");
    for (const s of rows) {
      const li = el("li", "stn");
      const left = el("div");
      left.append(el("p", "stn-id", `${s.id}${s.app === "trades" ? " · Trade Skills" : ""}`));
      left.append(el("h4", null, s.name));
      left.append(el("p", "stn-meta", [s.trade, s.certification].filter(Boolean).join(" · ")));
      left.append(el("p", "stn-meta", `${s.steps} steps · ${s.interrupts} interruptions · ${s.weather} · par ${fmtTime(s.parSeconds)}`));
      const actions = el("div", "row");
      const one = el("button", "small", "Send selected");
      one.addEventListener("click", () => sendOpen(s.id));
      const allBtn = el("button", "small", "Send all live");
      allBtn.addEventListener("click", () => sendOpen(s.id, { all: true }));
      actions.append(one, allBtn);
      li.append(left, actions);
      ul.append(li);
    }
    box.append(ul);
    tree.append(box);
  }
}

function renderLog() {
  const rows = shownRows();
  const hidden = logRows.length - rows.length;
  $("log-count").textContent = `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`
    + (hidden ? ` · ${hidden} position snapshot${hidden === 1 ? "" : "s"} folded away` : "");
  const body = $("log-rows");
  body.replaceChildren();
  for (const r of [...rows].reverse()) {
    const tr = el("tr");
    tr.append(el("td", null, new Date(r.at).toLocaleTimeString()));
    tr.append(el("td", `dir-${r.dir}`, r.dir === "sent" ? "→ sent" : "← event"));
    tr.append(el("td", null, r.dir === "sent" ? (COMMAND_LABELS[r.kind] ?? r.kind) : r.kind));
    tr.append(el("td", null, r.learner));
    tr.append(el("td", null, r.station));
    tr.append(el("td", null, r.detail));
    body.append(tr);
  }
}


// ----------------------------------------------------------------- flows
//
// A flow is a node graph, not a name in a roster, so this is the one control
// that sends a payload: the console reads one of the examples in WebXR/flows/
// (a static page cannot list a directory, so flows/index.json is the index) or
// takes one pasted in, checks it against the catalog with the very same
// validator the learner app uses, and sends it with CMD_FLOW. The app validates
// it again on arrival and answers with an action event either way — this console
// is not trusted, and does not need to be.
let flowIndex = [];          // { id, file, title, shape } from flows/index.json
let flowLoaded = null;       // the flow this console currently holds

function flowStatus(text, kind = "") {
  const node = $("flow-state");
  node.textContent = text;
  node.className = `fine${kind ? ` ${kind}` : ""}`;
}

function flowCatalogForCheck() {
  // buildRoster keeps the raw catalog's own arrays; validateFlow wants those.
  return rawCatalog ?? null;
}

function setFlow(flow, where) {
  const verdict = validateFlow(flow, flowCatalogForCheck());
  if (!verdict.ok) {
    flowLoaded = null;
    flowStatus(`${where} is not a flow this network can run: ${verdict.errors[0]}`, "bad");
    return false;
  }
  flowLoaded = flow;
  const extra = verdict.warnings.length ? ` (${verdict.warnings[0]})` : "";
  flowStatus(`Holding ${flow.title} — ${verdict.nodes} nodes, ${verdict.edges} edges, starts at ${flow.start}.${extra}`, "good");
  return true;
}

function loadFlowFromPicker() {
  const file = $("flow-pick").value;
  if (!file) { flowStatus("No example flow is available from this origin.", "bad"); return; }
  fetch(`../flows/${file}`)
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`${file}: ${r.status}`))))
    .then((text) => {
      const parsed = flowFromJSON(text);
      if (parsed.error) { flowStatus(`${file}: ${parsed.error}`, "bad"); return; }
      $("flow-json").value = text;
      setFlow(parsed.flow, file);
    })
    .catch((e) => flowStatus(`Could not read ${file}: ${e.message}`, "bad"));
}

function flowFromBox() {
  const text = $("flow-json").value.trim();
  if (!text) { flowStatus("Paste a flow definition, or pick one of the examples.", "bad"); return null; }
  const parsed = flowFromJSON(text);
  if (parsed.error) { flowStatus(`The pasted flow ${parsed.error}`, "bad"); return null; }
  return setFlow(parsed.flow, "the pasted flow") ? flowLoaded : null;
}

/** Send the held flow to the selected learner, or to every live session. */
function sendFlow({ all = false } = {}) {
  const flow = flowLoaded ?? flowFromBox();
  if (!flow) return;
  const targets = all ? liveRows().map((r) => r.id) : selected ? [selected] : [];
  if (!targets.length) { toast(all ? "No live sessions to send to." : "Select a learner on the Live class view first."); return; }
  let sent = 0;
  for (const to of targets) if (bus.flow(to, flow, flow.id)) sent += 1;
  toast(sent
    ? `Sent flow ${flow.id} to ${sent} session${sent === 1 ? "" : "s"}.`
    : "The flow was too large for the channel and was not sent.");
}

$("flow-load").addEventListener("click", loadFlowFromPicker);
$("flow-json").addEventListener("input", () => { flowLoaded = null; flowStatus("Pasted flow not checked yet — Send checks it first.", ""); });
$("flow-send").addEventListener("click", () => sendFlow());
$("flow-send-all").addEventListener("click", () => sendFlow({ all: true }));

fetch("../flows/index.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`flows/index.json: ${r.status}`))))
  .then((json) => {
    flowIndex = Array.isArray(json?.flows) ? json.flows : [];
    const pick = $("flow-pick");
    pick.replaceChildren();
    for (const row of flowIndex) {
      const opt = el("option", null, `${row.title} — ${row.shape ?? row.id}`);
      opt.value = row.file;
      pick.append(opt);
    }
    if (!flowIndex.length) flowStatus("No example flows are published at this origin. Paste one instead.", "");
  })
  .catch(() => flowStatus("The example flows could not be read from this origin. Paste a flow definition instead.", ""));

// ---------------------------------------------------------------------- views

function render() {
  for (const [name, tab, panel] of [["live", "tab-live", "view-live"], ["roster", "tab-roster", "view-roster"], ["log", "tab-log", "view-log"]]) {
    $(tab).setAttribute("aria-selected", String(view === name));
    $(panel).hidden = view !== name;
  }
  renderClass();
  if (view === "roster") renderRoster();
  if (view === "log") renderLog();
}

function setView(next) { view = next; render(); }

$("tab-live").addEventListener("click", () => setView("live"));
$("tab-roster").addEventListener("click", () => setView("roster"));
$("tab-log").addEventListener("click", () => setView("log"));

$("send").addEventListener("click", () => {
  const text = $("note").value.trim();
  if (!selected || !text) return;
  bus.note(selected, text);
  $("note").value = "";
  toast(`Sent to ${learnerName(selected)}.`);
});
$("note").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("send").click(); } });
$("hold").addEventListener("click", () => { if (selected) { bus.freeze(selected, true); toast("Held."); } });
$("release").addEventListener("click", () => { if (selected) { bus.freeze(selected, false); toast("Released."); } });
$("roll").addEventListener("click", () => bus.roll());
$("weather-send").addEventListener("click", () => {
  if (!selected) return;
  const kind = $("weather").value;
  bus.weather(selected, kind);
  toast(`Next station for ${learnerName(selected)}: ${kind}.`);
});
$("profile-send").addEventListener("click", () => {
  if (!selected) return;
  const id = $("profile").value;
  bus.profile(selected, id);
  toast(`Next station for ${learnerName(selected)}: ${id} profile.`);
});
$("coach").addEventListener("click", () => { if (selected) { bus.hazardMode(selected, "coach"); toast("Coaching mode."); } });
$("assess").addEventListener("click", () => { if (selected) { bus.hazardMode(selected, "assess"); toast("Assessed mode."); } });
$("assign").addEventListener("click", () => {
  if (!selected) return;
  const id = $("programme").value;
  if (!id) return;
  bus.assign(selected, id);
  toast(`Assigned ${id}.`);
});
$("open-programme").addEventListener("click", () => {
  const id = $("programme").value;
  if (id) sendOpen(id);
});
$("roster-search").addEventListener("input", (e) => { query = e.target.value; renderRoster(); });
$("roster-clear").addEventListener("click", () => { query = ""; $("roster-search").value = ""; renderRoster(); });
$("log-state").addEventListener("change", (e) => { showHeartbeats = !!e.target.checked; renderLog(); });
$("log-csv").addEventListener("click", exportCsv);
$("log-clear").addEventListener("click", () => { logRows = []; render(); });

// The catalog is data, not code: the same generated roster a hosting platform
// indexes. A console that cannot fetch it still runs the live class — it just
// cannot offer the catalog view.
fetch("../smartcity/catalog.json")
  .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`catalog.json: ${r.status}`))))
  .then((json) => { rawCatalog = json; catalog = buildRoster(json); fillPickers(); render(); })
  .catch(() => { $("roster-count").textContent = "The catalog could not be loaded from this origin, so the roster view is empty. The live class view is unaffected."; fillPickers(); });

if (relayFromSearch() && !bus.relay) toast("The relay URL was rejected — it must start with ws:// or wss://.");

fillPickers();
bus.roll();
setInterval(() => bus.roll(), 15000);
setInterval(render, 1000);
render();
