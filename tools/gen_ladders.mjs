/**
 * Generates the ten-level ladder for every programme in
 * WebXR/smartcity/js/curricula.js (see tools/briefs/ladder-brief.md):
 *
 *   WebXR/smartcity/js/ladders.js   the data the app and ladder.js read
 *   docs/ladders.md                 one table per programme, partial levels named
 *
 * Every number here is read from the real station modules through the same
 * headless harness the checkers use — steps, hazards, interruptions and par —
 * so a level's step total is never typed by hand. The standards a level
 * evidences are the registry entries (tools/standards.json) its stations' own
 * source cites and that govern the station's category: the same match
 * tools/check_standards.mjs gates on.
 *
 * How a level is built:
 *   1. The programme's stations are sorted by difficulty, easiest first:
 *      par minutes + half a point per step + one per registered hazard + two
 *      per declared interruption (DIFFICULTY below). Ties go by id.
 *   2. Each station gets a home band 1–9 by its place in that order (the
 *      easiest ninth is band 1, the hardest ninth band 9). Levels 1–3 are
 *      orientation and single procedures, 4–6 the same under interruptions
 *      and weather, 7–8 multi-station chains with an instructor-injectable
 *      interruption, 9 a full shift.
 *   3. Level N starts from its band's stations (or, in a programme with fewer
 *      than nine stations, the one station nearest that band) and chains the
 *      next-nearest stations by difficulty — the easier one first on a tie —
 *      until the tasks total at least 50 steps. Levels 7–8 need two tasks,
 *      level 9 five (a shift is several jobs), and 7+ must carry at least one
 *      declared interruption so CMD_INTERRUPT has something to fire.
 *   4. Level 10 is the capstone: the programme's hardest three stations, or
 *      four when three do not reach 50 steps, run with no coaching under the
 *      mastery rule.
 *   5. A level that still has fewer than 50 steps — the programme has run out
 *      of content — is `partial: true` with its shortfall, and docs/ladders.md
 *      lists it as needing content. Nothing is hidden.
 *   6. Entries in WebXR/smartcity/js/ladders.overrides.json win over the
 *      generated level they name (title, tasks, weather, note); totals and
 *      standards are recomputed from whatever tasks the override names.
 *
 *     node tools/gen_ladders.mjs          (also run by tools/gen_catalog.mjs)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT, WEBXR, loadSmartCity, loadTrades } from "./lib/headless.mjs";
import { CURRICULA } from "../WebXR/smartcity/js/curricula.js";

export const STEP_BAR = 50;
export const LEVELS = 10;
export const OVERRIDES_PATH = join(WEBXR, "smartcity/js/ladders.overrides.json");
const OUT_JS = join(WEBXR, "smartcity/js/ladders.js");
const OUT_MD = join(ROOT, "docs/ladders.md");

/** The difficulty order, stated once so the checker and the doc can quote it. */
export const DIFFICULTY = "par minutes + 0.5 x steps + 1 x hazards + 2 x interruptions";
export function difficulty(m) {
  return Math.round(((m.parSeconds ?? 150) / 60 + 0.5 * m.steps + m.hazards + 2 * m.interrupts.length) * 100) / 100;
}

/** What each rung is for — the brief's bands, as data. */
export const RUNGS = [
  null,
  { n: 1, band: "orientation", title: "Orientation", coaching: true, weather: null, blurb: "the programme's easiest procedures, coached, with the hint ring on" },
  { n: 2, band: "orientation", title: "First procedures", coaching: true, weather: null, blurb: "single procedures one step harder, still coached" },
  { n: 3, band: "orientation", title: "Procedures on the clock", coaching: true, weather: null, blurb: "single procedures judged against par" },
  { n: 4, band: "interrupted", title: "Interrupted — rain", coaching: true, weather: "rain", blurb: "procedures under their own interruptions, outdoors in rain" },
  { n: 5, band: "interrupted", title: "Interrupted — wind", coaching: true, weather: "wind", blurb: "procedures under interruptions, outdoors in wind" },
  { n: 6, band: "interrupted", title: "Interrupted — fog", coaching: true, weather: "fog", blurb: "procedures under interruptions, outdoors in fog" },
  { n: 7, band: "chain", title: "Station chain", coaching: true, weather: null, blurb: "several stations back to back with instructor-injectable interruptions" },
  { n: 8, band: "chain", title: "Station chain — instructor on", coaching: true, weather: null, blurb: "a harder chain an instructor drives with injected interruptions" },
  { n: 9, band: "shift", title: "Full shift", coaching: true, weather: null, blurb: "a shift's worth of the programme's hardest jobs, back to back" },
  { n: 10, band: "capstone", title: "Capstone", coaching: false, weather: null, blurb: "the hardest stations, assessed under the mastery rule with zero coaching" },
];
const MIN_TASKS = { 7: 2, 8: 2, 9: 5 };

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
      indoor: r.indoor ?? null,
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

/** A level names its tasks by app, id and step count; the rest lives once in the ladder's `stations`. */
function taskOf(m) { return { app: m.app, id: m.id, steps: m.steps }; }
/** The ladder's station table: every station any of its levels names, with the numbers the app shows. */
function stationTable(levels, metrics) {
  const out = {};
  for (const lv of levels) for (const t of lv.tasks) {
    const m = metrics.get(`${t.app}:${t.id}`);
    out[`${t.app}:${t.id}`] = { name: m.name, steps: m.steps, parSeconds: m.parSeconds, hazards: m.hazards, indoor: m.indoor, interrupts: m.interrupts };
  }
  return out;
}

/** Totals, standards and the partial flag, from whatever tasks a level names. */
export function finishLevel(level, metrics) {
  const ms = level.tasks.map((t) => metrics.get(`${t.app}:${t.id}`));
  level.tasks = ms.map(taskOf);
  level.steps = ms.reduce((a, m) => a + m.steps, 0);
  level.parSeconds = ms.reduce((a, m) => a + m.parSeconds, 0);
  level.standards = [...new Set(ms.flatMap((m) => m.standards))].sort();
  // The brief allows an apprenticeship-hour equivalence only where the
  // registry entry states one; none does today, so this stays null.
  const hours = level.standards.map((id) => BY_ID.get(id)?.hours).filter((h) => typeof h === "number");
  level.hours = hours.length ? hours.reduce((a, b) => a + b, 0) : null;
  level.partial = level.steps < STEP_BAR;
  level.shortfall = level.partial ? STEP_BAR - level.steps : 0;
  level.interruptions = level.n >= 7
    ? ms.flatMap((m) => m.interrupts.map((i) => ({ task: m.id, id: i.id })))
    : [];
  return level;
}

function generateLevels(prog, metrics) {
  const sorted = prog.stations
    .map((s) => metrics.get(`${s.app}:${s.id}`))
    .filter((m, i, arr) => arr.findIndex((x) => x.app === m.app && x.id === m.id) === i)
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
  const n = sorted.length;
  const bandOf = (i) => 1 + Math.floor((i * 9) / n);
  const levels = [];
  for (let L = 1; L <= 9; L++) {
    let focus = sorted.map((m, i) => i).filter((i) => bandOf(i) === L);
    if (!focus.length) focus = [Math.round(((L - 1) * (n - 1)) / 8)];
    const chosen = new Set(focus);
    const center = focus.reduce((a, b) => a + b, 0) / focus.length;
    const rest = sorted.map((m, i) => i).filter((i) => !chosen.has(i))
      .sort((a, b) => Math.abs(a - center) - Math.abs(b - center) || a - b);
    const steps = () => [...chosen].reduce((a, i) => a + sorted[i].steps, 0);
    const need = MIN_TASKS[L] ?? 1;
    while (rest.length && (steps() < STEP_BAR || chosen.size < need)) chosen.add(rest.shift());
    // 7+ must be able to take an injected interruption.
    if (L >= 7 && ![...chosen].some((i) => sorted[i].interrupts.length)) {
      const j = rest.find((i) => sorted[i].interrupts.length);
      if (j != null) chosen.add(j);
    }
    const r = RUNGS[L];
    levels.push({
      n: L, title: r.title, band: r.band, coaching: r.coaching, weather: r.weather,
      tasks: [...chosen].sort((a, b) => a - b).map((i) => ({ app: sorted[i].app, id: sorted[i].id })),
      source: "generated",
    });
  }
  // Level 10: the hardest three, or four when three fall short of the bar.
  const hardest = [...sorted].reverse();
  let cap = hardest.slice(0, 3);
  if (cap.reduce((a, m) => a + m.steps, 0) < STEP_BAR && hardest.length > 3) cap = hardest.slice(0, 4);
  cap.reverse();
  const r = RUNGS[10];
  levels.push({
    n: 10, title: r.title, band: r.band, coaching: false, weather: null,
    tasks: cap.map((m) => ({ app: m.app, id: m.id })), source: "generated",
  });
  return levels;
}

// ------------------------------------------------------------------ overrides

export function readOverrides() {
  if (!existsSync(OVERRIDES_PATH)) return { programmes: {} };
  return JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"));
}

/** A task named in an override: "app:id", or a bare id looked up in the programme. */
export function resolveTaskRef(ref, prog) {
  if (typeof ref !== "string") return null;
  const [a, b] = ref.includes(":") ? ref.split(":") : [null, ref];
  const hit = prog.stations.find((s) => s.id === b && (!a || s.app === a));
  return hit ? { app: hit.app, id: hit.id } : a ? { app: a, id: b } : null;
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
      for (const k of Object.keys(o ?? {})) if (!["title", "tasks", "weather", "note"].includes(k)) out.push(`${pid}:${n}: unknown field "${k}"`);
      if (o.title != null && (typeof o.title !== "string" || !o.title.trim())) out.push(`${pid}:${n}: title must be text`);
      if (o.tasks != null) {
        if (!Array.isArray(o.tasks) || !o.tasks.length) out.push(`${pid}:${n}: tasks must be a non-empty list`);
        else for (const ref of o.tasks) {
          const t = resolveTaskRef(ref, prog);
          if (!t || !metrics.has(`${t.app}:${t.id}`)) out.push(`${pid}:${n}: task "${ref}" is not a station`);
        }
        if (n === 10 && Array.isArray(o.tasks) && (o.tasks.length < 3 || o.tasks.length > 4) && prog.stations.length >= 3) {
          out.push(`${pid}:10: a capstone names 3–4 tasks`);
        }
      }
      if (o.weather != null && !["rain", "wind", "fog", "storm", "smoke", "overcast", "clear"].includes(o.weather)) out.push(`${pid}:${n}: unknown weather "${o.weather}"`);
    }
  }
  return out;
}

function applyOverride(level, o, prog) {
  if (!o) return level;
  const next = { ...level, source: "override" };
  if (o.title) next.title = o.title;
  if (o.tasks) next.tasks = o.tasks.map((ref) => resolveTaskRef(ref, prog));
  if (o.weather !== undefined) next.weather = o.weather;
  if (o.note) next.note = o.note;
  return next;
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
    const levels = generateLevels(prog, metrics)
      .map((l) => applyOverride(l, overrides.programmes?.[prog.id]?.[String(l.n)], prog))
      .map((l) => finishLevel({ programme: prog.id, ...l }, metrics));
    return { programme: prog.id, name: prog.name, accent: prog.accent, stations: stationTable(levels, metrics), levels };
  });
  return { ladders, metrics };
}

// ------------------------------------------------------------------- writers

function standardsUsed(ladders) {
  const ids = [...new Set(ladders.flatMap((l) => l.levels.flatMap((lv) => lv.standards)))].sort();
  return Object.fromEntries(ids.map((id) => { const e = BY_ID.get(id); return [id, { body: e.body, title: e.title, source: e.source }]; }));
}

function writeJs(ladders) {
  const head = `/**
 * GENERATED FILE — do not hand-edit. Run \`node tools/gen_ladders.mjs\` (or
 * \`node tools/gen_catalog.mjs\`, which runs it). Hand-tuned levels belong in
 * ladders.overrides.json beside this file; they win over the generated ones.
 *
 * Ten levels per programme in curricula.js (tools/briefs/ladder-brief.md):
 * 1–3 orientation and single procedures, 4–6 under interruptions and weather,
 * 7–8 station chains with instructor-injectable interruptions, 9 a full
 * shift, 10 a capstone under the mastery rule with no coaching. Step, par and
 * interruption numbers are read from the real station modules; \`standards\`
 * is the union of the tasks' in-scope registry hits in tools/standards.json.
 * A level under ${STEP_BAR} steps is \`partial\` with its \`shortfall\`. Gated by
 * tools/check_ladders.mjs; the rules on who passes live in shared/ladder.js.
 */
export const LADDER_STEP_BAR = ${STEP_BAR};
export const LADDER_DIFFICULTY = ${JSON.stringify(DIFFICULTY)};
export const LADDERS = [
${ladders.map((l) => `  { programme: ${JSON.stringify(l.programme)}, name: ${JSON.stringify(l.name)}, accent: ${JSON.stringify(l.accent)},\n    stations: ${JSON.stringify(l.stations)},\n    levels: [\n${
    l.levels.map((lv) => `    ${JSON.stringify(lv)},`).join("\n")}\n  ] },`).join("\n")}
];
export const LADDER_BY_PROGRAMME = Object.fromEntries(LADDERS.map((l) => [l.programme, l]));
/** Body and title of every registry entry a level names, so a badge can say what it evidences. */
export const LADDER_STANDARDS = ${JSON.stringify(standardsUsed(ladders))};
`;
  writeFileSync(OUT_JS, head);
}

function writeMd(ladders) {
  const all = ladders.flatMap((l) => l.levels);
  const partial = all.filter((l) => l.partial);
  const md = [];
  md.push("# Ladders — ten levels per programme");
  md.push("");
  md.push("Generated by `tools/gen_ladders.mjs` from `WebXR/smartcity/js/curricula.js` and the real station modules; never edit by hand. Hand-tuned levels live in `WebXR/smartcity/js/ladders.overrides.json`. The rules are in `tools/briefs/ladder-brief.md`; the gate is `tools/check_ladders.mjs`; who passes is decided in `WebXR/shared/ladder.js` by the mastery rule in `WebXR/shared/competency.js`.");
  md.push("");
  md.push(`**${ladders.length} programmes · ${all.length} levels · ${all.length - partial.length} at or over ${STEP_BAR} steps · ${partial.length} partial.**`);
  md.push("");
  md.push("How a level is built: stations are sorted by difficulty (" + DIFFICULTY + "), each gets a home band 1–9 by its place in that order, and level N chains its band's stations with the next-nearest by difficulty until the tasks total at least " + STEP_BAR + " steps (7–8 need two tasks and a declared interruption, 9 needs five). Level 10 is the hardest three stations, or four when three fall short, run with no coaching. A level passes when every one of its tasks earns a mastery run inside one run of that level; level N opens when level N−1 has passed, and level 1 is always open.");
  md.push("");
  md.push("Standards evidenced are the union of the tasks' registry hits: entries in `tools/standards.json` that a task's own source cites and that govern its category. No registry entry states an apprenticeship-hour equivalence, so no level claims one.");
  md.push("");
  md.push("In the app each programme card in *Training programmes* has a **Ladder** view (ten rungs, locked / open / passed, steps per level, the partial flag) and **Start level** runs the chain like the guided tour: one shared score, a level results card with a row per task, the level badge on a pass (see [proof-of-training.md](proof-of-training.md#level-badges)). An instructor can assign a level with `CMD_ASSIGN programme:level`, and on a level 7+ chain `CMD_INTERRUPT task/id` queues an interruption for a task still to come. Screenshots: [`docs/screenshots/ladders/`](screenshots/ladders/).");
  md.push("");
  md.push("## Levels needing content");
  md.push("");
  if (!partial.length) md.push("None — every level reaches the bar.");
  else {
    const byProg = new Map();
    for (const l of ladders) for (const lv of l.levels) if (lv.partial) {
      if (!byProg.has(l.programme)) byProg.set(l.programme, []);
      byProg.get(l.programme).push(lv);
    }
    md.push("| Programme | Partial levels | Largest shortfall |");
    md.push("|---|---|---|");
    for (const [pid, lvs] of byProg) md.push(`| \`${pid}\` | ${lvs.map((l) => l.n).join(", ")} | ${Math.max(...lvs.map((l) => l.shortfall))} steps |`);
  }
  md.push("");
  for (const l of ladders) {
    md.push(`## ${l.name}`);
    md.push("");
    md.push(`\`${l.programme}\``);
    md.push("");
    md.push("| Level | Title | Tasks | Steps | Standards evidenced | Partial |");
    md.push("|---|---|---|---|---|---|");
    for (const lv of l.levels) {
      const tasks = lv.tasks.map((t) => `${t.app === "trades" ? "trades:" : ""}${t.id} (${t.steps})`).join(", ");
      const std = lv.standards.length ? lv.standards.map((s) => `\`${s}\``).join(" ") : "—";
      const flag = lv.partial ? `**partial** — ${lv.shortfall} short` : "no";
      const title = `${lv.title}${lv.coaching ? "" : " (no coaching)"}${lv.source === "override" ? " ✎" : ""}`;
      md.push(`| ${lv.n} | ${title} | ${tasks} | ${lv.steps} | ${std} | ${flag} |`);
    }
    md.push("");
  }
  md.push("✎ marks a level hand-tuned in `ladders.overrides.json`.");
  md.push("");
  writeFileSync(OUT_MD, md.join("\n"));
  return partial.length;
}

export async function writeLadders() {
  const { ladders } = await buildLadders();
  writeJs(ladders);
  const partial = writeMd(ladders);
  const total = ladders.reduce((a, l) => a + l.levels.length, 0);
  console.log(`Wrote WebXR/smartcity/js/ladders.js and docs/ladders.md (${ladders.length} programmes, ${total} levels, ${partial} partial)`);
  return { ladders, partial };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await writeLadders();
