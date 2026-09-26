import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, cone,
  reg, surfaceTexture, texturedMat, concreteFace, palette,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Cold Weather Curing & Blankets VR — Cement masons and
// plasterers, station eight, the pack's closer.
//
// An OPCMIA cement mason crew protecting a fresh slab through a hard freeze:
// the cold weather plan read, the pour walked for an unheated cold joint and
// a heater staged too close to a blanket before ignition, the ground and the
// mix temperature checked before placement, the slab blanketed and skirted
// against wind, an indirect-fired heater run with its exhaust vented outside
// the enclosure, the temperature under the blankets tracked through the
// night, and the blankets not pulled until the slab has reached the strength
// the cold weather plan requires. Insulation values, heater output and
// strike times are the plan's and the manufacturer's, never a number this
// file invents.

const CMCW_ACCENT = 0xf2c14b;
const CMCW_CSS = "#f2c14b";
const CMCW_PAL = palette("construction");

export const SIM_CM_COLD_WEATHER_CURING_AND_BLANKETS = {
  id: "cm-cold-weather-curing-and-blankets",
  index: "707",
  domain: "Construction & Structural Trades",
  trade: "Cement mason — OPCMIA Local 300, cold weather protection crew",
  category: "Construction & Structural Trades",
  weather: "wind",
  certification: "OPCMIA Local 300 cement mason apprenticeship as a training body; ACI 306 guide to cold weather concreting; OSHA 29 CFR 1926 Subpart Q concrete and masonry construction; OSHA 29 CFR 1926.352 fire prevention, as applied to the enclosure heater; OSHA 29 CFR 1926.57 ventilation, for the heater's exhaust; ANSI/ASSP A10.9 concrete and masonry construction safety requirements; the cold weather concreting plan and the heater manufacturer's manual",
  name: "Cold Weather Curing & Blankets",
  title: simTitle("Cold Weather Curing & Blankets"),
  tagline: "A slab protected through a hard freeze: the cold weather plan read, the pour walked for a cold joint and a heater staged too close to a blanket, ground and mix temperature checked, the slab blanketed and skirted, the heater vented outside the enclosure, the temperature tracked through the night, and the blankets held until the slab has the plan's strength",
  accent: CMCW_ACCENT,
  accentCss: CMCW_CSS,
  parSeconds: 320,
  footprint: 2.6,
  badge: { id: "held-the-heat", name: "Held The Heat", note: "A slab blanketed, heated and vented safely through a freeze, with the blankets held until the plan's strength was actually reached" },

  supportLine: "your OPCMIA Local 300 member assistance programme, or the employee assistance line posted on the contractor's site board",

  game: system({
    name: "Winter Crew",
    currency: "DEGREE-HOUR",
    ranks: ["Laborer", "Blanket Hand", "Cement Mason", "Lead Finisher", "Winter Crew Certified"],
    badges: [
      { id: "walked-the-cold", name: "Walked The Cold", note: "The night walk found the cold joint and the heater too close to the blanket before ignition, first time", test: AWARD.stepClean("night-walk") },
      { id: "never-vented-inside", name: "Never Vented Inside", note: "Never ran the heater's exhaust into the enclosure, never left a blanket touching the heater, never pulled the blankets before the strength was reached, never worked exposed skin in the wind chill", test: AWARD.safe },
      { id: "held-the-temperature", name: "Held The Temperature", note: "The under-blanket temperature and the mix temperature both held inside the band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-protection", name: "Clean Protection", note: "No corrections through the whole night's setup", test: AWARD.clean },
      { id: "held-the-night", name: "Held The Night", note: "The temperature held in band for the whole overnight watch", test: AWARD.unbroken },
      { id: "protected-by-break", name: "Protected By Break", note: "Blanketed, heated, vented and logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "heater-exhaust-inside": "You ran the heater's exhaust hose loose inside the enclosure instead of ducted outside it. An indirect-fired heater burns fuel and its exhaust carries carbon monoxide, which has no smell and no colour and builds fast in a tented enclosure with the blankets sealing the wind out — the exhaust is ducted outside the enclosure every time, not treated as good enough if the tent has a gap somewhere.",
    "blanket-touching-heater": "You draped the curing blanket so it touches the heater's hot side. Insulated curing blankets are exactly the fuel a space heater is built to sit near without touching, and contact between the two is how a cold weather protection setup starts an enclosure fire instead of preventing one.",
    "pull-blankets-early": "You went to pull the blankets before the slab reached the cold weather plan's strength. Concrete that freezes before it reaches a minimum strength never recovers that strength once it thaws — the damage is permanent and invisible until the slab is loaded. The blankets stay until the plan's temperature and time have both been met, not until the crew is ready to go home.",
    "bare-skin-wind-chill": "You worked the blanket ties with bare hands in the wind chill for longer than the cold exposure limits allow. Frostbite sets in faster than it feels like it should in a cutting wind, and a crew working through a hard freeze rotates and covers exposed skin on the same schedule the cold weather plan sets for the concrete.",
  },

  lateNotes: {
    "blanket-roll": "The blankets only go down once the finish work is actually done — laying them over a slab that is not finished yet just means pulling them back off again.",
    "heater-switch": "The heater only starts once its exhaust is ducted outside the enclosure and no blanket is touching it — starting it before that is starting a carbon monoxide or a fire risk on purpose.",
    "close-log": "The night is logged once the strength has been confirmed and the blankets have actually come off.",
  },

  steps: [
    {
      id: "cold-plan", kind: "select", target: "cold-plan",
      title: "Read the cold weather concreting plan",
      cue: "Read the minimum concrete temperature, the protection duration, the strength the slab must reach before the blankets come off, and the heater's ventilation requirement.",
      why: "Cold weather concreting is governed by ACI 306 because concrete that freezes before it gains enough strength is permanently damaged, not just slowed down — the plan sets the temperature the mix has to be placed at, how long it has to be protected, and the strength it has to reach before protection is removed, and none of those numbers are a judgment call once the truck is on its way in a freeze.",
    },
    {
      id: "night-walk", kind: "find", noHint: true,
      targets: ["cold-joint-exposed", "heater-too-close", "gap-in-skirt"],
      itemNames: { "cold-joint-exposed": "a construction joint left uncovered", "heater-too-close": "a heater staged against the blanket line", "gap-in-skirt": "a gap in the enclosure's wind skirt" },
      itemNotes: {
        "cold-joint-exposed": "The construction joint at the end of yesterday's pour has no blanket over it — that edge will freeze first because it has the least mass to hold its own heat.",
        "heater-too-close": "The space heater is staged close enough that its housing is already touching the edge of a folded blanket.",
        "gap-in-skirt": "A gap in the enclosure's wind skirt is letting cold air straight onto the corner of the slab, undoing whatever heat the blankets are holding everywhere else.",
      },
      title: "Walk the slab and the enclosure before the freeze sets in",
      cue: "Walk the joints, the heater placement and the enclosure skirt, and click every defect you find.",
      why: "Made before the temperature actually drops, in daylight with the crew still on site, all three of these are quick corrections. Wait until two in the morning to find them instead and an exposed joint is concrete that has already frozen past saving, a heater touching a blanket is a fire nobody is watching, and a gap in the skirt has been feeding cold air onto the slab all night.",
    },
    {
      id: "fix", kind: "sequence", anyOrder: true,
      targets: ["cover-joint", "move-heater", "close-skirt-gap"],
      itemNames: { "cover-joint": "joint covered", "move-heater": "heater moved clear", "close-skirt-gap": "skirt gap closed" },
      title: "Correct what the walk found",
      cue: "Cover the exposed joint, move the heater clear of the blanket, and close the gap in the skirt.",
      why: "Writing down an exposed joint or a heater too close to a blanket and leaving it that way is worse than never having noticed, because the crew now trusts an enclosure that was only fixed on paper. The joint actually has to be covered, the heater actually moved clear and the skirt actually closed before anyone treats the enclosure as ready for the freeze.",
    },
    {
      id: "temp-check", kind: "gauge", target: "ground-thermometer",
      title: "Check the ground and mix temperature",
      cue: "Read the ground temperature and the mix as it arrives, and commit inside the cold weather plan's minimum band before placement.",
      why: "Placing concrete onto frozen or near-frozen ground pulls heat out of the fresh mix from underneath before it ever gets a chance to start curing, no matter how warm the truck delivered it. The plan's minimum is checked at both the ground and the mix because either one being too cold defeats the other being right.",
      gauge: { label: "TEMPERATURE", speed: 0.66, green: [0.44, 0.62], readout: (t) => (t < 0.44 ? "below the plan's minimum" : t <= 0.62 ? "inside the plan's minimum" : "warm — good margin"), missNote: "Below the plan's minimum — warm the ground or wait for a warmer load before placing." },
    },
    {
      id: "blanket-lay", kind: "drag", target: "blanket-roll",
      title: "Lay the curing blankets",
      cue: "Carry the blanket roll across the finished slab and lay it flat, overlapping the seams.",
      why: "Insulated blankets hold the heat of hydration in the slab instead of letting it radiate away into freezing air, and overlapped seams are what keep a cold seam from forming exactly where two blankets meet — a gap at the seam is a stripe of the slab that gets none of the protection the rest of it has.",
      drag: { to: "slab-zone", radius: 0.6, missNote: "Not across the slab — the blanket has to cover the finished surface, overlapped at the seams, not left folded on the ground." },
    },
    {
      id: "skirt-enclosure", kind: "sequence",
      targets: ["skirt-panel-a", "skirt-panel-b"],
      itemNames: { "skirt-panel-a": "wind skirt panel A closed", "skirt-panel-b": "wind skirt panel B closed" },
      title: "Close the enclosure's wind skirt",
      cue: "Close both skirt panels around the blanketed slab to cut the wind off the enclosure.",
      why: "Wind moving across a blanketed slab strips heat off it far faster than still cold air does, and the skirt is what actually stops that — a slab under blankets in open wind can still lose the protection the blankets were laid to give it.",
      outOfOrderNote: "Panel A first, then panel B — closing them in order keeps the enclosure from standing half-open to the wind partway through.",
    },
    {
      id: "heater-vent", kind: "select", target: "heater-exhaust",
      title: "Duct the heater's exhaust outside the enclosure",
      cue: "Connect the exhaust duct and route it outside the enclosure before the heater is started.",
      why: "An indirect-fired heater's exhaust carries carbon monoxide, and a sealed, wind-skirted enclosure is exactly the kind of space that traps it if the exhaust is not ducted clear — the duct is connected and routed outside before the heater is ever lit, not added after somebody notices a smell that carbon monoxide does not actually have.",
    },
    {
      id: "heater-start", kind: "hold", target: "heater-switch", seconds: 5,
      title: "Start and confirm the heater",
      cue: "Hold the heater's start switch and confirm it lights and holds a steady flame with the exhaust running clear.",
      why: "A heater confirmed running steady, with its exhaust actually pulling and no blanket touching its housing, is what the whole overnight protection depends on — a heater that trips or smolders unnoticed after the crew leaves is a slab that spends the coldest hours of the night with no heat at all.",
      holdBreakNote: "The switch let go before the flame held steady. Reset it and hold until the heater is confirmed running clear.",
    },
    {
      id: "overnight-track", kind: "track", target: "temp-monitor", seconds: 7,
      title: "Track the under-blanket temperature overnight",
      cue: "Watch the temperature reading through the coldest part of the night and keep it inside the plan's protection band.",
      why: "The plan's protection band is the temperature the slab has to stay above for its whole protection duration to actually gain the strength cold weather concreting depends on, and the coldest hours of the night are exactly when a heater trip or a skirt gap shows up first. Watching it through the night is what catches a failing setup before the slab has already frozen.",
      track: { start: 0.5, green: [0.42, 0.62], rise: 0.3, fall: 0.5, drift: 0.1, label: "UNDER-BLANKET TEMP", readout: (v) => (v < 0.42 ? "dropping toward freezing" : v > 0.62 ? "running warm — check the heater" : "inside the protection band") },
      holdBreakNote: "The temperature left the band overnight. Find the cause — heater, skirt or blanket — and bring it back into band.",
    },
    {
      id: "strength-confirm", kind: "select", target: "strength-ticket",
      title: "Confirm the slab has reached the plan's strength",
      cue: "Read the strength result against the cold weather plan's minimum before touching a single blanket.",
      why: "The blankets protect the slab exactly until the concrete has gained the strength the plan requires to survive a freeze without permanent damage, and that is a fact proven by a test result, not a guess based on how many hours have passed. Pulling protection on a schedule instead of on the confirmed result is how a slab gets frozen the night before it would have made it.",
    },
    {
      id: "blanket-pull", kind: "select", target: "close-log",
      title: "Pull the blankets and log the slab",
      cue: "Remove the blankets and the skirt now that the strength is confirmed, and record the night's protection.",
      why: "The cold weather log is how the foreman and the inspector both know this slab actually reached its required strength under protection rather than being uncovered on a schedule — it is also where the exposed joint and the heater placement get written down so the next night's setup starts from what this one already found.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew and the foreman",
      cue: "Call the foreman: slab protected and confirmed, blankets pulled. Then check in with the crew about the heater and the cold.",
      why: "How the foreman sets up the next pour's protection and the heater rotation depends entirely on getting an honest account on this call. A heater stalled sometime overnight and hands got colder than they should have working the ties — both deserve saying, and so does the reminder that the OPCMIA member assistance line is there for a crew that came off a rough, cold night.",
    },
  ],

  interrupts: [
    {
      id: "heater-exhaust-fails",
      kind: "Heater exhaust duct comes loose inside the enclosure",
      after: "heater-start", delay: 2, seconds: 12,
      alert: "The heater's exhaust duct has worked loose and is now venting straight into the enclosure instead of outside it.",
      cue: "Shut the heater down before the enclosure fills with exhaust.",
      target: "heater-switch",
      why: "Carbon monoxide has no smell and no colour, and a duct venting into a sealed, wind-skirted enclosure builds a dangerous concentration long before anyone inside would notice anything wrong. The heater has to stop producing exhaust immediately; reconnecting the duct comes after it is already off, not while it is still running.",
      missNote: "The heater kept running with the duct loose for the rest of the check; the enclosure's air stayed thick with exhaust the whole time nobody was watching it.",
      wrongNote: "The heater switch — a duct venting into a sealed enclosure means the heater stops producing exhaust before anything else happens.",
    },
    {
      id: "wind-gust-skirt",
      kind: "Wind gust tears the enclosure's skirt",
      after: "overnight-track", delay: 2, seconds: 12,
      alert: "A hard gust has torn the wind skirt loose at the corner, and cold air is pouring straight onto the blanketed slab.",
      cue: "Re-secure the skirt panel before the corner of the slab loses its protection.",
      target: "skirt-panel-a",
      why: "A torn skirt in a hard wind strips the heat the blankets are holding faster than the heater can replace it, and the corner nearest the tear is the first part of the slab to actually drop toward freezing. Re-securing the panel immediately is what stops that corner from becoming the one part of the pour that never reaches the plan's strength.",
      missNote: "The gap in the skirt stayed open through the rest of the watch; the corner nearest it read colder than the rest of the slab for the remainder of the night.",
      wrongNote: "The skirt panel — cold air pouring onto the slab through a torn skirt has to be closed off before the corner loses its protection.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, CMCW_ACCENT);
    const ground = box(g, 8.6, 0.04, 6.6, 0, 0.02, -0.3, 0xffffff);
    ground.material = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "broom", tone: "#c9c6bc", tone2: "#bdbab0" }), { repeat: 4, px: 512 }), { rough: 0.9, color: 0xeceae2 });

    // ------------------------------------------------------------- the slab and enclosure
    const bay = group(g, 0, 0.02, -1.4);
    const slabTex = texturedMat(surfaceTexture((cx, w, h) => concreteFace(cx, w, h, { finish: "smooth", tone: "#9a968c", tone2: "#8e8a80" }), { repeat: 3, px: 512 }), { rough: 0.7, color: 0xe4dfd0 });
    const slabFloor = box(bay, 5.0, 0.04, 3.6, 0, 0.02, 0, 0xffffff);
    slabFloor.material = slabTex;
    const jointLine = box(bay, 5.0, 0.006, 0.03, 0, 0.043, 1.6, 0x2b2f34, { rough: 0.6, cast: false });
    void jointLine;
    const coldJointHit = box(bay, 1.4, 0.1, 0.3, -1.4, 0.08, 1.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, coldJointHit, "cold-joint-exposed");
    holoTag(bay, "exposed construction joint", -1.4, 0.3, 1.6, { css: CMCW_CSS, w: 0.36 });
    const jointBlanketSupply = group(bay, -1.4, 0.02, 1.9, 0.2);
    box(jointBlanketSupply, 0.4, 0.06, 0.3, 0, 0.03, 0, 0x2f7d4a, { rough: 0.9 });
    holoTag(jointBlanketSupply, "cover the joint", 0, 0.2, 0, { css: CMCW_CSS, w: 0.28 });
    reg(hits, jointBlanketSupply, "cover-joint");

    const blankets = [];
    for (let i = -1; i <= 1; i++) { const bl = box(bay, 1.5, 0.06, 3.4, i * 1.6, 0.06, 0, 0x2f7d4a, { rough: 0.9 }); bl.scale.set(0.02, 1, 0.02); bl.visible = false; blankets.push(bl); }
    const blanketRoll = group(g, -3.4, 0.02, 1.6, 0.3);
    cyl(blanketRoll, 0.16, 0.16, 0.7, 0, 0.16, 0, 0x2f7d4a, { rough: 0.9, seg: 12 });
    reg(hits, blanketRoll, "blanket-roll");
    holoTag(blanketRoll, "curing blanket roll", 0, 0.42, 0, { css: CMCW_CSS, w: 0.32 });
    const slabZoneHit = box(bay, 5.0, 0.1, 3.6, 0, 0.09, 0, 0xffffff, { opacity: 0.001, transparent: true, cast: false });
    hits["slab-zone"] = slabZoneHit;

    // ------------------------------------------------------------- heater, duct, exhaust
    const heater = group(g, 3.2, 0.02, -0.6, -0.3);
    box(heater, 0.7, 0.5, 1.1, 0, 0.28, 0, 0xf2703b, { rough: 0.6, metal: 0.3 });
    reg(hits, heater, "heater-too-close");
    holoTag(heater, "heater staged against the blanket", 0, 0.62, 0, { css: CMCW_CSS, w: 0.44 });
    const touchHazardHit = box(heater, 0.3, 0.3, 0.3, -0.5, 0.3, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(heater, "drape the blanket over the heater?", -0.5, 0.6, 0, { css: "#d2312b", w: 0.48 });
    reg(hits, touchHazardHit, "blanket-touching-heater");
    const heaterSwitch = box(heater, 0.08, 0.06, 0.03, 0.3, 0.5, 0.4, 0xd2312b, { rough: 0.5, metal: 0.3 });
    holoTag(heater, "heater start switch", 0.3, 0.62, 0.4, { css: CMCW_CSS, w: 0.3 });
    reg(hits, heaterSwitch, "heater-switch");
    const moveHeaterSupply = group(g, 2.4, 0.02, -0.2, 0.2);
    box(moveHeaterSupply, 0.14, 0.12, 0.12, 0, 0.06, 0, CMCW_PAL.trim, { rough: 0.6, metal: 0.4 });
    holoTag(moveHeaterSupply, "move the heater clear", 0, 0.2, 0, { css: CMCW_CSS, w: 0.32 });
    reg(hits, moveHeaterSupply, "move-heater");
    const exhaustDuct = cyl(heater, 0.08, 0.08, 1.0, 0.3, 0.55, -0.3, 0x8b949d, { rough: 0.5, metal: 0.5, seg: 12 });
    exhaustDuct.rotation.z = 0.3;
    reg(hits, exhaustDuct, "heater-exhaust");
    holoTag(heater, "heater exhaust duct", 0.3, 0.9, -0.3, { css: CMCW_CSS, w: 0.32 });
    const exhaustInsideHit = box(heater, 0.4, 0.3, 0.4, 0, 0.9, -0.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(heater, "leave it venting inside?", 0, 1.15, -0.6, { css: "#d2312b", w: 0.44 });
    reg(hits, exhaustInsideHit, "heater-exhaust-inside");

    // ------------------------------------------------------------- skirt panels
    const skirtA = group(g, -2.6, 0.02, -1.4, 0.3);
    box(skirtA, 0.06, 1.6, 1.4, 0, 0.8, 0, 0x3a4550, { rough: 0.7, opacity: 0.85, transparent: true });
    reg(hits, skirtA, "skirt-panel-a");
    holoTag(skirtA, "wind skirt — panel A", 0, 1.7, 0, { css: CMCW_CSS, w: 0.32 });
    const skirtB = group(g, 2.6, 0.02, -1.4, -0.3);
    box(skirtB, 0.06, 1.6, 1.4, 0, 0.8, 0, 0x3a4550, { rough: 0.7, opacity: 0.85, transparent: true });
    reg(hits, skirtB, "skirt-panel-b");
    holoTag(skirtB, "wind skirt — panel B", 0, 1.7, 0, { css: CMCW_CSS, w: 0.32 });
    const skirtGapHit = box(g, 0.5, 1.2, 0.3, 1.9, 0.6, -2.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, skirtGapHit, "gap-in-skirt");
    holoTag(g, "gap in the wind skirt", 1.9, 1.3, -2.8, { css: CMCW_CSS, w: 0.32 });
    const closeSkirtSupply = group(g, 2.2, 0.02, -2.5, 0.2);
    box(closeSkirtSupply, 0.4, 0.5, 0.06, 0, 0.25, 0, 0x3a4550, { rough: 0.7 });
    holoTag(closeSkirtSupply, "close the skirt gap", 0, 0.55, 0, { css: CMCW_CSS, w: 0.32 });
    reg(hits, closeSkirtSupply, "close-skirt-gap");
    const snow = particles(g, 80, 0xf4f6f8, { size: 0.02, life: 2.2, additive: false, opacity: 0.6 });

    // ------------------------------------------------------------- thermometer, monitor, strength ticket
    const thermo = instrument(g, -1.6, 0.5, -2.4, { idle: "--°", color: CMCW_CSS, w: 0.14, d: 0.2 });
    holoTag(g, "ground thermometer", -1.6, 0.74, -2.4, { css: CMCW_CSS, w: 0.32 });
    reg(hits, thermo, "ground-thermometer");
    const monitor = group(g, 0.2, 0.02, -2.6, 0.2);
    box(monitor, 0.04, 1.2, 0.04, 0, 0.6, 0, 0x8b949d, { rough: 0.5, metal: 0.6 });
    const monitorFace = decal(monitor, 0.26, 0.16, 0, 1.25, 0.026, signFace("TEMP —", { bg: "#0d1c24", accent: CMCW_CSS, fg: "#bfeaf7", scale: 0.3 }), { px: 192, glow: true, ei: 0.7 });
    holoTag(monitor, "under-blanket monitor", 0, 1.48, 0, { css: CMCW_CSS, w: 0.36 });
    reg(hits, monitor, "temp-monitor");
    const ticket = holoPanel(g, 0.9, 0.6, 3.2, 1.5, -2.6, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMCW_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("STRENGTH TICKET — SLAB C", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Result: meets the plan's minimum", "Protection duration: per the plan"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: 0.4, accent: CMCW_ACCENT });
    reg(hits, ticket, "strength-ticket");

    // ------------------------------------------------------------- bare hand hazard, cards, log, radio, crew
    const bareHandHit = box(bay, 0.6, 0.3, 0.4, 2.0, 0.2, 1.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "work the ties bare-handed in this wind?", 2.0, 0.5, 1.5, { css: "#d2312b", w: 0.5 });
    reg(hits, bareHandHit, "bare-skin-wind-chill");
    const pullEarlyHit = box(bay, 1.5, 0.3, 3.4, 1.6, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bay, "pull the blankets now?", 1.6, 0.5, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, pullEarlyHit, "pull-blankets-early");

    const board = group(g, -3.2, 0.02, -1.0, 0.1);
    holoPanel(board, 0.95, 0.62, 0, 1.25, 0, (ctx, w, h) => {
      ctx.fillStyle = "#22201a"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = CMCW_CSS; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#efeade"; ctx.fillText("COLD WEATHER PLAN — SLAB C", w * 0.06, h * 0.14);
      ctx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; ctx.fillStyle = "#f7f4ec";
      ["Minimum mix and ground temp: per the plan", "Protection duration: per ACI 306", "Strength before strip: per the plan", "Heater exhaust: ducted outside the enclosure"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.28 + i * 0.11)));
    }, { accent: CMCW_ACCENT });
    reg(hits, board, "cold-plan");

    const log = group(g, 3.0, 0.02, 2.6, -0.1);
    box(log, 0.03, 1.1, 0.03, 0, 0.55, -0.02, 0x8b949d, { rough: 0.5, metal: 0.6 });
    log.userData.face = decal(log, 0.62, 0.44, 0, 1.3, 0.01, signFace("COLD WEATHER LOG —\nSLAB C", { bg: "#171108", accent: CMCW_CSS, fg: "#efeade", scale: 0.24 }), { px: 384, glow: true, ei: 0.6 });
    holoTag(log, "cold weather log", 0, 1.62, 0, { css: CMCW_CSS, w: 0.24 });
    reg(hits, log, "close-log");
    const crewRadio = group(g, 3.6, 0.02, 2.8, -0.2);
    box(crewRadio, 0.1, 0.18, 0.06, 0, 0.09, 0, 0x2b2f34, { rough: 0.6 });
    crewRadio.userData.screen = decal(crewRadio, 0.08, 0.05, 0, 0.15, 0.031, signFace("—", { bg: "#0d1c24", accent: CMCW_CSS, fg: "#bfeaf7", scale: 0.5 }), { px: 128, glow: true, ei: 0.6 });
    holoTag(crewRadio, "crew radio", 0, 0.3, 0, { css: CMCW_CSS, w: 0.2 });
    reg(hits, crewRadio, "crew-radio");

    const mason = standingFigure(g, 0.6, 2.6, { ry: -2.6, cloth: 0x4a4038, vest: CMCW_PAL.accent, helmet: 0xf2f2f2, gloves: true });
    holoTag(mason, "cement mason", 0, 1.9, 0, { css: CMCW_CSS, w: 0.24 });
    for (const [x, z] of [[3.8, -2.4], [-3.8, 2.6]]) cone(g, x, z);

    // ------------------------------------------------------------- yard dressing
    // A stacked pallet of spare block, a spare-parts rack and a rebar offcut
    // pile — ordinary jobsite clutter kept clear of the working area.
    const yard = group(g, 3.8, 0.02, 2.6, 0.3);
    for (let r = 0; r < 7; r++) for (let c = 0; c < 8; c++) box(yard, 0.16, 0.12, 0.16, -0.7 + c * 0.2, 0.08 + r * 0.01, -0.7 + r * 0.2, r % 2 ? 0xb9b4a8 : 0xa89f8f, { rough: 0.9 });
    const partsRack = group(g, -3.8, 0.02, 2.0, -0.3);
    box(partsRack, 0.7, 0.05, 0.35, 0, 0.9, 0, CMCW_PAL.trim, { rough: 0.6, metal: 0.5 });
    for (let i = 0; i < 5; i++) cyl(partsRack, 0.02, 0.02, 0.55, -0.28 + i * 0.14, 0.55, 0, 0x8b949d, { rough: 0.5, metal: 0.6, seg: 6 });
    const offcutPile = group(g, -3.0, 0.02, -3.2, 0.2);
    for (let i = 0; i < 6; i++) cyl(offcutPile, 0.012, 0.012, 0.5 + (i % 3) * 0.1, -0.24 + i * 0.09, 0.06, 0, 0x7a5c3a, { rough: 0.9, seg: 6 }).rotation.z = Math.PI / 2;

    let heaterOn = false, heaterExhaustOk = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "fix") { coldJointHit.visible = false; heater.position.x = 2.8; touchHazardHit.visible = false; skirtGapHit.visible = false; }
        if (step.id === "blanket-lay") for (const bl of blankets) { bl.visible = true; bl.scale.set(1, 1, 1); }
        if (step.id === "skirt-enclosure") { skirtA.visible = true; skirtB.visible = true; }
        if (step.id === "heater-vent") heaterExhaustOk = true;
        if (step.id === "heater-start") heaterOn = true;
        if (step.id === "blanket-pull") { for (const bl of blankets) bl.visible = false; repaint(log.userData.face, signFace("COLD WEATHER LOG —\nCONFIRMED + PULLED", { bg: "#171108", accent: "#59c97b", fg: "#d8f5e0", scale: 0.2 })); }
        if (step.id === "crew-checkin") repaint(crewRadio.userData.screen, signFace("SLAB C DONE", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.4 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "heater-exhaust-fails") { exhaustDuct.rotation.z = -0.4; heaterExhaustOk = false; }
        if (it.id === "wind-gust-skirt") skirtA.rotation.y = 0.6;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "heater-exhaust-fails") { exhaustDuct.rotation.z = 0.3; heaterExhaustOk = true; heaterOn = false; }
        if (it.id === "wind-gust-skirt") skirtA.rotation.y = 0;
      },
      animate(t, dt, session) {
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "temp-check") repaint(thermo.userData.screen, signFace(`${Math.round(20 + gg.t * 40)}°F`, { bg: "#22201a", accent: gg.t >= 0.44 && gg.t <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#f7f4ec", scale: 0.55 }));
        const tr = session?.track;
        if (tr && step?.id === "overnight-track") repaint(monitorFace, signFace(tr.v < 0.42 ? "DROPPING" : tr.v > 0.62 ? "WARM" : "IN BAND", { bg: "#0d1c24", accent: tr.v >= 0.42 && tr.v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.3 }));
        if (step?.id === "heater-start" && session.holding) heaterOn = true;
        if (heaterOn && heaterExhaustOk) exhaustDuct.material && (exhaustDuct.material.opacity = 1);
        snow.userData.step(dt ?? 0.016, new THREE.Vector3(0, 3.0, -1.4), 3.5, 2.5, -0.4);
        void CITY;
      },
    };
  },
};
