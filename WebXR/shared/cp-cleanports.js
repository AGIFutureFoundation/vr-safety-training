// CLEANPORTS — the Port of Oakland's Clean Ports conversion as training (the Bay Program wave).
// Pure data and small guarded helpers: no imports, no three.js, no DOM, so tools/check_cleanports.mjs
// imports it directly and the bundler (one shared scope) can carry it — every top-level name is cp/CP_.
//
// Seams (documented shapes):
//   cpCleanPortsFacts() -> CP_FACTS            every Clean Ports figure the platform shows, each with its
//                                              exact wording and the source it came from (the facts file)
//   cpPlacements(world) -> [{ kind: "station"|"drivable", id, site, parish? }]   world: "baymap"|"bayworld"
//   cpPlaceInParish(npParish) -> number        adds the stations to BAYMAP's oak-west-oakland sites when that
//                                              map is present (guarded: npParish(id)?.sites.find(...)); returns
//                                              how many site lists changed (0 when BAYMAP is not merged yet)
//   cpPathwayLevel() -> CP_PATHWAY_LEVEL        the WOJRC Pathway Edition's "Zero-emission careers" level
//
// Facts rule: the figures below are the facts file's (the EPA Clean Ports award to the Port of Oakland, as
// extracted from the Port's pages and coverage). Nothing else about the programme is stated anywhere here.

export const CP_SOURCES = [
  { label: "Port of Oakland — Clean Ports", url: "https://www.portofoakland.com/cleanports" },
  { label: "Port of Oakland awarded historic $322 million EPA grant", url: "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant" },
  { label: "The Maritime Executive — EPA's $322M boost for Port of Oakland's green future", url: "https://maritime-executive.com/corporate/epa-s-322m-boost-for-port-of-oakland-s-green-future" },
];

export const CP_FACTS = {
  programme: "U.S. EPA Clean Ports Program",
  award: { figure: "$322 million", text: "The U.S. EPA (Clean Ports Program) awarded the Port of Oakland $322 million to fast-track the Oakland Seaport's conversion to nearly 100 percent zero-emissions cargo handling operations." },
  total: { figure: "about half a billion dollars", text: "With Port and local partner contributions, about half a billion dollars in total investment." },
  equipment: { figure: "663", text: "663 pieces of zero-emissions equipment: 475 drayage trucks and 188 pieces of cargo handling equipment." },
  drayage: { figure: "475", text: "475 drayage trucks" },
  cargoHandling: { figure: "188", text: "188 pieces of cargo handling equipment" },
  activities: ["electric and hydrogen cargo handling equipment", "drayage trucks", "charging infrastructure", "a battery energy storage system", "scrappage of a portion of the existing diesel fleet"],
  ghg: { figure: "24,000 tons annually", text: "Expected to reduce greenhouse gas emissions by 24,000 tons annually, plus a significant decrease in particulate matter." },
  workforce: [
    { id: "pma", name: "Pacific Maritime Association (PMA)", role: "skills and safety training on operating the zero-emission equipment and vehicles" },
    { id: "mi", name: "Machinists Institute (MI)", role: "assists the West Oakland Jobs Resource Center (WOJRC) in expanding its Pre-Apprentice Transportation, Distribution and Logistics training program to include careers affected by zero-emission vehicles" },
    { id: "wojrc", name: "West Oakland Jobs Resource Center (WOJRC)", role: "its Pre-Apprentice Transportation, Distribution and Logistics training program, expanded with MI's assistance to include careers affected by zero-emission vehicles" },
  ],
  jobs: "Hundreds of green jobs, prioritising residents of nearby communities, with placements in apprenticeships and union jobs.",
  sources: CP_SOURCES,
};

export const CP_STATIONS = [
  "cp-high-voltage-lockout-on-electric-cargo-equipment",
  "cp-charging-yard-connectors-and-e-stops",
  "cp-battery-energy-storage-site-awareness",
  "cp-hydrogen-fuel-cell-equipment-and-fuelling",
  "cp-zero-emission-terminal-equipment-pre-use",
  "cp-zero-emission-drayage-truck-pre-trip",
];

export const CP_DRIVABLES = ["cp-electric-yard-tractor", "cp-hydrogen-yard-tractor", "cp-electric-top-pick", "cp-electric-straddle-carrier", "cp-electric-drayage-tractor"];

// Where each plays. BAYMAP's West Oakland sites (oak-west-oakland, merging in parallel) and Bay World's port and
// West Oakland sites. A training site is generic: placing a station at a terminal says the practice fits the
// place, never that a particular machine, charger or storage system is there.
export const CP_PLACEMENTS = {
  baymap: [
    { kind: "station", id: "cp-zero-emission-terminal-equipment-pre-use", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" },
    { kind: "station", id: "cp-charging-yard-connectors-and-e-stops", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" },
    { kind: "station", id: "cp-hydrogen-fuel-cell-equipment-and-fuelling", parish: "oak-west-oakland", site: "seventh-street-marine-terminal" },
    { kind: "station", id: "cp-high-voltage-lockout-on-electric-cargo-equipment", parish: "oak-west-oakland", site: "port-maintenance-shop" },
    { kind: "station", id: "cp-battery-energy-storage-site-awareness", parish: "oak-west-oakland", site: "port-maintenance-shop" },
    { kind: "station", id: "cp-zero-emission-drayage-truck-pre-trip", parish: "oak-west-oakland", site: "port-truck-staging-yard" },
    { kind: "drivable", id: "cp-electric-yard-tractor", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" },
    { kind: "drivable", id: "cp-electric-top-pick", parish: "oak-west-oakland", site: "outer-harbor-container-terminal" },
    { kind: "drivable", id: "cp-electric-straddle-carrier", parish: "oak-west-oakland", site: "seventh-street-marine-terminal" },
    { kind: "drivable", id: "cp-hydrogen-yard-tractor", parish: "oak-west-oakland", site: "seventh-street-marine-terminal" },
    { kind: "drivable", id: "cp-electric-drayage-tractor", parish: "oak-west-oakland", site: "port-truck-staging-yard" },
  ],
  bayworld: [
    { kind: "station", id: "cp-zero-emission-terminal-equipment-pre-use", site: "port-container-terminal" },
    { kind: "station", id: "cp-charging-yard-connectors-and-e-stops", site: "port-container-terminal" },
    { kind: "station", id: "cp-hydrogen-fuel-cell-equipment-and-fuelling", site: "port-container-terminal" },
    { kind: "station", id: "cp-high-voltage-lockout-on-electric-cargo-equipment", site: "port-maintenance-shop" },
    { kind: "station", id: "cp-battery-energy-storage-site-awareness", site: "port-maintenance-shop" },
    { kind: "station", id: "cp-zero-emission-drayage-truck-pre-trip", site: "west-oakland-truck-yard" },
    { kind: "drivable", id: "cp-electric-yard-tractor", site: "port-container-terminal" },
    { kind: "drivable", id: "cp-hydrogen-yard-tractor", site: "port-container-terminal" },
    { kind: "drivable", id: "cp-electric-top-pick", site: "port-container-terminal" },
    { kind: "drivable", id: "cp-electric-straddle-carrier", site: "port-container-terminal" },
    { kind: "drivable", id: "cp-electric-drayage-tractor", site: "west-oakland-truck-yard" },
  ],
};

// The WOJRC Pathway Edition's zero-emission careers level: the six stations in the order a TDL
// pre-apprentice meets the work — the truck first, then the terminal's machines, the yard they charge in,
// the shop, hydrogen, and the storage site behind it all.
export const CP_PATHWAY_LEVEL = {
  id: "zero-emission-careers",
  title: "Zero-emission careers",
  programme: "wojrc-pathway-edition",
  stations: [
    "cp-zero-emission-drayage-truck-pre-trip",
    "cp-zero-emission-terminal-equipment-pre-use",
    "cp-charging-yard-connectors-and-e-stops",
    "cp-high-voltage-lockout-on-electric-cargo-equipment",
    "cp-hydrogen-fuel-cell-equipment-and-fuelling",
    "cp-battery-energy-storage-site-awareness",
  ],
  note: "The Port of Oakland's Clean Ports release says the Machinists Institute (MI) assists the West Oakland Jobs Resource Center (WOJRC) in expanding its Pre-Apprentice Transportation, Distribution and Logistics training program to include careers affected by zero-emission vehicles. This level chains the platform's own stations for that kind of work, taught from their cited standards; it is not that program and does not describe its curriculum.",
  source: CP_SOURCES[1],
};

export function cpCleanPortsFacts() { return CP_FACTS; }
export function cpPlacements(world) { return CP_PLACEMENTS[world] ?? []; }
export function cpPathwayLevel() { return CP_PATHWAY_LEVEL; }

/** Guarded: BAYMAP's Oakland maps may not be merged. Adds each station to its site's list once. */
export function cpPlaceInParish(npParishFn) {
  let changed = 0;
  for (const p of CP_PLACEMENTS.baymap) {
    if (p.kind !== "station") continue;
    const site = npParishFn?.(p.parish)?.sites?.find((s) => s.id === p.site);
    if (!site || !Array.isArray(site.stations) || site.stations.includes(p.id)) continue;
    site.stations.push(p.id);
    changed += 1;
  }
  return changed;
}
