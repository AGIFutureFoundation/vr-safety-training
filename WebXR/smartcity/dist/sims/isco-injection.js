import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
  gradientFill, noiseTexture,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, valveWheel, surfaceTexture, pavingFace, deckPlateFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ ISCO Injection VR — Water & Environmental, station ninety-four.
//
// In-situ chemical oxidation of a groundwater plume on a generic parcel
// under a Record of Decision: permanganate mixed to the design concentration
// in a batch tank, pumped down an injection well through a manifold that was
// proven tight before anything left the tank, and watched the whole time it
// runs — because the two ways this goes wrong are the same two ways every
// injection job goes wrong. Too much pressure against a screen that has
// started to plug and the manifold is pushing toward a limit it was never
// tested past; too little control over where the oxidant actually goes and
// it finds a preferential pathway back to the surface instead of the plume.
// ITRC's ISCO guidance, the site's Record of Decision and the well permit
// are what set the design this crew is holding itself to; DOT's hazmat
// rules and the Regional Water Board's waste discharge requirements are
// what the empty totes and the rinse water still have to answer to on the
// way out.

const ISCO_ACCENT = 0x7d3fae;

/** Reusable canvas for the batch tank's poly shell: a dark, faintly ribbed
 * plastic with a chemical-stain bloom near the fill, not a flat colour. */
function ISCO_tankFace(g, w, h) {
  gradientFill(g, w, h, [[0, "#241830"], [1, "#180f22"]]);
  noiseTexture(g, w, h, { density: 1600, alpha: 0.06, tone: "0,0,0" });
  for (let y = 0; y < h; y += h / 14) {
    g.fillStyle = "rgba(0,0,0,0.12)";
    g.fillRect(0, y, w, 2);
  }
  g.fillStyle = "rgba(150,90,190,0.14)";
  try { g.beginPath(); g.ellipse(w * 0.5, h * 0.22, w * 0.22, h * 0.16, 0, 0, Math.PI * 2); g.fill(); } catch { g.fillRect(w * 0.3, h * 0.1, w * 0.4, h * 0.2); }
}

export const SIM_ISCO_INJECTION = {
  id: "isco-injection",
  index: "94",
  domain: "Water",
  trade: "In-situ chemical oxidation crew — LIUNA hazmat laborers, UA Local 38 pipefitters, IUOE stationary engineers",
  category: "Water & Environmental",
  weather: "overcast",
  certification: "OSHA HAZWOPER (29 CFR 1910.120) for everyone on the injection pad; ITRC's in-situ chemical oxidation guidance and the site's Record of Decision setting the design dose and pressure; the well permit governing the injection points; DOT hazmat rules for shipping the oxidant; the Regional Water Board's waste discharge requirements for the rinse water and spent totes",
  name: "ISCO Injection",
  title: simTitle("ISCO Injection"),
  tagline: "In-situ chemical oxidation of a groundwater plume: permanganate mixed to design in the batch tank, the manifold pressure-tested before it runs, the injection held at design pressure and flow while the neighbouring wells are watched for daylighting, and the spent totes and rinse handled as hazardous",
  accent: ISCO_ACCENT,
  accentCss: "#7d3fae",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "oxidant-contained", name: "Oxidant Contained", note: "The oxidant mixed to design, the manifold proven tight before it ran, the injection held in band with nothing daylighting, and the spent totes and rinse handled as hazardous" },

  game: system({
    name: "Oxidation Authority",
    currency: "PPM",
    ranks: ["Batch Hand", "Injection Crew", "Manifold Lead", "Plume Authority", "Oxidation Authority Certified"],
    badges: [
      { id: "design-dose", name: "Design Dose", note: "The batch mixed to design concentration and the manifold proven tight before the valve ever opened", test: AWARD.all(AWARD.stepClean("mix-oxidant"), AWARD.stepClean("pressure-test-manifold")) },
      { id: "never-surfaced", name: "Never Surfaced", note: "Nothing daylighted, nobody stood in the plume, and the manifold never ran past its tested limit", test: AWARD.safe },
      { id: "band-held", name: "Band Held", note: "Held the injection pressure and flow near band centre the whole run", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-injection", name: "Clean Injection", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "unbroken-hold", name: "Unbroken Hold", note: "Never dropped out of band through the whole injection", test: AWARD.unbroken },
      { id: "well-closed-early", name: "Well Closed Early", note: "Flushed, disconnected and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-chem-ppe": "You walked up to the batch tank to start mixing without the face shield and chemical gloves on. Permanganate splashed on skin or in an eye is a chemical burn, not a stain that washes off, and the PPE for this chemical exists precisely because the mixing step is the one point in the job where the oxidant is concentrated and unconfined in open air.",
    "premature-inject": "You opened the injection valve before the manifold had been pressure-tested. A joint that has never been tested is a joint whose first real pressure is the injection itself — if it lets go there, the oxidant is loose on the pad rather than contained in a system that was proven tight before anything left the batch tank.",
    "dump-rinse": "You tipped the manifold's rinse water into the ditch instead of drumming it. Rinse water off equipment that just carried concentrated permanganate is not clean water with a tint — it is oxidant in solution, and the Regional Water Board's waste discharge requirements do not treat 'it was already diluted' as a reason it can bypass the drum.",
    "stand-in-plume": "You walked through the puddle where oxidant had surfaced instead of staying clear of it. That puddle is exactly what daylighting looks like from the ground — a strong oxidizer sitting on bare soil in a place nobody is watching it — and standing in it is not how anyone finds out where it actually came from.",
  },

  lateNotes: {
    "injection-valve": "Nothing to inject yet — the manifold has to be connected and pressure-tested before this valve does anything but sit there.",
    "injection-manifold": "The manifold isn't running yet — open the injection valve and bring the pressure and flow up to design first.",
    "flush-valve": "Too early to flush — the injection has to actually be done and logged before the manifold has anything left in it worth rinsing out.",
    "drum-containers": "Nothing to drum yet — flush and disconnect the manifold first, so the totes that are actually spent are the ones going in the drum.",
  },

  // Both interruptions are armed on a track or a hold step, long enough for
  // the fuse to actually catch the learner mid-task, and each is answered on
  // a control other than the host step's own — an interruption solved by
  // the control already in hand is not an interruption.
  interrupts: [
    {
      id: "pressure-climb",
      kind: "Manifold pressure climbing",
      after: "run-injection", delay: 4, seconds: 14,
      alert: "The manifold pressure gauge is climbing past design and still rising — the well screen is plugging and the pump is pushing against it instead of into the formation.",
      cue: "Crack the relief valve before the manifold reaches its tested limit.",
      target: "pressure-relief-valve",
      why: "The manifold was pressure-tested to a limit, not designed to run past it, and a plugging screen does not stop the pump from pushing — it just moves where that pressure goes. The relief valve is the only path that pressure has that is not through a joint the test never proved past this point.",
      missNote: "The pressure kept climbing past its tested limit with the relief valve never touched, and a manifold pushed past what it was proven to hold has no reading left to tell you how close it was to letting go.",
      wrongNote: "Not that — the relief valve is what takes the pressure off before the manifold finds its own limit for you.",
    },
    {
      id: "oxidant-daylighting",
      kind: "Oxidant daylighting",
      after: "sustain-injection", delay: 4, seconds: 14,
      alert: "A dark purple stain has appeared on the ground beside the well — the oxidant is surfacing through a path nobody designed, not going where the injection plan sent it.",
      cue: "Shut the injection down at the well right now.",
      target: "injection-stop",
      why: "Daylighting means the injection has found a way back to the surface instead of into the plume it was aimed at, and every gallon that keeps going down the well after that is a gallon reinforcing a pathway nobody chose rather than treating anything. Stopping at the wellhead is the only response that actually addresses where the oxidant is going.",
      missNote: "The injection kept running while permanganate kept surfacing beside the well, spreading further across bare ground with every gallon that kept going down hole after the pathway had already shown itself.",
      wrongNote: "Not that — shut the injection down at the wellhead. Nothing else in the plan does anything while the pump is still pushing.",
    },
  ],

  steps: [
    {
      id: "read-workplan", kind: "select", target: "workplan-board",
      title: "Read the injection work plan and the well layout",
      cue: "Check the design dose, the injection pressure and flow limits, and which wells this pass covers before anything is mixed.",
      why: "The Record of Decision and the ITRC-based work plan behind it are what set the concentration, the pressure limit and the well sequence for today — none of that is a judgment call made fresh at the batch tank, it is a design somebody already proved out before this crew ever showed up.",
    },
    {
      id: "ppe-chem", kind: "sequence", anyOrder: true,
      targets: ["chem-suit", "face-shield", "chem-gloves"],
      itemNames: { "chem-suit": "chemical-resistant suit", "face-shield": "face shield", "chem-gloves": "chemical gloves" },
      title: "Suit up for the oxidant",
      cue: "Chemical suit, face shield and chemical gloves before anyone opens a tote of permanganate.",
      why: "Permanganate concentrate is a strong oxidizer that stains and burns on contact, and the mixing step is the one point in this job where it is open to air and unconfined — the suit, shield and gloves are what stand between a splash and a chemical burn, not a formality before the interesting part starts.",
    },
    {
      id: "mix-oxidant", kind: "track", target: "batch-mixer", seconds: 8,
      title: "Mix the oxidant to design concentration",
      cue: "Hold the mixer's feed rate steady in the band until the batch reads at design concentration.",
      why: "Too fast and the concentrate clumps at the bottom of the tank instead of dissolving even, leaving the batch weaker than the reading says; too slow and the shift runs long mixing a batch that was ready minutes ago. Steady, in the band, is what makes the concentration on the readout the concentration actually going down the well.",
      track: {
        start: 0.1, green: [0.42, 0.6], rise: 0.5, fall: 0.45, drift: 0.12, label: "MIX RATE",
        readout: (v) => (v < 0.42 ? "concentrate settling out" : v > 0.6 ? "mixing too hard — splashing the tank" : "mixing to design"),
      },
      holdBreakNote: "Mix rate ran out of band — either the concentrate is settling out uneven or the tank is splashing hard enough to put the oxidant somewhere other than in solution. Bring it back into the band and hold.",
    },
    {
      id: "connect-manifold", kind: "drag", target: "manifold-hose",
      title: "Connect the injection manifold to the well",
      cue: "Carry the manifold hose from the batch tank to the wellhead and seat it on the fitting.",
      why: "The manifold is what carries the batch from a tank open to air into a sealed system running straight down the well — a hose set down beside the fitting instead of seated on it is a connection the pressure test is about to find, one way or the other.",
      drag: { to: "wellhead-socket", radius: 0.42, missNote: "Not seated on the fitting — a manifold that is not square on the wellhead will not hold pressure and will not run true." },
    },
    {
      id: "pressure-test-manifold", kind: "gauge", target: "test-gauge",
      title: "Pressure-test the manifold",
      cue: "Bring the test pump up and commit on the pressure the manifold holds.",
      why: "This is the moment a bad joint costs nothing — the manifold is dry and idle, not carrying oxidant, so a fitting that will not hold is found here instead of found live, with concentrate already moving through it toward whatever gave way.",
      gauge: {
        label: "MANIFOLD TEST", speed: 0.65, green: [0.55, 0.78],
        readout: (t) => `${Math.round(t * 90)} psi`,
        missNote: "The manifold did not hold the test. Find the joint before permanganate goes anywhere near this system.",
      },
    },
    {
      id: "open-injection-valve", kind: "turn", target: "injection-valve",
      title: "Open the injection valve",
      cue: "Wind the injection valve open now the manifold is proven tight.",
      why: "The valve opens only after the pressure test says the system downstream of it can take the flow — opening it on an untested manifold puts the first real pressure this system has ever seen straight through a joint nobody has proven yet.",
      turn: { turns: 0.6, axis: "y", label: "INJECTION VALVE" },
    },
    {
      id: "run-injection", kind: "track", target: "injection-valve", seconds: 9,
      title: "Bring the injection up to design pressure and flow",
      cue: "Hold the manifold's pressure and flow steady in the band as the batch feeds down the well.",
      why: "Design pressure and flow are what the work plan calculated to move the oxidant into the plume without pushing it somewhere the plan did not intend — running hot moves more product but risks fracturing a path to the surface, and running light just means the pass does not deliver what the design assumed it would.",
      track: {
        start: 0.15, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.13, label: "MANIFOLD PSI",
        readout: (v) => (v < 0.4 ? "below design — check the pump" : v > 0.62 ? "climbing past design" : "holding at design"),
      },
      holdBreakNote: "Pressure ran out of band — either the pump is starving or the screen is starting to load up. Bring it back into the band and hold.",
    },
    {
      id: "sustain-injection", kind: "hold", target: "injection-manifold", seconds: 8,
      title: "Sustain the injection and watch the monitoring wells",
      cue: "Hold the manifold running at design while keeping an eye on the neighbouring monitoring wells for anything surfacing.",
      why: "A pass that stays in band for a few seconds and then wanders is not the same as one that holds through the whole volume the design calls for — this is the stretch where a preferential pathway actually shows itself, which is exactly why the monitoring wells are being watched the entire time the manifold is running, not just at the end.",
      holdBreakNote: "Let go of the manifold before the hold finished — an injection that gets left partway through is a well that received less than the design called for with nobody watching the wells for the rest of it.",
    },
    {
      id: "check-monitoring-wells", kind: "find", noHint: true,
      targets: ["mw-1", "mw-2"],
      itemNames: { "mw-1": "monitoring well MW-1", "mw-2": "monitoring well MW-2" },
      itemNotes: {
        "mw-1": "Dry and clear at MW-1 — no oxidant reached this well during the pass, which is what the design's radius of influence predicted.",
        "mw-2": "Dry and clear at MW-2 — the far monitoring well, and the one that would show a pathway wider than the design assumed before the near well ever would.",
      },
      title: "Confirm both monitoring wells stayed clear",
      cue: "Walk to both neighbouring monitoring wells and confirm neither one shows oxidant.",
      why: "The injection well only tells you what left the manifold; the monitoring wells are what tell you where it actually went — a pass that looked clean at the wellhead has not really been checked until the wells around it confirm the plume stayed where the design put it.",
    },
    {
      id: "log-volume", kind: "select", target: "volume-log-board",
      title: "Log the volume against design",
      cue: "Enter the volume actually injected at this well against the design volume on the injection log.",
      why: "The next well in the sequence and the next pass at this one are both planned off what the log says actually went in the ground here — a volume that is remembered instead of logged is a number the next crew has no way to check.",
    },
    {
      id: "flush-manifold", kind: "hold", target: "flush-valve", seconds: 5,
      title: "Flush the manifold",
      cue: "Hold the flush valve open until clean water runs the length of the manifold.",
      why: "Concentrate left standing in the hose and fittings keeps working on the gaskets and the threads long after the injection is done — flushing to clean water is what the manifold gets to sit idle in until the next well, instead of sitting in the same oxidant it just delivered.",
      holdBreakNote: "Cut the flush short — the line was still running tinted when it stopped. Hold it until it actually runs clear.",
    },
    {
      id: "disconnect-manifold", kind: "drag", target: "manifold-hose",
      title: "Disconnect the manifold",
      cue: "Unseat the manifold hose from the wellhead and carry it back to the reel.",
      why: "A flushed manifold left connected to a well that is done for the day is just a hose in the way of the next crew — disconnecting it and reeling it in is what actually closes out this well rather than leaving it half put away.",
      drag: { to: "hose-reel-socket", radius: 0.42, missNote: "Not on the reel — a hose dropped beside it is still a tripping hazard on a pad that is supposed to be closed out." },
    },
    {
      id: "handle-waste", kind: "sequence",
      targets: ["drum-containers", "drum-rinse"],
      itemNames: { "drum-containers": "drum the spent containers", "drum-rinse": "drum the rinse water" },
      title: "Handle the spent totes and rinse as hazardous",
      cue: "Drum the empty oxidant totes, then the rinse water, both labeled hazardous.",
      why: "An empty tote and the water that rinsed it both carry enough residual oxidant that neither one is ordinary trash — the Regional Water Board's waste discharge requirements and DOT's hazmat rules both start counting the moment this stuff leaves the pad, not whenever it is convenient to drum it.",
      outOfOrderNote: "Containers first, then the rinse — the totes are what the rinse water came from, and logging them in that order is what keeps the waste manifest matched to what actually happened here.",
    },
    {
      id: "walk-pad", kind: "find", noHint: true,
      targets: ["loose-cam-lock", "unlabeled-tote"],
      itemNames: { "loose-cam-lock": "a loose cam-lock fitting", "unlabeled-tote": "an unlabeled spent tote" },
      itemNotes: {
        "loose-cam-lock": "That cam-lock arm isn't latched. A fitting that looks connected but isn't is exactly what turns into a weep or a spray the next time this manifold sees pressure.",
        "unlabeled-tote": "That tote never got a hazardous-waste label. A drum with permanganate residue and no label is a mislabeled hazard to whoever finds it next, on this pad or off it.",
      },
      title: "Walk the pad before you leave",
      cue: "Look over the manifold connections and the waste area, and click whatever still needs fixing before this well is closed out.",
      why: "The injection is the interesting part of the shift and these two are the part that gets missed: a fitting that has to hold the next time somebody pressurizes it, and a label that has to already be there the next time somebody has to know what is in that drum.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, ISCO_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.4, 0, 0.07, 0, 0xffffff, { rough: 0.94 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4a4438", base2: "#3d382e", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.94, metal: 0.02, color: 0xbdb69f },
    );

    // -------------------------------------------------------- injection pad
    // A raised, textured steel deck under the manifold and wellhead — the
    // "textured pad" the work is actually staged on, not bare ground.
    const pad = box(g, 2.0, 0.1, 1.6, -0.4, 0.05, -0.3, 0xffffff, { rough: 0.55, metal: 0.5, cast: false });
    pad.material = texturedMat(
      surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h), { repeat: 6, px: 256 }),
      { rough: 0.5, metal: 0.5, color: 0xb9bfc5 },
    );

    // -------------------------------------------------------------- work plan
    const planGroup = group(g, -2.6, 0.14, 1.7, 0.4);
    holoPanel(planGroup, 0.68, 0.46, 0, 1.08, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1c1226"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#a679d8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#f1e4fb"; ctx.fillText("ISCO INJECTION WORK PLAN", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#e2cdf5";
      ["Design dose: 4% KMnO4", "Design pressure: 45-60 psi", "Wells this pass: IW-6"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: ISCO_ACCENT });
    const planHit = box(planGroup, 0.68, 0.46, 0.04, 0, 1.08, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, planHit, "workplan-board");

    // ----------------------------------------------------------- PPE rack
    const ppeRack = group(g, -1.9, 0.14, 1.6, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const suitProp = box(ppeRack, 0.22, 0.3, 0.02, 0, 0.58, 0, 0xf1e4fb, { rough: 0.75 });
    holoTag(suitProp, "chemical suit", 0, 0.22, 0, { css: "#a679d8", w: 0.32 });
    reg(hits, suitProp, "chem-suit");
    const shieldProp = group(ppeRack, 0.2, 0.66, 0.05);
    box(shieldProp, 0.14, 0.16, 0.01, 0, 0, 0, 0xbfe3f0, { rough: 0.35, metal: 0.1, opacity: 0.6, transparent: true });
    holoTag(shieldProp, "face shield", 0, 0.16, 0, { css: "#a679d8", w: 0.3 });
    reg(hits, shieldProp, "face-shield");
    const glovesProp = group(ppeRack, -0.22, 0.5, 0.03);
    box(glovesProp, 0.08, 0.16, 0.02, 0, 0, 0, 0x6a3fa0, { rough: 0.75 });
    holoTag(glovesProp, "chemical gloves", 0, 0.14, 0, { css: "#a679d8", w: 0.34 });
    reg(hits, glovesProp, "chem-gloves");

    // ------------------------------------------------------------ batch tank
    const batch = group(g, -1.0, 0.14, -1.5, 0.3);
    const tankShell = cyl(batch, 0.34, 0.36, 1.1, 0, 0.58, 0, 0xffffff, { rough: 0.55, metal: 0.15, seg: 22, cast: true });
    tankShell.material = texturedMat(
      surfaceTexture((cx, w, h) => ISCO_tankFace(cx, w, h), { repeat: 2, px: 384 }),
      { rough: 0.55, metal: 0.1, color: 0xb597d6 },
    );
    cyl(batch, 0.36, 0.02, 0.24, 0, 1.25, 0, 0x2b2130, { rough: 0.55, metal: 0.2, seg: 22 });
    const mixerMotor = group(batch, 0, 1.32, 0);
    box(mixerMotor, 0.18, 0.16, 0.18, 0, 0, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    holoTag(batch, "batch mixer", 0, 1.5, 0, { css: "#a679d8", w: 0.32 });
    reg(hits, mixerMotor, "batch-mixer");
    const shaft = cyl(batch, 0.014, 0.014, 1.0, 0, 0.8, 0, CITY.steel, { rough: 0.4, metal: 0.8, seg: 8 });
    const paddle = box(batch, 0.22, 0.02, 0.03, 0, 0.32, 0, CITY.steel, { rough: 0.4, metal: 0.7 });
    const batchGauge = instrument(batch, 0.28, 0.7, 0.24, { ry: 0.6, idle: "-- % design", color: ISCO_ACCENT, w: 0.13, d: 0.18 });
    holoTag(batch, "concentration readout", 0.28, 0.88, 0.24, { css: "#a679d8", w: 0.5 });
    void shaft; void paddle;

    // Manifold hose, staged coiled on the batch skid until it is carried in.
    const manifoldHose = group(g, -0.35, 0.14, -1.7, 0.5);
    torus(manifoldHose, 0.13, 0.025, 0, 0.14, 0, 0x2b2f34, { rough: 0.5, metal: 0.4, seg: 8, seg2: 20 });
    holoTag(manifoldHose, "injection manifold hose", 0, 0.34, 0, { css: "#a679d8", w: 0.5 });
    reg(hits, manifoldHose, "manifold-hose");

    // ------------------------------------------------------------- wellhead
    const wellD = 0.18;
    const well = group(g, 0.6, 0.14, -0.5);
    cyl(well, 0.1, 0.1, 0.4, 0, 0.2, 0, 0x6f7a83, { rough: 0.55, metal: 0.5, seg: 16 });
    holoTag(well, "injection well IW-6", 0, 0.6, 0, { css: "#a679d8", w: 0.44 });
    const wellheadSocket = group(well, 0, 0.36, 0.14);
    hits["wellhead-socket"] = wellheadSocket;

    const manifoldStack = group(well, 0.24, 0.16, 0);
    box(manifoldStack, 0.24, 0.28, 0.24, 0, 0.14, 0, 0x3f4c54, { rough: 0.55, metal: 0.45 });
    const testGaugeInst = instrument(manifoldStack, -0.2, 0.24, 0.02, { idle: "-- psi", color: 0x2b3138, w: 0.14, d: 0.14 });
    holoTag(manifoldStack, "test gauge", -0.2, 0.42, 0.02, { css: "#a679d8", w: 0.3 });
    reg(hits, testGaugeInst, "test-gauge");
    const injValve = valveWheel(manifoldStack, 0.2, 0.3, 0, { color: 0x8a4fb8, body: 0x2f3740, r: 0.1 });
    holoTag(manifoldStack, "injection valve", 0.2, 0.52, 0, { css: "#a679d8", w: 0.4 });
    reg(hits, injValve.userData.wheel, "injection-valve");
    const manifoldRun = instrument(manifoldStack, 0, 0.5, 0.14, { idle: "-- psi", color: ISCO_ACCENT, w: 0.15, d: 0.2 });
    holoTag(manifoldStack, "manifold pressure", 0, 0.68, 0.14, { css: "#a679d8", w: 0.44 });
    reg(hits, manifoldRun, "injection-manifold");
    const reliefValve = valveWheel(manifoldStack, -0.24, 0.42, 0.14, { color: 0xf2c14b, body: 0x2f3740, r: 0.08, ry: -0.6 });
    holoTag(manifoldStack, "relief valve", -0.24, 0.64, 0.14, { css: "#f2c14b", w: 0.32 });
    reg(hits, reliefValve.userData.wheel, "pressure-relief-valve");
    // Pressure strobe on the manifold stack — dark until the pressure-climb
    // interruption fires, so the scene itself changes and not only the
    // gauge's own canvas repainting.
    const pressureStrobe = ball(manifoldStack, 0.03, 0, 0.7, 0.14, 0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.5 });
    const flushValveWheel = valveWheel(manifoldStack, 0, 0.24, -0.16, { color: 0x59a3ac, body: 0x2f3740, r: 0.07, ry: 1.2 });
    holoTag(manifoldStack, "flush valve", 0, 0.44, -0.16, { css: "#a679d8", w: 0.3 });
    reg(hits, flushValveWheel.userData.wheel, "flush-valve");
    const stopStack = group(well, -0.22, 0.44, 0);
    box(stopStack, 0.14, 0.14, 0.01, 0, 0, 0, 0xd2312b, { rough: 0.6 });
    decal(stopStack, 0.12, 0.12, 0, 0, 0.006, signFace("STOP", { bg: "#7a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(stopStack, "injection stop", 0, 0.2, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, stopStack, "injection-stop");
    const hoseReel = group(g, 1.4, 0.14, -1.3, -0.6);
    cyl(hoseReel, 0.14, 0.14, 0.1, 0, 0.16, 0, 0x8a5a1a, { rough: 0.6, seg: 16 });
    holoTag(hoseReel, "hose reel", 0, 0.34, 0, { css: "#a679d8", w: 0.28 });
    hits["hose-reel-socket"] = hoseReel;

    // Daylighting stain — dark and dry until the interruption fires.
    const daylight = box(well, 0.4, 0.006, 0.32, 0.5, 0.006, 0.35, 0x2b2130, { rough: 0.3, metal: 0.1, opacity: 0.0, transparent: true, cast: false });
    const stainZone = box(well, 0.4, 0.1, 0.32, 0.5, 0.05, 0.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, stainZone, "stand-in-plume");
    const premature = box(well, 0.2, 0.2, 0.2, 0.24, 0.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, premature, "premature-inject");

    // -------------------------------------------------------- monitoring wells
    const mw1 = group(g, 2.0, 0.14, 0.6);
    cyl(mw1, 0.06, 0.06, 0.35, 0, 0.17, 0, 0x8a949d, { rough: 0.55, metal: 0.4, seg: 14 });
    holoTag(mw1, "MW-1", 0, 0.42, 0, { css: "#a679d8", w: 0.24 });
    reg(hits, mw1, "mw-1");
    const mw2 = group(g, -2.3, 0.14, -1.0);
    cyl(mw2, 0.06, 0.06, 0.35, 0, 0.17, 0, 0x8a949d, { rough: 0.55, metal: 0.4, seg: 14 });
    holoTag(mw2, "MW-2", 0, 0.42, 0, { css: "#a679d8", w: 0.24 });
    reg(hits, mw2, "mw-2");

    // -------------------------------------------------------- log + waste area
    const logBoard = group(g, 1.9, 0.14, 1.6, -0.4);
    const logPanel = holoPanel(logBoard, 0.66, 0.44, 0, 1.05, 0, (ctx, w, h) => {
      ctx.fillStyle = "#1c1226"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#a679d8"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#f1e4fb"; ctx.fillText("INJECTION VOLUME LOG", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#e2cdf5";
      ["IW-6 design: 220 gal", "Actual: ____ gal", "MW-1 / MW-2: ____"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.16)));
    }, { accent: ISCO_ACCENT });
    const logHit = box(logBoard, 0.66, 0.44, 0.04, 0, 1.05, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, logHit, "volume-log-board");

    const wasteArea = group(g, 2.4, 0.14, -0.6);
    const totesDrum = group(wasteArea, 0, 0, 0);
    cyl(totesDrum, 0.22, 0.22, 0.55, 0, 0.28, 0, 0x6a3fa0, { rough: 0.6, metal: 0.25, seg: 18 });
    decal(totesDrum, 0.3, 0.14, 0.24, 0.32, 0, signFace("HAZARDOUS WASTE\nSPENT KMnO4 TOTES", { bg: "#1c1226", accent: "#e2cdf5", scale: 0.32 }));
    holoTag(totesDrum, "spent totes", 0, 0.62, 0, { css: "#a679d8", w: 0.34 });
    reg(hits, totesDrum, "drum-containers");
    const rinseDrum = group(wasteArea, 0.5, 0, 0.15);
    cyl(rinseDrum, 0.2, 0.2, 0.5, 0, 0.25, 0, 0x8a949d, { rough: 0.6, metal: 0.3, seg: 18 });
    decal(rinseDrum, 0.26, 0.12, 0.22, 0.28, 0, signFace("HAZARDOUS WASTE\nRINSE WATER", { bg: "#1c1226", accent: "#e2cdf5", scale: 0.32 }));
    holoTag(rinseDrum, "rinse water drum", 0, 0.55, 0, { css: "#a679d8", w: 0.36 });
    reg(hits, rinseDrum, "drum-rinse");
    const ditch = box(wasteArea, 0.5, 0.03, 0.3, -0.6, -0.03, 0.2, 0x2b2f34, { rough: 0.7, cast: false });
    holoTag(wasteArea, "site ditch — not for rinse", -0.6, 0.14, 0.2, { css: "#d2312b", w: 0.6 });
    const dumpHazard = box(ditch, 0.4, 0.1, 0.24, 0, 0.06, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, dumpHazard, "dump-rinse");

    // Cam-lock fitting and mislabeled tote for the final walk.
    const camLock = box(manifoldStack, 0.06, 0.03, 0.03, 0.14, 0.02, 0.14, 0x8a949d, { rough: 0.5, metal: 0.6 });
    reg(hits, camLock, "loose-cam-lock");
    const strayTote = group(g, 2.1, 0.14, -1.2);
    cyl(strayTote, 0.16, 0.16, 0.4, 0, 0.2, 0, 0x8a4fb8, { rough: 0.65, seg: 14 });
    reg(hits, strayTote, "unlabeled-tote");

    // ------------------------------------------------------------- ppe skip
    const skipZone = box(batch, 0.4, 0.5, 0.4, 0, 0.4, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(batch, "start mixing without suiting up?", 0, 0.9, 0.3, { css: "#d2312b", w: 0.62 });
    reg(hits, skipZone, "skip-chem-ppe");

    // ------------------------------------------------------------- ground crew
    const lead = standingFigure(g, -0.1, -0.95, { ry: 0.6, cloth: 0x2b3138, vest: 0xa679d8, helmet: 0xf2f2f2 });
    holoTag(lead, "injection lead", 0, 1.95, 0.15, { css: "#a679d8", w: 0.36 });
    standingFigure(g, 2.6, 1.1, { ry: -2.3, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });

    cone(g, -2.7, 2.4, { color: ISCO_ACCENT }); cone(g, 2.7, 2.4, { color: ISCO_ACCENT });
    barrierPanel(g, 0.6, -1.6, { color: ISCO_ACCENT, w: 1.3 });
    toolChest(g, -2.6, -1.7, { ry: 0.6, color: 0x8a5a1a });

    const vapor = particles(g, 20, 0xdcc7ee, { size: 0.02, life: 0.6, additive: false, opacity: 0.3 });

    // -------------------------------------------------------------- live state
    let pressureHigh = false, daylighting = false, injecting = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.0, -0.4),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "mix-oxidant") repaint(batchGauge.userData.screen, signFace("100% design", { bg: "#180f22", accent: "#c99bef", fg: "#f1e4fb", scale: 0.5 }));
        if (step.id === "connect-manifold") { manifoldHose.parent.remove(manifoldHose); wellheadSocket.add(manifoldHose); manifoldHose.position.set(0, 0.02, 0); manifoldHose.scale.set(0.7, 0.7, 0.7); }
        if (step.id === "pressure-test-manifold") repaint(testGaugeInst.userData.screen, signFace("HELD", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }));
        if (step.id === "open-injection-valve") { injValve.userData.wheel.rotation.z = 1.1; }
        if (step.id === "run-injection") { injecting = true; }
        if (step.id === "sustain-injection") repaint(manifoldRun.userData.screen, signFace("52 psi", { bg: "#180f22", accent: "#c99bef", fg: "#f1e4fb", scale: 0.55 }));
        if (step.id === "flush-manifold") { injecting = false; repaint(manifoldRun.userData.screen, signFace("0 psi", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 })); }
        if (step.id === "disconnect-manifold") { manifoldHose.parent.remove(manifoldHose); hoseReel.add(manifoldHose); manifoldHose.position.set(0, 0.1, 0); manifoldHose.scale.set(1, 1, 1); }
        if (step.id === "handle-waste") { strayTote.material = mat(0x6a3fa0, { rough: 0.65 }); }
      },
      onInterrupt(it) {
        if (it.id === "pressure-climb") {
          pressureHigh = true;
          pressureStrobe.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 2.4, rough: 0.4 });
          repaint(manifoldRun.userData.screen, signFace("78 psi !", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.55 }));
        }
        if (it.id === "oxidant-daylighting") {
          daylighting = true;
          daylight.material = mat(0x7d3fae, { opacity: 0.85, transparent: true, rough: 0.3 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "pressure-climb") {
          pressureHigh = false;
          pressureStrobe.material = mat(0x2b2f34, { emissive: 0x2b2f34, ei: 0.2, rough: 0.5 });
          repaint(manifoldRun.userData.screen, signFace("52 psi", { bg: "#180f22", accent: "#c99bef", fg: "#f1e4fb", scale: 0.55 }));
        }
        if (it.id === "oxidant-daylighting") {
          daylighting = false;
          injecting = false;
          daylight.material = mat(0x2b2130, { opacity: 0.0, transparent: true, rough: 0.3 });
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        mixerMotor.rotation.y = t * 3;
        if (injecting) { vapor.visible = true; vapor.userData.step(dt, new THREE.Vector3(0.6, 0.4, -0.5), 0.06, 0.4, 0.2); } else vapor.visible = false;
        if (pressureHigh) pressureStrobe.material.emissiveIntensity = Math.floor(t * 4) % 2 === 0 ? 2.4 : 0.2;
        void daylighting;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "pressure-test-manifold") {
          repaint(testGaugeInst.userData.screen, signFace(`${Math.round(gg.t * 90)} psi`, { bg: "#0d1c24", accent: gg.t >= 0.55 && gg.t <= 0.78 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
        if (session?.track && (step?.id === "mix-oxidant" || step?.id === "run-injection")) {
          const v = session.track.v;
          if (step.id === "mix-oxidant") repaint(batchGauge.userData.screen, signFace(`${Math.round(v * 160)}% design`, { bg: "#180f22", accent: v > 0.42 && v < 0.6 ? "#c99bef" : "#f0645b", fg: "#f1e4fb", scale: 0.5 }));
          if (step.id === "run-injection") repaint(manifoldRun.userData.screen, signFace(`${Math.round(v * 130)} psi`, { bg: "#180f22", accent: v > 0.4 && v < 0.62 ? "#c99bef" : "#f0645b", fg: "#f1e4fb", scale: 0.55 }));
        }
      },
    };
  },
};
