import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, decal, repaint, signFace, particles, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { concretePump } from "../../../shared/equipment.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Formwork Stripping & Reshoring VR — Builders: Carpenters,
// Laborers and Masons.
//
// Under a slab poured a few days ago, a UBC carpentry crew and LIUNA laborers
// strip the deck forms one strip at a time and put reshores in behind them,
// because the floor above is about to be poured and this slab has to carry
// part of it before it has reached its full strength. Nothing comes down
// until the engineer's strength ticket says it may; the strength itself, the
// reshore spacing and the cure interval are all "per the engineer's ticket"
// and "per the reshoring plan" — this file never states a number for them.

const BFS_ACCENT = 0xc98f4b;
const BFS_CSS = "#c98f4b";
const BFS_SOFFIT = 2.72;           // underside of the slab above
const BFS_STRIPS = [-1.8, 0, 1.8]; // form strips A, B, C under the slab

export const SIM_BT_FORMWORK_STRIPPING_AND_RESHORING = {
  id: "bt-formwork-stripping-and-reshoring",
  index: "321",
  domain: "Construction & Structural Trades",
  trade: "Carpenter — UBC, with LIUNA laborers — stripping deck forms and reshoring",
  category: "Construction & Structural Trades",
  weather: "overcast",
  certification: "UBC carpentry apprenticeship formwork curriculum through the Carpenters International Training Fund, and LIUNA Training laborer curricula; ACI 347 Guide to Formwork for Concrete, including removal of forms and reshoring; OSHA 29 CFR 1926.703 formwork and shoring — forms removed only once the concrete has the strength the engineer requires, and reshoring — under 29 CFR 1926 Subpart Q; ANSI A10.9 concrete and masonry construction safety; the engineer of record's strength ticket and reshoring plan",
  name: "Formwork Stripping & Reshoring",
  title: simTitle("Formwork Stripping & Reshoring"),
  tagline: "Stripping a deck bay the day the engineer says it may go: the strength ticket read, the bay walked, the exclusion zone signed, one shore's screw jack eased, the panel lowered on its line, a reshore in before the next strip comes out, each reshore snugged and never jacked, the strips stripped and reshored in turn, the stripped forms checked and carried off, and the reshores watched while the floor above is poured",
  accent: BFS_ACCENT,
  accentCss: BFS_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "reshored-before-load", name: "Reshored Before Load", note: "A bay stripped strip by strip on the engineer's ticket, a reshore in behind every strip, and the reshores watched through the pour above" },

  supportLine: "your Carpenters or LIUNA local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Strip Crew",
    currency: "FORM",
    ranks: ["Apprentice", "Stripper", "Reshore Hand", "Deck Foreman", "Strip Crew Certified"],
    badges: [
      { id: "ticket-first", name: "Ticket First", note: "Not a single form moved before the strength ticket was read", test: AWARD.stepClean("strength-ticket") },
      { id: "watched-the-pour", name: "Watched The Pour", note: "The reshores watched in band through the whole pour above", test: AWARD.unbroken },
      { id: "nothing-overhead", name: "Nothing Overhead", note: "Never under a lowering panel, never prying overhead, never stripping ahead of a ticket, never pulling a reshore", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-strip", name: "Clean Strip", note: "No corrections through the whole bay", test: AWARD.clean },
      { id: "snug-not-jacked", name: "Snug Not Jacked", note: "The reshore snugged inside the band first time", test: AWARD.precise(0.7) },
      { id: "bay-by-break", name: "Bay By Break", note: "Bay stripped, reshored and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-lowering-panel": "You stepped under the form panel while it was being lowered. A stripped panel hangs from one line and whatever friction is left between it and the slab, and plywood stuck to concrete lets go all at once. OSHA's formwork rule and every stripping procedure keep people out from under forms being removed; the panel comes down onto an empty floor.",
    "pry-overhead": "You went to pry the panel off the soffit with the stripping bar from directly underneath it. A panel that breaks free under a bar falls onto the person holding the bar. Panels are released from the side, by lowering their shores, with the bar used from outside the drop zone.",
    "strip-next-bay": "You went to start stripping the next bay. That bay was poured later and the engineer's ticket in front of you releases this bay only. Concrete gains strength with time and temperature, and a bay a day younger may not yet carry itself; each bay is stripped on its own ticket.",
    "pull-reshore": "You went to pull a reshore out to make room for the panel cart. A reshore is carrying part of this slab and part of the floor being poured above it; take one out and its share goes onto its neighbours and onto a slab that has not reached full strength. Reshores stay until the reshoring plan releases them.",
  },

  lateNotes: {
    "screw-jack": "The first shore is eased once the ticket is read, the bay walked and the exclusion zone signed — not before anyone knows whether this slab may carry itself.",
    "reshore-post": "The reshore goes in once the first panel is down — and before the next strip is touched.",
    "strip-log": "The bay is logged once every strip is out, every reshore is in and the pour above has been watched.",
  },

  steps: [
    {
      id: "strength-ticket", kind: "select", target: "strength-ticket",
      title: "Read the engineer's strength ticket for this bay",
      cue: "Read the ticket: which bay it releases, the field-cured test result against the stripping strength the engineer requires, and the reshoring plan it refers to.",
      why: "Forms come off when the concrete can carry itself, and that is decided by the engineer from test results, not by the calendar or by how hard the slab looks. OSHA 29 CFR 1926.703 lets forms and shores be removed only once the employer has determined the concrete has gained enough strength, based on the plans and specifications or on test results, and ACI 347 puts the same decision with the engineer. The ticket names the bay it releases, and it releases nothing else.",
    },
    {
      id: "bay-walk", kind: "find", noHint: true,
      targets: ["soffit-crack", "loose-panel", "reshores-missing"],
      itemNames: {
        "soffit-crack": "a crack in the slab soffit running out from the column",
        "loose-panel": "a panel already hanging by one clip overhead",
        "reshores-missing": "reshore marks with no reshores staged at them",
      },
      itemNotes: {
        "soffit-crack": "A crack running out from the column face on the underside of the slab is something the engineer sees before stripping, not after. It is marked and reported, and the strip waits for an answer.",
        "loose-panel": "Somebody has already knocked the clips off one panel and left it hanging by the last one. It comes down first, under control, before anyone works beneath it.",
        "reshores-missing": "The reshoring plan's marks are chalked on the floor but the reshores are still on the truck. Stripping starts only when the reshores are staged beside their marks, because they go in the moment each strip comes out.",
      },
      title: "Walk the bay before a form moves",
      cue: "Walk under the bay: the slab's underside, the forms and their clips, the shores, and the reshore marks on the floor.",
      why: "A stripping crew is about to work directly under a slab and its forms, and the walk is where anything that makes that unsafe is found while nothing is moving yet. A crack in the soffit may mean the slab is not behaving as designed, a panel left hanging by one clip is a falling object waiting for its moment, and reshores that are not staged mean the bay would be left unsupported between strips.",
    },
    {
      id: "exclusion-zone", kind: "select", target: "exclusion-zone",
      title: "Set and sign the stripping exclusion zone",
      cue: "Close the bay with the barricade chain and post the danger sign on the signage pad, so nobody walks under forms coming down.",
      why: "Stripping drops things: panels, beams, clips and nails, from ceiling height, without warning. The exclusion zone keeps everyone not stripping out of the bay, and the sign on the pad says why in words anyone approaching can read. A zone that is only understood by the crew inside it protects nobody who wanders into it from the next bay.",
    },
    {
      id: "screw-jack", kind: "turn", target: "screw-jack",
      title: "Ease the first shore's screw jack down",
      cue: "Wind the screw jack on strip A's first shore down a little at a time, until the panel above lets go of the soffit.",
      why: "Forms are released by lowering their support, a small amount at a time, so the panel breaks free of the concrete under control and drops onto its own beams rather than off the soffit onto the floor. Winding the jack fast or knocking the shore out sends the whole strip down at once; easing it lets the crew see the panel release before anybody is underneath it.",
      turn: { turns: 1, label: "SCREW JACK", readout: (t) => (t < 0.95 ? "easing — panel still on the soffit" : "panel released") },
    },
    {
      id: "panel-lower", kind: "hold", target: "lowering-line", seconds: 5,
      title: "Lower the panel on its line",
      cue: "Hold the lowering line and let the panel down steadily onto the empty floor, standing outside the drop zone.",
      why: "A form panel that has let go of the soffit is a sheet of plywood on beams, hanging from a line, over a floor that must be empty. Held steady and let down slowly, it lands flat where it can be cleaned and carried off; dropped, it slides, bounces and breaks — and people get hurt in stripping mostly by forms coming down in a way nobody planned.",
      holdBreakNote: "The line went slack and the panel dropped the last half metre. Take up the line and let it down steadily.",
    },
    {
      id: "reshore-post", kind: "drag", target: "reshore-post",
      title: "Set a reshore at its mark before anything else comes out",
      cue: "Carry the reshore to its chalked mark under the stripped strip and stand it plumb under the slab.",
      why: "The reshoring plan puts a reshore under the slab where the engineer needs one, and it goes in straight after the strip above it is out — before the next strip is touched — so no part of the slab is left spanning further than its young concrete can. A reshore set a hand's width off its mark is supporting a point the engineer never checked.",
      drag: { to: "reshore-mark", radius: 0.4, missNote: "Not on the chalk mark — the reshore stands where the reshoring plan marks it, under the stripped strip." },
    },
    {
      id: "reshore-snug", kind: "gauge", target: "reshore-head",
      title: "Snug the reshore to the soffit — do not jack it",
      cue: "Take the reshore's screw up until its head is snug against the slab, and commit there: tight enough to carry, not jacking the slab.",
      why: "A reshore is snugged, never jacked: its job is to share load as the slab above is loaded, not to push the young slab up. Jacked, it lifts the slab off its neighbours and puts bending into concrete that is not ready for it; left loose, it carries nothing until the slab has already deflected onto it. Snug to the soffit is the only setting that does what the engineer's plan assumes.",
      gauge: {
        label: "RESHORE", speed: 0.72, green: [0.44, 0.58],
        readout: (t) => (t < 0.44 ? "loose — not touching the slab" : t <= 0.58 ? "snug to the soffit" : "jacking the slab"),
        missNote: "Not snug — loose it carries nothing, jacked it lifts the slab. Back it off and take it up again.",
      },
    },
    {
      id: "strip-order", kind: "sequence",
      targets: ["strip-b", "reshore-b", "strip-c", "reshore-c"],
      itemNames: { "strip-b": "strip B lowered", "reshore-b": "reshore under strip B", "strip-c": "strip C lowered", "reshore-c": "reshore under strip C" },
      outOfOrderNote: "Strip, reshore, strip, reshore — every strip has its reshore in before the next strip comes out.",
      title: "Strip and reshore the rest of the bay, one strip at a time",
      cue: "Lower strip B and reshore it, then lower strip C and reshore it — never two strips out without their reshores.",
      why: "Stripping is paced by the reshores. Two strips out with no reshore between them leaves the slab spanning twice as far as the plan allows at the moment it is least able to carry it, and the first sign would be a crack. Strip, reshore, strip, reshore keeps the slab supported at the plan's spacing the whole time the forms are coming down.",
    },
    {
      id: "stripped-find", kind: "find", noHint: true,
      targets: ["nails-up", "stack-on-reshore"],
      itemNames: { "nails-up": "stripped plywood lying nails-up in the walkway", "stack-on-reshore": "stripped panels leaned against a reshore" },
      itemNotes: {
        "nails-up": "A stripped panel has been dropped in the walkway with its nails pointing up. It is a puncture wound waiting for a boot; nails are pulled or bent over, and the panel goes to the laydown.",
        "stack-on-reshore": "Somebody has leaned a stack of panels against a reshore. A bump to that stack is a sideways kick at a post that is carrying the slab, and a reshore knocked out of plumb is carrying nothing.",
      },
      title: "Check the stripped forms and the floor",
      cue: "Look over what has come down: the panels, their nails, and where they have been left.",
      why: "The stripped material is its own hazard: plywood with nails still in it, beams and clips on the floor, and stacks put down wherever there was room. Left where they fall they injure feet and knock reshores; put where they belong, they are ready for the next lift. The check happens before the floor above is loaded, because a reshore disturbed during the pour is found out the hard way.",
    },
    {
      id: "panel-stack", kind: "drag", target: "panel-stack",
      title: "Carry the stripped panels to the laydown",
      cue: "Take the stack of stripped, de-nailed panels out of the bay and set it flat in the laydown area.",
      why: "Stripped forms go out of the bay and into the laydown flat, cleaned and de-nailed, so the reshored bay stays clear for the pour above and nothing is leaning against the posts carrying the slab. A tidy laydown is also where the carpenters check each panel for damage before it goes back up on the next deck.",
      drag: { to: "laydown", radius: 0.6, missNote: "Not in the laydown — the stripped panels go out of the bay into the marked laydown, not stacked by the reshores." },
    },
    {
      id: "pour-above", kind: "track", target: "reshore-monitor", seconds: 7,
      title: "Watch the reshores while the floor above is poured",
      cue: "Keep the reshore readings inside the plan's band as the pump places concrete on the deck above.",
      why: "The pour above is the moment the reshores were put in for: the wet concrete's weight comes down through the new deck's shores onto this young slab, and through it onto the reshores. Watching them — a load reading, a tap test, the deflection telltale — during the pour is how the crew sees a reshore that has gone loose or a slab taking more than the plan predicted, while there is still time to stop placing concrete.",
      track: { start: 0.2, green: [0.38, 0.58], rise: 0.54, fall: 0.46, drift: 0.13, label: "RESHORES", readout: (v) => (v < 0.38 ? "a reshore is unloading — loose" : v > 0.58 ? "reshores over the plan's load" : "sharing the load as planned") },
      holdBreakNote: "The reshore readings left the band while nobody watched. Find out which one, and bring it back before more concrete goes on.",
    },
    {
      id: "strip-log", kind: "select", target: "strip-log",
      title: "Log the strip",
      cue: "Record the ticket that released the bay, the reshores set, the soffit crack reported, the laborer who came under the barricade and the loose reshore during the pour.",
      why: "The strip log is how the engineer knows this bay was stripped on its own ticket and reshored to the plan, and it is where the soffit crack becomes a question the engineer has to answer before the reshores come out. It is written at the bay while the reshores are still in and the pour is still fresh, not reconstructed at the end of the week.",
    },
    {
      id: "crew-checkin", kind: "select", target: "pump-radio",
      title: "Check in with the crew and the pour foreman",
      cue: "Call the pour foreman: bay stripped, reshores in and holding. Then check in with the crew about the laborer under the forms and the loose reshore.",
      why: "The pour foreman only releases the next deck once the crew below confirms the reshores held, so this call sequences the job. It is also the crew's check-in: a laborer ducking under the barricade while a panel was coming down and a reshore going loose during a pour are the moments the crew replays that night, and the building trades' practice is to name them on the radio along with the member assistance line.",
    },
  ],

  interrupts: [
    {
      id: "laborer-under-forms",
      kind: "Worker inside the exclusion zone",
      after: "panel-lower", delay: 2, seconds: 12,
      alert: "A laborer has ducked under the barricade chain to grab a stripped beam — he is standing under the panel you are lowering.",
      cue: "Stop, get him out, and close the barricade behind him.",
      target: "exclusion-zone",
      why: "The exclusion zone only works if it is enforced the moment somebody breaks it. The panel stops where it is, the worker is called out, and the gap he came through is closed — the beam he wanted will still be there in five minutes, and the panel overhead is exactly what the zone was set up for.",
      missNote: "The laborer stayed under the panel for the rest of the lower; it slid off its beams at the last half metre and landed flat a step from where he stood.",
      wrongNote: "The barricade — there is a person under a panel coming down, and the zone has to be closed again now.",
    },
    {
      id: "reshore-loose",
      kind: "Reshore gone loose",
      after: "pour-above", delay: 2, seconds: 12,
      alert: "The reshore under strip B has gone loose as the pour moved over it — it rattles when tapped and the slab above is deflecting onto its neighbours.",
      cue: "Call the pour hold on the radio until the reshore is snugged again.",
      target: "pump-radio",
      why: "A loose reshore during a pour is carrying nothing, and its share of the wet concrete is going onto its neighbours and onto a young slab. The pump stops placing while the reshore is snugged again; a pour paused for a minute costs nothing, a pour that keeps going over an unsupported point can cost the slab.",
      missNote: "The pump kept placing over strip B; the slab deflected onto the loose reshore's neighbours until a hairline crack showed across the soffit between them.",
      wrongNote: "The pump radio — the concrete has to stop going on before the reshore can be made to carry again.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BFS_ACCENT);

    // ----------------------------------------------- floor, slab, columns
    const floorMat = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 4, base: "#8e8a82", base2: "#848078", seam: "rgba(0,0,0,0.12)" }), { repeat: 4, px: 512 }), { rough: 0.95, color: 0xe2ded4 });
    const floor = box(g, 9.0, 0.04, 7.0, 0, 0.02, -0.6, 0xffffff);
    floor.material = floorMat;
    const slab = box(g, 6.4, 0.22, 3.8, 0, BFS_SOFFIT + 0.11, -2.0, 0xffffff);
    slab.material = floorMat;
    for (const [x, z] of [[-3.0, -3.7], [3.0, -3.7], [-3.0, -0.3], [3.0, -0.3]]) { const c = box(g, 0.4, BFS_SOFFIT, 0.4, x, BFS_SOFFIT / 2, z, 0xffffff); c.material = floorMat; }
    const crack = decal(g, 1.0, 0.6, 2.4, BFS_SOFFIT - 0.005, -0.8, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(20,16,12,0.9)"; cx.lineWidth = 3;
      cx.beginPath(); cx.moveTo(w, h * 0.7); cx.lineTo(w * 0.7, h * 0.55); cx.lineTo(w * 0.45, h * 0.62); cx.lineTo(w * 0.1, h * 0.4); cx.stroke();
    }, { px: 256, transparent: true });
    crack.rotation.x = Math.PI / 2;
    const crackHit = box(g, 1.0, 0.1, 0.5, 2.4, BFS_SOFFIT - 0.06, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, crackHit, "soffit-crack");

    // ----------------------------------------------- form strips and shores
    const strips = BFS_STRIPS.map((x, i) => {
      const s = group(g, x, 0, -2.0);
      const panel = group(s, 0, BFS_SOFFIT, 0);
      box(panel, 1.7, 0.03, 3.4, 0, -0.015, 0, 0xc6a26a, { rough: 0.85 });
      for (const dx of [-0.5, 0.5]) box(panel, 0.08, 0.16, 3.4, dx, -0.11, 0, 0xb8bec4, { rough: 0.4, metal: 0.6 });
      const shores = [];
      for (const z of [-1.1, 1.1]) {
        const sh = group(s, 0, 0, z);
        cyl(sh, 0.035, 0.035, 1.4, 0, 0.7, 0, 0x5a6068, { rough: 0.5, metal: 0.5, seg: 10 });
        cyl(sh, 0.025, 0.025, 1.3, 0, 1.9, 0, 0x8a929a, { rough: 0.45, metal: 0.55, seg: 10 });
        shores.push(sh);
      }
      return { s, panel, shores, x, i };
    });
    const [stripA, stripB, stripC] = strips;
    // Strip A's first shore carries the screw jack the learner eases.
    const jackWheel = torus(stripA.shores[1], 0.07, 0.012, 0, 1.42, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 6, seg2: 16 });
    jackWheel.rotation.x = Math.PI / 2;
    holoTag(stripA.shores[1], "screw jack", 0, 1.62, 0.1, { css: BFS_CSS, w: 0.2 });
    reg(hits, jackWheel, "screw-jack");
    // The lowering line from strip A's panel down to a hand-hold outside the drop zone.
    const lowering = hose(g, [[-1.8, BFS_SOFFIT - 0.15, -1.0], [-2.2, 1.8, -0.4], [-2.4, 1.1, 0.4]], 0.01, 0xe8762b, { steps: 12, rough: 0.85 });
    void lowering;
    const lineHit = box(g, 0.25, 0.4, 0.25, -2.4, 1.1, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "lowering line — hold", -2.4, 1.45, 0.45, { css: BFS_CSS, w: 0.34 });
    reg(hits, lineHit, "lowering-line");
    // The panel already hanging by one clip, over strip C.
    const hanging = box(g, 0.6, 0.03, 0.8, 1.8, BFS_SOFFIT - 0.35, -3.1, 0xc6a26a, { rough: 0.85 });
    hanging.rotation.x = 0.5;
    reg(hits, hanging, "loose-panel");
    // Strip B and C controls for the sequence, and their reshores.
    const stripHits = {};
    for (const st of [stripB, stripC]) {
      const id = st.i === 1 ? "strip-b" : "strip-c";
      const h = box(g, 0.5, 0.4, 0.5, st.x, 1.2, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
      holoTag(g, st.i === 1 ? "strip B" : "strip C", st.x, 1.55, -0.85, { css: BFS_CSS, w: 0.16 });
      reg(hits, h, id);
      stripHits[id] = h;
    }
    const reshoreMarks = decal(g, 5.0, 0.6, 0, 0.045, -2.0, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(60,140,220,0.9)"; cx.lineWidth = 4;
      for (const x of BFS_STRIPS) { const px = w / 2 + (x / 5) * w; cx.beginPath(); cx.moveTo(px - 16, h / 2 - 16); cx.lineTo(px + 16, h / 2 + 16); cx.moveTo(px + 16, h / 2 - 16); cx.lineTo(px - 16, h / 2 + 16); cx.stroke(); }
    }, { px: 512, transparent: true });
    reshoreMarks.rotation.x = -Math.PI / 2;
    const markHit = box(g, 0.8, 0.06, 0.6, 1.2, 0.06, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, markHit, "reshores-missing");
    const reshores = BFS_STRIPS.map((x) => {
      const r = group(g, x, 0, -2.0);
      cyl(r, 0.03, 0.03, BFS_SOFFIT - 0.05, 0, (BFS_SOFFIT - 0.05) / 2, 0, 0x3c78c8, { rough: 0.5, metal: 0.5, seg: 10 });
      box(r, 0.16, 0.03, 0.16, 0, BFS_SOFFIT - 0.03, 0, 0x2a3138, { rough: 0.5, metal: 0.5 });
      r.visible = false;
      return r;
    });
    const reshoreHitB = box(g, 0.3, 0.5, 0.3, 0.3, 1.2, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reshore B", 0.3, 1.55, -1.95, { css: BFS_CSS, w: 0.18 });
    reg(hits, reshoreHitB, "reshore-b");
    const reshoreHitC = box(g, 0.3, 0.5, 0.3, 2.1, 1.2, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "reshore C", 2.1, 1.55, -1.95, { css: BFS_CSS, w: 0.18 });
    reg(hits, reshoreHitC, "reshore-c");
    const markSocket = box(g, 0.3, 0.05, 0.3, -1.8, 0.05, -2.0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["reshore-mark"] = markSocket;
    const headHit = box(g, 0.24, 0.24, 0.24, -1.8, BFS_SOFFIT - 0.15, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, headHit, "reshore-head");
    const post = group(g, -1.2, 0, 0.9, 1.2);
    const postBar = cyl(post, 0.03, 0.03, 2.2, 0, 0.05, 0, 0x3c78c8, { rough: 0.5, metal: 0.5, seg: 10 });
    postBar.rotation.z = Math.PI / 2;
    holoTag(post, "reshore", 0, 0.3, 0, { css: BFS_CSS, w: 0.14 });
    reg(hits, post, "reshore-post");

    // ----------------------------------------------- the exclusion zone and its sign
    const zone = group(g, 0, 0, 0.1);
    const zonePosts = [-3.0, -1.0, 1.0, 3.0].map((x) => cyl(zone, 0.03, 0.035, 1.0, x, 0.5, 0, 0xe4622a, { rough: 0.7, seg: 8 }));
    void zonePosts;
    const chain = hose(zone, [[-3.0, 0.9, 0], [-1.0, 0.82, 0], [1.0, 0.82, 0], [3.0, 0.9, 0]], 0.012, 0xd2312b, { steps: 16, rough: 0.6 });
    chain.visible = false;
    holoTag(zone, "exclusion zone", -2.0, 1.15, 0, { css: BFS_CSS, w: 0.26 });
    reg(hits, zone, "exclusion-zone");
    // The signage pad: an ANSI-format DANGER sign for the stripping zone.
    const pad = group(g, -2.9, 0, 1.35, 0.5);
    box(pad, 0.7, 0.04, 0.5, 0, 0.02, 0, 0x3a4550, { rough: 0.8 });
    cyl(pad, 0.025, 0.025, 1.5, 0, 0.75, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const signPanel = decal(pad, 0.5, 0.36, 0, 1.45, 0.03, (cx, w, h) => {
      cx.fillStyle = "#000"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#fff"; cx.fillRect(4, 4, w - 8, h - 8);
      cx.fillStyle = "#c8102e"; cx.fillRect(4, 4, w - 8, h * 0.3);
      cx.fillStyle = "#fff"; cx.font = `800 ${Math.round(h * 0.2)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("DANGER", w / 2, h * 0.19);
      cx.fillStyle = "#000"; cx.font = `700 ${Math.round(h * 0.11)}px Arial`;
      cx.fillText("FORMS BEING STRIPPED", w / 2, h * 0.5); cx.fillText("OVERHEAD — KEEP OUT", w / 2, h * 0.68); cx.fillText("OF THIS BAY", w / 2, h * 0.84);
    }, { px: 320 });
    signPanel.visible = false;
    holoTag(pad, "signage pad", 0, 0.25, 0.2, { css: BFS_CSS, w: 0.2 });

    // ----------------------------------------------- stripped material, laydown
    const nails = group(g, -0.6, 0, 0.75, 0.3);
    box(nails, 1.0, 0.025, 0.5, 0, 0.0125, 0, 0xc6a26a, { rough: 0.85 });
    for (let i = 0; i < 4; i++) cyl(nails, 0.004, 0.004, 0.06, -0.3 + i * 0.2, 0.05, 0.05 * (i % 2 ? 1 : -1), 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 4 });
    reg(hits, nails, "nails-up");
    const leaned = group(g, 2.25, 0, -1.75);
    const leanPanel = box(leaned, 0.05, 1.2, 0.8, 0, 0.6, 0, 0xc6a26a, { rough: 0.85 });
    leanPanel.rotation.z = -0.25;
    reg(hits, leaned, "stack-on-reshore");
    leaned.visible = false;
    const stack = group(g, 1.3, 0, 1.0, -0.2);
    for (let i = 0; i < 3; i++) box(stack, 1.0, 0.03, 0.6, 0, 0.015 + i * 0.035, 0, 0xc6a26a, { rough: 0.85 });
    holoTag(stack, "stripped panels", 0, 0.35, 0, { css: BFS_CSS, w: 0.26 });
    reg(hits, stack, "panel-stack");
    stack.visible = false;
    const laydown = decal(g, 1.6, 1.1, 3.6, 0.045, 1.6, (cx, w, h) => {
      cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(242,193,75,0.9)"; cx.lineWidth = 6; cx.strokeRect(4, 4, w - 8, h - 8);
      cx.fillStyle = "#f2c14b"; cx.font = `700 ${Math.round(h * 0.16)}px Arial`; cx.textAlign = "center"; cx.fillText("LAYDOWN", w / 2, h * 0.55);
    }, { px: 256, transparent: true });
    laydown.rotation.x = -Math.PI / 2;
    const laydownHit = box(g, 1.6, 0.05, 1.1, 3.6, 0.05, 1.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits.laydown = laydownHit;
    // Hazards: the pry bar under a panel, the next bay's shores, a reshore to pull.
    const bar = group(g, 0.6, 0, -1.2);
    const barRod = cyl(bar, 0.012, 0.012, 1.0, 0, 0.5, 0, 0x2b2f33, { rough: 0.5, metal: 0.6, seg: 6 });
    barRod.rotation.z = 0.2;
    holoTag(bar, "pry it off from below?", 0, 1.15, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, bar, "pry-overhead");
    const nextBay = group(g, 0, 0, -4.6);
    for (const x of [-1.8, 0, 1.8]) cyl(nextBay, 0.035, 0.035, BFS_SOFFIT, x, BFS_SOFFIT / 2, 0, 0x5a6068, { rough: 0.5, metal: 0.5, seg: 8 });
    box(nextBay, 6.0, 0.03, 1.2, 0, BFS_SOFFIT - 0.015, 0, 0xc6a26a, { rough: 0.85 });
    const nextHit = box(nextBay, 1.0, 0.8, 0.4, -1.8, 1.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(nextBay, "strip the next bay too?", -1.8, 1.7, 0.25, { css: "#d2312b", w: 0.42 });
    reg(hits, nextHit, "strip-next-bay");
    const underHit = box(g, 1.2, 0.02, 1.0, -1.8, 0.06, -1.3, 0x000000, { opacity: 0.22, transparent: true, cast: false });
    holoTag(g, "stand under the panel?", -1.5, 0.3, -1.0, { css: "#d2312b", w: 0.4 });
    reg(hits, underHit, "under-lowering-panel");
    const pullHit = box(g, 0.3, 0.4, 0.3, -1.8, 0.7, -2.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pull this reshore for the cart?", -1.8, 0.4, -1.75, { css: "#d2312b", w: 0.52 });
    reg(hits, pullHit, "pull-reshore");

    // ----------------------------------------------- the pump and the pour above
    const pump = concretePump(g, 4.6, 0, -1.9, { ry: 0, livery: { colour: 0xd8d8d0, fleetName: "CITY CONCRETE", unitNumber: "LP-7" } });
    void pump;
    hose(g, [[4.6, 0.8, 0.4], [3.9, 0.3, 0.2], [3.4, 1.5, -0.3], [3.3, BFS_SOFFIT + 0.4, -0.5], [2.6, BFS_SOFFIT + 0.35, -1.2]], 0.06, 0x2b2b2b, { steps: 24, rough: 0.8 });
    const pour = particles(g, 60, 0x9a968c, { size: 0.03, life: 0.6, additive: false, opacity: 0.8 });
    const pourOrigin = new THREE.Vector3(2.4, BFS_SOFFIT + 0.5, -1.4);
    const monitor = group(g, -0.9, 0, -0.6, 0.2);
    box(monitor, 0.04, 1.2, 0.04, 0, 0.6, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    box(monitor, 0.26, 0.18, 0.05, 0, 1.25, 0, 0x22262b, { rough: 0.5 });
    const monitorFace = decal(monitor, 0.24, 0.15, 0, 1.25, 0.026, signFace("RESHORES —", { bg: "#0d1c24", accent: BFS_CSS, fg: "#bfeaf7", scale: 0.3 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(monitor, "reshore monitor", 0, 1.48, 0, { css: BFS_CSS, w: 0.28 });
    reg(hits, monitor, "reshore-monitor");
    const standBox = box(g, 0.3, 0.9, 0.3, 2.2, 0.45, 1.8, 0x3a4550, { rough: 0.6 });
    void standBox;
    const pumpRadio = radio(g, 2.2, 0.9, 1.8, { ry: -0.4 });
    holoTag(g, "pump radio", 2.2, 1.25, 1.8, { css: BFS_CSS, w: 0.2 });
    reg(hits, pumpRadio, "pump-radio");

    // ----------------------------------------------- paper
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#171108"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BFS_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f7ecd8"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#efe2c8";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.12)));
    };
    const ticket = holoPanel(g, 0.95, 0.64, -2.3, 1.6, 2.1, panelDraw("STRENGTH TICKET — LEVEL 2, BAY 4", [
      "Releases: bay 4 only · bay 5 NOT released", "Field-cured result: meets the engineer's figure", "Strip: per the engineer's ticket",
      "Reshore per plan R-2 · snug, never jack", "Strip one strip, reshore it, then the next", "Signed: engineer of record",
    ]), { ry: 0.35, accent: BFS_ACCENT });
    reg(hits, ticket, "strength-ticket");
    const log = group(g, 0.4, 0, 2.4, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, panelDraw("STRIP LOG — BAY 4", ["Ticket: —", "Reshores: —", "Reported: —", "Pour above: —"]), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "strip log", 0, 1.62, 0, { css: BFS_CSS, w: 0.18 });
    reg(hits, log, "strip-log");

    // ----------------------------------------------- crew
    const partner = standingFigure(g, 0.9, 1.9, { ry: 2.9, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2, gloves: true, toolBelt: true });
    holoTag(partner, "carpenter", 0, 1.95, 0, { css: BFS_CSS, w: 0.2 });
    const laborer = standingFigure(g, -1.4, -1.3, { ry: 0.4, cloth: 0x5a4a3a, vest: 0xd8f23a, helmet: 0xf2f2f2, atStation: true });
    laborer.visible = false;

    const lowerStrip = (st) => { st.panel.position.y = 0.2; st.panel.rotation.x = 0.04; for (const sh of st.shores) sh.visible = false; };

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.8, -2.0),
      onStep(step) { if (step.id === "stripped-find") { leaned.visible = true; stack.visible = true; } },
      onStepComplete(step) {
        if (step.id === "bay-walk") { hanging.visible = false; reshoreMarks.material = mat(0x3c78c8, { rough: 0.8 }); markHit.visible = false; }
        if (step.id === "exclusion-zone") { chain.visible = true; signPanel.visible = true; }
        if (step.id === "panel-lower") lowerStrip(stripA);
        if (step.id === "reshore-post") { reshores[0].visible = true; post.visible = false; }
        if (step.id === "strip-order") { lowerStrip(stripB); lowerStrip(stripC); reshores[1].visible = true; reshores[2].visible = true; for (const h of Object.values(stripHits)) h.visible = false; }
        if (step.id === "stripped-find") { leaned.position.set(3.6, 0, 1.6); nails.children[0].material = mat(0x59c97b, { rough: 0.8 }); }
        if (step.id === "panel-stack") for (const st of strips) st.panel.visible = false;
        if (step.id === "pour-above") pour.visible = false;
        if (step.id === "strip-log") repaint(log.userData.face, panelDraw("STRIP LOG — BAY 4", ["Ticket: bay 4 released, bay 5 held", "Reshores: A, B, C set snug per plan", "Reported: soffit crack at column C4", "Pour above: reshore B re-snugged"], true));
        if (step.id === "crew-checkin") repaint(pumpRadio.userData.screen, signFace("BAY 4 DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "laborer-under-forms") { laborer.visible = true; chain.visible = false; }
        if (it.id === "reshore-loose") { reshores[1].rotation.z = 0.06; reshores[1].position.y = -0.04; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "laborer-under-forms") { laborer.position.set(-1.4, 0, 1.2); chain.visible = true; }
        if (it.id === "reshore-loose") { reshores[1].rotation.z = 0; reshores[1].position.y = 0; pour.visible = false; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (session?.turn && step?.id === "screw-jack") jackWheel.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "panel-lower" && session.holding) stripA.panel.position.y = BFS_SOFFIT - Math.min(1, (session.holdFor ?? 0) / 5) * (BFS_SOFFIT - 0.2);
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "reshore-snug") reshores[0].position.y = (gg.t - 0.5) * 0.06;
        const tr = session?.track;
        if (tr && step?.id === "pour-above") {
          if (!session.activeInterrupt || session.activeInterrupt.id !== "reshore-loose") pour.visible = true;
          repaint(monitorFace, signFace(tr.v < 0.38 ? "UNLOADING" : tr.v > 0.58 ? "OVER" : "SHARING", { bg: "#0d1c24", accent: tr.v >= 0.38 && tr.v <= 0.58 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.3 }));
        }
        if (pour.visible) pour.userData.step(dt ?? 0.016, pourOrigin, 0.2, 0.3, -2.0);
        void CITY;
      },
    };
  },
};
