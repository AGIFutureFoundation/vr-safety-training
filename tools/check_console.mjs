#!/usr/bin/env node
/**
 * The instructor console's gate (WebXR/instructor/, WebXR/shared/observer.js).
 *
 *     node tools/check_console.mjs
 *
 * A control on the console is only real if the learner app answers it, so this
 * asserts the facts that make that true and cannot be seen in a screenshot:
 *
 *   1. every command constant the protocol declares is handled in SmartCiti.X's
 *      command handler, and the four that mean something everywhere are handled
 *      in Trade Skills and Holodeck too;
 *   2. every command a learner app answers is written into the attempt record
 *      as an instructorAction, and every app records them;
 *   3. reduceRoster handles every learner event the protocol declares;
 *   4. the console page sets no HTML from a string — a crew tag, a station
 *      tagline and an instructor's own note are untrusted by the time they
 *      reach it;
 *   5. the catalog roster the Roster view renders covers every SmartCiti.X
 *      station in catalog.json, so "send the class here" can reach all of them.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failed = 0;
const check = (name, fn) => { try { fn(); console.log(`  ✓ ${name}`); } catch (e) { failed += 1; console.log(`  ✗ ${name}\n      ${e.message}`); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const obs = await import("../WebXR/shared/observer.js");
const { INSTRUCTOR_COMMANDS, LEARNER_EVENTS, CMD_ROLL, COMMAND_LABELS, OBSERVER_PROTOCOL, ACCEPTED_PROTOCOLS } = obs;
const { buildRoster, matchStation, matchProgramme } = await import("../WebXR/instructor/js/roster.js");
const { SIMS_META } = await import("../WebXR/smartcity/js/sims-meta.js");

const catalog = JSON.parse(read("WebXR/smartcity/catalog.json"));
const SMARTCITY_STATIONS = catalog.stations.filter((s) => s.app === "smartcity");

// A roll call is answered inside observer.js itself, not in an app's handler:
// it carries no instruction, it only asks a running session to say hello.
const ANSWERED_BY_APPS = INSTRUCTOR_COMMANDS.filter((c) => c !== CMD_ROLL);
// The four that mean the same thing in every app. The others are SmartCiti.X's
// because only it has a stage with weather, a device profile per station and a
// programmes panel.
// A flow is a graph the console hands over, so every app that can run a station
// can run one: all three answer it (shared/flowhub.js, docs/flowhub.md).
const EVERYWHERE = ["note", "freeze", "open", "interrupt", "flow"];

const APPS = {
  "SmartCiti.X": { src: read("WebXR/smartcity/js/app.js"), commands: ANSWERED_BY_APPS },
  "Trade Skills": { src: read("WebXR/trades/js/app.js"), commands: EVERYWHERE },
  Holodeck: { src: read("WebXR/holodeck/js/app.js"), commands: EVERYWHERE },
};

console.log("Instructor console — self-test\n");

check("the protocol is bumped and still accepts every version before it", () => {
  assert(OBSERVER_PROTOCOL === 3, `expected protocol 3, got ${OBSERVER_PROTOCOL}`);
  for (const v of [1, 2, 3]) assert(ACCEPTED_PROTOCOLS.includes(v), `protocol ${v} is no longer accepted`);
  for (const cmd of INSTRUCTOR_COMMANDS) assert(COMMAND_LABELS[cmd], `${cmd} has no label for the console and the docs`);
});

for (const [app, { src, commands }] of Object.entries(APPS)) {
  check(`${app} handles every command it claims`, () => {
    const handler = src.slice(src.indexOf("observer.onCommand("));
    assert(handler.length > 200, `${app} has no observer.onCommand handler`);
    for (const cmd of commands) {
      assert(handler.includes(`cmd.kind === "${cmd}"`), `${app} does not handle ${cmd}`);
    }
  });
  check(`${app} writes every instructor command into the attempt record`, () => {
    assert(/instructorActions:\s*\[\.\.\.instructorActions\]/.test(src), `${app} does not put instructorActions on the record`);
    assert(src.includes("function logInstructorAction("), `${app} has no logInstructorAction`);
    // Each handled command must log: a command with a learner-visible effect
    // and no record entry is exactly what the proof brief forbids.
    const handler = src.slice(src.indexOf("observer.onCommand("), src.indexOf("observer.onCommand(") + 9000);
    for (const cmd of commands) {
      const label = cmd === "hazard-mode" ? "hazard-mode" : cmd;
      assert(handler.includes(`logInstructorAction("${label}"`), `${app} handles ${cmd} without recording it`);
    }
  });
}

check("SmartCiti.X answers a fired interruption through the station's own layer", () => {
  const src = APPS["SmartCiti.X"].src;
  // The command must arm the declared interruption and let the engine fire it,
  // so the learner meets the same banner, clock and scoring a naturally-timed
  // one produces. Anything that called the hooks directly would be a caption.
  assert(/it\.armedAt = s\.elapsed/.test(src), "CMD_INTERRUPT does not arm the declared interruption for now");
  assert(!/hooks\.onInterrupt/.test(src), "the app must not call the engine's interrupt hook itself");
});

check("SmartCiti.X applies the instructor's weather and profile to the next station", () => {
  const src = APPS["SmartCiti.X"].src;
  assert(/const stationWeather = instructorWeather \?\? room\.weather;/.test(src), "the station's weather is not overridable");
  assert(/weatherUnder\(PROFILE, stationWeather\)/.test(src), "the stage is not built with the overridden weather");
  assert(/deviceForInstructor\(instructorDeviceId\)/.test(src), "the device profile is not applied on entering a station");
  assert(/hazardMode === "coach"/.test(src), "coaching mode is not honoured where hazards are handled");
});

check("reduceRoster handles every learner event the protocol declares", () => {
  const src = read("WebXR/shared/observer.js");
  const body = src.slice(src.indexOf("export function reduceRoster"));
  const constant = { hello: "EV_HELLO", state: "EV_STATE", step: "EV_STEP", hazard: "EV_HAZARD", action: "EV_ACTION", finish: "EV_FINISH", bye: "EV_BYE" };
  for (const kind of LEARNER_EVENTS) {
    const name = constant[kind];
    assert(name, `${kind} has no constant in this checker — the protocol grew`);
    assert(body.includes(`ev.kind === ${name}`), `reduceRoster ignores ${name}`);
    const roster = obs.reduceRoster(new Map(), { id: "s-1", kind, at: Date.now(), app: "smartcity", learner: "Z" });
    assert(roster.get("s-1"), `folding a ${kind} event produced no row`);
  }
});

check("the console sets no HTML from a string", () => {
  for (const file of ["WebXR/instructor/js/app.js", "WebXR/instructor/js/roster.js", "WebXR/instructor/index.html"]) {
    const src = read(file);
    const js = file.endsWith(".html") ? src.slice(src.indexOf("<body")) : src;
    for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "dangerouslySetInnerHTML", "document.write"]) {
      assert(!js.includes(sink), `${file} uses ${sink} — untrusted text must be set as a text node`);
    }
  }
  const app = read("WebXR/instructor/js/app.js");
  assert(app.includes("textContent"), "the console sets nothing as text at all, which cannot be right");
  // And it must not reach into a simulator: the console speaks only through the
  // observer protocol and the static catalog (see tools/briefs/proof-brief.md).
  for (const f of ["smartcity/js/sims/", "citykit.js", "gamify.js", "shared/game.js"]) {
    assert(!app.includes(f), `the console imports simulator code (${f})`);
  }
});

check("every control the console offers is a declared command", () => {
  const app = read("WebXR/instructor/js/app.js");
  const called = [...app.matchAll(/bus\.([a-zA-Z]+)\(/g)].map((m) => m[1]);
  const allowed = new Set(["roll", "note", "freeze", "open", "interrupt", "weather", "profile", "hazardMode", "assign", "flow", "close"]);
  for (const name of called) assert(allowed.has(name), `the console calls bus.${name}(), which the protocol does not declare`);
  for (const want of ["open", "interrupt", "weather", "profile", "hazardMode", "assign", "note", "freeze", "flow"]) {
    assert(called.includes(want), `the console has no control that sends ${want}`);
  }
});

check("the console page has a control for each of the protocol's commands", () => {
  const html = read("WebXR/instructor/index.html");
  for (const id of ["roll", "note", "send", "hold", "release", "weather-send", "profile-send", "coach", "assess", "assign", "flow-pick", "flow-load", "flow-json", "flow-send", "panel-ints", "panel-steps", "roster-search", "log-csv"]) {
    assert(html.includes(`id="${id}"`), `the page has no #${id}`);
  }
});

check("the catalog roster covers every SmartCiti.X station", () => {
  const roster = buildRoster(catalog);
  // The roster is right when it carries every registered station, whatever
  // the count is this week: compare against sims-meta, not a number.
  assert(SIMS_META.length > 0 && SMARTCITY_STATIONS.length === SIMS_META.length, `expected ${SIMS_META.length} SmartCiti.X stations in the catalog (sims-meta), found ${SMARTCITY_STATIONS.length}`);
  const inTree = new Set();
  for (const cat of roster.categories) for (const s of cat.stations) inTree.add(`${s.app}:${s.id}`);
  for (const s of SMARTCITY_STATIONS) {
    assert(inTree.has(`smartcity:${s.id}`), `${s.id} is in the catalog but not in the roster tree`);
  }
  assert(roster.total === catalog.stations.length, `the roster lists ${roster.total} of ${catalog.stations.length} rows`);
  // Every row carries what the Roster view prints, or the view would render an
  // "undefined" at a learner.
  for (const row of roster.stations) {
    for (const field of ["id", "name", "category", "weather"]) {
      assert(row[field] !== undefined && row[field] !== "", `${row.id}: the roster row has no ${field}`);
    }
  }
  assert(roster.programmes.length === catalog.curricula.length, "the roster drops programmes");
  for (const p of roster.programmes) assert(p.stations.length > 0, `programme ${p.id} has no stations`);
  assert(roster.weatherKinds.length >= 5, "the weather picker has nothing to offer");
});

check("the roster search finds a station by id, trade, certification and category", () => {
  const roster = buildRoster(catalog);
  const box = roster.stations.find((s) => s.id === "trench-box");
  assert(box, "trench-box is missing from the roster");
  assert(matchStation(box, "trench"), "id search misses");
  assert(matchStation(box, box.trade.slice(0, 8)), "trade search misses");
  assert(matchStation(box, "Subpart P"), "certification search misses");
  assert(matchStation(box, box.category), "category search misses");
  assert(!matchStation(box, "zzzz-not-a-station"), "search matches everything");
  assert(roster.stations.filter((s) => matchStation(s, "")).length === roster.total, "an empty search hides stations");
  const programme = roster.programmes[0];
  assert(matchProgramme(programme, programme.stations[0].id), "a programme is not found by a station it contains");
});

check("the relay is documented and has a server with no dependencies", () => {
  const server = read("tools/relay_server.mjs");
  assert(/from "node:http"/.test(server), "the relay server does not use the built-in http server");
  const imports = [...server.matchAll(/^import .*from "([^"]+)";$/gm)].map((m) => m[1]);
  for (const spec of imports) assert(spec.startsWith("node:"), `the relay server depends on ${spec}`);
  const docs = read("docs/instructor-console.md");
  for (const cmd of INSTRUCTOR_COMMANDS) assert(docs.includes(cmd), `docs/instructor-console.md does not document ${cmd}`);
  assert(docs.includes("relay_server.mjs") && docs.includes("?relay="), "the docs do not say how to run the relay");
});

console.log(failed ? `\n${failed} console check(s) failed.` : "\nAll instructor-console checks pass.");
process.exit(failed ? 1 : 0);
