/**
 * TQ-ROBOTICS (console TQ-ROBOTICS, docs/tradequest-bridge.md "The robotics section"): the facets of the shared
 * export's `robotics` section, built from the owners' own files for SmartCiti.X TradeQuest.
 *
 * `tools/tq_bridge.mjs` reads ROBOTICS' `RB_SHARED` / `rbSharedData()` (scenarios, sites, rules, ssm) and hands the
 * modules it found to `tqrFacets()`, which adds six facets, each `ready` or `pending` with the source it looked in:
 *
 *   scenarios  ROBOTICS    the gym scenarios behind `rbEnv(scenarioId)` (read by tq_bridge itself)
 *   programme  ROBOPROG    `rp-programme.js`: tracks, the five levels, credentials, stations, standards by name, the loop
 *   agentGym   AGENTGYM    `docs/perf/agent-baselines.json`: the config, the four baselines' summary, the robot stations' rows
 *   colearn    COLEARN     `docs/evals/colearn.json`: behaviour cloning against random and the scripted expert, held-out seeds
 *   governor   VBRIDGE     the safety governor's rule list     (guarded: only when a `vb-*.js` module publishes it)
 *   jobs       VBRIDGE     the job phases, roles and deliverables (guarded the same way)
 *
 * The owner seam wins: any facet an owner already puts in `RB_SHARED` (for example `RB_SHARED.programme`) is carried
 * as-is. VBRIDGE's preferred seam is one plain `VB_SHARED = { phases, roles, jobs?, governor: { rules } }`; the named
 * exports in TQR_VB_NAMES are read when it is absent.
 *
 * Rules the export keeps (docs/virtuals-bridge.md, the crypto and safety rules): it carries ids, names, numbers and the
 * words of the rules only. A facet that holds a key-shaped, seed-phrase-shaped or wallet-address-shaped string is refused
 * (`pending`, with the reason), and so is a facet over its byte cap: summarise, do not copy a table.
 *
 * Pure apart from reading the tree. No network. Every top-level name is prefixed tqr/TQR_.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const TQR_FACETS = ["scenarios", "programme", "agentGym", "colearn", "governor", "jobs"];
/** The facets another console (VBRIDGE) owns: pending until its module publishes them. */
export const TQR_GUARDED = ["governor", "jobs"];
/** Per-facet cap on the serialised bytes (summarise rather than copy large tables). */
export const TQR_FACET_CAP = { scenarios: 16 * 1024, programme: 24 * 1024, agentGym: 6 * 1024, colearn: 8 * 1024, governor: 12 * 1024, jobs: 12 * 1024 };
/** The named exports read from a `vb-*.js` module when it has no `VB_SHARED`. */
export const TQR_VB_NAMES = ["VB_SHARED", "VB_PHASES", "VB_ROLES", "VB_JOB_PHASES", "VB_GOVERNOR_RULES", "VB_REASONS", "VB_RULES", "vbPhases", "vbGovernorRules",
  // Optional detail VBRIDGE's modules already export: the physical-path switch, the task allowlist, the rig limits, the job schema and moves.
  "VB_PHYSICAL", "VB_TASKS", "VB_RIG_LIMITS", "VB_SCHEMA", "VB_TERMINAL", "VB_MOVES", "VB_MEMO_TYPES", "VB_DEADLINE_TICKS"];

const plain = (v) => JSON.parse(JSON.stringify(v));
const call = (v, ...a) => (typeof v === "function" ? v(...a) : v);
const r3 = (n) => (typeof n === "number" ? Math.round(n * 1000) / 1000 : n);
const pending = (source, why, extra = {}) => ({ status: "pending", source, why, ...extra });

/** Strings that must never travel in the export: a 0x wallet address or 32-byte key, a PEM private key, a seed phrase. */
const TQR_KEYLIKE = [
  [/0x[0-9a-fA-F]{40}\b/, "a wallet-address-shaped string"],
  [/\b[0-9a-fA-F]{64}\b/, "a 32-byte-key-shaped string"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "a PEM private key"],
  [/\b(seed phrase|mnemonic|private key|secret key)\s*[:=]/i, "a key or seed assignment"],
  [/\b(sk|pk)_(live|test)_[A-Za-z0-9]{8,}/, "an API-key-shaped string"],
];
/** Why a value may not travel (or null). Exported so check_bridge can prove the rule fires. */
export function tqrRefuse(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  for (const [re, what] of TQR_KEYLIKE) if (re.test(text)) return `holds ${what}`;
  return null;
}

/** Cap and screen one facet's data; returns `{ data }` or `{ why }`. */
function tqrAdmit(name, data) {
  const text = JSON.stringify(data);
  const bad = tqrRefuse(text);
  if (bad) return { why: `refused: ${bad}` };
  if (text.length > TQR_FACET_CAP[name]) return { why: `over its ${TQR_FACET_CAP[name]} B facet cap (${text.length} B): export ids and names, not tables` };
  return { data };
}

const readJson = (root, rel) => { const f = join(root, rel); return existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : null; };
const importIf = async (dir, file) => { const f = join(dir, file); if (!existsSync(f)) return null; try { return await import(pathToFileURL(f).href); } catch (_) { return null; } };

// ---------------------------------------------------------------- programme (ROBOPROG)

async function tqrProgramme(shared, root) {
  const source = "WebXR/shared/rp-programme.js";
  const P = await importIf(shared, "rp-programme.js");
  if (!P) return pending(source, "rp-programme.js is not in the tree or does not import");
  const catalogFile = join(root, "WebXR/smartcity/catalog.json");
  const stationIds = existsSync(catalogFile) ? new Set(JSON.parse(readFileSync(catalogFile, "utf8")).stations.map((s) => s.id)) : null;
  const col = await importIf(shared, "col-learn.js");
  const dx = await importIf(shared, "dx-data.js");
  const credentials = {};
  const tracks = P.rpTracks().map((t) => ({
    id: t.id, title: t.title, kinds: t.kinds, scenario: t.scenario, standards: [...t.standards], rbSites: [...t.rbSites],
    ladder: P.rpLadder(t.id, { stationIds }).map((l) => {
      if (l.credential) credentials[l.credential.id] ??= { title: l.credential.title, require: l.credential.require };
      return { level: l.level, stations: [...l.stations], capstone: [...l.capstone], credential: l.credential?.id ?? null, earnable: !!l.earnable };
    }),
  }));
  const cov = P.rpCoverage({ stationIds });
  const admitted = tqrAdmit("programme", {
    name: P.RP_NAME, brand: P.RP_BRAND, note: P.RP_NO_PARTNERSHIP,
    standards: P.RP_STANDARDS.map((s) => ({ id: s.id, label: s.label })),
    levels: P.RP_LEVELS.map((l) => ({ id: l.id, title: l.title, requiredScore: l.requiredScore, dueDays: l.dueDays })),
    credentials,
    robotStations: { ...P.RP_ROBOT_STATIONS },
    tracks,
    loop: P.rpLoop({ dx, col }).map((s) => ({ id: s.id, title: s.title, module: s.module, fn: s.fn, station: s.station, live: s.live })),
    coverage: { covered: cov.covered, of: cov.of, byLevel: Object.fromEntries(Object.entries(cov.byLevel).map(([k, v]) => [k, `${v.covered}/${v.of}`])) },
    consent: "The AI-training level collects demonstrations only with opt-in consent: adults, never K-12, demo or signed-out sessions; data stays on the device; revoking deletes it.",
  });
  return admitted.data ? { status: "ready", source, data: admitted.data } : pending(source, admitted.why);
}

// ---------------------------------------------------------------- AGENTGYM baselines

function tqrAgentGym(root, robotStations) {
  const source = "docs/perf/agent-baselines.json";
  let b;
  try { b = readJson(root, source); } catch (e) { return pending(source, `unreadable: ${String(e.message).slice(0, 100)}`); }
  if (!b?.summary) return pending(source, "docs/perf/agent-baselines.json is not in the tree");
  const policies = Object.keys(b.summary);
  const rows = {}, missing = [];
  for (const id of Object.keys(robotStations ?? {})) {
    const s = b.perStation?.[id];
    if (!s) { missing.push(id); continue; }
    rows[id] = Object.fromEntries(policies.map((p) => [p, `${s[p]?.passed ?? 0}/${s[p]?.of ?? 0}`]));
  }
  const total = (p) => Object.values(b.perStation ?? {}).reduce((a, s) => a + (s[p]?.passed ?? 0), 0);
  const admitted = tqrAdmit("agentGym", {
    schema: b.schema, generator: b.generator,
    config: { stations: b.config.stations, seeds: b.config.seeds, dt: b.config.dt, maxSteps: b.config.maxSteps, hintCost: b.config.hintCost, pass: b.config.pass },
    baselines: b.baselines,
    summary: Object.fromEntries(policies.map((p) => [p, { episodes: b.summary[p].episodes, successRate: r3(b.summary[p].successRate), finishRate: r3(b.summary[p].finishRate), hazardHitsPerEpisode: r3(b.summary[p].hazardHitsPerEpisode) }])),
    passedEpisodes: Object.fromEntries(policies.map((p) => [p, total(p)])),
    robotStations: { measured: Object.keys(rows).length, of: Object.keys(robotStations ?? {}).length, passedOfEpisodes: rows, notYetBaselined: missing },
    note: "No language model is called: random, a scripted expert (privileged, an upper bound), and word-overlap retrieval. The full per-station table stays in docs/perf/agent-baselines.json.",
  });
  return admitted.data ? { status: "ready", source, data: admitted.data } : pending(source, admitted.why);
}

// ---------------------------------------------------------------- COLEARN results

function tqrColearn(root) {
  const source = "docs/evals/colearn.json";
  let c;
  try { c = readJson(root, source); } catch (e) { return pending(source, `unreadable: ${String(e.message).slice(0, 100)}`); }
  if (!c?.policies) return pending(source, "docs/evals/colearn.json is not in the tree");
  const row = (p) => ({
    scenario: p.scenario, ...(p.station ? { station: p.station } : {}), demosOffered: p.demosOffered, demosKept: p.demosKept,
    heldOut: p.expert?.n ?? null, random: r3(p.random?.success), expert: r3(p.expert?.success), bc: r3(p.bcFiltered?.success),
    ...(p.bcUnfiltered ? { bcUnfiltered: r3(p.bcUnfiltered.success) } : {}), ...(p.bcFilteredShield ? { bcShield: r3(p.bcFilteredShield.success) } : {}), gapToExpert: r3(p.gapToExpert),
  });
  const gain = c.tutor?.mixed?.gain;
  const admitted = tqrAdmit("colearn", {
    version: c.version, generator: c.generator, learners: c.learners, data: c.data,
    policies: c.policies.map(row), stations: (c.stations ?? []).map(row),
    tutor: gain ? { population: c.tutor.mixed.population, learners: c.tutor.mixed.learners, model: c.tutor.mixed.model, gain } : null,
    note: "Success is the share of held-out seeds the policy passes. Demonstrations are synthetic (a scripted expert with lapses and noise), labelled as such; no learner episode is exported.",
  });
  return admitted.data ? { status: "ready", source, data: admitted.data } : pending(source, admitted.why);
}

// ---------------------------------------------------------------- VBRIDGE (guarded)

/** The optional detail keys VBRIDGE's named exports carry (`{ key: "VB_NAME" }`), skipping any the seam object already set. */
function tqrExtras(found, names, seam) {
  return Object.fromEntries(Object.entries(names).filter(([k, n]) => found?.[n] !== undefined && !(seam && typeof seam === "object" && k in seam)).map(([k, n]) => [k, plain(call(found[n]))]));
}

/** Governor rules and job phases from a `vb-*` module's exports (`found`, as tq_bridge read them). */
function tqrVbridge(found, ownerFacets) {
  const sourceVb = "WebXR/shared/vb-*.js";
  const V = found?.VB_SHARED !== undefined ? (() => { try { return plain(call(found.VB_SHARED)); } catch (_) { return null; } })() : null;
  const out = {};
  for (const name of TQR_GUARDED) {
    if (ownerFacets?.[name] !== undefined) { out[name] = { status: "ready", source: "RB_SHARED", data: plain(ownerFacets[name]) }; continue; }
    let v;
    try {
      if (name === "governor") {
        const g = V?.governor;
        const rules = g?.rules ?? V?.governorRules ?? found?.VB_GOVERNOR_RULES ?? found?.VB_REASONS ?? found?.VB_RULES ?? found?.vbGovernorRules;
        if (rules !== undefined) v = { ...(g && typeof g === "object" && !Array.isArray(g) ? g : {}), rules: plain(call(rules)), ...tqrExtras(found, { physical: "VB_PHYSICAL", tasks: "VB_TASKS", limits: "VB_RIG_LIMITS" }, g) };
      } else {
        const j = V?.jobs ?? (V?.phases !== undefined ? { phases: V.phases, roles: V.roles } : undefined);
        const phases = j?.phases ?? found?.VB_PHASES ?? found?.VB_JOB_PHASES ?? found?.vbPhases;
        const roles = j?.roles ?? found?.VB_ROLES;
        if (phases !== undefined) v = { ...(j && typeof j === "object" && !Array.isArray(j) ? j : {}), phases: plain(call(phases)), ...(roles !== undefined ? { roles: plain(call(roles)) } : {}), ...tqrExtras(found, { schema: "VB_SCHEMA", terminal: "VB_TERMINAL", moves: "VB_MOVES", memoTypes: "VB_MEMO_TYPES", deadlineTicks: "VB_DEADLINE_TICKS" }, j) };
      }
    } catch (e) { out[name] = pending(sourceVb, `import or read failed: ${String(e.message).slice(0, 100)}`); continue; }
    if (v === undefined) { out[name] = pending(sourceVb, "VBRIDGE has not published this yet: no vb-*.js module in the tree exports it (VB_SHARED.governor.rules / VB_SHARED.phases)"); continue; }
    const admitted = tqrAdmit(name, v);
    out[name] = admitted.data ? { status: "ready", source: sourceVb, data: admitted.data } : pending(sourceVb, admitted.why);
  }
  return out;
}

/**
 * Build the five facets this module owns (the scenarios facet is `RB_SHARED` itself).
 * `owner` is the plain RB_SHARED object (or null); `found` is what tq_bridge read from rb-* and vb-* modules.
 */
export async function tqrFacets({ shared, root, owner = null, found = {} }) {
  const own = (k) => (owner?.[k] !== undefined ? { status: "ready", source: "RB_SHARED", data: plain(owner[k]) } : null);
  const programme = own("programme") ?? (await tqrProgramme(shared, root));
  const agentGym = own("agentGym") ?? tqrAgentGym(root, programme.status === "ready" ? programme.data.robotStations : null);
  const colearn = own("colearn") ?? tqrColearn(root);
  const vb = tqrVbridge(found, owner);
  return { programme, agentGym, colearn, governor: vb.governor, jobs: vb.jobs };
}
