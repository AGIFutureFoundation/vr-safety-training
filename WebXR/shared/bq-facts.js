// BAYQUEST — the only Bay Program and Clean Ports lines the play layer states (docs/consoles/BAYQUEST.md).
//
// Every `text` is copied verbatim (markdown bold removed, whitespace folded) from the program's facts file
// ($SP/epa/epa-2026-facts.md), which records these from search-engine extracts of the cited pages; `source`
// is the page that line comes from. tools/check_bayquest.mjs re-reads each line against the facts file when it
// is present. Nothing else about the program is stated anywhere in BAYQUEST. Twelve of the twenty projects are
// not named in our sources and are never named, placed or priced here.
// Names prefixed bq/BQ_ (one bundle scope).

export const BQ_SRC_EPA = "https://www.epa.gov/newsreleases/epa-awards-record-82-million-improve-water-quality-and-restore-habitat-across-san";
export const BQ_SRC_CLEANPORTS = "https://www.portofoakland.com/port-of-oakland-awarded-historic-322-million-epa-grant";

export const BQ_FACTS = [
  { id: "program", source: BQ_SRC_EPA,
    text: "More than $82 million for 20 projects supporting water quality improvements and habitat restoration across the Bay." },
  { id: "port-trash-capture", source: BQ_SRC_EPA, project: "Port of Oakland",
    text: "four large trash capture devices collecting stormwater from 427 acres of port property, reducing more than 4,700 gallons of trash from entering San Francisco Bay" },
  { id: "cleanports-equipment", source: BQ_SRC_CLEANPORTS,
    text: "It finances 663 pieces of zero-emissions equipment: 475 drayage trucks and 188 pieces of cargo handling equipment" },
  { id: "cleanports-workforce", source: BQ_SRC_CLEANPORTS,
    text: "the Pacific Maritime Association (PMA) (skills and safety training on operating the zero-emission equipment and vehicles)" },
];

/** The honest line for the projects our sources do not name. */
export const BQ_UNNAMED = "and twelve more projects across tidal marsh and wetland restoration, nutrient reduction, sediment management and fish habitat";

export function bqFact(id) { return BQ_FACTS.find((f) => f.id === id) ?? null; }
