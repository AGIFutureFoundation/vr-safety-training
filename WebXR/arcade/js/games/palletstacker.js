// Pallet Stacker — falling-block stacker, two-player split screen.
//
// Pallets of different shapes drop into the truck bed; complete a row to
// ship it. The stack shifts if it leans too far to one side. Levels speed
// up. Two players get one independent board each, side by side.
//
// create()/step() are pure (no DOM, no canvas, no audio); render() draws the
// pixel art and is the only function that touches a canvas.
//
// "What this teaches": a leaning load is an unstable load — keep the stack
// square, or it comes down on its own schedule, not yours.

export const PS_COLS = 8;
export const PS_ROWS = 16;
export const PS_TEACHES = "A leaning load is an unstable load: keep the stack square, or it comes down on its own schedule.";

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]],
};
const SHAPE_IDS = Object.keys(SHAPES);
const COLOURS = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 };
export const PS_COLOUR_CSS = { 1: "#4fd1ff", 2: "#ffc93c", 3: "#c98cff", 4: "#8cff5a", 5: "#ff5a7a", 6: "#5a8cff", 7: "#ff8a3c" };

function psRandFn(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function rotateShape(shape) {
  const h = shape.length, w = shape[0].length;
  const out = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[x][h - 1 - y] = shape[y][x];
  return out;
}

function pick(rng) { return SHAPE_IDS[Math.floor(rng() * SHAPE_IDS.length)]; }

function fits(board, shape, px, py) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (!shape[y][x]) continue;
      const gx = px + x, gy = py + y;
      if (gx < 0 || gx >= PS_COLS || gy >= PS_ROWS) return false;
      if (gy >= 0 && board.grid[gy][gx]) return false;
    }
  }
  return true;
}

function spawn(board) {
  const id = board.next;
  board.next = pick(board.rng);
  const shape = SHAPES[id];
  board.piece = { id, shape, x: Math.floor((PS_COLS - shape[0].length) / 2), y: 0 };
  if (!fits(board, board.piece.shape, board.piece.x, board.piece.y)) {
    board.over = true;
    board.piece = null;
  }
}

function clearLines(board) {
  let cleared = 0;
  for (let y = PS_ROWS - 1; y >= 0; y--) {
    if (board.grid[y].every((c) => c)) {
      board.grid.splice(y, 1);
      board.grid.unshift(Array(PS_COLS).fill(0));
      cleared += 1;
      y += 1;
    }
  }
  if (cleared) {
    const table = [0, 100, 300, 500, 800];
    board.score += (table[cleared] ?? 800) * board.level;
    board.lines += cleared;
    board.level = 1 + Math.floor(board.lines / 10);
    board.dropInterval = Math.max(0.12, 0.8 - (board.level - 1) * 0.06);
  }
  return cleared;
}

function lockPiece(board, events) {
  const { shape, x, y, id } = board.piece;
  for (let sy = 0; sy < shape.length; sy++) {
    for (let sx = 0; sx < shape[0].length; sx++) {
      if (!shape[sy][sx]) continue;
      const gy = y + sy, gx = x + sx;
      if (gy >= 0) board.grid[gy][gx] = COLOURS[id];
    }
  }
  const cleared = clearLines(board);
  if (cleared) events.push({ type: "ship", rows: cleared });
  spawn(board);
}

/** The stack leans too far: settle the tallest column's top block one step
 *  toward the shortest column, if there is room — a gentle penalty, never a
 *  crash, and it never removes a block, only moves one. */
function maybeShift(board) {
  const heights = Array.from({ length: PS_COLS }, (_, x) => {
    for (let y = 0; y < PS_ROWS; y++) if (board.grid[y][x]) return PS_ROWS - y;
    return 0;
  });
  const maxH = Math.max(...heights), minH = Math.min(...heights);
  if (maxH - minH < 6) return false;
  const tall = heights.indexOf(maxH);
  const leftH = tall > 0 ? heights[tall - 1] : Infinity;
  const rightH = tall < PS_COLS - 1 ? heights[tall + 1] : Infinity;
  const dir = leftH <= rightH ? -1 : 1;
  const target = tall + dir;
  if (target < 0 || target >= PS_COLS) return false;
  const topY = PS_ROWS - maxH;
  const cell = board.grid[topY][tall];
  if (!cell) return false;
  let ty = PS_ROWS - 1;
  while (ty >= 0 && board.grid[ty][target]) ty -= 1;
  if (ty < 0) return false;
  board.grid[topY][tall] = 0;
  board.grid[ty][target] = cell;
  board.message = "Load shift!";
  board.messageT = 1.1;
  return true;
}

function freshBoard(seed) {
  const rng = psRandFn(seed);
  const board = {
    rng,
    grid: Array.from({ length: PS_ROWS }, () => Array(PS_COLS).fill(0)),
    score: 0,
    lines: 0,
    level: 1,
    over: false,
    dropT: 0,
    dropInterval: 0.8,
    piece: null,
    next: pick(rng),
    message: "",
    messageT: 0,
    shiftT: 2.5 + rng() * 3,
  };
  spawn(board);
  return board;
}

export function psCreate(opts = {}) {
  const n = opts.players === 2 ? 2 : 1;
  const seed = opts.seed ?? 1;
  return {
    n,
    boards: Array.from({ length: n }, (_, i) => freshBoard(seed + i * 7919 + 1)),
    over: false,
  };
}

function stepBoard(board, dt, input = {}) {
  const events = [];
  if (board.over || !board.piece) return events;
  if (board.messageT > 0) board.messageT -= dt;
  const p = board.piece;
  if (input.left && fits(board, p.shape, p.x - 1, p.y)) p.x -= 1;
  if (input.right && fits(board, p.shape, p.x + 1, p.y)) p.x += 1;
  if (input.rotate && !board._rotateHeld) {
    const r = rotateShape(p.shape);
    for (const k of [0, -1, 1, -2, 2]) {
      if (fits(board, r, p.x + k, p.y)) { p.shape = r; p.x += k; break; }
    }
  }
  board._rotateHeld = !!input.rotate;

  board.dropT += dt * (input.down ? 7 : 1);
  if (input.hardDrop && !board._hardDropHeld) {
    while (fits(board, p.shape, p.x, p.y + 1)) p.y += 1;
    board.dropT = board.dropInterval;
  }
  board._hardDropHeld = !!input.hardDrop;

  if (board.dropT >= board.dropInterval) {
    board.dropT = 0;
    if (fits(board, p.shape, p.x, p.y + 1)) p.y += 1;
    else lockPiece(board, events);
  }

  board.shiftT -= dt;
  if (board.shiftT <= 0) {
    if (maybeShift(board)) events.push({ type: "shift" });
    board.shiftT = 3 + board.rng() * 4;
  }
  return events;
}

export function psStep(state, dt, inputs = {}) {
  const events = [];
  for (let i = 0; i < state.boards.length; i++) {
    const input = inputs[i] ?? inputs[`p${i + 1}`] ?? {};
    const ev = stepBoard(state.boards[i], dt, input);
    for (const e of ev) events.push({ ...e, player: i });
  }
  state.over = state.boards.every((b) => b.over);
  return events;
}

// ---------------------------------------------------------------- rendering

export const PS_CELL = 12;
export function psBoardSize() { return { w: PS_COLS * PS_CELL, h: PS_ROWS * PS_CELL }; }

function drawBoard(ctx, board, ox, oy) {
  ctx.fillStyle = "#0a0e18";
  ctx.fillRect(ox, oy, PS_COLS * PS_CELL, PS_ROWS * PS_CELL);
  for (let y = 0; y < PS_ROWS; y++) {
    for (let x = 0; x < PS_COLS; x++) {
      const c = board.grid[y][x];
      if (!c) continue;
      ctx.fillStyle = PS_COLOUR_CSS[c];
      ctx.fillRect(ox + x * PS_CELL + 1, oy + y * PS_CELL + 1, PS_CELL - 2, PS_CELL - 2);
    }
  }
  if (board.piece) {
    const { shape, x, y, id } = board.piece;
    ctx.fillStyle = PS_COLOUR_CSS[COLOURS[id]];
    for (let sy = 0; sy < shape.length; sy++) {
      for (let sx = 0; sx < shape[0].length; sx++) {
        if (!shape[sy][sx]) continue;
        const gy = y + sy;
        if (gy < 0) continue;
        ctx.fillRect(ox + (x + sx) * PS_CELL + 1, oy + gy * PS_CELL + 1, PS_CELL - 2, PS_CELL - 2);
      }
    }
  }
  ctx.strokeStyle = "rgba(120,160,220,.25)";
  ctx.strokeRect(ox + 0.5, oy + 0.5, PS_COLS * PS_CELL - 1, PS_ROWS * PS_CELL - 1);
  ctx.fillStyle = "#f1f5fb";
  ctx.font = "9px monospace";
  ctx.fillText(`SCORE ${board.score}`, ox, oy - 14);
  ctx.fillText(`LVL ${board.level}`, ox, oy - 4);
  ctx.fillText(`NEXT ${board.next}`, ox + PS_COLS * PS_CELL - 46, oy - 4);
  if (board.messageT > 0) {
    ctx.fillStyle = "#ffc93c";
    ctx.fillText(board.message, ox, oy + PS_ROWS * PS_CELL + 12);
  }
  if (board.over) {
    ctx.fillStyle = "rgba(4,6,12,.72)";
    ctx.fillRect(ox, oy, PS_COLS * PS_CELL, PS_ROWS * PS_CELL);
    ctx.fillStyle = "#ff5a7a";
    ctx.font = "bold 11px monospace";
    ctx.fillText("TRUCK", ox + 16, oy + PS_ROWS * PS_CELL / 2 - 6);
    ctx.fillText("FULL", ox + 22, oy + PS_ROWS * PS_CELL / 2 + 8);
  }
}

export function psRender(ctx, state, W, H) {
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#04060c";
  ctx.fillRect(0, 0, W, H);
  const { w } = psBoardSize();
  const gap = 24;
  const totalW = state.boards.length * w + (state.boards.length - 1) * gap;
  let ox = (W - totalW) / 2;
  const oy = 24;
  for (const board of state.boards) {
    drawBoard(ctx, board, ox, oy);
    ox += w + gap;
  }
}
