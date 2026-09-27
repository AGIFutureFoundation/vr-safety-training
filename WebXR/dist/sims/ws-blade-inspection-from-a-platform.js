import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, gratingFace, palette,
} from "../citykit.js";
import { radio } from "../../../shared/toolkit.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Blade Inspection from a Platform VR — Energy & Power,
// Ironworkers / IBEW blade technician.
//
// A blade is inspected from a suspended platform hung off the nacelle with
// the rotor locked and the blade parked straight down. The wind decides
// whether the platform goes up at all — read against the site's own
// platform limit, not the climb limit and not a feeling — and keeps
// deciding while it is up: a platform swings into a blade in a gust. The
// defects are photographed and reported, never repaired on a guess. Sited
// generically: no turbine, blade length or wind figure is stated.

const WS3_ACCENT = 0x7fc4e8;
const WS3_CSS = "#7fc4e8";
const WS3_PAL = palette("construction");

export const SIM_WS_BLADE_INSPECTION_FROM_A_PLATFORM = {
  id: "ws-blade-inspection-from-a-platform",
  index: "ws-03",
  domain: "Energy",
  trade: "Ironworkers / IBEW blade technician",
  category: "Energy & Power",
  district: "wind-farm",
  weather: "wind",
  certification: "Ironworkers IMPACT and IBEW/NECA JATC wind training as bodies; ANSI Z359 for the independent lifeline and harness on a suspended platform; 29 CFR 1910.28 and 29 CFR 1926.502 for the fall-protection system; 29 CFR 1910.269 for work on the generation installation; the platform manufacturer's manual and the site's procedure for every wind and load limit",
  name: "Blade Inspection from a Platform",
  title: simTitle("Blade Inspection from a Platform"),
  tagline: "The wind read against the site's platform limit before the platform leaves the ground, the rotor locked with the blade parked, the platform proven, and every defect photographed and reported rather than guessed at",
  accent: WS3_ACCENT,
  accentCss: WS3_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "wind-decides", name: "The Wind Decides", note: "The go or no-go made against the written limit, the platform proven and every defect on the record" },

  game: system({
    name: "Blade Authority",
    currency: "PASSES",
    ranks: ["Trainee", "Rope Hand", "Blade Technician", "Lead Technician", "Blade Authority Certified"],
    badges: [
      { id: "limit-read", name: "Limit Read", note: "The wind was read against the site's platform limit", test: AWARD.stepClean("wind-go") },
      { id: "no-shortcuts", name: "No Shortcuts", note: "No unsafe action was recorded", test: AWARD.safe },
      { id: "steady-platform", name: "Steady Platform", note: "Held the platform clear of the blade", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-inspection", name: "Clean Inspection", note: "No corrections from the plan to the report", test: AWARD.clean },
      { id: "unbroken-raise", name: "Unbroken Raise", note: "The platform raise ran without a break", test: AWARD.unbroken },
      { id: "brisk-pass", name: "Brisk Pass", note: "Inspected and reported inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "go-over-limit": "You went to send the platform up with the wind over the site's platform limit. A suspended platform is a sail on two ropes, and above the limit it swings into the blade or the tower with the crew inside it; the limit is written so nobody has to argue with it at the foot of the tower.",
    "unclipped-in-platform": "You went to ride the platform without clipping to the independent lifeline. The platform's own ropes hold the platform; the lifeline holds you if the platform, a rope or a hoist fails, and it has to be a separate line to do that.",
    "under-the-platform": "You went to walk under the raised platform. Anything dropped from a platform — a tool, a camera, a piece of blade — lands in the zone beneath it, which is why the drop zone is barricaded and stays empty.",
    "rotor-unconfirmed": "You went to raise the platform without confirming the rotor lock. A blade that moves while a platform hangs beside it strikes the platform, and only a locked rotor, confirmed with the nacelle, keeps it parked.",
  },

  lateNotes: {
    "tagline-anchor": "The tag lines are tied off to their ground anchors before the platform lifts, not once it is already swinging.",
    "inspection-camera": "The photograph is taken once the defect has been found and the platform is steady beside it, not on the move.",
  },

  faults: [
    {
      id: "anemometer-fault",
      label: "Met-mast anemometer fault",
      note: "The met-mast readout at the tower base shows a sensor fault. The go or no-go is made on the handheld anemometer, read at the platform, against the same site limit.",
      step: "wind-go",
      change: {
        kind: "select", target: "handheld-anemometer",
        title: "Read the wind on the handheld anemometer",
        cue: "The mast readout is faulted — take the handheld anemometer and read the wind at the platform against the site's limit.",
        why: "A faulted mast sensor does not make the wind go away; it takes away the number the go or no-go depends on. The handheld reading at the platform is the site procedure's fallback, and it is read against the same written limit rather than guessed from the mast's last good value.",
        gauge: undefined,
      },
    },
  ],

  interrupts: [
    {
      id: "drop-zone-entry",
      kind: "A ground hand walks into the drop zone",
      after: "platform-raise", delay: 3, seconds: 11,
      alert: "A ground hand carrying a tool bag has stepped over the barricade and is walking under the platform.",
      cue: "Sound the air horn to clear the drop zone.",
      target: "drop-zone-horn",
      why: "The drop zone under a raised platform is empty for a reason: anything that leaves the platform lands there. A horn blast is the site's agreed signal to clear it now, faster than a shout into the wind.",
      missNote: "The ground hand stayed under the platform with nobody clearing them out.",
      wrongNote: "It is the air horn. The platform raise is finished; the person underneath needs clearing.",
    },
    {
      id: "lightning-alert",
      kind: "The lightning detector alarms",
      after: "platform-drift", delay: 3, seconds: 11,
      alert: "The lightning detector on the tower base is alarming and a flash shows over the ridge.",
      cue: "Bring the platform down with the platform-down control.",
      target: "platform-down-button",
      why: "A turbine is the tallest thing on the ridge and the platform hangs off it on steel ropes; the site's lightning procedure takes the crew down and away from the tower when the detector alarms, without waiting to see whether the next strike is closer.",
      missNote: "The platform stayed up on the tower with the lightning detector alarming.",
      wrongNote: "It is the platform-down control. Holding the platform off the blade does not take the crew out of a lightning risk.",
    },
  ],

  supportLine: "your employer's employee assistance programme, or your Ironworkers or IBEW steward if you are not sure how to reach it",

  steps: [
    {
      id: "platform-plan", kind: "select", target: "platform-permit",
      title: "Read the platform plan and the rescue plan",
      cue: "Read the platform plan: the blade to inspect, the crew, the site's platform wind limit and the rescue plan.",
      why: "The platform plan fixes the limits before the crew is at the foot of the tower with a job waiting, and the rescue plan says how someone is brought down from a platform that stops halfway — both decided on paper, not improvised on the ropes.",
    },
    {
      id: "wind-go", kind: "gauge", target: "platform-wind-readout",
      title: "Go or no-go on the wind",
      cue: "Bring the met-mast reading up to where the wind is and commit — inside the site's platform limit or not?",
      why: "A suspended platform is lighter and more exposed than a climber on a ladder, so the site sets its own platform limit, often below the climb limit. Reading the mast against that written figure is the decision; everything else in the job depends on it.",
      gauge: { label: "WIND vs PLATFORM LIMIT", speed: 0.6, green: [0.3, 0.55], readout: (t) => (t > 0.55 ? "over the platform limit" : t < 0.3 ? "reading low — check the mast" : "inside the platform limit"), missNote: "That reading is not what the mast shows — read it again before the go or no-go." },
    },
    {
      id: "rotor-parked", kind: "sequence",
      targets: ["rotor-lock-confirm", "blade-park-confirm"],
      itemNames: { "rotor-lock-confirm": "rotor lock confirmed with the nacelle", "blade-park-confirm": "blade confirmed parked straight down" },
      title: "Confirm the rotor locked and the blade parked",
      cue: "Confirm by radio that the rotor lock is in, then that the blade is parked straight down and pitched per the manual.",
      why: "The platform hangs beside one blade, and that blade must not move while the crew is there; the rotor lock holds it and the park position puts it where the platform can reach it. Both are confirmed with the nacelle, aloud, before the platform leaves the ground.",
      outOfOrderNote: "Lock first, then the park position — a parked blade on an unlocked rotor is not parked.",
    },
    {
      id: "platform-preuse", kind: "sequence",
      targets: ["hoist-brake-test", "overload-device-check", "secondary-rope-check"],
      itemNames: { "hoist-brake-test": "hoist brakes tested", "overload-device-check": "overload device checked", "secondary-rope-check": "secondary ropes and fall-arrest devices checked" },
      title: "Prove the platform before anyone rides it",
      cue: "Test the hoist brakes, check the overload device, then check the secondary ropes and their arrest devices.",
      why: "A suspended platform has two ways to fail — the hoist and its rope, or the load — and a pre-use check proves the brake that stops it, the device that refuses an overload and the secondary system that catches it. Checked on the ground, where a fault costs a phone call.",
      outOfOrderNote: "Brakes, then the overload device, then the secondary ropes — the order the manufacturer's pre-use check runs.",
    },
    {
      id: "taglines", kind: "select", target: "tagline-anchor",
      title: "Tie off the tag lines",
      cue: "Tie the platform's tag lines to their ground anchors.",
      why: "Tag lines tied to ground anchors keep the platform from swinging round the blade as it rises, which matters most at exactly the moment the crew is least able to fend it off.",
    },
    {
      id: "clip-lifeline", kind: "select", target: "lifeline-grab",
      title: "Clip to the independent lifeline",
      cue: "Clip your harness to the rope grab on the independent lifeline before stepping into the platform.",
      why: "The platform's own ropes hold the platform; the independent lifeline holds the person if the platform fails. Clipped before stepping in, it is there for the whole ride rather than from somewhere partway up.",
    },
    {
      id: "platform-raise", kind: "hold", target: "hoist-pendant", seconds: 5,
      title: "Raise the platform steadily",
      cue: "Hold the up control and raise the platform smoothly to the blade.",
      why: "A steady raise keeps both hoists together so the platform stays level and clear of the blade; jerky control makes it swing, and a swinging platform beside a blade is the thing the whole plan exists to avoid.",
      holdBreakNote: "The raise stopped short — bring the platform up steadily to the blade.",
    },
    {
      id: "find-defects", kind: "find", noHint: true,
      targets: ["leading-edge-erosion", "trailing-edge-crack", "receptor-burn"],
      itemNames: { "leading-edge-erosion": "leading-edge erosion", "trailing-edge-crack": "a trailing-edge crack", "receptor-burn": "a burn mark at the lightning receptor" },
      itemNotes: {
        "leading-edge-erosion": "The leading edge is pitted and the coating is worn through in patches — erosion is recorded by location and extent, not repaired from the platform on a guess.",
        "trailing-edge-crack": "A crack runs along the trailing edge bond line — a structural finding for the blade engineer, photographed with a scale and reported.",
        "receptor-burn": "The receptor shows a scorch mark: a strike has come through here, and the down-conductor test is for the electrical crew, not the platform.",
      },
      title: "Find the defects on the blade",
      cue: "Work the blade surface and find what needs to go in the report.",
      why: "The inspection's job is to see and record, not to decide what a blade can carry. An erosion patch, a bond-line crack and a receptor burn are three different findings for three different people, and each one is only useful if it is found, located and photographed.",
    },
    {
      id: "platform-drift", kind: "track", target: "platform-clearance", seconds: 7,
      title: "Keep the platform clear of the blade",
      cue: "Keep the platform's clearance to the blade in the band as the gusts push it.",
      why: "Even inside the limit the wind gusts, and a platform pushed onto a blade damages the blade and throws the crew against the rail. Holding the clearance with the tag lines and the fenders is continuous work, not a single adjustment.",
      track: { start: 0.5, green: [0.35, 0.65], rise: 0.05, fall: 0.3, drift: 0.14, label: "BLADE CLEARANCE", readout: (v) => (v > 0.65 ? "swinging out" : v < 0.35 ? "closing on the blade" : "clear and steady") },
      holdBreakNote: "The clearance left the band — the platform is swinging; steady it before going on.",
    },
    {
      id: "photograph", kind: "drag", target: "inspection-camera",
      title: "Photograph the crack with a scale",
      cue: "Bring the camera and the scale card to the crack and take the photograph.",
      why: "A photograph with a scale card beside the defect lets the blade engineer judge it without going up themselves, and it becomes the baseline the next inspection compares against. A photo without a scale is a picture, not a record.",
      drag: { to: "crack-photo-point", radius: 0.5, missNote: "The camera is not at the crack — the photo has to show the defect with the scale beside it." },
    },
    {
      id: "platform-lower", kind: "turn", target: "descent-control",
      title: "Lower the platform",
      cue: "Turn the descent control to bring the platform down steadily to the ground.",
      why: "Coming down is where tired crews rush, and a platform lowered unevenly tilts and swings as it nears the ground crew; a steady descent on the control brings it down level to a clear landing.",
      turn: { turns: 0.6, axis: "y", label: "DESCENT" },
    },
    {
      id: "report", kind: "select", target: "inspection-report",
      title: "File the inspection report",
      cue: "File the report: each defect by location, the photographs, the wind at the time and the platform check.",
      why: "The report turns a morning on the ropes into something the blade engineer and the next crew can act on — each finding located on the blade, photographed and dated, with the conditions it was seen in.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, WS3_ACCENT);

    const padTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#6b7075", base2: "#575c61" }), { repeat: 3, px: 256 });
    const apron = box(g, 6.4, 0.06, 4.8, 0, 0.03, 0, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(padTex, { rough: 0.8, metal: 0.3, color: WS3_PAL.ground });

    // Tower base behind, the blade parked straight down in front of it.
    const towerTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#dfe3e6"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "rgba(0,0,0,0.05)"; for (let i = 0; i < 10; i++) ctx.fillRect(0, i * h / 10, w, 2); }, { repeat: 1, px: 256 });
    const tower = cyl(g, 1.1, 1.3, 7, -1.8, 3.5, -2.8, 0xffffff, { rough: 0.5, seg: 20 });
    tower.material = texturedMat(towerTex, { rough: 0.5, metal: 0.2 });
    const blade = group(g, 0.4, 0, -1.6);
    const bladeTex = surfaceTexture((ctx, w, h) => { ctx.fillStyle = "#eef0f1"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "rgba(0,0,0,0.04)"; for (let i = 0; i < 300; i++) ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2); }, { repeat: 1, px: 256 });
    const shell = box(blade, 0.9, 5.2, 0.28, 0, 3.0, 0, 0xffffff, { rough: 0.4 });
    shell.material = texturedMat(bladeTex, { rough: 0.4, metal: 0.05 });
    box(blade, 0.5, 0.9, 0.24, 0, 0.8, 0, 0xd23a2a, { rough: 0.5 });
    const erosion = box(blade, 0.12, 0.6, 0.3, -0.45, 2.2, 0, 0x9a8a72, { rough: 0.9 });
    reg(hits, erosion, "leading-edge-erosion");
    const crack = box(blade, 0.03, 0.7, 0.3, 0.45, 2.6, 0, 0x2b2f34, { rough: 0.9 });
    reg(hits, crack, "trailing-edge-crack");
    const crackPoint = group(blade, 0.5, 2.6, 0.25);
    hits["crack-photo-point"] = crackPoint;
    const receptor = cyl(blade, 0.05, 0.05, 0.3, 0, 1.4, 0, 0x3a3027, { rough: 0.8, seg: 10 });
    receptor.rotation.x = Math.PI / 2;
    reg(hits, receptor, "receptor-burn");
    holoTag(blade, "blade (parked)", 0, 5.8, 0, { css: WS3_CSS, w: 0.34 });

    // The suspended platform beside the blade.
    const plat = group(g, 0.4, 0.3, -0.7);
    const plTex = surfaceTexture((ctx, w, h) => gratingFace(ctx, w, h, { base: "#8b949b", base2: "#6f777e" }), { repeat: 2, px: 200 });
    const deck = box(plat, 1.8, 0.06, 0.8, 0, 0, 0, 0xffffff, { rough: 0.7 });
    deck.material = texturedMat(plTex, { rough: 0.7, metal: 0.4 });
    for (const sx of [-0.88, 0.88]) for (const sz of [-0.38, 0.38]) box(plat, 0.04, 1.0, 0.04, sx, 0.5, sz, 0xf0b323, { rough: 0.5 });
    for (const sz of [-0.38, 0.38]) box(plat, 1.8, 0.04, 0.04, 0, 1.0, sz, 0xf0b323, { rough: 0.5 });
    for (const sx of [-0.88, 0.88]) box(plat, 0.04, 0.04, 0.8, sx, 1.0, 0, 0xf0b323, { rough: 0.5 });
    for (const sx of [-0.7, 0.7]) { cyl(plat, 0.01, 0.01, 6, sx, 3.8, 0, 0x9aa2a8, { rough: 0.4, metal: 0.6, seg: 6 }); box(plat, 0.18, 0.3, 0.2, sx, 1.2, -0.25, 0x3a4047, { rough: 0.5, metal: 0.4 }); }
    const hoistBrake = box(plat, 0.1, 0.1, 0.06, -0.7, 1.2, -0.12, 0xd2312b, { rough: 0.4 });
    reg(hits, hoistBrake, "hoist-brake-test");
    const overload = box(plat, 0.1, 0.1, 0.06, 0.7, 1.2, -0.12, 0xf2c14b, { rough: 0.4 });
    reg(hits, overload, "overload-device-check");
    const secondary = cyl(plat, 0.02, 0.02, 1.2, 0.8, 1.7, 0.1, 0x3fa7d6, { rough: 0.4, seg: 6 });
    reg(hits, secondary, "secondary-rope-check");
    const pendant = box(plat, 0.08, 0.16, 0.05, 0, 1.05, 0.42, 0x2b3138, { rough: 0.5 });
    holoTag(plat, "hoist pendant", 0, 1.3, 0.42, { css: WS3_CSS, w: 0.3 });
    reg(hits, pendant, "hoist-pendant");
    const downBtn = cyl(plat, 0.03, 0.03, 0.03, 0.12, 1.05, 0.44, 0x59c97b, { rough: 0.4, seg: 10 });
    downBtn.rotation.x = Math.PI / 2;
    holoTag(plat, "platform down", 0.3, 0.85, 0.44, { css: "#59c97b", w: 0.3 });
    reg(hits, downBtn, "platform-down-button");
    const descent = cyl(plat, 0.06, 0.06, 0.03, -0.3, 1.05, 0.42, 0x8b949b, { rough: 0.4, metal: 0.5, seg: 12 });
    descent.rotation.x = Math.PI / 2;
    holoTag(plat, "descent control", -0.4, 0.85, 0.44, { css: WS3_CSS, w: 0.32 });
    reg(hits, descent, "descent-control");
    const clearInst = instrument(plat, 0.6, 1.25, 0.4, { idle: "CLEAR", color: 0x2b2f34, w: 0.14, d: 0.03 });
    reg(hits, clearInst, "platform-clearance");
    holoTag(plat, "blade clearance", 0.6, 1.45, 0.4, { css: WS3_CSS, w: 0.32 });

    // Lifeline, tag lines, drop-zone barricade.
    const lifeline = cyl(g, 0.012, 0.012, 7, 1.6, 3.5, -0.9, 0x3fa7d6, { rough: 0.5, seg: 6 });
    void lifeline;
    const grab = box(g, 0.08, 0.14, 0.08, 1.6, 1.1, -0.9, 0xf2c14b, { rough: 0.5, metal: 0.4 });
    holoTag(g, "lifeline rope grab", 1.6, 1.35, -0.9, { css: WS3_CSS, w: 0.36 });
    reg(hits, grab, "lifeline-grab");
    const anchorPost = box(g, 0.2, 0.3, 0.2, -1.4, 0.15, 0.9, 0x5a6168, { rough: 0.6, metal: 0.4 });
    holoTag(g, "tag-line anchor", -1.4, 0.5, 0.9, { css: WS3_CSS, w: 0.32 });
    reg(hits, anchorPost, "tagline-anchor");
    cyl(g, 0.01, 0.01, 2.2, -0.6, 0.9, 0.1, 0xf07a1f, { rough: 0.6, seg: 6 }).rotation.z = 1.0;
    for (const [bx, bz] of [[-1.0, 0.6], [1.8, 0.6], [-1.0, -2.0], [1.8, -2.0]]) cyl(g, 0.04, 0.05, 0.9, bx, 0.45, bz, 0xf07a1f, { rough: 0.6, seg: 8 });
    for (const [bx, bz, w, d] of [[0.4, 0.6, 2.8, 0.03], [0.4, -2.0, 2.8, 0.03]]) box(g, w, 0.06, d, bx, 0.8, bz, 0xd2312b, { rough: 0.6 });

    // Base boards: plan, mast readout, rotor/park radio checks, report.
    const board = group(g, -2.4, 0, -0.4, 0.6);
    box(board, 0.7, 1.3, 0.05, 0, 0.65, 0, WS3_PAL.structure, { rough: 0.7 });
    const planFace = decal(board, 0.56, 0.36, 0, 1.05, 0.03, paperFace("PLATFORM PLAN", ["Blade per work order", "Platform limit per site procedure", "Rescue per rescue plan"], { scale: 0.72 }));
    holoTag(board, "platform plan", 0, 1.42, 0, { css: WS3_CSS, w: 0.3 });
    reg(hits, planFace, "platform-permit");
    const mast = instrument(board, 0, 0.55, 0.05, { idle: "MAST", color: 0x2b2f34, w: 0.2, d: 0.03 });
    holoTag(board, "met-mast wind", 0.42, 0.55, 0.05, { css: WS3_CSS, w: 0.3 });
    reg(hits, mast, "platform-wind-readout");
    const faultChip = box(board, 0.12, 0.06, 0.02, -0.2, 0.7, 0.06, 0x444444, { rough: 0.4 });
    const handheld = cyl(g, 0.04, 0.04, 0.2, -2.0, 0.9, 0.5, 0xf2c14b, { rough: 0.5, seg: 10 });
    holoTag(g, "handheld anemometer", -2.0, 1.15, 0.5, { css: WS3_CSS, w: 0.4 });
    reg(hits, handheld, "handheld-anemometer");
    const shelf = box(g, 0.6, 0.8, 0.4, -2.0, 0.4, 0.5, WS3_PAL.structure, { rough: 0.7 });
    void shelf;
    const radioObj = radio(g, 2.3, 0.9, 0.6);
    holoTag(g, "nacelle radio", 2.3, 1.15, 0.6, { css: WS3_CSS, w: 0.3 });
    const rotorCk = box(g, 0.14, 0.1, 0.02, 2.2, 1.35, 0.55, 0x3fa7d6, { rough: 0.5 });
    reg(hits, rotorCk, "rotor-lock-confirm");
    const parkCk = box(g, 0.14, 0.1, 0.02, 2.4, 1.35, 0.55, 0x59c97b, { rough: 0.5 });
    reg(hits, parkCk, "blade-park-confirm");
    holoTag(g, "rotor lock / blade park", 2.3, 1.6, 0.55, { css: WS3_CSS, w: 0.44 });
    const radioStand = box(g, 0.6, 0.84, 0.4, 2.3, 0.42, 0.6, WS3_PAL.structure, { rough: 0.7 });
    void radioStand;
    const horn = cyl(g, 0.05, 0.07, 0.2, 2.6, 0.95, 1.2, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(g, "air horn", 2.6, 1.2, 1.2, { css: "#d2312b", w: 0.22 });
    reg(hits, horn, "drop-zone-horn");
    const camera = group(g, 1.2, 0.85, 1.4);
    box(camera, 0.14, 0.1, 0.08, 0, 0, 0, 0x1b1e23, { rough: 0.5 });
    holoTag(camera, "camera + scale card", 0, 0.24, 0, { css: WS3_CSS, w: 0.4 });
    reg(hits, camera, "inspection-camera");
    const report = decal(g, 0.4, 0.3, -2.7, 1.1, 1.3, paperFace("INSPECTION REPORT", ["Defect / location ___", "Photos ___", "Wind at time ___"], { scale: 0.7 }));
    holoTag(g, "inspection report", -2.7, 1.4, 1.3, { css: WS3_CSS, w: 0.34 });
    reg(hits, report, "inspection-report");

    const decoy = (x, y, z, id, text) => {
      const d = box(g, 0.25, 0.25, 0.25, x, y, z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, text, x, y + 0.28, z, { css: "#d2312b", w: 0.44 });
      reg(hits, d, id);
    };
    decoy(-1.6, 1.8, -0.2, "go-over-limit", "go up anyway?");
    decoy(1.0, 1.9, 0.1, "unclipped-in-platform", "ride it unclipped?");
    decoy(0.4, 0.4, -1.2, "under-the-platform", "cut under the platform?");
    decoy(2.8, 1.5, -0.4, "rotor-unconfirmed", "rotor's probably locked?");

    const flash = box(g, 12, 4, 0.05, 0, 8, -12, 0xeef4ff, { emissive: 0xeef4ff, ei: 2, opacity: 0.6, transparent: true, cast: false });
    flash.visible = false;
    const hand = standingFigure(g, 3.0, 1.9, { ry: -2.4, cloth: 0x2b4f7f, vest: 0xf2c14b });
    toolChest(g, -2.9, 1.9);
    pickup(g, 4.4, 0, -1.6, { ry: -0.4, livery: { colour: 0xe9ecee, fleetName: "WIND SERVICE" } });
    holoPanel(g, 1.0, 0.6, -0.6, 0, 2.2, (ctx, w, h) => {
      ctx.fillStyle = "#06141c"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = WS3_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = "#e6f6ff";
      ctx.fillText("BLADE — THE WIND DECIDES", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ["Wind against the platform limit", "Rotor locked, blade parked", "Platform proven, lifeline on", "Find, photograph, report"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: 0.3, accent: WS3_ACCENT });

    let swing = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.6, -1.2),
      onStep() {},
      onFault(id) {
        if (id === "anemometer-fault") { faultChip.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.5 }); repaint(mast.userData.screen, signFace("FAULT", { bg: "#2a0d0d", accent: "#d2312b", fg: "#ffe9e9", scale: 0.5 })); }
      },
      onStepComplete(step) {
        if (step.id === "wind-go") repaint(mast.userData.screen, signFace("GO", { bg: "#0d1c14", accent: "#59c97b", fg: "#e9ffe9", scale: 0.55 }));
        if (step.id === "platform-raise") plat.position.y = 1.6;
        if (step.id === "platform-lower") plat.position.y = 0.3;
        if (step.id === "photograph") camera.position.set(0.9, 2.6, -1.3);
      },
      onInterrupt(it) {
        if (it.id === "drop-zone-entry") hand.position.set(0.8, 0, -0.8);
        if (it.id === "lightning-alert") { flash.visible = true; swing = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "drop-zone-entry") hand.position.set(3.0, 0, 1.9);
        if (it.id === "lightning-alert") { flash.visible = false; swing = false; plat.position.y = 0.3; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const drift = session?.step?.id === "platform-drift" || swing;
        plat.rotation.z = drift ? Math.sin(t * 1.4) * 0.04 : 0;
        if (session?.turn && session.step?.id === "platform-lower") descent.rotation.z = session.turn.amount * Math.PI * 2;
        void radioObj;
      },
    };
  },
};
