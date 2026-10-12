import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, group, decal, repaint, signFace, paperFace,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Warehouse Ride-Along Day VR — Pathway Edition, wojrc.org.
//
// The first day a warehouse-track trainee is actually beside a supervisor on
// the floor: reporting in, PPE checked in order, the route briefed, a
// pre-trip check on the walkie pallet jack, two driven legs down a live
// aisle with the horn sounded at every cross aisle and a forklift and a
// pedestrian both crossing the route, a load raised and held while it
// settles, the truck squared and parked, and a debrief with the supervisor
// before the log is signed. Sited generically: no real employer, warehouse or
// clause number the registry is not sure of.

const WRD_ACCENT = 0xf0a13a;
const WRD_CSS = "#f0a13a";
const WRD_RACK = 0x2f5f9e;
const WRD_BEAM = 0xe8792c;
const WRD_WOOD = 0x9a7a55;
const WRD_CARTON = 0xc9a978;

export const SIM_WP_WAREHOUSE_RIDE_ALONG = {
  id: "wp-warehouse-ride-along",
  index: "711",
  domain: "Warehouse & Distribution",
  trade: "Pathway Edition — a warehouse ride-along day beside a supervisor on a live pallet-jack route",
  category: "Mobility & Transit",
  indoor: "garage",
  certification: "OSHA 29 CFR 1910.178 powered industrial trucks, which covers motorized hand trucks and requires operator training and evaluation under paragraph (l); ANSI/ITSDF B56.1 for low-lift trucks like the walkie pallet jack this ride-along is driven on; 29 CFR 1910.22 walking-working surfaces for the aisles and the pedestrian lane a ride-along shares with everyone else on the floor; the Revised NIOSH Lifting Equation for the hand work around the pallet; ANSI/ISEA 107 for the high-visibility vest a ride-along wears from the first step onto the floor; Teamsters (IBT) warehouse locals' powered-truck training programmes, which this ride-along day is a first taste of",
  name: "Warehouse Ride-Along Day",
  title: simTitle("Warehouse Ride-Along Day"),
  tagline: "Report in, PPE checked in order, the route briefed, the truck pre-tripped, two legs driven at walking pace with the horn at every cross aisle, a load raised and held, and the truck squared and parked before the debrief",
  accent: WRD_ACCENT,
  accentCss: WRD_CSS,
  parSeconds: 340,
  footprint: 2.6,
  supportLine: "your supervisor or your Teamsters steward, and your employer's employee assistance programme if the first day on a live floor is harder than it looks from the sideline",
  badge: { id: "ride-along-clean", name: "Ride-Along Clean", note: "PPE checked in order, the pre-trip found clean, both legs driven at walking pace with the horn sounded and the crossings answered, and the truck squared away" },

  game: system({
    name: "Floor Ride-Along",
    currency: "AISLE",
    ranks: ["Sideline", "PPE Checked", "Route Driven", "Load Set", "Ride-Along Certified"],
    badges: [
      { id: "clean-pretrip", name: "Clean Pre-Trip", note: "The pre-trip defects found without a hint", test: AWARD.stepClean("pretrip-check") },
      { id: "off-the-forks", name: "Off The Forks", note: "Never rode the forks, blocked the exit, wore headphones on the floor or looked at a phone mid-instruction", test: AWARD.safe },
      { id: "steady-legs", name: "Steady Legs", note: "Both driven legs held in lane and band the whole way", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere on the floor", test: AWARD.clean },
      { id: "honest-comfort", name: "Honest Comfort", note: "The comfort gauge committed near the middle of the band", test: AWARD.precise(0.7) },
      { id: "full-shift-pace", name: "Full-Shift Pace", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wp-wr-ride-forks": "You were about to step onto the forks to ride the jack down the aisle instead of walking it. A walkie truck is built for an operator walking at the tiller, in front of the load, where the brakes and the deadman arc both assume your feet are on the floor — riding the forks puts your heels over the drive wheel and the rack corner both.",
    "wp-wr-blocked-exit": "Pallets from the last shift have been stacked in front of the marked emergency exit at the end of this aisle. An exit blocked even for an afternoon is an exit nobody can use in the ninety seconds a real fire gives a floor to clear — the pallets get moved before anything else, not left for the next shift to notice.",
    "wp-wr-headphones": "You were about to put your own earbuds in for the walk down the aisle. A ride-along floor runs forklifts and jacks on the same aisles pedestrians use, and the horn and a shouted warning are the only signal that reaches you round a blind rack corner — earbuds in is exactly how a warning goes unheard on a first day.",
    "wp-wr-phone-distraction": "Your phone buzzed and you were about to check it while the supervisor was mid-sentence pointing out the aisle's cross traffic. A missed instruction on a live floor is not a missed text message — it is the one thing that was going to keep you clear of the forklift lane a minute later. The phone waits until you are off the floor.",
  },

  lateNotes: {
    "wp-wr-park-forks": "Not yet. The truck is parked once the load is actually set in its bay — not before the route is finished.",
    "wp-wr-ridealong-log": "The log closes out the day last, with what the supervisor actually said in the debrief.",
  },

  steps: [
    {
      id: "report-in", kind: "select", target: "wp-wr-signin-board",
      title: "Report to the supervisor",
      cue: "Sign in at the floor board and confirm today's assignment with the supervisor.",
      why: "A ride-along starts with the supervisor knowing exactly who is on the floor and for how long, because everyone else driving a truck or pushing a cart down these aisles is planning around who they expect to see there. Signing in is also the same habit every real shift starts with — the floor board is never skipped, ride-along or not.",
    },
    {
      id: "ppe-check", kind: "sequence",
      targets: ["wp-wr-ppe-vest", "wp-wr-ppe-boots", "wp-wr-ppe-glasses"],
      itemNames: { "wp-wr-ppe-vest": "high-visibility vest on", "wp-wr-ppe-boots": "steel-toe boots on", "wp-wr-ppe-glasses": "safety glasses on" },
      outOfOrderNote: "Vest, then boots, then glasses — the vest goes on first because it is what makes you visible to every truck on the floor from the moment you step past the line, before the boots and glasses that protect you once you are actually working.",
      title: "Put on PPE in the order the floor expects",
      cue: "Vest, then boots, then glasses — in that order, before you cross the yellow line.",
      why: "ANSI/ISEA 107 is why the vest goes on first: a forklift operator's first read of the floor is who is wearing high-vis, and that has to be true the second you cross the line, not once you happen to get around to it. Boots and glasses protect you once you are working; the vest protects you the whole time you are simply present.",
    },
    {
      id: "route-briefing", kind: "hold", target: "wp-wr-route-card", seconds: 6,
      title: "Read the route briefing with the supervisor",
      cue: "Hold at the route card and read where you are going, what you are carrying, and where the forklift lane crosses it.",
      why: "The supervisor's briefing names the one thing a first-day ride-along cannot guess on its own: where this warehouse's forklift traffic actually crosses the pedestrian route, which is different in every building and is exactly where a first-day incident happens. Reading it fully, with the supervisor still standing there to answer a question, is what the rest of the day is built on.",
      holdBreakNote: "You left the card before the forklift-crossing line. That is the one detail the whole route depends on — read it through.",
    },
    {
      id: "pretrip-check", kind: "find", noHint: true,
      targets: ["wp-wr-worn-wheel", "wp-wr-loose-cover", "wp-wr-blocked-lane"],
      itemNames: { "wp-wr-worn-wheel": "the worn load wheel", "wp-wr-loose-cover": "the loose battery cover", "wp-wr-blocked-lane": "cartons left in the pedestrian lane" },
      itemNotes: {
        "wp-wr-worn-wheel": "A visibly worn load wheel drags and can jump a floor joint with a load on it — it gets tagged before the truck goes anywhere.",
        "wp-wr-loose-cover": "A battery cover that is not latched can shift and expose the terminals to a dropped tool or a stray hand. It gets closed and latched before the key turns.",
        "wp-wr-blocked-lane": "Cartons sitting across the painted pedestrian lane push foot traffic into the truck aisle instead of around it — they get moved before the route starts, not stepped over.",
      },
      title: "Pre-trip the truck before you touch the controls",
      cue: "Walk the jack with the supervisor watching. Find what needs fixing before it moves.",
      why: "A ride-along's pre-trip is watched by the same eyes that would catch a real defect on a real shift, and finding all three here — before the key turns — is the habit the rest of the apprenticeship is built on. A truck taken out on a defect the operator saw and drove anyway is the story behind most of the incidents this checklist exists to prevent.",
    },
    {
      id: "leg-one", kind: "drive", target: "wp-wr-jack",
      title: "Drive the first leg at walking pace",
      cue: "Walk the jack forward at walking pace, sounding the horn as you approach the first cross aisle.",
      why: "A walkie is driven from in front, on foot, at a pace slow enough to stop inside its own length for anyone stepping out of a cross aisle — which is exactly what the horn at that cross aisle is for. Holding a steady walking pace with the supervisor beside you is the whole first leg: not creeping, which drifts the load, and not rushing, which is how a first day ends with an incident report.",
      holdBreakNote: "Out of the lane or the band. Settle back to walking pace before the cross aisle, not in it.",
      drive: {
        path: [[0, 3.2], [0, 1.6], [0, 0.4]],
        speedBand: [2, 6], laneWidth: 1.2, graceSeconds: 1.8, checkWindow: 1.0, sceneRate: 0.2,
        bandLabel: "walking pace",
        checks: [{ at: 1, kind: "horn", note: "Horn at the cross aisle — your view is blocked both ways here, and the horn is the only warning that reaches round the rack." }],
        controls: { brake: "wp-wr-tiller-brake" },
        laneNote: "You left the aisle and stayed out. On a live floor that is either the forklift lane or the racking upright.",
      },
    },
    {
      id: "comfort-gauge", kind: "gauge", target: "wp-wr-comfort-dial",
      title: "Rate your comfort with the controls honestly",
      cue: "The dial runs one to ten. Commit it where you actually are after the first leg, not where you want to be.",
      gauge: {
        label: "COMFORT", speed: 0.6, green: [0.35, 0.65],
        readout: (t) => `${Math.round(1 + t * 9)} / 10`,
        missNote: "That number does not match somebody who just corrected out of the lane twice. Rate it honestly — the supervisor plans the second leg around the real number.",
      },
      why: "The supervisor uses this number to decide how much to narrate on the second leg, not to pass or fail the day. An inflated number gets less coaching exactly when a shaky first leg needed more of it, and an honest one gets a supervisor walking closer and talking through the next cross aisle before you reach it rather than after you miss it.",
    },
    {
      id: "scan-ahead", kind: "find", noHint: true,
      targets: ["wp-wr-pedestrian-ahead", "wp-wr-damaged-pallet", "wp-wr-blocked-flue"],
      itemNames: { "wp-wr-pedestrian-ahead": "a pedestrian ahead reading a scanner", "wp-wr-damaged-pallet": "a damaged pallet leaning in the rack", "wp-wr-blocked-flue": "a load shoved into the flue space" },
      itemNotes: {
        "wp-wr-pedestrian-ahead": "Someone walking the pedestrian lane with their eyes on a handheld scanner, not on the aisle. They will not see the jack before the jack sees them.",
        "wp-wr-damaged-pallet": "A pallet with a split deck board leaning in the rack ahead. It gets reported, not lifted, the way the full inspection in the warehouse block already teaches.",
        "wp-wr-blocked-flue": "A load pushed all the way to the back of its bay, closing the flue space a sprinkler head needs. Worth pointing out to the supervisor even on a ride-along.",
      },
      title: "Scan the second aisle before you move into it",
      cue: "Look down the aisle ahead. Find what the supervisor would want you to notice before you start the second leg.",
      why: "A ride-along is as much about learning to see a floor as it is about driving a truck, and a supervisor watching a trainee scan ahead — really look, not just glance — before moving is watching for the habit that keeps a whole career free of the incidents this floor is built to prevent.",
    },
    {
      id: "leg-two", kind: "drive", target: "wp-wr-jack",
      title: "Drive the second leg into the drop-off bay",
      cue: "Continue at walking pace toward the drop-off bay, horn again at the second cross aisle.",
      why: "The second leg is where the habits from the first one either hold or slip — the same walking pace, the same horn at the same kind of blind crossing, now with the supervisor watching to see if today was a fluke or a start. Ending it lined up on the drop-off bay is what makes the next step, setting the load down, possible without a second pass.",
      holdBreakNote: "Out of lane or band again — walking pace, horn at the crossing, the same as the first leg.",
      drive: {
        path: [[0, 0.4], [0, -1.2], [0, -2.8]],
        speedBand: [2, 6], laneWidth: 1.2, graceSeconds: 1.8, checkWindow: 1.0, sceneRate: 0.2,
        bandLabel: "walking pace",
        checks: [{ at: 1, kind: "horn", note: "Horn at the second cross aisle — the same blind corner as the first, on the other side of the floor." }],
        controls: { brake: "wp-wr-tiller-brake" },
      },
    },
    {
      id: "raise-hold", kind: "hold", target: "wp-wr-lift-button", seconds: 6,
      title: "Raise the load just clear and hold",
      cue: "Raise the pallet until it just clears the floor and hold it while it settles.",
      why: "Raising a pallet just clear of the floor, then holding while it settles, is what catches a shifted carton or a stretch wrap that let go before the load is moving — an inch off the concrete, where it is nothing, instead of halfway into the bay, where it is a mess on the floor and a supervisor writing up why.",
      holdBreakNote: "The load dropped back before it settled — raise it just clear again and hold it there.",
    },
    {
      id: "square-bay", kind: "turn", target: "wp-wr-tiller",
      title: "Square up to the drop-off bay",
      cue: "Swing the tiller to bring the pallet square to the bay before running it in.",
      turn: { turns: 0.25, axis: "y", label: "TILLER" },
      why: "A pallet run into a floor location at an angle catches the upright with a corner, and the upright is the one part of the rack everything above it depends on. Squaring up here, in the open aisle where there is room to correct, is what lets the load go in straight on the first try.",
    },
    {
      id: "set-pallet", kind: "drag", target: "wp-wr-pallet",
      title: "Set the pallet in the drop-off bay",
      cue: "Run the pallet straight into the marked bay and set it down inside the lines.",
      why: "The painted lines keep the pallet inside the uprights, back from the aisle, and clear of the flue space the sprinklers need — a pallet left proud of the lines is the one the next truck clips or the one a picker has to squeeze past for the rest of the shift.",
      drag: { to: "wp-wr-floor-bay", radius: 0.5, missNote: "Not inside the lines — square it up and run it straight into the bay." },
    },
    {
      id: "park-truck", kind: "sequence",
      targets: ["wp-wr-park-forks", "wp-wr-park-key"],
      itemNames: { "wp-wr-park-forks": "forks fully lowered", "wp-wr-park-key": "key off and out" },
      title: "Park the truck the way the standard says",
      cue: "Forks all the way down, then key off and out.",
      outOfOrderNote: "Forks down first, then the key — a truck is made safe before it is left, not the other way round.",
      why: "An unattended truck is left with the forks fully lowered and the key off — a raised fork is a shin injury at exactly the height nobody looks for it, and a keyed truck is one anybody untrained could climb onto and drive.",
    },
    {
      id: "supervisor-debrief", kind: "select", target: "wp-wr-supervisor",
      title: "Debrief with the supervisor",
      cue: "Go over both legs with the supervisor: the pre-trip, the crossings, and how the controls actually felt.",
      why: "The supervisor watched things from beside the jack that are invisible from the tiller — how close the pedestrian actually came, how the second leg's horn compared to the first. Two minutes talking it through turns a first day into the start of a habit instead of an afternoon nobody reviews.",
    },
    {
      id: "close-log", kind: "select", target: "wp-wr-ridealong-log",
      title: "Sign the ride-along log",
      cue: "Log the pre-trip result, both legs, and the supervisor's note, then sign it.",
      why: "The ride-along log is the record that today actually happened the way it did — what was found on the pre-trip, how the crossings went, what the supervisor said to work on. It is also the first entry in the file the programme's coach reads before the next placement.",
    },
  ],

  interrupts: [
    {
      id: "wp-wr-forklift-cross",
      kind: "Forklift crossing the aisle",
      after: "leg-one", delay: 3, seconds: 10,
      alert: "A forklift carrying a raised load pulls out of the cross aisle directly ahead, crossing your path.",
      cue: "Stop.",
      target: "wp-wr-tiller-brake",
      why: "A forklift with a raised load has a blind spot in front of it that grows with the height of the load, and the driver may not see a walkie jack approaching from the side at all. Stopping and letting it clear is the only answer — nothing about right-of-way matters next to a load that could come off the forks.",
      missNote: "You kept the jack moving with the forklift crossing ahead, and in the version where you did, the forklift driver never saw the jack until the loads were already sharing the same six feet of aisle.",
      wrongNote: "It is the tiller brake. A forklift with a raised load is crossing right in front of you — everything stops until it clears.",
    },
    {
      id: "wp-wr-pedestrian-near-load",
      kind: "Pedestrian walks up to the raised load",
      after: "raise-hold", delay: 3, seconds: 10,
      alert: "A coworker has walked up close to the raised pallet to ask you a question, well inside the load's swing radius.",
      cue: "Sound the horn and wave them back before you answer.",
      target: "wp-wr-horn",
      why: "A raised load can shift or drop the moment it is moved, and anyone standing inside its swing radius when that happens has no time to react — the horn and a wave back is the whole answer, said before the question, not after the load has already been made to wait for a conversation.",
      missNote: "You answered the question with the load still up and someone standing beside it, and in the version where the pallet shifted as you moved off, they were exactly where it would have come down.",
      wrongNote: "Not the lift button. The horn is what moves them back — sound that first, then answer.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root, 0, 0, 0);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, WRD_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 5, base: "#6c7076", base2: "#5f6369", seam: "rgba(0,0,0,0.35)",
    }), { repeat: 5, px: 512 });
    const floor = box(g, 4.2, 0.1, 8.0, 0, 0.05, 0, 0xffffff, { rough: 0.9 });
    floor.material = texturedMat(floorTex, { rough: 0.9, metal: 0.03, color: 0xc4c8cc });
    // Aisle lines either side of the drive path, and the pedestrian lane.
    for (const x of [-0.7, 0.7]) box(g, 0.06, 0.006, 7.6, x, 0.103, 0, 0xf2c14b, { rough: 0.7, cast: false });
    box(g, 0.5, 0.005, 7.0, 1.6, 0.103, 0, 0xf2c14b, { rough: 0.7, cast: false });
    holoTag(g, "pedestrian lane", 1.6, 0.35, 3.0, { css: "#f2c14b", w: 0.34 });

    // Racking either side of the aisle.
    const rack = group(g, 0, 0.1, 0);
    for (const rz of [-2.2, 2.2]) {
      const frame = group(rack, 0, 0, rz);
      for (const x of [-1.3, -1.9]) for (const z of [-0.6, 0.6]) box(frame, 0.08, 2.7, 0.08, x, 1.35, z, WRD_RACK, { rough: 0.55, metal: 0.45 });
      for (const x of [1.3, 1.9]) for (const z of [-0.6, 0.6]) box(frame, 0.08, 2.7, 0.08, x, 1.35, z, WRD_RACK, { rough: 0.55, metal: 0.45 });
      for (const y of [1.1, 2.2]) {
        box(frame, 0.62, 0.12, 0.05, -1.6, y, -0.6, WRD_BEAM, { rough: 0.5, metal: 0.35 });
        box(frame, 0.62, 0.12, 0.05, -1.6, y, 0.6, WRD_BEAM, { rough: 0.5, metal: 0.35 });
        box(frame, 0.62, 0.12, 0.05, 1.6, y, -0.6, WRD_BEAM, { rough: 0.5, metal: 0.35 });
        box(frame, 0.62, 0.12, 0.05, 1.6, y, 0.6, WRD_BEAM, { rough: 0.5, metal: 0.35 });
      }
      const load = (x, y, h, color) => box(frame, 0.55, h, 0.5, x, y + h / 2 + 0.13, -0.6, color, { rough: 0.85 });
      load(-1.6, 0, 0.75, WRD_CARTON); load(-1.6, 1.1, 0.65, 0xb89a6c);
      load(1.6, 0, 0.8, 0xc2a070); load(1.6, 1.1, 0.6, WRD_CARTON);
    }
    // Damaged pallet leaning in the far rack, and a load pushed into the flue.
    const damaged = box(rack, 0.5, 0.7, 0.4, 1.6, 0.48, 2.75, WRD_CARTON, { rough: 0.85 });
    damaged.rotation.z = 0.18;
    reg2(damaged, "wp-wr-damaged-pallet");
    const flueLoad = box(rack, 0.55, 0.7, 0.5, -1.6, 0.48, 1.72, 0xd8c29a, { rough: 0.85 });
    reg2(flueLoad, "wp-wr-blocked-flue");
    holoTag(rack, "flue space closed?", -1.6, 0.9, 1.72, { css: "#f0645b", w: 0.3 });

    // The blocked emergency exit at the far end of the aisle.
    const exitDoor = group(g, 0, 0, -3.9);
    box(exitDoor, 1.0, 2.1, 0.1, 0, 1.05, 0, 0x2f6b3a, { rough: 0.6 });
    decal(exitDoor, 0.5, 0.16, 0, 1.7, 0.06, signFace("EMERGENCY EXIT", { bg: "#0d2b0d", accent: "#59c97b", scale: 0.34 }), { px: 224, glow: true, ei: 0.5 });
    const blockPallets = box(exitDoor, 1.1, 0.9, 0.7, 0, 0.45, 0.5, WRD_WOOD, { rough: 0.9 });
    holoTag(exitDoor, "exit blocked?", 0, 1.0, 0.5, { css: "#f0645b", w: 0.28 });
    reg2(blockPallets, "wp-wr-blocked-exit");

    // Sign-in board and PPE rack at the start of the route.
    const signBoard = holoPanel(g, 0.9, 0.7, -1.4, 1.5, 3.9, (cx, w, h) => {
      cx.fillStyle = "rgba(20,14,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WRD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#ffe8cc"; cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("FLOOR SIGN-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillText("Ride-along — report to supervisor", w / 2, h * 0.62);
    }, { accent: WRD_ACCENT });
    reg2(signBoard, "wp-wr-signin-board");
    const ppeRack = group(g, 1.5, 0, 3.6);
    box(ppeRack, 0.08, 1.6, 0.08, 0, 0.8, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const vest = box(ppeRack, 0.3, 0.4, 0.05, 0.2, 1.2, 0, 0xd8e24a, { rough: 0.6 });
    reg2(vest, "wp-wr-ppe-vest");
    const boots = box(ppeRack, 0.14, 0.16, 0.3, 0.2, 0.1, 0.1, 0x2b2f34, { rough: 0.7 });
    reg2(boots, "wp-wr-ppe-boots");
    const glasses = box(ppeRack, 0.16, 0.05, 0.05, 0.2, 1.5, 0, 0x1c1f23, { rough: 0.4 });
    reg2(glasses, "wp-wr-ppe-glasses");
    holoTag(ppeRack, "PPE rack", 0, 1.72, 0, { css: WRD_CSS, w: 0.24 });

    // Route card and comfort dial near the start.
    const routeCard = holoPanel(g, 0.9, 0.6, 1.4, 1.5, 3.6, (cx, w, h) => {
      cx.fillStyle = "#12233a"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = WRD_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef4fb"; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("TODAY'S ROUTE", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["One pallet, two legs", "Forklift lane crosses at both", "cross aisles — walking pace", "Drop-off: far bay"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.4, accent: WRD_ACCENT });
    reg2(routeCard, "wp-wr-route-card");
    const comfortDial = instrument(g, 0.9, 0.9, 1.1, { idle: "-/10", color: WRD_ACCENT, w: 0.2, d: 0.24, ry: -0.3 });
    holoTag(comfortDial, "comfort", 0, 0.2, 0, { css: WRD_CSS, w: 0.26 });
    reg2(comfortDial, "wp-wr-comfort-dial");

    // Pedestrian ahead marker (scan-ahead find target), visible near the second leg.
    const scanPed = standingFigure(g, 0.9, -0.9, { ry: 1.6, cloth: 0x3a4a5a, skin: 0xc9936a, atStation: true });
    reg2(scanPed, "wp-wr-pedestrian-ahead");
    holoTag(scanPed, "reading a scanner", 0, 1.9, 0, { css: WRD_CSS, w: 0.3 });

    // ------------------------------------------------------ the walkie pallet jack
    const jack = group(g, 0, 0.1, 3.6);
    box(jack, 0.6, 0.7, 0.4, 0, 0.42, 0.16, WRD_ACCENT, { rough: 0.5, metal: 0.25 });
    const forks = group(jack, 0, 0, 0);
    for (const sx of [-1, 1]) box(forks, 0.16, 0.06, 1.1, sx * 0.22, 0.05, -0.5, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    const rideDeck = box(jack, 0.4, 0.02, 0.9, 0, 0.09, -0.5, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    holoTag(jack, "ride the forks?", 0, 0.3, -0.9, { css: "#f0645b", w: 0.28 });
    reg2(rideDeck, "wp-wr-ride-forks");
    const wheel = cyl(jack, 0.1, 0.1, 0.3, 0.2, 0.6, 0.02, 0x59636d, { rough: 0.4, metal: 0.7, seg: 12 });
    wheel.rotation.z = Math.PI / 2;
    const wornWheel = cyl(jack, 0.04, 0.04, 0.1, sxSafe(), 0.04, -1.0, 0x1c1f23, { rough: 0.85, seg: 12 });
    wornWheel.rotation.z = Math.PI / 2;
    reg2(wornWheel, "wp-wr-worn-wheel");
    const battCover = box(jack, 0.24, 0.05, 0.3, -0.1, 0.6, 0.2, 0x2b2f34, { rough: 0.5 });
    battCover.rotation.z = 0.2;
    reg2(battCover, "wp-wr-loose-cover");
    const tiller = group(jack, 0, 0.62, 0.36);
    const arm = cyl(tiller, 0.025, 0.025, 0.9, 0, 0.32, 0.26, 0x2b2f34, { rough: 0.5, metal: 0.5, seg: 10 });
    arm.rotation.x = 0.65;
    const head = group(tiller, 0, 0.68, 0.54);
    box(head, 0.4, 0.1, 0.14, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    const horn = box(head, 0.06, 0.04, 0.05, -0.13, 0.06, 0.02, 0xf2c14b, { rough: 0.5 });
    reg2(horn, "wp-wr-horn");
    const liftBtn = box(head, 0.06, 0.04, 0.05, 0.13, 0.06, 0.02, 0x59c97b, { rough: 0.5 });
    reg2(liftBtn, "wp-wr-lift-button");
    const brakeGrip = box(head, 0.1, 0.03, 0.08, 0, -0.07, -0.02, 0x59636d, { rough: 0.5, metal: 0.4 });
    reg2(brakeGrip, "wp-wr-tiller-brake");
    const tillerHit = box(tiller, 0.5, 0.08, 0.08, 0, 0.5, 0.4, 0xffffff, { opacity: 0.001, cast: false });
    reg2(tillerHit, "wp-wr-tiller");
    holoTag(jack, "tiller: horn · lift · brake", 0, 1.5, 0.9, { css: WRD_CSS, w: 0.5 });
    reg2(jack, "wp-wr-jack");

    // Pallet carried on the jack, and the drop-off bay floor location.
    const pallet = group(jack, 0, 0.13, -0.5);
    box(pallet, 0.9, 0.13, 1.0, 0, 0, 0, WRD_WOOD, { rough: 0.9 });
    box(pallet, 0.85, 0.85, 0.92, 0, 0.54, 0, WRD_CARTON, { rough: 0.85 });
    reg2(pallet, "wp-wr-pallet");
    for (const [x, z, w, d] of [[0, -3.55, 1.1, 0.04], [-0.55, -3.9, 0.04, 1.0], [0.55, -3.9, 0.04, 1.0]]) {
      box(g, w, 0.006, d, x, 0.104, z, 0xf2f5f7, { rough: 0.6, cast: false });
    }
    const baySocket = box(g, 1.0, 0.04, 0.9, 0, 0.12, -3.9, 0xffffff, { rough: 0.6 });
    baySocket.visible = false; hits["wp-wr-floor-bay"] = baySocket;
    holoTag(g, "drop-off bay", 0, 0.6, -3.9, { css: WRD_CSS, w: 0.3 });

    // Blocked pedestrian lane cartons.
    const laneBlock = box(g, 0.5, 0.5, 0.4, 1.6, 0.25, 1.0, WRD_CARTON, { rough: 0.85 });
    holoTag(g, "in the pedestrian lane?", 1.6, 0.6, 1.0, { css: "#f0645b", w: 0.34 });
    reg2(laneBlock, "wp-wr-blocked-lane");

    // Supervisor, headphones and phone hazards, debrief and log.
    const supervisor = standingFigure(g, -1.5, 3.4, { ry: -1.6, cloth: 0x2f5f8a, vest: 0xf2c14b, skin: 0x6b4a33, atStation: true });
    holoTag(supervisor, "supervisor", 0, 1.9, 0, { css: WRD_CSS, w: 0.28 });
    reg2(box(supervisor, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false }), "wp-wr-supervisor");
    const headphones = box(g, 0.12, 0.06, 0.14, -1.3, 1.6, 3.9, 0x1c1f23, { rough: 0.4 });
    holoTag(g, "put your earbuds in?", -1.3, 1.75, 3.9, { css: "#f0645b", w: 0.34 });
    reg2(headphones, "wp-wr-headphones");
    const phone = box(g, 0.08, 0.015, 0.15, -1.5, 0.92, 3.6, 0x1b1e23, { rough: 0.3 });
    const phoneGlow = box(g, 0.07, 0.01, 0.12, -1.5, 0.93, 3.6, 0x2f5f9e, { emissive: 0x2f5f9e, ei: 0, rough: 0.4 });
    holoTag(g, "phone buzzing mid-briefing?", -1.5, 1.05, 3.6, { css: "#f0645b", w: 0.4 });
    reg2(phone, "wp-wr-phone-distraction");
    void phoneGlow;

    const parkForks = forks;
    hits["wp-wr-park-forks"] = parkForks;
    const parkKey = box(jack, 0.05, 0.08, 0.02, 0.24, 0.85, 0.36, 0xd9dde2, { rough: 0.3, metal: 0.8 });
    reg2(parkKey, "wp-wr-park-key");

    const logBoard = decal(g, 0.4, 0.2, -1.4, 0.78, 3.3, paperFace("RIDE-ALONG LOG", ["Pre-trip: ____", "Legs: ____"], { bg: "#f6f3ea", band: "#7a5030" }), { px: 224 });
    logBoard.rotation.x = -Math.PI / 2;
    holoTag(g, "ride-along log", -1.4, 0.92, 3.3, { css: WRD_CSS, w: 0.3 });
    reg2(logBoard, "wp-wr-ridealong-log");

    let forkliftOn = false, pedOn = false;
    const forklift = group(g, -2.4, 0, 0.4, Math.PI / 2);
    box(forklift, 0.7, 0.9, 1.3, 0, 0.6, 0, 0xf0a13a, { rough: 0.5 });
    for (const sx of [-1, 1]) box(forklift, 0.06, 1.5, 0.06, sx * 0.32, 0.9, -0.55, 0x2b2f34, { rough: 0.5, metal: 0.6 });
    box(forklift, 0.7, 1.3, 0.06, 0, 1.4, -0.55, 0x1c1f23, { rough: 0.4, opacity: 0.4, transparent: true });
    forklift.visible = false;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.3, 4.0),

      onStepComplete(step) {
        if (step.id === "pretrip-check") { wornWheel.material.emissiveIntensity = 0; }
        if (step.id === "raise-hold") pallet.position.y = 0.4;
        if (step.id === "park-truck") parkKey.material.color.set(0x59c97b);
        if (step.id === "close-log") repaint(logBoard, paperFace("RIDE-ALONG LOG", ["Pre-trip: clean", "Legs: both driven"], { bg: "#f6f3ea", band: "#59c97b" }));
      },

      onInterrupt(it) {
        if (it.id === "wp-wr-forklift-cross") { forkliftOn = true; forklift.visible = true; forklift.position.set(-0.6, 0, 0.4); }
        if (it.id === "wp-wr-pedestrian-near-load") { pedOn = true; scanPed.position.set(0.5, -0.9, 3.3); }
      },
      onInterruptEnd(it) {
        if (it.id === "wp-wr-forklift-cross") { forkliftOn = false; forklift.visible = false; }
        if (it.id === "wp-wr-pedestrian-near-load") { pedOn = false; scanPed.position.set(0.9, -0.9, 0); }
      },

      onHazard() {},

      animate(t, dt, session) {
        if (forkliftOn) forklift.position.x = -0.6 + Math.min(1.4, (t % 2) * 0.9);
        void pedOn;
        if (session?.turn && session.step?.id === "square-bay") tillerHit.rotation.y = session.turn.amount * Math.PI * 2;
        if (session?.drive) tillerHit.rotation.y = -session.drive.steer * 0.6;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "comfort-gauge") {
          const ok = gg.t >= 0.35 && gg.t <= 0.65;
          repaint(comfortDial.userData.screen, signFace(`${Math.round(1 + gg.t * 9)}/10`, { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#cfeaf7", scale: 0.55 }));
        }
        void t; void dt;
      },
    };
  },
};

function sxSafe() { return -0.22; }
