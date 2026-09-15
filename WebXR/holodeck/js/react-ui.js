/**
 * Holodeck's 2D UI chrome — same architecture as SmartCiti.X's react-ui.js:
 * React owns the HUD/overlays, app.js owns the Three.js scene and physics
 * and only writes into the store.
 */
import { THEMES } from "./themes.js";

const h = React.createElement;
const { Fragment, useSyncExternalStore } = React;

/** "a Technician" vs "an Automation Lead" — rank names are real sim content
 * (e.g. "Automation Lead", "Elevator Constructor"), not picked to avoid
 * vowels, so the article has to actually check. */
const article = (word) => (/^[aeiou]/i.test(word) ? "an" : "a");

export function mountUI(store, actions) {
  function useSlice(key) {
    return useSyncExternalStore(store.subscribe, () => store.get()[key]);
  }

  function HoleChip() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    if (hud.mode === "training") {
      return h("div", { className: "chip", id: "hud-hole-chip" },
        h("div", { className: "eyebrow" }, "Training"),
        h("div", { id: "hud-hole-name" }, hud.step),
        h("div", { id: "hud-hole-sub" }, hud.cue));
    }
    return h("div", { className: "chip", id: "hud-hole-chip" },
      h("div", { className: "eyebrow" }, "Hole"),
      h("div", { id: "hud-hole-name" }, hud.holeName),
      h("div", { id: "hud-hole-sub" }, hud.holeSub));
  }

  function ScoreChip() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    if (hud.mode === "training") {
      return h("div", { className: "chip", id: "hud-score-chip" },
        h("div", { className: "eyebrow" }, "Score"),
        h("div", { id: "hud-strokes" }, hud.score),
        h("div", { id: "hud-par" }, hud.comboText));
    }
    return h("div", { className: "chip", id: "hud-score-chip" },
      h("div", { className: "eyebrow" }, "Strokes"),
      h("div", { id: "hud-strokes" }, hud.strokes),
      h("div", { id: "hud-par" }, `PAR ${hud.par}`));
  }

  function Rail() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    return h("div", { id: "hud-rail", "data-state": hud.railState },
      h("div", { id: "hud-feedback", dangerouslySetInnerHTML: { __html: hud.feedback } }),
      hud.mode === "training"
        ? h("div", { id: "hud-count" }, hud.count)
        : hud.powerVisible && h("div", { id: "hud-power-track" },
            h("div", { id: "hud-power-fill", style: { width: `${hud.powerPct}%` } })));
  }

  function ThemePicks() {
    const intro = useSlice("intro");
    return h("div", { className: "theme-picks" },
      THEMES.map((t) => h("button", {
        key: t.id, type: "button",
        className: "theme-chip" + (intro.themeId === t.id ? " active" : ""),
        onClick: () => actions.selectTheme(t.id),
      }, t.name)));
  }

  function IntroCard() {
    const intro = useSlice("intro");
    if (!intro.visible) return null;
    return h("div", { className: "overlay", id: "intro" },
      h("div", { className: "card" },
        h("div", { className: "brandline" }, "Holodeck ~ Powered by AGI Corp & Visko"),
        h("div", { className: "eyebrow" }, "Speak a simulation into existence"),
        h("h1", null, "Holodeck"),
        h("p", { className: "lead" },
          "Describe it out loud or type it, and it renders and plays for real. Two generators " +
          "exist today: a 3-hole mini-golf course (pick a theme below with your words), and a " +
          "real scored safety-training procedure — the same engine every union-trade simulator " +
          "in this project runs on. There is no live AI model reading arbitrary prompts yet; " +
          "the words below are the whole vocabulary for both."),
        h("div", { id: "prompt-row" },
          h("label", { className: "eyebrow", htmlFor: "prompt-input" },
            "Try: “make a mini golf game with an alaskan theme” or “run a lockout training on a forklift”"),
          h("textarea", {
            id: "prompt-input", value: intro.promptText,
            placeholder: "make a mini golf course, tropical theme...",
            onChange: (e) => actions.setPromptText(e.target.value),
          }),
          h("div", { id: "prompt-actions" },
            h("button", {
              id: "mic-btn", type: "button",
              className: intro.listening ? "listening" : "",
              disabled: !intro.speechSupported,
              onClick: actions.toggleMic,
            }, intro.listening ? "■ Listening…" : "🎙 Speak it"),
            h("button", { className: "primary", type: "button", onClick: actions.generate }, "Generate course"),
            h("button", {
              type: "button", disabled: !intro.xrSupported,
              title: intro.xrSupported ? "" : "VR unavailable in this browser",
              onClick: actions.generateInVR,
            }, "Generate in VR")),
          !intro.speechSupported && h("p", { className: "fineprint", style: { marginTop: "6px" } },
            "Voice input isn't supported in this browser — Chrome desktop/Android has it. Typing works everywhere."),
          intro.error && h("p", { id: "prompt-error" }, intro.error),
          intro.heard && h("p", { id: "prompt-heard" }, `Heard: “${intro.heard}”`)),
        h("div", { className: "eyebrow", style: { marginTop: "10px" } }, "Mini-golf theme (auto-picked from your words, or choose one — ignored for training prompts)"),
        h(ThemePicks),
        h("p", { className: "fineprint", style: { marginTop: "8px" } },
          "Training prompts instead pick from: lockout & verify or confined-space entry, on an electrical panel, " +
          "forklift, boiler, conveyor, air compressor or storage tank — e.g. “confined space entry simulation " +
          "for a storage tank.” Or name one of 20 real SmartCiti.X stations directly — e.g. “run the robot cell " +
          "simulation” or “practice the dock crane drill” — and it loads that actual station, hazards and all, " +
          "not a generated stand-in."),
        h("p", { className: "fineprint" },
          "Nothing you say or type is sent anywhere — the prompt match runs entirely in this browser."),
        h("p", { className: "fineprint", style: { opacity: .65, marginTop: "8px" } },
          "Holodeck — powered by AGI Corp & Visko.")));
  }

  function HoleResultCard() {
    const r = useSlice("holeResult");
    if (!r.visible) return null;
    return h("div", { className: "overlay", id: "hole-result" },
      h("div", { className: "card" },
        h("div", { className: "res-stars" }, r.stars),
        h("h1", null, r.title),
        h("p", { className: "res-note" }, r.note),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", onClick: actions.nextHole }, r.isLast ? "See final score" : "Next hole →"))));
  }

  function FinalCard() {
    const f = useSlice("final");
    if (!f.visible) return null;
    return h("div", { className: "overlay", id: "final" },
      h("div", { className: "card" },
        h("div", { className: "eyebrow" }, "Course complete"),
        h("h1", null, "Scorecard"),
        h("table", { className: "scorecard" },
          h("thead", null, h("tr", null, h("th", null, "Hole"), h("th", null, "Par"), h("th", null, "Strokes"))),
          h("tbody", null,
            f.rows.map((row, i) => h("tr", { key: i },
              h("td", null, row.name), h("td", null, row.par), h("td", null, row.strokes))),
            h("tr", null, h("td", null, h("b", null, "Total")), h("td", null, h("b", null, f.totalPar)), h("td", null, h("b", null, f.totalStrokes))))),
        h("p", { className: "res-note" }, f.summary),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", onClick: actions.playAgain }, "Play it again"),
          h("button", { onClick: actions.newPrompt }, "New prompt"))));
  }

  function TrainingResultCard() {
    const r = useSlice("trainingResult");
    if (!r.visible) return null;
    return h("div", { className: "overlay", id: "training-result" },
      h("div", { className: "card" },
        h("div", { className: "res-stars" }, r.stars),
        h("h1", null, r.title),
        h("p", { className: "res-note" }, r.scoreText),
        h("p", { className: "res-note" }, r.note),
        r.rankName && h("p", { className: "res-note" },
          r.rankedUp
            ? `Ranked up — you're now ${article(r.rankName)} ${r.rankName} on this procedure.`
            : `Rank on this procedure: ${r.rankName}.`),
        r.boardRows.length > 0 && h(Fragment, null,
          h("div", { className: "eyebrow", style: { marginTop: "8px" } }, "Local leaderboard — this procedure, this device"),
          h("table", { className: "scorecard" },
            h("thead", null, h("tr", null, h("th", null, "#"), h("th", null, "Name"), h("th", null, "Score"), h("th", null, "Time"))),
            h("tbody", null, r.boardRows.map((row) => h("tr", { key: row.place, style: row.isThisRun ? { color: "var(--accent)" } : null },
              h("td", null, row.place), h("td", null, row.isThisRun ? h("b", null, row.name) : row.name),
              h("td", null, row.score), h("td", null, row.time)))))),
        h("div", { className: "btnrow" },
          h("button", { className: "primary", onClick: actions.playAgain }, "Run it again"),
          h("button", { onClick: actions.newPrompt }, "New prompt"))));
  }

  function App() {
    return h(Fragment, null,
      h(HoleChip), h(ScoreChip), h(Rail),
      h(IntroCard), h(HoleResultCard), h(FinalCard), h(TrainingResultCard));
  }

  ReactDOM.createRoot(document.getElementById("react-root")).render(h(App));
}
