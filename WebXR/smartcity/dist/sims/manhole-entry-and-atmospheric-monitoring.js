import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat, ownMaterial } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, roadwayFace, waterFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Manhole Entry & Atmospheric Monitoring VR — Water &
// Environmental, the confined-space block.
//
// A sanitary sewer manhole in a live traffic lane on a wet morning: the lane
// coned off, the cover still on, a four-gas monitor in its case, a tripod and
// winch on the truck and a blower beside a generator that is parked in the
// wrong place. The learner is the entrant on a public-works collection crew
// — the AFSCME or LIUNA sewer maintenance worker who tests the space before
// going into it — and the crew mate at the winch is the attendant who never
// goes in. The space is generic: no real street, no real utility.

const MHE_ACCENT = 0x3fb6c9;
const MHE_CSS = "#3fb6c9";
const MHE_ROAD = 0.3;        // the street is a raised pad so the shaft can be a real hole

export const SIM_MANHOLE_ENTRY_AND_ATMOSPHERIC_MONITORING = {
  id: "manhole-entry-and-atmospheric-monitoring",
  index: "311",
  domain: "Water & Environmental",
  trade: "Sewer collection maintenance worker — AFSCME or LIUNA public-works crew, entrant with an attendant at the winch",
  category: "Water & Environmental",
  weather: "rain",
  certification: "OSHA 29 CFR 1910.146 permit-required confined spaces, with the ANSI Z117.1 confined-space practice standard and the NIOSH confined-space criteria behind the testing order; ACGIH exposure values for hydrogen sulphide on the permit; MUTCD temporary traffic control for the lane closure and ANSI/ISEA 107 high-visibility garments for the crew; AFSCME and LIUNA public-works training",
  name: "Manhole Entry & Atmospheric Monitoring",
  title: simTitle("Manhole Entry & Atmospheric Monitoring"),
  tagline: "A sewer manhole in a live lane on a wet morning: the lane closed to the traffic manual, the permit read, the four-gas monitor bumped, the cover walked off with the lifter, the shaft tested top to bottom while a car noses into the taper, the blower set upwind, the rungs looked at, the winch brake proven, the harness on and the line clipped, the climb down on a snug line while the upstream lift station starts, the invert checked, and the entry closed out and logged",
  accent: MHE_ACCENT,
  accentCss: MHE_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "tested-before-trusted", name: "Tested Before Trusted", note: "Every level of the shaft read before a boot went in, the line never slack, the taper and the lift station both answered, and the permit closed with the readings on it" },

  supportLine: "your AFSCME or LIUNA local's member assistance programme, or the employee assistance line on the back of the entry permit",

  game: system({
    name: "Collection Entry",
    currency: "PPM",
    ranks: ["Collection Hand", "Entrant", "Gas Tester", "Lead Entrant", "Confined Space Qualified"],
    badges: [
      { id: "top-middle-bottom", name: "Top, Middle, Bottom", note: "The whole shaft tested, level by level, before the entry", test: AWARD.stepClean("pre-entry-test") },
      { id: "line-never-slack", name: "Line Never Slack", note: "The retrieval line snug all the way down", test: AWARD.unbroken },
      { id: "nobody-leans-in", name: "Nobody Leans In", note: "No bare-handed cover, no head over the hole, no exhaust at the intake", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-entry", name: "Clean Entry", note: "No corrections anywhere in the entry", test: AWARD.clean },
      { id: "bump-on-the-mark", name: "Bump On The Mark", note: "The bump reading committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "lane-back-fast", name: "Lane Back Fast", note: "Lane reopened inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cover-bare-hands": "You went to lift the manhole cover with your fingers under its edge. A sewer cover weighs as much as a person, sits in a frame that grips it, and comes free all at once when it does — fingers under the rim are the pinch point, and a back bent over a hundred-odd kilograms is the strain. The magnetic lifter or the cover hook exists so that nobody's hands go under it and nobody lifts it at all: it is walked off and slid, never carried.",
    "lean-into-opening": "You leaned over the open manhole to look and sniff. Hydrogen sulphide deadens the sense of smell at the concentrations that matter, so a sniff tells you nothing except that you have put your face in the column of gas the space is venting — and the collar of an open manhole on a wet road is also a fall into a vertical shaft. The monitor goes down the hole on its hose; your head does not.",
    "generator-by-intake": "You started the blower with the truck's generator exhaust a stride from its intake. A blower moves whatever is at its intake down into the space, and a petrol generator's exhaust is carbon monoxide: parked there, the ventilation meant to make the manhole safe pumps a colourless, odourless toxic gas straight onto the entrant at the bottom. The generator goes downwind and well away, and the intake stays in clean air.",
    "ladder-no-line": "You started down the fixed rungs with no retrieval line clipped to your harness. For a vertical space deeper than five feet the confined-space standard expects a mechanical retrieval device, because a person overcome at the bottom of a shaft cannot be carried up a ladder by anybody — without the line, the attendant's only way to get you out is to come in after you, which is how one casualty becomes two.",
  },

  lateNotes: {
    "winch-snap": "The retrieval line clips to the back D-ring once the harness is on and snugged — there is nothing to clip it to yet.",
    "descent-line": "The climb down starts once the harness is on and the retrieval line is clipped to it, not before.",
    "permit-log": "The permit is closed once the cover is back in its frame and the lane is open — not while the entry is still running.",
  },

  steps: [
    {
      id: "work-zone", kind: "sequence", anyOrder: true,
      targets: ["advance-sign", "taper-cones"],
      itemNames: { "advance-sign": "advance warning sign up the lane", "taper-cones": "cone taper closing the lane" },
      title: "Close the lane: advance warning sign and the cone taper",
      cue: "Set the advance warning sign up the lane and run the cone taper that closes it, before anyone stands at the manhole.",
      why: "The manhole is in a traffic lane, and a crew bent over an open hole is facing down with its back to the traffic — the only protection they have is a closure the approaching driver understood from far enough back to act on. The MUTCD sets how a lane closure is built: a warning sign ahead of the work at a distance set by the road's speed, then a taper long enough for a driver to merge out, then the work space. Built in that order before the cover comes off, it is protection; built around a crew already at the hole, it is decoration.",
    },
    {
      id: "entry-permit", kind: "select", target: "permit-board",
      title: "Read the entry permit and its acceptable entry conditions",
      cue: "Read the permit: the space, its hazards, the acceptable readings for oxygen, flammables, hydrogen sulphide and carbon monoxide, the ventilation, the retrieval and who to call for rescue.",
      why: "The permit is the entry supervisor's statement of what makes this manhole safe to enter today: which hazards the space has — oxygen-deficient air, hydrogen sulphide and methane off the sewage, engulfment by a flow surge — and the readings inside which entry is acceptable. OSHA 29 CFR 1910.146 has those conditions written down before entry for exactly this reason: a number decided at the kerb with a monitor already beeping is a number argued down, and a number decided on the permit is a line nobody crosses.",
    },
    {
      id: "bump-check", kind: "gauge", target: "gas-monitor",
      title: "Bump the four-gas monitor against the test cylinder",
      cue: "Flow the test gas across the sensors and commit the hydrogen sulphide reading when it settles against the cylinder's value.",
      why: "A gas monitor's sensors drift and die quietly, and a dead hydrogen sulphide sensor reads a reassuring zero whatever the air holds. The bump is the proof, done the day the monitor is used: a known gas from a known cylinder, the alarms going off, and the reading landing close to the number on the cylinder. A monitor that fails the bump does not go near the hole, because every decision after this point is only as good as the instrument making it.",
      gauge: { label: "H₂S BUMP", speed: 0.7, green: [0.44, 0.56], readout: (t) => `${Math.round(t * 50)} ppm`, missNote: "Off the cylinder's value — let the reading settle on the test gas before committing it, not while it is still climbing or falling back." },
    },
    {
      id: "cover-off", kind: "drag", target: "manhole-cover",
      title: "Walk the cover off with the magnetic lifter",
      cue: "Seat the magnetic lifter on the cover, break it from the frame and walk it off onto the road to its parking spot, clear of the opening and the crew's feet.",
      why: "A sewer cover is lifted with a tool rather than hands because the frame grips it until it lets go all at once, and the load is heavy enough that a bent back and fingers under the rim are the two injuries the job hands out every year. The lifter lets it be walked off and slid rather than carried. It is parked flat on the road, away from the opening and the crew's footing, because a cover leaning against a kerb falls over, and a cover left at the collar goes back in the hole.",
      drag: { to: "cover-park", radius: 0.5, missNote: "Not on its parking spot — the cover goes flat on the road, clear of the opening and the walkway, not leaning at the collar." },
    },
    {
      id: "pre-entry-test", kind: "hold", target: "sample-probe", seconds: 5,
      title: "Test the shaft top, middle and bottom before entry",
      cue: "Lower the sample probe on its hose and hold at each level long enough for the pump to draw: oxygen first, then flammables, then the toxics, at the top, the middle and the bottom.",
      why: "The air in a manhole is layered: methane collects high, hydrogen sulphide and oxygen-poor air sink to the invert, and the reading at the collar says nothing about the air at the bottom where the entrant will breathe it. The test goes down the shaft level by level, holding long enough at each for the pump to pull the sample up the hose, and in the order NIOSH and ANSI Z117.1 teach — oxygen first because the flammable sensor needs oxygen to read right, flammables next because the fire kills faster, toxics last.",
      holdBreakNote: "Released before the pump had drawn at every level — the bottom of the shaft is where the entrant breathes and where the heavy gases sit. Test it again from the top.",
    },
    {
      id: "ventilate", kind: "select", target: "blower",
      title: "Set the blower upwind and duct it to the bottom",
      cue: "Start the electric blower upwind of the opening with its intake in clean air, and run the duct down to the invert before anyone enters.",
      why: "Forced air is what keeps a manhole inside its acceptable conditions while the entrant is in it, because a sewer keeps making gas whether anyone is down there or not and the flow can push a slug of it past at any time. The blower sits upwind with its intake well clear of any exhaust, the duct goes to the bottom where the heavy gases are, and it runs for the purge time before entry and continuously during it — the permit's readings were taken with it running, and they are only true while it keeps running.",
    },
    {
      id: "shaft-survey", kind: "find", noHint: true,
      targets: ["corroded-rung"],
      itemNames: { "corroded-rung": "corroded rung in the shaft wall" },
      itemNotes: { "corroded-rung": "The third rung down has been eaten back to a rust-thin bar where the sewer's gases condense on it — it will hold a hand and fail under a boot. The entry goes on the retrieval line and the rung is written up." },
      title: "Look down the shaft at the rungs and the walls",
      cue: "Shine the lamp down the shaft from beside the collar: the rungs, their anchorage in the wall, loose brick or concrete, and what is on the bench.",
      why: "The gases in a sewer condense on the shaft wall as acid, and the rungs cast into it are eaten from the inside out — a rung can look whole from the top and snap under a boot. The shaft is looked at from beside the collar, not over it, before anyone trusts it with their weight, and a bad rung changes the entry: the climb goes on the line with the attendant taking the load, and the rung goes on the log for the crew that repairs it.",
    },
    {
      id: "winch-brake", kind: "turn", target: "winch-crank",
      title: "Take up the winch and prove its brake holds",
      cue: "With the tripod legs chained and the head over the opening, crank the winch to take up the line and load it against the brake — the brake has to hold without the handle.",
      why: "The tripod and winch are the retrieval system the standard expects for a vertical entry, and the only one that works on an entrant who cannot help. The brake is what holds a person on the line when the attendant's hands leave the crank, and it is proven under load before anyone is on it: a winch that free-spools under a test load will free-spool under a person. The legs are chained so the tripod cannot splay when it takes a shock load.",
      turn: { turns: 1.0, label: "WINCH", readout: (t) => (t < 0.35 ? "taking up slack" : t < 0.9 ? "loading the brake" : "brake holding") },
    },
    {
      id: "harness-connect", kind: "sequence",
      targets: ["full-harness", "winch-snap"],
      itemNames: { "full-harness": "full-body harness, snugged", "winch-snap": "retrieval line to the back D-ring" },
      outOfOrderNote: "Harness first — the retrieval line clips to the back D-ring of a harness that is on and snugged, not to one hanging on the rack.",
      title: "Harness on, then the retrieval line to the back D-ring",
      cue: "Put the full-body harness on and snug the leg straps, then have the attendant clip the winch line to the back D-ring and check the gate.",
      why: "A retrieval line is only useful if it can bring an unconscious person up the shaft upright and whole, which means a full-body harness with the line on the back D-ring between the shoulder blades — a waist belt or a line on a front ring folds a limp body over and wedges it in a shaft barely wider than the shoulders. The harness goes on and snug first, the line clips on second, and the attendant checks the snap's gate is closed because they are the one who will be pulling on it.",
    },
    {
      id: "descent", kind: "track", target: "descent-line", seconds: 6,
      title: "Climb down on a snug line at the winch's pace",
      cue: "Climb down the rungs at the pace the attendant can follow on the winch — line snug, never slack, never hauling you off the wall.",
      why: "The line is only a fall-arrester and a retrieval line if it is snug all the way down: slack in it is a drop before the brake catches, and a sudden stop on a harness in a narrow shaft is an injury of its own. Too tight and it drags the entrant off the rungs. The entrant sets a pace the attendant can match on the crank, three points of contact on the rungs, stepping past the bad rung — and stops if the attendant calls, because the attendant is watching the monitor and the road.",
      track: { start: 0.1, green: [0.4, 0.62], rise: 0.6, fall: 0.46, drift: 0.12, label: "LINE", readout: (v) => (v < 0.4 ? "slack — stop" : v > 0.62 ? "too tight — hauling" : "snug") },
      holdBreakNote: "The line went slack or tight on the way down — stop on the rungs, let the attendant take up or pay out, and carry on only once it is snug again.",
    },
    {
      id: "invert-check", kind: "find", noHint: true,
      targets: ["sharps-debris"],
      itemNames: { "sharps-debris": "needle caught in the rag mat on the bench" },
      itemNotes: { "sharps-debris": "A hypodermic needle is caught in the rag mat on the bench, point up where a gloved hand would go to clear it. It is left alone, reported, and picked with the grabber into the sharps tube." },
      title: "Check the bench and the channel before touching anything",
      cue: "At the bottom, look over the bench and the flow channel before your hands go anywhere: the rag mat, the debris line, what is caught in it.",
      why: "What comes down a sanitary sewer includes needles, broken glass and blades, and the rag mat that builds on a bench is where they catch, points up. A gloved hand reaching into a mat to clear it is the classic sewer sharps injury, and it arrives with the bloodborne exposure attached. The bench is looked at before it is touched, anything sharp is picked with the grabber into the sharps tube, and the find is reported so the crew knows this manhole collects them.",
    },
    {
      id: "exit-climb", kind: "select", target: "top-rung",
      title: "Climb out on the attendant's call",
      cue: "Climb out with the attendant taking up the line on the winch, and step off onto the road clear of the collar.",
      why: "The climb out is the tired half of the entry, done wet, and it is done on the same snug line as the climb down: the attendant takes up as the entrant climbs, so that a slip at the top, where the rungs meet the frame and the hands have furthest to reach, is a jerk on the line rather than a fall back down the shaft. The entrant steps off to the side, never straight back over the open collar.",
    },
    {
      id: "close-out", kind: "sequence",
      targets: ["cover-frame", "taper-pickup"],
      itemNames: { "cover-frame": "cover back seated in its frame", "taper-pickup": "cone taper picked up, last cone first" },
      outOfOrderNote: "The cover goes back before the lane is opened — an open manhole in a live lane with the cones gone is the worst version of this job.",
      title: "Seat the cover, then pick up the taper",
      cue: "Walk the cover back into its frame and check it seats flat, then pick the cones up from the work end back toward the warning sign.",
      why: "The order matters on the way out as much as on the way in: the cover goes back and seats flat first, because an open or rocking cover in a lane is a hole in the road the moment the cones are gone. The taper comes up from the work end back toward the sign, the reverse of the way it went down, so the closure protecting the crew is the last thing removed rather than the first — the crew is in the lane until the last cone is in the truck.",
    },
    {
      id: "entry-log", kind: "select", target: "permit-log",
      title: "Close the permit with the readings and the findings",
      cue: "Record the readings at each level, the corroded rung, the needle on the bench and the lift station call, and cancel the permit.",
      why: "A permit is cancelled when the entry is over, and it is kept because the readings on it are the record of what this manhole's air was on this day under these flows — the next crew's best guess at what they are walking into. The corroded rung is a repair order, the needle is a note that this structure catches sharps, and the lift station start is a reason to call collections control before every entry here. Written on the road, it is what happened.",
    },
    {
      id: "crew-checkin", kind: "select", target: "collar-radio",
      title: "Check in with the attendant and collections control",
      cue: "Call collections control that the entry is closed and the lane is open, and check in with the attendant on how the entry went.",
      why: "Collections control has had a crew in a manhole on its board and a lift station held for them, and the station can be released only on this call. It is also the crew's own check-in: an entry where the flow rose under the entrant's feet leaves something behind for both people, and the attendant who was watching the water come up had the harder half of it. The member assistance line is there for that, and saying so on the road costs nothing.",
    },
  ],

  interrupts: [
    {
      id: "vehicle-in-taper",
      kind: "Vehicle nosing into the taper",
      after: "pre-entry-test", delay: 2, seconds: 14,
      alert: "A car has followed its satnav straight into the cone taper and is creeping down the closed lane toward the open manhole.",
      cue: "Turn the flagger's paddle to STOP at the driver now — the closed lane is the crew's work space, not a road.",
      target: "flagger-paddle",
      why: "A driver inside a closure is a driver who did not read it, and the next thing they reach is the crew at the hole. The paddle turned to STOP at eye level is the MUTCD's signal a driver is taught to obey, and it is the only thing on the job that talks to them before they reach the manhole. The test stops while the crew deals with the car, because nobody at an open manhole is watching the lane.",
      missNote: "The car crept on past the cones with the crew heads-down at the collar, knocked the parked cover sideways and stopped a metre from the open manhole with a person bent over it.",
      wrongNote: "The flagger's paddle — the driver is in the lane now, and the only thing that speaks to them is the STOP sign turned at their windscreen.",
    },
    {
      id: "upstream-pump-start",
      kind: "Upstream lift station starting",
      after: "descent", delay: 2, seconds: 14,
      alert: "The flow in the channel below is rising fast — the upstream lift station has just started its pumps and a surge is coming down the sewer.",
      cue: "Stop on the rungs and have the attendant call collections control on the collar radio to hold the upstream lift station off.",
      target: "collar-radio",
      why: "A lift station upstream of a manhole cycles on its level floats, and when its pumps start, the flow in a channel that was ankle-deep becomes a surge that can knock an entrant off the bench and carry gas ahead of it. The permit named engulfment for exactly this: the station is held off by the people who control it, on the radio, before anyone goes lower — a surge is not something an entrant out-climbs once it arrives.",
      missNote: "The surge came down the channel with the entrant still on the rungs, filled the invert to the bench and pushed a slug of gas up the shaft past them; the attendant hauled them up on the winch with the monitor in alarm.",
      wrongNote: "The collar radio — the flow is coming from a pump somebody else controls, and the only way to stop it is to reach collections control.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, MHE_ACCENT);

    // ------------------------------------------------------------- the road
    // A raised strip of asphalt with a square cut round the manhole, so the
    // shaft below the frame is a hole rather than a black smudge on the deck.
    const roadTex = surfaceTexture((cx, w, h) => roadwayFace(cx, w, h, { lanes: 2 }), { repeat: 3, px: 512 });
    const roadMat = texturedMat(roadTex, { rough: 0.92, metal: 0.02, color: 0x9aa0a6 });
    const road = group(g, 0, 0, -0.6);
    const slabs = [
      box(road, 6.4, MHE_ROAD, 1.5, 0, MHE_ROAD / 2, -1.25, 0xffffff),
      box(road, 6.4, MHE_ROAD, 1.5, 0, MHE_ROAD / 2, 1.25, 0xffffff),
      box(road, 2.8, MHE_ROAD, 1.0, -1.8, MHE_ROAD / 2, 0, 0xffffff),
      box(road, 2.8, MHE_ROAD, 1.0, 1.8, MHE_ROAD / 2, 0, 0xffffff),
    ];
    for (const s of slabs) s.material = roadMat;
    // Kerb on the far side and a lane line.
    box(road, 6.4, 0.16, 0.2, 0, MHE_ROAD + 0.08, -2.1, 0x9aa3ab, { rough: 0.85 });
    for (let i = 0; i < 4; i++) box(road, 0.7, 0.01, 0.08, -2.6 + i * 1.6, MHE_ROAD + 0.006, 0.95, 0xeae6d4, { rough: 0.8, cast: false });

    // --------------------------------------------------------- the manhole
    const mh = group(road, 0, MHE_ROAD, 0);
    const R = 0.34;
    cyl(mh, R, R, 1.3, 0, -0.65, 0, 0x2a2622, { rough: 0.98, seg: 26, open: true, side: 2, cast: false });
    box(mh, 1.0, 0.02, 1.0, 0, -1.3, 0, 0x1a1714, { rough: 0.98, cast: false });
    torus(mh, R + 0.05, 0.05, 0, 0.01, 0, 0x4a4f55, { rough: 0.6, metal: 0.6, seg: 8, seg2: 28 }).rotation.x = Math.PI / 2;
    // Flow channel at the invert, with the bench either side.
    const flow = box(mh, 0.6, 0.02, 0.16, 0, -1.26, 0, 0xffffff, { rough: 0.2, metal: 0.3, cast: false });
    flow.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.2, metal: 0.3, color: 0x6b6a4a });
    for (const sz of [-1, 1]) box(mh, 0.6, 0.08, 0.2, 0, -1.24, sz * 0.18, 0x3a3530, { rough: 0.95, cast: false });
    for (const sx of [-1, 1]) cyl(mh, 0.1, 0.1, 0.08, sx * 0.31, -1.18, 0, 0x14110e, { rough: 0.95, seg: 14, cast: false }).rotation.z = Math.PI / 2;
    // Rungs cast into the wall; the third is the corroded one.
    const rungs = group(mh, 0, 0, -R + 0.06);
    const rungMeshes = [];
    for (let i = 0; i < 5; i++) {
      const r = cyl(rungs, 0.012, 0.012, 0.26, 0, -0.16 - i * 0.22, 0, 0xa8b0b8, { rough: 0.5, metal: 0.7, seg: 8 });
      r.rotation.z = Math.PI / 2;
      rungMeshes.push(r);
    }
    const badRung = rungMeshes[2];
    badRung.material = mat(0x8a4a22, { rough: 0.9, metal: 0.3 });
    badRung.scale.set(0.55, 1, 0.55);
    reg(hits, badRung, "corroded-rung");
    const topRung = box(mh, 0.34, 0.1, 0.12, 0, 0.06, -R + 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mh, "top rung — climb out", -0.35, 0.5, -R, { css: MHE_CSS, w: 0.36 });
    reg(hits, topRung, "top-rung");
    const noLine = box(mh, 0.3, 0.1, 0.1, 0.12, 0.08, -R + 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mh, "down the rungs, no line?", 0.55, 0.74, -R, { css: "#d2312b", w: 0.5 });
    reg(hits, noLine, "ladder-no-line");
    // Needle in the rag mat on the bench.
    const debris = group(mh, 0.14, -1.19, 0.18);
    box(debris, 0.16, 0.03, 0.1, 0, 0, 0, 0x5b5040, { rough: 1.0 });
    const needle = cyl(debris, 0.005, 0.005, 0.1, 0.02, 0.03, 0, 0xd8dde2, { rough: 0.3, metal: 0.8, seg: 6 });
    needle.rotation.z = 1.1;
    ball(debris, 0.012, -0.03, 0.03, 0, 0xe8a0a0, { rough: 0.5 });
    reg(hits, debris, "sharps-debris");
    const leanHit = box(mh, 0.9, 0.3, 0.9, 0, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(mh, "lean over and look?", -0.55, 0.4, 0.45, { css: "#d2312b", w: 0.42 });
    reg(hits, leanHit, "lean-into-opening");
    const frameHit = torus(mh, R + 0.02, 0.02, 0, 0.03, 0, MHE_ACCENT, { emissive: MHE_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    frameHit.rotation.x = Math.PI / 2;
    frameHit.visible = false;
    reg(hits, frameHit, "cover-frame");

    // The cover, its parking spot and the lifter.
    const cover = group(road, 0, MHE_ROAD, 0);
    cyl(cover, R + 0.04, R + 0.04, 0.05, 0, 0.025, 0, 0x3d4247, { rough: 0.75, metal: 0.5, seg: 28 });
    decal(cover, 0.64, 0.64, 0, 0.052, 0, (cx, w, h) => {
      cx.fillStyle = "#3d4247"; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.49, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = "#2a2e32"; cx.lineWidth = 7;
      for (let i = 0; i < 5; i++) { cx.beginPath(); cx.arc(w / 2, h / 2, w * (0.12 + i * 0.08), 0, Math.PI * 2); cx.stroke(); }
      cx.fillStyle = "#23272b"; cx.font = `700 ${Math.round(h * 0.1)}px Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("SEWER", w / 2, h / 2);
    }, { px: 320 }).rotation.x = -Math.PI / 2;
    holoTag(cover, "cover — lifter", 0, 0.5, 0.2, { css: MHE_CSS, w: 0.3 });
    reg(hits, cover, "manhole-cover");
    const bareHands = box(road, 0.2, 0.12, 0.2, R + 0.12, MHE_ROAD + 0.06, 0.18, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(road, "fingers under the rim?", 0.75, MHE_ROAD + 0.38, 0.35, { css: "#d2312b", w: 0.46 });
    reg(hits, bareHands, "cover-bare-hands");
    const park = torus(road, 0.36, 0.012, 1.3, MHE_ROAD + 0.01, 1.0, MHE_ACCENT, { emissive: MHE_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    park.rotation.x = Math.PI / 2;
    holoTag(road, "cover parking spot", 1.3, MHE_ROAD + 0.3, 1.0, { css: MHE_CSS, w: 0.36 });
    reg(hits, park, "cover-park");
    const lifter = group(road, -0.6, MHE_ROAD, 0.7, 0.4);
    cyl(lifter, 0.012, 0.012, 1.0, 0, 0.5, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.z = 0.5;
    cyl(lifter, 0.07, 0.07, 0.05, 0.24, 0.05, 0, 0xc0392b, { rough: 0.5, metal: 0.6, seg: 14 });

    // ------------------------------------------------------ tripod and winch
    const tripod = group(road, 0, MHE_ROAD, 0);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.6;
      const leg = cyl(tripod, 0.024, 0.028, 2.0, Math.sin(a) * 0.55, 0.96, Math.cos(a) * 0.55, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 10 });
      leg.rotation.set(Math.cos(a) * 0.28, 0, -Math.sin(a) * 0.28);
    }
    ball(tripod, 0.08, 0, 1.92, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    const legChain = hose(tripod, [[0.3, 0.12, 0.99], [0.95, 0.12, -0.2], [-0.72, 0.12, -0.72], [0.3, 0.12, 0.99]], 0.008, 0x8a949d, { steps: 16, rough: 0.5, metal: 0.6 });
    void legChain;
    const winch = group(tripod, 0.38, 0.85, 0.32);
    box(winch, 0.16, 0.18, 0.13, 0, 0, 0, 0xd8b23a, { rough: 0.5, metal: 0.4 });
    const crank = group(winch, 0.1, 0, 0);
    box(crank, 0.02, 0.14, 0.02, 0.01, -0.05, 0, 0x2b3138, { rough: 0.5, metal: 0.6 });
    cyl(crank, 0.015, 0.015, 0.06, 0.04, -0.11, 0, 0x14171a, { rough: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(winch, "winch — crank", 0, 0.28, 0, { css: MHE_CSS, w: 0.28 });
    reg(hits, crank, "winch-crank");
    const lineRun = hose(tripod, [[0.38, 0.95, 0.32], [0.12, 1.75, 0.08], [0, 1.9, 0], [0, 0.4, 0]], 0.007, 0xe8eef2, { steps: 16, rough: 0.6 });
    void lineRun;
    const descentLine = cyl(tripod, 0.03, 0.03, 0.8, 0, 0.8, 0, MHE_ACCENT, { opacity: 0.35, transparent: true, emissive: MHE_ACCENT, ei: 0.6, cast: false, seg: 8 });
    holoTag(tripod, "retrieval line — climb", 0, 1.35, 0.1, { css: MHE_CSS, w: 0.42 });
    reg(hits, descentLine, "descent-line");
    const snap = group(tripod, 0, 0.35, 0);
    torus(snap, 0.03, 0.008, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    snap.visible = false;

    // ------------------------------------------------ gas monitor and probe
    const chest = toolChest(g, -1.6, 1.25, { ry: 0.3, color: 0x2f4f6f });
    const monitor = instrument(chest, -0.12, 0.79, 0.02, { ry: 0.2, idle: "O₂ 20.9 · H₂S 0", color: 0xf2c14b, w: 0.12, d: 0.18 });
    holoTag(monitor, "four-gas monitor", 0, 0.16, 0, { css: MHE_CSS, w: 0.34 });
    reg(hits, monitor, "gas-monitor");
    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: 0.1, idle: "CH 3 · COLLECTIONS", color: MHE_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "collar radio", 0, 0.16, 0, { css: MHE_CSS, w: 0.26 });
    reg(hits, radio, "collar-radio");
    const bumpCyl = group(chest, 0.0, 0.76, -0.12);
    cyl(bumpCyl, 0.035, 0.035, 0.2, 0, 0.1, 0, 0x3fae6a, { rough: 0.4, metal: 0.5, seg: 12 });
    cyl(bumpCyl, 0.015, 0.015, 0.04, 0, 0.22, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 });
    const reel = group(road, -0.62, MHE_ROAD, -0.45);
    cyl(reel, 0.12, 0.12, 0.06, 0, 0.14, 0, 0x2b3138, { rough: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    hose(reel, [[0, 0.14, 0], [0.3, 0.1, 0.25], [0.55, 0.02, 0.45], [0.62, -0.5, 0.45]], 0.008, 0xf2c14b, { steps: 12, rough: 0.7 });
    const probe = cyl(reel, 0.015, 0.015, 0.14, 0.62, -0.62, 0.45, 0xe07a3f, { rough: 0.5, seg: 8 });
    holoTag(reel, "sample probe — hold", 0, 0.5, 0, { css: MHE_CSS, w: 0.38 });
    reg(hits, reel, "sample-probe");
    void probe;

    // ------------------------------------------------ blower and generator
    const blower = group(road, 1.35, MHE_ROAD, -0.95, -0.3);
    box(blower, 0.42, 0.38, 0.38, 0, 0.19, 0, 0x2f6f8c, { rough: 0.55, metal: 0.3 });
    const fan = cyl(blower, 0.15, 0.15, 0.04, 0, 0.2, 0.2, 0x22272c, { rough: 0.6, seg: 18 });
    fan.rotation.x = Math.PI / 2;
    const blades = group(blower, 0, 0.2, 0.18);
    for (let i = 0; i < 4; i++) box(blades, 0.12, 0.025, 0.01, 0, 0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, cast: false }).rotation.z = (i * Math.PI) / 2;
    holoTag(blower, "electric blower", 0, 0.62, 0, { css: MHE_CSS, w: 0.32 });
    reg(hits, blower, "blower");
    hose(road, [[1.3, MHE_ROAD + 0.3, -0.75], [0.8, MHE_ROAD + 0.35, -0.35], [0.2, MHE_ROAD + 0.2, -0.1], [0.12, -0.4, -0.05], [0.1, -0.9, 0]], 0.07, 0xf2c14b, { steps: 22, rough: 0.8 });
    const gen = group(road, 1.95, MHE_ROAD, -0.55, 0.2);
    box(gen, 0.5, 0.36, 0.34, 0, 0.18, 0, 0xc0392b, { rough: 0.55, metal: 0.3 });
    box(gen, 0.52, 0.04, 0.36, 0, 0.38, 0, 0x2b3138, { rough: 0.5, metal: 0.5 });
    cyl(gen, 0.025, 0.025, 0.12, -0.22, 0.3, 0.12, 0x3a3f44, { rough: 0.6, metal: 0.5, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(gen, "generator at the intake?", 0, 0.66, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, gen, "generator-by-intake");

    // ------------------------------------------------------ work zone
    const sign = group(g, 2.9, 0, 1.2, -0.3);
    cyl(sign, 0.025, 0.025, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    box(sign, 0.5, 0.04, 0.4, 0, 0.02, 0, 0x2b3138, { rough: 0.6 });
    const diamond = decal(sign, 0.62, 0.62, 0, 1.35, 0.03, (cx, w, h) => {
      cx.fillStyle = "#f28a1c"; cx.beginPath(); cx.moveTo(w / 2, 4); cx.lineTo(w - 4, h / 2); cx.lineTo(w / 2, h - 4); cx.lineTo(4, h / 2); cx.closePath(); cx.fill();
      cx.strokeStyle = "#111"; cx.lineWidth = 6; cx.stroke();
      cx.fillStyle = "#111"; cx.font = `800 ${Math.round(h * 0.11)}px Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("ROAD WORK", w / 2, h * 0.44); cx.fillText("AHEAD", w / 2, h * 0.58);
    }, { px: 256 });
    void diamond;
    holoTag(sign, "advance warning sign", 0, 1.85, 0, { css: MHE_CSS, w: 0.4 });
    reg(hits, sign, "advance-sign");
    const taper = group(g, 0, MHE_ROAD, 0);
    const cones = [];
    for (let i = 0; i < 5; i++) cones.push(cone(taper, 2.7 - i * 0.55, -0.05 - i * 0.26));
    holoTag(taper, "cone taper", 2.1, 0.8, -0.3, { css: MHE_CSS, w: 0.26 });
    reg(hits, taper, "taper-cones");
    const pickup = box(taper, 0.3, 0.3, 0.3, 2.7, 0.2, -0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, pickup, "taper-pickup");

    // The car that noses into the taper.
    const car = group(g, 5.2, MHE_ROAD, -0.2, -Math.PI / 2);
    box(car, 0.9, 0.3, 1.9, 0, 0.3, 0, 0x5a7aa0, { rough: 0.4, metal: 0.5 });
    box(car, 0.8, 0.26, 0.95, 0, 0.58, -0.1, 0x5a7aa0, { rough: 0.4, metal: 0.5 });
    box(car, 0.78, 0.2, 0.02, 0, 0.6, 0.38, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    for (const [wx, wz] of [[-0.45, -0.6], [0.45, -0.6], [-0.45, 0.6], [0.45, 0.6]]) cyl(car, 0.16, 0.16, 0.12, wx, 0.16, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.z = Math.PI / 2;
    for (const sx of [-1, 1]) ball(car, 0.05, sx * 0.3, 0.36, 0.96, 0xf6f0d0, { emissive: 0xf6f0d0, ei: 1.2 });
    car.visible = false;

    // Flagger with the paddle.
    const flagger = standingFigure(g, 2.3, 2.1, { ry: 1.9, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xf2f2f2 });
    holoTag(flagger, "flagger", 0, 1.95, 0, { css: MHE_CSS, w: 0.2 });
    const paddle = group(g, 2.95, 0, 2.4, 1.2);
    cyl(paddle, 0.018, 0.018, 1.8, 0, 0.9, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const paddleFace = decal(paddle, 0.42, 0.42, 0, 1.9, 0.02, (cx, w, h) => {
      cx.fillStyle = "#e8e8e0"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#1a8a3a"; cx.beginPath(); cx.arc(w / 2, h / 2, w * 0.46, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#fff"; cx.font = `800 ${Math.round(h * 0.22)}px Arial, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("SLOW", w / 2, h / 2);
    }, { px: 256 });
    holoTag(paddle, "stop / slow paddle", 0, 2.3, 0, { css: MHE_CSS, w: 0.36 });
    reg(hits, paddle, "flagger-paddle");

    // ---------------------------------------------------- harness and rack
    const rack = group(g, -2.6, 0, 0.9, 0.5);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const harness = group(rack, 0.14, 1.05, 0.02);
    box(harness, 0.05, 0.5, 0.02, -0.06, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.05, 0.5, 0.02, 0.06, 0, 0, 0xe07a3f, { rough: 0.8 });
    box(harness, 0.2, 0.05, 0.02, 0, -0.12, 0, 0xe07a3f, { rough: 0.8 });
    torus(harness, 0.025, 0.007, 0, 0.2, -0.02, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 12 });
    holoTag(rack, "full-body harness", 0.14, 1.6, 0, { css: MHE_CSS, w: 0.36 });
    reg(hits, harness, "full-harness");
    const snapHit = torus(road, 0.05, 0.012, 0.0, MHE_ROAD + 0.55, 0.0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 14 });
    holoTag(road, "line to back D-ring", -0.2, MHE_ROAD + 0.95, 0.25, { css: MHE_CSS, w: 0.4 });
    reg(hits, snapHit, "winch-snap");

    // ------------------------------------------------------ truck behind
    const truck = group(g, -1.9, MHE_ROAD, -1.95, 0);
    box(truck, 2.2, 0.8, 0.95, 0, 0.7, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.8, 0.7, 0.95, 1.5, 0.65, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.02, 0.3, 0.8, 1.91, 0.8, 0, 0x1d2c38, { rough: 0.2, metal: 0.3 });
    box(truck, 2.2, 0.08, 0.96, 0, 0.9, 0, 0xf28a1c, { rough: 0.6 });
    for (const [wx, wz] of [[-0.7, -0.5], [0.7, -0.5], [1.5, -0.5], [-0.7, 0.5], [0.7, 0.5], [1.5, 0.5]]) cyl(truck, 0.22, 0.22, 0.14, wx, 0.22, wz, 0x14171a, { rough: 0.85, seg: 14 }).rotation.x = Math.PI / 2;
    const beacon = ownMaterial(ball(truck, 0.07, 1.5, 1.08, 0, 0xf2a61c, { emissive: 0xf2a61c, ei: 2.0 }));
    beacon.visible = false;

    // ------------------------------------------------------------ paperwork
    const permit = holoPanel(g, 0.95, 0.66, -2.3, 1.3, -0.4, (cx, w, h) => {
      cx.fillStyle = "#081a1f"; cx.fillRect(0, 0, w, h); cx.fillStyle = MHE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cff2f6"; cx.fillText("ENTRY PERMIT — SEWER MANHOLE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Hazards: O₂ deficiency · H₂S · methane · flow surge", "Acceptable: O₂ 19.5–23.5% · flammables under 10% LFL", "H₂S and CO under the permit limits", "Test order: O₂ → flammables → toxics, top-mid-bottom",
       "Ventilation: electric blower, continuous", "Retrieval: tripod + winch · rescue called, not entered"]
        .forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: MHE_ACCENT });
    reg(hits, permit, "permit-board");
    const log = holoPanel(g, 0.6, 0.42, 2.5, 1.25, 0.9, (cx, w, h) => {
      cx.fillStyle = "#081a1f"; cx.fillRect(0, 0, w, h); cx.fillStyle = MHE_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#cff2f6"; cx.fillText("PERMIT CLOSE-OUT", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Readings: —", "Findings: —", "Permit: OPEN"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: MHE_ACCENT });
    reg(hits, log, "permit-log");

    // ------------------------------------------------------------- crew
    const tender = standingFigure(g, 1.0, 1.45, { ry: -2.6, cloth: 0x1f3a52, vest: 0xd8f23a, helmet: 0xf2f2f2, gloves: true });
    holoTag(tender, "attendant — never enters", 0, 1.95, 0, { css: MHE_CSS, w: 0.46 });
    const paper = decal(g, 0.2, 0.26, -1.25, 0.02, 2.25, paperFace("SHARPS", ["grabber", "tube"], { bg: "#e8e0c8", band: MHE_CSS }), { px: 128 });
    paper.rotation.x = -Math.PI / 2;

    const carHome = car.position.clone();
    const flowTex = flow.material.map;
    let surge = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.5, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "work-zone") beacon.visible = true;
        if (step.id === "cover-off") { cover.position.set(1.3, MHE_ROAD, 1.0); park.visible = false; }
        if (step.id === "ventilate") repaint(monitor.userData.screen, signFace("PURGING", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "shaft-survey") badRung.material = mat(0xd24a2b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.8 });
        if (step.id === "harness-connect") snap.visible = true;
        if (step.id === "invert-check") debris.visible = false;
        if (step.id === "close-out") { cover.position.set(0, MHE_ROAD, 0); frameHit.visible = false; for (const c of cones) c.visible = false; }
        if (step.id === "entry-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#081a1f"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#cff2f6"; cx.fillText("PERMIT CLOSE-OUT", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#bfeaf7";
            ["Readings: top-mid-bottom in limits", "Rung 3 corroded · needle on bench", "Permit: CANCELLED · lane open"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ENTRY CLOSED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "vehicle-in-taper") { car.visible = true; car.position.set(2.2, MHE_ROAD, -0.35); }
        if (it.id === "upstream-pump-start") { surge = true; flow.position.y = -1.1; flow.scale.set(1, 1, 2.2); flow.material = mat(0x7a6a3a, { rough: 0.2, metal: 0.2 }); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vehicle-in-taper") { car.position.copy(carHome); car.visible = false; repaint(paddleFace, signFace("STOP", { bg: "#b8202a", accent: "#ffffff", fg: "#ffffff", scale: 0.8 })); }
        if (it.id === "upstream-pump-start") { surge = false; flow.position.y = -1.26; flow.scale.set(1, 1, 1); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (flowTex?.offset) flowTex.offset.x = t * (surge ? 0.2 : 0.04);
        blades.rotation.z = t * 14;
        if (session?.turn && step?.id === "winch-brake") crank.rotation.x = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bump-check") repaint(monitor.userData.screen, signFace(`H₂S ${Math.round(gg.t * 50)} ppm`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        if (step?.id === "descent" && session.holding) {
          const v = session.track.v;
          descentLine.scale.y = 0.6 + v;
        }
        if (beacon.visible && beacon.material) beacon.material.emissiveIntensity = 1.5 + Math.sin(t * 8);
        void dt; void CITY;
      },
    };
  },
};
