/**
 * Headless checks for the competency and proof-of-training layer
 * (WebXR/shared/competency.js).
 *
 * This is a gate, not a ranking (see tools/briefs/proof-brief.md §Evals): a
 * competency that names a station which does not exist promises a learner a
 * credential they can never earn, and a mastery rule that drifts by one
 * boolean quietly changes what the whole network certifies. Both are facts
 * that must hold, so both fail the build.
 *
 * What it proves:
 *   - every competency's stations exist in the catalogue (both apps),
 *   - `require` is reachable: 1 <= require <= stations.length,
 *   - no duplicate competency ids, and no duplicate station inside one,
 *   - every cited standard resolves, and — once tools/standards.json exists —
 *     resolves against that shared registry too,
 *   - the programme tier still mirrors curricula.js one-for-one,
 *   - the mastery rule's truth table: eight cases, one per way a run can be
 *     judged, including the two boundaries,
 *   - a sample transcript renders, with a near miss carrying its reason,
 *   - the competency badges validate as Open Badges 2.0 against the same
 *     verifier a third party would use (WebXR/verify/verify.js).
 *
 *     node tools/check_competency.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
// Awaited, so a check whose body is async cannot pass by returning a promise
// nobody looked at.
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.message}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };
const assert = (c, m) => { if (!c) throw new Error(m); };

const {
  MASTERY, RUBRIC, STANDARDS, COMPETENCIES, PROGRAMME_COMPETENCIES, CORE_COMPETENCIES,
  standard, standardSlug, isMastery, masteryShortfall, competencyStatus, newlyDemonstrated,
  transcript, toProofCSV, toCompetencyBadges, toCompetencyXAPI, clockText,
} = await import("../WebXR/shared/competency.js");
const { SIMS_META } = await import("../WebXR/smartcity/js/curricula.js").then(() => import("../WebXR/smartcity/js/sims-meta.js"));
const { CURRICULA } = await import("../WebXR/smartcity/js/curricula.js");
const { TRADES_ROOMS } = await import("./lib/headless.mjs");
const { validateAssertion } = await import("../WebXR/verify/verify.js");

// The station vocabulary, from the same generated metadata the hub renders
// from plus the Trade Skills room list — no need to build 200 scenes to know
// which ids exist.
const KNOWN = new Set([...SIMS_META.map((s) => s.id), ...TRADES_ROOMS]);

console.log("Competency and proof of training — self-test\n");

await check(`${COMPETENCIES.length} competencies: every station exists in the catalogue`, () => {
  let named = 0;
  for (const c of COMPETENCIES) {
    for (const id of c.stations) {
      named += 1;
      assert(KNOWN.has(id), `competency "${c.id}" names station "${id}", which does not exist in either app`);
    }
  }
  assert(named > 0, "no stations named at all");
});

await check("require is reachable, and every competency is named and typed", () => {
  for (const c of COMPETENCIES) {
    assert(typeof c.id === "string" && c.id.length > 2, `bad id ${JSON.stringify(c.id)}`);
    assert(typeof c.title === "string" && c.title.length > 8, `competency "${c.id}" has no real title`);
    assert(c.kind === "programme" || c.kind === "core", `competency "${c.id}" has kind ${JSON.stringify(c.kind)}`);
    assert(Array.isArray(c.stations) && c.stations.length > 0, `competency "${c.id}" names no stations`);
    assert(Number.isInteger(c.require) && c.require >= 1, `competency "${c.id}" has require ${c.require}`);
    assert(c.require <= c.stations.length, `competency "${c.id}" requires ${c.require} of ${c.stations.length} stations — unreachable`);
    assert(Array.isArray(c.standards) && c.standards.length > 0, `competency "${c.id}" cites no standard`);
  }
});

await check("no duplicate competency ids, and no station named twice inside one", () => {
  const seen = new Set();
  for (const c of COMPETENCIES) {
    assert(!seen.has(c.id), `duplicate competency id "${c.id}"`);
    seen.add(c.id);
    const stations = new Set();
    for (const id of c.stations) {
      assert(!stations.has(id), `competency "${c.id}" names station "${id}" twice`);
      stations.add(id);
    }
  }
});

await check("every cited standard resolves to a body and a title", () => {
  for (const c of COMPETENCIES) {
    for (const id of c.standards) {
      const s = STANDARDS[id];
      assert(s, `competency "${c.id}" cites unregistered standard "${id}"`);
      assert(s.body && s.title, `standard "${id}" has no body/title`);
      assert(s.source === "verified" || s.source === "unverified", `standard "${id}" has source ${JSON.stringify(s.source)}`);
      eq(s.slug, standardSlug(s.body, s.title), `standard "${id}" slug`);
    }
  }
  // An unknown id must degrade to a placeholder rather than throw, so a
  // competency citing a standard this tree has not registered yet still renders.
  eq(standard("not-a-standard").body, "Unregistered", "unknown standard placeholder");
});

// tools/standards.json is another team's file (see the proof brief). While it
// is absent, the ids above are the slug of body+title, which is the id that
// registry mints for the same standard — so this check turns itself on the
// moment the file lands rather than needing a follow-up commit.
await check("standards cross-check against tools/standards.json when it exists", () => {
  const path = join(ROOT, "tools", "standards.json");
  if (!existsSync(path)) {
    console.log("      tools/standards.json is not in this tree yet — ids are the slug of body+title, checked against each other only");
    return;
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const list = Array.isArray(raw) ? raw : (raw.standards ?? []);
  assert(list.length > 0, "tools/standards.json holds no standards");
  const byId = new Map(list.map((s) => [s.id, s]));
  const bySlug = new Map(list.map((s) => [standardSlug(s.body, s.title), s]));
  const cited = new Set(COMPETENCIES.flatMap((c) => c.standards));
  const missing = [];
  for (const id of cited) {
    const local = STANDARDS[id];
    if (byId.has(id) || bySlug.has(local.slug)) continue;
    missing.push(`${id} (${local.body} ${local.title})`);
  }
  assert(missing.length === 0, `not registered in tools/standards.json:\n      - ${missing.join("\n      - ")}`);
});

await check(`the programme tier still mirrors curricula.js (${CURRICULA.length} programmes)`, () => {
  eq(PROGRAMME_COMPETENCIES.length, CURRICULA.length, "one programme competency per programme");
  for (const p of CURRICULA) {
    const c = PROGRAMME_COMPETENCIES.find((x) => x.id === p.id);
    assert(c, `programme "${p.id}" has no competency — add one to shared/competency.js`);
    const want = p.stations.map((s) => s.id).join(", ");
    const got = c.stations.join(", ");
    eq(got, want, `competency "${c.id}" stations have drifted from the programme`);
  }
  eq(CORE_COMPETENCIES.every((c) => c.kind === "core"), true, "core tier is typed core");
});

// ------------------------------------------------------------ the whole point
//
// Eight cases: the rule satisfied, each of its four conditions broken one at a
// time, both boundary values that decide a close run, and a station that never
// interrupted the learner (nothing to answer is not the same as failing to
// answer).
await check("isMastery() truth table — eight cases", () => {
  const ok = { stars: 3, hazardHits: 0, seconds: 100, parSeconds: 100, interrupts: { answered: 2, wrong: 0, missed: 0 } };
  const cases = [
    ["a clean 3-star run inside par", ok, true, null],
    ["a 2-star run — the floor", { ...ok, stars: 2 }, true, null],
    ["1 star", { ...ok, stars: 1 }, false, "stars"],
    ["one unsafe action", { ...ok, hazardHits: 1 }, false, "unsafe"],
    ["an interruption answered wrongly", { ...ok, interrupts: { answered: 1, wrong: 1, missed: 0 } }, false, "interrupts"],
    ["an interruption missed", { ...ok, interrupts: { answered: 1, wrong: 0, missed: 1 } }, false, "interrupts"],
    ["exactly 1.5x par — the boundary counts", { ...ok, seconds: 150 }, true, null],
    ["a second past 1.5x par", { ...ok, seconds: 151 }, false, "time"],
  ];
  for (const [name, record, want, rule] of cases) {
    eq(isMastery(record), want, `case "${name}"`);
    const shortfall = masteryShortfall(record);
    eq(shortfall?.rule ?? null, rule, `case "${name}" rule`);
    if (!want) assert(shortfall.reason.length > 12, `case "${name}" has no readable reason`);
  }
  // A run nobody interrupted, and a run whose par is unknown: three
  // conditions are still judged, the fourth has nothing to judge.
  eq(isMastery({ stars: 2, hazardHits: 0, seconds: 999, parSeconds: 100 }), false, "no interrupts but over time");
  eq(isMastery({ stars: 2, hazardHits: 0, seconds: 999 }), true, "no par known — the time limit cannot be applied");
  // The rule object and its prose must agree, because the prose is what ships
  // on the badge and the transcript.
  eq(MASTERY.minStars, 2, "MASTERY.minStars");
  eq(MASTERY.maxHazardHits, 0, "MASTERY.maxHazardHits");
  eq(MASTERY.parMultiple, 1.5, "MASTERY.parMultiple");
  for (const bit of ["two or more stars", "zero unsafe actions", "every interruption", "1.5"]) {
    assert(MASTERY.text.includes(bit), `MASTERY.text does not state "${bit}"`);
  }
});

await check("the mastery rule reads a record's own interrupts or its debrief's", () => {
  const base = { stars: 3, hazardHits: 0, seconds: 90, parSeconds: 100 };
  eq(isMastery({ ...base, interrupts: { answered: 1, wrong: 0, missed: 1 } }), false, "top-level interrupts");
  eq(isMastery({ ...base, debrief: { interrupts: { answered: 1, wrong: 0, missed: 1 } } }), false, "debrief interrupts");
});

// The shared record writer must put the tally where the rule looks for it,
// or every record written by the apps would be judged as uninterrupted.
await check("TrainingRecords.record() stores the interruption tally on the record", async () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  const { TrainingRecords } = await import("../WebXR/shared/records.js");
  TrainingRecords.clear();
  const withInterrupts = TrainingRecords.record({
    simId: "valve-vault", stars: 3, hazardHits: 0, seconds: 100, parSeconds: 200,
    debrief: { interrupts: { total: 2, answered: 2, wrong: 0, missed: 0, log: [] } },
  });
  eq(JSON.stringify(withInterrupts.interrupts), JSON.stringify({ answered: 2, wrong: 0, missed: 0 }), "tally lifted from the debrief");
  const quiet = TrainingRecords.record({ simId: "lift-station", stars: 3, hazardHits: 0, seconds: 100, parSeconds: 200 });
  eq(quiet.interrupts, null, "no interruption fired");
  eq(isMastery(withInterrupts), true, "a stored record is judgeable straight from storage");
});

// --------------------------------------------------------------- the artefacts

const SAMPLE = [
  { id: "m1", at: "2026-09-01T09:00:00.000Z", app: "smartcity", simId: "valve-vault", simName: "Valve Vault", learner: "ADA", learnerName: "Ada Lovelace", category: "Water & Environmental", score: 2400, stars: 3, errors: 0, hazardHits: 0, seconds: 180, parSeconds: 240, interrupts: { answered: 2, wrong: 0, missed: 0 }, passed: true },
  { id: "m2", at: "2026-09-02T09:00:00.000Z", app: "smartcity", simId: "lift-station", simName: "Lift Station", learner: "ADA", learnerName: "Ada Lovelace", category: "Water & Environmental", score: 2100, stars: 2, errors: 1, hazardHits: 0, seconds: 300, parSeconds: 260, interrupts: { answered: 1, wrong: 0, missed: 0 }, passed: true },
  { id: "m4", at: "2026-09-02T09:00:00.000Z", app: "smartcity", simId: "manhole-entry-and-atmospheric-monitoring", simName: "Manhole Entry & Atmospheric Monitoring", learner: "ADA", learnerName: "Ada Lovelace", category: "Water & Environmental", score: 2500, stars: 3, errors: 0, hazardHits: 0, seconds: 260, parSeconds: 300, interrupts: { answered: 2, wrong: 0, missed: 0 }, passed: true },
  { id: "n1", at: "2026-09-03T09:00:00.000Z", app: "smartcity", simId: "chlorine-room", simName: "Chlorine Room", learner: "ADA", learnerName: "Ada Lovelace", category: "Water & Environmental", score: 2600, stars: 3, errors: 0, hazardHits: 1, seconds: 210, parSeconds: 250, interrupts: { answered: 1, wrong: 0, missed: 1 }, passed: false },
];

await check("competencyStatus() demonstrates on the require-th station and dates it by the evidence", () => {
  const st = competencyStatus(SAMPLE);
  const cs = st["confined-space"];
  eq(cs.require, 3, "confined-space require — half of five, rounded up");
  eq(cs.stationsMet, 3, "three stations mastered");
  eq(cs.demonstrated, true, "demonstrated");
  eq(cs.consistent, false, "two days is not consistent");
  eq(cs.status, "demonstrated", "status");
  eq(cs.earnedAt, "2026-09-02T09:00:00.000Z", "dated by the third station's mastery run, not by today");
  eq(cs.stations["chlorine-room"].masteryAt, null, "the near miss earned nothing");
  eq(cs.stations["chlorine-room"].best.reason !== null, true, "the near miss carries its reason");
  eq(cs.stations["valve-vault"].best.mastery, true, "best attempt on a mastered station is the mastery run");
  eq(st["core-confined-space"].demonstrated, false, "the core tier asks for three stations, so not yet");
  eq(st["core-confined-space"].stationsMet, 2, "but it counts the two");
});

await check("a third mastery run on a third day turns demonstrated into consistent", () => {
  const plus = [...SAMPLE, {
    id: "m3", at: "2026-09-04T09:00:00.000Z", app: "smartcity", simId: "chlorine-room", simName: "Chlorine Room",
    learner: "ADA", score: 2500, stars: 3, errors: 0, hazardHits: 0, seconds: 200, parSeconds: 250,
    interrupts: { answered: 2, wrong: 0, missed: 0 }, passed: true,
  }];
  const before = competencyStatus(SAMPLE), after = competencyStatus(plus);
  eq(after["confined-space"].consistent, true, "three mastery runs on three days");
  eq(after["confined-space"].status, "consistent", "status");
  eq(after["core-confined-space"].demonstrated, true, "the core tier is reached on the third station");
  // Three runs on the SAME day is not consistency — that is one session.
  const sameDay = SAMPLE.map((r, i) => ({ ...r, at: "2026-09-01T09:00:00.000Z", hazardHits: 0, stars: 3, interrupts: { answered: 1, wrong: 0, missed: 0 }, id: `s${i}` }));
  eq(competencyStatus(sameDay)["confined-space"].consistent, false, "one day, three runs");
  const newly = newlyDemonstrated(before, after);
  assert(newly.includes("core-confined-space"), `newlyDemonstrated should name core-confined-space, got ${newly.join(", ")}`);
  assert(!newly.includes("confined-space"), "confined-space was already demonstrated before");
});

await check("transcript() renders rows with evidence, par ratios and the near miss's reason", () => {
  const rows = transcript(SAMPLE);
  assert(rows.length > 0, "no rows");
  const cs = rows.find((r) => r.competency.id === "confined-space");
  assert(cs, "no confined-space row");
  eq(cs.learner, "Ada Lovelace", "learner");
  eq(cs.status, "demonstrated", "status");
  eq(`${cs.stationsMet}/${cs.require}`, "3/3", "stations met of required");
  assert(cs.standards.length >= 1 && cs.standards[0].body, "standards are named, not just cited by id");
  eq(cs.masteryRule, MASTERY.text, "the rule travels with the row");
  eq(cs.evidence.length, 4, "four attempts on this competency's stations");
  eq(cs.evidence[0].at, "2026-09-03T09:00:00.000Z", "newest evidence first");
  const near = cs.evidence.find((e) => e.attemptId === "n1");
  eq(near.mastery, false, "the near miss did not count");
  eq(near.rule, "unsafe", "and says which rule it broke first");
  assert(/unsafe action/.test(near.reason), `reason should name the unsafe action, got ${near.reason}`);
  const slow = cs.evidence.find((e) => e.attemptId === "m2");
  eq(slow.parRatio, 1.15, "time against par is reported as a ratio");
  eq(clockText(slow.seconds), "5:00", "and readable as a clock");
  // Every row must survive a JSON round trip: it is exported and printed.
  assert(JSON.parse(JSON.stringify(rows)).length === rows.length, "not serialisable");
});

await check("toProofCSV() is RFC 4180 with one line per evidence attempt", () => {
  const rows = transcript(SAMPLE);
  const csv = toProofCSV(rows);
  const lines = csv.split("\r\n");
  eq(lines[0].startsWith("learner,competency,competencyTitle,status"), true, `header: ${lines[0]}`);
  eq(lines[lines.length - 1], "", "trailing CRLF");
  const body = lines.slice(1, -1);
  eq(body.length, rows.reduce((n, r) => n + r.evidence.length, 0), "one line per evidence attempt");
  const nearLine = body.find((l) => l.includes(",n1,"));
  assert(/unsafe action/.test(nearLine), "the near miss's reason reaches the CSV");
  // A quoted cell keeps commas out of the column count.
  assert(csv.includes('"'), "a standard title with a comma should be quoted");
});

await check("toCompetencyBadges() emits Open Badges 2.0 the verifier accepts", () => {
  const badges = toCompetencyBadges(SAMPLE, { homePage: "https://hall.example", learnerId: "al-1815", learnerName: "Ada Lovelace" });
  assert(badges.length > 0, "no assertions for a demonstrated competency");
  const cs = badges.find((b) => b.competency.id === "confined-space");
  assert(cs, `no confined-space assertion (got ${badges.map((b) => b.competency.id).join(", ")})`);
  eq(cs["@context"], "https://w3id.org/openbadges/v2", "context");
  eq(cs.type, "Assertion", "type");
  eq(cs.issuedOn, "2026-09-02T09:00:00.000Z", "issued on the day the evidence completed it");
  eq(cs.recipient.identity, "https://hall.example/learners/al-1815", "recipient");
  // The five things the brief says a competency badge must carry.
  eq(cs.competency.id, "confined-space", "carries the competency");
  assert(cs.badge.alignment.length >= 1 && cs.badge.alignment[0].targetCode, "carries the standards as OB alignments");
  assert(cs.competency.standards.every((s) => s.body && s.title), "standards named with body and title");
  eq(JSON.stringify(cs.competency.stationsDemonstrated), JSON.stringify(["valve-vault", "lift-station", "manhole-entry-and-atmospheric-monitoring"]), "carries the station ids");
  eq(JSON.stringify(cs.competency.attempts), JSON.stringify(["m1", "m2", "m4"]), "carries the attempt ids");
  eq(cs.competency.masteryRule.text, MASTERY.text, "carries the mastery rule text");
  assert(cs.badge.criteria.narrative.includes("two or more stars"), "the criteria narrative states the rule");
  // And it must be a real assertion to anyone outside this repository.
  for (const b of badges) {
    const r = validateAssertion(b, { now: Date.parse("2026-09-22T00:00:00.000Z") });
    assert(r.ok, `assertion for "${b.competency.id}" failed: ${r.checks.filter((c) => !c.ok).map((c) => `${c.name} (${c.note})`).join("; ")}`);
  }
  // Nothing is issued for a competency that is not demonstrated.
  assert(!badges.some((b) => b.competency.id === "core-confined-space"), "an undemonstrated competency must not get a badge");
});

await check("toCompetencyXAPI() emits achieved statements an LRS de-duplicates", () => {
  const { statements } = toCompetencyXAPI(SAMPLE, { homePage: "https://hall.example", learnerId: "al-1815", learnerName: "Ada Lovelace", only: ["confined-space"] });
  eq(statements.length, 1, "only the named competency");
  const st = statements[0];
  eq(st.verb.id, "http://adlnet.gov/expapi/verbs/achieved", "verb");
  eq(st.verb.display["en-US"], "achieved", "verb display");
  eq(st.id, "smartcity-competency-confined-space", "a stable id, so a re-send is not a second achievement");
  eq(st.timestamp, "2026-09-02T09:00:00.000Z", "dated by the evidence");
  eq(st.actor.account.name, "al-1815", "actor account");
  eq(st.object.definition.type, "http://adlnet.gov/expapi/activities/objective", "an objective, not a simulation");
  eq(st.result.success, true, "success");
  const ext = st.result.extensions;
  eq(ext["https://hall.example/xapi/ext/competency"], "confined-space", "competency extension");
  eq(ext["https://hall.example/xapi/ext/mastery-rule"], MASTERY.text, "rule extension");
  eq(JSON.stringify(ext["https://hall.example/xapi/ext/attempts"]), JSON.stringify(["m1", "m2", "m4"]), "attempt ids");
  assert(ext["https://hall.example/xapi/ext/open-badge"]?.type === "Assertion", "the badge rides along");
  assert(ext["https://hall.example/xapi/ext/standards"].every((s) => typeof s === "string" && s.includes("-")), "standards as registry slugs");
  JSON.stringify(statements);
});

// The app announces a newly demonstrated competency two ways: to the
// embedding page, and through the LRS queue. The queue half is the one that
// can silently drop a credential, so it is checked against the real module.
await check("an achieved statement travels through the existing LRS queue", async () => {
  const { Lrs } = await import("../WebXR/shared/lrs.js");
  globalThis.sessionStorage = globalThis.localStorage;
  Lrs.disconnect();
  eq(!!Lrs.configure({ endpoint: "https://lrs.example.org/xapi", auth: "user:secret" }), true, "configured");
  const before = competencyStatus(SAMPLE.slice(0, 1));
  const after = competencyStatus(SAMPLE);
  const earned = newlyDemonstrated(before, after);
  assert(earned.includes("confined-space"), `expected confined-space to be newly demonstrated, got ${earned.join(", ") || "none"}`);
  const { statements } = toCompetencyXAPI(SAMPLE, { homePage: "https://hall.example", only: earned });
  eq(Lrs.enqueue(statements), statements.length, "every statement queued");
  let posted = null;
  const res = await Lrs.flush({
    fetch: async (url, opts) => { posted = { url, body: JSON.parse(opts.body), headers: opts.headers }; return { ok: true, status: 200 }; },
  });
  eq(res.error, null, "flush error");
  eq(res.sent, statements.length, "sent");
  eq(Lrs.pending(), 0, "queue drained");
  eq(posted.url, "https://lrs.example.org/xapi/statements", "posted to the statements endpoint");
  eq(posted.headers["X-Experience-API-Version"], "1.0.3", "xAPI version header");
  eq(posted.body[0].verb.display["en-US"], "achieved", "the verb that reached the LRS");
  // Two ways the same competency avoids being recorded twice: the queue drops
  // a duplicate it is still holding, and — once flushed — the statement id is
  // stable, which is what an LRS de-duplicates on (see shared/lrs.js).
  eq(Lrs.enqueue(statements), statements.length, "re-queued after a flush");
  eq(Lrs.enqueue(statements), 0, "a duplicate already in the queue is dropped");
  const again = toCompetencyXAPI(SAMPLE, { homePage: "https://hall.example", only: earned }).statements;
  eq(again[0].id, statements[0].id, "the statement id is stable across exports");
  Lrs.disconnect();
});

await check("the rubric is read from game.js rather than restated", async () => {
  const game = await import("../WebXR/shared/game.js");
  eq(RUBRIC.stepPoints, game.STEP_POINTS, "step points");
  eq(RUBRIC.wrongStepPenalty, game.WRONG_STEP_PENALTY, "wrong-step penalty");
  eq(RUBRIC.hazardPenalty, game.HAZARD_PENALTY, "hazard penalty");
  eq(RUBRIC.maxCombo, game.MAX_COMBO, "max combo");
  eq(RUBRIC.interruptPoints, game.INTERRUPT_POINTS, "interrupt points");
  eq(RUBRIC.interruptSpeedBonus, game.INTERRUPT_SPEED_BONUS, "interrupt speed bonus");
  assert(RUBRIC.lines.length >= 4, "the rubric should explain score, combo, interruptions and stars");
  for (const [head, body] of RUBRIC.lines) assert(head && body && body.length > 40, `rubric line "${head}" says too little`);
});

const counts = `${COMPETENCIES.length} competencies (${PROGRAMME_COMPETENCIES.length} programme, ${CORE_COMPETENCIES.length} core) · ` +
  `${new Set(COMPETENCIES.flatMap((c) => c.stations)).size} distinct stations · ${Object.keys(STANDARDS).length} standards`;
console.log(failures === 0 ? `\nAll competency checks pass. ${counts}` : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
