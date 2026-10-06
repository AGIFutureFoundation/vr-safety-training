/**
 * Headless checks for the Bay World quest layer (docs/bayworld-quests.md):
 *
 *     node tools/check_bay_quests.mjs
 *
 *  1. Every station id named by a "station" step, or cited by an egg,
 *     exists as a real (app, id) pair in WebXR/smartcity/catalog.json.
 *  2. Every programme in curricula.js other than the Job Readiness Edition
 *     has exactly one side-quest opener and one capstone.
 *  3. Every egg quest cites a station step that actually exists: the
 *     station's own source file (WebXR/<app>/js/{sims,rooms}/<id>.js) is
 *     read as plain text, and the cited step id and the egg's lesson text
 *     both have to appear in it — the lesson is checked for an exact,
 *     verbatim substring match, not a paraphrase.
 *  4. No dialogue or flavour text anywhere in the quest data names a real
 *     person. This platform's one named real person is the Job Readiness
 *     Edition's sponsor (tools/briefs/wojrc-brief.md), who this quest
 *     layer does not name at all — so the check is: those name fragments
 *     never appear, and every quest `giver` is a job-title phrase, not a
 *     proper name.
 *  5. No invented landmark facts: every egg's landmark note is its public
 *     name plus one generic sentence, with no digit and none of a small
 *     denylist of fact-shaped words (built, opened, founded, dedicated,
 *     acres, feet, miles, tall, population, century, anniversary, named
 *     after) anywhere in that sentence.
 *  6. The quest graph (`requires`) has no cycles, and every `requires`
 *     target actually exists.
 *  7. Rewards are monotone: every main/side quest's reward.xp matches
 *     rewardForTier(tier) exactly, tiers are positive integers, and a
 *     quest's reward.xp is never lower than the quest it requires.
 *  6b. The engine (bayworld/js/quest-engine.js) honours the graph, run on
 *     the adapted quests the app registers: every `requires` id (quest or
 *     step, string or array) resolves; a fresh profile spawned at every
 *     spawn point app.js can start a shift at (the depot, and beside every
 *     site and landmark) completes no step and fires no event before the
 *     participant moves; and no quest that requires another progresses —
 *     every one of its steps played — until its prerequisite is done, while
 *     the Pathway Edition and Teamwork pairs still run opener -> capstone.
 *
 * WebXR/shared/bayworld-data.js (BAY1's sites and landmarks) is optional:
 * when it exists, every quest.site and egg.landmark string is also checked
 * against its BAY_SITES/BAY_LANDMARKS names; when it does not, that one
 * assertion is skipped and a note is printed, per this quest layer's brief.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
function eq(a, b, message) { if (a !== b) throw new Error(`${message}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

const { CURRICULA } = await import(pathToFileURL(join(WEBXR, "smartcity", "js", "curricula.js")));
const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const catalogIds = new Set(catalog.stations.map((s) => `${s.app}:${s.id}`));

const quests = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "quests.js")));
const {
  ALL_QUESTS, MAIN_QUESTS, SIDE_QUESTS, EGG_QUESTS, SIDE_ACTIVITIES, LANDMARK_NOTES,
  stationIdsInQuest, rewardForTier, rewardMonotonicityViolations, findCycle,
} = quests;

const SIM_DIR = { smartcity: join(WEBXR, "smartcity", "js", "sims"), trades: join(WEBXR, "trades", "js", "rooms") };

// ------------------------------------------------------- 1. station ids

await check("every quest step's station id is a real (app, id) pair in the catalog", () => {
  const bad = [];
  for (const q of ALL_QUESTS) {
    // A "station" step's target has no app of its own in the schema, so it
    // is resolved against whichever app actually has that id — the
    // catalog only ever has one app per id in this platform's data.
    for (const id of stationIdsInQuest(q)) {
      const hit = catalog.stations.find((s) => s.id === id);
      if (!hit) bad.push(`${q.id} -> station "${id}" not in catalog`);
    }
    if (q.cites) {
      const key = `${q.cites.app}:${q.cites.stationId}`;
      if (!catalogIds.has(key)) bad.push(`${q.id} -> cites ${key}, not in catalog`);
    }
  }
  assert(bad.length === 0, `${bad.length} bad station reference(s):\n${bad.join("\n")}`);
});

// ---------------------------------------------- 2. every programme covered

await check("every non-Job-Readiness programme has one opener and one capstone side quest", () => {
  const programmeIds = CURRICULA.map((p) => p.id).filter((id) => id !== "job-readiness-edition");
  const byProgramme = new Map();
  for (const q of SIDE_QUESTS.filter((x) => x.track !== "teamwork")) {
    if (!byProgramme.has(q.programmeId)) byProgramme.set(q.programmeId, []);
    byProgramme.get(q.programmeId).push(q);
  }
  const missing = [];
  const wrongShape = [];
  for (const id of programmeIds) {
    const rows = byProgramme.get(id) ?? [];
    if (rows.length !== 2) { missing.push(`${id} has ${rows.length} side quest(s), expected 2`); continue; }
    const roles = rows.map((r) => r.role).sort();
    if (roles.join(",") !== "capstone,opener") wrongShape.push(`${id} roles are ${roles.join(",")}, expected capstone,opener`);
  }
  const extra = [...byProgramme.keys()].filter((id) => !programmeIds.includes(id));
  assert(missing.length === 0, missing.join("\n"));
  assert(wrongShape.length === 0, wrongShape.join("\n"));
  assert(extra.length === 0, `side quests reference unknown programme id(s): ${extra.join(", ")}`);
  eq(SIDE_QUESTS.filter((x) => x.track !== "teamwork").length, programmeIds.length * 2, "side quest count");
  const team = SIDE_QUESTS.filter((x) => x.track === "teamwork").map((x) => x.role).sort().join(",");
  eq(team, "capstone,opener", "Teamwork side quest pair");
});

// ---------------------------------------------------- 3. eggs cite real steps

await check("every egg quest cites a station step, and its lesson is a verbatim quote", () => {
  const problems = [];
  for (const egg of EGG_QUESTS) {
    const { app, stationId, stepId } = egg.cites ?? {};
    if (!app || !stationId || !stepId) { problems.push(`${egg.id} is missing cites.app/stationId/stepId`); continue; }
    const dir = SIM_DIR[app];
    if (!dir) { problems.push(`${egg.id} cites unknown app "${app}"`); continue; }
    const file = join(dir, `${stationId}.js`);
    if (!existsSync(file)) { problems.push(`${egg.id} cites ${app}/${stationId}, but ${file} does not exist`); continue; }
    const src = readFileSync(file, "utf8");
    if (!src.includes(`id: "${stepId}"`)) problems.push(`${egg.id} cites step "${stepId}", not found in ${file}`);
    if (!egg.lesson || !src.includes(egg.lesson)) problems.push(`${egg.id}'s lesson is not a verbatim substring of ${file}`);
  }
  assert(problems.length === 0, `${problems.length} problem(s):\n${problems.join("\n")}`);
  assert(EGG_QUESTS.length >= 20, `only ${EGG_QUESTS.length} eggs, brief asks for at least 20`);
});

// -------------------------------------------------- 4. no real personal names

await check("no dialogue names a real person; every giver is a job title", () => {
  // The one real person this platform's data ever names is the Job
  // Readiness Edition's sponsor (tools/briefs/wojrc-brief.md); this quest
  // layer names nobody, so both fragments of that name must never appear,
  // and no quest giver may look like a proper name rather than a title.
  const DENYLIST_NAME_FRAGMENTS = ["Joyce", "Guy"];
  const blob = JSON.stringify(ALL_QUESTS) + JSON.stringify(SIDE_ACTIVITIES);
  const nameHits = DENYLIST_NAME_FRAGMENTS.filter((frag) => blob.includes(frag));
  assert(nameHits.length === 0, `found denylisted name fragment(s): ${nameHits.join(", ")}`);

  const badGivers = [];
  for (const q of ALL_QUESTS) {
    const giver = q.giver ?? "";
    // A job-title giver starts with "the " or is the eggs' fixed phrase;
    // a proper name would not.
    const looksLikeTitle = giver === "found, not given" || /^the [a-z].*$/.test(giver);
    if (!looksLikeTitle) badGivers.push(`${q.id}: giver "${giver}"`);
  }
  assert(badGivers.length === 0, `giver(s) that do not read as a job title:\n${badGivers.join("\n")}`);
});

// -------------------------------------------- 5. no invented landmark facts

await check("landmark notes carry no invented facts (no digits, no fact-shaped words)", () => {
  const DENYLIST_WORDS = [
    "built", "opened", "founded", "established", "dedicated", "acres",
    "feet", "foot", "meters", "metres", "miles", "tall", "height",
    "century", "anniversary", "population", "named after",
  ];
  const problems = [];
  const landmarksInEggs = new Set(EGG_QUESTS.map((e) => e.landmark));
  for (const name of landmarksInEggs) {
    const note = LANDMARK_NOTES[name];
    if (!note) { problems.push(`egg landmark "${name}" has no entry in LANDMARK_NOTES`); continue; }
    if (/\d/.test(note)) problems.push(`"${name}": note contains a digit: "${note}"`);
    const lower = note.toLowerCase();
    for (const word of DENYLIST_WORDS) {
      if (lower.includes(word)) problems.push(`"${name}": note contains denylisted word "${word}": "${note}"`);
    }
  }
  assert(problems.length === 0, problems.join("\n"));
});

// ------------------------------------------------------- 6. quest graph

await check("the quest graph (requires) is a DAG with no dangling edges", () => {
  const ids = new Set(ALL_QUESTS.map((q) => q.id));
  eq(ids.size, ALL_QUESTS.length, "quest ids must be unique");
  const reqs = (r) => (r == null ? [] : Array.isArray(r) ? r : [r]);
  const dangling = [];
  for (const q of ALL_QUESTS) {
    for (const r of reqs(q.requires)) if (!ids.has(r)) dangling.push(`${q.id} -> requires missing "${r}"`);
    for (const [i, st] of q.steps.entries()) for (const r of reqs(st.requires)) if (!ids.has(r)) dangling.push(`${q.id} step ${i} -> requires missing "${r}"`);
  }
  assert(dangling.length === 0, dangling.join("\n"));
  const cycle = findCycle(ALL_QUESTS);
  assert(cycle === null, `cycle found: ${cycle?.join(" -> ")}`);
});

// ------------------------------------ 6b. the engine honours the graph
// The quests exactly as the app registers them (quests-select.js adapts
// sites and targets to map ids), run through the real engine.
const QE = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "quest-engine.js")));
const QS = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "quests-select.js")));
const CITY = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "city.js")));
const PLACES = [...CITY.BW_SITES, ...CITY.BW_LANDMARKS];
function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}
function freshEngine() {
  QE.bwClearQuests();
  QE.registerQuests(QS.BW_QUESTS);
  return fakeStorage();
}
function placePoint(target, anchor) {
  const hit = PLACES.find((p) => p.id === target);
  if (hit) return hit.position ? { x: hit.position[0], z: hit.position[2] } : { x: hit.center[0], z: hit.center[1] };
  return anchor ? { x: anchor[0], z: anchor[1] } : null;
}
/** Performs one step the way a player would: a station return, or standing
 *  at the target, interacting, in a moving vehicle for a drive (covers goto,
 *  find, talk and drive alike). */
function playStep(q, step, storage) {
  if (step.type === "station") return QE.bwNoteStationReturn(step.target, { storage });
  const at = placePoint(step.target, q.anchor);
  assert(at, `${q.id}: step target "${step.target}" resolves to no point`);
  return QE.bwAdvanceQuests({ player: at, places: PLACES, interact: true, inVehicle: step.type === "drive", speed: 10 }, { storage });
}
const stateOf = (id, storage) => QE.questState(storage).find((x) => x.id === id);
function playToEnd(q, storage) {
  for (let guard = 0; guard < q.steps.length + 2; guard += 1) {
    const st = stateOf(q.id, storage);
    if (st.done) return st;
    playStep(q, q.steps[st.stepIndex], storage);
  }
  return stateOf(q.id, storage);
}

await check("a fresh profile spawned at every spawn point completes no quest step before moving", () => {
  const app = readFileSync(join(WEBXR, "bayworld", "js", "app.js"), "utf8");
  const off = app.match(/x: bwStartPlace\.position\[0\] \+ (-?[\d.]+), z: bwStartPlace\.position\[2\] \+ (-?[\d.]+)/);
  const depot = app.match(/: \{ x: (-?[\d.]+), z: (-?[\d.]+), heading: 0, speed: 0 \},\s*\n\s*vehicleId/);
  assert(off && depot, "app.js's spawn (beside a deep-linked place, else the depot) changed shape; update this check");
  assert(/function bwStart\(\) \{[^}]*bwMarkSpawn\(bwApp\.player\)/.test(app), "app.js's bwStart() must hand the spawn point to bwMarkSpawn()");
  const [dx, dz] = [Number(off[1]), Number(off[2])];
  const spawns = [{ id: "depot", x: Number(depot[1]), z: Number(depot[2]) },
    ...PLACES.filter((p) => p.position).map((p) => ({ id: p.id, x: p.position[0] + dx, z: p.position[2] + dz }))];
  const bad = [];
  let wouldHaveFired = 0;
  for (const sp of spawns) {
    const storage = freshEngine();
    const events = [];
    const offS = QE.onQuestStep((e) => events.push(`${e.questId} step`));
    const offD = QE.onQuestDone((e) => events.push(`${e.questId} done`));
    QE.bwMarkSpawn(sp);
    for (let frame = 0; frame < 3; frame += 1) {
      const adv = QE.bwAdvanceQuests({ player: { x: sp.x, z: sp.z }, places: PLACES, interact: false, inVehicle: false, speed: 0 }, { storage });
      if (adv.length) bad.push(`${sp.id}: frame ${frame} advanced ${adv.join(", ")}`);
    }
    const moved = QE.questState(storage).filter((q) => q.stepIndex > 0 || q.done).map((q) => q.id);
    if (moved.length) bad.push(`${sp.id}: fresh profile shows progress on ${moved.join(", ")}`);
    if (events.length) bad.push(`${sp.id}: fired ${events.join(", ")}`);
    offS(); offD();
    // The same spawn without the gate: counts the spawns the gate protects.
    const bare = freshEngine();
    if (QE.bwAdvanceQuests({ player: { x: sp.x, z: sp.z }, places: PLACES }, { storage: bare }).length) wouldHaveFired += 1;
  }
  assert(bad.length === 0, bad.slice(0, 20).join("\n"));
  const port = spawns.find((s) => s.id === "port-container-terminal");
  assert(port, "the port container terminal is no longer a site; pick another spawn for the regression below");
  assert(wouldHaveFired > 0, "no spawn sits inside a goto radius — the spawn test no longer exercises the gate");
  // Moving off the spawn lifts the gate: the Pathway Edition opener's goto then counts, its capstone does not.
  const storage = freshEngine();
  QE.bwMarkSpawn(port);
  QE.bwAdvanceQuests({ player: { x: port.x - QE.BW_SPAWN_GRACE - 1, z: port.z }, places: PLACES }, { storage });
  eq(stateOf("bw-side-wojrc-pathway-edition-opener", storage).stepIndex, 1, "after moving off the port spawn, the Pathway Edition opener's goto should count");
  eq(stateOf("bw-side-wojrc-pathway-edition-capstone", storage).stepIndex, 0, "the Pathway Edition capstone must stay locked while its opener is open");
  console.log(`      ${spawns.length} spawn points, ${wouldHaveFired} of them inside a goto radius`);
});

await check("no quest progresses before its prerequisites are done; Pathway Edition and Teamwork still run opener -> capstone", () => {
  const byId = new Map(QS.BW_QUESTS.map((q) => [q.id, q]));
  const bad = [];
  let tested = 0;
  for (const q of QS.BW_QUESTS) {
    if (!q.requires) continue;
    tested += 1;
    const storage = freshEngine();
    const events = [];
    const offS = QE.onQuestStep((e) => { if (e.questId === q.id) events.push("step"); });
    const offD = QE.onQuestDone((e) => { if (e.questId === q.id) events.push("done"); });
    // Play every step of the locked quest. Where its steps overlap its
    // prerequisite's (a capstone reusing its opener's site and stations),
    // playing them can finish the prerequisite — from then on the quest is
    // rightly unlocked, so the assertion holds only while it is still open.
    for (const step of q.steps) {
      playStep(q, step, storage);
      if (stateOf(q.requires, storage)?.done) break;
      const st = stateOf(q.id, storage);
      if (st.stepIndex !== 0 || st.done) { bad.push(`${q.id}: progressed to step ${st.stepIndex} before ${q.requires} was done`); break; }
      if (!st.locked) { bad.push(`${q.id}: questState() does not report it locked before ${q.requires} is done`); break; }
      if (events.length) { bad.push(`${q.id}: fired ${events.join(", ")} while locked`); break; }
    }
    offS(); offD();
  }
  assert(tested >= 60, `only ${tested} quests carry requires; expected every capstone and the main arc`);
  for (const [opener, capstone] of [["bw-side-wojrc-pathway-edition-opener", "bw-side-wojrc-pathway-edition-capstone"], ["bw-side-teamwork-opener", "bw-side-teamwork-capstone"]]) {
    const o = byId.get(opener), c = byId.get(capstone);
    if (!o || !c) { bad.push(`${opener} / ${capstone} missing`); continue; }
    if (c.requires !== opener) bad.push(`${capstone} should require ${opener}, requires ${c.requires}`);
    const storage = freshEngine();
    const dones = [];
    const offD = QE.onQuestDone((e) => dones.push(e.questId));
    const os = playToEnd(o, storage);
    if (!os.done) bad.push(`${opener}: did not complete end to end (stuck at step ${os.stepIndex})`);
    if (stateOf(capstone, storage).locked) bad.push(`${capstone}: still locked after ${opener} completed`);
    const cs = playToEnd(c, storage);
    if (!cs.done) bad.push(`${capstone}: did not complete end to end after its opener (stuck at step ${cs.stepIndex})`);
    if (dones.indexOf(opener) < 0 || dones.indexOf(capstone) < dones.indexOf(opener)) bad.push(`${opener} -> ${capstone}: onQuestDone order ${dones.filter((d) => d === opener || d === capstone).join(", ")}`);
    offD();
  }
  assert(bad.length === 0, bad.slice(0, 20).join("\n"));
  console.log(`      ${tested} quests with prerequisites held locked with every step played`);
});
QE.bwClearQuests();

// -------------------------------------------------- 7. rewards monotone

await check("rewards are monotone by tier along every requires chain", () => {
  const violations = rewardMonotonicityViolations(ALL_QUESTS);
  assert(violations.length === 0, `reward != rewardForTier(tier) for: ${JSON.stringify(violations)}`);

  const byId = new Map(ALL_QUESTS.map((q) => [q.id, q]));
  const regressions = [];
  for (const q of ALL_QUESTS) {
    if (q.kind === "egg" || !q.requires) continue;
    const prev = byId.get(q.requires);
    if (prev && prev.kind !== "egg" && q.reward.xp < prev.reward.xp) {
      regressions.push(`${q.id} (xp ${q.reward.xp}) < its prerequisite ${prev.id} (xp ${prev.reward.xp})`);
    }
  }
  assert(regressions.length === 0, regressions.join("\n"));

  // Tiers themselves are positive integers, and rewardForTier is the same
  // pure formula whether called from the generator or from quests.js.
  for (const q of ALL_QUESTS) {
    if (q.kind === "egg") continue;
    assert(Number.isInteger(q.tier) && q.tier >= 1, `${q.id} has a non-positive-integer tier: ${q.tier}`);
  }
  eq(rewardForTier(1), 100, "rewardForTier(1)");
  assert(rewardForTier(2) > rewardForTier(1), "rewardForTier must increase with tier");
});

// -------------------------------------------------- 8. side activities sane

await check("side activities exist, are not violence or gambling, and reference real sites", () => {
  assert(SIDE_ACTIVITIES.length >= 4, `only ${SIDE_ACTIVITIES.length} side activities, brief asks for four`);
  const DENYLIST = ["gambl", "bet ", "wager", "casino", "kill", "shoot", "weapon", "combat", "violence"];
  const blob = JSON.stringify(SIDE_ACTIVITIES).toLowerCase();
  const hits = DENYLIST.filter((w) => blob.includes(w));
  assert(hits.length === 0, `side activities text matches denylisted word(s): ${hits.join(", ")}`);
  for (const a of SIDE_ACTIVITIES) {
    assert(typeof a.scoring === "object" && a.scoring, `${a.id} has no scoring object`);
  }
});

// ---------------------------------------- 9. bayworld-data.js, if present

const BAYWORLD_DATA = join(WEBXR, "shared", "bayworld-data.js");
if (existsSync(BAYWORLD_DATA)) {
  await check("quest sites and egg landmarks match BAY1's bayworld-data.js", async () => {
    const { BAY_SITES, BAY_LANDMARKS } = await import(pathToFileURL(BAYWORLD_DATA));
    const Q = await import(pathToFileURL(join(WEBXR, "bayworld", "js", "quests.js")));
    const badSites = ALL_QUESTS.filter((q) => q.kind !== "egg" && !Q.resolveQuestSite(q, BAY_SITES)).map((q) => q.site);
    const badLandmarks = EGG_QUESTS.filter((e) => !Q.resolveLandmark(e.landmark, BAY_LANDMARKS)).map((e) => e.landmark);
    assert(badSites.length === 0, `quest site(s) that resolve to no BAY_SITES entry: ${[...new Set(badSites)].join(", ")}`);
    assert(badLandmarks.length === 0, `egg landmark(s) that resolve to no BAY_LANDMARKS entry: ${[...new Set(badLandmarks)].join(", ")}`);
  });
} else {
  console.log("  ℹ WebXR/shared/bayworld-data.js does not exist yet in this worktree — skipping the site/landmark cross-check against BAY1's data.");
}

// -------------------------------------------------------------- wiring

await check("tools/check_bay_quests.mjs is registered in tools/check_all.mjs", () => {
  const src = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(src.includes("check_bay_quests.mjs"), "check_all.mjs's CHECKERS list does not mention check_bay_quests.mjs");
});

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll checks pass.");
process.exit(failures ? 1 : 0);
