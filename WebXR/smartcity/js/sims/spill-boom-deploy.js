import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, paperFace, mat, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, valveWheel, reg, surfaceTexture, texturedMat, waterFace, mudflatFace, pavingFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Spill Boom Deploy VR — Maritime & Ports, station ninety.
//
// A marine oil-spill response drill at a fuel dock, run generically on a bay
// shoreline rather than any one terminal's history: the source secured, the
// federal and state notifications made, containment boom rigged and worked
// off a response boat into a J against the current with a skiff, the ends
// anchored, a skimmer staged at the collection point, and the shore crew
// working the water's edge behind sorbent, PPE and a decon corridor. The
// learner is the response boat's deck lead; the U.S. Coast Guard is the
// federal on-scene coordinator for a coastal spill this size, and the
// National Contingency Plan (40 CFR 300) is the reason every step here
// happens in this order rather than whichever order looks fastest.

const SBD_ACCENT = 0xe8722a;

export const SIM_SPILL_BOOM_DEPLOY = {
  id: "spill-boom-deploy",
  index: "90",
  domain: "Maritime & Ports",
  trade: "Marine environmental responder — boom deployment",
  category: "Maritime & Ports",
  weather: "wind",
  certification: "Inlandboatmen's Union of the Pacific (IBU) and ILWU marine division — boat and boom crew; LIUNA hazmat laborers — shore crew; OSHA 29 CFR 1910.120 HAZWOPER; U.S. Coast Guard federal on-scene coordinator; National Contingency Plan, 40 CFR 300; California Office of Spill Prevention and Response (OSPR)",
  name: "Spill Boom Deploy",
  title: simTitle("Spill Boom Deploy"),
  tagline: "Fuel-dock spill drill: source secured, NRC and OSPR notified, the plan read, boom rigged on deck and worked into a J against the current with the skiff, ends anchored, skimmer staged, sorbent and PPE out for the shore crew, and a decon corridor for anyone leaving the water's edge",
  accent: SBD_ACCENT,
  accentCss: "#e8722a",
  parSeconds: 280,
  footprint: 2.8,
  badge: { id: "boom-holding", name: "Boom Holding", note: "Source secured first, the J held against the current, both ends anchored, and the shore crew worked clean behind PPE and decon — first time" },

  game: system({
    name: "Spill Response Crew",
    currency: "BOOM",
    ranks: ["Deckhand", "Boom Handler", "Response Boat Lead", "Spill Response Technician", "OSPR Certified"],
    badges: [
      { id: "source-first", name: "Source Secured First", note: "The valve was shut before the boom ever went over the side", test: AWARD.stepClean("secure-source") },
      { id: "never-uncovered", name: "Never Uncovered", note: "Never a bare hand on the tow line or the sorbent, never a step on the shore without PPE", test: AWARD.safe },
      { id: "apex-true", name: "Apex True", note: "Tow tension and skim rate both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-deployment", name: "Clean Deployment", note: "No corrections anywhere in the drill", test: AWARD.clean },
      { id: "j-held", name: "J Held", note: "Held the tow tension in band the whole way", test: AWARD.unbroken },
      { id: "boom-set-fast", name: "Boom Set Fast", note: "Deployment complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "boat-no-pfd": "You reached over the response boat's gunwale to handle the boom line without a PFD on. A boat working a boom deployment rolls with every wake and every length of line going over the side, and an IBU deckhand wears a PFD underway for exactly the moment a rolling deck and a hand full of line coincide.",
    "line-under-tension": "You put a hand on the tow line while the current had it under load. A loaded tow line that surges — the current shifting, the skiff throttling up — closes on a hand with the same force it is holding a hundred feet of boom against, faster than anyone can let go.",
    "sorbent-bare-hands": "You picked up oil-soaked sorbent pads with bare hands. Recovered petroleum product is exactly the hazard OSHA HAZWOPER 1910.120 built its PPE tiers around — sorbent that has done its job is now carrying what it soaked up, straight onto skin.",
    "ignition-near-fuel": "You keyed a handheld radio next to the open fuel spill before the source was secured. Vapour off a fresh spill needs no more than a spark to ignite, and a transmitting radio is exactly the ignition source that stays clear of an active spill's edge until the source itself is confirmed shut.",
  },

  lateNotes: {
    "skimmer-gauge": "Nothing to read until the skimmer is actually staged at the collection point.",
    "decon-sprayer": "The decon corridor runs for whoever is leaving the water's edge — there's no one to wash down yet.",
  },

  steps: [
    {
      id: "secure-source", kind: "turn", target: "source-valve",
      title: "Secure the spill's source",
      cue: "Turn the dock fuel valve fully closed to stop the discharge before anything else.",
      why: "Every gallon still coming from the source is a gallon the boom downstream has to contain, and the U.S. Coast Guard's on-scene coordination for a coastal spill assumes the release itself is stopped first — deploying boom around a source that is still running is chasing a spill instead of stopping one.",
      turn: { turns: 1, axis: "y", label: "SOURCE VALVE" },
    },
    {
      id: "notify", kind: "sequence", anyOrder: true,
      targets: ["notify-nrc", "notify-state"],
      itemNames: { "notify-nrc": "National Response Center", "notify-state": "California OSPR" },
      title: "Make the required notifications",
      cue: "Call the National Response Center, then California's Office of Spill Prevention and Response.",
      why: "The National Contingency Plan under 40 CFR 300 requires the release reported to the National Response Center, and California law separately requires OSPR — the state agency that oversees marine spill response — notified in its own right; the Coast Guard's on-scene coordinator cannot start coordinating a response nobody told them about.",
    },
    {
      id: "plan", kind: "select", target: "response-plan-board",
      title: "Read the response plan",
      cue: "Check the facility's response plan for the boom pattern, the skimmer position and the crew assignments this spill calls for.",
      why: "The plan already accounts for this dock's own currents, tide state and the equipment actually staged here — running a boom deployment from memory instead of the plan is how a crew ends up improvising the one thing OSHA HAZWOPER's training tiers assume was decided in advance.",
    },
    {
      id: "boat-ppe", kind: "select", target: "boat-pfd",
      title: "Put on a PFD before boarding the response boat",
      cue: "Life vest on before stepping onto the response boat's deck.",
      why: "An Inlandboatmen's Union of the Pacific deckhand works this boat the same as any other vessel underway — a boom deployment happens over open water, and the PFD is what the union's own safety practice and Coast Guard regulation both assume before anyone's boots leave the dock.",
    },
    {
      id: "rig-boom", kind: "sequence",
      targets: ["boom-uncoil", "boom-connect", "tow-line-attach"],
      itemNames: { "boom-uncoil": "boom uncoiled on deck", "boom-connect": "boom sections connected", "tow-line-attach": "tow line attached" },
      title: "Rig the containment boom on deck",
      cue: "Uncoil the boom, connect its sections end to end, then attach the tow line — in that order.",
      why: "A boom that goes over the side still tangled fouls in the water where nobody can reach it; rigged flat on deck first, connected section to section, and only then handed a tow line, it pays out the way it is designed to instead of the way it happens to land.",
      outOfOrderNote: "Uncoiled, then connected, then the tow line — rigging it out of order is how a boom goes over the side already fouled.",
    },
    {
      id: "deploy-j", kind: "drag", target: "boom-bundle",
      title: "Deploy the boom in a J-configuration with the skiff",
      cue: "Pay the boom out over the stern and guide the skiff to lay it into a J against the current.",
      why: "A boom laid straight across a current just gets pushed under or over itself; angled into a J with the apex pointing downstream, the current sweeps the oil along the boom's face toward the apex, which is what makes staging the skimmer downstream of it worth doing in the first place.",
      drag: { to: "j-apex-mark", radius: 0.5, missNote: "Not on the mark — the apex has to sit downstream of the current for the J to actually herd anything toward it." },
    },
    {
      id: "hold-shape", kind: "track", target: "skiff-throttle", seconds: 6,
      title: "Hold the skiff's tow steady against the current",
      cue: "Keep the skiff's tow tension steady — too little and the J collapses, too much and the boom rides under.",
      why: "The current that makes a J-boom work is the same current that collapses it the moment the skiff eases off or overpowers the tow — holding a steady tension is what keeps the apex where the crew set it instead of where the tide decides to put it.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.55, fall: 0.45, drift: 0.14, label: "TOW TENSION", readout: (v) => (v < 0.4 ? "too slack — J collapsing" : v > 0.6 ? "too tight — boom riding under" : "holding the J") },
      holdBreakNote: "The tow tension broke out of band and the J started to fold — ease back to a steady pull.",
    },
    {
      id: "anchor-shore", kind: "sequence", anyOrder: true,
      targets: ["anchor-end-set", "shore-end-set"],
      itemNames: { "anchor-end-set": "anchor end set", "shore-end-set": "shore end secured" },
      title: "Set the anchor end and secure the shore end",
      cue: "Drop the anchor at the free end of the boom and make the shore end fast at the dock.",
      why: "A J-boom with nothing holding either end is a boom the current will straighten out and carry away within the hour; the anchor holds the offshore end against the bottom and the shore end is made fast to something that is not going anywhere, so the shape stays put once the skiff lets go of it.",
    },
    {
      id: "skimmer-stage", kind: "select", target: "skimmer-unit",
      title: "Stage the skimmer at the collection point",
      cue: "Position the skimmer where the boom's apex is herding the oil.",
      why: "The apex of the J is where the boom is actually doing its job — concentrating the oil the current pushed along its face — and the skimmer is only useful sitting exactly there, not somewhere convenient to reach from the boat.",
    },
    {
      id: "shore-crew", kind: "sequence", anyOrder: true,
      targets: ["sorbent-staged", "shore-ppe-suit", "shore-ppe-gloves"],
      itemNames: { "sorbent-staged": "sorbent pads staged", "shore-ppe-suit": "shore crew coveralls", "shore-ppe-gloves": "shore crew gloves" },
      title: "Stage sorbent and PPE for the shore crew",
      cue: "Sorbent pads, coveralls and gloves out before anyone works the water's edge.",
      why: "LIUNA hazmat laborers work the shore end of a spill under the same OSHA HAZWOPER 1910.120 training tiers as the crew on the water, and the sorbent and the PPE staged here are what let them recover oil off the rocks and the sand without carrying it home on their skin.",
    },
    {
      id: "skim-rate", kind: "gauge", target: "skimmer-gauge",
      title: "Read the skimmer's recovery rate",
      cue: "Watch the oil-to-water ratio coming off the skimmer and commit the reading in the working band.",
      why: "A skimmer pulling mostly water fills a recovery tank with something that has to be treated as oily waste anyway while barely touching the slick; the ratio is what tells the crew whether the skimmer is actually sitting where the boom is concentrating the oil.",
      gauge: { label: "OIL:WATER", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${Math.round(t * 100)}% oil`, missNote: "Mostly water — reposition the skimmer closer to the apex before the next reading." },
    },
    {
      id: "decon", kind: "hold", target: "decon-sprayer", seconds: 5,
      title: "Run the decon corridor",
      cue: "Hold the wash-down on anyone leaving the water's edge until they are clear of product.",
      why: "The decontamination corridor keeps recovered oil from leaving the exclusion zone on someone's boots — HAZWOPER 1910.120 treats decon as its own required station, not an afterthought at the end of the shift, because the alternative is oil tracked across a dock that was never part of the spill.",
      holdBreakNote: "Released the wash-down before the runoff ran clear — hold it the full duration or the crew member walks out still carrying product.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["torn-boom-section"],
      itemNames: { "torn-boom-section": "torn boom section" },
      itemNotes: { "torn-boom-section": "A section of boom nearest the anchor end has torn along its seam — oil is already working through the gap the current opened." },
      title: "Walk the boom line before standing the response down",
      cue: "Check every section of boom, both ends and the skimmer before logging the deployment complete.",
      why: "A torn section does not fail the response today — it fails the moment nobody is looking at it, which on a falling tide is exactly when the gap it opens starts moving oil past the one control keeping it out of the rest of the bay.",
    },
  ],

  interrupts: [
    {
      id: "apex-drift",
      kind: "Current turning with the tide",
      after: "hold-shape", delay: 3, seconds: 12,
      alert: "The tide has turned and the current is now pushing from a different quarter — the boom's apex has swung off the mark and started to drift.",
      cue: "Reposition the apex before the J collapses on itself.",
      target: "j-apex-mark",
      why: "A J-boom is built around one current direction, and a tide change is exactly the moment that direction stops holding — the apex the crew set at slack water is not the apex a turning current wants, and left alone it drifts until the boom is herding oil nowhere in particular.",
      missNote: "The apex kept drifting with the turned current until the J had folded back on itself, and the boom stopped concentrating anything — it was just floating rope by the time anyone looked again.",
      wrongNote: "It's the apex mark. A tide change moves the one point the whole J-configuration is built around — reposition it before anything else.",
    },
    {
      id: "shore-crew-no-ppe",
      kind: "Crew member stepping onto slick shore without PPE",
      after: "decon", delay: 2, seconds: 12,
      alert: "A crew member has stepped onto the oiled shoreline to help with the boom's shore end — bare-handed, no coveralls.",
      cue: "Get PPE on them before they touch anything else.",
      target: "shore-ppe-gloves",
      why: "LIUNA hazmat laborers work this shoreline inside the same HAZWOPER 1910.120 tiers as everyone else on scene, and oiled rock and sand do not wait for someone to remember their gloves — the moment a bare hand goes down on a slick shore is the moment the response's own PPE rule has already been broken.",
      missNote: "The crew member kept working the shore end bare-handed, staying in contact with recovered product long after the moment PPE would have stopped it reaching their skin.",
      wrongNote: "It's the shore crew's own gloves. Somebody on the oiled shore right now has none on — that is what needs fixing first.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, SBD_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 6.4, 0.03, 4.6, 0.6, 0.015, 0.4, 0xffffff, { rough: 0.2, metal: 0.3, opacity: 0.9, transparent: true, cast: false });
    water.material = texturedMat(
      surfaceTexture((cx, w, h) => waterFace(cx, w, h), { repeat: 5, px: 512 }),
      { rough: 0.18, metal: 0.3, color: 0xbfe0ea },
    );
    // A sheen patch drifting off the boom line, so the water reads as an
    // active spill rather than clean bay.
    const sheen = torus(g, 0.5, 0.22, 1.4, 0.03, 0.3, 0x3a3020, { rough: 0.15, opacity: 0.4, transparent: true, cast: false, seg: 8, seg2: 24 });
    sheen.rotation.x = Math.PI / 2;

    // ------------------------------------------------------------- fuel dock
    const dock = box(g, 1.9, 0.14, 4.2, -2.1, 0.07, 0.2, 0xffffff, { rough: 0.9 });
    dock.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#232a30", base2: "#1b2126", seam: "rgba(0,0,0,0.4)" }), { repeat: 5, px: 512 }),
      { rough: 0.88, metal: 0.03, color: 0xb0b8bd },
    );
    // Oiled shoreline strip beside the dock — the "slick shore" of the interrupt.
    const shore = box(g, 1.1, 0.1, 1.6, -2.0, 0.05, -2.1, 0xffffff, { rough: 0.95, cast: false });
    shore.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#332a20", base2: "#241d15", cracks: 8, pools: 3 }), { repeat: 3, px: 256 }),
      { rough: 0.9, metal: 0.02, color: 0x6a5d47 },
    );
    holoTag(g, "oiled shore — PPE before stepping down", -2.0, 0.45, -2.1, { css: "#d2312b", w: 0.66 });

    // Fuel valve and dripping source at the dock edge.
    const sourceRig = group(g, -2.5, 0.14, 1.6);
    cyl(sourceRig, 0.05, 0.05, 0.5, 0, 0.25, 0, 0x7b8a86, { rough: 0.6, metal: 0.5, seg: 12 });
    const sourceValve = valveWheel(sourceRig, 0, 0.55, 0, { r: 0.09, color: 0xd2312b, body: 0x2b2f34 });
    holoTag(sourceRig, "fuel source valve", 0, 0.85, 0, { css: "#e8722a", w: 0.4 });
    reg(hits, sourceValve.userData.wheel, "source-valve");
    const drip = particles(sourceRig, 14, 0x2a2015, { size: 0.03, life: 0.7, additive: false, opacity: 0.6 });
    const ignitionHit = box(sourceRig, 0.2, 0.2, 0.2, 0.3, 0.55, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(sourceRig, "key the radio here?", 0.3, 0.78, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, ignitionHit, "ignition-near-fuel");

    // Notification console, response plan and PPE staging on the dock.
    const chest = toolChest(g, -2.3, -0.6, { ry: 0.6, color: 0x8a3a2a });
    const radioNrc = instrument(chest, -0.08, 0.79, 0, { ry: 0.3, idle: "NRC · CALL", color: 0xe8722a, w: 0.1, d: 0.16 });
    holoTag(radioNrc, "National Response Center", 0, 0.15, 0, { css: "#e8722a", w: 0.5 });
    reg(hits, radioNrc, "notify-nrc");
    const radioState = instrument(chest, 0.14, 0.79, 0.08, { ry: 0.1, idle: "OSPR · CALL", color: 0xe8722a, w: 0.1, d: 0.16 });
    holoTag(radioState, "California OSPR", 0, 0.15, 0, { css: "#e8722a", w: 0.32 });
    reg(hits, radioState, "notify-state");
    const pfd = group(chest, 0, 0.92, -0.16);
    box(pfd, 0.16, 0.06, 0.1, 0, 0, 0, 0xf2681f, { rough: 0.8 });
    holoTag(pfd, "PFD", 0, 0.1, 0, { css: "#e8722a", w: 0.14 });
    reg(hits, pfd, "boat-pfd");

    const board = holoPanel(g, 0.95, 0.62, -2.7, 1.1, -0.6, (cx, w, h) => {
      cx.fillStyle = "#1c0f08"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e8722a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe3cf"; cx.fillText("SPILL RESPONSE PLAN — FUEL DOCK", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#ffeee0";
      ["Source: dock fuel valve — close first", "Notify: NRC, then California OSPR", "Boom: J-configuration, apex downstream",
       "Anchor offshore end; make shore end fast", "Skimmer at the apex, not mid-boom", "Decon corridor for anyone off the shore"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { ry: 0.5, accent: SBD_ACCENT });
    reg(hits, board, "response-plan-board");

    // Sorbent, shore PPE and the decon corridor, all on the dock.
    const sorbentPile = group(g, -2.0, 0.14, 0.9);
    for (let i = 0; i < 4; i++) box(sorbentPile, 0.3, 0.03, 0.22, (i % 2) * 0.16, 0.02 + Math.floor(i / 2) * 0.04, Math.floor(i / 2) * 0.14, 0xdcd6c6, { rough: 0.85 });
    holoTag(sorbentPile, "sorbent pads", 0.1, 0.24, 0, { css: "#e8722a", w: 0.32 });
    reg(hits, sorbentPile, "sorbent-staged");
    const shoreGear = group(g, -1.5, 0.14, 0.9);
    box(shoreGear, 0.18, 0.05, 0.12, -0.1, 0.03, 0, 0xf2681f, { rough: 0.8 });
    holoTag(shoreGear, "shore coveralls", -0.1, 0.14, 0, { css: "#e8722a", w: 0.3 });
    reg(hits, shoreGear, "shore-ppe-suit");
    const shoreGloves = group(g, -1.3, 0.14, 0.9);
    box(shoreGloves, 0.14, 0.04, 0.1, 0, 0.02, 0, 0xf2c14b, { rough: 0.8 });
    holoTag(shoreGloves, "shore gloves", 0, 0.1, 0, { css: "#e8722a", w: 0.26 });
    reg(hits, shoreGloves, "shore-ppe-gloves");
    const sorbentHazard = box(g, 0.2, 0.06, 0.16, -1.9, 0.2, 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "bare hands on the pads?", -1.9, 0.4, 0.7, { css: "#d2312b", w: 0.5 });
    reg(hits, sorbentHazard, "sorbent-bare-hands");

    const decon = group(g, -1.4, 0.14, -1.0);
    box(decon, 0.9, 0.02, 0.5, 0, 0.01, 0, 0x2f3a44, { rough: 0.85 });
    const sprayerPost = cyl(decon, 0.03, 0.03, 0.5, 0.3, 0.25, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 10 });
    const sprayerHead = ball(decon, 0.05, 0.3, 0.52, 0, 0xdfe6ec, { rough: 0.4, metal: 0.5, seg: 12 });
    holoTag(decon, "decon corridor — wash down", 0, 0.7, 0, { css: "#e8722a", w: 0.5 });
    reg(hits, sprayerPost, "decon-sprayer");
    void sprayerHead;

    // -------------------------------------------------------- response boat
    const boat = group(g, -0.6, 0.02, 1.3);
    box(boat, 1.7, 0.3, 1.1, 0, 0.15, 0, 0x274a5f, { rough: 0.7, metal: 0.2, cast: false });
    const deck = box(boat, 1.5, 0.03, 0.9, 0, 0.31, 0, 0xffffff, { rough: 0.6, metal: 0.3, cast: false });
    deck.material = texturedMat(
      surfaceTexture((cx, w, h) => { cx.fillStyle = "#3a4148"; cx.fillRect(0, 0, w, h); }, { repeat: 1, px: 32 }),
      { rough: 0.55, metal: 0.35, color: 0xc7ccd1 },
    );
    const wheelhouse = box(boat, 0.5, 0.5, 0.4, 0.5, 0.6, 0, 0xdfe6ec, { rough: 0.55 });
    void wheelhouse;
    standingFigure(boat, -0.4, 0, { ry: 1.6, cloth: 0x243a4a, vest: 0xf2681f, atStation: true }).position.y = 0.31;
    holoTag(boat, "response boat", 0, 1.0, 0, { css: "#e8722a", w: 0.36 });

    // Boom bundle rigged on deck, uncoiled/connected/tow-line stages, and the
    // hazard of handling the tow line under load.
    const boomBundle = group(boat, -0.4, 0.31, 0.3);
    torus(boomBundle, 0.16, 0.05, 0, 0.05, 0, 0xf2681f, { rough: 0.7, seg: 8, seg2: 20 }).rotation.x = Math.PI / 2;
    reg(hits, boomBundle, "boom-bundle");
    const uncoilHit = box(boat, 0.3, 0.1, 0.2, -0.55, 0.4, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, uncoilHit, "boom-uncoil");
    const connectHit = box(boat, 0.3, 0.1, 0.2, -0.2, 0.4, 0.15, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, connectHit, "boom-connect");
    const towCleat = group(boat, 0.1, 0.34, -0.35);
    torus(towCleat, 0.05, 0.012, 0, 0, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 6, seg2: 16 });
    reg(hits, towCleat, "tow-line-attach");
    const noPfdHit = box(boat, 0.4, 0.4, 0.2, -0.75, 0.45, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(boat, "over the side — no PFD?", -0.75, 0.7, -0.4, { css: "#d2312b", w: 0.5 });
    reg(hits, noPfdHit, "boat-no-pfd");
    const throttle = instrument(boat, 0.55, 0.4, -0.2, { idle: "0%", color: 0xe8722a, w: 0.12, d: 0.18 });
    holoTag(throttle, "skiff throttle (remote)", 0, 0.2, 0, { css: "#e8722a", w: 0.4 });
    reg(hits, throttle, "skiff-throttle");

    // Boom line: hose with floats, laid out into a J with the apex mark, an
    // anchor at the free end and the shore end made fast at the dock.
    const towLine = hose(g, [[0.1, 0.32, 0.95], [0.6, 0.15, 1.5], [1.2, 0.05, 1.9]], 0.02, 0x1b1e23, { steps: 14, rough: 0.7 });
    const lineHazard = box(g, 0.3, 0.2, 0.3, 0.7, 0.15, 1.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hand on the loaded line?", 0.7, 0.4, 1.55, { css: "#d2312b", w: 0.5 });
    reg(hits, lineHazard, "line-under-tension");
    const boomJ = hose(g, [[-0.1, 0.02, 1.6], [0.6, 0.02, 2.0], [1.5, 0.02, 2.2], [2.1, 0.02, 1.7], [2.0, 0.02, 0.7]], 0.05, 0xf2681f, { steps: 24, rough: 0.7 });
    boomJ.visible = false;
    const floatSpots = [[-0.1, 1.6], [0.6, 2.0], [1.5, 2.2], [2.1, 1.7], [2.0, 0.7]];
    const floats = floatSpots.map(([fx, fz]) => { const f = torus(g, 0.07, 0.025, fx, 0.03, fz, 0xf2681f, { rough: 0.65, seg: 6, seg2: 14 }); f.rotation.x = Math.PI / 2; f.visible = false; return f; });
    const apexMark = torus(g, 0.14, 0.008, 1.5, 0.03, 2.2, 0xe8722a, { emissive: 0xe8722a, ei: 1.5, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    apexMark.rotation.x = -Math.PI / 2;
    reg(hits, apexMark, "j-apex-mark");
    const anchor = group(g, 2.0, 0.02, 0.7);
    cyl(anchor, 0.06, 0.08, 0.1, 0, -0.05, 0, 0x3a3f45, { rough: 0.9, seg: 10 });
    holoTag(anchor, "anchor end", 0, 0.2, 0, { css: "#e8722a", w: 0.3 });
    reg(hits, anchor, "anchor-end-set");
    const shoreCleat = group(g, -1.9, 0.14, 1.9);
    torus(shoreCleat, 0.07, 0.016, 0, 0.06, 0, 0x8a939b, { rough: 0.5, metal: 0.6, seg: 8, seg2: 18 });
    holoTag(shoreCleat, "shore end", 0, 0.22, 0, { css: "#e8722a", w: 0.28 });
    reg(hits, shoreCleat, "shore-end-set");
    const tornHit = box(g, 0.18, 0.08, 0.12, 2.0, 0.06, 0.9, 0x2a1c12, { rough: 0.9, cast: false });
    reg(hits, tornHit, "torn-boom-section");

    // Skiff towing the far end of the boom.
    const skiff = group(g, 2.5, 0.02, 1.4, -1.2);
    box(skiff, 0.7, 0.16, 0.36, 0, 0.08, 0, 0xdfe6ec, { rough: 0.55, cast: false });
    standingFigure(skiff, 0, -0.05, { ry: 1.6, cloth: 0x1f3a52, vest: 0xf2681f, atStation: true }).position.y = 0.16;
    holoTag(skiff, "skiff", 0, 0.4, 0, { css: "#e8722a", w: 0.2 });

    // Skimmer, floating at the apex once staged.
    const skimmerHome = new THREE.Vector3(0.4, 0.05, -1.0);
    const skimmer = group(g, skimmerHome.x, skimmerHome.y, skimmerHome.z);
    box(skimmer, 0.4, 0.1, 0.3, 0, 0.05, 0, 0x8a3a2a, { rough: 0.6, metal: 0.3 });
    const skimGauge = instrument(skimmer, 0, 0.16, 0, { idle: "-- %", color: 0xe8722a, w: 0.12, d: 0.18 });
    holoTag(skimmer, "skimmer", 0, 0.32, 0, { css: "#e8722a", w: 0.24 });
    reg(hits, skimmer, "skimmer-unit");
    reg(hits, skimGauge, "skimmer-gauge");

    const shoreCrewLead = standingFigure(g, -1.5, -0.35, { ry: 2.4, cloth: 0x8a3a2a, vest: 0xf2c14b, helmet: 0xe8b02e });
    holoTag(shoreCrewLead, "shore crew lead", 0, 1.9, 0, { css: "#e8722a", w: 0.34 });
    cone(g, -2.7, -0.4); cone(g, -0.8, -1.9);
    barrierPanel(g, -1.6, -1.6, { color: 0xf2c14b, ry: 0.3 });

    const skimmerTarget = new THREE.Vector3(1.7, 0.05, 1.4);
    const apexHome = apexMark.position.clone();
    const towLineAlertMat = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.4, rough: 0.5 });
    const towLineHomeMat = towLine.material;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 0.8, 0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "boat-ppe") { /* PFD donned — no scene change needed beyond the tag */ }
        if (step.id === "rig-boom") { boomBundle.scale.set(0.6, 0.6, 0.6); }
        if (step.id === "deploy-j") { boomJ.visible = true; for (const f of floats) f.visible = true; }
        if (step.id === "anchor-shore") { anchor.position.y = -0.05; }
        if (step.id === "skimmer-stage") { skimmer.position.copy(skimmerTarget); }
        if (step.id === "walk") { tornHit.visible = false; }
      },
      onHazard() {},
      // Both interruptions change the scene the instant they fire — the apex
      // really drifts off its mark and the shore gloves really flag red —
      // not only once animate() next ticks.
      onInterrupt(it) {
        if (it.id === "apex-drift") {
          apexMark.position.x = apexHome.x + 0.35;
          apexMark.position.z = apexHome.z - 0.25;
          towLine.material = towLineAlertMat;
        }
        if (it.id === "shore-crew-no-ppe") {
          shoreGloves.children[0].material = mat(0xf0645b, { emissive: 0xf0645b, ei: 1.2, rough: 0.6 });
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "apex-drift") {
          apexMark.position.copy(apexHome);
          towLine.material = towLineHomeMat;
        }
        if (it.id === "shore-crew-no-ppe") {
          shoreGloves.children[0].material = mat(0xf2c14b, { rough: 0.8 });
        }
      },
      animate(t, dt, session) {
        water.position.y = 0.015 + Math.sin(t * 1.0) * 0.004;
        sheen.rotation.z = t * 0.05;
        drip.visible = true;
        drip.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.05, 0.15, -0.8);
        const step = session?.step;
        if (step?.id === "hold-shape") {
          const rate = session.track ? session.track.v : 0;
          repaint(throttle.userData.screen, signFace(`${Math.round(rate * 100)}%`, { bg: "#1c0f08", accent: rate >= 0.4 && rate <= 0.6 ? "#59c97b" : "#f0645b", fg: "#ffe3cf", scale: 0.6 }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "skim-rate") repaint(skimGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}%`, { bg: "#1c0f08", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#ffe3cf", scale: 0.62 }));
        if (session?.turn && step?.id === "secure-source") sourceValve.userData.wheel.rotation.z = -session.turn.amount * Math.PI * 2;
      },
    };
  },
};
