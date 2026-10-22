/**
 * Holds incident replay to the two rules that matter.
 *
 *     node tools/check_incidents.mjs
 *
 * A replay is built from a real crew's bad day and handed back to that crew,
 * so it carries two promises. The first is the same one variants.js makes:
 * the station underneath is the station as authored — same steps, same
 * targets, same order, same hazards, same reasons — because a drill built
 * from an incident is still a drill in a procedure, and a procedure that
 * drifts teaches a wrong job. The second is specific to this layer: the event
 * added on top has to be answerable. An interruption pointing at a control
 * that is not in the scene, or at the control of the step it interrupts, is
 * scored by the engine as an unsafe action the learner could not have
 * avoided — the drill would punish people for the tool's mistake.
 *
 * The realistic reports below are checked one by one, and then every station
 * in both apps is put through the same mill, so the guarantee is about the
 * generator rather than about the examples.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity, loadTrades, loadIncidentStage } from "./lib/headless.mjs";
import { parseIncident, buildReplay, describeReplay } from "../WebXR/shared/incidents.js";

// The scene half comes through the headless harness rather than a direct
// import: it builds geometry, so it reaches kit.js and the CDN three.js.
const { stageReplay } = await loadIncidentStage();

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
// The roster this feature sees is the published station metadata, not the
// modules — a station that is not on it cannot be replayed, which is correct.
const roster = catalog.stations.filter((s) => !s.flat).map((s) => ({
  app: s.app, id: s.id, name: s.name, trade: s.trade ?? "", tagline: s.tagline ?? "",
}));

const city = await loadSmartCity();
const trades = await loadTrades();
const suiteOf = (base) => (city.ROOMS.includes(base) ? city : trades);
const stations = new Map([...city.ROOMS, ...trades.ROOMS].map((r) => [r.id, r]));

let failures = 0;
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

// Things a steward actually says at a toolbox talk, in the words they say
// them in — including the two that name no step and the one that names the
// station only by its trade-floor nickname.
const REPORTS = [
  "last Tuesday a lock came off the hasp on the substation job while the crew was testing dead",
  "on the trench box job the excavator swung round while we were setting the box and nobody was spotting",
  "gas alarm went off in the digester gas building during the purge",
  "a member of the public walked into the crane yard while the operator was reading the load chart",
  "on the tower climb a hand let his lanyard go while transitioning at the antenna",
  "chlorine room: the leak alarm sounded while the tech was changing the cylinder",
  "the forklift dock job, a truck pulled away from the dock while the operator was still on the trailer",
  "in the data hall a contractor pulled the wrong breaker while we were doing the transfer",
  "mast climber job, the wind picked up while the platform was at height",
  "boiler room, the burner tripped out while we were purging",
  "somebody walked past the weld bay without a screen while the arc was struck",
  "elevator pit: the car came down on us, nobody had told the machine room",
];

// Text that names no station on the roster. Refusing these is the feature
// working, not the feature failing: a drill on the wrong station is a lie
// told to the crew it actually happened to.
const JUNK = [
  "the coffee machine in the break room is broken again",
  "please summarise last month's incidents for me",
  "we need more parking at the union hall",
  "hi",
  "the guys want a toolbox talk on something this week",
  "",
];

/** Everything the station itself says, so borrowed sentences can be proved to be borrowed. */
function stationProse(base) {
  const bits = [];
  for (const s of base.steps) {
    bits.push(s.title ?? "", s.cue ?? "", s.why ?? "");
    for (const v of Object.values(s.itemNames ?? {})) bits.push(v);
  }
  for (const it of base.interrupts ?? []) bits.push(it.alert ?? "", it.why ?? "", it.missNote ?? "");
  return bits.join(" \u0000 ");
}

/**
 * Everything in the generated text that is neither the reporter's sentence
 * nor the station's own words. Rule five of this layer is that a replay does
 * not write safety advice, and what that comes down to in practice is how
 * much text is left over once the two honest sources are taken out.
 */
function leftover(text, incident, prose) {
  let rest = String(text ?? "").replace(incident.summary, " ");
  for (const sentence of prose.split(/[\u0000.]/).map((x) => x.trim()).filter((x) => x.length > 20)) {
    rest = rest.split(sentence).join(" ");
  }
  return rest.replace(/\s+/g, " ").trim();
}

/** The one interruption a replay is allowed to have added. */
const injectedOf = (base, replay) => replay.interrupts[(base.interrupts ?? []).length];

function validate(label, base, incident, replay, hits) {
  // The station underneath is the station.
  if (replay.steps.length !== base.steps.length) bad(`${label}: step count changed`);
  for (let i = 0; i < base.steps.length; i++) {
    const a = base.steps[i], b = replay.steps[i];
    if (a.id !== b.id) { bad(`${label}: step ${i} is "${b.id}", was "${a.id}" — order changed`); break; }
    if (a.kind !== b.kind) bad(`${label}/${a.id}: kind changed`);
    if (a.target !== b.target) bad(`${label}/${a.id}: target changed`);
    if (a.why !== b.why) bad(`${label}/${a.id}: the reason it is right was rewritten`);
    if ((a.targets ?? []).join() !== (b.targets ?? []).join()) bad(`${label}/${a.id}: the sequence changed`);
    if (!!a.noHint !== !!b.noHint) bad(`${label}/${a.id}: hints changed — that is a variant's business, not a replay's`);
  }
  if (JSON.stringify(replay.hazards ?? {}) !== JSON.stringify(base.hazards ?? {})) bad(`${label}: hazards changed`);
  if (replay.parSeconds !== base.parSeconds) bad(`${label}: par changed — the procedure takes as long as it takes`);
  if (replay.build !== base.build && typeof replay.build !== "function") bad(`${label}: lost the scene`);

  // The station's own alarms are still there, untouched, and exactly one was
  // added. A replay that dropped an authored interruption would quietly make
  // the drill easier than the station it claims to be.
  const baseList = base.interrupts ?? [];
  if (replay.interrupts.length !== baseList.length + 1) {
    bad(`${label}: ${replay.interrupts.length} interruptions where the station has ${baseList.length} — a replay adds one`);
    return;
  }
  for (let i = 0; i < baseList.length; i++) {
    if (JSON.stringify(replay.interrupts[i]) !== JSON.stringify(baseList[i])) bad(`${label}: rewrote the station's own "${baseList[i].id}" interruption`);
  }

  const it = injectedOf(base, replay);
  const host = replay.steps.find((s) => s.id === it.after);
  if (!host) { bad(`${label}/${it.id}: hung off step "${it.after}", which is not in this procedure — it would never fire`); return; }
  if (baseList.some((b) => b.id === it.id)) bad(`${label}/${it.id}: reuses an id the station already has`);
  // Rule two, and the engine's own checker enforces it on authored content
  // for the same reason: an alarm answered by the control already in the
  // learner's hand is a nudge, not something to notice.
  if (host.target === it.target || (host.targets ?? []).includes(it.target)) {
    bad(`${label}/${it.id}: answers with "${it.target}", the control of the step it interrupts — that is a nudge, not an interruption`);
  }
  if (!hits[it.target]) bad(`${label}/${it.id}: wants "${it.target}", which is not an interactable in the scene — it could not be answered`);
  if (!(it.seconds >= 6)) bad(`${label}/${it.id}: ${it.seconds}s is not long enough to notice and answer`);
  if (it.seconds > 30) bad(`${label}/${it.id}: ${it.seconds}s is not an interruption any more`);
  if (!(it.delay >= 2)) bad(`${label}/${it.id}: fires ${it.delay}s into the step — give the learner time to be busy first`);
  if (typeof it.kind !== "string" || !it.kind.trim()) bad(`${label}/${it.id}: no kind — the banner needs a word for what this is`);

  // Rule five: the learner-facing text is the reporter's sentence and the
  // station's own words, and what is left over is short and factual.
  if (it.alert !== incident.summary) bad(`${label}/${it.id}: the alert is not the report — a replay quotes, it does not paraphrase`);
  const prose = stationProse(base);
  for (const field of ["why", "missNote"]) {
    if (!String(it[field]).includes(incident.summary)) bad(`${label}/${it.id}: ${field} does not carry the report it was built from`);
    const extra = leftover(it[field], incident, prose);
    if (extra.length > 140) bad(`${label}/${it.id}: ${field} adds ${extra.length} chars of its own prose — "${extra.slice(0, 80)}…"`);
  }
  // Invented regulation is the specific lie that would matter most: a replay
  // has no standing to cite a standard nobody named.
  const STANDARD = /\b(OSHA|NFPA|ANSI|ASTM|IEEE|29 CFR|1910\.\d|1926\.\d|70E)\b/;
  for (const field of ["alert", "cue", "why", "missNote", "wrongNote"]) {
    const v = String(it[field] ?? "");
    if (STANDARD.test(v) && !STANDARD.test(incident.summary) && !prose.includes(v.match(STANDARD)[0])) {
      bad(`${label}/${it.id}: ${field} cites a standard that is in neither the report nor the station`);
    }
  }
  // And the replay's own record of itself has to be true, because an
  // instructor issues a drill off that line without opening the station.
  const r = replay.replay ?? {};
  if (r.stepId !== host.id || r.target !== it.target || r.interruptId !== it.id) bad(`${label}: the replay card does not describe the drill it built`);
  if (r.placement === "hinted" && !incident.stepHint) bad(`${label}: claims the report placed the event when the report said no such thing`);
  const owners = replay.steps.filter((s) => s.target === it.target || (s.targets ?? []).includes(it.target));
  if (r.grounded && !owners.some((s) => s.why && String(it.why).includes(s.why))) {
    bad(`${label}: claims the station's own words are in the teaching text when they are not`);
  }
  if (!r.grounded && owners.some((s) => s.why && String(it.why).includes(s.why))) {
    bad(`${label}: quotes the station and reports itself as ungrounded`);
  }
  if (r.sharesStep !== (base.interrupts ?? []).some((b) => b.after === it.after)) {
    bad(`${label}: the card is wrong about whether the station already interrupts that step`);
  }
}

console.log(`Incident replay — ${REPORTS.length} reports, ${roster.length} stations on the roster\n`);

// 1. The reports a steward would actually bring.
const built = [];
for (const text of REPORTS) {
  const incident = parseIncident(text, roster);
  if (!incident) { bad(`"${text.slice(0, 48)}…": named no station — the roster has one`); continue; }
  const base = stations.get(incident.stationId);
  if (!base) { bad(`"${text.slice(0, 48)}…": matched "${incident.stationId}", which is not a station that loads`); continue; }
  const replay = buildReplay(base, incident);
  if (!replay) { bad(`${incident.stationId}: parsed the report and then built nothing`); continue; }
  const root = new (suiteOf(base).THREE.Group)();
  let hits = {};
  try { hits = base.build(root)?.hits ?? {}; } catch (e) { bad(`${base.id}: the station would not build headless (${e.message})`); }
  validate(incident.stationId, base, incident, replay, hits);
  built.push({ text, incident, base, replay });
}
if (built.length === REPORTS.length) {
  ok(`${REPORTS.length} reports each replay on the station they name, with the event hung off the step they point at`);
}
const placed = built.filter((b) => b.replay.replay.placement === "hinted").length;
ok(`${placed} of ${built.length} landed on a step the report itself named; the rest say so on the card`);

// 2. Every station in both apps, put through the same mill. A synthetic
// report names the station and one of its own steps, which is the least the
// matcher has to manage: if a station cannot recognise its own name, nobody
// will ever be able to replay an incident on it.
let swept = 0, refused = [];
for (const base of [...city.ROOMS, ...trades.ROOMS]) {
  const meta = roster.find((s) => s.id === base.id);
  if (!meta) continue;
  const step = base.steps[Math.min(2, base.steps.length - 1)];
  const text = `On the ${meta.name} job somebody walked into the area while the crew was ${String(step.title ?? step.id).toLowerCase()}`;
  const incident = parseIncident(text, roster);
  if (!incident) { bad(`${base.id}: does not recognise a report that names it outright`); continue; }
  if (incident.stationId !== base.id) { bad(`${base.id}: a report naming it was matched to "${incident.stationId}"`); continue; }
  const replay = buildReplay(base, incident);
  if (!replay) {
    // A refusal is allowed and is the honest answer when nothing in the scene
    // can be defended as the response to this event — but only then. A
    // station whose author already wrote an interruption always has at least
    // one control that is worth breaking off a step for.
    if ((base.interrupts ?? []).length) bad(`${base.id}: refused to place an event although the station has an interruption answer of its own`);
    else refused.push(base.id);
    continue;
  }
  const root = new (suiteOf(base).THREE.Group)();
  let hits = {};
  try { hits = base.build(root)?.hits ?? {}; } catch { /* the content checkers own this */ }
  validate(base.id, base, incident, replay, hits);
  swept += 1;
}
if (!failures) ok(`${swept} stations host a valid replay; every one keeps its steps, targets, order, hazards and reasons`);
if (refused.length) ok(`${refused.length} stations refused this event rather than inventing a control for it: ${refused.join(", ")}`);

// 3. Junk is refused.
for (const text of JUNK) {
  const incident = parseIncident(text, roster);
  if (incident) bad(`"${text}" was read as an incident on ${incident.stationId} — it names no station`);
}
if (!JUNK.some((t) => parseIncident(t, roster))) ok(`${JUNK.length} pieces of text that name no station all return null`);

// A report parsed against one station cannot be built onto another. This is
// the mistake that would put a real crew's event on a procedure it never
// happened on.
const first = built[0];
const other = [...stations.values()].find((r) => r.id !== first.incident.stationId);
if (buildReplay(other, first.incident)) bad("built a replay of one station's incident onto a different station");
else ok("an incident parsed for one station will not build onto another");

// The same report twice is the same drill. An instructor runs a toolbox talk
// twice in a week and both crews have to meet the same event.
const again = buildReplay(first.base, parseIncident(first.text, roster));
const sig = (r) => JSON.stringify([r.steps.map((s) => s.target ?? s.targets), r.interrupts]);
if (sig(again) !== sig(first.replay)) bad("the same report produced two different drills");
else ok("the same report builds the same drill every time");

// 4. The engine actually plays it. Everything above is shape; this is the
// only part that proves a learner would meet the event at all.
const playable = built.find((b) => !(b.base.interrupts ?? []).some((i) => i.after === b.replay.replay.stepId));
if (!playable) bad("no test replay landed on a step of its own — the engine test cannot isolate the injected event");
else {
  const { base, replay } = playable;
  const suite = suiteOf(base);
  const it = injectedOf(base, replay);
  const at = replay.steps.findIndex((s) => s.id === it.after);

  const missRun = new suite.Session(replay, {});
  missRun.start();
  missRun.index = at; missRun.enterStep();
  missRun.tick(it.delay + 0.2);
  if (missRun.activeInterrupt?.id !== it.id) bad(`engine/${base.id}: the injected event did not fire ${it.delay}s into "${it.after}"`);
  else {
    const before = missRun.hazardHits;
    missRun.tick(it.seconds + 0.5);
    if (missRun.activeInterrupt) bad(`engine/${base.id}: the injected event did not time out`);
    if (missRun.hazardHits !== before + 1) bad(`engine/${base.id}: missing the injected event did not count as an unsafe action`);
    if (missRun.interruptSummary()?.missed !== 1) bad(`engine/${base.id}: the summary did not record the miss`);
    ok(`the engine fires the injected event during "${it.after}" and scores a miss as an unsafe action`);
  }

  const answerRun = new suite.Session(replay, {});
  answerRun.start();
  answerRun.index = at; answerRun.enterStep();
  answerRun.tick(it.delay + 0.2);
  const score = answerRun.score;
  answerRun.select(it.target);
  if (answerRun.activeInterrupt) bad(`engine/${base.id}: answering the injected event did not clear it`);
  else if (answerRun.score <= score) bad(`engine/${base.id}: answering the injected event correctly scored nothing`);
  else if (answerRun.hazardHits) bad(`engine/${base.id}: answering correctly was still counted against the learner`);
  else ok(`answering it at "${it.target}" scores and clears the alarm, with nothing held against the learner`);

  // The station's scene has to survive the hooks it never knew about: a
  // replay's event has an id no station file was written for.
  const root = new (suite.THREE.Group)();
  const api = base.build(root);
  for (const [hook, arg] of [["onInterrupt", it], ["onInterruptEnd", { ...it, resolved: "answered" }], ["onInterruptEnd", { ...it, resolved: "missed" }]]) {
    try { api?.[hook]?.(arg, null); }
    catch (e) { bad(`${base.id}: ${hook}() threw on an injected event id (${e.message})`); }
  }

  // 5. The event has to be something you notice, not a caption. A station's
  // own hooks dispatch on ids their author wrote, so an injected event fires
  // straight past them; the replay stages its own beacon for exactly this
  // reason. Same test tools/interrupt_react.mjs puts the authored ones
  // through: snapshot the whole tree before, during and after.
  const snap = (o) => {
    const rows = [];
    const matIds = new Map(); let n = 1;
    const mid = (m) => { if (!m || typeof m !== "object") return ""; if (!matIds.has(m)) matIds.set(m, n++); return matIds.get(m); };
    o.traverse((x) => rows.push(`${x.visible}|${x.position?.x},${x.position?.y},${x.position?.z}|${x.scale?.x},${x.scale?.y},${x.scale?.z}|${mid(x.material)}|${x.material?.emissiveIntensity ?? ""}`));
    return rows.join(";");
  };
  let staged = 0;
  for (const b of built) {
    if (b.replay.replay.staged) bad(`${b.base.id}: a replay built with no stager claimed to be staged`);
    // Rebuilt with the scene half wired, which is how the app builds it.
    const withStage = buildReplay(b.base, b.incident, { stage: stageReplay });
    if (!withStage.replay.staged) bad(`${b.base.id}: a staged replay did not say so on its card`);
    const r2 = new (suiteOf(b.base).THREE.Group)();
    const scene = withStage.build(r2);
    const evt = injectedOf(b.base, withStage);
    const idle = snap(r2);
    scene.onInterrupt?.(evt, null);
    const live = snap(r2);
    scene.onInterruptEnd?.({ ...evt, resolved: "answered" }, null);
    const after = snap(r2);
    if (live === idle) bad(`${b.base.id}: the injected event changed nothing in the scene — that is a caption, not an event`);
    else if (after !== idle) bad(`${b.base.id}: the scene did not go back to how it was once the event was answered`);
    else staged++;
  }
  if (staged === built.length) ok(`all ${staged} replays stage the event in the room and put the room back when it is answered`);

  // The beacon is not allowed to be the answer, or to point at it. A learner
  // who follows the new light straight to the control has not been taught
  // anything the report could teach them.
  const beaconIsAnswer = built.some((b) => {
    const r2 = new (suiteOf(b.base).THREE.Group)();
    const withStage = buildReplay(b.base, b.incident, { stage: stageReplay });
    const scene = withStage.build(r2);
    const evt = injectedOf(b.base, withStage);
    const answer = scene.hits?.[evt.target];
    const before = snap(answer ?? r2);
    scene.onInterrupt?.(evt, null);
    return !!answer && snap(answer) !== before;
  });
  if (beaconIsAnswer) bad("firing the event changed the answer control itself — the drill gives itself away");
  else ok("the staged event never touches the control that answers it");
}

// A report is quoted verbatim into an interruption's alert, and the HUDs put
// an alert into the page as markup. Nothing a learner types may arrive there
// as a tag.
{
  const nasty = parseIncident('near miss last week on the trench box <img src=x onerror="alert(1)"> while setting the box', roster);
  if (!nasty) bad("the markup probe did not parse as an incident, so this check proves nothing");
  else {
    const r = buildReplay(stations.get(nasty.stationId), nasty);
    const text = JSON.stringify(r.interrupts[r.interrupts.length - 1]);
    if (/[<>]/.test(text)) bad("a report reached an interruption's text with angle brackets still in it");
    else ok("markup a learner types is stripped before it is quoted into a drill");
  }
}

// 6. None of the above matters if the app builds replays without a stager.
// This is the one thing the module cannot prove about itself.
{
  const app = readFileSync(join(ROOT, "WebXR/holodeck/js/app.js"), "utf8");
  const call = app.match(/buildReplay\([^;]*?\)/s)?.[0] ?? "";
  if (!call) bad("the Holodeck app never calls buildReplay — the feature is not reachable");
  else if (!/stage:\s*stageReplay/.test(call)) bad("the Holodeck app builds replays with no stager, so the event would be a banner and an unchanged room");
  else ok("the Holodeck app builds its replays with the scene half wired in");
}

if (!failures) {
  console.log(`\nExample: ${describeReplay(built[0].replay)}`);
  console.log("All incident replay checks pass.");
} else {
  console.log(`\n${failures} incident replay problem(s) found.`);
}
process.exit(failures ? 1 : 0);
