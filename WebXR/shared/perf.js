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
