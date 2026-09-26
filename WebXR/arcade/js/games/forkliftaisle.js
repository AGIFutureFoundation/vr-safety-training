// Forklift Aisle — lane-crossing dodger.
//
// Cross a warehouse aisle, one marked lane at a time, from the marshalling
// pad at the bottom to the shipping dock at the top. Some lanes carry a
// forklift or pallet jack sweeping back and forth across the three aisle
// slots; a few are painted, marked crossings with their own stop/go beacon —
// the whole lane is closed while it is red, open while it is green. A hi-vis
// kit sits somewhere on each board; grab it before the dock, or the foreman
// still lets you through, just without the bonus.
//
// create()/step() are pure (no DOM, no canvas, no audio); render() draws the
// pixel art and is the only function that touches a canvas.
//
// "What this teaches": right-of-way at a marked aisle crossing is not a
// suggestion — wait for the light, keep your hi-vis on, and a forklift
// operator can actually see you coming.

export const FA_WIDTH = 180;
export const FA_HEIGHT = 240;
export const FA_TEACHES = "A marked aisle crossing gets right-of-way for a reason: wait for the light, keep your hi-vis on, and the operator can actually see you.";
export const FA_TIME_LIMIT = 60; // seconds — every round is capped, win or lose
export const FA_COLS = 3;

function faRandFn(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const FA_BOARDS = [
  { name: "Receiving aisle", lanes: 8, sweepPeriod: 1.6, crossingCycle: 3.2, crossingRed: 1.5 },
  { name: "Pick aisle", lanes: 10, sweepPeriod: 1.25, crossingCycle: 2.6, crossingRed: 1.35 },
  { name: "Shipping dock apron", lanes: 12, sweepPeriod: 1.0, crossingCycle: 2.2, crossingRed: 1.25 },
];

const MOVE_COOLDOWN = 0.22;
const RETREAT_COOLDOWN = 0.16;

function faBoardDef(state) { return FA_BOARDS[Math.min(state.level - 1, FA_BOARDS.length - 1)]; }
function faSay(state, text, dur = 1.4) { state.message = text; state.messageT = dur; }

/** Every lane on the current board, built once when the board starts so
 *  step() never has to draw a fresh random number — a lane's own kind, phase
 *  and (for a crossing) how long it stays red are fixed for the whole board. */
function buildLanes(state) {
  const b = faBoardDef(state);
  const lanes = [];
  for (let i = 1; i <= b.lanes; i++) {
    if (i % 4 === 0) {
      lanes.push({ kind: "crossing", cycle: b.crossingCycle, red: b.crossingRed, phase: state.rng() * b.crossingCycle });
    } else {
      lanes.push({ kind: "sweep", period: b.sweepPeriod * (0.85 + state.rng() * 0.3), phase: state.rng() * b.sweepPeriod });
    }
  }
  // One hi-vis kit per board, always on a sweep lane so it is never behind a
  // closed crossing, in the first half of the board so there is time to grab
  // it and still make the dock.
  let kitLane = -1;
  const candidates = lanes.map((l, i) => i + 1).filter((n) => lanes[n - 1].kind === "sweep" && n <= Math.ceil(b.lanes * 0.7));
  if (candidates.length) kitLane = candidates[Math.floor(state.rng() * candidates.length)];
  state.lanes = lanes;
  state.kitLane = kitLane;
  state.kitCol = Math.floor(state.rng() * FA_COLS);
  state.kitTaken = false;
}

/** The column a sweep lane currently blocks — a smooth triangle wave across
 *  0..FA_COLS-1 so it reads as a forklift patrolling the aisle back and
 *  forth, not a hazard that teleports. */
function sweepBlockedCol(lane, t) {
  const span = FA_COLS - 1;
  const phase = ((t + lane.phase) % lane.period) / lane.period; // 0..1
  const tri = phase < 0.5 ? phase * 2 : 2 - phase * 2; // 0 -> 1 -> 0
  return Math.round(tri * span);
}

/** Whether a crossing lane is red (closed, all three slots) right now, and
 *  how long it has been green when it is not — used for the right-of-way
 *  timing bonus (a clean crossing taken soon after the light clears). */
function crossingState(lane, t) {
  const phase = (t + lane.phase) % lane.cycle;
  if (phase < lane.red) return { red: true, greenFor: 0 };
  return { red: false, greenFor: phase - lane.red };
}

/** Exported for tools/check_arcade.mjs: whether one lane blocks one column at
 *  one moment in board time. A sweep lane blocks at most one of the three
 *  columns at once; a crossing lane blocks all three, or none, together. */
export function laneBlocked(lane, col, t) {
  if (lane.kind === "crossing") return crossingState(lane, t).red;
  return sweepBlockedCol(lane, t) === col;
}

function faHit(state, events) {
  if (state.invuln > 0 || state.over) return;
  state.lives -= 1;
  state.invuln = 1.0;
  events.push({ type: "hit", lives: state.lives });
  if (state.lives <= 0) { state.over = true; faSay(state, "A forklift operator waved you off — game over.", 3); }
  else faSay(state, "Watch the crossing!");
}

export function faCreate(opts = {}) {
  const state = {
    rng: faRandFn(opts.seed ?? 1),
    level: 1,
    row: 0, col: 1,
    lives: 3,
    score: 0,
    ppeCollected: 0,
    over: false,
    win: false,
    timeLeft: FA_TIME_LIMIT,
    invuln: 0,
    moveCooldown: 0,
    boardT: 0,
    message: "Cross when it's clear!",
    messageT: 1.6,
    t: 0,
  };
  buildLanes(state);
  return state;
}

export function faStep(state, dt, input = {}) {
  const events = [];
  if (state.over) return events;
  state.t += dt;
  state.boardT += dt;
  if (state.messageT > 0) state.messageT -= dt;
  if (state.invuln > 0) state.invuln -= dt;
  if (state.moveCooldown > 0) state.moveCooldown -= dt;

  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.over = true;
    faSay(state, "Shift horn — time's up.", 3);
    return events;
  }

  const b = faBoardDef(state);

  if (state.moveCooldown <= 0) {
    if (input.up) {
      state.moveCooldown = MOVE_COOLDOWN;
      const destRow = state.row + 1;
      if (destRow > b.lanes) {
        // Reached the dock: the foreman checks for the hi-vis kit, same
        // honest pass/fail-but-not-blocking pattern as Crew Run's checkpoint.
        const kitted = state.kitLane < 0 || state.kitTaken;
        state.score += kitted ? 150 * state.level : 40 * state.level;
        events.push({ type: "dock", kitted });
        faSay(state, kitted ? "Dock check: hi-vis on — pass." : "Dock check: no hi-vis — pass, but flagged.", 2);
        if (state.level >= FA_BOARDS.length) {
          state.over = true; state.win = true; faSay(state, "Shift complete!", 3);
        } else {
          state.level += 1;
          state.row = 0; state.col = 1;
          state.boardT = 0;
          buildLanes(state);
        }
      } else {
        const lane = state.lanes[destRow - 1];
        if (laneBlocked(lane, state.col, state.boardT)) {
          faHit(state, events);
        } else {
          state.row = destRow;
          state.score += 10 * state.level;
          if (lane.kind === "crossing") {
            const cs = crossingState(lane, state.boardT);
            if (!cs.red && cs.greenFor < 0.6) { state.score += 30; events.push({ type: "right-of-way" }); }
          }
          if (destRow === state.kitLane && state.col === state.kitCol && !state.kitTaken) {
            state.kitTaken = true; state.ppeCollected += 1; state.score += 20;
            events.push({ type: "kit" });
          }
        }
      }
    } else if (input.down) {
      if (state.row > 0) { state.row -= 1; state.moveCooldown = RETREAT_COOLDOWN; }
    } else if (input.left || input.right) {
      const destCol = Math.max(0, Math.min(FA_COLS - 1, state.col + (input.left ? -1 : 1)));
      if (destCol !== state.col) {
        state.moveCooldown = MOVE_COOLDOWN * 0.6;
        if (state.row === 0 || state.row > b.lanes) { state.col = destCol; }
        else {
          const lane = state.lanes[state.row - 1];
          if (laneBlocked(lane, destCol, state.boardT)) faHit(state, events);
          else state.col = destCol;
        }
      }
    }
  }

  return events;
}

// ---------------------------------------------------------------- rendering

const FA_VISIBLE_LANES = 6;

export function faRender(ctx, state, W = FA_WIDTH, H = FA_HEIGHT) {
  const laneH = Math.floor((H - 30) / (FA_VISIBLE_LANES + 1));
  const colW = W / FA_COLS;
  const b = faBoardDef(state);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, W, H);

  // Lane index -> screen row, scrolled so the player sits a couple of rows
  // above the bottom of the visible window.
  const baseLane = Math.max(0, state.row - 2);
  const laneY = (lane) => H - 24 - (lane - baseLane + 1) * laneH;

  for (let lane = baseLane; lane <= baseLane + FA_VISIBLE_LANES + 1; lane++) {
    const y = laneY(lane);
    if (y < -laneH || y > H) continue;
    if (lane === 0) {
      ctx.fillStyle = "#1c2a1f";
      ctx.fillRect(0, y, W, laneH);
    } else if (lane > b.lanes) {
      ctx.fillStyle = lane === b.lanes + 1 ? "#233042" : "#101820";
      ctx.fillRect(0, y, W, laneH);
      if (lane === b.lanes + 1) {
        ctx.fillStyle = "#8b98a5"; ctx.font = "9px monospace"; ctx.textAlign = "center";
        ctx.fillText("DOCK", W / 2, y + laneH / 2 + 3);
      }
    } else {
      const l = state.lanes[lane - 1];
      ctx.fillStyle = "#171f26";
      ctx.fillRect(0, y, W, laneH);
      if (l.kind === "crossing") {
        const cs = crossingState(l, state.boardT);
        ctx.fillStyle = cs.red ? "rgba(240,90,80,0.28)" : "rgba(90,220,120,0.22)";
        ctx.fillRect(0, y, W, laneH);
        ctx.fillStyle = cs.red ? "#f0645b" : "#59c97b";
        ctx.beginPath(); ctx.arc(8, y + laneH / 2, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        const blockedCol = sweepBlockedCol(l, state.boardT);
        ctx.fillStyle = "#caa24a";
        ctx.fillRect(blockedCol * colW + 4, y + 3, colW - 8, laneH - 6);
      }
      if (lane === state.kitLane && !state.kitTaken) {
        ctx.fillStyle = "#ffc93c";
        ctx.fillRect(state.kitCol * colW + colW / 2 - 5, y + laneH / 2 - 5, 10, 10);
      }
    }
    for (let c = 1; c < FA_COLS; c++) {
      ctx.strokeStyle = "#0b1016"; ctx.beginPath();
      ctx.moveTo(c * colW, y); ctx.lineTo(c * colW, y + laneH); ctx.stroke();
    }
  }

  // The player.
  const py = laneY(state.row) + laneH / 2;
  const px = state.col * colW + colW / 2;
  const blink = state.invuln > 0 && Math.floor(state.t * 12) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = "#4fd1ff";
    ctx.fillRect(px - 6, py - 8, 12, 14);
    ctx.fillStyle = "#ffc93c";
    ctx.fillRect(px - 6, py - 12, 12, 5);
  }

  ctx.fillStyle = "#f1f5fb"; ctx.font = "10px monospace"; ctx.textAlign = "left";
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 4, 12);
  ctx.textAlign = "right";
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, W - 4, 12);
  ctx.textAlign = "left";
  ctx.fillText("♥".repeat(Math.max(0, state.lives)), 4, H - 6);
  ctx.textAlign = "right";
  ctx.fillText(`BOARD ${state.level}/${FA_BOARDS.length}`, W - 4, H - 6);
  if (state.messageT > 0) {
    ctx.fillStyle = "#ffc93c"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(state.message, W / 2, 24);
    ctx.textAlign = "left";
  }
}
