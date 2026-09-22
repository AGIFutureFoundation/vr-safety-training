import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, group, decal, repaint, signFace, particles,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel,
  standingFigure, surfaceTexture, pavingFace, texturedMat, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Haul Route Observation VR — Community Environmental Justice,
// station one hundred fifty-six, the second of four Hunters Point Edition
// stations trained entirely from the public side of a fenced cleanup
// parcel. A generic parcel and a generic residential route beside it — no
// real site, no real school, no clause number nobody here can source.
//
// The job: stand on the public sidewalk across from a parcel's gate and
// watch what leaves it. A tarp is either cinched at every corner or it
// isn't; a truck either ran the wheel wash or its tires are still carrying
// the cell out onto a public street; the hazardous-waste manifest placard
// either matches what's supposed to be on that truck or it doesn't; and a
// truck doing more than the posted limit down a residential street is doing
// it past houses and a school crossing, not past an empty lot. None of that
// gets fixed from the sidewalk — it gets logged, with a plate, a time and a
// photo, and filed with the Air District and the site's own complaint line.

const HRO_ACCENT = 0x5ec2d6;

/** The residential street this route runs down: asphalt with a worn
 *  centre line and a school-zone stencil, not a flat grey rectangle. */
function hroStreetFace(g, w, h) {
  g.fillStyle = "#3a3d40"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(0,0,0,0.12)";
  for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 5, 2);
  g.fillStyle = "rgba(255,210,60,0.55)";
  for (let y = h * 0.06; y < h * 0.94; y += h * 0.09) g.fillRect(w * 0.49, y, w * 0.02, h * 0.045);
  g.fillStyle = "rgba(255,255,255,0.85)";
  g.fillRect(w * 0.02, h * 0.86, w * 0.2, h * 0.05);
  g.fillStyle = "#1f2224";
  g.font = `700 ${Math.round(h * 0.05)}px Arial, sans-serif`;
  g.fillText("SCHOOL", w * 0.03, h * 0.79);
}

export const SIM_HAUL_ROUTE_OBSERVATION = {
  id: "haul-route-observation",
  index: "156",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  district: "Environmental Monitoring",
  weather: "overcast",
  certification: "BAAQMD complaint line and Regulation 6 track-out and dust rules; EPA RCRA hazardous-waste manifest placarding (40 CFR 262); the site's own Dust Control Plan requiring a tarped, washed load at every gate; the California Vehicle Code's posted residential speed limit; CARB's 13 CCR 2485 five-minute diesel idling limit; OSHA 29 CFR 1910.120 HAZWOPER for anyone who crosses the gate — not required here, because this patrol never does",
  name: "Haul Route Observation",
  title: simTitle("Haul Route Observation"),
  tagline: "Watching a cleanup parcel's gate from the public sidewalk: the tarp, the wheel wash, track-out onto the street, the manifest placard and the residential speed limit, each observation logged with a plate, a time and a photo for the Air District and the site's own complaint line",
  accent: HRO_ACCENT,
  accentCss: "#5ec2d6",
  parSeconds: 300,
  footprint: 2.4,
  badge: { id: "gate-watched", name: "Gate Watched", note: "Every check made from the sidewalk, every observation logged with a plate, a time and a photo, and never once through the gate" },

  game: system({
    name: "Route Watch",
    currency: "PLATE",
    ranks: ["Sidewalk Observer", "Log Keeper", "Route Lead", "Complaint Authority", "Route Watch Certified"],
    badges: [
      { id: "full-check", name: "Full Check", note: "Tarp, wash and placard all checked before the truck cleared the gate", test: AWARD.stepClean("check-placard") },
      { id: "never-past-curb", name: "Never Past The Curb", note: "Never entered the gate, the lane or the street, and never posted a plate publicly", test: AWARD.safe },
      { id: "framed-true", name: "Framed True", note: "Held the radar and the viewfinder near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-watch", name: "Clean Watch", note: "No corrections anywhere in the observation", test: AWARD.clean },
      { id: "unbroken-frame", name: "Unbroken Frame", note: "Never broke the viewfinder tracking", test: AWARD.unbroken },
      { id: "logged-fast", name: "Logged Fast", note: "Filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "enter-gate": "You walked through the open gate to get a closer look at the truck. A patrol's entire standing is that its record comes from the public side of the fence — an unbadged, untrained monitor inside a cleanup parcel's own traffic lane is not a witness any more, it's a hazard the site now has to manage, and every observation this station took beforehand is now attached to someone who crossed the one line the whole programme runs on.",
    "stand-in-lane": "You stood on the truck's own turning apron instead of behind the marked line on the sidewalk. A loaded haul truck swinging wide out of a gate has blind corners a driver twelve feet up cannot see into, and a better camera angle from inside that swing radius is not worth the truck not knowing you're there until it's already turning.",
    "chase-truck": "You ran into the street after the departing truck to catch its plate before it turned the corner. The whole reason this patrol works from a fixed post is that a moving truck on a public street is a moving hazard, and a patrol member in the roadway trying to keep pace with it is one stumble away from being under it — no single plate is worth that trade.",
    "post-publicly": "You posted the truck's plate and the driver's photo to the neighbourhood social media page instead of filing them with the Air District and the site's own hotline. The record this patrol keeps exists to get an exceedance in front of a regulator who can act on it, not to identify a driver to the public — the same programme that trains consent before a biomonitoring sample is taken does not skip it here just because the sample this time is a photograph.",
  },

  lateNotes: {
    "camera-zoom-dial": "Nothing to focus on yet — get the camera up and the truck framed first, or you're zooming in on an empty gate.",
    "shutter-button": "Nothing to hold steady for yet — the shot has to actually be zoomed and framed on the plate before a held shutter proves anything.",
    "observation-log": "Nothing worth writing down yet — the tarp, the wash, the placard and the speed all have to actually be checked first, or the entry is a guess dressed up as a record.",
    "radar-gun": "Aim it at the truck on the route before you read it — a radar reading with no truck in its beam is a reading of nothing.",
  },

  // Both interruptions are armed on a track or a hold step, per the shared
  // interrupt layer — a select, sequence, gauge, turn, drag or find step
  // resolves in one action, too fast for the fuse to ever catch the learner
  // mid-task.
  interrupts: [
    {
      id: "half-open-tarp",
      kind: "Untarped departure",
      after: "frame-hold", delay: 4, seconds: 14,
      alert: "A second truck is already rolling out of the gate with its tarp cinched at only two corners — the other half of the bed is open to the wind.",
      cue: "You can't stop that truck from the sidewalk — get on the radio to the site's hotline with the plate and direction before it's out of sight.",
      target: "urgent-radio",
      why: "A half-tarped load moving at road speed is shedding whatever the tarp was supposed to contain over every block between here and wherever it's headed, and a patrol member on the public sidewalk has no authority to flag it down or block the gate — the only lever this post has is a report made while the truck is still in sight, with a plate and a direction of travel, not a report made from memory after it's three turns gone.",
      missNote: "The truck cleared the corner and was gone before the radio call went out — the site's hotline got a report of a half-tarped load with no plate and no direction, which is a complaint nobody can act on by the time it lands.",
      wrongNote: "Not that — get on the radio. Nothing else at this post reaches a truck that's already rolling and that this patrol has no authority to stop.",
    },
    {
      id: "idle-at-crossing",
      kind: "Idling at the crossing",
      after: "steady-shot", delay: 4, seconds: 14,
      alert: "The bell just rang and a haul truck is sitting with its engine running at the school crossing while children cross in front of it.",
      cue: "Start the idle clock now — a truck idling past five minutes at a school crossing is its own violation, on top of everything else this route already answers for.",
      target: "idle-log",
      why: "California's own diesel idling rule gives a truck five minutes before the clock the regulation cares about even starts, and a truck sitting at a crossing full of children at bell time is exactly the case the rule exists for — a patrol that only logs the tarp and the placard and lets an idling engine at a school crossing pass unremarked is missing the one observation on this route with a child standing closest to the tailpipe.",
      missNote: "The truck sat idling through the whole crossing with nobody timing it, and by the time anyone thought to note it the children had already crossed and gone inside — the exposure happened whether or not the clock was running, but only a timed log turns it into something the regulator can act on.",
      wrongNote: "Not that — start the idle clock. Nothing else at this post proves how long that engine actually ran before the crossing guard waved the last child through.",
    },
  ],

  steps: [
    {
      id: "read-protocol", kind: "select", target: "patrol-board",
      title: "Read the patrol's observation protocol",
      cue: "Check what this route requires on every truck — tarp, wash, placard, speed — and where each observation gets filed.",
      why: "The protocol is what turns a truck driving past into evidence instead of an impression — it names the four things every truck gets checked against and the two places every finding gets filed, and a patrol that skips reading it is deciding from memory what counts, which is exactly the kind of inconsistency a site can point to when it wants a complaint dismissed.",
    },
    {
      id: "position-post", kind: "select", target: "sidewalk-mark",
      title: "Take the observation post",
      cue: "Stand on the marked sidewalk spot with a clear sightline to the gate, clear of the truck's turning lane.",
      why: "Where a patrol stands decides two things at once: whether the sightline actually catches the tarp and the placard as the truck clears the gate, and whether the patrol member is standing somewhere a swinging truck can actually see them. The marked spot is the one place on this sidewalk that answers both.",
    },
    {
      id: "check-tarp", kind: "sequence", anyOrder: true,
      targets: ["tarp-fl", "tarp-fr", "tarp-rear"],
      itemNames: { "tarp-fl": "front-left corner", "tarp-fr": "front-right corner", "tarp-rear": "rear corner" },
      title: "Check every tarp corner before the truck clears the gate",
      cue: "Look at all three visible corners of the load — a tarp cinched at two corners and loose at the third is still an open load.",
      why: "A dust source under a tarp is only contained where the tarp is actually cinched down, and one corner working loose on the drive out is exactly what road speed and a turn are going to find first — checking all three corners visible from the sidewalk, not just the one facing the gate, is what catches a load that looks tarped from the wrong angle.",
    },
    {
      id: "check-wash", kind: "select", target: "wheel-wash-pad",
      title: "Confirm the truck ran the wheel wash",
      cue: "Look for the wet, clean tread the wash leaves — dry, caked tires mean the truck skipped it.",
      why: "The wheel wash exists to stop the cell's own soil from leaving on the truck's tires, and it is the one part of the plan a patrol on the sidewalk can actually confirm at a glance — dry, dirt-caked tires rolling through the gate is the wash having failed or been skipped, and either way it is tracked soil about to be laid down on the public street this patrol is standing on.",
    },
    {
      id: "trackout-walk", kind: "find", noHint: true,
      targets: ["trackout-patch"],
      itemNames: { "trackout-patch": "tracked soil on the public street" },
      itemNotes: { "trackout-patch": "That patch of the street just past the gate still shows a truck's tire prints in soil — exactly the track-out the wheel wash was supposed to stop, sitting on a public street rather than the parcel." },
      title: "Walk the frontage and check for track-out",
      cue: "Walk the stretch of street just past the gate and click the one patch that shows tracked soil.",
      why: "Confirming the wash ran and confirming nothing got tracked onto the street anyway are two different checks — a truck can run the wash and still shed a little soil off a wheel well the wash never reached, and this is the only way a patrol on foot actually finds that rather than assuming a wash that ran means a street that's clean.",
    },
    {
      id: "check-placard", kind: "select", target: "manifest-placard",
      title: "Check the manifest placard",
      cue: "Confirm the truck is carrying the hazardous-waste placard the manifest requires before it reaches the residential route.",
      why: "Under RCRA, a truck hauling manifested waste has to carry the placard that identifies what it's hauling for exactly the reason a patrol checks it — so that a truck involved in anything on a public road, from a fender-bender to a spill, is identifiable to first responders as carrying more than dirt, without anyone having to open the manifest itself to find out.",
    },
    {
      id: "radar-speed", kind: "gauge", target: "radar-gun",
      title: "Clock the truck's speed off the gate",
      cue: "Aim the radar at the truck as it turns onto the route and commit the reading inside the posted limit.",
      why: "The posted limit on this stretch is not a suggestion a driver can round up from — it is the number that decides how much stopping distance a driver has if a child steps off a curb, and a radar reading is the only thing this patrol has that turns 'that truck looked fast' into a number a regulator or the site itself can be shown.",
      gauge: {
        label: "SPEED", speed: 0.65, green: [0.2, 0.42],
        readout: (t) => `${Math.round(15 + t * 35)} mph`,
        missNote: "That reading is over the posted limit for this stretch — re-aim the radar and read it again before you log a number you can't defend.",
      },
    },
    {
      id: "camera-ready", kind: "drag", target: "camera",
      title: "Get the camera up",
      cue: "Carry the camera from the bag to the shooting position before the truck is out of frame.",
      why: "A photo taken one-handed while still digging the camera out of the bag is a photo of whatever happened to be in frame, not the plate — getting the camera into position before the truck reaches the shot is what makes the rest of this observation a photo the Air District can actually use rather than a blur logged as evidence.",
      drag: { to: "shot-frame", radius: 0.4, missNote: "Not braced in the shooting position — a camera held off to the side of the frame is aimed at the gate's edge, not the plate coming through it." },
    },
    {
      id: "camera-zoom", kind: "turn", target: "camera-zoom-dial",
      title: "Zoom in on the plate",
      cue: "Turn the zoom ring until the plate fills the frame and its characters are actually readable.",
      why: "A wide shot that shows the whole truck proves a truck left the gate; it does not prove which one, and 'which one' is the entire point of logging a plate. The zoom ring is what turns a photo of a truck into a photo of a specific, identifiable truck a complaint can actually be traced to.",
      turn: { turns: 0.6, axis: "y", label: "ZOOM" },
    },
    {
      id: "frame-hold", kind: "track", target: "viewfinder", seconds: 8,
      title: "Track the truck through the turn",
      cue: "Keep the truck framed in the viewfinder as it turns onto the residential route, holding the frame steady.",
      why: "A truck turning off the gate apron onto the route swings across the frame fast, and a viewfinder that drifts off it loses the shot at exactly the moment the plate is squared up to the camera — holding the frame through the turn is what keeps the one clean angle on the plate from being over before the shutter is ever pressed.",
      track: {
        start: 0.5, green: [0.42, 0.6], rise: 0.55, fall: 0.5, drift: 0.14, label: "FRAME",
        readout: (v) => (v < 0.42 ? "drifting off the plate" : v > 0.6 ? "swung past the truck" : "plate framed"),
      },
      holdBreakNote: "The frame drifted off the plate mid-turn — bring the viewfinder back onto the truck before the angle is gone for good.",
    },
    {
      id: "steady-shot", kind: "hold", target: "shutter-button", seconds: 5,
      title: "Hold for a clear shot",
      cue: "Hold the shutter down until the frame reads sharp — a rushed press blurs a plate at this zoom.",
      why: "At full zoom, the smallest shake blurs the one detail this whole photo exists to capture — holding the shutter steady for the full count is what tells the camera to wait out that shake instead of firing on the first unsteady frame and calling the plate close enough.",
      holdBreakNote: "Released early — the shot fired before the frame settled. Hold the shutter until it reads sharp, not until it looks about right.",
    },
    {
      id: "log-observation", kind: "select", target: "observation-log",
      title: "Log the observation",
      cue: "Write up the plate, the time, and the four checks — tarp, wash, placard, speed — while it's still fresh.",
      why: "A photo and a memory of what you saw are not the same as a record somebody else can act on days later — writing the plate, the time and every check into the log while it's still fresh is what turns a patrol shift into evidence instead of an anecdote the next shift has to take on faith.",
    },
    {
      id: "file-report", kind: "sequence",
      targets: ["call-airdistrict", "notify-site-hotline"],
      itemNames: { "call-airdistrict": "file with the Air District", "notify-site-hotline": "notify the site's own hotline" },
      title: "File the observation",
      cue: "File with the Air District first, then notify the site's own hotline.",
      why: "The Air District's line is the record a regulator holds outside the site's own chain, and it goes first for the same reason it does at the fence line — the site's own hotline is the party whose trucks this observation is about, and filing outside first is what keeps the record a community one instead of something the site alone gets to shape before anyone independent hears about it.",
      outOfOrderNote: "The Air District first — the site's own hotline second, or the only account of this observation is the one the site itself controls.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.4, HRO_ACCENT);

    // -------------------------------------------------------------- ground
    const groundMesh = box(g, 6.2, 0.14, 5.6, 0, 0.07, 0, 0xffffff, { rough: 0.95 });
    groundMesh.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#54524b", base2: "#47453e", seam: "rgba(0,0,0,0.4)" }), { repeat: 6, px: 512 }),
      { rough: 0.95, metal: 0.02, color: 0xb7b3a7 },
    );
    // The residential route itself, running the length of the pad.
    const street = box(g, 2.0, 0.02, 5.4, 0.6, 0.151, 0, 0xffffff, { rough: 0.85, metal: 0.03, cast: false });
    street.material = texturedMat(
      surfaceTexture((cx, w, h) => hroStreetFace(cx, w, h), { repeat: 3, px: 512 }),
      { rough: 0.85, metal: 0.03, color: 0x9aa0a3 },
    );
    // The public sidewalk the whole patrol works from.
    const sidewalk = box(g, 1.0, 0.03, 5.4, -1.7, 0.161, 0, 0xffffff, { rough: 0.75, metal: 0.02, cast: false });
    sidewalk.material = texturedMat(
      surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#9a9c9d", base2: "#8a8c8d", seam: "rgba(0,0,0,0.3)" }), { repeat: 3, px: 320 }),
      { rough: 0.75, metal: 0.02, color: 0xa5a7a8 },
    );

    // -------------------------------------------------------------- fence + gate
    for (const z of [-2.1, -0.6]) barrierPanel(g, -0.6, z, { ry: Math.PI / 2, color: 0xe4622a, w: 1.3 });
    for (const z of [0.7, 2.0]) barrierPanel(g, -0.6, z, { ry: Math.PI / 2, color: 0xe4622a, w: 1.3 });
    const gate = group(g, -0.6, 0.14, -0.05, 0);
    for (const sx of [-0.55, 0.55]) cyl(gate, 0.04, 0.04, 1.3, sx, 0.65, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    box(gate, 1.2, 0.04, 0.04, 0, 1.25, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6 });
    holoTag(gate, "site gate", 0, 1.5, 0, { css: "#5ec2d6", w: 0.3 });
    const gateSpot = cyl(gate, 0.5, 0.5, 0.01, 0, 0.005, 0, 0xd2312b, { rough: 0.6, opacity: 0.28, transparent: true, cast: false });
    reg(hits, gateSpot, "enter-gate");
    // The truck's own turning apron, just inside the public line.
    const lane = box(g, 1.4, 0.006, 1.2, 0.05, 0.157, -0.05, 0xd2312b, { rough: 0.6, opacity: 0.14, transparent: true, cast: false });
    holoTag(lane, "truck turning lane", 0, 0.1, 0, { css: "#d2312b", w: 0.4 });
    reg(hits, lane, "stand-in-lane");
    // The roadway itself, past the kerb — the hazard of running out after a
    // departing truck instead of holding the fixed post.
    const roadway = box(g, 1.6, 0.006, 1.0, 0.9, 0.157, -1.0, 0xd2312b, { rough: 0.6, opacity: 0.14, transparent: true, cast: false });
    holoTag(roadway, "chase it into the street?", 0, 0.12, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, roadway, "chase-truck");

    // ---------------------------------------------------------- wheel wash
    const wash = group(g, -0.9, 0.14, -0.05);
    box(wash, 1.0, 0.02, 0.7, 0, 0.011, 0, 0x8a9298, { rough: 0.5, metal: 0.35, cast: false });
    for (const sx of [-0.4, 0.4]) cyl(wash, 0.02, 0.02, 0.7, sx, 0.25, 0, CITY.steel, { rough: 0.4, metal: 0.7, seg: 8 });
    holoTag(wash, "wheel wash", 0, 0.45, 0, { css: "#5ec2d6", w: 0.3 });
    reg(hits, wash, "wheel-wash-pad");
    const washMist = particles(wash, 20, 0x6fb4d8, { size: 0.02, life: 0.4, additive: false, opacity: 0.4 });

    // ------------------------------------------------------------ haul truck
    const truck = group(g, -0.2, 0.14, -0.4, 1.1);
    box(truck, 0.9, 0.7, 0.75, -0.85, 0.5, 0, 0xe8eef2, { rough: 0.5, metal: 0.3 });
    box(truck, 0.55, 0.06, 0.75, -0.85, 0.86, 0, 0x2b2f34, { rough: 0.7 });
    const bed = group(truck, 0.5, 0, 0);
    box(bed, 1.6, 0.5, 1.0, 0, 0.28, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    box(bed, 1.5, 0.02, 0.9, 0, 0.04, 0, 0x2b2f34, { rough: 0.8, cast: false });
    for (const sx of [-1, 1]) cyl(truck, 0.22, 0.22, 0.22, sx * 1.0, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    cyl(truck, 0.22, 0.22, 0.22, -1.55, 0.22, 0.32, 0x1b1e22, { rough: 0.8, seg: 16 }).rotation.x = Math.PI / 2;
    const tarpMesh = box(bed, 1.4, 0.03, 0.85, 0, 0.42, 0, 0x2b3138, { rough: 0.7, cast: false });
    holoTag(truck, "haul truck", -0.85, 1.05, 0, { css: "#5ec2d6", w: 0.3 });
    const plate = decal(truck, 0.24, 0.1, -1.32, 0.4, 0.38, signFace("7CWL219", { bg: "#e8eef2", accent: "#1b1e22", scale: 0.62 }));
    void plate;
    const placardMesh = decal(bed, 0.2, 0.2, 0.82, 0.3, 0, signFace("1993", { bg: "#d2312b", accent: "#ffffff", scale: 0.6 }));
    placardMesh.rotation.y = -Math.PI / 2;
    reg(hits, placardMesh, "manifest-placard");
    // Three registered tarp corners, visible from the sidewalk side.
    const cornerFL = ball(bed, 0.03, -0.68, 0.44, -0.4, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.3, rough: 0.5 });
    const cornerFR = ball(bed, 0.03, 0.68, 0.44, -0.4, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.3, rough: 0.5 });
    const cornerRear = ball(bed, 0.03, 0, 0.44, 0.42, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.3, rough: 0.5 });
    reg(hits, cornerFL, "tarp-fl"); reg(hits, cornerFR, "tarp-fr"); reg(hits, cornerRear, "tarp-rear");

    // Second truck, parked at the gate mouth until the tarp interrupt fires.
    const truck2 = group(g, -0.9, 0.14, -1.5, 1.0);
    box(truck2, 0.85, 0.66, 0.7, -0.8, 0.48, 0, 0xd8dde2, { rough: 0.55, metal: 0.25 });
    box(truck2, 0.5, 0.06, 0.7, -0.8, 0.82, 0, 0x2b2f34, { rough: 0.7 });
    const bed2 = group(truck2, 0.45, 0, 0);
    box(bed2, 1.5, 0.46, 0.94, 0, 0.26, 0, 0x8a939b, { rough: 0.55, metal: 0.35 });
    box(bed2, 1.3, 0.26, 0.76, 0, 0.24, 0, 0x4a3a24, { rough: 0.95 });
    for (const sx of [-1, 1]) cyl(truck2, 0.2, 0.2, 0.2, sx * 0.95, 0.2, 0.3, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const tarp2 = box(bed2, 0.7, 0.03, 0.9, -0.32, 0.4, 0, 0x2b3138, { rough: 0.7, cast: false });
    void tarp2;
    holoTag(truck2, "second truck", -0.8, 0.95, 0, { css: "#5ec2d6", w: 0.36 });

    // -------------------------------------------------------------- patrol post
    const boardPost = group(g, -2.0, 0, -1.9, 0.4);
    holoPanel(boardPost, 0.95, 0.62, 0, 1.3, 0, (ctx, w, h) => {
      ctx.fillStyle = "#062a30"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5ec2d6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#dff6fb"; ctx.fillText("HAUL ROUTE PATROL PROTOCOL", w * 0.05, h * 0.12);
      ctx.font = `${Math.round(h * 0.072)}px Arial, sans-serif`; ctx.fillStyle = "#dff6fb";
      ["Check every truck: tarp, wash, placard, speed", "Posted limit: 25 mph on this route",
       "Log: plate, time, photo", "File: Air District first, then site hotline",
       "Never past the sidewalk line", "Never post a plate publicly"].forEach((line, i) => {
        ctx.fillText(line, w * 0.05, h * (0.26 + i * 0.115));
      });
    }, { accent: HRO_ACCENT });
    reg(hits, boardPost, "patrol-board");

    const postMark = cyl(g, 0.18, 0.18, 0.008, -1.7, 0.163, -0.9, 0x5ec2d6, { rough: 0.6, opacity: 0.4, transparent: true, cast: false, seg: 24 });
    holoTag(postMark, "observation post", 0, 0.35, 0, { css: "#5ec2d6", w: 0.36 });
    reg(hits, postMark, "sidewalk-mark");

    // ------------------------------------------------------------- radar gun
    const radar = group(g, -1.7, 0.14, -0.9, 0.5);
    box(radar, 0.1, 0.16, 0.06, 0, 0.55, 0, 0x2b2f34, { rough: 0.55, metal: 0.3 });
    const radarScreen = decal(radar, 0.08, 0.05, 0, 0.62, 0.031, signFace("-- mph", { bg: "#0d1c24", accent: "#5ec2d6", fg: "#bfeaf7", scale: 0.6 }), { glow: true, ei: 0.7 });
    holoTag(radar, "radar gun", 0, 0.75, 0, { css: "#5ec2d6", w: 0.28 });
    reg(hits, radar, "radar-gun");

    // ------------------------------------------------------------- camera kit
    const chest = toolChest(g, -2.2, 0.4, { ry: -0.4, color: 0x2f6f7a });
    const cameraStart = group(chest, 0, 0.79, 0);
    box(cameraStart, 0.1, 0.07, 0.14, 0, 0, 0, 0x1f2224, { rough: 0.4, metal: 0.3 });
    holoTag(cameraStart, "camera", 0, 0.14, 0, { css: "#5ec2d6", w: 0.24 });
    reg(hits, cameraStart, "camera");

    const shotFrame = group(g, -1.4, 0.14, -1.1, 0.6);
    hits["shot-frame"] = shotFrame;
    const viewfinderRing = cyl(shotFrame, 0.1, 0.1, 0.01, 0, 1.0, 0, 0x5ec2d6, { rough: 0.5, opacity: 0.5, transparent: true, cast: false, seg: 20 });
    holoTag(shotFrame, "shooting position", 0, 1.2, 0, { css: "#5ec2d6", w: 0.4 });
    reg(hits, viewfinderRing, "viewfinder");
    const zoomDial = cyl(shotFrame, 0.045, 0.045, 0.02, 0.1, 1.0, 0, 0xf2ae14, { rough: 0.5, metal: 0.4, seg: 16 });
    reg(hits, zoomDial, "camera-zoom-dial");
    const shutter = box(shotFrame, 0.05, 0.02, 0.05, -0.1, 1.0, 0.02, 0xd2312b, { rough: 0.5 });
    reg(hits, shutter, "shutter-button");

    // ----------------------------------------------------------- urgent radio
    const fieldRadio = group(g, -2.0, 0.14, -1.4, 0.4);
    box(fieldRadio, 0.08, 0.14, 0.04, 0, 0.5, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const radioAnt = cyl(fieldRadio, 0.004, 0.004, 0.12, 0, 0.62, 0, 0x8a939b, { rough: 0.4, metal: 0.7, seg: 6 });
    void radioAnt;
    holoTag(fieldRadio, "field radio", 0, 0.66, 0, { css: "#5ec2d6", w: 0.28 });
    reg(hits, fieldRadio, "urgent-radio");

    // -------------------------------------------------------------- track-out
    const trackout = box(g, 0.36, 0.004, 0.5, 0.4, 0.163, 0.55, 0x453a22, { rough: 0.85, opacity: 0.55, transparent: true, cast: false });
    holoTag(trackout, "tracked soil?", 0, 0.1, 0, { css: "#f0645b", w: 0.34 });
    reg(hits, trackout, "trackout-patch");

    // ------------------------------------------------------------- log + report
    const logBoard = group(g, -2.2, 0.14, -0.4, 0.3);
    box(logBoard, 0.14, 0.005, 0.2, 0, 0.75, 0, 0xf3efe4, { rough: 0.9 });
    decal(logBoard, 0.12, 0.18, 0, 0.753, 0, signFace("OBSERVATION LOG", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.34 })).rotation.x = -Math.PI / 2;
    holoTag(logBoard, "observation log", 0, 0.86, 0, { css: "#5ec2d6", w: 0.4 });
    reg(hits, logBoard, "observation-log");

    const phonePost = group(g, -2.3, 0, 0.3, 0.3);
    const phone = group(phonePost, 0, 0.9, 0);
    box(phone, 0.08, 0.16, 0.03, 0, 0, 0, 0xe8eef2, { rough: 0.5, metal: 0.2 });
    decal(phone, 0.07, 0.05, 0, 0.05, 0.016, signFace("AIR DISTRICT", { bg: "#0d1c24", accent: "#9fd8c0", scale: 0.4 }));
    holoTag(phone, "Air District line", 0, 0.16, 0, { css: "#5ec2d6", w: 0.36 });
    reg(hits, phone, "call-airdistrict");
    const hotlineClip = group(phonePost, 0.25, 0.85, 0, -0.3);
    box(hotlineClip, 0.14, 0.005, 0.2, 0, 0, 0, 0xf3efe4, { rough: 0.9 });
    decal(hotlineClip, 0.12, 0.18, 0, 0.004, 0, signFace("SITE HOTLINE", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.36 })).rotation.x = -Math.PI / 2;
    holoTag(hotlineClip, "site dust hotline", 0, 0.14, 0, { css: "#5ec2d6", w: 0.4 });
    reg(hits, hotlineClip, "notify-site-hotline");

    // A social-media kiosk near the log — the ethics hazard, publicly posting
    // a plate and a driver's face instead of filing it with the two bodies
    // this patrol actually answers to.
    const kiosk = group(g, -2.4, 0, 1.2, 0.4);
    box(kiosk, 0.4, 0.5, 0.05, 0, 0.9, 0, 0x2b2f34, { rough: 0.6, metal: 0.2 });
    decal(kiosk, 0.34, 0.3, 0, 0.9, 0.026, signFace("POST PUBLICLY?", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.4 }));
    holoTag(kiosk, "share to social feed?", 0, 1.2, 0, { css: "#d2312b", w: 0.5 });
    reg(hits, kiosk, "post-publicly");

    // -------------------------------------------------------------- idle log
    const idleClip = group(g, 2.0, 0.14, 1.6, -0.3);
    box(idleClip, 0.1, 0.14, 0.03, 0, 0.6, 0, 0x2b2f34, { rough: 0.6, metal: 0.3 });
    const idleScreen = decal(idleClip, 0.08, 0.06, 0, 0.66, 0.016, signFace("0:00", { bg: "#0d1c24", accent: "#5ec2d6", fg: "#bfeaf7", scale: 0.55 }));
    holoTag(idleClip, "idle timer", 0, 0.76, 0, { css: "#5ec2d6", w: 0.3 });
    reg(hits, idleClip, "idle-log");

    // ------------------------------------------------------- school crossing
    const school = group(g, 2.6, 0.14, 2.2);
    box(school, 1.1, 0.9, 0.8, 0, 0.45, 0, 0xc9a980, { rough: 0.9 });
    box(school, 1.2, 0.06, 0.9, 0, 0.92, 0, 0x5a4a3c, { rough: 0.85 });
    holoTag(school, "school", 0, 1.1, 0, { css: "#5ec2d6", w: 0.28 });
    const bell = ball(school, 0.05, 0, 1.05, 0.5, 0xe8b02e, { rough: 0.5, metal: 0.5 });
    void bell;
    const crossingGuard = standingFigure(g, 1.4, 1.9, { ry: -1.6, cloth: 0xf2ae14, vest: 0xf2c14b, helmet: 0xffffff });
    void crossingGuard;
    for (const cx of [1.0, 1.15, 1.3, 1.45, 1.6]) box(g, 0.28, 0.005, 0.9, cx, 0.153, 1.6, 0xffffff, { rough: 0.7, cast: false });
    // The idling truck, only visible once the school-crossing interrupt fires.
    const idlingTruck = group(g, 1.0, 0.14, 1.8, -1.4);
    box(idlingTruck, 0.8, 0.6, 0.65, -0.7, 0.42, 0, 0xc9a227, { rough: 0.55, metal: 0.25 });
    box(idlingTruck, 0.48, 0.05, 0.65, -0.7, 0.73, 0, 0x2b2f34, { rough: 0.7 });
    for (const sx of [-1, 1]) cyl(idlingTruck, 0.18, 0.18, 0.18, sx * 0.85, 0.18, 0.28, 0x1b1e22, { rough: 0.8, seg: 14 }).rotation.x = Math.PI / 2;
    const idleExhaust = particles(idlingTruck, 20, 0x7a7f84, { size: 0.025, life: 0.8, additive: false, opacity: 0.4 });
    idlingTruck.visible = false;

    // ------------------------------------------------------------- speed sign
    const signPost = group(g, 0.9, 0.14, -2.2, 0);
    cyl(signPost, 0.02, 0.02, 1.2, 0, 0.6, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });
    const signBoard = box(signPost, 0.28, 0.28, 0.02, 0, 1.2, 0, 0xffffff, { rough: 0.55 });
    decal(signBoard, 0.24, 0.24, 0, 0, 0.011, signFace("25 MPH", { bg: "#ffffff", accent: "#1b1e22", scale: 0.5 }), { px: 200 });
    holoTag(signPost, "residential speed limit", 0, 1.4, 0, { css: "#5ec2d6", w: 0.42 });

    // ------------------------------------------------------------- crew figures
    standingFigure(g, -1.7, -1.7, { atStation: true, ry: 0.9, cloth: 0x37505f, vest: HRO_ACCENT, helmet: 0xf2f2f2 });
    cone(g, -2.5, 2.0, { color: HRO_ACCENT }); cone(g, 0.9, 2.4, { color: HRO_ACCENT });
    const dust = particles(g, 25, 0xc9b99a, { size: 0.025, life: 0.9, additive: false, opacity: 0.2 });

    // -------------------------------------------------------------- live state
    let truck2Rolling = false, idling = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.1, -0.7),
      footprint: 2.4,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "check-wash") washMist.visible = true;
        if (step.id === "trackout-walk") trackout.visible = false;
        if (step.id === "check-placard") repaint(radarScreen, signFace("22 mph", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "camera-ready") { cameraStart.visible = false; }
        if (step.id === "steady-shot") repaint(idleScreen, signFace("captured", { bg: "#0f1b14", accent: "#59c97b", scale: 0.4 }));
        if (step.id === "file-report") { void 0; }
      },
      onInterrupt(it) {
        if (it.id === "half-open-tarp") { truck2Rolling = true; truck2.position.x += 0.5; tarp2.material = tarp2.material.clone(); tarp2.scale.x = 0.55; tarp2.position.x = -0.55; }
        if (it.id === "idle-at-crossing") {
          idling = true;
          idlingTruck.visible = true;
          idleExhaust.visible = true;
          repaint(idleScreen, signFace("running…", { bg: "#2a0c0c", accent: "#d2312b", fg: "#ffd0d0", scale: 0.45 }));
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "half-open-tarp") { truck2Rolling = false; truck2.position.x -= 0.5; }
        if (it.id === "idle-at-crossing") {
          idling = false;
          idlingTruck.visible = false;
          idleExhaust.visible = false;
          repaint(idleScreen, signFace("5:00 logged", { bg: "#0f1b14", accent: "#59c97b", scale: 0.4 }));
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        dust.visible = true; dust.userData.step(dt, new THREE.Vector3(-0.6, 0.5, -0.6), 0.8, 0.35, 0.12);
        if (idling) idleExhaust.userData.step(dt, new THREE.Vector3(1.0 - 0.7, 0.6, 1.8), 0.06, 0.5, 0.3);
        if (truck2Rolling) truck2.position.z = Math.min(1.6, truck2.position.z + dt * 1.1);
        if (idling) idleScreen.material.emissiveIntensity = 1.2 + Math.sin(t * 6) * 0.6;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "radar-speed") {
          repaint(radarScreen, signFace(`${Math.round(15 + gg.t * 35)} mph`, { bg: "#0d1c24", accent: gg.t >= 0.2 && gg.t <= 0.42 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        }
        if (session?.turn && step?.id === "camera-zoom") { zoomDial.rotation.z = session.turn.amount * Math.PI * 2; viewfinderRing.scale.setScalar(1 - (session.turn.amount / session.turn.required) * 0.4); }
      },
    };
  },
};
