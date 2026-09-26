#!/usr/bin/env node
/**
 * Headless checks for the in-app Easter eggs (WebXR/shared/eggs-app.js).
 *
 *     node tools/check_eggs_app.mjs
 *
 * See docs/easter-egg.md, "Inside the apps". What is proved here:
 *
 *  1. **The module is wired the way its own header promises.** It takes no
 *     imports of its own, exports exactly the three mount functions (plus the
 *     `_internal` test hatch), each app's main module imports the mount call
 *     it needs, tools/bundle_webxr.py lists shared/eggs-app.js for all three
 *     apps, this checker is registered in check_all.mjs, and the docs cover
 *     all six eggs.
 *  2. **The pure logic is right.** The date seed is a stable local day, the
 *     daily pick is deterministic for that day, and a bingo card is always a
 *     5x5 with one FREE centre and 24 distinct, non-empty hazard cells.
 *  3. **The behaviour is right, against a minimal DOM/THREE/WebAudio stub —**
 *     Photo Mode freezes and unfreezes the session and produces a PNG; the
 *     Golden Wrench recolours exactly one tool at exactly one station a day
 *     and stamps its own note once; three clicks on the crane hook (and only
 *     the crane hook — a miss does not count, and app.js's own canvas click
 *     is pre-empted so it never also fires) open the claw; Night Shift only
 *     changes anything inside 00:00-04:00 local; the Holodeck cabinet opens
 *     its game the same way. This checker never launches a browser — see
 *     the Playwright pass docs/easter-egg.md's own verification section asks
 *     for, which exercises the same two features for real.
 *
 * No scratch directory is created — everything here is an in-memory ESM
 * import plus hand-built stubs, so there is nothing to clean up on exit.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WEBXR = join(ROOT, "WebXR");
const read = (p) => readFileSync(join(ROOT, p), "utf8");

let failures = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (err) { failures += 1; console.log(`  ✗ ${name}\n      ${err.stack ?? err}`); }
}
function assert(ok, message) { if (!ok) throw new Error(message); }
const eq = (a, b, what) => { if (a !== b) throw new Error(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); };

console.log("In-app Easter eggs — self-test\n");

// ============================================================== 1. wiring

const eggsSrc = read("WebXR/shared/eggs-app.js");

await check("the module takes no imports of its own", () => {
  assert(!/^\s*import\s/m.test(eggsSrc), "shared/eggs-app.js has an import statement — it is meant to take everything through ctx, so every app's bundle needs only this one file added");
});

await check("it exports exactly the three mount functions and the test hatch", () => {
  const names = [...eggsSrc.matchAll(/^export (?:function|const) (\w+)/gm)].map((m) => m[1]);
  eq(names.sort().join(","), ["_internal", "mountHolodeckEggs", "mountInstructorEggs", "mountSmartCityEggs"].sort().join(","), "top-level exports");
});

await check("each app's main module imports and mounts its own eggs", () => {
  const smartcity = read("WebXR/smartcity/js/app.js");
  assert(/import \{ mountSmartCityEggs \} from "\.\.\/\.\.\/shared\/eggs-app\.js";/.test(smartcity), "SmartCiti.X does not import mountSmartCityEggs");
  assert(/mountSmartCityEggs\(\{/.test(smartcity), "SmartCiti.X never calls mountSmartCityEggs()");
  assert(/preserveDrawingBuffer:\s*true/.test(smartcity), "the renderer has no preserveDrawingBuffer — Photo Mode's toDataURL() would be unreliable");

  const holodeck = read("WebXR/holodeck/js/app.js");
  assert(/import \{ mountHolodeckEggs \} from "\.\.\/\.\.\/shared\/eggs-app\.js";/.test(holodeck), "Holodeck does not import mountHolodeckEggs");
  assert(/mountHolodeckEggs\(\{/.test(holodeck), "Holodeck never calls mountHolodeckEggs()");

  const instructor = read("WebXR/instructor/js/app.js");
  assert(/import \{ mountInstructorEggs \} from "\.\.\/\.\.\/shared\/eggs-app\.js";/.test(instructor), "the instructor console does not import mountInstructorEggs");
  assert(/mountInstructorEggs\(\{/.test(instructor), "the instructor console never calls mountInstructorEggs()");
});

await check("the console still sets no HTML from a string and imports no simulator code", () => {
  // eggs-app.js's own bingo window is a separate document (`w.document`), not
  // this page's — but the console's OWN file must stay exactly as strict as
  // tools/check_console.mjs already requires, egg or no egg.
  const instructor = read("WebXR/instructor/js/app.js");
  for (const sink of ["innerHTML", "outerHTML", "insertAdjacentHTML", "dangerouslySetInnerHTML", "document.write"]) {
    assert(!instructor.includes(sink), `instructor/js/app.js uses ${sink}`);
  }
  for (const f of ["smartcity/js/sims/", "citykit.js", "gamify.js", "shared/game.js"]) {
    assert(!instructor.includes(f), `the instructor console's own file names ${f}`);
  }
});

await check("tools/bundle_webxr.py lists shared/eggs-app.js for all three apps, before each app.js", () => {
  const bundler = read("tools/bundle_webxr.py");
  const appsBlock = bundler.slice(bundler.indexOf('APPS = {'), bundler.indexOf("\n}\n\n# Cross-app links"));
  for (const [app, appJs] of [
    ["smartcity", 'WEBXR / "smartcity/js/app.js"'],
    ["holodeck", 'WEBXR / "holodeck/js/app.js"'],
    ["instructor", 'WEBXR / "instructor/js/app.js"'],
  ]) {
    const start = appsBlock.indexOf(`"${app}": {`);
    assert(start >= 0, `bundle_webxr.py has no "${app}" app entry`);
    const end = appsBlock.indexOf('\n    },', start);
    const block = appsBlock.slice(start, end);
    const eggsAt = block.indexOf('SHARED / "eggs-app.js"');
    const appJsAt = block.indexOf(appJs);
    assert(eggsAt >= 0, `${app}'s module list does not include shared/eggs-app.js`);
    assert(appJsAt >= 0, `${app}'s module list does not include its own app.js the way this checker expects`);
    assert(eggsAt < appJsAt, `${app} lists shared/eggs-app.js after its own app.js — the bundle would throw on load (mountXEggs would not be defined yet)`);
  }
});

await check("this checker is registered in check_all.mjs", () => {
  const all = read("tools/check_all.mjs");
  assert(all.includes("check_eggs_app.mjs"), "tools/check_all.mjs does not run check_eggs_app.mjs");
});

await check("docs/easter-egg.md documents all six eggs under \"Inside the apps\"", () => {
  const docs = read("docs/easter-egg.md");
  assert(/## Inside the apps/.test(docs), 'docs/easter-egg.md has no "Inside the apps" section');
  const section = docs.slice(docs.indexOf("## Inside the apps"));
  for (const word of ["Photo Mode", "Golden Wrench", "Crane Claw", "Scaffold Climber", "Toolbox Talk Bingo", "Night Shift"]) {
    assert(section.includes(word), `docs/easter-egg.md's "Inside the apps" section never mentions ${word}`);
  }
});

// ========================================================= 2. pure logic

const mod = await import(pathToFileURL(join(WEBXR, "shared", "eggs-app.js")).href);
const { _internal, mountSmartCityEggs, mountHolodeckEggs, mountInstructorEggs } = mod;

await check("the date key is a stable local YYYY-MM-DD", () => {
  const d = new Date(2026, 2, 7, 23, 59); // local March 7 2026, not UTC
  eq(_internal.eggLocalDateKey(d), "2026-03-07", "date key");
});

await check("the daily pick is deterministic for one day and a roster of one", () => {
  const seedA = _internal.eggHash("golden-wrench:2026-03-07");
  const seedB = _internal.eggHash("golden-wrench:2026-03-07");
  eq(seedA, seedB, "the same string hashes to two different seeds");
  const seedC = _internal.eggHash("golden-wrench:2026-03-08");
  assert(seedA !== seedC, "two different days hashed to the same seed — the pick would never change");
  for (let i = 0; i < 50; i++) assert(_internal.eggSeededIndex(seedA, 1) === 0, "a roster of one must always resolve to index 0");
  const idx = _internal.eggSeededIndex(seedA, 37);
  assert(idx >= 0 && idx < 37, "the seeded index left the roster's range");
});

await check("a bingo card is a 5x5 with one FREE centre and 24 non-empty cells", () => {
  const roster = new Map([
    ["s1", { events: [{ kind: "hazard", text: "Fall hazard — from the debrief" }, { kind: "state" }] }],
    ["s2", { events: [{ kind: "hazard", text: "Confined space: no attendant posted" }] }],
  ]);
  const named = _internal.eggHazardsFromRoster(roster);
  assert(named.includes("Fall hazard") && named.includes("Confined space"), `hazard extraction: ${JSON.stringify(named)}`);
  const cells = _internal.eggBingoCells(roster);
  eq(cells.length, 25, "bingo cells");
  assert(cells[12].startsWith("FREE"), "the centre cell is not FREE");
  for (const [i, c] of cells.entries()) {
    if (i === 12) continue;
    assert(typeof c === "string" && c.trim().length > 0, `cell ${i} is empty`);
  }
  // An empty roster still produces a full card from the generic padding.
  const empty = _internal.eggBingoCells(new Map());
  eq(empty.length, 25, "bingo cells from an empty roster");
  eq(new Set(empty.filter((c) => !c.startsWith("FREE"))).size <= 24, true, "padded cells stayed in range");
  assert(_internal.EGG_HAZARD_PADDING.length >= 24, "the generic padding list is too short for a full card on a quiet day");
});

// ==================================================== 3. behaviour, stubbed

/** A tiny DOM element: enough of the API every mount*Eggs() call actually
 *  uses (createElement, style, textContent, append/remove, listeners, a
 *  canvas 2D context, dataset) — not a browser, just its shape. */
class FakeEl {
  constructor(tag = "div") {
    this.tagName = String(tag).toUpperCase();
    this.style = { cssText: "" };
    this.children = [];
    this.dataset = {};
    this._listeners = new Map(); // type -> [{fn, capture}]
    this.width = 0; this.height = 0;
  }
  appendChild(c) { this.children.push(c); c.parentEl = this; return c; }
  append(...items) { for (const i of items) this.appendChild(i); }
  remove() { const p = this.parentEl; if (p) p.children = p.children.filter((c) => c !== this); }
  addEventListener(type, fn, opts) {
    const capture = opts === true || !!opts?.capture;
    const arr = this._listeners.get(type) ?? [];
    arr.push({ fn, capture });
    this._listeners.set(type, arr);
  }
  removeEventListener(type, fn, opts) {
    const capture = opts === true || !!opts?.capture;
    const arr = (this._listeners.get(type) ?? []).filter((l) => !(l.fn === fn && l.capture === capture));
    this._listeners.set(type, arr);
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 300 }; }
  getContext(kind) { return kind === "2d" ? fake2dCtx() : null; }
  toDataURL() { return "data:image/png;base64,FAKE"; }
  click() { fireOn(this, "click", {}); }
}

/** Any canvas 2D call is a no-op; any style-ish property just round-trips —
 *  the drawing itself is proven by hand-reading the compositing code, not by
 *  a headless canvas, exactly like the rest of this module's DOM stub. */
function fake2dCtx() {
  const store = {};
  return new Proxy(store, {
    get(t, p) { return p in t ? t[p] : () => {}; },
    set(t, p, v) { t[p] = v; return true; },
  });
}

/** Invoke every listener registered directly on `el` for `type`, in
 *  registration order — the "at target" phase, which is all Photo Mode's
 *  window keydown and every overlay's document Escape listener ever need
 *  (they are always added directly to the node that fires them). */
function fireOn(el, type, evt) {
  evt.stopImmediatePropagation ??= () => { evt._stopped = true; };
  evt.stopPropagation ??= () => { evt._stopped = true; };
  evt.preventDefault ??= () => {};
  for (const { fn } of [...(el._listeners.get(type) ?? [])]) {
    fn(evt);
    if (evt._stopped) break;
  }
}

/** A pointerdown that really propagates window -> canvas, capture then
 *  target — the one case this suite cannot collapse to fireOn(), because the
 *  whole point of shared/eggs-app.js putting its crane-hook/cabinet listener
 *  on `window` rather than the canvas is to win a real cross-node race. */
function firePointerDown(win, canvas, evt) {
  evt._stopped = false;
  evt.stopImmediatePropagation = () => { evt._stopped = true; };
  evt.stopPropagation = () => { evt._stopped = true; };
  evt.preventDefault = () => { evt.defaultPrevented = true; };
  for (const { fn, capture } of [...(win._listeners.get("pointerdown") ?? [])]) {
    if (!capture) continue;
    fn(evt);
    if (evt._stopped) return;
  }
  for (const { fn } of [...(canvas._listeners.get("pointerdown") ?? [])]) {
    fn(evt);
    if (evt._stopped) return;
  }
}

// -------------------------------------------------------------- THREE stub

function fakeColor(hex = 0xffffff) {
  return { hex, set(h) { this.hex = h; }, getHex() { return this.hex; }, clone() { return fakeColor(this.hex); } };
}
function fakeMaterial(o = {}) {
  const m = { color: fakeColor(0x3a78c9), emissive: fakeColor(0x000000), emissiveIntensity: 0, metalness: 0.1, roughness: 0.5, ...o };
  m.clone = () => fakeMaterial({ ...m, color: m.color.clone(), emissive: m.emissive.clone() });
  return m;
}
class FakeObject3D {
  constructor() {
    this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    this.rotation = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    this.children = [];
    this.userData = {};
  }
  add(o) { this.children.push(o); o.parent = this; return this; }
  traverse(fn) { fn(this); for (const c of this.children) c.traverse(fn); }
}
class FakeGroup extends FakeObject3D {}
class FakeMesh extends FakeObject3D {
  constructor(geometry, material) { super(); this.geometry = geometry; this.material = material; this.isMesh = true; FakeMesh.all.push(this); }
}
FakeMesh.all = []; // every mesh ever built, newest last — see findLatestCollider()
class FakePointLight extends FakeObject3D {
  constructor(color, intensity) { super(); this.isPointLight = true; this.color = color; this.intensity = intensity; }
}
class FakeGeometry { constructor(...args) { this.args = args; } }
// A real Raycaster tells objects apart by where they actually sit; this one
// only has to tell them apart at all, so it hits exactly the object under
// test — set with RAY_HIT.target — never every mesh in the scene at once
// (a boolean "hit anything" flag would make the crane hook and the golden
// tool trigger off the very same click, since both stations can be armed
// together and this checker's raycaster has no real geometry to tell them
// apart with).
const RAY_HIT = { target: null };
class FakeRaycaster {
  setFromCamera() {}
  intersectObject(obj) { return obj === RAY_HIT.target ? [{ object: obj }] : []; }
}
/** The invisible collider mesh a mount*Eggs() call just built for a
 *  minigame's hotspot (crane hook, arcade cabinet) — the one thing this
 *  checker cannot get a direct reference to any other way, since it is
 *  created inside the module's own closure. Every real collider in
 *  shared/eggs-app.js is a MeshBasicMaterial({ visible: false }). */
function findLatestCollider() {
  for (let i = FakeMesh.all.length - 1; i >= 0; i--) if (FakeMesh.all[i].material?.visible === false) return FakeMesh.all[i];
  return null;
}
function makeThreeStub() {
  return {
    Group: FakeGroup, Mesh: FakeMesh, Object3D: FakeObject3D, PointLight: FakePointLight,
    CylinderGeometry: FakeGeometry, TorusGeometry: FakeGeometry, SphereGeometry: FakeGeometry,
    BoxGeometry: FakeGeometry, PlaneGeometry: FakeGeometry,
    MeshStandardMaterial: fakeMaterial, MeshBasicMaterial: fakeMaterial,
    Raycaster: FakeRaycaster,
  };
}

// ------------------------------------------------------------- environment

function installGlobals() {
  const win = new FakeEl("window");
  const doc = new FakeEl("document");
  doc.body = new FakeEl("body");
  doc.createElement = (tag) => new FakeEl(tag);
  const store = new Map();
  const localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  };
  class FakeAudioParam { constructor(v = 0) { this.value = v; } setValueAtTime() {} linearRampToValueAtTime() {} exponentialRampToValueAtTime() {} }
  class FakeAudioNode { connect() { return this; } }
  class FakeOsc extends FakeAudioNode { constructor() { super(); this.frequency = new FakeAudioParam(440); } start() {} stop() {} }
  class FakeGain extends FakeAudioNode { constructor() { super(); this.gain = new FakeAudioParam(1); } }
  class FakeBiquad extends FakeAudioNode { constructor() { super(); this.frequency = new FakeAudioParam(0); this.Q = new FakeAudioParam(0); } }
  class FakeBufferSource extends FakeAudioNode { start() {} }
  class FakeAudioContext {
    constructor() { this.currentTime = 0; this.state = "running"; this.destination = {}; this.sampleRate = 44100; }
    createOscillator() { return new FakeOsc(); }
    createGain() { return new FakeGain(); }
    createBiquadFilter() { return new FakeBiquad(); }
    createBufferSource() { return new FakeBufferSource(); }
    createBuffer(_ch, len) { return { getChannelData: () => new Float32Array(len) }; }
    resume() { return Promise.resolve(); }
  }
  let lastOpenedWindow = null;
  const windowOpen = () => {
    const winDoc = { _html: "", open() { this._html = ""; }, write(s) { this._html += s; }, close() {} };
    lastOpenedWindow = { document: winDoc };
    return lastOpenedWindow;
  };
  class FakeImage {
    set src(v) { this._src = v; this.width = 800; this.height = 600; queueMicrotask(() => this.onload?.()); }
    get src() { return this._src; }
  }

  globalThis.window = win;
  globalThis.document = doc;
  globalThis.localStorage = localStorage;
  globalThis.AudioContext = FakeAudioContext;
  globalThis.webkitAudioContext = undefined;
  globalThis.Image = FakeImage;
  globalThis.alert = () => {};
  globalThis.requestAnimationFrame = (fn) => { setTimeout(() => fn(Date.now()), 0); return 1; };
  win.open = windowOpen;
  win.alert = globalThis.alert;
  return { win, doc, getLastOpenedWindow: () => lastOpenedWindow };
}

// ---------------------------------------------------------------- fixtures

function makeSmartCityFixture() {
  const THREE = makeThreeStub();
  const { win, doc } = installGlobals();
  const canvas = new FakeEl("canvas");
  const renderer = { domElement: canvas, xr: { isPresenting: false } };
  const camera = {};
  const worldRoot = new FakeGroup();
  const stageRoot = new FakeGroup();
  const hudPatches = [];
  const hud = { feedback: "<b>Test Station</b> — a tagline." };
  const store = {
    get: () => ({ hud }),
    patch: (key, partial) => { hudPatches.push({ key, partial }); if (key === "hud") Object.assign(hud, partial); },
  };
  // Not Maritime & Ports by default, so a Golden Wrench test does not also
  // arm the Crane Claw on the very same station — tests that want the crane
  // set state.room.category themselves.
  const room = { id: "test-station", title: "Test Station", category: "Energy & Power" };
  const state = { room, mode: "flat", paused: false, hits: {}, session: null, stage: { root: stageRoot, signage: { plan: { unionId: "ilwu" } } } };
  const SIMS_META = [{ id: "test-station" }];
  return { THREE, win, doc, canvas, renderer, camera, worldRoot, state, store, SIMS_META, hudPatches };
}

let capturedInterval = null;
const realSetInterval = globalThis.setInterval;
function withCapturedInterval(fn) {
  globalThis.setInterval = (f) => { capturedInterval = f; return 0; };
  try { return fn(); } finally { globalThis.setInterval = realSetInterval; }
}

/** doc.body's most recently appended eggOverlay(): the backdrop's own single
 *  child is the card, and the card's children are the title/body/buttons. */
function overlayCard(doc) {
  const backdrop = doc.body.children.at(-1);
  return backdrop?.children?.[0] ?? null;
}
function overlayTitleText(doc) {
  return overlayCard(doc)?.children.find((c) => c.tagName === "H2")?.textContent ?? null;
}

await check("Photo Mode: P freezes the session and produces a downloadable PNG, then unfreezes on close", async () => {
  const fx = makeSmartCityFixture();
  withCapturedInterval(() => mountSmartCityEggs({ ...fx, unionAbbrev: () => "ILWU" }));
  eq(fx.state.paused, false, "paused before P is pressed");
  fireOn(fx.win, "keydown", { key: "p", target: fx.doc.body });
  // The compositing canvas's toDataURL only fires after the fake Image
  // decodes (queueMicrotask), same as a real <img>.
  await Promise.resolve(); await Promise.resolve(); await new Promise((r) => setTimeout(r, 0));
  eq(fx.state.paused, true, "Photo Mode did not pause the session");
  eq(overlayTitleText(fx.doc), "Photo Mode", "no Photo Mode overlay was shown");
  // Closing it (Escape, handled directly on document) restores the pause state.
  fireOn(fx.doc, "keydown", { key: "Escape" });
  eq(fx.state.paused, false, "closing Photo Mode did not restore the run");
});

await check("Golden Wrench: exactly one tool at exactly the daily station goes gold and logs its note once", async () => {
  const fx = makeSmartCityFixture();
  const tool = new FakeMesh(null, fakeMaterial());
  fx.state.hits = { "impact-wrench": tool };
  const key = _internal.eggLocalDateKey();
  withCapturedInterval(() => mountSmartCityEggs({ ...fx, unionAbbrev: () => "" }));
  capturedInterval(); // first poll: arms today's station (the fixture's only station)
  assert(tool.material.color.hex === 0xf7c948, "the daily station's only tool was not turned gold");
  RAY_HIT.target = tool;
  firePointerDown(fx.win, fx.canvas, { clientX: 1, clientY: 1 });
  RAY_HIT.target = null;
  const log = JSON.parse(localStorage.getItem("smartcitix-egg-golden-wrench-v1") ?? "[]");
  eq(log.filter((n) => n.date === key).length, 1, "the golden-wrench note was not stamped exactly once");
  RAY_HIT.target = tool;
  firePointerDown(fx.win, fx.canvas, { clientX: 1, clientY: 1 }); // a second find today must not duplicate the note
  RAY_HIT.target = null;
  const log2 = JSON.parse(localStorage.getItem("smartcitix-egg-golden-wrench-v1") ?? "[]");
  eq(log2.filter((n) => n.date === key).length, 1, "a second click the same day stamped a second note");
});

await check("Crane Claw: three real hits open the game; a miss does not count, and app.js's own click never fires", async () => {
  const fx = makeSmartCityFixture();
  fx.state.room = { ...fx.state.room, category: "Maritime & Ports" };
  let appOwnClickFired = false;
  fx.canvas.addEventListener("pointerdown", () => { appOwnClickFired = true; });
  withCapturedInterval(() => mountSmartCityEggs({ ...fx, unionAbbrev: () => "" }));
  capturedInterval(); // arms the hook for this maritime station
  assert(fx.state.stage.root.children.length === 1, "no crane-hook group was added to the maritime station's stage");
  const hook = findLatestCollider();
  assert(hook, "no invisible collider mesh was built for the hook");

  RAY_HIT.target = null;
  firePointerDown(fx.win, fx.canvas, {}); // a miss: not on the hook
  assert(appOwnClickFired, "a miss must let the underlying app click through");

  appOwnClickFired = false;
  RAY_HIT.target = hook;
  for (let i = 0; i < 2; i++) firePointerDown(fx.win, fx.canvas, {});
  assert(!appOwnClickFired, "a hit on the hook must pre-empt app.js's own canvas click");
  assert(overlayTitleText(fx.doc) !== "Crane Claw", "the claw opened before the third click");

  firePointerDown(fx.win, fx.canvas, {});
  RAY_HIT.target = null;
  eq(overlayTitleText(fx.doc), "Crane Claw", "the third click on the hook did not open the claw game");
});

await check("Crane Claw and the Golden Wrench never arm outside their own station", async () => {
  const fx = makeSmartCityFixture();
  fx.state.room = { id: "somewhere-else", title: "Somewhere Else", category: "Energy & Power" };
  fx.state.hits = { "impact-wrench": new FakeMesh(null, fakeMaterial()) };
  withCapturedInterval(() => mountSmartCityEggs({ ...fx, unionAbbrev: () => "" }));
  capturedInterval();
  eq(fx.state.stage.root.children.length, 0, "a non-maritime station still got a crane hook");
  eq(fx.state.hits["impact-wrench"].material.color.hex, 0x3a78c9, "a station that is not today's pick still went gold");
});

await check("Night Shift only changes anything inside 00:00-04:00 local", async () => {
  const RealDate = Date;
  for (const [hour, shouldTrigger] of [[2, true], [14, false]]) {
    class FixedHourDate extends RealDate {
      constructor(...args) { super(...args); }
      getHours() { return hour; }
    }
    globalThis.Date = FixedHourDate;
    const fx = makeSmartCityFixture();
    withCapturedInterval(() => mountSmartCityEggs({ ...fx, unionAbbrev: () => "" }));
    const before = fx.hudPatches.length;
    const before_ = { ...fx.hud };
    capturedInterval();
    globalThis.Date = RealDate;
    const feedbackChanged = fx.hudPatches.slice(before).some((p) => p.key === "hud" && typeof p.partial.feedback === "string" && p.partial.feedback !== before_.feedback);
    eq(feedbackChanged, shouldTrigger, `hour ${hour}: night-shift line ${shouldTrigger ? "should" : "should not"} have been added`);
  }
});

await check("the Holodeck cabinet stands in worldRoot and opens Scaffold Climber on a real hit only", async () => {
  const THREE = makeThreeStub();
  const { win, doc } = installGlobals();
  const canvas = new FakeEl("canvas");
  const renderer = { domElement: canvas };
  const camera = {};
  const worldRoot = new FakeGroup();
  mountHolodeckEggs({ THREE, renderer, camera, worldRoot });
  assert(worldRoot.children.length === 1, "no cabinet was added to worldRoot");
  const collider = findLatestCollider();
  assert(collider, "no invisible collider mesh was built for the cabinet");
  RAY_HIT.target = null;
  firePointerDown(win, canvas, {});
  assert(!doc.body.children.length, "a miss opened the arcade cabinet anyway");
  RAY_HIT.target = collider;
  firePointerDown(win, canvas, {});
  RAY_HIT.target = null;
  eq(overlayTitleText(doc), "Scaffold Climber", "clicking the cabinet did not open Scaffold Climber");
});

await check("the instructor console's bingo button opens a real, escaped, printable card", async () => {
  const { win, doc, getLastOpenedWindow } = installGlobals();
  const roster = new Map([["s1", { events: [{ kind: "hazard", text: 'Fall hazard <img src=x onerror=alert(1)>' }] }]]);
  mountInstructorEggs({ getRoster: () => roster });
  const btn = doc.body.children.at(-1);
  assert(btn && btn.tagName === "BUTTON", "no Toolbox Talk Bingo button was added");
  btn.click();
  const w = getLastOpenedWindow();
  assert(w, "clicking the button did not open a new window");
  const html = w.document._html;
  eq((html.match(/<td/g) ?? []).length, 25, "the printed card is not a 25-cell grid");
  assert(html.includes('class="free"'), "no FREE cell was printed");
  assert(html.includes("For the room, not for the record"), "the card does not say it is not a real record");
  assert(!html.includes("<img src=x onerror"), "a hazard note's markup was not escaped in the printed card");
  assert(html.includes("&lt;img src=x onerror"), "the escaped hazard text is not on the card at all");
});

console.log(failures ? `\n${failures} egg check(s) failed.` : "\nAll in-app Easter egg checks pass.");
process.exit(failures ? 1 : 0);
