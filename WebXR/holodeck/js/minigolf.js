/**
 * Mini-golf course data and ball physics — pure data and arithmetic, no
 * THREE dependency, so this can be unit-tested with plain Node (see
 * tools/check_holodeck.mjs) the same way the physics-free parts of the
 * union-trade sims are checked without a browser.
 *
 * The 3D rendering of a hole (turning this data into meshes, with theme
 * colors and props) lives in app.js, which already imports THREE — keeping
 * that split is what makes the physics testable at all.
 */

// A local, uniquely-named clamp rather than importing shared/kit.js's: that
// module's own top-level import of THREE (from a remote URL) would make
// this file unloadable under plain Node, breaking tools/check_holodeck.mjs's
// ability to test this physics code without a browser.
const clampNum = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const BALL_RADIUS = 0.055;
// A fixed deceleration (m/s^2), not a percentage-per-frame decay: with a
// percentage decay a fast putt coasts for many seconds approaching zero
// asymptotically, which felt broken in practice (a browser test caught a
// ball still "Rolling…" 1.5s after a routine putt). Linear friction stops
// in bounded time — roughly v0/FRICTION_DECEL seconds — and covers a
// bounded distance — roughly v0^2/(2*FRICTION_DECEL) — which is what lets
// MAX_PUTT_SPEED be tuned against the longest hole below.
export const FRICTION_DECEL = 2.4;
export const MAX_PUTT_SPEED = 6.5;
export const MOVING_EPS = 0.02;
export const SINK_SPEED_LIMIT = 1.4;
export const WALL_RESTITUTION = 0.6;

// Three hole shapes, theme-agnostic — theme only changes how a hole is
// decorated (props, colors), never its geometry. Walls are axis-aligned
// rectangles in the hole's own local space: {x, z} is the wall's centre,
// {w, d} its full width (along local x) and depth (along local z).
export const HOLE_LAYOUTS = [
  {
    id: "straight",
    name: "The Straightaway",
    par: 2,
    width: 2.4,
    length: 6.5,
    tee: { x: 0, z: 0.6 },
    cup: { x: 0, z: 5.9, r: 0.16 },
    walls: [],
  },
  {
    id: "dogleg-left",
    name: "The Bend",
    par: 3,
    width: 3.2,
    length: 7.5,
    tee: { x: -0.9, z: 0.6 },
    cup: { x: 1.1, z: 6.9, r: 0.16 },
    walls: [
      { x: 0.4, z: 3.6, w: 1.8, d: 0.3 },
    ],
  },
  {
    id: "gauntlet",
    name: "The Gauntlet",
    par: 4,
    width: 2.8,
    length: 9.0,
    tee: { x: 0, z: 0.6 },
    cup: { x: 0, z: 8.4, r: 0.16 },
    walls: [
      { x: -0.65, z: 3.0, w: 0.3, d: 1.6 },
      { x: 0.65, z: 5.6, w: 0.3, d: 1.6 },
    ],
  },
];

export function buildCourse(theme, holeIds = HOLE_LAYOUTS.map((h) => h.id)) {
  return {
    themeId: theme.id,
    holes: HOLE_LAYOUTS.filter((h) => holeIds.includes(h.id)),
  };
}

export function createBall(hole) {
  return { x: hole.tee.x, z: hole.tee.z, vx: 0, vz: 0, r: BALL_RADIUS, sunk: false, strokes: 0 };
}

/** Launch the ball. `dirX`/`dirZ` need not be normalized; `power` is 0..1. */
export function putt(ball, dirX, dirZ, power) {
  const len = Math.hypot(dirX, dirZ) || 1;
  const speed = clampNum(power, 0, 1) * MAX_PUTT_SPEED;
  ball.vx = (dirX / len) * speed;
  ball.vz = (dirZ / len) * speed;
  ball.strokes += 1;
}

function collideWithWall(ball, wall) {
  const halfW = wall.w / 2, halfD = wall.d / 2;
  const closestX = clampNum(ball.x, wall.x - halfW, wall.x + halfW);
  const closestZ = clampNum(ball.z, wall.z - halfD, wall.z + halfD);
  const dx = ball.x - closestX, dz = ball.z - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= ball.r * ball.r) return;
  const dist = Math.sqrt(distSq) || 0.0001;
  const nx = dx / dist, nz = dz / dist;
  const overlap = ball.r - dist;
  ball.x += nx * overlap;
  ball.z += nz * overlap;
  const vn = ball.vx * nx + ball.vz * nz;
  if (vn < 0) {
    ball.vx -= (1 + WALL_RESTITUTION) * vn * nx;
    ball.vz -= (1 + WALL_RESTITUTION) * vn * nz;
  }
}

/** Advance the ball by `dt` seconds. Returns { moving, sunk }. */
export function stepBall(ball, hole, dt) {
  if (ball.sunk) return { moving: false, sunk: true };

  const speed0 = Math.hypot(ball.vx, ball.vz);
  if (speed0 > 0) {
    const speed1 = Math.max(0, speed0 - FRICTION_DECEL * dt);
    const scale = speed1 / speed0;
    ball.vx *= scale;
    ball.vz *= scale;
  }
  if (Math.hypot(ball.vx, ball.vz) < MOVING_EPS) { ball.vx = 0; ball.vz = 0; }

  ball.x += ball.vx * dt;
  ball.z += ball.vz * dt;

  const halfW = hole.width / 2;
  if (ball.x < -halfW + ball.r) { ball.x = -halfW + ball.r; ball.vx = Math.abs(ball.vx) * WALL_RESTITUTION; }
  if (ball.x > halfW - ball.r) { ball.x = halfW - ball.r; ball.vx = -Math.abs(ball.vx) * WALL_RESTITUTION; }
  if (ball.z < ball.r) { ball.z = ball.r; ball.vz = Math.abs(ball.vz) * WALL_RESTITUTION; }
  if (ball.z > hole.length - ball.r) { ball.z = hole.length - ball.r; ball.vz = -Math.abs(ball.vz) * WALL_RESTITUTION; }

  for (const wall of hole.walls) collideWithWall(ball, wall);

  const dx = ball.x - hole.cup.x, dz = ball.z - hole.cup.z;
  const dist = Math.hypot(dx, dz);
  const speed = Math.hypot(ball.vx, ball.vz);
  if (dist < hole.cup.r && speed < SINK_SPEED_LIMIT) {
    ball.sunk = true;
    ball.vx = 0; ball.vz = 0;
    return { moving: false, sunk: true };
  }
  return { moving: speed > MOVING_EPS, sunk: false };
}
