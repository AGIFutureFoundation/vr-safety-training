/**
 * Headless checks for the credential verifier (WebXR/verify/verify.js) and
 * the headset-pass instrument (WebXR/shared/perf.js): a real exported
 * assertion passes structurally; each way of breaking one is caught; hosted
 * verification reports matched / mismatch / unreachable honestly; the
 * perf instrument stays inert without ?perf and computes sane statistics; and
 * the 'drive' step kind (shared/game.js) scores the lane, the speed band, its
 * checks and an interruption answered from the cab exactly as documented.
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

// ------------------------------------------------------------ the drive step kind
//
// A 'drive' step (shared/game.js) is verified the way a credential is: every
// way of getting it wrong must be caught, and getting it right must score.
// The vehicle waits for the learner; the policy runner finishes clean; the
// lane, the band, a missed check, a wrong signal and a forbidden shift are
// each scored the way the engine documents; and an interruption on a drive
// step is answered by the cab control it names, from the brake edge.
{
  globalThis.localStorage = globalThis.localStorage ?? { getItem: () => null, setItem() {}, removeItem() {} };
  const game = await import("../WebXR/shared/game.js");
  const { applyAction, RobotAgent } = await import("../WebXR/shared/robot.js");
  game.Sfx.muted = true;
  const path = [[0, 0], [0, 6], [1, 8], [3, 9], [8, 9]];
  const drive = (extra = {}) => ({
    id: "d1", kind: "drive", target: "veh", title: "Drive", cue: "Drive it.", why: "Because.", holdBreakNote: "Band.",
    drive: { path, speedBand: [6, 12], laneWidth: 1.2, checkWindow: 1.6, checks: [{ at: 0, kind: "signal-right" }, { at: 1, kind: "mirror-right" }, { at: 3, kind: "mirror-left" }], controls: { brake: "brk", horn: "hrn" }, ...extra },
  });
  const room = (step, interrupts = []) => ({ id: "drive-probe", parSeconds: 200, steps: [step, { id: "s2", kind: "select", target: "x", title: "x", cue: "x", why: "x" }], interrupts });
  const run = (s, { policy = true, until = (x) => x.index > 0, max = 3000 } = {}) => {
    for (let i = 0; i < max && !until(s); i++) {
      if (policy) { const a = game.drivePolicy(s); s.driveInput(a); if (a.check) s.driveCheck(a.check); }
      s.tick(0.05);
    }
  };

  await check("drive: the vehicle waits at the start until the learner puts a foot down", () => {
    const s = new game.Session(room(drive()), {}); s.start();
    s.tick(5);
    assert(s.drive.s === 0 && !s.drive.started && s.errors === 0 && s.hazardHits === 0, "nothing moves and nothing is scored before the first throttle");
  });
  await check("drive: the policy runner follows the lane centre, takes every check and scores the step clean", () => {
    let poses = 0;
    const s = new game.Session(room(drive()), { onDrive: () => { poses += 1; } }); s.start();
    run(s);
    assert(s.index === 1, "the step completed");
    assert(s.errors === 0 && s.hazardHits === 0 && s.holdBreaks === 0, `clean run: errors ${s.errors}, hazards ${s.hazardHits}, breaks ${s.holdBreaks}`);
    assert(s.score >= game.STEP_POINTS, `scored ${s.score}`);
    assert(poses > 20, "onDrive reported the pose as the vehicle moved");
    assert(s.stepLog[0].kind === "drive" && s.gaugeScores.length === 1 && s.gaugeScores[0] > 0.9, "the step is logged and its time in band graded");
  });
  await check("drive: the pose follows the path, and a reverse step faces against it", () => {
    const s = new game.Session(room(drive()), {}); s.start();
    s.driveInput({ throttle: 1 }); for (let i = 0; i < 20; i++) s.tick(0.05);
    const p = s.drive.pose;
    assert(Math.abs(p.x) < 0.5 && p.z > 0.1 && Math.abs(p.heading) < 0.2, `heading up the first leg: ${JSON.stringify(p)}`);
    const r = new game.Session(room(drive({ reverse: true })), {}); r.start();
    assert(Math.abs(Math.abs(r.drive.pose.heading) - Math.PI) < 1e-6, "a backing step faces the other way");
    const obj = { position: { x: 0, z: 0 }, rotation: { y: 0 }, scale: { x: 0.5 }, userData: { articulation: { pivot: { rotation: { y: 0 } }, length: 13 } } };
    game.placeVehicle(obj, { x: 2, z: 3, heading: 0 }, null);
    game.placeVehicle(obj, { x: 2, z: 3.2, heading: 0.8 }, 0.2);
    assert(obj.position.x === 2 && obj.position.z === 3.2 && obj.rotation.y === 0.8, "placeVehicle moves the registered group");
    assert(obj.userData.articulation.pivot.rotation.y < 0 && obj.userData.articulation.pivot.rotation.y > -0.8, "an articulated trailer lags the tractor through a turn");
  });
  await check("drive: out of the lane longer than the grace is one unsafe action; a brief excursion is not", () => {
    const s = new game.Session(room(drive({ graceSeconds: 1 })), {}); s.start();
    s.driveInput({ throttle: 1, steer: 1 });
    for (let i = 0; i < 12; i++) s.tick(0.05);
    const brief = s.hazardHits;
    for (let i = 0; i < 60; i++) { s.driveInput({ throttle: s.drive.speed < 9 ? 0.6 : 0, steer: 1 }); s.tick(0.05); }
    assert(brief === 0, "a moment over the line is not yet a hazard");
    assert(s.hazardHits === 1 && s.drive.dropouts >= 1, `one hazard for one long excursion, got ${s.hazardHits}`);
  });
  await check("drive: a missed check is an error, not an unsafe action", () => {
    const s = new game.Session(room(drive()), {}); s.start();
    run(s, { policy: false, until: (x) => x.index > 0, max: 1 });
    for (let i = 0; i < 2000 && s.index === 0; i++) { const a = game.drivePolicy(s); s.driveInput(a); if (a.check && a.check !== "mirror-right") s.driveCheck(a.check); s.tick(0.05); }
    assert(s.errors === 1 && s.hazardHits === 0, `errors ${s.errors}, hazards ${s.hazardHits}`);
    assert(s.log.some((l) => l.hit === "check:mirror-right"), "the miss is logged against the check");
  });
  await check("drive: signalling the wrong way inside a signal's window is an error; an idle check costs nothing", () => {
    const s = new game.Session(room(drive()), {}); s.start();
    const idle = s.driveCheck("horn");
    assert(idle.kind === "partial" && s.errors === 0, "a horn tap nobody asked for is only a note");
    s.driveCheck("signal-left");
    assert(s.errors === 1, "the wrong-way signal scored an error");
  });
  await check("drive: a forbidden control on a stretch that forbids it is an error", () => {
    const s = new game.Session(room(drive({ forbid: { "gear-up": "No shifting on the tracks." } })), {}); s.start();
    const fb = s.driveCheck("gear-up");
    assert(s.errors === 1 && /shifting/.test(fb.text), "shifting where the step forbids it is a mistake");
  });
  await check("drive: an interruption is answered by the brake edge it names, and braking never counts as a wrong answer", () => {
    const it = { id: "i1", after: "d1", delay: 2, seconds: 8, target: "brk", alert: "a".repeat(40), why: "w".repeat(60), missNote: "m".repeat(80) };
    const s = new game.Session(room(drive(), [it]), {}); s.start();
    s.driveInput({ throttle: 1 }); s.tick(2.1);
    assert(s.activeInterrupt?.id === "i1", "armed on a drive step and fired");
    const before = s.score;
    s.driveInput({ throttle: -1 });
    assert(!s.activeInterrupt && s.interruptLog[0].outcome === "answered" && s.score > before, "the brake answered it and scored");
    const horn = { ...it, id: "i2", target: "hrn" };
    const h = new game.Session(room(drive(), [horn]), {}); h.start();
    h.driveInput({ throttle: 1 }); h.tick(2.1);
    h.driveInput({ throttle: -1 });
    assert(h.activeInterrupt?.id === "i2" && h.hazardHits === 0, "braking for an alarm that wants the horn is not scored as wrong");
    h.driveCheck("horn");
    assert(!h.activeInterrupt && h.interruptLog[0].outcome === "answered", "the horn key answered it");
    run(h);
    assert(h.index === 1 && h.hazardHits === 0, "the drive carried on to the end after the interruption");
  });
  await check("drive: the robot's applyAction drives the kind, and an expert agent passes it", () => {
    const s = new game.Session(room(drive()), {}); s.start();
    applyAction(s, { type: "drive", throttle: 1, steer: 0, check: "signal-right" });
    assert(s.drive.started && s.drive.plan[0].done, "throttle started the vehicle and the check landed");
    const agent = new RobotAgent({ skill: 1, seed: 7, hitIds: ["veh", "x", "brk", "hrn"] });
    const e = new game.Session(room(drive()), {}); e.start();
    for (let i = 0; i < 3000 && e.index === 0; i++) { applyAction(e, agent.act(e)); e.tick(0.05); }
    assert(e.index === 1 && e.errors === 0, `expert agent: index ${e.index}, errors ${e.errors}`);
  });
}

console.log(failed ? `\n${failed} verifier check(s) failed.` : "\nAll verifier, perf and drive-kind checks pass.");
process.exit(failed ? 1 : 0);
