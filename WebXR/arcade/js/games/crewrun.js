// Crew Run — side-scrolling platformer.
//
// A hard-hatted apprentice runs a jobsite: jump the trenches, duck the
// swinging loads, stomp the hazard icons, and pick up PPE along the way. A
// foreman checks your PPE count at the end of each of three stages.
//
// create()/step() are pure (no DOM, no canvas, no audio); render() draws the
// pixel art and is the only function that touches a canvas.
//
// "What this teaches": PPE only helps if you're still wearing it when you
// need it — pick it up, keep it on, get checked.

export const CR_WIDTH = 256;
export const CR_HEIGHT = 160;
export const CR_TEACHES = "PPE only helps if you're still wearing it when you need it: pick it up, keep it on, get checked.";

const GROUND_Y = 0;
const GRAVITY = 780;
const JUMP_V = 300;
const HITBOX_W = 14;
const SPAWN_AHEAD = 300;

function crRandFn(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const CR_STAGES = [
  { name: "Laydown yard", length: 1100, speed: 100, gapMin: 1.05, gapMax: 1.7, ppeNeeded: 3 },
  { name: "Steel erection", length: 1400, speed: 128, gapMin: 0.9, gapMax: 1.45, ppeNeeded: 4 },
  { name: "Punch list", length: 1700, speed: 156, gapMin: 0.78, gapMax: 1.25, ppeNeeded: 5 },
];

function stageDef(state) { return CR_STAGES[Math.min(state.stage - 1, CR_STAGES.length - 1)]; }
function crSay(state, text, dur = 1.4) { state.message = text; state.messageT = dur; }

function spawnObstacle(state) {
  const r = state.rng();
  const kind = r < 0.24 ? "trench" : r < 0.48 ? "load" : r < 0.72 ? "hazard" : "ppe";
  const x = state.stageDistance + SPAWN_AHEAD + state.rng() * 60;
  if (kind === "trench") state.obstacles.push({ kind, x, w: 40 + state.rng() * 26 });
  else if (kind === "load") state.obstacles.push({ kind, x, w: 40, h: 44 });
  else if (kind === "hazard") state.obstacles.push({ kind, x, w: 18, alive: true });
  else state.obstacles.push({ kind: "ppe", x, taken: false, y: state.rng() < 0.4 ? 46 : 0 });
}

function hit(state, events) {
  if (state.invuln > 0 || state.over) return;
  state.lives -= 1;
  state.invuln = 1.1;
  events.push({ type: "hit", lives: state.lives });
  if (state.lives <= 0) { state.over = true; crSay(state, "Game over", 3); }
  else crSay(state, "Mind the site!");
}

export function crCreate(opts = {}) {
  return {
    rng: crRandFn(opts.seed ?? 1),
    stage: 1,
    level: 1,
    distance: 0,
    stageDistance: 0,
    y: 0,
    vy: 0,
    ducking: false,
    airborne: false,
    lives: 3,
    score: 0,
    ppe: 0,
    over: false,
    win: false,
    obstacles: [],
    nextSpawn: 0.4,
    invuln: 0.4,
    message: "Run!",
    messageT: 1.2,
    t: 0,
  };
}

export function crStep(state, dt, input = {}) {
  const events = [];
  if (state.over) return events;
  state.t += dt;
  if (state.messageT > 0) state.messageT -= dt;
  if (state.invuln > 0) state.invuln -= dt;
  const s = stageDef(state);

  if (input.up && !state.airborne && !state.ducking) { state.vy = JUMP_V; state.airborne = true; }
  state.ducking = !!input.down && !state.airborne;

  state.vy -= GRAVITY * dt;
  state.y += state.vy * dt;
  if (state.y <= GROUND_Y) { state.y = GROUND_Y; state.vy = 0; state.airborne = false; }
  else state.airborne = true;

  const dx = s.speed * dt;
  state.distance += dx;
  state.stageDistance += dx;
  state.score += dx * 0.05;

  state.nextSpawn -= dt;
  if (state.nextSpawn <= 0) {
    spawnObstacle(state);
    state.nextSpawn = s.gapMin + state.rng() * (s.gapMax - s.gapMin);
  }

  for (const o of state.obstacles) {
    if (o.dead) continue;
    const near = Math.abs(state.stageDistance - o.x) < ((o.w ?? 18) / 2 + HITBOX_W / 2);
    if (!near) continue;
    if (o.kind === "trench") {
      if (!state.airborne && state.y <= 0.001) hit(state, events);
    } else if (o.kind === "load") {
      if (!state.ducking && state.y < (o.h ?? 44)) hit(state, events);
    } else if (o.kind === "hazard" && o.alive) {
      if (state.airborne && state.vy < 0 && state.y < 34) {
        o.alive = false; o.dead = true; state.score += 30;
        events.push({ type: "stomp" });
      } else if (!state.airborne) {
        hit(state, events);
      }
    } else if (o.kind === "ppe" && !o.taken) {
      const reachable = o.y > 0 ? state.airborne : !state.ducking;
      if (reachable) {
        o.taken = true; o.dead = true; state.ppe += 1; state.score += 20;
        events.push({ type: "ppe" });
      }
    }
  }
  state.obstacles = state.obstacles.filter((o) => state.stageDistance - o.x < 90 && !o.dead);

  if (state.stageDistance >= s.length) {
    const passed = state.ppe >= s.ppeNeeded;
    state.score += passed ? 200 * state.stage : 50;
    events.push({ type: "checkpoint", passed });
    crSay(state, passed ? "Foreman: fully kitted — pass" : "Foreman: short on PPE", 2);
    if (state.stage >= CR_STAGES.length) {
      state.over = true; state.win = true; crSay(state, "Site cleared!", 3);
    } else {
      state.stage += 1;
      state.level = state.stage;
      state.stageDistance = 0;
      state.ppe = 0;
      state.obstacles = [];
    }
  }

  return events;
}

// ---------------------------------------------------------------- rendering

const CR_GROUND_PX = CR_HEIGHT - 24;
const worldToScreen = (state, wx) => CR_WIDTH * 0.24 + (wx - state.stageDistance);

export function crRender(ctx, state, W = CR_WIDTH, H = CR_HEIGHT) {
  const groundPx = H - 24;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#0e1a12";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1c2a1f";
  for (let i = 0; i < 6; i++) {
    const x = (i * 60 - (state.distance * 0.2) % 60);
    ctx.fillRect(x, 10, 26, H - 34);
  }
  ctx.fillStyle = "#3a4b3d";
  ctx.fillRect(0, groundPx, W, H - groundPx);
  ctx.fillStyle = "#2a382c";
  for (let x = -((state.stageDistance | 0) % 20); x < W; x += 20) ctx.fillRect(x, groundPx, 10, 3);

  for (const o of state.obstacles) {
    const sx = worldToScreen(state, o.x);
    if (sx < -40 || sx > W + 40) continue;
    if (o.kind === "trench") {
      ctx.fillStyle = "#0e1a12";
      ctx.fillRect(sx - o.w / 2, groundPx, o.w, H - groundPx);
    } else if (o.kind === "load") {
      ctx.strokeStyle = "#556"; ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, groundPx - o.h); ctx.stroke();
      ctx.fillStyle = "#ffc93c";
      ctx.fillRect(sx - o.w / 2, groundPx - o.h, o.w, 14);
    } else if (o.kind === "hazard" && o.alive) {
      ctx.fillStyle = "#ff5a5a";
      ctx.beginPath();
      ctx.moveTo(sx, groundPx - 18); ctx.lineTo(sx - 9, groundPx); ctx.lineTo(sx + 9, groundPx);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#1b1300"; ctx.fillRect(sx - 1, groundPx - 12, 2, 6);
    } else if (o.kind === "ppe" && !o.taken) {
      const py = groundPx - 10 - (o.y > 0 ? 30 : 0);
      ctx.fillStyle = "#ffc93c";
      ctx.fillRect(sx - 6, py - 6, 12, 8);
      ctx.fillStyle = "#0e1a12";
      ctx.fillRect(sx - 3, py - 3, 6, 2);
    }
  }

  const px = CR_WIDTH * 0.24;
  const py = groundPx - 22 - state.y;
  const blink = state.invuln > 0 && Math.floor(state.t * 12) % 2 === 0;
  if (!blink) {
    ctx.fillStyle = "#ffc93c";
    ctx.fillRect(px - 6, py, 12, 5);
    ctx.fillStyle = "#4fd1ff";
    const h = state.ducking ? 10 : 18;
    ctx.fillRect(px - 5, py + 5, 10, h);
    if (!state.ducking) { ctx.fillStyle = "#2c3648"; ctx.fillRect(px - 5, py + 23, 4, 6); ctx.fillRect(px + 1, py + 23, 4, 6); }
  }

  ctx.fillStyle = "#f1f5fb";
  ctx.font = "10px monospace";
  ctx.fillText(`SCORE ${Math.floor(state.score)}`, 6, 12);
  ctx.fillText(`STAGE ${state.level}/3`, W - 60, 12);
  ctx.fillText(`PPE ${state.ppe}/${stageDef(state).ppeNeeded}`, 6, H - 6);
  ctx.fillText("♥".repeat(Math.max(0, state.lives)), W - 40, H - 6);
  if (state.messageT > 0) {
    ctx.fillStyle = "#ffc93c";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(state.message, W / 2, 24);
    ctx.textAlign = "left";
  }
}
