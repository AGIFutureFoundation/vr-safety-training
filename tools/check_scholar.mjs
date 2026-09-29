#!/usr/bin/env node
/**
 * SCHOLAR (Holodeck Packs run, second wave; docs/consoles/SCHOLAR.md, docs/k12.md section 10):
 * K-12 lessons as you explore, with a scoreboard.
 *
 *   1. every lesson that can start a session resolves to a classroom station (a real room in a
 *      K-12 programme), a site of its world and a position; its steps and check are sound
 *   2. scoring arithmetic: stars 3/2/1 by try, best stars per lesson summed, the first-try run and
 *      its best, a badge per set (three lessons in a subject or a world), one passport award per
 *      lesson, never twice, and a wrong answer takes nothing away
 *   3. the class board never shows a surname or an e-mail (names are a nickname or a first name,
 *      one word), ranks the top ten only, shows "your best" without a rank below that, and the
 *      opt-out hides a learner; an imported board file is re-cleaned
 *   4. reading ceilings held on every line a session shows (each source's own bound, as check_k12
 *      reads it, and the band ceiling where a lesson carries a band); the panel's own lines under the
 *      youngest band's ceiling; no digit in a lesson line where the source forbids one; no fear framing
 *   5. the mounts: the parishes app and Redwood Reach mount the panel, the bundle lists carry the
 *      modules in order, the scoreboard page exists on the design system and is linked from the
 *      homepage and the instructor console, and the seams are exported
 *
 *     node tools/check_scholar.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity } from "./lib/headless.mjs";
import { readingStats } from "./lib/reading-level.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
let passed = 0, failed = 0;
const ok = () => { passed += 1; };
const fail = (where, msg) => { failed += 1; console.log(`  ✗ ${where}: ${msg}`); };

const mem = new Map();
const store = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
globalThis.localStorage ??= store;
globalThis.sessionStorage ??= store;

const SC = await import("../WebXR/shared/sc-scholar.js");
const SCL = await import("../WebXR/shared/sc-lessons.js");
const { BY_BAND_CEILING } = await import("../WebXR/shared/by-parish-lessons.js");
const { PP_PROGRAMMES } = await import("../WebXR/shared/passport-programmes.js");
const city = await loadSmartCity();
const ROOMS = new Set(city.ROOMS.map((r) => r.id));
const K12 = new Set(Object.keys(SC.SC_SUBJECTS).flatMap((p) => PP_PROGRAMMES[p]?.stations ?? []));

// ------------------------------------------------------------------ 1. every lesson resolves
const RL_LESSON_MAX = 7, RL_STATION_MAX = 11; // check_k12's bounds: a field lesson reads on the spot; Summit/Redwood at the station ceiling
const CEILING_BY_SOURCE = { "field-lessons": RL_LESSON_MAX, "parish-map": RL_LESSON_MAX, bayou: RL_LESSON_MAX, summit: RL_STATION_MAX, redwood: RL_STATION_MAX };
const NO_DIGITS = new Set(["field-lessons", "parish-map", "bayou"]);
const FEAR = /\b(die|dies|died|death|dead|kill|killed|deadly|drown|drowned|terrifying|scary|panic|disaster strikes|catastroph\w*|horror|gore|injur\w*|bleed\w*)\b/i;
// Trade idioms that are not fear framing: an electrician proves a circuit dead; engines drown out voices.
const IDIOMS = /\bdrowns? out\b|\b(?:prove[sd]?|test(?:ed|s)?|check(?:ed|s)?) (?:that )?it is dead\b|\bdead (?:circuit|front|end)\b/gi;
const fearIn = (t) => String(t).replace(IDIOMS, "").match(FEAR)?.[0] ?? null;
const ids = new Set();
const byWorld = {};
for (const l of SCL.SC_LESSONS) {
  const where = `${l.world}:${l.id}`;
  byWorld[l.world] = (byWorld[l.world] ?? 0) + 1;
  if (ids.has(l.id)) fail(where, "duplicate lesson id"); else ok();
  ids.add(l.id);
  if (!K12.has(l.k12)) fail(where, `k12 "${l.k12}" is not a station in a classroom programme`); else ok();
  if (!ROOMS.has(l.k12)) fail(where, `k12 "${l.k12}" is not a station room`); else ok();
  if (!l.subject || !SC.SC_SUBJECTS[l.subject]) fail(where, "no subject"); else ok();
  const sites = SCL.scSitesOf(l.world, l.parish);
  if (sites.size && !sites.has(l.site)) fail(where, `site "${l.site}" is not a site or landmark of ${l.world}${l.parish ? `/${l.parish}` : ""}`); else ok();
  if (!l.site) fail(where, "no site"); else ok();
  if (!Array.isArray(l.position) || !l.position.every(Number.isFinite)) fail(where, "no position to reach"); else ok();
  if (l.steps.length < 3 || !l.steps.every((s) => typeof s === "string" && s.trim())) fail(where, "fewer than three steps"); else ok();
  const c = l.check;
  if (!c.q || c.options.length < 2 || !Number.isInteger(c.answer) || c.answer < 0 || c.answer >= c.options.length) fail(where, "check malformed"); else ok();
  // 4 — reading ceilings on every line the session shows
  const ceil = Math.min(CEILING_BY_SOURCE[l.source] ?? RL_LESSON_MAX, l.band && BY_BAND_CEILING[l.band.split(" to ").pop()] ? BY_BAND_CEILING[l.band.split(" to ").pop()] : 99);
  const st = readingStats([`${l.title}.`, ...l.steps, c.q].join(" "));
  if (st.grade > ceil) fail(where, `reads at ${st.grade.toFixed(1)}, over the ceiling ${ceil}`); else ok();
  const text = [l.title, ...l.steps, c.q, ...c.options, c.why].join(" ");
  if (NO_DIGITS.has(l.source) && /\d/.test(text)) fail(where, "a digit in a lesson line (the Facts rule)"); else ok();
  const fear = fearIn(text);
  if (fear) fail(where, `fear framing: "${fear}"`); else ok();
  const s = SC.scStartSession(l.id, { world: l.world, lesson: l });
  if (!s) fail(where, "a session does not start"); else ok();
}
const worlds = Object.keys(byWorld);
for (const w of ["bayworld", "deep", "regatta", "fairway", "summit", "redwood", "parishes"]) if (!byWorld[w]) fail("lessons", `no session can start in ${w}`); else ok();
const bySource = {};
for (const l of SCL.SC_LESSONS) bySource[l.source] = (bySource[l.source] ?? 0) + 1;
console.log(`  · ${SCL.SC_LESSONS.length} lessons can start a session across ${worlds.length} worlds (${worlds.map((w) => `${w} ${byWorld[w]}`).join(", ")})`);
console.log(`  · sources: ${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(", ")}`);

// ------------------------------------------------------------------ 2. scoring arithmetic
{
  mem.clear();
  const awards = [];
  const award = (src, o) => awards.push(`${src}:${o.attemptId}:${o.reputation}`);
  const awarded = (src, id) => awards.some((a) => a.startsWith(`${src}:${id}:`));
  const pick = (subject, n, world = null) => SCL.SC_LESSONS.filter((l) => l.subject === subject && (!world || l.world === world)).slice(0, n);
  const reg = SC.scRegisterLessons(SCL.SC_LESSONS.filter((l) => l.world === "redwood"), { world: "redwood" });
  const eq = (where, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) fail(where, `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); else ok(); };
  eq("stars", [1, 2, 3, 4, 9].map(SC.scStarsFor), [3, 2, 1, 1, 1]);
  const run = (l, wrongs) => {
    const s = SC.scStartSession(l.id, { world: l.world, lesson: l });
    let step; do { step = SC.scStep(s); } while (step.kind === "step");
    const wrong = (l.check.answer + 1) % l.check.options.length;
    let r;
    for (let i = 0; i < wrongs; i++) { r = SC.scAnswer(s, wrong, { award, awarded }); if (r.right || r.stars) fail(l.id, "a wrong answer scored"); else ok(); if (!r.why) fail(l.id, "a wrong answer shows no why"); else ok(); }
    r = SC.scAnswer(s, l.check.answer, { award, awarded, lessons: reg });
    const again = SC.scAnswer(s, l.check.answer, { award, awarded });
    if (again.right) fail(l.id, "a finished session scored twice"); else ok();
    return r;
  };
  const sci = pick("k12-science", 3), math = pick("k12-practical-math", 2);
  const r1 = run(sci[0], 0), r2 = run(sci[1], 1), r3 = run(sci[2], 0), r4 = run(math[0], 3), r5 = run(math[1], 0);
  eq("stars by try", [r1.stars, r2.stars, r3.stars, r4.stars, r5.stars], [3, 2, 3, 1, 3]);
  eq("first-try run", [r1.streak, r2.streak, r3.streak, r4.streak, r5.streak], [1, 0, 1, 0, 1]);
  if (!r3.badges.some((b) => b.id === "sc-subject-k12-science")) fail("badges", "three science lessons did not earn the Science badge"); else ok();
  if (r1.badges.length || r2.badges.some((b) => b.kind === "subject")) fail("badges", "a subject badge came before three lessons"); else ok();
  // replaying a lesson: the best stars count once, the session count grows, the passport award stays one
  const r6 = run(sci[1], 0);
  const sum = SC.scSummary();
  eq("summary", { stars: sum.stars, sessions: sum.sessions, lessons: sum.lessons, streak: sum.streak, bestStreak: sum.bestStreak }, { stars: 3 + 3 + 3 + 1 + 3, sessions: 6, lessons: 5, streak: 2, bestStreak: 2 });
  eq("replay stars", r6.stars, 3);
  eq("passport awards", awards.length, 5);
  const nAwards = awards.length;
  if (!awards.every((a) => a.startsWith("sc-session:"))) fail("passport", "an award is not sc-session"); else ok();
  eq("sessions list", SC.scSessions().map((s) => s.stars), [3, 2, 3, 1, 3, 3]);
  // a world badge from three lessons in one world; the trail points at lessons not yet done
  mem.clear();
  const rw = SCL.scLessonsFor("redwood").slice(0, 3);
  let last;
  for (const l of rw) last = run(l, 0);
  if (!last.badges.some((b) => b.id === "sc-world-redwood")) fail("badges", "three Redwood lessons did not earn the world badge"); else ok();
  if (!last.trail.length || last.trail.some((t) => rw.some((l) => l.id === t.id))) fail("trail", "the trail is empty or names a lesson already done"); else ok();
  if (last.trail.some((t, i) => i && t.metres < last.trail[i - 1].metres)) fail("trail", "the trail is not nearest first"); else ok();
  const near = SC.scNearby(rw[0].position, SCL.scLessonsFor("redwood"));
  if (!near.length || near[0].position !== rw[0].position && Math.hypot(near[0].position[0] - rw[0].position[0], near[0].position[1] - rw[0].position[1]) > SC.SC_REACH) fail("reach", "a lesson's own position does not offer its session"); else ok();
  const sfKey = SC.scWorldKey({ world: "parishes", parish: "sf-marina" }), noKey = SC.scWorldKey({ world: "parishes", parish: "orleans" });
  eq("world keys", [sfKey, noKey], ["san-francisco", "parishes"]);
  console.log(`  · scoring: stars ${[r1, r2, r3, r4, r5].map((r) => r.stars).join("/")}, total ${sum.stars} over ${sum.lessons} lessons and ${sum.sessions} sessions, best run ${sum.bestStreak}, ${nAwards} passport awards (one per lesson, the replay none)`);
}

// ------------------------------------------------------------------ 3. the class board
{
  mem.clear();
  const bad = /@|\.(com|org|net|edu|io)\b|\d/i;
  const cases = [["", "Jane Smith"], ["", "jane.smith@school.org"], ["Rocket Kid", "Jane Smith"], ["x@y.io", "Omar Diaz"], ["", "   "], ["Ana", ""], ["Kid42", "Lee Wong"], ["", "Maria de la Cruz"]];
  const want = ["Jane", "Scholar", "Rocket", "Omar", "Scholar", "Ana", "Lee", "Maria"];
  const got = cases.map(([n, full]) => SC.scSafeName(n, full));
  if (JSON.stringify(got) !== JSON.stringify(want)) fail("names", `got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); else ok();
  const surnames = ["Smith", "Diaz", "Wong", "Cruz"];
  const code = "ABCD-EFGH";
  const entries = Array.from({ length: 14 }, (_, i) => ({
    member: `m${i}`, nick: i === 3 ? "maria.cruz@school.org" : i === 5 ? "Lee Wong" : ["Ana", "Ben", "Cal", "Dee", "Eli", "Fay", "Gus", "Hal", "Ivy", "Jo", "Kai", "Liv", "Mo", "Ned"][i],
    stars: 40 - i * 2, sessions: 20 - i, bestStreak: i % 4, optOut: i === 1, at: "2026-09-29T00:00:00Z",
  }));
  const b = SC.scBoard(code, { entries, me: "m12" });
  if (!b || b.top.length !== SC.SC_BOARD_TOP) fail("board", `top shows ${b?.top.length} rows, want ${SC.SC_BOARD_TOP}`); else ok();
  if (b.top.some((r) => r.name === "Ben")) fail("board", "an opted-out learner is on the board"); else ok();
  if (b.hidden !== 1) fail("board", `hidden ${b.hidden}, want 1`); else ok();
  const shown = JSON.stringify(b);
  if (bad.test(b.top.map((r) => r.name).join(" ") + " " + (b.you?.name ?? ""))) fail("board", "an e-mail, a web address or a digit is on the board"); else ok();
  if (surnames.some((s) => shown.includes(s))) fail("board", "a surname is on the board"); else ok();
  if (b.top.some((r, i) => r.rank !== i + 1 || (i && r.stars > b.top[i - 1].stars))) fail("board", "ranks are not by stars"); else ok();
  if (!b.you || b.you.rank !== null || b.you.name !== "Mo") fail("board", `"your best" below the top ten must show no rank (got ${JSON.stringify(b.you)})`); else ok();
  const b2 = SC.scBoard(code, { entries, me: "m2" });
  if (b2.you?.rank !== 2) fail("board", `a learner in the top ten sees their rank (got ${b2.you?.rank})`); else ok();
  if (SC.scBoard("abc", { entries })) fail("board", "a malformed class code returned a board"); else ok();
  // the device's own flow: share, opt out, export, import re-cleans
  SC.scSetNick("Star Reader");
  const e = SC.scShareToClass("abcd efgh", { name: "Jane Smith" });
  if (e?.nick !== "Star") fail("share", `nickname shown as ${e?.nick}`); else ok();
  let mine = SC.scBoard(code);
  if (!mine.top.some((r) => r.you)) fail("share", "the learner's own entry is not on the board"); else ok();
  SC.scSetOptOut(true);
  mine = SC.scBoard(code);
  if (mine.top.some((r) => r.you) || mine.hidden !== 1) fail("opt-out", "the opt-out did not hide the learner"); else ok();
  SC.scSetOptOut(false);
  const file = SC.scExportBoard(code);
  file.entries.push({ member: "evil", nick: "bob.jones@mail.com Jones", stars: "12", sessions: -4, optOut: 0, at: "2026-09-29T01:00:00Z" });
  const imp = SC.scImportBoard(file);
  const after = SC.scBoard(code);
  if (!imp.ok || after.top.some((r) => /jones|@/i.test(r.name)) || after.top.some((r) => r.sessions < 0)) fail("import", "an imported entry was not re-cleaned"); else ok();
  if (SC.scImportBoard({ kind: "other" }).ok) fail("import", "a file of another kind was accepted"); else ok();
  console.log(`  · class board: top ${b.top.length} of ${b.total}, ${b.hidden} opted out, "your best" for rank below ten shows no rank; names ${got.join(", ")}`);
}

// ------------------------------------------------------------------ 4. the panel's own lines
{
  const youngest = BY_BAND_CEILING["early primary"];
  for (const [k, line] of Object.entries(SC.SC_LINES)) {
    const st = readingStats(line.endsWith(".") || line.endsWith("?") || line.endsWith("!") ? line : `${line}.`);
    if (st.grade > youngest) fail(`line ${k}`, `reads at ${st.grade.toFixed(1)}, over the early-primary ceiling ${youngest}`); else ok();
    if (fearIn(line) || /\b(lost|fail|failed|wrong!|lose)\b/i.test(line)) fail(`line ${k}`, "fear or loss framing"); else ok();
  }
  const badges = [...Object.values(SC.SC_SUBJECTS).map((s) => s.badge), ...Object.values(SC.SC_WORLD_NAMES).map((w) => `${w} Trail Badge`)];
  for (const b of badges) if (/\d/.test(b)) fail("badge", `${b} carries a figure`); else ok();
}

// ------------------------------------------------------------------ 5. mounts, bundles, page, links, seams
{
  const seams = ["scStartSession", "scSessions", "scBoard"];
  for (const s of seams) if (typeof SC[s] !== "function") fail("seams", `${s} is not exported`); else ok();
  const src = read("WebXR/shared/sc-scholar.js");
  if (!/SEAMS/.test(src.slice(0, 2500))) fail("seams", "the seam shapes are not documented at the top of sc-scholar.js"); else ok();
  if (/three|THREE/.test(src.replace(/three\.js/g, ""))) fail("sc-scholar", "the pure core names three.js"); else ok();
  if (/fetch\(|XMLHttpRequest|navigator\.sendBeacon/.test(src + read("WebXR/shared/sc-session-ui.js"))) fail("privacy", "a SCHOLAR module makes a network request"); else ok();
  for (const [app, world] of [["WebXR/parishes/js/app.js", "parishes"], ["WebXR/redwood/js/app.js", "redwood"]]) {
    const a = read(app);
    if (!/scMountSession\(/.test(a) || !a.includes(`world: "${world}"`)) fail(app, "does not mount the session panel"); else ok();
    if (!/\.tick\(/.test(a)) fail(app, "never ticks the session panel"); else ok();
  }
  const py = read("tools/bundle_webxr.py");
  for (const name of ["parishes", "redwood"]) {
    const block = py.slice(py.indexOf(`    "${name}": {`), py.indexOf('"entry"', py.indexOf(`    "${name}": {`)));
    const at = (m) => block.indexOf(`"${m}"`);
    for (const m of ["sc-scholar.js", "sc-session-ui.js"]) if (at(m) < 0) fail(`bundle ${name}`, `${m} is not listed`); else ok();
    if (at("sc-scholar.js") < at("passport-programmes.js") || at("sc-session-ui.js") < at("sc-scholar.js") || at("sc-scholar.js") < at("profiles.js")) fail(`bundle ${name}`, "sc modules out of order"); else ok();
  }
  if (py.indexOf('"by-parish-lessons.js"', py.indexOf('    "parishes": {')) < 0) fail("bundle parishes", "by-parish-lessons.js is not listed"); else ok();
  const pagePath = "WebXR/scholar/index.html";
  if (!existsSync(join(ROOT, pagePath))) fail("page", `${pagePath} is missing`);
  else {
    const page = read(pagePath);
    if (!/href="\.\.\/shared\/design\.css"/.test(page)) fail("page", "not on the design system (design.css)"); else ok();
    if (!/sc-lessons\.js/.test(page) || !/sc-scholar\.js/.test(page)) fail("page", "does not read the lesson index and the core"); else ok();
    if (!/<title>[^<]+<\/title>/.test(page) || !/name="viewport"/.test(page)) fail("page", "no title or viewport"); else ok();
    for (const m of page.matchAll(/(?:href|src)="(\.\.\/[^"#?]+)"/g)) if (!existsSync(join(ROOT, "WebXR/scholar", m[1]))) fail("page", `link ${m[1]} does not resolve`); else ok();
  }
  if (!/href="scholar\/index\.html"/.test(read("WebXR/index.html"))) fail("homepage", "does not link the scoreboard"); else ok();
  if (!/scholar/.test(read("tools/gen_home.mjs"))) fail("homepage", "gen_home.mjs does not carry the scoreboard link"); else ok();
  if (!/href="\.\.\/scholar\/index\.html"/.test(read("WebXR/instructor/index.html"))) fail("instructor", "the instructor console does not link the scoreboard"); else ok();
  const doc = read("docs/consoles/SCHOLAR.md");
  for (const s of seams) if (!doc.includes(s)) fail("docs", `docs/consoles/SCHOLAR.md does not list ${s} under Seams`); else ok();
}

console.log(`\n  ${SCL.SC_LESSONS.length} session lessons · ${passed} checks`);
console.log(failed ? `\n${failed} SCHOLAR check(s) failed.` : "\nAll SCHOLAR checks pass.");
process.exit(failed ? 1 : 0);
