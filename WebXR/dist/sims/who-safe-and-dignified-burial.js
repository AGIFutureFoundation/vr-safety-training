import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, paperFace, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure,
  surfaceTexture, texturedMat, mudflatFace, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Safe and Dignified Burial VR — Emergency Services, outbreak
// response. A burial team's visit to a family whose relative has died as a
// suspected case: roles assigned before the vehicle stops, the family met
// with a community or religious representative and their wishes heard, the
// team in PPE, the sprayer mixed to the protocol and pumped, the family's
// items found, the body placed and carried by the team together and never by
// one person, the grave marked so it can be found, a pause for the family's
// prayers, a supervised doff, and the burial recorded. Safety and dignity are
// taught as one procedure. Nothing about the pathogen is stated.

const WSB_ACCENT = 0xb8b0a0;
const WSB_ALERT = 0xf0645b;

function wsbBoard(parent, w, h, x, y, z, title, lines, o = {}) {
  return holoPanel(parent, w, h, x, y, z, (cx, cw, ch) => {
    cx.fillStyle = "rgba(18,16,12,0.92)"; cx.fillRect(0, 0, cw, ch);
    cx.fillStyle = o.css ?? "#b8b0a0"; cx.fillRect(0, 0, cw, 6);
    cx.fillStyle = "#f4f0e8"; cx.textAlign = "left"; cx.textBaseline = "middle";
    cx.font = `600 ${Math.round(ch * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
    cx.fillText(title, cw * 0.05, ch * 0.13);
    cx.font = `${Math.round(ch * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#ddd6c8";
    lines.forEach((l, i) => cx.fillText(l, cw * 0.05, ch * (0.3 + i * 0.1)));
  }, { ry: o.ry ?? 0, accent: o.accent ?? WSB_ACCENT });
}

export const SIM_WHO_SAFE_AND_DIGNIFIED_BURIAL = {
  id: "who-safe-and-dignified-burial",
  index: "225",
  domain: "Emergency Services",
  trade: "Burial team member — SEIU and AFSCME public-health staff, NNU/CNA nurses, and the humanitarian workforce deployed under IASC clusters",
  category: "Emergency Services",
  weather: "overcast",
  certification: "WHO safe and dignified burial practice as the national response adopts it — a trained team with assigned roles, the family engaged with a community or religious representative before anything is done, and dignity treated as part of safety; WHO infection prevention and control guidance for the team's PPE, chlorine solutions and handling of the body; CDC isolation precautions for the transmission-based precautions the team works under; OSHA 29 CFR 1910.1030 for body fluids and 29 CFR 1910.134 for the respirators worn; WHO outbreak communication guidance for what is said to the family and the neighbours; the Sphere Handbook's minimum standards and IASC cluster coordination for the partners who field burial teams; worked by SEIU and AFSCME public-health staff with NNU/CNA nurses",
  name: "Safe and Dignified Burial",
  title: simTitle("Safe and Dignified Burial"),
  tagline: "A burial team's visit: roles assigned, the family met with their community representative, PPE, the sprayer mixed to protocol, the family's items found, the body carried by the whole team, the grave marked, a pause for prayer, a supervised doff",
  accent: WSB_ACCENT,
  accentCss: "#b8b0a0",
  parSeconds: 330,
  footprint: 2.4,
  badge: { id: "safe-and-dignified", name: "Safe and Dignified", note: "The family heard first, the body carried by the whole team, the grave marked for the family to find, and every team member doffed under supervision" },

  supportLine: "your agency's staff welfare or staff counsellor service, or the peer-support contact named at your deployment briefing",

  game: system({
    name: "Burial Team",
    currency: "RESPECT",
    ranks: ["Team Trainee", "Burial Team Member", "Sprayer", "Team Leader", "Burial Team Certified"],
    badges: [
      { id: "family-first", name: "Family First", note: "The family meeting held to the end before anything else happened", test: AWARD.stepClean("family-meeting") },
      { id: "never-alone", name: "Never Alone", note: "No lone handling, no opened bag, no spray at the family, no guessed mix", test: AWARD.safe },
      { id: "mixed-true", name: "Mixed True", note: "Sprayer solution committed inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-burial", name: "Clean Burial", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "level-carry", name: "Level Carry", note: "Carried the stretcher level without a dropout", test: AWARD.unbroken },
      { id: "seven-straight", name: "Seven Straight", note: "Seven correct actions in a row", test: AWARD.streak(7) },
    ],
  }),

  hazards: {
    "wsb-lone-handling": "You started to lift the body on your own while the rest of the team was still gowning. A body handled without the team is a body handled without a sprayer standing by, without anyone watching your PPE and without the hands to lift it steadily — which is when bags tear, gloves split and fluids reach skin. The team moves the body together, every time.",
    "wsb-open-bag": "You began to unzip the closed, disinfected bag so a relative could look once more. Once the bag is closed and disinfected it stays closed; the family's chance to see their relative is agreed at the family meeting and given before the bag is closed, under the team's precautions — not by reopening it at the graveside.",
    "wsb-spray-family": "You swung the sprayer toward the mourners standing at the edge of the compound. Spraying chlorine at grieving people treats them as contamination, frightens them and is exactly the kind of moment that turns a community against burial teams. The sprayer is for the bag, the stretcher and the team's own PPE.",
    "wsb-guessed-mix": "You topped up the sprayer with a splash of concentrate that nobody measured. A chlorine solution mis-mixed fails both ways: too weak and it disinfects nothing while the team trusts it, too strong and it burns the team's skin and eyes through a long day. It is mixed to the protocol chart, measured.",
  },

  lateNotes: {
    "wsb-sprayer-pump": "Pump the sprayer once the solution has been mixed to the protocol; pressurising the wrong mix only sprays it further.",
    "wsb-stretcher": "The carry comes after the body is in the bag and the bag is disinfected — the team moves together, not before it is ready.",
  },

  steps: [
    {
      id: "team-brief", kind: "select", target: "wsb-team-board",
      title: "Assign the team's roles",
      cue: "Before the vehicle doors open, confirm who leads, who sprays, who carries and who speaks with the family.",
      why: "A burial team works as one unit in a place full of grief and attention, and the worst moments come from two people doing the same job while nobody does another. Roles fixed before arriving — a leader, a sprayer, the carriers and a team member who stays with the family — mean every step at the house has an owner.",
    },
    {
      id: "family-meeting", kind: "hold", target: "wsb-family-elder", seconds: 5,
      title: "Meet the family with their representative",
      cue: "With the community or religious representative beside you, explain what the team will do and hold while the family says what they want.",
      why: "The family is burying someone they love, and the response is asking them to do it differently from how they always have. Listening to what they need — prayers, an item placed with the body, a chance to see their relative, a grave they can find — and agreeing it before anything happens is what makes a safe burial one the family and the neighbours can accept.",
      holdBreakNote: "You moved on before the family had finished. Stay with them — their wishes decide how the rest of this visit goes.",
    },
    {
      id: "don", kind: "sequence",
      targets: ["wsb-don-coverall", "wsb-don-mask", "wsb-don-goggles", "wsb-don-gloves"],
      itemNames: { "wsb-don-coverall": "coverall", "wsb-don-mask": "respirator", "wsb-don-goggles": "goggles", "wsb-don-gloves": "gloves" },
      title: "Don the team's PPE",
      cue: "Coverall, then respirator, then goggles, then gloves over the cuffs — away from the family's view if you can.",
      why: "The team's PPE is built up in an order that leaves no gap: the body covering first, the respirator sealed to the face, eye protection over its straps, and gloves last so they pull over the cuffs. Doing it a little way off, out of the family's direct view, is part of treating their home as a home.",
      outOfOrderNote: "Coverall, respirator, goggles, gloves — gloves last over the cuffs.",
    },
    {
      id: "sprayer-mix", kind: "gauge", target: "wsb-sprayer-mix",
      title: "Mix the sprayer to the protocol",
      cue: "Measure the concentrate into the sprayer and commit when the level sits on the protocol chart's mark.",
      why: "The sprayer solution is the team's disinfection for the bag, the stretcher and their own PPE, and its strength is set on the protocol chart the IPC team issued. Measured to the mark it does its job all day; guessed, it either does nothing or burns the people wearing it.",
      gauge: { label: "MIX", speed: 0.55, green: [0.48, 0.58], readout: (t) => (t < 0.48 ? "under the chart mark" : t > 0.58 ? "over the mark" : "on the chart mark"), missNote: "Not on the chart's mark. Adjust and commit where the mix reads on the mark." },
    },
    {
      id: "pump-up", kind: "turn", target: "wsb-sprayer-pump",
      title: "Pump up the sprayer",
      cue: "Work the pump handle until the sprayer is at working pressure.",
      why: "A sprayer at working pressure delivers an even, controlled spray where it is aimed; one that is half pumped dribbles, and the sprayer ends up shaking it or pumping mid-task beside the body. Pressurising it now means the sprayer's attention is on the task, not the equipment.",
      turn: { turns: 1, axis: "y", label: "PUMP" },
    },
    {
      id: "family-items", kind: "find", noHint: true,
      targets: ["wsb-family-cloth", "wsb-family-photo"],
      itemNames: { "wsb-family-cloth": "the family's burial cloth", "wsb-family-photo": "the photograph for the grave" },
      itemNotes: {
        "wsb-family-cloth": "Folded on the bench by the door — the family asked for it to go with the body.",
        "wsb-family-photo": "Propped against the water jar — they want it on the grave marker.",
      },
      title: "Find the family's items",
      cue: "Find the items the family asked to go with their relative and to the grave.",
      why: "The items a family asks for are how they take part in a burial they cannot conduct themselves. Finding them before the body is moved, and handling them with the same care, is a small thing for the team and a large one for the family — and forgetting them is remembered for years.",
    },
    {
      id: "bag-body", kind: "select", target: "wsb-body-bag",
      title: "Place the body in the bag as a team",
      cue: "With every carrier in position and the sprayer ready, the team places the body and the family's cloth in the bag together.",
      why: "Placing the body is the moment of closest contact, and it is done by the whole team at once so that it is steady, quick and respectful, with the sprayer standing by for any spill. It is never done by one worker, and never before the team leader has checked every person's PPE.",
    },
    {
      id: "carry", kind: "track", target: "wsb-stretcher", seconds: 7,
      title: "Carry together, keep it level",
      cue: "Lift on the leader's word and keep the stretcher level all the way to the vehicle.",
      why: "A stretcher carried unevenly tips the weight toward one end and one person, and a carrier who stumbles puts their hand where it should not go. Lifting on one word and keeping it level shares the load, keeps the bag steady and gives the family a carry that looks careful because it is.",
      track: { start: 0.2, green: [0.4, 0.62], rise: 0.55, fall: 0.45, drift: 0.13, label: "LEVEL", readout: (v) => (v < 0.4 ? "head end dropping" : v > 0.62 ? "foot end dropping" : "level") },
      holdBreakNote: "The stretcher tipped. Steady it back to level before anyone takes another step.",
    },
    {
      id: "grave-marker", kind: "drag", target: "wsb-grave-marker",
      title: "Mark the grave",
      cue: "Carry the marker with the family's photograph to the head of the grave and set it in.",
      why: "A family that cannot find their relative's grave has lost them twice. The marker set at the head of the grave, with the name or code and the photograph they asked for, is what lets them come back — and it is recorded, so the grave can be found even if the marker is not.",
      drag: { to: "wsb-grave-socket", radius: 0.5, missNote: "Not at the head of the grave. The marker goes where the family will look for it." },
    },
    {
      id: "family-prayer", kind: "select", target: "wsb-prayer-point",
      title: "Pause for the family's prayers",
      cue: "Invite the family to the prayer point by the grave and stop while they pray.",
      why: "The prayer point is placed so the family can be close to the grave and see the burial without handling anything. Stopping for their prayers — the whole team still and quiet — is a small moment that tells the family and the neighbours watching that this was a burial, not a removal.",
    },
    {
      id: "doff", kind: "hold", target: "wsb-doff-point", seconds: 5,
      title: "Doff under supervision",
      cue: "At the doffing point, hold while the team leader talks each carrier through the doff and the sprayer disinfects between steps.",
      why: "After the carry, the outside of every coverall and glove is the most contaminated surface on site, and tired people doff badly. A supervised doff — one person at a time, talked through it, with the sprayer disinfecting between steps — is how the team leaves the compound without taking anything home.",
      holdBreakNote: "You moved away before the doff was done. Come back to the point and finish it under supervision.",
    },
    {
      id: "crew-checkin", kind: "select", target: "wsb-crew-board",
      title: "Check in with the burial team",
      cue: "In the vehicle, check in with each other about this one, and point anyone who needs it to staff care.",
      why: "Burial teams carry a weight that most of the response never sees — the family's grief, the neighbours' fear, sometimes hostility at the gate — and they do it several times a day. Checking in with each other before the next call, and naming staff care out loud, is part of the procedure, not a courtesy.",
    },
    {
      id: "closing-log", kind: "hold", target: "wsb-burial-log", seconds: 4,
      title: "Record the burial",
      cue: "Hold the burial log open and read back the case code, the grave location, the family present and the team before you sign.",
      why: "The burial record is how surveillance closes a case, how tracing knows who was present, and how a family finds the grave years from now. Read back before it is signed, the grave location and the names are right; signed unread, a family may be told the wrong row of a cemetery.",
      holdBreakNote: "You signed without reading it back. Open the log and read the grave location and names out before signing.",
    },
  ],

  interrupts: [
    {
      id: "mourners-approach",
      kind: "Mourners approach",
      after: "family-meeting", delay: 2, seconds: 13,
      alert: "While you talk with the family, two relatives move toward the house, wanting to wash and hold their relative the way they always have.",
      cue: "Ask the community representative to go with them to the viewing point — kindly, now.",
      target: "wsb-community-rep",
      why: "Touching and washing the body are the practices safe burial has to change, and asking grieving relatives to stop is hardest coming from a stranger in PPE. The community or religious representative can explain it in the family's terms and take them to where they can be close without contact — which is why they are part of the visit.",
      missNote: "Nobody went with them. The two relatives washed their relative before the team was ready, and both spent the following weeks on the contact list while the family's trust in the burial team went with them.",
      wrongNote: "Not that. Ask the community representative to go with the relatives to the viewing point.",
    },
    {
      id: "glove-tears",
      kind: "PPE breach",
      after: "carry", delay: 2, seconds: 13,
      alert: "Mid-carry, the carrier at the foot end calls out: his outer glove has split along the thumb.",
      cue: "Set the stretcher down, get the spare gloves to him, and send him to the doffing point to change under the sprayer.",
      target: "wsb-spare-gloves",
      why: "A breach is handled at once, not at the end of the carry: the stretcher goes down level, the sprayer covers the torn glove, and the carrier changes it at the doffing point with a spare while the team waits. Carrying on to the vehicle with a split glove is the moment an exposure becomes likely rather than possible.",
      missNote: "The team carried on with the split glove to the vehicle. By the time it was changed, the carrier's hand had been against the stretcher's wet handle for two minutes, and he spent the next weeks under follow-up.",
      wrongNote: "Not that. The spare gloves are on the PPE table — get them to the carrier.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, WSB_ACCENT);

    // ---------------------------------------------------------- ground, house front, grave
    const ground = box(g, 6.2, 0.06, 5.8, 0, 0.03, 0, 0xffffff, { rough: 0.95 });
    ground.material = texturedMat(
      surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#7e6a4e", base2: "#6e5c44", cracks: 50 }), { repeat: 3, px: 512 }),
      { rough: 0.95, metal: 0, color: 0xd8c8a8 },
    );
    const house = group(g, -1.6, 0, -2.2);
    box(house, 2.4, 2.1, 0.9, 0, 1.05, 0, 0xc8b08a, { rough: 0.9 });
    const roof = box(house, 2.7, 0.08, 1.3, 0, 2.2, 0.05, 0x8a8f94, { rough: 0.5, metal: 0.5 });
    roof.rotation.x = -0.1;
    box(house, 0.7, 1.6, 0.04, 0.5, 0.8, 0.46, 0x2a1e14, { rough: 0.9 });
    // Bench and water jar by the door.
    const bench = group(g, -0.6, 0, -1.55);
    box(bench, 0.9, 0.06, 0.3, 0, 0.42, 0, 0x7a5a3a, { rough: 0.8 });
    for (const lx of [-0.4, 0.4]) box(bench, 0.06, 0.42, 0.26, lx, 0.21, 0, 0x6a4a2a, { rough: 0.8 });
    const cloth = box(bench, 0.3, 0.05, 0.2, -0.2, 0.47, 0, 0xe8dcc0, { rough: 0.9 });
    reg(hits, cloth, "wsb-family-cloth");
    cyl(g, 0.18, 0.14, 0.55, -2.6, 0.28, -1.5, 0xa8643a, { rough: 0.8, seg: 12 });
    const photo = box(g, 0.1, 0.14, 0.01, -2.45, 0.62, -1.38, 0xe8e0d0, { rough: 0.5 });
    reg(hits, photo, "wsb-family-photo");

    // Grave: an earth mound and the open grave's dark mouth, at the front right.
    const grave = group(g, 1.8, 0, 1.3, -0.3);
    box(grave, 0.9, 0.04, 2.0, 0, 0.065, 0, 0x2a1e14, { rough: 1.0 });
    for (let i = 0; i < 5; i++) ball(grave, 0.3, 0.75, 0.12, -0.8 + i * 0.4, 0x6a5238, { rough: 1.0 });
    const graveSocket = box(grave, 0.4, 0.02, 0.3, 0, 0.08, -1.15, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["wsb-grave-socket"] = graveSocket;
    holoTag(grave, "Head of the grave", 0, 0.35, -1.15, { css: "#b8b0a0", w: 0.3 });
    const prayer = group(g, 0.6, 0, 2.2);
    box(prayer, 0.9, 0.01, 0.6, 0, 0.065, 0, 0x8aa08a, { rough: 0.8, opacity: 0.6, transparent: true, cast: false });
    const prayerSign = decal(prayer, 0.4, 0.14, 0, 1.1, -0.3, signFace("PRAYER POINT", { bg: "#1a1812", accent: "#b8b0a0", scale: 0.4 }), { px: 160 });
    cyl(prayer, 0.025, 0.025, 1.1, 0, 0.55, -0.32, 0x6a4a2a, { rough: 0.8, seg: 6 });
    reg(hits, prayerSign, "wsb-prayer-point");

    // ---------------------------------------------------------- the family and representative
    const elder = standingFigure(g, -2.3, -0.4, { ry: 0.9, cloth: 0x4a3a5a, atStation: true });
    holoTag(elder, "Family elder", 0, 1.95, 0, { css: "#b8b0a0", w: 0.24 });
    reg(hits, elder, "wsb-family-elder");
    const rep = standingFigure(g, -1.6, 0.2, { ry: 0.6, cloth: 0xe8e4da, atStation: true });
    holoTag(rep, "Community representative", 0, 1.95, 0, { css: "#b8b0a0", w: 0.4 });
    reg(hits, rep, "wsb-community-rep");
    const mournerA = standingFigure(g, -2.6, 0.7, { ry: 0.3, cloth: 0x2a2a3a, atStation: true });
    const mournerB = standingFigure(g, -2.0, 1.1, { ry: 0.2, cloth: 0x3a2a2a, atStation: true });
    const viewing = box(g, 0.8, 0.01, 0.6, -2.3, 0.065, 1.5, 0xb8b0a0, { rough: 0.8, opacity: 0.4, transparent: true, cast: false });
    void viewing;
    holoTag(g, "Viewing point", -2.3, 0.3, 1.5, { css: "#b8b0a0", w: 0.24 });

    // ---------------------------------------------------------- body under the awning, bag, stretcher
    const awning = group(g, 0.2, 0, -1.0);
    for (const [px, pz] of [[-0.8, -0.5], [0.8, -0.5], [-0.8, 0.5], [0.8, 0.5]]) cyl(awning, 0.03, 0.03, 2.0, px, 1.0, pz, 0x8a8f94, { rough: 0.5, metal: 0.4, seg: 6 });
    box(awning, 1.8, 0.03, 1.2, 0, 2.02, 0, 0xe8e4da, { rough: 0.8 });
    box(awning, 1.0, 0.02, 0.6, 0, 0.07, 0, 0x6a8a6a, { rough: 0.9 });
    const bag = group(g, 0.2, 0.08, -1.0);
    const bagBody = box(bag, 0.5, 0.18, 0.02, 0, 0.09, 0, 0xd8dcd8, { rough: 0.6 });
    box(bag, 0.52, 0.2, 1.7, 0, 0.1, 0, 0xd8dcd8, { rough: 0.6, opacity: 0.001, transparent: true, cast: false });
    const bagShape = box(bag, 0.48, 0.16, 1.6, 0, 0.08, 0, 0xc8ccc8, { rough: 0.6 });
    void bagBody; void bagShape;
    holoTag(bag, "Body bag", 0, 0.35, 0, { css: "#b8b0a0", w: 0.2 });
    reg(hits, bag, "wsb-body-bag");
    const openBag = box(bag, 0.2, 0.2, 0.2, 0, 0.3, -0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bag, "Unzip for one more look?", 0, 0.55, -0.7, { css: "#f0645b", w: 0.4 });
    reg(hits, openBag, "wsb-open-bag");
    const stretcher = group(g, 0.9, 0, 0.4, 0.2);
    for (const sx of [-0.28, 0.28]) cyl(stretcher, 0.02, 0.02, 2.1, sx, 0.4, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 }).rotation.x = Math.PI / 2;
    box(stretcher, 0.56, 0.02, 1.7, 0, 0.4, 0, 0x2f6a5a, { rough: 0.8 });
    for (const [lx, lz] of [[-0.28, -0.7], [0.28, -0.7], [-0.28, 0.7], [0.28, 0.7]]) cyl(stretcher, 0.015, 0.015, 0.4, lx, 0.2, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    holoTag(stretcher, "Stretcher", 0, 0.65, 0, { css: "#b8b0a0", w: 0.2 });
    reg(hits, stretcher, "wsb-stretcher");
    const lone = box(g, 0.2, 0.2, 0.2, 0.9, 1.2, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Lift it yourself?", 0.9, 1.4, -1.3, { css: "#f0645b", w: 0.3 });
    reg(hits, lone, "wsb-lone-handling");

    // ---------------------------------------------------------- the team, PPE table, sprayer
    const ppe = group(g, 1.6, 0, -1.4);
    box(ppe, 1.0, 0.05, 0.5, 0, 0.72, 0, 0x8a8f94, { rough: 0.5, metal: 0.3 });
    for (const [lx, lz] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]]) cyl(ppe, 0.015, 0.015, 0.72, lx, 0.36, lz, CITY.darkSteel, { rough: 0.5, seg: 6 });
    const donItems = [["wsb-don-coverall", -0.36, 0xf4f6f5, "Coverall"], ["wsb-don-mask", -0.12, 0xe8eef2, "Respirator"], ["wsb-don-goggles", 0.12, 0xcfe8f0, "Goggles"], ["wsb-don-gloves", 0.36, 0x3a8a5a, "Gloves"]];
    for (const [id, x, color, label] of donItems) {
      const it = group(ppe, x, 0.76, 0);
      box(it, 0.16, 0.06, 0.14, 0, 0.03, 0, color, { rough: 0.7 });
      holoTag(it, label, 0, 0.2, 0, { css: "#b8b0a0", w: 0.2 });
      reg(hits, it, id);
    }
    const spare = group(ppe, 0.3, 0.76, 0.2);
    box(spare, 0.12, 0.04, 0.1, 0, 0.02, 0, 0x3a8a5a, { rough: 0.7 });
    holoTag(spare, "Spare gloves", 0, 0.14, 0, { css: "#b8b0a0", w: 0.22 });
    reg(hits, spare, "wsb-spare-gloves");
    const sprayer = group(g, 2.5, 0, -0.5);
    cyl(sprayer, 0.14, 0.14, 0.55, 0, 0.3, 0, 0xe8eef2, { rough: 0.4, seg: 14 });
    const pumpHandle = group(sprayer, 0, 0.62, 0);
    cyl(pumpHandle, 0.015, 0.015, 0.2, 0, 0.1, 0, CITY.steel, { rough: 0.3, metal: 0.8, seg: 6 });
    box(pumpHandle, 0.16, 0.03, 0.03, 0, 0.2, 0, 0x2b3236, { rough: 0.5 });
    holoTag(sprayer, "Sprayer pump", 0, 1.0, 0, { css: "#b8b0a0", w: 0.24 });
    reg(hits, pumpHandle, "wsb-sprayer-pump");
    const mix = instrument(g, 2.45, 0.75, -1.0, { idle: "MIX", color: WSB_ACCENT, w: 0.14, d: 0.2 });
    box(g, 0.3, 0.72, 0.3, 2.45, 0.36, -1.0, 0x6a7a8a, { rough: 0.6 });
    holoTag(mix, "Sprayer mix", 0, 0.14, 0, { css: "#b8b0a0", w: 0.22 });
    reg(hits, mix, "wsb-sprayer-mix");
    const splash = group(g, 2.7, 0, -1.4);
    box(splash, 0.2, 0.3, 0.14, 0, 0.15, 0, 0xf2f2ee, { rough: 0.5 });
    holoTag(splash, "Splash more in?", 0, 0.45, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, splash, "wsb-guessed-mix");
    const sprayMourners = box(g, 0.3, 0.3, 0.3, -1.4, 1.2, 1.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "Spray toward the mourners?", -1.4, 1.45, 1.2, { css: "#f0645b", w: 0.42 });
    reg(hits, sprayMourners, "wsb-spray-family");
    // Team figures in coveralls.
    const carrierA = standingFigure(g, 1.6, -0.5, { ry: 2.6, cloth: 0xf4f6f5, vest: 0xf4f6f5, atStation: true });
    const tear = box(carrierA, 0.08, 0.08, 0.08, 0.25, 0.9, 0.05, WSB_ALERT, { emissive: WSB_ALERT, ei: 1.2, rough: 0.5 });
    tear.visible = false;
    standingFigure(g, 0.2, 0.9, { ry: Math.PI, cloth: 0xf4f6f5, vest: 0xf4f6f5, atStation: true });
    // Doffing point.
    const doff = group(g, 2.4, 0, 0.6);
    box(doff, 0.7, 0.01, 0.7, 0, 0.065, 0, WSB_ALERT, { rough: 0.6, opacity: 0.45, transparent: true, cast: false });
    const doffSign = decal(doff, 0.4, 0.14, 0, 1.1, -0.35, signFace("DOFFING POINT", { bg: "#2a1416", accent: "#f0645b", scale: 0.4 }), { px: 160 });
    cyl(doff, 0.025, 0.025, 1.1, 0, 0.55, -0.37, 0x8a8f94, { rough: 0.5, seg: 6 });
    reg(hits, doffSign, "wsb-doff-point");
    // Vehicle and marker.
    const truck = group(g, 3.0, 0, -2.6, 0);
    box(truck, 0.9, 1.0, 1.0, -0.7, 0.75, 0, 0xf4f6f5, { rough: 0.4, metal: 0.3 });
    box(truck, 1.4, 0.35, 1.0, 0.45, 0.5, 0, 0xe8eef2, { rough: 0.4, metal: 0.3 });
    for (const [wx, wz] of [[-0.7, -0.5], [0.7, -0.5], [-0.7, 0.5], [0.7, 0.5]]) cyl(truck, 0.2, 0.2, 0.12, wx, 0.2, wz, 0x1a1a1a, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const marker = group(g, 1.2, 0, -0.2);
    box(marker, 0.06, 0.8, 0.06, 0, 0.4, 0, 0x7a5a3a, { rough: 0.8 });
    box(marker, 0.3, 0.2, 0.03, 0, 0.72, 0, 0x8a6a4a, { rough: 0.8 });
    holoTag(marker, "Grave marker", 0, 1.0, 0, { css: "#b8b0a0", w: 0.24 });
    reg(hits, marker, "wsb-grave-marker");

    // Boards.
    const teamBoard = wsbBoard(g, 0.8, 0.52, -2.4, 1.6, -1.2, "TEAM ROLES — THIS VISIT", [
      "Team leader: checks every PPE, calls every lift", "Sprayer: bag, stretcher, team — never people", "Carriers: the whole team, together, always",
      "Family liaison: stays with the family", "Community representative: agreed",
    ], { ry: Math.PI / 3 });
    reg(hits, teamBoard, "wsb-team-board");
    const crewBoard = wsbBoard(g, 0.6, 0.4, -1.3, 1.5, 2.3, "TEAM CHECK-IN", ["How was this one?", "Staff care is there to use", "Talk before the next call"], { ry: Math.PI, accent: 0x7fd1c9, css: "#7fd1c9" });
    reg(hits, crewBoard, "wsb-crew-board");
    const burialLog = wsbBoard(g, 0.55, 0.4, 2.6, 1.5, 1.8, "BURIAL LOG", ["Case code · grave location", "Family present", "Team"], { ry: -Math.PI / 2.6 });
    reg(hits, burialLog, "wsb-burial-log");

    return {
      hits,
      footprint: 2.4,
      spawnLook: new THREE.Vector3(0, 0.9, -1.0),

      onStepComplete(step) {
        if (step.id === "don") for (const [id] of donItems) hits[id].visible = false;
        if (step.id === "family-items") { cloth.visible = false; }
        if (step.id === "bag-body") { bag.position.set(0.9, 0.44, 0.4); bag.rotation.y = 0.2; }
        if (step.id === "grave-marker") { photo.visible = false; }
        if (step.id === "closing-log") repaint(burialLog.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(18,16,12,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.fillStyle = "#eafcf1"; cx.font = `600 ${Math.round(h * 0.16)}px 'Barlow Condensed', Arial, sans-serif`;
          cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("BURIAL RECORDED", w / 2, h / 2);
        });
      },

      onInterrupt(it) {
        if (it.id === "mourners-approach") { mournerA.position.set(-1.2, 0, -1.2); mournerB.position.set(-0.8, 0, -0.5); }
        if (it.id === "glove-tears") { tear.visible = true; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "mourners-approach") { mournerA.position.set(-2.5, 0, 1.4); mournerB.position.set(-2.0, 0, 1.6); rep.position.set(-2.0, 0, 0.9); }
        if (it.id === "glove-tears") { tear.visible = false; carrierA.position.set(2.4, 0, 0.6); }
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt; void t;
        const step = session?.step;
        if (session?.turn && step?.id === "pump-up") pumpHandle.position.y = 0.62 + Math.abs(Math.sin(session.turn.amount * Math.PI * 4)) * 0.12;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "sprayer-mix") {
          const ok = gg.t >= 0.48 && gg.t <= 0.58;
          repaint(mix.userData.screen, signFace(ok ? "ON MARK" : gg.t < 0.48 ? "WEAK" : "STRONG", { bg: "#0d1c24", accent: ok ? "#59c97b" : "#f0645b", fg: "#eafcf9", scale: 0.55 }));
        }
        const tr = session?.track;
        if (tr && step?.id === "carry") stretcher.rotation.x = (tr.v - 0.51) * 0.3;
      },
    };
  },
};
