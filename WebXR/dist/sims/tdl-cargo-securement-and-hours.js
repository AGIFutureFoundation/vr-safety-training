import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, slab, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import { semiTractor, boxTruck, flWheel } from "../../../shared/fleet.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, cone, instrument,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cargo Securement and Hours VR — Mobility & Transit, the last of
// five Commercial Class A stations in the Job Readiness Edition's TDL
// pre-apprenticeship block. A flatbed with two crated machines and a driver's
// day around them: the bill of lading read for weight and length, the
// working load limit added up against half the cargo weight, the straps
// inspected, the tie-downs thrown and winched, edge protection where a strap
// crosses a corner, the first miles, the re-check, the shoulder, the
// electronic log read for what it is about to force, a trip planned to the
// last legal stop, and the day closed out in the inspection report and the
// certified log.
//
// The tractor and trailer are drawn shorter than real ones so they fit the
// station. Sited generically: no real carrier or shipper, no clause number
// the registry is not sure of — the rules are cited by their part.

const CSH_ACCENT = 0x5ec2d6;
const CSH_CAB = 0x2f7f5f;
const CSH_CRATE = 0xb8925e;

export const SIM_TDL_CARGO_SECUREMENT_AND_HOURS = {
  id: "tdl-cargo-securement-and-hours",
  index: "226",
  domain: "Commercial Driving",
  trade: "Class A driver trainee, TDL pre-apprenticeship — Teamsters freight driving: cargo securement and hours of service under the entry-level driver training rule (FMCSA 49 CFR 380 Subpart F)",
  category: "Mobility & Transit",
  district: "Mobility & Transit",
  weather: "clear",
  certification: "FMCSA 49 CFR 393 Subpart I protection against shifting and falling cargo — working load limits, the minimum number of tie-downs by article length and weight, tie-down condition and edge protection; 49 CFR 395 hours of service and the electronic logging device; 49 CFR 396 inspection and the driver vehicle inspection report; 49 CFR 380 Subpart F entry-level driver training, whose Class A theory curriculum covers cargo securement and hours of service; the CVSA North American Standard Out-of-Service Criteria for cargo securement and hours a roadside inspector applies; Teamsters (IBT) freight locals' driver training",
  name: "Cargo Securement and Hours",
  title: simTitle("Cargo Securement and Hours"),
  tagline: "A flatbed with two crated machines: the bill of lading, working load limits against half the weight, straps inspected, tie-downs thrown and winched, edge protection, the first miles and the re-check, the shoulder, the log read for what it will force, a legal trip plan and a certified day",
  accent: CSH_ACCENT,
  accentCss: "#5ec2d6",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "legal-load-legal-day", name: "Legal Load, Legal Day", note: "Tie-downs enough by count and by limit, the slack strap caught, the shoulder protected and the day planned inside the hours — first time" },

  game: system({
    name: "Securement and Hours",
    currency: "WLL",
    ranks: ["Permit Holder", "Driver Trainee", "Flatbed Driver", "Lead Driver", "Securement Certified"],
    badges: [
      { id: "strap-reader", name: "Strap Reader", note: "Every damaged tie-down found without a hint", test: AWARD.stepClean("strap-inspect") },
      { id: "straight-log", name: "Straight Log", note: "Never used a cheater bar, climbed the load, drove past the limit or edited the log", test: AWARD.safe },
      { id: "on-the-limit", name: "On the Limit", note: "Working load limit read near the centre of the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-day", name: "Clean Day", note: "No corrections anywhere", test: AWARD.clean },
      { id: "steady-miles", name: "Steady Miles", note: "The first miles held in band", test: AWARD.unbroken },
      { id: "on-schedule", name: "On Schedule", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "csh-cheater-bar": "You went to slide a length of pipe over the winch bar for more leverage. A cheater bar over-tensions the strap past anything its rating assumed and turns the bar into a spring: when the winch pawl slips or the bar comes off the winch, it whips round at head height. The winch bar alone, with your body out of its arc, is the tool.",
    "csh-climb-crate": "You went to climb up onto the crate to throw the strap over. A flatbed deck is already well above the ground and a crate on it puts you higher, on a surface that is not built to stand on; falls from flatbed loads are among the most common serious injuries flatbed drivers have. Straps are thrown from the ground.",
    "csh-drive-over-hours": "You went to drive the last forty miles past your eleven-hour driving limit to reach the receiver. The limits in 49 CFR 395 exist because crash risk rises sharply with hours at the wheel; the ELD will record the violation, a roadside inspector will put you out of service, and the fatigue is real whether or not anybody checks.",
    "csh-edit-eld": "You went to edit the log to show off-duty time you actually spent driving. Falsifying a record of duty status is a violation in its own right under 49 CFR 395, the device keeps the original and the edit history, and a false log is exactly what investigators look for after a crash.",
  },

  lateNotes: {
    "csh-winch": "The winch is tensioned once the strap is thrown and hooked on both sides — winching a strap that is not seated pulls it off the rail.",
    "csh-recheck": "The re-check comes after the first miles, when the load has settled — straps checked before moving cannot show you what the road has done.",
    "csh-dvir-log": "The report and the log are closed out at the end of the day, once the trip plan is set and the check-in is done.",
  },

  steps: [
    {
      id: "bill-of-lading", kind: "select", target: "csh-bill-of-lading",
      title: "Read the bill of lading",
      cue: "Read what the load is: two crated machines, each seven feet long and 4,200 lb, and where they are going.",
      why: "Every securement decision starts from two numbers per article: how long it is and how heavy it is. 49 CFR 393 sets the minimum number of tie-downs from the length and weight of each article and the minimum total working load limit from its weight. A driver who does not know those numbers is guessing at the straps, and a guess is what an inspector or a hard stop finds out.",
    },
    {
      id: "wll", kind: "gauge", target: "csh-wll-gauge",
      title: "Add up the working load limit",
      cue: "Add the working load limits marked on the straps for one crate and commit once the total is at least half the crate's weight.",
      why: "49 CFR 393 requires the aggregate working load limit of the tie-downs on an article to be at least half its weight. Each strap carries its rating on its tag, and the rating counts only if the tag is there and the strap is sound. Adding them up before the straps go on is how you know you are carrying enough restraint, rather than finding out on the first hard stop.",
      gauge: { label: "AGGREGATE WLL", speed: 0.7, green: [0.42, 0.85], readout: (t) => `${Math.round(t * 120)}% of crate weight`, missNote: "That is under half the crate's weight — not enough working load limit on it yet." },
    },
    {
      id: "strap-inspect", kind: "find", noHint: true,
      targets: ["csh-cut-strap", "csh-knot", "csh-bent-hook"],
      itemNames: { "csh-cut-strap": "the strap with a cut in the webbing", "csh-knot": "the knotted strap", "csh-bent-hook": "the hook opened out" },
      itemNotes: {
        "csh-cut-strap": "A cut across the webbing. A damaged strap's rating means nothing; it comes out of service, and a roadside inspector does not count it toward the working load limit.",
        "csh-knot": "Someone tied a knot to shorten this strap. 49 CFR 393 does not allow knotted tie-downs; a knot cuts a strap's strength sharply at the worst possible point.",
        "csh-bent-hook": "This flat hook has been bent open. An opened hook slides off the rail under load — the strap is only as good as its weakest fitting.",
      },
      title: "Inspect the straps before they go on",
      cue: "Look along each strap and at its hardware. Find the three that cannot be used.",
      why: "A tie-down is rated for its working load limit only when it is intact: no cuts, no burns, no knots, no stretched or bent hardware. 49 CFR 393 sets out the condition tie-downs must be in, and the CVSA out-of-service criteria count defective ones as missing. Pulling a damaged strap in the yard costs nothing; finding one at the roadside can put the whole load out of service.",
    },
    {
      id: "front-strap", kind: "drag", target: "csh-strap-front",
      title: "Throw the second strap on the front crate",
      cue: "From the ground, throw the strap over the front crate and hook it on the rail opposite its winch.",
      why: "A seven-foot article needs at least two tie-downs under 49 CFR 393, however light it is, because one strap lets it pivot around that strap. The strap goes over from the ground — never from on top of the load — and the hook seats fully on the rail, not on the edge of a stake pocket where it can pop out when the load flexes.",
      drag: { to: "csh-rail-front", radius: 0.45, missNote: "The hook is not on the rail — seat it fully on the rail opposite the winch." },
    },
    {
      id: "rear-strap", kind: "drag", target: "csh-strap-rear",
      title: "Throw the second strap on the rear crate",
      cue: "Throw the next strap over the rear crate and hook it on the rail, clear of the first strap.",
      why: "Each article is secured in its own right: the rear crate needs its own two tie-downs and its own working load limit, whatever is holding the front one. Spacing the straps along the crate rather than bunching them keeps it from rotating, and a strap that is not twisted on the corner bears flat and carries its full rating.",
      drag: { to: "csh-rail-rear", radius: 0.45, missNote: "The hook is not on the rail — seat it fully, clear of the other strap." },
    },
    {
      id: "winch", kind: "turn", target: "csh-winch",
      title: "Tension the winch",
      cue: "Wind the winch with the winch bar until the strap is tight, standing out of the bar's arc, then lock the pawl.",
      why: "A strap does its job only when it is tight enough that the crate cannot move under it, and the winch is how that tension is set and held. The bar is used alone, with your body to the side of its arc, and the pawl is locked before you let go — a winch that slips under a bar you are pulling is how drivers get hit in the face.",
      turn: { turns: 1, axis: "x", label: "WINCH BAR" },
    },
    {
      id: "edge", kind: "select", target: "csh-edge-protect",
      title: "Put edge protection on the corners",
      cue: "Fit an edge protector wherever a strap crosses a crate corner.",
      why: "A strap bearing on a sharp wooden or steel corner is being sawn every time the load flexes on a bump. 49 CFR 393 requires edge protection wherever a tie-down could be cut or abraded where it touches the cargo. The protector also spreads the load so the corner of the crate is not crushed, which is what lets a tight strap stay tight.",
    },
    {
      id: "first-miles", kind: "track", target: "csh-speed", seconds: 8,
      title: "Drive the first miles smoothly",
      cue: "Hold a steady speed through the first miles, with smooth starts and stops, and watch the load in the mirrors.",
      why: "A new load settles in its first miles: crates bed into the deck, straps stretch a little, and anything that was going to move starts to. Smooth acceleration and braking give it the least reason to, and the mirrors are where you see a strap start to flutter. FMCSA's rules ask the driver to re-examine the cargo early in the trip for exactly this reason.",
      track: { start: 0.1, green: [0.38, 0.6], rise: 0.54, fall: 0.46, drift: 0.12, label: "SPEED", readout: (v) => (v < 0.38 ? "holding up traffic" : v > 0.6 ? "too fast for the load" : "steady") },
      holdBreakNote: "Speed out of band — hard throttle and hard braking are what move a load. Settle it.",
    },
    {
      id: "recheck", kind: "hold", target: "csh-recheck", seconds: 8,
      title: "Re-check every strap within the first fifty miles",
      cue: "Stopped safely, walk the load and re-tension each strap, holding the bar until each one is tight.",
      why: "FMCSA's rules ask a driver to inspect the cargo and its securement within the first fifty miles, and again after three hours of driving or 150 miles, or whenever the duty status changes. Straps lose tension as the load settles, and a strap that was tight in the yard can be slack by the first stop. Re-tensioning each one is the only way to know it is still doing its job.",
      holdBreakNote: "You let go before the strap was tight. Hold the bar until the tension is back.",
    },
    {
      id: "eld-audit", kind: "find", noHint: true,
      targets: ["csh-break-due", "csh-window-end", "csh-unassigned"],
      itemNames: { "csh-break-due": "the 30-minute break due", "csh-window-end": "the fourteen-hour window closing", "csh-unassigned": "the unassigned driving on the device" },
      itemNotes: {
        "csh-break-due": "Seven hours and forty minutes of driving since the last break of 30 minutes or more. After eight hours of driving a 30-minute break is required before driving again.",
        "csh-window-end": "The fourteen-hour window ends at 19:10. After that you may not drive again until you have had ten consecutive hours off duty, however few hours you have driven.",
        "csh-unassigned": "The device shows unassigned driving from last night — someone moved this truck without logging in. You review it and accept it only if it was you; otherwise you reject it.",
      },
      title: "Read your electronic log",
      cue: "Open the ELD and find the three things that decide the rest of your day.",
      why: "49 CFR 395 gives a property-carrying driver eleven hours of driving after ten hours off, inside a fourteen-hour window, with a 30-minute break after eight hours of driving, and the electronic logging device counts every minute. Reading it before planning is what stops a driver discovering the limit forty miles short of the receiver. Unassigned driving on the device is yours to accept or reject, not to ignore.",
    },
    {
      id: "trip-plan", kind: "sequence",
      targets: ["csh-break-stop", "csh-last-legal-stop"],
      itemNames: { "csh-break-stop": "the 30-minute break stop", "csh-last-legal-stop": "the last legal parking before the window closes" },
      title: "Plan the break and the last legal stop",
      cue: "Pick the stop for your 30-minute break, then the last safe, legal parking you can reach before the window closes.",
      why: "The limits only protect you if the trip is planned inside them: a break stop before the eight-hour mark and a place to park — a real truck parking space, not a ramp shoulder — before the window closes. Parking is scarce in the evening, so the last legal stop is chosen early and with a margin. Arriving at the receiver tomorrow morning, rested, is the job.",
      outOfOrderNote: "Break first, then the last stop — the break comes earlier in the day and changes where you can reach.",
    },
    {
      id: "crew-checkin", kind: "select", target: "csh-crew-checkin",
      title: "Check in with dispatch",
      cue: "Tell dispatch about the slack strap and the unassigned driving, give them your planned stop, and say honestly how rested you are.",
      why: "Dispatch plans tomorrow's appointment around what you tell it today: a truck that will stop short of the receiver tonight is a delivery that has to be moved, and it is far better moved now. FMCSA's rules prohibit driving while too fatigued or ill to drive safely, and the check-in is where a driver says so plainly — the call no rate or appointment should talk anyone out of.",
    },
    {
      id: "dvir-log", kind: "select", target: "csh-dvir-log",
      title: "Close out the report and certify the log",
      cue: "Write up the damaged straps in the inspection report, certify today's log as true, and sign both.",
      why: "The damaged straps belong on the driver vehicle inspection report under 49 CFR 396 so they are replaced rather than rolled back into the strap box, and 49 CFR 395 asks you to certify each day's record of duty status as true and correct. Two signatures at the end of the day are what make everything you did during it a record rather than a story.",
    },
  ],

  interrupts: [
    {
      id: "strap-slack",
      kind: "Load moving",
      after: "first-miles", delay: 3, seconds: 12,
      alert: "In the mirror, a strap on the rear crate has gone slack and is flapping, and the crate has crept toward the edge of the deck.",
      cue: "Signal, flashers on and get off the road safely.",
      target: "csh-flashers",
      why: "A slack strap on a moving load does not tighten itself; every bump lets the crate walk further. The four-ways and a controlled move to a safe stop — not a panic stop on the lane — is the answer, and then the strap is re-tensioned and the crate re-seated before another mile.",
      missNote: "You kept driving with a slack strap and a moving crate. Loads that come off flatbeds land in the next lane or on the car behind; the first sign is almost always a strap flapping in the mirror.",
      wrongNote: "It is the four-way flashers. The load is moving and the truck needs to get safely off the road.",
    },
    {
      id: "truck-passes-close",
      kind: "Traffic at the shoulder",
      after: "recheck", delay: 3, seconds: 12,
      alert: "While you are working on the straps on the shoulder, a passing truck swings close enough that its wind rocks you, and the next one is coming.",
      cue: "Protect the stopped truck.",
      target: "csh-triangle-kit",
      why: "A truck stopped on a shoulder is invisible to a tired or distracted driver until it is too late; the warning triangles, placed behind it within ten minutes of stopping as FMCSA's rules require, are what give traffic time to move over. Your own body stays on the side away from the lane.",
      missNote: "You kept working on the traffic side with no warning devices out. Drivers and stopped trucks on shoulders are struck every year by vehicles that never saw them until the last second.",
      wrongNote: "It is the warning triangle kit. The truck is on the shoulder with traffic passing close and nothing behind it to warn anyone.",
    },
  ],

  supportLine: "your carrier's employee assistance programme, or your Teamsters steward if you are not sure how to reach it",

  build(root) {
    const hits = {};
    const g = group(root);
    const reg2 = (obj, id) => reg(hits, obj, id);
    stationPad(g, 2.6, CSH_ACCENT);

    // ------------------------------------------------------------ pull-off and the road beyond
    const yardTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#454845", base2: "#3b3e3b", seam: "rgba(0,0,0,0.4)" }), { repeat: 5, px: 512 });
    const yard = box(g, 12, 0.12, 8.4, 0, 0.06, -0.4, 0xffffff, { rough: 0.95 });
    yard.material = texturedMat(yardTex, { rough: 0.95, metal: 0.02, color: 0xacb0ac });
    const road = box(g, 12, 0.02, 1.8, 0, 0.13, -3.6, 0x2f3236, { rough: 0.9, cast: false });
    void road;
    for (let i = 0; i < 6; i++) box(g, 1.0, 0.005, 0.1, -5 + i * 2, 0.142, -3.6, 0xf2f5f7, { rough: 0.6, cast: false });
    box(g, 12, 0.006, 0.12, 0, 0.142, -2.62, 0xf2f5f7, { rough: 0.6, cast: false });

    // ------------------------------------------------------------ the flatbed, facing +x, shoulder side toward the learner
    const fb = group(g, -1.4, 0.12, -0.8);
    const deck = box(fb, 5.6, 0.12, 2.5, 0, 1.3, 0, 0xffffff, { rough: 0.85 });
    deck.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 6, base: "#7a5a3a", base2: "#6a4c30", seam: "rgba(0,0,0,0.45)" }), { repeat: 3, px: 256 }), { rough: 0.85, color: 0xd8c0a0 });
    for (const sz of [-1, 1]) box(fb, 5.6, 0.14, 0.08, 0, 1.2, sz * 1.25, 0x3a3f45, { rough: 0.5, metal: 0.6 });
    box(fb, 5.4, 0.24, 0.5, 0, 1.05, 0, 0x2b2f34, { rough: 0.6, metal: 0.5 });
    // The deck is the station's (the crates, rails and winches the steps use
    // are built on it; the kit's 48 ft flatbed is 14.7 m and does not fit the
    // pull-off), but it rides on the kit's dual wheels at a real tandem spread.
    for (const dx of [-2.25, -1.02]) {
      const ax = group(fb, dx, 0, 0, Math.PI / 2);
      for (const sz of [-1, 1]) flWheel(ax, -sz * 1.0, 0.5, 0, 0.5, 0.6, { side: -sz, dual: true, style: "steel" });
    }
    for (const sz of [-1, 1]) box(fb, 0.1, 0.9, 0.1, 0.1, 0.7, sz * 0.8, 0x3a3f45, { rough: 0.5, metal: 0.5 });
    // Winches along the shoulder-side rail.
    const winches = [];
    for (const dx of [-2.2, -1.5, -0.2, 0.5]) { const w = cyl(fb, 0.07, 0.07, 0.2, dx, 1.02, 1.3, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 12 }); w.rotation.z = Math.PI / 2; winches.push(w); }
    reg2(winches[3], "csh-winch");
    holoTag(fb, "winch", 0.5, 0.75, 1.45, { css: "#5ec2d6", w: 0.14 });
    const bar = group(fb, 0.5, 1.02, 1.42);
    cyl(bar, 0.015, 0.015, 0.8, 0, -0.3, 0, 0xc9ced2, { rough: 0.3, metal: 0.8, seg: 8 }).rotation.x = 0.2;
    // The crates.
    const crate = (x, label) => {
      const c = group(fb, x, 1.36, 0);
      box(c, 2.1, 1.3, 1.6, 0, 0.65, 0, CSH_CRATE, { rough: 0.9 });
      for (const dx of [-0.95, 0.95]) box(c, 0.1, 1.32, 1.62, dx, 0.65, 0, 0x9a764a, { rough: 0.9 });
      decal(c, 0.9, 0.3, 0, 0.8, 0.81, signFace(label, { bg: "#b8925e", fg: "#2b1e10", accent: "#5ec2d6", scale: 0.45 }), { px: 192 });
      return c;
    };
    const rearCrate = crate(-1.85, "4,200 LB · 7 FT");
    crate(0.45, "4,200 LB · 7 FT");
    // Straps already on (one per crate), and the ones you throw.
    const strapOn = (x) => {
      const s = group(fb, x, 0, 0);
      box(s, 0.06, 0.02, 1.64, 0, 2.68, 0, 0xf2c14b, { rough: 0.6 });
      for (const sz of [-1, 1]) box(s, 0.06, 1.32, 0.02, 0, 2.0, sz * 0.82, 0xf2c14b, { rough: 0.6 });
      return s;
    };
    strapOn(-2.35);
    strapOn(-0.05);
    const setFront = strapOn(0.95); setFront.visible = false;
    const setRear = strapOn(-1.35); setRear.visible = false;
    const slackStrap = group(fb, -1.35, 0, 0);
    box(slackStrap, 0.06, 0.02, 1.2, 0, 2.5, 0.8, 0xf2c14b, { rough: 0.6 }).rotation.x = 0.8;
    slackStrap.visible = false;
    const railFront = box(fb, 0.2, 0.12, 0.12, 0.95, 1.2, -1.3, 0xffffff, { rough: 0.5 });
    railFront.visible = false; hits["csh-rail-front"] = railFront;
    const railRear = box(fb, 0.2, 0.12, 0.12, -1.35, 1.2, -1.3, 0xffffff, { rough: 0.5 });
    railRear.visible = false; hits["csh-rail-rear"] = railRear;
    const edgeGuards = [];
    for (const x of [-2.35, -0.05]) for (const sz of [-1, 1]) { const e = box(fb, 0.14, 0.14, 0.06, x, 2.66, sz * 0.8, 0x2f7fbf, { rough: 0.5 }); e.visible = false; edgeGuards.push(e); }
    const edgeHit = box(fb, 0.2, 0.2, 0.1, 0.45, 2.66, 0.84, 0x5ec2d6, { opacity: 0.35, cast: false });
    holoTag(fb, "strap on a bare corner", 0.45, 2.95, 0.9, { css: "#5ec2d6", w: 0.36 });
    reg2(edgeHit, "csh-edge-protect");
    const climb = box(fb, 0.8, 0.12, 0.8, -1.85, 2.72, 0, 0xd2312b, { opacity: 0.3, cast: false });
    holoTag(fb, "climb up to throw it?", -1.85, 3.0, 0.4, { css: "#d2312b", w: 0.36 });
    reg2(climb, "csh-climb-crate");
    const recheckHit = box(fb, 0.3, 0.3, 0.2, -1.5, 1.0, 1.4, 0x5ec2d6, { opacity: 0.3, cast: false });
    holoTag(fb, "re-check — hold the bar", -1.5, 0.72, 1.5, { css: "#5ec2d6", w: 0.36 });
    reg2(recheckHit, "csh-recheck");

    // ------------------------------------------------------------ the tractor, ahead of the trailer
    // The kit's day cab (shared/fleet.js), fifth wheel under the deck's
    // kingpin, facing +x: its driver's side is to the road.
    semiTractor(g, 2.515, 0.12, -0.8, { ry: Math.PI / 2, livery: { colour: CSH_CAB, fleetName: "CITY HEAVY HAUL", unitNumber: "5520" } });

    // ------------------------------------------------------------ the strap bin, the bad straps, the cheater bar
    const bin = group(g, -3.6, 0.12, 1.5, 0.5);
    box(bin, 0.9, 0.5, 0.6, 0, 0.25, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const frontStrap = group(bin, -0.2, 0.52, 0);
    cyl(frontStrap, 0.1, 0.1, 0.06, 0, 0.03, 0, 0xf2c14b, { rough: 0.6, seg: 14 });
    reg2(frontStrap, "csh-strap-front");
    const rearStrap = group(bin, 0.2, 0.52, 0);
    cyl(rearStrap, 0.1, 0.1, 0.06, 0, 0.03, 0, 0xf2c14b, { rough: 0.6, seg: 14 });
    reg2(rearStrap, "csh-strap-rear");
    holoTag(bin, "straps · 3,335 lb WLL", 0, 0.9, 0, { css: "#5ec2d6", w: 0.4 });
    const bad = group(g, -2.3, 0.12, 2.2, 0.2);
    box(bad, 1.3, 0.04, 0.5, 0, 0.02, 0, 0x2b2f34, { rough: 0.8 });
    const cut = box(bad, 0.4, 0.02, 0.06, -0.4, 0.05, -0.12, 0xf2c14b, { rough: 0.6 });
    box(bad, 0.06, 0.025, 0.07, -0.4, 0.06, -0.12, 0x1b1e23, { rough: 0.9 });
    reg2(cut, "csh-cut-strap");
    const knot = cyl(bad, 0.05, 0.05, 0.06, 0.05, 0.06, 0.1, 0xf2c14b, { rough: 0.7, seg: 10 });
    reg2(knot, "csh-knot");
    const hook = box(bad, 0.1, 0.03, 0.08, 0.45, 0.06, -0.05, 0x8b949d, { rough: 0.4, metal: 0.7 });
    hook.rotation.y = 0.6;
    reg2(hook, "csh-bent-hook");
    holoTag(bad, "strap box", 0, 0.3, 0, { css: "#5ec2d6", w: 0.18 });
    const pipe = cyl(g, 0.03, 0.03, 1.2, -0.6, 0.18, 2.4, 0x6a6f75, { rough: 0.6, metal: 0.6, seg: 10 });
    pipe.rotation.z = Math.PI / 2;
    holoTag(g, "cheater pipe on the bar?", -0.6, 0.45, 2.4, { css: "#d2312b", w: 0.4 });
    reg2(pipe, "csh-cheater-bar");
    const wllGauge = instrument(g, -3.1, 1.15, 0.2, { idle: "WLL", color: CSH_ACCENT, w: 0.14, d: 0.16, ry: 0.8 });
    reg2(wllGauge, "csh-wll-gauge");
    holoTag(g, "working load limit", -3.1, 1.37, 0.2, { css: "#5ec2d6", w: 0.32 });
    const triKit = group(g, 1.6, 0.12, 1.9, -0.3);
    box(triKit, 0.5, 0.12, 0.18, 0, 0.06, 0, 0xd2312b, { rough: 0.5 });
    holoTag(triKit, "warning triangles", 0, 0.4, 0, { css: "#5ec2d6", w: 0.3 });
    reg2(triKit, "csh-triangle-kit");
    const placed = [];
    for (const dx of [-4.6, -3.4]) { const t = cyl(g, 0.22, 0.22, 0.02, dx, 0.3, -2.0, 0xf25c2b, { rough: 0.4, seg: 3 }); t.rotation.x = Math.PI / 2; t.visible = false; placed.push(t); }

    // ------------------------------------------------------------ the cab controls and the ELD
    const dash = group(g, 3.2, 0.12, 1.8, -0.3);
    box(dash, 1.0, 0.9, 0.35, 0, 0.45, 0, 0x2b2f34, { rough: 0.7 });
    slab(dash, 0.96, 0.35, 0.05, 0, 1.05, 0.05, 0x1b1e23, { radius: 0.02, rough: 0.6 });
    const rim = cyl(dash, 0.2, 0.2, 0.03, -0.1, 1.25, 0.28, 0x1b1e23, { rough: 0.5, seg: 18 });
    rim.rotation.x = 1.1;
    const flashers = box(dash, 0.07, 0.05, 0.04, 0.2, 1.14, 0.1, 0xd2312b, { rough: 0.5 });
    reg2(flashers, "csh-flashers");
    const pedal = box(dash, 0.08, 0.03, 0.18, 0.22, 0.2, 0.3, 0x3a3f45, { rough: 0.5 });
    reg2(pedal, "csh-speed");
    holoTag(dash, "cab: flashers · throttle", 0, 1.5, 0.1, { css: "#5ec2d6", w: 0.4 });
    const eld = holoPanel(g, 0.84, 0.54, 2.2, 1.55, 2.6, (ctx, w, h) => {
      ctx.fillStyle = "#061418"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec2d6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f1f6"; ctx.fillText("ELD — DRIVING", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefafc";
      ["Drive left today: 3:20", "Since last 30-min break: 7:40", "14-hour window ends: 19:10", "Cycle left (70/8): 21:45", "Unassigned events: 1", "Certify yesterday: pending"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: -0.25, accent: CSH_ACCENT });
    void eld;
    for (const [id, dx, dy, label, css] of [["csh-break-due", -0.25, 0.07, "BREAK", "#f2ae14"], ["csh-window-end", 0.05, 0.07, "WINDOW", "#f0645b"], ["csh-unassigned", 0.35, 0.07, "UNASSIGNED", "#f2ae14"]]) {
      const tagMesh = decal(g, 0.22, 0.08, 2.2 + dx, 1.55 + dy - 0.35, 2.64, signFace(label, { bg: "#061418", accent: css, scale: 0.4 }), { px: 128 });
      tagMesh.rotation.y = -0.25;
      reg2(tagMesh, id);
    }
    const edit = decal(g, 0.22, 0.08, 1.65, 1.2, 2.72, signFace("EDIT LOG", { bg: "#2a1414", accent: "#f0645b", scale: 0.4 }), { px: 128 });
    edit.rotation.y = -0.25;
    holoTag(g, "make it off-duty?", 1.65, 1.08, 2.73, { css: "#d2312b", w: 0.3 });
    reg2(edit, "csh-edit-eld");

    // ------------------------------------------------------------ boards: bill, route plan, check-in, report
    const bol = holoPanel(g, 0.8, 0.52, -3.6, 1.55, -0.3, (ctx, w, h) => {
      ctx.fillStyle = "#061418"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec2d6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#d8f1f6"; ctx.fillText("BILL OF LADING — 2 PCS", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#eefafc";
      ["2 crated machines, 4,200 lb each", "Each 7 ft long, not blocked forward", "7 ft: at least 2 tie-downs each", "WLL at least half: 2,100 lb each", "Edge protection on crate corners", "Deliver 07:00 tomorrow"]
        .forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.3 + i * 0.11)));
    }, { ry: 1.0, accent: CSH_ACCENT });
    reg2(bol, "csh-bill-of-lading");
    const plan = holoPanel(g, 0.7, 0.44, 4.2, 1.55, 0.9, (ctx, w, h) => {
      ctx.fillStyle = "#061418"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec2d6"; ctx.fillRect(0, 0, w, 6);
      ctx.fillStyle = "#d8f1f6"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("ROUTE PLAN", w / 2, h * 0.18);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ["Mile 38: rest area (break)", "Mile 190: truck stop, 60 spaces", "Receiver: mile 232"].forEach((l, i) => ctx.fillText(l, w / 2, h * (0.42 + i * 0.17)));
    }, { ry: -1.2, accent: CSH_ACCENT });
    void plan;
    const breakStop = decal(g, 0.2, 0.08, 4.12, 1.36, 0.65, signFace("BREAK", { bg: "#061418", accent: "#59c97b", scale: 0.4 }), { px: 96 });
    breakStop.rotation.y = -1.2;
    reg2(breakStop, "csh-break-stop");
    const lastStop = decal(g, 0.2, 0.08, 4.3, 1.36, 1.1, signFace("PARK", { bg: "#061418", accent: "#59c97b", scale: 0.4 }), { px: 96 });
    lastStop.rotation.y = -1.2;
    reg2(lastStop, "csh-last-legal-stop");
    const overHours = slab(g, 1.0, 0.02, 0.5, 4.5, 0.13, -1.9, 0xd2312b, { radius: 0.02, rough: 0.6, opacity: 0.35, cast: false });
    holoTag(g, "push on to the receiver tonight?", 4.5, 0.34, -1.9, { css: "#d2312b", w: 0.52 });
    reg2(overHours, "csh-drive-over-hours");
    const checkin = holoPanel(g, 0.46, 0.3, -1.2, 1.75, 3.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,18,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#dceff7"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("DISPATCH CHECK-IN", w / 2, h * 0.32);
      ctx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      ctx.fillText("Strap · stop · how rested", w / 2, h * 0.66);
    }, { ry: 0.8, accent: 0x4fd1ff });
    reg2(checkin, "csh-crew-checkin");
    const report = holoPanel(g, 0.5, 0.36, 0.3, 1.55, 3.0, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,20,24,0.92)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec2d6"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#d8f1f6"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("INSPECTION REPORT", w / 2, h * 0.24);
      ctx.fillText("+ CERTIFIED LOG", w / 2, h * 0.42);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Straps out · day certified", w / 2, h * 0.72);
    }, { ry: -0.3, accent: CSH_ACCENT });
    reg2(report, "csh-dvir-log");
    cone(g, -5.0, -2.2);
    cone(g, 5.2, 2.6);

    // ------------------------------------------------------------ the passing truck, the shipper's loader
    // The kit's box truck, out of sight until it comes by in the near lane.
    const passer = boxTruck(g, -3.0, 0.12, -3.35, { ry: Math.PI / 2, livery: { colour: 0xdfe4e8, fleetName: "METRO DELIVERY", unitNumber: "118" } });
    passer.visible = false;
    const loader = standingFigure(g, -4.3, -0.1, { ry: 1.4, cloth: 0x37505f, vest: 0xd8e24a });
    void loader;

    let miles = 0;
    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(-0.8, 1.6, -0.8),
      onStepComplete(step) {
        if (step.id === "wll") repaint(wllGauge.userData.screen, signFace("OK", { bg: "#061418", accent: "#59c97b", fg: "#eefafc", scale: 0.6 }));
        if (step.id === "front-strap") { setFront.visible = true; frontStrap.visible = false; }
        if (step.id === "rear-strap") { setRear.visible = true; rearStrap.visible = false; }
        if (step.id === "edge") for (const e of edgeGuards) e.visible = true;
        if (step.id === "dvir-log") {
          repaint(report.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(8,26,14,0.94)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#59c97b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#d8f6e4"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.fillText("SIGNED + CERTIFIED", w / 2, h * 0.36);
            ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
            ctx.fillText("3 straps out · parked mile 190", w / 2, h * 0.66);
          });
        }
      },
      // The rear strap really goes slack and the crate really creeps; the
      // passing truck really swings in close to the shoulder.
      onInterrupt(it) {
        if (it.id === "strap-slack") { setRear.visible = false; slackStrap.visible = true; rearCrate.position.z = 0.25; }
        if (it.id === "truck-passes-close") { passer.visible = true; passer.position.set(-1.5, 0.12, -3.35); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "strap-slack") { setRear.visible = true; slackStrap.visible = false; rearCrate.position.z = 0; flashers.material = mat(0xf2a23b, { emissive: 0xf2a23b, ei: 1.3, rough: 0.5 }); }
        if (it.id === "truck-passes-close") { passer.visible = false; passer.position.set(-3.0, 0.12, -3.35); for (const t of placed) t.visible = true; triKit.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wll") {
          const ok = gg.t >= 0.42 && gg.t <= 0.85;
          repaint(wllGauge.userData.screen, signFace(`${Math.round(gg.t * 120)}%`, { bg: "#061418", accent: ok ? "#59c97b" : "#f2ae14", fg: "#eefafc", scale: 0.55 }));
        }
        if (session?.turn && step?.id === "winch") { winches[3].rotation.x = session.turn.amount * Math.PI * 2; bar.rotation.x = session.turn.amount * Math.PI * 2; }
        if (step?.id === "first-miles" && session.holding) miles = Math.min(1, miles + dt / 8);
        void t; void miles;
      },
    };
  },
};
