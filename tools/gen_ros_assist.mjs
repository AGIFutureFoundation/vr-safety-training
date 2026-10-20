/**
 * ROS-ASSIST: synthetic worker-assist robot episodes in a ROS 2 message layout, one or two per union, for training and
 * evaluating policies that help a trade worker rather than replace one.
 *
 *     node tools/gen_ros_assist.mjs
 *
 * What it is, plainly:
 *   * Every union with a scope (the categories its training fund covers, from WebXR/shared/unions.js) is paired with the
 *     generic assist-robot styles that suit those categories, through ROS_ASSIST_STYLE_BY_CATEGORY below. That table is a
 *     design mapping, not a claim that any union, employer or site uses these robots.
 *   * Each episode is a simulated, seeded run at 10 Hz: a worker approaches the robot's work zone and leaves again, and on
 *     some episodes presses the e-stop. A governor (ros-assist speed and separation, below) caps the commanded speed by
 *     the worker's distance and holds zero while the e-stop is held. tools/check_ros_assist.mjs re-checks every step.
 *   * Topics carry ROS 2 message type names (sensor_msgs/msg/JointState, geometry_msgs/msg/Twist, std_msgs/msg/Bool, ...)
 *     in a compact columnar JSON layout. It is not a rosbag and ROS is not installed or required; a loader can map each
 *     topic's columns onto the named message type.
 *   * Robots are generic by kind: no brand, model or company is named. Every episode is labelled synthetic, consent null,
 *     no hardware run. Instructions are English only; translations need a reviewed source and are not included.
 *
 * Writes, deterministically (no timestamps):
 *   exports/ros-assist/index.json        the styles, the mapping, the governor and the per-union coverage
 *   exports/ros-assist/<style>.json      the episodes for one robot style
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ROS_ASSIST_DIR = join(ROOT, "exports", "ros-assist");
export const ROS_ASSIST_VERSION = "ros-assist/1";
export const ROS_ASSIST_HZ = 10;
export const ROS_ASSIST_STEPS = 40;

// The generic assist-robot styles: their joints or axes, the topics they publish and their top working speed (m/s).
export const ROS_ASSIST_STYLES = {
  "cobot-arm": { label: "Collaborative arm", maxSpeed: 0.5, topics: { "/joint_states": "sensor_msgs/msg/JointState", "/safety/human_distance": "sensor_msgs/msg/Range", "/estop": "std_msgs/msg/Bool" }, joints: ["shoulder_pan", "shoulder_lift", "elbow", "wrist_1", "wrist_2", "wrist_3"] },
  "amr": { label: "Autonomous mobile robot", maxSpeed: 1.2, topics: { "/cmd_vel": "geometry_msgs/msg/Twist", "/odom": "nav_msgs/msg/Odometry", "/safety/human_distance": "sensor_msgs/msg/Range", "/estop": "std_msgs/msg/Bool" } },
  "gantry": { label: "Gantry hoist", maxSpeed: 0.8, topics: { "/trolley/position": "std_msgs/msg/Float64", "/hoist/load": "std_msgs/msg/Float64", "/safety/human_distance": "sensor_msgs/msg/Range", "/estop": "std_msgs/msg/Bool" } },
  "quadruped": { label: "Inspection quadruped", maxSpeed: 1.0, topics: { "/cmd_vel": "geometry_msgs/msg/Twist", "/inspection/reading": "std_msgs/msg/Float64", "/safety/human_distance": "sensor_msgs/msg/Range", "/estop": "std_msgs/msg/Bool" } },
};

// Which style assists the work of each category. A design mapping; a category absent here gets no assist robot.
export const ROS_ASSIST_STYLE_BY_CATEGORY = {
  "Manufacturing & Automation": "cobot-arm", "Culinary & Hospitality": "cobot-arm", "Sewing & Garment Trades": "cobot-arm", "Surface Prep & Coatings": "cobot-arm",
  "Mobility & Transit": "amr", "Construction & Structural Trades": "amr", "Healthcare Support": "amr", "Grounds & Landscaping": "amr",
  "Maritime & Ports": "gantry", "Entertainment & Live Events": "gantry",
  "Building Systems & Facilities": "quadruped", "Energy & Power": "quadruped", "Water & Environmental": "quadruped",
  "Environmental Monitoring": "quadruped", "Emergency Services": "quadruped", "Connectivity & Telecom": "quadruped",
};
const STYLE_ORDER = ["cobot-arm", "amr", "gantry", "quadruped"];

/** The governor: the speed a robot may command with a worker at distance d (m), or 0 while the e-stop is held. */
export function rosAssistLimit(style, d, estop) {
  if (estop) return 0;
  const top = ROS_ASSIST_STYLES[style].maxSpeed;
  if (d < 0.5) return 0;                 // protective stop inside half a metre
  if (d < 1.5) return Math.min(top, 0.25); // reduced speed in the collaborative zone
  return top;
}

/** A small seeded generator so every run writes the same bytes. */
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hash(text) { let h = 2166136261; for (const c of text) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const r3 = (x) => Math.round(x * 1000) / 1000;

/** One episode for one union and style. Pure: the union, style and index fix the seed. */
export function rosAssistEpisode(union, style, index) {
  const rand = rng(hash(`${union.id}:${style}:${index}`));
  const spec = ROS_ASSIST_STYLES[style];
  const estopAt = index % 2 === 1 ? 14 + Math.floor(rand() * 8) : -1; // odd episodes press the e-stop
  const estopFor = 6;
  const t = [], dist = [], estop = [], speed = [], desired = [];
  let pos = 0;
  const pos_ = [];
  for (let k = 0; k < ROS_ASSIST_STEPS; k++) {
    const phase = k / (ROS_ASSIST_STEPS - 1);
    const d = r3(4.0 - 3.6 * Math.sin(Math.PI * phase) + (rand() - 0.5) * 0.1); // the worker comes close mid-run, then leaves
    const e = estopAt >= 0 && k >= estopAt && k < estopAt + estopFor;
    const want = r3(spec.maxSpeed * (0.8 + rand() * 0.2));
    const v = r3(Math.min(want, rosAssistLimit(style, d, e)));
    pos = r3(pos + v / ROS_ASSIST_HZ);
    t.push(r3(k / ROS_ASSIST_HZ)); dist.push(d); estop.push(e); desired.push(want); speed.push(v); pos_.push(pos);
  }
  const topics = {};
  for (const [name, type] of Object.entries(spec.topics)) {
    if (name === "/estop") topics[name] = { type, data: estop };
    else if (name === "/safety/human_distance") topics[name] = { type, range: dist };
    else if (name === "/joint_states") topics[name] = { type, name: spec.joints, velocity_scale: speed, position_progress: pos_ };
    else if (name === "/cmd_vel") topics[name] = { type, linear_x: speed, angular_z: speed.map(() => 0) };
    else if (name === "/odom") topics[name] = { type, position_x: pos_ };
    else if (name === "/trolley/position") topics[name] = { type, data: pos_ };
    else if (name === "/hoist/load") topics[name] = { type, data: speed.map(() => 0.6) }; // a constant 0.6 t load on the hook
    else if (name === "/inspection/reading") topics[name] = { type, data: dist.map((d) => r3(20 + d)) };
  }
  return {
    id: `ros-assist-${union.id}-${style}-${index}`,
    union: union.id,
    style,
    synthetic: true,
    consent: null,
    hardware_run: false,
    lang: "en",
    instruction: `Assist a ${union.abbrev} worker: the ${spec.label.toLowerCase()} keeps working and slows or stops as the worker comes near${estopAt >= 0 ? "; the worker presses the e-stop once" : ""}.`,
    hz: ROS_ASSIST_HZ,
    t,
    desired_speed: desired,
    topics,
  };
}

/** The whole dataset: the index and one episode list per style. */
export async function buildRosAssist() {
  const { UNIONS } = await import(pathToFileURL(join(ROOT, "WebXR", "shared", "unions.js")).href);
  const byStyle = Object.fromEntries(STYLE_ORDER.map((s) => [s, []]));
  const coverage = [];
  for (const u of [...UNIONS].sort((a, b) => a.id.localeCompare(b.id))) {
    const styles = STYLE_ORDER.filter((s) => (u.scope ?? []).some((c) => ROS_ASSIST_STYLE_BY_CATEGORY[c] === s)).slice(0, 2);
    coverage.push({ union: u.id, styles });
    for (const s of styles) { byStyle[s].push(rosAssistEpisode(u, s, 0)); byStyle[s].push(rosAssistEpisode(u, s, 1)); }
  }
  const index = {
    version: ROS_ASSIST_VERSION,
    synthetic: true, consent: null, hardware_run: false,
    layout: "ROS 2 message type names, compact columnar JSON per topic; not a rosbag; ROS not required",
    hz: ROS_ASSIST_HZ, steps: ROS_ASSIST_STEPS,
    governor: { protective_stop_m: 0.5, reduced_zone_m: 1.5, reduced_speed_mps: 0.25, estop: "zero speed while held" },
    styles: Object.fromEntries(STYLE_ORDER.map((s) => [s, { label: ROS_ASSIST_STYLES[s].label, max_speed_mps: ROS_ASSIST_STYLES[s].maxSpeed, topics: ROS_ASSIST_STYLES[s].topics, episodes: byStyle[s].length, file: `${s}.json` }])),
    style_by_category: ROS_ASSIST_STYLE_BY_CATEGORY,
    coverage,
    languages: ["en"],
    not_included: ["translated instructions (need a reviewed source)", "any brand, model or company", "any hardware run"],
  };
  return { index, byStyle };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { index, byStyle } = await buildRosAssist();
  mkdirSync(ROS_ASSIST_DIR, { recursive: true });
  writeFileSync(join(ROS_ASSIST_DIR, "index.json"), JSON.stringify(index, null, 2) + "\n");
  for (const [s, eps] of Object.entries(byStyle)) writeFileSync(join(ROS_ASSIST_DIR, `${s}.json`), JSON.stringify({ version: ROS_ASSIST_VERSION, style: s, episodes: eps }) + "\n");
  const covered = index.coverage.filter((c) => c.styles.length).length;
  const total = Object.values(byStyle).reduce((n, e) => n + e.length, 0);
  console.log(`Wrote ${ROS_ASSIST_DIR.replace(ROOT + "/", "")} — ${total} episodes, ${covered} of ${index.coverage.length} unions with an assist style.`);
}
