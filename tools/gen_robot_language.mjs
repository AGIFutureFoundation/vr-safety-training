/**
 * ROBOT-LANGUAGE: the stations' own procedure language as instruction data, for training and evaluating models that
 * guide, check or stop work beside people, robots included.
 *
 *     node tools/gen_robot_language.mjs
 *
 * What it is, plainly:
 *   * Read from the per-station exports (exports/unity/SmartCitiX/Content/stations/*.json, written by
 *     tools/export_unity.mjs from the catalog). Nothing is written by hand here and no text is generated: every
 *     record quotes a station's own authored words.
 *   * Three record types per station: `step` (the instruction a worker is given, the action it asks for and why it
 *     matters), `interrupt` (a situation that arrives mid-task, the response it calls for, and what goes wrong when
 *     it is missed) and `unsafe` (an unsafe alternative a learner can pick and why it is unsafe). Together they pair
 *     instructions with refusals and stops.
 *   * Each record names its station; index.json's `stations` table gives that station's category, programmes, trade,
 *     standards and the generic robot style that assists that work (ROS_ASSIST_STYLE_BY_CATEGORY in
 *     tools/gen_ros_assist.mjs), so a record links to the matching exports/ros-assist episodes. `robot: true` marks
 *     the robot-control and automation stations.
 *   * English only (translations need a reviewed source). No learner data: these are authored training scripts, not
 *     anyone's answers. No brand, partner or customer claim is added.
 *
 * Writes, deterministically (no timestamps), JSON Lines sorted by station then record:
 *   exports/robot-language/index.json            counts, schema, the categories and their files
 *   exports/robot-language/<category-slug>.jsonl one record per line
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const RL_DIR = join(ROOT, "exports", "robot-language");
export const RL_SOURCE = join(ROOT, "exports", "unity", "SmartCitiX", "Content", "stations");
export const RL_VERSION = "robot-language/1";

// A station counts as robot work when its id or programmes say so: the robot-control, automation and agent-dispatch families.
const ROBOT_ID = /^(rt|ad|rp|tw|vb)-|robot|cobot|amr|drone|rov|autonom/;
const ROBOT_PROGRAMMES = new Set(["robot-control-basics", "aerospace-defense-and-robotics", "warehouse-and-logistics-automation"]);

export const slug = (t) => t.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const clean = (t) => (typeof t === "string" ? t.replace(/\s+/g, " ").trim() : null);

/** One station's entry in the index: what every record from it shares. Pure. */
export function stationMeta(st, styleByCategory) {
  return {
    category: st.category,
    programmes: [...(st.programmes ?? [])].sort(),
    trade: clean(st.trade),
    robot: ROBOT_ID.test(st.id) || (st.programmes ?? []).some((p) => ROBOT_PROGRAMMES.has(p)),
    assist_style: styleByCategory[st.category] ?? null,
    standards: (st.citations?.standards ?? []).map((s) => s.id).sort(),
  };
}

/** The records for one station export. Pure. */
export function stationRecords(st) {
  const base = { station: st.id };
  const out = [];
  (st.steps ?? []).forEach((s, i) => {
    const instruction = clean(s.cue ?? s.prompt);
    if (!instruction) return;
    out.push({ id: `${st.id}:step:${s.id ?? i}`, type: "step", ...base, index: i, title: clean(s.title), instruction, action: { kind: s.kind ?? null, target: s.target ?? null }, rationale: clean(s.why) });
  });
  for (const it of st.interrupts ?? []) {
    const instruction = clean(it.cue);
    if (!instruction) continue;
    out.push({ id: `${st.id}:interrupt:${it.id}`, type: "interrupt", ...base, situation: clean(it.alert), instruction, after_step: it.after ?? null, missed: clean(it.missNote) });
  }
  for (const [hid, text] of Object.entries(st.hazards ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
    const t = clean(text);
    if (!t) continue;
    out.push({ id: `${st.id}:unsafe:${hid}`, type: "unsafe", ...base, unsafe_choice: hid, explanation: t });
  }
  return out;
}

/** The whole dataset: records grouped by category file, and the index. */
export async function buildRobotLanguage() {
  const { ROS_ASSIST_STYLE_BY_CATEGORY } = await import(pathToFileURL(join(ROOT, "tools", "gen_ros_assist.mjs")).href);
  const files = readdirSync(RL_SOURCE).filter((f) => f.endsWith(".json")).sort();
  const byFile = {};
  const counts = { stations: 0, step: 0, interrupt: 0, unsafe: 0, robotStations: 0 };
  const stations = {};
  for (const f of files) {
    const st = JSON.parse(readFileSync(join(RL_SOURCE, f), "utf8"));
    if (!st.id || !st.category) continue;
    const recs = stationRecords(st);
    if (!recs.length) continue;
    stations[st.id] = stationMeta(st, ROS_ASSIST_STYLE_BY_CATEGORY);
    counts.stations += 1;
    if (stations[st.id].robot) counts.robotStations += 1;
    for (const r of recs) counts[r.type] += 1;
    (byFile[`${slug(st.category)}.jsonl`] ??= []).push(...recs);
  }
  const categories = Object.entries(byFile).sort(([a], [b]) => a.localeCompare(b)).map(([file, recs]) => ({
    file, category: stations[recs[0].station].category, stations: new Set(recs.map((r) => r.station)).size, records: recs.length,
  }));
  const index = {
    version: RL_VERSION,
    source: "the stations' own authored procedure text (exports/unity/SmartCitiX/Content/stations), quoted, not generated",
    learner_data: false,
    lang: ["en"],
    counts: { ...counts, records: counts.step + counts.interrupt + counts.unsafe },
    record_types: {
      step: "instruction (what the worker is told), action {kind, target}, rationale (why it matters)",
      interrupt: "situation (what arrives mid-task), instruction (the response), missed (what goes wrong if it is not given)",
      unsafe: "unsafe_choice (an option a learner can pick), explanation (why it is unsafe)",
    },
    station_fields: "each record's `station` keys `stations` below: category, programmes, trade, robot, assist_style, standards",
    links: { assist_style: "exports/ros-assist/<style>.json episodes for the same kind of work" },
    categories,
    stations,
    not_included: ["learner answers or any personal data", "translated text (needs a reviewed source)", "any brand, model or company"],
  };
  return { index, byFile };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { index, byFile } = await buildRobotLanguage();
  mkdirSync(RL_DIR, { recursive: true });
  for (const f of readdirSync(RL_DIR)) if (f.endsWith(".jsonl") && !byFile[f]) writeFileSync(join(RL_DIR, f), "");
  writeFileSync(join(RL_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");
  for (const [f, recs] of Object.entries(byFile)) writeFileSync(join(RL_DIR, f), recs.map((r) => JSON.stringify(r)).join("\n") + "\n");
  const c = index.counts;
  console.log(`Wrote ${RL_DIR.replace(ROOT + "/", "")} — ${c.records} records from ${c.stations} stations (${c.step} steps, ${c.interrupt} interrupts, ${c.unsafe} unsafe choices; ${c.robotStations} robot stations).`);
}
