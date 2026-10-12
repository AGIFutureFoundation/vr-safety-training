import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, mergeStatic, particles } from "../../shared/kit.js";
import { reducedMotion } from "../../shared/a11y.js";
import { CITY, standingFigure } from "./citykit.js";

// Life on the site.
//
// The apron gave every station a gate, a laydown, a crew truck and a muster
// point, and it was completely deserted. An empty site does not read as a site
// — it reads as a model of one, and a learner who is being taught to work
// around other people is being shown a world with no other people in it.
//
// So: a crew doing believable things at the distances they would really be at,
// a yard vehicle on a slow loop, and the plume off a vent. Nobody here is a
// step target or a hazard; the procedure is unchanged. What changes is that
// the place is inhabited, which is most of what makes an environment vivid.
//
// It is affordable because of mergeStatic's local mode: each figure and the
// truck are baked into two or three meshes that still move as a unit, so the
// whole ambient layer costs about a dozen draw calls rather than eighty.

function crew(parent, x, z, ry, o = {}) {
  const g = group(parent, x, 0, z, ry);
  standingFigure(g, 0, 0, { ry: 0, cloth: o.cloth ?? 0xe3a534, trousers: o.trousers ?? 0x2f3740, skin: o.skin });
  // Hard hat, because everyone on this site is wearing one and a learner will
  // notice the one person who is not.
  ball(g, 0.13, 0, 1.62, 0, o.hat ?? 0xf2c14b, { rough: 0.55, seg: 10 });
  cyl(g, 0.19, 0.19, 0.02, 0, 1.56, 0, o.hat ?? 0xf2c14b, { rough: 0.55, seg: 12 });
  if (o.holding === "clipboard") {
    box(g, 0.22, 0.29, 0.02, 0.2, 1.02, 0.16, 0xdfe6ec, { rough: 0.8 });
  } else if (o.holding === "wands") {
    for (const sx of [-1, 1]) cyl(g, 0.035, 0.035, 0.32, sx * 0.26, 1.02, 0.1, 0xe4622a, { rough: 0.6, seg: 8, emissive: 0xe4622a, ei: 0.5 });
  }
  // Two meshes, and they still stand where they are put and turn on the spot.
  mergeStatic(g, { local: true });
  g.userData.phase = Math.random() * Math.PI * 2;
  g.userData.home = ry;
  return g;
}

// A yard vehicle on a slow loop, well outside the work area. Movement in the
// periphery is what stops a scene reading as a photograph.
function yardTruck(parent, o = {}) {
  const g = group(parent);
  const body = group(g);
  box(body, 1.7, 0.5, 3.6, 0, 0.72, 0, o.color ?? 0xd8a33a, { rough: 0.6, metal: 0.25 });
  box(body, 1.65, 0.95, 1.4, 0, 1.4, -1.0, o.cab ?? 0xe0b04a, { rough: 0.55, metal: 0.3 });
  box(body, 1.4, 0.5, 0.05, 0, 1.55, -0.32, 0x9fc2d8, { rough: 0.25, metal: 0.45 });
  box(body, 1.55, 0.06, 2.1, 0, 1.0, 0.8, 0x4a535d, { rough: 0.7, metal: 0.4 });
  for (const [wx, wz] of [[-0.82, -1.2], [0.82, -1.2], [-0.82, 1.3], [0.82, 1.3]]) {
    const w = cyl(body, 0.36, 0.36, 0.24, wx, 0.36, wz, 0x15181c, { rough: 0.95, seg: 12 });
    w.rotation.z = Math.PI / 2;
  }
  mergeStatic(body, { local: true });
  // The beacon is the one part that has to keep its own material, because it
  // pulses — see ownMaterial() in shared/kit.js for why that matters.
  const beacon = box(g, 0.2, 0.12, 0.2, 0, 2.0, -1.0, 0xf2a03a, { cast: false, rough: 0.4, emissive: 0xf2a03a, ei: 1.2 });
  beacon.material = beacon.material.clone();
  beacon.material.userData.ownMaterial = true;
  return { root: g, beacon };
}

/**
 * Populate the apron. `radius` is the fence line, so the crew and the traffic
 * sit between the work and the boundary and never inside the work area.
 */
export function buildAmbient(parent, o = {}) {
  const g = group(parent);
  const R = o.radius ?? 8.2;
  const at = (bearing, r = R) => [Math.sin(bearing) * r, Math.cos(bearing) * r];

  const people = [];
  // A supervisor by the gate with a clipboard, watching you come in.
  {
    const [x, z] = at(0.34, R + 1.6);
    people.push(crew(g, x, z, 0.34 - Math.PI, { holding: "clipboard", cloth: 0xdd7a2f }));
  }
  // Two on the laydown, working stock.
  {
    const [x, z] = at(2.1, R - 0.6);
    people.push(crew(g, x, z, 2.1 - Math.PI + 0.5, { cloth: 0xe3a534 }));
    const [x2, z2] = at(2.5, R + 0.4);
    people.push(crew(g, x2, z2, 2.5 - Math.PI - 0.7, { cloth: 0xc8d24a, trousers: 0x35404a }));
  }
  // A banksman on the plant route, wands down, waiting for the truck.
  {
    const [x, z] = at(Math.PI + 0.1, R + 0.9);
    people.push(crew(g, x, z, 0.1, { holding: "wands", cloth: 0xe4622a }));
  }

  const truck = yardTruck(g, {});
  const route = { r: R + 2.2, a: 1.2, speed: 0.085 };

  // A vent plume somewhere on the boundary — a site is always venting
  // something, and a moving column reads at any distance.
  const [vx, vz] = at(4.9, R + 1.4);
  const vent = group(g, vx, 0, vz);
  cyl(vent, 0.3, 0.36, 1.5, 0, 0.75, 0, 0x5a636c, { rough: 0.7, metal: 0.4, seg: 12 });
  cyl(vent, 0.34, 0.3, 0.14, 0, 1.56, 0, 0x39424b, { rough: 0.6, metal: 0.5, seg: 12 });
  mergeStatic(vent, { local: true });
  const plume = particles(vent, 26, 0xdfe6ec, { size: 0.16, opacity: 0.22 });
  plume.position.set(0, 1.6, 0);

  return {
    root: g,
    animate(t, dt = 0.016) {
      if (reducedMotion()) return;
      // People shift their weight and glance about. Two properties per figure,
      // no allocation, and it is the difference between a crew and a row of
      // mannequins.
      for (const p of people) {
        const ph = p.userData.phase;
        p.rotation.y = p.userData.home + Math.sin(t * 0.32 + ph) * 0.16;
        p.position.y = Math.sin(t * 1.15 + ph) * 0.012;
      }
      // The truck drives its loop and its beacon turns.
      route.a += route.speed * dt;
      truck.root.position.set(Math.sin(route.a) * route.r, 0, Math.cos(route.a) * route.r);
      truck.root.rotation.y = route.a + Math.PI / 2;
      truck.beacon.material.emissiveIntensity = 0.9 + Math.max(0, Math.sin(t * 3.4)) * 1.5;
      plume.userData.step?.(dt, plume.position, 0.22, 0.5, -0.12);
    },
  };
}

void CITY;
