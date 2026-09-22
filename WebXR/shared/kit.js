import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

// Shared procedural asset kit. Every prop in the simulator is built from these
// primitives at real-world scale in metres, so rooms stay consistent and no
// external model files are needed.

export const TAU = Math.PI * 2;

// HUD tokens from DESIGN.md, reused so the web build reads like the headset build.
export const HUD = {
  void: "#071018", panel: "#101C27", raised: "#172735", text: "#F4F8FB",
  muted: "#9FB0BF", accent: "#37D6C0", warn: "#F2B84B", danger: "#F0645B",
  edge: "#426174", good: "#59C97B",
};

/**
 * What a step kind physically asks the learner's hands to do, in one short
 * verb for the HUD and one sentence for a first-time explainer. A room's own
 * `cue` text always says *what* to touch; this says *how* to touch it — the
 * part a new interaction (like turning a valve by dragging it) can't be
 * assumed to be obvious just from staring at the 3D object.
 */
export const GESTURE_HINTS = {
  select: { verb: "CLICK", tip: "Click the highlighted control to select it." },
  sequence: { verb: "CLICK IN ORDER", tip: "Click each highlighted item, in the order the procedure calls for." },
  find: { verb: "SEARCH & CLICK", tip: "Look around and click whatever you find wrong — some objects are decoys." },
  gauge: { verb: "WATCH & CLICK", tip: "Watch the marker sweep the band, then click to commit while it's centred." },
  hold: { verb: "PRESS & HOLD", tip: "Press and hold the highlighted control for the full duration — releasing early breaks it." },
  track: { verb: "HOLD TO CORRECT", tip: "Hold to raise the value, release to let it fall, and keep it inside the band." },
  turn: { verb: "CLICK & DRAG TO TURN", tip: "Click the control and drag in a circle around it, like turning a real wheel or handle." },
  drag: { verb: "CLICK & DRAG TO CARRY", tip: "Click and hold the object, drag it to the marker, then let go." },
};

const materialCache = new Map();

// ---------------------------------------------------------------- surfaces
//
// Every surface in the network used to be one flat colour, which is what made
// the scenes read as diagrams rather than places: real concrete is blotchy,
// real steel has a grain direction, real rubber scatters light unevenly. These
// build that variation procedurally — a roughness map and a normal map per
// finish, drawn once into a canvas at 256 square and then shared by every
// material that asks for the same finish.
//
// Sharing is the whole point. A map per material would multiply draw calls;
// one map instance per finish means a hundred concrete surfaces still batch
// the way they did before, and the cost is a few hundred kilobytes of texture
// memory rather than anything the frame budget notices.
const surfaceCache = new Map();
// `shade` is how much the finish darkens and lightens the base colour. It is
// the one that actually reads: roughness and normal variation change how a
// surface catches a moving light, but a still frame of flat-coloured concrete
// still looks like flat-coloured concrete until the colour itself varies.
const FINISHES = {
  // grain: 0 = isotropic speckle, 1 = horizontal brushing, -1 = vertical
  concrete:   { speckle: 0.34, cell: 3.2, grain: 0, bump: 1.4, shade: 0.26, rough: [0.70, 0.98] },
  asphalt:    { speckle: 0.46, cell: 2.1, grain: 0, bump: 1.8, shade: 0.30, rough: [0.80, 1.0] },
  brushed:    { speckle: 0.16, cell: 1.0, grain: 1, bump: 0.7, shade: 0.12, rough: [0.20, 0.46] },
  painted:    { speckle: 0.14, cell: 5.0, grain: 0, bump: 0.5, shade: 0.10, rough: [0.40, 0.64] },
  galvanised: { speckle: 0.30, cell: 1.6, grain: 0, bump: 1.0, shade: 0.20, rough: [0.32, 0.68] },
  rubber:     { speckle: 0.24, cell: 2.6, grain: 0, bump: 1.2, shade: 0.16, rough: [0.86, 1.0] },
  rust:       { speckle: 0.50, cell: 2.4, grain: 0, bump: 1.9, shade: 0.38, rough: [0.72, 1.0] },
  grating:    { speckle: 0.20, cell: 1.2, grain: -1, bump: 1.5, shade: 0.18, rough: [0.52, 0.88] },
};

function noiseCanvas(px, draw) {
  const c = document.createElement("canvas");
  c.width = px; c.height = px;
  const g = c.getContext("2d");
  draw(g, px);
  return c;
}

/**
 * The shared map set for one finish. Returns null when there is no canvas to
 * draw on — the headless checkers run without one, and a station has to build
 * there exactly as it does in a browser.
 */
export function surface(name) {
  const f = FINISHES[name];
  if (!f) return null;
  if (surfaceCache.has(name)) return surfaceCache.get(name);
  let set = null;
  try {
    const PX = 256;
    // Value noise at two scales: broad blotches, then fine tooth.
    const field = new Float32Array(PX * PX);
    const lattice = (n) => {
      const g = new Float32Array((n + 1) * (n + 1));
      for (let i = 0; i < g.length; i++) g[i] = Math.random();
      return (u, v) => {
        const x = u * n, y = v * n;
        const x0 = Math.floor(x), y0 = Math.floor(y);
        const fx = x - x0, fy = y - y0;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const at = (i, j) => g[(j % (n + 1)) * (n + 1) + (i % (n + 1))];
        return (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) +
               (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy;
      };
    };
    const broad = lattice(Math.max(2, Math.round(8 / f.cell)));
    const fine = lattice(Math.max(4, Math.round(48 / f.cell)));
    for (let y = 0; y < PX; y++) {
      for (let x = 0; x < PX; x++) {
        // Brushing stretches the sample along one axis, which is what gives
        // steel its direction under a moving light.
        const u = f.grain === 1 ? x / PX / 6 : x / PX;
        const v = f.grain === -1 ? y / PX / 6 : y / PX;
        field[y * PX + x] = broad(u, v) * 0.6 + fine(u, v) * 0.4;
      }
    }
    const [r0, r1] = f.rough;
    const roughCanvas = noiseCanvas(PX, (g) => {
      const img = g.createImageData(PX, PX);
      for (let i = 0; i < PX * PX; i++) {
        const n = (field[i] - 0.5) * f.speckle * 2;
        const r = Math.max(0, Math.min(1, (r0 + r1) / 2 + n * (r1 - r0)));
        const v = Math.round(r * 255);
        img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    });
    // Normals from the height field's own slope, so the bumps line up with the
    // roughness rather than being an unrelated pattern laid over it.
    const normCanvas = noiseCanvas(PX, (g) => {
      const img = g.createImageData(PX, PX);
      const at = (x, y) => field[((y + PX) % PX) * PX + ((x + PX) % PX)];
      for (let y = 0; y < PX; y++) {
        for (let x = 0; x < PX; x++) {
          const dx = (at(x + 1, y) - at(x - 1, y)) * f.bump * 4;
          const dy = (at(x, y + 1) - at(x, y - 1)) * f.bump * 4;
          const len = Math.hypot(dx, dy, 1);
          const i = (y * PX + x) * 4;
          img.data[i] = Math.round((-dx / len * 0.5 + 0.5) * 255);
          img.data[i + 1] = Math.round((-dy / len * 0.5 + 0.5) * 255);
          img.data[i + 2] = Math.round((1 / len * 0.5 + 0.5) * 255);
          img.data[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
    });
    // Greyscale blotching that multiplies the material's own colour, so one
    // map serves every colour a finish is ever used in.
    const shadeCanvas = noiseCanvas(PX, (g) => {
      const img = g.createImageData(PX, PX);
      for (let i = 0; i < PX * PX; i++) {
        const v = Math.round(Math.max(0, Math.min(1, 1 - f.shade / 2 + (field[i] - 0.5) * f.shade)) * 255);
        img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    });
    const wrap = (c) => {
      const t = new THREE.CanvasTexture(c);
      t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 4;
      return t;
    };
    const shadeMap = wrap(shadeCanvas);
    shadeMap.colorSpace = THREE.SRGBColorSpace ?? shadeMap.colorSpace;
    set = { map: shadeMap, roughnessMap: wrap(roughCanvas), normalMap: wrap(normCanvas), bump: f.bump };
  } catch (e) {
    set = null;                       // headless: no canvas, so no maps
  }
  surfaceCache.set(name, set);
  return set;
}

export function mat(color, o = {}) {
  const key = [color, o.rough ?? 0.8, o.metal ?? 0, o.emissive ?? 0, o.ei ?? 1,
    o.opacity ?? 1, o.flat ? 1 : 0, o.side ?? 0, o.finish ?? "", String(o.tile ?? 1)].join("|");
  let m = materialCache.get(key);
  if (!m) {
    const skin = o.finish ? surface(o.finish) : null;
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: o.rough ?? 0.8,
      metalness: o.metal ?? 0,
      emissive: o.emissive ?? 0x000000,
      emissiveIntensity: o.ei ?? 1,
      transparent: (o.opacity ?? 1) < 1,
      opacity: o.opacity ?? 1,
      flatShading: !!o.flat,
      side: o.side === 2 ? THREE.DoubleSide : THREE.FrontSide,
      ...(skin ? { map: skin.map, roughnessMap: skin.roughnessMap, normalMap: skin.normalMap } : {}),
    });
    // `tile` may be a number or a [u, v] pair. The pair matters: a kerb is
    // twelve metres long and half a metre tall, and tiling it equally on both
    // axes squashes the grain into horizontal stripes that read as a defect
    // rather than as concrete.
    const tu = Array.isArray(o.tile) ? o.tile[0] : (o.tile ?? 1);
    const tv = Array.isArray(o.tile) ? o.tile[1] : (o.tile ?? 1);
    if (skin && (tu !== 1 || tv !== 1)) {
      // A tiled material needs its own texture objects, since repeat lives on
      // the texture rather than the material. Still one set per (finish, tile)
      // rather than one set per surface in the scene.
      const rm = skin.roughnessMap.clone(), nm = skin.normalMap.clone(), am = skin.map.clone();
      rm.needsUpdate = nm.needsUpdate = am.needsUpdate = true;
      for (const t of [rm, nm, am]) t.repeat.set(tu, tv);
      m.roughnessMap = rm; m.normalMap = nm; m.map = am;
    }
    if (skin) {
      const b = (o.bump ?? 1) * (skin.bump ?? 1);
      m.normalScale = new THREE.Vector2(b, b);
    }
    materialCache.set(key, m);
  }
  return m;
}

// A geometry-constructor passthrough — every call site below wraps its own
// `new THREE.XGeometry(...)` in this. It used to also add the geometry to a
// module-level Set for later disposal, but disposeTree() below never
// actually read that Set (it disposes by traversing the live scene graph
// instead) — pure dead bookkeeping, removed.
function track(geometry) { return geometry; }

/**
 * Give a mesh a material of its own.
 *
 * mat() returns a SHARED cached material keyed on its parameters, which is
 * what keeps draw calls down — but it means `mesh.material.emissiveIntensity =
 * x` in an animate loop writes to every other mesh built with the same colour
 * and finish. The skyline beacons already cloned by hand for exactly this
 * reason; anything else that animates a material has to do the same, and
 * mergeStatic() reads the ownMaterial flag to know what it must leave alone.
 */
export function ownMaterial(mesh) {
  mesh.material = mesh.material.clone();
  mesh.material.userData.ownMaterial = true;
  return mesh;
}

/**
 * Collapse static scenery into one mesh per material.
 *
 * An outdoor SmartCiti.X scene was measuring 518 draw calls: 652 visible
 * meshes, and frustum culling only takes about a fifth of those off because
 * most of the scene is the ground and the horizon, which are always in shot. A
 * Quest wants that number in the low hundreds.
 *
 * Almost all of it is scenery that never moves and is never clicked — the
 * skyline, the district, the light masts, the site fence, the laydown. Every
 * one of those meshes already shares a cached material with its neighbours
 * (see mat()), so they can be baked into a single buffer per material and
 * drawn in one call. Nothing about how the scenery is authored changes: it is
 * still written as boxes and cylinders in readable code, and this runs once at
 * the end of the build.
 *
 * What it will NOT touch, and why the caller has to be deliberate:
 *   - anything interactive: it would lose its own transform and its id
 *   - anything animated: a merged mesh has no separate parts to move
 *   - anything with its own material or texture (decals, canvas panels), which
 *     is one draw call each whatever happens
 * Pass only subtrees that are none of those.
 *
 * Returns { before, after } so a caller can report what it saved. A no-op on
 * a THREE without the geometry API (the headless checkers' stub), so the same
 * build runs in both places.
 */
export function mergeStatic(root, o = {}) {
  const probe = new THREE.BufferGeometry();
  if (typeof probe.setAttribute !== "function" || typeof probe.applyMatrix4 !== "function") {
    return { before: 0, after: 0, skipped: "no geometry API" };
  }
  root.updateMatrixWorld?.(true);
  // `local` bakes into the subtree's OWN space instead of the world's, so the
  // subtree keeps its transform and can still be moved, turned or driven as a
  // unit. That is what makes ambient life affordable: a figure or a vehicle
  // becomes two or three draw calls that still walk around, instead of twenty
  // that cannot be merged at all because the thing moves.
  const local = !!o.local;
  const inverse = local && root.matrixWorld ? new THREE.Matrix4().copy(root.matrixWorld).invert() : null;
  const buckets = new Map();
  const doomed = [];
  let before = 0;
  root.traverse((o) => {
    if (!o.isMesh) return;
    before += 1;
    // Leave alone anything that has to stay its own object.
    if (o.userData?.interactiveId || o.userData?.noMerge || o.userData?.canvas) return;
    if (!o.geometry?.attributes?.position || o.material?.userData?.ownMaterial) return;
    if (Array.isArray(o.material)) return;
    let list = buckets.get(o.material);
    if (!list) { list = []; buckets.set(o.material, list); }
    list.push(o);
    doomed.push(o);
  });

  for (const [material, meshes] of buckets) {
    if (meshes.length < 2) continue;
    const positions = [], normals = [], uvs = [];
    let ok = true;
    for (const m of meshes) {
      let g = m.geometry;
      if (g.index) g = g.toNonIndexed();
      else g = g.clone();
      g.applyMatrix4(m.matrixWorld);
      if (inverse) g.applyMatrix4(inverse);
      const pos = g.getAttribute("position"), nor = g.getAttribute("normal"), uv = g.getAttribute("uv");
      if (!pos || !nor) { ok = false; g.dispose(); break; }
      for (let i = 0; i < pos.count; i++) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
        uvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
      }
      g.dispose();
    }
    if (!ok) continue;
    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
    merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    merged.computeBoundingSphere();
    const one = new THREE.Mesh(merged, material);
    // In world mode the geometry already carries its world placement, so the
    // holder must not add a transform on top of it. In local mode the holder
    // is the thing that moves, so it keeps updating normally.
    if (!local) one.matrixAutoUpdate = false;
    one.castShadow = meshes.some((m) => m.castShadow);
    one.receiveShadow = meshes.some((m) => m.receiveShadow);
    one.userData.merged = meshes.length;
    root.add(one);
    for (const m of meshes) { m.geometry.dispose(); m.parent?.remove(m); }
  }

  let after = 0;
  root.traverse((o) => { if (o.isMesh) after += 1; });
  void doomed;
  return { before, after };
}

/** Dispose geometry created for a room. Materials stay cached and shared. */
export function disposeTree(root) {
  root.traverse((o) => {
    if (o.isMesh || o.isLine || o.isPoints) {
      o.geometry?.dispose();
      if (o.material?.map && o.material.userData.ownTexture) o.material.map.dispose();
      if (o.material?.userData.ownMaterial) o.material.dispose();
    }
  });
  root.parent?.remove(root);
}

export function group(parent, x = 0, y = 0, z = 0, ry = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  parent?.add(g);
  return g;
}

export function box(parent, w, h, d, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.BoxGeometry(w, h, d)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function cyl(parent, rTop, rBot, h, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(
    track(new THREE.CylinderGeometry(rTop, rBot, h, o.seg ?? 20, 1, !!o.open)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function ball(parent, r, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.SphereGeometry(r, o.seg ?? 18, o.seg2 ?? 14)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

export function torus(parent, r, tube, x, y, z, color, o = {}) {
  const m = new THREE.Mesh(track(new THREE.TorusGeometry(r, tube, o.seg ?? 10, o.seg2 ?? 24)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  parent.add(m);
  return m;
}

/** Rounded slab — a box with chamfered vertical edges. Reads far better than a plain cube. */
export function slab(parent, w, h, d, x, y, z, color, o = {}) {
  const r = Math.min(o.radius ?? 0.02, w / 2 - 0.001, d / 2 - 0.001);
  const shape = new THREE.Shape();
  const hw = w / 2 - r, hd = d / 2 - r;
  shape.moveTo(-hw - r, -hd);
  shape.lineTo(-hw - r, hd);
  shape.quadraticCurveTo(-hw - r, hd + r, -hw, hd + r);
  shape.lineTo(hw, hd + r);
  shape.quadraticCurveTo(hw + r, hd + r, hw + r, hd);
  shape.lineTo(hw + r, -hd);
  shape.quadraticCurveTo(hw + r, -hd - r, hw, -hd - r);
  shape.lineTo(-hw, -hd - r);
  shape.quadraticCurveTo(-hw - r, -hd - r, -hw - r, -hd);
  const geo = track(new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 4 }));
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, h / 2, 0);
  const m = new THREE.Mesh(geo, mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

/** Lathe profile — bottles, jars, funnels. `profile` is [[radius, y], ...] bottom-up. */
export function lathe(parent, profile, x, y, z, color, o = {}) {
  const pts = profile.map(([r, py]) => new THREE.Vector2(Math.max(r, 0.0005), py));
  const m = new THREE.Mesh(track(new THREE.LatheGeometry(pts, o.seg ?? 20)), mat(color, o));
  m.position.set(x, y, z);
  m.castShadow = o.cast !== false;
  m.receiveShadow = o.receive !== false;
  parent.add(m);
  return m;
}

/** Flexible run — cables, hoses, tubing. `points` are local Vector3-ish triples. */
export function hose(parent, points, radius, color, o = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  const m = new THREE.Mesh(
    track(new THREE.TubeGeometry(curve, o.steps ?? 32, radius, o.seg ?? 8, false)), mat(color, o));
  m.castShadow = o.cast !== false;
  parent.add(m);
  return m;
}

// ---------------------------------------------------------------- canvas art

/** Painted panel: signage, dials, labels, screens. Returns the mesh; texture is owned by it. */
export function decal(parent, w, h, x, y, z, draw, o = {}) {
  const px = o.px ?? 512;
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = Math.max(8, Math.round(px * (h / w)));
  const g = canvas.getContext("2d");
  draw(g, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  const material = new THREE.MeshStandardMaterial({
    map: tex, roughness: o.rough ?? 0.7, metalness: o.metal ?? 0,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    emissiveMap: o.glow ? tex : null,
    transparent: !!o.transparent,
    side: THREE.DoubleSide,
  });
  material.userData.ownMaterial = true;
  material.userData.ownTexture = true;
  const m = new THREE.Mesh(track(new THREE.PlaneGeometry(w, h)), material);
  m.position.set(x, y, z);
  m.castShadow = false;
  m.receiveShadow = false;
  m.userData.canvas = canvas;
  m.userData.ctx = g;
  m.userData.texture = tex;
  parent.add(m);
  return m;
}

export function repaint(mesh, draw) {
  const { ctx, canvas, texture } = mesh.userData;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  texture.needsUpdate = true;
}

// ---------------------------------------------------------------- surface texture helpers

/**
 * Flat gradient fill for a canvas 2D context. Falls back to a solid fill using the
 * gradient's last stop when the context has no real gradient support (e.g. the
 * headless mock used by the CI content checkers), so callers never need to special-case it.
 */
export function gradientFill(g, w, h, stops, o = {}) {
  let grad = null;
  try {
    grad = o.radial
      ? g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2)
      : g.createLinearGradient(0, 0, o.horizontal ? w : 0, o.horizontal ? 0 : h);
  } catch { grad = null; }
  if (grad && typeof grad.addColorStop === "function") {
    for (const [stop, color] of stops) grad.addColorStop(stop, color);
    g.fillStyle = grad;
  } else {
    g.fillStyle = stops[stops.length - 1][1];
  }
  g.fillRect(0, 0, w, h);
}

/** Cheap grain: scattered translucent specks that break up a flat canvas fill. */
export function noiseTexture(g, w, h, o = {}) {
  const count = Math.round((o.density ?? 900) * (w * h) / (512 * 512));
  const alpha = o.alpha ?? 0.05;
  const tone = o.tone ?? "0,0,0";
  for (let i = 0; i < count; i++) {
    g.fillStyle = `rgba(${tone},${(Math.random() * alpha).toFixed(3)})`;
    g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
  }
}

/**
 * Weathering pass: soft grime blotches and drip streaks toward the lower half of a
 * panel. Silently draws nothing where the 2D context has no gradient support, rather
 * than throwing, so it is safe to call from code paths the headless checkers exercise.
 */
export function grimeOverlay(g, w, h, o = {}) {
  const tone = o.tone ?? "18,14,9";
  const alpha = o.alpha ?? 0.22;
  for (let i = 0; i < (o.blotches ?? 4); i++) {
    const x = Math.random() * w, y = h * (0.5 + Math.random() * 0.5);
    const r = Math.min(w, h) * (0.18 + Math.random() * 0.22);
    let grad = null;
    try { grad = g.createRadialGradient(x, y, 0, x, y, r); } catch { grad = null; }
    if (!grad || typeof grad.addColorStop !== "function") continue;
    grad.addColorStop(0, `rgba(${tone},${alpha})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < (o.streaks ?? 3); i++) {
    const x = w * (0.1 + Math.random() * 0.8);
    const len = h * (0.25 + Math.random() * 0.45);
    let grad = null;
    try { grad = g.createLinearGradient(x, 0, x, len); } catch { grad = null; }
    if (!grad || typeof grad.addColorStop !== "function") continue;
    grad.addColorStop(0, `rgba(${tone},${alpha * 0.8})`);
    grad.addColorStop(1, `rgba(${tone},0)`);
    g.fillStyle = grad;
    g.fillRect(x - (o.streakWidth ?? 2), 0, o.streakWidth ?? 2, len);
  }
}

/** Standard sign face: dark plate, accent rule, centred caps text. */
export function signFace(text, o = {}) {
  return (g, w, h) => {
    g.fillStyle = o.bg ?? "#0b141d";
    g.fillRect(0, 0, w, h);
    if (o.worn) {
      noiseTexture(g, w, h, { density: 500, alpha: 0.05, tone: "0,0,0" });
      grimeOverlay(g, w, h, { blotches: 2, streaks: 2, alpha: 0.16 });
    }
    g.fillStyle = o.accent ?? HUD.accent;
    g.fillRect(0, h - Math.max(3, h * 0.07), w, Math.max(3, h * 0.07));
    g.fillStyle = o.fg ?? HUD.text;
    g.font = `600 ${Math.round(h * (o.scale ?? 0.46))}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const lines = String(text).split("\n");
    const step = h * 0.44;
    lines.forEach((line, i) => g.fillText(line, w / 2, h / 2 - ((lines.length - 1) * step) / 2 + i * step));
  };
}

/** Printed paper: permit, chart, schedule, label sheet. */
export function paperFace(title, rows, o = {}) {
  return (g, w, h) => {
    g.fillStyle = o.bg ?? "#f2efe6";
    g.fillRect(0, 0, w, h);
    if (o.worn) {
      noiseTexture(g, w, h, { density: 350, alpha: 0.05, tone: o.wornTone ?? "90,74,46" });
      grimeOverlay(g, w, h, { blotches: 2, streaks: 1, tone: o.wornTone ?? "120,96,52", alpha: 0.16 });
    }
    g.fillStyle = o.band ?? "#22303c";
    g.fillRect(0, 0, w, h * 0.16);
    g.fillStyle = "#ffffff";
    g.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText(title, w * 0.05, h * 0.08);
    g.fillStyle = "#1d262e";
    g.font = `${Math.round(h * 0.062)}px Arial, sans-serif`;
    rows.forEach((row, i) => {
      const y = h * 0.26 + i * h * 0.1;
      g.fillStyle = "#63707c";
      g.fillRect(w * 0.05, y + h * 0.045, w * 0.9, 1);
      g.fillStyle = "#1d262e";
      g.fillText(row, w * 0.06, y);
    });
  };
}

// ---------------------------------------------------------------- room shells

/**
 * Enclosed room shell with floor, four walls, ceiling and a skirting rail.
 * Rooms are built around the origin; the learner spawns near +z looking to -z.
 */
/**
 * Light a room in proportion to its floor, not to a number somebody typed once.
 *
 * Each bay hand-placed three or four ceiling fittings, which was right for an
 * eight-metre room and leaves a fourteen-metre one with black corners and a
 * far wall nobody can read. This lays fittings on a grid whose spacing is
 * fixed, so a bigger floor simply gets more of them, and adds the low
 * hemisphere fill that stops an unlit corner going to pure black — a real shop
 * has bounce off the walls and these rooms had none at all.
 *
 * Call it after spreadLayout(), so the grid is sized to the room the learner
 * actually walks into.
 */
export function ceilingGrid(parent, w, d, o = {}) {
  const spacing = o.spacing ?? 5.0;
  const nx = Math.max(2, Math.min(3, Math.round(w / spacing)));
  const nz = Math.max(2, Math.min(3, Math.round(d / spacing)));
  const y = o.y ?? 2.94;
  const cellW = w / nx, cellD = d / nz;
  const colour = o.color ?? 0xfff4e2;
  const lamps = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const x = (i + 0.5) * cellW - w / 2;
      const z = (j + 0.5) * cellD - d / 2;
      // One emissive slab per fitting, not a housing plus a lens: at ceiling
      // height the housing is never seen, and doubling the mesh count of every
      // fitting in every room to draw it put the colour studio over budget.
      lamps.push(box(parent, Math.min(cellW * 0.42, 3.4), 0.05, 0.3, x, y, z, colour,
        { cast: false, emissive: colour, ei: o.ei ?? 1.6, rough: 0.4 }));
      // Light only a checker of the fittings, with the range to cover their
      // neighbours. A dozen point lights in one room is a real cost on a
      // headset and buys nothing a wider-throw half-dozen does not.
      if ((i + j) % 2 === 0) {
        const lamp = new THREE.PointLight(colour, o.lamp ?? 2.2, o.range ?? Math.max(14, spacing * 3.2), 2);
        lamp.position.set(x, y - 0.2, z);
        parent.add(lamp);
      }
    }
  }
  // Bounce. Without it a face turned away from every fitting renders black,
  // which is the one thing a real room never does.
  parent.add(new THREE.HemisphereLight(o.sky ?? 0xdceaf6, o.groundTone ?? 0x4a535d, o.fill ?? 0.95));
  return lamps;
}

/**
 * Push a room's workstations apart without resizing any of them.
 *
 * Every bay was laid out inside about eight metres because that is all the
 * learner was ever allowed to walk. Making the room bigger on its own just
 * adds an empty ring of floor: the bench, the machine, the permit board and
 * the PPE stand all stay huddled in the middle, and the extra space reads as
 * a mistake rather than a shop.
 *
 * This scales the POSITION of each thing standing on the room floor, and
 * nothing else. A bench four metres out goes to six and a half; the bench
 * itself, and everything parented to it, is untouched, because a child's
 * position is local to its group. Anything already at the origin — the shell,
 * the floor paint — does not move, which is exactly right.
 *
 * Call it at the end of build(), before returning, so the room a checker
 * measures is the room the learner walks into.
 */
export function spreadLayout(root, k = 1) {
  if (!(k > 0) || k === 1) return root;
  for (const child of root.children ?? []) {
    child.position.x *= k;
    child.position.z *= k;
  }
  return root;
}

// 0xrrggbb to the "#rrggbb" a canvas context wants.
export function hex(color) {
  return `#${(color & 0xffffff).toString(16).padStart(6, "0")}`;
}

export function shell(parent, o = {}) {
  const w = o.w ?? 8, d = o.d ?? 8, h = o.h ?? 3.1;
  const g = group(parent);
  // Finishes, not flat colour: a shop floor is sealed concrete with a tooth to
  // it, and block walls are painted rather than poured light. The maps are
  // shared per finish (see surface()), so this costs texture memory and not
  // draw calls. Tiling is set against the room's size so the grain stays the
  // same physical scale whether the bay is six metres or twelve.
  const FLOOR_TILE = Math.max(2, Math.round(Math.max(w, d) / 2.4));
  const WALL_TILE = Math.max(2, Math.round(Math.max(w, d) / 3.2));
  const floor = box(g, w, 0.12, d, 0, -0.06, 0, o.floor ?? 0x3a4048,
    { rough: o.floorRough ?? 0.85, metal: o.floorMetal ?? 0, cast: false,
      finish: o.floorFinish ?? "concrete", tile: FLOOR_TILE });
  floor.receiveShadow = true;
  const wallOpts = { rough: 0.94, cast: false, finish: o.wallFinish ?? "painted", tile: WALL_TILE };
  box(g, w, h, 0.12, 0, h / 2, -d / 2, o.wall ?? 0x5b6672, wallOpts);
  box(g, 0.12, h, d, -w / 2, h / 2, 0, o.wall ?? 0x5b6672, wallOpts);
  box(g, 0.12, h, d, w / 2, h / 2, 0, o.wall ?? 0x5b6672, wallOpts);
  box(g, w, 0.12, d, 0, h, 0, o.ceiling ?? 0x2b3238, { rough: 0.96, cast: false, finish: "painted", tile: WALL_TILE });
  if (o.backWall !== false) box(g, w, h, 0.12, 0, h / 2, d / 2, o.wall ?? 0x5b6672, wallOpts);
  if (o.skirt !== false) {
    box(g, w, 0.1, 0.04, 0, 0.05, -d / 2 + 0.08, o.skirtColor ?? 0x2a3038, { cast: false });
    box(g, 0.04, 0.1, d, -w / 2 + 0.08, 0.05, 0, o.skirtColor ?? 0x2a3038, { cast: false });
    box(g, 0.04, 0.1, d, w / 2 - 0.08, 0.05, 0, o.skirtColor ?? 0x2a3038, { cast: false });
  }
  // A real shop has paint on the floor, a trim line on the wall, structure in
  // the ceiling and a way out. A room that has none of those reads as a box
  // with props in it, so any room can ask for them here.
  if (o.walkway) floorPaint(g, w, d, o.walkway === true ? {} : o.walkway);
  if (o.trim) wallTrim(g, w, d, h, o.trim);
  if (o.structure) ceilingStructure(g, w, d, h, o.structure, o.structureColor);
  if (o.door) wayOut(g, w, d, h, o.door, o.doorColor, { daylight: o.doorDaylight });
  return g;
}

// Floor paint: a walkway down the middle with a hazard-hatched edge either
// side, the way a shop marks where you are allowed to stand. One decal, so it
// costs a single mesh however detailed the marking is.
export function floorPaint(parent, w, d, o = {}) {
  const lane = o.lane ?? 0xf2c14b, hatch = o.hatch ?? 0xd8dde3, base = o.base ?? null;
  const px = o.px ?? 1024;
  // Everything here is set out in metres and converted, not in fractions of
  // the canvas. Drawn in fractions, the same markings on a fourteen-metre
  // floor came out as sparse white ticks scattered across it that read as
  // litter rather than as a hazard border.
  const perM = px / w;
  const laneW = o.laneMetres ?? 1.9;     // a walkway you can pass someone in
  const margin = o.marginMetres ?? 0.85; // the hazard border along the walls
  const pitch = o.pitchMetres ?? 0.34;   // stripe spacing in that border
  const m = decal(parent, w, d, 0, 0.012, 0, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    if (base) { g.fillStyle = hex(base); g.fillRect(0, 0, cw, ch); }
    const lw = laneW * perM, lx = (cw - lw) / 2;
    g.fillStyle = `${hex(lane)}22`;
    g.fillRect(lx, 0, lw, ch);
    g.strokeStyle = hex(lane); g.lineWidth = Math.max(3, 0.1 * perM);
    g.beginPath(); g.moveTo(lx, 0); g.lineTo(lx, ch); g.moveTo(lx + lw, 0); g.lineTo(lx + lw, ch); g.stroke();
    // Hazard border: continuous diagonal stripes at a fixed pitch, so the
    // band reads as painted-on chevrons at any room size.
    const marg = margin * perM, step = pitch * perM;
    g.strokeStyle = hex(hatch); g.lineWidth = Math.max(2, 0.09 * perM);
    for (let y = -marg; y < ch + marg; y += step) {
      g.beginPath(); g.moveTo(0, y); g.lineTo(marg, y + marg); g.stroke();
      g.beginPath(); g.moveTo(cw, y); g.lineTo(cw - marg, y + marg); g.stroke();
    }
  }, { px, transparent: !base, rough: 0.9 });
  m.rotation.x = -Math.PI / 2;
  return m;
}

// Wall trim: the painted band at shoulder height that tells you at a glance
// whose bay you are standing in. Three walls, three meshes.
export function wallTrim(parent, w, d, h, color, o = {}) {
  const y = o.y ?? Math.min(2.1, h - 0.9), t = o.thickness ?? 0.09;
  const g = group(parent);
  box(g, w, t, 0.02, 0, y, -d / 2 + 0.07, color, { cast: false, rough: 0.7 });
  box(g, 0.02, t, d, -w / 2 + 0.07, y, 0, color, { cast: false, rough: 0.7 });
  box(g, 0.02, t, d, w / 2 - 0.07, y, 0, color, { cast: false, rough: 0.7 });
  return g;
}

// Ceiling structure: pipe runs on hangers for a plant or service room, roof
// trusses for a shop or bay, bare for a clinic or salon that really does have
// a flat tile ceiling.
export function ceilingStructure(parent, w, d, h, kind, color) {
  const g = group(parent);
  const steel = color ?? 0x6b7581;
  if (kind === "pipes") {
    const runs = [[-w * 0.26, 0.20], [0, 0.13], [w * 0.24, 0.16]];
    for (const [x, r] of runs) {
      const pipe = cyl(g, r, r, d - 0.4, x, h - 0.34, 0, steel, { seg: 12, cast: false, rough: 0.55, metal: 0.6 });
      pipe.rotation.x = Math.PI / 2;
      for (const z of [-d * 0.3, 0, d * 0.3]) {
        box(g, 0.05, 0.3, 0.05, x, h - 0.19, z, 0x4b5460, { cast: false, rough: 0.7, metal: 0.4 });
      }
    }
  } else if (kind === "trusses") {
    for (const z of [-d * 0.3, 0, d * 0.3]) {
      box(g, w - 0.3, 0.1, 0.12, 0, h - 0.5, z, steel, { cast: false, rough: 0.6, metal: 0.5 });
      box(g, w - 0.3, 0.1, 0.12, 0, h - 0.14, z, steel, { cast: false, rough: 0.6, metal: 0.5 });
      for (let i = -2; i <= 2; i++) {
        const web = box(g, 0.06, 0.42, 0.06, (i * (w - 0.8)) / 5, h - 0.32, z, steel,
          { cast: false, rough: 0.6, metal: 0.5 });
        web.rotation.z = i % 2 ? 0.5 : -0.5;
      }
    }
  }
  return g;
}

// A way out. Not decoration: a room with no visible exit is the one thing a
// trainee notices as wrong, and in a hot-work or confined bay the exit is part
// of the procedure being taught.
export function wayOut(parent, w, d, h, kind, color, o = {}) {
  const g = group(parent, 0, 0, d / 2 - 0.08);
  const frame = color ?? 0x3b434d;
  if (kind === "shutter") {
    const dw = Math.min(2.8, w * 0.42), dh = Math.min(2.6, h - 0.25);
    box(g, dw + 0.2, 0.14, 0.1, 0, dh + 0.08, 0, frame, { cast: false, rough: 0.7, metal: 0.4 });
    for (let i = 0; i < 9; i++) {
      box(g, dw, dh / 9 - 0.02, 0.06, 0, 0.08 + (i + 0.5) * (dh / 9), 0, i % 2 ? 0x8a929b : 0x7b838c,
        { cast: false, rough: 0.6, metal: 0.45 });
    }
  } else if (kind === "personnel") {
    const dw = 0.98, dh = Math.min(2.1, h - 0.4);
    box(g, dw + 0.12, dh + 0.08, 0.08, 0, dh / 2, 0, frame, { cast: false, rough: 0.8 });
    box(g, dw, dh, 0.05, 0, dh / 2, 0.03, 0xb8c0c8, { cast: false, rough: 0.55, metal: 0.3 });
    cyl(g, 0.03, 0.03, 0.26, dw / 2 - 0.16, dh * 0.48, 0.09, 0xd8dde3, { seg: 10, cast: false, metal: 0.7, rough: 0.35 });
    // Exit sign above it, lit, because that is how you find it in smoke.
    box(g, 0.44, 0.17, 0.05, 0, dh + 0.22, 0, 0x1d6b3a, { cast: false, emissive: 0x2fbf6a, ei: 1.3, rough: 0.5 });
  } else if (kind === "dock") {
    const dw = Math.min(3.2, w * 0.46), dh = Math.min(2.7, h - 0.2);
    box(g, dw + 0.3, 0.16, 0.12, 0, dh + 0.1, 0, frame, { cast: false, rough: 0.75 });
    box(g, 0.16, dh, 0.12, -dw / 2 - 0.12, dh / 2, 0, frame, { cast: false, rough: 0.75 });
    box(g, 0.16, dh, 0.12, dw / 2 + 0.12, dh / 2, 0, frame, { cast: false, rough: 0.75 });
    // Daylight in the opening, so the room reads as connected to outside. A
    // room built without that wall is already open, so it skips the pane.
    if (o.daylight !== false) {
      box(g, dw, dh, 0.03, 0, dh / 2, 0.02, 0xa8bccd, { cast: false, emissive: 0x8fb0c9, ei: 0.85, rough: 0.9 });
    }
  }
  return g;
}

/** Recessed ceiling panel that also acts as the room's key light source. */
export function ceilingPanel(parent, x, z, o = {}) {
  const y = o.y ?? 3.02;
  box(parent, o.w ?? 1.2, 0.06, o.d ?? 0.32, x, y, z, 0x22282e, { cast: false, rough: 0.6, metal: 0.5 });
  const lens = box(parent, (o.w ?? 1.2) - 0.08, 0.03, (o.d ?? 0.32) - 0.06, x, y - 0.05, z,
    o.color ?? 0xfff4e2, { cast: false, emissive: o.color ?? 0xfff4e2, ei: o.ei ?? 1.5, rough: 0.4 });
  const lamp = new THREE.PointLight(o.color ?? 0xfff4e2, o.lamp ?? 1.5, o.range ?? 9, 2);
  lamp.position.set(x, y - 0.18, z);
  parent.add(lamp);
  return lens;
}

// ------------------------------------------------------------ composite props

/** Stainless / laminate work counter with legs, apron and optional undershelf. */
export function counter(parent, w, d, x, z, color = 0x9aa4ad, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const hgt = o.height ?? 0.92;
  slab(g, w, 0.05, d, 0, hgt, 0, color, { rough: o.rough ?? 0.34, metal: o.metal ?? 0.72, radius: 0.02 });
  box(g, w - 0.06, 0.1, 0.03, 0, hgt - 0.08, -d / 2 + 0.03, color, { rough: 0.4, metal: 0.6, finish: "brushed", tile: 2 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(g, 0.022, 0.022, hgt - 0.05, sx * (w / 2 - 0.09), (hgt - 0.05) / 2, sz * (d / 2 - 0.09),
      0x7c848c, { rough: 0.35, metal: 0.85, seg: 10 });
  }
  if (o.undershelf !== false) {
    slab(g, w - 0.16, 0.03, d - 0.16, 0, 0.24, 0, color, { rough: 0.45, metal: 0.6, radius: 0.01 });
  }
  return g;
}

/** Wheeled trolley — salon trolley, phlebotomy cart, tool cart. */
export function trolley(parent, x, z, color = 0x2b3239, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const w = o.w ?? 0.52, d = o.d ?? 0.4;
  for (const y of [0.34, 0.6, 0.86]) slab(g, w, 0.028, d, 0, y, 0, color, { rough: 0.42, metal: 0.35, finish: "painted", tile: 2, radius: 0.015 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    cyl(g, 0.014, 0.014, 0.86, sx * (w / 2 - 0.03), 0.45, sz * (d / 2 - 0.03), 0x8d959d,
      { rough: 0.3, metal: 0.9, seg: 8 });
    const caster = cyl(g, 0.035, 0.035, 0.018, sx * (w / 2 - 0.03), 0.035, sz * (d / 2 - 0.03), 0x16191d,
      { rough: 0.8, seg: 12 });
    caster.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Wall cabinet with doors and handles. */
export function cabinet(parent, w, h, d, x, y, z, color = 0xd7dce1, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  box(g, w, h, d, 0, 0, 0, color, { rough: 0.55, metal: 0.1, finish: "painted", tile: 2 });
  const gap = 0.006;
  for (const sx of [-1, 1]) {
    box(g, w / 2 - gap, h - 0.04, 0.018, sx * (w / 4), 0, d / 2 + 0.01, o.doorColor ?? color,
      { rough: 0.42, metal: 0.15 });
    box(g, 0.02, 0.11, 0.02, sx * 0.045, 0, d / 2 + 0.03, 0x8d959d, { rough: 0.3, metal: 0.9 });
  }
  return g;
}

// --------------------------------------------------------------------- people
//
// Everybody in both apps is built from the parts below, and the whole point of
// them is that a figure has to read as a person at two metres in a headset
// without costing more meshes than the block-and-ball stand-in it replaces.
//
// What each part buys, and why it is shaped the way it is:
//   - The torso is one lathe, not a box. A revolved profile can flare at the
//     hips, pinch at the waist, swell at the chest and then slope away into
//     the neck, so sloped shoulders and a pelvis that meets the legs cost
//     nothing extra. Flattened front-to-back with scale.z, because a person is
//     not a cylinder.
//   - The head is one lathe too: the neck widens into the jaw and the jaw into
//     the cheeks in a single surface, which is the difference between a person
//     and a ball on a post. Its size is deliberately close to the old sphere's,
//     because a handful of stations hang markers (TMJ, lips, swelling tags) off
//     `head` at coordinates that assume that surface.
//   - Legs and arms are lathes with a joint pinch: a calf belly above a narrow
//     knee, a forearm that pinches at the wrist and swells into a hand. One
//     mesh each, and the silhouette bends where a body bends.
//   - The face is a small canvas decal on the front of the head, painted with
//     brows, eyes and a mouth from a fixed set chosen by a seed, so a crew of
//     six is six faces. Transparent everywhere else, so the skin below shows
//     through and the flat card is invisible.
//   - Skin and hair come from palettes when the caller does not name them, by
//     the same seed, so a station gets a crew rather than sextuplets.
//
// Mesh budget, per figure, standing: torso, pelvis, head, face, hair (or a
// helmet and its chin strap), two legs, two boots, two upper arms, two
// forearms = 13, which is exactly what the old stand-in cost. The hand is the
// end of the forearm lathe rather than a mesh of its own — the wrist pinch,
// palm and thumb pad are in that profile — because a separate hand on each arm
// would have made the figure 15.

/** Eight skin tones, light to dark, used when a caller does not name one. */
export const SKIN_TONES = [
  0xf0d2bb, 0xe3bd9b, 0xd3a37d, 0xbd8860, 0xa26d48, 0x855637, 0x6a4128, 0x4d2f1f,
];
/** Hair, including greys and a red — a capped scalp is one mesh, so it may as well vary. */
export const HAIR_TONES = [
  0x1a1512, 0x2c231d, 0x46301f, 0x6a4a2e, 0x9a7440, 0xd4bb87, 0x8f8d8a, 0xa2432c,
];

// Brows, eye opening and mouth curve. Six combinations is enough that a crew
// of six is six faces, and few enough that they are all deliberately drawn
// rather than randomly generated.
const FACE_SET = [
  { brow: 0.00, open: 0.60, mouth: 0.06, ex: 0.292, mw: 0.19 },
  { brow: 0.22, open: 0.70, mouth: 0.20, ex: 0.300, mw: 0.22 },
  { brow: -0.20, open: 0.40, mouth: -0.10, ex: 0.284, mw: 0.17 },
  { brow: 0.10, open: 0.52, mouth: 0.00, ex: 0.296, mw: 0.20 },
  { brow: -0.10, open: 0.58, mouth: -0.18, ex: 0.288, mw: 0.16 },
  { brow: 0.16, open: 0.45, mouth: 0.12, ex: 0.304, mw: 0.21 },
];

// Profiles are [radius, y] bottom-up (see lathe()). Heights are in the part's
// own space; the standing figure's absolute heights are in personTorso().
const HEAD_PROFILE = [
  [0.001, -0.230], [0.052, -0.214], [0.050, -0.145], [0.070, -0.120],
  [0.098, -0.095], [0.104, -0.055], [0.111, -0.010], [0.112, 0.030],
  [0.108, 0.070], [0.092, 0.105], [0.055, 0.124], [0.001, 0.131],
];
const HAIR_PROFILE = [
  [0.113, 0.018], [0.117, 0.050], [0.113, 0.082], [0.098, 0.110],
  [0.060, 0.128], [0.001, 0.136],
];
// A hard hat: the rim lifts into a full brim and the brim turns back into the
// dome, all in one revolved surface, so brim and shell are a single mesh.
const HELMET_PROFILE = [
  [0.118, 0.034], [0.126, 0.048], [0.155, 0.064], [0.148, 0.078],
  [0.140, 0.100], [0.118, 0.130], [0.070, 0.156], [0.001, 0.166],
];
// A half-face respirator, revolved about the axis that points at the learner.
const RESPIRATOR_PROFILE = [
  [0.060, 0.000], [0.058, 0.025], [0.048, 0.055], [0.030, 0.072], [0.001, 0.078],
];
const PELVIS_PROFILE = [
  [0.001, 0.775], [0.120, 0.790], [0.148, 0.835], [0.150, 0.895],
  [0.132, 0.935], [0.001, 0.950],
];
const TORSO_PROFILE = [
  [0.001, 0.905], [0.130, 0.925], [0.148, 1.000], [0.152, 1.060],
  [0.176, 1.160], [0.196, 1.250], [0.198, 1.300], [0.182, 1.338],
  [0.134, 1.374], [0.062, 1.393], [0.001, 1.400],
];
// Two reflective bands in one mesh. The stretch between them is revolved at a
// radius smaller than the torso's, so it is inside the body and never drawn;
// only the two proud rings are visible. Same trick for the harness webbing.
const BAND_PROFILE = [
  [0.001, 1.095], [0.140, 1.098], [0.172, 1.105], [0.176, 1.145],
  [0.140, 1.152], [0.140, 1.196], [0.188, 1.205], [0.193, 1.245],
  [0.140, 1.252], [0.001, 1.255],
];
const HARNESS_PROFILE = [
  [0.001, 0.965], [0.130, 0.968], [0.156, 0.975], [0.158, 1.020],
  [0.130, 1.030], [0.130, 1.252], [0.196, 1.260], [0.199, 1.292],
  [0.130, 1.300], [0.001, 1.303],
];
// Ankle to hip: calf belly, a narrow knee at 0.47, then the thigh.
const LEG_PROFILE = [
  [0.001, 0.055], [0.044, 0.075], [0.052, 0.110], [0.072, 0.260],
  [0.074, 0.320], [0.060, 0.420], [0.057, 0.470], [0.068, 0.550],
  [0.086, 0.700], [0.090, 0.820], [0.001, 0.870],
];
// Heel to toe, revolved about the axis that points forward: the step at 0.19
// is the toe cap seam, and the taper past it is the cap itself.
const BOOT_PROFILE = [
  [0.001, 0.000], [0.050, 0.014], [0.062, 0.050], [0.062, 0.150],
  [0.055, 0.190], [0.058, 0.202], [0.046, 0.238], [0.001, 0.262],
];
// Fingertips up to the elbow: fingers, palm, thumb pad, wrist pinch, forearm.
const FOREARM_PROFILE = [
  [0.001, -0.420], [0.026, -0.405], [0.040, -0.365], [0.044, -0.320],
  [0.046, -0.285], [0.036, -0.258], [0.026, -0.243], [0.030, -0.215],
  [0.038, -0.120], [0.047, -0.020], [0.001, 0.000],
];

/**
 * A figure's seed. Two people standing in different places get different
 * faces, and the same person gets the same face on every build — which the
 * content checkers and the replay both depend on, so nothing here is random.
 */
export function figureSeed(x = 0, z = 0) {
  let h = 2166136261;
  for (const v of [Math.round(x * 97) | 0, Math.round(z * 89) | 0]) {
    h = Math.imul(h ^ (v & 0xffff), 16777619) >>> 0;
    h = Math.imul(h ^ ((v >>> 16) & 0xffff), 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Skin, hair and face variant for one figure — whatever the caller left open. */
export function figureLook(o = {}, x = 0, z = 0) {
  const seed = (o.seed ?? figureSeed(x, z)) >>> 0;
  return {
    seed,
    skin: o.skin ?? SKIN_TONES[seed % SKIN_TONES.length],
    hair: o.hair ?? HAIR_TONES[(seed >>> 5) % HAIR_TONES.length],
    face: (seed >>> 11) % FACE_SET.length,
  };
}

/** Brows, eyes and a mouth on a transparent canvas — the painter for a face decal. */
export function faceFace(variant = 0, o = {}) {
  const n = FACE_SET.length;
  const f = FACE_SET[(((Math.round(variant) % n) + n) % n)];
  const ink = o.ink ?? "#241c17";
  const sclera = o.sclera ?? "#cfc4ba";
  const iris = o.iris ?? "#3c2a1f";
  return (g, w, h) => {
    const browY = 0.190 * h, eyeY = 0.400 * h, noseY = 0.625 * h, mouthY = 0.831 * h;
    const ex = f.ex * w, rx = 0.082 * w, ry = 0.040 * h * f.open + 0.006 * h;
    g.lineCap = "round";
    g.lineJoin = "round";
    for (const s of [-1, 1]) {
      const cx = w / 2 + s * ex;
      // Brow: the one feature that carries most of an expression at distance.
      g.strokeStyle = ink;
      g.lineWidth = 0.028 * w;
      g.beginPath();
      g.moveTo(cx - s * rx * 1.2, browY + f.brow * 0.055 * h);
      g.quadraticCurveTo(cx, browY - 0.024 * h, cx + s * rx * 1.2, browY - f.brow * 0.055 * h);
      g.stroke();
      // Eye: white, iris, pupil, then a heavier upper lid line.
      g.fillStyle = sclera;
      g.beginPath();
      g.ellipse(cx, eyeY, rx, ry, 0, 0, Math.PI * 2);
      g.fill();
      const ir = Math.min(ry * 1.0, rx * 0.58);
      g.fillStyle = iris;
      g.beginPath();
      g.ellipse(cx, eyeY, ir, ir, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ink;
      g.beginPath();
      g.ellipse(cx, eyeY, ir * 0.42, ir * 0.42, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = ink;
      g.lineWidth = 0.013 * w;
      g.beginPath();
      g.moveTo(cx - rx, eyeY - ry * 0.2);
      g.quadraticCurveTo(cx, eyeY - ry * 1.45, cx + rx, eyeY - ry * 0.2);
      g.stroke();
      // Nostril, and the shadow down one side of the nose.
      g.strokeStyle = "rgba(60,40,28,0.55)";
      g.lineWidth = 0.016 * w;
      g.beginPath();
      g.moveTo(w / 2 + s * 0.055 * w, noseY);
      g.quadraticCurveTo(w / 2 + s * 0.030 * w, noseY + 0.014 * h, w / 2 + s * 0.012 * w, noseY + 0.006 * h);
      g.stroke();
    }
    // Mouth: one curve, with a lighter lower-lip line under it.
    const mw = f.mw * w;
    g.strokeStyle = "#43201a";
    g.lineWidth = 0.038 * w;
    g.beginPath();
    g.moveTo(w / 2 - mw, mouthY - f.mouth * 0.018 * h);
    g.quadraticCurveTo(w / 2, mouthY + f.mouth * 0.040 * h, w / 2 + mw, mouthY - f.mouth * 0.018 * h);
    g.stroke();
    g.strokeStyle = "rgba(96,52,42,0.5)";
    g.lineWidth = 0.018 * w;
    g.beginPath();
    g.moveTo(w / 2 - mw * 0.8, mouthY + 0.026 * h);
    g.quadraticCurveTo(w / 2, mouthY + 0.040 * h + f.mouth * 0.02 * h, w / 2 + mw * 0.8, mouthY + 0.026 * h);
    g.stroke();
  };
}

/**
 * Head, face and headwear, built into a head group the caller owns and places
 * — existing stations hang labels and exam markers off that group, so its
 * position is never this function's business.
 *
 * `helmet` replaces the hair with a hard hat and a chin strap; `respirator`
 * adds a half mask over nose and mouth.
 */
export function personHead(head, o = {}) {
  const look = o.look ?? figureLook(o);
  // `k` is the whole head's size. A standing figure gets an adult head at 0.9;
  // a seated patient keeps 1.0, because a handful of dental stations pin exam
  // markers (TMJ, lips, swelling) to coordinates on that surface.
  const k = o.k ?? 1;
  const skull = lathe(head, HEAD_PROFILE, 0, 0, 0, look.skin, { rough: 0.72, seg: 14 });
  skull.scale.set(0.95 * k, k, 1.02 * k);
  // The face card sits just clear of the front of the skull. Its canvas is
  // transparent apart from the features, so the card itself cannot be seen.
  const face = decal(head, 0.120 * k, 0.115 * k, 0, -0.008 * k, 0.117 * k, faceFace(look.face), {
    px: 256, transparent: true, rough: 0.68,
  });
  if (o.helmet) {
    const shell = lathe(head, HELMET_PROFILE, 0, 0, 0, o.helmet, { rough: 0.42, seg: 16 });
    shell.scale.set(0.95 * k, k, 1.02 * k);
    // A strap under the jaw: the top of the ring is inside the shell, so all
    // that shows is the two sides and the length under the chin. Boot black,
    // so the two share a material and bake into one mesh.
    const strap = torus(head, 0.110 * k, 0.0042, 0, -0.006 * k, 0.004 * k, o.strap ?? 0x1b1e22,
      { rough: 0.7, seg: 6, seg2: 18 });
    strap.rotation.x = 0.10;
  } else {
    // A capped scalp, tipped back so the hairline sits above the brows in
    // front and comes down behind the ears at the back.
    const cap = lathe(head, HAIR_PROFILE, 0, 0, 0.004 * k, look.hair, { rough: 0.86, seg: 14 });
    cap.scale.set(0.95 * k, k, 1.02 * k);
    cap.rotation.x = -0.18;
  }
  if (o.respirator) {
    const cup = lathe(head, RESPIRATOR_PROFILE, 0, -0.045 * k, 0.055 * k,
      o.respirator === true ? 0x9aa1a8 : o.respirator, { rough: 0.5, seg: 12 });
    cup.rotation.x = Math.PI / 2;
    cup.scale.set(1.15 * k, k, 0.82 * k);
  }
  return { skull, face };
}

/**
 * Pelvis and torso, plus whatever is worn over them. `y` shifts the whole
 * assembly, which is how a seated figure reuses a standing figure's shape.
 *
 * `vis` paints two reflective bands across the chest in one mesh; `harness`
 * lays a waist belt and a chest strap over the top in one more.
 */
export function personTorso(parent, o = {}) {
  const y = o.y ?? 0;
  const cloth = o.cloth ?? 0x37505f;
  const pelvis = lathe(parent, PELVIS_PROFILE, 0, y, 0, o.trousers ?? cloth, { rough: 0.9, seg: 12 });
  pelvis.scale.set(1, 1, 0.72);
  const torso = lathe(parent, TORSO_PROFILE, 0, y, 0, o.jacket ?? cloth, { rough: 0.9, seg: 14 });
  torso.scale.set(1, 1, 0.66);
  if (o.vis) {
    const bands = lathe(parent, BAND_PROFILE, 0, y, 0, o.vis, {
      rough: 0.55, emissive: o.vis, ei: o.ei ?? 0.3, seg: 14,
    });
    bands.scale.set(1, 1, 0.66);
  }
  if (o.harness) {
    const webbing = lathe(parent, HARNESS_PROFILE, 0, y, 0,
      o.harness === true ? 0x2b2f33 : o.harness, { rough: 0.8, seg: 12 });
    webbing.scale.set(1, 1, 0.66);
  }
  return { pelvis, torso };
}

/** Two legs and two boots, each one mesh: knee break in the leg, toe cap in the boot. */
export function personLegs(parent, o = {}) {
  const trousers = o.trousers ?? 0x2f3740;
  const span = o.span ?? 0.085;
  const y = o.y ?? 0;
  for (const sx of [-1, 1]) {
    lathe(parent, LEG_PROFILE, sx * span, y, 0, trousers, { rough: 0.9, seg: 10 });
    // Revolved about the axis that points forward, then squashed: the
    // vertical squash is scale.z, because the profile's own y is now z.
    const boot = lathe(parent, BOOT_PROFILE, sx * span, y + 0.046, -0.075,
      o.boots ?? 0x1b1e22, { rough: 0.85, seg: 10 });
    boot.rotation.x = Math.PI / 2;
    boot.scale.set(0.78, 1, 0.70);
  }
}

/**
 * One arm, as the two groups every caller poses: `shoulder` turns at the
 * shoulder and `fore` at the elbow. The upper arm hangs a little off the body
 * and the forearm keeps a standing bend at the elbow, both baked into the
 * meshes rather than the groups, so a station that poses the groups does not
 * flatten the figure back into a cross.
 */
export function personArm(parent, sx, o = {}) {
  const shoulder = group(parent, sx * (o.span ?? 0.166), o.y ?? 1.336, 0);
  const upper = cyl(shoulder, 0.052, 0.042, 0.30, sx * 0.015, -0.149, 0,
    o.sleeve ?? 0x37505f, { rough: 0.9, seg: 10 });
  upper.rotation.z = sx * 0.10;
  const fore = group(shoulder, sx * 0.030, -0.2985, 0);
  const lower = lathe(fore, FOREARM_PROFILE, 0, 0, 0, o.glove ?? o.skin ?? SKIN_TONES[2],
    { rough: o.glove ? 0.82 : 0.72, seg: 10 });
  lower.rotation.x = -0.16;
  lower.scale.set(1.1, 1, 0.9);
  return { shoulder, fore };
}

/**
 * A standing person, with the parts a trade needs to pose them: the head and
 * both arms are their own groups, so a room can have somebody looking at a
 * bench, holding a tool, or turning to talk to you.
 *
 * Pose first, then call mergeStatic(fig.root, { local: true }) if the figure
 * only has to move as a whole — that takes it from thirteen meshes to four
 * (the face keeps its own canvas) and it still walks, turns and bobs.
 */
export function standingPerson(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const look = figureLook(o, x, z);
  const cloth = o.cloth ?? 0x37505f;
  const legs = o.legs ?? 0x2f3740;
  const torso = group(g, 0, 0, 0);
  personTorso(torso, {
    cloth, trousers: legs, harness: o.harness,
    // The band that makes somebody visible across a shop, which is the point
    // of putting them in the room at all.
    vis: o.hiVis === false ? null : (o.vis ?? 0xd8e33a), ei: 0.25,
  });
  personLegs(torso, { trousers: legs, boots: o.boots });
  const head = group(torso, 0, 1.52, 0);
  personHead(head, { look, k: 0.9, helmet: o.hat, respirator: o.respirator });
  const arms = [];
  for (const sx of [-1, 1]) {
    arms.push(personArm(torso, sx, { sleeve: cloth, skin: look.skin, glove: o.gloves }));
  }
  return { root: g, torso, head, arms };
}

/** Seated stand-in: client in a salon chair, patient in a draw chair. */
export function seatedFigure(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const look = figureLook(o, x + z, z - y);
  const cloth = o.cloth ?? 0x37505f;
  const torso = group(g, 0, 0, 0);
  // The same torso the standing figure has, dropped to sitting height, so a
  // seated person has the same shoulders and the same waist as a standing one.
  personTorso(torso, { cloth, trousers: o.legs ?? cloth, y: -0.44, harness: o.harness });
  const span = 0.105;
  for (const sx of [-1, 1]) {
    // Thigh forward from the hip to the knee, revolved about the forward axis.
    const thigh = lathe(torso, [
      [0.001, -0.02], [0.070, 0.01], [0.082, 0.10], [0.078, 0.28], [0.066, 0.40], [0.001, 0.425],
    ], sx * span, 0.42, 0, cloth, { rough: 0.9, seg: 10 });
    thigh.rotation.x = Math.PI / 2;
    thigh.scale.set(1, 1, 0.85);
    // Calf down from the knee, same knee-and-belly profile as standing.
    lathe(torso, [
      [0.001, 0.055], [0.044, 0.075], [0.052, 0.110], [0.072, 0.230],
      [0.068, 0.330], [0.062, 0.400], [0.001, 0.430],
    ], sx * span, 0, 0.40, cloth, { rough: 0.9, seg: 10 });
    const boot = lathe(torso, BOOT_PROFILE, sx * span, 0.046, 0.33,
      o.boots ?? 0x1b1e22, { rough: 0.85, seg: 10 });
    boot.rotation.x = Math.PI / 2;
    boot.scale.set(0.78, 1, 0.70);
  }
  const head = group(torso, 0, 1.06, 0.01);
  personHead(head, { look, helmet: o.hat, respirator: o.respirator });
  const arms = [];
  for (const sx of [-1, 1]) {
    arms.push(personArm(torso, sx, {
      span: 0.166, y: 0.893, sleeve: cloth, skin: look.skin, glove: o.gloves,
    }));
  }
  return { root: g, torso, head, arms };
}

// ------------------------------------------------------------------ particles

/** Cheap additive point burst reused for sparks, steam and water. */
export function particles(parent, count, color, o = {}) {
  const positions = new Float32Array(count * 3);
  const geo = track(new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color, size: o.size ?? 0.02, transparent: true, opacity: o.opacity ?? 0.9,
    blending: o.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    depthWrite: false, sizeAttenuation: true,
  });
  material.userData.ownMaterial = true;
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.visible = false;
  parent.add(points);
  const life = new Float32Array(count);
  const vel = new Float32Array(count * 3);
  points.userData.step = (dt, origin, spread, speed, gravity) => {
    for (let i = 0; i < count; i++) {
      life[i] -= dt;
      if (life[i] <= 0) {
        life[i] = 0.25 + Math.random() * (o.life ?? 0.6);
        positions[i * 3] = origin.x + (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;
        vel[i * 3] = (Math.random() - 0.5) * speed;
        vel[i * 3 + 1] = (Math.random() * 0.6 + 0.4) * speed;
        vel[i * 3 + 2] = (Math.random() - 0.5) * speed;
      }
      positions[i * 3] += vel[i * 3] * dt;
      positions[i * 3 + 1] += vel[i * 3 + 1] * dt;
      positions[i * 3 + 2] += vel[i * 3 + 2] * dt;
      vel[i * 3 + 1] += gravity * dt;
    }
    geo.attributes.position.needsUpdate = true;
  };
  return points;
}

/**
 * A one-shot, self-driving particle celebration for "big moment" feedback — a
 * hot-streak step, a rank-up, a personal best. Parented once to `parent` (any
 * static node already in the scene, e.g. the room root); after that, call the
 * returned `fire(localPoint)` whenever the moment happens and call `update(dt)`
 * unconditionally from the render loop — it is a cheap no-op once the burst
 * has finished, so the caller never needs to track whether one is playing.
 */
export function celebrationBurst(parent, o = {}) {
  const points = particles(parent, o.count ?? 70, o.color ?? 0xffe37a, {
    size: o.size ?? 0.032, life: o.life ?? 0.6, additive: o.additive !== false, opacity: o.opacity ?? 0.95,
  });
  const origin = new THREE.Vector3();
  let timer = 0;
  return {
    fire(localPoint) {
      origin.copy(localPoint);
      timer = o.duration ?? 0.5;
      points.visible = true;
    },
    update(dt) {
      if (timer <= 0) { if (points.visible) points.visible = false; return; }
      timer -= dt;
      points.userData.step(dt, origin, o.spread ?? 0.1, o.speed ?? 1.6, o.gravity ?? -1.8);
    },
  };
}

// ------------------------------------------------------------------- helpers

export function markInteractive(objectOrGroup, id, o = {}) {
  objectOrGroup.userData.hitId = id;
  objectOrGroup.userData.hitLabel = o.label ?? id;
  return objectOrGroup;
}

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
export { THREE };
