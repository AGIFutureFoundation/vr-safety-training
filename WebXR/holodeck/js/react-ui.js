/**
 * Holodeck's 2D UI chrome — same architecture as SmartCiti.X's react-ui.js:
 * React owns the HUD/overlays, app.js owns the Three.js scene and physics
 * and only writes into the store.
 */
import { THEMES } from "./themes.js";

const h = React.createElement;
const { Fragment, useSyncExternalStore } = React;

export function mountUI(store, actions) {
  function useSlice(key) {
    return useSyncExternalStore(store.subscribe, () => store.get()[key]);
  }

  function HoleChip() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    return h("div", { className: "chip", id: "hud-hole-chip" },
      h("div", { className: "eyebrow" }, "Hole"),
      h("div", { id: "hud-hole-name" }, hud.holeName),
      h("div", { id: "hud-hole-sub" }, hud.holeSub));
  }

  function ScoreChip() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    return h("div", { className: "chip", id: "hud-score-chip" },
      h("div", { className: "eyebrow" }, "Strokes"),
      h("div", { id: "hud-strokes" }, hud.strokes),
      h("div", { id: "hud-par" }, `PAR ${hud.par}`));
  }

  function Rail() {
    const hud = useSlice("hud");
    if (!hud.visible) return null;
    return h("div", { id: "hud-rail" },
      h("div", { id: "hud-feedback" }, hud.feedback),
      hud.powerVisible && h("div", { id: "hud-power-track" },
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
          "Describe a course out loud or type it, and it renders and plays for real. " +
          "Right now that means one generator — a 3-hole mini-golf course — with a theme " +
          "your words pick from a small set below. There is no live AI model behind this " +
          "reading arbitrary prompts yet; the words below are the whole vocabulary."),
        h("div", { id: "prompt-row" },
          h("label", { className: "eyebrow", htmlFor: "prompt-input" }, "Try: “make a mini golf game with an alaskan theme”"),
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
            h("button", { className: "primary", type: "button", onClick: actions.generate }, "Generate course")),
          !intro.speechSupported && h("p", { className: "fineprint", style: { marginTop: "6px" } },
            "Voice input isn't supported in this browser — Chrome desktop/Android has it. Typing works everywhere."),
          intro.error && h("p", { id: "prompt-error" }, intro.error),
          intro.heard && h("p", { id: "prompt-heard" }, `Heard: “${intro.heard}”`)),
        h("div", { className: "eyebrow", style: { marginTop: "10px" } }, "Theme (auto-picked from your words, or choose one)"),
        h(ThemePicks),
        h("div", { className: "btnrow" }),
        h("p", { className: "fineprint" },
          "Nothing you say or type is sent anywhere — the theme match runs entirely in this browser."),
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

  function App() {
    return h(Fragment, null,
      h(HoleChip), h(ScoreChip), h(Rail),
      h(IntroCard), h(HoleResultCard), h(FinalCard));
  }

  ReactDOM.createRoot(document.getElementById("react-root")).render(h(App));
}
