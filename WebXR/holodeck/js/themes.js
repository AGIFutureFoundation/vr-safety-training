/**
 * The theme registry — the only thing standing in for "the model understood
 * the theme" right now. Adding a theme means adding one entry here; nothing
 * else in the app needs to change, which is the whole point of keeping
 * "understand the prompt" and "render the course" as separate layers.
 */
export const THEMES = [
  {
    id: "alaska",
    name: "Alaskan Frontier",
    keywords: ["alaska", "alaskan", "arctic", "glacier", "igloo", "tundra", "aurora", "northern lights", "snowy", "snow"],
    sky: 0x0a1622,
    fog: 0x18324a,
    ground: 0xe7f1f7,
    fairway: 0xdfeef5,
    accent: 0x4fd1ff,
    wall: 0x2f6f8c,
    cupRing: 0xffe37a,
    props: ["pine", "igloo", "iceberg"],
  },
  {
    id: "desert",
    name: "Desert Mesa",
    keywords: ["desert", "sahara", "cactus", "mesa", "sand", "dune", "arizona", "canyon"],
    sky: 0x1a0f08,
    fog: 0x6b4a2a,
    ground: 0xd8b878,
    fairway: 0xc9a869,
    accent: 0xff8a3c,
    wall: 0x8c5a2f,
    cupRing: 0xffe37a,
    props: ["cactus", "mesa", "dune"],
  },
  {
    id: "tropical",
    name: "Tropical Lagoon",
    keywords: ["tropical", "hawaii", "hawaiian", "beach", "island", "lagoon", "palm", "tiki"],
    sky: 0x06181a,
    fog: 0x0f4a4a,
    ground: 0xe8dca0,
    fairway: 0xdccd8a,
    accent: 0x4fffb0,
    wall: 0x2f8c6f,
    cupRing: 0xffe37a,
    props: ["palm", "tiki", "lagoon"],
  },
];

export const DEFAULT_THEME_ID = "alaska";

export function findTheme(id) {
  return THEMES.find((t) => t.id === id) ?? THEMES.find((t) => t.id === DEFAULT_THEME_ID);
}
