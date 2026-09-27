import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, paperFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag, rackFrame, rackUnit,
  cone, barrierPanel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Paper Machine Dryer Section VR — Manufacturing & Automation,
// mill and mine pack, station four.
//
// A felt change on a paper machine's dryer section: steam-heated cans
// turning inside a felt that wraps them under tension, with an in-running
// nip everywhere the felt meets a can. The section being worked is locked
// out and bled of steam before its guard ever comes off, and the section
// next to it — still running, still under steam — stays exactly what it is:
// somebody else's machine, not a shortcut. Per the manual and the plan
// throughout; no clearance, pressure or tension figure here is a fact this
// platform is claiming to know.

const PMD_ACCENT = 0x3a7ca8;

export const SIM_MM_PAPER_MACHINE_DRYER = {
  id: "mm-paper-machine-dryer",
  index: "711",
  domain: "Manufacturing",
  trade: "Paper machine dryer section operator",
  category: "Manufacturing & Automation",
  indoor: "plant",
  certification: "USW Tony Mazzocchi Center health and safety training; OSHA 29 CFR 1910.147 control of hazardous energy (lockout/tagout); OSHA 29 CFR 1910.212 general machine guarding; ANSI B11 general safety requirements for machines",
  name: "Paper Machine Dryer Section",
  title: simTitle("Paper Machine Dryer Section"),
  tagline: "A dryer-section felt change: drive and steam locked out, pressure bled to zero, the nip guarded, the felt threaded and tensioned, the section proved before power comes back",
  accent: PMD_ACCENT,
  accentCss: "#3a7ca8",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "felt-changed-clean", name: "Felt Changed Clean", note: "A dryer section locked out, bled to zero and reguarded before power went back on it, with the neighbouring section never touched" },

  game: system({
    name: "Dryer Section Authority",
    currency: "REEL",
    ranks: ["Machine Tender Helper", "Fourth Hand", "Machine Tender", "Dryer Section Lead", "Dryer Section Authority Certified"],
    badges: [
      { id: "locked-and-bled", name: "Locked And Bled", note: "Drive and steam locked out and pressure bled to zero before the guard came off, first time", test: AWARD.stepClean("lockout-drive") },
      { id: "your-section-only", name: "Your Section Only", note: "Never reached a nip, a bypass valve or the running section next door", test: AWARD.safe },
      { id: "tension-on-spec", name: "Tension On Spec", note: "Felt tension set inside the manual's band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-changeover", name: "Clean Changeover", note: "No corrections through the whole felt change", test: AWARD.clean },
      { id: "jog-unbroken", name: "Jog Unbroken", note: "The proof jog never broke its controlled rate", test: AWARD.unbroken },
      { id: "changeover-fast", name: "Changeover Fast", note: "Felt change completed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "nip-point-reach": "You reached toward the nip between the dryer can and the felt. An in-running nip pulls a hand in at the speed the can turns and does not let go for a hand telling it to — the nip is treated as live from the guard's own interlock, not from whether the can looks like it is turning.",
    "steam-valve-bypass": "You opened the steam bypass instead of the isolation valve. A bypass exists to warm a cold cylinder under control, not to skip isolating it — cracking the bypass on a section that is supposed to be locked out puts live steam right back into cans a crew is about to open a guard on.",
    "adjacent-doctor-blade": "You reached toward the doctor blade on the section next to yours. That can is still turning and still under steam — your lockout covers your own section, and a hand near a live doctor blade on somebody else's machine is not made any safer by being careful about it.",
    "adjacent-felt-tensioner": "You reached for the felt tensioner on the running section beside yours. Adjusting tension on a felt that is moving is exactly the reach-toward-a-nip hazard the lockout on your own section exists to remove — it does not stop existing because the machine happens to belong to the section next door.",
  },

  lateNotes: {
    "felt-tensioner": "Not yet. The old felt is out and the new one is threaded before it is tensioned.",
    "jog-control": "Not yet. The guard is back and the lockout is off before the section is jogged.",
  },

  steps: [
    {
      id: "job-ticket", kind: "select", target: "job-ticket-board",
      title: "Read the felt-change job ticket",
      cue: "Check which dryer section, which felt and the tension the manual calls for.",
      why: "The ticket names the exact section and felt this job is for on a machine with several sections that all look alike from the floor. A crew that starts from the section that happens to be handy rather than the one the ticket names risks locking out and opening up the wrong equipment while the actual job section keeps running.",
    },
    {
      id: "lockout-drive", kind: "sequence",
      targets: ["drive-disconnect", "steam-isolation-valve", "condensate-valve"],
      itemNames: { "drive-disconnect": "section drive locked out", "steam-isolation-valve": "steam supply isolated", "condensate-valve": "condensate return isolated" },
      title: "Lock out the drive and the steam",
      cue: "Lock the section drive, isolate the steam supply, then isolate the condensate return.",
      why: "A dryer can stores energy two ways at once — mechanical in the drive and thermal in the steam still inside the cylinder — and locking only the drive leaves a can that is stopped but still full of pressurised steam. Isolating the steam and the condensate return both is what actually gets that stored heat and pressure out of the equation before anyone opens a guard.",
      outOfOrderNote: "Drive first, then steam, then condensate — the section is dead before the steam side is touched, and the supply is shut before the return is.",
    },
    {
      id: "verify-zero-speed", kind: "hold", target: "speed-readout", seconds: 5,
      title: "Prove the cans have stopped",
      cue: "Hold the test lead on the speed readout and watch it settle at zero.",
      why: "A dryer section this size coasts for a while on its own mass after the drive is locked out, and a can that is still turning looks the same from the floor as one that has fully stopped. The speed readout is watched to zero rather than guessed at, because a hand near a nip that is still closing does not get a second chance to notice the difference.",
      holdBreakNote: "You let go before the readout settled. A reading taken mid-coast is a reading for cans that have not actually stopped yet.",
    },
    {
      id: "bleed-pressure", kind: "gauge", target: "steam-gauge",
      title: "Bleed the section to zero pressure",
      cue: "Open the bleed and watch the steam gauge down to zero before touching any cover.",
      why: "Isolating the steam supply stops more from coming in; it does not empty what is already inside the cylinder. The bleed is what actually brings the section to zero, and the gauge is what proves it — a cover opened on a section that is isolated but not yet bled is a cover opened on a cylinder that can still let go of what it was holding.",
      gauge: { label: "STEAM PRESSURE", speed: 0.7, green: [0.0, 0.12], readout: (t) => (t <= 0.12 ? "bled to zero" : "still pressurised"), missNote: "Not at zero yet — keep bleeding before anything on this section is opened." },
    },
    {
      id: "guard-removal", kind: "select", target: "nip-guard",
      title: "Remove the nip guard",
      cue: "Remove the guard panel over the felt nip now that the section is locked out and bled.",
      why: "The guard's interlock is the backup for the day the lockout gets forgotten, not a substitute for doing the lockout and the bleed first — taking it off only after both are confirmed keeps the interlock in the role it is actually meant to play.",
    },
    {
      id: "inspect-felt", kind: "find", noHint: true,
      targets: ["felt-tear", "can-surface-buildup"],
      itemNames: { "felt-tear": "a tear along the old felt's edge", "can-surface-buildup": "a build-up patch on the can surface" },
      itemNotes: {
        "felt-tear": "The old felt has a tear running in from its edge — worth noting for the changeover report, since a felt that failed this way is one the mill will want to know the cause of.",
        "can-surface-buildup": "There is a build-up patch on the dryer can's surface where the felt has been riding unevenly — a surface condition that will affect how the new felt tracks unless it is dealt with now, while the guard is already off.",
      },
      title: "Walk the section before the felt comes out",
      cue: "Check the old felt and the can surface and click what you see.",
      why: "The old felt and the can surface are both easiest to actually look at with the guard off and the section locked out — waiting until the new felt is already threaded to notice a build-up patch means threading it again.",
    },
    {
      id: "cut-old-felt", kind: "drag", target: "felt-cutting-tool",
      title: "Cut and remove the old felt",
      cue: "Carry the cutting tool to the marked splice point and cut the old felt free.",
      why: "The old felt is cut at its splice, the one joint built to be opened, rather than anywhere convenient — cutting through the body of the felt leaves a ragged edge that can catch on the can as the old felt is drawn out.",
      drag: { to: "felt-splice-point", radius: 0.4, missNote: "Not at the splice — the felt opens at its joint, not partway along its length." },
    },
    {
      id: "thread-new-felt", kind: "drag", target: "new-felt-roll",
      title: "Thread the new felt",
      cue: "Carry the new felt roll along the threading path the manual shows for this section.",
      why: "The threading path is the route the manual lays out for exactly this section, and it is what keeps the felt square to every can it wraps. A felt threaded off that path can run true for a while and then walk sideways under tension, which is a harder fault to trace after the machine is back up than it is to prevent now.",
      drag: { to: "threading-path", radius: 0.45, missNote: "Off the threading path — the felt needs to follow the manual's route through the section." },
    },
    {
      id: "tension-felt", kind: "turn", target: "felt-tensioner",
      title: "Tension the new felt",
      cue: "Turn the tensioner to the tension the manual calls for this felt.",
      why: "A felt tensioned too loose slips and wanders on the cans; tensioned too tight, it runs hot against the felt's own fibres and wears out early. The manual's figure for this felt and this section is the number the tensioner is set to, not a feel for how tight it seems by hand.",
      turn: { turns: 1, axis: "y", label: "TENSION" },
    },
    {
      id: "doctor-blade-check", kind: "select", target: "doctor-blade",
      title: "Check the doctor blade clearance",
      cue: "Inspect the doctor blade against the can now, while the section is still locked out.",
      why: "The doctor blade rides right against the can surface, and its clearance is far easier to check and reset with the section stopped and the guard already off than it is to catch later from a defect in the sheet the blade is supposed to be keeping the can clean for.",
    },
    {
      id: "restore-guard", kind: "select", target: "nip-guard",
      title: "Restore the nip guard",
      cue: "Put the guard panel back over the felt nip before power is restored.",
      why: "The guard goes back on before the lockout comes off, in that order, every time — a section proved safe with the guard off is not the same thing as a section that is safe to run, and it only becomes the second one once the guard is back where its interlock can do its job.",
    },
    {
      id: "restore-power", kind: "turn", target: "drive-disconnect",
      title: "Remove your lock and restore the drive",
      cue: "Confirm the section is clear, take your lock off, then close the drive disconnect.",
      why: "Your lock, your call — restoring power is the one action on this section that only the person who applied the lock gets to take, because only that person actually watched the guard and the nip the whole time they were open.",
      turn: { turns: 0.5, axis: "y", label: "DRIVE" },
    },
    {
      id: "proof-jog", kind: "track", target: "jog-control", seconds: 6,
      title: "Jog the section to prove the felt",
      cue: "Hold the jog control at a slow, controlled rate and watch the new felt track true.",
      why: "A slow jog is what shows whether the new felt is tracking square before the section ever goes back to full speed — a felt that is going to walk off true does it early and slowly at jog speed, which is exactly the moment it is cheapest to catch and correct.",
      track: { start: 0.1, green: [0.15, 0.32], rise: 0.4, fall: 0.35, drift: 0.1, label: "JOG SPEED", readout: (v) => (v > 0.32 ? "too fast to watch it track" : v < 0.15 ? "stalled" : "watching it track") },
      holdBreakNote: "Jog speed out of band — this is a proof run, not a start-up; slow it back down.",
    },
    {
      id: "log-changeover", kind: "select", target: "maintenance-log",
      title: "Log the felt change",
      cue: "Record the section, the felt, the tension set and what the walk-round found.",
      why: "The maintenance log is what tells the next shift and the next changeover crew what this felt actually was, what tension it went in at, and what the can surface looked like — a changeover that runs clean but is never logged leaves the next crew guessing at all three.",
    },
  ],

  interrupts: [
    {
      id: "restart-attempt",
      kind: "Remote restart attempted",
      after: "guard-removal", delay: 4, seconds: 12,
      alert: "The control room calls down that the schedule shows this section as available and someone at the panel is about to select it to run.",
      cue: "Somebody who cannot see the open guard is about to try to start this section.",
      target: "local-stop-verify",
      why: "A remote panel only knows what the schedule tells it, and the schedule does not know a guard is off and a lockout is on at this section right now. The local stop-and-verify is what reasserts your lockout against a start command that has no way of seeing what your crew can see standing right here.",
      missNote: "The restart attempt went through while your crew was still at the open guard. A control-room panel does its job by the schedule it is given, and a schedule that has not been told this section is locked out is a schedule that will try to run it.",
      wrongNote: "It is the local stop-and-verify. Nothing else reasserts your lockout against a command coming from the panel.",
    },
    {
      id: "steam-leak",
      kind: "Trap failing nearby",
      after: "doctor-blade-check", delay: 3, seconds: 12,
      alert: "A steam trap on the section beside yours lets go with a bang and starts venting visible steam across the walkway.",
      cue: "Live steam is now venting across the walkway you are using.",
      target: "steam-leak-alarm",
      why: "A failed trap on a running, still-pressurised section is a live steam hazard exactly like the one your own lockout was built to remove — it just failed on the section that never got isolated. The alarm calls it in and gets the walkway cleared before anyone has to guess how close is close enough.",
      missNote: "The steam kept venting across the walkway while the work continued. A steam leak does not vent itself out on its own schedule, and treating a bang and a visible plume as background noise is how a second, avoidable injury happens next to a job that was otherwise done right.",
      wrongNote: "It is the steam-leak alarm. Nothing else calls in a trap failure fast enough from the walkway.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, PMD_ACCENT);
    box(g, 6.4, 0.12, 5.6, 0, 0.06, 0, 0x35404a, { rough: 0.85, finish: "concrete" });
    for (let i = -2; i <= 2; i++) box(g, 0.05, 0.13, 5.6, i * 1.1, 0.065, 0, 0xf0b323, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });

    // ------------------------------------------------------- the dryer cans
    function dryerCan(x, running) {
      const can = group(g, x, 0, -0.6);
      cyl(can, 0.55, 0.55, 1.6, 0, 1.1, 0, running ? 0x8a929a : 0x6a747c, { rough: 0.35, metal: 0.6, seg: 20 }).rotation.z = Math.PI / 2;
      return can;
    }
    const canA = dryerCan(-0.9, false); // the section being worked
    const canB = dryerCan(0.9, true);   // the running section next door

    // Felt wrap over both cans, and the nip zone on the worked can.
    const feltOld = box(canA, 1.8, 0.03, 0.7, 0, 0.62, 0, 0x8a7a5a, { rough: 0.9, finish: "rubber" });
    holoTag(canA, "old felt", 0, 0.95, 0, { css: "#3a7ca8", w: 0.24 });
    const feltTear = box(canA, 0.05, 0.04, 0.14, 0.7, 0.635, 0.3, 0x2b2318, { rough: 0.9 });
    reg(hits, feltTear, "felt-tear");
    const buildup = box(canA, 0.16, 0.02, 0.16, -0.15, 1.5, 0.18, 0x5a4a30, { rough: 0.9 });
    reg(hits, buildup, "can-surface-buildup");
    const feltNewRoll = group(g, -2.6, 0, 1.8);
    cyl(feltNewRoll, 0.24, 0.24, 0.8, 0, 0.3, 0, 0xc7ac6a, { rough: 0.85, finish: "rubber", seg: 16 }).rotation.z = Math.PI / 2;
    holoTag(feltNewRoll, "new felt roll", 0, 0.58, 0, { css: "#3a7ca8", w: 0.32 });
    reg(hits, feltNewRoll, "new-felt-roll");
    const threadMark = box(g, 1.8, 0.02, 0.7, -0.9, 0.64, -0.6, 0xf0b323, { emissive: 0xf0b323, ei: 0.5, rough: 0.5, cast: false });
    hits["threading-path"] = threadMark;
    const spliceMark = box(canA, 0.1, 0.04, 0.7, 0.85, 0.62, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, spliceMark, "felt-splice-point");

    const nipZone = box(g, 0.4, 0.3, 0.8, -0.9, 1.35, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, nipZone, "nip-point-reach");
    const nipGuard = box(g, 0.5, 0.5, 0.9, -0.9, 1.4, -0.15, 0xe4622a, { rough: 0.55, opacity: 0.55, transparent: true, finish: "painted" });
    reg(hits, nipGuard, "nip-guard");

    const guardBOverlay = box(g, 0.4, 0.3, 0.8, 0.9, 1.35, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void guardBOverlay;

    // Doctor blades — one on each section.
    const bladeA = box(canA, 0.6, 0.04, 0.04, 0, 0.55, 0.35, 0xb9bec4, { rough: 0.3, metal: 0.7 });
    reg(hits, bladeA, "doctor-blade");
    const bladeB = box(canB, 0.6, 0.04, 0.04, 0, 0.55, 0.35, 0xb9bec4, { rough: 0.3, metal: 0.7 });
    reg(hits, bladeB, "adjacent-doctor-blade");

    // Felt tensioners — one at each section.
    const tensionerA = group(g, -1.9, 0, -0.9);
    cyl(tensionerA, 0.16, 0.16, 0.05, 0, 0.9, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    box(tensionerA, 0.03, 0.03, 0.3, -0.08, 0.9, 0.02, 0xb9bec4, { rough: 0.4, metal: 0.6 });
    reg(hits, tensionerA, "felt-tensioner");
    const tensionerB = group(g, 1.9, 0, -0.9);
    cyl(tensionerB, 0.16, 0.16, 0.05, 0, 0.9, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 18 }).rotation.x = Math.PI / 2;
    reg(hits, tensionerB, "adjacent-felt-tensioner");

    // Steam supply / condensate manifold with isolation valves and a bypass.
    const manifold = group(g, -2.5, 0, -1.6);
    box(manifold, 0.3, 1.4, 0.3, 0, 0.7, 0, 0x2b2f34, { rough: 0.6, metal: 0.4 });
    const steamValve = group(manifold, 0, 1.05, 0.18);
    cyl(steamValve, 0.06, 0.06, 0.05, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    reg(hits, steamValve, "steam-isolation-valve");
    const condValve = group(manifold, 0, 0.7, 0.18);
    cyl(condValve, 0.055, 0.055, 0.045, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 16 }).rotation.x = Math.PI / 2;
    reg(hits, condValve, "condensate-valve");
    const bypassValve = group(manifold, 0, 0.4, 0.18);
    cyl(bypassValve, 0.05, 0.05, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.4, metal: 0.5, seg: 16 }).rotation.x = Math.PI / 2;
    decal(bypassValve, 0.13, 0.03, 0, 0.06, 0.01, signFace("BYPASS", { bg: "#22262b", accent: "#d2312b", scale: 0.45 }));
    reg(hits, bypassValve, "steam-valve-bypass");
    const steamGaugeFace = decal(manifold, 0.24, 0.1, 0.16, 1.3, 0, signFace("-- kPa", { bg: "#0d1c24", accent: "#3a7ca8", fg: "#ffe9b0", scale: 0.5 }), { glow: true, ei: 0.6 });
    reg(hits, manifold, "steam-gauge");
    const bleedValve = cyl(manifold, 0.03, 0.03, 0.15, 0.18, 0.5, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    void bleedValve;
    const leakPost = group(g, 2.5, 0, -1.6);
    box(leakPost, 0.16, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const leakAlarm = box(leakPost, 0.12, 0.16, 0.06, 0, 0.85, 0.06, 0xd2312b, { rough: 0.5 });
    holoTag(leakPost, "steam-leak alarm", 0, 1.1, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, leakPost, "steam-leak-alarm");
    const leakSteam = particles(g, 20, 0xe8eef2, { size: 0.05, life: 0.5, additive: false, opacity: 0.4 });
    leakSteam.position.set(1.6, 1.1, -0.8);

    // Drive disconnect, speed readout, jog control, local stop-verify panel.
    const pendant = group(g, -2.6, 0, 0.2);
    box(pendant, 0.5, 1.4, 0.14, 0, 0.7, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const disc = group(pendant, 0, 1.05, 0.08);
    cyl(disc, 0.04, 0.04, 0.02, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const discHandle = box(disc, 0.02, 0.09, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    decal(disc, 0.14, 0.03, 0, 0.07, 0.01, signFace("DRIVE", { bg: "#22262b", accent: "#3a7ca8", scale: 0.5 }));
    reg(hits, disc, "drive-disconnect");
    const lock = lockTag(pendant, 0, 0.85, 0.08, { color: 0x3a7ca8 }); lock.visible = false;
    const jog = group(pendant, 0, 0.55, 0.08);
    cyl(jog, 0.03, 0.03, 0.15, 0, 0, 0, 0x8a929a, { rough: 0.4, metal: 0.6, seg: 10 });
    reg(hits, jog, "jog-control");
    const localStop = group(g, -1.9, 0, 1.4);
    box(localStop, 0.16, 0.9, 0.12, 0, 0.45, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const localStopBtn = ball(localStop, 0.06, 0, 0.85, 0.08, 0xd2312b, { emissive: 0x000000, ei: 0.4, rough: 0.4, seg: 12, seg2: 10 });
    holoTag(localStop, "local stop / verify", 0, 1.1, 0, { css: "#d2312b", w: 0.44 });
    reg(hits, localStop, "local-stop-verify");
    const speedStand = group(g, -1.4, 0, -1.5);
    cyl(speedStand, 0.03, 0.035, 0.7, 0, 0.35, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const speedReadout = instrument(speedStand, 0, 0.72, 0, { ry: 0.6, idle: "-- RPM", color: PMD_ACCENT });
    reg(hits, speedReadout, "speed-readout");

    const ticketBoard = holoPanel(g, 0.6, 0.42, 2.6, 1.5, -1.3, (cx, w, h) => {
      cx.fillStyle = "#0d1620"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#3a7ca8"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("FELT CHANGE — JOB 118", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#e6f1f6";
      ["Section: dryer #1", "Felt: per the manual", "Tension: per the manual", "Neighbouring section: stays running"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { accent: PMD_ACCENT, ry: -0.4 });
    reg(hits, ticketBoard, "job-ticket-board");

    const logStand = group(g, 2.5, 0, 1.5);
    cyl(logStand, 0.03, 0.035, 0.9, 0, 0.45, 0, CITY.steel, { rough: 0.5, metal: 0.6, seg: 10 });
    const logBoard = decal(logStand, 0.32, 0.4, 0, 0.95, 0.02, paperFace("CHANGEOVER LOG", ["Section: ____", "Felt: ____", "Tension: ____"], { bg: "#e6eef2", band: "#2f6f8c" }), { px: 256 });
    reg(hits, logBoard, "maintenance-log");

    // Cutting tool, dressing.
    const toolRack = toolChest(g, -2.8, -2.0, { ry: 0.6, color: 0x3a7ca8 });
    const cuttingTool = box(toolRack, 0.28, 0.05, 0.06, 0, 0.78, 0, 0x8a929a, { rough: 0.4, metal: 0.6 });
    holoTag(toolRack, "felt cutting tool", 0, 0.9, 0, { css: "#3a7ca8", w: 0.36 });
    reg(hits, cuttingTool, "felt-cutting-tool");
    const spareFeltRack = rackFrame(g, 2.7, -1.9, { ry: -0.6, h: 1.2 });
    for (let i = 0; i < 2; i++) rackUnit(spareFeltRack, 0.3 + i * 0.34, ["SPARE FELT", "SPLICE KIT"][i], { css: "#3a7ca8" });
    for (const [x, z] of [[-2.9, 2.2], [2.9, 2.0]]) cone(g, x, z);
    barrierPanel(g, 0, 2.6, { ry: 1.57, color: 0xf0b323 });
    const steamHaze = particles(g, 16, 0xd8e4ea, { size: 0.04, life: 0.6, additive: false, opacity: 0.3 });
    steamHaze.position.set(0.9, 1.6, -0.6);

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.3, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "lockout-drive") { discHandle.rotation.z = Math.PI / 2; lock.visible = true; }
        if (step.id === "bleed-pressure") { repaint(steamGaugeFace, signFace("0 kPa", { bg: "#0d1c24", accent: "#59c97b", fg: "#ffe9b0", scale: 0.5 })); }
        if (step.id === "guard-removal") { nipGuard.rotation.y = -1.2; }
        if (step.id === "cut-old-felt") { feltOld.visible = false; }
        if (step.id === "thread-new-felt") { feltNewRoll.parent.remove(feltNewRoll); canA.add(feltNewRoll); feltNewRoll.position.set(0, 0.62, 0); feltNewRoll.rotation.set(0, 0, 0); feltNewRoll.scale.set(6, 1, 1); }
        if (step.id === "tension-felt") { tensionerA.rotation.z = Math.PI * 0.6; }
        if (step.id === "restore-guard") { nipGuard.rotation.y = 0; }
        if (step.id === "restore-power") { discHandle.rotation.z = 0; lock.visible = false; }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "restart-attempt") { localStopBtn.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.2, rough: 0.4 }); }
        if (it.id === "steam-leak") { leakAlarm.material = mat(0xff4d4d, { emissive: 0xff4d4d, ei: 2.2, rough: 0.4 }); leakSteam.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "restart-attempt") { localStopBtn.material = mat(0xd2312b, { rough: 0.4 }); }
        if (it.id === "steam-leak") { leakAlarm.material = mat(0xd2312b, { rough: 0.5 }); leakSteam.visible = false; }
      },
      animate(t, dt, session) {
        void dt;
        canB.rotation.x += 0.02;
        steamHaze.visible = true;
        steamHaze.userData.step?.(0.016, new THREE.Vector3(0.9, 1.6, -0.6), 0.15, 0.2, 0.4);
        if (leakSteam.visible) leakSteam.userData.step?.(0.016, new THREE.Vector3(1.6, 1.1, -0.8), 0.2, 0.3, 0.5);
        const step = session?.step;
        if (step?.id === "proof-jog" && session.track) canA.rotation.x += session.track.v * 0.05;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "bleed-pressure") {
          repaint(steamGaugeFace, signFace(`${Math.round(gg.t * 400)} kPa`, { bg: "#0d1c24", accent: gg.t <= 0.12 ? "#59c97b" : "#f2ae14", fg: "#ffe9b0", scale: 0.5 }));
        }
        void t;
      },
    };
  },
};
