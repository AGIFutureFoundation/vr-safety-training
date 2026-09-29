// DRILLS — the scenario drill definitions (console DRILLS, docs/consoles/DRILLS.md). SmartCiti.X Powered by AGI Corp.
//
// DR_DRILLS: four timed scenario drills — flood, traffic incident, shelter setup, cluster coordination. Each objective
// names a real catalog station AND one of that station's own step ids (WebXR/smartcity/js/sims/<station>.js), and its
// practice line is that step's cue put in a drill's words; `role` is a GRIOT parish character (npc-data.js) playing a
// part in the drill. `safe` / `unsafe` are the two calls the learner chooses between (scored on safe practice).
// DR_PLACES: where each drill runs — real parish and San Francisco site ids (np-parishes.js). The scenario is a
// training exercise: no injury is shown or described, and the text is fit for K-12 eyes (no fear framing).
// Every top-level name is prefixed dr/DR_ (the bundler shares one scope).

const drObj = (id, title, station, step, seconds, role, practice, safe, unsafe, extra = {}) => ({ id, title, station, step, seconds, role, practice, safe, unsafe, ...extra });

export const DR_DRILLS = [
  {
    id: "dr-flood", name: "Rising Water", kind: "flood",
    paths: ["disaster-relief", "first-responders"],
    briefing: "A practice exercise: the water in the channel is rising on the plan's forecast. Read the level, move people and vehicles to higher ground, set sandbags, close the floodgate by its checklist and log it. Nobody is in danger — this is a timed rehearsal of the plan.",
    water: { rise: 1.2 }, // metres the drill's water plane rises over the drill (a procedural cue, not a forecast)
    objectives: [
      drObj("read-level", "Read the water level first", "tide-gate", "levels-up", 40, "gr-np-levee-inspector",
        "Watch the staff gauge and commit to a reading while the level sits inside the predicted band — every later call is judged against it.",
        "Read the gauge and call the level to the crew.", "Skip the gauge; the water looks about normal."),
      drObj("high-ground", "Move people and vehicles to higher ground", "k12-by-reading-a-flood-maps-colours", "choose-the-route-that-stays-on", 60, "gr-np-campus-teacher",
        "Use the flood map's key to choose the route that crosses the least low ground, and move people and vehicles along it calmly.",
        "Follow the route the map shows staying on higher ground.", "Take the shortest road, even where the map shows low ground."),
      drObj("sandbags", "Set the sandbags at the kiosk", "br-levee-inspection-and-seepage", "boil-ring", 60, "gr-np-levee-inspector",
        "Carry the sandbags out and ring the seep completely — a ring, never a pile on top of it.",
        "Ring the seep with bags, leaving the middle open.", "Stack the bags straight on top of the seep.", { kiosk: "kw-sandbag-relay" }),
      drObj("floodgate", "Close the floodgate by its checklist", "tide-gate", "tide-window", 50, "gr-np-pump-operator",
        "Confirm the window on the plan, clear the gate's path and call it clear before it moves, then tick every line of the close-out.",
        "Clear the path, call it clear, then close and check the seal.", "Swing it shut while a car is still passing.", { kiosk: "kw-floodgate-closeout" }),
      drObj("log", "Log the reach and the ring", "br-levee-inspection-and-seepage", "log-inspection", 30, "gr-np-levee-inspector",
        "Record the reach walked, the level read, the ring set and anything flagged, so the next crew reads the record, not a memory.",
        "Write it all in the log before you leave.", "Tell the next shift later instead."),
    ],
  },
  {
    id: "dr-traffic", name: "Scene on the Shoulder", kind: "traffic",
    paths: ["first-responders", "disaster-relief"],
    briefing: "A practice collision in a training world — nobody is hurt. NEWTON's \"after a collision\" card becomes a scene: secure it, check people, call it in, clear it and give the lane back.",
    fromCard: "nw-after-a-collision",
    objectives: [
      drObj("secure", "Secure the scene with the block", "traffic-incident-management", "set-the-block", 45, "gr-np-port-foreman",
        "Put the blocking vehicle upstream of the work, angled across the closed lane, wheels turned away.",
        "Block upstream, angled, wheels turned to the shoulder.", "Park beside the vehicle in the open lane."),
      drObj("vest", "Vest on before you step out", "traffic-incident-management", "vest-before-stepping-out", 20, "gr-np-port-foreman",
        "The high-visibility vest goes on before the door opens, not after.",
        "Vest on, then step out on the side away from traffic.", "Step out first and find the vest later."),
      drObj("check", "Check people and bring them clear", "traffic-incident-management", "driver-clear-of-the-lane", 45, "gr-np-nurse",
        "Ask from a safe place whether anyone needs help, and walk the driver off the shoulder and behind the rail.",
        "Walk the driver behind the rail and talk calmly.", "Let the driver stand by the car in the lane."),
      drObj("call", "Call it in with what the tow needs", "traffic-incident-management", "tow-request", 30, "gr-np-rail-conductor",
        "Say where you are and request the tow by class: what the vehicle is, whether it rolls, whether there is a recovery.",
        "Give the location and the tow's class in one call.", "Ask for \"a tow\" and sort the rest later."),
      drObj("clear", "Clear the scene and give the lane back", "traffic-incident-management", "clearance-and-reopen", 45, "gr-np-port-foreman",
        "Cones come up from the downstream end, then the lane goes back, then clearance goes over the radio.",
        "Pick up from downstream, reopen, call clearance.", "Pull the first cone upstream so traffic moves sooner."),
    ],
  },
  {
    id: "dr-shelter", name: "Campus Shelter Setup", kind: "shelter",
    paths: ["disaster-relief", "first-responders", "un-training"],
    briefing: "A practice exercise: the school campus opens as a shelter for neighbours after a storm. Check in, set up registration, lay out the cots, open the water point and a quiet corner.",
    objectives: [
      drObj("check-in", "Check in with the shelter manager", "shelter-intake-operations", "ics-checkin", 30, "gr-np-campus-teacher",
        "Sign into the shelter's own organization chart before touching anything else.",
        "Sign in at the command board first.", "Start moving tables before anyone knows you are here."),
      drObj("registration", "Open registration", "shelter-intake-operations", "intake-questions", 60, "gr-np-hospitality-lead",
        "Ask the intake questions once each, gently, in order: name, who they are with, then medical and access needs.",
        "Name, household, then needs — asked once each.", "Ask everything at once while they stand in the doorway."),
      drObj("cots", "Lay out the cots", "shelter-intake-operations", "cot-spacing", 45, "gr-np-hospitality-lead",
        "Set the cot rows to the shelter standard's spacing, with a real aisle to walk and kneel in.",
        "Measure the rows to the standard's spacing.", "Squeeze the rows closer to fit more cots."),
      drObj("water", "Open the water point", "who-water-sanitation-and-hygiene", "residual-read", 45, "gr-np-pump-operator",
        "Test a sample at the tap with the comparator and confirm it reads in the plan's band before anyone fills up.",
        "Test at the tap, then open the water point.", "Open it now and test the tank later."),
      drObj("quiet-corner", "Open a quiet corner", "shelter-intake-operations", "quiet-room", 30, "gr-np-nurse",
        "Confirm a curtained room off the main floor is open and marked as the quiet room.",
        "Open the quiet room and post its sign.", "Leave it for later; the gym is fine for now."),
    ],
  },
  {
    id: "dr-cluster", name: "Sector Check-In", kind: "cluster",
    paths: ["un-training", "disaster-relief"],
    briefing: "A practice exercise at a staging area: teams arrive, check in by sector, read the case definition, share what they know with the cluster, and close with an after-action review — the WHO and IASC cluster way.",
    objectives: [
      drObj("sector", "Check in and take the sector assignment", "damage-assessment-team", "ics-assignment", 30, "gr-np-wetlands-ranger",
        "Sign into the sector board and read which block this team has, so every team is on the same map.",
        "Sign in and read the team's sector.", "Pick a sector that looks busy and head out."),
      drObj("buddy", "Confirm your buddy", "damage-assessment-team", "buddy-check", 20, "gr-np-wetlands-ranger",
        "Pair up with your buddy and confirm you are working the sector together.",
        "Pair up before leaving staging.", "Go alone; it will be quicker."),
      drObj("definition", "Read today's case definition", "who-surveillance-and-case-definition", "case-definition", 40, "gr-np-nurse",
        "Read today's version of the case definition — suspected, probable, confirmed — before counting anything.",
        "Read today's version before you count.", "Count from memory of last week's version."),
      drObj("share", "Share with the cluster working group", "who-risk-communication-and-community-engagement", "share-log", 30, "gr-np-campus-teacher",
        "Read the week's top questions back with the working group so every partner answers them the same way.",
        "Share the log so partners answer alike.", "Keep the log in your own team's folder."),
      drObj("tally", "Log to the sector tally", "damage-assessment-team", "handover-log", 30, "gr-np-wetlands-ranger",
        "Record what the team found in the sector log so the coordinator's running tally is real.",
        "Write it into the sector log.", "Report it by memory at the end of the week."),
      drObj("review", "Share the after-action review", "who-after-action-review", "share-report", 40, "gr-np-nurse",
        "Place the agreed report with the national authority and the Health Cluster coordinator so every partner learns from it.",
        "Share the agreed report with the cluster.", "File it in one office and move on."),
    ],
  },
];

/** Where each drill runs: `{ drill, parish, site }` — real site ids in the ten maps. */
export const DR_PLACES = [
  { drill: "dr-flood", parish: "st-bernard", site: "sb-violet-floodgate" },
  { drill: "dr-flood", parish: "orleans", site: "lakefront-levee" },
  { drill: "dr-flood", parish: "sf-marina", site: "marina-seawall-crew" },
  { drill: "dr-traffic", parish: "jefferson", site: "jf-causeway-yard" },
  { drill: "dr-traffic", parish: "st-tammany", site: "st-causeway-north" },
  { drill: "dr-traffic", parish: "sf-downtown", site: "bay-bridge-crew-yard" },
  { drill: "dr-shelter", parish: "st-bernard", site: "sb-school-campus" },
  { drill: "dr-shelter", parish: "st-tammany", site: "st-covington-campus" },
  { drill: "dr-shelter", parish: "sf-mission", site: "mission-school-campus" },
  { drill: "dr-shelter", parish: "sf-golden-gate-park", site: "sunset-school-campus" },
  { drill: "dr-cluster", parish: "st-tammany", site: "st-slidell-staging" },
  { drill: "dr-cluster", parish: "orleans", site: "hospital-district" },
  { drill: "dr-cluster", parish: "sf-golden-gate-park", site: "parnassus-hospital-campus" },
];
