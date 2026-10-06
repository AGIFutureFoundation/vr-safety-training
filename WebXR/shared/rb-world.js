// ROBOTICS — robotics sites in the parish-engine maps and the robotics side
// games (docs/consoles/ROBOTICS.md, docs/robot-training.md).
//
// Sites (rb-robotics-data.js RB_SITES): beside an existing map site, one
// procedural rig — an AMR on a loop, a cobot arm cycling, a gantry traversing,
// a fenced robot cell — that runs at full speed, slows inside the warning
// zone and holds a protective stop inside the stop zone as the player nears
// (rb-env.js rbSsmMode, the same rule the cell-entry scenario trains). An
// e-stop post the player can test, a lockout point at the gate, and a restart
// from outside, scored on safe practice (RB_SITE_PRACTICES, out of 100).
// Robots always stop for people: walking in without a lockout costs points
// and the robot simply holds its stop.
//
// Games: the three robotics games play in the shared side-game panel
// (side-game-mechanics.js shapes: board, prompt, one safe move) — their
// boards are drawn from an rbEnv run of the same scenario, so the game and
// the training interface teach one thing. They register into QM_MECHANICS
// by key (items name `mechanic` explicitly; nothing matches by title), so the
// twelve family mechanics and their matching are untouched.
//
// Budget: at most RB_MESHES_PER_SITE meshes per site (phone tier: the rig and
// the post only); no per-frame allocation. Names prefixed `rb`/`RB_`.

import { RB_SITES, RB_SITE_PRACTICES, RB_SSM, RB_SCENARIOS, RB_FORCE_N } from "./rb-robotics-data.js";
import { rbSsmMode, rbEnv, rbPolicy } from "./rb-env.js";
import { npHeightAt } from "./np-parish.js";
import { QM_MECHANICS } from "./side-game-mechanics.js";
import { avSpriteSvg, avRobotLook } from "./av-sprites.js";

export const RB_MESHES_PER_SITE = 8;

/** This map's robotics sites, resolved to world positions (x, z) beside their anchors. */
export function rbSitesFor(parish) {
  if (!parish) return [];
  return RB_SITES.filter((s) => s.parish === parish.id).map((s) => {
    const a = (parish.sites ?? []).find((x) => x.id === s.anchor);
    if (!a) return null;
    return { ...s, anchorName: a.name, position: [a.position[0] + s.offset[0], a.position[1] + s.offset[1]] };
  }).filter(Boolean);
}

// ------------------------------------------------------------------ games

const rbHashId = (s) => { let h = 5; for (const ch of String(s)) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
const rbStepOf = (id, i, board, prompt, safe, unsafe) => {
  const flip = ((rbHashId(id) >> (i + 3)) & 1) === 1;
  const a = { text: safe, safe: true }, b = { text: unsafe, safe: false };
  return { board, prompt, options: flip ? [b, a] : [a, b] };
};
const rbWord = (n) => ["no", "one", "two", "three", "four", "five", "six"][n] ?? "several";

/** The robotics games as side-game mechanics. Each build() reads an rbEnv run
 * of its scenario (seeded by the item id) for the board. No digits in the text. */
export const RB_GAME_MECHANICS = {
  "rb-teleop-pick-place": {
    name: "Teleop pick-and-place", blurb: "Grip each part within its limit and keep the gripper clear of your teammate.", match: /(?!)/,
    build(item) {
      const env = rbEnv("rb-teleop-pick-place", { seed: rbHashId(item.id) % 997 + 1 });
      const o = env.observe(), cls = o.part?.maxForce === "light" ? "light-touch" : "firm-grip";
      return [
        rbStepOf(item.id, 0, ["  bench: [bin] ···· gripper ···· [fixture]", `  next part: marked ${cls}`, `  parts left: ${rbWord(o.remaining)}`],
          "The gripper is over the part. How do you grip it?", `Grip within the part's ${cls} limit — just enough to hold it.`, "Grip at full strength so it cannot slip."),
        rbStepOf(item.id, 1, ["  bench: [bin] ···· teammate ···· [fixture]", "  your teammate is working beside the straight path"],
          "You are carrying the part to the fixture. Which way?", "Route the gripper round the far side, clear of your teammate's space.", "Go straight across; the robot will stop if it gets close."),
        rbStepOf(item.id, 2, ["  gripper over the fixture, part held"],
          "Placing the part.", "Lower it onto the fixture slowly and release once it is seated.", "Release from above and let it drop into place."),
      ];
    },
  },
  "rb-amr-fleet-routing": {
    name: "AMR fleet routing", blurb: "Send each robot to its drop-off without two robots claiming one spot, and hold at the walkway.", match: /(?!)/,
    build(item) {
      const env = rbEnv("rb-amr-fleet-routing", { seed: rbHashId(item.id) % 997 + 1 });
      const o = env.observe(), n = o.robots.length;
      return [
        rbStepOf(item.id, 0, ["  aisle: [robot one] → → | walkway | → → [drop-off]", "  a person is crossing the walkway"],
          "Robot one reaches the walkway edge.", "Hold robot one at the edge until the crossing is clear.", "Send it through; it will slow down near the person."),
        rbStepOf(item.id, 1, ["  cross-aisle: [robot two] →  [ ]  ← [robot three]", "  both robots are routed to the same spot"],
          "Two robots want the same cell next.", "Give one the right of way and hold the other for a moment.", "Send both and let their scanners sort it out."),
        rbStepOf(item.id, 2, [`  fleet: ${rbWord(n)} robots`, "  one robot has left its marked lane"],
          "A robot is outside its lane.", "Press the fleet stop, walk the lane with the lead, then resume.", "Walk over and push it back into the lane while it is live."),
      ];
    },
  },
  "rb-cobot-zone-setup": {
    name: "Cobot safety-zone setup", blurb: "Size the stop zone for the robot's speed, test the scanner and the e-stop, then commit.", match: /(?!)/,
    build(item) {
      return [
        rbStepOf(item.id, 0, ["  cobot cell: [arm] ( stop ) (( warning ))", "  stop time: not measured yet"],
          "Before you set the zones.", "Measure how long the arm takes to stop, then size the zones from it.", "Use last month's zone sizes; the arm has not changed."),
        rbStepOf(item.id, 1, ["  speed raised for a faster cycle"],
          "The lead asks for a faster arm speed.", "Grow the stop zone to match the faster speed before running it.", "Keep the zones as they are; the arm slows near people anyway."),
        rbStepOf(item.id, 2, ["  zones set · scanner ✓? · e-stop ✓?"],
          "Ready to commit the setup.", "Test the area scanner and the e-stop, then commit.", "Commit now and test at the next shift change."),
      ];
    },
  },
};

/** Put the robotics games into the shared mechanics table by key (idempotent). */
export function rbRegisterMechanics(table = QM_MECHANICS) {
  for (const [k, m] of Object.entries(RB_GAME_MECHANICS)) if (table && !table[k]) table[k] = m;
  return Object.keys(RB_GAME_MECHANICS);
}

/** The robotics side games on this map: one per site, gated on its station. */
export function rbGamesFor(parish) {
  return rbSitesFor(parish).filter((s) => RB_GAME_MECHANICS[s.scenario] || s.scenario === "rb-cell-entry").map((s) => {
    const mech = RB_GAME_MECHANICS[s.scenario] ? s.scenario : "rb-cobot-zone-setup";
    const sc = RB_SCENARIOS.find((x) => x.id === mech);
    return {
      id: `rb-${parish.id}-${s.id.replace(/^rb-site-/, "")}`, world: "parishes", kind: "side-game", parish: parish.id,
      site: s.anchor, siteName: s.anchorName, title: sc.name, task: sc.name.toLowerCase(), mechanic: mech,
      gate: { stations: [s.station], note: "The station first — then run the robots here." },
      practices: ["plan", "stopwork"], reward: { cosmetic: "robotics crew badge" }, summary: sc.blurb,
    };
  });
}

// ------------------------------------------------------------ site scoring

/** A fresh site-visit state. */
export function rbSiteState() { return { mode: "full", estopped: false, locked: false, earned: {}, missed: {}, tested: false }; }

/**
 * One site-visit event → the new state and a calm note. Events: "near"
 * (with distance), "test-estop", "press-estop", "lockout", "enter",
 * "restart". Pure, so the checker scores a visit headlessly.
 */
export function rbSiteEvent(st, ev, distance = Infinity) {
  const s = { ...st, earned: { ...st.earned }, missed: { ...st.missed } };
  let note = null;
  if (ev === "near") {
    const m = s.estopped || s.locked ? { mode: "stop" } : rbSsmMode(distance);
    if (m.mode === "reduced" && s.mode === "full" && !s.earned.slowed) { s.earned.slowed = true; note = "The robot slowed as you came into its warning zone."; }
    if (m.mode === "stop" && s.mode !== "stop" && !s.estopped && !s.locked) note = "The robot is holding a stop while you are close.";
    s.mode = m.mode;
  } else if (ev === "test-estop") { s.tested = true; s.earned["estop-test"] = true; note = "E-stop tested: pressed, the robot stopped, reset."; }
  else if (ev === "press-estop") { s.estopped = true; s.mode = "stop"; note = "E-stop pressed. The robot is stopped."; }
  else if (ev === "lockout") {
    if (!s.estopped) note = "Stop the robot with the e-stop first, then lock out.";
    else { s.locked = true; s.earned.lockout = true; note = "Your lock is on the gate. The cell is safe to enter."; }
  } else if (ev === "enter") {
    if (!s.locked) { s.missed["enter-live-cell"] = true; note = "The robot held its stop for you. Next time, lock out at the gate before going in."; }
    else note = "Inside with your lock on — clear the jam, then step out.";
  } else if (ev === "restart") {
    if (!s.locked && !s.estopped) note = "It is already running.";
    else { s.locked = false; s.estopped = false; s.mode = "full"; s.earned.restart = true; note = "Lock removed and the cell restarted from outside."; }
  }
  return { state: s, note };
}

/** Safe-practice score for a visit, out of 100 (a live-cell entry takes off a lockout's worth). */
export function rbSiteScore(st) {
  let n = 0;
  for (const p of RB_SITE_PRACTICES) if (st.earned[p.id]) n += p.points;
  if (st.missed["enter-live-cell"]) n -= 30;
  if (st.earned.restart && !st.tested) n -= 10;
  return Math.max(0, Math.min(100, n));
}

// ---------------------------------------------------------------- the rigs

/** The rig types a site may declare (RB_SITES[].rig). Each draws its own
 * shape and moves its own way; tools/check_robotics.mjs fails if two types
 * draw identically or if a site's declared type is not the one drawn. */
export const RB_RIG_TYPES = ["cobot", "amr", "gantry", "cell"];

/** Draw a site's rig into `g` as a group named `rb-rig-<kind>`; returns the
 * group. Meshes (balanced / phone): cobot 3 / 2, amr 3 / 1, gantry 4 / 1,
 * cell 3 / 2 plus the fence on `g` (balanced only). With the pad, two zone
 * rings and the e-stop post every site stays within RB_MESHES_PER_SITE, and
 * the phone tier within three. An unknown kind throws, so a typo in RB_SITES
 * can never fall back to a look-alike arm. */
export function rbDrawRig(T, g, kind, lean, add, mat) {
  if (!RB_RIG_TYPES.includes(kind)) throw new Error(`rb-world: unknown rig type "${kind}"`);
  const rig = new T.Group(); rig.name = `rb-rig-${kind}`; rig.userData.rbRig = kind; g.add(rig);
  if (kind === "amr") {
    // A low orange carrier box driving a loop, with a scanner puck and a blue deck.
    add(rig, new T.BoxGeometry(1.2, 0.45, 0.8), mat(0xf2a33a), 0, 0.3, 0, "rb-amr");
    if (!lean) {
      add(rig, new T.CylinderGeometry(0.14, 0.14, 0.12, 12), mat(0x22272d), 0.42, 0.59, 0, "rb-amr-scanner");
      add(rig, new T.BoxGeometry(0.9, 0.06, 0.6), mat(0x3a8fd8), -0.1, 0.56, 0, "rb-amr-deck");
    }
  } else if (kind === "gantry") {
    // A yellow bridge on two legs traversing the yard, with a trolley under the beam.
    add(rig, new T.BoxGeometry(12, 0.5, 0.6), mat(0xe0c341), 0, 5, 0, "rb-gantry-beam");
    if (!lean) {
      add(rig, new T.BoxGeometry(0.4, 5, 0.4), mat(0x6b7178), -6, 2.5, 0, "rb-gantry-leg");
      add(rig, new T.BoxGeometry(0.4, 5, 0.4), mat(0x6b7178), 6, 2.5, 0, "rb-gantry-leg");
      add(rig, new T.BoxGeometry(1.2, 0.8, 1), mat(0x3d4650), 0, 4.35, 0, "rb-gantry-trolley");
    }
  } else if (kind === "cobot") {
    // A small white collaborative arm on a pedestal, with a blue tool flange.
    add(rig, new T.CylinderGeometry(0.35, 0.45, 0.8, 12), mat(0x5d6a78), 0, 0.4, 0, "rb-arm-base");
    const arm = add(rig, new T.BoxGeometry(0.25, 0.25, 1.6), mat(0xf0f0f0), 0, 1, 0.8, "rb-arm"); arm.userData.pivot = true;
    if (!lean) add(rig, new T.CylinderGeometry(0.12, 0.12, 0.3, 10), mat(0x3a8fd8), 0, 1, 1.65, "rb-arm-tool");
  } else {
    // A heavier orange industrial arm on a block base, inside a see-through fence with a gate.
    add(rig, new T.BoxGeometry(1.1, 1, 1.1), mat(0x4a5058), 0, 0.5, 0, "rb-cell-base");
    const arm = add(rig, new T.BoxGeometry(0.45, 0.45, 1.8), mat(0xe2701f), 0, 1.4, 0.9, "rb-cell-arm"); arm.userData.pivot = true;
    if (!lean) {
      add(rig, new T.BoxGeometry(0.6, 0.35, 0.3), mat(0x2e3338), 0, 1.4, 1.75, "rb-cell-tool");
      const fence = add(g, new T.BoxGeometry(RB_SSM.stop * 2 - 1, 1.8, RB_SSM.stop * 2 - 1), mat(0xe8d34a, { transparent: true, opacity: 0.25 }), 0, 0.9, 0, "rb-cell-fence"); fence.userData.gate = true;
    }
  }
  return rig;
}

/** Pose a rig for its phase (no allocation): the AMR drives an ellipse, the
 * gantry traverses back and forth, the arms sweep about their bases. */
export function rbPoseRig(rig, kind, phase) {
  if (kind === "amr") { rig.position.set(Math.cos(phase) * 5, 0, Math.sin(phase) * 3.5); rig.rotation.y = -phase; }
  else if (kind === "gantry") rig.position.z = Math.sin(phase) * 4;
  else if (kind === "cell") rig.rotation.y = Math.sin(phase * 0.8) * 1.6;
  else rig.rotation.y = Math.sin(phase) * 1.2;
}

// --------------------------------------------------------------- the mount

/**
 * Mount this map's robotics sites. Returns { sites, animate(dt, x, z), act(siteId, ev), state(siteId), score(siteId), meshes }.
 * `three` and `root` are optional (a headless checker counts meshes with a stub).
 */
export function rbMountRobotics({ three = null, root = null, parish, el = null, tier = "balanced", reducedMotion = false, toast = null, stationHref = null } = {}) {
  rbRegisterMechanics();
  const T = three, lean = tier === "low";
  // `rig` stays the site's declared type (RB_SITES[].rig); the drawn group lives in `node`.
  // (It used to be overwritten with `rig: null` here, so every site drew the same arm.)
  const sites = rbSitesFor(parish).map((s) => ({ ...s, y: Math.max(0, npHeightAt(parish, s.position[0], s.position[1])), st: rbSiteState(), phase: 0, node: null }));
  let meshes = 0;
  const mat = (c, o = {}) => new T.MeshLambertMaterial({ color: c, ...o });
  const add = (parent, geo, m, x, y, z, name) => { const mesh = new T.Mesh(geo, m); mesh.position.set(x, y, z); mesh.name = name; parent.add(mesh); meshes += 1; return mesh; };
  if (T && root) for (const s of sites) {
    const g = new T.Group(); g.name = s.id; g.position.set(s.position[0], s.y, s.position[1]); root.add(g);
    if (!lean) {
      add(g, new T.BoxGeometry(16, 0.08, 12), mat(0x8d949b), 0, 0.04, 0, "rb-pad");
      const warn = add(g, new T.RingGeometry(RB_SSM.warn - 0.15, RB_SSM.warn, 40), mat(0xe8b923, { side: 2 }), 0, 0.1, 0, "rb-zone-warn"); warn.rotation.x = -Math.PI / 2;
      const stop = add(g, new T.RingGeometry(RB_SSM.stop - 0.15, RB_SSM.stop, 32), mat(0xd8452a, { side: 2 }), 0, 0.11, 0, "rb-zone-stop"); stop.rotation.x = -Math.PI / 2;
    }
    const post = add(g, new T.CylinderGeometry(0.12, 0.12, 1.2, 10), mat(0xd8322a), RB_SSM.warn + 1, 0.6, 0, "rb-estop");
    post.userData.rbSite = s.id;
    s.node = rbDrawRig(T, g, s.rig, lean, add, mat);
  }

  const note = (t) => { if (t) toast?.(t, 3200); };
  function act(siteId, ev, distance) {
    const s = sites.find((x) => x.id === siteId); if (!s) return null;
    const r = rbSiteEvent(s.st, ev, distance); s.st = r.state; if (ev !== "near") note(r.note); else if (r.note) note(r.note);
    renderPanel();
    return r;
  }
  function animate(dt, px = Infinity, pz = Infinity) {
    for (const s of sites) {
      const d = Math.hypot(px - s.position[0], pz - s.position[1]);
      if (d < RB_SSM.warn * 3) {
        const before = s.st.mode;
        const r = rbSiteEvent(s.st, "near", d); s.st = r.state;
        if (r.note && before !== s.st.mode) note(r.note);
        if (d < RB_SSM.stop - 0.5 && !s.st.missed["enter-live-cell"] && !s.st.locked) act(s.id, "enter");
      }
      const speed = s.st.estopped || s.st.locked ? 0 : rbSsmMode(d).speed;
      if (!reducedMotion) s.phase += dt * speed * 0.6;
      if (s.node) rbPoseRig(s.node, s.rig, s.phase);
    }
  }

  function renderPanel() {
    if (!el || typeof document === "undefined") return;
    let box = document.getElementById("rb-robotics");
    if (!box) { box = document.createElement("div"); box.id = "rb-robotics"; el.parentNode?.insertBefore(box, el.nextSibling); }
    if (!sites.length) { box.textContent = ""; return; }
    const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    box.innerHTML = `<p class="eyebrow" style="margin-top:16px">Robotics sites on this map · ${sites.length}</p>` + sites.map((s) => {
      const href = stationHref?.(s.station, s.anchor);
      const face = avSpriteSvg(avRobotLook(s.rig === "cobot" ? "cobot" : s.rig === "cell" ? "cell" : s.rig === "gantry" ? "gantry" : "amr"), { kind: "token", size: 28, title: `${s.rig} robot` });
      return `<div class="rb-site" data-rb="${esc(s.id)}"><p><span class="rb-face" style="display:inline-flex;vertical-align:middle;margin-right:6px">${face}</span><b>${esc(s.name)}</b> — beside ${esc(s.anchorName)} · robot ${esc(s.st.locked ? "locked out" : s.st.estopped ? "stopped" : s.st.mode === "full" ? "running" : s.st.mode === "reduced" ? "slowed" : "holding a stop")} · safe practice ${rbSiteScore(s.st)}/100${href ? ` · <a href="${esc(href)}">station</a>` : ""}</p>` +
        `<div class="row" style="flex-wrap:wrap">${[["test-estop", "Test the e-stop"], ["press-estop", "Press the e-stop"], ["lockout", "Lock out at the gate"], ["restart", "Remove lock and restart"]].map(([k, t]) => `<button type="button" class="btn" data-rb-ev="${k}">${t}</button>`).join("")}</div></div>`;
    }).join("");
    for (const b of box.querySelectorAll("[data-rb-ev]")) b.addEventListener("click", () => act(b.closest("[data-rb]").getAttribute("data-rb"), b.getAttribute("data-rb-ev")));
  }
  renderPanel();

  return {
    sites: sites.map((s) => ({ id: s.id, rig: s.rig, node: s.node?.name ?? null, position: s.position, y: s.y, scenario: s.scenario, station: s.station })),
    meshes, animate, act,
    state: (id) => sites.find((s) => s.id === id)?.st ?? null,
    score: (id) => { const s = sites.find((x) => x.id === id); return s ? rbSiteScore(s.st) : null; },
    games: () => rbGamesFor(parish),
    demo: (id) => { const e = rbEnv(sites.find((s) => s.id === id)?.scenario ?? "rb-cell-entry"); const pol = rbPolicy(e); let o = e.observe(), r; do { r = e.step(pol(o)); o = r.observation; } while (!r.done); return e.summary(); },
    forceLimits: RB_FORCE_N,
  };
}
