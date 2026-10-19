// ROBOLEARN-10 (docs/consoles/ROBOLEARN-10.md): a learner's OWN consented takes joining a training run of the small model, on
// the device only. SmartCiti.X Holodeck · Powered by AGI Corp.
//
// What it does, plainly:
//   * It trains ra-lm-h (the small language-conditioned model trained here; not a large language model) on the arena's
//     development-seed synthetic demonstrations (RA_DEMOS, seed 1 → episode seeds 100004…) PLUS the learner's own takes from
//     the local DX store. The takes are read through COLEARN's colLocalDemos, which returns nothing unless DATAWORKS'
//     dxCollecting() holds right now: an eligible session (signed in, not the demo, not K-12 or a classroom) and the learner's
//     own adult (18+) opt-in. Signed out, demo, K-12 or not opted in: 0 takes, no model, and the result says why.
//   * Every take passes dxValidateEpisode and must carry an adult consent receipt; a take without one is refused and listed.
//   * Provenance: one row per take (episode, task, steps, consent receipt id, licence) and, inside the model, raLmTrain's
//     per-sample counts (rows from synthetic demonstrations, rows from the learner's takes, refused episodes, by task).
//   * Declared, development seeds only: docs/evals/arena-takes-declared-r9.json. No held-out seed is touched — the run has
//     no evaluation step at all; it builds a model and reports what went into it. Nothing is sent anywhere.
//   * Revoking consent (dxRevoke) deletes the stored takes; the next run finds 0 and rebuilds the model without them,
//     byte for byte the model built before any take existed (check_arena 12 holds this).
// Browser-safe (no node: imports). Every top-level name starts with `ra`/`RA_`; imports are plain (no alias).

import { dxValidateEpisode, dxCollecting, dxStore } from "./dx-data.js";
import { colLocalDemos, colSyntheticDemos, colDemosFromEpisodes, colHash } from "./col-learn.js";
import { raLmTrain, raLmTaskTexts, RA_LM_H_TRAIN, RA_LM_H_VERSION, RA_LM_TASKS } from "./ra-lm.js";
import { RA_DEMOS } from "./ra-arena.js";

/** The declaration this run is made under (committed before the first run; check_arena 12 reads the file). */
export const RA_TAKES_TRAIN = Object.freeze({
  model: "ra-lm-h", version: RA_LM_H_VERSION, declaration: "docs/evals/arena-takes-declared-r9.json",
  demos: Object.freeze({ ...RA_DEMOS, episodeSeeds: `${RA_DEMOS.seed * 100003 + 1}–${RA_DEMOS.seed * 100003 + RA_DEMOS.n}` }),
  heldOut: "none: no held-out seed is run; the model is built and described, never evaluated here",
  where: "on the device, from the local DX store, only while dxCollecting() holds",
});

/**
 * Collect the learner's own consented takes for the gym tasks: { takes: episodes, provenance, refused }. [] unless collecting.
 * `tasks` narrows the gym tasks (tests); the default is every gym task the small model trains on.
 */
export async function raTakesCollect({ store = dxStore, signals = null, tasks = RA_LM_TASKS } = {}) {
  const seen = new Set(), takes = [], provenance = [], refused = [];
  if (!dxCollecting(signals)) return { takes, provenance, refused };
  for (const sc of tasks) {
    for (const ep of await colLocalDemos(sc, { store, signals })) {
      if (!ep || seen.has(ep.episodeId)) continue;
      seen.add(ep.episodeId);
      const v = dxValidateEpisode(ep);
      if (!v.ok) { refused.push({ episode: ep.episodeId ?? "?", why: v.errors[0] }); continue; }
      if (!(ep.consent?.consentId && ep.consent?.adult === true)) { refused.push({ episode: ep.episodeId, why: "no adult consent receipt" }); continue; }
      takes.push(ep);
      provenance.push({ episode: ep.episodeId, scenario: sc, steps: ep.steps.length, consentId: ep.consent.consentId, licence: ep.consent.licence, adult: true, source: "human" });
    }
  }
  return { takes, provenance, refused };
}

/** The arena's development-seed demonstrations for a gym task (RA_DEMOS; the same call ra-arena.js makes). */
export function raTakesDevDemos(sc) {
  return colDemosFromEpisodes(colSyntheticDemos(sc, { n: RA_DEMOS.n, seed: RA_DEMOS.seed, skill: RA_DEMOS.skill, noise: RA_DEMOS.noise }), sc).demos;
}

/**
 * Train ra-lm-h on the development-seed demonstrations plus the learner's own consented takes. Returns
 * { ok, reason, takes, provenance, refused, model, hash, declared }: ok false with 0 takes and no model unless collecting.
 * `texts` (raLmTaskTexts) and `tasks` are for tests; the page passes nothing. The model's `provenance` carries the
 * per-sample counts (synthetic rows, human rows, refused episodes, by task); `hash` is colHash of the weights.
 */
export async function raTakesTrain({ store = dxStore, signals = null, texts = null, tasks = RA_LM_TASKS } = {}) {
  if (!dxCollecting(signals)) {
    return { ok: false, reason: "Not collecting: sign in, outside the demo and any K-12 or classroom session, and opt in as an adult (18+) in the consent panel. No model is trained.", takes: 0, provenance: [], refused: [], model: null, hash: null, declared: RA_TAKES_TRAIN };
  }
  const { takes, provenance, refused } = await raTakesCollect({ store, signals, tasks });
  const model = raLmTrain({ demosFor: raTakesDevDemos, texts: texts ?? raLmTaskTexts(() => null), consented: takes, tasks, opts: RA_LM_H_TRAIN });
  if (!model) return { ok: false, reason: "Nothing to train on.", takes: takes.length, provenance, refused, model: null, hash: null, declared: RA_TAKES_TRAIN };
  return {
    ok: true, reason: provenance.length ? "ok" : "Collecting, but no robot take is stored yet: the model holds synthetic rows only.",
    takes: takes.length, provenance, refused, model, hash: colHash(model.w),
    rows: { total: model.rows, synthetic: model.provenance.synthetic, human: model.provenance.human, refusedEpisodes: model.provenance.refusedEpisodes },
    declared: RA_TAKES_TRAIN,
  };
}
