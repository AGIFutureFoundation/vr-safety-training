/**
 * Training programmes: the ordered sets of stations a hall actually buys.
 *
 * A station on its own teaches one procedure. What a training director runs
 * is a programme — a first-period apprentice block, a confined-space
 * qualification, a fall-protection refresher — with an order, a reason for
 * each station being in it, and a completion rule they can show a regulator.
 * This file is that layer. It holds no scoring of its own: a station counts
 * toward a programme when the shared training record says it was passed
 * (two or more stars, no unsafe action), which is the same bar the
 * certificate claim rests on.
 *
 * Stations are named by app and id so a programme can cross SmartCiti.X and
 * the Trade Skills Simulator, which is what a real apprenticeship does.
 * `tools/check_smartcity.mjs` fails the build if any id here does not exist.
 */

export const CURRICULA = [
  {
    id: "electrical-first-period",
    name: "Inside Wireman — First Period",
    union: "IBEW — International Brotherhood of Electrical Workers",
    certification: "NFPA 70E work practices and OSHA 1910.147 control of hazardous energy, as taught in an IBEW/NECA JATC first-period block",
    summary: "The isolation habit, built four ways: a panel, a substation feeder, an overhead circuit and a live-load charger. Every station in this block ends with something proven dead before it is touched.",
    accent: "#5aa9ff",
    stations: [
      { app: "trades", id: "electrical", why: "The bench case: lockout, tagout and live-dead-live on a 480 V panel, with nothing else going on." },
      { app: "smartcity", id: "charge-point", why: "The same habit under a live utility service, where the load is a vehicle and the public is a metre away." },
      { app: "smartcity", id: "substation-switching", why: "Isolation as a written switching order with a read-back, which is how it is done once the circuit leaves the building." },
      { app: "smartcity", id: "line-truck", why: "Overhead: the same sequence with cover-up, an approach boundary and a bucket." },
      { app: "smartcity", id: "battery-yard", why: "Direct current, where the arc does not self-extinguish and the bleed-down wait is the whole discipline." },
    ],
  },
  {
    id: "confined-space",
    name: "Confined Space — Entry and Rescue",
    union: "LIUNA, UA, IUOE and IAFF technical rescue",
    certification: "OSHA 29 CFR 1910.146 permit-required confined spaces, with NFPA 1006 rescue technician for the last station",
    summary: "Four spaces and the rescue. The first three build the permit, the atmosphere and the attendant; the last one is what happens when all of that failed for somebody else.",
    accent: "#4fd1ff",
    stations: [
      { app: "smartcity", id: "valve-vault", why: "The permit itself: testing in order, a guarded opening and an attendant who never leaves." },
      { app: "smartcity", id: "lift-station", why: "A wet well, where the atmosphere changes while you are in it and the pumps are the second hazard." },
      { app: "smartcity", id: "chlorine-room", why: "A space you do not enter blind: the monitor and the air pack are read and staged from outside the door." },
      { app: "smartcity", id: "confined-rescue", why: "The rescue, including the part where the first job is stopping a coworker from becoming the second patient." },
    ],
  },
  {
    id: "fall-protection",
    name: "Working at Height — Fall Protection",
    union: "Ironworkers, Carpenters, CWA and NATE climbers",
    certification: "OSHA 29 CFR 1926 Subpart M fall protection, Subpart L scaffolds, and ANSI Z359 personal fall-arrest systems",
    summary: "Anchor, connect, and the thing you are standing on. Four heights, four different reasons the system has to be right before the first step off the deck.",
    accent: "#f2c14b",
    stations: [
      { app: "smartcity", id: "scaffold-erection", why: "Building the platform: the order in which a scaffold becomes safe to stand on, and the green tag that says so." },
      { app: "smartcity", id: "steel-erector", why: "Connecting steel, where the anchor moves with the work and the decking is not yet there." },
      { app: "smartcity", id: "tower-climb", why: "A climb with a hundred metres under it: the transitions are where people fall." },
      { app: "smartcity", id: "microwave-backhaul", why: "A rooftop parapet, where the hazard is the edge and everything dropped lands on a public footpath." },
      { app: "smartcity", id: "aerial-ladder", why: "An aerial device, where the platform is the thing that has to be set level before anyone is on it." },
    ],
  },
  {
    id: "hazmat-environmental",
    name: "Hazmat and Environmental Response",
    union: "LIUNA hazmat and environmental crews, IAFF, and environmental technicians",
    certification: "OSHA 29 CFR 1910.120 HAZWOPER, NFPA 470 hazardous materials response, and Clean Water Act / Clean Air Act monitoring practice",
    summary: "Containment, decontamination and the numbers a neighbourhood relies on. This block runs from the release to the sample bottle, and opens with the real history of one site.",
    accent: "#78c8a0",
    stations: [
      { app: "smartcity", id: "hunters-point", why: "A sourced briefing on a real Superfund shipyard cleanup and the community monitoring around it, before any simulated work." },
      { app: "smartcity", id: "abatement-chamber", why: "Containment done properly: negative pressure, a clean room, and a decon order that keeps the fibre inside." },
      { app: "smartcity", id: "decon-line", why: "The corridor: zones set by the wind, pools in order, and runoff that stays in the berm." },
      { app: "smartcity", id: "air-monitor", why: "Fence-line monitoring: placement, calibration and an exceedance response that happens now." },
      { app: "smartcity", id: "stormwater-outfall", why: "The wet-weather grab, on the permit clock, with a chain of custody that makes it evidence." },
      { app: "trades", id: "pressure-washer", why: "Surface prep, where the runoff is the pollutant and the stormwater plan is the reason for the containment." },
    ],
  },
  {
    id: "rigging-lifting",
    name: "Rigging and Lifting",
    union: "Ironworkers, IUOE crane operators, ILWU and IATSE riggers",
    certification: "ASME B30 rigging and crane practice, NCCCO operator knowledge, and ETCP entertainment rigging for the theatre station",
    summary: "Load, radius, chart, and what is under the load. Five lifts in five industries that all fail the same way.",
    accent: "#a079ff",
    stations: [
      { app: "smartcity", id: "crane-yard", why: "The load chart and the pick plan, plus programming the anti-collision zone the yard actually needs." },
      { app: "smartcity", id: "dock-crane", why: "Container work at height and speed, where the wind limit is a hard stop." },
      { app: "smartcity", id: "chain-hoist", why: "Manual lifting hardware: inspection, capacity and the load path through a structure that was not designed for it." },
      { app: "smartcity", id: "rigging-loft", why: "Overhead rigging above people, with automation cues that have to be proven before the house opens." },
      { app: "smartcity", id: "fly-system", why: "Counterweight: the one rigging system where the operator is holding the other half of the load in their hands." },
    ],
  },
  {
    id: "stationary-engineer",
    name: "Stationary Engineer — Building Plant",
    union: "IUOE — International Union of Operating Engineers, stationary locals",
    certification: "State stationary engineer licence, ASME boiler practice, ASHRAE 188 water management and NFPA 25 fire-pump testing",
    summary: "The four plants a building engineer is responsible for at two in the morning, and the tests that prove each one will work when it is needed.",
    accent: "#6fc9e8",
    stations: [
      { app: "smartcity", id: "boiler-room", why: "Start-up and purge: the sequence that stops a furnace explosion." },
      { app: "smartcity", id: "chiller-plant", why: "Refrigerant, isolation and the machine that is the building's whole cooling capacity." },
      { app: "smartcity", id: "cooling-tower", why: "The Legionella task: the tower is the one plant that can make the neighbourhood sick." },
      { app: "smartcity", id: "fire-pump", why: "The annual flow test, where the curve either matches the nameplate or the building has no fire protection." },
      { app: "smartcity", id: "elevator-pit", why: "The pit: a confined space with a moving car above it, entered by the person who maintains it." },
    ],
  },
  {
    id: "port-operations",
    name: "Port and Terminal Operations",
    union: "ILWU longshore, MEBA and SIU marine engineers, IBT terminal drivers",
    certification: "USCG 33 CFR 155/156 oil transfer, IMO Cargo Securing Manual practice, and OSHA 1917 marine terminals",
    summary: "A ship comes alongside, is secured, is fuelled, is worked and leaves. Four stations that follow that order, each with a different way to put oil or steel where it should not be.",
    accent: "#3fa9d8",
    stations: [
      { app: "smartcity", id: "mooring-line", why: "Taking the lines: snap-back zones and the bight nobody stands in." },
      { app: "smartcity", id: "bunkering-watch", why: "Fuel transfer as person in charge, with the deck contained before the hose comes aboard." },
      { app: "smartcity", id: "container-lashing", why: "Deck stow: every twist-lock proven and the rods to the pattern the manual calls for." },
      { app: "smartcity", id: "dock-crane", why: "The crane over all of it, with the lashing gang's positions as the constraint." },
    ],
  },
  {
    id: "transit-ramp",
    name: "Transit and Ramp Operations",
    union: "ATU, TWU, IAM and IBEW signal locals",
    certification: "FRA roadway-worker protection, FTA rail transit safety practice, FAA 14 CFR 139 airfield operations and OSHA 1910.178 for powered equipment",
    summary: "Four places where a vehicle that weighs tonnes moves near people on foot, and the protection that has to exist before anyone steps out.",
    accent: "#63b5f0",
    stations: [
      { app: "smartcity", id: "track-access", why: "Roadway-worker protection: the authority, the watchman and the clear time before the rail is occupied." },
      { app: "smartcity", id: "signal-cabinet", why: "Working inside the system that keeps trains apart, without taking the protection down with you." },
      { app: "smartcity", id: "bus-depot-lift", why: "A vehicle raised over a person, and the supports that go in before anyone is underneath." },
      { app: "smartcity", id: "airport-ramp", why: "An aircraft turn, where chocks before contact is the rule the whole ramp runs on." },
      { app: "smartcity", id: "forklift-dock", why: "The dock: a trailer that creeps and a load that tips, on the most common powered truck in the country." },
    ],
  },
  {
    id: "energy-transition",
    name: "Energy Transition Systems",
    union: "IBEW outside construction and utility locals",
    certification: "NFPA 70E, NFPA 855 energy storage, NEC Article 690 photovoltaic systems and utility interconnection practice",
    summary: "The plant a utility is building now: solar, storage, charging and the substation that ties them together. Direct current behaves differently, and every station here is about that difference.",
    accent: "#9fd84f",
    stations: [
      { app: "smartcity", id: "solar-deck", why: "A photovoltaic array that is energised whenever the sun is up and cannot be switched off at the panel." },
      { app: "smartcity", id: "battery-yard", why: "Grid storage: AC before DC, the bleed-down and the thermal event you are trying not to start." },
      { app: "smartcity", id: "charge-point", why: "The load end: high-current DC in a public place." },
      { app: "smartcity", id: "substation-switching", why: "The interconnection, switched on a written order with grounds proven on." },
      { app: "smartcity", id: "cell-site-battery", why: "A smaller string in a cabinet, where the same chemistry is maintained by one person alone at night." },
    ],
  },
  {
    id: "live-events",
    name: "Live Events Production",
    union: "IATSE — International Alliance of Theatrical Stage Employees",
    certification: "ETCP Certified Rigger and Certified Entertainment Electrician, ANSI E1.4-1 counterweight rigging and NFPA 70E for the power tie-in",
    summary: "A load-in from the truck to the house lights, in the order a call actually runs, with the two things that kill on a stage: what is overhead and what is energised.",
    accent: "#c58cff",
    stations: [
      { app: "smartcity", id: "stage-power", why: "The company switch tie-in: cam-locks ground first, and the phase check before anything is energised." },
      { app: "smartcity", id: "fly-system", why: "Loading a lineset, where an unbalanced arbor is a runaway with a person on the rope." },
      { app: "smartcity", id: "rigging-loft", why: "Points overhead, with automation cues proven before the house is let in." },
      { app: "smartcity", id: "chain-hoist", why: "Motors: inspection, capacity and never leaving a load hanging on a brake." },
    ],
  },
  {
    id: "situational-awareness",
    name: "Situational Awareness — Interruption Drill",
    union: "Cross-craft — run as a refresher block by IBEW, UA, LIUNA, Ironworkers and IAFF locals",
    certification: "OSHA 1926.20(b)(2) competent-person hazard recognition and the human-factors component every one of these standards assumes: NFPA 70E, 1910.146 permit spaces, 1926.651 excavations, 1926.1400 cranes, NFPA 25 impairment control",
    summary: "Nine procedures that interrupt you while you work. Every station in this block is one you may already know the order of — the block is not testing the order. It is testing whether you notice the alarm, the person in the wrong place or the thing that moved while your hands and eyes were somewhere else. Miss one and it scores as an unsafe action, because that is what it is.",
    accent: "#f0645b",
    stations: [
      { app: "trades", id: "electrical", why: "Your lock comes off the hasp while your eyes are on the meter. The isolation was correct once, and nobody looked at it again." },
      { app: "trades", id: "welding", why: "Two: the extraction trips while you set the machine, and the blanket slips off the conduit run while you lay the bead." },
      { app: "smartcity", id: "trench-box", why: "Spoil creeping back toward the lip above an entrant, and the spotter walking off while you programme a machine path." },
      { app: "smartcity", id: "crane-yard", why: "Somebody cutting through the swing radius to save walking round, and a pad settling out of level with the load in the air." },
      { app: "smartcity", id: "chlorine-room", why: "The room monitor alarming mid-changeout — real until proven otherwise — and an unprotected attendant in an open door during a leak test." },
      { app: "smartcity", id: "confined-rescue", why: "The atmosphere falling while you rig, and the attendant leaving the hole to help on the rope during the haul." },
      { app: "smartcity", id: "substation-switching", why: "An unescorted visitor inside the boundary, and control calling with a verbal change to a written switching order." },
      { app: "smartcity", id: "airport-ramp", why: "A vehicle inbound past an unset equipment line, and a chock a tug kicked clear before the bridge docks." },
      { app: "smartcity", id: "fire-pump", why: "Hot work opened in a building whose sprinklers are impaired for your test, and a gland that goes from a drip to a stream at rated flow." },
    ],
  },
];

/**
 * Progress for one programme against the shared training record.
 * `records` is TrainingRecords.list(); a station counts when it has a
 * passing attempt (two or more stars, no unsafe action).
 */
export function curriculumProgress(curriculum, records = []) {
  const passed = new Set(records.filter((r) => r.passed).map((r) => r.simId));
  const stations = curriculum.stations.map((s) => ({ ...s, done: passed.has(s.id) }));
  const done = stations.filter((s) => s.done).length;
  const next = stations.find((s) => !s.done) ?? null;
  // How the learner has handled the interruptions in this programme's
  // stations. A block built on noticing things needs to be reportable on
  // noticing things, not only on whether the procedure underneath was passed.
  const ids = new Set(curriculum.stations.map((s) => s.id));
  let caught = 0, dropped = 0, runs = 0;
  for (const r of records) {
    const iv = r.debrief?.interrupts;
    if (!iv || !ids.has(r.simId)) continue;
    runs += 1;
    caught += iv.answered | 0;
    dropped += (iv.missed | 0) + (iv.wrong | 0);
  }
  const attention = runs
    ? { runs, caught, dropped, pct: caught + dropped ? Math.round((caught / (caught + dropped)) * 100) : null }
    : null;
  return {
    attention,
    id: curriculum.id, name: curriculum.name, union: curriculum.union,
    certification: curriculum.certification, summary: curriculum.summary, accent: curriculum.accent,
    stations, done, total: stations.length,
    pct: stations.length ? Math.round((done / stations.length) * 100) : 0,
    complete: done === stations.length && stations.length > 0,
    next,
  };
}

/** Every programme's progress, most-advanced-but-unfinished first. */
export function allProgress(records = []) {
  return CURRICULA.map((c) => curriculumProgress(c, records))
    .sort((a, b) => (a.complete === b.complete ? b.pct - a.pct : a.complete ? 1 : -1));
}
