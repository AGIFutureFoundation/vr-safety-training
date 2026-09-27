import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  stationPad, holoTag, instrument, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace,
} from "../citykit.js";
import { eiLine, eiTeamLine, reflectionPrompt } from "../../../shared/ei-guide.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Basketball Fundamentals VR — help defence and rotations.
// A driver beats their defender and the team either rotates as one or
// leaves the rim open. The lesson is trust the rotation behind you: the
// helper steps in and says so, the teammate behind rotates to the helper's
// man, and the beaten defender recovers to whoever is left rather than
// chasing the ball. Charges are never taught to young players by stepping
// under an airborne shooter.
//
// Sited generically in the gym-court district; the team and players are
// invented. No statistic, study or named player is asserted.

const HDR_ACCENT = 0x7a5cff;
const HDR_CSS = "#7a5cff";

export const SIM_BB_HELP_DEFENSE_ROTATIONS = {
  id: "bb-help-defense-rotations",
  index: "726",
  domain: "Youth Sports",
  trade: "Youth basketball player and coach",
  category: "Youth Sports & Coaching",
  district: "gym-court",
  weather: "clear",
  certification: "USA Basketball youth development guidelines for teaching team defence in stages, positioning before contact; NFHS basketball rules on legal guarding position and the verticality a helper keeps at the rim; CDC Heads Up for the collision under the basket a late help step causes; the Association for Applied Sport Psychology's guidance on trust and communication inside a team; the U.S. Center for SafeSport for correction given calmly and in view; the American Red Cross first aid course for the check after a fall; AFSCME and SEIU recreation staff who run the public gym",
  name: "Help Defence and Rotations",
  title: simTitle("Help Defence and Rotations"),
  tagline: "Trust the rotation behind you: the helper steps in and says so, the next teammate rotates, and the beaten defender recovers to whoever is left",
  accent: HDR_ACCENT,
  accentCss: HDR_CSS,
  parSeconds: 330,
  footprint: 2.6,
  badge: {"id":"one-string","name":"On One String","note":"Help, rotate and recover run as one team move, every step called before it was taken"},

  supportLine: "your coach, the assistant who ran the shell drill, or the teammate who rotated behind you — a fall under the basket is worth talking through afterwards",

  game: system({
    name: "Shell Board",
    currency: "ROTATIONS",
    ranks: ["Ball Watcher","Helper","Rotator","Back-Line Voice","Defensive Anchor"],
    badges: [
      { id: "clean-read", name: "Saw the Drive", note: "Everything in the opening scan found first time", test: AWARD.stepClean("read-the-drive") },
      { id: "no-blame", name: "No Blame", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "in-the-band", name: "In the Band", note: "Every gauge and meter held inside its band", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-run", name: "Clean Run", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "steady-hands", name: "Steady Hands", note: "Every hold and track carried its full count", test: AWARD.unbroken },
      { id: "quick-and-right", name: "Quick and Right", note: "Finished inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {"step-under-an-airborne-shooter":"You slid under a player who was already in the air to draw a charge. NFHS rules give a defender a legal position only when it is established before the shooter leaves the floor, and stepping under an airborne body is how a young player lands on someone's back or takes a head knock off the floor — CDC Heads Up is plain that a fall like that removes a player from play.","chase-the-ball-not-the-rotation":"You chased the ball after being beaten instead of recovering to the open man. When the beaten defender follows the drive, two defenders end up on one player and the pass out finds a teammate with nobody near them; the rotation only works if the beaten player trusts it and goes to whoever is left.","help-without-a-word":"You stepped over to help without saying so. The teammate behind you cannot rotate to your man if they do not know you left him, and the silent help turns one open driver into one open shooter; the help call is what turns a single player's reaction into a team's rotation.","blame-the-beaten-defender":"You told the defender who got beaten, loudly and during play, that it was their fault. Help defence exists because everyone gets beaten sometimes; the Association for Applied Sport Psychology's guidance on team trust is that shaming the first mistake makes the next player hesitate to help at all."},

  lateNotes: {"hdr-practice-log":"The log closes the shell drill once the rotation has held at speed — nothing to record yet.","hdr-crew-checkin":"The check-in comes after the log, at the very end."},

  steps: [{"id":"read-the-drive","kind":"find","noHint":true,"targets":["hdr-driver-beating","hdr-helper-position","hdr-open-corner"],"itemNames":{"hdr-driver-beating":"the driver getting past their defender","hdr-helper-position":"the helper standing in the lane","hdr-open-corner":"the corner the helper will leave open"},"itemNotes":{"hdr-driver-beating":"The driver turning the corner is the moment the team has to move together. Everything starts from this.","hdr-helper-position":"The helper in the lane is already where the drive is going. Their first job is to say so.","hdr-open-corner":"Whoever the helper leaves is the next pass. The rotation behind exists for exactly that player."},"decoyNotes":{"hdr-ball-in-the-air":"A skip pass in the air is the next action, not this one. Read the drive first."},"title":"Read the drive before it reaches the rim","cue":"Watch the drive begin: who is beaten, who is in position to help, and who will be left open.","why":"Help defence is five players reacting to one moment. Seeing the driver turn the corner, the helper already standing in the lane and the corner shooter that help will leave open — all in one look — is what lets the team move before the ball arrives rather than after, and before is the only time rotation works without a collision."},{"id":"post-the-shell-words","kind":"select","target":"hdr-shell-card","title":"Agree the shell drill words","cue":"Post the four words: ball, help, rotate, recover — each player says theirs every rep.","why":"In the shell drill every defender has a word for where they are: on the ball, in help, rotating or recovering. Saying it every rep, even when nothing happens, is what makes it automatic when something does, and it gives the coach a way to hear which defender has lost their place before the drill turns into a scramble."},{"id":"build-the-rotation-order","kind":"sequence","targets":["hdr-order-help","hdr-order-rotate","hdr-order-recover","hdr-order-close"],"itemNames":{"hdr-order-help":"1 · helper steps in and calls it","hdr-order-rotate":"2 · next defender rotates to the helper's man","hdr-order-recover":"3 · beaten defender recovers to the open player","hdr-order-close":"4 · close out under control"},"title":"Run the rotation in the order it happens","cue":"Help, rotate, recover, close out — each move triggered by the one before it.","why":"Each move in a rotation is somebody answering the move before: the helper steps in, so the next defender rotates to the helper's man, so the beaten defender recovers to whoever is left, so somebody closes out on the shooter under control. Out of order, two players rotate to the same man and the rim is left empty.","outOfOrderNote":"Out of order. The rotation only starts once the help has been called — rotating first leaves the driver alone at the rim."},{"id":"helper-holds-position","kind":"hold","target":"hdr-legal-position","seconds":6,"title":"Establish the help position early and hold it","cue":"Get to the spot before the driver does, feet set, arms up — and hold.","why":"A helper who arrives early, feet set and arms vertical, has a legal guarding position under NFHS rules and gives the driver something to see and stop for. One who arrives late, moving sideways into a player already in the air, creates the collision the drill is meant to teach players to avoid — early is safe, late is dangerous.","holdBreakNote":"You left the spot before the hold was up. A helper who drifts into the driver is late help — set the feet and stay."},{"id":"turn-the-rotation-dial","kind":"turn","target":"hdr-rotation-dial","turn":{"turns":0.5,"axis":"y","label":"ROTATE"},"title":"Turn the dial to send the rotation","cue":"Turn the rotation dial so the next defender slides to the helper's man.","why":"The rotation is a promise the next defender makes to the helper: I have your man. Turning the dial shows that promise to the whole team — the back line moves as one piece, and the helper can commit to stopping the drive without looking over a shoulder to check whether anybody has their back."},{"id":"time-the-help-step","kind":"gauge","target":"hdr-help-timing","gauge":{"label":"HELP","speed":0.6,"green":[0.38,0.56],"missNote":"Outside the band. Too early leaves the corner open before the driver commits; too late meets a player in the air. Help as the driver turns the corner."},"title":"Time the help step as the driver turns the corner","cue":"Commit when the help arrives in the window — after the driver commits, before they leave the floor.","why":"Help has a window. Too early and the driver simply passes to the player the helper left; too late and the helper meets an airborne body, which is how young players get hurt under the basket. The right moment is when the driver has committed to the lane but is still on the floor — early enough to be legal, late enough to be honest."},{"id":"recover-to-the-open-player","kind":"drag","target":"hdr-recovery-token","drag":{"to":"hdr-open-player-spot","radius":0.45,"missNote":"Not there yet. The beaten defender goes all the way to the open player — stopping halfway leaves the shooter free and the rotation broken."},"title":"Recover to the open player, not the ball","cue":"Drag the beaten defender's token away from the ball and to the player the rotation left open.","why":"Getting beaten is not the mistake; chasing the ball afterwards is. The beaten defender who trusts the rotation goes to whoever is now unguarded, which is the only way the team ends the possession with every player covered. Recovering to the open man is also how a player makes up for the first step without anybody having to tell them to."},{"id":"call-from-the-weak-side","kind":"select","target":"hdr-weak-side-card","title":"Call the help from the weak side","cue":"Say it as you step in: \"I'm help\" — and the teammate behind answers \"I've got back.\"","why":"The weak-side defender sees the whole floor and is usually the helper. Saying \"I'm help\" as they step in, and hearing \"I've got back\" from the teammate behind, is the small exchange that turns five separate reactions into one rotation; without it, the defender who is beaten does not know help is coming and fouls trying to recover alone."},{"id":"spot-the-broken-rotations","kind":"find","noHint":true,"targets":["hdr-broken-two-on-one","hdr-broken-empty-rim","hdr-broken-late-closeout"],"itemNames":{"hdr-broken-two-on-one":"two defenders on the same player","hdr-broken-empty-rim":"nobody left protecting the rim","hdr-broken-late-closeout":"a closeout arriving flat-out and out of control"},"itemNotes":{"hdr-broken-two-on-one":"Two defenders on one player means somebody rotated to a man already covered. Somebody else is open.","hdr-broken-empty-rim":"An empty rim means the rotation went outward and nobody stayed home. The last defender stays inside.","hdr-broken-late-closeout":"A flat-out closeout runs into the shooter's landing space. Chop the feet and arrive under control."},"decoyNotes":{"hdr-good-stunt":"A defender faking at the driver and getting back is a good stunt, not a broken rotation."},"title":"Find where the rotation broke","cue":"Watch the rep and mark each place the rotation came apart.","why":"Rotations break in a few repeatable ways: two defenders on one player, an empty rim, a closeout arriving flat-out into a shooter's landing space. Seeing which one happened, rather than just that the shot went in, tells the team which word was missing and which player needs the rep again."},{"id":"hold-the-team-shape","kind":"track","target":"hdr-shape-meter","seconds":8,"track":{"start":0.3,"green":[0.4,0.62],"rise":0.46,"fall":0.38,"drift":0.15,"label":"SHAPE"},"title":"Hold the team's shape through a live possession","cue":"Keep the shape in band as the ball moves — not collapsed into the lane, not stretched out to the corners.","why":"A defence that collapses into the lane on every drive gives up open shots, and one stretched out to the corners gives up the rim. Holding the shape through a live possession — each player a step off their man toward the ball, the back line talking — is the balance that lets the rotation happen without anybody sprinting into anybody.","holdBreakNote":"The shape left the band — collapsed in or stretched out. Reset to a step off your man and talk."},{"id":"film-the-possession","kind":"select","target":"hdr-film-board","doneLine":"Every rotation called and run","title":"Watch the possession for the rotation, not the shot","cue":"Open the clip: was the help called, the rotation answered, the recovery run to the open player?","why":"The shot at the end of a possession is the least useful thing on film for a defence. Watching the rotation — who called help, who answered, who recovered where — shows the team the chain of trust behind a stop, and gives credit to the defender whose rotation nobody in the stands noticed."},{"id":"log-the-drill","kind":"select","target":"hdr-practice-log","doneLine":"Drill, falls and checks recorded","title":"Log the drill and any fall under the basket","cue":"Record what was practised, any fall or contact at the rim, and what the trainer checked.","why":"A fall under the basket is recorded even when the player gets straight back up, because a head knock can show itself later and the next session's coach needs to know who was checked. The log also records what the rotation looked like, so tomorrow starts from the broken link rather than from zero."},{"id":"crew-check-in","kind":"select","target":"hdr-crew-checkin","doneLine":"Everybody good to carry on","title":"Check in with the coach and the back line","cue":"At the bench: what worked, where the trust broke, and is everybody good?","why":"The players who rotated behind each other know whether they trusted the help or hesitated. A short check-in — did you hear the call, did you believe it, are you alright after that fall — keeps the back line willing to help next time, which is the only thing help defence runs on."}],

  interrupts: [{"id":"the-skip-pass-flies","kind":"Skip pass","after":"helper-holds-position","delay":3,"seconds":12,"target":"hdr-skip-call","alert":"The driver throws a skip pass over the top to the far corner while the helper is still set in the lane.","cue":"Call \"skip\" from the back line so the nearest defender closes out — the helper keeps the lane.","why":"A skip pass moves the ball faster than any defender runs, and the only thing faster than the ball is a voice. The helper keeps the lane because the driver is still there; the back line calls the skip so the nearest defender starts the closeout before the catch.","missNote":"Nobody called the skip, the nearest defender closed out late and flat-out, and ran through the shooter's landing space.","wrongNote":"That does not warn anybody about the skip pass. Call it from the back line."},{"id":"a-player-falls-under-the-rim","kind":"Player down","after":"hold-the-team-shape","delay":3,"seconds":12,"target":"hdr-stop-play-call","alert":"A helper and a driver collide under the basket and the helper falls backwards, head striking the floor.","cue":"Call the stop, wave the athletic trainer in and keep everyone back.","why":"A head striking the floor stops the drill at once. The stop, the trainer and a cleared space are what CDC Heads Up asks of every adult at a youth practice: a possible head injury is removed from play and assessed, never shrugged off because the player says they are fine.","missNote":"Play carried on around the fallen helper for several seconds and a teammate had to hurdle them before the coach blew the whistle.","wrongNote":"That does not stop play. Call the stop and wave the trainer in."}],

  build(root) {
    const hits = {};
    const g = group(root);
    const ACC = HDR_ACCENT;
    const CSS = HDR_CSS;
    stationPad(g, 2.7, ACC);

    const stand = (x, z, ry = 0, h = 1.0) => {
      const s = group(g, x, 0, z, ry);
      cyl(s, 0.17, 0.19, 0.03, 0, 0.015, 0, 0x2b2f35, { rough: 0.6, metal: 0.3, seg: 14 });
      cyl(s, 0.024, 0.024, h, 0, h / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 10 });
      return s;
    };
    const bead = (x, y, z, id, label, o = {}) => {
      const m = group(g, x, 0, z);
      cyl(m, 0.012, 0.012, y - 0.05, 0, (y - 0.05) / 2, 0, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const b = ball(m, o.r ?? 0.035, 0, y, 0, o.color ?? ACC, { emissive: o.color ?? ACC, ei: 1.4, rough: 0.4, seg: 12 });
      holoTag(m, label, 0, y + 0.13, 0, { css: o.css ?? CSS, w: o.w ?? 0.46 });
      reg(hits, b, id);
      return m;
    };
    const card = (x, y, z, id, label, face, o = {}) => {
      const c = group(g, x, 0, z, o.ry ?? 0);
      cyl(c, 0.014, 0.014, y - 0.1, 0, (y - 0.1) / 2, -0.02, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 6 });
      const plate = decal(c, o.cw ?? 0.4, o.ch ?? 0.22, 0, y, 0,
        signFace(face, { bg: o.bg ?? "#1c1a24", accent: o.accent ?? CSS, scale: 0.36 }), { px: 192, glow: true, ei: 0.8, transparent: true });
      holoTag(c, label, 0, y + 0.18, 0.002, { css: o.css ?? CSS, w: o.w ?? 0.5 });
      reg(hits, plate, id);
      return plate;
    };
    const hazardCard = (x, y, z, id, label, face, ry = 0) =>
      card(x, y, z, id, label, face, { ry, bg: "#2a1416", accent: "#f0645b", css: "#f0645b", w: 0.52 });
    const text = (cx, w, h, title, rows, accent = CSS) => {
      cx.fillStyle = "rgba(20,18,26,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = accent; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#fff4e2"; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.fillText(title, w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      rows.forEach((r, i) => cx.fillText(r, w / 2, h * (0.42 + i * 0.14)));
    };
    const board = (x, z, ry, id, label) => {
      const b = group(g, x, 1.55, z, ry);
      box(b, 0.64, 0.4, 0.02, 0, 0, -0.012, ACC, { rough: 0.5, emissive: ACC, ei: 0.25 });
      cyl(b, 0.02, 0.02, 1.35, 0, -0.85, -0.03, 0x3a3f46, { rough: 0.5, metal: 0.5, seg: 8 });
      b.userData.face = decal(b, 0.6, 0.36, 0, 0, 0, (cx, w, h) => text(cx, w, h, label.toUpperCase(), ["Open"]), { px: 384, glow: true, ei: 0.9 });
      reg(hits, b.userData.face, id);
      return b;
    };
    const meter = (x, z, ry, id, label) => {
      const s = stand(x, z, ry);
      const m = instrument(s, 0, 1.02, 0, { idle: "READY", color: ACC, w: 0.2, d: 0.26 });
      holoTag(s, label, 0, 1.24, 0, { css: CSS, w: 0.46 });
      reg(hits, m, id);
      return m;
    };
    const dial = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.9);
      const d = cyl(s, 0.09, 0.09, 0.06, 0, 0.95, 0, 0xd8a54a, { rough: 0.5, metal: 0.3, seg: 18 });
      box(s, 0.02, 0.02, 0.1, 0, 0.99, 0.05, 0x1a1a1a, { rough: 0.6 });
      holoTag(s, label, 0, 1.15, 0, { css: CSS, w: 0.42 });
      reg(hits, d, id);
      return d;
    };
    const token = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const t = cyl(s, 0.06, 0.06, 0.025, 0, 0.98, 0, 0xd8a54a, { rough: 0.5, seg: 16 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.4 });
      reg(hits, t, id);
      return t;
    };
    const spot = (x, z, ry, id, label) => {
      const s = stand(x, z, ry, 0.95);
      const p = box(s, 0.2, 0.012, 0.2, 0, 0.965, 0, ACC, { emissive: ACC, ei: 0.5, rough: 0.6 });
      holoTag(s, label, 0, 1.16, 0, { css: CSS, w: 0.42 });
      reg(hits, p, id);
      return s;
    };

    // ------------------------------------------------------------ the place
    const floorTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 8, base: "#b9844f", base2: "#a8743f", seam: "rgba(60,36,14,0.35)" }), { repeat: 3, px: 384 });
    const floor = box(g, 7.4, 0.02, 7.4, 0, 0.004, -0.6, 0x9a7a52, { rough: 0.85, cast: false });
    floor.material = texturedMat(floorTex, { rough: 0.8, metal: 0.02, color: 0xf0e4d0 });
    // painted lines, the key and the hoop
    for (const [w, d, x, z] of [[7.2, 0.05, 0, -4.2], [0.05, 7.2, -3.6, -0.6], [0.05, 7.2, 3.6, -0.6], [7.2, 0.05, 0, 1.2]]) box(g, w, 0.006, d, x, 0.016, z, 0xf4f1ea, { rough: 0.7, cast: false });
    const key = box(g, 1.6, 0.006, 1.9, 0, 0.015, -3.2, ACC, { rough: 0.8, opacity: 0.55, cast: false });
    void key;
    torus(g, 0.9, 0.025, 0, 0.018, 1.2, 0xf4f1ea, { rough: 0.7, seg: 6, seg2: 32 }).rotation.x = Math.PI / 2;
    const hoop = group(g, 0, 0, -4.1);
    box(hoop, 1.0, 0.3, 0.6, 0, 0.15, -0.2, 0x2b3138, { rough: 0.6, metal: 0.4 });
    cyl(hoop, 0.06, 0.07, 2.6, 0, 1.45, -0.2, 0x3a3f46, { rough: 0.5, metal: 0.6, seg: 12 });
    box(hoop, 1.2, 0.72, 0.04, 0, 2.6, 0.3, 0xdfe8ee, { rough: 0.1, metal: 0.1, opacity: 0.6, cast: false });
    torus(hoop, 0.2, 0.012, 0, 2.33, 0.55, 0xff6a1a, { rough: 0.4, metal: 0.5, seg: 8, seg2: 24 }).rotation.x = Math.PI / 2;
    cyl(hoop, 0.2, 0.13, 0.3, 0, 2.16, 0.55, 0xf2f2f2, { rough: 0.9, open: true, opacity: 0.6, seg: 14, cast: false });
    // bleachers along the far side, a ball rack and the scorer's table
    const woodTex = surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a6a4a", base2: "#7a5a3a", seam: "rgba(30,20,10,0.5)" }), { repeat: 2, px: 256 });
    const woodMat = texturedMat(woodTex, { rough: 0.75, metal: 0.02, color: 0xe8d8c0 });
    for (let tier = 0; tier < 4; tier++) for (let seg = 0; seg < 4; seg++) {
      const plank = box(g, 1.5, 0.06, 0.4, -2.4 + seg * 1.6, 0.3 + tier * 0.34, -5.0 - tier * 0.4, 0x8a6a4a, { rough: 0.7 });
      plank.material = woodMat;
      box(g, 0.05, 0.3 + tier * 0.34, 0.05, -3.1 + seg * 1.6, (0.3 + tier * 0.34) / 2, -5.0 - tier * 0.4, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    }
    const rack = group(g, 3.3, 0, -3.3, -0.6);
    box(rack, 0.9, 0.04, 0.35, 0, 0.5, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (const sx of [-0.4, 0.4]) box(rack, 0.04, 0.5, 0.35, sx, 0.25, 0, 0x3a3f46, { rough: 0.5, metal: 0.6 });
    for (let i = 0; i < 4; i++) ball(rack, 0.11, -0.3 + i * 0.2, 0.63, 0, 0xd8641e, { rough: 0.75, seg: 16 });
    const table = group(g, -3.3, 0, -3.0, 0.6);
    box(table, 1.4, 0.05, 0.5, 0, 0.74, 0, 0x2b3138, { rough: 0.6 });
    box(table, 1.4, 0.7, 0.03, 0, 0.37, 0.24, ACC, { rough: 0.6, emissive: ACC, ei: 0.15 });
    const clock = decal(table, 0.5, 0.2, 0, 1.0, 0, (cx, w, h) => text(cx, w, h, "HOME 00 · AWAY 00", ["Q2 · 04:12"]), { px: 256, glow: true, ei: 0.9 });
    void clock;
    const benchL = group(g, -1.8, 0, 3.4);
    box(benchL, 2.2, 0.06, 0.36, 0, 0.44, 0, 0x8a6a4a, { rough: 0.7 }).material = woodMat;
    for (const sx of [-1.0, 1.0]) box(benchL, 0.05, 0.42, 0.3, sx, 0.21, 0, 0x3a3f46, { rough: 0.5, metal: 0.5 });
    for (let i = 0; i < 6; i++) cyl(g, 0.035, 0.035, 0.2, -2.6 + i * 0.3, 0.1, 3.75, i % 2 ? 0x2a7ab8 : 0xe8e8e8, { rough: 0.4, seg: 10 });

    // ------------------------------------------------------------ controls
    const meters = {}, dials = {}, tokens = {}, spots = {}, boards = {};
    bead(-1.22, 0.90, -0.27, "hdr-driver-beating", "the driver getting past their defender", {});
    bead(-1.42, 1.18, -0.62, "hdr-helper-position", "the helper standing in the lane", {});
    bead(-1.03, 1.46, -0.71, "hdr-open-corner", "the corner the helper will leave open", {});
    bead(-1.08, 0.90, -1.11, "hdr-ball-in-the-air", "Skip pass idea", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(-0.68, 1.18, -1.05, "hdr-order-help", "1 · helper steps in and calls it", {});
    bead(-0.58, 1.46, -1.44, "hdr-order-rotate", "2 · next defender rotates to the helper's man", {});
    bead(-0.24, 0.90, -1.23, "hdr-order-recover", "3 · beaten defender recovers to the open player", {});
    bead(0, 1.18, -1.55, "hdr-order-close", "4 · close out under control", {});
    bead(0.24, 1.46, -1.23, "hdr-legal-position", "Helper, feet set early", {});
    bead(0.58, 0.90, -1.44, "hdr-broken-two-on-one", "two defenders on the same player", {});
    bead(0.68, 1.18, -1.05, "hdr-broken-empty-rim", "nobody left protecting the rim", {});
    bead(1.08, 1.46, -1.11, "hdr-broken-late-closeout", "a closeout arriving flat-out and out of control", {});
    bead(1.03, 0.90, -0.71, "hdr-good-stunt", "Helper stunts and gets back", { color: 0x7fc4d8, css: "#7fc4d8", r: 0.03 });
    bead(1.42, 1.18, -0.62, "hdr-skip-call", "Call the skip pass", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    bead(1.22, 1.46, -0.27, "hdr-stop-play-call", "Stop play, wave the trainer", { color: 0x59c97b, css: "#59c97b", r: 0.03 });
    card(-2.19, 1.35, -0.85, "hdr-shell-card", "Shell drill words", "BALL · HELP\n· ROTATE · RECOVER", { ry: 1.20 });
    dials["hdr-rotation-dial"] = dial(-1.89, -1.4, 0.93, "hdr-rotation-dial", "Rotate to the helper's man");
    meters["hdr-help-timing"] = meter(-1.45, -1.85, 0.67, "hdr-help-timing", "When the help arrives");
    tokens["hdr-recovery-token"] = token(-0.92, -2.16, 0.40, "hdr-recovery-token", "Beaten defender");
    spots["hdr-open-player-spot"] = spot(-0.31, -2.33, 0.13, "hdr-open-player-spot", "The player left open");
    card(0.31, 1.35, -2.33, "hdr-weak-side-card", "Weak-side call", "I'M HELP.\nI'VE GOT BACK", { ry: -0.13 });
    meters["hdr-shape-meter"] = meter(0.92, -2.16, -0.40, "hdr-shape-meter", "Team shape");
    boards["hdr-film-board"] = board(1.45, -1.85, -0.67, "hdr-film-board", "Clip of the possession");
    boards["hdr-practice-log"] = board(1.89, -1.4, -0.93, "hdr-practice-log", "Practice log");
    boards["hdr-crew-checkin"] = board(2.19, -0.85, -1.20, "hdr-crew-checkin", "Coach and back-line check-in");
    hazardCard(-1.53, 0.72, -1.21, "step-under-an-airborne-shooter", "Slide under the shooter for a charge?", "TAKE THE\nCHARGE LATE", 0.90);
    hazardCard(-0.58, 0.72, -1.86, "chase-the-ball-not-the-rotation", "Chase the ball after getting beaten?", "CHASE\nTHE BALL", 0.30);
    hazardCard(0.58, 0.72, -1.86, "help-without-a-word", "Step over without calling it?", "HELP.\nSAY NOTHING", -0.30);
    hazardCard(1.53, 0.72, -1.21, "blame-the-beaten-defender", "Tell them it was their fault?", "YOU GOT\nBEAT. AGAIN", -0.90);

    // ------------------------------------------------------------ the guide
    const guide = group(g, 0, 2.15, -3.2);
    box(guide, 0.94, 0.44, 0.02, 0, 0, -0.012, 0x7fc4d8, { rough: 0.5, emissive: 0x7fc4d8, ei: 0.25 });
    const guideFace = decal(guide, 0.9, 0.4, 0, 0, 0, (cx, w, h) => text(cx, w, h, "THE GUIDE", ["Trust the rotation behind you."], "#7fc4d8"), { px: 512, glow: true, ei: 0.9 });
    const paintGuide = (msg) => repaint(guideFace, (cx, w, h) => {
      cx.fillStyle = "rgba(10,20,28,0.94)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#7fc4d8"; cx.fillRect(0, 0, w, 5);
      cx.fillStyle = "#eaf6fb"; cx.font = `${Math.round(h * 0.1)}px Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "top";
      let line = "", yy = h * 0.1; const x0 = w * 0.05, maxW = w * 0.9, lh = h * 0.13;
      for (const word of String(msg).split(" ")) {
        const t = line ? `${line} ${word}` : word;
        if ((cx.measureText?.(t)?.width ?? t.length * lh * 0.45) > maxW && line) { cx.fillText(line, x0, yy); line = word; yy += lh; }
        else line = t;
      }
      if (line) cx.fillText(line, x0, yy);
    });

    // ------------------------------------------------------------ the crew (clear of every control)
    const crew = {};
    crew["coach"] = standingFigure(g, 3, 0.7, { ry: -1.9, cloth: 0x1f2a36, trousers: 0x2b2f35 });
    holoTag(g, "Head coach", 3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["assistant"] = standingFigure(g, -3, 0.7, { ry: 1.9, cloth: 0x2a5a8a, trousers: 0x2b2f35 });
    holoTag(g, "Assistant coach", -3, 2.1, 0.7, { css: "#7fc4d8", w: 0.34 });
    crew["trainer"] = standingFigure(g, -2.9, -2.3, { ry: 0.9, cloth: 0xd8261e, trousers: 0x2b2f35 });
    holoTag(g, "Athletic trainer", -2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    crew["backline"] = standingFigure(g, 2.9, -2.3, { ry: -0.9, cloth: 0xf2f2f2, trousers: 0x2b2f35, atStation: true });
    holoTag(g, "Back-line defender", 2.9, 2.1, -2.3, { css: "#7fc4d8", w: 0.34 });
    // the two people each interruption brings into the scene, hidden until it fires
    const arrivals = {};
    arrivals["the-skip-pass-flies"] = standingFigure(g, 1.6, -3, { ry: 3, cloth: 0x7a3a1a, atStation: true });
    arrivals["the-skip-pass-flies"].visible = false;
    arrivals["a-player-falls-under-the-rim"] = standingFigure(g, -1.4, -3, { ry: 0.3, cloth: 0xf2f2f2, atStation: true });
    arrivals["a-player-falls-under-the-rim"].visible = false;
    const alarmLamp = ball(g, 0.08, 0, 2.55, -3.2, 0x3a3f46, { rough: 0.4, seg: 12 });
    const lampOn = alarmLamp.material, lampLit = alarmLamp.material.clone();
    lampLit.color = new THREE.Color(0xf0645b); lampLit.emissive = new THREE.Color(0xf0645b); lampLit.emissiveIntensity = 1.6;

    return {
      hits,
      footprint: 2.6,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),

      onStepComplete(step) {
        if (step.id === "recover-to-the-open-player") { const s = spots["hdr-open-player-spot"]; tokens["hdr-recovery-token"].parent.position.set(s.position.x, 0, s.position.z); }
        if (step.id === "film-the-possession") repaint(boards["hdr-film-board"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Every rotation called and run"], "#59c97b"));
        if (step.id === "log-the-drill") repaint(boards["hdr-practice-log"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Drill, falls and checks recorded"], "#59c97b"));
        if (step.id === "crew-check-in") repaint(boards["hdr-crew-checkin"].userData.face, (cx, w, h) => text(cx, w, h, "DONE", ["Everybody good to carry on"], "#59c97b"));
        if (step.id === "recover-to-the-open-player") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("teammate-mistake", { seed: 1 }) : "Say the next job, not the last mistake.");
        if (step.id === "film-the-possession") paintGuide(typeof eiTeamLine === "function" ? eiTeamLine("win-shared", { seed: 0 }) : "Say the next job, not the last mistake.");
        if (step.id === "crew-check-in") paintGuide(typeof reflectionPrompt === "function" ? reflectionPrompt({ team: true }) : "What did you say out loud that helped?");
      },

      onHazard(id, s) {
        paintGuide(typeof eiLine === "function" ? eiLine("hazard", { count: s?.hazardHits ?? 1, seed: s?.errors ?? 0 }) : "Stop there. Take a breath and go again.");
      },

      onInterrupt(it) {
        const who = arrivals[it.id];
        if (who) { who.visible = true; who.position.z += 0.4; }
        alarmLamp.material = lampLit;
      },
      onInterruptEnd(it) {
        alarmLamp.material = lampOn;
        const who = arrivals[it.id];
        if (it.resolved !== "answered") { if (who) who.rotation.y += 0.6; paintGuide(typeof eiLine === "function" ? eiLine("missed", { kind: it.kind, seed: 0 }) : "That one went unanswered. Next time it wins."); return; }
        if (it.id === "the-skip-pass-flies") { crew["backline"].position.set(2.2, 0, -2.7); if (who) who.position.set(2, 0, -3.4); paintGuide("Called early — the closeout started before the catch and arrived under control."); }
        if (it.id === "a-player-falls-under-the-rim") { crew["trainer"].position.set(-1.9, 0, -2.7); if (who) who.position.set(-1.4, 0, -3.3); paintGuide("Stopped, trainer in, room cleared — the helper is assessed before anything else."); }
      },

      animate(t, dt, session) {
        void t; void dt;
        const gg = session?.gauge;
        if (gg && !gg.committed && meters[session.step?.target]) {
          const [lo, hi] = session.step.gauge.green;
          const ok = gg.t >= lo && gg.t <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "IN BAND" : gg.t < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
        const tr = session?.track;
        if (tr && meters[session.step?.target]) {
          const [lo, hi] = session.step.track.green;
          const ok = tr.v >= lo && tr.v <= hi;
          repaint(meters[session.step.target].userData.screen, signFace(ok ? "STEADY" : tr.v < lo ? "LOW" : "HIGH", { bg: "#1c1a24", accent: ok ? "#59c97b" : "#f0645b", fg: "#fff4e2", scale: 0.46 }));
        }
      },
    };
  },
};
