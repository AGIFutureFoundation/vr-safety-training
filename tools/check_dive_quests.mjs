/**
 * Headless checks for The Deep's dive quest layer (WebXR/underwater/js/
 * dives.js and the generated dives-data.js), mirroring
 * tools/check_bay_quests.mjs:
 *
 *     node tools/check_dive_quests.mjs
 *
 *  1. Every station id a "station" step names, or a lantern egg cites, is a
 *     real (app, id) pair in WebXR/smartcity/catalog.json.
 *  2. Every programme a DEEP_SITES entry anchors has exactly one opener and
 *     one capstone side dive, and no side dive names a programme the seabed
 *     does not anchor.
 *  3. Every lantern egg cites a station step that exists, and its lesson is
 *     a verbatim substring of that station's own source file.
 *  4. Every giver is a job title, never a name; the one real person this
 *     platform's data names anywhere never appears here.
 *  5. Landmark notes carry no invented fact: no digit and none of the
 *     fact-shaped words.
 *  6. The dive graph (`requires`) is a DAG with no dangling edge.
 *  7. Rewards are monotone: reward.xp is dvRewardForTier(tier) and never
 *     lower than the dive it requires.
 *  8. There are at least six main dives, at least twenty lantern eggs and
 *     four activities; no activity is violence or gambling.
 *  9. No depth, gas, decompression or current LIMIT is stated as a figure
 *     anywhere in the dive text: no digit followed by a depth or time unit,
 *     and no "no deeper than"-shaped phrase.
 * 10. Every dive site and egg landmark resolves against the seabed the game
 *     reads (WebXR/underwater/js/seabed.js).
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const UW = join(WEBXR, "underwater", "js");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
function eq(a, b, message) { if (a !== b) throw new Error(`${message}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }

const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
const catalogIds = new Set(catalog.stations.map((s) => `${s.app}:${s.id}`));
const D = await import(pathToFileURL(join(UW, "dives.js")));
const S = await import(pathToFileURL(join(UW, "seabed.js")));
const { DV_ALL_DIVES, DV_MAIN_DIVES, DV_SIDE_DIVES, DV_EGG_DIVES, DV_ACTIVITIES, DV_LANDMARK_NOTES, dvStationIdsInDive, dvRewardForTier, dvRewardMonotonicityViolations, dvFindCycle } = D;
const SIM_DIR = { smartcity: join(WEBXR, "smartcity", "js", "sims"), trades: join(WEBXR, "trades", "js", "rooms") };

console.log("The Deep — dive quest layer self-test\n");

await check("every station id a dive step names or an egg cites is a real (app, id) pair in the catalog", () => {
  const bad = [];
  for (const q of DV_ALL_DIVES) {
    for (const id of dvStationIdsInDive(q)) if (!catalog.stations.find((s) => s.id === id)) bad.push(`${q.id} -> station "${id}" not in catalog`);
    if (q.cites && !catalogIds.has(`${q.cites.app}:${q.cites.stationId}`)) bad.push(`${q.id} -> cites ${q.cites.app}:${q.cites.stationId}, not in catalog`);
  }
  assert(bad.length === 0, `${bad.length} bad station reference(s):\n${bad.join("\n")}`);
});

await check("every programme the seabed's sites anchor has one opener and one capstone side dive", () => {
  const anchored = [...new Set(S.DV_SITES.flatMap((s) => s.programmes))];
  const byProgramme = new Map();
  for (const q of DV_SIDE_DIVES) { if (!byProgramme.has(q.programmeId)) byProgramme.set(q.programmeId, []); byProgramme.get(q.programmeId).push(q); }
  const problems = [];
  for (const id of anchored) {
    const rows = byProgramme.get(id) ?? [];
    if (rows.length !== 2) { problems.push(`${id} has ${rows.length} side dive(s), expected 2`); continue; }
    if (rows.map((r) => r.role).sort().join(",") !== "capstone,opener") problems.push(`${id} roles are not capstone,opener`);
  }
  const extra = [...byProgramme.keys()].filter((id) => !anchored.includes(id));
  assert(problems.length === 0, problems.join("\n"));
  assert(extra.length === 0, `side dives name programme(s) the seabed does not anchor: ${extra.join(", ")}`);
  eq(DV_SIDE_DIVES.length, anchored.length * 2, "side dive count");
});

await check("every lantern egg cites a real station step and its lesson is a verbatim quote", () => {
  const problems = [];
  for (const egg of DV_EGG_DIVES) {
    const { app, stationId, stepId } = egg.cites ?? {};
    if (!app || !stationId || !stepId) { problems.push(`${egg.id} is missing cites`); continue; }
    const file = join(SIM_DIR[app] ?? "", `${stationId}.js`);
    if (!SIM_DIR[app] || !existsSync(file)) { problems.push(`${egg.id} cites ${app}/${stationId}, but its source file does not exist`); continue; }
    const src = readFileSync(file, "utf8");
    if (!src.includes(`id: "${stepId}"`)) problems.push(`${egg.id} cites step "${stepId}", not found in ${stationId}.js`);
    if (!egg.lesson || !src.includes(egg.lesson)) problems.push(`${egg.id}'s lesson is not a verbatim substring of ${stationId}.js`);
    if (!["lantern", "comms"].includes(egg.method)) problems.push(`${egg.id} has an unknown method "${egg.method}"`);
  }
  assert(problems.length === 0, `${problems.length} problem(s):\n${problems.join("\n")}`);
  assert(DV_EGG_DIVES.length >= 20, `only ${DV_EGG_DIVES.length} lantern eggs, the brief asks for at least 20`);
});

await check("no dialogue names a real person; every giver is a job title", () => {
  const DENYLIST_NAME_FRAGMENTS = ["Joyce", "Guy"];
  const blob = JSON.stringify(DV_ALL_DIVES) + JSON.stringify(DV_ACTIVITIES);
  const hits = DENYLIST_NAME_FRAGMENTS.filter((frag) => blob.includes(frag));
  assert(hits.length === 0, `found denylisted name fragment(s): ${hits.join(", ")}`);
  const bad = DV_ALL_DIVES.filter((q) => !(q.giver === "found, not given" || /^the [a-z].*$/.test(q.giver ?? ""))).map((q) => `${q.id}: giver "${q.giver}"`);
  assert(bad.length === 0, `giver(s) that do not read as a job title:\n${bad.join("\n")}`);
});

await check("landmark notes carry no invented facts (no digits, no fact-shaped words)", () => {
  const DENY = ["built", "opened", "founded", "established", "dedicated", "acres", "feet", "foot", "meters", "metres", "miles", "tall", "height", "century", "anniversary", "population", "named after", "species"];
  const problems = [];
  for (const name of new Set(DV_EGG_DIVES.map((e) => e.landmark))) {
    const note = DV_LANDMARK_NOTES[name];
    if (!note) { problems.push(`egg landmark "${name}" has no note`); continue; }
    if (/\d/.test(note)) problems.push(`"${name}": note contains a digit`);
    for (const w of DENY) if (note.toLowerCase().includes(w)) problems.push(`"${name}": note contains "${w}"`);
  }
  assert(problems.length === 0, problems.join("\n"));
});

await check("the dive graph (requires) is a DAG with no dangling edges, and ids are unique", () => {
  const ids = new Set(DV_ALL_DIVES.map((q) => q.id));
  eq(ids.size, DV_ALL_DIVES.length, "dive ids must be unique");
  const dangling = DV_ALL_DIVES.filter((q) => q.requires && !ids.has(q.requires)).map((q) => q.id);
  assert(dangling.length === 0, `dangling requires: ${dangling.join(", ")}`);
  const cycle = dvFindCycle(DV_ALL_DIVES);
  assert(cycle === null, `cycle found: ${cycle?.join(" -> ")}`);
});

await check("rewards are monotone by tier along every requires chain", () => {
  const violations = dvRewardMonotonicityViolations(DV_ALL_DIVES);
  assert(violations.length === 0, `reward != dvRewardForTier(tier) for: ${JSON.stringify(violations)}`);
  const byId = new Map(DV_ALL_DIVES.map((q) => [q.id, q]));
  for (const q of DV_ALL_DIVES) {
    if (q.kind === "egg" || !q.requires) continue;
    const prev = byId.get(q.requires);
    assert(!prev || q.reward.xp >= prev.reward.xp, `${q.id} pays less than its prerequisite ${prev?.id}`);
  }
  for (const q of DV_ALL_DIVES) if (q.kind !== "egg") assert(Number.isInteger(q.tier) && q.tier >= 1, `${q.id} has a bad tier`);
  eq(dvRewardForTier(1), 100, "dvRewardForTier(1)");
  assert(dvRewardForTier(2) > dvRewardForTier(1), "dvRewardForTier must increase with tier");
});

await check("six main dives from the pilings to the seamount, four activities, none violence or gambling", () => {
  assert(DV_MAIN_DIVES.length >= 6, `only ${DV_MAIN_DIVES.length} main dives, the brief asks for six`);
  assert(/pier|pil/i.test(DV_MAIN_DIVES[0].site) && /pinnacle|seamount/i.test(DV_MAIN_DIVES[DV_MAIN_DIVES.length - 1].site), "the main arc should run from the pier pilings to the seamount");
  for (let i = 1; i < DV_MAIN_DIVES.length; i++) eq(DV_MAIN_DIVES[i].requires, DV_MAIN_DIVES[i - 1].id, `main dive ${i} should require the one before it`);
  assert(DV_ACTIVITIES.length >= 4, `only ${DV_ACTIVITIES.length} activities, the brief asks for four`);
  eq(new Set(DV_ACTIVITIES.map((a) => a.kind)).size, 4, "the four activities should be four different kinds");
  // Whole words, so an eelgrass "shoot" bundled for transplant never reads as violence.
  const DENY = [/gambl/i, /\bbets?\b/i, /wager/i, /casino/i, /\bkill(ed|ing|s)?\b/i, /\bshoot(ing)?\b/i, /\bweapons?\b/i, /\bcombat\b/i, /\bviolen/i, /\bspear(gun|s|fishing)?\b/i];
  const blob = JSON.stringify(DV_ACTIVITIES) + JSON.stringify(DV_ALL_DIVES);
  const hits = DENY.filter((re) => re.test(blob)).map(String);
  assert(hits.length === 0, `dive text matches denylisted word(s): ${hits.join(", ")}`);
  for (const a of DV_ACTIVITIES) assert(a.scoring && typeof a.scoring === "object", `${a.id} has no scoring object`);
});

await check("no depth, gas, decompression or current limit is stated as a figure in any dive text", () => {
  const texts = DV_ALL_DIVES.flatMap((q) => [q.title, ...q.steps.map((s) => s.text)]).concat(DV_ACTIVITIES.map((a) => a.description));
  const LIMIT_SHAPES = [/\d+\s*(m|ft|feet|metres|meters|msw|fsw)\b/i, /\d+\s*(min|minutes)\s+(bottom|no-?deco)/i, /no deeper than/i, /max(imum)? depth/i, /\d+\s*(bar|psi)\b/i, /\d+\s*(knots?)\b/i];
  const hits = [];
  for (const t of texts) for (const re of LIMIT_SHAPES) if (re.test(t ?? "")) hits.push(`${re}: ${t.slice(0, 80)}`);
  assert(hits.length === 0, `limit-shaped figure(s) in dive text:\n${hits.join("\n")}`);
});

await check("every dive site and egg landmark resolves against the seabed the game reads", () => {
  const badSites = DV_ALL_DIVES.filter((q) => q.kind !== "egg" && !D.dvResolveDiveSite(q, S.DV_SITES)).map((q) => q.site);
  const badLandmarks = DV_EGG_DIVES.filter((e) => !D.dvResolveLandmark(e.landmark, S.DV_LANDMARKS)).map((e) => e.landmark);
  assert(badSites.length === 0, `dive site(s) that resolve to no seabed site: ${[...new Set(badSites)].join(", ")}`);
  assert(badLandmarks.length === 0, `egg landmark(s) that resolve to no seabed landmark: ${[...new Set(badLandmarks)].join(", ")}`);
  eq(new Set(DV_EGG_DIVES.map((e) => e.landmark)).size, DV_EGG_DIVES.length, "every lantern should hang at its own landmark");
});

await check("tools/check_dive_quests.mjs is registered in tools/check_all.mjs and the data file is generated", () => {
  const all = readFileSync(join(ROOT, "tools", "check_all.mjs"), "utf8");
  assert(all.includes("check_dive_quests.mjs"), "check_all.mjs does not run check_dive_quests.mjs");
  const data = readFileSync(join(UW, "dives-data.js"), "utf8");
  assert(data.includes("GENERATED FILE") && data.includes("gen_dive_quests.mjs"), "dives-data.js does not carry the generator's header");
});

console.log(failures ? `\n${failures} check(s) failed.` : `\nAll dive quest checks pass: ${DV_MAIN_DIVES.length} main dives, ${DV_SIDE_DIVES.length} side dives, ${DV_EGG_DIVES.length} lantern eggs, ${DV_ACTIVITIES.length} activities.`);
process.exit(failures ? 1 : 0);
