/**
 * Interruptions, validated like steps and hazards are.
 *
 * An interruption fires mid-procedure, demands a specific control inside a
 * few seconds, and counts as an unsafe action when it is missed (see the
 * interrupt layer in shared/game.js). That makes every field of it
 * load-bearing: an `after` naming a step that does not exist never fires, a
 * `target` that is not in the scene cannot be answered, and a missNote that
 * does not say what would have happened teaches nothing.
 *
 *     node tools/check_interrupts.mjs
 */
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";

const city = await loadSmartCity();
const trades = await loadTrades();

let failures = 0;
const note = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };
let total = 0, withAny = 0;

function audit(app, suite, r) {
  const list = r.interrupts ?? [];
  if (!list.length) return;
  withAny += 1;
  const root = new suite.THREE.Group();
  let hits = {}, api = null;
  try { api = r.build(root); hits = api?.hits ?? {}; } catch { /* the content checkers own this */ }
  const stepIds = new Set(r.steps.map((s) => s.id));
  const seen = new Set();

  for (const it of list) {
    total += 1;
    const tag = `${app}/${r.id}/${it.id ?? "(no id)"}`;
    if (!it.id) note(tag, "no id");
    else if (seen.has(it.id)) note(tag, "duplicate id");
    seen.add(it.id);

    if (!stepIds.has(it.after)) note(tag, `fires after "${it.after}", which is not a step in this procedure — it would never fire`);
    if (!hits[it.target]) note(tag, `wants "${it.target}", which is not an interactable in the scene — it could not be answered`);
    // The response must not be the control the learner is already holding, or
    // there is nothing to notice and nothing to break off from.
    const onStep = r.steps.find((s) => s.id === it.after);
    if (onStep && (onStep.target === it.target || (onStep.targets ?? []).includes(it.target))) {
      note(tag, `answers with "${it.target}", which is the target of the step it interrupts — that is not an interruption, it is a nudge`);
    }
    // On a drive step the learner's hands are on the wheel, so the answer has
    // to be a cab control the step names (drive.controls) — the brake, the
    // horn, the CB radio — which a key or a pad button reaches without
    // letting go of the drive to go and click something.
    if (onStep?.kind === "drive" && !Object.values(onStep.drive?.controls ?? {}).includes(it.target)) {
      note(tag, `is armed on the drive step "${onStep.id}" but wants "${it.target}", which is not one of that step's drive.controls — a driver could only answer it by letting go of the wheel`);
    }
    if (!(it.seconds >= 6 && it.seconds <= 30)) note(tag, `gives ${it.seconds}s: under 6 is a reflex test, over 30 is not an interruption`);
    if (!(it.delay >= 2)) note(tag, `fires ${it.delay}s into the step — give the learner time to be busy first`);

    for (const [field, min] of [["alert", 40], ["why", 60], ["missNote", 80]]) {
      const v = it[field];
      if (typeof v !== "string" || v.trim().length < min) {
        note(tag, `${field} is ${v ? `${v.trim().length} chars` : "missing"}, needs at least ${min} — this is the teaching, not a label`);
      }
    }
    if (it.wrongNote != null && String(it.wrongNote).trim().length < 40) note(tag, "wrongNote is too short to be worth showing");
    if (typeof it.kind !== "string" || !it.kind.trim()) note(tag, "no kind — the banner needs a word for what this is");

    // A station may make the interruption visible in the world — a fan that
    // stops, a lock gone off the hasp. Those hooks run inside the frame loop,
    // so a throw there takes the whole run down.
    for (const [hook, arg] of [["onInterrupt", it], ["onInterruptEnd", { ...it, resolved: "answered" }], ["onInterruptEnd", { ...it, resolved: "missed" }]]) {
      try { api?.[hook]?.(arg, null); }
      catch (e) { note(tag, `${hook}() threw: ${e.message}`); }
    }
  }
}

for (const r of city.ROOMS) audit("smartcity", city, r);
for (const r of trades.ROOMS) audit("trades", trades, r);

// And the engine actually honours them.
const withInterrupts = [...city.ROOMS, ...trades.ROOMS].find((r) => (r.interrupts ?? []).length);
if (withInterrupts) {
  const suite = city.ROOMS.includes(withInterrupts) ? city : trades;
  const it = withInterrupts.interrupts[0];
  const s = new suite.Session(withInterrupts, {});
  s.start();
  // Walk to the step it hangs off, then let the clock run past its fuse.
  const at = withInterrupts.steps.findIndex((st) => st.id === it.after);
  s.index = at; s.enterStep();
  s.tick(it.delay + 0.2);
  if (!s.activeInterrupt) note(`engine/${withInterrupts.id}`, "an armed interruption did not fire after its delay");
  else {
    const before = s.hazardHits;
    s.tick((it.seconds ?? 12) + 0.5);
    if (s.activeInterrupt) note(`engine/${withInterrupts.id}`, "an unanswered interruption did not time out");
    if (s.hazardHits !== before + 1) note(`engine/${withInterrupts.id}`, "a missed interruption did not count as an unsafe action");
    const sum = s.interruptSummary();
    if (!sum || sum.missed !== 1) note(`engine/${withInterrupts.id}`, "the summary did not record the miss");
  }
  // Leaving the step disarms it. A stale arm fires several steps later, where
  // the alert makes no sense and reaching for the control the CURRENT step
  // wants is scored as a wrong response to an alarm nobody could expect.
  // Walk onto a step that has no interruption of its own, so anything that
  // fires can only be the stale one. Landing on a step that does have one was
  // reported as this bug when the engine was behaving correctly.
  const armed = new Set(withInterrupts.interrupts.map((i) => i.after));
  const quiet = withInterrupts.steps.findIndex((st, i) => i > at && !armed.has(st.id));
  if (quiet !== -1) {
    const s3 = new suite.Session(withInterrupts, {});
    s3.start(); s3.index = at; s3.enterStep();
    s3.index = quiet; s3.enterStep();
    s3.tick((it.delay ?? 3) + (it.seconds ?? 12) + 1);
    if (s3.activeInterrupt) note(`engine/${withInterrupts.id}`, "an interruption armed on a step the learner had already left still fired");
    if (s3.hazardHits) note(`engine/${withInterrupts.id}`, "a disarmed interruption was still counted against the learner");
  }

  // And answering it scores.
  const s2 = new suite.Session(withInterrupts, {});
  s2.start(); s2.index = at; s2.enterStep(); s2.tick(it.delay + 0.2);
  const score = s2.score;
  s2.select(it.target);
  if (s2.score <= score) note(`engine/${withInterrupts.id}`, "answering an interruption correctly scored nothing");
  if (s2.activeInterrupt) note(`engine/${withInterrupts.id}`, "answering did not clear the alarm");
}

// And one armed on a drive step: it fires while the vehicle is moving, the
// cab control it names answers it (the brake from the brake edge, anything
// else from its check key or its control), and the route carries on to the
// end clean afterwards.
const drivers = [...city.ROOMS].filter((r) => (r.interrupts ?? []).some((i) => r.steps.find((st) => st.id === i.after)?.kind === "drive"));
let driveArmed = 0;
for (const r of drivers) {
  for (const it of r.interrupts) {
    const host = r.steps.find((st) => st.id === it.after);
    if (host?.kind !== "drive") continue;
    driveArmed += 1;
    const s = new city.Session(r, {});
    s.start();
    s.index = r.steps.indexOf(host); s.enterStep();
    for (let i = 0; i < 4000 && !s.activeInterrupt && s.step === host; i++) { const a = city.drivePolicy(s); s.driveInput(a); if (a.check) s.driveCheck(a.check); s.tick(0.05); }
    if (!s.activeInterrupt) { note(`engine/${r.id}/${it.id}`, "armed on a drive step but never fired while the vehicle was driven — the route is shorter than its fuse"); continue; }
    const name = Object.entries(host.drive?.controls ?? {}).find(([, id]) => id === it.target)?.[0];
    const before = s.score;
    if (name === "brake") { s.driveInput({ throttle: 0.2 }); s.driveInput({ throttle: -1 }); }
    else if (name === "radio") s.driveControl("radio");
    else if (name) s.driveCheck(name);
    if (s.activeInterrupt || s.interruptLog.at(-1)?.outcome !== "answered" || s.score <= before) { note(`engine/${r.id}/${it.id}`, `the cab control "${name}" did not answer the interruption on the drive step`); continue; }
    const hz = s.hazardHits;
    for (let i = 0; i < 4000 && s.step === host; i++) { const a = city.drivePolicy(s); s.driveInput(a); if (a.check) s.driveCheck(a.check); s.tick(0.05); }
    if (s.step === host) note(`engine/${r.id}/${it.id}`, "after the interruption the drive never reached the end of its route");
    else if (s.hazardHits !== hz) note(`engine/${r.id}/${it.id}`, "answering the interruption left the driver out of lane or band long enough to be scored unsafe");
  }
}

// Every interruption must visibly change the world. A banner on its own is a
// caption: the skill being taught is noticing something, and there has to be
// something to notice. tools/interrupt_react.mjs is the detailed report; this
// is the gate.
const react = await import("./interrupt_react.mjs").then((m) => m.reactionReport(), (e) => {
  note("engine/reactions", `could not run the reaction probe: ${e.message}`);
  return null;
});
if (react) {
  for (const id of react.silent) note(id, "fires without changing anything in the scene — add an onInterrupt hook to the station, or it is a caption rather than something to notice");
}

console.log(failures
  ? `\n${failures} interruption problem(s) found.`
  : `\n${total} interruption${total === 1 ? "" : "s"} across ${withAny} procedure${withAny === 1 ? "" : "s"} check out: the engine fires, times out and scores them, ${driveArmed} armed on drive steps are answered from the cab, and all ${react?.reacting ?? 0} visibly change the world.`);
process.exit(failures ? 1 : 0);
