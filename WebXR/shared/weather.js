import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

// Weather for the plaza. Every station declares the conditions its procedure
// is actually written for — a wet-weather stormwater grab happens in rain, a
// scaffold lift happens in wind, an aerial set happens in the dark — and the
// stage builds them. `?weather=` overrides for a hall that wants to drill a
// crew in conditions the station does not default to.
//
// Each kind carries an operational note: what the weather means for the work,
// shown to the learner with the station's tagline. That is the point of the
// layer. A rain shader is decoration; "the deck is slick and the runoff is
// the sample" is training.
//
// Everything here is a few hundred recycled points and a couple of planes,
// animated by property writes, so a headset pays almost nothing for it. AR
// mode gets none of it: the learner's own room is the weather there.

export const WEATHER_KINDS = ["clear", "overcast", "rain", "fog", "wind", "storm", "smoke"];

export const WEATHER = {
  clear: {
    label: "Clear",
    note: "Clear and still — nothing in the conditions is working against the procedure today.",
    fog: 1, light: 1, drops: 0, gust: 0, wet: 0, sky: 1,
  },
  overcast: {
    label: "Overcast",
    note: "Overcast and flat — colour cues and small print are harder to read than the plan assumes.",
    fog: 0.85, light: 0.8, drops: 0, gust: 0.2, wet: 0.1, sky: 0.9,
  },
  rain: {
    label: "Rain",
    note: "Steady rain — footing is slick, anything on the deck is going somewhere, and paper gets useless fast.",
    fog: 0.7, light: 0.72, drops: 900, gust: 0.35, wet: 0.55, sky: 0.8,
  },
  fog: {
    label: "Fog",
    note: "Thick fog — hand signals stop working at the distance the plan assumes, so everything moves on the radio.",
    fog: 0.34, light: 0.85, drops: 0, gust: 0.1, wet: 0.25, sky: 1.25,
  },
  wind: {
    label: "High wind",
    note: "Sustained wind with gusts — load charts derate, anything with a face on it becomes a sail, and dropped objects travel.",
    fog: 0.95, light: 0.95, drops: 0, gust: 1, wet: 0, sky: 1,
  },
  storm: {
    label: "Storm",
    note: "Driving rain and gusting wind — this is the condition most procedures say to stop for, so the call to keep going is part of the task.",
    fog: 0.55, light: 0.62, drops: 1400, gust: 1.2, wet: 0.7, sky: 0.7,
  },
  // Wildfire smoke: the air itself is the hazard. The sky and the fog take
  // the plume's colour, ash drifts down, and the sun is a dim orange disc.
  // The note carries the rule a crew actually works to.
  smoke: {
    label: "Wildfire smoke",
    note: "Wildfire smoke — the AQI decides the shift: under Cal/OSHA's wildfire smoke rule, respirators are offered when PM2.5 reaches an AQI of 151 and required above 500, and every instrument on site is reading the plume, not the work.",
    fog: 0.42, light: 0.66, drops: 0, gust: 0.25, wet: 0, sky: 0.8, tint: 0x8a5a33, ash: 240,
  },
};

/** The station's own conditions, unless the URL asks for something else. */
export function weatherFor(stationWeather) {
  const q = typeof location !== "undefined" ? new URLSearchParams(location.search).get("weather") : null;
  if (q && WEATHER_KINDS.includes(q)) return q;
  return WEATHER_KINDS.includes(stationWeather) ? stationWeather : "clear";
}

/** A falling-and-recycling point cloud over a box around the plaza. */
function rainfall(parent, count, { spread = 34, height = 16, speed = 22, slant = 0, colour = 0x9fc6e0, size = 0.055 } = {}) {
  const positions = new Float32Array(count * 3);
  const fall = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = Math.random() * height;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
    fall[i] = speed * (0.75 + Math.random() * 0.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: colour, size, transparent: true, opacity: 0.62, depthWrite: false, sizeAttenuation: true });
  mat.userData.ownMaterial = true;
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  parent.add(pts);
  pts.userData.step = (dt, gust) => {
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 1] -= fall[i] * dt;
      positions[i * 3] += (slant + gust) * dt * 3;
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = height;
        positions[i * 3] = (Math.random() - 0.5) * spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      } else if (Math.abs(positions[i * 3]) > spread / 2) {
        positions[i * 3] = -Math.sign(positions[i * 3]) * spread / 2;
      }
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

/** Wind-borne dust and litter: slow horizontal streaks at working height. */
function windborne(parent, count = 90, { spread = 26 } = {}) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = 0.2 + Math.random() * 4.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: 0xcdbfa6, size: 0.07, transparent: true, opacity: 0.35, depthWrite: false, sizeAttenuation: true });
  mat.userData.ownMaterial = true;
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  parent.add(pts);
  pts.userData.step = (dt, gust) => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] += (2.2 + gust * 5) * dt;
      positions[i * 3 + 1] += Math.sin(positions[i * 3] * 0.7 + i) * dt * 0.25;
      if (positions[i * 3] > spread / 2) { positions[i * 3] = -spread / 2; positions[i * 3 + 2] = (Math.random() - 0.5) * spread; }
    }
    geo.attributes.position.needsUpdate = true;
  };
  return pts;
}

/**
 * Build the weather over a plaza.
 *   parent  a group inside the stage (freed with it)
 *   scene   for the fog, which the caller has already set for time of day
 *   kind    one of WEATHER_KINDS
 * Returns { animate(t, dt), gustAt(t), label, note, lightScale, kind }.
 */
export function buildWeather(parent, scene, kind = "clear") {
  const w = WEATHER[WEATHER_KINDS.includes(kind) ? kind : "clear"];
  const g = new THREE.Group();
  parent.add(g);

  if (scene?.fog && w.fog !== 1) {
    scene.fog.near *= w.fog;
    scene.fog.far *= w.fog;
  }
  if (scene?.background?.isColor && w.sky !== 1) {
    scene.background.multiplyScalar(w.sky);
  }
  // A tinted kind pulls the sky and the fog toward the plume's colour, so
  // the horizon reads as smoke rather than as an evening.
  if (w.tint !== undefined) {
    const tint = new THREE.Color(w.tint);
    if (scene?.background?.isColor) scene.background.lerp(tint, 0.55);
    if (scene?.fog?.color) scene.fog.color.lerp(tint, 0.6);
  }

  // Wet deck: a dark, very reflective disc just above the plaza so the lights
  // and the station's accent smear across it the way they do on a wet apron.
  let wet = null;
  if (w.wet > 0) {
    const geo = new THREE.CircleGeometry(14.8, 48);
    const mat = new THREE.MeshStandardMaterial({ color: 0x0a1016, roughness: 0.08, metalness: 0.9, transparent: true, opacity: w.wet * 0.75, depthWrite: false });
    mat.userData.ownMaterial = true;
    wet = new THREE.Mesh(geo, mat);
    wet.rotation.x = -Math.PI / 2;
    wet.position.y = 0.062;
    g.add(wet);
  }

  const drops = w.drops > 0 ? rainfall(g, w.drops, { speed: kind === "storm" ? 28 : 20, slant: kind === "storm" ? 1.4 : 0.5, size: kind === "storm" ? 0.075 : 0.062 }) : null;
  const dust = w.gust >= 0.8 ? windborne(g) : null;
  // Ash: the same recycling cloud as rain, falling slowly, pale, and few.
  const ash = w.ash > 0 ? rainfall(g, w.ash, { speed: 1.1, slant: 0.25, colour: 0xd9d1c4, size: 0.05, height: 12 }) : null;
  if (w.tint !== undefined) {
    const sun = new THREE.DirectionalLight(0xff9a4a, 0.55);
    sun.position.set(8, 6, -14);
    g.add(sun);
  }

  // A cold overhead fill so a rainy or foggy plaza reads as weather rather
  // than as an under-lit scene.
  if (w.light < 0.95) {
    const damp = new THREE.HemisphereLight(0x9fb4c6, 0x1a222c, (1 - w.light) * 2.4);
    g.add(damp);
  }
  // Lightning on a storm: one shared flash light, dark except when it fires.
  let flash = null, nextFlash = 3 + Math.random() * 6, flashFor = 0;
  if (kind === "storm") {
    flash = new THREE.DirectionalLight(0xdfeaf2, 0);
    flash.position.set(-6, 14, -10);
    g.add(flash);
  }

  const gustAt = (t) => w.gust === 0 ? 0 : w.gust * (0.55 + Math.sin(t * 0.7) * 0.25 + Math.sin(t * 2.3) * 0.2);

  return {
    kind: WEATHER_KINDS.includes(kind) ? kind : "clear",
    label: w.label,
    note: w.note,
    lightScale: w.light,
    gustAt,
    root: g,
    animate(t, dt) {
      const gust = gustAt(t);
      if (drops) drops.userData.step(dt, gust);
      if (dust) dust.userData.step(dt, gust);
      if (ash) ash.userData.step(dt, gust);
      if (wet) wet.material.opacity = w.wet * (0.62 + Math.sin(t * 0.8) * 0.08);
      if (flash) {
        if (flashFor > 0) {
          flashFor -= dt;
          flash.intensity = flashFor > 0 ? 2.2 + Math.random() * 1.6 : 0;
        } else {
          nextFlash -= dt;
          if (nextFlash <= 0) { flashFor = 0.12 + Math.random() * 0.12; nextFlash = 5 + Math.random() * 12; }
        }
      }
    },
  };
}
