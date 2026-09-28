#!/usr/bin/env node
// Generates WebXR/shared/treasures-data.js — the hidden treasures and easter
// eggs that run through the whole platform (console TREASURE,
// tools/briefs/frontier-brief.md, docs/treasures.md).
//
// Nothing here is invented. Every treasure's lesson is a string lifted
// verbatim from one of the repository's own sources, and carries a `source`
// the checker (tools/check_treasures.mjs) re-reads to prove it:
//
//   tools/unions.json      a union's own registry note (the "union history line")
//   tools/standards.json   a standard's own registry title
//   WebXR/smartcity/js/curricula.js   a station's own `why` line
//   WebXR/shared/toolkit.js           a trade tool's own name (TOOLKIT_BUDGET note)
//   WebXR/arcade/js/games/*.js        a cabinet's own "what this teaches" line
//   a station's own sim file          (the tool crib line)
//
// Places come from the worlds' own data (BAY_SITES, DEEP_SITES, RG_COURSES,
// FAIRWAY_HOLES), so a treasure always sits at a real spot in a real world.
// Bay World's 24 easter-egg field notes (tools/gen_bay_quests.mjs) sit at the
// 28 public landmarks and The Deep's lantern eggs sit two metres off its
// landmarks; treasures sit at the training SITES instead, so the two layers
// never share a spot.
//
//   node tools/gen_treasures.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const imp = (p) => import(path.join(ROOT, p));

const { CURRICULA } = await imp("WebXR/smartcity/js/curricula.js");
const { BAY_SITES, BAY_ZONES } = await imp("WebXR/shared/bayworld-data.js");
const { DEEP_SITES, DEEP_ZONES } = await imp("WebXR/shared/underwater-data.js");
const { RG_COURSES } = await imp("WebXR/regatta/js/courses.js");
const { FAIRWAY_HOLES } = await imp("WebXR/shared/fairway-data.js");
const UNIONS = JSON.parse(rd("tools/unions.json")).unions;
const STANDARDS = JSON.parse(rd("tools/standards.json")).standards;
const CURR_SRC = rd("WebXR/smartcity/js/curricula.js");
const TOOLKIT_SRC = rd("WebXR/shared/toolkit.js");

// ------------------------------------------------------------ lesson sources

/** Every station why, first occurrence per station, only those that appear verbatim in the source. */
const WHY = new Map();
for (const c of CURRICULA) for (const s of c.stations) {
  if (WHY.has(s.id) || typeof s.why !== "string") continue;
  if (!CURR_SRC.includes(`"${s.why}"`)) continue; // an escaped literal would not re-read verbatim
  WHY.set(s.id, { app: s.app, why: s.why, programme: c.id });
}
const used = new Set();
function whyLesson(stationId) {
  const w = WHY.get(stationId);
  if (!w) return null;
  return { lesson: w.why, source: { file: "WebXR/smartcity/js/curricula.js", station: stationId } };
}
/** The first unused station why matching `re` (on its id or its text), for a themed lesson. */
function pickWhy(re, { app = null } = {}) {
  for (const [id, w] of WHY) {
    if (used.has(`why:${id}`)) continue;
    if (app && w.app !== app) continue;
    if (re.test(id) || re.test(w.why)) { used.add(`why:${id}`); return { ...whyLesson(id), station: id }; }
  }
  for (const [id, w] of WHY) { // themed pool exhausted: any unused line
    if (used.has(`why:${id}`) || (app && w.app !== app)) continue;
    used.add(`why:${id}`); return { ...whyLesson(id), station: id };
  }
  throw new Error(`no station why left for ${re}`);
}
function unionLesson(id) {
  const u = UNIONS.find((x) => x.id === id);
  if (!u || !u.note) throw new Error(`union ${id} has no registry note`);
  return { lesson: u.note, source: { file: "tools/unions.json", union: id }, unionName: u.name, unionAbbrev: u.abbrev };
}
function standardLesson(id) {
  const s = STANDARDS.find((x) => x.id === id);
  if (!s) throw new Error(`standard ${id} missing`);
  return { lesson: s.title, source: { file: "tools/standards.json", standard: id } };
}
function toolName(key) {
  const m = TOOLKIT_SRC.match(new RegExp(`\\b${key}: \\{ build: "${key}"[^\\n]*note: "([^"]+)"`));
  if (!m) throw new Error(`toolkit ${key} has no note`);
  return { tool: m[1], toolSource: { file: "WebXR/shared/toolkit.js", tool: key } };
}
function teachesLesson(file, constName) {
  const src = rd(file);
  const m = src.match(new RegExp(`export const ${constName} = "([^"]+)";`));
  if (!m) throw new Error(`${file} has no ${constName}`);
  return { lesson: m[1], source: { file, const: constName } };
}
function sentenceFrom(file, needle) {
  const src = rd(file);
  const m = src.match(new RegExp(`"([^"]*${needle}[^"]*)"`));
  if (!m) throw new Error(`${file} has no line with ${needle}`);
  return { lesson: m[1], source: { file, text: true } };
}

const zoneName = (zones, id) => zones.find((z) => z.id === id)?.name ?? id;
const xz = (p) => [p[0], p.length >= 3 ? p[2] : p[1]];
const round = (v) => Math.round(v * 10) / 10;

const T = [];
function add(t) {
  if (T.some((x) => x.id === t.id)) throw new Error(`duplicate treasure ${t.id}`);
  T.push({ set: null, gate: null, ...t });
}

// ------------------------------------------------------------ the homepage

add({ id: "tz-home-constellation", name: "The Seven-Star Crane", surface: "home", world: "Homepage", area: "Hero",
  set: "front-door", how: "constellation", trigger: { anchor: "#hero", stars: 7 },
  hint: "Seven faint stars in the hero light up one at a time.", reveal: "star", ...unionLesson("ilwu") });
add({ id: "tz-home-konami", name: "The Old Code, Upside Down", surface: "home", world: "Homepage", area: "Keyboard",
  set: "front-door", how: "keys", trigger: { seq: ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp", "ArrowRight", "ArrowLeft", "ArrowRight", "ArrowLeft", "b", "a"] },
  hint: "The old cheat code opens the racer. Try it upside down and back to front.", reveal: "key", ...standardLesson("ansi-z535-4") });
add({ id: "tz-home-logo7", name: "Seven Knocks", surface: "home", world: "Homepage", area: "Brand line",
  set: "front-door", how: "clicks", trigger: { anchor: ".brandline", count: 7, within: 4000 },
  hint: "Knock on the brand line seven times.", reveal: "knock", ...unionLesson("ibew") });
add({ id: "tz-home-lockout", name: "Say the Word", surface: "home", world: "Homepage", area: "Keyboard",
  how: "keys", trigger: { word: "lockout" },
  hint: "Type the word every electrician says before touching anything.", reveal: "key", ...standardLesson("osha-1910-147") });
add({ id: "tz-home-hardhat", name: "Tap the Counter", surface: "home", world: "Homepage", area: "Footer",
  how: "clicks", trigger: { anchor: "#hardhat-count", count: 3, within: 3000 },
  hint: "The hard hat counter likes to be tapped.", reveal: "hat", ...unionLesson("liuna") });
add({ id: "tz-home-glint", name: "Catalog Glint", surface: "home", world: "Homepage", area: "Catalog",
  how: "glint", trigger: { anchor: "#catalog" },
  hint: "Something glints beside the station catalog.", reveal: "glint", ...unionLesson("iuoe") });

// ------------------------------------------------------------ the Guide

const LORE = ["ilwu", "ibu", "ironworkers", "iatse", "carpenters", "ua", "teamsters", "seiu", "unite-here", "usw", "meba", "siu"];
for (const u of LORE) {
  const L = unionLesson(u);
  add({ id: `tz-guide-lore-${u}`, name: `Registry Lore: ${L.unionAbbrev ?? L.unionName}`, surface: "guide", world: "The Guide", area: "Secret questions",
    set: "registry-lore", how: "guide", trigger: { words: ["secret", "lore", "legend"], names: [L.unionAbbrev, L.unionName].filter(Boolean).map((s) => s.toLowerCase()) },
    hint: `Ask the Guide for the secret, the lore or the legend of ${L.unionAbbrev ?? L.unionName}.`, reveal: "scroll", ...L });
}

// ------------------------------------------------------------ Trade Skills rooms

const ROOMS = [...rd("WebXR/shared/links.js").match(/LK_TRADES_ROOMS = Object\.freeze\(\[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
ROOMS.forEach((room, i) => {
  const a = (i * 2.1) % (Math.PI * 2);
  const L = whyLesson(room) ?? pickWhy(new RegExp(room.split("-")[0], "i"));
  if (whyLesson(room)) used.add(`why:${room}`);
  add({ id: `tz-trades-${room}`, name: `Bench Mark: ${room.replace(/-/g, " ")}`, surface: "trades", world: "Trade Skills", area: room.replace(/-/g, " "),
    set: "every-bench", how: "plant", trigger: { host: `trades/${room}`, pos: [round(Math.cos(a) * 1.5), 1.0, round(Math.sin(a) * 1.5)] },
    hint: "A small brass mark hides in every Trade Skills room.", reveal: "glint", lesson: L.lesson, source: L.source });
});

// ------------------------------------------------------------ the station runner

const TOOLS = [
  ["torqueWrench", /torque|bolt/i], ["fourGasMeter", /atmospher|gas|monitor/i], ["multimeter", /live-dead-live|voltage|meter/i],
  ["tagLine", /tag line|load|lift/i], ["chock", /chock|wheel|trailer/i], ["radio", /radio|read-back|signal/i],
  ["flashlight", /dark|night|light/i], ["tapeMeasure", /measure|distance|clearance/i], ["level", /level|square|plumb/i],
  ["tieDownStrap", /strap|secure|cargo/i], ["hoseReel", /hose|air|pressure/i], ["teachPendant", /robot|pendant|automation/i],
];
TOOLS.forEach(([key, re], i) => {
  const L = pickWhy(re, { app: "smartcity" });
  const a = (i * 1.7) % (Math.PI * 2);
  add({ id: `tz-runner-tool-${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`, name: `Left Behind: ${toolName(key).tool}`, surface: "runner", world: "Station runner", area: "Hidden tools",
    set: "tool-crib", how: "plant", trigger: { host: `smartcity/${L.station}`, pos: [round(Math.cos(a) * 2.2), 0.9, round(Math.sin(a) * 2.2)] },
    hint: "Somebody left a tool behind at one station. Return it to the crib.", reveal: "tool", ...toolName(key), lesson: L.lesson, source: L.source,
    gate: i === 5 ? { stations: [L.station], note: "This tool only turns up once you have passed the station it was left at." } : null });
});
add({ id: "tz-runner-tool-crib", name: "The Tool Crib", surface: "runner", world: "Station runner", area: "Tool crib",
  set: "tool-crib", how: "plant", trigger: { host: "smartcity/hazwoper-site-orientation", pos: [-2.0, 0.9, 1.6] },
  hint: "The support zone has a crib. Something in it is not on the list.", reveal: "tool", ...toolName("hardHatLamp"),
  ...sentenceFrom("WebXR/smartcity/js/sims/hazwoper-site-orientation.js", "the tool crib") });
add({ id: "tz-runner-perfect", name: "Perfect Run", surface: "runner", world: "Station runner", area: "Records",
  how: "records", trigger: { rule: "perfect" },
  hint: "Three stars, no correction, nothing unsafe — once, anywhere.", reveal: "star", ...standardLesson("osha-1904") });

// ------------------------------------------------------------ the Atlas

const ATLAS = [["#atlas-map", "Map edge"], ["#atlas-detail", "Detail card"], ["#atlas-list", "Site list"], ["#atlas-search", "Search"], ["#atlas-count", "Counter"]];
const ATLAS_U = ["cwa", "atu", "smart-td", "blet", "twu"];
ATLAS.forEach(([anchor, area], i) => add({ id: `tz-atlas-${i + 1}`, name: `Cartographer's Mark ${i + 1}`, surface: "atlas", world: "The Atlas", area,
  set: "cartographer", how: "glint", trigger: { anchor }, hint: "The Atlas hides five marks around its own chrome.", reveal: "glint", ...unionLesson(ATLAS_U[i]) }));

// ------------------------------------------------------------ the arcade and the racer

const CABS = [["spoolyard", "spoolyard.js", "SY_TEACHES"], ["crewrun", "crewrun.js", "CR_TEACHES"], ["palletstacker", "palletstacker.js", "PS_TEACHES"], ["forkliftaisle", "forkliftaisle.js", "FA_TEACHES"]];
for (const [id, file, c] of CABS) add({ id: `tz-arcade-${id}`, name: `Cabinet Token: ${id}`, surface: "arcade", world: "Break Room Arcade", area: "Cabinets",
  set: "cabinet-regular", how: "arcade", trigger: { cabinet: id }, hint: "Every cabinet drops one token the first time you finish a round on it.", reveal: "coin",
  ...teachesLesson(`WebXR/arcade/js/games/${file}`, c) });
add({ id: "tz-arcade-glint", name: "Under the Change Machine", surface: "arcade", world: "Break Room Arcade", area: "Menu",
  how: "glint", trigger: { anchor: "main, body" }, hint: "Look under the menu.", reveal: "coin", ...unionLesson("bctgm") });
add({ id: "tz-arcade-glint-2", name: "Break Room Notice", surface: "arcade", world: "Break Room Arcade", area: "Notice board",
  how: "glint", trigger: { anchor: "footer, body" }, hint: "The break room has a notice board.", reveal: "glint", ...unionLesson("ufcw") });

const TRACK_IDS = [...rd("WebXR/race/js/tracks.js").matchAll(/import \{ (TRACK_[A-Z_]+) \} from "\.\.\/tracks\/([a-z-]+)\.js"/g)].map((m) => m[2]);
for (const id of TRACK_IDS) {
  const L = pickWhy(/driv|truck|haul|forklift|traffic|road|lane/i);
  const src = rd(`WebXR/race/tracks/${id}.js`);
  const trackId = src.match(/\bid: "([^"]+)"/)?.[1] ?? id;
  add({ id: `tz-race-${id}`, name: `Finish Line: ${id.replace(/-/g, " ")}`, surface: "race", world: "Night Highway Circuit", area: "Courses",
    set: "every-course", how: "race", trigger: { track: trackId }, hint: "Finish a race on every course.", reveal: "flag", lesson: L.lesson, source: L.source });
}
add({ id: "tz-race-glint", name: "Pit Wall Glint", surface: "race", world: "Night Highway Circuit", area: "Menu",
  how: "glint", trigger: { anchor: "main, body" }, hint: "Something glints on the pit wall.", reveal: "glint", ...unionLesson("teamsters") });

// ------------------------------------------------------------ Bay World

const WATER = new Set(["port", "estuary-waterfront", "island-harbour", "north-shoreline", "south-shoreline", "outer-bay"]);
const BELL_UNIONS = ["ilwu", "ibu", "meba", "siu", "carpenters", "iuoe", "ironworkers"];
const waterSites = BAY_SITES.filter((s) => WATER.has(s.zone));
const landSites = BAY_SITES.filter((s) => !WATER.has(s.zone));
waterSites.slice(0, 7).forEach((s, i) => {
  const [x, z] = xz(s.position);
  add({ id: `tz-bay-bell-${i + 1}`, name: `Harbour Bell ${i + 1}`, surface: "bayworld", world: "Bay World", area: zoneName(BAY_ZONES, s.zone),
    set: "harbour-bells", how: "proximity", trigger: { world: "bayworld", x: round(x + 9), z: round(z - 7), r: 7 },
    hint: "Seven bells hang along the waterfront. Walk up and ring each.", reveal: "bell", ...unionLesson(BELL_UNIONS[i]) });
});
const baySpread = [];
for (let i = 0; i < landSites.length && baySpread.length < 17; i += Math.max(1, Math.floor(landSites.length / 17))) baySpread.push(landSites[i]);
baySpread.forEach((s, i) => {
  const [x, z] = xz(s.position);
  const st = (s.stations ?? []).find((id) => WHY.has(id) && !used.has(`why:${id}`));
  if (st) used.add(`why:${st}`);
  const L = st ? { ...whyLesson(st), station: st } : pickWhy(/./);
  add({ id: `tz-bay-${s.id}`, name: `Crew Cache: ${s.name}`, surface: "bayworld", world: "Bay World", area: zoneName(BAY_ZONES, s.zone),
    set: i < 6 ? "crew-caches" : null, how: "proximity", trigger: { world: "bayworld", x: round(x - 8), z: round(z + 8), r: 6 },
    hint: "Crews tuck a cache near their site. Walk the sites.", reveal: "chest", lesson: L.lesson, source: L.source,
    gate: i % 5 === 2 && st ? { stations: [st], note: `The ${s.name} crew keeps this cache for people who have done the job there.` } : null });
});

// ------------------------------------------------------------ the Deep

const deepSpread = [];
for (let i = 0; i < DEEP_SITES.length && deepSpread.length < 16; i += Math.max(1, Math.floor(DEEP_SITES.length / 16))) deepSpread.push(DEEP_SITES[i]);
deepSpread.forEach((s, i) => {
  const [x, z] = xz(s.position);
  const st = (s.stations ?? []).find((id) => WHY.has(id) && !used.has(`why:${id}`));
  if (st) used.add(`why:${st}`);
  const L = st ? { ...whyLesson(st), station: st } : pickWhy(/div|diver|umbilical|scuba/i);
  add({ id: `tz-deep-${s.id}`, name: `Sea Glass: ${s.name}`, surface: "deep", world: "The Deep", area: zoneName(DEEP_ZONES, s.zone),
    set: "sea-glass", how: "proximity", trigger: { world: "underwater", x: round(x - 6), z: round(z - 6), r: 6 },
    hint: "Sea glass settles near the dive sites, never at the lanterns.", reveal: "glass", lesson: L.lesson, source: L.source,
    gate: i % 5 === 1 && st ? { stations: [st], note: `Dive the ${s.name} station first; this one sits in water you have to be trained for.` } : null });
});

// ------------------------------------------------------------ the Regatta

for (const c of RG_COURSES) c.marks.forEach((m) => {
  const L = pickWhy(/boat|vessel|life jacket|deck|mooring|sail|water/i);
  add({ id: `tz-regatta-${m.id}`, name: `Pennant ${m.id.toUpperCase()}`, surface: "regatta", world: "The Regatta", area: c.name,
    set: "pennants", how: "proximity", trigger: { world: "regatta", x: round(m.x + 12), z: round(m.z + 12), r: 18 },
    hint: "A pennant flies off every rounding mark. Sail close past each one.", reveal: "flag", lesson: L.lesson, source: L.source });
});

// ------------------------------------------------------------ Fairway Park

for (const h of FAIRWAY_HOLES) {
  const [x, z] = h.tee;
  const L = pickWhy(/mow|turf|grounds|landscap|chemical|irrigation|heat|sun/i);
  add({ id: `tz-fairway-hole-${h.number}`, name: `Lost Ball, Hole ${h.number}`, surface: "fairway", world: "Fairway Park", area: `Hole ${h.number}`,
    set: "lost-balls", how: "proximity", trigger: { world: "fairway", x: round(x + 7), z: round(z + 18), r: 8 },
    hint: "Every hole has a lost ball in the rough off the tee. Hit near it, or click it.", reveal: "ball", lesson: L.lesson, source: L.source });
}

// ------------------------------------------------------------ sets

const SETS = [
  ["front-door", "Front Door Secrets", "Knocker", "The homepage's three oldest secrets."],
  ["registry-lore", "Registry Lore", "Keeper of the Registry", "Twelve union lines the Guide will tell you if you ask the right way."],
  ["every-bench", "Every Bench", "Bench Hand", "One brass mark in every Trade Skills room."],
  ["tool-crib", "Tool Crib Inventory", "Crib Attendant", "Every left-behind tool returned, plus the crib itself."],
  ["cartographer", "Cartographer", "Cartographer", "Five marks around the Atlas."],
  ["cabinet-regular", "Cabinet Regular", "Arcade Regular", "A token from every arcade cabinet."],
  ["every-course", "Every Course", "Road Crew", "A finish on every racing course."],
  ["harbour-bells", "Seven Harbour Bells", "Bell Ringer", "Seven bells along Bay World's waterfront, each ringing a maritime union's line."],
  ["crew-caches", "Crew Caches", "Cache Keeper", "Six crew caches across Bay World's inland sites."],
  ["sea-glass", "Sea Glass", "Beachcomber", "Sea glass beside sixteen dive sites in The Deep."],
  ["pennants", "Regatta Pennants", "Mark Rounder", "A pennant off every rounding mark."],
  ["lost-balls", "Lost Balls", "Ranger", "A lost ball off every tee at Fairway Park."],
].map(([id, name, badge, blurb]) => ({ id, name, badge, blurb, members: T.filter((t) => t.set === id).map((t) => t.id) }));

const SURFACES = [
  ["home", "Homepage"], ["guide", "The Guide"], ["trades", "Trade Skills"], ["runner", "Station runner"], ["atlas", "The Atlas"],
  ["arcade", "Break Room Arcade"], ["race", "Night Highway Circuit"], ["bayworld", "Bay World"], ["deep", "The Deep"],
  ["regatta", "The Regatta"], ["fairway", "Fairway Park"],
].map(([id, name]) => ({ id, name, count: T.filter((t) => t.surface === id).length }));

const out = `// GENERATED by tools/gen_treasures.mjs — do not edit by hand (console TREASURE, docs/treasures.md).
// ${T.length} hidden treasures and easter eggs across ${SURFACES.length} surfaces, ${SETS.length} themed sets.
// Every lesson is a verbatim line from the source it names; tools/check_treasures.mjs re-reads each one.
// Every top-level name starts with \`tz\` (the bundler shares one scope; \`tr\` is the language layer's).

export const TZ_VERSION = 1;

export const TZ_SURFACES = ${JSON.stringify(SURFACES, null, 1)};

export const TZ_SETS = ${JSON.stringify(SETS, null, 1)};

export const TZ_TREASURES = ${JSON.stringify(T, null, 1)};
`;
fs.writeFileSync(path.join(ROOT, "WebXR/shared/treasures-data.js"), out);
console.log(`gen_treasures: ${T.length} treasures, ${SETS.length} sets, ${T.filter((t) => t.gate).length} gated → WebXR/shared/treasures-data.js`);
for (const s of SURFACES) console.log(`  ${s.id.padEnd(9)} ${s.count}`);
