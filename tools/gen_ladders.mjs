/**
 * Generates the twenty-level ladder for every programme in
 * WebXR/smartcity/js/curricula.js (see tools/briefs/ladder-brief.md):
 *
 *   WebXR/smartcity/js/ladders.js   the data the app, ladder.js and the track pages read
 *   docs/ladders.md                 the content gap table and one table per programme
 *
 * A LESSON is one station step run under one CONDITION (shared/ladder.js):
 * the base run, an hour of the day, a weather, hazard mode pinned to
 * assessed, an instructor-style interruption, or an assessment variant. A
 * TASK is { station, condition }, and a level's lesson total is the sum of
 * its tasks' step counts, read from the real station modules through the
 * same headless harness the checkers use — never typed by hand. A level
 * under 75 lessons is `partial` with its shortfall and is named in the gap
 * table; nothing is hidden and nothing is padded.
 *
 * How a level is built:
 *   1. The programme's stations are sorted by difficulty, easiest first:
 *      par minutes + half a point per step + one per registered hazard + two
 *      per declared interruption (DIFFICULTY below). Ties go by id.
 *   2. Each rung 1–19 has a centre in that order (rung 1 the easiest station,
 *      rung 19 the hardest) and a list of condition families (RUNGS). The
 *      stations nearest the centre are taken in turn, each under the first
 *      family (rotating, so a mixed rung mixes) that the station can honestly
 *      run (conditionValid: no weather indoors, nothing but base in Trade
 *      Skills, only interruptions the station declares) and whose pair was
 *      not in the level below. Among a family's pairs the one the ladder has
 *      used least wins, so a station with two interruptions alternates them.
 *   3. A station appears at most once per level: the same procedure twice
 *      back to back under a lighting change would count its steps twice
 *      without teaching them twice. Stations are added until the tasks hold
 *      75 lessons and the rung's minimum task count (chains two, the shift
 *      five); chains 15–18 also need a task run under a declared
 *      interruption, so CMD_INTERRUPT has something to fire.
 *   4. Level 20 is the capstone: the hardest stations, hardest first, until
 *      75 lessons (at least three), each under an assessment variant (a
 *      Trade Skills room, which cannot take one, runs its base run), with no
 *      coaching under the mastery rule.
 *   5. Entries in WebXR/smartcity/js/ladders.overrides.json win over the
 *      generated level they name (title, tasks, note); the next level is then
 *      built against the override's pairs, and totals and standards are
 *      recomputed from whatever tasks the override names.
 *   6. The gap: for a programme with partial levels, hypothetical 13-step
 *      stations (outdoor, four hazards, two interruptions, difficulty spread
 *      across the programme's range) are added one at a time and the ladder
 *      regenerated until every level reaches 75. That count is the content
 *      the programme needs; the stations themselves are the content teams'.
 *
 *     node tools/gen_ladders.mjs          (also run by tools/gen_catalog.mjs)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";
import { conditionValid, parseCondition, taskKey, CONDITION_WEATHER, LADDER_LEVELS, LESSON_BAR } from "../WebXR/shared/ladder.js";

export const STEP_BAR = LESSON_BAR; // lessons are steps under a condition; the bar is on lessons
export const LEVELS = LADDER_LEVELS;
/** The step count the gap table assumes for a station a content team will write. */
export const NEW_STATION_STEPS = 13;
export const OVERRIDES_PATH = join(WEBXR, "smartcity/js/ladders.overrides.json");
const OUT_JS = join(WEBXR, "smartcity/js/ladders.js");
const OUT_MD = join(ROOT, "docs/ladders.md");

/** The difficulty order, stated once so the checker and the doc can quote it. */
export const DIFFICULTY = "par minutes + 0.5 x steps + 1 x hazards + 2 x interruptions";
export function difficulty(m) {
  return Math.round(((m.parSeconds ?? 150) / 60 + 0.5 * m.steps + m.hazards + 2 * m.interrupts.length) * 100) / 100;
}

/**
 * What each rung is for — the brief's bands, as data. `conditions` are
 * families in the order a rung tries them: "interrupt" expands to each
 * interruption the station declares, the rest are conditions as written.
 */
export const RUNGS = [
  null,
  { n: 1, band: "orientation", title: "Orientation", conditions: ["base"], blurb: "the programme's easiest procedures as authored, coached, hint ring on" },
  { n: 2, band: "orientation", title: "Orientation by daylight", conditions: ["time:day"], blurb: "the same first procedures with the plaza in daylight: different shadows, different glare" },
  { n: 3, band: "procedures", title: "Single procedures", conditions: ["base"], blurb: "single procedures one step harder, as authored" },
  { n: 4, band: "procedures", title: "Single procedures at dusk", conditions: ["time:dusk"], blurb: "single procedures in the sodium hour, when colour cues fail first" },
  { n: 5, band: "procedures", title: "Day and night on the clock", conditions: ["time:day", "base"], blurb: "procedures judged against par, alternating daylight and the night plaza" },
  { n: 6, band: "weather", title: "Rain", conditions: ["weather:rain", "time:dusk"], blurb: "outdoor procedures in steady rain; an indoor station runs at dusk" },
  { n: 7, band: "weather", title: "High wind", conditions: ["weather:wind", "time:day"], blurb: "outdoor procedures in sustained wind; an indoor station runs by daylight" },
  { n: 8, band: "weather", title: "Fog", conditions: ["weather:fog", "time:dusk"], blurb: "outdoor procedures in thick fog, radio over hand signals; an indoor station runs at dusk" },
  { n: 9, band: "weather", title: "Storm", conditions: ["weather:storm", "time:day"], blurb: "the condition most procedures say to stop for; the call to go on is part of the task" },
  { n: 10, band: "weather", title: "Weather and hour mixed", conditions: ["weather:smoke", "weather:rain", "weather:overcast", "time:dusk"], blurb: "smoke, rain and flat overcast mixed with dusk, one station after another" },
  { n: 11, band: "hazard", title: "Hazard mode", conditions: ["hazard"], blurb: "hazard mode pinned to assessed: every unsafe action scores and no instructor toggle can coach it away" },
  { n: 12, band: "interrupted", title: "Interrupted", conditions: ["interrupt"], blurb: "each station with one of its declared interruptions fired off its authored step, the way an instructor injects it" },
  { n: 13, band: "hazard", title: "Hazard mode, harder stations", conditions: ["hazard"], blurb: "assessed hazard mode on the programme's harder procedures" },
  { n: 14, band: "interrupted", title: "Interrupted, harder stations", conditions: ["interrupt"], blurb: "injected interruptions on the harder procedures" },
  { n: 15, band: "chain", title: "Station chain in weather", conditions: ["interrupt", "weather:rain", "weather:wind", "time:day"], blurb: "stations back to back, an injected interruption and weather in the chain" },
  { n: 16, band: "chain", title: "Station chain at dusk", conditions: ["interrupt", "time:dusk", "hazard"], blurb: "a chain into the evening with an interruption and hazard mode on" },
  { n: 17, band: "chain", title: "Station chain, instructor on", conditions: ["interrupt", "hazard", "weather:fog"], blurb: "a harder chain an instructor drives with injected interruptions" },
  { n: 18, band: "chain", title: "Station chain in a storm", conditions: ["interrupt", "weather:storm", "time:day", "hazard"], blurb: "the hardest chain before the shift, with the stop-work call in it" },
  { n: 19, band: "shift", title: "Full shift", conditions: ["base", "time:day", "weather:rain", "hazard", "interrupt", "time:dusk", "weather:wind"], blurb: "a shift's worth of the programme's hardest jobs under the conditions a shift brings" },
  { n: 20, band: "capstone", title: "Capstone", conditions: ["variant:assessment", "variant:pressure"], blurb: "the hardest stations as assessment variants, under the mastery rule with no coaching" },
];
const MIN_TASKS = { 15: 2, 16: 2, 17: 2, 18: 2, 19: 5, 20: 3 };
const CHAIN = (n) => n >= 15 && n <= 18;

// ------------------------------------------------------------------ standards

const REGISTRY = JSON.parse(readFileSync(join(ROOT, "tools/standards.json"), "utf8"));
const BY_ID = new Map(REGISTRY.standards.map((e) => [e.id, e]));
const BY_CITE = new Map();
for (const e of REGISTRY.standards) for (const c of e.cites) if (!BY_CITE.has(c)) BY_CITE.set(c, e.id);
const CITE_RE = new RegExp(
  `(?<![A-Za-z0-9])(?:${[...BY_CITE.keys()].sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?![A-Za-z0-9])(?!\\.\\d)`, "g");

function sourceOf(app, id) {
  const file = app === "trades" ? join(WEBXR, "trades/js/rooms", `${id}.js`) : join(WEBXR, "smartcity/js/sims", `${id}.js`);
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}
/** Registry ids the station's own source cites that govern its category. */
function registryHits(app, id, category) {
  const out = new Set();
  for (const m of sourceOf(app, id).matchAll(CITE_RE)) {
    const e = BY_ID.get(BY_CITE.get(m[0]));
    if (e && (!category || e.scope.includes(category))) out.add(e.id);
  }
  return [...out].sort();
}

// -------------------------------------------------------------------- metrics

/** Every station's real numbers, keyed "app:id". */
const INDOOR_DISTRICTS = new Set(["gym-court"]);

export async function stationMetrics() {
  const city = await loadSmartCity();
  const trades = await loadTrades();
  const out = new Map();
  const add = (app, r) => {
    const category = r.category ?? (app === "trades" ? "Trade Skills Simulator" : null);
    const m = {
      app, id: r.id, name: r.name ?? r.title ?? r.id,
      steps: r.steps.length,
      hazards: Object.keys(r.hazards ?? {}).length,
      interrupts: (r.interrupts ?? []).map((i) => ({ id: i.id, kind: i.kind ?? "Interruption" })),
      parSeconds: r.parSeconds ?? 150,
      // An interior kind, or a district that is a building in its own right (the
      // gym-court is an indoor gym): either way no weather is honest here.
      indoor: r.indoor ?? (INDOOR_DISTRICTS.has(r.district) ? `district:${r.district}` : null),
      category,
      standards: registryHits(app, r.id, category),
    };
    m.difficulty = difficulty(m);
    out.set(`${app}:${r.id}`, m);
  };
  for (const r of city.ROOMS) add("smartcity", r);
  for (const r of trades.ROOMS) add("trades", r);
  return out;
}

// --------------------------------------------------------------------- levels

/** A task as the ladder stores it: the pair, and the step count its lessons come from. */
function taskOf(m, condition) {
  return { station: `${m.app}:${m.id}`, app: m.app, id: m.id, condition, steps: m.steps };
}
/** The ladder's station table: every station of the programme and any an override names, with the numbers the app and the track page show. */
function stationTable(prog, levels, metrics) {
  const keys = new Set(prog.stations.map((s) => `${s.app}:${s.id}`));
  for (const lv of levels) for (const t of lv.tasks) keys.add(`${t.app}:${t.id}`);
  const out = {};
  for (const k of keys) {
    const m = metrics.get(k);
    out[k] = { name: m.name, steps: m.steps, parSeconds: m.parSeconds, hazards: m.hazards, indoor: m.indoor, interrupts: m.interrupts, category: m.category, standards: m.standards, difficulty: m.difficulty };
  }
  return out;
}

/** The concrete conditions a family offers a station, valid ones only. */
export function expandFamily(family, m) {
  const list = family === "interrupt" ? m.interrupts.map((i) => `interrupt:${i.id}`) : [family];
  return list.filter((c) => conditionValid(c, m));
}

/** Totals, standards and the partial flag, from whatever tasks a level names. */
export function finishLevel(level, metrics) {
  const ms = level.tasks.map((t) => metrics.get(`${t.app}:${t.id}`));
  level.tasks = level.tasks.map((t, i) => taskOf(ms[i], t.condition ?? "base"));
  level.lessons = ms.reduce((a, m) => a + m.steps, 0);
  level.steps = level.lessons;
  level.parSeconds = ms.reduce((a, m) => a + m.parSeconds, 0);
  level.standards = [...new Set(ms.flatMap((m) => m.standards))].sort();
  // The brief allows an apprenticeship-hour equivalence only where the
  // registry entry states one; none does today, so this stays null.
  const hours = level.standards.map((id) => BY_ID.get(id)?.hours).filter((h) => typeof h === "number");
  level.hours = hours.length ? hours.reduce((a, b) => a + b, 0) : null;
  level.partial = level.lessons < STEP_BAR;
  level.shortfall = level.partial ? STEP_BAR - level.lessons : 0;
  // A chain, the shift and the capstone name every interruption their tasks
  // declare, so CMD_INTERRUPT task/id can queue one for a task still to come.
  level.interruptions = level.n >= 15
    ? ms.flatMap((m) => m.interrupts.map((i) => ({ task: m.id, id: i.id })))
    : [];
  return level;
}

function sortedStations(stationRefs, metrics) {
  return stationRefs
    .map((s) => metrics.get(`${s.app}:${s.id}`))
    .filter((m, i, arr) => m && arr.findIndex((x) => x.app === m.app && x.id === m.id) === i)
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
}

/** One generated rung 1–19, built against the pairs of the level below. */
function buildRung(L, sorted, prevPairs, usage) {
  const r = RUNGS[L];
  const n = sorted.length;
  const center = n > 1 ? ((L - 1) * (n - 1)) / 18 : 0;
  const order = sorted.map((m, i) => i).sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
  const chosen = []; // { i, condition }
  const lessons = () => chosen.reduce((a, c) => a + sorted[c.i].steps, 0);
  const need = MIN_TASKS[L] ?? 1;
  const pick = (i, families) => {
    const m = sorted[i];
    for (let j = 0; j < families.length; j++) {
      const fam = families[(chosen.length + j) % families.length];
      const opts = expandFamily(fam, m).filter((c) => !prevPairs.has(taskKey({ app: m.app, id: m.id, condition: c })))
        .sort((a, b) => (usage.get(`${m.app}:${m.id}@${a}`) ?? 0) - (usage.get(`${m.app}:${m.id}@${b}`) ?? 0));
      if (opts.length) return opts[0];
    }
    return null;
  };
  const hasInterruptTask = () => chosen.some((c) => c.condition.startsWith("interrupt:"));
  for (const i of order) {
    if (lessons() >= STEP_BAR && chosen.length >= need && (!CHAIN(L) || hasInterruptTask())) break;
    // A chain's first task is the interruption when the station can take one.
    const cond = pick(i, r.conditions);
    if (cond) chosen.push({ i, condition: cond });
  }
  // A chain whose stations all ended up under other conditions takes one more
  // task under a declared interruption, when the programme has one to give.
  if (CHAIN(L) && !hasInterruptTask()) {
    const used = new Set(chosen.map((c) => c.i));
    for (const i of order) {
      if (used.has(i)) continue;
      const cond = pick(i, ["interrupt"]);
      if (cond) { chosen.push({ i, condition: cond }); break; }
    }
  }
  return {
    n: L, title: r.title, band: r.band, coaching: true,
    tasks: chosen.sort((a, b) => a.i - b.i).map((c) => ({ app: sorted[c.i].app, id: sorted[c.i].id, condition: c.condition })),
    source: "generated",
  };
}

/** Level 20: the hardest stations, hardest first, as assessment variants, until the bar. */
function buildCapstone(sorted, prevPairs, usage) {
  const r = RUNGS[20];
  const chosen = [];
  let lessons = 0;
  for (const m of [...sorted].reverse()) {
    if (lessons >= STEP_BAR && chosen.length >= MIN_TASKS[20]) break;
    const families = m.app === "trades" ? ["base"] : r.conditions;
    const cond = families.flatMap((f) => expandFamily(f, m))
      .filter((c) => !prevPairs.has(taskKey({ app: m.app, id: m.id, condition: c })))
      .sort((a, b) => (usage.get(`${m.app}:${m.id}@${a}`) ?? 0) - (usage.get(`${m.app}:${m.id}@${b}`) ?? 0))[0];
    if (!cond) continue;
    chosen.push({ m, condition: cond });
    lessons += m.steps;
  }
  chosen.reverse();
  return {
    n: 20, title: r.title, band: r.band, coaching: false,
    tasks: chosen.map((c) => ({ app: c.m.app, id: c.m.id, condition: c.condition })),
    source: "generated",
  };
}

/**
 * All twenty levels of one programme. `overridesFor` maps level number to an
 * override entry; each level is built against the pairs of the level below as
 * it finally stands, override included. `metrics` may carry hypothetical
 * stations (the gap simulation) as long as `stationRefs` names them.
 */
export function generateLevels(prog, metrics, overridesFor = {}, stationRefs = prog.stations) {
  const sorted = sortedStations(stationRefs, metrics);
  const usage = new Map();
  const levels = [];
  let prevPairs = new Set();
  for (let L = 1; L <= LEVELS; L++) {
    let level = L < LEVELS ? buildRung(L, sorted, prevPairs, usage) : buildCapstone(sorted, prevPairs, usage);
    level = applyOverride(level, overridesFor[String(L)], prog);
    for (const t of level.tasks) { const k = taskKey(t); usage.set(k, (usage.get(k) ?? 0) + 1); }
    prevPairs = new Set(level.tasks.map(taskKey));
    levels.push(level);
  }
  return levels;
}

// ------------------------------------------------------------------ overrides

export function readOverrides() {
  if (!existsSync(OVERRIDES_PATH)) return { programmes: {} };
  return JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"));
}

/**
 * A task named in an override: "app:id", a bare id looked up in the
 * programme, either with "@condition" after it. No condition means `base`.
 */
export function resolveTaskRef(ref, prog) {
  if (typeof ref !== "string") return null;
  const [station, condition = "base"] = ref.split("@");
  const [a, b] = station.includes(":") ? station.split(":") : [null, station];
  const hit = prog.stations.find((s) => s.id === b && (!a || s.app === a));
  const base = hit ? { app: hit.app, id: hit.id } : a ? { app: a, id: b } : null;
  return base ? { ...base, condition } : null;
}

/** Why an override cannot be applied, or [] when it can. Shared with the checker. */
export function overrideProblems(overrides, metrics) {
  const out = [];
  const progs = overrides?.programmes ?? {};
  for (const [pid, levels] of Object.entries(progs)) {
    const prog = CURRICULA.find((c) => c.id === pid);
    if (!prog) { out.push(`${pid}: no such programme`); continue; }
    for (const [key, o] of Object.entries(levels ?? {})) {
      const n = Number(key);
      if (!Number.isInteger(n) || n < 1 || n > LEVELS) { out.push(`${pid}:${key}: level must be 1–${LEVELS}`); continue; }
      for (const k of Object.keys(o ?? {})) if (!["title", "tasks", "note"].includes(k)) out.push(`${pid}:${n}: unknown field "${k}"`);
      if (o.title != null && (typeof o.title !== "string" || !o.title.trim())) out.push(`${pid}:${n}: title must be text`);
      if (o.tasks != null) {
        if (!Array.isArray(o.tasks) || !o.tasks.length) out.push(`${pid}:${n}: tasks must be a non-empty list`);
        else {
          const seen = new Set();
          for (const ref of o.tasks) {
            const t = resolveTaskRef(ref, prog);
            const m = t && metrics.get(`${t.app}:${t.id}`);
            if (!m) { out.push(`${pid}:${n}: task "${ref}" is not a station`); continue; }
            if (!parseCondition(t.condition)) out.push(`${pid}:${n}: task "${ref}" names an unknown condition`);
            else if (!conditionValid(t.condition, m)) out.push(`${pid}:${n}: ${t.id} cannot run under ${t.condition}`);
            if (seen.has(taskKey(t))) out.push(`${pid}:${n}: task "${ref}" is named twice`);
            seen.add(taskKey(t));
          }
        }
        if (n === LEVELS && Array.isArray(o.tasks) && o.tasks.length < 3 && prog.stations.length >= 3) out.push(`${pid}:${LEVELS}: a capstone names at least 3 tasks`);
      }
    }
  }
  return out;
}

function applyOverride(level, o, prog) {
  if (!o) return level;
  const next = { ...level, source: "override" };
  if (o.title) next.title = o.title;
  if (o.tasks) next.tasks = o.tasks.map((ref) => resolveTaskRef(ref, prog));
  if (o.note) next.note = o.note;
  return next;
}

// ------------------------------------------------------------------------ gap

/**
 * How many more stations (at NEW_STATION_STEPS steps, outdoor, four hazards,
 * two interruptions) the programme needs before every generated level
 * reaches the bar. Overrides are left out: a hand-tuned level is fixed by
 * editing it, not by adding content. Returns null past `cap`.
 */
export function stationsNeeded(prog, metrics, cap = 60) {
  const real = sortedStations(prog.stations, metrics);
  const lo = real.length ? real[0].difficulty : 10;
  const hi = real.length ? real[real.length - 1].difficulty : 20;
  const fits = (levels) => levels.every((lv) => lv.tasks.reduce((a, t) => a + metrics2.get(`${t.app}:${t.id}`).steps, 0) >= STEP_BAR);
  let metrics2 = metrics;
  if (fits(generateLevels(prog, metrics))) return 0;
  for (let k = 1; k <= cap; k++) {
    metrics2 = new Map(metrics);
    const refs = [...prog.stations];
    for (let j = 0; j < k; j++) {
      const id = `new-station-${j + 1}`;
      const m = {
        app: "smartcity", id, name: id, steps: NEW_STATION_STEPS, hazards: 4, parSeconds: 150, indoor: null,
        interrupts: [{ id: "first", kind: "Interruption" }, { id: "second", kind: "Interruption" }], category: null, standards: [],
      };
      m.difficulty = Math.round((lo + ((hi - lo) * (j + 0.5)) / k) * 100) / 100;
      metrics2.set(`smartcity:${id}`, m);
      refs.push({ app: "smartcity", id });
    }
    if (fits(generateLevels(prog, metrics2, {}, refs))) return k;
  }
  return null;
}

// -------------------------------------------------------------------- build

export async function buildLadders(metrics = null) {
  metrics = metrics ?? await stationMetrics();
  const overrides = readOverrides();
  const problems = overrideProblems(overrides, metrics);
  if (problems.length) throw new Error(`ladders.overrides.json: ${problems.join("; ")}`);
  const missing = CURRICULA.flatMap((p) => p.stations.filter((s) => !metrics.has(`${s.app}:${s.id}`)).map((s) => `${p.id}: ${s.app}:${s.id}`));
  if (missing.length) throw new Error(`stations not found in the headless roster: ${missing.join(", ")}`);
  const ladders = CURRICULA.map((prog) => {
    const levels = generateLevels(prog, metrics, overrides.programmes?.[prog.id] ?? {})
      .map((l) => finishLevel({ programme: prog.id, ...l }, metrics));
    const full = levels.filter((l) => !l.partial).length;
    const gap = {
      full, partial: LEVELS - full,
      shortfall: levels.reduce((a, l) => a + l.shortfall, 0),
      stationsNeeded: full === LEVELS ? 0 : stationsNeeded(prog, metrics),
      overridePartial: levels.filter((l) => l.partial && l.source === "override").map((l) => l.n),
    };
    return {
      programme: prog.id, name: prog.name, accent: prog.accent,
      lessons: levels.reduce((a, l) => a + l.lessons, 0),
      gap, stations: stationTable(prog, levels, metrics), levels,
    };
  });
  return { ladders, metrics };
}

// ------------------------------------------------------------------- writers

function standardsUsed(ladders) {
  const ids = [...new Set(ladders.flatMap((l) => [...l.levels.flatMap((lv) => lv.standards), ...Object.values(l.stations).flatMap((s) => s.standards)]))].sort();
  return Object.fromEntries(ids.map((id) => { const e = BY_ID.get(id); return [id, { body: e.body, title: e.title, source: e.source }]; }));
}

/** What ladders.js stores of a level: everything that is not derived from its tasks. */
function compactLevel(lv) {
  const out = { n: lv.n, title: lv.title, band: lv.band, coaching: lv.coaching, tasks: lv.tasks.map(taskKey), source: lv.source };
  if (lv.note) out.note = lv.note;
  if (lv.hours != null) out.hours = lv.hours;
  return out;
}

function writeJs(ladders) {
  const head = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_ladders.mjs\` (or
 * \`node tools/gen_catalog.mjs\`, which runs it). Hand-tuned levels belong in
 * ladders.overrides.json beside this file; they win over the generated ones.
 *
 * Twenty levels per programme in curricula.js (tools/briefs/ladder-brief.md):
 * 1–5 orientation and single procedures (base, then daylight and dusk), 6–10
 * under weather and the hour, 11–14 under hazard mode and injected
 * interruptions, 15–18 station chains with a declared interruption, 19 a full
 * shift, 20 a capstone of assessment variants under the mastery rule with no
 * coaching. A task is { station, condition } (conditions: shared/ladder.js);
 * a level's \`lessons\` are its tasks' steps, read from the real station
 * modules. \`standards\` is the union of the tasks' in-scope registry hits in
 * tools/standards.json. A level under ${STEP_BAR} lessons is \`partial\` with its
 * \`shortfall\`; each ladder's \`gap\` says how many ${NEW_STATION_STEPS}-step stations would
 * fill the rest. Gated by tools/check_ladders.mjs; who passes is decided in
 * shared/ladder.js.
 */
export const LADDER_STEP_BAR = ${STEP_BAR};
export const LADDER_LEVEL_COUNT = ${LEVELS};
export const LADDER_NEW_STATION_STEPS = ${NEW_STATION_STEPS};
export const LADDER_DIFFICULTY = ${JSON.stringify(DIFFICULTY)};
export const LADDER_RUNGS = ${JSON.stringify(RUNGS.slice(1).map((r) => ({ n: r.n, band: r.band, title: r.title, conditions: r.conditions, blurb: r.blurb })))};
// Stored compact — a task as its "app:id@condition" pair — and expanded below
// into the full level the app reads. Every derived number (lessons, par,
// standards, the partial flag, a chain's interruptions) is recomputed here
// from the station table, the same arithmetic gen_ladders.mjs finishLevel()
// does; tools/check_ladders.mjs compares the two field for field.
const STORED = [
${ladders.map((l) => `  { programme: ${JSON.stringify(l.programme)}, name: ${JSON.stringify(l.name)}, accent: ${JSON.stringify(l.accent)}, lessons: ${l.lessons}, gap: ${JSON.stringify(l.gap)},\n    stations: ${JSON.stringify(l.stations)},\n    levels: [\n${
    l.levels.map((lv) => `    ${JSON.stringify(compactLevel(lv))},`).join("\n")}\n  ] },`).join("\n")}
];
function expandLevel(programme, stations, lv) {
  const tasks = lv.tasks.map((key) => {
    const at = key.indexOf("@");
    const station = key.slice(0, at);
    const [app, id] = station.split(":");
    return { station, app, id, condition: key.slice(at + 1), steps: stations[station].steps };
  });
  const ms = tasks.map((t) => stations[t.station]);
  const lessons = ms.reduce((a, m) => a + m.steps, 0);
  const out = { programme, n: lv.n, title: lv.title, band: lv.band, coaching: lv.coaching, tasks, source: lv.source };
  if (lv.note) out.note = lv.note;
  return Object.assign(out, {
    lessons, steps: lessons,
    parSeconds: ms.reduce((a, m) => a + m.parSeconds, 0),
    standards: [...new Set(ms.flatMap((m) => m.standards))].sort(),
    hours: lv.hours ?? null,
    partial: lessons < LADDER_STEP_BAR,
    shortfall: lessons < LADDER_STEP_BAR ? LADDER_STEP_BAR - lessons : 0,
    interruptions: lv.n >= 15 ? tasks.flatMap((t, i) => ms[i].interrupts.map((x) => ({ task: t.id, id: x.id }))) : [],
  });
}
export const LADDERS = STORED.map((l) => ({ ...l, levels: l.levels.map((lv) => expandLevel(l.programme, l.stations, lv)) }));
export const LADDER_BY_PROGRAMME = Object.fromEntries(LADDERS.map((l) => [l.programme, l]));
/** Body and title of every registry entry a level or station names, so a badge can say what it evidences. */
export const LADDER_STANDARDS = ${JSON.stringify(standardsUsed(ladders))};
`;
  writeFileSync(OUT_JS, head);
}

const condCell = (c) => (c === "base" ? "base" : c);

function writeMd(ladders) {
  const all = ladders.flatMap((l) => l.levels);
  const partial = all.filter((l) => l.partial);
  const needed = ladders.reduce((a, l) => a + (l.gap.stationsNeeded ?? 0), 0);
  const md = [];
  md.push("# Ladders — twenty levels per programme, 75 lessons a level");
  md.push("");
  md.push("Generated by `tools/gen_ladders.mjs` from `WebXR/smartcity/js/curricula.js` and the real station modules; never edit by hand. Hand-tuned levels live in `WebXR/smartcity/js/ladders.overrides.json`. The rules are in `tools/briefs/ladder-brief.md`; the gate is `tools/check_ladders.mjs`; who passes is decided in `WebXR/shared/ladder.js` by the mastery rule in `WebXR/shared/competency.js`. Every programme also has a track page (`WebXR/dist/tracks/<programme>.html`, generated by `tools/gen_tracks.mjs`).");
  md.push("");
  md.push(`**${ladders.length} programmes · ${all.length} levels · ${all.length - partial.length} at or over ${STEP_BAR} lessons · ${partial.length} partial · ${needed} more ${NEW_STATION_STEPS}-step stations would fill every partial level.**`);
  md.push("");
  md.push("## What a lesson is");
  md.push("");
  md.push(`A **lesson** is one station step run under one **condition**. A **task** is \`{ station, condition }\`, and a level's lesson total is the sum of its tasks' step counts, read headless from the station modules. The conditions, each launched through a query parameter SmartCiti.X reads:`);
  md.push("");
  md.push("| Condition | Query | What changes |");
  md.push("|---|---|---|");
  md.push("| `base` | — | the station as authored (the plaza at night, the station's own weather) |");
  md.push("| `time:day`, `time:dusk` | `?time=` | the hour: `WebXR/smartcity/js/stage.js` relights sky, fog, key light and masts, and an interior's rooflights |");
  md.push(`| \`weather:<kind>\` | \`?weather=\` | a \`shared/weather.js\` kind (${CONDITION_WEATHER.join(", ")}): particles, fog, light, and the operational note the learner reads; outdoor stations only |`);
  md.push("| `hazard` | `?hazard=assess` | hazard mode pinned to assessed: every unsafe action scores, and an instructor's coaching toggle does not apply to this run |");
  md.push("| `interrupt:<id>` | `?interrupt=<id>` | one of the station's declared interruptions armed off its authored step, the way `CMD_INTERRUPT` injects one |");
  md.push("| `variant:assessment`, `variant:pressure` | `?variant=&seed=` | `shared/variants.js` `makeVariant`: no hints, a tighter clock, alarms rehung, order-free sequences shuffled; the procedure and its answers unchanged |");
  md.push("");
  md.push("Night is the stage's default hour, so it is the base run rather than a condition. `stage.js` has no dawn and `weather.js` has no heat, so neither is offered; adding either is rendering work, not ladder work. Trade Skills reads none of these parameters, so a Trade Skills room is always a `base` task.");
  md.push("");
  md.push(`Rules every level keeps: no pair twice in a level, no pair shared with the level above or below, every condition one the station can honestly run (no weather indoors, no interruption the station does not declare). The generator is stricter: a station appears at most once per level, because the same procedure twice back to back under a lighting change would count its steps twice without teaching them twice.`);
  md.push("");
  md.push("## How a level is built");
  md.push("");
  md.push("Stations are sorted by difficulty (" + DIFFICULTY + "). Each rung 1–19 has a centre in that order and a list of condition families; the stations nearest the centre are taken in turn, each under the first family it can run whose pair was not in the level below, until the tasks hold " + STEP_BAR + " lessons.");
  md.push("");
  md.push("| Levels | Band | Conditions |");
  md.push("|---|---|---|");
  for (const r of RUNGS.slice(1)) md.push(`| ${r.n} | ${r.title} | ${r.conditions.map((c) => `\`${c}\``).join(", ")} — ${r.blurb} |`);
  md.push("");
  md.push("Chains 15–18 need two tasks and one run under a declared interruption; the shift (19) needs five tasks; the capstone (20) is the hardest stations, hardest first, until " + STEP_BAR + " lessons (at least three), as assessment variants with no coaching. A level passes when one run of it has a mastery run on every task, each under its own condition; level N opens when level N−1 has passed, and level 1 is always open.");
  md.push("");
  md.push("Standards evidenced are the union of the tasks' registry hits: entries in `tools/standards.json` that a task's own source cites and that govern its category. No registry entry states an apprenticeship-hour equivalence, so no level claims one.");
  md.push("");
  md.push("In the app each programme card in *Training programmes* has a **Ladder** view (twenty rungs, locked / open / passed, lessons per level, a condition chip per task, the partial flag). **Start level** runs the chain: each task opens its station with its condition's query parameters, one shared score, a level results card with a row per task, the level badge on a pass. `?programme=<id>&level=<n>` opens that ladder at that rung. An instructor can assign a level with `CMD_ASSIGN programme:level`, and on a level 15+ chain `CMD_INTERRUPT task/id` queues an interruption for a task still to come. Screenshots: [`docs/screenshots/ladders/`](screenshots/ladders/), [`docs/screenshots/tracks/`](screenshots/tracks/).");
  md.push("");
  md.push("## Content gap");
  md.push("");
  md.push(`How many of each programme's ${LEVELS} levels reach ${STEP_BAR} lessons today, and how many more stations of ${NEW_STATION_STEPS} steps it needs before every level does. The count is simulated, not divided: hypothetical ${NEW_STATION_STEPS}-step stations (outdoor, four hazards, two interruptions, difficulty spread across the programme's range) are added one at a time and the ladder regenerated until no level is partial. Writing them is the content teams' work under \`tools/briefs/station-brief.md\`; nothing here invents one.`);
  md.push("");
  md.push("| Programme | Stations | Levels at 75 | Partial | Lessons short (sum) | More stations needed |");
  md.push("|---|---|---|---|---|---|");
  for (const l of ladders) {
    const g = l.gap;
    const need = g.stationsNeeded == null ? "more than 60" : String(g.stationsNeeded);
    const ov = g.overridePartial.length ? ` (+ override level${g.overridePartial.length === 1 ? "" : "s"} ${g.overridePartial.join(", ")} to edit)` : "";
    md.push(`| \`${l.programme}\` | ${new Set(Object.keys(l.stations)).size} | ${g.full} / ${LEVELS} | ${g.partial} | ${g.shortfall} | ${need}${ov} |`);
  }
  const tot = ladders.reduce((a, l) => ({ full: a.full + l.gap.full, partial: a.partial + l.gap.partial, short: a.short + l.gap.shortfall }), { full: 0, partial: 0, short: 0 });
  md.push(`| **Total** | | **${tot.full} / ${all.length}** | **${tot.partial}** | **${tot.short}** | **${needed}** |`);
  md.push("");
  for (const l of ladders) {
    md.push(`## ${l.name}`);
    md.push("");
    md.push(`\`${l.programme}\` · ${l.lessons} lessons across ${LEVELS} levels · ${l.gap.full} of ${LEVELS} at ${STEP_BAR}`);
    md.push("");
    md.push("| Level | Title | Tasks (condition, steps) | Lessons | Standards | Partial |");
    md.push("|---|---|---|---|---|---|");
    for (const lv of l.levels) {
      const tasks = lv.tasks.map((t) => `${t.app === "trades" ? "trades:" : ""}${t.id} @${condCell(t.condition)} (${t.steps})`).join(", ");
      const flag = lv.partial ? `**partial** — ${lv.shortfall} short` : "no";
      const title = `${lv.title}${lv.coaching ? "" : " (no coaching)"}${lv.source === "override" ? " ✎" : ""}`;
      md.push(`| ${lv.n} | ${title} | ${tasks} | ${lv.lessons} | ${lv.standards.length} | ${flag} |`);
    }
    md.push("");
  }
  md.push("✎ marks a level hand-tuned in `ladders.overrides.json`. The standards column counts registry entries; the ids are in `ladders.js` and on each track page.");
  md.push("");
  writeFileSync(OUT_MD, md.join("\n"));
  return partial.length;
}

export async function writeLadders() {
  const { ladders } = await buildLadders();
  writeJs(ladders);
  const partial = writeMd(ladders);
  const total = ladders.reduce((a, l) => a + l.levels.length, 0);
  const needed = ladders.reduce((a, l) => a + (l.gap.stationsNeeded ?? 0), 0);
  console.log(`Wrote WebXR/smartcity/js/ladders.js and docs/ladders.md (${ladders.length} programmes, ${total} levels, ${partial} partial, ${needed} stations to write)`);
  return { ladders, partial };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await writeLadders();
