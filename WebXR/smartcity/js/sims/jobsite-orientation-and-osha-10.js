import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace, hose, mat, ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, valveWheel,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Jobsite Orientation & OSHA 10 VR — Job Readiness Edition,
// apprenticeship navigation block.
//
// A first-period apprentice's first morning on a generic building site: the
// OSHA 10 card shown at the trailer — and understood as the awareness course
// it is, not a licence — then the site-specific orientation 29 CFR 1926.21
// puts on the employer, the hazards found before they are walked into, a
// ladder set at its angle, a harness put on in order and tied off, the saw's
// water turned on before a cut, the pedestrian route walked, and the
// emergency kit located. A foreman who wants to skip the orientation and a
// truck backing across the walkway both arrive while the learner is busy.
// No real site, contractor or crew is depicted.

const JSO_ACCENT = 0xf2a43a;
const JSO_CSS = "#f2a43a";

export const SIM_JOBSITE_ORIENTATION_AND_OSHA_10 = {
  id: "jobsite-orientation-and-osha-10",
  index: "258",
  domain: "Apprenticeship navigation",
  trade: "First-period construction apprentice — the first day on site",
  category: "Community Environmental Justice",
  district: "Construction & Structural Trades",
  weather: "clear",
  certification: "OSHA 29 CFR 1926.21 — the employer's duty to instruct each employee in recognising and avoiding the unsafe conditions of the site; OSHA 10 through the OSHA Outreach Training Program, a voluntary ten-hour awareness course taught by an authorized trainer that some states and many contractors require; OSHA 29 CFR 1926.501 and 29 CFR 1926.502 for fall protection from six feet and the personal fall arrest system; OSHA 29 CFR 1926.416 on worn or damaged cords; OSHA 29 CFR 1926.1153 for wet cutting under the silica standard; the ladder rules in 29 CFR 1926; the apprenticeship standard's requirement that an apprentice works under a journey-level worker; LIUNA's training fund as one of the building-trades programmes that trains first-period apprentices for exactly this morning",
  name: "Jobsite Orientation & OSHA 10",
  title: simTitle("Jobsite Orientation & OSHA 10"),
  tagline: "The first morning on site: the OSHA 10 card shown and understood, the site orientation the employer owes you, hazards found, a ladder set, a harness on and tied off, water on the saw — while a foreman tries to skip it all",
  accent: JSO_ACCENT,
  accentCss: JSO_CSS,
  parSeconds: 300,
  footprint: 2.3,
  supportLine: "your journey-level mentor or your steward if the first days are rough, 988 if it has turned into a crisis, or SAMHSA's National Helpline (1-800-662-4357, free and confidential) if drinking or using is part of how you are getting through the week",
  badge: { id: "oriented-not-rushed", name: "Oriented, Not Rushed", note: "The whole orientation done before the first task, with nobody talked into skipping any of it" },

  game: system({
    name: "Site Ready",
    currency: "TAG",
    ranks: ["New Face", "Signed In", "Oriented", "Tied Off", "Site Ready Certified"],
    badges: [
      { id: "saw-it-first", name: "Saw It First", note: "The site hazards and the emergency kit both found clean", test: AWARD.all(AWARD.stepClean("site-hazards"), AWARD.stepClean("emergency-kit")) },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No unsafe action anywhere on site", test: AWARD.safe },
      { id: "four-to-one", name: "Four To One", note: "The ladder angle set near the middle of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-first-day", name: "Clean First Day", note: "No corrections anywhere", test: AWARD.clean },
      { id: "kept-the-lane", name: "Kept The Lane", note: "Every timed passage carried without a break", test: AWARD.unbroken },
      { id: "on-the-tools-early", name: "On The Tools Early", note: "Finish inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "jso-climb-formwork": "You went to climb the formwork to reach the deck instead of using the ladder. Formwork is not built to be climbed and gives no handhold you can trust, and the deck edge above it is exactly the kind of drop 29 CFR 1926.501 requires protection from at six feet. The ladder is ten steps away; the shortcut is how first-day falls happen.",
    "jso-under-load": "You took the shortcut under the suspended bundle of rebar. Nobody walks under a load on a hook — rigging slips, a tag line jerks, a sling fails — and on a site the route around the swing area is marked for exactly that reason. The few seconds saved are the only thing the shortcut buys.",
    "jso-dry-cut": "You reached for the saw to make a dry cut. Cutting concrete or masonry dry sends respirable crystalline silica into the air you and the crew breathe, and 29 CFR 1926.1153 sets out water or dust collection as the controls for exactly this cut. Silicosis does not show up on the first day; it shows up years later and does not go away.",
    "jso-fence-gap": "You went through the gap in the fence instead of signing in at the trailer. The sign-in is how the site knows who is on it if something goes wrong, and it is where the orientation starts. Walking on through a gap means being on a live site nobody knows you are on, before anybody has told you where the hazards are.",
  },

  lateNotes: {
    "jso-signoff-sheet": "The sign-off comes last. You sign that you were oriented after the orientation has actually happened — reading what you are signing on the way.",
    "jso-lanyard-hook": "Not yet. The harness goes on and gets adjusted before anything is clipped to an anchor — a lanyard on a loose harness does not arrest a fall the way it should.",
  },

  steps: [
    {
      id: "show-card", kind: "select", target: "jso-osha10-card",
      title: "Sign in at the trailer and show your OSHA 10 card",
      cue: "Sign the sheet at the trailer window and show your OSHA 10 card.",
      why: "Many contractors, and some states, require the OSHA 10 card for construction work, and the trailer is where it is checked. It is worth knowing what it is: OSHA 10 is a voluntary ten-hour awareness course from the OSHA Outreach Training Program, taught by an authorized trainer. It shows you have the vocabulary of site safety; it is not a licence, and it does not replace the site's own orientation.",
    },
    {
      id: "site-orientation", kind: "hold", target: "jso-orientation-board", seconds: 6,
      title: "Take the site-specific orientation",
      cue: "Hold at the orientation board while the safety lead walks through this site's hazards, rules and emergency plan.",
      why: "29 CFR 1926.21 puts a duty on the employer to instruct each employee in recognising and avoiding the unsafe conditions of the job, and the site orientation is where that happens for this site: where the deck edges are, where loads swing, what PPE the site requires, where the muster point is. An OSHA 10 card is general; this is specific, and nobody should be working before it is done.",
      holdBreakNote: "You walked away before the orientation finished. The part you missed is about this site — the muster point, the swing area, the edges — and nothing on your card covers it.",
    },
    {
      id: "site-hazards", kind: "find", noHint: true,
      targets: ["jso-open-hole", "jso-missing-rail", "jso-damaged-cord"],
      itemNames: { "jso-open-hole": "an uncovered opening", "jso-missing-rail": "a gap in the deck guardrail", "jso-damaged-cord": "a damaged extension cord" },
      itemNotes: {
        "jso-open-hole": "An opening with no cover, or a cover that is not secured and marked, is a fall hazard and a trip hazard at once. Report it; do not walk around it and hope.",
        "jso-missing-rail": "A missing section of guardrail on a deck edge six feet or more up is the fall hazard 29 CFR 1926.501 is written for. It gets reported and fixed before anyone works near it.",
        "jso-damaged-cord": "A cord with a cut jacket or a taped splice is out of service: 29 CFR 1926.416 says worn or frayed cords are not to be used. Tag it and swap it.",
      },
      title: "Find the three hazards on the way in",
      cue: "Walking the site with your mentor, find the uncovered opening, the gap in the guardrail and the damaged cord.",
      why: "A first-period apprentice is often the only person on site seeing it with fresh eyes, and the hazards that hurt people are usually the ordinary ones everyone has walked past: an opening without a cover, a guardrail section taken down and not replaced, a cord with a taped splice. The OSHA standards for falls and electrical cords name them; the skill is seeing them and saying so the first time.",
    },
    {
      id: "ladder-angle", kind: "gauge", target: "jso-ladder-gauge",
      title: "Set the ladder at the right angle",
      cue: "Commit when the base sits about a quarter of the working length out from the deck — the four-to-one angle.",
      gauge: {
        label: "LADDER ANGLE", speed: 0.6, green: [0.42, 0.58],
        readout: (t) => `${(2 + t * 4).toFixed(1)} : 1 — ${t < 0.42 ? "too flat, it can slide" : t > 0.58 ? "too steep, it can tip back" : "about four to one"}`,
        missNote: "That angle will not hold. Too flat and the base kicks out; too steep and it tips backward when you lean. The base goes out about a quarter of the working length.",
      },
      why: "A straight or extension ladder is set with its base about a quarter of its working length out from the top support — the four-to-one angle in the ladder rules of 29 CFR 1926 — and its rails running about three feet past the landing so there is something to hold on the step off. Most ladder falls start with the setup, not the climb, which is why the angle is checked before anyone steps on.",
    },
    {
      id: "harness-on", kind: "sequence",
      targets: ["jso-h-dring", "jso-h-chest", "jso-h-legs"],
      itemNames: { "jso-h-dring": "hold it by the back D-ring and shoulder it", "jso-h-chest": "buckle the chest strap", "jso-h-legs": "buckle and snug the leg straps" },
      outOfOrderNote: "Out of order. Pick the harness up by the back D-ring so it hangs right, put the shoulder straps on, then the chest strap, then the leg straps, snug.",
      title: "Put the harness on in order",
      cue: "Hold the harness by the back D-ring and shoulder it, buckle the chest strap, then the leg straps, snug.",
      why: "A personal fall arrest system only works if the harness is on right: the D-ring between the shoulder blades, the chest strap across the chest, the leg straps snug. Picking it up by the D-ring first makes it hang the right way; buckling in order stops the twisted strap that a fall would find. 29 CFR 1926.502 sets the requirements for the system; putting it on properly is where it starts.",
    },
    {
      id: "tie-off", kind: "drag", target: "jso-lanyard-hook",
      title: "Clip the lanyard to the anchor before stepping onto the deck",
      cue: "Carry the lanyard's snap hook to the rated anchor point on the deck post — at or above your D-ring.",
      why: "Fall protection from six feet up, under 29 CFR 1926.501, means being tied off before you are exposed, not after you reach the work. The anchor has to be one rated for it, and rigging it at or above the D-ring keeps any fall short, which is what 29 CFR 1926.502 is after. Clipping on at the top of the ladder, before the first step onto the deck, is the habit that matters.",
      drag: { to: "jso-anchor-point", radius: 0.4, missNote: "Not on the rated anchor. A rail, a pipe or a piece of formwork is not an anchor — clip to the one marked for it." },
    },
    {
      id: "toolbox-talk", kind: "select", target: "jso-toolbox-talk",
      title: "Stand in for the morning toolbox talk",
      cue: "Join the crew at the toolbox-talk board for today's topic and the day's plan.",
      why: "The toolbox talk is where the crew hears the day's plan, the one hazard that matters most today and who is doing what. For a first-period apprentice it is also where you learn names and who to ask. Standing in and listening — and asking the question you are not sure about — is part of the orientation that never stops, and it is where a journey-level worker notices who is paying attention.",
    },
    {
      id: "wet-cut", kind: "turn", target: "jso-water-valve",
      title: "Turn the saw's water on before the cut",
      cue: "Open the water valve on the saw so the blade is wet before it touches the block.",
      turn: { turns: 0.5, axis: "y", label: "WATER FEED" },
      why: "Cutting concrete or masonry releases respirable crystalline silica, and 29 CFR 1926.1153 sets out wet cutting — water delivered to the blade — as one of the controls for saws like this one. The water goes on before the blade touches the block, not partway through, because the first seconds of a dry cut put dust straight into the air. NIOSH has documented silicosis in construction workers for decades; the water protects the whole crew, not just whoever holds the saw.",
    },
    {
      id: "walk-the-route", kind: "track", target: "jso-walkway", seconds: 7,
      title: "Walk the pedestrian route behind your mentor",
      cue: "Keep a steady pace inside the marked walkway — not a rush past the equipment, not a stop in the lane.",
      track: {
        start: 0.16, green: [0.4, 0.62], rise: 0.5, fall: 0.44, drift: 0.13, label: "PACE",
        readout: (v) => (v < 0.4 ? "stalled in the lane" : v > 0.62 ? "rushing — eyes off the equipment" : "steady, in the lane"),
      },
      holdBreakNote: "You dropped out of the walkway. The marked route is where the equipment operators expect people to be — stay in it at a steady pace.",
      why: "A site's pedestrian route is marked to keep people out of the swing and travel paths of equipment, and walking it steadily behind your mentor is how a new apprentice learns the site without walking into a machine's blind spot. Rushing means eyes off the equipment; stopping in the lane leaves you where a backing truck does not expect you. The orientation board showed the route; this is where it gets walked.",
    },
    {
      id: "emergency-kit", kind: "find", noHint: true,
      targets: ["jso-muster-sign", "jso-first-aid", "jso-extinguisher"],
      itemNames: { "jso-muster-sign": "the muster point", "jso-first-aid": "the first-aid kit", "jso-extinguisher": "the fire extinguisher" },
      itemNotes: {
        "jso-muster-sign": "The muster point is where everyone goes when the alarm sounds, so the headcount can happen. Know it before you need it.",
        "jso-first-aid": "The first-aid kit, and who on site is trained to use it. In an emergency nobody has time to look for either.",
        "jso-extinguisher": "The fire extinguisher by the trailer — and how far it is from where hot work happens today.",
      },
      title: "Find the muster point, the first-aid kit and the extinguisher",
      cue: "Before the first task, locate the three things you would need in an emergency.",
      why: "An emergency is the worst time to learn where anything is. The muster point is where the headcount happens, the first-aid kit is where a cut gets treated, and the extinguisher is what stops a small fire becoming a large one. Knowing all three before the first task is part of the orientation the employer owes you under 29 CFR 1926.21, and part of what you owe the crew.",
    },
    {
      id: "mentor-checkin", kind: "select", target: "jso-mentor",
      title: "Check in with your journey-level mentor",
      cue: "Before the first task, tell your mentor what you found and ask what they want from you today — and say how you are doing.",
      why: "An apprentice works under a journey-level worker, as the apprenticeship standard requires, and the check-in is how that works in practice: what you found, what you are not sure about, what the first task is. First days are overwhelming, and a mentor who hears 'I have never done this' before the task can teach it; one who finds out halfway through has to fix it. If more than nerves is going on, SAMHSA's National Helpline is free and confidential.",
    },
    {
      id: "signoff", kind: "select", target: "jso-signoff-sheet",
      title: "Read and sign the orientation sign-off",
      cue: "Read the sign-off sheet — what was covered — and sign it only for what actually happened.",
      why: "The sign-off is the site's record that you were oriented, and it lists what that covered. Reading it before signing is how you notice a line that was not covered — and signing only for what happened is what makes the record worth anything. It is also the one piece of paper that shows, later, that the employer met its duty under 29 CFR 1926.21 for you.",
    },
  ],

  interrupts: [
    {
      id: "jso-foreman-skip",
      kind: "Foreman skipping the orientation",
      after: "site-orientation", delay: 3, seconds: 12,
      alert: "A foreman leans in at the board: 'Skip that, grab a shovel — we're pouring in ten minutes and I need hands.'",
      cue: "Do not leave the orientation. Take it to the person who runs it.",
      target: "jso-safety-lead",
      why: "The orientation exists because 29 CFR 1926.21 puts the duty to instruct on the employer, and a first-day apprentice cannot weigh a pour schedule against it alone. Taking it to the safety lead is not refusing work — it puts the decision with the person responsible for the orientation, who will usually finish it in minutes. Walking off with the shovel means working a pour on a site you have not been shown.",
      missNote: "You stayed put while the foreman waited, and in the version where you went with him you spent the pour next to a deck edge you had not been shown, under a swing area nobody had pointed out, with no idea where the muster point was.",
      wrongNote: "Not that. The answer is the safety lead — the person who runs the orientation — not the shovel, and not arguing with the foreman yourself.",
    },
    {
      id: "jso-truck-backing",
      kind: "Truck backing across the walkway",
      after: "walk-the-route", delay: 3, seconds: 12,
      alert: "A dump truck's backup alarm starts and it begins reversing toward the walkway — nobody is guiding it back, and the driver cannot see the lane behind the bed.",
      cue: "Get out of its path to the protected area.",
      target: "jso-safe-zone",
      why: "A reversing truck has a large blind area behind it, and the rule on every site is the same: get out of its path to a protected place and make yourself visible — not stand in the lane waving, and not try to beat it across. The barriered safe zone beside the walkway is there for exactly this. Sorting out who should have been guiding the truck happens after you are out of the way.",
      missNote: "You kept walking the lane as the truck came back, and in the version where it did not stop you were in the blind area behind the bed when it reached the walkway. Backing vehicles are one of the most common ways people are killed on construction sites.",
      wrongNote: "Not that. The answer is the barriered safe zone — out of the truck's path first, visible to the driver, everything else after.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, JSO_ACCENT);

    const ground = box(g, 6.2, 0.1, 5.8, 0, 0.05, 0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#5a5046", base2: "#4a4238", seam: "rgba(0,0,0,0.38)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xc4b79f },
    );

    // ------------------------------------------------- the trailer and gate
    const trailer = group(g, -2.1, 0.1, -1.4, 0.35);
    box(trailer, 1.6, 1.4, 1.0, 0, 0.85, 0, 0xe0dccc, { rough: 0.7, finish: "painted", tile: 2 });
    box(trailer, 1.7, 0.1, 1.1, 0, 1.6, 0, 0x8a8478, { rough: 0.6 });
    for (const sx of [-0.6, 0.6]) box(trailer, 0.16, 0.2, 0.9, sx, 0.1, 0, 0x3a3c3e, { rough: 0.7 });
    box(trailer, 0.7, 0.45, 0.02, 0.25, 1.1, 0.51, 0x7f9aa8, { rough: 0.2, opacity: 0.6, transparent: true });
    slab(trailer, 0.8, 0.04, 0.26, 0.25, 0.86, 0.62, 0x6a6458, { radius: 0.01, rough: 0.6 });
    decal(trailer, 0.9, 0.16, 0.25, 1.46, 0.51, signFace("SITE OFFICE — SIGN IN", { bg: "#2a2c24", accent: JSO_CSS, scale: 0.5 }), { px: 320 });
    // The OSHA 10 card and the sign-off sheet on the window ledge.
    const card = group(trailer, 0.05, 0.89, 0.62, 0.1);
    slab(card, 0.12, 0.004, 0.08, 0, 0, 0, 0xf2f6fa, { radius: 0.006, rough: 0.5 });
    const cardFace = decal(card, 0.11, 0.07, 0, 0.004, 0, paperFace("OSHA 10", ["Construction", "Outreach card"], { bg: "#f2f6fa", band: "#2f5f8a" }), { px: 128 });
    cardFace.rotation.x = -Math.PI / 2;
    holoTag(card, "your OSHA 10 card", 0, 0.1, 0, { css: JSO_CSS, w: 0.34 });
    reg(hits, card, "jso-osha10-card");
    const signoff = group(trailer, 0.45, 0.89, 0.62, -0.1);
    slab(signoff, 0.2, 0.006, 0.14, 0, 0, 0, 0xfbfbf6, { radius: 0.004, rough: 0.8 });
    const soFace = decal(signoff, 0.18, 0.12, 0, 0.005, 0, paperFace("ORIENTATION SIGN-OFF", ["Covered: ____", "Sign: ____"], { bg: "#fbfbf6", band: "#8a6a2a" }), { px: 160 });
    soFace.rotation.x = -Math.PI / 2;
    holoTag(signoff, "orientation sign-off", 0, 0.1, 0, { css: JSO_CSS, w: 0.38 });
    reg(hits, signoff, "jso-signoff-sheet");
    // The emergency kit on the trailer's side.
    const kitWall = group(trailer, -0.81, 0, 0, -Math.PI / 2);
    const firstAid = group(kitWall, 0.2, 1.0, 0.02);
    box(firstAid, 0.3, 0.24, 0.1, 0, 0, 0.05, 0xf2f2f2, { rough: 0.5 });
    box(firstAid, 0.1, 0.03, 0.01, 0, 0, 0.105, 0x2f8a4a, { rough: 0.5 });
    box(firstAid, 0.03, 0.1, 0.01, 0, 0, 0.105, 0x2f8a4a, { rough: 0.5 });
    reg(hits, firstAid, "jso-first-aid");
    const ext = group(kitWall, -0.25, 0.3, 0.1);
    cyl(ext, 0.07, 0.07, 0.42, 0, 0.21, 0, 0xc0392b, { rough: 0.4, metal: 0.3, seg: 14 });
    cyl(ext, 0.02, 0.02, 0.06, 0, 0.45, 0, 0x2a2a2a, { rough: 0.5, seg: 8 });
    reg(hits, ext, "jso-extinguisher");
    holoTag(kitWall, "first aid · extinguisher", 0, 1.3, 0.05, { css: JSO_CSS, w: 0.42 });

    // Fence along the left edge, with the gap (hazard).
    const fence = group(g, -2.85, 0.1, 0.8, Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      if (i === 2) continue;
      box(fence, 0.9, 1.6, 0.02, -1.4 + i * 0.95, 0.8, 0, 0x8a939b, { rough: 0.6, metal: 0.4, opacity: 0.55, transparent: true });
      cyl(fence, 0.025, 0.025, 1.7, -1.85 + i * 0.95, 0.85, 0, 0x6a7078, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const gap = group(fence, 0.5, 0, 0.05);
    box(gap, 0.8, 0.04, 0.3, 0, 0.02, 0, 0x6a5a48, { rough: 0.9 });
    holoTag(gap, "shortcut through the fence?", 0, 1.2, 0, { css: "#f0645b", w: 0.54 });
    reg(hits, gap, "jso-fence-gap");

    // ---------------------------------------------------- the orientation board
    const orient = holoPanel(g, 1.0, 0.7, -0.75, 1.65, -2.3, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,6,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = JSO_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fde6c4"; cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SITE ORIENTATION — THIS SITE", w * 0.05, h * 0.11);
      cx.fillStyle = "#fff6e6"; cx.font = `${Math.round(h * 0.068)}px Arial, sans-serif`;
      ["Deck edges + openings: tie off at 6 ft", "Swing area: never under a load", "Walkway: stay in the marked lane", "Silica: water on before any cut", "Muster point: by the trailer"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.14)));
    }, { accent: JSO_ACCENT, stalk: true });
    reg(hits, orient, "jso-orientation-board");

    // The formwork wall (the climb hazard) along the back.
    const form = group(g, -0.2, 0.1, -2.55);
    for (let i = 0; i < 3; i++) {
      box(form, 0.6, 1.2, 0.04, -0.62 + i * 0.62, 0.6, 0, 0xb8864a, { rough: 0.8 });
      for (const y of [0.2, 0.6, 1.0]) box(form, 0.6, 0.05, 0.06, -0.62 + i * 0.62, y, 0.05, 0x7a5a30, { rough: 0.8 });
    }
    holoTag(form, "climb the forms?", 0, 1.35, 0.05, { css: "#f0645b", w: 0.34 });
    reg(hits, form, "jso-climb-formwork");

    // ------------------------------------------------- the deck and the ladder
    const deck = group(g, 1.45, 0.1, -1.75);
    box(deck, 1.7, 0.12, 1.1, 0, 1.2, 0, 0x8a8a84, { rough: 0.8, finish: "concrete", tile: [2, 1] });
    for (const [sx, sz] of [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]]) box(deck, 0.12, 1.2, 0.12, sx, 0.6, sz, 0x6a6a64, { rough: 0.8 });
    // Guardrail on the front edge, with a missing section.
    const railSegs = [[-0.55, 0.5]];
    for (const [x] of railSegs) {
      box(deck, 0.6, 0.04, 0.04, x, 2.3, 0.53, 0xf2c14b, { rough: 0.5 });
      box(deck, 0.6, 0.04, 0.04, x, 1.8, 0.53, 0xf2c14b, { rough: 0.5 });
    }
    for (const x of [-0.85, -0.25, 0.85]) box(deck, 0.04, 1.05, 0.04, x, 1.8, 0.53, 0xf2c14b, { rough: 0.5 });
    const railGap = box(deck, 0.9, 0.9, 0.06, 0.3, 1.8, 0.55, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, railGap, "jso-missing-rail");
    // The rated anchor on the deck post (drag socket).
    const anchor = group(deck, 0.85, 2.05, 0.53);
    ball(anchor, 0.04, 0, 0, 0.04, 0xdfe4e8, { rough: 0.3, metal: 0.9, seg: 12, seg2: 10 });
    box(anchor, 0.1, 0.1, 0.02, 0, 0, 0.0, 0x3a3c3e, { rough: 0.5, metal: 0.6 });
    decal(anchor, 0.14, 0.05, 0, 0.1, 0.02, signFace("ANCHOR", { bg: "#1b2224", accent: "#59c97b", scale: 0.6 }), { px: 128 });
    reg(hits, anchor, "jso-anchor-point");
    // The ladder, leaning on the deck edge.
    const ladder = group(g, 0.5, 0.1, -1.05);
    ladder.rotation.x = -0.25;
    for (const sx of [-0.2, 0.2]) box(ladder, 0.05, 2.4, 0.05, sx, 1.2, 0, 0xd8b030, { rough: 0.5 });
    for (let i = 0; i < 7; i++) box(ladder, 0.4, 0.03, 0.04, 0, 0.3 + i * 0.3, 0, 0xc8a028, { rough: 0.5 });
    const ladderGauge = instrument(g, 0.95, 0.55, -0.55, { idle: "-.- : 1", color: JSO_ACCENT, ry: -0.3 });
    const gaugePost = cyl(g, 0.025, 0.025, 0.45, 0.95, 0.3, -0.55, 0x3a3c3e, { rough: 0.5, metal: 0.5, seg: 8 });
    void gaugePost;
    holoTag(ladderGauge, "ladder angle", 0, 0.16, 0, { css: JSO_CSS, w: 0.28 });
    reg(hits, ladderGauge, "jso-ladder-gauge");

    // The uncovered opening in the slab (find) — a dark square with no cover.
    const hole = group(g, 1.3, 0.1, 0.35);
    box(hole, 0.5, 0.012, 0.5, 0, 0.006, 0, 0x14110e, { rough: 0.95, cast: false });
    box(hole, 0.56, 0.02, 0.03, 0, 0.01, -0.265, 0x5a4a38, { rough: 0.9 });
    const holeMark = box(hole, 0.5, 0.3, 0.5, 0, 0.15, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, holeMark, "jso-open-hole");

    // The harness on its rack, with markers for the donning order, and the lanyard.
    const rack = group(g, -0.55, 0.1, -1.2, 0.3);
    box(rack, 0.06, 1.7, 0.06, -0.3, 0.85, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    box(rack, 0.06, 1.7, 0.06, 0.3, 0.85, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    box(rack, 0.66, 0.05, 0.06, 0, 1.7, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    const harness = group(rack, 0, 1.2, 0.05);
    for (const sx of [-0.08, 0.08]) box(harness, 0.04, 0.6, 0.015, sx, 0, 0, 0xf2a43a, { rough: 0.7 });
    box(harness, 0.22, 0.04, 0.015, 0, 0.12, 0.01, 0xf2a43a, { rough: 0.7 });
    for (const sx of [-0.1, 0.1]) box(harness, 0.05, 0.25, 0.015, sx, -0.38, 0, 0xf2a43a, { rough: 0.7 });
    const dring = ball(harness, 0.03, 0, 0.3, -0.01, 0xdfe4e8, { rough: 0.3, metal: 0.9, seg: 10, seg2: 8 });
    void dring;
    holoTag(rack, "harness", 0, 1.85, 0, { css: JSO_CSS, w: 0.2 });
    reg(hits, box(harness, 0.14, 0.1, 0.05, 0, 0.3, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-h-dring");
    reg(hits, box(harness, 0.26, 0.08, 0.05, 0, 0.12, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-h-chest");
    reg(hits, box(harness, 0.26, 0.16, 0.05, 0, -0.38, 0.02, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-h-legs");
    const lanyard = group(rack, 0.2, 0.95, 0.06);
    hose(lanyard, [[0, 0.2, 0], [0.04, 0.05, 0.02], [0, -0.1, 0]], 0.012, 0x2f5f8a);
    box(lanyard, 0.04, 0.06, 0.02, 0, -0.12, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9 });
    holoTag(lanyard, "lanyard hook", 0, 0.3, 0, { css: JSO_CSS, w: 0.26 });
    reg(hits, lanyard, "jso-lanyard-hook");

    // ------------------------------------------------ the saw and its water
    const saw = group(g, 2.15, 0.1, 0.55, -0.5);
    box(saw, 0.8, 0.5, 0.5, 0, 0.25, 0, 0x2f5f8a, { rough: 0.5, metal: 0.4 });
    box(saw, 0.9, 0.05, 0.55, 0, 0.52, 0, 0x5a6068, { rough: 0.4, metal: 0.6 });
    const blade = cyl(saw, 0.18, 0.18, 0.01, 0.0, 0.66, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 24 });
    blade.rotation.x = Math.PI / 2;
    box(saw, 0.4, 0.2, 0.08, 0, 0.72, 0, 0xf2a43a, { rough: 0.5 });
    const valve = valveWheel(saw, -0.5, 0.1, 0.1, { color: 0x2f8ad8, body: 0x2a3036, r: 0.07 });
    holoTag(valve, "water feed", 0, 0.45, 0, { css: JSO_CSS, w: 0.26 });
    reg(hits, valve, "jso-water-valve");
    const bucket = cyl(saw, 0.14, 0.12, 0.3, -0.55, 0.15, -0.35, 0x2f5f8a, { rough: 0.6, seg: 14 });
    void bucket;
    const waterMist = box(saw, 0.3, 0.1, 0.1, 0, 0.6, 0.12, 0x9ad0f0, { opacity: 0.5, transparent: true, rough: 0.2, cast: false });
    waterMist.visible = false;
    const dry = group(saw, 0.3, 0.9, 0.2);
    slab(dry, 0.3, 0.16, 0.01, 0, -0.08, 0, 0xffe9d8, { radius: 0.005, rough: 0.7 });
    decal(dry, 0.28, 0.14, 0, 0, 0.008, paperFace("CUT IT DRY", ["'faster'"], { bg: "#ffe9d8", band: "#c0392b" }), { px: 160 });
    holoTag(dry, "dry cut?", 0, 0.14, 0, { css: "#f0645b", w: 0.2 });
    reg(hits, dry, "jso-dry-cut");
    // The generator and the damaged cord to the saw.
    const gen = group(g, 2.35, 0.1, -0.35);
    box(gen, 0.6, 0.45, 0.4, 0, 0.225, 0, 0xd8a020, { rough: 0.5, metal: 0.3 });
    box(gen, 0.62, 0.05, 0.42, 0, 0.47, 0, 0x2a2a2a, { rough: 0.5 });
    hose(g, [[2.1, 0.35, -0.3], [1.75, 0.14, 0.0], [1.6, 0.14, 0.4], [1.85, 0.3, 0.55]], 0.015, 0x2a2a2a);
    const splice = group(g, 1.62, 0.18, 0.2);
    box(splice, 0.1, 0.04, 0.04, 0, 0, 0, 0xf2f2f2, { rough: 0.7 });
    const cordMark = box(splice, 0.3, 0.3, 0.3, 0, 0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cordMark, "jso-damaged-cord");

    // ------------------------------------------------ the suspended load
    const hook = group(g, 0.3, 0, -0.3);
    cyl(hook, 0.008, 0.008, 1.0, 0, 3.2, 0, 0x2a2a2a, { rough: 0.5, seg: 6 });
    box(hook, 0.12, 0.14, 0.06, 0, 2.66, 0, 0xd8a020, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 6; i++) cyl(hook, 0.015, 0.015, 1.4, -0.08 + (i % 3) * 0.08, 2.45 - Math.floor(i / 3) * 0.04, 0, 0x7a4a2a, { rough: 0.7, seg: 6 }).rotation.z = Math.PI / 2;
    const underZone = box(hook, 1.2, 0.012, 0.6, 0, 0.11, 0, 0xf0645b, { opacity: 0.35, transparent: true, rough: 0.6, cast: false });
    holoTag(hook, "shortcut under the load?", 0, 0.5, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, underZone, "jso-under-load");

    // ------------------------------------------------ the walkway and safe zone
    const lane = box(g, 0.7, 0.012, 1.9, -0.55, 0.106, 1.5, 0x59c97b, { opacity: 0.45, transparent: true, rough: 0.6, cast: false });
    ownMaterial(lane);
    for (let i = 0; i < 5; i++) box(g, 0.08, 0.014, 0.25, -0.55, 0.108, 0.7 + i * 0.4, 0xf2f2f2, { rough: 0.6, cast: false });
    holoTag(g, "pedestrian walkway", -0.55, 0.35, 1.3, { css: "#59c97b", w: 0.4 });
    reg(hits, lane, "jso-walkway");
    const safe = group(g, -1.45, 0.1, 2.0);
    for (const [x, z] of [[-0.35, 0], [0.35, 0], [0, -0.35]]) {
      const b = box(safe, x === 0 ? 0.8 : 0.08, 0.9, x === 0 ? 0.08 : 0.8, x, 0.45, z, 0xc0392b, { rough: 0.6 });
      void b;
    }
    decal(safe, 0.5, 0.14, 0, 0.8, -0.3, signFace("SAFE ZONE", { bg: "#1d2a16", accent: "#59c97b", scale: 0.6 }), { px: 192 });
    reg(hits, box(safe, 0.7, 1.0, 0.7, 0, 0.5, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-safe-zone");
    const muster = group(g, -2.45, 0.1, 0.35);
    cyl(muster, 0.03, 0.03, 1.5, 0, 0.75, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 8 });
    const mSign = group(muster, 0, 1.45, 0);
    box(mSign, 0.4, 0.3, 0.02, 0, 0, 0, 0x2f8a4a, { rough: 0.5 });
    decal(mSign, 0.36, 0.26, 0, 0, 0.015, signFace("MUSTER\nPOINT", { bg: "#2f8a4a", accent: "#f2f2f2", scale: 0.3 }), { px: 160 });
    reg(hits, mSign, "jso-muster-sign");

    // The dump truck, parked back left, that reverses in the second interruption.
    // Parked on the right, its bed toward the walkway.
    const truck = group(g, 2.9, 0.1, 2.5, 0);
    box(truck, 1.6, 0.9, 1.0, -0.2, 0.95, 0, 0xd8a020, { rough: 0.5, metal: 0.3 });
    box(truck, 0.6, 0.8, 0.95, 0.85, 0.9, 0, 0xe0dccc, { rough: 0.5, metal: 0.3 });
    box(truck, 0.5, 0.35, 0.9, 0.9, 1.1, 0, 0x2a3a4a, { rough: 0.2, opacity: 0.7, transparent: true });
    for (const [x, z] of [[-0.6, -0.5], [-0.6, 0.5], [0.8, -0.5], [0.8, 0.5]]) {
      const wheel = cyl(truck, 0.26, 0.26, 0.18, x, 0.26, z, 0x1b1b1b, { rough: 0.8, seg: 16 });
      wheel.rotation.x = Math.PI / 2;
    }
    const reverseLamps = [];
    for (const z of [-0.4, 0.4]) {
      const l = box(truck, 0.03, 0.08, 0.1, -1.01, 0.7, z, 0x5a5a5a, { rough: 0.4, cast: false });
      ownMaterial(l);
      reverseLamps.push(l);
    }

    // The toolbox-talk board on the right.
    const talk = group(g, 2.55, 0.1, 1.55, -Math.PI / 2 - 0.3);
    box(talk, 0.05, 1.5, 0.05, -0.35, 0.75, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    box(talk, 0.05, 1.5, 0.05, 0.35, 0.75, 0, 0x5a5c5e, { rough: 0.5, metal: 0.5 });
    const talkBoard = group(talk, 0, 1.35, 0.03);
    slab(talkBoard, 0.8, 0.5, 0.02, 0, -0.25, 0, 0xf2eee4, { radius: 0.01, rough: 0.8 });
    decal(talkBoard, 0.74, 0.44, 0, 0, 0.012, paperFace("TOOLBOX TALK — TODAY", ["Topic: backing vehicles", "Plan: pour at 10:00", "Ask before you act"], { bg: "#fbf8f0", band: "#8a6a2a" }), { px: 256 });
    reg(hits, talkBoard, "jso-toolbox-talk");

    // Stacked materials, so it reads as a live site.
    const pallets = group(g, 2.3, 0.1, -2.5);
    for (let i = 0; i < 3; i++) box(pallets, 0.8, 0.12, 0.6, 0, 0.06 + i * 0.28, 0, 0x9a7a48, { rough: 0.9 });
    for (let i = 0; i < 3; i++) box(pallets, 0.7, 0.16, 0.5, 0, 0.2 + i * 0.28, 0, 0xc7bfa8, { rough: 0.9 });

    // ------------------------------------------------------------- the people
    const mentor = standingFigure(g, 0.25, 1.1, { ry: 2.6, cloth: 0x3a4a5a, vest: 0xf2c14b, helmet: 0xf2f2f2, glasses: true });
    holoTag(mentor, "journey-level mentor", 0, 1.95, 0, { css: JSO_CSS, w: 0.42 });
    reg(hits, box(mentor, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-mentor");
    const lead = standingFigure(g, -1.3, -0.35, { ry: 0.6, cloth: 0x2f6f4a, vest: 0x59c97b, helmet: 0x59c97b });
    holoTag(lead, "site safety lead", 0, 1.95, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, box(lead, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "jso-safety-lead");
    const foreman = standingFigure(g, -1.55, 0.75, { ry: 1.2, cloth: 0x7a4a2a, vest: 0xf2a43a, helmet: 0xffffff });
    holoTag(foreman, "foreman", 0, 1.95, 0, { css: "#f0645b", w: 0.2 });
    foreman.visible = false;

    let backing = false, rushing = false;

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-0.2, 1.3, -2.0),

      onStepComplete(step) {
        if (step.id === "show-card") card.position.y = 0.95;
        if (step.id === "site-hazards") railGap.material = mat(0xf2c14b, { opacity: 0.5, rough: 0.5 });
        if (step.id === "ladder-angle") { ladder.rotation.x = -0.25; repaint(ladderGauge.userData.screen, signFace("4 : 1", { bg: "#0d1c24", accent: "#59c97b", fg: "#e9fbe9", scale: 0.6 })); }
        if (step.id === "tie-off") lanyard.position.set(1.4, 2.1, -1.2);
        if (step.id === "wet-cut") waterMist.visible = true;
        if (step.id === "mentor-checkin") mentor.rotation.y = 3.1;
        if (step.id === "signoff") repaint(soFace, paperFace("ORIENTATION SIGN-OFF", ["Covered: all 5", "Signed: after reading"], { bg: "#fbfbf6", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "jso-foreman-skip") { rushing = true; foreman.visible = true; }
        if (it.id === "jso-truck-backing") {
          backing = true;
          truck.position.set(2.5, 0.1, 2.4);
          for (const l of reverseLamps) { l.material.emissive.set(0xfff6e6); l.material.emissiveIntensity = 1.4; }
        }
      },
      onInterruptEnd(it) {
        if (it.id === "jso-foreman-skip") {
          rushing = false;
          if (it.resolved === "answered") foreman.visible = false;
          else foreman.position.set(-1.2, 0, 0.3);
        }
        if (it.id === "jso-truck-backing") {
          backing = false;
          for (const l of reverseLamps) l.material.emissiveIntensity = 0;
          if (it.resolved === "answered") truck.position.set(2.9, 0.1, 2.5);
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (backing) {
          truck.position.x = Math.max(1.5, truck.position.x - dt * 0.12);
          for (const l of reverseLamps) l.material.emissiveIntensity = 1.0 + Math.sin(t * 10) * 0.6;
        }
        if (rushing) foreman.rotation.y = 1.2 + Math.sin(t * 3) * 0.2;
        if (session?.turn && session.step?.id === "wet-cut" && valve.userData.wheel) valve.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "ladder-angle") {
          const ok = gg.t >= 0.42 && gg.t <= 0.58;
          ladder.rotation.x = -0.1 - gg.t * 0.3;
          repaint(ladderGauge.userData.screen, signFace(`${(2 + gg.t * 4).toFixed(1)} : 1`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.56 }));
        }
        const tr = session?.track;
        if (tr && session.step?.id === "walk-the-route") {
          const ok = tr.v >= 0.4 && tr.v <= 0.62;
          lane.material.color?.set?.(ok ? 0x59c97b : 0xc0392b);
        }
      },
    };
  },
};
