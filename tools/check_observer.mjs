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
import { readFileSync } from "node:fs";

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

// A WebSocket stand-in for the relay leg: every socket opened against the same
// URL hears every other one's frames and never its own, which is exactly what
// tools/relay_server.mjs does with them.
const sockets = new Map();
class FakeSocket {
  constructor(url) {
    this.url = url; this.readyState = 0; this.sent = [];
    this.onopen = null; this.onmessage = null; this.onerror = null; this.onclose = null;
    if (!sockets.has(url)) sockets.set(url, new Set());
    sockets.get(url).add(this);
  }
  open() { this.readyState = 1; this.onopen?.(); }
  send(frame) {
    this.sent.push(frame);
    for (const peer of sockets.get(this.url)) {
      if (peer === this || peer.readyState !== 1) continue;
      peer.onmessage?.({ data: frame });
    }
  }
  close() { this.readyState = 3; sockets.get(this.url)?.delete(this); }
}
globalThis.WebSocket = FakeSocket;
const openAll = (url) => { for (const s of sockets.get(url) ?? []) if (s.readyState === 0) s.open(); };

const obs = await import("../WebXR/shared/observer.js");
const { createBroadcaster, createConsole, reduceRoster, OBSERVER_PROTOCOL, ACCEPTED_PROTOCOLS, LEARNER_EVENTS, INSTRUCTOR_COMMANDS, relayFromSearch } = obs;

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
  const realSocket = globalThis.WebSocket;
  delete globalThis.BroadcastChannel;
  delete globalThis.WebSocket;
  const b = createBroadcaster("smartcity", { learner: "G" });
  const con = createConsole(() => {});
  assert(b.available === false && con.available === false, "both report unavailable");
  assert(b.hello() === false && b.step({}) === false && b.hazard({}) === false && b.finish({}) === false, "learner calls return false, do not throw");
  assert(con.roll() === false && con.note("x", "y") === false && con.freeze("x", true) === false, "console calls return false, do not throw");
  assert(con.open("x", "y") === false && con.interrupt("x", "y") === false && con.weather("x", "rain") === false
    && con.profile("x", "vr") === false && con.hazardMode("x", "coach") === false && con.assign("x", "p") === false,
    "the new commands are no-ops too, not throws");
  b.close(); con.close();
  globalThis.BroadcastChannel = real;
  globalThis.WebSocket = realSocket;
});

await check("the protocol names both directions and nothing overlaps", () => {
  assert(LEARNER_EVENTS.length === 7 && INSTRUCTOR_COMMANDS.length === 9, `seven learner events, nine commands, got ${LEARNER_EVENTS.length}/${INSTRUCTOR_COMMANDS.length}`);
  assert(!LEARNER_EVENTS.some((k) => INSTRUCTOR_COMMANDS.includes(k)), "the two directions use distinct names");
  assert(OBSERVER_PROTOCOL === 2 && ACCEPTED_PROTOCOLS.includes(1), "protocol 2, and 1 still accepted");
});

await check("a console from before the bump is still answered", () => {
  // Protocol 1 knew note, freeze and roll. An app that stopped answering those
  // would break every console already open in a training centre.
  const b = createBroadcaster("smartcity", { learner: "OLD" });
  const got = [];
  b.onCommand((c) => got.push(c));
  const legacy = new globalThis.BroadcastChannel("smartcitix:instructor");
  legacy.postMessage({ protocol: 1, kind: "note", to: b.id, text: "mind the order of draw" });
  legacy.postMessage({ protocol: 1, kind: "freeze", to: b.id, on: true });
  legacy.postMessage({ protocol: 9, kind: "note", to: b.id, text: "from the future" });
  assert(got.length === 2, `two protocol-1 commands answered, got ${got.length}`);
  assert(got[0].text === "mind the order of draw" && got[1].on === true, "both arrive intact");
  legacy.close(); b.close();
});

await check("a roll call carries what only the app knows about its station", () => {
  const b = createBroadcaster("smartcity", { learner: "IVY", station: "trench-box" });
  b.describes(() => ({ steps: [{ id: "permit", title: "Pull the permit", kind: "select" }], interrupts: [{ id: "utility-strike", alert: "A locator is calling." }], fired: [] }));
  const seen = [];
  const con = createConsole((e) => seen.push(e));
  con.roll();
  assert(seen.length === 1 && seen[0].kind === "hello", "the roll call is answered");
  assert(seen[0].steps?.length === 1 && seen[0].interrupts?.[0].id === "utility-strike", "the station's steps and interruptions ride along");
  let roster = reduceRoster(new Map(), seen[0]);
  const row = [...roster.values()][0];
  assert(row.steplist.length === 1 && row.interrupts.length === 1, "the reducer keeps them for the panel");
  b.close(); con.close();
});

await check("every command reaches its session, and the app's answer comes back", () => {
  const b = createBroadcaster("smartcity", { learner: "RAY", station: "trench-box" });
  const got = [];
  b.onCommand((c) => { got.push(c); b.action({ cmd: c.kind, detail: c.detail ?? "", ok: true, note: "done" }); });
  const seen = [];
  const con = createConsole((e) => seen.push(e));
  con.open(b.id, "hot-tap");
  con.interrupt(b.id, "utility-strike");
  con.weather(b.id, "storm");
  con.profile(b.id, "quest-3");
  con.hazardMode(b.id, "coach");
  con.assign(b.id, "electrical-first-period");
  const kinds = got.map((c) => c.kind);
  for (const want of ["open", "interrupt", "weather", "profile", "hazard-mode", "assign"]) {
    assert(kinds.includes(want), `${want} did not reach the session (${kinds.join(", ")})`);
  }
  assert(got[0].detail === "hot-tap" && got[2].detail === "storm", "the detail arrives intact");
  assert(seen.length === 6 && seen.every((e) => e.kind === "action"), `six action events, got ${seen.length}`);
  let roster = new Map();
  for (const e of seen) roster = reduceRoster(roster, e);
  const row = [...roster.values()][0];
  assert(row.actions === 6, `the reducer counted ${row.actions} commands`);
  assert(row.fired.includes("utility-strike"), "an answered interruption is marked fired, so the button disables");
  assert(row.hazardMode === "coach" && row.weather === "storm" && row.assigned === "electrical-first-period", "the row carries what was set");
  b.close(); con.close();
});

await check("the reducer handles every event the protocol declares", () => {
  const src = readFileSync(new URL("../WebXR/shared/observer.js", import.meta.url), "utf8");
  const body = src.slice(src.indexOf("export function reduceRoster"));
  const names = { hello: "EV_HELLO", state: "EV_STATE", step: "EV_STEP", hazard: "EV_HAZARD", action: "EV_ACTION", finish: "EV_FINISH", bye: "EV_BYE" };
  for (const kind of LEARNER_EVENTS) {
    assert(body.includes(`ev.kind === ${names[kind]}`), `reduceRoster does not name ${names[kind]}`);
    const roster = reduceRoster(new Map(), { id: "s-x", kind, at: Date.now(), app: "smartcity", learner: "Z" });
    assert(roster.get("s-x"), `folding a ${kind} event produced no row`);
  }
});

await check("a relay carries the same envelope both ways", () => {
  const url = "ws://relay.test/class";
  const b = createBroadcaster("smartcity", { learner: "REMOTE", station: "trench-box", relay: url });
  const seen = [];
  const con = createConsole((e) => seen.push(e), { relay: url });
  openAll(url);
  assert(b.relay === url && con.relay === url, "both sides report the relay");
  const got = [];
  b.onCommand((c) => got.push(c));
  con.interrupt(b.id, "utility-strike");
  assert(got.length === 1 && got[0].kind === "interrupt" && got[0].detail === "utility-strike", "a command crosses the relay");
  b.hello();
  assert(seen.some((e) => e.kind === "hello" && e.learner === "REMOTE"), "an event crosses the relay");
  const frame = JSON.parse([...sockets.get(url)][0].sent[0] ?? "{}");
  assert(frame.protocol === OBSERVER_PROTOCOL, "the relay frame is the same JSON envelope, protocol and all");
  b.close(); con.close();
});

await check("frames sent before the relay opens are not lost", () => {
  const url = "ws://relay.test/late";
  const b = createBroadcaster("trades", { learner: "EARLY", relay: url });
  b.hello();                       // before the socket is open
  const sock = [...sockets.get(url)][0];
  assert(sock.sent.length === 0, "nothing is written to a connecting socket");
  const seen = [];
  const con = createConsole((e) => seen.push(e), { relay: url });
  openAll(url);
  assert(sock.sent.length === 1, "the queued frame goes out on open");
  b.hello();
  assert(seen.length >= 1, "and the console hears the live ones");
  b.close(); con.close();
});

await check("a relay URL is only taken from ?relay= when it is a websocket URL", () => {
  assert(relayFromSearch("?relay=ws://127.0.0.1:8787") === "ws://127.0.0.1:8787", "ws:// is accepted");
  assert(relayFromSearch("?relay=wss://hall.example/class") === "wss://hall.example/class", "wss:// is accepted");
  assert(relayFromSearch("?relay=https://hall.example") === null, "an http URL is refused");
  assert(relayFromSearch("?relay=javascript:alert(1)") === null, "anything else is refused");
  assert(relayFromSearch("") === null, "no relay is no relay");
});

console.log(failed ? `\n${failed} instructor-mode check(s) failed.` : "\nAll instructor-mode checks pass.");
process.exit(failed ? 1 : 0);
