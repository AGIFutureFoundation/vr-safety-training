/**
 * Generates a real, scored safety-training procedure from a template +
 * equipment noun — the room object shape this returns is played through
 * the actual Session engine from shared/game.js, the same one every
 * hand-authored SmartCiti.X and Trade Skills room uses. Nothing about the
 * scoring, hazards or combo system is a toy version; only the content
 * (which steps, which equipment) is generated rather than hand-authored.
 *
 * Two templates today (lockout & verify, confined-space entry), each
 * applicable to any equipment noun in the registry — proving the
 * generator isn't one hardcoded procedure, the same way three themes
 * prove themes.js isn't hardcoded to Alaska.
 */

export const EQUIPMENT = [
  { id: "electrical-panel", noun: "electrical panel", keywords: ["electrical panel", "breaker panel", "panel", "circuit"], accent: "#4fd1ff", energy: "electrical", unit: "V", max: 480 },
  { id: "forklift", noun: "forklift", keywords: ["forklift", "lift truck"], accent: "#f2c14b", energy: "hydraulic", unit: "PSI", max: 2200 },
  { id: "boiler", noun: "boiler", keywords: ["boiler", "steam"], accent: "#f0645b", energy: "thermal", unit: "PSI", max: 150 },
  { id: "conveyor", noun: "conveyor line", keywords: ["conveyor", "belt line"], accent: "#ff8a3c", energy: "mechanical", unit: "V", max: 480 },
  { id: "compressor", noun: "air compressor", keywords: ["compressor", "air tank"], accent: "#59c97b", energy: "pneumatic", unit: "PSI", max: 175 },
  { id: "tank", noun: "storage tank", keywords: ["tank", "vessel", "silo"], accent: "#a079ff", energy: "atmospheric", unit: "% O₂", max: 21 },
];
export const DEFAULT_EQUIPMENT_ID = "electrical-panel";

export const TEMPLATES = [
  { id: "lockout", name: "Lockout & Verify", keywords: ["lockout", "loto", "tag out", "tagout", "isolate", "isolation", "de-energize", "deenergize"] },
  { id: "confined-space", name: "Confined Space Entry", keywords: ["confined space", "permit space", "vessel entry", "tank entry", "enclosed space"] },
];
export const DEFAULT_TEMPLATE_ID = "lockout";

export function findEquipment(id) {
  return EQUIPMENT.find((e) => e.id === id) ?? EQUIPMENT.find((e) => e.id === DEFAULT_EQUIPMENT_ID);
}
export function findTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID);
}

const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

function lockoutSteps(eq) {
  return [
    {
      id: "workorder", kind: "select", target: "work-order",
      title: `Read the ${eq.noun} work order`,
      cue: `Confirm the task and the isolation point listed for this ${eq.noun}.`,
      why: `Every isolation starts with knowing exactly which ${eq.noun} and which energy source you are working on — not the one that looks similar next to it.`,
    },
    {
      id: "isolate", kind: "turn", target: "disconnect",
      title: `Isolate the ${eq.noun}`,
      cue: "Rotate the main disconnect to off.",
      why: `This is what actually removes ${eq.energy} energy from the ${eq.noun} — stopping it from running is not the same thing as isolating it.`,
      turn: { turns: 0.2, axis: "z", reverse: true, label: "MAIN DISCONNECT" },
    },
    {
      id: "lock", kind: "select", target: "hasp",
      title: "Apply your lock",
      cue: "Lock the disconnect with your own padlock.",
      why: "Your lock is what says nobody re-energizes it while you are still on the job — not a note, not a verbal heads-up.",
    },
    {
      id: "verify", kind: "gauge", target: "meter",
      title: "Verify zero energy",
      cue: `Meter the ${eq.noun} and commit only once it reads dead.`,
      why: "The disconnect being open is not proof by itself — a fault or a miswired feed can leave a path live. You confirm it the same way every time.",
      gauge: {
        label: `${eq.energy.toUpperCase()} — ${eq.unit}`, speed: 0.65, green: [0.0, 0.1],
        readout: (t) => `${Math.round(t * eq.max)} ${eq.unit}`,
        missNote: "Still reading live. Recheck the disconnect before the task starts.",
      },
    },
    {
      id: "task", kind: "select", target: "task-point",
      title: "Complete the task",
      cue: `Do the work on the ${eq.noun} now that it is proven dead.`,
      why: "With zero energy confirmed, the task itself is finally just a mechanical job, not a hazard.",
    },
    {
      id: "restore", kind: "select", target: "disconnect",
      title: "Remove your lock and restore",
      cue: "Remove your lock and close the disconnect once you are clear.",
      why: "Your lock, your call — nobody else takes it off, and you confirm you are the last one clear before it comes off.",
    },
  ];
}

function confinedSpaceSteps(eq) {
  return [
    {
      id: "permit", kind: "select", target: "permit-board",
      title: "Read the entry permit",
      cue: `Confirm the ${eq.noun} entry permit and the hazards listed on it.`,
      why: "A confined-space permit is what says this specific space was actually evaluated today, not assumed safe from the last entry.",
    },
    {
      id: "atmosphere", kind: "gauge", target: "meter",
      title: "Test the atmosphere",
      cue: `Meter the ${eq.noun} and commit only inside the safe range.`,
      why: "A confined space can turn oxygen-deficient or toxic with no smell and no colour to warn you first.",
      gauge: {
        label: "ATMOSPHERE — OXYGEN", speed: 0.6, green: [0.46, 0.6],
        readout: (t) => `${(15 + t * 12).toFixed(1)}%`,
        missNote: "Outside the safe range. Ventilate and re-test before anyone enters.",
      },
    },
    {
      id: "ventilate", kind: "select", target: "vent-fan",
      title: "Ventilate the space",
      cue: `Start forced-air ventilation on the ${eq.noun}.`,
      why: "Continuous ventilation is what keeps a tested-safe reading from drifting the moment someone is actually inside.",
    },
    {
      id: "attendant", kind: "select", target: "attendant",
      title: "Post an attendant",
      cue: "Confirm an attendant is posted at the entry point before anyone goes in.",
      why: "The attendant outside is the only line of communication and the one who triggers rescue if something goes wrong inside.",
    },
    {
      id: "task", kind: "select", target: "task-point",
      title: "Complete the task",
      cue: `Do the work inside the ${eq.noun}.`,
      why: "The task only starts once the atmosphere, the ventilation and the attendant are all already in place — not run in parallel with them.",
    },
    {
      id: "exit", kind: "select", target: "permit-board",
      title: "Confirm exit and close the permit",
      cue: "Confirm everyone is out, then close the permit.",
      why: "Closing the permit is what tells the next crew this space is no longer an open entry.",
    },
  ];
}

export function buildTrainingRoom({ templateId, equipmentId }) {
  const eq = findEquipment(equipmentId);
  const tpl = findTemplate(templateId);
  const isConfinedSpace = tpl.id === "confined-space";
  const steps = isConfinedSpace ? confinedSpaceSteps(eq) : lockoutSteps(eq);
  const hazards = isConfinedSpace
    ? {
      "vent-fan-off": `Entering with ventilation off risks the atmosphere drifting the moment anyone is actually inside the ${eq.noun}.`,
      "no-attendant": `No attendant posted — nobody outside would know if someone inside the ${eq.noun} needed help.`,
    }
    : {
      "disconnect-hot": `That disconnect is still live. Touching a live ${eq.noun} circuit is exactly what lockout exists to prevent.`,
      "no-lock": `Working on the ${eq.noun} without your own lock means anyone could re-energize it while you are still on it.`,
    };

  return {
    id: `gen-${tpl.id}-${eq.id}`,
    title: `${titleCase(eq.noun)} — ${tpl.name}`,
    tagline: `A generated ${tpl.name.toLowerCase()} procedure for a ${eq.noun}.`,
    accentCss: eq.accent,
    parSeconds: steps.length * 24,
    hazards,
    steps,
    templateId: tpl.id,
    equipment: eq,
  };
}
