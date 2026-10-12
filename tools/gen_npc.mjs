/**
 * Builds the NPC roster (console GRIOT) into WebXR/shared/npc-data.js.
 *
 * The characters are defined here — a first name, a role, a world and a site,
 * an avatar style on shared/crew.js's axes, a routine — and everything they
 * SAY is copied verbatim from a source in this repository, never written
 * from memory: a sentence of a Guide knowledge-base chunk
 * (WebXR/shared/guide-kb.js, itself generated from the catalog, the world
 * data and the docs), a union's note (tools/unions.json), a verified
 * standard's title (tools/standards.json) or a station's tagline
 * (WebXR/smartcity/catalog.json). Each line carries the pointer it came from,
 * and tools/check_npc.mjs re-reads every one.
 *
 * Hand-offs are derived from the data the site already owns: its stations,
 * the field lesson placed nearest to it, a side quest posted at it and the
 * treasure whose trigger sits nearest (with the treasure's own hint text, the
 * one line the ledger already shows to everyone). No character names a real
 * person; names are first names only, roles are roles.
 *
 *     node tools/gen_npc.mjs            (write)
 *     node tools/gen_npc.mjs --stdout   (print, write nothing)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const WEBXR = join(ROOT, "WebXR");
export const GR_OUT = join(WEBXR, "shared", "npc-data.js");
const imp = (rel) => import(pathToFileURL(join(ROOT, rel)).href);

/** The Guide's own sentence rule (shared/guide.js gdSentences): a sentence ends at . ! ? … before a space and a capital. */
export const grSplitSentences = (t) => String(t ?? "").split(/(?<=[.!?…])\s+(?=[A-Z0-9"“(])/).map((s) => s.trim()).filter(Boolean);

// ------------------------------------------------------------------ roster
// ppe: a crew.js PPE id. i: the crowd index for ctAvatarVariety (body, skin,
// hair and colour step independently of the trade — no PPE travels with one
// look). stations: the subset of the site's stations this character speaks
// from (default: the site's first three). For a parish character `siteKind`
// names the site kind PARISH's data will carry; stations are explicit.
const ROSTER = [
  // ---------------------------------------------------------- Bay World
  { id: "gr-bw-longshore-foreman", name: "Kofi", role: "Longshore foreman", world: "bayworld", site: "port-container-terminal", ppe: "hard-hat-hivis", i: 0 },
  { id: "gr-bw-rail-inspector", name: "Ingrid", role: "Track inspector", world: "bayworld", site: "port-rail-yard", ppe: "hard-hat-hivis", i: 1 },
  { id: "gr-bw-journey-lineworker", name: "Tomas", role: "Journeyworker lineworker", world: "bayworld", site: "west-oakland-substation-yard", ppe: "electrical", i: 2 },
  { id: "gr-bw-nurse", name: "Adaeze", role: "Nurse", world: "bayworld", site: "coliseum-area-hospital", ppe: "scrubs", i: 3 },
  { id: "gr-bw-stagehand", name: "Luis", role: "Stagehand", world: "bayworld", site: "uptown-theatre-district", ppe: "none", i: 4 },
  { id: "gr-bw-chef", name: "Priya", role: "Chef", world: "bayworld", site: "uptown-restaurant-row", ppe: "chef", i: 5 },
  { id: "gr-bw-teacher", name: "Hana", role: "K-12 teacher", world: "bayworld", site: "fruitvale-elementary-school", ppe: "none", i: 6 },
  { id: "gr-bw-pilot", name: "Jerome", role: "Pilot", world: "bayworld", site: "island-ferry-landing", ppe: "marine", i: 7 },
  // ------------------------------------------------------------- Summit
  { id: "gr-sm-dam-operator", name: "Rosa", role: "Dam operator", world: "summit", site: "dam", ppe: "hard-hat-hivis", i: 8 },
  { id: "gr-sm-road-foreman", name: "Deshawn", role: "Pass road crew foreman", world: "summit", site: "pass-road", ppe: "hard-hat-hivis", i: 9 },
  { id: "gr-sm-line-journeyworker", name: "Malik", role: "Journeyworker lineworker", world: "summit", site: "ridge-line", ppe: "electrical", i: 10 },
  { id: "gr-sm-ranger", name: "Yuki", role: "Ranger", world: "summit", site: "ranger-station", ppe: "grounds", i: 11 },
  { id: "gr-sm-water-operator", name: "Ana", role: "Water treatment operator", world: "summit", site: "water-plant", ppe: "hard-hat-hivis", i: 12 },
  { id: "gr-sm-lift-millwright", name: "Sione", role: "Lift millwright", world: "summit", site: "gondola-shop", ppe: "hard-hat-hivis", i: 13 },
  { id: "gr-sm-tunnel-crew", name: "Farah", role: "Tunnel crew lead", world: "summit", site: "tunnel-portal", ppe: "hard-hat-hivis", i: 14 },
  { id: "gr-sm-substation-electrician", name: "Owen", role: "Substation electrician", world: "summit", site: "substation", ppe: "electrical", i: 15 },
  // ------------------------------------------------------------ Redwood
  { id: "gr-rw-crew-boss", name: "Nadia", role: "Wildland crew boss", world: "redwood", site: "fire-station", ppe: "hard-hat-hivis", i: 16 },
  { id: "gr-rw-lookout", name: "Tariq", role: "Fire lookout", world: "redwood", site: "lookout", ppe: "grounds", i: 17 },
  { id: "gr-rw-millwright", name: "Leilani", role: "Sawmill millwright", world: "redwood", site: "sawmill", ppe: "hard-hat-hivis", i: 18 },
  { id: "gr-rw-watershed-tech", name: "Marcus", role: "Watershed technician", world: "redwood", site: "restoration", ppe: "grounds", i: 19 },
  { id: "gr-rw-campground-host", name: "Sunita", role: "Campground host", world: "redwood", site: "campground", ppe: "none", i: 20 },
  { id: "gr-rw-nursery-lead", name: "Eli", role: "Nursery lead", world: "redwood", site: "nursery", ppe: "grounds", i: 21 },
  { id: "gr-rw-lineworker", name: "Grace", role: "Lineworker", world: "redwood", site: "substation", ppe: "electrical", i: 22 },
  { id: "gr-rw-estuary-scientist", name: "Noor", role: "Estuary field scientist", world: "redwood", site: "estuary", ppe: "marine", i: 23 },
  // -------------------------------------------- the parishes (PARISH's schema, matched by site.kind)
  { id: "gr-np-port-foreman", name: "Dante", role: "Terminal foreman", world: "parish", siteKind: "port", ppe: "hard-hat-hivis", i: 24, stations: ["container-lashing", "mooring-line", "pt-dock-fender-and-bollard-inspection"] },
  { id: "gr-np-levee-inspector", name: "Keiko", role: "Levee inspector", world: "parish", siteKind: "levee", ppe: "hard-hat-hivis", i: 25, stations: ["br-levee-inspection-and-seepage", "tide-gate"] },
  { id: "gr-np-pump-operator", name: "Amara", role: "Pumping station operator", world: "parish", siteKind: "pump-station", ppe: "hard-hat-hivis", i: 26, stations: ["lift-station", "fire-pump", "stormwater-outfall"] },
  { id: "gr-np-streetcar-mechanic", name: "Bao", role: "Streetcar barn mechanic", world: "parish", siteKind: "streetcar-barn", ppe: "hard-hat-hivis", i: 27, stations: ["bus-depot-lift", "tr-wheelchair-lift-and-securement-on-a-bus"] },
  { id: "gr-np-rail-conductor", name: "Celeste", role: "Yard conductor", world: "parish", siteKind: "rail-yard", ppe: "hard-hat-hivis", i: 28, stations: ["ra-blue-flag-protection-in-the-yard", "ra-hand-brake-and-securement-on-a-grade", "rcl-switching"] },
  { id: "gr-np-nurse", name: "Ravi", role: "Nurse", world: "parish", siteKind: "hospital", ppe: "scrubs", i: 29, stations: ["hc-patient-transport-and-safe-handling", "hc-code-response-support-and-crash-cart-check", "triage-point"] },
  { id: "gr-np-campus-teacher", name: "Thandiwe", role: "K-12 teacher", world: "parish", siteKind: "campus", ppe: "none", i: 30, stations: ["k12-weather-and-the-sky", "k12-water-cycle-and-filtration", "k12-graphing-tide-readings-at-the-pier"] },
  { id: "gr-np-stadium-rigger", name: "Mateo", role: "Arena rigger", world: "parish", siteKind: "stadium", ppe: "hard-hat-hivis", i: 31, stations: ["arena-rigging", "stage-load-in-and-truss-rigging", "le-crowd-barricade-and-show-stop-call"] },
  { id: "gr-np-hospitality-lead", name: "Ines", role: "Banquet lead", world: "parish", siteKind: "hospitality", ppe: "chef", i: 32, stations: ["hw-banquet-room-flip-and-staging", "banquet-hot-hold", "knife-skills"] },
  { id: "gr-np-wetlands-ranger", name: "Mira", role: "Wetlands ranger", world: "parish", siteKind: "wetland", ppe: "grounds", i: 33, stations: ["marsh-transect-survey", "living-shoreline", "br-native-planting-and-erosion-mats"] },
];

// The routine's two points, as offsets from the site centre: a work spot and
// a break spot, 7–13 m out, on the east / west / north side. The south
// corridor holds every world's board and arrival spot; Redwood's board sits
// north of its centre (z − pad/2, about 35 m out), well beyond these.
const ROUTINE_OFFSETS = {
  bayworld: [[10, -3], [-9, -5]],
  summit: [[10, -3], [-9, -5]],
  redwood: [[10, 2], [-9, 4]],
  parish: [[10, -3], [-9, -5]],
};
const ROUTINE = { work: 12, walk: 1.1, rest: 8 };

// ---------------------------------------------------------------- sources
export async function grBuildRoster() {
  const catalog = JSON.parse(readFileSync(join(WEBXR, "smartcity", "catalog.json"), "utf8"));
  const unions = JSON.parse(readFileSync(join(ROOT, "tools", "unions.json"), "utf8")).unions;
  const standards = JSON.parse(readFileSync(join(ROOT, "tools", "standards.json"), "utf8")).standards;
  const { gdDecodeKb } = await imp("WebXR/shared/guide.js");
  const { GD_KB } = await imp("WebXR/shared/guide-kb.js");
  const kb = new Map(gdDecodeKb(GD_KB).map((c) => [c.id, c]));
  const { BAY_SITES } = await imp("WebXR/shared/bayworld-data.js");
  const { SM_SITES, SM_FIELD_LESSONS, SM_SIDE_QUESTS } = await imp("WebXR/shared/summit-data.js");
  const { RW_SITES, RW_SIDE_QUESTS } = await imp("WebXR/redwood/js/rw-data.js");
  const { RW_FIELD_LESSONS } = await imp("WebXR/redwood/js/rw-lore-data.js");
  const { K2_FIELD_LESSONS } = await imp("WebXR/shared/field-lessons.js");
  const { TZ_TREASURES } = await imp("WebXR/shared/treasures-data.js");

  const stationById = new Map(catalog.stations.map((s) => [s.id, s]));
  const unionByName = (text) => {
    if (!text) return null;
    const head = String(text).split(/\s+[—–-]\s+/)[0].trim();
    return unions.find((u) => u.abbrev === head || u.aliases?.includes(head) || u.name === head) ?? null;
  };
  const sitesOf = { bayworld: BAY_SITES.map((s) => ({ ...s, pos: s.position })), summit: SM_SITES.map((s) => ({ ...s, pos: s.at })), redwood: RW_SITES.map((s) => ({ ...s, pos: s.position })) };
  const lessonsOf = {
    bayworld: K2_FIELD_LESSONS.filter((l) => l.world === "bayworld").map((l) => ({ id: l.id, title: l.title, pos: l.position, station: l.station })),
    summit: SM_FIELD_LESSONS.map((l) => ({ id: l.id, title: l.title, pos: l.position, station: l.station })),
    redwood: RW_FIELD_LESSONS.map((l) => ({ id: l.id, title: l.title, site: l.site, station: l.k12 })),
  };
  const questsOf = { bayworld: [], summit: SM_SIDE_QUESTS, redwood: RW_SIDE_QUESTS };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  const out = [];
  for (const def of ROSTER) {
    const site = def.world === "parish" ? null : sitesOf[def.world].find((s) => s.id === def.site);
    if (def.world !== "parish" && !site) throw new Error(`${def.id}: site ${def.site} is not in ${def.world}`);
    const stationIds = def.stations ?? site.stations.slice(0, 3);
    if (!stationIds.length) throw new Error(`${def.id}: no stations to speak from`);
    const pack = [];
    const seen = new Set();
    const say = (text, src, topic) => { const t = String(text ?? "").trim(); if (!t || seen.has(t)) return; seen.add(t); pack.push({ text: t, src, topic }); };
    // The site itself, as the Guide describes it (worlds only).
    if (site) {
      const c = kb.get(`site:${def.world}:${site.id}`);
      if (c) say(grSplitSentences(c.text)[0], { kb: c.id }, site.name);
    }
    for (const id of stationIds) {
      const st = stationById.get(id);
      if (!st) throw new Error(`${def.id}: station ${id} is not in the catalog`);
      say(st.tagline, { station: id }, st.name);
      const c = kb.get(`station:${id}`);
      const why = c ? grSplitSentences(c.text).find((s) => /^Why:/.test(s)) : null;
      if (why) say(why, { kb: c.id }, st.name);
      const u = unionByName(st.union) ?? unionByName(st.certification);
      if (u?.note) say(u.note, { union: u.id }, u.abbrev);
    }
    // One verified standard whose scope covers the first station's category.
    const cat = stationById.get(stationIds[0]).category;
    const std = standards.filter((s) => s.source === "verified" && s.scope?.includes(cat)).sort((a, b) => a.id.localeCompare(b.id))[def.i % 3];
    if (std) say(std.title, { standard: std.id }, std.body);
    if (pack.length < 3) throw new Error(`${def.id}: only ${pack.length} sourced lines`);

    // Hand-offs: stations first, then the nearest field lesson, a quest posted here, the nearest treasure.
    const handoffs = stationIds.slice(0, 2).map((id) => ({ kind: "station", id, label: stationById.get(id).name, siteId: site?.id ?? null }));
    if (site) {
      const ls = lessonsOf[def.world];
      const near = def.world === "redwood" ? ls.find((l) => l.site === site.id) : ls.map((l) => ({ l, d: dist(l.pos, site.pos) })).filter((x) => x.d < 260).sort((a, b) => a.d - b.d)[0]?.l;
      if (near) handoffs.push({ kind: "lesson", id: near.id, label: near.title, station: near.station });
      const q = questsOf[def.world].find((q) => q.site === site.id);
      if (q) handoffs.push({ kind: "quest", id: q.id, label: q.title });
      const tz = TZ_TREASURES.filter((t) => t.surface === def.world && t.trigger?.world === def.world && typeof t.trigger.x === "number" && t.hint)
        .map((t) => ({ t, d: dist([t.trigger.x, t.trigger.z], site.pos) })).filter((x) => x.d < 400).sort((a, b) => a.d - b.d || a.t.id.localeCompare(b.t.id))[0]?.t;
      if (tz) handoffs.push({ kind: "treasure", id: tz.id, label: tz.name, hint: tz.hint });
    }
    const [a, b] = ROUTINE_OFFSETS[def.world];
    out.push({
      id: def.id, name: def.name, role: def.role, world: def.world,
      site: def.site ?? null, siteKind: def.siteKind ?? null, siteName: site?.name ?? null,
      style: { ppe: def.ppe, i: def.i },
      routine: { work: a, rest: b, workSeconds: ROUTINE.work, restSeconds: ROUTINE.rest, speed: ROUTINE.walk },
      pack, handoffs,
    });
  }
  return out;
}

export function grRenderModule(roster) {
  const lines = roster.reduce((n, c) => n + c.pack.length, 0);
  const hand = roster.reduce((n, c) => n + c.handoffs.length, 0);
  return `// GENERATED by tools/gen_npc.mjs — do not edit by hand (console GRIOT, docs/consoles/GRIOT.md).
// ${roster.length} characters, ${lines} spoken lines (every one re-read verbatim from its source by tools/check_npc.mjs), ${hand} hand-offs.
// Every top-level name starts with \`gr\` (the bundler shares one scope).

export const GR_ROSTER_VERSION = 1;

export const GR_ROSTER = ${JSON.stringify(roster, null, 1)};
`;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const text = grRenderModule(await grBuildRoster());
  if (process.argv.includes("--stdout")) process.stdout.write(text);
  else { writeFileSync(GR_OUT, text); console.log(`wrote ${GR_OUT} (${(text.length / 1024).toFixed(0)} KB)`); }
}
