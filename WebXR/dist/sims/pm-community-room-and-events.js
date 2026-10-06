import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, cylinderTank,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Community Room & Events VR — Building Systems & Facilities,
// property management zone fifteen.
//
// The residents' community room on a Saturday: a birthday party for sixty,
// a DJ table, balloons, a kitchenette and a partition wall that opens the
// room to its full size. Set up by the building's staff to the room's
// posted occupant load, aisles and exits, with the detectors and strobes
// left uncovered, the host briefed on the way out, and the door counted as
// guests arrive. Generic building — only the codes, standards and unions are
// named.

const PMCR_ACCENT = 0xb88ad8;
const PMCR_CSS = "#b88ad8";
const PMCR_WARN = "#f0645b";

export const SIM_PM_COMMUNITY_ROOM_AND_EVENTS = {
  id: "pm-community-room-and-events",
  index: "231",
  domain: "Building Systems & Facilities",
  trade: "Residential events and hospitality staff — UNITE HERE, with SEIU building staff setting the room and the apartment association's CAM-credentialed manager signing off",
  category: "Building Systems & Facilities",
  indoor: "hotel",
  certification: "NFPA 101 occupant load, aisle widths and panic hardware for an assembly room; NFPA 72 for the detectors and notification appliances decorations must never cover; OSHA 29 CFR 1910.36 exit routes and 29 CFR 1910.38 the building's emergency action plan; 29 CFR 1910.157 portable extinguishers; 29 CFR 1910.305 and the NEC for temporary cords at a DJ table; the Fair Housing Act for equal access to the community room; UNITE HERE residential hospitality training, SEIU building staff and the apartment association's CAM credential",
  name: "Community Room & Events",
  title: simTitle("Community Room & Events"),
  tagline: "A Saturday party for sixty: the room set to its posted load, aisles and exits clear, detectors and strobes left uncovered, the host briefed, and the door counted as guests arrive",
  accent: PMCR_ACCENT,
  accentCss: PMCR_CSS,
  parSeconds: 290,
  footprint: 2.5,
  badge: { id: "full-house", name: "Full House, Clear Exits", note: "Set to the posted load, every exit and detector clear, and the count held under the sign all night" },

  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Community Room",
    currency: "GUESTS",
    ranks: ["Houseman", "Setup Lead", "Events Captain", "Events Manager", "Community Room Certified"],
    badges: [
      { id: "true-aisle", name: "True Aisle", note: "Aisle width read inside the band first time", test: AWARD.stepClean("measure-aisle") },
      { id: "nothing-covered", name: "Nothing Covered", note: "No unsafe act anywhere in the set", test: AWARD.safe },
      { id: "under-the-sign", name: "Under the Sign", note: "Held the door count under the posted load", test: AWARD.stepClean("count-door") },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections across the whole event", test: AWARD.clean },
      { id: "steady-door", name: "Steady Door", note: "Held the door count without breaking the band", test: AWARD.unbroken },
      { id: "doors-on-time", name: "Doors On Time", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "daisy-chain-strips": "You plugged the DJ's power strip into another power strip. Chained strips put a whole sound rig through one strip's cord and one wall receptacle; the cord heats where nobody is looking, under a table skirt, and the first sign is smoke at the back of a crowded room.",
    "chair-as-ladder": "You stood on a folding chair to tape the banner to the ceiling. Folding chairs fold — sideways, under an off-centre foot — and a fall onto a table edge from that height is a head injury. The step ladder is in the storage alcove for exactly this.",
    "propped-fire-door": "You wedged the corridor fire door open so guests could carry food in. That door is part of the building's fire separation and it only works closed: propped, it lets smoke from anywhere in the corridor into a room with sixty people and a single other exit.",
    "candle-near-drape": "You lit the centrepiece candles on the table right under the drape. Open flame a hand's width from fabric is how community-room fires start, and most building rules — and fire marshals — ban it for exactly that reason; the battery candles in the box look the same from across the room.",
  },

  lateNotes: {
    "door-count": "Not yet — the door is counted once guests start arriving, after the host has been briefed on the exits.",
    "hvac-dial": "Set the room's ventilation once the room is full and the kitchenette is checked — not before the doors open.",
  },

  steps: [
    {
      id: "read-event-sheet", kind: "select", target: "event-sheet",
      title: "Read the reservation and event sheet",
      cue: "Check the guest count, the DJ, the decorations and the food against the room's rules.",
      why: "The event sheet is where the resident's plans meet the room's limits: sixty guests against the posted occupant load, a DJ rig against the circuits, balloons and a banner against the detectors in the ceiling. Reservation rules apply the same way to every household — the Fair Housing Act reaches common areas — so the same checklist goes for a child's birthday as for the residents' association meeting.",
    },
    {
      id: "walk-life-safety", kind: "find", noHint: true,
      targets: ["covered-smoke-detector", "strobe-blocked"],
      itemNames: { "covered-smoke-detector": "bag taped over the smoke detector", "strobe-blocked": "banner hung across the horn-strobe" },
      itemNotes: {
        "covered-smoke-detector": "Somebody has taped a plastic bag over the smoke detector so a smoke machine will not set it off. With it covered, a real fire in this room reaches the corridor before the building knows.",
        "strobe-blocked": "The party banner hangs straight across the horn-strobe. A resident who cannot hear the alarm over the music — or cannot hear at all — depends on that strobe being seen.",
      },
      title: "Walk the room's fire alarm devices",
      cue: "Find the alarm devices the decorations have already defeated.",
      why: "NFPA 72 puts a detector and a notification appliance in an assembly room for the one night the room is full and loud. Party decorations are the commonest way they get defeated — a bag over the detector for the smoke machine, a banner across the strobe — and neither shows up on the fire panel as a fault.",
    },
    {
      id: "open-partition", kind: "turn", target: "partition-crank",
      title: "Open the operable partition to full width",
      cue: "Crank the partition wall fully open and seat it in its pocket.",
      why: "The posted occupant load assumes the room at full size, with the partition stacked in its pocket and both halves' exits usable. A partition half-open leaves a folded panel swinging into the room at head height and cuts off one of the exits the sign was calculated for — and its hinges are a pinch point for anyone's fingers while it moves.",
      turn: { turns: 1.0, axis: "z", label: "PARTITION CRANK" },
    },
    {
      id: "clear-exit-path", kind: "drag", target: "chair-cart",
      title: "Move the chair cart off the exit path",
      cue: "Roll the empty chair cart from the exit path into the storage alcove.",
      why: "An exit route is only a route if it is clear all the way to the door, and a chair cart left in it is the thing a crowd piles up against in the dark. OSHA's exit-route rule and the Life Safety Code say the same thing in different words: nothing stored in the path, whatever the event.",
      drag: { to: "storage-alcove-slot", radius: 0.55, missNote: "Not in the alcove — a cart parked anywhere near the exit path is still in it when the lights go out." },
    },
    {
      id: "power-dj", kind: "sequence",
      targets: ["cord-inspect", "gfci-outlet", "cord-cover"],
      itemNames: { "cord-inspect": "cord inspected for damage", "gfci-outlet": "plugged into the wall GFCI", "cord-cover": "cord cover laid over the run" },
      title: "Run power to the DJ table",
      cue: "Inspect the cord, plug it straight into the wall GFCI receptacle, then lay the cord cover over the run.",
      why: "A temporary cord is exactly that, and the wiring rule sets its limits: inspected for damage, plugged into a receptacle rather than another strip, and never run under a rug or through a doorway where it is crushed. The cord cover over the run is what turns a trip hazard across an aisle into a floor people walk over without noticing.",
      outOfOrderNote: "Inspect, plug in, then cover — a cord covered before it is inspected hides the damage you were meant to find.",
    },
    {
      id: "measure-aisle", kind: "gauge", target: "aisle-tape",
      title: "Measure the aisle between the table rows",
      cue: "Run the tape across the aisle and commit when it reads inside the width the code asks for.",
      why: "Aisles are sized for a crowd moving to the exits at once, not for a waiter with a tray, and every table pulled six inches closer to fit a centrepiece takes width off the one path everyone will use. The Life Safety Code sets the minimum for a room like this; the tape is how you know the set still meets it after the host's cousins have rearranged it.",
      gauge: { label: "AISLE WIDTH", speed: 0.55, green: [0.6, 0.85], readout: (t) => `${Math.round(t * 72)} in`, missNote: "Outside the band — too narrow for a crowd to move to the exits, or you measured across the wrong gap. Read it again." },
    },
    {
      id: "test-panic-bar", kind: "hold", target: "exit-door-bar", seconds: 4,
      title: "Test the exit door's panic bar",
      cue: "Push the panic bar and hold until the door opens and swings back to latch.",
      why: "A room this full needs doors that open with a push from a crowd, not a key or a handle, and the panic bar has to release every time and let the door close and latch behind the last person out. Held through a full cycle, the test proves both halves — the release and the closer — which a glance at the hardware cannot.",
      holdBreakNote: "You let go before the door swung back and latched. A door that opens but does not close again is half a test — hold it through the cycle.",
    },
    {
      id: "brief-host", kind: "select", target: "host-brief",
      title: "Brief the host on the exits and the plan",
      cue: "Show the host both exits, the extinguisher and the muster point, and who to call.",
      why: "The host is the one person who can get sixty of their own guests moving when an alarm sounds, and they can only do it if they know where the exits and the muster point are before the music starts. The building's emergency action plan reaches a resident's event through that two-minute conversation, or it does not reach it at all.",
    },
    {
      id: "count-door", kind: "track", target: "door-count", seconds: 7,
      title: "Count the door as guests arrive",
      cue: "Keep the running count under the posted occupant load as guests come in.",
      why: "The posted occupant load is a life-safety number worked out from the room's exits and floor area, and it is only real if somebody is counting. A party that grows past the sign by word of mouth is the ordinary way a room ends up with more people than its doors can empty in time.",
      track: { start: 0.25, green: [0.35, 0.7], rise: 0.44, fall: 0.38, drift: 0.12, label: "DOOR COUNT", readout: (v) => (v < 0.35 ? "count lagging" : v > 0.7 ? "over the sign" : "under the load") },
      holdBreakNote: "The count left the band. Over the sign is a room its exits were not sized for — hold the door until it comes back under.",
    },
    {
      id: "walk-kitchenette", kind: "find", noHint: true,
      targets: ["cord-over-sink", "blocked-extinguisher"],
      itemNames: { "cord-over-sink": "slow cooker cord draped over the sink", "blocked-extinguisher": "extinguisher hidden behind the gift table" },
      itemNotes: {
        "cord-over-sink": "A slow cooker's cord runs across the edge of the sink with the tap running beside it. Water and a live cord meet at the exact spot a guest will reach to rinse a plate.",
        "blocked-extinguisher": "The gift table has been pushed in front of the extinguisher cabinet. Nobody reaching for it in a hurry will find it behind a pile of presents.",
      },
      title: "Walk the kitchenette",
      cue: "Find what the food set-up has put in the way or in the water.",
      why: "The kitchenette is where a party's electrical load, water and heat all end up in one small corner, set up by guests who have never seen the building's rules. Portable extinguishers have to be visible and reachable, and cords have to stay away from sinks — two rules that the first half hour of any party usually breaks.",
    },
    {
      id: "set-ventilation", kind: "turn", target: "hvac-dial",
      title: "Set the room's ventilation for a full room",
      cue: "Turn the room controller to occupied mode for the head count.",
      why: "Sixty people, a DJ rig and a kitchenette put more heat, moisture and exhaled air into the room than its setback mode was ever meant to handle. Switching the room controller to occupied mode brings in the outside air a full room needs, before it gets stuffy enough that somebody props the fire door open for air.",
      turn: { turns: 0.5, axis: "z", label: "ROOM MODE" },
    },
    {
      id: "crew-checkin", kind: "select", target: "houseman-checkin",
      title: "Check in with the houseman",
      cue: "Hand over the partition, the spill and the fire door, and ask how the houseman is doing.",
      why: "The UNITE HERE houseman who breaks the room down tonight needs to know the partition's crank sticks and the fire door was propped once already, so the strike does not undo the set. A long Saturday on your feet with a crowd is also worth a question about how they are actually doing — asked in person, not left to a group text.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the event in the building log",
      cue: "Log the head count, the devices uncovered, the spill, the cylinder and the door test.",
      why: "The building log is the record that the room was set to its load and its devices were working, which matters to the manager, the insurer and the fire marshal if anything goes wrong at the next event. It is also where a pattern shows — the detector bagged at every party — that turns into a rule change instead of a repeat.",
    },
  ],

  interrupts: [
    {
      id: "helium-tip",
      kind: "Helium cylinder tipping",
      after: "test-panic-bar", delay: 3, seconds: 12,
      alert: "The balloon vendor's helium cylinder, standing loose by the wall, is rocking — a guest's chair has bumped it and it is starting to tip.",
      cue: "Chain the cylinder to the wall bracket. Don't try to catch a falling cylinder by its valve.",
      target: "cylinder-chain",
      why: "A compressed gas cylinder that falls can snap its valve off, and a cylinder with a broken valve becomes a projectile across a room full of people. Chained upright to a bracket it cannot fall at all — which is why every cylinder in the building is secured, a balloon vendor's included.",
      missNote: "The cylinder rocked the whole window with nobody securing it. The next bump brings it down, valve first, in a room full of guests.",
      wrongNote: "That doesn't secure it. The chain on the wall bracket is what holds the cylinder upright.",
    },
    {
      id: "punch-spill",
      kind: "Spill in the aisle",
      after: "count-door", delay: 3, seconds: 12,
      alert: "A tray of punch goes over in the main aisle just inside the door — a sticky puddle right where the arriving guests are walking.",
      cue: "Get the spill kit: wet-floor sign down first, then mop. Keep an eye on the door.",
      target: "spill-kit",
      why: "A spill in the busiest aisle of a crowded room is a fall waiting for the next guest, and in a room full of people carrying plates and children it will not wait long. The wet-floor sign goes down first to hold people off while it is mopped, because a mop in progress with no sign is still a slip.",
      missNote: "The puddle sat in the aisle the whole window. Guests walked through it — the room's slip-and-fall is now a question of when, not if.",
      wrongNote: "That doesn't deal with the spill. The spill kit by the kitchenette has the sign and the mop.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, -0.5);
    stationPad(g, 2.5, PMCR_ACCENT);

    // ------------------------------------------------------------ floor: carpet tiles and a dance floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#4a4a5e", base2: "#434356", seam: "rgba(0,0,0,0.12)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.4, 0.02, 5.0, 0, 0.011, -0.2, 0x4a4a5e, { rough: 0.95 });
    floor.material = texturedMat(floorTex, { rough: 0.95, metal: 0.0, color: 0x5a5a70 });
    const danceTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8a6a4a", base2: "#7a5c40", seam: "rgba(40,24,10,0.4)" }), { repeat: 2, px: 256 });
    const dance = box(g, 1.8, 0.02, 1.4, 1.6, 0.025, -1.4, 0x8a6a4a, { rough: 0.5 });
    dance.material = texturedMat(danceTex, { rough: 0.5, metal: 0.05, color: 0xb08a64 });

    // ------------------------------------------------------------ tables and chairs, two rows
    const tableCol = 0xf2eee6;
    for (const row of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        const t = group(g, -1.9 + i * 1.0, 0, 0.0 + row * 0.75);
        cyl(t, 0.38, 0.38, 0.04, 0, 0.74, 0, tableCol, { rough: 0.8, seg: 18 });
        cyl(t, 0.04, 0.04, 0.72, 0, 0.36, 0, 0x8b929a, { rough: 0.5, metal: 0.5, seg: 8 });
        for (let c = 0; c < 2; c++) {
          const a = c * Math.PI + (row > 0 ? 0.3 : -0.3);
          const ch = group(t, Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5, a);
          box(ch, 0.4, 0.04, 0.4, 0, 0.44, 0, 0x6a4a8a, { rough: 0.7 });
          box(ch, 0.4, 0.4, 0.04, 0, 0.66, 0.2, 0x6a4a8a, { rough: 0.7 });
        }
      }
    }
    // Centrepiece candles (hazard) under the drape at the end table.
    const drape = box(g, 1.2, 1.8, 0.03, -2.9, 1.5, 0.75, 0xd8c0e8, { rough: 0.9 });
    drape.rotation.y = Math.PI / 2;
    const candles = group(g, -2.0, 0.76, 0.75);
    for (let i = 0; i < 3; i++) cyl(candles, 0.02, 0.02, 0.1, -0.06 + i * 0.06, 0.05, 0, 0xfff4e0, { rough: 0.6, seg: 8 });
    holoTag(candles, "light the candles?", 0, 0.28, 0, { css: PMCR_WARN, w: 0.32 });
    reg(hits, candles, "candle-near-drape");
    // The aisle tape between the rows.
    const aisle = group(g, -0.9, 0.05, 0.0);
    const tape = instrument(aisle, 0, 0.0, 0, { idle: "-- in", color: 0xf2c14b, w: 0.12, d: 0.16 });
    box(aisle, 0.02, 0.005, 0.7, 0, 0.0, 0, 0xf2c14b, { rough: 0.5 });
    reg(hits, tape, "aisle-tape");
    holoTag(aisle, "aisle tape", 0, 0.22, 0, { css: PMCR_CSS, w: 0.2 });

    // ------------------------------------------------------------ ceiling devices: detector and horn-strobe, banner
    const detector = group(g, -0.9, 2.9, -0.6);
    cyl(detector, 0.08, 0.08, 0.04, 0, 0, 0, 0xf0f2f4, { rough: 0.5, seg: 16 });
    const bag = ball(detector, 0.12, 0, -0.06, 0, 0xe8eef2, { rough: 0.2, opacity: 0.6, transparent: true, seg: 12 });
    reg(hits, detector, "covered-smoke-detector");
    holoTag(g, "smoke detector", -0.9, 2.62, -0.58, { css: PMCR_CSS, w: 0.26 });
    const strobe = group(g, 0.4, 2.2, -2.4);
    box(strobe, 0.16, 0.2, 0.06, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    box(strobe, 0.1, 0.05, 0.02, 0, -0.04, 0.035, 0xf4f4f0, { rough: 0.3, emissive: 0xffffff, ei: 0.2 });
    const banner = decal(g, 1.6, 0.35, 0.4, 2.2, -2.34, signFace("HAPPY 8TH BIRTHDAY MAYA!", { bg: "#f2c14b", accent: "#b88ad8", fg: "#3a2a4a", scale: 0.4 }), { px: 512 });
    reg(hits, banner, "strobe-blocked");
    // The folding chair someone is standing on to tape the banner.
    const ladderChair = group(g, 1.3, 0, -2.0, 0.3);
    box(ladderChair, 0.4, 0.04, 0.4, 0, 0.44, 0, 0x6a4a8a, { rough: 0.7 });
    box(ladderChair, 0.4, 0.4, 0.04, 0, 0.66, -0.2, 0x6a4a8a, { rough: 0.7 });
    for (const sx of [-1, 1]) box(ladderChair, 0.03, 0.44, 0.03, sx * 0.18, 0.22, 0.18, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(ladderChair, "stand on it to reach?", 0, 0.9, 0, { css: PMCR_WARN, w: 0.36 });
    reg(hits, ladderChair, "chair-as-ladder");

    // ------------------------------------------------------------ operable partition and crank
    const partition = group(g, 2.95, 0, -0.2, -Math.PI / 2);
    const panels = [];
    for (let i = 0; i < 4; i++) {
      const p = box(partition, 0.6, 2.4, 0.08, -0.9 + i * 0.6, 1.2, 0, 0xd8d0c4, { rough: 0.8 });
      p.rotation.y = i % 2 ? 0.25 : -0.25;
      panels.push(p);
    }
    box(partition, 2.6, 0.06, 0.12, 0, 2.45, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    const crank = group(partition, 1.3, 1.1, 0.12);
    cyl(crank, 0.04, 0.04, 0.05, 0, 0, 0, 0x3a4450, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const crankArm = box(crank, 0.12, 0.02, 0.02, 0.06, 0, 0.03, 0xf2c14b, { rough: 0.5 });
    reg(hits, crank, "partition-crank");
    holoTag(partition, "partition crank", 1.3, 1.32, 0.12, { css: PMCR_CSS, w: 0.28 });

    // ------------------------------------------------------------ exits, fire door, chair cart, alcove
    const exitDoor = group(g, -1.0, 0, -2.6);
    box(exitDoor, 1.0, 2.1, 0.06, 0, 1.05, 0, 0x6a5a4a, { rough: 0.7 });
    const bar = box(exitDoor, 0.8, 0.06, 0.08, 0, 1.0, 0.06, 0xc7cdd2, { rough: 0.3, metal: 0.8 });
    reg(hits, bar, "exit-door-bar");
    decal(exitDoor, 0.34, 0.14, 0, 2.3, 0.04, signFace("EXIT", { bg: "#0d1c14", accent: "#59c97b", scale: 0.55 }), { glow: true, ei: 0.7, px: 128 });
    holoTag(exitDoor, "panic bar", 0.3, 1.18, 0.08, { css: PMCR_CSS, w: 0.2 });
    const fireDoor = group(g, -3.0, 0, -1.4, Math.PI / 2);
    const fdLeaf = group(fireDoor, -0.45, 0, 0);
    box(fdLeaf, 0.9, 2.1, 0.06, 0.45, 1.05, 0, 0x8a4a3a, { rough: 0.6 });
    fdLeaf.rotation.y = -0.9;
    const wedge = group(fireDoor, 0.2, 0.02, 0.5);
    box(wedge, 0.1, 0.04, 0.16, 0, 0.02, 0, 0x8a6a3a, { rough: 0.8 });
    holoTag(fireDoor, "wedge it open?", 0.2, 0.3, 0.5, { css: PMCR_WARN, w: 0.28 });
    reg(hits, wedge, "propped-fire-door");
    decal(fireDoor, 0.4, 0.12, 0, 2.3, 0.04, signFace("FIRE DOOR · KEEP CLOSED", { bg: "#1b1e22", accent: "#d8232a", scale: 0.4 }), { px: 256 });
    const cart = group(g, -0.2, 0, -1.8);
    box(cart, 0.9, 0.06, 0.5, 0, 0.18, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(cart, 0.42, 0.05, 0.42, 0, 0.26 + i * 0.07, 0, 0x6a4a8a, { rough: 0.7 });
    reg(hits, cart, "chair-cart");
    holoTag(cart, "chair cart in the exit path", 0, 0.8, 0, { css: PMCR_CSS, w: 0.44 });
    const alcove = group(g, 2.4, 0, 1.6);
    box(alcove, 1.2, 2.2, 0.06, 0, 1.1, 0.5, 0xcfc6b8, { rough: 0.8 });
    box(alcove, 0.06, 2.2, 1.0, 0.6, 1.1, 0, 0xcfc6b8, { rough: 0.8 });
    const alcoveSlot = box(alcove, 0.9, 0.1, 0.6, 0, 0.1, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["storage-alcove-slot"] = alcoveSlot;
    holoTag(alcove, "storage alcove", 0, 1.4, 0.45, { css: PMCR_CSS, w: 0.28 });
    const stepLadder = group(alcove, 0.35, 0, 0.25);
    for (const sx of [-1, 1]) box(stepLadder, 0.03, 1.2, 0.03, sx * 0.18, 0.6, 0, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 4; i++) box(stepLadder, 0.38, 0.03, 0.08, 0, 0.25 + i * 0.28, 0, 0xf2c14b, { rough: 0.5 });

    // ------------------------------------------------------------ DJ table and power
    const dj = group(g, 1.6, 0, -2.25);
    box(dj, 1.2, 0.05, 0.5, 0, 0.78, 0, 0x1b1e22, { rough: 0.5 });
    box(dj, 1.2, 0.74, 0.02, 0, 0.4, 0.25, 0x2b2b3a, { rough: 0.9 });
    for (const sx of [-1, 1]) box(dj, 0.3, 0.9, 0.3, sx * 0.8, 0.45, 0, 0x22262b, { rough: 0.6 });
    box(dj, 0.5, 0.08, 0.3, 0, 0.85, 0, 0x3a4450, { rough: 0.4 });
    const cordReel = group(dj, -0.3, 0.05, 0.45);
    torus(cordReel, 0.1, 0.03, 0, 0.05, 0, 0xf28c2a, { rough: 0.6, seg: 8, seg2: 18 }).rotation.x = Math.PI / 2;
    reg(hits, cordReel, "cord-inspect");
    const gfci = group(g, 0.8, 0.45, -2.57);
    box(gfci, 0.1, 0.16, 0.03, 0, 0, 0, 0xf0f2f4, { rough: 0.5 });
    box(gfci, 0.03, 0.02, 0.02, 0, 0.03, 0.02, 0xd8232a, { rough: 0.5 });
    reg(hits, gfci, "gfci-outlet");
    holoTag(g, "wall GFCI", 0.8, 0.65, -2.55, { css: PMCR_CSS, w: 0.2 });
    const cordCover = box(g, 0.14, 0.03, 1.1, 1.1, 0.03, -1.6, 0xf2c14b, { rough: 0.6 });
    reg(hits, cordCover, "cord-cover");
    const strips = group(dj, 0.45, 0.05, 0.4);
    box(strips, 0.3, 0.04, 0.06, 0, 0.02, 0, 0x22262b, { rough: 0.5 });
    box(strips, 0.3, 0.04, 0.06, 0.1, 0.02, 0.1, 0x22262b, { rough: 0.5 });
    holoTag(strips, "strip into strip?", 0, 0.22, 0.05, { css: PMCR_WARN, w: 0.3 });
    reg(hits, strips, "daisy-chain-strips");

    // ------------------------------------------------------------ kitchenette, extinguisher, spill kit, gift table
    const kitchen = group(g, -2.6, 0, -2.2);
    box(kitchen, 1.2, 0.9, 0.55, 0, 0.45, 0, 0xcfc6b8, { rough: 0.7 });
    box(kitchen, 1.24, 0.04, 0.6, 0, 0.92, 0, 0x3a3a3a, { rough: 0.3 });
    box(kitchen, 0.4, 0.05, 0.32, -0.25, 0.9, 0, 0x9aa2a8, { rough: 0.2, metal: 0.8 });
    const cooker = group(kitchen, 0.3, 0.94, 0.0);
    cyl(cooker, 0.13, 0.12, 0.18, 0, 0.09, 0, 0x5a3a2a, { rough: 0.5, seg: 14 });
    const sinkCord = hose(kitchen, [[0.3, 1.0, 0.05], [0.05, 0.96, 0.1], [-0.25, 0.93, 0.1], [-0.45, 0.6, 0.3]], 0.008, 0x22262b, { steps: 12 });
    reg(hits, sinkCord, "cord-over-sink");
    const extCab = group(g, -1.8, 0, -2.5);
    box(extCab, 0.3, 0.6, 0.16, 0, 1.0, 0, 0xd8232a, { rough: 0.5 });
    cylinderTank(extCab, 0, 0.1, 0xd8232a, { plateLabel: "EXTINGUISHER", plateLines: ["ABC · 10 LB"], plate: false, gauge: false }).scale.set(0.8, 0.5, 0.8);
    const gifts = group(g, -1.8, 0, -2.1);
    box(gifts, 0.9, 0.05, 0.45, 0, 0.72, 0, 0xf2eee6, { rough: 0.8 });
    for (const sx of [-1, 1]) box(gifts, 0.04, 0.72, 0.4, sx * 0.42, 0.36, 0, 0x8b929a, { rough: 0.5 });
    for (let i = 0; i < 4; i++) box(gifts, 0.18, 0.14 + (i % 2) * 0.08, 0.16, -0.3 + i * 0.2, 0.82, 0, [0xe86a8a, 0x6ab8e8, 0xf2c14b, 0x8ad86a][i], { rough: 0.6 });
    reg(hits, gifts, "blocked-extinguisher");
    const spillKit = group(g, -2.9, 0, -0.5);
    cyl(spillKit, 0.18, 0.16, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 12 });
    cyl(spillKit, 0.015, 0.015, 1.2, 0.12, 0.6, 0, 0x8b929a, { rough: 0.5, seg: 6 });
    reg(hits, spillKit, "spill-kit");
    holoTag(spillKit, "spill kit", 0, 0.72, 0, { css: PMCR_CSS, w: 0.2 });
    const wetSign = group(g, 0.2, 0, 1.2);
    for (const s of [-1, 1]) { const leaf = box(wetSign, 0.3, 0.6, 0.02, 0, 0.3, s * 0.08, 0xf2c14b, { rough: 0.5 }); leaf.rotation.x = s * 0.25; }
    wetSign.visible = false;
    const punch = cyl(g, 0.45, 0.45, 0.005, 0.2, 0.026, 0.9, 0xc83a5a, { rough: 0.05, opacity: 0.75, transparent: true, seg: 18 });
    punch.visible = false;

    // ------------------------------------------------------------ balloons and the helium cylinder
    const heliumSpot = group(g, 0.9, 0, 1.8);
    const helium = cylinderTank(heliumSpot, 0, 0, 0x8a8a8a, { plateLabel: "HELIUM", plateLines: ["COMPRESSED GAS", "SECURE UPRIGHT"] });
    const chainBracket = group(g, 0.9, 1.0, 2.05);
    box(chainBracket, 0.2, 0.06, 0.04, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.7 });
    const chain = torus(chainBracket, 0.12, 0.008, 0, -0.02, -0.12, 0xc7cdd2, { rough: 0.3, metal: 0.9, seg: 6, seg2: 20 });
    chain.rotation.x = Math.PI / 2;
    chain.visible = false;
    reg(hits, chainBracket, "cylinder-chain");
    holoTag(chainBracket, "cylinder bracket", 0, 0.16, 0, { css: PMCR_CSS, w: 0.28 });
    for (let i = 0; i < 5; i++) {
      const bx = 0.6 + (i % 3) * 0.2, bz = 1.6 + Math.floor(i / 3) * 0.15;
      ball(g, 0.12, bx, 1.8 + (i % 2) * 0.2, bz, [0xe86a8a, 0x6ab8e8, 0xf2c14b, 0xb88ad8, 0x8ad86a][i], { rough: 0.3, seg: 12 });
      cyl(g, 0.002, 0.002, 1.1, bx, 1.2, bz, 0xf4f4f4, { rough: 0.5, seg: 4 });
    }

    // ------------------------------------------------------------ event sheet, occupant load sign, door count, room controller, log
    const eventSheet = decal(g, 0.26, 0.34, 2.4, 1.4, 1.06, paperFace("RESERVATION", ["Unit 6D · Sat 2–6 pm", "Guests: 60 · DJ", "Balloons · banner", "Food: slow cookers"], { bg: "#f4efe0", band: "#5a3a7a" }), { px: 256 });
    reg(hits, eventSheet, "event-sheet");
    decal(g, 0.4, 0.26, -0.2, 1.8, -2.57, paperFace("OCCUPANT LOAD", ["MAXIMUM 72", "Posted per fire code"], { bg: "#f4f4f0", band: "#1b1e22" }), { px: 256 });
    const doorCount = instrument(g, -0.3, 1.2, 2.0, { idle: "0 / 72", color: 0x6a4a8a, w: 0.14, d: 0.2 });
    doorCount.rotation.x = Math.PI / 2.4;
    reg(hits, doorCount, "door-count");
    holoTag(g, "door clicker", -0.3, 1.45, 2.0, { css: PMCR_CSS, w: 0.24 });
    const roomCtl = group(g, 2.92, 1.4, 1.0, -Math.PI / 2);
    box(roomCtl, 0.14, 0.14, 0.03, 0, 0, 0, 0xf0f2f4, { rough: 0.4 });
    const hvacDial = group(roomCtl, 0, 0, 0.02);
    cyl(hvacDial, 0.045, 0.045, 0.02, 0, 0, 0, 0x3a4450, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const hvacPtr = box(hvacDial, 0.006, 0.03, 0.006, 0, 0.016, 0.012, 0xf2c14b, { rough: 0.4 });
    reg(hits, hvacDial, "hvac-dial");
    holoTag(roomCtl, "room controller", 0, 0.14, 0.02, { css: PMCR_CSS, w: 0.26 });
    const logBoard = holoPanel(g, 0.56, 0.38, -2.4, 1.7, 1.5, (ctx, w, h) => {
      ctx.fillStyle = "rgba(16,10,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMCR_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#f4ecfb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · COMMUNITY RM", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#e0d4ee";
      ["head count · peak", "devices uncovered", "spill · cylinder", "panic bar tested"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.6, accent: PMCR_ACCENT });
    reg(hits, logBoard, "building-log");

    // ------------------------------------------------------------ crew
    const host = standingFigure(g, 1.05, 0.45, { ry: 2.6, cloth: 0x3a8a8a, trousers: 0x2b3138 });
    reg(hits, host, "host-brief");
    const houseman = standingFigure(g, -1.0, 2.0, { ry: 3.1, cloth: 0x2b2b3a, trousers: 0x1b1e22 });
    reg(hits, houseman, "houseman-checkin");
    const guest = standingPerson(g, 0.7, 1.1, { ry: 2.2, cloth: 0xe8a060, hiVis: false });
    guest.root.visible = false;

    let tipping = false;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.0, -1.2),

      onStepComplete(step) {
        if (step.id === "walk-life-safety") { bag.visible = false; banner.position.set(-1.2, 2.2, -2.34); }
        if (step.id === "open-partition") { panels.forEach((p, i) => { p.rotation.y = i % 2 ? 1.3 : -1.3; p.position.x = 1.0 + i * 0.1; }); crankArm.rotation.z = 1.4; }
        if (step.id === "clear-exit-path") cart.position.set(2.4, 0, 1.55);
        if (step.id === "measure-aisle") repaint(tape.userData.screen, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "walk-kitchenette") { sinkCord.visible = false; gifts.position.set(-1.0, 0, -2.1); }
        if (step.id === "set-ventilation") hvacPtr.rotation.z = -1.0;
      },

      onInterrupt(it) {
        if (it.id === "helium-tip") { tipping = true; helium.rotation.z = 0.15; }
        if (it.id === "punch-spill") { punch.visible = true; guest.root.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "helium-tip") {
          tipping = false; helium.rotation.z = 0;
          if (it.resolved === "answered") chain.visible = true;
        }
        if (it.id === "punch-spill") {
          guest.root.visible = false;
          if (it.resolved === "answered") { punch.visible = false; wetSign.visible = true; }
        }
      },

      animate(t, dt, session) {
        helium.rotation.z = tipping ? 0.12 + Math.sin(t * 5) * 0.06 : helium.rotation.z;
        host.userData.head.rotation.y = Math.sin(t * 0.35) * 0.3;
        houseman.userData.head.rotation.y = Math.sin(t * 0.3 + 1) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "measure-aisle") {
          repaint(tape.userData.screen, signFace(`${Math.round(gg.t * 72)} in`, { bg: "#0d1c24", accent: gg.t >= 0.6 && gg.t <= 0.85 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && session.step?.id === "count-door" && Math.floor(t * 4) !== Math.floor((t - dt) * 4)) {
          const v = session.track.v;
          repaint(doorCount.userData.screen, signFace(`${Math.round(v * 100)} / 72`, { bg: "#0d1c24", accent: v >= 0.35 && v <= 0.7 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
      },
    };
  },
};
