#!/usr/bin/env node
/**
 * ROBOTICS — headless rollouts of the robotics scenarios (WebXR/shared/rb-env.js)
 * written in the dataset layer's episode format (tools/export_dataset.mjs,
 * docs/robot-datasets.md): JSON Lines shards whose episodes carry
 * schemaVersion / source / app / station / skill / seed / steps[{ observation,
 * action, reward, done, info }] / summary, plus a manifest and the LeRobot-
 * and RLDS-style layouts from tools/lib/dataset_formats.mjs.
 *
 *     node tools/rb_rollout.mjs                                   # every scenario, skills 0.3,0.65,1, seeds 1..2
 *     node tools/rb_rollout.mjs --scenarios rb-cell-entry --skills 1 --seeds 5 --out /tmp/rb
 *     node tools/rb_rollout.mjs --no-stations --formats native    # games only, native shards only
 *
 * Output (never under WebXR/dist): <out>/episodes-robotics.jsonl, <out>/manifest.json,
 * <out>/lerobot/, <out>/rlds/. Deterministic: the same arguments reproduce the
 * same shards byte for byte except the manifest's `generatedAt`.
 *
 * Schema: every episode records `schemaVersion` (the dataset layer's version,
 * RB_SCHEMA.dataset — DATAWORKS is extending that format in parallel, and
 * tools/check_robotics.mjs fails when the two drift) and `envSchema`
 * (RB_SCHEMA.env, the observation/action shapes of rb-env.js).
 */
import { mkdirSync, writeFileSync, appendFileSync, rmSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { ROOT, loadSmartCity } from "./lib/headless.mjs";
import { createFormatWriters } from "./lib/dataset_formats.mjs";
import { RB_SCENARIOS, RB_SCHEMA } from "../WebXR/shared/rb-robotics-data.js";
import { rbEnv, rbRollout } from "../WebXR/shared/rb-env.js";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };
const has = (name) => args.includes(`--${name}`);

/** Build the episodes for a plan, in memory. Exported so the checker can run
 * a small plan without touching disk. */
export async function rbEpisodes({ scenarios = null, skills = [0.3, 0.65, 1], seeds = 2, baseSeed = 1, stations = true } = {}) {
  const list = RB_SCENARIOS.filter((s) => (!scenarios || scenarios.includes(s.id)) && (stations || s.kind !== "station"));
  let suite = null;
  if (list.some((s) => s.kind === "station")) { suite = await loadSmartCity(); suite.Sfx.muted = true; }
  const out = [];
  for (const sc of list) {
    let bind = null, room = { name: sc.name, tagline: sc.blurb, steps: [] };
    if (sc.kind === "station") {
      const r = suite.ROOMS.find((x) => x.id === sc.station);
      if (!r) throw new Error(`${sc.id}: station ${sc.station} is not in the SmartCiti.X suite`);
      bind = { room: r, api: r.build(new suite.THREE.Group()), SessionClass: suite.Session };
      room = r;
    }
    for (const skill of skills) for (let k = 0; k < seeds; k++) {
      const seed = baseSeed * 1000 + k + 1;
      const env = rbEnv(sc.id, { seed, station: bind });
      const { steps, summary } = rbRollout(env, { skill, seed });
      const viol = steps.reduce((n, s) => n + (s.info.violations?.length ?? 0), 0);
      out.push({ room, episode: {
        schemaVersion: RB_SCHEMA.dataset, envSchema: RB_SCHEMA.env, source: "synthetic",
        app: "robotics", sourceApp: sc.kind === "station" ? "smartcity" : "robotics",
        station: sc.kind === "station" ? sc.station : sc.id, scenario: sc.id, name: sc.name, category: "Robotics & HRI",
        embodied: true, skill, seed, crewTagHash: null,
        steps,
        summary: {
          score: summary.score, stars: null, errors: viol, hazardHits: steps.filter((s) => s.info.hazard).length,
          seconds: steps.length ? steps[steps.length - 1].info.t : 0, passed: summary.passed, finished: summary.finished,
          keepOutViolations: steps.filter((s) => s.info.keepOutViolation).length, handoffs: 0,
          truncated: summary.truncated, violationRules: summary.violationRules,
        },
      } });
    }
  }
  return out;
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("rb_rollout.mjs");
if (isMain) {
  const out = resolve(opt("out", join(ROOT, "tools", "out", "rb-rollout")));
  const skills = opt("skills", "0.3,0.65,1").split(",").map(Number).filter((n) => !Number.isNaN(n));
  const seeds = +opt("seeds", 2);
  const scenarios = opt("scenarios", "") ? opt("scenarios", "").split(",").map((s) => s.trim()) : null;
  const formats = opt("formats", "native,lerobot,rlds").split(",");
  if (out.includes(`${join("WebXR", "dist")}`)) throw new Error("rb_rollout: never write under WebXR/dist");
  if (existsSync(out)) rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const eps = await rbEpisodes({ scenarios, skills, seeds, baseSeed: +opt("seed", 1), stations: !has("no-stations") });
  const shard = join(out, "episodes-robotics.jsonl");
  writeFileSync(shard, "");
  const fw = formats.includes("lerobot") || formats.includes("rlds") ? createFormatWriters(out, { lerobot: formats.includes("lerobot"), rlds: formats.includes("rlds") }) : null;
  const per = {};
  let steps = 0;
  for (const { room, episode } of eps) {
    appendFileSync(shard, JSON.stringify(episode) + "\n");
    fw?.add(episode, room);
    const p = (per[episode.scenario] ??= { scenario: episode.scenario, station: episode.station, episodes: 0, steps: 0, passed: 0 });
    p.episodes += 1; p.steps += episode.steps.length; p.passed += episode.summary.passed ? 1 : 0; steps += episode.steps.length;
  }
  fw?.close?.();
  writeFileSync(join(out, "manifest.json"), JSON.stringify({
    generator: "tools/rb_rollout.mjs", generatedAt: new Date().toISOString(),
    schemaVersion: RB_SCHEMA.dataset, envSchema: RB_SCHEMA.env, frame: RB_SCHEMA.frame, units: RB_SCHEMA.units,
    skills, seeds, scenarios: Object.values(per), totals: { episodes: eps.length, steps },
    shards: ["episodes-robotics.jsonl"], formats,
    licence: "CC0-1.0 (synthetic, generated from procedural SmartCiti.X robotics scenarios)",
  }, null, 2) + "\n");
  console.log(`rb_rollout: ${eps.length} episodes, ${steps} steps → ${out}`);
}
