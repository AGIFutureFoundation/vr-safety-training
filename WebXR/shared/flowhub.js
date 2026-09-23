/**
 * FlowHub — the SmartCiti.X side of a host-orchestrated training flow.
 *
 * A host platform (the learner's LMS, portal or world) knows things this
 * repository cannot: which lesson a learner read this morning, which
 * assessment they owe, what their employer's induction requires this quarter.
 * What it does not know is how a station runs, what a passing attempt is, or
 * which station comes next when the last one was only scraped through. A
 * *flow* is the contract between the two: the host hands over an ordered graph
 * of nodes with the conditions on each edge, this side runs the nodes it owns,
 * reports every transition, and hands a node back to the host when the node is
 * the host's to run.
 *
 * The user's host platform is Cognition.X and its orchestration component is
 * called FlowHub. **No FlowHub specification exists in this repository and
 * nothing here is derived from one.** Everything below is the SmartCiti.X side
 * of the contract, specified from this end: the schema we validate, the
 * messages we accept and the messages we emit. What Cognition.X's FlowHub —
 * or any other host — implements or adapts to speak it is documented in
 * `docs/flowhub.md` as an assumption, never as knowledge of its internals.
 *
 * This module is deliberately pure: no DOM, no three.js, no import of an app.
 * `node tools/check_flowhub.mjs` runs it directly, which is the only reason
 * the branch conditions can be gated at all.
 *
 * ## The schema
 *
 *   flow  = { id, title, version, start, nodes: [node], edges: [edge], meta? }
 *   node  = { id, kind, app?, ref?, params?, title?, why? }
 *           kind: "station" | "programme" | "brief" | "checkin" | "gate" | "external"
 *   edge  = { from, to, when? }
 *           when: { passed?, minStars?, maxHazards?, competency?, custom? }
 *
 * An outcome is the attempt record this engine already writes (`passed`,
 * `stars`, `hazardHits`, `interrupts`, `seconds`, `parSeconds` — see
 * `shared/records.js`) reduced by `outcomeFromRecord`. Nothing new is scored
 * for a flow: a flow reads the same verdict the certificate claim rests on.
 *
 * ## The competency layer
 *
 * A `gate` node asks whether a competency has been *demonstrated*, which is a
 * question the competency layer (`shared/competency.js`) owns. That module is
 * not in this tree, so this one never imports it: `hasCompetencyLayer()` is
 * the feature check and `setCompetencyResolver()` is the seam. Until it lands,
 * the default resolver answers from the run itself, using the mastery rule the
 * proof brief states (>= 2 stars, no unsafe action, every interruption
 * answered, time <= 1.5 x par) over the stations the gate names. When the
 * module lands, one call in each app replaces that default and nothing else
 * changes.
 */

export const FLOW_PROTOCOL = 1;

/**
 * The one localStorage key a flow run lives under, versioned like every other
 * store in this engine. It holds every loaded flow and its run, so a flow that
 * sends a learner from SmartCiti.X to Trade Skills and back survives the app
 * switch (the three apps are separate pages on one origin).
 */
export const FLOW_STORE_KEY = "vr-training-flowhub-v1";

export const NODE_KINDS = ["station", "programme", "brief", "checkin", "gate", "external"];
export const LEARNER_APPS = ["smartcity", "trades", "holodeck"];
/** The app id an `external` node carries: the host runs it, not us. */
export const HOST_APP = "host";
export const WHEN_KEYS = ["passed", "minStars", "maxHazards", "competency", "custom"];
export const GATE_RULES = ["mastery", "passed"];

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;
const isSlug = (v) => typeof v === "string" && SLUG.test(v);
const isInt = (v) => Number.isInteger(v);

// ------------------------------------------------------------------ outcomes

/**
 * One attempt, as a flow reads it. Takes the record `shared/records.js`
 * writes (or a Session summary shaped like one) and keeps only the fields an
 * edge condition may ask about, so a flow can never branch on something an
 * attempt record does not actually carry.
 */
export function outcomeFromRecord(record = {}, extra = {}) {
  const iv = record.debrief?.interrupts ?? record.interrupts ?? {};
  const stars = record.stars | 0;
  const hazardHits = record.hazardHits | 0;
  const interrupts = {
    total: iv.total | 0,
    answered: iv.answered | 0,
    missed: iv.missed | 0,
    wrong: iv.wrong | 0,
  };
  return {
    passed: typeof record.passed === "boolean" ? record.passed : stars >= 2 && hazardHits === 0,
    stars, hazardHits, interrupts,
    seconds: record.seconds == null ? null : Math.round(record.seconds),
    parSeconds: record.parSeconds == null ? null : Math.round(record.parSeconds),
    app: record.app ?? null,
    ref: record.simId ?? record.ref ?? null,
    competencies: Array.isArray(record.competencies) ? [...record.competencies] : [],
    ...extra,
  };
}

/** The proof brief's mastery rule, stated once. */
export function mastered(outcome = {}) {
  const o = outcome ?? {};
  if ((o.stars | 0) < 2) return false;
  if ((o.hazardHits | 0) !== 0) return false;
  const iv = o.interrupts ?? {};
  if ((iv.missed | 0) + (iv.wrong | 0) > 0) return false;
  if (o.seconds != null && o.parSeconds) return o.seconds <= o.parSeconds * 1.5;
  return true;
}

/** An outcome a node that is not scored produces (a brief read, a check-in answered). */
export function acknowledgedOutcome(extra = {}) {
  return {
    passed: true, stars: 0, hazardHits: 0,
    interrupts: { total: 0, answered: 0, missed: 0, wrong: 0 },
    seconds: null, parSeconds: null, competencies: [], acknowledged: true,
    ...extra,
  };
}

// -------------------------------------------------------------- competencies

let competencyResolver = null;

/** True when a competency layer has been wired in (see the header note). */
export function hasCompetencyLayer() { return typeof competencyResolver === "function"; }

/**
 * Hand in the competency layer's own answer. `fn(id, { outcome, run, flow })`
 * returns true when the learner holds that competency. Pass null to go back
 * to the built-in rule.
 */
export function setCompetencyResolver(fn) { competencyResolver = typeof fn === "function" ? fn : null; }

/**
 * Does the learner hold this competency at this point in the run? The wired
 * layer answers if there is one; otherwise the outcome in hand and the run's
 * own granted set do, which is what a gate node fills.
 */
export function competencyHeld(id, outcome = {}, ctx = {}) {
  if (!id) return false;
  if (competencyResolver) {
    try { return !!competencyResolver(id, { outcome, ...ctx }); } catch (_) { return false; }
  }
  if (Array.isArray(outcome.competencies) && outcome.competencies.includes(id)) return true;
  return Array.isArray(ctx.competencies) && ctx.competencies.includes(id);
}

// ----------------------------------------------------- custom edge conditions

const CONDITIONS = new Map();

/** Register a named predicate an edge may use as `when.custom`. */
export function registerCondition(name, fn) {
  if (typeof name !== "string" || !name || typeof fn !== "function") return false;
  CONDITIONS.set(name, fn);
  return true;
}
export function conditionNames() { return [...CONDITIONS.keys()].sort(); }
export function hasCondition(name) { return CONDITIONS.has(name); }

// The two a flow actually wants, so `custom` is a usable field rather than an
// escape hatch nothing implements. Both read only the attempt record.
registerCondition("under-par", (o) => o?.seconds != null && !!o?.parSeconds && o.seconds <= o.parSeconds);
registerCondition("clean", (o) => (o?.hazardHits | 0) === 0 && ((o?.interrupts?.missed | 0) + (o?.interrupts?.wrong | 0)) === 0);

// --------------------------------------------------------------- flow reading

export function nodeById(flow, id) { return (flow?.nodes ?? []).find((n) => n.id === id) ?? null; }
export function edgesFrom(flow, id) { return (flow?.edges ?? []).filter((e) => e.from === id); }
export function terminalNodes(flow) {
  return (flow?.nodes ?? []).filter((n) => edgesFrom(flow, n.id).length === 0).map((n) => n.id);
}

/** A node's own label for a HUD, a panel or a console row. */
export function nodeLabel(node) {
  if (!node) return "";
  if (node.title) return node.title;
  if (node.ref) return String(node.ref).replace(/-/g, " ");
  return String(node.id ?? "").replace(/-/g, " ");
}

/** A `when` in words — this is the `why` every transition reports. */
export function describeWhen(when) {
  const w = when ?? {};
  const parts = [];
  if ("passed" in w) parts.push(w.passed ? "passed" : "not passed");
  if ("minStars" in w) parts.push(`${w.minStars} star${w.minStars === 1 ? "" : "s"} or better`);
  if ("maxHazards" in w) parts.push(w.maxHazards === 0 ? "no unsafe action" : `at most ${w.maxHazards} unsafe actions`);
  if ("competency" in w) parts.push(`competency ${w.competency} demonstrated`);
  if ("custom" in w) parts.push(`condition ${w.custom}`);
  return parts.length ? parts.join(" and ") : "always";
}

/** Does this edge's condition hold for this outcome? Absent keys never block. */
export function edgeMatches(edge, outcome = {}, ctx = {}) {
  const w = edge?.when ?? {};
  if ("passed" in w && !!w.passed !== !!outcome.passed) return false;
  if ("minStars" in w && (outcome.stars | 0) < (w.minStars | 0)) return false;
  if ("maxHazards" in w && (outcome.hazardHits | 0) > (w.maxHazards | 0)) return false;
  if ("competency" in w && !competencyHeld(w.competency, outcome, ctx)) return false;
  if ("custom" in w) {
    const fn = CONDITIONS.get(w.custom);
    if (!fn) return false;
    try { if (!fn(outcome, ctx)) return false; } catch (_) { return false; }
  }
  return true;
}

/**
 * Where this outcome sends the flow from `nodeId`. Edges are tried in the
 * order the flow declares them and the first match wins, so a flow reads
 * top-down like the decision it is. A node with no outgoing edge ends the
 * flow; a node whose every edge condition fails also ends it, and says so.
 */
export function nextNode(flow, nodeId, outcome = {}, ctx = {}) {
  const out = edgesFrom(flow, nodeId);
  if (!out.length) return { to: null, node: null, edge: null, done: true, why: "end of flow" };
  for (const edge of out) {
    if (!edgeMatches(edge, outcome, ctx)) continue;
    return { to: edge.to, node: nodeById(flow, edge.to), edge, done: false, why: describeWhen(edge.when) };
  }
  return { to: null, node: null, edge: null, done: true, why: "no branch condition matched" };
}

// ---------------------------------------------------------------------- gates

/**
 * A gate runs nothing. It reads the run that led to it and answers whether the
 * competency it names has been demonstrated, under the rule it names, over the
 * stations it names. The answer is an outcome, so the gate's own outgoing
 * edges are evaluated exactly like a station's.
 */
export function evaluateGate(node, run, flow = null, ctx = {}) {
  const p = node?.params ?? {};
  const rule = GATE_RULES.includes(p.rule) ? p.rule : "mastery";
  const wanted = Array.isArray(p.stations) ? p.stations : [];
  const best = new Map();
  for (const entry of run?.history ?? []) {
    if (!entry?.ref || !entry.outcome) continue;
    const prev = best.get(entry.ref);
    const score = (entry.outcome.stars | 0) - (entry.outcome.hazardHits | 0) * 10;
    if (!prev || score > prev.score) best.set(entry.ref, { score, outcome: entry.outcome });
  }
  const evidence = wanted.map((ref) => {
    const o = best.get(ref)?.outcome ?? null;
    const ok = !o ? false : rule === "mastery" ? mastered(o) : !!o.passed;
    const note = !o
      ? "not attempted in this flow"
      : ok
        ? (rule === "mastery" ? "mastered" : "passed")
        : (rule === "mastery" ? "attempted, not to the mastery rule" : "attempted, not passed");
    return { ref, ok, stars: o?.stars ?? null, hazardHits: o?.hazardHits ?? null, note };
  });
  // A competency layer, when one is wired in, is the authority; the stations
  // in the run are the fallback evidence.
  const layerSays = p.competency && hasCompetencyLayer()
    ? competencyHeld(p.competency, {}, { ...ctx, run, flow, competencies: run?.competencies ?? [] })
    : null;
  const byEvidence = evidence.length > 0 && evidence.every((e) => e.ok);
  const held = layerSays === null ? byEvidence : layerSays;
  const missing = evidence.filter((e) => !e.ok).map((e) => e.ref);
  return {
    ...acknowledgedOutcome(),
    passed: held, gate: true, rule,
    competency: p.competency ?? null,
    competencies: held && p.competency ? [p.competency] : [],
    evidence,
    source: layerSays === null ? "run evidence" : "competency layer",
    why: held
      ? `${p.competency ?? "gate"} demonstrated — ${evidence.filter((e) => e.ok).length}/${evidence.length} stations to the ${rule} rule`
      : `${p.competency ?? "gate"} not yet demonstrated — ${missing.join(", ") || "no evidence"}`,
  };
}

// ----------------------------------------------------------------- validation

/**
 * Everything that must be true of a flow before an app will run it.
 * `catalog` is `WebXR/smartcity/catalog.json` (or anything with the same
 * `stations` / `curricula` arrays); pass null to skip the existence checks and
 * get a warning saying so — a host that hands us a flow gets the full check.
 */
export function validateFlow(flow, catalog = null) {
  const errors = [], warnings = [];
  const bad = (m) => errors.push(m);
  if (!flow || typeof flow !== "object" || Array.isArray(flow)) {
    return { ok: false, errors: ["flow is not an object"], warnings, nodes: 0, edges: 0, terminals: [] };
  }
  if (!isSlug(flow.id)) bad(`flow id ${JSON.stringify(flow.id)} is not a slug (a-z, 0-9, dashes)`);
  if (typeof flow.title !== "string" || !flow.title.trim()) bad("flow has no title");
  if (!isInt(flow.version) || flow.version < 1) bad(`flow version ${JSON.stringify(flow.version)} is not a positive integer`);
  const nodes = Array.isArray(flow.nodes) ? flow.nodes : null;
  const edges = Array.isArray(flow.edges) ? flow.edges : null;
  if (!nodes) bad("flow.nodes is not an array");
  if (!edges) bad("flow.edges is not an array");
  if (!nodes || !edges) return { ok: false, errors, warnings, nodes: 0, edges: 0, terminals: [] };
  if (!nodes.length) bad("flow has no nodes");

  const stationIds = new Set();
  const programmeIds = new Set();
  if (catalog) {
    for (const s of catalog.stations ?? []) stationIds.add(`${s.app}:${s.id}`);
    for (const c of catalog.curricula ?? []) programmeIds.add(c.id);
    if (!stationIds.size) warnings.push("the catalog handed in lists no stations");
  } else {
    warnings.push("no catalog handed in — station and programme ids were not checked against the roster");
  }

  const seen = new Set();
  for (const n of nodes) {
    const at = `node ${JSON.stringify(n?.id)}`;
    if (!n || typeof n !== "object") { bad("a node is not an object"); continue; }
    if (!isSlug(n.id)) bad(`${at} is not a slug`);
    else if (seen.has(n.id)) bad(`${at} is declared twice`);
    seen.add(n.id);
    if (!NODE_KINDS.includes(n.kind)) { bad(`${at} has kind ${JSON.stringify(n.kind)}, not one of ${NODE_KINDS.join(", ")}`); continue; }
    if (n.kind === "external") {
      if (n.app !== HOST_APP) bad(`${at} is external, so its app must be "${HOST_APP}" — the host runs it`);
      if (typeof n.ref !== "string" || !n.ref.trim()) bad(`${at} is external but names nothing for the host to run`);
      continue;
    }
    if (n.kind === "checkin") {
      if (n.app && !LEARNER_APPS.includes(n.app)) bad(`${at} has app ${JSON.stringify(n.app)}`);
      continue;
    }
    if (n.kind === "gate") {
      const p = n.params ?? {};
      if (typeof p.competency !== "string" || !p.competency.trim()) bad(`${at} is a gate with no params.competency`);
      if (p.rule != null && !GATE_RULES.includes(p.rule)) bad(`${at} gate rule ${JSON.stringify(p.rule)} is not one of ${GATE_RULES.join(", ")}`);
      if (!Array.isArray(p.stations) || !p.stations.length) bad(`${at} is a gate with no params.stations to read evidence from`);
      else if (catalog) {
        for (const ref of p.stations) {
          if (!stationIds.has(`smartcity:${ref}`) && !stationIds.has(`trades:${ref}`)) {
            bad(`${at} gate names station ${JSON.stringify(ref)}, which is not in the catalog`);
          }
        }
      }
      continue;
    }
    const app = n.app ?? "smartcity";
    if (!LEARNER_APPS.includes(app)) bad(`${at} has app ${JSON.stringify(n.app)}, not one of ${LEARNER_APPS.join(", ")}`);
    if (typeof n.ref !== "string" || !n.ref.trim()) { bad(`${at} is a ${n.kind} node with no ref`); continue; }
    if (n.kind === "programme") {
      if (app !== "smartcity") bad(`${at} is a programme node, which only SmartCiti.X runs`);
      if (catalog && !programmeIds.has(n.ref)) bad(`${at} names programme ${JSON.stringify(n.ref)}, which is not in the catalog`);
      continue;
    }
    // station and brief both name a station in one of the learner apps.
    if (catalog && !stationIds.has(`${app}:${n.ref}`)) bad(`${at} names ${app} station ${JSON.stringify(n.ref)}, which is not in the catalog`);
  }

  if (!isSlug(flow.start)) bad(`flow.start ${JSON.stringify(flow.start)} is not a slug`);
  else if (!seen.has(flow.start)) bad(`flow.start names ${JSON.stringify(flow.start)}, which is not a node`);

  for (const e of edges) {
    const at = `edge ${JSON.stringify(e?.from)} -> ${JSON.stringify(e?.to)}`;
    if (!e || typeof e !== "object") { bad("an edge is not an object"); continue; }
    if (!seen.has(e.from)) bad(`${at}: no node ${JSON.stringify(e.from)}`);
    if (!seen.has(e.to)) bad(`${at}: no node ${JSON.stringify(e.to)}`);
    const w = e.when;
    if (w == null) continue;
    if (typeof w !== "object" || Array.isArray(w)) { bad(`${at}: when is not an object`); continue; }
    for (const k of Object.keys(w)) if (!WHEN_KEYS.includes(k)) bad(`${at}: when.${k} is not one of ${WHEN_KEYS.join(", ")}`);
    if ("passed" in w && typeof w.passed !== "boolean") bad(`${at}: when.passed is not a boolean`);
    if ("minStars" in w && (!isInt(w.minStars) || w.minStars < 0 || w.minStars > 3)) bad(`${at}: when.minStars is not 0-3`);
    if ("maxHazards" in w && (!isInt(w.maxHazards) || w.maxHazards < 0)) bad(`${at}: when.maxHazards is not a count`);
    if ("competency" in w && (typeof w.competency !== "string" || !w.competency.trim())) bad(`${at}: when.competency is not a name`);
    if ("custom" in w && !CONDITIONS.has(w.custom)) bad(`${at}: when.custom names ${JSON.stringify(w.custom)}, which no condition implements (have: ${conditionNames().join(", ")})`);
  }

  // An external node is the host's; the flow must be able to come back from it.
  for (const n of nodes) {
    if (n.kind !== "external") continue;
    if (!edgesFrom(flow, n.id).length) {
      warnings.push(`node "${n.id}" is external and terminal — the host's node ends the flow, so nothing waits for a resume`);
    }
  }

  // Every node has to be reachable, and every node with outgoing edges must be
  // able to leave itself: a retry loop is fine, a node whose only edge points
  // back at itself is a dead end that looks like progress.
  const reachable = new Set();
  const walk = [flow.start];
  while (walk.length) {
    const id = walk.pop();
    if (!seen.has(id) || reachable.has(id)) continue;
    reachable.add(id);
    for (const e of edgesFrom(flow, id)) walk.push(e.to);
  }
  for (const n of nodes) if (!reachable.has(n.id)) bad(`node ${JSON.stringify(n.id)} is not reachable from the start`);
  for (const n of nodes) {
    const out = edgesFrom(flow, n.id);
    if (out.length && !out.some((e) => e.to !== n.id)) bad(`node ${JSON.stringify(n.id)} can only ever loop back to itself`);
  }
  const terminals = terminalNodes(flow);
  if (!terminals.length) bad("no node ends the flow — every node has an outgoing edge, so the flow can never finish");

  return { ok: errors.length === 0, errors, warnings, nodes: nodes.length, edges: edges.length, terminals };
}

/**
 * Probe every edge with a spread of plausible outcomes and report which edges
 * a real run could actually take. An edge no outcome selects is a branch the
 * flow's author believes in and the engine will never walk — the checker
 * treats that as a failure.
 */
export function edgeCoverage(flow) {
  const probes = [];
  for (const passed of [true, false]) {
    for (const stars of [0, 1, 2, 3]) {
      for (const hazardHits of [0, 1]) {
        for (const competencies of [[], ["*"]]) {
          probes.push({
            passed, stars, hazardHits, seconds: 100, parSeconds: 200,
            interrupts: { total: 1, answered: 1, missed: 0, wrong: 0 }, competencies,
          });
        }
      }
    }
  }
  // A slow, messy run too, so a `custom: "under-par"` / `"clean"` edge and its
  // complement are both probed.
  probes.push({
    passed: true, stars: 2, hazardHits: 0, seconds: 900, parSeconds: 200,
    interrupts: { total: 2, answered: 1, missed: 1, wrong: 0 }, competencies: [],
  });
  const rows = [];
  for (const node of flow.nodes ?? []) {
    const out = edgesFrom(flow, node.id);
    const taken = out.map(() => 0);
    // "*" stands for whatever competency this node's edges ask about, so a
    // gate's held and not-held branches are both probed.
    const asked = out.map((e) => e.when?.competency).filter(Boolean);
    for (const probe of probes) {
      const cs = probe.competencies.includes("*") ? asked : [];
      for (let i = 0; i < out.length; i += 1) {
        if (edgeMatches(out[i], { ...probe, competencies: cs }, { competencies: cs })) { taken[i] += 1; break; }
      }
    }
    out.forEach((e, i) => rows.push({ from: node.id, to: e.to, when: e.when ?? null, why: describeWhen(e.when), hits: taken[i] }));
  }
  return { edges: rows, unreachable: rows.filter((r) => r.hits === 0) };
}

// ------------------------------------------------------------------ run state

/** A fresh run of `flow`, parked on its start node. */
export function startRun(flow, { at = Date.now(), source = "host", restarts = 0 } = {}) {
  return {
    protocol: FLOW_PROTOCOL,
    flowId: flow?.id ?? null,
    version: flow?.version ?? null,
    nodeId: flow?.start ?? null,
    startedAt: at, updatedAt: at,
    done: false, source, restarts,
    competencies: [],
    history: [],
  };
}

/** The node the run is parked on. */
export function position(run, flow) { return run && flow ? nodeById(flow, run.nodeId) : null; }

/** Every node the run has completed, oldest first. */
export function history(run) { return [...(run?.history ?? [])]; }

/** The last branch the run took: where from, where to, and why. */
export function branchTaken(run) {
  const last = run?.history?.at(-1);
  if (!last) return null;
  return { from: last.nodeId, to: last.next ?? null, why: last.why ?? null, outcome: last.outcome ?? null };
}

/** Why the run is standing where it is, in words. */
export function whyHere(run) {
  const b = branchTaken(run);
  if (!b) return "the flow's start node";
  return b.to ? `${b.from} -> ${b.to}: ${b.why}` : `${b.from} ended the flow: ${b.why}`;
}

/**
 * The path taken, as the rows a panel or a console renders: one per completed
 * node plus the node standing now. Plain data — no markup, no node objects.
 */
export function pathTaken(run, flow) {
  const rows = (run?.history ?? []).map((h, i) => {
    const node = nodeById(flow, h.nodeId);
    return {
      index: i, id: h.nodeId, kind: h.kind ?? node?.kind ?? null, app: h.app ?? node?.app ?? null,
      ref: h.ref ?? node?.ref ?? null, label: nodeLabel(node) || h.nodeId,
      passed: h.outcome ? !!h.outcome.passed : null, stars: h.outcome?.stars ?? null,
      why: h.why ?? null, next: h.next ?? null, current: false, at: h.at ?? null,
    };
  });
  if (run && !run.done) {
    const node = position(run, flow);
    rows.push({
      index: rows.length, id: run.nodeId, kind: node?.kind ?? null, app: node?.app ?? null,
      ref: node?.ref ?? null, label: nodeLabel(node) || run.nodeId,
      passed: null, stars: null, why: null, next: null, current: true, at: null,
    });
  }
  return rows;
}

/**
 * Complete the node the run stands on with `outcome` and move. Returns a new
 * run object and the transition, which is exactly what `smartcitix:flow.state`
 * carries.
 */
export function advance(run, flow, outcome = {}, ctx = {}) {
  if (!run || !flow || run.done) return { run, transition: null };
  const at = ctx.at ?? Date.now();
  const node = position(run, flow);
  const grants = Array.isArray(outcome.competencies) ? outcome.competencies.filter(Boolean) : [];
  const competencies = [...new Set([...(run.competencies ?? []), ...grants])];
  const step = nextNode(flow, run.nodeId, outcome, { ...ctx, competencies, run, flow });
  const entry = {
    nodeId: run.nodeId, kind: node?.kind ?? null, app: node?.app ?? null, ref: node?.ref ?? null,
    outcome: compactOutcome(outcome), at, next: step.to, why: step.why,
  };
  const next = {
    ...run,
    nodeId: step.to ?? run.nodeId,
    done: step.done,
    updatedAt: at,
    competencies,
    history: [...(run.history ?? []), entry],
  };
  return {
    run: next,
    transition: {
      flowId: flow.id, version: flow.version,
      from: entry.nodeId, to: step.to, done: step.done, why: step.why,
      node: step.node ? publicNode(step.node) : null,
      outcome: entry.outcome,
      branch: step.edge ? { from: step.edge.from, to: step.edge.to, when: step.edge.when ?? null } : null,
      competencies,
    },
  };
}

/** Back to the start, with the restart counted. */
export function restartRun(flow, run = null) {
  return startRun(flow, { restarts: (run?.restarts | 0) + 1, source: run?.source ?? "host" });
}

/** The outcome fields a run keeps: an attempt record is durable elsewhere. */
export function compactOutcome(outcome = {}) {
  const o = outcome ?? {};
  const keep = {
    passed: !!o.passed, stars: o.stars | 0, hazardHits: o.hazardHits | 0,
    seconds: o.seconds ?? null, parSeconds: o.parSeconds ?? null,
    interrupts: o.interrupts
      ? { total: o.interrupts.total | 0, answered: o.interrupts.answered | 0, missed: o.interrupts.missed | 0, wrong: o.interrupts.wrong | 0 }
      : null,
  };
  if (o.acknowledged) keep.acknowledged = true;
  if (o.gate) {
    keep.gate = true; keep.rule = o.rule ?? null; keep.competency = o.competency ?? null;
    keep.evidence = o.evidence ?? []; keep.source = o.source ?? null;
  }
  if (o.external) { keep.external = true; keep.ref = o.ref ?? null; }
  if (Array.isArray(o.competencies) && o.competencies.length) keep.competencies = [...o.competencies];
  if (typeof o.why === "string") keep.why = o.why;
  return keep;
}

/** The node as it goes over the wire: no functions, nothing app-private. */
export function publicNode(node) {
  if (!node) return null;
  return {
    id: node.id, kind: node.kind,
    app: node.app ?? (node.kind === "external" ? HOST_APP : "smartcity"),
    ref: node.ref ?? null, title: node.title ?? null, why: node.why ?? null,
    params: node.params ? { ...node.params } : null,
  };
}

/** What `smartcitix:flow.state` carries. */
export function stateMessage(flow, run) {
  const node = position(run, flow);
  return {
    protocol: FLOW_PROTOCOL,
    flowId: flow?.id ?? null, version: flow?.version ?? null, title: flow?.title ?? null,
    nodeId: run?.nodeId ?? null, node: publicNode(node), done: !!run?.done,
    why: whyHere(run), branch: branchTaken(run),
    path: pathTaken(run, flow), competencies: [...(run?.competencies ?? [])],
    restarts: run?.restarts | 0,
  };
}

// -------------------------------------------------------------- serialisation

export function flowToJSON(flow, pretty = true) { return JSON.stringify(flow, null, pretty ? 2 : 0); }
export function runToJSON(run, pretty = false) { return JSON.stringify(run, null, pretty ? 2 : 0); }

/** Parse a flow from JSON text. Never throws: `{ flow, error }`. */
export function flowFromJSON(text) {
  let parsed;
  try { parsed = JSON.parse(String(text ?? "")); }
  catch (err) { return { flow: null, error: `not valid JSON: ${err.message}` }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { flow: null, error: "not a flow object" };
  return { flow: parsed, error: null };
}

export function runFromJSON(text) {
  let parsed;
  try { parsed = JSON.parse(String(text ?? "")); }
  catch (err) { return { run: null, error: `not valid JSON: ${err.message}` }; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { run: null, error: "not a run object" };
  if (parsed.protocol != null && parsed.protocol !== FLOW_PROTOCOL) {
    return { run: null, error: `run protocol ${parsed.protocol}, this build speaks ${FLOW_PROTOCOL}` };
  }
  return { run: parsed, error: null };
}

// ---------------------------------------------------- the one store, one key

export function emptyStore() { return { protocol: FLOW_PROTOCOL, flows: [], runs: {}, current: null }; }

export function storeToJSON(store) { return JSON.stringify(store ?? emptyStore()); }

export function storeFromJSON(text) {
  let parsed;
  try { parsed = JSON.parse(String(text ?? "")); } catch (_) { return emptyStore(); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return emptyStore();
  if (parsed.protocol !== FLOW_PROTOCOL) return emptyStore();
  return {
    protocol: FLOW_PROTOCOL,
    flows: Array.isArray(parsed.flows) ? parsed.flows.filter((f) => f && typeof f === "object") : [],
    runs: parsed.runs && typeof parsed.runs === "object" ? { ...parsed.runs } : {},
    current: typeof parsed.current === "string" ? parsed.current : null,
  };
}

/** Add or replace a flow, keeping the rest of the store. */
export function upsertFlow(store, flow) {
  const base = store ?? emptyStore();
  const flows = (base.flows ?? []).filter((f) => f.id !== flow.id);
  return { ...base, flows: [...flows, flow], current: base.current ?? flow.id };
}

export function putRun(store, run) {
  const base = store ?? emptyStore();
  if (!run?.flowId) return base;
  return { ...base, runs: { ...(base.runs ?? {}), [run.flowId]: run }, current: run.flowId };
}

export function dropFlow(store, flowId) {
  const base = store ?? emptyStore();
  const runs = { ...(base.runs ?? {}) }; delete runs[flowId];
  const flows = (base.flows ?? []).filter((f) => f.id !== flowId);
  return { ...base, flows, runs, current: base.current === flowId ? (flows[0]?.id ?? null) : base.current };
}

export function flowIn(store, flowId) { return (store?.flows ?? []).find((f) => f.id === flowId) ?? null; }
export function runIn(store, flowId) { return store?.runs?.[flowId] ?? null; }

/** The flow and run the learner is on, if any. */
export function currentPair(store) {
  const id = store?.current ?? null;
  if (!id) return { flow: null, run: null };
  return { flow: flowIn(store, id), run: runIn(store, id) };
}

function defaultStorage() {
  try { return globalThis.localStorage ?? null; } catch (_) { return null; }
}

/**
 * Read the store from localStorage. Private mode, a blocked origin or a
 * headless run all return an empty store rather than throwing — the same
 * discipline records.js and identity.js use.
 */
export function readStore(storage = defaultStorage()) {
  try { return storeFromJSON(storage?.getItem(FLOW_STORE_KEY) ?? null); }
  catch (_) { return emptyStore(); }
}

export function writeStore(store, storage = defaultStorage()) {
  try { storage?.setItem(FLOW_STORE_KEY, storeToJSON(store)); return true; }
  catch (_) { return false; }
}

export function clearStore(storage = defaultStorage()) {
  try { storage?.removeItem(FLOW_STORE_KEY); return true; } catch (_) { return false; }
}

// ------------------------------------------------------- cross-app hand-off

/**
 * The deep link that carries a flow across the app switch. The three learner
 * apps are three pages on one origin, reached by the portal's own cross-app
 * links; a flow node in another app is that same link with the flow id and the
 * node id on it, and the run itself waits in localStorage under FLOW_STORE_KEY.
 */
export function appHref(node, { flowId, nodeId, from = "smartcity" } = {}) {
  const n = node ?? {};
  const app = n.app ?? "smartcity";
  if (!LEARNER_APPS.includes(app) || !n.ref) return null;
  const q = new URLSearchParams();
  if (app === "smartcity") q.set("sim", n.ref);
  else if (app === "trades") q.set("room", n.ref);
  else q.set("station", n.ref);
  if (flowId) q.set("flow", flowId);
  if (nodeId ?? n.id) q.set("node", nodeId ?? n.id);
  const prefix = from === app ? "" : `../${app}/`;
  return `${prefix}index.html?${q.toString()}`;
}

/** `?flow=&node=` off a launch URL — the other half of appHref. */
export function parseFlowLink(search = "") {
  let params;
  try { params = new URLSearchParams(search); } catch (_) { return { flowId: null, nodeId: null }; }
  const flowId = params.get("flow");
  const nodeId = params.get("node");
  return { flowId: isSlug(flowId ?? "") ? flowId : null, nodeId: isSlug(nodeId ?? "") ? nodeId : null };
}

// ----------------------------------------------------------------- the runner
//
// The part every app needs and none of them should own a copy of: hold the
// loaded flows, keep the run in the one localStorage key, move when a node
// finishes, run a gate itself, park on an external node, and hand a node in
// another app off to that app's page. It touches no DOM and imports nothing,
// so tools/check_flowhub.mjs drives the whole state machine headless.
//
// The app supplies the four things only it can do:
//   enter(node, { flow, run, href })  -> start this node here, or false
//   onState(state, transition)        -> emit smartcitix:flow.state
//   onExternal(payload)               -> emit smartcitix:flow.external and wait
//   onDone(state)                     -> emit smartcitix:flow.done

export function createFlowRunner({
  app = "smartcity",
  enter = null,
  onState = null,
  onExternal = null,
  onDone = null,
  catalog = null,
  storage = undefined,
  now = () => Date.now(),
} = {}) {
  const store = { value: readStore(storage) };
  const save = () => writeStore(store.value, storage);
  let awaitingExternal = null;

  const flowOf = (id) => flowIn(store.value, id ?? store.value.current);
  const runOf = (id) => runIn(store.value, id ?? store.value.current);

  function snapshot(flowId = null) {
    const flow = flowOf(flowId), run = runOf(flowId);
    return flow ? stateMessage(flow, run ?? startRun(flow, { at: now() })) : null;
  }

  function report(transition = null) {
    const state = snapshot();
    if (state) onState?.(state, transition);
    return state;
  }

  /**
   * Stand on `run.nodeId` and do whatever that node means here. A gate is
   * evaluated and stepped through in the same breath (it runs nothing, so
   * leaving a flow parked on one would be a stall the learner cannot clear);
   * an external node is handed back to the host; a node in another app becomes
   * a cross-app link the caller navigates to.
   */
  function settle(transition = null, guard = 0, enterNode = true) {
    const flow = flowOf(), run = runOf();
    if (!flow || !run) return { ok: false, reason: "no flow loaded" };
    if (run.done) {
      save();
      const state = report(transition);
      onDone?.(state);
      return { ok: true, done: true, state };
    }
    const node = position(run, flow);
    if (!node) { save(); return { ok: false, reason: `flow ${flow.id} has no node ${run.nodeId}` }; }
    if (node.kind === "gate") {
      if (guard > (flow.nodes?.length ?? 0) + 4) return { ok: false, reason: "gate chain does not settle" };
      // The hop that arrived at the gate is reported here, because the gate
      // itself is about to move again and the recursion will report that one:
      // every hop is reported exactly once, in order.
      if (transition) report(transition);
      const verdict = evaluateGate(node, run, flow);
      const stepped = advance(run, flow, verdict, { at: now() });
      store.value = putRun(store.value, stepped.run);
      save();
      return settle(stepped.transition, guard + 1, enterNode);
    }
    save();
    if (node.kind === "external") {
      awaitingExternal = { flowId: flow.id, nodeId: node.id };
      const state = report(transition);
      onExternal?.({ flowId: flow.id, version: flow.version, nodeId: node.id, node: publicNode(node), awaiting: "resume", state });
      return { ok: true, external: true, node: publicNode(node), state };
    }
    const state = report(transition);
    const nodeApp = node.app ?? "smartcity";
    const href = nodeApp === app ? null : appHref(node, { flowId: flow.id, nodeId: node.id, from: app });
    // `enterNode: false` moves the run and reports it — which is what the host
    // and the panel need at once — but leaves the learner where they are, so an
    // app can let them read their result before the next node opens. The panel's
    // Continue (resumeHere) is then what enters it.
    if (!enterNode) return { ok: true, node: publicNode(node), href, handled: false, pending: true, state };
    const handled = enter ? enter(node, { flow, run: runOf(), href, state }) : false;
    return { ok: true, node: publicNode(node), href, handled: handled !== false, state };
  }

  return {
    /** Every flow this browser has been handed, in the order they arrived. */
    flows() { return (store.value.flows ?? []).map((f) => ({ ...f })); },
    runs() { return { ...(store.value.runs ?? {}) }; },
    current() {
      const flow = flowOf(), run = runOf();
      return { flow, run, node: position(run, flow), awaitingExternal };
    },
    state(flowId = null) { return snapshot(flowId); },

    /** Rows for a panel: one per loaded flow with where its run stands. */
    rows() {
      return (store.value.flows ?? []).map((flow) => {
        const run = runIn(store.value, flow.id);
        const node = run ? position(run, flow) : nodeById(flow, flow.start);
        return {
          id: flow.id, title: flow.title, version: flow.version,
          current: store.value.current === flow.id,
          started: !!run, done: !!run?.done, restarts: run?.restarts | 0,
          nodeId: run?.nodeId ?? flow.start, nodeKind: node?.kind ?? null,
          nodeLabel: nodeLabel(node), nodeApp: node?.app ?? null,
          why: run ? whyHere(run) : "not started",
          competencies: [...(run?.competencies ?? [])],
          path: pathTaken(run ?? startRun(flow, { at: now() }), flow),
          nodes: (flow.nodes ?? []).length, edges: (flow.edges ?? []).length,
        };
      });
    },

    /**
     * The host (or an instructor) hands over a flow. It is validated against
     * the catalog before anything is stored: a flow naming a station that does
     * not exist is refused with the reasons, never half-loaded.
     */
    load(raw, { validateAgainst = catalog, select = true } = {}) {
      const parsed = typeof raw === "string" ? flowFromJSON(raw) : { flow: raw, error: null };
      if (parsed.error) return { ok: false, errors: [parsed.error], flow: null };
      const verdict = validateFlow(parsed.flow, validateAgainst ?? null);
      if (!verdict.ok) return { ok: false, errors: verdict.errors, warnings: verdict.warnings, flow: null };
      store.value = upsertFlow(store.value, parsed.flow);
      if (select) store.value = { ...store.value, current: parsed.flow.id };
      save();
      return { ok: true, errors: [], warnings: verdict.warnings, flow: parsed.flow, state: snapshot(parsed.flow.id) };
    },

    /** Begin (or restart) a loaded flow and stand on its first node. */
    start(flowId = null, { restart = false } = {}) {
      const flow = flowOf(flowId);
      if (!flow) return { ok: false, reason: `no flow ${flowId ?? "(none selected)"} loaded` };
      const existing = runIn(store.value, flow.id);
      const run = !existing || restart || existing.done
        ? (existing ? restartRun(flow, existing) : startRun(flow, { at: now(), source: "host" }))
        : existing;
      awaitingExternal = null;
      store.value = putRun({ ...store.value, current: flow.id }, run);
      save();
      return settle(null);
    },

    /** Stand on the current node again — the panel's Continue. */
    resumeHere() { awaitingExternal = null; return settle(null); },

    /** The node running here finished. `outcome` is an attempt record or an ack. */
    complete(outcome, { nodeId = null, enterNode = true } = {}) {
      const flow = flowOf(), run = runOf();
      if (!flow || !run || run.done) return { ok: false, reason: "no live flow run" };
      if (nodeId && nodeId !== run.nodeId) return { ok: false, reason: `flow is on ${run.nodeId}, not ${nodeId}` };
      const stepped = advance(run, flow, outcome, { at: now() });
      store.value = putRun(store.value, stepped.run);
      save();
      return settle(stepped.transition, 0, enterNode);
    },

    /**
     * The host finished the external node it was handed. Accepted only for the
     * node the flow is actually parked on, so a stray resume cannot skip a
     * station the learner still owes.
     */
    resume({ nodeId = null, outcome = null } = {}) {
      const flow = flowOf(), run = runOf();
      if (!flow || !run || run.done) return { ok: false, reason: "no live flow run" };
      const node = position(run, flow);
      if (node?.kind !== "external") return { ok: false, reason: `flow is on ${run.nodeId}, which is not an external node` };
      if (nodeId && nodeId !== run.nodeId) return { ok: false, reason: `flow is parked on ${run.nodeId}, not ${nodeId}` };
      awaitingExternal = null;
      const o = { ...outcomeFromRecord(outcome ?? {}), external: true, ref: node.ref ?? null };
      return this.complete(o, { nodeId: run.nodeId });
    },

    /** Restart the current (or named) flow from its start node. */
    restart(flowId = null) { return this.start(flowId, { restart: true }); },

    /** Select a loaded flow without starting it. */
    select(flowId) {
      if (!flowIn(store.value, flowId)) return false;
      store.value = { ...store.value, current: flowId };
      save();
      return true;
    },

    drop(flowId) { store.value = dropFlow(store.value, flowId); save(); return true; },

    /**
     * After an app switch: `?flow=&node=` said which flow and node this page
     * was opened for. The run itself came through localStorage, so all this
     * does is agree with it — and refuse politely when it cannot.
     */
    restore({ flowId = null, nodeId = null } = {}) {
      store.value = readStore(storage);
      if (!flowId) return { ok: false, reason: "no flow id on the link" };
      const flow = flowIn(store.value, flowId);
      if (!flow) return { ok: false, reason: `flow ${flowId} is not in this browser's flow store` };
      const run = runIn(store.value, flowId);
      if (!run) return { ok: false, reason: `flow ${flowId} has no run in progress` };
      if (nodeId && run.nodeId !== nodeId) return { ok: false, reason: `the link asks for ${nodeId}, the run is on ${run.nodeId}` };
      store.value = { ...store.value, current: flowId };
      save();
      const node = position(run, flow);
      return { ok: true, flow, run, node, state: snapshot(flowId) };
    },

    /** Re-read the one key — another app on this origin may have moved the run. */
    reload() { store.value = readStore(storage); return store.value; },
  };
}
