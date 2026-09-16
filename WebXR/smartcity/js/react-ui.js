/**
 * The 2D UI chrome — HUD, intro, results, leaderboard, scenario editor — as
 * React components. This file owns none of the Three.js scene, the Session,
 * or the render loop; it only reads `store` and calls back into `actions`,
 * both handed to it by app.js. The CSS in index.html targets these same
 * element ids/classes as before, so no style changes were needed to move
 * the markup here.
 */

import { SIMS_META } from "./sims-meta.js";

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
  <div class="eyebrow">Ten categories · Twenty stations · One apprentice record</div>
  <h1>AR / VR Training Simulators</h1>
  <p class="lead">Deep-skill simulators across ten trade-union categories. Each station is its own
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
];
const INTRO_FOOT_HTML = `
  <p class="fineprint" style="margin-top:6px">New here? <b style="color:var(--text)">Start guided tour</b> plays all
  twenty stations in order and brings you back to the campus between each one.</p>
  <p class="fineprint">Progress, ranks and badges are stored per simulator in this browser only —
  nothing is transmitted. AR needs a WebXR + hit-test capable browser (most current Android
  Chrome-based browsers on ARCore devices, and Meta Quest Browser in passthrough). Ray-Ban Meta
  display glasses cannot run immersive WebXR, so on those this page is a flat phone view.</p>
  <p class="fineprint">Your level, XP and badges carry over to <a href="../trades/index.html">Trade Skills Simulator</a>,
  seven more union-trade rooms (electrician, welder, plumber and more) built on the same engine —
  one shared apprentice record across both. See <a href="../portal/index.html">the network map</a> for
  all four apps in this repository, including <a href="../holodeck/index.html">Holodeck</a>'s
  prompt-driven procedure generator.</p>
  <p class="fineprint" style="opacity:.65;margin-top:8px">SmartCiti.X ~VR Simulators — powered by AGI Corp &amp; Visko.</p>
`;

function stripHtml(html) {
  return String(html ?? "").replace(/<[^>]*>/g, "");
}

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

  function HudHint() {
    return h("div", { id: "hud-hint" }, "Drag to look · Click to act · M mute · Esc campus");
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
    const byCategory = new Map();
    for (const sim of SIMS_META) {
      const cat = sim.category ?? "Uncategorized";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push(sim);
    }
    const categories = [...byCategory.keys()].sort(
      (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));
    return h(Fragment, null, categories.map((cat) => h(Fragment, { key: cat },
      h("div", { className: "sim-category" }, cat),
      h("div", { className: "sims" },
        byCategory.get(cat).sort((a, b) => a.index.localeCompare(b.index)).map((sim) =>
          h("div", { className: "sim", style: { "--tint": sim.accentCss }, key: sim.id },
            h("b", null, sim.name),
            h("span", null, `${sim.trade} · ${sim.game.system}`),
            h("span", { className: "sim-cert" }, sim.certification)))))));
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
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "start-tour", onClick: actions.startTour }, "Start guided tour"),
          h("button", { id: "enter-ar", disabled: intro.arDisabled, onClick: actions.enterAr }, intro.arText),
          h("button", { id: "enter-vr", disabled: intro.vrDisabled, onClick: actions.enterVr }, intro.vrText),
          h("button", { id: "enter-flat", onClick: actions.enterFlat }, "Free explore"),
          h("button", { id: "view-leaderboard", onClick: actions.viewLeaderboard }, "Leaderboards"),
          h("button", { id: "view-records", onClick: actions.viewRecords }, "Training records"),
          h("button", { id: "open-editor", onClick: actions.openEditor }, "Create a scenario"),
          h("button", { id: "reset-progress", onClick: actions.resetProgress }, useSlice("resetProgressText"))),
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_FOOT_HTML } })));
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
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "rec-export-csv", disabled: !rec.total, onClick: actions.exportRecordsCsv }, "Export CSV"),
          h("button", { id: "rec-export-xapi", disabled: !rec.total, onClick: actions.exportRecordsXapi }, "Export xAPI (LRS)"),
          h("button", { id: "rec-clear", disabled: !rec.total, onClick: actions.clearRecords }, "Clear records"),
          h("button", { id: "rec-close", onClick: actions.closeRecords }, "Close"))));
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
      h(GestureTip), h(ArPrompt), h(ScaleRow), h(VoiceButton), h(SpeakButton),
      h(IntroCard), h(ResultsCard), h(LeaderboardCard), h(RecordsCard), h(EditorCard));
  }

  ReactDOM.createRoot(document.getElementById("react-root")).render(h(App));
}

export { stripHtml };
