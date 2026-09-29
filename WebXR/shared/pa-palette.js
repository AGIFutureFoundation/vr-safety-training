// PALETTE (docs/consoles/PALETTE.md): the parish engine's massing material hook. It sets NP_MASSING_HOOKS.material
// (shared/np-world.js) so every building kind wears its district character's colour category (shared/pa-palette-data.js)
// and, above the phone tier, one tileable texture pair (walls, roofs) from shared/textures.js's pixel painters.
//
// Seam:
//   paMount({ tier, hooks? }) -> { tier, stats() }     sets hooks.material (NP_MASSING_HOOKS by default); call it before
//                                                       npBuildParish. stats() -> { materials, atlases, atlasPixels, programs }
//   paMaterialFor(kind, parish, THREE, tier) -> material | null   (the hook itself, tier bound by paMount)
//   paAtlasFor(region, tier, THREE) -> THREE.DataTexture | null   one small atlas per region and tier, cached
//
// Budget: no new meshes. One material per (region, kind, tier), cached and shared across chunks; every textured one shares
// one shader program (customProgramCacheKey) and its region's one atlas. Per-building colour rides the InstancedMesh's
// instanceColor (the engine calls material.userData.npInstanceColour(spot) when present): the category colour replaces
// the light (wall) vertex colours and leaves the dark ones (roofs, slabs) as they were. The phone tier ("low") gets no
// atlas and a plain Lambert material: per-instance vertex colour only. Everything is procedural: no image is fetched.

import { NP_MASSING_HOOKS } from "./np-world.js";
import { txPxAtlas, TX_PX_GAIN } from "./textures.js";
import { PA_ATLAS_TIERS, PA_TEXTURES, paCategoryFor, paInstanceColour, paRegionOf, paRegionCategories, PA_CATEGORIES } from "./pa-palette-data.js";

/** Vertex colours brighter than this (linear luminance) are walls and take the building's category colour. */
const PA_WALL_LUM = 0.15;
const paMats = new Map();     // `${region}|${kind}|${tier}` -> material
const paAtlases = new Map();  // `${region}|${tier}` -> { tex, cells, width, height }

/** The painters a region's categories use, in a fixed order (walls then roofs, first seen first). */
export function paRegionPainters(region) {
  const ids = [];
  for (const cid of paRegionCategories(region)) for (const t of [PA_CATEGORIES[cid].wall, PA_CATEGORIES[cid].roof]) if (t && !ids.includes(t)) ids.push(t);
  return ids;
}

/** The region's atlas at a tier (null on the phone tier), cached: one DataTexture per region and tier. */
export function paAtlasFor(region, tier, THREE) {
  const cell = PA_ATLAS_TIERS[tier]?.cell ?? PA_ATLAS_TIERS.high.cell;
  if (!cell) return null;
  const key = `${region}|${tier}`;
  let a = paAtlases.get(key);
  if (!a) {
    const packed = txPxAtlas(paRegionPainters(region), { cell, cols: 4, pad: Math.max(2, cell / 32) });
    const tex = new THREE.DataTexture(packed.data, packed.width, packed.height, THREE.RGBAFormat);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.generateMipmaps = true;
    tex.name = `pa-atlas-${key}`; tex.needsUpdate = true;
    a = { tex, cells: packed.cells, width: packed.width, height: packed.height };
    paAtlases.set(key, a);
  }
  return a;
}

const PA_VERT_PARS = "#include <common>\nvarying vec2 vPaUv;\nvarying float vPaRoof;\nuniform vec2 uPaMetres;";
const PA_VERT = `#include <project_vertex>
{
  vec4 paP = vec4( transformed, 1.0 );
  vec3 paN = objectNormal;
#ifdef USE_INSTANCING
  paP = instanceMatrix * paP;
  paN = mat3( instanceMatrix ) * paN;
#endif
  paP = modelMatrix * paP;
  paN = abs( normalize( mat3( modelMatrix ) * paN ) );
  vPaRoof = paN.y > 0.7 ? 1.0 : 0.0;
  vPaUv = ( paN.y > 0.7 ? paP.xz : ( paN.x > paN.z ? paP.zy : paP.xy ) ) / ( vPaRoof > 0.5 ? uPaMetres.y : uPaMetres.x );
}`;
const PA_TINT = `#include <color_vertex>
#if defined( USE_COLOR ) && defined( USE_INSTANCING_COLOR )
  vColor.xyz = dot( color, vec3( 0.2126, 0.7152, 0.0722 ) ) > ${PA_WALL_LUM.toFixed(3)} ? instanceColor.xyz : color;
#endif`;
const PA_FRAG_PARS = "#include <common>\nvarying vec2 vPaUv;\nvarying float vPaRoof;\nuniform sampler2D uPaAtlas;\nuniform vec4 uPaWall;\nuniform vec4 uPaRoof;";
const PA_FRAG = `#include <map_fragment>
{
  vec4 paCell = vPaRoof > 0.5 ? uPaRoof : uPaWall;
  vec2 paUv = paCell.xy + fract( vPaUv ) * paCell.zw;
#if __VERSION__ >= 300
  float paD = textureGrad( uPaAtlas, paUv, dFdx( vPaUv ) * paCell.zw, dFdy( vPaUv ) * paCell.zw ).r;
#else
  float paD = texture2D( uPaAtlas, paUv ).r;
#endif
  diffuseColor.rgb *= paD * ${TX_PX_GAIN.toFixed(3)};
}`;

/** Patch a Lambert shader: the wall tint always; the atlas detail when `atlas` is given. Exported for the checker. */
export function paPatchShader(shader, { atlas = null, wall = [0, 0, 1, 1], roof = [0, 0, 1, 1], metres = [3, 3] } = {}) {
  shader.vertexShader = shader.vertexShader.replace("#include <color_vertex>", PA_TINT);
  if (atlas) {
    shader.uniforms.uPaAtlas = { value: atlas };
    shader.uniforms.uPaWall = { value: { x: wall[0], y: wall[1], z: wall[2], w: wall[3], isVector4: true } };
    shader.uniforms.uPaRoof = { value: { x: roof[0], y: roof[1], z: roof[2], w: roof[3], isVector4: true } };
    shader.uniforms.uPaMetres = { value: { x: metres[0], y: metres[1], isVector2: true } };
    shader.vertexShader = shader.vertexShader.replace("#include <common>", PA_VERT_PARS).replace("#include <project_vertex>", PA_VERT);
    shader.fragmentShader = shader.fragmentShader.replace("#include <common>", PA_FRAG_PARS).replace("#include <map_fragment>", PA_FRAG);
  }
  return shader;
}

/** The hook: a cached material for a massing kind on a map at a tier, or null (the engine keeps its flat material). */
export function paMaterialFor(kind, parish, THREE, tier = "high") {
  const cat = paCategoryFor(kind, parish);
  if (!cat || !THREE?.MeshLambertMaterial) return null;
  const region = paRegionOf(parish);
  const key = `${region}|${kind}|${tier}|${cat.id}`;
  let mat = paMats.get(key);
  if (mat) return mat;
  mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  mat.name = `pa-${cat.id}-${kind}-${tier}`;
  const colour = new THREE.Color();
  mat.userData.paCategory = cat.id;
  mat.userData.npInstanceColour = (spot) => colour.setHex(paInstanceColour(cat, spot));
  const atlas = paAtlasFor(region, tier, THREE);
  const opts = atlas ? {
    atlas: atlas.tex, wall: atlas.cells[cat.wall], roof: atlas.cells[cat.roof],
    metres: [PA_TEXTURES[cat.wall]?.metres ?? 3, PA_TEXTURES[cat.roof]?.metres ?? 3],
  } : {};
  mat.userData.paTextured = !!atlas;
  mat.onBeforeCompile = (shader) => { paPatchShader(shader, opts); };
  mat.customProgramCacheKey = () => (atlas ? "pa-atlas-1" : "pa-tint-1");
  paMats.set(key, mat);
  return mat;
}

/** Counts for the checker and the hand-back: cached materials, atlases and their pixels. */
export function paStats() {
  let atlasPixels = 0;
  for (const a of paAtlases.values()) atlasPixels += a.width * a.height;
  const mats = [...paMats.values()];
  return { materials: mats.length, textured: mats.filter((m) => m.userData.paTextured).length, atlases: paAtlases.size, atlasPixels,
    programs: new Set(mats.map((m) => m.customProgramCacheKey())).size };
}
/** Empty the caches (test harnesses only). */
export function paReset() { for (const m of paMats.values()) m.dispose?.(); for (const a of paAtlases.values()) a.tex.dispose?.(); paMats.clear(); paAtlases.clear(); }

/** Mount PALETTE: set the engine's material hook for this tier. Returns { tier, stats() }. */
export function paMount({ tier = "high", hooks = null } = {}) {
  const h = hooks ?? (typeof NP_MASSING_HOOKS !== "undefined" ? NP_MASSING_HOOKS : null);
  if (h) h.material = (kind, parish, THREE) => paMaterialFor(kind, parish, THREE, tier);
  return { tier, stats: paStats };
}
