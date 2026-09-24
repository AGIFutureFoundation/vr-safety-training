import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, group, decal, repaint, signFace, paperFace, mat, hose } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, cone, barrierPanel, reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { radio, tagLine, hardHatLamp } from "../../../shared/toolkit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Non-Entry Retrieval & Tripod VR — Water & Environmental,
// the confined-space block.
//
// A storm drain junction structure under a lifted grate in a generic
// municipal yard: a vertical space deeper than a person, entered by ladder
// to clear a blocked inlet. Before the entrant goes in, the attendant builds
// the rescue that does not need a rescuer — a tripod set square over the
// opening, its legs pinned and chained, a winch on its bracket with the cable
// over the head pulley, the brake proven under a test weight, and the
// retrieval line on the entrant's back D-ring before their boots cross the
// opening. Then the drill the permit's rescue plan calls for: the entrant
// "goes down" and the attendant winches them out and over the lip without
// ever leaning into the hole. confined-rescue is the technical team's entry
// rescue with a main and a belay; this is the attendant's non-entry
// retrieval, which is what most permit entries actually rely on. LIUNA, UA
// and IUOE crews. No real yard, product or rating is named.

const CNR_ACCENT = 0xf0b04b;
const CNR_CSS = "#f0b04b";
const CNR_WARN = "#e0664f";
const CNR_PAD = 0.3;

export const SIM_CS_NON_ENTRY_RETRIEVAL_AND_TRIPOD = {
  id: "cs-non-entry-retrieval-and-tripod",
  index: "323",
  domain: "Water & Environmental",
  trade: "Confined-space attendant — LIUNA, UA or IUOE crew rigging a tripod and winch for non-entry retrieval",
  category: "Water & Environmental",
  weather: "clear",
  certification: "OSHA 29 CFR 1910.146(k) rescue and emergency services — retrieval systems for non-entry rescue, a full-body harness with the line at the centre of the back, and a mechanical retrieval device for vertical spaces; OSHA 29 CFR 1926 Subpart AA where the entry is construction work; ANSI Z359 fall protection and rescue code for the tripod, winch and harness; ANSI Z117.1 confined-space practice; NIOSH confined-space criteria on would-be rescuers; LIUNA, UA and IUOE confined-space training",
  name: "Non-Entry Retrieval & Tripod",
  title: simTitle("Non-Entry Retrieval & Tripod"),
  tagline: "The rescue that needs no rescuer: the kit inspected, the tripod set square over a storm drain structure, legs pinned and chained, the winch mounted and reeved, the brake proven under a test weight while a coworker tries to hoist tools on it, the harness fitted and the line on the back D-ring before entry, the lower tended through a slip, the line kept clear, the drill haul cranked, the entrant brought over the lip, and the drill logged",
  accent: CNR_ACCENT,
  accentCss: CNR_CSS,
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "out-without-going-in", name: "Out Without Going In", note: "A tripod set square and proven, the line on before entry, and the entrant brought out and over the lip with nobody leaning into the hole" },

  supportLine: "your LIUNA, UA or IUOE local's member assistance programme, or the employee assistance line on the back of the entry permit",

  game: system({
    name: "Retrieval Rig",
    currency: "HAULS",
    ranks: ["Tripod Hand", "Attendant", "Retrieval Lead", "Entry Supervisor", "Non-Entry Rescue Qualified"],
    badges: [
      { id: "line-before-boots", name: "Line Before Boots", note: "The retrieval line on the back D-ring before the entrant crossed the opening", test: AWARD.stepClean("attach-before-entry") },
      { id: "never-leaned-in", name: "Never Leaned In", note: "No handrail anchor, no belt clip, no leaning over the hole, no leg on the grating", test: AWARD.safe },
      { id: "clean-rig", name: "Clean Rig", note: "No corrections from the rescue plan to the log", test: AWARD.clean },
    ],
    challenges: [
      { id: "tended-line", name: "Tended Line", note: "The lower tended in band all the way", test: AWARD.unbroken },
      { id: "drill-time", name: "Drill Time", note: "Rescue plan to log inside 80% of par", test: AWARD.fast(0.8) },
      { id: "eight-clean", name: "Eight Clean", note: "Eight correct actions in a row", test: AWARD.streak(8) },
    ],
  }),

  hazards: {
    "anchor-to-handrail": "You went to clip the retrieval line to the yard's handrail. A handrail is built to steady a hand, not to hold a person hanging in a shaft or the pull of a winch, and it is off to one side, so a haul drags the entrant against the shaft wall and over the lip at an angle. The retrieval line goes over the tripod's head pulley, straight above the opening.",
    "waist-belt-clip": "You started to clip the retrieval line to the entrant's tool belt. A line on a belt folds an unconscious person in half and can slide up under the ribs, and in a narrow shaft it wedges them. The standard asks for a full-body harness with the line at the centre of the back near shoulder level, so a limp body comes up upright and narrow.",
    "lean-over-hatch": "You leaned over the open structure to see the entrant. That puts your head in the gas coming up the shaft and your centre of gravity over a vertical drop with nothing clipped to you. The attendant watches from beside the opening, on the winch, and talks to the entrant — never over the hole.",
    "leg-on-grating": "You set a tripod foot on the lifted storm grate propped against the curb. A foot on a grate or a loose lid can slip or tip as the load comes on, and a tripod with one leg moving drops its head and everything hanging from it. Each foot goes on solid, level ground, legs chained so they cannot spread.",
  },

  lateNotes: {
    "back-dring": "The line clips to the back D-ring once the harness is on and snug — the harness has to be right before anything is clipped to it.",
    "winch-crank": "The haul is the drill at the end, once the entrant is down and the line is clear.",
    "rescue-log": "The drill is logged once the entrant is out and over the lip, not before.",
  },

  steps: [
    {
      id: "rescue-plan", kind: "select", target: "rescue-plan",
      title: "Read the permit's rescue plan",
      cue: "Read the rescue section of the permit: non-entry retrieval by the attendant with a tripod and winch, the harness and line, and the rescue service named behind it.",
      why: "29 CFR 1910.146 wants retrieval systems used for every entry unless the retrieval equipment would itself make the entry more dangerous or would not help, because most people who die in confined spaces are the ones who go in after somebody. The permit's rescue section is the plan that means nobody has to: the attendant brings the entrant out from outside, and the named rescue service is the backup, not the first move.",
    },
    {
      id: "kit-inspect", kind: "find", noHint: true,
      targets: ["frayed-cable", "missing-leg-pin", "harness-tag-expired"],
      itemNames: { "frayed-cable": "broken wires on the winch cable near the hook", "missing-leg-pin": "a tripod leg pin missing", "harness-tag-expired": "the harness past its inspection date" },
      itemNotes: {
        "frayed-cable": "The winch cable has broken wires just above the snap hook, where it bends over the pulley on every haul. It comes out of service; the spare winch goes on.",
        "missing-leg-pin": "One leg's adjustment pin is missing and a bolt has been pushed in instead. Under load the leg can telescope shut. The pin is replaced before the tripod stands.",
        "harness-tag-expired": "The harness inspection tag is past its date. A harness nobody has inspected is a harness nobody knows the stitching of — take one from the current stock.",
      },
      title: "Inspect the tripod, winch and harness",
      cue: "Three things in this rescue kit should not be used today. Find them before anything is set up.",
      why: "A retrieval system is only a rescue if every part of it holds the first time, because it is used for real only once. ANSI Z359 has users inspect fall protection and rescue equipment before each use and set it aside when it fails; a cable with broken wires, a leg held by the wrong pin and a harness past its inspection each fail quietly until the load comes on.",
    },
    {
      id: "tripod-set", kind: "drag", target: "tripod",
      title: "Stand the tripod over the opening, head centred",
      cue: "Carry the tripod over the structure and set it with its head directly above the centre of the opening and each foot on solid, level ground.",
      why: "A tripod lifts straight up only if its head is over the centre of the opening; set off to one side, a haul drags the entrant against the shaft wall and puts a side load on the legs they were never meant to carry. The feet go on solid, level ground outside the opening's edge, never on the lifted grate or a loose lid, because a foot that moves under load brings the whole head down.",
      drag: { to: "tripod-socket", radius: 0.55, missNote: "Not centred — bring the tripod head directly above the middle of the opening, feet on the solid pad outside the frame." },
    },
    {
      id: "legs-lock", kind: "sequence",
      targets: ["legs-extended", "leg-pins", "foot-chain"],
      itemNames: { "legs-extended": "legs extended to matching holes", "leg-pins": "every leg pin in and clipped", "foot-chain": "foot chain clipped round all three legs" },
      title: "Legs matched, pinned and chained",
      cue: "Extend each leg to the same marked hole, push every leg pin home and clip it, then run the foot chain round all three feet.",
      why: "Legs at different lengths put the head off-level and the load down one leg. Every pin in and clipped stops a leg telescoping under load, and the foot chain stops the legs spreading outward, which is the way a tripod fails when a heavy load comes onto the head. Together they turn three poles into a frame that will hold a person on a winch.",
      outOfOrderNote: "Extend, then pin, then chain — the legs are set to length before they are pinned, and the chain goes on last round feet that are already where they will stay.",
    },
    {
      id: "winch-mount", kind: "sequence",
      targets: ["winch-bracket", "winch-pin", "cable-pulley"],
      itemNames: { "winch-bracket": "winch on the leg bracket", "winch-pin": "bracket pin in and clipped", "cable-pulley": "cable over the head pulley, down the centre" },
      title: "Mount the winch and reeve the cable",
      cue: "Set the winch on its leg bracket, pin and clip it, then run the cable up over the head pulley and down the centre of the opening.",
      why: "The winch is the mechanical retrieval device the standard wants on a vertical space deeper than five feet, because nobody can pull an unconscious adult up a shaft by hand on a rope. It only works mounted on its bracket with the pin in, and with the cable over the head pulley, so the pull is straight up the middle of the opening rather than scraping over the frame's edge.",
      outOfOrderNote: "Bracket, then pin, then reeve — the winch is locked to the leg before any cable is run through the head.",
    },
    {
      id: "load-test", kind: "hold", target: "test-weight", seconds: 6,
      title: "Hang a test weight and prove the brake holds",
      cue: "Hang the test weight on the cable, take your hands off the crank and hold while you watch: the brake must hold it without slipping.",
      why: "A winch brake is what keeps a person on the line when the attendant's hands leave the crank, and it has to be proven under load before a person is on it. A brake that creeps under a test weight will drop an entrant. Holding the test long enough to see it does not move is the difference between a retrieval system and a hope.",
      holdBreakNote: "You broke off the brake test before it had held long enough to see — watch it hold, hands off, before anybody goes on that cable.",
    },
    {
      id: "harness-fit", kind: "sequence",
      targets: ["leg-straps", "chest-strap", "dring-position"],
      itemNames: { "leg-straps": "leg straps snug", "chest-strap": "chest strap at mid-chest", "dring-position": "back D-ring between the shoulder blades" },
      title: "Fit the entrant's full-body harness",
      cue: "Leg straps snug, chest strap across mid-chest, and the back D-ring sitting between the shoulder blades — check it by hand.",
      why: "The harness decides how a person comes up the shaft. Loose leg straps let an unconscious body slide down through it; a chest strap at the throat or the belly chokes or lets them slip out; a D-ring low on the back tips them head-down. Snug, at mid-chest and between the shoulder blades, the harness lifts a limp body upright and narrow, which is what fits up the opening.",
      outOfOrderNote: "Legs, then chest, then check the D-ring — the ring only sits right once the straps under it are snug.",
    },
    {
      id: "attach-before-entry", kind: "select", target: "back-dring",
      title: "Clip the retrieval line to the back D-ring before entry",
      cue: "Clip the winch cable's snap hook to the entrant's back D-ring, check the gate is closed and locked, before their boots cross the opening.",
      why: "The line goes on before entry because afterward there is no reaching the entrant to put it on — the moment it is needed is the moment the entrant cannot help. 1910.146 describes exactly where it goes: at the centre of the back near shoulder level, or above the head. The attendant checks the gate by hand, because the attendant is the one who will be relying on it.",
    },
    {
      id: "entrant-lower", kind: "track", target: "winch-tend", seconds: 7,
      title: "Tend the cable as the entrant climbs down",
      cue: "As the entrant climbs down the ladder, pay out on the winch to keep light tension on the line — never slack, never hauling them off the rungs.",
      why: "The retrieval line is only a rescue if it is ready at every moment of the climb. Tended with light tension, it catches a slip after a few centimetres; allowed to go slack, a slip becomes a drop and a shock load on a harness in a narrow shaft. Too tight and it pulls the entrant off the rungs. The attendant pays out at the entrant's pace, talking to them.",
      track: { start: 0.12, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.12, label: "LINE", readout: (v) => (v < 0.4 ? "slack — take up" : v > 0.62 ? "tight — pulling off the rungs" : "light tension") },
      holdBreakNote: "The line went slack or tight. Take up or pay out until it is light tension again, and match the entrant's pace.",
    },
    {
      id: "line-clear", kind: "find", noHint: true,
      targets: ["cable-on-edge", "hose-over-cable"],
      itemNames: { "cable-on-edge": "the cable rubbing the frame edge", "hose-over-cable": "a jetter hose looped over the cable" },
      itemNotes: {
        "cable-on-edge": "The cable has drifted against the structure's steel frame as the entrant moved sideways at the bottom. Under a haul it would saw on that edge. It is brought back to the centre and an edge roller goes on.",
        "hose-over-cable": "The jetter hose has been dragged over the retrieval cable. In a haul the cable would drag it — and the jetter — into the opening. It comes off and is run on the far side.",
      },
      title: "Keep the retrieval line clear",
      cue: "Two things are fouling the retrieval line now the entrant is at the bottom. Find them.",
      why: "A retrieval line that was clean at entry does not stay clean: the entrant moves, other crews run hoses, and the line ends up across an edge or under something heavy. The attendant keeps it clear because the haul, when it comes, has to run straight and free on the first turn of the crank, with no time to sort out what is lying across it.",
    },
    {
      id: "drill-haul", kind: "turn", target: "winch-crank",
      title: "Drill: the entrant goes down — crank them out",
      cue: "The entrant signals the drill and goes limp on the line. Call it, then crank the winch steadily to bring them up the shaft — you do not go in.",
      why: "The rescue plan is only proven by doing it, and the drill is where an attendant learns what cranking a real person up a shaft feels like before it matters. The haul is steady and continuous, calling up to the surface crew, with the rescue service called in a real event. At no point does the attendant enter: NIOSH's investigations are full of attendants who did, and became the second body.",
      turn: { turns: 1.5, axis: "x", label: "WINCH CRANK", readout: (t) => (t < 0.5 ? "taking the weight" : t < 1.3 ? "coming up the shaft" : "at the collar") },
    },
    {
      id: "over-the-lip", kind: "drag", target: "entrant-at-collar",
      title: "Bring the entrant over the lip to the landing mat",
      cue: "With the entrant at the collar, guide them clear of the frame's lip onto the landing mat beside the opening — no leaning over the hole.",
      why: "The top of the shaft is where retrieval goes wrong: a limp body catches on the frame's lip, the attendant leans over to free it, and now the attendant is off-balance over the hole. The winch holds the entrant at the collar while the attendant, standing beside the opening, swings them over the edge onto the mat, where first aid starts and the rescue service can take over.",
      drag: { to: "landing-mat", radius: 0.55, missNote: "Not on the landing mat — swing the entrant clear of the lip onto the mat beside the opening, keeping yourself outside the frame." },
    },
    {
      id: "rescue-log", kind: "select", target: "rescue-log",
      title: "Log the drill and the kit findings",
      cue: "Log the drill: time to surface, the slip on the ladder, the tools-on-the-tripod moment, the fouled line, and the frayed cable, leg pin and harness taken out of service.",
      why: "The drill log is the evidence that the rescue plan works for this space with this crew and this kit, and the list of what nearly stopped it: the frayed cable and the wrong pin become equipment orders, the fouled line becomes an edge roller on every job, and the time to surface tells the entry supervisor whether the plan is realistic. It is kept with the permit.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the entry supervisor and the entrant",
      cue: "Radio the entry supervisor that the drill is done and the kit findings are logged, and check in with the entrant about the slip.",
      why: "The entry supervisor decides whether the real entry goes ahead with this rig, and needs the drill result and the findings to make that call. The entrant slipped on the ladder and hung on the line, and the attendant held them; both of them have just rehearsed something frightening, and the member assistance programme is as much for that as for the day it is real.",
    },
  ],

  interrupts: [
    {
      id: "tools-on-tripod",
      kind: "Retrieval rig misused",
      after: "load-test", delay: 2, seconds: 12,
      alert: "A coworker unhooks your test weight and hangs a bucket of jetter fittings on the winch cable to lower it down the hole — 'it's right there, saves a trip'.",
      cue: "Stop them. The retrieval system is for the entrant only — tools go down on the separate tag line.",
      target: "tool-tagline",
      why: "A retrieval winch and cable are rated and inspected for rescuing a person; loading them with tools shock-loads the cable, wears the brake and, worst, means the line may be tied up with a bucket when the entrant needs it. Tools go up and down on their own tag line. Saying so is part of the attendant's job of keeping the rescue ready.",
      missNote: "The bucket went down on the retrieval cable, swung into the shaft wall and jammed the snap hook in its handle. When the entrant went down for the drill, the line had to be cleared before it could be used.",
      wrongNote: "The retrieval cable is being used as a hoist. Get the tools onto the tag line — the winch is for the entrant.",
    },
    {
      id: "rung-slip",
      kind: "Entrant slipped",
      after: "entrant-lower", delay: 2, seconds: 12,
      alert: "The entrant's boot skids off a wet rung halfway down and they drop onto the line, swinging against the shaft wall.",
      cue: "Set the winch brake lever now so the line holds them, then talk them back onto the rungs.",
      target: "winch-brake",
      why: "A tended line catches a slip in a few centimetres, but only if the winch then holds; setting the brake lever locks the drum so the attendant's hands are free and the entrant hangs still while they find the rungs again. It is the moment the whole rig was built for, arriving before the drill.",
      missNote: "Nobody set the brake. The drum paid out under the swinging load until the attendant grabbed the crank, and the entrant dropped another half metre and struck the shaft wall with their shoulder.",
      wrongNote: "The entrant is hanging on the line. Set the winch brake lever — everything else can wait until they are back on the rungs.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CNR_ACCENT);

    // ------------------------------------------------------- the yard pad
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#8f8e88", base2: "#84837d", seam: "rgba(0,0,0,0.2)" }), { repeat: 3, px: 384 });
    const padMat = texturedMat(padTex, { rough: 0.95, color: 0x9a9993 });
    const O = 0.9;                          // opening, square
    const slabs = [
      box(g, 6.2, CNR_PAD, 2.25, 0, CNR_PAD / 2, -2.02, 0xffffff),
      box(g, 6.2, CNR_PAD, 2.25, 0, CNR_PAD / 2, 1.13, 0xffffff),
      box(g, 2.65, CNR_PAD, O, -1.78, CNR_PAD / 2, -0.45, 0xffffff),
      box(g, 2.65, CNR_PAD, O, 1.78, CNR_PAD / 2, -0.45, 0xffffff),
    ];
    for (const s of slabs) s.material = padMat;
    box(g, 6.2, 0.18, 0.18, 0, CNR_PAD + 0.09, 2.2, 0x9aa3ab, { rough: 0.85 });           // curb
    // Frame and the storm structure below.
    const frame = group(g, 0, CNR_PAD, -0.45);
    for (const [dx, dz, w, d] of [[-0.48, 0, 0.06, 1.02], [0.48, 0, 0.06, 1.02], [0, -0.48, 1.02, 0.06], [0, 0.48, 1.02, 0.06]]) box(frame, w, 0.04, d, dx, 0.02, dz, 0x4a4f55, { rough: 0.5, metal: 0.7 });
    const shaft = group(frame, 0, 0, 0);
    for (const [dx, dz, w, d] of [[-0.45, 0, 0.02, 0.9], [0.45, 0, 0.02, 0.9], [0, -0.45, 0.9, 0.02], [0, 0.45, 0.9, 0.02]]) box(shaft, w, 1.7, d, dx, -0.85, dz, 0x3c3a36, { rough: 0.95, cast: false });
    box(shaft, 0.9, 0.02, 0.9, 0, -1.7, 0, 0x22201c, { rough: 0.95, cast: false });
    const inlet = cyl(shaft, 0.2, 0.2, 0.1, 0.42, -1.45, 0, 0x14120f, { rough: 0.95, seg: 16 });
    inlet.rotation.z = Math.PI / 2;
    const ladder = group(shaft, 0, 0, -0.4);
    for (const sx of [-0.14, 0.14]) box(ladder, 0.03, 1.7, 0.03, sx, -0.8, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    for (let i = 0; i < 6; i++) box(ladder, 0.28, 0.02, 0.02, 0, -0.15 - i * 0.26, 0, 0xb9bec4, { rough: 0.4, metal: 0.7 });
    holoTag(frame, "storm junction structure — vertical, deeper than a person", 0, 0.28, 0.62, { css: CNR_CSS, w: 0.8 });
    // The lifted grate propped against the curb.
    const grate = box(g, 0.9, 0.05, 0.9, 1.0, CNR_PAD + 0.45, 1.9, 0x3a3f45, { rough: 0.6, metal: 0.6 });
    grate.rotation.x = -1.25;
    const onGrate = box(g, 0.4, 0.3, 0.3, 1.0, CNR_PAD + 0.5, 1.75, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "tripod foot on the grate?", 1.0, CNR_PAD + 1.05, 1.75, { css: CNR_WARN, w: 0.44 });
    reg(hits, onGrate, "leg-on-grating");

    // ------------------------------------------------------------- tripod
    // Stood on the pad beside the opening; carried over it on the drag.
    const tripod = group(g, -1.9, CNR_PAD, 0.9);
    const legs = [];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      const leg = cyl(tripod, 0.035, 0.045, 2.3, Math.sin(a) * 0.62, 1.1, Math.cos(a) * 0.62, 0xf0b04b, { rough: 0.5, metal: 0.5, seg: 10 });
      leg.rotation.z = -Math.sin(a) * 0.27; leg.rotation.x = Math.cos(a) * 0.27;
      legs.push(leg);
    }
    const head = box(tripod, 0.26, 0.12, 0.26, 0, 2.25, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const pulley = cyl(tripod, 0.07, 0.07, 0.04, 0, 2.15, 0.1, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 14 });
    pulley.rotation.y = Math.PI / 2;
    holoTag(tripod, "tripod", 0, 2.55, 0, { css: CNR_CSS, w: 0.16 });
    reg(hits, tripod, "tripod");
    const socket = box(g, 0.5, 0.3, 0.5, 0, CNR_PAD + 1.2, -0.45, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["tripod-socket"] = socket;
    // Leg marks, pins and the foot chain.
    const legMark = box(tripod, 0.12, 0.2, 0.12, Math.sin(0.5) * 0.52, 0.9, Math.cos(0.5) * 0.52, 0xf0b04b, { opacity: 0.25, transparent: true, cast: false });
    reg(hits, legMark, "legs-extended");
    const pins = box(tripod, 0.1, 0.1, 0.1, Math.sin(2.6) * 0.5, 0.75, Math.cos(2.6) * 0.5, 0xf0b04b, { opacity: 0.25, transparent: true, cast: false });
    reg(hits, pins, "leg-pins");
    const badPin = box(tripod, 0.05, 0.03, 0.05, Math.sin(4.7) * 0.5, 0.75, Math.cos(4.7) * 0.5, 0x8a4a22, { rough: 0.8, metal: 0.4 });
    reg(hits, badPin, "missing-leg-pin");
    const chain = torus(tripod, 0.72, 0.012, 0, 0.06, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 6, seg2: 30 });
    chain.rotation.x = Math.PI / 2;
    chain.visible = false;
    const chainHit = box(tripod, 0.2, 0.1, 0.2, Math.cos(0.5) * 0.7, 0.06, Math.sin(0.5) * 0.7, 0xf0b04b, { opacity: 0.3, transparent: true, cast: false });
    holoTag(tripod, "foot chain", Math.cos(0.5) * 0.7, 0.25, Math.sin(0.5) * 0.7, { css: CNR_CSS, w: 0.2 });
    reg(hits, chainHit, "foot-chain");
    // Winch on its leg bracket.
    const winch = group(tripod, Math.sin(0.5) * 0.45, 1.0, Math.cos(0.5) * 0.45 + 0.08);
    box(winch, 0.2, 0.2, 0.16, 0, 0, 0, 0x2b2f34, { rough: 0.5, metal: 0.5 });
    const drum = cyl(winch, 0.07, 0.07, 0.14, 0, 0, 0.0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 14 });
    drum.rotation.z = Math.PI / 2;
    const crank = group(winch, 0.14, 0, 0);
    box(crank, 0.02, 0.18, 0.02, 0, -0.08, 0, 0x1b1e23, { rough: 0.5 });
    box(crank, 0.1, 0.03, 0.03, 0.04, -0.17, 0, 0xd8232a, { rough: 0.5 });
    const brakeLever = box(winch, 0.03, 0.12, 0.03, -0.12, 0.08, 0.06, 0xf2c14b, { rough: 0.5 });
    holoTag(winch, "winch — crank · brake", 0, 0.24, 0.08, { css: CNR_CSS, w: 0.36 });
    reg(hits, crank, "winch-crank");
    reg(hits, brakeLever, "winch-brake");
    const bracket = box(winch, 0.26, 0.26, 0.2, 0, 0, 0, 0xf0b04b, { opacity: 0.2, transparent: true, cast: false });
    reg(hits, bracket, "winch-bracket");
    const winchPin = box(winch, 0.06, 0.06, 0.06, 0, -0.14, 0.1, 0xf0b04b, { opacity: 0.3, transparent: true, cast: false });
    reg(hits, winchPin, "winch-pin");
    const pulleyHit = box(tripod, 0.22, 0.2, 0.22, 0, 2.15, 0.1, 0xf0b04b, { opacity: 0.25, transparent: true, cast: false });
    reg(hits, pulleyHit, "cable-pulley");
    const cable = cyl(tripod, 0.006, 0.006, 2.2, 0, 1.1, 0.1, 0xdfe4e8, { rough: 0.4, metal: 0.8, seg: 6 });
    cable.visible = false;
    const tend = box(winch, 0.3, 0.3, 0.3, 0, 0, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, tend, "winch-tend");
    // Test weight and the frayed cable end on the kit tarp.
    const weight = group(g, -1.0, CNR_PAD, 1.4);
    cyl(weight, 0.12, 0.12, 0.3, 0, 0.15, 0, 0x4a4f55, { rough: 0.6, metal: 0.6, seg: 14 });
    torus(weight, 0.05, 0.01, 0, 0.34, 0, 0xb9bec4, { rough: 0.4, metal: 0.8, seg: 6, seg2: 14 });
    holoTag(weight, "test weight", 0, 0.5, 0, { css: CNR_CSS, w: 0.22 });
    reg(hits, weight, "test-weight");
    const bucket = group(g, -1.6, CNR_PAD, 1.9);
    cyl(bucket, 0.13, 0.11, 0.28, 0, 0.14, 0, 0xf2a23b, { rough: 0.7, seg: 14 });
    const tarp = box(g, 1.3, 0.01, 0.9, 2.2, CNR_PAD + 0.006, 0.8, 0x2f5f8a, { rough: 0.9, cast: false });
    void tarp;
    const spareCable = hose(g, [[1.7, CNR_PAD + 0.03, 0.6], [2.1, CNR_PAD + 0.03, 0.5], [2.5, CNR_PAD + 0.03, 0.7], [2.3, CNR_PAD + 0.03, 1.0]], 0.008, 0xb9bec4, { steps: 10, rough: 0.4 });
    void spareCable;
    const fray = box(g, 0.12, 0.05, 0.08, 2.3, CNR_PAD + 0.04, 1.0, 0xc08a4a, { rough: 0.8, metal: 0.5 });
    holoTag(g, "winch cable", 2.3, CNR_PAD + 0.2, 1.0, { css: CNR_CSS, w: 0.2 });
    reg(hits, fray, "frayed-cable");
    // Harness on the kit tarp, with its inspection tag.
    const harness = group(g, 2.6, CNR_PAD, 0.3);
    box(harness, 0.3, 0.05, 0.4, 0, 0.03, 0, 0xf2c14b, { rough: 0.8 });
    const hTag = decal(harness, 0.08, 0.1, 0.1, 0.06, 0.1, paperFace("INSPECTED", ["due: past"], { scale: 0.5 }));
    hTag.rotation.x = -Math.PI / 2;
    holoTag(harness, "harness and tag", 0, 0.22, 0, { css: CNR_CSS, w: 0.3 });
    reg(hits, hTag, "harness-tag-expired");
    // The entrant, standing by, then on the ladder.
    const entrant = standingFigure(g, 0.2, 0.55, { ry: Math.PI, cloth: 0x2f6fa8, trousers: 0x23282f, harness: true, atStation: true });
    entrant.position.y = CNR_PAD;
    const legStraps = box(g, 0.3, 0.15, 0.2, 0.2, CNR_PAD + 0.75, 0.55, 0xf0b04b, { opacity: 0.2, transparent: true, cast: false });
    holoTag(g, "legs · chest · D-ring", 0.2, CNR_PAD + 2.0, 0.55, { css: CNR_CSS, w: 0.36 });
    reg(hits, legStraps, "leg-straps");
    const chestStrap = box(g, 0.3, 0.1, 0.2, 0.2, CNR_PAD + 1.3, 0.55, 0xf0b04b, { opacity: 0.2, transparent: true, cast: false });
    reg(hits, chestStrap, "chest-strap");
    const dringCheck = box(g, 0.16, 0.12, 0.1, 0.2, CNR_PAD + 1.45, 0.66, 0xf0b04b, { opacity: 0.2, transparent: true, cast: false });
    reg(hits, dringCheck, "dring-position");
    const dring = box(g, 0.12, 0.1, 0.08, 0.2, CNR_PAD + 1.55, 0.7, 0xf0b04b, { opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "back D-ring — clip here", 0.2, CNR_PAD + 1.75, 0.8, { css: CNR_CSS, w: 0.4 });
    reg(hits, dring, "back-dring");
    const beltClip = box(g, 0.2, 0.1, 0.1, 0.45, CNR_PAD + 1.0, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "clip to the tool belt?", 0.65, CNR_PAD + 1.05, 0.65, { css: CNR_WARN, w: 0.38 });
    reg(hits, beltClip, "waist-belt-clip");
    const collar = box(frame, 0.5, 0.4, 0.5, 0, 0.3, 0, 0xf0b04b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, collar, "entrant-at-collar");
    const mat2 = box(g, 1.0, 0.03, 0.8, -1.4, CNR_PAD + 0.015, -1.7, 0x2f7d4a, { rough: 0.9, cast: false });
    holoTag(g, "landing mat", -1.4, CNR_PAD + 0.2, -1.7, { css: CNR_CSS, w: 0.22 });
    hits["landing-mat"] = mat2;
    // Line fouling (shown once the entrant is down).
    const edgeRub = box(frame, 0.2, 0.1, 0.1, 0.42, 0.05, 0.1, 0xe0664f, { opacity: 0.3, transparent: true, cast: false });
    edgeRub.visible = false;
    reg(hits, edgeRub, "cable-on-edge");
    const jetHose = hose(g, [[2.6, CNR_PAD + 0.03, -1.4], [1.2, CNR_PAD + 0.05, -0.8], [0.2, CNR_PAD + 1.1, -0.35], [-0.6, CNR_PAD + 0.03, -1.3]], 0.025, 0x1b1e23, { steps: 16, rough: 0.6 });
    jetHose.visible = false;
    const hoseHit = box(g, 0.3, 0.3, 0.3, 0.2, CNR_PAD + 1.0, -0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hoseHit, "hose-over-cable");
    // Hazards: handrail anchor, leaning over.
    const rail = group(g, -2.6, CNR_PAD, -1.2);
    for (const z of [-0.6, 0.6]) cyl(rail, 0.025, 0.025, 1.0, 0, 0.5, z, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 8 });
    const railBar = cyl(rail, 0.025, 0.025, 1.2, 0, 1.0, 0, 0xf2c14b, { rough: 0.5, metal: 0.4, seg: 8 });
    railBar.rotation.x = Math.PI / 2;
    holoTag(rail, "anchor the line to the handrail?", 0, 1.25, 0, { css: CNR_WARN, w: 0.54 });
    reg(hits, railBar, "anchor-to-handrail");
    const lean = box(frame, 0.4, 0.3, 0.3, -0.35, 0.9, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(frame, "lean over to look?", -0.5, 1.15, 0.3, { css: CNR_WARN, w: 0.34 });
    reg(hits, lean, "lean-over-hatch");

    // ------------------------------------------ plan, tag line, log, crew
    const plan = holoPanel(g, 0.88, 0.58, 2.3, CNR_PAD + 1.45, -1.3, (ctx, w, h) => {
      ctx.fillStyle = "#1a1408"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = CNR_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f6ecd6";
      ctx.fillText("PERMIT — RESCUE PLAN", w * 0.05, h * 0.12);
      ctx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; ctx.fillStyle = "#eadcbc";
      ["Space: storm junction structure, vertical", "Rescue: non-entry, by the attendant", "Rig: tripod over opening, winch on leg", "Harness: full body, line on back D-ring", "Line on before entry — tools on tag line", "Backup: rescue service, as named", "Drill before first entry of the day"].forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.27 + i * 0.1)));
    }, { accent: CNR_ACCENT, ry: -0.8 });
    reg(hits, plan, "rescue-plan");
    const toolLine = tagLine(g, -2.1, CNR_PAD, 0.1, { ry: 0.4 });
    holoTag(g, "tool tag line", -2.1, CNR_PAD + 0.3, 0.1, { css: CNR_CSS, w: 0.26 });
    reg(hits, toolLine, "tool-tagline");
    const logDesk = group(g, 1.3, CNR_PAD, 1.7, -0.3);
    box(logDesk, 0.6, 0.72, 0.4, 0, 0.36, 0, 0x6b5a48, { rough: 0.7 });
    const log = decal(logDesk, 0.26, 0.3, -0.1, 0.725, 0, paperFace("RESCUE DRILL LOG", ["Time to surface", "Events", "Kit out of service"], { scale: 0.7 }));
    log.rotation.x = -Math.PI / 2;
    reg(hits, log, "rescue-log");
    const crewRadio = radio(logDesk, 0.16, 0.72, 0.05, { ry: -0.3 });
    holoTag(logDesk, "radio — supervisor", 0.1, 1.05, 0.05, { css: CNR_CSS, w: 0.34 });
    reg(hits, crewRadio, "crew-radio");
    hardHatLamp(logDesk, -0.12, 0.72, -0.1, { ry: 0.6 });
    const coworker = standingFigure(g, -2.7, 1.8, { ry: 2.3, cloth: 0xf2a23b, trousers: 0x2b3138, vest: 0xd8e84a });
    coworker.position.y = CNR_PAD;
    for (const [x, z] of [[2.8, -2.6], [-2.8, -2.6]]) cone(g, x, z).position.y = CNR_PAD;
    // The crew's utility pickup on the service road behind the yard, and a
    // barrier panel closing the walk past the open structure.
    pickup(g, -0.4, 0, -4.4, { ry: Math.PI / 2 });
    barrierPanel(g, 0.9, -2.5, { ry: 0.1 }).position.y = CNR_PAD;

    let depth = 0, lift = 0;
    const tripodHome = tripod.position.clone();
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 0.9, -0.4),
      onStepComplete(step) {
        if (step.id === "kit-inspect") { fray.visible = false; badPin.material = mat(0xb9bec4, { rough: 0.4, metal: 0.8 }); hTag.visible = false; }
        if (step.id === "tripod-set") tripod.position.set(0, CNR_PAD, -0.45);
        if (step.id === "legs-lock") { chain.visible = true; legMark.visible = false; pins.visible = false; chainHit.visible = false; }
        if (step.id === "winch-mount") { cable.visible = true; bracket.visible = false; winchPin.visible = false; pulleyHit.visible = false; }
        if (step.id === "load-test") weight.position.set(-1.0, CNR_PAD, 1.4);
        if (step.id === "entrant-lower") { edgeRub.visible = true; jetHose.visible = true; }
        if (step.id === "line-clear") { edgeRub.visible = false; jetHose.visible = false; hoseHit.visible = false; }
        if (step.id === "over-the-lip") { entrant.position.set(-1.4, CNR_PAD + 0.12, -1.7); entrant.rotation.set(0, 0, 1.5); }
      },
      onInterrupt(it) {
        if (it.id === "tools-on-tripod") { bucket.position.set(0, CNR_PAD + 1.2, -0.35); }
        if (it.id === "rung-slip") { entrant.position.y -= 0.25; entrant.rotation.z = 0.35; }
      },
      onInterruptEnd(it) {
        if (it.id === "tools-on-tripod" && it.resolved === "answered") bucket.position.set(-2.1, CNR_PAD, 0.5);
        if (it.id === "rung-slip" && it.resolved === "answered") { brakeLever.rotation.z = 0.9; entrant.position.y += 0.25; entrant.rotation.z = 0; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "entrant-lower" && session.holding) {
          depth = Math.min(1, depth + dt / 7);
          entrant.position.set(0, CNR_PAD - depth * 1.5, -0.55);
        }
        if (step?.id === "drill-haul" && session.turn) {
          lift = Math.min(1, (session.turn.amount ?? 0) / (session.turn.required || 1.5));
          entrant.position.set(0, CNR_PAD - 1.5 + lift * 1.6, -0.55);
          crank.rotation.x = lift * 20;
        }
        void tripodHome; void repaint; void signFace; void head;
      },
    };
  },
};
