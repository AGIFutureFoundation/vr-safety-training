/**
 * Assessment variants: the same procedure, a different run.
 *
 * The weakness in any authored simulator is the second attempt. A learner who
 * repeats a station learns the answer key — which control, in which order,
 * with the hint rail naming it — and the score stops measuring competence and
 * starts measuring recall. Every station here is authored, so every station
 * has this problem, and subsetting steps (scenarios.js) does not fix it.
 *
 * A variant changes what the run asks of the learner without ever changing
 * what is correct. That distinction is the whole design:
 *
 *   varied      hints, the alarms that fire and when, the time allowed, and
 *               the order of steps the procedure itself says may be done in
 *               any order
 *   never       the steps, their targets, their kinds, the order of anything
 *               order-critical, the hazards, or the reason any of it is right
 *
 * Reordering a procedure would teach a wrong procedure, so it is not on the
 * list however much it would vary the run. The seed makes a variant
 * reproducible: an instructor can issue the same assessment to a whole
 * apprenticeship and compare like with like.
 */

/** Small deterministic PRNG, so a seed always produces the same variant. */
function variantRng(seed) {
  let s = (typeof seed === "string"
    ? [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
    : (seed >>> 0)) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function shuffle(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const LEVELS = {
  // Hints stay on; this is a practice re-run with a different alarm pattern.
  practice: { id: "practice", name: "Practice variant", hints: true, par: 1.0, interruptScale: 1.0, extraInterrupts: 0 },
  // The assessment a certificate is issued against.
  assessment: { id: "assessment", name: "Assessment run", hints: false, par: 0.85, interruptScale: 0.8, extraInterrupts: 0 },
  // For a learner who has passed and wants the procedure under pressure.
  pressure: { id: "pressure", name: "Under pressure", hints: false, par: 0.7, interruptScale: 0.6, extraInterrupts: 1 },
};

export function findLevel(id) {
  return LEVELS[id] ?? LEVELS.assessment;
}

/**
 * Build a variant room from an authored station.
 *
 * Returns a room object of the same shape the Session engine already plays,
 * so nothing downstream — scoring, records, xAPI, the debrief — needs to know
 * it was generated.
 */
export function makeVariant(base, { seed = Date.now(), level = "assessment" } = {}) {
  if (!base?.steps?.length) return null;
  const lv = findLevel(level);
  const rand = variantRng(`${base.id}:${seed}:${lv.id}`);

  const steps = base.steps.map((step) => {
    const out = { ...step };
    // Hints off is the single biggest difference between a practice run and an
    // assessment: with the rail naming the control, the step is a reading test.
    if (!lv.hints) out.noHint = true;
    // Only a sequence the procedure itself marks as order-independent may be
    // shuffled. Anything else is order-critical and shuffling it would be
    // teaching the wrong job.
    if (step.kind === "sequence" && step.anyOrder && Array.isArray(step.targets) && step.targets.length > 2) {
      out.targets = shuffle(step.targets, rand);
    }
    return out;
  });

  // The alarms: which ones fire, hung off different steps, with less time to
  // answer. A learner who has met this station once knows the lock comes off
  // the hasp; they should not know it comes off during step four.
  const stepIds = steps.map((s) => s.id);
  const pool = (base.interrupts ?? []).map((it) => ({ ...it }));
  const chosen = shuffle(pool, rand);
  const interrupts = chosen.map((it) => {
    // Rehang it on a different step, never the step whose own control answers
    // it — that is a nudge rather than an interruption, and the engine's own
    // checker rejects it.
    const candidates = stepIds.filter((id) => {
      const st = steps.find((s) => s.id === id);
      if (!st) return false;
      if (st.target === it.target) return false;
      if ((st.targets ?? []).includes(it.target)) return false;
      return true;
    });
    const after = candidates.length ? candidates[Math.floor(rand() * candidates.length)] : it.after;
    const seconds = Math.max(6, Math.round((it.seconds ?? 12) * lv.interruptScale));
    const delay = Math.max(2, Math.round((it.delay ?? 3) + rand() * 3));
    return { ...it, after, seconds, delay, variantOf: it.after };
  });

  const parSeconds = Math.max(60, Math.round((base.parSeconds ?? 240) * lv.par));

  // How much this station can actually be varied. A procedure with no alarms
  // and no order-independent sequence has nothing to reshuffle, so every seed
  // produces the same run and the UI should say "no hints and a tighter
  // clock" rather than implying the learner has not seen this before.
  const reshuffled = steps.filter((s, i) => Array.isArray(s.targets)
    && s.targets.join() !== (base.steps[i].targets ?? []).join()).length;
  const rehung = interrupts.filter((it) => it.after !== it.variantOf).length;
  const variety = reshuffled + rehung;

  return {
    ...base,
    id: `variant:${base.id}:${lv.id}:${seed}`,
    index: "◆",
    domain: "Assessment",
    name: `${base.name} — ${lv.name}`,
    title: `${base.title ?? base.name} · ${lv.name}`,
    tagline: lv.hints
      ? `${base.name} again, with the alarms in different places.`
      : `${base.name} with no hints, a tighter clock and alarms you have not seen in this order. Same procedure, same answers — you are on your own for which control and when.`,
    parSeconds,
    steps,
    interrupts,
    isVariant: true,
    variant: { baseId: base.id, baseName: base.name, level: lv.id, seed, hints: lv.hints,
      variety, reshuffled, rehung,
      // What is honestly different about this run, for the card the learner reads.
      differs: [
        ...(lv.hints ? [] : ["no hints"]),
        ...(lv.par < 1 ? [`${Math.round((1 - lv.par) * 100)}% tighter clock`] : []),
        ...(rehung ? [`${rehung} alarm${rehung === 1 ? "" : "s"} moved`] : []),
        ...(reshuffled ? [`${reshuffled} sequence${reshuffled === 1 ? "" : "s"} reordered`] : []),
      ] },
    build: (root) => base.build(root),
  };
}

/** A one-line description an instructor can read before issuing it. */
export function describeVariant(v) {
  if (!v?.variant) return "";
  const { baseName, level, seed } = v.variant;
  return `${baseName} · ${findLevel(level).name} · seed ${seed} · ${v.steps.length} steps · ${v.interrupts?.length ?? 0} interruptions · par ${v.parSeconds}s`;
}
