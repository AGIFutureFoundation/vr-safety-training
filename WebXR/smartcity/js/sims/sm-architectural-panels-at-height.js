import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, hose, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Architectural Panels at Height VR — Manufacturing &
// Automation, SMART sheet metal pack. The outside of a building: a boom
// lift at a facade, a cart of metal composite panels, a clip rail, sealant
// joints and a coping to flash. Architectural sheet metal is the trade's
// finish work and its most exposed: every panel is a sail in the wind, every
// panel edge is a blade in a bare hand, and everything on the platform is a
// dropped object over a public footpath. The wind reading, the harness and
// the gloves come before the first panel, and the panel that is not clipped
// is clamped.

const SMAP_ACCENT = 0xc9b27a;

export const SIM_SM_ARCHITECTURAL_PANELS_AT_HEIGHT = {
  id: "sm-architectural-panels-at-height",
  index: "222",
  domain: "Manufacturing & Automation",
  trade: "Architectural sheet metal worker — SMART, International Training Institute architectural curriculum",
  category: "Manufacturing & Automation",
  weather: "wind",
  certification: "SMART and its International Training Institute architectural sheet metal curriculum; SMACNA Architectural Sheet Metal Manual for panel systems, copings, flashings and expansion; OSHA 29 CFR 1926.453 aerial lifts (boom-supported platforms), 29 CFR 1926.501 duty to have fall protection and 29 CFR 1926.502 fall protection systems criteria including the personal fall arrest system on the platform; the lift maker's wind rating and the panel maker's installation instructions",
  name: "Architectural Panels at Height",
  title: simTitle("Architectural Panels at Height"),
  tagline: "Tailboard and wind reading, harness inspected and tied off, the panel carried to the clip rail and clipped, held on the cups while it is fixed, the joint sealed at a steady bead, the platform walked for edges and dropped objects, logged",
  accent: SMAP_ACCENT,
  accentCss: "#c9b27a",
  parSeconds: 290,
  footprint: 2.2,
  badge: { id: "clipped-and-tied", name: "Clipped And Tied", note: "A panel run set at height with the wind read, the harness on the anchor and nothing loose on the rail" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your SMART local's apprenticeship coordinator or the job steward, or your employer's employee assistance program if the gust that took the panel is what you keep seeing",

  game: system({
    name: "Facade Crew",
    currency: "PANEL",
    ranks: ["Pre-apprentice", "Ground Hand", "Panel Installer", "Facade Lead", "Facade Crew Certified"],
    badges: [
      { id: "wind-read", name: "Wind Read", note: "The anemometer read against the lift's rating before the platform went up", test: AWARD.stepClean("wind-read") },
      { id: "nothing-dropped", name: "Nothing Dropped", note: "No unsafe action on the platform — gloves on, hook on the anchor, tools tethered", test: AWARD.safe },
      { id: "steady-bead", name: "Steady Bead", note: "The joint sealed at a steady rate", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-panel", name: "Clean Panel", note: "The panel set without a correction", test: AWARD.clean },
      { id: "cups-held", name: "Cups Held", note: "The panel never let go on the cups before it was clipped", test: AWARD.unbroken },
      { id: "panel-in-time", name: "Panel In Time", note: "Set, sealed and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-edge-panel": "You took the panel off the cart by its cut edge without gloves. A composite panel's edge is two skins of aluminium routed to a knife, and the panel weighs enough that a gust or a slip drags that edge through a bare palm; the gloves on the platform are for exactly that edge. The panel is carried by its return legs, gloved, or it is not carried.",
    "open-hook": "You clipped the lanyard's snap hook to the platform rail instead of the anchor point. The rail is not rated for a fall, and a snap hook on a round rail can roll out under load — the anchor point on the platform is the one place 29 CFR 1926.502 lets a personal fall arrest system attach on a boom lift. Anchor, not rail, and the gate checked closed.",
    "over-rail": "You leaned out over the top rail to reach the far clip. On a boom lift the platform can be flung by a bump or a gust and the harness only helps if you are inside the rails when it happens; a body over the rail is a body that the rail throws rather than holds. The lift moves so the clip is in front of you, not beside you.",
    "wind-override": "You turned the lift's wind-limit override so the platform would go up in the gust. The maker rated this platform for a wind speed, and an override exists for bringing it down, not for going up; a raised platform with a panel on it in a wind over the rating is a sail on a lever with you on the end. Over the limit, the panel waits on the ground.",
  },

  lateNotes: {
    "metal-panel": "The panel comes off the cart after the harness is on the anchor and the wind has been read. A panel picked up first is a sail in your hands before you are tied off.",
    "caulk-gun": "Sealant goes in a joint whose panels are both clipped. A bead between a clipped panel and one on the cups is a bead you will pull out when the second panel moves.",
  },

  steps: [
    {
      id: "check-in", kind: "select", target: "tailboard",
      title: "Sign the tailboard with the crew",
      cue: "Read the day's tailboard — the lift, the drop zone below, the wind limit, who is on the ground — and sign it.",
      why: "The tailboard is the crew's own briefing for a platform over a public footpath: who is on the platform, who is on the ground inside the drop zone's barriers, what the lift's wind rating is today and what stops work. Signing it is what makes you part of that crew rather than a person on a lift, and SMART facade crews read it every morning because the facade changes, the wind changes and the person on the ground is the one who gets hit by what falls.",
    },
    {
      id: "wind-read", kind: "gauge", target: "anemometer",
      title: "Read the wind against the lift's rating",
      cue: "Take the anemometer reading at the platform and commit it inside the working band — a gust over the rating stops the panel work.",
      why: "The boom lift's maker rates the platform for a wind speed, and a composite panel held on the platform adds sail area the rating never counted; the anemometer is read at the platform because the wind at the facade is not the wind on the ground. A reading over the band means the panel stays on the cart, not because of the rule but because of the lever: a gust on a panel at the end of a boom is a load on the platform that nobody calculated.",
      gauge: { label: "WIND", speed: 0.72, green: [0.2, 0.5], readout: (t) => `${(t * 40).toFixed(0)} km/h`, missNote: "That reading is outside the working band — over the rating, the panel waits on the ground; under it, take the reading again at the platform." },
    },
    {
      id: "harness", kind: "sequence",
      targets: ["harness-webbing", "lanyard-snap", "tie-off-anchor"],
      itemNames: { "harness-webbing": "harness webbing and stitching", "lanyard-snap": "lanyard and snap hook gate", "tie-off-anchor": "the platform's anchor point" },
      title: "Inspect the harness and tie off to the anchor",
      cue: "Webbing and stitching first, then the lanyard and its hook gate, then the hook onto the platform's rated anchor — in that order, before the platform leaves the ground.",
      why: "A personal fall arrest system on a boom lift is inspected before use under 29 CFR 1926.502: webbing for cuts and chemical burns, stitching for pulled threads, the snap hook for a gate that closes and locks. It is inspected before it is clipped on because a harness found cut at height is a harness you are already wearing, and the hook goes to the platform's anchor point rather than the rail because the anchor is what was rated for a person's fall.",
      outOfOrderNote: "Webbing, then lanyard, then anchor — the hook goes on last, onto a harness you have already proven.",
    },
    {
      id: "lift-controls", kind: "select", target: "boom-controls",
      title: "Function-check the platform controls",
      cue: "Boom up and down, slew, drive, the horn and the emergency lowering — each answered before you rely on it at height.",
      why: "29 CFR 1926.453 has the platform's controls tested each day before use, and the reason is the one control you need at height and have not tried: a slew that does not stop, an emergency lowering nobody has cycled since the lift arrived. The check is done at the ground with the platform a metre up, where a control that does not answer is an inconvenience rather than a platform stuck at the facade in a rising wind.",
    },
    {
      id: "panel-drag", kind: "drag", target: "metal-panel",
      title: "Carry the panel to the clip rail",
      cue: "Gloved, by the return legs, off the cart and onto the clip rail so the top return sits in the rail's hook along its whole length.",
      why: "The panel is carried by its return legs because they are the folded edges the system was designed to be handled by, and it is offered up to the rail so the top return engages the whole hook before it is let go; a panel hooked at one end and hanging at the other is a panel the wind will take off the rail. The cart to the rail is one movement with the panel against your body, not a walk across the platform with a sail held out.",
      drag: { to: "clip-rail", radius: 0.45, missNote: "The return is not in the rail's hook — a panel resting on the rail rather than hooked into it is a panel the wind owns." },
    },
    {
      id: "clip-fasten", kind: "turn", target: "clip-driver",
      title: "Drive the clip fasteners",
      cue: "Clip over the return, fastener driven to the panel maker's torque — not spun in until it stops — at each clip position on the rail.",
      why: "The clip holds the panel to the rail and lets it move as the aluminium expands in the sun, and the fastener is driven to the maker's torque because an overdriven screw in a thin rail strips its thread and holds nothing, while an underdriven one backs out under the panel's daily movement. The SMACNA Architectural Sheet Metal Manual gives the expansion allowance the clip must leave; a panel fixed rigid at every clip buckles by August.",
      turn: { turns: 1, axis: "z", label: "TORQUE" },
    },
    {
      id: "suction-hold", kind: "hold", target: "suction-lifter", seconds: 4,
      title: "Hold the panel on the cups while the second clip goes on",
      cue: "Cups pumped and locked on the panel face, hold it flat to the rail while the far clip is driven — do not let go until the clip is in.",
      why: "Between the first clip and the second, the panel is held to the facade by your grip on the cups and nothing else; letting go to reach for the driver puts the panel in the wind's hands for the seconds it takes to pick it up. The cups are pumped, the vacuum lock checked, and the panel held flat until the far clip is driven, because a panel that lifts at one edge in a gust is a panel that leaves the platform.",
      holdBreakNote: "You let go of the cups before the far clip was in — the panel lifted at the edge. Get it flat again and hold it until the clip is driven.",
    },
    {
      id: "sealant-bead", kind: "track", target: "caulk-gun", seconds: 5,
      title: "Seal the joint at a steady bead",
      cue: "Backer rod in, gun at the joint, then a continuous bead run at a steady pace so the sealant fills the joint to the depth the maker calls for.",
      why: "A sealant joint between panels is sized for movement: a bead run too fast is a skin over a void that tears the first winter, a bead run too slow overfills the joint and cures into a rigid block that pulls the panel edge. The steady pace is what puts the right depth of sealant on the backer rod along the whole joint, and the joint is the only part of the facade that keeps the weather out of the wall behind it.",
      track: { label: "BEAD", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 20)} mm/s` },
      holdBreakNote: "The bead ran out of the band — a void or an overfill in the joint. Tool it out and run that stretch again at a steady pace.",
    },
    {
      id: "reveal-check", kind: "select", target: "reveal-gauge",
      title: "Check the reveal",
      cue: "Set the reveal gauge in the joint between this panel and the last and confirm the width the drawing gives.",
      why: "The reveal between panels is what the architect drew and what the eye reads from the street: a joint that grows by a millimetre per panel across a facade is a visible taper at the corner, and a reveal narrowed to nothing is a joint with no room for the panels to move. The gauge is set in every joint because the drawing gives one number and the facade is a hundred panels, each of which can drift from it.",
    },
    {
      id: "joint-seq", kind: "sequence",
      targets: ["backer-rod", "joint-tool"],
      itemNames: { "backer-rod": "backer rod pressed to depth", "joint-tool": "the bead tooled" },
      title: "Finish the joint",
      cue: "Backer rod pressed to the maker's depth ahead of the bead, then the bead tooled to the rod so it bonds to both panel edges and not the rod.",
      why: "Sealant bonds to two sides of a joint and must not bond to the third, and the backer rod is what gives it that third side; without the rod the sealant sticks to the wall behind and tears itself when the panels move. It is tooled after the bead so the sealant is pressed onto both panel edges and shaped to shed water, which is the difference between a joint that lasts and one that lets water into the wall while looking sealed.",
      outOfOrderNote: "Rod first, then tool — tooling presses the bead onto the rod, and there is nothing to press it onto without one.",
    },
    {
      id: "edge-walk", kind: "find", noHint: true,
      targets: ["sharp-hem", "loose-driver"],
      itemNames: { "sharp-hem": "an unfolded sharp hem on the cart", "loose-driver": "the driver loose on the rail" },
      itemNotes: {
        "sharp-hem": "That panel on the cart came from the shop with its return unfolded — a routed edge standing open. It goes back down on the cart, not up on the rail.",
        "loose-driver": "The driver is resting on the top rail with its tether unclipped. A bump of the boom puts it on the footpath fifteen metres below.",
      },
      title: "Walk the platform before the boom moves",
      cue: "Look at what is on the platform and what is on the rail and click the two things that must not be there when the boom slews.",
      why: "A boom lift's platform is a shelf over a public footpath, and everything on it is a dropped object the moment the boom slews: a driver on the rail, a panel with an open edge, a tube of sealant. The platform is walked before every move because the drop zone below is a barrier and a person, and a tool falling fifteen metres does not care about either; the tether on the driver is what the walk checks.",
    },
    {
      id: "flashing", kind: "select", target: "expansion-joint",
      title: "Check the coping's expansion joint",
      cue: "At the parapet, confirm the coping's expansion joint is at the spacing the manual gives and the cover plate is free to move.",
      why: "A metal coping runs the length of a parapet in the sun, and it grows: the SMACNA Architectural Sheet Metal Manual gives the joint spacing that lets it, and a coping fixed solid across a joint buckles up off its cleats or tears its fasteners out of the wall. The cover plate is checked free because a plate sealed rigid to both sides is a joint that does not exist, and the failure shows up as a leak into the top of the wall a year later.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["unlatched-gate", "debris-net"],
      itemNames: { "unlatched-gate": "the platform gate not latched", "debris-net": "the torn debris net below" },
      itemNotes: {
        "unlatched-gate": "The gate closed behind you and never latched — a swing gate that can open outward is a rail that is not there.",
        "debris-net": "The debris net on the barrier below has a tear in it under this bay. Anything that leaves the platform goes straight through to the footpath.",
      },
      title: "Look at the gate and the ground before the next bay",
      cue: "Gate, then the drop zone below the platform — click the two things wrong with what keeps a fall or a drop from reaching somebody.",
      why: "The platform gate and the debris net below are the two controls between this bay and the public, and both fail quietly: a gate that swung shut without latching, a net torn by yesterday's offcut. The person on the platform is the only one who sees both from where they are, and the boom does not move to the next bay until both are answered — the gate now, the net by the ground hand before the next panel.",
    },
    {
      id: "panel-log", kind: "select", target: "panel-log",
      title: "Log the bay",
      cue: "Panels set, wind readings, the harness inspection, the sealant lot, the faults found and fixed, and sign it.",
      why: "The log carries the wind readings against the time each panel went up, which is what the crew shows when a panel comes off a facade in a storm and somebody asks whether it was set inside the rating. It also carries the harness inspection and the sealant lot, so a stitching failure or a sealant recall can be traced to this bay, and the unfolded hem and the torn net are on paper as fixed rather than assumed.",
    },
  ],

  interrupts: [
    {
      id: "lift-alarm",
      kind: "Lift alarm",
      after: "suction-hold", delay: 3, seconds: 12,
      alert: "The lift alarm — the platform overload alarm is sounding with the panel cart's weight on the deck and the boom fully extended.",
      cue: "The platform is over its rated load at full reach, and you are holding a panel.",
      target: "boom-estop",
      why: "A boom lift's load rating falls with reach, and the cart that was inside the rating at the base of the facade is outside it with the boom out; the overload alarm is the maker saying the platform is past what the boom was calculated to hold. The emergency stop takes the controls out of play so nobody slews an overloaded platform, and the load comes off before the boom moves. The panel on the cups stays where it is; the platform does not.",
      missNote: "You held the panel and let the overload alarm sound until it stopped. The boom held that time. The rating on the platform placard exists because the boom's calculation stops applying above it, and the alarm is the only warning between that line and the boom folding.",
      wrongNote: "It is the emergency stop on the platform. Kill the controls first — the load comes off a platform nobody can move.",
    },
    {
      id: "gust",
      kind: "Gust on the platform",
      after: "sealant-bead", delay: 3, seconds: 12,
      alert: "A gust has caught the next panel standing against the rail behind you. The wind sock has gone horizontal and the panel is lifting.",
      cue: "A panel is about to leave the platform over the footpath.",
      target: "panel-clamp",
      why: "A panel standing loose against the rail is a sail waiting for the gust that takes it, and the drop zone below is a barrier and a person. The clamp on the rail is what holds a panel that is not yet clipped, and it is put on before the bead is run, not after the gust; the bead can be tooled again, the panel cannot be caught once it is over the rail.",
      missNote: "You finished the bead and the panel went over the rail. The debris net below has a tear in it under this bay. A composite panel falling fifteen metres is a blade with the weight of a door behind it, and the wind that took it was on the anemometer ten minutes ago.",
      wrongNote: "It is the panel clamp on the rail. Clamp the loose panel first — the bead, the gun and the joint are all still there in a minute.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SMAP_ACCENT);

    // The platform deck the learner stands on, high on a boom over the plaza
    // below; the facade rises in front, the parapet and coping above it.
    const deck = box(g, 6.4, 0.06, 6.0, 0, 0.03, -0.3, 0x3a4048, { rough: 0.9, cast: false });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#3a3f45", base2: "#30353b", seam: "rgba(0,0,0,0.5)" }), { repeat: 5, px: 512 }),
      { rough: 0.9, metal: 0.3 });

    // ---------------------------------------------------------- the facade
    const facade = group(g, 0, 0.06, -2.2);
    box(facade, 7.0, 3.4, 0.3, 0, 1.7, -0.5, 0x6a6a66, { rough: 0.95, cast: false });               // backing wall
    for (let i = 0; i < 6; i++) box(facade, 0.06, 3.2, 0.12, -2.5 + i * 1.0, 1.6, -0.3, 0x8a8f94, { rough: 0.5, metal: 0.6 }); // sub-girts
    // The clip rail across the bay and the panels already set to the left.
    const rail = box(facade, 6.6, 0.06, 0.06, 0, 2.3, -0.25, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    box(facade, 6.6, 0.06, 0.06, 0, 1.0, -0.25, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    for (const sx of [-2.6, -1.4]) {
      box(facade, 1.1, 1.3, 0.04, sx, 1.65, -0.2, 0xb8a06a, { rough: 0.35, metal: 0.6 });
      box(facade, 1.1, 0.06, 0.06, sx, 2.33, -0.22, 0x8a7a4a, { rough: 0.4, metal: 0.6 });
    }
    const clipRail = box(facade, 1.1, 0.2, 0.1, -0.2, 2.3, -0.2, 0xffffff, { rough: 0.5 });
    clipRail.visible = false; hits["clip-rail"] = clipRail;
    holoTag(facade, "clip rail — bay 7", -0.2, 2.6, -0.15, { css: "#c9b27a", w: 0.34 });
    // Clips along the rail; the joint between the last panel and this one.
    const clips = [];
    for (const sx of [-0.7, 0.3]) clips.push(box(facade, 0.06, 0.08, 0.05, sx, 2.26, -0.18, 0x8a8f94, { rough: 0.4, metal: 0.7 }));
    const joint = group(facade, -0.78, 1.65, -0.18);
    const rod = cyl(joint, 0.012, 0.012, 1.2, 0, 0, -0.01, 0x9aa3a8, { rough: 0.9, seg: 8 });
    rod.visible = false;
    reg(hits, rod, "backer-rod");
    const beadMesh = box(joint, 0.02, 1.2, 0.01, 0, 0, 0.005, 0x4a4a4a, { rough: 0.8 });
    beadMesh.visible = false;
    const tool = group(joint, 0.1, -0.5, 0.05);
    box(tool, 0.02, 0.1, 0.02, 0, 0, 0, 0x22262b, { rough: 0.6 });
    box(tool, 0.04, 0.02, 0.01, 0, 0.06, 0, 0x8a8f94, { rough: 0.5, metal: 0.6 });
    reg(hits, tool, "joint-tool");
    holoTag(joint, "joint — rod, bead, tool", 0, 0.75, 0.05, { css: "#c9b27a", w: 0.4 });
    const revealGauge = group(facade, -0.78, 0.9, -0.1);
    box(revealGauge, 0.03, 0.12, 0.02, 0, 0, 0, 0xf2c14b, { rough: 0.6 });
    box(revealGauge, 0.1, 0.02, 0.02, 0, 0.07, 0, 0xf2c14b, { rough: 0.6 });
    reg(hits, revealGauge, "reveal-gauge");
    holoTag(facade, "reveal gauge", -0.78, 1.1, -0.05, { css: "#c9b27a", w: 0.26 });
    // The parapet and coping with its expansion joint.
    box(facade, 7.0, 0.3, 0.5, 0, 3.55, -0.4, 0x8a8f94, { rough: 0.4, metal: 0.6, cast: false });
    const expJoint = group(facade, 1.2, 3.72, -0.4);
    box(expJoint, 0.2, 0.03, 0.54, 0, 0, 0, 0xaeb5bb, { rough: 0.4, metal: 0.7 });
    holoTag(facade, "coping expansion joint", 1.2, 3.95, -0.1, { css: "#c9b27a", w: 0.4 });
    reg(hits, expJoint, "expansion-joint");
    // The wind sock on the parapet.
    const sockPole = cyl(facade, 0.015, 0.015, 1.0, 2.8, 4.2, -0.4, 0x8a8f94, { rough: 0.5, metal: 0.6, seg: 8 });
    const sock = group(facade, 2.8, 4.65, -0.4);
    const sockCone = cyl(sock, 0.04, 0.09, 0.5, 0.25, 0, 0, 0xe4622a, { rough: 0.8, seg: 10 });
    sockCone.rotation.z = Math.PI / 2;
    sock.rotation.z = -0.9;

    // ------------------------------------------------------- the platform
    // The boom platform the learner works from: rails, gate, anchor, controls,
    // the cart, the panel, the cups, the clamp.
    const platform = group(g, 0, 0.06, 0.4);
    box(platform, 2.4, 0.04, 1.6, 0, 0.02, 0, 0x50606c, { rough: 0.7, metal: 0.4, cast: false });
    const rails = group(platform, 0, 0, 0);
    for (const sx of [-1.18, 1.18]) for (const y of [0.55, 1.1]) box(rails, 0.03, 0.03, 1.6, sx, y, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const y of [0.55, 1.1]) box(rails, 2.4, 0.03, 0.03, 0, y, 0.79, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    for (const [sx, sz] of [[-1.18, -0.79], [1.18, -0.79], [-1.18, 0.79], [1.18, 0.79], [0, 0.79]]) box(rails, 0.03, 1.12, 0.03, sx, 0.56, sz, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(rails, 1.6, 0.03, 0.03, -0.4, 1.1, -0.79, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(rails, 1.6, 0.03, 0.03, -0.4, 0.55, -0.79, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    const overRail = box(rails, 1.6, 0.4, 0.2, -0.4, 1.35, -0.85, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, overRail, "over-rail");
    const gate = group(rails, 0.4, 0, -0.79);
    box(gate, 0.8, 0.03, 0.03, 0.4, 1.1, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(gate, 0.8, 0.03, 0.03, 0.4, 0.55, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    box(gate, 0.03, 0.6, 0.03, 0.78, 0.82, 0, 0xf2c14b, { rough: 0.6, metal: 0.3 });
    gate.rotation.y = 0.25;
    reg(hits, gate, "unlatched-gate");
    const anchor = group(platform, 0.9, 0.7, 0.7);
    box(anchor, 0.12, 0.12, 0.06, 0, 0, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    const ring = cyl(anchor, 0.05, 0.05, 0.02, 0, 0.06, 0, 0xd2312b, { rough: 0.5, metal: 0.5, seg: 14 });
    ring.rotation.x = Math.PI / 2;
    reg(hits, anchor, "tie-off-anchor");
    holoTag(platform, "anchor point", 0.9, 0.95, 0.7, { css: "#c9b27a", w: 0.26 });
    const railHook = group(platform, 1.16, 1.1, 0.2);
    box(railHook, 0.06, 0.12, 0.03, 0, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, railHook, "open-hook");
    holoTag(platform, "hook on the rail — no", 1.16, 1.3, 0.2, { css: "#d2312b", w: 0.36 });
    const ctrl = group(platform, 0.6, 1.0, 0.72);
    box(ctrl, 0.5, 0.14, 0.25, 0, 0, 0, 0x22262b, { rough: 0.6 });
    for (let i = 0; i < 3; i++) { cyl(ctrl, 0.02, 0.02, 0.06, -0.15 + i * 0.1, 0.08, -0.05, 0x2b2f34, { rough: 0.5, seg: 8 }); ball(ctrl, 0.02, -0.15 + i * 0.1, 0.12, -0.05, 0x22262b, { rough: 0.5 }); }
    reg(hits, ctrl, "boom-controls");
    const estop = cyl(ctrl, 0.035, 0.035, 0.03, 0.18, 0.08, 0.05, 0xd2312b, { rough: 0.4, seg: 14 });
    reg(hits, estop, "boom-estop");
    const override = group(ctrl, -0.18, 0.08, 0.07);
    cyl(override, 0.02, 0.02, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 10 });
    box(override, 0.006, 0.03, 0.01, 0, 0.012, 0, 0xd2d6da, { rough: 0.4, metal: 0.6 });
    decal(ctrl, 0.12, 0.03, -0.18, 0.075, 0.13, signFace("WIND OVR", { bg: "#22262b", accent: "#d2312b", scale: 0.5 })).rotation.x = -Math.PI / 2;
    reg(hits, override, "wind-override");
    holoTag(platform, "platform controls · stop", 0.6, 1.3, 0.72, { css: "#c9b27a", w: 0.42 });
    const loadBeacon = cyl(platform, 0.04, 0.04, 0.08, -1.1, 1.2, 0.75, 0xf2ae14, { emissive: 0xf2ae14, ei: 2.0, seg: 12 });
    loadBeacon.visible = false;
    const anemometer = instrument(platform, -0.9, 1.12, 0.7, { ry: 0.3, idle: "-- km/h", color: 0xc9b27a, w: 0.12, d: 0.17 });
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; ball(anemometer, 0.015, Math.sin(a) * 0.05, 0.12, Math.cos(a) * 0.05, 0x22262b, { rough: 0.5 }); }
    cyl(anemometer, 0.005, 0.005, 0.1, 0, 0.07, 0, 0x8a8f94, { rough: 0.5, seg: 6 });
    reg(hits, anemometer, "anemometer");
    holoTag(platform, "anemometer", -0.9, 1.35, 0.7, { css: "#c9b27a", w: 0.26 });
    // The panel cart with panels; the top one is dragged, one has a sharp open hem (find), and the edge is the hazard.
    const cart = group(platform, -0.6, 0.04, 0.2, 0.1);
    box(cart, 1.3, 0.05, 0.5, 0, 0.3, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    for (const [sx, sz] of [[-0.55, -0.2], [0.55, -0.2], [-0.55, 0.2], [0.55, 0.2]]) cyl(cart, 0.05, 0.05, 0.03, sx, 0.05, sz, 0x1b1e22, { rough: 0.7, seg: 12 }).rotation.z = Math.PI / 2;
    box(cart, 0.04, 1.2, 0.5, -0.62, 0.9, 0, 0x2f6f8c, { rough: 0.6, metal: 0.4 });
    const stackPanels = [];
    for (let i = 0; i < 3; i++) { const pnl = box(cart, 1.1, 1.3, 0.04, -0.3 + i * 0.08, 0.98, 0, 0xb8a06a, { rough: 0.35, metal: 0.6 }); pnl.rotation.y = 0; stackPanels.push(pnl); }
    const panel = box(cart, 1.1, 1.3, 0.04, 0.0, 0.98, 0, 0xc4ac72, { rough: 0.35, metal: 0.6 });
    reg(hits, panel, "metal-panel");
    holoTag(cart, "composite panel — by the returns", 0, 1.8, 0.1, { css: "#c9b27a", w: 0.5 });
    const bareEdge = box(cart, 1.14, 0.06, 0.06, 0.0, 1.65, 0, 0xd2312b, { rough: 0.5, opacity: 0.3, transparent: true, cast: false });
    reg(hits, bareEdge, "bare-edge-panel");
    const sharpHem = box(cart, 1.1, 0.04, 0.12, -0.14, 1.66, 0.06, 0xd2312b, { rough: 0.5, opacity: 0.4, transparent: true, cast: false });
    sharpHem.rotation.x = 0.8;
    reg(hits, sharpHem, "sharp-hem");
    const loosePanel = box(platform, 1.1, 1.3, 0.04, 0.3, 0.7, -0.6, 0xb8a06a, { rough: 0.35, metal: 0.6 });
    loosePanel.rotation.x = 0.12;
    holoTag(platform, "next panel — clamp it", 0.3, 1.5, -0.6, { css: "#f2ae14", w: 0.36 });
    const clampObj = group(platform, 1.0, 1.1, -0.79);
    box(clampObj, 0.06, 0.16, 0.06, 0, 0, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    cyl(clampObj, 0.012, 0.012, 0.1, 0, 0.1, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 });
    reg(hits, clampObj, "panel-clamp");
    holoTag(platform, "panel clamp", 1.0, 1.35, -0.79, { css: "#c9b27a", w: 0.26 });
    // Cups, driver, caulk gun, harness bag, log on the platform.
    const cups = group(platform, -0.2, 0.15, 0.55, 0.2);
    for (const sx of [-0.12, 0.12]) cyl(cups, 0.08, 0.08, 0.03, sx, 0, 0, 0x22262b, { rough: 0.7, seg: 14 });
    box(cups, 0.36, 0.03, 0.04, 0, 0.04, 0, 0xb8402f, { rough: 0.5, metal: 0.4 });
    box(cups, 0.1, 0.05, 0.04, 0, 0.09, 0, 0x22262b, { rough: 0.6 });
    reg(hits, cups, "suction-lifter");
    holoTag(platform, "vacuum cups", -0.2, 0.4, 0.55, { css: "#c9b27a", w: 0.24 });
    const driver = group(rails, -0.9, 1.13, 0.79);
    box(driver, 0.16, 0.05, 0.05, 0, 0, 0, 0x22262b, { rough: 0.6 });
    cyl(driver, 0.01, 0.01, 0.08, 0.12, 0, 0, 0x8a8f94, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, driver, "clip-driver");
    const looseDriver = box(rails, 0.1, 0.02, 0.02, 0.2, 1.13, 0.79, 0x1b1e22, { rough: 0.6 });
    reg(hits, looseDriver, "loose-driver");
    holoTag(platform, "driver — tethered?", -0.4, 1.35, 0.79, { css: "#f2ae14", w: 0.34 });
    const gun = group(platform, 0.4, 0.1, 0.55, -0.3);
    cyl(gun, 0.025, 0.025, 0.24, 0, 0, 0, 0x2f6f8c, { rough: 0.5, seg: 12 }).rotation.z = Math.PI / 2;
    box(gun, 0.06, 0.08, 0.02, -0.06, -0.05, 0, 0x22262b, { rough: 0.6 });
    reg(hits, gun, "caulk-gun");
    holoTag(platform, "sealant gun", 0.4, 0.35, 0.55, { css: "#c9b27a", w: 0.24 });
    const harnessBag = group(platform, 0.9, 0.1, 0.2, 0.3);
    box(harnessBag, 0.3, 0.16, 0.2, 0, 0.08, 0, 0x2b2f34, { rough: 0.8 });
    const webbing = box(harnessBag, 0.26, 0.04, 0.16, 0, 0.18, 0, 0xe4622a, { rough: 0.85 });
    reg(hits, webbing, "harness-webbing");
    const lanyard = hose(harnessBag, [[0.1, 0.2, 0.05], [0.25, 0.3, 0.1], [0.4, 0.25, 0.05]], 0.012, 0xe4622a, { steps: 10 });
    const snap = box(harnessBag, 0.05, 0.08, 0.02, 0.42, 0.25, 0.05, 0x8a8f94, { rough: 0.4, metal: 0.7 });
    reg(hits, snap, "lanyard-snap");
    holoTag(platform, "harness · lanyard", 0.9, 0.45, 0.2, { css: "#c9b27a", w: 0.3 });

    // ------------------------------------------------- the drop zone
    // The plaza deck is solid, so the drop zone reads at deck level behind the
    // platform: barriers, the debris net with its tear, the ground hand.
    const ground = group(g, 0, 0.06, 2.4);
    for (const sx of [-2.4, -1.0, 0.4, 1.8]) barrierPanel(ground, sx, -0.6, { ry: 0, w: 1.3 });
    const net = box(ground, 5.6, 0.9, 0.02, 0, 1.0, -0.6, 0x2f6f4a, { rough: 0.8, opacity: 0.5, transparent: true, cast: false });
    const netTear = box(ground, 0.5, 0.4, 0.03, 0.4, 0.9, -0.6, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true, cast: false });
    reg(hits, netTear, "debris-net");
    holoTag(ground, "debris net — drop zone", 0, 1.6, -0.6, { css: "#d2312b", w: 0.4 });
    const groundHand = standingFigure(ground, 1.4, 0.6, { ry: 3.0, cloth: 0x7a5a3a, trousers: 0x22262b, helmet: 0xf2c14b, vest: 0xf2c14b });

    // ------------------------------------------------- tailboard and log
    const tailboard = group(platform, -1.15, 0.7, 0.4, 1.4);
    box(tailboard, 0.5, 0.4, 0.03, 0, 0.35, 0, 0x1b2026, { rough: 0.6 });
    const tailFace = decal(tailboard, 0.46, 0.36, 0, 0.35, 0.018, paperFace("TAILBOARD — BAY 7", ["Platform: apprentice (you) + journeyman", "Ground: helper, drop zone", "Wind limit: 28 km/h (lift)", "Drop zone: barriers + net", "Stop work: gust over limit"], { bg: "#eef1f3", band: "#c9b27a" }), { px: 320 });
    reg(hits, tailFace, "tailboard");
    holoTag(platform, "tailboard", -1.15, 1.25, 0.4, { css: "#c9b27a", w: 0.22 });
    const logBoard = group(platform, 1.15, 0.7, -0.3, -1.4);
    box(logBoard, 0.4, 0.34, 0.03, 0, 0.3, 0, 0x1b2026, { rough: 0.6 });
    const logFace = decal(logBoard, 0.36, 0.3, 0, 0.3, 0.018, paperFace("PANEL LOG — BAY 7", ["Panels: ____", "Wind: ____", "Harness insp.: ____", "Faults: ____", "Signed: ____"], { bg: "#f4efe4", band: "#c9b27a" }), { px: 256 });
    reg(hits, logFace, "panel-log");
    holoTag(platform, "panel log", 1.15, 1.15, -0.3, { css: "#c9b27a", w: 0.22 });
    holoPanel(g, 0.6, 0.42, 2.3, 1.7, -0.8, (ctx, w, h) => {
      ctx.fillStyle = "#16130a"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9b27a"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#f5eed8";
      ctx.fillText("PANEL SCHEDULE — EAST ELEVATION", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Panel: 4 mm composite, 1100 x 1300", "Reveal: 15 mm ± 1", "Clip torque: per maker, 2.5 N·m", "Sealant: listed silicone, 10 mm depth", "Coping joint: every 3 m"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: SMAP_ACCENT, ry: -0.6, stalk: true });

    // ----------------------------------------------------------- the crew
    const journeyman = standingFigure(g, 2.4, 1.15, { ry: -2.4, cloth: 0x3a5a7a, trousers: 0x2b2f34, helmet: 0xc9b27a, vest: 0xf2c14b, harness: true, gloves: true });

    // --------------------------------------------------------- dressing
    for (const [x, z] of [[-2.6, 2.4], [2.7, 2.7]]) cone(g, x, z);
    const sealantBox = group(g, -2.4, 0.06, 1.6, 0.3);
    box(sealantBox, 0.4, 0.25, 0.3, 0, 0.12, 0, 0x8b6a42, { rough: 0.9 });
    for (let i = 0; i < 3; i++) cyl(sealantBox, 0.022, 0.022, 0.22, -0.1 + i * 0.1, 0.35, 0, 0xe8e2d0, { rough: 0.6, seg: 10 });
    holoTag(sealantBox, "sealant — lot 4471", 0, 0.55, 0, { css: "#c9b27a", w: 0.32 });
    const flashingStock = group(g, 2.6, 0.06, 0.4, -0.5);
    for (let i = 0; i < 4; i++) box(flashingStock, 1.2, 0.02, 0.15, 0, 0.05 + i * 0.03, -0.15 + i * 0.1, 0xaeb5bb, { rough: 0.35, metal: 0.7 });
    holoTag(flashingStock, "flashing stock", 0, 0.35, 0, { css: "#c9b27a", w: 0.28 });
    for (let i = 0; i < 5; i++) { const s = ball(g, 0.4 + (i % 2) * 0.2, -3.6 + i * 1.8, 4.6 + (i % 3) * 0.3, -3.5, 0xdfe9ee, { rough: 1, cast: false, opacity: 0.55, transparent: true }); s.scale.set(2.2, 0.6, 1); }

    let holdingCups = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.7, -2.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "harness") { snap.parent.remove(snap); anchor.add(snap); snap.position.set(0, 0.1, 0.03); snap.rotation.set(0, 0, 0); }
        if (step.id === "panel-drag") { panel.parent.remove(panel); facade.add(panel); panel.position.set(-0.2, 1.65, -0.2); panel.rotation.set(0, 0, 0); }
        if (step.id === "clip-fasten") { for (const c of clips) c.material = mat(0xc9b27a, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "sealant-bead") { beadMesh.visible = true; }
        if (step.id === "joint-seq") { rod.visible = true; beadMesh.material = mat(0x3a3a3a, { rough: 0.6 }); }
        if (step.id === "edge-walk") { looseDriver.position.y = 0.2; sharpHem.visible = false; }
        if (step.id === "deck-walk") { gate.rotation.y = 0; netTear.visible = false; }
        if (step.id === "panel-log") repaint(logFace, paperFace("PANEL LOG — BAY 7", ["Panels: 1 set, 2 clips", "Wind: 14–18 km/h", "Harness insp.: pass", "Open hem, driver, gate, net — fixed", "Signed: apprentice / journeyman"], { bg: "#f4efe4", band: "#c9b27a" }));
      },
      onHazard() {},
      // The overload beacon really lights; the sock really goes flat and the panel really lifts.
      onInterrupt(it) {
        if (it.id === "lift-alarm") { loadBeacon.visible = true; }
        if (it.id === "gust") { sock.rotation.z = 0; loosePanel.rotation.x = 0.5; loosePanel.position.y = 0.85; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "lift-alarm") { loadBeacon.visible = false; }
        if (it.id === "gust") { loosePanel.rotation.x = 0.02; loosePanel.position.y = 0.7; clampObj.position.x = 0.3; sock.rotation.z = -0.6; }
      },

      animate(t, dt, session) {
        const step = session?.step;
        holdingCups = !!(step?.id === "suction-hold" && session.holding);
        sockCone.rotation.x += dt * 2;
        if (loadBeacon.visible) loadBeacon.rotation.y += dt * 4;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind-read") {
          anemometer.children[0].rotation.y += dt * (2 + gg.t * 12);
          repaint(anemometer.userData.screen, signFace(`${(gg.t * 40).toFixed(0)} km/h`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.5 ? "#59c97b" : "#f2ae14", fg: "#f5eed8", scale: 0.6 }));
        }
        const tn = session?.turn;
        if (tn && step?.id === "clip-fasten") driver.rotation.x = tn.amount * Math.PI * 4;
        const tr = session?.track;
        if (tr && step?.id === "sealant-bead") { beadMesh.visible = true; beadMesh.scale.y = Math.min(1, tr.inBand / 5); beadMesh.position.y = -0.6 + beadMesh.scale.y * 0.6; }
        if (holdingCups) cups.position.y = 0.15 + Math.sin(t * 3) * 0.005;
      },
    };
  },
};
