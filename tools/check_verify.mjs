/**
 * Headless checks for the credential verifier (WebXR/verify/verify.js) and
 * the headset-pass instrument (WebXR/shared/perf.js): a real exported
 * assertion passes structurally; each way of breaking one is caught; hosted
 * verification reports matched / mismatch / unreachable honestly; and the
 * perf instrument stays inert without ?perf and computes sane statistics.
 *
 *     node tools/check_verify.mjs
 */
let failed = 0;
const check = async (name, fn) => { try { await fn(); console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const { validateAssertion, verifyHosted, parseInput, verdict, sameJson } = await import("../WebXR/verify/verify.js");
const { TrainingRecords, toOpenBadges } = await import("../WebXR/shared/records.js");

const rec = { app: "smartcity", learner: "CREW", learnerName: "Sam Rivera", learnerId: "u-77", homePage: "https://hall.example.org", simId: "aerial-ladder", simName: "Aerial Ladder", category: "Emergency Services", trade: "Firefighter", certification: "NFPA 1002 aerial", score: 2500, stars: 3, errors: 0, hazardHits: 0, holdBreaks: 0, seconds: 200, parSeconds: 260, badges: [], level: 3, levelName: "Apprentice" };
const attempt = TrainingRecords.record(rec);
const [assertion] = toOpenBadges([attempt], { homePage: "https://hall.example.org", actorName: "CREW" });

await check("a real exported assertion passes every structural check", () => {
  const r = validateAssertion(assertion);
  assert(r.ok, `failed: ${r.checks.filter((c) => !c.ok).map((c) => c.name + " (" + c.note + ")").join("; ")}`);
  assert(r.summary.badge.includes("Aerial Ladder"), "summary badge name");
  assert(r.summary.issuer === "SmartCiti.X Training Network", "issuer name");
});
await check("placeholder home (no learner_home) is flagged, not silently passed", () => {
  const [a] = toOpenBadges([TrainingRecords.record({ ...rec, homePage: undefined })], {});
  const r = validateAssertion(a);
  assert(!r.ok && r.checks.find((c) => c.name === "Issuer home is a real host" && !c.ok), "placeholder should fail the host check");
});
await check("each way of breaking an assertion is caught", () => {
  const breaks = [
    ["@context", (a) => { a["@context"] = "https://example.org/other"; }],
    ["type", (a) => { a.type = "Badge"; }],
    ["id", (a) => { a.id = "not a url"; }],
    ["recipient", (a) => { delete a.recipient; }],
    ["issuedOn future", (a) => { a.issuedOn = new Date(Date.now() + 86400e3 * 3).toISOString(); }],
    ["verification", (a) => { a.verification = { type: "SignedBadge" }; }],
    ["badge missing", (a) => { a.badge = "https://hall.example.org/badges/x"; }],
    ["issuer", (a) => { delete a.badge.issuer; }],
    ["criteria", (a) => { delete a.badge.criteria; }],
    ["evidence", (a) => { a.evidence = []; }],
    ["expired", (a) => { a.expires = "2020-01-01T00:00:00Z"; }],
  ];
  for (const [label, mutate] of breaks) {
    const a = JSON.parse(JSON.stringify(assertion)); mutate(a);
    const r = validateAssertion(a);
    assert(!r.ok, `${label}: should fail`);
    assert(verdict(r).level === "fail", `${label}: verdict should be fail`);
  }
});
await check("verdict is honest about hosted status", () => {
  const r = validateAssertion(assertion);
  assert(verdict(r).level === "warn", "no hosted check → warn (self-asserted)");
  assert(verdict(r, { status: "matched" }).level === "pass", "matched → pass");
  assert(verdict(r, { status: "mismatch" }).level === "fail", "mismatch → fail");
  assert(verdict(r, { status: "unreachable" }).level === "warn", "unreachable → warn");
});
await check("hosted verification compares the fetched copy and reports failures", async () => {
  const same = await verifyHosted(assertion, async () => ({ ok: true, json: async () => JSON.parse(JSON.stringify(assertion)) }));
  assert(same.status === "matched", "identical copy → matched");
  const altered = JSON.parse(JSON.stringify(assertion)); altered.badge.name = "Something else";
  const diff = await verifyHosted(assertion, async () => ({ ok: true, json: async () => altered }));
  assert(diff.status === "mismatch", "altered copy → mismatch");
  const gone = await verifyHosted(assertion, async () => ({ ok: false, status: 404 }));
  assert(gone.status === "unreachable" && gone.note.includes("404"), "404 → unreachable");
  const thrown = await verifyHosted(assertion, async () => { throw new Error("CORS"); });
  assert(thrown.status === "unreachable", "network error → unreachable");
});
await check("parseInput accepts a single assertion, an array, or the export wrapper", () => {
  assert(parseInput(JSON.stringify(assertion)).length === 1, "single");
  assert(parseInput(JSON.stringify([assertion, assertion])).length === 2, "array");
  assert(parseInput(JSON.stringify({ assertions: [assertion] })).length === 1, "wrapper");
  assert(sameJson({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 }) && !sameJson({ a: 1 }, { a: 2 }), "sameJson");
});

const { Perf } = await import("../WebXR/shared/perf.js");
await check("perf instrument is inert without ?perf and logs nothing", () => {
  assert(Perf.enabled === false, "should be off headless");
  Perf.frame(0.016);
  assert(Perf.snapshot().frames === 0, "no frames recorded when off");
  assert(Perf.logRun({ simId: "x" }) === null, "no log when off");
  assert(Perf.mountOverlay() === undefined || Perf.mountOverlay() === null, "no overlay headless");
});
await check("perf statistics are computed from the frame window when on", async () => {
  // Re-import with the URL param present (fresh module instance).
  globalThis.location = { search: "?perf=1" };
  const { Perf: P } = await import("../WebXR/shared/perf.js?on=1");
  assert(P.enabled, "enabled with ?perf=1");
  for (let i = 0; i < 100; i++) P.frame(i < 95 ? 0.0111 : 0.040);
  const s = P.snapshot();
  assert(s.frames === 100, "window filled");
  assert(s.avgMs > 11 && s.avgMs < 14, `avg ${s.avgMs}`);
  assert(s.p95Ms >= 11 && s.worstMs === 40, `p95 ${s.p95Ms} worst ${s.worstMs}`);
  assert(P.sample({ info: { render: { calls: 120, triangles: 45000 } } }, 1) === true, "sampled");
  assert(P.sample({ info: { render: { calls: 1, triangles: 1 } } }, 1.2) === false, "throttled");
  assert(P.text().includes("120 calls") && P.text().includes("45k tris"), P.text());
  const entry = P.logRun({ simId: "aerial-ladder", mode: "vr" });
  assert(entry && entry.simId === "aerial-ladder" && entry.calls === 120, "log entry carries meta and counters");
  delete globalThis.location;
});

console.log(failed ? `\n${failed} verifier check(s) failed.` : "\nAll verifier and perf checks pass.");
process.exit(failed ? 1 : 0);
