/**
 * Graded evaluation of every authored procedure.
 *
 *     node tools/eval_content.mjs            # ranked table + the worst per dimension
 *     node tools/eval_content.mjs --json     # machine-readable, for tracking over time
 *     node tools/eval_content.mjs --station hot-tap
 *
 * The twenty-three checkers are gates: they answer "is this broken" and a
 * station either passes or does not. Nothing in them answers "is this any
 * good", and a station can pass all of them while being ten clicks in a row
 * with a paragraph of filler on each. So this is the other thing — a score on
 * a continuum, per dimension, over the whole corpus, whose job is to rank the
 * catalogue worst-first so authoring effort goes where it is worth most.
 *
 * It deliberately does NOT fail a build. A score is a judgement about content
 * and the thresholds here are ours rather than anybody's standard; wiring it
 * into check_all would turn an opinion into a gate and start producing
 * stations written to satisfy the metric. It prints, it ranks, and a person
 * decides.
 *
 * The one dimension worth explaining: ORIGINALITY compares every station's
 * prose against every other station's and penalises the closest match. Six
 * authors working from the same template is exactly the situation that
 * produces six stations with the same sentences in them, and no gate can see
 * it because each one is individually fine.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadSmartCity, loadTrades, ROOT } from "./lib/headless.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const only = args.includes("--station") ? args[args.indexOf("--station") + 1] : null;

const city = await loadSmartCity();
const trades = await loadTrades();

// ------------------------------------------------------------------ helpers

const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag"];

// ------------------------------------------------------- the standards registry
//
// tools/standards.json is the one place a standard, code or union training
// programme is written down: its body, its title, the catalog categories it
// governs, and the forms a station's own text cites it by. Both dimensions
// below read it, so adding a standard there is the only edit either of them
// needs — nothing here is hand-maintained per body.
const REGISTRY = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8"));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const BY_CITE = new Map();
for (const s of REGISTRY.standards) for (const c of s.cites) if (!BY_CITE.has(c)) BY_CITE.set(c, s);
// Longest form first, so "NFPA 70E" is never read as "NFPA 70", and
// case-sensitive, because these are citations and not ordinary words.
const CITE_RE = new RegExp(
  `(?<![A-Za-z0-9])(?:${[...BY_CITE.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})(?![A-Za-z0-9])(?!\\.\\d)`, "g");

// The shapes a citation takes, whatever it cites — a clause number, a code
// designation, a section symbol. These exist so a citation the registry does
// NOT know still counts as an authority the station named, and costs it.
const SHAPES = [
  [/(?<![A-Za-z0-9])(\d{2}) CFR (?:Part )?(\d{2,4})(?:\.(\d{1,4}))?(?![\d.])/g, (m) => `${m[1]} CFR ${m[2]}${m[3] ? "." + m[3] : ""}`],
  [/(?<![A-Za-z0-9])(\d{2}) CFR Subchapter ([A-Z])\b/g, (m) => `${m[1]} CFR Subchapter ${m[2]}`],
  [/(?<![A-Za-z0-9.])(1910|1926|1915|1917|1918|1904)\.(\d{1,4})(?![\d.])/g, (m) => `29 CFR ${m[1]}.${m[2]}`],
  [/(?<![A-Za-z0-9])8 CCR (?:§ ?)?(\d{3,5}(?:\.\d)?)(?![\d])/g, (m) => `8 CCR ${m[1]}`],
  [/(?<![A-Za-z0-9])NFPA (\d{2,4}[A-Z]?)(?![\w.])/g, (m) => `NFPA ${m[1]}`],
  [/(?<![A-Za-z0-9])ANSI(?:\/[A-Z]+)* ?([A-Z]\d{1,3}(?:\.\d+)?)(?![\w.])/g, (m) => `ANSI ${m[1]}`],
  [/(?<!NSF\/)(?<![A-Za-z0-9])ANSI(\/[A-Z]+) (\d{2,4})(?![\w.])/g, (m) => `ANSI${m[1]} ${m[2]}`],
  [/(?<![A-Za-z0-9])ASME ([AB]\d{2}\.\d+)(?![\w.])/g, (m) => `ASME ${m[1]}`],
  [/(?<![A-Za-z0-9])AWS (D\d\.\d)(?![\w.])/g, (m) => `AWS ${m[1]}`],
  [/(?<![A-Za-z0-9])NSF\/ANSI(?:\/CAN)? (\d{1,3})(?![\w.])/g, (m) => `NSF/ANSI ${m[1]}`],
  [/(?<![A-Za-z0-9])ASHRAE (\d{2,3}(?:\.\d)?)(?![\w.])/g, (m) => `ASHRAE ${m[1]}`],
  [/(?<![A-Za-z0-9])IIAR (\d)(?![\w.])/g, (m) => `IIAR ${m[1]}`],
  [/(?<![A-Za-z0-9])ASSE (\d{4})(?![\w.])/g, (m) => `ASSE ${m[1]}`],
  [/(?<![A-Za-z0-9])AWWA ([A-Z]\d{2,3})(?![\w.])/g, (m) => `AWWA ${m[1]}`],
  [/(?<![A-Za-z0-9])API (?:RP |Std )?(\d{3,4})(?![\w.])/g, (m) => `API ${m[1]}`],
  [/(?<![A-Za-z0-9])IEC (\d{4,5})(?![\w.])/g, (m) => `IEC ${m[1]}`],
  [/(?<![A-Za-z0-9])ISO(?:\/IEC)? (\d{4,5})(?![\w.])/g, (m) => `ISO ${m[1]}`],
  [/(?<![A-Za-z0-9])(?:IEC\/)?IEEE (\d{2,5})(?![\w.])/g, (m) => `IEEE ${m[1]}`],
  [/(?<![A-Za-z0-9])EPA Method (\d{1,3}[A-Z]?)(?![\w.])/g, (m) => `EPA Method ${m[1]}`],
  [/(?<![A-Za-z0-9])Labor Code ?§ ?(\d{3,4})(?![\d])/g, (m) => `Labor Code §${m[1]}`],
  [/(?<![A-Za-z0-9])§ ?(\d{5})(?![\d])/g, (m) => `§${m[1]}`],
];
/** The spellings the registry keeps in one form. */
function canonical(key) {
  if (key === "ISO 27001") return "IEC 27001";
  const asse = key.match(/^ANSI\/ASSE (\d{4})$/);
  return asse ? `ASSE ${asse[1]}` : key;
}

// The words that name a body rather than one of its standards, taken from the
// registry: each entry's body, and the acronyms inside the forms it is cited
// by. This is what used to be a hand-written list of sixty-odd acronyms.
const TOKEN_STOP = new Set(["PART", "RP", "STD", "CAN", "HERE", "II", "IS", "SP", "ATS", "MTS", "QA"]);
function bodyTokens(entry) {
  const out = new Set();
  const add = (t) => { if (t && t.length > 1 && !TOKEN_STOP.has(t)) out.add(t); };
  if (entry.body !== "union") {
    for (const part of entry.body.split("/")) {
      const p = part.trim();
      if (/^[A-Za-z][A-Za-z&. ]*$/.test(p)) add(p.replace(/\.$/, ""));
      for (const a of p.match(/[A-Z][A-Z&]+/g) ?? []) add(a);
    }
  }
  for (const c of entry.cites) {
    for (const a of c.match(/[A-Z][A-Z&]+/g) ?? []) add(a);
    if (/^[A-Z][A-Z]+(?: [A-Z][A-Z]+)+$/.test(c)) add(c);       // UNITE HERE
  }
  return out;
}
const TOKEN_OWNERS = new Map();                                  // token -> bodies that answer for it
for (const s of REGISTRY.standards) for (const t of bodyTokens(s)) {
  if (!TOKEN_OWNERS.has(t)) TOKEN_OWNERS.set(t, new Set());
  TOKEN_OWNERS.get(t).add(s.body);
}
const AUTHORITY = new RegExp(`\\b(${[...TOKEN_OWNERS.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})\\b`, "g");

/**
 * Everything a station's text names that the registry could answer for: the
 * standards it cites by a citation form, and the bodies it names. Returns the
 * registry entries that resolved, plus the citations and body names that did
 * not — a body named with no standard of its own behind it is exactly the
 * kind of grounding that reads well and proves nothing.
 */
function authorities(text) {
  const resolved = new Map();
  const looseCites = new Set();
  for (const m of text.matchAll(CITE_RE)) { const e = BY_CITE.get(m[0]); if (e) resolved.set(e.id, e); }
  for (const [re, norm] of SHAPES) for (const m of text.matchAll(re)) {
    const key = canonical(norm(m));
    const e = BY_CITE.get(key);
    if (e) resolved.set(e.id, e); else looseCites.add(key);
  }
  const bodies = new Set(text.match(AUTHORITY) ?? []);
  return { resolved, looseCites, bodies };
}

const WORD = /[a-z][a-z'-]{2,}/g;
const STOP = new Set(("the a an and or but of to in on at for with from by is are was were be been being it its this that these those you your they them their " +
  "not no nothing which what when where how why while until before after into out over under off up down as than then so if is it's").split(" "));

function tokens(text) {
  const out = new Set();
  for (const w of String(text ?? "").toLowerCase().match(WORD) ?? []) if (!STOP.has(w)) out.add(w);
  return out;
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let hit = 0;
  for (const t of a) if (b.has(t)) hit++;
  return hit / (a.size + b.size - hit);
}
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const median = (xs) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[s.length >> 1]; };

/** Every sentence a learner can be shown, for the prose dimensions. */
function prose(r) {
  const parts = [];
  for (const s of r.steps ?? []) parts.push(s.title ?? "", s.cue ?? "", s.why ?? "");
  for (const v of Object.values(r.hazards ?? {})) parts.push(v);
  for (const it of r.interrupts ?? []) parts.push(it.alert ?? "", it.cue ?? "", it.why ?? "", it.missNote ?? "");
  return parts.join(" ");
}

// ---------------------------------------------------------------- dimensions

function variety(r) {
  const kinds = (r.steps ?? []).map((s) => s.kind);
  const distinct = new Set(kinds).size;
  let run = 1, worst = 1;
  for (let i = 1; i < kinds.length; i++) { run = kinds[i] === kinds[i - 1] ? run + 1 : 1; worst = Math.max(worst, run); }
  // Eight kinds exist. Using six or more is full marks; a run of four
  // identical kinds in a row is what a row of clicks feels like.
  const spread = clamp01((distinct - 1) / 5);
  const monotony = clamp01((worst - 2) / 4);
  return { score: clamp01(spread * 0.75 + (1 - monotony) * 0.25), distinct, longestRun: worst };
}

function decisions(r) {
  const steps = (r.steps ?? []).length || 1;
  const hz = Object.keys(r.hazards ?? {}).length;
  const it = (r.interrupts ?? []).length;
  const finds = (r.steps ?? []).filter((s) => s.kind === "find").length;
  // A wrong thing to reach for every three or four steps, plus at least two
  // interruptions, is the density the best stations in the catalogue run at.
  return { score: clamp01((hz / (steps / 3.5)) * 0.5 + clamp01(it / 2) * 0.35 + clamp01(finds / 1.5) * 0.15), hazards: hz, interrupts: it };
}

function explanation(r) {
  const whys = (r.steps ?? []).map((s) => (s.why ?? "").length);
  const missing = whys.filter((n) => n < 40).length;
  const med = median(whys);
  // A reason worth reading is a couple of sentences. Under 40 characters is
  // a label, not an explanation.
  return { score: clamp01(clamp01((med - 90) / 160) * 0.8 + (1 - clamp01(missing / 2)) * 0.2), medianWhy: med, thin: missing };
}

// Distinct bodies named — a union, a regulator, a consensus standards body.
// The vocabulary comes from the registry (see AUTHORITY above), so a station
// cannot be grounded in a body the platform has never registered a standard for.
function grounding(r) {
  const cert = String(r.certification ?? "");
  const hits = new Set((cert.match(AUTHORITY) ?? []).concat(prose(r).match(AUTHORITY) ?? []));
  // Three or more distinct authorities named — a union, a regulator and a
  // consensus standard is the usual shape — is what a grounded station looks
  // like.
  return { score: clamp01(hits.size / 4), authorities: hits.size };
}

/**
 * How much of what a station cites is a standard this platform has actually
 * registered, and governs the kind of work this station teaches. The registry
 * (tools/standards.json) carries each standard's scope — the catalog
 * categories it governs — so a fall-protection code cited by a dental station
 * is visible here in a way `grounding` cannot see: grounding counts names,
 * this counts whether the name answers for the work.
 *
 * The share of the station's cited authorities that resolve to an in-scope
 * registry entry, with half a mark taken off again for each one that resolves
 * out of scope: citing somebody else's code is worse than citing nothing. An
 * authority the registry does not know — a clause it has never heard of, or a
 * body named with none of its standards behind it — counts in the denominator
 * and nowhere else. It is a ranking signal, not a gate;
 * tools/check_standards.mjs is the gate, and asks only for one in-scope
 * standard per station.
 */
function standards(r, category) {
  if (!category) return { score: null, cited: 0, inScope: 0, outOfScope: 0, unregistered: 0 };
  const { resolved, looseCites, bodies } = authorities(`${r.certification ?? ""} ${prose(r)}`);
  const inScope = [...resolved.values()].filter((e) => e.scope.includes(category));
  const outOfScope = resolved.size - inScope.length;
  // A body's name is answered for when one of that body's own standards
  // resolved in scope here; otherwise it is a name with nothing behind it.
  const covered = new Set(inScope.map((e) => e.body));
  const unregistered = looseCites.size +
    [...bodies].filter((t) => ![...(TOKEN_OWNERS.get(t) ?? [])].some((b) => covered.has(b))).length;
  const cited = inScope.length + outOfScope + unregistered;
  if (!cited) return { score: 0, cited: 0, inScope: 0, outOfScope: 0, unregistered: 0 };
  return {
    score: clamp01((inScope.length - 0.5 * outOfScope) / cited),
    cited, inScope: inScope.length, outOfScope, unregistered,
  };
}

function feedback(r) {
  let want = 0, got = 0;
  for (const s of r.steps ?? []) {
    if (s.kind === "gauge") { want++; if (s.gauge?.missNote) got++; }
    if (s.kind === "track") { want++; if (s.holdBreakNote) got++; }
    if (s.kind === "hold") { want++; if (s.holdBreakNote) got++; }
    if (s.kind === "drag") { want++; if (s.drag?.missNote) got++; }
    if (s.kind === "sequence" && !s.anyOrder) { want++; if (s.outOfOrderNote) got++; }
    if (s.kind === "find") { want++; if (s.itemNotes && Object.keys(s.itemNotes).length) got++; }
  }
  for (const it of r.interrupts ?? []) { want += 2; if (it.missNote) got++; if (it.wrongNote) got++; }
  return { score: want ? got / want : 1, want, got };
}

function scene(r, suite) {
  // A flat briefing station is a dossier with no 3D scene, on purpose. Scoring
  // it on mesh count says nothing about it except that it is the thing it was
  // built to be, so it is excused rather than marked at zero.
  if (r.flat) return { score: null, meshes: 0, materials: 0, interactables: 0, flat: true };
  let meshes = 0, mats = new Set(), hits = 0;
  try {
    const root = new suite.THREE.Group();
    const api = r.build(root);
    hits = Object.keys(api?.hits ?? {}).length;
    root.traverse((o) => { if (o.isMesh) { meshes++; if (o.material) mats.add(o.material); } });
  } catch (e) { return { score: 0, meshes: 0, materials: 0, interactables: 0, error: e.message }; }
  // Enough to look like a workplace, and enough distinct things to reach for
  // that the right one is a choice.
  return {
    score: clamp01(clamp01(meshes / 180) * 0.45 + clamp01(mats.size / 45) * 0.2 + clamp01(hits / 22) * 0.35),
    meshes, materials: mats.size, interactables: hits,
  };
}

// ---------------------------------------------------------------------- run

const rooms = [];
for (const [app, suite] of [["smartcity", city], ["trades", trades]]) {
  for (const r of suite.ROOMS) {
    if (!r.steps?.length) continue;              // flat briefing stations have no procedure
    if (only && r.id !== only) continue;
    rooms.push({ app, suite, r });
  }
}

// Originality is pairwise, so the token sets are built once across everything
// — including the stations filtered out by --station, or the comparison would
// be against nothing.
const allTokens = new Map();
for (const [app, suite] of [["smartcity", city], ["trades", trades]]) {
  for (const r of suite.ROOMS) if (r.steps?.length) allTokens.set(r.id, tokens(prose(r)));
}

// The weights are renormalised over the dimensions that apply to a station,
// so they need not sum to one: `standards` carries the same weight as
// `grounding`, being the same question asked with the registry in hand.
const WEIGHTS = { variety: 0.18, decisions: 0.2, explanation: 0.18, grounding: 0.14, standards: 0.14, feedback: 0.15, scene: 0.1, originality: 0.05 };
const results = [];

for (const { app, suite, r } of rooms) {
  const d = {
    variety: variety(r),
    decisions: decisions(r),
    explanation: explanation(r),
    grounding: grounding(r),
    standards: standards(r, r.category ?? (app === "trades" ? "Trade Skills Simulator" : null)),
    feedback: feedback(r),
    scene: scene(r, suite),
  };
  let nearest = { id: null, sim: 0 };
  const mine = allTokens.get(r.id);
  for (const [id, other] of allTokens) {
    if (id === r.id) continue;
    const sim = jaccard(mine, other);
    if (sim > nearest.sim) nearest = { id, sim };
  }
  // Two stations in the same trade share vocabulary honestly; past about a
  // third of their content words in common, one of them was written from the
  // other.
  d.originality = { score: clamp01((0.34 - nearest.sim) / 0.2), nearest: nearest.id, similarity: nearest.sim };

  // A dimension that does not apply is dropped and the rest are renormalised,
  // rather than counted as a zero that would rank a station bottom for being
  // the kind of station it is.
  const live = Object.entries(WEIGHTS).filter(([k]) => d[k].score !== null);
  const wsum = live.reduce((a, [, w]) => a + w, 0);
  const total = live.reduce((acc, [k, w]) => acc + d[k].score * w, 0) / wsum;
  results.push({ app, id: r.id, name: r.name ?? r.title ?? r.id, category: r.category ?? (app === "trades" ? "Trade Skills Simulator" : null), steps: r.steps.length, score: Math.round(total * 100), d });
}

results.sort((a, b) => a.score - b.score);

if (asJson) {
  const out = join(ROOT, "tools", "eval-content.json");
  writeFileSync(out, JSON.stringify({ generated: new Date().toISOString().slice(0, 10), weights: WEIGHTS, results }, null, 2));
  console.log(`wrote ${out} — ${results.length} procedures, corpus mean ${Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)}`);
} else {
  const mean = Math.round(results.reduce((a, r) => a + r.score, 0) / results.length);
  console.log(`\nContent evaluation — ${results.length} procedures, corpus mean ${mean}/100\n`);
  const bar = (v) => "█".repeat(Math.round(v * 10)).padEnd(10, "·");
  console.log("  score  station                    var  dec  exp  gnd  std  fbk  scn  org");
  for (const r of results) {
    const c = (k) => (r.d[k].score === null ? "  —" : String(Math.round(r.d[k].score * 100)).padStart(3));
    console.log(`   ${String(r.score).padStart(3)}   ${r.id.padEnd(24)} ${c("variety")} ${c("decisions")} ${c("explanation")} ${c("grounding")} ${c("standards")} ${c("feedback")} ${c("scene")} ${c("originality")}`);
  }
  console.log("\nWeakest by dimension:");
  for (const k of Object.keys(WEIGHTS)) {
    const worst = results.filter((r) => r.d[k].score !== null).sort((a, b) => a.d[k].score - b.d[k].score).slice(0, 4);
    const detail = (r) => {
      const x = r.d[k];
      if (k === "variety") return `${x.distinct} kinds, run of ${x.longestRun}`;
      if (k === "decisions") return `${x.hazards} hazards, ${x.interrupts} interruptions`;
      if (k === "explanation") return `median why ${x.medianWhy} chars${x.thin ? `, ${x.thin} thin` : ""}`;
      if (k === "grounding") return `${x.authorities} authorities named`;
      if (k === "standards") return `${x.inScope}/${x.cited} in scope${x.outOfScope ? `, ${x.outOfScope} out of scope` : ""}${x.unregistered ? `, ${x.unregistered} unregistered` : ""}`;
      if (k === "feedback") return `${x.got}/${x.want} notes written`;
      if (k === "scene") return `${x.meshes} meshes, ${x.interactables} interactables`;
      return `${Math.round(x.similarity * 100)}% shared with ${x.nearest}`;
    };
    console.log(`  ${k.padEnd(12)} ${bar(worst[0].d[k].score)}  ${worst.map((r) => `${r.id} (${detail(r)})`).join("; ")}`);
  }
  console.log("\nThis is a ranking, not a gate. It is deliberately not in check_all —");
  console.log("a score wired into a build is a score people write content to satisfy.\n");
}
