// The guide's emotional intelligence: what it says when a learner strikes a
// hazard, misses an interruption, answers one wrong, or finishes a run — and
// the check-in it offers at the end.
//
// The engine already scores. This layer decides the tone of what is said
// around the score, and it follows the rules a good peer-support trainer
// follows: name what happened in one plain sentence, say what to do next,
// never blame, never minimise, and after a hard run ask how the person is
// and point at the real support line. Every line is short enough to be
// spoken by the voice assist without covering the next step.
//
// A first responder who just missed a Mayday in a simulation does not need
// "Unsafe action detected". They need "You missed the Mayday while the line
// was stretched. Next time, the radio wins. Reset and go again." The same is
// true of an apprentice who touched a live bus.

const EI_HAZARD = [
  "That one would have hurt someone. Take a breath, look at what you reached for, and go again from the step.",
  "Stop there. That is the reach the procedure exists to prevent. The step is still open — take it the right way.",
  "That is an unsafe action, and it is why we practise here and not on the job. Reset your hands and finish the step.",
];
const EI_HAZARD_AGAIN = [
  "Twice on the same thing. That usually means the setup is wrong, not the hands — look at where you are standing before the next move.",
  "Same trap again. Slow down: read the cue, find the control, then act. There is no clock on this that matters more than the order.",
];
const EI_MISSED = [
  "You missed it — the {kind} came while your hands were busy, which is exactly when it comes on the job. Next time the alarm wins.",
  "That {kind} went unanswered. Nobody notices the first one; the training is so you notice the second.",
];
const EI_WRONG = [
  "You answered the {kind}, but with the wrong control. The right one is separate from what you were holding — that separation is the lesson.",
  "Right instinct, wrong control. Look for the one that is not the thing in your hands.",
];
const EI_FINISH_CLEAN = [
  "Clean run. You caught every interruption and touched nothing you should not have. That is the standard — keep it.",
];
const EI_FINISH_ROUGH = [
  "Finished, with some unsafe actions on the sheet. That is what the sheet is for. Read the debrief before you run it again.",
];

const eiPick = (list, idx) => list[Math.abs(idx || 0) % list.length];

/** The guide's line for a moment. `ctx.kind` names the interruption kind
 *  ("alarm", "person in the wrong place"); `ctx.count` how many hazards so
 *  far this run; `ctx.clean` for a finish. */
export function eiLine(moment, ctx = {}) {
  const kind = ctx.kind || "interruption";
  switch (moment) {
    case "hazard": return (ctx.count ?? 1) >= 2 ? eiPick(EI_HAZARD_AGAIN, ctx.count) : eiPick(EI_HAZARD, ctx.seed ?? 0);
    case "missed": return eiPick(EI_MISSED, ctx.seed ?? 0).replace("{kind}", kind);
    case "wrong": return eiPick(EI_WRONG, ctx.seed ?? 0).replace("{kind}", kind);
    case "finish": return ctx.clean ? EI_FINISH_CLEAN[0] : EI_FINISH_ROUGH[0];
    default: return "";
  }
}

/** The end-of-run check-in. Three answers, none scored, one supportive line
 *  each; a hard run (hazards or missed interruptions) adds the support
 *  pointer. The department's or local's own line goes in `supportLine`. */
export const CHECKIN_OPTIONS = [
  { id: "steady", label: "Steady", reply: "Good. Take the debrief with you." },
  { id: "shaken", label: "A bit shaken", reply: "That is a normal reaction to a run that felt real. Give it a minute before the next one." },
  { id: "minute", label: "Need a minute", reply: "Take it. The station will be here. If it stays with you, say so to someone — that is what peer support is for." },
];

export function checkInPrompt({ rough = false, supportLine = "your local's peer-support team or EAP line" } = {}) {
  return rough
    ? `How are you doing after that one? There is no score on this question. If it stayed with you, ${supportLine} is the right call, and there is no penalty for making it.`
    : "How are you doing after that run? There is no score on this question.";
}

const EI_KEY = "smartcitix-checkins-v1";
/** Record a check-in in the learner's own browser only (never transmitted). */
export function recordCheckIn(entry) {
  try {
    const list = JSON.parse(localStorage.getItem(EI_KEY) || "[]");
    list.push({ ...entry, at: new Date().toISOString() });
    localStorage.setItem(EI_KEY, JSON.stringify(list.slice(-200)));
    return true;
  } catch { return false; }
}
export function checkIns() { try { return JSON.parse(localStorage.getItem(EI_KEY) || "[]"); } catch { return []; } }
