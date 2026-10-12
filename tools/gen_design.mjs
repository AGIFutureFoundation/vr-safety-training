/**
 * The design system's generated files (console ATELIER, docs/design-system/README.md).
 *
 *     node tools/gen_design.mjs
 *
 * Writes, from the tokens in WebXR/shared/theme.js, the spot illustrations in
 * WebXR/shared/illustrations.js, the vendored icons in WebXR/vendor/icons/ and
 * the vendored fonts in WebXR/vendor/fonts/:
 *
 *   WebXR/shared/design.css   the one shared stylesheet every app page links:
 *                             self-hosted @font-face, every token as --at-*,
 *                             the icon set, the component templates (at-*)
 *   WebXR/design/index.html   the template gallery: every component in light
 *                             and dark, the icons, the illustrations, the tokens
 *
 * Deterministic; tools/check_design.mjs regenerates in memory and compares.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const { TH_TOKENS, AT_ROLES, AT_TYPE, AT_SPACE, AT_SHAPE, AT_CONTRAST_PAIRS, thContrast } = await import(pathToFileURL(join(WEBXR, "shared/theme.js")).href);
const { AT_ILLO_KINDS, AT_ILLO_CSS, atIllustration } = await import(pathToFileURL(join(WEBXR, "shared/illustrations.js")).href);

/** The self-hosted faces: family, weight, style, file stem (latin + latin-ext each). */
export const AT_FACES = [
  ["Barlow", 400, "normal", "barlow"], ["Barlow", 500, "normal", "barlow"], ["Barlow", 600, "normal", "barlow"], ["Barlow", 700, "normal", "barlow"],
  ["Barlow Condensed", 500, "normal", "barlow-condensed"], ["Barlow Condensed", 600, "normal", "barlow-condensed"],
  ["Barlow Condensed", 700, "normal", "barlow-condensed"], ["Barlow Condensed", 700, "italic", "barlow-condensed"],
];
const AT_RANGES = {
  latin: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
  "latin-ext": "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF",
};

function fontFaces() {
  const out = [];
  for (const [family, weight, style, stem] of AT_FACES) {
    for (const subset of ["latin-ext", "latin"]) {
      out.push(`@font-face{font-family:"${family}";font-style:${style};font-weight:${weight};font-display:swap;src:url(../vendor/fonts/${stem}-${subset}-${weight}-${style}.woff2) format("woff2");unicode-range:${AT_RANGES[subset]}}`);
    }
  }
  out.push(`@font-face{font-family:"Press Start 2P";font-style:normal;font-weight:400;font-display:swap;src:url(../vendor/fonts/press-start-2p-latin-400-normal.woff2) format("woff2");unicode-range:${AT_RANGES.latin}}`);
  return out.join("\n");
}

/** Every vendored icon, as a mask-ready data URI keyed by file stem. */
export function atIcons() {
  const dir = join(WEBXR, "vendor/icons");
  const icons = {};
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".svg")).sort()) {
    const svg = readFileSync(join(dir, f), "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/\s*class="[^"]*"/, "").replace(/\s+/g, " ").replace(/> </g, "><").trim();
    icons[f.replace(/\.svg$/, "")] = `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/%20/g, " ").replace(/%3D/g, "=").replace(/%3A/g, ":").replace(/%2F/g, "/").replace(/%22/g, "'")}")`;
  }
  return icons;
}

const vars = (o) => Object.entries(o).map(([k, v]) => `--at-${k}:${v}`).join(";");

/** The component templates. Everything is namespaced .at-*. */
const AT_COMPONENTS = `
/* ---- base ---- */
.at-root,.at-scheme{font-family:var(--at-font-body);color:var(--at-on-surface);background:var(--at-bg);line-height:var(--at-lh-body)}
.at-vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
/* ---- icons ---- */
.at-i{display:inline-block;flex:none;width:1.15em;height:1.15em;vertical-align:-.2em;background:currentColor;-webkit-mask:var(--at-i) center/contain no-repeat;mask:var(--at-i) center/contain no-repeat}
/* ---- buttons ---- */
.at-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--at-sp-2);min-height:var(--at-tap);padding:0 var(--at-sp-5);border-radius:var(--at-r-pill);border:1px solid var(--at-border-strong);background:var(--at-raised);color:var(--at-on-surface);font:var(--at-fw-semibold) var(--at-fs-md)/1 var(--at-font-display);letter-spacing:.04em;text-decoration:none;cursor:pointer;transition:background-color var(--at-dur-fast) var(--at-ease-out),border-color var(--at-dur-fast) var(--at-ease-out),transform var(--at-dur-fast) var(--at-ease-out)}
.at-btn:hover{background:var(--at-raised-2);border-color:var(--at-primary)}
.at-btn:active{transform:translateY(1px)}
.at-btn:focus-visible,.at-tab:focus-visible,.at-chip:focus-visible,.at-card a:focus-visible{outline:3px solid var(--at-focus);outline-offset:2px}
.at-btn--primary{background:var(--at-primary);border-color:var(--at-primary);color:var(--at-on-primary)}
.at-btn--primary:hover{background:var(--at-primary-strong);border-color:var(--at-primary-strong)}
.at-btn--secondary{background:transparent;border-color:var(--at-primary);color:var(--at-primary)}
.at-btn--ghost{background:transparent;border-color:transparent;color:var(--at-on-surface)}
.at-btn--ghost:hover{background:var(--at-raised);border-color:var(--at-border)}
.at-btn[disabled],.at-btn[aria-disabled="true"]{opacity:.55;cursor:not-allowed}
/* ---- badge / chip ---- */
.at-badge{display:inline-flex;align-items:center;gap:var(--at-sp-1);min-height:24px;padding:0 var(--at-sp-2);border-radius:var(--at-r-pill);font:var(--at-fw-semibold) var(--at-fs-xs)/1 var(--at-font-body);letter-spacing:var(--at-tracking-caps);text-transform:uppercase;background:var(--at-raised);color:var(--at-on-surface-muted);border:1px solid var(--at-border)}
.at-badge--primary{color:var(--at-primary);border-color:currentColor}
.at-badge--success{color:var(--at-success);border-color:currentColor}
.at-badge--warning{color:var(--at-warning);border-color:currentColor}
.at-badge--danger{color:var(--at-danger);border-color:currentColor}
.at-chip{display:inline-flex;align-items:center;gap:var(--at-sp-2);min-height:36px;padding:0 var(--at-sp-3);border-radius:var(--at-r-pill);border:1px solid var(--at-border-strong);background:var(--at-surface-2);color:var(--at-on-surface);font:var(--at-fw-medium) var(--at-fs-sm)/1 var(--at-font-body);text-decoration:none;cursor:pointer}
.at-chip[aria-pressed="true"],.at-chip.is-on{background:var(--at-primary);color:var(--at-on-primary);border-color:var(--at-primary)}
/* ---- hero ---- */
.at-hero{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:var(--at-sp-8);align-items:center;padding:var(--at-sp-12) var(--at-sp-8);border-radius:var(--at-r-xl);background:linear-gradient(135deg,var(--at-surface-2),var(--at-surface));border:1px solid var(--at-border);box-shadow:var(--at-elev-1)}
.at-eyebrow{margin:0 0 var(--at-sp-2);font:var(--at-fw-semibold) var(--at-fs-xs)/1.2 var(--at-font-body);letter-spacing:var(--at-tracking-caps);text-transform:uppercase;color:var(--at-primary)}
.at-hero__title{margin:0;font:var(--at-fw-bold) var(--at-fs-4xl)/var(--at-lh-tight) var(--at-font-display);letter-spacing:.01em}
.at-hero__lead{margin:var(--at-sp-4) 0 0;max-width:var(--at-measure);font-size:var(--at-fs-lg);color:var(--at-on-surface-muted)}
.at-hero__actions{display:flex;flex-wrap:wrap;gap:var(--at-sp-3);margin-top:var(--at-sp-6)}
.at-hero__art .at-illo{border-radius:var(--at-r-lg)}
@media (max-width:720px){.at-hero{grid-template-columns:1fr;padding:var(--at-sp-8) var(--at-sp-5);gap:var(--at-sp-5)}.at-hero__art{order:-1;max-width:320px}}
/* ---- section header ---- */
.at-section-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--at-sp-3) var(--at-sp-6);margin:0 0 var(--at-sp-5);padding-bottom:var(--at-sp-3);border-bottom:1px solid var(--at-border)}
.at-section-head h2,.at-section-head__title{margin:0;font:var(--at-fw-bold) var(--at-fs-2xl)/var(--at-lh-tight) var(--at-font-display)}
.at-section-head p{margin:var(--at-sp-1) 0 0;color:var(--at-on-surface-muted);max-width:var(--at-measure)}
/* ---- cards ---- */
.at-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--at-sp-5);align-items:stretch}
.at-card{position:relative;display:flex;flex-direction:column;min-width:0;height:100%;border-radius:var(--at-r-lg);background:var(--at-surface);border:1px solid var(--at-border);box-shadow:var(--at-elev-1);overflow:hidden;color:inherit;text-decoration:none;transition:border-color var(--at-dur) var(--at-ease-out),transform var(--at-dur) var(--at-ease-out)}
a.at-card:hover,.at-card:focus-within{border-color:var(--at-border-strong)}
a.at-card:hover{transform:translateY(-2px)}
.at-card__media{aspect-ratio:16/9;background:var(--at-illo-sky);overflow:hidden}
.at-card__media img{display:block;width:100%;height:100%;object-fit:cover}
.at-card__art{padding:var(--at-sp-3) var(--at-sp-3) 0}
.at-card__art .at-illo{border-radius:var(--at-r-md)}
.at-card__body{display:flex;flex-direction:column;gap:var(--at-sp-2);flex:1;padding:var(--at-sp-4) var(--at-sp-4) var(--at-sp-5)}
.at-card__body>.at-badge{align-self:flex-start}
.at-card__title{margin:0;font:var(--at-fw-bold) var(--at-fs-xl)/var(--at-lh-tight) var(--at-font-display)}
.at-card__meta{margin:0;font-size:var(--at-fs-sm);color:var(--at-on-surface-muted)}
.at-card__foot{margin-top:auto;padding-top:var(--at-sp-3);display:flex;flex-wrap:wrap;gap:var(--at-sp-2);align-items:center}
/* ---- stat tile ---- */
.at-stat{display:flex;flex-direction:column;gap:var(--at-sp-1);padding:var(--at-sp-4) var(--at-sp-5);border-radius:var(--at-r-md);background:var(--at-surface-2);border:1px solid var(--at-border)}
.at-stat__value{font:var(--at-fw-bold) var(--at-fs-3xl)/1 var(--at-font-display);color:var(--at-on-surface);font-variant-numeric:tabular-nums}
.at-stat__label{font-size:var(--at-fs-sm);color:var(--at-on-surface-muted)}
/* ---- lock state (skill-gated) ---- */
.at-locked{position:relative}
.at-locked>:not(.at-lock){opacity:.5;filter:saturate(.4)}
.at-lock{position:absolute;inset:auto var(--at-sp-3) var(--at-sp-3) auto;display:inline-flex;align-items:center;gap:var(--at-sp-2);padding:var(--at-sp-1) var(--at-sp-3);border-radius:var(--at-r-pill);background:var(--at-surface);border:1px solid var(--at-warning);color:var(--at-warning);font:var(--at-fw-semibold) var(--at-fs-xs)/1.4 var(--at-font-body)}
/* ---- toast ---- */
.at-toast{display:flex;align-items:flex-start;gap:var(--at-sp-3);max-width:420px;padding:var(--at-sp-3) var(--at-sp-4);border-radius:var(--at-r-md);background:var(--at-surface);color:var(--at-on-surface);border:1px solid var(--at-border-strong);border-left:4px solid var(--at-primary);box-shadow:var(--at-elev-2)}
.at-toast--success{border-left-color:var(--at-success)}.at-toast--warning{border-left-color:var(--at-warning)}.at-toast--danger{border-left-color:var(--at-danger)}
.at-toast__title{margin:0;font-weight:var(--at-fw-semibold)}.at-toast p{margin:0}
/* ---- dialog ---- */
.at-scrim{position:fixed;inset:0;background:var(--at-scrim);display:grid;place-items:center;padding:var(--at-sp-4)}
.at-dialog{width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:var(--at-sp-6);border-radius:var(--at-r-xl);background:var(--at-surface);color:var(--at-on-surface);border:1px solid var(--at-border-strong);box-shadow:var(--at-elev-3)}
.at-dialog__title{margin:0 0 var(--at-sp-2);font:var(--at-fw-bold) var(--at-fs-xl)/var(--at-lh-tight) var(--at-font-display)}
.at-dialog__actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:var(--at-sp-2);margin-top:var(--at-sp-6)}
/* ---- tabs ---- */
.at-tabs{display:flex;gap:var(--at-sp-1);border-bottom:1px solid var(--at-border);overflow-x:auto}
.at-tab{min-height:44px;padding:0 var(--at-sp-4);border:0;border-bottom:3px solid transparent;background:none;color:var(--at-on-surface-muted);font:var(--at-fw-semibold) var(--at-fs-md)/1 var(--at-font-display);letter-spacing:.03em;cursor:pointer;white-space:nowrap}
.at-tab[aria-selected="true"]{color:var(--at-on-surface);border-bottom-color:var(--at-primary)}
/* ---- breadcrumb (styling only; the structure is the page's own) ---- */
.at-breadcrumb ol,ol.at-breadcrumb{display:flex;flex-wrap:wrap;align-items:center;gap:var(--at-sp-1);margin:0;padding:0;list-style:none;font-size:var(--at-fs-sm);color:var(--at-on-surface-muted)}
.at-breadcrumb li+li::before{content:"";display:inline-block;width:14px;height:14px;margin-right:var(--at-sp-1);vertical-align:-2px;background:currentColor;-webkit-mask:var(--at-icon-chevron-right) center/contain no-repeat;mask:var(--at-icon-chevron-right) center/contain no-repeat}
.at-breadcrumb a{color:var(--at-primary);text-decoration:none}.at-breadcrumb a:hover{text-decoration:underline}
.at-breadcrumb [aria-current]{color:var(--at-on-surface)}
/* ---- footer ---- */
.at-footer{padding:var(--at-sp-8) var(--at-sp-6);border-top:1px solid var(--at-border);background:var(--at-surface-2);color:var(--at-on-surface-muted);font-size:var(--at-fs-sm)}
.at-footer a{color:var(--at-on-surface)}
.at-footer__cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:var(--at-sp-6)}
/* ---- empty state ---- */
.at-empty{display:flex;flex-direction:column;align-items:center;gap:var(--at-sp-3);max-width:420px;margin:var(--at-sp-6) auto;padding:var(--at-sp-6);text-align:center;border:1px dashed var(--at-border-strong);border-radius:var(--at-r-lg);color:var(--at-on-surface-muted)}
.at-empty .at-illo{max-width:200px}
.at-empty__title{margin:0;color:var(--at-on-surface);font:var(--at-fw-bold) var(--at-fs-lg)/var(--at-lh-snug) var(--at-font-display)}
.at-empty p{margin:0}
@media (prefers-reduced-motion:reduce){.at-btn,.at-card{transition:none}a.at-card:hover{transform:none}}
`;

/**
 * Adoption: the chrome every page already carries, drawn with the tokens.
 * Paint only (icons, colours, borders, radii) — no box changes size, so every
 * layout the UI and mobile checkers measure stays put.
 */
const AT_ADOPT = `
.at-empty[hidden],.at-lock[hidden]{display:none}
[data-at-icon]::before{content:"";display:inline-block;flex:none;width:1.1em;height:1.1em;margin-right:.35em;vertical-align:-.2em;background:currentColor;-webkit-mask:var(--at-i) center/contain no-repeat;mask:var(--at-i) center/contain no-repeat}
\${AT_ICON_ATTRS}
.home-chip::before{content:"";display:inline-block;flex:none;width:15px;height:15px;margin-right:2px;vertical-align:-2px;background:currentColor;-webkit-mask:var(--at-icon-house) center/contain no-repeat;mask:var(--at-icon-house) center/contain no-repeat}
.prog .at-card__art,.hm-illo{display:block;margin:-2px -4px 10px}
.prog .at-card__art{padding:0}
.prog .at-card__art .at-illo{aspect-ratio:16/8;border-radius:var(--at-r-md)}
`;

export function atDesignCss() {
  const icons = atIcons();
  const iconVars = Object.entries(icons).map(([k, v]) => `--at-icon-${k}:${v}`).join(";\n  ");
  const iconClasses = Object.keys(icons).map((k) => `.at-i--${k}{--at-i:var(--at-icon-${k})}`).join("\n");
  return `/* Generated by tools/gen_design.mjs from WebXR/shared/theme.js, WebXR/shared/illustrations.js,
   WebXR/vendor/icons/ and WebXR/vendor/fonts/ — edit those, not this file.
   The design system: docs/design-system/README.md. Credits and licences: docs/credits.md. */
${fontFaces()}
:root{${vars(AT_ROLES.dark)};${vars(AT_TYPE)};${vars(AT_SPACE)};${vars(AT_SHAPE)}}
:root[data-theme="light"],.at-scheme--light{${vars(AT_ROLES.light)};color-scheme:light}
.at-scheme--dark{${vars(AT_ROLES.dark)};color-scheme:dark}
:root{
  ${iconVars}}
${iconClasses}
${AT_COMPONENTS}
${AT_ILLO_CSS}
${AT_ADOPT.replace("${AT_ICON_ATTRS}", Object.keys(icons).map((k) => `[data-at-icon="${k}"]{--at-i:var(--at-icon-${k})}`).join("\n"))}`;
}

// ---------------------------------------------------------------- gallery
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function specimens() {
  const ic = (n) => `<span class="at-i at-i--${n}" aria-hidden="true"></span>`;
  return [
    ["Hero", `<section class="at-hero"><div><p class="at-eyebrow">Training track</p><p class="at-hero__title">Electrical, first period</p><p class="at-hero__lead">Scored procedures from the trade, one station at a time.</p><div class="at-hero__actions"><a class="at-btn at-btn--primary" href="#">${ic("play")}Start</a><a class="at-btn at-btn--secondary" href="#">${ic("map")}Open the Atlas</a></div></div><div class="at-hero__art">${atIllustration("electrical")}</div></section>`],
    ["Section header", `<div class="at-section-head"><div><p class="at-eyebrow">Worlds</p><p class="at-section-head__title">Walk in, find a job board</p><p>Every world opens scored procedures.</p></div><a class="at-btn at-btn--ghost" href="#">See all${ic("arrow-right")}</a></div>`],
    ["World card", `<div class="at-grid"><a class="at-card" href="#"><span class="at-card__media">${atIllustration("maritime")}</span><span class="at-card__body"><span class="at-badge at-badge--primary">World</span><span class="at-card__title">Harbour world</span><span class="at-card__meta">A card with a media slot: an in-game capture, or an illustration until one exists.</span><span class="at-card__foot"><span class="at-btn at-btn--secondary">Enter${ic("chevron-right")}</span></span></span></a></div>`],
    ["Programme card", `<div class="at-grid"><article class="at-card"><div class="at-card__art">${atIllustration("construction")}</div><div class="at-card__body"><h3 class="at-card__title">Builders' trades</h3><p class="at-card__meta">12 stations · Construction</p><div class="at-card__foot"><a class="at-btn at-btn--primary" href="#">Start</a><span class="at-badge">Level 1</span></div></div></article><article class="at-card at-locked"><div class="at-card__art">${atIllustration("dive")}</div><div class="at-card__body"><h3 class="at-card__title">Dive side quest</h3><p class="at-card__meta">Opens after the level-1 stations</p></div><span class="at-lock">${ic("lock")}Pass level 1 first</span></article></div>`],
    ["Stat tile", `<div class="at-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))"><div class="at-stat"><span class="at-stat__value">12</span><span class="at-stat__label">Stations</span></div><div class="at-stat"><span class="at-stat__value">3</span><span class="at-stat__label">Levels</span></div></div>`],
    ["Badge and chip", `<p style="display:flex;flex-wrap:wrap;gap:8px"><span class="at-badge">Neutral</span><span class="at-badge at-badge--primary">Primary</span><span class="at-badge at-badge--success">${ic("check")}Passed</span><span class="at-badge at-badge--warning">${ic("triangle-alert")}Retry</span><span class="at-badge at-badge--danger">Hazard</span></p><p style="display:flex;flex-wrap:wrap;gap:8px"><button class="at-chip" type="button" aria-pressed="true">Construction</button><button class="at-chip" type="button" aria-pressed="false">Maritime</button></p>`],
    ["Buttons", `<p style="display:flex;flex-wrap:wrap;gap:12px"><button class="at-btn at-btn--primary" type="button">${ic("play")}Primary</button><button class="at-btn at-btn--secondary" type="button">Secondary</button><button class="at-btn at-btn--ghost" type="button">Ghost</button><button class="at-btn" type="button" disabled>Disabled</button></p>`],
    ["Lock state", `<p style="position:relative;min-height:48px"><span class="at-lock" style="position:static">${ic("lock")}Pass the level-1 stations to open</span></p>`],
    ["Toast", `<div class="at-toast at-toast--success" role="status">${ic("circle-check")}<div><p class="at-toast__title">Station passed</p><p>Your record was saved on this device.</p></div></div>`],
    ["Dialog", `<div class="at-dialog" role="dialog" aria-label="Sign in"><p class="at-dialog__title">Sign in</p><p>Choose how to keep your records.</p><div class="at-dialog__actions"><button class="at-btn at-btn--ghost" type="button">Cancel</button><button class="at-btn at-btn--primary" type="button">Continue</button></div></div>`],
    ["Tabs", `<div class="at-tabs" role="tablist"><button class="at-tab" role="tab" aria-selected="true" type="button">Class</button><button class="at-tab" role="tab" aria-selected="false" type="button">Catalog</button><button class="at-tab" role="tab" aria-selected="false" type="button">Sign-offs</button></div>`],
    ["Breadcrumb", `<nav class="at-breadcrumb" aria-label="Example"><ol><li><a href="#">Home</a></li><li><a href="#">Programmes</a></li><li><span aria-current="page">Fall protection</span></li></ol></nav>`],
    ["Footer", `<div class="at-footer"><div class="at-footer__cols"><div><strong>Worlds</strong><br><a href="#">SmartCiti.X</a></div><div><strong>Docs</strong><br><a href="#">Credits</a></div></div></div>`],
    ["Empty state", `<div class="at-empty">${atIllustration("safety")}<p class="at-empty__title">No programmes match</p><p>Clear a filter to see more.</p><button class="at-btn at-btn--secondary" type="button">Clear filters</button></div>`],
  ];
}

export function atGalleryHtml() {
  const icons = Object.keys(atIcons());
  const panes = (html) => `<div class="g-pair"><div class="at-scheme at-scheme--dark g-pane"><p class="g-scheme">Dark</p>${html}</div><div class="at-scheme at-scheme--light g-pane"><p class="g-scheme">Light</p>${html}</div></div>`;
  const swatches = (scheme) => Object.entries(AT_ROLES[scheme]).map(([k, v]) => `<li><span class="g-sw" style="background:${v}"></span><code>--at-${k}</code><span>${esc(v)}</span></li>`).join("");
  const pairs = ["dark", "light"].map((s) => `<tr><th scope="row">${s}</th><td>${AT_CONTRAST_PAIRS.map(([fg, bg, min]) => {
    const r = thContrast(AT_ROLES[s][fg], AT_ROLES[s][bg]);
    return `<span class="at-badge ${r >= min ? "at-badge--success" : "at-badge--danger"}">${fg} / ${bg} ${r.toFixed(1)}:1</span>`;
  }).join(" ")}</td></tr>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Design system — templates</title>
<meta name="generator" content="tools/gen_design.mjs">
<link rel="stylesheet" href="../shared/design.css">
<style>
body{margin:0;background:var(--at-bg);color:var(--at-on-surface);font-family:var(--at-font-body)}
.g-wrap{max-width:1280px;margin:0 auto;padding:24px 16px 64px}
.g-sec{margin:40px 0}
.g-pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.g-pane{padding:20px;border-radius:14px;border:1px solid var(--at-border);min-width:0}
.g-scheme{margin:0 0 12px;font:600 12px/1 var(--at-font-body);letter-spacing:.08em;text-transform:uppercase;color:var(--at-on-surface-dim)}
.g-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px;list-style:none;padding:0;margin:0;font-size:13px}
.g-list li{display:flex;align-items:center;gap:8px}
.g-sw{width:22px;height:22px;border-radius:6px;border:1px solid var(--at-border-strong);flex:none}
.g-icons{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;list-style:none;padding:0}
.g-icons li{display:flex;align-items:center;gap:8px;font-size:13px}.g-icons .at-i{width:24px;height:24px}
.g-illos{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;list-style:none;padding:0;margin:0}
.g-illos figure{margin:0}.g-illos figcaption{font-size:13px;margin-top:6px;color:var(--at-on-surface-muted)}
table{border-collapse:collapse}td,th{padding:6px;text-align:left;vertical-align:top}td .at-badge{margin:2px}
@media (max-width:820px){.g-pair{grid-template-columns:1fr}}
</style>
</head>
<body class="at-root">
<main class="g-wrap">
<header class="at-section-head"><div><p class="at-eyebrow">Design system</p><h1 class="at-section-head__title">Templates, tokens, icons and illustrations</h1><p>Every component of <code>WebXR/shared/design.css</code>, in dark and light. Generated by <code>tools/gen_design.mjs</code>; documented in <code>docs/design-system/README.md</code>.</p></div></header>
${specimens().map(([name, html]) => `<section class="g-sec" aria-label="${esc(name)}"><h2 class="at-card__title">${esc(name)}</h2>${panes(html)}</section>`).join("\n")}
<section class="g-sec"><h2 class="at-card__title">Spot illustrations</h2>${panes(`<ul class="g-illos">${Object.entries(AT_ILLO_KINDS).map(([k, label]) => `<li><figure>${atIllustration(k)}<figcaption>${esc(label)} <code>${k}</code></figcaption></figure></li>`).join("")}</ul>`)}</section>
<section class="g-sec"><h2 class="at-card__title">Icons</h2><p>Lucide (ISC), vendored in <code>WebXR/vendor/icons/</code>: <code>&lt;span class="at-i at-i--name"&gt;</code>.</p>${panes(`<ul class="g-icons">${icons.map((n) => `<li><span class="at-i at-i--${n}" aria-hidden="true"></span>${n}</li>`).join("")}</ul>`)}</section>
<section class="g-sec"><h2 class="at-card__title">Colour roles</h2><div class="g-pair"><div class="at-scheme at-scheme--dark g-pane"><p class="g-scheme">Dark</p><ul class="g-list">${swatches("dark")}</ul></div><div class="at-scheme at-scheme--light g-pane"><p class="g-scheme">Light</p><ul class="g-list">${swatches("light")}</ul></div></div></section>
<section class="g-sec"><h2 class="at-card__title">Contrast pairs (WCAG AA)</h2><table>${pairs}</table></section>
<section class="g-sec"><h2 class="at-card__title">Type scale</h2>${["fs-4xl", "fs-3xl", "fs-2xl", "fs-xl", "fs-lg", "fs-md", "fs-sm", "fs-xs"].map((k) => `<p style="margin:6px 0;font-family:var(--at-font-display);font-size:var(--at-${k})">${k} — Barlow Condensed</p>`).join("")}</section>
</main>
</body>
</html>
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  writeFileSync(join(WEBXR, "shared/design.css"), atDesignCss());
  mkdirSync(join(WEBXR, "design"), { recursive: true });
  writeFileSync(join(WEBXR, "design/index.html"), atGalleryHtml());
  console.log(`gen_design: wrote WebXR/shared/design.css (${(atDesignCss().length / 1024).toFixed(0)} KB) and WebXR/design/index.html`);
}
