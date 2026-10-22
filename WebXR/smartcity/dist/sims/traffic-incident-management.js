import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, mat,
  standingPerson,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone, reg,
  surfaceTexture, texturedMat, pavingFace, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Traffic Incident Management VR — First Responder series, the
// unified-command station.
//
// A single-vehicle crash on a wet highway shoulder, worked the way a traffic
// incident management plan actually says to work it: the block set upstream
// with the patrol car before anybody steps out, the taper built for the posted
// speed rather than for the number of cones in the boot, the engine shielding
// the work area, the ambulance's load door on the protected side, the tow
// staged downstream, and the lane given back the moment it can be.
//
// Struck-by is the leading cause of death for responders on a roadway, and
// every step here is either the geometry that prevents it or the sentence that
// keeps a frightened driver out of a live lane. The three services in the
// scene — police, fire and the state transportation department — are named as
// roles under one plan, because that is the only way quick clearance works.

const TIMP_ACCENT = 0xf2a23b;

export const SIM_TRAFFIC_INCIDENT_MANAGEMENT = {
  id: "traffic-incident-management",
  index: "205",
  domain: "Emergency Services",
  trade: "Police officer with fire and DOT under the traffic incident management plan",
  category: "Emergency Services",
  district: "Emergency Services",
  weather: "rain",
  certification: "The MUTCD's temporary traffic control for incident management — the advance warning area, a merging taper computed from the lane width and the posted speed, and a buffer space nobody works inside; the national Traffic Incident Management responder training the Federal Highway Administration sponsors, which is where the quick-clearance and unified-command language in this station comes from; ANSI/ISEA 107 high-visibility safety apparel, worn by every responder in the right-of-way; NFPA 1500 for fire-apparatus positioning and member safety on a roadway incident; OSHA 29 CFR 1910.132 for the hazard assessment behind that vest; NIMS/ICS through FEMA IS-100 and IS-700 for the unified command police, fire, EMS and the state transportation department actually work inside; the state transportation department's own open-roads policy on clearance times",
  name: "Traffic Incident Management",
  title: simTitle("Traffic Incident Management"),
  tagline: "Wet shoulder, live lane: the block set upstream, the taper built for the posted speed, the engine shielding, the driver kept out of the lane — and the lane given back",
  accent: TIMP_ACCENT,
  accentCss: "#f2a23b",
  parSeconds: 375,
  footprint: 3.0,
  badge: { id: "lane-given-back", name: "Lane Given Back", note: "Blocked, tapered, shielded and cleared — nobody in the buffer, and the lane reopened on the plan's clock" },

  game: system({
    name: "Open Roads",
    currency: "CLEARANCE",
    ranks: ["Patrol Officer", "TIM Trained", "Scene Commander", "Unified Command", "TIM Instructor"],
    badges: [
      { id: "geometry-first", name: "Geometry First", note: "The block, the taper and the shield all set before anybody worked in the open", test: AWARD.stepClean("set-the-taper") },
      { id: "nobody-struck", name: "Nobody In The Lane", note: "No unsafe action anywhere on the scene", test: AWARD.safe },
      { id: "eyes-upstream", name: "Eyes Upstream", note: "Both timed periods carried the full count", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-scene", name: "Clean Scene", note: "No corrections anywhere on the scene", test: AWARD.clean },
      { id: "taper-to-spec", name: "Taper To Spec", note: "Taper length and upstream watch both inside their bands", test: AWARD.precise(0.72) },
      { id: "quick-clearance", name: "Quick Clearance", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "stand-in-the-live-lane": "You are standing in an open travel lane with your back to approaching traffic, in rain. Struck-by is what kills responders on a roadway, and it happens to people who stepped into a lane for ten seconds because the work was there — the lane is either closed and coned or it is somewhere nobody stands.",
    "taper-toward-traffic": "You started the cones at the crash and walked upstream into the traffic you had not yet warned. A taper is built from the advance warning end toward the scene so that every cone you set is protected by the ones already behind you — built the other way, you spend the whole job walking at oncoming vehicles.",
    "no-vest-shoulder": "You stepped out onto the shoulder in a dark uniform on a wet night with the vest still in the boot. High-visibility apparel is required of every responder in the right-of-way precisely because a driver's headlights are the only thing making you exist, and rain takes most of that away before it reaches them.",
    "park-downstream": "You set the patrol car past the crash, downstream of the work. A blocking vehicle only blocks what is behind it — parked downstream it shields nothing, and the first thing an inattentive driver reaches is the crew rather than four tons of car with its lights on.",
  },

  lateNotes: {
    "tow-request": "The tow gets called once the scene is protected and you know what it actually needs — requested from the shoulder before the block is set, it arrives into an unprotected scene and becomes another vehicle to keep out of the lane.",
    "driver-words-card": "The driver gets spoken to properly once they are somewhere safe to be spoken to. A conversation held in the lane keeps them in the lane.",
  },

  steps: [
    {
      id: "arrival-size-up", kind: "find", noHint: true,
      targets: ["read-live-lane", "read-crash-position", "read-driver-at-rail"],
      itemNames: {
        "read-live-lane": "the live lane, still running at speed",
        "read-crash-position": "the vehicle, front corner into the rail",
        "read-driver-at-rail": "the driver, out and walking about",
      },
      itemNotes: {
        "read-live-lane": "Traffic has not slowed and nothing upstream tells it to yet. That is the hazard that decides everything about the next four minutes.",
        "read-crash-position": "The vehicle is off the travel lane and against the rail, which means this is a shoulder job — the lane closure is for the crew and the tow, not for the car.",
        "read-driver-at-rail": "They are on their feet and moving around, which is a good sign medically and a problem tactically: an uninjured driver in shock walks wherever their phone is.",
      },
      title: "Size up from the seat before you open the door",
      cue: "Read it from inside the car: the live lane, where the vehicle sits, where the driver is.",
      why: "The first decision on a roadway incident is made before a door opens, because once you are out of the car your options narrow to whatever the geometry already allows. Where the lane is, where the vehicle is and where the driver is walking are the three facts that set the block position, the size of the closure and how urgently somebody has to get to that person — and all three are visible from the seat.",
    },
    {
      id: "set-the-block", kind: "drag", target: "patrol-car",
      title: "Set the block with the patrol car",
      cue: "Put the car upstream of the work, angled across the closed lane, wheels turned away.",
      drag: {
        to: "block-position", radius: 0.7,
        missNote: "Not upstream of the work. The block has to sit between approaching traffic and everybody working, or it is just a parked car with its lights on.",
      },
      why: "The blocking vehicle is the only piece of hard protection on a roadway incident and its position is the whole of its value: upstream of the work, angled so a strike pushes it away from the crew rather than through them, wheels turned toward the shoulder so it cannot roll into the work area. Four tons of car takes a hit that no cone, no vest and no amount of attention would have survived.",
    },
    {
      id: "vest-before-stepping-out", kind: "select", target: "hi-vis-vest",
      title: "Vest on before you step out",
      cue: "Take the high-visibility vest out of the kit and put it on — before the door, not after.",
      why: "High-visibility apparel is required of everyone working in the right-of-way, and the reason is measurable: retroreflective material returns headlight light to the driver's eye at a distance a dark uniform never reaches, and rain on a windscreen takes away most of what is left. The vest also has to go on before you are exposed — the moment nobody goes back for it is the moment they first see the scene.",
    },
    {
      id: "taper-length", kind: "gauge", target: "taper-length-gauge",
      title: "Work out the taper length for the posted speed",
      cue: "Set the merging taper for a closed lane at highway speed, then commit the reading.",
      gauge: {
        label: "TAPER m", speed: 0.6, green: [0.55, 0.68],
        readout: (t) => `${Math.round(t * 400)} m`,
        missNote: "That taper is wrong for the posted speed. Short, and drivers arrive at the closure with no room to merge; far too long and the closure starts before any of the advance warning does.",
      },
      why: "A taper is a calculation, not a feel. The MUTCD sets the merging taper from the lane width and the posted speed, and at highway speeds the length in feet is the lane width times the speed in miles per hour — on a twelve-foot lane at sixty-five that is something near eight hundred feet, not the forty feet of cones somebody happens to have in the boot. Too short and traffic meets the closure without room to merge, which is how a secondary crash starts.",
    },
    {
      id: "set-the-taper", kind: "sequence",
      targets: ["cone-advance", "cone-taper-a", "cone-taper-b", "cone-buffer"],
      itemNames: {
        "cone-advance": "advance warning cone, furthest upstream",
        "cone-taper-a": "first taper cone, working toward the scene",
        "cone-taper-b": "second taper cone",
        "cone-buffer": "buffer-space cone, at the near end",
      },
      title: "Build the taper from upstream in",
      cue: "Start at the far end and work back toward the scene, never the other way.",
      why: "The order the cones go out in is a safety rule, not a tidiness preference. Set from the advance warning end toward the scene, every cone you place has the ones already behind it warning traffic on your behalf, and you are always walking with the flow. Built from the crash outward you spend the entire task walking into oncoming vehicles that have had no warning at all — which is the sequence responders are most often struck during.",
      outOfOrderNote: "Furthest upstream first, then work back toward the scene. Starting at the crash means placing every cone in front of traffic that has not been told anything yet.",
    },
    {
      id: "arrow-board", kind: "turn", target: "arrow-board-switch",
      title: "Set the arrow board to the merge",
      cue: "Wind the board round to the arrow pointing drivers into the open lane.",
      turn: { turns: 0.75, axis: "y", label: "ARROW BOARD" },
      why: "Cones tell a driver something is wrong; an arrow tells them what to do about it, from far enough back to do it calmly. On a wet night the board is visible several hundred metres before any cone resolves out of the spray, and a driver who has already merged is a driver who never arrives at your taper at all. Set to the wrong indication it is worse than nothing, because people obey it.",
    },
    {
      id: "place-the-apparatus", kind: "sequence", anyOrder: true,
      targets: ["engine-shield-spot", "ems-load-spot", "tow-staging-spot"],
      itemNames: {
        "engine-shield-spot": "the engine, shielding the work area",
        "ems-load-spot": "the ambulance, load door on the protected side",
        "tow-staging-spot": "the tow, staged downstream and out of the way",
      },
      title: "Place the apparatus — engine, ambulance, tow",
      cue: "Under one plan, in any order: the engine shields, the ambulance loads on the protected side, the tow waits downstream.",
      why: "Unified command on a roadway is mostly about where large vehicles sit. The engine goes where its mass is between traffic and the crew, with the pump panel on the protected side so nobody operates it from the lane. The ambulance's load door faces away from traffic, because a stretcher crossing behind an ambulance into a live lane is a routine way for this to go wrong. The tow stages downstream and clear so it is not one more obstruction while it waits.",
    },
    {
      id: "driver-clear-of-the-lane", kind: "drag", target: "shaken-driver",
      title: "Get the driver behind the guardrail",
      cue: "Walk them off the shoulder and behind the rail — somewhere a vehicle cannot reach.",
      drag: {
        to: "guardrail-spot", radius: 0.6,
        missNote: "Still on the shoulder. A shoulder is not a safe place, it is the place secondary crashes end up — behind the rail or nothing.",
      },
      why: "A driver standing on the shoulder of a live highway is the most exposed person on the scene and the least aware of it. Shock narrows attention to one thing — a phone, a bag, a dog in the back — and they will walk into a lane to get it without registering the traffic at all. Behind the rail is the only position on this scene that a vehicle leaving the carriageway cannot reach, and getting them there outranks every question you want to ask them.",
    },
    {
      id: "words-for-the-driver", kind: "select", target: "driver-words-card",
      title: "Tell the driver what is happening, in order",
      cue: "\"You're safe here. Nobody's hurt. Your car's going on a truck, and I'll stay with you — can I get anything out of it for you?\"",
      why: "A person in shock cannot hold a sequence of instructions, but they can hold reassurance, a fact and an offer. Saying they are safe, saying what happens to the car and offering to fetch what they need does two jobs: it is decent, and it removes the three reasons they were about to walk back into the lane. Asking before touching their belongings matters too — it is the one part of this they still have any say over.",
    },
    {
      id: "upstream-traffic-scan", kind: "track", target: "upstream-scan-point", seconds: 7,
      title: "Keep somebody's eyes upstream",
      cue: "Keep your attention moving up the taper, not down at the work.",
      track: {
        start: 0.5, green: [0.3, 0.72], rise: 0.5, fall: 0.42, drift: 0.16, label: "UPSTREAM",
        readout: (v) => (v < 0.3 ? "eyes down at the work" : v > 0.72 ? "lost the taper" : "watching upstream"),
      },
      why: "Everything set up so far assumes drivers read it. Some will not — distracted, drunk, or simply unable to stop on a wet surface — and the only defence left is somebody seeing it coming with enough time to shout. That means one person's attention stays up the taper for the whole time anybody is working in the open, and it means the work does not swallow the person doing the watching.",
      holdBreakNote: "Your attention came down onto the work, or drifted off the taper entirely. There is nothing else protecting the crew once nobody is looking upstream.",
    },
    {
      id: "tow-request", kind: "select", target: "tow-request",
      title: "Call the tow with what it actually needs",
      cue: "Request it by class: what the vehicle is, whether it rolls, and whether there is a recovery to do.",
      why: "Quick clearance runs on the first request being right. A light truck sent to a vehicle that will not roll means a second call, another twenty minutes of closed lane and a queue that is now growing faster than it clears. Saying what the vehicle is, whether the wheels turn and whether anything has to be pulled out of the rail gets the right truck on the first attempt, which is most of what an open-roads policy is asking of you.",
    },
    {
      id: "stand-with-the-driver", kind: "hold", target: "driver-stand-point", seconds: 8,
      title: "Stand with the driver while the shock settles",
      cue: "Stay with them. No documents, no questions yet — just stay there.",
      why: "The documents can wait eight seconds and the driver cannot. Somebody who has just been in a crash is running on adrenaline and will not remember a licence request or a statement given in the first minutes, which is why both are better taken later. Standing with them also keeps them where you put them: the single most reliable way to stop a driver walking back toward the lane is for somebody to be there not doing anything in particular.",
      holdBreakNote: "You left them on their own at the rail. That is the moment they go looking for the phone, and the lane is ten steps away.",
    },
    {
      id: "clearance-and-reopen", kind: "sequence",
      targets: ["pickup-downstream", "reopen-lane", "call-clearance"],
      itemNames: {
        "pickup-downstream": "pick the cones up from the downstream end",
        "reopen-lane": "give the lane back",
        "call-clearance": "call clearance with the times",
      },
      title: "Pick up, reopen, call clearance",
      cue: "Cones come up from the downstream end, then the lane goes back, then clearance goes over the radio.",
      why: "Taking a closure down is the mirror of putting it up: from the downstream end back, so you are never the first thing traffic meets, and so the taper is still warning drivers while you are inside it. Then the lane goes back — a lane held ten minutes longer than it needs to be is queue, and queue is where the secondary crashes happen. Clearance called with the actual times is what the open-roads policy is measured on and what tells everyone still inbound to stand down.",
      outOfOrderNote: "Downstream end first, then reopen, then call it. Reopening before the cones are up puts traffic into a lane that still has cones and people in it.",
    },
    {
      id: "tim-log", kind: "select", target: "tim-log-board",
      title: "Log the incident against the plan's clock",
      cue: "Write the times: notification, arrival, lane closed, lane open, scene clear.",
      why: "The traffic incident management plan is a set of timings and it only improves if the timings are recorded honestly. Notification to arrival, arrival to lane closed, closed to open, open to clear: those five numbers are what tell the next planning meeting whether the tow contract, the arrow board or the staging point is the thing costing twenty minutes. Left blank, every argument about roadway clearance is run on impressions.",
    },
    {
      id: "crew-check-in", kind: "select", target: "crew-checkin-board",
      title: "Check the crew before everyone rolls",
      cue: "Before anybody leaves: is everyone all right, and does anybody want the peer-support line?",
      why: "Working a wet highway with traffic a metre away is a sustained adrenaline load, and a near-miss in the taper stays with people whether or not anybody was touched. The critical-incident stress rule the department runs names peer support and the employee assistance line after any incident involving a near-miss or a serious injury, not only after a fatality, and the thirty seconds spent asking on the shoulder is what makes the number get used.",
    },
  ],

  interrupts: [
    {
      id: "car-into-the-taper",
      kind: "Vehicle intrusion",
      after: "upstream-traffic-scan", delay: 3, seconds: 10,
      alert: "A car has come straight through the advance warning and into the taper, clipping the second cone, still at highway speed.",
      cue: "Get everybody behind the block. Now — not after you see what it does.",
      target: "safety-retreat-point",
      why: "An intrusion is the event every other part of the setup exists to survive, and the response is movement, not observation. Behind the blocking vehicle is the one place on this scene that a car in the taper cannot reach; anywhere in the buffer space is inside its stopping distance on wet asphalt. Waiting to see whether it corrects is spending the only seconds the watch just bought you.",
      missNote: "Nobody moved. The car found the shoulder on its own and went past, which is the outcome most intrusions have — and the reason people stop moving for the next one, right up until the one that does not.",
      wrongNote: "Not that. The cone, the radio and the arrow board are all things to fix afterwards; the only thing that matters in the next two seconds is everybody being behind the block.",
    },
    {
      id: "driver-toward-the-lane",
      kind: "Driver in shock",
      after: "stand-with-the-driver", delay: 3, seconds: 11,
      alert: "The driver has stepped over the rail and started back toward the travel lane — they have decided their phone is still in the car.",
      cue: "Get in front of them and offer to fetch it yourself.",
      target: "phone-retrieval-offer",
      why: "Somebody in shock with one fixed idea does not hear an instruction to stop, and shouting at them from behind speeds them up. Putting yourself between them and the lane and offering to get the phone replaces the idea rather than arguing with it, which is the only thing that reliably works — and it means the person who ends up near the vehicle is the one wearing the vest and watching the traffic.",
      missNote: "They made it to the vehicle on the shoulder with traffic passing a metre away and came back with the phone. Nothing happened, and nothing about the scene made it any less likely to happen the next time somebody's phone was in a car.",
      wrongNote: "Not from where you are. Calling after them from behind does not stop somebody in shock — step into their path and take the errand off them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, TIMP_ACCENT);

    // ------------------------------------------------------------- carriageway
    // Traffic runs from -z (upstream) toward +z, so the learner arrives on the
    // shoulder at the downstream end and looks up the scene: the vehicle, then
    // the block, then the taper and the engine beyond it. Facing +z the
    // right-hand shoulder is on -x, and the guardrail is beyond that.
    const roadTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, {
      tiles: 3, base: "#24282d", base2: "#1d2125", seam: "rgba(0,0,0,0.3)",
    }), { repeat: 3, px: 384 });
    const road = box(g, 6.6, 0.02, 15.0, 3.5, 0.008, -1.0, 0x24282d, { rough: 0.6, metal: 0.05, cast: false });
    road.material = texturedMat(roadTex, { rough: 0.55, metal: 0.08, color: 0x24282d });

    const shoulderTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, {
      base: "#2f3439", base2: "#262a2e", step: 30,
    }), { repeat: 3, px: 320 });
    const shoulder = box(g, 3.0, 0.02, 15.0, -1.3, 0.009, -1.0, 0x2f3439, { rough: 0.8, cast: false });
    shoulder.material = texturedMat(shoulderTex, { rough: 0.8, metal: 0.05, color: 0x2f3439 });

    // Lane line between the two travel lanes, and the edge line at the shoulder.
    for (let i = 0; i < 10; i++) {
      box(g, 0.12, 0.006, 0.9, 3.5, 0.024, -7.4 + i * 1.5, 0xe6e9ec, { rough: 0.7, cast: false });
    }
    box(g, 0.12, 0.006, 15.0, 0.2, 0.024, -1.0, 0xe6e9ec, { rough: 0.7, cast: false });

    // ---------------------------------------------------------------- guardrail
    const rail = group(g, -3.1, 0, -1.0);
    box(rail, 0.06, 0.32, 14.4, 0, 0.62, 0, 0x9aa2aa, { rough: 0.55, metal: 0.6 });
    box(rail, 0.05, 0.1, 14.4, 0, 0.44, 0, 0x7f878f, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 10; i++) box(rail, 0.1, 0.78, 0.12, -0.04, 0.39, -6.6 + i * 1.5, 0x6b737b, { rough: 0.7, metal: 0.4 });

    // ------------------------------------------------------- the crashed vehicle
    const wreck = group(g, -1.6, 0, 0.4, 0.3);
    box(wreck, 1.72, 0.56, 4.1, 0, 0.62, 0, 0x7a4e52, { rough: 0.5, metal: 0.35 });
    box(wreck, 1.6, 0.52, 2.0, 0, 1.12, 0.2, 0x5f3e42, { rough: 0.45, metal: 0.3 });
    const crumple = box(wreck, 1.5, 0.4, 0.5, -0.1, 0.5, -1.95, 0x5a3b3e, { rough: 0.7, metal: 0.2 });
    crumple.rotation.z = 0.2;
    for (const sx of [-1, 1]) for (const sz of [-1.35, 1.35]) {
      const wheel = cyl(wreck, 0.31, 0.31, 0.2, sx * 0.8, 0.31, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    box(wreck, 0.6, 0.06, 0.02, 0, 0.82, 2.06, 0xd8dde2, { rough: 0.6 });
    holoTag(wreck, "The vehicle", 0, 1.62, 0, { css: "#f2a23b", w: 0.32 });
    reg(hits, crumple, "read-crash-position");

    // --------------------------------------------------------- the patrol car
    // Parked where it stopped — downstream of the work, which is the wrong end.
    const patrol = group(g, 2.75, 0, 5.2, 0.14);
    box(patrol, 1.84, 0.6, 4.2, 0, 0.64, 0, 0x2b313a, { rough: 0.35, metal: 0.4 });
    const patrolCab = box(patrol, 1.7, 0.56, 2.05, 0, 1.16, 0.15, 0x22272e, { rough: 0.3, metal: 0.35 });
    for (const sx of [-1, 1]) for (const sz of [-1.4, 1.4]) {
      const wheel = cyl(patrol, 0.32, 0.32, 0.22, sx * 0.85, 0.32, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const patrolBar = group(patrol, 0, 1.5, 0.3);
    box(patrolBar, 1.14, 0.12, 0.28, 0, 0, 0, 0x1b1f24, { rough: 0.5 });
    const patrolRed = box(patrolBar, 0.42, 0.1, 0.24, -0.3, 0.02, 0, 0xd8322a, { emissive: 0xd8322a, ei: 2.0, rough: 0.4 });
    const patrolBlue = box(patrolBar, 0.42, 0.1, 0.24, 0.3, 0.02, 0, 0x3c6cf0, { emissive: 0x3c6cf0, ei: 2.0, rough: 0.4 });
    holoTag(patrol, "Patrol car — the block", 0, 1.86, -0.4, { css: "#f2a23b", w: 0.52 });
    reg(hits, patrolCab, "patrol-car");

    // The boot kit on the shoulder: the vest, and the bare-shoulder shortcut
    // sitting right beside it.
    const kit = group(g, -1.0, 0, 3.0, -0.4);
    box(kit, 0.5, 0.26, 0.36, 0, 0.55, 0, 0x2f3740, { rough: 0.6, metal: 0.3 });
    cyl(kit, 0.02, 0.02, 0.44, 0, 0.22, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 8 });
    const vest = box(kit, 0.3, 0.2, 0.06, 0, 0.72, 0.16, 0xd8e33a, { rough: 0.6, emissive: 0xd8e33a, ei: 0.5 });
    holoTag(kit, "High-visibility vest", 0, 0.92, 0, { css: "#f2a23b", w: 0.5 });
    reg(hits, vest, "hi-vis-vest");
    const bareOut = ball(kit, 0.026, 0.3, 0.72, 0.1, 0xf0645b, { emissive: 0xf0645b, ei: 1.3, seg: 12 });
    holoTag(kit, "Step out without it?", 0.44, 0.9, 0.1, { css: "#f0645b", w: 0.5 });
    reg(hits, bareOut, "no-vest-shoulder");

    // ---------------------------------------------------- apparatus placements
    const spotPlate = (x, z, id, label, css) => {
      const s = group(g, x, 0, z);
      const plate = box(s, 0.9, 0.014, 1.5, 0, 0.026, 0, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.3, cast: false });
      holoTag(s, label, 0, 0.6, 0, { css, w: 0.58 });
      reg(hits, plate, id);
      return plate;
    };
    const blockPlate = spotPlate(1.4, -2.6, "block-position", "Block — upstream, angled", "#f2a23b");
    const enginePlate = spotPlate(1.7, -5.2, "engine-shield-spot", "Engine — shielding", "#f2a23b");
    const emsPlate = spotPlate(1.6, -1.2, "ems-load-spot", "Ambulance — load door protected", "#f2a23b");
    const towPlate = spotPlate(-2.0, 5.4, "tow-staging-spot", "Tow — staged downstream", "#f2a23b");

    // The fire engine, upstream in the closed lane.
    const engine = group(g, 1.7, 0, -5.4, -0.1);
    box(engine, 2.3, 1.5, 6.4, 0, 1.3, 0, 0xb3261e, { rough: 0.45, metal: 0.3 });
    box(engine, 2.16, 0.9, 2.1, 0, 2.2, 1.9, 0x8f1e18, { rough: 0.45, metal: 0.25 });
    box(engine, 2.0, 0.7, 1.6, 0, 1.5, -2.4, 0x9c221b, { rough: 0.5, metal: 0.25 });
    for (const sx of [-1, 1]) for (const sz of [-1.6, 2.1]) {
      const wheel = cyl(engine, 0.46, 0.46, 0.3, sx * 1.05, 0.46, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const engineBar = box(engine, 1.5, 0.14, 0.3, 0, 2.72, 1.9, 0xd8322a, { emissive: 0xd8322a, ei: 1.8, rough: 0.4 });
    holoTag(engine, "Engine", 0, 3.0, 0, { css: "#f2a23b", w: 0.28 });

    // The ambulance in the closed lane beside the vehicle, load door to the
    // shoulder; the tow waiting downstream on the shoulder.
    const ambulance = group(g, 1.75, 0, -1.2, -0.06);
    box(ambulance, 2.0, 1.85, 5.2, 0, 1.4, 0, 0xe8ecef, { rough: 0.45, metal: 0.2 });
    box(ambulance, 1.86, 0.6, 1.5, 0, 1.75, -2.0, 0x9fb6c4, { rough: 0.2, metal: 0.1, opacity: 0.6, transparent: true });
    box(ambulance, 0.06, 1.2, 1.6, -1.02, 1.3, 1.5, 0xc9d2d8, { rough: 0.5 });
    for (const sx of [-1, 1]) for (const sz of [-1.5, 1.7]) {
      const wheel = cyl(ambulance, 0.4, 0.4, 0.26, sx * 0.92, 0.4, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const ambBar = box(ambulance, 1.3, 0.12, 0.28, 0, 2.38, -1.6, 0xd8322a, { emissive: 0xd8322a, ei: 1.6, rough: 0.4 });
    holoTag(ambulance, "Ambulance", 0, 2.62, 0, { css: "#f2a23b", w: 0.34 });

    const tow = group(g, -2.6, 0, 11.6, 0.08);
    box(tow, 2.0, 1.4, 5.0, 0, 1.2, 0, 0xf2c14b, { rough: 0.5, metal: 0.3 });
    box(tow, 1.86, 0.8, 1.6, 0, 1.9, -1.5, 0xd8a733, { rough: 0.45, metal: 0.25 });
    const towBed = box(tow, 1.9, 0.1, 3.0, 0, 1.4, 0.9, 0xb0b8c0, { rough: 0.6, metal: 0.6 });
    towBed.rotation.x = -0.1;
    for (const sx of [-1, 1]) for (const sz of [-1.4, 1.6]) {
      const wheel = cyl(tow, 0.42, 0.42, 0.28, sx * 0.94, 0.42, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    const towBar = box(tow, 1.2, 0.12, 0.26, 0, 2.36, -1.3, 0xf2a23b, { emissive: 0xf2a23b, ei: 1.5, rough: 0.4 });
    holoTag(tow, "Tow", 0, 2.6, 0, { css: "#f2a23b", w: 0.24 });

    // ------------------------------------------------------------- the taper
    // Set from the advance-warning end, out at the shoulder edge, and angled
    // across the closing lane toward the lane line as it comes downstream.
    const CONES = [
      ["cone-advance", "1 — advance warning", 0.5, -6.2],
      ["cone-taper-a", "2 — taper", 1.1, -4.9],
      ["cone-taper-b", "3 — taper", 1.7, -3.6],
      ["cone-buffer", "4 — buffer space", 2.3, -2.3],
    ];
    const coneObjs = [];
    for (const [cid, label, cx, cz] of CONES) {
      const c = cone(g, cx, cz, { color: TIMP_ACCENT });
      holoTag(c, label, 0, 0.9, 0, { css: "#f2a23b", w: 0.44 });
      reg(hits, c, cid);
      coneObjs.push(c);
    }

    // The arrow board on a trailer, upstream on the shoulder.
    const boardTrailer = group(g, -1.6, 0, -3.6, 0.25);
    box(boardTrailer, 0.9, 0.16, 1.7, 0, 0.42, 0, 0x3a4149, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) {
      const wheel = cyl(boardTrailer, 0.2, 0.2, 0.14, sx * 0.48, 0.2, 0, 0x15181c, { rough: 0.9, seg: 12 });
      wheel.rotation.z = Math.PI / 2;
    }
    cyl(boardTrailer, 0.05, 0.06, 1.5, 0, 1.2, 0.2, 0x4a535c, { rough: 0.5, metal: 0.5, seg: 10 });
    const arrowFace = decal(boardTrailer, 0.9, 0.5, 0, 1.95, 0.22,
      signFace("• • • •", { bg: "#101216", accent: "#f2a23b", fg: "#f2c14b", scale: 0.55 }), { px: 256, glow: true, ei: 1.1 });
    const arrowKnob = cyl(boardTrailer, 0.03, 0.03, 0.05, 0.28, 1.0, 0.14, 0xdfe4e8, { rough: 0.3, metal: 0.7, seg: 12 });
    holoTag(boardTrailer, "Arrow board", 0, 2.28, 0.22, { css: "#f2a23b", w: 0.36 });
    reg(hits, arrowKnob, "arrow-board-switch");

    // ------------------------------------------------------- graded instruments
    const stand = (x, z, ry) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.2, 0.22, 0.03, 0, 0.015, 0, 0x2b3138, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.028, 0.028, 1.0, 0, 0.5, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const taperStand = stand(0.55, -1.9, 0.3);
    const taperGauge = instrument(taperStand, 0, 1.02, 0, { ry: 0, idle: "TAPER", color: TIMP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(taperStand, "Taper length", 0, 1.22, 0, { css: "#f2a23b", w: 0.4 });
    reg(hits, taperGauge, "taper-length-gauge");

    const scanStand = stand(-0.45, -0.9, -0.25);
    const scanGauge = instrument(scanStand, 0, 1.02, 0, { ry: 0, idle: "UPSTREAM", color: TIMP_ACCENT, w: 0.2, d: 0.26 });
    holoTag(scanStand, "Eyes upstream", 0, 1.22, 0, { css: "#f2a23b", w: 0.42 });
    reg(hits, scanGauge, "upstream-scan-point");

    // ------------------------------------------------------- markers and cards
    const marker = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      const bead = ball(m, o.r ?? 0.028, 0, y, 0, o.color ?? TIMP_ACCENT,
        { emissive: o.color ?? TIMP_ACCENT, ei: o.ei ?? 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.14, 0, { css: o.css ?? "#f2a23b", w: o.w ?? 0.44 });
      reg(hits, bead, id);
      return bead;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      const plate = decal(c, o.cw ?? 0.32, o.ch ?? 0.21, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1b1408", accent: o.accent ?? "#f2a23b", scale: 0.38 }),
        { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? "#f2a23b", w: o.w ?? 0.48 });
      reg(hits, plate, id);
      return plate;
    };

    marker(4.3, 1.3, 1.0, "read-live-lane", "The live lane", { w: 0.36 });
    marker(1.0, 1.3, -1.5, "safety-retreat-point", "Behind the block", { w: 0.44, color: 0xf2c14b, css: "#f2c14b" });
    marker(-3.45, 1.3, 0.6, "driver-stand-point", "Stand with them", { w: 0.44 });
    marker(-2.6, 1.32, 1.35, "phone-retrieval-offer", "I'll get it for you", { w: 0.48, color: 0xf2c14b, css: "#f2c14b" });

    card(-2.55, 1.28, -1.6, "driver-words-card", "What you say first", "YOU'RE SAFE HERE", { w: 0.48, ry: 0.35 });
    card(-0.55, 1.26, 2.9, "tow-request", "Call it by class", "TOW — CLASS AND RECOVERY", { w: 0.6, ry: 0.5 });

    // The clearance sequence, on a small stand on the shoulder.
    const clearance = group(g, -0.9, 0, 2.1, -0.5);
    cyl(clearance, 0.024, 0.024, 1.8, 0, 0.9, 0, 0x3a4149, { rough: 0.5, metal: 0.5, seg: 10 });
    const CLEARANCE = [
      ["pickup-downstream", "1 — cones up, downstream end first", 0.95],
      ["reopen-lane", "2 — give the lane back", 1.3],
      ["call-clearance", "3 — call clearance with the times", 1.65],
    ];
    for (const [cid, label, y] of CLEARANCE) {
      const bead = ball(clearance, 0.026, 0, y, 0, TIMP_ACCENT, { emissive: TIMP_ACCENT, ei: 1.5, seg: 12 });
      holoTag(clearance, label, 0.18, y, 0, { css: "#f2a23b", w: 0.68 });
      reg(hits, bead, cid);
    }

    // The place behind the rail the driver is walked to.
    const behindRail = group(g, -3.95, 0, 0.4);
    const railSpot = box(behindRail, 0.7, 0.014, 0.7, 0, 0.026, 0, 0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.35, cast: false });
    holoTag(behindRail, "Behind the rail", 0, 0.5, 0, { css: "#59c97b", w: 0.42 });
    reg(hits, railSpot, "guardrail-spot");

    // ------------------------------------------------------------- the traps
    const liveLane = group(g, 4.7, 0, -0.6);
    const laneTrap = box(liveLane, 0.8, 0.014, 1.2, 0, 0.03, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.35, cast: false });
    holoTag(liveLane, "Work from the open lane?", 0, 0.5, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, laneTrap, "stand-in-the-live-lane");

    marker(0.9, 1.0, 1.15, "taper-toward-traffic", "Start the cones at the crash?", { color: 0xf0645b, css: "#f0645b", w: 0.64 });

    const downstreamPark = group(g, -1.55, 0, 2.7);
    const parkTrap = box(downstreamPark, 0.9, 0.014, 1.5, 0, 0.026, 0, 0xf0645b, { rough: 0.7, emissive: 0xf0645b, ei: 0.3, cast: false });
    holoTag(downstreamPark, "Block it from down here?", 0, 0.55, 0, { css: "#f0645b", w: 0.6 });
    reg(hits, parkTrap, "park-downstream");

    // ------------------------------------------------------------- the boards
    const logBoard = holoPanel(g, 0.56, 0.4, -3.5, 2.0, 2.6, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2a23b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbeede";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("INCIDENT CLEARANCE LOG", w / 2, h * 0.28);
      cx.font = `${Math.round(h * 0.083)}px Arial, sans-serif`;
      cx.fillStyle = "#e6cfa8";
      ["Notification · arrival · lane closed", "Lane open · scene clear",
       "Open-roads policy clock"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.5 + i * 0.15)));
    }, { ry: 0.85, accent: TIMP_ACCENT });
    reg(hits, logBoard, "tim-log-board");

    const checkBoard = holoPanel(g, 0.52, 0.36, 2.4, 2.0, 2.2, (cx, w, h) => {
      cx.fillStyle = "rgba(24,16,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f2c14b"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fbeede";
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("CREW CHECK-IN", w / 2, h * 0.3);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillStyle = "#e6cfa8";
      ["Anybody shaken by the intrusion?", "Peer support · EAP line",
       "Near-miss counts, not only injury"].forEach((l, i) => cx.fillText(l, w / 2, h * (0.52 + i * 0.15)));
    }, { ry: -0.5, accent: 0xf2c14b });
    reg(hits, checkBoard, "crew-checkin-board");

    // ---------------------------------------------------------------- people
    // The driver, out of the car and on the shoulder — the whole reason the
    // human half of this station is scored.
    const driver = standingPerson(g, -2.3, -0.6, { ry: 1.9, cloth: 0x4a4550, hiVis: false, skin: 0xc9a17e });
    holoTag(driver.torso, "The driver — in shock", 0, 1.8, 0.1, { css: "#f2a23b", w: 0.5 });
    reg(hits, driver.torso, "shaken-driver");
    const driverCue = ball(driver.torso, 0.026, 0.22, 1.28, 0.16, TIMP_ACCENT, { emissive: TIMP_ACCENT, ei: 1.4, seg: 12 });
    holoTag(driver.torso, "Out and walking about", 0.24, 1.44, 0.16, { css: "#f2a23b", w: 0.52 });
    reg(hits, driverCue, "read-driver-at-rail");

    // A firefighter off the engine and a medic off the ambulance, both stood
    // clear of every control (tools/briefs/clear_spot.mjs).
    const firefighter = standingFigure(g, 0.35, -0.35, { ry: -1.4, cloth: 0x3a2f28, trousers: 0x2f2620, helmet: 0xf2c14b, skin: 0xb58a64 });
    holoTag(firefighter, "Engine crew", 0, 1.95, 0.1, { css: "#f2a23b", w: 0.34 });
    const medic = standingPerson(g, 0.55, 1.7, { ry: -0.5, cloth: 0x2f4a5a, hiVis: true, vis: 0xd8e33a, skin: 0xa8784f });
    void medic;

    let barsLive = true;
    let arrowSet = false;
    let driverMoved = false;
    let intruding = false;

    // The intruding car, staged off the scene until it is needed.
    const intruder = group(g, 1.6, 0, -9.4, -0.05);
    box(intruder, 1.7, 0.55, 4.0, 0, 0.6, 0, 0x3d4a58, { rough: 0.45, metal: 0.35 });
    box(intruder, 1.58, 0.5, 1.9, 0, 1.1, 0.15, 0x333f4b, { rough: 0.4, metal: 0.3 });
    for (const sx of [-1, 1]) for (const sz of [-1.3, 1.3]) {
      const wheel = cyl(intruder, 0.3, 0.3, 0.2, sx * 0.79, 0.3, sz, 0x15181c, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    intruder.visible = false;

    return {
      hits,
      footprint: 3.0,
      spawnLook: new THREE.Vector3(-1.2, 1.2, -1.0),

      onStepComplete(step) {
        if (step.id === "set-the-block") {
          patrol.position.set(1.4, 0, -2.6);
          patrol.rotation.y = 0.55;
          blockPlate.material = mat(0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.9 });
        }
        if (step.id === "vest-before-stepping-out") {
          vest.material = mat(0x59c97b, { rough: 0.6, emissive: 0x59c97b, ei: 0.9 });
        }
        if (step.id === "arrow-board") {
          arrowSet = true;
          repaint(arrowFace, signFace(">>>>", { bg: "#101216", accent: "#59c97b", fg: "#f2c14b", scale: 0.7 }));
          arrowKnob.material = mat(0x59c97b, { rough: 0.3, metal: 0.6, emissive: 0x59c97b, ei: 0.5 });
        }
        if (step.id === "place-the-apparatus") {
          for (const p of [enginePlate, emsPlate, towPlate]) {
            p.material = mat(0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.9 });
          }
        }
        if (step.id === "driver-clear-of-the-lane") {
          driverMoved = true;
          driver.root.position.set(-3.95, 0, 0.4);
          driver.root.rotation.y = 2.4;
          railSpot.material = mat(0x59c97b, { rough: 0.8, emissive: 0x59c97b, ei: 0.9 });
        }
        if (step.id === "clearance-and-reopen") {
          for (const c of coneObjs) c.visible = false;
          barsLive = false;
          patrolRed.material = mat(0x4a2b2a, { rough: 0.5 });
          patrolBlue.material = mat(0x27324a, { rough: 0.5 });
          laneTrap.visible = false;
        }
        if (step.id === "tim-log") {
          repaint(logBoard.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(8,26,20,0.9)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#eafbf1";
            cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "center"; cx.textBaseline = "middle";
            cx.fillText("CLEARANCE LOGGED", w / 2, h * 0.36);
            cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            cx.fillStyle = "#b7e6c8";
            cx.fillText("All five times recorded", w / 2, h * 0.66);
          });
        }
      },

      // The intrusion is a real car arriving in the taper with a cone knocked
      // flat under it, and the driver's walk toward the lane is the figure
      // actually moving. Both put themselves back when answered.
      onInterrupt(it) {
        if (it.id === "car-into-the-taper") {
          intruding = true;
          intruder.visible = true;
          intruder.position.set(1.6, 0, -4.6);
          coneObjs[2].rotation.z = 1.5;
          coneObjs[2].position.set(1.9, 0.12, -3.3);
        }
        if (it.id === "driver-toward-the-lane") {
          driver.root.position.set(-1.5, 0, 1.2);
          driver.root.rotation.y = 1.2;
          driver.arms[0].shoulder.rotation.x = -0.5;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "car-into-the-taper") {
          intruding = false;
          intruder.visible = false;
          intruder.position.set(1.6, 0, -9.4);
          coneObjs[2].rotation.z = 0;
          coneObjs[2].position.set(1.7, 0, -3.6);
        }
        if (it.id === "driver-toward-the-lane") {
          driver.root.position.set(driverMoved ? -3.95 : -2.3, 0, driverMoved ? 0.4 : -0.6);
          driver.root.rotation.y = driverMoved ? 2.4 : 1.9;
          driver.arms[0].shoulder.rotation.x = 0;
        }
      },

      animate(t, dt, session) {
        if (barsLive) {
          const phase = Math.floor(t * 3) % 2;
          patrolRed.material.emissiveIntensity = phase ? 2.6 : 0.3;
          patrolBlue.material.emissiveIntensity = phase ? 0.3 : 2.6;
          engineBar.material.emissiveIntensity = phase ? 0.4 : 2.2;
          ambBar.material.emissiveIntensity = phase ? 2.0 : 0.4;
          towBar.material.emissiveIntensity = 0.8 + Math.sin(t * 5) * 0.7;
        }
        if (arrowSet) arrowFace.material.emissiveIntensity = 1.0 + Math.sin(t * 4) * 0.35;
        if (intruding) intruder.position.z = -4.6 + ((t * 2.2) % 1.2);
        if (!driverMoved) driver.head.rotation.y = Math.sin(t * 0.8) * 0.5;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "taper-length") {
          const ok = gg.t >= 0.55 && gg.t <= 0.68;
          repaint(taperGauge.userData.screen, signFace(`${Math.round(gg.t * 400)} M`, {
            bg: "#1b1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#f7e2c0", scale: 0.55,
          }));
        }
        const tr = session?.track;
        if (session?.step?.id === "upstream-traffic-scan" && tr) {
          const ok = tr.v >= 0.3 && tr.v <= 0.72;
          repaint(scanGauge.userData.screen, signFace(ok ? "UPSTREAM" : tr.v < 0.3 ? "EYES DOWN" : "LOST IT", {
            bg: "#1b1408", accent: ok ? "#59c97b" : "#f0645b", fg: "#f7e2c0", scale: 0.48,
          }));
        }
      },
    };
  },
};
