#!/usr/bin/env node
/**
 * Robot training runs — software agents play every SmartCiti.X station and
 * Trade Skills room on the real procedure engine, headlessly, and write:
 *
 *   <out>/manifest.json           what was run, with every station's optimal
 *                                 skill (the level at which its success rate
 *                                 lands in the target band) and the whole
 *                                 difficulty curve behind that number
 *   <out>/episodes.jsonl          one line per episode: station, skill, seed,
 *                                 summary (score, stars, errors, unsafe
 *                                 actions, pass/fail, awards)
 *   <out>/trajectories.jsonl      one line per decision: observation, action,
 *                                 reward, feedback — synthetic training data
 *                                 across the trades, regenerable from the seed
 *
 *     node tools/robot_train.mjs                          # everything, defaults
 *     node tools/robot_train.mjs --apps trades --episodes 30 --band 0.5-0.7
 *     node tools/robot_train.mjs --only valve-vault,welding --skills 0.3,0.6,0.9
 *     node tools/robot_train.mjs --out /tmp/robot --seed 7 --no-trajectories
 *
 * Defaults: both apps, 8 calibration episodes per probe, then 10 recorded
 * episodes at each of the station's optimal skill, 0.5 and 1.0 (novice /
 * learner / expert), band 0.6–0.8, seed 1, output under tools/out/robot/.
 * Everything is deterministic for a given seed.
 */
import { mkdirSync, writeFileSync, appendFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity, loadTrades } from "./lib/headless.mjs";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : dflt; };
const flag = (name) => args.includes(`--${name}`);

const apps = opt("apps", "smartcity,trades").split(",").map((s) => s.trim()).filter(Boolean);
const episodes = +opt("episodes", 10);
const calEpisodes = +opt("calibration-episodes", 8);
const band = opt("band", "0.6-0.8").split("-").map(Number);
const seed = +opt("seed", 1);
const only = opt("only", "").split(",").map((s) => s.trim()).filter(Boolean);
const skillsOpt = opt("skills", "");
const out = opt("out", join(ROOT, "tools", "out", "robot"));
const withTrajectories = !flag("no-trajectories");

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const episodesPath = join(out, "episodes.jsonl"), trajPath = join(out, "trajectories.jsonl");
writeFileSync(episodesPath, ""); if (withTrajectories) writeFileSync(trajPath, "");

const manifest = {
  generatedAt: new Date().toISOString(), seed, band, calibrationEpisodes: calEpisodes, episodesPerSkill: episodes,
  files: { episodes: "episodes.jsonl", trajectories: withTrajectories ? "trajectories.jsonl" : null },
  stations: [],
};
let totalEpisodes = 0, totalDecisions = 0;

for (const app of apps) {
  const suite = app === "smartcity" ? await loadSmartCity() : app === "trades" ? await loadTrades() : null;
  if (!suite) { console.error(`unknown app: ${app} (smartcity, trades)`); process.exit(1); }
  suite.Sfx.muted = true;
  console.log(`\n${app} — ${suite.ROOMS.length} stations, band ${band[0]}–${band[1]}, seed ${seed}\n`);
  for (const room of suite.ROOMS) {
    if (only.length && !only.includes(room.id)) continue;
    const root = new suite.THREE.Group();
    let api;
    try { api = room.build(root); } catch (err) { console.log(`  ✗ ${room.id}: build() threw: ${err.message}`); continue; }
    const cal = suite.calibrate(room, api, { band, episodes: calEpisodes, seed, SessionClass: suite.Session });
    const skills = skillsOpt ? skillsOpt.split(",").map(Number) : [...new Set([cal.optimal.skill, 0.5, 1])];
    const perSkill = [];
    for (const skill of skills) {
      let passes = 0, score = 0, hazards = 0, decisions = 0;
      for (let i = 0; i < episodes; i++) {
        const episodeSeed = seed * 100000 + Math.round(skill * 1000) * 100 + i;
        const { summary, records } = suite.runEpisode(room, api, { skill, seed: episodeSeed, trajectory: withTrajectories, SessionClass: suite.Session });
        appendFileSync(episodesPath, JSON.stringify({ app, station: room.id, name: room.name ?? room.title, category: room.category ?? null, skill, seed: episodeSeed, ...summary }) + "\n");
        if (withTrajectories) for (const r of records) appendFileSync(trajPath, JSON.stringify({ app, station: room.id, skill, seed: episodeSeed, ...r }) + "\n");
        passes += summary.passed ? 1 : 0; score += summary.score; hazards += summary.hazardHits; decisions += summary.decisions;
        totalEpisodes += 1; totalDecisions += summary.decisions;
      }
      perSkill.push({ skill, episodes, successRate: +(passes / episodes).toFixed(3), meanScore: Math.round(score / episodes), unsafeActionsPerEpisode: +(hazards / episodes).toFixed(2), decisionsPerEpisode: +(decisions / episodes).toFixed(1) });
    }
    manifest.stations.push({
      app, id: room.id, name: room.name ?? room.title, category: room.category ?? null, trade: room.trade ?? null,
      certification: room.certification ?? null, steps: room.steps.length, hazards: Object.keys(room.hazards ?? {}).length,
      optimalSkill: cal.optimal.skill, optimalSuccessRate: cal.optimal.successRate, calibrationNote: cal.optimal.note ?? null,
      difficultyCurve: cal.history, runs: perSkill,
    });
    const note = cal.optimal.note ? ` (${cal.optimal.note})` : "";
    console.log(`  ${(room.name ?? room.title).padEnd(26)} optimal skill ${cal.optimal.skill.toFixed(2)} → ${Math.round(cal.optimal.successRate * 100)}% pass${note}; ` +
      perSkill.map((p) => `s${p.skill.toFixed(2)}:${Math.round(p.successRate * 100)}%/${p.meanScore}`).join(" "));
  }
}
manifest.totals = { episodes: totalEpisodes, decisions: totalDecisions };
writeFileSync(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\nWrote ${manifest.stations.length} stations, ${totalEpisodes} episodes, ${totalDecisions} decisions → ${out}`);
