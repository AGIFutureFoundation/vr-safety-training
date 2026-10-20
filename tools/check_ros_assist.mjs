// check_ros_assist: the synthetic worker-assist episodes in a ROS 2 message layout (tools/gen_ros_assist.mjs).
//
//   node tools/check_ros_assist.mjs
//
// Proves the files are what the generator writes now; every union is a registry union; every topic carries a known
// ROS 2 message type; the governor holds on every step of every episode (no speed above the limit for the worker's
// distance, zero inside half a metre and while the e-stop is held); every episode is labelled synthetic, consent null,
// no hardware run; and nothing names a brand, partner or customer. Node only, no browser, no ROS install.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const G = await import(pathToFileURL(join(ROOT, "tools", "gen_ros_assist.mjs")).href);
const { UNIONS } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "unions.js")).href);

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_ros_assist: worker-assist robot episodes in a ROS 2 layout");

const { index, byStyle } = await G.buildRosAssist();

// 1 the files on disk are what the generator writes now
const onDisk = (f) => (existsSync(join(G.ROS_ASSIST_DIR, f)) ? readFileSync(join(G.ROS_ASSIST_DIR, f), "utf8") : null);
check(onDisk("index.json") === JSON.stringify(index, null, 2) + "\n", "index.json is current (run tools/gen_ros_assist.mjs)");
for (const [s, eps] of Object.entries(byStyle)) {
  check(onDisk(`${s}.json`) === JSON.stringify({ version: G.ROS_ASSIST_VERSION, style: s, episodes: eps }) + "\n", `${s}.json is current`);
}

// 2 every union is a registry union, and the coverage lists every union once
const ids = new Set(UNIONS.map((u) => u.id));
check(index.coverage.length === UNIONS.length && index.coverage.every((c) => ids.has(c.union)), `coverage lists every registry union once (${index.coverage.length})`);
const episodes = Object.values(byStyle).flat();
check(episodes.every((e) => ids.has(e.union)), "every episode names a registry union");

// 3 every topic carries a known ROS 2 message type
const TYPES = new Set(["sensor_msgs/msg/JointState", "sensor_msgs/msg/Range", "std_msgs/msg/Bool", "std_msgs/msg/Float64", "geometry_msgs/msg/Twist", "nav_msgs/msg/Odometry"]);
check(episodes.every((e) => Object.values(e.topics).every((tp) => TYPES.has(tp.type))), "every topic carries a known ROS 2 message type");
check(episodes.every((e) => e.topics["/estop"] && e.topics["/safety/human_distance"]), "every episode publishes the e-stop and the worker's distance");

// 4 the governor holds on every step
let steps = 0, breaches = [];
for (const e of episodes) {
  const d = e.topics["/safety/human_distance"].range, stop = e.topics["/estop"].data;
  const v = e.topics["/cmd_vel"]?.linear_x ?? e.topics["/joint_states"]?.velocity_scale ?? null;
  const speed = v ?? e.t.map((_, k) => (k === 0 ? e.topics["/trolley/position"].data[0] : e.topics["/trolley/position"].data[k] - e.topics["/trolley/position"].data[k - 1]) * e.hz);
  for (let k = 0; k < e.t.length; k++) {
    steps++;
    const lim = G.rosAssistLimit(e.style, d[k], stop[k]);
    if (speed[k] > lim + 1e-6) breaches.push(`${e.id} step ${k}: ${speed[k]} > ${lim}`);
  }
}
check(breaches.length === 0, `the governor holds on every step (${steps} steps${breaches.length ? `; ${breaches.slice(0, 3).join("; ")}` : ""})`);
check(Object.keys(byStyle).every((s) => byStyle[s].some((e) => e.topics["/estop"].data.some(Boolean))), "every style has episodes where the e-stop is pressed");

// 5 labels: synthetic, consent null, no hardware run, English only (translations are listed as not included)
check(episodes.every((e) => e.synthetic === true && e.consent === null && e.hardware_run === false), "every episode is labelled synthetic, consent null, no hardware run");
check(episodes.every((e) => e.lang === "en") && index.languages.length === 1 && index.not_included.some((x) => /translated/.test(x)), "instructions are English only, and translations are listed as not included");

// 6 no brand, partner or customer claim anywhere in the dataset
const text = JSON.stringify(index) + JSON.stringify(episodes.map((e) => e.instruction));
check(!/\b(partner(ship)?|customer|endorse|deployed at|Inc\.|Ltd\.|GmbH)\b/i.test(text), "no partner, customer or company claim");

// 7 deterministic: a second build is identical
const again = await G.buildRosAssist();
check(JSON.stringify(again) === JSON.stringify({ index, byStyle }), "two builds give the same dataset");

const covered = index.coverage.filter((c) => c.styles.length).length;
console.log(`  · ${episodes.length} episodes over ${Object.keys(byStyle).length} robot styles; ${covered} of ${index.coverage.length} unions have an assist style`);
console.log(`check_ros_assist: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
