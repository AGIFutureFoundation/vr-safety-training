// One look for the whole platform (console POLISH, tools/briefs/polish-brief.md).
//
// The design tokens are derived from the homepage (tools/gen_home.mjs, its
// :root block): the same void, panel and raised surfaces, the same cyan
// accent and warm signal colours, the same radii, elevation and focus ring.
// thMount() injects them once as CSS custom properties (`--th-…`) and adopts
// them for the chrome every page shares — the Home chip, the help button and
// overlay, the account chip and its dialog, the Guide — and for each app's HUD
// panels, menus, job boards, dialogs and the track pages, without changing any
// box's size (backgrounds, borders' colour, radii, shadows and focus only), so
// no fixed panel moves. Panel text stays at or above 4.5:1 on every surface
// (thContrast, checked by tools/check_ui.mjs).
//
// controls.js calls thMount() from ctlMount(), so every page that carries the
// control grammar — every bundle, the homepage, every track page, the Atlas —
// carries the tokens. Pure except thMount; every top-level name is prefixed
// `th`/`TH_` because the bundler concatenates all modules into one scope.

const thHasDom = typeof document !== "undefined";

/** The tokens, dark (default) and light. Values are CSS. */
export const TH_TOKENS = Object.freeze({
  dark: Object.freeze({
    "void": "#050a10", "panel": "#0b141d", "panel-2": "#101b27", "raised": "#142130", "raised-2": "#192a3b",
    "glass": "rgba(8,16,24,.86)", "glass-strong": "rgba(8,16,24,.94)",
    "text": "#edf6fb", "muted": "#a9c3d2", "dim": "#8aa6b8",
    "accent": "#4fd1ff", "accent-2": "#7ee6ff", "accent-ink": "#03202b", "violet": "#a079ff",
    "warn": "#f2c14b", "danger": "#f0645b", "good": "#59c97b",
    "edge": "rgba(126,170,200,.16)", "edge-strong": "rgba(126,170,200,.36)",
  }),
  light: Object.freeze({
    "void": "#f3f7fa", "panel": "#ffffff", "panel-2": "#f6fafc", "raised": "#e9f1f6", "raised-2": "#dde9f1",
    "glass": "rgba(255,255,255,.92)", "glass-strong": "rgba(255,255,255,.97)",
    "text": "#0b1822", "muted": "#34505f", "dim": "#4a6574",
    "accent": "#006f93", "accent-2": "#005a78", "accent-ink": "#ffffff", "violet": "#5b35c4",
    "warn": "#8a5a00", "danger": "#b3261e", "good": "#1d6b36",
    "edge": "rgba(20,50,70,.14)", "edge-strong": "rgba(20,50,70,.32)",
  }),
});

/** Type scale, radii, elevation, focus ring and motion — shared by both schemes. */
export const TH_SCALE = Object.freeze({
  "font": '"Barlow", system-ui, -apple-system, "Segoe UI", sans-serif',
  "font-cond": '"Barlow Condensed", "Barlow", system-ui, sans-serif',
  "fs-xs": "12px", "fs-sm": "14px", "fs-md": "16px", "fs-lg": "20px", "fs-xl": "28px",
  "r-sm": "6px", "r-md": "10px", "r-lg": "14px", "r-pill": "999px",
  "shadow-1": "0 6px 18px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04)",
  "shadow-2": "0 24px 60px rgba(0,0,0,.55)",
  "ring": "0 0 0 3px rgba(79,209,255,.35)",
  "focus": "#ffd166",
  "dur-fast": "120ms", "dur": "200ms", "dur-slow": "360ms",
});

/** WCAG contrast ratio of two #rrggbb colours. */
export function thContrast(fg, bg) {
  const lum = (hex) => {
    const n = String(hex).replace("#", "");
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const thVars = (o) => Object.entries(o).map(([k, v]) => `--th-${k}:${v}`).join(";");

/**
 * The HUD panels, menus, job boards and dialogs of every app that adopt the
 * token surfaces. Only paint changes here — never padding, width or font
 * size — so every layout the UI and mobile checkers measure stays put.
 */
export const TH_ADOPT = Object.freeze({
  panels: ["#hud .panel", ".hud .item", "#minimap", "#hud-buttons button", "#hud-clubs button", "#touch-pad button"],
  dialogs: ["#scr-jobboard .card", "#scr-menu .card", ".menu-card", "#gt-dialog .gt-panel", "#ctl-help .ctl-panel", "#gd-panel"],
  chips: [".home-chip", "#ctl-help-btn", "#gt-account", "#gd-btn"],
});

/** The whole stylesheet thMount injects. */
export function thCss() {
  const p = TH_ADOPT.panels.join(",");
  const d = TH_ADOPT.dialogs.join(",");
  const c = TH_ADOPT.chips.join(",");
  return `
:root{${thVars(TH_TOKENS.dark)};${thVars(TH_SCALE)};color-scheme:dark}
:root[data-theme="light"]{${thVars(TH_TOKENS.light)};color-scheme:light}
${p}{background-color:var(--th-glass);border-color:var(--th-edge-strong);color:var(--th-text);box-shadow:var(--th-shadow-1);border-radius:var(--th-r-md)}
${d}{background-color:var(--th-glass-strong);border-color:var(--th-edge-strong);color:var(--th-text);box-shadow:var(--th-shadow-2);border-radius:var(--th-r-lg)}
${c}{background-color:var(--th-glass);border-color:var(--th-edge-strong);color:var(--th-text);box-shadow:var(--th-shadow-1);transition:background-color var(--th-dur-fast) ease,border-color var(--th-dur-fast) ease}
${TH_ADOPT.chips.map((s) => `${s}:hover`).join(",")}{background-color:var(--th-raised-2);border-color:var(--th-accent)}
${TH_ADOPT.chips.map((s) => `${s}:focus-visible`).join(",")}{outline:3px solid var(--th-focus);outline-offset:2px}
#ctl-help .ctl-panel kbd{border-radius:var(--th-r-sm)}
.home-chip.ctl-home{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:0 12px;border:1px solid var(--th-edge-strong);border-radius:16px;font:600 14px/1 var(--th-font);text-decoration:none;white-space:nowrap}
.th-panel{background:var(--th-glass);color:var(--th-text);border:1px solid var(--th-edge-strong);border-radius:var(--th-r-md);box-shadow:var(--th-shadow-1)}
.th-btn{background:var(--th-raised);color:var(--th-text);border:1px solid var(--th-edge-strong);border-radius:var(--th-r-sm);font-family:var(--th-font-cond);font-weight:600;letter-spacing:.06em;cursor:pointer}
.th-btn.primary{background:var(--th-accent);color:var(--th-accent-ink);border-color:var(--th-accent)}
@media (prefers-reduced-motion: reduce){${c}{transition:none}}
`;
}

/**
 * Inject the tokens once; a later call moves the sheet back to the end of
 * <head>, after any shared sheet mounted since (the account chip's, the
 * Guide's). Returns the <style> element (or null headless).
 */
export function thMount() {
  if (!thHasDom) return null;
  let el = document.getElementById("th-tokens");
  if (el) { if (el !== document.head.lastElementChild) document.head.appendChild(el); return el; }
  el = document.createElement("style");
  el.id = "th-tokens";
  el.textContent = thCss();
  // Last in <head>, after each app's own sheet, so the adopt rules (same
  // selectors as the apps use) win on paint; layout rules are never touched.
  document.head.appendChild(el);
  return el;
}
