import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, torus, slab, group, decal, repaint, signFace, paperFace,
  shell, ceilingGrid, spreadLayout, counter, particles, markInteractive,
} from "../../../shared/kit.js";

// Room 06 — Platform engineer / SRE: promoting a build through a real
// environment pipeline while supervising an automated deploy agent. The
// hazards here are the ones that actually take down production in 2024 —
// an environment-scoped secret picked up in the wrong tier, an automation
// handed a standing admin credential instead of a scoped one, and a rollout
// pushed to 100% without ever reading the canary it was supposed to gate on.

const OPS_STEEL = 0x8a949d, OPS_DARKSTEEL = 0x2c3238;
const VIOLET = 0x7c6fea, GOOD = 0x59c97b, BAD = 0xf0645b, WARN = 0xf2ae14;

export const ROOM_DEVOPS = {
  id: "devops",
  trade: "Platform engineer / SRE",
  title: "Deploy Bay",
  tagline: "Environment promotion, agent permission scoping, and a canary-gated rollout on a live deploy pipeline",
  union: "Non-union profession (CWA and the Alphabet Workers Union organise some technology workplaces)",
  certification: "CNCF Certified Kubernetes Administrator (CKA) and AWS Certified DevOps Engineer; NIST SP 800-53 AC-6 least privilege for automation identities; SRE progressive-delivery and rollback practice",
  accent: VIOLET,
  accentCss: "#7c6fea",
  parSeconds: 215,
  // The shell this room builds, so the app can let the learner walk to the
  // walls instead of clamping them to a circle in the middle of the floor.
  size: { w: 14.6, d: 13.9 },
  spawn: { x: 0.0, z: 5.0, ry: 0 },
  badge: { id: "clean-promote", name: "Clean Promote", note: "Prod promotion with a scoped agent, a healthy canary, and a tested rollback" },

  hazards: {
    "prod-console": "That tab is the production console, not staging — it renders identically at a glance, which is exactly how a 2 a.m. mistake happens. Close it and confirm you're back in staging before touching anything.",
    "prod-db-secret": "That credential is scoped to production, not staging. Handing an automated job a secret for the wrong environment lets a test run read or write real customer data.",
    "admin-token": "That's a standing admin credential, not a scoped token for this job. An automation only needs the access this run requires — a broad, long-lived key turns any bug in its logic into an account-wide blast radius.",
  },

  lateNotes: {
    "canary-dial": "Don't open traffic to this build yet — the agent's token still needs scoping and its diff still needs a read.",
    "promote-lever": "Not until the canary's been watched. A rollout that looks fine at a sliver of traffic can still be a full outage at 100%.",
    "kill-switch": "Test the rollback once the rollout is live, not before — you're confirming it works while there's something to roll back.",
    "audit-terminal": "The audit entry comes last — it should record what actually happened, not what you're about to try.",
  },

  steps: [
    {
      id: "runbook", kind: "select", target: "deploy-ticket",
      title: "Read the deploy ticket",
      cue: "Open the change ticket and confirm what the automation is about to do.",
      why: "An agent runs exactly what it's told. You're the one who has to know what that is before it starts.",
    },
    {
      id: "env-check", kind: "select", target: "env-label",
      title: "Confirm the target environment",
      cue: "Check the environment label on the console before touching anything.",
      why: "Staging and production share the same tooling and look the same on a bad night. The label is the only thing standing between a test and an outage.",
    },
    {
      id: "secrets-sweep", kind: "sequence", target: null, anyOrder: true,
      targets: ["staging-db-secret", "staging-api-key", "staging-webhook"],
      itemNames: { "staging-db-secret": "database credential", "staging-api-key": "API key", "staging-webhook": "webhook secret" },
      title: "Verify environment-scoped secrets",
      cue: "Confirm every secret this run will use is scoped to staging — all three, in any order.",
      why: "A secret scoped to the wrong environment isn't a mistake you notice — it's a live production credential sitting somewhere it can leak.",
      outOfOrderNote: "Already checked — you still have secrets left to verify.",
    },
    {
      id: "scope-token", kind: "select", target: "scoped-token",
      title: "Issue a least-privilege token",
      cue: "Take the scoped, single-purpose token for this run — not the standing admin key.",
      why: "Least privilege isn't paperwork. It's the difference between a bad deploy and a bad deploy that could also read every customer record.",
    },
    {
      id: "review-diff", kind: "select", target: "agent-diff",
      title: "Review the agent's proposed change",
      cue: "Open the diff the agent generated and read it before approving.",
      why: "Approving automation output you haven't read is how a bad change ships with a human's name on the approval.",
    },
    {
      id: "canary-open", kind: "turn", target: "canary-dial",
      title: "Open the canary to 10%",
      cue: "Turn the traffic dial to route a small slice of real traffic to the new build.",
      why: "You test a rollout on a fraction of traffic before betting all of it. The canary is what tells you whether this build is safe.",
      turn: { turns: 0.28, axis: "z", reverse: true, label: "CANARY TRAFFIC" },
    },
    {
      id: "watch-canary", kind: "gauge", target: "canary-monitor",
      title: "Watch the canary error rate",
      cue: "Watch the live error-rate needle and commit only while it reads healthy.",
      why: "A canary that's already unhealthy at 10% traffic is a full outage at 100%. This is the checkpoint that catches it first.",
      gauge: {
        label: "CANARY — ERROR RATE", speed: 0.7, green: [0.02, 0.24],
        readout: (t) => `${(t * 6.2).toFixed(1)}%`,
        missNote: "That's outside the healthy band. Watch the needle and commit while the error rate reads low.",
      },
    },
    {
      id: "promote", kind: "turn", target: "promote-lever",
      title: "Promote to full traffic",
      cue: "Throw the promote lever to send the build the rest of the way to 100%.",
      why: "Promotion is a deliberate act, separate from opening the canary — the two decisions shouldn't share one motion.",
      turn: { turns: 0.32, axis: "z", reverse: true, label: "PROMOTE" },
    },
    {
      id: "killswitch", kind: "hold", target: "kill-switch", seconds: 4,
      title: "Arm and test the rollback",
      cue: "Hold the rollback switch to confirm it actually fires before you rely on it.",
      why: "A kill switch you haven't tested isn't a kill switch — it's a hope. Confirm it works while you don't yet need it for real.",
      holdBreakNote: "Released too early. A rollback test that doesn't run its full course hasn't tested anything.",
    },
    {
      id: "audit-log", kind: "select", target: "audit-terminal",
      title: "Log the change and the agent's actions",
      cue: "Write the promotion, the token scope, and the canary result to the audit trail.",
      why: "Months from now, someone will need to know exactly what an automation did here and who authorised it. This is that line.",
    },
  ],

  build(root) {
    const hits = {};
    const reg = (obj, id) => { markInteractive(obj, id); hits[id] = obj; return obj; };

    shell(root, {
      w: 14.6, d: 13.9, h: 4.2,
      floor: 0x1c2229, wall: 0x232b34, ceiling: 0x171d24,
      floorRough: 0.55, skirtColor: 0x141a20,
          walkway: { lane: 0x3d7fb8, hatch: 0x2a3440, laneFrac: 0.40 },
      trim: 0x2f5f8a, structure: "pipes", structureColor: 0x39434f, door: "personnel",
});


    // ------------------------------------------------------- background racks
    const rackRow = group(root, 0, 0, -4.1);
    for (let i = -3; i <= 3; i++) {
      const rack = group(rackRow, i * 1.05, 0, 0);
      box(rack, 0.7, 2.2, 0.5, 0, 1.1, 0, 0x272f38, { rough: 0.55, metal: 0.35 });
      for (let r = 0; r < 8; r++) {
        const lit = (i + r) % 3 === 0;
        box(rack, 0.58, 0.1, 0.02, 0, 0.32 + r * 0.22, 0.26, 0x11151a, { rough: 0.6, cast: false });
        ball(rack, 0.012, 0.24, 0.32 + r * 0.22, 0.27, lit ? GOOD : 0x2c3238,
          { emissive: lit ? GOOD : 0x000000, ei: lit ? 2.0 : 0, rough: 0.4, cast: false });
      }
    }

    // -------------------------------------------------------------- deploy desk
    const desk = counter(root, 3.3, 0.75, 0, -1.9, 0x39424b, { height: 0.92, metal: 0.4, rough: 0.5 });

    // Deploy ticket clipboard.
    const ticket = decal(desk, 0.4, 0.5, -1.35, 0.96, -0.08, paperFace("CHANGE TICKET · DEP-4471", [
      "Agent: release-bot v3",
      "Action: promote build 1a2f9c",
      "Scope: web-api, staging → prod",
      "Requested by: on-call SRE",
    ]));
    box(desk, 0.46, 0.02, 0.56, -1.35, 0.94, -0.08, 0x22262b, { rough: 0.6 });
    reg(ticket, "deploy-ticket");

    // Environment label tab — the thing you actually have to check.
    const envGood = group(desk, -0.62, 0.94, -0.1);
    box(envGood, 0.46, 0.16, 0.02, 0, 0, 0, GOOD, { emissive: GOOD, ei: 1.1, rough: 0.4 });
    decal(envGood, 0.4, 0.11, 0, 0, 0.012, signFace("STAGING", { bg: "#123b2a", accent: "#59c97b", fg: "#c9f5da", scale: 0.62 }));
    reg(envGood, "env-label");

    // A second tab, identical shape, labeled PROD — the trap sitting right beside it.
    const envBad = group(desk, -0.1, 0.94, -0.1);
    box(envBad, 0.42, 0.16, 0.02, 0, 0, 0, BAD, { emissive: BAD, ei: 0.9, rough: 0.4 });
    decal(envBad, 0.36, 0.11, 0, 0, 0.012, signFace("PRODUCTION", { bg: "#3a1214", accent: "#f0645b", fg: "#ffd9d5", scale: 0.5 }));
    reg(envBad, "prod-console");

    // Secrets rack — three staging-scoped cards plus one prod card as the trap.
    const secretsRack = group(desk, 0.7, 0.94, -0.12);
    const secretDefs = [
      { id: "staging-db-secret", label: "DB · staging", x: -0.42 },
      { id: "staging-api-key", label: "API · staging", x: -0.14 },
      { id: "staging-webhook", label: "HOOK · staging", x: 0.14 },
      { id: "prod-db-secret", label: "DB · PROD", x: 0.42, bad: true },
    ];
    for (const s of secretDefs) {
      const card = group(secretsRack, s.x, 0, 0);
      slab(card, 0.24, 0.03, 0.34, 0, 0, 0, s.bad ? 0x3a1e1e : 0x1e2a24, { rough: 0.5, radius: 0.01 });
      decal(card, 0.2, 0.28, 0, 0.017, 0, signFace(s.label, {
        bg: s.bad ? "#3a1214" : "#0d2b22", accent: s.bad ? "#f0645b" : "#59c97b",
        fg: s.bad ? "#ffd9d5" : "#8ef0c0", scale: 0.5,
      })).rotation.x = -Math.PI / 2;
      reg(card, s.id);
    }

    // Token rack — the scoped token and the admin key sitting next to it.
    const tokenRack = group(desk, 1.35, 0.94, -0.1, -0.15);
    const scoped = group(tokenRack, -0.16, 0, 0);
    cyl(scoped, 0.05, 0.05, 0.14, 0, 0.07, 0, VIOLET, { rough: 0.35, metal: 0.5, seg: 16 });
    decal(scoped, 0.08, 0.1, 0, 0.14, 0.052, signFace("SCOPED", { bg: "#221b3a", accent: "#a89bff", fg: "#e6e1ff", scale: 0.45 }))
      .rotation.x = -Math.PI / 2;
    reg(scoped, "scoped-token");

    const admin = group(tokenRack, 0.18, 0, 0);
    cyl(admin, 0.06, 0.06, 0.16, 0, 0.08, 0, WARN, { rough: 0.3, metal: 0.6, seg: 16 });
    decal(admin, 0.1, 0.1, 0, 0.16, 0.062, signFace("ADMIN", { bg: "#3a2c12", accent: "#f2ae14", fg: "#ffe6a8", scale: 0.5 }))
      .rotation.x = -Math.PI / 2;
    reg(admin, "admin-token");

    // -------------------------------------------------------------- diff screen
    const diffPost = group(root, -2.9, 0, -1.9, 0.35);
    box(diffPost, 0.06, 1.3, 0.06, 0, 0.65, 0, OPS_DARKSTEEL, { rough: 0.6, metal: 0.4 });
    const diffScreen = decal(diffPost, 0.62, 0.44, 0, 1.28, 0.05,
      paperFace("AGENT DIFF · build 1a2f9c", [
        "+  retry: exponential backoff",
        "+  timeout: 30s → 12s",
        "-  feature flag: legacy_route",
        "  3 files changed",
      ]), { glow: true, ei: 0.55 });
    reg(diffScreen, "agent-diff");

    // ------------------------------------------------------- canary console
    const canaryDesk = counter(root, 2.1, 0.7, -3.0, 1.5, 0x39424b, { height: 0.88, metal: 0.4, rough: 0.5, ry: 0.5 });

    // Canary dial — a rotary control that opens traffic.
    const dialBody = group(canaryDesk, -0.55, 0.9, 0.1);
    cyl(dialBody, 0.13, 0.13, 0.05, 0, 0, 0, 0x22262b, { rough: 0.4, metal: 0.6, seg: 24 });
    decal(dialBody, 0.22, 0.07, 0, 0.16, 0.03, signFace("CANARY TRAFFIC", { scale: 0.5 }));
    const dialHandle = group(dialBody, 0, 0.001, 0.03);
    box(dialHandle, 0.02, 0.11, 0.02, 0, 0.055, 0, VIOLET, { emissive: VIOLET, ei: 1.0, rough: 0.4 });
    cyl(dialHandle, 0.018, 0.018, 0.05, 0, 0, 0, OPS_STEEL, { rough: 0.3, metal: 0.9, seg: 12 }).rotation.x = Math.PI / 2;
    reg(dialHandle, "canary-dial");

    // Canary monitor — a live needle gauge for error rate.
    const monitor = group(canaryDesk, 0.05, 0.9, 0.06);
    box(monitor, 0.5, 0.36, 0.03, 0, 0.2, 0, 0x11151a, { rough: 0.5 });
    const monScreen = decal(monitor, 0.44, 0.3, 0, 0.2, 0.017,
      signFace("0.0%", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.55 }), { glow: true, ei: 0.7 });
    reg(monitor, "canary-monitor");

    // Promote lever — a distinct, larger throw, separate from the canary dial.
    const leverBody = group(canaryDesk, 0.62, 0.9, 0.08);
    box(leverBody, 0.14, 0.05, 0.16, 0, 0, 0, 0x22262b, { rough: 0.45, metal: 0.5 });
    decal(leverBody, 0.13, 0.06, 0, 0.03, 0.09, signFace("PROMOTE", { bg: "#241c3d", accent: "#a89bff", scale: 0.45 }));
    const leverArm = group(leverBody, 0, 0.026, 0);
    box(leverArm, 0.025, 0.16, 0.025, 0, 0.08, 0, WARN, { emissive: WARN, ei: 0.9, rough: 0.4 });
    ball(leverArm, 0.03, 0, 0.17, 0, 0x2c3238, { rough: 0.4 });
    reg(leverArm, "promote-lever");

    // ------------------------------------------------------------ kill switch
    const killPost = group(root, 3.4, 0, 0.6, -0.5);
    box(killPost, 0.16, 1.15, 0.16, 0, 0.58, 0, OPS_DARKSTEEL, { rough: 0.55, metal: 0.5 });
    box(killPost, 0.3, 0.1, 0.3, 0, 1.16, 0, 0x22262b, { rough: 0.5 });
    decal(killPost, 0.26, 0.1, 0, 1.35, 0.16, signFace("ROLLBACK", { bg: "#3a1214", accent: "#f0645b", scale: 0.55 }));
    const killGuard = torus(killPost, 0.12, 0.02, 0, 1.16, 0.12, BAD, { rough: 0.4 });
    killGuard.rotation.x = Math.PI / 2;
    const killButton = cyl(killPost, 0.1, 0.1, 0.06, 0, 1.18, 0.1, BAD, { emissive: BAD, ei: 1.3, rough: 0.35, seg: 20 });
    reg(killButton, "kill-switch");

    // ------------------------------------------------------------ audit desk
    const auditDesk = counter(root, 1.7, 0.6, 3.2, -0.3, 0x33393f, { height: 0.85, metal: 0.35, rough: 0.5, ry: Math.PI });
    const auditScreen = decal(auditDesk, 0.5, 0.34, 0, 0.9, -0.05,
      signFace("AUDIT LOG", { bg: "#141a20", accent: "#7c6fea", fg: "#d8d3ff", scale: 0.5 }), { glow: true, ei: 0.5 });
    reg(auditScreen, "audit-terminal");
    for (let i = 0; i < 8; i++) box(auditDesk, 0.03, 0.015, 0.03, -0.3 + (i % 4) * 0.07, 0.63, -0.08 + Math.floor(i / 4) * 0.05, 0x22262b, { rough: 0.6, cast: false });

    // ------------------------------------------------------ ambience & motion
    const key = new THREE.DirectionalLight(0xc9d6ea, 1.1);
    key.position.set(2.4, 5.4, 2.6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -6; key.shadow.camera.right = 6;
    key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
    root.add(key);
    root.add(new THREE.HemisphereLight(0x6a7fae, 0x1a1f28, 1.15));

    const alertLight = new THREE.PointLight(BAD, 0, 6, 2);
    alertLight.position.set(0.7, 1.3, -1.9);
    root.add(alertLight);
    const sparks = particles(secretsRack, 40, BAD, { size: 0.02, life: 0.3 });
    let alertTimer = 0;

    // The bay is 14.6m by 13.9m now. Push the workstations out to match, so
    // the extra floor is distance between jobs rather than empty ring.
    spreadLayout(root, 1.62);

    // Fittings on a grid sized to this floor, plus the bounce a real room
    // has and this one did not: see ceilingGrid in shared/kit.js.
    ceilingGrid(root, 14.6, 13.9, { color: 0xbcd4ea, ei: 1.15, lamp: 0.95, y: 4.04 });

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.4, -2.0),

      onHazard(hitId) {
        if (hitId === "prod-db-secret" || hitId === "admin-token" || hitId === "prod-console") alertTimer = 0.5;
      },

      onStepComplete(step) {
        if (step.id === "killswitch") {
          repaint(auditScreen, signFace("ROLLBACK OK", { bg: "#0d2b22", accent: "#59c97b", fg: "#8ef0c0", scale: 0.5 }));
        }
      },

      animate(t, dt, session) {
        killButton.material.emissiveIntensity = 1.0 + 0.5 * Math.sin(t * 3);

        const g = session?.gauge;
        if (g && !g.committed) {
          const v = (g.t * 6.2).toFixed(1);
          const healthy = g.t >= 0.02 && g.t <= 0.24;
          repaint(monScreen, signFace(`${v}%`, {
            bg: healthy ? "#0d2b22" : "#3a1214", accent: healthy ? "#59c97b" : "#f0645b",
            fg: healthy ? "#8ef0c0" : "#ffd9d5", scale: 0.55,
          }));
        }

        if (alertTimer > 0) {
          alertTimer -= dt;
          sparks.visible = true;
          sparks.userData.step(dt, new THREE.Vector3(0, 0.05, 0), 0.3, 2.2, -4.2);
          alertLight.intensity = alertTimer > 0 ? 10 * Math.random() : 0;
        } else if (sparks.visible) {
          sparks.visible = false;
          alertLight.intensity = 0;
        }
      },
    };
  },
};
