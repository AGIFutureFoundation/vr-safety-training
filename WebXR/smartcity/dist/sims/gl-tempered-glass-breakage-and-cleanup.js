import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, concreteFace, stainlessFace, reg,
} from "../citykit.js";
import { glassVacuumLifter } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tempered Glass Breakage And Cleanup VR — Construction &
// Structural Trades, glaziers and architectural metal pack. A tempered lite
// in a fifth-floor curtain wall bay has let go on its own — no impact
// anyone saw, just the sound and then the pebbles — and the response is not
// the same job as setting a new one. A tempered lite in pieces is still
// glass, the frame usually still holds a fringe of it under whatever
// tension broke the rest, and the hole it leaves is a fall hazard until
// something covers it. Cleanup here is a procedure with its own order, not
// just a broom.

const GLTB_ACCENT = 0xd97a3a;

export const SIM_GL_TEMPERED_GLASS_BREAKAGE_AND_CLEANUP = {
  id: "gl-tempered-glass-breakage-and-cleanup",
  index: "357",
  domain: "Construction & Structural Trades",
  trade: "Glazier — IUPAT District Council 16 emergency glazing response",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "IUPAT District Council 16 glaziers apprenticeship and training (architectural glass and metal); IUPAT Finishing Trades Institute glazier curriculum; ANSI/ASSP Z97.1 safety glazing materials for the replacement lite; OSHA 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria for the open bay; the glazing system manufacturer's guidance on spontaneous tempered breakage and frame inspection before reglazing",
  name: "Tempered Glass Breakage And Cleanup",
  title: simTitle("Tempered Glass Breakage And Cleanup"),
  tagline: "Cordon and PPE, the wind read at the open bay, the frame's fringe freed under control, the pebbles swept, a temporary cover held and fastened, the neighbouring unit checked, and the incident logged",
  accent: GLTB_ACCENT,
  accentCss: "#d97a3a",
  parSeconds: 280,
  footprint: 2.2,
  badge: { id: "bay-covered-clean", name: "Bay Covered Clean", note: "A shattered lite cleared and the open bay covered with nobody cut by the fringe and nobody near the hole it left" },

  supportLine: "your IUPAT District Council 16 apprenticeship coordinator or job steward, or your employer's employee assistance program if the sound of the lite letting go is what you keep hearing",

  game: system({
    name: "Response Crew",
    currency: "SHARD",
    ranks: ["Pre-apprentice", "Ground Hand", "Glazier", "Lead Glazier", "Emergency Response Certified"],
    badges: [
      { id: "wind-read", name: "Wind Read", note: "The wind at the open bay read before the cover went up", test: AWARD.stepClean("wind-read") },
      { id: "cordon-held", name: "Cordon Held", note: "No unsafe action toward the open bay or the fringe the whole run", test: AWARD.safe },
      { id: "cover-secure", name: "Cover Secure", note: "The temporary cover fastened without a correction", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-response", name: "Clean Response", note: "The bay cleared and covered without a correction", test: AWARD.clean },
      { id: "fringe-controlled", name: "Fringe Controlled", note: "The frame's fringe never dropped uncontrolled", test: AWARD.unbroken },
      { id: "bay-in-time", name: "Bay In Time", note: "Cleared, covered and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "fringe-edge": "You pulled at the frame's remaining fringe of glass with a bare hand. A tempered lite that has broken does not always let go of the frame all at once — a fringe of pebbled glass can sit in the gasket held by nothing but its own jagged edges, and pulling it free by hand finds every one of those edges the moment it gives way. The fringe comes out gloved, worked loose evenly, never gripped and yanked.",
    "open-bay-no-glass": "You stepped toward the empty frame before the temporary cover was up. A curtain wall bay with no glass in it and no guardrail across it is the same fall hazard as any other open floor opening five storeys up, and it does not become less of one because the glass used to be there ten minutes ago. Nothing crosses this bay's footprint until the cover is fastened or a barrier is in its place.",
    "cover-clamp-pinch": "You reached fingers-first under the temporary cover while it was being clamped to the frame. The clamp draws the cover down against the frame's own edge in one motion, and a hand caught under that edge when the clamp closes gets exactly what the clamp was built to apply to plywood. Fingers stay on the cover's face, never under the edge the clamp is closing on.",
    "cover-wind-catch": "You carried the plywood cover to the opening without a second person steadying it. A sheet that size catches a gust at an open bay the same way any large flat panel does, and a cover that twists out of a one-person carry near an unglazed opening can go through the hole as easily as out of your hands. It travels flat, two-handed or two-person, from the stack to the frame.",
  },

  lateNotes: {
    "cover-panel": "The cover comes off the stack after the wind is read and the fringe is already out of the frame. A cover carried past a frame still holding jagged fringe is a cover carried past an edge nobody has controlled yet.",
    "sweep-tool": "The sweep starts only after the fringe is out and bagged. Sweeping around glass still hanging in the frame just moves the hazard closer to the broom.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the incident tailboard with the crew",
      cue: "Read the tailboard — which bay let go, who called it in, the wind limit for the cover, the cordon boundary — and sign it.",
      why: "A spontaneous breakage call is not a scheduled glazing job, and the tailboard for one exists to slow the crew down to the same discipline as any other bay: which bay, who is inside the cordon, what stops the work. Signing it is what turns an incident into a procedure the crew is actually running rather than a mess everyone is reacting to.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind at the open bay",
      cue: "Take the anemometer reading at the bay and commit it inside the working band before the cover is carried up.",
      why: "The bay is now a hole in the facade with nothing to slow what comes through it, and a plywood cover carried up to that hole adds sail area a normal glazing job never has to think about. A reading over the band means the cover waits at the stack, because a cover that catches a gust mid-carry can go through the opening it was meant to close.",
      gauge: { label: "WIND", speed: 0.68, green: [0.18, 0.46], readout: (t) => `${(t * 32).toFixed(0)} km/h`, missNote: "That reading is outside the working band for carrying the cover — over it, wait at the stack; under it, read it again at the bay." },
    },
    {
      id: "ppe-seq", kind: "sequence",
      targets: ["cut-gloves", "eye-protection", "coveralls"],
      itemNames: { "cut-gloves": "cut-resistant gloves", "eye-protection": "eye protection", "coveralls": "coveralls" },
      title: "Glove and cover up before touching anything in the frame",
      cue: "Cut-resistant gloves, then eye protection, then coveralls — in that order, before a hand goes near the frame or the pebbled glass on the floor.",
      why: "Tempered glass breaks into pebbles rather than blades, and it is still glass — a bare hand in the fringe or a knee down in the debris finds that out the same way it would with any other broken lite. The order matters because gloves protect the hand that reaches first, eye protection covers what a piece of fringe does on the way down, and coveralls are checked last because they matter for the sweep more than the fringe itself.",
      outOfOrderNote: "Gloves, then eyes, then coveralls — the hand goes into a glove before it goes anywhere near the frame.",
    },
    {
      id: "cordon-find", kind: "find", noHint: true,
      targets: ["cordon-gap", "stray-shard"],
      itemNames: { "cordon-gap": "a gap in the cordon tape", "stray-shard": "a shard that has migrated outside the cordon" },
      itemNotes: {
        "cordon-gap": "The cordon tape has a gap where it was strung around a pillar instead of past it — a way through the barrier nobody meant to leave.",
        "stray-shard": "A pebble of tempered glass has rolled clear of the cordon line and is sitting on the floor where the next person to walk this hallway will find it with a shoe.",
      },
      title: "Walk the cordon before anyone starts clearing the frame",
      cue: "Look at the cordon tape and the floor just outside it — click the two things wrong before the fringe is touched.",
      why: "The cordon is what keeps anyone who was not called to this incident from walking into it, and it fails the same quiet way any barrier does — strung around an obstacle instead of past it, or simply outrun by a pebble that bounced further than anyone expected. Both get answered before the crew's attention moves to the frame itself.",
    },
    {
      id: "fringe-check", kind: "select", target: "frame-fringe",
      title: "Assess the fringe still in the frame",
      cue: "Look at what glass is still held in the gasket around the frame before touching any of it.",
      why: "Not every piece of a tempered lite comes down when the lite breaks — a fringe held by the gasket's own grip can sit under real tension, and the way it lets go depends on which piece is worked loose first. Assessing it before touching it is what tells the crew whether this fringe comes out in one motion or needs working section by section.",
    },
    {
      id: "fringe-turn", kind: "turn", target: "fringe-tool",
      title: "Work the fringe free of the gasket",
      cue: "Turn the release tool evenly around the frame so the fringe comes free of the gasket under control rather than dropping at one point first.",
      why: "Working the fringe evenly around the frame is what keeps it coming out as one controlled piece instead of shedding pebbles from whichever corner is disturbed first — a fringe pulled at one point often drops the rest of itself the moment that point releases, straight down into the cordon or worse, over the edge below.",
      turn: { turns: 1, axis: "z", label: "RELEASE" },
    },
    {
      id: "shard-drag", kind: "drag", target: "fringe-remnant",
      title: "Move the freed fringe to the disposal bin",
      cue: "Cups or a gloved two-handed grip on the freed section, guide it from the frame to the lined disposal bin — not released until it is set down flat.",
      why: "The freed fringe is still a sheet of connected pebbles until it is actually broken up, and it is carried the way any glass is carried on this platform — flat, controlled, released only once it is resting somewhere it cannot slide off its own edge and finish separating into the pieces it is already trying to become.",
      drag: { to: "disposal-bin", radius: 0.45, missNote: "Not set down flat in the bin — a fringe section resting on an edge finishes coming apart there instead." },
    },
    {
      id: "sweep-track", kind: "track", target: "sweep-tool", seconds: 5,
      title: "Sweep the pebbled glass at a steady pace",
      cue: "Work the sweep across the floor at a steady pace so the pebbles are gathered rather than scattered further by a rushed pass.",
      why: "Tempered glass pebbles roll, and a sweep run too fast pushes as many past the dustpan as it collects, scattering them exactly toward the cordon line this crew is trying to keep clear. A steady pace is what actually gathers a pass instead of relocating the same pebbles two metres further across the floor.",
      track: { label: "SWEEP", green: [0.4, 0.62], rise: 0.55, fall: 0.43, drift: 0.13, readout: (v) => `${Math.round(v * 20)} cm/s` },
      holdBreakNote: "The sweep ran out of the band — pebbles scattered rather than gathered. Slow back into the band and pass that stretch again.",
    },
    {
      id: "cover-hold", kind: "hold", target: "cover-panel", seconds: 4,
      title: "Hold the temporary cover flat to the frame while it is clamped",
      cue: "Both hands on the cover, hold it flat against the empty frame while the first clamp is fitted — do not let go until it bites.",
      why: "Between the cover reaching the frame and the first clamp biting, it is held flat by your grip and nothing else, and letting go early lets a gust find the edge of a sheet that size and lever it away from the opening it was meant to close. The clamp is what turns the cover from something you are holding into something the frame is holding.",
      holdBreakNote: "You let go before the clamp bit — the cover lifted at the edge. Reset it flat to the frame and hold until the clamp is on.",
    },
    {
      id: "cover-turn", kind: "turn", target: "cover-fastener",
      title: "Fasten the cover to the frame",
      cue: "Turn each fastener into the frame around the cover's full perimeter, evenly, so no edge is left free to work loose.",
      why: "A cover fastened at two corners and left loose at the others is a cover that flexes at every gust until the loose edge tears free, so the fasteners go in evenly around the whole perimeter rather than finished at one side first. This cover is what stands between the opening and the weather until the bay is properly reglazed.",
      turn: { turns: 1, axis: "z", label: "FASTEN" },
    },
    {
      id: "neighbor-seq", kind: "sequence",
      targets: ["neighbor-edge-check", "neighbor-corner-check", "neighbor-log"],
      itemNames: { "neighbor-edge-check": "neighbouring lite's edge checked", "neighbor-corner-check": "neighbouring lite's corners checked", "neighbor-log": "neighbouring unit logged by pane number" },
      title: "Check the neighbouring unit",
      cue: "Check the edge of the lite next to the one that broke, then its corners, then log it by its pane number — in that order.",
      why: "A tempered lite can fail with no impact anyone saw, and the manufacturer's own guidance on that failure mode is to look at what is next to it — the same batch, the same install date, the same edge condition — rather than assume this was the only lite with a problem. The pane number is what lets this check be repeated on a schedule instead of once and forgotten.",
      outOfOrderNote: "Edge, then corners, then log it — the log is only worth something once the check behind it is actually done.",
    },
    {
      id: "bag-drag", kind: "drag", target: "bagged-shards",
      title: "Move the bagged shards to the skip",
      cue: "Lift the sealed bag by its handles, guide it from the sweep area to the site skip — not released until it is set inside.",
      why: "The bagged pebbles are handled the same as any load leaving this bay: carried under control and set down deliberately, because a bag of broken glass dropped from a height even the length of an arm can split open on landing and put the exact hazard this whole procedure just cleared back on the ground.",
      drag: { to: "site-skip", radius: 0.45, missNote: "Not set inside the skip — a bag dropped short can split and put the glass back on the ground." },
    },
    {
      id: "site-walk", kind: "find", noHint: true,
      targets: ["bin-lid-open", "walkway-shard"],
      itemNames: { "bin-lid-open": "the disposal bin lid left open", "walkway-shard": "a shard left on the walkway outside the cordon" },
      itemNotes: {
        "bin-lid-open": "The disposal bin's lid was never closed after the fringe went in — an open bin is one more way for a pebble to end up somewhere it shouldn't.",
        "walkway-shard": "A shard has ended up on the walkway just outside where the cordon used to run, right where foot traffic resumes once the tape comes down.",
      },
      title: "Walk the site once more before the cordon comes down",
      cue: "Look at the bin and the walkway — click the two things wrong before anyone reopens this area to foot traffic.",
      why: "The cordon coming down is the signal to everyone else that this area is safe again, and that signal is only honest if the bin is actually closed and the walkway is actually clear — both are exactly the kind of thing that gets assumed done because the main job, the cover, already went up.",
    },
    {
      id: "log", kind: "select", target: "incident-log",
      title: "Log the incident",
      cue: "Pane number, wind readings, the neighbouring unit's condition, the cover fastened and the faults found and fixed, and sign it.",
      why: "The log ties this pane's failure to a date, a wind reading and a name, which is what lets the manufacturer and the building owner actually track whether this was an isolated failure or the first of several from the same batch. It also carries the cordon gap and the open bin as fixed rather than assumed, for whoever reopens this hallway.",
    },
  ],

  interrupts: [
    {
      id: "gust-cover",
      kind: "Gust catches the cover",
      after: "cover-hold", delay: 3, seconds: 11,
      alert: "A gust has caught the cover before the second clamp is on, and it is lifting at the free edge.",
      cue: "The cover is lifting at its unfastened edge.",
      target: "cover-clamp",
      why: "A cover held at one clamp and lifting at the free edge is a cover the wind is actively trying to peel off the frame, and the second clamp is what stops that edge finding enough purchase to tear the whole sheet loose. The fastener sequence can continue once both clamps are actually holding it flat.",
      missNote: "The gust let go of the edge on its own and the cover settled back flat. It could as easily have peeled the sheet off the frame and back through the open bay. The second clamp exists for exactly this gap between the first bite and the last fastener, and it sat unused while the gust had its turn.",
      wrongNote: "It is the second cover clamp. Get the lifting edge flat again before the fasteners continue.",
    },
    {
      id: "walker-toward-cordon",
      kind: "Someone walks toward the cordon",
      after: "sweep-track", delay: 3, seconds: 11,
      alert: "Someone from down the hallway is walking toward the cordon line where the tape has come loose on one end.",
      cue: "Someone is walking toward the loose end of the cordon.",
      target: "cordon-tape",
      why: "Cordon tape hanging loose on one end reads as no barrier at all to someone who was not there when the lite broke, and the pebbles still being swept are exactly what that person is about to walk into. Restringing it now is what tells them the same thing the crew already knows about this hallway.",
      missNote: "The person walked up to the loose end and stopped on their own before crossing it. They noticed on their own, this time. The tape was down for exactly as long as it took someone to notice, and that is not a plan.",
      wrongNote: "It is the cordon tape. Restring it before anyone else reaches that gap.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, GLTB_ACCENT);

    // ------------------------------------------------------------ the floor
    const deck = box(g, 6.6, 0.06, 6.0, 0, 0.03, -0.2, 0x8b8d89, { rough: 0.9, cast: false });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom" }), { repeat: 5, px: 512 }), { rough: 0.92, metal: 0.05 });

    // ------------------------------------------------------------ the bay
    const wall = group(g, 0, 0.06, -2.4);
    box(wall, 7.0, 3.6, 0.3, 0, 1.8, -0.5, 0x8b8d89, { rough: 0.9, cast: false });
    for (const sx of [-2.4, 2.4]) {
      const mFrame = box(wall, 1.6, 3.4, 0.14, sx, 1.7, -0.3, 0x3a4a5c, { rough: 0.35, metal: 0.55 });
      mFrame.material = texturedMat(surfaceTexture((cx, w, h) => stainlessFace(cx, w, h, { base: "#3a4a5c", base2: "#2a3644" }), { repeat: 2, px: 256 }), { rough: 0.35, metal: 0.55 });
      box(wall, 1.4, 3.2, 0.02, sx, 1.7, -0.22, 0x9fd6e6, { rough: 0.12, metal: 0.1, opacity: 0.55, transparent: true, cast: false });
    }
    holoTag(wall, "Elevation 5 — Bay 9", 0, 3.9, -0.2, { css: "#d97a3a", w: 0.4 });

    // The broken bay: empty frame, fringe, pebbles on the floor.
    const bay = group(wall, 0, 1.7, -0.3);
    const frame = box(bay, 1.5, 3.2, 0.1, 0, 0, 0.1, 0x3a4a5c, { rough: 0.35, metal: 0.55 });
    hits["frame-fringe"] = frame;
    const fringe = group(bay, 0, 1.4, 0.14);
    box(fringe, 1.3, 0.35, 0.015, 0, 0, 0, 0x8fc9d8, { rough: 0.2, opacity: 0.4, transparent: true, cast: false });
    reg(hits, fringe, "fringe-remnant");
    const fringeEdgeZone = box(bay, 1.35, 0.4, 0.06, 0, 1.4, 0.14, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, fringeEdgeZone, "fringe-edge");
    const fringeTool = group(bay, 0.6, 1.4, 0.2);
    box(fringeTool, 0.03, 0.15, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    reg(hits, fringeTool, "fringe-tool");
    holoTag(bay, "fringe — free it evenly", 0, 1.9, 0.14, { css: "#d97a3a", w: 0.4 });
    const openBayZone = box(bay, 1.5, 3.2, 0.4, 0, 0, 0.2, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, openBayZone, "open-bay-no-glass");
    for (let i = 0; i < 30; i++) {
      const px = (Math.random() - 0.5) * 1.6, pz = (Math.random() - 0.5) * 1.2;
      const p = ball(g, 0.01 + Math.random() * 0.015, px, 0.05, pz + 0.6, 0x9fd6e6, { rough: 0.15, opacity: 0.7, transparent: true, cast: false });
      void p;
    }
    holoTag(g, "pebbled glass — sweep", 0, 0.5, 0.6, { css: "#d97a3a", w: 0.4 });

    // Neighbouring unit.
    const neighborUnit = box(wall, 1.4, 3.2, 0.02, 2.4, 1.7, -0.22, 0x9fd6e6, { rough: 0.1, metal: 0.05, opacity: 0.55, transparent: true, cast: false });
    const edgeCheck = box(wall, 1.44, 0.06, 0.06, 2.4, 0.15, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, edgeCheck, "neighbor-edge-check");
    const cornerCheck = box(wall, 0.1, 0.1, 0.06, 3.05, 3.28, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cornerCheck, "neighbor-corner-check");
    void neighborUnit;
    const neighborLogBoard = decal(wall, 0.18, 0.14, 2.4, 1.0, -0.18, paperFace("PANE 5-9-B", ["Batch: ____"], { bg: "#eef1f3", band: "#d97a3a" }), { px: 160 });
    reg(hits, neighborLogBoard, "neighbor-log");
    holoTag(wall, "neighbouring unit — check", 2.4, 3.5, -0.2, { css: "#d97a3a", w: 0.36 });

    // Cordon.
    const cordonPosts = [];
    for (const [x, z] of [[-2.6, 1.8], [2.6, 1.8], [2.6, -1.4], [-2.6, -1.4]]) cordonPosts.push(cyl(g, 0.02, 0.02, 0.9, x, 0.5, z, 0xf2c14b, { rough: 0.5, seg: 10 }));
    const cordonTape = box(g, 5.2, 0.01, 0.01, 0, 0.85, 1.8, 0xf2c14b, { rough: 0.6, cast: false });
    const cordonGap = box(g, 5.2, 0.9, 0.4, 0, 0.5, -1.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, cordonGap, "cordon-gap");
    holoTag(g, "cordon", 0, 1.05, 1.8, { css: "#d97a3a", w: 0.24 });
    const strayShard = ball(g, 0.02, 3.0, 0.02, 2.2, 0x9fd6e6, { rough: 0.15, opacity: 0.7, transparent: true, cast: false });
    reg(hits, strayShard, "stray-shard");
    reg(hits, cordonTape, "cordon-tape");

    // Cover, PPE, sweep tool, tools.
    const coverStack = group(g, -2.6, 0.06, 0.6, 0.3);
    box(coverStack, 1.4, 0.04, 3.0, 0, 0.02, 0, 0x8a7449, { rough: 0.85 });
    const coverPanel = group(coverStack, 0.2, 0.5, 0, 0.1);
    box(coverPanel, 1.4, 3.0, 0.03, 0, 0, 0, 0x8a7449, { rough: 0.85 });
    reg(hits, coverPanel, "cover-panel");
    holoTag(coverStack, "cover — two-handed", 0.2, 2.1, 0, { css: "#d97a3a", w: 0.36 });
    const coverWindZone = box(g, 2.0, 3.2, 1.5, -1.2, 1.7, 0.0, 0xf2ae14, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, coverWindZone, "cover-wind-catch");
    const clampA = group(bay, -0.7, 1.5, 0.16);
    box(clampA, 0.1, 0.14, 0.06, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    reg(hits, clampA, "cover-clamp");
    const clampPinchZone = box(bay, 0.14, 0.18, 0.1, -0.7, 1.5, 0.16, 0xd2312b, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, clampPinchZone, "cover-clamp-pinch");
    const coverFastener = group(bay, 0.5, 0.2, 0.16);
    box(coverFastener, 0.04, 0.04, 0.04, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, coverFastener, "cover-fastener");

    const sweepTool = group(g, 1.6, 0.1, 0.4, -0.3);
    box(sweepTool, 0.4, 0.03, 0.015, 0, 0, 0, 0x2b2f34, { rough: 0.6 });
    cyl(sweepTool, 0.015, 0.015, 1.0, 0, 0.5, -0.2, 0x8a7449, { rough: 0.6, seg: 8 }).rotation.x = 0.3;
    reg(hits, sweepTool, "sweep-tool");
    holoTag(g, "sweep tool", 1.6, 0.7, 0.4, { css: "#d97a3a", w: 0.26 });

    const bin = group(g, 2.4, 0.06, -1.4, 0.3);
    box(bin, 0.7, 0.6, 0.5, 0, 0.3, 0, 0x2b3138, { rough: 0.7, metal: 0.3 });
    const binLid = box(bin, 0.72, 0.03, 0.52, 0, 0.62, 0, 0x2b3138, { rough: 0.6, metal: 0.3 });
    reg(hits, binLid, "bin-lid-open");
    const disposalSlot = box(bin, 0.6, 0.5, 0.4, 0, 0.35, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["disposal-bin"] = disposalSlot;
    const walkwayShard = ball(g, 0.015, 3.6, 0.02, -1.8, 0x9fd6e6, { rough: 0.15, opacity: 0.7, transparent: true, cast: false });
    reg(hits, walkwayShard, "walkway-shard");

    const bag = group(g, 1.8, 0.06, -1.0, 0.3);
    box(bag, 0.4, 0.35, 0.3, 0, 0.18, 0, 0x1b2026, { rough: 0.85 });
    reg(hits, bag, "bagged-shards");
    holoTag(g, "bagged shards", 1.8, 0.5, -1.0, { css: "#d97a3a", w: 0.26 });
    const skip = group(g, 3.4, 0.06, 1.0, -0.3);
    box(skip, 1.4, 0.8, 1.0, 0, 0.4, 0, 0x3a5a2e, { rough: 0.7, metal: 0.2 });
    const skipSlot = box(skip, 1.2, 0.6, 0.8, 0, 0.6, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["site-skip"] = skipSlot;

    const ppeBox = group(g, -2.8, 0.06, -1.4);
    box(ppeBox, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const gloves = box(ppeBox, 0.2, 0.03, 0.14, 0, 0.16, 0, 0x1b2026, { rough: 0.9 });
    reg(hits, gloves, "cut-gloves");
    const glasses = box(ppeBox, 0.14, 0.03, 0.05, 0, 0.19, 0.05, 0x2b7bbf, { rough: 0.3, opacity: 0.6, transparent: true });
    reg(hits, glasses, "eye-protection");
    const coveralls = box(g, 0.3, 0.5, 0.1, -2.8, 0.3, -1.0, 0xd97a3a, { rough: 0.85 });
    reg(hits, coveralls, "coveralls");

    const anemometer = instrument(g, -2.6, 1.1, 1.0, { ry: 0.4, idle: "-- km/h", color: 0xd97a3a, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, anemometer, "anemometer");
    holoTag(g, "anemometer", -2.6, 1.4, 1.0, { css: "#d97a3a", w: 0.26 });

    const tailboard = group(g, -3.0, 0.7, 1.2, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("INCIDENT TAILBOARD — BAY 9", ["Bay: 5th floor, bay 9", "Cordon: strung, checked", "Wind limit: per plan at the bay", "Cover: plywood, two-person carry", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#d97a3a" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(g, "tailboard", -3.0, 1.25, 1.2, { css: "#d97a3a", w: 0.22 });
    const logBoard = group(g, 3.4, 0.7, -0.4, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("INCIDENT LOG — BAY 9", ["Pane: ____", "Wind: ____", "Neighbour: ____", "Cover: ____", "Signed: ____"], { bg: "#f4efe4", band: "#d97a3a" }), { px: 256 });
    reg(hits, logFace, "incident-log");
    holoTag(g, "incident log", 3.4, 1.15, -0.4, { css: "#d97a3a", w: 0.22 });
    holoPanel(g, 0.6, 0.42, -3.3, 1.7, -0.6, (ctx, w, h) => {
      ctx.fillStyle = "#1c1006"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d97a3a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fbe6d0";
      ctx.fillText("BREAKAGE RESPONSE — BAY 9", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Cause: spontaneous, per manufacturer's guidance", "Replacement: tempered, per Z97.1", "Cover: plywood, fastened full perimeter", "Neighbour check: same batch, same install date", "Cordon: down only after log signed"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: GLTB_ACCENT, ry: 0.5, stalk: true });

    const journeyman = standingFigure(g, -0.55, -1.7, { ry: 2.6, cloth: 0x9a5a2e, trousers: 0x2b2f34, helmet: 0xd97a3a, vest: 0xf2c14b, gloves: true });
    const walker = standingFigure(g, 4.4, -2.2, { ry: -2.2, cloth: 0x3a5a6e, trousers: 0x2b2f34, outfit: "office" });

    for (const [x, z] of [[-3.2, 2.4], [3.2, 2.4]]) cone(g, x, z);

    let holdingCover = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.6, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "cordon-find") { strayShard.visible = false; }
        if (step.id === "fringe-turn") { fringe.material = mat(0x59c97b, { rough: 0.5, opacity: 0.4, transparent: true }); }
        if (step.id === "shard-drag") { fringe.parent.remove(fringe); bin.add(fringe); fringe.position.set(0, 0.35, 0); fringe.rotation.set(0, 0, 0); }
        if (step.id === "cover-turn") { coverFastener.material = mat(0x59c97b, { rough: 0.5 }); }
        if (step.id === "bag-drag") { bag.parent.remove(bag); skip.add(bag); bag.position.set(0, 0.5, 0); bag.rotation.set(0, 0, 0); }
        if (step.id === "site-walk") { binLid.rotation.x = -1.2; walkwayShard.visible = false; }
        if (step.id === "log") repaint(logFace, paperFace("INCIDENT LOG — BAY 9", ["Pane: 5-9-B, spontaneous", "Wind: 8–14 km/h", "Neighbour: checked, no damage", "Cover: fastened full perimeter", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#d97a3a" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-cover") { coverPanel.rotation.y = 0.2; }
        if (it.id === "walker-toward-cordon") { walker.position.set(1.5, 0, 2.0); walker.rotation.y = 2.8; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-cover") { coverPanel.rotation.y = 0; }
        if (it.id === "walker-toward-cordon") { walker.position.set(4.4, 0, -2.2); walker.rotation.y = -2.2; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingCover = !!(step?.id === "cover-hold" && session.holding);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 32).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.18 && gg.t <= 0.46 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "fringe-turn") { fringeTool.rotation.z = tn.amount * Math.PI * 4; }
        if (tn && step?.id === "cover-turn") { coverFastener.rotation.y = tn.amount * Math.PI * 4; }
        if (holdingCover) coverPanel.position.z = Math.sin(t * 3) * 0.003;
      },
    };
  },
};
