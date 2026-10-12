import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace, particles, hose,
  seatedFigure, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ EV Extrication VR — Emergency Services, station nine.
// One car, one trapped occupant, and the car is the hazard. A battery-electric
// vehicle gives none of the cues a crew has spent a career reading: it makes no
// noise when it is ready to drive, its high-voltage system is live behind an
// intact bodyshell, its capacitors stay charged after it is shut down, its
// airbags and pretensioners fire on their own stored charge, and a pack that
// took a hit can go into thermal runaway long after the patient is out and the
// street has been reopened. Nothing here is guessed: where the disconnect is,
// how long to wait, where the crib points are and where it may be cut all come
// off the manufacturer's emergency response guide.

const EVX_ACCENT = 0xf97316;

export const SIM_EV_EXTRICATION = {
  id: "ev-extrication",
  index: "65",
  domain: "Emergency response",
  trade: "Firefighter — vehicle rescue technician",
  category: "Emergency Services",
  weather: "rain",
  certification: "IAFF / IAEP — vehicle rescue technician; NFPA 1006 technical rescue vehicle and machinery competencies; NFPA 1670 vehicle and machinery search and rescue; the vehicle manufacturer's Emergency Response Guide for the high-voltage shutdown, the crib points and the cut points",
  name: "EV Extrication",
  title: simTitle("EV Extrication"),
  tagline: "Trapped occupant in a battery-electric car: chock and crib first, shut the high voltage down off the manufacturer's guide, wait out the stored energy, mark the orange and the undeployed airbags, protect the patient, cut only where the sheet says, and watch the pack",
  accent: EVX_ACCENT,
  accentCss: "#f97316",
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "ev-rescue", name: "EV Rescue", note: "An occupant freed from a battery-electric car with the high voltage down, the wait kept, nothing orange cut, and the pack still being watched when the patient left" },

  game: system({
    name: "Rescue Group",
    currency: "RESCUE",
    ranks: ["Firefighter", "Vehicle Rescue Operations", "Vehicle Rescue Technician", "Extrication Officer", "EV Rescue Certified"],
    badges: [
      { id: "shut-it-down", name: "Shut It Down", note: "High voltage isolated the way the guide said, first time", test: AWARD.stepClean("shutdown") },
      { id: "nothing-orange", name: "Nothing Orange", note: "Nothing cut, crushed or leaned into that was not on the sheet", test: AWARD.safe },
      { id: "read-the-pack", name: "Read The Pack", note: "Thermal read on the pack committed inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-extrication", name: "Clean Extrication", note: "No corrections anywhere in the job", test: AWARD.clean },
      { id: "waited-it-out", name: "Waited It Out", note: "Every timed hold carried the full count, bleed-down included", test: AWARD.unbroken },
      { id: "patient-out", name: "Patient Out", note: "Occupant freed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cut-orange": "You put the cutter on an orange cable. Orange is the colour the industry reserves for high-voltage conductors, and there is no situation in a vehicle rescue where cutting one is the answer — not to make room, not to isolate, not to prove it is dead. It is never cut and it is never crushed; the only cut points on this car are the ones on the manufacturer's sheet.",
    "crush-pack": "You set the spreader tip on the floor pan. On this car the floor pan is the battery: the pack case runs the length of the cabin between the sills, and a spreader or a ram loaded onto it is a crush load applied straight to cells. Crushed cells are one of the ways a pack that survived the collision goes into runaway afterwards.",
    "powder-extinguisher": "You reached for the dry-powder extinguisher with the pack off-gassing. A cell in thermal runaway is not simply burning fuel in air — it is decomposing, and it keeps making its own gas and its own heat whatever you smother the flame with. Powder knocks the visible fire down and changes nothing inside the case, which keeps heating and lights again. This is a water problem, in the volumes the manufacturer's guide publishes, for as long as it takes.",
    "curtain-path": "You put your head through the door opening and in front of the curtain. Every undeployed airbag and every seat-belt pretensioner on this car holds its own charge and can still fire after both batteries are disconnected — that is exactly why the wait exists. Work outside the keep-out distance the guide gives, and never put a head, an arm or a tool in the path an inflator would take.",
  },

  lateNotes: {
    "service-disconnect": "The shutdown is done from the vehicle's own emergency response guide — the guide comes out of the apparatus before anybody touches the disconnect.",
    "glass-tool": "Glass comes out after the patient is covered and the hard protection is in, not before — the person in that seat is downwind of every fragment.",
    "hydraulic-cutter": "The cutter comes out last: after the shutdown, after the stored-energy wait, after the orange and the airbags are marked, and after the patient is protected.",
  },

  steps: [
    {
      id: "size-up", kind: "select", target: "size-up-board",
      title: "Size up the car before anybody touches it",
      cue: "Read the board: one vehicle, one occupant trapped, battery electric, and a ready light with no engine noise behind it.",
      why: "On this car silence proves nothing. A combustion vehicle tells you it is running; a battery-electric one sitting in ready mode makes no sound at all, and the only evidence it is live is a lamp on a dash you may not be able to see from where you are standing.",
    },
    {
      id: "chock", kind: "drag", target: "wheel-chock",
      title: "Chock the wheels first",
      cue: "Carry the chocks in and set them hard against the tyres before anything else is done to the car.",
      why: "A car in drive with nobody's foot on the brake creeps forward silently. Chocks come first because they are the part of the stabilisation that works whether or not the car is still powered, and whether or not anybody has yet worked out what kind of car it is.",
      drag: { to: "chock-seat", radius: 0.6, missNote: "Not against the tyre — a chock lying near a wheel stops nothing." },
    },
    {
      id: "immobilise", kind: "sequence",
      targets: ["park-brake", "power-off", "key-fob"],
      itemNames: { "park-brake": "park brake set", "power-off": "vehicle shut down at its own switch", "key-fob": "fob carried well clear" },
      title: "Take the car out of anybody's hands",
      cue: "Park brake on, shut the vehicle down at its own switch, and carry the fob right away from the car.",
      why: "Shutting it down is not enough on a keyless car. Leave the fob in the footwell, or in a bystander's hand at the kerb, and the vehicle can be woken back to ready by somebody who has no idea they are doing it. The fob goes far enough away that proximity cannot reach it.",
    },
    {
      id: "guide", kind: "select", target: "rescue-sheet",
      title: "Get the manufacturer's emergency response guide out",
      cue: "Pull this vehicle's rescue sheet and read it before committing to anything: shutdown, wait, crib points, cut points.",
      why: "Every one of those four things is model-specific and none of them can be worked out by looking at the car. The guide is the difference between a procedure and a guess, and it is the reason nobody on this scene has to invent where the high voltage runs.",
    },
    {
      id: "crib", kind: "drag", target: "crib-block",
      title: "Crib it at the points the sheet marks",
      cue: "Carry the step cribbing to the sill and build it up until the body cannot move on its springs.",
      why: "Chocks stop it rolling; cribbing stops it rocking every time somebody leans on it or a tool loads it. On this car the crib points matter more than usual, because the floor between the sills is the battery case — a block under the middle of the car is a block under the pack.",
      drag: { to: "crib-seat", radius: 0.6, missNote: "Not under the sill — and nowhere near the floor pan, which is the pack." },
    },
    {
      id: "shutdown", kind: "select", target: "service-disconnect",
      title: "Disable the high-voltage system the way the guide says",
      cue: "Go to the point the guide marks and carry out its shutdown — on this car, the service disconnect behind the near-side rear trim.",
      why: "Manufacturers build a defined way to isolate the pack into every one of these vehicles and then publish where it is, because the alternative is crews improvising on a live traction system. What it is varies by model — a loop, a plug, a fuse, a handle — so you do what the sheet says, at the place the sheet marks, and you do not go looking for something to cut.",
    },
    {
      id: "low-voltage", kind: "turn", target: "twelve-volt",
      title: "Disconnect the low-voltage battery",
      cue: "Open the front compartment and back the negative terminal off the 12-volt battery.",
      why: "The low-voltage system is what lets the car wake up, close its contactors and fire its restraints. Taking the negative off stops it being restarted and starts the clock on the restraint system — it does not make the restraints safe, because they hold their own charge.",
      turn: { turns: 1.5, axis: "z", label: "12V NEG" },
    },
    {
      id: "bleed", kind: "hold", target: "bleed-clock", seconds: 6,
      title: "Wait out the stored energy",
      cue: "Hold the crew off the car and run the clock for the stored-energy time on the manufacturer's sheet.",
      why: "Opening the disconnect does not empty the system. Capacitors in the drive electronics stay charged and the restraint system keeps its own reserve, so both take time to bleed down. That time is published on the vehicle's sheet, it is real minutes rather than a formality, and the only way to spend it is to stand there and spend it.",
      holdBreakNote: "The wait was cut short. A partial bleed-down is not a bleed-down — restart the clock and let it run.",
    },
    {
      id: "no-go", kind: "sequence", anyOrder: true,
      targets: ["orange-run", "curtain-bag", "pretensioner"],
      itemNames: { "orange-run": "the orange high-voltage run", "curtain-bag": "undeployed curtain airbag", pretensioner: "seat-belt pretensioner" },
      itemNotes: {
        "orange-run": "Orange cable, running from the pack forward under the sill. Marked as no-go: never cut, never crushed by a spreader, never used as a handhold.",
        "curtain-bag": "The curtain is folded into the roof rail for the whole length of the opening, and it has not fired. Mark the keep-out and nobody's head goes inside it.",
        pretensioner: "The pretensioner sits at the foot of the B-post. It fires on stored charge, it fires hard, and a cutter working that post finds it before you do.",
      },
      title: "Mark everything that must not be cut or leaned into",
      cue: "Trace the orange, find the undeployed curtain in the roof rail and the pretensioner at the post, and mark the keep-outs for the whole crew.",
      why: "Two different families of thing hurt people on this job: conductors carrying traction voltage, and stored-charge devices waiting to fire. Marking them turns one person's knowledge into something the firefighter who arrives in five minutes can see without being told.",
    },
    {
      id: "water", kind: "select", target: "charged-line",
      title: "Charged line and a supply behind it, before the first cut",
      cue: "Get a line charged and in somebody's hands, with a water supply behind it — not a booster tank on its own.",
      why: "If the pack lights during the extrication, the answer is water in volume and it has to be there already. The volumes manufacturers publish for a pack fire are far beyond what an apparatus tank holds, so the supply is established before the tools start rather than called for once smoke is showing.",
    },
    {
      id: "protect", kind: "drag", target: "hard-protection",
      title: "Hard protection between the tool and the patient",
      cue: "Carry the hard protection in, set it between the work area and the person in the seat, and cover them.",
      why: "Everything from here on throws glass, sprays hydraulic oil and moves sharp steel within arm's reach of somebody who cannot move out of the way. Soft cover stops the fragments; hard protection stops the tool.",
      drag: { to: "protect-seat", radius: 0.6, missNote: "Not between the patient and the work — protection anywhere else protects nobody." },
    },
    {
      id: "glass", kind: "track", target: "glass-tool", seconds: 6,
      title: "Take the glass out under control",
      cue: "Work the glass tool and keep the stroke rate in the band — steady, not fast.",
      why: "Glass is removed deliberately rather than smashed, because a shattered side window over a covered cabin is a shower onto a patient who cannot turn their face away. Steady strokes keep the fragments in the cut and let the crew catch what comes away.",
      track: { label: "STROKE", green: [0.38, 0.6], rise: 0.52, fall: 0.42, drift: 0.13, readout: (v) => `${Math.round(v * 120)} /min` },
    },
    {
      id: "cut", kind: "hold", target: "hydraulic-cutter", seconds: 6,
      title: "Cut at the marked points and hold the cut through",
      cue: "Cutter onto the marked point on the post, and hold it closed until the section is right through.",
      why: "The marks came off the rescue sheet, which is what keeps the blades out of the orange run, the pretensioner and the inflator. Holding the cut through matters because a part-cut post sprung open is a stored load standing right beside the patient.",
      holdBreakNote: "The cutter came off half way. A partly cut post is worse than an uncut one — close it again and take the section right through.",
    },
    {
      id: "pack-watch", kind: "gauge", target: "thermal-cam",
      title: "Read the pack before the car is handed on",
      cue: "Run the thermal camera along the pack case and commit on how far above ambient it reads.",
      why: "There is no temperature that makes a damaged pack safe, so this number is not a pass mark — what the camera gives you is a trend and a hot spot. A pack sitting at the temperature of everything around it is doing nothing; a warm one, with no fire and nothing charging to explain it, is making heat inside the case, and that is where runaway starts.",
      gauge: { label: "OVER AMBIENT", speed: 0.7, green: [0.02, 0.14], readout: (t) => `+${(t * 14).toFixed(1)} °C`, missNote: "The case is warmer than everything around it with no fire and no charging to explain it. That heat is coming from inside the cells — back everyone off and get water on it." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["swollen-case", "coolant-drip"],
      itemNames: { "swollen-case": "bulge in the pack case", "coolant-drip": "coolant running out from under the pack" },
      itemNotes: {
        "swollen-case": "The case is bulged outward at the near-side rear. Cells swell when they vent internally, so at least one module has already let go — this car is a re-ignition risk for as long as it exists, and the tow operator, the yard and the next crew all have to be told.",
        "coolant-drip": "Coolant is running out from under the pack. The loop that keeps the modules at temperature is breached, so even a pack that looks intact has lost its only way of shedding heat, and it will sit in the yard with nothing carrying that heat away.",
      },
      title: "Walk the car before it goes on the truck",
      cue: "The patient is out; the car is not finished. Walk it and click what the tow operator and the yard have to be warned about.",
      why: "A damaged pack can go into runaway minutes or hours after the incident, and it re-ignites after it has been put out. The last thing this crew does is hand the car on with the damage described, because the people it burns next are the ones who were never on the scene.",
    },
  ],

  interrupts: [
    {
      id: "crib-under-pack",
      kind: "Cribbing on the pack",
      after: "bleed", delay: 3, seconds: 11,
      alert: "While the clock has been running, somebody has pushed a step block in under the middle of the floor pan to stop the body rocking.",
      cue: "There is cribbing under the battery.",
      target: "crib-block",
      why: "The floor pan between the sills is the battery case. Cribbing belongs on the crib points the sheet marks, which are structure; a block taking the car's weight through the pack case is a crush load applied straight to cells, and it is one of the quiet ways a pack that survived the collision is made to fail later.",
      missNote: "The block stayed where it was and the car settled onto it while you worked. Nothing happened on scene, which is the problem — the crush is done, and the pack goes onto the truck with a load path through it that nobody wrote down. It becomes somebody else's vehicle fire hours after the street was reopened.",
      wrongNote: "It is the cribbing. Get it off the floor pan and onto the crib point the sheet marks.",
    },
    {
      id: "runaway",
      kind: "Pack in runaway",
      after: "cut", delay: 4, seconds: 12,
      alert: "White vapour is pushing out from under the driver's side and there is a sound like popping coming from inside the floor.",
      cue: "The pack has started.",
      target: "charged-line",
      why: "Off-gassing, popping and smoke from underneath are the pack going into runaway, and it starts whenever it starts — during the job, or hours later in the yard. It is not an extinguisher problem: the answer is water, in the volume the manufacturer's guide publishes, directed at the pack, and kept on it long after the flame has gone.",
      missNote: "Nobody moved the line. The venting turned into fire under a car with a patient still being worked at the opening, the crew went to the extinguisher because it was nearer, and the pack kept heating behind it — so the same car lit twice more, once in the street and once on the back of the truck.",
      wrongNote: "It is the charged line. A venting pack is a water problem and it needs the line on it now, not the extinguisher.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, EVX_ACCENT);

    // ------------------------------------------------------------- the street
    // A patch of wet carriageway with the collision debris still on it, so the
    // car reads as having stopped where it stopped.
    box(g, 7.2, 0.02, 5.4, 0, 0.005, -0.7, 0x3a3f45,
      { rough: 0.95, finish: "asphalt", tile: [6, 5], cast: false });
    for (let i = 0; i < 9; i++) {
      const a = i * 2.3;
      box(g, 0.06 + (i % 3) * 0.03, 0.012, 0.05, Math.sin(a) * (1.9 + (i % 4) * 0.35), 0.014,
        -1.1 + Math.cos(a) * (1.5 + (i % 3) * 0.4), 0x9fb6c2,
        { rough: 0.25, metal: 0.1, opacity: 0.85, transparent: true, cast: false });
    }

    // --------------------------------------------------------------- the car
    // Length along local x, near side (the side the learner walks up to) at
    // local +z, parked askew across the pad.
    const car = group(g, -0.1, 0, -1.35, 0.34);
    const PAINT = 0x2f5d8a;

    // Battery pack: the floor of the car, between the sills. Everything on this
    // station comes back to the fact that this slab is the structure.
    const pack = slab(car, 3.0, 0.17, 1.52, -0.05, 0.25, 0, 0x343b42,
      { radius: 0.04, rough: 0.6, metal: 0.45, finish: "brushed", tile: [4, 2] });
    for (const sx of [-1, 1]) {
      box(car, 3.0, 0.03, 0.05, -0.05, 0.34, sx * 0.76, EVX_ACCENT,
        { emissive: EVX_ACCENT, ei: 0.5, rough: 0.5, cast: false });
    }
    holoTag(car, "Battery pack — the floor of this car", -0.05, 0.1, 1.08, { css: "#f97316", w: 0.5 });

    // Body: rockers, a lower flank, a waist, then a bonnet and a boot lid that
    // give the thing a front and a back from across the street.
    const sills = [];
    for (const sx of [-1, 1]) {
      sills.push(box(car, 2.6, 0.22, 0.12, -0.1, 0.4, sx * 0.87, 0x1d3a52,
        { rough: 0.5, metal: 0.35, finish: "painted", tile: [3, 1] }));
    }
    const body = slab(car, 3.8, 0.34, 1.74, 0, 0.53, 0, PAINT,
      { radius: 0.12, rough: 0.35, metal: 0.4, finish: "painted", tile: [4, 1] });
    slab(car, 3.68, 0.26, 1.72, 0, 0.82, 0, PAINT,
      { radius: 0.16, rough: 0.35, metal: 0.4, finish: "painted", tile: [4, 1] });
    // The front compartment, lid up: that is where the 12-volt battery lives.
    box(car, 1.0, 0.14, 1.52, 1.18, 0.9, 0, 0x14181d, { rough: 0.9, cast: false });
    const bonnet = box(car, 1.05, 0.1, 1.66, 1.22, 1.2, 0, PAINT,
      { rough: 0.35, metal: 0.4, finish: "painted", tile: [2, 2] });
    bonnet.rotation.z = 0.55;
    const boot = box(car, 0.92, 0.1, 1.66, -1.46, 0.98, 0, PAINT,
      { rough: 0.35, metal: 0.4, finish: "painted", tile: [2, 2] });
    boot.rotation.z = 0.05;
    const nose = box(car, 0.44, 0.44, 1.6, 1.88, 0.6, 0, PAINT, { rough: 0.4, metal: 0.4, finish: "painted" });
    nose.rotation.z = -0.24;
    box(car, 0.1, 0.3, 1.62, 2.04, 0.48, 0, 0x8a939c, { rough: 0.55, metal: 0.6, finish: "brushed" });
    for (const sz of [-1, 1]) {
      box(car, 0.14, 0.12, 0.3, 2.02, 0.72, sz * 0.58, 0xf0645b,
        { emissive: 0xf0645b, ei: 0.3, rough: 0.4, cast: false });
      box(car, 0.1, 0.12, 0.3, -1.93, 0.86, sz * 0.6, 0xb8402f, { rough: 0.4, cast: false });
    }

    // Greenhouse: a glazed cabin between the posts, with the roof on top. The
    // near-side front door is already open.
    box(car, 1.94, 0.46, 1.58, -0.22, 1.2, 0, 0x16222c,
      { rough: 0.15, metal: 0.2, opacity: 0.55, transparent: true, cast: false });
    const roof = slab(car, 1.74, 0.09, 1.5, -0.26, 1.48, 0, PAINT,
      { radius: 0.12, rough: 0.35, metal: 0.4, finish: "painted", tile: [2, 2] });
    const posts = {};
    for (const [nm, px, sx] of [["a", 0.76, 1], ["a2", 0.76, -1], ["b", -0.22, 1], ["b2", -0.22, -1], ["c", -1.2, 1], ["c2", -1.2, -1]]) {
      posts[nm] = box(car, 0.12, 0.62, 0.11, px, 1.16, sx * 0.79, 0x1d3a52,
        { rough: 0.4, metal: 0.45, finish: "painted" });
    }
    posts.a.rotation.z = -0.42; posts.a2.rotation.z = -0.42;
    posts.c.rotation.z = 0.36; posts.c2.rotation.z = 0.36;
    // Windscreen and backlight, raked; the near-side door glass is still in.
    box(car, 0.62, 0.5, 1.48, 0.86, 1.2, 0, 0x9fc3d6,
      { rough: 0.1, metal: 0.1, opacity: 0.3, transparent: true, cast: false }).rotation.z = -0.62;
    box(car, 0.5, 0.46, 1.46, -1.28, 1.2, 0, 0x9fc3d6,
      { rough: 0.1, opacity: 0.3, transparent: true, cast: false }).rotation.z = 0.62;
    const nearGlass = box(car, 0.78, 0.42, 0.05, -0.64, 1.2, 0.79, 0x9fc3d6,
      { rough: 0.1, opacity: 0.4, transparent: true, cast: false });

    // Near-side front door, swung open — this is how the crew reaches the seat.
    const door = group(car, 0.6, 0, 0.85, -0.95);
    box(door, 0.98, 0.62, 0.09, -0.48, 0.66, 0.0, PAINT,
      { rough: 0.38, metal: 0.4, finish: "painted", tile: [2, 1] });
    box(door, 0.92, 0.42, 0.05, -0.48, 1.2, 0.0, 0x9fc3d6,
      { rough: 0.1, opacity: 0.32, transparent: true, cast: false });
    for (const dx of [-0.12, -0.84]) {
      cyl(door, 0.02, 0.02, 0.52, dx, 0.96, 0, 0x1d3a52, { rough: 0.4, metal: 0.5, seg: 8 });
    }

    // Wheels.
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const tyre = cyl(car, 0.33, 0.33, 0.21, sx * 1.34, 0.33, sz * 0.82, 0x191c20,
        { rough: 0.95, seg: 18, finish: "rubber", tile: [3, 1] });
      tyre.rotation.x = Math.PI / 2;
      const rim = cyl(car, 0.19, 0.19, 0.23, sx * 1.34, 0.33, sz * 0.82, 0xb6bec6,
        { rough: 0.35, metal: 0.7, seg: 14, finish: "brushed" });
      rim.rotation.x = Math.PI / 2;
    }

    // Badging and the charge port, so the car says what it is from outside.
    decal(car, 0.34, 0.12, -1.55, 0.72, 0.89,
      signFace("EV", { bg: "#16222e", accent: "#f97316", fg: "#eaf6fb", scale: 0.5 }), { px: 192 });
    box(car, 0.22, 0.2, 0.04, -1.72, 0.74, 0.86, 0x24445f, { rough: 0.4, metal: 0.4 });
    holoTag(car, "Charge port", -1.72, 1.04, 0.9, { css: "#f97316", w: 0.24 });

    // The orange run: high-voltage cable from the pack forward under the sill.
    const orange = hose(car, [[-0.9, 0.2, 0.62], [-0.1, 0.24, 0.72], [0.8, 0.3, 0.66], [1.5, 0.42, 0.44]],
      0.035, EVX_ACCENT, { steps: 18, seg: 7, rough: 0.45 });
    holoTag(car, "Orange = high voltage", 0.3, 0.58, 0.98, { css: "#f97316", w: 0.42 });
    reg(hits, orange, "orange-run");

    // Undeployed restraints: the curtain folded into the near-side roof rail,
    // and the pretensioner at the foot of the B-post.
    const curtain = box(car, 1.76, 0.09, 0.08, -0.24, 1.4, 0.74, 0xe3c38a, { rough: 0.8 });
    holoTag(car, "Curtain — undeployed", -0.24, 1.7, 0.82, { css: "#f0645b", w: 0.44 });
    reg(hits, curtain, "curtain-bag");
    const pretensioner = cyl(car, 0.06, 0.06, 0.16, -0.22, 0.56, 0.7, 0xc9ced4,
      { rough: 0.4, metal: 0.6, seg: 12 });
    holoTag(car, "Pretensioner — B-post", -0.22, 0.88, 0.74, { css: "#f0645b", w: 0.42 });
    reg(hits, pretensioner, "pretensioner");

    // The cut points the sheet marks, painted on the posts.
    for (const [px, py] of [[0.74, 0.86], [-0.24, 1.22]]) {
      decal(car, 0.14, 0.06, px, py, 0.87,
        signFace("CUT", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.55 }), { px: 128 });
    }

    // Service disconnect, behind the near-side rear trim.
    const disconnect = group(car, -1.42, 0.62, 0.9);
    box(disconnect, 0.28, 0.24, 0.06, 0, 0, 0, 0xe0e5ea, { rough: 0.5, metal: 0.2 });
    const discHandle = box(disconnect, 0.2, 0.06, 0.06, 0, 0, 0.05, EVX_ACCENT,
      { emissive: EVX_ACCENT, ei: 0.35, rough: 0.45 });
    holoTag(car, "Service disconnect", -1.42, 1.0, 0.96, { css: "#f97316", w: 0.4 });
    reg(hits, disconnect, "service-disconnect");

    // The 12-volt battery, down in the open front compartment.
    const twelve = group(car, 1.3, 1.0, 0.36);
    box(twelve, 0.26, 0.2, 0.2, 0, 0, 0, 0x1f242a, { rough: 0.7, finish: "painted" });
    const negPost = cyl(twelve, 0.03, 0.03, 0.07, -0.07, 0.13, 0, 0x2b3138,
      { rough: 0.4, metal: 0.8, seg: 10 });
    cyl(twelve, 0.03, 0.03, 0.07, 0.07, 0.13, 0, 0xb8402f, { rough: 0.4, metal: 0.8, seg: 10 });
    holoTag(car, "12 V battery — negative off", 1.3, 1.34, 0.48, { css: "#4fd1ff", w: 0.48 });
    reg(hits, twelve, "twelve-volt");

    // Dash and console controls, reached through the open door.
    const dash = group(car, 0.72, 0.8, 0.3);
    box(dash, 0.14, 0.3, 1.3, 0, 0.02, -0.3, 0x1b2026, { rough: 0.8, cast: false });
    const readyLamp = box(dash, 0.05, 0.05, 0.12, -0.04, 0.12, -0.16, 0x59c97b,
      { emissive: 0x59c97b, ei: 1.6, rough: 0.4, cast: false });
    holoTag(car, "READY — and silent", 0.72, 1.18, 0.36, { css: "#59c97b", w: 0.42 });
    const powerBtn = cyl(dash, 0.035, 0.035, 0.03, -0.02, 0.1, 0.06, 0xe0e5ea, { rough: 0.4, seg: 12 });
    powerBtn.rotation.z = Math.PI / 2;
    reg(hits, powerBtn, "power-off");
    const brakeLever = box(car, 0.06, 0.05, 0.16, 0.36, 0.72, 0.16, 0xf2c14b, { rough: 0.5 });
    holoTag(car, "Park brake", 0.36, 0.98, 0.2, { css: "#f2c14b", w: 0.26 });
    reg(hits, brakeLever, "park-brake");
    const fob = box(car, 0.07, 0.02, 0.05, 0.42, 0.62, -0.3, 0x2b3138, { rough: 0.45 });
    holoTag(car, "Key fob — still aboard", 0.42, 0.92, -0.3, { css: "#f0645b", w: 0.46 });
    reg(hits, fob, "key-fob");

    // The occupant, trapped in the driver's seat.
    box(car, 0.5, 0.62, 0.5, 0.12, 0.95, 0.36, 0x2b3138, { rough: 0.9, cast: false });
    const patient = seatedFigure(car, 0.2, 0.5, 0.34, { ry: -1.4, cloth: 0x7d5a8a });
    patient.root.scale.setScalar(0.78);
    holoTag(car, "Occupant — trapped", 0.2, 1.78, 0.34, { css: "#f0645b", w: 0.4 });

    // What the pack took in the collision — the closing walk-round.
    const swollen = slab(car, 0.4, 0.2, 0.3, -1.1, 0.25, 0.64, 0x4a3a2f,
      { radius: 0.06, rough: 0.7, metal: 0.3 });
    holoTag(car, "Pack case — near-side rear", -1.1, 0.04, 1.0, { css: "#b8794a", w: 0.44 });
    reg(hits, swollen, "swollen-case");
    const coolant = box(car, 0.45, 0.012, 0.4, -1.5, 0.018, 1.12, 0x5c7a86,
      { rough: 0.15, opacity: 0.75, transparent: true, cast: false });
    holoTag(car, "Wet under the pack", -1.5, 0.24, 1.34, { css: "#4fd1ff", w: 0.36 });
    reg(hits, coolant, "coolant-drip");
    const vent = particles(car, 30, 0xd7e2e8, { size: 0.045, life: 1.0, additive: false, opacity: 0.3 });
    vent.position.set(-0.9, 0.22, 1.0);

    // The board, staged on the near side for when the occupant comes out.
    const stretcher = group(car, 0.95, 0, 2.15);
    box(stretcher, 0.6, 0.06, 1.9, 0, 0.36, 0, 0xdfe4e8, { rough: 0.7 });
    for (const sx of [-1, 1]) {
      box(stretcher, 0.07, 0.06, 1.9, sx * 0.3, 0.42, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
      for (const sz of [-1, 1]) {
        cyl(stretcher, 0.02, 0.02, 0.33, sx * 0.24, 0.17, sz * 0.72, 0x8b949d,
          { rough: 0.5, metal: 0.6, seg: 8 });
      }
    }
    holoTag(car, "Board", 0.95, 0.66, 2.15, { css: "#59c97b", w: 0.2 });

    // ------------------------------------------------------ stabilisation kit
    const chocks = group(g, 1.9, 0, 1.9);
    for (const dz of [-0.14, 0.14]) {
      const c = box(chocks, 0.26, 0.17, 0.2, 0, 0.085, dz, 0xf2c14b, { rough: 0.7, finish: "rubber" });
      c.rotation.x = 0.35;
    }
    holoTag(g, "Wheel chocks", 1.9, 0.36, 2.12, { css: "#f2c14b", w: 0.3 });
    reg(hits, chocks, "wheel-chock");
    const chockSeat = box(g, 0.4, 0.2, 0.4, 1.44, 0.1, -1.02, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["chock-seat"] = chockSeat;

    const cribs = group(g, -1.95, 0, 1.85);
    for (let i = 0; i < 3; i++) {
      const c = box(cribs, 0.44, 0.09, 0.14, 0, 0.05 + i * 0.1, 0, 0xb08a52,
        { rough: 0.9, finish: "painted", tile: [2, 1] });
      c.rotation.y = i % 2 ? Math.PI / 2 : 0;
    }
    holoTag(g, "Step cribbing", -1.95, 0.52, 2.06, { css: "#b08a52", w: 0.3 });
    reg(hits, cribs, "crib-block");
    const cribSeat = box(g, 0.4, 0.2, 0.4, 0.15, 0.1, -0.45, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["crib-seat"] = cribSeat;
    // The block somebody pushes under the pack while the clock runs.
    const strayBlock = box(g, 0.42, 0.1, 0.16, -0.15, 0.06, -1.33, 0xb08a52, { rough: 0.9 });
    strayBlock.visible = false;

    // ----------------------------------------------------------- patient care
    const guard = slab(g, 0.72, 0.05, 0.5, 0.45, 0.03, 2.15, 0x59c97b,
      { radius: 0.03, rough: 0.6, finish: "painted" });
    holoTag(g, "Hard protection + cover", 0.45, 0.26, 2.42, { css: "#59c97b", w: 0.46 });
    reg(hits, guard, "hard-protection");
    const protectSeat = box(g, 0.4, 0.5, 0.4, 0.18, 0.55, -0.85, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    hits["protect-seat"] = protectSeat;

    // --------------------------------------------------------------- the tools
    const chest = toolChest(g, 2.6, 0.75, { ry: -0.7, color: 0xf97316 });
    const glassTool = group(chest, -0.02, 0.86, 0.02);
    cyl(glassTool, 0.02, 0.02, 0.3, 0, 0, 0, 0x2b3138,
      { rough: 0.6, metal: 0.3, seg: 10 }).rotation.z = Math.PI / 2;
    box(glassTool, 0.12, 0.02, 0.03, 0.18, 0, 0, 0xc9ced4, { rough: 0.35, metal: 0.7 });
    holoTag(chest, "Glass tool", 0, 1.08, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, glassTool, "glass-tool");

    const cutterStand = group(g, -2.65, 0, -0.5);
    box(cutterStand, 0.5, 0.06, 0.4, 0, 0.5, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    for (const sx of [-1, 1]) {
      cyl(cutterStand, 0.025, 0.025, 0.5, sx * 0.2, 0.25, 0, 0x8b949d,
        { rough: 0.5, metal: 0.6, seg: 8 });
    }
    const cutter = group(cutterStand, 0, 0.62, 0);
    box(cutter, 0.34, 0.14, 0.14, 0, 0, 0, 0xf97316, { rough: 0.45, finish: "painted" });
    const jawTop = box(cutter, 0.22, 0.05, 0.07, 0.24, 0.06, 0, 0xc9ced4, { rough: 0.3, metal: 0.75 });
    const jawBot = box(cutter, 0.22, 0.05, 0.07, 0.24, -0.06, 0, 0xc9ced4, { rough: 0.3, metal: 0.75 });
    jawTop.rotation.z = -0.24; jawBot.rotation.z = 0.24;
    holoTag(cutterStand, "Hydraulic cutter", 0, 1.0, 0, { css: "#f97316", w: 0.36 });
    reg(hits, cutter, "hydraulic-cutter");

    // ---------------------------------------------- water, meters and paperwork
    const line = group(g, -2.5, 0, 1.75);
    hose(line, [[-0.5, 0.05, 0.45], [0.0, 0.05, 0.2], [0.45, 0.06, 0.3], [0.7, 0.07, -0.1]],
      0.055, 0xd8232a, { steps: 20, seg: 7, rough: 0.8 });
    const nozzle = cyl(line, 0.04, 0.055, 0.34, 0.85, 0.12, -0.25, 0x8b949d,
      { rough: 0.4, metal: 0.7, seg: 12, finish: "brushed" });
    nozzle.rotation.z = -1.1;
    holoTag(line, "Charged line + supply", 0.1, 0.48, 0.1, { css: "#f0645b", w: 0.46 });
    reg(hits, line, "charged-line");
    const stream = particles(g, 30, 0xbfeaf7, { size: 0.03, life: 0.5, additive: false, opacity: 0.45 });
    stream.position.set(-1.3, 0.3, 0.6);

    const clock = instrument(g, 2.4, 0.98, -1.55, { ry: -1.15, idle: "-- : --", color: 0xf97316 });
    holoTag(clock, "Bleed-down clock", 0, 0.2, 0, { css: "#f97316", w: 0.38 });
    reg(hits, clock, "bleed-clock");
    const thermal = instrument(g, -2.45, 0.98, 0.65, { ry: 0.85, idle: "-- °C", color: 0x4fd1ff });
    holoTag(thermal, "Thermal camera", 0, 0.2, 0, { css: "#4fd1ff", w: 0.36 });
    reg(hits, thermal, "thermal-cam");
    for (const [x, z] of [[2.4, -1.55], [-2.45, 0.65]]) {
      cyl(g, 0.02, 0.026, 0.96, x, 0.48, z, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8, cast: false });
    }

    const board = holoPanel(g, 0.6, 0.44, 2.45, 1.62, 1.75, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f97316"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("SIZE-UP · SINGLE VEHICLE", w * 0.06, h * 0.14);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("ONE TRAPPED, BATTERY ELECTRIC", w * 0.06, h * 0.32);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Ready light on — no engine noise", "Wheels not chocked, car on its springs",
        "Pack in the floor, condition unknown", "All airbags undeployed",
        "No fire showing", "Occupant conscious, legs trapped"]
        .forEach((t, i) => cx.fillText(t, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: -0.8 });
    reg(hits, board, "size-up-board");

    const sheet = holoPanel(g, 0.6, 0.44, -2.6, 1.62, -1.45, (cx, w, h) => {
      cx.fillStyle = "rgba(10,8,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f97316"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#c79a6a";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("EMERGENCY RESPONSE GUIDE", w * 0.06, h * 0.14);
      cx.fillStyle = "#ffe3ac";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("RESCUE SHEET — THIS MODEL", w * 0.06, h * 0.32);
      cx.fillStyle = "#e7d3b4";
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ["Orange = high voltage — never cut", "Disconnect: near-side rear quarter",
        "12 V negative: front compartment", "Then wait the stored-energy time on this sheet",
        "Crib points: sills, clear of the pack", "Cut points marked — nowhere else"]
        .forEach((t, i) => cx.fillText(t, w * 0.06, h * 0.46 + i * h * 0.085));
    }, { ry: 1.0 });
    reg(hits, sheet, "rescue-sheet");

    // ------------------------------------------------------- the temptations
    const cutOrange = box(g, 0.44, 0.44, 0.44, 0.62, 0.5, -0.98, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Cut the orange one?", 0.62, 0.82, -0.98, { css: "#f0645b", w: 0.44 });
    reg(hits, cutOrange, "cut-orange");
    const crushPack = box(g, 0.44, 0.44, 0.44, -0.63, 0.46, -0.17, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Spread off the floor pan?", -0.63, 0.78, -0.17, { css: "#f0645b", w: 0.5 });
    reg(hits, crushPack, "crush-pack");
    const curtainPath = box(g, 0.44, 0.52, 0.44, 0.16, 1.26, -0.74, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Lean in for a look?", 0.16, 1.62, -0.74, { css: "#f0645b", w: 0.42 });
    reg(hits, curtainPath, "curtain-path");
    const ext = group(g, 2.7, 0, -0.35);
    cyl(ext, 0.08, 0.08, 0.46, 0, 0.23, 0, 0xd8232a,
      { rough: 0.45, metal: 0.3, seg: 14, finish: "painted" });
    cyl(ext, 0.03, 0.03, 0.09, 0, 0.5, 0, 0x2b3138, { rough: 0.5, metal: 0.6, seg: 10 });
    holoTag(ext, "Put it out with this?", 0, 0.8, 0, { css: "#f0645b", w: 0.44 });
    reg(hits, ext, "powder-extinguisher");

    // ---------------------------------------------------------------- the crew
    const officer = standingFigure(g, 2.5, 2.9, { ry: 3.85, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf97316 });
    holoTag(g, "You — rescue crew", 2.5, 2.06, 3.14, { css: "#f97316", w: 0.4 });
    const medic = standingFigure(g, -2.45, 2.95, { ry: 2.45, cloth: 0x2b3138, vest: 0x59c97b, helmet: 0xf2f2f2 });
    holoTag(g, "Medic", -2.45, 2.06, 3.19, { css: "#59c97b", w: 0.26 });
    for (const [cx, cz] of [[-3.0, -2.2], [-3.2, -0.6], [3.15, -2.3]]) cone(g, cx, cz, { color: 0xf2a23b });

    let ready = true, venting = 0, strayed = false;
    const sillHome = sills[0].material;

    return {
      hits,
      footprint: 2.6,

      onStepComplete(step) {
        if (step.id === "chock") { chocks.position.set(1.44, 0, -1.02); chocks.rotation.y = 0.34; }
        if (step.id === "immobilise") {
          ready = false;
          readyLamp.material = mat(0x3b4148, { rough: 0.6 });
          fob.parent.remove(fob);
          g.add(fob);
          fob.position.set(2.25, 0.06, 2.2);
        }
        if (step.id === "crib") { cribs.position.set(0.15, 0, -0.45); cribs.rotation.y = 0.34; }
        if (step.id === "shutdown") { discHandle.rotation.z = 1.2; discHandle.position.y = -0.06; }
        if (step.id === "low-voltage") { negPost.position.y = 0.2; negPost.rotation.z = 0.7; }
        if (step.id === "no-go") {
          curtain.material = mat(0xf0645b, { rough: 0.7 });
          pretensioner.material = mat(0xf0645b, { rough: 0.5, metal: 0.4 });
        }
        if (step.id === "protect") { guard.position.set(0.18, 0.62, -0.85); guard.rotation.z = 1.5; }
        if (step.id === "glass") { nearGlass.visible = false; }
        if (step.id === "cut") {
          posts.b.rotation.z = 0.5;
          posts.b.position.y = 1.18;
          door.rotation.y = -1.65;
          patient.root.position.set(0.95, 0.44, 2.15);
          patient.root.rotation.set(-1.35, 0, 0);
        }
      },

      // Both interruptions move something in the world: a block appears under
      // the pack, and the pack starts venting along the near-side sill.
      onInterrupt(it) {
        if (it.id === "crib-under-pack") {
          strayed = true;
          strayBlock.visible = true;
          strayBlock.position.set(-0.15, 0.06, -1.33);
        }
        if (it.id === "runaway") {
          venting = 1;
          vent.visible = true;
          vent.position.set(-0.5, 0.18, 0.95);
          for (const s of sills) s.material = mat(0x9a3c14, { emissive: 0x9a3c14, ei: 0.8, rough: 0.6 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "crib-under-pack") {
          strayed = false;
          strayBlock.position.set(0.15, 0.06, -0.42);
        }
        if (it.id === "runaway") {
          venting = 0.25;
          stream.visible = true;
          for (const s of sills) s.material = sillHome;
        }
      },

      onHazard(hitId) {
        if (hitId === "crush-pack" || hitId === "cut-orange") {
          venting = Math.max(venting, 0.5);
          vent.visible = true;
        }
      },

      animate(t, dt, session) {
        // The dash lamp is lit from the moment the crew walks up, and the car
        // never makes a sound about it.
        if (ready) readyLamp.material.emissiveIntensity = 1.2 + Math.sin(t * 2.4) * 0.5;
        if (venting) {
          vent.visible = true;
          vent.userData.step(dt, new THREE.Vector3(-0.5, 0.18, 0.95), 0.18, 0.5 + venting * 0.5, 0.3);
        }
        if (stream.visible) {
          stream.userData.step(dt, new THREE.Vector3(-1.3, 0.3, 0.6), 0.06, 1.4, -1.4);
        }
        if (session?.step?.id === "bleed") {
          const left = Math.max(0, 6 - (session.holdFor ?? 0));
          repaint(clock.userData.screen, signFace(left.toFixed(1), {
            bg: "#1c1408", accent: left > 0.05 ? "#f97316" : "#59c97b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "pack-watch") {
          repaint(thermal.userData.screen, signFace(`+${(gg.t * 14).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t < 0.16 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        void strayed; void officer; void medic; void body; void roof; void nose; void pack;
        void CITY;
      },
    };
  },
};
