import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import { box, cyl, ball, slab, group, decal, repaint, signFace, particles } from "../../../shared/kit.js";
import { CITY, stationPad, holoPanel, holoTag, toolChest, cone, instrument, lockTag, reg } from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Bus Depot Lift VR — Mobility & Transit, station four.
// Raising a battery-electric transit bus on a mobile column lift to change a
// drive motor: the high-voltage system is disabled and proven before the bus
// leaves the ground, the columns are synchronised and locked before anyone
// goes under, and the 18-tonne vehicle sits on its locks, not its hydraulics.

const BD_ACCENT = 0x7bd389;

export const SIM_BUS_DEPOT_LIFT = {
  id: "bus-depot-lift",
  index: "34",
  domain: "Mobility",
  trade: "Transit bus technician — electric fleet",
  category: "Mobility & Transit",
  certification: "ATU / IAM — ASE Transit Bus (H series) with H8 EV / hybrid-electric; ALI Lifting It Right (ANSI/ALI ALOIM); OSHA 1910.147 lockout for high-voltage disable",
  name: "Bus Depot Lift",
  title: simTitle("Bus Depot Lift"),
  tagline: "Electric bus on column lifts: HV disable and prove, chocks, pad placement, synchronised raise, locks down, under-bus work, controlled lower",
  accent: BD_ACCENT,
  accentCss: "#7bd389",
  parSeconds: 240,
  footprint: 2.6,
  badge: { id: "on-the-locks", name: "On the Locks", note: "HV proven off, columns synced, an 18-tonne bus on its mechanical locks before a hand went underneath" },

  game: system({
    name: "Depot Authority",
    currency: "RAISE",
    ranks: ["Fleet Tech", "EV Tech", "Lead Tech", "Shop Supervisor", "Depot Authority Certified"],
    badges: [
      { id: "hv-proven", name: "HV Proven", note: "High voltage disabled and metered before the lift, first time", test: AWARD.stepClean("hv-verify") },
      { id: "never-under", name: "Never Under Hydraulics", note: "Never under the bus off the locks, never touched HV bare-handed", test: AWARD.safe },
      { id: "level-raise", name: "Level Raise", note: "Held the columns level through the raise", test: AWARD.unbroken },
    ],
    challenges: [
      { id: "clean-lift", name: "Clean Lift", note: "No corrections through the whole lift", test: AWARD.clean },
      { id: "pads-true", name: "Pads True", note: "Lift pads placed inside the manufacturer's points", test: AWARD.precise(0.7) },
      { id: "bay-turn", name: "Bay Turn", note: "Bus up, worked and down inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "under-hydraulic": "You went under the bus with the columns still on hydraulics, locks not engaged. A seal, a hose or a valve is all that is holding 18 tonnes over you; the mechanical locks are what a person works under.",
    "hv-bare": "You touched the orange high-voltage cable with bare hands before the system was disabled and proven. The traction battery is 600 V and does not care that the bus is switched off.",
    "pad-on-body": "You put a lift pad on the body skirt instead of the frame lift point. The skirt is sheet metal; it crushes, the bus shifts on the columns, and it comes down where it likes.",
    "raise-no-chock": "You started the raise with the wheels unchocked and the bus in neutral. A bus that rolls on the pads as it lifts rolls off them.",
  },

  lateNotes: {
    "column-raise": "The raise comes after HV is proven off, the wheels are chocked and every pad is on a frame point.",
    "column-lower": "The work is done and the bay is cleared before the lower.",
  },

  steps: [
    {
      id: "ro", kind: "select", target: "repair-order",
      title: "Read the repair order and the lift points",
      cue: "Check the job, the bus's lift-point diagram, its weight and the HV disable procedure for this model.",
      why: "Every model lifts at different frame points and disables HV a different way. The diagram and the procedure are read before anything is touched.",
    },
    {
      id: "hv-disable", kind: "sequence",
      targets: ["master-switch", "hv-service-plug"],
      itemNames: { "master-switch": "master switch", "hv-service-plug": "HV service disconnect" },
      title: "Disable the high-voltage system",
      cue: "Master switch off, then pull the HV service disconnect and pocket it.",
      why: "The service disconnect opens the traction battery circuit. It is pulled after the master switch, and it stays in your pocket so no one can reinsert it while you are under the bus.",
      outOfOrderNote: "Master switch first, then the service disconnect — pulling it under load arcs the contacts.",
    },
    {
      id: "hv-verify", kind: "gauge", target: "hv-meter",
      title: "Prove the HV bus is de-energised",
      cue: "Wait the discharge time, then read the HV bus at the test point with the CAT III meter and commit inside the safe band.",
      why: "The capacitors hold charge after the disconnect is pulled. The meter, after the wait, is the proof the orange cables are safe.",
      gauge: { label: "HV BUS", speed: 0.75, green: [0.0, 0.1], readout: (t) => `${Math.round(t * 600)} V`, missNote: "Still charged — wait the full discharge time and read it again." },
    },
    {
      id: "chock", kind: "sequence", anyOrder: true,
      targets: ["chock-front", "chock-rear"],
      itemNames: { "chock-front": "front chocks", "chock-rear": "rear chocks" },
      title: "Chock the wheels",
      cue: "Chocks both sides of a wheel at each axle, parking brake set.",
      why: "The bus must not roll on the pads during the first inches of lift. Chocks at both axles and the brake set before a column moves.",
    },
    {
      id: "pads", kind: "drag", target: "lift-pad",
      title: "Place the lift pads on the frame points",
      cue: "Roll each column in and set the pad under the frame lift point from the diagram.",
      why: "The frame lift point is engineered to carry the bus; nothing else under there is. The pad goes exactly there, on every column.",
      drag: { to: "lift-point-socket", radius: 0.4, missNote: "Not on the frame point — line the pad up with the marked lift point." },
    },
    {
      id: "raise", kind: "track", target: "column-raise", seconds: 7,
      title: "Raise in sync",
      cue: "Raise all columns together, watching the level — stop and correct if one column leads.",
      why: "Four columns raising unevenly twist the frame and shift the load onto two pads. The controller syncs them; the technician watches the level and stops the raise if it drifts.",
      track: { start: 0.1, green: [0.4, 0.6], rise: 0.6, fall: 0.5, drift: 0.12, label: "LEVEL", readout: (v) => (v < 0.4 ? "rear high" : v > 0.6 ? "front high" : "level") },
      holdBreakNote: "Columns out of sync — stop, level, and raise again.",
    },
    {
      id: "locks", kind: "hold", target: "lock-lever", seconds: 3,
      title: "Lower onto the mechanical locks",
      cue: "Engage the locks on every column and lower the bus onto them until the hydraulics are unloaded.",
      why: "The bus is worked under on its locks. Lowering onto them takes the load off the hydraulics, so a hydraulic failure cannot drop it.",
      holdBreakNote: "Not down on the locks yet — hold the lower until every column is seated.",
    },
    {
      id: "work", kind: "select", target: "drive-motor",
      title: "Work under the bus",
      cue: "With the bus on its locks and HV proven off, disconnect the drive motor.",
      why: "Everything before this step is what makes this step ordinary. The motor comes out from under an 18-tonne bus resting on steel.",
    },
    {
      id: "walk", kind: "find", noHint: true,
      targets: ["cracked-hose"],
      itemNames: { "cracked-hose": "chafed HV cable jacket" },
      itemNotes: { "cracked-hose": "The orange HV cable to the rear motor is chafed through its jacket where it crosses the frame — an insulation fault waiting for the next wet day. It is written up before the bus goes back on the road." },
      title: "Inspect under the bus while it is up",
      cue: "Look over the HV harness, the air lines and the frame while you have the access, and click the defect.",
      why: "A bus is up on locks for an hour a month. What is seen under it now is what keeps it out of the shop next month.",
    },
    {
      id: "lower", kind: "select", target: "column-lower",
      title: "Clear the bay and lower",
      cue: "Everyone and everything out from under, locks released together, lower to the floor, reinsert the service disconnect last.",
      why: "The lower is called by the person who has looked under the bus. The service disconnect goes back in only when the bus is on the ground and the job is closed.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.6, BD_ACCENT);
    box(g, 6.0, 0.1, 5.2, 0, 0.05, 0, 0x4a4e52, { rough: 0.9 });
    // The bus, four mobile columns, chocks.
    const bus = group(g, 0, 0.1, -0.6);
    box(bus, 4.6, 1.2, 1.6, 0, 1.2, 0, 0x2f6f8c, { rough: 0.55, metal: 0.3 });
    box(bus, 4.6, 0.5, 1.62, 0, 1.55, 0, 0x9fc3d8, { rough: 0.2, metal: 0.2 });
    box(bus, 4.4, 0.3, 1.2, 0, 0.55, 0, 0x2b2f34, { rough: 0.7, metal: 0.4 });     // frame
    for (const [x, z] of [[-1.5, -0.8], [1.5, -0.8], [-1.5, 0.8], [1.5, 0.8]]) cyl(bus, 0.3, 0.3, 0.3, x, 0.3, z, 0x1b1e22, { rough: 0.8, seg: 18 }).rotation.x = Math.PI / 2;
    const hvCable = cyl(bus, 0.02, 0.02, 3.0, 0, 0.42, 0.55, 0xff7a1a, { rough: 0.6, seg: 8 });
    hvCable.rotation.z = Math.PI / 2;
    reg(hits, hvCable, "hv-bare");
    const chafe = box(bus, 0.12, 0.05, 0.05, 1.2, 0.42, 0.55, 0x1b1e22, { rough: 0.9 });
    reg(hits, chafe, "cracked-hose");
    const motor = cyl(bus, 0.18, 0.18, 0.4, 1.4, 0.45, 0, 0x8a949d, { rough: 0.4, metal: 0.7, seg: 16 });
    motor.rotation.z = Math.PI / 2;
    holoTag(bus, "drive motor", 1.4, 0.15, 0, { css: "#7bd389", w: 0.24 });
    reg(hits, motor, "drive-motor");
    const underZone = box(bus, 3.0, 0.3, 1.0, 0, 0.2, 0, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(bus, "under the bus — on hydraulics?", 0, 0.05, 0.9, { css: "#d2312b", w: 0.5 });
    reg(hits, underZone, "under-hydraulic");
    const skirt = box(bus, 0.3, 0.1, 0.05, -0.6, 0.62, 0.82, 0xd2312b, { rough: 0.6, opacity: 0.35, transparent: true });
    holoTag(bus, "body skirt — not a lift point", -0.6, 0.85, 0.9, { css: "#d2312b", w: 0.44 });
    reg(hits, skirt, "pad-on-body");
    const liftPoint = box(bus, 0.3, 0.02, 0.3, -1.9, 0.4, 0.55, 0xffffff, { rough: 0.5 });
    liftPoint.visible = false; hits["lift-point-socket"] = liftPoint;
    const liftMark = decal(bus, 0.3, 0.1, -1.9, 0.62, 0.81, signFace("LIFT POINT", { bg: "#1b1e22", accent: "#7bd389", scale: 0.5 }));
    const columns = [];
    for (const [x, z] of [[-2.0, -1.2], [2.0, -1.2], [-2.0, 1.2], [2.0, 1.2]]) {
      const c = group(g, x, 0.1, -0.6 + z);
      box(c, 0.4, 2.6, 0.4, 0, 1.3, 0, 0xe8b02e, { rough: 0.55, metal: 0.3 });
      const carriage = box(c, 0.5, 0.2, 0.9, 0, 0.35, -z * 0.35, 0x2b2f34, { rough: 0.6, metal: 0.5 });
      columns.push({ c, carriage });
    }
    const pad = group(columns[2].c, 0, 0.5, 0.3);
    box(pad, 0.3, 0.06, 0.3, 0, 0, 0, 0x8a949d, { rough: 0.5, metal: 0.5 });
    holoTag(pad, "lift pad", 0, 0.14, 0, { css: "#7bd389", w: 0.2 });
    reg(hits, pad, "lift-pad");
    const chocks = {};
    for (const [id, x] of [["chock-front", 1.5], ["chock-rear", -1.5]]) {
      const ch = group(bus, x, 0.05, 1.0);
      box(ch, 0.2, 0.15, 0.15, 0, 0.07, 0, 0xe8b02e, { rough: 0.7 });
      holoTag(ch, id === "chock-front" ? "front chocks" : "rear chocks", 0, 0.3, 0, { css: "#7bd389", w: 0.26 });
      reg(hits, ch, id); chocks[id] = ch;
    }
    // Controller, dash master switch, service disconnect, meter, repair order.
    const ctrl = group(g, 2.6, 0.1, 1.6, -0.8);
    box(ctrl, 0.5, 1.2, 0.3, 0, 0.6, 0, 0x2b2f34, { rough: 0.55, metal: 0.3 });
    const raise = box(ctrl, 0.12, 0.06, 0.03, -0.12, 0.95, 0.16, 0x59c97b, { rough: 0.5 });
    decal(ctrl, 0.12, 0.04, -0.12, 1.03, 0.16, signFace("RAISE", { bg: "#22262b", accent: "#59c97b", scale: 0.55 }));
    reg(hits, raise, "column-raise");
    const lower = box(ctrl, 0.12, 0.06, 0.03, 0.12, 0.95, 0.16, 0xe8b02e, { rough: 0.5 });
    decal(ctrl, 0.12, 0.04, 0.12, 1.03, 0.16, signFace("LOWER", { bg: "#22262b", accent: "#e8b02e", scale: 0.55 }));
    reg(hits, lower, "column-lower");
    const lockLever = box(ctrl, 0.16, 0.06, 0.03, 0, 0.7, 0.16, 0x7bd389, { rough: 0.5 });
    decal(ctrl, 0.16, 0.04, 0, 0.78, 0.16, signFace("LOCKS · SET", { bg: "#22262b", accent: "#7bd389", scale: 0.5 }));
    reg(hits, lockLever, "lock-lever");
    const noChock = box(ctrl, 0.16, 0.06, 0.03, 0, 0.45, 0.16, 0x22262b, { rough: 0.5 });
    decal(ctrl, 0.16, 0.04, 0, 0.53, 0.16, signFace("RAISE — UNCHOCKED", { bg: "#22262b", accent: "#d2312b", scale: 0.42 }));
    reg(hits, noChock, "raise-no-chock");
    const dash = group(bus, -2.2, 1.3, 0.85, 0.2);
    const master = group(dash, 0, 0, 0);
    cyl(master, 0.04, 0.04, 0.03, 0, 0, 0, 0x22262b, { rough: 0.5, seg: 12 }).rotation.x = Math.PI / 2;
    const masterHandle = box(master, 0.02, 0.07, 0.02, 0, 0, 0.02, 0xd2312b, { rough: 0.5 });
    holoTag(master, "master switch", 0, 0.12, 0, { css: "#7bd389", w: 0.26 });
    reg(hits, master, "master-switch");
    const plug = group(bus, 0.4, 1.0, 0.85);
    box(plug, 0.12, 0.1, 0.06, 0, 0, 0, 0xff7a1a, { rough: 0.6 });
    holoTag(plug, "HV service disconnect", 0, 0.14, 0, { css: "#ff7a1a", w: 0.4 });
    reg(hits, plug, "hv-service-plug");
    const chest = toolChest(g, -2.6, 1.4, { ry: 0.7, color: 0x2f5f3a });
    const meter = instrument(chest, 0, 0.79, 0, { ry: 0.3, idle: "-- V", color: 0x7bd389, w: 0.12, d: 0.19 });
    holoTag(meter, "CAT III meter — HV test point", 0, 0.16, 0, { css: "#7bd389", w: 0.46 });
    reg(hits, meter, "hv-meter");
    holoPanel(chest, 0.6, 0.42, -0.6, 1.3, 0.1, (ctx, w, h) => {
      ctx.fillStyle = "#08200e"; ctx.fillRect(0, 0, w, h); ctx.fillStyle = "#7bd389"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("RO 88213 — BUS 4471 DRIVE MOTOR", w * 0.06, h * 0.16);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#e0f5e4";
      ["BEB, 18.2 t, 600 V traction", "HV: master off → pull SD → wait 5 min → meter", "Lift points: frame, 4 × marked", "Columns: sync raise, locks before under", "Chocks both axles, brake set"].forEach((l, i) => ctx.fillText(l, w * 0.06, h * (0.34 + i * 0.13)));
    }, { accent: BD_ACCENT });
    const ro = box(chest, 0.6, 0.42, 0.04, -0.6, 1.3, 0.1, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, ro, "repair-order");
    cone(g, 2.8, -2.2); cone(g, -2.8, -2.2);

    let height = 0, locked = false;
    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.0, -0.6),
      onStep() {},
      onStepComplete(step) {
        if (step.id === "hv-disable") { masterHandle.rotation.z = Math.PI / 2; plug.visible = false; }
        if (step.id === "chock") for (const ch of Object.values(chocks)) ch.position.z = 0.75;
        if (step.id === "pads") { pad.parent.remove(pad); bus.add(pad); pad.position.set(-1.9, 0.37, 0.55); pad.rotation.set(0, 0, 0); }
        if (step.id === "locks") locked = true;
        if (step.id === "walk") chafe.visible = false;
        if (step.id === "lower") { height = 0; locked = false; plug.visible = true; }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (step?.id === "raise" && session.track) height = Math.min(1, session.track.inBand / 7) * 1.6;
        if (step?.id === "locks" && session.holding) height = 1.6 - Math.min(1, session.holdFor / 3) * 0.05;
        bus.position.y = 0.1 + height;
        for (const c of columns) c.carriage.position.y = 0.35 + height;
        const gg = session?.gauge;
        if (gg && !gg.committed && step?.id === "hv-verify") repaint(meter.userData.screen, signFace(`${Math.round(gg.t * 600)} V`, { bg: "#0d1c24", accent: gg.t <= 0.1 ? "#59c97b" : "#d2312b", fg: "#e0f5e4", scale: 0.62 }));
      },
    };
  },
};
