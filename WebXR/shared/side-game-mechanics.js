// Playable mechanics for the skill-gated side games (docs/skill-gates.md,
// QUESTMASTER-2). Twelve small, safe, three.js-free mechanics, one per item
// family: each is a pure step generator. A step shows a "board" (a few lines
// of text drawing the situation: the yard, the switching line-up, the line
// of knots, the ticket rail) and offers moves, exactly one of which is the
// safe one. The panel plays the mechanic's steps and then the item's
// safe-practice calls (side-games-data.js) as one run with one score: every
// move safe is the only clean run. Nothing is scored on speed or harm; the
// overboard drill shows a spotter count but never scores it.
//
// Facts rule: no digits, limits or clause numbers anywhere in the text —
// quantities read as words and limits read "per the plan".
// Names prefixed `qm`/`QM_` (the bundler shares one scope).

function qmHash(s) { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }
/** Deterministic pick of one of `list` for step `i` of an item. */
function qmPick(id, i, list) { return list[(qmHash(id) >>> (i * 3)) % list.length]; }
/** A step: the board lines, the prompt and the two moves (safe first or second, by the hash). */
function qmStep(id, i, board, prompt, safe, unsafe) {
  const flip = ((qmHash(id) >> (i + 7)) & 1) === 1;
  const a = { text: safe, safe: true }, b = { text: unsafe, safe: false };
  return { board, prompt, options: flip ? [b, a] : [a, b] };
}
/** A site to show: its display name, or an id read aloud ("kelp-night-line-site" -> "kelp night line site"); a name with spaces is kept as written. */
const qmSite = (item) => item.siteName ?? (/\s/.test(String(item.site ?? "")) ? item.site : String(item.site ?? "the site").replace(/-/g, " "));
const qmTask = (item) => item.task ?? "job";

/**
 * The mechanics. Each: `name`, `blurb`, `match` (title/id words that pick
 * it) and `build(item)` → steps. Every build is pure and deterministic.
 */
export const QM_MECHANICS = {
  "lift-sequencer": {
    name: "Lift sequencer", blurb: "Order the picks so no load passes over a person.",
    match: /crane|lift|salvage|rigging|penstock|hoist|load-in/i,
    build(item) {
      const loads = ["the spreader bar", "the pallet of fittings", "the pump skid"];
      return loads.map((load, i) => {
        const crewSide = qmPick(item.id, i, ["east", "west"]);
        const board = [
          `  yard at ${qmSite(item)}`,
          `  [${load}]  ——  hook  ——  landing pad`,
          `  crew standing on the ${crewSide} walkway`,
        ];
        return qmStep(item.id, i, board, `Next pick: ${load}. Which swing path do you call?`,
          `Swing it the long way, clear of the ${crewSide} walkway, with the crew held back.`,
          `Swing it straight across the ${crewSide} walkway and shout as it goes over.`);
      });
    },
  },
  "switching-order": {
    name: "Switching order", blurb: "Work the switching order with a read-back on every step.",
    match: /grid|switch|label|power|substation|restor|arc|solar/i,
    build(item) {
      const steps = ["open the feeder breaker", "rack out the breaker", "apply the grounds"];
      return steps.map((s, i) => {
        const board = [`  switching order for ${qmSite(item)}`, ...steps.map((x, k) => `  ${k < i ? "✓" : k === i ? "▶" : "·"} ${x}`)];
        return qmStep(item.id, i, board, `The operator calls "${s}". What do you do?`,
          `Read the step back word for word, get the go-ahead, then ${s} and log it.`,
          qmPick(item.id, i, [`Just ${s}; the order is written down anyway.`, `Do this step and the next one together to save a call.`]));
      });
    },
  },
  "inspection-grid": {
    name: "Inspection grid", blurb: "Check every piece on the rack; tag out what is damaged.",
    match: /inspect|gear|lashing|pre-start|mower|bunker|rebuild|greens|piling|slope/i,
    build(item) {
      const gear = [["the sling", "a cut strand showing"], ["the shackle", "no pin mousing"], ["the harness", "clean, stitching whole"]];
      return gear.map(([g, state], i) => {
        const damaged = i < 2;
        const board = [`  rack at ${qmSite(item)}`, ...gear.map(([x], k) => `  ${k === i ? "▶" : k < i ? "✓" : "·"} ${x}`), `  ${g}: ${state}`];
        return qmStep(item.id, i, board, `You are holding ${g}. What is the call?`,
          damaged ? `Tag ${g} out and set it aside for the supervisor.` : `Pass ${g}, log the check, and go on to the next piece.`,
          damaged ? `Use ${g}; it is only for one ${qmTask(item)}.` : `Skip the rest of the rack; this one was fine.`);
      });
    },
  },
  "line-follow": {
    name: "Line follow", blurb: "Follow the line knot by knot, with a buddy check at each.",
    match: /line dive|transect|tether|trim|kelp|night line|rov|buoyancy/i,
    build(item) {
      const knots = ["the first knot", "the mid knot", "the turn knot"];
      const events = ["your buddy's light drops behind", "the silt closes in", "the line goes slack"];
      return knots.map((k, i) => {
        const board = [`  line out from ${qmSite(item)}`, `  ${knots.map((x, n) => (n === i ? "◉" : n < i ? "●" : "○")).join("——")}`, `  at ${k}: ${events[i]}`];
        return qmStep(item.id, i, board, `At ${k}, ${events[i]}. What do you do?`,
          [`Stop on the line, signal, and wait for the buddy check before you move on.`, `Keep one hand on the line, signal, and hold until it clears.`, `Stop, take up the slack, and confirm with your buddy before moving.`][i],
          [`Push on to the next knot; they will catch up.`, `Let go of the line and swim clear of the silt.`, `Follow the slack line fast to find the end.`][i]);
      });
    },
  },
  "overboard-drill": {
    name: "Overboard drill", blurb: "Alarm, spotter, approach, recovery. The spotter counts aloud; the count is never scored.",
    match: /rescue|overboard|cold/i,
    build(item) {
      const stages = [
        ["the person goes in", "Shout the alarm and point, and keep pointing.", "Turn the boat first and shout once you are round."],
        ["the boat comes about", "Keep the spotter's eyes on them; nobody else leaves their station.", "Send the spotter to fetch the boathook."],
        ["you close on them", "Approach slow, into the wind, and stop the propeller before they are alongside.", "Come in fast to close the gap and take the way off at the end."],
      ];
      return stages.map(([when, safe, unsafe], i) => {
        const board = [`  ${qmSite(item)} — overboard drill`, `  spotter: "still in sight, still counting"`, `  stage: ${when}`];
        return qmStep(item.id, i, board, `The drill: ${when}. What is the call?`, safe, unsafe);
      });
    },
  },
  "delivery-run": {
    name: "Delivery run", blurb: "Run the route the plan sets, on time only when it is safe.",
    match: /delivery|run\b|transfer|docking|tow|passage|drive|tender|ladder|pilot|brake|bus/i,
    build(item) {
      const legs = [
        ["before you roll", "Walk around, do the checks, and set off only when they pass.", "Roll now; it was checked yesterday."],
        ["a shortcut shows on the map", "Keep to the route in the plan.", "Take the shortcut through the low crossing to make up time."],
        ["dispatch asks where you are", "Call it in: running late and taking it safe.", "Say you are close and make up the time on the last leg."],
      ];
      return legs.map(([when, safe, unsafe], i) => {
        const board = [`  ${qmTask(item)} from ${qmSite(item)}`, `  ${legs.map((_, k) => (k === i ? "▶" : k < i ? "✓" : "·")).join(" ")} leg`, `  ${when}`];
        return qmStep(item.id, i, board, `On the ${qmTask(item)}, ${when}. What do you do?`, safe, unsafe);
      });
    },
  },
  "kitchen-rush": {
    name: "Kitchen rush", blurb: "Clear the ticket rail without a single unsafe plate.",
    match: /kitchen|rush|allergen|plate|banquet/i,
    build(item) {
      const tickets = [
        ["a ticket flagged for an allergy", "Stop, check the recipe, and make it on a clean station with clean tools.", "Pick the allergen off the plate and send it."],
        ["a pan handle sticks out over the aisle", "Turn the handle in and call the hot pan as you pass.", "Leave it; everyone knows it is hot."],
        ["a spill by the pass", "Call it, put the wet-floor sign down and mop it now.", "Step over it until the rush is done."],
      ];
      return tickets.map(([t, safe, unsafe], i) => {
        const board = [`  ticket rail at ${qmSite(item)}`, `  ${tickets.map((_, k) => (k === i ? "[▶]" : k < i ? "[✓]" : "[ ]")).join(" ")}`, `  now: ${t}`];
        return qmStep(item.id, i, board, `In the rush: ${t}. What do you do?`, safe, unsafe);
      });
    },
  },
  "traffic-zone": {
    name: "Traffic zone", blurb: "Set the work zone up in the plan's order before the work starts.",
    match: /traffic|storm|work zone|avalanche|cleanup|road|water main/i,
    build(item) {
      const order = ["the advance signs", "the taper of cones", "the spotter"];
      return order.map((o, i) => {
        const board = [`  ${qmSite(item)} beside live traffic`, ...order.map((x, k) => `  ${k < i ? "✓" : k === i ? "▶" : "·"} ${x}`)];
        return qmStep(item.id, i, board, `Next in the plan: ${o}. What do you do?`,
          [`Set the advance signs from the upstream end before anything else goes out.`, `Lay the taper from the signs toward the work, facing traffic, in the plan's spacing.`, `Post the spotter with a horn before the first tool comes out.`][i],
          [`Start the work first; the signs can go out as traffic allows.`, `Drop the cones from the work back toward traffic to finish sooner.`, `Skip the spotter; the crew can watch the traffic themselves.`][i]);
      });
    },
  },
  "lockout-steps": {
    name: "Lockout steps", blurb: "Notify, isolate, lock, verify, and only then reach in.",
    match: /lockout|leak|jam|cabin|entrap|conveyor|irrigation|confined|standby/i,
    build(item) {
      const seq = ["notify the crew", "isolate the energy", "lock and tag, then verify zero"];
      return seq.map((s, i) => {
        const board = [`  ${qmSite(item)} — clearing the fault`, ...seq.map((x, k) => `  ${k < i ? "✓" : k === i ? "▶" : "·"} ${x}`)];
        return qmStep(item.id, i, board, `Next step: ${s}. What do you do?`,
          [`Tell the crew what is stopping and why before anything is touched.`, `Isolate every source the plan lists, not just the obvious one.`, `Put your lock and tag on, then try to start it to prove it is dead.`][i],
          [`Skip the notice; it is a quick fix.`, `Isolate the main switch and reach in; the rest is minor.`, `Trust the switch position and reach in without a test.`][i]);
      });
    },
  },
  "survey-transect": {
    name: "Survey transect", blurb: "Log every point from the line; flag, never pull.",
    match: /map|count|survey|marking|replant|debris|plots|eelgrass|pitch|sensor/i,
    build(item) {
      const points = ["a marked pipe section", "a snagged net", "a fresh planting row"];
      return points.map((p, i) => {
        const board = [`  transect at ${qmSite(item)}`, `  ${points.map((_, k) => (k === i ? "◉" : k < i ? "●" : "○")).join("——")}`, `  at this point: ${p}`];
        return qmStep(item.id, i, board, `At the point: ${p}. What do you log?`,
          [`Photograph and flag it from the line, and note it for a crew.`, `Record it and leave it; a crew clears nets with a plan.`, `Count from the edge without stepping on the row.`][i],
          [`Drag it clear so the count is easier.`, `Cut the net free now while you are here.`, `Walk down the row to count each plant up close.`][i]);
      });
    },
  },
  "spill-response": {
    name: "Spill response", blurb: "Stop the flow, contain it, report it.",
    match: /spill|fuel|chemical|chlorine|storage/i,
    build(item) {
      const seq = ["a drip starts at the nozzle", "the drip reaches the deck edge", "the transfer is finished"];
      return seq.map((s, i) => {
        const board = [`  ${qmSite(item)} — spill kit on the post`, `  ${seq.map((_, k) => (k === i ? "▶" : k < i ? "✓" : "·")).join(" ")}`, `  ${s}`];
        return qmStep(item.id, i, board, `At the dock: ${s}. What do you do?`,
          [`Stop the flow and shut the nozzle before anything else.`, `Lay the absorbent from the kit at the edge and keep it out of the water.`, `Report the spill and restock the kit before the next transfer.`][i],
          [`Keep fuelling and wipe it up at the end.`, `Hose the drip over the side; it is only a little.`, `Say nothing; it never reached the water.`][i]);
      });
    },
  },
  "lookout-watch": {
    name: "Lookout watch", blurb: "Keep the watch: report by the form, keep the radio, name the way out.",
    match: /lookout|watch|patrol|night|ridge|fire/i,
    build(item) {
      const seq = [
        ["a light shows on the far ridge", "Log it on the report form and call it in as the plan says.", "Decide it is nothing and note it in the morning."],
        ["your radio check gets no answer", "Switch to the backup channel and re-establish contact before carrying on.", "Carry on watching; they will call when they need you."],
        ["the wind shifts toward you", "Name your escape route and safety zone aloud and tell the crew.", "Stay put and keep watching; it is only wind."],
      ];
      return seq.map(([s, safe, unsafe], i) => {
        const board = [`  watch at ${qmSite(item)}`, `  ${seq.map((_, k) => (k === i ? "▶" : k < i ? "✓" : "·")).join(" ")}`, `  ${s}`];
        return qmStep(item.id, i, board, `On watch, ${s}. What do you do?`, safe, unsafe);
      });
    },
  },
};

export const QM_MECHANIC_KEYS = Object.keys(QM_MECHANICS);

/**
 * Which mechanic an item plays: its own `mechanic` field when set, else the
 * first mechanic whose `match` fits the title or id, else the inspection grid.
 */
export function qmMechanicFor(item) {
  if (item?.mechanic && QM_MECHANICS[item.mechanic]) return item.mechanic;
  const text = `${item?.title ?? ""} ${item?.id ?? ""}`;
  for (const key of QM_MECHANIC_KEYS) if (QM_MECHANICS[key].match.test(text)) return key;
  return "inspection-grid";
}

/** The mechanic's steps for an item: `[{ board, prompt, options: [{ text, safe }] }]`. */
export function qmMechanicSteps(item) {
  const key = qmMechanicFor(item);
  return QM_MECHANICS[key].build(item).map((s) => ({ ...s, mechanic: key }));
}

/**
 * The whole run for an item: the mechanic's steps, then the item's
 * safe-practice calls (`rounds`, from side-games-data.js's qmRounds) — one
 * score, clean only when every move and call is the safe one.
 */
export function qmPlaySteps(item, rounds = []) {
  return [...qmMechanicSteps(item), ...rounds.map((r) => ({ board: null, prompt: r.prompt, options: r.options, mechanic: null }))];
}
