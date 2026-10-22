import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone, barrierPanel,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Suspender Rope Replacement VR — Construction & Structural
// Trades, the Bay Area bridge pack, on the golden-gate-deck district.
//
// A suspender rope is changed under load: the deck it holds cannot be let
// down while the rope is out, so the load goes onto temporary jacking rods
// first, the old rope is unpinned only once they carry it, and the new rope
// is brought up to the engineer's tension by a jack before the temporary
// rods are bled off. Every step of it is a transfer of load, and the order is
// the engineer's. The frame, the band stub and the ropes here are the
// station's own mock-up in the closure; the district's suspenders hang in
// International Orange along the span.

const GGS_ACCENT = 0xe3743a;

export const SIM_GG_SUSPENDER_ROPE_REPLACEMENT = {
  id: "gg-suspender-rope-replacement",
  index: "227",
  domain: "Construction",
  trade: "Ironworkers and IMPACT — suspender rope replacement crew, with the owner's engineer witnessing the tension",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  certification: "Ironworkers and IMPACT bridge crew training; the owner's engineered replacement procedure and load-transfer sequence; AASHTO Maintenance Manual practice for suspension-bridge ropes; ASME B30.9 and ASME B30.26 for the slings and rigging hardware on the tugger; OSHA 29 CFR 1926.502 and ANSI/ASSP Z359 for tie-off at the deck edge; 29 CFR 1926.106 for work over water; MUTCD for the closure the crew works inside",
  name: "Suspender Rope Replacement",
  title: simTitle("Suspender Rope Replacement"),
  tagline: "A suspender changed under load: the plan read, tied off and the drop zone barricaded, the wind taken, the new rope's sockets checked, the temporary jacks loaded while a cyclist rides into the closure, the old socket backed off only once they carry, the new rope rigged and tensioned to the figure through a gust, pinned and cottered, the tension confirmed, the jacks bled down and the rope logged",
  accent: GGS_ACCENT,
  accentCss: "#e3743a",
  parSeconds: 330,
  footprint: 2.8,
  badge: { id: "load-always-held", name: "Load Always Held", note: "The deck carried by the old rope, the temporary jacks or the new rope at every moment of the change" },

  supportLine: "the Ironworkers' member assistance programme through your local, and the crew's peer-support contact",

  game: system({
    name: "Rope Gang",
    currency: "STRAND",
    ranks: ["Deck Rigger", "Jack Hand", "Rope Setter", "Rope Foreman", "Rope Gang Certified"],
    badges: [
      { id: "transfer-first", name: "Transfer First", note: "Temporary jacks loaded before the old socket was touched", test: AWARD.stepClean("old-socket") },
      { id: "on-the-figure", name: "On The Figure", note: "New rope tensioned inside the band the whole pull", test: AWARD.precise(0.72) },
      { id: "clear-of-the-bight", name: "Clear Of The Bight", note: "Never under the rope, never a hand in the socket throat", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-change", name: "Clean Change", note: "No corrections from the plan to the log", test: AWARD.clean },
      { id: "steady-pull", name: "Steady Pull", note: "The tensioning never dropped out of band", test: AWARD.unbroken },
      { id: "rope-inside-par", name: "Rope Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-rope-on-tugger": "You walked under the new rope while the tugger was lifting it to the band. A suspender rope is heavy, stiff and springy, and on a tugger line it swings and whips as it comes off the reel; if the hitch slips or the line parts, the rope comes down along its own length onto whoever is beneath it. The drop zone is barricaded for exactly this, and nobody crosses it while the rope is in the air.",
    "untethered-hammer": "The pinning hammer is lying loose on the lift platform's toe board, at the edge, over the deck and the strait beyond the railing. A hammer is swung, set down, knocked and swung again all shift, and the one time it goes over the edge it lands on a lane, a crew or a boat. It rides on its wrist lanyard at height, every swing.",
    "old-rope-early": "You put the wrench on the old rope's lower socket nut before the temporary jacks were carrying the load. That rope is still holding its share of the deck, and backing its socket off unloaded nothing — it let that share drop onto the ropes either side of it, suddenly, and put a live rope's tension into the thread you were turning. The engineer's sequence loads the jacks first because the load has to be somewhere at every moment.",
    "hand-in-socket-throat": "You put a hand into the band socket's throat to guide the new rope in. As the rope seats, the socket closes on it with the weight of the rope and the pull of the tugger behind it, and there is no gap left for fingers. The rope is guided from the tag line and the tugger stopped on your call; hands stay out of any opening a load is about to close.",
  },

  lateNotes: {
    "old-socket-nut": "The old socket is backed off only once the temporary jacks are carrying the deck — load them first.",
    "tension-jack": "The new rope is tensioned once it is rigged into the band socket and the lower socket is on the jack.",
    "rope-log": "The rope is logged once the temporary jacks are bled off and the new rope carries the deck on its own.",
  },

  steps: [
    {
      id: "plan", kind: "select", target: "replacement-plan",
      title: "Read the engineer's replacement procedure",
      cue: "Read which rope is coming out, the load-transfer sequence, the temporary jack pressures, the design tension for the new rope and the hold points the engineer witnesses.",
      why: "A suspender carries a share of the deck's weight, and changing one means moving that share three times: onto the temporary jacks, off the old rope, onto the new one. The engineer's procedure sets that order and the pressure and tension at each stage, and it names the hold points where the work stops for the engineer to witness a reading. Nothing about a load transfer is improvised in the closure.",
    },
    {
      id: "edge-and-zone", kind: "sequence", anyOrder: true,
      targets: ["deck-anchor-lanyard", "drop-zone-barrier"],
      itemNames: { "deck-anchor-lanyard": "lanyard clipped to the deck anchor post", "drop-zone-barrier": "drop zone under the rope barricaded" },
      title: "Tie off at the deck edge and barricade the drop zone",
      cue: "Clip your lanyard to the deck anchor post at the lift platform, and close the barricade round the drop zone under the rope's path.",
      why: "The rope work happens at the deck edge and on a lift platform, where a slip is a fall past the railing, so the lanyard goes on before the platform. The drop zone is everything under the rope's path from the reel to the band, and it is barricaded before the rope moves because a rope coming off a tugger does not drop straight down — it swings, and the barricade has to be wide enough for the swing.",
    },
    {
      id: "wind", kind: "gauge", target: "wind-meter",
      title: "Take the wind before the rope goes up",
      cue: "Read the anemometer on the frame and commit the reading while it sits inside the band below the procedure's lifting limit.",
      why: "A suspender rope in the air is a long, light target for the wind: it sails, twists on the tugger line and swings toward the frame and the crew. The procedure sets a lifting limit below the general work-stop limit for exactly that reason, and the reading is taken and committed before the rope leaves the reel, because once it is up it has to come the rest of the way.",
      gauge: {
        label: "WIND · % OF LIFTING LIMIT", speed: 0.64, green: [0.14, 0.48],
        readout: (t) => `${Math.round(t * 140)}% of limit`,
        missNote: "That is past the lifting limit, or a lull between gusts. The rope stays on the reel until a steady reading sits inside the band.",
      },
    },
    {
      id: "rope-accept", kind: "find", noHint: true,
      targets: ["socket-cert-tag", "rope-marking", "seating-mark"],
      itemNames: {
        "socket-cert-tag": "the socket's proof-load certificate tag",
        "rope-marking": "the rope's marking against the drawing",
        "seating-mark": "the paint seating mark at the socket",
      },
      itemNotes: {
        "socket-cert-tag": "The tag on the upper socket carries its proof-load test and the heat it was poured from. A socket without a certificate is an assumption about the one joint in the rope nobody can see into.",
        "rope-marking": "The rope's marking matches the drawing's diameter, construction and length. The wrong rope looks exactly like the right one until it is tensioned to a figure it was never made for.",
        "seating-mark": "The paint mark where the rope enters the socket is square and unbroken. After tensioning, a mark that has moved away from the socket face is a rope pulling out of its socket, and the only way to see it is to have a mark to compare.",
      },
      title: "Accept the new rope: socket tag, marking, seating mark",
      cue: "Before it goes up, find the three things that say this is the right rope and a sound one: the socket's certificate, the rope marking, and the seating mark.",
      why: "Once the new rope is in the band and tensioned, its sockets are overhead and under load, and nothing about them can be checked again without taking the rope out. The acceptance check at the reel is the last close look anyone gets: the proof-load tag, the marking against the drawing, and a clean seating mark to compare against after tensioning. Under AASHTO maintenance practice the rope is accepted by record, not by eye.",
    },
    {
      id: "load-temps", kind: "hold", target: "temp-jack-valve", seconds: 5,
      title: "Load the temporary jacks to the procedure's pressure",
      cue: "Pump the temporary jacks under the floor beam up to the procedure's pressure and hold there while the rods' nuts are run down.",
      why: "The temporary jacking rods take the old rope's share of the deck before anything else happens. They are pumped to the procedure's pressure and held while the nuts are run down on the rods, so the load stays on the rods mechanically rather than on the hydraulics alone; only then is the old rope carrying nothing, and only then can it be unpinned without dropping its share onto its neighbours.",
      holdBreakNote: "The pressure fell off before the rod nuts were down — the old rope is still carrying. Bring the jacks back to pressure and hold.",
    },
    {
      id: "old-socket", kind: "turn", target: "old-socket-nut",
      title: "Back off the old rope's lower socket",
      cue: "With the jacks carrying, back the old rope's lower socket nut off its thread until the rope hangs free.",
      why: "With the temporary jacks carrying the deck, the old rope's lower socket should come off with nothing on it but the rope's own weight. It is backed off slowly and watched, because a nut that is hard to turn is a rope still carrying load, and that is a stop, not a job for a longer wrench.",
      turn: { turns: 1.0, label: "OLD SOCKET NUT", readout: (t) => (t < 0.3 ? "cracking free" : t < 0.95 ? "backing off" : "rope hanging free") },
    },
    {
      id: "rig-new", kind: "drag", target: "new-rope-socket",
      title: "Bring the new rope up into the band socket",
      cue: "With the tugger on your call, bring the new rope's upper socket up to the band and seat it in the socket seat.",
      why: "The new rope comes up on the tugger with a tag line, and it is guided into the band's socket seat by the tag line and by calls to the tugger operator — never by a hand in the throat. The upper socket is pinned first because it is the fixed end; the lower end is the one the jack will pull, and it hangs until the upper end is sure.",
      drag: { to: "band-socket-seat", radius: 0.45, missNote: "Not seated — the socket has to sit fully in the band's seat before the pin will go through. Bring it square into the seat." },
    },
    {
      id: "tension", kind: "track", target: "tension-jack", seconds: 7,
      title: "Tension the new rope to the engineer's figure",
      cue: "Pump the tension jack on the lower socket up to the design tension and hold it steady on the figure while the socket nut is run down.",
      why: "A suspender that is slack leaves its share of the deck on the ropes either side of it, and one over-tensioned takes more than its share and lifts the deck at that point. The jack brings the rope to the engineer's design tension and holds it there while the socket nut is run down, so the tension locked into the rope is the figure on the procedure, not the peak of an overshoot.",
      track: {
        start: 0.1, green: [0.42, 0.62], rise: 0.58, fall: 0.46, drift: 0.12, label: "ROPE TENSION · DESIGN FIGURE",
        readout: (v) => (v < 0.42 ? "slack — under the figure" : v > 0.62 ? "over — lifting the deck" : "on the design tension"),
      },
      holdBreakNote: "The tension came off the figure while the nut was being run down — the rope would lock in whatever it was at that moment. Bring it back to the figure.",
    },
    {
      id: "pin-socket", kind: "sequence",
      targets: ["socket-pin", "cotter-key"],
      itemNames: { "socket-pin": "socket pin driven home", "cotter-key": "cotter through the pin and spread" },
      title: "Pin the socket, then cotter the pin",
      cue: "Drive the socket pin fully home, then put the cotter through its hole and spread the legs.",
      why: "The pin carries the rope's tension through the socket into the band; the cotter is what keeps the pin there under a lifetime of traffic vibration and wind. A cotter put in before the pin is fully home holds a pin that is only partly bearing, and a pin without its cotter walks out slowly and silently. Pin, then cotter, and both checked by hand.",
      outOfOrderNote: "Pin first — a cotter can only lock a pin that is already fully home.",
    },
    {
      id: "confirm-tension", kind: "gauge", target: "tension-readout",
      title: "Confirm the rope's tension for the engineer",
      cue: "Take the confirmation reading on the rope's tension meter with the engineer and commit it inside the band.",
      why: "The jack's gauge says what the jack pulled; the confirmation reading says what the rope is holding now the jack is off. The engineer witnesses it as a hold point in the procedure, because it is the number that goes into the bridge's record for this rope and the number every future inspection compares against.",
      gauge: {
        label: "ROPE TENSION · % OF DESIGN", speed: 0.6, green: [0.42, 0.6],
        readout: (t) => `${Math.round(70 + t * 60)}% of design`,
        missNote: "Outside the band — either the reading was taken with the meter off the rope's centreline, or the rope needs the jack again. The engineer decides which.",
      },
    },
    {
      id: "bleed-temps", kind: "hold", target: "temp-jack-bleed", seconds: 5,
      title: "Bleed the temporary jacks down slowly",
      cue: "Back the rod nuts off a turn and bleed the temporary jacks down slowly, watching the new rope take the load.",
      why: "Bleeding the temporary jacks hands the deck's share from the rods to the new rope, and it is done slowly so the rope takes it smoothly and the tension reading can be watched as it does. A jack dumped fast drops the share onto the rope in a jolt and can shock-load the new socket, which is the part of the rope with the least margin for surprise.",
      holdBreakNote: "The bleed ran too fast — the load came off the rods in a jolt. Close the valve and bleed again, slowly.",
    },
    {
      id: "rope-log", kind: "select", target: "rope-log",
      title: "Log the new rope",
      cue: "Record the rope's marking and socket certificates, the design and confirmed tensions, the seating marks, and the engineer's witness.",
      why: "The rope record is what the bridge knows about this suspender for the rest of its life: which rope, which sockets, what tension it went in at, and the seating marks every future inspection will read against. A replaced rope without its record is one the next inspection cannot compare with anything, and one the engineer cannot defend if its neighbours start to behave differently.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the crew, the engineer and the flagger",
      cue: "Call the crew, the engineer and the flagger at the closure: rope in and logged, drop zone open, and how the crew is after the change.",
      why: "The flagger holds the closure until the crew says the drop zone is open, and the engineer closes the hold points on the strength of the call. A rope change is a long, careful job with a cyclist and a gust through the middle of it, and the crew checks in with each other before the tugger is stowed — the Ironworkers' member assistance line is there for anything that lasts longer than the shift.",
    },
  ],

  interrupts: [
    {
      id: "cyclist-in-closure",
      kind: "Cyclist in the closure",
      after: "load-temps", delay: 2, seconds: 12,
      alert: "A cyclist has come off the sidewalk through the barrier gap and is riding into the closure, heading for the drop zone under the rope.",
      cue: "Sound the air horn and call the flagger — stop the cyclist before they reach the drop zone.",
      target: "air-horn",
      why: "A closure is only a closure to the people who know it is one: a cyclist who has come off the sidewalk does not know there is a load in the air or a jack under pressure. The air horn stops people in a way a shout across traffic does not, and the flagger turns the cyclist round; the jack pressure is held where it is, because a load transfer is not abandoned halfway — it is held steady while the public is cleared.",
      missNote: "The cyclist rode on into the drop zone under the rope's path with nobody stopping them. Had the tugger hitch slipped at that moment, the rope would have come down on someone who never knew there was a load above them.",
      wrongNote: "The air horn — the cyclist is heading for the drop zone and has to be stopped before anything else.",
    },
    {
      id: "gust-on-the-rope",
      kind: "Gust past the work-stop limit",
      after: "tension", delay: 3, seconds: 12,
      alert: "A gust hits the span — the windsock on the frame stands straight out red and the new rope starts to swing on the jack.",
      cue: "Close the jack's load-holding valve to lock the tension where it is, and stand clear of the rope until the gust passes.",
      target: "jack-lock-valve",
      why: "A rope half-tensioned in a gust is moving on a jack that is still being pumped, and the pump hand is the hand nearest the rope. The load-holding valve locks the jack's pressure where it is without anyone pumping, so the rope stays at a known tension and the crew can step back from it; the pull resumes on the figure when the wind is back under the limit.",
      missNote: "The pumping went on through the gust with the rope swinging on the jack. A rope tensioned while it is being blown about is tensioned to whatever the wind added, and the pump hand was beside a rope that was moving.",
      wrongNote: "The jack's load-holding valve — lock the tension, then step clear of the rope.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGS_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3b4148", base2: "#31373d" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.6, 0, 0.01, 0.1, 0x3b4148, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the frame, band stub and floor beam
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { cols: 3, rows: 2 }), { repeat: 1, px: 256 });
    const orange = texturedMat(steelTex, { rough: 0.62, metal: 0.3 });
    const frame = group(g, -0.2, 0, -1.4);
    for (const sx of [-1.3, 1.3]) {
      const post = box(frame, 0.16, 3.2, 0.16, sx, 1.6, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
      post.material = orange;
      box(frame, 0.44, 0.04, 0.44, sx, 0.02, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    }
    const header = box(frame, 2.8, 0.22, 0.22, 0, 3.2, 0, 0xc8461d, { rough: 0.6, metal: 0.3 });
    header.material = orange;
    const cableStub = cyl(frame, 0.3, 0.3, 1.4, 0, 3.55, 0, 0xc8461d, { rough: 0.6, metal: 0.3, seg: 20 });
    cableStub.rotation.z = Math.PI / 2;
    cableStub.material = orange;
    const bandStub = cyl(frame, 0.36, 0.36, 0.44, 0.1, 3.55, 0, 0xb63f19, { rough: 0.6, metal: 0.35, seg: 20 });
    bandStub.rotation.z = Math.PI / 2;
    for (let i = 0; i < 4; i++) cyl(frame, 0.03, 0.03, 0.05, -0.05 + i * 0.1, 3.2, 0.26, 0x5a636c, { rough: 0.4, metal: 0.8, seg: 6 }).rotation.x = Math.PI / 2;
    const floorBeam = box(frame, 2.4, 0.3, 0.3, 0, 0.2, 0.05, 0x8a3a18, { rough: 0.6, metal: 0.35 });
    void floorBeam;
    // The band socket seat and the old rope hanging from the band.
    const seat = group(frame, -0.25, 3.12, 0.02);
    box(seat, 0.16, 0.12, 0.16, 0, 0, 0, 0x5a636c, { rough: 0.5, metal: 0.6 });
    torus(seat, 0.1, 0.008, 0, -0.08, 0, GGS_ACCENT, { emissive: GGS_ACCENT, ei: 1.6, rough: 0.4, seg: 6, seg2: 18 }).rotation.x = Math.PI / 2;
    holoTag(seat, "socket seat", 0, 0.14, 0.06, { css: "#e3743a", w: 0.26 });
    reg(hits, seat, "band-socket-seat");
    const oldRope = cyl(frame, 0.03, 0.03, 2.7, 0.35, 1.75, 0.02, 0x7a3a1a, { rough: 0.8, metal: 0.3, seg: 8 });
    const oldSocket = group(frame, 0.35, 0.44, 0.02);
    cyl(oldSocket, 0.06, 0.05, 0.18, 0, 0, 0, 0x5a4a3a, { rough: 0.7, metal: 0.4, seg: 10 });
    const oldNut = cyl(oldSocket, 0.07, 0.07, 0.05, 0, -0.1, 0, 0x6b6558, { rough: 0.6, metal: 0.5, seg: 6 });
    holoTag(oldSocket, "old socket nut", 0, 0.2, 0.06, { css: "#e3743a", w: 0.3 });
    reg(hits, oldSocket, "old-socket-nut");
    const earlyHit = box(frame, 0.2, 0.2, 0.2, 0.62, 0.5, 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(frame, "back it off before the jacks carry?", 0.75, 0.78, 0.1, { css: "#d2312b", w: 0.62 });
    reg(hits, earlyHit, "old-rope-early");
    const throatHit = box(frame, 0.14, 0.14, 0.14, -0.25, 2.92, 0.14, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(frame, "hand in the throat?", -0.62, 2.9, 0.16, { css: "#d2312b", w: 0.38 });
    reg(hits, throatHit, "hand-in-socket-throat");

    // Temporary jacking rods from the header to the floor beam, with jacks.
    const temps = [];
    for (const sx of [-0.9, 0.9]) {
      cyl(frame, 0.025, 0.025, 2.9, sx, 1.75, 0.2, 0xc0c6cc, { rough: 0.35, metal: 0.85, seg: 8 });
      temps.push(cyl(frame, 0.09, 0.09, 0.2, sx, 0.45, 0.2, 0xe07a3f, { rough: 0.5, metal: 0.4, seg: 12 }));
      cyl(frame, 0.05, 0.05, 0.05, sx, 0.6, 0.2, 0x5a636c, { rough: 0.4, metal: 0.8, seg: 6 });
    }
    const valve = group(frame, 0.9, 0.9, 0.34);
    box(valve, 0.14, 0.1, 0.08, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.4 });
    cyl(valve, 0.03, 0.03, 0.04, 0, 0.07, 0, 0xd8232a, { rough: 0.5, seg: 10 });
    holoTag(valve, "temp jacks — hold", 0, 0.18, 0.02, { css: "#e3743a", w: 0.34 });
    reg(hits, valve, "temp-jack-valve");
    const bleed = group(frame, -0.9, 0.9, 0.34);
    box(bleed, 0.14, 0.1, 0.08, 0, 0, 0, 0x2f4f6f, { rough: 0.5, metal: 0.4 });
    cyl(bleed, 0.03, 0.03, 0.04, 0, 0.07, 0, 0x59c97b, { rough: 0.5, seg: 10 });
    holoTag(bleed, "bleed — hold", 0, 0.18, 0.02, { css: "#e3743a", w: 0.26 });
    reg(hits, bleed, "temp-jack-bleed");
    hose(frame, [[0.9, 0.85, 0.34], [0, 0.3, 0.6], [-0.9, 0.85, 0.34]], 0.012, 0x1b1e23, { steps: 14, rough: 0.75 });

    // ------------------------------------------------ the new rope, reel and tugger
    const reel = group(g, 1.95, 0, -0.35, -0.4);
    for (const sz of [-0.22, 0.22]) {
      const flange = cyl(reel, 0.55, 0.55, 0.04, 0, 0.62, sz, 0x6b4a2a, { rough: 0.85, seg: 20 });
      flange.rotation.x = Math.PI / 2;
    }
    const drum = cyl(reel, 0.35, 0.35, 0.42, 0, 0.62, 0, 0x7a3a1a, { rough: 0.8, metal: 0.3, seg: 18 });
    drum.rotation.x = Math.PI / 2;
    for (const sx of [-0.4, 0.4]) box(reel, 0.08, 0.7, 0.6, sx, 0.35, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    const newSocket = group(g, 1.35, 0.25, -0.2);
    cyl(newSocket, 0.06, 0.05, 0.2, 0, 0.1, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 10 });
    const certTag = decal(g, 0.08, 0.05, 1.35, 0.37, -0.138, paperFace("PROOF", ["TESTED"], { bg: "#f2e6c8", band: "#59c97b" }), { px: 96 });
    reg(hits, certTag, "socket-cert-tag");
    const seatMark = box(g, 0.12, 0.012, 0.12, 1.35, 0.465, -0.2, 0xf2f2f2, { rough: 0.6 });
    reg(hits, seatMark, "seating-mark");
    holoTag(newSocket, "new rope socket — carry", 0, 0.4, 0, { css: "#e3743a", w: 0.44 });
    reg(hits, newSocket, "new-rope-socket");
    const newRope = hose(g, [[1.35, 0.46, -0.2], [1.6, 0.9, -0.3], [1.95, 1.1, -0.35]], 0.03, 0x9a4a22, { steps: 12, rough: 0.8, metal: 0.3 });
    void newRope;
    const marking = box(g, 0.14, 0.04, 0.06, 1.62, 0.93, -0.28, 0xf2c14b, { rough: 0.6 });
    reg(hits, marking, "rope-marking");
    const tugger = group(g, 2.35, 0, 0.75, -0.8);
    box(tugger, 0.5, 0.35, 0.4, 0, 0.18, 0, 0xe8b830, { rough: 0.55, metal: 0.3 });
    cyl(tugger, 0.12, 0.12, 0.36, 0, 0.44, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 12 }).rotation.x = Math.PI / 2;
    hose(g, [[2.35, 0.5, 0.75], [1.4, 2.4, -0.7], [-0.25, 3.3, -1.36]], 0.008, 0x1b1e23, { steps: 16, rough: 0.7 });
    const underRope = box(g, 1.0, 0.05, 0.8, 1.0, 0.1, -0.2, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk under the rope?", 1.0, 0.5, 0.2, { css: "#d2312b", w: 0.4 });
    reg(hits, underRope, "under-rope-on-tugger");

    // The tension jack on the lower end, its lock valve and the tension meter.
    const jack = group(g, -0.95, 0, -0.95);
    cyl(jack, 0.1, 0.1, 0.34, 0, 0.25, 0, 0xe07a3f, { rough: 0.5, metal: 0.4, seg: 12 });
    cyl(jack, 0.03, 0.03, 0.4, 0, 0.62, 0, 0xc0c6cc, { rough: 0.35, metal: 0.85, seg: 8 });
    const jackScreen = instrument(jack, 0.25, 0.3, 0.1, { ry: -0.3, idle: "0 %", color: 0x2f4f6f, w: 0.1, d: 0.14 });
    box(jack, 0.22, 0.28, 0.22, 0.25, 0.14, 0.1, 0x2b3138, { rough: 0.6, metal: 0.4 });
    holoTag(jack, "tension jack", 0, 0.9, 0, { css: "#e3743a", w: 0.28 });
    reg(hits, jack, "tension-jack");
    const lockValve = group(jack, -0.2, 0.34, 0.12);
    cyl(lockValve, 0.03, 0.03, 0.05, 0, 0, 0, 0xf2c14b, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(lockValve, "load-holding valve", 0, 0.1, 0, { css: "#e3743a", w: 0.34 });
    reg(hits, lockValve, "jack-lock-valve");
    const pin = group(jack, 0, 0.78, 0.06);
    cyl(pin, 0.02, 0.02, 0.16, 0, 0, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 8 }).rotation.z = Math.PI / 2;
    holoTag(pin, "socket pin", 0, 0.08, 0.02, { css: "#e3743a", w: 0.22 });
    reg(hits, pin, "socket-pin");
    const cotter = torus(jack, 0.02, 0.004, 0.1, 0.78, 0.08, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 10 });
    reg(hits, cotter, "cotter-key");
    const meter = instrument(g, -0.35, 1.2, -0.62, { ry: 0.1, idle: "-- %", color: GGS_ACCENT, w: 0.1, d: 0.16 });
    box(g, 0.2, 1.15, 0.2, -0.35, 0.58, -0.62, 0x3a4148, { rough: 0.6, metal: 0.4 });
    holoTag(meter, "tension meter", 0, 0.14, 0, { css: "#e3743a", w: 0.28 });
    reg(hits, meter, "tension-readout");

    // ------------------------------------------------ edge anchor, barricade, lift platform
    const post = group(g, -2.3, 0, -0.2);
    cyl(post, 0.05, 0.06, 1.2, 0, 0.6, 0, 0x5a636c, { rough: 0.5, metal: 0.6, seg: 10 });
    torus(post, 0.05, 0.01, 0, 1.22, 0, 0xd8b23a, { rough: 0.4, metal: 0.7, seg: 6, seg2: 14 });
    holoTag(post, "deck anchor post", 0, 1.42, 0, { css: "#e3743a", w: 0.32 });
    reg(hits, post, "deck-anchor-lanyard");
    const zone = barrierPanel(g, 1.0, 0.9, { color: GGS_ACCENT, w: 1.6 });
    holoTag(zone, "drop zone barricade", 0, 1.15, 0, { css: "#e3743a", w: 0.38 });
    reg(hits, zone, "drop-zone-barrier");
    const lift = group(g, -1.9, 0, -1.2);
    box(lift, 0.9, 0.06, 0.8, 0, 1.4, 0, 0x5a636c, { rough: 0.6, metal: 0.5 });
    box(lift, 0.9, 0.12, 0.02, 0, 1.49, 0.4, 0xe8b830, { rough: 0.6 });
    for (const [px, pz] of [[-0.42, -0.38], [0.42, -0.38], [-0.42, 0.38], [0.42, 0.38]]) box(lift, 0.05, 1.4, 0.05, px, 0.7, pz, 0x8a949d, { rough: 0.5, metal: 0.6 });
    const hammer = group(lift, 0.25, 1.46, 0.38, 0.2);
    box(hammer, 0.22, 0.02, 0.02, 0, 0, 0, 0x6b4a2a, { rough: 0.8 });
    box(hammer, 0.04, 0.05, 0.05, 0.12, 0, 0, 0x5a636c, { rough: 0.4, metal: 0.8 });
    reg(hits, hammer, "untethered-hammer");

    // ------------------------------------------------ paperwork, radio, horn, wind mast
    const plan = holoPanel(g, 0.92, 0.62, 2.25, 1.35, 1.35, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e3743a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("ROPE REPLACEMENT PROCEDURE", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["1  Temporary jacks to pressure, rod nuts down", "2  Old lower socket off — hold point", "3  New rope up, upper socket seated",
       "4  Tension to design figure, nut down", "5  Pin and cotter · confirmation reading", "6  Temporary jacks bled down slowly"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: -0.8, accent: GGS_ACCENT });
    reg(hits, plan, "replacement-plan");
    const log = holoPanel(g, 0.7, 0.48, -2.4, 1.3, 1.0, (cx, w, h) => {
      cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#e3743a"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#ffe2d2"; cx.fillText("ROPE RECORD", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
      ["Rope / sockets: —", "Tension: —", "Seating marks: —", "Witness: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: 1.1, accent: GGS_ACCENT });
    reg(hits, log, "rope-log");
    const chest = toolChest(g, -1.3, 2.1, { ry: 0.2, color: 0x7a3a22 });
    const radio = instrument(chest, 0.14, 0.79, 0.03, { ry: 0.1, idle: "ROPE CH", color: GGS_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "crew radio", 0, 0.15, 0, { css: "#e3743a", w: 0.24 });
    reg(hits, radio, "crew-radio");
    const horn = group(chest, -0.14, 0.8, 0.02);
    cyl(horn, 0.035, 0.035, 0.12, 0, 0.04, 0, 0xd8232a, { rough: 0.5, seg: 10 });
    cyl(horn, 0.02, 0.045, 0.06, 0, 0.13, 0, 0xdfe4e8, { rough: 0.4, seg: 10 });
    holoTag(horn, "air horn", 0, 0.24, 0, { css: "#e3743a", w: 0.2 });
    reg(hits, horn, "air-horn");
    const mast = group(g, 2.55, 0, -1.3);
    cyl(mast, 0.03, 0.04, 2.4, 0, 1.2, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const sock = cyl(mast, 0.06, 0.03, 0.34, 0.2, 2.3, 0.1, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;
    const strobe = ball(mast, 0.05, 0, 2.46, 0, 0xff3b30, { emissive: 0xff3b30, ei: 2.6, seg: 8, seg2: 6 });
    strobe.visible = false;
    const windMeter = instrument(mast, 0, 1.2, 0.1, { idle: "-- %", color: GGS_ACCENT, w: 0.12, d: 0.16 });
    windMeter.rotation.x = Math.PI / 2.4;
    holoTag(mast, "anemometer", 0, 1.44, 0.12, { css: "#e3743a", w: 0.26 });
    reg(hits, windMeter, "wind-meter");

    // ------------------------------------------------ crew, closure edge, the cyclist
    const operator = standingFigure(g, 1.95, 1.95, { ry: -2.2, cloth: 0x2b3138, vest: 0xfcee21, helmet: 0x1b1e22 });
    holoTag(operator, "tugger operator", 0, 1.95, 0, { css: "#59c97b", w: 0.32 });
    const engineer = standingFigure(g, -2.7, 0.55, { ry: 1.8, cloth: 0x1f3a52, vest: 0xf2f2f2, helmet: 0xf2f2f2 });
    holoTag(engineer, "owner's engineer", 0, 1.95, 0, { css: "#59c97b", w: 0.34 });
    cone(g, 0.4, 2.6, { color: GGS_ACCENT }); cone(g, 2.9, 2.6, { color: GGS_ACCENT });

    const cyclist = group(g, -9.5, 0, 8.5, 2.3);
    for (const dz of [-0.5, 0.5]) torus(cyclist, 0.32, 0.03, 0, 0.34, dz, 0x1a1e23, { rough: 0.8, seg: 6, seg2: 20 }).rotation.y = Math.PI / 2;
    box(cyclist, 0.04, 0.04, 1.0, 0, 0.55, 0, 0x2f8f9d, { rough: 0.4, metal: 0.5 });
    const rider = standingFigure(cyclist, 0, 0, { atStation: true, cloth: 0x2f8f9d, cap: 0xf2f2f2 });
    rider.position.y = 0.2;
    cyclist.visible = false;
    const cyclistHome = cyclist.position.clone();

    let gusting = false, riding = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.1, 1.6, -1.3),
      onStepComplete(step) {
        if (step.id === "load-temps") for (const t of temps) t.material = mat(0x59c97b, { rough: 0.5, metal: 0.4 });
        if (step.id === "old-socket") { oldRope.visible = false; oldSocket.position.y = 0.2; }
        if (step.id === "rig-new") { newSocket.position.set(-0.45, 3.0, -1.38); cyl(frame, 0.03, 0.03, 2.5, -0.25, 1.8, 0.02, 0x9a4a22, { rough: 0.8, metal: 0.3, seg: 8 }); }
        if (step.id === "pin-socket") cotter.material = mat(0x59c97b, { rough: 0.4, metal: 0.7 });
        if (step.id === "bleed-temps") for (const t of temps) t.material = mat(0x8a949d, { rough: 0.5, metal: 0.4 });
        if (step.id === "rope-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(20,10,6,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#ffe2d2"; cx.fillText("ROPE RECORD", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#f5eae4";
          ["Rope / sockets: to drawing, certificates on file", "Tension: design figure, confirmed", "Seating marks: square, photographed", "Witness: owner's engineer"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ZONE OPEN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "cyclist-in-closure") { riding = true; cyclist.visible = true; cyclist.position.set(-5.5, 0, 5.0); }
        if (it.id === "gust-on-the-rope") {
          gusting = true; strobe.visible = true;
          sock.material = mat(0xd2312b, { rough: 0.7, emissive: 0x6a1010, ei: 0.6 });
          sock.rotation.x = Math.PI / 2;
        }
      },
      onInterruptEnd(it) {
        if (it.id === "cyclist-in-closure") {
          riding = false;
          if (it.resolved === "answered") { cyclist.position.set(-8.5, 0, 7.5); cyclist.rotation.y = -0.8; }
        }
        if (it.id === "gust-on-the-rope") {
          gusting = false;
          if (it.resolved !== "answered") return;
          strobe.visible = false; sock.rotation.x = 1.1;
          sock.material = mat(0x59c97b, { rough: 0.7 });
          repaint(jackScreen.userData.screen, signFace("LOCKED", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-hammer") hammer.position.z = 0.44;
      },
      animate(t, dt, session) {
        if (riding && cyclist.position.x < -3.2) { cyclist.position.x += (dt ?? 0.016) * 1.2; cyclist.position.z -= (dt ?? 0.016) * 1.0; }
        if (!cyclist.visible) cyclist.position.copy(cyclistHome);
        if (strobe.visible) strobe.material.emissiveIntensity = Math.sin(t * 12) > 0 ? 3 : 0.4;
        sock.rotation.z = Math.sin(t * (gusting ? 7 : 2)) * (gusting ? 0.35 : 0.1);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind") repaint(windMeter.userData.screen, signFace(`${Math.round(gg.t * 140)}%`, { bg: "#0d1c24", accent: gg.t >= 0.14 && gg.t <= 0.48 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "confirm-tension") repaint(meter.userData.screen, signFace(`${Math.round(70 + gg.t * 60)}%`, { bg: "#0d1c24", accent: gg.t >= 0.42 && gg.t <= 0.6 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "tension" && session.holding && session.track) {
          const v = session.track.v;
          repaint(jackScreen.userData.screen, signFace(`${Math.round(v * 100)}%`, { bg: "#0d1c24", accent: v >= 0.42 && v <= 0.62 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "old-socket") oldNut.rotation.y = -session.turn.amount * Math.PI * 2;
        void CITY;
      },
    };
  },
};
