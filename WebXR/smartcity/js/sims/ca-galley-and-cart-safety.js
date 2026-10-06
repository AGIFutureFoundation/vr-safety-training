import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, decal, repaint, signFace, paperFace, mat, standingFigure,
} from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, instrument, reg,
} from "../citykit.js";
import { cabinInterior } from "../../../shared/equipment.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Galley and Cart Safety VR — Airline Cabin and Flight Crew,
// station two. The galley is the one place in the cabin with hot liquid,
// an open cabinet and a loaded cart all sharing the same small floor space,
// and every one of those turns into a hazard the instant the aircraft moves
// unexpectedly. This station is the habit of leaving nothing loose that
// does not have to be: the cart braked and latched between every push, hot
// liquid capped and never carried through the aisle uncovered, and the
// whole galley secured for descent the moment the seatbelt sign says so —
// never halfway, never "in a minute."

const CAGC_ACCENT = 0xd8a23b;

export const SIM_CA_GALLEY_AND_CART_SAFETY = {
  id: "ca-galley-and-cart-safety",
  index: "ca-2",
  domain: "Aviation",
  trade: "Flight attendant — AFA-CWA cabin crew",
  category: "Mobility & Transit",
  certification: "AFA-CWA cabin-safety training; the airline's own galley and cart-service procedure under 14 CFR 121; OSHA 29 CFR 1910.151 medical services and first aid for a scald or a strain this station's securing habit is built to prevent",
  name: "Galley and Cart Safety",
  title: simTitle("Galley and Cart Safety"),
  tagline: "The cart braked and latched between every push, hot liquid capped and never carried uncovered, a galley scanned for what turbulence would turn loose, and the whole galley secured for descent the moment the seatbelt sign says so",
  accent: CAGC_ACCENT,
  accentCss: "#d8a23b",
  parSeconds: 320,
  footprint: 2.5,
  badge: { id: "galley-secure", name: "Galley Secure", note: "The cart braked and stowed, hot liquid capped, the galley scanned clean, and everything secured for descent the moment the sign called for it" },

  supportLine: "your AFA-CWA local's member assistance resources, or the airline's own employee assistance line — a scald or a strain in the galley is worth reporting even when it felt minor",

  game: system({
    name: "Galley Secure",
    currency: "STOW",
    ranks: ["New Flight Attendant", "Line Qualified", "Lead Flight Attendant", "Purser", "Galley Secure Certified"],
    badges: [
      { id: "cart-braked", name: "Cart Braked", note: "The cart's wheel brake set and the restraint strap tension confirmed", test: AWARD.stepClean("cart-brake-set") },
      { id: "hot-liquid-capped", name: "Hot Liquid Capped", note: "Every hot-liquid container capped before it ever left the galley", test: AWARD.stepClean("cap-hot-liquid") },
      { id: "descent-secure", name: "Descent Secure Certified", note: "The whole galley latched and secured for descent, nothing left loose", test: AWARD.stepClean("secure-for-descent") },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Service", note: "No corrections anywhere in the service", test: AWARD.clean },
      { id: "steady-tray", name: "Steady Tray", note: "Carried the hot-liquid tray level the whole count, first try", test: AWARD.unbroken },
      { id: "fast-service", name: "Fast Turn", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "uncapped-liquid-hazard": "That hot-liquid container is sitting uncapped. An uncapped container of anything hot has no business leaving this galley — a cap costs nothing to close and everything to have skipped the one time the aircraft moves without warning.",
    "unlatched-cabinet-hazard": "That galley cabinet door is not latched. An unlatched cabinet at altitude does not stay closed on its own, and whatever is stacked behind it becomes exactly as loose as the door the moment turbulence actually tests it.",
    "unbraked-cart-hazard": "That cart is standing in the aisle with its brake off. An unbraked cart on a moving aircraft does not stay where it was left — it rolls, and a rolling cart loaded with hot liquid and glass is its own hazard before it ever reaches anyone.",
    "oven-left-on-hazard": "That galley oven is still on. An oven running with nobody actively cooking in it is a heat source this galley has no reason to be carrying into descent, and it gets switched off as part of securing, not left for whoever notices next.",
  },

  lateNotes: {
    "cart-wheel-brake": "Not yet — the galley scan comes first. A cart braked before the hazards around it are actually found just means one more loose thing to work around.",
    "latch-cart-bay": "Hold that. The cabinets get their final check right alongside this, not after it.",
  },

  steps: [
    {
      id: "pull-galley-checklist", kind: "select", target: "galley-checklist-board",
      title: "Pull the galley safety checklist",
      cue: "Open the galley safety checklist before touching the cart or the cabinets.",
      why: "The checklist is what keeps this from turning into whichever steps happen to feel most urgent in the moment — a hot liquid capped out of order is still capped, but a step skipped because the checklist was never opened is a step nobody catches until it costs something.",
    },
    {
      id: "scan-galley", kind: "find", noHint: true,
      targets: ["uncapped-liquid", "unlatched-cabinet"],
      itemNames: { "uncapped-liquid": "an uncapped hot-liquid container", "unlatched-cabinet": "a cabinet door that isn't latched" },
      itemNotes: {
        "uncapped-liquid": "This gets capped the moment it's found, not carried another step uncapped — a cap is the only thing standing between this container and a scald the instant the aircraft moves.",
        "unlatched-cabinet": "A cabinet that isn't fully latched gets closed and confirmed now, while the galley is calm, instead of found open the moment turbulence actually shakes it.",
      },
      title: "Scan the galley before service",
      cue: "Two things in this galley aren't secured yet. Find them before the cart moves.",
      why: "Everything this scan catches is a five-second fix right now and a real hazard the instant the aircraft moves without warning — that trade only works if the scan actually happens before service starts, not sometime during it.",
    },
    {
      id: "cap-hot-liquid", kind: "sequence", anyOrder: true,
      targets: ["cap-coffee-pot", "cap-hot-water"],
      itemNames: { "cap-coffee-pot": "cap the coffee pot", "cap-hot-water": "cap the hot water urn" },
      title: "Cap every hot-liquid container",
      cue: "Cap the coffee pot and the hot water urn before either one leaves the galley.",
      why: "A capped container is a container that survives a jolt without becoming a scald — this happens before anything with hot liquid in it crosses the galley threshold, not on the way out the door with the cart already moving.",
    },
    {
      id: "coffee-temp-check", kind: "gauge", target: "coffee-temp-gauge",
      title: "Read the coffee maker's temperature",
      cue: "Check the brew temperature gauge before pouring for service.",
      gauge: { label: "BREW TEMP", speed: 0.6, green: [0.4, 0.68], readout: (t) => (t < 0.4 ? "still brewing" : t > 0.68 ? "too hot to pour" : "ready to pour"), missNote: "Poured outside the safe brew band. Too hot to pour is exactly the cup that scalds the first passenger it reaches." },
      why: "A brew that hasn't finished or one running too hot are both a problem this gauge exists to catch before the first cup is ever poured, not after someone downstream says it tasted burnt or felt too hot to hold.",
    },
    {
      id: "cart-brake-set", kind: "turn", target: "cart-wheel-brake",
      title: "Set the cart's wheel brake",
      cue: "Turn the wheel brake lever to locked before loading the cart.",
      turn: { turns: 0.3, axis: "y", label: "CART BRAKE" },
      why: "A cart with its brake off is a cart that moves on its own the instant the floor tilts even slightly, and locking the brake before loading is what keeps it exactly where it was parked while it's being loaded, not partway down the aisle.",
    },
    {
      id: "restraint-strap-check", kind: "hold", target: "cart-restraint-strap", seconds: 5,
      title: "Check the cart restraint strap tension",
      cue: "Hold tension on the restraint strap and confirm it's actually snug against the load.",
      why: "A restraint strap that looks clipped in place and one that's actually snug against the load are two different things, and the only way to know the second one is true is to hold real tension against it and feel it hold, not glance at the buckle.",
      holdBreakNote: "Let go before the tension was actually confirmed. A strap that was never checked snug is a strap this cart cannot actually trust.",
    },
    {
      id: "cart-service-sequence", kind: "sequence", anyOrder: false,
      targets: ["release-cart-brake", "push-cart-to-aisle"],
      itemNames: { "release-cart-brake": "release the brake", "push-cart-to-aisle": "push the cart into the aisle" },
      title: "Move the cart into service",
      cue: "Release the brake, then push the cart into the aisle — never the other way round.",
      why: "A cart pushed against its own set brake just strains the frame and goes nowhere, and releasing the brake first is what actually lets this cart move where the service needs it, in the order that keeps the frame from taking that strain every single push.",
      outOfOrderNote: "Release the brake first, then push — pushing against a set brake is how a cart frame gets bent for no reason at all.",
    },
    {
      id: "carry-tray-level", kind: "track", target: "hot-liquid-tray", seconds: 6,
      title: "Carry the hot-liquid tray level",
      cue: "Keep the tray level while the aircraft rides through light chop.",
      track: { start: 0.5, green: [0.4, 0.6], rise: 0.4, fall: 0.4, drift: 0.16, label: "TRAY LEVEL", readout: (v) => (v < 0.4 ? "tipping left" : v > 0.6 ? "tipping right" : "level") },
      holdBreakNote: "The tray tipped out of level. A hot-liquid tray that isn't held level is a spill waiting on the next bit of chop, not an if.",
      why: "A tray held level is a tray that survives ordinary chop without spilling on anyone, and the only way it stays level is actively correcting for the aircraft's own small movements the whole way down the aisle, not carrying it and hoping.",
    },
    {
      id: "cabinet-latch-confirm", kind: "select", target: "cabinet-door",
      title: "Confirm every cabinet is latched",
      cue: "Push and confirm each galley cabinet door is fully latched before moving on.",
      why: "A cabinet that looks shut and a cabinet that's actually latched are not the same fact, and pushing to confirm the latch caught is the only way to know which one this cabinet actually is before the galley is called secure.",
    },
    {
      id: "oven-off-confirm", kind: "select", target: "oven-switch",
      title: "Confirm the galley oven is off",
      cue: "Check the oven switch and confirm it's off before securing for descent.",
      why: "An oven left running into descent is a heat source with nobody actively watching it, and confirming it off now is what this galley takes into descent instead of an assumption that somebody else already checked it.",
    },
    {
      id: "secure-for-descent", kind: "sequence",
      targets: ["latch-cart-bay", "latch-all-cabinets"],
      itemNames: { "latch-cart-bay": "latch the cart into its stowage bay", "latch-all-cabinets": "confirm every cabinet latched again" },
      title: "Secure the galley for descent",
      cue: "Latch the cart into its bay, then confirm every cabinet is latched one more time.",
      why: "Descent is exactly when a galley that was fine all flight suddenly isn't — securing the cart into its own bay and re-confirming every cabinet is what makes sure nothing that held together in cruise is left to find out the hard way whether it holds together in a descent.",
      outOfOrderNote: "Cart first, then the cabinets — a cabinet re-check with the cart still loose in the aisle is checking the wrong thing first.",
    },
    {
      id: "log-galley-secure", kind: "select", target: "galley-log",
      title: "Log the galley secure",
      cue: "Record the galley as secured before returning to your jumpseat.",
      why: "The log is the only record that this galley was actually checked and secured on this specific flight — without it, the next crew member through here has no way to know whether this happened or was simply assumed.",
    },
  ],

  interrupts: [
    {
      id: "seatbelt-sign-illuminates",
      kind: "Seatbelt sign illuminates mid-service",
      after: "carry-tray-level", delay: 3, seconds: 12,
      alert: "The fasten-seatbelt sign illuminates while the cart is still out in the aisle.",
      cue: "That cart gets braked and stowed right now, service or no service.",
      target: "cart-wheel-brake",
      why: "The sign illuminating mid-service is not a suggestion to finish the row first — it means the aircraft expects to move unexpectedly, and a cart still loose in the aisle when that happens is exactly the hazard this whole station exists to prevent.",
      missNote: "The cart stayed out in the aisle after the sign came on. An unbraked, unstowed cart on an aircraft that's about to move is the hazard this entire procedure is built around.",
      wrongNote: "Brake and stow the cart — nothing else in this galley matters more the moment that sign comes on.",
    },
    {
      id: "hot-liquid-spill",
      kind: "Hot liquid spills in the galley",
      after: "secure-for-descent", delay: 3, seconds: 12,
      alert: "A jolt knocks a capped container loose and hot liquid spills across the galley floor.",
      cue: "That gets contained before anyone steps in it, not chased down mid-descent.",
      target: "galley-spill-kit",
      why: "A hot-liquid spill on a galley floor is a scald and a fall risk stacked on top of each other, and containing it at the source, right now, is what keeps either one from actually reaching someone during the one part of the flight everyone is already trying to stay seated for.",
      missNote: "The spill sat on the galley floor while the closeout continued around it. That is exactly the scald-and-fall combination this station exists to keep off the floor.",
      wrongNote: "Contain the spill first — everything else about closing out the galley can wait the few seconds that takes.",
    },
  ],

  build(root) {
    const hits = {};
    const g = root;
    stationPad(g, 2.5, CAGC_ACCENT);

    const cabin = cabinInterior(g, 0, 0, 0, { livery: { colour: 0x6a5a2f } });
    const { galley, galleyCart, oxygenPanel, door } = cabin.userData.parts;
    void door; void oxygenPanel;
    holoTag(cabin, "cabin galley", 0, 2.5, -1.0, { css: "#d8a23b", w: 0.4 });

    const checklistBoard = decal(g, 0.3, 0.4, 1.2, 1.3, -1.2,
      paperFace("GALLEY SAFETY CHECK", ["Cart · Hot liquid", "Cabinets · Descent"], { bg: "#fbf3df", band: "#8a5a1c" }), { px: 220 });
    reg(hits, checklistBoard, "galley-checklist-board");

    // -------------------------------------------------------------- coffee / hot liquid
    const coffeePot = cyl(galley, 0.07, 0.07, 0.18, -0.5, 1.2, -0.1, 0x2b2f34, { rough: 0.4, metal: 0.4, seg: 14 });
    holoTag(coffeePot, "coffee pot", 0, 0.14, 0, { css: "#d8a23b", w: 0.32 });
    reg(hits, coffeePot, "cap-coffee-pot");
    reg(hits, coffeePot, "uncapped-liquid");
    reg(hits, coffeePot, "uncapped-liquid-hazard");
    const hotWaterUrn = cyl(galley, 0.09, 0.09, 0.24, 0.4, 1.2, -0.15, 0xdfe6ea, { rough: 0.4, metal: 0.3, seg: 14 });
    holoTag(hotWaterUrn, "hot water urn", 0, 0.16, 0, { css: "#d8a23b", w: 0.34 });
    reg(hits, hotWaterUrn, "cap-hot-water");
    const coffeeTempGauge = instrument(galley, -0.5, 1.35, -0.1, { idle: "-- °", color: CAGC_ACCENT, w: 0.11, d: 0.15, ry: 0 });
    reg(hits, coffeeTempGauge, "coffee-temp-gauge");

    // -------------------------------------------------------------- cabinet
    const cabinetDoor = box(galley, 0.5, 0.36, 0.04, 0.9, 0.78, 0.31, 0x6f7a83, { rough: 0.45, metal: 0.2 });
    holoTag(cabinetDoor, "galley cabinet", 0, 0.24, 0, { css: "#d8a23b", w: 0.36 });
    reg(hits, cabinetDoor, "unlatched-cabinet");
    reg(hits, cabinetDoor, "unlatched-cabinet-hazard");
    reg(hits, cabinetDoor, "cabinet-door");

    const ovenSwitch = box(galley, 0.06, 0.03, 0.02, -0.9, 0.95, 0.31, 0xd2312b, { rough: 0.5, emissive: 0xd2312b, ei: 0.5 });
    holoTag(ovenSwitch, "oven", 0, 0.06, 0, { css: "#d8a23b", w: 0.24 });
    reg(hits, ovenSwitch, "oven-switch");
    reg(hits, ovenSwitch, "oven-left-on-hazard");

    // -------------------------------------------------------------- cart
    reg(hits, galleyCart, "unbraked-cart-hazard");
    const cartBrakeLever = box(galleyCart, 0.03, 0.1, 0.03, 0.18, 0.06, -0.2, 0x2b2f34, { rough: 0.5, metal: 0.3 });
    holoTag(cartBrakeLever, "cart brake", 0, 0.1, 0, { css: "#d8a23b", w: 0.3 });
    reg(hits, cartBrakeLever, "cart-wheel-brake");
    const cartStrap = box(galleyCart, 0.36, 0.03, 0.03, 0, 0.6, 0.24, 0xd8a23b, { rough: 0.6 });
    holoTag(cartStrap, "restraint strap", 0, 0.08, 0, { css: "#d8a23b", w: 0.36 });
    reg(hits, cartStrap, "cart-restraint-strap");
    const cartTray = box(galleyCart, 0.34, 0.02, 0.4, 0, 0.88, 0, 0xc7cdd2, { rough: 0.5 });
    holoTag(cartTray, "hot-liquid tray", 0, 0.06, 0, { css: "#d8a23b", w: 0.36 });
    reg(hits, cartTray, "hot-liquid-tray");
    reg(hits, galleyCart, "release-cart-brake");
    const aisleSpot = box(g, 0.5, 0.02, 0.5, 0, 0.001, 0.6, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["push-cart-to-aisle"] = aisleSpot;
    hits["latch-cart-bay"] = galleyCart;
    hits["latch-all-cabinets"] = cabinetDoor;

    const spillPuddle = ball(g, 0.28, 0.4, 0.101, -0.2, 0x3a3226, { rough: 0.25, opacity: 0.7, transparent: true, seg: 12, cast: false });
    spillPuddle.scale.y = 0.05;
    spillPuddle.visible = false;
    const spillKit = box(g, 0.3, 0.2, 0.2, 1.2, 0.1, 0.2, 0xf2c14b, { rough: 0.7 });
    holoTag(spillKit, "spill kit", 0, 0.24, 0, { css: "#d8a23b", w: 0.3 });
    reg(hits, spillKit, "galley-spill-kit");

    const logPanel = holoPanel(g, 0.5, 0.34, 1.3, 1.5, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(28,20,4,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8a23b"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#fbe9c8";
      ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("GALLEY LOG", w * 0.06, h * 0.25);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      ctx.fillText("Status: in progress", w * 0.06, h * 0.6);
    }, { accent: CAGC_ACCENT, ry: -0.6 });
    reg(hits, logPanel, "galley-log");

    const attendant = standingFigure(g, -0.15, -2.1, { ry: 1.0, cloth: 0x1c3a5c, skin: 0xb98a63 });
    void attendant;

    return {
      hits,
      footprint: 2.5,
      spawnLook: new THREE.Vector3(0, 1.2, -0.6),

      onStepComplete(step) {
        if (step.id === "scan-galley") { coffeePot.material = mat(0x59c97b, { rough: 0.4, metal: 0.4 }); cabinetDoor.material = mat(0x59c97b, { rough: 0.45, metal: 0.2 }); }
        if (step.id === "cap-hot-liquid") { coffeePot.material = mat(0x2b2f34, { rough: 0.4, metal: 0.4 }); hotWaterUrn.material = mat(0xdfe6ea, { rough: 0.4, metal: 0.3 }); }
        if (step.id === "cart-brake-set") cartBrakeLever.material = mat(0xd2312b, { rough: 0.5, metal: 0.3 });
        if (step.id === "oven-off-confirm") ovenSwitch.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.3 });
        if (step.id === "log-galley-secure") {
          repaint(logPanel.userData.face, (ctx, w, h) => {
            ctx.fillStyle = "rgba(28,20,4,0.9)"; ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = "#d8a23b"; ctx.fillRect(0, 0, w, 5);
            ctx.fillStyle = "#fbe9c8";
            ctx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`;
            ctx.textAlign = "left"; ctx.textBaseline = "middle";
            ctx.fillText("GALLEY LOG", w * 0.06, h * 0.25);
            ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
            ctx.fillText("Status: secure", w * 0.06, h * 0.6);
          });
        }
      },

      onInterrupt(it) {
        if (it.id === "seatbelt-sign-illuminates") cartBrakeLever.material = mat(0xf0645b, { rough: 0.5, metal: 0.3 });
        if (it.id === "hot-liquid-spill") spillPuddle.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "seatbelt-sign-illuminates") cartBrakeLever.material = mat(0xd2312b, { rough: 0.5, metal: 0.3 });
        if (it.id === "hot-liquid-spill") spillPuddle.visible = false;
      },

      onHazard() {},

      animate(t, dt, session) {
        void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "coffee-temp-check") {
          repaint(coffeeTempGauge.userData.screen, signFace(`${Math.round(gg.t * 100)}°`, {
            bg: "#0d1c24", accent: gg.t >= 0.4 && gg.t <= 0.68 ? "#59c97b" : "#f0645b", fg: "#fbe9c8", scale: 0.55,
          }));
        }
        void t;
      },
    };
  },
};
