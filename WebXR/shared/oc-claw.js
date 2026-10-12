// OMEGA-CLAW — the software agents that run robot training and model testing (docs/omega-claw.md,
// docs/consoles/OMEGA-CLAW.md). SmartCiti.X Holodeck · Powered by AGI Corp.
//
// Five software agents with invented names and personas, each labelled "software agent". No language model and no
// network call: every line is built on the device from the agent's persona and the decision's own data. They sit on
// top of ROBO-ARENA's contract (shared/ra-arena.js), which is INJECTED as `arena` so this module has no import:
//   arena.raModels()                                  -> [{ id, family, trainedOn, params }]
//   arena.raScenarios()                               -> [{ id, kind: "gym" | "station", hard }]
//   arena.raRun({ modelId, scenarioId, seeds })       -> { success, ruleBreaks, steps, stops, governorChecked, physical: 0, perSeed }
//   arena.raLeaderboard(results)                      -> rows with 95% intervals
//
// The roles:
//   planner   declares each comparison (scenario, models, incumbent, challenger, metric, interval, seeds) BEFORE it runs;
//             the declaration's hash goes into the chain, and nothing undeclared runs.
//   trainer   schedules the training rounds of the declared models on their own training data (never held-out seeds)
//             and records each model's provenance as the arena gives it.
//   evaluator runs the arena on the declared held-out seeds ONCE; a seed already spent on that model and scenario is
//             refused. It also reports the learners' own drill results beside the robots' (local only).
//   auditor   checks leakage (a model's training seeds against the held-out set), seed reuse, and the chain itself.
//   promoter  promotes a challenger only if it beats the incumbent on the declared metric with the 95% intervals
//             clear of each other, its run broke no rule, the governor checked every step and nothing went physical.
//
// Every decision is a line in the claw's own hash chain (FNV-1a over seq|at|action|detail|prev, as the hive's audit),
// and is also handed to ENTERPRISE-3's audit log when `audit` (ent3AuditAppend) is given.
//
// Every top-level name starts with `oc`/`OC_` (the bundler shares one scope). Pure functions; no imports.

export const OC_VERSION = "oc/1";
export const OC_FEATURE = "Omega Claw";
export const OC_AGENT_LABEL = "software agent";
/** This round's held-out seeds (fresh, never used to tune). */
export const OC_HELD_OUT = Object.freeze(Array.from({ length: 60 }, (_, i) => 7121 + i));
/** Families the arena carries as a bound, not as a candidate (the scripted expert reads the scenario's own state). */
export const OC_REFERENCE_FAMILIES = Object.freeze(["scripted expert", "upper bound"]);
export const OC_METRICS = Object.freeze({
  success: { label: "success rate", better: "higher" },
});
export const OC_INTERVAL = "Wilson 95% interval on the success rate over the declared seeds";
export const OC_Z = 1.96;

/** Why a decision was refused: the id is in the chain line, the phrase is what the agent says. */
export const OC_REFUSALS = Object.freeze({
  undeclared: "the comparison was not declared before it ran",
  "declaration-changed": "the comparison differs from what was declared",
  "seed-reused": "a held-out seed was already spent on this model and scenario",
  "not-held-out": "a declared seed is outside the held-out set",
  "already-run": "this comparison already ran once on its held-out seeds",
  "not-run": "the comparison has not run yet",
  "unknown-model": "no model with that id is in the arena",
  "unknown-scenario": "no scenario with that id is in the arena",
  leakage: "a model was trained on a held-out seed",
  "rule-broken": "the challenger's run broke a safe-practice rule",
  "governor-gap": "the governor did not check every step",
  physical: "the run reached a physical robot, and that path is disabled",
  "interval-overlap": "the 95% intervals overlap, so the win is not clear",
  "not-better": "the challenger does not beat the incumbent on the declared metric",
  "reference-only": "the scripted expert is a reference bound, not a candidate",
  "not-applicable": "the model does not apply to this scenario in this arena",
});

/** The five agents. Names are invented; avatars are agent badges, never faces. */
export const OC_AGENTS = Object.freeze([
  { id: "oc-planner", key: "planner", name: "Tevi", role: "Test planner: declares every comparison before it runs", label: OC_AGENT_LABEL, avatar: { glyph: "◇", accent: "#7cc4ff" }, traits: { warmth: 0.6, formality: 0.8, caution: 0.9 }, opener: "Declaring:", closer: "Nothing runs that is not on this list." },
  { id: "oc-trainer", key: "trainer", name: "Okko", role: "Trainer: schedules training rounds on training data only", label: OC_AGENT_LABEL, avatar: { glyph: "△", accent: "#9be37a" }, traits: { warmth: 0.8, formality: 0.3, caution: 0.6 }, opener: "Okay team,", closer: "Training seeds only." },
  { id: "oc-evaluator", key: "evaluator", name: "Ressa", role: "Evaluator: runs the arena once on held-out seeds", label: OC_AGENT_LABEL, avatar: { glyph: "○", accent: "#ffd166" }, traits: { warmth: 0.4, formality: 0.7, caution: 0.8 }, opener: "Measured:", closer: "Reported as measured." },
  { id: "oc-auditor", key: "auditor", name: "Hald", role: "Auditor: checks leakage, seed reuse and the chain", label: OC_AGENT_LABEL, avatar: { glyph: "□", accent: "#c3a6ff" }, traits: { warmth: 0.2, formality: 0.9, caution: 1 }, opener: "For the record,", closer: "Recorded in the chain." },
  { id: "oc-promoter", key: "promoter", name: "Varn", role: "Promoter: promotes only a clear, rule-clean win", label: OC_AGENT_LABEL, avatar: { glyph: "☆", accent: "#ff9f80" }, traits: { warmth: 0.5, formality: 0.6, caution: 0.95 }, opener: "Decision:", closer: "The governor's rules stand." },
]);

// ------------------------------------------------------------------ helpers

function ocFnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, "0"); }
/** A 16-hex digest of any JSON value (FNV-1a forwards and backwards, as the hive's). */
export function ocHash(v) { const s = typeof v === "string" ? v : JSON.stringify(v); return ocFnv(s) + ocFnv(s.split("").reverse().join("")); }
function ocLineHash(l) { return ocHash(`${l.seq}|${l.at}|${l.action}|${l.detail}|${l.prev}`); }
export const ocR3 = (n) => Math.round(Number(n) * 1000) / 1000;

/** Wilson 95% interval for k successes in n trials. */
export function ocWilson(k, n, z = OC_Z) {
  if (!n) return [0, 1];
  const p = k / n, d = 1 + (z * z) / n, c = p + (z * z) / (2 * n), w = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [ocR3(Math.max(0, (c - w) / d)), ocR3(Math.min(1, (c + w) / d))];
}

/** The success count and rate of an arena result over n seeds (`success` may be a rate or a count). */
export function ocSuccess(result, n) {
  const per = Array.isArray(result?.perSeed) ? result.perSeed : null;
  const N = per?.length || n || 0;
  let k;
  if (per && per.length && per.some((p) => p && ("success" in p || "passed" in p))) k = per.filter((p) => p && (p.success === true || p.success === 1 || p.passed === true)).length;
  else { const s = Number(result?.success ?? 0); k = s <= 1 && N > 1 ? Math.round(s * N) : Math.round(s); }
  return { k, n: N, rate: N ? ocR3(k / N) : 0, ci: ocWilson(k, N) };
}

/** The seeds a model's provenance names (an array of numbers anywhere in `trainedOn`), for the leakage check. */
export function ocTrainingSeeds(model) {
  const t = model?.trainedOn;
  const out = new Set();
  const walk = (v, depth) => {
    if (depth > 4 || v == null) return;
    if (typeof v === "number" && Number.isInteger(v)) { out.add(v); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, depth + 1); return; }
    if (typeof v === "object") for (const [k, x] of Object.entries(v)) if (/seed/i.test(k)) walk(x, depth + 1);
  };
  if (Array.isArray(t)) walk(t, 0); else if (t && typeof t === "object") walk(t, 0);
  return [...out].sort((a, b) => a - b);
}

/** A seed list said compactly: "7121–7180 (60)". */
export function ocSeedText(seeds) {
  const s = [...seeds].sort((a, b) => a - b);
  if (!s.length) return "none";
  const contiguous = s.every((x, i) => i === 0 || x === s[i - 1] + 1);
  return contiguous ? `${s[0]}–${s[s.length - 1]} (${s.length})` : `${s.slice(0, 3).join(", ")}${s.length > 3 ? ", …" : ""} (${s.length})`;
}

/** One line in the agent's persona, from the decision's own data only. */
export function ocSay(agent, kind, f = {}) {
  const a = typeof agent === "string" ? OC_AGENTS.find((x) => x.key === agent || x.id === agent) : agent;
  const core = {
    declare: () => `comparison ${f.declId} on ${f.scenarioId}: ${f.challengers} against incumbent ${f.incumbent}, ${f.models} models, metric ${f.metric}, held-out seeds ${f.seeds}.`,
    train: () => `${f.modelId} (${f.family}) is scheduled for training round ${f.round} on ${f.source}.`,
    run: () => `${f.modelId} on ${f.scenarioId}: success ${f.k}/${f.n}, interval ${f.lo}–${f.hi}, rule breaks ${f.ruleBreaks}, governor checked ${f.checked}/${f.steps} steps, physical ${f.physical}.`,
    audit: () => `${f.what}: ${f.ok ? "clean" : "problem"}${f.detail ? `, ${f.detail}` : ""}.`,
    promote: () => `${f.challenger} replaces ${f.incumbent} on ${f.scenarioId}: ${f.cK}/${f.n} against ${f.iK}/${f.n}, intervals ${f.cLo}–${f.cHi} and ${f.iLo}–${f.iHi} are clear.`,
    keep: () => `${f.incumbent} stays on ${f.scenarioId}.`,
    refuse: () => `${f.subject}: ${OC_REFUSALS[f.reason] ?? f.reason} (${f.reason}).`,
    human: () => `${f.what}.`,
  }[kind];
  const body = core ? core() : String(f.text ?? "");
  const lead = kind === "refuse" ? "Refused:" : a?.opener ?? "";
  const tail = kind === "refuse" ? ` ${OC_AGENTS[4].closer}` : a && (a.traits?.warmth ?? 0) >= 0.5 ? ` ${a.closer}` : "";
  return `${lead} ${body}${tail}`.trim();
}

// ------------------------------------------------------------------ the claw

/**
 * ocClaw({ arena, heldOut, audit, incumbents }) -> the five agents over one arena.
 *   declare(decl) · train(declId) · evaluate(declId, { as }) · promote(declId) · auditAll() · verify() · reportHumans(human)
 *   state() · log() · events() · promoted() · declarations() · runs() · promotions() · refusals() · verdicts() · on(type, fn)
 * decl: { id, scenarioId, models: [ids], incumbent, challengers: [ids], metric: "success", seeds: [...], negativeControl? }
 * Each challenger is one declared pairwise comparison against the incumbent.
 */
export function ocClaw({ arena = null, heldOut = OC_HELD_OUT, audit = null, incumbents = {}, clock = null } = {}) {
  if (!arena || typeof arena.raRun !== "function") throw new Error("oc: an arena with the ROBO-ARENA contract is required");
  const models = new Map((arena.raModels?.() ?? []).map((m) => [m.id, m]));
  const scenarios = new Map((arena.raScenarios?.() ?? []).map((s) => [s.id, s]));
  const held = new Set(heldOut);
  const chain = [], log = [], listeners = new Map();
  const decls = new Map(), runs = new Map(), spent = new Map(), promotions = [], refusals = [], verdicts = [];
  const incumbent = { ...incumbents };
  let t = 0;
  const agent = (key) => OC_AGENTS.find((a) => a.key === key);
  const seedsOf = (m) => (typeof arena.trainingSeeds === "function" ? arena.trainingSeeds(m) ?? [] : ocTrainingSeeds(m));

  function write(action, detail) {
    const last = chain[chain.length - 1];
    const line = { seq: chain.length, at: clock ? String(clock()) : `C+${String(t).padStart(4, "0")}`, action, detail: String(detail).slice(0, 300), prev: last ? last.hash : "genesis" };
    line.hash = ocLineHash(line);
    chain.push(line);
    try { audit?.(action, line.detail, { at: line.at }); } catch (_) { /* the claw's own chain still holds the line */ }
    return line;
  }
  function emit(key, type, facts, extra = {}) {
    t += 1;
    const a = agent(key);
    const e = { t, type, agent: a.id, name: a.name, label: OC_AGENT_LABEL, text: ocSay(a, type, facts), ...extra };
    log.push(e);
    for (const fn of [...(listeners.get(type) ?? []), ...(listeners.get("*") ?? [])]) { try { fn(e); } catch (_) { /* a listener never stops the claw */ } }
    return e;
  }
  function refuse(key, subject, reason, extra = {}) {
    const e = emit(key, "refuse", { subject, reason }, { reason, subject, ...extra });
    const line = write("oc-refuse", `${agent(key).name} (${agent(key).key}) refused ${subject}: ${reason}`);
    const r = { t: e.t, agent: agent(key).id, name: agent(key).name, subject, reason, phrase: OC_REFUSALS[reason] ?? reason, seq: line.seq, ...extra };
    refusals.push(r);
    return { ok: false, reason, refusal: r };
  }
  const canonical = (d) => ({ id: String(d.id), scenarioId: String(d.scenarioId), models: [...(d.models ?? [])].map(String), incumbent: String(d.incumbent), challengers: [...(d.challengers ?? (d.challenger ? [d.challenger] : []))].map(String), negativeControl: d.negativeControl ? String(d.negativeControl) : null, metric: String(d.metric ?? "success"), interval: OC_INTERVAL, seeds: [...(d.seeds ?? [])].map(Number) });

  /** Planner: declare a comparison before it runs. */
  function declare(d0) {
    const subject = `declaration ${d0?.id ?? "?"}`;
    if (!d0 || !d0.id || decls.has(String(d0.id))) return refuse("planner", subject, "declaration-changed");
    const d = canonical(d0);
    if (!scenarios.has(d.scenarioId)) return refuse("planner", subject, "unknown-scenario");
    for (const id of [...d.models, d.incumbent, ...d.challengers]) if (!models.has(id)) return refuse("planner", subject, "unknown-model", { modelId: id });
    if (!d.models.includes(d.incumbent) || !d.challengers.length || d.challengers.some((c) => !d.models.includes(c) || c === d.incumbent)) return refuse("planner", subject, "unknown-model");
    if (!OC_METRICS[d.metric]) return refuse("planner", subject, "declaration-changed");
    const bad = d.seeds.filter((s) => !held.has(s));
    if (!d.seeds.length || bad.length) return refuse("planner", subject, "not-held-out", { seeds: bad.slice(0, 5) });
    const hash = ocHash(d);
    decls.set(d.id, { ...d, hash, t: t + 1 });
    if (!(d.scenarioId in incumbent)) incumbent[d.scenarioId] = d.incumbent;
    emit("planner", "declare", { declId: d.id, scenarioId: d.scenarioId, challengers: d.challengers.join(", "), incumbent: d.incumbent, models: d.models.length, metric: d.metric, seeds: ocSeedText(d.seeds) }, { declId: d.id });
    write("oc-declare", `${d.id} ${d.scenarioId} models=${d.models.join(",")} incumbent=${d.incumbent} challengers=${d.challengers.join(",")} metric=${d.metric} seeds=${ocSeedText(d.seeds)} hash=${hash}`);
    return { ok: true, hash, declaration: { ...d, hash }, comparisons: d.challengers.length };
  }

  /** Trainer: schedule the declared learners' training rounds on their own data; the auditor checks each for leakage. */
  function train(declId) {
    const d = decls.get(String(declId));
    if (!d) return refuse("trainer", `training for ${declId}`, "undeclared");
    const scheduled = [];
    for (const id of d.models) {
      const m = models.get(id);
      if (!ocTrainable(m)) continue;
      const seeds = seedsOf(m);
      const round = scheduled.length + 1;
      const source = seeds.length ? `training seeds ${ocSeedText(seeds)}` : "its own recorded data";
      emit("trainer", "train", { modelId: id, family: m.family, round, source }, { declId: d.id, modelId: id });
      write("oc-train", `${d.id} ${id} round=${round} trainingSeeds=${seeds.length} trainedOn=${String(m.trainedOn ?? "").slice(0, 120)}`);
      const leak = seeds.filter((s) => held.has(s));
      emit("auditor", "audit", { what: `leakage check for ${id}`, ok: !leak.length, detail: leak.length ? `held-out seeds in training: ${ocSeedText(leak)}` : `${seeds.length} training seeds, 0 held-out` }, { declId: d.id, modelId: id, ok: !leak.length });
      write("oc-audit-leakage", `${id} trainingSeeds=${seeds.length} heldOutInTraining=${leak.length}`);
      if (leak.length) (d.leak ??= []).push(id);
      scheduled.push({ modelId: id, family: m.family, round, trainingSeeds: seeds.length, heldOutInTraining: leak.length });
    }
    d.trained = scheduled;
    return { ok: true, scheduled };
  }

  /** Evaluator: run the declared comparison ONCE on its held-out seeds. `as` lets a caller try a changed comparison. */
  function evaluate(declId, { as = null, extra = {} } = {}) {
    const d = decls.get(String(declId));
    const subject = `run of ${declId}`;
    if (!d) return refuse("evaluator", subject, "undeclared");
    if (as && ocHash(canonical({ ...d, ...as })) !== d.hash) return refuse("evaluator", subject, "declaration-changed");
    if (runs.has(d.id)) return refuse("evaluator", subject, "already-run");
    if (d.leak?.length) return refuse("auditor", subject, "leakage", { models: d.leak.slice() });
    for (const id of d.models) {
      const used = spent.get(`${id}|${d.scenarioId}`);
      const again = used ? d.seeds.filter((s) => used.has(s)) : [];
      if (again.length) return refuse("auditor", subject, "seed-reused", { modelId: id, seeds: again.slice(0, 5), reused: again.length });
    }
    const results = [], raws = [];
    for (const id of d.models) {
      const r = arena.raRun({ modelId: id, scenarioId: d.scenarioId, seeds: d.seeds.slice(), ...extra });
      const key = `${id}|${d.scenarioId}`;
      if (!spent.has(key)) spent.set(key, new Set());
      for (const s of d.seeds) spent.get(key).add(s);
      raws.push(r);
      const row = ocRow(id, models.get(id), d, r);
      results.push(row);
      if (!row.applicable) {
        emit("evaluator", "audit", { what: `${id} on ${d.scenarioId}`, ok: true, detail: "not applicable to this scenario in this arena" }, { declId: d.id, modelId: id });
        write("oc-run", `${d.id} ${id} ${d.scenarioId} applicable=false`);
        continue;
      }
      emit("evaluator", "run", { modelId: id, scenarioId: d.scenarioId, k: row.k, n: row.n, lo: row.ci[0], hi: row.ci[1], ruleBreaks: row.ruleBreaks, checked: row.governorChecked, steps: row.steps, physical: row.physical }, { declId: d.id, modelId: id });
      write("oc-run", `${d.id} ${id} ${d.scenarioId} k=${row.k}/${row.n} ci=${row.ci.join("-")} ruleBreaks=${row.ruleBreaks} steps=${row.steps} governorChecked=${row.governorChecked} physical=${row.physical} result=${row.resultHash}`);
    }
    let board = null;
    try { board = arena.raLeaderboard ? arena.raLeaderboard(raws) : null; } catch (_) { board = null; }
    const run = { declId: d.id, scenarioId: d.scenarioId, seeds: d.seeds.slice(), results, leaderboard: board ? board.map((x) => ({ rank: x.rank, modelId: x.modelId, success: x.success, ci95: x.ci95, episodes: x.episodes, ruleBreaks: x.ruleBreaks, stops: x.stops, governorChecked: x.governorChecked, physical: x.physical })) : null, t };
    runs.set(d.id, run);
    return { ok: true, run };
  }

  /** The promoter's verdict on one challenger against the incumbent (no side effects). */
  function judge(c, inc) {
    if (!c || !inc) return "not-applicable";
    if (OC_REFERENCE_FAMILIES.some((f) => String(c.family).toLowerCase().includes(f))) return "reference-only";
    if (!c.applicable || !inc.applicable) return "not-applicable";
    if (c.physical !== 0) return "physical";
    if (c.steps <= 0 || c.governorChecked !== c.steps) return "governor-gap";
    if (c.ruleBreaks > 0) return "rule-broken";
    if (!(c.rate > inc.rate)) return "not-better";
    if (!(c.ci[0] > inc.ci[1])) return "interval-overlap";
    return "clear";
  }

  /** Promoter: a challenger replaces the incumbent only with a clear, rule-clean, fully governed win; one verdict per comparison. */
  function promote(declId) {
    const d = decls.get(String(declId));
    const subject = `promotion for ${declId}`;
    if (!d) return refuse("promoter", subject, "undeclared");
    const run = runs.get(d.id);
    if (!run) return refuse("promoter", subject, "not-run");
    const incId = incumbent[d.scenarioId] ?? d.incumbent;
    const inc = run.results.find((r) => r.modelId === incId) ?? run.results.find((r) => r.modelId === d.incumbent);
    const out = [];
    for (const cid of d.challengers) {
      const c = run.results.find((r) => r.modelId === cid);
      const v = judge(c, inc);
      const rec = { declId: d.id, scenarioId: d.scenarioId, challenger: cid, incumbent: inc?.modelId ?? incId, verdict: v, negativeControl: d.negativeControl === cid, cCi: c?.ci ?? null, iCi: inc?.ci ?? null, cRate: c?.rate ?? null, iRate: inc?.rate ?? null, ruleBreaks: c?.ruleBreaks ?? null };
      verdicts.push(rec); out.push(rec);
      if (v !== "clear") refuse("promoter", `${cid} over ${rec.incumbent} on ${d.scenarioId}`, v, { declId: d.id, challenger: cid, scenarioId: d.scenarioId, negativeControl: rec.negativeControl, ruleBreaks: rec.ruleBreaks });
    }
    const clear = out.filter((r) => r.verdict === "clear").sort((a, b) => b.cCi[0] - a.cCi[0] || (a.challenger < b.challenger ? -1 : 1));
    if (!clear.length) {
      emit("promoter", "keep", { incumbent: inc?.modelId ?? incId, scenarioId: d.scenarioId }, { declId: d.id });
      write("oc-keep", `${d.id} ${d.scenarioId} incumbent=${inc?.modelId ?? incId} clearWins=0`);
      return { ok: true, promotion: null, verdicts: out };
    }
    const best = clear[0], c = run.results.find((r) => r.modelId === best.challenger);
    incumbent[d.scenarioId] = c.modelId;
    const p = { declId: d.id, scenarioId: d.scenarioId, from: inc.modelId, to: c.modelId, metric: d.metric, cCi: c.ci, iCi: inc.ci, ruleBreaks: c.ruleBreaks, governorChecked: c.governorChecked, steps: c.steps, physical: c.physical, t: t + 1 };
    promotions.push(p);
    emit("promoter", "promote", { challenger: c.modelId, incumbent: inc.modelId, scenarioId: d.scenarioId, cK: c.k, iK: inc.k, n: c.n, cLo: c.ci[0], cHi: c.ci[1], iLo: inc.ci[0], iHi: inc.ci[1] }, { declId: d.id });
    write("oc-promote", `${d.id} ${d.scenarioId} ${inc.modelId} -> ${c.modelId} ci=${c.ci.join("-")} vs ${inc.ci.join("-")} ruleBreaks=0 governorChecked=${c.governorChecked}/${c.steps} physical=0`);
    return { ok: true, promotion: p, verdicts: out };
  }

  function verify() { return ocVerifyChain(chain); }

  /** Auditor: every run declared first and run once, no seed spent twice per model and scenario, held-out only, chain intact. */
  function auditAll() {
    const v = verify();
    const declaredFirst = [...runs.values()].every((r) => { const d = decls.get(r.declId); return d && d.t < r.t; });
    const seedOnce = (() => { const seen = new Map(); for (const r of runs.values()) for (const x of r.results) { const k = `${x.modelId}|${x.scenarioId}`; const s = seen.get(k) ?? new Set(); for (const sd of r.seeds) { if (s.has(sd)) return false; s.add(sd); } seen.set(k, s); } return true; })();
    const heldOnly = [...runs.values()].every((r) => r.seeds.every((s) => held.has(s)));
    const ok = v.ok && declaredFirst && seedOnce && heldOnly;
    emit("auditor", "audit", { what: "chain and runs", ok, detail: `${v.lines} lines, ${runs.size} runs, declared first ${declaredFirst ? "yes" : "no"}, seeds once ${seedOnce ? "yes" : "no"}` }, { ok });
    write("oc-audit", `chain=${v.ok ? "intact" : `broken@${v.brokenAt}`} lines=${v.lines} runs=${runs.size} declaredFirst=${declaredFirst} seedsOnce=${seedOnce} heldOutOnly=${heldOnly}`);
    return { ok, chain: v, declaredFirst, seedOnce, heldOnly };
  }

  /** Evaluator: the learners' own drill results beside the robots' (local data passed in; counts only enter the chain). */
  function reportHumans(human = null) {
    const rep = ocPracticeNeeds({ runs: [...runs.values()], promoted: { ...incumbent }, human });
    emit("evaluator", "human", { what: rep.summary }, { practice: true });
    write("oc-practice", `robots=${rep.robots.length} people=${rep.people.length} learnerData=${rep.learnerData}`);
    return rep;
  }

  return {
    agents: OC_AGENTS,
    declare, train, evaluate, promote, auditAll, verify, reportHumans, judge,
    promoted() { return { ...incumbent }; },
    declarations() { return [...decls.values()].map((d) => ({ ...d })); },
    runs() { return [...runs.values()]; },
    promotions() { return promotions.slice(); },
    refusals() { return refusals.slice(); },
    verdicts() { return verdicts.slice(); },
    log() { return chain.map((l) => ({ ...l })); },
    events() { return log.slice(); },
    on(type, fn) { if (typeof fn === "function") { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(fn); } },
    state() { return { version: OC_VERSION, declarations: this.declarations(), runs: this.runs(), promotions: promotions.slice(), refusals: refusals.slice(), verdicts: verdicts.slice(), promoted: { ...incumbent }, chain: verify(), lines: chain.length }; },
  };
}

/** A model that learns (its provenance does not start with "nothing" and it has learned parameters). */
export function ocTrainable(m) { return !!m && !/^nothing/i.test(String(m.trainedOn ?? "")) && m.params?.learned !== 0; }

/** One arena result as the claw's row: counts, not rates (the contract's `success` is a rate, `successes` a count). */
export function ocRow(id, model, d, r) {
  const applicable = r?.applicable !== false;
  const s = applicable ? ocSuccess(r, d.seeds.length) : { k: 0, n: 0, rate: 0, ci: [0, 0] };
  const steps = Number(r?.stepsRun ?? (Number.isFinite(r?.steps) && Number.isFinite(r?.n) ? r.steps * r.n : r?.steps ?? 0));
  const checked = Number(r?.stepsChecked ?? (Number(r?.governorChecked ?? 0) <= 1 ? Math.round(Number(r?.governorChecked ?? 0) * steps) : r.governorChecked));
  return {
    modelId: id, family: model?.family ?? "?", scenarioId: d.scenarioId, applicable, seeds: d.seeds.length, k: s.k, n: s.n, rate: s.rate, ci: s.ci,
    ruleBreaks: Number(r?.ruleBreaks ?? 0), steps, stops: Number(r?.stops ?? 0), governorChecked: checked, physical: Number(r?.physical ?? 0),
    resultHash: ocHash({ id, sc: d.scenarioId, seeds: d.seeds, perSeed: (r?.perSeed ?? []).map((p) => [p.seed, p.success, p.steps, p.ruleBreaks]) }),
  };
}

/**
 * ROBO-ARENA's module as the claw's arena, with the training seeds each model's data came from, derived from the arena's
 * published constants (RA_DEMOS: demonstrations at seed*100003 + k + 1; RA_DAGGER: rollouts at seed0 + round*100 + k)
 * and ROBOTRAIN-6's pair seeds (31 + i, each run at (31 + i)*100003 + 1) for the per-step-reward model.
 */
export function ocRaAdapter(ra, { scenarioKinds = ["gym"], lmOptions = null } = {}) {
  const D = ra.RA_DEMOS ?? { n: 40, seed: 1 }, G = ra.RA_DAGGER ?? { rollouts: 20, seed0: 800000 };
  const demos = Array.from({ length: D.n }, (_, k) => D.seed * 100003 + k + 1);
  const dagger = (rounds) => Array.from({ length: rounds }, (_, r) => Array.from({ length: G.rollouts }, (_, k) => G.seed0 + (r + 1) * 100 + k)).flat();
  const pairs = Array.from({ length: 200 }, (_, i) => (31 + i) * 100003 + 1);
  const seeds = { bc: demos, "dagger-r1": [...demos, ...dagger(1)], "dagger-r3": [...demos, ...dagger(3)], "step-reward": [...demos, ...pairs], "ra-lm": demos };
  return {
    raModels: () => ra.raModels(),
    raScenarios: () => ra.raScenarios().filter((s) => scenarioKinds.includes(s.kind)),
    raRun: (q) => ra.raRun(lmOptions ? { ...q, lmOptions } : q),
    raLeaderboard: (rs) => ra.raLeaderboard(rs),
    trainingSeeds: (m) => seeds[m.id] ?? ocTrainingSeeds(m),
  };
}

/** Re-walk a recorded chain (the committed record, or a page's copy) and say whether it is intact. */
export function ocVerifyChain(lines = []) {
  let prev = "genesis";
  for (let i = 0; i < lines.length; i += 1) { const l = lines[i]; if (l.seq !== i || l.prev !== prev || ocLineHash(l) !== l.hash) return { ok: false, brokenAt: i, lines: lines.length }; prev = l.hash; }
  return { ok: true, brokenAt: null, lines: lines.length };
}

/**
 * A page's check of a trimmed record: its last line re-hashed on this device matches the head hash and the line count.
 * The full chain is re-walked by check_claw from the committed JSON; the page says so.
 */
export function ocVerifyHead(head, tail = []) {
  const l = tail[tail.length - 1];
  if (!head || !l) return { ok: false, lines: head?.lines ?? 0, hash: head?.hash ?? null };
  return { ok: ocLineHash(l) === l.hash && l.hash === head.hash && l.seq === head.lines - 1, lines: head.lines, hash: head.hash };
}

// ------------------------------------------------------------------ people and robots in one report

/** The tutor's cell-entry steps and the drills map onto robot scenarios by procedure. */
export const OC_HUMAN_SCENARIO = Object.freeze({ tutor: "rb-cell-entry" });
export const OC_DRILL_PASS = 80;

/**
 * Where people and robots each need practice. Robots: the promoted (or incumbent) model per scenario with its measured
 * success below 0.9 or any rule break. People: drills whose best score is under the pass mark, and the tutor's steps by
 * smoothed error rate (Beta(1,1)), highest first. `human` = { eligible, drills: { best: { id: score } }, tutor: { steps } }.
 * When the learner is not eligible (not opted in, K-12, demo or signed out) no learner value is read or shown.
 */
export function ocPracticeNeeds({ runs = [], promoted = {}, human = null, below = 0.9 } = {}) {
  const robots = [];
  for (const r of runs) {
    const id = promoted[r.scenarioId];
    const x = r.results.find((y) => y.modelId === id) ?? null;
    if (!x) continue;
    if (x.rate < below || x.ruleBreaks > 0) robots.push({ scenarioId: r.scenarioId, modelId: x.modelId, rate: x.rate, ci: x.ci, ruleBreaks: x.ruleBreaks, why: x.ruleBreaks > 0 ? "rule breaks" : `success ${x.rate} under ${below}` });
  }
  const eligible = !!human?.eligible;
  const people = [];
  if (eligible) {
    for (const [id, score] of Object.entries(human.drills?.best ?? {})) if (Number(score) < OC_DRILL_PASS) people.push({ kind: "drill", id, score: Number(score), why: `best ${Number(score)} under the pass mark ${OC_DRILL_PASS}` });
    const steps = Object.entries(human.tutor?.steps ?? {}).map(([id, e]) => ({ id, tries: e.tries | 0, errors: e.errors | 0, rate: ocR3(((e.errors | 0) + 1) / ((e.tries | 0) + 2)) })).filter((s) => s.tries > 0 && s.errors > 0).sort((a, b) => b.rate - a.rate);
    for (const s of steps.slice(0, 3)) people.push({ kind: "tutor-step", id: s.id, scenarioId: OC_HUMAN_SCENARIO.tutor, rate: s.rate, tries: s.tries, why: `${s.errors} of ${s.tries} tries wrong` });
  }
  const summary = `robots need practice on ${robots.length} scenario${robots.length === 1 ? "" : "s"}; ${eligible ? `people on ${people.length} item${people.length === 1 ? "" : "s"} from this device's own drills and tutor` : "learner results not shown (not opted in on this device)"}`;
  return { robots, people, learnerData: eligible ? "local" : "none", summary };
}

/**
 * The learner stations that match a robot scenario: the robot stations (RP_ROBOT_STATIONS) at the operator and technician
 * levels of every robotics-programme track whose `scenario` is the scenario's base (a hard variant shares its base's).
 * `tracks` is RP_TRACKS and `isRobot` rpIsRobotStation (shared/rp-programme-data.js), injected so this module keeps no import.
 */
export function ocScenarioDrills(tracks = [], isRobot = () => true) {
  const out = {};
  for (const t of tracks) {
    if (!t?.scenario) continue;
    const xs = (out[t.scenario] ??= []);
    for (const lv of ["operator", "technician"]) for (const id of t.levels?.[lv] ?? []) if (isRobot(id) && !xs.includes(id)) xs.push(id);
  }
  return out;
}
/** ocScenarioDrills(RP_TRACKS, rpIsRobotStation), frozen for the page (check_claw 10 re-derives it from the programme). */
export const OC_SCENARIO_DRILLS = Object.freeze({
  "rb-cell-entry": ["robot-cell", "rt-robot-estop-recovery-and-restart", "tw-palletizer-cell-fenced-access-permit", "ad-robot-cell-lockout-and-safe-reentry", "rt-teach-pendant-safe-jogging", "tw-amr-traffic-zone-entry-and-lockout"],
  "rb-cobot-zone-setup": ["ad-cobot-risk-assessment-and-speed-separation", "robot-cell", "rt-cobot-power-force-limit-check", "ad-robot-cell-lockout-and-safe-reentry"],
  "rb-amr-fleet-routing": ["ad-amr-fleet-traffic-and-estop-drill", "tw-amr-traffic-zone-entry-and-lockout"],
  "rb-construction-drilling": ["rp-construction-drilling-robot-setup"],
  "rb-teleop-pick-place": ["ad-cobot-risk-assessment-and-speed-separation", "rp-teleop-demonstration-collection", "robot-cell", "ad-robot-cell-lockout-and-safe-reentry", "ad-amr-fleet-traffic-and-estop-drill"],
});

/**
 * People and robots side by side, one row per robot scenario. Robot: the model the scenario runs (promoted or incumbent),
 * its measured success and interval, and a gap when success is under `below` or any rule broke. People: the matching
 * learner stations (OC_SCENARIO_DRILLS; none for a scenario no track covers, which is itself a gap in the programme), and,
 * only when the learner is eligible, which of them this device's own records show passed. `human.stations` is
 * { [stationId]: { passed, best } } from the device's training records; nothing is read or shown when not eligible.
 */
export function ocSideBySide({ runs = [], promoted = {}, human = null, drills = OC_SCENARIO_DRILLS, below = 0.9 } = {}) {
  const eligible = !!human?.eligible;
  return runs.map((r) => {
    const id = promoted[r.scenarioId];
    const x = r.results.find((y) => y.modelId === id) ?? null;
    const robot = x ? { modelId: x.modelId, k: x.k, n: x.n, rate: x.rate, ci: x.ci, ruleBreaks: x.ruleBreaks, gap: x.rate < below || x.ruleBreaks > 0, why: x.ruleBreaks > 0 ? `${x.ruleBreaks} rule breaks` : x.rate < below ? `success ${x.rate} under ${below}` : "at the mark" } : null;
    const base = String(r.scenarioId).split("#")[0];
    const stations = [...(drills[base] ?? [])];
    let people;
    if (!stations.length) people = { stations, gap: true, why: "no learner station in the programme matches this scenario yet", learner: null };
    else if (!eligible) people = { stations, gap: null, why: `${stations.length} matching station${stations.length === 1 ? "" : "s"}`, learner: null };
    else {
      const rec = human.stations ?? {};
      const passed = stations.filter((s) => rec[s]?.passed);
      const todo = stations.filter((s) => !rec[s]?.passed);
      people = { stations, gap: todo.length > 0, why: `${passed.length} of ${stations.length} passed on this device`, learner: { passed, todo } };
    }
    return { scenarioId: r.scenarioId, robot, people };
  });
}

// ------------------------------------------------------------------ the declared protocol (committed before any held-out run)

/**
 * Round 6b's protocol. Every gym scenario of the arena (the six games and their three hard variants; the robot stations
 * need their rooms and are left to ROBO-ARENA's full suite) gets one declaration: all eight model families run once on
 * all 60 held-out seeds; the behaviour clone is the incumbent; four learners are challengers, and the random policy is a
 * declared negative control (it is expected to be refused for rule breaks). 9 scenarios x 5 challengers = 45 declared
 * comparisons. Metric: success rate. Promotion: the challenger's Wilson 95% lower bound above the incumbent's upper
 * bound, 0 rule breaks, the governor on every step, 0 physical. After the runs, two probes that must be refused without
 * running anything: an undeclared comparison, and a re-test on ten held-out seeds already spent.
 */
export const OC_PROTOCOL = Object.freeze({
  version: "oc-protocol/1",
  seeds: OC_HELD_OUT,
  scenarios: Object.freeze(["rb-cell-entry", "rb-cobot-zone-setup", "rb-teleop-pick-place", "rb-amr-fleet-routing", "rb-construction-drilling", "rb-port-gantry", "rb-construction-drilling#hard", "rb-port-gantry#hard", "rb-amr-fleet-routing#hard"]),
  models: Object.freeze(["random", "reactive", "bc", "dagger-r1", "dagger-r3", "step-reward", "ra-lm", "expert"]),
  incumbent: "bc",
  challengers: Object.freeze(["dagger-r1", "dagger-r3", "step-reward", "ra-lm", "random"]),
  negativeControl: "random",
  metric: "success",
  interval: OC_INTERVAL,
  promotion: "challenger lower bound > incumbent upper bound, ruleBreaks = 0, governorChecked = stepsRun, physical = 0; the scripted expert is never a candidate",
  probes: Object.freeze([
    { kind: "undeclared", id: "oc-probe-undeclared", note: "evaluate a comparison id that was never declared" },
    { kind: "seed-reused", id: "oc-probe-retest", scenarioId: "rb-cell-entry", models: ["bc", "dagger-r3"], incumbent: "bc", challengers: ["dagger-r3"], seeds: OC_HELD_OUT.slice(0, 10), note: "declare a re-test on ten held-out seeds already spent, then try to run it" },
  ]),
});

/** The protocol's declarations, one per scenario (protocol 2's ids start `oc2-`, so they never meet protocol 1's). */
export function ocProtocolDeclarations(p = OC_PROTOCOL) {
  const pre = p.idPrefix ?? "oc";
  return p.scenarios.map((sc) => ({ id: `${pre}-${sc.replace(/[^a-z0-9]+/gi, "-")}`, scenarioId: sc, models: [...p.models], incumbent: p.incumbent, challengers: [...p.challengers], negativeControl: p.negativeControl, metric: p.metric, seeds: [...p.seeds] }));
}

/**
 * Round 7's held-out seeds, drawn ONLY through ARENA-2's committed declaration (docs/evals/arena-declared-r7.json,
 * commit 8ea01d3c: gym 7181–7240). The claw for protocol 2 is a NEW instance whose held-out set is these seeds alone, so
 * protocol 1's spent seeds (7121–7180) are refused as not held out.
 */
export const OC_HELD_OUT_2 = Object.freeze(Array.from({ length: 60 }, (_, i) => 7181 + i));

/**
 * Round 7's protocol (committed before its one held-out run). It is the first claw comparison of the small
 * language-conditioned model (ra-lm, ROBO-ARENA's ra/1 model, trained here; never a large language model), which round 6b
 * could not compare because its branch carried the contract stub. Same nine gym scenarios, same eight models and the same
 * gate as protocol 1; the incumbent is the model promoted on every scenario after protocol 1 (bc: 0 promotions there).
 * ra-lm is built as ROBO-ARENA declared it: its task texts (raLmTaskTexts over the stations' exported steps) and the three
 * station tasks in its training set; it runs on the gym scenarios only. ARENA-2's ra-lm-h is not in this branch (its
 * declaration is; the model lands later), so it is not declared here. Probes: an undeclared run; a re-test on ten of
 * these seeds once spent; and a declaration on ten of protocol 1's spent seeds, refused as not held out.
 */
export const OC_PROTOCOL_2 = Object.freeze({
  version: "oc-protocol/2",
  idPrefix: "oc2",
  seeds: OC_HELD_OUT_2,
  seedSource: Object.freeze({ owner: "ARENA-2", file: "docs/evals/arena-declared-r7.json", commit: "8ea01d3c", gym: "7181–7240" }),
  scenarios: OC_PROTOCOL.scenarios,
  models: OC_PROTOCOL.models,
  incumbent: "bc",
  incumbentFrom: "oc-protocol/1: bc kept every gym scenario (0 promotions)",
  challengers: Object.freeze(["ra-lm", "dagger-r1", "dagger-r3", "step-reward", "random"]),
  negativeControl: "random",
  lm: "ra-lm as declared in arena-declared.json (ra/1): lmOptions { texts: raLmTaskTexts(raReadStation), stationFor: the three headless station rooms }",
  metric: "success",
  interval: OC_INTERVAL,
  promotion: OC_PROTOCOL.promotion,
  probes: Object.freeze([
    { kind: "undeclared", id: "oc2-probe-undeclared", note: "evaluate a comparison id that was never declared" },
    { kind: "seed-reused", id: "oc2-probe-retest", scenarioId: "rb-cell-entry", models: ["bc", "ra-lm"], incumbent: "bc", challengers: ["ra-lm"], seeds: OC_HELD_OUT_2.slice(0, 10), note: "declare a re-test of ra-lm on ten of these seeds once spent, then try to run it" },
    { kind: "not-held-out", id: "oc2-probe-spent-r6", scenarioId: "rb-amr-fleet-routing", models: ["bc", "ra-lm"], incumbent: "bc", challengers: ["ra-lm"], seeds: OC_HELD_OUT.slice(0, 10), note: "declare ra-lm on ten of protocol 1's spent seeds (7121–7130): refused at declaration" },
  ]),
});
