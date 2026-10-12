// ECOSYSTEM — the blocks bridge (docs/ecosystem.md, docs/consoles/ECOSYSTEM.md).
//
// Maps this platform's union and trade stations (WebXR/packs/*.json, kinds "union" and "programme" with audience "trades")
// and the robotics programme's adult skills (rp-programme-data.js: each track at the operator, technician, integrator and
// AI-training levels) to Cognition.X blocks by DECLARED rules. Cognition.X (github.com/agifuturefoundation/cognition.x,
// commit 47c1820) is Apache-2.0 for code and CC BY 4.0 for content; the matched blocks are committed as a small attributed
// extract in eco-blocks-data.js, written by tools/eco_extract.mjs. Nothing here fetches anything.
//
// The rules (ECO_RULES) are the whole matcher. A rule fires on a station when its `station` pattern matches the station's id
// and name; it offers the blocks of its packs, in an ADULT band only (ECO_ADULT_BANDS), whose theme, credential or
// description match its `block` pattern; candidates are ranked by shared words with the station, ties broken by block id,
// and the top ECO_TOP are kept. A rule may admit a school band only by naming it in `k12Band` with a `k12Reason`; no rule
// does today, and tools/check_eco.mjs fails if a non-adult block reaches an adult path without one.
//
// Pure functions and data, no imports beyond the generated data module. Every top-level name is prefixed eco/ECO_.

import { ECO_BLOCKS_DATA } from "./eco-blocks-data.js";

export const ECO_SOURCE = { repo: "agifuturefoundation/cognition.x", commit: "47c18207bd2ef3295c66fac80aa7005bd8a7f6b9", file: "data/blocks.csv" };
export const ECO_ADULT_BANDS = ["11–12 · adult", "9–12 · adult"];
export const ECO_TOP = 3;

const ECO_TRADE = ["Trade School"];
const ECO_ROBOT = ["Cognition.X : Robotics OS"];

/** The declared rules, in order. `station` and `block` are case-insensitive regular-expression sources; `station` is matched at word starts against the station id and name with hyphens as spaces. */
export const ECO_RULES = [
  { id: "robot-cell", station: "robot|cobot|amr|teach pendant|palletizer cell|rp |rt ",
    packs: ECO_ROBOT, block: "safety|troubleshoot|error recovery|incident|operator|maintenance|integration testing|configuration" },
  { id: "electrical", station: "electric|wire|wireman|panel|isolation|lineman|line work|arc flash|switchgear|conduit|substation|transformer|battery|solar|ev charg|meter|grid",
    packs: ECO_TRADE, block: "electric|circuit|motor|wiring|plc|lock-out|clearance" },
  { id: "lockout", station: "lockout|loto|tagout|hazardous energy|zero energy|isolation",
    packs: ECO_TRADE, block: "lock-out|clearance|motor|controls" },
  { id: "welding", station: "weld|hot work|torch|oxy|plasma cut|brazing|fabricat|ironwork|steel erect|boilermaker",
    packs: ECO_TRADE, block: "weld|smaw|gmaw|fcaw|fabrication|blueprint|shipfitting" },
  { id: "pipe", station: "pipe|plumb|backflow|sprinkler|steamfit|gas line|water main|sewer|rough in|valve",
    packs: ECO_TRADE, block: "pipe|joining|isometric|fluid power|process systems" },
  { id: "hvac", station: "hvac|refrigera|chiller|boiler|cooling|duct|air handl|heat pump|stationary",
    packs: ECO_TRADE, block: "refrigeration|hvac|chiller|airflow|electrical for hvac" },
  { id: "rigging", station: "rig |rigging|crane|hoist|lift|signal|tower crane|load ",
    packs: ECO_TRADE, block: "rigging|signal|lift|equipment systems" },
  { id: "equipment", station: "excavat|trench|dozer|loader|forklift|operator|equipment|yard|haul|paving|grader|backhoe|skid",
    packs: ECO_TRADE, block: "equipment|simulator|yard|heavy" },
  { id: "process", station: "process|chemical|refinery|plant|tank|instrument|cryogen|ammonia|psm|confined",
    packs: ECO_TRADE, block: "process|instrumentation|cryogenic" },
  { id: "marine", station: "port |ports |marine|vessel|ship|drydock|longshore|crane gang|ballast|maritime|harbor|barge|dive|underwater",
    packs: ECO_TRADE, block: "vessel|shipfitting|port|marine|coastal" },
  { id: "it-ot", station: "network|telecom|fiber|cyber|data center|server|deploy bay|cloud|scada|ot ",
    packs: ECO_TRADE, block: "network|cloud|cyber|hardware|it practicum" },
  { id: "drone", station: "drone|uas|survey|aerial map|lidar",
    packs: ECO_TRADE, block: "flight|airspace|sensors|survey|uas|telemetry" },
  { id: "biomed", station: "biomed|medical device|calibrat|clinical eng|sterile|imaging",
    packs: ECO_TRADE, block: "device calibration|metrology|clinical systems|healthcare environment|biomed" },
  { id: "site-safety", station: "fall |falls |scaffold|ladder|harness|silica|excavation|trench|ppe|site|confined space|hazwoper|hazmat",
    packs: ECO_TRADE, block: "clearance|safety|equipment systems" },
  { id: "automation", station: "conveyor|press brake|cnc|palletiz|machine guard|automation|mechatronic|packaging line|sorter",
    packs: ECO_TRADE, block: "plc|automation|mechatronic|mechanical systems|motors" },
];

/** The robotics programme's tracks → the words that pick their blocks (one declared rule per track, all Robotics OS, adult). */
export const ECO_RP_RULES = {
  "industrial-cells": "safety|incident|error recovery|troubleshoot|maintenance",
  cobots: "human factors|ergonomic|safety|interaction|operator",
  "mobile-amr": "fleet|network|deployment|site preparation|capacity|safety",
  "construction-robotics": "deployment|site preparation|risk|safety|integration",
  "maintenance-lockout": "maintenance|troubleshoot|error recovery|spare parts|backup|lockout",
  "data-ai-training": "data|analytics|benchmark|performance|quality metrics|privacy",
};
export const ECO_RP_ADULT_LEVELS = ["operator", "technician", "integrator", "ai-training"];
const ECO_LEVEL_WORDS = { operator: "operator training user", technician: "maintenance troubleshoot repair", integrator: "integration testing configuration compliance", "ai-training": "data analytics benchmark performance" };

const ECO_STOP = new Set("a an and the of to in on for with at by from or as is are be your you it its this that into over under one".split(" "));
/** Lower-case word tokens, stop words and 1–2 letter tokens removed, light plural stem. Deterministic. */
export function ecoTokens(text) {
  return String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ")
    .filter((w) => w.length > 2 && !ECO_STOP.has(w)).map((w) => (w.length > 4 && w.endsWith("s") ? w.slice(0, -1) : w));
}

export function ecoIsAdultBand(grade) { return ECO_ADULT_BANDS.includes(String(grade)); }

/** Station text with every non-letter as a space, so patterns match at word starts ("weld" matches "welding", not "meter" in "perimeter"). */
export function ecoHay(text) { return ` ${String(text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ")} `; }
export function ecoStationRe(rule) { return new RegExp(`\\b(?:${rule.station})`, "i"); }

function ecoBlockText(b) { return `${b.theme} ${b.credential} ${b.description}`; }

/** Rank one rule's candidate blocks for a text. Returns block ids, best first. */
export function ecoRank(text, blocks, rule, k = ECO_TOP) {
  const re = new RegExp(rule.block, "i");
  const want = new Set(ecoTokens(text));
  const rows = [];
  for (const b of blocks) {
    if (!rule.packs.includes(b.pack)) continue;
    const bandOk = ecoIsAdultBand(b.grade) || (rule.k12Band && rule.k12Reason && b.grade === rule.k12Band);
    if (!bandOk) continue;
    if (!re.test(ecoBlockText(b))) continue;
    let score = 0;
    for (const w of new Set(ecoTokens(ecoBlockText(b)))) if (want.has(w)) score += 1;
    rows.push({ id: b.block_id, score });
  }
  rows.sort((x, y) => y.score - x.score || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0));
  return rows.slice(0, k).map((r) => r.id);
}

/**
 * Match stations ({ id, name, pack }) to blocks. The first rule whose station pattern matches decides (rules are ordered,
 * so the result never depends on object order). Returns { matched: [{ station, name, rule, blocks }], unmatched: [{ station, name, why }] }.
 */
export function ecoMatchStations(stations, blocks, rules = ECO_RULES, k = ECO_TOP) {
  const matched = [], unmatched = [];
  const sorted = stations.slice().sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const s of sorted) {
    const hay = ecoHay(`${s.id} ${s.name}`);
    const hits = rules.filter((r) => ecoStationRe(r).test(hay));
    if (!hits.length) { unmatched.push({ station: s.id, name: s.name, why: "no rule's station pattern matches" }); continue; }
    let done = false;
    for (const r of hits) {
      const ids = ecoRank(`${s.id.replace(/-/g, " ")} ${s.name}`, blocks, r, k);
      if (ids.length) { matched.push({ station: s.id, name: s.name, rule: r.id, blocks: ids }); done = true; break; }
    }
    if (!done) unmatched.push({ station: s.id, name: s.name, why: `rule ${hits[0].id} found no adult block` });
  }
  return { matched, unmatched };
}

/** The robotics programme's adult skills (track × level) to Robotics OS adult blocks. The awareness / K-12 level is never mapped. */
export function ecoMatchSkills(tracks, blocks, k = ECO_TOP) {
  const matched = [], unmatched = [], excluded = [];
  for (const t of tracks) {
    for (const lv of Object.keys(t.levels ?? {})) {
      const skill = `${t.id}/${lv}`;
      if (!ECO_RP_ADULT_LEVELS.includes(lv)) { excluded.push({ skill, why: "awareness / K-12 level: adults-only bridge" }); continue; }
      const words = ECO_RP_RULES[t.id];
      if (!words) { unmatched.push({ skill, why: "no declared rule for this track" }); continue; }
      const rule = { id: `rp-${t.id}`, packs: ECO_ROBOT, block: words };
      const ids = ecoRank(`${t.title} ${t.kinds ?? ""} ${ECO_LEVEL_WORDS[lv]}`, blocks, rule, k);
      if (ids.length) matched.push({ skill, rule: rule.id, blocks: ids }); else unmatched.push({ skill, why: `rule ${rule.id} found no adult block` });
    }
  }
  return { matched, unmatched, excluded };
}

/** Read-only lookup for the instructor console: "next blocks for this skill" (a station id or a track/level skill). */
export function ecoNextBlocks(key, data = ECO_BLOCKS_DATA) {
  if (!data) return [];
  const row = (data.stations ?? []).find((m) => m.station === key) ?? (data.skills ?? []).find((m) => m.skill === key);
  if (!row) return [];
  const byId = new Map((data.blocks ?? []).map((b) => [b.block_id, b]));
  return row.blocks.map((id) => byId.get(id)).filter(Boolean);
}

/** The instructor console's Ecosystem tab: read-only, plain DOM, no storage, no request. */
export function ecoMountBlocksPanel(root, { doc = globalThis.document, data = ECO_BLOCKS_DATA } = {}) {
  if (!root || !doc || !data) return null;
  const el = (tag, cls, text) => { const n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  root.textContent = "";
  root.append(el("h3", null, "Next blocks for this skill (Cognition.X)"));
  root.append(el("p", "muted", `${data.provenance.attribution} Read-only: ${data.stations.length} stations and ${data.skills.length} robotics skills matched by declared rules; ${data.unmatchedCount} unmatched (listed in docs/ecosystem/blocks-match.json). Adult bands only.`));
  const pick = el("select"); pick.setAttribute("aria-label", "Station or robotics skill");
  for (const s of data.skills) pick.append(Object.assign(el("option", null, `Robotics programme · ${s.skill}`), { value: s.skill }));
  for (const s of data.stations) pick.append(Object.assign(el("option", null, `${s.name} (${s.station})`), { value: s.station }));
  const list = el("ol");
  const draw = () => {
    list.textContent = "";
    for (const b of ecoNextBlocks(pick.value, data)) {
      const li = el("li");
      li.append(el("strong", null, `${b.block_id} · ${b.theme}`), el("div", "muted", `${b.pack} · ${b.grade} · ${b.credential}`), el("div", null, `Transfer check: ${b.transfer_check}`));
      list.append(li);
    }
  };
  pick.addEventListener("change", draw);
  root.append(pick, list);
  draw();
  return { pick, list, redraw: draw };
}
