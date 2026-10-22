/**
 * The two extra layouts tools/export_dataset.mjs writes beside its own
 * shards, from the same episode objects:
 *
 *   <out>/lerobot/   a LeRobot-style episode layout, values as JSON Lines —
 *                    meta/info.json, meta/episodes.jsonl, meta/tasks.jsonl and
 *                    data/chunk-NNN/episode_NNNNNN.jsonl (one frame per line:
 *                    observation / action / reward / done). No parquet, no
 *                    video, no dependency.
 *   <out>/rlds/      an RLDS-style step list — episodes.jsonl, one episode per
 *                    line: { episode_metadata, steps: [{ observation, action,
 *                    reward, discount, is_first, is_last, is_terminal,
 *                    language_instruction }] } — and features.json.
 *
 * "Style" is meant literally: the field names and the directory shape follow
 * those conventions so a converter is short, but neither is the byte format
 * of any framework's own loader, and nothing here claims it is.
 *
 * Every episode carries the same labels in both layouts (LABEL_FIELDS): the
 * station, its programmes and union, its hazard and interruption labels, the
 * passport's source app, a licence and a consent field, and only ever the
 * anonymised (salted, hashed) crew tag.
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { skStation, skPrimitiveForKind } from "../../WebXR/shared/skill-registry.js";

export const LEROBOT_DIR = "lerobot";
export const RLDS_DIR = "rlds";
export const LEROBOT_CHUNK = 1000;
export const LEROBOT_FPS = 20; // the headless engine ticks at dt = 0.05 s
export const LABEL_FIELDS = [
  "station", "app", "programmes", "union", "hazards", "hazardsHit", "interruptions", "interruptionsSeen",
  "sourceApp", "licence", "consent", "crewTagHash", "source",
];
export const LEROBOT_FRAME_FIELDS = ["index", "episode_index", "frame_index", "timestamp", "task_index", "observation", "action", "reward", "done", "primitive", "language_instruction"];
export const RLDS_STEP_FIELDS = ["observation", "action", "reward", "discount", "is_first", "is_last", "is_terminal", "language_instruction", "primitive"];

export const LICENCES = {
  synthetic: "CC0-1.0",
  human: "unasserted — whoever distributes this must hold the exporting learner's or hall's permission",
};

/** The consent field. A synthetic rollout involves no person. A human
 * episode only exists here because the learner pressed "Export episodes" on
 * their own device and handed the file over — nothing leaves a device
 * without that opt-in, and this exporter never fetches anything. */
export function consentFor(source) {
  return source === "human"
    ? { required: true, basis: "learner-initiated local export from their own device (opt-in)", onDeviceOnly: true, personalData: "none — hashed crew tag only" }
    : { required: false, basis: "generated data, no person involved", onDeviceOnly: true, personalData: "none" };
}

/** Labels for one episode, from the registry and the episode's own steps. */
export function labelsFor(ep) {
  const st = skStation(ep.station, ep.app) ?? skStation(ep.station);
  const hit = new Set(), seen = new Set();
  for (const s of ep.steps ?? []) {
    if (s.info?.hazard && s.action?.id) hit.add(s.action.id);
    if (s.observation?.interrupt?.id) seen.add(s.observation.interrupt.id);
  }
  return {
    station: ep.station, app: ep.app,
    programmes: st?.programmes ?? [], union: st?.union ?? null,
    hazards: st?.failures.hazards ?? [], hazardsHit: [...hit].sort(),
    interruptions: st?.failures.missedInterruptions ?? [], interruptionsSeen: [...seen].sort(),
    sourceApp: ep.sourceApp ?? ep.app ?? null,
    licence: LICENCES[ep.source] ?? LICENCES.human,
    consent: consentFor(ep.source),
    crewTagHash: ep.crewTagHash ?? null,
    source: ep.source,
  };
}

/** The language instruction for a step: the live interruption's cue when one
 * is up (it is what the learner must deal with), else the step's own cue,
 * else its title — the prompt the learner reads on the panel. */
export function instructionFor(room, obs) {
  if (obs?.interrupt?.id && room) {
    const it = (room.interrupts ?? []).find((i) => i.id === obs.interrupt.id);
    if (it) return it.cue ?? it.alert ?? null;
  }
  const step = room?.steps?.find((s) => s.id === obs?.stepId);
  return step ? (step.cue ?? step.title ?? null) : null;
}

function primitiveFor(room, obs) {
  const step = room?.steps?.find((s) => s.id === obs?.stepId);
  return skPrimitiveForKind(step?.kind ?? obs?.kind)?.id ?? null;
}

/** A writer for both layouts. `add(episode, room)` per episode, `close()` once. */
export function createFormatWriters(out, { lerobot = true, rlds = true, generatedAt = null } = {}) {
  const lr = join(out, LEROBOT_DIR), rl = join(out, RLDS_DIR);
  if (lerobot) { mkdirSync(join(lr, "meta"), { recursive: true }); writeFileSync(join(lr, "meta", "episodes.jsonl"), ""); }
  if (rlds) { mkdirSync(rl, { recursive: true }); writeFileSync(join(rl, "episodes.jsonl"), ""); }
  const tasks = new Map(); // task string -> index
  let episodeIndex = 0, frameIndex = 0, rldsSteps = 0;

  function add(ep, room) {
    const labels = labelsFor(ep);
    const task = room ? `${room.name ?? room.title ?? ep.station}: ${room.tagline ?? "run the station's procedure"}` : `${ep.station}`;
    if (!tasks.has(task)) tasks.set(task, tasks.size);
    const taskIndex = tasks.get(task);
    const steps = ep.steps ?? [];
    const terminal = !!(ep.summary && (ep.summary.finished ?? ep.summary.passed != null));

    if (lerobot) {
      const chunk = String(Math.floor(episodeIndex / LEROBOT_CHUNK)).padStart(3, "0");
      const dir = join(lr, "data", `chunk-${chunk}`);
      mkdirSync(dir, { recursive: true });
      const lines = steps.map((s, i) => JSON.stringify({
        index: frameIndex + i, episode_index: episodeIndex, frame_index: i,
        timestamp: s.info?.t ?? +(i / LEROBOT_FPS).toFixed(2), task_index: taskIndex,
        observation: s.observation, action: s.action, reward: s.reward, done: s.done,
        primitive: primitiveFor(room, s.observation), language_instruction: instructionFor(room, s.observation),
      }));
      writeFileSync(join(dir, `episode_${String(episodeIndex).padStart(6, "0")}.jsonl`), lines.length ? lines.join("\n") + "\n" : "");
      appendFileSync(join(lr, "meta", "episodes.jsonl"), JSON.stringify({
        episode_index: episodeIndex, tasks: [task], length: steps.length,
        skill: ep.skill ?? null, seed: ep.seed ?? null, embodied: !!ep.embodied, summary: ep.summary ?? null,
        ...labels,
      }) + "\n");
      frameIndex += steps.length;
    }
    if (rlds) {
      const rsteps = steps.map((s, i) => ({
        observation: s.observation, action: s.action, reward: s.reward, discount: 1,
        is_first: i === 0, is_last: i === steps.length - 1, is_terminal: i === steps.length - 1 && terminal,
        language_instruction: instructionFor(room, s.observation), primitive: primitiveFor(room, s.observation),
      }));
      appendFileSync(join(rl, "episodes.jsonl"), JSON.stringify({
        episode_metadata: { episode_id: `${ep.app}/${ep.station}/${ep.source}/${episodeIndex}`, task, skill: ep.skill ?? null, seed: ep.seed ?? null, embodied: !!ep.embodied, summary: ep.summary ?? null, ...labels },
        steps: rsteps,
      }) + "\n");
      rldsSteps += rsteps.length;
    }
    episodeIndex += 1;
  }

  function close(extra = {}) {
    const result = {};
    if (lerobot) {
      writeFileSync(join(lr, "meta", "tasks.jsonl"), [...tasks.entries()].map(([task, task_index]) => JSON.stringify({ task_index, task })).join("\n") + (tasks.size ? "\n" : ""));
      const info = {
        layout: "LeRobot-style episode layout, JSON Lines values (not the parquet on-disk format of any framework)",
        schemaVersion: 1, generatedAt,
        fps: LEROBOT_FPS, chunks_size: LEROBOT_CHUNK,
        total_episodes: episodeIndex, total_frames: frameIndex, total_tasks: tasks.size,
        total_chunks: Math.ceil(episodeIndex / LEROBOT_CHUNK),
        data_path: "data/chunk-{episode_chunk:03d}/episode_{episode_index:06d}.jsonl",
        features: {
          observation: { dtype: "json", note: "WebXR/shared/robot.js observe() or robot-embodiment.js observeEmbodied()" },
          action: { dtype: "json", note: "one of robot.js applyAction() shapes" },
          reward: { dtype: "float", shape: [1] }, done: { dtype: "bool", shape: [1] },
          primitive: { dtype: "string", note: "WebXR/shared/skill-registry.js SK_PRIMITIVES id" },
          language_instruction: { dtype: "string", note: "the step's cue, or the live interruption's cue" },
          index: { dtype: "int" }, episode_index: { dtype: "int" }, frame_index: { dtype: "int" }, timestamp: { dtype: "float" }, task_index: { dtype: "int" },
        },
        episodeLabels: LABEL_FIELDS,
        licence: LICENCES, notice: "Not a certification. Local file only; nothing here was sent anywhere.",
        ...extra,
      };
      writeFileSync(join(lr, "meta", "info.json"), JSON.stringify(info, null, 2));
      result.lerobot = { dir: LEROBOT_DIR, episodes: episodeIndex, frames: frameIndex, tasks: tasks.size };
    }
    if (rlds) {
      writeFileSync(join(rl, "features.json"), JSON.stringify({
        layout: "RLDS-style step list, JSON Lines (not a TFDS/TFRecord build)", schemaVersion: 1, generatedAt,
        episode: { episode_metadata: ["episode_id", "task", "skill", "seed", "embodied", "summary", ...LABEL_FIELDS], steps: RLDS_STEP_FIELDS },
        total_episodes: episodeIndex, total_steps: rldsSteps,
        licence: LICENCES, notice: "Not a certification. Local file only; nothing here was sent anywhere.",
        ...extra,
      }, null, 2));
      result.rlds = { dir: RLDS_DIR, episodes: episodeIndex, steps: rldsSteps };
    }
    return result;
  }

  return { add, close };
}

// ------------------------------------------------------------ validation
//
// Structural checks for both layouts, shared by tools/eval_dataset.mjs (the
// quality report) and tools/check_agent.mjs (the gate): every required file
// present, every frame/step carrying its fields with the right types, every
// episode carrying every label, the flags consistent (exactly one is_first and
// one is_last per RLDS episode; done only on a LeRobot episode's last frame),
// the counts in info.json / features.json matching what is on disk, and no
// raw crew tag anywhere (only a hash or null).
import { existsSync, readFileSync, readdirSync } from "node:fs";

function readJsonl(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

export function validateFormats(dir) {
  const result = {};
  const lr = join(dir, LEROBOT_DIR);
  if (existsSync(lr)) {
    const issues = [];
    let episodes = 0, frames = 0;
    try {
      const info = JSON.parse(readFileSync(join(lr, "meta", "info.json"), "utf8"));
      const eps = readJsonl(join(lr, "meta", "episodes.jsonl"));
      const tasks = readJsonl(join(lr, "meta", "tasks.jsonl"));
      episodes = eps.length;
      for (const e of eps) {
        for (const f of LABEL_FIELDS) if (!(f in e)) issues.push(`episode ${e.episode_index}: label ${f} missing`);
        if (e.crewTagHash != null && typeof e.crewTagHash !== "string") issues.push(`episode ${e.episode_index}: crewTagHash not a hash`);
        if (!e.licence || !e.consent) issues.push(`episode ${e.episode_index}: licence/consent missing`);
        const chunk = String(Math.floor(e.episode_index / (info.chunks_size || LEROBOT_CHUNK))).padStart(3, "0");
        const path = join(lr, "data", `chunk-${chunk}`, `episode_${String(e.episode_index).padStart(6, "0")}.jsonl`);
        if (!existsSync(path)) { issues.push(`episode ${e.episode_index}: data file missing`); continue; }
        const rows = readJsonl(path);
        if (rows.length !== e.length) issues.push(`episode ${e.episode_index}: length ${e.length} but ${rows.length} frame(s)`);
        rows.forEach((r, i) => {
          for (const f of LEROBOT_FRAME_FIELDS) if (!(f in r)) issues.push(`episode ${e.episode_index} frame ${i}: ${f} missing`);
          if (typeof r.reward !== "number") issues.push(`episode ${e.episode_index} frame ${i}: reward not a number`);
          if (r.done !== (i === rows.length - 1)) issues.push(`episode ${e.episode_index} frame ${i}: done flag wrong`);
          if (r.frame_index !== i) issues.push(`episode ${e.episode_index} frame ${i}: frame_index ${r.frame_index}`);
          if (!tasks.some((t) => t.task_index === r.task_index)) issues.push(`episode ${e.episode_index} frame ${i}: unknown task_index`);
        });
        frames += rows.length;
      }
      if (info.total_episodes !== episodes) issues.push(`info.json total_episodes ${info.total_episodes} != ${episodes}`);
      if (info.total_frames !== frames) issues.push(`info.json total_frames ${info.total_frames} != ${frames}`);
      if (info.total_tasks !== tasks.length) issues.push(`info.json total_tasks ${info.total_tasks} != ${tasks.length}`);
    } catch (err) { issues.push(`unreadable: ${err.message}`); }
    result.lerobot = { present: true, episodes, frames, valid: issues.length === 0, issues: issues.slice(0, 20), issueCount: issues.length };
  } else result.lerobot = { present: false };

  const rl = join(dir, RLDS_DIR);
  if (existsSync(rl)) {
    const issues = [];
    let episodes = 0, steps = 0;
    try {
      const features = JSON.parse(readFileSync(join(rl, "features.json"), "utf8"));
      const eps = readJsonl(join(rl, "episodes.jsonl"));
      episodes = eps.length;
      eps.forEach((e, n) => {
        const md = e.episode_metadata ?? {};
        for (const f of LABEL_FIELDS) if (!(f in md)) issues.push(`episode ${n}: label ${f} missing`);
        if (!Array.isArray(e.steps)) { issues.push(`episode ${n}: steps not an array`); return; }
        if (e.steps.length && e.steps.filter((s) => s.is_first).length !== 1) issues.push(`episode ${n}: needs exactly one is_first`);
        if (e.steps.length && e.steps.filter((s) => s.is_last).length !== 1) issues.push(`episode ${n}: needs exactly one is_last`);
        e.steps.forEach((s, i) => {
          for (const f of RLDS_STEP_FIELDS) if (!(f in s)) issues.push(`episode ${n} step ${i}: ${f} missing`);
          if (typeof s.reward !== "number") issues.push(`episode ${n} step ${i}: reward not a number`);
          if (s.is_terminal && !s.is_last) issues.push(`episode ${n} step ${i}: is_terminal before is_last`);
        });
        steps += e.steps.length;
      });
      if (features.total_episodes !== episodes) issues.push(`features.json total_episodes ${features.total_episodes} != ${episodes}`);
      if (features.total_steps !== steps) issues.push(`features.json total_steps ${features.total_steps} != ${steps}`);
    } catch (err) { issues.push(`unreadable: ${err.message}`); }
    result.rlds = { present: true, episodes, steps, valid: issues.length === 0, issues: issues.slice(0, 20), issueCount: issues.length };
  } else result.rlds = { present: false };
  return result;
}
