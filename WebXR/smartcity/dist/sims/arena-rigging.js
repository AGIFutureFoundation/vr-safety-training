import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, hose, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Arena Rigging VR — Entertainment & Live Events.
// Setting one rigging point in the roof steel of an arena for a touring show's
// load-in. This is not flying anything and it is not operating a hoist — the
// neighbouring stations own those. This is the half hour before either is
// possible: a point called from the floor off the production's rigging plot,
// found in the steel by somebody who cannot see the person calling it, checked
// against the venue's own grid drawing, worked out as arithmetic rather than
// guessed, and hung over a floor that has been cleared and is being watched.
//
// The bridle is the heart of it. Two legs at an angle do not halve a load;
// each leg carries the vertical share divided by the cosine of its angle from
// vertical, and each beam gets dragged sideways by the horizontal component.
// Flatten the legs and both climb away much faster than the eye expects. So
// the numbers come off the plot before anybody touches steel.
//
// One staging compromise, stated plainly: the up-rigger's beam and the floor
// underneath it are both in one view. On a real load-in they are not — that is
// the whole difficulty of the job — but a learner has to be able to see what
// the other half of the pair is doing in order to learn why the calls matter.

const ARIG_ACCENT = 0x22d3ee;

export const SIM_ARENA_RIGGING = {
  id: "arena-rigging",
  index: "69",
  domain: "Live events",
  trade: "Arena rigger — up-rigger / down-rigger",
  category: "Entertainment & Live Events",
  indoor: "theatre",
  weather: "overcast",
  certification: "IATSE stage locals — ETCP Certified Rigger (Arena); the ESTA E1 series for entertainment rigging practice; OSHA 29 CFR 1926 Subpart M fall protection; the venue's rigging grid drawing and the production's rigging plot as the governing documents",
  name: "Arena Rigging",
  title: simTitle("Arena Rigging"),
  tagline: "Setting a point in the roof steel: the point called and confirmed both ways, the bridle worked out on the plot, the beam checked against the grid drawing, the floor cleared and watched, tied off to structure the whole time",
  accent: ARIG_ACCENT,
  accentCss: "#22d3ee",
  parSeconds: 290,
  footprint: 2.2,
  badge: { id: "point-set", name: "Point Set", note: "One point found, calculated, hung and tagged — over a floor nobody was standing on" },

  game: system({
    name: "High Steel Authority",
    currency: "POINT",
    ranks: ["Ground Rigger", "Down-Rigger", "Up-Rigger", "Head Rigger", "High Steel Certified"],
    badges: [
      { id: "called-and-confirmed", name: "Called And Confirmed", note: "Point called off the plot, counted in the steel and confirmed back before anything was hung", test: AWARD.stepClean("call") },
      { id: "nothing-underneath", name: "Nothing Underneath", note: "Never dropped anything and never worked over an open floor", test: AWARD.safe },
      { id: "arithmetic-not-feeling", name: "Arithmetic, Not Feeling", note: "Leg tension and beam side pull both read inside the plot's figures", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-point", name: "Clean Point", note: "The whole point set with no corrections", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every line held for its full count", test: AWARD.unbroken },
      { id: "ahead-of-the-call", name: "Ahead Of The Call", note: "Point set and tagged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hung-anchor": "You clipped your lanyard to the point you are hanging. An anchorage is structure — a beam, a purlin, a column — and nothing else. A sling, a shackle, a motor chain or a point somebody else hung is a load path that is there because somebody put it there this morning, and it can come out the same way.",
    "free-transition": "You unhooked both legs to get past the purlin. Continuous attachment means one leg is always on something before the other comes off; the transition is the only moment in the whole shift where a rigger is genuinely free, and it is the moment they fall in.",
    "loose-tool": "You took an untethered wrench out onto the beam. Anything carried into the steel is tethered or it is not carried, because the floor below fills with crew, forklifts and eventually an audience, and a dropped shackle from roof height arrives with no warning at all.",
    "last-show-mark": "You hung off the paint mark the last show left on the steel. That mark records where somebody else's point went, with somebody else's load, possibly before the venue's drawing was revised. What this beam will take comes off the venue's rigging grid drawing, and nothing else.",
    "open-floor": "You called for the drop line over a floor that was still open. Nothing comes down — not a rope, not a tape, not a shackle — until the area under the point is taped off and somebody on the ground is watching it and has said so.",
  },

  lateNotes: {
    "steel-bag": "Steel goes out to the beam after the point is confirmed and the bridle has been worked out on the plot.",
    "drop-line": "The drop line comes down on the floor's call, once the area under the point is taped off and watched.",
  },

  steps: [
    {
      id: "plot", kind: "select", target: "rig-plot",
      title: "Take the production's rigging plot",
      cue: "Find your point on the plot: its number, its bay, what hangs on it and how it is made.",
      why: "Every point on a load-in exists on one document, drawn by the production's rigging designer. The point number, the bay it lands in, the load it carries and whether it is a dead-hang or a bridle are all decided there, before anybody leaves the floor.",
    },
    {
      id: "grid", kind: "select", target: "grid-drawing",
      title: "Read the venue's rigging grid drawing",
      cue: "Bay numbering, the beams in your bay, what a point and a beam are allowed to carry here, and the no-hang zones.",
      why: "The plot says what the show wants. The grid drawing says what this building will give it — per point and per beam, from the engineer who signed the drawing. When the two disagree, the building wins, and the point moves.",
    },
    {
      id: "dress", kind: "sequence", anyOrder: true,
      targets: ["harness-check", "tool-tether", "comms-check"],
      itemNames: { "harness-check": "harness and twin-leg lanyard", "tool-tether": "tools tethered", "comms-check": "headset to the floor" },
      title: "Dress for the steel",
      cue: "Harness inspected with both lanyard legs on it, every tool on a tether, and comms open to the floor.",
      why: "Three things go up with you and all three are somebody else's safety as much as yours: a harness with two legs so you are never unattached, tethers so nothing you carry can arrive on the floor, and a headset so the person who cannot see you can still talk to you.",
    },
    {
      id: "anchor", kind: "select", target: "beam-anchor",
      title: "Tie off to structure before you go out",
      cue: "Anchor strop around the purlin, both lanyard legs working, before a boot leaves the catwalk.",
      why: "Fall protection in the steel is continuous, not occasional, and the anchorage is building structure. A rigger moving along a beam is attached to something at all times — that is the rule the whole shift is built on, and there is no part of the job that is worth the exception.",
    },
    {
      id: "call", kind: "sequence",
      targets: ["point-call", "bay-count", "plumb-drop"],
      itemNames: { "point-call": "take the call off the floor", "bay-count": "count the bays to the tag", "plumb-drop": "plumb it and get it confirmed" },
      title: "Take the point, find it, confirm it both ways",
      cue: "The floor calls the point off the plot; you count bays to the tagged beam; you plumb it down and the floor confirms the mark.",
      why: "Up-rigger and down-rigger are one job done by two people who cannot see each other. The point is called from the floor, found in the steel, and confirmed in both directions before anything is hung — because a point in the wrong bay is a point that loads a beam nobody checked.",
    },
    {
      id: "clear", kind: "sequence",
      targets: ["drop-zone-tape", "floor-spotter", "clear-call"],
      itemNames: { "drop-zone-tape": "tape the drop zone", "floor-spotter": "spotter on the zone", "clear-call": "clear confirmed up" },
      title: "Clear the floor under the point and keep it clear",
      cue: "Tape goes round first, then somebody owns the zone, then the clear comes up to you — in that order.",
      why: "Tape alone is a suggestion; a load-in floor walks through tape all day. The zone is taped, then given to a person who stands there and keeps it empty, and only then is the clear called up. Cleared and kept clear are two different jobs and the second one is the one that lasts.",
    },
    {
      id: "legs", kind: "gauge", target: "bridle-calc",
      title: "Work out the tension in each bridle leg",
      cue: "Take the point load and the plot's leg angles, and commit the tension one leg will actually see.",
      why: "A bridle is arithmetic, not a feeling. Each leg carries its share of the vertical load divided by the cosine of the leg's angle from vertical, so two legs never carry half each — they carry more, and the flatter you spread them the more it becomes. This is the number the sling, the shackle and the beam are all chosen against.",
      gauge: { label: "LEG TENSION", speed: 0.7, green: [0.5, 0.6], readout: (t) => `${Math.round(t * 1600)} kg`, missNote: "That is not what the plot's geometry gives. Work it again from the load and the leg angles — an underestimate here is a sling chosen one size too small." },
    },
    {
      id: "beams", kind: "gauge", target: "beam-load",
      title: "Check what the bridle does to each beam",
      cue: "Commit the sideways pull one beam takes, and set it against the grid drawing's figure for that beam.",
      why: "A bridle leg does not just hang off a beam, it drags it towards the other one. The flatter the legs, the larger that horizontal component gets, and a beam rated to carry weight downwards is not automatically rated to be pulled sideways. The grid drawing gives both figures and both have to be satisfied.",
      gauge: { label: "SIDE PULL", speed: 0.7, green: [0.58, 0.67], readout: (t) => `${Math.round(t * 1200)} kg`, missNote: "Outside what the grid drawing allows this beam sideways. Bring the legs in, or take the point to a bay the drawing says can hold it." },
    },
    {
      id: "carry", kind: "drag", target: "steel-bag",
      title: "Take the steel out to the beam",
      cue: "Bag over your shoulder, out along the beam on the strop, and land it at the marked seat.",
      why: "The steel goes out once, to the beam the plot named, on a rigger who is attached the whole way. Every extra trip along a beam is another transition, and transitions are where riggers come off.",
      drag: { to: "beam-seat", radius: 0.55, missNote: "That is not the seat on the beam the point was called for. Steel does not get hung near the point, it gets hung on it." },
    },
    {
      id: "basket", kind: "turn", target: "shackle-pin",
      title: "Basket the beam and seat the shackle",
      cue: "Sling in a basket round the beam, both eyes in the shackle, and run the pin fully home.",
      why: "A basket round the beam puts the load into the section rather than into an edge, and the shackle pin is either all the way home or it is not in. A pin two turns out looks exactly like a pin that is in, and it walks out over a show's worth of movement.",
      turn: { turns: 1.5, axis: "y", label: "SHACKLE PIN", readout: (t) => `${Math.round(t * 100)}% home` },
    },
    {
      id: "drop", kind: "track", target: "drop-line", seconds: 6,
      title: "Lower the drop line on the call",
      cue: "On the floor's call and not before — hand over hand, steady, inside the rate the spotter can track.",
      why: "The drop line is the first thing that goes from the steel to the floor and it sets the habit for everything after it. It goes on a call, into a zone somebody is watching, at a rate a person on the ground can follow with their eyes. A rope run out fast is indistinguishable from a rope dropped.",
      track: { start: 0.1, green: [0.38, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "LOWER", readout: (v) => `${(v * 1.6).toFixed(1)} m/s` },
      holdBreakNote: "The line stopped halfway down. Take it back up on the call or run it out steady — a rope left hanging mid-air over a working floor is nobody's.",
    },
    {
      id: "haul", kind: "hold", target: "haul-line", seconds: 5,
      title: "Haul the point up to the steel",
      cue: "The floor ties on and calls; haul steady and hold until the head is at the beam.",
      why: "What comes up is heavier than what went down and it swings. A steady haul keeps it under the point instead of pendulum-ing across the bay into the other crew's steel, and the hold is what stops it being dropped back through the zone halfway up.",
      holdBreakNote: "You let go of the haul line with the load in the air. It goes back down through the zone you spent ten minutes clearing.",
    },
    {
      id: "tag", kind: "select", target: "point-tag",
      title: "Tag the point and confirm it to the floor",
      cue: "Point number on the tag at the head, and read the number and the bay back down.",
      why: "The tag is how the next person — the motor crew, the head rigger, the venue at strike — knows which point this is without going back to the plot. The read-back closes the loop the call opened: the floor hears its own point number come back from the steel.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["sharp-edge", "spare-shackle"],
      itemNames: { "sharp-edge": "sling bearing on a bare edge", "spare-shackle": "loose shackle left in the steel" },
      itemNotes: {
        "sharp-edge": "The basket is bearing directly on the bottom flange edge with nothing between them. Over a show's worth of movement that edge works its way into the sling — a softener goes in before anybody leaves the beam.",
        "spare-shackle": "A spare shackle is sitting loose on the bottom flange of the far beam. It is not tethered and it is not in a bag: it is a dropped object waiting for somebody to knock the beam.",
      },
      title: "Walk the beam before you come out of the steel",
      cue: "Look over the whole point and the steel around it, and click anything that does not come out with you or should not stay.",
      why: "The last thing an up-rigger does is leave the bay in a state they would be happy to stand underneath. Everything that gets caught up there gets caught by a rigger looking, not by an inspection later — by then the floor has a show on it.",
    },
  ],

  interrupts: [
    {
      id: "floor-breach",
      kind: "Drop zone breached",
      after: "carry", delay: 3, seconds: 12,
      alert: "A forklift and two hands have come through the tape and stopped directly under your point, looking at their own paperwork.",
      cue: "There are people under you.",
      target: "all-stop",
      why: "Everything an up-rigger does assumes the floor below is empty. The moment it is not, the job stops — not slows, stops — because there is no version of working over somebody's head that is made safe by being careful. All-stop first, then the zone gets re-established and the spotter gets their authority back.",
      missNote: "You carried on working with three people and a machine under the point. Nothing came off the beam this time, which is the only reason it ended as a story rather than a fatality — the entire protection those people had was that you did not fumble a shackle in the next forty seconds.",
      wrongNote: "It is the all-stop. Anything else you do next is work carried out over people's heads, and there is no safe way to do that.",
    },
    {
      id: "beam-shared",
      kind: "Second point on your beam",
      after: "basket", delay: 3, seconds: 12,
      alert: "The other crew has just called a second point into the next bay along — onto the same beam you are hanging off.",
      cue: "Your beam is about to carry somebody else's point too.",
      target: "grid-drawing",
      why: "Capacity is not only per point, it is per beam. Two points that are each comfortably inside the per-point figure can put the beam over its total, and neither crew sees it because each is only looking at their own number. The grid drawing is the only document that adds them up, so it is the one that gets opened before the second point goes on.",
      missNote: "Both points went onto the same beam with nobody totalling them. The beam may well have been fine — but the way you found out was by hanging them and watching, and the deflection that tells you it was not fine arrives with two shows' worth of motors already in the air underneath it.",
      wrongNote: "It is the venue's rigging grid drawing. The question is what the beam is allowed to carry in total, and only that drawing answers it.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, ARIG_ACCENT);

    const STEEL = 0x5b6570;      // painted roof steel
    const BEAM_A_Z = -0.45;      // the beam the point lands on
    const BEAM_B_Z = -2.15;      // the second beam the bridle reaches to
    const BEAM_Y = 3.8;          // top of section
    const FLANGE_Y = 3.58;       // underside of the bottom flange

    // ------------------------------------------------------------ arena floor
    // A patch of deck under the point, so the floor reads as a floor and the
    // drop zone reads as a marked-out piece of it.
    box(g, 9.0, 0.03, 7.0, 0, 0.015, -0.8, 0x2a2d33,
      { rough: 0.95, finish: "concrete", tile: [8, 6], cast: false });
    for (let i = -3; i <= 3; i++) {
      box(g, 0.05, 0.006, 6.6, i * 1.4, 0.034, -0.8, 0x3a3f47, { rough: 0.9, cast: false });
    }

    // ------------------------------------------------------------- roof steel
    // Two wide-flange beams across the bay, purlins between them, and the bay
    // tags that are the only way anybody knows which bay they are standing in.
    const steel = group(g, 0, 0, 0);
    const beams = [];
    for (const bz of [BEAM_A_Z, BEAM_B_Z]) {
      const b = group(steel, 0, 0, bz);
      const web = box(b, 8.4, 0.44, 0.05, 0, BEAM_Y - 0.22, 0, STEEL,
        { rough: 0.7, metal: 0.45, finish: "painted", tile: [8, 1] });
      box(b, 8.4, 0.05, 0.34, 0, BEAM_Y - 0.025, 0, STEEL, { rough: 0.7, metal: 0.45, finish: "painted", tile: [8, 1] });
      box(b, 8.4, 0.05, 0.34, 0, FLANGE_Y, 0, STEEL, { rough: 0.7, metal: 0.45, finish: "painted", tile: [8, 1] });
      // Stiffeners, so the section reads as a real rolled beam rather than a bar.
      for (let i = -3; i <= 3; i++) {
        box(b, 0.03, 0.4, 0.3, i * 1.3, BEAM_Y - 0.22, 0, 0x565f69, { rough: 0.7, metal: 0.45, cast: false });
      }
      beams.push({ g: b, web });
    }
    for (const px of [-2.6, -0.9, 0.9, 2.6]) {
      box(steel, 0.16, 0.18, 2.1, px, BEAM_Y + 0.14, (BEAM_A_Z + BEAM_B_Z) / 2, 0x565f69,
        { rough: 0.72, metal: 0.4, finish: "painted", tile: [1, 2], cast: false });
    }
    // Columns the bay actually sits on, out at the edges as scenery.
    for (const sx of [-1, 1]) {
      cyl(steel, 0.16, 0.2, BEAM_Y, sx * 3.85, BEAM_Y / 2, BEAM_A_Z, 0x3f464e,
        { rough: 0.8, metal: 0.4, seg: 12, finish: "painted", tile: [1, 4], cast: false });
    }
    holoTag(steel, "North hall roof steel", -2.3, BEAM_Y + 0.55, BEAM_A_Z, { css: "#22d3ee", w: 0.46 });

    // Bay tags stencilled on the beam — G6, G7, G8 — counted from the datum.
    const bayTagFace = (label, live) => (cx, w, h) => {
      cx.fillStyle = live ? "#123c46" : "#20242a"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = live ? "#22d3ee" : "#6b747d";
      cx.lineWidth = Math.max(2, h * 0.07); cx.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);
      cx.fillStyle = live ? "#bff3fb" : "#9aa4ad";
      cx.font = `700 ${Math.round(h * 0.52)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText(label, w / 2, h * 0.54);
    };
    for (const [label, tx] of [["G6", -1.9], ["G8", 2.7]]) {
      decal(steel, 0.3, 0.2, tx, FLANGE_Y - 0.02, BEAM_A_Z + 0.18, bayTagFace(label, false), { px: 128, rough: 0.8 });
    }
    const bayTag = decal(steel, 0.34, 0.24, 0.9, FLANGE_Y - 0.03, BEAM_A_Z + 0.18, bayTagFace("G7", true), { px: 160, glow: true, ei: 0.5 });
    holoTag(steel, "Bay tag — count from the datum", 0.9, FLANGE_Y - 0.26, BEAM_A_Z + 0.2, { css: "#22d3ee", w: 0.5 });
    reg(hits, bayTag, "bay-count");

    // The previous show's paint mark, one bay over. Tempting and worthless.
    decal(steel, 0.22, 0.1, 2.1, FLANGE_Y - 0.026, BEAM_A_Z + 0.18, signFace("1.4T", { bg: "#2b2118", accent: "#d98a3a", fg: "#f0d0a0", scale: 0.55 }), { px: 96 });
    const lastShow = box(steel, 0.4, 0.3, 0.4, 2.1, FLANGE_Y - 0.1, BEAM_A_Z + 0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(steel, "Last show hung here?", 2.1, FLANGE_Y - 0.4, BEAM_A_Z + 0.22, { css: "#f0645b", w: 0.44 });
    reg(hits, lastShow, "last-show-mark");

    // -------------------------------------------------------- the point itself
    // The bridle: two legs up to two different beams, meeting at a head that
    // hangs below. The apex is where the motor will eventually go.
    const APEX = { x: -0.2, y: 2.78, z: -1.35 };
    const LEG_A = { x: -0.9, y: FLANGE_Y - 0.03, z: BEAM_A_Z };
    const LEG_B = { x: 0.5, y: FLANGE_Y - 0.03, z: BEAM_B_Z };
    const point = group(g, 0, 0, 0);
    const legA = hose(point, [[LEG_A.x, LEG_A.y, LEG_A.z], [(LEG_A.x + APEX.x) / 2, (LEG_A.y + APEX.y) / 2, (LEG_A.z + APEX.z) / 2], [APEX.x, APEX.y, APEX.z]],
      0.028, 0x8d6b3a, { steps: 10, rough: 0.85 });
    const legB = hose(point, [[LEG_B.x, LEG_B.y, LEG_B.z], [(LEG_B.x + APEX.x) / 2, (LEG_B.y + APEX.y) / 2, (LEG_B.z + APEX.z) / 2], [APEX.x, APEX.y, APEX.z]],
      0.028, 0x8d6b3a, { steps: 10, rough: 0.85 });
    const apexRing = torus(point, 0.085, 0.022, APEX.x, APEX.y, APEX.z, 0xb6c2cc, { rough: 0.4, metal: 0.7, seg: 8, seg2: 18 });
    apexRing.rotation.x = Math.PI / 2;
    const head = box(point, 0.16, 0.2, 0.16, APEX.x, APEX.y - 0.18, APEX.z, 0x2b3138, { rough: 0.6, metal: 0.35 });
    holoTag(point, "Point 14 — bridled head", APEX.x, APEX.y - 0.45, APEX.z, { css: "#22d3ee", w: 0.44 });

    // The seat on the beam the steel is carried to, and the shackle that closes it.
    const beamSeat = box(g, 0.34, 0.3, 0.34, LEG_A.x, FLANGE_Y + 0.06, BEAM_A_Z, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["beam-seat"] = beamSeat;
    holoTag(g, "Seat — point 14", LEG_A.x, FLANGE_Y + 0.34, BEAM_A_Z, { css: "#22d3ee", w: 0.32 });
    const shackle = group(g, LEG_A.x, FLANGE_Y - 0.12, BEAM_A_Z);
    torus(shackle, 0.055, 0.016, 0, 0, 0, 0xc2ccd4, { rough: 0.35, metal: 0.8, seg: 8, seg2: 16 });
    const shacklePin = cyl(shackle, 0.016, 0.016, 0.14, 0, 0.05, 0, 0xe0b23a, { rough: 0.4, metal: 0.8, seg: 10 });
    shacklePin.rotation.z = Math.PI / 2;
    holoTag(g, "Shackle — run the pin home", LEG_A.x - 0.1, FLANGE_Y - 0.36, BEAM_A_Z + 0.1, { css: "#e0b23a", w: 0.5 });
    reg(hits, shackle, "shackle-pin");

    // The tag that says which point this is, once it is set.
    const pointTag = decal(point, 0.16, 0.1, APEX.x + 0.16, APEX.y - 0.16, APEX.z + 0.09,
      signFace("PT 14", { bg: "#0e2b31", accent: "#22d3ee", fg: "#bff3fb", scale: 0.55 }), { px: 128, glow: true, ei: 0.7 });
    holoTag(point, "Point tag", APEX.x + 0.4, APEX.y - 0.05, APEX.z + 0.09, { css: "#22d3ee", w: 0.24 });
    reg(hits, pointTag, "point-tag");

    // The anchor strop — structure, and the only legal thing to clip to.
    const anchor = group(g, -1.9, 0, 0);
    torus(anchor, 0.13, 0.024, 0, BEAM_Y + 0.14, (BEAM_A_Z + BEAM_B_Z) / 2, 0x59c97b, { rough: 0.7, seg: 8, seg2: 18 });
    cyl(anchor, 0.012, 0.012, 0.32, 0, BEAM_Y - 0.06, (BEAM_A_Z + BEAM_B_Z) / 2, 0x59c97b, { rough: 0.7, seg: 8, cast: false });
    holoTag(anchor, "Anchor strop — purlin", 0, BEAM_Y + 0.48, (BEAM_A_Z + BEAM_B_Z) / 2, { css: "#59c97b", w: 0.44 });
    reg(hits, anchor, "beam-anchor");

    // Two decoys up in the steel: the point as an anchorage, and the free
    // transition round the purlin.
    const hungAnchor = box(g, 0.4, 0.5, 0.4, APEX.x - 0.4, APEX.y + 0.2, APEX.z - 0.35, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Clip off to the point?", APEX.x - 0.55, APEX.y + 0.52, APEX.z - 0.35, { css: "#f0645b", w: 0.44 });
    reg(hits, hungAnchor, "hung-anchor");
    const freeMove = box(g, 0.44, 0.5, 0.44, 2.6, BEAM_Y - 0.1, (BEAM_A_Z + BEAM_B_Z) / 2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Unhook to get past?", 2.6, BEAM_Y + 0.28, (BEAM_A_Z + BEAM_B_Z) / 2, { css: "#f0645b", w: 0.44 });
    reg(hits, freeMove, "free-transition");

    // The other crew's point, which is not there until they call it.
    const otherPoint = group(g, 3.9, 0.2, 2.4);
    cyl(otherPoint, 0.03, 0.03, 0.5, 0, 0, 0, 0x8d6b3a, { rough: 0.85, seg: 8 });
    torus(otherPoint, 0.07, 0.02, 0, 0.28, 0, 0xb6c2cc, { rough: 0.4, metal: 0.7, seg: 8, seg2: 14 });
    holoTag(otherPoint, "Spare steel", 0, 0.5, 0, { css: "#6b747d", w: 0.24 });
    const otherHome = otherPoint.position.clone();

    // ------------------------------------------------------- lines to the floor
    const dropLine = group(g, 0.8, 0, -0.78);
    const dropRope = hose(dropLine, [[0, FLANGE_Y - 0.06, 0], [0.04, 2.4, 0.06], [0.02, 1.0, 0.02]],
      0.016, 0xd9c48a, { steps: 10, rough: 0.9, cast: false });
    ball(dropLine, 0.045, 0.02, 0.95, 0.02, 0x2b3138, { rough: 0.7, seg: 10 });
    holoTag(dropLine, "Drop line", 0.26, 1.45, 0.05, { css: "#d9c48a", w: 0.26 });
    reg(hits, dropLine, "drop-line");

    const haulLine = group(g, 1.6, 0, -1.8);
    hose(haulLine, [[0, FLANGE_Y - 0.06, 0], [-0.05, 2.2, 0.08], [0.02, 0.9, 0.04]],
      0.014, 0xc4d1a0, { steps: 10, rough: 0.9, cast: false });
    box(haulLine, 0.1, 0.12, 0.1, 0.02, 0.84, 0.04, 0x4a5560, { rough: 0.7 });
    holoTag(haulLine, "Haul line", 0.28, 1.3, 0.05, { css: "#c4d1a0", w: 0.26 });
    reg(hits, haulLine, "haul-line");

    // The plumb, dropped from the point so the floor can confirm the mark.
    const plumb = group(g, APEX.x, 0, APEX.z);
    cyl(plumb, 0.004, 0.004, 2.5, 0, 1.35, 0, 0xbfeaf7, { rough: 0.4, seg: 6, cast: false });
    const bob = cyl(plumb, 0.0, 0.032, 0.14, 0, 0.13, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 12 });
    bob.rotation.x = Math.PI;
    const floorMark = decal(plumb, 0.3, 0.3, 0, 0.038, 0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "#22d3ee"; cx.lineWidth = Math.max(3, h * 0.05);
      cx.beginPath(); cx.arc(w / 2, h / 2, h * 0.34, 0, Math.PI * 2); cx.stroke();
      cx.beginPath(); cx.moveTo(w * 0.1, h / 2); cx.lineTo(w * 0.9, h / 2);
      cx.moveTo(w / 2, h * 0.1); cx.lineTo(w / 2, h * 0.9); cx.stroke();
      cx.fillStyle = "#bff3fb";
      cx.font = `700 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.fillText("PT 14", w / 2, h * 0.94);
    }, { px: 192, glow: true, ei: 0.7, transparent: true });
    floorMark.rotation.x = -Math.PI / 2;
    holoTag(plumb, "Plumb to the floor mark", 0.42, 0.62, 0.1, { css: "#22d3ee", w: 0.46 });
    reg(hits, plumb, "plumb-drop");

    // ------------------------------------------------------------- the drop zone
    const zone = group(g, APEX.x, 0, APEX.z);
    const zoneTape = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      cone(zone, Math.sin(a) * 1.05, Math.cos(a) * 1.05, { color: 0xf2a23b });
    }
    for (let i = 0; i < 4; i++) {
      const a0 = (i / 4) * Math.PI * 2 + Math.PI / 4, a1 = ((i + 1) / 4) * Math.PI * 2 + Math.PI / 4;
      const x0 = Math.sin(a0) * 1.05, z0 = Math.cos(a0) * 1.05;
      const x1 = Math.sin(a1) * 1.05, z1 = Math.cos(a1) * 1.05;
      const bar = box(zone, Math.hypot(x1 - x0, z1 - z0), 0.03, 0.02, (x0 + x1) / 2, 0.62, (z0 + z1) / 2,
        0xf2a23b, { rough: 0.6, cast: false });
      bar.rotation.y = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2;
      zoneTape.push(bar);
    }
    holoTag(zone, "Drop zone — point 14", 0, 1.22, 0, { css: "#f2a23b", w: 0.46 });
    reg(hits, zone, "drop-zone-tape");
    const openFloor = box(g, 0.6, 1.0, 0.6, 1.6, 0.55, -2.75, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Send it down now?", 1.6, 1.2, -2.75, { css: "#f0645b", w: 0.4 });
    reg(hits, openFloor, "open-floor");

    // ---------------------------------------------------------------- the crew
    // The up-rigger is out on the beam, where they are supposed to be.
    const steelCrew = group(g, 0, FLANGE_Y + 0.08, 0);
    const upRigger = standingFigure(steelCrew, 2.55, BEAM_A_Z, { atStation: true, ry: 3.3, cloth: 0x1f2a33, vest: 0x22d3ee, helmet: 0xf2f2f2 });
    holoTag(steelCrew, "Up-rigger — the other half", 2.55, 2.05, BEAM_A_Z, { css: "#22d3ee", w: 0.5 });
    const downRigger = standingFigure(g, -2.55, -2.25, { ry: 0.7, cloth: 0x2b3138, vest: 0xf2a23b, helmet: 0xf2f2f2 });
    holoTag(g, "Down-rigger on the plot", -2.55, 2.05, -2.25, { css: "#f2a23b", w: 0.46 });
    const spotter = standingFigure(g, 2.35, -2.7, { ry: 0.2, cloth: 0x2b3138, vest: 0x59c97b, helmet: 0xf2f2f2 });
    holoTag(g, "Spotter — owns the zone", 2.35, 2.05, -2.7, { css: "#59c97b", w: 0.46 });
    reg(hits, spotter, "floor-spotter");
    const intruder = standingFigure(g, 3.45, 1.35, { ry: 3.4, cloth: 0x35404a, vest: 0xd8d24a, helmet: 0xd8d24a });
    holoTag(g, "House crew", 3.45, 2.05, 1.35, { css: "#d8d24a", w: 0.3 });
    const intruderHome = intruder.position.clone();

    // ------------------------------------------------------ paperwork and kit
    const plotPanel = holoPanel(g, 0.62, 0.44, -1.95, 1.5, 1.15, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,24,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#22d3ee"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("RIGGING PLOT · POINT SCHEDULE · REV C", w * 0.06, h * 0.13);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("POINT 14 — BAY G7, BEAMS 12 & 13", w * 0.06, h * 0.29);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      [["Type", "2-leg bridle"], ["Point load", "900 kg"],
       ["Included angle at head", "118°"], ["Tension in each leg", "874 kg"],
       ["Down at each beam", "450 kg"], ["Side pull at each beam", "749 kg"]]
        .forEach(([k, v], i) => {
          const y = h * 0.43 + i * h * 0.088;
          cx.fillStyle = "#8fb3c4"; cx.fillText(k, w * 0.06, y);
          cx.fillStyle = "#eaf6fb"; cx.textAlign = "right"; cx.fillText(v, w * 0.94, y); cx.textAlign = "left";
        });
    }, { ry: 0.5, accent: ARIG_ACCENT });
    reg(hits, plotPanel, "rig-plot");

    const gridPanel = holoPanel(g, 0.62, 0.44, 2.0, 1.5, 1.15, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,24,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("VENUE RIGGING GRID DRAWING · REV 7", w * 0.06, h * 0.13);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("NORTH HALL — BAYS A1 TO K9", w * 0.06, h * 0.29);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.078)}px Arial, sans-serif`;
      [["Any single point", "1500 kg"], ["Any one beam, total hung", "2400 kg"],
       ["Side pull per beam", "900 kg"], ["No-hang bays", "C4 – C6"],
       ["Datum for bay count", "column line G"], ["Marks on the steel", "not a record"]]
        .forEach(([k, v], i) => {
          const y = h * 0.43 + i * h * 0.088;
          cx.fillStyle = "#8fb3c4"; cx.fillText(k, w * 0.06, y);
          cx.fillStyle = "#eaf6fb"; cx.textAlign = "right"; cx.fillText(v, w * 0.94, y); cx.textAlign = "left";
        });
    }, { ry: -0.5, accent: 0x59c97b });
    reg(hits, gridPanel, "grid-drawing");

    // The call card: what the floor has just said, in the up-rigger's overlay.
    const callCard = holoPanel(g, 0.4, 0.2, -0.75, 1.75, 0.35, (cx, w, h) => {
      cx.fillStyle = "rgba(6,18,24,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2a23b"; cx.fillRect(0, 0, w, 4);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FLOOR CALLS", w * 0.07, h * 0.2);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.26)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("POINT 14 — BAY G7", w * 0.07, h * 0.52);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.15)}px Arial, sans-serif`;
      cx.fillText("three bays east of the datum", w * 0.07, h * 0.82);
    }, { ry: 0.25, accent: 0xf2a23b });
    reg(hits, callCard, "point-call");

    // The rigger's kit, on a rack where it is picked up.
    const rack = group(g, -2.75, 0, 0.45, 0.45);
    box(rack, 0.07, 1.9, 0.07, 0, 0.95, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    box(rack, 0.9, 0.06, 0.06, 0, 1.85, 0, 0x8b929a, { rough: 0.5, metal: 0.5, cast: false });
    const harness = group(rack, -0.26, 1.3, 0.02);
    box(harness, 0.3, 0.36, 0.07, 0, 0, 0, 0x2f6f8c, { rough: 0.7, finish: "rubber" });
    for (const sx of [-1, 1]) cyl(harness, 0.012, 0.012, 0.5, sx * 0.1, -0.4, 0.02, 0xf2c14b, { rough: 0.8, seg: 6 });
    torus(harness, 0.035, 0.01, 0, 0.1, 0.05, 0xc2ccd4, { rough: 0.35, metal: 0.8, seg: 6, seg2: 14 });
    holoTag(rack, "Harness + twin lanyard", -0.26, 1.66, 0.04, { css: "#22d3ee", w: 0.48 });
    reg(hits, harness, "harness-check");
    const tether = group(rack, 0.3, 1.1, 0.02);
    box(tether, 0.05, 0.2, 0.05, 0, 0, 0, 0xb6c2cc, { rough: 0.4, metal: 0.7 });
    cyl(tether, 0.008, 0.008, 0.34, 0.03, -0.24, 0.02, 0xd8232a, { rough: 0.8, seg: 6 });
    holoTag(rack, "Tethered wrench", 0.3, 1.42, 0.04, { css: "#22d3ee", w: 0.34 });
    reg(hits, tether, "tool-tether");
    const headset = group(rack, 0.04, 1.72, 0.03);
    torus(headset, 0.07, 0.014, 0, 0, 0, 0x2b3138, { rough: 0.6, seg: 6, seg2: 16 });
    ball(headset, 0.032, -0.07, -0.02, 0, 0x2b3138, { rough: 0.6, seg: 10 });
    holoTag(rack, "Headset to the floor", 0.04, 1.96, 0.04, { css: "#22d3ee", w: 0.42 });
    reg(hits, headset, "comms-check");
    // The wrench nobody tethered, left on the deck by the rack.
    const looseWrench = box(g, 0.22, 0.04, 0.05, -1.85, 0.06, 0.95, 0xb6c2cc, { rough: 0.45, metal: 0.7 });
    holoTag(g, "Take it up loose?", -1.85, 0.42, 0.95, { css: "#f0645b", w: 0.38 });
    reg(hits, looseWrench, "loose-tool");

    // The steel that goes out to the beam.
    const steelBag = group(g, 1.4, 0, 0.15);
    box(steelBag, 0.34, 0.3, 0.26, 0, 0.16, 0, 0x2f3740, { rough: 0.85, finish: "rubber" });
    for (const dx of [-0.08, 0.06]) torus(steelBag, 0.05, 0.015, dx, 0.33, 0.02, 0xc2ccd4, { rough: 0.4, metal: 0.75, seg: 6, seg2: 14 });
    cyl(steelBag, 0.02, 0.02, 0.3, 0.1, 0.34, -0.04, 0x8d6b3a, { rough: 0.85, seg: 8 });
    holoTag(steelBag, "Steel bag — sling and shackles", 0, 0.62, 0, { css: "#22d3ee", w: 0.54 });
    reg(hits, steelBag, "steel-bag");

    // The comms post: the clear confirmation and the all-stop, side by side.
    const post = group(g, 1.55, 0, 1.3, -0.4);
    cyl(post, 0.04, 0.05, 1.2, 0, 0.6, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    box(post, 0.26, 0.2, 0.1, 0, 1.28, 0, 0x2b3138, { rough: 0.6, finish: "painted", tile: [1, 1] });
    const clearLamp = ball(post, 0.045, -0.07, 1.28, 0.07, 0x59c97b, { emissive: 0x59c97b, ei: 0.5, rough: 0.4, seg: 12 });
    holoTag(post, "Clear confirmed up", -0.24, 1.52, 0.06, { css: "#59c97b", w: 0.4 });
    reg(hits, clearLamp, "clear-call");
    const allStop = cyl(post, 0.055, 0.055, 0.05, 0.07, 1.31, 0.06, 0xd8232a, { rough: 0.4, seg: 14 });
    allStop.rotation.x = Math.PI / 2;
    holoTag(post, "ALL STOP", 0.3, 1.1, 0.06, { css: "#f0645b", w: 0.26 });
    reg(hits, allStop, "all-stop");

    // The two calculators the arithmetic actually happens on.
    const bridleCalc = instrument(g, -1.2, 1.02, -0.1, { ry: 0.6, idle: "-- kg", color: 0x22d3ee });
    holoTag(bridleCalc, "Bridle calc — leg tension", 0, 0.19, 0, { css: "#22d3ee", w: 0.5 });
    reg(hits, bridleCalc, "bridle-calc");
    const beamLoad = instrument(g, 1.0, 1.02, -0.2, { ry: -0.5, idle: "-- kg", color: 0x59c97b });
    holoTag(beamLoad, "Beam check — side pull", 0, 0.19, 0, { css: "#59c97b", w: 0.5 });
    reg(hits, beamLoad, "beam-load");
    for (const [x, z] of [[-1.2, -0.1], [1.0, -0.2]]) {
      cyl(g, 0.035, 0.045, 1.0, x, 0.5, z, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10, cast: false });
    }

    // ------------------------------------------------- the walk-round findings
    const sharpEdge = box(g, 0.2, 0.1, 0.24, 0.35, FLANGE_Y - 0.04, BEAM_A_Z, 0x9aa4ad,
      { rough: 0.5, metal: 0.5 });
    holoTag(g, "Bare flange edge", 0.35, FLANGE_Y - 0.28, BEAM_A_Z + 0.16, { css: "#8fb3c4", w: 0.34 });
    reg(hits, sharpEdge, "sharp-edge");
    const spareShackle = group(g, 1.75, FLANGE_Y + 0.05, BEAM_B_Z);
    torus(spareShackle, 0.045, 0.014, 0, 0, 0, 0xc2ccd4, { rough: 0.4, metal: 0.75, seg: 6, seg2: 14 });
    cyl(spareShackle, 0.012, 0.012, 0.1, 0, 0.03, 0, 0xe0b23a, { rough: 0.4, metal: 0.8, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(g, "Loose in the steel", 1.75, FLANGE_Y - 0.22, BEAM_B_Z + 0.16, { css: "#8fb3c4", w: 0.34 });
    reg(hits, spareShackle, "spare-shackle");

    // --------------------------------------------------------- arena dressing
    // A bank of seating and a scoreboard well outside the working radius, so
    // the bay reads as a roof over a bowl rather than a rig in a black room.
    for (const [sx, sz, ry] of [[-5.2, -3.9, 0.7], [5.2, -3.9, -0.7]]) {
      const bank = group(g, sx, 0, sz, ry);
      for (let r = 0; r < 5; r++) {
        box(bank, 3.6, 0.22, 0.42, 0, 0.22 + r * 0.3, -r * 0.42, 0x2f3740, { rough: 0.9, cast: false });
        box(bank, 3.6, 0.3, 0.06, 0, 0.5 + r * 0.3, -r * 0.42 - 0.2, r % 2 ? 0x3b4753 : 0x32404c, { rough: 0.85, cast: false });
      }
    }
    const scoreboard = group(g, 0, 0, -5.1);
    box(scoreboard, 2.6, 1.3, 0.3, 0, 3.0, 0, 0x14171a, { rough: 0.7, metal: 0.3, cast: false });
    decal(scoreboard, 2.3, 1.0, 0, 3.0, 0.17, signFace("NORTH HALL", { bg: "#0b1418", accent: "#22d3ee", fg: "#7fd3e6", scale: 0.4 }), { px: 384, glow: true, ei: 0.5 });
    for (const sx of [-1, 1]) cyl(scoreboard, 0.03, 0.03, 1.2, sx * 0.9, 4.25, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 6, cast: false });

    const dust = particles(g, 18, 0xcfd8e2, { size: 0.02, life: 2.4, additive: false, opacity: 0.16 });
    dust.position.set(0, 2.2, -1.3);

    // ------------------------------------------------------------ runtime state
    let breached = false, sharedBeam = false, hauling = false, lowering = false;
    const beamHome = beams[0].web.material;
    const tapeHome = zoneTape[0].material;
    const alertMat = mat(0xd8232a, { rough: 0.6, emissive: 0xd8232a, ei: 0.7 });
    const cautionMat = mat(0xe0a33a, { rough: 0.7, metal: 0.4, emissive: 0xe0a33a, ei: 0.35 });

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "anchor") anchor.children[0].material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.9 });
        if (step.id === "call") bayTag.material.emissiveIntensity = 1.4;
        if (step.id === "clear") clearLamp.material.emissiveIntensity = 1.6;
        if (step.id === "carry") {
          steelBag.position.set(LEG_A.x + 0.28, FLANGE_Y + 0.12, BEAM_A_Z + 0.22);
          steelBag.scale.setScalar(0.7);
        }
        if (step.id === "basket") {
          shackle.rotation.y += Math.PI / 2;
          legA.material = mat(0xa8823f, { rough: 0.8 });
          legB.material = mat(0xa8823f, { rough: 0.8 });
        }
        if (step.id === "drop") lowering = false;
        if (step.id === "haul") {
          hauling = false;
          head.position.y = APEX.y + 0.05;
          head.scale.setScalar(1.25);
        }
        if (step.id === "tag") pointTag.material.emissiveIntensity = 1.8;
        if (step.id === "walk") {
          sharpEdge.material = mat(0x59c97b, { rough: 0.55, emissive: 0x59c97b, ei: 0.5 });
          spareShackle.position.set(1.45, 0.3, 0.9);
        }
      },

      // Both interruptions move something real: the house crew walks into the
      // zone and the tape goes red; the other crew's steel lands on your beam
      // and the beam goes amber.
      onInterrupt(it) {
        if (it.id === "floor-breach") {
          breached = true;
          intruder.position.set(APEX.x + 0.45, 0, APEX.z + 0.3);
          intruder.rotation.y = 2.6;
          for (const bar of zoneTape) bar.material = alertMat;
        }
        if (it.id === "beam-shared") {
          sharedBeam = true;
          otherPoint.position.set(2.15, FLANGE_Y - 0.5, BEAM_A_Z);
          beams[0].web.material = cautionMat;
        }
      },

      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "floor-breach") {
          breached = false;
          intruder.position.copy(intruderHome);
          intruder.rotation.y = 3.4;
          for (const bar of zoneTape) bar.material = tapeHome;
        }
        if (it.id === "beam-shared") {
          sharedBeam = false;
          otherPoint.position.copy(otherHome);
          beams[0].web.material = beamHome;
        }
      },

      onHazard(hitId) {
        // Anything unsafe here ends up on the floor, so the floor is what
        // lights up: the tape goes red and the spotter turns to look.
        for (const bar of zoneTape) bar.material = alertMat;
        spotter.rotation.y = 3.1;
        if (hitId === "open-floor" || hitId === "loose-tool") bob.material.emissiveIntensity = 1.4;
      },

      animate(t, dt, session) {
        dust.visible = true;
        dust.userData.step(dt, new THREE.Vector3(0.06, -0.12, 0.03), 0.02, 1.6, -0.05);
        apexRing.rotation.z = Math.sin(t * 0.6) * 0.05;
        // The point sways a little, the way anything on two legs of steel does.
        point.rotation.z = Math.sin(t * 0.5) * 0.004;
        if (breached) {
          for (const bar of zoneTape) bar.material.emissiveIntensity = 0.5 + Math.sin(t * 7) * 0.4;
        }
        if (sharedBeam) otherPoint.rotation.z = Math.sin(t * 2.2) * 0.08;

        const step = session?.step?.id;
        lowering = step === "drop" && !!session?.holding;
        hauling = step === "haul" && !!session?.holding;
        if (lowering) dropRope.position.y = Math.max(-0.4, dropRope.position.y - dt * 0.12);
        if (hauling) haulLine.children[2].position.y = Math.min(2.4, haulLine.children[2].position.y + dt * 0.25);

        const gg = session?.gauge;
        if (gg && !gg.committed && step === "legs") {
          const band = gg.t >= 0.5 && gg.t <= 0.6;
          repaint(bridleCalc.userData.screen, signFace(`${Math.round(gg.t * 1600)}`, {
            bg: "#06222a", accent: band ? "#59c97b" : "#f0645b", fg: "#bff3fb", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && step === "beams") {
          const band = gg.t >= 0.58 && gg.t <= 0.67;
          repaint(beamLoad.userData.screen, signFace(`${Math.round(gg.t * 1200)}`, {
            bg: "#0b2416", accent: band ? "#59c97b" : "#f0645b", fg: "#bff7d4", scale: 0.55,
          }));
        }
        void upRigger; void downRigger; void floorMark; void CITY;
      },
    };
  },
};
