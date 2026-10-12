// ROBO-ARENA: a SMALL language-conditioned robot model, trained here (docs/consoles/ROBO-ARENA.md).
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// What it IS, plainly. It is not a large language model and it calls none: it is a masked softmax classifier with a few
// thousand weights, trained on this device with seeded SGD and no network.
//   * The instruction. A task's own text — the scenario's name, blurb, action list and safe-practice rules, its variant's
//     parameters written as words, and the linked station's step titles, prompts and hazard texts — is tokenised and
//     TF-IDF weighted over the task corpus, then hashed into RA_LM_T buckets and L2-normalised (the vector t). On a station,
//     the current step's own title, prompt and "why" text is added to t at every step, so the instruction changes as the
//     drill moves on.
//   * The scene. COLEARN's hand-written features for the scenario (colF), clipped to [−4, 4] and padded to RA_LM_D (the
//     vector s, plus a constant 1).
//   * The model. logit(label) = tᵀ · W_label · [s, 1]: the text chooses how the scene features are weighed (a bilinear
//     layer). The softmax is masked to the action labels of the scenario's own action space (the labels its training
//     demonstrations used; a held-out VARIANT shares its base task's action space). Continuous parameters (a walk
//     distance, a grip ratio, a gauge offset) are the mean of the 5 nearest training moments of the same task and label
//     in scene space (a nearest-neighbour lookup beside the softmax, said plainly).
//   * The data, with provenance per sample: (a) COLEARN's synthetic expert traces (labelled synthetic), (b) the station
//     step texts as the instruction input, (c) consented learner takes when the caller hands them in (every episode passes
//     DATAWORKS' validation through colDemosFromEpisodes: a human episode without an adult consent receipt is refused).
//   * Text ablation (`blankText: true`): t is the same constant vector for every task and step, so the same model
//     cannot read the instruction; the eval reports both.
// Every top-level name starts with `ra`/`RA_`.

import { rng } from "./robot.js";
import { colF, colBase, colRows, colAction, colDemosFromEpisodes } from "./col-learn.js";
import { RB_SCENARIOS } from "./rb-robotics-data.js";

export const RA_LM_VERSION = "ra-lm/1";
export const RA_LM_LABEL = "small language-conditioned model trained here (masked softmax over task text × scene features; not a large language model)";
export const RA_LM_T = 24;
export const RA_LM_D = 14;
export const RA_LM_TRAIN = { epochs: 6, lr: 0.3, l2: 1e-4, seed: 1 };
export const RA_LM_PARAM_K = 5;
export const RA_LM_PARAM_ROWS = 600;
/** The tasks the model trains on: the six gym games (base only; hard variants are held-out tasks) and, when a station
 * builder is handed in, the three robot stations. */
export const RA_LM_TASKS = ["rb-teleop-pick-place", "rb-amr-fleet-routing", "rb-cobot-zone-setup", "rb-cell-entry", "rb-construction-drilling", "rb-port-gantry"];
export const RA_LM_STATION_TASKS = ["rb-station-robot-cell", "rb-station-amr-fleet", "rb-station-cobot"];

const raLmR4 = (n) => Math.round(n * 1e4) / 1e4;
const raLmIsStation = (sc) => String(sc).startsWith("rb-station-");
const RA_LM_STOP = new Set("a an the and or of to in on at for with by is are be it its this that as from into before after your you their them not no".split(" "));
export function raLmTokens(text) { return String(text ?? "").toLowerCase().replace(/[^a-z0-9#\s-]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !RA_LM_STOP.has(w)); }
function raLmFnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; }

/**
 * The task texts. `readStation(stationId)` returns a station's exported JSON (steps with title/prompt/why, hazards as
 * { id: text }) or null. Returns { task: { [scenarioId]: text }, steps: { [scenarioId]: { [stepId]: text } }, sources }.
 */
export function raLmTaskTexts(readStation = () => null) {
  const task = {}, steps = {}, sources = {};
  for (const s of RB_SCENARIOS) {
    const st = s.station ? readStation(s.station) : null;
    const stText = st ? [st.title ?? st.name ?? "", st.tagline ?? "", ...(st.steps ?? []).map((x) => `${x.title ?? ""}. ${x.prompt ?? ""}`), ...Object.values(st.hazards ?? {}).map((h) => (typeof h === "string" ? h : h?.text ?? ""))].join(" ") : "";
    const own = [s.name, s.blurb ?? "", (s.actions ?? []).join(" "), (s.safePractice ?? []).map((r) => `rule ${r}`).join(" ")].join(". ");
    task[s.id] = `${own}. ${stText}`.trim();
    sources[s.id] = { scenario: "rb-robotics-data.js RB_SCENARIOS", station: st ? `station ${s.station} (steps and hazards)` : null };
    if (st && raLmIsStation(s.id)) steps[s.id] = Object.fromEntries((st.steps ?? []).map((x) => [x.id, `${x.title ?? ""}. ${x.prompt ?? ""}. ${x.why ?? ""}`]));
    for (const [v, params] of Object.entries(s.variants ?? {})) {
      task[`${s.id}#${v}`] = `${task[s.id]}. ${v} variant: ${Object.entries(params).map(([k, val]) => `${k.replace(/([A-Z])/g, " $1").toLowerCase()} ${val === true ? "yes" : val}`).join(", ")}`;
      sources[`${s.id}#${v}`] = { ...sources[s.id], variant: v };
    }
  }
  return { task, steps, sources };
}

/** TF-IDF over the corpus of every task and step text, hashed into T buckets. */
function raLmVectoriser(texts, T) {
  const docs = [...Object.values(texts.task), ...Object.values(texts.steps).flatMap((m) => Object.values(m))].map(raLmTokens);
  const df = new Map();
  for (const d of docs) for (const w of new Set(d)) df.set(w, (df.get(w) ?? 0) + 1);
  const N = docs.length;
  const vec = (text) => {
    const v = new Array(T).fill(0);
    for (const w of raLmTokens(text)) { const idf = Math.log((N + 1) / ((df.get(w) ?? 0) + 1)) + 1; const h = raLmFnv(w); v[h % T] += (h & 0x10000 ? 1 : -1) * idf; }
    const n = Math.hypot(...v) || 1;
    return v.map((x) => x / n);
  };
  return vec;
}

function raLmScene(sc, x) { const s = new Array(RA_LM_D + 1).fill(0); for (let i = 0; i < Math.min(x.length, RA_LM_D); i++) s[i] = Math.max(-4, Math.min(4, x[i])); s[RA_LM_D] = 1; return s; }

/**
 * Train. `demosFor(scenarioId)` returns COLEARN demonstrations (synthetic by default); `consented` is a list of DX
 * episodes (each validated, refused without consent); `texts` from raLmTaskTexts; `station` (optional) adds the three
 * station tasks. Returns a plain-JSON model with per-sample provenance counts, or null when there is nothing to train on.
 */
export function raLmTrain({ demosFor, texts, station = null, consented = [], blankText = false, tasks = null, opts = {} } = {}) {
  if (!demosFor || !texts) return null;
  const O = { ...RA_LM_TRAIN, ...opts }, T = RA_LM_T, vec = raLmVectoriser(texts, T);
  const tconst = new Array(T).fill(1 / Math.sqrt(T));
  const taskList = tasks ?? [...RA_LM_TASKS, ...(station ? RA_LM_STATION_TASKS : [])];
  const tvTask = Object.fromEntries(Object.keys(texts.task).map((k) => [k, blankText ? tconst : vec(texts.task[k])]));
  const tvStep = Object.fromEntries(Object.entries(texts.steps).map(([k, m]) => [k, Object.fromEntries(Object.entries(m).map(([id, tx]) => [id, blankText ? tconst : vec(tx)]))]));
  const rows = [], provenance = { synthetic: 0, human: 0, refusedEpisodes: 0, byTask: {} };
  const labelsByTask = {};
  for (const sc of taskList) {
    let demos = (demosFor(sc) ?? []).filter((d) => d.success && d.clean);
    const mine = (consented ?? []).filter((e) => e?.scenario === (raLmIsStation(sc) ? RB_SCENARIOS.find((s) => s.id === sc)?.station : sc));
    if (mine.length) { const { demos: ok, refused } = colDemosFromEpisodes(mine, sc); provenance.refusedEpisodes += refused.length; demos = [...demos, ...ok.filter((d) => d.success && d.clean)]; }
    const before = rows.length;
    for (const d of demos) for (const st of d.steps) {
      for (const r of colRows(sc, st.observation, st.action)) {
        if (r.label === "wait" && !(colBase(sc) === "rb-amr-fleet-routing" || raLmIsStation(sc))) continue;
        rows.push({ sc, t: raLmT(tvTask, tvStep, sc, st.observation, T), s: raLmScene(sc, r.x), label: r.label, p: r.p, source: d.source });
        provenance[d.source === "human" ? "human" : "synthetic"] += 1;
      }
    }
    labelsByTask[sc] = [...new Set(rows.slice(before).map((r) => r.label))].sort();
    provenance.byTask[sc] = { rows: rows.length - before, demos: demos.length, sources: [...new Set(demos.map((d) => d.source))].sort() };
  }
  if (!rows.length) return null;
  const labels = [...new Set(rows.map((r) => r.label))].sort(), li = new Map(labels.map((l, i) => [l, i]));
  const S = RA_LM_D + 1, P = T * S, w = new Float64Array(labels.length * P);
  // Each task carries equal total weight (balance), whatever its row count.
  const perTask = {}; for (const r of rows) perTask[r.sc] = (perTask[r.sc] ?? 0) + 1;
  const R = rng(O.seed * 7919 + 13), order = rows.map((_, i) => i);
  const maskIdx = Object.fromEntries(Object.entries(labelsByTask).map(([k, ls]) => [k, ls.map((l) => li.get(l))]));
  const meanRows = rows.length / Object.keys(perTask).length;
  for (let ep = 0; ep < O.epochs; ep++) {
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const lr = O.lr / (1 + ep);
    for (const idx of order) {
      const r = rows[idx], mask = maskIdx[r.sc], bal = meanRows / perTask[r.sc];
      const z = mask.map((l) => raLmLogit(w, l * P, r.t, r.s, S));
      const mx = Math.max(...z), ex = z.map((v) => Math.exp(v - mx)), sum = ex.reduce((a, b) => a + b, 0);
      const y = li.get(r.label);
      mask.forEach((l, k) => {
        const g = (ex[k] / sum - (l === y ? 1 : 0)) * bal * lr, off = l * P;
        if (Math.abs(g) < 1e-7) return;
        for (let a = 0; a < T; a++) { const ta = r.t[a]; if (!ta) continue; const o = off + a * S; for (let b = 0; b < S; b++) w[o + b] -= g * ta * r.s[b] + lr * O.l2 * w[o + b]; }
      });
    }
  }
  // Continuous parameters: per (task, label) the k = 5 nearest training moments of that task and label in scene space,
  // averaged (ridge regression was tried first on DEV seeds 1–20 and could not follow the expert's curved teleop path).
  const pReg = {};
  for (const sc of taskList) for (const l of labelsByTask[sc] ?? []) {
    const rs = rows.filter((r) => r.sc === sc && r.label === l && r.p);
    if (!rs.length) continue;
    const keep = rs.length > RA_LM_PARAM_ROWS ? rs.filter((_, i) => i % Math.ceil(rs.length / RA_LM_PARAM_ROWS) === 0) : rs;
    (pReg[sc] ??= {})[l] = keep.map((r) => [r.s.slice(0, RA_LM_D).map(raLmR4), Object.fromEntries(Object.entries(r.p).map(([k, v]) => [k, raLmR4(v)]))]);
  }
  // Training accuracy (on the training rows, for the record only).
  let correct = 0; for (const r of rows) { const mask = maskIdx[r.sc]; let best = -Infinity, bl = -1; for (const l of mask) { const v = raLmLogit(w, l * P, r.t, r.s, S); if (v > best) { best = v; bl = l; } } if (bl === li.get(r.label)) correct += 1; }
  return {
    v: RA_LM_VERSION, kind: RA_LM_LABEL, T, D: RA_LM_D, labels, labelsByTask, blankText, train: O, tasks: taskList,
    params: w.length, w: Array.from(w, raLmR4), pReg, provenance, rows: rows.length, trainAccuracy: raLmR4(correct / rows.length),
    texts: { task: Object.fromEntries(Object.entries(texts.task).map(([k, v]) => [k, raLmTokens(v).length])), sources: texts.sources, stepTexts: Object.fromEntries(Object.entries(texts.steps).map(([k, m]) => [k, Object.keys(m).length])) },
    _tv: { task: tvTask, step: tvStep },
  };
}

function raLmT(tvTask, tvStep, sc, obs, T) {
  const base = tvTask[sc] ?? tvTask[colBase(sc)] ?? new Array(T).fill(0);
  const stp = obs?.stepId && tvStep[sc]?.[obs.stepId];
  if (!stp) return base;
  const v = base.map((x, i) => x + stp[i]); const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}
function raLmLogit(w, off, t, s, S) { let z = 0; for (let a = 0; a < t.length; a++) { const ta = t[a]; if (!ta) continue; const o = off + a * S; let u = 0; for (let b = 0; b < S; b++) u += w[o + b] * s[b]; z += ta * u; } return z; }

/** The policy for scenario `sc` (a trained task or a held-out variant of one): observation -> action. */
export function raLmPolicy(model, sc) {
  const base = colBase(sc), task = model.labelsByTask[sc] ? sc : base;
  const mask = (model.labelsByTask[task] ?? []).map((l) => model.labels.indexOf(l));
  const S = model.D + 1, P = model.T * S, F = colF(base);
  const pick = (t, s) => { let best = -Infinity, bl = -1; for (const l of mask) { const v = raLmLogit(model.w, l * P, t, s, S); if (v > best) { best = v; bl = l; } } return bl >= 0 ? model.labels[bl] : "wait"; };
  const fw = (F.weights ?? F.names.map(() => 1));
  const params = (label, s) => {
    const reg = model.pReg[task]?.[label]; if (!reg) return [];
    const d = reg.map(([x, p], i) => { let z = 0; for (let f = 0; f < x.length; f++) { const e = (x[f] - s[f]) * (fw[f] ?? 1); z += e * e; } return [z, i, p]; });
    d.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return d.slice(0, RA_LM_PARAM_K).map((e) => e[2]);
  };
  return (obs) => {
    if (!mask.length) return { type: "wait" };
    const t = raLmT(model._tv.task, model._tv.step, sc, obs, model.T);
    if (base === "rb-amr-fleet-routing") return { type: "route", moves: F.perRobot(obs).map((r) => (r.delivered ? "wait" : pick(t, raLmScene(base, r.f)))) };
    const s = raLmScene(base, F.of(obs)), label = pick(t, s);
    return colAction(base, label, params(label, s), obs);
  };
}
