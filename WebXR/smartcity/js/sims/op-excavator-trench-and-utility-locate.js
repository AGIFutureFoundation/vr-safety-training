import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { excavator } from "../../../shared/equipment.js";
import { cableSpool, dumpster } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Excavator Trench & Utility Locate VR — its own gamified
// system: Dig Command.
//
// The IUOE excavator operator's own procedure for opening a utility trench:
// the locate ticket read and the paint on the ground actually verified
// against it, the swing radius barricaded before the house ever slews, the
// quick coupler locked before the bucket is trusted, the last foot of cover
// over a marked line exposed by hand or vacuum before the bucket goes near
// it, and a spotter and a grade checker both doing jobs the operator's own
// seat cannot do alone. No clause number, depth or reading here is one this
// platform is not certain of; the specifics of any real dig live on that
// job's own locate ticket and excavation permit.

const EXU_ACCENT = 0xdba428;

export const SIM_OP_EXCAVATOR_TRENCH_AND_UTILITY_LOCATE = {
  id: "op-excavator-trench-and-utility-locate",
  index: "op-1",
  domain: "Construction",
  trade: "Excavator operator — IUOE Local 3 operating engineer",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "IUOE Local 3 operating engineer training; OSHA 29 CFR 1926 Subpart P Excavations and 29 CFR 1926 Subpart O Motor vehicles, mechanized equipment, and marine operations; 29 CFR 1926.21 safety training and education; NIOSH fatality-investigation findings on struck-by and utility-strike incidents",
  name: "Excavator Trench & Utility Locate",
  title: simTitle("Excavator Trench & Utility Locate"),
  tagline: "Excavator trenching over a located utility: the ticket verified against the paint, the swing radius barricaded, the coupler locked, the line hand-exposed, and a spotter and grade checker both doing their own job",
  accent: EXU_ACCENT,
  accentCss: "#dba428",
  parSeconds: 280,
  footprint: 2.6,
  badge: { id: "dig-command", name: "Dig Command", note: "Locate verified, swing radius held, coupler locked, and the line exposed before the bucket ever went near it" },

  game: system({
    name: "Dig Command",
    currency: "DIG",
    ranks: ["Ground Hand", "Excavator Hand", "Locate Certified", "Swing Authority", "Dig Command Certified"],
    badges: [
      { id: "locate-first", name: "Locate First", note: "Never cut before the locate marks were checked against the ticket", test: AWARD.stepClean("verify-marks") },
      { id: "swing-held", name: "Swing Held", note: "Never let anyone stand in the swing radius", test: AWARD.safe },
      { id: "coupler-sure", name: "Coupler Sure", note: "Lock the coupler clean, first try", test: AWARD.stepClean("coupler-lock") },
      { id: "steady-cut", name: "Steady Cut", note: "Hold the gauge readings near band centre all shift", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "quick-open", name: "Quick Open", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "clean-shift", name: "Clean Shift", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "dig-streak", name: "Dig Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  supportLine: "your IUOE local's member assistance programme, or the site's employee assistance line if a near miss on this cut is what stayed with you",

  hazards: {
    "swing-radius-stand": "You are standing inside the excavator's swing radius while the house is rigged to slew. The counterweight sweeps that space at head height with no warning a person on foot can react to in time, which is why the radius has to be barricaded before the machine ever swings, not watched for by whoever happens to be standing nearby.",
    "unverified-dig-zone": "You are cutting into ground the locate ticket covers before the paint on it was actually checked against that ticket. A buried gas or electric line gives the bucket no warning before it is struck, and the operator finds out the same second everyone downstream of that line does.",
    "coupler-release": "That is the coupler's manual release, not its lock indicator. Pressing it before the pins are confirmed engaged is exactly how a bucket lets go of the stick mid-swing, with nothing underneath it but whoever happens to be in the way when it drops.",
    "spoil-surcharge": "That spoil is piled back onto the very edge you just cut. The extra surcharge weight sitting right at the crest is what turns a wall that would otherwise have held its own weight into one that lets go without any further warning at all.",
  },

  lateNotes: {
    "vac-hose": "The line gets hand- or vacuum-exposed before the bucket goes anywhere near it, not after the bucket has already found out where it is the hard way.",
    "grade-rod": "The grade checker reads the rod against the plan invert while the cut is still open and easy to correct, not after the pipe is already laid to whatever depth the bucket happened to stop at.",
  },

  interrupts: [
    {
      id: "blind-side-worker",
      kind: "Blind-side worker",
      after: "dig-cut", delay: 4, seconds: 12,
      alert: "A second crew member has walked up the blind side of the house to grab a tool, right where the counterweight sweeps.",
      cue: "Stop the cut and get the spotter to move them clear before the house swings again.",
      target: "spotter",
      why: "The cab's mirrors never fully cover the blind quadrant behind the counterweight, which is exactly why a spotter's whole job is watching ground the operator physically cannot see. Calling the spotter the instant someone appears in that quadrant is the only control that catches a person the seat itself cannot.",
      missNote: "The house swung through the blind quadrant with a coworker still standing in it. A slewing counterweight gives no warning of its own, and a person it strikes rarely gets a second chance.",
      wrongNote: "Not that — the person in the blind quadrant is what has to be dealt with before this cut continues at all.",
    },
    {
      id: "boom-drift-toward-line",
      kind: "Line proximity",
      after: "direct-swing", delay: 4, seconds: 11,
      alert: "The stick has drifted closer to the marked utility line than the plan allows while attention was on the spoil side.",
      cue: "Signal stop now, before the bucket reaches the marked line.",
      target: "swing-stop-flag",
      why: "A locate mark is painted within a tolerance around where the line is believed to run, not on its exact centreline, so the safe working distance is measured outward from that paint for as long as the bucket is moving — not only at the moment the cut started. A drift nobody calls out is a drift that keeps closing that distance unattended.",
      missNote: "The bucket kept swinging toward the marked line while attention stayed on the spoil side. A struck utility line does not wait for the swing to finish before it lets go.",
      wrongNote: "Not that — the drift toward the marked line is what has to stop this swing right now.",
    },
  ],

  steps: [
    {
      id: "ppe", kind: "sequence", anyOrder: true,
      targets: ["hi-vis-vest", "hard-hat"],
      itemNames: { "hi-vis-vest": "hi-vis vest", "hard-hat": "hard hat" },
      title: "Suit up before the swing radius",
      cue: "Hi-vis vest and hard hat before anyone is near the machine.",
      why: "The whole reason a spotter can catch a worker in the blind quadrant at all is that a hi-vis vest reads against dirt and steel from a cab several feet up — a spotter who cannot pick a person out of the background is watching the ground for nothing, and the hard hat is what a dropped tool or a low swing has something other than a skull to hit first.",
    },
    {
      id: "locate-ticket", kind: "select", target: "locate-ticket-board",
      title: "Read the locate ticket",
      cue: "Confirm which utilities the one-call ticket covers before anything on the ground is trusted.",
      why: "The ticket is what tells you which lines were actually marked for this dig and which ones were not — a mark on the ground with no ticket behind it could be leftover paint from a different job, and a ticket with no mark on the ground yet means the utility owner has not located that line at all. Reading it first is what makes the paint mean something.",
    },
    {
      id: "verify-marks", kind: "find", noHint: true,
      targets: ["faded-mark", "conflicting-mark", "unmarked-flag"],
      itemNames: {
        "faded-mark": "faded locate paint",
        "conflicting-mark": "conflicting colour mark",
        "unmarked-flag": "flag with no paint behind it",
      },
      itemNotes: {
        "faded-mark": "Paint this faded could be from a locate weeks old — it needs a fresh call before anyone trusts it over today's dig.",
        "conflicting-mark": "Two different utility colours crossing at the same spot with no legend to explain it is a mark nobody should dig against until the locator is called back.",
        "unmarked-flag": "A flag standing with no paint line leading to it is an incomplete locate, not a located line — it tells you a utility is somewhere near, not where.",
      },
      decoyNotes: {
        "verified-mark": "That line is freshly painted, single colour, and matches the ticket. Nothing to flag there.",
      },
      title: "Verify the locate marks against the ticket",
      cue: "Walk the ground the ticket covers. Three marks here do not actually prove where a line is — find them by looking.",
      why: "A mark on the ground only means what a competent locate put there, and paint that is faded, contradictory or unfinished is not that — it is a line whose real position nobody has actually confirmed today. Digging against a mark like that trades the appearance of a located utility for the fact of one, and the bucket cannot tell the difference until it has already struck something.",
    },
    {
      id: "barricade-swing", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "swing-barrier"],
      itemNames: { "cone-a": "cone at the approach", "cone-b": "cone at the far side", "swing-barrier": "swing radius barrier" },
      title: "Barricade the swing radius",
      cue: "Cone both approaches and set the barrier around the machine's full swing.",
      why: "OSHA's equipment rule at 29 CFR 1926 Subpart O treats the swing radius as ground the employer has to control, not ground a pedestrian is expected to judge for themselves — a barrier that exists before the house ever slews is what keeps a shortcut across the yard from ending inside the counterweight's own path.",
    },
    {
      id: "alarm-check", kind: "gauge", target: "backup-alarm",
      title: "Test the travel alarm",
      cue: "Trigger the alarm and commit only once it reads in the audible range over yard noise.",
      why: "A travel alarm nobody can hear over the yard's own noise is a travel alarm that has already failed the one job it has, which is why it gets tested against today's actual conditions before the first move, not assumed from the label on the horn.",
      gauge: {
        label: "TRAVEL ALARM — SOUND LEVEL", speed: 0.6, green: [0.5, 0.72],
        readout: (t) => `${Math.round(78 + t * 30)} dB`,
        missNote: "Too quiet to carry over the yard. Get it serviced before this machine moves again.",
      },
    },
    {
      id: "spotter-brief", kind: "select", target: "spotter",
      title: "Confirm the spotter's protocol",
      cue: "Agree hand signals and the stop signal with the dedicated spotter before the first cut.",
      why: "The spotter is watching ground and blind quadrants the operator's own seat cannot see, and that only works if both of them already agree what a stop signal looks like before it is ever needed — sorting that out mid-swing is sorting it out too late.",
    },
    {
      id: "coupler-lock", kind: "turn", target: "coupler-lever",
      title: "Lock the quick coupler",
      cue: "Turn the coupler lever fully to the locked position before trusting the bucket.",
      why: "A quick coupler that is seated but not turned all the way to locked can still let go of the bucket under load — a confirmed, positive lock is the whole point of the mechanism, and the seating on its own is only the part that looks finished before it actually is.",
      turn: { turns: 0.6, axis: "y", label: "COUPLER LOCK" },
    },
    {
      id: "pothole-expose", kind: "drag", target: "vac-hose",
      title: "Hand-expose the marked line",
      cue: "Carry the vacuum hose to the marked line and expose it before the bucket comes anywhere close.",
      why: "The last foot or two of cover over a marked utility is exposed by hand or vacuum, never by the bucket, because a locate mark's tolerance is measured in feet and a bucket's teeth are not precise enough to stop at a line nobody can actually see yet. Exposing it first turns a guess about depth into a fact the operator can actually dig against.",
      drag: { to: "utility-line-socket", radius: 0.4, missNote: "Not over the marked line — line the hose up with the paint before you start exposing anything." },
    },
    {
      id: "dig-cut", kind: "hold", target: "dig-controls", seconds: 6,
      title: "Make the controlled cut",
      cue: "Hold the controls steady for a slow, controlled pass now that the line is exposed.",
      why: "A controlled pass next to an exposed line is slow on purpose — the bucket is close enough now that a fast, confident cut is exactly the moment a small misjudgement in depth or reach turns into a struck line the crew has to now report and repair on top of the job they came to do.",
      holdBreakNote: "Released the controls mid-cut, next to an exposed line. Hold it through the whole pass — that is what keeps this a controlled cut instead of a guess.",
    },
    {
      id: "direct-swing", kind: "track", target: "spotter", seconds: 8,
      title: "Direct the swing away from the line",
      cue: "Keep the spotter's signal steady, holding the swing path clear of both the crew and the marked line.",
      why: "The swing path has two things it must stay clear of at once — the ground crew on one side and the marked utility on the other — and a spotter giving continuous signals is what keeps the operator's attention on both instead of narrowing down to whichever one is currently in view out the side glass.",
      track: {
        start: 0.12, green: [0.4, 0.62], rise: 0.5, fall: 0.45, drift: 0.12,
        label: "SWING PATH",
        readout: (v) => (v < 0.4 ? "drifting toward the line" : v > 0.62 ? "drifting toward the crew" : "on the safe path"),
      },
      holdBreakNote: "The swing path drifted out of the safe corridor. Bring the signal back on line before the bucket swings again.",
    },
    {
      id: "spoil-setback", kind: "select", target: "spoil-pile",
      title: "Set the spoil back from the edge",
      cue: "Relocate the excavated soil at least two feet back from the cut.",
      why: "Spoil stacked at the crest adds surcharge load exactly where the wall is already under the most stress, and setting it back the two feet OSHA's excavation rule expects takes that extra weight out of the equation before it has a chance to matter.",
    },
    {
      id: "grade-check", kind: "select", target: "grade-rod",
      title: "Confirm the cut against the grade rod",
      cue: "Have the grade checker read the rod against the plan invert while the cut is still open.",
      why: "A second person reading the rod against the plan, independent of whoever is running the machine, is what actually catches a cut that is running shallow or deep before the pipe goes in on top of it — the operator's own sense of how deep the bucket went is not the same thing as a measurement.",
    },
    {
      id: "compaction-check", kind: "gauge", target: "compaction-gauge",
      title: "Check the backfill lift density",
      cue: "Read the density gauge on the first backfill lift and commit only inside the target band.",
      why: "Backfill placed in lifts is only doing its job if each lift is actually compacted to the target density before the next one goes on top of it — a lift that reads soft now is a settlement problem under the surface months later, and the gauge is what tells you before that lift disappears under the next one.",
      gauge: {
        label: "BACKFILL LIFT DENSITY", speed: 0.55, green: [0.55, 0.8],
        readout: (t) => `${Math.round(82 + t * 20)}% of max density`,
        missNote: "Under target. Run the compactor over this lift again before the next one goes on.",
      },
    },
    {
      id: "shutdown-log", kind: "select", target: "closing-log",
      title: "Close out the excavation log",
      cue: "Log the cut, the locate ticket number and the backfill sign-off before shutting the machine down.",
      why: "The excavation log is what the next crew and the next inspection actually read — a cut that went cleanly but was never logged against its own ticket number leaves nothing behind to prove the locate was checked at all, which is the fact the whole job was resting on.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, EXU_ACCENT);

    // ------------------------------------------------------------------ ground
    const groundMesh = box(g, 6.4, 0.14, 6.0, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4d3f26", base2: "#40341f", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.96, metal: 0.02, color: 0xc4b183 },
    );

    // ------------------------------------------------------------------ the excavator
    const exc = excavator(g, -1.1, 0.14, -1.1, { ry: 2.5, livery: { colour: EXU_ACCENT, fleetName: "SITE DIG", unitNumber: "EX-9" } });
    const { door, house, boom, stick, bucket } = exc.userData.parts;
    holoTag(exc, "excavator EX-9", 0, 3.4, 0, { css: "#dba428", w: 0.4 });
    const digControls = reg(hits, door, "dig-controls");
    void digControls;

    // Swing radius shadow — the hazard zone under the house's full slew.
    const swingShadow = box(g, 3.6, 0.005, 3.6, -1.1, 0.15, -1.1, 0x000000, { opacity: 0.16, transparent: true, cast: false });
    holoTag(swingShadow, "swing radius", 0, 0.25, 1.2, { css: "#f0645b", w: 0.32 });
    reg(hits, swingShadow, "swing-radius-stand");

    // Quick coupler lever, mounted at the bucket pin, plus the decoy release.
    const coupler = group(g, -1.7, 0.14, -0.35, 0.4);
    box(coupler, 0.1, 0.04, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.55, metal: 0.4 });
    const couplerLever = cyl(coupler, 0.02, 0.02, 0.16, 0.06, 0.5, 0, 0x4fd1ff, { emissive: 0x2f8fdb, ei: 0.6, rough: 0.4, seg: 12 });
    couplerLever.rotation.z = Math.PI / 2;
    holoTag(coupler, "coupler lock", 0, 0.66, 0, { css: "#dba428", w: 0.3 });
    reg(hits, couplerLever, "coupler-lever");
    const couplerRelease = box(coupler, 0.08, 0.06, 0.02, -0.12, 0.42, 0.04, 0xd2312b, { rough: 0.5 });
    decal(couplerRelease, 0.07, 0.05, 0, 0, 0.011, signFace("RELEASE", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.5 }));
    reg(hits, couplerRelease, "coupler-release");

    // ------------------------------------------------------------------ the locate site
    const locateSite = group(g, 0.9, 0, -0.4);
    // Marked utility line: a painted stripe with three inspection points along it.
    box(locateSite, 0.06, 0.005, 2.4, 0, 0.148, 0, 0xf2c14b, { rough: 0.7, cast: false });
    const freshMark = box(locateSite, 0.4, 0.005, 0.05, 0, 0.149, 0.9, 0xf2c14b, { rough: 0.7, cast: false });
    reg(hits, freshMark, "verified-mark");
    const fadedMark = box(locateSite, 0.4, 0.005, 0.05, 0, 0.149, 0.2, 0x9a8752, { rough: 0.8, cast: false });
    reg(hits, fadedMark, "faded-mark");
    const conflictMark = group(locateSite, 0, 0.149, -0.5);
    box(conflictMark, 0.4, 0.005, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.7, cast: false });
    box(conflictMark, 0.05, 0.006, 0.4, 0, 0.001, 0, 0xd2312b, { rough: 0.7, cast: false });
    reg(hits, conflictMark, "conflicting-mark");
    const unmarkedFlag = group(locateSite, 0.5, 0.14, -1.0);
    cyl(unmarkedFlag, 0.006, 0.006, 0.5, 0, 0.25, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(unmarkedFlag, 0.12, 0.08, 0.01, 0, 0.46, 0.03, 0xf25c54, { rough: 0.6 });
    reg(hits, unmarkedFlag, "unmarked-flag");
    holoTag(locateSite, "locate marks", 0, 0.5, 0.9, { css: "#dba428", w: 0.32 });

    // Unverified dig zone hazard, off the marked line entirely.
    const unverifiedZone = box(g, 0.5, 0.02, 0.5, 1.8, 0.15, 0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "unmarked ground — do not cut", 1.8, 0.3, 0.6, { css: "#f0645b", w: 0.52 });
    reg(hits, unverifiedZone, "unverified-dig-zone");

    // Exposed section of pipe, plus the socket the hand-dig drops onto.
    const exposedPipe = group(locateSite, 0, 0.05, 0.9);
    cyl(exposedPipe, 0.05, 0.05, 0.5, 0, 0, 0, 0x2f6f8c, { rough: 0.5, metal: 0.4, seg: 14 }).rotation.z = Math.PI / 2;
    const utilitySocket = group(locateSite, 0, 0.06, 0.9);
    hits["utility-line-socket"] = utilitySocket;

    // Vacuum/hand-dig hose, staged beside the site until it is carried in.
    const vacHose = group(g, 1.6, 0.14, -1.4, 0.5);
    cyl(vacHose, 0.03, 0.03, 0.9, 0, 0.03, 0, 0x2b3138, { rough: 0.6, metal: 0.2, seg: 12 }).rotation.z = Math.PI / 2;
    box(vacHose, 0.14, 0.14, 0.1, 0.5, 0.07, 0, 0x2b3138, { rough: 0.6 });
    holoTag(vacHose, "vacuum hose", 0, 0.3, 0, { css: "#dba428", w: 0.3 });
    reg(hits, vacHose, "vac-hose");

    // ------------------------------------------------------------------ guarding
    reg(hits, cone(g, -2.6, -1.9, { color: EXU_ACCENT }), "cone-a");
    reg(hits, cone(g, 1.9, 1.7, { color: EXU_ACCENT }), "cone-b");
    const barrierPanels = [];
    for (const [bx, bz, ry] of [[-2.6, -0.6, Math.PI / 2], [-2.6, 0.5, Math.PI / 2], [-1.5, 1.4, 0], [-0.4, 1.4, 0], [0.6, 1.4, 0]]) {
      const p = barrierPanel(g, bx, bz, { ry, w: 1.1, color: EXU_ACCENT });
      p.visible = false;
      barrierPanels.push(p);
    }
    const barrierKit = group(g, 2.2, 0, 0.3, -0.4);
    slab(barrierKit, 1.0, 0.14, 0.18, 0, 0.08, 0, EXU_ACCENT, { radius: 0.02, rough: 0.6 });
    holoTag(barrierKit, "swing radius barrier", 0, 0.3, 0, { css: "#dba428", w: 0.36 });
    reg(hits, barrierKit, "swing-barrier");

    // Stop flag the swing-drift interrupt is answered with.
    const stopFlag = group(g, 0.4, 0.14, -1.9, 0.3);
    cyl(stopFlag, 0.012, 0.012, 0.8, 0, 0.4, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6, seg: 8 });
    box(stopFlag, 0.18, 0.13, 0.01, 0, 0.74, 0.02, 0xd2312b, { rough: 0.55 });
    decal(stopFlag, 0.16, 0.11, 0, 0.74, 0.026, signFace("STOP", { bg: "#5a0f0f", accent: "#ffffff", scale: 0.55 }));
    holoTag(stopFlag, "swing stop", 0, 0.9, 0, { css: "#dba428", w: 0.3 });
    reg(hits, stopFlag, "swing-stop-flag");

    // ------------------------------------------------------------------ crew
    const spotter = standingFigure(g, 1.9, -0.9, { ry: -2.0, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(spotter, "spotter", 0, 1.95, 0.15, { css: "#dba428", w: 0.24 });
    reg(hits, spotter, "spotter");

    const gradeChecker = standingFigure(g, 1.3, 0.9, { ry: 2.3, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    holoTag(gradeChecker, "grade checker", 0, 1.95, 0.15, { css: "#dba428", w: 0.32 });
    const gradeRod = group(gradeChecker, 0.25, 0, 0.15, -0.3);
    cyl(gradeRod, 0.012, 0.012, 1.5, 0, 0.75, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    box(gradeRod, 0.05, 0.03, 0.01, 0, 1.4, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, gradeRod, "grade-rod");

    // Blind-side worker: staged off-site until the interrupt walks them in.
    const blindWorker = standingFigure(g, 3.4, 2.0, { ry: 1.2, cloth: 0x37505f, vest: 0xe4dc3a, helmet: 0xf2c14b });
    const blindWorkerSafeX = 3.4, blindWorkerSafeZ = 2.0, blindWorkerHotX = -0.55;

    // ------------------------------------------------------------------ paperwork + gear
    const ticket = holoPanel(g, 0.58, 0.4, -2.3, 1.5, 1.2, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#dba428"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("LOCATE TICKET · ONE-CALL", w * 0.06, h * 0.12);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("GAS + ELECTRIC MARKED", w * 0.06, h * 0.3);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Ticket valid: per the ticket dates", "Tolerance zone: per the locator's mark",
       "Hand-expose within: last foot of cover", "Swing radius: barricade before slewing",
       "Backfill: per the plan lifts"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.46 + i * 0.11)));
    }, { ry: 0.6, accent: EXU_ACCENT });
    reg(hits, ticket, "locate-ticket-board");

    const chest = toolChest(g, 2.4, -0.6, { ry: -0.5, color: EXU_ACCENT });
    const alarmMeter = instrument(chest, -0.08, 0.79, 0.05, { ry: 0.3, idle: "-- dB", color: EXU_ACCENT });
    holoTag(alarmMeter, "travel alarm", 0, 0.16, 0, { css: "#dba428", w: 0.3 });
    reg(hits, alarmMeter, "backup-alarm");
    const compactMeter = instrument(chest, 0.16, 0.79, 0.06, { ry: -0.4, idle: "-- %", color: EXU_ACCENT });
    holoTag(compactMeter, "compaction gauge", 0, 0.16, 0, { css: "#dba428", w: 0.34 });
    reg(hits, compactMeter, "compaction-gauge");

    // Spoil pile — too close to the edge until relocated.
    const spoil = group(g, -0.2, 0, -1.9);
    cyl(spoil, 0.4, 0.55, 0.4, 0, 0.2, 0, 0x5a4a2a, { rough: 0.98, seg: 16 });
    holoTag(spoil, "spoil pile", 0, 0.5, 0, { css: "#dba428", w: 0.28 });
    reg(hits, spoil, "spoil-pile");
    const surchargeMark = group(g, -0.1, 0, -1.5);
    box(surchargeMark, 0.3, 0.02, 0.3, 0, 0.16, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(surchargeMark, "surcharge risk", 0, 0.24, 0, { css: "#f0645b", w: 0.32 });
    reg(hits, surchargeMark, "spoil-surcharge");

    const closingLog = group(g, 2.5, 0, 1.4, 0.4);
    slab(closingLog, 0.42, 0.32, 0.03, 0, 1.1, 0, 0x1b232b, { radius: 0.01, rough: 0.6 });
    const closingLogFace = decal(closingLog, 0.38, 0.28, 0, 1.1, 0.02,
      signFace("EXCAVATION LOG\nOPEN", { bg: "#11181f", accent: "#dba428", scale: 0.26 }), { px: 320 });
    holoTag(closingLog, "excavation log", 0, 1.34, 0, { css: "#dba428", w: 0.32 });
    reg(hits, closingLog, "closing-log");

    const ppeRack = group(g, -2.3, 0, 1.5, 0.3);
    box(ppeRack, 0.3, 0.02, 0.2, 0, 0.4, 0, 0x2b3138, { rough: 0.7 });
    const vestProp = box(ppeRack, 0.22, 0.26, 0.02, 0, 0.55, 0, EXU_ACCENT, { rough: 0.85 });
    holoTag(vestProp, "hi-vis vest", 0, 0.2, 0, { css: "#dba428", w: 0.3 });
    reg(hits, vestProp, "hi-vis-vest");
    const hatProp = group(ppeRack, 0.2, 0.62, 0);
    ball(hatProp, 0.09, 0, 0, 0, 0xf2f2f2, { rough: 0.5, seg: 12 });
    holoTag(hatProp, "hard hat", 0, 0.18, 0, { css: "#dba428", w: 0.28 });
    reg(hits, hatProp, "hard-hat");

    // Site dressing from the shared props kit.
    dumpster(g, -2.7, 0, 1.6, { ry: 0.3 });
    cableSpool(g, 2.9, 0, -1.9, { ry: -0.4 });

    const dust = particles(spoil, 24, 0x9a8a6a, { size: 0.02, life: 0.6, additive: false, opacity: 0.2 });

    return {
      hits,
      footprint: 2.6,

      onInterrupt(it) {
        if (it.id === "blind-side-worker") { blindWorker.position.x = blindWorkerHotX; blindWorker.position.z = -0.9; }
        if (it.id === "boom-drift-toward-line") { house.rotation.y -= 0.35; stick.rotation.x -= 0.1; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "blind-side-worker") { blindWorker.position.x = blindWorkerSafeX; blindWorker.position.z = blindWorkerSafeZ; }
        if (it.id === "boom-drift-toward-line") { house.rotation.y += 0.35; stick.rotation.x += 0.1; }
      },
      onStepComplete(step) {
        if (step.id === "verify-marks") {
          fadedMark.material = mat(0x59c97b, { rough: 0.6 });
          conflictMark.children[0].material = mat(0x59c97b, { rough: 0.6 });
          conflictMark.children[1].visible = false;
        }
        if (step.id === "barricade-swing") barrierPanels.forEach((p) => { p.visible = true; });
        if (step.id === "spoil-setback") { spoil.position.set(2.7, 0, 1.0); dust.visible = false; }
        if (step.id === "shutdown-log") {
          repaint(closingLogFace, signFace("EXCAVATION LOG\nCLOSED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.26 }));
        }
      },
      onHazard(hitId) { if (hitId === "spoil-surcharge") { dust.visible = true; } },

      animate(t, dt, session) {
        spotter.userData.head.rotation.y = Math.sin(t * 0.6) * 0.4;
        gradeChecker.userData.head.rotation.y = Math.sin(t * 0.5 + 1) * 0.3;
        if (dust.visible) dust.userData.step(dt, new THREE.Vector3(0, 0.4, 0), 0.15, 0.15, -0.1);
        if (!session?.finished && (!session?.step || session.step.id !== "dig-cut")) {
          boom.rotation.x = -0.02 + Math.sin(t * 0.3) * 0.01;
        }

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "alarm-check") {
            const db = Math.round(78 + gg.t * 30);
            repaint(alarmMeter.userData.screen, signFace(`${db} dB`, {
              bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.72 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
          if (session.step?.id === "compaction-check") {
            const pct = Math.round(82 + gg.t * 20);
            repaint(compactMeter.userData.screen, signFace(`${pct}%`, {
              bg: "#0d1c24", accent: gg.t > 0.55 && gg.t < 0.8 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
            }));
          }
        }
      },
    };
  },
};
