import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, lathe, hose, group, decal, repaint, signFace, paperFace,
  mat, HUD, markInteractive, gradientFill, noiseTexture, grimeOverlay,
  figureLook, figureDress, personHead, personTorso, personLegs, personArm,
  OUTFITS, outfitFromContext, setActiveContext, getActiveContext,
} from "../../shared/kit.js";
export { setActiveContext };

// SmartCity.X asset kit — the pieces every station is assembled from.
//
// These stations are authored for augmented reality: each one occupies a small
// footprint the learner walks around in their own room, so the props are
// human-scale and free-standing rather than built into walls. Everything reads
// correctly with passthrough behind it, which is why the holographic elements
// are emissive and the physical equipment is not.

export const CITY = {
  accent: 0x4fd1ff,          // SmartCity.X holo cyan
  accentCss: "#4fd1ff",
  holo: 0x7ee6ff,
  violet: 0xa079ff,
  steel: 0x8b949d,
  darkSteel: 0x3c444c,
  case: 0x2a3138,
  hiVis: 0xf2c14b,
  alert: 0xf0645b,
  good: 0x59c97b,
};

// ------------------------------------------------------------ surface textures
//
// Tiling canvas textures for the large flat surfaces (plaza deck, atrium
// floor) that previously read as one flat colour. Generated once per build,
// owned by the material they're attached to (userData.ownTexture/ownMaterial)
// so disposeTree() frees them with the room. Every canvas call is guarded the
// same way kit.js's gradientFill is, so the headless checkers' 2D-context stub
// never throws even though nothing in the checker path actually calls these.

/** A repeating CanvasTexture drawn by `draw(g, w, h)`. */
export function surfaceTexture(draw, o = {}) {
  const px = o.px ?? 512;
  const canvas = document.createElement("canvas");
  canvas.width = px; canvas.height = px;
  const g = canvas.getContext("2d");
  draw(g, px, px);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.RepeatWrapping !== undefined) { tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; }
  tex.repeat?.set?.(o.repeat ?? 4, o.repeat ?? 4);
  tex.anisotropy = 8;
  if (THREE.SRGBColorSpace !== undefined) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A standard material carrying its own (disposable) texture map. */
export function texturedMat(tex, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    map: tex, color: o.color ?? 0xffffff, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0.05,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, emissiveMap: o.glow ? tex : null,
  });
  m.userData.ownMaterial = true;
  m.userData.ownTexture = true;
  return m;
}

/**
 * Cast-concrete plaza paving: a cool base with per-tile tonal variation, a fine
 * grain, saw-cut seam lines on a grid, and a faint lighter chamfer along each
 * seam so tiles read as separate slabs under raking light.
 */
export function pavingFace(g, w, h, o = {}) {
  const tiles = o.tiles ?? 4;
  const base = o.base ?? "#1a222b";
  gradientFill(g, w, h, [[0, base], [1, o.base2 ?? "#151c24"]]);
  const t = w / tiles;
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      const v = ((i * 7 + j * 13) % 5) - 2; // deterministic tone jitter per slab
      g.fillStyle = `rgba(${v > 0 ? "255,255,255" : "0,0,0"},${(Math.abs(v) * 0.025).toFixed(3)})`;
      g.fillRect(i * t, j * t, t, t);
    }
  }
  noiseTexture(g, w, h, { density: 2600, alpha: 0.09, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 1400, alpha: 0.06, tone: "200,220,235" });
  g.fillStyle = o.seam ?? "rgba(0,0,0,0.55)";
  for (let i = 0; i <= tiles; i++) {
    g.fillRect(i * t - 1.5, 0, 3, h);
    g.fillRect(0, i * t - 1.5, w, 3);
  }
  g.fillStyle = "rgba(255,255,255,0.05)";
  for (let i = 0; i <= tiles; i++) {
    g.fillRect(i * t + 1.5, 0, 1.5, h);
    g.fillRect(0, i * t + 1.5, w, 1.5);
  }
}

/**
 * Anti-slip deck plate for walk lanes: darker steel with a raised-dot pattern
 * and a subtle directional brushing.
 */
export function deckPlateFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#232b33"], [1, o.base2 ?? "#1b222a"]], { horizontal: true });
  noiseTexture(g, w, h, { density: 3000, alpha: 0.07, tone: "0,0,0" });
  const step = o.step ?? 24;
  for (let y = step / 2; y < h; y += step) {
    for (let x = ((y / step) | 0) % 2 ? step / 2 : 0; x < w; x += step) {
      g.fillStyle = "rgba(255,255,255,0.10)";
      g.fillRect(x - 2, y - 2, 4, 4);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(x - 2, y + 2, 4, 1.5);
    }
  }
  for (let y = 0; y < h; y += 3) {
    g.fillStyle = `rgba(255,255,255,${(0.01 + ((y / 3) % 4) * 0.004).toFixed(3)})`;
    g.fillRect(0, y, w, 1);
  }
}

/**
 * Bay water for the shoreline districts: a deep teal base that lightens toward
 * one edge the way water does under a low sky, a fine grain, and two scales of
 * ripple — long low strokes for the swell and short bright flecks where the
 * light catches a crest. Tiled and drifted by the district's animate, so a
 * still disc reads as moving water without a shader.
 */
export function waterFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#0c2531"], [0.55, o.mid ?? "#0f2e3a"], [1, o.base2 ?? "#0a1f29"]]);
  noiseTexture(g, w, h, { density: 2200, alpha: 0.05, tone: "0,0,0" });
  const swell = o.swell ?? 46, crest = o.crest ?? 260;
  for (let i = 0; i < swell; i++) {
    const y = Math.random() * h, x = Math.random() * w, len = 60 + Math.random() * 180;
    g.fillStyle = `rgba(120,170,185,${(0.05 + Math.random() * 0.06).toFixed(3)})`;
    g.fillRect(x, y, len, 1.5);
    g.fillStyle = "rgba(0,0,0,0.10)";
    g.fillRect(x + 6, y + 3, len * 0.7, 1);
  }
  for (let i = 0; i < crest; i++) {
    const y = Math.random() * h, x = Math.random() * w, len = 6 + Math.random() * 22;
    g.fillStyle = `rgba(190,225,235,${(0.08 + Math.random() * 0.14).toFixed(3)})`;
    g.fillRect(x, y, len, 1);
  }
}

/**
 * Tidal mudflat for the marsh edge: a grey-brown base darker where it is
 * still wet, a fine grain, desiccation cracks as short jointed dark strokes,
 * and a few shallow pools that catch the sky. Reads as the ground a living
 * shoreline is built on rather than a lawn.
 */
export function mudflatFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#3a3630"], [1, o.base2 ?? "#2c2a26"]], { radial: true });
  noiseTexture(g, w, h, { density: 3200, alpha: 0.10, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.05, tone: "170,160,140" });
  const cracks = o.cracks ?? 70;
  for (let i = 0; i < cracks; i++) {
    let x = Math.random() * w, y = Math.random() * h;
    const steps = 4 + Math.floor(Math.random() * 6);
    for (let k = 0; k < steps; k++) {
      const dx = (Math.random() - 0.5) * 34, dy = (Math.random() - 0.5) * 34;
      const nx = x + dx, ny = y + dy, len = Math.hypot(dx, dy);
      g.fillStyle = "rgba(0,0,0,0.42)";
      for (let t = 0; t < len; t += 2) g.fillRect(x + (dx * t) / len, y + (dy * t) / len, 1.6, 1.6);
      x = nx; y = ny;
    }
  }
  const pools = o.pools ?? 5;
  for (let i = 0; i < pools; i++) {
    const cx = Math.random() * w, cy = Math.random() * h, r = 14 + Math.random() * 30;
    g.fillStyle = "rgba(70,95,105,0.35)";
    try { g.beginPath(); g.ellipse(cx, cy, r, r * 0.55, Math.random() * Math.PI, 0, Math.PI * 2); g.fill(); } catch { g.fillRect(cx - r, cy - r * 0.55, r * 2, r * 1.1); }
  }
}

/** A radial gradient blob, drawn only where the context supports gradients. */
function radialBlob(g, x, y, r, stops) {
  let grad = null;
  try { grad = g.createRadialGradient(x, y, 0, x, y, r); } catch { grad = null; }
  if (!grad || typeof grad.addColorStop !== "function") return;
  for (const [s, c] of stops) grad.addColorStop(s, c);
  g.fillStyle = grad;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

/**
 * Painted structural steel: a base coat (International Orange for the bridge
 * district), plate seams on a grid, rows of rivet heads either side of every
 * seam with a lit top and a shadowed foot, and a little chalking and grime so
 * a tower leg reads as riveted built-up plate and not as an orange box.
 */
export function paintedSteelFace(g, w, h, o = {}) {
  gradientFill(g, w, h, [[0, o.base ?? "#d4461c"], [1, o.base2 ?? "#c23d17"]]);
  noiseTexture(g, w, h, { density: 2600, alpha: 0.08, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 900, alpha: 0.06, tone: "255,210,190" });
  const cols = o.cols ?? 2, rows = o.rows ?? 4;
  const cw = w / cols, rh = h / rows, pitch = o.pitch ?? 12;
  const rivet = (x, y) => {
    g.fillStyle = "rgba(255,190,160,0.30)"; g.fillRect(x - 2, y - 2, 4, 2);
    g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(x - 2, y, 4, 2);
  };
  for (let c = 0; c <= cols; c++) {
    const x = c * cw;
    g.fillStyle = "rgba(0,0,0,0.42)"; g.fillRect(x - 1.5, 0, 3, h);
    g.fillStyle = "rgba(255,200,170,0.10)"; g.fillRect(x + 1.5, 0, 1.5, h);
    for (let y = pitch / 2; y < h; y += pitch) { rivet(x - 7, y); rivet(x + 7, y); }
  }
  for (let r = 0; r <= rows; r++) {
    const y = r * rh;
    g.fillStyle = "rgba(0,0,0,0.42)"; g.fillRect(0, y - 1.5, w, 3);
    g.fillStyle = "rgba(255,200,170,0.10)"; g.fillRect(0, y + 1.5, w, 1.5);
    for (let x = pitch / 2; x < w; x += pitch) { rivet(x, y - 7); rivet(x, y + 7); }
  }
  grimeOverlay(g, w, h, { tone: "60,24,12", alpha: 0.16, blotches: 5, streaks: 6 });
}

/**
 * Bridge roadway: weathered asphalt with the lane lines painted where a
 * deck `lanes` wide puts them (dashed white between lanes, solid at the
 * edges), plus tyre-polished wheel paths. Drawn for a texture repeated once
 * across and many times along the deck.
 */
export function roadwayFace(g, w, h, o = {}) {
  const lanes = o.lanes ?? 6;
  gradientFill(g, w, h, [[0, "#3a3d41"], [1, "#34373b"]], { horizontal: true });
  noiseTexture(g, w, h, { density: 5200, alpha: 0.16, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 2200, alpha: 0.10, tone: "200,200,200" });
  const lw = w / lanes;
  for (let i = 0; i < lanes; i++) {
    for (const f of [0.3, 0.7]) { g.fillStyle = "rgba(0,0,0,0.10)"; g.fillRect(i * lw + lw * f - lw * 0.07, 0, lw * 0.14, h); }
  }
  g.fillStyle = "rgba(236,236,228,0.85)";
  g.fillRect(3, 0, 5, h); g.fillRect(w - 8, 0, 5, h);
  for (let i = 1; i < lanes; i++) for (let y = 0; y < h; y += h / 2) g.fillRect(i * lw - 2.5, y, 5, h * 0.2);
}

/**
 * Harbour silt: grey-green fines with sand ripples, a scatter of shell hash
 * and a few darker patches where the bottom has been disturbed.
 */
export function siltFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#5c6a5e"], [1, "#4a574d"]], { radial: true });
  noiseTexture(g, w, h, { density: 4200, alpha: 0.14, tone: "0,0,0" });
  noiseTexture(g, w, h, { density: 1600, alpha: 0.12, tone: "210,214,190" });
  // Sand ripples: faint wavy crests, not the ruled lines of a deck.
  for (let y = 0; y < h; y += 22) {
    const ph = Math.random() * 6;
    for (let x = 0; x < w; x += 3) {
      const yy = y + Math.sin((x / w) * Math.PI * 6 + ph) * 5 + Math.sin((x / w) * Math.PI * 14) * 1.5;
      g.fillStyle = "rgba(0,0,0,0.07)"; g.fillRect(x, yy, 3, 2);
      g.fillStyle = "rgba(220,225,200,0.05)"; g.fillRect(x, yy + 3, 3, 1.5);
    }
  }
  for (let i = 0; i < 90; i++) {
    g.fillStyle = `rgba(230,228,215,${(0.15 + Math.random() * 0.25).toFixed(2)})`;
    g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1.5);
  }
  for (let i = 0; i < 6; i++) radialBlob(g, Math.random() * w, Math.random() * h, 30 + Math.random() * 50, [[0, "rgba(20,26,22,0.30)"], [1, "rgba(20,26,22,0)"]]);
}

/**
 * Caustics: the bright net of light the surface throws on the bottom. Drawn
 * as overlapping soft rings on black so it can be an emissive map: black adds
 * nothing, the net adds light, and sliding the texture moves the pattern.
 */
export function causticFace(g, w, h) {
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  // The real thing is a cell network: bright where two cells meet. Drawn as
  // tileable Voronoi edges (the gap between the nearest and second-nearest
  // seed, wrapped so the texture repeats) where the canvas can hand back its
  // pixels; the ring sketch below is the fallback for a context that cannot.
  const img = (() => { try { return g.getImageData?.(0, 0, w, h); } catch { return null; } })();
  if (img?.data?.length === w * h * 4) {
    const n = 38, sx = [], sy = [];
    for (let i = 0; i < n; i++) { sx.push(Math.random() * w); sy.push(Math.random() * h); }
    const d = img.data, edge = w * 0.075;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let f1 = 1e9, f2 = 1e9;
      for (let i = 0; i < n; i++) {
        let dx = Math.abs(x - sx[i]), dy = Math.abs(y - sy[i]);
        if (dx > w / 2) dx = w - dx;
        if (dy > h / 2) dy = h - dy;
        const dd = dx * dx + dy * dy;
        if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd;
      }
      const k = Math.max(0, 1 - (Math.sqrt(f2) - Math.sqrt(f1)) / edge);
      const v = Math.round(215 * k * k);
      const o = (y * w + x) * 4;
      d[o] = v * 0.85; d[o + 1] = v; d[o + 2] = v * 0.95; d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return;
  }
  g.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 16 + Math.random() * 34;
    g.strokeStyle = `rgba(210,255,245,${(0.25 + Math.random() * 0.35).toFixed(2)})`;
    g.lineWidth = 1.5 + Math.random() * 2.5;
    try {
      g.beginPath();
      for (let k = 0; k <= 7; k++) {
        const a = (k / 7) * Math.PI * 2, rr = r * (0.75 + Math.random() * 0.4);
        const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
        if (k === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.stroke();
    } catch { /* headless */ }
  }
}

/**
 * Pile with marine growth: a timber-and-concrete grey that goes green and
 * shelly toward the bottom, barnacle specks, and mussel bands.
 */
export function growthFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#6a716a"], [0.55, "#56644f"], [1, "#3f4d38"]]);
  noiseTexture(g, w, h, { density: 3600, alpha: 0.16, tone: "0,0,0" });
  for (let i = 0; i < 520; i++) {
    const y = h * Math.pow(Math.random(), 0.6);
    g.fillStyle = `rgba(225,225,205,${(0.25 + Math.random() * 0.35).toFixed(2)})`;
    g.fillRect(Math.random() * w, y, 2.5, 2.5);
  }
  for (let b = 0; b < 3; b++) {
    const y = h * (0.45 + b * 0.18);
    for (let x = 0; x < w; x += 5) {
      g.fillStyle = `rgba(22,24,34,${(0.55 + Math.random() * 0.3).toFixed(2)})`;
      g.fillRect(x, y + Math.random() * 10, 4, 6 + Math.random() * 6);
    }
  }
}

/**
 * Ship's side below the waterline: antifouling red-brown in welded plates,
 * with a slime film and fouling heaviest near the bottom.
 */
export function hullFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#96503e"], [1, "#7a4234"]]);
  noiseTexture(g, w, h, { density: 3000, alpha: 0.12, tone: "0,0,0" });
  g.fillStyle = "rgba(0,0,0,0.30)";
  for (let x = 0; x <= w; x += w / 3) g.fillRect(x - 1, 0, 2, h);
  for (let y = 0; y <= h; y += h / 2) g.fillRect(0, y - 1, w, 2);
  for (let i = 0; i < 260; i++) {
    const y = h * (0.4 + Math.random() * 0.6);
    g.fillStyle = `rgba(80,110,70,${(0.12 + Math.random() * 0.2).toFixed(2)})`;
    g.fillRect(Math.random() * w, y, 3 + Math.random() * 6, 2 + Math.random() * 3);
  }
}

/**
 * Soft fog: a transparent canvas of overlapping pale puffs, tiling, for the
 * marine layer's banks and the cloud deck under a bridge.
 */
export function fogPuffFace(g, w, h, o = {}) {
  g.clearRect?.(0, 0, w, h);
  const tone = o.tone ?? "226,232,236";
  for (let i = 0; i < (o.puffs ?? 26); i++) {
    const x = Math.random() * w, y = Math.random() * h, r = w * (0.12 + Math.random() * 0.2);
    for (const [dx, dy] of [[0, 0], [-w, 0], [w, 0], [0, -h], [0, h]]) {
      radialBlob(g, x + dx, y + dy, r, [[0, `rgba(${tone},${(o.alpha ?? 0.34).toFixed(2)})`], [1, `rgba(${tone},0)`]]);
    }
  }
}

/** A round glow on black: the surface seen from below, or a lamp's halo. */
export function glowFace(g, w, h, o = {}) {
  g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  radialBlob(g, w / 2, h / 2, w / 2, [[0, o.core ?? "rgba(230,255,250,1)"], [0.35, o.mid ?? "rgba(150,225,215,0.55)"], [1, "rgba(0,0,0,0)"]]);
}

/** The station footprint: a holographic pad the equipment stands on. */
export function stationPad(parent, radius = 1.75, accent = CITY.accent) {
  const g = group(parent);
  torus(g, radius, 0.014, 0, 0.012, 0, accent,
    { emissive: accent, ei: 2.2, rough: 0.4, cast: false, seg: 8, seg2: 56 });
  torus(g, radius - 0.09, 0.005, 0, 0.012, 0, accent,
    { emissive: accent, ei: 1.1, rough: 0.4, cast: false, seg: 6, seg2: 56 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const tick = box(g, 0.03, 0.006, 0.17, Math.sin(a) * radius, 0.012, Math.cos(a) * radius,
      accent, { emissive: accent, ei: 1.8, rough: 0.4, cast: false });
    tick.rotation.y = a;
  }
  return g;
}

/** Free-standing holographic panel: the station's readouts and paperwork in AR. */
export function holoPanel(parent, w, h, x, y, z, draw, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const accent = o.accent ?? CITY.accent;
  const face = decal(g, w, h, 0, 0, 0, draw, { px: o.px ?? 640, glow: true, ei: o.ei ?? 0.95, transparent: true });
  // Corner brackets rather than a full frame — reads as a projection, not a screen.
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    box(g, w * 0.16, 0.006, 0.004, sx * (w / 2 - w * 0.08), sy * (h / 2), -0.002, accent,
      { emissive: accent, ei: 2.4, rough: 0.4, cast: false });
    box(g, 0.006, h * 0.22, 0.004, sx * (w / 2), sy * (h / 2 - h * 0.11), -0.002, accent,
      { emissive: accent, ei: 2.4, rough: 0.4, cast: false });
  }
  if (o.stalk) {
    cyl(g, 0.008, 0.008, y - 0.02, 0, -(y - 0.02) / 2 - h / 2, 0, accent,
      { emissive: accent, ei: 0.9, rough: 0.4, seg: 8, cast: false });
  }
  g.userData.face = face;
  return g;
}

/** Small floating caption used to name a piece of equipment in the AR overlay. */
export function holoTag(parent, text, x, y, z, o = {}) {
  const accent = o.accent ?? CITY.accent;
  return decal(parent, o.w ?? 0.3, o.h ?? 0.07, x, y, z, (g, w, h) => {
    g.fillStyle = "rgba(6,14,20,0.82)";
    g.fillRect(0, 0, w, h);
    g.fillStyle = o.css ?? CITY.accentCss;
    g.fillRect(0, 0, 4, h);
    g.fillStyle = "#eaf6fb";
    g.font = `600 ${Math.round(h * 0.56)}px 'Barlow Condensed', Arial, sans-serif`;
    g.textAlign = "left"; g.textBaseline = "middle";
    g.fillText(String(text).toUpperCase(), w * 0.06, h * 0.56);
  }, { px: 320, glow: true, ei: 0.8, transparent: true });
}

/**
 * A thin transparent decal laid over a flat-coloured surface to add grain and grime
 * without hiding the material colour underneath — an overlay, not a face.
 */
function weatherPanel(parent, w, h, x, y, z, o = {}) {
  return decal(parent, w, h, x, y, z, (g, cw, ch) => {
    g.clearRect(0, 0, cw, ch);
    noiseTexture(g, cw, ch, { density: o.density ?? 650, alpha: o.alpha ?? 0.05, tone: o.tone ?? "8,8,8" });
    grimeOverlay(g, cw, ch, {
      blotches: o.blotches ?? 3, streaks: o.streaks ?? 2,
      tone: o.tone ?? "12,10,6", alpha: o.grime ?? 0.2,
    });
  }, { px: o.px ?? 192, transparent: true, rough: 0.95 });
}

/** Street / plant equipment cabinet with a hinged door, louvres and plinth. */
export function equipmentCabinet(parent, w, h, d, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const shell = o.color ?? 0x6f7a83;
  box(g, w + 0.1, 0.09, d + 0.1, 0, 0.045, 0, 0x2d3339, { rough: 0.85, finish: "concrete", tile: 2 }); // plinth
  // Painted sheet steel, not a flat swatch: the finish gives the body an orange
  // peel under the key light and a grain on the rain cap. Shared maps, so a
  // yard full of cabinets is still one draw call per colour. See surface().
  box(g, w, h, d, 0, 0.09 + h / 2, 0, shell,
    { rough: o.rough ?? 0.5, metal: o.metal ?? 0.5, finish: o.finish ?? "painted", tile: 2 });
  box(g, w + 0.06, 0.04, d + 0.06, 0, 0.09 + h + 0.02, 0, shell,
    { rough: 0.5, metal: 0.5, finish: o.finish ?? "painted", tile: 2 }); // rain cap
  for (let i = 0; i < 4; i++) {                                                     // louvres
    box(g, w * 0.5, 0.014, 0.01, 0, 0.09 + h * 0.28 + i * 0.05, d / 2 + 0.006, shell,
      { rough: 0.6, metal: 0.4 });
  }
  const door = group(g, -w / 2 + 0.01, 0.09 + h / 2, d / 2);
  box(door, w - 0.03, h - 0.06, 0.022, (w - 0.03) / 2, 0, 0.012, o.doorColor ?? shell,
    { rough: 0.45, metal: 0.55, finish: o.finish ?? "painted", tile: 2 });
  box(door, 0.03, 0.13, 0.03, w - 0.09, 0, 0.03, CITY.steel, { rough: 0.3, metal: 0.9 });
  if (o.weathered !== false) {
    weatherPanel(door, (w - 0.03) * 0.94, (h - 0.06) * 0.94, (w - 0.03) / 2, 0, 0.024,
      { tone: "10,9,6", alpha: 0.045, grime: 0.16 });
  }
  if (o.open) door.rotation.y = o.open;
  g.userData.door = door;
  return g;
}

/** 19-inch equipment rack — telecom nodes, controllers, inverters. */
export function rackFrame(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const h = o.h ?? 1.4;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    box(g, 0.035, h, 0.035, sx * 0.24, h / 2, sz * 0.26, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
  }
  box(g, 0.56, 0.03, 0.6, 0, 0.02, 0, CITY.darkSteel, { rough: 0.6, metal: 0.5 });
  return g;
}

/** A rack-mounted unit with a faceplate you can paint. */
export function rackUnit(parent, y, label, o = {}) {
  const g = group(parent, 0, y, 0.26);
  box(g, 0.5, o.h ?? 0.09, 0.5, 0, 0, -0.26, o.color ?? 0x22282e, { rough: 0.5, metal: 0.4 });
  decal(g, 0.46, (o.h ?? 0.09) * 0.7, 0, 0, 0.001,
    signFace(label, { bg: o.bg ?? "#161c22", accent: o.css ?? CITY.accentCss, scale: 0.55, worn: true }),
    { px: 384, glow: !!o.glow, ei: 0.6 });
  for (const sx of [-1, 1]) {
    ball(g, 0.008, sx * 0.2, (o.h ?? 0.09) * 0.28, 0.004, o.lampColor ?? CITY.good,
      { emissive: o.lampColor ?? CITY.good, ei: 2.2 });
  }
  return g;
}

/** Traffic cone with a reflective collar. */
export function cone(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z);
  box(g, 0.3, 0.02, 0.3, 0, 0.01, 0, 0x22262b, { rough: 0.9 });
  cyl(g, 0.03, 0.13, 0.55, 0, 0.29, 0, o.color ?? 0xe4622a, { rough: 0.75, seg: 16 });
  cyl(g, 0.075, 0.095, 0.07, 0, 0.33, 0, 0xe8eef2, { rough: 0.5, seg: 16 });
  return g;
}

/** Folding barrier rail / pedestrian fence panel. */
export function barrierPanel(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  const w = o.w ?? 1.3;
  for (const sx of [-1, 1]) {
    cyl(g, 0.02, 0.02, 1.0, sx * (w / 2), 0.5, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    box(g, 0.24, 0.02, 0.3, sx * (w / 2), 0.015, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
  }
  for (const y of [0.42, 0.92]) box(g, w, 0.035, 0.02, 0, y, 0, o.color ?? CITY.hiVis, { rough: 0.6 });
  for (let i = 0; i < 5; i++) {
    box(g, 0.018, 0.5, 0.014, -w / 2 + 0.12 + i * ((w - 0.24) / 4), 0.67, 0, CITY.steel,
      { rough: 0.5, metal: 0.6 });
  }
  return g;
}

/** Rolling tool chest — the technician's kit at every station. */
export function toolChest(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  slab(g, 0.62, 0.62, 0.4, 0, 0.42, 0, o.color ?? 0xb8402f, { radius: 0.02, rough: 0.5, metal: 0.3 });
  for (let i = 0; i < 3; i++) {
    box(g, 0.56, 0.02, 0.01, 0, 0.24 + i * 0.16, 0.205, 0x1b1e22, { rough: 0.6 });
    box(g, 0.16, 0.02, 0.02, 0, 0.31 + i * 0.16, 0.208, CITY.steel, { rough: 0.35, metal: 0.85 });
  }
  slab(g, 0.66, 0.03, 0.44, 0, 0.74, 0, 0x2b3138, { radius: 0.02, rough: 0.4, metal: 0.5 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const c = cyl(g, 0.045, 0.045, 0.02, sx * 0.24, 0.045, sz * 0.15, 0x14171a, { rough: 0.85, seg: 12 });
    c.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Gas / fluid cylinder, upright and secured. */
export function cylinderTank(parent, x, z, color, o = {}) {
  const g = group(parent, x, 0, z);
  lathe(g, [[0.001, 0], [0.1, 0.01], [0.105, 0.06], [0.105, 0.86], [0.08, 0.95], [0.042, 0.99],
    [0.042, 1.06], [0.001, 1.065]], 0, 0, 0, color, { rough: 0.45, metal: 0.5, seg: 28, finish: "galvanised" });
  cyl(g, 0.05, 0.055, 0.08, 0, 1.11, 0, CITY.steel, { rough: 0.35, metal: 0.85, seg: 18, finish: "brushed" });
  if (o.gauge !== false) {
    cyl(g, 0.035, 0.035, 0.014, 0.07, 1.09, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 14 })
      .rotation.z = Math.PI / 2;
  }
  if (o.plate !== false) {
    const plate = group(g, 0.107, o.plateY ?? 0.5, 0, Math.PI / 2);
    decal(plate, o.plateW ?? 0.15, o.plateH ?? 0.19, 0, 0, 0.001, (cx, cw, ch) => {
      gradientFill(cx, cw, ch, [[0, "#eee7d6"], [1, "#cfc6ab"]]);
      noiseTexture(cx, cw, ch, { density: 420, alpha: 0.06, tone: "70,58,32" });
      grimeOverlay(cx, cw, ch, { blotches: 2, streaks: 2, tone: "55,44,24", alpha: 0.2 });
      cx.strokeStyle = "#3a4450"; cx.lineWidth = Math.max(2, ch * 0.02);
      cx.strokeRect(ch * 0.06, ch * 0.06, cw - ch * 0.12, ch - ch * 0.12);
      cx.fillStyle = "#22303c";
      cx.font = `700 ${Math.round(ch * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(o.plateLabel ?? "CYLINDER", cw / 2, ch * 0.22);
      cx.fillStyle = "#5a4a2a";
      cx.font = `${Math.round(ch * 0.08)}px Arial, sans-serif`;
      (o.plateLines ?? ["INSPECT BEFORE USE", "SEE TAG FOR CONTENTS"]).forEach((line, i) =>
        cx.fillText(line, cw / 2, ch * 0.42 + i * ch * 0.11));
    }, { px: 160, rough: 0.75 });
  }
  return g;
}

/** Pipe run with flanges — plant rooms, vaults, chiller skids. */
export function pipeRun(parent, points, radius, color, o = {}) {
  const g = group(parent);
  hose(g, points, radius, color, { steps: o.steps ?? 24, rough: o.rough ?? 0.5, metal: o.metal ?? 0.6 });
  for (const p of o.flanges ?? []) {
    const f = cyl(g, radius * 1.8, radius * 1.8, 0.03, p[0], p[1], p[2], CITY.darkSteel,
      { rough: 0.5, metal: 0.7, seg: 16 });
    if (o.flangeAxis === "z") f.rotation.x = Math.PI / 2;
    if (o.flangeAxis === "x") f.rotation.z = Math.PI / 2;
  }
  return g;
}

/** Hand wheel valve on a body — vaults, chiller plant, water main. */
export function valveWheel(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  const r = o.r ?? 0.16;
  box(g, 0.16, 0.18, 0.16, 0, 0, 0, o.body ?? 0x2f6f4a, { rough: 0.6, metal: 0.4 });
  cyl(g, 0.02, 0.02, 0.2, 0, 0.16, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 10 });
  const wheel = group(g, 0, 0.27, 0);
  torus(wheel, r, 0.016, 0, 0, 0, o.color ?? 0xb8402f, { rough: 0.6, seg: 8, seg2: 24 })
    .rotation.x = Math.PI / 2;
  for (let i = 0; i < 4; i++) {
    const spoke = box(wheel, r * 2, 0.014, 0.02, 0, 0, 0, o.color ?? 0xb8402f, { rough: 0.6 });
    spoke.rotation.y = (i * Math.PI) / 4;
  }
  cyl(wheel, 0.028, 0.028, 0.03, 0, 0, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 12 });
  g.userData.wheel = wheel;
  return g;
}

/** Padlock and tag, the shared vocabulary of every isolation step. */
export function lockTag(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  torus(g, 0.022, 0.006, 0, 0.024, 0, 0xc0c6cc, { rough: 0.25, metal: 0.95 }).rotation.y = Math.PI / 2;
  box(g, 0.03, 0.04, 0.017, 0, 0, 0, o.color ?? 0xd8232a, { rough: 0.5 });
  const tag = decal(g, 0.075, 0.1, 0, -0.085, 0.008,
    paperFace("DANGER", o.lines ?? ["DO NOT", "OPERATE"], { bg: "#f4e9d8", band: "#b81410", worn: true }), { px: 192 });
  tag.rotation.z = o.tilt ?? 0.07;
  return g;
}

/** Hand-held instrument with a live canvas readout — meters, probes, analysers. */
export function instrument(parent, x, y, z, o = {}) {
  const g = group(parent, x, y, z, o.ry ?? 0);
  slab(g, o.w ?? 0.13, 0.04, o.d ?? 0.21, 0, 0, 0, o.color ?? CITY.hiVis, { radius: 0.012, rough: 0.55 });
  const screen = decal(g, (o.w ?? 0.13) * 0.78, (o.d ?? 0.21) * 0.34, 0, 0.021, -(o.d ?? 0.21) * 0.2,
    signFace(o.idle ?? "----", { bg: "#0d1c24", accent: CITY.accentCss, fg: "#bfeaf7", scale: 0.62 }),
    { glow: true, ei: 0.85, px: 320 });
  screen.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 6; i++) {
    box(g, 0.02, 0.006, 0.014, -0.035 + (i % 3) * 0.035, 0.022, (o.d ?? 0.21) * 0.16 + Math.floor(i / 3) * 0.03,
      0x22262b, { rough: 0.6 });
  }
  g.userData.screen = screen;
  return g;
}

/** true/a colour/undefined, resolved against an outfit default, to a paint colour or null. */
function resolveTint(explicit, fallback, defaultColor) {
  const v = explicit ?? fallback ?? null;
  if (v === true) return defaultColor;
  return v || null;
}

/**
 * Standing figure — casualties, bystanders, crew members.
 *
 * Built from the shared figure parts in shared/kit.js, so a SmartCiti.X crew
 * member and a Trade Skills bay hand are the same person in different work
 * dress. Fourteen meshes bare — see the people section of kit.js for where
 * each one goes and why that is one more than the old stand-in cost.
 *
 * `skin`, `cloth`, `trousers` and `seed` are optional — left alone, the figure
 * takes a skin tone, a hair colour, a hair style, one of six faces and its work
 * dress from its own position, so a crew of six is six people rather than one
 * person six times.
 *
 * `outfit` names one of kit.js's OUTFITS (construction, clinical, marine,
 * kitchen, office, sport, firefighter, diver) and fills in whatever gear
 * below the caller left unnamed. Left out entirely, the outfit comes from
 * `setActiveContext()` — the app calls it with the station's category right
 * before the station builds, so an existing standingFigure(...) call with no
 * gear at all still dresses its crew for the trade it stands in.
 *
 * `vest` is the hi-vis garment: naming a colour, or passing `true` for the
 * figure's own cloth colour, paints two reflective bands across the chest,
 * on the upper arms and the lower legs, chest pocket flaps and a zip — all
 * canvas on meshes that are there anyway, so it costs nothing. `helmet` is a
 * hard hat, `cap` a baseball cap, `scrubCap` a soft surgical cap and
 * `diveHood` a neoprene hood — one mesh, and only one wins when more than one
 * is named, in the order diveHood, scrubCap, cap, helmet, hair. `glasses` a
 * wrap lens, or `mask` a dive mask over that same one mesh; `toolBelt` a
 * pouched belt; `gloves` and `boots` are paint, not a garment.
 */
export function standingFigure(parent, x, z, o = {}) {
  const g = group(parent, x, 0, z, o.ry ?? 0);
  // Tag them the way the trades bays tag theirs, so tools/check_layout.mjs
  // holds a SmartCiti.X figure to the same rule: a person has to be standing
  // somewhere, not inside a cabinet. A figure that is meant to be lying down,
  // or riding something, is exempt — that is where it is supposed to be.
  // `atStation` is for a figure whose position against the equipment is the
  // content — a casualty down the hole, a coworker riding the forks. Those are
  // meant to be where they are; everyone else is standing somewhere and has to
  // be standing somewhere real. The same flag marks a figure as one the idle
  // pass below may animate: a station that goes on to pose an "atStation" or
  // "lying" figure's own arms and head never has that overwritten by a stray
  // scratch or a head turn on top of it.
  const crew = !o.lying && !o.atStation;
  if (crew) g.userData.crew = true;
  const outfit = OUTFITS[o.outfit ?? outfitFromContext(getActiveContext())] ?? OUTFITS.office;
  const look = figureLook(o, x, z);
  const cloth = o.cloth ?? look.cloth;
  const trousers = o.trousers ?? look.trousers;
  const lying = !!o.lying;
  const body = group(g, 0, 0, 0);
  if (lying) { body.rotation.x = -Math.PI / 2; body.position.set(0, 0.16, 0); }
  const vestColor = resolveTint(o.vest, outfit.vest, cloth);
  const helmet = resolveTint(o.helmet, outfit.helmet, 0xffcc00);
  const cap = resolveTint(o.cap, outfit.cap, 0xd8532a);
  const scrubCap = resolveTint(o.scrubCap, outfit.scrubCap, 0x5b8fae);
  const diveHood = resolveTint(o.diveHood, outfit.diveHood, 0x14171a);
  const mask = resolveTint(o.mask, outfit.mask, 0x33434f);
  const glasses = mask ? null : resolveTint(o.glasses, outfit.glasses, 0xaebfcb);
  const gloves = resolveTint(o.gloves, outfit.gloves, 0xd8a63a);
  const boots = o.boots ?? outfit.boots ?? undefined;
  // A hi-vis vest is the garment worn over the shirt, so it takes the torso's
  // colour instead of costing a second shell around it, and the reflective
  // bands, pocket flaps and zip across it are painted on that same mesh.
  const dress = figureDress({
    coat: vestColor ?? cloth,
    trousers,
    band: vestColor ? (o.bands ?? outfit.bands ?? 0xdfe8ee) : null,
    glove: gloves,
    skin: look.skin,
  });
  const { torso } = personTorso(body, {
    cloth, trousers, harness: o.harness, jacket: vestColor ?? cloth,
    vis: dress.band, ei: 0.45, toolBelt: o.toolBelt, dress,
  });
  personLegs(body, { trousers, dress, boots });
  const head = group(body, 0, 1.5, 0);
  personHead(head, {
    look, k: 0.9, helmet, cap, scrubCap, diveHood, glasses, mask, respirator: o.respirator,
  });
  // Kept as [{shoulder, fore}, ...] (left first, then right) rather than
  // discarded like most callers do: the third-person chase view (app.js)
  // poses the learner's own figure to point at whatever the keyboard cursor
  // is on, the way sims/*.js already poses an NPC's arms.
  const arms = [];
  for (const sx of [-1, 1]) {
    arms.push(personArm(body, sx, { sleeve: cloth, skin: look.skin, glove: gloves, dress }));
  }
  g.userData.head = head;
  g.userData.body = body;
  g.userData.torso = torso;
  g.userData.arms = arms;
  return g;
}

// ---------------------------------------------------------------- idle life
//
// A crew figure that never moves reads as a mannequin the moment the learner
// stands still and looks at it. This is the cheap end of "alive": no bones,
// no clips, just a handful of small, continuous offsets laid on top of the
// pose the figure already has — breathing, a slow shift of weight, an
// occasional glance at the learner, and now and then a hand that goes to a
// wrist or the back of a neck and comes back down.
//
// It only ever touches a figure standingFigure marked `userData.crew`: an
// "atStation" or "lying" figure is exactly the one a station has posed
// itself (a casualty, a coworker riding the forks), and this must never
// undo that. Called once a frame with the whole room root — see
// tools/check_crew.mjs and app.js's render loop — it is a no-op the instant
// there is no crew in the room, and skips everything when the platform's own
// prefers-reduced-motion helper (shared/a11y.js) says to hold still.
const _idlePos = new THREE.Vector3();
const _idleState = new WeakMap();

function idleState(fig) {
  let s = _idleState.get(fig);
  if (!s) {
    s = {
      breathHz: 0.22 + Math.random() * 0.10, breathPhase: Math.random() * Math.PI * 2,
      swayHz: 0.09 + Math.random() * 0.05, swayPhase: Math.random() * Math.PI * 2,
      look: "idle", lookT: 2 + Math.random() * 5, lookYaw: 0,
      gesture: "idle", gestureT: 4 + Math.random() * 8, gestureSide: Math.random() < 0.5 ? 0 : 1,
      gestureBlend: 0, gestureWatch: Math.random() < 0.5,
    };
    _idleState.set(fig, s);
  }
  return s;
}

/** One figure's idle pass. `learnerPos`, if given, is in world space. */
function animateOneFigure(fig, t, dt, learnerPos) {
  const s = idleState(fig);
  const torso = fig.userData.torso;
  if (torso) {
    torso.userData.idleBase ??= torso.scale.clone();
    const b = torso.userData.idleBase;
    const breathe = Math.sin(t * s.breathHz * Math.PI * 2 + s.breathPhase) * 0.012;
    torso.scale.set(b.x * (1 + breathe * 0.6), b.y * (1 + breathe), b.z * (1 + breathe * 0.6));
  }
  const body = fig.userData.body;
  if (body) {
    const sway = Math.sin(t * s.swayHz * Math.PI * 2 + s.swayPhase);
    body.rotation.z = sway * 0.018;
    body.position.x = sway * 0.006;
  }
  const head = fig.userData.head;
  if (head) {
    s.lookT -= dt;
    if (s.lookT <= 0) {
      if (s.look === "idle") { s.look = "at"; s.lookT = 1.6 + Math.random() * 1.6; }
      else { s.look = "idle"; s.lookT = 3 + Math.random() * 5; }
    }
    let yaw = 0;
    if (s.look === "at" && learnerPos) {
      _idlePos.copy(learnerPos);
      fig.worldToLocal(_idlePos);
      yaw = Math.max(-0.6, Math.min(0.6, Math.atan2(_idlePos.x, _idlePos.z || 1e-4)));
    }
    head.rotation.y += (yaw - head.rotation.y) * Math.min(1, dt * 3);
  }
  const arms = fig.userData.arms;
  if (arms?.length === 2) {
    s.gestureT -= dt;
    if (s.gestureT <= 0) {
      if (s.gesture === "idle") {
        s.gesture = "up"; s.gestureT = 1.0 + Math.random() * 0.6;
        s.gestureSide = Math.random() < 0.5 ? 0 : 1; s.gestureWatch = Math.random() < 0.5;
      } else if (s.gesture === "up") { s.gesture = "down"; s.gestureT = 0.5 + Math.random() * 0.4; }
      else { s.gesture = "idle"; s.gestureT = 6 + Math.random() * 10; }
    }
    const target = s.gesture === "up" ? 1 : 0;
    s.gestureBlend += (target - s.gestureBlend) * Math.min(1, dt * 4);
    const raised = arms[s.gestureSide], resting = arms[1 - s.gestureSide];
    if (s.gestureWatch) {
      // A glance at a wrist: the forearm lifts to chest height, palm in.
      raised.shoulder.rotation.x = -1.15 * s.gestureBlend;
      raised.shoulder.rotation.z = (s.gestureSide === 1 ? 1 : -1) * 0.3 * s.gestureBlend;
      raised.fore.rotation.x = -1.35 * s.gestureBlend;
    } else {
      // A scratch at the back of the neck: the hand goes up and in.
      raised.shoulder.rotation.x = -1.7 * s.gestureBlend;
      raised.shoulder.rotation.z = (s.gestureSide === 1 ? -1 : 1) * 0.25 * s.gestureBlend;
      raised.fore.rotation.x = -1.55 * s.gestureBlend;
    }
    const relax = Math.min(1, dt * 4);
    resting.shoulder.rotation.x += (0 - resting.shoulder.rotation.x) * relax;
    resting.shoulder.rotation.z += (0 - resting.shoulder.rotation.z) * relax;
    resting.fore.rotation.x += (0 - resting.fore.rotation.x) * relax;
  }
}

/**
 * The idle pass for every crew figure under `root`, once a frame. `learnerPos`
 * is the learner's world position (a camera or rig), used only so a figure
 * can glance toward them — pass null to leave every head at rest.
 * `reduceMotion` (shared/a11y.js's `reducedMotion()`) skips the whole pass,
 * which leaves every figure exactly as standingFigure built it: no drift, no
 * held-open gesture, nothing to disable one property at a time.
 */
export function animateCrew(root, t, dt, learnerPos, reduceMotion) {
  if (!root || reduceMotion) return;
  root.traverse((o) => { if (o.userData?.crew) animateOneFigure(o, t, dt, learnerPos); });
}

// Discrete tone/finish sets — reused across towers so the material cache stays small
// instead of minting one unique material per random roughness value.
const SKY_TONES = [0x283547, 0x2d3c53, 0x222d3d, 0x323e51, 0x1f2b3b, 0x354a62];
const SKY_ROUGH = [0.82, 0.88, 0.94, 1.0];
const SKY_WINDOW = [0x4fd1ff, 0x7ee6ff, 0xffd28a, 0xa079ff];

/**
 * Distant skyline for the non-AR stage: a silhouette ring, never lit by scene lights.
 * Each tower gets its own height/tone/window-band treatment so the ring reads as a
 * real mixed-use district rather than a repeated block; a handful of rooftops carry a
 * slow-pulsing beacon (returned in `userData.beacons` for the caller to animate).
 */
export function skyline(parent, o = {}) {
  const g = group(parent);
  const count = o.count ?? 54;
  const beacons = [];
  // A district on a shoreline opens the ring toward the water: `gap` is the
  // [from, to] bearing (radians, 0 = +z, π = the side the learner faces) in
  // which no tower is built, so the horizon there is whatever the district
  // puts across the bay instead of a wall of city.
  // `gap` may also be a list of such arcs, and `base` drops the ring's feet
  // below the plaza (a city seen from a bridge deck stands far below it).
  const gaps = !o.gap ? [] : Array.isArray(o.gap[0]) ? o.gap : [o.gap];
  const base = o.base ?? -1.5;
  const inGap = (a) => { const n = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return gaps.some((gp) => n >= gp[0] && n <= gp[1]); };
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.05;
    if (inGap(a)) continue;
    const r = (o.radius ?? 34) + Math.random() * (o.spread ?? 16);
    const h = (5 + Math.random() * 24) * (o.hScale ?? 1);
    const w = (3 + Math.random() * 5) * (o.wScale ?? 1);
    const tone = SKY_TONES[i % SKY_TONES.length];
    const rough = SKY_ROUGH[i % SKY_ROUGH.length];
    const metal = i % 5 === 0 ? 0.3 : 0;
    const tower = box(g, w, h, w, Math.sin(a) * r, h / 2 + base, Math.cos(a) * r,
      tone, { rough, metal, cast: false, receive: false });
    tower.rotation.y = a;
    const bands = 1 + (i % 3 === 0 ? 1 : 0);
    for (let b = 0; b < bands; b++) {
      if ((i + b * 7) % 5 === 0) continue; // leave some floors dark
      const wt = SKY_WINDOW[(i + b) % SKY_WINDOW.length];
      const lit = box(g, w * (0.55 + ((i + b) % 4) * 0.06), 0.06, 0.05,
        Math.sin(a) * r, h * (0.25 + b * 0.32 + ((i * 7 + b) % 5) * 0.05) + base,
        Math.cos(a) * r + w / 2, wt,
        { emissive: wt, ei: 1.3 + ((i + b) % 4) * 0.35, rough: 0.4, cast: false, receive: false });
      lit.rotation.y = a;
    }
    if (i % 9 === 0) {
      const beacon = ball(g, 0.09, Math.sin(a) * r, h + base + 0.12, Math.cos(a) * r, 0xff5f5f,
        { emissive: 0xff5f5f, ei: 1.6, rough: 0.3, cast: false });
      // Give each beacon its own material instance (cheap — a handful of towers only)
      // so the pulse below can stagger per-beacon instead of every one sharing (and
      // fighting over) the single cached material `mat()` would otherwise reuse.
      beacon.material = beacon.material.clone();
      beacon.material.userData.ownMaterial = true; // disposeTree() should free this clone
      beacon.userData.phase = (i / count) * Math.PI * 2;
      beacons.push(beacon);
    }
  }
  g.userData.beacons = beacons;
  return g;
}

export function reg(hits, obj, id) {
  markInteractive(obj, id);
  hits[id] = obj;
  return obj;
}
