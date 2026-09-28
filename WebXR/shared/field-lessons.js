// K-12 field lessons (console SCHOLAR-2, tools/briefs/frontier-brief.md).
//
// A field lesson is a two-to-four-minute, FlowHub-style micro-lesson placed at
// a landmark in a world: a title, three short steps that teach one idea where
// the learner is standing, one check question, and a link to the full K-12
// station that teaches the idea properly. Each lesson names the trade that
// uses the idea ("the crane operator's load chart is a ratio table"), so the
// school subject and the worker's skill are seen as the same thing.
//
// The schema is exported so other worlds (SUMMIT, REDWOOD, any later one) can
// add their own lessons in their own data module and validate them with
// k2ValidateFieldLesson; tools/check_k12.mjs validates every lesson here.
//
// Facts rule: no figures, dates or limits in lesson text (no digits at all);
// anything the lesson measures is what the scene shows. Every person named is
// a role, never a real individual.
//
// Top-level names carry the `k2` prefix: tools/bundle_webxr.py concatenates
// modules into one scope.

/** The field-lesson schema: every field, its type and its rule. */
export const K2_FIELD_LESSON_SCHEMA = {
  id: "string, unique, starts with a world prefix and '-fl-' (e.g. 'bw-fl-crane-ratio')",
  world: "string, the world's app id: 'bayworld' | 'deep' | 'regatta' | 'fairway' (others may add their own)",
  anchor: "{ kind: 'site' | 'landmark' | 'course' | 'facility' | 'hole', id: string } — a real anchor in that world's data",
  position: "[x, z] world coordinates at or beside the anchor",
  title: "string, one idea, no digits",
  station: "string, the K-12 station id that teaches the idea in full (a classroom programme station)",
  trade: "string, the trade that uses the idea",
  tradeLine: "string, one sentence linking the idea to the trade's own practice, no digits",
  minutes: "number, 2 to 4",
  band: "string, one of: early primary, upper primary, lower secondary, upper secondary (or two joined by ' to ')",
  steps: "string[3], short sentences a learner reads on the spot, no digits",
  check: "{ question: string, options: string[3], answer: 0|1|2, why: string } — the check question",
};

export const K2_BANDS = ["early primary", "upper primary", "lower secondary", "upper secondary"];
export const K2_WORLD_PAGES = {
  bayworld: "../bayworld/index.html",
  deep: "../underwater/underwater.html",
  regatta: "../regatta/regatta.html",
  fairway: "../fairway/index.html",
  summit: "../summit/index.html",
};

const k2L = (id, world, anchor, position, title, station, trade, tradeLine, minutes, band, steps, check) =>
  ({ id, world, anchor, position, title, station, trade, tradeLine, minutes, band, steps, check });
const k2Q = (question, options, answer, why) => ({ question, options, answer, why });

export const K2_FIELD_LESSONS = [
  // ------------------------------------------------------------ Bay World
  k2L("bw-fl-crane-load-chart-ratio", "bayworld", { kind: "landmark", id: "port-cranes" }, [-352, 372],
    "The load chart is a ratio table", "k12-simple-machines-at-a-crane", "Crane operators",
    "The crane operator's load chart is a ratio table: further out, less load, read before every lift.", 3, "lower secondary",
    ["Look up at the gantry cranes on the quay.", "The further out a load hangs, the bigger its turning effect.", "So the chart lets the crane lift less at long reach."],
    k2Q("A load moves further out along the boom. What does the chart allow?", ["More load", "Less load", "The same load"], 1, "A load further out turns the crane harder, so the chart allows less.")),
  k2L("bw-fl-slope-of-the-access-ramp", "bayworld", { kind: "site", id: "uptown-construction-site" }, [-4, -226],
    "Rise over run on a site ramp", "k12-slope-and-angles-on-a-ramp", "Carpenters and cement masons",
    "A carpenter setting out an access ramp works the slope as rise over run, and checks it against the plan.", 3, "lower secondary",
    ["Find the ramp the crew is building from the visitor bay.", "Slope is how far up for every step along.", "Both lengths must be in the same unit before you divide."],
    k2Q("Two ramps climb the same height. One is longer. Which is gentler?", ["The longer one", "The shorter one", "They are the same"], 0, "Same rise over a longer run means less climb for each step along.")),
  k2L("bw-fl-reading-a-safety-sign", "bayworld", { kind: "site", id: "port-hazmat-response-yard" }, [-350, 376],
    "Signal words on a safety sign", "k12-reading-instructions-and-safety-labels", "Hazmat technicians",
    "A hazmat technician reads the signal word and the pictogram before touching any container.", 2, "upper primary",
    ["Find a sign on the yard fence.", "The signal word at the top tells you how serious the hazard is.", "The picture and the words underneath say what to do."],
    k2Q("Where do you look first on a safety sign?", ["The small print", "The signal word at the top", "The colour of the post"], 1, "The signal word tells you how serious it is before anything else.")),
  k2L("bw-fl-kitchen-fractions", "bayworld", { kind: "site", id: "uptown-restaurant-row" }, [-30, -270],
    "Scaling a recipe by one fraction", "k12-fractions-in-the-kitchen", "Cooks and chefs",
    "A cook scaling a recipe for fewer guests multiplies every quantity by the same fraction.", 2, "upper primary",
    ["Look through the kitchen window on restaurant row.", "Halving a recipe means halving every ingredient.", "Keep the unit beside each number as you scale it."],
    k2Q("You halve the flour. What happens to the milk?", ["Leave it", "Halve it too", "Double it"], 1, "Every quantity gets the same fraction, or the proportions change.")),
  k2L("bw-fl-budget-at-the-market", "bayworld", { kind: "landmark", id: "market-street-stalls" }, [470, 278],
    "Spending and saving from one wage", "k12-household-budget-and-first-paycheck", "Market traders",
    "A market trader keeps takings, costs and savings in separate columns, the same way a first wage is planned.", 3, "lower secondary",
    ["Walk past the stalls and read the price boards.", "A budget lists what comes in and what goes out.", "Keeping something back each time is saving, not spending less by chance."],
    k2Q("What goes on a budget first?", ["What you want to buy", "What comes in", "What friends spend"], 1, "You plan spending from what actually comes in.")),
  k2L("bw-fl-ferry-map-scale", "bayworld", { kind: "landmark", id: "island-ferry-landing-clock" }, [178, 574],
    "Map scale at the ferry landing", "k12-reading-a-map-scale-in-bay-world", "Ferry deckhands",
    "A ferry crew reads distances off a chart using its scale, the same as you read a map.", 2, "upper primary",
    ["Find the route map beside the ferry clock.", "The scale bar links a gap on the map to a real distance.", "Measure along the route, not in a straight line across the water."],
    k2Q("What does a map's scale bar tell you?", ["The map's age", "How map distance compares with real distance", "Which way is north"], 1, "The scale bar links distance on paper to distance on the ground.")),
  k2L("bw-fl-court-area", "bayworld", { kind: "landmark", id: "bayside-arena" }, [574, 375],
    "Area and perimeter of a court", "k12-measuring-and-scaling-the-court", "Floor layers and groundskeepers",
    "A floor layer orders material by area and edging by perimeter; mixing them up costs a job.", 2, "upper primary",
    ["Picture the court inside the arena.", "Perimeter is the distance round the edge.", "Area is the space inside, in square units."],
    k2Q("You need paint for the whole court floor. Which do you work out?", ["Perimeter", "Area", "Height"], 1, "Covering a floor needs its area.")),
  k2L("bw-fl-council-agenda", "bayworld", { kind: "site", id: "downtown-civic-center" }, [-32, 37],
    "How an agenda runs a meeting", "k12-how-a-local-council-meeting-works", "Civic staff and organisers",
    "A union organiser reads the agenda before a public meeting so they speak when their item comes up.", 3, "lower secondary",
    ["Stand outside the civic centre doors.", "An agenda lists what the meeting will discuss, in order.", "Public comment happens at its own point, and speakers keep to the item."],
    k2Q("Why read the agenda before a meeting?", ["To know when your issue comes up", "To skip the meeting", "To choose a seat"], 0, "The agenda tells you when and how you can speak.")),
  k2L("bw-fl-timeline-in-the-tower", "bayworld", { kind: "landmark", id: "downtown-tower" }, [24, 20],
    "Made date and described date", "k12-building-a-timeline-from-documents", "Archivists",
    "An archivist records when a document was made apart from when the events it describes happened.", 3, "lower secondary",
    ["Look up at the tower and imagine the papers filed inside.", "A letter written later can describe something much earlier.", "A timeline orders events, so check which date is which."],
    k2Q("A diary written later describes an old event. Which date goes on the timeline?", ["The date the diary was written", "The date of the event it describes", "Today's date"], 1, "The timeline places the event; the writing date tells you about the source.")),
  k2L("bw-fl-union-hall-oral-history", "bayworld", { kind: "landmark", id: "union-hall" }, [-378, 45],
    "Consent before a recording", "k12-oral-history-interview-skills", "Union historians and archivists",
    "A union archive records a retired member's story only after they agree how it will be kept and shared.", 2, "lower secondary",
    ["Stand by the union hall entrance.", "An oral history belongs to the person telling it.", "Ask permission, explain who will hear it, and respect the answer."],
    k2Q("What comes before pressing record?", ["The first question", "Asking for consent", "Checking the battery only"], 1, "Consent always comes first, and it can be withdrawn.")),
  k2L("bw-fl-guild-apprentices", "bayworld", { kind: "site", id: "west-oakland-union-hall" }, [-390, 36],
    "Apprentices then and now", "k12-guilds-and-the-history-of-work", "Apprentices in the building trades",
    "Building-trades apprentices learn from experienced workers on the job, a practice with a long history worth researching.", 3, "lower secondary",
    ["Find the apprenticeship board inside the hall.", "Craft guilds trained newcomers as apprentices; that much is widely established.", "The details for any place or trade are questions to research, with sources."],
    k2Q("You do not know when a guild started. What do you write?", ["A date that sounds right", "A research question", "Nothing"], 1, "Unknowns become questions to research, never invented facts.")),
  k2L("bw-fl-wind-energy-chain", "bayworld", { kind: "site", id: "ridge-wind-farm" }, [955, -515],
    "Energy from moving air", "k12-energy-transfer-at-the-wind-farm", "Wind technicians",
    "A wind technician follows the energy from air to blades to generator when finding a fault.", 3, "upper primary",
    ["Watch the turbines turn from outside the fence.", "Moving air pushes the blades, and the turning shaft drives a generator.", "Some energy is always lost as heat and sound."],
    k2Q("Where does a turbine's energy come from?", ["The tower", "Moving air", "The fence"], 1, "The wind's movement is transferred to the blades.")),
  k2L("bw-fl-blade-sweep-circle", "bayworld", { kind: "landmark", id: "ridge-trail-summit" }, [995, -645],
    "The blade is the radius", "k12-geometry-of-a-turbine-blade-sweep", "Wind technicians",
    "Wind engineers work a rotor's swept area from its blade length, the radius of the circle.", 3, "lower secondary",
    ["From the summit, look across at a turning rotor.", "Each blade reaches from the hub to the edge of a circle.", "So the blade is the radius, and area grows with it multiplied by itself."],
    k2Q("The blade doubles in length. What happens to the swept area?", ["It doubles", "It is four times as big", "It stays the same"], 1, "Area depends on the radius times itself.")),
  k2L("bw-fl-water-cycle-at-the-plant", "bayworld", { kind: "site", id: "south-treatment-plant" }, [720, 590],
    "Where the water goes next", "k12-water-cycle-and-filtration", "Water treatment operators",
    "A treatment operator knows the water they clean has been round the cycle many times before.", 2, "upper primary",
    ["Look at the settling channels from the walkway.", "Water evaporates, condenses into clouds and falls as rain.", "Clearer water is not the same as safe to drink."],
    k2Q("Water looks clear after a filter. Is it safe to drink?", ["Yes, always", "Not necessarily", "Only if cold"], 1, "Germs and dissolved substances can remain in clear water.")),
  k2L("bw-fl-first-aid-call", "bayworld", { kind: "landmark", id: "fire-station" }, [426, 265],
    "Calling for help clearly", "k12-first-aid-awareness-call-for-help", "Firefighters and dispatchers",
    "A dispatcher can only send help fast when the caller gives a clear location.", 2, "upper primary",
    ["Stand outside the fire station.", "Check for danger before going closer to anyone hurt.", "Fetch an adult, call for help and say exactly where you are."],
    k2Q("What does the call-taker need most from you?", ["Your favourite colour", "Where you are", "What time it is"], 1, "A clear location lets help find you.")),
  k2L("bw-fl-digital-at-the-college", "bayworld", { kind: "landmark", id: "bay-city-college" }, [478, 240],
    "Pause before you click", "k12-digital-citizenship-and-online-safety", "IT support technicians",
    "An IT technician trains staff to pause and check a message's sender before clicking any link.", 2, "upper primary",
    ["Find the computer lab windows at the college.", "Scam messages rush you, come from odd senders and ask for passwords.", "Pause, check and tell a trusted adult if unsure."],
    k2Q("A message says act now or lose your account. What do you do?", ["Click quickly", "Pause and check", "Reply with your password"], 1, "Rushing you is a warning sign; pause first.")),
  k2L("bw-fl-teamwork-at-the-stadium", "bayworld", { kind: "landmark", id: "civic-stadium" }, [622, 389],
    "Feedback on the work, not the person", "k12-teamwork-and-feedback", "Crew leads",
    "A crew lead gives feedback about the task, specific and kind, so the crew improves without losing trust.", 2, "upper primary",
    ["Picture a team talk in the stadium tunnel.", "Name something specific that went well.", "Suggest one next step, then listen."],
    k2Q("Which is useful feedback?", ["You are bad at this", "Your pass was on time; try looking up sooner", "Fine"], 1, "Specific and kind, about the work, gives a clear next step.")),

  // ------------------------------------------------------------ The Deep
  k2L("dp-fl-kelp-food-web", "deep", { kind: "landmark", id: "kelp-cathedral" }, [-515, -236],
    "Arrows follow the energy", "k12-ecosystems-at-the-kelp-transect", "Marine scientists and survey divers",
    "A survey diver's count feeds a food web in which each arrow points from food to eater.", 3, "upper primary",
    ["Look up through the kelp fronds towards the light.", "Kelp is a producer; urchins graze on it.", "In a food web, the arrow points from kelp to urchin."],
    k2Q("Which way does the arrow go between kelp and urchin?", ["Urchin to kelp", "Kelp to urchin", "No arrow"], 1, "Energy goes from the food to the eater.")),
  k2L("dp-fl-holdfast-ecosystem", "deep", { kind: "landmark", id: "holdfast-ledge" }, [-446, -176],
    "One change spreads through a web", "k12-ecosystems-at-the-kelp-transect", "Restoration ecologists",
    "A restoration ecologist watches urchin predators because losing them can strip a kelp forest.", 3, "lower secondary",
    ["Find the holdfasts gripping the ledge.", "Predators keep urchin numbers in check.", "Remove the predator and the kelp can be grazed away."],
    k2Q("The urchins' predator disappears. What may happen to the kelp?", ["It grows more", "It may be grazed away", "Nothing"], 1, "More urchins graze the kelp faster than it regrows.")),
  k2L("dp-fl-buoyancy-at-the-anchor", "deep", { kind: "landmark", id: "old-anchor" }, [-386, -516],
    "Why the anchor sinks", "k12-buoyancy-and-pressure-in-the-deep", "Salvage divers",
    "A salvage diver uses lift bags because water pushes up harder on a large air-filled bag than on a solid anchor.", 3, "upper primary",
    ["Look at the old anchor on the seabed.", "Water pushes up on everything in it.", "Heavy for its size sinks; light for its size floats."],
    k2Q("Why does a lift bag raise a heavy object?", ["It is magic", "Water pushes up on the big bag of air", "The object gets lighter"], 1, "The large volume of air gets a big upward push from the water.")),
  k2L("dp-fl-pressure-at-the-trench", "deep", { kind: "landmark", id: "trench-lip" }, [-655, 425],
    "Pressure grows with depth", "k12-buoyancy-and-pressure-in-the-deep", "Commercial divers and ROV pilots",
    "An ROV pilot knows pressure grows the deeper the vehicle goes, which is why its housing is built so strong.", 2, "lower secondary",
    ["Look over the lip into the trench.", "The deeper you go, the more water presses from above.", "That is why deep equipment has thick, strong housings."],
    k2Q("What happens to water pressure as you go deeper?", ["It falls", "It grows", "It stays the same"], 1, "More water above means more pressure.")),
  k2L("dp-fl-tide-gauge-reading", "deep", { kind: "landmark", id: "tide-gauge-post" }, [-116, -236],
    "Reading a tide gauge level", "k12-graphing-tide-readings-at-the-pier", "Hydrographic surveyors",
    "A hydrographic surveyor records each gauge reading with its time, ready to plot.", 2, "upper primary",
    ["Find the tide gauge post.", "A reading is where the water surface meets the scale.", "Write the time and the unit beside every reading."],
    k2Q("What must go beside every tide reading?", ["Its time and unit", "A guess of the next one", "Nothing"], 0, "Without its time and unit a reading cannot be plotted.")),
  k2L("dp-fl-sonde-controlled-test", "deep", { kind: "landmark", id: "sonde-mooring" }, [-56, -296],
    "Keep everything else the same", "k12-a-controlled-experiment", "Water-quality scientists",
    "A water-quality scientist compares sonde readings fairly by keeping the depth and time of day the same.", 3, "lower secondary",
    ["Find the sonde on its mooring.", "To compare two places fairly, change only the place.", "Keep the depth, the time and the instrument the same."],
    k2Q("You compare water at two sites. What should stay the same?", ["Nothing", "Depth, time and instrument", "Only the colour of the float"], 1, "Only the thing you test may change.")),
  k2L("dp-fl-wreck-primary-source", "deep", { kind: "landmark", id: "wreck-bow" }, [234, 284],
    "The wreck as a primary source", "k12-primary-and-secondary-sources", "Maritime archaeologists",
    "A maritime archaeologist treats the wreck itself as a primary source and a later article about it as secondary.", 3, "lower secondary",
    ["Look at the wreck's bow from the survey line.", "The wreck itself is a primary source: it was there.", "A book about it later is a secondary source; check what it is based on."],
    k2Q("Which is a primary source?", ["A later magazine article", "The wreck itself", "A film about the wreck"], 1, "The wreck comes from the time itself.")),
  k2L("dp-fl-reef-ball-count", "deep", { kind: "landmark", id: "reef-ball-rows" }, [344, -16],
    "Count only what you see", "k12-ecosystems-at-the-kelp-transect", "Reef monitoring divers",
    "A monitoring diver records only what is observed along the line, so next season's count can be compared fairly.", 2, "upper primary",
    ["Look along the rows of reef balls.", "A survey counts what is seen, nothing added.", "Note the visibility so a murky day is not mistaken for a decline."],
    k2Q("You expected crabs but saw none. What do you record?", ["Some crabs anyway", "None seen", "Skip the entry"], 1, "A survey records observations, not expectations.")),
  k2L("dp-fl-outfall-water-cycle", "deep", { kind: "landmark", id: "outfall-diffuser" }, [424, -236],
    "Treated water rejoins the cycle", "k12-water-cycle-and-filtration", "Outfall inspection divers",
    "An outfall inspection diver checks the diffuser where treated water returns to the bay and the cycle.", 2, "upper primary",
    ["Find the diffuser on the seabed.", "Treated water from the plant returns to the bay here.", "From the bay it can evaporate and fall as rain again."],
    k2Q("Where does treated water go after the outfall?", ["It disappears", "Back into the bay and the water cycle", "Into space"], 1, "Water is never used up; it moves round the cycle.")),
  k2L("dp-fl-channel-marker-map", "deep", { kind: "landmark", id: "channel-marker-chain" }, [-166, 84],
    "Charts and their orientation", "k12-map-literacy-across-eras", "Buoy tender crews",
    "A buoy tender crew reads the chart's own orientation and key before placing a marker.", 2, "upper primary",
    ["Follow the marker chain up towards the surface.", "Every chart has a key, a scale and an orientation mark.", "Read those three before reading any route."],
    k2Q("What do you find first on any chart?", ["The prettiest part", "Key, scale and orientation", "The oldest date"], 1, "Those three tell you how to read everything else.")),

  // ------------------------------------------------------------ The Regatta
  k2L("rg-fl-wind-direction-at-the-start", "regatta", { kind: "course", id: "rg-estuary-sprint" }, [65, 540],
    "Winds are named from where they come", "k12-weather-and-the-sky", "Sailing coaches and skippers",
    "A skipper names the wind by where it comes from before choosing a course to the first mark.", 2, "upper primary",
    ["Look at the flag on the start boat.", "The flag streams away from where the wind comes from.", "A wind from the sea is a sea wind, even as it blows inland."],
    k2Q("The flag streams towards the shore. Where is the wind from?", ["The shore", "The sea", "Nowhere"], 1, "Winds are named by where they come from.")),
  k2L("rg-fl-course-map-scale", "regatta", { kind: "course", id: "rg-outer-bay-loop" }, [-905, 300],
    "Distance to the next mark", "k12-reading-a-map-scale-in-bay-world", "Navigators",
    "A navigator measures the leg to the next mark on the chart and scales it up to real distance.", 3, "upper primary",
    ["Open the course card at the start line.", "Measure the leg to the first mark along the chart.", "Use the scale bar to turn it into a real distance."],
    k2Q("What turns a chart measurement into a real distance?", ["The scale bar", "The colour key", "The date"], 0, "The scale links chart distance to real distance.")),
  k2L("rg-fl-speed-distance-time", "regatta", { kind: "course", id: "rg-north-channel-passage" }, [-985, -560],
    "Speed, distance and time on a leg", "k12-reading-a-map-scale-in-bay-world", "Ferry and charter skippers",
    "A charter skipper estimates arrival time from distance and speed, then checks it makes sense.", 3, "lower secondary",
    ["Read the long leg down the channel on the course card.", "Time is distance divided by speed.", "Check the answer makes sense before you rely on it."],
    k2Q("The boat goes faster over the same leg. What happens to the time?", ["It grows", "It shrinks", "It stays the same"], 1, "Faster over the same distance takes less time.")),
  k2L("rg-fl-buoyancy-of-a-hull", "regatta", { kind: "course", id: "rg-estuary-sprint" }, [-120, 420],
    "Why a heavy hull floats", "k12-buoyancy-and-pressure-in-the-deep", "Boatbuilders",
    "A boatbuilder shapes a hull to push aside enough water to float its weight.", 2, "upper primary",
    ["Round the first mark and look at the hulls around you.", "A hull pushes water aside, and the water pushes back up.", "A wide hull of air and wood is light for its size."],
    k2Q("Why does a heavy boat float?", ["It is light for its size", "Water pushes nothing", "Paint"], 0, "Its shape holds air, making it light for its size.")),
  k2L("rg-fl-probability-of-a-wind-shift", "regatta", { kind: "course", id: "rg-outer-bay-loop" }, [-1000, 120],
    "A forecast is a likelihood", "k12-weather-and-the-sky", "Race officers",
    "A race officer treats a forecast wind shift as a likelihood and watches the water before deciding.", 2, "upper primary",
    ["At the windward mark, look for darker patches on the water.", "Darker patches can mean a gust is coming.", "A forecast says what is likely, not what is certain."],
    k2Q("A forecast says a shift is likely. What does that mean?", ["It will happen for sure", "It may happen", "It will not happen"], 1, "Likely is a chance, not a promise.")),
  k2L("rg-fl-teamwork-on-deck", "regatta", { kind: "course", id: "rg-north-channel-passage" }, [-1050, -200],
    "Clear roles on a crew", "k12-teamwork-and-feedback", "Deckhands and yacht crews",
    "A yacht crew agrees roles before the start so every manoeuvre has one person on each job.", 2, "upper primary",
    ["Before the next mark, picture who does what on deck.", "Each person has a clear role.", "Call the plan, listen and check before you act."],
    k2Q("Why agree roles before a manoeuvre?", ["To look busy", "So every job has one person", "To go slower"], 1, "Clear roles stop jobs being missed or doubled.")),
  k2L("rg-fl-incident-report-afloat", "regatta", { kind: "course", id: "rg-outer-bay-loop" }, [-950, 650],
    "Facts first in a report", "k12-writing-a-clear-incident-report", "Harbour masters",
    "A harbour master's report keeps what was seen apart from what someone guesses happened.", 3, "lower secondary",
    ["After rounding the far mark, imagine reporting a near miss.", "Write what happened, where and when you saw it.", "Keep facts apart from guesses, and leave out blame."],
    k2Q("What belongs in an incident report?", ["Who you think is to blame", "What you saw, where and when", "A guess of the cause as fact"], 1, "Facts first, guesses labelled, no blame.")),
  k2L("rg-fl-public-speaking-briefing", "regatta", { kind: "course", id: "rg-estuary-sprint" }, [-350, 450],
    "One clear message in a briefing", "k12-public-speaking-at-the-hall", "Race officers",
    "A race officer's skipper briefing has one clear message about safety, said so the back row hears.", 2, "upper primary",
    ["Picture the skippers' briefing before the start.", "One clear message is remembered.", "Speak to the back row, slowly and clearly."],
    k2Q("What makes a briefing remembered?", ["Many messages", "One clear message", "Speaking quickly"], 1, "Listeners remember one clear, repeated message.")),

  // ------------------------------------------------------------ Fairway Park
  k2L("fw-fl-track-perimeter", "fairway", { kind: "facility", id: "track" }, [-225, 10],
    "Perimeter on the running track", "k12-measuring-and-scaling-the-court", "Groundskeepers",
    "A groundskeeper marking the track measures along each lane's edge, the perimeter of a curved shape.", 3, "upper primary",
    ["Stand at the edge of the running track.", "Perimeter is the distance all the way round.", "An outer lane goes further round than an inner one."],
    k2Q("Why do outer lanes start further ahead?", ["For fun", "Their perimeter is longer", "They are wider"], 1, "Outer lanes go further round, so starts are staggered.")),
  k2L("fw-fl-weather-mast", "fairway", { kind: "facility", id: "weatherMast" }, [-278, -14],
    "Reading the weather mast", "k12-weather-and-the-sky", "Groundskeepers",
    "A groundskeeper checks the weather mast before irrigating or cutting, and heads in when thunder is heard.", 2, "upper primary",
    ["Find the weather mast by the maintenance yard.", "Read the wind and the rain gauge at eye level.", "If you hear thunder, go indoors."],
    k2Q("You hear thunder on the course. What do you do?", ["Keep playing", "Go indoors", "Stand under a tree"], 1, "If you can hear thunder, lightning can reach you.")),
  k2L("fw-fl-fuel-cabinet-label", "fairway", { kind: "facility", id: "maintenanceYard" }, [-262, -26],
    "Reading a label before use", "k12-reading-instructions-and-safety-labels", "Greenskeepers",
    "A greenskeeper reads the label on every container in the cabinet before using it.", 2, "upper primary",
    ["Look at the fuel cabinet in the yard from the path.", "Labels tell you what is inside and how to use it safely.", "Read the whole label before anything is opened."],
    k2Q("When do you read a label?", ["After using it", "Before using it", "Never"], 1, "The label says how to use it safely, so read it first.")),
  k2L("fw-fl-slope-on-the-green", "fairway", { kind: "hole", id: "hole-3" }, [-32, -24],
    "Slope on a putting green", "k12-slope-and-angles-on-a-ramp", "Greenskeepers and course builders",
    "A course builder shapes a green's slope so water drains but a ball can still stop.", 2, "lower secondary",
    ["Stand beside the third green.", "A green slopes gently so rain can run off.", "Slope is rise over run, the same as a ramp."],
    k2Q("Slope is worked out as…", ["Run over rise", "Rise over run", "Rise plus run"], 1, "How far up for every step along.")),
  k2L("fw-fl-controlled-test-on-turf", "fairway", { kind: "hole", id: "hole-6" }, [129, -24],
    "A fair test on two turf plots", "k12-a-controlled-experiment", "Turf scientists",
    "A turf scientist tests a new mowing height on one plot and keeps everything else the same as the next plot.", 3, "lower secondary",
    ["Look at the trial plots beside the sixth tee.", "Change only one thing between the plots.", "Repeat the test before trusting the result."],
    k2Q("You change the mowing and the watering. What is wrong?", ["Nothing", "Two things changed at once", "Too few mowers"], 1, "With two changes you cannot tell which caused the difference.")),
  k2L("fw-fl-teamwork-at-the-court", "fairway", { kind: "facility", id: "basketballCourt" }, [-270, -20],
    "Receiving feedback well", "k12-teamwork-and-feedback", "Coaches",
    "A coach teaches players to listen, ask and thank when they get feedback, then decide what to use.", 2, "upper primary",
    ["Stand at the side of the basketball court.", "When a teammate gives feedback, listen to the end.", "Ask a question to understand, then thank them."],
    k2Q("A teammate gives you feedback. What do you do first?", ["Argue back", "Listen to the end", "Walk away"], 1, "Listening first gets the most from feedback.")),
  k2L("fw-fl-probability-on-the-tee", "fairway", { kind: "hole", id: "hole-9" }, [280, -26],
    "A coin toss has no memory", "k12-probability-with-a-fair-spinner", "Match officials",
    "A match official's coin toss is fair because each toss has the same chance, whatever came before.", 2, "upper primary",
    ["At the ninth tee, imagine tossing for who goes first.", "Heads and tails each have an equal chance.", "The coin does not remember the last toss."],
    k2Q("Heads came up three times running. What is the chance of tails now?", ["Higher than before", "The same as always", "Zero"], 1, "A fair coin has no memory.")),
];

/** Every lesson in one world. */
export function k2LessonsFor(world) { return K2_FIELD_LESSONS.filter((l) => l.world === world); }

/** The launch link for a lesson's full station, with the way back to its world. */
export function k2LessonLink(lesson, linkFor) {
  const page = K2_WORLD_PAGES[lesson.world]?.split("/").pop() ?? null;
  return linkFor(lesson.station, { from: lesson.world, page });
}

/**
 * Validate one lesson against the schema. `ctx` supplies what the world knows:
 * { stations: Set<string> of K-12 station ids, anchors: Set<string> of "kind:id" }.
 * Returns a list of problems (empty when the lesson is sound).
 */
export function k2ValidateFieldLesson(l, ctx = {}) {
  const bad = [];
  const str = (v) => typeof v === "string" && v.trim().length > 0;
  if (!str(l.id) || !/-fl-/.test(l.id)) bad.push("id missing or without '-fl-'");
  if (!str(l.world)) bad.push("no world");
  if (!l.anchor || !str(l.anchor.kind) || !str(l.anchor.id)) bad.push("no anchor");
  else if (ctx.anchors && !ctx.anchors.has(`${l.anchor.kind}:${l.anchor.id}`)) bad.push(`anchor ${l.anchor.kind}:${l.anchor.id} not found in ${l.world}`);
  if (!Array.isArray(l.position) || l.position.length !== 2 || !l.position.every(Number.isFinite)) bad.push("position is not [x, z]");
  for (const f of ["title", "station", "trade", "tradeLine", "band"]) if (!str(l[f])) bad.push(`no ${f}`);
  if (ctx.stations && !ctx.stations.has(l.station)) bad.push(`station ${l.station} is not a K-12 station`);
  if (!(l.minutes >= 2 && l.minutes <= 4)) bad.push(`minutes ${l.minutes} outside two to four`);
  if (str(l.band) && !l.band.split(" to ").every((b) => K2_BANDS.includes(b))) bad.push(`band "${l.band}" is not generic`);
  if (!Array.isArray(l.steps) || l.steps.length !== 3 || !l.steps.every(str)) bad.push("steps must be three sentences");
  const c = l.check;
  if (!c || !str(c.question) || !Array.isArray(c.options) || c.options.length !== 3 || !c.options.every(str) || ![0, 1, 2].includes(c.answer) || !str(c.why)) bad.push("check question malformed");
  const text = [l.title, l.tradeLine, ...(l.steps ?? []), c?.question, ...(c?.options ?? []), c?.why].join(" ");
  if (/\d/.test(text)) bad.push("lesson text states a figure (a digit)");
  return bad;
}

/** Lessons of one world placed on a map canvas by the world's own transform. */
export function k2MapFieldLessons(world, toMap, size = 512) {
  return k2LessonsFor(world).map((l) => ({ ...l, ...toMap(l.position[0], l.position[1], size) }));
}

/**
 * The K-12 layer on a world's full map: a teal square per field lesson and,
 * under the site list, one row per lesson with its trade line and a link to
 * the full station. Kept here so each world's app.js calls it in one line.
 */
export function k2DrawFieldLayer(ctx, placed, listEl, linkFor) {
  for (const l of placed) {
    ctx.fillStyle = "#6ad0c8"; ctx.fillRect(l.x - 4, l.y - 4, 8, 8);
    ctx.strokeStyle = "#0a1420"; ctx.lineWidth = 1; ctx.strokeRect(l.x - 4, l.y - 4, 8, 8);
  }
  k2RenderLessonList(listEl, placed, linkFor);
}

/**
 * The K-12 list on its own, for a world without a full map (the Regatta's
 * briefing, Fairway Park's facility screen): a heading row and one row per
 * lesson with its trade line and a link to the full station.
 */
export function k2RenderLessonList(listEl, placed, linkFor) {
  if (!listEl || !placed.length || typeof document === "undefined") return;
  const head = document.createElement("div");
  head.className = "map-site-row k2-layer-head";
  head.innerHTML = "<b>K-12 field lessons</b><span>Short lessons at landmarks, each tied to a trade</span>";
  listEl.appendChild(head);
  for (const l of placed) {
    const row = document.createElement("div");
    row.className = "map-site-row k2-layer-row";
    row.innerHTML = "<b></b><span></span><a class=\"btn\">Full lesson</a>";
    row.querySelector("b").textContent = `${l.title} · ${l.minutes} min`;
    row.querySelector("span").textContent = l.tradeLine;
    row.querySelector("a").href = k2LessonLink(l, linkFor);
    listEl.appendChild(row);
  }
}
