/**
 * Headless checks for the robot trainee layer (WebXR/shared/robot.js): a
 * seeded agent is reproducible, an expert passes every room clean, a novice
 * fails more than an expert, trajectories carry observation/action/reward,
 * and the curriculum lands a station inside its target band.
 *
 * Then the embodiment layer (WebXR/shared/robot-embodiment.js) against the
 * fifteen dental stations the Unspoken Smiles programme is built from, because
 * that is where a robot trainee works next to a person's face: every
 * interactable yields a pose, every step that reaches into a patient's
 * keep-out volume declares itself (a forceClass, or noRobot for the steps no
 * robot ever performs), every station has keep-out volumes at all, and an
 * expert embodied run finishes two of them without entering one.
 *
 *     node tools/check_robot.mjs
 */
import { loadTrades, loadSmartCity } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const ok = (v, what) => { if (!v) throw new Error(what); };

console.log("Robot trainees — self-test\n");

const trades = await loadTrades();
trades.Sfx.muted = true;
const build = (suite, room) => room.build(new suite.THREE.Group());

check("an expert (skill 1) passes every Trade Skills room with three stars and no unsafe action", () => {
  for (const room of trades.ROOMS) {
    const { summary } = trades.runEpisode(room, build(trades, room), { skill: 1, seed: 3, SessionClass: trades.Session });
    ok(summary.finished, `${room.id} did not finish`);
    eq(summary.stars, 3, `${room.id} stars`); eq(summary.hazardHits, 0, `${room.id} unsafe actions`); eq(summary.errors, 0, `${room.id} errors`);
  }
});

check("a seeded episode is reproducible decision for decision", () => {
  const room = trades.ROOMS[0];
  const a = trades.runEpisode(room, build(trades, room), { skill: 0.4, seed: 42, SessionClass: trades.Session });
  const b = trades.runEpisode(room, build(trades, room), { skill: 0.4, seed: 42, SessionClass: trades.Session });
  eq(JSON.stringify(a.records.map((r) => r.action)), JSON.stringify(b.records.map((r) => r.action)), "action sequence");
  eq(a.summary.score, b.summary.score, "score");
});

check("trajectories carry observation, action and reward, and rewards sum to the score", () => {
  const room = trades.ROOMS[6];
  const { summary, records, session } = trades.runEpisode(room, build(trades, room), { skill: 0.7, seed: 5, SessionClass: trades.Session });
  ok(records.length > 0, "no records");
  for (const r of records) { ok(r.obs && typeof r.obs.stepIndex === "number", "obs"); ok(r.action?.type, "action"); ok(typeof r.reward === "number", "reward"); }
  // Every point in the final score is some logged record's reward — including
  // the end-of-run bonuses, which land on the decision that finishes the run.
  const sum = records.reduce((n, r) => n + r.reward, 0);
  eq(sum, summary.score, "reward accounting");
  ok((session.timeBonus | 0) > 0, "a finished run has a time bonus to account for");
  ok(records.some((r) => r.obs.kind === "gauge" && r.action.type === "commit"), "gauge commits recorded");
  ok(records.some((r) => r.obs.kind === "hold" || r.obs.kind === "track"), "timed steps recorded");
});

check("a novice (skill 0.15) passes less often and hits more hazards than an expert, over 12 seeds", () => {
  const room = trades.ROOMS[0];
  let novicePass = 0, expertPass = 0, noviceHaz = 0;
  for (let i = 0; i < 12; i++) {
    const n = trades.runEpisode(room, build(trades, room), { skill: 0.15, seed: 100 + i, SessionClass: trades.Session }).summary;
    const e = trades.runEpisode(room, build(trades, room), { skill: 1, seed: 100 + i, SessionClass: trades.Session }).summary;
    novicePass += n.passed ? 1 : 0; expertPass += e.passed ? 1 : 0; noviceHaz += n.hazardHits;
  }
  eq(expertPass, 12, "expert passes"); ok(novicePass < 12, `novice passed ${novicePass}/12`); ok(noviceHaz > 0, "novice never hit a hazard");
});

check("calibrate() finds a skill whose success rate lands in the band, and records the curve", () => {
  const room = trades.ROOMS[1];
  const cal = trades.calibrate(room, build(trades, room), { band: [0.5, 0.9], episodes: 10, seed: 9, SessionClass: trades.Session });
  ok(cal.history.length >= 3, "curve too short");
  ok(cal.optimal.successRate >= 0.5 && cal.optimal.successRate <= 0.9, `optimal ${JSON.stringify(cal.optimal)} outside band`);
  const rates = cal.history.filter((h) => h.skill === 0 || h.skill === 1);
  ok(rates.find((h) => h.skill === 1).successRate >= rates.find((h) => h.skill === 0).successRate, "expert should not do worse than random");
});

const city = await loadSmartCity();
city.Sfx.muted = true;
check("an expert passes every SmartCiti.X station, including the flat briefing, clean", () => {
  for (const room of city.ROOMS) {
    const { summary } = city.runEpisode(room, build(city, room), { skill: 1, seed: 2, SessionClass: city.Session });
    ok(summary.finished, `${room.id} did not finish`);
    eq(summary.hazardHits, 0, `${room.id} unsafe actions`); eq(summary.errors, 0, `${room.id} errors`); ok(summary.stars >= 2, `${room.id} stars ${summary.stars}`);
  }
});

check("drive steps embody as vehicle control: the robot may drive (noRobot false) and may put no force on the world (none)", () => {
  const drivers = city.ROOMS.filter((r) => r.steps.some((st) => st.kind === "drive"));
  ok(drivers.length >= 6, `expected the deep driving stations, found ${drivers.length}`);
  for (const room of drivers) {
    const api = build(city, room);
    const emb = city.buildEmbodiment(room, api, {});
    for (const st of room.steps.filter((x) => x.kind === "drive")) {
      const se = emb.steps[st.id];
      eq(se.grasp, "vehicle-control", `${room.id}/${st.id} grasp`);
      eq(se.noRobot, false, `${room.id}/${st.id} noRobot`);
      eq(se.maxForce, "none", `${room.id}/${st.id} force ceiling`);
      ok(se.drive && se.drive.path.length >= 2 && Array.isArray(se.band), `${room.id}/${st.id} carries its path and band`);
    }
    const { records, summary } = city.runEmbodiedEpisode(room, api, { skill: 1, seed: 4, SessionClass: city.Session });
    ok(summary.finished && summary.keepOutViolations === 0 && summary.hazardHits === 0, `${room.id} embodied expert run`);
    ok(records.some((r) => r.action.type === "drive" && r.obs.drive && typeof r.obs.drive.offset === "number"), `${room.id} trajectories carry drive actions and the drive observation`);
  }
});

// ------------------------------------------------------------- embodiment
//
// The dental programme's own stations, read from curricula.js rather than
// listed again here, so a station joining or leaving the programme is checked
// or dropped without this file being touched.
const DENTAL = CURRICULA.find((c) => c.id === "dental-hygiene-unspoken-smiles")
  .stations.filter((s) => s.app === "smartcity").map((s) => s.id);
const dentalRooms = DENTAL.map((id) => {
  const room = city.ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`the dental programme names a station that does not exist: ${id}`);
  const api = build(city, room);
  return { room, api, emb: city.buildEmbodiment(room, api, {}) };
});
// A zone that stands for the patient, as opposed to the volume around a
// co-worker at the next bench: the patient, the chair they will be in in a
// minute, or a site on them that a step works.
const PATIENT_SOURCES = ["userData.patient", "userData.patientChair", "id"];
const finite = (v) => Array.isArray(v) && v.length === 3 && v.every((n) => Number.isFinite(n));
// Only words that can mean nothing but work inside a mouth or on an airway.
// Prose is not the safety gate — the pose test below is — but a step titled
// "intraoral" that declares nothing is a content bug worth failing on.
const INTRAORAL_TITLE = /\b(intraoral|tongue|gingiva|palate|oropharynx|teeth)\b|in the mouth|the airway/i;

check(`all ${DENTAL.length} dental stations yield a usable pose for every interactable`, () => {
  ok(dentalRooms.length >= 15, `dental stations in the programme: expected at least 15, got ${dentalRooms.length}`);
  for (const { room, api, emb } of dentalRooms) {
    const ids = Object.keys(api.hits);
    ok(ids.length > 0, `${room.id} registered no interactables`);
    eq(emb.missingPoses.length, 0, `${room.id} interactables with no pose: ${emb.missingPoses.join(", ")}`);
    for (const id of ids) {
      const pose = emb.poses[id];
      ok(pose && finite(pose.position), `${room.id}/${id} position`);
      ok(finite(pose.normal), `${room.id}/${id} approach normal`);
      ok(finite(pose.approach), `${room.id}/${id} approach point`);
      ok(Math.abs(Math.hypot(...pose.normal) - 1) < 1e-3, `${room.id}/${id} normal is not a unit vector`);
    }
  }
});

check("every step maps to a grasp and to one of none | light | firm", () => {
  for (const { room, emb } of dentalRooms) {
    for (const id of emb.stepOrder) {
      const se = emb.steps[id];
      ok(se.grasp, `${room.id}/${id} has no grasp`);
      ok(city.FORCE_CLASSES.includes(se.maxForce), `${room.id}/${id} force ${se.maxForce}`);
      if (se.noRobot) { eq(se.maxForce, "none", `${room.id}/${id}: a noRobot step's robot force ceiling`); eq(se.operator, "human", `${room.id}/${id} operator`); }
      if (se.kind === "drag") ok(se.place && se.place.id, `${room.id}/${id} pick-and-place has no drop target`);
      if (se.kind === "turn") ok(se.turns > 0, `${room.id}/${id} wrist rotation has no turn count`);
    }
  }
});

check("every step that reaches into a patient keep-out volume declares itself, and every intraoral step carries noRobot or a forceClass", () => {
  for (const { room, emb } of dentalRooms) {
    const patientZones = new Set(emb.keepOut.filter((z) => PATIENT_SOURCES.includes(z.source)).map((z) => z.id));
    for (const step of room.steps) {
      const se = emb.steps[step.id];
      const declared = !!step.noRobot || !!step.forceClass;
      const reaches = se.targets.filter((t) => t.zone && patientZones.has(t.zone));
      if (reaches.length) ok(declared, `${room.id}/${step.id} reaches ${reaches.map((t) => `${t.id} in ${t.zone}`).join(", ")} with no forceClass and no noRobot`);
      if (INTRAORAL_TITLE.test(step.title)) ok(declared, `${room.id}/${step.id} ("${step.title}") is intraoral and declares neither noRobot nor a forceClass`);
      if (step.noRobot) ok(step.robotNote, `${room.id}/${step.id} is noRobot with no robotNote saying why`);
    }
  }
});

check("every dental station has keep-out volumes, and the ones with a patient have a head volume", () => {
  for (const { room, emb } of dentalRooms) {
    ok(emb.keepOut.length > 0, `${room.id} has no keep-out volumes at all`);
    for (const z of emb.keepOut) {
      ok(finite(z.center) && z.radius > 0, `${room.id}/${z.id} geometry`);
      eq(z.kind, "sphere", `${room.id}/${z.id} kind`);
    }
    if (emb.keepOut.some((z) => z.source === "userData.patient")) {
      ok(emb.keepOut.some((z) => z.part === "head"), `${room.id} has a patient but no head volume`);
    }
  }
});

check("an expert embodied episode on operatory-turnover and ultrasonic-scaling finishes with zero keep-out violations", () => {
  for (const id of ["operatory-turnover", "ultrasonic-scaling"]) {
    const { room, api } = dentalRooms.find((d) => d.room.id === id);
    for (const seed of [1, 2, 3]) {
      const { summary, records } = city.runEmbodiedEpisode(room, api, { skill: 1, seed, SessionClass: city.Session });
      ok(summary.finished, `${id} did not finish (seed ${seed})`);
      eq(summary.keepOutViolations, 0, `${id} keep-out violations (seed ${seed})`);
      eq(summary.hazardHits, 0, `${id} unsafe actions (seed ${seed})`);
      ok(summary.passed, `${id} did not pass (seed ${seed})`);
      // Nothing on a noRobot step is ever attributed to the robot, and every
      // robot decision carries the body: a pose, a grasp and a force ceiling.
      for (const r of records) {
        if (r.operator === "human") { ok(!r.pose && !r.grasp, `${id}: a handed-off decision carries robot fields`); continue; }
        ok(r.obs && typeof r.obs.stepIndex === "number", `${id} observation`);
        if (r.action.type !== "release" && r.action.type !== "wait") {
          ok(r.pose && finite(r.pose.position), `${id} pose on ${r.action.type}`);
          ok(r.grasp && r.maxForce, `${id} grasp/force on ${r.action.type}`);
          ok(r.keepOut && typeof r.keepOut.authorised === "boolean", `${id} keep-out account`);
        }
      }
    }
  }
});

check("a noRobot step is handed over rather than attempted, and a novice's wrong reach into a person is caught", () => {
  const { room, api, emb } = dentalRooms.find((d) => d.room.id === "ultrasonic-scaling");
  ok(emb.noRobotSteps.length > 0, "ultrasonic-scaling declares no off-limits steps");
  const offLimits = new Set(emb.noRobotSteps.map((s) => s.id));
  const { records } = city.runEmbodiedEpisode(room, api, { skill: 1, seed: 7, SessionClass: city.Session });
  for (const r of records) {
    // A live alarm is the exception and it is the right one: the step underneath
    // may be the clinician's, and answering the alarm is not that step — it is a
    // reach for a control across the room, which the robot is there to do.
    if (offLimits.has(r.obs?.stepId) && !r.obs?.interrupt) eq(r.operator, "human", `${r.obs.stepId} was attempted by the robot`);
  }
  // Skill is what keeps an arm out of a face: over a spread of seeds a novice
  // reaches somewhere it should not, and an expert never does — across all
  // fifteen stations, not just the two the check above names.
  let novice = 0, expert = 0;
  for (let i = 0; i < 10; i++) {
    for (const d of dentalRooms) {
      novice += city.runEmbodiedEpisode(d.room, d.api, { skill: 0.1, seed: 500 + i, trajectory: false, SessionClass: city.Session }).summary.keepOutViolations;
      expert += city.runEmbodiedEpisode(d.room, d.api, { skill: 1, seed: 500 + i, trajectory: false, SessionClass: city.Session }).summary.keepOutViolations;
    }
  }
  eq(expert, 0, "keep-out violations by an expert across every dental station");
  ok(novice > 0, "a novice never once reached into a keep-out volume, which cannot be right");
});

check("an embodied episode is reproducible pose for pose, and the difficulty curve is data", () => {
  // A station with no `track` step: the engine seeds a track's wobble from
  // Math.random(), so a run containing one is reproducible in its decisions and
  // not tick for tick. Everything else here is seeded and exact.
  const { room, api } = dentalRooms.find((d) => d.room.id === "patient-intake-screening");
  const a = city.runEmbodiedEpisode(room, api, { skill: 0.55, seed: 21, SessionClass: city.Session });
  const b = city.runEmbodiedEpisode(room, api, { skill: 0.55, seed: 21, SessionClass: city.Session });
  eq(JSON.stringify(a.records.map((r) => [r.action, r.pose])), JSON.stringify(b.records.map((r) => [r.action, r.pose])), "decision and pose sequence");
  const probe = city.probeSkill(room, api, { skill: 0.35, episodes: 4, seed: 4, SessionClass: city.Session });
  ok(probe.successRate >= 0 && probe.successRate <= 1 && probe.keepOutViolations >= 0, "probe shape");
  const cal = city.calibrateEmbodied(room, api, { band: [0.5, 0.9], episodes: 4, seed: 5, SessionClass: city.Session });
  ok(cal.history.length >= city.DIFFICULTY_LADDER.length, "difficulty curve too short");
  ok(cal.history.every((h) => h.skill >= 0 && h.skill <= 1), "curve skills out of range");
  ok(cal.optimal && typeof cal.optimal.successRate === "number", "no optimal skill");
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll robot-trainee checks pass.");
process.exit(failures ? 1 : 0);
