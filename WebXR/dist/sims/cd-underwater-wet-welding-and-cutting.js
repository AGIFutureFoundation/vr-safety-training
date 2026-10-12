import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, valveWheel, reg,
  surfaceTexture, texturedMat, deckPlateFace, waterFace, paintedSteelFace, growthFace,
} from "../citykit.js";
import { woodGrainFace, safetyStripeFace } from "../../../shared/textures.js";
import { divingStage } from "../../../shared/props.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Underwater Wet Welding & Cutting — the surface side. Commercial
// diving and scientific scuba pack, DIVE1.
//
// The learner is the welding tender on a pier apron: the one person whose hand
// is on the knife switch that makes the diver-welder's electrode live. The
// deck carries the DC welding machine, the knife switch in its striped box,
// the electrode quiver, the welding lead and the ground lead running to a
// steel pile, the diving stage hanging at the apron edge with the diver-
// welder in it, the supervisor at the comms panel, the standby diver, and a
// deckhand. Nothing about current, amperage, depth, gas or bottom time is a
// number here; the welding procedure card and the dive plan hold those, and
// the AWS D3.6 job briefing says who reads them.

const CDWW_ACCENT = 0xf0a04b;
const CDWW_CSS = "#f0a04b";

export const SIM_CD_UNDERWATER_WET_WELDING_AND_CUTTING = {
  id: "cd-underwater-wet-welding-and-cutting",
  index: "716",
  domain: "Maritime & Ports",
  trade: "Pile Drivers of the Carpenters diver-tender working the knife switch and the leads for a diver-welder on a pier repair, with the dive supervisor, the diver-welder in the stage and the standby diver",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "overcast",
  certification: "Pile Drivers apprenticeship under the Carpenters (UBC) International Training Fund; OSHA 29 CFR 1910 Subpart T — 29 CFR 1910.421 pre-dive procedures and the team briefing, 29 CFR 1910.422 procedures during the dive (power tools and welding equipment, communications), 29 CFR 1910.430 diving equipment and 29 CFR 1910.425 the tended surface-supplied diver; AWS D3.6 underwater welding code for the qualified procedure and the job briefing; ADCI consensus standards for the surface-controlled switch; USCG 46 CFR 197 Subpart B where the work is off a vessel; the welding procedure card and the dive plan hold every figure",
  name: "Underwater Wet Welding & Cutting — Surface Side",
  title: simTitle("Underwater Wet Welding & Cutting — Surface Side"),
  tagline: "The switch that makes the diver's rod live is on deck: the AWS D3.6 job briefing taken, the cut jacket and the loose lug found, the ground clamped to clean steel on the work, the machine idled and its polarity read, the output set to the procedure card, the diver's gloves and helmet insulation checked, the switch held open until 'make it hot', the bead tended while a deckhand wanders onto the stage, the comms garble answered by line pull, 'make it cold' before the rod change, the stub bagged, the bead read on video and the weld record written",
  accent: CDWW_ACCENT,
  accentCss: CDWW_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "switch-on-the-call", name: "Switch On The Call", note: "The knife switch closed only on 'make it hot' and opened on 'make it cold', every rod, every time" },

  supportLine: "your union hall's member assistance programme — the Pile Drivers of the Carpenters — with the employer's employee assistance line behind it",

  game: system({
    name: "Hot And Cold",
    currency: "ROD COUNT",
    ranks: ["Deckhand", "Lead Tender", "Switch Tender", "Welding Tender", "Wet Weld Certified"],
    badges: [
      { id: "clean-leads", name: "Clean Leads", note: "The cut jacket and the loose lug found before the machine ran", test: AWARD.stepClean("check-leads") },
      { id: "card-set", name: "Set To The Card", note: "The output set inside the procedure card's band first time", test: AWARD.precise(0.7) },
      { id: "cold-hands", name: "Cold Hands", note: "No hazard reached for from the briefing to the log", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections from the briefing to the check-in", test: AWARD.clean },
      { id: "steady-tend", name: "Steady Tend", note: "The lead tended in band for the whole bead", test: AWARD.unbroken },
      { id: "quick-record", name: "Quick Record", note: "Weld record written inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "hot-without-call": "You reached to close the knife switch because the diver looked about ready on the video. The switch closes on the diver's spoken call, 'make it hot', and on nothing else: a live electrode in a diver's hand before they have it against the work and their body clear of the circuit is how a welder gets a shock through wet gloves. AWS D3.6 and the safe practices manual both put the switch under the diver's voice, not the tender's judgement.",
    "ground-to-stage": "You went to clamp the ground lead to the diving stage because it was the nearest clean steel. The stage is what the diver stands in; a ground on it puts the diver between the electrode and the return every time they lean on a rail. The ground goes on the work itself, on bright metal, as close to the weld as the procedure card allows, so the current's path never runs through the stage or the diver.",
    "lead-through-bilge": "You started to run the welding lead through the standing water in the deck scupper because it was the straight route. A lead with any nick in its jacket lying in a puddle puts a live path across the deck everyone is walking on, and the nick you did not find is the one that bites. Leads run high, dry, over the cable ramp and over the chafe roller, never through water on deck.",
    "wet-hand-switch": "You went to throw the knife switch with your wet glove off and your bare hand. The switch box is insulated for a reason and the tender's dry rubber gloves are part of the circuit's protection; a bare wet hand on a knife switch handle carrying a welding circuit is a burn or a shock on the surface, where the diver has nobody else watching the switch. Gloves on, dry, then the handle.",
  },

  lateNotes: {
    "knife-switch": "The switch is worked on the diver's call once the leads, the ground and the diver are checked.",
    "lead-tend": "The lead is tended once the switch is hot and the diver is welding.",
    "weld-record": "The weld record is written once the bead is read and the switch is cold.",
  },

  steps: [
    {
      id: "weld-brief", kind: "select", target: "procedure-card",
      title: "Take the AWS D3.6 job briefing at the comms panel",
      cue: "At the supervisor's panel, in your PFD and dry gloves: the qualified welding procedure card, who owns the knife switch, the exact words for 'make it hot' and 'make it cold', and what happens if comms go.",
      why: "AWS D3.6 has the wet weld done to a qualified procedure and the whole team briefed on it before the diver dresses, and 29 CFR 1910.421 has the dive team briefed on the tasks, the hazards and the signals. The welding tender's part of that briefing is the switch: only the tender works it, only on the diver's spoken call, and the words are fixed so that a garbled call is never mistaken for one.",
    },
    {
      id: "check-leads", kind: "find", noHint: true,
      targets: ["cut-jacket", "loose-lug"],
      itemNames: { "cut-jacket": "welding lead's jacket cut through to the copper", "loose-lug": "ground lead's lug loose on the machine terminal" },
      itemNotes: {
        "cut-jacket": "A hand's width of the welding lead's jacket is split to the copper where it has been dragged over a pier edge. In the water, or in a puddle on deck, that is a live path out of the lead.",
        "loose-lug": "The ground lead's lug is finger-loose on the machine's return terminal. A loose return heats, arcs and can drop the ground mid-bead, leaving the diver holding the only path.",
      },
      title: "Walk the leads from the machine to the water's edge",
      cue: "Run your hand and your eyes along the welding lead and the ground lead from the machine terminals to the apron edge: jacket, connectors, lugs and the strain on each.",
      why: "29 CFR 1910.430 has diving equipment inspected before use and the welding leads are the diver's equipment as much as the umbilical is. A split jacket or a loose lug is not visible from the switch, and a lead fault found once the diver is in the water means a cold switch, a diver waiting on the bottom and a repair under time; found on deck it is a lead swapped in a minute.",
    },
    {
      id: "set-ground", kind: "drag", target: "ground-clamp",
      title: "Clamp the ground on bright steel on the work",
      cue: "Take the ground clamp to the pile's steel jacket at the point the procedure card marks, on metal the diver has already cleaned to bright, and close it hard.",
      why: "The return path runs from the work back to the machine, and where the ground sits decides where the current flows. On bright steel on the work itself, close to the weld, the path stays inside the pile; on painted or grown-over steel it arcs and wanders, and on the stage or a ladder it runs through whatever the diver is touching. The card marks the spot for exactly that reason.",
      drag: { to: "ground-point", radius: 0.5, missNote: "Not on the work — the ground goes on the bright steel the procedure card marks, on the pile itself." },
    },
    {
      id: "polarity-check", kind: "sequence",
      targets: ["output-idle", "polarity-tag"],
      itemNames: { "output-idle": "machine's output confirmed off at the contactor", "polarity-tag": "polarity read against the procedure card" },
      title: "Confirm the output is off, then read the polarity against the card",
      cue: "At the machine, confirm the output contactor is open and the knife switch is open, then read the lead polarity at the terminals against the procedure card.",
      why: "Wet SMAW is run on direct current at the polarity the qualified procedure names, and the wrong polarity puts the electrolysis on the diver's side of the arc, eating the helmet's metal fittings and blistering the weld. The polarity is read with the output off because reading terminals on a live machine is a shock waiting for a wet glove, and it is read against the card rather than from memory.",
      outOfOrderNote: "Out of order — confirm the output is off before you put a hand on the terminals to read polarity.",
    },
    {
      id: "set-output", kind: "turn", target: "output-dial",
      title: "Set the machine's output to the procedure card",
      cue: "Turn the output control to the setting on the procedure card for this electrode and this position, and leave it there.",
      why: "The setting on the card is the one the procedure was qualified at, with this electrode, in this position, in this water; too low and the arc will not strike wet, too high and the bead undercuts and the rod burns away in the diver's hand. The tender sets it, reads it back to the supervisor, and does not adjust it on a feeling — a change means a call to the diver and a note on the record.",
      turn: { turns: 1.2, label: "OUTPUT", readout: (t) => (t < 0.35 ? "below the card" : t < 0.85 ? "at the procedure card" : "above the card") },
    },
    {
      id: "diver-insulation", kind: "select", target: "diver-gloves",
      title: "Check the diver-welder's gloves and helmet insulation",
      cue: "At the stage: the diver's rubber gloves whole and over the cuffs, the helmet's insulating fittings in place, no bare metal where the electrode holder rests.",
      why: "The diver-welder's protection from their own circuit is their gloves and the insulation on the helmet's fittings; a torn glove or a missing fitting is a path to the diver at the first touch of a live electrode. The tender checks them at the stage because the diver cannot see their own helmet and, once in the water, cannot fix a glove. It is a two-second look that the whole dive depends on.",
    },
    {
      id: "switch-hold", kind: "hold", target: "switch-handle", seconds: 5,
      title: "Hold the knife switch open until the diver calls for it",
      cue: "Gloves on, hand on the handle, switch open. Listen to the comms: the diver is positioning the electrode against the work and will call 'make it hot' when ready.",
      why: "Between the diver entering the water and the first call, the switch stays open and the tender's hand stays on it: open so nothing is live while the diver is still moving and settling, on the handle so the call is answered the moment it comes. A tender who walks away from the switch to fetch something is a diver holding a rod against the work with nobody to make it live — or a switch someone else throws.",
      holdBreakNote: "Your hand came off the switch — the diver's call has nobody to answer it. Back on the handle, switch open.",
    },
    {
      id: "make-hot", kind: "select", target: "knife-switch",
      title: "Close the switch on 'make it hot'",
      cue: "The diver calls 'make it hot'. Repeat the call back on the comms, then close the knife switch in one movement.",
      why: "The call is repeated back so the diver hears that the tender heard the right words, then the switch closes. 29 CFR 1910.422 has the welding circuit energised only on the diver's command and de-energised on it; the read-back is what stops a 'make it cold' that came through as a half-word from being answered with a live rod. One clean movement, because a knife switch closed slowly arcs at the blades.",
    },
    {
      id: "weld-track", kind: "track", target: "lead-tend", seconds: 6,
      title: "Tend the welding lead while the diver runs the bead",
      cue: "Keep the welding lead in hand over the roller with just enough slack for the diver to move along the bead — no strain on the electrode holder, no belly of lead in the water.",
      why: "The diver-welder works with both hands on the holder and the work, so the lead's slack is the tender's job: strain on it pulls the holder off the bead, slack piles in the water and fouls the umbilical or the stage. The tender feels the diver moving along the joint through the lead the same way the umbilical tender feels the diver, and stays ready for the 'make it cold' that ends every rod.",
      track: { start: 0.14, green: [0.42, 0.62], rise: 0.56, fall: 0.46, drift: 0.12, label: "LEAD SLACK", readout: (v) => (v < 0.42 ? "strain on the holder" : v > 0.62 ? "lead bellying in the water" : "moving with the diver") },
      holdBreakNote: "The lead went out of band — strain on the holder or a belly in the water. Get back in step with the diver.",
    },
    {
      id: "make-cold", kind: "select", target: "knife-switch",
      title: "Open the switch on 'make it cold'",
      cue: "The rod is spent and the diver calls 'make it cold'. Repeat it back, open the knife switch, and tell the diver 'switch is cold' before they touch the holder.",
      why: "Every rod change is a cold switch: the diver has to take the spent stub out of the holder and put the fresh electrode in with their gloves on the holder's jaws, and that is done only on a dead circuit. The tender says 'switch is cold' after opening it because the diver acts on the tender's word, not on the sound of a switch they cannot hear, and a rod put in a live holder is a shock at the fingertips.",
    },
    {
      id: "change-electrode", kind: "sequence",
      targets: ["stub-bag", "fresh-rod"],
      itemNames: { "stub-bag": "spent stub taken from the diver's line and bagged", "fresh-rod": "fresh electrode from the dry quiver sent down the line" },
      title: "Bag the spent stub, then send down a fresh rod",
      cue: "Haul the stub bag up the electrode line, drop the spent stub in the bag, then load a fresh electrode from the sealed quiver and send it down.",
      why: "Spent stubs go in the bag, not over the side: a stub on the bottom is a sharp, a foul for the umbilical and a piece of steel the diver kneels on. The fresh electrode comes out of a quiver that has stayed sealed and dry, because a waterproofed rod whose coating has soaked is a rod that will not strike and a weld the procedure never qualified. Stub first, then rod, so nothing live or spent is in two hands at once.",
      outOfOrderNote: "Out of order — bag the spent stub before you send a fresh rod down the line.",
    },
    {
      id: "read-bead", kind: "gauge", target: "video-monitor",
      title: "Read the bead on the diver's video against the card",
      cue: "Watch the helmet camera as the diver brushes the bead and commit when the profile, the toes and the start and stop read as the procedure card's visual acceptance describes.",
      why: "AWS D3.6 has every wet weld inspected to the class the procedure names, and the first inspection is visual, by the diver's camera and the supervisor's eye on the monitor. Reading the bead against the card's own description — the profile, undercut at the toes, the starts and stops — rather than against a feeling is what makes the record defensible when the inspector asks how the weld was accepted.",
      gauge: { label: "BEAD vs CARD", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "undercut at the toes" : t <= 0.62 ? "reads to the card's profile" : "over-built, cold lap at the stop"), missNote: "Outside the band — read the bead against the card's visual acceptance, not against how it looks." },
    },
    {
      id: "weld-record", kind: "select", target: "weld-record",
      title: "Write the weld record and the dive log entry",
      cue: "At the record table: the procedure card number, the electrodes used and the stubs bagged, the machine setting, every hot and cold call with its time, the lead fault found and the deckhand on the stage.",
      why: "The weld record is the weld's paper: the procedure it was made to, the rods and the setting, and every time the circuit went live and dead. 29 CFR 1910.440 has the dive's record kept and AWS D3.6 has the weld's kept, and they are written by the person who worked the switch because the switch log is the one thing nobody else on the team saw from where they stood.",
    },
    {
      id: "crew-checkin", kind: "select", target: "team-board",
      title: "Check in with the dive team",
      cue: "At the team board: the diver-welder's condition and who is watching them, the lead tagged out for repair, the deckhand and the stage, the garbled comms, and how everyone is.",
      why: "The check-in closes the job for the team, not just for the record: the diver is watched for symptoms per 29 CFR 1910.423, the damaged lead is out of service where the next tender will see the tag, and the two moments that went wrong — a deckhand at the stage edge, comms dropping mid-bead — are said out loud so they are fixed for tomorrow. The union hall's member assistance line is there for what the deck does not settle.",
    },
  ],

  interrupts: [
    {
      id: "deckhand-on-stage",
      kind: "Deckhand at the stage edge over the live lead",
      after: "switch-hold", delay: 2, seconds: 14,
      alert: "A deckhand has stepped onto the apron edge beside the hanging stage to reach a fender — standing over the welding lead's path with the diver about to call for it hot.",
      cue: "Sound the air horn and wave the deckhand back behind the striped line before you answer any call.",
      target: "air-horn",
      why: "The apron edge inside the striped line is the welding circuit's ground: the leads, the roller and the stage all live there, and anyone standing on it when the switch closes is standing in a circuit they do not know is live. The horn stops everyone at once, the deckhand goes back behind the line, and only then is the tender free to answer the diver — a call answered with someone on the leads is a call answered wrong.",
      missNote: "The diver called 'make it hot' with the deckhand still straddling the welding lead at the apron edge; the supervisor stopped the dive and the deckhand was walked off the stage by the standby.",
      wrongNote: "The air horn — stop the deckhand and clear the stage edge before anything else.",
    },
    {
      id: "comms-garble",
      kind: "Diver's voice comms garbled mid-bead",
      after: "weld-track", delay: 2, seconds: 14,
      alert: "The diver's voice on the comms has dropped to a crackle mid-bead — you cannot tell whether that was 'make it cold' or nothing at all.",
      cue: "Open the knife switch at once, then give the diver the line-pull signal for 'switch is cold' on the umbilical from the manual.",
      target: "line-pull-point",
      why: "A garbled call is treated as 'make it cold', never as silence: the tender cannot know whether the diver is asking for a dead circuit or has a problem, and a live electrode in a diver's hand is the one thing that must not continue on a guess. The switch opens, and the line-pull signal from the employer's safe practices manual tells the diver the circuit is dead in the only language left when the voice comms fail.",
      missNote: "The switch stayed hot through the crackle; the diver had called 'make it cold' and was waiting to change the rod with a live holder in their glove until the supervisor reached over and opened the switch.",
      wrongNote: "The umbilical at the roller — the switch is open, now give the diver the 'switch is cold' line-pull signal.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CDWW_ACCENT);

    // ------------------------------------------------------- apron, water, pile
    const water = box(g, 9.0, 0.02, 7.0, 0, 0.012, -3.2, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#0d2a2e", mid: "#12383c" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x86acb6 });
    const apron = box(g, 7.0, 0.14, 4.4, 0, 0.4, 0.6, 0xffffff, { rough: 0.8 });
    apron.material = texturedMat(surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#454b50", base2: "#393f45", step: 21 }), { repeat: 4, px: 512 }), { rough: 0.8, metal: 0.35, color: 0xc6ccd2 });
    box(g, 7.0, 0.4, 4.4, 0, 0.16, 0.6, 0x8a8f93, { rough: 0.7, cast: false });
    const stripe = box(g, 7.0, 0.012, 0.3, 0, 0.48, -1.2, 0xffffff, { rough: 0.7 });
    stripe.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h), { repeat: 6, px: 256 }), { rough: 0.7 });
    for (const x of [-3.2, -1.6, 1.6, 3.2]) cyl(g, 0.022, 0.022, 1.0, x, 0.97, -1.55, 0xc8ced4, { rough: 0.35, metal: 0.5, seg: 8 });
    box(g, 6.8, 0.04, 0.04, 0, 1.45, -1.55, 0xc8ced4, { rough: 0.35, metal: 0.5 });
    for (let i = 0; i < 6; i++) box(g, 0.9, 0.05, 0.05, -3.0 + i * 1.2, 0.5, 2.7, 0x5b6771, { rough: 0.6, metal: 0.5 });
    // Steel-jacketed pile the diver is welding, with growth below the water.
    const pileTex = surfaceTexture((cx, w, h) => growthFace(cx, w, h), { px: 512 });
    const pile = group(g, -2.6, 0, -2.6);
    const pShaft = cyl(pile, 0.34, 0.36, 4.2, 0, 1.4, 0, 0xffffff, { seg: 18 });
    pShaft.material = texturedMat(pileTex, { rough: 0.95, color: 0xdfe6d8 });
    const jacket = cyl(pile, 0.38, 0.38, 1.4, 0, 3.0, 0, 0xffffff, { seg: 18 });
    jacket.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#5a5f63", base2: "#484d52" }), { px: 256 }), { rough: 0.6, metal: 0.5 });
    const groundPoint = group(pile, 0.38, 2.5, 0.1);
    box(groundPoint, 0.06, 0.16, 0.16, 0, 0, 0, 0xd8dde2, { rough: 0.25, metal: 0.9 });
    const gpRing = torus(groundPoint, 0.16, 0.01, 0.04, 0, 0, CDWW_ACCENT, { emissive: CDWW_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 22 });
    gpRing.rotation.y = Math.PI / 2;
    holoTag(pile, "bright steel — card's ground point", 0.4, 3.0, 0.1, { css: CDWW_CSS, w: 0.56 });
    reg(hits, groundPoint, "ground-point");
    for (const y of [0.6, 1.6]) torus(pile, 0.4, 0.05, 0, y, 0, 0x4a5a32, { rough: 1, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;

    // ------------------------------------------------------- the stage and the diver-welder
    const stage = divingStage(g, 1.9, 0.5, -2.35, { colour: 0xe8b02e });
    const stageHome = stage.position.y;
    const diver = group(stage, 0, 0.09, 0);
    standingFigure(diver, 0, 0, { atStation: true, ry: Math.PI, cloth: 0x1b1e22, trousers: 0x1b1e22, gloves: 0x2b2b2b });
    ball(diver, 0.2, 0, 1.63, 0, 0xf2c14b, { rough: 0.35, metal: 0.4, seg: 16, seg2: 12 });
    cyl(diver, 0.08, 0.08, 0.45, 0, 1.15, 0.2, 0xc8ccd0, { rough: 0.4, metal: 0.6, seg: 12 });
    const gloves = group(diver, 0.32, 0.95, 0.1);
    box(gloves, 0.1, 0.16, 0.1, 0, 0, 0, 0x2b2b2b, { rough: 0.9 });
    torus(gloves, 0.1, 0.01, 0, 0.1, 0, CDWW_ACCENT, { emissive: CDWW_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(gloves, "gloves · helmet insulation", 0, 0.32, 0, { css: CDWW_CSS, w: 0.48 });
    reg(hits, gloves, "diver-gloves");
    holoTag(stage, "diving stage — diver-welder", 0, 2.85, 0, { css: CDWW_CSS, w: 0.5 });
    const stageGroundHit = box(g, 0.5, 0.5, 0.3, 1.1, 1.55, -2.35, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "ground on the stage rail?", 1.1, 1.95, -2.3, { css: "#d2312b", w: 0.46 });
    reg(hits, stageGroundHit, "ground-to-stage");
    // Davit holding the stage.
    cyl(g, 0.06, 0.06, 3.2, 3.0, 2.05, -1.35, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 10 });
    const arm = box(g, 1.4, 0.08, 0.08, 2.4, 3.6, -1.9, 0x5b6771, { rough: 0.5, metal: 0.6 });
    arm.rotation.y = 0.7;
    hose(g, [[1.9, 3.5, -2.35], [1.9, 3.1, -2.35]], 0.012, 0xb0b4b8, { steps: 2, rough: 0.5 });

    // ------------------------------------------------------- welding machine, switch, quiver
    const machine = group(g, -1.2, 0.47, 1.6);
    const mBody = box(machine, 1.1, 0.9, 0.7, 0, 0.45, 0, 0xffffff, { rough: 0.5 });
    mBody.material = texturedMat(surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#c9401a", base2: "#a83415" }), { px: 256 }), { rough: 0.5, metal: 0.4 });
    box(machine, 1.0, 0.12, 0.6, 0, 0.96, 0, 0x2b3138, { rough: 0.6, metal: 0.5 });
    for (const [x, c] of [[-0.35, 0xd2312b], [-0.15, 0x1b1e22]]) { const t = cyl(machine, 0.04, 0.04, 0.06, x, 0.6, 0.36, c, { rough: 0.4, metal: 0.6, seg: 12 }); t.rotation.x = Math.PI / 2; }
    const idle = group(machine, 0.3, 0.7, 0.36);
    const idleLamp = cyl(idle, 0.035, 0.035, 0.03, 0, 0, 0, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4, seg: 12 });
    idleLamp.rotation.x = Math.PI / 2;
    holoTag(idle, "output contactor — off?", 0, 0.2, 0.05, { css: CDWW_CSS, w: 0.44 });
    reg(hits, idle, "output-idle");
    const polTag = decal(machine, 0.2, 0.12, -0.25, 0.4, 0.37, paperFace("POLARITY", ["Per the card"], { bg: "#f3efe4", band: CDWW_CSS }), { px: 96 });
    holoTag(machine, "polarity tag", -0.25, 0.22, 0.4, { css: CDWW_CSS, w: 0.24 });
    reg(hits, polTag, "polarity-tag");
    const dial = valveWheel(machine, 0.38, 0.4, 0.38, { r: 0.07, color: 0x1b1e22, body: 0x3a4148 });
    dial.rotation.x = Math.PI / 2;
    dial.scale.set(0.8, 0.8, 0.8);
    holoTag(machine, "output control", 0.38, 0.05, 0.42, { css: CDWW_CSS, w: 0.3 });
    reg(hits, dial, "output-dial");
    const looseLug = box(machine, 0.05, 0.05, 0.05, -0.15, 0.6, 0.42, 0xc0c6cc, { rough: 0.3, metal: 0.8, emissive: 0x3a0808, ei: 0.35 });
    looseLug.rotation.z = 0.5;
    reg(hits, looseLug, "loose-lug");
    // Knife switch in its striped box.
    const swBox = group(g, 0.4, 0.47, 0.9);
    const swBody = box(swBox, 0.5, 0.7, 0.3, 0, 0.35, 0, 0xffffff, { rough: 0.6 });
    swBody.material = texturedMat(surfaceTexture((cx, w, h) => safetyStripeFace(cx, w, h), { repeat: 2, px: 256 }), { rough: 0.6 });
    box(swBox, 0.44, 0.44, 0.04, 0, 0.6, 0.16, 0x1b1e22, { rough: 0.5, metal: 0.4 });
    const handle = group(swBox, 0, 0.5, 0.2);
    const blade = box(handle, 0.05, 0.36, 0.03, 0, 0.14, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8 });
    blade.rotation.x = -0.9;
    const knob = ball(handle, 0.045, 0, 0.3, -0.24, 0xd2312b, { rough: 0.5, seg: 12, seg2: 8 });
    void knob;
    holoTag(swBox, "knife switch — hot / cold", 0, 1.05, 0.1, { css: CDWW_CSS, w: 0.5 });
    reg(hits, swBox, "knife-switch");
    const handleHit = box(swBox, 0.3, 0.3, 0.3, 0, 0.75, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(swBox, "hand on the handle — hold open", 0, 0.85, 0.5, { css: CDWW_CSS, w: 0.56 });
    reg(hits, handleHit, "switch-handle");
    const earlyHit = box(g, 0.3, 0.3, 0.3, 0.95, 0.95, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "he looks ready — close it early?", 0.95, 1.25, 0.9, { css: "#d2312b", w: 0.56 });
    reg(hits, earlyHit, "hot-without-call");
    const bareHit = box(g, 0.3, 0.3, 0.3, -0.15, 0.95, 0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "glove off — bare hand on it?", -0.15, 1.25, 0.9, { css: "#d2312b", w: 0.5 });
    reg(hits, bareHit, "wet-hand-switch");
    // Electrode quiver and stub bag.
    const quiver = group(g, 1.6, 0.47, 1.4);
    cyl(quiver, 0.09, 0.09, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.5, seg: 14 });
    cyl(quiver, 0.1, 0.1, 0.04, 0, 0.52, 0, 0x1b1e22, { rough: 0.5, seg: 14 });
    for (let i = 0; i < 7; i++) cyl(quiver, 0.006, 0.006, 0.38, Math.cos(i) * 0.05, 0.7, Math.sin(i) * 0.05, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 6 });
    holoTag(quiver, "sealed quiver — fresh rod", 0, 1.05, 0, { css: CDWW_CSS, w: 0.48 });
    reg(hits, quiver, "fresh-rod");
    const stubBag = group(g, 2.2, 0.47, 1.0);
    box(stubBag, 0.3, 0.3, 0.2, 0, 0.15, 0, 0x8a6a2a, { rough: 0.95 });
    for (let i = 0; i < 4; i++) cyl(stubBag, 0.006, 0.006, 0.1, -0.08 + i * 0.05, 0.33, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 6 });
    holoTag(stubBag, "stub bag", 0, 0.55, 0, { css: CDWW_CSS, w: 0.2 });
    reg(hits, stubBag, "stub-bag");

    // ------------------------------------------------------- leads, roller, ground clamp
    const weldLead = hose(g, [[-0.7, 0.9, 1.6], [0.2, 0.62, 0.4], [1.0, 0.62, -0.6], [1.6, 1.42, -1.55]], 0.03, 0x1b1e22, { steps: 14, rough: 0.8 });
    void weldLead;
    const cutJacket = box(g, 0.14, 0.07, 0.07, 0.6, 0.62, -0.1, 0xb8742a, { rough: 0.9, emissive: 0x3a1a0a, ei: 0.4 });
    reg(hits, cutJacket, "cut-jacket");
    const groundLead = hose(g, [[-1.55, 0.9, 1.6], [-2.0, 0.62, 0.4], [-2.4, 0.62, -0.8], [-2.6, 0.9, -1.5]], 0.03, 0x2f8f5a, { steps: 12, rough: 0.8 });
    void groundLead;
    const groundLeadOn = hose(g, [[-2.6, 0.9, -1.5], [-2.5, 1.8, -2.2], [-2.22, 2.5, -2.5]], 0.03, 0x2f8f5a, { steps: 8, rough: 0.8 });
    groundLeadOn.visible = false;
    const clamp = group(g, -2.6, 1.0, -1.4);
    box(clamp, 0.08, 0.2, 0.06, 0, 0, 0, 0xc8ccd0, { rough: 0.3, metal: 0.8 });
    box(clamp, 0.08, 0.2, 0.06, 0.06, 0.02, 0, 0xc8ccd0, { rough: 0.3, metal: 0.8 });
    cyl(clamp, 0.03, 0.03, 0.14, 0.03, -0.14, 0, 0x2f8f5a, { rough: 0.6, seg: 10 });
    holoTag(clamp, "ground clamp", 0, 0.28, 0, { css: CDWW_CSS, w: 0.28 });
    reg(hits, clamp, "ground-clamp");
    const roller = group(g, 1.2, 1.47, -1.55);
    const rollerBody = cyl(roller, 0.07, 0.07, 0.4, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 14 });
    rollerBody.rotation.z = Math.PI / 2;
    for (const x of [-0.22, 0.22]) box(roller, 0.03, 0.2, 0.1, x, 0, 0, 0x5b6771, { rough: 0.5, metal: 0.6 });
    holoTag(roller, "roller — tend the lead", 0, 0.28, 0, { css: CDWW_CSS, w: 0.42 });
    reg(hits, roller, "lead-tend");
    const scupper = box(g, 0.9, 0.02, 0.4, -0.4, 0.48, -1.0, 0x1f3a40, { rough: 0.1, metal: 0.5, opacity: 0.8, transparent: true, cast: false });
    void scupper;
    const bilgeHit = box(g, 0.9, 0.3, 0.4, -0.4, 0.62, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "run the lead through the puddle?", -0.4, 0.95, -1.0, { css: "#d2312b", w: 0.56 });
    reg(hits, bilgeHit, "lead-through-bilge");
    const umbilical = hose(g, [[-0.4, 0.9, 1.9], [0.2, 0.7, 0.3], [1.3, 0.7, -0.9], [1.7, 1.5, -1.6], [1.9, 1.2, -2.3]], 0.025, 0xf2c14b, { steps: 16, rough: 0.8 });
    void umbilical;
    const pullPoint = group(g, 1.55, 1.3, -1.3);
    torus(pullPoint, 0.1, 0.008, 0, 0, 0, CDWW_ACCENT, { emissive: CDWW_ACCENT, ei: 1.4, rough: 0.4, cast: false, seg: 6, seg2: 18 });
    holoTag(pullPoint, "umbilical — line-pull signal", 0, 0.16, 0, { css: CDWW_CSS, w: 0.5 });
    reg(hits, pullPoint, "line-pull-point");

    // ------------------------------------------------------- comms panel, monitor, horn, record
    const panel = group(g, -2.4, 0.47, 0.9);
    box(panel, 0.9, 0.8, 0.45, 0, 0.4, 0, 0x2b3138, { rough: 0.6, metal: 0.4 });
    const pFace = box(panel, 0.8, 0.5, 0.05, 0, 1.05, -0.1, 0x3a4148, { rough: 0.5, metal: 0.5 });
    pFace.rotation.x = -0.3;
    const commsLamp = cyl(panel, 0.04, 0.04, 0.03, 0.25, 1.15, 0.05, 0x59c97b, { emissive: 0x59c97b, ei: 0.8, rough: 0.4, seg: 12 });
    commsLamp.rotation.x = -0.3;
    const card = decal(panel, 0.34, 0.24, -0.1, 0.83, 0.23, paperFace("WPS — AWS D3.6", ["Rod · position · per card", "Switch: tender, on the call", "'Make it hot' · 'Make it cold'"], { bg: "#fdf3e6", band: "#c9401a" }), { px: 160 });
    holoTag(panel, "comms panel · procedure card", 0, 1.45, 0, { css: CDWW_CSS, w: 0.5 });
    reg(hits, card, "procedure-card");
    const monitor = group(g, -2.4, 1.6, 0.9);
    box(monitor, 0.6, 0.4, 0.06, 0, 0, 0, 0x1b1e22, { rough: 0.5 });
    const screen = decal(monitor, 0.54, 0.34, 0, 0, 0.035, (cx, w, h) => {
      cx.fillStyle = "#0b2a30"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#3a6a4a"; cx.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.08);
      cx.fillStyle = "#e6f6ea"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`; cx.fillText("HELMET CAM", w * 0.06, h * 0.2);
    }, { px: 192, glow: true, ei: 0.6 });
    holoTag(monitor, "helmet video — read the bead", 0, 0.3, 0, { css: CDWW_CSS, w: 0.52 });
    reg(hits, screen, "video-monitor");
    const horn = group(g, -1.0, 1.35, -1.5);
    cyl(horn, 0.05, 0.08, 0.2, 0, 0, 0, 0xd2312b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    cyl(horn, 0.03, 0.03, 0.3, 0, -0.2, 0, 0x5b6771, { rough: 0.5, metal: 0.6, seg: 8 });
    holoTag(horn, "air horn", 0, 0.2, 0, { css: CDWW_CSS, w: 0.2 });
    reg(hits, horn, "air-horn");
    const table = group(g, 2.6, 0.47, 2.0);
    const top = box(table, 0.9, 0.06, 0.55, 0, 0.8, 0, 0xffffff, { rough: 0.8 });
    top.material = texturedMat(surfaceTexture((cx, w, h) => woodGrainFace(cx, w, h), { px: 256 }), { rough: 0.8, color: 0xc7a47a });
    for (const [lx, lz] of [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]]) cyl(table, 0.022, 0.022, 0.8, lx, 0.4, lz, 0x3a4148, { rough: 0.6, metal: 0.4, seg: 6 });
    const record = decal(table, 0.36, 0.26, 0, 0.84, 0, paperFace("WELD RECORD", ["WPS no. ____", "Rods · stubs ____", "Hot / cold calls ____"], { bg: "#f3efe4", band: CDWW_CSS }), { px: 160 });
    record.rotation.x = -Math.PI / 2;
    holoTag(table, "weld record · dive log", 0, 1.1, 0, { css: CDWW_CSS, w: 0.42 });
    reg(hits, record, "weld-record");
    const team = decal(g, 0.6, 0.4, -0.6, 1.35, 2.75, (cx, w, h) => {
      cx.fillStyle = "#101c27"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f6ea"; cx.fillText("WELD DIVE TEAM", w * 0.06, h * 0.22);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#f4f8fb";
      ["Supervisor · Diver-welder", "Welding tender · Standby", "Switch: tender only"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.46 + i * 0.18)));
    }, { px: 256, glow: true, ei: 0.6 });
    team.rotation.y = Math.PI;
    box(g, 0.66, 0.46, 0.04, -0.6, 1.35, 2.78, 0x2b3138, { rough: 0.6 });
    reg(hits, team, "team-board");

    // ------------------------------------------------------- crew
    const supervisor = standingFigure(g, -3.0, 0.2, { ry: 2.6, cloth: 0x2b3138, vest: 0xf06a2b, cap: 0x1f3a52 });
    supervisor.position.y = 0.47;
    holoTag(supervisor, "supervisor", 0, 1.95, 0, { css: CDWW_CSS, w: 0.22 });
    const standby = standingFigure(g, 3.0, 1.0, { ry: -2.4, cloth: 0x1b1e22, trousers: 0x1b1e22, vest: 0xf06a2b, gloves: 0x2b2b2b });
    standby.position.y = 0.47;
    holoTag(standby, "standby diver", 0, 2.05, 0, { css: CDWW_CSS, w: 0.28 });
    const deckhand = standingFigure(g, 1.2, 1.9, { ry: 0.4, cloth: 0x3a4148, vest: 0xf06a2b });
    deckhand.position.y = 0.47;
    holoTag(deckhand, "deckhand", 0, 1.95, 0, { css: CDWW_CSS, w: 0.22 });
    const deckhandHome = deckhand.position.clone();
    // Fenders, bollards and a cable ramp for the apron's edge.
    for (const x of [-3.0, 0.3, 3.0]) { const f = cyl(g, 0.12, 0.12, 0.5, x, 0.7, -1.72, 0x1f5fb8, { seg: 10, rough: 0.6 }); void f; }
    for (const x of [-2.2, 2.6]) { cyl(g, 0.1, 0.12, 0.45, x, 0.7, 2.5, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 12 }); ball(g, 0.12, x, 0.95, 2.5, 0x2b3138, { rough: 0.5, metal: 0.5, seg: 10, seg2: 8 }); }
    for (let i = 0; i < 5; i++) box(g, 0.5, 0.08, 0.14, -0.9 + i * 0.16, 0.5, 0.3, 0xe8b02e, { rough: 0.7 });
    const sparks = group(g, 1.9, 0.3, -2.35);
    for (let i = 0; i < 5; i++) ball(sparks, 0.02, (i - 2) * 0.05, 0.05 * i, 0, 0xfff1c0, { emissive: 0xfff1c0, ei: 1.2, rough: 0.2, cast: false, seg: 6, seg2: 4 });
    sparks.visible = false;

    const waterTex = water.material.map;
    let hot = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.4, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-leads") { cutJacket.material = mat(0x59c97b, { rough: 0.6 }); looseLug.rotation.z = 0; looseLug.material = mat(0x59c97b, { rough: 0.3, metal: 0.6 }); }
        if (step.id === "set-ground") { clamp.position.set(-2.22, 2.5, -2.5); groundLeadOn.visible = true; gpRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "polarity-check") repaint(polTag, paperFace("POLARITY", ["Read · matches card"], { bg: "#e6f6ea", band: "#59c97b" }));
        if (step.id === "diver-insulation") { stage.position.y = stageHome - 1.2; }
        if (step.id === "make-hot") { hot = true; blade.rotation.x = 0; idleLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 0.9 }); sparks.visible = true; }
        if (step.id === "make-cold") { hot = false; blade.rotation.x = -0.9; idleLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8 }); sparks.visible = false; }
        if (step.id === "change-electrode") { stubBag.position.y = 0.5; }
        if (step.id === "read-bead") repaint(screen, (cx, w, h) => { cx.fillStyle = "#0b2a30"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(w * 0.1, h * 0.55, w * 0.8, h * 0.08); cx.fillStyle = "#e6f6ea"; cx.font = `${Math.round(h * 0.14)}px Arial, sans-serif`; cx.fillText("BEAD — reads to card", w * 0.06, h * 0.2); });
        if (step.id === "weld-record") repaint(record, paperFace("WELD RECORD", ["WPS · rods · stubs: written", "Calls timed · lead tagged out", "Deckhand · comms noted"], { bg: "#e6f6ea", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "deckhand-on-stage") deckhand.position.set(1.1, 0.47, -1.35);
        if (it.id === "comms-garble") commsLamp.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.0 });
      },
      onInterruptEnd(it) {
        if (it.id === "deckhand-on-stage" && it.resolved === "answered") deckhand.position.copy(deckhandHome);
        if (it.id === "comms-garble" && it.resolved === "answered") { blade.rotation.x = -0.9; hot = false; sparks.visible = false; commsLamp.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.8 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.005; }
        if (session?.turn && step?.id === "set-output") dial.userData.wheel.rotation.y = session.turn.amount * Math.PI * 2;
        if (step?.id === "weld-track" && session.holding) rollerBody.rotation.x += (dt ?? 0.016) * 2 * (session.track?.v ?? 0);
        if (sparks.visible && hot) sparks.children.forEach((s, i) => { s.position.y = 0.05 * i + ((t * 3 + i) % 0.3); });
        void stripe;
      },
    };
  },
};
