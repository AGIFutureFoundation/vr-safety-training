#!/usr/bin/env node
/**
 * LANDMARKS-2 (docs/consoles/LANDMARKS-2.md): writes the `lm` tags below into the map data files (idempotent). A tag goes
 * only where the kit kind honestly fits the named place; everything else stays generic.
 *
 *     node tools/lx_tag_landmarks.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const LX_TAGS = [
  ["orleans", "jackson-square", "church-towers"], ["orleans", "crescent-city-connection", "truss-bridge"],
  ["orleans", "industrial-canal-lock", "canal-lock"], ["orleans", "seventeenth-street-canal", "levee-pump-station"],
  ["orleans", "london-avenue-canal", "levee-pump-station"], ["orleans", "bayou-bienvenue-platform", "marsh-boardwalk"],
  ["orleans", "bywater", "shotgun-row"],
  ["jefferson", "huey-p-long", "truss-bridge"], ["jefferson", "harvey-lock", "canal-lock"], ["jefferson", "seventeenth-street-canal", "levee-pump-station"],
  ["sf-downtown", "palace-of-fine-arts", "rotunda-colonnade"], ["sf-downtown", "lombard-street-crooked-block", "switchback-street"],
  ["sf-mission", "mission-dolores", "mission-church-front"],
  ["sf-golden-gate-park", "conservatory-of-flowers", "glasshouse"],
  ["sf-marina", "fort-point", "masonry-fort"], ["sf-marina", "palace-of-fine-arts", "rotunda-colonnade"],
  ["sf-bayview", "third-street-light-rail", "streetcar"],
  ["sf-outer-mission", "balboa-park-station", "transit-station"],
  ["sf-north-beach", "lombard-switchbacks", "switchback-street"], ["sf-north-beach", "dragon-gate", "gateway-arch"],
  ["sf-haight-castro", "sutro-tower", "lattice-mast"],
  ["oak-west-oakland", "west-oakland-station", "transit-station"],
  ["oak-downtown-lake", "fox-theater", "theatre-marquee"], ["oak-downtown-lake", "paramount-theatre", "theatre-marquee"],
  ["oak-downtown-lake", "grand-lake-theatre", "theatre-marquee"],
  ["oak-fruitvale-estuary", "fruitvale-station", "transit-station"],
  ["oak-emeryville-berkeley", "sather-tower", "campanile"],
  ["bay-san-pablo", "rosie-the-riveter-memorial", "memorial-plaza"], ["bay-san-pablo", "richmond-station", "transit-station"],
  ["bay-san-jose", "san-jose-city-hall", "civic-tower"], ["bay-san-jose", "diridon-station", "transit-station"],
  ["bp-san-leandro-bay", "arrowhead-marsh-place", "marsh-boardwalk"],
];

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  let n = 0;
  for (const [map, id, kind] of LX_TAGS) {
    const file = join(ROOT, "WebXR", "shared", `np-data-${map}.js`);
    let src = readFileSync(file, "utf8");
    // find the landmark object whose id is `id` inside the landmarks list (the first "id" match after "landmarks")
    const li = src.search(/"?landmarks"?\s*:/);
    const re = new RegExp(`"id"\\s*:\\s*"${id}"`, "g");
    re.lastIndex = li < 0 ? 0 : li;
    const m = re.exec(src);
    if (!m) { console.error(`  missing ${map}/${id}`); process.exitCode = 1; continue; }
    const end = src.indexOf("}", m.index);
    const body = src.slice(m.index, end);
    if (/"lm"\s*:/.test(body)) { src = src.slice(0, m.index) + body.replace(/"lm"\s*:\s*"[^"]*"/, `"lm": "${kind}"`) + src.slice(end); }
    else src = src.slice(0, m.index + m[0].length) + `, "lm": "${kind}"` + src.slice(m.index + m[0].length);
    writeFileSync(file, src); n++;
  }
  console.log(`lx_tag_landmarks: ${n} of ${LX_TAGS.length} tags written`);
}
