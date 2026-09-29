// BAYKEEPER — the San Francisco Bay Program resource data (docs/consoles/BAYKEEPER.md).
//
// Pure data, no imports. Every figure about the EPA awards and Clean Ports
// comes only from the wave's verified facts file, which cites the EPA release
// of 22 September 2026 and its stormwater.com coverage, and the Port of
// Oakland's Clean Ports pages and their coverage. Twelve of the twenty
// projects are not named in those sources, so they are never named, placed or
// priced here. Where a project plays on a map is the platform's choice, not
// the release's, and is marked as such.
//
// Seams (documented shapes):
//   bkProjects() -> [{ id, recipient, amount, place, does, stations: [stationId], unions: [unionId], marker }]
//   bkStationsFor(projectId) -> [stationId]
//   bkMarkers(world) -> [{ projectId, world, parish?, site?, position?, approximate, note }]
//   bkPlaceMarkers(npParish) -> markers resolved against BAYMAP/SF parish data, guarded:
//     npParish?.("oak-west-oakland")?.sites.find(s => s.id === "outer-harbor-container-terminal")

export const BK_SOURCES = {
  epa: {
    title: "EPA Awards Record $82 Million to Improve Water Quality and Restore Habitat Across San Francisco Bay",
    publisher: "U.S. EPA", date: "22 September 2026",
    url: "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san",
  },
  stormwater: {
    title: "EPA awards $82 million for San Francisco Bay water quality and stormwater projects",
    publisher: "Stormwater (trade press)",
    url: "https://www.stormwater.com/stormwater-management/news/55407138/epa-awards-82-million-for-san-francisco-bay-water-quality-and-stormwater-projects",
  },
  cleanPorts: { title: "Clean Ports — Port of Oakland", publisher: "Port of Oakland", url: "https://www.portofoakland.com/cleanports" },
  cleanPortsGrant: { title: "Port of Oakland awarded historic $322 million EPA grant", publisher: "Port of Oakland", url: "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant" },
  cleanPortsCoverage: { title: "EPA's $322M boost for Port of Oakland's green future", publisher: "The Maritime Executive", url: "https://maritime-executive.com/corporate/epa-s-322m-boost-for-port-of-oakland-s-green-future" },
};

export const BK_PROGRAM = {
  name: "San Francisco Bay Program",
  fund: "San Francisco Bay Water Quality Improvement Fund",
  announced: "22 September 2026",
  total: "more than $82 million",
  projectCount: 20,
  namedCount: 8,
  unnamedCount: 12,
  paragraph: "On 22 September 2026 the U.S. EPA announced its largest-ever investment in San Francisco Bay and its surrounding watersheds: more than $82 million for 20 projects supporting water quality improvements and habitat restoration across the Bay, through grant funding under the agency's San Francisco Bay Program (the San Francisco Bay Water Quality Improvement Fund). The categories named across the awards are stormwater runoff and pollutants, green stormwater infrastructure, trash capture, tidal marsh and wetland restoration, nutrient reduction, sediment management, fish habitat and PCB source control.",
  categories: ["stormwater runoff and pollutants", "green stormwater infrastructure", "trash capture", "tidal marsh and wetland restoration", "nutrient reduction", "sediment management", "fish habitat", "PCB source control"],
  unnamedLine: "and twelve more projects across tidal marsh and wetland restoration, nutrient reduction, sediment management and fish habitat",
};

// The programme the stations live in (WebXR/smartcity/js/curricula.js).
export const BK_PROGRAMME_ID = "bay-program-projects";

// Placement: our choice, not the release's (the facts file's "How the platform maps them").
const REGIONAL = { world: "bayworld-atlas", href: "../bayworld/atlas.html", note: "outside the walkable maps — Bay World's regional atlas" };

export const BK_PROJECTS = [
  {
    id: "abag-strip-marsh-east", recipient: "Association of Bay Area Governments (ABAG)", amount: "$5.6 million",
    place: "Strip Marsh East, along Highway 37, San Pablo Bay",
    does: "habitat restoration by reusing sediment produced from excavating new tidal channels and lowering berms; a report on how sediment moves through the Bay-Delta estuary, to inform long-term plans to restore 100,000 acres of tidal wetlands in the region",
    stations: ["br-tidal-marsh-grading-amphibious-excavator", "br-dredge-spoils-dewatering-pad", "br-turbidity-curtain-deployment"],
    unions: ["iuoe-local3", "liuna"],
    marker: { ...REGIONAL },
  },
  {
    id: "bacwa-nutrient-pilots", recipient: "Bay Area Clean Water Agencies (BACWA)", amount: "$7 million", place: "Bay-wide",
    does: "five pilot projects aimed at reducing nutrient inputs to San Francisco Bay",
    stations: ["bk-wastewater-nutrient-chemical-feed", "chlorine-room", "digester-gas"],
    unions: ["uwua", "afscme"],
    marker: { ...REGIONAL },
  },
  {
    id: "san-jose-gsi-plan", recipient: "City of San Jose", amount: "$3.16 million", place: "San Jose",
    does: "develop a green stormwater infrastructure implementation plan",
    stations: ["bk-bioretention-rain-garden-excavation"],
    unions: ["liuna", "iuoe-local3"],
    marker: { ...REGIONAL },
  },
  {
    id: "san-pablo-gsi", recipient: "City of San Pablo", amount: "$1.26 million", place: "San Pablo",
    does: "construct and monitor green stormwater infrastructure designed to capture and treat stormwater runoff",
    stations: ["bk-bioretention-rain-garden-excavation"],
    unions: ["liuna", "iuoe-local3"],
    marker: { ...REGIONAL },
  },
  {
    id: "sfpuc-outer-mission-gsi", recipient: "San Francisco Public Utilities Commission (SFPUC)", amount: "$5 million",
    place: "Outer Mission neighborhood, San Francisco",
    does: "green stormwater infrastructure, including planted sidewalk filtration systems, rain gardens and an underground infiltration system",
    stations: ["bk-bioretention-rain-garden-excavation"],
    unions: ["liuna", "iuoe-local3"],
    // The Outer Mission's approximate centre projects (by a fit of sf-mission's own
    // anchors) to about z 2011 of that map's 2048 half-field, south of Glen Park,
    // its southernmost anchor: the southern edge of the walkable map.
    marker: { world: "parishes", parish: "sf-mission", position: [-1280, 1990], approximate: true, href: "../parishes/index.html?parish=sf-mission", note: "the southern edge of the Mission & SoMa map (approximate — the neighbourhood sits at the field's edge, beyond Glen Park)" },
  },
  {
    id: "san-leandro-trash-capture", recipient: "City of San Leandro", amount: "$2.49 million", place: "San Leandro Creek, draining to San Leandro Bay",
    does: "two large trash capture devices in stormwater drains, to reduce trash and pollutants entering San Leandro Bay",
    stations: ["bk-street-drain-trash-capture-cleanout", "br-trash-capture-device-service"],
    unions: ["liuna", "iuoe-local3"],
    marker: { ...REGIONAL },
  },
  {
    id: "port-of-oakland-trash-capture", recipient: "Port of Oakland", amount: "$5 million", place: "Port of Oakland",
    does: "four large trash capture devices collecting stormwater from 427 acres of port property, reducing more than 4,700 gallons of trash from entering San Francisco Bay",
    stations: ["bk-street-drain-trash-capture-cleanout", "br-trash-capture-device-service"],
    unions: ["liuna", "iuoe-local3"],
    marker: { world: "parishes", parish: "oak-west-oakland", site: "outer-harbor-container-terminal", href: "../parishes/index.html?parish=oak-west-oakland", note: "West Oakland's port terminals (BAYMAP's Oakland map)", bayworld: "port-container-terminal" },
  },
  {
    id: "ccag-pcb-source-control", recipient: "City/County Association of Governments of San Mateo County (C/CAG)", amount: "$3.8 million", place: "San Mateo County",
    does: "monitor and control PCB sources",
    stations: ["br-legacy-mercury-and-pcb-hotspot-handling", "br-sediment-chain-of-custody-and-lab-prep"],
    unions: ["liuna", "seiu-1021"],
    marker: { ...REGIONAL },
  },
];

// Work the categories name that no named project is placed on (fish habitat is
// one of the unnamed twelve's categories): stations taught without a project.
export const BK_CATEGORY_STATIONS = {
  "fish habitat": ["br-culvert-retrofit-for-fish-passage", "br-fish-screen-maintenance", "br-beach-seine-fish-survey-and-handling"],
  "tidal marsh and wetland restoration": ["br-tidal-marsh-grading-amphibious-excavator", "br-native-planting-and-erosion-mats"],
  "sediment management": ["br-dredge-spoils-dewatering-pad", "br-turbidity-curtain-deployment"],
  "nutrient reduction": ["bk-wastewater-nutrient-chemical-feed", "chlorine-room", "digester-gas"],
};

export const BK_CLEAN_PORTS = {
  name: "Clean Ports Program (U.S. EPA)",
  award: "$322 million",
  total: "about half a billion dollars in total investment",
  equipment: { total: 663, drayage: 475, cargoHandling: 188 },
  ghgTonsAnnual: "24,000",
  paragraph: "The U.S. EPA's Clean Ports Program awarded the Port of Oakland $322 million to fast-track the Oakland Seaport's conversion to nearly 100 percent zero-emissions cargo handling operations; with Port and local partner contributions, about half a billion dollars in total investment. It finances 663 pieces of zero-emissions equipment — 475 drayage trucks and 188 pieces of cargo handling equipment — with electric and hydrogen cargo handling equipment, drayage trucks, charging infrastructure, a battery energy storage system and scrappage of a portion of the existing diesel fleet, and is expected to reduce greenhouse gas emissions by 24,000 tons annually, plus a significant decrease in particulate matter.",
  partners: [
    { name: "Pacific Maritime Association (PMA)", role: "skills and safety training on operating the zero-emission equipment and vehicles" },
    { name: "Machinists Institute (MI)", role: "assists the West Oakland Jobs Resource Center in expanding its Pre-Apprentice Transportation, Distribution and Logistics training program to include careers affected by zero-emission vehicles" },
    { name: "West Oakland Jobs Resource Center (WOJRC)", role: "its Pre-Apprentice Transportation, Distribution and Logistics training program, expanding to include careers affected by zero-emission vehicles" },
  ],
  jobs: "Hundreds of green jobs, prioritising residents of nearby communities, with placements in apprenticeships and union jobs.",
  track: "../home/tracks/wojrc-pathway-edition.html",
};

// Union crafts on this work, by registry id (tools/unions.json) — only what the registry lists.
export const BK_CRAFTS = [
  { union: "liuna", craft: "Construction craft laborers and hazardous-waste crews: trash capture service, green stormwater infrastructure digs and plantings, shoreline crews" },
  { union: "iuoe-local3", craft: "Operating engineers who run heavy equipment: excavators, cranes and amphibious machines on channels, berms and device lifts" },
  { union: "uwua", craft: "Water, gas and electric utility crews" },
  { union: "afscme", craft: "Public-service, public-health and air-district members" },
  { union: "seiu-1021", craft: "Public-sector and nonprofit employees across Northern California" },
  { union: "ilwu", craft: "Longshore, crane and clerk work, trained jointly with the PMA" },
  { union: "iam", craft: "Machinist and transportation training" },
  { union: "teamsters", craft: "Warehouse, driving and regulated-soil haul" },
];

export function bkProjects() { return BK_PROJECTS.map((p) => ({ ...p })); }
export function bkStationsFor(projectId) { return BK_PROJECTS.find((p) => p.id === projectId)?.stations.slice() || []; }
export function bkMarkers(world) {
  return BK_PROJECTS.map((p) => ({ projectId: p.id, ...p.marker, approximate: p.marker.approximate ?? true }))
    .filter((m) => !world || m.world === world);
}

/** Resolve markers against parish data where the map exists; guarded so a tree
 *  without BAYMAP's Oakland district simply leaves those markers unresolved. */
export function bkPlaceMarkers(npParish) {
  return bkMarkers("parishes").map((m) => {
    const parish = typeof npParish === "function" ? npParish(m.parish) : null;
    const site = m.site ? parish?.sites?.find((s) => s.id === m.site) : null;
    const position = site?.position || m.position || null;
    return { ...m, resolved: !!(parish && position), position };
  });
}
