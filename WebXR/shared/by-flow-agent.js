// BAYOU — a GRIOT character drives a parish lesson flow on device (docs/consoles/BAYOU.md,
// docs/flowhub.md "The parish lesson flows"). The SmartCiti.X side of the flow contract only.
//
// byFlowAgent(flow, { lesson, character, kiosks }) returns a small pure state machine over the
// flow's nodes: greet → brief → station → check → hand-off → close. Each `say()` is a line the
// character speaks, re-read from the lesson data (title, steps, check, apply title) — nothing is
// invented. `next(event)` moves on: { passed } after the station, { answer } at the check (a
// wrong answer shows the check's why and stays), { done } after the apply step. The passport
// records the lesson at a right check answer and the apply step when it is done
// (byRecordLesson / byRecordApply). byMountFlowAgent(el, agent) renders it as plain DOM.
// No three.js here; the caller places the character (npc.js grMount) and opens the panel.

import { byApplyFor, byStationHref, byRecordLesson, byRecordApply, byApplyGame } from "./by-parish-lessons.js";

export const BY_AGENT_PHASES = ["greet", "brief", "lesson", "check", "apply", "close", "done"];

const byNodeOf = (flow, kind, id = null) => (flow?.nodes ?? []).find((n) => n.kind === kind && (!id || n.id === id)) ?? null;

export function byFlowAgent(flow, { lesson, character = null, kiosks = [], award = null, awarded = null } = {}) {
  const who = character?.name ? `${character.name}, ${String(character.role ?? character.title ?? "crew").toLowerCase()}` : "your guide";
  const apply = byApplyFor(lesson, { kiosks });
  const check = byNodeOf(flow, "checkin", "check")?.params?.check ?? lesson?.check ?? null;
  const state = { phase: "greet", tries: 0, lastWhy: null, log: [] };
  const rec = { award, awarded };

  function say() {
    switch (state.phase) {
      case "greet": return { who, line: `Welcome to the ${lesson.siteName}. Today's lesson: ${lesson.title}.`, actions: ["start"] };
      case "brief": return { who, line: lesson.steps.join(" "), actions: ["open the station"] };
      case "lesson": return { who, line: `Open the station and work it through: ${lesson.title}.`, href: byStationHref(lesson), actions: ["passed", "try again"] };
      case "check": return { who, line: check.q, options: check.options, note: state.lastWhy, actions: ["answer"] };
      case "apply": {
        const title = apply?.kind === "mini-game" ? apply.game.title : apply?.id;
        return { who, line: `Now use it here for two minutes: ${title}.`, apply, actions: ["done"] };
      }
      case "close": return { who, line: "How did that go? Say one thing you would tell someone at home.", actions: ["finish"] };
      default: return { who, line: "Lesson complete.", actions: [] };
    }
  }

  function next(ev = {}) {
    const from = state.phase;
    if (from === "greet") state.phase = "brief";
    else if (from === "brief") state.phase = "lesson";
    else if (from === "lesson") state.phase = ev.passed ? "check" : "brief";
    else if (from === "check") {
      state.tries++;
      if (ev.answer === check.answer) { state.lastWhy = null; byRecordLesson(lesson, rec); state.phase = "apply"; }
      else state.lastWhy = check.why;
    } else if (from === "apply") {
      if (ev.done && apply) { byRecordApply(lesson, apply.id, rec); state.phase = "close"; }
    } else if (from === "close") state.phase = "done";
    state.log.push([from, state.phase]);
    return say();
  }

  /** The flow node the agent stands on (for smartcitix:flow.state reporting by the host). */
  function node() {
    const map = { greet: "brief", brief: "brief", lesson: "lesson", check: "check", apply: "apply", close: "close", done: "close" };
    return (flow?.nodes ?? []).find((n) => n.id === map[state.phase]) ?? null;
  }

  return { say, next, node, state, apply, lesson, flow, get phase() { return state.phase; } };
}

const byEsc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Plain-DOM panel for the agent (no three.js, no emoji). Re-renders on every choice. */
export function byMountFlowAgent(el, agent) {
  if (!el || !agent) return null;
  // A game with rounds (say().game, e.g. LA-COHORTS' apply games through COGNITION's runner) is played round by round:
  // one right move of two per round, a miss stays on the round with a nudge; Done shows once every round is played.
  const play = { id: null, i: 0, miss: false };
  const render = () => {
    const s = agent.say();
    const opts = (s.options ?? []).map((o, i) => `<button type="button" data-by-answer="${i}">${byEsc(o)}</button>`).join(" ");
    const rounds = agent.phase === "apply" && Array.isArray(s.game?.steps) ? s.game.steps : [];
    if (s.game?.id !== play.id) { play.id = s.game?.id ?? null; play.i = 0; play.miss = false; }
    const r = rounds[play.i];
    const roundHtml = rounds.length ? (r
      ? `<pre class="by-board">${byEsc(r.board.join("\n"))}</pre><p class="by-line">${byEsc(r.prompt)}</p>${play.miss ? `<p class="by-note">Not that one: try the other move.</p>` : ""}<p>${r.options.map((o, k) => `<button type="button" data-by-round="${k}">${byEsc(o.text)}</button>`).join(" ")}</p>`
      : `<p class="by-note">Every round played.</p>`) : "";
    const game = s.game ?? (s.apply?.kind === "mini-game" ? byApplyGame(s.apply.id) : null);
    el.innerHTML = `<div class="by-agent"><p class="by-who">${byEsc(s.who)}</p><p class="by-line">${byEsc(s.line)}</p>`
      + (s.note ? `<p class="by-note">${byEsc(s.note)}</p>` : "")
      + (s.href ? `<p><a href="${byEsc(s.href)}">Open the station</a></p>` : "")
      + (game ? `<p class="by-game">${byEsc(game.summary)}</p>` : "")
      + roundHtml
      + (opts ? `<p>${opts}</p>` : "")
      + (agent.phase === "lesson" ? `<p><button type="button" data-by-ev="passed">I passed the station</button> <button type="button" data-by-ev="retry">Read the brief again</button></p>` : "")
      + (["greet", "brief", "apply", "close"].includes(agent.phase) && !(rounds.length && r) ? `<p><button type="button" data-by-ev="${agent.phase === "apply" ? "done" : "go"}">${agent.phase === "apply" ? "Done" : "Next"}</button></p>` : "")
      + `</div>`;
  };
  el.addEventListener("click", (e) => {
    const b = e.target.closest?.("button");
    if (!b) return;
    if (b.dataset.byRound != null) {
      const opt = agent.say().game?.steps?.[play.i]?.options?.[Number(b.dataset.byRound)];
      if (opt?.safe) { play.i++; play.miss = false; } else play.miss = true;
    } else if (b.dataset.byAnswer != null) agent.next({ answer: Number(b.dataset.byAnswer) });
    else if (b.dataset.byEv === "passed") agent.next({ passed: true });
    else if (b.dataset.byEv === "retry") agent.next({ passed: false });
    else if (b.dataset.byEv === "done") agent.next({ done: true });
    else agent.next({});
    render();
  });
  render();
  return { render };
}
