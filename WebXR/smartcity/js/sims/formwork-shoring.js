import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, standingFigure, cone, barrierPanel,
  surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Formwork Shoring VR — Construction & Structural Trades.
// Shoring a slab to the engineer's drawings: post shores set to the layout on
// mudsills, stringers and joists landed on the shore heads, every shore
// plumbed and pinned, the reshoring plan read before anything strips, and the
// pour that does not get released until the competent person has signed the
// shoring off. The slab above only exists because of what this crew builds
// underneath it first, and nobody upstairs ever sees it.

const FWS_ACCENT = 0xc9a36b;

export const SIM_FORMWORK_SHORING = {
  id: "formwork-shoring",
  index: "191",
  domain: "Construction",
  trade: "Carpenter — UBC",
  category: "Construction & Structural Trades",
  weather: "clear",
  certification: "United Brotherhood of Carpenters shoring and forming standards; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction — 1926.703 requirements for formwork and shoring; ACI 347 Guide to Formwork for Concrete; ANSI A10.9 concrete and masonry construction safety; the engineer of record's shoring and reshoring drawings",
  name: "Formwork Shoring",
  title: simTitle("Formwork Shoring"),
  tagline: "Shoring a slab to the engineer's drawings: mudsills and post shores to the layout, stringers and joists, every shore plumbed and pinned, the reshoring plan read, the pour held for sign-off, and stripping in the sequence the drawing sets",
  accent: FWS_ACCENT,
  accentCss: "#c9a36b",
  parSeconds: 290,
  footprint: 2.6,
  badge: { id: "deck-certified", name: "Deck Certified", note: "A shoring bay built to the drawing, plumbed, pinned and reshored on the engineer's own sequence — signed off before the first yard went in" },

  game: system({
    name: "Shoring Authority",
    currency: "PROP",
    ranks: ["Apprentice", "Formsetter", "Journeyman Carpenter", "Shoring Foreman", "Shoring Authority Certified"],
    badges: [
      { id: "sound-bearing", name: "Sound Bearing", note: "Every shore landed on a mudsill, never a block, first time", test: AWARD.stepClean("mudsills") },
      { id: "never-skipped", name: "Never Skipped a Reshore", note: "Never pulled a shore before the plan and the sign-off allowed it", test: AWARD.safe },
      { id: "plumb-and-pinned", name: "Plumb and Pinned", note: "Every shore read plumb inside tolerance", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-set", name: "Clean Set", note: "No corrections through the whole shoring bay", test: AWARD.clean },
      { id: "held-the-line", name: "Held The Line", note: "Watched the deck through the whole load without a break", test: AWARD.unbroken },
      { id: "signed-by-lunch", name: "Signed By Lunch", note: "Shored, plumbed and signed off inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "block-not-mudsill": "You set a shore's base plate on a concrete block instead of a mudsill. A block has no bearing area to spread the load and no give to tell you it is failing — it cracks under a point load a mudsill would have carried all day, and the shore leg it was under punches straight down when it lets go.",
    "climb-unbraced": "You worked up through a bay with no diagonal cross bracing installed. A shoring tower with stringers and joists on it but no bracing between the legs is a stack of compression members with nothing stopping it racking sideways — it stands under a straight-down load right up until someone's weight or a gust puts the smallest lateral push into it.",
    "strip-early": "You pulled a shore before the reshoring plan's cure interval was up and before the sign-off was on the board. Concrete gains strength on a curve, not a switch, and a slab stripped ahead of that curve is carrying dead load, live load and the next lift's wet concrete on a section that has not yet reached the strength the engineer's design assumes it has.",
    "shore-skip-row": "You pulled a whole row of shores at once instead of the staggered pattern the reshoring plan calls for. Reshores exist so the slab is never carrying its own weight unsupported while it is still gaining strength — skip the stagger and there is a span with nothing under it at the exact moment the floor above is depending on it.",
  },

  lateNotes: {
    "stringer-a": "Stringers go on once every shore under them reads plumb and the collars are snug — land one on a shore that has not been checked and the same error just moved up a level.",
    "signoff-panel": "The pour is not released until this sign-off is on the board, no matter how ready the truck outside looks.",
    "strip-joists": "Nothing comes down until the reshoring plan's interval has passed and this bay has been signed off to strip — cured concrete does not announce itself by looking finished.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "shoring-drawings",
      title: "Read the shoring drawings",
      cue: "Check the prop spacing, the mudsill bearing pressure and the ground condition the design assumes.",
      why: "The engineer sizes every shore, mudsill and reshore interval in this drawing to the specific pour above it — the lift height, the wet concrete load and the ground this bay actually sits on. Building from memory or from the last job's spacing is building to a design nobody checked against this slab.",
    },
    {
      id: "mudsills", kind: "sequence", anyOrder: true,
      targets: ["mudsill-a", "mudsill-b", "mudsill-c"],
      itemNames: { "mudsill-a": "west mudsill", "mudsill-b": "center mudsill", "mudsill-c": "east mudsill" },
      title: "Set the mudsills to the layout",
      cue: "Lay a mudsill under each chalked shore mark, square, on ground that will actually carry it.",
      why: "A post shore lands its whole share of the wet-concrete load on a base plate the size of a hand. The mudsill is what spreads that point load out over enough ground to carry it without settling — skip it and the shore is standing on whatever the bare ground happens to do under a few thousand pounds, which is never something you can see coming from the top.",
    },
    {
      id: "shore", kind: "drag", target: "post-shore",
      title: "Stand the last post shore",
      cue: "Carry the shore to its layout mark and land its base plate square on the mudsill.",
      why: "This shore closes the grid the stringers are about to land on. Set it off the chalk mark and every stringer and joist above it inherits the same offset, and a shore that is not centred on its mudsill is carrying its load off the plate's own bearing area — exactly the failure the mudsill was there to prevent.",
      drag: { to: "shore-socket", radius: 0.5, missNote: "Not on the mudsill — carry the shore back to its chalked mark before it takes any load." },
    },
    {
      id: "pins", kind: "sequence", anyOrder: true,
      targets: ["locate-pin-a", "locate-pin-b", "locate-pin-c"],
      itemNames: { "locate-pin-a": "west shore's locating pin", "locate-pin-b": "center shore's locating pin", "locate-pin-c": "east shore's locating pin" },
      title: "Seat the locating pin in every shore",
      cue: "Push the locating pin through the nearest matching holes in the outer sleeve and the inner leg on each shore.",
      why: "The screw collar only fine-tunes bearing; the pin is what actually carries the shore's load in shear once the collar is snugged down onto it. A shore standing on friction between the sleeve and the leg with no pin through it can telescope shut the moment a sustained load — like a slab of wet concrete that does not go away in a few seconds — is put on it.",
    },
    {
      id: "collar", kind: "turn", target: "screw-collar",
      title: "Take up the screw collar to bearing",
      cue: "Wind the screw collar down until it sits snug against the sleeve — no more, no less.",
      why: "The collar's job is to remove the last gap between the pin and full bearing, not to jack the shore or fight the pin's own position. Over-tightened it can rack the leg out of the pin holes it was just seated in; left loose the shore stands with slack in the column and takes a visible jolt of settlement the instant the stringers actually load it.",
      turn: { turns: 1, axis: "y", label: "SCREW COLLAR" },
    },
    {
      id: "stringers", kind: "sequence",
      targets: ["stringer-a", "stringer-b"],
      itemNames: { "stringer-a": "near stringer", "stringer-b": "far stringer" },
      title: "Set the stringers on the shore heads",
      cue: "Land the near stringer across the U-heads first, then the far one, and check both seat square in every head.",
      why: "The stringers are the first thing to actually load the shores, so they only go on once every head under them is plumbed, pinned and snugged — a stringer landed across an unchecked line of shores is the first real test of a column nobody has proven yet, with a crew standing on it while it happens.",
      outOfOrderNote: "Near stringer first, then the far one — the far line is the one nobody is standing over yet if a head is not seated right.",
    },
    {
      id: "joists", kind: "sequence",
      targets: ["joist-1", "joist-2", "joist-3"],
      itemNames: { "joist-1": "west joist", "joist-2": "center joist", "joist-3": "east joist" },
      title: "Set the joists across the stringers",
      cue: "Run the joists west to east across both stringers, full bearing on each end.",
      why: "The joists are what the deck sheathing actually rests on, and a joist with only a few inches of its end on the stringer is a joist that can roll or drop the moment sheathing and wet concrete put a load on it that is not perfectly centred. West to east keeps the crew working off the section that is already fully supported instead of reaching out over open stringer.",
      outOfOrderNote: "West to east — working out over an unjoisted stringer to reach the far end first leaves nothing solid to stand on.",
    },
    {
      id: "plumb", kind: "gauge", target: "level-tool",
      title: "Plumb every shore line",
      cue: "Read the level against each shore and commit only when the whole line is inside tolerance.",
      why: "A shore that is a few degrees off plumb is not carrying its load straight down the column it was designed for — it is carrying part of that load sideways into the pin and the collar, and that share grows the longer the shore stays loaded, not shrinks. Checked and adjusted now, before the deck closes over it, is the only time it is still easy to fix by hand.",
      gauge: { label: "PLUMB", speed: 0.72, green: [0.44, 0.6], readout: (t) => `${((t - 0.52) * 38).toFixed(1)} mm/m`, missNote: "Out of plumb — adjust the shore and read the level again before it takes any load." },
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["gap-under-mudsill", "loose-stringer-cleat", "joist-short-bearing"],
      itemNames: { "gap-under-mudsill": "void under a mudsill", "loose-stringer-cleat": "unnailed stringer cleat", "joist-short-bearing": "joist with a short bearing" },
      itemNotes: {
        "gap-under-mudsill": "The center mudsill has settled unevenly and there is a visible gap under one corner — it is only bearing on part of itself.",
        "loose-stringer-cleat": "The cleat that is supposed to stop the near stringer from walking sideways was never nailed off.",
        "joist-short-bearing": "The center joist has barely an inch of its end resting on the far stringer instead of full bearing.",
      },
      title: "Walk the shoring before the deck closes in",
      cue: "Walk every shore, stringer and joist and click anything that is not fit to take the pour.",
      why: "Every one of these is a five-minute fix with the deck still open and no load on it. Found after the sheathing goes down and the rebar mat is tied on top, the same defects are hidden under the exact load they cannot carry — a short-bearing joist rolls off its stringer the moment the pour reaches it, not before.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["sill-packed", "cleat-nailed", "joist-reseated"],
      itemNames: { "sill-packed": "mudsill shimmed solid", "cleat-nailed": "cleat nailed off", "joist-reseated": "joist reseated to full bearing" },
      title: "Correct what the walk found",
      cue: "Shim the sill solid, nail the cleat, and slide the joist back to full bearing.",
      why: "A defect the walk found and nobody corrected is worse than one nobody spotted, because now the whole crew believes the walk happened and the deck is safe to load — when the only thing that actually happened is somebody wrote it on a clipboard.",
    },
    {
      id: "reshore", kind: "select", target: "reshoring-plan",
      title: "Read the reshoring plan",
      cue: "Check which shores stay, which come out first, and the strength result required before any of it moves.",
      why: "Stripping formwork does not mean the slab is done needing support — it means support switches from shoring rated for wet concrete to reshores rated for a slab that is still gaining strength under load from the floors going up above it. The plan says which shores that is and in what order, and it is not a decision the crew improvises on strip day.",
    },
    {
      id: "signoff", kind: "select", target: "signoff-panel",
      title: "Get the competent person's sign-off",
      cue: "Have the shoring inspected against the drawing and get the tag on the board before the pour is called for.",
      why: "The sign-off is the competent person's claim that every mudsill, pin, collar, stringer and joist in this bay was actually checked against the drawing, not assumed from how the deck looks from underneath. The pour does not get released until that tag is on the board, no matter what is already staged outside.",
    },
    {
      id: "watch", kind: "track", target: "deflection-gauge", seconds: 7,
      title: "Watch the shoring while the deck is loaded",
      cue: "Keep the deflection reading inside the design band as the pour comes down onto this bay.",
      why: "The shoring drawing's numbers are a prediction; the deflection gauge is what tells you the bay is actually behaving the way the engineer expected once real weight is on it. A reading drifting out of band mid-pour is the shoring telling you something before it becomes something a crew standing underneath finds out the hard way.",
      track: { start: 0.14, green: [0.36, 0.56], rise: 0.55, fall: 0.5, drift: 0.12, label: "SHORE DEFLECTION", readout: (v) => (v < 0.36 ? "settling" : v > 0.56 ? "over the design band" : "inside the design band") },
      holdBreakNote: "Deflection ran out of band and nobody was watching it. Bring it back and hold there for the rest of the pour.",
    },
    {
      id: "strip", kind: "sequence",
      targets: ["strip-joists", "strip-stringers", "strip-shores"],
      itemNames: { "strip-joists": "joists stripped", "strip-stringers": "stringers stripped", "strip-shores": "shores stripped, reshores in" },
      title: "Strip in the drawing's sequence",
      cue: "Strip the joists, then the stringers, then the shores — reshores go in as each shore comes out.",
      why: "Stripping top-down is the only order that never leaves a member carrying a span it was not designed to carry alone, and a reshore goes in the instant each shore comes out so the slab is never unsupported, even for the few minutes it takes to swap one prop for another.",
      outOfOrderNote: "Joists first, then stringers, then shores with reshores following them in — pulling a shore while its stringer and joists are still hanging on it loads members that were never meant to span on their own.",
    },
  ],

  interrupts: [
    {
      id: "corner-pin-out",
      kind: "Shore unpinned",
      after: "joists", delay: 3, seconds: 12,
      alert: "The corner shore back at the far stringer has kicked loose — its locating pin has worked itself out while the crew was setting the last joist, and that leg is standing on friction alone now.",
      cue: "That shore has no pin in it and it is already carrying a stringer.",
      target: "corner-pin",
      why: "A pin that walks out under vibration does not announce itself — the shore looks exactly the same standing on friction as it did standing on the pin, right up until the load it is carrying is enough to make the sleeve start to slip. Reseating it now, before the joists above are loaded any further, is the only point where this is a five-second fix instead of a leg that telescopes shut under a crew.",
      missNote: "The corner shore stayed unpinned while the crew kept building on top of it. A shoring column standing on friction between the sleeve and the leg holds nothing once a sustained load — wet concrete does not go away in a few seconds — finally overcomes it, and it goes without warning because nothing about how it looks changes first.",
      wrongNote: "It's the corner pin. Reseat it before anything else goes on top of that shore.",
    },
    {
      id: "truck-early",
      kind: "Pour truck early",
      after: "reshore", delay: 3, seconds: 12,
      alert: "A ready-mix truck has pulled onto the pad with the drum already turning and the chute half unfolded toward this bay — nobody has signed the shoring off yet.",
      cue: "That truck is staging to pour a bay that has not been signed off.",
      target: "hold-flag",
      why: "A truck on site with a live load is its own kind of pressure — every minute it sits there is a minute somebody is tempted to call the pour ready because the concrete is, not because the shoring is. Raising the hold flag is what tells the driver and the crew this bay is not releasing the pour yet, out loud, before anyone starts unspooling more chute toward it.",
      missNote: "The truck sat there with the chute coming out and the pour went ahead on a bay with no sign-off on the board. The sign-off exists because a shoring bay that looks finished and a shoring bay that has actually been checked against the drawing look identical from where the chute operator is standing.",
      wrongNote: "Raise the hold flag. The truck being ready is not the same thing as the shoring being signed off.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, FWS_ACCENT);

    // ------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.1, 5.4, 0, 0.05, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#454138", base2: "#39362e", seam: "rgba(0,0,0,0.45)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xc7bfa6 },
    );

    // -------------------------------------------------------------- shore
    // One post shore: base plate, outer sleeve, inner leg, U-head, locating
    // pin and screw collar. `withCollar` draws the fine-tune collar this
    // grid only needs modelled once (the graded turn control).
    function shore(parent, x, z, { pinned = true, withCollar = false } = {}) {
      const sh = group(parent, x, 0, z);
      const plate = box(sh, 0.16, 0.02, 0.16, 0, 0.11, 0, CITY.steel, { rough: 0.5, metal: 0.6 });
      const sleeve = cyl(sh, 0.045, 0.045, 1.05, 0, 0.64, 0, 0x5a6068, { rough: 0.5, metal: 0.5, seg: 14 });
      const leg = cyl(sh, 0.033, 0.033, 1.15, 0, 1.72, 0, 0x7f8792, { rough: 0.45, metal: 0.55, seg: 12 });
      const uhead = box(sh, 0.22, 0.05, 0.1, 0, 2.32, 0, 0x5a6068, { rough: 0.5, metal: 0.5 });
      let collar = null;
      if (withCollar) {
        collar = group(sh, 0, 1.14, 0);
        cyl(collar, 0.06, 0.06, 0.05, 0, 0, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 16 });
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          box(collar, 0.09, 0.014, 0.014, Math.sin(a) * 0.06, 0, Math.cos(a) * 0.06, 0xe8b02e, { rough: 0.5, metal: 0.4 });
        }
      }
      const pin = box(sh, 0.09, 0.02, 0.02, 0, 1.14, 0.05, pinned ? 0xf2c14b : 0x2b2f34, { rough: 0.6, metal: 0.4 });
      pin.visible = pinned;
      return { sh, plate, sleeve, leg, uhead, collar, pin };
    }

    function mudsillMesh(parent, x, z, color = 0x8b6a42) {
      return box(parent, 0.34, 0.05, 0.34, x, 0.125, z, color, { rough: 0.9 });
    }

    // Back row (far stringer line) — already erected earlier in the shift,
    // static backdrop the far stringer and the joists rest on.
    const backRowX = [-1.0, 0, 1.0];
    const backShores = backRowX.map((x) => { mudsillMesh(g, x, -0.55); return shore(g, x, -0.55); });
    // The corner shore's pin is the interrupt's target: seated at rest, kicked
    // loose only when the interruption fires.
    const cornerShore = backShores[2];
    reg(hits, cornerShore.pin, "corner-pin");

    // Front row (near stringer line) — the bay the crew is actively shoring.
    const westShore = shore(g, -1.0, 0.55);
    const centerShore = shore(g, 0, 0.55);
    reg(hits, mudsillMesh(g, -1.0, 0.55), "mudsill-a");
    reg(hits, mudsillMesh(g, 0, 0.55), "mudsill-b");
    const eastMudsill = mudsillMesh(g, 1.0, 0.55);
    reg(hits, eastMudsill, "mudsill-c");
    reg(hits, westShore.pin, "locate-pin-a");
    reg(hits, centerShore.pin, "locate-pin-b");

    // The last shore, staged lying on the ground beside its mudsill until
    // dragged upright — the same lying/standing swap scaffold-erection uses.
    const lastShore = shore(g, 2.1, 1.5, { pinned: false, withCollar: true });
    lastShore.sh.rotation.x = -Math.PI / 2;
    lastShore.sh.position.set(2.1, 0.045, 1.5);
    holoTag(lastShore.sh, "post shore", 0, 0.5, 0.3, { css: "#c9a36b", w: 0.26 });
    reg(hits, lastShore.sh, "post-shore");
    const shoreSocket = box(g, 0.3, 0.02, 0.3, 1.0, 0.11, 0.55, 0xffffff, { rough: 0.5 });
    shoreSocket.visible = false; hits["shore-socket"] = shoreSocket;
    reg(hits, lastShore.pin, "locate-pin-c");
    reg(hits, lastShore.collar, "screw-collar");
    holoTag(lastShore.collar, "screw collar", 0, 0.18, 0, { css: "#c9a36b", w: 0.24 });

    // ---------------------------------------------------------- stringers
    const stringerA = box(g, 2.6, 0.09, 0.09, 0, 2.36, 0.55, 0xb08a52, { rough: 0.85, opacity: 0.25, transparent: true });
    reg(hits, stringerA, "stringer-a");
    holoTag(g, "near stringer", 0, 2.55, 0.55, { css: "#c9a36b", w: 0.3 });
    const stringerB = box(g, 2.6, 0.09, 0.09, 0, 2.36, -0.55, 0xb08a52, { rough: 0.85, opacity: 0.25, transparent: true });
    reg(hits, stringerB, "stringer-b");
    holoTag(g, "far stringer", 0, 2.55, -0.55, { css: "#c9a36b", w: 0.28 });

    // -------------------------------------------------------------- joists
    const joists = {};
    for (const [id, x] of [["joist-1", -1.0], ["joist-2", 0], ["joist-3", 1.0]]) {
      const j = box(g, 0.07, 0.14, 1.3, x, 2.44, 0, 0xc49a5e, { rough: 0.8, opacity: 0.25, transparent: true });
      joists[id] = j; reg(hits, j, id);
    }
    // The short-bearing find lives on the center joist, offset toward the
    // near stringer until the walk step corrects it.
    joists["joist-2"].position.z = -0.18;
    const shortBearingHit = box(g, 0.14, 0.2, 0.2, 0, 2.44, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "short bearing", 0, 2.7, -0.6, { css: "#d2312b", w: 0.3 });
    reg(hits, shortBearingHit, "joist-short-bearing");

    // Deck sheathing — appears once the joists are complete.
    const sheathing = [];
    for (let i = -1; i <= 1; i++) {
      const s = box(g, 0.85, 0.03, 1.3, i * 0.87, 2.53, 0, 0x9a7a4a, { rough: 0.9, opacity: 0.2, transparent: true });
      sheathing.push(s);
    }

    // --------------------------------------------------------- level tool
    const chest = toolChest(g, -2.4, 1.6, { ry: 0.6, color: 0x6a4a1a });
    const level = instrument(chest, 0, 0.79, 0, { ry: 0.3, idle: "-- mm/m", color: FWS_ACCENT, w: 0.12, d: 0.19 });
    holoTag(level, "level — plumb", 0, 0.16, 0, { css: "#c9a36b", w: 0.26 });
    reg(hits, level, "level-tool");

    // ---------------------------------------------------------- walk finds
    const sillGap = box(g, 0.34, 0.03, 0.06, 0, 0.098, 0.68, 0x1a1712, { rough: 0.95, opacity: 0.7, transparent: true });
    sillGap.position.set(0, 0.098, 0.68);
    reg(hits, sillGap, "gap-under-mudsill");
    holoTag(g, "void under sill", 0, 0.3, 0.68, { css: "#d2312b", w: 0.3 });
    const cleat = box(g, 0.14, 0.03, 0.03, -0.9, 2.3, 0.6, 0xd2312b, { rough: 0.7 });
    cleat.rotation.z = 0.4;
    reg(hits, cleat, "loose-stringer-cleat");
    holoTag(g, "cleat — not nailed", -0.9, 2.5, 0.6, { css: "#d2312b", w: 0.34 });

    // ----------------------------------------------------------- fix marks
    const sillShim = box(g, 0.3, 0.02, 0.3, 0, 0.1, 0.68, 0xdfc99a, { rough: 0.85, opacity: 0.001, transparent: true, cast: false });
    reg(hits, sillShim, "sill-packed");
    const cleatNail = ball(g, 0.014, -0.9, 2.32, 0.615, 0xdfe4e8, { rough: 0.4, metal: 0.6, seg: 10, opacity: 0.001, transparent: true, cast: false });
    reg(hits, cleatNail, "cleat-nailed");
    const joistFix = box(g, 0.1, 0.1, 0.1, 0, 2.44, -0.55, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, joistFix, "joist-reseated");

    // --------------------------------------------------------- reshore hazards
    const cmuBlock = box(g, 0.34, 0.19, 0.19, 1.9, 0.19, -0.4, 0x9a9a92, { rough: 0.95 });
    holoTag(g, "concrete block — not a sill", 1.9, 0.42, -0.4, { css: "#d2312b", w: 0.44 });
    reg(hits, cmuBlock, "block-not-mudsill");

    const braceGap = box(g, 0.4, 1.6, 0.5, -0.5, 1.5, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb through here?", -0.5, 2.4, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, braceGap, "climb-unbraced");

    const stripTrap = group(g, 2.1, 0, -1.7);
    box(stripTrap, 0.1, 0.6, 0.1, 0, 0.3, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    holoTag(stripTrap, "pull it now?", 0, 0.7, 0, { css: "#d2312b", w: 0.32 });
    reg(hits, stripTrap, "strip-early");

    const reshoreSkipTrap = box(g, 1.0, 0.02, 1.4, -2.1, 0.11, 0, 0xd2312b, { rough: 0.7, opacity: 0.2, transparent: true, cast: false });
    holoTag(g, "pull the whole row?", -2.1, 0.35, 0, { css: "#d2312b", w: 0.42 });
    reg(hits, reshoreSkipTrap, "shore-skip-row");

    // ------------------------------------------------------------ paperwork
    const drawingsPanel = holoPanel(g, 0.7, 0.5, -2.4, 1.5, -1.1, (cx, w, h) => {
      cx.fillStyle = "#211a10"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9a36b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3e9d8"; cx.fillText("SHORING DRAWING — BAY 4", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#e7dcc4";
      ["Prop spacing: 4 ft o.c. both ways", "Mudsill bearing: 2,000 psf max", "Reshore at 40% design strength", "Strip top-down, reshore follows", "Sign-off required before any pour"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.13)));
    }, { ry: 0.5, accent: FWS_ACCENT });
    reg(hits, drawingsPanel, "shoring-drawings");

    const reshorePanel = holoPanel(g, 0.62, 0.46, -2.2, 1.3, 1.7, (cx, w, h) => {
      cx.fillStyle = "#211a10"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#c9a36b"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#f3e9d8"; cx.fillText("RESHORING PLAN — BAY 4", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#e7dcc4";
      ["Strip joists, then stringers, then shores", "Reshore under every column line", "No more than 1 row struck at a time", "Verify break result before stripping"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.32 + i * 0.15)));
    }, { ry: -0.6, accent: FWS_ACCENT });
    reg(hits, reshorePanel, "reshoring-plan");

    const signoffStand = group(g, -0.4, 0, 1.9);
    box(signoffStand, 0.02, 1.1, 0.3, 0, 0.55, 0, 0x8b929a, { rough: 0.5, metal: 0.5 });
    const signoffFace = decal(signoffStand, 0.3, 0.18, 0.02, 1.1, 0, signFace("PENDING", { bg: "#22201a", accent: "#f2ae14", fg: "#f7f4ec", scale: 0.5 }), { px: 320 });
    holoTag(signoffStand, "shoring sign-off", 0, 1.35, 0, { css: "#c9a36b", w: 0.4 });
    reg(hits, signoffStand, "signoff-panel");

    const deflectionGauge = instrument(g, -0.4, 1.9, 0.9, { ry: 0.4, idle: "-- mm", color: FWS_ACCENT, w: 0.13, d: 0.2 });
    holoTag(deflectionGauge, "shore deflection", 0, 0.17, 0, { css: "#c9a36b", w: 0.36 });
    reg(hits, deflectionGauge, "deflection-gauge");

    // Strip controls — small levers by the last row that stand for the strip
    // sequence's three graded actions.
    const stripLevers = {};
    for (const [id, x] of [["strip-joists", 1.6], ["strip-stringers", 1.9], ["strip-shores", 2.2]]) {
      const lever = group(g, x, 0, -2.1);
      cyl(lever, 0.012, 0.012, 0.24, 0, 0.12, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
      box(lever, 0.06, 0.03, 0.03, 0, 0.24, 0, 0xe8b02e, { rough: 0.6, metal: 0.4 });
      stripLevers[id] = lever;
      reg(hits, lever, id);
    }
    holoTag(g, "strip sequence", 1.9, 0.4, -2.3, { css: "#c9a36b", w: 0.36 });

    // ------------------------------------------------------------- truck & flag
    const holdFlag = group(g, 2.6, 0, 1.9);
    cyl(holdFlag, 0.015, 0.015, 0.9, 0, 0.45, 0, 0x8b929a, { rough: 0.5, metal: 0.6, seg: 8 });
    const flagCloth = box(holdFlag, 0.22, 0.16, 0.01, 0.12, 0.82, 0, 0x8b929a, { rough: 0.7 });
    holoTag(holdFlag, "hold flag", 0, 1.0, 0, { css: "#c9a36b", w: 0.24 });
    reg(hits, holdFlag, "hold-flag");

    const truck = group(g, 4.4, 0, 2.4, -0.6);
    box(truck, 1.0, 0.7, 0.6, -0.8, 0.55, 0, 0x2b6fd8, { rough: 0.5, metal: 0.3 });
    const drum = cyl(truck, 0.32, 0.28, 0.9, 0.2, 0.75, 0, 0x8a8f96, { rough: 0.6, metal: 0.4, seg: 14 });
    drum.rotation.z = Math.PI / 2.4;
    for (const wx of [-1.1, -0.3, 0.6]) cyl(truck, 0.2, 0.2, 0.15, wx, 0.2, 0.32, 0x1a1e23, { rough: 0.9, seg: 12 }).rotation.z = Math.PI / 2;
    const chute = box(truck, 0.5, 0.06, 0.08, 0.75, 0.5, 0.2, 0xb9bec4, { rough: 0.5, metal: 0.6 });
    holoTag(truck, "ready-mix truck", 0, 1.1, 0, { css: "#c9a36b", w: 0.34 });

    // ------------------------------------------------------------------ crew
    const carpenter = standingFigure(g, 0.4, 2.3, { ry: -1.0, cloth: 0x37505f, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(carpenter, "carpenter", 0, 1.9, 0, { css: "#c9a36b", w: 0.24 });
    const foreman = standingFigure(g, -1.5, -1.6, { ry: 2.2, cloth: 0x4a5560, vest: 0xf2c14b, helmet: 0xf2f2f2 });
    holoTag(foreman, "competent person", 0, 1.9, 0, { css: "#c9a36b", w: 0.36 });
    barrierPanel(g, -2.8, -2.0, { ry: 0.6 });
    cone(g, 2.6, -2.4);
    cone(g, 3.0, 1.3);

    const pourDust = particles(g, 30, 0xd8d2c4, { size: 0.03, life: 0.6, additive: false, opacity: 0.35 });
    pourDust.position.set(0, 2.55, 0);

    let truckHome = 2.4, flagRaised = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.3, 1.7, -0.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "shore") {
          lastShore.sh.rotation.set(0, 0, 0);
          lastShore.sh.position.set(1.0, 0, 0.55);
        }
        if (step.id === "stringers") { stringerA.material.opacity = 1; stringerB.material.opacity = 1; }
        if (step.id === "joists") for (const j of Object.values(joists)) j.material.opacity = 1;
        if (step.id === "walk") { /* revealed via animate below */ }
        if (step.id === "fix") { sillGap.visible = false; cleat.rotation.z = 0; cleat.material.color.set(0x8b6a42); joists["joist-2"].position.z = 0; }
        if (step.id === "signoff") repaint(signoffFace, signFace("SIGNED", { bg: "#0f1b14", accent: "#59c97b", fg: "#bff7d4", scale: 0.5 }));
        if (step.id === "strip") {
          for (const j of Object.values(joists)) j.visible = false;
          stringerA.visible = false; stringerB.visible = false;
          westShore.sh.visible = false; centerShore.sh.visible = false; lastShore.sh.visible = false;
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "corner-pin-out") { cornerShore.pin.visible = false; cornerShore.sh.rotation.z = 0.03; }
        if (it.id === "truck-early") { truck.position.x = 2.7; flagCloth.material.color.set(0xd2312b); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "corner-pin-out") { cornerShore.pin.visible = true; cornerShore.sh.rotation.z = 0; }
        if (it.id === "truck-early") { truck.position.x = truckHome + 1.8; flagCloth.material.color.set(0x59c97b); flagRaised = true; }
      },
      animate(t, dt, session) {
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "plumb") repaint(level.userData.screen, signFace(`${((gg.t - 0.52) * 38).toFixed(1)} mm/m`, { bg: "#0d1c24", accent: gg.t >= 0.44 && gg.t <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#fff0dc", scale: 0.6 }));
        const tr = session?.track;
        if (tr && session.step?.id === "watch") {
          repaint(deflectionGauge.userData.screen, signFace(`${Math.round(tr.v * 22)} mm`, { bg: "#0d1c24", accent: tr.v >= 0.36 && tr.v <= 0.56 ? "#59c97b" : "#f2ae14", fg: "#fff0dc", scale: 0.55 }));
          pourDust.visible = true;
          pourDust.userData.step(dt, new THREE.Vector3(0, 2.55, 0), 0.1, 0.3, -1.4);
        } else if (pourDust.visible && session.step?.id !== "watch") pourDust.visible = false;
        if (!truck.position) return;
        void flagRaised;
      },
    };
  },
};
