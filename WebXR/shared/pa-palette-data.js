// PALETTE's colour categories (console PALETTE, docs/consoles/PALETTE.md): plain, dependency-free data that the parish
// engine's material hook (shared/pa-palette.js) reads and that TQ-BRIDGE exports once for SmartCiti.X TradeQuest
// (exports/shared/). Nothing here imports anything.
//
// A category is a generic, PROCEDURAL paint scheme for a district character — "Creole cottage pastels", "painted-Victorian
// palette", "warehouse greys" — named after a building style, never after a real building, and never a survey of real
// colours: every hex is chosen for the look and for legibility. Each category names its wall colours (one picked per
// building, seeded by position, then nudged a little lighter or darker so neighbours differ), the two tileable textures its
// buildings wear (walls and roofs, from shared/textures.js's pixel painters), and a sign pair (ground, ink) FACADES may
// letter its generic storefront signs with; every ink is a design-system token (WebXR/shared/design.css) at 4.5:1 or better.
//
//   PA_CATEGORIES                        id -> { id, name, walls: [0xRRGGBB…], wall, roof, sign: { ground, ink }, note }
//   PA_KIND_CHARACTER                    massing kind -> district character
//   PA_REGION_CHARACTERS                 region -> character -> category id
//   PA_PARISH_CHARACTERS                 map id -> character -> category id (a district's own override)
//   PA_TEXTURES                          pixel painter id -> { metres } (one tile's size on a wall)
//   PA_ATLAS_TIERS                       tier -> { cell } px per atlas cell (0: no atlas, vertex colour only — the phone)
//   paCategoryFor(kind, parish)          the category for a massing kind on a map, or null (trees, cranes: untouched)
//   paInstanceColour(category, spot)     a wall colour 0xRRGGBB for one building, seeded by its position

/** Every colour category (procedural paint schemes by building style). */
export const PA_CATEGORIES = {
  "creole-cottage-pastels": {
    id: "creole-cottage-pastels", name: "Creole cottage pastels", wall: "stucco", roof: "concretePanel",
    walls: [0xe9b8a3, 0xf1d68e, 0xabcaa6, 0x9fc4d8, 0xdcaacb, 0xf2e7d3],
    sign: { ground: 0xf3ead8, ink: 0x0b1822 }, note: "Soft pastels on plastered walls; a procedural scheme, not a record of any real street.",
  },
  "garden-district-whites": {
    id: "garden-district-whites", name: "Garden District whites", wall: "clapboard", roof: "shingle",
    walls: [0xf4f1e8, 0xece6d6, 0xe8ecef, 0xf2ead9, 0xdfe3da],
    sign: { ground: 0x1f3b2d, ink: 0xedf6fb }, note: "Whites and creams on lap siding under shingle roofs; procedural.",
  },
  "shotgun-brights": {
    id: "shotgun-brights", name: "Shotgun-house brights", wall: "clapboard", roof: "shingle",
    walls: [0xe07a5f, 0xf2cc60, 0x81b29a, 0x6aa9c9, 0xc98bb9, 0xf4a259],
    sign: { ground: 0xf7f1e3, ink: 0x0b1822 }, note: "Saturated paints on narrow lap-sided houses; procedural.",
  },
  "riverfront-brick": {
    id: "riverfront-brick", name: "Riverfront brick", wall: "brick", roof: "concretePanel",
    walls: [0xa4553f, 0x8f4a3a, 0xb46a4e, 0x7d4436, 0x9c5f4a],
    sign: { ground: 0x2b2522, ink: 0xedf6fb }, note: "Red and brown brick on working blocks; procedural.",
  },
  "port-steel": {
    id: "port-steel", name: "Port steel", wall: "corrugated", roof: "corrugated",
    walls: [0x8e9aa5, 0x5d7c99, 0xa9b1b8, 0x9b6a4f, 0x6f8a7a],
    sign: { ground: 0x16324a, ink: 0xedf6fb }, note: "Painted corrugated sheds by the water; procedural.",
  },
  "painted-victorian": {
    id: "painted-victorian", name: "Painted-Victorian palette", wall: "clapboard", roof: "shingle",
    walls: [0x4f8a8b, 0x7b4b6e, 0xd9a441, 0x9bb17b, 0xc76f6a, 0x5b6c9e, 0xe6d3a3],
    sign: { ground: 0xf4ecd8, ink: 0x0b1822 }, note: "Deep, varied paints on ornate lap-sided row houses; procedural.",
  },
  "mission-stucco": {
    id: "mission-stucco", name: "Mission stucco", wall: "stucco", roof: "spanishTile",
    walls: [0xf1e4cc, 0xd99a6c, 0xe7c07a, 0xc9d3b8, 0xe3b3a0, 0xf4efe4],
    sign: { ground: 0x5a2e1f, ink: 0xedf6fb }, note: "Warm stucco under barrel-tile roofs; procedural.",
  },
  "sunset-pastels": {
    id: "sunset-pastels", name: "Sunset pastels", wall: "stucco", roof: "spanishTile",
    walls: [0xbfe3d0, 0xf6cfb0, 0xb9d3ec, 0xf4ebb0, 0xe4c8e0, 0xf2f0ea],
    sign: { ground: 0xfdf8ee, ink: 0x0b1822 }, note: "Light pastels on stucco row houses; procedural.",
  },
  "downtown-stone": {
    id: "downtown-stone", name: "Downtown stone and glass", wall: "windowGrid", roof: "concretePanel",
    walls: [0xc9c4b8, 0xa7adb3, 0xd8cdb4, 0x8e979f, 0xb9b1a2],
    sign: { ground: 0x1b2430, ink: 0xedf6fb }, note: "Stone-grey and tan towers with window grids; procedural.",
  },
  "oakland-brick": {
    id: "oakland-brick", name: "Oakland brick", wall: "brick", roof: "concretePanel",
    walls: [0x9a4f3c, 0xb0664d, 0x86503f, 0xa87a5c, 0x7a3f33],
    sign: { ground: 0x2a211d, ink: 0xedf6fb }, note: "Brick commercial blocks; procedural.",
  },
  "warehouse-greys": {
    id: "warehouse-greys", name: "Warehouse greys", wall: "concretePanel", roof: "corrugated",
    walls: [0x9ea3a7, 0x8b9196, 0xb3b6b3, 0x7f878c, 0xa89f94],
    sign: { ground: 0xf2c14b, ink: 0x0b1822 }, note: "Grey panel and sheet-metal warehouses; procedural.",
  },
  "craftsman-shingle": {
    id: "craftsman-shingle", name: "Craftsman shingle", wall: "shingle", roof: "shingle",
    walls: [0x8a6a4f, 0x6f7f5c, 0xa3845e, 0x5e6f6a, 0xb59a74],
    sign: { ground: 0xf3ecdc, ink: 0x0b1822 }, note: "Brown-shingle and sage houses under low roofs; procedural.",
  },
  "marsh-weathered": {
    id: "marsh-weathered", name: "Marsh weathered", wall: "shingle", roof: "corrugated",
    walls: [0xa7a79c, 0x8f9488, 0xbdb6a4, 0x7f8a86, 0xc3c1b5],
    sign: { ground: 0x223b3a, ink: 0xedf6fb }, note: "Silvered wood and tin by the marsh; procedural.",
  },
  "campus-stucco": {
    id: "campus-stucco", name: "Campus sandstone", wall: "stucco", roof: "spanishTile",
    walls: [0xd8c3a0, 0xcdb58e, 0xe3d4b8, 0xbfa987],
    sign: { ground: 0x243a52, ink: 0xedf6fb }, note: "Sandstone-toned blocks under tile roofs; procedural.",
  },
  "refinery-whites": {
    id: "refinery-whites", name: "Refinery whites", wall: "concretePanel", roof: "concretePanel",
    walls: [0xeceae4, 0xd9dcdc, 0xc9ccc8, 0xe6e0d0],
    sign: { ground: 0xf0645b, ink: 0x0b1822 }, note: "White and silver tanks and stacks; procedural.",
  },
  "valley-ranch": {
    id: "valley-ranch", name: "Valley ranch stucco", wall: "stucco", roof: "spanishTile",
    walls: [0xe6d9c0, 0xd4c7a8, 0xc8cfb4, 0xecdcc8, 0xd8c0a8],
    sign: { ground: 0xfaf4e6, ink: 0x0b1822 }, note: "Beige and sage stucco houses; procedural.",
  },
};

/** The district character a massing kind stands for (np-parish.js places kinds by district character). */
export const PA_KIND_CHARACTER = {
  quarterBlock: "quarter", gardenHouse: "garden", suburbHouse: "suburb", shed: "industrial",
  tower: "downtown", campusBlock: "campus", tank: "refinery", stack: "refinery",
};
/** The characters PALETTE paints. */
export const PA_CHARACTERS = ["quarter", "garden", "suburb", "industrial", "downtown", "campus", "refinery"];

/** Region -> character -> category id: every character in every region maps to a category. */
export const PA_REGION_CHARACTERS = {
  "new-orleans": { quarter: "creole-cottage-pastels", garden: "garden-district-whites", suburb: "shotgun-brights", industrial: "riverfront-brick", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  "san-francisco": { quarter: "painted-victorian", garden: "painted-victorian", suburb: "sunset-pastels", industrial: "warehouse-greys", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  oakland: { quarter: "oakland-brick", garden: "painted-victorian", suburb: "craftsman-shingle", industrial: "warehouse-greys", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  "north-east-bay": { quarter: "oakland-brick", garden: "craftsman-shingle", suburb: "valley-ranch", industrial: "warehouse-greys", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  "south-bay": { quarter: "mission-stucco", garden: "valley-ranch", suburb: "valley-ranch", industrial: "warehouse-greys", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  // The programme worlds (SMILES: a procedural community-health district) read as a bright small town.
  programmes: { quarter: "creole-cottage-pastels", garden: "craftsman-shingle", suburb: "sunset-pastels", industrial: "warehouse-greys", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
  "bay-program": { quarter: "marsh-weathered", garden: "marsh-weathered", suburb: "marsh-weathered", industrial: "port-steel", downtown: "downtown-stone", campus: "campus-stucco", refinery: "refinery-whites" },
};
/** A district's own override (map id -> character -> category id), where its character differs from its region's. */
export const PA_PARISH_CHARACTERS = {
  jefferson: { industrial: "port-steel" },
  "st-bernard": { suburb: "marsh-weathered", industrial: "port-steel" },
  plaquemines: { suburb: "marsh-weathered", garden: "marsh-weathered" },
  "sf-mission": { quarter: "mission-stucco" },
  "sf-outer-mission": { quarter: "mission-stucco" },
  "sf-sunset-south": { garden: "sunset-pastels" },
  "sf-bayview": { industrial: "port-steel" },
  "oak-west-oakland": { industrial: "port-steel" },
  "oak-fruitvale-estuary": { quarter: "mission-stucco", suburb: "sunset-pastels" },
};
/** One tile's size on a wall, in metres, per pixel painter (shared/textures.js TX_PX_PAINTERS). */
export const PA_TEXTURES = {
  clapboard: { metres: 2.4 }, shingle: { metres: 2.4 }, stucco: { metres: 4 }, spanishTile: { metres: 3 },
  brick: { metres: 2.4 }, corrugated: { metres: 3.2 }, concretePanel: { metres: 6 }, windowGrid: { metres: 18 },
};
/** Atlas cell size per render tier (perf.js tiers); 0 is the phone: no atlas, per-instance vertex colour only. */
export const PA_ATLAS_TIERS = { high: { cell: 128 }, balanced: { cell: 64 }, low: { cell: 0 } };

/** The region a map belongs to (np-parishes.js's rule: a map without one is a New Orleans parish). */
export function paRegionOf(parish) { return parish?.region ?? "new-orleans"; }

/** The category for a massing kind on a map, or null for a kind PALETTE leaves alone (trees, reeds, cranes). */
export function paCategoryFor(kind, parish) {
  const ch = PA_KIND_CHARACTER[kind];
  if (!ch) return null;
  const id = PA_PARISH_CHARACTERS[parish?.id]?.[ch] ?? PA_REGION_CHARACTERS[paRegionOf(parish)]?.[ch] ?? PA_REGION_CHARACTERS["new-orleans"][ch];
  return PA_CATEGORIES[id] ?? null;
}

/** The category ids one region's maps can use (its own table plus its maps' overrides). */
export function paRegionCategories(region, parishIds = Object.keys(PA_PARISH_CHARACTERS)) {
  const ids = new Set(Object.values(PA_REGION_CHARACTERS[region] ?? PA_REGION_CHARACTERS["new-orleans"]));
  for (const pid of parishIds) for (const id of Object.values(PA_PARISH_CHARACTERS[pid] ?? {})) ids.add(id);
  return [...ids].filter((id) => PA_CATEGORIES[id]);
}

/** An integer hash of a building's position (to the decimetre) -> [0, 1). */
export function paHash(x, z, salt = 0) {
  let h = Math.imul(Math.round(x * 10) | 0, 0x27d4eb2d) ^ Math.imul(Math.round(z * 10) | 0, 0x165667b1) ^ Math.imul(salt | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** One building's wall colour: a category colour picked by position, nudged ±7% in lightness so neighbours differ. */
export function paInstanceColour(category, spot) {
  const walls = category?.walls ?? [0xcccccc];
  const pick = walls[Math.floor(paHash(spot.x, spot.z) * walls.length) % walls.length];
  const k = 0.93 + paHash(spot.x, spot.z, 7) * 0.14;
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return (ch((pick >> 16) & 255) << 16) | (ch((pick >> 8) & 255) << 8) | ch(pick & 255);
}
