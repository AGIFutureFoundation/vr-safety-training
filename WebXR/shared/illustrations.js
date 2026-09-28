// Spot illustrations, one per programme category (console ATELIER,
// docs/design-system/README.md).
//
// Procedural inline SVG drawn from simple shapes in the design-system palette:
// every fill and stroke is a class (`.at-il-sky`, `.at-il-line`, …) that
// WebXR/shared/design.css paints from the `--at-illo-*` colour roles, so one
// drawing follows light and dark. No brands, no logos, no people — tools,
// structures, vehicles and symbols only.
//
// Used at build time by tools/gen_home.mjs (programme cards), tools/gen_tracks.mjs
// (the track page hero and empty states) and tools/gen_design.mjs (the gallery),
// and at run time wherever a page imports it. Pure; every top-level name is
// prefixed `at`/`AT_` because the bundler concatenates all modules into one scope.

/** The categories, with the label the gallery prints. */
export const AT_ILLO_KINDS = Object.freeze({
  electrical: "Electrical and power",
  construction: "Construction and structural",
  maritime: "Maritime and ports",
  dive: "Diving and underwater",
  health: "Health and care",
  culinary: "Culinary and hospitality",
  logistics: "Logistics and transport",
  environmental: "Environmental",
  aerospace: "Aviation and aerospace",
  robotics: "Robotics and automation",
  sports: "Sports and emotional intelligence",
  k12: "K-12 classroom",
  events: "Live events and media",
  garment: "Sewing and garment",
  pathway: "Career pathways",
  safety: "General safety",
});

// Programme id keywords → category, first match wins.
const AT_ILLO_RULES = [
  [/k12/, "k12"],
  [/robot|automation/, "robotics"],
  [/aviation|airline|aerospace/, "aerospace"],
  [/diving|scuba|underwater|marine-ecology/, "dive"],
  [/electrical|energy|wind|stationary|elevator|utility/, "electrical"],
  [/health|dental|outbreak|responder/, "health"],
  [/culinary|bartend|hotel|grocery|kitchen/, "culinary"],
  [/port|yacht|maritime|regatta/, "maritime"],
  [/warehouse|postal|railroad|transit|logistic/, "logistics"],
  [/hazmat|hunters-point|air-quality|grounds|restoration|environment/, "environmental"],
  [/basketball|sport|civic|ei$|situational/, "sports"],
  [/live-events|screen|media/, "events"],
  [/sewing|garment/, "garment"],
  [/job-readiness|pathway|union-edition|education|property/, "pathway"],
  [/fall|rigging|bridge|builder|roof|cement|glazier|insulator|plumber|heavy|confined|mill|mine|construct/, "construction"],
];

/** The illustration category for a programme id (or a category name). */
export function atIlloKind(id) {
  const s = String(id ?? "").toLowerCase();
  if (AT_ILLO_KINDS[s]) return s;
  for (const [re, kind] of AT_ILLO_RULES) if (re.test(s)) return kind;
  return "safety";
}

// Each motif is drawn on a 160 x 100 canvas above a shared sky and ground.
const AT_ILLO_MOTIFS = {
  electrical: `<path class="at-il-line" d="M34 88V22M24 30h20M26 40h16"/><path class="at-il-thin" d="M44 30c20 6 36 6 56 0M44 40c20 8 38 8 58 2"/><path class="at-il-warm" d="M112 14l-16 30h12l-8 26 22-34h-13l9-22z"/>`,
  construction: `<path class="at-il-line" d="M40 90V18M40 18h82M40 30l12-12M52 30V18M40 42l12-12M40 54l12-12M40 66l12-12M40 78l12-12"/><path class="at-il-thin" d="M108 18v26"/><rect class="at-il-warm" x="96" y="44" width="24" height="10" rx="2"/><rect class="at-il-fill" x="24" y="10" width="26" height="8" rx="2"/>`,
  maritime: `<path class="at-il-fill" d="M22 64h116l-14 18H36z"/><rect class="at-il-warm" x="44" y="46" width="22" height="18" rx="1"/><rect class="at-il-accent" x="68" y="46" width="22" height="18" rx="1"/><rect class="at-il-warm" x="56" y="30" width="22" height="16" rx="1"/><path class="at-il-line" d="M110 64V36h14v28"/><path class="at-il-thin" d="M10 90q10-6 20 0t20 0 20 0 20 0 20 0 20 0 20 0"/>`,
  dive: `<circle class="at-il-fill" cx="70" cy="54" r="24"/><circle class="at-il-sky-dot" cx="70" cy="54" r="11"/><path class="at-il-line" d="M46 78h48M70 30v-6"/><circle class="at-il-thin" cx="112" cy="36" r="5"/><circle class="at-il-thin" cx="120" cy="22" r="3.5"/><circle class="at-il-thin" cx="108" cy="14" r="2.5"/><path class="at-il-thin" d="M10 30q10-5 20 0t20 0"/>`,
  health: `<path class="at-il-fill" d="M60 14l30 10v22c0 20-14 32-30 40-16-8-30-20-30-40V24z"/><path class="at-il-plus" d="M60 32v28M46 46h28"/><path class="at-il-warm-line" d="M96 62h12l6-14 8 26 6-12h14"/>`,
  culinary: `<path class="at-il-fill" d="M38 50h60v26a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8z"/><path class="at-il-line" d="M30 50h76M60 44h16"/><path class="at-il-thin" d="M54 38c-4-6 4-10 0-16M68 38c-4-6 4-10 0-16M82 38c-4-6 4-10 0-16"/><path class="at-il-warm" d="M116 30l6 0 0 40-6 4z"/><path class="at-il-line" d="M119 74v12"/>`,
  logistics: `<rect class="at-il-warm" x="30" y="56" width="30" height="26" rx="2"/><rect class="at-il-fill" x="62" y="56" width="30" height="26" rx="2"/><rect class="at-il-accent" x="46" y="30" width="30" height="26" rx="2"/><path class="at-il-line" d="M26 86h70M104 50h28M124 42l8 8-8 8"/>`,
  environmental: `<path class="at-il-fill" d="M50 80c-18-18-8-50 34-56 4 36-12 58-34 56z"/><path class="at-il-line" d="M50 80c10-18 20-30 32-40"/><path class="at-il-accent" d="M116 40c10 14 14 22 14 30a14 14 0 0 1-28 0c0-8 4-16 14-30z"/>`,
  aerospace: `<path class="at-il-fill" d="M20 60l60-8 24-22h10l-12 24 34-4 8-10h6l-4 16 4 16h-6l-8-10-34-4 12 24h-10l-24-22-60-8z" transform="translate(0 -6)"/><path class="at-il-thin" d="M10 72h50M18 80h34"/>`,
  robotics: `<rect class="at-il-fill" x="30" y="76" width="40" height="10" rx="2"/><path class="at-il-arm" d="M50 76V52l30-18 26 14"/><circle class="at-il-warm" cx="50" cy="52" r="6"/><circle class="at-il-warm" cx="80" cy="34" r="6"/><path class="at-il-line" d="M106 48l10-6M106 48l8 10"/>`,
  sports: `<circle class="at-il-warm" cx="58" cy="58" r="24"/><path class="at-il-seam" d="M34 58h48M58 34v48M41 41c10 10 10 24 0 34M75 41c-10 10-10 24 0 34"/><path class="at-il-line" d="M112 88V24M112 28h22M116 40h18"/><path class="at-il-thin" d="M118 40l4 14h8l4-14"/>`,
  k12: `<path class="at-il-fill" d="M22 34c14-6 30-6 44 2v48c-14-8-30-8-44-2z"/><path class="at-il-accent" d="M66 36c14-8 30-8 44-2v48c-14-6-30-6-44 2z"/><path class="at-il-line" d="M66 36v48"/><path class="at-il-warm" d="M122 20l10 4-22 54-8 6 0-10z"/>`,
  events: `<path class="at-il-beam" d="M40 16l-20 70h60z"/><rect class="at-il-fill" x="30" y="10" width="20" height="12" rx="2"/><rect class="at-il-accent" x="92" y="48" width="44" height="34" rx="3"/><path class="at-il-warm" d="M92 40l44-8v10l-44 8z"/>`,
  garment: `<rect class="at-il-fill" x="34" y="38" width="30" height="36" rx="3"/><rect class="at-il-warm" x="30" y="32" width="38" height="8" rx="2"/><rect class="at-il-warm" x="30" y="72" width="38" height="8" rx="2"/><path class="at-il-line" d="M130 14L96 82"/><circle class="at-il-thin" cx="127" cy="20" r="3"/><path class="at-il-thin" d="M127 20c-30 10-50 40-64 24"/>`,
  pathway: `<path class="at-il-fill" d="M22 86h28V70h28V54h28V38h28v48z"/><path class="at-il-line" d="M126 38V12"/><path class="at-il-warm" d="M126 12h22l-6 7 6 7h-22z"/>`,
  safety: `<path class="at-il-warm" d="M40 70c0-24 16-40 40-40s40 16 40 40z"/><rect class="at-il-fill" x="30" y="68" width="100" height="10" rx="4"/><path class="at-il-line" d="M80 30v16M68 34l4 14M92 34l-4 14"/>`,
};

/**
 * One spot illustration as an SVG string. `opts.title` gives it an accessible
 * name; without one it is decorative (aria-hidden).
 */
export function atIllustration(kindOrId, opts = {}) {
  const kind = atIlloKind(kindOrId);
  const title = opts.title ? String(opts.title).replace(/[<>&"]/g, "") : "";
  const a11y = title ? `role="img" aria-label="${title}"` : `aria-hidden="true" focusable="false"`;
  const cls = `at-illo at-illo--${kind}${opts.className ? " " + opts.className : ""}`;
  return `<svg class="${cls}" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" ${a11y}>` +
    `<rect class="at-il-sky" width="160" height="100" rx="10"/><path class="at-il-ground" d="M0 88h160v2a10 10 0 0 1-10 10H10A10 10 0 0 1 0 90z"/>` +
    AT_ILLO_MOTIFS[kind] + `</svg>`;
}

/** The CSS the illustrations need (also written into design.css). */
export const AT_ILLO_CSS = `
.at-illo{display:block;width:100%;height:auto}
.at-illo .at-il-sky{fill:var(--at-illo-sky)}
.at-illo .at-il-sky-dot{fill:var(--at-illo-sky);stroke:var(--at-illo-line);stroke-width:3}
.at-illo .at-il-ground{fill:var(--at-illo-ground)}
.at-illo .at-il-fill{fill:var(--at-illo-fill)}
.at-illo .at-il-warm{fill:var(--at-illo-warm)}
.at-illo .at-il-accent{fill:var(--at-illo-accent)}
.at-illo .at-il-beam{fill:var(--at-illo-warm);opacity:.35}
.at-illo .at-il-line,.at-illo .at-il-arm{fill:none;stroke:var(--at-illo-line);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.at-illo .at-il-arm{stroke-width:7}
.at-illo .at-il-thin{fill:none;stroke:var(--at-illo-line);stroke-width:2;stroke-linecap:round;opacity:.8}
.at-illo .at-il-plus{fill:none;stroke:var(--at-illo-sky);stroke-width:7;stroke-linecap:round}
.at-illo .at-il-seam{fill:none;stroke:var(--at-illo-sky);stroke-width:2.5}
.at-illo .at-il-warm-line{fill:none;stroke:var(--at-illo-warm);stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round}
`;
