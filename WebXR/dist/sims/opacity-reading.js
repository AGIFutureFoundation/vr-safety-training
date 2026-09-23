import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, instrument, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Opacity Reading VR — Environmental Monitoring, station
// ninety-five.
//
// A certified visible-emissions observer reading a boiler stack's plume by
// EPA Method 9 — the real "smoke school" method at 40 CFR 60 Appendix A. The
// number this produces is a legal one: it either sits under the plant's Title
// V permit limit or it does not, and the whole procedure exists to make one
// person's eyeball estimate defensible enough to carry that weight.
//
// Three things make it its own trade rather than a glance at a chimney:
//   * geometry comes before the reading. The observer has to stand where the
//     sun is broadly behind them — Method 9 calls for it within roughly a
//     140-degree sector at the observer's back — because a plume read with
//     the sun in front of it or off to a hard side scatters light differently
//     and biases the estimate high or low before a single number is written;
//   * the reading is not one number, it is twenty-four: opacity read to the
//     nearest 5 percent every 15 seconds for six minutes, and it is the
//     average of that set that gets compared against the permit limit, not
//     any single glimpse;
//   * a plume is not the only white thing coming off a stack. Steam
//     condensing out of flue gas looks exactly like particulate until it
//     thins out, and Method 9 is explicit that the point read is past where
//     any steam plume has dissipated — read through the steam and the number
//     describes water, not the permit.
//
// Sited generically at a bay-front boiler stack under a Title V permit; no
// real facility, inspector or enforcement action is named or implied.

const OPR_ACCENT = 0x9fc6e0;

export const SIM_OPACITY_READING = {
  id: "opacity-reading",
  index: "95",
  domain: "Environmental",
  trade: "Visible emissions observer / certified Method 9 reader",
  category: "Environmental Monitoring",
  weather: "wind",
  certification: "AFSCME air-district inspector — certified under EPA Method 9 (40 CFR 60 Appendix A), recertified every six months by reading a smoke generator against a panel of known opacities; Bay Area Air Quality Management District Regulation 6 (particulate matter) as enforced against the plant's Title V permit; IUOE stationary engineers and USW plant crews who run the boiler this observation is taken on; OSHA 29 CFR 1910 Subpart D fall protection where the observation point is elevated",
  name: "Opacity Reading",
  title: simTitle("Opacity Reading"),
  tagline: "EPA Method 9 by the book: certification checked, the sun kept at your back, the plume's densest point read for six minutes, and the average carried against the permit",
  accent: OPR_ACCENT,
  accentCss: "#9fc6e0",
  parSeconds: 260,
  footprint: 2.3,
  badge: { id: "smoke-school-certified", name: "Smoke School Certified", note: "A Method 9 observation taken from the right ground, read past the steam, and averaged honestly against the permit" },

  game: system({
    name: "Visible Emissions Authority",
    currency: "OPACITY",
    ranks: ["Trainee Observer", "Field Observer", "Certified Reader", "Lead Observer", "Visible Emissions Authority"],
    badges: [
      { id: "sun-at-your-back", name: "Sun At Your Back", note: "Took the observation point with the sun in the 140-degree sector behind, first time", test: AWARD.stepClean("obs-point") },
      { id: "read-past-the-steam", name: "Read Past The Steam", note: "Never logged a reading taken inside the condensed steam", test: AWARD.safe },
      { id: "twenty-four-clean", name: "Twenty-Four Clean", note: "Held every 15-second reading close to true across the set", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections anywhere in the six-minute set", test: AWARD.clean },
      { id: "held-the-sightline", name: "Held The Sightline", note: "Never lost the plume's densest point during the read", test: AWARD.unbroken },
      { id: "off-the-clock", name: "Off The Clock", note: "Full observation, logged and signed, inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "backdate-cert": "You altered the date on the certification card instead of reading what it actually says. A lapsed Method 9 certification does not make a bad observer — it makes every reading that observer takes inadmissible, and a card that has been changed to hide that turns a stale certification into falsified compliance data, which is a different and much worse problem under the Clean Air Act.",
    "look-into-sun": "You sighted your position by looking straight along the line to the sun. Method 9 lines an observer up from their own shadow and a compass card, never a glance at the sun itself — a moment of glare bright enough to leave an afterimage is not worth saving the ten seconds a compass reading takes.",
    "elevated-no-tie": "You stepped up onto the observation platform without clipping to its anchor. The platform exists because the plaza wall blocks the sightline from ground level, and OSHA's fall-protection rule does not care that the drop is short and the visit is quick — the anchor is bolted to the rail for exactly this five minutes of standing at the edge.",
    "haul-road": "You set the tripod up in the plant's marked haul road to get a cleaner sightline. A compliance observer standing where a loaded truck expects a clear lane is not protected by the fact that their attention is on a stopwatch and a stack instead of the road — the sightline is worth nothing to an observer who has been struck getting it.",
  },

  lateNotes: {
    "smoke-chart": "The densest point of the plume has to be found and the observation point has to be set before the clock on a Method 9 reading means anything.",
    "wind-sock": "Wind, sky and background are recorded against the set that was actually read — logged before the set exists, they describe nothing.",
    "average-calc": "There is no average to compute until both blocks of readings are logged on the form.",
  },

  interrupts: [
    {
      id: "cloud-shadow",
      kind: "Background contrast changed",
      after: "read-1", delay: 3, seconds: 12,
      alert: "A cloud has moved in front of the sun and is passing behind the plume — the sky you are reading the plume against has gone from bright to flat in the middle of your set.",
      cue: "The background behind the plume just changed while you were mid-read.",
      target: "flag-reading",
      why: "Method 9 reads opacity against the sky or a contrasting background, and that background is assumed to hold steady for the six minutes of a set. A cloud crossing behind the plume changes the contrast the estimate is being made against without changing the plume at all, so the readings taken in that window are flagged on the form rather than folded into the average as if nothing had happened.",
      missNote: "The set closed with no flag on the readings taken while the background changed. A reviewer reading this form later has no way to know which numbers in the average were taken against a different sky than the rest, and Method 9's whole defence — that the conditions are recorded, not assumed — depends on that being written down when it happens.",
      wrongNote: "That does not flag the reading. The contrast changed on the sky behind the plume, and it is the affected readings on the form that get marked, not the plume itself.",
    },
    {
      id: "steam-plume",
      kind: "Steam in the plume",
      after: "read-2", delay: 4, seconds: 13,
      alert: "Steam is condensing out of the flue gas right at the stack exit and is sitting in the part of the plume you are reading.",
      cue: "What you are reading now has steam in it, not just particulate.",
      target: "steam-clear-point",
      why: "Condensed steam looks exactly like particulate opacity until it has had room to re-evaporate, and Method 9 is explicit that the point read is beyond where any steam plume has visibly dissipated. Reading through it does not average out over six minutes — it reads high the whole time, because the water is there the whole time.",
      missNote: "The set carried on reading the steam-laden part of the plume as if it were the emission. Every 15-second reading taken in that stretch measured condensed water vapour rather than particulate, and the average built from it overstates the stack's actual opacity — the kind of error that gets a compliant plant cited for a violation it did not commit.",
      wrongNote: "Not there. Move the sightline past the point where the steam has visibly cleared — that is where Method 9 says the plume is read.",
    },
  ],

  steps: [
    {
      id: "protocol", kind: "select", target: "method9-card",
      title: "Take the Method 9 field procedure",
      cue: "Read what permit condition this observation is checking and what the reference method requires.",
      why: "A Method 9 reading is a legal test run against a written procedure — the sun geometry, the reading interval, the rounding to the nearest 5 percent and the averaging rule are not judgment calls made fresh on the day, they are 40 CFR 60 Appendix A, and the plant's Title V permit is what makes the number that comes out of it enforceable.",
    },
    {
      id: "cert-check", kind: "select", target: "cert-card",
      title: "Check your certification date",
      cue: "Read the date on your Method 9 card against today's date.",
      why: "A visible-emissions certification lapses six months after the smoke-school test that earned it. A reading taken by a lapsed observer is not a weaker reading, it is not a Method 9 reading at all — the card is checked before the tripod comes off the truck, not after a permit reviewer asks for it.",
    },
    {
      id: "sun-position", kind: "turn", target: "sun-compass",
      title: "Find where the sun has to be behind you",
      cue: "Turn the compass card until the sun's bearing falls inside the 140-degree sector marked at your back.",
      why: "Read with the sun ahead of you or hard off to one side and the plume scatters the light differently than it would to an observer standing correctly, biasing the estimate before any reading is taken. The compass, not a glance at the sun, is what proves the geometry — turned to the marked sector, the reading that follows is defensible.",
      turn: { turns: 0.6, axis: "y", label: "SUN COMPASS" },
    },
    {
      id: "distance-check", kind: "gauge", target: "rangefinder",
      title: "Confirm the viewing distance",
      cue: "Range the stack and commit once the reading puts the whole plume in view.",
      why: "Too close and the observer is reading a slice of the plume rather than its full cross-section as it leaves the stack; too far and the plume has already thinned into the sky before a percentage means anything. The rangefinder turns 'far enough' into a number instead of a guess made by eye.",
      gauge: {
        label: "RANGE", speed: 0.7, green: [0.4, 0.62],
        readout: (t) => `${(t * 60).toFixed(0)} m`,
        missNote: "Too close or too far for the whole plume to be in view at once. Range it again before the scope is set on the mark.",
      },
    },
    {
      id: "obs-point", kind: "drag", target: "tripod",
      title: "Carry the scope to the observation point",
      cue: "Lift the spotting scope off its stand and set it on the marked point at the required distance and angle from the stack.",
      why: "Method 9 sets the distance and the angle the plume has to be viewed from — close enough to resolve the plume clearly, far enough and square enough that the observer is looking across it rather than down its length. A scope set up anywhere convenient is reading a different plume than the one the method describes.",
      drag: { to: "obs-mark", radius: 0.5, missNote: "That is not the marked observation point. The distance and angle are set by the method, not by wherever the ground happens to be clear." },
    },
    {
      id: "densest-point", kind: "find", noHint: true,
      targets: ["densest-point"],
      itemNames: { "densest-point": "densest point of the plume" },
      itemNotes: { "densest-point": "Just past the stack exit, before the plume has had room to dilute into the sky, is where its opacity reads highest and truest — closer in it is still turbulent, further out it has already thinned." },
      title: "Sight the plume's densest point",
      cue: "Look along the plume and click the point just past the stack exit where it reads darkest.",
      why: "Opacity is read at the point in the plume where it is most opaque, which sits close to the stack exit before dilution and mixing have had a chance to lighten it. A reading taken further downstream describes a plume that has already thinned on its own, not the one the stack is actually emitting.",
    },
    {
      id: "read-1", kind: "track", target: "smoke-chart", seconds: 8,
      title: "Read the first block: 15-second intervals",
      cue: "Hold the reading on the plume's densest point and keep it matched to the shade on the comparison chart.",
      why: "Method 9 reads opacity to the nearest 5 percent every 15 seconds, and each reading is a fresh look rather than a running impression carried over from the last one. Held loosely, the eye drifts toward what it expects to see instead of what the plume is actually doing at that instant.",
      holdBreakNote: "You looked away before the block finished. A Method 9 set is 15-second readings taken continuously — a broken block is not a shorter set, it is not a set.",
      track: {
        label: "OPACITY", green: [0.2, 0.45], rise: 0.48, fall: 0.42, drift: 0.14,
        readout: (v) => `${(Math.round((v * 100) / 5) * 5).toFixed(0)}%`,
      },
    },
    {
      id: "read-2", kind: "hold", target: "smoke-chart", seconds: 7,
      title: "Read the second block, past the steam",
      cue: "Hold the reading on the plume beyond where any condensed steam has cleared.",
      why: "The set is not finished at three minutes — it runs the full six, and the back half is read exactly like the front half: same point in the plume, same 15-second cadence, same comparison chart. Method 9 does not let an observer average a short set and call it representative.",
      holdBreakNote: "You let the reading go before the block finished. A partial block is not half a reading, it is no reading — the interval starts over.",
    },
    {
      id: "field-conditions", kind: "sequence", anyOrder: true,
      targets: ["wind-sock", "sky-panel", "background-panel"],
      itemNames: { "wind-sock": "wind direction and speed", "sky-panel": "sky condition", "background-panel": "background used for the reading" },
      itemNotes: {
        "wind-sock": "Wind direction is part of the record because it is also what confirms the sun-and-observer geometry actually held for the whole set.",
        "sky-panel": "Clear, scattered or overcast — the sky condition is what tells a later reviewer how much contrast the observer actually had to read against.",
        "background-panel": "Sky or terrain, the background is recorded because it is what the plume was read against, and a different background reads a different number off the same plume.",
      },
      title: "Record the wind, sky and background",
      cue: "Log the wind, the sky condition and the background the plume was read against — any order.",
      why: "None of these change the plume, but all three are what let somebody who was not standing here judge whether the reading is trustworthy. A number with no record of what it was read against is an opinion with a percentage sign on it.",
    },
    {
      id: "log", kind: "select", target: "field-form",
      title: "Log both blocks on the Method 9 form",
      cue: "Transcribe the readings from both blocks onto the field form, to the nearest 5 percent.",
      why: "The field form is the record a permit reviewer actually sees, and Method 9 requires every one of the readings on it, not just the average — a form with only a final number gives nobody a way to check that the average was built honestly from what was actually seen.",
    },
    {
      id: "average", kind: "gauge", target: "average-calc",
      title: "Average the set and compare to the permit limit",
      cue: "Average all the readings in the set and commit against Regulation 6's limit under the Title V permit.",
      why: "Method 9's number is the average of the full set, never a single glimpse, because six minutes of readings is what separates an observation from an impression. That average is what stands or falls against the permit limit — the plant is either under it or it is not, and there is no rounding a violation away.",
      gauge: {
        label: "AVERAGE", speed: 0.68, green: [0.15, 0.4],
        readout: (t) => `${(Math.round((t * 60) / 5) * 5).toFixed(0)}%`,
        missNote: "That average sits above what the permit allows. It gets reported as read — an observer does not tune the average to fit the limit, the limit is what the average is judged against.",
      },
    },
    {
      id: "sign", kind: "select", target: "sign-pen",
      title: "Sign the observation form",
      cue: "Sign and date the completed Method 9 form.",
      why: "An unsigned Method 9 form is an unattributed set of numbers. The signature is what turns six minutes of readings into a certified observer's sworn account of what the stack was doing, which is the only reason a permit reviewer can act on it at all.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, OPR_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 5.8, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#20262d", base2: "#1a2027", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.03, color: 0xc3cdd6 },
    );
    // A haul-road stripe crossing one corner — the wrong place to set a tripod.
    const roadMesh = box(g, 5.4, 0.02, 1.1, 0.1, 0.145, 2.05, 0xffffff, { rough: 0.75, cast: false });
    roadMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => { cx.fillStyle = "#2b2f34"; cx.fillRect(0, 0, w, h);
        cx.fillStyle = "rgba(224,170,60,0.65)"; for (let x = 0; x < w; x += 90) cx.fillRect(x, h * 0.46, 46, h * 0.08); }, { repeat: 4, px: 256 }),
      { rough: 0.7, metal: 0.1, color: 0xb9beC4 },
    );
    holoTag(g, "Haul road — keep clear", 0.1, 0.35, 2.05, { css: "#f0645b", w: 0.5 });
    const haulTrap = box(g, 1.0, 0.4, 0.7, 0.6, 0.3, 2.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, haulTrap, "haul-road");

    // -------------------------------------------------------------- stack
    // Background scenery at the plaza edge: a shortened industrial boiler
    // stack with a drifting plume the learner reads from the ground.
    const STACK_X = -1.9, STACK_Z = -2.7;
    const stack = group(g, STACK_X, 0, STACK_Z);
    cyl(stack, 0.62, 0.78, 8.6, 0, 4.3, 0, 0x8a7f74, { rough: 0.95, seg: 22, finish: "concrete", tile: [4, 8] });
    for (let i = 0; i < 3; i++) {
      cyl(stack, 0.66 - i * 0.03, 0.68 - i * 0.03, 0.1, 0, 1.6 + i * 2.6, 0, 0x5f564a, { rough: 0.9, seg: 22, finish: "rust", tile: [4, 1], cast: false });
    }
    cyl(stack, 0.63, 0.63, 0.18, 0, 8.65, 0, 0x3c444c, { rough: 0.7, metal: 0.4, seg: 22 });
    holoTag(stack, "Stack — Unit 1 boiler", 0, 2.4, 0.8, { css: "#9fc6e0", w: 0.44 });
    const plume = particles(g, 34, 0x9aa3ab, { size: 0.24, life: 2.6, additive: false, opacity: 0.28 });
    plume.position.set(STACK_X, 8.85, STACK_Z);
    const steam = particles(g, 20, 0xe8edf0, { size: 0.14, life: 0.9, additive: false, opacity: 0.55 });
    steam.position.set(STACK_X, 8.5, STACK_Z);
    // The densest-point marker, just past the stack exit.
    const densest = torus(g, 0.16, 0.012, STACK_X + 0.05, 8.95, STACK_Z + 0.35, 0x9fc6e0,
      { emissive: 0x9fc6e0, ei: 1.8, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    holoTag(g, "Densest point", STACK_X + 0.05, 9.2, STACK_Z + 0.35, { css: "#9fc6e0", w: 0.34 });
    reg(hits, densest, "densest-point");
    // The point downstream of the steam, where a proper read is taken once
    // the steam interruption fires.
    const clearMark = torus(g, 0.14, 0.01, STACK_X + 0.05, 8.7, STACK_Z + 1.15, 0x59c97b,
      { emissive: 0x59c97b, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 24 });
    clearMark.visible = false;
    holoTag(clearMark, "read past the steam", 0, 0.24, 0, { css: "#59c97b", w: 0.42 });
    reg(hits, clearMark, "steam-clear-point");

    // A low wall the observation platform exists to see over.
    box(g, 2.0, 0.55, 0.2, -1.0, 0.14 + 0.275, -1.35, 0x6b6558, { rough: 0.92, finish: "concrete", tile: [3, 1] });

    // ------------------------------------------------------- sun and cloud
    const sun = ball(g, 0.16, 2.6, 3.1, -1.3, 0xffe3a8, { emissive: 0xffe3a8, ei: 2.2, rough: 0.4, cast: false });
    const sunHalo = ball(g, 0.26, 2.6, 3.1, -1.3, 0xffe3a8, { emissive: 0xffe3a8, ei: 0.5, opacity: 0.35, transparent: true, cast: false });
    void sunHalo;
    holoTag(g, "Sun bearing — mark it, do not look at it", 2.6, 2.85, -1.3, { css: "#f2c14b", w: 0.62 });
    const glareTrap = box(g, 0.5, 0.5, 0.5, 2.6, 3.1, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, glareTrap, "look-into-sun");
    const cloud = group(g, 1.4, 3.0, -1.9);
    for (const [dx, dy, s] of [[0, 0, 0.42], [0.3, 0.05, 0.32], [-0.28, 0.02, 0.3]]) {
      ball(cloud, s, dx, dy, 0, 0xdfe4e8, { rough: 0.95, opacity: 0.9, transparent: true, cast: false });
    }
    cloud.visible = false;

    // --------------------------------------------------------- sun compass
    const compass = group(g, 0.55, 0, 1.55, 0.2);
    cyl(compass, 0.018, 0.02, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.45, metal: 0.7, seg: 10 });
    const dial = slab(compass, 0.32, 0.02, 0.32, 0, 0.92, 0, 0x22303c, { radius: 0.02, rough: 0.5 });
    void dial;
    const sector = decal(compass, 0.3, 0.3, 0, 0.931, 0, (cx, w, h) => {
      cx.fillStyle = "#101c24"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#9fc6e0"; cx.lineWidth = Math.max(2, w * 0.02);
      cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.42, 0, Math.PI * 2); cx.stroke();
      // The 140-degree sector at the observer's back, shaded.
      cx.fillStyle = "rgba(159,198,224,0.35)";
      cx.beginPath(); cx.moveTo(w / 2, h / 2);
      cx.arc(w / 2, h / 2, w * 0.42, Math.PI / 2 - 1.22, Math.PI / 2 + 1.22); cx.closePath(); cx.fill();
      cx.fillStyle = "#bfeaf7";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("SUN — 140°", w / 2, h * 0.9);
    }, { px: 320, glow: true, ei: 0.8 });
    sector.rotation.x = -Math.PI / 2;
    const needle = group(compass, 0, 0.95, 0);
    box(needle, 0.26, 0.012, 0.02, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.4 });
    box(needle, 0.26, 0.012, 0.02, 0, 0, 0, 0xeaf6fb, { rough: 0.4, metal: 0.4 }).rotation.y = Math.PI;
    holoTag(compass, "Sun compass", 0, 1.14, 0, { css: "#9fc6e0", w: 0.32 });
    reg(hits, needle, "sun-compass");

    // ------------------------------------------------------- tripod + scope
    const rack = group(g, 1.2, 0, 0.9);
    box(rack, 0.5, 0.06, 0.3, 0, 0.03, 0, 0x2b3138, { rough: 0.7 });
    const rangefinder = instrument(rack, -0.18, 0.09, 0.1, { ry: 0.3, idle: "-- m", color: 0x9fc6e0, w: 0.12, d: 0.17 });
    holoTag(rack, "Rangefinder", -0.18, 0.28, 0.1, { css: "#9fc6e0", w: 0.36 });
    reg(hits, rangefinder, "rangefinder");
    const tripod = group(g, 1.2, 0.03, 0.9, -0.3);
    for (const a of [0, 2.1, 4.2]) {
      const leg = cyl(tripod, 0.014, 0.02, 0.5, Math.sin(a) * 0.18, 0.25, Math.cos(a) * 0.18, 0x3c444c, { rough: 0.5, metal: 0.6, seg: 8 });
      leg.rotation.z = Math.sin(a) * 0.3; leg.rotation.x = Math.cos(a) * 0.3;
    }
    cyl(tripod, 0.03, 0.03, 0.08, 0, 0.52, 0, 0x22262b, { rough: 0.5, metal: 0.5, seg: 12 });
    const scope = cyl(tripod, 0.045, 0.05, 0.28, 0, 0.62, 0.06, 0x22262b, { rough: 0.4, metal: 0.55, seg: 14 });
    scope.rotation.x = -0.5;
    cyl(tripod, 0.05, 0.055, 0.02, 0, 0.62, -0.12, 0x121417, { rough: 0.3, seg: 14 });
    holoTag(tripod, "Spotting scope", 0, 0.9, 0, { css: "#9fc6e0", w: 0.34 });
    reg(hits, tripod, "tripod");

    // The elevated observation platform, with the marked point on it.
    const platform = group(g, 0.55, 0, -1.05);
    const platTop = slab(platform, 0.9, 0.06, 0.6, 0, 0.32, 0, 0xffffff, { radius: 0.01, rough: 0.85 });
    platTop.material = texturedMat(surfaceTexture((cx, w, h) => { cx.fillStyle = "#2a3138"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#454e57"; for (let x = 0; x < w; x += 14) cx.fillRect(x, 0, 5, h); }, { repeat: 2, px: 128 }), { rough: 0.8, metal: 0.2, color: 0xb0b7bd });
    for (const [sx, sz] of [[-0.4, -0.24], [0.4, -0.24], [-0.4, 0.24], [0.4, 0.24]]) {
      cyl(platform, 0.03, 0.03, 0.32, sx, 0.16, sz, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const railPost = cyl(platform, 0.02, 0.02, 0.55, -0.42, 0.62, -0.28, CITY.steel, { rough: 0.5, metal: 0.65, seg: 8 });
    box(platform, 0.86, 0.02, 0.02, 0, 0.86, -0.28, CITY.steel, { rough: 0.5, metal: 0.65 });
    const anchor = ball(platform, 0.02, -0.42, 0.86, -0.28, 0xf2c14b, { rough: 0.4, metal: 0.7 });
    holoTag(platform, "Anchor point — clip in", -0.42, 0.98, -0.28, { css: "#f2c14b", w: 0.44 });
    void railPost; void anchor;
    const obsMark = box(platform, 0.28, 0.01, 0.28, 0.05, 0.35, 0.05, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["obs-mark"] = obsMark;
    const noTieTrap = box(platform, 0.7, 0.5, 0.5, 0, 0.65, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, noTieTrap, "elevated-no-tie");

    // --------------------------------------------------------- smoke chart
    const chartPost = group(g, 1.75, 0, 0.35, -0.25);
    cyl(chartPost, 0.02, 0.022, 1.0, 0, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const chartFace = decal(chartPost, 0.34, 0.28, 0, 1.02, 0.01, (cx, w, h) => {
      cx.fillStyle = "#0e1a22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fc6e0"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("OPACITY COMPARISON", w * 0.06, h * 0.14);
      const shades = ["#e8edf0", "#b7bfc6", "#868f97", "#565e65", "#26292d"];
      shades.forEach((c, i) => { cx.fillStyle = c; cx.fillRect(w * 0.06 + i * w * 0.17, h * 0.3, w * 0.14, h * 0.5); });
      cx.fillStyle = "#bcd6e2"; cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("0   20   40   60   80  %", w * 0.06, h * 0.9);
    }, { px: 384, glow: true, ei: 0.7 });
    holoTag(chartPost, "Comparison chart", 0, 1.32, 0.01, { css: "#9fc6e0", w: 0.36 });
    reg(hits, chartFace.parent, "smoke-chart");

    // ------------------------------------------------------ field-condition props
    const windPost = group(g, -1.5, 0, 1.3);
    cyl(windPost, 0.018, 0.018, 1.4, 0, 0.7, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const sockCloth = cyl(windPost, 0.06, 0.015, 0.5, 0, 1.55, 0.25, 0xe4622a, { rough: 0.7, seg: 14 });
    sockCloth.rotation.z = Math.PI / 2;
    holoTag(windPost, "Wind", 0, 1.85, 0.25, { css: "#9fc6e0", w: 0.22 });
    reg(hits, windPost, "wind-sock");

    const skyPanel = holoPanel(g, 0.46, 0.3, -1.5, 1.55, 0.6, (cx, w, h) => {
      cx.fillStyle = "#0e1a22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fc6e0"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#bcd6e2"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SKY: scattered clouds", w * 0.08, h * 0.5);
    }, { accent: OPR_ACCENT });
    reg(hits, skyPanel, "sky-panel");

    const bgPanel = holoPanel(g, 0.46, 0.3, -1.5, 1.15, 1.0, (cx, w, h) => {
      cx.fillStyle = "#0e1a22"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fc6e0"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#bcd6e2"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("BACKGROUND: open sky", w * 0.08, h * 0.5);
    }, { accent: OPR_ACCENT });
    reg(hits, bgPanel, "background-panel");

    // --------------------------------------------------- flag / notice board
    const flagPost = group(g, 1.75, 0, 1.1);
    cyl(flagPost, 0.015, 0.015, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const flag = box(flagPost, 0.14, 0.1, 0.01, 0.08, 0.62, 0, 0xf0645b, { rough: 0.6, cast: false });
    flag.visible = false;
    holoTag(flagPost, "Flag this reading", 0.08, 0.85, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, flagPost, "flag-reading");

    // ----------------------------------------------------------- paperwork
    const protocol = holoPanel(g, 0.6, 0.42, -0.5, 1.7, -1.55, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#9fc6e0"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#bcd6e2"; cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("EPA METHOD 9 — VISIBLE EMISSIONS", w * 0.06, h * 0.16);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["40 CFR 60 Appendix A", "Sun in 140° sector, at your back", "24 readings, 15-sec intervals, 6 min",
       "Nearest 5% · average vs. permit limit", "Read past any condensed steam"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.34 + i * h * 0.13));
    }, { ry: 0.15, accent: OPR_ACCENT });
    reg(hits, protocol, "method9-card");

    const certPost = group(g, -0.9, 0, 1.75, 0.4);
    cyl(certPost, 0.015, 0.015, 0.6, 0, 0.3, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const certCard = decal(certPost, 0.2, 0.13, 0, 0.66, 0, signFace("OBSERVER CERT — EXP 6 MO", {
      bg: "#f4e9d8", accent: "#1b2a12", fg: "#22262b", scale: 0.5,
    }), { px: 256 });
    holoTag(certPost, "Certification card", 0, 0.85, 0, { css: "#9fc6e0", w: 0.4 });
    reg(hits, certCard, "cert-card");
    const backdateTrap = box(certPost, 0.14, 0.1, 0.1, 0.14, 0.66, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, backdateTrap, "backdate-cert");

    const clipboard = group(g, -0.3, 0, 1.85, -0.4);
    box(clipboard, 0.24, 0.02, 0.32, 0, 0.86, 0, 0x6d5a43, { rough: 0.8 });
    const formFace = decal(clipboard, 0.22, 0.29, 0, 0.871, 0,
      paperFace("METHOD 9 FIELD FORM", ["Block 1: 24 readings ___", "Block 2: 24 readings ___",
        "Wind / sky / background", "Average ____ %  Limit ____ %"], { worn: true }), { px: 256 });
    formFace.rotation.x = -Math.PI / 2;
    holoTag(clipboard, "Field form", 0, 1.05, 0, { css: "#9fc6e0", w: 0.3 });
    reg(hits, formFace.parent, "field-form");
    const pen = cyl(clipboard, 0.008, 0.008, 0.13, 0.09, 0.878, 0.1, 0x22262b, { rough: 0.4, metal: 0.4, seg: 8 });
    holoTag(clipboard, "Sign here", 0.09, 1.0, 0.1, { css: "#9fc6e0", w: 0.24 });
    reg(hits, pen, "sign-pen");

    const calc = instrument(g, -0.3, 0.86, 1.55, { ry: 0.3, idle: "-- % AVG", color: 0x9fc6e0, w: 0.15, d: 0.2 });
    holoTag(calc, "Average vs. permit", 0, 0.16, 0, { css: "#9fc6e0", w: 0.4 });
    reg(hits, calc, "average-calc");

    toolChest(g, 1.95, -0.9, { color: 0x2f6f5a });
    barrierPanel(g, -1.9, 1.1, { color: 0x9fc6e0 });
    cone(g, -1.1, -1.5, { color: 0x9fc6e0 });

    // The plant escort, clear of every control.
    const escort = standingFigure(g, 1.6, -1.5, { ry: -2.6, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(escort, "IUOE / USW plant escort", 0, 1.95, 0, { css: "#9fc6e0", w: 0.56 });

    // ------------------------------------------------------------ live state
    let cloudy = false, steamHigh = false, reading = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.6, 1.5, -0.3),
      onStepComplete(step) {
        if (step.id === "sun-position") needle.rotation.y = Math.PI * 0.62;
        if (step.id === "read-1") reading = true;
        if (step.id === "read-2") { reading = true; steamHigh = false; clearMark.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "cloud-shadow") { cloudy = true; cloud.visible = true; }
        if (it.id === "steam-plume") { steamHigh = true; clearMark.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "cloud-shadow") { cloudy = false; cloud.visible = false; flag.visible = true; }
        if (it.id === "steam-plume") { steamHigh = false; clearMark.visible = false; }
      },
      onHazard() {},
      animate(t, dt, session) {
        plume.visible = true;
        plume.userData.step(dt, new THREE.Vector3(0.4, 0.15, 0.2), 0.35, 0.85, 0.2);
        steam.visible = steamHigh;
        if (steamHigh) steam.userData.step(dt, new THREE.Vector3(0.1, 0.5, 0.05), 0.08, 0.5, 0.35);
        if (cloudy) cloud.position.x = 1.4 - Math.min(1, t % 8) * 0.3;
        densest.material.emissiveIntensity = 1.6 + Math.sin(t * 3) * 0.4;
        if (reading && clearMark.visible) clearMark.material.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.5;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "distance-check") {
          repaint(rangefinder.userData.screen, signFace(`${(gg.t * 60).toFixed(0)} m`, {
            bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.62,
          }));
        }
        if (gg && !gg.committed && session.step?.id === "average") {
          repaint(calc.userData.screen, signFace(`${(Math.round((gg.t * 60) / 5) * 5).toFixed(0)}%`, {
            bg: "#0d1c24", accent: gg.t > 0.15 && gg.t < 0.4 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6,
          }));
        }
        if (session?.track && session.step?.id === "read-1") {
          repaint(chartFace, (cx, w, h) => {
            cx.fillStyle = "#0e1a22"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#9fc6e0"; cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText(`READING: ${(Math.round((session.track.v * 100) / 5) * 5).toFixed(0)}%`, w * 0.06, h * 0.16);
            const shades = ["#e8edf0", "#b7bfc6", "#868f97", "#565e65", "#26292d"];
            shades.forEach((c, i) => { cx.fillStyle = c; cx.fillRect(w * 0.06 + i * w * 0.17, h * 0.3, w * 0.14, h * 0.5); });
          });
        }
      },
    };
  },
};
