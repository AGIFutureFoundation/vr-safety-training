// STRANDS-3 (docs/strands-robots.md): the learner's OWN consented robot takes in the LeRobot-style JSONL layout, built on
// this device. SmartCiti.X Holodeck · Powered by AGI Corp.
//
// What it does, plainly:
//   * It reads the takes through ARENA-2's raTakesExport (shared/ra-takes.js), which returns nothing unless DATAWORKS'
//     dxCollecting() holds right now (signed in, not the demo, not K-12 or a classroom, opted in as an adult) and which
//     refuses a take without an adult consent receipt. Signed out, demo, K-12 or not opted in: 0 takes, and it says why.
//   * It writes the same layout robotics/strands/lerobot_jsonl.py writes for the synthetic set (meta/info.json, tasks.jsonl,
//     episodes.jsonl, actions.jsonl, data/chunk-000/episode_*.jsonl; JSON Lines in place of Parquet, not readable by
//     LeRobot's loader as is), field for field, so the learner's human lines carry their consent receipt on every frame.
//   * Nothing is sent anywhere, and the page keeps no copy: a browser cannot save a folder, so the layout is offered as one
//     JSON file ({ files: { path: text } }) the learner saves themselves. Revoking consent (dxRevoke) deletes the stored
//     takes, so the next export has 0; a file already saved is the learner's own to delete.
// Browser-safe (no node: imports). Every top-level name starts with `st3`/`ST3_`; imports are plain (no alias).

import { dxStore } from "./dx-data.js";
import { raTakesExport, RA_TAKES_SCHEMA } from "./ra-takes.js";
import { RB_SCENARIOS } from "./rb-robotics-data.js";

export const ST3_LEROBOT_VERSION = "st-lerobot-jsonl/1";
/** The frame fields, as robotics/strands/lerobot_jsonl.py FRAME_FIELDS. */
export const ST3_FRAME_FIELDS = ["index", "episode_index", "frame_index", "timestamp", "task_index", "observation.state", "observation.robots_active",
  "action", "action.label", "action.index", "next.reward", "next.done", "rules.unsafe", "rules.outcome", "station.step", "source", "consent", "split"];

/** The discrete label for an action (lerobot_jsonl.py _label). */
export function st3ActionLabel(action) {
  const t = String(action?.type ?? "wait");
  if (t === "route") return "route:" + (action.moves ?? []).map(String).join(",");
  if (t === "set" && "param" in action) return `set-${action.param}`;
  if (t === "test" && "what" in action) return `test-${action.what}`;
  if (t === "move" && "dir" in action) return `move-${action.dir}`;
  return t;
}

const st3Dt = (sc) => { const s = RB_SCENARIOS.find((x) => x.id === sc); return typeof s?.dt === "number" ? s.dt : null; };
const st3R6 = (n) => Math.round(n * 1e6) / 1e6;

/**
 * Lay out arena-schema lines (one per step, as ra-takes.js writes them) in the LeRobot-style layout. Pure: returns
 * { files: { path: text }, episodes, frames, tasks }. Exported for the check.
 */
export function st3LerobotLayout(lines, { createdAt = new Date().toISOString() } = {}) {
  const episodes = new Map();
  for (const line of lines) {
    const d = typeof line === "string" ? JSON.parse(line) : line;
    if (d.schema !== RA_TAKES_SCHEMA) throw new Error(`line with schema ${d.schema}`);
    if (!episodes.has(d.episode)) episodes.set(d.episode, { id: d.episode, scenario: d.scenario, split: d.split, source: d.source, consent: d.consent, station: d.station ?? null, instruction: d.instruction, frames: [] });
    episodes.get(d.episode).frames.push(d);
  }
  const order = [...episodes.values()].sort((a, b) => ["train", "validation", "test"].indexOf(a.split) - ["train", "validation", "test"].indexOf(b.split) || a.scenario.localeCompare(b.scenario) || a.id.localeCompare(b.id));
  const tasks = new Map(), actions = new Map(), perScenario = new Map(), files = {}, epRows = [], splits = { train: [], validation: [], test: [] };
  let gidx = 0;
  order.forEach((ep, ei) => {
    const sc = ep.scenario, dt = st3Dt(sc);
    if (!tasks.has(ep.instruction)) tasks.set(ep.instruction, tasks.size);
    const fr = [...ep.frames].sort((a, b) => a.t - b.t), out = [];
    for (const d of fr) {
      const obs = d.observation;
      let state, active = null;
      if (obs && "robots" in obs) {
        const width = Math.max(0, ...obs.robots.filter(Boolean).map((r) => r.length));
        state = obs.robots.flatMap((r) => (r ? r : new Array(width).fill(0)));
        active = obs.robots.map((r) => r !== null);
      } else state = [...(obs?.f ?? [])];
      const label = st3ActionLabel(d.action), key = `${sc}\u0000${label}`;
      if (!actions.has(key)) { actions.set(key, perScenario.get(sc) ?? 0); perScenario.set(sc, (perScenario.get(sc) ?? 0) + 1); }
      out.push(JSON.stringify({
        index: gidx, episode_index: ei, frame_index: d.t, timestamp: dt !== null ? st3R6(d.t * dt) : d.t, task_index: tasks.get(ep.instruction),
        "observation.state": state, "observation.robots_active": active, action: d.action, "action.label": label, "action.index": actions.get(key),
        "next.reward": d.reward, "next.done": d.done, "rules.unsafe": d.rules.unsafe, "rules.outcome": d.rules.outcome, "station.step": d.step ?? null,
        source: d.source, consent: d.consent, split: d.split,
      }));
      gidx += 1;
    }
    files[`data/chunk-000/episode_${String(ei).padStart(6, "0")}.jsonl`] = out.join("\n") + "\n";
    epRows.push({ episode_index: ei, episode_id: ep.id, scenario: sc, split: ep.split, source: ep.source, consent: ep.consent, length: fr.length, tasks: [ep.instruction] });
    splits[ep.split]?.push(ei);
  });
  files["meta/episodes.jsonl"] = epRows.map((r) => JSON.stringify(r)).join("\n") + (epRows.length ? "\n" : "");
  files["meta/tasks.jsonl"] = [...tasks.entries()].sort((a, b) => a[1] - b[1]).map(([key, ti]) => JSON.stringify({ task_index: ti, task: key, scenario: key })).join("\n") + (tasks.size ? "\n" : "");
  files["meta/actions.jsonl"] = [...actions.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, ai]) => { const [scenario, label] = key.split("\u0000"); return JSON.stringify({ scenario, action_index: ai, label }); }).join("\n") + (actions.size ? "\n" : "");
  const human = epRows.filter((r) => r.source === "human").length;
  files["meta/info.json"] = JSON.stringify({
    codebase_version: ST3_LEROBOT_VERSION, format: "LeRobot-style layout in JSON Lines (no Parquet; not readable by LeRobot's loader as is)",
    source: { schema: RA_TAKES_SCHEMA, generator: "shared/st3-lerobot-takes.js (the learner's own consented takes, built on their device)", set: "my-takes", createdAt },
    total_episodes: epRows.length, total_frames: gidx, total_tasks: tasks.size, chunks_size: Math.max(1, epRows.length), fps: null,
    time: { stations: "timestamp = frame_index x the scenario's dt (0.05 s)", gym: "turn-based: timestamp = frame_index (one step)" },
    splits: Object.fromEntries(Object.entries(splits).map(([k, v]) => [k, v.length ? `${v[0]}:${v[v.length - 1] + 1}` : ""])),
    data_path: "data/chunk-{episode_chunk:03d}/episode_{episode_index:06d}.jsonl",
    features: { "observation.state": { dtype: "float", note: "the scenario's named scene features (AMR: per robot, delivered robots zero-filled)" }, action: { dtype: "json", note: "the env action as taken" }, "observation.images": "none (the simulator has no cameras)" },
    provenance: `${human} human episode${human === 1 ? "" : "s"}, each with its adult consent receipt (consent id, licence, adult) on every frame; built and saved on the learner's own device; nothing uploaded; revoking consent deletes the stored takes`,
  }, null, 1) + "\n";
  return { files, episodes: epRows.length, frames: gidx, tasks: tasks.size };
}

/**
 * Export the learner's own consented takes in the LeRobot-style layout. Returns { ok, reason, takes, refused, provenance,
 * frames, files, bundle }: ok false with a reason (0 takes, no files) unless collecting. `signals` is for tests.
 */
export async function st3LerobotTakesExport({ store = dxStore, signals = null } = {}) {
  const r = await raTakesExport({ store, signals });
  if (!r.ok || !r.lines) return { ...r, frames: 0, files: {}, bundle: "" };
  const lay = st3LerobotLayout(r.jsonl.trim().split("\n"));
  const bundle = JSON.stringify({ format: "LeRobot-style JSONL layout as one file (a browser cannot save a folder): unpack `files` by path", version: ST3_LEROBOT_VERSION, files: lay.files }, null, 0);
  return { ...r, frames: lay.frames, files: lay.files, bundle };
}

/** The page control: a button, a status line. The download is a local file the learner saves; nothing is uploaded. */
export function st3LerobotTakesMount(doc = globalThis.document, { store = null, signals = null } = {}) {
  const box = doc.createElement("section");
  box.className = "st3-lerobot-takes"; box.setAttribute("aria-labelledby", "st3-lerobot-h");
  box.innerHTML = `<h3 id="st3-lerobot-h">My robot takes in the LeRobot-style layout</h3>
<p>The same takes as above, laid out as robotics/strands/lerobot_jsonl.py lays out the synthetic set (JSON Lines, one file holding the layout). Only your own takes, only while you have opted in as an adult; every frame carries your consent receipt. Saved on this device; nothing is sent. Revoking consent deletes the stored takes, and a file you saved is yours to delete.</p>
<button type="button" class="st3-lerobot-go" style="min-height:44px;min-width:44px;padding:8px 14px">Export my takes in the LeRobot-style layout</button>
<p class="st3-lerobot-status" role="status" aria-live="polite"></p>`;
  const status = box.querySelector(".st3-lerobot-status");
  box.querySelector(".st3-lerobot-go").addEventListener("click", async () => {
    const r = await st3LerobotTakesExport({ store: store ?? dxStore, signals });
    status.textContent = r.ok ? `${r.takes} take${r.takes === 1 ? "" : "s"}, ${r.frames} frames in ${Object.keys(r.files).length} files${r.refused.length ? `, ${r.refused.length} refused` : ""}. ${r.takes ? "Saved as a file on this device." : r.reason}` : r.reason;
    box.dataset.st3Takes = String(r.takes);
    if (r.bundle && typeof Blob !== "undefined" && globalThis.URL?.createObjectURL) {
      const a = doc.createElement("a");
      a.href = URL.createObjectURL(new Blob([r.bundle], { type: "application/json" }));
      a.download = "my-robot-takes.lerobot-jsonl.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });
  return box;
}
