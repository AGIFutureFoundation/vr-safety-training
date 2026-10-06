import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, pavingFace, mudflatFace, reg, surfaceTexture, texturedMat,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Wildland-Urban Interface VR — Emergency Services, station 199.
// Structure defence at a wildland-urban interface fire: LCES named before
// anything else moves, the structure triaged as defensible or written off,
// the ember-resistant prep that actually buys a house time — vents, gutters,
// the propane tank, a hose lay that does not block the crew's own way out —
// the trigger points agreed before conditions change, a live read on wind and
// fire behaviour, and a resident who will not leave handled with respect and
// the authority that can actually order them out.

const WUI_ACCENT = 0xc98a2f;

export const SIM_WILDLAND_URBAN_INTERFACE = {
  id: "wildland-urban-interface",
  index: "199",
  domain: "Emergency Services",
  trade: "Firefighter — IAFF",
  category: "Emergency Services",
  weather: "wind",
  certification: "IAFF — NFPA 1500 fire department occupational safety and health and its LCES doctrine for wildland operations, NFPA 1140 standard for wildland fire protection in the built environment, NFPA 1977 protective ensembles for wildland fire fighting, OSHA 29 CFR 1910.156 fire brigades, NWCG wildland fire behaviour and structure triage guidance, and NIMS/ICS through FEMA IS-100 for the evacuation authority a sheriff's deputy is carrying on this road",
  name: "Wildland-Urban Interface",
  title: simTitle("Wildland-Urban Interface"),
  tagline: "Structure defence at a WUI fire: LCES first, the structure triaged, ember-resistant prep, the trigger points and the pull-out call, a live wind and fire-behaviour read, and a resident who will not leave handled with respect and the sheriff's authority",
  accent: WUI_ACCENT,
  accentCss: "#c98a2f",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "structure-held", name: "Structure Held", note: "A defensible structure prepped against embers, the trigger point respected, and the pull-out called the instant conditions changed" },

  game: system({
    name: "Structure Group",
    currency: "DEFENSE",
    ranks: ["Wildland Crew", "Engine Boss", "Strike Team Leader", "Division Supervisor", "WUI Certified"],
    badges: [
      { id: "lces-first", name: "LCES First", note: "Lookouts, communications, escape routes and safety zone all named before anything else moved", test: AWARD.stepClean("declare-lces") },
      { id: "no-shortcut", name: "No Shortcut", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "trigger-respected", name: "Trigger Respected", note: "The pull-out called the instant the trigger point was met, not after the hose lay was finished", test: AWARD.stepClean("wind-monitor") },
    ],
    challenges: [
      { id: "clean-defense", name: "Clean Defense", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "prep-held", name: "Prep Held", note: "Every timed task carried its full duration, no early release", test: AWARD.unbroken },
      { id: "prep-fast", name: "Prep Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "wood-pile-against-wall": "The stacked firewood is still touching the siding. A pile of split wood against the wall is not a detail to leave for later — it is a ladder fuel that carries an ember bed's heat straight into the structure's own skin, and every other piece of ember-resistant prep on this house means nothing while it is still there.",
    "hose-lay-blocking-escape": "The hose line was laid straight across the driveway — the crew's own primary way out. A structure-protection line that blocks the escape route trades a defended house for a crew with nowhere to drive if the trigger point is called in the next five minutes, and that trade is never the right one.",
    "remove-resident-forcibly": "You reached to physically move the resident toward the vehicle. Nobody on this crew has the legal authority to lay hands on a resident and force them off their own property — that authority belongs to the sheriff's deputy standing at the roadblock, and reaching for it yourself turns a refusal into a confrontation nobody needed.",
    "unauthorized-burnout": "You picked up the drip torch to burn out the brush yourself. A tactical burnout changes where and how a fire spreads across the whole division, and lighting one without it being called and coordinated through command can put fire into a crew, a safety zone or an escape route that nobody signed off on it moving toward.",
  },

  steps: [
    {
      id: "declare-lces", kind: "sequence",
      targets: ["lookout-posted", "comms-check", "escape-routes-marked", "safety-zone-marked"],
      itemNames: {
        "lookout-posted": "lookout posted", "comms-check": "communications checked",
        "escape-routes-marked": "escape routes marked", "safety-zone-marked": "safety zone marked",
      },
      itemNotes: {
        "lookout-posted": "Someone whose only job right now is watching the fire and the wind, with a clear line of sight neither the crew nor the smoke will block.",
        "comms-check": "Radio checked with command and with the lookout, on the same channel, before anybody's attention goes onto the structure.",
        "escape-routes-marked": "Two ways off this property, not one — a single route is a route that stops being an option the moment it is blocked.",
      },
      title: "Call LCES before anything else moves",
      cue: "Lookouts, communications, escape routes, safety zone — name all four before the crew touches the structure.",
      why: "LCES is not a checklist to close out once the real work starts — it is the condition the real work happens inside, because a crew that has not named its escape routes and safety zone yet is a crew discovering them for the first time at the exact moment it no longer has time to. Naming all four, in order, before the first vent is checked is what makes every step after this one a job worked with an out, not a job worked hoping one exists.",
      outOfOrderNote: "Lookout, then comms, then escape routes, then the safety zone — naming the safety zone before the escape routes are marked leaves the crew a place to run to with no agreed way of getting there.",
    },
    {
      id: "weather-brief", kind: "select", target: "weather-board",
      title: "Read the fire-behaviour and weather update",
      cue: "Check the spot forecast: wind direction, relative humidity, and which way the fire is expected to run.",
      why: "Everything the crew is about to commit to this structure is a bet against what the fire does in the next hour, and the spot weather forecast is the best information anybody has about that bet before conditions actually change. A crew that skips the briefing is prepping a structure against the fire behaviour from an hour ago, not the one that is coming.",
    },
    {
      id: "assess-defensible-space", kind: "gauge", target: "clearance-tape",
      title: "Measure the defensible space",
      cue: "Run the clearance tape from the structure to the nearest continuous fuel and commit the distance.",
      why: "Defensible space is a measured distance, not an impression from the driveway — NWCG's structure triage guidance sets a clearance a crew can actually defend inside, and a house that looks fine from the road can still have brush crowding the wall on the side nobody drove past. The tape is what turns triage from a guess into a number the next step can act on.",
      gauge: { label: "CLEARANCE", speed: 0.7, green: [0.55, 0.8], readout: (t) => `${Math.round(t * 60)} ft`, missNote: "That clearance is short of what NWCG's guidance treats as defensible — this structure may not be one this crew can commit to holding." },
    },
    {
      id: "triage-call", kind: "select", target: "triage-defensible",
      title: "Call the structure defensible",
      cue: "Given the clearance just measured and the roof and siding materials, call this structure defensible and commit to prepping it.",
      why: "Triage is the decision that everything else in this station depends on: a crew commits real time and a real hose lay to a structure only after deciding, on stated criteria, that the structure can actually be held — not because it is somebody's home, and not because walking away from it feels wrong. The same clearance and the same roofing on a structure the wind is about to put fire directly into would be called the other way.",
    },
    {
      id: "ember-hazard-find", kind: "find", noHint: true,
      targets: ["open-attic-vent", "needle-choked-gutter", "welcome-mat-fiber"],
      itemNames: {
        "open-attic-vent": "unscreened attic vent", "needle-choked-gutter": "gutter packed with dry needles",
        "welcome-mat-fiber": "fibre doormat at the entry",
      },
      itemNotes: {
        "open-attic-vent": "An open vent with no ember-resistant screen is a direct path into the attic space — embers do not need a flame front to get inside, only a gap.",
        "needle-choked-gutter": "A gutter packed with dry needles is a fuel bed sitting right at the roofline, exactly where wind-blown embers land first.",
        "welcome-mat-fiber": "A synthetic-fibre mat at the front door is a small, forgettable thing that catches an ember exactly like the gutter does, right at the threshold.",
      },
      decoyNotes: { "porch-lantern": "The porch light is not a fuel bed — leave it, the find is for what an ember can catch on, not every object on the porch." },
      title: "Find what an ember can catch on",
      cue: "Walk the structure and click every point an ember could catch and hold — three of them are here.",
      why: "A house rarely burns because flame reaches it directly at a WUI fire; it burns because embers thrown well ahead of the front find someplace to catch and hold — a vent, a gutter, a mat — and turn a near-miss into a structure fire an hour after the front has already passed. Finding those points before the front arrives is the entire logic of ember-resistant prep.",
    },
    {
      id: "vent-cover", kind: "drag", target: "vent-screen",
      title: "Screen the attic vent",
      cue: "Carry the ember-resistant screen from the kit and seat it over the open vent.",
      why: "A quarter-inch mesh screen is a small piece of metal that does the one job that matters here: it stops an ember from ever reaching the dry lumber and insulation on the other side of that opening, which a crew standing outside with a hose cannot do once fire is already inside the attic.",
      drag: { to: "vent-socket", radius: 0.5, missNote: "Not seated over the vent — a screen sitting beside the opening stops nothing that flies through it." },
    },
    {
      id: "gutter-clear", kind: "drag", target: "gutter-debris",
      title: "Clear the gutter",
      cue: "Pull the packed needles out of the gutter and drop them well clear of the structure.",
      why: "Clearing the gutter is not tidiness — it removes a fuel bed sitting at the roofline, right where wind-blown embers are most likely to land, so there is nothing there to catch when they do.",
      drag: { to: "clear-drop-zone", radius: 0.6, missNote: "Dropped too close to the house — debris pulled from the gutter still has to land somewhere that is not another fuel bed against the wall." },
    },
    {
      id: "propane-shutoff", kind: "turn", target: "propane-valve",
      title: "Shut the propane tank",
      cue: "Turn the tank valve fully closed.",
      why: "A propane tank with fire impinging on it is not a fuel source waiting to be a problem later — it is a pressure vessel, and shutting it off before the front arrives is one of the few single actions on this property that removes an entire category of failure rather than reducing its odds.",
      turn: { turns: 1.0, axis: "z", label: "PROPANE" },
    },
    {
      id: "hose-lay", kind: "drag", target: "hose-coil",
      title: "Lay the structure protection line",
      cue: "Stretch the line around the exposed side of the structure — clear of the driveway the crew is parked in.",
      why: "The line is laid to reach the side of the structure the wind is going to push fire toward, and it is laid specifically clear of the driveway because that driveway is the escape route named at LCES — a hose lay that crosses it is a hose lay the crew has to run through, or around, if the trigger point is called in the next few minutes.",
      drag: { to: "hose-socket", radius: 0.55, missNote: "Short of the structure — a hose lay that does not reach the exposed side is not protecting it yet." },
    },
    {
      id: "wind-monitor", kind: "gauge", target: "wind-meter",
      title: "Read the wind",
      cue: "Check the handheld anemometer and commit the current wind speed.",
      why: "Wind is the number that can turn this whole plan over in minutes — every trigger point the crew just agreed to is stated in terms of what the wind does, and a live reading, taken and re-taken, is what actually catches a shift before it shows up as fire behaviour instead of a number on a gauge.",
      gauge: { label: "WIND SPEED", speed: 0.72, green: [0.1, 0.4], readout: (t) => `${Math.round(t * 45)} mph`, missNote: "That reading is into the range the trigger point was set against — this is the moment to be watching for the call, not past it." },
    },
    {
      id: "trigger-brief", kind: "select", target: "trigger-board",
      title: "Confirm the trigger points",
      cue: "Read the trigger-point board out loud to the crew: the wind speed, the fire-behaviour sign and the time that call the pull-out.",
      why: "A trigger point agreed on before conditions change is a decision the whole crew already made together, with time to think, rather than one somebody has to make alone in the ten seconds after the wind shifts. Said out loud, it also means every member of the crew calls the same pull-out at the same threshold, instead of five people individually deciding whether now is the moment.",
    },
    {
      id: "resident-refusal", kind: "select", target: "defer-to-sheriff",
      title: "Hand the refusal to the authority that can act on it",
      cue: "The homeowner is refusing to leave. Stay calm, and bring the sheriff's deputy at the roadblock into the conversation.",
      why: "This crew's job is structure defence, not law enforcement, and nothing about being a firefighter gives anybody here the authority to order a resident off their own property — the deputy at the roadblock is carrying an evacuation order that actually has legal force, and involving them, calmly and without judgment, is what gets a resident moved without the crew stepping outside what it is actually allowed to do.",
    },
    {
      id: "op-log", kind: "sequence", anyOrder: true,
      targets: ["log-triage", "log-prep", "log-trigger"],
      itemNames: { "log-triage": "triage decision logged", "log-prep": "ember prep logged", "log-trigger": "trigger points logged" },
      title: "Log the operation",
      cue: "Write the triage call, the prep completed and the trigger points into the structure-defence log.",
      why: "The log is what lets the division supervisor, and whoever holds this line after this crew rotates out, know exactly what was checked, what was done and at what wind speed this crew agreed to leave — without it, the next crew is re-deciding all three from scratch on a structure that already answered them.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-checkin-board",
      title: "Check in with the crew",
      cue: "Ask how the crew is doing with the resident's refusal and the call they just made — not just whether the prep is done.",
      why: "Being told no by a resident who is frightened, and then handing that off to law enforcement, sits with people differently than a hose lay does, and the department's peer-support line exists for exactly that kind of weight as much as it does for anything seen on the fireground. Asking the question and recording the answer is what keeps that part of the job from going unspoken.",
    },
  ],

  interrupts: [
    {
      id: "wind-shift-trigger",
      kind: "Wind shift — trigger point met",
      after: "hose-lay", delay: 3, seconds: 13,
      alert: "The wind just swung and picked up past the number this crew agreed on — the lookout is calling the trigger point, right now.",
      cue: "Call the pull-out. The hose lay does not get finished.",
      target: "pullout-radio",
      why: "The entire point of setting a trigger point before conditions changed was to make this exact moment not a debate — the wind crossed the agreed threshold, and the correct response is the radio call that pulls the crew out, not five more minutes finishing a hose lay that already has to be abandoned if the fire behaviour keeps moving the way this wind says it will.",
      missNote: "The hose lay got finished before anybody kept moving toward the pull-out call. Whatever the fire did with the extra minutes the crew spent finishing it, that time was never actually available to spend once the trigger point was met.",
      wrongNote: "It is the pull-out call, not the hose in your hands — the trigger point was met, and finishing the lay was never the option once it was.",
    },
    {
      id: "resident-returns-for-pet",
      kind: "Resident back through the roadblock",
      after: "resident-refusal", delay: 3, seconds: 12,
      alert: "The resident who just left is coming back through the roadblock on foot, saying she forgot the dog.",
      cue: "Intercept her calmly before she reaches the structure — this is the deputy's call to make, not a door to let her back through.",
      target: "roadblock-intercept",
      why: "A resident coming back for a pet is acting on real love for that animal, not defiance, and the response that respects both her and the operation is the same one as before — calm, and routed through the roadblock's actual authority — rather than either letting her walk back into a structure the crew is actively prepping for embers or meeting her with anything that reads as hostile.",
      missNote: "She reached the yard before anyone stopped her. A crew mid-prep on ember-resistant work now has an unplanned civilian on a property with an open propane valve, exposed vents and a hose lay in progress, on top of everything else the trigger point is about to ask of them.",
      wrongNote: "It is the resident at the roadblock, not the prep in front of you — intercept her calmly before she reaches the structure.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, WUI_ACCENT);

    // ------------------------------------------------------------ the yard
    const yard = box(g, 6.4, 0.02, 5.6, -0.4, 0.005, 0, 0x8a7a5c, { rough: 0.95, cast: false });
    yard.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#8a7a5c", base2: "#6d5f45", cracks: 40, pools: 0 }), { repeat: 4, px: 384 }),
      { rough: 0.95, color: 0x8a7a5c },
    );
    const driveway = box(g, 1.6, 0.02, 5.4, 2.4, 0.006, 0, 0x3a3f45, { rough: 0.9, cast: false });
    driveway.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#3a3f45", base2: "#30353b", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 320 }),
      { rough: 0.88, color: 0x3a3f45 },
    );
    // Dry brush field on the wildland side.
    for (let i = 0; i < 24; i++) {
      const a = Math.random() * Math.PI * 2, r = 0.5 + Math.random() * 1.4;
      const bx = -2.6 + Math.cos(a) * r, bz = -1.0 + Math.sin(a) * r * 0.7;
      cyl(g, 0.02, 0.03, 0.14 + Math.random() * 0.16, bx, 0.07, bz, 0x8a7a3a, { rough: 0.95, seg: 5 });
    }
    for (let i = 0; i < 6; i++) {
      const sx = -3.0 + i * 0.4, sz = -2.2 - (i % 2) * 0.3;
      ball(g, 0.16 + Math.random() * 0.08, sx, 0.18, sz, 0x5a6a3a, { rough: 0.9, seg: 8 });
    }

    // -------------------------------------------------------------- house
    const house = group(g, -1.6, 0, -0.6);
    box(house, 3.0, 0.25, 2.4, 0, 0.12, 0, 0x6d6a63, { rough: 0.9, finish: "concrete", tile: [3, 1] });
    box(house, 2.9, 1.6, 2.3, 0, 1.05, 0, 0xa07a52, { rough: 0.85, finish: "painted", tile: [3, 2] });
    for (let i = 0; i < 6; i++) box(house, 2.88, 0.012, 2.32, 0, 0.4 + i * 0.24, 0, 0x7a5a3a, { rough: 0.9, cast: false });
    const roof = box(house, 3.3, 0.14, 2.7, 0, 1.98, 0, 0x3c3630, { rough: 0.85 });
    void roof;
    box(house, 3.32, 0.06, 0.1, 0, 2.05, 1.32, 0x2b2723, { rough: 0.6, metal: 0.3, cast: false }); // gutter run, front
    holoTag(house, "Structure — triage this", 0, 2.3, 1.3, { css: "#c98a2f", w: 0.5 });

    // Attic vent (hazard until screened).
    const vent = box(house, 0.32, 0.2, 0.05, 0.8, 1.85, 1.17, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    holoTag(house, "Attic vent — open", 0.8, 2.1, 1.2, { css: "#f0645b", w: 0.4 });
    reg(hits, vent, "open-attic-vent");
    const ventSocket = box(house, 0.32, 0.2, 0.02, 0.8, 1.85, 1.18, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["vent-socket"] = ventSocket;
    // Ember-resistant screen, carried from the kit at the engine.
    const kit = toolChest(g, 2.7, 0.9, { ry: -0.6, color: 0x7a4a1f });
    const ventScreen = box(kit, 0.16, 0.16, 0.01, 0, 0.9, 0, 0xb8bec4, { rough: 0.4, metal: 0.6 });
    holoTag(kit, "Ember screen", 0, 1.05, 0, { css: "#c98a2f", w: 0.32 });
    reg(hits, ventScreen, "vent-screen");

    // Gutter packed with needles, and the clump of them a crew actually drags clear.
    const gutter = box(house, 1.0, 0.05, 0.1, -0.9, 2.0, 1.3, 0x6a5a2a, { rough: 0.9 });
    holoTag(house, "Gutter — needle packed", -0.9, 2.15, 1.35, { css: "#f0645b", w: 0.44 });
    reg(hits, gutter, "needle-choked-gutter");
    const gutterDebris = ball(house, 0.05, -0.9, 1.97, 1.3, 0x8a7a3a, { rough: 0.9, seg: 8 });
    reg(hits, gutterDebris, "gutter-debris");

    // Doormat.
    const mat1 = box(house, 0.4, 0.02, 0.24, 0, 0.26, 1.22, 0x8a5a3a, { rough: 0.8 });
    holoTag(house, "Doormat — fibre", 0, 0.35, 1.3, { css: "#f0645b", w: 0.36 });
    reg(hits, mat1, "welcome-mat-fiber");

    // Porch lantern decoy.
    const lantern = group(house, 1.2, 0, 1.24);
    ball(lantern, 0.05, 0, 0.9, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2, seg: 10 });
    reg(hits, lantern, "porch-lantern");

    // Firewood pile against the wall (hazard).
    const woodPile = group(house, -1.3, 0, 0.7);
    for (let i = 0; i < 8; i++) {
      cyl(woodPile, 0.06, 0.06, 0.5, 0, 0.06 + Math.floor(i / 4) * 0.13, -0.2 + (i % 4) * 0.13, 0x6a4a2e, { rough: 0.85, seg: 8 }).rotation.z = Math.PI / 2;
    }
    holoTag(woodPile, "Woodpile — against the wall", 0, 0.5, 0, { css: "#f0645b", w: 0.5 });
    reg(hits, woodPile, "wood-pile-against-wall");

    // Propane tank at the far side.
    const propane = group(house, 1.6, 0, -0.5);
    box(propane, 0.3, 0.5, 0.9, 0, 0.28, 0, 0xcfd6dc, { rough: 0.4, metal: 0.5, finish: "galvanised" });
    const propaneValve = valveWheel(propane, 0, 0.62, 0.3, { color: 0xc98a2f, body: 0x7a4a1f, r: 0.07 });
    holoTag(propane, "Propane tank", 0, 0.85, 0.3, { css: "#c98a2f", w: 0.3 });
    reg(hits, propaneValve, "propane-valve");

    // Drop zone for cleared gutter debris, well clear of the house.
    const dropZone = box(g, 0.5, 0.02, 0.5, -0.7, 0.011, 1.9, 0xc98a2f, { rough: 0.7, emissive: WUI_ACCENT, ei: 0.2 });
    hits["clear-drop-zone"] = dropZone;

    // Structure-protection hose reel and lay socket.
    const engine = group(g, 2.4, 0, 1.9, -Math.PI / 2);
    box(engine, 2.6, 0.85, 1.0, 0, 0.7, 0, 0x2f5d3a, { rough: 0.5, metal: 0.3 });
    for (const wx of [-0.9, 0.9]) for (const wz of [-0.42, 0.42]) { const wheel = cyl(engine, 0.22, 0.22, 0.2, wx, 0.24, wz, 0x1a1e23, { rough: 0.9, seg: 12 }); wheel.rotation.x = Math.PI / 2; }
    const hoseCoil = torus(engine, 0.13, 0.04, 0, 0.95, -0.5, 0xc98a2f, { rough: 0.65, seg: 8, seg2: 16 });
    hoseCoil.rotation.x = Math.PI / 2;
    holoTag(engine, "Structure protection line", 0, 1.2, -0.5, { css: "#c98a2f", w: 0.44 });
    reg(hits, hoseCoil, "hose-coil");
    const hoseSocket = box(house, 0.4, 0.05, 0.4, -0.5, 0.03, 1.35, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["hose-socket"] = hoseSocket;
    // The escape-route hazard: a straight lay across the driveway itself.
    const badLay = hose(g, [[1.5, 0.05, 1.9], [2.4, 0.05, 0.4], [1.5, 0.05, -1.0]], 0.03, 0xf0645b, { steps: 10, seg: 6, rough: 0.6 });
    reg(hits, badLay, "hose-lay-blocking-escape");

    // Wind meter and weather / trigger boards.
    const windPost = group(g, 0.4, 0, 2.1);
    cyl(windPost, 0.02, 0.02, 1.1, 0, 0.55, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    const windMeter = instrument(windPost, 0, 1.15, 0, { ry: 0.4, idle: "-- mph", color: WUI_ACCENT, w: 0.14 });
    reg(hits, windMeter, "wind-meter");
    for (let i = 0; i < 3; i++) box(windPost, 0.16, 0.02, 0.02, 0, 1.05, 0, 0x8a929a, { rough: 0.5, metal: 0.4 }).rotation.y = (i * Math.PI) / 3;

    const weatherBoard = holoPanel(g, 0.6, 0.42, -3.0, 1.35, 1.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,16,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c98a2f"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffe9c8";
      ctx.fillText("SPOT WEATHER", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#f0d9ad";
      ["Wind: SW 12, gusting", "RH: 14% and falling", "Fire run: uphill, NE flank", "Red-flag conditions likely by 1600"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { ry: 0.6, accent: WUI_ACCENT });
    reg(hits, weatherBoard, "weather-board");

    const triggerBoard = holoPanel(g, 0.6, 0.42, -3.0, 1.35, 2.4, (ctx, w, h) => {
      ctx.fillStyle = "rgba(22,16,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f0645b"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#ffe0da";
      ctx.fillText("TRIGGER POINTS", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#f5c9c2";
      ["Wind past 25 mph sustained", "Spotting inside the safety zone", "Lookout's call — no debate"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.32 + i * 0.16)));
    }, { ry: 0.6, accent: 0xf0645b });
    reg(hits, triggerBoard, "trigger-board");

    // Clearance tape from the structure to the brush line.
    const tape = hose(g, [[-1.4, 0.05, 0.4], [-2.3, 0.05, -0.4]], 0.008, 0xf2c14b, { steps: 6, seg: 5, rough: 0.5 });
    reg(hits, tape, "clearance-tape");
    const triageBadge = decal(house, 0.3, 0.16, 0, 2.55, 1.3, signFace("TRIAGE?", { bg: "#1b1211", accent: "#f2c14b", fg: "#ffe9c8", scale: 0.5 }), { px: 128 });
    reg(hits, triageBadge, "triage-defensible");

    // LCES markers.
    const lookout = group(g, -3.0, 0, 1.6);
    cyl(lookout, 0.03, 0.03, 1.6, 0, 0.8, 0, 0x8a929a, { rough: 0.5, metal: 0.4, seg: 8 });
    ball(lookout, 0.1, 0, 1.65, 0, WUI_ACCENT, { emissive: WUI_ACCENT, ei: 0.5, seg: 10 });
    holoTag(lookout, "Lookout post", 0, 1.9, 0, { css: "#c98a2f", w: 0.32 });
    reg(hits, lookout, "lookout-posted");
    const commsRadio = group(g, 2.7, 0, 2.6);
    box(commsRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(commsRadio, "Comms check", 0, 1.05, 0, { css: "#c98a2f", w: 0.32 });
    reg(hits, commsRadio, "comms-check");
    const escapeMarker = group(g, 2.4, 0, -2.2);
    box(escapeMarker, 0.3, 0.4, 0.02, 0, 0.2, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.4, rough: 0.6 });
    holoTag(escapeMarker, "Escape route", 0, 0.5, 0, { css: "#59c97b", w: 0.34 });
    reg(hits, escapeMarker, "escape-routes-marked");
    const safeZone = box(g, 1.4, 0.01, 1.2, 2.6, 0.006, -1.0, 0x59c97b, { rough: 0.7, opacity: 0.35, transparent: true, cast: false });
    holoTag(g, "Safety zone", 2.6, 0.2, -1.0, { css: "#59c97b", w: 0.34 });
    reg(hits, safeZone, "safety-zone-marked");

    // Unauthorized-burnout trap: a drip torch left in the brush.
    const dripTorch = group(g, -3.2, 0, -1.0);
    cyl(dripTorch, 0.03, 0.03, 0.35, 0, 0.18, 0, 0xb8402f, { rough: 0.5, metal: 0.4, seg: 8 });
    holoTag(dripTorch, "Start a burnout here?", 0, 0.4, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, dripTorch, "unauthorized-burnout");

    // Roadblock, sheriff's deputy, resident, pet-run intercept point.
    const roadblock = group(g, 3.2, 0, -1.8);
    barrierPanel(roadblock, 0, 0, { w: 1.3 });
    cone(g, 3.2, -1.2);
    cone(g, 3.2, -2.4);
    const deputy = standingFigure(g, 3.6, -3.0, { ry: -2.2, cloth: 0x2b3a5c, vest: 0xf2c14b });
    holoTag(deputy, "Sheriff's deputy", 0, 1.9, 0, { css: "#c98a2f", w: 0.4 });
    const deferPanel = box(deputy, 0.3, 0.2, 0.02, 0.3, 1.2, 0, 0xc98a2f, { emissive: WUI_ACCENT, ei: 0.4, rough: 0.5 });
    reg(hits, deferPanel, "defer-to-sheriff");
    const forcePanel = box(deputy, 0.3, 0.2, 0.02, -0.3, 1.2, 0, 0xf0645b, { emissive: 0xf0645b, ei: 0.4, rough: 0.5 });
    reg(hits, forcePanel, "remove-resident-forcibly");

    const resident = standingFigure(g, 0.2, 2.3, { ry: 2.6, cloth: 0x5a3d5c, atStation: true });
    holoTag(resident, "Resident", 0, 1.9, 0, { css: "#f0645b", w: 0.28 });
    const interceptSpot = box(g, 0.5, 0.4, 0.5, 1.4, 0.2, -0.3, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, interceptSpot, "roadblock-intercept");

    const pulloutRadio = group(g, 2.7, 0, 1.4);
    box(pulloutRadio, 0.09, 0.16, 0.05, 0, 0.9, 0, 0x2b3138, { rough: 0.5 });
    holoTag(pulloutRadio, "Pull-out call", 0, 1.05, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, pulloutRadio, "pullout-radio");

    // Log board and crew check-in.
    const logSpec = [["log-triage", -0.2], ["log-prep", 0.0], ["log-trigger", 0.2]];
    const logBoard = group(g, 3.0, 0, 2.4);
    for (const [id, tx] of logSpec) {
      const tile = box(logBoard, 0.12, 0.12, 0.02, tx, 0.9, 0, 0x1a0c0d, { rough: 0.6 });
      reg(hits, tile, id);
    }
    holoTag(logBoard, "Structure-defence log", 0, 1.08, 0, { css: "#c98a2f", w: 0.5 });

    const checkinBoard = holoPanel(g, 0.55, 0.38, -3.0, 1.35, 0.3, (ctx, w, h) => {
      ctx.fillStyle = "rgba(10,18,20,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillStyle = "#e2f6ff";
      ctx.fillText("CREW CHECK-IN", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; ctx.fillStyle = "#cfeaf7";
      ["\"How are you doing?\" — ask it", "Peer-support / CISM line posted", "Answer logged, not assumed"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.36 + i * 0.19)));
    }, { ry: 0.6, accent: 0x4fd1ff });
    reg(hits, checkinBoard, "crew-checkin-board");

    // Two crew figures, clear of the structure and the engine.
    standingFigure(g, -0.5, 1.5, { ry: 2.2, cloth: 0x2b3a2f, helmet: 0x8a1f1f, vest: 0xf2c14b });
    standingFigure(g, 1.3, 0.4, { ry: -1.6, cloth: 0x2b3a2f, helmet: 0x8a1f1f, vest: 0xf2c14b });

    const embers = particles(g, 60, 0xf2a23b, { size: 0.02, life: 1.2, additive: true, opacity: 0.7 });
    embers.position.set(-3.0, 0.3, -1.4);

    return {
      hits,
      footprint: 2.8,
      spawnLook: new THREE.Vector3(-0.5, 1.2, -0.4),

      onStepComplete(step) {
        if (step.id === "vent-cover") vent.material = mat(0x6a6f75, { rough: 0.5, metal: 0.3 });
        if (step.id === "gutter-clear") gutter.material = mat(0x4a4038, { rough: 0.85 });
        if (step.id === "propane-shutoff") propaneValve.userData.wheel.rotation.z = Math.PI / 2;
        if (step.id === "hose-lay") hoseCoil.visible = false;
        if (step.id === "resident-refusal") { resident.position.set(3.2, 0, -3.0); }
        if (step.id === "op-log") { /* logged, visual handled by tile emissive already */ }
      },

      onInterrupt(it) {
        if (it.id === "wind-shift-trigger") { pulloutRadio.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 }); }
        if (it.id === "resident-returns-for-pet") { resident.position.set(1.6, 0, 0.1); resident.rotation.y = 0.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "wind-shift-trigger") { pulloutRadio.children[0].material = mat(0x2b3138, { rough: 0.5 }); }
        if (it.id === "resident-returns-for-pet") { resident.position.set(3.2, 0, -3.0); resident.rotation.y = 2.6; }
      },

      animate(t, dt) {
        embers.visible = true; embers.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.6, 0.5, 0.15);
        const spin = windMeter.userData.screen;
        void spin; void t;
      },
    };
  },
};
