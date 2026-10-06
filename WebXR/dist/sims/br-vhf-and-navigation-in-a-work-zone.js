import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, torus, hose, group, repaint, mat } from "../../../shared/kit.js";
import {
  stationPad, holoPanel, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, waterFace,
} from "../citykit.js";
import { workboat, skiff, deckBarge } from "../../../shared/fleet.js";
import { radio } from "../../../shared/toolkit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ VHF & Navigation in a Work Zone VR — SF Bay Restoration &
// Cleanup, Pack B (vessel and marine operations).
//
// A workboat holding a restoration work zone on the Bay — a barge with a
// turbidity curtain out, a skiff working the shoreline — and the learner is
// the Inlandboatmen's Union deckhand on watch at the wheelhouse door with the
// VHF, the chart and the log. The job is to keep the zone safe on the water:
// a radio check and a proper watch on the distress channel, a sécurité call
// that tells every vessel around what is out here, the work-zone marker set
// where the chart says it belongs, the tide read off the table the master
// holds, a ferry crossing handled by the rules, a kayaker and a fog bank
// answered as they come, and the whole watch logged. No tide height, no
// visibility distance and no speed is stated as a number: those are the tide
// table's, the master's and the rules' — never the station's. The workboat,
// the skiff and the barge are fleet.js builders.

const BRVN_ACCENT = 0x3fb6c9;
const BRVN_CSS = "#3fb6c9";

export const SIM_BR_VHF_AND_NAVIGATION_IN_A_WORK_ZONE = {
  id: "br-vhf-and-navigation-in-a-work-zone",
  index: "342",
  domain: "Maritime & Ports",
  trade: "Inlandboatmen's Union (IBU) deckhand on radio and lookout watch for a restoration work zone on the Bay, with the master at the helm and the barge crew on the curtain",
  category: "Maritime & Ports",
  district: "Maritime & Ports",
  weather: "fog",
  certification: "Inlandboatmen's Union (IBU) deck practice; USCG 33 CFR 83 Inland Navigation Rules for the crossing, the lookout and the fog signals; 33 CFR 26 bridge-to-bridge radiotelephone watch; 33 CFR 161 vessel traffic service reporting; 33 CFR 165 regulated navigation and safety zones for the work zone; 33 CFR 62 United States Aids to Navigation System for the marker; 47 CFR 80 marine VHF station rules for the radio check and the sécurité call; USCG 46 CFR 25 lifesaving equipment on an uninspected vessel; the vessel's own standing orders for the watch",
  name: "VHF & Navigation in a Work Zone",
  title: simTitle("VHF & Navigation in a Work Zone"),
  tagline: "A restoration work zone kept safe on the water from the wheelhouse door: PFD on before the deck, the radio checked on the working channel and the watch set on 16, the zone's sécurité call made in plain words and the phonetic alphabet, the temporary marker set where the chart puts it, the tide read off the table, a ferry crossing handled by the rules and a kayaker turned out of the zone, fog signals sounded as the bank rolls in, the traffic service told, and the watch logged",
  accent: BRVN_ACCENT,
  accentCss: BRVN_CSS,
  parSeconds: 300,
  footprint: 3.0,
  badge: { id: "clear-channel", name: "Clear Channel", note: "The watch never left 16, nobody was called on the distress channel for chatter, the ferry was never raced, the marker never went in by eye, and both the kayaker and the fog were answered" },

  supportLine: "your union hall's member assistance programme — the Inlandboatmen's Union — with the employer's employee assistance line behind it",

  game: system({
    name: "Bridge Watch",
    currency: "CALLS",
    ranks: ["Ordinary", "Deckhand", "Radio Watch", "Lead Deckhand", "Work Zone Watch Certified"],
    badges: [
      { id: "check-first", name: "Check First", note: "The radio check done before the first call went out", test: AWARD.stepClean("radio-check") },
      { id: "on-the-mark", name: "On The Mark", note: "The marker set inside the chart's band first time", test: AWARD.precise(0.7) },
      { id: "by-the-rules", name: "By The Rules", note: "Never chatted on 16, never raced the ferry, never marked by eye, never left the door", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-watch", name: "Clean Watch", note: "No corrections from the radio check to the log", test: AWARD.clean },
      { id: "steady-lookout", name: "Steady Lookout", note: "The crossing watched in band all the way across", test: AWARD.unbroken },
      { id: "logged-on-time", name: "Logged On Time", note: "Watch logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "chatter-on-16": "You called the barge about lunch on Channel 16. The distress and calling channel is kept clear for exactly the calls that cannot wait — a person in the water, a vessel in trouble, a sécurité warning — and every vessel within range has its watch on it. Working traffic goes to the working channel the master assigned; 16 is for calling, hailing and distress, and then you move off it.",
    "race-the-ferry": "You told the master to push across ahead of the ferry. In a crossing the rules decide who holds course and who gives way, and a workboat that tries to beat a ferry across her bow is betting the whole crew on her engines. The give-way vessel makes an early, obvious alteration that the other bridge can see; the stand-on vessel holds — and a small boat that is unsure is never the one that gambles.",
    "mark-by-eye": "You went to drop the work-zone marker where it looked about right. A temporary marker that is not where the chart and the notice say it is misleads every skipper who trusts it, and can put a vessel on the curtain or the barge's anchor line. The marker goes where the plan puts it, checked against the chart and the aids around it — not by eye from the deck.",
    "leave-the-door": "You left the wheelhouse door to help coil a line aft with the watch unmanned. A lookout by sight and hearing is a rule, not a courtesy, and in a work zone with a curtain out and a skiff inshore, the watch is what sees the kayaker and hears the ferry's signal before anyone else does. The line waits; someone else coils it, or it waits until the watch is relieved.",
  },

  lateNotes: {
    "zone-marker": "The marker is set once the chart position is confirmed against the notice — not before the chart is read.",
    "crossing-bearing": "The crossing is watched once the ferry is called and the master has the bearing — not before the sécurité call has told her what is here.",
    "watch-log": "The watch is logged once the fog signals are sounding and the traffic service has been told — last, not first.",
  },

  steps: [
    {
      id: "pfd-on", kind: "sequence", anyOrder: true,
      targets: ["inflatable-pfd", "pfd-buckle"],
      itemNames: { "inflatable-pfd": "inflatable PFD on and zipped", "pfd-buckle": "waist buckle clipped and snug" },
      title: "Inflatable PFD on at the wheelhouse door",
      cue: "At the wheelhouse door, before the watch starts: inflatable PFD on and zipped, the waist buckle clipped and snug.",
      why: "The watch stands at the door with one foot on the deck and one in the wheelhouse, and the deck is where people go over. The lifesaving equipment rules put a wearable PFD within reach of everyone aboard; the vessel's standing orders put it on the body before the deck, because the one time it matters nobody gets a second to fetch it.",
    },
    {
      id: "radio-check", kind: "find", noHint: true,
      targets: ["squelch-open", "channel-wrong"],
      itemNames: { "squelch-open": "squelch wide open — the set is roaring static", "channel-wrong": "set left on yesterday's working channel" },
      itemNotes: {
        "squelch-open": "The squelch has been turned all the way open and the set is roaring static — a call on 16 would be lost under it, and the watch would not hear a distress call either.",
        "channel-wrong": "The set was left on yesterday's working channel, not the one the master assigned for this zone — the barge and the skiff would be calling a channel nobody is on.",
      },
      title: "Check the VHF before the watch starts",
      cue: "Check the set: power and squelch, the working channel the master assigned for this zone, and a radio check with the barge on that channel — never on 16.",
      why: "A radio check is the only proof that the set transmits, receives and is on the channel everyone else is on, and it is done on the working channel because the calling channel is not for tests. A set roaring static or sitting on the wrong channel is a watch that cannot hear the one call that matters; five seconds at the start of the watch is what finds it.",
    },
    {
      id: "standing-orders", kind: "select", target: "standing-orders",
      title: "Read the master's standing orders for the watch",
      cue: "Read the standing orders for this watch: the working channel, the watch on 16, when to call the master, what to report to the traffic service, and the work zone's limits.",
      why: "The rules set the watch — a lookout by sight and hearing, a bridge-to-bridge watch on the radio — and the master's standing orders say how this vessel keeps them in this zone: who is called about what, what goes to the traffic service, and where the zone's limits are. Knowing your line in them before the first call is what makes a watch a watch and not a person standing at a door.",
    },
    {
      id: "set-watch", kind: "turn", target: "vhf-channel",
      title: "Set the watch on Channel 16",
      cue: "Turn the set to Channel 16 and put the dual watch on so the working channel is scanned under it; 16 is where the watch lives.",
      why: "Every vessel with a VHF keeps its watch on the distress and calling channel, and the bridge-to-bridge rules require a watch on the radio while the vessel is under way or working. The dual watch keeps the working channel in one ear so the barge and the skiff can still be heard — but 16 is the channel the watch is on, and it stays there.",
      turn: { turns: 1, label: "VHF CHANNEL", readout: (t) => (t < 0.4 ? "working channel" : t < 0.95 ? "turning to 16" : "Channel 16 · dual watch") },
    },
    {
      id: "securite-call", kind: "sequence",
      targets: ["ptt-securite", "ptt-position", "ptt-switch"],
      itemNames: { "ptt-securite": "'sécurité, sécurité, sécurité, all stations' — the vessel's name spelled phonetically", "ptt-position": "the work zone: what is out here, where, and the curtain's extent", "ptt-switch": "'listening on 16 and the working channel' — then off the air" },
      outOfOrderNote: "The call opens with sécurité three times and 'all stations' — that is what makes every bridge in range listen before you say where you are.",
      title: "Make the sécurité call for the work zone",
      cue: "On 16, key the set and make the safety call the standing orders give you: 'sécurité' three times, all stations, this vessel's name spelled in the phonetic alphabet, the work zone's position and the curtain's extent, and which channels you are listening on. Then let go of the key.",
      why: "A sécurité call is how a vessel tells everyone in range about something that affects their safe passage — a curtain across the water, a barge on anchor, a skiff working inshore — and it is made on 16 so every watch hears it. The name is spelled phonetically because a name half-heard is a name nobody can call back; the call ends by saying where you are listening, so the traffic that needs to talk to you moves off 16 to do it.",
    },
    {
      id: "read-chart", kind: "select", target: "chart-table",
      title: "Confirm the marker's position against the chart and the notice",
      cue: "At the chart table, read the marker's position from the work plan and the local notice, and find it against the aids around it: the channel marker, the daybeacon, the shoal.",
      why: "The aids to navigation system is how a skipper reads the water, and a temporary marker joins that system the moment it goes in — so it has to be where the notice says, in the relation to the charted aids the notice describes. The chart is where the marker's position is confirmed before the deck sets it; the deck cannot see a shoal.",
    },
    {
      id: "set-marker", kind: "gauge", target: "zone-marker",
      title: "Call the marker's drop as the skiff reaches the position",
      cue: "Watch the skiff run the marker out along the bearing and call 'drop' when it is on the charted position — not short of it and not past it onto the shoal side.",
      why: "The skiff cannot see where it is against the chart from the water; the watch at the chart table can, and the call is what puts the marker where the notice says. Short of the position, the marker leaves the curtain's end unmarked; past it, the marker sits over the shoal and invites a vessel onto it — the band is the charted position and nothing else.",
      gauge: { label: "ALONG THE BEARING", speed: 0.7, green: [0.44, 0.6], readout: (t) => (t < 0.44 ? "short — curtain's end unmarked" : t <= 0.6 ? "on the charted position — drop" : "past it — over the shoal"), missNote: "Outside the band — call the drop on the charted position itself, not short of it and not over the shoal." },
    },
    {
      id: "read-tide", kind: "select", target: "tide-table",
      title: "Read the tide from the master's table",
      cue: "Read the state of the tide from the tide table the master holds — rising or falling, how long to the turn — and tell the barge what it means for the curtain's anchors and the skiff inshore.",
      why: "The tide decides how the curtain hangs, how much scope the barge's anchors need and how much water the skiff has inshore, and the numbers for that live in the tide table for this station and this day — not in anyone's memory. The watch reads it and passes the state of the tide to the crews who work by it; the heights are the table's, per the table.",
    },
    {
      id: "call-ferry", kind: "sequence",
      targets: ["ptt-ferry", "ptt-intentions"],
      itemNames: { "ptt-ferry": "the ferry called by name on 13, this vessel identified and the zone described", "ptt-intentions": "intentions agreed: the ferry holds, this vessel stands clear of her track" },
      outOfOrderNote: "Call her by name and say who you are first — intentions mean nothing to a bridge that does not know who is talking.",
      title: "Call the ferry on the bridge-to-bridge channel",
      cue: "A ferry is coming up on a crossing course with the zone off her bow: call her by name on the bridge-to-bridge channel, say who and where you are, and agree intentions — she holds her track, this vessel stands clear and the skiff stays inshore.",
      why: "The bridge-to-bridge rules exist for exactly this: two vessels whose paths are about to cross, each telling the other what it means to do before either has to guess. A ferry on schedule and a workboat with a curtain out sort a crossing in one exchange on the bridge-to-bridge channel; the alternative is two skippers reading each other's bow wave.",
    },
    {
      id: "watch-crossing", kind: "track", target: "crossing-bearing", seconds: 6,
      title: "Watch the ferry's bearing across the zone",
      cue: "Keep the ferry on the bearing compass as she crosses, calling the bearing to the master steadily — a bearing that stops changing is a collision course.",
      why: "The rules make risk of collision a matter of bearing: a bearing that does not appreciably change means the two vessels are closing on each other, however far off the other looks. The watch keeps the ferry on the compass and calls the bearing so the master can see the crossing opening, and calls it again if it stops moving — the lookout's job is the bearing, not the view.",
      track: { start: 0.14, green: [0.42, 0.6], rise: 0.58, fall: 0.44, drift: 0.12, label: "BEARING", readout: (v) => (v < 0.42 ? "bearing steady — closing" : v > 0.6 ? "lost her — off the compass" : "bearing drawing aft — clear") },
      holdBreakNote: "The bearing was lost or went steady. Bring the ferry back onto the compass and keep calling it until she is clear.",
    },
    {
      id: "fog-signals", kind: "hold", target: "horn-button", seconds: 5,
      title: "Sound the fog signal as the bank comes over the zone",
      cue: "The fog bank is rolling over the zone: hold the horn for the signal the rules give a vessel of this kind in restricted visibility, at the interval the rules give — and keep sounding it.",
      why: "In fog a vessel is heard before it is seen, and the rules give each kind of vessel its own signal and interval in restricted visibility so that the others around can tell what is out there and what it is doing. The signal is the rules' and the interval is the rules'; the watch's job is to sound it and keep sounding it until the master says the visibility is back.",
      holdBreakNote: "The signal stopped early — the ferry and anything else in the fog have lost the one thing that tells them where this vessel is. Hold it for the full signal.",
    },
    {
      id: "vts-report", kind: "select", target: "vts-handset",
      title: "Report the zone and the fog to the traffic service",
      cue: "On the traffic service's channel, report this vessel, the work zone and its marker, the reduced visibility and the skiff inshore, as the standing orders say to.",
      why: "The traffic service watches the Bay's channels and tells the ships in them what is where; a work zone with a curtain out and visibility closing is exactly the kind of thing it needs to know and pass on. The report goes on the service's channel, in the order the standing orders give, so the next ship coming down the channel hears about the zone from a voice it already listens to.",
    },
    {
      id: "watch-log", kind: "select", target: "watch-log",
      title: "Log the watch",
      cue: "Log it: the radio check and the set's faults, the sécurité call and the time, the marker's position, the tide, the ferry exchange and the crossing, the kayaker turned out, the fog signals begun and the traffic service report.",
      why: "The log is the vessel's record of the watch — the calls made and when, the marker's position, the state of the tide, the crossing and what was agreed — and it is what the master, the company and any investigation read afterward. A set found roaring static and left on the wrong channel goes in it too, because that is how it gets fixed on every boat in the fleet.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the master, the barge and the skiff",
      cue: "On the working channel: the watch is logged, the fog signals are sounding, the marker is set and the ferry is clear — and how everyone is after a crossing in closing fog.",
      why: "The barge crew worked the curtain blind to the ferry, the skiff was inshore with a kayaker in its water, and the master brought the vessel through a crossing with the fog coming down — each needs to hear the zone is quiet. It is the crew's own check-in too: a close crossing in fog stays with people, and the union's member assistance line is there for what does not get said on the radio.",
    },
  ],

  interrupts: [
    {
      id: "kayaker-in-zone",
      kind: "Kayaker inside the work zone",
      after: "watch-crossing", delay: 2, seconds: 14,
      alert: "A kayaker has paddled in under the marker and is heading for the curtain — right where the skiff is working.",
      cue: "Hail the kayaker on the loudhailer, tell them where the zone's edge is and which way is clear, and warn the skiff on the working channel.",
      target: "loudhailer",
      why: "A paddler cannot hear a VHF and may not know what a curtain is, and a skiff turning to work cannot see a low kayak in the chop. The loudhailer is how the watch reaches someone with no radio, and the working channel is how it reaches the skiff — both, at once, because the kayaker is between them.",
      missNote: "Nobody hailed the kayaker; they paddled into the curtain, the skiff turned into them, and the watch was making a distress call instead of a sécurité call.",
      wrongNote: "The loudhailer — the kayaker has no radio, and the skiff needs to hear it on the working channel.",
    },
    {
      id: "fog-bank",
      kind: "Fog bank closes on the zone",
      after: "fog-signals", delay: 2, seconds: 14,
      alert: "The fog has closed right in — the marker and the skiff have gone from sight, and the ferry's signal is somewhere astern.",
      cue: "Switch the navigation lights on and call the skiff back alongside on the working channel; the zone runs from the wheelhouse now.",
      target: "nav-lights-switch",
      why: "In restricted visibility the rules add the lights to the signals, so a vessel is seen as well as heard, and a skiff out of sight inshore is a skiff nobody can help. The lights go on and the skiff comes alongside because the watch cannot keep a lookout over a zone it cannot see — the work waits for the visibility, not the other way round.",
      missNote: "The lights stayed off and the skiff stayed inshore; the ferry's next signal came from much closer than anyone expected, and the skiff found the curtain by running into it.",
      wrongNote: "The navigation lights switch — be seen, and call the skiff back alongside.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 3.0, BRVN_ACCENT);

    // ------------------------------------------------------------ the water
    const water = box(g, 26, 0.02, 24, 0, 0.04, 0, 0xffffff, { rough: 0.12, metal: 0.25, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#12303e", mid: "#1a4050", crest: 320 }), { repeat: 5, px: 512 }), { rough: 0.12, metal: 0.25, color: 0xa8c8dc });

    // ----------------------------- the workboat, stern to the learner, deck 0.41
    const DECK = 0.41;
    const wb = workboat(g, 0, -0.79, -1.5, { ry: Math.PI, livery: { fleetName: "BAY WORKS", unitNumber: "WB-6" } });
    const { navLights } = wb.userData.parts;
    void navLights;

    // ------------------------------------------------ the barge, the skiff
    const barge = deckBarge(g, -9.5, -0.6, -6.5, { ry: 0.35, livery: { fleetName: "BAY WORKS", unitNumber: "DB-4" } });
    holoTag(barge, "curtain barge — on anchor", 0, 3.4, 0, { css: BRVN_CSS, w: 0.48 });
    const curtain = hose(g, [[-5.5, 0.08, -3.5], [-3.0, 0.08, 0.5], [-1.5, 0.08, 4.5]], 0.05, 0xe0b02e, { steps: 12, rough: 0.7 });
    void curtain;
    const sk = skiff(g, 4.8, -0.3, 3.4, { ry: -1.1, livery: { fleetName: "BAY WORKS", unitNumber: "SK-3" } });
    const skHand = standingFigure(sk, 0, -0.9, { ry: 0.3, vest: 0xf06a2b, helmet: 0xf1f3f4, gloves: true, atStation: true });
    skHand.position.y = 0.8;
    holoTag(sk, "work skiff — inshore", 0, 2.7, -0.9, { css: BRVN_CSS, w: 0.4 });
    const skHome = sk.position.clone();
    const marker = group(g, 6.5, 0.05, -2.0);
    cyl(marker, 0.14, 0.18, 0.5, 0, 0.25, 0, 0xf2c14b, { rough: 0.6, seg: 12 });
    cyl(marker, 0.025, 0.025, 0.8, 0, 0.9, 0, 0x2b3138, { rough: 0.5, metal: 0.4, seg: 8 });
    const markerFlag = box(marker, 0.28, 0.2, 0.02, 0.14, 1.2, 0, 0xf2c14b, { rough: 0.6 });
    marker.visible = false;
    void markerFlag;

    // -------------------------------------------------- the ferry, the kayaker
    const ferry = group(g, 14, -0.2, -14);
    box(ferry, 3.2, 1.2, 12, 0, 0.6, 0, 0xf1f3f4, { rough: 0.5 });
    box(ferry, 2.8, 1.4, 7, 0, 1.9, -0.5, 0x2f5f8f, { rough: 0.5 });
    box(ferry, 2.4, 0.9, 3, 0, 3.05, 1.5, 0xf1f3f4, { rough: 0.5 });
    holoTag(ferry, "ferry — crossing", 0, 4.2, 0, { css: BRVN_CSS, w: 0.34 });
    const ferryHome = ferry.position.clone();
    const kayak = group(g, 7.5, 0.05, 1.0);
    const kayakHull = box(kayak, 0.6, 0.18, 2.8, 0, 0.09, 0, 0xd2312b, { rough: 0.6 });
    kayakHull.rotation.y = 0.6;
    const paddler = standingFigure(kayak, 0, 0, { ry: 0.6, vest: 0xf2c14b, cloth: 0x1a2a3a, atStation: true });
    paddler.position.y = -0.55;
    holoTag(kayak, "kayaker", 0, 1.35, 0, { css: BRVN_CSS, w: 0.2 });
    kayak.visible = false;

    // --------------------------------------- wheelhouse wall: VHF, horn, lights
    const vhfG = group(g, -0.4, DECK + 1.0, -0.94);
    box(vhfG, 0.26, 0.1, 0.12, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const knob = cyl(vhfG, 0.025, 0.025, 0.03, 0.08, 0, 0.07, 0xc8ced4, { rough: 0.4, seg: 10 });
    knob.rotation.x = Math.PI / 2;
    const chLamp = box(vhfG, 0.08, 0.04, 0.005, -0.05, 0, 0.062, 0x0d1c24, { rough: 0.3, emissive: 0x8f4a2a, ei: 0.6 });
    holoTag(vhfG, "VHF — channel knob", 0, 0.16, 0.06, { css: BRVN_CSS, w: 0.34 });
    reg(hits, vhfG, "vhf-channel");
    const squelch = cyl(vhfG, 0.018, 0.018, 0.03, -0.1, 0.03, 0.07, 0xd2312b, { rough: 0.4, seg: 10 });
    squelch.rotation.x = Math.PI / 2;
    reg(hits, squelch, "squelch-open");
    const chanMark = box(vhfG, 0.04, 0.02, 0.006, 0.02, -0.03, 0.062, 0xd2312b, { emissive: 0xd2312b, ei: 0.8 });
    reg(hits, chanMark, "channel-wrong");
    const mic = group(g, -0.72, DECK + 0.95, -0.9);
    box(mic, 0.06, 0.1, 0.04, 0, 0, 0, 0x15181c, { rough: 0.5 });
    const pttA = box(mic, 0.05, 0.03, 0.03, 0, 0.06, 0.02, BRVN_ACCENT, { emissive: BRVN_ACCENT, ei: 0.5, rough: 0.5 });
    const pttB = box(mic, 0.05, 0.03, 0.03, 0, 0.02, 0.02, BRVN_ACCENT, { emissive: BRVN_ACCENT, ei: 0.5, rough: 0.5 });
    const pttC = box(mic, 0.05, 0.03, 0.03, 0, -0.02, 0.02, BRVN_ACCENT, { emissive: BRVN_ACCENT, ei: 0.5, rough: 0.5 });
    holoTag(mic, "handset — press to talk", 0, 0.18, 0.02, { css: BRVN_CSS, w: 0.36 });
    reg(hits, pttA, "ptt-securite");
    reg(hits, pttB, "ptt-position");
    reg(hits, pttC, "ptt-switch");
    const mic13 = group(g, -1.0, DECK + 0.95, -0.9);
    box(mic13, 0.06, 0.1, 0.04, 0, 0, 0, 0x15181c, { rough: 0.5 });
    const ptt13a = box(mic13, 0.05, 0.03, 0.03, 0, 0.04, 0.02, 0xe0b02e, { emissive: 0xe0b02e, ei: 0.5, rough: 0.5 });
    const ptt13b = box(mic13, 0.05, 0.03, 0.03, 0, -0.01, 0.02, 0xe0b02e, { emissive: 0xe0b02e, ei: 0.5, rough: 0.5 });
    holoTag(mic13, "bridge-to-bridge handset", 0, 0.18, 0.02, { css: BRVN_CSS, w: 0.4 });
    reg(hits, ptt13a, "ptt-ferry");
    reg(hits, ptt13b, "ptt-intentions");
    const horn = group(g, 0.3, DECK + 1.05, -0.94);
    box(horn, 0.14, 0.14, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const hornBtn = cyl(horn, 0.04, 0.04, 0.03, 0, 0, 0.035, 0xd2312b, { rough: 0.5, seg: 12 });
    hornBtn.rotation.x = Math.PI / 2;
    holoTag(horn, "horn — fog signal", 0, 0.16, 0.03, { css: BRVN_CSS, w: 0.3 });
    reg(hits, horn, "horn-button");
    const lightsSw = group(g, 0.7, DECK + 1.05, -0.94);
    box(lightsSw, 0.12, 0.14, 0.05, 0, 0, 0, 0x2b3138, { rough: 0.5 });
    const swLever = box(lightsSw, 0.03, 0.08, 0.03, 0, -0.02, 0.04, 0xc8ced4, { rough: 0.4 });
    holoTag(lightsSw, "navigation lights", 0, 0.16, 0.03, { css: BRVN_CSS, w: 0.3 });
    reg(hits, lightsSw, "nav-lights-switch");
    const hailer = group(g, 1.05, DECK + 1.05, -0.94);
    cyl(hailer, 0.05, 0.09, 0.18, 0, 0, 0.1, 0xc8ced4, { rough: 0.4, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    holoTag(hailer, "loudhailer", 0, 0.18, 0.06, { css: BRVN_CSS, w: 0.22 });
    reg(hits, hailer, "loudhailer");
    const vts = group(g, -1.3, DECK + 1.0, -0.9);
    box(vts, 0.18, 0.12, 0.08, 0, 0, 0, 0x2b3138, { rough: 0.5, metal: 0.3 });
    const vtsLamp = box(vts, 0.05, 0.03, 0.005, 0, 0.02, 0.042, 0x0d1c24, { rough: 0.3, emissive: 0x2a6f8f, ei: 0.5 });
    holoTag(vts, "traffic service handset", 0, 0.17, 0.04, { css: BRVN_CSS, w: 0.4 });
    reg(hits, vts, "vts-handset");
    const crewRadio = radio(g, 0.95, DECK + 0.9, -0.3, { ry: -0.4 });
    holoTag(g, "crew radio", 0.95, DECK + 1.25, -0.28, { css: BRVN_CSS, w: 0.22 });
    reg(hits, crewRadio, "crew-radio");

    // ----------------------------------------- bearing compass, marker gauge
    const compass = group(g, -1.05, DECK, 0.45);
    cyl(compass, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const card = cyl(compass, 0.13, 0.13, 0.03, 0, 1.02, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4, seg: 24 });
    const needle = box(compass, 0.012, 0.012, 0.2, 0, 1.05, 0, 0xd2312b, { rough: 0.4 });
    void card;
    holoTag(compass, "bearing compass", 0, 1.28, 0, { css: BRVN_CSS, w: 0.3 });
    reg(hits, compass, "crossing-bearing");
    const markerPost = group(g, 1.1, DECK, 0.45);
    cyl(markerPost, 0.025, 0.025, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const markerDial = box(markerPost, 0.24, 0.18, 0.04, 0, 1.02, 0, 0x101820, { rough: 0.4, emissive: 0x0d1c24, ei: 0.4 });
    const markerNeedle = box(markerPost, 0.012, 0.012, 0.08, 0, 1.02, 0.03, 0xd2312b, { rough: 0.4 });
    void markerDial;
    holoTag(markerPost, "zone marker — the skiff's run", 0, 1.28, 0, { css: BRVN_CSS, w: 0.46 });
    reg(hits, markerPost, "zone-marker");

    // ------------------------------------------------------ PFD rack
    const rack = group(g, 0.95, DECK, 0.4);
    cyl(rack, 0.022, 0.022, 1.3, 0, 0.65, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const pfd = group(rack, 0, 1.0, 0.07);
    box(pfd, 0.28, 0.12, 0.12, -0.08, 0, 0, 0xd2312b, { rough: 0.7 });
    box(pfd, 0.28, 0.12, 0.12, 0.08, 0, 0, 0xd2312b, { rough: 0.7 });
    holoTag(rack, "inflatable PFD", 0, 1.45, 0, { css: BRVN_CSS, w: 0.26 });
    reg(hits, pfd, "inflatable-pfd");
    const buckle = box(rack, 0.06, 0.04, 0.03, 0, 0.78, 0.1, 0x2b3138, { rough: 0.7 });
    holoTag(rack, "waist buckle", 0.2, 0.75, 0.1, { css: BRVN_CSS, w: 0.22 });
    reg(hits, buckle, "pfd-buckle");

    // -------------------------------------- chart table, tide table, orders, log
    const drawOrders = (cx, w, h, done) => {
      cx.fillStyle = "#081222"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRVN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8e6fa"; cx.fillText("STANDING ORDERS — WORK ZONE WATCH", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf2fc";
      ["Watch on 16, dual watch on the working channel", "Radio check on the working channel, never 16", "Sécurité call for the zone at the start of watch",
        "Marker only on the charted position — call it", "Crossing traffic: call on 13, agree, hold clear", "Fog: signals per the rules, lights on, skiff in",
        "Report zone and visibility to the traffic service"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.26 + i * 0.105)));
    };
    const orders = holoPanel(g, 0.84, 0.54, -1.05, 1.7, -0.7, (cx, w, h) => drawOrders(cx, w, h, false), { ry: 0.5, accent: BRVN_ACCENT });
    reg(hits, orders, "standing-orders");
    const drawChart = (cx, w, h, marked) => {
      cx.fillStyle = "#e8f0f4"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8d8e8"; cx.fillRect(0, h * 0.35, w, h * 0.65);
      cx.fillStyle = "#d8c8a0"; cx.beginPath(); cx.ellipse(w * 0.72, h * 0.62, w * 0.1, h * 0.12, 0, 0, Math.PI * 2); cx.fill();
      cx.strokeStyle = "#2a4a6a"; cx.lineWidth = 2; cx.setLineDash([6, 4]); cx.beginPath(); cx.moveTo(w * 0.1, h * 0.85); cx.lineTo(w * 0.9, h * 0.45); cx.stroke(); cx.setLineDash([]);
      cx.fillStyle = "#d2312b"; cx.beginPath(); cx.moveTo(w * 0.3, h * 0.5); cx.lineTo(w * 0.34, h * 0.58); cx.lineTo(w * 0.26, h * 0.58); cx.fill();
      cx.fillStyle = "#2f8f5a"; cx.fillRect(w * 0.52, h * 0.42, 6, 14);
      cx.font = `600 ${Math.round(h * 0.08)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#1a2a3a"; cx.fillText("CHART — WORK ZONE & NOTICE", w * 0.05, h * 0.1);
      cx.font = `${Math.round(h * 0.06)}px Arial, sans-serif`;
      cx.fillText("shoal", w * 0.66, h * 0.8); cx.fillText("channel marker", w * 0.2, h * 0.68); cx.fillText("daybeacon", w * 0.5, h * 0.36);
      if (marked) { cx.fillStyle = "#f2c14b"; cx.beginPath(); cx.arc(w * 0.6, h * 0.58, 7, 0, Math.PI * 2); cx.fill(); cx.fillStyle = "#1a2a3a"; cx.fillText("temporary marker — per the notice", w * 0.4, h * 0.9); }
      else { cx.fillStyle = "#1a2a3a"; cx.fillText("marker position: per the notice — confirm", w * 0.3, h * 0.9); }
    };
    const chart = holoPanel(g, 0.9, 0.6, 0.0, 1.55, -0.72, (cx, w, h) => drawChart(cx, w, h, false), { accent: BRVN_ACCENT });
    reg(hits, chart, "chart-table");
    const drawTide = (cx, w, h, read) => {
      cx.fillStyle = "#081222"; cx.fillRect(0, 0, w, h); cx.fillStyle = read ? "#59c97b" : BRVN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8e6fa"; cx.fillText("TIDE TABLE — THIS STATION, TODAY", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = read ? "#e6f6ea" : "#eaf2fc";
      ["state: per the table", "turn: per the table", "curtain anchors: scope per the barge plan", "skiff inshore: water per the table"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.16)));
    };
    const tide = holoPanel(g, 0.62, 0.42, 1.05, 1.15, -0.75, (cx, w, h) => drawTide(cx, w, h, false), { ry: -0.5, accent: BRVN_ACCENT });
    reg(hits, tide, "tide-table");
    const drawLog = (cx, w, h, rows, done) => {
      cx.fillStyle = "#081222"; cx.fillRect(0, 0, w, h); cx.fillStyle = done ? "#59c97b" : BRVN_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8e6fa"; cx.fillText("LOG — WORK ZONE WATCH", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.082)}px Arial, sans-serif`; cx.fillStyle = done ? "#e6f6ea" : "#eaf2fc";
      rows.forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    };
    const wlog = holoPanel(g, 0.66, 0.46, 1.05, 1.7, -0.75, (cx, w, h) => drawLog(cx, w, h, ["Radio: —", "Calls: —", "Marker & tide: —", "Traffic: —"], false), { ry: -0.5, accent: BRVN_ACCENT });
    reg(hits, wlog, "watch-log");

    // -------------------------------------------------- hazard targets
    const chatterHit = box(g, 0.3, 0.3, 0.3, -0.72, DECK + 1.25, -0.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "call the barge about lunch on 16?", -0.72, DECK + 1.5, -0.88, { css: "#d2312b", w: 0.52 });
    reg(hits, chatterHit, "chatter-on-16");
    const raceHit = box(g, 0.4, 0.5, 0.5, -1.2, DECK + 0.6, 2.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "push across ahead of the ferry?", -1.25, DECK + 1.1, 2.35, { css: "#d2312b", w: 0.5 });
    reg(hits, raceHit, "race-the-ferry");
    const eyeHit = box(g, 0.4, 0.5, 0.5, 1.6, DECK + 0.5, 1.9, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "drop the marker where it looks right?", 1.65, DECK + 1.0, 2.0, { css: "#d2312b", w: 0.56 });
    reg(hits, eyeHit, "mark-by-eye");
    const lineCoil = group(g, 0.5, DECK, 2.4);
    torus(lineCoil, 0.22, 0.05, 0, 0.05, 0, 0xe0b02e, { rough: 0.7, seg: 8, seg2: 16 }).rotation.x = Math.PI / 2;
    holoTag(lineCoil, "leave the door to coil the line aft?", 0, 0.45, 0, { css: "#d2312b", w: 0.56 });
    reg(hits, lineCoil, "leave-the-door");

    // ------------------------------------------------ the master, the fog
    const master = standingFigure(g, 0.3, -0.25, { ry: Math.PI, vest: 0xf06a2b, cloth: 0x3f4a55, gloves: true, atStation: true });
    master.position.y = DECK;
    holoTag(master, "master — at the helm", 0, 1.95, 0, { css: BRVN_CSS, w: 0.34 });
    const fogWall = box(g, 26, 6, 0.4, 0, 3, -9.5, 0xd8e0e4, { opacity: 0.0, transparent: true, rough: 1.0, cast: false });
    const navL = box(g, 0.1, 0.1, 0.1, -1.3, DECK + 2.3, -1.9, 0xd2312b, { emissive: 0xd2312b, ei: 0.2, rough: 0.4 });
    const navR = box(g, 0.1, 0.1, 0.1, 1.3, DECK + 2.3, -1.9, 0x2fbf6a, { emissive: 0x2fbf6a, ei: 0.2, rough: 0.4 });

    const waterTex = water.material.map;
    return {
      hits,
      spawnLook: new THREE.Vector3(-0.6, 1.2, -0.6),
      onStep(step) {
        if (step?.id === "call-ferry") ferry.position.set(11, -0.2, -12);
      },
      onStepComplete(step) {
        if (step.id === "radio-check") { squelch.material = mat(0xc8ced4, { rough: 0.4 }); chanMark.visible = false; }
        if (step.id === "set-watch") chLamp.material = mat(0x0d1c24, { emissive: 0x2a8f6f, ei: 1.0 });
        if (step.id === "securite-call") { pttA.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6 }); pttB.material = pttA.material; pttC.material = pttA.material; }
        if (step.id === "read-chart") repaint(chart.userData.face, (cx, w, h) => drawChart(cx, w, h, true));
        if (step.id === "set-marker") { marker.visible = true; sk.position.set(5.6, skHome.y, -1.4); }
        if (step.id === "read-tide") repaint(tide.userData.face, (cx, w, h) => drawTide(cx, w, h, true));
        if (step.id === "call-ferry") { ptt13a.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 0.6 }); ptt13b.material = ptt13a.material; }
        if (step.id === "watch-crossing") ferry.position.set(-12, -0.2, -13);
        if (step.id === "fog-signals") fogWall.material = mat(0xd8e0e4, { opacity: 0.55, transparent: true, rough: 1.0 });
        if (step.id === "vts-report") vtsLamp.material = mat(0x0d1c24, { emissive: 0x59c97b, ei: 1.0 });
        if (step.id === "watch-log") {
          repaint(wlog.userData.face, (cx, w, h) => drawLog(cx, w, h, ["Radio: squelch open, wrong channel — fixed", "Calls: sécurité made, ferry on 13, kayaker hailed", "Marker & tide: set per notice, tide per table", "Traffic: fog signals on, VTS told, skiff alongside"], true));
          repaint(orders.userData.face, (cx, w, h) => drawOrders(cx, w, h, true));
        }
        if (step.id === "crew-checkin") crewRadio.userData.show?.("WORKING CH\nZONE QUIET");
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "kayaker-in-zone") { kayak.visible = true; kayak.position.set(5.2, 0.05, 1.6); }
        if (it.id === "fog-bank") { fogWall.material = mat(0xd8e0e4, { opacity: 0.85, transparent: true, rough: 1.0 }); fogWall.position.z = -6.5; marker.visible = false; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "kayaker-in-zone") { kayak.position.set(9.5, 0.05, 5.5); sk.position.set(skHome.x + 0.8, skHome.y, skHome.z + 1.2); }
        if (it.id === "fog-bank") {
          navL.material = mat(0xd2312b, { emissive: 0xd2312b, ei: 1.6 }); navR.material = mat(0x2fbf6a, { emissive: 0x2fbf6a, ei: 1.6 });
          swLever.position.y = 0.02; sk.position.set(2.6, skHome.y, 0.6); sk.rotation.y = Math.PI / 2;
        }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.005; waterTex.offset.y = t * 0.007; }
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "set-marker") { markerNeedle.rotation.y = -1.0 + gg.t * 2.0; sk.position.set(skHome.x + gg.t * 1.4, skHome.y, skHome.z - gg.t * 4.6); }
        if (session?.turn && step?.id === "set-watch") knob.rotation.z = session.turn.amount * 4;
        if (step?.id === "watch-crossing" && session.holding) {
          const v = session.track?.v ?? 0.5;
          needle.rotation.y += (dt ?? 0.016) * 0.6 * v;
          ferry.position.x -= (dt ?? 0.016) * 2.4; ferry.position.z -= (dt ?? 0.016) * 0.2;
        } else if (step?.id !== "watch-crossing" && ferry.position.x > ferryHome.x) ferry.position.copy(ferryHome);
        if (step?.id === "fog-signals" && session.holding) hornBtn.position.z = 0.02 + Math.sin(t * 6) * 0.01;
        if (kayak.visible) kayak.position.y = 0.05 + Math.sin(t * 2) * 0.02;
      },
    };
  },
};
