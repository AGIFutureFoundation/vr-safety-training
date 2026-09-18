/**
 * Headless checks for instructor mode (WebXR/shared/observer.js): the
 * learner's broadcaster and the instructor's console speak the same
 * protocol, a command aimed at one session is ignored by the others, text is
 * clipped so a long note cannot flood a console, the roster reducer folds a
 * stream of events into what the console renders, and everything degrades to
 * a no-op in a browser without BroadcastChannel.
 *
 *     node tools/check_observer.mjs
 */
let failed = 0;
const check = async (name, fn) => { try { await fn(); console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// A BroadcastChannel stand-in: every open channel with the same name hears
// every other one's posts, and never its own, exactly like the real thing.
const buses = new Map();
class FakeChannel {
  constructor(name) {
    this.name = name; this.onmessage = null; this.closed = false;
    if (!buses.has(name)) buses.set(name, new Set());
    buses.get(name).add(this);
  }
  postMessage(data) {
    for (const peer of buses.get(this.name)) {
      if (peer === this || peer.closed) continue;
      peer.onmessage?.({ data: JSON.parse(JSON.stringify(data)) });
    }
  }
  close() { this.closed = true; buses.get(this.name)?.delete(this); }
}
globalThis.BroadcastChannel = FakeChannel;

const obs = await import("../WebXR/shared/observer.js");
const { createBroadcaster, createConsole, reduceRoster, OBSERVER_PROTOCOL, LEARNER_EVENTS, INSTRUCTOR_COMMANDS } = obs;

await check("a learner's events reach the console with the protocol version", () => {
  const seen = [];
  const con = createConsole((e) => seen.push(e));
  const b = createBroadcaster("smartcity", { learner: "CREW", station: "valve-vault" });
  assert(b.available && con.available, "both sides should be available with a channel");
  b.hello({ stationName: "Valve Vault" });
  b.step({ stepId: "permit", stepTitle: "Pull the permit", stepIndex: 1, stepCount: 9 });
  b.hazard({ hazardId: "no-test", note: "You entered without testing the atmosphere." });
  b.finish({ passed: false, stars: 1, score: 900, seconds: 210, verdict: "1 unsafe action" });
  assert(seen.length === 4, `expected 4 events, saw ${seen.length}`);
  assert(seen.every((e) => e.protocol === OBSERVER_PROTOCOL), "every event carries the protocol version");
  assert(seen.every((e) => LEARNER_EVENTS.includes(e.kind)), "every event is a learner event");
  assert(seen[0].stationName === "Valve Vault" && seen[1].stepTitle === "Pull the permit", "payloads arrive intact");
  b.close(); con.close();
});

await check("a roll call makes an already-running session announce itself", () => {
  const b = createBroadcaster("trades", { learner: "SAM", station: "welding" });
  const seen = [];
  const con = createConsole((e) => seen.push(e));
  con.roll();
  assert(seen.length === 1 && seen[0].kind === "hello" && seen[0].learner === "SAM", `expected one hello, got ${JSON.stringify(seen)}`);
  b.close(); con.close();
});

await check("a command addressed to one session is ignored by the others", () => {
  const a = createBroadcaster("smartcity", { learner: "A" });
  const bb = createBroadcaster("smartcity", { learner: "B" });
  const got = { A: [], B: [] };
  a.onCommand((c) => got.A.push(c));
  bb.onCommand((c) => got.B.push(c));
  const con = createConsole(() => {});
  con.note(a.id, "watch the order of draw");
  assert(got.A.length === 1 && got.A[0].text === "watch the order of draw", "the addressed session gets the note");
  assert(got.B.length === 0, "the other session does not");
  con.freeze(bb.id, true);
  assert(got.B.length === 1 && got.B[0].kind === "freeze" && got.B[0].on === true, "freeze reaches its target");
  assert(got.A.length === 1, "and only its target");
  a.close(); bb.close(); con.close();
});

await check("instructor text is clipped so a console cannot be flooded", () => {
  const b = createBroadcaster("smartcity", { learner: "C" });
  let got = null;
  b.onCommand((c) => { got = c; });
  const con = createConsole(() => {});
  con.note(b.id, "x".repeat(5000));
  assert(got && got.text.length === 400, `note should clip to 400, got ${got?.text.length}`);
  const seen = [];
  const con2 = createConsole((e) => seen.push(e));
  b.hazard({ hazardId: "h", note: "y".repeat(5000) });
  assert(seen[0].note.length === 400, `hazard note should clip to 400, got ${seen[0].note.length}`);
  b.close(); con.close(); con2.close();
});

await check("state snapshots are throttled", () => {
  const b = createBroadcaster("smartcity", { learner: "D" });
  const seen = [];
  const con = createConsole((e) => seen.push(e));
  let sent = 0;
  for (let i = 0; i < 50; i++) if (b.state({ score: i })) sent += 1;
  assert(sent === 1, `50 rapid snapshots should send once, sent ${sent}`);
  assert(b.state({ score: 99 }, { minMs: 0 }), "an explicit zero throttle sends");
  assert(seen.length === 2, `console saw ${seen.length}`);
  b.close(); con.close();
});

await check("the roster reducer folds a stream into what the console renders", () => {
  const b = createBroadcaster("smartcity", { learner: "EVA", station: "fire-pump", stationName: "Fire Pump" });
  const events = [];
  const con = createConsole((e) => events.push(e));
  b.hello();
  b.state({ stepIndex: 3, stepCount: 12, stepTitle: "Churn", score: 700, stars: 0, errors: 1, hazardHits: 0, seconds: 45 }, { minMs: 0 });
  b.hazard({ hazardId: "no-notify", note: "The alarm company was never told." });
  b.finish({ passed: false, stars: 1, score: 1100, seconds: 190, verdict: "1 unsafe action" });
  let roster = new Map();
  for (const e of events) roster = reduceRoster(roster, e);
  assert(roster.size === 1, `one session, got ${roster.size}`);
  const row = [...roster.values()][0];
  assert(row.learner === "EVA" && row.stationName === "Fire Pump", "identity carried through");
  assert(row.stepIndex === 3 && row.stepCount === 12 && row.stepTitle === "Churn", "live position carried through");
  assert(row.hazards === 1 && row.finished === true && row.passed === false, "hazard counted and verdict recorded");
  assert(row.events.length === 2 && row.events[0].kind === "hazard" && row.events[1].kind === "fail", "the log holds both entries in order");
  b.close(); con.close();
});

await check("a session that leaves is marked gone, and stale rows are dropped", () => {
  const b = createBroadcaster("smartcity", { learner: "F" });
  const events = [];
  const con = createConsole((e) => events.push(e));
  b.hello();
  b.close();
  let roster = new Map();
  for (const e of events) roster = reduceRoster(roster, e);
  const row = [...roster.values()][0];
  assert(row && row.live === false, "a closed session is not live");
  // A row nothing has been heard from for longer than the window is dropped.
  const stale = reduceRoster(roster, { ...events[0], kind: "bye", at: Date.now() - 120000 }, { staleMs: 1000 });
  assert(stale.size === 0, "stale rows are dropped");
  con.close();
});

await check("everything is a no-op without BroadcastChannel", () => {
  const real = globalThis.BroadcastChannel;
  delete globalThis.BroadcastChannel;
  const b = createBroadcaster("smartcity", { learner: "G" });
  const con = createConsole(() => {});
  assert(b.available === false && con.available === false, "both report unavailable");
  assert(b.hello() === false && b.step({}) === false && b.hazard({}) === false && b.finish({}) === false, "learner calls return false, do not throw");
  assert(con.roll() === false && con.note("x", "y") === false && con.freeze("x", true) === false, "console calls return false, do not throw");
  b.close(); con.close();
  globalThis.BroadcastChannel = real;
});

await check("the protocol names both directions and nothing overlaps", () => {
  assert(LEARNER_EVENTS.length === 6 && INSTRUCTOR_COMMANDS.length === 3, "six learner events, three commands");
  assert(!LEARNER_EVENTS.some((k) => INSTRUCTOR_COMMANDS.includes(k)), "the two directions use distinct names");
});

console.log(failed ? `\n${failed} instructor-mode check(s) failed.` : "\nAll instructor-mode checks pass.");
process.exit(failed ? 1 : 0);
