#!/usr/bin/env node
/**
 * FlowHub's gate (WebXR/shared/flowhub.js, WebXR/flows/, the flow channel in
 * WebXR/shared/platform.js and the Flows panel).
 *
 *     node tools/check_flowhub.mjs
 *
 * A flow is the one thing in this repository a *host* writes, so the facts that
 * have to hold are the ones a screenshot cannot show:
 *
 *   1. every example flow in WebXR/flows/ validates against the real catalog,
 *      and flows/index.json agrees with the files on disk;
 *   2. every edge condition in every example is reachable — a branch an author
 *      believes in and the engine can never walk is worse than no branch;
 *   3. nextNode's truth table: passed, failed, a branch on stars, a competency
 *      gate, an external node and the end of a flow;
 *   4. the gate rule is the proof brief's mastery rule and nothing else, and it
 *      reads the attempt records rather than scoring anything itself;
 *   5. the protocol constants appear in all three learner apps' handlers and in
 *      the instructor console, and the console's flow control is a declared
 *      observer command;
 *   6. the run survives an app switch: one localStorage key, versioned, with
 *      the flow and node ids on the cross-app link.
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const FLOW_DIR = join(ROOT, "WebXR", "flows");

let failed = 0;
const check = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

const F = await import("../WebXR/shared/flowhub.js");
const P = await import("../WebXR/shared/platform.js");
const OBS = await import("../WebXR/shared/observer.js");

const catalog = JSON.parse(read("WebXR/smartcity/catalog.json"));
const files = readdirSync(FLOW_DIR).filter((f) => f.endsWith(".json") && f !== "index.json").sort();
const index = JSON.parse(read("WebXR/flows/index.json"));
const flows = new Map(files.map((f) => [f, JSON.parse(readFileSync(join(FLOW_DIR, f), "utf8"))]));

// The three the brief names, so a renamed or deleted example fails the build
// rather than quietly leaving the docs describing something that is gone.
const REQUIRED = ["new-apprentice-safety.json", "dental-careers-orientation.json", "first-responder-refresher.json"];

console.log("FlowHub — self-test\n");

check("the three example flows are on disk and flows/index.json agrees with them", () => {
  for (const want of REQUIRED) assert(flows.has(want), `WebXR/flows/${want} is missing`);
  const indexed = (index.flows ?? []).map((r) => r.file).sort();
  eq(indexed.join(","), files.join(","), "flows/index.json files vs the directory");
  for (const row of index.flows ?? []) {
    const flow = flows.get(row.file);
    eq(flow.id, row.id, `${row.file} id`);
    eq(flow.title, row.title, `${row.file} title`);
  }
  eq(index.protocol, F.FLOW_PROTOCOL, "flows/index.json protocol");
});

check("every example flow validates against the generated catalog", () => {
  for (const [file, flow] of flows) {
    const v = F.validateFlow(flow, catalog);
    assert(v.ok, `${file}: ${v.errors.join("; ")}`);
    assert(v.terminals.length > 0, `${file} can never finish`);
    for (const w of v.warnings) assert(!/not checked against the roster/.test(w), `${file} was not checked against the roster`);
  }
});

check("a flow naming a station, programme or condition that does not exist is refused", () => {
  const good = flows.get("new-apprentice-safety.json");
  const bent = structuredClone(good);
  bent.nodes.find((n) => n.id === "stn-trench").ref = "no-such-station";
  assert(!F.validateFlow(bent, catalog).ok, "an unknown station id was accepted");
  const bent2 = structuredClone(good);
  bent2.edges[1].when = { custom: "no-such-condition" };
  assert(!F.validateFlow(bent2, catalog).ok, "an unimplemented custom condition was accepted");
  const bent3 = structuredClone(good);
  bent3.nodes.push({ id: "orphan", kind: "checkin" });
  assert(!F.validateFlow(bent3, catalog).ok, "an unreachable node was accepted");
  const bent4 = structuredClone(good);
  bent4.nodes.find((n) => n.id === "gate-induction").params.competency = "";
  assert(!F.validateFlow(bent4, catalog).ok, "a gate with no competency was accepted");
  const bent5 = structuredClone(good);
  bent5.edges = bent5.edges.filter((e) => e.from !== "checkin-close");
  bent5.edges.push({ from: "checkin-close", to: "checkin-close" });
  assert(!F.validateFlow(bent5, catalog).ok, "a node whose only edge loops back to itself was accepted");
  const prog = flows.get("dental-careers-orientation.json");
  const bent6 = structuredClone(prog);
  bent6.nodes.find((n) => n.kind === "programme").ref = "no-such-programme";
  assert(!F.validateFlow(bent6, catalog).ok, "an unknown programme id was accepted");
});

check("every edge condition in every example is reachable by some real outcome", () => {
  for (const [file, flow] of flows) {
    const cov = F.edgeCoverage(flow);
    assert(cov.edges.length === flow.edges.length, `${file}: coverage saw ${cov.edges.length} of ${flow.edges.length} edges`);
    assert(cov.unreachable.length === 0,
      `${file}: no outcome can take ${cov.unreachable.map((r) => `${r.from}->${r.to} (${r.why})`).join(", ")}`);
  }
});

check("nextNode's truth table: passed, failed, stars branch, gate, external, done", () => {
  const induction = flows.get("new-apprentice-safety.json");
  const dental = flows.get("dental-careers-orientation.json");
  const fr = flows.get("first-responder-refresher.json");
  const pass = { passed: true, stars: 3, hazardHits: 0, interrupts: { total: 1, answered: 1, missed: 0, wrong: 0 }, seconds: 100, parSeconds: 220 };
  const fail = { passed: false, stars: 1, hazardHits: 1, interrupts: { total: 1, answered: 0, missed: 1, wrong: 0 }, seconds: 400, parSeconds: 220 };

  // passed / failed
  eq(F.nextNode(induction, "stn-trench", pass).to, "stn-charge", "a passed station goes on");
  eq(F.nextNode(induction, "stn-trench", fail).to, "stn-trench", "a failed station is retried");
  eq(F.nextNode(induction, "stn-trench", fail).why, "always", "the retry edge's reason");

  // a branch on stars
  eq(F.nextNode(dental, "stn-intake", pass).to, "stn-radiograph", "three stars takes the radiography branch");
  eq(F.nextNode(dental, "stn-intake", { ...pass, stars: 2 }).to, "stn-reprocessing", "two stars takes the reprocessing branch");
  eq(F.nextNode(dental, "stn-intake", fail).to, "stn-intake", "a failed intake is retried");

  // a competency gate, held and not held
  const gateNode = F.nodeById(induction, "gate-induction");
  eq(F.nextNode(induction, "gate-induction", { passed: true, competencies: ["isolation-and-entry-discipline"] }).to, "checkin-close", "a held competency passes the gate");
  eq(F.nextNode(induction, "gate-induction", { passed: true, competencies: [] }).to, "brief-trench", "an unheld competency sends the learner back");
  assert(gateNode.params.stations.length === 3, "the gate reads three stations");

  // an external node: the host's verdict decides, and only that
  eq(F.nextNode(fr, "ext-assessment", { passed: true }).to, "stn-debrief", "a passed host assessment moves on");
  eq(F.nextNode(fr, "ext-assessment", { passed: false }).to, "stn-ems", "a failed host assessment goes back to the EMS call");

  // done
  const end = F.nextNode(induction, "checkin-close", pass);
  eq(end.to, null, "a terminal node has nowhere to go");
  eq(end.done, true, "a terminal node ends the flow");
  eq(end.why, "end of flow", "the reason a flow ended");
  // A node whose every condition fails also ends, and says which case it is.
  const stuck = { id: "x", title: "x", version: 1, start: "a", nodes: [{ id: "a", kind: "checkin" }, { id: "b", kind: "checkin" }], edges: [{ from: "a", to: "b", when: { minStars: 3 } }] };
  const nowhere = F.nextNode(stuck, "a", { passed: false, stars: 0 });
  eq(nowhere.done, true, "no matching branch ends the flow");
  eq(nowhere.why, "no branch condition matched", "and says so");
});

check("the gate is the proof brief's mastery rule, read off the attempt records", () => {
  // >= 2 stars, no unsafe action, every interruption answered, <= 1.5x par.
  const base = { stars: 2, hazardHits: 0, interrupts: { total: 2, answered: 2, missed: 0, wrong: 0 }, seconds: 300, parSeconds: 220 };
  assert(F.mastered(base), "a clean 2-star run inside 1.5x par is mastery");
  assert(!F.mastered({ ...base, stars: 1 }), "one star is not mastery");
  assert(!F.mastered({ ...base, hazardHits: 1 }), "an unsafe action is not mastery");
  assert(!F.mastered({ ...base, interrupts: { total: 2, answered: 1, missed: 1, wrong: 0 } }), "a missed interruption is not mastery");
  assert(!F.mastered({ ...base, seconds: 331 }), "over 1.5x par is not mastery");
  assert(F.mastered({ ...base, seconds: 330 }), "exactly 1.5x par is mastery");

  const induction = flows.get("new-apprentice-safety.json");
  const gate = F.nodeById(induction, "gate-induction");
  const runOf = (outcomes) => ({ history: gate.params.stations.map((ref, i) => ({ ref, outcome: outcomes[i] })), competencies: [] });
  const clean = { passed: true, stars: 3, hazardHits: 0, interrupts: { total: 0, answered: 0, missed: 0, wrong: 0 }, seconds: 100, parSeconds: 220 };
  const held = F.evaluateGate(gate, runOf([clean, clean, clean]), induction);
  assert(held.passed, `a gate over three mastered stations must pass: ${held.why}`);
  eq(held.competencies.join(","), "isolation-and-entry-discipline", "the gate grants its competency");
  eq(held.source, "run evidence", "with no competency layer wired in, the run is the evidence");
  const scraped = F.evaluateGate(gate, runOf([clean, { ...clean, hazardHits: 1 }, clean]), induction);
  assert(!scraped.passed, "an unsafe action in one station must fail the gate");
  assert(/charge-point/.test(scraped.why), `the refusal names the station: ${scraped.why}`);
  // A gate over a station never attempted is not a pass by default.
  assert(!F.evaluateGate(gate, { history: [], competencies: [] }, induction).passed, "an empty run passed a gate");
  // The competency layer is optional and not in this tree; the seam is there.
  assert(!F.hasCompetencyLayer(), "no competency layer should be wired in by default");
  F.setCompetencyResolver(() => true);
  assert(F.hasCompetencyLayer(), "setCompetencyResolver did not take");
  assert(F.evaluateGate(gate, { history: [], competencies: [] }, induction).source === "competency layer", "a wired layer is not the authority");
  F.setCompetencyResolver(null);
  assert(!F.hasCompetencyLayer(), "the resolver did not reset");
});

check("a whole run walks: every node, the branch taken and why, then done", () => {
  const flow = flows.get("new-apprentice-safety.json");
  const clean = { passed: true, stars: 3, hazardHits: 0, interrupts: { total: 0, answered: 0, missed: 0, wrong: 0 }, seconds: 100, parSeconds: 220 };
  let run = F.startRun(flow, { at: 1 });
  eq(run.nodeId, flow.start, "a run starts on the start node");
  eq(F.whyHere(run), "the flow's start node", "and says why");
  run = F.advance(run, flow, F.acknowledgedOutcome(), { at: 2 }).run;      // brief read
  eq(run.nodeId, "stn-trench", "the brief hands over to its station");
  const fail = F.advance(run, flow, { passed: false, stars: 1, hazardHits: 1 }, { at: 3 });
  eq(fail.run.nodeId, "stn-trench", "a failed run repeats the station");
  eq(fail.transition.from, "stn-trench", "the transition names where it came from");
  run = F.advance(fail.run, flow, clean, { at: 4 }).run;
  run = F.advance(run, flow, clean, { at: 5 }).run;
  run = F.advance(run, flow, clean, { at: 6 }).run;
  eq(run.nodeId, "gate-induction", "three clean runs reach the gate");
  const verdict = F.evaluateGate(F.position(run, flow), run, flow);
  const stepped = F.advance(run, flow, verdict, { at: 7 });
  run = stepped.run;
  eq(run.nodeId, "checkin-close", "the gate opens onto the check-in");
  eq(stepped.transition.why, "competency isolation-and-entry-discipline demonstrated", "the branch says why");
  eq(run.competencies.join(","), "isolation-and-entry-discipline", "the run carries the competency");
  const last = F.advance(run, flow, F.acknowledgedOutcome(), { at: 8 });
  assert(last.run.done, "the check-in ends the flow");
  const path = F.pathTaken(last.run, flow);
  eq(path.map((r) => r.id).join(" "), "brief-trench stn-trench stn-trench stn-charge stn-valve gate-induction checkin-close", "the path taken");
  assert(path.every((r) => typeof r.label === "string" && r.label), "every path row has a label to render");
  const b = F.branchTaken(last.run);
  eq(b.from, "checkin-close", "the last branch");
  // Serialisation round-trips both halves.
  eq(F.runFromJSON(F.runToJSON(last.run)).run.nodeId, last.run.nodeId, "a run round-trips through JSON");
  eq(F.flowFromJSON(F.flowToJSON(flow)).flow.id, flow.id, "a flow round-trips through JSON");
  assert(F.flowFromJSON("{not json").error, "invalid JSON is not reported as an error");
  assert(F.runFromJSON(JSON.stringify({ protocol: 99 })).error, "a run from a future protocol was accepted");
});

check("the runner runs a gate itself, parks on an external node and resumes only that node", () => {
  const flow = flows.get("first-responder-refresher.json");
  const store = new Map();
  const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const entered = [], states = [], externals = [], dones = [];
  const runner = F.createFlowRunner({
    app: "smartcity", storage, catalog,
    enter: (node) => { entered.push(node.id); return true; },
    onState: (s, t) => states.push(t?.to ?? s.nodeId),
    onExternal: (p) => externals.push(p.nodeId),
    onDone: (s) => dones.push(s.flowId),
  });
  const loaded = runner.load(flow);
  assert(loaded.ok, `the runner refused a valid flow: ${(loaded.errors ?? []).join("; ")}`);
  runner.start(flow.id);
  eq(entered.at(-1), "stn-sizeup", "the run opens its first station");
  const clean = { passed: true, stars: 3, hazardHits: 0, seconds: 100, parSeconds: 300, interrupts: { total: 0, answered: 0, missed: 0, wrong: 0 } };
  runner.complete(clean);
  eq(entered.at(-1), "stn-ems", "a passed station moves on");
  runner.complete(clean);
  eq(externals.at(-1), "ext-assessment", "the external node was handed to the host");
  eq(runner.current().node.kind, "external", "the run is parked on the host's node");
  assert(entered.at(-1) === "stn-ems", "an external node must not be entered here");
  // A resume for a different node is refused; the right one moves.
  assert(runner.resume({ nodeId: "stn-ems", outcome: { passed: true } }).ok === false, "a resume for the wrong node was accepted");
  const resumed = runner.resume({ nodeId: "ext-assessment", outcome: { passed: true, stars: 3 } });
  assert(resumed.ok !== false, `the resume failed: ${resumed.reason}`);
  eq(entered.at(-1), "stn-debrief", "the host's pass moves the flow on");
  runner.complete(clean);
  eq(runner.current().node.kind, "checkin", "the debrief hands over to the check-in");
  runner.complete(F.acknowledgedOutcome());
  eq(dones.at(-1), flow.id, "the flow reported done");
  assert(states.length >= 6, `every transition reports state (saw ${states.length})`);

  // A gate is never left standing: the runner evaluates it and steps through.
  const induction = flows.get("new-apprentice-safety.json");
  const store2 = new Map();
  const storage2 = { getItem: (k) => (store2.has(k) ? store2.get(k) : null), setItem: (k, v) => store2.set(k, String(v)), removeItem: (k) => store2.delete(k) };
  const at2 = [];
  const r2 = F.createFlowRunner({ app: "smartcity", storage: storage2, catalog, enter: (n) => { at2.push(n.id); return true; } });
  r2.load(induction);
  r2.start(induction.id);
  r2.complete(F.acknowledgedOutcome());                 // brief
  for (let i = 0; i < 3; i += 1) r2.complete({ ...clean, parSeconds: 220 });
  const node = r2.current().node;
  assert(node.kind !== "gate", `the runner left the flow standing on a gate (${node?.id})`);
  eq(node.kind, "checkin", "the gate passed straight through to the check-in");
  const row = r2.rows().find((x) => x.id === induction.id);
  assert(row && row.path.length >= 6, "the panel's rows carry the path");
  assert(row.competencies.includes("isolation-and-entry-discipline"), "the panel's row shows the competency");
});

check("every hop is reported to the host exactly once, in order", () => {
  // A host's record of the branching is only as good as this: a hop reported
  // twice double-counts, and a hop swallowed (the one that arrives at a gate,
  // which the gate then immediately leaves) loses the reason a learner moved.
  const induction = flows.get("new-apprentice-safety.json");
  const store = new Map();
  const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const hops = [];
  const runner = F.createFlowRunner({
    app: "smartcity", storage, catalog, enter: () => true,
    onState: (s, t) => { if (t) hops.push(`${t.from}->${t.to}`); },
  });
  runner.load(induction);
  runner.start(induction.id);
  const clean = { passed: true, stars: 3, hazardHits: 0, seconds: 100, parSeconds: 220, interrupts: { total: 0, answered: 0, missed: 0, wrong: 0 } };
  runner.complete(F.acknowledgedOutcome());
  for (let i = 0; i < 3; i += 1) runner.complete(clean);
  eq(hops.join(" "),
    "brief-trench->stn-trench stn-trench->stn-charge stn-charge->stn-valve stn-valve->gate-induction gate-induction->checkin-close",
    "the hops the host is told about");
  eq(new Set(hops).size, hops.length, "a hop was reported twice");
});

check("the run survives an app switch: one versioned key, flow and node on the link", () => {
  assert(/-v\d+$/.test(F.FLOW_STORE_KEY), `the store key ${F.FLOW_STORE_KEY} is not versioned`);
  const flow = flows.get("new-apprentice-safety.json");
  const store = new Map();
  const storage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const hrefs = [];
  const a = F.createFlowRunner({ app: "smartcity", storage, catalog, enter: (n, { href }) => { hrefs.push(href); return true; } });
  a.load(flow);
  a.start(flow.id);
  eq([...store.keys()].join(","), F.FLOW_STORE_KEY, "the run is kept under exactly one key");
  // A second app on the same origin reads the same key and agrees.
  const b = F.createFlowRunner({ app: "trades", storage, catalog, enter: () => true });
  const restored = b.restore({ flowId: flow.id, nodeId: a.current().run.nodeId });
  assert(restored.ok, `the other app could not restore the run: ${restored.reason}`);
  assert(b.restore({ flowId: flow.id, nodeId: "checkin-close" }).ok === false, "a link naming the wrong node was accepted");
  assert(b.restore({ flowId: "not-a-flow" }).ok === false, "a link naming an unknown flow was accepted");

  // The link itself: the portal's own cross-app shape, with flow and node on it.
  const link = F.appHref({ app: "trades", ref: "electrical", id: "n1", kind: "station" }, { flowId: flow.id, nodeId: "n1" });
  assert(link.startsWith("../trades/index.html?"), `a Trade Skills node link should reach that app: ${link}`);
  for (const part of ["room=electrical", `flow=${flow.id}`, "node=n1"]) assert(link.includes(part), `the link is missing ${part}: ${link}`);
  const holo = F.appHref({ app: "holodeck", ref: "trench-box", id: "n2", kind: "station" }, { flowId: flow.id, nodeId: "n2" });
  assert(holo.includes("station=trench-box"), `a Holodeck node link names the station: ${holo}`);
  eq(F.parseFlowLink(`?sim=trench-box&flow=${flow.id}&node=stn-trench`).nodeId, "stn-trench", "the link parses back");
  eq(F.parseFlowLink("?flow=NOT A SLUG").flowId, null, "a junk flow id on a link is ignored");
  // And a storage that throws (private mode) must not take the page down.
  const hostile = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); }, removeItem() { throw new Error("blocked"); } };
  const c = F.createFlowRunner({ app: "smartcity", storage: hostile, catalog, enter: () => true });
  assert(c.load(flow).ok, "a blocked localStorage stopped a flow from loading");
  assert(c.start(flow.id).ok !== false, "a blocked localStorage stopped a flow from starting");
});

check("the platform channel declares the flow protocol and versions it", () => {
  eq(P.PROTOCOL, 2, "the platform protocol");
  for (const v of [1, 2]) assert(P.ACCEPTED_HOST_PROTOCOLS.includes(v), `platform protocol ${v} is not accepted`);
  eq(P.FLOW_LOAD, "smartcitix:flow.load", "flow.load");
  eq(P.FLOW_START, "smartcitix:flow.start", "flow.start");
  eq(P.FLOW_RESUME, "smartcitix:flow.resume", "flow.resume");
  eq(P.FLOW_STATE, "smartcitix:flow.state", "flow.state");
  eq(P.FLOW_DONE, "smartcitix:flow.done", "flow.done");
  eq(P.FLOW_EXTERNAL, "smartcitix:flow.external", "flow.external");
  for (const c of P.FLOW_COMMANDS) assert(P.COMMANDS.includes(c), `${c} is not in COMMANDS, so no app would accept it`);
  for (const c of P.BASE_COMMANDS) assert(P.COMMANDS.includes(c), `${c} was dropped from COMMANDS`);
  // The generated catalog is what a host indexes without loading the app.
  eq(catalog.protocol, P.PROTOCOL, "catalog.json protocol");
  for (const c of P.FLOW_COMMANDS) assert((catalog.launch.commands ?? []).some((s) => s.startsWith(c)), `catalog.json does not advertise ${c}`);
  for (const e of P.FLOW_EVENTS) assert((catalog.launch.events ?? []).includes(e), `catalog.json does not advertise ${e}`);
});

check("all three learner apps answer flow.load, flow.start and flow.resume", () => {
  const apps = {
    "SmartCiti.X": read("WebXR/smartcity/js/app.js"),
    "Trade Skills": read("WebXR/trades/js/app.js"),
    Holodeck: read("WebXR/holodeck/js/app.js"),
  };
  for (const [name, src] of Object.entries(apps)) {
    const at = src.indexOf("Platform.init(");
    assert(at > 0, `${name} has no Platform.init handler`);
    const handler = src.slice(at, at + 9000);
    // By constant, not by literal: a misspelt string would pass a literal test.
    for (const c of ["FLOW_LOAD", "FLOW_START", "FLOW_RESUME"]) {
      assert(handler.includes(`type === ${c}`), `${name}'s platform handler does not answer ${c}`);
    }
    assert(src.includes('from "../../shared/platform.js"'), `${name} does not import the platform channel`);
    assert(/import \{[^}]*FLOW_LOAD[^}]*\} from "\.\.\/\.\.\/shared\/platform\.js"/s.test(src), `${name} does not import the flow constants from platform.js`);
    assert(src.includes('createFlowRunner'), `${name} does not use the shared flow runner`);
    assert(src.includes("Platform.flowState("), `${name} never emits flow.state`);
    assert(src.includes("Platform.flowDone("), `${name} never emits flow.done`);
    assert(src.includes("Platform.flowExternal("), `${name} never emits flow.external`);
    // A flow must never invent a verdict: it reads the attempt record.
    assert(src.includes("outcomeFromRecord("), `${name} does not take its flow outcome from the attempt record`);
    // And the instructor console's command lands in the same place.
    assert(src.includes('cmd.kind === "flow"'), `${name} does not answer the console's flow command`);
    assert(src.includes('logInstructorAction("flow"'), `${name} answers the flow command without recording it`);
  }
});

check("the instructor console can load a flow and send it, through the declared command", () => {
  const app = read("WebXR/instructor/js/app.js");
  const html = read("WebXR/instructor/index.html");
  assert(OBS.CMD_FLOW === "flow", `CMD_FLOW is ${OBS.CMD_FLOW}`);
  assert(OBS.INSTRUCTOR_COMMANDS.includes(OBS.CMD_FLOW), "CMD_FLOW is not a declared instructor command");
  assert(OBS.COMMAND_LABELS[OBS.CMD_FLOW], "CMD_FLOW has no label for the console and the docs");
  assert(app.includes("bus.flow("), "the console has no control that sends a flow");
  assert(app.includes("validateFlow("), "the console sends a flow without checking it first");
  assert(app.includes('fetch("../flows/index.json")'), "the console does not read the published example flows");
  for (const id of ["flow-pick", "flow-load", "flow-json", "flow-send", "flow-send-all", "flow-state"]) {
    assert(html.includes(`id="${id}"`), `the console page has no #${id}`);
  }
  // The console is a DOM page: untrusted text (a host's flow title) as text only.
  for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "document.write"]) {
    assert(!app.includes(sink), `the console uses ${sink}`);
  }
  // The observer leg carries the graph as a checked payload, not as a label.
  const obs = read("WebXR/shared/observer.js");
  assert(obs.includes("function clipFlow("), "observer.js has no size/shape check for a flow payload");
  assert(/flow: clipFlow\(m\.flow\)/.test(obs), "a flow payload is not passed to the app's handler");
});

check("the Flows panel is rendered from plain data and offers Continue and Restart", () => {
  const ui = read("WebXR/smartcity/js/react-ui.js");
  const app = read("WebXR/smartcity/js/app.js");
  assert(ui.includes("function FlowsCard()"), "react-ui.js has no Flows panel");
  assert(ui.includes("h(FlowsCard)"), "the Flows panel is never mounted");
  assert(ui.includes("function FlowPath("), "the panel has no path diagram");
  const card = ui.slice(ui.indexOf("function FlowPath("), ui.indexOf("function RecordsCard()"));
  assert(!card.includes("dangerouslySetInnerHTML"), "the Flows panel sets markup from a string — a flow's title comes from a host");
  for (const want of ["actions.flowContinue", "actions.flowRestart", "actions.closeFlows"]) {
    assert(card.includes(want), `the panel has no ${want}`);
  }
  for (const want of ["viewFlows", "closeFlows", "flowContinue", "flowRestart", "flowSelect"]) {
    assert(new RegExp(`\\b${want}\\b`).test(app), `app.js has no ${want} action`);
  }
  assert(/flows: \{ visible: false/.test(app), "app.js has no flows slice in the store");
  assert(ui.includes('label: "Flows"'), "there is no way into the Flows panel from the intro card");
  const css = read("WebXR/smartcity/index.html");
  for (const cls of ["flow-list", "flow-card", "flow-diagram", "flow-node"]) {
    assert(css.includes(`.${cls}`), `index.html has no style for .${cls}`);
  }
});

check("flowhub.js is pure: no DOM, no three.js, no app import", () => {
  const src = read("WebXR/shared/flowhub.js");
  const imports = [...src.matchAll(/^import .*from "([^"]+)";$/gm)].map((m) => m[1]);
  assert(imports.length === 0, `flowhub.js imports ${imports.join(", ")} — it must stay Node-testable on its own`);
  for (const f of ["document.", "window.", "addEventListener(", "three.module"]) {
    assert(!src.includes(f), `flowhub.js reaches for ${f}`);
  }
  // It must not import the competency layer that is not in this tree.
  assert(!src.includes('from "./competency.js"'), "flowhub.js imports a module that does not exist here");
  assert(src.includes("hasCompetencyLayer"), "flowhub.js has no feature check for the competency layer");
  // The docs are part of the contract: the schema and the honesty about FlowHub.
  const docs = read("docs/flowhub.md");
  for (const want of ["smartcitix:flow.load", "smartcitix:flow.start", "smartcitix:flow.state", "smartcitix:flow.done", "smartcitix:flow.external", "smartcitix:flow.resume", "```mermaid", F.FLOW_STORE_KEY]) {
    assert(docs.includes(want), `docs/flowhub.md does not document ${want}`);
  }
  // Prose wraps, so these are matched across line breaks.
  const flat = docs.replace(/\s+/g, " ");
  assert(/no FlowHub specification exists in this repository/i.test(flat), "docs/flowhub.md does not say that no FlowHub specification exists here");
  assert(/SmartCiti\.X side of (the|this) contract/i.test(flat), "docs/flowhub.md does not state that this is the SmartCiti.X side of the contract");
  for (const [file, flow] of flows) {
    assert(docs.includes(flow.id), `docs/flowhub.md does not describe ${file}`);
  }
});

console.log(failed ? `\n${failed} flowhub check(s) failed.` : "\nAll FlowHub checks pass.");
process.exit(failed ? 1 : 0);
