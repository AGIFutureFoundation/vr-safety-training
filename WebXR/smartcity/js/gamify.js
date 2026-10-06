// Per-simulator gamified systems.
//
// Every SmartCiti.X area is its own system: its own name, its own currency, its
// own rank ladder and its own badges and challenges. A learner can be a Fault
// Lead on the charge point and still an apprentice in the valve vault — rank is
// earned inside a trade, not across the platform.

/** Product naming: every area is "SmartCiti.X~ <Name> VR". */
export const BRAND = "SmartCiti.X";
export const simTitle = (name) => `${BRAND}~ ${name} VR`;

/** Predicates the systems judge a finished run against. */
export const AWARD = {
  /** No wrong selections at all. */
  clean: (s) => s.errors === 0,
  /** No unsafe-action selections — you may have fumbled the order, never the safety. */
  safe: (s) => s.hazardHits === 0,
  /** Finished inside a fraction of par time. */
  fast: (fraction = 0.8) => (s) => s.elapsed <= s.room.parSeconds * fraction,
  /** Mean accuracy across the graded skill steps. */
  precise: (level = 0.75) => (s) => s.gaugeScores.length > 0 && s.precision >= level,
  /** Every timed hold carried to full duration first time. */
  unbroken: (s) => s.holdBreaks === 0,
  /** Reached the maximum combo multiplier at some point in the run. */
  streak: (n = 10) => (s) => {
    let best = 0, run = 0;
    for (const entry of s.log) { run = entry.ok ? run + 1 : 0; best = Math.max(best, run); }
    return best >= n;
  },
  /** A specific step completed without any error recorded against it. */
  stepClean: (stepId) => (s) => !s.log.some((e) => e.step === stepId && !e.ok),
  /** Combine predicates. */
  all: (...tests) => (s) => tests.every((t) => t(s)),
};

const DEFAULT_RANK_AT = [0, 900, 2200, 4000, 6500];

/**
 * Fill in a simulator's system definition. Ranks are required — they are what
 * makes each area feel like its own progression rather than a shared score.
 */
export function system({ name, currency, ranks, rankAt, badges = [], challenges = [] }) {
  return {
    system: name,
    currency,
    ranks,
    rankAt: rankAt ?? DEFAULT_RANK_AT.slice(0, ranks.length),
    badges,
    challenges,
  };
}
