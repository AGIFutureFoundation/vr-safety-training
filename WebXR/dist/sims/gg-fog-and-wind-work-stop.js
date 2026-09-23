import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, cone,
  standingFigure, reg, surfaceTexture, texturedMat, deckPlateFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Fog & Wind Work Stop VR — Construction & Structural Trades,
// the Bay Area bridge pack, on the golden-gate-deck district.
//
// The weather on a bridge over a strait decides the shift more often than
// the work does: the marine layer can take the tower out of sight in
// minutes and the wind can pass the work-stop limit in a gust. The learner is
// the deck foreman, and the procedure is the work stop itself — the reading
// taken, everyone aloft called down in order of exposure, the deck cleared of
// what the wind takes first, the traveller brought back and the hoist locked,
// the headcount matched and the restart held until the trend says so. The
// numbers are the owner's procedure's; the station never invents a limit.

const GGF_ACCENT = 0x8fb3c4;

export const SIM_GG_FOG_AND_WIND_WORK_STOP = {
  id: "gg-fog-and-wind-work-stop",
  index: "231",
  domain: "Construction",
  trade: "Ironworkers and IMPACT with IUPAT bridge painters (FTI) — the deck foreman running the fog and wind work stop for every crew on the span",
  category: "Construction & Structural Trades",
  district: "golden-gate-deck",
  weather: "fog",
  certification: "Ironworkers and IMPACT bridge crew training with IUPAT and Finishing Trades Institute crews on the same span; the owner's weather and work-stop procedure; OSHA 29 CFR 1926, with 29 CFR 1926.21 safety training for every crew on the span; 29 CFR 1926.502 for the crews aloft; 29 CFR 1926.106 for work over water; MUTCD Part 6 for the closure in low visibility; ANSI/ISEA 107 for being seen in fog",
  name: "Fog & Wind Work Stop",
  title: simTitle("Fog & Wind Work Stop"),
  tagline: "The foreman's call when the weather turns: the procedure read, the wind taken against the limit, every crew aloft called down in order of exposure, the deck walked for what the wind takes first, visibility held until the fog closes in, the tarps tied down and the hoist stowed, the traveller brought home through a gust, the headcount matched, the hoist locked out, the restart held on the trend, and the stop logged",
  accent: GGF_ACCENT,
  accentCss: "#8fb3c4",
  parSeconds: 310,
  footprint: 2.8,
  badge: { id: "called-it-early", name: "Called It Early", note: "Everyone aloft down in order of exposure, nothing left loose for the wind, and the restart held until the trend said so" },

  supportLine: "the Ironworkers' and IUPAT member assistance programmes through your local or district council, and the crew's peer-support contact",

  game: system({
    name: "Deck Foreman",
    currency: "CALL",
    ranks: ["Crew Hand", "Lead Hand", "Weather Watch", "Deck Foreman", "Deck Foreman Certified"],
    badges: [
      { id: "most-exposed-first", name: "Most Exposed First", note: "The roll call made in order of exposure without a correction", test: AWARD.stepClean("roll-call") },
      { id: "home-steady", name: "Home Steady", note: "The traveller brought home inside its speed band", test: AWARD.precise(0.72) },
      { id: "no-finishing-up", name: "No Finishing Up", note: "Never told a crew to finish first, never in the lane, never a sheet carried upright", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-stop", name: "Clean Stop", note: "No corrections from the procedure to the log", test: AWARD.clean },
      { id: "steady-home", name: "Steady Home", note: "The traveller run never dropped out of band", test: AWARD.unbroken },
      { id: "stop-inside-par", name: "Stop Inside Par", note: "Logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "finish-up-call": "You went to tell the crews aloft to finish what they were doing before coming down. That is the call that turns a work stop into an accident: the bolt that is 'nearly done', the last stripe of paint, the one more minute on the cable — each is a person still aloft as the weather gets worse, and every minute makes the climb down harder. A work stop means stop now and come down; the work is still there tomorrow.",
    "untethered-tool-rail": "A spud wrench is lying untethered on top of the railing, where somebody put it down on the way past. In a gust past the work-stop limit that wrench is the first thing to go, and on the outside of the railing is the strait. The deck walk before the wind arrives is for exactly this: anything loose at the railing goes into the gang box or onto a tether.",
    "open-lane-in-fog": "You stepped out past the closure's cones into the open lane to get a better look at the crews down the span. In fog, drivers in the open lanes see the cones late and a person in the lane later still — often not at all, until the vehicle is on them. Visibility is checked from inside the closure, and nobody crosses the channelising line while the fog is on the deck.",
    "sheet-upright-in-wind": "You picked up the plywood sheet and started carrying it upright across the deck. A sheet of plywood carried upright in a gust is a sail with a person holding it: the wind takes the sheet and the person with it, toward the lanes or the railing. Sheets are carried flat, by two people, low — or tied down where they lie until the wind drops.",
  },

  lateNotes: {
    "traveller-console": "The traveller is called home once the crews aloft have been called down and the deck has been cleared of loose sheets and tarps.",
    "hoist-lock": "The hoist is locked once it is stowed and its disconnect is open — disconnect first, then the lock.",
    "work-stop-log": "The work stop is logged once the restart decision has been made on the trend, not before.",
  },

  steps: [
    {
      id: "procedure", kind: "select", target: "weather-procedure",
      title: "Read the weather procedure and the forecast",
      cue: "Read the owner's weather and work-stop procedure — the wind limit, the visibility criterion, who stops first, the restart criteria — and the forecast on the board.",
      why: "A work stop on a bridge is written down before the weather arrives, because deciding the limit while the wind is rising is deciding it under pressure. The owner's procedure sets the wind and visibility criteria, the order crews come down in and what has to be true to restart, and the foreman who has read it before the shift can make the call in a sentence instead of a debate.",
    },
    {
      id: "wind", kind: "gauge", target: "anemometer-readout",
      title: "Take the wind reading against the work-stop limit",
      cue: "Read the anemometer and commit the reading while it sits in the band below the work-stop limit — then watch its trend.",
      why: "The reading on the deck is the number the procedure is written against, and it is taken from the instrument, not from how the wind feels on the face. A reading below the limit but climbing is itself a warning: the foreman commits the number, notes the trend, and starts the stop early enough that nobody is still aloft when the limit is passed.",
      gauge: {
        label: "WIND · % OF WORK-STOP LIMIT", speed: 0.68, green: [0.2, 0.55],
        readout: (t) => `${Math.round(t * 140)}% of limit`,
        missNote: "That reading is at or past the work-stop limit — or you committed a lull. The limit is read on the gusts, not the calm between them.",
      },
    },
    {
      id: "roll-call", kind: "sequence",
      targets: ["tower-crew-call", "traveller-crew-call", "paint-crew-call"],
      itemNames: { "tower-crew-call": "tower crew — highest and most exposed", "traveller-crew-call": "traveller crew — on the cable", "paint-crew-call": "paint crew at the railing" },
      title: "Call the crews down in order of exposure",
      cue: "On the radio, call the tower crew first, then the traveller crew on the cable, then the paint crew at the railing — each acknowledges and starts down.",
      why: "The crews aloft are not equally exposed: the tower crew has the longest, most wind-struck climb down and the traveller crew is riding a platform that moves in the wind, while the paint crew at the railing is a few steps from the deck. The most exposed crew is called first because it needs the most time, and each call is acknowledged so the foreman knows who has actually heard it.",
      outOfOrderNote: "The most exposed crew first — the tower crew has the furthest to come and the most wind on the way.",
    },
    {
      id: "deck-walk", kind: "find", noHint: true,
      targets: ["loose-tarp", "empty-bucket", "plywood-sheet"],
      itemNames: {
        "loose-tarp": "a tarp flapping loose off the gang box",
        "empty-bucket": "an empty paint bucket by the railing",
        "plywood-sheet": "a plywood sheet leaning on the barrier",
      },
      itemNotes: {
        "loose-tarp": "A tarp has worked loose off the gang box and is lifting at one corner. The next gust takes it across the lanes or over the railing, and a tarp on a windscreen is a crash.",
        "empty-bucket": "An empty paint bucket is standing by the railing. Empty is the problem: it weighs nothing, and it rolls and flies long before anything full does.",
        "plywood-sheet": "A plywood sheet is leaning upright against the barrier. Upright it catches the whole gust; it goes down flat and tied, or into the truck.",
      },
      title: "Walk the deck for what the wind takes first",
      cue: "Walk the closure and find what the wind will take first: anything light, anything loose, anything standing upright.",
      why: "The wind on a bridge deck does not start with the heavy things; it starts with the light, loose and upright ones — the tarp, the empty bucket, the sheet — and it carries them into the open lanes or over the railing. Walking the deck as the wind builds, and dealing with those three kinds of thing, is how a work stop protects the traffic and the water as well as the crew.",
    },
    {
      id: "visibility", kind: "hold", target: "visibility-marker", seconds: 5,
      title: "Hold the visibility check on the far marker",
      cue: "Hold the binoculars on the far light standard the procedure names as the visibility marker, and keep it in sight for the full check.",
      why: "Fog closes a deck from the far end first, and the procedure's visibility criterion is a marker you can either see or not. Holding the check on it for the full count, rather than glancing, is how the foreman knows whether it is steady or coming and going in the marine layer; when it goes, the crews aloft can no longer be seen from the deck and the closure can no longer be seen by traffic.",
      holdBreakNote: "You took the binoculars off the marker before the check was complete. Hold it in sight for the full count.",
    },
    {
      id: "tie-down", kind: "drag", target: "tarp-bundle",
      title: "Tie the tarp bundle down to the deck ring",
      cue: "Carry the folded tarp bundle to the deck tie-down ring and strap it down flat.",
      why: "Tarps are the thing a wind most wants on a bridge deck: light, wide and fastened with bungees that were never meant for a gust. Folded and strapped flat to a tie-down, a tarp presents nothing for the wind to lift, and it stays where the crew can find it when work restarts.",
      drag: { to: "deck-tie-down", radius: 0.45, missNote: "Not at the ring — the bundle is strapped down flat at the tie-down, not left on top of the gang box." },
    },
    {
      id: "stow-hoist", kind: "turn", target: "hoist-crank",
      title: "Crank the material hoist boom down to its stowed rest",
      cue: "Crank the davit hoist's boom down and round onto its stowed rest, hook up and tied.",
      why: "A material hoist left with its boom out and its hook hanging is a pendulum in the wind: the hook swings into the crew coming down, the boom catches the gust and loads the base. Stowed on its rest with the hook tied off, it has nothing left for the wind to work on until it is needed again.",
      turn: { turns: 1.0, label: "HOIST BOOM", readout: (t) => (t < 0.5 ? "lowering" : t < 0.98 ? "slewing to the rest" : "stowed, hook tied") },
    },
    {
      id: "traveller-home", kind: "track", target: "traveller-console", seconds: 7,
      title: "Bring the traveller home at a controlled speed",
      cue: "On the console, bring the traveller back along the cable to the tower platform, holding its speed inside the band while the crew rides it in.",
      why: "The traveller crew is still riding the cable when the stop is called, and the fastest way home is not the safest: a traveller driven hard swings its platform, and in a rising wind the swing adds to the gusts. Brought home inside its speed band, it arrives at the tower platform steady enough for the crew to transfer off it to a fixed deck.",
      track: {
        start: 0.1, green: [0.4, 0.62], rise: 0.56, fall: 0.44, drift: 0.14, label: "TRAVELLER · RETURN SPEED",
        readout: (v) => (v < 0.4 ? "crawling — crew exposed longer" : v > 0.62 ? "too fast — platform swinging" : "steady return"),
      },
      holdBreakNote: "The return speed left the band and the platform began to swing in the wind. Ease it back into the band.",
    },
    {
      id: "headcount", kind: "select", target: "headcount-board",
      title: "Match the headcount to the sign-in",
      cue: "Check every name on the sign-in sheet against the people now on the deck, crew by crew.",
      why: "In fog, 'everyone's down' is a guess until it is a count. The headcount is matched against the sign-in, crew by crew, because the person still aloft is the one nobody can see — and the only way to know nobody is still up the tower in the grey is to have their name against a face on the deck.",
    },
    {
      id: "lock-hoist", kind: "sequence",
      targets: ["hoist-disconnect", "hoist-lock"],
      itemNames: { "hoist-disconnect": "hoist disconnect opened", "hoist-lock": "lock and tag on the disconnect" },
      title: "Open the hoist disconnect, then lock and tag it",
      cue: "Open the hoist's disconnect, then put your lock and tag on it so nobody can run the hoist while the stop is on.",
      why: "A work stop is also a stop on anyone deciding to 'just bring the last load up'. The disconnect is opened and then locked and tagged so the hoist cannot be energised by someone who did not hear the stop, and the tag says who stopped it and why; the lock comes off only when the restart is called.",
      outOfOrderNote: "Disconnect first — a lock on a closed disconnect locks the hoist on, not off.",
    },
    {
      id: "restart-hold", kind: "hold", target: "trend-display", seconds: 5,
      title: "Hold the restart on the trend, not the lull",
      cue: "Watch the wind and visibility trend on the display and hold the restart until both have stayed inside the procedure's criteria for its full period.",
      why: "The commonest way a work stop fails is the restart: a lull between gusts, a gap in the fog, and the crews go back up into weather that has not actually changed. The procedure sets a period both the wind and the visibility have to stay inside before the restart, and the foreman holds the decision on the trend for that whole period, not on the best minute in it.",
      holdBreakNote: "You called the restart before the trend had held for the full period — that was a lull. Keep watching.",
    },
    {
      id: "work-stop-log", kind: "select", target: "work-stop-log",
      title: "Log the work stop",
      cue: "Record the readings, the time each crew was called and was down, the deck items secured, the hoist lock, and the restart decision and its time.",
      why: "The work-stop log is what shows the procedure was followed on the day: the readings behind the call, when each crew was told and when they were down, what was secured and when work restarted. It is also how the procedure gets better — a stop that took too long to clear the tower shows up in the times, and the next shift plans for it.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with every crew lead",
      cue: "Call each crew lead: stop logged, restart decision, and how their crew is after coming down in the weather.",
      why: "The crew leads need the restart decision from the foreman directly, not from rumour, and a crew that came down a tower in a gust and a fog bank needs someone to ask how they are. The check-in is where the foreman hears it, and the Ironworkers' and IUPAT member assistance lines are named because a bad descent can stay with people long after the fog lifts.",
    },
  ],

  interrupts: [
    {
      id: "fog-bank-closes",
      kind: "Fog bank rolling in",
      after: "visibility", delay: 2, seconds: 12,
      alert: "A fog bank rolls over the railing off the strait and the far light standard disappears — the tower top goes, then the traveller on the cable.",
      cue: "Sound the work-stop horn — three long blasts — so every crew aloft knows the stop is on even if their radio is not.",
      target: "work-stop-horn",
      why: "When the fog takes the visibility marker, the foreman can no longer see the crews aloft and they can no longer see the deck. The radio calls are already going out, but a radio can be turned down, on the wrong channel or in a pocket in the wind; the horn is heard by everyone on the span at once, and its signal is in the procedure so nobody has to wonder what it means.",
      missNote: "The fog closed the deck and nothing but the radio told the crews aloft the stop was on. Anyone off channel or out of earshot of a handset kept working, unseen, in the fog.",
      wrongNote: "The work-stop horn — when the visibility goes, the signal everyone hears at once is the horn.",
    },
    {
      id: "gust-on-the-return",
      kind: "Gust past the work-stop limit",
      after: "traveller-home", delay: 3, seconds: 12,
      alert: "A gust hits the span as the traveller comes home — the windsock stands out red and the platform starts swinging on the cable.",
      cue: "Hit the traveller's emergency stop and let the crew aboard hold on until the swing settles.",
      target: "traveller-estop",
      why: "A traveller driven through a gust past the limit swings further with every metre it moves, and the crew aboard is holding on instead of standing. Stopping it lets the swing settle under the carriage; the crew braces, clipped to the platform, and the return resumes at a slower speed when the gust has passed. Pushing on to get them home faster is exactly what makes the swing dangerous.",
      missNote: "The traveller kept moving through the gust with its platform swinging further on every metre, and the crew aboard spent the gust holding on to a platform that was being driven.",
      wrongNote: "The traveller's emergency stop — stop the platform and let the swing settle before anything else.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.8, GGF_ACCENT);

    const matTex = surfaceTexture((cx, w, h) => deckPlateFace(cx, w, h, { base: "#3a4047", base2: "#30363c" }), { repeat: 4, px: 256 });
    const workMat = box(g, 5.8, 0.02, 4.6, 0, 0.01, 0.1, 0x3a4047, { rough: 0.8, metal: 0.3, cast: false });
    workMat.material = texturedMat(matTex, { rough: 0.8, metal: 0.3, color: 0x9aa2aa });

    // ------------------------------------------------ the foreman's console desk
    const desk = group(g, 0.1, 0, -0.9);
    box(desk, 1.6, 0.06, 0.7, 0, 0.92, 0, 0x5a636c, { rough: 0.5, metal: 0.5 });
    for (const [px, pz] of [[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.3], [0.75, 0.3]]) box(desk, 0.05, 0.9, 0.05, px, 0.45, pz, 0x8a949d, { rough: 0.45, metal: 0.7 });
    box(desk, 1.5, 0.3, 0.06, 0, 1.1, -0.32, 0x2b3138, { rough: 0.6 });
    const callBtns = {};
    [["tower-crew-call", "TOWER", -0.55], ["traveller-crew-call", "TRAVELLER", -0.2], ["paint-crew-call", "PAINT", 0.15]].forEach(([id, label, x]) => {
      const b = group(desk, x, 0.97, 0.1);
      box(b, 0.26, 0.04, 0.16, 0, 0, 0, 0x2f4f6f, { rough: 0.5 });
      decal(b, 0.22, 0.08, 0, 0.022, 0, signFace(label, { bg: "#0d1c24", accent: "#8fb3c4", fg: "#eaf6fb", scale: 0.5 }), { px: 128 }).rotation.x = -Math.PI / 2;
      reg(hits, b, id);
      callBtns[id] = b;
    });
    holoTag(desk, "crew call buttons", -0.2, 1.35, 0.1, { css: "#8fb3c4", w: 0.34 });
    const finishHit = group(desk, 0.5, 0.97, 0.1);
    box(finishHit, 0.2, 0.04, 0.16, 0, 0, 0, 0x6a4a2a, { rough: 0.5 });
    decal(finishHit, 0.18, 0.08, 0, 0.022, 0, signFace("FINISH UP", { bg: "#2a1a0a", accent: "#d2312b", fg: "#f2e6c8", scale: 0.45 }), { px: 128 }).rotation.x = -Math.PI / 2;
    holoTag(desk, "tell them to finish first?", 0.5, 1.2, 0.2, { css: "#d2312b", w: 0.46 });
    reg(hits, finishHit, "finish-up-call");
    const tConsole = group(desk, 0.55, 1.12, -0.28);
    box(tConsole, 0.34, 0.2, 0.05, 0, 0, 0, 0x1a1e23, { rough: 0.6 });
    const consoleScreen = decal(tConsole, 0.28, 0.12, 0, 0.02, 0.028, signFace("TRAVELLER", { bg: "#0d1c24", accent: "#8fb3c4", fg: "#bfeaf7", scale: 0.5 }), { px: 192, glow: true, ei: 0.8 });
    holoTag(tConsole, "traveller console", 0, 0.18, 0.02, { css: "#8fb3c4", w: 0.32 });
    reg(hits, tConsole, "traveller-console");
    const estop = group(desk, 0.72, 0.98, 0.15);
    cyl(estop, 0.05, 0.05, 0.04, 0, 0, 0, 0xd8232a, { rough: 0.5, seg: 14 });
    cyl(estop, 0.06, 0.06, 0.02, 0, -0.02, 0, 0xf2d21e, { rough: 0.5, seg: 14 });
    holoTag(estop, "traveller e-stop", 0, 0.12, 0, { css: "#8fb3c4", w: 0.3 });
    reg(hits, estop, "traveller-estop");
    const radio = instrument(desk, -0.6, 0.97, -0.12, { ry: 0.2, idle: "ALL CREWS", color: GGF_ACCENT, w: 0.1, d: 0.16 });
    holoTag(radio, "crew radio", 0, 0.14, 0, { css: "#8fb3c4", w: 0.24 });
    reg(hits, radio, "crew-radio");

    // ------------------------------------------------ weather mast and trend display
    const mast = group(g, 1.9, 0, -1.55);
    cyl(mast, 0.035, 0.045, 3.0, 0, 1.5, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const cups = group(mast, 0, 3.05, 0);
    for (let i = 0; i < 3; i++) {
      const arm = group(cups, 0, 0, 0, (i * Math.PI * 2) / 3);
      box(arm, 0.2, 0.01, 0.01, 0.1, 0, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6 });
      ball(arm, 0.035, 0.2, 0, 0, 0xdfe4e8, { rough: 0.4, seg: 8, seg2: 6 });
    }
    box(mast, 0.34, 0.02, 0.02, 0.17, 2.6, 0, 0x9aa1a8, { rough: 0.5, metal: 0.6 });
    const sock = cyl(mast, 0.07, 0.035, 0.4, 0.34, 2.6, 0.14, 0x59c97b, { rough: 0.7, seg: 10 });
    sock.rotation.x = 1.1;
    const strobe = ball(mast, 0.05, 0, 3.2, 0, 0xff3b30, { emissive: 0xff3b30, ei: 2.6, seg: 8, seg2: 6 });
    strobe.visible = false;
    const anemo = instrument(mast, 0, 1.25, 0.1, { idle: "-- %", color: GGF_ACCENT, w: 0.12, d: 0.16 });
    anemo.rotation.x = Math.PI / 2.4;
    holoTag(mast, "anemometer readout", 0, 1.48, 0.12, { css: "#8fb3c4", w: 0.36 });
    reg(hits, anemo, "anemometer-readout");
    const trend = holoPanel(g, 0.9, 0.5, 1.2, 1.75, -1.6, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#8fb3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("WIND + VISIBILITY TREND", w * 0.05, h * 0.14);
      cx.strokeStyle = "#f0645b"; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(w * 0.05, h * 0.4); cx.lineTo(w * 0.95, h * 0.4); cx.stroke();
      cx.strokeStyle = "#8fb3c4"; cx.lineWidth = 3; cx.beginPath();
      for (let i = 0; i <= 20; i++) { const x = w * (0.05 + i * 0.045); const y = h * (0.8 - 0.35 * Math.abs(Math.sin(i * 0.7)) * (i / 20)); if (i) cx.lineTo(x, y); else cx.moveTo(x, y); }
      cx.stroke();
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb"; cx.fillText("limit per the owner's procedure", w * 0.05, h * 0.92);
    }, { ry: 0, accent: GGF_ACCENT });
    holoTag(trend, "trend — hold", 0, 0.32, 0, { css: "#8fb3c4", w: 0.26 });
    reg(hits, trend, "trend-display");
    const proc = holoPanel(g, 0.92, 0.62, -2.35, 1.35, 0.9, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#8fb3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("WEATHER & WORK-STOP PROCEDURE", w * 0.06, h * 0.13);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Wind: stop at the posted limit, read on gusts", "Visibility: stop when the marker is lost", "Order: tower, traveller, railing crews",
       "Signal: three long blasts on the horn", "Headcount against the sign-in", "Restart: trend inside criteria for the period"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.29 + i * 0.11)));
    }, { ry: 1.1, accent: GGF_ACCENT });
    reg(hits, proc, "weather-procedure");
    const board = holoPanel(g, 0.7, 0.55, -2.4, 1.35, -0.45, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#8fb3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("SIGN-IN / HEADCOUNT", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Tower crew: 3 signed in", "Traveller crew: 2 signed in", "Paint crew: 3 signed in", "Deck: foreman, flagger"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.34 + i * 0.15)));
    }, { ry: 1.4, accent: GGF_ACCENT });
    reg(hits, board, "headcount-board");
    const log = holoPanel(g, 0.72, 0.5, 0.9, 1.4, 2.5, (cx, w, h) => {
      cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#8fb3c4"; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#d8f2fa"; cx.fillText("WORK-STOP LOG", w * 0.06, h * 0.15);
      cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
      ["Readings: —", "Crews down: —", "Secured: —", "Restart: —"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
    }, { ry: -0.2, accent: GGF_ACCENT });
    reg(hits, log, "work-stop-log");

    // ------------------------------------------------ visibility marker, horn
    const bino = group(g, -1.1, 0, 0.9);
    for (let i = 0; i < 3; i++) { const l = box(bino, 0.02, 1.3, 0.02, Math.sin(i * 2.1) * 0.15, 0.62, Math.cos(i * 2.1) * 0.15, 0x2b3138, { rough: 0.6 }); l.rotation.z = Math.sin(i * 2.1) * 0.2; }
    for (const sx of [-0.04, 0.04]) cyl(bino, 0.028, 0.028, 0.16, sx, 1.32, 0, 0x1a1e23, { rough: 0.5, seg: 10 }).rotation.x = Math.PI / 2;
    holoTag(bino, "visibility check — hold", 0, 1.55, 0, { css: "#8fb3c4", w: 0.42 });
    reg(hits, bino, "visibility-marker");
    const hornPole = group(g, -2.5, 0, 2.0);
    cyl(hornPole, 0.03, 0.04, 2.2, 0, 1.1, 0, 0x9aa1a8, { rough: 0.45, metal: 0.7, seg: 8 });
    const horn = cyl(hornPole, 0.04, 0.16, 0.34, 0.1, 2.1, 0, 0xf2d21e, { rough: 0.5, seg: 14 });
    horn.rotation.z = -Math.PI / 2;
    const hornBtn = box(hornPole, 0.12, 0.16, 0.08, 0, 1.2, 0.06, 0xd8232a, { rough: 0.5 });
    holoTag(hornPole, "work-stop horn", 0, 1.45, 0.06, { css: "#8fb3c4", w: 0.3 });
    reg(hits, hornPole, "work-stop-horn");

    // ------------------------------------------------ hoist, gang box, loose items
    const hoist = group(g, -2.0, 0, -1.55);
    box(hoist, 0.5, 0.06, 0.5, 0, 0.03, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    cyl(hoist, 0.06, 0.07, 1.6, 0, 0.8, 0, 0xe8b830, { rough: 0.5, metal: 0.4, seg: 10 });
    const boom = group(hoist, 0, 1.6, 0);
    boom.rotation.z = 0.5;
    box(boom, 1.1, 0.08, 0.08, 0.55, 0, 0, 0xe8b830, { rough: 0.5, metal: 0.4 });
    cyl(boom, 0.006, 0.006, 0.6, 1.08, -0.3, 0, 0x2b3138, { rough: 0.6, seg: 6 });
    const crank = group(hoist, 0.1, 0.9, 0.1);
    cyl(crank, 0.05, 0.05, 0.03, 0, 0, 0, CITY.darkSteel, { rough: 0.5, metal: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const crankArm = box(crank, 0.14, 0.02, 0.02, 0.07, 0, 0.03, 0xd8b23a, { rough: 0.5 });
    holoTag(crank, "hoist crank", 0, 0.14, 0, { css: "#8fb3c4", w: 0.24 });
    reg(hits, crank, "hoist-crank");
    const disc = group(g, -1.35, 0, -1.85);
    cyl(disc, 0.03, 0.03, 1.1, 0, 0.55, 0, 0x5a636c, { rough: 0.5, seg: 8 });
    box(disc, 0.24, 0.3, 0.14, 0, 1.2, 0, 0x5a636c, { rough: 0.5, metal: 0.5 });
    const discHandle = box(disc, 0.04, 0.14, 0.04, 0.14, 1.22, 0, 0xd8232a, { rough: 0.5 });
    holoTag(disc, "hoist disconnect", 0, 1.46, 0, { css: "#8fb3c4", w: 0.3 });
    reg(hits, disc, "hoist-disconnect");
    const lock = group(disc, 0.14, 1.08, 0.08);
    torus(lock, 0.02, 0.005, 0, 0.02, 0, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6, seg2: 10 });
    box(lock, 0.03, 0.035, 0.016, 0, 0, 0, 0xd8232a, { rough: 0.5 });
    holoTag(lock, "lock + tag", 0, 0.08, 0.02, { css: "#8fb3c4", w: 0.2 });
    reg(hits, lock, "hoist-lock");
    const gang = group(g, 2.2, 0, 0.7, -0.3);
    box(gang, 1.0, 0.6, 0.55, 0, 0.3, 0, 0x2f4f6f, { rough: 0.55, metal: 0.35 });
    const tarp = box(gang, 0.9, 0.02, 0.6, 0.05, 0.63, 0, 0x3a6a9a, { rough: 0.9 });
    tarp.rotation.z = 0.25;
    reg(hits, tarp, "loose-tarp");
    const bundle = group(g, 1.25, 0, 1.4);
    box(bundle, 0.5, 0.18, 0.36, 0, 0.09, 0, 0x3a6a9a, { rough: 0.9 });
    holoTag(bundle, "tarp bundle — carry", 0, 0.36, 0, { css: "#8fb3c4", w: 0.36 });
    reg(hits, bundle, "tarp-bundle");
    const ring = group(g, 2.2, 0.02, -0.55);
    box(ring, 0.16, 0.02, 0.16, 0, 0, 0, 0x3a4148, { rough: 0.6, metal: 0.5 });
    torus(ring, 0.06, 0.012, 0, 0.03, 0, GGF_ACCENT, { emissive: GGF_ACCENT, ei: 1.4, rough: 0.4, seg: 6, seg2: 14 }).rotation.x = Math.PI / 2;
    holoTag(ring, "deck tie-down", 0, 0.24, 0, { css: "#8fb3c4", w: 0.26 });
    reg(hits, ring, "deck-tie-down");
    const bucket = group(g, -0.4, 0, 2.3);
    cyl(bucket, 0.14, 0.12, 0.3, 0, 0.15, 0, 0xe8541e, { rough: 0.6, seg: 12 });
    reg(hits, bucket, "empty-bucket");
    const sheet = box(g, 1.2, 1.2, 0.02, 2.55, 0.62, 1.95, 0xc8a878, { rough: 0.9 });
    sheet.rotation.set(0.12, -0.5, 0);
    reg(hits, sheet, "plywood-sheet");
    const sheetHit = box(g, 0.5, 0.6, 0.4, 2.3, 1.3, 1.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "carry it upright?", 2.3, 1.75, 1.7, { css: "#d2312b", w: 0.34 });
    reg(hits, sheetHit, "sheet-upright-in-wind");
    const spud = group(g, -2.6, 1.05, 1.3, 0.3);
    box(spud, 0.3, 0.02, 0.03, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.8 });
    box(g, 0.8, 0.06, 0.1, -2.6, 1.0, 1.3, 0xc8461d, { rough: 0.6, metal: 0.3 });
    for (const px of [-2.95, -2.25]) box(g, 0.06, 1.0, 0.06, px, 0.5, 1.3, 0xc8461d, { rough: 0.6, metal: 0.3 });
    holoTag(g, "wrench on the rail", -2.6, 1.3, 1.3, { css: "#d2312b", w: 0.3 });
    reg(hits, spud, "untethered-tool-rail");
    const laneHit = box(g, 0.6, 1.6, 0.6, 3.4, 0.8, -0.5, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "step into the lane to look?", 3.4, 1.75, -0.5, { css: "#d2312b", w: 0.48 });
    reg(hits, laneHit, "open-lane-in-fog");

    // ------------------------------------------------ crew, cones, fog bank
    const lead = standingFigure(g, 0.9, 0.6, { ry: -2.6, cloth: 0x1f3a52, vest: 0xd4ff3a, helmet: 0xf2c14b });
    holoTag(lead, "paint crew lead", 0, 1.95, 0, { css: "#59c97b", w: 0.3 });
    const flagger = standingFigure(g, -0.4, -2.55, { ry: 0.4, cloth: 0x2b3138, vest: 0xd4ff3a, helmet: 0xf2f2f2 });
    holoTag(flagger, "flagger", 0, 1.95, 0, { css: "#59c97b", w: 0.2 });
    cone(g, 3.05, 1.0, { color: 0xe4622a }); cone(g, 3.05, -1.4, { color: 0xe4622a }); cone(g, 3.05, 2.4, { color: 0xe4622a });

    const fog = group(g, -50, 0, -4);
    const fogMat = { rough: 1, opacity: 0.6, transparent: true, cast: false, receive: false };
    box(fog, 9, 9, 30, 0, 3.5, 0, 0xdfe5e9, fogMat);
    box(fog, 10, 7, 22, -4, 2.5, 9, 0xe8ecef, fogMat);
    box(fog, 7, 12, 18, 3, 5, -9, 0xd6dde2, fogMat);
    fog.visible = false;
    const fogHome = fog.position.clone();

    let gusting = false, fogOn = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0.1, 1.2, -0.9),
      onStepComplete(step) {
        if (step.id === "roll-call") for (const b of Object.values(callBtns)) b.position.y = 0.955;
        if (step.id === "deck-walk") { tarp.rotation.z = 0; bucket.visible = false; sheet.rotation.set(-Math.PI / 2, 0, 0); sheet.position.y = 0.03; }
        if (step.id === "tie-down") bundle.position.set(2.2, 0, -0.55);
        if (step.id === "stow-hoist") boom.rotation.z = -0.05;
        if (step.id === "traveller-home") repaint(consoleScreen, signFace("AT TOWER", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "lock-hoist") discHandle.rotation.z = Math.PI / 2;
        if (step.id === "work-stop-log") repaint(log.userData.face, (cx, w, h) => {
          cx.fillStyle = "rgba(6,16,22,0.92)"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
          cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
          cx.fillStyle = "#d8f2fa"; cx.fillText("WORK-STOP LOG", w * 0.06, h * 0.15);
          cx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; cx.fillStyle = "#eaf6fb";
          ["Readings: wind trend, marker lost", "Crews down: tower, traveller, railing — times", "Secured: tarps, sheet, hoist locked", "Restart: held on the trend"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.36 + i * 0.16)));
        });
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("ALL DOWN", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
      },
      onInterrupt(it) {
        if (it.id === "fog-bank-closes") { fogOn = true; fog.visible = true; fog.position.set(-22, 0, -4); }
        if (it.id === "gust-on-the-return") {
          gusting = true; strobe.visible = true;
          sock.material = mat(0xd2312b, { rough: 0.7, emissive: 0x6a1010, ei: 0.6 });
          sock.rotation.x = Math.PI / 2;
          repaint(consoleScreen, signFace("SWING", { bg: "#0d1c24", accent: "#f0645b", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onInterruptEnd(it) {
        if (it.id === "fog-bank-closes" && it.resolved === "answered") hornBtn.material = mat(0x59c97b, { rough: 0.5, emissive: 0x59c97b, ei: 0.8 });
        if (it.id === "gust-on-the-return") {
          gusting = false;
          if (it.resolved !== "answered") return;
          strobe.visible = false; sock.rotation.x = 1.1;
          sock.material = mat(0x59c97b, { rough: 0.7 });
          repaint(consoleScreen, signFace("STOPPED", { bg: "#0d1c24", accent: "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        }
      },
      onHazard(hitId) {
        if (hitId === "untethered-tool-rail") spud.position.z = 1.38;
      },
      animate(t, dt, session) {
        const d = dt ?? 0.016;
        cups.rotation.y = t * (gusting ? 14 : 5);
        if (strobe.visible) strobe.material.emissiveIntensity = Math.sin(t * 12) > 0 ? 3 : 0.4;
        if (fogOn && fog.position.x < -10) fog.position.x += d * 0.8;
        if (!fogOn && fog.position.x !== fogHome.x) fog.position.copy(fogHome);
        const step = session?.step;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "wind") repaint(anemo.userData.screen, signFace(`${Math.round(gg.t * 140)}%`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.55 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.6 }));
        if (session?.turn && step?.id === "stow-hoist") crankArm.rotation.z = session.turn.amount * Math.PI * 2;
        void paperFace; void hose;
      },
    };
  },
};
