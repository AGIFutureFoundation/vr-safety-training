/**
 * Headless checks for the training-records layer (WebXR/shared/records.js):
 * the pass rule, the append/cap behaviour, the per-category summary, and the
 * CSV and xAPI export shapes an HR system or Learning Record Store would
 * actually parse.
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

console.log(failures === 0 ? "\nAll training-records checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
