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
  let hits = {};
  try { hits = r.build(root)?.hits ?? {}; } catch { /* the content checkers own this */ }
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
  // And answering it scores.
  const s2 = new suite.Session(withInterrupts, {});
  s2.start(); s2.index = at; s2.enterStep(); s2.tick(it.delay + 0.2);
  const score = s2.score;
  s2.select(it.target);
  if (s2.score <= score) note(`engine/${withInterrupts.id}`, "answering an interruption correctly scored nothing");
  if (s2.activeInterrupt) note(`engine/${withInterrupts.id}`, "answering did not clear the alarm");
}

console.log(failures
  ? `\n${failures} interruption problem(s) found.`
  : `\n${total} interruption${total === 1 ? "" : "s"} across ${withAny} procedure${withAny === 1 ? "" : "s"} check out, and the engine fires, times out and scores them.`);
process.exit(failures ? 1 : 0);
