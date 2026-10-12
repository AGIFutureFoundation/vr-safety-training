// The side-game stage: a mechanic's board drawn in the world rather than in
// the panel dialog (docs/skill-gates.md, QUESTMASTER-3). The mechanics in
// side-game-mechanics.js stay pure step generators; this module renders each
// step's board with meshes at the item's place in a world — the lift
// sequencer's marked loads, hook, landing pad and crew figures over Bay
// World's rigging quay; the line follow's knots as lights along the Deep's
// night line; the traffic zone's signs, cone taper and spotter on Fairway's
// cart path — and a small HUD strip carries the prompt and the two moves.
//
// The run is a pure state machine (qmStageRun) over qmPlaySteps, the same
// list the panel plays, so the world's score is the panel's score by
// construction, and both end in qmFinishGame.
//
// The 3D library is taken from the caller as `lib` (the bundler gives a page
// the library only when a module spells its usual name; a shared module must
// not). Names prefixed `qm`/`QM_` (the bundler shares one scope).

import { qmPlaySteps, qmMechanicFor, QM_MECHANICS } from "./side-game-mechanics.js";
import { qmRounds } from "./side-games-data.js";
import { qmFinishGame } from "./skill-gates.js";

/** The stage's palette: done, current, later, unsafe-side, crew, path. */
export const QM_STAGE_COLORS = { done: 0x8fe3a1, now: 0xffb44d, later: 0x7a8794, cone: 0xff7a1a, sign: 0xffd400, crew: 0x3a6ea5, skin: 0xd8b090, path: 0x3b3f44, light: 0xfff2b0, water: 0x1f6f8a };

function qmMat(lib, color, extra = {}) { return new lib.MeshStandardMaterial({ color, roughness: 0.8, ...extra }); }
function qmBox(lib, w, h, d, color, extra) { return new lib.Mesh(new lib.BoxGeometry(w, h, d), qmMat(lib, color, extra)); }
function qmCyl(lib, rt, rb, h, color, extra, seg = 10) { return new lib.Mesh(new lib.CylinderGeometry(rt, rb, h, seg), qmMat(lib, color, extra)); }
function qmBall(lib, r, color, extra) { return new lib.Mesh(new lib.SphereGeometry(r, 10, 8), qmMat(lib, color, extra)); }
/** A small person: legs, torso, head. `facing` turns them toward the work. */
function qmFigure(lib, body = QM_STAGE_COLORS.crew) {
  const g = new lib.Group();
  const legs = qmCyl(lib, 0.14, 0.12, 0.7, 0x2a2f36); legs.position.y = 0.35;
  const torso = qmCyl(lib, 0.2, 0.18, 0.6, body); torso.position.y = 1.0;
  const head = qmBall(lib, 0.13, QM_STAGE_COLORS.skin); head.position.y = 1.45;
  const hat = qmCyl(lib, 0.14, 0.14, 0.08, QM_STAGE_COLORS.sign); hat.position.y = 1.55;
  g.add(legs, torso, head, hat);
  return g;
}
/** State colour for element k when the step is i: done, current, later. */
function qmStateColor(k, i) { return k < i ? QM_STAGE_COLORS.done : k === i ? QM_STAGE_COLORS.now : QM_STAGE_COLORS.later; }
function qmGlow(k, i) { return k === i ? { emissive: QM_STAGE_COLORS.now, emissiveIntensity: 0.6 } : {}; }

/**
 * The 3D builders, one per mechanic that has a place in a world, plus the
 * marker row every other mechanic falls back to. Each: `(lib, step, i) ->
 * Group`, laid out around the origin, ground at y = 0, facing +z.
 */
export const QM_STAGE_BUILDERS = {
  /** Three marked loads in a row, the hook over the current pick, the landing pad ahead, the crew on the walkway the board names. */
  "lift-sequencer"(lib, step, i) {
    const g = new lib.Group();
    const side = /the (east|west) walkway/.exec(step.board.join(" "))?.[1] ?? "east";
    for (let k = 0; k < 3; k++) {
      const load = qmBox(lib, 1.2, 0.8, 1.0, qmStateColor(k, i), qmGlow(k, i));
      load.position.set((k - 1) * 2.2, 0.4, -3);
      g.add(load);
      const mark = qmCyl(lib, 0.18, 0.18, 0.05, 0xffffff); mark.position.set((k - 1) * 2.2, 0.83, -3); g.add(mark);
    }
    // The hook: a post, a boom, a hanging line and the hook itself over the current load.
    const post = qmCyl(lib, 0.12, 0.14, 5, 0x9aa3ad); post.position.set(-4, 2.5, -1); g.add(post);
    const boom = qmBox(lib, 8, 0.16, 0.16, 0x9aa3ad); boom.position.set(0, 5, -3); g.add(boom);
    const drop = qmCyl(lib, 0.03, 0.03, 3.4, 0x333333); drop.position.set((i - 1) * 2.2, 3.3, -3); g.add(drop);
    const hook = new lib.Mesh(new lib.TorusGeometry(0.22, 0.05, 6, 12), qmMat(lib, QM_STAGE_COLORS.now, { emissive: QM_STAGE_COLORS.now, emissiveIntensity: 0.5 }));
    hook.position.set((i - 1) * 2.2, 1.5, -3); g.add(hook);
    // The landing pad, and the walkway with the crew on the side the board names.
    const pad = qmCyl(lib, 1.3, 1.3, 0.08, 0x556270, {}, 16); pad.position.set(0, 0.04, 3); g.add(pad);
    const walkX = side === "east" ? 3.6 : -3.6;
    const walk = qmBox(lib, 1.4, 0.06, 8, QM_STAGE_COLORS.sign); walk.position.set(walkX, 0.03, 0); g.add(walk);
    for (let n = 0; n < 2; n++) { const f = qmFigure(lib); f.position.set(walkX + (n ? 0.5 : -0.4), 0, n * 1.6 - 0.8); f.rotation.y = side === "east" ? -Math.PI / 2 : Math.PI / 2; g.add(f); }
    // The safe swing path: a dashed arc of markers the long way round, away from the walkway.
    for (let n = 0; n < 6; n++) {
      const a = Math.PI * (n + 0.5) / 6, r = 3.2;
      const dot = qmBall(lib, 0.09, QM_STAGE_COLORS.done, { emissive: QM_STAGE_COLORS.done, emissiveIntensity: 0.4 });
      dot.position.set(-Math.sign(walkX) * Math.abs(Math.cos(a)) * r, 1.6, -3 + (1 - Math.cos(a)) * 3);
      g.add(dot);
    }
    return g;
  },
  /** The line out from the site with three knots as lights, the current one bright, the buddy a body length behind the diver's place. */
  "line-follow"(lib, step, i) {
    const g = new lib.Group();
    const line = qmCyl(lib, 0.025, 0.025, 9, 0xf2f2e0, {}, 6); line.rotation.x = Math.PI / 2; line.position.set(0, 0.6, 0); g.add(line);
    const reel = qmCyl(lib, 0.25, 0.25, 0.2, 0x9aa3ad, {}, 12); reel.rotation.x = Math.PI / 2; reel.position.set(0, 0.6, -4.5); g.add(reel);
    for (let k = 0; k < 3; k++) {
      const z = -2.5 + k * 2.5;
      const knot = qmBall(lib, k === i ? 0.22 : 0.15, qmStateColor(k, i), { emissive: qmStateColor(k, i), emissiveIntensity: k === i ? 1.2 : 0.5 });
      knot.position.set(0, 0.6, z); g.add(knot);
      if (k === i && lib.PointLight) { const l = new lib.PointLight(QM_STAGE_COLORS.light, 1.2, 6); l.position.set(0, 0.8, z); g.add(l); }
      const tag = qmBox(lib, 0.3, 0.18, 0.02, 0xffffff); tag.position.set(0.35, 0.6, z); g.add(tag);
    }
    // The buddy: a small figure lying along the line behind the current knot, lamp lit.
    const buddy = qmCyl(lib, 0.2, 0.2, 0.8, 0x3a5a2a, {}, 8); buddy.rotation.x = Math.PI / 2; buddy.position.set(-0.7, 0.5, -2.5 + i * 2.5 - 1.6); g.add(buddy);
    const lamp = qmBall(lib, 0.08, QM_STAGE_COLORS.light, { emissive: QM_STAGE_COLORS.light, emissiveIntensity: 1 }); lamp.position.set(-0.7, 0.6, -2.5 + i * 2.5 - 1.1); g.add(lamp);
    // Silt drifting in on the middle knot's step: a dim haze.
    if (i === 1) { const haze = qmBall(lib, 1.4, 0x6b7a66, { transparent: true, opacity: 0.25 }); haze.position.set(0, 0.6, 0); g.add(haze); }
    return g;
  },
  /** The cart path beside live traffic: advance signs upstream, the cone taper toward the work, the spotter at the work, each placed once its step is done and ghosted while it is the next step. */
  "traffic-zone"(lib, step, i) {
    const g = new lib.Group();
    const path = qmBox(lib, 3, 0.05, 14, QM_STAGE_COLORS.path); path.position.set(0, 0.02, 0); g.add(path);
    const work = qmBox(lib, 1.6, 0.5, 1.2, 0x6b4a2a); work.position.set(0.6, 0.25, 5); g.add(work); // the fallen limb pile
    const ghost = (k) => (k === i ? { transparent: true, opacity: 0.35 } : {});
    const place = (k) => k <= i;
    if (place(0)) for (let n = 0; n < 2; n++) {
      const post = qmCyl(lib, 0.04, 0.04, 1.4, 0x9aa3ad, ghost(0), 6); post.position.set(-1.9, 0.7, -6.5 + n * 1.8); g.add(post);
      const board = qmBox(lib, 0.8, 0.8, 0.04, qmStateColor(0, i), { ...ghost(0), ...qmGlow(0, i) }); board.rotation.z = Math.PI / 4; board.position.set(-1.9, 1.7, -6.5 + n * 1.8); g.add(board);
    }
    if (place(1)) for (let n = 0; n < 6; n++) {
      const cone = qmCyl(lib, 0.03, 0.18, 0.55, n === 5 && i === 1 ? QM_STAGE_COLORS.now : QM_STAGE_COLORS.cone, ghost(1), 8);
      cone.position.set(-1.4 + n * 0.32, 0.28, -3.5 + n * 1.2); g.add(cone);
    }
    if (place(2)) { const spotter = qmFigure(lib, 0xff7a1a); spotter.position.set(-1.6, 0, 3.5); spotter.rotation.y = Math.PI; g.add(spotter); const horn = qmBall(lib, 0.08, 0xff2a2a, { emissive: 0xff2a2a, emissiveIntensity: i === 2 ? 1 : 0.3 }); horn.position.set(-1.3, 1.1, 3.4); g.add(horn); }
    // Live traffic beside the path: two carts held back at the upstream end.
    for (let n = 0; n < 2; n++) { const cart = qmBox(lib, 1.0, 0.7, 1.6, n ? 0xe8e8e8 : 0x4a7bd0); cart.position.set(2.6, 0.4, -8 - n * 2.2); g.add(cart); }
    return g;
  },
  /** Every other mechanic: a row of markers with the current step raised and lit. */
  markers(lib, step, i) {
    const g = new lib.Group();
    const n = Math.max(3, step.board?.length ?? 3);
    for (let k = 0; k < 3; k++) {
      const m = qmCyl(lib, 0.35, 0.4, k === i ? 0.9 : 0.5, qmStateColor(k, i), qmGlow(k, i), 12);
      m.position.set((k - 1) * 1.6, k === i ? 0.45 : 0.25, 0); g.add(m);
    }
    const base = qmCyl(lib, 3, 3, 0.06, 0x556270, {}, 24); base.position.y = 0.03; g.add(base);
    g.userData.rows = n;
    return g;
  },
};

/** The builder for a mechanic key: its own, or the marker row. */
export function qmStageBuilder(key) { return QM_STAGE_BUILDERS[key] ?? QM_STAGE_BUILDERS.markers; }

/** Build a step's board as a Group. Exported for the checker and for worlds that place a board without running a game. */
export function qmStageBuild(lib, step, i) {
  return qmStageBuilder(step?.mechanic ?? "markers")(lib, step ?? { board: [] }, i | 0);
}

/**
 * The pure run: the same steps the panel plays (qmPlaySteps over the item's
 * mechanic and its practice calls), a cursor and a safe-call count.
 * `choose(k)` scores the move and advances; `finished` when every step is
 * answered; `result()` is `{ score, of }` for qmFinishGame.
 */
export function qmStageRun(item) {
  const steps = qmPlaySteps(item, qmRounds(item));
  const run = {
    item, steps, i: 0, safe: 0,
    get step() { return steps[run.i] ?? null; },
    get finished() { return run.i >= steps.length; },
    choose(k) {
      const s = steps[run.i];
      if (!s) return null;
      if (s.options[k]?.safe) run.safe += 1;
      run.i += 1;
      return steps[run.i] ?? null;
    },
    result() { return { score: run.safe, of: steps.length }; },
  };
  return run;
}

const qmStageCss = `
#qm-stage{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:10020;width:min(560px,calc(100vw - 24px));background:rgba(15,26,36,.94);color:#e9f1f7;border:1px solid rgba(160,210,235,.4);border-radius:12px;padding:10px 12px;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4)}
#qm-stage[hidden]{display:none}
#qm-stage .qm-st-head{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
#qm-stage .qm-st-head b{font-size:15px}
#qm-stage .qm-st-meta{color:#a9bccb;font-size:12px}
#qm-stage .qm-st-prompt{margin:6px 0}
#qm-stage .qm-btn{margin:4px 0;padding:8px 12px;min-height:44px;border-radius:8px;border:1px solid rgba(127,211,255,.6);background:rgba(127,211,255,.12);color:#fff;font:600 13px/1.25 system-ui,sans-serif;cursor:pointer;display:block;width:100%;text-align:left}
#qm-stage .qm-btn:hover{background:rgba(127,211,255,.3)}
#qm-stage .qm-st-close{position:absolute;top:6px;right:8px;width:32px;height:32px;border-radius:16px;border:1px solid rgba(255,255,255,.3);background:transparent;color:#fff;cursor:pointer}
#qm-stage .qm-done{color:#8fe3a1;font-weight:600}
`;
function qmStageCssOnce() {
  if (typeof document === "undefined" || document.getElementById("qm-stage-css")) return;
  const st = document.createElement("style"); st.id = "qm-stage-css"; st.textContent = qmStageCss; document.head.appendChild(st);
}
function qmStEsc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

/** Dispose a built board's geometries and materials and take it off its parent. */
export function qmStageDispose(group) {
  if (!group) return;
  group.traverse?.((o) => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach((m) => m?.dispose?.()); });
  group.parent?.remove(group);
}

/** The stage that is on screen, so a world never mounts two. */
let qmStageLive = null;

/**
 * Mount a game in the world: its board at `at` (world coordinates, ground
 * height), rebuilt for every step, and the HUD strip with the prompt and the
 * two moves. Ends in qmFinishGame with the run's own score (the panel's score
 * for the same choices) and `onDone(item, res)`. Returns `{ run, group,
 * dispose }`. `heading` turns the board toward the player.
 */
export function qmStageMount({ lib, root, item, at = [0, 0, 0], heading = 0, scale = 1, storage = null, onDone = null, onClose = null } = {}) {
  if (!lib || !root || !item) return null;
  if (qmStageLive) qmStageLive.dispose();
  qmStageCssOnce();
  const run = qmStageRun(item);
  const holder = new lib.Group();
  holder.position.set(at[0], at[1], at[2]);
  holder.rotation.y = heading;
  holder.scale.set(scale, scale, scale);
  root.add(holder);
  let board = null;
  let strip = typeof document !== "undefined" ? document.getElementById("qm-stage") : null;
  if (!strip && typeof document !== "undefined") { strip = document.createElement("div"); strip.id = "qm-stage"; strip.setAttribute("role", "dialog"); strip.setAttribute("aria-label", "Side game"); document.body.appendChild(strip); }
  let closeTimer = 0;
  const api = {
    run, group: holder,
    dispose() {
      clearTimeout(closeTimer);
      qmStageDispose(board); board = null;
      holder.parent?.remove(holder);
      if (strip) strip.hidden = true;
      if (qmStageLive === api) qmStageLive = null;
    },
  };
  qmStageLive = api;

  function show() {
    qmStageDispose(board); board = null;
    const s = run.step;
    if (!s) return finish();
    if (s.board) { board = qmStageBuild(lib, s, run.i); holder.add(board); }
    if (!strip) return;
    const mech = s.mechanic ? QM_MECHANICS[s.mechanic]?.name : "Safe-practice call";
    strip.hidden = false;
    strip.innerHTML = `<button class="qm-st-close" type="button" aria-label="Close" data-qm-st-close>×</button>
      <div class="qm-st-head"><b>${qmStEsc(item.title)}</b><span class="qm-st-meta">${qmStEsc(mech)} · ${run.i + 1} of ${run.steps.length}</span></div>
      <div class="qm-st-prompt">${qmStEsc(s.prompt)}</div>
      ${s.options.map((o, k) => `<button class="qm-btn" type="button" data-qm-st-opt="${k}">${qmStEsc(o.text)}</button>`).join("")}`;
  }
  function finish() {
    const res = qmFinishGame(item, run.result(), storage);
    if (strip) {
      strip.hidden = false;
      strip.innerHTML = `<button class="qm-st-close" type="button" aria-label="Close" data-qm-st-close>×</button><div class="qm-st-head"><b>${qmStEsc(item.title)}</b><span class="qm-st-meta">${run.safe} of ${run.steps.length} safe calls</span></div>
        <div class="qm-st-prompt">${res.clean ? `<span class="qm-done">Every call safe — you earned the ${qmStEsc(res.cosmetic)}.</span>` : "A safe crew replays the call it missed. Walk up again for another run."}</div>`;
    }
    onDone?.(item, res);
    closeTimer = setTimeout(() => api.dispose(), 6000);
  }
  strip?.addEventListener("click", function onClick(e) {
    if (qmStageLive !== api) { strip.removeEventListener("click", onClick); return; }
    const t = e.target.closest?.("[data-qm-st-opt],[data-qm-st-close]");
    if (!t) return;
    if (t.hasAttribute("data-qm-st-close")) { api.dispose(); onClose?.(item); strip.removeEventListener("click", onClick); return; }
    run.choose(+t.getAttribute("data-qm-st-opt"));
    show();
  });
  show();
  return api;
}

/** The mechanic key an item's stage would draw, for a world deciding where to put it. */
export function qmStageKind(item) { return QM_STAGE_BUILDERS[qmMechanicFor(item)] ? qmMechanicFor(item) : "markers"; }
