import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, torus, hose, group, decal, repaint, signFace, paperFace, mat } from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, instrument, lockTag,
  standingFigure, reg, surfaceTexture, texturedMat, pavingFace, paintedSteelFace,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Battery Storage Container Commissioning VR — Energy & Power,
// the energy transition block.
//
// A lithium-ion battery energy storage container on its pad, doors open,
// racks of modules inside, the power conversion skid and its DC disconnect
// beside it, the gas detection, exhaust and deflagration vent panel on the
// container's end wall. The learner is the IBEW inside wireman on the
// commissioning crew bringing it from delivered to first charge, with the
// commissioning agent on the radio and a crew mate at the skid. The site and
// the equipment are generic; no maker's product is named.

const BSC_ACCENT = 0x9fd84f;
const BSC_CSS = "#9fd84f";

export const SIM_BATTERY_STORAGE_CONTAINER_COMMISSIONING = {
  id: "battery-storage-container-commissioning",
  index: "317",
  domain: "Energy & Power",
  trade: "IBEW inside wireman on a battery storage commissioning crew, with the commissioning agent on the radio",
  category: "Energy & Power",
  weather: "clear",
  certification: "IBEW/NECA JATC training; NFPA 855 stationary energy storage systems, including commissioning, gas detection and explosion control, with NFPA 69 for the exhaust interlock; NFPA 70 (NEC) for the energy storage wiring; NFPA 70E for DC shock and arc-flash work practices; NETA acceptance testing for the insulation and torque checks; OSHA 29 CFR 1910.147 lockout and 29 CFR 1910.333 verification of de-energisation",
  name: "Battery Storage Container Commissioning",
  title: simTitle("Battery Storage Container Commissioning"),
  tagline: "A battery container from delivered to first charge: the commissioning plan read, a swollen module found on the walkdown, the gas detection and exhaust interlock proven, gloves air-tested and the hood on, the DC disconnect locked out, zero volts proven while the off-gas detector alarms, the bus links torqued, the insulation tested, a missing finger-safe cover found, the HVAC and BMS confirmed, the first charge ramped while a cell group runs hot, the connections scanned, and the container logged",
  accent: BSC_ACCENT,
  accentCss: BSC_CSS,
  parSeconds: 300,
  footprint: 2.6,
  badge: { id: "commissioned-by-the-plan", name: "Commissioned By The Plan", note: "Never inside in alarm, zero volts proven before a tool touched the bus, the off-gas and the hot cell both answered, and every connection scanned under load" },

  supportLine: "your IBEW local's member assistance programme, or the employee assistance line on the contractor's site board",

  game: system({
    name: "Storage Commissioning",
    currency: "KWH",
    ranks: ["Apprentice", "Wireman", "Commissioning Tech", "Lead Commissioning Tech", "Storage Commissioning Certified"],
    badges: [
      { id: "live-dead-live", name: "Live, Dead, Live", note: "Zero volts proven on the DC bus with the meter checked either side", test: AWARD.stepClean("zero-voltage") },
      { id: "gentle-first-charge", name: "Gentle First Charge", note: "The first charge ramped inside the band throughout", test: AWARD.unbroken },
      { id: "never-in-alarm", name: "Never In Alarm", note: "Never inside in alarm, never a bare hand on the bus, never a blocked vent, never square to the handle", test: AWARD.safe },
    ],
    challenges: [
      { id: "clean-commissioning", name: "Clean Commissioning", note: "No corrections anywhere in the commissioning", test: AWARD.clean },
      { id: "interlock-on-the-mark", name: "Interlock On The Mark", note: "Exhaust setpoint committed inside the band first time", test: AWARD.precise(0.7) },
      { id: "online-on-time", name: "Online On Time", note: "Container logged inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "enter-in-alarm": "You stepped into the container before its gas detection and exhaust had been proven. A lithium-ion container is a closed box full of cells that can vent flammable gas without warning, and its detection and exhaust are what keep that gas from building to a deflagration — until they are proven, nobody can say the air inside is safe, and a person inside is the one thing that turns a vent event into an injury. The door is worked from, not walked through, until the interlock test is done.",
    "bare-hand-busbar": "You reached toward the rack's busbar with bare hands. A battery string cannot be switched off — every module is live at its terminals whatever the disconnect says — and DC at that voltage holds on to a hand rather than throwing it off. Work near the bus is done in air-tested rubber gloves with protectors and insulated tools, as NFPA 70E expects for exposed energised parts.",
    "vent-panel-blocked": "You stacked the module packaging against the container's deflagration vent panel. That panel is there to open and relieve a gas ignition inside the container in a direction that was designed for it; blocked with cardboard, it opens late, or the pressure finds the doors instead — which is where the people are. NFPA 855 has explosion control designed in, and it only works if the vent is clear.",
    "face-of-disconnect": "You squared up in front of the DC disconnect to operate its handle. Operating a switch under load is when an internal failure arcs, and the arc flash comes out of the cabinet's face. The practice NFPA 70E teaches is to stand to the side of the handle, face turned away, operating it with the hand nearest — never square to the door.",
  },

  lateNotes: {
    "bus-link-bolt": "The bus links are torqued once zero volts has been proven on the DC bus — nothing is touched before that.",
    "pcs-ramp": "The first charge starts once the HVAC is running and the BMS and suppression are both confirmed.",
    "commissioning-log": "The container is logged once the thermal scan under load is done — the log is last.",
  },

  steps: [
    {
      id: "comm-plan", kind: "select", target: "commissioning-plan",
      title: "Read the commissioning plan and the emergency response plan",
      cue: "Read the plan: the test sequence, the gas detection and exhaust setpoints, the DC isolation points, the acceptance figures, and what the emergency response plan says to do if a cell vents.",
      why: "A battery container is commissioned in a fixed order because each test depends on the one before: nothing is energised until detection is proven, nothing is torqued until zero volts is proven, nothing is charged until the thermal management is running. NFPA 855 expects a commissioning plan and an emergency response plan written with the fire service, and the one moment to learn what the crew does if a cell vents is before the doors open — not while the detector is sounding.",
    },
    {
      id: "receiving-walk", kind: "find", noHint: true,
      targets: ["swollen-module"],
      itemNames: { "swollen-module": "swollen module in rack two, second from the top" },
      itemNotes: { "swollen-module": "Rack two's second module has a bulged case and its lid seam has lifted — a cell inside has swollen, likely damaged in shipping. It is not connected: it is isolated, tagged, and replaced before the rack is commissioned." },
      title: "Walk down the racks for shipping damage",
      cue: "From the doorway, look over every rack: dented or swollen module cases, lifted lids, scorching, loose or missing hardware, anything that moved in transit.",
      why: "Lithium-ion cells damaged in transit do not always fail straight away — a crushed or swollen cell can sit quietly until it is charged, and then it is the start of a thermal event. The receiving walkdown is done before anything is connected, from the doorway, looking for the signs a damaged module gives: a swollen case, a lifted seam, a scorch mark. A module that shows them is isolated and replaced, not connected and watched.",
    },
    {
      id: "gas-interlock", kind: "gauge", target: "gas-detector",
      title: "Prove the gas detection trips the exhaust at its setpoint",
      cue: "Flow the test gas at the detector and commit the reading at which the exhaust fan starts and the alarm sounds, against the design's setpoint.",
      why: "Cells in thermal runaway vent a flammable mix that can reach its explosive range inside a closed container in minutes, and the defence NFPA 855 designs in — using NFPA 69's approach — is gas detection that starts the exhaust long before the lower flammable limit is approached. The interlock is proven with test gas, reading the level at which the fan actually starts, before anyone relies on it — a detector wired to nothing looks exactly like one that works.",
      gauge: { label: "LFL %", speed: 0.6, green: [0.06, 0.2], readout: (t) => `${Math.round(t * 100)}% LFL`, missNote: "Not the trip point — commit the reading at the moment the exhaust fan starts, not before the detector responds or after it has overshot." },
    },
    {
      id: "ppe-seq", kind: "sequence",
      targets: ["glove-air-test", "arc-hood"],
      itemNames: { "glove-air-test": "rubber gloves air-tested, protectors on", "arc-hood": "arc-rated hood and face shield on" },
      outOfOrderNote: "Gloves are air-tested before they go on — a pinhole found after the hood is down is found with a hand already near the bus.",
      title: "Air-test the rubber gloves, then the arc-rated hood",
      cue: "Roll and inflate each rubber glove to check for pinholes, put the leather protectors on, then the arc-rated hood rated for the label's incident energy.",
      why: "The rubber gloves are the only thing between a hand and a live DC terminal, and a pinhole in one is invisible until it is inflated — so each glove is air-tested before every use, and the leather protectors go over them because a scuffed rubber glove is a failed rubber glove. The arc-rated hood goes on for the disconnect and the bus work, rated for the incident energy on the equipment's label, because DC arcs are sustained rather than self-extinguishing.",
    },
    {
      id: "lockout", kind: "drag", target: "dc-lock",
      title: "Lock out the DC disconnect",
      cue: "Standing to the side, open the DC disconnect, then hang your personal lock and tag on its hasp.",
      why: "The DC disconnect separates the battery string from the power conversion skid, and locking it open with a personal lock is what keeps the skid from back-feeding or someone closing it while the crew is on the bus. 29 CFR 1910.147 puts the lock in the hand of the person exposed — and the crew still treats the racks themselves as live, because a battery cannot be locked out at its terminals.",
      drag: { to: "disconnect-hasp", radius: 0.5, missNote: "Not on the hasp — your lock goes through the disconnect's own lockout hasp with the handle open, not on the cabinet door." },
    },
    {
      id: "zero-voltage", kind: "hold", target: "dc-meter", seconds: 5,
      title: "Prove zero volts on the DC bus: live, dead, live",
      cue: "Check the meter on the known live source, test the load side of the disconnect pole to pole and to ground, then check the meter on the live source again — hold the probes until each reading settles.",
      why: "A disconnect that looks open can have a welded contact, and a meter that reads zero can have a broken lead — so the test is live-dead-live: the meter proven on a known live source, the circuit tested, the meter proven again. 29 CFR 1910.333 has the absence of voltage verified before work, and the probes are held long enough at each point for a DC reading to settle, because a quick touch on a capacitive circuit can read low.",
      holdBreakNote: "Lifted the probes before the reading settled — a DC circuit with capacitance can read low on a quick touch. Hold them on until the number is steady.",
    },
    {
      id: "bus-torque", kind: "turn", target: "bus-link-bolt",
      title: "Torque the rack bus links with the insulated wrench",
      cue: "With the insulated torque wrench, run each inter-rack bus link bolt to the maker's figure, and mark each one with the torque pen.",
      why: "A bus link bolted short of its figure is a high-resistance joint that heats under charge current, and heat at a battery connection is a thermal event starting outside the cell. Each bolt is taken to the maker's figure with an insulated wrench — the racks are live whatever the disconnect says — and marked, because a NETA-style acceptance check asks for every joint torqued and verified, and a paint mark is how the next person knows this one was.",
      turn: { turns: 1.0, label: "BUS LINKS", readout: (t) => (t < 0.35 ? "snugged" : t < 0.9 ? "pulling up" : "at figure — marked") },
    },
    {
      id: "insulation", kind: "gauge", target: "insulation-tester",
      title: "Test the DC string's insulation resistance to ground",
      cue: "Apply the insulation tester's DC test voltage from the string to ground and commit the reading once it stabilises against the acceptance minimum.",
      why: "Insulation resistance to ground is the check that nothing in the string — a pinched cable, a cracked insulator, moisture in a connector — has a path to the rack frame, which is where a ground fault would put the next person's hand. NETA acceptance testing gives minimum values, and the reading is taken once it stabilises because insulation charges up under the test voltage and reads low for the first seconds.",
      gauge: { label: "INSULATION", speed: 0.6, green: [0.62, 0.9], readout: (t) => `${Math.round(t * 1000)} MΩ`, missNote: "Not a stable reading above the minimum — let the insulation charge under the test voltage before committing." },
    },
    {
      id: "cover-find", kind: "find", noHint: true,
      targets: ["missing-cover"],
      itemNames: { "missing-cover": "missing finger-safe cover on rack three's positive terminal" },
      itemNotes: { "missing-cover": "Rack three's main positive terminal is bare — its finger-safe cover was left off after the bus link was torqued. It goes back on before the string is energised, because the next person reaching into the rack will not expect a live terminal there." },
      title: "Check every terminal cover is back on",
      cue: "Look over each rack's terminals and bus links: finger-safe covers fitted, nothing left bare, no tools or hardware left in the rack.",
      why: "The finger-safe covers on a rack's terminals are what make a live battery safe to stand beside after commissioning, and they come off for the torque work — which is exactly why one gets left off. The racks are looked over after the tools are out and before the string is energised, for bare terminals and for anything left behind, because a washer dropped across a busbar is a short circuit waiting for the first charge.",
    },
    {
      id: "hvac", kind: "select", target: "hvac-unit",
      title: "Confirm the HVAC is running and the container is in range",
      cue: "Check the container's HVAC is running, the temperature is inside the battery maker's range, and the unit's alarms are clear.",
      why: "Lithium-ion cells age, lose capacity and become less stable when they are charged hot, and the container's HVAC is what holds them in the maker's temperature window through a first charge that makes heat of its own. It is confirmed running and in range before any current flows, because a thermal management system discovered to be off during the first charge is discovered by the BMS's temperature alarms.",
    },
    {
      id: "bms-suppress", kind: "sequence", anyOrder: true,
      targets: ["bms-screen", "suppression-panel"],
      itemNames: { "bms-screen": "BMS online, no faults, cell voltages balanced", "suppression-panel": "fire detection and suppression armed" },
      title: "Confirm the BMS and the fire suppression are both ready",
      cue: "Check the battery management system shows every module online with no faults and the cell voltages balanced, and the fire detection and suppression panel shows armed and normal.",
      why: "The battery management system is the only thing watching every cell's voltage and temperature, and it is what trips the string when one goes wrong — a module offline on the BMS is a module nobody is watching. The fire detection and suppression panel is the other half of NFPA 855's protection, and it is confirmed armed before the first charge rather than assumed, because it is commonly left disabled during installation.",
    },
    {
      id: "first-charge", kind: "track", target: "pcs-ramp", seconds: 6,
      title: "Ramp the first charge slowly at the power conversion skid",
      cue: "On the commissioning agent's call, ramp the charge current up slowly at the skid and hold it inside the plan's band, watching the BMS temperatures.",
      why: "The first charge is the string's first real load, and it is ramped slowly because it is the moment a hidden defect shows itself — a weak joint heats, a damaged cell's temperature climbs ahead of its neighbours — and a slow ramp gives the BMS and the crew time to see it before the current is high. The current is held inside the plan's band rather than pushed to rating, because the purpose today is to find problems, not to fill the battery.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.46, drift: 0.12, label: "CHARGE CURRENT", readout: (v) => (v < 0.4 ? "under the plan's current" : v > 0.6 ? "too fast for a first charge" : "on the plan") },
      holdBreakNote: "The charge current ran out of the plan's band — ease it back and hold it steady while the temperatures settle.",
    },
    {
      id: "thermal-scan", kind: "hold", target: "ir-camera", seconds: 4,
      title: "Scan the bus connections with the thermal camera under load",
      cue: "From the doorway, hold the thermal camera on each rack's bus links and terminals under charge current, looking for any joint hotter than its neighbours.",
      why: "A connection that was torqued short, or has a burr under its washer, shows itself under load as a joint warmer than the identical ones around it — long before it fails. The thermal scan is done under charge current, from the doorway, and held on each rack long enough to compare like with like, because a hot joint is a comparison, not an absolute number.",
      holdBreakNote: "Moved the camera on before each rack's joints were compared — a hot joint only shows against its neighbours. Scan them again.",
    },
    {
      id: "comm-log", kind: "select", target: "commissioning-log",
      title: "Log the commissioning results and the findings",
      cue: "Record the interlock setpoint, zero-volt verification, torque, insulation readings, the swollen module replaced, the cover refitted, the hot cell trip and the thermal scan.",
      why: "The commissioning record is what the owner, the fire marshal and the next technician work from: it proves the detection and exhaust worked on the day, that the joints were torqued and the insulation tested, and it carries the findings — the swollen module, the missing cover, the cell group that ran hot on first charge — into the maintenance plan rather than into somebody's memory. NFPA 855 expects it kept.",
    },
    {
      id: "crew-checkin", kind: "select", target: "site-radio",
      title: "Check in with the commissioning agent and the crew",
      cue: "Call the commissioning agent: the container is logged, the hot cell group is under watch, and check in with your crew mate after the off-gas alarm.",
      why: "The commissioning agent decides whether the container goes into service or waits on the hot cell group, and that call is made from this one. It is also the crew's own check-in: an off-gas alarm with a door open and a cell running hot on first charge are both moments that stay with the people who were beside the container, and the IBEW's practice is to talk them through before the crew leaves the pad — with the member assistance line named for anyone who wants it.",
    },
  ],

  interrupts: [
    {
      id: "off-gas-alarm",
      kind: "Off-gas detector alarming",
      after: "zero-voltage", delay: 2, seconds: 12,
      alert: "The container's off-gas detector has gone into alarm and the strobe over the door is flashing — something inside is venting.",
      cue: "Close the container door and withdraw to the plan's standoff — nobody goes in, and the call goes from outside.",
      target: "container-door",
      why: "An off-gas alarm means a cell may be venting flammable gas into the container, and the emergency response plan's first rule is the one the fire service teaches: do not enter, and do not stand in the open doorway, because an ignition inside comes out through the easiest opening. The door is closed so the exhaust and the vent panel do their designed job, and the crew withdraws to the standoff before anything else is decided.",
      missNote: "The crew stayed in the open doorway with the detector in alarm; when the gas cloud reached the exhaust fan the pressure pulse came out of the door, not the vent panel, and knocked the crew mate off the pad steps.",
      wrongNote: "The container door — the gas is inside, and closing the door and backing off is the only thing that keeps an ignition away from the crew.",
    },
    {
      id: "cell-group-hot",
      kind: "Cell group running hot",
      after: "first-charge", delay: 2, seconds: 12,
      alert: "The BMS shows one cell group in rack two climbing several degrees above its neighbours and still rising under charge.",
      cue: "Hit the system emergency stop — the charge stops and the string opens before anything else.",
      target: "ess-estop",
      why: "A cell group climbing ahead of its neighbours under charge is the early sign of a cell heading for thermal runaway, and heat is removed fastest by removing the current that is making it. The system emergency stop drops the power conversion skid and opens the string at once, which the charge ramp's own control does not do; the investigation happens after the current is gone, not while it is still flowing.",
      missNote: "The charge kept ramping while the cell group climbed; the BMS tripped the string on over-temperature a minute later, by which time the group's modules had to be replaced and the container waited a month for the investigation.",
      wrongNote: "The system emergency stop — the charge current is what is heating the cell group, and the emergency stop is the one control that removes it at once.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BSC_ACCENT);

    // ------------------------------------------------------------ the pad
    const pad = box(g, 6.4, 0.12, 5.0, 0, 0.06, 0, 0xffffff, { rough: 0.9 });
    pad.material = texturedMat(surfaceTexture((cx, w, h) => pavingFace(cx, w, h, { tiles: 3, base: "#8a8a84", base2: "#7e7e78", seam: "rgba(0,0,0,0.25)" }), { repeat: 4, px: 512 }), { rough: 0.9, metal: 0.02, color: 0xd8d8d0 });
    for (const [x, z] of [[-3.0, -2.4], [3.0, -2.4], [-3.0, 2.4], [3.0, 2.4]]) cyl(g, 0.06, 0.06, 0.9, x, 0.57, z, 0xe8b02e, { rough: 0.6, seg: 10 });

    // ------------------------------------------------------ the container
    const cont = group(g, -0.2, 0.12, -1.35);
    const CL = 3.8, CH = 1.9, CD = 1.5;
    const steelTex = surfaceTexture((cx, w, h) => paintedSteelFace(cx, w, h, { base: "#e8ece8", base2: "#dfe4df", cols: 6, rows: 1 }), { repeat: 1, px: 512 });
    const wallMat = texturedMat(steelTex, { rough: 0.6, metal: 0.3, color: 0xffffff });
    const back = box(cont, CL, CH, 0.06, 0, CH / 2, -CD / 2, 0xffffff);
    back.material = wallMat;
    const roof = box(cont, CL, 0.06, CD, 0, CH, 0, 0xdfe4df, { rough: 0.6, metal: 0.3 });
    void roof;
    box(cont, CL, 0.06, CD, 0, 0.03, 0, 0x5a5f64, { rough: 0.8, metal: 0.3 });
    const endL = box(cont, 0.06, CH, CD, -CL / 2, CH / 2, 0, 0xffffff);
    endL.material = wallMat;
    const endR = box(cont, 0.06, CH, CD, CL / 2, CH / 2, 0, 0xffffff);
    endR.material = wallMat;
    // Front wall with the door opening in the middle.
    for (const sx of [-1, 1]) {
      const fw = box(cont, 1.0, CH, 0.06, sx * (CL / 2 - 0.5), CH / 2, CD / 2, 0xffffff);
      fw.material = wallMat;
    }
    box(cont, 1.8, 0.2, 0.06, 0, CH - 0.1, CD / 2, 0xe8ece8, { rough: 0.6, metal: 0.3 });
    // Door leaves swung open on their hinges.
    const doorL = group(cont, -0.9, 0, CD / 2);
    const leafL = box(doorL, 0.9, CH - 0.2, 0.05, 0.45, (CH - 0.2) / 2, 0, 0xdfe4df, { rough: 0.6, metal: 0.3 });
    doorL.rotation.y = -1.4;
    const doorR = group(cont, 0.9, 0, CD / 2);
    box(doorR, 0.9, CH - 0.2, 0.05, -0.45, (CH - 0.2) / 2, 0, 0xdfe4df, { rough: 0.6, metal: 0.3 });
    doorR.rotation.y = 1.4;
    holoTag(cont, "container door", -1.1, CH + 0.2, CD / 2 + 0.5, { css: BSC_CSS, w: 0.3 });
    reg(hits, leafL, "container-door");
    const threshold = box(cont, 1.6, 0.1, 0.4, 0, 0.1, CD / 2 - 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(cont, "walk in before the interlock test?", 0.2, 0.55, CD / 2 + 0.1, { css: "#d2312b", w: 0.62 });
    reg(hits, threshold, "enter-in-alarm");
    // Racks of modules inside along the back wall.
    const racks = [];
    for (let r = 0; r < 3; r++) {
      const rack = group(cont, -1.2 + r * 1.2, 0.06, -CD / 2 + 0.3);
      box(rack, 0.9, 1.6, 0.04, 0, 0.8, -0.2, 0x2b2b30, { rough: 0.6, metal: 0.4 });
      for (const sx of [-1, 1]) box(rack, 0.04, 1.6, 0.4, sx * 0.45, 0.8, 0, 0x2b2b30, { rough: 0.6, metal: 0.4 });
      const mods = [];
      for (let i = 0; i < 6; i++) mods.push(box(rack, 0.82, 0.22, 0.36, 0, 0.18 + i * 0.25, 0, 0x5a6470, { rough: 0.5, metal: 0.4 }));
      const busbar = box(rack, 0.04, 1.5, 0.02, 0.36, 0.85, 0.19, 0xc87a3a, { rough: 0.3, metal: 0.9 });
      racks.push({ rack, mods, busbar });
    }
    const swollen = racks[1].mods[4];
    swollen.scale.set(1.0, 1.25, 1.12);
    reg(hits, swollen, "swollen-module");
    const hotMod = racks[1].mods[2];
    const bareHit = box(racks[0].rack, 0.12, 0.4, 0.08, 0.36, 0.9, 0.24, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(racks[0].rack, "bare hand on the bus?", 0.1, 1.85, 0.3, { css: "#d2312b", w: 0.44 });
    reg(hits, bareHit, "bare-hand-busbar");
    const bareTerm = box(racks[2].rack, 0.06, 0.05, 0.05, 0.36, 1.62, 0.22, 0xc87a3a, { rough: 0.3, metal: 0.9 });
    reg(hits, bareTerm, "missing-cover");
    const coverFit = box(racks[2].rack, 0.08, 0.07, 0.07, 0.36, 1.62, 0.22, 0x14171a, { rough: 0.6 });
    coverFit.visible = false;
    const links = group(racks[1].rack, -0.6, 1.0, 0.2);
    box(links, 0.34, 0.03, 0.02, 0, 0, 0, 0xc87a3a, { rough: 0.3, metal: 0.9 });
    for (const x of [-0.14, 0.14]) cyl(links, 0.015, 0.015, 0.03, x, 0, 0.015, 0xc0c6cc, { rough: 0.3, metal: 0.9, seg: 6 }).rotation.x = Math.PI / 2;
    const wrench = group(links, 0.14, -0.06, 0.05);
    box(wrench, 0.03, 0.22, 0.03, 0, -0.1, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(links, "bus links — torque", 0, 0.3, 0.1, { css: BSC_CSS, w: 0.36 });
    reg(hits, links, "bus-link-bolt");
    // End wall: HVAC, gas detector, exhaust fan and the deflagration vent.
    const hvac = group(cont, CL / 2 + 0.03, 1.1, 0);
    box(hvac, 0.28, 0.7, 0.9, 0.14, 0, 0, 0xc8ccd0, { rough: 0.5, metal: 0.3 });
    for (let i = 0; i < 5; i++) box(hvac, 0.01, 0.02, 0.8, 0.285, -0.25 + i * 0.12, 0, 0x6a7078, { rough: 0.5 });
    holoTag(hvac, "HVAC unit", 0.2, 0.55, 0, { css: BSC_CSS, w: 0.22 });
    reg(hits, hvac, "hvac-unit");
    const detector = instrument(cont, 0.95, 1.3, CD / 2 - 0.08, { ry: Math.PI, idle: "0% LFL", color: 0xf2c14b, w: 0.1, d: 0.14 });
    detector.rotation.x = Math.PI / 2;
    holoTag(cont, "gas detector", 1.05, 1.58, CD / 2 + 0.05, { css: BSC_CSS, w: 0.26 });
    reg(hits, detector, "gas-detector");
    const fanG = group(cont, -CL / 2 - 0.03, 1.5, 0.35);
    cyl(fanG, 0.2, 0.2, 0.08, -0.04, 0, 0, 0x2b2b30, { rough: 0.6, seg: 16 }).rotation.z = Math.PI / 2;
    const fanBlades = group(fanG, -0.09, 0, 0);
    for (let i = 0; i < 4; i++) box(fanBlades, 0.01, 0.16, 0.04, 0, 0, 0, 0xa8b0b8, { rough: 0.5, metal: 0.6 }).rotation.x = (i * Math.PI) / 2;
    const vent = box(cont, 0.02, 0.8, 0.6, -CL / 2 - 0.04, 0.8, -0.3, 0xe8b02e, { rough: 0.6, metal: 0.3 });
    decal(cont, 0.5, 0.2, -CL / 2 - 0.06, 0.8, -0.3, signFace("VENT PANEL", { bg: "#e8b02e", accent: "#111111", fg: "#111111", scale: 0.5 }), { px: 128 }).rotation.y = -Math.PI / 2;
    void vent;
    const boxes = group(g, -2.35, 0.12, -1.6);
    for (let i = 0; i < 3; i++) box(boxes, 0.45, 0.3, 0.4, 0, 0.15 + i * 0.3, (i % 2) * 0.05, 0xb88a52, { rough: 0.95 });
    holoTag(boxes, "stack packaging on the vent?", 0, 1.2, 0, { css: "#d2312b", w: 0.54 });
    reg(hits, boxes, "vent-panel-blocked");
    const beacon = ball(cont, 0.07, 0, CH + 0.1, CD / 2 - 0.05, 0x5a2a2a, { rough: 0.4 });
    const strobe = ball(cont, 0.1, 0, CH + 0.1, CD / 2 - 0.05, 0xf0645b, { emissive: 0xf0645b, ei: 3.0, opacity: 0.6 });
    strobe.visible = false;
    decal(cont, 0.6, 0.12, 0, CH - 0.1, CD / 2 + 0.035, signFace("ENERGY STORAGE — NO ENTRY IN ALARM", { bg: "#d2312b", accent: "#ffffff", fg: "#ffffff", scale: 0.4 }), { px: 256 });

    // ------------------------------------ PCS skid, disconnect, e-stop
    const skid = group(g, 2.55, 0.12, 0.35, -0.3);
    box(skid, 0.9, 1.3, 0.7, 0, 0.65, 0, 0x5a6470, { rough: 0.5, metal: 0.4 });
    for (let i = 0; i < 4; i++) box(skid, 0.02, 1.0, 0.6, 0.46, 0.65, -0.24 + i * 0.16, 0x3a4048, { rough: 0.5 });
    const pcs = instrument(skid, -0.2, 1.32, 0.1, { ry: 0, idle: "PCS 0 A", color: BSC_ACCENT, w: 0.12, d: 0.16 });
    holoTag(pcs, "PCS charge ramp — hold", 0, 0.18, 0, { css: BSC_CSS, w: 0.42 });
    reg(hits, pcs, "pcs-ramp");
    const pcsLamp = ball(skid, 0.04, 0.25, 1.35, 0.3, 0x3fae6a, { emissive: 0x3fae6a, ei: 1.6 });
    const disc = group(g, 1.9, 0.12, -0.2, -0.2);
    box(disc, 0.44, 0.6, 0.22, 0, 1.0, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    cyl(disc, 0.03, 0.03, 0.7, 0, 0.35, 0, 0x6a7078, { rough: 0.5, metal: 0.5, seg: 8 });
    const handle = group(disc, 0.24, 1.0, 0.0);
    box(handle, 0.04, 0.22, 0.05, 0, -0.06, 0, 0xd2312b, { rough: 0.5 });
    const hasp = torus(disc, 0.05, 0.01, 0.24, 0.84, 0.03, BSC_ACCENT, { emissive: BSC_ACCENT, ei: 1.6, rough: 0.4, cast: false, seg: 6, seg2: 14 });
    holoTag(disc, "DC disconnect hasp", 0.1, 1.5, 0, { css: BSC_CSS, w: 0.36 });
    reg(hits, hasp, "disconnect-hasp");
    const face = box(disc, 0.44, 0.1, 0.4, 0, 0.06, 0.4, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(disc, "stand square to the handle?", -0.1, 0.4, 0.5, { css: "#d2312b", w: 0.52 });
    reg(hits, face, "face-of-disconnect");
    const lock = lockTag(g, 1.2, 0.95, 0.4, { color: 0x1f7ae0 });
    holoTag(g, "your lock + tag", 1.2, 1.25, 0.4, { css: BSC_CSS, w: 0.3 });
    reg(hits, lock, "dc-lock");
    const estop = group(g, 0.9, 0.12, -0.35);
    cyl(estop, 0.03, 0.03, 1.1, 0, 0.55, 0, 0xe8b02e, { rough: 0.5, metal: 0.4, seg: 8 });
    box(estop, 0.16, 0.16, 0.1, 0, 1.12, 0, 0xe8b02e, { rough: 0.5 });
    const mush = cyl(estop, 0.05, 0.05, 0.04, 0, 1.12, 0.07, 0xd2312b, { rough: 0.4, seg: 16 });
    mush.rotation.x = Math.PI / 2;
    holoTag(estop, "system E-stop", 0, 1.4, 0, { css: BSC_CSS, w: 0.28 });
    reg(hits, estop, "ess-estop");
    hose(g, [[1.9, 0.9, -0.2], [2.2, 0.3, 0.0], [2.5, 0.3, 0.3]], 0.03, 0x14171a, { steps: 8 });
    hose(g, [[1.7, 0.9, -0.3], [1.4, 0.2, -0.6], [1.2, 0.2, -0.65]], 0.03, 0xd2312b, { steps: 8 });

    // --------------------------------------------- panels beside the door
    const bms = holoPanel(g, 0.42, 0.3, -1.6, 1.4, -0.45, (cx, w, h) => {
      cx.fillStyle = "#0b1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = BSC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.14)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f8d0"; cx.fillText("BMS", w * 0.06, h * 0.2);
      cx.font = `${Math.round(h * 0.11)}px Arial, sans-serif`; cx.fillStyle = "#eefae0";
      ["Modules: 18 / 18 online", "Cell ΔV: balanced", "Faults: none"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.44 + i * 0.18)));
    }, { ry: 0.3, accent: BSC_ACCENT });
    reg(hits, bms, "bms-screen");
    const supp = group(g, -2.25, 0.12, -0.35, 0.4);
    box(supp, 0.32, 0.42, 0.1, 0, 1.2, 0, 0xd2312b, { rough: 0.5 });
    cyl(supp, 0.02, 0.02, 1.0, 0, 0.5, 0, 0x8a949d, { rough: 0.5, metal: 0.6, seg: 8 });
    decal(supp, 0.26, 0.1, 0, 1.3, 0.055, signFace("SUPPRESSION", { bg: "#d2312b", accent: "#ffffff", fg: "#ffffff", scale: 0.45 }), { px: 128 });
    const armed = ball(supp, 0.025, 0, 1.1, 0.06, 0xf2c14b, { emissive: 0xf2c14b, ei: 1.2 });
    holoTag(supp, "fire suppression panel", 0, 1.6, 0, { css: BSC_CSS, w: 0.42 });
    reg(hits, supp, "suppression-panel");

    // --------------------------------------------- tools, PPE and paper
    const chest = toolChest(g, -0.6, 1.3, { ry: 0.1, color: 0x2f4f6f });
    const meter = instrument(chest, -0.16, 0.79, 0.02, { ry: 0.2, idle: "--- V DC", color: 0xf2c14b, w: 0.11, d: 0.17 });
    holoTag(meter, "DC meter — hold", 0, 0.16, 0, { css: BSC_CSS, w: 0.3 });
    reg(hits, meter, "dc-meter");
    const megger = instrument(chest, 0.02, 0.79, 0.04, { ry: 0.0, idle: "-- MΩ", color: 0xd2312b, w: 0.11, d: 0.17 });
    holoTag(megger, "insulation tester", 0, 0.3, 0, { css: BSC_CSS, w: 0.32 });
    reg(hits, megger, "insulation-tester");
    const cam = group(chest, 0.2, 0.8, 0.0);
    box(cam, 0.08, 0.14, 0.06, 0, 0.07, 0, 0x14171a, { rough: 0.5 });
    box(cam, 0.08, 0.06, 0.12, 0, 0.16, 0.03, 0x2b2b30, { rough: 0.5 });
    holoTag(cam, "thermal camera — hold", 0, 0.36, 0, { css: BSC_CSS, w: 0.4 });
    reg(hits, cam, "ir-camera");
    const radio = instrument(g, 0.5, 0.95, 2.1, { ry: 0.1, idle: "CH 7 · CX AGENT", color: BSC_ACCENT, w: 0.1, d: 0.16 });
    box(g, 0.3, 0.8, 0.3, 0.5, 0.52, 2.1, 0x2b3138, { rough: 0.6 });
    holoTag(radio, "site radio", 0, 0.16, 0, { css: BSC_CSS, w: 0.22 });
    reg(hits, radio, "site-radio");
    const rack = group(g, -2.7, 0.12, 1.4, 0.5);
    cyl(rack, 0.02, 0.02, 1.4, 0, 0.7, 0, 0x8a949d, { rough: 0.45, metal: 0.7, seg: 8 });
    box(rack, 0.6, 0.03, 0.03, 0, 1.35, 0, 0x8a949d, { rough: 0.45, metal: 0.7 });
    const gloves = group(rack, -0.16, 1.1, 0.02);
    box(gloves, 0.1, 0.24, 0.04, 0, 0, 0, 0xd2312b, { rough: 0.7 });
    box(gloves, 0.1, 0.24, 0.04, 0.05, -0.02, 0.02, 0x8a5a2a, { rough: 0.9 });
    holoTag(rack, "rubber gloves — air test", -0.2, 1.6, 0, { css: BSC_CSS, w: 0.44 });
    reg(hits, gloves, "glove-air-test");
    const hood = group(rack, 0.2, 1.1, 0.02);
    box(hood, 0.22, 0.34, 0.14, 0, 0, 0, 0x5a6a3a, { rough: 0.8 });
    box(hood, 0.16, 0.1, 0.02, 0, 0.06, 0.08, 0x3a4a5a, { rough: 0.2, metal: 0.3 });
    holoTag(rack, "arc-rated hood", 0.24, 1.45, 0, { css: BSC_CSS, w: 0.3 });
    reg(hits, hood, "arc-hood");
    const plan = holoPanel(g, 0.95, 0.66, -2.3, 1.45, 0.5, (cx, w, h) => {
      cx.fillStyle = "#0b1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = BSC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.1)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f8d0"; cx.fillText("COMMISSIONING PLAN — ESS CONTAINER 1", w * 0.05, h * 0.12);
      cx.font = `${Math.round(h * 0.066)}px Arial, sans-serif`; cx.fillStyle = "#f2fbe8";
      ["1 Walkdown · 2 gas detection + exhaust interlock", "3 DC isolation + zero volts · 4 torque + insulation", "5 HVAC · BMS · suppression armed", "6 First charge: slow ramp, plan's current band",
       "ERP: off-gas alarm = door shut, withdraw, call", "Never inside with detection in alarm"].forEach((l, i) => cx.fillText(l, w * 0.05, h * (0.27 + i * 0.12)));
    }, { ry: 0.9, accent: BSC_ACCENT });
    reg(hits, plan, "commissioning-plan");
    const log = holoPanel(g, 0.6, 0.42, 2.2, 1.35, 1.9, (cx, w, h) => {
      cx.fillStyle = "#0b1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = BSC_CSS; cx.fillRect(0, 0, w, 6);
      cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillStyle = "#e8f8d0"; cx.fillText("COMMISSIONING RECORD", w * 0.06, h * 0.16);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; cx.fillStyle = "#f2fbe8";
      ["Tests: —", "Findings: —", "Status: NOT IN SERVICE"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
    }, { ry: -0.6, accent: BSC_ACCENT });
    reg(hits, log, "commissioning-log");
    const paper = decal(g, 0.2, 0.26, 1.2, 0.125, 1.5, paperFace("MODULE HOLD", ["rack 2", "swollen"], { bg: "#f2e0a0", band: "#d2312b" }), { px: 128 });
    paper.rotation.x = -Math.PI / 2;
    paper.visible = false;

    // ------------------------------------------------------------- crew
    const mate = standingFigure(g, 1.25, 1.2, { ry: -2.2, cloth: 0x2b3138, vest: 0xd8f23a, helmet: 0xf2f2f2, gloves: true });
    holoTag(mate, "crew mate", 0, 1.95, 0, { css: BSC_CSS, w: 0.22 });

    let alarm = false;
    let charging = true;

    return {
      hits,
      spawnLook: new THREE.Vector3(-0.2, 1.0, -1.2),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "receiving-walk") { swollen.material = mat(0xd2312b, { emissive: 0x6a1a08, ei: 0.8, rough: 0.5 }); paper.visible = true; }
        if (step.id === "gas-interlock") repaint(detector.userData.screen, signFace("INTERLOCK OK", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
        if (step.id === "lockout") handle.rotation.z = -1.2;
        if (step.id === "zero-voltage") repaint(meter.userData.screen, signFace("0.0 V DC", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.55 }));
        if (step.id === "insulation") repaint(megger.userData.screen, signFace("PASS", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.6 }));
        if (step.id === "cover-find") { bareTerm.visible = false; coverFit.visible = true; }
        if (step.id === "bms-suppress") armed.material = mat(0x3fae6a, { emissive: 0x3fae6a, ei: 1.6 });
        if (step.id === "comm-log") {
          repaint(log.userData.face, (cx, w, h) => {
            cx.fillStyle = "#0b1406"; cx.fillRect(0, 0, w, h); cx.fillStyle = "#59c97b"; cx.fillRect(0, 0, w, 6);
            cx.font = `600 ${Math.round(h * 0.12)}px 'Barlow Condensed', Arial, sans-serif`; cx.textAlign = "left"; cx.textBaseline = "middle";
            cx.fillStyle = "#e8f8d0"; cx.fillText("COMMISSIONING RECORD", w * 0.06, h * 0.16);
            cx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`; cx.fillStyle = "#d8f5e0";
            ["Tests: interlock · 0 V · torque · IR pass", "Module replaced · cover refitted · hot cell", "Status: HELD for cell group review"].forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.4 + i * 0.18)));
          });
        }
        if (step.id === "crew-checkin") repaint(radio.userData.screen, signFace("LOGGED", { bg: "#0d1c24", accent: "#59c97b", fg: "#bfeaf7", scale: 0.5 }));
      },
      onHazard() {},
      onInterrupt(it) {
        if (it.id === "off-gas-alarm") { alarm = true; beacon.material = mat(0xf0645b, { emissive: 0xf0645b, ei: 2.2, rough: 0.4 }); strobe.visible = true; }
        if (it.id === "cell-group-hot") { hotMod.material = mat(0xe07a3f, { emissive: 0x803010, ei: 1.2, rough: 0.5 }); repaint(pcs.userData.screen, signFace("CELL TEMP HIGH", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd8d0", scale: 0.5 })); }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "off-gas-alarm") { doorL.rotation.y = 0; doorR.rotation.y = 0; alarm = false; strobe.visible = false; }
        if (it.id === "cell-group-hot") { pcsLamp.material = mat(0x6a1a14, { rough: 0.4 }); mush.material = mat(0x6a1a14, { rough: 0.4 }); charging = false; repaint(pcs.userData.screen, signFace("E-STOP · 0 A", { bg: "#2a0c0c", accent: "#f0645b", fg: "#ffd8d0", scale: 0.5 })); }
      },
      animate(t, dt, session) {
        const step = session?.step;
        fanBlades.rotation.x = t * (alarm ? 30 : 8);
        if (alarm) strobe.visible = Math.sin(t * 12) > -0.2;
        if (session?.turn && step?.id === "bus-torque") wrench.rotation.z = session.turn.amount * 1.2;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "gas-interlock") repaint(detector.userData.screen, signFace(`${Math.round(gg.t * 100)}% LFL`, { bg: "#0d1c24", accent: gg.t >= 0.06 && gg.t <= 0.2 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (gg && !gg.committed && step?.id === "insulation") repaint(megger.userData.screen, signFace(`${Math.round(gg.t * 1000)} MΩ`, { bg: "#0d1c24", accent: gg.t >= 0.62 && gg.t <= 0.9 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.6 }));
        if (step?.id === "first-charge" && session.holding && charging && !session.activeInterrupt) repaint(pcs.userData.screen, signFace(`PCS ${Math.round(session.track.v * 400)} A`, { bg: "#0d1c24", accent: session.track.v >= 0.4 && session.track.v <= 0.6 ? "#59c97b" : "#f2ae14", fg: "#bfeaf7", scale: 0.55 }));
        void dt; void CITY;
      },
    };
  },
};
