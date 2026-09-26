/**
 * Headless checks for the training-records layer (WebXR/shared/records.js):
 * the pass rule, the append/cap behaviour, the per-category summary, and the
 * CSV and xAPI export shapes an HR system or Learning Record Store would
 * actually parse.
 *
 * Also covers the course-tracking layer built on top of it
 * (WebXR/shared/tracking.js — docs/course-tracking.md): My Training's
 * levels/lessons/time-on-task maths against a small fixture ladder (never
 * the real 30-programme catalog), the refresher-due rule and its platform
 * default, the streak calculation, the transcript's JSON round-trip and its
 * printable HTML, instructor sign-offs stored and rendered as "instructor
 * attestation", and the accountability gamification (streak/refresher XP,
 * clean-run badge tiers, the hazard-free-week badge, the lessons-completed
 * leaderboard).
 *
 *     node tools/check_records.mjs
 */

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { TrainingRecords, passed, toCSV, toXAPI, isoDuration, earnedCertifications, toOpenBadges } = await import("../WebXR/shared/records.js");
const Tracking = await import("../WebXR/shared/tracking.js");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log("Training records — self-test\n");

check("pass rule: 2+ stars with no unsafe action passes; any unsafe action fails", () => {
  eq(passed({ stars: 3, hazardHits: 0 }), true, "3★ clean");
  eq(passed({ stars: 2, hazardHits: 0 }), true, "2★ clean");
  eq(passed({ stars: 1, hazardHits: 0 }), false, "1★");
  eq(passed({ stars: 3, hazardHits: 1 }), false, "3★ but one unsafe action");
});

check("record() stamps id/at/passed and list() returns oldest first", () => {
  TrainingRecords.clear();
  const a = TrainingRecords.record({ app: "smartcity", simId: "charge-point", simName: "Charge Point", category: "Energy & Power", stars: 3, hazardHits: 0, score: 2300, errors: 0, seconds: 90 });
  const b = TrainingRecords.record({ app: "smartcity", simId: "valve-vault", simName: "Valve Vault", category: "Water & Environmental", stars: 1, hazardHits: 2, score: 900, errors: 3, seconds: 300 });
  if (!a.id || !a.at || !/^\d{4}-\d{2}-\d{2}T/.test(a.at)) throw new Error("missing id/ISO timestamp");
  eq(a.passed, true, "a.passed"); eq(b.passed, false, "b.passed");
  const list = TrainingRecords.list();
  eq(list.length, 2, "count"); eq(list[0].simId, "charge-point", "order");
});

check("summary() rolls up attempts, passes and distinct stations per category", () => {
  TrainingRecords.record({ app: "smartcity", simId: "charge-point", category: "Energy & Power", stars: 2, hazardHits: 0, score: 1500, errors: 1, seconds: 120 });
  const s = Object.fromEntries(TrainingRecords.summary().map((x) => [x.category, x]));
  eq(s["Energy & Power"].attempts, 2, "energy attempts");
  eq(s["Energy & Power"].passes, 2, "energy passes");
  eq(s["Energy & Power"].stations, 1, "energy distinct stations");
  eq(s["Energy & Power"].bestStars, 3, "energy best stars");
  eq(s["Water & Environmental"].passes, 0, "water passes");
});

check("toCSV() is RFC 4180: header row, quoted commas/quotes, CRLF", () => {
  const csv = toCSV([{ at: "2026-01-01T00:00:00Z", learner: 'A "B", C', simId: "x", badges: ["p", "q"], score: 10, stars: 3, passed: true }]);
  const [header, row, tail] = csv.split("\r\n");
  if (!header.startsWith("at,learner,learnerName,learnerId,homePage,app,simId")) throw new Error(`bad header: ${header}`);
  if (!row.includes('"A ""B"", C"')) throw new Error(`quoting failed: ${row}`);
  if (!row.includes("p; q")) throw new Error(`array cell failed: ${row}`);
  eq(tail, "", "trailing CRLF");
});

check("isoDuration() formats whole seconds as ISO 8601", () => {
  eq(isoDuration(0), "PT0S", "0"); eq(isoDuration(59), "PT59S", "59");
  eq(isoDuration(125), "PT2M5S", "125"); eq(isoDuration(3600), "PT1H", "3600"); eq(isoDuration(3661), "PT1H1M1S", "3661");
});

check("toXAPI() emits well-formed 1.0.3 statements with passed/failed verbs", () => {
  const list = TrainingRecords.list();
  const { statements } = toXAPI(list, { actorName: "CREW", homePage: "https://example.test" });
  eq(statements.length, list.length, "one statement per record");
  const st = statements[0];
  eq(st.actor.objectType, "Agent", "actor type");
  eq(st.actor.account.homePage, "https://example.test", "account homePage");
  eq(st.verb.id, "http://adlnet.gov/expapi/verbs/passed", "passed verb");
  eq(statements[1].verb.id, "http://adlnet.gov/expapi/verbs/failed", "failed verb");
  eq(st.object.id, "https://example.test/smartcity/charge-point", "activity id");
  eq(st.object.definition.type, "http://adlnet.gov/expapi/activities/simulation", "activity type");
  eq(st.result.success, true, "result.success"); eq(st.result.duration, "PT1M30S", "duration");
  eq(st.result.extensions["https://example.test/xapi/ext/stars"], 3, "stars extension");
  eq(st.context.extensions["https://example.test/xapi/ext/category"], "Energy & Power", "category extension");
  JSON.stringify(statements); // must be serialisable
});

check("toXAPI() uses a launch identity as the actor account when the record carries one", () => {
  const { statements } = toXAPI([
    { id: "r1", at: "2026-01-01T00:00:00Z", learner: "ADA", learnerName: "Ada Lovelace", learnerId: "al-1815", homePage: "https://lms.example.org", simId: "x", app: "smartcity", stars: 3, hazardHits: 0, passed: true, score: 1, seconds: 1 },
    { id: "r2", at: "2026-01-01T00:00:00Z", learner: "YOU", simId: "x", app: "smartcity", stars: 3, hazardHits: 0, passed: true, score: 1, seconds: 1 },
  ], { homePage: "https://deploy.example" });
  eq(statements[0].actor.name, "Ada Lovelace", "display name");
  eq(statements[0].actor.account.name, "al-1815", "account id"); eq(statements[0].actor.account.homePage, "https://lms.example.org", "account home");
  eq(statements[0].object.id, "https://deploy.example/smartcity/x", "activity still scoped to the deployment");
  eq(statements[1].actor.account.homePage, "https://deploy.example", "fallback home"); eq(statements[1].actor.account.name, "YOU", "fallback account");
});

check("earnedCertifications() keeps the latest pass per certification; toOpenBadges() emits OB 2.0 assertions", () => {
  const list = [
    { id: "r1", at: "2026-09-01T10:00:00.000Z", app: "smartcity", simId: "charge-point", simName: "Charge Point", category: "Energy & Power", trade: "EV service technician", certification: "IBEW — NFPA 70E", passed: true, stars: 3, score: 2300, seconds: 90, parSeconds: 205 },
    { id: "r2", at: "2026-09-02T10:00:00.000Z", app: "smartcity", simId: "charge-point", simName: "Charge Point", category: "Energy & Power", certification: "IBEW — NFPA 70E", passed: false, stars: 1 },
    { id: "r3", at: "2026-09-03T10:00:00.000Z", app: "smartcity", simId: "charge-point", simName: "Charge Point", category: "Energy & Power", certification: "IBEW — NFPA 70E", passed: true, stars: 2, score: 1900, seconds: 120, parSeconds: 205, learnerId: "al-1815", learnerName: "Ada Lovelace", homePage: "https://lms.example.org" },
    { id: "r4", at: "2026-09-04T10:00:00.000Z", app: "trades", simId: "paint-sprayer", simName: "Coatings Bay", category: "Surface Prep & Coatings", certification: "IUPAT — coatings applicator", passed: true, stars: 3, score: 2500, seconds: 60, parSeconds: 240 },
  ];
  const certs = earnedCertifications(list);
  eq(certs.length, 2, "two distinct certifications");
  eq(certs[0].id, "r4", "newest first"); eq(certs[1].id, "r3", "latest pass, not the first");
  const ob = toOpenBadges(list, { homePage: "https://sim.example.org" });
  eq(ob.length, 2, "one assertion per certification");
  const a = ob.find((x) => x.id.endsWith("/r3"));
  eq(a["@context"], "https://w3id.org/openbadges/v2", "context"); eq(a.type, "Assertion", "type");
  eq(a.id, "https://lms.example.org/credentials/r3", "assertion id under the learner's home");
  eq(a.recipient.identity, "https://lms.example.org/learners/al-1815", "recipient from launch identity");
  eq(a.badge.type, "BadgeClass", "badge class"); eq(a.badge.issuer.type, "Profile", "issuer profile");
  eq(a.badge.image.startsWith("data:image/svg+xml"), true, "image present");
  eq(a.verification.type, "hosted", "hosted verification"); eq(a.evidence[0].id, "https://sim.example.org/xapi/statements/r3", "evidence points at the xAPI statement");
  eq(JSON.parse(JSON.stringify(ob)).length, 2, "serialisable");
});

check("record() caps the log at 1000 entries, dropping the oldest", () => {
  TrainingRecords.clear();
  for (let i = 0; i < 1005; i++) TrainingRecords.record({ simId: `s${i}`, stars: 3, hazardHits: 0 });
  const list = TrainingRecords.list();
  eq(list.length, 1000, "capped length"); eq(list[0].simId, "s5", "oldest dropped");
});

// ----------------------------------------------------- course tracking (shared/tracking.js)
//
// A small fixture ladder and curriculum stand in for the real 30-programme
// catalog, the way this module documents: two stations, two levels, real
// generated-shape level objects (lessons/steps/standards at the top level,
// the way tools/gen_ladders.mjs's expandLevel() actually produces them).

const FIXTURE_CURRICULUM = { id: "fixture-prog", name: "Fixture Programme", stations: [{ id: "alpha" }, { id: "beta" }] };
const FIXTURE_LADDER = {
  programme: "fixture-prog", lessons: 10,
  levels: [
    { n: 1, title: "Level One", tasks: [{ app: "smartcity", id: "alpha", condition: "base", steps: 5 }], lessons: 5, steps: 5, standards: ["std-a"] },
    { n: 2, title: "Level Two", tasks: [{ app: "smartcity", id: "beta", condition: "base", steps: 5 }], lessons: 5, steps: 5, standards: ["std-b"] },
  ],
};
const FIXTURE_STANDARDS = { "std-a": { body: "OSHA", title: "1910.147" }, "std-b": { body: "NFPA", title: "70E" } };

function fixtureAttempt(overrides) {
  return { id: `fx-${Math.random().toString(36).slice(2, 8)}`, app: "smartcity", stars: 3, hazardHits: 0, errors: 0, seconds: 100, learner: "J", ...overrides };
}

check("myTrainingSummary(): levels/lessons maths against a fixture ladder", () => {
  const now = new Date("2026-09-26T12:00:00Z");
  const records = [
    fixtureAttempt({ simId: "alpha", simName: "Alpha Station", at: "2026-09-01T10:00:00Z", badges: ["Clean Sweep"], ladder: { programme: "fixture-prog", level: 1, run: "run1", task: 0 } }),
  ];
  const s = Tracking.myTrainingSummary(records, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER, standardsById: FIXTURE_STANDARDS, now });
  // levelState() always reports all 20 rungs of a ladder (shared/ladder.js's
  // own LADDER_LEVELS) — a fixture that defines only two of them leaves the
  // rest locked and missing, exactly as a ladder with an unfinished tail would.
  eq(s.levelsCompleted, 1, "one level passed"); eq(s.levelsTotal, 20, "every ladder is twenty levels, per shared/ladder.js");
  eq(s.lessonsCompleted, 5, "level one's five lessons"); eq(s.lessonsTotal, 10, "the ladder's own total");
  eq(s.timeOnTaskSeconds, 100, "time on task is the measured seconds, summed — never estimated");
  eq(s.lastStation, "Alpha Station", "last station trained");
  eq(s.nextLevel.n, 2, "next open level");
  eq(s.badgesEarned[0], "Clean Sweep", "badge carried through");
  eq(s.standardsEvidenced[0], "OSHA 1910.147", "standard resolved to its registry title, not its bare id");
});

check("myTrainingSummary(): a station run outside the programme does not count toward it", () => {
  const records = [fixtureAttempt({ simId: "not-in-this-programme", at: "2026-09-01T00:00:00Z" })];
  const s = Tracking.myTrainingSummary(records, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER });
  eq(s.attempts, 0, "no attempts attributed"); eq(s.lastStation, null, "no last station");
});

check("refreshersDue(): a clean run older than the interval is due; a fresh one is not; an unpassed station is never 'due'", () => {
  const cleanOld = [fixtureAttempt({ simId: "alpha", at: "2026-01-01T00:00:00Z" })];
  const dueNow = Tracking.refreshersDue(cleanOld, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER, now: new Date("2026-09-26T00:00:00Z") });
  eq(dueNow.length, 1, "aged past the default interval");
  eq(dueNow[0].isDefaultInterval, true, "no programme rule declared, so it is the platform default");
  eq(dueNow[0].dueDays, 90, "the platform default is 90 days");

  const cleanFresh = [fixtureAttempt({ simId: "alpha", at: "2026-09-01T00:00:00Z" })];
  eq(Tracking.refreshersDue(cleanFresh, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER, now: new Date("2026-09-26T00:00:00Z") }).length, 0, "well inside the interval");

  const neverPassed = [fixtureAttempt({ simId: "alpha", at: "2020-01-01T00:00:00Z", stars: 1, hazardHits: 1 })];
  eq(Tracking.refreshersDue(neverPassed, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER, now: new Date("2026-09-26T00:00:00Z") }).length, 0, "no clean baseline yet — not due, never trained cleanly");

  const withRule = { ...FIXTURE_CURRICULUM, completionRule: { refresherDays: 30 } };
  const overThirty = [fixtureAttempt({ simId: "alpha", at: "2026-08-01T00:00:00Z" })];
  const due = Tracking.refreshersDue(overThirty, { curriculum: withRule, ladder: FIXTURE_LADDER, now: new Date("2026-09-26T00:00:00Z") });
  eq(due.length, 1, "a programme's own completionRule overrides the default");
  eq(due[0].isDefaultInterval, false, "a declared rule is never labelled a platform default");
  eq(due[0].dueDays, 30, "the declared interval, not 90");
});

check("trainingStreak(): consecutive calendar days, broken by a gap, and 'active' only through today or yesterday", () => {
  const now = new Date("2026-09-26T12:00:00Z");
  const consecutive = [
    fixtureAttempt({ simId: "alpha", at: "2026-09-24T08:00:00Z" }),
    fixtureAttempt({ simId: "alpha", at: "2026-09-25T08:00:00Z" }),
    fixtureAttempt({ simId: "alpha", at: "2026-09-26T08:00:00Z" }),
  ];
  const s = Tracking.trainingStreak(consecutive, now);
  eq(s.days, 3, "three consecutive days"); eq(s.active, true, "today is in the streak");

  const gap = [
    fixtureAttempt({ simId: "alpha", at: "2026-09-01T08:00:00Z" }),
    fixtureAttempt({ simId: "alpha", at: "2026-09-26T08:00:00Z" }),
  ];
  eq(Tracking.trainingStreak(gap, now).days, 1, "a gap breaks the streak back to one day");
  eq(Tracking.trainingStreak([{ at: "2020-01-01T00:00:00Z", simId: "alpha" }], now).active, false, "a stale streak is not reported as current");
});

check("buildTranscript(): round-trips attempts in records.js's own shape, and totals hold", () => {
  TrainingRecords.clear();
  const a = TrainingRecords.record({
    app: "smartcity", simId: "alpha", simName: "Alpha Station", stars: 3, hazardHits: 0, errors: 0, score: 1500, seconds: 90, learner: "Ada", badges: ["Clean Sweep"],
    ladder: { programme: "fixture-prog", level: 1, run: "run1", task: 0 },
  });
  const b = TrainingRecords.record({
    app: "smartcity", simId: "beta", simName: "Beta Station", stars: 2, hazardHits: 0, errors: 1, score: 900, seconds: 200, learner: "Ada",
    ladder: { programme: "fixture-prog", level: 2, run: "run2", task: 0 },
  });
  const list = TrainingRecords.list();
  const data = Tracking.buildTranscript(list, { learner: "Ada", curricula: [FIXTURE_CURRICULUM], ladders: [FIXTURE_LADDER], standardsById: FIXTURE_STANDARDS });
  eq(JSON.parse(JSON.stringify(data.attempts)).length, 2, "every attempt carried");
  eq(data.attempts[0].id, a.id, "attempt shape is the record itself"); eq(data.attempts[1].id, b.id, "attempt order preserved");
  eq(data.totals.attempts, 2, "attempt count"); eq(data.totals.timeOnTaskSeconds, 290, "time on task summed, never estimated");
  eq(data.disclaimer, Tracking.TRANSCRIPT_DISCLAIMER, "the plain disclaimer");
  eq(data.disclaimer.includes("not a certification"), true, "labelled a record of activity, not a certification");
  const prog = data.programmes.find((p) => p.id === "fixture-prog");
  eq(prog.lessonsCompleted, 10, "both fixture levels mastered by these two clean runs");
  // Round-trip through JSON, the way an export actually leaves the browser.
  const round = JSON.parse(JSON.stringify(data));
  eq(round.attempts.length, 2, "survives a JSON round-trip");
});

check("SignOffs: an instructor's attestation is stored and rendered on the transcript as 'instructor attestation', never a credential", () => {
  Tracking.SignOffs.clear();
  const entry = Tracking.SignOffs.add({ programme: "fixture-prog", level: 1, learner: "Ada", instructor: "J. Foreman", note: "Watched the full run, clean." });
  if (!entry.id || !entry.at) throw new Error("sign-off missing id/timestamp");
  const forLevel = Tracking.SignOffs.forLevel("fixture-prog", 1, "Ada");
  eq(forLevel.length, 1, "stored under the level"); eq(forLevel[0].instructor, "J. Foreman", "instructor name kept");

  const data = Tracking.buildTranscript(TrainingRecords.list(), {
    learner: "Ada", curricula: [FIXTURE_CURRICULUM], ladders: [FIXTURE_LADDER], signOffs: [entry],
  });
  const html = Tracking.transcriptHtml(data);
  eq(html.includes("Instructor attestation"), true, "rendered under the attestation heading");
  eq(html.includes("J. Foreman"), true, "instructor name reaches the page");
  eq(html.toLowerCase().includes("certified"), false, "never claims the learner is certified");
  // "certification" itself is allowed, but only inside a plain negation
  // ("not a certification", "not ... a certification issued by") — never as a
  // claim that something was achieved.
  const certMentions = html.match(/certificat\w*/gi) ?? [];
  const bareNegations = html.match(/not\s+a[^.]*?certificat\w*/gi) ?? [];
  eq(certMentions.length > 0, true, "the disclaimer does mention certification, to deny it");
  eq(certMentions.length, bareNegations.length, "every mention of certification is inside a negation, never a claim");
  // A note is untrusted input, like a learner's crew tag elsewhere in this
  // engine, so it must reach the page as text rather than as markup.
  Tracking.SignOffs.clear();
  const hostile = Tracking.SignOffs.add({ programme: "fixture-prog", level: 1, instructor: "<b>Ada</b>", note: "<script>1</script>" });
  const hostileData = Tracking.buildTranscript(TrainingRecords.list(), { curricula: [FIXTURE_CURRICULUM], ladders: [FIXTURE_LADDER], signOffs: [hostile] });
  const hostileHtml = Tracking.transcriptHtml(hostileData);
  eq(hostileHtml.includes("<script>"), false, "a sign-off note is escaped, never executed");
  eq(hostileHtml.includes("&lt;b&gt;Ada&lt;/b&gt;"), true, "an instructor name with markup is escaped, not stripped silently");
});

check("accountability gamification: streak/refresher XP bonuses, clean-run badge tiers, hazard-free week, and a leaderboard keyed on the typed crew tag", () => {
  eq(Tracking.streakBonusXp(2), 0, "below the first tier");
  eq(Tracking.streakBonusXp(3), 50, "first tier");
  eq(Tracking.streakBonusXp(10), 200, "third-tier progress is cumulative with the ones below it");
  eq(Tracking.streakBonusXp(30), 1600, "every tier reached adds up");

  const onTime = [
    fixtureAttempt({ simId: "alpha", at: "2026-01-01T00:00:00Z" }),
    fixtureAttempt({ simId: "alpha", at: "2026-03-01T00:00:00Z" }), // ~59 days later, inside a 90-day interval
  ];
  eq(Tracking.onTimeRefreshers(onTime, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER }), 1, "a renewal well inside the interval counts as on time");
  eq(Tracking.onTimeRefresherXp(onTime, { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER }), Tracking.ON_TIME_REFRESHER_XP, "XP for exactly one on-time refresher");

  const clean = Array.from({ length: 12 }, (_, i) => fixtureAttempt({ simId: "alpha", at: `2026-01-${String(i + 1).padStart(2, "0")}T00:00:00Z` }));
  const badges = Tracking.cleanRunBadges(clean, FIXTURE_CURRICULUM);
  eq(badges.map((b) => b.tier).join(","), "5,10", "the 5- and 10-run tiers are reached, not the 20");

  const oneWeek = [
    fixtureAttempt({ simId: "alpha", at: "2026-02-02T08:00:00Z" }),
    fixtureAttempt({ simId: "beta", at: "2026-02-03T08:00:00Z" }),
  ];
  eq(Tracking.hazardFreeWeekBadge(oneWeek).weeks, 1, "one clean week earns the badge");
  eq(Tracking.hazardFreeWeekBadge([fixtureAttempt({ simId: "alpha", hazardHits: 1, at: "2026-02-02T08:00:00Z" })]), null, "a week with any unsafe action earns nothing");

  const board = Tracking.programmeLeaderboard([
    fixtureAttempt({ simId: "alpha", learner: "J", at: "2026-01-01T00:00:00Z", ladder: { programme: "fixture-prog", level: 1, run: "r1", task: 0 } }),
    fixtureAttempt({ simId: "beta", learner: "A.M.", at: "2026-01-01T00:00:00Z" }),
  ], { curriculum: FIXTURE_CURRICULUM, ladder: FIXTURE_LADDER });
  eq(board[0].name, "J", "ranked by lessons completed");
  eq(board.every((r) => r.name.length <= 40), true, "only whatever the learner typed — first name or initials, never a full record");
});

console.log(failures === 0 ? "\nAll training-records checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
