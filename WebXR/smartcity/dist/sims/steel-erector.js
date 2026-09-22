import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Steel Erector VR — its own gamified system: Iron Certified.
// Structural steel connecting. A suspended column has no brakes, an open floor
// has no edge marking until somebody paints one, and a bolt tightened before
// its neighbours is a connection that is only pretending to be finished.

export const SIM_STEEL_ERECTOR = {
  id: "steel-erector",
  index: "12",
  domain: "Construction",
  trade: "Ironworker / structural steel connector",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "Ironworkers (IBB) — OSHA 29 CFR 1926 Subpart R qualified connector; fall protection under ANSI Z359 and rigging signals per ASME B30.5",
  name: "Steel Erector",
  title: simTitle("Steel Erector"),
  tagline: "Structural steel connecting: fall protection, tag-line control and the bolt-up sequence",
  accent: 0xffcc00,
  accentCss: "#ffcc00",
  parSeconds: 235,
  badge: { id: "iron-certified", name: "Iron Certified", note: "Every connection made with fall protection live and the tag line in hand" },

  game: system({
    name: "Iron Certified",
    currency: "IRON",
    ranks: ["Ground Rigger", "Connector", "Raising Gang Lead", "Bolt-Up Certified", "Iron Certified"],
    badges: [
      { id: "always-anchored", name: "Always Anchored", note: "Never work the leading edge unclipped", test: AWARD.safe },
      { id: "tag-line-control", name: "Tag Line Control", note: "Guide every member with the tag line, hand free of the steel", test: AWARD.stepClean("guide-member") },
      { id: "torque-true", name: "Torque True", note: "Hold the plumb reading near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "raising-gang", name: "Raising Gang", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-connection", name: "Clean Connection", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "iron-streak", name: "Iron Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "suspended-load-path": "You are standing under the load path. A suspended steel member has nothing holding it up but a sling and a hook — if either lets go, you are standing exactly where it lands.",
    "open-floor-hole": "That deck opening has no cover and no barricade. On a structural floor, a leading edge you cannot see coming is exactly how a fall happens on a surface that looks solid from three steps away.",
    "hand-guided-member": "You grabbed the swinging member with your hand instead of the tag line. A ton of suspended steel does not stop when your grip does — it keeps moving and takes your hand, or you, with it.",
    "unclipped-leading-edge": "You stepped to the leading edge without your lanyard connected to the overhead lifeline. At height, the edge of unfinished decking is a fall with nothing between you and the ground below.",
  },

  lateNotes: {
    "tag-line": "The tag line gets picked up once the member is already hooked and clear of the stack — never before the rigger signals it is ready to swing.",
    "torque-wrench": "Final torque is the last thing that happens on a connection, after every temporary and erection bolt is already snug.",
  },

  steps: [
    {
      id: "briefing", kind: "select", target: "erection-plan",
      title: "Read the erection plan",
      cue: "Confirm today's pick sequence, connection details and crane pattern.",
      why: "OSHA's steel erection standard, 29 CFR 1926 Subpart R, requires the erector to follow the controlling contractor's site-specific erection plan because a multi-story frame is only as stable as whatever bracing is actually in place at that moment. The raising gang works one pick at a time in the sequence the engineer set — skip ahead and the next member lands on steel that was never designed to carry it unbraced.",
    },
    {
      id: "anchor", kind: "select", target: "lifeline-anchor",
      title: "Connect to the horizontal lifeline",
      cue: "Clip your lanyard to the lifeline before stepping onto the steel.",
      why: "ANSI/ASSP Z359 fall protection standards and OSHA 29 CFR 1926 Subpart M both start from the same fact: a connector working the leading edge of unfinished decking has nothing else rated to arrest a fall. The horizontal lifeline is anchored and inspected before the shift starts precisely so it is already load-rated before anyone needs it to work — clipping in after you are already out on the beam is clipping in one step too late.",
    },
    {
      id: "harness-check", kind: "select", target: "harness",
      title: "Inspect the harness and positioning lanyard",
      cue: "Check the D-rings, webbing and lanyard shock pack for damage.",
      why: "A connector's fall arrest harness will not announce webbing that has taken a shock load, a D-ring that is bent, or a lanyard shock pack that has already deployed — the damage stays invisible until the moment it is asked to catch a real fall. OSHA 1926 Subpart M treats a pre-use inspection as part of using the equipment, not an optional extra, because steel connecting is exactly the trade where a bad harness gets found out by falling in it.",
    },
    {
      id: "signal-crane", kind: "select", target: "rigger-radio",
      title: "Confirm crane signal protocol",
      cue: "Establish hand signals and radio call-outs with the crane operator and rigger.",
      why: "ASME B30.5 governs the hand signals and radio communication a mobile crane crew works under, for one simple reason: the operator sitting in the cab cannot see the connection point where the load is landing. Every signal that moves the load has to mean the same thing to the operator, the rigger and the connector, because a load moving on a guess stops wherever the guess turns out to be wrong.",
    },
    {
      id: "hazard-scan", kind: "find", noHint: true,
      targets: ["unmarked-hole", "damaged-plank", "stray-decking"],
      itemNames: {
        "unmarked-hole": "unmarked deck opening",
        "damaged-plank": "cracked temporary plank",
        "stray-decking": "loose decking sheet",
      },
      itemNotes: {
        "unmarked-hole": "An opening with no cover or barricade is invisible to anyone walking the deck with their eyes on the next connection, not their feet.",
        "damaged-plank": "A cracked plank can fail under a load it was rated for yesterday. It gets pulled from service, not walked on 'one more time'.",
        "stray-decking": "A decking sheet that is not fastened down can shift or flip the moment weight lands on the wrong edge of it.",
      },
      decoyNotes: {
        "secure-plank": "That plank is sound and properly supported. Nothing to flag.",
        "covered-hole": "That opening already has its cover fastened down and marked. Move on.",
      },
      title: "Scan the deck for hazards",
      cue: "Walk the deck. Three hazards are hiding among the finished work — find them by looking.",
      why: "A deck that looks finished from the ladder is not the same thing as a deck that has been walked and checked — that is the whole logic behind requiring a hazard scan before anyone crosses a new section. OSHA's steel erection standard treats an unmarked opening, a damaged plank and loose decking as the three ways a floor that reads as solid turns out not to be, and the scan is what catches them before somebody's boot does.",
    },
    {
      id: "secure-deck", kind: "drag", target: "hole-cover",
      title: "Cover and barricade the opening",
      cue: "Carry the cover over to the opening the scan found and fit it in place.",
      why: "A hazard the scan found and nobody corrected is not a safer hazard — it is the same hole with one more person now aware of it and still not covering it. OSHA 29 CFR 1926 Subpart R treats an unprotected floor opening as a fall hazard requiring a cover rated for the loads that might cross it, fastened down and marked, before the next trade walks that section of deck.",
      drag: { to: "unmarked-hole", radius: 0.3, missNote: "Not lined up with the opening — carry the cover over the hole the scan found." },
    },
    {
      id: "guide-member", kind: "hold", target: "tag-line", seconds: 6,
      title: "Guide the suspended column with the tag line",
      cue: "Hold the tag line steady as the rigger swings the column into position.",
      why: "A suspended column swinging on a crane hook has no brakes and no sense of who is standing where — the tag line is the only thing keeping a connector's hands a rope's length from a ton of moving steel while still giving enough control to place it precisely. ASME B30 rigging practice calls for a tag line on any load that can rotate or drift, because a hand on the steel itself stops moving only when the steel does.",
      holdBreakNote: "Tag line let go mid-swing. A member with no one steering it will find its own path, and that path runs through whatever is in the way.",
    },
    {
      id: "land-member", kind: "select", target: "column-splice",
      title: "Land the member on the splice plate",
      cue: "Seat the column onto the receiving splice plate below.",
      why: "The splice plate below is machined to receive the column's base in one specific alignment, and it only tolerates that landing correctly once. Forcing a column down onto a plate it has not been squared to bends the plate before the first bolt is even started, turning a landing error into a fabrication problem nobody upstairs signed off on.",
    },
    {
      id: "align-plumb", kind: "gauge", target: "plumb-level",
      title: "Plumb and align the column",
      cue: "Adjust the turnbuckle and commit once the column reads plumb.",
      why: "Every connection erected above this one inherits whatever lean gets accepted at this column, because steel does not correct itself on the way up — it only adds error on top of error. OSHA's steel erection rule and standard ironworker practice both treat plumbing and bracing a column as the point where a lean is still a turnbuckle adjustment; wait until three more floors are landed on it and it is a structural problem instead.",
      gauge: {
        label: "COLUMN PLUMB", speed: 0.65, green: [0.44, 0.58],
        readout: (t) => `${((t - 0.5) * 40).toFixed(1)} mm out of plumb`,
        missNote: "Still out of plumb. Work the turnbuckle before a single bolt goes to final torque.",
      },
    },
    {
      id: "bolt-sequence", kind: "sequence",
      targets: ["temp-bolt-a", "temp-bolt-b", "erection-bolt"],
      itemNames: { "temp-bolt-a": "temporary bolt A", "temp-bolt-b": "temporary bolt B", "erection-bolt": "erection bolt" },
      title: "Install bolts in the required order",
      cue: "Temporary bolt A, then temporary bolt B, then the erection bolt.",
      why: "Temporary bolts hold a connection snug while it is checked, plumbed and braced — that is their entire job, and it is a job the erection bolt cannot do, because putting it in early locks the joint before it has been verified. OSHA 29 CFR 1926 Subpart R sets minimum bolt counts and sequencing for exactly this reason: a joint fastened out of order can look complete while still being unable to carry what the connection is rated for.",
      outOfOrderNote: "Wrong order — the temporary bolts stabilise the joint before the erection bolt is added to it.",
    },
    {
      id: "torque-final", kind: "select", target: "torque-wrench",
      title: "Apply final torque",
      cue: "Torque every bolt in the connection to the specified value in the required pattern.",
      why: "Final torque is a one-way operation — once a bolt is torqued to the connection's specified value in the required pattern, backing it off to fix an alignment problem means starting the joint over. IBB apprenticeship practice and the erection plan both hold final torque until the minimum bolt count is in and the column already reads plumb, so torquing never has to double as a shortcut past the checks that came before it.",
    },
    {
      id: "connection-log", kind: "select", target: "connection-log",
      title: "Log the connection complete",
      cue: "Record the bolt count and torque values, then release the crane hook.",
      why: "The crane hook stays on the load until the connection is logged as self-supporting, because that log is the only record the inspector and the next raising gang have that this joint was actually finished to the plan — bolt count, torque values, and who signed off on it. Releasing the hook before that record exists means trusting a connection that nobody but the connector has confirmed.",
    },
  ],

  // Two things that happen to a connector who is two hundred feet up with both
  // hands on a member and their eyes on the bolt holes. See shared/game.js.
  interrupts: [
    {
      id: "load-drifting",
      kind: "Load in the path",
      // Armed on the landing rather than the guide, because the guide step's own
      // control is the tag line — answering an alarm with the tool already in
      // your hand is a nudge, not an interruption. The member is landed but
      // still on the hook here, which is exactly when it drifts.
      after: "land-member", delay: 4, seconds: 12,
      alert: "The member is landed but still on the hook, and the crane has swung. It has drifted over the bay you are standing in.",
      cue: "Get the tag line on it before it finds you.",
      target: "tag-line",
      why: "A load under a crane hook is never still — it swings on the boom, it drifts on the wind, and it goes where the last movement sent it. The tag line is how a connector controls a load they cannot see the operator from.",
      missNote: "The member drifted the length of the bay overhead while you worked. Nothing came down. A load that is moving and unattended is one gust from being a load that is somewhere else, and you were underneath it the whole time.",
      wrongNote: "It is the tag line. Nothing else on this steel matters while a suspended load is drifting over your head.",
    },
    {
      id: "hole-uncovered",
      kind: "Floor opening opened",
      after: "bolt-sequence", delay: 3, seconds: 11,
      alert: "The deck crew have pulled the cover off the opening behind you to drop a bundle through, and walked away from it.",
      cue: "There is an uncovered hole in the deck behind you.",
      target: "hole-cover",
      why: "Deck openings get covered, secured and marked because on a working floor nobody looks down. A cover that comes off for one lift and does not go back is the single commonest fall through a deck there is.",
      missNote: "The opening stayed uncovered behind you for the rest of the connection. You knew it was there. The next trade up this deck does not, and they are the reason the rule is about covering it rather than remembering it.",
      wrongNote: "It is the hole cover. An open deck penetration behind you outranks the bolt-up in front of you.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.1, 0xffcc00);

    // ------------------------------------------------------------- steel deck
    box(g, 4.6, 0.14, 4.6, 0, 0.07, 0, 0x63696f, { rough: 0.85, metal: 0.2 });
    for (let i = -3; i <= 3; i++) box(g, 4.6, 0.004, 0.02, 0, 0.145, i * 0.7, 0x4a5057, { cast: false, receive: false });

    // Perimeter beams reading as the raised structural floor.
    for (const [bx, bz, bw, bl] of [[0, -2.2, 4.6, 0.2], [0, 2.2, 4.6, 0.2], [-2.2, 0, 0.2, 4.6], [2.2, 0, 0.2, 4.6]]) {
      box(g, bw, 0.22, bl, bx, 0.2, bz, 0x545e67, { rough: 0.45, metal: 0.6 });
    }

    // Horizontal lifeline strung across the work bay.
    const lifelinePosts = [];
    for (const px of [-1.9, 1.9]) {
      const post = cyl(g, 0.03, 0.03, 1.1, px, 0.55, -1.6, CITY.darkSteel, { rough: 0.45, metal: 0.6, seg: 10 });
      lifelinePosts.push(post);
    }
    const lifeline = hose(g, [[-1.9, 1.08, -1.6], [0, 1.05, -1.55], [1.9, 1.08, -1.6]], 0.008, 0xf2c14b,
      { steps: 16, rough: 0.7 });
    const anchorClip = group(g, -1.9, 0, -1.6, 0.4);
    torus(anchorClip, 0.05, 0.01, 0, 1.08, 0, 0xd8b23a, { rough: 0.45, metal: 0.6, seg: 8, seg2: 18 });
    holoTag(anchorClip, "Lifeline anchor", 0, 1.25, 0, { css: "#ffcc00", w: 0.32 });
    reg(hits, anchorClip, "lifeline-anchor");

    // Leading edge with no protection — the hazard.
    const leadingEdge = box(g, 1.6, 0.02, 0.5, 1.5, 0.22, 1.9, 0x63696f, { rough: 0.7, metal: 0.3 });
    holoTag(leadingEdge, "Leading edge", 0, 0.16, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, leadingEdge, "unclipped-leading-edge");

    // Separate, unrelated open floor hole elsewhere on the deck.
    const openHole = group(g, -0.7, 0, 1.7);
    box(openHole, 0.5, 0.02, 0.5, 0, 0.135, 0, 0x1c2126, { rough: 0.9, cast: false });
    holoTag(openHole, "Uncovered opening", 0, 0.3, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, openHole, "open-floor-hole");

    // ------------------------------------------------------------- gang and crane
    const craneCab = group(g, 0, 0, -2.6, 0);
    box(craneCab, 0.5, 0.4, 0.5, 0, 2.6, 0, 0x545e67, { rough: 0.55, metal: 0.5 });
    const boom = box(craneCab, 3.6, 0.14, 0.14, 1.6, 2.55, 0, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    boom.rotation.y = -0.18;

    // Suspended column, hooked and mid-swing above the splice plate.
    const column = group(g, 0.35, 0, 0.15, 0.15);
    const hookCable = hose(g, [[0.9, 2.6, -2.3], [0.55, 1.9, -1.0], [0.42, 1.35, 0.15]], 0.012, CITY.steel,
      { steps: 18, rough: 0.6, metal: 0.6 });
    box(column, 0.16, 0.9, 0.16, 0, 0.9, 0, 0x545e67, { rough: 0.45, metal: 0.55 });
    box(column, 0.24, 0.03, 0.24, 0, 1.36, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    reg(hits, column, "hand-guided-member");

    const loadShadow = box(g, 0.7, 0.005, 0.7, 0.4, 0.15, 0.2, 0x000000, { opacity: 0.28, transparent: true, cast: false });
    holoTag(loadShadow, "Load path", 0, 0.06, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, loadShadow, "suspended-load-path");

    const tagLine = group(g, 0.7, 0, 0.5, -0.3);
    hose(tagLine, [[0, 1.4, -0.35], [0.15, 0.6, -0.1], [0.28, 0.02, 0]], 0.008, 0xf2c14b, { steps: 14, rough: 0.75 });
    holoTag(tagLine, "Tag line", 0.28, 0.15, 0, { css: "#ffcc00", w: 0.24 });
    reg(hits, tagLine, "tag-line");

    // Splice plate the column lands on.
    const splice = group(g, 0.4, 0, 0.15);
    box(splice, 0.32, 0.05, 0.32, 0, 0.85, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    for (const [dx, dz] of [[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]]) {
      cyl(splice, 0.014, 0.014, 0.06, dx, 0.9, dz, CITY.steel, { rough: 0.35, metal: 0.8, seg: 10 });
    }
    const turnbuckle = cyl(splice, 0.02, 0.02, 0.24, 0.3, 1.0, 0.1, 0xd8b23a, { rough: 0.4, metal: 0.6, seg: 10 });
    turnbuckle.rotation.z = Math.PI / 2.4;
    holoTag(splice, "Splice plate", 0, 1.0, 0, { css: "#ffcc00", w: 0.28 });
    reg(hits, splice, "column-splice");

    const plumbGauge = instrument(splice, 0.24, 1.0, 0.14, { ry: -0.4, idle: "-- mm", color: 0xffcc00 });
    holoTag(plumbGauge, "Plumb level", 0, 0.15, 0, { css: "#ffcc00", w: 0.28 });
    reg(hits, plumbGauge, "plumb-level");

    // Bolts on the splice connection.
    const boltFaces = {};
    const boltSpecs = [
      { id: "temp-bolt-a", x: -0.09, z: -0.09, label: "TEMP A" },
      { id: "temp-bolt-b", x: 0.09, z: -0.09, label: "TEMP B" },
      { id: "erection-bolt", x: 0, z: 0.11, label: "ERECT" },
    ];
    for (const b of boltSpecs) {
      const holder = group(splice, b.x, 0.94, b.z);
      cyl(holder, 0.018, 0.018, 0.03, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10 });
      boltFaces[b.id] = decal(holder, 0.09, 0.045, 0, 0.03, 0, signFace(b.label, { bg: "#11181f", accent: "#ffcc00", scale: 0.5 }), { px: 160 });
      reg(hits, holder, b.id);
    }

    // ------------------------------------------------------------- deck hazard scan
    const unmarkedHole = group(g, -1.6, 0, -0.5);
    box(unmarkedHole, 0.4, 0.02, 0.4, 0, 0.135, 0, 0x1c2126, { rough: 0.9, cast: false });
    reg(hits, unmarkedHole, "unmarked-hole");
    const coveredHole = group(g, -1.4, 0, -1.2);
    box(coveredHole, 0.4, 0.03, 0.4, 0, 0.15, 0, 0xffcc00, { rough: 0.6 });
    reg(hits, coveredHole, "covered-hole");

    const damagedPlank = group(g, 1.5, 0, -1.2);
    box(damagedPlank, 0.5, 0.03, 0.2, 0, 0.16, 0, 0x8a6a3a, { rough: 0.9 });
    box(damagedPlank, 0.04, 0.032, 0.22, -0.05, 0.16, 0, 0x2b2118, { rough: 0.9, cast: false });
    reg(hits, damagedPlank, "damaged-plank");
    const securePlank = group(g, 1.9, 0, -0.5);
    box(securePlank, 0.5, 0.03, 0.2, 0, 0.16, 0, 0x8a6a3a, { rough: 0.6 });
    reg(hits, securePlank, "secure-plank");

    const strayDecking = group(g, 1.3, 0, 1.4, 0.2);
    box(strayDecking, 0.5, 0.02, 0.4, 0, 0.15, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    reg(hits, strayDecking, "stray-decking");

    const coverKit = group(g, -0.9, 0, 1.1, 0.3);
    box(coverKit, 0.42, 0.04, 0.42, 0, 0.17, 0, 0xffcc00, { rough: 0.55 });
    holoTag(coverKit, "Hole cover", 0, 0.32, 0, { css: "#ffcc00", w: 0.28 });
    reg(hits, coverKit, "hole-cover");

    // ------------------------------------------------------------- paperwork + gear
    const plan = holoPanel(g, 0.58, 0.4, -1.9, 1.5, 1.7, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffcc00"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("ERECTION PLAN · GRID C-4", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("COLUMN PICK 14 OF 22", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Plumb tolerance: ±5 mm over height", "Bolts: 2 temporary + 1 erection minimum",
       "Final torque: 480 N·m, star pattern", "Lifeline: west edge, both anchors",
       "Deck scan required before crossing"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.6, accent: 0xffcc00 });
    reg(hits, plan, "erection-plan");

    const chest = toolChest(g, 1.7, 1.4, { ry: -0.5, color: 0xffcc00 });
    const harness = group(chest, -0.1, 0.79, 0, 0.4);
    for (const sx of [-1, 1]) {
      const strap = box(harness, 0.03, 0.02, 0.22, sx * 0.06, 0, 0, 0xf2c14b, { rough: 0.85 });
      strap.rotation.x = 0.22;
    }
    box(harness, 0.16, 0.02, 0.04, 0, 0.014, 0.03, 0xf2c14b, { rough: 0.85 });
    torus(harness, 0.022, 0.005, 0, 0.035, -0.07, CITY.steel, { rough: 0.3, metal: 0.9 });
    holoTag(harness, "Harness + lanyard", 0, 0.2, 0, { css: "#ffcc00", w: 0.34 });
    reg(hits, harness, "harness");

    const radio = instrument(chest, 0.16, 0.79, 0.04, { ry: -0.3, idle: "STANDBY", color: 0xffcc00 });
    holoTag(radio, "Crane radio", 0, 0.16, 0, { css: "#ffcc00", w: 0.28 });
    reg(hits, radio, "rigger-radio");

    const torqueWrench = group(chest, 0, 0.8, -0.16, 0.2);
    box(torqueWrench, 0.18, 0.03, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.7 });
    holoTag(torqueWrench, "Torque wrench", 0, 0.1, 0, { css: "#ffcc00", w: 0.3 });
    reg(hits, torqueWrench, "torque-wrench");

    const logBoard = group(g, 1.9, 0, 1.65, 0.7);
    slab(logBoard, 0.4, 0.3, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.26, 0, 1.1, 0.02,
      signFace("CONNECTION\nPENDING", { bg: "#11181f", accent: "#ffcc00", scale: 0.3 }), { px: 320 });
    holoTag(logBoard, "Connection log", 0, 1.32, 0, { css: "#ffcc00", w: 0.32 });
    reg(hits, logBoard, "connection-log");

    const grindSparks = particles(column, 20, 0xffe3a0, { size: 0.014, life: 0.3, additive: true });

    return {
      hits,
      footprint: 2.1,

      onStepComplete(step) {
        if (step.id === "hazard-scan") {
          unmarkedHole.children[0].material = mat(0x59c97b, { rough: 0.6 });
          damagedPlank.children[1].material = mat(0x59c97b, { rough: 0.6, cast: false });
          strayDecking.children[0].material = mat(0x59c97b, { rough: 0.5, metal: 0.3 });
        }
        // coverKit's own position/rotation are already set by the drag-and-
        // drop gesture (app.js snaps it onto the opening on a successful
        // drop) — just hide the dark void mesh it now sits on top of.
        if (step.id === "secure-deck") unmarkedHole.children[0].visible = false;
        if (step.id === "land-member") column.position.y = 0;
        if (step.id === "align-plumb") turnbuckle.rotation.z = Math.PI / 2;
        if (step.id === "bolt-sequence") {
          for (const b of boltSpecs) {
            repaint(boltFaces[b.id], signFace(b.label + "\nSNUG", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
          }
        }
        if (step.id === "torque-final") {
          for (const b of boltSpecs) {
            repaint(boltFaces[b.id], signFace(b.label + "\nTORQUED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.36 }));
          }
        }
        if (step.id === "connection-log") {
          repaint(logFace, signFace("CONNECTION\nLOGGED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
          hookCable.visible = false;
        }
      },

      // The member really drifts overhead, and the cover really comes off.
      onInterrupt(it) {
        if (it.id === "load-drifting") { column.position.x -= 0.5; column.position.z += 0.35; column.rotation.z = 0.06; }
        if (it.id === "hole-uncovered") { unmarkedHole.children[0].visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "load-drifting") { column.position.x += 0.5; column.position.z -= 0.35; column.rotation.z = 0; }
        if (it.id === "hole-uncovered") { unmarkedHole.children[0].visible = false; }
      },

      onHazard(hitId) {
        if (hitId === "hand-guided-member") { grindSparks.visible = true; }
      },

      animate(t, dt, session) {
        boom.rotation.y = -0.18 + Math.sin(t * 0.15) * 0.02;
        if (grindSparks.visible) {
          grindSparks.userData.step(dt, new THREE.Vector3(0, 0.9, 0), 0.05, 0.6, -1.4);
        }

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "align-plumb") {
          const mm = ((gg.t - 0.5) * 40).toFixed(1);
          repaint(plumbGauge.userData.screen, signFace(`${mm} mm`, {
            bg: "#0d1c24", accent: gg.t > 0.44 && gg.t < 0.58 ? "#59c97b" : "#ffcc00", fg: "#bfeaf7", scale: 0.5,
          }));
        }
      },
    };
  },
};
