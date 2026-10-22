// NEWTON's parish mount (console NEWTON, the Packs run): the physics world
// from nw-physics.js over one parish, the avatar's walk through it (falls,
// walls, wading with a splash ring, swimming with a readiness meter, carried
// by the flow), a few props and parked cars as instanced dynamic bodies that
// tumble when hit, and MOTORPOOL's drive mode — a vehicle drives only after
// its pre-trip on the Motor Pool board (the gate contract, as today) — with
// crash response: stopped, dented (a vertex offset at the impact), hazard
// lights on, and the "after a collision" card from a catalog station.
//
//   nwMountPhysics({ three, root, parish, seams, tier, reduced, link, onCard })
//     -> { world, avatar, place(x, z), walk(input, dt), drive(entry, x, z, heading, { snap }),
//          exitDrive(), driving(), animate(dt, input), cameraPose(), counts(), card }
//
// `three` is the page's three.js namespace (passed in, so this module names no
// import); `seams` = { tfWaterDepthAt, tfFlowAt, cwColliders, tfLitterAt } —
// TERRAFORM's and CITYWORKS' functions when the page has them, else the
// parish's own ground, water and building footprints. `tier` "low" places
// fewer props; `reduced` (prefers-reduced-motion) keeps the splash ring still
// and the hazard lights steady. The vehicle is a schematic body sized by the
// drivable's class (MOTORPOOL's full builders stay out of the parish bundle
// for weight); `link(stationId)` builds the card's station link.
import { NP_WATER_Y, npHeightAt, npNearestRoad, npPolyDistance, npPolyPointAt } from "./np-parish.js";
import { nwParishWorld, nwAvatarState, nwAvatarStep, nwVehicleState, nwVehicleStep, nwVehicleClear, nwCrashCard, NW_AVATAR } from "./nw-physics.js";

/** Schematic footprint [w, h, l] by the Motor Pool board's class word (game shapes, never a maker's figure). */
export const NW_CLASS_DIMS = {
  light: [1.9, 1.6, 4.8], van: [2.0, 2.4, 5.4], truck: [2.5, 3.0, 8.0], tractor: [2.5, 3.4, 12], bus: [2.6, 3.2, 11],
  emergency: [2.5, 3.2, 9.5], transit: [2.6, 3.2, 11], utility: [2.1, 2.4, 5.6], grounds: [1.6, 1.9, 2.6], yard: [1.8, 2.2, 3.4], lift: [1.3, 2.4, 3.0], plant: [2.8, 3.2, 7.0], tracked: [3.0, 3.2, 6.5], small: [1.5, 1.8, 3.0],
};
/** Props per site (phone tier in brackets): cones and barrels at the board, parked cars on the road side. */
export const NW_PROPS = { cone: { n: 4, low: 2, half: [0.18, 0.36, 0.18], mass: 3 }, barrel: { n: 2, low: 1, half: [0.3, 0.45, 0.3], mass: 25 }, car: { n: 2, low: 1, half: [0.95, 0.75, 2.3], mass: 1200 } };

let nwCssDone = false;
function nwCss() {
  if (nwCssDone || typeof document === "undefined") return;
  nwCssDone = true;
  const st = document.createElement("style");
  st.textContent = `
  #nw-card{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;z-index:40;background:rgba(18,22,28,.96);color:#eef2f6;border:1px solid rgba(255,255,255,.2);border-radius:12px;padding:16px;font:14px/1.45 system-ui,sans-serif}
  #nw-card h2{margin:0 0 6px;font-size:18px}#nw-card ol{margin:8px 0 8px 18px;padding:0}#nw-card li{margin:6px 0}#nw-card small{opacity:.75;display:block;margin-top:6px}
  #nw-card .nw-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}#nw-card a,#nw-card button{min-height:44px;padding:8px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.12);color:inherit;font:inherit;text-decoration:none;cursor:pointer}
  #nw-meter{position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:30;background:rgba(10,20,30,.7);color:#eaf6ff;border-radius:999px;padding:6px 12px;font:13px system-ui,sans-serif;pointer-events:none}
  #nw-meter i{display:inline-block;vertical-align:middle;width:90px;height:8px;border-radius:4px;background:rgba(255,255,255,.2);margin-left:8px;overflow:hidden}#nw-meter b{display:block;height:100%;background:#7fd0ff}`;
  document.head.appendChild(st);
}

/** Mount the physics in a parish page (see the header). */
export function nwMountPhysics({ three, root, parish, seams = {}, tier = "balanced", reduced = false, link = null, onCard = null } = {}) {
  const T = three;
  const world = nwParishWorld(parish, seams);
  const groundAt = (x, z) => npHeightAt(parish, x, z);
  let avatar = nwAvatarState(0, 0, world);
  const low = tier === "low";

  // ---- props: instanced per kind, placed by each site's board and on the road side of its pad.
  const bodies = [];
  const props = { cone: [], barrel: [], car: [] };
  parish.sites.forEach((s, si) => {
    const [sx, sz] = s.position;
    for (const [kind, spec] of Object.entries(NW_PROPS)) {
      const n = low ? spec.low : spec.n;
      for (let i = 0; i < n; i++) {
        let x, z, yaw = 0;
        if (kind === "cone") { x = sx - 3 + i * 2; z = sz + 9; }
        else if (kind === "barrel") { x = sx + 6 + i * 1.2; z = sz + 8; }
        else { x = sx + 18 + i * 3; z = sz - 6 + i * 6; yaw = (si % 2) * 0.2; }
        if (world.waterDepthAt(x, z) > 0.2) continue;
        const b = world.addBody({ id: `nw-${kind}-${s.id}-${i}`, kind, pos: [x, groundAt(x, z) + spec.half[1], z], half: spec.half, mass: spec.mass, restitution: kind === "cone" ? 0.35 : 0.2, density: kind === "car" ? 0.9 : 0.5, sleeping: true, yaw });
        props[kind].push(b); bodies.push(b);
      }
    }
  });
  // TERRAFORM's litter (when its module is on the page): small bodies too, picked up later by the play layer.
  const litter = [];
  if (typeof seams.tfLitterAt === "function") {
    for (const s of parish.sites.slice(0, low ? 2 : 6)) {
      const key = `${Math.floor((s.position[0] + 2048) / 256)},${Math.floor((s.position[1] + 2048) / 256)}`;
      let items = [];
      try { items = seams.tfLitterAt(parish, key) ?? []; } catch { items = []; }
      for (const it of items.slice(0, low ? 3 : 8)) {
        const x = it.x ?? it.pos?.[0] ?? it.position?.[0], z = it.z ?? it.pos?.[2] ?? it.pos?.[1] ?? it.position?.[1];
        if (typeof x !== "number" || typeof z !== "number") continue;
        const b = world.addBody({ kind: "litter", pos: [x, groundAt(x, z) + 0.12, z], half: [0.12, 0.12, 0.12], mass: 0.5, sleeping: true });
        litter.push(b); bodies.push(b);
      }
    }
  }
  const mats = {
    cone: new T.MeshLambertMaterial({ color: 0xf07a1f }), barrel: new T.MeshLambertMaterial({ color: 0xf2b21b }),
    car: new T.MeshLambertMaterial({ color: 0x8a939c }), litter: new T.MeshLambertMaterial({ color: 0xc9c2b0 }),
  };
  const geos = {
    cone: new T.ConeGeometry(0.18, 0.72, 8), barrel: new T.CylinderGeometry(0.3, 0.3, 0.9, 10), car: new T.BoxGeometry(1.9, 1.5, 4.6), litter: new T.BoxGeometry(0.24, 0.24, 0.24),
  };
  const meshes = {};
  const m4 = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), v3 = new T.Vector3(), one = new T.Vector3(1, 1, 1);
  const groups = { ...props, litter };
  for (const [kind, list] of Object.entries(groups)) {
    if (!list.length) continue;
    const im = new T.InstancedMesh(geos[kind], mats[kind], list.length);
    im.name = `nw-${kind}`; im.frustumCulled = false;
    meshes[kind] = im; root.add(im);
  }
  function drawBody(kind, b, i) {
    e.set(b.tilt * 0.8, b.yaw, b.tilt * 0.5, "YXZ"); q.setFromEuler(e);
    m4.compose(v3.set(b.pos[0], b.pos[1], b.pos[2]), q, one);
    meshes[kind].setMatrixAt(i, m4);
  }
  function drawAll(force = false) {
    for (const [kind, list] of Object.entries(groups)) {
      if (!meshes[kind]) continue;
      let dirty = force;
      list.forEach((b, i) => { if (force || !b.sleeping) { drawBody(kind, b, i); dirty = true; } });
      if (dirty) meshes[kind].instanceMatrix.needsUpdate = true;
    }
  }
  drawAll(true);

  // ---- the splash ring (wading) and the readiness meter (swimming).
  const ring = new T.Mesh(new T.RingGeometry(0.5, 0.75, 20), new T.MeshBasicMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.55, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.name = "nw-splash"; root.add(ring);
  let meter = null;
  if (typeof document !== "undefined") {
    nwCss();
    meter = document.createElement("div"); meter.id = "nw-meter"; meter.hidden = true; meter.setAttribute("role", "status");
    meter.innerHTML = `Swimming — breath <i><b></b></i>`;
    document.body.appendChild(meter);
  }

  // ---- the drive mode.
  let veh = null, vehEntry = null, vehMesh = null, hazards = [], card = null, t = 0;
  function buildVehicle(entry) {
    const dims = NW_CLASS_DIMS[entry.class] ?? NW_CLASS_DIMS[entry.profile?.class] ?? [2.2, 2.2, 6];
    const [w, h, l] = dims;
    const g = new T.Group(); g.name = `nw-vehicle-${entry.id}`;
    const colour = entry.kit?.opts?.livery?.colour ?? 0xd8dde2;
    const bodyGeo = new T.BoxGeometry(w, h * 0.55, l, 4, 2, 8); bodyGeo.translate(0, h * 0.45, 0);
    const body = new T.Mesh(bodyGeo, new T.MeshLambertMaterial({ color: colour })); body.name = "body";
    const cab = new T.Mesh(new T.BoxGeometry(w * 0.92, h * 0.4, Math.min(l * 0.4, 2.6)), new T.MeshLambertMaterial({ color: 0x2c3a46 }));
    cab.position.set(0, h * 0.92, l * 0.18); cab.name = "cab";
    const wheels = new T.InstancedMesh(new T.CylinderGeometry(0.42, 0.42, 0.3, 10).rotateZ(Math.PI / 2), new T.MeshLambertMaterial({ color: 0x1d1f22 }), 4);
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz], i) => { m4.makeTranslation(sx * (w / 2 - 0.05), 0.42, sz * (l / 2 - 0.9)); wheels.setMatrixAt(i, m4); });
    wheels.name = "wheels";
    const hzMat = new T.MeshBasicMaterial({ color: 0x5a3a00 });
    hazards = [];
    for (const sx of [1, -1]) for (const sz of [1, -1]) { const hz = new T.Mesh(new T.BoxGeometry(0.22, 0.14, 0.06), hzMat); hz.position.set(sx * (w / 2 - 0.2), h * 0.55, sz * (l / 2 + 0.02)); hazards.push(hz); }
    g.add(body, cab, wheels, ...hazards);
    g.userData = { dims, hzMat, body, drivable: entry.id };
    return g;
  }
  /** Dent the body: vertices within reach of the impact (vehicle frame) pushed inward along the contact. */
  function dent(local) {
    const body = vehMesh.userData.body, pos = body.geometry.attributes.position;
    const [lx, lz] = local;
    let moved = 0;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const d = Math.hypot(x - lx, z - lz);
      if (d > 1.4) continue;
      const k = 0.28 * (1 - d / 1.4);
      const len = Math.hypot(lx, lz) || 1;
      pos.setX(i, x - (lx / len) * k); pos.setZ(i, z - (lz / len) * k); pos.setY(i, pos.getY(i) - k * 0.2);
      moved += 1;
    }
    pos.needsUpdate = true; body.geometry.computeVertexNormals();
    body.material.color.multiplyScalar(0.82);
    return moved;
  }
  function openCard(c) {
    card = c;
    onCard?.(c);
    if (typeof document === "undefined") return;
    let el = document.getElementById("nw-card");
    if (!el) { el = document.createElement("div"); el.id = "nw-card"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "nw-card-title"); document.body.appendChild(el); }
    const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
    el.innerHTML = `<h2 id="nw-card-title">${esc(c.title)}</h2><p>${esc(c.lead)}</p><ol>${c.steps.map((s) => `<li><b>${esc(s.title)}.</b> ${esc(s.text)}</li>`).join("")}</ol>` +
      `<small>${esc(c.source)}</small><div class="nw-row">${link ? `<a href="${esc(link(c.station))}" data-nw-station="${esc(c.station)}">Open the station</a>` : ""}<button type="button" data-nw-ack>Scene secured — carry on</button></div>`;
    el.hidden = false;
    el.querySelector("[data-nw-ack]").addEventListener("click", () => ackCard());
    el.querySelector("[data-nw-ack]").focus();
  }
  function ackCard() {
    card = null;
    if (typeof document !== "undefined") { const el = document.getElementById("nw-card"); if (el) el.hidden = true; }
    if (veh) { veh = { ...veh, crashed: false, hazards: false }; }
  }

  function drive(entry, x, z, heading = 0, { snap = true } = {}) {
    if (!entry || entry.kind === "water" || entry.kind === "rail") return false;
    exitDrive();
    // Start on the nearest road when one is close, else where the learner stands (MOTORWORKS: a parked vehicle
    // passes snap: false and pulls away from where it is parked).
    const near = snap ? npNearestRoad(parish, x, z) : { road: null, d: Infinity };
    let sx = x, sz = z;
    if (near.road && near.d < 60 && near.road.kind !== "ferry") {
      const p = npPolyPointAt(near.road.pts, npPolyDistance(x, z, near.road.pts).t);
      const px = Array.isArray(p) ? p[0] : p?.x, pz = Array.isArray(p) ? p[1] : p?.z;
      if (typeof px === "number" && typeof pz === "number" && world.waterDepthAt(px, pz) < 0.3) {
        sx = px; sz = pz;
        // Line up with the road, facing whichever way along it is closer to where the learner looks.
        if (typeof p.yaw === "number") heading = Math.cos(p.yaw - heading) >= 0 ? p.yaw : p.yaw + Math.PI;
      }
    }
    vehEntry = entry;
    vehMesh = buildVehicle(entry);
    const [w, h, l] = vehMesh.userData.dims;
    veh = nwVehicleState(sx, sz, heading, [w / 2, h / 2, l / 2], world);
    // Never start inside a wall or a trunk: step along the heading, ahead then behind, until the footprint is clear.
    for (let k = 1; k <= 12 && !nwVehicleClear(veh, world); k++) {
      const d = Math.ceil(k / 2) * 4 * (k % 2 ? 1 : -1);
      veh = nwVehicleState(sx + Math.sin(heading) * d, sz + Math.cos(heading) * d, heading, veh.half, world);
    }
    root.add(vehMesh);
    placeVehicle();
    return true;
  }
  function exitDrive() {
    if (!veh) return null;
    const out = { x: veh.x - Math.cos(veh.heading) * (veh.half[0] + 1.2), z: veh.z + Math.sin(veh.heading) * (veh.half[0] + 1.2) };
    root.remove(vehMesh);
    vehMesh.traverse((o) => { o.geometry?.dispose?.(); });
    veh = null; vehEntry = null; vehMesh = null; hazards = [];
    if (card) ackCard();
    place(out.x, out.z);
    return out;
  }
  function placeVehicle() {
    vehMesh.position.set(veh.x, veh.y, veh.z);
    vehMesh.rotation.set(0, veh.heading, 0);
  }

  function place(x, z) { avatar = nwAvatarState(x, z, world); return avatar; }
  function walk(input, dt) { avatar = nwAvatarStep(avatar, input, dt, world); return avatar; }

  let lastCrash = null;
  function animate(dt, input = null) {
    t += dt;
    if (veh && input && !card) {
      const r = nwVehicleStep(veh, input, dt, world, vehEntry.profile);
      veh = r.state;
      if (r.crash) {
        lastCrash = r.crash;
        dent(r.crash.local);
        const c = nwCrashCard(r.crash);
        if (c) openCard(c);
      }
      placeVehicle();
    }
    if (veh && vehMesh) {
      const on = veh.hazards && (reduced || Math.floor(t * 3) % 2 === 0);
      vehMesh.userData.hzMat.color.setHex(on ? 0xffb020 : 0x5a3a00);
    }
    world.step(dt);
    drawAll();
    // The splash ring follows a wading learner (still under reduced motion).
    const wading = !veh && avatar.mode === "wade" && avatar.splash;
    ring.visible = wading;
    if (wading) {
      const surface = groundAt(avatar.x, avatar.z) + (world.waterDepthAt(avatar.x, avatar.z) || 0);
      ring.position.set(avatar.x, Math.max(surface, NP_WATER_Y) + 0.03, avatar.z);
      const s = reduced ? 1.2 : 1 + (t * 1.6) % 1.2;
      ring.scale.set(s, s, s); ring.material.opacity = reduced ? 0.45 : 0.6 * (1 - ((t * 1.6) % 1.2) / 1.2);
    }
    if (meter) {
      const swim = !veh && avatar.mode === "swim";
      meter.hidden = !swim;
      if (swim) {
        meter.firstChild.textContent = avatar.cue === "shore" ? "Time to head for the shore and rest — breath " : "Swimming — breath ";
        meter.querySelector("b").style.width = `${Math.round(avatar.breath * 100)}%`;
      }
    }
  }

  /** The camera: the eye over the avatar (bobbing a little in the water unless reduced), or a chase view behind the vehicle. */
  function cameraPose(eye = 1.7) {
    if (veh) {
      const back = veh.half[2] * 2 + 6, up = veh.half[1] * 2 + 2.5;
      const cx = veh.x - Math.sin(veh.heading) * back, cz = veh.z - Math.cos(veh.heading) * back;
      return { x: cx, y: Math.max(groundAt(cx, cz), veh.y) + up, z: cz, look: [veh.x, veh.y + veh.half[1], veh.z], yaw: veh.heading + Math.PI };
    }
    const bob = avatar.mode === "swim" && !reduced ? Math.sin(t * 2.2) * 0.06 : 0;
    return { x: avatar.x, y: avatar.y + eye + bob, z: avatar.z };
  }

  function counts() {
    return { cones: props.cone.length, barrels: props.barrel.length, cars: props.car.length, litter: litter.length, bodies: bodies.length, awake: bodies.filter((b) => !b.sleeping).length, meshes: Object.keys(meshes).length + 1, seams: world.seams };
  }

  return {
    world, place, walk, drive, exitDrive, animate, cameraPose, counts, ackCard,
    get avatar() { return avatar; }, get vehicle() { return veh; }, get card() { return card; }, get lastCrash() { return lastCrash; },
    driving: () => !!veh, bodies, props, NW_AVATAR,
  };
}
