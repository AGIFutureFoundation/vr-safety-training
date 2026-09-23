/**
 * Scenic stage districts, checked.
 *
 * golden-gate-deck and bay-underwater are not a horizon behind the plaza:
 * the learner stands in them, so they replace the plaza, the masts, the
 * marquee and the apron (`plaza: false` in js/districts.js). That makes them
 * the ground a station stands on, which is exactly the kind of thing no
 * station checker looks at. This builds the real stage around each one with
 * no station on it — what `?district=<id>` shows — against the same stub
 * three.js the other checkers use, and fails on:
 *
 *   - a build or an animate frame that throws, at night and by day;
 *   - the district's own meshes past its budget (SCENIC_BUDGET), counted the
 *     way check_budget counts a station, so a station of 150–280 still fits;
 *   - check_layout's rules from the district's own spawn: the spawn inside
 *     the roam circle, nothing floor-standing on the spawn, across the walk
 *     from the spawn to the station, or inside the circle the largest station
 *     footprint needs; ground under every point the learner may walk to; and
 *     no coordinate out past anything the camera can see;
 *   - the stage contract: no plaza or apron under a scenic district, the
 *     district built even on a profile that drops the horizon, bay-underwater
 *     with no skyline and its own weather whatever the station or the URL
 *     asks, golden-gate-deck in its marine layer by default with the skyline
 *     kept off the strait side, and each one's camera far plane handed back;
 *   - the underwater HUD chip: shown with exactly the station's
 *     `room.underwater = { depthLabel, bottomTimeSeconds }`, nothing when it
 *     is unset, and wired into the HUD state in app.js and the chrome in
 *     react-ui.js.
 *
 *     node tools/check_districts.mjs
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { THREE_STUB, WEBXR, installDomStubs, strip } from "./lib/headless.mjs";

// The stub geometry learns its own dimensions, so the layout rules below can
// see how big a part is and not only where its centre sits; Color, Fog and
// AmbientLight are what the stage needs that the station checkers never do.
const STUB = THREE_STUB
  .replace("export class BoxGeometry extends Geometry {}", "export class BoxGeometry extends Geometry { constructor(width=1,height=1,depth=1){super();this.parameters={width,height,depth};} }")
  .replace("export class CylinderGeometry extends Geometry {}", "export class CylinderGeometry extends Geometry { constructor(radiusTop=1,radiusBottom=1,height=1){super();this.parameters={radiusTop,radiusBottom,height};} }")
  .replace("export class SphereGeometry extends Geometry {}", "export class SphereGeometry extends Geometry { constructor(radius=1){super();this.parameters={radius};} }")
  .replace("export class TorusGeometry extends Geometry {}", "export class TorusGeometry extends Geometry { constructor(radius=1,tube=0.4){super();this.parameters={radius,tube};} }")
  .replace("export class PlaneGeometry extends Geometry {}", "export class PlaneGeometry extends Geometry { constructor(width=1,height=1){super();this.parameters={width,height};} }")
  .replace("class Color { constructor(v=0){this.v=v;} set(v){this.v=v;return this;} }",
    "class Color { constructor(v=0){this.set(v);} set(v){this.v=typeof v==='number'?v:(v&&v.v)||0;this.r=((this.v>>16)&255)/255;this.g=((this.v>>8)&255)/255;this.b=(this.v&255)/255;this.isColor=true;return this;} getHex(){return (Math.round(this.r*255)<<16)|(Math.round(this.g*255)<<8)|Math.round(this.b*255);} copy(c){this.r=c.r;this.g=c.g;this.b=c.b;return this;} multiplyScalar(k){this.r*=k;this.g*=k;this.b*=k;return this;} lerp(c,t){this.r+=(c.r-this.r)*t;this.g+=(c.g-this.g)*t;this.b+=(c.b-this.b)*t;return this;} }")
  + "\nexport class Fog { constructor(color,near,far){this.color=color;this.near=near;this.far=far;} }\nexport class AmbientLight extends Obj3D { constructor(c,i){super();this.color=c;this.intensity=i;} }\n";
for (const probe of ["parameters={width,height,depth}", "parameters={radiusTop", "parameters={radius}", "parameters={radius,tube}", "parameters={width,height}", "getHex()"]) {
  if (!STUB.includes(probe)) throw new Error(`check_districts: the headless stub changed shape (${probe}); update the replacements here`);
}

// Same concatenation as every checker, behind the richer stub.
const MODULES = ["shared/kit.js", "shared/a11y.js", "shared/weather.js", "smartcity/js/citykit.js", "smartcity/js/ambient.js",
  "smartcity/js/apron.js", "smartcity/js/interiors.js", "smartcity/js/districts.js", "smartcity/js/stage.js"];
// buildSuite() writes the plain stub; this suite is put together by hand so
// it gets the one above.
installDomStubs();
const dir = mkdtempSync(join(tmpdir(), "districts-"));
writeFileSync(join(dir, "three-mock.mjs"), STUB);
const body = MODULES.map((rel) => strip(readFileSync(join(WEBXR, rel), "utf8"))).join("\n\n");
writeFileSync(join(dir, "suite.mjs"), `import * as THREE from "./three-mock.mjs";\n\n${body}\n\nexport { DISTRICTS, SCENIC_DISTRICTS, SCENIC_BUDGET, buildStage, THREE };`);
const S = await import(pathToFileURL(join(dir, "suite.mjs")).href);

let failures = 0;
const fail = (id, msg) => { console.log(`  ✗ ${id}: ${msg}`); failures += 1; };

// The two the brief names must exist and be scenic; anything else scenic is
// checked the same way.
for (const id of ["golden-gate-deck", "bay-underwater"]) {
  if (!S.SCENIC_DISTRICTS.includes(id)) fail(id, "is not a scenic district in js/districts.js");
}

// check_layout's numbers, and the largest station footprint in the roster.
const REACH = 1.6, KEEP_CLEAR = 1.4, SHIN = 0.35, HEAD = 1.95, WALK_CLEAR = 0.6;
const STATION_R = 3.2;    // the widest footprint is 3.0m
const WILD = 260;         // nothing a camera with a 220m far plane can see is further out

/** A point in `obj`'s own frame, carried up to the stage root. */
function toWorld(obj, p = { x: 0, y: 0, z: 0 }) {
  let { x, y, z } = p;
  for (let n = obj; n; n = n.parent) {
    const sc = n.scale;
    if (sc) { x *= sc.x ?? 1; y *= sc.y ?? 1; z *= sc.z ?? 1; }
    const r = n.rotation;
    if (r) {
      if (r.z) { const c = Math.cos(r.z), s = Math.sin(r.z); [x, y] = [x * c - y * s, x * s + y * c]; }
      if (r.y) { const c = Math.cos(r.y), s = Math.sin(r.y); [x, z] = [x * c + z * s, -x * s + z * c]; }
      if (r.x) { const c = Math.cos(r.x), s = Math.sin(r.x); [y, z] = [y * c - z * s, y * s + z * c]; }
    }
    x += n.position?.x ?? 0; y += n.position?.y ?? 0; z += n.position?.z ?? 0;
  }
  return { x, y, z };
}
function extents(m) {
  const p = m.geometry?.parameters;
  if (!p) return [0, 0, 0];
  let hx, hy, hz;
  if (p.width !== undefined) { hx = p.width / 2; hy = (p.height ?? 0) / 2; hz = (p.depth ?? 0) / 2; }
  else if (p.radiusTop !== undefined) { hx = hz = Math.max(p.radiusTop, p.radiusBottom); hy = p.height / 2; }
  else if (p.tube !== undefined) { hx = hy = hz = p.radius + p.tube; }
  else { hx = hy = hz = p.radius ?? 0; }
  const s = m.scale ?? {};
  return [hx * (s.x ?? 1), hy * (s.y ?? 1), hz * (s.z ?? 1)];
}
/** Every solid thing in a district as { c: world centre, h: half-extents }:
 *  ordinary meshes by their geometry, baked meshes by the parts they
 *  recorded (their own geometry is empty under the stub). */
function solids(root) {
  const out = [];
  root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.parts) { for (const part of o.userData.parts) out.push({ c: toWorld(o, part.p), h: part.h ?? [0, 0, 0] }); return; }
    let h = extents(o);
    // A mesh turned more than 45° about an axis swaps the other two extents
    // (a sheet laid flat, a wheel on its side, a board turned to face +x).
    const r = o.rotation ?? {};
    if (Math.abs(Math.sin(r.x ?? 0)) > 0.7) h = [h[0], h[2], h[1]];
    if (Math.abs(Math.sin(r.z ?? 0)) > 0.7) h = [h[1], h[0], h[2]];
    if (Math.abs(Math.sin(r.y ?? 0)) > 0.7) h = [h[2], h[1], h[0]];
    out.push({ c: toWorld(o), h, mesh: o });
  });
  return out;
}
/** Horizontal distance from a point to a solid's footprint (0 when inside). */
function gap(s, x, z) {
  const dx = Math.max(0, Math.abs(x - s.c.x) - s.h[0]);
  const dz = Math.max(0, Math.abs(z - s.c.z) - s.h[2]);
  return Math.hypot(dx, dz);
}
/** Does a solid occupy the band a standing person does? */
const standing = (s) => s.c.y + s.h[1] > SHIN && s.c.y - s.h[1] < HEAD;

const rows = [];
function build(id, { time = "night", weather = null, url = "", opts = {} } = {}) {
  globalThis.location = { search: `?time=${time}${url}` };
  const scene = { background: null, fog: null };
  const root = new S.THREE.Group();
  const stage = S.buildStage(root, "vr", scene, 0x4fd1ff, id, weather, null, opts);
  return { stage, scene, root };
}

for (const id of S.SCENIC_DISTRICTS) {
  const d = S.DISTRICTS[id];
  for (const time of ["night", "dusk", "day"]) {
    let b;
    try { b = build(id, { time }); } catch (e) { fail(id, `build threw at ${time} — ${e.message}`); continue; }
    const { stage, scene } = b;
    try { for (let i = 0; i < 40; i++) stage.animate(i * 0.25, 0.25); } catch (e) { fail(id, `animate threw at ${time} — ${e.message}`); }
    const dg = stage.root.children.find((c) => c.name === "district-scene");
    if (!dg) { fail(id, `no "district-scene" group in the stage at ${time}`); continue; }
    if (time !== "night") continue;

    // ---- budget
    let meshes = 0, lights = 0;
    dg.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshes += 1; if (o.intensity !== undefined) lights += 1; });
    if (meshes > S.SCENIC_BUDGET) fail(id, `${meshes} meshes, over the ${S.SCENIC_BUDGET} a scenic district may spend`);
    if (lights > 4) fail(id, `${lights} lights of its own; a district lights itself with at most four`);

    // ---- stage contract
    if (!stage.spawn || !Number.isFinite(stage.roam)) fail(id, "the stage handed back no spawn or roam");
    if (!Number.isFinite(stage.far) || stage.far < 20) fail(id, `camera far plane ${stage.far} — a scenic district names its own`);
    if (!scene.fog || !(scene.fog.far > scene.fog.near)) fail(id, "no scene fog");
    const names = new Set(); stage.root.traverse((o) => { if (o.name) names.add(o.name); });
    // The apron's gate and fence are 4-mesh segments at r = 10.8 and the plaza
    // deck is a 15m disc at the origin; neither may be under a scenic district.
    for (const c of stage.root.children) {
      const p = c.geometry?.parameters;
      if (p?.radiusTop === 15 && p?.height === 0.3) fail(id, "the plaza deck was built under a scenic district");
    }
    const all = solids(dg);

    // ---- layout, from the district's own spawn
    const sp = stage.spawn ?? { x: 0, z: 0 };
    const roam = stage.roam ?? 0;
    if (Math.hypot(sp.x, sp.z) > roam) fail(id, `the spawn (${sp.x}, ${sp.z}) is outside the ${roam}m the learner may walk`);
    if (Math.hypot(sp.x, sp.z) < STATION_R + 0.5) fail(id, `the spawn is ${Math.hypot(sp.x, sp.z).toFixed(1)}m from the middle — inside the work area of a wide station`);
    const segGap = (s) => {
      // closest approach of the spawn→centre walk to the solid's footprint
      let best = Infinity;
      for (let k = 0; k <= 20; k++) best = Math.min(best, gap(s, sp.x * (k / 20), sp.z * (k / 20)));
      return best;
    };
    for (const s of all) {
      for (const [axis, v] of [["x", s.c.x], ["y", s.c.y], ["z", s.c.z]]) {
        if (!Number.isFinite(v)) fail(id, `a part has a non-finite ${axis}`);
        else if (Math.abs(v) > WILD) fail(id, `a part sits at ${axis}=${Math.round(v)} — past anything the camera can see (a colour in a position slot?)`);
      }
      if (!standing(s)) continue;
      const at = `(${s.c.x.toFixed(1)}, ${s.c.y.toFixed(1)}, ${s.c.z.toFixed(1)})`;
      if (gap(s, sp.x, sp.z) < KEEP_CLEAR) fail(id, `something floor-standing at ${at} is on the spawn — the learner arrives inside it`);
      else if (gap(s, 0, 0) < STATION_R) fail(id, `something floor-standing at ${at} is inside the ${STATION_R}m a station needs at the middle`);
      else if (segGap(s) < WALK_CLEAR) fail(id, `something floor-standing at ${at} blocks the walk from the spawn to the station`);
    }
    // Ground under every point the learner can stand on or reach from.
    // A walking surface tops out at deck level or a kerb above it (a sidewalk).
    const floors = all.filter((s) => s.c.y + s.h[1] > -0.06 && s.h[1] + s.c.y < 0.26 && Math.max(s.h[0], s.h[2]) > 2 && Math.min(s.h[0], s.h[2]) > 1);
    const onFloor = (x, z) => floors.some((f) => {
      const cylinder = f.mesh?.geometry?.parameters?.radiusTop !== undefined;
      return cylinder ? Math.hypot(x - f.c.x, z - f.c.z) <= f.h[0] : Math.abs(x - f.c.x) <= f.h[0] && Math.abs(z - f.c.z) <= f.h[2];
    });
    const samples = [[0, 0], [sp.x, sp.z]];
    for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; samples.push([Math.sin(a) * roam, Math.cos(a) * roam]); }
    const off = samples.filter(([x, z]) => !onFloor(x, z));
    if (!floors.length) fail(id, "no ground at y = 0 — a scenic district must bring its own floor");
    else if (off.length) fail(id, `${off.length} point(s) inside the roam circle have no ground under them, e.g. (${off[0][0].toFixed(1)}, ${off[0][1].toFixed(1)})`);

    rows.push({ id, meshes, lights, roam, spawn: `${sp.x},${sp.z}`, far: stage.far });

    // ---- skyline and weather, per district
    const sky = stage.root.children.find((c) => c.name === "skyline");
    if (d.skyline === false && sky) fail(id, "builds a skyline ring it said it has none of");
    if (d.skyline && typeof d.skyline === "object") {
      if (!sky) fail(id, "its skyline was not built");
      else {
        const inGap = sky.children.filter((c) => { const a = ((Math.atan2(c.position.x, c.position.z) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2); return (d.skyline.gap ?? []).some(([lo, hi]) => a > lo + 0.06 && a < hi - 0.06); });
        if (inGap.length) fail(id, `${inGap.length} skyline tower(s) stand in the arc it keeps open`);
      }
    }
  }

  // Built even where a device profile drops the horizon: it is the floor.
  try {
    const { stage } = build(id, { opts: { skyline: false, district: false } });
    if (!stage.root.children.some((c) => c.name === "district-scene")) fail(id, "not built on a profile with no horizon — the learner would stand on nothing");
  } catch (e) { fail(id, `build threw with the horizon off — ${e.message}`); }

  // Weather: a forced district ignores the station and the URL; otherwise the
  // district's default stands in only when the station names nothing.
  try {
    if (d.forceWeather) {
      for (const [weather, url] of [["storm", ""], [null, "&weather=rain"], ["smoke", "&weather=wind"]]) {
        const { stage } = build(id, { weather, url });
        if (stage.weather.kind !== (d.weatherKind ?? d.weather)) fail(id, `weather came out "${stage.weather.kind}" for station ${weather} / url "${url}" — it is forced to its own`);
      }
      const { stage } = build(id);
      if (!/dive plan/.test(stage.weather.note) || /\d/.test(stage.weather.note)) fail(id, "its conditions note must defer limits to the dive plan and state no figure");
    } else if (d.weather) {
      if (build(id).stage.weather.kind !== d.weather) fail(id, `no station weather should give the district's own "${d.weather}"`);
      if (build(id, { weather: "wind" }).stage.weather.kind !== "wind") fail(id, "a station's own weather must replace the district default");
    }
  } catch (e) { fail(id, `weather build threw — ${e.message}`); }
}

// ---- the underwater HUD chip
globalThis.React = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat() }),
  Fragment: "Fragment",
  useSyncExternalStore: (_s, get) => get(),
};
const UI = await import(pathToFileURL(join(WEBXR, "smartcity/js/react-ui.js")).href);
const text = (node) => node == null || node === false ? "" : typeof node === "string" ? node : (node.children ?? []).map(text).join(" ");
const findId = (node, id) => !node || typeof node !== "object" ? null : node.props?.id === id ? node : (node.children ?? []).map((c) => findId(c, id)).find(Boolean) ?? null;
const station = { depthLabel: "per the dive plan", bottomTimeSeconds: 1200 };
const r1 = UI.diveReadout(station, 75);
if (!r1 || r1.depth !== "per the dive plan" || r1.bottom !== "01:15 / 20:00" || r1.state !== "ok") fail("hud", `diveReadout gave ${JSON.stringify(r1)} for the station's own values at 75s`);
if (UI.diveReadout(station, 1000)?.state !== "warn") fail("hud", "four-fifths of the planned bottom time should turn the chip amber");
if (UI.diveReadout(station, 1300)?.state !== "over") fail("hud", "past the planned bottom time should turn the chip red");
if (UI.diveReadout(undefined, 60) !== null || UI.diveReadout({}, 60) !== null) fail("hud", "a station that sets no underwater values must get no readout — nothing is invented");
const tree = UI.DiveChip({ dive: r1 });
const chip = findId(tree, "hud-dive");
if (!chip) fail("hud", "DiveChip rendered no #hud-dive");
else {
  if (!text(findId(tree, "hud-depth")).includes("per the dive plan")) fail("hud", "the chip does not show the station's depth label");
  if (!text(findId(tree, "hud-bottom")).includes("01:15 / 20:00")) fail("hud", "the chip does not show the bottom time against the plan");
}
if (UI.DiveChip({ dive: null }) !== null) fail("hud", "DiveChip must render nothing when there is no readout");
const appSrc = readFileSync(join(WEBXR, "smartcity/js/app.js"), "utf8");
const uiSrc = readFileSync(join(WEBXR, "smartcity/js/react-ui.js"), "utf8");
const cssSrc = readFileSync(join(WEBXR, "smartcity/index.html"), "utf8");
if (!/dive:\s*diveReadout\(s\.room\.underwater,\s*s\.elapsed\)/.test(appSrc)) fail("hud", "app.js syncHud() does not put diveReadout(room.underwater, elapsed) in the HUD state");
if (!/h\(HudDive\)/.test(uiSrc)) fail("hud", "react-ui.js App does not render HudDive");
if (!/#hud-dive\s*\{/.test(cssSrc)) fail("hud", "index.html has no #hud-dive style");
if (!/enterDistrictPreview/.test(appSrc) || !/get\("district"\)/.test(appSrc)) fail("preview", "app.js has no ?district= preview");
// A station that declares a dive readout must stand in the district that shows one.
for (const f of readdirSync(join(WEBXR, "smartcity/js/sims")).filter((n) => n.endsWith(".js"))) {
  const src = readFileSync(join(WEBXR, "smartcity/js/sims", f), "utf8");
  if (/^\s*underwater\s*:/m.test(src) && !/district:\s*"bay-underwater"/.test(src)) fail(f, "sets `underwater` but does not stand in the bay-underwater district");
}

const summary = rows.map((r) => `${r.id} ${r.meshes}/${S.SCENIC_BUDGET} meshes, roam ${r.roam.toFixed(1)}m`).join("; ");
console.log(failures
  ? `\n${failures} district problem(s) found.`
  : `\nAll ${rows.length} scenic districts build, fit and are reachable: ${summary}; underwater HUD chip renders.`);
process.exit(failures ? 1 : 0);
