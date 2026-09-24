import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoTag, standingFigure, reg,
  surfaceTexture, texturedMat, pavingFace, mudflatFace, waterFace,
} from "../citykit.js";
import { mobileCrane } from "../../../shared/equipment.js";
import { pickup } from "../../../shared/fleet.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Trash Capture Device Service VR — SF Bay Restoration &
// Cleanup, pack D (contaminated sediment and water quality).
//
// An end-of-pipe net trash capture device on a storm drain outfall at the
// shoreline — the kind of full-capture device the Bay's municipal stormwater
// permit counts toward keeping trash out of the Bay. The learner is the
// LIUNA Local 261 service crew lead; an IUOE Local 3 operating engineer
// lifts the full net bag with a rough-terrain crane. The service is the
// whole job: the order read, the net and its lifting eye inspected, the tide
// read, the crane's outrigger on its pad, the ring clamp opened under load,
// the bag controlled on a tag line while a gust swings it, emptied into the
// roll-off while sharps spill out of it, a fresh net hung and pinned, the
// catch estimated for the trash report, the photo point taken, the outfall
// walked, logged and the crew checked in. Nothing here is a real outfall,
// and no permit figure is stated as a number.

const BRTR_ACCENT = 0xe0a040;

/** Knotted netting on a transparent ground, for the net bag. */
function brtrNetFace(g, w, h) {
  g.clearRect(0, 0, w, h);
  g.strokeStyle = "rgba(40,48,40,0.95)"; g.lineWidth = 3;
  for (let i = -h; i < w; i += 18) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); g.beginPath(); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = ["#c9b27a", "#d6d0c2", "#5a7a9a", "#b0402a", "#e8e2d0"][i % 5]; g.fillRect(Math.random() * w, h * 0.35 + Math.random() * h * 0.6, 10 + Math.random() * 16, 6 + Math.random() * 10); }
}

export const SIM_BR_TRASH_CAPTURE_DEVICE_SERVICE = {
  id: "br-trash-capture-device-service",
  index: "BR-D6",
  domain: "Environmental",
  trade: "LIUNA Local 261 shoreline service crew lead on an outfall trash capture device, with an IUOE Local 3 operating engineer on the rough-terrain crane",
  category: "Environmental Monitoring",
  district: "Environmental Monitoring",
  weather: "wind",
  certification: "LIUNA Local 261 shoreline crew training (LIUNA Training and Education Fund) for the service crew; IUOE Local 3 operating engineer apprenticeship and NCCCO certification for the crane operator, lifting under ASME B30.5; OSHA 29 CFR 1926.1425 for keeping everyone clear of the suspended net bag; OSHA 29 CFR 1910.1030 bloodborne pathogens practice for the sharps the nets catch; the Regional Water Quality Control Board's municipal stormwater permit trash provisions and the NPDES stormwater rules, 40 CFR 122.26; RCRA 40 CFR 262 and DTSC universal waste rules for batteries and containers pulled from the catch, handled per the work plan; BCDC permit conditions for work on the shoreline",
  name: "Trash Capture Device Service",
  title: simTitle("Trash Capture Device Service"),
  tagline: "An outfall net full of the city's trash, lifted out before the next storm: the service order read, the net and its lifting eye inspected, the tide read, the outrigger on its pad, the ring clamp opened under load, the bag held on a tag line while a gust swings it, emptied into the roll-off while sharps spill out, a fresh net hung and pinned, the catch estimated, the photo point taken, the outfall walked, logged and the crew checked in",
  accent: BRTR_ACCENT,
  accentCss: "#e0a040",
  parSeconds: 300,
  footprint: 2.5,
  badge: { id: "nothing-back-in", name: "Nothing Back In", note: "The full net lifted, emptied and replaced without a piece of its catch going back into the channel or a hand going into it" },

  supportLine: "your union hall's member assistance programme — LIUNA Local 261 or IUOE Local 3 — with the employer's employee assistance line behind it",

  game: system({
    name: "Net Service",
    currency: "BAG",
    ranks: ["Net Hand", "Tag Line Hand", "Service Lead", "Stormwater Foreman", "Net Service Certified"],
    badges: [
      { id: "eye-checked", name: "Eye Checked", note: "The order read and the net and lifting eye inspected clean before the hook went on", test: AWARD.all(AWARD.stepClean("service-order"), AWARD.stepClean("pre-lift")) },
      { id: "clear-of-the-load", name: "Clear Of The Load", note: "Never under the bag, never a hand in the catch, never on the headwall edge, never a net shaken over the water", test: AWARD.safe },
      { id: "honest-catch", name: "Honest Catch", note: "Tide and catch estimate both committed inside their bands", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-service", name: "Clean Service", note: "No corrections from the order to the check-in", test: AWARD.clean },
      { id: "steady-tag", name: "Steady Tag", note: "Held the tag line in band the whole lift", test: AWARD.unbroken },
      { id: "before-the-storm", name: "Before The Storm", note: "Service logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-the-bag": "You walked under the suspended net bag to reach the tag line from the other side. A full net is a heavy, wet, shifting load hanging from one hook, and 29 CFR 1926.1425 keeps everyone out from under a suspended load because rigging, a sling or a torn net gives no warning. The tag line is reached by walking round the swing, never under it.",
    "hand-in-catch": "You reached into the emptied catch to pull out a bottle for recycling. Storm drain trash is where needles, broken glass and worse end up, and a glove is not a sharps barrier. Nothing in the catch is picked by hand: the tongs sort what has to be sorted, and sharps go straight into the sharps container.",
    "headwall-edge": "You climbed onto the headwall's edge to reach the ring clamp. The headwall drops straight into the outfall channel, wet and covered in growth, with the channel's flow and the Bay below it; a slip there is a fall into moving water. The clamp is worked from the service platform behind the rail, with the PFD fastened.",
    "shake-over-water": "You went to shake the last of the net's catch out over the channel. The net exists to keep that trash out of the Bay, and every piece shaken out over the water is a piece the device caught and the crew then released — which the permit's trash accounting counts against the city as if the device were not there. The net is emptied over the roll-off, and what sticks is picked out there with the tongs.",
  },

  lateNotes: {
    "clamp-ring": "Open the ring clamp only once the crane has the bag's weight on the bridle — open without the hook holding it, the full net drops into the channel.",
    "tag-line": "The tag line is taken once the clamp is open and the bag is free to lift — tension on a bag still clamped to the frame just pulls the frame.",
    "fill-scale": "Estimate the catch once it is in the roll-off and the fresh net is pinned — the estimate describes what the device held this cycle.",
    "service-log": "The service log is written after the outfall walk — it records what the walk found as well as the lift.",
  },

  steps: [
    {
      id: "service-order", kind: "select", target: "service-order",
      title: "Read the service order and the device's maintenance plan",
      cue: "At the board: which device, the inspection checklist, the tide window, the crane's lift plan and who is signalling, and what the trash report needs from this visit.",
      why: "The municipal stormwater permit counts a full-capture device toward keeping trash out of the Bay only while it is maintained to its plan, so the service order and the maintenance plan are what the Regional Water Quality Control Board's accounting rests on. They also carry the lift plan and the tide window, which decide whether the crew and the crane can do the job safely today at all.",
    },
    {
      id: "gear", kind: "sequence", anyOrder: true,
      targets: ["ppe-cut-gloves", "ppe-pfd", "ppe-hardhat"],
      itemNames: { "ppe-cut-gloves": "cut- and puncture-resistant gloves", "ppe-pfd": "work vest PFD, fastened", "ppe-hardhat": "hard hat" },
      title: "Gear up for the outfall",
      cue: "Cut- and puncture-resistant gloves, the PFD fastened for the headwall, and a hard hat under the crane.",
      why: "The catch in a storm drain net holds glass, metal and needles, so gloves rated against cuts and punctures are the minimum between a hand and the net's contents. The service platform is above moving water, so the PFD is fastened, and the hard hat is for the crane's hook and a net bag moving overhead.",
    },
    {
      id: "pre-lift", kind: "find", noHint: true,
      targets: ["net-torn", "eye-corroded"],
      itemNames: { "net-torn": "a tear along the net's lower seam", "eye-corroded": "the frame's lifting eye eaten by corrosion" },
      itemNotes: {
        "net-torn": "The net has split along its lower seam, and trash has been going straight through it into the channel. The bag comes out today and the fresh net's seam gets checked before it goes on.",
        "eye-corroded": "The lifting eye on the net frame is pitted almost through by salt. It is not lifted on: the bridle goes on the frame's secondary lifting points and the eye is tagged for replacement.",
      },
      title: "Inspect the net and its lifting points before the hook goes on",
      cue: "Look over the full net and the frame: the net's seams, the ring clamp, and the lifting eye the bridle would hang from.",
      why: "A torn net has been letting trash through since it tore, which the report must say, and a lifting eye eaten by salt water fails under exactly the load the crane is about to put on it. Both are found by looking before the hook goes on, when the answer is a different lifting point and a note rather than a dropped bag and a crew under it.",
    },
    {
      id: "tide", kind: "gauge", target: "tide-staff",
      title: "Read the tide against the headwall's working mark",
      cue: "Read the staff on the wing wall and commit it against the working mark and the day's NOAA prediction.",
      why: "At high water the outfall's net sits in the Bay, the platform is awash and the bag is full of water that makes it heavier than the lift plan allowed. The working mark on the staff says when the job can be done, and reading it against the tide prediction tells the crew whether the window is opening or closing while they work.",
      gauge: { label: "TIDE AT HEADWALL", speed: 0.66, green: [0.4, 0.58], readout: (t) => (t < 0.4 ? "above the mark — net in the water" : t <= 0.58 ? "below the working mark" : "swell on the staff — wait"), missNote: "Outside the band — let the swell settle on the staff and read it against the working mark again." },
    },
    {
      id: "outrigger-pad", kind: "drag", target: "outrigger-pad",
      title: "Set the crane's outrigger on its pad",
      cue: "Carry the crane mat to the mark under the front outrigger and set it square before the float comes down.",
      why: "A crane lifting over a shoreline sets its outriggers on ground that may be fill over soft bay mud, and the pad spreads the outrigger's load so the float does not punch through. The lift plan marks where the pads go; set off the mark or at an angle, the outrigger loads its edge and the crane can settle toward the water mid-lift.",
      drag: { to: "pad-mark", radius: 0.5, missNote: "Not on the mark — the pad sits square on the lift plan's mark under the outrigger float." },
    },
    {
      id: "open-clamp", kind: "turn", target: "clamp-ring",
      title: "Open the ring clamp with the crane holding the bag",
      cue: "With the operator holding the bag's weight on the bridle, turn the ring clamp's handle until it frees the net from the frame.",
      why: "The ring clamp holds the net to the frame against the storm drain's flow, and it is opened only once the crane has the weight — opened first, a full, wet bag drops into the channel and takes its catch with it. Turning it steadily lets the net ease off the frame instead of jumping when the last of the clamp lets go.",
      turn: { turns: 1.25, label: "RING CLAMP", readout: (t) => (t < 0.3 ? "clamped to the frame" : t < 0.9 ? "loosening under load" : "free — the crane has it") },
    },
    {
      id: "tag-lift", kind: "track", target: "tag-line", seconds: 7,
      title: "Control the bag on the tag line as it lifts",
      cue: "Hold the tag line with steady tension from outside the swing: no spin, no swing, the bag tracking to the roll-off.",
      why: "A net bag full of wet trash swings and spins as it comes off the frame, and in a wind it does both more. The tag line lets the ground steer it without anyone standing under or beside it, and steady tension is the whole skill — slack lets it spin, a yank starts a swing the operator then has to chase.",
      track: { start: 0.14, green: [0.4, 0.6], rise: 0.56, fall: 0.46, drift: 0.14, label: "TAG LINE", readout: (v) => (v < 0.4 ? "slack — the bag is spinning" : v > 0.6 ? "yanking — starting a swing" : "steady — tracking to the bin") },
      holdBreakNote: "The tag line went slack or snapped taut and the bag started to swing. Bring it back to steady tension from outside the swing.",
    },
    {
      id: "empty-bag", kind: "hold", target: "drawstring",
      seconds: 5,
      title: "Empty the bag into the roll-off",
      cue: "With the bag low over the roll-off, hold the drawstring release open until the catch has dropped out.",
      why: "The catch is dropped into the roll-off, not the ground or the channel, and the bag is brought low before the drawstring is opened so it falls a short way instead of scattering. Holding the release steady until it is empty keeps the crane's load predictable — a bag that dumps half and snags jerks on the hook.",
      holdBreakNote: "The release closed with half the catch still in the bag. Hold it open until the bag has emptied into the roll-off.",
    },
    {
      id: "fresh-net", kind: "sequence",
      targets: ["fresh-net", "clamp-close", "clamp-pin"],
      itemNames: { "fresh-net": "fresh net hung on the frame", "clamp-close": "ring clamp closed round it", "clamp-pin": "safety pin through the clamp" },
      title: "Hang, clamp and pin a fresh net",
      cue: "Hang the fresh net on the frame, close the ring clamp round it, then put the safety pin through the clamp.",
      why: "The net is hung before it is clamped so the ring seats round the whole cuff, and the pin goes in last because it is what keeps a clamp from vibrating open under the next storm's flow. A net clamped crooked or unpinned is a device the permit counts as capturing trash while the first storm washes it off the frame.",
      outOfOrderNote: "Out of order — hang the net first, then close the clamp round it, and the safety pin goes through last.",
    },
    {
      id: "catch-estimate", kind: "gauge", target: "fill-scale",
      title: "Estimate the catch against the fill scale",
      cue: "Read the catch's depth in the roll-off against the fill scale and commit the estimate for the trash report.",
      why: "The trash report the permit asks for is built from these estimates, visit by visit, and they are how the city shows the device is doing what it claims. An estimate read against the scale — not guessed from the kerb — is also how a device that fills faster than its service interval gets noticed and serviced more often.",
      gauge: { label: "CATCH vs SCALE", speed: 0.7, green: [0.42, 0.6], readout: (t) => (t < 0.42 ? "reading the bin's rim, not the catch" : t <= 0.6 ? "estimate against the scale" : "catch still settling"), missNote: "Outside the band — let the catch settle and read its depth against the fill scale again." },
    },
    {
      id: "photo-point", kind: "select", target: "photo-point",
      title: "Take the photo at the photo point",
      cue: "From the marked photo point, photograph the fresh net on the frame and the channel below it.",
      why: "The photo point is fixed so every visit's photograph shows the same view, which is what lets a reviewer see a device's condition over time rather than taking a crew's word for it. The fresh net and a clean channel photographed today are the evidence the service happened and the device went back into service whole.",
    },
    {
      id: "outfall-walk", kind: "find", noHint: true,
      targets: ["litter-riprap", "sling-frayed"],
      itemNames: { "litter-riprap": "trash caught in the riprap below the headwall", "sling-frayed": "a frayed leg on the lifting bridle" },
      itemNotes: {
        "litter-riprap": "Trash from the torn seam has lodged in the riprap below the headwall; the next tide carries it out. It is picked out with the tongs from the platform before the crew leaves.",
        "sling-frayed": "One leg of the lifting bridle has broken strands at the thimble. It is tagged out of service and replaced before the next lift, not coiled back into the truck.",
      },
      title: "Walk the outfall before leaving",
      cue: "Look along the channel and the riprap below the headwall, and over the rigging going back in the truck.",
      why: "What the torn net let through is still in the channel until someone picks it out, and rigging that did the day's lift is inspected before it goes back in the truck, when a frayed leg is a tag and a replacement rather than a surprise at the next outfall. The walk is the last look before the tide and the next storm take over.",
    },
    {
      id: "service-log", kind: "select", target: "service-log",
      title: "Write the service log",
      cue: "Log the torn seam and how long it may have passed trash, the corroded eye tagged, the tide, the catch estimate, the sharps found and contained, the gust and the stop, the fresh net and the frayed bridle.",
      why: "The service log feeds the trash report and the device's maintenance record, and it is what shows the permit's reviewer that the device was maintained rather than just visited. The torn seam goes in honestly, with how long it may have been passing trash, because an accounting that hides a failure is one nobody will trust about the successes.",
    },
    {
      id: "crew-checkin", kind: "select", target: "crew-radio",
      title: "Check in with the operator and the crew",
      cue: "On the radio: the device is back in service and logged, the eye and the bridle are tagged, and how the operator and the second hand are after a swinging bag and a spill of needles.",
      why: "A bag swinging toward a crewmate and a spill of needles at the bin are both close calls, and close calls stay with people after the job is packed up. The check-in closes the day's tags out loud and is the crew's own — the member assistance line is there for anything that is still with someone after the radio goes quiet.",
    },
  ],

  interrupts: [
    {
      id: "gust-swing",
      kind: "Gust swinging the bag",
      after: "tag-lift", delay: 3, seconds: 12,
      alert: "A gust off the Bay has caught the lifted bag and swung it toward the second hand standing by the roll-off.",
      cue: "Give the crane operator the all-stop signal, then steady the bag once it hangs still.",
      target: "stop-signal",
      why: "A load swinging toward a person is stopped at the crane, not wrestled at the tag line — the operator stops all motion on the agreed signal, which ASME B30.5 practice makes the one signal anyone on the ground may give, and the swing dies out on a still hook. The tag line steadies it once it is hanging, not while the crane is still moving it.",
      missNote: "The operator kept slewing into the gust and the bag swung wide; it clipped the second hand's shoulder and knocked him against the roll-off before the swing died out.",
      wrongNote: "The all-stop signal to the operator — stop the crane first, then steady the bag.",
    },
    {
      id: "sharps-spill",
      kind: "Sharps in the catch",
      after: "empty-bag", delay: 2, seconds: 13,
      alert: "As the catch drops, a bundle of needles has spilled over the roll-off's rim onto the ground at your feet.",
      cue: "Take the tongs and put the needles in the sharps container — no hands, nothing kicked aside.",
      target: "sharps-tongs",
      why: "Needles in a storm drain catch carry the risks 29 CFR 1910.1030 is written for, and the only safe way to move one is with a tool, straight into a rigid sharps container. Left on the ground they are stepped on or kicked into the channel; picked up by hand, a glove is the only thing between the point and the skin.",
      missNote: "The needles stayed on the ground while the bag was emptied; one was trodden into a boot sole and another was kicked back toward the channel before anyone went for the tongs.",
      wrongNote: "The sharps tongs — pick them up with the tool, straight into the sharps container.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.5, BRTR_ACCENT);

    // ------------------------------------------ bank, channel and the Bay
    const bank = box(g, 14, 0.04, 6.2, 0, 0.02, 0.6, 0xffffff, { rough: 0.95 });
    bank.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 5, base: "#4c4a44", base2: "#42403a", seam: "rgba(0,0,0,0.35)" }), { repeat: 5, px: 512 }), { rough: 0.95, color: 0xccc4b8 });
    const channel = box(g, 3.2, 0.03, 5, 0, 0.01, -5.0, 0xffffff, { rough: 0.98, cast: false });
    channel.material = texturedMat(surfaceTexture((cx, w, h) => mudflatFace(cx, w, h, { base: "#3a3a34", base2: "#2e2e2a", pools: 12 }), { repeat: 2, px: 256 }), { rough: 0.98, color: 0xb8b4aa });
    const water = box(g, 18, 0.02, 7, 0, 0.004, -10.8, 0xffffff, { rough: 0.15, metal: 0.4, cast: false });
    water.material = texturedMat(surfaceTexture((cx, w, h) => waterFace(cx, w, h, { base: "#142629", mid: "#193034" }), { repeat: 3, px: 512 }), { rough: 0.15, metal: 0.4, color: 0x8ea8ac });
    for (const [x, z, s] of [[-1.9, -3.6, 0.35], [1.9, -3.9, 0.4], [-2.0, -5.0, 0.3], [2.1, -5.4, 0.36], [-1.8, -6.4, 0.32]]) ball(g, s, x, s * 0.4, z, 0x6b665c, { rough: 0.95, seg: 7, seg2: 5 });
    const litter = group(g, 0.9, 0.05, -4.6);
    for (const [dx, dz, c] of [[0, 0, 0xd6d0c2], [0.25, 0.15, 0x5a7a9a], [-0.2, 0.2, 0xb0402a]]) box(litter, 0.14, 0.05, 0.08, dx, 0.02, dz, c, { rough: 0.7 });
    reg(hits, litter, "litter-riprap");

    // --------------------------------------------- headwall, pipe and net
    const hw = group(g, 0, 0, -2.6);
    box(hw, 3.4, 1.3, 0.45, 0, 0.65, 0, 0x9a968e, { rough: 0.95 });
    for (const sx of [-1, 1]) box(hw, 0.35, 1.1, 1.4, sx * 1.55, 0.55, -0.7, 0x9a968e, { rough: 0.95 });
    cyl(hw, 0.46, 0.46, 0.2, 0, 0.6, -0.3, 0x3a3a38, { rough: 0.8, seg: 20 }).rotation.x = Math.PI / 2;
    const frame = group(hw, 0, 0.6, -0.45);
    const ring = torus(frame, 0.5, 0.04, 0, 0, 0, 0x6f767d, { rough: 0.5, metal: 0.6, seg: 8, seg2: 24 });
    void ring;
    const clamp = group(frame, 0.5, 0.3, 0.02);
    box(clamp, 0.08, 0.16, 0.08, 0, 0, 0, 0x2f4d5f, { rough: 0.5, metal: 0.5 });
    const clampHandle = box(clamp, 0.2, 0.03, 0.03, 0.1, 0.06, 0, 0xe0a040, { rough: 0.5 });
    holoTag(frame, "ring clamp", 0.5, 0.62, 0, { css: "#e0a040", w: 0.24 });
    reg(hits, clamp, "clamp-ring");
    const eye = torus(frame, 0.06, 0.02, 0, 0.58, 0, 0x8a5a3a, { rough: 0.9, emissive: 0x3a1a06, ei: 0.4, seg: 6, seg2: 12 });
    reg(hits, eye, "eye-corroded");
    const netMat = texturedMat(surfaceTexture(brtrNetFace, { repeat: 1, px: 256 }), { rough: 0.9, color: 0xffffff });
    netMat.transparent = true; netMat.side = THREE.DoubleSide;
    const bag = group(g, 0, 0.6, -3.1);
    const bagBody = cyl(bag, 0.48, 0.3, 1.5, 0, 0, -0.75, 0xffffff, { rough: 0.9, seg: 14 });
    bagBody.rotation.x = Math.PI / 2;
    bagBody.material = netMat;
    const tear = box(bag, 0.34, 0.03, 0.04, 0, -0.42, -0.9, 0xb0402a, { rough: 0.8, emissive: 0x3a0e06, ei: 0.35 });
    reg(hits, tear, "net-torn");
    const drawstring = group(bag, 0, -0.1, -1.55);
    box(drawstring, 0.1, 0.1, 0.06, 0, 0, 0, 0xe0a040, { rough: 0.5 });
    holoTag(drawstring, "drawstring release", 0, 0.24, 0, { css: "#e0a040", w: 0.34 });
    reg(hits, drawstring, "drawstring");
    const bagHome = bag.position.clone();
    const freshOnFrame = cyl(g, 0.46, 0.3, 1.2, 0, 0.6, -3.7, 0xffffff, { rough: 0.9, seg: 14 });
    freshOnFrame.rotation.x = Math.PI / 2;
    freshOnFrame.material = texturedMat(surfaceTexture((cx, w, h) => { cx.clearRect(0, 0, w, h); cx.strokeStyle = "rgba(40,90,50,0.95)"; cx.lineWidth = 3; for (let i = -h; i < w; i += 18) { cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i + h, h); cx.stroke(); cx.beginPath(); cx.moveTo(i + h, 0); cx.lineTo(i, h); cx.stroke(); } }, { repeat: 1, px: 128 }), { rough: 0.9 });
    freshOnFrame.material.transparent = true;
    freshOnFrame.visible = false;
    const tideStaff = decal(hw, 0.1, 0.9, 1.74, 0.6, -0.4, (cx, w, h) => {
      cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { cx.fillStyle = i % 2 ? "#1b1e22" : "#e0a040"; cx.fillRect(0, (i * h) / 12, w * (i % 3 === 0 ? 1 : 0.55), h / 24); }
      cx.fillStyle = "#d2312b"; cx.fillRect(0, h * 0.35, w, 4);
    }, { px: 64 });
    tideStaff.rotation.y = Math.PI / 2;
    holoTag(hw, "tide staff", 1.74, 1.25, -0.4, { css: "#e0a040", w: 0.22 });
    reg(hits, tideStaff, "tide-staff");
    // Service platform rail and the headwall-edge hazard.
    box(g, 3.4, 0.05, 0.05, 0, 1.1, -2.25, CITY.hiVis, { rough: 0.6 });
    for (const x of [-1.6, 0, 1.6]) cyl(g, 0.03, 0.03, 1.1, x, 0.55, -2.25, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const edgeHit = box(g, 0.6, 0.4, 0.4, -1.1, 1.45, -2.6, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "climb onto the headwall edge?", -1.1, 1.8, -2.5, { css: "#e8622a", w: 0.52 });
    reg(hits, edgeHit, "headwall-edge");
    const shakeHit = box(g, 0.6, 0.4, 0.5, 1.2, 1.3, -3.3, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "shake it out over the channel?", 1.2, 1.62, -3.2, { css: "#e8622a", w: 0.52 });
    reg(hits, shakeHit, "shake-over-water");

    // ------------------------------------------------------------ the crane
    const crane = mobileCrane(g, -5.6, 0, -1.2, { ry: Math.PI / 2 });
    const { house, boom, hook, outriggers } = crane.userData.parts;
    house.rotation.y = -0.35;
    if (boom) boom.rotation.x = -0.55;
    if (hook) hook.rotation.x = 0.55;
    if (outriggers) outriggers.forEach((o) => { o.position.x += (o.position.x > 0 ? 1 : -1) * 0.9; });
    holoTag(g, "rough-terrain crane — IUOE Local 3", -5.6, 4.2, -1.2, { css: "#e0a040", w: 0.62 });
    const padMark = group(g, -3.3, 0.03, 0.9);
    const markRing = torus(padMark, 0.45, 0.012, 0, 0.01, 0, BRTR_ACCENT, { emissive: BRTR_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 28 });
    markRing.rotation.x = Math.PI / 2;
    hits["pad-mark"] = padMark;
    holoTag(padMark, "outrigger pad mark", 0, 0.3, 0, { css: "#e0a040", w: 0.34 });
    const pad = group(g, -2.4, 0.03, 1.6, 0.3);
    box(pad, 0.8, 0.08, 0.8, 0, 0.04, 0, 0x5a4a38, { rough: 0.9 });
    holoTag(pad, "crane mat", 0, 0.3, 0, { css: "#e0a040", w: 0.2 });
    reg(hits, pad, "outrigger-pad");
    const underHit = box(g, 0.6, 0.6, 0.6, -0.5, 1.0, -4.0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "walk under the bag?", -0.5, 1.5, -4.0, { css: "#e8622a", w: 0.36 });
    reg(hits, underHit, "under-the-bag");
    const sling = box(g, 0.14, 0.04, 0.3, -2.6, 0.06, -0.5, 0x2f6fb8, { rough: 0.7, emissive: 0x0a1a3a, ei: 0.3 });
    reg(hits, sling, "sling-frayed");

    // Tag line and the stop-signal post.
    const tag = group(g, 1.2, 0, -1.4);
    cyl(tag, 0.012, 0.012, 1.8, 0, 0.9, -0.8, 0xe8b02e, { rough: 0.8, seg: 6 }).rotation.x = 0.9;
    const tagHandle = box(tag, 0.08, 0.2, 0.08, 0, 0.95, 0, 0xe8b02e, { rough: 0.7 });
    holoTag(tag, "tag line", 0, 1.25, 0, { css: "#e0a040", w: 0.2 });
    reg(hits, tag, "tag-line");
    void tagHandle;
    const stop = group(g, -1.9, 0, -0.4);
    cyl(stop, 0.03, 0.03, 1.2, 0, 0.6, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    const stopSign = decal(stop, 0.3, 0.3, 0, 1.3, 0.02, signFace("ALL\nSTOP", { bg: "#d2312b", accent: "#f2f2ee", fg: "#ffffff", scale: 0.34 }), { px: 128 });
    holoTag(stop, "all-stop signal to the crane", 0, 1.58, 0, { css: "#e0a040", w: 0.46 });
    reg(hits, stop, "stop-signal");
    void stopSign;

    // ------------------------------------------------ the roll-off bin
    const bin = group(g, 3.0, 0, -1.6, -0.15);
    box(bin, 1.4, 0.08, 2.2, 0, 0.1, 0, 0x2f4d5f, { rough: 0.6, metal: 0.4 });
    for (const [w, d, x, z] of [[1.4, 0.06, 0, -1.1], [1.4, 0.06, 0, 1.1], [0.06, 2.2, -0.7, 0], [0.06, 2.2, 0.7, 0]]) box(bin, w, 1.0, d, x, 0.6, z, 0x2f4d5f, { rough: 0.6, metal: 0.4 });
    const catchPile = box(bin, 1.2, 0.3, 1.9, 0, 0.3, 0, 0x7a6a50, { rough: 0.95 });
    catchPile.visible = false;
    const scale = decal(bin, 0.12, 0.9, -0.74, 0.6, 0.6, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { cx.fillStyle = "#1b1e22"; cx.fillRect(0, (i * h) / 5, w, 4); } }, { px: 64 });
    scale.rotation.y = -Math.PI / 2;
    holoTag(bin, "roll-off — fill scale", -0.74, 1.3, 0.6, { css: "#e0a040", w: 0.36 });
    reg(hits, scale, "fill-scale");
    const needles = group(g, 2.2, 0.03, -0.3);
    for (let i = 0; i < 3; i++) box(needles, 0.1, 0.012, 0.012, i * 0.05, 0.01, i * 0.04, 0xd8dde2, { rough: 0.3, metal: 0.7 }).rotation.y = i * 0.6;
    needles.visible = false;
    const handHit = box(g, 0.5, 0.4, 0.5, 3.8, 1.0, -0.8, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "pick a bottle out by hand?", 3.8, 1.35, -0.7, { css: "#e8622a", w: 0.48 });
    reg(hits, handHit, "hand-in-catch");
    const sharps = group(g, 2.0, 0, 0.6);
    box(sharps, 0.3, 0.8, 0.3, 0, 0.4, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    const sharpsBox = box(sharps, 0.22, 0.26, 0.16, 0, 0.93, 0, 0xd2312b, { rough: 0.5 });
    void sharpsBox;
    cyl(sharps, 0.01, 0.01, 0.7, 0.2, 0.75, 0, 0xc0c6cc, { rough: 0.3, metal: 0.8, seg: 6 }).rotation.z = 0.3;
    holoTag(sharps, "sharps tongs and container", 0, 1.3, 0, { css: "#e0a040", w: 0.44 });
    reg(hits, sharps, "sharps-tongs");

    // Fresh net, clamp close and pin, near the platform.
    const spare = group(g, -0.9, 0, -1.4);
    box(spare, 0.6, 0.3, 0.4, 0, 0.15, 0, 0x2f6f3a, { rough: 0.8 });
    holoTag(spare, "fresh net", 0, 0.5, 0, { css: "#e0a040", w: 0.2 });
    reg(hits, spare, "fresh-net");
    const closeLever = group(g, 0.6, 1.0, -2.3);
    box(closeLever, 0.12, 0.12, 0.08, 0, 0, 0, 0x2f4d5f, { rough: 0.5, metal: 0.5 });
    holoTag(closeLever, "close the clamp", 0, 0.22, 0, { css: "#e0a040", w: 0.28 });
    reg(hits, closeLever, "clamp-close");
    const pin = group(g, 0.95, 1.0, -2.3);
    cyl(pin, 0.015, 0.015, 0.14, 0, 0, 0, 0xd2312b, { rough: 0.4, seg: 6 }).rotation.z = Math.PI / 2;
    holoTag(pin, "safety pin", 0, 0.18, 0, { css: "#e0a040", w: 0.2 });
    reg(hits, pin, "clamp-pin");

    // ---------------------------------------- photo point, boards, radio
    const photo = group(g, -1.3, 0, 1.3);
    cyl(photo, 0.05, 0.05, 1.3, 0, 0.65, 0, 0xe0a040, { rough: 0.6, seg: 8 });
    const photoPlate = decal(photo, 0.2, 0.14, 0, 1.35, 0.06, signFace("PHOTO\nPOINT 3", { bg: "#1b1e22", accent: "#e0a040", scale: 0.36 }), { px: 128 });
    holoTag(photo, "photo point", 0, 1.6, 0, { css: "#e0a040", w: 0.22 });
    reg(hits, photo, "photo-point");
    void photoPlate;
    const gear = group(g, -2.9, 0, 2.0, 0.7);
    box(gear, 0.9, 0.05, 0.4, 0, 0.72, 0, 0x5a4a38, { rough: 0.8 });
    box(gear, 0.8, 0.7, 0.04, 0, 0.35, 0, 0x3a3f45, { rough: 0.7, metal: 0.3 });
    for (const [id, dx, colour, label] of [["ppe-cut-gloves", -0.28, 0x3a4a2a, "CUT GLOVES"], ["ppe-pfd", 0, 0xf06a2b, "PFD"], ["ppe-hardhat", 0.28, 0xf2f2ee, "HARD HAT"]]) {
      const it = group(gear, dx, 0.8, 0);
      box(it, 0.2, 0.08, 0.16, 0, 0, 0, colour, { rough: 0.8 });
      decal(it, 0.18, 0.05, 0, 0.041, 0, signFace(label, { bg: "#1b1e22", accent: "#e0a040", scale: 0.45 })).rotation.x = -Math.PI / 2;
      reg(hits, it, id);
    }
    const order = decal(g, 0.56, 0.4, 0.2, 1.25, 1.9, paperFace("SERVICE ORDER — OUTFALL NET 7", ["Device: end-of-pipe net, ring clamp", "Tide: below the working mark", "Lift: per the lift plan, one signaller", "Report: catch estimate, photo point", "Sharps: tongs and container only"], { bg: "#f4ecdc", band: "#e0a040" }), { px: 320 });
    cyl(g, 0.03, 0.035, 1.0, 0.2, 0.5, 1.88, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, order, "service-order");
    const logBoard = decal(g, 0.46, 0.34, 1.6, 1.2, 1.6, paperFace("SERVICE LOG", ["Net: —", "Catch: —", "Tags: —", "Remarks: —"], { bg: "#f4ecdc", band: "#6b7178" }), { px: 256 });
    logBoard.rotation.y = -0.4;
    cyl(g, 0.03, 0.035, 1.0, 1.6, 0.5, 1.58, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    reg(hits, logBoard, "service-log");
    const radioPost = group(g, -0.6, 0, 2.3);
    box(radioPost, 0.08, 0.95, 0.08, 0, 0.47, 0, 0x3a3f45, { rough: 0.6, metal: 0.4 });
    const radioBody = box(radioPost, 0.07, 0.2, 0.05, 0, 1.05, 0.03, 0x1b1e22, { rough: 0.5 });
    holoTag(radioPost, "crew radio", 0, 1.3, 0, { css: "#e0a040", w: 0.24 });
    reg(hits, radioBody, "crew-radio");

    const crewTruck = pickup(g, 6.5, 0, -0.8, { ry: Math.PI, livery: { fleetName: "OUTFALL CREW", unitNumber: "SW-4" } });
    void crewTruck;
    holoTag(g, "service crew pickup", 6.5, 2.4, -0.8, { css: "#e0a040", w: 0.34 });
    const hand = standingFigure(g, 4.4, 0.4, { ry: -2.2, cloth: 0x3f4a55, vest: 0xf2c14b, helmet: 0xf2f2ee, gloves: true });
    holoTag(hand, "second hand", 0, 1.95, 0, { css: "#e0a040", w: 0.24 });
    const handHome = hand.position.clone();

    const waterTex = water.material.map;
    let lifted = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 0.8, -2.8),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "pre-lift") eye.material = mat(0xf2c14b, { rough: 0.6 });
        if (step.id === "outrigger-pad") { pad.position.set(-3.3, 0.03, 0.9); markRing.material = mat(0x59c97b, { emissive: 0x59c97b, ei: 1.2 }); }
        if (step.id === "open-clamp") { clampHandle.rotation.z = Math.PI / 2; lifted = true; }
        if (step.id === "tag-lift") { bag.position.set(2.8, 1.9, -1.6); bag.rotation.y = -Math.PI / 2; }
        if (step.id === "empty-bag") { catchPile.visible = true; bagBody.scale.set(0.6, 0.6, 0.6); }
        if (step.id === "fresh-net") { freshOnFrame.visible = true; spare.visible = false; bag.visible = false; }
        if (step.id === "catch-estimate") repaint(scale, (cx, w, h) => { cx.fillStyle = "#f2f2ee"; cx.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { cx.fillStyle = "#1b1e22"; cx.fillRect(0, (i * h) / 5, w, 4); } cx.fillStyle = "#59c97b"; cx.fillRect(0, h * 0.62, w, h * 0.38); });
        if (step.id === "outfall-walk") { litter.visible = false; sling.material = mat(0xd2312b, { rough: 0.6 }); }
        if (step.id === "service-log") repaint(logBoard, paperFace("SERVICE LOG", ["Net: seam torn · replaced · pinned", "Catch: estimated · photo taken", "Tags: lifting eye · bridle", "Gust stop · sharps contained"], { bg: "#f4ecdc", band: "#59c97b" }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "gust-swing") { bag.rotation.z = 0.5; bag.position.x = bagHome.x + 1.2; hand.position.x = handHome.x - 0.2; }
        if (it.id === "sharps-spill") needles.visible = true;
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "gust-swing") { bag.rotation.z = 0; bag.position.x = bagHome.x + 0.4; hand.position.x = handHome.x + 0.3; }
        if (it.id === "sharps-spill") { needles.visible = false; sharpsBox.material = mat(0xf2c14b, { rough: 0.5 }); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        if (waterTex?.offset) { waterTex.offset.x = t * 0.006; waterTex.offset.y = -t * 0.003; }
        if (session?.turn && step?.id === "open-clamp") clamp.rotation.z = session.turn.amount * Math.PI * 2;
        if (step?.id === "tag-lift" && lifted) {
          const v = session.track?.v ?? 0.5;
          bag.position.y = bagHome.y + 0.6 + Math.sin(t * 1.2) * 0.05;
          bag.rotation.y = (0.5 - v) * 0.8;
          house.rotation.y = -0.35 - v * 0.2;
        }
        void dt;
      },
    };
  },
};
