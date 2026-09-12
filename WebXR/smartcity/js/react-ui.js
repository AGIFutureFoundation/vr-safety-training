/**
 * The 2D UI chrome — HUD, intro, results, leaderboard, scenario editor — as
 * React components. This file owns none of the Three.js scene, the Session,
 * or the render loop; it only reads `store` and calls back into `actions`,
 * both handed to it by app.js. The CSS in index.html targets these same
 * element ids/classes as before, so no style changes were needed to move
 * the markup here.
 */

const h = React.createElement;
const { Fragment, useSyncExternalStore } = React;

// Static marketing copy for the intro card — this never changes at runtime,
// so it is kept as one HTML block rather than hand-built as elements.
const INTRO_HEAD_HTML = `
  <div class="brandline">SmartCiti.X ~VR Simulators (Powered by AGI Corp &amp; Visko)</div>
  <div class="eyebrow">SmartCiti.X · twenty districts, twenty certifications</div>
  <h1>AR Training Simulators</h1>
  <p class="lead">Twenty deep-skill simulators across the union trades, each its own gamified system
  with its own rank ladder, currency and badges. Every station is a real procedure with real hazards —
  the training scores what you touch and in what order.</p>
  <div class="sims">
    <div class="sim" style="--tint:#59c97b"><b>Charge Point</b><span>EV DC fast-charger isolation · Grid Certification</span></div>
    <div class="sim" style="--tint:#f2c14b"><b>Signal Cabinet</b><span>Traffic controller fault work · Intersection Command</span></div>
    <div class="sim" style="--tint:#4fa3ff"><b>Valve Vault</b><span>Confined space entry · Entry Authority</span></div>
    <div class="sim" style="--tint:#ffb648"><b>Solar Deck</b><span>Rooftop PV/BESS commissioning · Rooftop Authority</span></div>
    <div class="sim" style="--tint:#a079ff"><b>Splice Node</b><span>Fibre laser safety and splicing · Photon Guild</span></div>
    <div class="sim" style="--tint:#4fd1ff"><b>Flight Deck</b><span>Drone ramp and battery safety · Airside Command</span></div>
    <div class="sim" style="--tint:#f2894b"><b>Track Access</b><span>Rail possession and third-rail isolation · Right-of-Way</span></div>
    <div class="sim" style="--tint:#f0645b"><b>Triage Point</b><span>Mass-casualty START triage · Golden Hour</span></div>
    <div class="sim" style="--tint:#a079ff"><b>Robot Cell</b><span>Six-axis robot lockout · Cell Lockout</span></div>
    <div class="sim" style="--tint:#4fd1ff"><b>Chiller Plant</b><span>Refrigerant recovery, confined space · Cold Chain Command</span></div>
    <div class="sim" style="--tint:#ff7a1a"><b>Tower Climb</b><span>Guyed tower ascent, RF lockout · Summit Authority</span></div>
    <div class="sim" style="--tint:#ffcc00"><b>Steel Erector</b><span>Structural steel connecting, bolt-up · Iron Certified</span></div>
    <div class="sim" style="--tint:#2f8fdb"><b>Crane Yard</b><span>Mobile crane pick, load chart, rigging · Rigging Command</span></div>
    <div class="sim" style="--tint:#7ed321"><b>Trench Box</b><span>Excavation shoring, atmosphere testing · Ground Authority</span></div>
    <div class="sim" style="--tint:#d83a2a"><b>Boiler Room</b><span>Boiler lockout, firebox confined space · Steam Certified</span></div>
    <div class="sim" style="--tint:#2dd4bf"><b>Elevator Pit</b><span>Pit/car-top entry, dual stop switches · Shaftway Authority</span></div>
    <div class="sim" style="--tint:#c9e265"><b>Abatement Chamber</b><span>Containment, wet removal, decon airlock · Containment Command</span></div>
    <div class="sim" style="--tint:#ff6fae"><b>Rigging Loft</b><span>Counterweight fly system, arbor balance · Fly Certified</span></div>
    <div class="sim" style="--tint:#fcee21"><b>Line Truck</b><span>Bucket-truck line work, isolation, grounding · Storm Command</span></div>
    <div class="sim" style="--tint:#3a7ca5"><b>Dock Crane</b><span>Container lift, twist-locks, wind limits · Waterfront Authority</span></div>
  </div>
  <p><b>AR:</b> place a tabletop diorama of any station on a real surface, then tap components.<br>
  <b>VR:</b> full-scale digital-twin plaza. <b>Desktop:</b> drag to look, click to act, <kbd>WASD</kbd> to move.</p>
`;
const INTRO_FOOT_HTML = `
  <p class="fineprint" style="margin-top:6px">New here? <b style="color:var(--text)">Start guided tour</b> walks you
  through all twenty stations in order, one after another, with no need to find your own way back to the campus
  between them.</p>
  <p class="fineprint">Progress, ranks and badges are stored per simulator in this browser only —
  nothing is transmitted. AR needs a WebXR + hit-test capable browser (most current Android
  Chrome-based browsers on ARCore devices, and Meta Quest Browser in passthrough). Ray-Ban Meta
  display glasses cannot run immersive WebXR, so on those this page is a flat phone view.</p>
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
      h("div", { id: "hud-feedback", dangerouslySetInnerHTML: { __html: hud.feedbackHtml } }),
      h("div", { id: "hud-progress" },
        h("div", { id: "hud-track" }, h("div", { id: "hud-fill", style: { width: `${hud.fillPct}%` } })),
        h("div", { id: "hud-count" }, hud.count),
        h("div", { id: "hud-timer" }, hud.timer)));
  }

  function HudHint() {
    return h("div", { id: "hud-hint" }, "Drag look · click act · M mute · ESC hub");
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

  function IntroCard() {
    const intro = useSlice("intro");
    return h("div", { className: "overlay", id: "intro", hidden: !intro.visible },
      h("div", { className: "card" },
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_HEAD_HTML } }),
        h("div", { className: "namerow" },
          h("label", { className: "eyebrow", htmlFor: "player-name" }, "Crew tag (for the leaderboard)"),
          h("input", {
            id: "player-name", maxLength: 12, placeholder: "YOU", autoComplete: "off",
            value: intro.playerName,
            onChange: (e) => actions.setPlayerNameDraft(e.target.value),
            onBlur: actions.commitPlayerName,
          })),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", id: "start-tour", onClick: actions.startTour }, "Start guided tour"),
          h("button", { id: "enter-ar", disabled: intro.arDisabled, onClick: actions.enterAr }, intro.arText),
          h("button", { id: "enter-vr", disabled: intro.vrDisabled, onClick: actions.enterVr }, intro.vrText),
          h("button", { id: "enter-flat", onClick: actions.enterFlat }, "Free explore"),
          h("button", { id: "view-leaderboard", onClick: actions.viewLeaderboard }, "Leaderboards"),
          h("button", { id: "open-editor", onClick: actions.openEditor }, "Create a scenario"),
          h("button", { id: "reset-progress", onClick: actions.resetProgress }, useSlice("resetProgressText"))),
        h("div", { dangerouslySetInnerHTML: { __html: INTRO_FOOT_HTML } })));
  }

  function ResultsCard() {
    const results = useSlice("results");
    if (!results.visible) return h("div", { className: "overlay", id: "results", hidden: true });
    return h("div", { className: "overlay", id: "results" },
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
    return h("div", { className: "overlay", id: "leaderboard" },
      h("div", { className: "card" },
        h("div", { id: "leaderboard-body", dangerouslySetInnerHTML: { __html: lb.html } }),
        h("div", { className: "btnrow" }, h("button", { className: "primary", id: "lb-close", onClick: actions.closeLeaderboard }, "Close"))));
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
    return h("div", { className: "overlay", id: "editor", hidden: !ed.visible },
      h("div", { className: "card" },
        h("div", { className: "eyebrow" }, "SmartCiti.X · scenario editor"),
        h("h1", null, "Create a Scenario"),
        h("p", { className: "lead" }, "Build your own drill out of a real station's real steps. Pick a simulator, keep " +
          "the steps that matter for what you're teaching, put them in the order you want, and it runs " +
          "through the exact same procedure engine and rank system as the original — hazards included."),
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

  function App() {
    return h(Fragment, null,
      h(HudMission), h(HudMetrics), h(HudObjective), h(HudRail), h(HudHint),
      h(GestureTip), h(ArPrompt), h(ScaleRow),
      h(IntroCard), h(ResultsCard), h(LeaderboardCard), h(EditorCard));
  }

  ReactDOM.createRoot(document.getElementById("react-root")).render(h(App));
}

export { stripHtml };
