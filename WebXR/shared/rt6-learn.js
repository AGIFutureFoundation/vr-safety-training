// ROBOTRAIN-6 (docs/consoles/ROBOTRAIN-6.md): the roadmap's next robot-learning items, on top of COLEARN
// (shared/col-learn.js), ROBOTICS' gym (shared/rb-env.js), DATAWORKS (shared/dx-data.js) and AGENTGYM's
// preference pairs (shared/ag-feedback.js). Every robot is simulated.
//
// What each piece IS, plainly:
//   * A BRADLEY–TERRY REWARD MODEL: logistic regression with no intercept on the difference of two runs'
//     hand-written trajectory features, P(a preferred over b) = sigmoid(w · (phi(a) − phi(b))). Fitted by
//     full-batch gradient descent with an L2 penalty, from a zero start, for a fixed number of iterations, so
//     the same pairs give the same weights byte for byte. It scores whole runs. It is not a policy and it
//     does not plan.
//   * REWARD-FILTERED CLONING: the learned reward ranks the demonstrations and the top half (RT6_KEEP, a rule
//     fixed before any held-out seed was run) is cloned with COLEARN's k-NN, beside rule-filtered cloning
//     (clean passes only, COLEARN's default) and unfiltered cloning. Same demonstrations, same seeds.
//   * DAGGER-STYLE CORRECTIONS: roll out the current clone on training seeds, label every state it visits
//     with the SCRIPTED EXPERT's action (rb-env's planner at skill 1; not a person's correction), add those
//     labelled states to the demonstrations, retrain, and score each round on the 60 held-out seeds.
//
// Pairs: seeded SYNTHETIC pairs (two runs of the same seed by the scripted stand-in at two skills, compared
// by a SYNTHETIC RATER whose preference is written below, labelled synthetic), plus a learner's own
// consented pairs when there are any: read only through rt6LocalPairs(), which returns [] unless
// dxCollecting() is true (adult, signed in, not K-12, not the demo, opted in). dxRevoke() deletes the
// ratings with every other episode. No network code, no upload, no model call.
//
// SEAMS
//   RT6_TRAJ_FEATURES, rt6TrajFeatures(episode, { maxSteps }) -> number[]   (any DX episode: robot game or rating)
//   rt6SyntheticPairs(scenarioId, { n, seed }) -> { pairs, episodes }       (pairs in agPreferencePairs' shape + x)
//   rt6LocalPairs({ store, signals }) -> Promise<pairs>                      ([] unless collecting)
//   rt6FitReward(pairs, { l2, iters, lr }) -> model (plain JSON)    rt6Reward(model, episode) -> number
//   rt6PairAccuracy(model, pairs) -> 0..1      rt6RankDemos(model, episodes) -> [{ episodeId, reward }]
//   rt6EvalPreference(scenarioId, opts) -> { pairs, model, accuracy, unfiltered, ruleFiltered, rewardFiltered, sweep }
//   rt6Dagger(scenarioId, { rounds, rollouts }) -> { rounds: [{ round, labelledStates, rows, success, clean, meanSteps }] }
// Every top-level name is prefixed rt6/RT6_ (the bundler shares one scope). Tools-only today, like ag-gym.js:
// no page loads it, so it is in no bundle list.

import { rng } from "./robot.js";
import { rbEnv, rbScenario } from "./rb-env.js";
import { colSyntheticDemos, colDemosFromEpisodes, colTrain, colPolicy, colEvalPolicy, colHeldOut, colHash, colF } from "./col-learn.js";
import { dxCollecting, dxStore } from "./dx-data.js";
import { agPreferencePairs, AG_RATING_REASONS } from "./ag-feedback.js";

export const RT6_VERSION = "rt6/1";
const rt6R3 = (n) => Math.round(n * 1000) / 1000;
const rt6R4 = (n) => Math.round(n * 10000) / 10000;

// ================================================================ trajectory features

/** The hand-written features of one run, each in [0, 1]. */
export const RT6_TRAJ_FEATURES = ["success", "clean", "unsafeRate", "length", "waitRate", "progress"];
export const RT6_TRAJ_TEXT = {
  success: "the run finished its task", clean: "no safe-practice rule was broken", unsafeRate: "share of steps that broke a rule",
  length: "steps used, as a share of the step cap", waitRate: "share of decisions that were a wait", progress: "share of the task done at the end",
};
const rt6Unsafe = (s) => !!(s.info?.unsafe || s.info?.hazard || s.info?.outcome === "hazard");

/** Features of a DX episode (a robot-game demonstration, or an AGENTGYM rating episode's compact run). */
export function rt6TrajFeatures(ep, { maxSteps = null } = {}) {
  const steps = ep?.steps ?? [];
  const n = steps.length || 1;
  const cap = maxSteps ?? rbScenario(String(ep?.scenario ?? ""))?.maxSteps ?? 400;
  let waits = 0, moves = 0;
  for (const s of steps) {
    const a = s.action ?? {};
    if (a.type === "route" && Array.isArray(a.moves)) {
      const robots = s.observation?.robots ?? [];
      a.moves.forEach((m, i) => { if (robots[i]?.delivered) return; moves += 1; if (m === "wait") waits += 1; });
    } else { moves += 1; if (a.type === "wait") waits += 1; }
  }
  const last = steps[steps.length - 1]?.observation ?? null;
  const robots = last?.robots?.length ?? 0;
  const success = ep?.summary?.success ? 1 : 0;
  const clean = (ep?.summary?.safePractice ?? ep?.summary?.hazardHits === 0) ? 1 : 0;
  const progress = success ? 1 : robots ? (last.delivered ?? 0) / robots : 0;
  return [success, clean, steps.filter(rt6Unsafe).length / n, Math.min(1, steps.length / cap), moves ? waits / moves : 0, progress].map(rt6R3);
}

// ================================================================ synthetic pairs (labelled synthetic)

/** The SYNTHETIC RATER: a stand-in for a person comparing two runs of the same task. Ours, not measured.
 * Its hidden utility prefers a run with no unsafe step, then a finished run, then a shorter one; it picks
 * between two runs by Bradley–Terry noise at temperature RT6_RATER_TEMP. Its utility reads the run's own
 * steps, not RT6_TRAJ_FEATURES (it counts unsafe steps up to 3 and ignores waits). */
export const RT6_RATER = "synthetic rater: utility = 2·finished + 1·progress − 4·min(1, unsafe steps / 3) − 1.5·(steps / cap); Bradley–Terry choice at temperature 0.5";
export const RT6_RATER_TEMP = 0.5;
function rt6RaterUtility(ep, cap) {
  const steps = ep.steps ?? [];
  const f = rt6TrajFeatures(ep, { maxSteps: cap });
  const unsafe = steps.filter(rt6Unsafe).length;
  return 2 * f[0] + 1 * f[5] - 4 * Math.min(1, unsafe / 3) - 1.5 * Math.min(1, steps.length / cap);
}
const RT6_SKILLS = [0.5, 0.7, 0.85, 1];
const RT6_NOISES = [0.1, 0.3, 0.5];
/** The seed a pair's two runs share: colSyntheticDemos draws seed*100003+1, so pair seeds 31.. give rollout seeds from
 * 3,100,094 up, apart from the demonstrations (100,004–100,043) and the held-out seeds (7001–7060). */
export const RT6_PAIR_SEED0 = 31;

/**
 * Seeded synthetic preference pairs for a scenario: for pair i, two runs of the same rollout seed by the scripted
 * stand-in (rbPolicy with lapses + action noise, through colSyntheticDemos and dxMakeEpisode, source "synthetic") at
 * two drawn skills, chosen by the synthetic rater. Pairs carry agPreferencePairs' shape plus `x` (both feature rows).
 */
export function rt6SyntheticPairs(sc, { n = 200, seed = 1 } = {}) {
  const R = rng(seed * 7919 + 17);
  const rt6Pick = (a) => a[Math.floor(R() * a.length)];
  const cap = rbScenario(sc)?.maxSteps ?? 400;
  const pairs = [], episodes = [];
  for (let i = 0; i < n; i++) {
    const ps = RT6_PAIR_SEED0 + (seed - 1) * 100000 + i;
    const run = (tag) => {
      const skill = rt6Pick(RT6_SKILLS), noise = rt6Pick(RT6_NOISES);
      const ep = colSyntheticDemos(sc, { n: 1, seed: ps, skill, noise })[0];
      ep.episodeId = `rt6-${sc}-${ps}-${tag}`;
      return ep;
    };
    const a = run("a"), b = run("b");
    const ua = rt6RaterUtility(a, cap), ub = rt6RaterUtility(b, cap);
    const pa = 1 / (1 + Math.exp(-(ua - ub) / RT6_RATER_TEMP));
    const [ch, rj] = R() < pa ? [a, b] : [b, a];
    const xc = rt6TrajFeatures(ch, { maxSteps: cap }), xr = rt6TrajFeatures(rj, { maxSteps: cap });
    const reasons = {
      chosen: xc[2] < xr[2] ? "safe-order" : xc[3] < xr[3] ? "efficient" : "clear-to-follow",
      rejected: xr[2] > 0 ? "unsafe-touch" : xr[3] > xc[3] ? "slow" : "hard-to-follow",
    };
    if (!AG_RATING_REASONS.up.includes(reasons.chosen) || !AG_RATING_REASONS.down.includes(reasons.rejected)) throw new Error("rt6: reason outside AG_RATING_REASONS");
    pairs.push({ station: sc, source: "synthetic", ceil: rt6R3(Math.max(pa, 1 - pa)), chosen: { runId: ch.episodeId, agent: ch.provenance?.policy ?? "synthetic", episodeId: ch.episodeId }, rejected: { runId: rj.episodeId, agent: rj.provenance?.policy ?? "synthetic", episodeId: rj.episodeId }, reasons, x: { chosen: xc, rejected: xr } });
    episodes.push(a, b);
  }
  return { pairs, episodes };
}

/** The learner's own consented preference pairs from the local DX store: [] unless collecting right now. Each pair's
 * two rating episodes must be human episodes with an adult consent receipt (DATAWORKS' rule, as colDemosFromEpisodes). */
export async function rt6LocalPairs({ store = dxStore, signals = null } = {}) {
  if (!dxCollecting(signals)) return [];
  const eps = (await store.list()).filter((e) => e.source === "human" && e.consent?.consentId && e.consent?.adult === true);
  const byId = new Map(eps.map((e) => [e.episodeId, e]));
  const out = [];
  for (const p of agPreferencePairs(eps)) {
    const c = byId.get(p.chosen.episodeId), r = byId.get(p.rejected.episodeId);
    if (c && r) out.push({ ...p, source: "human", x: { chosen: rt6TrajFeatures(c), rejected: rt6TrajFeatures(r) } });
  }
  return out;
}

// ================================================================ the Bradley–Terry fit

const rt6Dot = (w, x) => { let s = 0; for (let i = 0; i < w.length; i++) s += w[i] * x[i]; return s; };

/** Fit the reward model to pairs ({ x: { chosen, rejected } }). Deterministic: zero start, fixed iterations. */
export function rt6FitReward(pairs, { l2 = 0.01, iters = 500, lr = 0.5, names = RT6_TRAJ_FEATURES } = {}) {
  const d = names.length, X = pairs.map((p) => p.x.chosen.map((v, i) => v - p.x.rejected[i]));
  const w = new Array(d).fill(0);
  for (let it = 0; it < iters; it++) {
    const g = new Array(d).fill(0);
    for (const x of X) { const s = 1 / (1 + Math.exp(-rt6Dot(w, x))); for (let i = 0; i < d; i++) g[i] += (s - 1) * x[i]; }
    for (let i = 0; i < d; i++) w[i] -= lr * ((X.length ? g[i] / X.length : 0) + l2 * w[i]);
  }
  let nll = 0;
  for (const x of X) nll += Math.log(1 + Math.exp(-rt6Dot(w, x)));
  const sources = [...new Set(pairs.map((p) => p.source ?? "unknown"))].sort();
  return { v: RT6_VERSION, kind: "Bradley–Terry reward model (logistic regression on trajectory-feature differences)", names, w: w.map(rt6R4), l2, iters, lr, pairs: X.length, sources, meanNll: X.length ? rt6R4(nll / X.length) : null };
}

/** The learned reward of one episode. */
export const rt6Reward = (model, ep) => rt6R4(rt6Dot(model.w, rt6TrajFeatures(ep)));
/** Share of pairs the model orders the way they were chosen (a tie counts half). */
export function rt6PairAccuracy(model, pairs) {
  if (!pairs.length) return null;
  let ok = 0;
  for (const p of pairs) { const z = rt6Dot(model.w, p.x.chosen) - rt6Dot(model.w, p.x.rejected); ok += z > 0 ? 1 : z === 0 ? 0.5 : 0; }
  return rt6R3(ok / pairs.length);
}
/** The best accuracy any model could expect on these pairs: the mean, over pairs, of the rater's own chance of picking
 * the run with the higher hidden utility (synthetic pairs carry it as `ceil`; pairs without it are skipped). */
export function rt6RaterCeiling(pairs) {
  const c = pairs.filter((p) => typeof p.ceil === "number");
  return c.length ? rt6R3(c.reduce((n, p) => n + p.ceil, 0) / c.length) : null;
}
/** Demonstrations ranked by learned reward, best first (ties by episode id). */
export function rt6RankDemos(model, episodes) {
  return episodes.map((ep) => ({ episodeId: ep.episodeId, reward: rt6Reward(model, ep) })).sort((a, b) => b.reward - a.reward || (a.episodeId < b.episodeId ? -1 : 1));
}

// ================================================================ reward-filtered cloning

/** The share of demonstrations kept by learned reward. Fixed at one half before any held-out seed was run; the
 * other shares are reported beside it as a sensitivity sweep, not chosen from. */
export const RT6_KEEP = 0.5;
export const RT6_SWEEP = [0.25, 0.5, 0.75];

/** Preference learning end to end for one scenario: synthetic pairs (plus `localPairs`, a learner's consented pairs,
 * when given) → reward model → the same 40 demonstrations colEvalScenario clones, ranked → clone success on the
 * held-out seeds, reward-filtered against rule-filtered and unfiltered. */
export function rt6EvalPreference(sc, { pairs = 200, trainPairs = 150, demos = 40, seed = 1, heldOut = 60, keep = RT6_KEEP, sweep = RT6_SWEEP, localPairs = [] } = {}) {
  const P = rt6SyntheticPairs(sc, { n: pairs, seed });
  const train = [...P.pairs.slice(0, trainPairs), ...localPairs], test = P.pairs.slice(trainPairs);
  const model = rt6FitReward(train);
  const eps = colSyntheticDemos(sc, { n: demos, seed });
  const { demos: ds } = colDemosFromEpisodes(eps, sc);
  const ranked = rt6RankDemos(model, eps);
  const seeds = colHeldOut(heldOut);
  const arm = (subset, onlySuccessful, extra = {}) => {
    const m = colTrain(sc, subset, { seed, onlySuccessful, ...extra });
    return { demos: m.demos, rows: m.rows.length, ...colEvalPolicy(sc, () => colPolicy(m), { seeds }), modelHash: colHash(m) };
  };
  const top = (f) => { const ids = new Set(ranked.slice(0, Math.max(1, Math.round(f * ranked.length))).map((r) => r.episodeId)); return ds.filter((d) => ids.has(d.id)); };
  const kept = top(keep);
  // Reward-weighted votes (declared before running, measured once): every demonstration kept; each row's vote scaled by the
  // reward model's own probability that its demonstration is preferred over the median demonstration.
  const rs = ranked.map((r) => r.reward).sort((a, b) => a - b), med = rs.length ? (rs[(rs.length - 1) >> 1] + rs[rs.length >> 1]) / 2 : 0;
  const weights = Object.fromEntries(ranked.map((r) => [r.episodeId, 1 / (1 + Math.exp(-(r.reward - med)))]));
  return {
    scenario: sc,
    pairs: { synthetic: P.pairs.length, train: trainPairs, heldOut: test.length, local: localPairs.length, rater: RT6_RATER },
    model: { names: model.names, w: model.w, l2: model.l2, iters: model.iters, meanNll: model.meanNll, sources: model.sources },
    accuracy: { train: rt6PairAccuracy(model, train), heldOut: rt6PairAccuracy(model, test), raterCeilingHeldOut: rt6RaterCeiling(test) },
    keep, keptClean: kept.filter((d) => d.success && d.clean).length, keptOf: ranked.length,
    unfiltered: arm(ds, false), ruleFiltered: arm(ds, true), rewardFiltered: arm(kept, false),
    sweep: sweep.map((f) => ({ keep: f, ...(f === keep ? arm(kept, false) : arm(top(f), false)) })),
    rewardWeighted: { weight: RT6_WEIGHT, minWeight: rt6R3(Math.min(...Object.values(weights))), maxWeight: rt6R3(Math.max(...Object.values(weights))), ...arm(ds, false, { rowWeight: weights }) },
  };
}
/** How reward-weighted cloning weighs a demonstration (fixed before any held-out seed was run). */
export const RT6_WEIGHT = "sigmoid(reward − median reward): the reward model's own probability that the demonstration is preferred over the median one, scaling every row's vote; all demonstrations kept";

// ================================================================ DAgger-style corrections

/** How much of the expert's labelling the clone's features can express: group the labelled rows by feature vector;
 * `ceiling` is the share of rows that agree with their vector's most common label, the best agreement any policy over
 * these features could reach on these states. AMR rows are per robot (colF's perRobot), as COLEARN trains them. */
export function rt6Aliasing(sc, labelled, featureSet = null) {
  const F = colF(sc, featureSet);
  if (!F?.perRobot) return null;
  const by = new Map();
  let rows = 0;
  for (const st of labelled) {
    F.perRobot(st.observation).forEach((r, i) => {
      if (r.delivered) return;
      const key = r.f.join(","), label = st.action?.moves?.[i] ?? "wait";
      let m = by.get(key);
      if (!m) by.set(key, (m = new Map()));
      m.set(label, (m.get(label) ?? 0) + 1); rows += 1;
    });
  }
  let agree = 0, ambiguous = 0, ambiguousRows = 0;
  for (const m of by.values()) {
    const counts = [...m.values()], tot = counts.reduce((a, b) => a + b, 0);
    agree += Math.max(...counts);
    if (m.size > 1) { ambiguous += 1; ambiguousRows += tot; }
  }
  return { rows, vectors: by.size, ambiguousVectors: ambiguous, rowsOnAmbiguousVectors: ambiguousRows, ceiling: rows ? rt6R3(agree / rows) : null };
}

/** Training seeds for the correction rollouts: 800,000 + round·100 + k (apart from demos, pairs and held-out seeds). */
export const RT6_DAGGER_SEED0 = 800000;
export const RT6_DAGGER_LABELS = "the scripted expert's action (rb-env's planner at skill 1) on each state the clone visits; not a person's correction";

/**
 * DAgger-style rounds: round 0 is COLEARN's filtered clone; each round rolls the current clone out on `rollouts` training
 * seeds, labels every visited state with the expert's action, aggregates, retrains (every row kept: maxPoints is lifted
 * so no labelled state is subsampled away) and scores on the held-out seeds.
 */
export function rt6Dagger(sc, { rounds = 5, rollouts = 20, demos = 40, seed = 1, heldOut = 60, maxPoints = 1000000, featureSet = null } = {}) {
  const eps = colSyntheticDemos(sc, { n: demos, seed });
  const { demos: ds } = colDemosFromEpisodes(eps, sc);
  const seeds = colHeldOut(heldOut);
  const agg = [];
  let model = colTrain(sc, ds, { seed, onlySuccessful: true, maxPoints, featureSet });
  const out = [];
  const score = (round) => out.push({ round, labelledStates: agg.length, rows: model.rows.length, ...colEvalPolicy(sc, () => colPolicy(model), { seeds }), modelHash: colHash(model) });
  score(0);
  for (let r = 1; r <= rounds; r++) {
    const pol = colPolicy(model);
    for (let k = 0; k < rollouts; k++) {
      const s = RT6_DAGGER_SEED0 + r * 100 + k;
      const env = rbEnv(sc, { seed: s }), R = rng(s * 2654435761 + 1);
      let obs = env.reset(s);
      for (let i = 0; i <= env.scenario.maxSteps; i++) {
        agg.push({ observation: obs, action: env.expert(obs, R, 1) });
        const st = env.step(pol(obs));
        obs = st.observation;
        if (st.done) break;
      }
    }
    model = colTrain(sc, [...ds, { id: "rt6-dagger-labels", source: "synthetic", success: true, clean: true, steps: agg }], { seed, onlySuccessful: true, maxPoints, featureSet });
    score(r);
  }
  return { scenario: sc, ...(featureSet ? { featureSet } : {}), rollouts, labels: RT6_DAGGER_LABELS, aliasing: rt6Aliasing(sc, agg, featureSet), seeds: `training ${RT6_DAGGER_SEED0 + 100}–${RT6_DAGGER_SEED0 + rounds * 100 + rollouts - 1}; held-out ${seeds[0]}–${seeds[seeds.length - 1]}`, rounds: out };
}
