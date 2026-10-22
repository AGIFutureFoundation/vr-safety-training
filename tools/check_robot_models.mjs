// check_robot_models: the detailed robot models and their live simulation (WebXR/shared/robot-models.js).
//
//   node tools/check_robot_models.mjs
//
// tools/check_fleet.mjs already builds every model headlessly against its mesh budget, footprint and parts. This proves
// the rest: the speed governor is the one the worker-assist episodes record (exports/ros-assist/index.json); the zone
// and speed rule holds at and around both boundaries; forward kinematics puts the tool where the chain says, keeps
// every link its length in any pose and turns with the base; every preset path sits inside the joint limits; the path
// player never moves the tool faster than the governor allows and holds it dead still in the stop zone and under an
// e-stop; the robot cell, cobot bench and palletizer are built from these arms; the robot stations drive them live;
// and no manufacturer's name appears. Node only, no browser.

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "WebXR", "shared", "robot-models.js");

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };
const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;
const nearV = (a, b, eps = 1e-6) => a.length === b.length && a.every((v, i) => near(v, b[i], eps));

console.log("check_robot_models: detailed robots, kinematics and the live governor");

// The module imports three.js from a CDN and the shared kits; the pure functions under test need none of them.
const text = readFileSync(SRC, "utf8");
const dir = mkdtempSync(join(tmpdir(), "rbm-"));
process.on("exit", () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* scratch */ } });
const stubbed = text
  .replace(/^import \* as THREE from .*$/m, "const THREE = { Vector3: class { getWorldPosition() { return this; } } };")
  .replace(/^import \{[^}]*\} from "\.\/kit\.js";$/m, "const box = () => {}, cyl = () => {}, ball = () => {}, torus = () => {}, lathe = () => {}, hose = () => {}, ownMaterial = (m) => m;")
  .replace(/^import \{[^}]*\} from "\.\/fleet\.js";$/m, "const FL = {}, flRig = () => {}, flDone = () => {}, flRod = () => {}, flStrut = () => {};");
writeFileSync(join(dir, "rbm.mjs"), stubbed);
const M = await import(pathToFileURL(join(dir, "rbm.mjs")).href);

// 1 the governor is the worker-assist episodes' governor
const ros = JSON.parse(readFileSync(join(ROOT, "exports", "ros-assist", "index.json"), "utf8")).governor;
check(M.RB_GOVERNOR.protectiveStopM === ros.protective_stop_m && M.RB_GOVERNOR.reducedZoneM === ros.reduced_zone_m && M.RB_GOVERNOR.reducedSpeedMps === ros.reduced_speed_mps,
  `the governor matches exports/ros-assist (stop ${ros.protective_stop_m} m, reduced ${ros.reduced_zone_m} m at ${ros.reduced_speed_mps} m/s)`);

// 2 zones and speed limits at and around the boundaries
const table = [[0.2, "stop", 0], [0.5, "stop", 0], [0.51, "reduced", 0.25], [1.5, "reduced", 0.25], [1.51, "normal", 0.8], [Infinity, "normal", 0.8]];
check(table.every(([d, z, v]) => M.rbZone(d) === z && M.rbSpeedLimit(d, { nominal: 0.8 }) === v), "zones and speed limits hold at and around 0.5 m and 1.5 m");
check(M.rbSpeedLimit(5, { estop: true, nominal: 1 }) === 0 && M.rbZone(5, true) === "stop", "an e-stop is zero speed at any distance");
check(M.rbSpeedLimit(1.0, { nominal: 0.1 }) === 0.1, "a nominal speed below the reduced cap is kept, not raised");
check(M.rbSpeedLimit(M.rbDistForZone("reduced"), { nominal: 1 }) === 0.25 && M.rbSpeedLimit(M.rbDistForZone("stop")) === 0 && M.rbSpeedLimit(M.rbDistForZone("normal"), { nominal: 0.7 }) === 0.7, "rbDistForZone maps a station's own field zones onto the same rule");

// 3 forward kinematics
const sum = (kind, axis) => M.RB_CHAINS[kind].base[axis] + M.RB_CHAINS[kind].links.reduce((s, l) => s + l.at[axis], 0) + M.RB_CHAINS[kind].tcp[axis];
for (const kind of ["arm6", "cobot6"]) {
  const home = M.rbFk(kind, [0, 0, 0, 0, 0, 0]).tcp;
  check(nearV(home, [sum(kind, 0), sum(kind, 1), sum(kind, 2)]), `${kind}: the home pose puts the tool where the chain adds up (${home.map((v) => v.toFixed(2)).join(", ")})`);
  const yaw = M.rbFk(kind, [Math.PI / 2, 0, 0, 0, 0, 0]).tcp;
  check(near(yaw[0], home[2], 1e-9) && near(yaw[2], -home[0], 1e-9) && near(yaw[1], home[1], 1e-9), `${kind}: a quarter turn of j1 swings the tool from +Z to +X`);
  const scaled = M.rbFk(kind, [0.3, 0.2, -0.4, 0.5, 0.6, 0.7], 0.72).tcp, unit = M.rbFk(kind, [0.3, 0.2, -0.4, 0.5, 0.6, 0.7], 1).tcp;
  check(nearV(scaled, unit.map((v) => v * 0.72), 1e-9), `${kind}: scaling the arm scales its reach exactly`);
  // every link keeps its length whatever the pose
  const lens = M.RB_CHAINS[kind].links.slice(1).map((l) => Math.hypot(...l.at));
  let rigid = true;
  for (let n = 0; n < 50; n++) {
    const q = M.RB_CHAINS[kind].limits.map(([lo, hi], i) => lo + ((Math.sin(n * 1.7 + i * 2.3) + 1) / 2) * (hi - lo));
    const pv = M.rbFk(kind, q).pivots;
    for (let i = 1; i < pv.length; i++) if (!near(Math.hypot(pv[i][0] - pv[i - 1][0], pv[i][1] - pv[i - 1][1], pv[i][2] - pv[i - 1][2]), lens[i - 1], 1e-9)) rigid = false;
  }
  check(rigid, `${kind}: every link keeps its length in 50 poses across the joint limits`);
  // presets inside the limits
  const pathOk = Object.values(M.RB_PATHS[kind]).every((path) => path.every((q) => nearV(M.rbClamp(kind, q), q)));
  check(pathOk, `${kind}: every preset path sits inside the joint limits`);
  const lowest = Math.min(...M.RB_PATHS[kind].pickPlace.map((q) => M.rbFk(kind, q).tcp[1]));
  check(lowest > 0.05, `${kind}: the pick-and-place path keeps the tool above the floor (lowest ${lowest.toFixed(2)} m)`);
}

// 4 the path player never outruns the governor
for (const kind of ["arm6", "cobot6"]) {
  const pl = M.rbArmPlayer(kind, M.RB_PATHS[kind].pickPlace, { k: kind === "arm6" ? 0.72 : 1 });
  const k = kind === "arm6" ? 0.72 : 1;
  let prev = M.rbFk(kind, pl.q, k).tcp, over = 0, crept = 0, moved = 0;
  const dt = 0.05;
  for (let i = 0; i < 2400; i++) {
    const phase = Math.floor(i / 150) % 5;
    const env = [{ distM: Infinity }, { distM: 1.0 }, { distM: 0.4 }, { distM: 3, estop: true }, { distM: 1.4 }][phase];
    const st = pl.tick(dt, { ...env, nominal: 0.6 });
    const d = Math.hypot(st.tcp[0] - prev[0], st.tcp[1] - prev[1], st.tcp[2] - prev[2]);
    const limit = M.rbSpeedLimit(env.distM, { estop: env.estop, nominal: 0.6 });
    if (d / dt > limit * 1.02 + 1e-9) over += 1;
    if (limit === 0 && d > 1e-12) crept += 1;
    if (limit > 0) moved += d;
    prev = st.tcp;
  }
  check(over === 0, `${kind}: the tool never moves faster than the governor allows over 2,400 ticks${over ? ` (${over} over)` : ""}`);
  check(crept === 0, `${kind}: the tool holds dead still in the stop zone and under an e-stop${crept ? ` (${crept} ticks crept)` : ""}`);
  check(moved > 5, `${kind}: the arm actually works its path when allowed (${moved.toFixed(1)} m of tool travel)`);
}

// 5 the shared equipment builds its arms from these models, and the stations drive them live
const eq = readFileSync(join(ROOT, "WebXR", "shared", "equipment.js"), "utf8");
check(/import \{ rbArm6Into, rbCobotInto \} from "\.\/robot-models\.js";/.test(eq), "equipment.js imports the detailed arm builders");
for (const [fn, call] of [["robotCell", "rbArm6Into"], ["cobotBench", "rbCobotInto"], ["roboticPalletizer", "rbArm6Into"]]) {
  const body = eq.slice(eq.indexOf(`export function ${fn}(`), eq.indexOf("\n}\n", eq.indexOf(`export function ${fn}(`)));
  check(body.includes(`${call}(rig`) && /userData\.chain = "(arm6|cobot6)"/.test(body), `equipment.js ${fn} builds its arm with ${call} and names its chain`);
}
const SIMS = join(ROOT, "WebXR", "smartcity", "js", "sims");
const live = {
  "rt-speed-separation-monitoring-setup": /rbLive\(rig/, "rt-teach-pendant-safe-jogging": /rbLive\(cell/, "rt-robot-estop-recovery-and-restart": /rbLive\(cell/,
  "rt-cobot-power-force-limit-check": /rbLive\(rig/, "ad-cobot-risk-assessment-and-speed-separation": /rbLive\(rig/, "rp-teleop-demonstration-collection": /rbLive\(rig/,
  "rp-robot-policy-evaluation-review": /rbLive\(rig/, "vb-supervising-agent-dispatched-robots": /quadrupedRobot\(/, "ad-amr-fleet-traffic-and-estop-drill": /mobileRobot\(/,
};
const notLive = Object.entries(live).filter(([id, re]) => { const f = join(SIMS, `${id}.js`); return !existsSync(f) || !re.test(readFileSync(f, "utf8")) || !readFileSync(f, "utf8").includes("shared/robot-models.js"); }).map(([id]) => id);
check(notLive.length === 0, `${Object.keys(live).length} robot stations drive the detailed models live${notLive.length ? ` (not: ${notLive.join(", ")})` : ""}`);
const ssm = readFileSync(join(SIMS, "rt-speed-separation-monitoring-setup.js"), "utf8");
check(/rbDistForZone\(zone\)/.test(ssm) && /inField\(protField/.test(ssm) && /inField\(warnField/.test(ssm), "the speed-and-separation station runs the arm from the fields as the learner sets them");

// 6 generic: no manufacturer's name
const BRANDS = ["KUKA", "FANUC", "Fanuc", "ABB", "Yaskawa", "Motoman", "Universal Robots", "Kawasaki", "Stäubli", "Staubli", "Denso", "Omron", "Boston Dynamics", "Unitree", "ANYbotics", "Clearpath", "Locus Robotics", "Fetch Robotics", "Techman", "Doosan", "Franka"];
const hits = BRANDS.filter((b) => new RegExp(`\\b${b}\\b`).test(text));
check(hits.length === 0, `no manufacturer's name in robot-models.js${hits.length ? ` (${hits.join(", ")})` : ""}`);
check(Object.keys(M.RB_BUDGET).length >= 7 && Object.values(M.RB_BUDGET).every((e) => typeof M.RB_BUILDERS[e.build] === "function"), `every budget entry has its builder (${Object.keys(M.RB_BUDGET).length} entries, ${Object.keys(M.RB_BUILDERS).length} builders)`);

console.log(`  · arm6 home tool ${M.rbFk("arm6", []).tcp.map((v) => v.toFixed(2)).join(", ")} m; cobot6 home tool ${M.rbFk("cobot6", []).tcp.map((v) => v.toFixed(2)).join(", ")} m`);
console.log(`check_robot_models: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
