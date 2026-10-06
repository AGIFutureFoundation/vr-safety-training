// VBRIDGE — the plain, dependency-free data behind the agent bridge and its safety
// governor (docs/virtuals-bridge.md). No imports, no functions that do anything,
// JSON round-trips: TQ-ROBOTICS' TradeQuest export reads VB_SHARED from here.
// vb-governor.js and vb-bridge.js import these constants (they are defined only here).
// Simulated robots only; the build holds no token and makes no payments.
//
// SEAM: VB_SHARED = { schema, phases, terminal, moves, roles, memoTypes, deadlineTicks, policies,
//                     governor: { rules, tasks, rigLimits, physical, order, note } }
//
// Every top-level name starts with `VB_` (the bundler shares one scope).

/** Every reason the governor can refuse, in precedence order (the first that applies is `primary`). */
export const VB_REASONS = Object.freeze([
  { id: "estop-held", text: "The site's e-stop is held. The e-stop always wins; nothing moves until a person resets it." },
  { id: "physical-target", text: "The command names a physical robot. Agent commands reach simulated robots only; a physical robot would need a named human approver, and that path is disabled in this build." },
  { id: "malformed", text: "The command is missing a field the governor needs (job, client, task, site, robot, speed, separation or policy)." },
  { id: "unknown-site", text: "No robot site with that id exists in the sim." },
  { id: "task-not-allowed", text: "That task type is not on the allowlist for this site's rig." },
  { id: "unregistered-policy", text: "The policy is not in the registry, so nobody can say what it was trained on." },
  { id: "stale-policy", text: "The policy is stale: it was trained on (or built from) data whose consent was revoked. Retrain before it runs." },
  { id: "over-speed", text: "The requested speed is above the site's limit (or above the reduced speed with a person inside the warning distance)." },
  { id: "inside-separation", text: "A person is closer than the site's minimum separation distance. The robot holds a protective stop." },
]);
export const VB_REASON_IDS = Object.freeze(VB_REASONS.map((r) => r.id));

/** The physical-robot path: needs a named human approver and ships disabled. Frozen; there is no setter. */
export const VB_PHYSICAL = Object.freeze({ enabled: false, requires: "a named human approver at the site, on top of every governor rule", note: "disabled in this build: agent commands reach simulated robots only" });

/** Task types an agent may request (the robot gym's game scenarios), and the rigs that do each. */
export const VB_TASKS = Object.freeze({
  "rb-amr-fleet-routing": { label: "Route warehouse robots to drop-offs", rigs: ["amr", "gantry"] },
  "rb-cobot-zone-setup": { label: "Set and test a cobot's safety zones", rigs: ["cobot"] },
  "rb-teleop-pick-place": { label: "Pick and place parts within force limits", rigs: ["cobot"] },
  "rb-cell-entry": { label: "Cell entry with lockout, verify and restart", rigs: ["cell"] },
});

/** Per-rig limits (procedural simulation parameters, not ratings of any machine). */
export const VB_RIG_LIMITS = Object.freeze({
  amr: { maxSpeed: 1.0, minSeparation: 2.5, warn: 6 },
  gantry: { maxSpeed: 0.8, minSeparation: 2.5, warn: 6 },
  cobot: { maxSpeed: 0.25, minSeparation: 2.5, warn: 6 },
  cell: { maxSpeed: 0.5, minSeparation: 2.5, warn: 6 },
});

/** The provider's own policy table, used when no ENTERPRISE-3 registry is handed in. */
export const VB_PROVIDER_POLICIES = Object.freeze([
  { id: "vb-scripted-expert", method: "scripted", status: "current" },
  { id: "vb-colearn-bc-knn", method: "behaviour-cloning-knn", status: "current" },
  { id: "vb-scripted-lapsing", method: "scripted", status: "current" },
]);

export const VB_SCHEMA = "smartcitix.holodeck.vb-job@1";
/** ACP's job phases, by the SDK's enum numbers (acp-node src/contractClients/baseAcpContractClient.ts AcpJobPhases). */
export const VB_PHASES = Object.freeze(["REQUEST", "NEGOTIATION", "TRANSACTION", "EVALUATION", "COMPLETED", "REJECTED", "EXPIRED"]);
export const VB_TERMINAL = Object.freeze(["COMPLETED", "REJECTED", "EXPIRED"]);
/** The three roles, and who plays each here. */
export const VB_ROLES = Object.freeze({
  client: "an external software agent that asks for a robot task (mocked in this build)",
  provider: "a SmartCiti.X robot-site agent that runs a policy on the SIMULATED robot",
  evaluator: "the scenario's own safe-practice scoring (rb-env summary) and the human supervisor's filed evaluation",
});
/** Memo kinds used here (a subset of the SDK's MemoType, the non-payment ones). */
export const VB_MEMO_TYPES = Object.freeze(["MESSAGE", "OBJECT", "NOTIFICATION"]);
/** Legal phase moves. */
export const VB_MOVES = Object.freeze({ REQUEST: ["NEGOTIATION", "REJECTED", "EXPIRED"], NEGOTIATION: ["TRANSACTION", "REJECTED", "EXPIRED"], TRANSACTION: ["EVALUATION", "REJECTED", "EXPIRED"], EVALUATION: ["COMPLETED", "REJECTED"] });
/** Ticks a job may sit in a non-terminal phase before it expires. */
export const VB_DEADLINE_TICKS = 50;
/** Provider policies a job may name. */
export const VB_POLICIES = Object.freeze({
  "vb-scripted-expert": "the scripted safe-practice expert (rbPolicy skill 1)",
  "vb-colearn-bc-knn": "a COLEARN behaviour-cloning policy (k-nearest-neighbour); the caller hands in colPolicy via policyFor",
  "vb-scripted-lapsing": "the scripted expert at skill 0.5 — it lapses, for supervisor practice",
});

/** Everything above as one plain object (TQ-ROBOTICS' preferred seam). */
export const VB_SHARED = Object.freeze({
  schema: VB_SCHEMA,
  phases: VB_PHASES.map((id, n) => ({ id, n, terminal: VB_TERMINAL.includes(id) })),
  terminal: VB_TERMINAL,
  moves: VB_MOVES,
  roles: VB_ROLES,
  memoTypes: VB_MEMO_TYPES,
  deadlineTicks: VB_DEADLINE_TICKS,
  policies: VB_POLICIES,
  governor: {
    rules: VB_REASONS,
    order: "the first rule that applies is the primary reason; the e-stop always wins",
    tasks: VB_TASKS,
    rigLimits: VB_RIG_LIMITS,
    physical: VB_PHYSICAL,
    note: "Agent-originated commands reach simulated robots only. Every decision is written to a hash-chained audit log (ENTERPRISE-3). Rig limits are procedural simulation parameters (stop and warn distances match RB_SSM), not ratings of any machine.",
  },
});
