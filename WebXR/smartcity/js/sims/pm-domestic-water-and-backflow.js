import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, particles, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, valveWheel, pipeRun, cylinderTank, lockTag,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Domestic Water & Backflow VR — Building Systems & Facilities,
// property management zone eleven.
//
// The basement water room of a working apartment building: the incoming
// service, the reduced-pressure backflow assembly that keeps the building's
// water out of the street's, the booster pumps that carry it to the top
// floor, and the water heater loop a Legionella plan is written around. The
// annual assembly test worked the way a certified tester works it, the
// cross-connections walked, the hot loop read and mixed down, and the result
// written where the purveyor and the next engineer will find it. Generic
// building, not a real property — only the codes, the standards and the
// unions are named.

const PMDW_ACCENT = 0x4f9fd8;
const PMDW_CSS = "#4f9fd8";
const PMDW_WARN = "#f0645b";

export const SIM_PM_DOMESTIC_WATER_AND_BACKFLOW = {
  id: "pm-domestic-water-and-backflow",
  index: "227",
  domain: "Building Systems & Facilities",
  trade: "Building stationary engineer — IUOE Local 39, with SEIU building staff and a CAMT-credentialed maintenance technician",
  category: "Building Systems & Facilities",
  indoor: "plant",
  certification: "ANSI/ASSE 1013 reduced-pressure principle assemblies and the ASSE 5110 tester qualification behind the annual field test; ASSE 1020 for the courtyard irrigation vacuum breaker; AWWA M14 cross-connection control as the water purveyor enforces it; NSF/ANSI 61 for anything wetted by drinking water; ASHRAE 188 and CDC Legionella guidance for the hot-water loop; OSHA 29 CFR 1910.147 lockout and 29 CFR 1910.1200 hazard communication in the water room; IUOE stationary engineer training, the apartment association's CAMT credential and the local housing code's hot-water requirement at every tap",
  name: "Domestic Water & Backflow",
  title: simTitle("Domestic Water & Backflow"),
  tagline: "The building's water room: the RP assembly tested to its numbers, cross-connections walked, the booster brought back gently, the hot loop held hot and delivered safe, and the test on the purveyor's form",
  accent: PMDW_ACCENT,
  accentCss: PMDW_CSS,
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "clean-service", name: "Clean Service", note: "The assembly passed on real numbers, every cross-connection found, and the hot loop left hot at the heater and safe at the tap" },

  // Named for the guide's end-of-run check-in card (shared/ei-guide.js).
  supportLine: "your union steward or member-assistance contact, or your employer's employee assistance program",

  game: system({
    name: "Water Room",
    currency: "PSID",
    ranks: ["Helper", "Maintenance Tech", "Building Engineer", "Chief Engineer", "Water Room Certified"],
    badges: [
      { id: "read-the-relief", name: "Read the Relief", note: "Relief valve opening point read inside the band first time", test: AWARD.stepClean("relief-point") },
      { id: "dry-hands", name: "Dry Hands", note: "No unsafe act anywhere in the water room", test: AWARD.safe },
      { id: "gentle-header", name: "Gentle Header", note: "Brought the header back without breaking the band", test: AWARD.stepClean("reopen-header") },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections across the whole test", test: AWARD.clean },
      { id: "steady-kit", name: "Steady Kit", note: "Held the check reading without breaking it", test: AWARD.unbroken },
      { id: "quick-turn", name: "Water Back Fast", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "relief-port-cap": "You reached to cap the dripping relief port. That drip is the assembly doing its one job — the relief valve dumps water to atmosphere whenever the zone between the checks threatens to flow backwards, and a cap or a hard-piped drain turns the only visible warning into a silent path for building water to reach the street main.",
    "live-starter-door": "You opened the booster pump starter with the disconnect still on. There is line voltage on the contactor behind that door and two motors that can start on a pressure call at any second — the starter is opened under your own lock and tag, or it stays shut.",
    "tp-lever-lift": "You lifted the water heater's temperature-and-pressure relief lever by hand with your face over the discharge. That tank is stored at Legionella-control temperature, well above scald point, and a sticky T&P that finally lets go discharges near-boiling water down the pipe and across whoever is standing at it.",
    "shot-feeder-cap": "You started unscrewing the boiler's chemical shot feeder cap without isolating and bleeding it first. The pot is at system pressure and full of treatment chemical whose sheet warns of eye damage — the cap comes off only after both valves are closed and the bleed has proved it empty.",
  },

  lateNotes: {
    "test-kit": "Not yet — the kit has nothing to read until the hoses are on the test cocks and the relief point is recorded.",
    "mixing-valve": "The mixing valve is set against a heater that has been read first; set it before that and you are mixing down a temperature you have not measured.",
  },

  steps: [
    {
      id: "read-notice", kind: "select", target: "purveyor-notice",
      title: "Read the purveyor's annual test notice",
      cue: "Open the water purveyor's notice and last year's tag before touching the assembly.",
      why: "The purveyor's notice is where the building's legal obligation actually starts: which assembly, which serial number, the date the result is due and the tester qualification they accept. Last year's tag tells you what the relief valve and first check read then, so a reading that has drifted this year means something instead of being a number with nothing to compare it to.",
    },
    {
      id: "post-shutoff", kind: "drag", target: "shutoff-notice",
      title: "Post the water-interruption notice",
      cue: "Carry the shutoff notice to the lobby board slot so residents know the water goes off.",
      why: "Closing the downstream shutoff drops pressure to every apartment above this room, and a resident halfway through a shower, a dialysis patient running a home machine or a restaurant tenant mid-service all deserve to know before it happens. The local housing code treats water as an essential service, and a posted, timed notice is what makes a planned interruption a planned one.",
      drag: { to: "lobby-board-slot", radius: 0.5, missNote: "Not on the board — a notice left on the bench is a notice no resident will ever read before their water stops." },
    },
    {
      id: "walk-cross-connections", kind: "find", noHint: true,
      targets: ["submerged-hose", "bypass-jumper"],
      itemNames: { "submerged-hose": "hose submerged in the chemical mop sink", "bypass-jumper": "jumper hose around the assembly" },
      itemNotes: {
        "submerged-hose": "A hose from the hose bibb is lying under the surface of a mop sink full of floor stripper. With no vacuum breaker on the bibb, a pressure drop anywhere upstream can siphon that sink straight back into the building's cold water.",
        "bypass-jumper": "Somebody ran a garden hose from upstream of shutoff one to downstream of shutoff two, around the whole assembly. While it is connected the RP protects nothing — the building's water has a path to the main that no check valve ever sees.",
      },
      title: "Walk the room for cross-connections",
      cue: "Find what connects building water to something it should never touch.",
      why: "An RP assembly that tests perfectly still protects nothing if the room around it has a way for contaminated water to go around or back through it. AWWA's cross-connection manual is built on the fact that backflow incidents almost always start with a hose, a bypass or a fixture nobody thought of as plumbing, so the walk comes before the test, not after it.",
    },
    {
      id: "close-shutoff-two", kind: "turn", target: "shutoff-two",
      title: "Close shutoff valve number two",
      cue: "Turn the downstream shutoff closed so the assembly is isolated for the test.",
      why: "The field test measures the checks and the relief valve against each other with no flow through the assembly, and shutoff number two is what stops the building drawing water through it while the gauge reads. Left open, every toilet flushed upstairs moves the needle and the relief point you record is a reading of somebody's plumbing, not of the valve.",
      turn: { turns: 0.8, axis: "y", label: "SHUTOFF #2" },
    },
    {
      id: "rig-test-kit", kind: "sequence",
      targets: ["flush-test-cocks", "high-hose-tc2", "low-hose-tc3"],
      itemNames: { "flush-test-cocks": "test cocks flushed", "high-hose-tc2": "high hose on test cock 2", "low-hose-tc3": "low hose on test cock 3" },
      title: "Flush the test cocks and rig the differential kit",
      cue: "Flush the test cocks, then the high-side hose on test cock two and the low-side on three.",
      why: "Grit sitting in a test cock gets blown into the gauge's needle valves the moment a hose goes on, and a fouled kit reads a good assembly as failed or a failed one as good. High side on the zone upstream of the first check and low side in the zone between the checks is what makes the gauge read the first check's differential rather than line pressure.",
      outOfOrderNote: "Flush first, then high on two, then low on three — rigging before flushing drives the grit into the kit, and swapping the hoses reads the differential backwards.",
    },
    {
      id: "relief-point", kind: "gauge", target: "relief-gauge",
      title: "Read the relief valve opening point",
      cue: "Bleed the high side down slowly and commit when the relief valve starts to drip.",
      why: "The relief valve has to open while there is still a real pressure difference across the first check, so that water between the checks is dumped to the floor drain before it can ever flow back toward the main. An opening point below the minimum the assembly's standard sets means the valve would let the zone go backwards before it relieved, and the assembly fails the test however good the checks look.",
      gauge: { label: "RELIEF OPENS AT", speed: 0.55, green: [0.2, 0.4], readout: (t) => `${(t * 12).toFixed(1)} psid`, missNote: "Outside the passing band — either the relief opened too early or you committed before the first drip. Reset the kit and read it again." },
    },
    {
      id: "hold-first-check", kind: "hold", target: "test-kit", seconds: 5,
      title: "Hold the first check reading steady",
      cue: "Keep the kit's valves closed and hold while the first check's differential settles.",
      why: "A first check that is fouled or has a nicked seat will read high for a second and then creep down as water leaks past it, and only a reading held long enough to settle tells a tight check from a leaking one. The tester's qualification exists because a quick glance at a moving needle is how failed assemblies get tagged as passed.",
      holdBreakNote: "You opened the kit before the reading settled. A differential that has not steadied could be a check leaking slowly past its seat — hold it through.",
    },
    {
      id: "reopen-header", kind: "track", target: "header-gauge", seconds: 7,
      title: "Reopen the supply and bring the header back gently",
      cue: "Open shutoff two slowly and keep the header pressure in the band as the risers refill.",
      why: "The risers above this room have drained down during the test, and slamming the shutoff open sends a pressure surge up forty feet of pipe that hammers every fixture and can crack a tired fitting on the top floor. Brought back slowly, the air works out through the fixtures and the booster sees suction it can actually use.",
      track: { start: 0.2, green: [0.4, 0.64], rise: 0.44, fall: 0.36, drift: 0.1, label: "HEADER PRESSURE", readout: (v) => (v < 0.4 ? "risers starving" : v > 0.64 ? "surge" : "refilling") },
      holdBreakNote: "The header left the band. Too fast is water hammer on every riser; too slow and the booster cavitates on empty suction — bring it back inside the band.",
    },
    {
      id: "walk-hot-loop", kind: "find", noHint: true,
      targets: ["hot-return-reading", "dead-leg"],
      itemNames: { "hot-return-reading": "return line reading cold", "dead-leg": "capped dead leg off the riser" },
      itemNotes: {
        "hot-return-reading": "The recirculation return reads barely warm — the loop is not circulating to the far risers, and water sitting lukewarm in them is the temperature band Legionella grows in.",
        "dead-leg": "A branch capped off where an old laundry hookup was removed. Water in it never moves, never gets hot, and seeds the whole loop every time it is disturbed.",
      },
      title: "Walk the hot-water loop against the water management plan",
      cue: "Find where the loop is not doing what the building's Legionella plan says it does.",
      why: "ASHRAE 188 asks a building to know where its water sits still and lukewarm, because that is where Legionella grows, and then to control it. A cold return and a dead leg are exactly the two findings a water management plan is meant to turn up — they are also invisible from the heater, which will keep reading hot while the far risers are not.",
    },
    {
      id: "read-heater", kind: "gauge", target: "heater-thermometer",
      title: "Read the water heater's storage temperature",
      cue: "Watch the thermometer settle and commit inside the plan's storage band.",
      why: "Stored hot enough, water in the tank kills Legionella rather than growing it; stored at a comfortable tap temperature, the tank becomes an incubator. The plan sets the storage band and the mixing valve takes it back down for the residents, so the heater is read on its own, against the plan, before anyone touches the mix.",
      gauge: { label: "STORAGE TEMP", speed: 0.55, green: [0.6, 0.8], readout: (t) => `${Math.round(110 + t * 50)}°F`, missNote: "Outside the plan's storage band — too cool grows bacteria in the tank, too hot wastes energy and stresses the mixing valve. Read it again." },
    },
    {
      id: "set-mixing-valve", kind: "turn", target: "mixing-valve",
      title: "Set the master mixing valve for delivery",
      cue: "Turn the master mixing valve down until delivered water reads at the tap-safe setting.",
      why: "Water stored at control temperature scalds a child's skin in a few seconds, and the master mixing valve is the one device between that tank and every bathtub in the building. Setting it after reading the heater — not by feel, not by habit — is how the building keeps the tank hot enough for the plan and the tap cool enough for the people using it.",
      turn: { turns: 0.6, axis: "z", label: "MIXED DELIVERY" },
    },
    {
      id: "tag-and-report", kind: "sequence",
      targets: ["tag-assembly", "purveyor-report"],
      itemNames: { "tag-assembly": "test tag on the assembly", "purveyor-report": "result on the purveyor's form" },
      title: "Tag the assembly and fill in the purveyor's form",
      cue: "Hang the dated test tag on the assembly, then complete the purveyor's report.",
      why: "The tag tells the next person in the room what was measured, by whom and when; the purveyor's form is what the water system itself relies on to know the building is not a risk to the main. One without the other leaves either the room or the utility guessing, and a result that never reaches the purveyor is, as far as they are concerned, a test that never happened.",
      outOfOrderNote: "Tag the assembly first, then the form — the form records what the tag says, not the other way round.",
    },
    {
      id: "crew-checkin", kind: "select", target: "porter-checkin",
      title: "Check in with the porter before the water room closes",
      cue: "Tell the porter the mop sink hose is off-limits until a vacuum breaker goes on, and ask how the shift is going.",
      why: "The porter is the person most likely to put that hose back in the sink tomorrow morning, and a finding that only lives in the engineer's head is a finding that repeats. Checking in is also the moment to ask how a colleague is actually doing — SEIU building staff work alone in basements and on night shifts, and a question asked in person catches what a work order never will.",
    },
    {
      id: "building-log", kind: "select", target: "building-log",
      title: "Enter the test in the building log",
      cue: "Log the readings, the cross-connections found, the heater and delivery temperatures and the shutoff times.",
      why: "The building log is the continuity between shifts, between engineers and between years: next year's tester compares against these numbers, the water management plan's verification lives here, and if a resident ever falls ill the log is the record of what the building actually did. IUOE stationary engineer training treats the log as part of the job, not paperwork after it.",
    },
  ],

  interrupts: [
    {
      id: "porter-at-bibb",
      kind: "Porter filling a bucket on the isolated header",
      after: "hold-first-check", delay: 3, seconds: 12,
      alert: "While you hold the kit, the porter comes in and opens the hose bibb on the header to fill a mop bucket — right where you are reading the first check.",
      cue: "Close the hose bibb and hang the do-not-operate tag on it. Don't shout across the room with your hands on the kit.",
      target: "hose-bibb-valve",
      why: "Water drawn from the header during the test moves the needle and turns a good first check into a failed reading — or worse, hides a real leak behind a pressure drop you did not cause. The tag on the bibb is what keeps it closed for the rest of the test without anyone having to remember.",
      missNote: "The bibb ran the whole window with the kit still on. The reading you were holding is now a measurement of a mop bucket filling, and the test has to start again from the relief point.",
      wrongNote: "That doesn't stop the draw. The hose bibb on the header is what's pulling water through the assembly — close it and tag it.",
    },
    {
      id: "booster-suction-alarm",
      kind: "Booster low-suction alarm",
      after: "reopen-header", delay: 3, seconds: 12,
      alert: "As the header refills, the booster panel's low-suction beacon starts flashing — the lead pump is trying to run on a header that has not come back yet.",
      cue: "Put the booster's hand-off-auto switch to OFF until suction recovers. Keep your other hand off the shutoff.",
      target: "booster-hoa",
      why: "A centrifugal pump running on starved suction cavitates: vapour bubbles collapse against the impeller and eat it, and the seal runs dry within minutes. The low-suction cutout is there for exactly this, and switching the pump off until the header is back is cheaper than a rebuilt impeller and a building with no water pressure above the fourth floor.",
      missNote: "The lead pump ran on empty suction the whole window. That grinding was cavitation, and the seal the pump just ran dry is the next work order — along with the top floors that lost pressure while it happened.",
      wrongNote: "That won't stop the pump. The hand-off-auto switch on the booster panel is what takes the lead pump off a starved header.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, PMDW_ACCENT);

    // ------------------------------------------------------------ floor
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a7075", base2: "#5f666b", seam: "rgba(220,232,240,0.25)" }), { repeat: 5, px: 384 });
    const floor = box(g, 6.4, 0.02, 5.2, 0, 0.011, -0.3, 0x6a7075, { rough: 0.85 });
    floor.material = texturedMat(floorTex, { rough: 0.82, metal: 0.05, color: 0x6a7075 });
    // Floor drain the relief port discharges to, with its air-gap funnel.
    const drain = group(g, -0.2, 0, -1.25);
    cyl(drain, 0.16, 0.16, 0.02, 0, 0.025, 0, 0x2a2e33, { rough: 0.6, metal: 0.5, seg: 18 });
    for (let i = -2; i <= 2; i++) box(drain, 0.26, 0.006, 0.02, 0, 0.037, i * 0.05, 0x8b929a, { rough: 0.4, metal: 0.7 });
    cyl(drain, 0.1, 0.05, 0.14, 0, 0.3, 0, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 16, open: true });

    // ------------------------------------------------------------ incoming service + RP assembly
    // Service riser up out of the slab, then along the back wall at 1.1 m.
    const pipeColor = 0x3f7fb0;
    pipeRun(g, [[-2.8, 0, -1.9], [-2.8, 1.1, -1.9], [-2.4, 1.1, -1.9]], 0.06, pipeColor, { flanges: [[-2.8, 0.6, -1.9]], flangeAxis: "y", steps: 16 });
    const rp = group(g, -1.1, 1.1, -1.9);
    // Shutoff one (upstream) and two (downstream).
    const sv1 = valveWheel(rp, -1.15, 0, 0.0, { r: 0.1, color: 0x2f6f4a, body: 0x3a3f45 });
    void sv1;
    holoTag(rp, "shutoff #1", -1.15, 0.55, 0.05, { css: PMDW_CSS, w: 0.26 });
    const sv2 = valveWheel(rp, 1.15, 0, 0.0, { r: 0.1, color: 0x2f6f4a, body: 0x3a3f45 });
    reg(hits, sv2.userData.wheel, "shutoff-two");
    holoTag(rp, "shutoff #2", 1.15, 0.55, 0.05, { css: PMDW_CSS, w: 0.26 });
    // The two check bodies and the relief zone between them.
    cyl(rp, 0.1, 0.1, 1.9, 0, 0, 0, 0xb8862b, { rough: 0.35, metal: 0.7, seg: 18 }).rotation.z = Math.PI / 2;
    box(rp, 0.34, 0.28, 0.26, -0.45, 0, 0, 0x9c7424, { rough: 0.35, metal: 0.65 });
    box(rp, 0.34, 0.28, 0.26, 0.45, 0, 0, 0x9c7424, { rough: 0.35, metal: 0.65 });
    const reliefBody = cyl(rp, 0.09, 0.09, 0.3, 0, -0.26, 0, 0x9c7424, { rough: 0.35, metal: 0.65, seg: 14 });
    void reliefBody;
    const reliefPort = cyl(rp, 0.05, 0.05, 0.12, 0.9, -0.48 - 0.0, 0.64, 0x2a2e33, { rough: 0.5, metal: 0.5, seg: 12 });
    reliefPort.position.set(0, -0.46, 0);
    const reliefDrip = particles(rp, 10, 0x9fd4ff, { size: 0.02, life: 0.5, additive: false, opacity: 0.7 });
    holoTag(rp, "RP assembly · relief to drain", 0, 0.42, 0.05, { css: PMDW_CSS, w: 0.5 });
    decal(rp, 0.34, 0.16, 0, 0.2, 0.14, paperFace("RP 3\"", ["SER 0418-B", "LAST TEST ✓"], { bg: "#f2efe6", band: "#2f5a7a" }), { px: 192 });
    // Relief-port cap hazard: a loose cap sitting on the bench beside the port.
    const reliefCap = cyl(rp, 0.055, 0.055, 0.04, 0.22, -0.46, 0.18, 0xd8232a, { rough: 0.5, seg: 12 });
    holoTag(rp, "cap the drip?", 0.3, -0.3, 0.2, { css: PMDW_WARN, w: 0.3 });
    reg(hits, reliefCap, "relief-port-cap");
    // Test cocks: four little ball valves along the top.
    const cocks = [];
    [-0.75, -0.2, 0.2, 0.75].forEach((x, i) => {
      const c = group(rp, x, 0.14, 0.08);
      cyl(c, 0.018, 0.018, 0.08, 0, 0.04, 0, CITY.steel, { rough: 0.3, metal: 0.85, seg: 8 });
      box(c, 0.06, 0.012, 0.012, 0, 0.09, 0, 0xf2c14b, { rough: 0.5 });
      cocks.push(c);
      decal(rp, 0.08, 0.05, x, 0.3, 0.1, signFace(`TC${i + 1}`, { bg: "#1b1e22", accent: PMDW_CSS, scale: 0.55 }), { px: 96 });
    });
    reg(hits, cocks[0], "flush-test-cocks");
    reg(hits, cocks[1], "high-hose-tc2");
    reg(hits, cocks[2], "low-hose-tc3");
    // Downstream run to the booster.
    pipeRun(g, [[0.05, 1.1, -1.9], [0.8, 1.1, -1.9], [0.8, 0.5, -1.7], [1.2, 0.5, -1.4]], 0.055, pipeColor, { steps: 20 });
    // Jumper hose bypassing the whole assembly (find item).
    const jumper = hose(g, [[-2.35, 1.0, -1.82], [-1.8, 0.35, -1.5], [-0.9, 0.2, -1.45], [0.1, 0.4, -1.6], [0.3, 0.95, -1.82]], 0.02, 0x2f8a3c, { steps: 26, rough: 0.7 });
    reg(hits, jumper, "bypass-jumper");

    // ------------------------------------------------------------ test kit on a stand
    const kitStand = group(g, -0.55, 0, -0.75);
    cyl(kitStand, 0.02, 0.02, 0.9, 0, 0.45, 0, 0x53606b, { rough: 0.5, metal: 0.4, seg: 8 });
    cyl(kitStand, 0.22, 0.22, 0.02, 0, 0.01, 0, 0x53606b, { rough: 0.5, metal: 0.4, seg: 14 });
    const kit = instrument(kitStand, 0, 0.94, 0, { idle: "0.0 psid", color: 0xf2c14b, w: 0.18, d: 0.24 });
    reg(hits, kit, "test-kit");
    const reliefGauge = decal(kitStand, 0.22, 0.12, 0, 1.12, 0.02, signFace("RELIEF --", { bg: "#0d1c24", accent: PMDW_CSS, fg: "#bfeaf7", scale: 0.4 }), { glow: true, ei: 0.8, px: 256 });
    reg(hits, reliefGauge, "relief-gauge");
    holoTag(kitStand, "differential test kit", 0, 1.26, 0.02, { css: PMDW_CSS, w: 0.4 });
    hose(g, [[-0.62, 0.95, -0.75], [-0.9, 1.1, -1.3], [-1.3, 1.24, -1.82]], 0.008, 0xd8232a, { steps: 14 });
    hose(g, [[-0.5, 0.95, -0.75], [-0.8, 1.05, -1.3], [-0.9, 1.24, -1.82]], 0.008, 0x2f6fb0, { steps: 14 });

    // ------------------------------------------------------------ booster pump skid
    const booster = group(g, 1.9, 0, -1.2, -0.35);
    box(booster, 1.4, 0.12, 0.8, 0, 0.06, 0, 0x2f3a44, { rough: 0.6, metal: 0.4 });
    for (const sx of [-0.35, 0.35]) {
      cyl(booster, 0.16, 0.16, 0.5, sx, 0.42, 0, 0x2f6fb0, { rough: 0.4, metal: 0.5, seg: 16 });
      cyl(booster, 0.13, 0.13, 0.3, sx, 0.82, 0, 0x5a6a78, { rough: 0.5, metal: 0.5, seg: 14 });
      cyl(booster, 0.05, 0.05, 0.3, sx, 0.3, 0.22, pipeColor, { rough: 0.4, metal: 0.6, seg: 10 }).rotation.x = Math.PI / 2;
    }
    const header = cyl(booster, 0.07, 0.07, 1.3, 0, 1.1, 0.25, pipeColor, { rough: 0.4, metal: 0.6, seg: 14 });
    header.rotation.z = Math.PI / 2;
    const headerGauge = group(booster, 0, 1.28, 0.28);
    cyl(headerGauge, 0.09, 0.09, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.3, metal: 0.4, seg: 20 }).rotation.x = Math.PI / 2;
    const headerNeedle = box(headerGauge, 0.006, 0.07, 0.004, 0, 0.02, 0.018, 0xd8232a, { rough: 0.4 });
    reg(hits, headerGauge, "header-gauge");
    holoTag(booster, "booster header", 0, 1.46, 0.28, { css: PMDW_CSS, w: 0.32 });
    // Control panel with HOA switch and alarm beacon.
    const panel = group(g, 2.75, 0, -0.1, -0.9);
    box(panel, 0.6, 0.8, 0.22, 0, 1.2, 0, 0x5d6771, { rough: 0.5, metal: 0.4 });
    box(panel, 0.08, 0.8, 0.08, 0, 0.4, 0, 0x5d6771, { rough: 0.5, metal: 0.4 });
    const starterDoor = box(panel, 0.26, 0.5, 0.02, -0.14, 1.2, 0.12, 0x4d565f, { rough: 0.45, metal: 0.45 });
    holoTag(panel, "open the starter?", -0.14, 1.55, 0.13, { css: PMDW_WARN, w: 0.34 });
    reg(hits, starterDoor, "live-starter-door");
    const hoa = group(panel, 0.16, 1.22, 0.12);
    cyl(hoa, 0.04, 0.04, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 14 }).rotation.x = Math.PI / 2;
    const hoaLever = box(hoa, 0.014, 0.06, 0.02, 0, 0.012, 0.02, 0xf2c14b, { rough: 0.4 });
    reg(hits, hoa, "booster-hoa");
    decal(panel, 0.16, 0.05, 0.16, 1.3, 0.121, signFace("H · O · A", { bg: "#1b1e22", accent: PMDW_CSS, scale: 0.55 }), { px: 128 });
    const beacon = ball(panel, 0.05, 0.16, 1.66, 0, 0x3a4450, { rough: 0.4, seg: 12 });
    const beaconOn = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.6, rough: 0.3 });
    const beaconIdle = beacon.material;
    const beaconOk = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.0, rough: 0.3 });

    // ------------------------------------------------------------ water heater + mixing valve
    const heater = group(g, 2.2, 0, 1.0);
    cylinderTank(heater, 0, 0, 0xd7dce1, { plateLabel: "WATER HEATER", plateLines: ["100 GAL · GAS", "T&P 150 PSI"], gauge: false });
    heater.scale.set(2.1, 1.45, 2.1);
    const tpLever = box(g, 0.05, 0.12, 0.03, 2.2, 1.3, 1.24, 0xf2c14b, { rough: 0.5 });
    holoTag(g, "lift the T&P lever?", 2.2, 1.5, 1.26, { css: PMDW_WARN, w: 0.36 });
    reg(hits, tpLever, "tp-lever-lift");
    const heaterThermo = decal(g, 0.18, 0.12, 1.94, 1.05, 1.18, signFace("-- °F", { bg: "#0d1c24", accent: PMDW_CSS, fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.8, px: 192 });
    heaterThermo.rotation.y = -0.3;
    reg(hits, heaterThermo, "heater-thermometer");
    pipeRun(g, [[2.2, 1.6, 1.0], [2.2, 1.9, 1.0], [1.4, 1.9, 1.0], [1.4, 1.2, 1.0]], 0.035, 0xb87333, { steps: 18 });
    const mixer = group(g, 1.4, 1.1, 1.05);
    box(mixer, 0.16, 0.16, 0.12, 0, 0, 0, 0xb8862b, { rough: 0.35, metal: 0.7 });
    const mixKnob = group(mixer, 0, 0, 0.08);
    cyl(mixKnob, 0.06, 0.06, 0.03, 0, 0, 0, 0x2f6fb0, { rough: 0.4, seg: 16 }).rotation.x = Math.PI / 2;
    const mixPointer = box(mixKnob, 0.008, 0.04, 0.006, 0, 0.022, 0.018, 0xffffff, { rough: 0.4 });
    reg(hits, mixKnob, "mixing-valve");
    holoTag(mixer, "master mixing valve", 0, 0.2, 0.05, { css: PMDW_CSS, w: 0.36 });
    // Recirculation return with its thermometer (find item) and a dead leg.
    pipeRun(g, [[1.4, 1.9, 1.0], [0.6, 1.9, 1.0], [0.6, 1.9, 0.2]], 0.03, 0xb87333, { steps: 12 });
    const returnThermo = decal(g, 0.14, 0.09, 0.6, 1.72, 0.25, signFace("78°F", { bg: "#0d1c24", accent: "#f2ae14", fg: "#ffe2b0", scale: 0.55 }), { glow: true, ei: 0.8, px: 160 });
    reg(hits, returnThermo, "hot-return-reading");
    holoTag(g, "recirc return", 0.6, 1.84, 0.25, { css: PMDW_CSS, w: 0.26 });
    const deadLeg = group(g, 0.0, 1.9, 1.0);
    cyl(deadLeg, 0.028, 0.028, 0.5, 0, 0, 0, 0xb87333, { rough: 0.4, metal: 0.8, seg: 10 }).rotation.z = Math.PI / 2;
    cyl(deadLeg, 0.036, 0.036, 0.05, -0.27, 0, 0, 0x6b747c, { rough: 0.5, metal: 0.6, seg: 10 }).rotation.z = Math.PI / 2;
    reg(hits, deadLeg, "dead-leg");
    holoTag(deadLeg, "capped branch", -0.1, 0.14, 0.04, { css: PMDW_CSS, w: 0.26 });

    // ------------------------------------------------------------ boiler chemical shot feeder
    const feeder = group(g, -2.4, 0, 0.4);
    cyl(feeder, 0.12, 0.12, 0.6, 0, 0.5, 0, 0x5a6a78, { rough: 0.5, metal: 0.5, seg: 16 });
    const feederCap = cyl(feeder, 0.08, 0.08, 0.06, 0, 0.84, 0, 0x2a2e33, { rough: 0.5, metal: 0.5, seg: 14 });
    reg(hits, feederCap, "shot-feeder-cap");
    holoTag(feeder, "shot feeder · unscrew?", 0, 1.02, 0, { css: PMDW_WARN, w: 0.4 });
    for (let i = 0; i < 3; i++) cyl(feeder, 0.02, 0.02, 0.6, -0.14, 0.3 + i * 0.001, 0, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 6 }).rotation.z = i * 0.5;

    // ------------------------------------------------------------ mop sink + hose bibb
    const sink = group(g, -2.3, 0, -0.75, 0.5);
    box(sink, 0.7, 0.3, 0.6, 0, 0.15, 0, 0xdfe4e8, { rough: 0.4 });
    const sinkWater = box(sink, 0.6, 0.02, 0.5, 0, 0.26, 0, 0x6fa39a, { rough: 0.1, opacity: 0.8, transparent: true });
    void sinkWater;
    cyl(sink, 0.02, 0.02, 0.8, 0, 0.9, -0.28, 0xb87333, { rough: 0.4, metal: 0.8, seg: 8 });
    const bibb = group(sink, 0, 1.22, -0.24);
    box(bibb, 0.07, 0.06, 0.08, 0, 0, 0, 0xb87333, { rough: 0.4, metal: 0.8 });
    const bibbHandle = cyl(bibb, 0.03, 0.03, 0.01, 0, 0.05, 0, 0xd8232a, { rough: 0.5, seg: 10 });
    void bibbHandle;
    reg(hits, bibb, "hose-bibb-valve");
    const bibbTag = lockTag(bibb, 0.05, -0.04, 0.05, { lines: ["DO NOT", "OPEN"] });
    bibbTag.visible = false;
    holoTag(sink, "hose bibb", 0, 1.38, -0.2, { css: PMDW_CSS, w: 0.22 });
    const subHose = hose(sink, [[0, 1.18, -0.2], [0.2, 0.8, 0.0], [0.1, 0.4, 0.15], [-0.05, 0.22, 0.05]], 0.016, 0x2f8a3c, { steps: 16 });
    reg(hits, subHose, "submerged-hose");
    const drum = cyl(sink, 0.12, 0.12, 0.38, 0.55, 0.19, 0.1, 0xf2c14b, { rough: 0.5, seg: 12 });
    decal(drum, 0.14, 0.08, 0, 0.1, 0.122, signFace("STRIPPER", { bg: "#1b1e22", accent: "#f2c14b", scale: 0.45 }), { px: 128 });
    const porterBucket = cyl(sink, 0.13, 0.11, 0.26, -0.5, 0.13, 0.3, 0xf2c14b, { rough: 0.5, seg: 12 });
    const bibbSpray = particles(sink, 14, 0x9fd4ff, { size: 0.02, life: 0.4, additive: false, opacity: 0.7 });

    // ------------------------------------------------------------ notice, board, log
    const notice = decal(g, 0.3, 0.38, 0.6, 0.95, 1.4, paperFace("PURVEYOR", ["ANNUAL TEST DUE", "RP 3\" · SER 0418-B", "Tester: ASSE-qualified", "Return form by the 30th"], { bg: "#f4efe0", band: "#2f5a7a" }), { px: 256 });
    const noticeStand = box(g, 0.5, 0.04, 0.34, 0.6, 0.72, 1.35, 0x8b6d4a, { rough: 0.7 });
    for (const sx of [-1, 1]) box(g, 0.04, 0.72, 0.04, 0.6 + sx * 0.22, 0.36, 1.35, 0x6b5238, { rough: 0.7 });
    void noticeStand;
    notice.rotation.x = -0.35;
    reg(hits, notice, "purveyor-notice");
    const shutoffNotice = decal(g, 0.22, 0.28, 0.45, 0.76, 1.22, paperFace("WATER OFF", ["10:00 – 11:30", "Backflow test", "Sorry for the wait"], { bg: "#fff7d6", band: "#b8402f" }), { px: 192 });
    shutoffNotice.rotation.x = -Math.PI / 2 + 0.2;
    reg(hits, shutoffNotice, "shutoff-notice");
    const lobbyBoard = group(g, -3.05, 0, -0.1, Math.PI / 2);
    box(lobbyBoard, 0.9, 0.7, 0.04, 0, 1.35, 0, 0x8b6d4a, { rough: 0.8 });
    box(lobbyBoard, 0.82, 0.62, 0.01, 0, 1.35, 0.025, 0xc9b28a, { rough: 0.9 });
    for (const sx of [-1, 1]) box(lobbyBoard, 0.05, 1.0, 0.05, sx * 0.4, 0.5, 0, 0x6b5238, { rough: 0.7 });
    const boardSlot = box(lobbyBoard, 0.3, 0.36, 0.02, 0.15, 1.35, 0.04, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["lobby-board-slot"] = boardSlot;
    holoTag(lobbyBoard, "resident notice board", 0, 1.8, 0.03, { css: PMDW_CSS, w: 0.4 });
    const postedNotice = decal(lobbyBoard, 0.22, 0.28, 0.15, 1.35, 0.035, paperFace("WATER OFF", ["10:00 – 11:30", "Backflow test"], { bg: "#fff7d6", band: "#b8402f" }), { px: 192 });
    postedNotice.visible = false;
    decal(lobbyBoard, 0.24, 0.3, -0.2, 1.38, 0.035, paperFace("LAUNDRY", ["Hours 7–10", "No dyeing"], { bg: "#eef4f8", band: "#2f5a7a" }), { px: 160 });

    // Tag + purveyor form on a clipboard on the bench.
    const bench = group(g, -1.4, 0, 0.3);
    box(bench, 1.1, 0.05, 0.5, 0, 0.85, 0, 0x7a6048, { rough: 0.7 });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(bench, 0.05, 0.85, 0.05, sx * 0.5, 0.425, sz * 0.2, 0x53606b, { rough: 0.5, metal: 0.4 });
    const testTag = decal(bench, 0.1, 0.16, -0.3, 0.9, 0.05, paperFace("TEST TAG", ["RP · PASS", "RV --", "CK1 --"], { bg: "#fffbe8", band: "#2f7d4a" }), { px: 128 });
    testTag.rotation.x = -Math.PI / 2;
    reg(hits, testTag, "tag-assembly");
    const hungTag = decal(rp, 0.1, 0.16, 0.6, -0.26, 0.14, paperFace("TESTED", ["RP · PASS", "today"], { bg: "#fffbe8", band: "#2f7d4a" }), { px: 128 });
    hungTag.visible = false;
    const form = decal(bench, 0.22, 0.3, 0.1, 0.9, 0.0, paperFace("PURVEYOR FORM", ["Assembly · serial", "RV open pt ___", "CK1 ___  CK2 ___", "Tester · cert no."], { bg: "#f2efe6", band: "#2f5a7a" }), { px: 192 });
    form.rotation.x = -Math.PI / 2;
    reg(hits, form, "purveyor-report");
    const toolbox = box(bench, 0.4, 0.2, 0.22, 0.35, 0.98, 0, 0xb8402f, { rough: 0.5, metal: 0.3 });
    void toolbox;

    const logBoard = holoPanel(g, 0.6, 0.4, -2.6, 1.55, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,14,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = PMDW_CSS; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#e6f2fb";
      ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("BUILDING LOG · WATER ROOM", w / 2, h * 0.22);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#c4dcec";
      ["RP test · RV / CK1 / CK2", "cross-connections found", "heater · delivered temp", "shutoff off / on times"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.14)));
    }, { ry: 0.5, accent: PMDW_ACCENT });
    reg(hits, logBoard, "building-log");

    // Pipe hangers along the back wall and an insulated riser for depth.
    for (let i = 0; i < 5; i++) box(g, 0.03, 0.5, 0.03, -2.4 + i * 1.2, 1.5, -1.95, 0x53606b, { rough: 0.5, metal: 0.5 });
    cyl(g, 0.1, 0.1, 2.8, 3.0, 1.4, -1.9, 0xe6e2d6, { rough: 0.9, seg: 14 });
    holoTag(g, "hot riser · insulated", 3.0, 2.2, -1.78, { css: PMDW_CSS, w: 0.34 });

    // ------------------------------------------------------------ crew
    // The porter (SEIU building staff), standing clear of the sink and bench,
    // who the check-in is with.
    const porter = standingFigure(g, 1.25, 0.4, { ry: -2.7, cloth: 0x3f5b6e, trousers: 0x2b3138, cap: 0x2f5a7a });
    reg(hits, porter, "porter-checkin");
    // The interruption's porter at the bibb — only visible while it runs.
    const bibbPorter = standingPerson(g, -1.65, -0.35, { ry: 2.2, cloth: 0x3f5b6e, hiVis: false });
    bibbPorter.root.visible = false;

    let bibbRunning = false;
    let alarmOn = false;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.1, -1.0),

      onStepComplete(step) {
        if (step.id === "post-shutoff") { shutoffNotice.visible = false; postedNotice.visible = true; }
        if (step.id === "walk-cross-connections") { subHose.visible = false; jumper.visible = false; }
        if (step.id === "close-shutoff-two") sv2.userData.wheel.rotation.y = 1.2;
        if (step.id === "relief-point") repaint(reliefGauge, signFace("RELIEF OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.4 }));
        if (step.id === "hold-first-check") repaint(kit.userData.screen, signFace("CK1 OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 }));
        if (step.id === "reopen-header") { sv2.userData.wheel.rotation.y = 0; headerNeedle.rotation.z = -0.6; }
        if (step.id === "walk-hot-loop") repaint(returnThermo, signFace("FLAGGED", { bg: "#1c140d", accent: "#f2ae14", fg: "#ffe2b0", scale: 0.45 }));
        if (step.id === "read-heater") repaint(heaterThermo, signFace("OK", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.5 }));
        if (step.id === "set-mixing-valve") mixPointer.rotation.z = -0.9;
        if (step.id === "tag-and-report") { testTag.visible = false; hungTag.visible = true; }
      },

      onInterrupt(it) {
        if (it.id === "porter-at-bibb") { bibbPorter.root.visible = true; porterBucket.position.set(0, 0.13, -0.1); bibbRunning = true; bibbSpray.visible = true; }
        if (it.id === "booster-suction-alarm") { beacon.material = beaconOn; alarmOn = true; }
      },
      onInterruptEnd(it) {
        if (it.id === "porter-at-bibb") {
          bibbRunning = false; bibbSpray.visible = false;
          if (it.resolved === "answered") { bibbTag.visible = true; bibbPorter.root.visible = false; porterBucket.position.set(-0.5, 0.13, 0.3); }
        }
        if (it.id === "booster-suction-alarm") {
          alarmOn = false;
          beacon.material = it.resolved === "answered" ? beaconOk : beaconIdle;
          if (it.resolved === "answered") hoaLever.rotation.z = 0.8;
        }
      },

      animate(t, dt, session) {
        reliefDrip.visible = true;
        reliefDrip.userData?.step?.(dt, new THREE.Vector3(0, -0.52, 0), 0.03, 0.05, -2.5);
        if (bibbRunning) bibbSpray.userData?.step?.(dt, new THREE.Vector3(0, 1.1, -0.2), 0.04, 0.2, -3);
        if (alarmOn && beacon.material) beacon.visible = Math.sin(t * 10) > -0.3;
        else beacon.visible = true;
        porter.userData.head.rotation.y = Math.sin(t * 0.4) * 0.3;
        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "relief-point") repaint(reliefGauge, signFace(`RELIEF ${(gg.t * 12).toFixed(1)}`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.4 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.36 }));
          if (session.step?.id === "read-heater") repaint(heaterThermo, signFace(`${Math.round(110 + gg.t * 50)}°F`, { bg: "#0d1c24", accent: gg.t >= 0.6 && gg.t <= 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.5 }));
        }
        if (session?.track && session.step?.id === "reopen-header") headerNeedle.rotation.z = 0.9 - session.track.v * 1.8;
      },
    };
  },
};
