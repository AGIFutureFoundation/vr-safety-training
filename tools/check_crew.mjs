/**
 * Holds the crew-role split to the two rules that matter.
 *
 *     node tools/check_crew.mjs
 *
 * A role view exists so that a two-person procedure is practised as two
 * people: one learner owns their own duties and has to confirm — not perform
 * — the other's. It is allowed to change who does a step. It is never allowed
 * to change the procedure, and it is never allowed to invent a division of
 * duties the station did not state. The second one is the dangerous one: a
 * plausible-looking wrong split teaches a whole apprenticeship that the
 * attendant sets the ventilation or that the rigger reads the load chart, and
 * they will carry that onto a real job. Declining to split is always the
 * cheaper mistake, so this checker treats an honest single-role report as a
 * pass and a confident guess as a failure.
 *
 * Every station in both apps goes through the splitter, so the guarantee is
 * about the splitter rather than about the handful of stations it splits.
 */
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { ROLES, PAIRS, splitByRole, roleView, roleViews, describeSplit } from "../WebXR/shared/crew.js";

const city = await loadSmartCity();
const trades = await loadTrades();
const all = [...city.ROOMS.map((r) => [r, city]), ...trades.ROOMS.map((r) => [r, trades])];

let failures = 0;
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);
const nameOf = (r) => r.name ?? r.title ?? r.id;

console.log(`Crew roles — ${all.length} stations, ${PAIRS.length} crew pairings, ${Object.keys(ROLES).length - 1} role archetypes\n`);

/** The full identity of a step, so "the same step" means every part of it. */
const sig = (s) => JSON.stringify([s.id, s.kind, s.target ?? null, s.targets ?? null, s.title, s.cue, s.why,
  s.seconds ?? null, s.gauge?.green ?? null, s.track?.green ?? null, s.turn?.turns ?? null, s.drag?.radius ?? null]);

// Play a role view the way the content checkers play a station, so "a room
// object of the same shape the Session engine plays" is a proven claim rather
// than an assertion about object literals.
function playable(view, suite) {
  const root = new suite.THREE.Group();
  view.build(root);
  const session = new suite.Session(view).start();
  let guard = 0;
  while (session.step && guard++ < 200) {
    const st = session.step;
    if (session.activeInterrupt) { session.select(session.activeInterrupt.target); continue; }
    if (st.kind === "select") session.select(st.target);
    else if (st.kind === "sequence" || st.kind === "find") for (const t of st.targets) session.select(t);
    else if (st.kind === "gauge") { const [lo, hi] = st.gauge?.green ?? [0.44, 0.62]; if (session.gauge) session.gauge.t = (lo + hi) / 2; session.select(st.target); }
    else if (st.kind === "hold") { session.setHolding(true); for (let i = 0; i < st.seconds * 20 + 4 && session.step === st; i++) session.tick(0.05); }
    else if (st.kind === "track") {
      session.setHolding(true);
      const [lo, hi] = st.track?.green ?? [0.42, 0.62];
      session.track = { v: (lo + hi) / 2, green: [lo, hi], rise: 0, fall: 0, drift: 0, wobble: 0, inBand: 0, dropouts: 0, wasIn: true };
      for (let i = 0; i < (st.seconds ?? 5) * 20 + 4 && session.step === st; i++) session.tick(0.05);
    } else if (st.kind === "turn") session.rotate(st.target, (st.turn?.turns ?? 1) + 1);
    else if (st.kind === "drag") session.dropAt(st.target, 0);
    else return { finished: false, why: `step "${st.id}" is of unknown kind "${st.kind}"` };
    if (session.step === st) return { finished: false, why: `stuck on step "${st.id}"` };
  }
  return { finished: session.finished, errors: session.errors, why: session.finished ? null : "ran out of moves" };
}

let splitCount = 0, declined = 0, watchSteps = 0, ownedSteps = 0, played = 0;
const splitNames = [];

for (const [station, suite] of all) {
  const id = station.id;
  const split = splitByRole(station);

  // The split has to be a fact about the station, not about when it was asked.
  if (JSON.stringify(splitByRole(station).assignments) !== JSON.stringify(split.assignments)) {
    bad(`${id}: two calls to splitByRole produced two different splits`);
  }
  // Whatever it decides, every step has exactly one owner and no step is lost.
  const stepIds = station.steps.map((s) => s.id);
  const assigned = Object.keys(split.assignments);
  if (assigned.length !== stepIds.length || stepIds.some((sid) => !(sid in split.assignments))) {
    bad(`${id}: ${assigned.length} assignments for ${stepIds.length} steps — a step has no owner`);
  }

  if (!split.split) {
    declined += 1;
    // An honest decline says so out loud and names one role: the whole crew.
    if (split.roles.length !== 1 || split.roles[0].id !== "solo") bad(`${id}: declined but reported ${split.roles.length} role(s)`);
    if (!split.reason) bad(`${id}: declined without saying why`);
    if (Object.values(split.assignments).some((r) => r !== "solo")) bad(`${id}: declined but handed steps to a role anyway`);
    for (const orphan of split.unassigned) if (!stepIds.includes(orphan)) bad(`${id}: reported "${orphan}" unassigned, which is not one of its steps`);
    // A single-role station plays exactly as authored — no view, no rewrite.
    const views = roleViews(station);
    if (views.length !== 1 || views[0] !== station) bad(`${id}: a single-role station produced a rewritten room instead of itself`);
    continue;
  }

  splitCount += 1;
  splitNames.push(describeSplit(station, split));

  // Two roles, a real pair, each one the other's counterpart.
  const pair = PAIRS.find((p) => p.id === split.pair);
  if (!pair) { bad(`${id}: split under a pairing "${split.pair}" that is not declared`); continue; }
  if (split.roles.length !== 2) { bad(`${id}: a two-person procedure came back with ${split.roles.length} role(s)`); continue; }
  const [a, b] = split.roles;
  if (a.counterpart !== b.id || b.counterpart !== a.id) bad(`${id}: ${a.id} and ${b.id} are not each other's counterpart`);
  if (a.id === "solo" || b.id === "solo") bad(`${id}: split into the single-role placeholder`);
  if (split.unassigned.length) bad(`${id}: reported a split with ${split.unassigned.length} unassigned step(s)`);

  // No step belongs to two roles: one owner each, and both owners are real.
  const owners = {};
  for (const sid of stepIds) {
    const owner = split.assignments[sid];
    if (owner !== a.id && owner !== b.id) bad(`${id}/${sid}: owned by "${owner}", which is not one of this station's roles`);
    owners[owner] = (owners[owner] ?? 0) + 1;
  }
  for (const role of split.roles) {
    if ((owners[role.id] ?? 0) !== role.owns) bad(`${id}: ${role.id} reports ${role.owns} step(s) but owns ${owners[role.id] ?? 0}`);
    if ((owners[role.id] ?? 0) < 2) bad(`${id}: ${role.id} owns ${owners[role.id] ?? 0} step(s) — that is a cameo, not a role`);
  }

  // The rule that makes the split mean anything: you cannot be the person you
  // are reaching for, so no role owns a step that targets its own post.
  for (const step of station.steps) {
    const mine = ROLES[split.assignments[step.id]];
    const targets = [step.target, ...(step.targets ?? [])].filter(Boolean);
    if (mine.posts && targets.some((t) => mine.posts.test(t))) {
      bad(`${id}/${step.id}: the ${mine.name.toLowerCase()} was given a step whose target is their own post`);
    }
  }

  const views = split.roles.map((r) => [r.id, roleView(station, r.id, split)]);
  const ownedAcross = new Map();

  for (const [roleId, view] of views) {
    if (!view) { bad(`${id}/${roleId}: no view was produced`); continue; }
    const them = ROLES[ROLES[roleId].counterpart];

    // Same procedure: same steps, in the same order, with the same targets.
    if (view.steps.length !== station.steps.length) { bad(`${id}/${roleId}: step count changed`); continue; }
    for (let i = 0; i < station.steps.length; i++) {
      const authored = station.steps[i], shown = view.steps[i];
      if (authored.id !== shown.id) { bad(`${id}/${roleId}: step ${i} is "${shown.id}", was "${authored.id}" — order changed`); break; }
      const authoredTargets = [authored.target, ...(authored.targets ?? [])].filter(Boolean);

      if (split.assignments[authored.id] === roleId) {
        // A step you own is the authored step, untouched.
        ownedSteps += 1;
        if (sig(authored) !== sig(shown)) bad(`${id}/${roleId}/${authored.id}: a step this role owns was rewritten`);
        if (shown.watch) bad(`${id}/${roleId}/${authored.id}: a step this role owns was turned into a watch step`);
        const seen = ownedAcross.get(authored.id);
        if (seen) bad(`${id}/${authored.id}: owned by both ${seen} and ${roleId}`);
        ownedAcross.set(authored.id, roleId);
      } else {
        // A step you do not own becomes a confirmation — and nothing is lost.
        watchSteps += 1;
        if (!shown.watch) { bad(`${id}/${roleId}/${authored.id}: not owned by this role and not a watch step either`); continue; }
        if (shown.kind !== "select") bad(`${id}/${roleId}/${authored.id}: a watch step of kind "${shown.kind}" still makes the learner do the job`);
        if (shown.watch.of !== authored.kind) bad(`${id}/${roleId}/${authored.id}: the authored kind "${authored.kind}" was not kept`);
        if (shown.watch.by !== them.id) bad(`${id}/${roleId}/${authored.id}: attributed to "${shown.watch.by}", not to the ${them.name.toLowerCase()}`);
        if (shown.watch.targets.join() !== authoredTargets.join()) bad(`${id}/${roleId}/${authored.id}: the step's targets were not kept`);
        if (shown.target !== authoredTargets[0]) bad(`${id}/${roleId}/${authored.id}: watch target "${shown.target}" is not the step's own control`);
        // Kind-specific configuration left on a watch step would have the
        // engine run the gauge, the hold or the drag the other person owns.
        for (const key of ["targets", "gauge", "track", "turn", "drag", "seconds", "anyOrder"]) {
          if (shown[key] !== undefined) bad(`${id}/${roleId}/${authored.id}: watch step still carries "${key}"`);
        }
        if (!shown.why?.includes(authored.why)) bad(`${id}/${roleId}/${authored.id}: the reason the step is right was dropped`);
      }
    }

    // The station's own judgements are not the view's to edit.
    if (JSON.stringify(view.hazards ?? {}) !== JSON.stringify(station.hazards ?? {})) bad(`${id}/${roleId}: hazards changed`);
    if (JSON.stringify(view.lateNotes ?? {}) !== JSON.stringify(station.lateNotes ?? {})) bad(`${id}/${roleId}: late notes changed`);
    if (view.parSeconds !== station.parSeconds) bad(`${id}/${roleId}: par changed`);
    if (view.id === station.id) bad(`${id}/${roleId}: the view kept the station's own id and would overwrite its record`);

    // Interruptions still belong to the run, except the one kind that cannot:
    // an alarm answered by this role's own post, which would have the learner
    // fetch themselves.
    const viewIds = view.steps.map((s) => s.id);
    for (const it of view.interrupts ?? []) {
      if (!viewIds.includes(it.after)) bad(`${id}/${roleId}/${it.id}: hung off step "${it.after}" which does not exist`);
      if (ROLES[roleId].posts && ROLES[roleId].posts.test(it.target)) {
        bad(`${id}/${roleId}/${it.id}: this role is asked to answer an alarm by reaching for their own post`);
      }
    }
    const dropped = (station.interrupts ?? []).length - (view.interrupts ?? []).length;
    if (dropped !== view.crew.droppedInterrupts) bad(`${id}/${roleId}: dropped ${dropped} interruption(s) but reported ${view.crew.droppedInterrupts}`);

    const run = playable(view, suite);
    if (!run.finished) bad(`${id}/${roleId}: the view does not play to the end — ${run.why}`);
    else if (run.errors) bad(`${id}/${roleId}: a clean run of the view scored ${run.errors} error(s)`);
    else played += 1;
  }

  // The union of the views is the station: every step owned once, by somebody.
  if (ownedAcross.size !== station.steps.length) {
    bad(`${id}: the role views between them own ${ownedAcross.size} of ${station.steps.length} steps`);
  }
  const rebuilt = station.steps
    .map((s) => views.find(([r]) => r === ownedAcross.get(s.id))?.[1].steps.find((v) => v.id === s.id))
    .filter(Boolean);
  if (rebuilt.length !== station.steps.length || rebuilt.some((s, i) => sig(s) !== sig(station.steps[i]))) {
    bad(`${id}: putting the roles' own steps back together does not reproduce the station`);
  }
}

if (!failures) {
  ok(`${splitCount} station(s) split into role views; ${ownedSteps} owned steps came through byte-identical and in order`);
  ok(`${watchSteps} watch steps keep their authored kind, targets and reason, and none of them run the task`);
  ok(`${played} role views played end to end through the Session engine with no corrections`);
  ok(`${declined} station(s) reported single-role rather than guessing a split`);
}

// The gate has to be live. A splitter that never declines is not being
// careful, it is being lucky — and the first check here was written after a
// draft happily split a lasher's procedure between the lasher and a crane
// operator who does not appear in it.
if (!declined) bad("no station declined — the splitter is not refusing anything");
if (!splitCount) bad("no station split — the splitter is refusing everything");

// Evidence, not vocabulary: a station may not be split because a `why` says
// the word "attendant". It is split because the second person is in the scene.
for (const [station] of all) {
  const split = splitByRole(station);
  if (!split.split) continue;
  const pair = PAIRS.find((p) => p.id === split.pair);
  if (pair.evidence !== "ids") continue;
  const ids = new Set();
  for (const s of station.steps) { if (s.target) ids.add(s.target); for (const t of s.targets ?? []) ids.add(t); }
  for (const it of station.interrupts ?? []) if (it.target) ids.add(it.target);
  if (![...ids].some((i) => pair.test.test(i))) {
    bad(`${station.id}: split as a ${pair.name.toLowerCase()} pair with no second post anywhere in the scene`);
  }
}

// A station with a second person in the scene whose duties are not authored
// must come back single-role. Container Lashing is the case that proves it:
// the crane is on the radio through the whole job and does not own one step
// of it, so there is nothing to give a second learner.
const oneSided = all.map(([r]) => r).find((r) => r.id === "container-lashing");
if (oneSided) {
  const s = splitByRole(oneSided);
  if (s.split) bad(`${oneSided.id}: split a procedure that is all one post's work`);
  else if (!/owns 0 step/.test(s.reason)) bad(`${oneSided.id}: declined, but not because the second role has nothing to do — "${s.reason}"`);
  else ok(`a station whose second person never acts reports single-role: "${s.reason}"`);
}

// And a station that models nobody at all must not be talked into a pairing.
const alone = all.map(([r]) => r).find((r) => r.id === "charge-point");
if (alone) {
  const s = splitByRole(alone);
  if (s.split) bad(`${alone.id}: split a one-person job`);
  else if (s.unassigned.length) bad(`${alone.id}: attempted a split on a station with no second role`);
  else ok(`a one-person job is not offered a crew: "${s.reason}"`);
}

if (!failures) for (const line of splitNames) console.log(`    · ${line}`);

console.log(failures ? `\n${failures} crew-role problem(s) found.` : "\nAll crew-role checks pass.");
process.exit(failures ? 1 : 0);
