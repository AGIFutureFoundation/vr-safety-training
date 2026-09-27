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
  for (const q of SIDE_QUESTS) {
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
  eq(SIDE_QUESTS.length, programmeIds.length * 2, "side quest count");
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
  const dangling = ALL_QUESTS.filter((q) => q.requires && !ids.has(q.requires)).map((q) => `${q.id} -> requires missing "${q.requires}"`);
  assert(dangling.length === 0, dangling.join("\n"));
  const cycle = findCycle(ALL_QUESTS);
  assert(cycle === null, `cycle found: ${cycle?.join(" -> ")}`);
});

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
    const siteNames = new Set((BAY_SITES ?? []).map((s) => s.name));
    const landmarkNames = new Set((BAY_LANDMARKS ?? []).map((l) => l.name));
    const badSites = [...new Set(ALL_QUESTS.filter((q) => q.kind !== "egg").map((q) => q.site))].filter((s) => !siteNames.has(s));
    const badLandmarks = [...new Set(EGG_QUESTS.map((e) => e.landmark))].filter((l) => !landmarkNames.has(l));
    assert(badSites.length === 0, `quest site(s) not in BAY_SITES: ${badSites.join(", ")}`);
    assert(badLandmarks.length === 0, `egg landmark(s) not in BAY_LANDMARKS: ${badLandmarks.join(", ")}`);
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
