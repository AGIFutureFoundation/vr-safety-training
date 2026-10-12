import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, ball, slab, group, decal, repaint, signFace, paperFace,
  counter, cabinet, seatedFigure,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Dust Plan Review VR — Community Environmental Justice,
// station one hundred fifty-eight, the last of four Hunters Point Edition
// stations and the only one that never goes outside. A generic community
// monitoring group's desk — not any one organisation's office, not any one
// site's own dust control plan — where a patrol's field record actually
// gets weighed against the paper a contractor filed.
//
// The job: a contractor's dust control plan says what it says; the patrol's
// own log and photographs say what the crew actually saw on the ground. A
// plan's water-truck frequency, its posted action level, the monitor
// locations on its own map and the list of who gets notified of an
// exceedance are each only as good as whether the site is actually running
// them — and the only way to know that from a desk is to hold the plan next
// to the patrol's record and write down, specifically, where they stop
// matching. That comment letter is the one place this whole edition's field
// work turns into something a regulator has to answer.

const DPR_ACCENT = 0x9a7fd6;

export const SIM_DUST_PLAN_REVIEW = {
  id: "dust-plan-review",
  index: "158",
  domain: "Environmental",
  trade: "Community environmental monitor",
  category: "Community Environmental Justice",
  indoor: "service",
  certification: "BAAQMD Regulation 6 and its public comment process on a site's own dust control plan; EPA's Superfund community involvement requirements under the National Contingency Plan (40 CFR Part 300); California DTSC and the Regional Water Board's oversight of the plan itself; OSHA 29 CFR 1910.120 HAZWOPER for anyone who inspects a fenceline monitor in person — not required for this desk review of the plan and the patrol's own record",
  name: "Dust Plan Review",
  title: simTitle("Dust Plan Review"),
  tagline: "Reading a contractor's dust control plan against what the patrol actually saw: the water truck frequency, the action levels, the monitor locations on the map, the notification list, and the gaps written into a comment letter for the regulator",
  accent: DPR_ACCENT,
  accentCss: "#9a7fd6",
  parSeconds: 320,
  footprint: 2.2,
  badge: { id: "gap-named", name: "Gap Named", note: "Every claim in the plan checked against the patrol's own record, every gap cited to a real authority, and the letter filed before the deadline moved" },

  game: system({
    name: "Plan Review",
    currency: "COMMENT",
    ranks: ["Reader", "Cross-Checker", "Comment Drafter", "Review Lead", "Plan Review Certified"],
    badges: [
      { id: "checked-not-trusted", name: "Checked, Not Trusted", note: "Every plan claim checked against the patrol's own log before the letter was drafted", test: AWARD.stepClean("cross-check-patrol-log") },
      { id: "never-softened", name: "Never Softened", note: "Never rubber-stamped the plan, backdated the letter, dropped a citation, or sent the draft to the contractor first", test: AWARD.safe },
      { id: "scaled-true", name: "Scaled True", note: "Held the map scale and the redline correction near band centre", test: AWARD.precise(0.7) },
    ],
    challenges: [
      { id: "clean-review", name: "Clean Review", note: "No corrections anywhere in the review", test: AWARD.clean },
      { id: "unbroken-redline", name: "Unbroken Redline", note: "Never broke the map redline correction", test: AWARD.unbroken },
      { id: "filed-fast", name: "Filed Fast", note: "Filed inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "skip-patrol-log": "You reached for the APPROVED stamp before ever pulling the patrol's own log. A contractor's plan is the contractor's own account of what it does — the only way this desk finds out whether it's true is by holding it against a record the contractor didn't write, and stamping it approved without that check is trusting the plan because it's the only document in the room, not because anyone checked it.",
    "backdate-letter": "You set the date stamp back three days to make the letter look filed before the deadline moved. A comment letter that reaches the regulator under a false date is worse than a late one — a late letter is a missed deadline anyone can see; a backdated one is a record this desk falsified, and it poisons every honest letter this group files afterward the moment anyone checks a postmark against it.",
    "drop-citation": "You deleted the Regulation 6 citation to make the letter read less confrontational. A comment that says the water-truck frequency looks light is an opinion a contractor can wave off; a comment that cites the specific plan clause and the regulation it's supposed to satisfy is something the regulator has to actually answer — softening the letter into a feeling instead of a citation is giving away the only thing that made it worth filing.",
    "share-draft-with-contractor": "You emailed the draft comment letter to the contractor for their notes before it went to the regulator. This desk's whole standing is that its review is independent of the site it's reviewing — a contractor who gets to see and shape the comment before the regulator does is not being held accountable by it, they're co-authoring the record of their own accountability.",
  },

  lateNotes: {
    "site-map": "Unroll the map and check its scale before you read anything plotted on it — a distance read off an uncalibrated map is a guess with a ruler.",
    "redline-pen": "Nothing to correct yet — the plan's own monitor plot has to actually be checked against the patrol's record first, or you're redlining a location you haven't confirmed is wrong.",
    "comment-letter-pad": "Nothing to draft yet — the plan's numbers have to actually be checked against the patrol's record first, or the letter is a guess dressed up as a review.",
    "highlighter": "Nothing to highlight yet — draft the letter first, or you're marking up a clause the letter doesn't reference.",
    "date-stamp": "Nothing to stamp yet — sign the letter first, or a stamped, unsigned letter is just a dated blank page.",
  },

  // Both interruptions are armed on a hold or a track step, per the shared
  // interrupt layer — a select, sequence, gauge, drag, turn or find step
  // resolves in one action, too fast for the fuse to ever catch the learner
  // mid-task.
  interrupts: [
    {
      id: "monitor-photo-mismatch",
      kind: "New patrol photo",
      after: "redline-map", delay: 4, seconds: 14,
      alert: "A new photo just landed in the shared drive from this morning's patrol — the fenceline monitor in it is nowhere near the pin the plan's map shows for it.",
      cue: "Open the photo inbox and flag it before you move on — this is a second, separate mismatch from the one you just redlined.",
      target: "photo-inbox",
      why: "A plan's map is a claim about where the site says its own monitoring happens, and every photo the patrol brings back is a chance to catch that claim being wrong — flagging a new mismatch the moment it arrives, rather than only working from the record you'd already opened, is what keeps this desk's review as current as the patrol's own morning, not a day behind it.",
      missNote: "The new photo sat unopened in the inbox for the rest of the review, and the letter went out naming only the mismatch already in hand — a second, freshly documented siting error that arrived in time to be cited was left out simply because nobody looked.",
      wrongNote: "Not that — open the photo inbox. Nothing else on this desk is what a patrol member just sent in.",
    },
    {
      id: "deadline-moved",
      kind: "Deadline moved up",
      after: "highlight-clause", delay: 4, seconds: 14,
      alert: "An email just came in from the Air District — the comment period on this plan closes tomorrow, not next week.",
      cue: "Re-pin the wall calendar to the new date now — everything left on this desk has to fit before tomorrow, not next week.",
      target: "calendar-tack",
      why: "A comment filed after the period closes is not late paperwork, it is a comment the regulator has no obligation to read at all — moving the calendar the moment the new date arrives is what keeps the rest of this review honestly scoped to what can actually get written, cited and filed in the time that's left, instead of a letter still being drafted after the window that would have made it count has already shut.",
      missNote: "The calendar stayed on the old date and the review kept moving at a next-week pace while the real deadline was tomorrow — whatever got filed after the old estimate ran out was filed too late for the Air District to have to consider it at all.",
      wrongNote: "Not that — re-pin the calendar. Nothing else on this desk changes what tomorrow's deadline actually requires of the rest of this review.",
    },
  ],

  steps: [
    {
      id: "read-plan", kind: "select", target: "plan-binder",
      title: "Read the contractor's dust control plan",
      cue: "Read the plan cover to cover once before checking any single claim in it against anything else.",
      why: "A plan read start to finish, once, is how this desk learns what the contractor is actually claiming to do — the water-truck frequency, the action level, the monitor locations, the notification list — before any of those claims get held up against the patrol's own record. Checking a single page in isolation risks missing a claim contradicted by the plan's own later section.",
    },
    {
      id: "unroll-map", kind: "drag", target: "map-roll",
      title: "Unroll the site map",
      cue: "Carry the rolled site map to the desk and lay it flat before reading anything plotted on it.",
      why: "A map still curled on the roll hides its own corners and its own scale bar under the curl — laying it flat on the desk is what makes every monitor pin, every property line and the scale bar itself actually readable before a single distance gets checked against it.",
      drag: { to: "desk-map-socket", radius: 0.4, missNote: "Not flat on the desk — a map left half-rolled still hides the corner the scale bar and half the monitor pins sit in." },
    },
    {
      id: "verify-map-scale", kind: "gauge", target: "scale-ruler",
      title: "Calibrate the scale ruler against the map's bar",
      cue: "Slide the ruler out to match the map's own printed scale bar and commit only once it lines up.",
      why: "Every distance this review is about to read off this map — how far a monitor actually sits from the fence line, how far a pin is from where the patrol says the real instrument stands — is only true if the ruler measuring it is set to this specific map's own scale, not to a habit carried over from the last plan this desk reviewed.",
      gauge: {
        label: "SCALE", speed: 0.6, green: [0.44, 0.58],
        readout: (t) => `1 : ${Math.round(400 + t * 600)}`,
        missNote: "Not matched to the map's own scale bar — reset the ruler and line it up again before you trust a single distance on this sheet.",
      },
    },
    {
      id: "check-monitor-map", kind: "select", target: "site-map",
      title: "Check the monitor locations against the map",
      cue: "Read every monitor pin the plan's map plots and compare each one against the patrol's own noted positions.",
      why: "A monitor plotted downwind on a map and a monitor actually standing downwind on the ground are two different claims, and the map is the only place a plan states the first one in writing — checking each pin against what the patrol actually logged in the field is the only way this desk catches a plan that looks right on paper and isn't right on the ground.",
    },
    {
      id: "check-notify-list", kind: "sequence", anyOrder: true,
      targets: ["notify-airdistrict-listed", "notify-neighbors-listed", "notify-school-listed"],
      itemNames: { "notify-airdistrict-listed": "Air District listed", "notify-neighbors-listed": "adjacent residents listed", "notify-school-listed": "nearby school listed" },
      title: "Check the exceedance notification list",
      cue: "Confirm the plan's notification list actually names the Air District, the adjacent residents and the nearby school — not just the site's own staff.",
      why: "A notification list that only calls the contractor's own project manager when a monitor alarms is a list that keeps the exceedance inside the company that caused it — checking that the Air District, the residents next to the fence and the school down the block are all actually named is what confirms the plan notifies the people an exceedance actually reaches, not just the people it's convenient to tell.",
    },
    {
      id: "check-water-freq", kind: "select", target: "freq-page",
      title: "Check the water-truck frequency claim",
      cue: "Read the plan's stated wetting frequency and compare it against how often the patrol's log actually recorded a truck running.",
      why: "A plan that specifies wetting every twenty minutes and a patrol log that only ever caught a truck running once an hour are not describing the same site — this is the check that catches a frequency written to satisfy the regulator on paper without ever describing what the crew on the ground is actually doing.",
    },
    {
      id: "check-action-levels", kind: "select", target: "action-level-page",
      title: "Check the posted action level",
      cue: "Read the plan's stated PM10 action level and compare it against the number the patrol actually saw posted on the fenceline monitor.",
      why: "A plan that states one action level and a monitor in the field posted at a different one is not a typo this desk can wave off — whichever number is actually controlling the site's own stop-work decision is the one that matters, and a mismatch here means somebody downwind is being protected by a different threshold than the one the regulator approved.",
    },
    {
      id: "redline-map", kind: "track", target: "redline-pen", seconds: 8,
      title: "Redline the map to the patrol's actual position",
      cue: "Trace the redline pen from the plan's plotted pin to the patrol's GPS-noted position, keeping the correction inside the map's own scale.",
      why: "A comment letter that says a monitor pin is wrong needs to say exactly how wrong, in the map's own units, or the contractor can dismiss it as an impression — tracing the correction to the patrol's actual noted position, at the scale this desk just calibrated, is what turns a complaint into a distance a regulator can check for themselves.",
      track: {
        start: 0.5, green: [0.42, 0.6], rise: 0.5, fall: 0.46, drift: 0.12, label: "REDLINE",
        readout: (v) => (v < 0.42 ? "drifting short of the mark" : v > 0.6 ? "overshooting the mark" : "tracking to the true position"),
      },
      holdBreakNote: "The redline drifted off the patrol's actual position — bring the pen back onto the corrected line before the correction means anything.",
    },
    {
      id: "cross-check-patrol-log", kind: "select", target: "patrol-log-binder",
      title: "Pull the patrol's own field log",
      cue: "Open the patrol log and confirm every gap you've found so far against a dated, timed entry — not memory of the plan alone.",
      why: "Everything checked so far was checked against this desk's own reading of the plan; this is the step where each of those checks gets tied to an actual dated, timed entry somebody in the field wrote down — a gap this desk remembers noticing is not the same thing as a gap this desk can cite to a regulator.",
    },
    {
      id: "draft-comment-letter", kind: "select", target: "comment-letter-pad",
      title: "Draft the comment letter",
      cue: "Start the letter by listing every gap this review actually found, in the order the plan itself presents them.",
      why: "A comment letter is only as strong as the list of specific gaps behind it — drafting from the checks this desk already ran, rather than from a general sense that the plan seemed thin, is what keeps the letter answerable to exactly what was found rather than to an impression nobody can point back to.",
    },
    {
      id: "highlight-clause", kind: "hold", target: "highlighter", seconds: 5,
      title: "Highlight the cited clause in the plan",
      cue: "Hold the highlighter over the exact plan clause the letter's first gap refers to until the mark is solid.",
      why: "A comment letter that cites 'the plan's water-truck section' in general is easy for a contractor to argue with; a comment letter that highlights and cites the exact clause, word for word, is not — holding the highlighter down until the mark is solid, rather than a quick pass that half-covers the line, is what makes the citation something a reader can find on the page in one look.",
      holdBreakNote: "Released early — the mark is patchy and half the clause is still unhighlighted. Hold it down until the whole line is solid.",
    },
    {
      id: "cite-authority", kind: "sequence", anyOrder: true,
      targets: ["cite-baaqmd-reg6", "cite-dtsc-oversight"],
      itemNames: { "cite-baaqmd-reg6": "BAAQMD Regulation 6 cited", "cite-dtsc-oversight": "DTSC oversight cited" },
      title: "Cite the real authority behind each gap",
      cue: "Attach the actual regulation each gap violates — Regulation 6 for the dust claims, DTSC's own oversight for the plan's approval — before the letter goes further.",
      why: "A letter that says a plan 'doesn't seem sufficient' is an opinion; a letter that names the specific regulation a gap falls short of is a finding the regulator has a duty to respond to — citing the real authority behind every gap is what turns this desk's review from a complaint into a record the Air District and DTSC both have to actually answer.",
    },
    {
      id: "proofread", kind: "find", noHint: true,
      targets: ["unsupported-claim"],
      itemNames: { "unsupported-claim": "uncited claim in the draft" },
      itemNotes: { "unsupported-claim": "That line in the draft states a gap but never actually cites the patrol log entry or the regulation behind it — exactly the kind of claim a contractor's own attorney will strike from consideration on sight." },
      title: "Proofread the draft before it's signed",
      cue: "Read back through the draft and click the one claim that isn't actually tied to a log entry or a citation.",
      why: "Drafting the letter and proofreading it for what it can actually prove are different skills — this is the last chance to catch a sentence that sounds right but isn't tied to anything this desk can point to, before it goes out under this group's own name.",
    },
    {
      id: "stamp-letter", kind: "turn", target: "date-stamp",
      title: "Date-stamp the filed copy",
      cue: "Turn the stamp's date wheel to today's actual date before stamping the desk's own filed copy.",
      why: "The filed copy's date stamp is this desk's own proof of when the letter actually went out, independent of anything the regulator's own intake system records — turning the wheel to today's real date, not whatever date would look better later, is what keeps that proof honest if the filing date is ever questioned.",
      turn: { turns: 0.4, axis: "z", label: "DATE" },
    },
    {
      id: "sign-file", kind: "select", target: "signature-line",
      title: "Sign and file the comment letter",
      cue: "Sign the letter and file it with the Air District before the deadline on the calendar.",
      why: "A signature is this desk putting its own name behind every gap the letter names — filed before the deadline, it's a record the Air District has to weigh against the plan; filed after, however well-argued, it's a letter nobody was obligated to read.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.2, DPR_ACCENT);

    // -------------------------------------------------------------- room shell
    const floor = box(g, 5.6, 0.1, 5.0, 0, 0.05, 0, 0x8a7a5c, { rough: 0.7, finish: "wood", tile: [6, 5] });
    void floor;
    const backWall = box(g, 5.6, 2.9, 0.12, 0, 1.5, -2.4, 0xd8d2c2, { rough: 0.85 });
    void backWall;
    const sideWall = box(g, 0.12, 2.9, 5.0, -2.75, 1.5, 0, 0xd8d2c2, { rough: 0.85 });
    void sideWall;
    const ceiling = box(g, 5.6, 0.1, 5.0, 0, 2.95, 0, 0xece7db, { rough: 0.9, cast: false });
    void ceiling;
    // Window in the back wall, generic street light beyond it.
    box(g, 1.1, 1.1, 0.06, 1.6, 1.7, -2.36, 0x2c3a44, { rough: 0.3, metal: 0.1, opacity: 0.55, transparent: true, cast: false });
    box(g, 1.16, 0.06, 0.1, 1.6, 2.28, -2.34, 0x5a4a3a, { rough: 0.7 });
    box(g, 1.16, 0.06, 0.1, 1.6, 1.12, -2.34, 0x5a4a3a, { rough: 0.7 });

    // -------------------------------------------------------------- desk
    const desk = counter(g, 1.7, 0.8, -0.7, -1.6, 0x6f5a3e, { height: 0.78, rough: 0.4, metal: 0.1 });
    void desk;
    const chair = group(g, -0.7, 0, -0.7, Math.PI);
    box(chair, 0.42, 0.06, 0.42, 0, 0.46, 0, 0x2b3138, { rough: 0.6 });
    box(chair, 0.42, 0.5, 0.06, 0, 0.72, -0.2, 0x2b3138, { rough: 0.6 });
    cyl(chair, 0.03, 0.03, 0.44, 0, 0.24, 0, CITY.darkSteel, { rough: 0.5, metal: 0.6, seg: 10 });

    // ---------------------------------------------------------- plan binder
    const planBinder = group(g, -1.2, 0.14, -1.55);
    box(planBinder, 0.32, 0.42, 0.06, 0, 0.99, 0, 0x3a4a6b, { rough: 0.6 });
    decal(planBinder, 0.26, 0.34, 0, 0.99, 0.031, paperFace("DUST CONTROL PLAN", ["Contractor's own filing", "Cleanup parcel, generic site"], { bg: "#e8ecf4", band: "#3a4a6b" }));
    holoTag(planBinder, "the plan", 0, 1.25, 0, { css: "#9a7fd6", w: 0.28 });
    reg(hits, planBinder, "plan-binder");
    const approveStamp = group(g, -0.85, 0.14, -1.55);
    cyl(approveStamp, 0.04, 0.05, 0.12, 0, 0.85, 0, 0x8a5a3a, { rough: 0.6, metal: 0.2, seg: 12 });
    decal(approveStamp, 0.07, 0.03, 0, 0.92, 0, signFace("APPROVED", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.42 }));
    reg(hits, approveStamp, "skip-patrol-log");

    // ------------------------------------------------------------ plan pages
    const freqPage = group(g, -0.35, 0.14, -1.75);
    box(freqPage, 0.28, 0.005, 0.36, 0, 0.79, 0, 0xf3efe4, { rough: 0.9 });
    decal(freqPage, 0.24, 0.3, 0, 0.793, 0, paperFace("WATER TRUCK", ["Wet every 20 min", "Per Dust Control Plan"], { bg: "#f3efe4", band: "#4a5a2f" })).rotation.x = -Math.PI / 2;
    holoTag(freqPage, "frequency page", 0, 0.16, 0, { css: "#9a7fd6", w: 0.34 });
    reg(hits, freqPage, "freq-page");
    const actionPage = group(g, 0.05, 0.14, -1.75);
    box(actionPage, 0.28, 0.005, 0.36, 0, 0.79, 0, 0xf3efe4, { rough: 0.9 });
    decal(actionPage, 0.24, 0.3, 0, 0.793, 0, paperFace("ACTION LEVEL", ["150 µg/m³ PM10", "Per Dust Control Plan"], { bg: "#f3efe4", band: "#4a5a2f" })).rotation.x = -Math.PI / 2;
    holoTag(actionPage, "action level page", 0, 0.16, 0, { css: "#9a7fd6", w: 0.4 });
    reg(hits, actionPage, "action-level-page");

    // -------------------------------------------------------------- site map
    const mapCart = group(g, -1.7, 0.14, -0.9);
    const mapRoll = cyl(mapCart, 0.06, 0.06, 0.6, 0, 0.5, 0, 0xe8ddb8, { rough: 0.7, seg: 14 });
    mapRoll.rotation.z = Math.PI / 2;
    holoTag(mapCart, "site map", 0, 0.66, 0, { css: "#9a7fd6", w: 0.26 });
    reg(hits, mapCart, "map-roll");
    const deskMapSocket = group(g, -0.7, 0.14, -1.55, 0.02);
    hits["desk-map-socket"] = deskMapSocket;
    const mapFlat = group(deskMapSocket, 0, 0.79, 0);
    box(mapFlat, 0.9, 0.005, 0.7, 0, 0, 0, 0xf3efe4, { rough: 0.85 });
    const mapFace = decal(mapFlat, 0.86, 0.66, 0, 0.004, 0, (ctx, w, h) => {
      ctx.fillStyle = "#f3efe4"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#7a7566"; ctx.lineWidth = 3; ctx.strokeRect(w * 0.08, h * 0.1, w * 0.84, h * 0.7);
      ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.arc(w * 0.28, h * 0.3, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1d262e"; ctx.font = `${Math.round(h * 0.045)}px Arial, sans-serif`;
      ctx.fillText("Monitor A (plan)", w * 0.32, h * 0.31);
      ctx.fillStyle = "#2f7d4f"; ctx.beginPath(); ctx.arc(w * 0.55, h * 0.55, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillText("Patrol GPS mark", w * 0.59, h * 0.56);
      ctx.strokeStyle = "#1d262e"; ctx.lineWidth = 2; ctx.strokeRect(w * 0.1, h * 0.82, w * 0.2, h * 0.03);
      ctx.fillText("scale bar", w * 0.32, h * 0.85);
    });
    reg(hits, mapFace, "site-map");

    // --------------------------------------------------------- scale ruler
    const ruler = group(g, -0.25, 0.14, -1.35, 0.3);
    box(ruler, 0.5, 0.01, 0.04, 0, 0.79, 0, 0xe8b02e, { rough: 0.6 });
    holoTag(ruler, "scale ruler", 0, 0.86, 0, { css: "#9a7fd6", w: 0.3 });
    reg(hits, ruler, "scale-ruler");
    const redlinePen = group(g, -0.5, 0.14, -1.35, -0.3);
    cyl(redlinePen, 0.008, 0.008, 0.14, 0, 0.8, 0, 0xd2312b, { rough: 0.5, seg: 10 });
    holoTag(redlinePen, "redline pen", 0, 0.88, 0, { css: "#9a7fd6", w: 0.28 });
    reg(hits, redlinePen, "redline-pen");
    const mismatchTrail = box(mapFlat, 0.3, 0.006, 0.02, -0.1, 0.006, -0.05, 0xd2312b, { rough: 0.6, opacity: 0.7, transparent: true, cast: false });
    mismatchTrail.visible = false;

    // ------------------------------------------------------ notification list
    const notifyBoard = holoPanel(g, 0.85, 0.55, 1.6, 1.35, -2.32, (ctx, w, h) => {
      ctx.fillStyle = "#1c1230"; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9a7fd6"; ctx.fillRect(0, 0, w, 6);
      ctx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = "#eee6fb"; ctx.fillText("EXCEEDANCE NOTIFICATION LIST", w * 0.06, h * 0.15);
      ctx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`; ctx.fillStyle = "#eee6fb";
      ["1. Site project manager", "2. Bay Area Air District", "3. Adjacent residents", "4. Nearby school"].forEach((line, i) => {
        ctx.fillText(line, w * 0.06, h * (0.34 + i * 0.15));
      });
    }, { accent: DPR_ACCENT });
    void notifyBoard;
    for (const [id, x] of [["notify-airdistrict-listed", 1.35], ["notify-neighbors-listed", 1.6], ["notify-school-listed", 1.85]]) {
      const tick = ball(g, 0.025, x, 1.2, -2.29, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.3, rough: 0.5 });
      reg(hits, tick, id);
    }

    // -------------------------------------------------------------- filing
    const fileCabinet = cabinet(g, 0.7, 1.0, 0.5, 2.2, 0.5, -1.9, 0x4a545e, { doorColor: 0x39424b });
    void fileCabinet;
    const patrolLog = group(g, 2.0, 0.14, -1.4);
    box(patrolLog, 0.3, 0.4, 0.06, 0, 1.05, 0, 0x2f6f4a, { rough: 0.6 });
    decal(patrolLog, 0.24, 0.32, 0, 1.05, 0.031, paperFace("PATROL LOG", ["Field observations", "Plate · time · photo"], { bg: "#e6f0e8", band: "#2f6f4a" }));
    holoTag(patrolLog, "patrol log", 0, 1.3, 0, { css: "#9a7fd6", w: 0.3 });
    reg(hits, patrolLog, "patrol-log-binder");

    // ----------------------------------------------------------- photo inbox
    const inboxTray = group(g, 2.3, 0.14, -0.6);
    box(inboxTray, 0.32, 0.06, 0.24, 0, 0.82, 0, 0x8a939b, { rough: 0.5, metal: 0.3 });
    const inboxLight = ball(inboxTray, 0.02, 0.13, 0.86, 0, 0xf2ae14, { emissive: 0xf2ae14, ei: 0.4, rough: 0.5 });
    holoTag(inboxTray, "photo inbox", 0, 0.95, 0, { css: "#9a7fd6", w: 0.3 });
    reg(hits, inboxTray, "photo-inbox");

    // ------------------------------------------------------------ letter pad
    const letterPad = group(g, 0.4, 0.14, -1.55);
    box(letterPad, 0.3, 0.005, 0.4, 0, 0.793, 0, 0xffffff, { rough: 0.85 });
    const letterFace = decal(letterPad, 0.26, 0.34, 0, 0.796, 0, paperFace("COMMENT LETTER", ["Draft — gaps pending"], { bg: "#ffffff", band: "#9a7fd6" }));
    letterFace.rotation.x = -Math.PI / 2;
    holoTag(letterPad, "comment letter", 0, 0.16, 0, { css: "#9a7fd6", w: 0.36 });
    reg(hits, letterPad, "comment-letter-pad");
    const highlighter = group(g, 0.7, 0.14, -1.35, 0.2);
    box(highlighter, 0.02, 0.02, 0.13, 0, 0.8, 0, 0xf2e14a, { rough: 0.5 });
    holoTag(highlighter, "highlighter", 0, 0.86, 0, { css: "#9a7fd6", w: 0.28 });
    reg(hits, highlighter, "highlighter");
    const dropCiteBtn = box(letterPad, 0.06, 0.02, 0.03, 0.1, 0.006, -0.14, 0xd2312b, { rough: 0.55 });
    decal(dropCiteBtn, 0.055, 0.018, 0, 0.011, 0, signFace("SOFTEN", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.4 }));
    reg(hits, dropCiteBtn, "drop-citation");
    const sendContractorBtn = box(letterPad, 0.08, 0.02, 0.03, -0.1, 0.006, -0.14, 0xd2312b, { rough: 0.55 });
    decal(sendContractorBtn, 0.075, 0.018, 0, 0.011, 0, signFace("SEND DRAFT", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.38 }));
    reg(hits, sendContractorBtn, "share-draft-with-contractor");

    // ---------------------------------------------------------- authorities
    const citeBoard = group(g, 0.9, 0.14, -1.15, -0.3);
    for (const [id, label, dx] of [["cite-baaqmd-reg6", "BAAQMD Reg. 6", -0.09], ["cite-dtsc-oversight", "DTSC oversight", 0.09]]) {
      const tag = box(citeBoard, 0.15, 0.06, 0.01, dx, 0.85, 0, 0x2b3138, { rough: 0.6 });
      decal(tag, 0.13, 0.05, 0, 0, 0.006, signFace(label, { bg: "#2b3138", accent: "#9a7fd6", scale: 0.4 }));
      reg(hits, tag, id);
    }

    // ------------------------------------------------------------ date stamp
    const dateStamp = group(g, 1.3, 0.14, -1.6, 0.4);
    cyl(dateStamp, 0.035, 0.045, 0.11, 0, 0.85, 0, 0x8a5a3a, { rough: 0.6, metal: 0.2, seg: 12 });
    const stampWheel = cyl(dateStamp, 0.03, 0.03, 0.02, 0, 0.91, 0, 0xe8b02e, { rough: 0.5, seg: 16 });
    holoTag(dateStamp, "date stamp", 0, 0.98, 0, { css: "#9a7fd6", w: 0.3 });
    reg(hits, dateStamp, "date-stamp");
    const backdateLever = box(dateStamp, 0.02, 0.06, 0.02, 0.06, 0.85, 0, 0xd2312b, { rough: 0.5 });
    decal(backdateLever, 0.018, 0.055, 0, 0.011, 0, signFace("−3d", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.5 }));
    reg(hits, backdateLever, "backdate-letter");
    const signatureLine = box(letterPad, 0.2, 0.004, 0.03, 0, 0.005, 0.16, 0x1b1e22, { rough: 0.6 });
    reg(hits, signatureLine, "signature-line");
    // The one uncited line in the draft, for the proofread step to catch.
    const unsupportedLine = box(letterPad, 0.2, 0.004, 0.02, 0, 0.005, 0.02, 0xd2312b, { rough: 0.6, opacity: 0.5, transparent: true });
    reg(hits, unsupportedLine, "unsupported-claim");

    // ------------------------------------------------------------- calendar
    const calendar = group(g, -2.6, 0, 0.6);
    box(calendar, 0.5, 0.6, 0.03, 0, 1.7, 0, 0xf3efe4, { rough: 0.85 });
    const calFace = decal(calendar, 0.44, 0.5, 0, 1.7, 0.016, signFace("Comment due: next week", { bg: "#f3efe4", accent: "#1b1e22", scale: 0.28 }));
    holoTag(calendar, "wall calendar", 0, 2.0, 0, { css: "#9a7fd6", w: 0.36 });
    const tack = ball(calendar, 0.018, 0.12, 1.9, 0.018, 0xd2312b, { rough: 0.5 });
    reg(hits, tack, "calendar-tack");

    // -------------------------------------------------------- bulletin board
    const bulletin = group(g, 2.5, 0, 0.6);
    box(bulletin, 0.9, 0.7, 0.03, 0, 1.6, 0, 0x8a5a3a, { rough: 0.8 });
    for (const [dx, dy] of [[-0.25, 0.18], [0.05, 0.1], [-0.1, -0.15], [0.22, -0.05]]) {
      box(bulletin, 0.24, 0.18, 0.005, dx, 1.6 + dy, 0.018, 0xf3efe4, { rough: 0.9 });
    }
    holoTag(bulletin, "community meeting flyers", 0, 2.0, 0, { css: "#9a7fd6", w: 0.5 });

    // -------------------------------------------------------------- bookshelf
    const shelf = group(g, -2.6, 0, -1.4);
    box(shelf, 0.5, 1.8, 0.28, 0, 0.9, 0, 0x6f5a3e, { rough: 0.7 });
    for (let i = 0; i < 4; i++) box(shelf, 0.46, 0.03, 0.26, 0, 0.3 + i * 0.4, 0, 0x5a4a30, { rough: 0.7 });
    for (let i = 0; i < 14; i++) box(shelf, 0.03, 0.24, 0.16, -0.2 + i * 0.032, 0.5, 0, [0x7a4a3a, 0x3a5a6a, 0x6a5a3a][i % 3], { rough: 0.8 });
    for (let i = 0; i < 10; i++) box(shelf, 0.03, 0.2, 0.14, -0.2 + i * 0.045, 0.9, 0, [0x6a3a4a, 0x4a6a5a][i % 2], { rough: 0.8 });
    for (let i = 0; i < 6; i++) cyl(shelf, 0.06, 0.06, 0.16, -0.15 + i * 0.06, 1.3, 0, [0x8a5a3a, 0x3a5a4a][i % 2], { rough: 0.7, seg: 10 });

    // -------------------------------------------------------- extra dressing
    const rug = box(g, 2.2, 0.01, 1.6, -0.7, 0.101, -0.5, 0x5a3a4a, { rough: 0.9, cast: false });
    void rug;
    for (const cx of [-0.9, 0.5, 1.4]) {
      const light = group(g, cx, 2.9, -0.5);
      box(light, 0.5, 0.04, 0.16, 0, 0, 0, 0xf3efe4, { rough: 0.6, emissive: 0xfff2d0, ei: 0.5 });
    }
    const wasteBasket = cyl(g, 0.1, 0.08, 0.2, -0.3, 0.1, -1.3, 0x2b3138, { rough: 0.7, seg: 12 });
    void wasteBasket;
    const laptop = group(g, -0.3, 0.14, -1.6);
    box(laptop, 0.24, 0.015, 0.17, 0, 0.79, 0, 0x2b2f34, { rough: 0.4, metal: 0.3 });
    box(laptop, 0.24, 0.16, 0.01, 0, 0.87, -0.08, 0x2b2f34, { rough: 0.4, metal: 0.3 }).rotation.x = -0.3;
    const mug = cyl(g, 0.035, 0.03, 0.07, -0.05, 0.83, -1.4, 0xf2ae14, { rough: 0.5, seg: 12 });
    void mug;
    for (let i = 0; i < 3; i++) {
      const flyerExtra = box(bulletin, 0.2, 0.15, 0.005, -0.3 + i * 0.28, 1.6 + (i % 2 ? 0.2 : -0.22), 0.02, 0xf3efe4, { rough: 0.9 });
      void flyerExtra;
    }

    // ------------------------------------------------------------- crew
    standingFigure(g, -1.9, -0.25, { atStation: true, ry: 2.0, cloth: 0x37505f, vest: DPR_ACCENT, helmet: 0xf2f2f2 });
    seatedFigure(g, -2.1, 0.14, -1.3, { cloth: 0x5a4a6b, ry: 0.6 });

    // -------------------------------------------------------------- live state
    let flagged = false, calendarSet = false;

    return {
      hits,
      spawnLook: new THREE.Vector3(0, 1.2, -1.4),
      footprint: 2.2,
      onStep() {},
      onStepComplete(step) {
        if (step.id === "unroll-map") { mapCart.visible = false; }
        if (step.id === "check-monitor-map") { mismatchTrail.visible = true; }
        if (step.id === "redline-map") { mismatchTrail.material.color.set(0x2f7d4f); }
        if (step.id === "draft-comment-letter") repaint(letterFace, paperFace("COMMENT LETTER", ["Draft — gaps listed below"], { bg: "#ffffff", band: "#9a7fd6" }));
        if (step.id === "sign-file") calFace.material.emissiveIntensity = 0.4;
      },
      onInterrupt(it) {
        if (it.id === "monitor-photo-mismatch") { inboxLight.material.emissiveIntensity = 2.2; }
        if (it.id === "deadline-moved") { flagged = true; repaint(calFace, signFace("Comment due: TOMORROW", { bg: "#2a0c0c", accent: "#ffffff", scale: 0.24 })); calFace.material.emissiveIntensity = 1.4; }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "monitor-photo-mismatch") { inboxLight.material.emissiveIntensity = 0.4; }
        if (it.id === "deadline-moved") {
          calendarSet = true;
          flagged = false;
          calFace.material.emissiveIntensity = 0.5;
          repaint(calFace, signFace("Comment due: TOMORROW (flagged)", { bg: "#0f1b14", accent: "#59c97b", scale: 0.2 }));
        }
      },
      onHazard() {},
      animate(t, dt, session) {
        const step = session?.step;
        if (flagged) calFace.material.emissiveIntensity = 0.9 + Math.sin(t * 6) * 0.5;
        if (session?.track && step?.id === "redline-map") {
          mismatchTrail.scale.x = 0.6 + session.track.v * 0.8;
        }
        if (session?.turn && step?.id === "stamp-letter") {
          stampWheel.rotation.z = session.turn.amount * Math.PI * 2;
        }
        void calendarSet;
      },
    };
  },
};
