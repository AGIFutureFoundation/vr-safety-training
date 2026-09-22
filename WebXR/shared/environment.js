import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

// Real-world environments: a licensed GLB — a scanned street, a modelled
// terminal, a surveyed shoreline — placed around a station in place of the
// generated district. The loader is three's own GLTFLoader, fetched on
// demand from the repository's own vendored copy, so a station that never
// declares an environment pays nothing for the feature. The page carries an
// import map for "three" so the loader shares the app's own three instance.
//
// A station declares
//   environment: { url: "assets/env/terminal.glb", scale: 1, position: [0, 0, 0],
//                  rotationY: 0, skyline: false, district: false }
// with the url relative to WebXR/. `?env=<url>` (with `envScale`, `envY`,
// `envRy`) previews any file against any station without editing it —
// which is how a model is judged before it is committed.
//
// Licensing is not the loader's job, but it is the reason the assets
// directory has a README: nothing goes in it without a licence that allows
// redistribution and an attribution line. Game rips are not that.

// three's GLTFLoader, vendored under WebXR/vendor (MIT) rather than fetched
// from a CDN, so the only network dependency stays the one three fetch every
// app already makes. Resolved against the WebXR root the same way assets are.
const LOADER_PATH = "vendor/three/examples/jsm/loaders/GLTFLoader.js";
let loaderModule = null;

/** The WebXR root for the page asking: the source page sits one directory
 *  below it and the bundled page two. */
function webxrBase() {
  const here = typeof document !== "undefined" ? document.baseURI : "";
  const m = here.match(/^(.*\/)(smartcity|trades|holodeck|instructor)\//);
  return m ? m[1] : (here ? new URL("../", here).href : "");
}

/** The environment a room asks for, or the one the URL asks to preview. */
export function environmentFor(room) {
  const q = typeof location !== "undefined" ? new URLSearchParams(location.search) : null;
  const url = q?.get("env");
  if (url) {
    return {
      url, scale: Number(q.get("envScale") ?? 1) || 1,
      position: [0, Number(q.get("envY") ?? 0) || 0, 0],
      rotationY: Number(q.get("envRy") ?? 0) || 0,
      skyline: q.get("envSkyline") === "1", district: q.get("envDistrict") === "1",
    };
  }
  return room?.environment ?? null;
}

/**
 * Load a GLB around the station.
 *   parent  the stage's root group, so the model is freed with the stage
 *   spec    the environment declaration (see above)
 *   stage   the stage handle, whose named "skyline" and "district" groups
 *           are hidden unless the spec keeps them
 * Resolves to the model's root group, or rejects with a readable error.
 */
export async function loadEnvironment(parent, spec, stage = null) {
  if (!spec?.url) throw new Error("environment needs a url");
  console.info(`[environment] loading ${spec.url}`);
  const base = webxrBase();
  loaderModule ??= await import(spec.loader ?? resolveUrl(LOADER_PATH, base));
  const loader = new loaderModule.GLTFLoader();
  const href = resolveUrl(spec.url, base);
  console.info(`[environment] fetching ${href}`);
  const gltf = await new Promise((resolve, reject) => loader.load(href, resolve, undefined, (e) => reject(new Error(`environment "${spec.url}" failed to load: ${e?.message ?? e}`))));
  console.info(`[environment] loaded ${spec.url}`);
  const root = gltf.scene;
  root.name = "environment";
  const s = spec.scale ?? 1;
  root.scale.set(s, s, s);
  const [px = 0, py = 0, pz = 0] = spec.position ?? [];
  root.position.set(px, py, pz);
  root.rotation.y = spec.rotationY ?? 0;
  // Everything the file brought in belongs to this stage and is freed with
  // it; a shared cache would keep a scanned street resident forever.
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = false; o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) { if (m) { m.userData.ownMaterial = true; m.userData.ownTexture = true; } }
  });
  parent.add(root);
  if (stage?.root) {
    const sky = stage.root.getObjectByName("skyline");
    const district = stage.root.getObjectByName("district");
    if (sky && !spec.skyline) sky.visible = false;
    if (district && !spec.district) district.visible = false;
  }
  return root;
}

function resolveUrl(url, base) {
  if (/^(https?:)?\/\//.test(url) || url.startsWith("/") || !base) return url;
  return new URL(url, base).href;
}
