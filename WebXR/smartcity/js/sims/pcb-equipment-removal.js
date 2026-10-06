import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, equipmentCabinet,
  cone, barrierPanel, standingFigure, lockTag, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ PCB Equipment Removal VR — Energy & Power, station eighty-seven.
//
// One of the trade procedures the demolition-side unions run on a former
// shipyard parcel under a federal cleanup order — no real site is named and
// nothing here dramatises any one cleanup's history. A derelict switch room
// still holds a PCB-containing distribution transformer and its capacitors,
// both old enough to predate the 1979 PCB manufacturing ban. The electrical
// trade proves the circuit dead and locks it out; the hazmat laborer and the
// rigger's helper — the learner's own role here — take the unit down as a
// regulated PCB waste shipment from the first click to the manifest. Nothing
// about a de-energised transformer makes its oil, its capacitors or the floor
// under it any less a TSCA Subpart D radioactive-free hazardous material: the
// controls in this station exist because de-energised is an electrical fact,
// not a PCB one.

const PCB_ACCENT = 0xf0c419;
const PCB_GREY = 0x6b6f74;

export const SIM_PCB_EQUIPMENT_REMOVAL = {
  id: "pcb-equipment-removal",
  index: "87",
  domain: "Energy",
  trade: "Electrician and rigger's helper — IBEW Local 6 electrician, LIUNA hazmat laborer, IUOE Local 3 hoist operator",
  category: "Energy & Power",
  indoor: "plant",
  certification: "IBEW Local 6 electricians and LIUNA hazmat laborers; OSHA 29 CFR 1910.147 lockout/tagout and 1910.269 electrical safety-related work practices; EPA TSCA 40 CFR 761 PCB marking, storage and disposal; OSHA HAZWOPER 40-hour for anyone working the exclusion zone; DOT 49 CFR 172 hazardous-materials shipping papers",
  name: "PCB Equipment Removal",
  title: simTitle("PCB Equipment Removal"),
  tagline: "A derelict switch room's PCB transformer, taken down as a regulated shipment: nameplate against the inventory, the circuit proven dead and locked out, the unit lifted onto a lined pallet, sealed, labelled and manifested",
  accent: PCB_ACCENT,
  accentCss: "#f0c419",
  parSeconds: 310,
  footprint: 2.3,
  badge: { id: "pcb-shipment", name: "PCB Shipment", note: "A PCB transformer isolated, rigged and manifested with no shortcut on the lockout, the oil or the paperwork" },

  game: system({
    name: "PCB Custody",
    currency: "MICROGRAM",
    ranks: ["Helper", "Rigger's Hand", "Lead Rigger", "Isolation Authority", "PCB Custody Certified"],
    badges: [
      { id: "proven-dead", name: "Proven Dead", note: "The circuit isolated, locked, tagged and tested before any tool touched the unit", test: AWARD.stepClean("lockout") },
      { id: "no-release", name: "No Release", note: "Never let oil, a live conductor or an unlabelled load leave the room", test: AWARD.safe },
      { id: "clean-swing", name: "Clean Swing", note: "Held the tag line inside the safe path for the whole lift", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-shipment", name: "Clean Shipment", note: "No corrections anywhere in the removal", test: AWARD.clean },
      { id: "steady-hand", name: "Steady Hand", note: "Never broke the tag-line signal", test: AWARD.unbroken },
      { id: "room-cleared", name: "Room Cleared", note: "Swabbed and closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "live-touch": "You reached for the primary lead before the tester proved it dead. Locked out is what the breaker did; dead is a fact about the conductor, and the only way to know it is a tester that was itself proven on a live source first. A hand on that lead before the test is a hand on whatever the switching order missed.",
    "floor-drain-dump": "You opened the drain valve over the floor drain instead of into a labelled catch container. That drain runs to the storm system, and PCB oil down it is not a spill you clean up later — it is a reportable release under the Clean Water Act on top of the TSCA violation, and it is the neighborhood downstream of this parcel that receives it.",
    "bare-capacitor": "You went bare-handed for the capacitor terminals. A capacitor stores its own charge in the dielectric and can hold a shock hazard for hours after the transformer it sits beside is dead and grounded — it is discharged and shorted with an insulated tool before anyone's hand goes near the terminals, every time, regardless of how long the unit has sat idle.",
    "unlabeled-lift": "You waved the loaded pallet toward the dock before the PCB label and the out-of-service date were on it. An unlabelled PCB load leaving this room is indistinguishable from ordinary scrap to everyone downstream of that door — the hauler, the scale house, the disposal facility — and TSCA's marking rule exists precisely so nobody downstream has to guess.",
  },

  lateNotes: {
    "danger-tag": "The tag goes on once the breaker is actually open and the padlock is already on it — a tag on a closed breaker is a label, not an isolation.",
    "sight-glass": "Nothing to read on the sight glass until the unit is isolated and the room is clear of live conductors — read the level once it's actually safe to be standing at the tank.",
    "pallet-liner": "The liner goes into the pallet once the rigging plan says where this unit is actually headed — lining a pallet before you know the load is guessing.",
    "pcb-waste-label": "Nothing to label until the pallet is sealed — a label on an open load doesn't describe what's actually inside it.",
    "manifest-clipboard": "The manifest doesn't get filled out until the pallet is sealed and labelled — signing for a shipment that doesn't exist yet is signing a guess.",
  },

  // Interruptions: see the interrupt layer in shared/game.js. Both are armed
  // on a track or a hold step — a select, gauge or turn step resolves in one
  // click, too fast for the fuse to ever catch the learner mid-task, and
  // neither is answerable by its host step's own control.
  interrupts: [
    {
      id: "bushing-weep",
      kind: "Bushing weeping",
      after: "lift", delay: 3, seconds: 13,
      alert: "The transformer's B-phase bushing is weeping oil down the tank wall as the sling takes the load clear of the floor.",
      cue: "Get the spill kit under the drip now — the load stays up on the hoist, but that oil is not hitting the floor.",
      target: "spill-kit",
      why: "PCB oil on a concrete floor is not a job for a mop at end of shift — it soaks in, and the room's own floor becomes a surface that has to be sampled and possibly removed. The spill kit exists to catch exactly this, and it does that job only if it gets there before the drip does.",
      missNote: "The weep ran down the tank and pooled under the load for the rest of the lift, and that patch of floor is now something the closeout swab has to answer for, not the drain valve.",
      wrongNote: "Not that — the spill kit, under the drip, while the load is still up. Nothing else in reach stops oil from reaching the floor.",
    },
    {
      id: "door-breach",
      kind: "Exclusion breach",
      after: "swab", delay: 3, seconds: 12,
      alert: "The loading-dock crew is hauling the switch-room door open, walking straight past the exclusion tape while you're still swabbing under chain of custody.",
      cue: "Stop them at the door before anyone not on this crew is standing inside your sample area.",
      target: "exclusion-door",
      why: "Chain of custody means the sample's history is unbroken from swab to lab, and that includes who else was in the room while it was being taken. A second crew tracking through the exclusion zone mid-swab is a defence attorney's first question about whether this floor was actually clear before the tap went back in.",
      missNote: "Two more sets of boots crossed the swabbed floor before the sample was bagged, and there is no way to prove afterward that they carried nothing across it.",
      wrongNote: "That's not it — the door. Whoever is coming through it has to be stopped before they're standing in the sample area.",
    },
  ],

  steps: [
    {
      id: "nameplate", kind: "sequence", anyOrder: true,
      targets: ["nameplate", "pcb-label"],
      itemNames: { nameplate: "the nameplate", "pcb-label": "the PCB label" },
      title: "Check the nameplate and PCB label against the inventory",
      cue: "Read the nameplate rating and the yellow PCB label, and match both against the room's equipment inventory before anything else.",
      why: "The inventory is what tells you this specific unit predates the 1979 manufacturing ban and is presumed PCB-containing until a lab says otherwise — the nameplate gives the rating that sets the rigging weight, and the label is the one already telling you the waste stream this is going to leave as. Skip this and every step after it is guessing at both.",
    },
    {
      id: "lockout", kind: "sequence",
      targets: ["main-breaker", "padlock", "danger-tag"],
      itemNames: { "main-breaker": "open the breaker", padlock: "apply your padlock", "danger-tag": "apply the danger tag" },
      title: "Isolate and lock out the feeder",
      cue: "Open the breaker feeding this room, apply your own padlock to it, then the danger tag.",
      why: "The breaker being open is a fact about the switch; your padlock on it is what makes that fact yours, so nobody else's crew can close it while you have a hand inside this room. The tag goes on last because it names who and why — it is a label on an isolation that already exists, not a substitute for one.",
      outOfOrderNote: "Open the breaker first, then your own lock, then the tag naming the work — a tag on a closed breaker isn't an isolation of anything.",
    },
    {
      id: "test-dead", kind: "gauge", target: "voltage-tester",
      title: "Test the feeder dead",
      cue: "Prove the tester on a known live source, then test dead across the primary leads.",
      why: "Locked out tells you what the breaker did; dead is a fact about the conductor in front of you, and a tester that failed silently reads dead on everything, including a conductor that is not. Proving it live first and then reading it here is the only way this number means anything.",
      gauge: { label: "PRIMARY kV", speed: 0.75, green: [0.02, 0.16], readout: (t) => `${(t * 14).toFixed(2)} kV`, missNote: "Not dead. Recheck the lockout before any tool goes near that lead." },
    },
    {
      id: "oil-level", kind: "gauge", target: "sight-glass",
      title: "Read the oil level",
      cue: "Read the sight glass and commit once the level sits inside the fill band the nameplate calls for.",
      why: "A tank reading low against its nameplate fill has lost oil somewhere between here and the last time anyone looked, and that oil went somewhere before you ever opened this room — the level is what tells you whether you are also looking for a leak, not just removing a unit.",
      gauge: { label: "OIL LEVEL", speed: 0.62, green: [0.42, 0.6], readout: (t) => `${Math.round(t * 100)} %`, missNote: "Not in the fill band. Log it as a possible leak before you go any further." },
    },
    {
      id: "weep-and-kit", kind: "find", noHint: true,
      targets: ["weeping-bushing", "spill-kit"],
      itemNames: { "weeping-bushing": "the weeping A-phase bushing", "spill-kit": "the spill kit" },
      itemNotes: {
        "weeping-bushing": "The A-phase bushing gasket is weeping — a slow bead, not a drip yet. That is exactly the kind of thing the walk-round exists to catch before it becomes the thing the lift interrupts.",
        "spill-kit": "The spill kit is on its shelf, sealed and dated. Confirm it and stage it at the tank now, while both your hands are free — not later, with oil already on the move.",
      },
      title: "Walk the tank before you touch it",
      cue: "Find the thing that's already weeping and stage the kit that answers it.",
      why: "A slow weep found now, standing still with the room quiet, is a note on a work order. The same weep found later, with the unit swinging on a sling, is the interruption you have thirteen seconds to answer — the walk-round is what buys you the first version of that problem instead of the second.",
    },
    {
      id: "cap-drain", kind: "turn", target: "drain-valve",
      title: "Close and cap the drain valve",
      cue: "Turn the drain valve fully shut, then set the cap over it.",
      why: "A drain valve that is merely closed still has a stem and a seat that can weep under the vibration of a lift; the cap is the second, mechanical barrier that makes the tank actually sealed for transport, not just off for now.",
      turn: { turns: 0.6, axis: "y", label: "DRAIN" },
    },
    {
      id: "wrap-bushings", kind: "sequence", anyOrder: true,
      targets: ["bushing-a", "bushing-b", "bushing-c"],
      itemNames: { "bushing-a": "phase A bushing", "bushing-b": "phase B bushing", "bushing-c": "phase C bushing" },
      title: "Wrap the bushings",
      cue: "Wrap each of the three primary bushings in poly before the unit is rigged.",
      why: "Porcelain bushings crack against a sling strap or a pallet edge more easily than the tank body ever will, and a cracked bushing on a PCB unit is a new leak path opened during the one part of this job that is supposed to be sealing them up. The wrap is cheap insurance on the part of the unit that has the least material to spare.",
    },
    {
      id: "rigging-plan", kind: "select", target: "rigging-plan",
      title: "Review the rigging plan",
      cue: "Read the plan: the unit's weight from the nameplate, the sling angles, and the hoist's rated capacity.",
      why: "The plan is where the nameplate weight actually gets checked against what the hoist and the slings are rated for — a rigger's helper who skips straight to hooking up slings is trusting that somebody else already did that arithmetic, and on a derelict site there is no guarantee anybody has.",
    },
    {
      id: "liner", kind: "drag", target: "pallet-liner",
      title: "Line the pallet",
      cue: "Carry the liner to the pallet and lay it in before the unit comes down onto it.",
      why: "The liner is what keeps this unit's own residue off the pallet deck and off whatever the pallet touches between here and the disposal facility — a unit set down on a bare pallet can't be relined after the fact without moving it again.",
      drag: { to: "pallet-socket", radius: 0.4, missNote: "Not laid into the pallet — a liner bunched at one corner leaves bare wood the tank sits directly on." },
    },
    {
      id: "lift", kind: "track", target: "tag-line", seconds: 9,
      title: "Guide the lift onto the pallet",
      cue: "Hold the tag line steady, keeping the swing inside the safe path as the hoist lowers the unit onto the pallet.",
      why: "The hoist operator is watching the load, not the pallet edge below it — the tag line is what a rigger's helper uses to keep a swinging load from walking sideways as it comes down, and it is held continuously because a load that drifts off-centre for even a second can catch the pallet's corner instead of its face.",
      track: {
        start: 0.12, green: [0.4, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "SWING PATH",
        readout: (v) => (v < 0.4 ? "drifting toward the wall" : v > 0.6 ? "drifting off the pallet" : "centred on the pallet"),
      },
      holdBreakNote: "The load drifted off the safe path — bring the tag line back on line before the unit comes down any further.",
    },
    {
      id: "seal-pallet", kind: "drag", target: "pallet-wrap",
      title: "Seal the pallet",
      cue: "Pull the poly wrap fully around the unit and the pallet and secure every edge.",
      why: "A wrapped load is what keeps this unit's own surface residue off every hand and every surface it touches between this room and the disposal facility — a wrap left open at one corner is a load that is sealed everywhere except the one place someone is about to lean on it.",
      drag: { to: "pallet-socket", radius: 0.42, missNote: "Not pulled over the load — a wrap bunched at one edge leaves the rest of the unit exposed the moment the pallet moves." },
    },
    {
      id: "label-pallet", kind: "select", target: "pcb-waste-label",
      title: "Label the pallet as PCB waste",
      cue: "Apply the PCB waste label and write the out-of-service date on it before the pallet leaves the room.",
      why: "TSCA's marking rule exists so that everyone downstream of this room — the hauler, the scale house, the disposal facility, an inspector years later — can tell what they are handling without opening it, and the out-of-service date is what starts the clock on how long this unit can legally sit before it has to be gone.",
    },
    {
      id: "manifest", kind: "select", target: "manifest-clipboard",
      title: "Complete the manifest",
      cue: "Fill out and sign the hazardous-waste manifest for this load before it leaves the room.",
      why: "Under RCRA and TSCA together, this pallet is not a legal shipment until the manifest states what it is, where it came from and where it is going — a load that leaves this room without one is just a wrapped box as far as anyone downstream can prove.",
    },
    {
      id: "swab", kind: "hold", target: "swab-kit", seconds: 5,
      title: "Swab the floor under chain of custody",
      cue: "Hold the swab on the marked grid square until the full wipe is taken, bag it and log the custody seal.",
      why: "The swab is the number this room's clearance actually rests on — not somebody's opinion that the floor looks clean. It is taken on a marked grid so the result can be tied to a specific square of floor, and it travels under a chain-of-custody seal because a sample nobody can vouch for proves nothing in front of an inspector.",
      holdBreakNote: "Released the swab before the full wipe was taken — a partial pass across the grid square is not the same sample, and the lab will read it as a different result than the floor actually gives.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-bushing-wrap"],
      itemNames: { "cracked-bushing-wrap": "the loosened bushing wrap" },
      itemNotes: { "cracked-bushing-wrap": "One corner of the bushing wrap worked loose during the lift. A wrap that isn't actually sealed is a bushing riding to the disposal facility with nothing on it — this is the last look before the pallet is out the door." },
      title: "Walk the load before it leaves",
      cue: "Walk the sealed pallet and click the one thing that's still wrong before it goes out the door.",
      why: "The wrap step and this walk are different skills — pulling poly over a load is not the same as noticing, from the ground, that one corner came loose in the lift. This is the last chance to catch it before the manifest's promises are out on a public road.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, PCB_ACCENT);

    // -------------------------------------------------------------- room shell
    const floor = box(g, 5.6, 0.1, 5.0, 0, -0.05, 0, 0x4a4c4e, { rough: 0.95, finish: "concrete", tile: [4, 4] });
    void floor;
    const backWall = box(g, 5.6, 2.6, 0.12, 0, 1.3, -2.35, PCB_GREY, { rough: 0.85, finish: "concrete", tile: [4, 2] });
    void backWall;
    for (let i = -2; i <= 2; i++) {
      box(g, 0.1, 2.6, 0.14, i * 1.1, 1.3, -2.34, 0x3a3c3e, { rough: 0.8, cast: false });
    }
    box(g, 2.6, 2.6, 0.12, 2.4, 1.3, -0.4, PCB_GREY, { rough: 0.85, finish: "concrete", tile: [2, 2] }).rotation.y = Math.PI / 2;

    // Caution striping along the base of the back wall.
    for (let i = -2; i <= 2; i++) {
      box(g, 0.5, 0.1, 0.02, i * 1.05, 0.1, -2.28, PCB_ACCENT, { rough: 0.7, cast: false });
    }

    // -------------------------------------------------------------- transformer
    const tank = group(g, -0.5, 0, -1.55);
    box(tank, 1.05, 0.75, 0.72, 0, 0.38, 0, 0x3a5f4a, { rough: 0.55, metal: 0.35, finish: "painted", tile: [2, 2] });
    box(tank, 1.1, 0.05, 0.76, 0, 0.78, 0, 0x33553f, { rough: 0.5, metal: 0.4, finish: "painted", tile: [2, 1] });
    for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) {
      box(tank, 0.03, 0.5, 0.1, sx * 0.56, 0.38, -0.26 + i * 0.13, 0x33553f, { rough: 0.6, metal: 0.35, cast: false });
    }
    holoTag(tank, "500 kVA distribution transformer", 0, 1.0, 0.38, { css: "#f0c419", w: 0.62 });

    // Nameplate.
    const nameplateMesh = decal(tank, 0.28, 0.19, 0, 0.48, 0.361, (cx, w, h) => {
      cx.fillStyle = "#d8d2c2"; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "#3a4450"; cx.lineWidth = Math.max(2, h * 0.03); cx.strokeRect(h * 0.06, h * 0.06, w - h * 0.12, h - h * 0.12);
      cx.fillStyle = "#22303c"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `700 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("500 kVA · MFG 1971", w / 2, h * 0.28);
      cx.font = `600 ${Math.round(h * 0.11)}px Arial, sans-serif`;
      cx.fillStyle = "#5a4a2a";
      cx.fillText("ASKAREL DIELECTRIC", w / 2, h * 0.56);
      cx.fillText("SEE INVENTORY #TX-118", w / 2, h * 0.76);
    }, { px: 220, rough: 0.8 });
    reg(hits, nameplateMesh, "nameplate");

    // Yellow PCB label, its own registered face.
    const pcbLabelMesh = decal(tank, 0.2, 0.14, 0.36, 0.48, 0.361, signFace("CAUTION — CONTAINS PCBs", { bg: "#221a02", accent: "#f0c419", scale: 0.36 }), { px: 200 });
    reg(hits, pcbLabelMesh, "pcb-label");

    // Three primary bushings, wrapped once the crew gets to them.
    const bushings = {};
    const PHASES = [["a", -0.32], ["b", 0], ["c", 0.32]];
    for (const [ph, x] of PHASES) {
      const bush = cyl(tank, 0.045, 0.055, 0.22, x, 0.9, 0, 0x3a4048, { rough: 0.55, seg: 14 });
      const wrap = cyl(tank, 0.06, 0.06, 0.24, x, 0.9, 0, 0xdfe6a8, { rough: 0.4, opacity: 0.001, transparent: true, seg: 12 });
      bushings[ph] = { bush, wrap };
      reg(hits, bush, `bushing-${ph}`);
    }
    // The corner of B-phase's wrap that works loose during the lift, for the
    // final walk to catch — hidden until the wrap goes on, cleared once found.
    const wrapGap = box(tank, 0.03, 0.03, 0.03, 0, 0.98, 0.1, 0xdfe6a8, { rough: 0.5, cast: false });
    wrapGap.visible = false;
    reg(hits, wrapGap, "cracked-bushing-wrap");
    // The A-phase weep — a wet streak down the tank wall.
    const weepStreak = box(tank, 0.05, 0.32, 0.01, -0.32, 0.62, 0.362, 0x1a1d0a, { rough: 0.2, opacity: 0.6, transparent: true, cast: false });
    reg(hits, weepStreak, "weeping-bushing");
    const weepDrip = particles(tank, 14, 0xb9a23a, { size: 0.014, life: 0.6, additive: false, opacity: 0.55 });
    weepDrip.position.set(-0.32, 0.78, 0.37);

    // Sight glass and drain valve on the tank face.
    const sightGlass = instrument(tank, 0.5, 0.5, 0.37, { idle: "-- %", color: PCB_ACCENT, w: 0.13, d: 0.16 });
    holoTag(sightGlass, "sight glass", 0, 0.14, 0, { css: "#f0c419", w: 0.28 });
    reg(hits, sightGlass, "sight-glass");
    const drainValve = valveWheel(tank, 0.5, 0.14, 0.37, { r: 0.05, color: 0xd8232a, body: 0x33553f });
    holoTag(tank, "drain valve", 0.5, 0.3, 0.37, { css: "#f0c419", w: 0.28 });
    reg(hits, drainValve.userData.wheel, "drain-valve");
    const drainCap = ball(tank, 0.055, 0.5, 0.14, 0.44, 0x2b2f34, { rough: 0.5, metal: 0.4 });
    drainCap.visible = false;

    // The floor drain — the trap for dumping oil straight to the sewer.
    const floorDrain = group(g, 0.15, 0, -1.05);
    cyl(floorDrain, 0.14, 0.14, 0.02, 0, 0.005, 0, 0x2b2f34, { rough: 0.7, seg: 16, cast: false });
    for (let i = -2; i <= 2; i++) box(floorDrain, 0.2, 0.006, 0.012, 0, 0.011, i * 0.03, 0x1b1e22, { rough: 0.6, cast: false });
    holoTag(floorDrain, "floor drain", 0, 0.2, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, floorDrain, "floor-drain-dump");

    // The exposed primary lead — the hazard if grabbed before test-dead.
    const primaryLead = cyl(tank, 0.018, 0.018, 0.4, -0.32, 0.9, -0.3, 0x2b2f34, { rough: 0.6, metal: 0.3, seg: 10 });
    primaryLead.rotation.x = Math.PI / 3;
    reg(hits, primaryLead, "live-touch");

    // --------------------------------------------------------------- capacitors
    const capRack = group(g, 0.55, 0, -1.75, -0.2);
    for (let i = 0; i < 3; i++) {
      const can = cyl(capRack, 0.1, 0.1, 0.28, -0.24 + i * 0.24, 0.16, 0, 0x4a5058, { rough: 0.5, metal: 0.4, seg: 14 });
      void can;
      const term = ball(capRack, 0.02, -0.24 + i * 0.24, 0.31, 0, 0xd8b23a, { rough: 0.5, metal: 0.6 });
      if (i === 1) reg(hits, term, "bare-capacitor");
    }
    holoTag(capRack, "PCB capacitors", 0, 0.42, 0, { css: "#f0c419", w: 0.36 });

    // ---------------------------------------------------------------- breaker
    const cab = equipmentCabinet(g, 0.62, 1.1, 0.4, -2.15, -0.9, { ry: 0.5, color: 0x5f6a74 });
    const breakerHandle = group(cab, 0.15, 0.75, 0.22);
    box(breakerHandle, 0.045, 0.16, 0.03, 0, 0.06, 0.03, 0xd8232a, { rough: 0.5 });
    holoTag(cab, "main breaker", 0.15, 1.05, 0.22, { css: "#f0c419", w: 0.32 });
    reg(hits, breakerHandle, "main-breaker");
    const lock = lockTag(cab, -0.08, 0.55, 0.24, { color: 0xd8232a, lines: ["LOCKED", "OUT"] });
    reg(hits, lock, "padlock");
    const tag = group(cab, -0.08, 0.4, 0.24);
    box(tag, 0.09, 0.11, 0.006, 0, 0, 0, 0xe6c94a, { rough: 0.8 });
    decal(tag, 0.08, 0.1, 0, 0, 0.004, signFace("DANGER — DO NOT OPERATE", { bg: "#221a02", accent: "#d8232a", scale: 0.3 }), { px: 128 });
    tag.visible = false;
    reg(hits, tag, "danger-tag");

    // ------------------------------------------------------------- test gear
    const chest = toolChest(g, 2.15, -1.7, { ry: -0.6, color: PCB_ACCENT });
    const tester = instrument(chest, -0.05, 0.8, 0.02, { ry: 0.3, idle: "-- kV", color: PCB_ACCENT });
    holoTag(tester, "voltage tester", 0, 0.17, 0, { css: "#f0c419", w: 0.34 });
    reg(hits, tester, "voltage-tester");

    // ------------------------------------------------------------- spill kit
    const spillKit = group(g, 0.95, 0, -1.1, 0.3);
    box(spillKit, 0.34, 0.3, 0.26, 0, 0.15, 0, 0xd8232a, { rough: 0.7 });
    decal(spillKit, 0.28, 0.08, 0, 0.24, 0.131, signFace("SPILL KIT", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.45 }), { px: 160 });
    holoTag(spillKit, "spill kit", 0, 0.36, 0, { css: "#f0c419", w: 0.3 });
    reg(hits, spillKit, "spill-kit");

    // ------------------------------------------------------------- rigging plan
    const plan = holoPanel(g, 0.58, 0.42, -2.0, 1.55, -1.75, (cx, w, h) => {
      cx.fillStyle = "rgba(20,16,2,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f0c419"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c9b56a";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("RIGGING PLAN · RP-2231", w * 0.06, h * 0.14);
      cx.fillStyle = "#f7efd0";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("500 kVA TX — ~2,650 lb", w * 0.06, h * 0.32);
      cx.fillStyle = "#d9c98a";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Sling angle: 60° minimum", "4-leg chain, 1 ton WLL each",
       "Hoist rated 3 ton — margin OK", "Tag line held to the pallet",
       "Set down centred, no swing"].forEach((line, i) => cx.fillText(line, w * 0.06, h * 0.46 + i * h * 0.09));
    }, { ry: 0.3, accent: PCB_ACCENT });
    reg(hits, plan, "rigging-plan");

    // ------------------------------------------------------------------ hoist
    const hoist = group(g, -0.5, 0, -1.55);
    cyl(hoist, 0.04, 0.04, 2.3, -0.55, 1.15, -0.2, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 10 });
    cyl(hoist, 0.04, 0.04, 2.3, 0.55, 1.15, -0.2, CITY.darkSteel, { rough: 0.4, metal: 0.7, seg: 10 });
    box(hoist, 1.3, 0.08, 0.1, 0, 2.28, -0.2, CITY.darkSteel, { rough: 0.4, metal: 0.7 });
    const trolley = group(hoist, 0, 2.24, -0.2);
    box(trolley, 0.14, 0.08, 0.14, 0, 0, 0, 0x3a4048, { rough: 0.5, metal: 0.5 });
    const chainGroup = group(trolley, 0, -0.04, 0);
    for (let i = 0; i < 6; i++) torus(chainGroup, 0.016, 0.005, 0, -i * 0.14, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 6, seg2: 10 });
    const hook = cyl(chainGroup, 0.014, 0.014, 0.1, 0, -0.92, 0, 0x8a939b, { rough: 0.4, metal: 0.8, seg: 8 });
    void hook;
    holoTag(hoist, "chain hoist", 0, 2.5, -0.2, { css: "#f0c419", w: 0.3 });

    // -------------------------------------------------------------- tag line
    const tagLine = group(g, 0.15, 0, -0.9, 0.4);
    cyl(tagLine, 0.008, 0.008, 0.9, 0, 0.45, 0, 0xd8b23a, { rough: 0.7, seg: 8 });
    holoTag(tagLine, "tag line", 0, 0.95, 0, { css: "#f0c419", w: 0.28 });
    reg(hits, tagLine, "tag-line");

    // -------------------------------------------------------------- pallet
    const pallet = group(g, 1.3, 0, 0.5, -0.2);
    box(pallet, 1.15, 0.12, 0.85, 0, 0.06, 0, 0x8a6b3e, { rough: 0.9 });
    for (let i = -1; i <= 1; i++) box(pallet, 0.1, 0.12, 0.85, i * 0.45, 0.06, 0, 0x6f5330, { rough: 0.9, cast: false });
    holoTag(pallet, "lined pallet", 0, 0.32, 0, { css: "#f0c419", w: 0.3 });
    const palletSocket = group(pallet, 0, 0.12, 0);
    hits["pallet-socket"] = palletSocket;

    const linerRoll = group(g, 2.0, 0, 0.85, 0.5);
    cyl(linerRoll, 0.08, 0.08, 0.6, 0, 0.08, 0, 0xdfe6a8, { rough: 0.6, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(linerRoll, "liner roll", 0, 0.24, 0, { css: "#f0c419", w: 0.3 });
    reg(hits, linerRoll, "pallet-liner");

    // The transformer body that will visibly land on the pallet at "lift".
    const liftedUnit = group(g, -0.5, 0, -1.55);
    box(liftedUnit, 0.55, 0.4, 0.4, 0, 0.2, 0, 0x3a5f4a, { rough: 0.55, metal: 0.35 });
    liftedUnit.visible = false;

    const wrapRoll = group(g, 1.75, 0, 0.35, -0.3);
    cyl(wrapRoll, 0.07, 0.07, 0.5, 0, 0.09, 0, 0xdfe6a8, { rough: 0.55, opacity: 0.6, transparent: true, seg: 14 }).rotation.z = Math.PI / 2;
    holoTag(wrapRoll, "pallet wrap", 0, 0.24, 0, { css: "#f0c419", w: 0.3 });
    reg(hits, wrapRoll, "pallet-wrap");
    const wrapMesh = box(pallet, 1.2, 0.6, 0.9, 0, 0.42, 0, 0xdfe6a8, { rough: 0.4, opacity: 0.35, transparent: true, cast: false });
    wrapMesh.visible = false;

    // ---------------------------------------------------------------- label + manifest
    const labelStation = group(g, 1.9, 0, 1.2, -0.3);
    box(labelStation, 0.3, 0.02, 0.24, 0, 0.02, 0, 0x2b3138, { rough: 0.7 });
    const labelPad = decal(labelStation, 0.24, 0.14, 0, 0.028, 0, signFace("PCB WASTE — OOS 09/26", { bg: "#221a02", accent: "#f0c419", scale: 0.34 }), { px: 160 });
    labelPad.rotation.x = -Math.PI / 2;
    labelPad.visible = false;
    holoTag(labelStation, "PCB waste label", 0, 0.24, 0, { css: "#f0c419", w: 0.36 });
    reg(hits, labelPad, "pcb-waste-label");

    const gate = group(g, 2.35, 0, 1.9, -0.3);
    const clipboard = group(gate, -0.2, 0, 0.2, 0.5);
    box(clipboard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(clipboard, 0.12, 0.18, 0, 0.753, 0, signFace("MANIFEST", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.42 })).rotation.x = -Math.PI / 2;
    holoTag(clipboard, "manifest", 0, 0.86, 0, { css: "#f0c419", w: 0.28 });
    reg(hits, clipboard, "manifest-clipboard");

    const shipLever = group(gate, 0.3, 0, 0.3, -0.3);
    box(shipLever, 0.04, 0.28, 0.04, 0, 0.7, 0, 0xd2312b, { rough: 0.55 });
    decal(shipLever, 0.16, 0.05, 0, 0.86, 0, signFace("SHIP IT", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    reg(hits, shipLever, "unlabeled-lift");

    // -------------------------------------------------------------- swab + door
    const swabStation = group(g, -0.9, 0, 0.6);
    box(swabStation, 0.9, 0.006, 0.9, 0, 0.004, 0, 0xf0c419, { rough: 0.7, opacity: 0.25, transparent: true, cast: false });
    const swabKit = group(swabStation, 0.5, 0, -0.3);
    box(swabKit, 0.1, 0.02, 0.1, 0, 0.01, 0, 0x2b3138, { rough: 0.6 });
    cyl(swabKit, 0.006, 0.006, 0.16, 0, 0.09, 0, 0xdfe4e8, { rough: 0.5, seg: 8 });
    holoTag(swabKit, "swab kit", 0, 0.24, 0, { css: "#f0c419", w: 0.28 });
    reg(hits, swabKit, "swab-kit");

    const door = group(g, 2.4, 0, -0.4, -0.3);
    box(door, 0.9, 2.0, 0.08, 0, 1.0, 0, 0x3a3c3e, { rough: 0.7, metal: 0.2 });
    decal(door, 0.5, 0.14, 0, 1.85, 0.05, signFace("EXCLUSION ZONE", { bg: "#221a02", accent: "#f0c419", scale: 0.4 }), { px: 160 });
    holoTag(door, "switch-room door", 0, 2.2, 0.05, { css: "#f0c419", w: 0.4 });
    reg(hits, door, "exclusion-door");

    barrierPanel(g, -1.6, 1.7, { color: PCB_ACCENT });
    cone(g, -1.2, 1.4, { color: PCB_ACCENT });
    cone(g, 0.6, 1.7, { color: PCB_ACCENT });

    // A rigger clear of every control, on the far side of the hoist.
    standingFigure(g, -1.3, 0.35, { ry: 0.6, cloth: 0x2b3138, vest: PCB_ACCENT, helmet: 0xf2f2f2 });
    standingFigure(g, 1.5, -0.9, { ry: -1.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });

    // -------------------------------------------------------------- live state
    let weeping = false, doorBreach = false, liftDone = false, sealed = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.1, -1.0),
      footprint: 2.3,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout") { breakerHandle.rotation.z = -1.0; tag.visible = true; }
        if (step.id === "test-dead") repaint(tester.userData.screen, signFace("DEAD", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "oil-level") repaint(sightGlass.userData.screen, signFace("52 %", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "weep-and-kit") { weepStreak.visible = false; }
        if (step.id === "cap-drain") { drainCap.visible = true; }
        if (step.id === "wrap-bushings") {
          for (const [ph] of PHASES) bushings[ph].wrap.material.opacity = 0.85;
          wrapGap.visible = true;
        }
        if (step.id === "liner") { linerRoll.parent.remove(linerRoll); palletSocket.add(linerRoll); linerRoll.position.set(0, 0.01, 0); linerRoll.rotation.set(0, 0, Math.PI / 2); linerRoll.scale.set(1.6, 1, 1.0); }
        if (step.id === "lift") {
          liftDone = true;
          tank.visible = false;
          liftedUnit.visible = true;
          liftedUnit.position.set(1.3, 0.4, 0.5);
        }
        if (step.id === "seal-pallet") { sealed = true; wrapMesh.visible = true; wrapRoll.parent.remove(wrapRoll); palletSocket.add(wrapRoll); wrapRoll.visible = false; }
        if (step.id === "label-pallet") labelPad.visible = true;
        if (step.id === "walk") { wrapGap.visible = false; }
      },
      onInterrupt(it) {
        if (it.id === "bushing-weep") { weeping = true; weepDrip.visible = true; }
        if (it.id === "door-breach") { doorBreach = true; door.position.z = -0.15; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "bushing-weep") { weeping = false; weepDrip.visible = false; }
        if (it.id === "door-breach") { doorBreach = false; door.position.z = -0.4; }
      },
      onHazard(hitId) {
        if (hitId === "live-touch") { weeping = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        void sealed;
        if (weeping) weepDrip.userData.step(dt, new THREE.Vector3(0, -0.4, 0), 0.03, 0.6, -1.1);
        if (!liftDone) {
          trolley.position.y = 2.24 + Math.sin(t * 0.5) * 0.01;
        }
        void doorBreach;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (step?.id === "test-dead") {
            repaint(tester.userData.screen, signFace(`${(gg.t * 14).toFixed(2)} kV`, {
              bg: "#0d1c24", accent: gg.t < 0.18 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (step?.id === "oil-level") {
            repaint(sightGlass.userData.screen, signFace(`${Math.round(gg.t * 100)} %`, {
              bg: "#0d1c24", accent: gg.t > 0.4 && gg.t < 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
        if (session?.track && step?.id === "lift") {
          const v = session.track.v;
          tagLine.rotation.z = (v - 0.5) * 0.6;
        }
      },
    };
  },
};
