#!/usr/bin/env node
// Generate docs/wiki/SmartCitiX-Training-Series.md from the SmartCiti.X
// catalog: one section per training programme with its union, the
// certifications it maps to, and a table of every station in it — index,
// name, trade, conditions, step and interruption counts — plus a spawn
// screenshot where docs/screenshots/smartcity holds one. Run after
// gen_catalog.mjs; never edit the page by hand.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(join(ROOT, "WebXR/smartcity/catalog.json"), "utf8"));
const SHOTS = join(ROOT, "docs/screenshots/smartcity");
const shots = new Set(existsSync(SHOTS) ? readdirSync(SHOTS) : []);
const byId = new Map(catalog.stations.map((s) => [s.id, s]));
let eval_ = null;
try { eval_ = JSON.parse(readFileSync(join(ROOT, "tools/eval-content.json"), "utf8")); } catch {}
const evalBy = new Map((eval_?.results ?? []).map((r) => [`${r.app}:${r.id}`, r.score]));

// The programmes the page leads with, in reading order; every other
// programme follows in catalog order.
const LEAD = [
  "hunters-point-bay-restoration", "ports-maritime-ecology", "air-quality-monitoring",
  "culinary-kitchen", "dental-hygiene-unspoken-smiles", "bartending-course",
];
const INTRO = {
  "hunters-point-bay-restoration": "The bay-restoration series stands every station on a generic shoreline beside a former shipyard under a federal cleanup order. It opens with a flat, sourced briefing on the Hunters Point Naval Shipyard Superfund site and then moves into the trades that do the work: radiological survey, soil load-out, sediment capping, pile removal, tide gates, living shorelines, eelgrass, oyster reef and marsh monitoring, invasive cordgrass removal.",
  "ports-maritime-ecology": "A container terminal and the water it sits beside: cranes and lashing gangs, shore power for a berthed ship, a fuel transfer with the deck contained, a spill boom worked against the current, ballast water sampled before discharge, a pilot brought aboard and lines taken at the berth.",
  "air-quality-monitoring": "Reading the air the crew works in: a site perimeter monitor, a mobile air lab run under wildfire smoke, a certified opacity reading, a stack test, landfill gas and dust control on the haul road.",
  "culinary-kitchen": "Fifteen stations in a working commercial kitchen for UNITE HERE Local 2 kitchen workers: knives, the slicer and the floor mixer; the fryer, the hood suppression system and the gas line; the cold chain from receiving dock to walk-in to two-stage cooling; the dish pit, the grease interceptor and allergen control; banquet hot-holding, cafeteria service and the grill line.",
  "dental-hygiene-unspoken-smiles": "A fifteen-station dental-hygienist series built for the Unspoken Smiles training programmes: the operatory turned over and instruments reprocessed, sharps exposure response, screening and radiographs, scaling, aerosol control and preventive care, nitrous oxide, chairside emergencies and amalgam waste, and the outreach van that brings the clinic to a school.",
  "bartending-course": "A full bartending course for UNITE HERE Local 2 bartenders and barbacks with the customers in it: opening the well, checking ID, pouring to spec, cutting off an intoxicated guest, responding to a spiked drink, de-escalating harassment, the keg cellar, glass in the ice well, line cleaning, the till and a robbery, allergens, last call, tips and the law, the workplace violence plan and a Responsible Beverage Service capstone.",
};

const md = [];
md.push("# SmartCiti.X training series");
md.push("");
md.push(`_Generated from \`WebXR/smartcity/catalog.json\` by \`tools/gen_wiki.mjs\` on ${new Date().toISOString().slice(0, 10)}. ${catalog.stations.filter((s) => s.app === "smartcity").length} SmartCiti.X stations across ${new Set(catalog.stations.filter((s) => s.app === "smartcity").map((s) => s.category)).size} categories and ${catalog.curricula.length} programmes; the Trade Skills rooms the programmes also draw on are listed in their own README._`);
md.push("");
md.push("Every station is a real union procedure sited generically, built on the shared engine's eight step kinds (select, sequence, find, gauge, hold, track, turn, drag), with four scored hazards and two interruptions that must be noticed and answered while the hands are busy. Stations are driven end to end in a headless browser and pass twenty-three checkers before they ship; the content evaluation in `tools/eval_content.mjs` grades each one on variety, decisions, explanation, grounding, feedback, scene and originality.");
md.push("");
md.push("## Contents");
md.push("");
const order = [...LEAD.map((id) => catalog.curricula.find((p) => p.id === id)).filter(Boolean), ...catalog.curricula.filter((p) => !LEAD.includes(p.id))];
for (const p of order) md.push(`- [${p.name}](#${p.id})`);
md.push("");

for (const p of order) {
  md.push(`<a id="${p.id}"></a>`);
  md.push(`## ${p.name}`);
  md.push("");
  if (INTRO[p.id]) { md.push(INTRO[p.id]); md.push(""); }
  md.push(`**Union:** ${p.union}`);
  md.push("");
  md.push(`**Certifications and standards:** ${p.certification}`);
  md.push("");
  md.push(p.summary);
  md.push("");
  md.push("| # | Station | Trade | Conditions | Steps | Interrupts | Eval | Why it is in the programme |");
  md.push("|---|---|---|---|---|---|---|---|");
  const shotRows = [];
  for (const e of p.stations) {
    if (e.app !== "smartcity") {
      md.push(`| — | Trade Skills: ${e.id} | — | — | — | — | ${evalBy.get(`trades:${e.id}`) ?? "—"} | ${e.why} |`);
      continue;
    }
    const s = byId.get(e.id);
    if (!s) continue;
    const cond = s.indoor ? `indoor (${s.indoor})` : (s.district ? `${s.weather}, ${s.district}` : s.weather);
    md.push(`| ${s.index} | [${s.name}](../../WebXR/${s.deepLink}) | ${s.trade} | ${cond} | ${s.steps} | ${s.interrupts} | ${evalBy.get(`smartcity:${s.id}`) ?? "—"} | ${e.why} |`);
    const f = `${s.id}_spawn.png`;
    if (shots.has(f)) shotRows.push({ s, f });
  }
  md.push("");
  if (shotRows.length) {
    md.push("<table>");
    for (let i = 0; i < shotRows.length; i += 2) {
      const pair = shotRows.slice(i, i + 2);
      md.push("<tr>" + pair.map(({ s, f }) => `<td width="50%"><img src="../screenshots/smartcity/${f}" alt="${s.name} from the learner's spawn point" width="100%"><br><b>${s.name}</b> — ${s.tagline}</td>`).join("") + "</tr>");
    }
    md.push("</table>");
    md.push("");
  }
}

md.push("## How a station is verified");
md.push("");
md.push("1. `node tools/check_all.mjs` — twenty-three checkers: parse, imports, layout (every control reachable, crew figures clear of the work), budget (mesh count per headset frame), interruptions (each one fires, times out, scores and visibly changes the scene), crew roles, incident replay, curricula resolution, catalog freshness.");
md.push("2. `python3 tools/bundle_webxr.py` — the single-file bundle the headset loads.");
md.push("3. A headless Chromium drive of every step, with both interruptions answered, and a screenshot from the spawn point that someone actually looks at.");
md.push("4. `node tools/eval_content.mjs` — the graded content review, used as the heartbeat between waves of stations rather than as a gate.");
md.push("");

mkdirSync(join(ROOT, "docs/wiki"), { recursive: true });
const out = join(ROOT, "docs/wiki/SmartCitiX-Training-Series.md");
writeFileSync(out, md.join("\n") + "\n");
console.log(`Wrote ${out} (${order.length} programmes, ${shotRows_total(order)} screenshots)`);
function shotRows_total(ps) { let n = 0; for (const p of ps) for (const e of p.stations) if (shots.has(`${e.id}_spawn.png`)) n++; return n; }
