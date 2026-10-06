import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, particles,
  ownMaterial,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Sterilisation Centre VR — Dental & Oral Health.
//
// The instrument processing room treated as the career it is rather than the
// chore it looks like from the corridor. A technician here owns a one-way
// journey — soiled in at one end, released sterile at the other — and the
// journey is the qualification: zones that never run backwards, mechanical
// cleaning instead of a brush in a hand, packs that carry their own internal
// indicator and their own load number, a cycle chosen for what is actually in
// the chamber, a chart read before anything is released, a weekly spore test
// with its control, and a recall that can name every pack a suspect load
// produced.
//
// The certifications named belong to sterile processing and to dental
// infection control; the bodies are named rather than any clause number.

const STC_ACCENT = 0x7fc8a4;
const STC_DIRTY = 0xb04a3c;
const STC_CLEAN = 0x2f7d8c;
const STC_STEEL = 0xbcc4ca;

export const SIM_STERILISATION_TECHNICIAN_CYCLE = {
  id: "sterilisation-technician-cycle",
  index: "215",
  domain: "Dental",
  trade: "Sterile processing technician — dental instruments",
  category: "Dental & Oral Health",
  indoor: "clinic",
  weather: "clear",
  certification: "DANB's Infection Control (ICE) component and, where the office requires it, a sterile processing technician certification (CRCST / CBSPD); ANSI/AAMI ST79 for steam sterilisation and sterility assurance in health care facilities; the CDC's Guidelines for Infection Control in Dental Health-Care Settings; the FDA's reprocessing instructions that every reusable device carries; OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication; the American Dental Assistants Association (ADAA) as the profession's body; SEIU and UFCW clinic staff agreements",
  name: "Sterilisation Centre",
  title: simTitle("Sterilisation Centre"),
  tagline: "The processing room as a career: one-way zones, mechanical cleaning, indicators and load numbers, a cycle chosen for the chamber, a chart read before release, a spore test with its control and a recall that can name every pack",
  accent: STC_ACCENT,
  accentCss: "#7fc8a4",
  parSeconds: 310,
  footprint: 2.2,
  badge: { id: "load-released-clean", name: "Load Released Clean", note: "A load carried from soiled intake to documented release with the chart read, the spore test running and the recall opened on evidence" },

  game: system({
    name: "Sterility Assurance",
    currency: "LOAD",
    ranks: ["Processing Trainee", "Instrument Technician", "Sterile Processing Technician", "Processing Lead", "Sterility Assurance Certified"],
    badges: [
      { id: "flow-never-reversed", name: "Flow Never Reversed", note: "The one-way journey walked in order, soiled to sterile", test: AWARD.stepClean("zone-flow") },
      { id: "nothing-released-on-faith", name: "Nothing Released On Faith", note: "No unsafe action anywhere in the load", test: AWARD.safe },
      { id: "dose-measured", name: "Dose Measured", note: "Detergent dilution committed inside the label band", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-load", name: "Clean Load", note: "No corrections anywhere in the load", test: AWARD.clean },
      { id: "never-broke-a-cycle", name: "Never Broke A Cycle", note: "Both timed passages carried without a break", test: AWARD.unbroken },
      { id: "turnaround", name: "Turnaround", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stc-open-tray-transport": "Those instruments have been carried up the corridor on an open tray. Soiled instruments travel in a closed, leak-resistant, labelled container for the length of that journey — an open tray hands a puncture to anyone who catches it, spills contaminated debris on a floor people walk barefoot past in a clinic, and makes the corridor part of the dirty zone.",
    "stc-wet-pack": "That pouch is still damp and it is being put away as finished. A wet pack is treated as contaminated, full stop: moisture wicks organisms straight through packaging that is only a barrier while it is dry, and it also means the drying phase of the cycle did not do its job — which is a fault in the run, not a cosmetic detail about the pouch.",
    "stc-immediate-use-shortcut": "A wrapped cassette has been put through the short unwrapped cycle to make a turnaround. An immediate-use cycle is validated for a specific unwrapped item taken straight to the point of use, not for a wrapped pack that will be stored; run that way the pack has no validated cycle behind it at all, and nothing about the outside of it will ever show that.",
    "stc-release-on-tape": "The load is being released on the colour change of the tape on the outside. External indicators only separate processed from unprocessed packs — they change on exposure, not on sterilisation — so releasing on tape alone means nobody has looked at whether the chamber actually held time, temperature and pressure for this run.",
  },

  lateNotes: {
    "stc-load-release": "Not yet. Release is the last decision in the room and it is made against the chart, the internal indicator and the biological monitoring — none of which exist for a load that has not run.",
    "stc-recall-notice": "Nothing has failed yet. A recall notice written before there is a result is a recall nobody can scope, because the loads it would cover have not been run.",
    "stc-log-book": "The load is not finished. The log is written from what the chart and the indicators actually said, at the end, not opened in advance.",
  },

  steps: [
    {
      id: "decon-attire", kind: "select", target: "stc-decon-attire",
      title: "Dress for the decontamination side",
      cue: "Fluid-resistant gown, heavy utility gloves, mask and full face shield before you cross into the soiled end.",
      why: "The soiled end of this room is the wettest, sharpest place in the practice: an ultrasonic aerosolises whatever is in its tank, a sink splashes, and every instrument in the bin has an edge or a point on it. OSHA's bloodborne pathogens standard treats the task rather than the room as what sets the barrier, and this task calls for a face shield and utility gloves rather than the exam gloves worn at a chair.",
    },
    {
      id: "zone-flow", kind: "sequence",
      targets: ["stc-zone-dirty", "stc-zone-prep", "stc-zone-clean"],
      itemNames: { "stc-zone-dirty": "decontamination", "stc-zone-prep": "preparation and packaging", "stc-zone-clean": "sterile storage and release" },
      outOfOrderNote: "Out of order. The journey runs one way only — decontamination, then preparation and packaging, then sterile storage and release — and walking it backwards is how a clean bench becomes a contaminated one. Reset and take the zones in flow order.",
      title: "Walk the one-way flow",
      cue: "Trace the room's journey in order: decontamination, preparation and packaging, sterile storage.",
      why: "A processing room is designed as a one-way street, and the design is the control: nothing ever moves from a dirty surface onto a clean one, and nobody carries a soiled cassette back across a packaging bench to fetch something. Physically separated zones with airflow running clean-to-dirty is what AAMI ST79 describes, and in a small dental practice the same idea is held by discipline and by where people stand.",
    },
    {
      id: "intake-container", kind: "drag", target: "stc-transport-bin",
      title: "Receive the closed transport container",
      cue: "Set the closed, labelled container down on the soiled intake counter and open it there.",
      why: "The closed container is what makes the corridor between the operatory and this room safe to walk down, and it stays closed until it is standing on the one counter in the building designed to be contaminated. Opened anywhere else, the whole point of the container is lost — and the person carrying it gets no warning at all before a hand goes in among unsorted sharps.",
      drag: { to: "stc-dirty-counter", radius: 0.4, missNote: "Not on the soiled counter. The container is opened on the intake bench in the decontamination zone, not on a trolley or a packaging surface." },
    },
    {
      id: "ultrasonic-run", kind: "hold", target: "stc-ultrasonic-lid", seconds: 6,
      title: "Run the ultrasonic with the lid closed",
      cue: "Lower the lid and hold it down through the full cleaning time.",
      why: "Cavitation reaches into hinges, serrations and box locks that no brush in anyone's hand can, and it does it with no hand near a blade — which is exactly why the CDC's guidelines prefer a machine here. The lid matters as much as the timer: an open tank sprays a fine aerosol of contaminated solution across the bench and into the room's air for as long as the unit runs.",
      holdBreakNote: "The lid came up mid-run. The cleaning time was cut short and the aerosol went into the room — close it and run the full time from the start.",
    },
    {
      id: "detergent-dose", kind: "gauge", target: "stc-detergent-dose",
      title: "Mix the enzymatic detergent to its label",
      cue: "Dose the fresh solution to the dilution on the bottle and commit inside the band.",
      gauge: {
        label: "DILUTION", speed: 0.62, green: [0.38, 0.58],
        readout: (t) => (t < 0.38 ? "weak — protein will not lift" : t > 0.58 ? "over-concentrated — residue and corrosion" : "at label dilution"),
        missNote: "Off the label dilution. Weak solution leaves protein soil in the joints that then shields organisms from steam; over-concentrated solution leaves residue that stains instruments and attacks their finish, and neither is cheaper than mixing it properly.",
      },
      why: "An enzymatic detergent is a validated product at a stated dilution and a stated temperature, and outside that it is just cloudy water. Too weak and the protein soil the enzymes exist to lift stays in the hinges, where it will later shield microorganisms from the steam; too strong and you are corroding instruments and leaving residue that shows up as staining nobody can explain.",
    },
    {
      id: "loading-faults", kind: "find", noHint: true,
      targets: ["stc-hinged-closed", "stc-nested-basket"],
      itemNames: { "stc-hinged-closed": "a hinged instrument latched shut", "stc-nested-basket": "instruments nested inside each other" },
      itemNotes: {
        "stc-hinged-closed": "This forceps has gone in locked closed. Steam sterilises by direct contact, so a joint clamped shut never sees it — hinged instruments are processed open, every time.",
        "stc-nested-basket": "These two are stacked inside one another. The surface underneath is shadowed for the whole cycle, cleaned and sterilised by nothing at all, and it comes out looking identical to the one on top.",
      },
      title: "Find the two loading faults on this tray",
      cue: "Two items here will come out of a passed cycle unsterilised. Find them.",
      why: "Steam has to touch a surface to sterilise it, which makes loading a technical skill rather than tidying. A hinge clamped shut and a pair of instruments nested together both hide surfaces for the whole run, and the load will still pass every indicator you can read from outside — the failure is invisible after the fact, so it has to be caught before the door closes.",
    },
    {
      id: "package-load", kind: "sequence", anyOrder: true,
      targets: ["stc-pouch-sealer", "stc-internal-indicator", "stc-load-label"],
      itemNames: { "stc-pouch-sealer": "seal the pouch", "stc-internal-indicator": "internal chemical indicator", "stc-load-label": "load number and date" },
      itemNotes: {
        "stc-pouch-sealer": "Sealed with the instruments dry and the pouch not overfilled — a bulging pouch splits its own seal in the chamber.",
        "stc-internal-indicator": "Inside the pack, where steam has to reach it to change — that is the only indicator that says anything about conditions at the instruments.",
        "stc-load-label": "Load number, sterilser and date. This is what makes the pack traceable to a run, which is what makes a recall possible at all.",
      },
      title: "Package with an internal indicator and a load number",
      cue: "Seal the pouch, place the internal indicator inside it, and write the load number and date on the outside.",
      why: "These three things together are what turn a bag of instruments into a traceable unit. The internal indicator is the only one that reports conditions where the instruments actually are; the load number is what lets this exact pack be pulled from a shelf six weeks later if this exact run turns out to be suspect. A pack without one is untraceable the moment it leaves the room.",
    },
    {
      id: "select-cycle", kind: "turn", target: "stc-cycle-selector",
      title: "Select the cycle for what is actually in the chamber",
      cue: "Turn the selector to the wrapped-goods cycle with its drying phase.",
      turn: { turns: 1.2, axis: "y", label: "CYCLE SELECT" },
      why: "A steriliser has several cycles because a wrapped pack, an unwrapped instrument and a hollow handpiece each need different exposure and drying. Wrapped goods need the longer exposure and the drying phase, because a pack that comes out wet is a contaminated pack; choosing by habit or by whichever button is nearest means the load ran a programme that was validated for something else entirely.",
    },
    {
      id: "load-chamber", kind: "drag", target: "stc-pouch-pack",
      title: "Load the chamber so steam reaches every surface",
      cue: "Set the pouch on the rack on edge, clear of its neighbours and clear of the chamber wall.",
      why: "Packs go on edge, spaced, and never touching the chamber wall, because steam sterilises by direct contact and condensate has to be able to run off rather than pool. Stacked flat, the pouch underneath is shadowed for the entire run and comes out wet; pressed against the wall, a pouch superheats on one face and can scorch through its own paper side.",
      drag: { to: "stc-chamber-rack", radius: 0.4, missNote: "Not on the rack. Stand the pouch on edge in a rack slot with space either side — flat and stacked is the one loading pattern that reliably produces an unsterile pack." },
    },
    {
      id: "watch-trace", kind: "track", target: "stc-chamber-trace", seconds: 7,
      title: "Watch the cycle's own trace through exposure",
      cue: "Follow the chart recorder and keep the trace in the sterilising band for the whole exposure phase.",
      why: "The chart or printout is the only physical record of what the chamber actually did, and watching it run is how a technician learns what a normal cycle looks like — so that an abnormal one is obvious. A trace that sags out of the band mid-exposure is the cycle failing in front of you, which is a very different problem from a cycle that fails at the end and lights a fault code.",
      track: {
        start: 0.16, green: [0.38, 0.6], rise: 0.5, fall: 0.44, drift: 0.13, label: "CHAMBER TRACE",
        readout: (v) => (v < 0.38 ? "below sterilising range" : v > 0.6 ? "over-pressure — vent fault" : "at temperature and pressure"),
      },
      holdBreakNote: "The trace left the band. Whatever the panel says at the end, this run did not hold conditions for its whole exposure — the load is reprocessed, not released.",
    },
    {
      id: "biological-monitoring", kind: "select", target: "stc-bi-incubator",
      title: "Read the biological monitoring with its control",
      cue: "Check the incubated spore test against its matched unprocessed control.",
      why: "A biological indicator is the only test that challenges a cycle with something alive — spores far more resistant than anything on a real instrument — and the unprocessed control is what proves the batch of spores was viable to begin with. A negative test with a control that also came back negative proves nothing at all except that the test itself was dead, which is why the two are always read as a pair.",
    },
    {
      id: "release-decision", kind: "select", target: "stc-load-release",
      title: "Make the release decision on evidence",
      cue: "Release the load against the chart, the internal indicator and the monitoring status — or hold it.",
      why: "Release is a judgement with three inputs: the physical record from the chart, the internal chemical indicator from inside the pack, and where the biological monitoring stands. All three agreeing is a released load; any one of them missing or wrong is a held load. A technician who can say out loud which of the three they checked is doing the job, and one who cannot is guessing on behalf of every patient downstream.",
    },
    {
      id: "open-recall", kind: "drag", target: "stc-recall-notice",
      title: "Open the recall for the failed run",
      cue: "File the recall notice and pull every pack the suspect runs produced.",
      why: "A positive spore test is information about the steriliser, not about the one pouch the indicator happened to ride in, so the recall covers every load since the last confirmed negative result. That is what the load numbers on every pack were written for: without them the recall has no boundary and the only honest scope is everything in the building, which is a very expensive way to find out why traceability mattered.",
      drag: { to: "stc-recall-slot", radius: 0.4, missNote: "Not filed. The recall notice goes into the binder with the load numbers it covers, so the next person can see what was pulled and what is still out." },
    },
    {
      id: "lead-checkin", kind: "select", target: "stc-lead-checkin",
      title: "Check in with the processing lead before the room is handed on",
      cue: "Tell the lead what ran, what was held and what the recall covers.",
      why: "The failure this room found belongs to the whole practice: a held load means chairs upstairs are short of instruments, and a recall means somebody has to decide which appointments can still go ahead. The lead is also the person who arranges the service call and the repeat spore tests the steriliser now needs before it goes back in routine use, and none of that starts from a note left on a bench.",
    },
    {
      id: "close-log", kind: "select", target: "stc-log-book",
      title: "Close the sterilisation log and hand the shift over",
      cue: "Record the load, the chart result, the indicators, the monitoring and the recall scope.",
      why: "The log is the only thing in this room that still exists next year. Load number, cycle, chart result, internal indicator, spore test and control, who released it and what was held: with that written down, a drifting steriliser or a pattern of wet packs is visible as a pattern. Without it, every one of those events is an isolated oddity that nobody connects to the next one.",
    },
  ],

  interrupts: [
    {
      id: "stc-turnaround-demand",
      kind: "Schedule pressure",
      after: "ultrasonic-run", delay: 3, seconds: 12,
      alert: "The front desk needs a hygiene cassette back in ten minutes and someone has queued a wrapped pack on the short unwrapped cycle to make it.",
      cue: "The answer to a turnaround is a spare sterile set, not a shorter cycle.",
      target: "stc-sterile-storage",
      why: "An immediate-use cycle is validated for a specific unwrapped item carried straight to the point of use — not for a wrapped pack that will be stored or transported. The correct answer to a schedule problem is the spare sterile set on the storage shelf, because there is no version of this where a pack gets a cycle that was never validated for it.",
      missNote: "The wrapped pack ran the short cycle and went upstairs. It will be used on a patient, it will look exactly like a properly processed pack, and nothing on the outside of it will ever record that the cycle behind it was validated for something else — which is why this decision is made here and not upstairs.",
      wrongNote: "It is the sterile storage shelf. Issue the spare set that is already processed and let the wrapped pack have the cycle it actually needs.",
    },
    {
      id: "stc-door-seal-vent",
      kind: "Equipment fault",
      after: "watch-trace", delay: 3, seconds: 11,
      alert: "Steam is jetting from the chamber door seal and the trace has dropped off the band.",
      cue: "Stop the machine before anyone walks past that door.",
      target: "stc-emergency-stop",
      why: "A failed door gasket vents saturated steam at sterilising temperature straight out at standing height, and a scald from it does not announce itself before it happens. The unit comes down first, the room is cleared, and the load inside is treated as unprocessed — a run that lost its seal never held pressure, whatever the panel shows when it finishes.",
      missNote: "The chamber kept venting for the rest of the cycle. Somebody walked past a jet of steam at head height, the load inside never held pressure, and the run will still report a completed cycle to whoever opens that door — three separate problems from one unacknowledged fault.",
      wrongNote: "It is the emergency stop. Bring the steriliser down, clear the area, then deal with the load and the service call.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, STC_ACCENT);

    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#bcc8ca", base2: "#b1bec1", seam: "rgba(0,0,0,0.12)",
    }), { repeat: 4, px: 256 });
    const steelTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 6, px: 256 });
    const steelTop = () => texturedMat(steelTex, { rough: 0.4, metal: 0.55, color: STC_STEEL });

    const floorPlate = slab(g, 5.6, 0.008, 5.6, 0, 0.002, 0, 0xbcc8ca, { radius: 0.05, cast: false });
    floorPlate.material = texturedMat(floorTex, { rough: 0.7, metal: 0.05, color: 0xc8d2d4 });

    // ------------------------------------------------- zone markings on the floor
    const ZONES = [
      ["stc-zone-dirty", -1.8, 1.0, "1 · DECONTAMINATION", STC_DIRTY],
      ["stc-zone-prep", 0.0, 1.35, "2 · PREP + PACKAGING", CITY.hiVis],
      ["stc-zone-clean", 1.8, 1.0, "3 · STERILE + RELEASE", STC_CLEAN],
    ];
    for (const [id, x, z, label, colour] of ZONES) {
      const pad = group(g, x, 0, z);
      const disc = cyl(pad, 0.4, 0.4, 0.006, 0, 0.012, 0, colour, { rough: 0.82, seg: 24, cast: false });
      torus(pad, 0.4, 0.012, 0, 0.016, 0, colour, { emissive: colour, ei: 0.3, rough: 0.6, seg: 6, seg2: 26, cast: false })
        .rotation.x = Math.PI / 2;
      const face = decal(pad, 0.56, 0.11, 0, 0.02, 0.15, signFace(label, { bg: "#141f22", accent: "#cdf0de", scale: 0.4 }), { px: 224 });
      face.rotation.x = -Math.PI / 2;
      holoTag(pad, label, 0, 0.3, 0, { css: "#7fc8a4", w: 0.5 });
      reg(hits, disc, id);
    }
    // A painted arrow between the zones, so the one-way flow is drawn on the floor.
    for (const x of [-0.95, 0.95]) {
      const arrow = group(g, x, 0, 1.2);
      box(arrow, 0.5, 0.005, 0.05, 0, 0.01, 0, 0xe4eef0, { rough: 0.85, cast: false });
      box(arrow, 0.12, 0.005, 0.12, 0.2, 0.01, 0, 0xe4eef0, { rough: 0.85, cast: false }).rotation.y = Math.PI / 4;
    }

    // ------------------------------------------------------------ dirty zone bench
    const dirtyBench = group(g, -2.3, 0, -0.2, 0.55);
    box(dirtyBench, 1.4, 0.86, 0.6, 0, 0.43, 0, STC_DIRTY, { rough: 0.55, metal: 0.1 });
    const dirtyTop = slab(dirtyBench, 1.46, 0.045, 0.64, 0, 0.88, 0, STC_STEEL, { radius: 0.01 });
    dirtyTop.material = steelTop();
    decal(dirtyBench, 0.5, 0.11, 0, 0.6, 0.31, signFace("SOILED — DO NOT CROSS BACK", { bg: "#7a2e24", accent: "#ffd7cf", scale: 0.3 }), { px: 256 });
    // Twin sinks, one for washing and one for rinsing.
    for (const sx of [-1, 1]) {
      cyl(dirtyBench, 0.15, 0.15, 0.16, sx * 0.36, 0.86, 0.02, 0xdfe4e8, { rough: 0.25, metal: 0.35, seg: 18, open: true, side: 2 });
      cyl(dirtyBench, 0.016, 0.016, 0.26, sx * 0.36, 1.02, -0.2, CITY.steel, { rough: 0.3, metal: 0.85, seg: 10 }).rotation.x = -0.4;
    }
    const dirtyCounterSocket = box(dirtyBench, 0.42, 0.06, 0.3, 0, 0.92, 0.18, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(dirtyBench, "soiled intake", 0, 1.06, 0.2, { css: "#f0645b", w: 0.4 });
    reg(hits, dirtyCounterSocket, "stc-dirty-counter");

    // The closed transport container that arrives from the operatory.
    const transportBin = group(g, -1.55, 0, 0.1, 0.3);
    box(transportBin, 0.32, 0.18, 0.24, 0, 0.98, 0, 0x2f5f8c, { rough: 0.5 });
    const binLid = box(transportBin, 0.34, 0.03, 0.26, 0, 1.09, 0, 0x244b70, { rough: 0.5 });
    decal(transportBin, 0.26, 0.07, 0, 0.99, 0.122, signFace("BIOHAZARD — CLOSED", { bg: "#1b3a56", accent: "#f2ae14", scale: 0.3 }), { px: 224 });
    cyl(transportBin, 0.03, 0.03, 0.02, 0, 0.98, 0.13, 0x8d959d, { rough: 0.4, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(transportBin, "transport container", 0, 1.2, 0, { css: "#7fc8a4", w: 0.5 });
    reg(hits, transportBin, "stc-transport-bin");
    void binLid;

    // PPE station for the decontamination side.
    const attire = group(g, -2.4, 0, -1.6, 0.4);
    slab(attire, 0.6, 1.7, 0.08, 0, 0.85, 0, 0x4e5860, { radius: 0.02, rough: 0.5, metal: 0.35 });
    slab(attire, 0.4, 0.8, 0.06, 0, 1.0, 0.08, 0xf2e2b8, { radius: 0.04, rough: 0.75 });
    box(attire, 0.22, 0.14, 0.08, 0, 0.56, 0.1, 0xf2c14b, { rough: 0.75 });
    const faceShield = slab(attire, 0.26, 0.2, 0.01, 0, 1.5, 0.1, 0xbfe4f2, { radius: 0.03, rough: 0.2, opacity: 0.5, transparent: true });
    torus(attire, 0.1, 0.014, 0, 1.6, 0.1, 0x2f6f8c, { rough: 0.35, metal: 0.2, seg: 6, seg2: 18 });
    holoTag(attire, "decon attire", 0, 1.76, 0.1, { css: "#7fc8a4", w: 0.4 });
    reg(hits, attire, "stc-decon-attire");
    void faceShield;

    // --------------------------------------------------------------- ultrasonic
    const ultra = group(g, -1.15, 0, -1.55, -0.2);
    box(ultra, 0.56, 0.44, 0.42, 0, 0.66, 0, 0x4e5860, { rough: 0.4, metal: 0.5 });
    box(ultra, 0.6, 0.06, 0.46, 0, 0.42, 0, 0x36404a, { rough: 0.5, metal: 0.4 });
    const tank = box(ultra, 0.46, 0.16, 0.32, 0, 0.9, 0, 0x8fb3c4, { rough: 0.2, metal: 0.2, opacity: 0.5, transparent: true });
    const ultraLid = group(ultra, 0, 0.99, -0.16);
    const lidPlate = slab(ultraLid, 0.5, 0.03, 0.34, 0, 0, 0.17, STC_STEEL, { radius: 0.01, rough: 0.35, metal: 0.6 });
    box(ultraLid, 0.12, 0.03, 0.03, 0, 0.03, 0.33, 0x2b3138, { rough: 0.6 });
    ultraLid.rotation.x = -1.1;
    holoTag(ultra, "ultrasonic — lid down", 0, 1.16, 0, { css: "#7fc8a4", w: 0.52 });
    reg(hits, ultraLid, "stc-ultrasonic-lid");
    const bubbles = particles(ultra, 26, 0xbfe4f2, { size: 0.01, life: 0.5, additive: false, opacity: 0.5 });
    void tank; void lidPlate;

    // The basket of instruments, with the two loading faults in it.
    const basket = group(ultra, 0, 0.9, 0);
    box(basket, 0.38, 0.02, 0.24, 0, 0, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    for (let i = 0; i < 7; i++) box(basket, 0.005, 0.05, 0.24, -0.16 + i * 0.054, 0.03, 0, CITY.steel, { rough: 0.3, metal: 0.8, cast: false });

    const hingedClosed = group(basket, -0.1, 0.05, 0.02, 0.4);
    for (const sx of [-1, 1]) {
      const limb = box(hingedClosed, 0.012, 0.006, 0.12, sx * 0.004, 0, 0, CITY.steel, { rough: 0.25, metal: 0.85 });
      limb.rotation.y = sx * 0.02;
    }
    ball(hingedClosed, 0.008, 0, 0, -0.05, CITY.alert, { rough: 0.4, seg: 10 });
    holoTag(hingedClosed, "latched shut", 0, 0.08, 0, { css: "#f0645b", w: 0.36 });
    reg(hits, hingedClosed, "stc-hinged-closed");

    const nested = group(basket, 0.1, 0.05, 0.02, -0.3);
    for (let i = 0; i < 2; i++) {
      const bowl = cyl(nested, 0.03 - i * 0.004, 0.022, 0.02, 0, i * 0.012, 0, STC_STEEL, { rough: 0.25, metal: 0.8, seg: 16 });
      void bowl;
    }
    holoTag(nested, "nested", 0, 0.08, 0, { css: "#f0645b", w: 0.26 });
    reg(hits, nested, "stc-nested-basket");

    // Detergent bottle and dosing cup.
    const detergent = group(g, -1.9, 0, -1.05, 0.2);
    cyl(detergent, 0.055, 0.06, 0.24, 0, 1.02, 0, 0x2f7d6a, { rough: 0.4, metal: 0.1, seg: 16 });
    cyl(detergent, 0.03, 0.03, 0.04, 0, 1.16, 0, 0xdfe4e8, { rough: 0.5, seg: 12 });
    decal(detergent, 0.08, 0.1, 0, 1.03, 0.061, paperFace("", ["ENZYMATIC", "1:128", "FRESH DAILY"], { bg: "#e9f7f1" }), { px: 176 });
    const dosingCup = cyl(detergent, 0.035, 0.03, 0.07, 0.11, 0.94, 0, 0xdfe8ee, { rough: 0.2, metal: 0.1, opacity: 0.6, transparent: true, seg: 14 });
    holoTag(detergent, "detergent dilution", 0, 1.24, 0, { css: "#7fc8a4", w: 0.48 });
    reg(hits, detergent, "stc-detergent-dose");
    void dosingCup;

    // The open tray carried up the corridor — the hazard.
    const openTray = group(g, -1.05, 0, 0.55, -0.4);
    slab(openTray, 0.3, 0.02, 0.2, 0, 0.92, 0, 0x8b929a, { radius: 0.01, rough: 0.45, metal: 0.4 });
    for (let i = 0; i < 4; i++) {
      const sharp = cyl(openTray, 0.004, 0.004, 0.13, -0.09 + i * 0.06, 0.94, 0, CITY.alert, { rough: 0.3, metal: 0.7, seg: 6 });
      sharp.rotation.z = Math.PI / 2;
      sharp.rotation.y = 0.2 * i;
    }
    for (const sx of [-1, 1]) cyl(openTray, 0.015, 0.015, 0.9, sx * 0.1, 0.46, 0, 0x6f7a83, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(openTray, "open tray in the corridor", 0, 1.08, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, openTray, "stc-open-tray-transport");

    // ---------------------------------------------------- prep + packaging bench
    const prepBench = group(g, 0.1, 0, -1.85, 0);
    box(prepBench, 1.8, 0.86, 0.6, 0, 0.43, 0, 0xd4dbd8, { rough: 0.55, metal: 0.1 });
    const prepTop = slab(prepBench, 1.86, 0.045, 0.64, 0, 0.88, 0, STC_STEEL, { radius: 0.01 });
    prepTop.material = steelTop();
    for (let i = 0; i < 4; i++) {
      box(prepBench, 0.4, 0.22, 0.02, -0.66 + i * 0.44, 0.62, 0.31, 0xc3cbc8, { rough: 0.5 });
      box(prepBench, 0.13, 0.018, 0.018, -0.66 + i * 0.44, 0.62, 0.33, 0x8d959d, { rough: 0.3, metal: 0.8 });
    }

    // Pouch sealer.
    const sealer = group(prepBench, -0.6, 0.9, 0.0, 0.1);
    box(sealer, 0.36, 0.12, 0.2, 0, 0.06, 0, 0x3a4048, { rough: 0.45, metal: 0.35 });
    const sealerBar = box(sealer, 0.34, 0.04, 0.05, 0, 0.14, -0.06, 0x8d959d, { rough: 0.35, metal: 0.7 });
    const sealerLamp = box(sealer, 0.05, 0.015, 0.03, 0.14, 0.13, 0.08, CITY.good, { emissive: CITY.good, ei: 0.6, rough: 0.4, cast: false });
    ownMaterial(sealerLamp);
    decal(sealer, 0.14, 0.04, -0.08, 0.13, 0.1, signFace("SEALER", { bg: "#22282d", accent: "#9fe8c0", scale: 0.4 }), { px: 128 });
    holoTag(sealer, "pouch sealer", 0, 0.3, 0, { css: "#7fc8a4", w: 0.38 });
    reg(hits, sealer, "stc-pouch-sealer");
    void sealerBar;

    // Internal chemical indicator strips.
    const indicatorBox = group(prepBench, -0.2, 0.9, 0.08, -0.2);
    box(indicatorBox, 0.14, 0.06, 0.1, 0, 0.03, 0, 0xf2c14b, { rough: 0.6 });
    for (let i = 0; i < 4; i++) box(indicatorBox, 0.012, 0.055, 0.075, -0.04 + i * 0.026, 0.07, 0, 0xf4f8fa, { rough: 0.5 });
    decal(indicatorBox, 0.11, 0.035, 0, 0.032, 0.051, signFace("INTERNAL CI", { bg: "#8a6a10", accent: "#fff3d0", scale: 0.32 }), { px: 160 });
    holoTag(indicatorBox, "internal indicator", 0, 0.2, 0, { css: "#7fc8a4", w: 0.48 });
    reg(hits, indicatorBox, "stc-internal-indicator");

    // Load-number marker and labels.
    const labelBlock = group(prepBench, 0.16, 0.9, 0.08, 0.3);
    box(labelBlock, 0.1, 0.02, 0.07, 0, 0.01, 0, 0xeef3f5, { rough: 0.7 });
    cyl(labelBlock, 0.007, 0.007, 0.11, 0.05, 0.03, 0.02, 0x2b3138, { rough: 0.5, seg: 8 }).rotation.z = 1.1;
    const labelFace = decal(labelBlock, 0.09, 0.03, 0, 0.022, 0, signFace("LOAD ___ / ___", { bg: "#eef3f5", accent: "#2f6f5c", scale: 0.34 }), { px: 160 });
    labelFace.rotation.x = -Math.PI / 2;
    holoTag(labelBlock, "load number + date", 0, 0.16, 0, { css: "#7fc8a4", w: 0.5 });
    reg(hits, labelBlock, "stc-load-label");

    // The packaged pouch that gets loaded, and the damp pack left on the bench.
    const pouchPack = group(prepBench, 0.58, 0.92, 0.04, 0.15);
    slab(pouchPack, 0.26, 0.015, 0.11, 0, 0, 0, 0xf4f8fa, { radius: 0.008, rough: 0.5, opacity: 0.85, transparent: true });
    decal(pouchPack, 0.1, 0.035, -0.06, 0.01, 0, signFace("LOAD 41", { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.4 }), { px: 128 })
      .rotation.x = -Math.PI / 2;
    for (let i = 0; i < 4; i++) box(pouchPack, 0.008, 0.008, 0.08, -0.06 + i * 0.03, 0.006, 0, CITY.steel, { rough: 0.3, metal: 0.7, cast: false });
    holoTag(pouchPack, "packaged pouch", 0, 0.1, 0, { css: "#7fc8a4", w: 0.42 });
    reg(hits, pouchPack, "stc-pouch-pack");

    const wetPack = group(prepBench, 0.84, 0.92, -0.12, -0.25);
    slab(wetPack, 0.24, 0.016, 0.11, 0, 0, 0, 0xcfe0e6, { radius: 0.008, rough: 0.35, opacity: 0.8, transparent: true });
    for (let i = 0; i < 3; i++) ball(wetPack, 0.008, -0.05 + i * 0.05, 0.012, 0.02, 0xbfe4f2, { rough: 0.1, opacity: 0.7, transparent: true, seg: 10 });
    holoTag(wetPack, "still damp", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, wetPack, "stc-wet-pack");

    // ----------------------------------------------------------------- steriliser
    const auto = group(g, 1.5, 0, -1.7, -0.35);
    box(auto, 0.9, 1.5, 0.7, 0, 0.78, 0, 0xe0e6e4, { rough: 0.45, metal: 0.25 });
    box(auto, 0.94, 0.1, 0.74, 0, 0.05, 0, 0x4e5860, { rough: 0.55, metal: 0.4 });
    const chamberDoor = group(auto, 0, 1.0, 0.36);
    cyl(chamberDoor, 0.27, 0.27, 0.08, 0, 0, 0, 0xc7cfd2, { rough: 0.3, metal: 0.6, seg: 24 }).rotation.x = Math.PI / 2;
    torus(chamberDoor, 0.27, 0.02, 0, 0, 0.02, 0x8d959d, { rough: 0.35, metal: 0.8, seg: 8, seg2: 26 });
    const doorHandle = box(chamberDoor, 0.05, 0.16, 0.05, 0.3, 0, 0.02, 0x2b3138, { rough: 0.5, metal: 0.4 });
    void doorHandle;
    const doorSeal = torus(chamberDoor, 0.24, 0.012, 0, 0, 0.045, 0x2b3138, { rough: 0.8, seg: 8, seg2: 24 });
    ownMaterial(doorSeal);

    // The chamber rack the pouch is loaded onto, seen through the open door.
    const chamberRack = group(auto, 0, 1.0, 0.2);
    box(chamberRack, 0.34, 0.015, 0.22, 0, -0.08, 0, CITY.steel, { rough: 0.3, metal: 0.8 });
    for (let i = 0; i < 5; i++) box(chamberRack, 0.006, 0.12, 0.2, -0.13 + i * 0.065, -0.01, 0, CITY.steel, { rough: 0.3, metal: 0.8, cast: false });
    holoTag(chamberRack, "chamber rack — on edge", 0, 0.14, 0, { css: "#7fc8a4", w: 0.56 });
    reg(hits, chamberRack, "stc-chamber-rack");

    // Cycle selector, chart recorder, emergency stop.
    const selector = group(auto, -0.3, 1.36, 0.36);
    cyl(selector, 0.06, 0.06, 0.03, 0, 0, 0, CITY.hiVis, { rough: 0.5, metal: 0.3, seg: 18 }).rotation.x = Math.PI / 2;
    const selectorPointer = box(selector, 0.012, 0.012, 0.1, 0, 0.025, 0.02, 0x2b3138, { rough: 0.6 });
    for (let i = 0; i < 4; i++) {
      const a = -0.9 + (i / 3) * 1.8;
      box(selector, 0.006, 0.018, 0.006, Math.sin(a) * 0.075, Math.cos(a) * 0.075, 0.02, 0xdfe4e8, { rough: 0.5, cast: false });
    }
    decal(selector, 0.18, 0.04, 0, -0.1, 0.02, signFace("WRAPPED / UNWRAPPED", { bg: "#2b3138", accent: "#f2e2a8", scale: 0.26 }), { px: 224 });
    holoTag(selector, "cycle select", 0, 0.16, 0, { css: "#7fc8a4", w: 0.36 });
    reg(hits, selector, "stc-cycle-selector");
    void selectorPointer;

    const recorder = group(auto, 0.3, 1.36, 0.36);
    box(recorder, 0.3, 0.22, 0.05, 0, 0, 0, 0x1d262b, { rough: 0.45, metal: 0.3 });
    const traceFace = decal(recorder, 0.26, 0.17, 0, 0, 0.03,
      paperFace("CHAMBER", ["TEMP ——", "PRESS ——"], { bg: "#0c1417", band: "#7fc8a4" }), { px: 256 });
    holoTag(recorder, "chart recorder", 0, 0.18, 0, { css: "#7fc8a4", w: 0.4 });
    reg(hits, recorder, "stc-chamber-trace");

    const estop = group(auto, 0.42, 1.0, 0.36);
    cyl(estop, 0.06, 0.06, 0.025, 0, 0, 0, 0xf2e9c9, { rough: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    const estopCap = cyl(estop, 0.045, 0.045, 0.03, 0, 0, 0.025, 0xd8342a, { emissive: 0xd8342a, ei: 0.25, rough: 0.5, seg: 18 });
    estopCap.rotation.x = Math.PI / 2;
    ownMaterial(estopCap);
    holoTag(estop, "emergency stop", 0, 0.12, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, estop, "stc-emergency-stop");

    hose(auto, [[-0.46, 0.4, 0.2], [-0.8, 0.3, 0.4], [-1.0, 0.12, 0.2]], 0.016, 0xb6bec4, { steps: 12, rough: 0.4 });

    // The wrapped pack queued on the short cycle — the hazard.
    const shortCycle = group(auto, 0.0, 0.5, 0.4);
    slab(shortCycle, 0.2, 0.014, 0.1, 0, 0, 0, 0xf0d6d2, { radius: 0.006, rough: 0.5 });
    decal(shortCycle, 0.16, 0.05, 0, 0.012, 0, signFace("IMMEDIATE USE", { bg: "#5a2b26", accent: "#ffcfc7", scale: 0.3 }), { px: 192 })
      .rotation.x = -Math.PI / 2;
    holoTag(shortCycle, "wrapped pack, short cycle", 0, 0.12, 0, { css: "#f0645b", w: 0.58 });
    reg(hits, shortCycle, "stc-immediate-use-shortcut");

    // ------------------------------------------------- clean zone: release bench
    const releaseBench = group(g, 2.35, 0, 0.25, -0.75);
    box(releaseBench, 1.4, 0.86, 0.58, 0, 0.43, 0, 0xd2dcdb, { rough: 0.55, metal: 0.1 });
    const releaseTop = slab(releaseBench, 1.46, 0.045, 0.62, 0, 0.88, 0, 0xeef5f4, { radius: 0.01, rough: 0.45 });
    void releaseTop;
    decal(releaseBench, 0.46, 0.1, 0, 0.62, 0.3, signFace("RELEASE — CLEAN SIDE", { bg: "#1d4f58", accent: "#bfeaf0", scale: 0.3 }), { px: 256 });

    const incubator = group(releaseBench, -0.46, 0.9, 0.0, 0.15);
    box(incubator, 0.24, 0.2, 0.2, 0, 0.1, 0, 0x3a4048, { rough: 0.45, metal: 0.3 });
    const incubatorFace = decal(incubator, 0.18, 0.08, 0, 0.12, 0.101, signFace("BI — INCUBATING", { bg: "#101a1e", accent: "#f2e2a8", scale: 0.3 }), { px: 224 });
    for (let i = 0; i < 2; i++) {
      cyl(incubator, 0.016, 0.016, 0.07, -0.05 + i * 0.1, 0.22, 0, i ? 0xdfe4e8 : 0xf2c14b, { rough: 0.3, opacity: 0.7, transparent: true, seg: 12 });
    }
    decal(incubator, 0.16, 0.035, 0, 0.005, 0.101, signFace("TEST + CONTROL", { bg: "#22282d", accent: "#bfeaf0", scale: 0.3 }), { px: 192 });
    holoTag(incubator, "spore test + control", 0, 0.32, 0, { css: "#7fc8a4", w: 0.52 });
    reg(hits, incubator, "stc-bi-incubator");

    const releasePad = group(releaseBench, 0.0, 0.9, 0.06);
    box(releasePad, 0.22, 0.03, 0.16, 0, 0, 0, 0x2f6f5c, { rough: 0.5 });
    const releaseLamp = box(releasePad, 0.16, 0.012, 0.11, 0, 0.022, 0, CITY.hiVis, { emissive: CITY.hiVis, ei: 0.5, rough: 0.4, cast: false });
    ownMaterial(releaseLamp);
    const releaseFace = decal(releasePad, 0.18, 0.06, 0, 0.026, -0.05, signFace("HOLD / RELEASE", { bg: "#123a31", accent: "#bfeee0", scale: 0.3 }), { px: 192 });
    releaseFace.rotation.x = -Math.PI / 2;
    holoTag(releasePad, "release decision", 0, 0.14, 0, { css: "#7fc8a4", w: 0.44 });
    reg(hits, releasePad, "stc-load-release");

    const tapeOnly = group(releaseBench, 0.28, 0.9, -0.14, 0.3);
    slab(tapeOnly, 0.18, 0.012, 0.09, 0, 0, 0, 0xf4f8fa, { radius: 0.006, rough: 0.5 });
    box(tapeOnly, 0.04, 0.004, 0.09, 0.05, 0.01, 0, 0x5c3a70, { rough: 0.6 });
    holoTag(tapeOnly, "released on tape alone", 0, 0.1, 0, { css: "#f0645b", w: 0.56 });
    reg(hits, tapeOnly, "stc-release-on-tape");

    const logBook = decal(releaseBench, 0.28, 0.34, 0.5, 0.905, 0.04,
      paperFace("STERILISATION LOG", ["Load · cycle · chart", "Internal CI · BI + control", "Released by / held"], { band: "#7fc8a4" }), { px: 256 });
    logBook.rotation.x = -Math.PI / 2;
    holoTag(releaseBench, "sterilisation log", 0.5, 1.06, 0.04, { css: "#7fc8a4", w: 0.46 });
    reg(hits, logBook, "stc-log-book");

    // Recall binder and the notice that goes into it.
    const recallStand = group(g, 2.4, 0, 1.6, -1.1);
    for (const sx of [-1, 1]) box(recallStand, 0.05, 1.0, 0.36, sx * 0.3, 0.5, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(recallStand, 0.66, 0.025, 0.34, 0, 1.0, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
    const binder = group(recallStand, 0, 1.02, 0);
    box(binder, 0.22, 0.07, 0.28, 0, 0.035, 0, 0xb03a3a, { rough: 0.6 });
    decal(binder, 0.18, 0.06, 0, 0.037, -0.08, signFace("RECALL LOG", { bg: "#7a2424", accent: "#ffd7cf", scale: 0.34 }), { px: 192 })
      .rotation.x = -Math.PI / 2;
    const recallSlot = box(binder, 0.2, 0.05, 0.24, 0, 0.09, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(recallStand, "recall binder", 0, 1.22, 0, { css: "#7fc8a4", w: 0.4 });
    reg(hits, recallSlot, "stc-recall-slot");

    const recallNotice = group(g, 1.95, 0, 1.15, 0.4);
    slab(recallNotice, 0.2, 0.004, 0.26, 0, 0.95, 0, 0xfff4e6, { radius: 0.004, rough: 0.8 });
    decal(recallNotice, 0.17, 0.2, 0, 0.958, 0, paperFace("RECALL NOTICE", ["Loads since last", "negative BI", "Pull + reprocess"], { band: "#c0392b" }), { px: 224 })
      .rotation.x = -Math.PI / 2;
    for (const sx of [-1, 1]) cyl(recallNotice, 0.014, 0.014, 0.93, sx * 0.07, 0.47, 0.09, 0x6f7a83, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(recallNotice, "recall notice", 0, 1.08, 0, { css: "#f0645b", w: 0.4 });
    reg(hits, recallNotice, "stc-recall-notice");

    // Sterile storage: closed shelving with dated packs, first-in-first-out.
    const storage = group(g, 2.0, 0, 2.5, -0.4);
    for (const sx of [-1, 1]) box(storage, 0.05, 1.8, 0.5, sx * 0.55, 0.9, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    box(storage, 1.14, 0.05, 0.5, 0, 1.8, 0, 0x8b929a, { rough: 0.5, metal: 0.4 });
    for (const y of [0.5, 0.95, 1.4]) {
      box(storage, 1.08, 0.025, 0.46, 0, y, 0, 0x6f7a83, { rough: 0.55, metal: 0.3 });
      for (let i = 0; i < 4; i++) {
        slab(storage, 0.22, 0.014, 0.4, -0.36 + i * 0.24, y + 0.02, 0, 0xf4f8fa, { radius: 0.006, rough: 0.5, opacity: 0.85, transparent: true });
        decal(storage, 0.17, 0.04, -0.36 + i * 0.24, y + 0.03, 0.09, signFace(`LOAD ${36 + i}`, { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.34 }), { px: 160 })
          .rotation.x = -Math.PI / 2;
      }
    }
    const storageDoor = slab(storage, 1.1, 1.7, 0.02, 0, 0.92, 0.25, 0xbfe4f2, { radius: 0.01, rough: 0.15, opacity: 0.32, transparent: true });
    ownMaterial(storageDoor);
    holoTag(storage, "sterile storage — FIFO", 0, 1.9, 0, { css: "#7fc8a4", w: 0.54 });
    reg(hits, storage, "stc-sterile-storage");

    // ----------------------------------------------------------- the lead, clear
    const lead = standingFigure(g, -2.55, 1.95, { ry: 1.7, cloth: 0x2f6f63, vest: STC_ACCENT, skin: 0xbd8860 });
    holoTag(lead, "processing lead", 0, 1.8, 0, { css: "#7fc8a4", w: 0.42 });
    const leadMark = box(lead, 0.5, 1.2, 0.5, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, leadMark, "stc-lead-checkin");

    const panel = holoPanel(g, 0.76, 0.5, -0.3, 1.65, -2.55, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,22,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fc8a4"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#cdf0de";
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("PROCESSING ROOM — ONE WAY", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eefaf4";
      ctx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`;
      ["Decon · prep + pack · sterile", "Every pack: internal CI + load number",
       "Release on chart, CI and monitoring", "Recall to the last negative spore test"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.16));
      });
    }, { accent: STC_ACCENT });
    void panel;

    for (let i = -1; i <= 1; i += 2) {
      box(g, 1.3, 0.06, 0.34, i * 1.3, 2.62, -0.7, 0xe8edf0, { rough: 0.4, cast: false });
      box(g, 1.16, 0.02, 0.26, i * 1.3, 2.585, -0.7, 0xfdfaf0, { emissive: 0xfdfaf0, ei: 0.55, rough: 0.4, cast: false });
    }

    const key = new THREE.DirectionalLight(0xf7fff8, 0.85);
    key.position.set(-2.0, 4.6, 2.8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -5; key.shadow.camera.right = 5;
    key.shadow.camera.top = 5; key.shadow.camera.bottom = -5;
    g.add(key);
    g.add(new THREE.HemisphereLight(0xf2fdf8, 0x5a6a66, 0.9));

    const steam = particles(g, 30, 0xe6f4f8, { size: 0.016, life: 0.6, additive: false, opacity: 0.5 });
    steam.visible = false;
    let cleaning = false, running = false, venting = false;
    const lidHome = ultraLid.rotation.x;

    return {
      hits,
      footprint: 2.2,
      spawnLook: new THREE.Vector3(0, 1.1, -1.6),

      onStep(step) {
        cleaning = step.id === "ultrasonic-run";
        running = step.id === "watch-trace";
      },

      onStepComplete(step) {
        if (step.id === "intake-container") {
          transportBin.position.set(-2.1, 0, 0.05);
          binLid.rotation.x = -1.2;
          binLid.position.set(0, 1.16, -0.14);
        }
        if (step.id === "ultrasonic-run") ultraLid.rotation.x = lidHome;
        if (step.id === "loading-faults") { hingedClosed.visible = false; nested.visible = false; }
        if (step.id === "package-load") {
          repaint(labelFace, signFace("LOAD 41 / TODAY", { bg: "#eef7f4", accent: "#2f7d4a", scale: 0.32 }));
        }
        if (step.id === "load-chamber") {
          pouchPack.parent.remove(pouchPack);
          chamberRack.add(pouchPack);
          pouchPack.position.set(0, 0.03, 0);
          pouchPack.rotation.set(0, 0, 1.3);
        }
        if (step.id === "biological-monitoring") {
          repaint(incubatorFace, signFace("BI — POSITIVE", { bg: "#3a1414", accent: "#ffb4a8", scale: 0.3 }));
          releaseLamp.material.emissive.set(CITY.alert);
        }
        if (step.id === "release-decision") {
          repaint(releaseFace, signFace("HELD — REPROCESS", { bg: "#3a1414", accent: "#ffb4a8", scale: 0.28 }));
          tapeOnly.visible = false;
        }
        if (step.id === "open-recall") {
          recallNotice.parent.remove(recallNotice);
          binder.add(recallNotice);
          recallNotice.position.set(0, 0.08, 0);
          recallNotice.rotation.set(0, 0, 0);
          shortCycle.visible = false;
        }
        if (step.id === "close-log") {
          repaint(logBook, paperFace("STERILISATION LOG", ["Load 41 · held", "BI positive · recall open", "Service call raised"], { band: "#c0392b" }));
        }
      },

      onInterrupt(it) {
        if (it.id === "stc-turnaround-demand") {
          storageDoor.material.emissiveIntensity = 1.2;
          storageDoor.material.emissive.set(CITY.hiVis);
          shortCycle.position.set(0.0, 0.62, 0.44);
        }
        if (it.id === "stc-door-seal-vent") {
          venting = true;
          steam.visible = true;
          doorSeal.material.emissive.set(CITY.alert);
          doorSeal.material.emissiveIntensity = 1.4;
          estopCap.material.emissiveIntensity = 1.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "stc-turnaround-demand") {
          storageDoor.material.emissiveIntensity = 0.0;
          shortCycle.position.set(0.0, 0.5, 0.4);
        }
        if (it.id === "stc-door-seal-vent") {
          venting = false;
          steam.visible = false;
          doorSeal.material.emissiveIntensity = 0.0;
          estopCap.material.emissiveIntensity = 0.25;
          chamberDoor.rotation.y = 0.35;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        bubbles.visible = cleaning && !!session?.holding;
        if (bubbles.visible) bubbles.userData.step(dt, new THREE.Vector3(-1.15, 0.92, -1.55), 0.16, 0.3, 0.6);
        if (venting) steam.userData.step(dt, new THREE.Vector3(1.5, 1.05, -1.3), 0.1, 0.5, 0.9);
        sealerLamp.material.emissiveIntensity = 0.4 + Math.abs(Math.sin(t * 1.1)) * 0.3;
        const tr = session?.track;
        if (running && tr) {
          const ok = tr.v >= 0.38 && tr.v <= 0.6;
          repaint(traceFace, paperFace("CHAMBER", [`${Math.round(200 + tr.v * 80)} °F`, ok ? "IN BAND" : "OUT OF BAND"],
            { bg: "#0c1417", band: ok ? "#7fc8a4" : "#c0392b" }));
        }
      },
    };
  },
};
