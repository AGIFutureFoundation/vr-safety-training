#!/usr/bin/env node
/**
 * Robot training runs — software agents play every SmartCiti.X station and
 * Trade Skills room on the real procedure engine, headlessly, and write:
 *
 *   <out>/manifest.json           what was run, with every station's optimal
 *                                 skill (the level at which its success rate
 *                                 lands in the target band) and the whole
 *                                 difficulty curve behind that number — plus,
 *                                 with --embodied, the station's keep-out
 *                                 volumes, its per-step poses, grasps and
 *                                 force ceilings, the action space, the
 *                                 observation schema and the licence note
 *   <out>/episodes.jsonl          one line per episode: station, skill, seed,
 *                                 summary (score, stars, errors, unsafe
 *                                 actions, keep-out violations, handoffs,
 *                                 pass/fail, awards)
 *   <out>/trajectories.jsonl      one line per decision: observation, action,
 *                                 reward, feedback — and, embodied, the pose
 *                                 the end effector worked, the grasp, the max
 *                                 contact force and the keep-out account of
 *                                 that pose. Synthetic training data across
 *                                 the trades, regenerable from the seed.
 *
 *     node tools/robot_train.mjs                          # everything, defaults
 *     node tools/robot_train.mjs --apps trades --episodes 30 --band 0.5-0.7
 *     node tools/robot_train.mjs --only valve-vault,welding --skills 0.3,0.6,0.9
 *     node tools/robot_train.mjs --out /tmp/robot --seed 7 --no-trajectories
 *     node tools/robot_train.mjs --programme dental-hygiene-unspoken-smiles \
 *       --embodied --episodes 6 --out /tmp/robot-dental --report
 *
 * Defaults: both apps, 8 calibration episodes per probe, then 10 recorded
 * episodes at each of the station's optimal skill, 0.5 and 1.0 (novice /
 * learner / expert), band 0.6–0.8, seed 1, output under tools/out/robot/.
 * Everything is deterministic for a given seed.
 *
 * --programme <id> runs one training programme's stations, in the programme's
 * own order, across both apps (see WebXR/smartcity/js/curricula.js).
 * --embodied runs the embodiment layer (WebXR/shared/robot-embodiment.js): the
 * same policy and the same engine, with a body — poses, grasps, force classes,
 * keep-out volumes, and any step a station marked `noRobot` handed to the
 * clinician instead of attempted.
 * --report prints, per station, the success rate at each skill, the keep-out
 * violations and the steps a robot must never perform.
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };
const flag = (name) => args.includes(`--${name}`);

const programmeId = opt("programme", "");
const programme = programmeId ? CURRICULA.find((c) => c.id === programmeId) : null;
if (programmeId && !programme) {
  console.error(`unknown programme: ${programmeId}\nknown: ${CURRICULA.map((c) => c.id).join(", ")}`);
  process.exit(1);
}
const episodes = +opt("episodes", 10);
const calEpisodes = +opt("calibration-episodes", 8);
const band = opt("band", "0.6-0.8").split("-").map(Number);
const seed = +opt("seed", 1);
const embodied = flag("embodied");
const report = flag("report");
// A programme names its own stations, in its own order, and which app each one
// lives in — that is the selection, so --apps and --only are not needed with it.
const apps = programme
  ? [...new Set(programme.stations.map((s) => s.app))]
  : opt("apps", "smartcity,trades").split(",").map((s) => s.trim()).filter(Boolean);
const only = programme
  ? programme.stations.map((s) => s.id)
  : opt("only", "").split(",").map((s) => s.trim()).filter(Boolean);
const skillsOpt = opt("skills", "");
const out = opt("out", join(ROOT, "tools", "out", "robot"));
const withTrajectories = !flag("no-trajectories");

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const episodesPath = join(out, "episodes.jsonl"), trajPath = join(out, "trajectories.jsonl");
writeFileSync(episodesPath, ""); if (withTrajectories) writeFileSync(trajPath, "");

const manifest = {
  generatedAt: new Date().toISOString(), seed, band, calibrationEpisodes: calEpisodes, episodesPerSkill: episodes,
  embodied,
  programme: programme ? { id: programme.id, name: programme.name, certification: programme.certification } : null,
  files: { episodes: "episodes.jsonl", trajectories: withTrajectories ? "trajectories.jsonl" : null },
  stations: [],
};
let totalEpisodes = 0, totalDecisions = 0;
const reportRows = [];

for (const app of apps) {
  const suite = app === "smartcity" ? await loadSmartCity() : app === "trades" ? await loadTrades() : null;
  if (!suite) { console.error(`unknown app: ${app} (smartcity, trades)`); process.exit(1); }
  suite.Sfx.muted = true;
  if (embodied) {
    manifest.licence = suite.LICENCE_NOTE;
    manifest.actionSpace = suite.actionSpace();
    manifest.observationSchema = suite.observationSchema();
  }
  // A programme's order is the order it teaches in, so run it that way.
  const rooms = only.length
    ? only.map((id) => suite.ROOMS.find((r) => r.id === id)).filter(Boolean)
    : suite.ROOMS;
  console.log(`\n${app} — ${rooms.length} station${rooms.length === 1 ? "" : "s"}${embodied ? ", embodied" : ""}, band ${band[0]}–${band[1]}, seed ${seed}\n`);
  for (const room of rooms) {
    const root = new suite.THREE.Group();
    let api;
    try { api = room.build(root); } catch (err) { console.log(`  ✗ ${room.id}: build() threw: ${err.message}`); continue; }
    const emb = embodied ? suite.buildEmbodiment(room, api, { root }) : null;
    const runOne = (o) => (embodied
      ? suite.runEmbodiedEpisode(room, api, { ...o, root, SessionClass: suite.Session })
      : suite.runEpisode(room, api, { ...o, SessionClass: suite.Session }));
    const cal = embodied
      ? suite.calibrateEmbodied(room, api, { band, episodes: calEpisodes, seed, root, SessionClass: suite.Session })
      : suite.calibrate(room, api, { band, episodes: calEpisodes, seed, SessionClass: suite.Session });
    const skills = skillsOpt ? skillsOpt.split(",").map(Number) : [...new Set([cal.optimal.skill, 0.5, 1])];
    const perSkill = [];
    for (const skill of skills) {
      let passes = 0, score = 0, hazards = 0, decisions = 0, violations = 0, handoffs = 0;
      for (let i = 0; i < episodes; i++) {
        const episodeSeed = seed * 100000 + Math.round(skill * 1000) * 100 + i;
        const { summary, records } = runOne({ skill, seed: episodeSeed, trajectory: withTrajectories });
        appendFileSync(episodesPath, JSON.stringify({ app, station: room.id, name: room.name ?? room.title, category: room.category ?? null, skill, seed: episodeSeed, ...summary }) + "\n");
        if (withTrajectories) for (const r of records) appendFileSync(trajPath, JSON.stringify({ app, station: room.id, skill, seed: episodeSeed, ...r }) + "\n");
        passes += summary.passed ? 1 : 0; score += summary.score; hazards += summary.hazardHits; decisions += summary.decisions;
        violations += summary.keepOutViolations ?? 0; handoffs += summary.handoffs ?? 0;
        totalEpisodes += 1; totalDecisions += summary.decisions;
      }
      perSkill.push({
        skill, episodes, successRate: +(passes / episodes).toFixed(3), meanScore: Math.round(score / episodes),
        unsafeActionsPerEpisode: +(hazards / episodes).toFixed(2), decisionsPerEpisode: +(decisions / episodes).toFixed(1),
        ...(embodied ? { keepOutViolations: violations, handoffsPerEpisode: +(handoffs / episodes).toFixed(1) } : {}),
      });
    }
    const entry = {
      app, id: room.id, name: room.name ?? room.title, category: room.category ?? null, trade: room.trade ?? null,
      certification: room.certification ?? null, steps: room.steps.length, hazards: Object.keys(room.hazards ?? {}).length,
      optimalSkill: cal.optimal.skill, optimalSuccessRate: cal.optimal.successRate, calibrationNote: cal.optimal.note ?? null,
      difficultyCurve: cal.history, runs: perSkill,
    };
    if (embodied) {
      entry.embodiment = {
        standoff: emb.standoff,
        interactables: Object.keys(emb.poses).length,
        poses: emb.poses,
        keepOut: emb.keepOut,
        steps: emb.stepOrder.map((id) => emb.steps[id]),
        noRobotSteps: emb.noRobotSteps,
        contactSteps: emb.contactSteps,
      };
    }
    manifest.stations.push(entry);
    reportRows.push({ entry, emb, perSkill });
    const note = cal.optimal.note ? ` (${cal.optimal.note})` : "";
    console.log(`  ${(room.name ?? room.title).padEnd(26)} optimal skill ${cal.optimal.skill.toFixed(2)} → ${Math.round(cal.optimal.successRate * 100)}% pass${note}; ` +
      perSkill.map((p) => `s${p.skill.toFixed(2)}:${Math.round(p.successRate * 100)}%/${p.meanScore}`).join(" ") +
      (embodied ? `; ${emb.keepOut.length} keep-out zone${emb.keepOut.length === 1 ? "" : "s"}, ${emb.noRobotSteps.length} step${emb.noRobotSteps.length === 1 ? "" : "s"} off-limits` : ""));
  }
}
manifest.totals = { episodes: totalEpisodes, decisions: totalDecisions };
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nWrote ${manifest.stations.length} stations, ${totalEpisodes} episodes, ${totalDecisions} decisions → ${out}`);

// ------------------------------------------------------------------- report
//
// What a training director and a robotics team each need off one run: how the
// station's success rate moves with skill, whether anything came near a person
// it should not have, and which steps the robot is not allowed to attempt at
// all — with the reason the station gave, because that reason is the argument
// for the boundary.
if (report) {
  console.log(`\n${"=".repeat(78)}\nREPORT${programme ? ` — ${programme.name}` : ""}\n${"=".repeat(78)}`);
  let totalViolations = 0, totalNoRobot = 0;
  for (const { entry, emb, perSkill } of reportRows) {
    console.log(`\n${entry.name}  (${entry.app}/${entry.id}) — ${entry.steps} steps, ${entry.hazards} hazards`);
    console.log(`  success rate by skill: ${perSkill.map((p) => `${p.skill.toFixed(2)} → ${String(Math.round(p.successRate * 100)).padStart(3)}%  (mean ${p.meanScore}, unsafe ${p.unsafeActionsPerEpisode}/ep)`).join("\n                         ")}`);
    console.log(`  optimal skill: ${entry.optimalSkill.toFixed(2)} → ${Math.round(entry.optimalSuccessRate * 100)}% pass${entry.calibrationNote ? ` — ${entry.calibrationNote}` : ""}`);
    if (!emb) continue;
    const viol = perSkill.reduce((n, p) => n + (p.keepOutViolations ?? 0), 0);
    totalViolations += viol;
    console.log(`  keep-out: ${emb.keepOut.length} zone${emb.keepOut.length === 1 ? "" : "s"} (${emb.keepOut.map((z) => `${z.id} r${z.radius}`).join(", ")})`);
    console.log(`  keep-out violations: ${viol === 0 ? "none at any skill run" : `${viol} across ${perSkill.map((p) => `s${p.skill.toFixed(2)}:${p.keepOutViolations}`).join(" ")}`}`);
    if (emb.contactSteps.length) console.log(`  declared patient contact: ${emb.contactSteps.map((s) => `${s.id} (${s.forceClass})`).join(", ")}`);
    totalNoRobot += emb.noRobotSteps.length;
    if (!emb.noRobotSteps.length) console.log("  steps marked noRobot: none — every step in this station is one a robot may attempt");
    else {
      console.log(`  steps marked noRobot (${emb.noRobotSteps.length}) — handed to the clinician, never attempted:`);
      for (const s of emb.noRobotSteps) console.log(`    · ${s.id} — ${s.title}${s.why ? `\n        ${s.why}` : ""}`);
    }
  }
  console.log(`\n${"-".repeat(78)}`);
  console.log(`${reportRows.length} stations · ${totalEpisodes} episodes · ${totalNoRobot} steps a robot must never perform · ${totalViolations} keep-out violation${totalViolations === 1 ? "" : "s"}`);
  if (embodied) console.log(`Dataset licence: ${manifest.licence}`);
}
