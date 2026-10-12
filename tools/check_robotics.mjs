#!/usr/bin/env node
/**
 * ROBOTICS checker (docs/consoles/ROBOTICS.md): the gym API, the rollout
 * format, the safe-practice rewards, determinism, the world sites and games,
 * budgets and the Kids rule.
 *
 *     node tools/check_robotics.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, loadSmartCity } from "./lib/headless.mjs";
import { RB_SCENARIOS, RB_SITES, RB_RULES, RB_SCHEMA, RB_SSM, rbSharedData } from "../WebXR/shared/rb-robotics-data.js";
import { rbEnv, rbRollout, rbPolicy, rbSsmMode } from "../WebXR/shared/rb-env.js";
import { rbSitesFor, rbGamesFor, rbRegisterMechanics, rbMountRobotics, rbSiteState, rbSiteEvent, rbSiteScore, RB_GAME_MECHANICS, RB_MESHES_PER_SITE, RB_RIG_TYPES } from "../WebXR/shared/rb-world.js";
import { FORCE_CLASSES, GRASP_BY_KIND } from "../WebXR/shared/robot-embodiment.js";
import { QM_MECHANICS, qmMechanicSteps } from "../WebXR/shared/side-game-mechanics.js";
import { npParish } from "../WebXR/shared/np-parishes.js";
import { npWaterAt, npHeightAt, NP_SIZE } from "../WebXR/shared/np-parish.js";
import { skStation } from "../WebXR/shared/skill-registry.js";
import { rbEpisodes } from "./rb_rollout.mjs";

let failures = 0, passes = 0;
function check(name, fn) {
  try { const r = fn(); passes += 1; console.log(`  ✓ ${name}${r ? ` — ${r}` : ""}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
async function checkAsync(name, fn) {
  try { const r = await fn(); passes += 1; console.log(`  ✓ ${name}${r ? ` — ${r}` : ""}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message ?? err}`); }
}
const ok = (v, what) => { if (!v) throw new Error(what); };

console.log("ROBOTICS — gym API, rollouts, sites and games\n");

const suite = await loadSmartCity();
suite.Sfx.muted = true;
const binds = {};
for (const sc of RB_SCENARIOS.filter((s) => s.kind === "station")) {
  const room = suite.ROOMS.find((r) => r.id === sc.station);
  binds[sc.id] = room ? { room, api: room.build(new suite.THREE.Group()), rebuild: () => room.build(new suite.THREE.Group()), SessionClass: suite.Session } : null;
}
const envOf = (id, seed = 1) => rbEnv(id, { seed, station: binds[id] ?? null });

// 1. Every scenario resets, steps and terminates; the expert passes clean.
check("every scenario resets, steps and terminates headlessly within maxSteps; the skill-1 expert passes with no rule broken", () => {
  const rows = [];
  for (const sc of RB_SCENARIOS) {
    ok(sc.kind !== "station" || binds[sc.id], `${sc.id}: station ${sc.station} is not in the SmartCiti.X suite`);
    for (const seed of [1, 2, 3]) {
      const env = envOf(sc.id, seed);
      const { steps, summary } = rbRollout(env, { skill: 1, seed });
      ok(steps.length > 0 && steps.length <= sc.maxSteps, `${sc.id} seed ${seed}: ${steps.length} steps`);
      ok(steps[steps.length - 1].done, `${sc.id} seed ${seed}: last step not done`);
      ok(summary.finished && summary.passed && summary.violationCount === 0, `${sc.id} seed ${seed}: expert ${JSON.stringify(summary)}`);
    }
    rows.push(sc.id);
  }
  return `${rows.length} scenarios × 3 seeds`;
});

// 2. Rewards follow the safe-practice rules.
const run = (id, actions, seed = 1) => { const env = envOf(id, seed); const out = actions.map((a) => env.step(a)); return { env, out, all: out.flatMap((r) => r.info.violations) }; };
check("cell entry: walking in before lockout is penalised (enter-live-cell) and the robot holds a stop", () => {
  const env = envOf("rb-cell-entry", 4); let o = env.observe(), r;
  while (o.distance > o.gate + 0.01) { r = env.step({ type: "walk", d: 1 }); o = r.observation; }
  ok(o.robotMode === "stop" && o.robotSpeed === 0, `robot ${o.robotMode} at the gate`);
  r = env.step({ type: "enter" });
  ok(r.info.violations.includes("enter-live-cell"), "no enter-live-cell"); ok(r.reward < 0, `reward ${r.reward}`);
  return `reward ${r.reward}`;
});
check("cell entry: finishing without testing the e-stop is penalised (skip-estop-test); lockout before a stop is penalised", () => {
  const env = envOf("rb-cell-entry", 4); let o = env.observe(), r;
  while (o.distance > o.gate + 0.01) { r = env.step({ type: "walk", d: 1 }); o = r.observation; }
  r = env.step({ type: "lockout" }); ok(r.info.violations.includes("lockout-order"), "lockout before e-stop not penalised");
  for (const t of ["press-estop", "lockout", "verify", "enter", "clear-jam", "exit", "remove-lock", "restart"]) r = env.step({ type: t });
  ok(r.done && r.info.violations.includes("skip-estop-test"), `last step ${JSON.stringify(r.info.violations)}`);
  ok(!env.summary().passed, "passed without an e-stop test");
});
check("cell entry: restarting with the lock still on is penalised", () => {
  const { all } = run("rb-cell-entry", [...Array(20).fill({ type: "walk", d: 1 }), { type: "test-estop" }, { type: "press-estop" }, { type: "lockout" }, { type: "verify" }, { type: "enter" }, { type: "clear-jam" }, { type: "exit" }, { type: "restart" }]);
  ok(all.includes("restart-with-lock"), JSON.stringify(all));
});
check("cobot setup: committing without the e-stop or scanner test, or with a stop zone too small, is penalised", () => {
  const { out } = run("rb-cobot-zone-setup", [{ type: "set", param: "stop", value: 0.3 }, { type: "commit" }]);
  const v = out[1].info.violations;
  for (const k of ["zone-too-small", "skip-estop-test", "skip-scanner-test"]) ok(v.includes(k), `${k} missing from ${JSON.stringify(v)}`);
  ok(out[1].reward < 0 && out[1].done, "commit not negative/done");
});
check("teleop: gripping over the part's limit is penalised; moving into a teammate's space holds a protective stop", () => {
  const env = envOf("rb-teleop-pick-place", 1); const pol = rbPolicy(env, { skill: 1 }); let o = env.observe(), r;
  for (let i = 0; i < 60 && !(o.part && Math.hypot(o.effector[0] - o.bin[0], o.effector[1] - o.bin[1], o.effector[2] - o.bin[2]) < 0.05); i++) { r = env.step(pol(o)); o = r.observation; }
  r = env.step({ type: "grip", force: o.part.ceilingN + 10 }); ok(r.info.violations.includes("over-force"), "over-force not penalised");
  const env2 = envOf("rb-teleop-pick-place", 1); const e0 = env2.observe().effector;
  let hit = null; for (let i = 0; i < 12 && !hit; i++) { r = env2.step({ type: "move", dx: 0, dy: -0.05, dz: 0.12 }); if (r.info.keepOutViolation) hit = r; }
  ok(hit && hit.info.feedback === "protective-stop" && hit.info.violations.includes("keep-out"), "no protective stop on entering the keep-out");
  void e0;
});
check("AMR routing: sending a robot into the walkway during a crossing is penalised; conflicts are penalised", () => {
  let yielded = false, conflict = false;
  for (let seed = 1; seed < 30 && !(yielded && conflict); seed++) {
    const env = envOf("rb-amr-fleet-routing", seed); let o = env.observe();
    for (let i = 0; i < 12; i++) { const r = env.step({ type: "route", moves: ["E", "E", "E"] }); if (r.info.violations.includes("yield-missed")) yielded = true; o = r.observation; if (r.done) break; }
    // Column 0 is open: robot one down, robot two up, then both again — a swap, so both hold.
    const e3 = envOf("rb-amr-fleet-routing", seed); e3.step({ type: "route", moves: ["S", "N", "wait"] });
    const r3 = e3.step({ type: "route", moves: ["S", "N", "wait"] }); if (r3.info.violations.includes("conflict") && r3.info.feedback === "conflict-held") conflict = true;
    void o;
  }
  ok(yielded, "no yield-missed across seeds"); ok(conflict, "no conflict penalty");
});
check("a novice (skill 0.3) breaks more safe-practice rules than the expert on every game", () => {
  const out = [];
  for (const sc of RB_SCENARIOS.filter((s) => s.kind === "game")) {
    let nov = 0, exp = 0;
    for (let seed = 1; seed <= 8; seed++) {
      nov += rbRollout(envOf(sc.id, seed), { skill: 0.3, seed }).summary.violationCount;
      exp += rbRollout(envOf(sc.id, seed), { skill: 1, seed }).summary.violationCount;
    }
    ok(nov > exp, `${sc.id}: novice ${nov} vs expert ${exp}`); out.push(`${sc.id.replace("rb-", "")} ${nov}/${exp}`);
  }
  return out.join(", ");
});

// 3. Determinism.
check("deterministic by seed: the same seed gives a byte-identical episode, another seed a different one", () => {
  for (const sc of RB_SCENARIOS) {
    const a = JSON.stringify(rbRollout(envOf(sc.id, 5), { skill: 0.65, seed: 5 }));
    const b = JSON.stringify(rbRollout(envOf(sc.id, 5), { skill: 0.65, seed: 5 }));
    ok(a === b, `${sc.id}: seed 5 differs run to run`);
  }
  for (const sc of RB_SCENARIOS.filter((x) => x.kind === "game")) {
    const seen = new Set([1, 2, 3, 4, 5, 6].map((seed) => JSON.stringify(rbRollout(envOf(sc.id, seed), { skill: 1, seed }).steps.map((s) => s.observation))));
    ok(seen.size > 1, `${sc.id}: six seeds give one identical episode`);
  }
});

// 4. Embodiment schema on game observations.
check("observations carry the embodiment fields (grasp, maxForce, keepOut account) in robot-embodiment.js's vocabulary", () => {
  const grasps = new Set(Object.values(GRASP_BY_KIND));
  for (const sc of RB_SCENARIOS) {
    const { steps } = rbRollout(envOf(sc.id, 2), { skill: 1, seed: 2 });
    for (const s of steps) {
      const o = s.observation;
      ok("keepOut" in o && o.keepOut && "zones" in o.keepOut && "inside" in o.keepOut && "authorised" in o.keepOut, `${sc.id}: keepOut account missing`);
      ok(o.maxForce == null || FORCE_CLASSES.includes(o.maxForce), `${sc.id}: maxForce ${o.maxForce}`);
      ok(o.grasp == null || grasps.has(o.grasp), `${sc.id}: grasp ${o.grasp}`);
    }
  }
});

// 5. Rollout format = the dataset layer's.
await checkAsync("rb_rollout episodes are in the dataset layer's format and mark the schema version (== export_dataset.mjs SCHEMA_VERSION)", async () => {
  const src = readFileSync(join(ROOT, "tools", "export_dataset.mjs"), "utf8");
  const ver = +(src.match(/export const SCHEMA_VERSION = (\d+)/)?.[1] ?? NaN);
  ok(ver === RB_SCHEMA.dataset, `RB_SCHEMA.dataset ${RB_SCHEMA.dataset} ≠ export_dataset SCHEMA_VERSION ${ver} — update rb-robotics-data.js and the rollout`);
  const eps = await rbEpisodes({ skills: [1], seeds: 1 });
  const INFO = ["t", "wall", "feedback", "hazard", "operator", "pose", "grasp", "maxForce", "keepOut", "keepOutViolation"];
  if (eps[0]?.episode.schema) { // DATAWORKS' DX schema is in the tree (merged): validate with its own validator.
    const DX = await import("../WebXR/shared/dx-data.js");
    for (const { episode: e } of eps) { const v = DX.dxValidateEpisode(e); ok(v.ok && e.source === "synthetic" && e.consent === null, `${e.scenario}: ${v.errors.join("; ")}`); }
    return `${eps.length} episodes in ${eps[0].episode.schema} ${eps[0].episode.schemaVersion}`;
  }
  for (const { episode: e } of eps) {
    for (const k of ["schemaVersion", "envSchema", "source", "app", "sourceApp", "station", "name", "category", "embodied", "skill", "seed", "crewTagHash", "steps", "summary"]) ok(k in e, `${e.scenario}: ${k} missing`);
    ok(e.schemaVersion === ver && e.source === "synthetic" && e.crewTagHash === null, `${e.scenario}: header`);
    for (const s of e.steps) {
      for (const k of ["observation", "action", "reward", "done", "info"]) ok(k in s, `${e.scenario}: step.${k} missing`);
      for (const k of INFO) ok(k in s.info, `${e.scenario}: info.${k} missing`);
      ok(typeof s.reward === "number", `${e.scenario}: reward not a number`);
    }
    ok(e.steps[e.steps.length - 1].done && e.steps.slice(0, -1).every((s) => !s.done), `${e.scenario}: done flags`);
    ok(["score", "passed", "finished", "keepOutViolations"].every((k) => k in e.summary), `${e.scenario}: summary`);
    JSON.parse(JSON.stringify(e));
  }
  return `${eps.length} episodes, dataset schema v${ver}, env ${RB_SCHEMA.env}`;
});

// 6. Plain data for TQ-BRIDGE.
check("scenario, site and rule data are plain, dependency-free and JSON round-trip", () => {
  const src = readFileSync(join(ROOT, "WebXR", "shared", "rb-robotics-data.js"), "utf8");
  ok(!/^\s*import\s/m.test(src), "rb-robotics-data.js imports something");
  const d = rbSharedData();
  ok(JSON.stringify(JSON.parse(JSON.stringify(d))) === JSON.stringify(d), "not JSON-plain");
  ok(new Set(RB_SCENARIOS.map((s) => s.id)).size === RB_SCENARIOS.length, "duplicate scenario ids");
  for (const sc of RB_SCENARIOS) { ok(skStation(sc.station), `${sc.id}: station ${sc.station} not in the registry`); for (const r of sc.safePractice ?? []) ok(RB_RULES[r], `${sc.id}: rule ${r} undefined`); }
  return `${RB_SCENARIOS.length} scenarios, ${RB_SITES.length} sites, ${Object.keys(RB_RULES).length} rules`;
});

// 7. Sites on dry ground, in bounds, beside real map sites.
check("every robotics site sits beside an existing map site, in bounds and on dry ground (whole pad)", () => {
  const out = [];
  for (const s of RB_SITES) {
    const p = npParish(s.parish); ok(p, `${s.id}: parish ${s.parish} missing`);
    const r = rbSitesFor(p).find((x) => x.id === s.id); ok(r, `${s.id}: anchor ${s.anchor} missing in ${s.parish}`);
    for (const [dx, dz] of [[0, 0], [8, 6], [-8, 6], [8, -6], [-8, -6], [RB_SSM.warn + 1, 0]]) {
      const x = r.position[0] + dx, z = r.position[1] + dz;
      ok(Math.abs(x) < NP_SIZE / 2 && Math.abs(z) < NP_SIZE / 2, `${s.id}: out of bounds`);
      ok(!npWaterAt(p, x, z), `${s.id}: water at (${x}, ${z})`);
      ok(npHeightAt(p, x, z) > -0.5, `${s.id}: below ground at (${x}, ${z})`);
    }
    out.push(s.parish);
  }
  return `${RB_SITES.length} sites on ${new Set(out).size} maps`;
});

// 8. Budgets, with a minimal three stub.
const stubThree = (() => {
  class O { constructor() { this.children = []; this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } }; this.rotation = { x: 0, y: 0, z: 0 }; this.userData = {}; this.name = ""; } add(c) { this.children.push(c); c.parent = this; } }
  const G = class {}; const M = class { constructor(o) { Object.assign(this, o); } };
  return { Group: O, Mesh: class extends O { constructor(g, m) { super(); this.isMesh = true; this.geometry = g; this.material = m; } }, BoxGeometry: G, RingGeometry: G, CylinderGeometry: G, MeshLambertMaterial: M };
})();
check(`budgets: at most ${RB_MESHES_PER_SITE} meshes per site (phone tier ≤ 3), and the robots move, slow and stop`, () => {
  const out = [];
  for (const id of [...new Set(RB_SITES.map((s) => s.parish))]) {
    const p = npParish(id);
    for (const tier of ["balanced", "low"]) {
      const root = new stubThree.Group();
      const w = rbMountRobotics({ three: stubThree, root, parish: p, tier });
      const per = w.meshes / w.sites.length;
      ok(per <= (tier === "low" ? 3 : RB_MESHES_PER_SITE), `${id} ${tier}: ${per} meshes per site`);
      if (tier === "balanced") {
        out.push(`${id} ${w.meshes}`);
        const s = w.sites[0], rig = root.children.find((g) => g.name === s.id).children.find((c) => c.name.startsWith("rb-rig"));
        const snap = () => JSON.stringify([rig.position, rig.rotation]);
        const far = [s.position[0] + 100, s.position[1]];
        const a = snap(); w.animate(1, ...far); ok(snap() !== a, `${id}: the robot does not move`);
        w.animate(0.1, s.position[0] + RB_SSM.warn - 1, s.position[1]); ok(w.state(s.id).mode === "reduced" && w.state(s.id).earned.slowed, `${id}: not slowed in the warning zone`);
        w.animate(0.1, s.position[0] + RB_SSM.stop - 0.2, s.position[1]); const b = snap(); w.animate(1, s.position[0] + RB_SSM.stop - 0.2, s.position[1]);
        ok(w.state(s.id).mode === "stop" && snap() === b, `${id}: the robot does not hold a stop when you are close`);
      }
    }
  }
  return out.join(", ");
});

// 8b. Each site draws its own declared rig (FIXRIG: `rig: null` once overwrote
// the type, so every site drew the same small arm and the AMR and gantry never
// moved). A recording stub keeps geometry arguments and colours, so a rig's
// drawing has a signature; two different types must never share one.
check("rigs: every site draws its declared rig (arm, AMR, gantry, fenced cell), no two types draw identically, and the AMR and gantry travel", () => {
  const recThree = (() => {
    class O { constructor() { this.children = []; this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } }; this.rotation = { x: 0, y: 0, z: 0 }; this.userData = {}; this.name = ""; } add(c) { this.children.push(c); c.parent = this; } }
    const G = (kind) => class { constructor(...a) { this.sig = `${kind}(${a.join(",")})`; } };
    const M = class { constructor(o) { Object.assign(this, o); } };
    return { Group: O, Mesh: class extends O { constructor(g, m) { super(); this.isMesh = true; this.geometry = g; this.material = m; } }, BoxGeometry: G("box"), RingGeometry: G("ring"), CylinderGeometry: G("cyl"), MeshLambertMaterial: M };
  })();
  const COMMON = new Set(["rb-pad", "rb-zone-warn", "rb-zone-stop", "rb-estop"]);
  const MUST = { amr: "rb-amr", gantry: "rb-gantry-beam", cobot: "rb-arm", cell: "rb-cell-arm" };
  const sigs = {}; const travelled = {}; let n = 0;
  for (const s of RB_SITES) ok(RB_RIG_TYPES.includes(s.rig), `${s.id}: declared rig "${s.rig}" is not a known type (${RB_RIG_TYPES.join(", ")})`);
  for (const tier of ["balanced", "low"]) {
    for (const id of [...new Set(RB_SITES.map((s) => s.parish))]) {
      const root = new recThree.Group();
      const w = rbMountRobotics({ three: recThree, root, parish: npParish(id), tier });
      for (const site of w.sites) {
        const decl = RB_SITES.find((x) => x.id === site.id).rig;
        ok(site.rig === decl, `${site.id}: mount reports rig "${site.rig}", RB_SITES declares "${decl}" — the declared rig is ignored`);
        const g = root.children.find((c) => c.name === site.id);
        const rig = g.children.find((c) => c.name.startsWith("rb-rig-"));
        ok(rig && rig.name === `rb-rig-${decl}`, `${site.id}: drew ${rig?.name ?? "no rig"} for declared "${decl}" — the declared rig is ignored`);
        const meshes = [...g.children.filter((c) => c.isMesh && !COMMON.has(c.name)), ...(rig?.children ?? [])];
        ok(meshes.some((m) => m.name === MUST[decl]), `${site.id}: no ${MUST[decl]} mesh for a "${decl}" rig`);
        if (decl === "cell" && tier === "balanced") ok(meshes.some((m) => m.name === "rb-cell-fence"), `${site.id}: a cell without its fence`);
        const sig = meshes.map((m) => `${m.name}:${m.geometry.sig}:${m.material.color}`).sort().join("|");
        const key = `${tier}/${decl}`;
        ok(!sigs[key] || sigs[key] === sig, `${site.id}: two "${decl}" sites draw differently`);
        sigs[key] = sig; n += 1;
        if (tier === "balanced") {
          const p0 = JSON.stringify(rig.position); w.animate(1.3, site.position[0] + 100, site.position[1]);
          travelled[decl] = (travelled[decl] ?? false) || JSON.stringify(rig.position) !== p0;
        }
      }
    }
    const kinds = Object.keys(sigs).filter((k) => k.startsWith(`${tier}/`));
    for (let i = 0; i < kinds.length; i++) for (let j = i + 1; j < kinds.length; j++) ok(sigs[kinds[i]] !== sigs[kinds[j]], `${tier}: rig types ${kinds[i]} and ${kinds[j]} draw identically`);
  }
  const declared = new Set(RB_SITES.map((s) => s.rig));
  for (const k of ["amr", "gantry"]) if (declared.has(k)) ok(travelled[k], `the ${k} rig does not travel (its position never changes)`);
  for (const k of ["cobot", "cell"]) if (declared.has(k)) ok(!travelled[k], `the ${k} arm drifts off its base`);
  return `${n} site draws over 2 tiers; ${declared.size} declared types (${[...declared].sort().join(", ")}) all distinct; AMR and gantry travel`;
});

// 9. Site-visit scoring.
check("site scoring: the full safe visit scores 100; walking in without a lockout scores lower and is flagged", () => {
  const visit = (evs) => { let st = rbSiteState(); for (const [e, d] of evs) st = rbSiteEvent(st, e, d).state; return st; };
  const good = visit([["near", RB_SSM.warn - 1], ["test-estop"], ["press-estop"], ["lockout"], ["enter"], ["restart"]]);
  ok(rbSiteScore(good) === 100, `good visit ${rbSiteScore(good)}`);
  const bad = visit([["near", RB_SSM.warn - 1], ["near", 1], ["enter"], ["press-estop"], ["restart"]]);
  ok(bad.missed["enter-live-cell"] && rbSiteScore(bad) < 50, `bad visit ${rbSiteScore(bad)}`);
  const noLock = visit([["lockout"]]); ok(!noLock.locked, "locked out without a stop");
  ok(rbSsmMode(RB_SSM.stop).mode === "stop" && rbSsmMode(RB_SSM.warn).mode === "reduced" && rbSsmMode(RB_SSM.warn + 0.1).mode === "full", "SSM thresholds");
  return `good ${rbSiteScore(good)}, live-cell entry ${rbSiteScore(bad)}`;
});

// 10. Games in the shared side-game panel.
check("robotics games: register by key into QM_MECHANICS, one safe move per step, no digits, gated on real stations", () => {
  const before = Object.keys(QM_MECHANICS).length;
  rbRegisterMechanics(); rbRegisterMechanics();
  ok(Object.keys(RB_GAME_MECHANICS).every((k) => QM_MECHANICS[k] === RB_GAME_MECHANICS[k]) && Object.keys(QM_MECHANICS).length <= before + Object.keys(RB_GAME_MECHANICS).length, "registration");
  let n = 0;
  for (const id of [...new Set(RB_SITES.map((s) => s.parish))]) for (const g of rbGamesFor(npParish(id))) {
    const steps = qmMechanicSteps(g);
    ok(steps.length >= 3 && steps.every((s) => s.mechanic === g.mechanic), `${g.id}: resolved to ${steps[0]?.mechanic}`);
    for (const s of steps) {
      ok(s.options.filter((o) => o.safe).length === 1, `${g.id}: not exactly one safe move`);
      const text = [...(s.board ?? []), s.prompt, ...s.options.map((o) => o.text)].join(" ");
      ok(!/\d/.test(text), `${g.id}: digit in "${text}"`);
    }
    for (const st of g.gate.stations) ok(skStation(st), `${g.id}: gate station ${st} missing`);
    n += 1;
  }
  return `${n} games on ${new Set(RB_SITES.map((s) => s.parish)).size} maps`;
});

// 11. Kids rule: calm text.
check("Kids rule: no fear framing in any robotics text a learner sees", () => {
  const FEAR = /\b(danger\w*|deadly|death|die[sd]?|kill\w*|crush\w*|injur\w*|hurt\w*|maim\w*|scar(y|e[sd]?)|fear\w*|terrif\w*|amputat\w*|blood\w*)\b/i;
  const texts = [];
  for (const sc of RB_SCENARIOS) texts.push(sc.name, sc.blurb ?? "");
  for (const r of Object.values(RB_RULES)) texts.push(r.text);
  for (const s of RB_SITES) texts.push(s.name);
  for (const m of Object.values(RB_GAME_MECHANICS)) { texts.push(m.name, m.blurb); for (const st of m.build({ id: "rb-kids-probe" })) texts.push(...st.board, st.prompt, ...st.options.map((o) => o.text)); }
  for (const e of ["near", "test-estop", "press-estop", "lockout", "enter", "restart"]) { const r = rbSiteEvent(rbSiteState(), e, 1); if (r.note) texts.push(r.note); }
  const bad = texts.filter((t) => FEAR.test(t));
  ok(!bad.length, `fear framing: ${bad.join(" | ")}`);
  return `${texts.length} strings`;
});

// 12. Bundled.
check("the robotics modules are in tools/bundle_webxr.py's parishes list and the parishes app mounts them", () => {
  const py = readFileSync(join(ROOT, "tools", "bundle_webxr.py"), "utf8");
  for (const f of ["robot.js", "robot-embodiment.js", "rb-robotics-data.js", "rb-env.js", "rb-world.js"]) ok(py.includes(`SHARED / "${f}"`), `${f} not in the bundle lists`);
  const app = readFileSync(join(ROOT, "WebXR", "parishes", "js", "app.js"), "utf8");
  ok(/rbMountRobotics\(/.test(app) && /rbGamesFor\(parish\)/.test(app) && /rbWorld\?\.animate\(/.test(app), "parishes app does not mount/animate the robotics sites");
});

console.log(`\ncheck_robotics: ${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
