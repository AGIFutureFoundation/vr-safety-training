// Bay Regatta — the three.js scene: Bay World's own city and water
// (shared/bayworld.js), the twelve yachts of the fleet at their berths
// (shared/yacht-fleet.js), the course marks, weather (shared/weather.js) and a
// chase camera. Everything that touches three.js lives here and in app.js;
// courses.js, race.js and events.js never import it, so they run headless.
import { buildBayWorld, bayLighting } from "../../shared/bayworld.js";
import { buildWeather, weatherFor } from "../../shared/weather.js";
import { YACHT_FLEET, buildYacht, rgYachtBerthPose } from "../../shared/yacht-fleet.js";
import { rgCourseWaypoints } from "./courses.js";

const RG_WATER_Y = -0.4;

/** Continuous hour → the discrete bucket bayLighting() understands. */
export function rgHourBucket(hours) {
  const h = ((hours % 24) + 24) % 24;
  if (h >= 6 && h < 18) return "day";
  if ((h >= 18 && h < 20) || (h >= 5 && h < 6)) return "dusk";
  return "night";
}

function rgBuoy(THREE, colour, tall = false) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 1.6, 12), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 }));
  body.position.y = 0.6;
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8), new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 }));
  top.position.y = 1.6;
  g.add(body, top);
  if (tall) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5, 8), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.5 }));
    pole.position.y = 4.0;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.9, 1.4), new THREE.MeshStandardMaterial({ color: 0xf2c14b, roughness: 0.85 }));
    flag.position.set(0, 6.0, 0.7);
    g.add(pole, flag);
  }
  return g;
}

/**
 * Builds the scene into `root`. Returns handles the loop reads every frame:
 * the yachts by id (each already floating at its berth), the course group
 * builder, the weather and lighting setters and the chase camera.
 */
export function rgBuildWorld(root, THREE, opts = {}) {
  const city = buildBayWorld(root, { detail: opts.detail ?? "high", time: "day" });
  let hemi = null, sun = null;
  root.traverse((o) => { if (o.isHemisphereLight && !hemi) hemi = o; if (o.isDirectionalLight && !sun) sun = o; });

  const yachts = {};
  for (const y of YACHT_FLEET) {
    const pose = rgYachtBerthPose(y);
    const mesh = buildYacht(root, y.id, pose.x, RG_WATER_Y - 1.2 * y.length, pose.z, pose.heading);
    mesh.userData.berthPose = pose;
    yachts[y.id] = mesh;
  }

  let courseGroup = null;
  /** Lays a course's marks, the start/finish pins and the dock marker; tears down the last one. */
  function rgLayCourse(course) {
    if (courseGroup) root.remove(courseGroup);
    courseGroup = new THREE.Group();
    root.add(courseGroup);
    const marks = [];
    for (const m of course.marks) {
      const b = rgBuoy(THREE, m.side === "port" ? 0xd8322c : 0x59c97b);
      b.position.set(m.x, RG_WATER_Y, m.z);
      b.userData.markId = m.id;
      courseGroup.add(b); marks.push(b);
    }
    for (const p of [course.start.a, course.start.b]) { const pin = rgBuoy(THREE, 0xf4f5f2, true); pin.position.set(p[0], RG_WATER_Y, p[1]); courseGroup.add(pin); }
    const dock = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 14), new THREE.MeshStandardMaterial({ color: 0x8a7a62, roughness: 0.9 }));
    dock.position.set(course.dock.x + Math.sin(course.dock.heading) * 9, 0.2, course.dock.z + Math.cos(course.dock.heading) * 9);
    dock.rotation.y = course.dock.heading;
    courseGroup.add(dock);
    // A faint line on the water joining the waypoints, for the learner's first lap.
    const wp = rgCourseWaypoints(course);
    for (let i = 1; i < wp.length; i++) {
      const [ax, az] = wp[i - 1], [bx, bz] = wp[i];
      const len = Math.hypot(bx - ax, bz - az);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, len), new THREE.MeshBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.25 }));
      seg.position.set((ax + bx) / 2, RG_WATER_Y + 0.05, (az + bz) / 2);
      seg.rotation.y = Math.atan2(bx - ax, bz - az);
      courseGroup.add(seg);
    }
    return { group: courseGroup, marks };
  }

  /** Fog shortens how far a mark can be seen: marks beyond `visibility` from (x, z) fade out. */
  function rgFadeMarks(marks, x, z, visibility) {
    for (const b of marks) b.visible = Math.hypot(b.position.x - x, b.position.z - z) <= visibility;
  }

  let weather = null, weatherKind = null;
  function rgSetWeather(kind) {
    const wanted = weatherFor(kind);
    if (wanted === weatherKind) return weather;
    if (weather?.dispose) weather.dispose();
    else if (weather?.group?.parent) weather.group.parent.remove(weather.group);
    const group = new THREE.Group();
    root.add(group);
    weather = { ...buildWeather(group, opts.scene ?? { fog: null }, wanted), group };
    weatherKind = wanted;
    return weather;
  }

  function rgApplyLighting(scene, hours) {
    const bucket = rgHourBucket(hours);
    const L = bayLighting(bucket);
    if (hemi) { hemi.color?.setHex?.(L.hemi[0]); hemi.groundColor?.setHex?.(L.hemi[1]); hemi.intensity = L.hemiI; }
    if (sun) { sun.color?.setHex?.(L.key[0]); sun.intensity = L.key[1]; }
    if (scene) {
      if (!scene.fog && THREE.FogExp2) scene.fog = new THREE.FogExp2(L.fog, 0.004);
      if (scene.fog) scene.fog.color?.setHex?.(L.fog);
      scene.background?.setHex?.(L.sky);
    }
    return { bucket, isNight: bucket === "night" };
  }

  /** Places a yacht mesh from a race boat state: floating at its draft, heeled a little into a turn. */
  function rgPlaceYacht(mesh, boat, t = 0) {
    const k = mesh.userData.lengthScale ?? 1;
    mesh.position.set(boat.x, RG_WATER_Y - 1.2 * k + Math.sin(t * 1.3 + boat.x * 0.01) * 0.08, boat.z);
    mesh.rotation.y = boat.heading;
    mesh.rotation.z = -(boat.rudder ?? 0) * 0.06 * Math.min(1, Math.abs(boat.speed) / 6);
  }

  /** Chase camera behind the learner's yacht, or a high helm view. */
  function placeCamera(camera, mode, boat) {
    const fx = Math.sin(boat.heading), fz = Math.cos(boat.heading);
    if (mode === "helm") {
      camera.position.set(boat.x - fx * 2, 6.2, boat.z - fz * 2);
      camera.lookAt(boat.x + fx * 60, 3.5, boat.z + fz * 60);
    } else {
      camera.position.set(boat.x - fx * 42, 16, boat.z - fz * 42);
      camera.lookAt(boat.x + fx * 20, 2, boat.z + fz * 20);
    }
  }

  return { city, yachts, sun, hemi, rgLayCourse, rgFadeMarks, rgSetWeather, rgApplyLighting, rgPlaceYacht, placeCamera };
}
