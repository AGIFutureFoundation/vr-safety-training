import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, group, repaint, mat, particles, signFace } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, instrument, reg,
  surfaceTexture, texturedMat, waterFace, mudflatFace,
} from "../citykit.js";
import { skiff } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Beach Seine Fish Survey & Handling VR — SF Bay Restoration &
// Cleanup, Pack E (ecology, monitoring and community science).
//
// A shallow beach on the restoration shoreline, and the learner is the
// fisheries technician running today's beach seine under a CDFW permit,
// with a skiff — the fleet.js builder — used to set the offshore end of the
// net before the beach crew hauls it in. Every fish that comes up in the
// net is named only at the generic level this pack's rules require: Pacific
// herring, topsmelt, staghorn sculpin, and whatever "a young salmonid"
// turns up in the haul. Nothing is held out of the water longer than the
// permit's handling window allows, and every fish this station touches
// goes back into the Bay before that window closes.

const BRBS_ACCENT = 0x4a9e8a;
const BRBS_CSS = "#4a9e8a";
const BRBS_GREEN = 0x59c97b;
const BRBS_AMBER = 0xe8b02e;
const BRBS_RED = 0xd2312b;

export const SIM_BR_BEACH_SEINE_FISH_SURVEY_AND_HANDLING = {
  id: "br-beach-seine-fish-survey-and-handling",
  index: "348",
  domain: "Water & Environmental",
  trade: "Fisheries technician, running a beach seine survey and skiff set for a restoration monitoring programme under a CDFW permit",
  category: "Water & Environmental",
  district: "Water & Environmental",
  weather: "clear",
  certification: "California Department of Fish and Wildlife (CDFW) permit conditions for the take, handling and release of fish in survey work; NOAA tide predictions and Endangered Species Act consultation for any protected species encountered; USCG 33 CFR Part 83 Inland Navigation Rules for the skiff set; USCG 46 CFR Part 160 lifesaving equipment, including personal flotation devices; OSHA 29 CFR 1910.132 personal protective equipment, general requirements",
  name: "Beach Seine Fish Survey & Handling",
  title: simTitle("Beach Seine Fish Survey & Handling"),
  tagline: "The survey that never costs a fish more than it has to: today's permit read before the net leaves the skiff, the gear checked for a torn panel before it's set, the net run out from the skiff and hauled in as one crew, a protected species released ahead of the routine tally, a snag answered by easing off rather than forcing the haul, every fish handled and identified inside the permit's window, and every one of them back in the water before that window closes",
  accent: BRBS_ACCENT,
  accentCss: BRBS_CSS,
  parSeconds: 310,
  footprint: 3.0,
  badge: { id: "clean-haul-clean-release", name: "Clean Haul, Clean Release", note: "The permit was checked before the net was set, the protected species got priority release, the snag was eased off rather than forced, and every fish went back inside the handling window" },

  supportLine: "your agency's employee assistance programme, with CDFW's own permit-compliance line behind it",

  game: system({
    name: "Seine Survey Watch",
    currency: "HAULS",
    ranks: ["Beach Crew", "Seine Technician", "Lead Technician", "Senior Technician", "Beach Seine Certified"],
    badges: [
      { id: "true-permit", name: "True Permit", note: "The permit board checked and the gear cleared before the net ever left the skiff", test: AWARD.stepClean("permit-board") },
      { id: "clean-haul", name: "Clean Haul", note: "Never handled a fish past the window, never released one back into the net, never skipped the PFD", test: AWARD.safe },
      { id: "held-the-window", name: "Held The Window", note: "The handling window landed inside the correct band, first time", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-survey", name: "Clean Survey", note: "No corrections across the whole haul", test: AWARD.clean },
      { id: "steady-watch", name: "Steady Watch", note: "Held the net scan in band through the whole haul", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Survey closed out inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-permit-check": "You set the net without checking today's permit conditions first. The species, the quota and the season this survey is allowed to work under are all set in the CDFW permit for this specific site, not decided by the crew on the beach, and a net set on yesterday's assumption instead of today's permit is a take the permit was never actually issued to cover.",
    "handle-fish-too-long": "You kept a fish out of the water past the handling window to finish the measurement. Every extra second out of the water is a second of stress a fish that's already been netted, hauled and handled doesn't have to spare, and 'just one more measurement' is exactly the reasoning the handling window exists to override — the fish goes back in the water on the window's schedule, not once the last number is written down.",
    "release-into-net": "You released a fish back into the water right next to the net that's still set. A fish released inside or against a net that hasn't been pulled yet is a fish that's simply caught again, now further stressed by a second capture that taught the survey nothing new — release only happens clear of the net, in open water, every time.",
    "no-pfd-net-set": "You hopped back into the skiff to reset the net without your PFD on. Setting a net from a small skiff means leaning out over the gunwale with both hands busy with the net, which is exactly the moment a PFD matters most and exactly the moment it's easiest to skip because it feels like a two-minute job — it goes on before every trip off the beach, not just the ones that feel long enough to bother.",
  },

  lateNotes: {
    "handling-clock": "Nothing to read yet — a fish has to actually be out of the water before there's a handling window to watch.",
    "tally-board": "Nothing to log yet — the net hasn't been hauled and nothing has been counted.",
  },

  interrupts: [
    {
      id: "protected-species-in-net",
      kind: "A young salmonid turns up in the net",
      after: "haul-checklist", delay: 2, seconds: 14,
      alert: "A young salmonid protected under the Endangered Species Act has turned up in the haul, still in the net with the rest of the catch.",
      cue: "Give it priority release immediately — do not add it to the routine tally first.",
      target: "priority-release",
      why: "A listed species gets released with the least possible handling the permit's Endangered Species Act consultation allows, which means it does not wait in line behind the rest of the catch for its turn at the tally board — the routine count can wait; a protected fish still out of the water cannot.",
      missNote: "The salmonid sat in the net waiting its turn at the tally board instead of getting released first — exactly the extra handling its protected status exists to prevent.",
      wrongNote: "Priority release — that's the one action that gets a protected species back in the water ahead of the routine count.",
    },
    {
      id: "net-snags-submerged-object",
      kind: "The net snags on something submerged mid-haul",
      after: "net-scan", delay: 2, seconds: 14,
      alert: "The net has snagged on something submerged partway through the haul, and the rope has gone taut against it.",
      cue: "Signal the skiff to stop hauling immediately — do not force it through the snag.",
      target: "haul-stop-signal",
      why: "Forcing a haul through a snag is how a net panel tears or how a skiff pulling against a fixed object suddenly loses its own stability, and neither the beach crew nor the skiff can tell from their end alone what the net has actually caught on — the stop signal is what gets both ends easing off together instead of one side pulling against a problem the other side can't see.",
      missNote: "The haul kept pulling against the snag instead of stopping — exactly the moment a torn panel or a skiff in trouble is most likely.",
      wrongNote: "The stop signal — that's the one call that gets both ends of the haul easing off together.",
    },
  ],

  steps: [
    {
      id: "ppe-brief", kind: "sequence", anyOrder: true,
      targets: ["pfd-on", "boots-on", "gloves-on"],
      itemNames: { "pfd-on": "PFD on and buckled", "boots-on": "wading boots on", "gloves-on": "wet-work gloves on" },
      title: "Gear up before the skiff launches",
      cue: "Before the skiff launches: PFD on and buckled, wading boots on, wet-work gloves on.",
      why: "Setting a net from a small skiff means leaning over the gunwale with both hands on the net rather than on anything that would catch a fall, and the PFD is what keeps that fall survivable — the boots and gloves are what get the rest of the crew through a beach and a net that are both wet the entire shift.",
    },
    {
      id: "permit-board", kind: "select", target: "permit-board",
      title: "Read today's permit conditions",
      cue: "Read the permit board: today's site, season and species conditions, and the handling window per the permit.",
      why: "The species this survey is allowed to target, the season it's allowed to run in and the window a fish can be handled for are all set in CDFW's own permit for this site, not decided on the beach, and reading the board before the net ever leaves the skiff is what keeps today's haul inside the permit it's actually being run under.",
    },
    {
      id: "species-id-board", kind: "select", target: "species-id-board",
      title: "Review the species reference before the haul",
      cue: "Review the species reference: Pacific herring, topsmelt, staghorn sculpin, and what a young salmonid looks like against all three.",
      why: "A haul identified wrong at the tally board is a survey record that says something that didn't actually happen, and five minutes with the reference before the first set is what keeps the crew fast and correct once the net is actually full and every fish in it needs an answer quickly.",
    },
    {
      id: "check-gear", kind: "find", noHint: true,
      targets: ["torn-net-panel", "cracked-livewell"],
      itemNames: { "torn-net-panel": "the seine net, torn along one panel", "cracked-livewell": "the livewell aerator, cracked at the fitting" },
      itemNotes: {
        "torn-net-panel": "A torn panel lets exactly the smaller fish this survey is trying to count slip straight back out mid-haul — found now, on the beach, it's a patch; found mid-haul it's a survey with a hole in its own data.",
        "cracked-livewell": "A cracked fitting means the livewell won't actually hold water under pressure, and a fish that goes in for a quick revival needs that water to actually be there — check it before the first fish needs it.",
      },
      title: "Check the gear before the net goes out",
      cue: "Walk the gear laid out on the beach and find anything wrong with it before the skiff sets the net.",
      why: "The net and the livewell are the two pieces of equipment this whole survey depends on, and finding a torn panel or a cracked fitting now, before either one is actually needed, costs nothing — finding either one mid-haul costs the survey a clean count or a fish that needed the livewell and didn't have one.",
    },
    {
      id: "set-net-from-skiff", kind: "drag", target: "net-bag",
      title: "Run the net out from the skiff",
      cue: "Drag the net bag from the skiff out to the offshore anchor point, running the line as the skiff motors out.",
      why: "A beach seine only samples the water it's actually set across, and running the offshore end out clean from the skiff — rather than dumping it over the side wherever the skiff happens to be — is what makes today's haul a survey of a known stretch of water instead of a stretch of net that ended up wherever the current took it.",
      drag: { to: "beach-anchor-socket", radius: 0.4, missNote: "Not at the anchor point — the net has to actually reach the marked stretch, not just get close to it." },
    },
    {
      id: "haul-checklist", kind: "sequence",
      targets: ["shore-end-secured", "skiff-end-set", "haul-begun"],
      itemNames: { "shore-end-secured": "shore end of the net secured", "skiff-end-set": "skiff end confirmed set at the anchor point", "haul-begun": "haul signal given to both ends" },
      outOfOrderNote: "Secure the shore end before the skiff end is even confirmed set — a haul that starts before both ends are actually anchored just pulls the net sideways.",
      title: "Confirm both ends and start the haul",
      cue: "Secure the shore end, confirm the skiff end is set at the anchor point, then signal both ends to begin the haul together.",
      why: "A net hauled from one end before the other is actually secured doesn't close around anything, it just drags sideways through the water, and confirming both ends before the haul signal is what turns two separate crews doing two separate jobs into one haul that actually samples the water between them.",
    },
    {
      id: "handling-timer-dial", kind: "turn", target: "handling-timer-dial",
      title: "Set the handling-time stopwatch",
      cue: "Turn the stopwatch dial to today's permit handling window before the first fish comes out of the net.",
      turn: { turns: 0.6, label: "HANDLING WINDOW" },
      why: "The handling window is set in the permit to what a netted fish can actually tolerate out of the water, not to whatever pace feels comfortable for the crew, and setting the stopwatch before the first fish is handled is what turns that number into something the crew is actually held to rather than a rule remembered only after the fact.",
    },
    {
      id: "net-scan", kind: "track", target: "net-line", seconds: 6,
      title: "Scan the net as it comes in",
      cue: "Hold a steady scan along the net as it's hauled in — a snag or a protected species has to be caught the moment it shows, not after the net's already on the beach.",
      track: { start: 0.13, green: [0.4, 0.62], rise: 0.5, fall: 0.42, drift: 0.12, label: "NET SCAN", readout: (v) => (v < 0.4 ? "scanning too fast — near end missed" : v > 0.62 ? "scanning too slow — far end missed" : "haul scanned clean") },
      why: "A net hauled without anyone actually watching it come in is a net that only gets checked once everything in it is already on the beach, and a scan that rushes past the near end or drags past the far end is exactly how a snag or a protected species goes unnoticed until the haul is already finished.",
      holdBreakNote: "The scan lost the net before the haul finished — steady it and pick the pass back up.",
    },
    {
      id: "catch-hold", kind: "hold", target: "net-line", seconds: 5,
      title: "Hold the net steady for the tally",
      cue: "Hold the net steady on the beach while the catch is sorted and counted — a net that's still moving is a fish that's still stressed.",
      why: "A net that keeps shifting on the beach makes every fish in it work harder to stay upright in water that won't hold still, which adds exactly the kind of stress the handling window is trying to minimise — holding it steady for the tally is what keeps the counting itself from costing the catch anything extra.",
      holdBreakNote: "The net slipped before the tally finished — steady it and hold it through to the end of the count.",
    },
    {
      id: "handling-clock", kind: "gauge", target: "handling-clock",
      title: "Release inside the handling window",
      cue: "Watch the handling clock and get the catch back in the water once it reads inside the window — not before every fish is counted, and not past the window either.",
      gauge: { label: "HANDLING WINDOW", speed: 0.55, green: [0.46, 0.64], readout: (t) => (t < 0.46 ? "too early — tally not finished yet" : t <= 0.64 ? "inside the window — release now" : "past the window — release immediately"), missNote: "Off the band. The permit's handling window has to actually be read and released on, not guessed at." },
      why: "Releasing before the tally is finished loses data the survey needs, and releasing past the window is exactly how a fish that survived the haul doesn't survive the counting — the window on the clock is the one number that isn't a judgement call, it's what the permit says this catch can actually tolerate.",
    },
    {
      id: "tally-board", kind: "select", target: "tally-board",
      title: "Log today's tally",
      cue: "Log the tally: species counts at the generic reference level, the protected species released, and the handling time for the haul.",
      why: "The restoration programme's own fish survey record is built entirely out of entries like this one, and a tally logged right after release — while the exact counts are still what was actually seen, not what gets remembered back at the truck — is the version of today's haul that can actually stand behind next season's comparison.",
    },
    {
      id: "release-checklist", kind: "sequence",
      targets: ["revival-bucket-checked", "fish-released"],
      itemNames: { "revival-bucket-checked": "livewell checked for any fish needing revival", "fish-released": "catch released clear of the net" },
      outOfOrderNote: "Check the livewell for any fish that needs reviving before the rest of the catch is released — a fish that's still recovering shouldn't go back in with the ones that are ready.",
      title: "Run the release checklist in order",
      cue: "Check the livewell for any fish that needs a moment to revive, then release the whole catch clear of the net.",
      why: "A fish that came up stressed sometimes needs a minute in aerated water before it can swim off on its own, and checking for that before the general release is what keeps a fish that isn't ready yet from going back into open water where it can't actually hold its own position — release only happens once every fish in the catch is actually able to swim away.",
    },
    {
      id: "crew-checkin", kind: "select", target: "beach-radio",
      title: "Check in with the skiff",
      cue: "On the working channel: the haul is complete, the salmonid and the snag are both handled, and how the skiff crew is doing after a haul with two interruptions in it.",
      why: "A haul with a protected species and a snag both in it is a haul the skiff crew spent more alert than a routine set, and the check-in is where that gets acknowledged directly — it's also where the beach crew's own read on a tense haul gets a place to go besides staying with them on the sand.",
    },
    {
      id: "closing-log", kind: "select", target: "tally-board",
      title: "Close out the survey log",
      cue: "Close the log: the permit conditions held, the tally complete, the salmonid released, and every fish back in the water inside the window.",
      why: "The closing entry is what turns today's individual counts and holds into the record CDFW's own permit compliance review is actually built from — a log closed out completely, in order, is the difference between a survey programme that renews on the strength of its own record and one that raises a question nobody on this beach can answer months later.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRBS_ACCENT);

    // -------------------------------------------------------------- the beach
    const beachTex = surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#8a7a5a", base2: "#6a5c42" }), { repeat: 3, px: 256 });
    const beach = box(g, 14, 0.06, 10, -3, 0.03, 1, 0x8a7a5a, { rough: 0.9 });
    beach.material = texturedMat(beachTex, { rough: 0.9, color: 0xb0a480 });

    // -------------------------------------------------------------- the water
    const water = box(g, 22, 0.02, 14, 3, 0.05, -3, 0xffffff, { rough: 0.14, metal: 0.22, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303e", mid: "#1a4050", crest: 280 }), { repeat: 5, px: 512 }), { rough: 0.14, metal: 0.22, color: 0xa2c4d8 });
    const wave = particles(g, 16, 0xbfe6f2, { size: 0.03, life: 0.9, additive: false, opacity: 0.3 });
    wave.position.set(3, 0.06, -3);

    // -------------------------------------------------------------- the skiff
    const sk = skiff(g, 3.7, -0.3, -3.7, { ry: -0.5, livery: { fleetName: "BAY MONITOR", unitNumber: "MM-2" } });
    holoTag(sk, "seine skiff", 0, 1.3, 0, { css: BRBS_CSS, w: 0.3 });
    const skHome = sk.position.clone();

    // ---------------------------------------------------------------- crew
    const beachCrew = standingFigure(g, -1.6, 2.2, { ry: 1.1, cloth: 0x3f4a55, vest: 0xe8b02e, helmet: false, gloves: true, atStation: true });
    holoTag(beachCrew, "beach crew", 0, 1.95, 0, { css: BRBS_CSS, w: 0.28 });

    // ---------------------------------------------------------------- the net
    const netGrp = group(g, 0, 0.05, -1);
    const netLine = box(netGrp, 5.5, 0.06, 0.4, 0, 0, 0, 0xdfe6ea, { rough: 0.6, opacity: 0.85, transparent: true });
    for (let i = -2; i <= 2; i++) box(netGrp, 0.04, 0.3, 0.4, i * 1.1, 0.14, 0, 0xc8ced4, { rough: 0.6, opacity: 0.5, transparent: true, cast: false });
    reg(hits, netLine, "net-line");
    const tornPanel = box(netGrp, 0.3, 0.15, 0.04, 1.6, 0.1, 0.18, 0x2b3138, { rough: 0.7, cast: false });
    reg(hits, tornPanel, "torn-net-panel");
    for (let i = -2; i <= 2; i++) ball(netGrp, 0.04, i * 1.1, 0.32, 0.2, BRBS_AMBER, { rough: 0.6, seg: 10 });
    for (let i = -2; i <= 2; i++) cyl(netGrp, 0.015, 0.015, 0.06, i * 1.1, -0.03, 0.2, 0x2b3138, { rough: 0.6, metal: 0.5, seg: 8 });

    // ------------------------------------------------------------- beach clutter
    for (let i = 0; i < 5; i++) {
      const dx = -4 + Math.random() * 8, dz = 1.5 + Math.random() * 2.5;
      box(g, 0.14 + Math.random() * 0.1, 0.05, 0.05, dx, 0.03, dz, 0x6a5c42, { rough: 0.9 }).rotation.y = Math.random() * Math.PI;
    }
    for (let i = 0; i < 3; i++) {
      const bx = 1.5 + i * 2.2, bz = -6.5 - i * 0.6;
      const buoyGrp = group(g, bx, -0.1, bz);
      cyl(buoyGrp, 0.05, 0.08, 0.24, 0, 0.12, 0, BRBS_AMBER, { rough: 0.6, seg: 10 });
      ball(buoyGrp, 0.06, 0, 0.25, 0, BRBS_AMBER, { rough: 0.55, seg: 10 });
    }
    const crateGrp = group(g, -2.9, 0.05, 2.4);
    box(crateGrp, 0.4, 0.24, 0.3, 0, 0.12, 0, 0x6a4a2a, { rough: 0.8 });
    box(crateGrp, 0.42, 0.02, 0.32, 0, 0.25, 0, 0x5a3a1a, { rough: 0.8 });
    holoTag(crateGrp, "spare gear crate", 0, 0.36, 0, { css: BRBS_CSS, w: 0.32 });
    const bucketGrp = group(g, -1.7, 0.05, 2.7);
    cyl(bucketGrp, 0.13, 0.11, 0.22, 0, 0.11, 0, 0xdfe6ea, { rough: 0.5, seg: 14 });
    cyl(bucketGrp, 0.005, 0.005, 0.26, 0.13, 0.24, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(bucketGrp, "revival bucket", 0, 0.3, 0, { css: BRBS_CSS, w: 0.3 });
    const clipboardGrp = group(g, -1.5, 0.85, 3.3, 0.3);
    box(clipboardGrp, 0.14, 0.2, 0.01, 0, 0, 0, 0x8a6a4a, { rough: 0.7 });
    box(clipboardGrp, 0.1, 0.14, 0.002, 0, 0.01, 0.006, 0xece4d0, { rough: 0.6, cast: false });
    holoTag(clipboardGrp, "field clipboard", 0, 0.24, 0, { css: BRBS_CSS, w: 0.28 });

    const netBagGrp = group(g, 3.5, -0.25, -3.3, 0.4);
    box(netBagGrp, 0.4, 0.2, 0.3, 0, 0, 0, 0xdfe6ea, { rough: 0.6 });
    holoTag(netBagGrp, "net bag — on the skiff", 0, 0.3, 0, { css: BRBS_CSS, w: 0.4 });
    reg(hits, netBagGrp, "net-bag");
    const netBagHome = netBagGrp.position.clone();
    const anchorSocket = group(g, 2.4, 0, -3.3);
    hits["beach-anchor-socket"] = anchorSocket;
    const anchorStake = cyl(g, 0.02, 0.02, 0.4, 2.4, 0.2, -3.3, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    void anchorStake;

    // -------------------------------------------------------------- livewell
    const livewellGrp = group(g, -2.6, 0.05, 3.0);
    box(livewellGrp, 0.5, 0.3, 0.35, 0, 0.15, 0, 0x3a4048, { rough: 0.55, metal: 0.3 });
    const livewellWater = box(livewellGrp, 0.44, 0.02, 0.3, 0, 0.29, 0, 0x1a4050, { rough: 0.2, metal: 0.1, opacity: 0.7, transparent: true });
    void livewellWater;
    holoTag(livewellGrp, "livewell", 0, 0.42, 0, { css: BRBS_CSS, w: 0.24 });
    const cracked = box(livewellGrp, 0.06, 0.03, 0.02, 0.2, 0.2, 0.17, 0xd2312b, { rough: 0.6, cast: false });
    reg(hits, cracked, "cracked-livewell");
    const revivalMarker = group(g, -2.6, 0.3, 3.0);
    hits["revival-bucket-checked"] = revivalMarker;

    // -------------------------------------------------------------- boards
    const permitBoard = holoPanel(g, 0.94, 0.62, -3.8, 1.65, 1.3, (cx, w, h) => {
      cx.fillStyle = "#0e1a1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRBS_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f2ef"; cx.fillText("CDFW PERMIT — TODAY", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dcecea";
      ["Site and season: per the permit", "Target species: per the permit", "Handling window: per the permit",
        "Any listed species: priority release", "Confirm before the net leaves the skiff"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.24 + i * 0.13)));
    }, { ry: 0.4, accent: BRBS_ACCENT });
    reg(hits, permitBoard, "permit-board");

    const speciesBoard = holoPanel(g, 0.94, 0.62, -3.8, 1.65, 2.4, (cx, w, h) => {
      cx.fillStyle = "#0e1a1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = BRBS_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.095)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f2ef"; cx.fillText("SPECIES REFERENCE", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.07)}px Arial, sans-serif`; cx.fillStyle = "#dcecea";
      ["Pacific herring — silver, schooling", "Topsmelt — slender, surface feeder",
        "Staghorn sculpin — bottom, spiny", "A young salmonid — parr marks, priority release"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.28 + i * 0.15)));
    }, { ry: 0.4, accent: BRBS_ACCENT });
    reg(hits, speciesBoard, "species-id-board");

    // ------------------------------------------------------------- controls
    const handlingTimer = instrument(g, -1.0, 0.86, 3.6, { color: 0x2b3138, idle: "0:00", w: 0.1, d: 0.14 });
    const timerDial = cyl(handlingTimer, 0.022, 0.022, 0.025, 0, 0.03, 0.06, 0xc8ced4, { rough: 0.4, seg: 10 });
    timerDial.rotation.x = Math.PI / 2;
    holoTag(handlingTimer, "handling-time stopwatch", 0, 0.16, 0.05, { css: BRBS_CSS, w: 0.42 });
    reg(hits, handlingTimer, "handling-timer-dial");

    const handlingClock = instrument(g, -0.5, 0.86, 3.6, { color: 0x2b3138, idle: "0 min", w: 0.1, d: 0.14 });
    holoTag(handlingClock, "handling window", 0, 0.16, 0.05, { css: BRBS_CSS, w: 0.32 });
    reg(hits, handlingClock, "handling-clock");

    const tallyBoard = holoPanel(g, 0.68, 0.5, -1.6, 1.15, 3.2, (cx, w, h) => drawTally(cx, w, h, ["Herring: —", "Topsmelt: —", "Sculpin: —", "Salmonid: —"], false), { ry: 0.4, accent: BRBS_ACCENT });
    function drawTally(cx, w, h, rows, done) {
      cx.fillStyle = "#0e1a1a"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? BRBS_GREEN : BRBS_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e6f2ef"; cx.fillText("TALLY BOARD", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#dcecea";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }
    reg(hits, tallyBoard, "tally-board");

    // ------------------------------------------------------------- markers
    const shoreEndMarker = group(g, -2.5, 0.4, -1.1);
    box(shoreEndMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, shoreEndMarker, "shore-end-secured");
    const skiffEndMarker = group(g, 2.4, 0.4, -3.3);
    box(skiffEndMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, skiffEndMarker, "skiff-end-set");
    const haulMarker = group(g, 0.5, 0.4, -1.1);
    box(haulMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, haulMarker, "haul-begun");
    const releasedMarker = group(g, 1.5, 0.4, -0.6);
    box(releasedMarker, 0.1, 0.02, 0.1, 0, 0, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, releasedMarker, "fish-released");

    // ------------------------------------------------------------- salmonid
    const salmonGrp = group(g, 0.6, 0.14, -0.9);
    ball(salmonGrp, 0.05, 0, 0, 0, 0x8a9a6a, { rough: 0.5, seg: 10 }).scale.set(1, 0.6, 2.2);
    holoTag(salmonGrp, "young salmonid — priority release", 0, 0.2, 0, { css: "#e8622a", w: 0.5 });
    salmonGrp.visible = false;
    const releaseGrp = group(g, 4.0, 0.06, -2.0);
    hits["priority-release"] = releaseGrp;

    // ------------------------------------------------------------- hazards
    const handleLongHazard = box(g, 0.4, 0.4, 0.3, -1.4, 1.2, 3.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "one more measurement?", -1.4, 1.55, 3.3, { css: "#e8622a", w: 0.4 });
    reg(hits, handleLongHazard, "handle-fish-too-long");

    const releaseIntoNetHazard = box(g, 0.4, 0.4, 0.3, 0.2, 0.5, -0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "release right next to the net?", 0.2, 0.85, -0.4, { css: "#e8622a", w: 0.5 });
    reg(hits, releaseIntoNetHazard, "release-into-net");

    const skipPermitHazard = box(g, 0.4, 0.4, 0.3, -4.6, 1.9, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "skip the permit board?", -4.6, 2.25, 1.9, { css: "#e8622a", w: 0.44 });
    reg(hits, skipPermitHazard, "skip-permit-check");

    const noPfdHazard = box(g, 0.4, 0.4, 0.3, 2.6, -0.1, -3.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "hop back in without the PFD?", 2.6, 0.3, -3.4, { css: "#e8622a", w: 0.5 });
    reg(hits, noPfdHazard, "no-pfd-net-set");

    // ------------------------------------------------------------- radios
    const beachRadio = radio(g, -1.9, 0.85, 2.9, { ry: 0.4 });
    holoTag(g, "beach channel", -1.9, 1.1, 2.92, { css: BRBS_CSS, w: 0.24 });
    reg(hits, beachRadio, "beach-radio");

    const haulStopSignal = group(g, 1.8, 0.9, -1.1);
    cyl(haulStopSignal, 0.05, 0.09, 0.18, 0, 0, 0, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const stopBeacon = ball(haulStopSignal, 0.025, 0, 0.1, 0, BRBS_GREEN, { emissive: BRBS_GREEN, ei: 1.6, seg: 10 });
    holoTag(haulStopSignal, "haul stop signal", 0, 0.18, 0, { css: BRBS_CSS, w: 0.32 });
    reg(hits, haulStopSignal, "haul-stop-signal");

    // ------------------------------------------------------------- PPE rack
    const pfdRack = group(g, -3.2, 0.1, 2.2);
    cyl(pfdRack, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pfd = box(pfdRack, 0.28, 0.34, 0.1, 0, 0.9, 0.05, BRBS_RED, { rough: 0.7 });
    holoTag(pfdRack, "PFD", 0, 1.1, 0, { css: BRBS_CSS, w: 0.2 });
    reg(hits, pfd, "pfd-on");
    const boots = box(g, 0.16, 0.14, 0.28, -3.5, 0.07, 1.9, 0x2b3138, { rough: 0.7 });
    reg(hits, boots, "boots-on");
    const glovesRack = group(g, -3.7, 0.1, 1.7);
    box(glovesRack, 0.1, 0.04, 0.16, 0, 0, 0, 0xd8a63a, { rough: 0.7 });
    holoTag(glovesRack, "gloves", 0, 0.1, 0, { css: BRBS_CSS, w: 0.2 });
    reg(hits, glovesRack, "gloves-on");

    const waterTex = water.material.map;
    let hauling = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0.5, 1.0, -0.3),
      onStep(step) {
        if (step?.id === "net-scan") hauling = true;
      },
      onStepComplete(step) {
        if (step.id === "check-gear") { tornPanel.visible = false; cracked.visible = false; }
        if (step.id === "set-net-from-skiff") { netBagGrp.position.copy(anchorSocket.position); }
        if (step.id === "haul-checklist") { netLine.position.z += 0; }
        if (step.id === "catch-hold") { hauling = false; }
        if (step.id === "release-checklist") { netLine.material = mat(0xdfe6ea, { rough: 0.6, opacity: 0.4, transparent: true }); }
        if (step.id === "tally-board") {
          repaint(tallyBoard.userData.face, (cx, w, h) => drawTally(cx, w, h, ["Herring: counted", "Topsmelt: counted", "Sculpin: counted", "Salmonid: 1, priority released"], false));
        }
        if (step.id === "crew-checkin") { beachRadio.userData.show?.("HAUL OK\nBOTH HANDLED"); }
        if (step.id === "closing-log") {
          repaint(tallyBoard.userData.face, (cx, w, h) => drawTally(cx, w, h, ["Permit: held all haul", "Tally: complete, logged", "Salmonid: released ahead of tally", "Catch: all released in window"], true));
        }
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "protected-species-in-net") salmonGrp.visible = true;
        if (it.id === "net-snags-submerged-object") { stopBeacon.material = mat(BRBS_RED, { emissive: BRBS_RED, ei: 2.2 }); hauling = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "protected-species-in-net") { salmonGrp.position.copy(releaseGrp.position); salmonGrp.visible = false; }
        if (it.id === "net-snags-submerged-object") { stopBeacon.material = mat(BRBS_GREEN, { emissive: BRBS_GREEN, ei: 1.6 }); }
      },
      animate(t, dt, session) {
        wave.visible = true;
        wave.userData.step(dt, new THREE.Vector3(3, 0.06, -3), 1.1, 0.28, -0.1);
        if (waterTex?.offset) { waterTex.offset.x = t * 0.004; waterTex.offset.y = t * 0.006; }
        if (hauling) { netGrp.position.x = Math.max(0, netGrp.position.x - dt * 0.15); sk.position.x = Math.max(skHome.x - 1.5, sk.position.x - dt * 0.2); }
        if (salmonGrp.visible) salmonGrp.position.y = 0.14 + Math.sin(t * 3) * 0.02;
        const step = session?.step;
        if (session?.turn && step?.id === "handling-timer-dial") timerDial.rotation.z = session.turn.amount * 4;
        if (session?.gauge && !session.gauge.committed && step?.id === "handling-clock") {
          const gt = session.gauge.t ?? 0;
          repaint(handlingClock.userData.screen, signFace(`${Math.round(gt * 6)} min`, { bg: "#0d1c24", accent: gt >= 0.46 && gt <= 0.64 ? "#59c97b" : "#f2ae14", fg: "#eaf0dc", scale: 0.6 }));
        }
        void netBagHome;
      },
    };
  },
};
