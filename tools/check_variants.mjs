/**
 * Holds assessment variants to the one rule that matters.
 *
 *     node tools/check_variants.mjs
 *
 * A variant exists so the second attempt at a station is not a memory test.
 * It is allowed to change what the run asks of the learner — hints, alarms,
 * the clock, the order of a sequence the procedure itself calls
 * order-independent. It is never allowed to change what is correct. Get that
 * wrong and the platform teaches a wrong procedure to everybody who retakes,
 * which is worse than having no variants at all.
 *
 * Every station in both apps is put through every level, so the guarantee is
 * about the generator rather than about one example of it.
 */
import { loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { makeVariant, LEVELS } from "../WebXR/shared/variants.js";

const city = await loadSmartCity();
const trades = await loadTrades();
const all = [...city.ROOMS, ...trades.ROOMS];

let failures = 0;
const bad = (m) => { failures += 1; console.log(`  ✗ ${m}`); };
const ok = (m) => console.log(`  ✓ ${m}`);

console.log(`Assessment variants — ${all.length} stations x ${Object.keys(LEVELS).length} levels\n`);

let made = 0, shuffled = 0, rehung = 0;
for (const base of all) {
  for (const level of Object.keys(LEVELS)) {
    const v = makeVariant(base, { seed: 2026, level });
    if (!v) { bad(`${base.id}/${level}: produced nothing`); continue; }
    made += 1;

    // The procedure itself is untouched.
    if (v.steps.length !== base.steps.length) bad(`${base.id}/${level}: step count changed`);
    for (let i = 0; i < base.steps.length; i++) {
      const a = base.steps[i], b = v.steps[i];
      if (a.id !== b.id) { bad(`${base.id}/${level}: step ${i} is "${b.id}", was "${a.id}" — order changed`); break; }
      if (a.kind !== b.kind) bad(`${base.id}/${level}/${a.id}: kind changed`);
      if (a.target !== b.target) bad(`${base.id}/${level}/${a.id}: target changed`);
      if (a.why !== b.why) bad(`${base.id}/${level}/${a.id}: the reason it is right was rewritten`);
      // Item order may only move where the procedure says order does not matter.
      if (Array.isArray(a.targets)) {
        const same = a.targets.length === b.targets.length && a.targets.every((t, k) => t === b.targets[k]);
        if (!same) {
          if (!a.anyOrder) bad(`${base.id}/${level}/${a.id}: shuffled an ordered sequence`);
          else shuffled += 1;
          const sameSet = a.targets.length === b.targets.length && [...a.targets].sort().join() === [...b.targets].sort().join();
          if (!sameSet) bad(`${base.id}/${level}/${a.id}: the sequence gained or lost an item`);
        }
      }
    }
    // Hazards are the station's, never the variant's to edit.
    if (JSON.stringify(v.hazards ?? {}) !== JSON.stringify(base.hazards ?? {})) bad(`${base.id}/${level}: hazards changed`);

    // Hints follow the level, and an assessment must actually suppress them.
    const lv = LEVELS[level];
    if (!lv.hints && !v.steps.every((s) => s.noHint)) bad(`${base.id}/${level}: an assessment run left hints on`);

    // Every interruption still points at something real, and none of them
    // answer with the control of the step they interrupt.
    for (const it of v.interrupts ?? []) {
      const host = v.steps.find((s) => s.id === it.after);
      if (!host) { bad(`${base.id}/${level}/${it.id}: hung off step "${it.after}" which does not exist`); continue; }
      if (host.target === it.target || (host.targets ?? []).includes(it.target)) {
        bad(`${base.id}/${level}/${it.id}: answers with the control of the step it interrupts`);
      }
      if ((it.seconds ?? 0) < 6) bad(`${base.id}/${level}/${it.id}: ${it.seconds}s is not long enough to notice and answer`);
      if (it.variantOf && it.after !== it.variantOf) rehung += 1;
    }
    if ((v.interrupts ?? []).length !== (base.interrupts ?? []).length) {
      bad(`${base.id}/${level}: interruption count changed`);
    }
    if (v.parSeconds > (base.parSeconds ?? 240)) bad(`${base.id}/${level}: par got longer, not tighter`);
    if (v.parSeconds < 60) bad(`${base.id}/${level}: par of ${v.parSeconds}s is not a procedure, it is a scramble`);
  }
}
if (!failures) ok(`${made} variants built; every one keeps the steps, targets, order and reasons of its station`);
if (!failures) ok(`${shuffled} order-independent sequences reshuffled, ${rehung} alarms rehung on a different step`);

// A seed is a promise: the same seed has to issue the same assessment to a
// whole apprenticeship, or comparing two learners means nothing.
const sig = (v) => JSON.stringify([v.steps.map((s) => s.targets ?? s.target), (v.interrupts ?? []).map((i) => [i.after, i.seconds])]);
const sample = all[0];
if (sig(makeVariant(sample, { seed: 99 })) !== sig(makeVariant(sample, { seed: 99 }))) {
  bad("the same seed produced two different assessments");
} else ok("the same seed reproduces the same assessment exactly");

// A station with something to reshuffle must actually differ between seeds.
// One with nothing to reshuffle must report that rather than implying a fresh
// run — the first check here failed for exactly that reason, on a station with
// no alarms and no order-independent step, which was the test's fault and not
// the generator's.
const varied = all.find((r) => (r.interrupts ?? []).length > 1);
if (varied) {
  const seeds = [1, 2, 3, 4, 5].map((n) => sig(makeVariant(varied, { seed: n })));
  if (new Set(seeds).size < 2) bad(`${varied.id} has alarms to move but every seed produced the same run`);
  else ok(`a station with alarms to move produces ${new Set(seeds).size} distinct runs across five seeds`);
}
const flatStation = all.find((r) => !(r.interrupts ?? []).length
  && !r.steps.some((s) => s.anyOrder && (s.targets ?? []).length > 2));
if (flatStation) {
  const v = makeVariant(flatStation, { seed: 7 });
  if (v.variant.variety !== 0) bad(`${flatStation.id} reported variety it does not have`);
  else if (v.variant.differs.some((d) => /alarm|sequence/.test(d))) bad(`${flatStation.id} claims a difference it cannot deliver`);
  else ok(`a station with nothing to reshuffle reports honestly: "${v.variant.differs.join(", ")}"`);
}

console.log(failures ? `\n${failures} variant problem(s) found.` : "\nAll variant checks pass.");
process.exit(failures ? 1 : 0);
