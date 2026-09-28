/**
 * K-12 station extractor (console SCHOLAR-4): the inverse of gen_k12_station.
 *
 *     node tools/extract_k12_station.mjs <stationId> [...more] [--check]
 *
 * The fourteen K-12 stations SCHOLAR wrote by hand sit on the generator's own
 * template but have no JSON, so a scene or a step order cannot reach them.
 * This script loads the room headless (steps, hazards, interruptions, late
 * notes, name, tagline, badge) and reads back from the module text what the
 * loaded room does not carry: the labels and faces on the `bead(`/`card(`/
 * `dial(`/`meter(`/`token(`/`spot(`/`board(`/`hazardCard(` lines, the crew
 * names, the guide's three lines, the board's name, currency and ranks, the
 * floor and wall colours and the header comment. It writes
 * tools/k12-data/<slug>.json and proves the round trip: `gen(json)` must equal
 * the module, whitespace aside, or the script says where they differ and exits
 * non-zero. With --check it only proves the round trip and writes nothing.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmartCity } from "./lib/headless.mjs";
import { gen, ORDERS, CERT } from "./gen_k12_station.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");
const ids = args.filter((a) => !a.startsWith("--"));
if (!ids.length) { console.error("usage: extract_k12_station.mjs <stationId> [...more] [--check]"); process.exit(1); }

const STR = /"((?:[^"\\]|\\.)*)"/g;
const strings = (line) => [...line.matchAll(STR)].map((m) => JSON.parse(m[0]));
const slug = (t, n = 6) => t.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, n).join("-");
const norm = (s) => s.replace(/\s+/g, " ").trim();

/** The JSON file name: the station's distinguishing word, as the fourteen existing files are named. */
const FILE_NAMES = {
  "k12-measuring-and-scaling-the-court": "court", "k12-reading-a-map-scale-in-bay-world": "mapscale",
  "k12-fractions-in-the-kitchen": "kitchen", "k12-household-budget-and-first-paycheck": "budget",
  "k12-water-cycle-and-filtration": "water", "k12-buoyancy-and-pressure-in-the-deep": "buoyancy",
  "k12-energy-transfer-at-the-wind-farm": "energy", "k12-circuits-at-the-electrical-bench": "circuits",
  "k12-primary-and-secondary-sources": "sources", "k12-building-a-timeline-from-documents": "timeline",
  "k12-how-a-local-council-meeting-works": "council", "k12-reading-instructions-and-safety-labels": "labels",
  "k12-writing-a-clear-incident-report": "report", "k12-first-aid-awareness-call-for-help": "firstaid",
};

export function extract(r, src) {
  const lines = src.split("\n");
  // the controls, by their id, from the build() lines
  const ctl = new Map();
  for (const line of lines) {
    const m = line.match(/^\s+(?:(?:dials|meters|tokens|spots|boards)\[[^\]]+\] = )?(bead|card|hazardCard|dial|meter|token|spot|board)\(/);
    if (!m) continue;
    const s = strings(line);
    const kind = m[1];
    if (kind === "bead") ctl.set(s[0], { kind, label: s[1] });
    else if (kind === "card" || kind === "hazardCard") ctl.set(s[0], { kind, label: s[1], face: s[2] });
    else ctl.set(s[s.length - 2], { kind, label: s[s.length - 1] });
  }
  const checkinBoard = [...ctl.keys()].find((k) => k.endsWith("-checkin"));
  if (!checkinBoard) throw new Error(`${r.id}: no check-in board found`);
  const prefix = checkinBoard.slice(0, -"-checkin".length);
  const un = (key) => { if (!key.startsWith(prefix + "-")) throw new Error(`${r.id}: key ${key} lacks prefix ${prefix}`); return key.slice(prefix.length + 1); };
  const label = (key) => ctl.get(key)?.label ?? (() => { throw new Error(`${r.id}: no control ${key}`); })();

  const first = (re, what) => { const m = src.match(re); if (!m) throw new Error(`${r.id}: could not read ${what}`); return m; };
  const header = first(/^\/\/ SmartCiti\.X~ K-12 — (.*?)\. (.*)$/m, "the header comment");
  const game = first(/game: system\(\{\n\s+name: ("(?:[^"\\]|\\.)*"),\n\s+currency: ("(?:[^"\\]|\\.)*"),\n\s+ranks: (\[.*?\]),/, "the board");
  const floor = first(/tiles: 5, base: ("[^"]*"), base2: ("[^"]*")/, "the floor colours");
  const wall = first(/tiles: 6, base: ("[^"]*"), base2: ("[^"]*")/, "the wall colours");
  const guideStart = first(/text\(cx, w, h, "THE GUIDE", \[("(?:[^"\\]|\\.)*")\]/, "the guide's opening line");
  const guideHazard = first(/onHazard\(\) \{\n\s+paintGuide\(("(?:[^"\\]|\\.)*")\);/, "the guide's hazard line");
  const desk = src.match(/box\(desk, 0\.9, 0\.04, 0\.55, 0, 0\.74, 0, (\d+), \{ rough: 0\.6 \}\);/);
  const scene = /\/\/ a lab bench behind the station/.test(src) ? "lab" : /\/\/ a hall's stage behind the station/.test(src) ? "stage"
    : /\/\/ a working boat's deck/.test(src) ? "deck" : /\/\/ outdoors: a low wall/.test(src) ? "bench" : "wall";

  // steps, keyed by the generator's slot names through the order they appear in
  const kinds = r.steps.map((s) => s.kind).join(",");
  const SLOT_KIND = { find1: "find", select1: "select", seq: "sequence", hold: "hold", turn: "turn", gauge: "gauge", drag: "drag", select2: "select", find2: "find", track: "track", record: "select", share: "select", checkin: "select" };
  const order = Object.keys(ORDERS).find((o) => ORDERS[o].map((k) => SLOT_KIND[k]).join(",") === kinds);
  if (!order) throw new Error(`${r.id}: step kinds ${kinds} match none of the generator's orders`);
  const S = {};
  ORDERS[order].forEach((slot, i) => { S[slot] = r.steps[i]; });
  const withId = (step, out) => (slug(step.title) === step.id ? out : { id: step.id, ...out });
  const find = (st) => {
    const decoyKey = Object.keys(st.decoyNotes ?? {})[0];
    return withId(st, {
      title: st.title, cue: st.cue, why: st.why,
      items: st.targets.map((t) => [un(t), st.itemNames[t], st.itemNotes[t]]),
      decoy: [un(decoyKey), label(decoyKey), st.decoyNotes[decoyKey]],
    });
  };
  const sel = (st) => { const c = ctl.get(st.target); return withId(st, { title: st.title, cue: st.cue, why: st.why, key: un(st.target), label: c.label, face: c.face }); };
  const done = (st) => withId(st, { title: st.title, cue: st.cue, why: st.why, key: un(st.target), label: label(st.target), done: st.doneLine });
  const d = {
    id: r.id, index: r.index, prefix, accent: r.accentCss,
    floor: [JSON.parse(floor[1]), JSON.parse(floor[2])], wall: [JSON.parse(wall[1]), JSON.parse(wall[2])],
    trade: r.trade, header: header[2], name: r.name, tagline: r.tagline, badge: r.badge,
    board: { name: JSON.parse(game[1]), currency: JSON.parse(game[2]), ranks: JSON.parse(game[3]) },
    hazards: lines.filter((l) => /^\s+hazardCard\(/.test(l)).map((l) => { const [id, lab, face] = strings(l); return { id, label: lab, face, text: r.hazards[id] }; }),
    find1: find(S.find1),
    select1: sel(S.select1),
    seq: withId(S.seq, { title: S.seq.title, cue: S.seq.cue, why: S.seq.why, oon: S.seq.outOfOrderNote,
      items: S.seq.targets.map((t) => [un(t), S.seq.itemNames[t].replace(/^\d+ · /, "")]) }),
    hold: withId(S.hold, { title: S.hold.title, cue: S.hold.cue, why: S.hold.why, brk: S.hold.holdBreakNote, key: un(S.hold.target), label: label(S.hold.target) }),
    turn: withId(S.turn, { title: S.turn.title, cue: S.turn.cue, why: S.turn.why, key: un(S.turn.target), label: label(S.turn.target), dial: S.turn.turn.label }),
    gauge: withId(S.gauge, { title: S.gauge.title, cue: S.gauge.cue, why: S.gauge.why, key: un(S.gauge.target), label: label(S.gauge.target), meter: S.gauge.gauge.label, miss: S.gauge.gauge.missNote }),
    drag: withId(S.drag, { title: S.drag.title, cue: S.drag.cue, why: S.drag.why, key: un(S.drag.target), label: label(S.drag.target), spot: un(S.drag.drag.to), spotLabel: label(S.drag.drag.to), miss: S.drag.drag.missNote }),
    select2: sel(S.select2),
    find2: find(S.find2),
    track: withId(S.track, { title: S.track.title, cue: S.track.cue, why: S.track.why, brk: S.track.holdBreakNote, key: un(S.track.target), label: label(S.track.target), meter: S.track.track.label }),
    record: done(S.record),
    share: done(S.share),
    checkin: { title: S.checkin.title, cue: S.checkin.cue, why: S.checkin.why, label: label(checkinBoard) },
    interrupts: r.interrupts.map((it) => {
      const doneLine = src.match(new RegExp(`if \\(it\\.id === ${JSON.stringify(it.id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\) \\{.*?paintGuide\\(("(?:[^"\\\\]|\\\\.)*")\\); \\}`));
      if (!doneLine) throw new Error(`${r.id}: no done line for interruption ${it.id}`);
      return { id: it.id, kind: it.kind, key: un(it.target), label: label(it.target), alert: it.alert, cue: it.cue, why: it.why, miss: it.missNote, wrong: it.wrongNote, done: JSON.parse(doneLine[1]) };
    }),
    crew: lines.filter((l) => /^\s+holoTag\(g, "/.test(l) && /, -?3, 2\.1, /.test(l)).map((l) => strings(l)[0]),
    guide: { start: JSON.parse(guideStart[1]), after: null, hazard: JSON.parse(guideHazard[1]) },
    lateRecord: r.lateNotes[S.record.target], lateCheckin: r.lateNotes[checkinBoard],
    scene, order,
  };
  const after = src.match(new RegExp(`if \\(step\\.id === ${JSON.stringify(S.select2.id)}\\) paintGuide\\(("(?:[^"\\\\]|\\\\.)*")\\);`));
  if (!after) throw new Error(`${r.id}: no guide line after the second select`);
  d.guide.after = JSON.parse(after[1]);
  if (r.certification !== CERT) d.certification = r.certification;
  if (desk && Number(desk[1]) !== 0x5a7fb8) d.desk = "#" + Number(desk[1]).toString(16).padStart(6, "0");
  if (d.crew.length !== 4) throw new Error(`${r.id}: read ${d.crew.length} crew names, not four`);
  return d;
}

/** Where a regenerated module first differs from the original, whitespace aside; null when they match. */
export function roundTripDiff(d, src) {
  const a = norm(gen(d)), b = norm(src);
  if (a === b) return null;
  let i = 0; while (i < a.length && a[i] === b[i]) i++;
  return { at: i, regenerated: a.slice(Math.max(0, i - 80), i + 120), original: b.slice(Math.max(0, i - 80), i + 120) };
}

const city = await loadSmartCity();
let failed = 0;
for (const id of ids) {
  const r = city.ROOMS.find((x) => x.id === id);
  if (!r) { console.error(`${id}: not a SmartCiti.X station`); failed++; continue; }
  const modPath = join(ROOT, "WebXR/smartcity/js/sims", `${id}.js`);
  const src = readFileSync(modPath, "utf8");
  let d;
  try { d = extract(r, src); } catch (e) { console.error(`${id}: ${e.message}`); failed++; continue; }
  const diff = roundTripDiff(d, src);
  if (diff) {
    failed++;
    console.error(`${id}: the regenerated module differs at character ${diff.at}\n  regenerated: …${diff.regenerated}…\n  original:    …${diff.original}…`);
    continue;
  }
  const out = join(ROOT, "tools/k12-data", `${FILE_NAMES[id] ?? id.replace(/^k12-/, "")}.json`);
  if (checkOnly) console.log(`${id}: round trip holds (${d.prefix}, scene ${d.scene}, order ${d.order})`);
  else { writeFileSync(out, JSON.stringify(d, null, 2) + "\n"); console.log(`wrote ${out.replace(ROOT + "/", "")} — round trip holds (${d.prefix}, scene ${d.scene}, order ${d.order})`); }
}
process.exit(failed ? 1 : 0);
