// The Deep — the three.js scene: the seabed (the shared builder), the diver,
// the buddy and the buddy line, the ROV and its tether, an ascent line to
// the surface at every site, the lanterns, activity markers and the two
// cameras. Everything that touches three.js lives here and in app.js;
// seabed.js, dive-sim.js, dive-career.js, dive-engine.js, dive-map.js and
// activities.js never import three.js, so they all run headless.
//
// buildUnderwater()/deepLighting() are imported straight from DEEP1's
// ../../shared/underwater.js (the ONE import line below); ./seabed-stub-scene.js
// is the pre-integration builder stub in the same shape, kept in the tree but
// no longer bundled (see seabed.js for the data side of the same switch).
import { buildUnderwater, deepLighting } from "../../shared/underwater.js";
import { DV_SITES, dvFloorY } from "./seabed.js";
import { CT_DEEP_ASSETS, CT_DEEP_ASSET_KINDS } from "../../shared/underwater-data.js";
import { CT_HARBOUR_FLEET, ctBuildLiveried, ctServiceLivery } from "../../shared/fleet.js";
import { ctAvatarFigure } from "../../shared/crew.js";
import { dvAscentLines, dvLightBand, dvDaylightFactor } from "./dive-sim.js";

const DV_EYE_HEIGHT = 0.4;

function dvDiverFigure(THREE, { suit = 0x1f3a4a, tank = 0xd9d9d0, fins = 0x222a30 } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.7, 4, 8), new THREE.MeshStandardMaterial({ color: suit, roughness: 0.8 }));
  body.rotation.x = Math.PI / 2; body.position.y = 0.2;
  const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.6, 8), new THREE.MeshStandardMaterial({ color: tank, roughness: 0.5, metalness: 0.4 }));
  cyl.rotation.x = Math.PI / 2; cyl.position.set(0, 0.42, -0.05);
  const mask = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.08), new THREE.MeshStandardMaterial({ color: 0x4fd1ff, emissive: 0x1a5a70, emissiveIntensity: 0.4 }));
  mask.position.set(0, 0.26, 0.5);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.5), new THREE.MeshStandardMaterial({ color: fins, roughness: 0.9 }));
  fin.position.set(0, 0.15, -0.7);
  g.add(body, cyl, mask, fin);
  return g;
}

function dvRovMesh(THREE) {
  const g = new THREE.Group();
  // The survey service's livery (fleet.js's CT_SERVICE_LIVERIES), like the kit's own ROV.
  const lv = ctServiceLivery("survey", 7);
  g.userData.ctService = "survey";
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.1), new THREE.MeshStandardMaterial({ color: lv.colour, roughness: 0.6, metalness: 0.3 }));
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2c0, emissiveIntensity: 1.2 }));
  lamp.position.set(0, 0.1, 0.6);
  const thruster = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 6, 10), new THREE.MeshStandardMaterial({ color: 0x222a30 }));
  thruster.position.set(0, 0, -0.6);
  g.add(frame, lamp, thruster);
  return g;
}

function dvLantern(THREE) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffc860, emissiveIntensity: 1.4, transparent: true, opacity: 0.9 }));
  const cage = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 6, 12), new THREE.MeshStandardMaterial({ color: 0x3a3a40, metalness: 0.7 }));
  cage.rotation.x = Math.PI / 2;
  g.add(glass, cage);
  return g;
}

function dvLineMesh(THREE, a, b, color = 0xf2f2e0) {
  const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color }));
}

/**
 * Builds the whole scene into `root`. `THREE` is the three.js module the
 * app already loaded. Returns handles the render loop and the HUD read every
 * frame: the diver, buddy and ROV meshes, the buddy line and tether, the
 * lanterns by egg id, the activity marker group, dvApplyLighting() and
 * placeCamera().
 */
export function dvBuildWorld(root, THREE, opts = {}) {
  const seabed = buildUnderwater(root, { detail: opts.detail ?? "high", zone: opts.zone });
  let hemi = seabed.lights?.hemi ?? null, key = seabed.lights?.key ?? null;
  if (!hemi || !key) root.traverse((o) => { if (o.isHemisphereLight && !hemi) hemi = o; if (o.isDirectionalLight && !key) key = o; });

  // The learner's own diver: the avatar style picked on the account chip
  // (shared/crew.js), always in dive gear here, laid flat to swim.
  const diver = new THREE.Group();
  function dvSetAvatar(style) {
    while (diver.children.length) diver.remove(diver.children[0]);
    const fig = ctAvatarFigure(THREE, { ...(style ?? {}), ppe: "dive" });
    fig.rotation.x = Math.PI / 2; fig.position.set(0, 0.2, -0.9);
    diver.add(fig);
    return diver;
  }
  dvSetAvatar(opts.avatar);
  const buddy = dvDiverFigure(THREE, { suit: 0x3a5a2a, tank: 0xf2c14b });
  const rov = dvRovMesh(THREE);
  rov.visible = false;
  root.add(diver, buddy, rov);

  // The diver's lamp, so the deep reads as a lamp-lit place rather than a black one.
  const lamp = new THREE.PointLight(0xfff2d0, 0.9, 30);
  diver.add(lamp);

  // The buddy line and the ROV tether: two lines whose geometry is rewritten
  // every frame from the sim's own positions.
  const buddyLine = dvLineMesh(THREE, [0, 0, 0], [0, 0, 0], 0xf2c14b);
  const tether = dvLineMesh(THREE, [0, 0, 0], [0, 0, 0], 0xffe08a);
  tether.visible = false;
  root.add(buddyLine, tether);

  // An ascent line to the surface at every site: a line from the seabed to a
  // small float, so "up" is always a thing a diver can see and swim to.
  const ascent = dvAscentLines(DV_SITES);
  const floatMat = new THREE.MeshStandardMaterial({ color: 0xff9a5a, emissive: 0x803010, emissiveIntensity: 0.4 });
  const ascentMeshes = ascent.map((l) => {
    const line = dvLineMesh(THREE, [l.x, l.bottomY, l.z], [l.x, 0, l.z], 0xffffff);
    const float = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), floatMat);
    float.position.set(l.x, -0.2, l.z);
    root.add(line, float);
    return { line, float, siteId: l.siteId };
  });

  // Interactive assets (CT_DEEP_ASSETS): one InstancedMesh per kind for the
  // body and one for its marker, on the seabed; a buoy's float rides above.
  const ctGeo = {
    buoy: [new THREE.CylinderGeometry(0.04, 0.04, 3, 6), new THREE.SphereGeometry(0.45, 10, 8), 1.5, 3.2],
    "dive-slate": [new THREE.BoxGeometry(0.1, 1.2, 0.1), new THREE.BoxGeometry(0.6, 0.45, 0.05), 0.6, 1.25],
    "survey-marker": [new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), new THREE.BoxGeometry(0.4, 0.3, 0.04), 0.8, 1.55],
    "tool-basket": [new THREE.BoxGeometry(0.9, 0.5, 0.6), new THREE.TorusGeometry(0.3, 0.03, 6, 12), 0.25, 0.7],
  };
  const ctAssetMeshes = [];
  const ctDummy = new THREE.Object3D();
  for (const [kind, [bodyGeo, topGeo, bodyY, topY]] of Object.entries(ctGeo)) {
    const list = CT_DEEP_ASSETS.filter((a) => a.kind === kind && (!opts.zone || a.zone === opts.zone));
    if (!list.length) continue;
    const colour = CT_DEEP_ASSET_KINDS[kind].colour;
    const body = new THREE.InstancedMesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x5a6a70, roughness: 0.8 }), list.length);
    const top = new THREE.InstancedMesh(topGeo, new THREE.MeshStandardMaterial({ color: colour, emissive: colour, emissiveIntensity: 0.4, roughness: 0.5 }), list.length);
    list.forEach((a, i) => {
      const fy = dvFloorY(a.position[0], a.position[1]);
      ctDummy.rotation.set(0, (i * 1.3) % (Math.PI * 2), 0);
      ctDummy.position.set(a.position[0], fy + bodyY, a.position[1]); ctDummy.updateMatrix(); body.setMatrixAt(i, ctDummy.matrix);
      ctDummy.position.set(a.position[0], fy + topY, a.position[1]); ctDummy.updateMatrix(); top.setMatrixAt(i, ctDummy.matrix);
    });
    root.add(body, top);
    ctAssetMeshes.push(body, top);
  }

  // The Deep's harbour fleet at the surface over its sites: the dive-support
  // and restoration workboats and the survey skiff, each in its service
  // livery (fleet.js's CT_HARBOUR_FLEET); the survey ROV is the one above.
  const harbour = CT_HARBOUR_FLEET.filter((h) => h.world === "underwater" && h.builder !== "rov").map((h, i) => {
    const site = DV_SITES.find((s) => s.id === h.at);
    if (!site || (opts.zone && site.zone !== opts.zone)) return null;
    return ctBuildLiveried(root, h, site.position[0] + 6, 0, site.position[2] - 6, { ry: i * 1.1 });
  }).filter(Boolean);

  // Lanterns by egg id, placed on the seabed at the egg's anchor by app.js.
  const lanterns = {};
  function dvPlaceLantern(eggId, x, z) {
    if (lanterns[eggId]) return lanterns[eggId];
    const m = dvLantern(THREE);
    m.position.set(x, dvFloorY(x, z) + 0.9, z);
    root.add(m);
    lanterns[eggId] = m;
    return m;
  }

  // Activity markers: a pool group rebuilt when an activity starts.
  const markers = new THREE.Group();
  root.add(markers);
  const markerMats = {
    checkpoint: new THREE.MeshStandardMaterial({ color: 0x4fd1ff, emissive: 0x1a5a70, emissiveIntensity: 0.6, transparent: true, opacity: 0.7 }),
    viewpoint: new THREE.MeshStandardMaterial({ color: 0xa079ff, emissive: 0x402a80, emissiveIntensity: 0.6, transparent: true, opacity: 0.7 }),
    debris: new THREE.MeshStandardMaterial({ color: 0x8a8a80, roughness: 0.9 }),
    hazardous: new THREE.MeshStandardMaterial({ color: 0xff5a7a, emissive: 0x801020, emissiveIntensity: 0.5 }),
  };
  function dvSetMarkers(list) {
    while (markers.children.length) markers.remove(markers.children[0]);
    for (const m of list ?? []) {
      const mesh = m.kind === "debris" || m.kind === "hazardous"
        ? new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.8), markerMats[m.kind])
        : new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 8, 20), markerMats[m.kind] ?? markerMats.checkpoint);
      mesh.position.set(m.point[0], dvFloorY(m.point[0], m.point[1]) + (m.kind === "debris" || m.kind === "hazardous" ? 0.2 : 1.6), m.point[1]);
      mesh.userData.markerId = m.id;
      markers.add(mesh);
    }
  }
  function dvMarkHit(id) { for (const c of markers.children) if (c.userData.markerId === id) c.visible = false; }

  /** Applies deepLighting(band) for the diver's depth, scaled by the day's
   *  light at that depth — dimmer as the sun sets and as the diver goes
   *  deeper — to the builder's own lights plus the scene's fog/background.
   *  Returns the band and factor the HUD reads (never a depth figure). */
  function dvApplyLighting(scene, depth, hours) {
    const band = dvLightBand(depth);
    const L = deepLighting(band);
    const f = dvDaylightFactor(depth, hours);
    if (hemi) { hemi.color?.setHex?.(L.hemi[0]); hemi.groundColor?.setHex?.(L.hemi[1]); hemi.intensity = L.hemiI * (0.35 + f); }
    if (key) { key.color?.setHex?.(L.key[0]); key.intensity = L.key[1] * (0.2 + f); }
    if (lamp) lamp.intensity = 0.5 + (1 - f) * 1.2;
    // deepLighting()'s fog is a colour with its density beside it
    // (`fogDensity`); the pre-integration stub carried `{ color, density }`.
    const fogColor = typeof L.fog === "object" ? L.fog.color : L.fog;
    const fogDensity = L.fogDensity ?? L.fog?.density ?? 0.02;
    if (scene) {
      if (!scene.fog && THREE.FogExp2) scene.fog = new THREE.FogExp2(fogColor, fogDensity);
      if (scene.fog) { scene.fog.color?.setHex?.(fogColor); if ("density" in scene.fog) scene.fog.density = fogDensity * (opts.fogScale ?? 1); }
      scene.background?.setHex?.(fogColor);
    }
    const caustic = typeof L.caustic === "object" ? L.caustic.intensity : L.caustic;
    return { band, daylight: f, caustic: (caustic ?? 0) * f, particulate: L.particulate };
  }

  /** Chase or first-person camera behind/at (x, y, z) facing `heading`. */
  function placeCamera(camera, mode, x, y, z, heading) {
    const fx = Math.sin(heading), fz = Math.cos(heading);
    if (mode === "first") {
      camera.position.set(x, y + DV_EYE_HEIGHT, z);
      camera.lookAt(x + fx * 20, y + DV_EYE_HEIGHT - 0.2, z + fz * 20);
    } else {
      camera.position.set(x - fx * 6, y + 2.6, z - fz * 6);
      camera.lookAt(x + fx * 5, y + 0.4, z + fz * 5);
    }
  }

  function dvSetLine(mesh, a, b) {
    const attr = mesh.geometry?.attributes?.position;
    if (attr?.setXYZ) { attr.setXYZ(0, a[0], a[1], a[2]); attr.setXYZ(1, b[0], b[1], b[2]); attr.needsUpdate = true; }
  }

  return {
    seabed, diver, buddy, rov, buddyLine, tether, ascentMeshes, lanterns, markers, hemi, key, ctAssetMeshes, harbour, dvSetAvatar,
    dvPlaceLantern, dvSetMarkers, dvMarkHit, dvApplyLighting, placeCamera, dvSetLine,
  };
}
