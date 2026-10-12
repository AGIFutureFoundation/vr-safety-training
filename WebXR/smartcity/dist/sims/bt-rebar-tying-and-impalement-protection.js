import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, decal, repaint, signFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure,
  reg, surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { skidSteer } from "../../../shared/equipment.js";
import { radio, tapeMeasure, angleGrinder } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Rebar Tying & Impalement Protection VR — Builders: Carpenters,
// Laborers and Masons.
//
// A wall footing already tied, with its wall dowels standing up out of it,
// and the slab mat in front of it about to be placed and tied. Reinforcing
// ironworkers place and tie the bars with LIUNA laborers carrying and capping,
// working off walk boards and never off the bars, with every protruding dowel
// guarded against impalement by caps or troughs that are rated for it — not
// the plastic mushroom caps that only stop a scratch. Bar sizes, spacing,
// laps and cover are "per the placing drawing"; this file states none of them.

const BRT_ACCENT = 0xd06a3a;
const BRT_CSS = "#d06a3a";
const BRT_DOWEL_X = [-2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4];
const BRT_DOWEL_Z = -3.0;

export const SIM_BT_REBAR_TYING_AND_IMPALEMENT_PROTECTION = {
  id: "bt-rebar-tying-and-impalement-protection",
  index: "322",
  domain: "Construction & Structural Trades",
  trade: "Reinforcing ironworker with LIUNA laborers — placing and tying a slab mat, guarding dowels",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "Ironworkers IMPACT reinforcing (rodbuster) apprenticeship and LIUNA Training laborer curricula; OSHA 29 CFR 1926.701 — protruding reinforcing steel guarded to eliminate the hazard of impalement — and 29 CFR 1926.703 for vertical reinforcing steel supported against collapse, under 29 CFR 1926 Subpart Q; ANSI A10.9 concrete and masonry construction safety; ACI 347 for the formwork the mat is tied into; the engineer's placing drawings and bar list",
  name: "Rebar Tying & Impalement Protection",
  title: simTitle("Rebar Tying & Impalement Protection"),
  tagline: "Placing and tying a slab mat beside a footing full of dowels: the placing drawing read, the dowels and chairs walked, rated impalement caps fitted, walk boards laid, chairs then bottom bars then top bars, the spacing checked, ties made with the tying tool, the column cage guyed, a bundle carried as a pair, the ties inspected and the mat tagged for the inspector",
  accent: BRT_ACCENT,
  accentCss: BRT_CSS,
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "capped-and-tied", name: "Capped And Tied", note: "Every dowel guarded against impalement, every intersection tied, and never a boot on a bar" },

  supportLine: "your Ironworkers or LIUNA local's member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Rod Gang",
    currency: "TIE",
    ranks: ["Apprentice", "Tier", "Placer", "Rod Gang Lead", "Rodbuster Certified"],
    badges: [
      { id: "rated-caps-only", name: "Rated Caps Only", note: "The mushroom caps and the bare dowel found first look", test: AWARD.stepClean("mat-walk") },
      { id: "carried-as-a-pair", name: "Carried As A Pair", note: "The bundle kept level between you and your partner all the way", test: AWARD.unbroken },
      { id: "never-on-the-bars", name: "Never On The Bars", note: "No boot on the bars, no hand in the tier, no grinder without its guard, no bundle carried alone", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-mat", name: "Clean Mat", note: "No corrections through the whole mat", test: AWARD.clean },
      { id: "spacing-on-the-drawing", name: "Spacing On The Drawing", note: "The spacing committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "mat-by-noon", name: "Mat By Noon", note: "Mat tied and tagged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "walk-on-bars": "You stepped out onto the bare bars instead of the walk boards. A mat of round bars rolls underfoot, the gaps between them catch a boot to the ankle, and a stumble on a mat beside a row of dowels ends on the dowels. The walk boards go down first and the crew moves on them.",
    "hand-in-tier": "You reached into the nose of the tying tool to clear the wire while it was still live. The tool wraps and twists the tie in a fraction of a second, and it does not know the difference between wire and a finger. It is switched off, or its battery pulled, before anything goes near the nose.",
    "grinder-no-guard": "You went to cut a bar with the angle grinder that has had its guard taken off. A cut-off wheel that shatters on a bar throws its pieces at the speed it was turning, and the guard is the only thing between them and the person holding it. The guard goes back on or the grinder goes out of service.",
    "carry-alone": "You went to shoulder the bar bundle on your own. A long bundle carried by one person swings at both ends — into the dowels, into the next worker — and puts a lifting load on one back that the crew is meant to share. Long bundles are carried by two, one at each end, or brought in by the machine.",
  },

  lateNotes: {
    "impalement-cap": "The rated caps go on once the walk has found which dowels are bare or under mushroom caps.",
    "tying-tool": "Ties are made once the bars are placed and the spacing checked against the drawing — tying first locks a wrong spacing in.",
    "rebar-log": "The mat is logged once the ties are inspected and every dowel is capped.",
  },

  steps: [
    {
      id: "placing-drawing", kind: "select", target: "placing-drawing",
      title: "Read the placing drawing and the bar list",
      cue: "Read the drawing: the bar marks and sizes, spacing both ways, laps, cover to the ground and the edges, the chair heights, and the dowels into the wall.",
      why: "A slab mat is built to the placing drawing because every bar in it is somewhere the engineer designed it to be: spacing and size set how much steel crosses each crack line, laps set how the force passes from one bar to the next, and cover keeps the steel deep enough in the concrete not to rust out. A mat built from memory can look identical and carry a fraction of the load, and nothing about it shows once the concrete is on.",
    },
    {
      id: "mat-walk", kind: "find", noHint: true,
      targets: ["mushroom-caps", "bare-dowel", "crushed-chair"],
      itemNames: {
        "mushroom-caps": "dowels under plastic mushroom caps where a worker could fall onto them",
        "bare-dowel": "a dowel with no cap at all",
        "crushed-chair": "a crushed chair letting the footing mat sag toward the ground",
      },
      itemNotes: {
        "mushroom-caps": "The dowels below the wall form's work platform carry plastic mushroom caps. Those stop a scratch from walking past; they do not stop a falling body. Where a fall onto the steel is possible, the cap or trough has to be one designed and rated to prevent impalement.",
        "bare-dowel": "One dowel in the row has lost its cap altogether. A bare vertical bar at waist height beside a walkway is the impalement hazard OSHA's concrete rule is written about.",
        "crushed-chair": "A chair under the footing mat has been stepped on and crushed, and the bars above it are sagging toward the ground. The cover the drawing requires is gone at that point; the chair is replaced and the mat lifted back before anyone calls it ready.",
      },
      title: "Walk the dowels and the footing mat",
      cue: "Walk the row of wall dowels and the tied footing: every cap, and every chair under the mat.",
      why: "Protruding steel is guarded wherever a worker could fall onto it, and OSHA 29 CFR 1926.701 puts that duty on the employer for exactly the row of bars in front of you. The walk also catches what the rest of the crew has done to the finished mat since it was tied — a crushed chair means the steel is sitting where the drawing says it must not, and it is fixed before the concrete makes it permanent.",
    },
    {
      id: "fit-caps", kind: "drag", target: "impalement-cap",
      title: "Fit the rated impalement trough over the dowel row",
      cue: "Carry the rated impalement trough to the dowel row below the work platform and seat it over the bar ends.",
      why: "An impalement trough or rated cap is built to spread the load of a falling body across the bar end instead of letting the bar go through it, which a thin plastic mushroom cannot do. It goes over every dowel a worker could fall onto — below a work platform, beside a walkway, at the foot of a ladder — and it stays on until the concrete buries the bars or the wall form covers them.",
      drag: { to: "dowel-row", radius: 0.6, missNote: "Not over the dowels — the trough seats over the row of bar ends below the work platform." },
    },
    {
      id: "walk-boards", kind: "select", target: "walk-boards",
      title: "Lay walk boards before anyone works the slab mat",
      cue: "Lay the plywood walk boards across the slab area so the crew moves on boards, not on bars.",
      why: "Walking on a mat means walking on round steel at uneven heights with gaps that catch a boot, and it is how ankles are broken and chairs crushed. Walk boards give the crew a flat, continuous surface and keep their weight off the chairs, so the mat stays at the height the drawing sets. They go down before the first bar is carried in.",
    },
    {
      id: "bar-placement", kind: "sequence",
      targets: ["chairs", "bottom-mat", "top-mat"],
      itemNames: { chairs: "chairs set on the grid", "bottom-mat": "bottom mat bars placed on the chairs", "top-mat": "top mat bars placed across them" },
      outOfOrderNote: "Chairs first, then the bottom mat on them, then the top mat — bars laid before the chairs sit on the ground with no cover at all.",
      title: "Place the chairs, then the bottom mat, then the top mat",
      cue: "Set the chairs on the drawing's grid, lay the bottom mat bars on them, then place the top mat bars across.",
      why: "The chairs set the cover under the bottom bars, so they go down first and to the drawing's height; bars laid on the ground and hooked up later rarely end up at the right height and never uniformly. The bottom mat goes on the chairs, the top mat across it, each at the drawing's spacing, so that the finished mat sits in the slab exactly where the engineer put the steel.",
    },
    {
      id: "spacing-check", kind: "gauge", target: "spacing-tape",
      title: "Check the bar spacing against the drawing",
      cue: "Run the tape across the bars and commit when the spacing reads inside the drawing's tolerance.",
      why: "Spacing is checked before the mat is tied, because once it is tied a wrong spacing is locked in and the only fix is cutting ties. Bars bunched on one side and spread on the other give the slab the right amount of steel in the wrong places; the tape across the mat against the drawing's spacing and tolerance is how the placer knows the steel is distributed the way it was designed.",
      gauge: {
        label: "SPACING", speed: 0.72, green: [0.44, 0.6],
        readout: (t) => (t < 0.44 ? "bars bunched — under the drawing" : t <= 0.6 ? "on the drawing's spacing" : "bars spread — over the drawing"),
        missNote: "Off the drawing's spacing — shift the bars and read the tape again before a tie goes on.",
      },
    },
    {
      id: "tie", kind: "hold", target: "tying-tool", seconds: 5,
      title: "Tie the intersections with the tying tool",
      cue: "Hold the tying tool square over each intersection and keep it there while it wraps and twists the tie.",
      why: "A tie holds two bars at their crossing so the mat stays where it was placed while concrete is dropped on it, vibrated and walked through. The tying tool makes a consistent tie only if it is held square and still until it finishes the twist; lifted early the tie is loose and the bars shift under the pour. Held down, it also spares the tier the thousands of wrist twists a day that hand tying costs.",
      holdBreakNote: "The tool came off before it finished the twist — that tie is loose. Put it back square and let it finish.",
    },
    {
      id: "guy-cage", kind: "turn", target: "turnbuckle",
      title: "Guy the column cage before anyone leaves it",
      cue: "Take up the turnbuckle on the column cage's guy until the cage stands plumb and cannot sway.",
      why: "A tall column or wall cage of tied bars is heavy at the top and flexible, and until it is braced into formwork it can fold over in a gust or when someone climbs or bumps it. OSHA 29 CFR 1926.703 requires vertical reinforcing steel for walls, piers and columns to be supported so it cannot overturn or collapse, and the guy is taken up to plumb before the crew turns its back on the cage.",
      turn: { turns: 1, label: "TURNBUCKLE", readout: (t) => (t < 0.95 ? "taking up the guy" : "cage plumb and guyed") },
    },
    {
      id: "carry", kind: "track", target: "bundle-carry", seconds: 6,
      title: "Carry the lap bars in as a pair",
      cue: "Carry the bundle of lap bars along the walk boards with your partner, keeping it level between you so neither end dips into the dowels.",
      why: "A bundle of long bars is carried by two people, one at each end, walking at the same pace along the boards. Kept level between them, the load is shared and the ends stay clear of the dowels and the workers either side; let one end dip or swing and the bars strike a dowel, a partner or a cage. It is a small version of every two-person lift on a job: the load is only as controlled as the pair carrying it.",
      track: { start: 0.2, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.13, label: "BUNDLE", readout: (v) => (v < 0.4 ? "your end dipping" : v > 0.6 ? "partner's end dipping" : "level between you") },
      holdBreakNote: "The bundle tipped out of level and one end swung toward the dowels. Steady it with your partner and carry on level.",
    },
    {
      id: "tie-inspect", kind: "find", noHint: true,
      targets: ["missing-ties", "short-lap"],
      itemNames: { "missing-ties": "a run of intersections left untied at the lap", "short-lap": "a lap splice shorter than the drawing's lap" },
      itemNotes: {
        "missing-ties": "A run of intersections along the lap has been skipped. The drawing's tie pattern holds the mat together through the pour; a loose run is where bars get pushed apart by the concrete and the vibrator.",
        "short-lap": "This splice overlaps by visibly less than the drawing's lap length. A lap passes force from one bar to the next only over its full length — short, it is a gap in the steel with concrete around it.",
      },
      title: "Inspect the ties and the laps",
      cue: "Walk the boards looking at the mat: the tie pattern at every lap, and each lap's length against the drawing.",
      why: "The crew inspects its own mat before the inspector does, because the defects that matter are the ones concrete will hide for good: an untied run that will shift under the pour and a lap that is short of the drawing's length. Both are quick to fix with the boards still down and impossible to fix with the slab poured, and neither is visible from the edge of the mat.",
    },
    {
      id: "tag-mat", kind: "select", target: "inspection-tag",
      title: "Tag the mat ready for the inspector",
      cue: "Hang the ready-for-inspection tag once the ties, laps, cover and caps are all done.",
      why: "The tag tells the inspector and the concrete crew the mat is finished to the drawing and every dowel near it is guarded, and it tells everyone else it is not yet released. A mat poured without its inspection is a mat nobody but the placers ever checked, and the tag is the point the crew puts its name to it.",
    },
    {
      id: "rebar-log", kind: "select", target: "rebar-log",
      title: "Log the mat",
      cue: "Record the bar marks placed, the chair replaced, the caps swapped to rated ones, the ties and the lap fixed, the skid steer stopped and the cap knocked off by the carry.",
      why: "The placer's log is how the inspection, the engineer and the next crew know what was built and what was corrected: the mushroom caps replaced with rated ones, the crushed chair, the short lap. It is also where the skid steer on the walk boards becomes a coordination item with the laydown, so the next delivery comes in from the side it should.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: mat tagged for inspection, dowels capped. Then check in with the crew about the skid steer and the bare dowel beside the walkway.",
      why: "The foreman books the inspection and the pour on this call, and the laborers move the walk boards to the next section around it. It is also the crew's check-in: a machine driven onto the walk boards and a bare dowel beside a walkway are the kind of close calls a crew carries home, and the trades' practice is to talk them through on the radio and name the member assistance line while they are fresh.",
    },
  ],

  interrupts: [
    {
      id: "skid-steer-on-boards",
      kind: "Machine driving onto the mat",
      after: "tie", delay: 2, seconds: 12,
      alert: "The skid steer bringing in a bar bundle has turned off the haul path and is driving onto the edge of the walk boards toward the crew tying.",
      cue: "Stop it with the stop signal before it reaches the mat.",
      target: "stop-paddle",
      why: "A skid steer's operator sees very little close in front of the bucket, and a crew bent over tying bars sees nothing behind them. The stop signal gets the machine held where it is before it crushes the chairs, the walk boards or a worker, and the delivery comes back around on the haul path.",
      missNote: "The skid steer rolled onto the edge of the mat; a front wheel crushed two chairs and pushed the walk board into the tier kneeling at its end.",
      wrongNote: "The stop paddle — there is a machine driving onto the crew, and it has to be stopped before anything else.",
    },
    {
      id: "cap-knocked-off",
      kind: "Dowel cap knocked off",
      after: "carry", delay: 2, seconds: 12,
      alert: "The end of the bundle has clipped the dowel row and knocked the trough off two of the dowels beside the walkway.",
      cue: "Refit a rated cap on the bare dowels from the cap bucket.",
      target: "cap-bucket",
      why: "A bare dowel beside a walkway is the impalement hazard the caps were there for, and it came back the moment the trough was knocked. It is recapped immediately, before anyone walks that way again — a hazard the crew has seen and walked past is one the next crew never knew about.",
      missNote: "The two dowels stayed bare beside the walkway; a laborer carrying chairs stumbled on the board edge and caught himself on the bar beside them.",
      wrongNote: "The cap bucket — the dowels beside the walkway are bare again, and they get capped before anyone passes them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BRT_ACCENT);

    // ----------------------------------------------- ground, footing, slab area
    const ground = box(g, 9.0, 0.04, 6.6, 0, 0.02, -0.8, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#6a5f4e", base2: "#5f5546", seam: "rgba(0,0,0,0.2)" }), { repeat: 5, px: 512 }), { rough: 0.98, color: 0xc8baa0 });
    const barrier = box(g, 5.6, 0.01, 1.9, 0, 0.045, -1.3, 0x2b3a3a, { rough: 0.6, metal: 0.1 });
    void barrier;
    for (const [w, d, x, z] of [[5.8, 0.05, 0, -0.33], [5.8, 0.05, 0, -2.27], [0.05, 1.9, -2.9, -1.3], [0.05, 1.9, 2.9, -1.3]]) box(g, w, 0.28, d, x, 0.14, z, 0xb88a52, { rough: 0.85 });
    const rebar = 0x7a4a2a;
    const barOpts = { rough: 0.7, metal: 0.4, seg: 6 };
    // The footing strip along the back, already tied, with its dowels.
    const footing = group(g, 0, 0, BRT_DOWEL_Z);
    for (const dz of [-0.2, 0.2]) { const b = cyl(footing, 0.012, 0.012, 5.6, 0, 0.14, dz, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    const sag = cyl(footing, 0.012, 0.012, 1.0, 1.5, 0.07, 0.3, rebar, barOpts);
    sag.rotation.z = Math.PI / 2 + 0.06;
    const crushedChair = box(footing, 0.08, 0.03, 0.08, 1.5, 0.03, 0.3, 0x9aa0a6, { rough: 0.5, metal: 0.5 });
    const chairHit = box(footing, 0.3, 0.2, 0.3, 1.5, 0.1, 0.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    void crushedChair;
    reg(hits, chairHit, "crushed-chair");
    const caps = [];
    BRT_DOWEL_X.forEach((x, i) => {
      cyl(footing, 0.012, 0.012, 1.0, x, 0.5, 0, rebar, barOpts);
      const cap = i === 6 ? null : cyl(footing, 0.035, 0.03, 0.05, x, 1.02, 0, i < 4 ? 0xf2a623 : 0xf2a623, { rough: 0.7, seg: 10 });
      caps.push(cap);
    });
    const mushroomHit = box(footing, 2.2, 0.2, 0.3, -1.5, 1.0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(footing, "mushroom caps", -1.5, 1.3, 0.1, { css: BRT_CSS, w: 0.24 });
    reg(hits, mushroomHit, "mushroom-caps");
    const bareHit = box(footing, 0.2, 0.3, 0.2, 1.2, 0.95, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, bareHit, "bare-dowel");
    const dowelRow = box(footing, 5.2, 0.2, 0.3, 0, 1.0, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["dowel-row"] = dowelRow;
    // The rated trough, staged on the ground, and where it lands.
    const trough = group(g, -2.3, 0, 1.2, 0.2);
    box(trough, 1.6, 0.06, 0.12, 0, 0.03, 0, 0xe8b02e, { rough: 0.6 });
    box(trough, 1.6, 0.02, 0.2, 0, 0.07, 0, 0x2b2b2b, { rough: 0.7 });
    holoTag(trough, "rated impalement trough", 0, 0.3, 0, { css: BRT_CSS, w: 0.4 });
    reg(hits, trough, "impalement-cap");
    const fitted = box(footing, 5.2, 0.06, 0.12, 0, 1.03, 0, 0xe8b02e, { rough: 0.6 });
    fitted.visible = false;
    const gapPiece = box(footing, 0.9, 0.061, 0.121, 1.5, 1.031, 0, 0xe8b02e, { rough: 0.6 });
    gapPiece.visible = false;
    const capBucket = group(g, -2.7, 0, 0.35);
    cyl(capBucket, 0.15, 0.12, 0.3, 0, 0.15, 0, 0xe8b02e, { rough: 0.7, seg: 12 });
    cyl(capBucket, 0.13, 0.13, 0.02, 0, 0.29, 0, 0x2b2b2b, { rough: 0.8, seg: 12 });
    holoTag(capBucket, "rated cap bucket", 0, 0.5, 0, { css: BRT_CSS, w: 0.28 });
    reg(hits, capBucket, "cap-bucket");
    // The work platform above the dowels (why the mushrooms are not enough) and its sign.
    const wallForm = group(g, 0, 0, BRT_DOWEL_Z - 0.55);
    box(wallForm, 5.8, 1.8, 0.05, 0, 0.9, 0, 0xc6a26a, { rough: 0.85 });
    box(wallForm, 5.8, 0.04, 0.45, 0, 1.5, 0.25, 0x9a7a4a, { rough: 0.9 });
    for (const x of [-2.6, 0, 2.6]) box(wallForm, 0.05, 0.9, 0.05, x, 1.95, 0.45, 0xf2c14b, { rough: 0.6 });
    const signPad = group(g, 3.3, 0, -1.9, -0.5);
    box(signPad, 0.6, 0.04, 0.4, 0, 0.02, 0, 0x3a4550, { rough: 0.8 });
    cyl(signPad, 0.025, 0.025, 1.4, 0, 0.7, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    decal(signPad, 0.5, 0.36, 0, 1.4, 0.03, (cx, w, h) => {
      cx.fillStyle = "#000"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#fff"; cx.fillRect(4, 4, w - 8, h - 8);
      cx.fillStyle = "#ffd100"; cx.fillRect(4, 4, w - 8, h * 0.3);
      cx.fillStyle = "#000"; cx.font = `800 ${Math.round(h * 0.2)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("CAUTION", w / 2, h * 0.19);
      cx.font = `700 ${Math.round(h * 0.11)}px Arial`;
      cx.fillText("IMPALEMENT HAZARD", w / 2, h * 0.5); cx.fillText("RATED CAPS ON EVERY", w / 2, h * 0.68); cx.fillText("EXPOSED DOWEL", w / 2, h * 0.84);
    }, { px: 320 });

    // ----------------------------------------------- the slab mat
    const matG = group(g, 0, 0, -1.3);
    const chairs = group(matG, 0, 0, 0);
    for (const x of [-2.0, 0, 2.0]) for (const z of [-0.5, 0.5]) box(chairs, 0.06, 0.1, 0.06, x, 0.1, z, 0x9aa0a6, { rough: 0.5, metal: 0.5 });
    chairs.visible = false;
    const bottom = group(matG, 0, 0, 0);
    for (let i = 0; i < 6; i++) { const b = cyl(bottom, 0.012, 0.012, 5.4, 0, 0.16, -0.75 + i * 0.3, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    bottom.visible = false;
    const top = group(matG, 0, 0, 0);
    for (let i = 0; i < 9; i++) { const b = cyl(top, 0.012, 0.012, 1.7, -2.4 + i * 0.6, 0.19, 0, rebar, barOpts); b.rotation.x = Math.PI / 2; }
    top.visible = false;
    // Bundles and the chair bag, staged at the front of the mat.
    const bagChairs = group(g, 1.2, 0, 0.5);
    box(bagChairs, 0.4, 0.2, 0.3, 0, 0.1, 0, 0x5a6a7a, { rough: 0.8 });
    holoTag(bagChairs, "chairs", 0, 0.35, 0, { css: BRT_CSS, w: 0.14 });
    reg(hits, bagChairs, "chairs");
    const bundleBottom = group(g, 0.0, 0, 0.55);
    for (let i = 0; i < 3; i++) { const b = cyl(bundleBottom, 0.014, 0.014, 2.0, 0, 0.05 + (i % 2) * 0.02, -0.03 + i * 0.03, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    holoTag(bundleBottom, "bottom bars", 0, 0.28, 0, { css: BRT_CSS, w: 0.2 });
    reg(hits, bundleBottom, "bottom-mat");
    const bundleTop = group(g, -1.2, 0, 0.6, 0.2);
    for (let i = 0; i < 3; i++) { const b = cyl(bundleTop, 0.014, 0.014, 2.0, 0, 0.05 + (i % 2) * 0.02, -0.03 + i * 0.03, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    holoTag(bundleTop, "top bars", 0, 0.28, 0, { css: BRT_CSS, w: 0.16 });
    reg(hits, bundleTop, "top-mat");
    // Walk boards, laid on the mat.
    const boards = group(g, 0, 0, -1.3);
    for (const x of [-1.5, 0.5]) box(boards, 0.6, 0.02, 1.8, x, 0.22, 0, 0xc6a26a, { rough: 0.85 });
    boards.visible = false;
    const boardStack = group(g, 2.2, 0, 1.2, -0.3);
    for (let i = 0; i < 2; i++) box(boardStack, 1.2, 0.02, 0.6, 0, 0.01 + i * 0.022, 0, 0xc6a26a, { rough: 0.85 });
    holoTag(boardStack, "walk boards", 0, 0.25, 0, { css: BRT_CSS, w: 0.2 });
    reg(hits, boardStack, "walk-boards");
    const bareBars = box(g, 1.0, 0.06, 0.6, 1.6, 0.18, -1.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step out on the bars?", 1.6, 0.45, -0.85, { css: "#d2312b", w: 0.36 });
    reg(hits, bareBars, "walk-on-bars");
    // The tape across the mat, the tying tool, the lap defects.
    const tape = tapeMeasure(g, -0.4, 0.2, -0.75, { ry: 0.1 });
    holoTag(g, "tape — spacing", -0.4, 0.4, -0.7, { css: BRT_CSS, w: 0.24 });
    reg(hits, tape, "spacing-tape");
    const tier = group(g, 0.5, 0.2, -1.0, 0.4);
    box(tier, 0.06, 0.22, 0.08, 0, 0.13, 0, 0xd06a3a, { rough: 0.5 });
    box(tier, 0.05, 0.05, 0.16, 0, 0.26, -0.04, 0x2b2f33, { rough: 0.5 });
    cyl(tier, 0.012, 0.018, 0.08, 0, 0.02, 0, 0x8b949d, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(tier, "tying tool — hold", 0, 0.4, 0, { css: BRT_CSS, w: 0.28 });
    reg(hits, tier, "tying-tool");
    const noseHit = box(tier, 0.08, 0.06, 0.08, 0, 0.0, 0.08, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(tier, "clear the nose by hand?", 0.1, -0.08, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, noseHit, "hand-in-tier");
    const untied = box(g, 0.6, 0.06, 0.2, -2.1, 0.19, -1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, untied, "missing-ties");
    const lap = group(g, 2.1, 0, -0.75);
    const lapBar = cyl(lap, 0.013, 0.013, 0.35, 0, 0.2, 0.03, 0xb0602e, barOpts);
    lapBar.rotation.z = Math.PI / 2;
    reg(hits, lap, "short-lap");
    lap.visible = false;
    // The column cage and its guy.
    const cage = group(g, -2.3, 0, -3.35);
    for (const [dx, dz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) cyl(cage, 0.012, 0.012, 2.6, dx, 1.3, dz, rebar, barOpts);
    for (const y of [0.6, 1.3, 2.0]) box(cage, 0.32, 0.012, 0.32, 0, y, 0, rebar, { rough: 0.7, metal: 0.4 });
    cage.rotation.z = 0.04;
    const guy = hose(g, [[-2.3, 2.3, -3.35], [-1.3, 1.2, -2.6], [-0.4, 0.1, -2.35]], 0.006, 0xc0c6cc, { steps: 6, rough: 0.4, metal: 0.7 });
    void guy;
    const turnbuckle = group(g, -0.7, 0.45, -2.45);
    cyl(turnbuckle, 0.02, 0.02, 0.16, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.5, seg: 8 }).rotation.z = 0.9;
    holoTag(turnbuckle, "cage guy — turnbuckle", 0, 0.25, 0.1, { css: BRT_CSS, w: 0.38 });
    reg(hits, turnbuckle, "turnbuckle");
    // The bundle carried as a pair, and the one to shoulder alone.
    const carried = group(g, -1.0, 0, -1.3);
    for (let i = 0; i < 3; i++) { const b = cyl(carried, 0.014, 0.014, 2.4, 0, 0.95 + (i % 2) * 0.02, -0.03 + i * 0.03, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    carried.visible = false;
    const carryHit = box(g, 0.4, 0.3, 0.3, -2.2, 0.95, -1.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "bundle — your end", -2.2, 1.25, -1.25, { css: BRT_CSS, w: 0.3 });
    reg(hits, carryHit, "bundle-carry");
    const alone = group(g, 2.6, 0, 0.3, -0.4);
    for (let i = 0; i < 4; i++) { const b = cyl(alone, 0.014, 0.014, 3.0, 0, 0.05 + (i % 2) * 0.02, -0.04 + i * 0.03, rebar, barOpts); b.rotation.z = Math.PI / 2; }
    holoTag(alone, "shoulder it alone?", 0, 0.3, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, alone, "carry-alone");
    const grinder = angleGrinder(g, 1.9, 0, 1.75, { ry: 0.3 });
    if (grinder.userData.parts?.guard) grinder.userData.parts.guard.visible = false;
    holoTag(g, "cut with the guard off?", 1.9, 0.25, 1.75, { css: "#d2312b", w: 0.4 });
    reg(hits, grinder, "grinder-no-guard");

    // ----------------------------------------------- the skid steer, paddle, radio, paper
    const skid = skidSteer(g, 5.6, 0, 1.0, { ry: -Math.PI / 2, livery: { colour: 0xd8a030, fleetName: "CITY REBAR", unitNumber: "SS-2" } });
    const paddle = group(g, 2.7, 0, 1.9, -0.6);
    cyl(paddle, 0.015, 0.015, 1.3, 0, 0.65, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const paddleFace = decal(paddle, 0.34, 0.34, 0, 1.4, 0.02, (cx, w, h) => {
      cx.fillStyle = "#c8102e"; cx.beginPath();
      for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; cx.lineTo(w / 2 + Math.cos(a) * w * 0.48, h / 2 + Math.sin(a) * h * 0.48); }
      cx.fill(); cx.fillStyle = "#fff"; cx.font = `800 ${Math.round(h * 0.26)}px Arial`; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("STOP", w / 2, h / 2);
    }, { px: 192, transparent: true });
    void paddleFace;
    holoTag(paddle, "stop paddle", 0, 1.7, 0, { css: BRT_CSS, w: 0.2 });
    reg(hits, paddle, "stop-paddle");
    const stand = box(g, 0.3, 0.9, 0.3, -1.3, 0.45, 2.2, 0x3a4550, { rough: 0.6 });
    void stand;
    const crewRadio = radio(g, -1.3, 0.9, 2.2, { ry: 0.3 });
    holoTag(g, "crew radio", -1.3, 1.25, 2.2, { css: BRT_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");
    const panelDraw = (title, rows, done = false) => (cx, w, h) => {
      cx.fillStyle = "#1a0f09"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRT_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#fbe9dc"; cx.fillText(title, w * 0.05, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = done ? "#d8f5e0" : "#f2dccc";
      rows.forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.12)));
    };
    const drawing = holoPanel(g, 0.95, 0.64, -2.8, 1.6, 1.9, panelDraw("PLACING DRAWING — SLAB S2 / FTG W1", [
      "Bar marks, sizes, spacing: per the bar list", "Laps: per the drawing, staggered", "Cover and chair heights: per the drawing",
      "Dowels W1: rated impalement caps or trough", "Walk boards before any bar is carried in", "Column C1 cage guyed until formed",
    ]), { ry: 0.55, accent: BRT_ACCENT });
    reg(hits, drawing, "placing-drawing");
    const tag = group(g, 2.95, 0, -0.6, -0.8);
    cyl(tag, 0.015, 0.015, 1.1, 0, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 8 });
    const tagFace = decal(tag, 0.22, 0.3, 0, 1.0, 0.02, signFace("NOT\nREADY", { bg: "#f2ae14", fg: "#1a1206", accent: "#1a1206", scale: 0.24 }), { px: 160 });
    holoTag(tag, "inspection tag", 0, 1.3, 0, { css: BRT_CSS, w: 0.24 });
    reg(hits, tag, "inspection-tag");
    const log = group(g, 0.3, 0, 2.45, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, panelDraw("PLACER'S LOG — S2", ["Bars: —", "Caps: —", "Fixed: —", "Stops: —"]), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "placer's log", 0, 1.62, 0, { css: BRT_CSS, w: 0.22 });
    reg(hits, log, "rebar-log");

    // ----------------------------------------------- crew
    const partner = standingFigure(g, 1.2, -0.05, { ry: -1.6, cloth: 0x3a2e28, vest: 0xf2c14b, helmet: 0xf2c14b, gloves: true, toolBelt: true });
    partner.position.y = 0.2;
    holoTag(partner, "partner", 0, 1.95, 0, { css: BRT_CSS, w: 0.16 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.6, -1.8),
      onStep(step) { if (step.id === "carry") carried.visible = true; if (step.id === "tie-inspect") lap.visible = true; },
      onStepComplete(step) {
        if (step.id === "mat-walk") { sag.rotation.z = Math.PI / 2; sag.position.y = 0.14; }
        if (step.id === "fit-caps") { fitted.visible = true; trough.visible = false; for (const c of caps) if (c) c.visible = false; }
        if (step.id === "walk-boards") { boards.visible = true; boardStack.visible = false; }
        if (step.id === "bar-placement") { chairs.visible = true; bottom.visible = true; top.visible = true; bagChairs.visible = false; bundleBottom.visible = false; bundleTop.visible = false; }
        if (step.id === "carry") carried.visible = false;
        if (step.id === "guy-cage") cage.rotation.z = 0;
        if (step.id === "tie-inspect") { untied.material = mat(0x59c97b, { opacity: 0.5, transparent: true, cast: false }); lapBar.scale.y = 2.2; }
        if (step.id === "tag-mat") repaint(tagFace, signFace("READY\nFOR INSP.", { bg: "#59c97b", fg: "#0f1b14", accent: "#0f1b14", scale: 0.2 }));
        if (step.id === "rebar-log") repaint(log.userData.face, panelDraw("PLACER'S LOG — S2", ["Bars: S2 top and bottom per the list", "Caps: mushrooms swapped for rated trough", "Fixed: chair, untied run, short lap", "Stops: skid steer on boards, cap knocked"], true));
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("MAT TAGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "skid-steer-on-boards") { skid.position.set(3.2, 0, 0.2); skid.rotation.y = -Math.PI / 2 - 0.3; }
        if (it.id === "cap-knocked-off") { fitted.scale.x = 0.62; fitted.position.x = -0.95; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "skid-steer-on-boards") { skid.position.set(5.9, 0, 1.6); skid.rotation.y = -Math.PI / 2; }
        if (it.id === "cap-knocked-off") { fitted.scale.x = 1; fitted.position.x = 0; gapPiece.visible = true; }
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "spacing-check") tape.position.x = -0.4 + (gg.t - 0.5) * 0.4;
        if (step?.id === "tie" && session.holding) tier.rotation.y = 0.4 + Math.sin(t * 30) * 0.05;
        if (session?.turn && step?.id === "guy-cage") { turnbuckle.rotation.y = session.turn.amount * Math.PI * 2; cage.rotation.z = 0.04 * (1 - Math.min(1, session.turn.amount)); }
        const tr = session?.track;
        if (tr && step?.id === "carry") { carried.rotation.z = (tr.v - 0.5) * 0.25; carried.position.x = -1.0 + Math.min(1, (tr.inBand ?? 0) / 6) * 1.2; }
        void CITY;
      },
    };
  },
};
