import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, mat, particles,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, cone, instrument, standingFigure, lockTag,
  surfaceTexture, texturedMat, pavingFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Tie & Rail Replacement with Track Machines VR — Mobility & Transit.
//
// A short cut of rail and its ties, taken out from under the gang with the
// machines that actually do the lifting: a rail-bound crane for the ties
// nobody carries by hand, a saw for the rail itself, and a tamper to close
// the ballast back up around what went in. Every machine here is on its own
// working limits, and every one of them can crush, cut or pinch something
// that isn't a rail. Generic freight territory; no railroad, milepost or
// timetable named.

const RA_TRM_ACCENT = 0x6b8fa3;
const RA_TRM_CSS = "#6b8fa3";

export const SIM_RA_TIE_AND_RAIL_REPLACEMENT_WITH_TRACK_MACHINES = {
  id: "ra-tie-and-rail-replacement-with-track-machines",
  index: "423",
  domain: "Track",
  trade: "Track maintenance machine operator / gang laborer",
  category: "Mobility & Transit",
  weather: "clear",
  certification: "BMWED-qualified roadway equipment operator, working inside FRA 49 CFR Part 214 roadway maintenance machine protection; the finished tie and rail work is held to FRA 49 CFR Part 213 track safety standards for the class of track being restored, and the dispatcher's working limits are the only thing keeping a BLET-qualified engineer or a SMART-TD-qualified conductor off this section while the gang has it apart",
  name: "Tie & Rail Replacement with Track Machines",
  title: simTitle("Tie & Rail Replacement"),
  tagline: "A crane swings a tie out and a new one in, a saw parts the old rail, a new length is dressed to the joint, and a tamper closes the ballast back around all of it — with a swing radius, a hot cut and a pinching bank in play the whole time",
  accent: RA_TRM_ACCENT,
  accentCss: RA_TRM_CSS,
  parSeconds: 320,
  footprint: 2.4,
  supportLine: "your roadmaster or your BMWED local if a near-miss on the machines is still sitting with you after shift",
  badge: { id: "cut-closed-clean", name: "Cut Closed Clean", note: "Tie and rail changed out, the ballast tamped back and the crew never once inside a machine's own hazard zone" },

  game: system({
    name: "Machine Gang Authority",
    currency: "LIMIT",
    ranks: ["Track Laborer", "Machine Operator", "Gang Leader", "Track Supervisor", "Machine Gang Certified"],
    badges: [
      { id: "clear-of-swing", name: "Clear Of Swing", note: "Never once inside a machine's own working radius", test: AWARD.safe },
      { id: "gauge-true", name: "Gauge True", note: "Every gauge and torque reading near band centre", test: AWARD.precise(0.72) },
      { id: "cut-clean", name: "Clean Cut", note: "Crane, saw and tamper steps worked with no correction", test: AWARD.all(AWARD.stepClean("crane-swing"), AWARD.stepClean("rail-cut")) },
    ],
    challenges: [
      { id: "gang-time", name: "Gang Time", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-cut", name: "First Cut", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ten-clear", name: "Ten Clear", note: "Ten correct actions in a row", test: AWARD.streak(10) },
    ],
  }),

  hazards: {
    "crane-swing-radius": "You are standing inside the tie crane's slew radius while a tie is hanging from the hook. A suspended load swings with the boom whether or not the operator can see you there, and a tie that size does not need to fall far to take a leg out from under someone.",
    "hot-rail-cut": "You touched the rail end the saw just parted. A cut like that carries the heat of the abrasive wheel straight through the steel for longer than it looks like it should, and a bare hand on it is a burn before the pain even registers.",
    "tamper-pinch": "You reached into the tamping bank while it was still cycling. The tines close on the ballast with enough force to compact stone, and a hand or a boot caught in that same motion is not something the machine can tell apart from the ballast.",
    "adjacent-track-foul": "You stepped onto the adjacent track to get a better angle on the work. Your working limits cover the track the gang is tearing up, not the one next to it — that track is still open to a movement running under its own authority, with no reason to expect anybody standing on it.",
  },

  lateNotes: {
    "new-tie": "The new tie goes into the bay once the old one is actually out, seated square and centred under both rails.",
    "new-rail": "The new rail section is carried in and dressed to the joint only after the old piece has been cut clear and swung out of the way.",
    "left-bolt": "Nothing gets tallied against the closing count until the walk is actually done.",
  },

  interrupts: [
    {
      id: "hydraulic-drift",
      kind: "Load creeping under a stopped crane",
      after: "crane-swing", delay: 4, seconds: 12,
      alert: "The tie crane's boom has stopped moving but the old tie hanging from the hook is slowly swinging back over the work area on its own.",
      cue: "Nobody is driving that swing, and it is heading back over the gang.",
      target: "crane-estop",
      why: "A hydraulic system that has lost pressure does not hold a load still, it lets it drift with whatever momentum and wind are already acting on it, and a boom that looks stopped is not the same thing as a boom that is actually locked out. The e-stop is the one control on this machine that removes power from the whole circuit rather than trying to counter-steer a swing nobody commanded.",
      missNote: "You kept working under a load that was still moving. A drifting boom does not announce when it is about to swing past the point the operator expected — the tie kept coming, and the gang's own working position was exactly where it was headed.",
      wrongNote: "That will not stop a drifting boom. The e-stop kills the circuit the drift is riding on.",
    },
    {
      id: "saw-kickback",
      kind: "Abrasive wheel binding in the cut",
      after: "rail-cut", delay: 3, seconds: 11,
      alert: "The rail saw's blade has bound in the cut and the whole saw is kicking back toward the operator's hands.",
      cue: "The saw is fighting the cut instead of making it.",
      target: "saw-release",
      why: "An abrasive wheel that binds does not stall quietly — the energy already in the spinning wheel has to go somewhere, and without the operator releasing the trigger it goes into throwing the saw back along the same line the operator's hands are braced on. Letting go of the trigger is the only thing that stops the wheel fast enough to matter.",
      missNote: "You kept the trigger pulled through the bind. The saw kicked back the full length of the operator's grip before the wheel finally lost enough speed to stop fighting the cut, and there was no part of that path that was clear of a hand.",
      wrongNote: "That does not stop a bound wheel. Release the trigger first.",
    },
  ],

  steps: [
    {
      id: "briefing", kind: "select", target: "job-order-board",
      title: "Attend the job briefing",
      cue: "Read the work order: which tie and rail section, which machines, who has the crane's blind side.",
      why: "Three machines are about to work the same short stretch of track, and the only thing keeping their hazard zones from overlapping onto a person is everyone knowing beforehand where each machine will be and who is watching its blind side.",
    },
    {
      id: "protection-plan", kind: "sequence",
      targets: ["radio-handset", "post-lookout"],
      itemNames: { "radio-handset": "request working limits from the dispatcher", "post-lookout": "post the machine lookout" },
      title: "Set the machine protection",
      cue: "Request the working limits first, then post a lookout who can see every machine's blind side.",
      why: "A roadway maintenance machine works under the same limits as the gang around it, and posting a lookout before the limits exist is protecting a worksite the signal system still treats as open track — the paperwork and the ground truth have to agree before anyone relies on either of them.",
      outOfOrderNote: "Wrong order — the limits have to exist first. A lookout posted before the dispatcher grants anything is watching over track the signal system still treats as open.",
    },
    {
      id: "crane-swing", kind: "turn", target: "crane-boom",
      title: "Swing the tie crane over the old tie",
      cue: "Turn the boom control until the hook sits directly over the tie marked for removal.",
      why: "A hook that is not square over the tie lifts it at an angle, and a tie swinging off-centre the moment it clears the ballast is exactly the load this machine's whole hazard zone exists to keep people clear of — a straight lift is a predictable one, and predictable is the entire point of a swing radius anybody can actually stand outside of.",
      turn: { turns: 0.3, axis: "y", label: "CRANE BOOM" },
    },
    {
      id: "swing-clearance", kind: "track", target: "swing-dial", seconds: 6,
      title: "Hold the crew clear while the tie comes out",
      cue: "Keep the crew clearance reading in the green band while the crane lifts the old tie clear of the bay.",
      why: "The lift itself is the moment the swing radius is actually occupied by a moving load, and holding the clearance reading in band is how the gang proves — not assumes — that everyone stayed outside it for the whole lift rather than just at the start of it.",
      track: { label: "CLEARANCE", green: [0.4, 0.68], rise: 0.48, fall: 0.4, drift: 0.12, readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "Clearance dropped out of band. Someone drifted inside the swing radius while the tie was still moving, and the crane's boom has no way to know that.",
    },
    {
      id: "carry-tie", kind: "drag", target: "new-tie",
      title: "Carry the new tie to the bay",
      cue: "Carry the new tie from the rack to the empty bay the crane just cleared.",
      why: "The bay stays empty for as short a time as possible — an open bay under a loaded track is a soft spot the next passing movement finds immediately, so the new tie goes in as soon as the old one is actually clear, carried across rather than dropped in from wherever it happens to land.",
      drag: { to: "tie-bay", radius: 0.32, missNote: "Not seated in the bay — carry it the rest of the way and set it square under both rails." },
    },
    {
      id: "gauge-check", kind: "gauge", target: "track-gauge",
      title: "Check gauge over the new tie",
      cue: "Set the gauge across the rails over the new tie and commit inside tolerance.",
      why: "A new tie that seats the rails outside gauge tolerance has fixed nothing — it has moved the defect from a rotten tie to a wheel that starts climbing the rail head instead of following it, which is how a maintenance job turns into a derailment nobody saw building.",
      gauge: {
        label: "TRACK GAUGE", speed: 0.68, green: [0.44, 0.6],
        readout: (t) => `${(1420 + t * 30).toFixed(0)} mm`,
        missNote: "Outside tolerance for this class of track. Adjust before spiking down.",
      },
    },
    {
      id: "rail-cut", kind: "hold", target: "saw-trigger", seconds: 5,
      title: "Cut the old rail clear",
      cue: "Hold the saw trigger until the abrasive wheel has parted the rail cleanly.",
      why: "A rail cut half-through and then forced the rest of the way leaves a ragged, work-hardened edge that has to be ground back before a new joint can bolt up square — holding the cut through to the end, at the saw's own pace, is what leaves a face the joint bars can actually seat against.",
      holdBreakNote: "You let go mid-cut. A rail parted by force instead of finishing the cut leaves an edge nobody can bolt a clean joint to.",
    },
    {
      id: "carry-rail", kind: "drag", target: "new-rail",
      title: "Carry the new rail section in",
      cue: "Carry the new rail length from the rack and set it against the cut end.",
      why: "The new section is carried in and set against the existing rail only once the old piece is actually cut clear and swung aside — setting it too soon means dressing a joint against rail that is about to move, and a joint dressed against a moving reference is a joint that has to be redone.",
      drag: { to: "rail-joint", radius: 0.35, missNote: "Not set against the joint — carry it the rest of the way to the cut end." },
    },
    {
      id: "joint-torque", kind: "gauge", target: "joint-bolts",
      title: "Torque the joint bolts",
      cue: "Take up the joint bolts and commit once the torque reading is in band.",
      why: "A joint bolted too loose works itself looser under every axle that crosses it until the bars stop doing their job of carrying the rail ends together; bolted too tight, the bars themselves can crack. The band exists because both failures start from the same wrench.",
      gauge: {
        label: "JOINT TORQUE", speed: 0.7, green: [0.5, 0.72],
        readout: (t) => `${Math.round(t * 400)} N·m`,
        missNote: "Outside the joint's torque band. Back it off or take it up further before moving on.",
      },
    },
    {
      id: "tamp", kind: "track", target: "tamper-throttle", seconds: 6,
      title: "Tamp the ballast around the new tie",
      cue: "Hold the tamper's vibration in the green band while the tines close on the ballast.",
      why: "Ballast that is not compacted evenly around a new tie leaves it riding on stone that has not actually taken a set, and the first heavy train through will find every soft spot the tamper skipped — steady vibration in band is what actually seats the stone rather than just disturbing it.",
      track: { label: "TAMP", green: [0.42, 0.66], rise: 0.5, fall: 0.4, drift: 0.1, readout: (v) => `${Math.round(v * 100)}%` },
      holdBreakNote: "The tamping vibration dropped out of band. Ballast that only gets disturbed and never actually compacted is a soft spot the next train will find on its own.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["left-bolt", "loose-bar"],
      itemNames: { "left-bolt": "spare bolt left on the ballast", "loose-bar": "joint bar left unbolted" },
      itemNotes: {
        "left-bolt": "Caught before the tally closed — a bolt in the four foot is exactly the foreign object the walk exists to catch.",
        "loose-bar": "A joint bar with only some of its bolts run up is a joint that has not actually finished being made.",
      },
      title: "Walk the worksite before you release it",
      cue: "Scan the worksite and clear anything that didn't make it back onto the machine before the limits go back.",
      why: "Three machines and a full tie change leave a lot behind that isn't ballast — a loose bolt, an unbolted bar, a dropped spike maul. The walk is the only check that catches what the work itself left behind.",
    },
    {
      id: "muster", kind: "select", target: "muster-tally",
      title: "Take the headcount",
      cue: "Count the gang and every machine operator against the roster.",
      why: "Machines get shut down and locked out before the limits go back, and a headcount is the only check that confirms every operator is actually off their machine and standing clear, not still finishing something in a hazard zone nobody is watching anymore.",
    },
    {
      id: "release-limits", kind: "hold", target: "radio-handset", seconds: 4,
      title: "Release the working limits",
      cue: "Call the dispatcher and hold the radio for the read-back giving the limits up.",
      why: "The track stays under the gang's protection until the dispatcher has heard the limits given up and read them back — walking away without that call is how a set of limits never actually closes, and the next crew that needs this track has no way to know it is clear until that read-back has actually happened.",
      holdBreakNote: "You let go before the read-back came back. Limits are not released until the dispatcher has said so in your own hearing.",
    },
    {
      id: "close-log", kind: "select", target: "closing-log",
      title: "Close the job briefing",
      cue: "Log the tie and rail changed, the torque readings and the time the limits closed.",
      why: "The next inspection only knows what this closing entry tells it — which tie, which rail, what it was torqued to, and the exact minute the track went back to normal authority. An unclosed log is a job that, on paper, never actually finished, however clean the ballast looks when the gang drives away.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, RA_TRM_ACCENT);

    // ------------------------------------------------------------- textures
    const ballastTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#5c5850"); grad.addColorStop(1, "#403c36");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        const x = (i * 61.1) % w, y = (i * 83.7) % h, r = 1.4 + ((i * 13) % 5) * 0.5;
        cx.fillStyle = i % 4 === 0 ? "rgba(150,140,122,0.55)" : "rgba(30,26,20,0.45)";
        cx.beginPath(); cx.ellipse(x, y, r, r * 0.7, (i % 6) * 0.5, 0, 7); cx.fill();
      }
    }, { repeat: 6 });
    const ballastMat = texturedMat(ballastTex, { rough: 0.96, color: 0x928c80 });

    const tieTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "#3a2c20"); grad.addColorStop(0.5, "#2c2117"); grad.addColorStop(1, "#382a1e");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.strokeStyle = "rgba(0,0,0,0.35)"; cx.lineWidth = 2;
      for (let i = 0; i < 10; i++) { cx.beginPath(); cx.moveTo(0, (i / 10) * h + 4); cx.bezierCurveTo(w * 0.3, (i / 10) * h - 3, w * 0.7, (i / 10) * h + 6, w, (i / 10) * h); cx.stroke(); }
    }, { repeat: 1 });
    const tieMat = texturedMat(tieTex, { rough: 0.9, color: 0x8a7a68 });
    const newTieMat = texturedMat(tieTex, { rough: 0.85, color: 0xb9a184 });

    const railTex = surfaceTexture((cx, w, h) => {
      const grad = cx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c7ccd1"); grad.addColorStop(0.5, "#8a9096"); grad.addColorStop(1, "#5b6167");
      cx.fillStyle = grad; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "rgba(120,70,40,0.18)";
      for (let i = 0; i < 30; i++) cx.fillRect((i * 37) % w, 0, 2, h);
    }, { repeat: 3 });
    const railMat = texturedMat(railTex, { rough: 0.32, metal: 0.75, color: 0xaab0b6 });

    const platformTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#4a5158", base2: "#3d434a", seam: "rgba(0,0,0,0.5)",
    }), { repeat: 3 });
    const platformMat = texturedMat(platformTex, { rough: 0.9, color: 0xb7c2ca });

    const steelTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#3f4750"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 14; i++) {
        cx.fillStyle = i % 2 ? "rgba(0,0,0,0.22)" : "rgba(255,255,255,0.08)";
        cx.fillRect((i / 14) * w, 0, w / 28, h);
      }
    }, { repeat: 2 });
    const steelMat = texturedMat(steelTex, { rough: 0.55, metal: 0.55, color: RA_TRM_ACCENT });

    // ------------------------------------------------------------- the track
    const ballast = box(g, 5.4, 0.16, 1.6, 0, 0.08, 0, 0x928c80, { rough: 0.98 });
    ballast.material = ballastMat;
    for (const sx of [-1, 1]) {
      const rail = box(g, 5.4, 0.1, 0.06, 0, 0.21, sx * 0.36, 0xaab0b6, { rough: 0.32, metal: 0.75 });
      rail.material = railMat;
    }
    for (let i = -10; i <= 10; i++) {
      const tie = box(g, 0.16, 0.06, 0.9, i * 0.26, 0.11, 0, 0x8a7a68, { rough: 0.9 });
      tie.material = tieMat;
    }
    // The tie bay: the specific slot the work targets.
    hits["tie-bay"] = box(g, 0.16, 0.3, 0.9, 0.13, 0.15, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });

    // Crew standing platform.
    const platform = box(g, 1.5, 0.1, 1.0, -2.3, 0.05, 1.5, 0xb7c2ca, { rough: 0.9 });
    platform.material = platformMat;
    for (let i = -3; i <= 3; i++) box(g, 0.06, 0.006, 1.0, -2.3 + i * 0.22, 0.101, 1.5, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.3, cast: false });

    // Adjacent open track, one bay over — the fouling trap.
    const adjTrack = group(g, 0, 0, -1.7);
    box(adjTrack, 5.4, 0.14, 1.2, 0, 0.07, 0, 0x716c62, { rough: 0.95 });
    for (const sx of [-1, 1]) box(adjTrack, 5.4, 0.09, 0.06, 0, 0.19, sx * 0.36, 0x9aa1a8, { rough: 0.35, metal: 0.7 });
    reg(hits, box(adjTrack, 5.4, 1.6, 1.2, 0, 0.8, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false }), "adjacent-track-foul");

    // ------------------------------------------------------------- tie crane
    const crane = group(g, -1.7, 0, -1.0, 0.6);
    box(crane, 0.7, 0.5, 1.0, 0, 0.25, 0, RA_TRM_ACCENT, { rough: 0.55, metal: 0.55 });
    box(crane, 0.7, 0.5, 1.0, 0, 0.25, 0, RA_TRM_ACCENT, { rough: 0.55, metal: 0.55 }).material = steelMat;
    cyl(crane, 0.3, 0.3, 0.2, 0, 0.6, 0, 0x3a4048, { rough: 0.6, metal: 0.4, seg: 16 });
    const boom = group(crane, 0, 0.7, 0);
    const boomArm = box(boom, 0.14, 0.14, 1.7, 0, 0, 0.85, 0xd8dce0, { rough: 0.5, metal: 0.6 });
    const hook = group(boom, 0, -0.5, 1.7);
    cyl(hook, 0.02, 0.02, 0.5, 0, 0.25, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 6 });
    torus(hook, 0.06, 0.014, 0, -0.02, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8, seg2: 16 });
    reg(hits, boomArm, "crane-boom");
    const estop = cyl(crane, 0.05, 0.055, 0.04, 0.3, 0.72, -0.1, 0xf0645b, { rough: 0.4, emissive: 0xf0645b, ei: 1.4, seg: 12 });
    holoTag(crane, "Crane E-Stop", 0.3, 0.86, -0.1, { css: "#f0645b", w: 0.3 });
    reg(hits, estop, "crane-estop");
    holoTag(crane, "Tie crane", 0, 1.0, 0.6, { css: RA_TRM_CSS, w: 0.28 });
    reg(hits, boom, "crane-swing-radius");

    // The old tie, hanging from the hook once lifted; visible from the start
    // lying in its bay.
    const oldTie = box(g, 0.16, 0.06, 0.86, 0.13, 0.13, 0, 0x352c22, { rough: 0.95 });

    // Swing clearance dial.
    const swingDial = instrument(g, -0.9, 0.86, 1.1, { ry: 0.4, idle: "SWING", color: RA_TRM_ACCENT });
    holoTag(swingDial, "Swing clearance", 0, 0.15, 0, { css: RA_TRM_CSS, w: 0.32 });
    reg(hits, swingDial, "swing-dial");

    // ------------------------------------------------------------- tie rack
    const tieRack = group(g, -2.6, 0, 1.4, -0.4);
    box(tieRack, 1.0, 0.5, 0.3, 0, 0.25, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const newTie = box(tieRack, 0.16, 0.06, 0.86, 0, 0.55, 0, 0xb9a184, { rough: 0.85 });
    newTie.material = newTieMat;
    holoTag(tieRack, "New tie", 0, 0.72, 0, { css: RA_TRM_CSS, w: 0.24 });
    reg(hits, newTie, "new-tie");

    // ------------------------------------------------------------- rail saw
    const sawStand = group(g, 1.6, 0, -1.1, -0.5);
    box(sawStand, 0.4, 0.3, 0.3, 0, 0.15, 0, 0x3a4048, { rough: 0.7, metal: 0.4 });
    const sawArm = group(sawStand, 0, 0.3, 0);
    cyl(sawArm, 0.03, 0.03, 0.6, 0, 0.3, 0, 0x50575e, { rough: 0.55, metal: 0.5, seg: 8 });
    const sawBlade = cyl(sawArm, 0.16, 0.16, 0.02, 0, 0.6, 0.05, 0xc0c6cc, { rough: 0.4, metal: 0.7, seg: 20 });
    sawBlade.rotation.x = Math.PI / 2;
    const sawTrigger = box(sawArm, 0.05, 0.08, 0.04, -0.12, 0.32, 0, 0xf0645b, { rough: 0.5, emissive: 0xf0645b, ei: 0.8 });
    holoTag(sawStand, "Rail saw", 0, 0.75, 0, { css: RA_TRM_CSS, w: 0.24 });
    reg(hits, sawTrigger, "saw-trigger");
    const sawRelease = box(sawArm, 0.09, 0.05, 0.04, 0.12, 0.32, 0, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.5 });
    reg(hits, sawRelease, "saw-release");
    const sparks = particles(sawArm, 16, 0xffcf6b, { size: 0.03, life: 0.35, additive: true, opacity: 0.7 });
    sparks.position.set(0, 0.6, 0.05);
    sparks.visible = false;
    const hotCutEnd = box(g, 0.1, 0.1, 0.1, 1.33, 0.19, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, hotCutEnd, "hot-rail-cut");

    // The rail joint the saw is working, and the new section beside it.
    const jointBolts = group(g, 1.15, 0.19, 0.36);
    box(jointBolts, 0.24, 0.1, 0.03, 0, 0, 0, 0x8b929a, { rough: 0.4, metal: 0.6 });
    holoTag(jointBolts, "Joint bolts", 0, 0.15, 0, { css: RA_TRM_CSS, w: 0.26 });
    reg(hits, jointBolts, "joint-bolts");
    hits["rail-joint"] = box(g, 0.2, 0.2, 0.2, 1.45, 0.2, 0.36, 0x000000, { opacity: 0.001, transparent: true, cast: false });

    const railRack = group(g, 2.6, 0, 1.4, -0.3);
    box(railRack, 0.24, 0.3, 0.24, 0, 0.15, 0, 0x50575e, { rough: 0.6, metal: 0.4 });
    const newRail = box(railRack, 0.1, 0.09, 1.1, 0, 0.38, 0, 0xaab0b6, { rough: 0.32, metal: 0.75 });
    holoTag(railRack, "New rail", 0, 0.5, 0, { css: RA_TRM_CSS, w: 0.24 });
    reg(hits, newRail, "new-rail");

    // ------------------------------------------------------------- tamper
    const tamper = group(g, 2.0, 0, -1.0, -1.0);
    box(tamper, 0.6, 0.4, 1.1, 0, 0.3, 0, RA_TRM_ACCENT, { rough: 0.55, metal: 0.5 }).material = steelMat;
    cyl(tamper, 0.15, 0.15, 0.4, -0.25, 0.15, -0.5, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 12 });
    cyl(tamper, 0.15, 0.15, 0.4, 0.25, 0.15, -0.5, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 12 });
    const tampBank = box(tamper, 0.5, 0.3, 0.2, 0, 0.1, 0.5, 0x50575e, { rough: 0.6, metal: 0.5 });
    const throttle = cyl(tamper, 0.04, 0.04, 0.1, 0.2, 0.6, -0.3, 0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.6, seg: 10 });
    holoTag(tamper, "Tamper", 0, 0.75, 0, { css: RA_TRM_CSS, w: 0.24 });
    reg(hits, throttle, "tamper-throttle");
    reg(hits, tampBank, "tamper-pinch");

    // ------------------------------------------------------------- briefing, radio, crew
    const briefingBoard = holoPanel(g, 0.6, 0.42, -2.7, 1.55, 2.0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_TRM_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c7d3da";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("JOB ORDER · MACHINE GANG", w * 0.06, h * 0.14);
      cx.fillStyle = "#eef3f6";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("TIE 214 & RAIL JOINT — TRACK 1", w * 0.06, h * 0.32);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#c0ccd3";
      ["Crane, saw and tamper — three hazard zones", "Torque and gauge tolerance: per the standard", "Lookout covers every machine's blind side"]
        .forEach((line, i) => cx.fillText(line, w * 0.06, h * (0.5 + i * 0.12)));
    }, { ry: 0.6, accent: RA_TRM_ACCENT });
    reg(hits, briefingBoard, "job-order-board");

    const radio = group(g, -1.8, 0, 2.2, -0.3);
    slab(radio, 0.5, 0.16, 0.16, 0, 0.85, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const radioScreen = decal(radio, 0.4, 0.1, 0, 0.87, 0.09,
      signFace("STANDBY", { bg: "#0d1c24", accent: RA_TRM_CSS, fg: "#cfe6ff", scale: 0.5 }), { glow: true, ei: 0.85, px: 256 });
    holoTag(radio, "Dispatcher line", 0, 1.05, 0.08, { css: RA_TRM_CSS, w: 0.32 });
    reg(hits, radio, "radio-handset");

    const lookoutFig = standingFigure(g, 3.0, 1.9, { ry: -2.2, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(lookoutFig, "Lookout", 0, 1.95, 0.15, { css: RA_TRM_CSS, w: 0.24 });
    reg(hits, lookoutFig, "post-lookout");

    const laborer = standingFigure(g, -0.9, -2.0, { ry: 1.6, cloth: 0x2b3138, vest: 0xf2894b, helmet: 0xf2f2f2 });

    const gaugeTool = group(g, 0.1, 0, 0.1, -0.2);
    box(gaugeTool, 0.22, 0.03, 0.03, 0, 0.22, 0, 0xdfe4e8, { rough: 0.4, metal: 0.5 });
    reg(hits, gaugeTool, "track-gauge");

    // Walk-round finds: a spare bolt dropped on the ballast, a joint bar
    // left with only some of its bolts run up.
    const leftBolt = group(g, -0.6, 0.13, 0.5, 0.3);
    cyl(leftBolt, 0.014, 0.014, 0.06, 0, 0, 0, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 8 }).rotation.z = Math.PI / 2;
    reg(hits, leftBolt, "left-bolt");
    const looseBar = group(g, 1.7, 0.19, 0.5, 0.1);
    box(looseBar, 0.3, 0.08, 0.02, 0, 0, 0, 0x50575e, { rough: 0.55, metal: 0.5 });
    reg(hits, looseBar, "loose-bar");

    // Muster and closing log.
    const tally = holoPanel(g, 0.4, 0.26, -1.8, 1.35, 2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = RA_TRM_CSS; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eef3f6";
      cx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("GANG TALLY", w / 2, h * 0.34);
      cx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      cx.fillStyle = "#c0ccd3";
      cx.fillText("Every operator off the machine", w / 2, h * 0.66);
    }, { ry: 0.6, accent: RA_TRM_ACCENT });
    reg(hits, tally, "muster-tally");

    const closeLog = group(g, -2.6, 0, 2.5, -0.4);
    slab(closeLog, 0.4, 0.05, 0.3, 0, 0.86, 0, 0x2b3138, { radius: 0.02, rough: 0.5 });
    const closeScreen = decal(closeLog, 0.32, 0.16, 0, 0.89, 0.0, signFace("OPEN", { bg: "#0d1c24", accent: RA_TRM_CSS, fg: "#cfe6ff", scale: 0.4 }), { glow: true, ei: 0.8, px: 220 });
    closeScreen.rotation.x = -Math.PI / 2;
    holoTag(closeLog, "Closing log", 0, 1.0, 0, { css: RA_TRM_CSS, w: 0.3 });
    reg(hits, closeLog, "closing-log");

    cone(g, -2.7, 1.0, { color: RA_TRM_ACCENT });
    cone(g, 2.7, 1.0, { color: RA_TRM_ACCENT });

    return {
      hits,
      footprint: 2.4,

      onInterrupt(it) {
        if (it.id === "hydraulic-drift") boom.rotation.y = 0.5;
        if (it.id === "saw-kickback") { sawArm.rotation.z = -0.5; sparks.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "hydraulic-drift") boom.rotation.y = 0;
        if (it.id === "saw-kickback") { sawArm.rotation.z = 0; sparks.visible = false; }
      },

      onStepComplete(step) {
        if (step.id === "protection-plan") repaint(radioScreen, signFace("LIMITS\nGRANTED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.3 }));
        if (step.id === "crane-swing") boom.rotation.y = -0.35;
        if (step.id === "swing-clearance") oldTie.visible = false;
        if (step.id === "carry-tie") { newTie.position.set(0.13, 0.14, 0); newTie.rotation.set(0, 0, 0); g.add(newTie); }
        if (step.id === "gauge-check") { /* gauge confirmed visually via readout */ }
        if (step.id === "rail-cut") { sawBlade.material = mat(0xf0645b, { rough: 0.4, metal: 0.7 }); }
        if (step.id === "carry-rail") { newRail.position.set(1.45, 0.19, 0); newRail.rotation.set(0, 0, 0); g.add(newRail); }
        if (step.id === "joint-torque") jointBolts.children.forEach((c) => { c.material = mat(0x59c97b, { rough: 0.4, metal: 0.6 }); });
        if (step.id === "tamp") throttle.material = mat(0x59636d, { rough: 0.5 });
        if (step.id === "walk") { leftBolt.visible = false; looseBar.visible = false; }
        if (step.id === "muster") repaint(tally.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
          cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
          cx.fillStyle = "#eef3f6";
          cx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle";
          cx.fillText("GANG COUNT — ALL CLEAR", w / 2, h * 0.5);
        });
        if (step.id === "release-limits") repaint(radioScreen, signFace("LIMITS\nRELEASED", { bg: "#0d1c14", accent: RA_TRM_CSS, fg: "#cfe6ff", scale: 0.3 }));
        if (step.id === "close-log") repaint(closeScreen, signFace("CLOSED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.4 }));
      },

      animate(t, dt, session) {
        lookoutFig.userData.head.rotation.y = Math.sin(t * 0.7) * 0.7;
        laborer.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;

        const gg = session?.gauge;
        if (gg && !gg.committed) {
          if (session.step?.id === "gauge-check") {
            // visual cue only; readout text handled by step's own gauge config
          }
          if (session.step?.id === "joint-torque") {
            jointBolts.children.forEach((c) => {
              c.material = mat(gg.t > 0.5 && gg.t < 0.72 ? 0x59c97b : 0xf2c14b, { rough: 0.4, metal: 0.6 });
            });
          }
        }
        const tr = session?.track;
        if (tr && session.step?.id === "swing-clearance") swingDial.userData.show?.(`${Math.round(tr.v * 100)}%`);
        if (tr && session.step?.id === "tamp") tampBank.position.y = 0.1 + Math.sin(t * 20) * 0.01;
      },
    };
  },
};
