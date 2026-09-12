import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, hose, group, decal, repaint, signFace, particles, mat,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, toolChest, cone, barrierPanel, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Flight Deck VR — its own gamified system: Airside Command.
// Drone-delivery vertiport ramp work: rotors that spin up on their own schedule
// and a battery chemistry that does not forgive a puncture.

export const SIM_FLIGHT_DECK = {
  id: "flight-deck",
  index: "06",
  domain: "Aviation",
  trade: "Drone / UAS ground technician",
  name: "Flight Deck",
  title: simTitle("Flight Deck"),
  tagline: "Vertiport ramp safety: rotor lockout, battery handling, autonomous route planning and pre-flight release",
  accent: 0x4fd1ff,
  accentCss: "#4fd1ff",
  parSeconds: 240,
  badge: { id: "airside-clear", name: "Airside Clear", note: "Full ramp procedure with rotors safed throughout" },

  game: system({
    name: "Airside Command",
    currency: "AIRSIDE",
    ranks: ["Ramp Trainee", "Ground Crew", "Ramp Lead", "Release Certifier", "Airside Command"],
    badges: [
      { id: "rotor-safe", name: "Rotor Safe", note: "Never approach an unlocked rotor", test: AWARD.safe },
      { id: "battery-handler", name: "Battery Handler", note: "Every cell check inside spec", test: AWARD.precise(0.72) },
      { id: "clean-release", name: "Clean Release", note: "Pre-flight signed off with no corrections", test: AWARD.stepClean("release") },
      { id: "route-clean", name: "Route Planned Clean", note: "Plan the delivery route in the correct order, first try", test: AWARD.stepClean("plan-route") },
    ],
    challenges: [
      { id: "turnaround", name: "Fast Turnaround", note: "Release the aircraft inside 80% of par", test: AWARD.fast(0.8) },
      { id: "first-flight", name: "First Flight", note: "Clean run, no corrections", test: AWARD.clean },
      { id: "ramp-streak", name: "Ramp Streak", note: "Nine correct actions in a row", test: AWARD.streak(9) },
    ],
  }),

  hazards: {
    "spinning-rotor": "You reached toward a rotor with the flight controller still armed. A carbon propeller at flight RPM will not stop for a hand — the aircraft is disarmed and the props are pinned before anyone approaches.",
    "swollen-battery": "That battery pack is swollen. A puffed LiPo cell is already venting internally; charging or flying it is how a ramp fire starts. It goes straight into the fireproof containment bag.",
    "ramp-incursion": "You crossed into the active approach path while an aircraft is inbound. The ramp boundary exists because a returning drone is looking for a clear landing pad, not for a person standing on it.",
    "damaged-prop": "That propeller has a chip out of the leading edge. A damaged prop at altitude changes its balance and can shear — it is swapped before the aircraft goes anywhere.",
  },

  lateNotes: {
    "battery-bay": "The bay stays closed until the airframe is disarmed and the props are pinned.",
    "preflight-tablet": "Nothing gets signed off before the physical inspection is actually done.",
  },

  steps: [
    {
      id: "notam", kind: "select", target: "notam-board",
      title: "Check the flight authorization",
      cue: "Read the NOTAM and confirm the ramp is cleared for ground operations.",
      why: "Airspace and ramp status change by the hour. Working under an aircraft that airspace control expects to be flying is how a ground crew ends up under a live approach.",
    },
    {
      id: "zone", kind: "sequence", anyOrder: true,
      targets: ["cone-a", "cone-b", "ramp-barrier"],
      itemNames: { "cone-a": "cone at the ramp edge", "cone-b": "cone at the taxi line", "ramp-barrier": "ramp barrier" },
      title: "Set the ground safety zone",
      cue: "Cone the ramp edge and the taxi line, then close the barrier.",
      why: "The zone keeps bystanders off an active ramp and keeps you inside a boundary the flight controller respects for automated landings.",
    },
    {
      id: "disarm", kind: "select", target: "flight-controller",
      title: "Disarm the flight controller",
      cue: "Confirm the aircraft shows disarmed on the controller link.",
      why: "Disarmed means the motors cannot spin regardless of what a stray signal or a bumped stick commands. Nothing touches the airframe before this.",
    },
    {
      id: "pin", kind: "select", target: "prop-pins",
      title: "Fit the rotor locking pins",
      cue: "Pin all four rotors before you approach the airframe.",
      why: "Disarmed is a software state; the pin is physical. Both together are what makes an accidental spin-up impossible instead of just unlikely.",
    },
    {
      id: "inspect", kind: "find", noHint: true,
      targets: ["fault-prop", "fault-arm", "fault-sensor"],
      itemNames: {
        "fault-prop": "chipped propeller",
        "fault-arm": "cracked motor arm",
        "fault-sensor": "obstructed obstacle sensor",
      },
      itemNotes: {
        "fault-prop": "A leading-edge chip like that changes the propeller's balance at speed — replace, never fly on it.",
        "fault-arm": "A hairline crack in a carbon arm fails suddenly, not gradually. Ground the airframe until it is replaced.",
        "fault-sensor": "Mud over the obstacle sensor blinds the aircraft's collision avoidance exactly when it needs it most.",
      },
      decoyNotes: {
        "healthy-prop": "That propeller is clean and balanced — nothing to action.",
        "healthy-arm": "That arm shows no damage. Swapping serviceable parts wastes the inspection window and adds no safety.",
      },
      title: "Complete the pre-flight inspection",
      cue: "Walk the airframe. Three things are wrong — find them by looking.",
      why: "A pre-flight inspection is a search, not a checklist tick. Damage that looks cosmetic on the ramp is structural at altitude.",
    },
    {
      id: "swap-prop", kind: "drag", target: "spare-prop",
      title: "Replace the damaged propeller",
      cue: "Carry the spare propeller over to the damaged rotor and fit it.",
      why: "Matched, balanced propellers keep the airframe's vibration profile inside what the flight controller expects.",
      drag: { to: "damaged-prop", radius: 0.12, missNote: "Not lined up with the rotor mount — carry the spare over the damaged prop and fit it there." },
    },
    {
      id: "battery", kind: "select", target: "battery-bay",
      title: "Inspect and fit the flight battery",
      cue: "Check the pack for swelling and damage before it goes in the bay.",
      why: "The battery bay is the last thing that opens, and only after the airframe cannot spin a motor even if you drop something into it.",
    },
    {
      id: "cellcheck", kind: "gauge", target: "battery-meter",
      title: "Verify cell voltage balance",
      cue: "Check the pack and commit when cell balance is inside tolerance.",
      why: "A pack with one cell drifting low will sag under load exactly when the aircraft needs full power to land — balance is checked before every flight, not just at charge.",
      gauge: {
        label: "CELL VOLTAGE SPREAD", speed: 0.65, green: [0.0, 0.14],
        readout: (t) => `${(t * 180).toFixed(0)} mV spread`,
        missNote: "Spread outside tolerance. That pack goes to balance charging, not onto the airframe.",
      },
    },
    {
      id: "swollen", kind: "select", target: "containment-bag",
      title: "Contain the damaged battery",
      cue: "Bag the swollen pack in the fireproof containment sleeve.",
      why: "A venting cell in a normal storage bin can ignite everything around it. The fireproof bag buys the time for it to be handled properly.",
    },
    {
      id: "unpin", kind: "select", target: "prop-pins",
      title: "Remove the rotor pins",
      cue: "Pull all four pins once the inspection is complete.",
      why: "The pins come out last, right before release — never while there is still a reason for a hand to be near the airframe.",
    },
    {
      id: "plan-route", kind: "sequence", targets: ["wp-launch", "wp-relay", "wp-delivery"],
      title: "Plan the autonomous delivery route",
      cue: "Set the route waypoints on the mission map in the order the aircraft will actually fly them.",
      why: "The flight controller flies the waypoints in the order they were entered — swap the relay and the delivery point and the aircraft plans a straight line through restricted airspace instead of around it.",
      itemNames: { "wp-launch": "launch waypoint", "wp-relay": "relay waypoint", "wp-delivery": "delivery waypoint" },
      itemNotes: {
        "wp-launch": "The climb-out point clear of the ramp boundary.",
        "wp-relay": "Routes the aircraft around the restricted corridor, not through it.",
        "wp-delivery": "The drop point at the delivery address.",
      },
      outOfOrderNote: "That waypoint comes later in the actual route. Launch, then relay, then delivery — the controller flies them in the order you entered them, not the order that looks obvious on the map.",
    },
    {
      id: "upload-mission", kind: "select", target: "upload-mission-btn",
      title: "Upload the mission",
      cue: "Push the planned route to the flight controller.",
      why: "A planned route sitting on the tablet is not a flight plan yet — uploading it is what the aircraft actually flies.",
    },
    {
      id: "verify-mission", kind: "hold", target: "verify-mission-btn", seconds: 2.5,
      title: "Verify the route against restricted airspace",
      cue: "Hold VERIFY while the controller checks every leg of the uploaded route.",
      why: "Airspace restrictions shift by the hour. You verify the specific route you are about to fly, every time, not the general area it happens to be in.",
      holdBreakNote: "Released before the airspace check finished — hold it through the full check, that's the only way to catch a corridor that shifted since the route was drawn.",
    },
    {
      id: "release", kind: "select", target: "preflight-tablet",
      title: "Sign the pre-flight release",
      cue: "Complete the digital release with the inspection findings.",
      why: "The release is a signed record that a specific person checked specific things. It is what the incident investigation reads first if something goes wrong in the air.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.05, 0x4fd1ff);

    // ------------------------------------------------------------ ramp pad
    box(g, 4.4, 0.1, 4.4, 0, 0.05, 0, 0x3d434a, { rough: 0.9 });
    torus(g, 1.5, 0.03, 0, 0.105, 0, 0xf2c14b, { emissive: 0xf2c14b, ei: 0.6, rough: 0.5, cast: false, seg: 6, seg2: 48 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      box(g, 0.3, 0.006, 0.08, Math.sin(a) * 1.5, 0.108, Math.cos(a) * 1.5, 0xf2c14b,
        { rough: 0.5, cast: false }).rotation.y = a;
    }
    decal(g, 1.2, 1.2, 0, 0.055, -0.4, (ctx, w, h) => {
      ctx.fillStyle = "#3d434a"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#f2c14b"; ctx.lineWidth = 14;
      ctx.beginPath(); ctx.arc(w / 2, h / 2, w * 0.4, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#f2c14b";
      ctx.font = `700 ${Math.round(h * 0.4)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("H", w / 2, h / 2);
    }, { px: 384 }).rotation.x = -Math.PI / 2;

    // ------------------------------------------------------------- the drone
    const drone = group(g, -0.2, 0.16, -0.5, 0.4);
    slab(drone, 0.32, 0.11, 0.42, 0, 0.06, 0, 0x22272c, { radius: 0.04, rough: 0.4, metal: 0.4 });
    box(drone, 0.2, 0.06, 0.2, 0, 0.14, 0.02, 0xdfe4e8, { radius: 0.02, rough: 0.3 });
    const arms = [];
    const rotors = [];
    const pins = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const armLen = 0.4;
      const arm = group(drone, 0, 0.08, 0);
      const armMesh = box(arm, armLen, 0.025, 0.03, Math.sin(a) * armLen / 2, 0, Math.cos(a) * armLen / 2,
        0x2b3138, { rough: 0.4, metal: 0.5 });
      armMesh.rotation.y = a;
      arms.push({ arm: armMesh, id: i === 1 ? "fault-arm" : `arm-${i}` });
      const motor = cyl(arm, 0.032, 0.032, 0.03, Math.sin(a) * armLen, 0.015, Math.cos(a) * armLen,
        0x1b1e22, { rough: 0.4, metal: 0.6, seg: 14 });
      const rotorGroup = group(arm, Math.sin(a) * armLen, 0.03, Math.cos(a) * armLen);
      for (const s of [-1, 1]) {
        const blade = box(rotorGroup, 0.14, 0.006, 0.022, s * 0.07, 0, 0, i === 0 ? 0x2b3138 : 0x1b1e22,
          { rough: 0.35, cast: false });
        if (i === 0 && s === 1) reg(hits, blade, "fault-prop");
      }
      rotors.push(rotorGroup);
      const pin = cyl(rotorGroup, 0.006, 0.006, 0.06, 0, 0.03, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
      pin.visible = false;
      pins.push(pin);
      reg(hits, rotorGroup, i === 0 ? "damaged-prop" : "spinning-rotor");
    }
    reg(hits, arms[1].arm, "fault-arm");
    const sensorMud = group(drone, 0, 0.08, 0.19);
    ball(sensorMud, 0.02, 0, 0, 0, 0x4a3a2a, { rough: 0.95 });
    reg(hits, sensorMud, "fault-sensor");
    holoTag(drone, "UAS-14", 0, 0.4, 0.2, { css: "#4fd1ff", w: 0.24 });

    const battBay = group(drone, 0, 0.02, -0.16);
    const battDoor = box(battBay, 0.18, 0.02, 0.14, 0, 0, 0, 0x2b3138, { rough: 0.4, metal: 0.4 });
    holoTag(battBay, "Battery bay", 0, 0.1, 0, { css: "#4fd1ff", w: 0.26 });
    reg(hits, battBay, "battery-bay");

    // Flight controller / link status on the ramp side.
    const controller = group(g, 1.1, 0, -1.35, -0.4);
    slab(controller, 0.28, 0.16, 0.06, 0, 0.9, 0, 0x22272c, { radius: 0.02, rough: 0.5 });
    const controllerScreen = decal(controller, 0.22, 0.1, 0, 0.92, 0.032,
      signFace("ARMED", { bg: "#2a1416", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 }),
      { glow: true, ei: 0.85, px: 256 });
    holoTag(controller, "Flight controller link", 0, 1.05, 0.04, { css: "#4fd1ff", w: 0.4 });
    reg(hits, controller, "flight-controller");
    const uploadBtn = cyl(controller, 0.018, 0.018, 0.012, -0.05, 0.8, 0.032, 0x4fd1ff, { rough: 0.4, seg: 14 });
    uploadBtn.rotation.x = Math.PI / 2;
    reg(hits, uploadBtn, "upload-mission-btn");
    const verifyBtn = cyl(controller, 0.018, 0.018, 0.012, 0.05, 0.8, 0.032, 0x59c97b, { rough: 0.4, seg: 14 });
    verifyBtn.rotation.x = Math.PI / 2;
    reg(hits, verifyBtn, "verify-mission-btn");
    holoTag(controller, "Upload · Verify", 0, 0.76, 0.03, { css: "#4fd1ff", w: 0.32 });

    // --------------------------------------------------------- route waypoints
    // Ground markers standing in for the mission-map pins on the tablet — the
    // same abstraction Robot Cell uses for taught positions. The connecting
    // line only lights up once the route is uploaded and verified.
    const wpLaunch = new THREE.Vector3(-1.4, 0.02, 0.4);
    const wpRelay = new THREE.Vector3(0, 0.02, -1.75);
    const wpDelivery = new THREE.Vector3(1.4, 0.02, 0.4);
    const waypointDefs = [
      [wpLaunch, "wp-launch", "1 · Launch", 0x59c97b],
      [wpRelay, "wp-relay", "2 · Relay", 0x4fd1ff],
      [wpDelivery, "wp-delivery", "3 · Delivery", 0xffcc00],
    ];
    for (const [pos, id, label, color] of waypointDefs) {
      const ring = torus(g, 0.09, 0.012, pos.x, pos.y, pos.z, color,
        { emissive: color, ei: 1.2, rough: 0.4, cast: false, seg: 6, seg2: 24 });
      ring.rotation.x = Math.PI / 2;
      holoTag(g, label, pos.x, pos.y + 0.24, pos.z, { css: "#4fd1ff", w: 0.32 });
      reg(hits, ring, id);
    }
    const routeLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([wpLaunch, wpRelay, wpDelivery]),
      new THREE.LineBasicMaterial({ color: 0x4fd1ff, transparent: true, opacity: 0.12 }));
    g.add(routeLine);

    // Spare propeller and containment bag on the tool chest.
    const chest = toolChest(g, 1.6, 0.9, { ry: -0.6, color: 0x2b6f8c });
    const pinCase = group(chest, -0.16, 0.79, 0.08, 0.3);
    box(pinCase, 0.1, 0.03, 0.07, 0, 0, 0, 0xf2c14b, { rough: 0.5 });
    for (let i = 0; i < 4; i++) {
      cyl(pinCase, 0.004, 0.004, 0.03, -0.03 + i * 0.02, 0.023, 0, 0xf2c14b, { rough: 0.5, seg: 8 });
    }
    holoTag(pinCase, "Rotor locking pins", 0, 0.1, 0, { css: "#4fd1ff", w: 0.32 });
    reg(hits, pinCase, "prop-pins");
    const spareProp = group(chest, -0.1, 0.79, 0, 0.4);
    for (const s of [-1, 1]) box(spareProp, 0.1, 0.005, 0.016, s * 0.05, 0, 0, 0xdfe4e8, { rough: 0.35 });
    holoTag(spareProp, "Spare propeller", 0, 0.1, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, spareProp, "spare-prop");

    const bag = group(chest, 0.14, 0.8, -0.02);
    box(bag, 0.12, 0.03, 0.09, 0, 0, 0, 0xd8232a, { rough: 0.7 });
    decal(bag, 0.1, 0.02, 0, 0.017, 0.03, signFace("LiPo BAG", { bg: "#7d1512", accent: "#f2ae14", scale: 0.5 }), { px: 128 });
    holoTag(bag, "Containment bag", 0, 0.14, 0, { css: "#f0645b", w: 0.3 });
    reg(hits, bag, "containment-bag");

    const battMeter = instrument(chest, 0.02, 0.82, 0.14, { ry: -0.5, idle: "-- mV", color: 0x4fd1ff });
    holoTag(battMeter, "Cell checker", 0, 0.16, 0, { css: "#4fd1ff", w: 0.28 });
    reg(hits, battMeter, "battery-meter");

    // Swollen battery pack on the bench, visibly puffed.
    const swollenBatt = group(g, 1.75, 0, -0.15, 0.3);
    slab(swollenBatt, 0.16, 0.055, 0.09, 0, 0.05, 0, 0xd8b23a, { radius: 0.02, rough: 0.55 });
    ball(swollenBatt, 0.05, 0, 0.07, 0, 0xd8b23a, { rough: 0.55 }).scale.set(1.6, 0.7, 1);
    holoTag(swollenBatt, "Swollen pack", 0, 0.16, 0, { css: "#f0645b", w: 0.28 });
    reg(hits, swollenBatt, "swollen-battery");

    // Work zone.
    reg(hits, cone(g, -1.9, 1.3, { color: 0x4fd1ff }), "cone-a");
    reg(hits, cone(g, 1.9, 1.6, { color: 0x4fd1ff }), "cone-b");
    reg(hits, barrierPanel(g, 0, 1.9, { ry: 0.05, color: 0x4fd1ff }), "ramp-barrier");

    // Bystander crossing behind the boundary — the incursion trap.
    const bystander = standingFigure(g, 0.4, 2.3, { ry: 3.0, cloth: 0x445566 });
    reg(hits, bystander, "ramp-incursion");

    // Holo NOTAM board and pre-flight tablet.
    const notam = holoPanel(g, 0.56, 0.4, -1.85, 1.45, -1.15, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#8fb3c4";
      ctx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("NOTAM · VERTIPORT 4", w * 0.06, h * 0.14);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.15)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.fillText("GROUND OPS APPROVED", w * 0.06, h * 0.33);
      ctx.font = `${Math.round(h * 0.085)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ["Aircraft: UAS-14, quad rotor", "Payload: medical delivery",
       "Battery: 6S LiPo, balance ±50 mV", "Cell spread limit: 100 mV",
       "Next scheduled flight: 14:20"].forEach((line, i) => ctx.fillText(line, w * 0.06, h * (0.5 + i * 0.11)));
    }, { ry: 0.7, accent: 0x4fd1ff });
    reg(hits, notam, "notam-board");

    const tablet = holoPanel(g, 0.4, 0.26, 1.85, 1.4, 0.6, (ctx, w, h) => {
      ctx.fillStyle = "rgba(6,16,22,0.9)"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#4fd1ff"; ctx.fillRect(0, 0, w, 5);
      ctx.fillStyle = "#eaf6fb";
      ctx.font = `600 ${Math.round(h * 0.2)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("PRE-FLIGHT RELEASE", w / 2, h * 0.34);
      ctx.font = `${Math.round(h * 0.12)}px Arial, sans-serif`;
      ctx.fillStyle = "#a9c6d6";
      ctx.fillText("Sign off inspection findings", w / 2, h * 0.64);
      ctx.fillText("and release to flight", w / 2, h * 0.8);
    }, { ry: -0.6, accent: 0x4fd1ff });
    reg(hits, tablet, "preflight-tablet");

    let armed = true;
    let pinned = false;

    return {
      hits,
      footprint: 2.05,

      onStepComplete(step) {
        if (step.id === "disarm") {
          armed = false;
          repaint(controllerScreen, signFace("DISARMED", { bg: "#0d1c14", accent: "#59c97b", fg: "#bff7d4", scale: 0.42 }));
        }
        if (step.id === "pin") { pinned = true; pins.forEach((p) => { p.visible = true; }); }
        // spare-prop's own position/rotation are already set by the drag-and-
        // drop gesture (app.js snaps it onto the damaged rotor mount on a
        // successful drop); hide the old damaged rotor assembly it replaces.
        if (step.id === "swap-prop") rotors[0].visible = false;
        if (step.id === "battery") battDoor.rotation.x = -1.2;
        if (step.id === "swollen") swollenBatt.visible = false;
        if (step.id === "unpin") { pinned = false; pins.forEach((p) => { p.visible = false; }); }
        if (step.id === "upload-mission") routeLine.material.opacity = 0.45;
        if (step.id === "verify-mission") {
          routeLine.material.opacity = 1;
          routeLine.material.color.set(0x59c97b);
        }
        if (step.id === "release") {
          repaint(controllerScreen, signFace("RELEASED", { bg: "#0d1c14", accent: "#4fd1ff", fg: "#bfeaf7", scale: 0.4 }));
        }
      },

      animate(t, dt, session) {
        if (armed && !pinned) rotors.forEach((r) => { r.rotation.y += dt * 26; });
        bystander.userData.head.rotation.y = Math.sin(t * 0.5) * 0.4;

        const gg = session?.gauge;
        if (gg && !gg.committed && session.step?.id === "cellcheck") {
          repaint(battMeter.userData.screen, signFace(`${Math.round(gg.t * 180)} mV`, {
            bg: "#0d1c24", accent: gg.t < 0.14 ? "#59c97b" : "#f0645b", fg: "#bfeaf7", scale: 0.55,
          }));
        }

        if (session?.step?.id === "verify-mission" && session.holding) {
          const p = Math.min(1, session.holdFor / session.step.seconds);
          routeLine.material.opacity = 0.45 + p * 0.55;
          routeLine.material.color.set(p > 0.98 ? 0x59c97b : 0x4fd1ff);
        }
      },
    };
  },
};
