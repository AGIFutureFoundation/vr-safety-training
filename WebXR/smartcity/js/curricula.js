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
      // slot-ibew-1
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
    id: "hunters-point-bay-restoration",
    name: "Hunters Point Clean-up and Bay Restoration",
    union: "LIUNA Local 261 hazmat and environmental laborers, IUOE Local 3 operating engineers, Teamsters regulated-soil drivers, Pile Drivers Local 34 (Carpenters), UA Local 38 plumbers and pipefitters, and the Inlandboatmen's Union of the Pacific",
    certification: "OSHA 29 CFR 1910.120 HAZWOPER as the floor for everyone inside the fence; MARSSIM radiological survey practice and NRC 10 CFR 20 for the survey crew; EPA RCRA 40 CFR 262 manifests for the haul; U.S. Army Corps of Engineers Section 404, BCDC and Regional Water Board 401 permit conditions for every hour of in-water work",
    summary: "A Superfund shoreline and the bay beside it, worked in the order a cleanup actually runs: the record first, then survey, then excavation and haul, then the groundwater that stays behind, then the water's edge given back — sediment out, tide back in, marsh planted. The first station is a sourced briefing on the real site and the data-integrity case at the centre of it; every station after it is a union trade doing its part of the work, and the discipline that made the case is taught as procedure: an instrument source-checked before and after, a sample that is the place it came from, and a split for a lab that does not work for you.",
    accent: "#8fd18b",
    stations: [
      { app: "smartcity", id: "hunters-point", why: "The record: what the site is, who oversees it, what the contractor data case established, and where the neighbourhood's own air data comes from — before any simulated work." },
      { app: "smartcity", id: "rad-survey", why: "The gamma walkover done so its numbers can be trusted: source-check, background, grid speed, a static count over the investigation level, a split sample under chain of custody." },
      { app: "smartcity", id: "building-rad-scan", why: "The same discipline turned indoors, on a derelict building ahead of demolition: floor and walls scanned to the plan's coverage, drains scanned as collection points, and a swipe bagged under chain of custody before a roll-up door opens on ground that isn't released yet." },
      { app: "smartcity", id: "air-monitor", why: "Fence-line monitoring for the people on the other side of the fence: placement, calibration, and an exceedance response that happens now." },
      { app: "smartcity", id: "soil-loadout", why: "Excavation and haul-out of what the survey found: zones set from the wind, the face wetted, a lined and manifested truck, and the dust alarm that stops the excavator." },
      { app: "smartcity", id: "haul-road-dust", why: "What keeps that loaded truck from becoming its own dust source once it's rolling: perimeter monitors read against their action level, the road wetted on schedule, a tarped load washed clean at the gate, and the alarm that stops the haul the moment the wind turns." },
      { app: "smartcity", id: "pcb-equipment-removal", why: "A derelict switch room's own hazard, found and taken down as its own regulated shipment: the circuit proven dead and locked out before a wrench touches it, the transformer rigged and lined out on a pallet, and the manifest signed before it ever reaches the gate." },
      { app: "smartcity", id: "transite-pipe-removal", why: "Asbestos-cement pipe out of the same ground as Class II work: wetted and kept wet, cut by hand rather than power tool, bagged where it comes out, and the sampling pump running the whole time." },
      { app: "smartcity", id: "ust-removal", why: "What the survey and the pipe crew leave behind for the ground itself to answer for: a fuel tank pumped and proven inert on the LEL before the pit ever opens wide, rigged and lifted with nobody under the hook, and the pit sampled under chain of custody and fenced before the crew leaves." },
      { app: "smartcity", id: "decon-line", why: "The corridor everyone and everything leaves the exclusion zone through." },
      { app: "smartcity", id: "sampling-well", why: "Low-flow groundwater sampling: the plume's own numbers, volatiles first, chain of custody on every bottle." },
      { app: "smartcity", id: "well-install", why: "The well that sampling-well later draws from, put in by the book: cleared and cased before it is ever sampled, screened at the interval the geology calls for, and sealed so nothing but formation water ever reaches it." },
      { app: "smartcity", id: "pump-and-treat", why: "The system that holds the plume for years after the excavators leave: carbon changed out as hazardous waste, the compliance port sampled, the permit log kept." },
      { app: "smartcity", id: "vapor-mitigation", why: "The plume's other path — up through the slab and into a building's air — cut off at the source: communication proven, the fan hung and vented clear of any intake, and the vacuum verified before anyone signs the placard." },
      { app: "smartcity", id: "isco-injection", why: "Treating the plume pump-and-treat holds rather than only containing it: permanganate mixed to design, a manifold proven tight before it runs, and the injection held in band while the neighbouring wells are watched for oxidant finding its own way back to the surface." },
      { app: "smartcity", id: "stormwater-outfall", why: "The wet-weather grab at the outfall, on the permit clock, because the bay is where the site drains." },
      { app: "smartcity", id: "bioswale-build", why: "What keeps the next storm's runoff from undoing all of it: a bioswale built to the design grade rather than by eye, so the site's own water reaches the bay slower and cleaner than it arrived." },
      { app: "smartcity", id: "dredge-barge", why: "Contaminated sediment out of the bay inside a turbidity curtain, with the scow never over its freeboard line and decant water tested before it goes anywhere." },
      { app: "smartcity", id: "oyster-reef-monitoring", why: "The reef that shoreline built, checked on afterward: fixed quadrats found by tag and GPS, density logged before the frame moves, and the sonde read against the Water Board's own flag level before the flood takes the reef back." },
      { app: "smartcity", id: "marsh-transect-survey", why: "The marsh behind the reef, walked on a fixed line: cover read to protocol class at every quadrat, the invasive hybrid flagged for the control crew, and the transect stopped cold the moment a listed bird flushes near it." },
      { app: "smartcity", id: "sediment-cap", why: "The sediment that stays behind: an engineered cap placed in thin lifts to a design grid, proven by core rather than by eye, and stopped the moment turbidity or a short reading says so." },
      { app: "smartcity", id: "creosote-pile-removal", why: "The derelict structures still standing in the mud: a century-old creosote pile pulled whole inside a curtain of its own, drained over the barge rather than the bay, and any stub it leaves behind marked before the barge moves on." },
      { app: "smartcity", id: "tide-gate", why: "The tide let back into a diked marsh: a self-regulating gate hung at low water, the cofferdam pulled in the order that keeps the levee." },
      { app: "smartcity", id: "living-shoreline", why: "The water's edge rebuilt as habitat — coir, oyster shell, cordgrass at the design elevation — inside the tide window and the fish window." },
      { app: "smartcity", id: "spartina-removal", why: "The planted marsh defended from the cordgrass that would take it over: the treatment map read instead of the eye, a buffer held around a nesting endangered rail no label rate excuses crossing, and the herbicide mixed off the marsh and applied under the wind limit." },
      { app: "smartcity", id: "eelgrass-transplant", why: "The habitat the fill once displaced, replanted underwater: a donor bed cut to its share, shoots bundled inside the clock, and a diver directed to the grid by a supervisor who never gets in the water." },
    ],
  },
  {
    id: "culinary-kitchen",
    name: "Culinary — The Working Kitchen",
    union: "UNITE HERE Local 2 cooks, dishwashers and banquet staff; AFSCME and SEIU school and hospital food service",
    certification: "The FDA Food Code as adopted in the California Retail Food Code, the California Food Handler card and ServSafe manager certification, NFPA 96 for the hood and suppression system, Cal/OSHA's kitchen safety orders, and OSHA 1910.147 for every machine that gets cleaned",
    summary: "Fifteen stations in one kitchen, from the receiving dock to the dish pit. The hazards are the ones a cook actually meets — heat, blades, chemicals, cold, gas and the clock — and the standard behind every step is the one an inspector or a union steward would cite.",
    accent: "#f2a23b",
    stations: [
      { app: "trades", id: "kitchen", why: "The bench case: the line as a first-period cook meets it, before any one hazard is taken apart on its own." },
      { app: "smartcity", id: "knife-skills", why: "The board anchored, the edge honed, and the claw grip that keeps a prep cook's own knuckles between the blade and the cut — plus the mandoline nobody runs bare-handed." },
      { app: "smartcity", id: "slicer-lockout", why: "The deli slicer taken apart for a changeover the way a machine shop would: the cord locked out before the guard comes off, and the interlock proven before power goes back in." },
      { app: "smartcity", id: "bakery-mixer", why: "The 60-quart floor mixer whose guard interlock gets proven, not assumed, before anything goes in the bowl — and whose scrape-down only ever happens on a machine that's actually stopped." },
      { app: "smartcity", id: "fryer-oil-change", why: "The vat only gets opened once it has actually cooled — cold and wheeled beats hot and carried, every single change." },
      { app: "smartcity", id: "hood-suppression", why: "The system over the line only works if the filters, the links and the pull path are checked before the day a flare-up actually tests them." },
      { app: "smartcity", id: "kitchen-gas-shutoff", why: "A gas smell is a procedure, not a guess — no spark searches for it, and the valve, not the nose, decides when the line is clear." },
      { app: "smartcity", id: "walk-in-cooler", why: "Cold storage as its own procedure: the inside release proven before the door is trusted, 41 °F confirmed, and stock put away raw-below-ready in the order the Food Code sets." },
      { app: "smartcity", id: "receiving-dock-food", why: "The delivery that stocks that cooler in the first place: every cold, frozen and hot item probed at the dock and refused outside the Food Code's own limits, before anything reaches a shelf." },
      { app: "smartcity", id: "prep-cooling", why: "The other half of the clock: a cooked batch brought down through 70 °F in two hours and 41 °F in six, with the reheat-or-discard call for the one that misses it." },
      { app: "smartcity", id: "dish-pit", why: "The dish machine and the three-compartment sink: chemical lines checked, the sanitiser strip-tested and logged, and an eyewash proven clear before the first jug is opened." },
      { app: "smartcity", id: "grease-trap", why: "Servicing the under-sink grease interceptor: the confined-space question answered correctly, the 25 percent rule read off the stick, and the waste sealed for the hauler rather than sent down a drain." },
      { app: "smartcity", id: "allergen-control", why: "An allergen order on the line: the ticket called back, the purple board and dedicated pan pulled, and the plate walked to the pass by the cook who built it." },
      { app: "smartcity", id: "banquet-hot-hold", why: "The banquet line: hot boxes probed before they're loaded, chafers lit lid-open, the buffet walked before doors, and a pull-down cooled or discarded to the rule." },
      { app: "smartcity", id: "cafeteria-serving", why: "The school lunch line under the National School Lunch Program: the meal pattern's five components, offer versus serve, the wells probed and the count reconciled for the reimbursement claim." },
      { app: "smartcity", id: "grill-line-burns", why: "The grill and sauté station's own hazard, worked as a drill: handles in, a dry pan, a flambé cleared of the filters, and cool water run the full twenty minutes." },
    ],
  },
  {
    id: "dental-hygiene-unspoken-smiles",
    name: "Dental Hygiene — Unspoken Smiles",
    union: "SEIU and UFCW dental and clinic staff, AFSCME public-health hygienists, and the ADHA as the profession's body",
    certification: "The CDC's Guidelines for Infection Control in Dental Health-Care Settings, OSHA 29 CFR 1910.1030 bloodborne pathogens and 1910.1200 hazard communication, the state dental board's practice act, the EPA amalgam rule (40 CFR 441), and the ADA's radiographic guidance",
    summary: "Fifteen stations that make a hygienist's clinical day — the operatory, the sterilisation centre, the chairside procedures, the emergencies and the outreach van — into scored procedures a training programme can run and record. Every step names the guideline it stands on.",
    accent: "#7fd1c9",
    stations: [
      { app: "trades", id: "phlebotomy", why: "The bench case every clinical trade shares: sharps, bloodborne pathogens and the exposure control plan, before a single dental instrument is picked up." },
      { app: "smartcity", id: "operatory-turnover", why: "The turnover between patients: sharps and instruments contained at the point of use, the disinfectant held to its own label's contact time, barriers changed and nothing left on the tray for the next patient to find." },
      { app: "smartcity", id: "instrument-reprocessing", why: "The sterilisation centre behind that turnover: mechanical cleaning instead of a hand scrub, a chemical indicator in every pack, and the weekly spore test that is the only proof any cycle actually worked." },
      { app: "smartcity", id: "sharps-exposure-response", why: "The needlestick this whole chain exists to prevent: washed, reported at once, and into evaluation inside the hours that make post-exposure prophylaxis worth anything." },
      { app: "smartcity", id: "patient-intake-screening", why: "The first ten minutes with any patient: the history read and flagged, vitals taken, an exam done in order, and consent signed before a single instrument is picked up." },
      { app: "smartcity", id: "radiograph-safety", why: "A bitewing series taken under ALARA, so every exposure this programme's stations show is one the selection criteria actually called for." },
      { app: "smartcity", id: "periodontal-charting", why: "The full periodontal chart that a cleaning is planned around, staged and graded to the 2017 classification rather than read off a single deep number." },
      { app: "smartcity", id: "ultrasonic-scaling", why: "A scaling and root planing appointment run the way NIOSH's own ergonomics guidance and the CDC's waterline standard both assume it will be — waterline verified before the tip touches anyone, and the operator's own wrist held as carefully as the root surface." },
      { app: "smartcity", id: "aerosol-management", why: "Turning the same operatory over for an aerosol-generating procedure: the room's own air changes and a HEPA unit sized to them, an N95 seal-checked every time, and a fallow time the chair has to earn before the next patient sits down." },
      { app: "smartcity", id: "fluoride-and-sealants", why: "Preventive care on a child: a measured varnish dose for the age in the chair, then sealants etched to the label's time, rinsed to the frosted look, and recorded for the recall so the programme can show what it retained." },
      { app: "smartcity", id: "nitrous-oxide-monitoring", why: "The hygienist's own separate permit at work: screening, the fail-safe, scavenging and a titration held inside NIOSH's exposure limit and the board's ceiling on the concentration itself." },
      { app: "smartcity", id: "chairside-emergency", why: "The chair's worst afternoon: a syncope that will not resolve, an anaphylaxis to the local anaesthetic, and the office emergency kit and the AED carrying the response from there." },
      { app: "smartcity", id: "amalgam-waste-handling", why: "The mercury side of the same clinic: a certified separator, scrap routed to one labelled stream instead of the trash or the sharps, and a manifest to the recycler at the end of it." },
      { app: "smartcity", id: "mobile-dental-outreach", why: "The clinical day carried off the operatory entirely: an RDHAP's community-practice rules and the CDC's mobile-setting guidance, run from a van's side door rather than a fixed room." },
      { app: "smartcity", id: "pediatric-visit", why: "The youngest patient this programme sees: tell-show-do and a plan that bends to a five-year-old's cooperation, with the referral as the answer when a parent asks for more than a hygienist's scope allows." },
      { app: "smartcity", id: "oral-cancer-screening", why: "The screening every adult recall should already include: a fixed extraoral-to-intraoral order, a finding described in terms a surgeon can act on, and the two-week rule that decides whether it waits or it's referred today." },
    ],
  },
  {
    id: "bartending-course",
    name: "Bartending — Behind the Bar",
    union: "UNITE HERE Local 2 bartenders and barbacks",
    certification: "California ABC Responsible Beverage Service certification (mandatory for anyone serving alcohol since 2022), TIPS or ServSafe Alcohol, the California Retail Food Code for ice and glassware, Cal/OSHA's workplace violence prevention plan requirement, and California Labor Code 351 on tips",
    summary: "Fifteen stations from opening the well to closing the till, and the customers in between: the one who is twenty, the one who has had enough, the one who will not take no, and the one whose drink was touched while she looked away. Every step names the law or the standard a bartender is held to.",
    accent: "#b8862b",
    stations: [
      { app: "trades", id: "kitchen", why: "The kitchen the bar shares a wall with: the Food Code for ice, glassware and the sanitiser bucket, before a single drink is poured." },
      { app: "smartcity", id: "bar-well-setup", why: "Opening the bar itself: sanitiser tested to strength, the ice well burned out and refilled with a scoop that never touches a glass, garnish gloved and dated, and the licence and RBS certificates posted before the first guest is let in." },
      { app: "smartcity", id: "id-check-underage", why: "The door: F.L.A.G. worked in order, a UV check against the security features, the birth-date math done against the calendar, and a refusal that is polite, documented and handed off to the rest of the bar." },
      { app: "smartcity", id: "jigger-pour-spec", why: "The pour itself: the standard drink measured to the jigger, a counted free pour held steady, shaken, stirred and built each to its own method, and the round logged per customer the way RBS training expects." },
      { app: "smartcity", id: "cutoff-overservice", why: "The RBS cues read in a real guest, the pour slowed before it is refused outright, and the cutoff itself said quietly once, backed by §25602 and the dram-shop exposure it carries for the licence." },
      { app: "smartcity", id: "spiked-drink-response", why: "Patron safety when the cues are somebody else's drink, not his own tab: the rail watched, the safe-word scheme posted, and a suspect glass retained rather than rinsed the moment a guest is not the person her count says she should be." },
      { app: "smartcity", id: "patron-deescalation", why: "A confrontation worked from behind the bar's own barrier — named once, backed up, refused — with the panic button the instant a hand crosses the bar and the 8 CCR §3342 log it leaves behind." },
      { app: "smartcity", id: "keg-cellar-co2", why: "The barback's own cellar: CO2 and nitrogen chained upright, the room monitor read before the door ever opens, and the change worked coupler off, coupler on, leak-checked at the gauge." },
      { app: "smartcity", id: "ice-well-breakage", why: "A glass breaks into the well mid-service: the well stopped and marked, the ice burned down rather than picked through, and the cut it leaves you treated to the same bloodborne-pathogens plan as any other bar-top spill." },
      { app: "smartcity", id: "draught-line-cleaning", why: "The lines cleaned to the cleaner's own SDS: taps tagged before the chemical goes in, contact time held, and nothing reconnected until the strip reads a neutral pH." },
      { app: "smartcity", id: "till-drop-robbery", why: "The till counted down with a witness and dropped with an escort, and the plan for the night somebody demands it instead: comply, don't chase, and let the alarm and the police do the rest." },
      { app: "smartcity", id: "allergen-cocktail", why: "The nut liqueurs, the egg white, the dairy and the gluten a label — not a memory — actually discloses, dedicated tools for the order that needs them, and the auto-injector found fast if it ever comes to that." },
      { app: "smartcity", id: "last-call-lockup", why: "The last hour of the shift as its own procedure: last call on the ABC's clock, the \"one more\" refused, rides checked, the restrooms swept, and the building locked down behind a crew that walked out together." },
      { app: "smartcity", id: "tip-pool-labor", why: "The paycheck the drinks pay for: the jar counted in the open, a lawful pool with no manager's hand in it, the breaks and the split shift entered honest, and the steward standing behind the sheet." },
      { app: "smartcity", id: "wvpp-panic-button", why: "The workplace violence prevention plan proven rather than filed: the panic button tested to dispatch, the hazard walk run before the smoking area goes dark, and the log kept honest enough for the safety committee to trust." },
      { app: "smartcity", id: "rbs-service-capstone", why: "The whole course, down one rail in real time: an ID checked, a fourth round cut off, a carry-out refused, a round poured to spec, and a drink nobody should ever hand back." },
    ],
  },
  {
    id: "hunters-point-can-we-live",
    name: "Hunters Point Edition — Can We Live?",
    union: "Community science with the Marie Harrison Community Foundation and Greenaction as partners; LIUNA hazmat laborers, IUOE operators, Teamsters and radiation technicians on the site-work pathway",
    certification: "EPA QA/QC and chain-of-custody guidance for community samples, BAAQMD complaint and Community Advisory Council process, 45 CFR 46 informed consent for biomonitoring, OSHA 29 CFR 1910.120 HAZWOPER and 1910.134 respirators for anyone inside a cleanup fence, Cal/OSHA's wildfire smoke rule",
    summary: "A flagship built to be offered to the foundation and its partners: the sourced story of Marie Harrison and the foundation that carries her name, then twenty-five stations in the skills a community science programme actually uses — air sensors, pollution patrol, biomonitoring with consent, fence-line dust and haul-route observation, split samples, radiological literacy, the HAZWOPER gate into cleanup work, and turning data into testimony. Every station is sited generically; the edition does not speak for the foundation.",
    accent: "#f2c14b",
    stations: [
      { app: "smartcity", id: "can-we-live-story", why: "The story first: the foundation, the woman it is named for, and the record the neighbourhood works against — sourced, flat, and honest about what this edition is not." },
      // slot-hp-1
      { app: "smartcity", id: "biomonitoring-consent", why: "Before any tube is opened: the study explained, the consent form's rights read aloud, the signature witnessed, and a participant ID assigned so no sample ever carries a name." },
      { app: "smartcity", id: "sample-kit-shipping", why: "What consent buys the sample: labels matched to IDs, the cold chain running, UN3373 packing, and the chain of custody signed before a courier ever touches the box." },
      { app: "smartcity", id: "results-return-visit", why: "The other half of the promise 45 CFR 46 makes: a result explained against reference ranges, without alarm or dismissal, to the participant it actually belongs to." },
      { app: "smartcity", id: "smoke-day-outreach", why: "The patrol network on the day the air itself is the hazard: the vulnerable list worked first, N95s actually fit, and the patrol's own masks on when the AQI says so." },
      // slot-hp-3
      // slot-hp-4
      { app: "smartcity", id: "rad-meter-basics", why: "The meter itself, taught honestly: background counted first, the check source proven, counts per minute told apart from microsieverts per hour, a grid walked at a set pace and height, and what a hand-held reading can never say on its own — which isotope, and how deep." },
      { app: "smartcity", id: "parcel-status-walk", why: "The regulator's own map carried down the block: which parcel transferred, which is still under cleanup, which is being retested, the institutional controls a transfer doesn't erase, and an honest answer for the resident who just wants to know if her street is done." },
      { app: "smartcity", id: "retest-witnessing", why: "Standing at the fence for someone else's retest: the grid checked against the work plan, the split sample asked for in writing, the custody form actually read, and a statement written the same day while it's still exact." },
      // slot-hp-6
      // slot-hp-7
    ],
  },
  {
    id: "sewing-garment-trades",
    name: "Sewing and Garment Trades",
    union: "Workers United (SEIU) garment and textile workers, and UNITE HERE where the sewing room sits inside a hotel or uniform service",
    certification: "OSHA 29 CFR 1910.212 machine guarding and 1910.147 lockout for industrial sewing, cutting and pressing equipment, 1910.1200 hazard communication for solvents and spot cleaners, NIOSH ergonomics guidance for seated repetitive work, the state apprenticeship standards for industrial sewing machine operators",
    summary: "A separate trade series that teaches sewing as a trade: threading and needle changes, straight and zigzag seams behind the guard, the serger, the cutting table and rotary cutter, pattern marking, hems and buttonholes, the industrial press, ergonomics, alterations and repair, and inspection and finishing.",
    accent: "#b86bd6",
    stations: [
      { app: "trades", id: "salon", why: "The shared bench case every close-work trade opens on: sharps, chemicals, posture and the client — the same discipline a cutting table asks for." },
      { app: "smartcity", id: "machine-threading-needle", why: "The lockstitch head from a cold start: the needle changed with the scarf right, threaded in its one path, the bobbin wound and cased, tension proven on scrap, and the guard down before the first seam." },
      { app: "smartcity", id: "lockstitch-seam-guard", why: "The same head at production speed: a straight seam and a curve run behind the guard, bundle chained to bundle, and a needle break accounted for down to the broken tip." },
      { app: "smartcity", id: "serger-overlock", why: "The overlock next to it: four threads by colour, the cutting width set to the ticket, and the one rule that never bends — the knife gets cleaned only after it is locked out." },
      { app: "smartcity", id: "cutting-table-rotary", why: "Where the bundle started: the spread cut to the marker on two blades with the glove on the guiding hand, and the blade itself changed the same way — locked out first." },
      // slot-sew-2
      { app: "smartcity", id: "sewing-ergonomics-shift", why: "The bench set up to the operator before the first seam: chair, table, pedal and light, the bundle in reach, and a symptom logged early instead of shrugged off." },
      { app: "smartcity", id: "alteration-repair-ticket", why: "The alterations tailor's own ticket, worked to the customer's pinned fit rather than a guess — the ripper, the hem, and the zipper closed out with a price and a time." },
      { app: "smartcity", id: "garment-inspection-finish", why: "The last bench a piece crosses: the light box and the spec sheet catch what a bare eye and a tape alone would miss before it ever reaches the box." },
    ],
  },
  {
    id: "bridge-and-structural",
    name: "Bridge and Structural Trades",
    union: "Ironworkers (IW), IUPAT bridge painters, IUOE operating engineers and LIUNA on the deck",
    certification: "OSHA 29 CFR 1926 Subparts M (fall protection), R (steel erection) and CC (cranes); 1926.62 lead in construction for bridge coatings; ANSI Z359; AWS D1.5 bridge welding; the owner's lane-closure and MUTCD traffic control plan",
    accent: "#8a9bb0",
    summary: "The bridge as a workplace: cable and hanger inspection at height, lead-paint containment on a truss, deck joint replacement under traffic control, and the erection work the structural programme already teaches.",
    stations: [
      { app: "smartcity", id: "steel-erector", why: "The connecting the whole series builds on: the load landed and the bolts made up before anyone lets go." },
      // slot-bridge-1
    ],
  },
  {
    id: "hotel-workers",
    name: "Hotel Workers — Back of House",
    union: "UNITE HERE hotel housekeepers, laundry and banquet staff",
    certification: "Cal/OSHA's hotel housekeeping musculoskeletal injury prevention standard (8 CCR 3345), the workplace violence prevention plan (8 CCR 3342), 1910.1200 hazard communication for room and laundry chemicals, OSHA 1910.1030 bloodborne pathogens for sharps found in rooms, NFPA 96 where the laundry and kitchen share a plant",
    accent: "#d67b6b",
    summary: "The hotel jobs that carry the injuries: turning a room with a housekeeping cart under the state's own hotel ergonomics rule and a panic button on the belt, the laundry plant's chemicals and folder, and a banquet changeover lifted right.",
    stations: [
      { app: "smartcity", id: "banquet-hot-hold", why: "The banquet floor the series shares with the kitchen: hot boxes, chafers and the room set that has to be right before the doors open." },
      // slot-hotel-1
    ],
  },
  {
    id: "builders-trades",
    name: "Builders — Carpenters, Laborers and Masons",
    union: "UBC carpenters, LIUNA laborers, BAC bricklayers and IUOE operators",
    certification: "OSHA 29 CFR 1926 Subparts Q (concrete and formwork), L (scaffolds), CC (cranes) and 1926.1153 respirable crystalline silica; ANSI A10.9 concrete and masonry; the engineer's shoring and reshoring drawings",
    accent: "#c9a36b",
    summary: "The building trades' own stations: formwork and shoring to the engineer's drawings, a mass-timber panel picked and set, and masonry on a scaffold under the silica rule — beside the concrete pour and scaffold erection the construction programme already teaches.",
    stations: [
      { app: "smartcity", id: "concrete-pour", why: "The pour the formwork exists for, with the pump remote and the crane over the deck as the interruptions that make it real." },
      // slot-builders-1
    ],
  },
  {
    id: "situational-awareness",
    name: "Situational Awareness — Interruption Drill",
    union: "Cross-craft — run as a refresher block by IBEW, UA, LIUNA, Ironworkers and IAFF locals",
    certification: "OSHA 1926.20(b)(2) competent-person hazard recognition and the human-factors component every one of these standards assumes: NFPA 70E, 1910.146 permit spaces, 1926.651 excavations, 1926.1400 cranes, NFPA 25 impairment control",
    summary: "Twenty-two procedures that interrupt you while you work. Every station in this block is one you may already know the order of — the block is not testing the order. It is testing whether you notice the alarm, the person in the wrong place or the thing that moved while your hands and eyes were somewhere else. Miss one and it scores as an unsafe action, because that is what it is.",
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
      { app: "smartcity", id: "tower-climb", why: "A tool you set down creeping toward the platform edge above your ground crew, and the crew themselves walking into the drop zone." },
      { app: "smartcity", id: "elevator-pit", why: "A hall call registering upstairs while you stand in the runby, and somebody working your lock off the hasp while you are on the car top." },
      { app: "smartcity", id: "boiler-room", why: "A block valve passing after you proved the isolation, and the building calling for steam while you are inside the firebox." },
      { app: "smartcity", id: "forklift-dock", why: "The trailer walking off the plate while you are in the box, and a picker stepping into the aisle on the side the load hides." },
      { app: "trades", id: "phlebotomy", why: "A patient going vasovagal while your eyes are on the tube rack, and a pre-labelled set offered to you as a time-saver." },
      { app: "smartcity", id: "transformer-vault", why: "SCADA attempting a reclose before your clearance tag is on the switch, and the vault taking water faster than it drains." },
      { app: "smartcity", id: "wind-nacelle", why: "The wind freshening ninety metres up with the hoist hatch open, and the hatch guard knocked off its catch behind you." },
      { app: "smartcity", id: "digester-gas", why: "The dome rising because the digester did not stop making gas, and the wind putting your own purge vent over the pit you are reading." },
      { app: "smartcity", id: "data-hall", why: "The panel schedule contradicting the busway label, and somebody moving your floor-void barrier to get a cart past." },
      { app: "smartcity", id: "steel-erector", why: "A landed member still on the hook drifting over the bay you are standing in, and a deck opening uncovered behind you." },
      { app: "smartcity", id: "triage-point", why: "A casualty you tagged green sitting down and going quiet, and the beam over the collapse starting to move." },
      { app: "smartcity", id: "dock-crane", why: "A lashing hand cutting through the red zone under a suspended box, and a gust front putting the load on the sail." },
      { app: "smartcity", id: "press-brake", why: "The light curtain left on bypass from the previous shift, and a colleague reaching into the die space to help." },
    ],
  },
  {
    id: "ports-maritime-ecology",
    name: "Ports, Maritime and Bay Ecology",
    union: "ILWU, the Inlandboatmen's Union of the Pacific, IBEW port electricians, LIUNA and the environmental technicians who monitor the bay",
    certification: "OSHA 29 CFR 1918 marine terminal safety, the California Air Resources Board At-Berth Regulation, OSHA HAZWOPER 1910.120 and the U.S. Army Corps of Engineers' Section 404 permit conditions for work at the water's edge",
    summary: "A working port and the bay it sits on, worked by the trades that share the same quay: cargo secured and moved, a ship cold-ironed instead of idling, fuel and lines handled without a drop or a hand in the wrong place, and a spill contained before it ever reaches open water.",
    accent: "#4fb8c9",
    stations: [
      { app: "smartcity", id: "dock-crane", why: "The crane over all of it, with the wind limit and the lashing gang's positions as the hard constraints on every lift." },
      { app: "smartcity", id: "container-lashing", why: "Deck stow: every twist-lock proven and the rods to the pattern the ship's own manual calls for, crane held off the bay until the gang is clear." },
      { app: "smartcity", id: "shore-power-hookup", why: "Cold ironing a berthed ship: ground landed first, the breaker closed only on the port's order, and the auxiliaries shut down clean — the reason the At-Berth Regulation exists." },
      { app: "smartcity", id: "bunkering-watch", why: "Fuel transfer as person in charge, with the deck contained before the hose comes aboard and the topping-off rate the whole spill risk comes down to." },
      { app: "smartcity", id: "ballast-water-sampling", why: "The inspection that happens before that same ship ever reaches a working berth: record book and treatment certificate checked, a sample drawn under chain of custody, and the discharge held until the number comes back." },
      { app: "smartcity", id: "spill-boom-deploy", why: "The response when a transfer or a hookup goes wrong anyway: the source secured, a J-boom worked against the current, and the bay kept out of it." },
      { app: "smartcity", id: "pilot-transfer", why: "The harbour pilot brought aboard by ladder in open water, where the transfer itself is the highest-risk minute of the whole call." },
      { app: "smartcity", id: "mooring-line", why: "Taking the lines that hold the ship to all of this: snap-back zones and the bight nobody stands in." },
      // slot-ports-1
    ],
  },
  {
    id: "air-quality-monitoring",
    name: "Air Quality — Monitoring and Control",
    union: "AFSCME air-district technicians, LIUNA environmental laborers, IUOE and USW plant crews",
    certification: "EPA Method 9 visible emissions (40 CFR 60 Appendix A), EPA 40 CFR Part 58 ambient air quality monitoring, the Bay Area Air Quality Management District's own regulations, and a site's Air Monitoring Plan under a cleanup order",
    summary: "The air a neighbourhood breathes is measured by a short chain of people and instruments, from a fence-line monitor to a stack test to a certified eye reading a plume, each one held to a different standard for a different reason. This block runs that chain end to end, from where the readings are taken to where the emissions actually come from.",
    accent: "#9fd8ff",
    stations: [
      { app: "smartcity", id: "air-monitor", why: "The fence line itself: monitors sited by the wind, proven at zero and flow, with an exceedance answered by the plan rather than muted." },
      { app: "smartcity", id: "mobile-air-lab", why: "The same discipline out of a van: sited fresh on the day's wind, every channel zeroed and spanned, and a reference sample running for the neighbourhood's own check." },
      { app: "smartcity", id: "opacity-reading", why: "What a certified eye adds to what the instruments read: a stack's plume by EPA Method 9, with the geometry proven before the six-minute clock starts." },
      { app: "smartcity", id: "stack-test", why: "The number that goes in the permit file: an isokinetic source test, bracketed by leak checks that both have to pass or the run does not count." },
      { app: "smartcity", id: "landfill-gas", why: "Gas held underground instead of vented from a stack, tuned by what the well is actually giving up rather than by how far the valve is opened." },
      { app: "smartcity", id: "soil-loadout", why: "Where the dust a monitor reads can start: an excavation zoned by the wind, wetted at the face, and stopped the moment its own alarm says so." },
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
