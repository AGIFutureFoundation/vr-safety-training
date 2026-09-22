import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, cone, instrument, standingFigure, valveWheel, pipeRun, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Backflow Test VR — Water & Environmental, station five.
// The annual test of a reduced-pressure principle assembly on a building's
// service: the hazard the assembly protects against, the customer told
// before the water goes off, the gauge zeroed and the hoses bled, the two
// check valves and the relief opening point each tested in the order the
// procedure sets, the assembly restored slowly so nobody gets a water
// hammer, and a report signed and filed with the purveyor.

const BT_ACCENT = 0x4fb8c9;

export const SIM_BACKFLOW_TEST = {
  id: "backflow-test",
  index: "50",
  domain: "Water & Environmental",
  trade: "Certified backflow prevention assembly tester",
  category: "Water & Environmental",
  indoor: "service",
  certification: "UA plumbers and pipefitters; ANSI/ASSE 5110 Backflow Prevention Assembly Tester certification testing ANSI/ASSE 1013 reduced-pressure principle assemblies built to NSF/ANSI/CAN 61; AWWA M14 cross-connection control guidance and the purveyor's programme; EPA Safe Drinking Water Act obligations on the purveyor",
  name: "Backflow Test",
  title: simTitle("Backflow Test"),
  tagline: "Annual RP assembly test: hazard identified, customer notified before the water goes off, gauge zeroed and hoses bled, check one, check two and the relief opening point each tested in order, assembly restored slowly, report signed and filed",
  accent: BT_ACCENT,
  accentCss: "#4fb8c9",
  parSeconds: 250,
  footprint: 2.2,
  badge: { id: "no-cross-connection", name: "No Cross Connection", note: "A test run in order on a bled gauge, with the customer told first and the assembly restored without a hammer — first time" },

  game: system({
    name: "Cross-Connection Control",
    currency: "PSID",
    ranks: ["Apprentice", "Journeyman", "Certified Tester", "Programme Inspector", "Cross-Connection Certified"],
    badges: [
      { id: "told-them-first", name: "Told Them First", note: "Hazard identified and the customer notified before a valve moved, first time", test: AWARD.stepClean("notify") },
      { id: "never-open", name: "Never Left Open", note: "Never a bypass around the assembly, never a test on an unbled gauge, never restored fast", test: AWARD.safe },
      { id: "to-the-tenth", name: "To the Tenth", note: "Both check readings inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-test", name: "Clean Test", note: "No corrections anywhere in the test", test: AWARD.clean },
      { id: "steady-bleed", name: "Steady Bleed", note: "The hoses bled clean without a break", test: AWARD.unbroken },
      { id: "tested-fast", name: "Tested In Time", note: "Report signed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bypass-the-assembly": "You opened the bypass around the assembly to keep the building in water. For as long as that bypass is open the building's plumbing is connected straight to the public main with nothing between them — which is the exact cross connection the assembly exists to prevent.",
    "no-notice": "You shut the water off with no notice to the customer. A building loses its fire sprinklers, its dialysis chairs or its production line the moment that valve closes, and the first anyone knows is when something fails.",
    "unbled-gauge": "You tested on a gauge with air in the hoses. Air compresses and water does not, so every reading is low by an unknown amount, and an assembly that actually failed gets a passing report with your certification number on it.",
    "fast-restore": "You threw the shutoff open to restore the service. A sudden restore slams a water hammer through the building's pipework, which breaks joints, fixtures and sometimes the assembly you just certified.",
  },

  lateNotes: {
    "check-one-test": "The checks are tested after the gauge is zeroed and the hoses are bled — a reading from an unbled gauge is not a reading.",
    "relief-test": "The relief opening point is taken last, after both checks.",
    "restore-valve": "The service is restored after the test is complete and the test cocks are closed.",
  },

  // Two things that happen to a tester whose hands are on the hoses or the
  // shutoff and whose eyes are on a gauge. See shared/game.js.
  interrupts: [
    {
      id: "relief-weeps-again",
      kind: "Relief weeping mid-bleed",
      // Armed on entering the bleed hold, so the window lands on the hoses
      // — answered by the relief port itself, not the bleed valve that
      // step's own control is.
      after: "gauge", delay: 2, seconds: 10,
      alert: "The relief port has started weeping again while you're bleeding the hoses — something upstream just moved.",
      cue: "Flag the relief before you commit a reading on it.",
      target: "relief-weep-recur",
      why: "A relief that starts weeping again after a clean inspection means conditions changed between looking at the assembly and testing it — a pressure fluctuation, a check that was marginal and just gave a little more. ANSI/ASSE 1013 testing assumes the assembly you inspected is the one you are about to read, and a new weep means that assumption just stopped being true.",
      missNote: "The relief kept weeping while you finished the bleed. Whatever reading comes next is being taken on an assembly that has already changed since the inspection, and the certificate will not say so.",
      wrongNote: "It is the relief port. A fresh weep changes what the readings mean before you take a single one.",
    },
    {
      id: "fire-alarm-call",
      kind: "Fire pump low-pressure alarm",
      // Armed after the cocks are closed, so the window overlaps the slow
      // restore — answered by the phone, not the restore valve itself.
      after: "close-cocks", delay: 3, seconds: 12,
      alert: "The building's fire pump controller just alarmed on low pressure while you're bringing the service back.",
      cue: "Call the customer back before you keep opening the shutoff.",
      target: "notify-customer",
      why: "A fire pump alarming during the restore is the building telling you the outage reached further than expected — the customer needs that call now, while the service is still coming back slowly, not after it is fully open and the alarm has already been sitting unanswered.",
      missNote: "The alarm kept sounding while you finished the restore unannounced. The customer is now finding out about a fire-protection outage from the alarm panel instead of from the tester who caused it.",
      wrongNote: "It is the phone. A fire pump alarm outranks how fast this valve opens.",
    },
  ],

  steps: [
    {
      id: "hazard", kind: "select", target: "hazard-survey",
      title: "Identify what the assembly protects against",
      cue: "Read the cross-connection survey: what is downstream and how bad it would be in the main.",
      why: "The degree of hazard decides which assembly is required, and it is why a reduced-pressure assembly protects this connection rather than a simpler check valve. AWWA's cross-connection control guidance and the purveyor's own programme both treat a health hazard downstream — anything that could contaminate the public main — as requiring the highest level of protection available, which is exactly why this annual test is not optional paperwork.",
    },
    {
      id: "notify", kind: "sequence",
      targets: ["notify-customer", "notify-fire"],
      itemNames: { "notify-customer": "customer notified", "notify-fire": "fire protection checked" },
      title: "Tell the customer before anything closes",
      cue: "Notify the building contact of the outage, and confirm whether the line feeds fire protection.",
      why: "The test takes the building's water off, and EPA's Safe Drinking Water Act framework puts the burden of keeping that shutdown safe on the purveyor and its certified testers together, not on the building finding out the hard way. A building that does not know is a building with no sprinklers, no process water and no warning, and a line that feeds fire protection needs the fire service told as well.",
      outOfOrderNote: "Customer first, then the fire-protection question — the second is a consequence of the first.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["relief-dripping", "test-cock-seized"],
      itemNames: { "relief-dripping": "relief valve weeping", "test-cock-seized": "seized number two test cock" },
      itemNotes: {
        "relief-dripping": "The relief port is weeping continuously, which usually means the first check is fouled and the assembly may already be failing.",
        "test-cock-seized": "The number two test cock will not turn — it has to be freed before it can be used, and forcing it snaps the stem.",
      },
      title: "Inspect the assembly",
      cue: "Look over the assembly before you touch it and click what is wrong.",
      why: "A relief port that is weeping continuously is the assembly reporting its own failure before anyone touches a valve — usually because the first check is already fouled and holding back less than it should. Finding it during inspection means the repair gets planned with the water still on, instead of discovered halfway through the test with the building already shut down.",
    },
    {
      id: "gauge", kind: "hold", target: "bleed-hoses", seconds: 5,
      title: "Zero the gauge and bleed the hoses",
      cue: "Hold the bleed open until the hoses run clear of air, and check the gauge reads zero.",
      why: "Air in a hose compresses under pressure and water does not, so any air left in the lines makes every differential reading on this test come back low by an amount nobody can predict. ANSI/ASSE 5110 tester certification exists partly because a bled gauge is the difference between an actual test and a guess, and the guess is the one that ends up on a certificate carrying your number.",
      holdBreakNote: "You closed the bleed with air still in the line — start the bleed again, or every reading after this is wrong.",
    },
    {
      id: "isolate", kind: "turn", target: "downstream-valve",
      title: "Close the downstream shutoff",
      cue: "Close the number two shutoff to isolate the assembly from the building.",
      why: "The test has to measure the assembly by itself, not the assembly plus whatever the building happens to be drawing downstream of it. Demand pulling on the line while a check is being tested drags the reading around and can hide a check that is actually failing behind ordinary building usage.",
      turn: { turns: 1, axis: "y", label: "No. 2 SHUTOFF" },
    },
    {
      id: "check-one", kind: "gauge", target: "check-one-test",
      title: "Test check valve number one",
      cue: "Take the differential across the first check and commit — it must hold at least the required pressure drop.",
      why: "The first check is the assembly's primary barrier, and ANSI/ASSE 1013 sets the minimum differential it has to hold above the relief opening point. Fall short of that margin and the relief ends up doing the first check's job every time building pressure moves — a condition the relief was never sized to run on continuously.",
      gauge: { label: "CHECK 1 ΔP", speed: 0.7, green: [0.5, 0.68], readout: (t) => `${(t * 15).toFixed(1)} psid`, missNote: "Below the minimum — the first check has failed and the assembly cannot be certified." },
    },
    {
      id: "check-two", kind: "gauge", target: "check-two-test",
      title: "Test check valve number two",
      cue: "Take the second check's differential and commit — it must hold tight against reverse flow.",
      why: "The second check is the backup that holds while the relief is dumping to atmosphere, and it is tested separately from the first for a specific reason: an assembly can pass comfortably on one check while sitting one failure away from the exact cross connection the whole assembly exists to prevent.",
      gauge: { label: "CHECK 2 ΔP", speed: 0.75, green: [0.46, 0.64], readout: (t) => `${(t * 15).toFixed(1)} psid`, missNote: "Not holding — the second check has failed and the assembly needs repair before it goes back in service." },
    },
    {
      id: "relief", kind: "gauge", target: "relief-test",
      title: "Test the relief valve opening point",
      cue: "Bleed the differential down and commit at the pressure where the relief first discharges.",
      why: "The relief opening point is the last line of defence — it dumps the zone between the checks to atmosphere before backflow can reach the public main — and ANSI/ASSE 1013 requires it to open above a set differential but still below the first check's holding pressure. Outside that window the assembly has no safe margin left, whichever way the two checks eventually fail.",
      gauge: { label: "RELIEF OPENS AT", speed: 0.7, green: [0.34, 0.5], readout: (t) => `${(t * 12).toFixed(1)} psid`, missNote: "Opening point out of range — the relief is either late or hair-triggered, and either fails the assembly." },
    },
    {
      id: "close-cocks", kind: "sequence",
      targets: ["cock-four", "cock-three", "cock-two", "cock-one"],
      itemNames: { "cock-four": "number four test cock", "cock-three": "number three", "cock-two": "number two", "cock-one": "number one" },
      title: "Close the test cocks in order",
      cue: "Close four, three, two, then one, and disconnect the hoses.",
      why: "Closing the test cocks in reverse of the order they were opened keeps the kit from trapping pressure between the assembly and the hoses, and keeps the zone under test from being back-fed through the test equipment as it comes off — the same logic that put the readings themselves in a fixed order going in.",
      outOfOrderNote: "Four, three, two, one — the cocks close in the reverse of the order they were opened.",
    },
    {
      id: "restore", kind: "track", target: "restore-valve", seconds: 6,
      title: "Restore the service slowly",
      cue: "Crack the downstream shutoff and bring it open slowly while the building refills.",
      why: "A slow restore lets the building's pipework fill gradually instead of taking the full force of a pressure wave all at once. Thrown open, the surge is a water hammer that travels through every branch of the system, breaking joints and fixture supplies and sometimes damaging the very assembly that was just certified to protect the line.",
      track: { start: 0.1, green: [0.28, 0.48], rise: 0.6, fall: 0.5, drift: 0.12, label: "OPENING RATE", readout: (v) => (v < 0.28 ? "not filling" : v > 0.48 ? "water hammer" : "slow and steady") },
      holdBreakNote: "Too fast — that is a hammer through the whole building. Back it off and bring it open slowly.",
    },
    {
      id: "report", kind: "sequence",
      targets: ["record-readings", "sign-report", "file-purveyor"],
      itemNames: { "record-readings": "readings recorded", "sign-report": "report signed with the certification number", "file-purveyor": "copy filed with the water purveyor" },
      title: "Record, sign and file the report",
      cue: "Write the readings, sign with your certification number, and file the copy with the purveyor.",
      why: "AWWA's cross-connection control guidance and the purveyor's own programme both treat an assembly with no filed test as equivalent to a failed one, because there is no record proving otherwise. The tester's certification number on the signed report is what makes that specific reading accountable to a specific person, not just a number written down somewhere and forgotten.",
      outOfOrderNote: "Record, then sign, then file — you sign the readings you took, and the filed copy is the signed one.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, BT_ACCENT);
    box(g, 5.2, 0.1, 4.4, 0, 0.05, 0, 0x4d5157, { rough: 0.9 });
    // A mechanical-room wall with the service coming through it.
    box(g, 5.2, 2.6, 0.12, 0, 1.4, -2.0, 0xb4bcc2, { rough: 0.9 });
    box(g, 5.2, 0.14, 0.3, 0, 2.75, -2.0, 0x99a2a8, { rough: 0.8 });
    // The RP assembly on a raised stand, in the line.
    const asm = group(g, -0.2, 0.1, -1.4);
    for (const dx of [-1.1, 1.1]) cyl(asm, 0.07, 0.09, 1.0, dx, 0.5, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 12 });
    box(asm, 2.6, 0.08, 0.3, 0, 1.0, 0, 0x59636d, { rough: 0.6, metal: 0.5 });
    pipeRun(asm, [[-1.8, 1.2, 0], [-0.9, 1.2, 0], [0.9, 1.2, 0], [1.8, 1.2, 0]], 0.08, 0x9aa3ab, { flanges: [[-0.9, 1.2, 0], [0.9, 1.2, 0]] });
    // Two check bodies and the relief in between.
    const body1 = cyl(asm, 0.13, 0.13, 0.38, -0.45, 1.2, 0, 0xc9a94f, { rough: 0.5, metal: 0.6, seg: 18 });
    body1.rotation.z = Math.PI / 2;
    const body2 = cyl(asm, 0.13, 0.13, 0.38, 0.45, 1.2, 0, 0xc9a94f, { rough: 0.5, metal: 0.6, seg: 18 });
    body2.rotation.z = Math.PI / 2;
    const reliefBody = cyl(asm, 0.11, 0.11, 0.26, 0, 1.03, 0, 0xc9a94f, { rough: 0.5, metal: 0.6, seg: 16 });
    const reliefPort = cyl(asm, 0.06, 0.08, 0.14, 0, 0.84, 0, 0x8a939b, { rough: 0.6, metal: 0.5, seg: 14, open: true });
    holoTag(asm, "RP assembly — ASSE 1013", 0, 1.62, 0.2, { css: "#4fb8c9", w: 0.5 });
    const drip = cyl(asm, 0.012, 0.012, 0.6, 0, 0.5, 0, 0x6fb4d8, { rough: 0.2, opacity: 0.7, transparent: true, seg: 8 });
    reg(hits, drip, "relief-dripping");
    // A second, independent weep for the mid-bleed interrupt: the inspection
    // hazard above is already resolved by then, so this is its own bead,
    // hidden until the interrupt fires rather than a re-registration of it.
    const weepAgain = cyl(asm, 0.012, 0.012, 0.55, 0, 0.5, 0, 0x6fb4d8, { rough: 0.2, opacity: 0.7, transparent: true, seg: 8 });
    weepAgain.visible = false;
    reg(hits, weepAgain, "relief-weep-recur");
    const pan = box(asm, 0.7, 0.06, 0.5, 0, 0.12, 0, 0x53606b, { rough: 0.7, metal: 0.4 });
    void reliefBody; void reliefPort; void pan;
    // Four test cocks along the body.
    const cocks = {};
    for (const [id, dx, label] of [["cock-one", -0.78, "1"], ["cock-two", -0.14, "2"], ["cock-three", 0.22, "3"], ["cock-four", 0.78, "4"]]) {
      const c = group(asm, dx, 1.34, 0.08);
      cyl(c, 0.022, 0.022, 0.1, 0, 0.05, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
      const lever = box(c, 0.09, 0.016, 0.02, 0.03, 0.11, 0, 0xd2312b, { rough: 0.5, metal: 0.4 });
      holoTag(c, `test cock ${label}`, 0, 0.26, 0, { css: "#4fb8c9", w: 0.24 });
      reg(hits, c, id);
      cocks[id] = lever;
    }
    const seized = box(asm, 0.1, 0.06, 0.06, -0.14, 1.45, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, seized, "test-cock-seized");
    // Shutoffs either side, and the bypass.
    const upstream = valveWheel(asm, -1.55, 1.2, 0, { color: 0x4fb8c9, body: 0x2b2f34, r: 0.11 });
    holoTag(asm, "No. 1 shutoff", -1.55, 1.52, 0, { css: "#4fb8c9", w: 0.28 });
    const downstream = valveWheel(asm, 1.55, 1.2, 0, { color: 0x4fb8c9, body: 0x2b2f34, r: 0.11 });
    holoTag(asm, "No. 2 shutoff", 1.55, 1.52, 0, { css: "#4fb8c9", w: 0.28 });
    reg(hits, downstream, "downstream-valve");
    const restoreHit = box(asm, 0.3, 0.3, 0.3, 1.55, 0.92, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    holoTag(asm, "restore the service", 1.55, 0.68, 0, { css: "#4fb8c9", w: 0.4 });
    reg(hits, restoreHit, "restore-valve");
    const throwOpen = box(asm, 0.3, 0.3, 0.3, 1.9, 1.2, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(asm, "throw it open?", 1.9, 1.48, 0.3, { css: "#d2312b", w: 0.3 });
    reg(hits, throwOpen, "fast-restore");
    void upstream;
    const bypass = group(g, -0.2, 0.1, -0.85);
    pipeRun(bypass, [[-1.6, 0.6, 0], [-1.6, 0.6, 0.5], [1.6, 0.6, 0.5], [1.6, 0.6, 0]], 0.06, 0x9aa3ab, {});
    const bypassValve = valveWheel(bypass, 0, 0.6, 0.5, { color: 0xd2312b, body: 0x2b2f34, r: 0.09 });
    holoTag(bypass, "bypass — open it to keep water on?", 0, 0.92, 0.5, { css: "#d2312b", w: 0.62 });
    reg(hits, bypassValve, "bypass-the-assembly");
    // The test kit: three-valve gauge, hoses, bleed.
    const kit = group(g, 1.6, 0.1, 0.2, -0.5);
    box(kit, 0.5, 0.35, 0.25, 0, 0.95, 0, 0x2b2f34, { rough: 0.6 });
    const dial = cyl(kit, 0.14, 0.14, 0.05, 0, 1.12, 0.14, 0xdfe6ec, { rough: 0.3, seg: 24 });
    dial.rotation.x = Math.PI / 2;
    const gaugeRead = instrument(kit, 0, 1.12, 0.18, { idle: "-.- psid", color: 0x4fb8c9, w: 0.14, d: 0.2 });
    for (const [dx, col] of [[-0.16, 0xd2312b], [0, 0xf2c14b], [0.16, 0x2b6fd8]]) cyl(kit, 0.02, 0.02, 0.09, dx, 0.8, 0.1, col, { rough: 0.5, seg: 10 });
    hose(g, [[1.5, 0.9, 0.0], [0.9, 1.1, -0.5], [0.2, 1.3, -1.0], [-0.34, 1.42, -1.32]], 0.016, 0xd2312b, { steps: 16 });
    hose(g, [[1.6, 0.85, 0.05], [1.0, 1.0, -0.4], [0.3, 1.25, -0.9], [-0.06, 1.42, -1.32]], 0.016, 0x2b6fd8, { steps: 16 });
    holoTag(kit, "differential gauge kit", 0, 1.38, 0, { css: "#4fb8c9", w: 0.46 });
    const bleed = box(kit, 0.08, 0.05, 0.05, 0.22, 0.86, 0.12, 0x8a939b, { rough: 0.5, metal: 0.6 });
    holoTag(kit, "bleed the hoses", 0.22, 0.66, 0.16, { css: "#4fb8c9", w: 0.34 });
    reg(hits, bleed, "bleed-hoses");
    const unbled = box(kit, 0.3, 0.3, 0.3, -0.35, 1.05, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(kit, "test it as it is?", -0.35, 1.32, 0.1, { css: "#d2312b", w: 0.34 });
    reg(hits, unbled, "unbled-gauge");
    const c1 = instrument(kit, -0.28, 0.95, 0, { idle: "-- psid", color: 0x4fb8c9, w: 0.12, d: 0.18, ry: 0.5 });
    holoTag(kit, "check 1", -0.28, 1.14, 0, { css: "#4fb8c9", w: 0.18 });
    reg(hits, c1, "check-one-test");
    const c2 = instrument(kit, -0.28, 0.7, 0, { idle: "-- psid", color: 0x4fb8c9, w: 0.12, d: 0.18, ry: 0.5 });
    holoTag(kit, "check 2", -0.28, 0.52, 0, { css: "#4fb8c9", w: 0.18 });
    reg(hits, c2, "check-two-test");
    const rv = instrument(kit, 0.3, 1.12, -0.05, { idle: "-- psid", color: 0x4fb8c9, w: 0.12, d: 0.18, ry: -0.5 });
    holoTag(kit, "relief opening", 0.3, 1.32, -0.05, { css: "#4fb8c9", w: 0.3 });
    reg(hits, rv, "relief-test");
    // Desk: survey, phone, report, purveyor tray.
    const desk = group(g, -2.0, 0.1, 0.9, 0.5);
    box(desk, 1.4, 0.78, 0.6, 0, 0.39, 0, 0x53606b, { rough: 0.7, metal: 0.3 });
    const survey = decal(desk, 0.34, 0.42, -0.42, 0.795, 0, paperFace("CROSS-CONNECTION SURVEY", ["Facility: plating shop", "Downstream: acid rinse tanks", "Degree of hazard: HEALTH", "Assembly required: RP (ASSE 1013)", "Last test: 11 months ago"], { scale: 0.82 }));
    survey.rotation.x = -Math.PI / 2;
    holoTag(desk, "hazard survey", -0.42, 1.0, 0, { css: "#4fb8c9", w: 0.3 });
    reg(hits, survey, "hazard-survey");
    const phone = box(desk, 0.08, 0.15, 0.04, 0.0, 0.86, -0.15, 0x1b1e23, { rough: 0.6 });
    holoTag(desk, "call the customer", 0.0, 1.05, -0.15, { css: "#4fb8c9", w: 0.36 });
    reg(hits, phone, "notify-customer");
    const fireTag = box(desk, 0.12, 0.02, 0.1, 0.24, 0.8, -0.15, 0xd2312b, { rough: 0.7 });
    holoTag(desk, "fire protection?", 0.24, 0.98, -0.15, { css: "#4fb8c9", w: 0.32 });
    reg(hits, fireTag, "notify-fire");
    const noNotice = box(desk, 0.3, 0.3, 0.3, -0.7, 1.0, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(desk, "just shut it off?", -0.7, 1.26, -0.2, { css: "#d2312b", w: 0.34 });
    reg(hits, noNotice, "no-notice");
    const report = decal(desk, 0.32, 0.4, 0.42, 0.795, 0.05, paperFace("TEST REPORT", ["Assembly / serial", "Check 1 ___ psid", "Check 2 ___ psid", "Relief opens ___ psid", "Tester cert. no. ______"], { scale: 0.85 }));
    report.rotation.x = -Math.PI / 2;
    holoTag(desk, "record the readings", 0.42, 1.0, 0.1, { css: "#4fb8c9", w: 0.4 });
    reg(hits, report, "record-readings");
    const pen = box(desk, 0.11, 0.012, 0.012, 0.42, 0.81, 0.25, 0x2b6fd8, { rough: 0.5 });
    holoTag(desk, "sign it", 0.42, 0.62, 0.3, { css: "#4fb8c9", w: 0.16 });
    reg(hits, pen, "sign-report");
    const tray = box(desk, 0.3, 0.06, 0.22, 0.62, 0.82, -0.18, 0x2f7d4a, { rough: 0.7 });
    holoTag(desk, "file with the purveyor", 0.62, 1.0, -0.22, { css: "#4fb8c9", w: 0.44 });
    reg(hits, tray, "file-purveyor");
    // Plan board and the tester.
    const board = group(g, 1.4, 0, 1.8, -0.4);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#08202a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#4fb8c9"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d3f0f6"; ctx.fillText("ANNUAL TEST — RP ASSEMBLY", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eaf9fc";
      ["Notify the customer BEFORE the water goes off", "Never bypass the assembly to keep water on", "Bleed the hoses; a gauge with air reads low", "Check 1: hold ≥ 5.0 psid above relief", "Check 2: must hold tight against reverse flow", "Relief: opens ≥ 2.0 psid, below check 1", "Close cocks 4-3-2-1; restore slowly, no hammer"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.1)));
    }, { accent: BT_ACCENT });
    reg(hits, board, "plan-board");
    const tester = standingFigure(g, -1.1, 0.2, { ry: 2.6, cloth: 0x2b7a88 });
    holoTag(tester, "certified tester", 0, 1.9, 0, { css: "#4fb8c9", w: 0.32 });
    for (const [x, z] of [[2.2, -1.6], [-2.4, -1.6]]) cone(g, x, z);

    let bled = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.2, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "inspect") { drip.visible = false; seized.visible = false; }
        if (step.id === "gauge") { bled = true; repaint(gaugeRead.userData.screen, signFace("0.0 psid", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.6 })); }
        if (step.id === "close-cocks") for (const lever of Object.values(cocks)) lever.rotation.y = 1.4;
      },
      onHazard() {},
      // The relief really weeps again, and the phone really lights up —
      // both revert once answered. See shared/game.js.
      onInterrupt(it) {
        if (it.id === "relief-weeps-again") weepAgain.visible = true;
        if (it.id === "fire-alarm-call") phone.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.4, rough: 0.4 });
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "relief-weeps-again") weepAgain.visible = false;
        if (it.id === "fire-alarm-call") phone.material = mat(0x1b1e23, { rough: 0.6 });
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (!bled) drip.position.y = 0.5 - ((t * 0.6) % 0.4);
        if (step?.id === "close-cocks") for (const [id, lever] of Object.entries(cocks)) if (session.sequence.includes(id)) lever.rotation.y = 1.4;
        const gg = session?.gauge;
        const paint = (node, text, ok) => repaint(node.userData.screen, signFace(text, { bg: "#08202a", accent: ok ? "#59c97b" : "#f2ae14", fg: "#eaf9fc", scale: 0.58 }));
        if (gg && !gg.committed && step?.id === "check-one") paint(c1, `${(gg.t * 15).toFixed(1)}`, gg.t >= 0.5 && gg.t <= 0.68);
        if (gg && !gg.committed && step?.id === "check-two") paint(c2, `${(gg.t * 15).toFixed(1)}`, gg.t >= 0.46 && gg.t <= 0.64);
        if (gg && !gg.committed && step?.id === "relief") paint(rv, `${(gg.t * 12).toFixed(1)}`, gg.t >= 0.34 && gg.t <= 0.5);
        if (session?.turn && step?.id === "isolate") downstream.rotation.y = -session.turn.amount * Math.PI * 2;
        if (step?.id === "restore" && session.holding) downstream.rotation.y += dt * 1.2;
        void body1; void body2; void dial;
      },
    };
  },
};
