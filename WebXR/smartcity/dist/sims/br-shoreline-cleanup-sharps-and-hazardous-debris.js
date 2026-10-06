import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, torus, group, decal, repaint, signFace, paperFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, mudflatFace, pavingFace,
} from "../citykit.js";
import { boxTruck } from "../../../shared/fleet.js";
import { fourGasMeter } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shoreline Cleanup — Sharps And Hazardous Debris VR — Water &
// Environmental, Bay Restoration & Cleanup pack C.
//
// A generic bay shoreline after a storm tide has pushed a season's worth of
// debris up the beach — not any one site, and no claim about any one site's
// history. Most of what a cleanup crew bags here is ordinary trash, and the
// job is entirely different the moment a needle, a shard of glass or a
// leaking drum turns up in it: the same gloved hand that bags a plastic
// bottle all day is not the hand that picks up a sharp, and the same crew
// that hauls debris to the truck all day is not the crew that opens a drum
// nobody can identify. Awareness-level training exists to teach exactly that
// line — what this crew handles, and what it flags and calls in instead.

const BRSH_ACCENT = 0x5f9e5a;
const BRSH_FLAG = 0xe8622a;

export const SIM_BR_SHORELINE_CLEANUP_SHARPS_AND_HAZARDOUS_DEBRIS = {
  id: "br-shoreline-cleanup-sharps-and-hazardous-debris",
  index: "br-c4",
  domain: "Environmental",
  trade: "Restoration laborer — shoreline debris and hazardous materials awareness crew",
  category: "Water & Environmental",
  district: "Environmental Monitoring",
  weather: "fog",
  certification: "LIUNA Local 261 laborers — hazardous waste and shoreline debris awareness crew; OSHA 29 CFR 1926 general construction safety; OSHA 29 CFR 1910.1030 bloodborne pathogens exposure control plan; OSHA 29 CFR 1910.120 HAZWOPER site worker awareness level; RCRA 40 CFR Part 261 hazardous waste identification; RCRA 40 CFR Part 262 generator and manifest requirements; San Francisco Bay Conservation and Development Commission (BCDC) shoreline access permit; California Department of Fish and Wildlife shoreline habitat protections; nesting buffer per the Endangered Species Act",
  name: "Shoreline Cleanup — Sharps And Hazardous Debris",
  title: simTitle("Shoreline Cleanup — Sharps And Hazardous Debris"),
  tagline: "Cleaning a storm-tide shoreline where ordinary trash hides sharps and a leaking drum: sharps containers staged and air read before anyone works the debris line, tongs for anything that punctures, the drum flagged and called in instead of opened, decon before the exclusion zone is left, and the beach walked clean before the truck pulls out",
  accent: BRSH_ACCENT,
  accentCss: "#5f9e5a",
  parSeconds: 310,
  footprint: 2.7,
  badge: { id: "beach-clear", name: "Beach Cleared Clean", note: "Every sharp bagged by tongs, the drum never touched, nothing left on the sand — first time" },

  game: system({
    name: "Cleanup Crew",
    currency: "DEBRIS",
    ranks: ["Laborer", "Crew Hand", "Lead Hand", "Site Steward", "Hazmat Awareness Certified"],
    badges: [
      { id: "no-exposure", name: "No Exposure", note: "Never a hazard, every sharp handled by tongs", test: AWARD.safe },
      { id: "air-clean", name: "Air Read Clean", note: "The air monitor reading held inside the safe band", test: AWARD.precise(0.7) },
      { id: "site-first", name: "Site Read Clean", note: "Safety plan and sharps containers both read clean before collection started", test: AWARD.stepClean("sharps-check") },
    ],
    challenges: [
      { id: "clean-beach", name: "Clean Beach", note: "No corrections across the whole cleanup", test: AWARD.clean },
      { id: "steady-haul", name: "Steady Haul", note: "Held the net haul inside the working band the whole pass", test: AWARD.unbroken },
      { id: "beach-fast", name: "Beach Cleared Fast", note: "Cleanup closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "bare-hand-sharps": "You reached for a needle on the sand with a bare gloved hand instead of the tongs staged for exactly this find. A nitrile glove stops dirt and grime; it does not stop a needle, and a sharps injury on a public beach comes with no way to know what was on that needle before it washed up here.",
    "drum-open-unauthorized": "You went to open the unidentified drum instead of flagging it and calling it in. This crew is trained to hazardous waste awareness level, not to hazardous materials response — the whole point of that line is that nobody on this beach opens a container they cannot identify, because the crew trained to do that safely is a phone call away and this crew is not it.",
    "manual-lift-net": "You went to muscle the tangled derelict net up the beach solo instead of working it with the crew or the come-along staged for it. A net this size is heavier than it looks once it is full of sand and whatever it snagged on the way in, and a back strained hauling it alone is exactly the injury the second set of hands was there to prevent.",
    "truck-unspotted-back": "You backed the truck toward the debris pile without the spotter's call. The truck's own box blocks the driver's view of the exact ground the crew is working on foot, and backing on a guess instead of a confirmed all-clear is how a truck finds a person the mirror never showed.",
  },

  lateNotes: {
    "sharp-needle-1": "Collect sharps only after the containers are confirmed staged and the air reading is clean — working the pile before either one is checked is working it blind.",
    "overpack-seal": "Overpack the leaking can only after the drum itself has been flagged, not opened — the overpack is for what this crew is trained to contain, not for what it is trained to leave alone.",
    "decon-spigot": "Wash down at the decon station only after the last item is bagged — stepping through it early just means walking back into the exclusion zone still needing a wash on the way out.",
  },

  // Interruptions: see shared/game.js. The first is the sharps container
  // doing exactly what a container does once it is full; the second is the
  // wind doing what wind does to whatever the suspect drum is carrying.
  interrupts: [
    {
      id: "sharps-container-full",
      kind: "Sharps container reaches its fill line",
      after: "sharps-collect", delay: 3, seconds: 12,
      alert: "The sharps container the crew has been using just filled past its fill line — the next needle in has nowhere safe left to go.",
      cue: "Swap in a fresh container now. Nothing else gets dropped into a container already past its line.",
      target: "sharps-container-swap",
      why: "A sharps container used past its fill line stops being a closed container and starts being a needle held in by nothing but luck — swapping it the moment it reads full is what keeps every sharp on this beach going into a container built to hold it instead of one already failing to.",
      missNote: "A needle went into the overfull container anyway, and it rode on top instead of inside — exactly the sharp a hand finds by accident later instead of a tool finding on purpose now.",
      wrongNote: "That is not it. The full container needs its own swap for a fresh one — nothing else on this beach makes room for the next sharp.",
    },
    {
      id: "wind-shifts-toward-drum",
      kind: "Wind shifts fog and possible vapor toward the crew",
      after: "drum-flag", delay: 4, seconds: 13,
      alert: "The onshore fog has shifted and is now drifting straight off the flagged drum toward the crew's position instead of out to sea.",
      cue: "Muster upwind now, away from the drum, until the shift is confirmed to have passed.",
      target: "upwind-muster",
      why: "Nobody on this beach knows what is in that drum, and a wind shift that carries whatever it is venting toward the crew is exactly the reason the drum was flagged instead of opened — moving upwind the moment the shift is seen is the only response available to a crew trained to awareness level, not to entry.",
      missNote: "The crew kept working downwind of the drum through the shift, breathing whatever the fog was carrying off it for several minutes before anyone thought to move — exposure nobody can undo just by moving upwind afterward.",
      wrongNote: "It's the upwind muster point. Nothing else on this beach gets the crew clear of whatever that drum is carrying on the wind.",
    },
  ],

  steps: [
    {
      id: "check-in", kind: "select", target: "site-safety-plan-board",
      title: "Check the site safety plan before staging",
      cue: "Read the site safety plan, the BCDC access permit, the exposure control plan, and the work window before anyone steps onto the sand.",
      why: "This beach is worked under a site safety plan the same way any hazardous-waste-aware cleanup is — the bloodborne pathogens exposure control plan for whatever sharps turn up, the BCDC permit for shoreline access, and CDFW's own habitat protections and nesting buffer where the debris line runs past cover — and a crew that skips the plan because 'it's just beach trash' finds out the difference the first time it is not.",
    },
    {
      id: "stage-ppe", kind: "sequence", anyOrder: true,
      targets: ["stage-gloves", "stage-hi-vis", "stage-glasses"],
      itemNames: { "stage-gloves": "cut-resistant gloves", "stage-hi-vis": "high-visibility vest", "stage-glasses": "safety glasses" },
      title: "Stage the cleanup crew's PPE",
      cue: "Cut-resistant gloves, high-visibility vest and safety glasses before anyone works the debris line.",
      why: "Cut-resistant gloves are for the glass and metal edges hiding in a pile that looks like soft trash from a few feet away; the vest is what lets the truck driver see a body against the sand; safety glasses are for whatever a rake or a tong turns up and flings without warning.",
    },
    {
      id: "find-zones", kind: "find", noHint: true,
      targets: ["zone-flag-1", "zone-flag-2", "zone-flag-3"],
      itemNames: { "zone-flag-1": "zone flag 1 — north", "zone-flag-2": "zone flag 2 — center", "zone-flag-3": "zone flag 3 — south" },
      itemNotes: {
        "zone-flag-1": "Flag 1 marks the north end of today's cleanup grid. The crew works from here, not from wherever the debris looks thickest.",
        "zone-flag-2": "Flag 2 is the center control — it is what tells the crew the grid is being worked systematically instead of skipped over in patches.",
        "zone-flag-3": "Flag 3 marks the south end. Past it belongs to tomorrow's grid, not today's.",
      },
      title: "Find the flags that set today's cleanup grid",
      cue: "Walk the beach and click the three flags the cleanup grid is built from.",
      why: "A beach worked without a marked grid gets the easy trash close to the truck and misses whatever is past the last convenient stopping point — finding all three flags first is what turns a cleanup into a grid the whole crew covers instead of three honest guesses at where the trash is worst.",
    },
    {
      id: "sharps-check", kind: "select", target: "sharps-container",
      title: "Confirm the sharps containers are staged",
      cue: "Check that a sharps container and a pair of tongs are staged at the work area before collection starts.",
      why: "A sharp found with no container staged for it becomes a sharp carried across the beach looking for somewhere to put it, and that walk is exactly when a puncture happens — staging the container first means the very first needle found has somewhere safe to go before it is ever picked up.",
    },
    {
      id: "air-monitor-check", kind: "gauge", target: "air-monitor",
      title: "Read the four-gas meter before working near the drum",
      cue: "Take the reading at the debris line and commit it inside the safe band before working near the flagged drum.",
      why: "An unidentified drum on a beach is exactly the kind of unknown the meter exists to check for before anyone works near it — a reading now is what tells the crew the air at this end of the grid is still safe to breathe instead of assuming it because nothing smells wrong yet.",
      gauge: { label: "LEL/O2", speed: 0.7, green: [0.4, 0.6], readout: (t) => `${(t * 25).toFixed(1)}% LEL`, missNote: "Outside the safe band. Let the reading settle and commit again before working this end of the grid." },
    },
    {
      id: "sharps-collect", kind: "sequence", anyOrder: true,
      targets: ["sharp-needle-1", "sharp-needle-2", "sharp-glass"],
      itemNames: { "sharp-needle-1": "needle — near the tideline", "sharp-needle-2": "needle — half-buried in sand", "sharp-glass": "broken glass shard" },
      title: "Collect the sharps with tongs into the container",
      cue: "Use the tongs on all three sharps and drop each one into the sharps container — never a bare hand.",
      why: "Every one of these items breaks skin before it registers as dangerous, and the tongs exist so the only thing that ever touches a sharp on this beach is a tool built to be thrown away with it, not a hand that has to be checked afterward for a puncture nobody saw happen.",
    },
    {
      id: "debris-haul", kind: "drag", target: "debris-bag",
      title: "Haul the bagged debris to the staging pile",
      cue: "Carry the filled debris bag out to the staging pile before it is left where it can blow back down the beach.",
      why: "A bag left sitting on the sand is a bag the next tide or the next gust puts right back into the grid the crew just cleared — the staging pile is what makes today's collection stay collected instead of drifting back into tomorrow's cleanup.",
      drag: { to: "staging-pile", radius: 0.5, missNote: "Not at the pile — a bag left short of it is a bag the wind still gets to move." },
    },
    {
      id: "net-haul", kind: "track", target: "derelict-net", seconds: 7,
      title: "Haul the tangled derelict net up the beach",
      cue: "Walk the net up the beach at a steady pace with the crew, staying inside the working band.",
      why: "A steady pull keeps the net moving as one load instead of catching on whatever it snagged on the way in; too fast and it jerks and drops sand-buried hooks or line back onto bare feet, too slow and it digs into the sand and doubles the effort needed to keep it moving at all.",
      track: { start: 0.1, green: [0.36, 0.58], rise: 0.55, fall: 0.45, drift: 0.12, label: "HAUL", readout: (v) => (v < 0.36 ? "stalled in the sand" : v > 0.58 ? "jerking, too fast" : "steady pull") },
      holdBreakNote: "The pull broke and the net snagged in the sand. Bring it back to a steady pace before it catches on anything buried in it.",
    },
    {
      id: "drum-flag", kind: "select", target: "suspect-drum",
      title: "Flag the unidentified drum and call it in",
      cue: "Mark the drum with a hazard flag and note it for the hazmat call-in — do not open or move it.",
      why: "This crew's training stops at recognizing a hazard and calling in the crew trained to handle it — flagging the drum and logging its location is the entire job here, and it is exactly the job that keeps an unknown container from becoming this crew's emergency instead of a specialist's routine call.",
    },
    {
      id: "overpack-seal", kind: "hold", target: "overpack-seal", seconds: 5,
      title: "Seal the overpack on the leaking paint can",
      cue: "Hold the overpack lid steady while the ring clamp is tightened down over the leaking can.",
      why: "A leaking can this size is within what an awareness-level crew is trained to contain, not respond to — held steady until the clamp seats, the overpack stops the leak from spreading any further across the sand while the can waits for proper disposal under manifest.",
      holdBreakNote: "The lid shifted before the clamp seated — reset it square on the overpack and hold until the seal is tight.",
    },
    {
      id: "decon-wash", kind: "turn", target: "decon-spigot",
      title: "Wash down at the decon station before leaving the exclusion zone",
      cue: "Turn the decon spigot and rinse gloves and boots before stepping past the line.",
      why: "Whatever this crew's gloves and boots picked up inside the exclusion zone does not get to leave the zone on them — the decon station is the one step between a clean cleanup and one that just relocates whatever it found from the sand to the truck cab, the tailgate, and everything else the crew touches next.",
      turn: { turns: 0.8, axis: "y", label: "DECON SPIGOT" },
    },
    {
      id: "spotter-checkin", kind: "select", target: "truck-spotter-radio",
      title: "Check in with the spotter before backing the truck",
      cue: "Call the spotter on the radio and get a clear signal before backing the truck toward the debris pile.",
      why: "The truck's box blocks the driver's view of the exact ground the crew works on foot, and backing without the spotter's call is backing on a guess about people the mirror was never going to show in the first place.",
    },
    {
      id: "walk-hazards", kind: "find", noHint: true,
      targets: ["loose-sharp-flag", "blown-bag"],
      itemNotes: {
        "loose-sharp-flag": "A sharp sits here that the first pass missed — click it to confirm the crew catches it with tongs before anyone else does with a bare foot.",
        "blown-bag": "A debris bag has come untied and is already unloading itself back onto the sand this crew just cleared.",
      },
      title: "Walk the beach and confirm nothing is left behind",
      cue: "Check the missed sharp and the untied bag before the crew calls this grid done.",
      why: "A sharp missed on the first pass or a bag that comes loose on the walk back is easy to overlook once the crew's attention has moved to loading the truck — walking the grid now, before anyone leaves, is the last chance to catch what the next beachgoer would otherwise find instead.",
    },
    {
      id: "log-cleanup", kind: "select", target: "closing-log",
      title: "Log the day's cleanup",
      cue: "Record the grid covered, the sharps collected, the drum's location, and the air readings for the crew's record.",
      why: "The hazmat call-in reads today's log to find the drum, not today's memory of where it was — a cleanup that went clean but was never logged looks, from tomorrow's map, exactly like a beach nobody has checked yet, and a drum location that was never written down is a fact the specialist crew has no way to confirm on its own.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.7, BRSH_ACCENT);

    // ---------------------------------------------------------------- terrain
    // Upland access road toward +z where the truck parks, a wide storm-tide
    // debris beach where the cleanup happens, and open bay water toward -z.
    const upland = box(g, 6.0, 0.3, 1.3, 0, 0.15, 1.9, 0x5a4a34, { rough: 0.96 });
    void upland;
    const padTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#4a4a4c", base2: "#3d3d40", seam: "rgba(0,0,0,0.4)" }), { repeat: 4, px: 256 });
    const pad = box(g, 6.0, 0.02, 1.3, 0, 0.311, 1.9, 0x4a4a4c, { rough: 0.9, cast: false });
    pad.material = texturedMat(padTex, { rough: 0.9, color: 0x9a9a9e });

    const slope = box(g, 6.0, 0.4, 0.6, 0, 0.14, 1.1, 0x8a7a54, { rough: 0.96 });
    slope.rotation.x = 0.3;
    const beachTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#b7a67a", base2: "#9a8a60", cracks: 4, pools: 2 }), { repeat: 4, px: 256 });
    const beach = box(g, 6.0, 0.1, 2.0, 0, 0.02, 0.2, 0xb7a67a, { rough: 0.9, cast: false });
    beach.material = texturedMat(beachTex, { rough: 0.9, color: 0xc9bb8e });

    const waterTex = surfaceTexture((cx, w, h) => {
      cx.fillStyle = "#1c4a52"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 24; i++) {
        cx.strokeStyle = "rgba(180,220,225,0.10)"; cx.lineWidth = 1 + Math.random() * 2;
        cx.beginPath(); const y = Math.random() * h;
        cx.moveTo(0, y); cx.bezierCurveTo(w * 0.25, y + 16, w * 0.75, y - 16, w, y); cx.stroke();
      }
    }, { repeat: 4, px: 256 });
    const water = box(g, 6.0, 0.03, 0.8, 0, 0.012, -1.5, 0x1c4a52, { rough: 0.2, metal: 0.3, opacity: 0.88, transparent: true, cast: false });
    water.material = texturedMat(waterTex, { rough: 0.2, metal: 0.25, color: 0x2c6a72 });
    water.material.transparent = true;
    water.material.opacity = 0.88;
    const wave = particles(g, 22, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.4 });
    wave.position.set(0, 0.03, -1.55);
    const fogPuff = particles(g, 16, 0xd8e4e8, { size: 0.14, life: 2.0, additive: false, opacity: 0.18 });
    fogPuff.position.set(0.5, 0.6, -0.7);

    // -------------------------------------------------------- upland station
    const planBoard = holoPanel(g, 0.95, 0.62, -2.3, 1.08, 2.1, (cx, w, h) => {
      cx.fillStyle = "#0d1c14"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#5f9e5a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#dff3d8"; cx.fillText("SITE SAFETY PLAN — GRID 12", w * 0.06, h * 0.11);
      cx.font = `${Math.round(h * 0.062)}px Arial, sans-serif`; cx.fillStyle = "#e7f7e0";
      ["Exposure control plan on site", "BCDC shoreline access permit",
       "CDFW habitat protections apply", "Nesting buffer per the ESA", "HAZWOPER awareness level only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.27 + i * 0.1)));
    }, { ry: 0.4, accent: BRSH_ACCENT });
    reg(hits, planBoard, "site-safety-plan-board");

    const truck = boxTruck(g, 2.4, 0.02, 2.1, { ry: Math.PI, livery: { colour: 0x3f6f4a, fleetName: "HAZMAT AWARE CREW", unitNumber: "BX-9" } });
    void truck;

    const chest = toolChest(g, 0, 2.0, { color: 0x2f6f4a });
    for (const [id, dx, color, label] of [["stage-gloves", -0.2, 0x8a6a4a, "GLOVES"], ["stage-hi-vis", 0.0, 0xf2ae14, "HI-VIS"], ["stage-glasses", 0.2, 0x2f4d3a, "GLASSES"]]) {
      const it = group(chest, dx, 0.95, -0.12);
      box(it, 0.14, 0.08, 0.1, 0, 0, 0, color, { rough: 0.8 });
      decal(it, 0.12, 0.04, 0, 0.041, 0, signFace(label, { bg: "#0d1c14", accent: "#dff3d8", scale: 0.42 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const crewUpland = standingFigure(g, -2.9, 0.5, { ry: 0.9, cloth: 0x2f4d3a, vest: 0xe8b02e });
    void crewUpland;

    // ---------------------------------------------------------------- zone flags
    for (const [id, x, z, label] of [["zone-flag-1", -2.0, 1.3, "GRID N"], ["zone-flag-2", 0.0, 0.75, "GRID C"], ["zone-flag-3", 2.0, 0.2, "GRID S"]]) {
      const st = group(g, x, 0.05, z);
      cyl(st, 0.012, 0.014, 0.5, 0, 0.25, 0, 0xc9b58c, { rough: 0.9, seg: 8 });
      box(st, 0.09, 0.06, 0.01, 0, 0.46, 0, BRSH_FLAG, { rough: 0.75 });
      decal(st, 0.08, 0.04, 0, 0.46, 0.006, signFace(label, { bg: "#1b1e12", accent: "#dff3d8", scale: 0.48 }));
      reg(hits, st, id);
    }

    // -------------------------------------------------------------- sharps
    const sharpsGrp = group(g, -1.9, 0.08, 0.9);
    cyl(sharpsGrp, 0.09, 0.09, 0.2, 0, 0.1, 0, 0xe8622a, { rough: 0.7, seg: 12 });
    box(sharpsGrp, 0.14, 0.04, 0.14, 0, 0.22, 0, 0x2b2b2b, { rough: 0.7 });
    holoTag(sharpsGrp, "sharps container", 0, 0.4, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, sharpsGrp, "sharps-container");
    const sharpsFreshGrp = group(g, -1.6, 0.08, 0.9);
    cyl(sharpsFreshGrp, 0.09, 0.09, 0.2, 0, 0.1, 0, 0xe8622a, { rough: 0.7, seg: 12 });
    box(sharpsFreshGrp, 0.14, 0.04, 0.14, 0, 0.22, 0, 0x2b2b2b, { rough: 0.7 });
    sharpsFreshGrp.visible = false;
    holoTag(sharpsFreshGrp, "fresh container", 0, 0.4, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, sharpsFreshGrp, "sharps-container-swap");

    const needle1 = box(g, 0.02, 0.005, 0.14, -1.2, 0.03, 1.0, 0xd8dde0, { rough: 0.4, metal: 0.6 });
    reg(hits, needle1, "sharp-needle-1");
    const needle2 = box(g, 0.02, 0.005, 0.12, -0.6, 0.03, 0.5, 0xd8dde0, { rough: 0.4, metal: 0.6 });
    reg(hits, needle2, "sharp-needle-2");
    const glassShard = box(g, 0.06, 0.02, 0.05, -0.9, 0.03, 0.3, 0x4a7a5c, { rough: 0.3, opacity: 0.6, transparent: true });
    reg(hits, glassShard, "sharp-glass");
    const bareHandHit = box(g, 0.3, 0.3, 0.3, -0.9, 0.3, 0.65, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "grab it bare-handed?", -0.9, 0.55, 0.65, { css: "#e8622a", w: 0.42 });
    reg(hits, bareHandHit, "bare-hand-sharps");

    // ----------------------------------------------------------- air monitor
    const meter = fourGasMeter(g, -1.4, 0.4, 0.45);
    holoTag(g, "four-gas meter", -1.4, 0.55, 0.45, { css: "#5f9e5a", w: 0.32 });
    reg(hits, meter, "air-monitor");

    // ----------------------------------------------------------------- debris
    const debrisBundle = group(g, 1.0, 0.05, 0.5);
    box(debrisBundle, 0.4, 0.1, 0.4, 0, 0.05, 0, 0x6a5636, { rough: 0.85, opacity: 0.85, transparent: true });
    holoTag(debrisBundle, "debris bag", 0, 0.28, 0, { css: "#5f9e5a", w: 0.32 });
    reg(hits, debrisBundle, "debris-bag");
    const stagingPile = group(g, 2.4, 0.08, 1.2);
    hits["staging-pile"] = stagingPile;
    box(g, 0.7, 0.3, 0.5, 2.4, 0.15, 1.2, 0x555a4a, { rough: 0.9, opacity: 0.7, transparent: true, cast: false });

    // ----------------------------------------------------------------- net haul
    const netHome = new THREE.Vector3(2.0, 0.05, 0.4);
    const netGrp = group(g, -2.3, 0.05, 0.2);
    torus(netGrp, 0.3, 0.03, 0, 0.06, 0, 0x2b3138, { rough: 0.9, seg: 16 });
    torus(netGrp, 0.22, 0.025, 0.15, 0.06, 0.1, 0x2b3138, { rough: 0.9, seg: 14 });
    holoTag(netGrp, "derelict net — haul it in", 0, 0.34, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, netGrp, "derelict-net");
    const liftNetHit = box(g, 0.3, 0.3, 0.3, -2.3, 0.4, 0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "muscle the net alone?", -2.3, 0.65, 0.2, { css: "#e8622a", w: 0.4 });
    reg(hits, liftNetHit, "manual-lift-net");

    // ------------------------------------------------------------ suspect drum
    const drumGrp = group(g, 0.6, 0.08, -0.6);
    cyl(drumGrp, 0.22, 0.22, 0.5, 0, 0.25, 0, 0x8a6a2a, { rough: 0.75, metal: 0.2, seg: 16 });
    holoTag(drumGrp, "unidentified drum — do not open", 0, 0.6, 0, { css: "#e8622a", w: 0.5 });
    reg(hits, drumGrp, "suspect-drum");
    const drumOpenHit = box(g, 0.3, 0.3, 0.3, 0.6, 0.45, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "open the drum?", 0.6, 0.7, -0.6, { css: "#e8622a", w: 0.32 });
    reg(hits, drumOpenHit, "drum-open-unauthorized");

    const windsock = group(g, 1.1, 0.08, -0.9);
    cyl(windsock, 0.02, 0.02, 0.7, 0, 0.35, 0, 0xc9b58c, { rough: 0.8, seg: 8 });
    const sockCloth = cyl(windsock, 0.05, 0.02, 0.3, 0, 0.7, 0.15, BRSH_FLAG, { rough: 0.8, seg: 10 });
    sockCloth.rotation.x = Math.PI / 2;
    reg(hits, windsock, "windsock");

    const upwindMuster = group(g, -2.0, 0.05, 2.0);
    cyl(upwindMuster, 0.02, 0.024, 0.5, 0, 0.25, 0, 0x8a939b, { rough: 0.5, metal: 0.5, seg: 8 });
    holoTag(upwindMuster, "upwind muster point", 0, 0.5, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, upwindMuster, "upwind-muster");

    // ------------------------------------------------------------ overpack
    const overpackGrp = group(g, 1.4, 0.08, -0.2);
    cyl(overpackGrp, 0.16, 0.16, 0.35, 0, 0.175, 0, 0x3c444c, { rough: 0.6, metal: 0.4, seg: 14 });
    const overpackLid = cyl(overpackGrp, 0.17, 0.17, 0.03, 0, 0.365, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 14 });
    holoTag(overpackGrp, "overpack — hold and seal", 0, 0.55, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, overpackLid, "overpack-seal");

    // ------------------------------------------------------------ decon station
    const deconGrp = group(g, -1.2, 0.311, 1.75);
    box(deconGrp, 0.3, 0.15, 0.3, 0, 0.075, 0, 0x8a939b, { rough: 0.5, metal: 0.5 });
    const deconValveGrp = group(deconGrp, 0, 0.2, 0);
    const deconValve = valveWheel(deconValveGrp, 0, 0.08, 0, { r: 0.06, color: 0x5f9e5a, body: 0x2b5a6a });
    holoTag(deconGrp, "decon spigot", 0, 0.4, 0, { css: "#5f9e5a", w: 0.34 });
    reg(hits, deconValve.userData.wheel, "decon-spigot");

    // ------------------------------------------------------------- spotter + radio
    const spotter = standingFigure(g, 2.9, -0.1, { ry: -1.6, cloth: 0x2b3138, vest: 0xe8622a });
    const radioProp = group(spotter, 0.14, 0.9, 0.05);
    box(radioProp, 0.05, 0.11, 0.03, 0, 0, 0, 0x1b1e23, { rough: 0.7 });
    holoTag(spotter, "spotter — radio check-in", 0, 1.85, 0, { css: "#5f9e5a", w: 0.4 });
    reg(hits, radioProp, "truck-spotter-radio");
    const backHazHit = box(g, 0.3, 0.3, 0.3, 2.7, 0.4, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "back the truck unspotted?", 2.7, 0.65, 1.6, { css: "#e8622a", w: 0.42 });
    reg(hits, backHazHit, "truck-unspotted-back");

    // -------------------------------------------------------------- walk-round
    const looseFlagged = box(g, 0.02, 0.005, 0.12, 1.7, 0.03, 0.6, 0xd8dde0, { rough: 0.4, metal: 0.6 });
    reg(hits, looseFlagged, "loose-sharp-flag");
    const blownBag = box(g, 0.3, 0.08, 0.3, -0.3, 0.04, 1.5, 0x6a5636, { rough: 0.9, opacity: 0.8, transparent: true });
    reg(hits, blownBag, "blown-bag");

    // --------------------------------------------------------------- closing log
    const logTable = group(g, -2.5, 0.311, 1.9, -0.3);
    box(logTable, 0.5, 0.02, 0.35, 0, 0.01, 0, 0x565656, { rough: 0.7, cast: false });
    const logDecal = decal(logTable, 0.3, 0.4, 0, 0.021, 0, paperFace("CLEANUP LOG", ["Grid covered, sharps counted", "Air readings, drum location", "Overpack + decon confirmed", "Sharps container status"], { scale: 0.85 }));
    logDecal.rotation.x = -Math.PI / 2;
    holoTag(logTable, "log the cleanup", 0, 0.3, 0, { css: "#5f9e5a", w: 0.36 });
    reg(hits, logDecal, "closing-log");

    cone(g, -3.1, 2.3, { color: BRSH_ACCENT });
    cone(g, 3.1, 2.3, { color: BRSH_ACCENT });
    barrierPanel(g, 0, 2.4, { color: 0xe8b02e });

    let netMoved = false, deconAmount = 0, overpackHolding = false, windShifted = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.2, 0.9, 0.5),
      onStep() {},

      onStepComplete(step) {
        if (step.id === "sharps-collect") { needle1.visible = false; needle2.visible = false; glassShard.visible = false; }
        if (step.id === "debris-haul") { debrisBundle.visible = false; }
        if (step.id === "net-haul") { netGrp.position.copy(netHome); netMoved = true; }
        if (step.id === "walk-hazards") { looseFlagged.visible = false; blownBag.visible = false; }
      },

      // Both interruptions really change the scene: the used sharps container
      // is swapped for a fresh one, and the windsock visibly flips to blow
      // toward the crew while the strobe on the drum lights.
      onInterrupt(it) {
        if (it.id === "sharps-container-full") {
          sharpsGrp.material = mat(0xd2312b, { rough: 0.7 });
        }
        if (it.id === "wind-shifts-toward-drum") {
          windShifted = true;
          sockCloth.rotation.y = Math.PI;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "sharps-container-full") {
          sharpsGrp.visible = false;
          sharpsFreshGrp.visible = true;
        }
        if (it.id === "wind-shifts-toward-drum") {
          windShifted = false;
          sockCloth.rotation.y = 0;
        }
      },

      onHazard() {},

      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(0, 0.02, -1.6), 1.3, 0.35, -0.1);
        fogPuff.visible = true;
        fogPuff.userData.step(dt, new THREE.Vector3(windShifted ? -0.6 : 0.6, 0.6, -0.7), 0.3, 0.2, 0);
        water.position.y = 0.012 + Math.sin(t * 1.2) * 0.006;

        const step = session?.step;
        if (netMoved) netGrp.position.y = 0.05 + Math.sin(t * 1.5) * 0.002;

        if (step?.id === "overpack-seal") overpackHolding = !!session.holding;
        overpackLid.position.y = overpackHolding ? 0.365 - Math.min(0.03, t % 1 * 0.03) : 0.365;

        if (step?.id === "decon-wash" && session.turn) deconAmount = session.turn.amount;
        deconValveGrp.rotation.y = -deconAmount * Math.PI * 2;

        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "air-monitor-check") {
          meter.userData.show(`O2  20.9\nLEL ${(gg.t * 25).toFixed(1)}\nCO     0\nH2S  0.0`);
        }
      },
    };
  },
};
