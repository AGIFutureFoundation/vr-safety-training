import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, torus, slab, hose, group, decal, repaint, signFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, asphaltFace, woodGrainFace, safetyStripeFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Set Safety Meeting & Stunt Go/No-Go VR — Screen & Media Crafts.
//
// A studio backlot before a physical gag: the stunt coordinator's safety
// meeting, read off the call sheet's SFX rundown, then the go/no-go on a
// small compressed-air rigged effect built for a stunt performer's fall onto
// a crash pad. The learner is the on-set safety coordinator who reads the
// meeting's own sign-in and rundown, dresses the stunt performer's impact
// pads and harness, sweeps the fall zone for anything that would hurt
// somebody who was never meant to be there, walks the effect's own go/no-go
// board, proves the regulator inside its plotted band before arming the key,
// confirms the spotter's radio, holds the take for a clear line of sight,
// walks the rehearsed path at quarter speed, spots the crash pad onto its
// taped mark, and stages the medic and the fire watch before logging the
// meeting — with a late walk-on into the fall zone and a kinking regulator
// hose both needing an answer that is not the control already in front of
// the learner. The production, the studio and the stunt itself are generic.

const SSM_ACCENT = 0xe8a23a;
const SSM_CSS = "#e8a23a";

export const SIM_MD_SET_SAFETY_MEETING_AND_STUNT_GO_NO_GO = {
  id: "md-set-safety-meeting-and-stunt-go-no-go",
  index: "708",
  domain: "Screen & Media Crafts",
  trade: "On-set safety coordinator, running the stunt coordinator's safety meeting and the SFX go/no-go for a compressed-air rigged effect before a stunt performer's fall",
  category: "Entertainment & Live Events",
  weather: "clear",
  certification: "SAG-AFTRA safety bulletins for stunt and on-camera performers; IATSE grip and rigging crew practice; ANSI/ASSP Z359 fall-protection equipment for the stunt harness and its descender line; OSHA 29 CFR 1910.132 general personal protective equipment requirements; OSHA 29 CFR 1926.501 duty to have fall protection, applied here to the rigged descender",
  name: "Set Safety Meeting & Stunt Go/No-Go",
  title: simTitle("Set Safety Meeting & Stunt Go/No-Go"),
  tagline: "A backlot safety meeting before a physical gag: the call sheet's SFX rundown read, the stunt performer's impact pads and harness on, the fall zone swept for a frayed line and a soft pad, the go/no-go board walked, the effect's regulator proven inside its plotted band before the key is armed, the spotter's radio confirmed, the take held for a clear line of sight, the rehearsed path walked at quarter speed, the crash pad spotted onto its mark, the medic and the fire watch staged, and the meeting logged — a late walk-on into the fall zone and a kinking regulator hose both answered off a control that isn't the one already in the learner's hand",
  accent: SSM_ACCENT,
  accentCss: SSM_CSS,
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "cleared-for-the-gag", name: "Cleared for the Gag", note: "The go/no-go board walked clean, the regulator proven before the key was armed, the walk-on cleared off the AD's channel, and the kinking hose bled before the line ever saw full pressure" },

  supportLine: "your SAG-AFTRA or IATSE local's member assistance contact, or the production's own employee assistance programme",

  game: system({
    name: "Safety Meeting",
    currency: "CLEAR",
    ranks: ["Background Crew", "Second Second AD", "Set Safety Trainee", "Safety Coordinator", "Stunt Safety Certified"],
    badges: [
      { id: "gear-checked-first", name: "Gear Checked First", note: "Never armed the effect before the regulator read inside the plotted band", test: AWARD.stepClean("effects-pressure-check") },
      { id: "line-answered", name: "Line Answered", note: "The walk-on into the fall zone was held off the AD's channel, not the hold button already in hand", test: AWARD.unbroken },
      { id: "never-past-the-tape", name: "Never Past the Tape", note: "Never reached into the armed rig, never crossed the tape, never grabbed an untagged harness, never climbed the rig frame", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-meeting", name: "Clean Meeting", note: "No corrections from the call sheet to the closing log", test: AWARD.clean },
      { id: "on-the-mark", name: "On the Mark", note: "The rehearsed path held inside the band, first time", test: AWARD.precise(0.7) },
      { id: "picture-up-on-time", name: "Picture Up On Time", note: "Cleared for the gag inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "reach-into-armed-rig": "You reached toward the compressed-air effect's discharge nozzle while the regulator was still armed. A rig that is armed is a rig that can fire the moment its trigger circuit closes, whether or not anyone meant to close it, and a hand at the nozzle is exactly where the stunt performer's fall is supposed to land instead. The rig is only ever touched safed, key out, line bled.",
    "cross-safety-tape": "You stepped past the taped line into the stunt performer's marked fall zone while the rehearsal was live. That tape is the one boundary everyone on this backlot has agreed means 'this space is a fall path, not a walking path,' and it means nothing the moment someone crosses it to get a better look. The zone stays clear until the coordinator calls it clear.",
    "unlogged-harness": "You grabbed a harness off the loose pile by the gear cart instead of the inspected one hanging tagged on the rack. A stunt harness that has not been logged in today has not been checked today, and the one difference between the two looks the same right up until a stitch that failed inspection lets go under a real fall's load. Only the tagged harness on the rack goes on a performer.",
    "climb-the-rig-frame": "You climbed the effect rig's scaffold frame to get a better sightline instead of using the ladder staged beside it. The frame is built to carry the rig's own hardware in a fixed load path, not a person's weight applied sideways at whatever rung looked closest, and a frame that shifts under a climbing crew member can misalign the very effect everyone is about to trust. The ladder is there so nobody needs to find that out.",
  },

  lateNotes: {
    "effects-arm-key": "The key turns once the regulator has read inside the plotted band — there is nothing to arm on a rig that hasn't been proven yet.",
    "crash-pad": "The pad gets spotted onto its mark once the rehearsal walk-through is done — moving it earlier just means moving it again.",
    "safety-log": "The meeting is logged last, after the medic and the fire watch are staged — the log is what the next call sheet reads.",
  },

  steps: [
    {
      id: "read-callsheet", kind: "select", target: "call-sheet-panel",
      title: "Read the call sheet's SFX rundown",
      cue: "Read today's call sheet for the SFX rundown: the gag, the performer, the rigged effect, and who is cleared to be inside the fall zone.",
      why: "The call sheet is where the day's stunt is written down before anyone walks onto the backlot: which performer is taking the fall, what the rigged effect actually is, and — just as important — who is on the list to be near it. A safety meeting that starts anywhere else is a meeting about a gag nobody has confirmed is today's gag.",
    },
    {
      id: "ppe-donning", kind: "sequence", anyOrder: true,
      targets: ["impact-pads", "stunt-harness"],
      itemNames: { "impact-pads": "impact pads", "stunt-harness": "inspected stunt harness" },
      title: "Dress the stunt performer's impact pads and inspected harness",
      cue: "Fit the impact pads and the tagged harness from the rack — never the loose pile — before the performer walks the mark.",
      why: "Both go on while the performer is standing still on flat ground, with both hands free to check every strap and buckle — not after they're already walking the mark with a coordinator's attention split three ways. The harness has to be the one hanging tagged on the rack, because a tag is the only thing that says today's inspection actually happened to this exact piece of gear.",
    },
    {
      id: "hazard-sweep", kind: "find", noHint: true,
      targets: ["frayed-rigging-cable", "underinflated-crash-pad", "bystander-in-kill-zone"],
      itemNames: { "frayed-rigging-cable": "frayed cable on the rig's tag line", "underinflated-crash-pad": "soft corner on the crash pad", "bystander-in-kill-zone": "crew member standing in the fall zone" },
      itemNotes: {
        "frayed-rigging-cable": "The tag line steadying the rig's discharge arm has a cable strand frayed almost through where it runs over a sharp edge. A tag line that lets go mid-gag means the arm swings free with nothing steadying it, right as the performer is committed to the fall.",
        "underinflated-crash-pad": "One corner of the crash pad has gone soft — under-filled compared to the rest of the mat. A performer aiming for the pad's centre and landing a stride off it lands on the one corner that won't catch them the way the rest of the pad will.",
        "bystander-in-kill-zone": "A crew member is standing inside the taped fall zone, checking a monitor cable, with their back to the rig. Nobody in that zone is 'just passing through' once the gag is live — the zone exists because the performer's landing spot is not a place to be looking at anything else.",
      },
      title: "Sweep the fall zone before the gag goes live",
      cue: "Walk the fall zone and click the three things that make today's gag unsafe as staged.",
      why: "The interesting part of this job is the rig; the part that actually gets someone hurt is everything around it that nobody looked at twice — a fraying tag line, a soft corner on the one thing the performer is trusting to catch them, and a crew member who wandered into the one square of backlot that has to stay empty.",
    },
    {
      id: "go-no-go-checklist", kind: "select", target: "go-no-go-board",
      title: "Walk the effect's go/no-go board",
      cue: "Read the go/no-go board: the rig's tested status, the wind and weather limits, and the coordinator sign-offs still outstanding.",
      why: "A rigged effect does not get a single yes or no — it gets a board, because 'go' depends on the rig having been tested today, the weather sitting inside the limits the effects coordinator set, and every sign-off on the board actually being there rather than assumed. Reading it here, before the regulator is even touched, is what keeps 'go' from meaning 'probably fine.'",
    },
    {
      id: "effects-pressure-check", kind: "gauge", target: "effects-pressure-gauge",
      title: "Prove the rig's regulator inside the plotted band",
      cue: "Read the compressed-air regulator and commit inside the pressure band the SFX plot calls for this gag.",
      why: "The regulator is what turns a tank of compressed air into a repeatable, controlled push on the rig's discharge arm, and every gag this rig has ever been tested for assumes it is running at the plotted pressure — not whatever the last performer's gag happened to need. Proving it here, before the key ever turns, is what makes the rig behave the way its own test data says it will.",
      gauge: { label: "REGULATOR", speed: 0.65, green: [0.4, 0.58], readout: (t) => `${Math.round(20 + t * 60)} psi`, missNote: "Not on the plotted band — a regulator run high or low behaves like a different rig than the one this gag was tested on." },
    },
    {
      id: "effects-arm-key", kind: "turn", target: "effects-arm-key",
      title: "Arm the effect only after the board and the regulator both clear",
      cue: "With the board clean and the regulator proven, turn the rig's key to ARM.",
      why: "The key is the one control on this rig that turns a safed, inert piece of hardware into something that can actually fire, and it is designed to be the very last thing touched — after the board, after the regulator, never before either. A rig armed on a checklist that isn't finished is a rig that is live for reasons nobody has actually confirmed yet.",
      turn: { turns: 1.0, label: "RIG KEY", readout: (t) => (t < 0.5 ? "safed" : t < 0.95 ? "arming" : "armed") },
    },
    {
      id: "spotter-confirm", kind: "select", target: "spotter-radio",
      title: "Confirm the fall-zone spotter's radio check",
      cue: "Call the fall-zone spotter on the radio and confirm they have eyes on the landing area and nobody in it.",
      why: "The spotter is the one set of eyes whose only job during the gag is the landing area itself — not the shot, not the monitor, not the performer's mark. Confirming that check on the radio, out loud, is what turns 'somebody's probably watching' into an actual answer the coordinator can act on.",
    },
    {
      id: "hold-for-clear", kind: "hold", target: "hold-call-button", seconds: 4,
      title: "Hold the take for a clear line of sight",
      cue: "Hold the HOLD call until the spotter, the rig and the fall zone all read clear at the same time.",
      why: "A stunt gag has exactly one moment where everything has to be true at once — rig armed, zone clear, spotter watching — and holding the call rather than releasing it early is what keeps 'about to be clear' from being treated as the same thing as clear. Letting go the instant it looks ready is how a gag gets called on a zone that clears a half-second after the call.",
      holdBreakNote: "You let go of HOLD before everything read clear together. A gag called on a zone that isn't clear yet is a gag called on hope.",
    },
    {
      id: "rehearsal-walkthrough", kind: "track", target: "rehearsal-mark", seconds: 5,
      title: "Walk the rehearsed path at quarter speed",
      cue: "Walk the performer's rehearsed path at quarter speed, keeping your own eye-line on the mark the whole way.",
      why: "A slow walk-through is where the coordinator's own eye-line gets confirmed against the plan — that the mark is where the plot says it is, that the sightline to the spotter holds the whole way, and that nothing in the path has shifted since the last time anyone walked it. Doing this at speed the first time is how a plan on paper meets a backlot that has quietly changed since it was drawn.",
      track: { start: 0.5, green: [0.42, 0.58], rise: 0.5, fall: 0.5, drift: 0.12, label: "ON MARK", readout: (v) => (v < 0.42 ? "off line" : v > 0.58 ? "off line" : "on mark") },
      holdBreakNote: "Off the rehearsed line — ease back toward the mark rather than cutting across, and confirm the sightline again before the gag goes live.",
    },
    {
      id: "crash-pad-position", kind: "drag", target: "crash-pad",
      title: "Spot the crash pad onto its taped mark",
      cue: "Carry the crash pad from the gear line onto the taped mark under the rig's discharge arm.",
      why: "The pad's mark is set from the rig's own tested arc, not from where it looks like the performer will land — a pad set a stride off that mark is a pad that catches the wrong part of a fall, or misses it. It gets spotted exactly onto the tape, checked square, before anyone commits to the gag.",
      drag: { to: "pad-mark", radius: 0.5, missNote: "Not on the taped mark — the pad has to sit square on the tape, not near it." },
    },
    {
      id: "medic-standby", kind: "select", target: "medic-station",
      title: "Confirm the set medic is staged at the marked standby point",
      cue: "Check in with the set medic and confirm they are staged at the marked standby point, kit open, before the gag goes live.",
      why: "A medic staged after the gag is a medic who is still walking over while the clock that actually matters — the first minute after any real fall — is already running. Confirming the standby point and the open kit here is what makes 'medic on set' something the coordinator has actually checked rather than assumed from the call sheet.",
    },
    {
      id: "extinguisher-stage", kind: "select", target: "extinguisher-stage",
      title: "Stage the fire watch at the rig",
      cue: "Confirm the fire watch is staged at the rig with the extinguisher pulled and ready, not racked on the truck.",
      why: "A compressed-air rig shares its backlot with hot lights, cable runs and a dozen other ignition sources, and the extinguisher that matters is the one already in a fire watch's hands, not the one still clipped to a truck fifty feet away. Staging it here, before the key turns, is the difference between a fire watch and a fire watch's good intentions.",
    },
    {
      id: "log-safety-meeting", kind: "select", target: "safety-log",
      title: "Log the meeting, the finds and the go/no-go",
      cue: "Log today's meeting: who attended, the frayed line and soft pad corner found and fixed, and the go/no-go result.",
      why: "The log is what the next safety meeting on this rig reads before anyone signs off on it again — a frayed tag line that isn't written down is a frayed tag line the next crew finds the same way this one did. Logging it here, right after the gag clears, is the meeting as it actually happened rather than as anyone remembers it tomorrow.",
    },
  ],

  interrupts: [
    {
      id: "walk-on-in-fall-zone",
      kind: "Crew member walks into the fall zone",
      after: "hold-for-clear", delay: 2, seconds: 12,
      alert: "A camera assistant has stepped past the tape to adjust a flag, right inside the marked fall zone, just as the take is about to be called.",
      cue: "Call HOLD over the AD's channel before anyone calls action.",
      target: "ad-radio",
      why: "The hold button under your thumb only stops the call you're already making — it says nothing to a crew that thinks the gag hasn't started yet. The AD's channel is what reaches every department at once, which is the only way to stop a first assistant director from calling action into a fall zone that just quietly stopped being clear.",
      missNote: "Nobody on the AD's channel heard the hold. The take was called with a crew member still inside the tape.",
      wrongNote: "Not that control. The hold button only holds your own call — the AD's channel is what reaches the department calling action.",
    },
    {
      id: "regulator-kink",
      kind: "Regulator hose kinks under pressure",
      after: "rehearsal-walkthrough", delay: 2, seconds: 12,
      alert: "The rig's regulator hose has kinked and the gauge needle is climbing past the plotted band toward the red.",
      cue: "Open the bleed valve before the line sees full tank pressure.",
      target: "effects-bleed-valve",
      why: "A kinked hose does not stop pressure building behind it — it just moves where that pressure shows up first, and a rig regulator climbing past its plotted band is a rig about to fire harder than anything it was tested for. The bleed valve is a separate control from the regulator gauge for exactly this: it vents the line directly, without waiting for a reading that is already climbing.",
      missNote: "The needle went into the red with the bleed valve untouched. The line was carrying pressure nobody had planned this gag around.",
      wrongNote: "Not the regulator gauge — it only reads the pressure. The bleed valve is the one control that actually vents the line.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, SSM_ACCENT);

    // ------------------------------------------------------------ the backlot
    const floor = box(g, 7.2, 0.05, 6.0, 0, 0.025, 0, 0xffffff, { rough: 0.95 });
    floor.material = texturedMat(surfaceTexture((cx, w, h) => asphaltFace(cx, w, h, { base: "#33322f", base2: "#2a2926", tarLines: 4 }), { repeat: 5, px: 512 }), { rough: 0.95, metal: 0.02, color: 0xb8b3a8 });

    // Taped fall zone under the rig, painted straight onto the deck.
    const fallZone = decal(g, 1.8, 1.8, 1.3, 0.011, -0.6, (cx, w, h) => safetyStripeFace(cx, w, h, { a: "#e8a23a", b: "#1c1a17", stripes: 10 }), { px: 256 });
    fallZone.rotation.x = -Math.PI / 2;
    const tapeGap = box(g, 0.16, 0.05, 0.05, 0.5, 0.03, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step past the tape?", 0.5, 0.3, 0.35, { css: "#d2312b", w: 0.42 });
    reg(hits, tapeGap, "cross-safety-tape");

    // ------------------------------------------------------ the effects rig
    const rig = group(g, 1.3, 0, -1.4, 0.3);
    box(rig, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 }); // base plate
    for (const [sx, sz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
      cyl(rig, 0.025, 0.025, 1.4, sx, 0.7, sz, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    for (let i = 1; i < 4; i++) {
      const y = (i / 4) * 1.4;
      for (const sx of [-0.2, 0.2]) box(rig, 0.02, 0.02, 0.4, sx, y, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    }
    const tank = cyl(rig, 0.12, 0.12, 0.6, -0.35, 0.4, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 16 });
    const reg1 = instrument(rig, -0.35, 0.78, 0, { idle: "-- psi", color: SSM_ACCENT, w: 0.13, d: 0.15 });
    holoTag(reg1, "regulator", 0, 0.15, 0, { css: SSM_CSS, w: 0.28 });
    reg(hits, reg1, "effects-pressure-gauge");
    const armCyl = cyl(rig, 0.03, 0.03, 0.9, 0.15, 1.0, 0, 0xd8dde2, { rough: 0.4, metal: 0.7, seg: 10 });
    armCyl.rotation.z = Math.PI / 2.4;
    const keyBox = group(rig, 0, 1.42, 0);
    box(keyBox, 0.12, 0.12, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.6, metal: 0.3 });
    const key = cyl(keyBox, 0.012, 0.012, 0.08, 0, 0, 0.04, 0xe8b02e, { rough: 0.35, metal: 0.7, seg: 8 });
    holoTag(keyBox, "rig key", 0, 0.16, 0, { css: SSM_CSS, w: 0.2 });
    reg(hits, key, "effects-arm-key");
    const bleed = box(rig, 0.05, 0.05, 0.05, 0.35, 0.45, 0, 0xd2312b, { rough: 0.5 });
    holoTag(rig, "bleed valve", 0.35, 0.6, 0, { css: SSM_CSS, w: 0.24 });
    reg(hits, bleed, "effects-bleed-valve");
    const reachHit = box(rig, 0.1, 0.1, 0.1, 0.18, 0.95, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rig, "reach the nozzle?", 0.18, 1.15, 0, { css: "#d2312b", w: 0.38 });
    reg(hits, reachHit, "reach-into-armed-rig");

    // Tag line steadying the rig arm, with the frayed strand as the find target.
    const tagLine = hose(rig, [[0.15, 1.0, 0], [0.5, 0.55, 0.15], [0.75, 0.1, 0.2]], 0.012, 0x4a4038, { steps: 10 });
    reg(hits, tagLine, "frayed-rigging-cable");
    holoTag(rig, "tag line — frayed?", 0.75, 0.3, 0.2, { css: "#d2312b", w: 0.4 });

    // The rig's own scaffold-frame climb decoy and ladder.
    const frameClimb = box(rig, 0.06, 1.3, 0.5, -0.22, 0.7, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(rig, "climb the frame?", -0.22, 1.5, 0, { css: "#d2312b", w: 0.36 });
    reg(hits, frameClimb, "climb-the-rig-frame");
    const ladder = group(g, 1.85, 0, -1.75, 0.3);
    for (const sx of [-0.13, 0.13]) cyl(ladder, 0.012, 0.012, 1.3, sx, 0.65, 0, 0x8b949d, { rough: 0.4, metal: 0.6, seg: 6 });
    for (let i = 0; i < 8; i++) box(ladder, 0.26, 0.012, 0.02, 0, 0.15 + i * 0.16, 0, 0x8b949d, { rough: 0.4, metal: 0.6 });
    void tank; void armCyl;

    // -------------------------------------------------------- crash pad + mark
    const markPatch = slab(g, 1.6, 0.01, 1.0, 1.3, 0.012, 0.7, 0xffe9b0, { radius: 0.02, rough: 0.8, opacity: 0.85, transparent: true, cast: false });
    holoTag(g, "pad mark", 1.3, 0.3, 0.7, { css: SSM_CSS, w: 0.24 });
    reg(hits, markPatch, "pad-mark");

    const crashPad = group(g, -1.4, 0, 1.4, 0.15);
    const padMat = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h, { planks: 6, tones: [0xd83a3a, 0xc23131, 0xda4444] }), { repeat: 2, px: 256 }), { rough: 0.85, metal: 0 });
    const padMesh = box(crashPad, 1.5, 0.34, 0.9, 0, 0.17, 0, 0xffffff, { rough: 0.85 });
    padMesh.material = padMat;
    const softCorner = box(crashPad, 0.3, 0.1, 0.3, 0.55, 0.05, 0.28, 0x9c3030, { rough: 0.9 });
    holoTag(crashPad, "soft corner?", 0.55, 0.3, 0.28, { css: "#d2312b", w: 0.32 });
    reg(hits, softCorner, "underinflated-crash-pad");
    reg(hits, crashPad, "crash-pad");
    holoTag(crashPad, "crash pad", 0, 0.5, 0, { css: SSM_CSS, w: 0.26 });

    // ----------------------------------------------------------- rehearsal mark
    const rehearsalMark = torus(g, 0.14, 0.014, -0.2, 0.011, 0.3, SSM_ACCENT, { emissive: SSM_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 20 });
    rehearsalMark.rotation.x = -Math.PI / 2;
    holoTag(g, "rehearsed mark", -0.2, 0.3, 0.3, { css: SSM_CSS, w: 0.3 });
    reg(hits, rehearsalMark, "rehearsal-mark");

    // Bystander decoy standing in the taped fall zone, clear of the rig itself.
    const bystander = standingFigure(g, 0.7, -0.3, { ry: 1.6, cloth: 0x2b3a4a, cap: 0x8b949d });
    reg(hits, bystander, "bystander-in-kill-zone");
    holoTag(bystander, "in the fall zone?", 0, 2.0, 0, { css: "#d2312b", w: 0.4 });

    // A second crew member who later walks into the fall zone at the hold
    // step — a different person from the one found in the sweep, hidden
    // until the interruption fires.
    const walkOn = standingFigure(g, 0.9, -0.6, { ry: -1.2, cloth: 0x4a5568, cap: 0x2b2b30 });
    walkOn.visible = false;

    // A warning lamp on the rig's regulator, lit only while the hose is
    // kinking toward the red.
    const kinkLamp = box(rig, 0.05, 0.05, 0.02, -0.35, 0.98, 0.06, 0xd2312b, { rough: 0.4, emissive: 0xd2312b, ei: 0, cast: false });

    // ------------------------------------------------------------- gear cart
    const cart = toolChest(g, -2.4, -1.6, { ry: 0.4, color: 0x2b2b30 });
    const rack = group(g, -2.4, 0, -0.9, 0.3);
    cyl(rack, 0.02, 0.02, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.5, 0.03, 0.03, 0, 1.28, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const padsHang = group(rack, -0.15, 1.05, 0);
    box(padsHang, 0.2, 0.3, 0.06, 0, 0, 0, 0x2b3a4a, { rough: 0.7 });
    holoTag(rack, "impact pads", -0.15, 1.35, 0, { css: SSM_CSS, w: 0.28 });
    reg(hits, padsHang, "impact-pads");
    const harnessHang = group(rack, 0.15, 1.0, 0);
    box(harnessHang, 0.05, 0.24, 0.02, -0.05, 0, 0, 0xd8a63a, { rough: 0.8 });
    box(harnessHang, 0.05, 0.24, 0.02, 0.05, 0, 0, 0xd8a63a, { rough: 0.8 });
    holoTag(rack, "tagged harness", 0.15, 1.3, 0, { css: SSM_CSS, w: 0.3 });
    reg(hits, harnessHang, "stunt-harness");
    const loosePile = group(g, -2.9, 0, -0.6, 0.5);
    torus(loosePile, 0.09, 0.02, 0, 0.03, 0, 0x8a7a52, { rough: 0.75, seg: 6, seg2: 12 });
    holoTag(loosePile, "loose pile — untagged?", 0, 0.2, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, loosePile, "unlogged-harness");
    void cart;

    // -------------------------------------------------------------- video village
    const village = group(g, -2.5, 0, 1.9, -0.5);
    box(village, 0.9, 0.06, 0.5, 0, 0.75, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    for (const sx of [-1, 1]) box(village, 0.05, 0.75, 0.05, sx * 0.4, 0.38, 0.2, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    const monitor1 = decal(village, 0.36, 0.24, -0.22, 0.9, 0, signFace("CAM A", { bg: "#0d1c24", accent: SSM_CSS, scale: 0.5 }));
    const monitor2 = decal(village, 0.36, 0.24, 0.22, 0.9, 0, signFace("CAM B", { bg: "#0d1c24", accent: SSM_CSS, scale: 0.5 }));
    void monitor1; void monitor2;
    const spotterRadioProp = instrument(village, 0, 0.79, 0.2, { idle: "SPOTTER — CH 2", color: SSM_ACCENT, w: 0.1, d: 0.16 });
    holoTag(spotterRadioProp, "spotter radio", 0, 0.16, 0, { css: SSM_CSS, w: 0.32 });
    reg(hits, spotterRadioProp, "spotter-radio");

    // ------------------------------------------------------------- AD comms + hold
    const adBox = group(g, 2.5, 0, 1.5, -0.4);
    box(adBox, 0.32, 0.5, 0.24, 0, 0.25, 0, 0x2b3138, { rough: 0.55, metal: 0.4 });
    const holdBtn = box(adBox, 0.08, 0.03, 0.08, 0, 0.44, 0.1, 0xd2312b, { rough: 0.5 });
    holoTag(adBox, "HOLD — hold", 0, 0.6, 0.1, { css: SSM_CSS, w: 0.3 });
    reg(hits, holdBtn, "hold-call-button");
    const adRadio = instrument(adBox, 0, 0.5, -0.15, { idle: "AD — CH 1", color: SSM_ACCENT, w: 0.1, d: 0.16 });
    holoTag(adRadio, "AD channel", 0, 0.16, 0, { css: SSM_CSS, w: 0.3 });
    reg(hits, adRadio, "ad-radio");

    // ------------------------------------------------------------------ medic
    const medicTent = group(g, -2.6, 0, 0.4, 0.6);
    box(medicTent, 0.7, 0.02, 0.5, 0, 0.62, 0, 0xdfe4e8, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(medicTent, 0.02, 0.02, 0.62, sx * 0.33, 0.31, sz * 0.23, 0xdfe4e8, { rough: 0.5, seg: 8 });
    const medicKit = box(medicTent, 0.3, 0.16, 0.2, 0, 0.08, 0, 0xd2312b, { rough: 0.6 });
    holoTag(medicTent, "medic standby", 0, 0.85, 0, { css: SSM_CSS, w: 0.32 });
    reg(hits, medicKit, "medic-station");
    const medicFigure = standingFigure(g, -1.6, 0.9, { ry: -1.0, cloth: 0xdfe4e8, cap: 0xd2312b });
    void medicFigure;

    // ------------------------------------------------------------- fire watch
    const extinguisherStand = group(g, 2.2, 0, -1.9, 0.3);
    cyl(extinguisherStand, 0.09, 0.1, 0.4, 0, 0.2, 0, 0xd2312b, { rough: 0.5, metal: 0.4, seg: 12 });
    cyl(extinguisherStand, 0.03, 0.03, 0.06, 0, 0.42, 0, 0x2b2f34, { rough: 0.5, seg: 8 });
    holoTag(extinguisherStand, "fire watch — stage it", 0, 0.6, 0, { css: SSM_CSS, w: 0.4 });
    reg(hits, extinguisherStand, "extinguisher-stage");

    // -------------------------------------------------------------- crew figures
    const coordinator = standingFigure(g, 0.2, 0.9, { ry: -2.2, vest: SSM_ACCENT, helmet: 0xf2f2f2 });
    holoTag(coordinator, "safety coordinator", 0, 2.0, 0, { css: SSM_CSS, w: 0.42 });
    void coordinator;

    // -------------------------------------------------------------- paperwork
    const callSheet = holoPanel(g, 1.0, 0.68, -3.0, 1.35, -1.4, (cx, w, h) => {
      cx.fillStyle = "#241a0a"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdeccf"; cx.fillText("CALL SHEET — SFX RUNDOWN", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.064)}px Arial, sans-serif`; cx.fillStyle = "#f7ecd8";
      ["Gag: rigged fall onto crash pad", "Effect: compressed-air discharge arm", "Cleared in zone: coordinator, spotter, performer",
       "Everyone else stays behind the tape", "Sign-in required before the meeting starts", "Go/no-go board governs — see rig board"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.115)));
    }, { ry: 0.9, accent: SSM_ACCENT });
    reg(hits, callSheet, "call-sheet-panel");

    const goNoGoBoard = holoPanel(g, 0.85, 0.62, 0.6, 1.35, -2.3, (cx, w, h) => {
      cx.fillStyle = "#241a0a"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdeccf"; cx.fillText("GO / NO-GO BOARD", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#f7ecd8";
      ["Rig tested today: YES", "Wind/weather: inside limit", "SFX coordinator sign-off: —", "Stunt coordinator sign-off: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { accent: SSM_ACCENT });
    reg(hits, goNoGoBoard, "go-no-go-board");

    const log = holoPanel(g, 0.6, 0.42, 3.0, 1.3, 1.0, (cx, w, h) => {
      cx.fillStyle = "#241a0a"; cx.fillRect(0, 0, w, h); cx.fillStyle = SSM_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fdeccf"; cx.fillText("SAFETY MEETING LOG", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f7ecd8";
      ["Attendance: —", "Finds: —", "Go/no-go: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.9, accent: SSM_ACCENT });
    reg(hits, log, "safety-log");

    // -------------------------------------------------------------- dressing
    barrierPanel(g, 2.4, -0.4, { color: SSM_ACCENT, ry: 0.5 });
    cone(g, 1.9, 0.4, { color: SSM_ACCENT });
    cone(g, 2.9, -0.9, { color: SSM_ACCENT });

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 1.2, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "ppe-donning") { padsHang.visible = false; harnessHang.visible = false; }
        if (step.id === "hazard-sweep") { softCorner.visible = false; }
        if (step.id === "go-no-go-checklist") {
          repaint(goNoGoBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "#241a0a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fdeccf"; cx.fillText("GO / NO-GO BOARD", w * 0.06, h * 0.14);
            cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Rig tested today: YES", "Wind/weather: inside limit", "SFX coordinator sign-off: GO", "Stunt coordinator sign-off: GO"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
          });
        }
        if (step.id === "effects-arm-key") key.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.5 });
        if (step.id === "crash-pad-position") { crashPad.position.set(1.3, 0, 0.7); markPatch.visible = false; }
        if (step.id === "medic-standby") medicKit.material = mat(0x59c97b, { rough: 0.6 });
        if (step.id === "extinguisher-stage") extinguisherStand.rotation.y = 0.6;
        if (step.id === "log-safety-meeting") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#241a0a"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#fdeccf"; cx.fillText("SAFETY MEETING LOG", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Attendance: full crew signed in", "Finds: tag line and pad corner fixed", "Go/no-go: GO, logged"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "walk-on-in-fall-zone") { walkOn.visible = true; }
        if (it.id === "regulator-kink") {
          kinkLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
          repaint(reg1.userData.screen, signFace("CLIMBING", { bg: "#2b0d0d", accent: "#d2312b", fg: "#ffd8d8", scale: 0.5 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "walk-on-in-fall-zone") { walkOn.visible = false; }
        if (it.id === "regulator-kink") {
          kinkLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0, rough: 0.4 });
          repaint(reg1.userData.screen, signFace("SAFE", { bg: "#0d2b16", accent: "#59c97b", fg: "#d8f5e0", scale: 0.55 }));
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "effects-arm-key") key.rotation.z = session.turn.amount * Math.PI * 2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "effects-pressure-check") repaint(reg1.userData.screen, signFace(`${Math.round(20 + gg.t * 60)}`, { bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#f7ecd8", scale: 0.6 }));
        if (step?.id === "rehearsal-walkthrough" && session.holding) rehearsalMark.rotation.z += dt * 0.4;
        void t; void CITY;
      },
    };
  },
};
