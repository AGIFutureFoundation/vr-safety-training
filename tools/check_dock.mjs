// check_dock: the HUD panels that cover the scene fold away and move (shared/ctl-dock.js).
//
//   node tools/check_dock.mjs
//
// Node only, no browser: the clamp is pure; the module's wiring is read from its
// source; the persistence path runs against a fake document and storage. The
// pointer drag itself is not run here (a browser check is still to do).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let passed = 0, failed = 0;
const check = (ok, label) => { if (ok) passed += 1; else { failed += 1; console.log(`  ✗ ${label}`); } };

console.log("check_dock: the HUD panels fold away and move");

const SRC = read("WebXR/shared/ctl-dock.js");
const APP = read("WebXR/parishes/js/app.js");

// 1 the clamp keeps a panel inside the viewport
const { ctlDockClamp } = await import(join(ROOT, "WebXR/shared/ctl-dock.js"));
const cases = [
  [[900, 700, 300, 200, 1000, 800], { x: 700, y: 600 }, "a panel dragged past the bottom right stops at the edge"],
  [[-5, -5, 300, 200, 1000, 800], { x: 0, y: 0 }, "a panel dragged past the top left stops at the origin"],
  [[100, 100, 300, 200, 1000, 800], { x: 100, y: 100 }, "a panel inside the viewport keeps its place"],
  [[100, 100, 1200, 900, 1000, 800], { x: 0, y: 0 }, "a panel larger than the viewport pins to the origin"],
];
for (const [args, want, label] of cases) {
  const got = ctlDockClamp(...args);
  check(got.x === want.x && got.y === want.y, `${label} (got ${got.x},${got.y})`);
}

// 2 accessibility wiring: the toggle says whether it is expanded and what it controls
check(/aria-expanded/.test(SRC) && /aria-controls/.test(SRC), "the toggle carries aria-expanded and aria-controls");
check(/aria-label", `\$\{collapsed \? "Expand" : "Collapse"\}/.test(SRC), "the toggle's name says what the next press does");
check(/grip\.tabIndex = 0/.test(SRC) && /ArrowLeft/.test(SRC), "the grip moves by keyboard as well as by pointer");
check(/focus-visible/.test(SRC), "the focus ring is visible on the toggle and the grip");

// 3 persistence: a folded and moved panel comes back the same, and blocked storage does not throw
const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => (memory.has(k) ? memory.get(k) : null),
  setItem: (k, v) => memory.set(k, String(v)),
};
const listeners = {};
const makeEl = (id) => {
  const el = {
    id, dataset: {}, style: {}, children: [], offsetLeft: 0, offsetTop: 0, offsetWidth: 200, offsetHeight: 80,
    offsetParent: null, className: "", classList: { set: new Set(), add(c) { this.set.add(c); }, contains(c) { return this.set.has(c); }, remove(c) { this.set.delete(c); } },
    prepend(c) { this.children.unshift(c); }, getBoundingClientRect: () => ({ width: 200, height: 80 }),
    setAttribute(k, v) { this[k] = v; }, addEventListener(t, f) { listeners[t] = f; }, removeEventListener() {},
    append() {},
  };
  return el;
};
globalThis.document = {
  createElement: () => {
    const e = makeEl("");
    e.tabIndex = 0;
    e.setAttribute = function (k, v) { this[k] = v; };
    e.append = function () {};
    e.prepend = function () {};
    return e;
  },
  head: { append() {} },
  documentElement: { clientWidth: 1000, clientHeight: 800 },
};
globalThis.window = { innerWidth: 1000, innerHeight: 800 };
const { ctlDock } = await import(join(ROOT, "WebXR/shared/ctl-dock.js"));
const panel = makeEl("hud-stats");
const d1 = ctlDock(panel, { key: "k1", title: "State" });
d1.collapse();
check(JSON.parse(memory.get("k1")).collapsed === true, "a collapsed panel is remembered under its key");
const d2 = ctlDock(makeEl("hud-stats"), { key: "k1", title: "State" });
check(d2.state().collapsed === true, "the collapsed state comes back on the next visit");
d2.move(50, 60);
check(JSON.parse(memory.get("k1")).moved === true, "a moved panel is remembered too");
globalThis.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
let threw = false;
try { ctlDock(makeEl("hud-where"), { key: "k2", title: "Where" }).expand(); } catch { threw = true; }
check(!threw, "blocked storage does not stop the panel working");

// 4 the parishes page mounts the dock on the three panels that cover the scene
check(/import \{ ctlDock \} from "\.\.\/\.\.\/shared\/ctl-dock\.js"/.test(APP), "parishes imports the dock");
for (const id of ["hud-where", "hud-stats", "hud-keys"]) {
  check(APP.includes(`["${id}"`), `parishes docks ${id}`);
}
check(/key: `ctl-dock-parishes-\$\{id\}`/.test(APP), "each docked panel stores its state under its own key");
check(/defaultCollapsed: true/.test(APP), "the HUD panels start closed so the scene is not covered");
const d3 = ctlDock(makeEl("hud-keys"), { key: "k3", title: "Keys", defaultCollapsed: true });
check(d3.state().collapsed === true, "a panel with defaultCollapsed starts closed");
check(ctlDock(makeEl("hud-keys"), { key: "k3", title: "Keys", defaultCollapsed: true }).state().collapsed === true, "the default holds on a later visit with no saved choice");

console.log(`check_dock: ${failed === 0 ? "all" : failed} ${failed === 0 ? "checks pass" : "failed"} (${passed} passed, ${failed} failed)`);
if (failed) process.exit(1);
