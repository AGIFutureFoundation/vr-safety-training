// Headset-pass instrument. `?perf=1` on any app turns it on: it keeps the
// last few seconds of frame times, samples the renderer's draw calls and
// triangles, shows them in a corner overlay (and a line on the VR HUD), and
// writes one summary per completed run to a local log the headset pass can
// export. This is the data the ledger's "Quest pass, heaviest stations first"
// step records: average and 95th-percentile frame time per station per mode,
// on the device it ran on. Nothing here runs unless perf mode is on, and
// nothing leaves the device unless the log is exported.

const LOG_KEY = "vr-training-perf-v1";
const WINDOW = 180; // frames kept (~3 s at 60 Hz, ~2 s at 90 Hz)

const hasDom = typeof document !== "undefined";
const params = typeof location !== "undefined" ? new URLSearchParams(location.search) : null;
const enabled = !!params && params.get("perf") !== null && params.get("perf") !== "0";

// ------------------------------------------------------------- quality tiers
//
// How big a canvas-painted texture should be, and whether a painted material
// also gets the extra roughness/bump maps that come from painting a second
// small canvas from the same noise. Picked once, cheaply, at module load, and
// read by shared/textures.js and smartcity/js/citykit.js so every face
// painter and every district shares the same answer instead of each module
// guessing its own.
//
// `typeof HTMLCanvasElement !== "undefined"` is the headless tell: the
// content checkers' stubbed `document.createElement("canvas")` (tools/lib/
// headless.mjs) fakes a `getContext` well enough that painters never throw,
// but it is not a real HTMLCanvasElement, so this reads false there — 256px
// headless, the smallest tier, since nothing there is ever actually
// rendered to a screen.
const hasRealCanvas = typeof HTMLCanvasElement !== "undefined";

function detectQuality() {
  const q = params?.get("quality");
  if (q === "low" || q === "high") return q;
  try {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    // The standalone headset browsers (Quest, PICO) carry "Android" in their
    // UA too — full desktop-class GPUs, so they stay in the high tier; only
    // an actual phone/tablet browser drops to low.
    if (/OculusBrowser|PICO/i.test(ua)) return "high";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "low";
  } catch { /* no navigator (headless) */ }
  return "high";
}

/** "high" or "low". `?quality=` on the URL always wins; otherwise a mobile
 *  browser (not a standalone VR headset's) picks low, everything else high.
 *  Read by shared/textures.js to decide whether a painted material also
 *  carries a bump/roughness map — see facePaint()/paintedMat() there. */
export const QUALITY = detectQuality();

/** The square pixel size a canvas face painter renders at when its caller
 *  does not ask for a specific one: 1024 on desktop/VR, 512 on a mobile
 *  browser or `?quality=low`, 256 with no real canvas to paint on at all
 *  (the content checkers, or any other Node run). A caller always overrides
 *  this with an explicit `{ px }`. */
export const TEXTURE_RES = !hasRealCanvas ? 256 : (QUALITY === "low" ? 512 : 1024);

const frames = new Float32Array(WINDOW);
let head = 0, filled = 0, worst = 0;
let calls = 0, triangles = 0, lastSample = 0;
let overlay = null;

function stats() {
  const n = filled;
  if (!n) return { avgMs: 0, p95Ms: 0, worstMs: 0, fps: 0, frames: 0 };
  const sorted = Array.from(frames.subarray(0, n)).sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / n;
  const p95 = sorted[Math.min(n - 1, Math.floor(n * 0.95))];
  return { avgMs: +(avg * 1000).toFixed(2), p95Ms: +(p95 * 1000).toFixed(2), worstMs: +(worst * 1000).toFixed(2), fps: +(1 / avg).toFixed(1), frames: n };
}

export const Perf = {
  get enabled() { return enabled; },
  /** Call once per rendered frame with the frame's delta in seconds. */
  frame(dt) {
    if (!enabled || !(dt > 0)) return;
    frames[head] = dt; head = (head + 1) % WINDOW; if (filled < WINDOW) filled += 1;
    if (dt > worst) worst = dt;
  },
  /** Sample the renderer's counters; cheap, call a few times a second. Returns true when it sampled. */
  sample(renderer, t) {
    if (!enabled) return false;
    if (t !== undefined && t - lastSample < 0.5) return false;
    lastSample = t ?? 0;
    const r = renderer?.info?.render;
    if (r) { calls = r.calls | 0; triangles = r.triangles | 0; }
    if (overlay) overlay.textContent = Perf.text();
    return true;
  },
  /** Reset the window (e.g. when a new station is built) so its numbers are its own. */
  reset() { head = 0; filled = 0; worst = 0; },
  snapshot(extra = {}) {
    return { ...stats(), calls, triangles, ...extra };
  },
  /** One line for a HUD. */
  text() {
    const s = stats();
    return `${s.fps} fps · ${s.avgMs} ms avg · ${s.p95Ms} ms p95 · ${s.worstMs} ms worst · ${calls} calls · ${(triangles / 1000).toFixed(0)}k tris`;
  },
  /** Append a run summary to the local log. Returns the entry, or null when perf mode is off. */
  logRun(meta = {}) {
    if (!enabled) return null;
    const entry = { at: new Date().toISOString(), ua: typeof navigator !== "undefined" ? navigator.userAgent : "", ...Perf.snapshot(), ...meta };
    try {
      const list = Perf.list();
      list.push(entry);
      localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(-500)));
    } catch (_) { /* private mode or no storage: the overlay still shows live numbers */ }
    return entry;
  },
  list() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]"); } catch (_) { return []; }
  },
  clear() { try { localStorage.removeItem(LOG_KEY); } catch (_) {} },
  /** Fixed corner readout; a click downloads the log as JSON. */
  mountOverlay() {
    if (!enabled || !hasDom || overlay) return overlay;
    overlay = document.createElement("button");
    overlay.id = "perf-hud";
    overlay.type = "button";
    overlay.title = "Headset-pass instrument — click to download the run log (JSON)";
    overlay.setAttribute("aria-label", "Performance readout; click to download the run log");
    Object.assign(overlay.style, {
      position: "fixed", right: "12px", bottom: "12px", zIndex: 60, font: "600 11px/1.4 ui-monospace, Menlo, Consolas, monospace",
      color: "#dfeaf2", background: "rgba(8,12,18,0.82)", border: "1px solid rgba(223,234,242,0.25)", borderRadius: "8px",
      padding: "6px 9px", letterSpacing: "0.02em", cursor: "pointer", maxWidth: "70vw", textAlign: "left",
    });
    overlay.textContent = "perf: warming up";
    overlay.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), runs: Perf.list() }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `perf-log-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    document.body.appendChild(overlay);
    return overlay;
  },
  LOG_KEY,
};

// ------------------------------------------------------ play quality tiers
//
// Console TOUCH: the render tier a game plays at (distinct from the texture
// tier above, which only sizes painted canvases). A coarse pointer or a
// small screen picks "low" on its own — a lower resolution scale, no
// shadows, nearer fog and fewer wildlife and traffic agents — unless the
// viewer chose a tier with the HUD's Low / Balanced / High toggle, which is
// kept in localStorage. `?tier=` on the URL wins over both.

const tcTierKey = "holodeck-quality-tier-v1";

/** The toggle's labels, in order. */
export const tcTierLabels = { low: "Low", balanced: "Balanced", high: "High" };

/** What each tier means to a game. `pixelScale` multiplies the device pixel
 *  ratio (then capped at `maxPixelRatio`); `fogScale` above 1 brings the fog
 *  nearer; the agent scales thin out wildlife and traffic. */
export const tcTierSettings = {
  low: { tier: "low", pixelScale: 0.75, maxPixelRatio: 1, shadows: false, fogScale: 1.6, wildlifeScale: 0.4, trafficScale: 0.5 },
  balanced: { tier: "balanced", pixelScale: 1, maxPixelRatio: 1.5, shadows: false, fogScale: 1.2, wildlifeScale: 0.7, trafficScale: 0.75 },
  high: { tier: "high", pixelScale: 1, maxPixelRatio: 2, shadows: true, fogScale: 1, wildlifeScale: 1, trafficScale: 1 },
};

/** Pure: the tier a device would get with no choice made. A coarse primary
 *  pointer or a screen whose short side is under 600 CSS px is a phone. */
export function tcAutoTier({ coarse = false, width = 1280, height = 800 } = {}) {
  return coarse || Math.min(width, height) < 600 ? "low" : "high";
}

function tcEnv() {
  if (!hasDom || typeof window === "undefined") return { coarse: false, width: 1280, height: 800 };
  let coarse = false;
  try { coarse = typeof matchMedia === "function" && matchMedia("(pointer:coarse)").matches; } catch { /* old browser */ }
  return { coarse, width: window.innerWidth || 1280, height: window.innerHeight || 800 };
}

/** The tier in force and why: "url", "chosen" (the toggle) or "auto". */
export function tcTierChoice() {
  const u = params?.get("tier");
  if (u && tcTierSettings[u]) return { tier: u, source: "url" };
  try {
    const c = typeof localStorage !== "undefined" ? localStorage.getItem(tcTierKey) : null;
    if (c && tcTierSettings[c]) return { tier: c, source: "chosen" };
  } catch { /* private mode: fall through to auto */ }
  return { tier: tcAutoTier(tcEnv()), source: "auto" };
}

/** Persist the viewer's choice. Returns false when storage is unavailable. */
export function tcSetTier(tier) {
  if (!tcTierSettings[tier]) return false;
  try { localStorage.setItem(tcTierKey, tier); return true; } catch { return false; }
}

/** The settings object for the tier in force (or a named one). */
export function tcTier(tier = tcTierChoice().tier) { return tcTierSettings[tier] ?? tcTierSettings.high; }

/** Apply a tier to a three.js renderer (pixel ratio and shadows) and record
 *  it on <html data-tier> so a checker or a stylesheet can read it. */
export function tcApplyRenderer(renderer, settings = tcTier()) {
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  renderer?.setPixelRatio?.(Math.min(settings.maxPixelRatio, dpr * settings.pixelScale));
  if (renderer?.shadowMap) renderer.shadowMap.enabled = !!settings.shadows;
  if (hasDom) document.documentElement.dataset.tier = settings.tier;
  return settings;
}
