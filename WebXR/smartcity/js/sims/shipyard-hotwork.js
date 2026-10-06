import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace, particles, hose, mat,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, cone, barrierPanel,
  standingFigure, cylinderTank, valveWheel, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Shipyard Hot Work VR — Maritime & Ports, station five.
// Cutting a wasted insert out of the aft boundary of No. 3 centre cargo tank,
// on a product tanker alongside in a repair yard.
//
// The thing that makes this its own procedure, and not the hot work permit
// every other trade knows, is that the boiler maker does not decide. A Marine
// Chemist tests the vessel and writes a certificate under NFPA 306, and that
// certificate is a document with a list of spaces on it, a separate finding
// against each one, a time it expires and a set of conditions it is only good
// under. "Safe for Workers" and "Safe for Hot Work" are two different
// findings; one of them lets you stand in the space and the other lets you
// strike an arc, and confusing them is how people are killed on the other
// side of a bulkhead they never looked at.
//
// So the geometry is the lesson. The space you are in is only as safe as the
// void behind the plate you are heating and the double bottom under your
// boots, because steel carries heat and every boundary has penetrations in it
// somebody forgot about.

const SH_ACCENT = 0xf97316;

export const SIM_SHIPYARD_HOTWORK = {
  id: "shipyard-hotwork",
  index: "57",
  domain: "Maritime",
  trade: "Shipyard boilermaker / marine welder",
  category: "Maritime & Ports",
  weather: "overcast",
  certification: "IBB — International Brotherhood of Boilermakers, Iron Ship Builders, Blacksmiths, Forgers and Helpers; OSHA 29 CFR 1915 Subpart B confined and enclosed spaces in shipyard employment (1915.12 testing before entry, 1915.14 hot work, 1915.15 maintenance of safe conditions); 1915 Subpart D welding, cutting and heating; 1915.503 precautions for hot work and 1915.504 fire watches; NFPA 306 control of gas hazards on vessels and the Marine Chemist certificate; USCG requirements for hot work aboard inspected tank vessels",
  name: "Shipyard Hot Work",
  title: simTitle("Shipyard Hot Work"),
  tagline: "Burning an insert out of a tank boundary on a Marine Chemist's certificate: read the findings space by space, get the void behind the plate certified, ventilate continuously, bottles on deck, fire watch both sides and after",
  accent: SH_ACCENT,
  accentCss: "#f97316",
  parSeconds: 310,
  footprint: 2.2,
  badge: { id: "certificate-read", name: "Certificate Read", note: "Hot work done inside the four corners of a Marine Chemist's certificate — the right spaces, the right finding, inside the hours" },

  game: system({
    name: "Gas Free Engineering",
    currency: "AMPS",
    ranks: ["Yard Helper", "Fitter", "Boilermaker", "Lead Boilermaker", "Hot Work Certified"],
    badges: [
      { id: "both-sides", name: "Both Sides Watched", note: "A fire watch posted on the far side of the boundary as well as beside the arc", test: AWARD.stepClean("watches") },
      { id: "nothing-in-the-space", name: "Nothing In The Space", note: "Never brought a cylinder in or left a hose down the hole", test: AWARD.safe },
      { id: "steady-travel", name: "Steady Travel", note: "The cut run at a speed that severed rather than gouged", test: AWARD.precise(0.72) },
    ],
    challenges: [
      { id: "clean-burn", name: "Clean Burn", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "stood-the-watch", name: "Stood The Watch", note: "Stayed the full post-arc fire watch without stepping off it", test: AWARD.unbroken },
      { id: "inside-the-hours", name: "Inside The Hours", note: "Finished and cleared inside 80% of par, well short of the certificate's expiry", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "cylinder-in-tank": "You took the oxygen and fuel gas bottles down the trunk with you. Cylinders stay outside the space — only the torch and the hose go in. A fuel gas leak inside a closed tank builds a mixture nobody can see, and an oxygen leak is worse in a way people underestimate: an oxygen-enriched space makes your own overalls burn like paper, and a spark that would have died on the plate takes the man wearing them.",
    "hose-left-in": "You left the hoses coiled in the tank over the break. A cutting hose that weeps overnight in a closed space has twelve hours to fill the low corners of it, and the man who comes back after lunch strikes his striker in a tank that was gas free when he left it. Hoses come out with you and the bottles get shut at the valve, every break, not just at the end of the shift.",
    "vent-off": "You shut the blower down with work still going on in the space. Read the conditions on the certificate: it is issued for a ventilated space and it is void the moment the ventilation stops. Turning that fan off does not make the certificate a bit less true — it makes it no longer a certificate, and everything done after it is uncertified hot work in a cargo tank.",
    "cut-uncertified": "You put heat into the longitudinal bulkhead to tack a staging clip on. No. 3 wing tank is on the other side of that plate and it is not on this certificate at any finding — it was never tested, because nobody told the chemist that anybody would be heating this boundary. A boundary is only as safe as the space behind it, and the certificate is the only thing that says what is behind it.",
    "expired-cert": "The certificate ran out at 1800 and you carried on cutting. A Marine Chemist's certificate is issued for a stated period because a tank does not stay gas free on its own — residues keep giving off vapour, the ventilation pattern shifts as the work moves, and cargo lines weep. Past the expiry the paper says nothing about the space you are standing in; the chemist comes back and re-tests before another arc is struck.",
  },

  lateNotes: {
    "cutting-torch": "The torch is coupled up and the arc struck after the certificate is read, the space is ventilated and both fire watches are posted — not before.",
    "gas-hose": "The hose goes down the trunk after the bottles are racked and secured on deck and the lines have been leak-tested.",
  },

  steps: [
    {
      id: "cert-read", kind: "find", noHint: true,
      targets: ["chemist-cert", "cert-spaces", "cert-finding", "cert-expiry"],
      itemNames: { "chemist-cert": "the certificate itself", "cert-spaces": "the list of spaces", "cert-finding": "the finding against each space", "cert-expiry": "the expiry and conditions" },
      itemNotes: {
        "chemist-cert": "Signed by a Marine Chemist certified by the NFPA board, for this vessel, at this berth, on this date. You do not test this space and decide for yourself — OSHA 1915.14 makes this piece of paper the thing that permits hot work here, and your job on it is to read it rather than argue with it.",
        "cert-spaces": "Three spaces are named individually: No. 3 centre cargo tank, No. 3 double bottom beneath it, and the aft void at frame 74. No. 3 wing tank, on the other side of the longitudinal bulkhead, is not on it at all — a space that is not on the list has not been tested, whatever the space next to it says.",
        "cert-finding": "No. 3 centre and the double bottom read SAFE FOR WORKERS, SAFE FOR HOT WORK. The aft void reads SAFE FOR WORKERS only. Those are two different findings and only one of them lets you strike an arc.",
        "cert-expiry": "Issued 0700, expires 1800 this date, and only while the mechanical ventilation stated on it is running. Both of those are conditions, not notes — if either fails the certificate has failed with it.",
      },
      title: "Read the Marine Chemist's certificate, line by line",
      cue: "Before a tool goes down the trunk, find the four things on that board that decide whether this job happens at all.",
      why: "A certificate is not a pass, it is a set of findings with a shelf life, written under NFPA 306 by somebody who is not in your trade and not on your schedule. People read the first line, see their own tank, see the word SAFE and go to work — and the failure is always in the part they did not read: an adjacent space with a lesser finding, or an hour that has already gone past.",
    },
    {
      id: "recall-chemist", kind: "select", target: "chemist-radio",
      title: "Call the chemist back for the void behind the plate",
      cue: "The insert you are cutting is in the aft boundary, and the void behind it is certified for workers only. Get it tested for hot work before anything is lit.",
      why: "Safe for Workers means you may breathe in there. It says nothing about what is on the plating or in the corners once the other side of it goes to a few hundred degrees. Heating a boundary is hot work in both spaces, so both spaces need the hot work finding, and the only person who can give it is the chemist who wrote the certificate.",
    },
    {
      id: "duct", kind: "drag", target: "vent-duct",
      title: "Run the ventilation duct to the low corner",
      cue: "Carry the duct end down to the bottom of the tank, away from the trunk.",
      why: "Air short-circuits. A duct dropped through the hatch and left hanging blows straight back up the same hole and ventilates nothing, while the heavy vapour sits in the bottom where the residues are and where you are about to kneel. The discharge goes to the far low corner so the whole space turns over.",
      drag: { to: "tank-bottom", radius: 0.5, missNote: "The duct end is still up near the trunk — that is a circuit of clean air back out of the hatch, not a ventilated tank." },
    },
    {
      id: "blower", kind: "turn", target: "blower-damper",
      title: "Open the damper and put the blower on line",
      cue: "Throw the damper open and leave it open — this runs the whole time anyone is in the space.",
      why: "The certificate is conditional on continuous mechanical ventilation. Continuous means through the cut, through the breaks and through the fire watch afterwards; there is no part of this job where it is reasonable for that fan to be off.",
      turn: { turns: 1.5, axis: "y", label: "DAMPER" },
    },
    {
      id: "airflow", kind: "gauge", target: "anemometer",
      title: "Prove the air is actually moving",
      cue: "Read the velocity at the duct discharge and commit it.",
      why: "This is not an atmosphere test — that belongs to the chemist and it is already done. It is a check that the thing the certificate is conditional on is working: a crushed duct or a blocked intake reads as a fan that sounds fine and moves nothing.",
      gauge: { label: "DUCT m/s", speed: 0.72, green: [0.52, 0.76], readout: (t) => `${(t * 14).toFixed(1)} m/s`, missNote: "Not enough air at the discharge — find the flat in the duct or the rag over the intake before anybody goes back down." },
    },
    {
      id: "cylinders", kind: "drag", target: "gas-cart",
      title: "Rack the bottles on deck, outside the space",
      cue: "Cart to the rack by the hatch, upright, chained, valves where somebody topside can reach them.",
      why: "The cylinders never enter the space; only the torch and the hose do. Outside, a leak dilutes into the open and a man on deck can shut it off at the valve. Inside, the same leak is contained by the tank itself, and in a fire the person who has to close that valve is the one who cannot get to it.",
      drag: { to: "deck-rack", radius: 0.5, missNote: "Not in the rack. Loose bottles on a steel deck fall over, and a knocked-off valve turns a cylinder into something that goes through a bulkhead." },
    },
    {
      id: "hose-test", kind: "gauge", target: "hose-gauge",
      title: "Leak-test the lines before they go down the hole",
      cue: "Pressurise both hoses, shut the valves and commit on the pressure drop.",
      why: "A hose tested on deck is a hose you know about. The same hose tested by lowering it into a closed tank and waiting is a hose you find out about later, from the far end of a shift, when the low corner has had an hour to collect what came out of it.",
      gauge: { label: "DROP psi", speed: 0.7, green: [0.03, 0.2], readout: (t) => `${(t * 20).toFixed(1)} psi`, missNote: "That line is losing pressure. It is changed on deck now, not nursed through the shift." },
    },
    {
      id: "rig-torch", kind: "sequence",
      targets: ["flashback-arrestors", "gas-hose", "cutting-torch"],
      itemNames: { "flashback-arrestors": "flashback arrestors at the regulators", "gas-hose": "hose lowered down the trunk", "cutting-torch": "torch coupled at the bottom" },
      title: "Rig the gear from the deck down",
      cue: "Arrestors on at the regulators, then the hose down the trunk, then couple the torch on at the bottom.",
      why: "In that order, because the protection goes on at the end you can still reach. A flashback travels back up the hose towards the bottles, and the arrestor is what stops it at the regulator rather than at the cylinder standing next to your mate on deck.",
    },
    {
      id: "watches", kind: "sequence", anyOrder: true,
      targets: ["watch-inside", "watch-void"],
      itemNames: { "watch-inside": "fire watch in the tank", "watch-void": "fire watch in the void, the other side of the plate" },
      title: "Post a fire watch on both sides of the boundary",
      cue: "One in here with you, one in the void behind the plate you are about to heat.",
      why: "The man behind the hood is looking at an arc through a dark lens and can see neither where his sparks land nor the plate going red on the far side. OSHA 1915.504 wants a watch where slag and sparks can reach — and a heated boundary reaches into the space behind it whether or not anything falls through the penetrations in it.",
    },
    {
      id: "shield", kind: "drag", target: "fire-blanket",
      title: "Cover the staging under the cut",
      cue: "Carry the blanket over the timber staging below the insert.",
      why: "Cutting slag leaves the plate at the temperature of molten steel and falls straight down. Wooden staging under a burn takes it and smoulders inside the grain for an hour, which is a fire that starts after everybody has gone home and in a space with one way out of it.",
      drag: { to: "staging-timber", radius: 0.5, missNote: "The staging is still bare under the cut. Slag will find it." },
    },
    {
      id: "cut", kind: "track", target: "cutting-torch", seconds: 6,
      title: "Burn the insert out",
      cue: "Hold the trigger and keep the travel steady down the cut line.",
      why: "Travel speed is the whole quality of an oxy-fuel cut. Too fast and the kerf does not sever, so the plate hangs on and has to be re-cut with the heat already in it; too slow and the cut widens, the plate takes far more heat than the job needs, and that surplus heat is exactly what goes through to the space on the other side.",
      track: { label: "TRAVEL", green: [0.42, 0.62], rise: 0.56, fall: 0.44, drift: 0.12, readout: (v) => `${Math.round(v * 600)} mm/min` },
    },
    {
      id: "boundaries", kind: "sequence", anyOrder: true,
      targets: ["void-hatch", "double-bottom-manhole"],
      itemNames: { "void-hatch": "the void aft, through its own access", "double-bottom-manhole": "the double bottom, through the manhole in the tank floor" },
      title: "Look into the spaces the heat went into",
      cue: "Arc out, and before the watch clock starts: open up the void aft and the double bottom under the cut and put a light in both.",
      why: "The certificate named those two spaces separately because they are separately capable of catching fire. Heat conducts through the plate you were cutting and falls through anything the tank bottom has a hole in, and neither space announces itself — the only way anyone learns what happened in there is by opening it and looking while there is still somebody on the job to deal with it.",
    },
    {
      id: "watch-after", kind: "hold", target: "fire-watch-timer", seconds: 6,
      title: "Stand the fire watch after the arc stops",
      cue: "Start the watch clock and stay on the post, both sides, for the full period.",
      why: "Nothing in this job catches fire while the torch is lit — the watch exists for the half hour afterwards, when the plate is still hot enough to light the coating on the far side and everybody has decided the job is over. OSHA 1915.504 keeps a fire watch on after the hot work finishes for exactly that reason, and the yard keeps it on both sides of the boundary for the same reason it posted two.",
      holdBreakNote: "You stepped off the watch early. The clock runs from the last arc, and a watch that ends when the welder packs up is not a fire watch, it is a ceremony.",
    },
    {
      id: "break-out", kind: "sequence",
      targets: ["cylinder-valves", "cutting-torch", "gas-hose"],
      itemNames: { "cylinder-valves": "bottle valves shut on deck", "cutting-torch": "lines bled at the torch", "gas-hose": "hose drawn out of the space" },
      title: "Break the gear out at the end of the shift",
      cue: "Shut the valves at the bottles, bleed the lines through the torch, then draw the hose back up out of the tank.",
      why: "That order leaves nothing charged and nothing in the space. Shutting the valve first means what you bleed is only what is in the hose; drawing the hose out last means the tank goes overnight empty of everything that could leak into it. This is the step that gets skipped, and skipping it is how a space that was gas free at knock-off is not gas free in the morning, with nobody in it and nobody watching it.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cable-penetration", "bilge-well"],
      itemNames: { "cable-penetration": "the cable transit through the boundary", "bilge-well": "the stripping well under the cut" },
      itemNotes: {
        "cable-penetration": "There is an unsealed cable transit through the aft bulkhead a metre from the cut. Everything you thought the boundary was holding back — sparks, slag, heat — had an open hole to go through into the void.",
        "bilge-well": "The stripping well directly under the cut still has oily scale in the bottom of it. It was outside the blanket and out of the watch's sight, and it has been collecting slag all afternoon.",
      },
      title: "Walk the space before the watch is stood down",
      cue: "Go round the boundary and the bottom of the tank with a light; click what has to be dealt with before anybody leaves.",
      why: "A boundary is drawn on a plan and never on the steel. Penetrations, transits and the wells under the frames are where the heat and the slag actually went, and they are found by somebody walking the space with a torch at the end of the job, not by the certificate that was written at seven in the morning.",
    },
  ],

  interrupts: [
    {
      id: "vent-trip",
      kind: "Ventilation failure",
      after: "shield", delay: 3, seconds: 12,
      alert: "The blower up on deck has tripped. The duct sock has gone soft on the tank bottom and the note of the fan is gone.",
      cue: "The air has stopped moving and you are one step away from striking an arc.",
      target: "trunk-ladder",
      why: "The certificate is issued on the condition that the mechanical ventilation runs continuously. The moment it stops the paper covering this job stops with it, and the space starts going back to whatever the residues want it to be — so nothing gets lit, the space is cleared up the trunk, and nobody comes back down until the fan is running and the chemist has said so again.",
      missNote: "You finished dressing the staging and lit up in a tank with no air moving through it. Cutting fume and the vapour coming off the residues had nowhere to go but the corner you were kneeling in, the certificate covering the job expired the moment the blower did, and the tank you climbed out of at the end of the shift was not the tank the chemist tested.",
      wrongNote: "It is the trunk ladder. A dead fan is not something to fix from down here — it is something to leave for, and the way out is the way you came in.",
    },
    {
      id: "void-smoke",
      kind: "Fire on the far side",
      after: "watch-after", delay: 3, seconds: 12,
      alert: "The watch in the void is calling through the plate: the coating on the back of the bulkhead is smoking where the cut ran.",
      cue: "Something is alight on the side of the boundary you cannot see.",
      target: "void-extinguisher",
      why: "Coating on the reverse of a heated plate cooks off and then catches, and it does it after the arc has stopped rather than during it. That is the whole reason a watch is posted on the far side with an extinguisher in reach: the fire starts where the welder cannot see it and at the moment everyone has decided the hot work is finished.",
      missNote: "Nobody put it out. Blistered coating in a void smoulders behind steel where no one can see a flame, and by the time smoke reaches the deck it is a fire in a space that is certified for workers, has one access and now has hot plate between it and the man who has to go in.",
      wrongNote: "It is the extinguisher in the void, in the hands of the watch who is already standing there. That is what the second watch was posted for.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, SH_ACCENT);

    // ------------------------------------------------------------ the tank
    // Bottom plating, longitudinals, and the boundaries that matter: the aft
    // bulkhead with the wasted insert in it, and the longitudinal bulkhead
    // down the port side with a wing tank behind it that is not on the
    // certificate at all. The space opens towards the way in, so the learner
    // walks into a tank rather than up to the back of a plate.
    box(g, 5.2, 0.05, 5.4, -0.8, 0.02, -0.2, 0x555f68,
      { rough: 0.95, metal: 0.3, finish: "galvanised", tile: [5, 5], cast: false });
    for (let i = 0; i < 5; i++) {
      box(g, 0.08, 0.2, 5.2, -3.0 + i * 1.1, 0.12, -0.2, 0x4a535c, { rough: 0.9, metal: 0.35, cast: false });
    }

    // The aft bulkhead stops short of the trunk, so the void behind it — and
    // the watch standing in it — are in sight from inside the tank.
    const aft = group(g, -1.1, 0, -2.7);
    box(aft, 3.6, 2.5, 0.06, 0, 1.25, 0, 0x5d6771, { rough: 0.85, metal: 0.35, finish: "painted", tile: [4, 3] });
    for (const sx of [-1.4, -0.7, 0.0, 0.7, 1.4]) {
      box(aft, 0.1, 2.4, 0.16, sx, 1.22, 0.11, 0x525c66, { rough: 0.85, metal: 0.35 });
    }
    holoTag(aft, "Aft bulkhead — void at frame 74 behind", 0, 2.3, 0.14, { css: "#f97316", w: 0.56 });
    // The wasted insert, its cut line, and the coating on the reverse face.
    const insert = box(aft, 0.72, 0.5, 0.05, 0.5, 1.15, 0.07, 0x7a5a3a,
      { rough: 0.95, finish: "rust", tile: [1, 1] });
    decal(aft, 0.76, 0.54, 0.5, 1.15, 0.11, (cx, w, h) => {
      cx.clearRect(0, 0, w, h);
      cx.strokeStyle = "#f97316"; cx.lineWidth = Math.max(3, h * 0.05);
      cx.setLineDash?.([h * 0.1, h * 0.06]);
      cx.strokeRect(h * 0.1, h * 0.1, w - h * 0.2, h - h * 0.2);
    }, { px: 192, transparent: true, glow: true, ei: 0.9 });
    holoTag(aft, "Wasted insert — cut and renew", 0.5, 1.62, 0.12, { css: "#f97316", w: 0.48 });
    const reverseGlow = box(aft, 0.8, 0.58, 0.02, 0.5, 1.15, -0.06, 0x8a3f33,
      { emissive: 0x8a3f33, ei: 0.2, rough: 0.8, cast: false });
    reverseGlow.visible = false;
    // The transit nobody sealed — one of the closing walk-round finds.
    const transit = cyl(aft, 0.075, 0.075, 0.18, 1.3, 1.4, 0.06, 0x2b3138,
      { rough: 0.8, metal: 0.3, seg: 14 });
    transit.rotation.x = Math.PI / 2;
    holoTag(aft, "Cable transit", 1.3, 1.66, 0.1, { css: "#8fb3c4", w: 0.26 });
    reg(hits, transit, "cable-penetration");

    // The longitudinal bulkhead: No. 3 wing tank is on the other side of it,
    // and the certificate never mentions it.
    box(g, 0.06, 2.5, 5.2, -3.2, 1.25, -0.2, 0x5d6771, { rough: 0.85, metal: 0.35, finish: "painted", tile: [5, 3] });
    for (const dz of [-2.0, -0.8, 0.4, 1.6]) {
      box(g, 0.16, 2.4, 0.1, -3.09, 1.22, dz, 0x525c66, { rough: 0.85, metal: 0.35 });
    }
    holoTag(g, "Longitudinal bulkhead — No. 3 wing tank beyond", -3.05, 2.3, -1.4, { css: "#f0645b", w: 0.62 });
    // A transverse web girder across the open side: knee height, so the tank
    // still reads as a tank and nothing blocks the way in.
    const web = group(g, -0.8, 0, 2.4);
    box(web, 4.6, 0.85, 0.08, 0, 0.42, 0, 0x5d6771, { rough: 0.85, metal: 0.35, finish: "painted", tile: [5, 1] });
    box(web, 4.6, 0.1, 0.22, 0, 0.88, 0, 0x525c66, { rough: 0.85, metal: 0.35 });
    for (const sx of [-1.5, 0, 1.5]) {
      cyl(web, 0.24, 0.24, 0.1, sx, 0.42, 0, 0x2b3138, { rough: 0.9, seg: 16 }).rotation.x = Math.PI / 2;
    }
    holoTag(web, "Transverse web — step over", 0, 1.12, 0, { css: "#8fb3c4", w: 0.42 });
    // The deckhead over the tank, with the trunk left open through it.
    box(g, 3.6, 0.08, 5.2, -1.4, 2.55, -0.2, 0x4a535c, { rough: 0.85, metal: 0.35, cast: false });
    for (const dz of [-2.0, -0.6, 0.8, 2.2]) {
      box(g, 3.6, 0.16, 0.1, -1.4, 2.42, dz, 0x424b54, { rough: 0.85, metal: 0.35, cast: false });
    }

    // The manhole down into No. 3 double bottom — the space under your boots,
    // named on the certificate in its own right.
    const dbMan = group(g, -2.3, 0, -0.7);
    torus(dbMan, 0.3, 0.03, 0, 0.1, 0, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 8, seg2: 20 })
      .rotation.x = Math.PI / 2;
    const dbCover = cyl(dbMan, 0.29, 0.29, 0.05, 0, 0.13, 0, 0x6d7379, { rough: 0.7, metal: 0.45, seg: 20 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      cyl(dbMan, 0.016, 0.016, 0.04, Math.sin(a) * 0.25, 0.16, Math.cos(a) * 0.25, 0xd8b23a, { rough: 0.5, metal: 0.7, seg: 6 });
    }
    holoTag(dbMan, "No. 3 double bottom", 0, 0.44, 0, { css: "#8fb3c4", w: 0.38 });
    reg(hits, dbMan, "double-bottom-manhole");

    // The stripping well under the cut — the second walk-round find.
    const well = group(g, -1.0, 0, -1.2);
    torus(well, 0.2, 0.025, 0, 0.06, 0, 0x4a535c, { rough: 0.85, metal: 0.4, seg: 8, seg2: 18 })
      .rotation.x = Math.PI / 2;
    const wellMuck = cyl(well, 0.18, 0.18, 0.03, 0, 0.02, 0, 0x2a2318, { rough: 0.98, seg: 16, cast: false });
    holoTag(well, "Stripping well", 0, 0.28, 0, { css: "#b8794a", w: 0.28 });
    reg(hits, well, "bilge-well");

    // The wooden staging under the insert, and the blanket that belongs on it.
    const staging = group(g, -1.5, 0, -1.9);
    for (const dz of [-0.16, 0.16]) box(staging, 1.1, 0.06, 0.24, 0, 0.5, dz, 0xa8834f, { rough: 0.95, finish: "painted", tile: [2, 1] });
    for (const sx of [-0.45, 0.45]) for (const dz of [-0.16, 0.16]) {
      cyl(staging, 0.03, 0.03, 0.5, sx, 0.25, dz, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    }
    holoTag(staging, "Timber staging", 0, 0.82, 0, { css: "#b8794a", w: 0.3 });
    hits["staging-timber"] = staging;
    const blanket = box(g, 0.42, 0.1, 0.34, 0.9, 0.35, 1.6, 0x4a4f55,
      { rough: 0.95, finish: "rubber", tile: [1, 1] });
    holoTag(g, "Fire blanket", 0.9, 0.62, 1.6, { css: "#59c97b", w: 0.28 });
    reg(hits, blanket, "fire-blanket");

    // ------------------------------------------------- the void, aft of the plate
    const voidSpace = group(g, 0, 0, 0);
    box(voidSpace, 4.4, 0.05, 1.5, -0.8, 0.02, -3.5, 0x4a535c,
      { rough: 0.95, metal: 0.3, cast: false });
    holoTag(voidSpace, "Void, frame 74 — SAFE FOR WORKERS only", -0.8, 0.5, -4.15, { css: "#f2c14b", w: 0.6 });
    const voidHatch = group(voidSpace, -2.5, 0, -3.3);
    torus(voidHatch, 0.3, 0.035, 0, 0.1, 0, 0x8b929a, { rough: 0.6, metal: 0.5, seg: 8, seg2: 20 })
      .rotation.x = Math.PI / 2;
    box(voidHatch, 0.5, 0.04, 0.5, 0, 0.12, 0, 0x6d7379, { rough: 0.7, metal: 0.4 });
    holoTag(voidHatch, "Void access", 0, 0.42, 0, { css: "#8fb3c4", w: 0.26 });
    reg(hits, voidHatch, "void-hatch");
    const voidExt = group(voidSpace, 0.3, 0, -3.3);
    cyl(voidExt, 0.075, 0.075, 0.5, 0, 0.3, 0, 0xd8232a, { rough: 0.45, metal: 0.3, seg: 16, finish: "painted" });
    cyl(voidExt, 0.03, 0.03, 0.08, 0, 0.58, 0, 0x2b3138, { rough: 0.6, metal: 0.4, seg: 10 });
    holoTag(voidExt, "Extinguisher — void watch", 0, 0.82, 0, { css: "#f0645b", w: 0.42 });
    reg(hits, voidExt, "void-extinguisher");
    const voidSmoke = particles(voidSpace, 26, 0x6f6a60, { size: 0.045, life: 1.2, additive: false, opacity: 0.3 });
    voidSmoke.position.set(-0.6, 1.2, -2.9);

    // ------------------------------------------------------- the trunk and ladder
    const trunk = group(g, 1.15, 0, -0.8);
    for (const sx of [-1, 1]) cyl(trunk, 0.025, 0.025, 2.4, sx * 0.22, 1.2, 0, 0x8b929a, { rough: 0.5, metal: 0.65, seg: 10 });
    for (let i = 0; i < 8; i++) {
      const rung = cyl(trunk, 0.018, 0.018, 0.44, 0, 0.25 + i * 0.3, 0, 0x8b929a, { rough: 0.5, metal: 0.65, seg: 8 });
      rung.rotation.z = Math.PI / 2;
    }
    holoTag(trunk, "Trunk — the one way out", 0, 2.62, 0, { css: "#59c97b", w: 0.44 });
    reg(hits, trunk, "trunk-ladder");

    // -------------------------------------------------------- ventilation
    const blower = group(g, 2.8, 0, -1.6, -0.6);
    box(blower, 0.5, 0.42, 0.44, 0, 0.35, 0, 0x2f6f8c, { rough: 0.6, metal: 0.3, finish: "painted", tile: [1, 1] });
    box(blower, 0.56, 0.06, 0.5, 0, 0.1, 0, 0x2b3138, { rough: 0.8 });
    const fan = cyl(blower, 0.16, 0.16, 0.05, 0, 0.35, 0.24, 0x8b929a, { rough: 0.4, metal: 0.7, seg: 18 });
    fan.rotation.x = Math.PI / 2;
    holoTag(blower, "Portable blower", 0, 0.74, 0, { css: "#4fd1ff", w: 0.34 });
    const tripLamp = ball(blower, 0.035, -0.2, 0.62, 0, 0xf0645b, { emissive: 0xf0645b, ei: 2.4, rough: 0.4 });
    tripLamp.visible = false;
    const damper = valveWheel(g, 2.8, 0.8, -1.25, { r: 0.08, color: 0x4fd1ff, body: 0x2f6f8c });
    holoTag(g, "Duct damper", 2.8, 1.22, -1.25, { css: "#4fd1ff", w: 0.28 });
    reg(hits, damper, "blower-damper");
    const stopBtn = box(g, 0.1, 0.1, 0.04, 2.45, 0.5, -1.95, 0xd8232a, { rough: 0.5, finish: "painted", tile: [1, 1] });
    holoTag(g, "Shut the blower down?", 2.45, 0.74, -1.95, { css: "#f0645b", w: 0.44 });
    reg(hits, stopBtn, "vent-off");

    // The duct: a fixed run from the blower to the trunk, then a loose sock
    // the learner carries to the low corner.
    hose(g, [[2.7, 0.6, -1.5], [2.2, 1.9, -1.2], [1.5, 2.2, -0.9], [1.2, 1.4, -0.8]], 0.09, 0xf2c14b,
      { steps: 18, rough: 0.8, metal: 0.1 });
    const ductSock = group(g, 1.2, 0, -0.2);
    cyl(ductSock, 0.1, 0.11, 0.7, 0, 0.35, 0, 0xf2c14b, { rough: 0.8, metal: 0.1, seg: 14, finish: "rubber" });
    for (let i = 0; i < 3; i++) torus(ductSock, 0.105, 0.012, 0, 0.14 + i * 0.2, 0, 0xd8a838, { rough: 0.7, seg: 6, seg2: 16 })
      .rotation.x = Math.PI / 2;
    holoTag(ductSock, "Duct discharge", 0, 0.9, 0, { css: "#f2c14b", w: 0.32 });
    reg(hits, ductSock, "vent-duct");
    const ductHome = ductSock.position.clone();
    const lowCorner = box(g, 0.5, 0.06, 0.5, -1.6, 0.06, -1.6, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Low corner", -1.6, 0.3, -1.6, { css: "#f2c14b", w: 0.24 });
    hits["tank-bottom"] = lowCorner;
    const airStream = particles(g, 24, 0xcfe8f2, { size: 0.025, life: 0.5, additive: false, opacity: 0.26 });
    airStream.position.set(1.2, 0.3, -0.2);
    const anemo = instrument(g, -1.3, 0.95, -0.6, { ry: 0.9, idle: "-- m/s", color: 0x4fd1ff });
    holoTag(anemo, "Anemometer", 0, 0.18, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, anemo, "anemometer");

    // ------------------------------------------------ the deck, outside the space
    const cart = group(g, 2.3, 0, 2.0, 0.4);
    box(cart, 0.46, 0.06, 0.34, 0, 0.12, 0, 0x2b3138, { rough: 0.7, metal: 0.4 });
    for (const sx of [-1, 1]) {
      const wheel = cyl(cart, 0.11, 0.11, 0.04, sx * 0.24, 0.11, -0.12, 0x14171a, { rough: 0.9, seg: 14 });
      wheel.rotation.z = Math.PI / 2;
    }
    cylinderTank(cart, -0.12, 0.04, 0x2f6f8c, { gauge: true, plate: false }).scale.setScalar(0.72);
    cylinderTank(cart, 0.12, 0.04, 0xb8402f, { gauge: true, plate: false }).scale.setScalar(0.72);
    holoTag(cart, "Oxygen and fuel gas cart", 0, 1.1, 0, { css: "#f97316", w: 0.5 });
    reg(hits, cart, "gas-cart");

    const rack = group(g, 3.7, 0, 1.2, -0.5);
    box(rack, 0.7, 0.06, 0.4, 0, 0.03, 0, 0x2b3138, { rough: 0.8, metal: 0.3 });
    for (const sx of [-1, 1]) box(rack, 0.06, 1.2, 0.06, sx * 0.32, 0.6, -0.16, 0x8b929a, { rough: 0.5, metal: 0.6 });
    for (const y of [0.45, 0.95]) box(rack, 0.7, 0.03, 0.03, 0, y, -0.16, 0xf2c14b, { rough: 0.6 });
    holoTag(rack, "Cylinder rack — on deck", 0, 1.45, 0, { css: "#59c97b", w: 0.44 });
    hits["deck-rack"] = rack;
    const valves = group(rack, 0, 1.05, 0.12);
    for (const sx of [-0.12, 0.12]) valveWheel(valves, sx, 0, 0, { r: 0.05, color: 0xd8232a, body: 0x59636d });
    holoTag(rack, "Bottle valves", 0, 1.28, 0.12, { css: "#f0645b", w: 0.3 });
    reg(hits, valves, "cylinder-valves");
    const arrestors = group(rack, 0, 0.72, 0.1);
    for (const sx of [-0.12, 0.12]) {
      cyl(arrestors, 0.032, 0.032, 0.11, sx, 0, 0, 0xd8b23a, { rough: 0.4, metal: 0.8, seg: 12 });
    }
    holoTag(rack, "Flashback arrestors", 0, 0.92, 0.1, { css: "#f2c14b", w: 0.4 });
    reg(hits, arrestors, "flashback-arrestors");

    const hoseCoil = group(g, 1.75, 0, 0.55);
    for (let i = 0; i < 3; i++) {
      torus(hoseCoil, 0.2 - i * 0.03, 0.022, 0, 0.05 + i * 0.045, 0, i % 2 ? 0xb8402f : 0x2f6f4a,
        { rough: 0.8, seg: 6, seg2: 20 }).rotation.x = Math.PI / 2;
    }
    holoTag(hoseCoil, "Twin cutting hose", 0, 0.42, 0, { css: "#f97316", w: 0.36 });
    reg(hits, hoseCoil, "gas-hose");

    const torch = group(g, 1.5, 0, 0.0);
    cyl(torch, 0.022, 0.022, 0.42, 0, 0.55, 0, 0xb8860b, { rough: 0.4, metal: 0.8, seg: 12 });
    cyl(torch, 0.012, 0.018, 0.16, 0, 0.27, 0, 0x8b929a, { rough: 0.35, metal: 0.85, seg: 10 });
    box(torch, 0.05, 0.1, 0.05, 0.03, 0.72, 0, 0x2b3138, { rough: 0.6 });
    holoTag(torch, "Cutting torch", 0, 0.98, 0, { css: "#f97316", w: 0.32 });
    reg(hits, torch, "cutting-torch");
    const sparks = particles(g, 30, 0xffb066, { size: 0.03, life: 0.55 });
    sparks.position.set(-0.6, 1.15, -2.5);
    const arcGlow = ball(g, 0.05, -0.6, 1.15, -2.5, 0xffd9a0, { emissive: 0xffd9a0, ei: 2.6, rough: 0.4 });
    arcGlow.visible = false;

    const hoseGauge = instrument(g, 3.0, 1.0, 2.0, { ry: -0.9, idle: "-- psi", color: 0xf97316 });
    holoTag(hoseGauge, "Hose test set", 0, 0.18, 0, { css: "#f97316", w: 0.32 });
    reg(hits, hoseGauge, "hose-gauge");

    const radio = group(g, 2.1, 0, 0.9);
    cyl(radio, 0.035, 0.035, 1.0, 0, 0.5, 0, 0x59636d, { rough: 0.6, metal: 0.5, seg: 10 });
    box(radio, 0.09, 0.2, 0.06, 0, 1.08, 0, 0x2b3138, { rough: 0.6, finish: "painted", tile: [1, 1] });
    cyl(radio, 0.006, 0.006, 0.18, 0.025, 1.26, 0, 0x14171a, { rough: 0.6, seg: 6 });
    holoTag(radio, "Call the Marine Chemist", 0, 1.45, 0, { css: "#4fd1ff", w: 0.46 });
    reg(hits, radio, "chemist-radio");

    const timer = group(g, 1.3, 0, 0.95);
    cyl(timer, 0.03, 0.03, 0.95, 0, 0.48, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 10 });
    const timerFace = decal(timer, 0.2, 0.14, 0, 1.05, 0.02,
      signFace("WATCH\n--:--", { bg: "#1a1209", accent: "#f97316", fg: "#ffe3ac", scale: 0.34 }), { px: 256, glow: true, ei: 0.8 });
    holoTag(timer, "Fire watch clock", 0, 1.26, 0, { css: "#f97316", w: 0.36 });
    reg(hits, timer, "fire-watch-timer");

    // ------------------------------------------------------ the certificate
    const board = group(g, 3.3, 0, -0.4, -1.1);
    const cert = holoPanel(board, 0.72, 0.5, 0, 1.78, 0, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f97316"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#8fb3c4";
      cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("MARINE CHEMIST CERTIFICATE · NFPA 306", w * 0.05, h * 0.12);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText("M/T CORDELIA BAY — REPAIR BERTH 4", w * 0.05, h * 0.28);
      cx.fillStyle = "#bcd6e2";
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      ["No. 3 CENTRE CARGO TANK — safe for workers, safe for hot work",
       "No. 3 DOUBLE BOTTOM — safe for workers, safe for hot work",
       "VOID FRAME 74 (aft of No. 3) — safe for workers",
       "Conditions: mechanical ventilation continuous throughout",
       "Issued 0700 · Expires 1800 this date",
       "Hot work on a boundary requires both spaces certified"]
        .forEach((line, i) => cx.fillText(line, w * 0.05, h * 0.44 + i * h * 0.085));
    }, { ry: 0, accent: SH_ACCENT });
    reg(hits, cert, "chemist-cert");
    const STRIPS = [
      ["cert-spaces", -0.26, "SPACES LISTED", "#4fd1ff"],
      ["cert-finding", 0.0, "THE FINDING", "#f97316"],
      ["cert-expiry", 0.26, "EXPIRY · CONDITIONS", "#f2c14b"],
    ];
    for (const [id, dx, label, css] of STRIPS) {
      const strip = decal(board, 0.24, 0.1, dx, 1.38, 0.01,
        signFace(label, { bg: "#0b1720", accent: css, fg: "#eaf6fb", scale: 0.3 }), { px: 256, glow: true, ei: 0.7 });
      reg(hits, strip, id);
    }
    const expiredTrap = box(g, 0.4, 0.4, 0.3, 3.3, 0.7, -0.9, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Past 1800 — keep cutting?", 3.3, 1.02, -0.9, { css: "#f0645b", w: 0.48 });
    reg(hits, expiredTrap, "expired-cert");

    // ------------------------------------------------------------- the crew
    const insideWatch = standingFigure(g, -2.4, 0.6, { ry: 1.5, cloth: 0x2b3138, vest: 0xf97316, helmet: 0xf2f2f2 });
    holoTag(g, "Fire watch — in the tank", -2.4, 2.1, 0.6, { css: "#f97316", w: 0.44 });
    reg(hits, insideWatch, "watch-inside");
    cyl(g, 0.07, 0.07, 0.46, -1.9, 0.28, 1.0, 0xd8232a,
      { rough: 0.45, metal: 0.3, seg: 14, finish: "painted" });
    holoTag(g, "Extinguisher", -1.9, 0.68, 1.0, { css: "#f0645b", w: 0.26 });
    const voidWatch = standingFigure(g, 1.0, -3.5, { ry: 0.2, cloth: 0x2b3138, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(g, "Fire watch — in the void", 1.0, 2.1, -3.5, { css: "#f2c14b", w: 0.44 });
    reg(hits, voidWatch, "watch-void");
    standingFigure(g, 3.9, -2.0, { ry: -2.3, cloth: 0x1f3f52, vest: 0x59c97b, helmet: 0xdfe4e8 });
    holoTag(g, "Marine Chemist", 3.9, 2.1, -2.0, { css: "#59c97b", w: 0.34 });

    // ------------------------------------------------------------- the traps
    const bottlesDown = box(g, 0.6, 1.2, 0.6, 0.5, 0.65, 0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Bring the bottles down?", 0.5, 1.36, 0.2, { css: "#f0645b", w: 0.46 });
    reg(hits, bottlesDown, "cylinder-in-tank");
    const leaveHose = box(g, 0.6, 1.0, 0.6, 0.3, 0.55, 1.9, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Leave the hoses in over the break?", 0.3, 1.16, 1.9, { css: "#f0645b", w: 0.58 });
    reg(hits, leaveHose, "hose-left-in");
    const staggingClip = box(g, 0.4, 0.9, 0.5, -2.95, 1.1, -0.2, 0x000000,
      { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Tack a staging clip here?", -2.95, 1.7, -0.2, { css: "#f0645b", w: 0.5 });
    reg(hits, staggingClip, "cut-uncertified");

    for (let i = 0; i < 2; i++) cone(g, 2.0 + i * 0.7, 2.6, { color: 0xf97316 });
    barrierPanel(g, 3.1, -2.7, { color: 0xf2c14b, ry: 0.3 });

    let venting = false, cutting = false, fanTripped = false, smoking = false, watchOn = false;

    return {
      hits,
      footprint: 2.2,

      onStepComplete(step) {
        if (step.id === "recall-chemist") {
          // The chemist re-tests and re-issues: the void's finding changes.
          repaint(cert.userData.face, (cx, w, h) => {
            cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h);
            cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 5);
            cx.fillStyle = "#8fb3c4";
            cx.font = `600 ${Math.round(h * 0.085)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillText("MARINE CHEMIST CERTIFICATE · REISSUED", w * 0.05, h * 0.12);
            cx.fillStyle = "#eaf6fb";
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            cx.fillText("VOID FRAME 74 RETESTED", w * 0.05, h * 0.28);
            cx.fillStyle = "#bcd6e2";
            cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
            ["No. 3 CENTRE CARGO TANK — safe for workers, safe for hot work",
             "No. 3 DOUBLE BOTTOM — safe for workers, safe for hot work",
             "VOID FRAME 74 — safe for workers, SAFE FOR HOT WORK",
             "Conditions: mechanical ventilation continuous throughout",
             "Issued 0700 · Expires 1800 this date",
             "Boundary between No. 3 centre and the void now covered"]
              .forEach((line, i) => cx.fillText(line, w * 0.05, h * 0.44 + i * h * 0.085));
          });
        }
        if (step.id === "duct") ductSock.position.set(-1.6, 0, -1.6);
        if (step.id === "blower") { venting = true; damper.userData.wheel.rotation.z += 2.4; }
        if (step.id === "cylinders") { cart.position.set(3.55, 0, 1.45); cart.rotation.y = -0.5; }
        if (step.id === "rig-torch") { torch.position.set(-0.45, 0.6, -2.15); torch.rotation.z = -0.5; }
        if (step.id === "shield") { blanket.position.set(-1.5, 0.58, -1.9); blanket.scale.set(2.6, 0.5, 1.6); }
        if (step.id === "cut") {
          cutting = false;
          insert.position.set(-1.5, 0.35, 0.9);
          insert.rotation.z = 0.4;
        }
        if (step.id === "boundaries") { dbCover.position.set(0.42, 0.06, 0.34); dbCover.rotation.z = 1.2; }
        if (step.id === "watch-after") watchOn = false;
        if (step.id === "break-out") { hoseCoil.position.set(2.5, 0.5, 1.0); torch.position.set(2.4, 0.55, 1.2); torch.rotation.z = 0; }
        if (step.id === "walk") { wellMuck.material = mat(0x59c97b, { rough: 0.7 }); }
      },

      // Both interruptions are things that happen in the world: the fan really
      // stops and the sock goes soft, and the coating behind the plate really
      // starts to smoke.
      onInterrupt(it) {
        if (it.id === "vent-trip") {
          fanTripped = true; venting = false;
          tripLamp.visible = true;
          ductSock.scale.set(0.55, 1, 0.55);
          airStream.visible = false;
        }
        if (it.id === "void-smoke") {
          smoking = true;
          voidSmoke.visible = true;
          reverseGlow.visible = true;
          reverseGlow.material.emissiveIntensity = 1.6;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "vent-trip") {
          fanTripped = false; venting = true;
          tripLamp.visible = false;
          ductSock.scale.set(1, 1, 1);
        }
        if (it.id === "void-smoke") {
          smoking = false;
          voidSmoke.visible = false;
          reverseGlow.visible = false;
          reverseGlow.material.emissiveIntensity = 0.2;
        }
      },

      onHazard(hitId) {
        if (hitId === "vent-off") { venting = false; tripLamp.visible = true; }
        if (hitId === "cut-uncertified" || hitId === "expired-cert") arcGlow.visible = true;
      },

      animate(t, dt, session) {
        const stepId = session?.step?.id;
        cutting = stepId === "cut" && !!session?.holding;
        watchOn = stepId === "watch-after";
        if (venting && !fanTripped) {
          fan.rotation.z += dt * 14;
          airStream.visible = true;
          airStream.userData.step(dt, new THREE.Vector3(0, -0.15, 0), 0.06, 0.5, -0.4);
        } else if (airStream.visible && fanTripped) airStream.visible = false;
        if (cutting) {
          arcGlow.visible = true;
          arcGlow.material.emissiveIntensity = 2.2 + Math.sin(t * 22) * 0.9;
          sparks.visible = true;
          sparks.userData.step(dt, new THREE.Vector3(0, 0, 0.1), 0.06, 1.3, -3.2);
        } else if (sparks.visible) { sparks.visible = false; arcGlow.visible = false; }
        if (smoking) {
          voidSmoke.userData.step(dt, new THREE.Vector3(0, 0, 0), 0.12, 0.22, 0.28);
          reverseGlow.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.5;
        }
        if (watchOn) {
          const left = Math.max(0, (session.step.seconds ?? 6) - (session.holdFor ?? 0));
          repaint(timerFace, signFace(`WATCH\n${left.toFixed(1)}`, {
            bg: "#1a1209", accent: "#f97316", fg: "#ffe3ac", scale: 0.34,
          }));
        }
        const gg = session?.gauge;
        if (gg && !gg.committed && stepId === "airflow") {
          repaint(anemo.userData.screen, signFace(`${(gg.t * 14).toFixed(1)}`, {
            bg: "#0d1c24", accent: gg.t > 0.5 && gg.t < 0.78 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }
        if (gg && !gg.committed && stepId === "hose-test") {
          repaint(hoseGauge.userData.screen, signFace(`${(gg.t * 20).toFixed(1)}`, {
            bg: "#1a1209", accent: gg.t < 0.22 ? "#59c97b" : "#f0645b", fg: "#ffe3ac", scale: 0.55,
          }));
        }
      },
    };
  },
};
