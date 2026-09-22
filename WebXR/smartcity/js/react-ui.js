/**
 * The 2D UI chrome — HUD, intro, results, leaderboard, scenario editor — as
 * React components. This file owns none of the Three.js scene, the Session,
 * or the render loop; it only reads `store` and calls back into `actions`,
 * both handed to it by app.js. The CSS in index.html targets these same
 * element ids/classes as before, so no style changes were needed to move
 * the markup here.
 */

import { SIMS_META } from "./sims-meta.js";
import { prettyKey } from "../../shared/input.js";

const h = React.createElement;
const { Fragment, useSyncExternalStore } = React;

// Static marketing copy for the intro card — this never changes at runtime,
// so it is kept as one HTML block rather than hand-built as elements. The
// per-sim roster used to be a THIRD hand-written copy of this same list
// (name/tagline/tint), duplicating sims-meta.js (itself generated from the
// real sim modules — see tools/gen_sims_meta.mjs) with nothing enforcing
// they stayed in sync. SimsGrid below replaces that copy with a real
// render from SIMS_META, so it can't drift again.
const INTRO_HEAD_HTML = `
  <div class="brandline">SmartCiti.X ~VR Simulators (Powered by AGI Corp &amp; Visko)</div>
  <div class="eyebrow">${new Set(SIMS_META.map((s) => s.category)).size} categories · ${SIMS_META.length} stations · One apprentice record</div>
  <h1>AR / VR Training Simulators</h1>
  <p class="lead">Deep-skill simulators across ${new Set(SIMS_META.map((s) => s.category)).size} trade-union categories. Each station is its own
  gamified system — its own rank ladder, currency and badges — and names the real union and
  certification a worker in that role actually needs. Every procedure is real and every hazard is
  real: the training scores what you touch and in what order.</p>
`;
const INTRO_TAIL_HTML = `
  <p><b>AR:</b> place a tabletop diorama of any station on a real surface, then tap components.<br>
  <b>VR:</b> full-scale digital-twin plaza. <b>Desktop:</b> drag to look, click to act, <kbd>WASD</kbd> to move.</p>
`;

// Canonical display order for the 10 categories — not alphabetical, so the
// roster reads as an intentional taxonomy (infrastructure trades first,
// specialty trades after) rather than a shuffled list.
const CATEGORY_ORDER = [
  "Energy & Power", "Mobility & Transit", "Water & Environmental",
  "Connectivity & Telecom", "Building Systems & Facilities",
  "Construction & Structural Trades", "Manufacturing & Automation",
  "Emergency Services", "Maritime & Ports", "Entertainment & Live Events",
  "Environmental Monitoring", "Surface Prep & Coatings", "Culinary & Hospitality",
  "Dental & Oral Health", "Community Environmental Justice", "Sewing & Garment Trades",
];
const INTRO_FOOT_HTML = `
  <p class="fineprint" style="margin-top:6px">New here? <b style="color:var(--text)">Start guided tour</b> plays all
  ${SIMS_META.length} stations in order and brings you back to the campus between each one.</p>
  <p class="fineprint">Progress, ranks and badges are stored per simulator in this browser only —
  nothing is transmitted. AR needs a WebXR + hit-test capable browser (most current Android
  Chrome-based browsers on ARCore devices, and Meta Quest Browser in passthrough). Ray-Ban Meta
  display glasses cannot run immersive WebXR, so on those this page is a flat phone view.</p>
  <p class="fineprint">Your level, XP and badges carry over to <a href="../trades/index.html">Trade Skills Simulator</a>,
  nine more union-trade rooms (electrician, welder, plumber, laborer, painter and more) built on the same engine —
  one shared apprentice record across both. See <a href="../portal/index.html">the network map</a> for
  all four apps in this repository, including <a href="../holodeck/index.html">Holodeck</a>'s
  prompt-driven procedure generator.</p>
  <p class="fineprint" style="opacity:.65;margin-top:8px">SmartCiti.X ~VR Simulators — powered by AGI Corp &amp; Visko.</p>
`;

function stripHtml(html) {
  return String(html ?? "").replace(/<[^>]*>/g, "");
}

// The intro card's buttons, as data rather than ten hand-written elements:
// the same list numbers them for "select item N" (app.js's voiceMenu()) and
// renders them, so the badge a learner reads and the number voice resolves
// are the same number by construction. `action` is a key in the actions
// object app.js hands mountUI.
const INTRO_BUTTONS = [
  { id: "start-tour", label: "Start guided tour", action: "startTour", primary: true },
  { id: "enter-ar", label: "Enter AR", action: "enterAr", textFrom: "arText", disabledFrom: "arDisabled" },
  { id: "enter-vr", label: "Enter VR", action: "enterVr", textFrom: "vrText", disabledFrom: "vrDisabled" },
  { id: "enter-flat", label: "Free explore", action: "enterFlat" },
  { id: "view-leaderboard", label: "Leaderboards", action: "viewLeaderboard" },
  { id: "view-records", label: "Training records", action: "viewRecords" },
  { id: "view-programs", label: "Training programmes", action: "viewPrograms" },
  { id: "open-editor", label: "Create a scenario", action: "openEditor" },
  { id: "open-controls", label: "Controls", action: "openControls" },
  { id: "reset-progress", label: "Reset progress", action: "resetProgress", textFromSlice: "resetProgressText" },
];

/** The station cards in the order the grid draws them: grouped by category in
 *  CATEGORY_ORDER, then by each sim's own catalog index. */
function orderedSims() {
  const byCategory = new Map();
  for (const sim of SIMS_META) {
    const cat = sim.category ?? "Uncategorized";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(sim);
  }
  const categories = [...byCategory.keys()].sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
  return categories.map((cat) => [cat, byCategory.get(cat).sort((a, b) => a.index.localeCompare(b.index))]);
}

/**
 * The numbered menu, in badge order: the panel's buttons, then every station
 * card. app.js maps each entry onto the handler a click would run, and the
 * voice command "select item N" takes the Nth.
 */
export function introMenu() {
  const rows = INTRO_BUTTONS.map((b) => ({ kind: "button", id: b.id, label: b.label, action: b.action }));
  for (const [, sims] of orderedSims()) {
    for (const sim of sims) rows.push({ kind: "sim", id: sim.id, label: sim.name });
  }
  return rows;
}
const SIM_BADGE_BASE = INTRO_BUTTONS.length;

export function mountUI(store, actions) {
  function useSlice(key) {
    return useSyncExternalStore(store.subscribe, () => store.get()[key]);
  }

  function HudMission() {
    const hud = useSlice("hud");
    return h("div", { className: "chip", id: "hud-mission" },
      h("div", { className: "eyebrow" }, "District"),
      h("div", { id: "hud-room" }, hud.room));
  }

  function HudMetrics() {
    const hud = useSlice("hud");
    return h("div", { className: "chip", id: "hud-metrics" },
      h("div", { className: "eyebrow" }, "Score"),
      h("div", { id: "hud-score" }, hud.score),
      h("div", { id: "hud-combo", className: [hud.comboHot && "hot", hud.comboFire && "fire"].filter(Boolean).join(" ") }, hud.comboText),
      hud.scorePops.map((p) => h("div", { key: p.id, className: p.big ? "score-pop big" : "score-pop" }, p.text)));
  }

  function HudObjective() {
    const hud = useSlice("hud");
    return h("div", { id: "hud-objective" },
      h("div", { id: "hud-step" }, hud.step),
      h("div", { id: "hud-cue" }, hud.cue),
      h("div", { id: "hud-gesture", hidden: !hud.gestureVisible }, hud.gestureVerb));
  }

  function HudRail() {
    const hud = useSlice("hud");
    return h("div", { id: "hud-rail", "data-state": hud.railState },
      h("div", { id: "hud-feedback", "aria-live": "polite", dangerouslySetInnerHTML: { __html: hud.feedbackHtml } }),
      h("div", { id: "hud-progress" },
        h("div", { id: "hud-track" }, h("div", { id: "hud-fill", style: { width: `${hud.fillPct}%` } })),
        h("div", { id: "hud-count" }, hud.count),
        h("div", { id: "hud-timer" }, hud.timer)));
  }

  /** The corner crib line. It reads the live bindings rather than three
   * hard-coded letters, so a learner on the numpad or one-hand preset is not
   * told to press a key that no longer does anything. */
  function HudHint() {
    const rows = useSlice("controls").rows;
    const keyFor = (action, fallback) => rows.find((r) => r.action === action)?.pretty?.[0] ?? fallback;
    return h("div", { id: "hud-hint" },
      `Drag to look · Click to act · ${keyFor("controls", prettyKey("Slash"))} controls · `
      + `${keyFor("mute", "M")} mute · ${keyFor("back", "Esc")} campus`);
  }

  function GestureTip() {
    const tip = useSlice("gestureTip");
    return h("div", {
      id: "gesture-tip",
      className: tip.show ? "show" : "",
      dangerouslySetInnerHTML: { __html: tip.html },
    });
  }

  function ArPrompt() {
    const ar = useSlice("arPrompt");
    return h("div", { id: "ar-prompt", hidden: !ar.visible }, h("b", null, "Tap a surface"), h("br"), "to place this station");
  }

  function ScaleRow() {
    const scaleRow = useSlice("scaleRow");
    return h("div", { id: "scale-row", hidden: !scaleRow.visible },
      h("button", { id: "scale-down", onClick: actions.scaleDown }, "− Smaller"),
      h("button", { id: "scale-up", onClick: actions.scaleUp }, "+ Larger"));
  }

  /** Grouped by category, in CATEGORY_ORDER, sorted by each sim's own
   * catalog index within its category — a real render from SIMS_META
   * (see tools/gen_sims_meta.mjs) instead of a hand-copied HTML list, so
   * it can never silently drift from the actual sim roster. */
  function SimsGrid() {
    const numbers = useSlice("controls").numbers;
    let n = SIM_BADGE_BASE;
    return h(Fragment, null, orderedSims().map(([cat, sims]) => h(Fragment, { key: cat },
      h("div", { className: "sim-category" }, cat),
      h("div", { className: "sims" },
        sims.map((sim) => {
          n += 1;
          return h("div", { className: "sim", style: { "--tint": sim.accentCss }, key: sim.id },
            numbers && h("span", { className: "idx-badge", "aria-hidden": "true" }, n),
            h("b", null, sim.name, sim.flat && h("em", { className: "sim-flat" }, "flat briefing")),
            h("span", null, `${sim.trade} · ${sim.game.system}`),
            h("span", { className: "sim-cert" }, sim.certification));
        })))));
  }

  /** The panel's buttons, rendered from INTRO_BUTTONS so the badge numbers and
   * the voice menu's numbers are the same list. */
  function IntroButtons() {
    const intro = useSlice("intro");
    const resetText = useSlice("resetProgressText");
    const numbers = useSlice("controls").numbers;
    return h("div", { className: "btnrow" }, INTRO_BUTTONS.map((b, i) => h("button", {
      key: b.id, id: b.id, type: "button",
      className: b.primary ? "primary" : "",
      disabled: b.disabledFrom ? !!intro[b.disabledFrom] : false,
      onClick: actions[b.action],
    },
    numbers && h("span", { className: "idx-badge", "aria-hidden": "true" }, i + 1),
    b.textFromSlice ? resetText : (b.textFrom ? intro[b.textFrom] : b.label))));
  }

  function IntroCard() {
    const intro = useSlice("intro");
    return h("div", { className: "overlay", id: "intro", hidden: !intro.visible, role: "dialog", "aria-modal": "true", "aria-label": "SmartCiti.X training campus" },
      h("div", { className: "card" },
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_HEAD_HTML } }),
        h(SimsGrid),
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_TAIL_HTML } }),
        h("div", { className: "namerow" },
          h("label", { className: "eyebrow", htmlFor: "player-name" },
            intro.identityLocked ? "Crew tag (set by your training provider)" : "Crew tag (for the leaderboard)"),
          h("input", {
            id: "player-name", maxLength: 12, placeholder: "YOU", autoComplete: "off",
            value: intro.playerName, readOnly: intro.identityLocked,
            "aria-describedby": intro.identityLocked ? "identity-note" : undefined,
            onChange: (e) => actions.setPlayerNameDraft(e.target.value),
            onBlur: actions.commitPlayerName,
          }),
          intro.identityLocked && h("p", { id: "identity-note", className: "fineprint identity-note" }, intro.identityLabel)),
        h(IntroButtons),
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_FOOT_HTML } })));
  }

  /** A flat briefing station: dossier with sources, then the knowledge
   * check, each option a real interactable the Session scores. */
  function FlatStationCard() {
    const f = useSlice("flat");
    if (!f.visible) return null;
    const link = (src) => h("a", { href: src.url, target: "_blank", rel: "noopener noreferrer" }, src.label);
    return h("div", { className: "overlay flat-overlay", id: "flat-station", role: "region", "aria-label": f.name },
      h("div", { className: "card card-wide flat-card" },
        h("div", { className: "eyebrow" }, `${f.category} · briefing station · flat, not a walkable scene`),
        h("h1", null, f.name),
        h("p", { className: "lead" }, f.tagline),
        f.certification && h("p", { className: "fineprint flat-cert" }, f.certification),
        h("details", { className: "dossier", open: f.stepIndex === 0 },
          h("summary", null, "Site dossier — read this first"),
          f.dossier.map((d, i) => h("section", { key: i, className: "dossier-section" },
            h("h3", null, d.title),
            h("p", null, d.body),
            h("p", { className: "dossier-src" }, "Source: ", link(d.source), d.source2 && h(Fragment, null, " · ", link(d.source2)))))),
        h("div", { className: "flat-q" },
          h("div", { className: "eyebrow" }, `Knowledge check · ${Math.min(f.stepIndex + 1, f.stepCount)} of ${f.stepCount}`),
          h("h2", { id: "flat-question" }, f.question),
          h("p", { className: "flat-cue" }, f.cue),
          h("div", { className: "flat-options", role: "group", "aria-labelledby": "flat-question" },
            f.options.map((o) => h("button", {
              key: o.id, type: "button", className: "flat-opt" + (f.picked.includes(o.id) ? " picked" : ""),
              disabled: f.picked.includes(o.id), onClick: () => actions.flatSelect(o.id),
            }, o.label))),
          f.feedback && h("div", { className: `flat-feedback ${f.feedback.kind}`, "aria-live": "polite", dangerouslySetInnerHTML: { __html: f.feedback.html } })),
        h("div", { className: "btnrow" },
          h("button", { id: "flat-hub", type: "button", onClick: actions.backToHub }, "Back to campus"))));
  }

  /** Flipped-classroom pre-brief: the station's procedure as study material
   * before the first run, with the reason for every step. */
  function PreBriefCard() {
    const b = useSlice("prebrief");
    if (!b.visible) return null;
    return h("div", { className: "overlay", id: "prebrief", role: "dialog", "aria-modal": "true", "aria-label": `Pre-brief: ${b.name}` },
      h("div", { className: "card card-wide" },
        h("div", { className: "eyebrow" }, `${b.category || "Station"} · pre-brief · learn it first, then prove it`),
        h("h1", null, b.name),
        h("p", { className: "lead" }, b.tagline),
        b.certification && h("p", { className: "fineprint flat-cert" }, `${b.trade} · ${b.certification}`),
        h("p", { className: "fineprint" },
          `The procedure below is the real order of operations for this station, with the reason behind each step. ` +
          `Read it now and the run that follows starts prepared: the Prepared award and a 10% score bonus on that run. ` +
          `${b.hazardCount} seeded hazard${b.hazardCount === 1 ? "" : "s"} wait in the station — the brief does not name them.`),
        h("ol", { className: "prebrief-steps" },
          b.steps.map((s, i) => h("li", { key: s.id },
            h("b", null, s.title),
            h("span", null, s.why)))),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "prebrief-start", type: "button", onClick: actions.prebriefStart }, "I've read it — start the run"),
          h("button", { id: "prebrief-skip", type: "button", onClick: actions.prebriefSkip }, "Skip the brief"),
          h("button", { id: "prebrief-close", type: "button", onClick: actions.prebriefClose }, "Back to campus"))));
  }

  function ResultsCard() {
    const results = useSlice("results");
    if (!results.visible) return h("div", { className: "overlay", id: "results", hidden: true });
    return h("div", { className: "overlay", id: "results", role: "dialog", "aria-modal": "true", "aria-label": "Run results" },
      h("div", { className: "card" },
        h("div", { id: "results-body", dangerouslySetInnerHTML: { __html: results.html } }),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "res-next", hidden: !results.showNext, onClick: actions.nextTourStop }, "Next stop →"),
          h("button", { className: results.retryPrimary ? "primary" : "", id: "res-retry", onClick: actions.retryResult }, "Run it again"),
          h("button", { id: "res-hub", onClick: actions.backToHub }, "Back to campus"))));
  }

  function LeaderboardCard() {
    const lb = useSlice("leaderboard");
    if (!lb.visible) return h("div", { className: "overlay", id: "leaderboard", hidden: true });
    return h("div", { className: "overlay", id: "leaderboard", role: "dialog", "aria-modal": "true", "aria-label": "Leaderboards" },
      h("div", { className: "card" },
        h("div", { id: "leaderboard-body", dangerouslySetInnerHTML: { __html: lb.html } }),
        h("div", { className: "btnrow" }, h("button", { className: "primary", id: "lb-close", onClick: actions.closeLeaderboard }, "Close"))));
  }

  /** Training programmes: the ordered blocks a hall runs, with progress read
   * from the same passing records the certificate claim rests on. Plain data
   * only — a station name never reaches this as markup. */
  function ProgramsCard() {
    const pg = useSlice("programs");
    if (!pg.visible) return h("div", { className: "overlay", id: "programs", hidden: true });
    const rows = pg.rows ?? [];
    const complete = rows.filter((r) => r.complete).length;
    return h("div", { className: "overlay", id: "programs", role: "dialog", "aria-modal": "true", "aria-label": "Training programmes" },
      h("div", { className: "card card-wide" },
        h("div", { className: "eyebrow" }, "SmartCiti.X · training programmes"),
        h("h1", null, "Training Programmes"),
        h("p", { className: "lead" },
          `${rows.length} programmes across the network · ${complete} complete. ` +
          "A station counts toward a programme when it has a passing attempt — two or more stars with no unsafe action. " +
          "Programmes cross both apps, the way an apprenticeship does."),
        h("div", { className: "prog-list" }, rows.map((p) => h("section", {
          key: p.id, className: `prog-card${p.complete ? " done" : ""}`, style: { "--prog": p.accent },
        },
          h("header", { className: "prog-head" },
            h("div", null,
              h("h2", null, p.name),
              h("div", { className: "prog-union" }, p.union)),
            h("div", { className: `prog-count${p.complete ? " done" : ""}` }, `${p.done}/${p.total}`)),
          h("div", { className: "prog-bar" }, h("span", { style: { width: `${p.pct}%` } })),
          h("p", { className: "prog-summary" }, p.summary),
          // A programme whose stations interrupt the learner reports on that
          // separately: passing the procedure and noticing the alarm are two
          // different competencies and a training director wants both.
          p.attention && h("p", { className: "prog-attention" },
            h("b", null, "Attention: "),
            p.attention.pct == null
              ? `${p.attention.runs} run${p.attention.runs === 1 ? "" : "s"}, no interruptions reached yet.`
              : `${p.attention.caught} of ${p.attention.caught + p.attention.dropped} interruptions caught (${p.attention.pct}%) across ${p.attention.runs} run${p.attention.runs === 1 ? "" : "s"}.`),
          h("p", { className: "prog-cert" }, p.certification),
          h("ol", { className: "prog-steps" }, p.stations.map((s) => h("li", {
            key: `${s.app}:${s.id}`, className: s.done ? "done" : "",
          },
            h("b", null, s.id.replace(/-/g, " ")),
            s.app === "trades" && h("span", { className: "prog-app" }, "Trade Skills"),
            h("span", { className: "prog-why" }, s.why)))),
          p.next
            ? h("button", {
                className: "primary", id: `prog-start-${p.id}`,
                onClick: () => actions.programStart(p.next.app, p.next.id),
              }, `Start ${p.next.id.replace(/-/g, " ")}`)
            : h("p", { className: "prog-done" }, "Programme complete — every station passed.")))),
        h("div", { className: "btnrow" },
          h("button", { id: "prog-close", onClick: actions.closePrograms }, "Close"))));
  }

  /** Instructor/compliance view: every attempt with its pass verdict, per
   * category, with CSV and xAPI export. Built from plain data — never an
   * HTML string — so a crew tag can't inject markup here. */
  function RecordsCard() {
    const rec = useSlice("records");
    if (!rec.visible) return h("div", { className: "overlay", id: "records", hidden: true });
    const fmtDate = (iso) => { const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); };
    const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    return h("div", { className: "overlay", id: "records", role: "dialog", "aria-modal": "true", "aria-label": "Training records" },
      h("div", { className: "card card-wide" },
        h("div", { className: "eyebrow" }, "SmartCiti.X · training records"),
        h("h1", null, "Training Records"),
        h("p", { className: "lead" },
          `${rec.total} attempt${rec.total === 1 ? "" : "s"} on this device · ${rec.passes} passed. ` +
          "A pass is two or more stars with no unsafe action. Records stay in this browser until you export them."),
        rec.summary.length > 0 && h("div", { className: "rec-grid" },
          rec.summary.map((s) => h("div", { className: "rec-tile", key: s.category },
            h("div", { className: "rec-cat" }, s.category),
            h("div", { className: "rec-big" }, `${s.stationsPassed}/${s.stations}`),
            h("div", { className: "rec-sub" }, `stations passed · ${s.passes}/${s.attempts} attempts · best ${"★".repeat(s.bestStars)}`)))),
        rec.rows.length
          ? h("div", { className: "rec-table-wrap" },
              h("table", { className: "lb-table rec-table" },
                h("thead", null, h("tr", null,
                  h("th", null, "When"), h("th", null, "Learner"), h("th", null, "Station"), h("th", null, "Category"),
                  h("th", null, "Score"), h("th", null, "Stars"), h("th", null, "Corr."), h("th", null, "Unsafe"),
                  h("th", null, "Time"), h("th", null, "Result"))),
                h("tbody", null, rec.rows.map((r) => h("tr", { key: r.id, className: r.passed ? "pass" : "fail" },
                  h("td", null, fmtDate(r.at)), h("td", null, r.learner), h("td", null, r.simName), h("td", null, r.category),
                  h("td", null, r.score), h("td", null, "★".repeat(r.stars)), h("td", null, r.errors), h("td", null, r.hazardHits),
                  h("td", null, fmtTime(r.seconds)),
                  h("td", null, h("span", { className: `rec-verdict ${r.passed ? "pass" : "fail"}` }, r.passed ? "PASS" : "FAIL")))))))
          : h("p", { className: "lb-empty" }, "No attempts recorded yet — finish any station and it will appear here."),
        rec.credentials.length > 0 && h(Fragment, null,
          h("div", { className: "eyebrow", style: { marginTop: "8px" } }, "Credentials earned — portable (Open Badges 2.0)"),
          h("ul", { className: "cred-list" }, rec.credentials.map((c) => h("li", { key: c.id, className: "cred-row" },
            h("b", null, c.certification),
            h("span", null, `${c.simName} · ${fmtDate(c.at)}`)))),
          h("p", { className: "fineprint" }, "Exported assertions can be checked by anyone with the ",
            h("a", { href: "../verify/index.html", target: "_blank", rel: "noopener" }, "credential verifier"),
            " — structure, dates, issuer and, where the hall hosts them, the hosted copy.")),
        h(LrsBox, { lrs: rec.lrs, total: rec.total }),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "rec-export-csv", disabled: !rec.total, onClick: actions.exportRecordsCsv }, "Export CSV"),
          h("button", { id: "rec-export-xapi", disabled: !rec.total, onClick: actions.exportRecordsXapi }, "Export xAPI (LRS)"),
          h("button", { id: "rec-export-badges", disabled: !rec.credentials.length, onClick: actions.exportCredentials }, "Export credentials (Open Badges)"),
          h("button", { id: "rec-clear", disabled: !rec.total, onClick: actions.clearRecords }, "Clear records"),
          h("button", { id: "rec-close", onClick: actions.closeRecords }, "Close"))));
  }

  function LrsBox({ lrs, total }) {
    const n = lrs.pending;
    let status = `Connected to ${lrs.host}${lrs.authed ? " (authenticated)" : ""} · ${n} statement${n === 1 ? "" : "s"} waiting`;
    if (lrs.busy) status += " · sending…";
    else if (lrs.last?.error) status += ` · last send failed: ${lrs.last.error}`;
    else if (lrs.last) status += ` · last send delivered ${lrs.last.sent}`;
    return h("div", { className: "lrs-box" },
      h("div", { className: "eyebrow" }, "Learning Record Store (live xAPI)"),
      lrs.configured
        ? h(Fragment, null,
            h("p", { className: "lrs-status", id: "lrs-status", "aria-live": "polite" }, status),
            h("div", { className: "btnrow lrs-row" },
              h("button", { id: "lrs-send-all", disabled: !total || lrs.busy, onClick: actions.lrsSendAll }, "Send all records now"),
              h("button", { id: "lrs-disconnect", onClick: actions.lrsDisconnect }, "Disconnect")))
        : h(Fragment, null,
            h("p", { className: "fineprint" },
              "Connect an xAPI endpoint and every finished attempt is delivered as it happens. Statements that " +
              "cannot be sent wait on this device and retry; the credential lives in this tab only."),
            h("div", { className: "lrs-form" },
              h("input", {
                id: "lrs-endpoint", type: "url", inputMode: "url", placeholder: "https://lrs.example.org/xapi",
                "aria-label": "LRS endpoint", value: lrs.endpointDraft, autoComplete: "off", spellCheck: false,
                onChange: (e) => actions.lrsSetEndpoint(e.target.value),
              }),
              h("input", {
                id: "lrs-auth", type: "password", placeholder: "user:secret or token (optional)",
                "aria-label": "LRS credential", value: lrs.authDraft, autoComplete: "off",
                onChange: (e) => actions.lrsSetAuth(e.target.value),
              }),
              h("button", { id: "lrs-connect", className: "primary", disabled: !lrs.endpointDraft.trim(), onClick: actions.lrsConnect }, "Connect")),
            lrs.error && h("p", { className: "lrs-error", role: "alert" }, lrs.error)));
  }

  function EditorStepRow({ step, i, count }) {
    return h("div", { className: `ed-step${step.on ? "" : " off"}` },
      h("input", { type: "checkbox", checked: step.on, onChange: (e) => actions.edToggleStep(i, e.target.checked) }),
      h("span", { className: "kind" }, step.kind),
      h("span", { className: "title" }, step.title),
      h("button", { type: "button", className: "mv", disabled: i === 0, onClick: () => actions.edMoveStep(i, -1) }, "↑"),
      h("button", { type: "button", className: "mv", disabled: i === count - 1, onClick: () => actions.edMoveStep(i, 1) }, "↓"));
  }

  function EditorLibraryCard({ entry }) {
    return h("div", { className: "ed-lib-card" },
      h("h3", null, entry.name),
      h("p", null, `${entry.baseName} · ${entry.stepCount} step${entry.stepCount === 1 ? "" : "s"}`),
      h("div", { className: "btnrow" },
        h("button", { className: "primary", disabled: !entry.playable, onClick: () => actions.edPlayLibrary(entry.id) }, "Play"),
        h("button", { onClick: () => actions.edDeleteLibrary(entry.id) }, "Delete")));
  }

  function EditorCard() {
    const ed = useSlice("editor");
    return h("div", { className: "overlay", id: "editor", hidden: !ed.visible, role: "dialog", "aria-modal": "true", "aria-label": "Create a scenario" },
      h("div", { className: "card" },
        h("div", { className: "eyebrow" }, "SmartCiti.X · scenario editor"),
        h("h1", null, "Create a Scenario"),
        h("p", { className: "lead" }, "Build your own drill from a real station's real steps: pick a simulator, keep " +
          "the steps that matter for what you're teaching, order them how you want, and it runs on the " +
          "same procedure engine and rank ladder as the original — hazards included."),
        h("div", { className: "ed-row" },
          h("label", { className: "eyebrow", htmlFor: "ed-base" }, "Base simulator"),
          h("select", { id: "ed-base", value: ed.baseValue, onChange: (e) => actions.edSelectBase(e.target.value) },
            h("option", { value: "" }, "Choose a simulator…"),
            ed.baseOptions.map((o) => h("option", { key: o.id, value: o.id }, o.label)))),
        h("div", { id: "ed-steps-wrap", hidden: !ed.stepsVisible },
          h("div", { className: "ed-row" }, h("label", { className: "eyebrow" }, "Steps — checked and in this order")),
          h("div", { id: "ed-steps", className: "ed-steps" },
            ed.steps.map((s, i) => h(EditorStepRow, { key: s.id, step: s, i, count: ed.steps.length }))),
          h("div", { className: "ed-grid" },
            h("div", { className: "ed-row" },
              h("label", { className: "eyebrow", htmlFor: "ed-name" }, "Scenario name"),
              h("input", { id: "ed-name", maxLength: 40, placeholder: "e.g. Quick Isolation Drill", value: ed.name, onChange: (e) => actions.edSetName(e.target.value) })),
            h("div", { className: "ed-row" },
              h("label", { className: "eyebrow", htmlFor: "ed-par" }, "Par time (seconds, optional)"),
              h("input", { id: "ed-par", type: "number", min: 30, max: 900, placeholder: "auto", value: ed.par, onChange: (e) => actions.edSetPar(e.target.value) }))),
          h("div", { className: "ed-row" },
            h("label", { className: "eyebrow", htmlFor: "ed-tagline" }, "Tagline (optional)"),
            h("input", { id: "ed-tagline", maxLength: 90, placeholder: "Shown on the kiosk and the intro card", value: ed.tagline, onChange: (e) => actions.edSetTagline(e.target.value) })),
          h("p", { id: "ed-error", className: "ed-error", hidden: !ed.error }, ed.error),
          h("div", { className: "btnrow" },
            h("button", { className: "primary", id: "ed-save-play", onClick: actions.edSavePlay }, "Save & play"),
            h("button", { id: "ed-save", onClick: actions.edSaveOnly }, "Save"),
            h("button", { id: "ed-cancel", onClick: actions.edCancel }, "Cancel"))),
        h("div", { id: "ed-library-wrap" },
          h("div", { className: "eyebrow", style: { marginTop: "6px" } }, "My scenarios"),
          h("div", { id: "ed-library", className: "ed-library" },
            ed.library.length
              ? ed.library.map((entry) => h(EditorLibraryCard, { key: entry.id, entry }))
              : h("p", { className: "ed-empty" }, "Nothing saved yet — pick a simulator above and build one."))),
        h("div", { className: "btnrow", id: "ed-close-row" }, h("button", { id: "ed-close", onClick: actions.closeEditor }, "Close"))));
  }

  function VoiceButton() {
    const voice = useSlice("voice");
    if (!voice.supported) return null;
    return h(Fragment, null,
      h("button", {
        id: "voice-btn", type: "button",
        className: voice.listening ? "listening" : "",
        onClick: actions.toggleVoice,
        title: 'Voice — say a station name, "hub," "reset," "hint," "brief," "status," or "help"',
      }, voice.listening ? "■ Listening…" : "🎙 Voice"),
      (voice.heard || voice.error) && h("div", { id: "voice-heard", className: voice.error ? "error" : "" },
        voice.error || `Heard: “${voice.heard}”`));
  }

  // ------------------------------------------------------ the controls panel
  //
  // Three tabs over one action table (shared/input.js): the keys, the pad and
  // the grammar. Which tabs appear and in what order is decided by the device
  // profile — a monocular hardhat display is never offered a gamepad tab.

  const TAB_LABELS = { keyboard: "Keyboard", gamepad: "Gamepad", voice: "Voice" };

  function KeyboardTab() {
    const c = useSlice("controls");
    const preset = c.presets.find((p) => p.id === c.preset);
    return h("div", { className: "ctl-pane", id: "controls-keyboard" },
      h("div", { className: "ctl-presetrow" },
        h("label", { className: "eyebrow", htmlFor: "ctl-preset" }, "Preset"),
        h("select", {
          id: "ctl-preset", value: c.preset,
          onChange: (e) => actions.controlsPreset(e.target.value),
        }, c.presets.map((p) => h("option", { key: p.id, value: p.id }, p.label))),
        h("button", { id: "ctl-reset-keys", type: "button", onClick: actions.controlsResetBindings }, "Reset keys")),
      preset && h("p", { className: "fineprint" }, preset.note),
      h("p", { className: "ctl-note", "aria-live": "polite" }, c.remapNote || "Click a key to rebind it, then press the key you want."),
      h("table", { className: "ctl-table" },
        h("thead", null, h("tr", null,
          h("th", null, "Action"), h("th", null, "Key"), h("th", null, "What it does"))),
        h("tbody", null, c.rows.map((row) => h("tr", { key: row.action, className: row.unbound ? "ctl-unbound" : "" },
          h("td", null, row.label),
          h("td", null, h("button", {
            type: "button",
            className: "ctl-key" + (c.remapping === row.action ? " arming" : "") + (row.custom ? " custom" : ""),
            "aria-label": `Rebind ${row.label}`,
            onClick: () => actions.controlsRemap(row.action),
          }, c.remapping === row.action
            ? "press a key…"
            : row.pretty.map((k, i) => h(Fragment, { key: k + i }, i > 0 && h("span", { className: "ctl-or" }, "or"), h("kbd", null, k))))),
          h("td", { className: "ctl-what" }, row.what))))));
  }

  /** The pad, drawn out of plain DOM shapes: two sticks with a live dot, a
   * d-pad cross, four face buttons, the bumpers and the triggers. Whatever is
   * pressed lights up, which is how a learner checks a suspect pad. */
  function PadDiagram({ pad }) {
    const byIndex = new Map((pad.buttons ?? []).map((b) => [b.index, b]));
    const on = (i) => (byIndex.get(i)?.pressed ? " on" : "");
    const analog = (i) => ({ opacity: 0.35 + 0.65 * Math.min(1, byIndex.get(i)?.value ?? 0) });
    const axis = (i) => pad.axes?.[i]?.value ?? 0;
    const stick = (xi, yi, cls) => h("div", { className: `pad-stick ${cls}` },
      h("div", {
        className: "pad-stick-dot" + (pad.axes?.[xi]?.live || pad.axes?.[yi]?.live ? " on" : ""),
        style: { transform: `translate(${axis(xi) * 16}px, ${axis(yi) * 16}px)` },
      }));
    const label = (i) => byIndex.get(i)?.label ?? "";
    return h("div", { className: "pad-diagram", id: "controls-pad-diagram", role: "img", "aria-label": "Gamepad layout with the pressed buttons highlighted" },
      h("div", { className: "pad-shoulder pad-lt" + on(6), style: analog(6) }, label(6) || "LT"),
      h("div", { className: "pad-shoulder pad-rt" + on(7), style: analog(7) }, label(7) || "RT"),
      h("div", { className: "pad-shoulder pad-lb" + on(4) }, label(4) || "LB"),
      h("div", { className: "pad-shoulder pad-rb" + on(5) }, label(5) || "RB"),
      h("div", { className: "pad-body" },
        h("div", { className: "pad-dpad" },
          h("div", { className: "pad-dbtn pad-dup" + on(12) }),
          h("div", { className: "pad-dbtn pad-ddown" + on(13) }),
          h("div", { className: "pad-dbtn pad-dleft" + on(14) }),
          h("div", { className: "pad-dbtn pad-dright" + on(15) })),
        h("div", { className: "pad-middle" },
          h("div", { className: "pad-pill" + on(8) }, "Back"),
          h("div", { className: "pad-pill" + on(9) }, "Start")),
        h("div", { className: "pad-faces" },
          h("div", { className: "pad-face pad-y" + on(3) }, label(3) || "Y"),
          h("div", { className: "pad-face pad-x" + on(2) }, label(2) || "X"),
          h("div", { className: "pad-face pad-b" + on(1) }, label(1) || "B"),
          h("div", { className: "pad-face pad-a" + on(0) }, label(0) || "A"))),
      stick(0, 1, "pad-ls"),
      stick(2, 3, "pad-rs"));
  }

  function GamepadTab() {
    const c = useSlice("controls");
    const pad = c.gamepad;
    return h("div", { className: "ctl-pane", id: "controls-gamepad" },
      h("p", { className: "ctl-note", id: "pad-state", "aria-live": "polite" },
        pad.connected
          ? `${pad.vendorName} layout · ${pad.id}${pad.mapping ? ` · ${pad.mapping} mapping` : ""}`
          : "No gamepad seen yet. Plug one in and press a button — a browser only reports a pad once it is used."),
      h(PadDiagram, { pad }),
      pad.connected && h("div", { className: "pad-readout" },
        h("div", { className: "pad-readout-row" }, (pad.buttons ?? []).filter((b) => b.pressed || b.value > 0.05)
          .map((b) => h("span", { key: b.index, className: "pad-live" }, `${b.label} ${b.value.toFixed(2)}`)),
        !(pad.buttons ?? []).some((b) => b.pressed || b.value > 0.05) && h("span", { className: "pad-idle" }, "nothing pressed")),
        h("div", { className: "pad-readout-row" }, (pad.axes ?? []).map((a) =>
          h("span", { key: a.index, className: "pad-live" + (a.live ? " on" : "") }, `${a.label} ${a.value.toFixed(2)}`)))),
      h("table", { className: "ctl-table" },
        h("thead", null, h("tr", null, h("th", null, "Control"), h("th", null, "Action"), h("th", null, "What it does"))),
        h("tbody", null, c.padMap.map((row, i) => h("tr", { key: `${row.index ?? "axis"}-${i}` },
          h("td", null, h("kbd", null, row.label)),
          h("td", null, row.actionLabel),
          h("td", { className: "ctl-what" }, row.note))))),
      h("p", { className: "fineprint" },
        "Mapped by index, not by brand: an Xbox, PlayStation or unbranded pad in the W3C Standard Gamepad mapping " +
        "all behave the same, and only the printed names change. In a headset the pad is left alone — the controllers " +
        "there are XR input sources with their own ray, trigger and grip."));
  }

  function VoiceTab() {
    const c = useSlice("controls");
    const voice = useSlice("voice");
    return h("div", { className: "ctl-pane", id: "controls-voice" },
      h("p", { className: "ctl-note", "aria-live": "polite", id: "voice-last" },
        c.heard || voice.heard ? `Last heard: “${c.heard || voice.heard}”` : "Nothing heard yet. Press the microphone button, or say a command while it is listening."),
      !voice.supported && h("p", { className: "fineprint" }, "This browser offers no speech recognition, so the grammar below is only reachable from the keyboard and the pad."),
      h("table", { className: "ctl-table" },
        h("thead", null, h("tr", null, h("th", null, "Say"), h("th", null, "What happens"))),
        h("tbody", null, c.grammar.map((row) => h("tr", { key: row.type },
          h("td", null, row.say.map((s, i) => h(Fragment, { key: s },
            i > 0 && h("span", { className: "ctl-or" }, "or"), h("kbd", null, `“${s}”`)))),
          h("td", { className: "ctl-what" }, row.what))))),
      h("p", { className: "fineprint" },
        "Voice navigates, focuses, describes, reads back and answers the check-in. It never completes a step: " +
        "selecting, pressing, dragging and turning stay with the hands, which is the point of a hands-on trainer. " +
        "Station names work too — say the name on a kiosk to enter it."));
  }

  function ControlsCard() {
    const c = useSlice("controls");
    if (!c.visible) return null;
    const tabs = c.tabs.length ? c.tabs : ["keyboard"];
    const tab = tabs.includes(c.tab) ? c.tab : tabs[0];
    return h("div", { className: "overlay", id: "controls", role: "dialog", "aria-modal": "true", "aria-label": "Controls" },
      h("div", { className: "card card-wide" },
        h("div", { className: "eyebrow" }, c.deviceLine || "This device"),
        h("h1", null, "Controls"),
        h("p", { className: "lead" },
          `Tabs are ordered for this device (${c.inputSource === "device" ? "from its own input record" : "from its run profile"})`
          + `${c.voiceFirst ? ", voice first" : ""}${c.hands ? "; hands do the work in the headset" : ""}.`
          + " Every action here is reachable from the keyboard as well, and the bindings live in this browser only."),
        h("div", { className: "tabrow", role: "tablist", "aria-label": "Control surfaces" },
          tabs.map((id) => h("button", {
            key: id, type: "button", id: `ctl-tab-${id}`, role: "tab",
            "aria-selected": tab === id ? "true" : "false",
            className: "ctl-tab" + (tab === id ? " primary" : ""),
            onClick: () => actions.controlsTab(id),
          }, TAB_LABELS[id] ?? id))),
        tab === "keyboard" && h(KeyboardTab),
        tab === "gamepad" && h(GamepadTab),
        tab === "voice" && h(VoiceTab),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "controls-close", type: "button", onClick: actions.closeControls }, "Close"))));
  }

  function ControlsButton() {
    return h("button", {
      id: "controls-btn", type: "button",
      onClick: actions.openControls,
      title: "Controls — keyboard, gamepad and voice (? or F1)",
      "aria-label": "Controls: keyboard, gamepad and voice",
    }, "⌨");
  }

  function SpeakButton() {
    if (!actions.speechSupported) return null;
    return h("button", {
      id: "speak-btn", type: "button",
      onClick: actions.speakHint,
      title: "Read the current step aloud",
      "aria-label": "Read the current step aloud",
    }, "🔊");
  }

  function App() {
    return h(Fragment, null,
      h(HudMission), h(HudMetrics), h(HudObjective), h(HudRail), h(HudHint),
      h(GestureTip), h(ArPrompt), h(ScaleRow), h(VoiceButton), h(SpeakButton), h(ControlsButton),
      h(IntroCard), h(FlatStationCard), h(PreBriefCard), h(ResultsCard), h(LeaderboardCard), h(RecordsCard), h(ProgramsCard), h(EditorCard),
      h(ControlsCard));
  }

  ReactDOM.createRoot(document.getElementById("react-root")).render(h(App));
}

export { stripHtml };
