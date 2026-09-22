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
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadSmartCity, loadTrades, ROOT } from "./lib/headless.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const only = args.includes("--station") ? args[args.indexOf("--station") + 1] : null;

const city = await loadSmartCity();
const trades = await loadTrades();

// ------------------------------------------------------------------ helpers

const KINDS = ["select", "sequence", "find", "gauge", "hold", "track", "turn", "drag"];

// Bodies that actually publish a standard, plus the union and certification
// vocabulary the curriculum is built on. Presence of these is a proxy for
// "this station is anchored to something real" — not proof, but a station
// with none of them is certainly floating.
// Bodies a station can be grounded in: the trades' codes and unions, and the
// public-health, food, alcohol and labour bodies the hospitality and dental
// series answer to — CDC, FDA, CalCode, the ABC and its RBS programme, the
// Wage Orders, and the hospitality and clinic unions.
const AUTHORITY = /\b(OSHA|CFR|NFPA|ANSI|ASME|AWWA|ASHRAE|IIAR|AMPP|SSPC|NACE|ISO|SOLAS|IMO|USCG|FRA|EPA|NSF|PTI|ACI|ETCP|SWANA|RETA|NIMS|HAZWOPER|MUTCD|NESC|IBB|IATSE|IBEW|UA|LIUNA|IUOE|IUPAT|SMART|BLET|BCTGM|CWA|IAFF|IAEP|IOMM&P|ILA|IBU|USW|IAM|SMWIA|CDC|NIOSH|FDA|USDA|HIPAA|ADA|ADHA|AAPD|CalCode|ABC|RBS|TTB|IWC|CGA|BCDC|RWQCB|NOAA|USFWS|UNITE HERE|SEIU|AFSCME|UFCW|ILWU)\b/g;

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

function grounding(r) {
  const cert = String(r.certification ?? "");
  const hits = new Set((cert.match(AUTHORITY) ?? []).concat(prose(r).match(AUTHORITY) ?? []));
  // Three or more distinct authorities named — a union, a regulator and a
  // consensus standard is the usual shape — is what a grounded station looks
  // like.
  return { score: clamp01(hits.size / 4), authorities: hits.size };
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

const WEIGHTS = { variety: 0.18, decisions: 0.2, explanation: 0.18, grounding: 0.14, feedback: 0.15, scene: 0.1, originality: 0.05 };
const results = [];

for (const { app, suite, r } of rooms) {
  const d = {
    variety: variety(r),
    decisions: decisions(r),
    explanation: explanation(r),
    grounding: grounding(r),
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
  results.push({ app, id: r.id, name: r.name ?? r.title ?? r.id, steps: r.steps.length, score: Math.round(total * 100), d });
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
  console.log("  score  station                    var  dec  exp  gnd  fbk  scn  org");
  for (const r of results) {
    const c = (k) => (r.d[k].score === null ? "  —" : String(Math.round(r.d[k].score * 100)).padStart(3));
    console.log(`   ${String(r.score).padStart(3)}   ${r.id.padEnd(24)} ${c("variety")} ${c("decisions")} ${c("explanation")} ${c("grounding")} ${c("feedback")} ${c("scene")} ${c("originality")}`);
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
      if (k === "feedback") return `${x.got}/${x.want} notes written`;
      if (k === "scene") return `${x.meshes} meshes, ${x.interactables} interactables`;
      return `${Math.round(x.similarity * 100)}% shared with ${x.nearest}`;
    };
    console.log(`  ${k.padEnd(12)} ${bar(worst[0].d[k].score)}  ${worst.map((r) => `${r.id} (${detail(r)})`).join("; ")}`);
  }
  console.log("\nThis is a ranking, not a gate. It is deliberately not in check_all —");
  console.log("a score wired into a build is a score people write content to satisfy.\n");
}
