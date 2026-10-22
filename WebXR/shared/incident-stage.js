/**
 * The scene half of incident replay: something the learner can see happen.
 *
 * Kept apart from shared/incidents.js on purpose. That module is text and
 * structure only, so the Holodeck prompt parser can call parseIncident()
 * without pulling three.js in behind it; this one builds geometry and is
 * imported by the app that renders. buildReplay() takes it as its `stage`
 * option.
 */
import { group, cyl, ball, mat } from "./kit.js";

/**
 * Give the injected event something to do in the world.
 *
 * A station's own `onInterrupt` dispatches on the literal ids its author
 * wrote (`if (it.id === "spoil-creeping")`), so an event with a new id fires
 * straight past all of them and the learner gets a banner and an unchanged
 * room — the thing tools/interrupt_react.mjs calls a caption rather than
 * something to notice. Reusing an authored id is not available: the authored
 * interruption is still in the list and a replay is not allowed to remove it.
 *
 * So the replay brings its own object. A beacon on a stand goes up at the
 * edge of the pad, dark for the whole run, lit amber for exactly as long as
 * the reported event is live. It is deliberately not the answer and it does
 * not point at the answer — a beacon says something is happening, not what to
 * do about it, which is the same amount of help the report gave the crew.
 */
export function stageReplay(scene, root, interruptId) {
  if (!scene) return scene;
  const stand = group(root, -2.9, 0, -0.4);
  cyl(stand, 0.05, 0.07, 2.0, 0, 1.0, 0, 0x2b3138, { rough: 0.7, metal: 0.4, seg: 10 });
  cyl(stand, 0.26, 0.3, 0.05, 0, 0.025, 0, 0x2b3138, { rough: 0.8, seg: 14 });
  const dark = mat(0x4a3a18, { rough: 0.45 });
  const lit = mat(0xf2a33b, { emissive: 0xf2a33b, ei: 2.2, rough: 0.35 });
  const lamp = ball(stand, 0.11, 0, 2.1, 0, 0x4a3a18, { rough: 0.45, seg: 16 });
  lamp.material = dark;
  cyl(stand, 0.13, 0.13, 0.04, 0, 2.24, 0, 0x2b3138, { rough: 0.7, seg: 14 });

  const priorStart = scene.onInterrupt;
  const priorEnd = scene.onInterruptEnd;
  return {
    ...scene,
    onInterrupt(it) {
      if (typeof priorStart === "function") priorStart.call(scene, it);
      if (it?.id === interruptId) { lamp.material = lit; lamp.scale.setScalar(1.35); }
    },
    onInterruptEnd(it) {
      if (typeof priorEnd === "function") priorEnd.call(scene, it);
      if (it?.id === interruptId) { lamp.material = dark; lamp.scale.setScalar(1); }
    },
  };
}
