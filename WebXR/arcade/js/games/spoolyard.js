// Spool Yard — single-screen climbing platformer.
//
// Climb ladders and girders up a steel frame while cable spools roll down
// off the loading ramps above. Tie off at each level's anchor point for a
// bonus, then reach the crane cab at the top. Four boards, each with a
// tighter ladder layout and faster spools than the last.
//
// create()/step() are pure — no DOM, no canvas, no audio — so
// tools/check_arcade.mjs can run a whole session headless. render() is the
// only function that touches a canvas, and only when the app calls it.
//
// "What this teaches": tie off before you climb. An anchored line is what
// turns a slip into nothing worse than a stop, instead of a fall.

export const SY_WIDTH = 256;
export const SY_HEIGHT = 224;
export const SY_TEACHES = "Tie off before you climb: an anchored line turns a slip into a stop, not a fall.";

const FLOOR_COUNT = 5; // 0 = yard level, 4 = crane cab
const FLOOR_GAP = 42;
const FLOOR_MARGIN = 20;
export const syFloorY = (f) => SY_HEIGHT - FLOOR_MARGIN - f * FLOOR_GAP;
const PLAYER_SPEED = 66;
const CLIMB_SPEED = 58;
const LADDER_SNAP = 11;
const START_X = 18;

function syRandFn(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ladders[f] = x positions of ladders climbing from floor f to floor f+1.
// anchorX[f] = the tie-off point on floor f+1 (there is no anchor on the
// ground floor). dir[f] = which way spools roll while resting on floor f
// before they drop to the ramp below (1 right, -1 left).
export const SY_BOARDS = [
  { name: "Ground rig", ladders: [[40, 190], [90, 220], [30, 150], [195]], anchorX: [160, 60, 205, 40], dir: [1, -1, 1, -1], spoolRate: 2.5, spoolSpeed: 42 },
  { name: "Mid stack", ladders: [[60, 205], [30, 165], [95, 225], [55]], anchorX: [40, 195, 70, 210], dir: [-1, 1, -1, 1], spoolRate: 2.0, spoolSpeed: 52 },
  { name: "High reach", ladders: [[30, 150, 220], [70, 200], [40, 185], [115]], anchorX: [205, 50, 180, 100], dir: [1, -1, 1, -1], spoolRate: 1.6, spoolSpeed: 60 },
  { name: "Crane deck", ladders: [[50, 195], [30, 150, 210], [70, 200], [45]], anchorX: [70, 210, 40, 190], dir: [-1, 1, -1, 1], spoolRate: 1.3, spoolSpeed: 68 },
];

function boardDef(state) { return SY_BOARDS[Math.min(state.board, SY_BOARDS.length - 1)]; }

function resetPlayer(state) {
  state.floor = 0;
  state.x = START_X;
  state.climbing = null;
  state.invuln = 1.1;
}

function sySay(state, text, dur = 1.3) { state.message = text; state.messageT = dur; }

function hitPlayer(state, events) {
  if (state.invuln > 0 || state.over) return;
  state.lives -= 1;
  events.push({ type: "hit", lives: state.lives });
  if (state.lives <= 0) { state.over = true; sySay(state, "Game over", 3); }
  else { sySay(state, "Watch the spools!"); resetPlayer(state); }
}

function spawnSpool(state) {
  const b = boardDef(state);
  const topFloor = FLOOR_COUNT - 2;
  const dir = b.dir[topFloor] ?? 1;
  state.spools.push({ floor: topFloor, x: dir > 0 ? -12 : SY_WIDTH + 12, dir });
}

export function syCreate(opts = {}) {
  const state = {
    rng: syRandFn(opts.seed ?? 1),
    board: 0,
    level: 1,
    floor: 0,
    x: START_X,
    climbing: null,
    lives: 3,
    score: 0,
    over: false,
    win: false,
    maxFloor: 0,
    anchors: [false, false, false, false],
    spools: [],
    spoolTimer: 1,
    invuln: 0,
    t: 0,
    message: "Climb!",
    messageT: 1.5,
  };
  return state;
}

export function syStep(state, dt, input = {}) {
  const events = [];
  if (state.over) return events;
  state.t += dt;
  if (state.messageT > 0) state.messageT -= dt;
  if (state.invuln > 0) state.invuln -= dt;
  const b = boardDef(state);

  if (state.climbing) {
    const c = state.climbing;
    const dir = c.to > c.from ? 1 : -1;
    c.t += dt * dir * (CLIMB_SPEED / FLOOR_GAP);
    if ((dir > 0 && c.t >= c.to) || (dir < 0 && c.t <= c.to)) {
      state.floor = c.to;
      state.climbing = null;
      if (state.floor > state.maxFloor) {
        state.maxFloor = state.floor;
        state.score += 10;
        events.push({ type: "floor", floor: state.floor });
      }
    } else {
      state.floor = c.t;
    }
  } else {
    let dx = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    state.x = Math.max(4, Math.min(SY_WIDTH - 4, state.x + dx * PLAYER_SPEED * dt));
    const floorIdx = Math.round(state.floor);
    if (input.up && floorIdx < FLOOR_COUNT - 1) {
      const lx = (b.ladders[floorIdx] || []).find((x) => Math.abs(x - state.x) < LADDER_SNAP);
      if (lx != null) state.climbing = { from: floorIdx, to: floorIdx + 1, t: floorIdx, x: lx };
    } else if (input.down && floorIdx > 0) {
      const lx = (b.ladders[floorIdx - 1] || []).find((x) => Math.abs(x - state.x) < LADDER_SNAP);
      if (lx != null) state.climbing = { from: floorIdx, to: floorIdx - 1, t: floorIdx, x: lx };
    }
  }
  if (state.climbing) state.x = state.climbing.x;

  const floorIdx = Math.round(state.floor);
  if (!state.climbing && floorIdx > 0) {
    const ai = floorIdx - 1;
    if (!state.anchors[ai] && Math.abs(state.x - b.anchorX[ai]) < 9) {
      state.anchors[ai] = true;
      state.score += 50;
      sySay(state, "Tied off · +50");
      events.push({ type: "anchor", floor: floorIdx });
    }
  }

  if (!state.climbing && floorIdx === FLOOR_COUNT - 1 && state.x > SY_WIDTH - 26) {
    const bonus = 300 + state.level * 50;
    state.score += bonus;
    events.push({ type: "board-complete", board: state.board });
    if (state.board >= SY_BOARDS.length - 1) {
      state.over = true;
      state.win = true;
      sySay(state, "All boards climbed!", 3);
    } else {
      state.board += 1;
      state.level = state.board + 1;
      state.anchors = state.anchors.map(() => false);
      state.spools = [];
      state.maxFloor = 0;
      resetPlayer(state);
      sySay(state, `Board ${state.level}`, 1.6);
    }
  }

  state.spoolTimer -= dt;
  if (state.spoolTimer <= 0) {
    spawnSpool(state);
    state.spoolTimer = boardDef(state).spoolRate * (0.7 + state.rng() * 0.6);
  }
  for (const s of state.spools) {
    const bd = boardDef(state);
    s.x += s.dir * bd.spoolSpeed * dt;
    const dir = bd.dir[s.floor] ?? 1;
    if ((dir > 0 && s.x > SY_WIDTH + 14) || (dir < 0 && s.x < -14)) {
      if (s.floor > 0) {
        s.floor -= 1;
        s.dir = bd.dir[s.floor] ?? -s.dir;
        s.x = s.dir > 0 ? -12 : SY_WIDTH + 12;
      } else {
        s.dead = true;
      }
    }
  }
  state.spools = state.spools.filter((s) => !s.dead);

  if (!state.climbing) {
    for (const s of state.spools) {
      if (s.floor === Math.round(state.floor) && Math.abs(s.x - state.x) < 8) {
        hitPlayer(state, events);
        break;
      }
    }
  }

  return events;
}

// ---------------------------------------------------------------- rendering

const SY_PALETTE = { steel: "#2c3648", steelLight: "#46536c", ladder: "#ffb02a", spool: "#8a5a2b", spoolCore: "#d9b25a", anchor: "#5adf7a", anchorDone: "#2f8f4c", player: "#4fd1ff", cab: "#ff8a3c" };

export function syRender(ctx, state, W = SY_WIDTH, H = SY_HEIGHT) {
  const b = boardDef(state);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#0a0e18";
  ctx.fillRect(0, 0, W, H);
  // girders
  for (let f = 0; f < FLOOR_COUNT; f++) {
    const y = syFloorY(f);
    ctx.fillStyle = SY_PALETTE.steel;
    ctx.fillRect(0, y, W, 6);
    ctx.fillStyle = SY_PALETTE.steelLight;
    for (let x = 6; x < W; x += 18) ctx.fillRect(x, y, 4, 6);
  }
  // ladders
  ctx.fillStyle = SY_PALETTE.ladder;
  for (let f = 0; f < FLOOR_COUNT - 1; f++) {
    for (const x of b.ladders[f] || []) {
      const y0 = syFloorY(f + 1), y1 = syFloorY(f);
      ctx.fillRect(x - 5, y0, 2, y1 - y0);
      ctx.fillRect(x + 3, y0, 2, y1 - y0);
      for (let ry = y0 + 4; ry < y1; ry += 7) ctx.fillRect(x - 5, ry, 10, 2);
    }
  }
  // anchors
  for (let f = 0; f < FLOOR_COUNT - 1; f++) {
    const x = b.anchorX[f], y = syFloorY(f + 1);
    ctx.fillStyle = state.anchors[f] ? SY_PALETTE.anchorDone : SY_PALETTE.anchor;
    ctx.fillRect(x - 4, y - 10, 8, 10);
    ctx.fillStyle = "#0a0e18";
    ctx.fillRect(x - 1, y - 7, 2, 5);
  }
  // crane cab (goal)
  ctx.fillStyle = SY_PALETTE.cab;
  ctx.fillRect(W - 26, syFloorY(FLOOR_COUNT - 1) - 26, 24, 26);
  ctx.fillStyle = "#1b1300";
  ctx.fillRect(W - 22, syFloorY(FLOOR_COUNT - 1) - 22, 8, 8);
  // spools
  for (const s of state.spools) {
    const y = syFloorY(s.floor) - 9;
    ctx.fillStyle = SY_PALETTE.spool;
    ctx.beginPath(); ctx.arc(s.x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = SY_PALETTE.spoolCore;
    ctx.beginPath(); ctx.arc(s.x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  // player
  const py = syFloorY(state.floor) - 15;
  const blink = state.invuln > 0 && Math.floor(state.t * 12) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = "#ffc93c";
    ctx.fillRect(state.x - 5, py - 15, 10, 5);
    ctx.fillStyle = SY_PALETTE.player;
    ctx.fillRect(state.x - 4, py - 10, 8, 10);
    ctx.fillStyle = "#2c3648";
    ctx.fillRect(state.x - 4, py, 3, 6);
    ctx.fillRect(state.x + 1, py, 3, 6);
  }
  // HUD
  ctx.fillStyle = "#f1f5fb";
  ctx.font = "10px monospace";
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 6, 12);
  ctx.fillText(`BOARD ${state.level}/4`, W - 74, 12);
  ctx.fillText("♥".repeat(Math.max(0, state.lives)), 6, H - 6);
  if (state.messageT > 0) {
    ctx.fillStyle = "#ffc93c";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.message, W / 2, 24);
    ctx.textAlign = "left";
  }
}
