// The `?fault=` simulation option: a station declares the faults it can be
// run with, and the URL (or a ladder task) picks one.
//
//     faults: [{
//       id: "yaw-brake-fault",            // what ?fault= names
//       label: "Yaw brake fault",         // shown on the HUD rail
//       note: "…",                        // what the learner walks into
//       step: "<step id>",                // the one step whose answer changes
//       change: { target | targets | itemNames | title | cue | why | … },
//     }]
//
// faultedRoom() returns a copy of the station with that one step rewritten
// (a different correct control, a different set of findings) and
// `activeFault` set; the station's build() handed-back `onFault(id)` then
// changes the scene to match — a lamp lit, a mesh moved or shown. A fault
// the station does not declare is ignored, so a shared link never breaks a
// station. docs/districts.md lists every declared fault; check_districts
// asserts each one changes both the scene and its step's answer.

/** The fault the query names, or null. */
export function faultFromQuery(search = "") {
  const v = new URLSearchParams(search).get("fault");
  return v && /^[a-z0-9-]{2,48}$/.test(v) ? v : null;
}

/** The station's own declaration of fault `id`, or null. */
export function faultFor(room, id) {
  if (!id || !Array.isArray(room?.faults)) return null;
  return room.faults.find((f) => f.id === id) ?? null;
}

/** A copy of `room` run with fault `id`: one step's answer rewritten. */
export function faultedRoom(room, id) {
  const f = faultFor(room, id);
  if (!f || !Array.isArray(room.steps)) return room;
  const steps = room.steps.map((s) => (s.id === f.step ? { ...s, ...f.change, faulted: f.id } : s));
  return { ...room, steps, activeFault: f.id, faultLabel: f.label, faultNote: f.note };
}

/** The answer a step expects, as one comparable string. */
export function faultAnswer(step) {
  if (!step) return "";
  return JSON.stringify([step.target ?? null, step.targets ?? null, step.drag?.to ?? null, step.gauge?.green ?? null]);
}
