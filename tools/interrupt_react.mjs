/**
 * Prove a station's reaction hooks change the scene, not just the banner.
 *
 * Walks the real procedure to the step each interruption hangs off (so the
 * prerequisite state a room sets in onStepComplete is actually there), fires
 * it, and compares a snapshot of every mesh's visibility and material before,
 * during and after.
 *
 *     node tools/interrupt_react.mjs
 */
import { loadTrades, loadSmartCity } from "./lib/headless.mjs";
import { drivePolicy } from "../WebXR/shared/game.js";

// Material identity, so swapping a lamp's material for a red one registers as
// a change even when the stub's Color has no getHex().
const matIds = new WeakMap();
let nextMatId = 1;
const matId = (m) => {
  if (!m || typeof m !== "object") return "";
  if (!matIds.has(m)) matIds.set(m, nextMatId++);
  return matIds.get(m);
};

function snapshot(root) {
  // Every object, not just meshes: rooms hide a whole group at a time, and a
  // group's own `visible` flag never touches its children's.
  const m = [];
  root.traverse((o) => {
    const mat = o.material;
    m.push(`${o.visible}|${o.position?.x ?? ""},${o.position?.y ?? ""},${o.position?.z ?? ""}|${o.rotation?.x ?? ""},${o.rotation?.y ?? ""},${o.rotation?.z ?? ""}|${o.scale?.x ?? ""},${o.scale?.y ?? ""},${o.scale?.z ?? ""}|${matId(mat)}|${mat?.emissiveIntensity ?? ""}`);
  });
  return m.join(";");
}

// Play the procedure the way the content checkers do, up to `untilStepId`.
function driveTo(session, api, untilStepId) {
  let guard = 0;
  while (session.step && session.step.id !== untilStepId && guard++ < 60) {
    const st = session.step;
    if (st.kind === "select") session.select(st.target);
    else if (st.kind === "sequence" || st.kind === "find") for (const t of st.targets) session.select(t);
    else if (st.kind === "gauge") { const [lo, hi] = st.gauge?.green ?? [0.44, 0.62]; if (session.gauge) session.gauge.t = (lo + hi) / 2; session.select(st.target); }
    else if (st.kind === "hold") { session.setHolding(true); for (let i = 0; i < st.seconds * 20 + 4 && session.step === st; i++) session.tick(0.05); }
    else if (st.kind === "track") { session.setHolding(true); const [lo, hi] = st.track?.green ?? [0.42, 0.62]; session.track = { v: (lo + hi) / 2, green: [lo, hi], rise: 0, fall: 0, drift: 0, wobble: 0, inBand: 0, dropouts: 0, wasIn: true }; for (let i = 0; i < (st.seconds ?? 5) * 20 + 4 && session.step === st; i++) session.tick(0.05); }
    else if (st.kind === "turn") session.rotate(st.target, (st.turn?.turns ?? 1) + 1);
    else if (st.kind === "drag") session.dropAt(st.target, 0);
    else if (st.kind === "drive") { for (let i = 0; i < 8000 && session.step === st; i++) { const a = drivePolicy(session); session.driveInput(a); if (a.check) session.driveCheck(a.check); session.tick(0.05); if (session.activeInterrupt) session.select(session.activeInterrupt.target); } }
    else break;
    // Answer anything that fires on the way, so it does not sit armed.
    if (session.activeInterrupt) session.select(session.activeInterrupt.target);
  }
  return session.step?.id === untilStepId;
}

export async function reactionReport({ quiet = true } = {}) {
let reacting = 0; const silent = [];
const say = (...a) => { if (!quiet) console.log(...a); };
for (const [app, suite] of [["trades", await loadTrades()], ["smartcity", await loadSmartCity()]]) {
  for (const r of suite.ROOMS) {
    for (const it of r.interrupts ?? []) {
      const root = new suite.THREE.Group();
      const api = r.build(root);
      // Wire every hook the apps wire, or the room never applies the state
      // an interruption is supposed to disturb — the lock would not be on the
      // hasp in the first place, and removing it would change nothing.
      const s = new suite.Session(r, {
        onStep: (st) => api.onStep?.(st, s),
        onStepComplete: (st) => api.onStepComplete?.(st, s),
        onFeedback: (fb) => api.onFeedback?.(fb, s),
        onHazard: (id) => api.onHazard?.(id, s),
        onInterrupt: (i) => api.onInterrupt?.(i, s),
        onInterruptEnd: (i) => api.onInterruptEnd?.(i, s),
      });
      s.start();
      if (!driveTo(s, api, it.after)) { say(`  ? ${app}/${r.id}/${it.id}: could not reach step "${it.after}"`); continue; }
      const before = snapshot(root);
      s.tick((it.delay ?? 3) + 0.2);
      if (!s.activeInterrupt) { say(`  ? ${app}/${r.id}/${it.id}: did not fire`); continue; }
      const during = snapshot(root);
      s.select(it.target);
      const after = snapshot(root);
      if (before !== during) {
        reacting += 1;
        say(`  ✓ ${app}/${r.id}/${it.id}: the scene changes when it fires${during !== after ? " and changes back when answered" : ""}`);
      } else {
        silent.push(`${app}/${r.id}/${it.id}`);
      }
    }
  }
}
  return { reacting, silent };
}

// Run directly for the detailed report; check_interrupts.mjs imports it.
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await reactionReport({ quiet: false });
  console.log(`\n${r.reacting} interruption${r.reacting === 1 ? "" : "s"} visibly change the world.`);
  if (r.silent.length) console.log(`${r.silent.length} are banner-only: ${r.silent.join(", ")}`);
}
