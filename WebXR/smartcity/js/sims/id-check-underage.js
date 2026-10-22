import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";
import {
  box, cyl, slab, group, decal, repaint, signFace,
} from "../../../shared/kit.js";
import {
  CITY, stationPad, holoPanel, holoTag, instrument, standingFigure, reg,
} from "../citykit.js";
import { simTitle, system, AWARD } from "../gamify.js";

// SmartCiti.X~ Checking ID VR — Culinary & Hospitality, Bartending series.
// The door and the rail, not the well: every ABC-acceptable form of ID, the
// F.L.A.G. method worked in order, a UV check against the security features,
// the birth-date arithmetic done against the calendar rather than trusted by
// eye, a second form asked for when in doubt, and a refusal that is polite,
// documented and handed off to the rest of the bar so one bartender's "no"
// does not quietly become someone else's "yes" twenty minutes later.

const IDCHK_ACCENT = 0xb8862b;

export const SIM_ID_CHECK_UNDERAGE = {
  id: "id-check-underage",
  index: "132",
  domain: "Culinary & Hospitality",
  trade: "Bartender — UNITE HERE Local 2",
  category: "Culinary & Hospitality",
  indoor: "bar",
  weather: "clear",
  certification: "California ABC Responsible Beverage Service (RBS) certification and Business and Professions Code §25658 sale to a minor; TIPS or ServSafe Alcohol training on the F.L.A.G. method; Cal/OSHA 8 CCR §3342 workplace violence prevention plan for a refusal that escalates; UNITE HERE Local 2's own practice on backing up a refusal across the shift",
  name: "Checking ID",
  title: simTitle("Checking ID"),
  tagline: "F.L.A.G., a UV check, the birth-date math against the calendar, a second form when in doubt, and a refusal that is polite, documented and handed to the rest of the bar",
  accent: IDCHK_ACCENT,
  accentCss: "#b8862b",
  parSeconds: 270,
  footprint: 2.3,
  badge: { id: "door-held", name: "Door Held", note: "Every ID at the rail checked to F.L.A.G. and both underage attempts caught and documented" },

  game: system({
    name: "Door Authority",
    currency: "CARD",
    ranks: ["Barback", "Bartender", "Shift Lead", "Bar Manager", "RBS Certified Trainer"],
    badges: [
      { id: "flag-clean", name: "F.L.A.G. Clean", note: "Worked feel, look, ask and glance in order without a correction", test: AWARD.stepClean("flag-method") },
      { id: "never-served", name: "Never Served", note: "No unsafe action anywhere in the run", test: AWARD.safe },
      { id: "caught-both", name: "Caught Both", note: "Both the mismatched photo and the birthday-tomorrow patron were refused clean", test: AWARD.all(AWARD.stepClean("refuse-mismatch"), AWARD.stepClean("refuse-underage")) },
    ],
    challenges: [
      { id: "clean-shift", name: "Clean Shift", note: "No corrections anywhere in the run", test: AWARD.clean },
      { id: "held-composure", name: "Held Composure", note: "Never broke the hold during a refusal", test: AWARD.unbroken },
      { id: "door-fast", name: "Door Fast", note: "Complete inside 80% of par", test: AWARD.fast(0.8) },
    ],
  }),

  hazards: {
    "photo-id-on-phone": "That is a photo of an ID on somebody's phone screen, not the ID itself. California law requires an actual, physical, valid form of identification — a photo can be borrowed from anyone's camera roll and proves nothing about who is standing in front of you holding the phone.",
    "id-expired-accepted": "That ID expired months ago. An expired card is not a valid form of identification under the ABC Act even when the photo is a perfect match — the state stopped vouching for its accuracy the day it expired, and a bartender who accepts it is vouching for it instead.",
    "vertical-format-missed": "That card is printed vertically — California prints every under-21 licence and ID in portrait format for exactly this reason, so it reads as underage from across the bar before anyone gets close enough to check a birth date. Glancing past the orientation is missing the one feature built to be seen first.",
    "confront-alone": "You are squaring up to the refused patron by yourself instead of calling for backup. Cal/OSHA's workplace violence prevention plan under 8 CCR §3342 exists because a refusal is exactly the moment a calm interaction can turn, and the plan's whole point is that nobody handles that alone at the door.",
  },

  lateNotes: {
    "ask-second-id": "There's no reason to ask for a second form yet — the first one hasn't failed anything.",
    "refuse-mismatch-id": "Ask for a second form before refusing outright — in doubt gets one more chance to resolve, not an immediate no.",
  },

  steps: [
    {
      id: "acceptable-forms", kind: "select", target: "forms-poster",
      title: "Know the ABC-acceptable forms of ID",
      cue: "Check the posted list: driver's licence, state ID, passport, passport card, or military ID.",
      why: "The ABC only recognises a specific, short list of government-issued forms as valid proof of age, and a workplace ID, a student card or a photocopy is not on it no matter how official it looks — knowing the list cold is what keeps a busy door from waving through something that was never acceptable in the first place.",
    },
    {
      id: "flag-method", kind: "sequence",
      targets: ["flag-feel", "flag-look", "flag-ask", "flag-glance"],
      itemNames: { "flag-feel": "Feel the card", "flag-look": "Look at the photo and printing", "flag-ask": "Ask the birth date", "flag-glance": "Glance face to card" },
      title: "Work the F.L.A.G. method in order",
      cue: "Feel the card's edges and texture, look at the photo and printing, ask the patron their birth date, then glance between their face and the card.",
      why: "F.L.A.G. is taught in this order because each step catches something the next one can't — feel catches a re-laminated fake, look catches bad printing, asking catches a patron who has not memorised the birth date on the card they are holding, and only then does the glance compare a face that has had no time to be coached.",
      outOfOrderNote: "Feel, then look, then ask, then glance — asking before you've actually looked at the card just tests their memory, not the card.",
    },
    {
      id: "uv-check", kind: "hold", target: "uv-lamp", seconds: 5,
      title: "Check the card under UV light",
      cue: "Hold the card under the lamp and confirm the hologram and security thread.",
      why: "A real driver's licence carries security features that only show under ultraviolet light and cost real equipment to fake — the hologram and thread are what F.L.A.G.'s ordinary look cannot catch on a good counterfeit, which is why a UV check is its own separate step rather than folded into the glance.",
      holdBreakNote: "Pulled the card out before the lamp confirmed anything. A half-second under the light proves nothing — hold it the full count.",
    },
    {
      id: "accept-return", kind: "drag", target: "id-card-1",
      title: "Return the verified ID",
      cue: "Hand the checked, valid card back across the bar.",
      why: "A verified ID goes straight back to its owner rather than sitting on the bar top being handled by anyone else — the check is finished the moment F.L.A.G. and the UV pass clean, and holding onto someone's ID longer than that is its own small trust problem at the door.",
      drag: { to: "return-slot-1", radius: 0.4, missNote: "Not back in their hand — set it down on the bar and it's the next thing to go missing in the shuffle." },
    },
    {
      id: "queue-scan", kind: "find", noHint: true,
      targets: ["workplace-badge", "student-card"],
      itemNames: { "workplace-badge": "an employee ID badge", "student-card": "a student ID card" },
      itemNotes: {
        "workplace-badge": "A badge with a photo and a name is not a government-issued form of ID — plenty of employers print one that looks convincing.",
        "student-card": "A university card proves enrolment, not age, and it isn't on the ABC's list no matter how official the seal looks.",
      },
      title: "Scan the rest of the queue",
      cue: "Two cards in this stack are not ABC-acceptable forms at all — find them before anyone gets further than the door.",
      why: "The door moves fastest when the obviously-wrong forms are pulled before a single one of them gets the full F.L.A.G. treatment — recognising what's not on the list on sight is what keeps a five-deep line from turning into five full UV checks.",
    },
    {
      id: "mismatch-flag", kind: "select", target: "photo-mismatch-flag",
      title: "Catch the photo that doesn't match",
      cue: "This card's photo doesn't match the face holding it — flag it before it goes any further.",
      why: "A borrowed ID is usually a real, unexpired, ABC-acceptable card — everything about it checks out except the one thing F.L.A.G.'s glance step exists to catch, which is that the face in front of you and the face on the card are not the same person.",
    },
    {
      id: "second-form-request", kind: "select", target: "ask-second-id",
      title: "Ask for a second form — in doubt, not out",
      cue: "Ask the patron for a second piece of ID with a matching name before deciding anything.",
      why: "A mismatch is doubt, not proof by itself — some resemblances are close enough to argue, and asking for a second form that has to independently agree with the first is what turns a judgement call into an actual decision either way.",
    },
    {
      id: "second-form-compare", kind: "select", target: "second-form-fail",
      title: "Compare the second form",
      cue: "The second card's name doesn't match the first either — the doubt just became certainty.",
      why: "Two independent documents that disagree with each other, or that both fail to match the face in front of you, is what closes the question F.L.A.G.'s glance opened — there is no plausible honest explanation left for a mismatch confirmed twice.",
    },
    {
      id: "hold-composure", kind: "hold", target: "composure-panel", seconds: 5,
      title: "Stay calm and firm through the refusal",
      cue: "Hold a level, polite tone while you explain the card is being kept from service — no arguing, no raised voice.",
      why: "RBS training teaches the refusal itself as a skill separate from spotting the fake: calm and firm de-escalates, and it is also the behaviour Cal/OSHA's workplace violence prevention plan under 8 CCR §3342 expects from staff in the moment most likely to turn confrontational.",
      holdBreakNote: "Broke composure before the conversation was actually over. Matching a raised voice with your own is how a refusal turns into the incident the workplace violence plan was written to prevent.",
    },
    {
      id: "refuse-mismatch", kind: "select", target: "refuse-mismatch-id",
      title: "Refuse the mismatched ID",
      cue: "Decline service and keep the card — do not hand a confirmed fake back across the bar.",
      why: "Business and Professions Code §25658 makes serving a minor the bartender's own liability, not the patron's excuse, and a card that has failed both a photo match and a second-form check does not get a third chance to somehow still be theirs.",
    },
    {
      id: "birthdate-calc", kind: "select", target: "calendar-correct-date",
      title: "Work the birth-date math against today's date",
      cue: "Find this patron's actual 21st birthday on the wall calendar — the date the card claims is one day short.",
      why: "A birth date only proves someone is of age relative to today, and the arithmetic has to be done against the actual calendar rather than trusted at a glance — a patron born one day too recently is not a rounding error, because the ABC Act doesn't have one.",
    },
    {
      id: "refuse-underage", kind: "select", target: "refuse-underage-id",
      title: "Refuse the patron a day short of 21",
      cue: "Decline service — their birthday is tomorrow, not today.",
      why: "There is no such thing as almost twenty-one under §25658; a patron who turns 21 tomorrow is legally a minor for every hour of tonight's shift, and the calendar the last step just worked through is exactly what makes that an easy call to hold to instead of a hard one.",
    },
    {
      id: "document-refusals", kind: "sequence", anyOrder: true,
      targets: ["log-entry-1", "log-entry-2"],
      itemNames: { "log-entry-1": "mismatched-ID refusal logged", "log-entry-2": "underage refusal logged" },
      title: "Document both refusals",
      cue: "Log each refusal in the door book — time, description, reason.",
      why: "A written refusal log is what backs a bartender up if either patron comes back arguing, and it is also what an ABC investigator or the bar's own RBS records review looks for after any incident — a refusal that only exists in memory did not, as far as either of those is concerned, happen.",
    },
    {
      id: "do-not-serve-handoff", kind: "select", target: "86-flag",
      title: "Hand the refusal off to the rest of the bar",
      cue: "Flag both patrons at the POS so every other bartender on shift knows not to serve them tonight.",
      why: "A refusal that stays with the one bartender who made it is worth nothing the moment that patron sits at a different part of the same bar twenty minutes later — the whole point of the hand-off is that one person's 'no' has to become the whole shift's 'no' for the rest of the night.",
    },
  ],

  interrupts: [
    {
      id: "customer-pressure-waving-card",
      kind: "Impatient customer at the rail",
      after: "uv-check", delay: 3, seconds: 11,
      alert: "Another customer is waving their card and pushing to be served while you're still mid-check on this one.",
      cue: "Point them to wait their turn — don't rush the ID you're already holding.",
      target: "next-in-line-sign",
      why: "The whole reason a UV check exists is that it takes a few extra seconds to actually see the security thread — a second customer's impatience is not a reason to shortcut the check already in progress, and a posted 'one at a time' point makes the answer visible instead of just spoken.",
      missNote: "The UV check got rushed to deal with the second customer, and rushing it is the same as not doing it — either finish what's in your hands or you haven't checked it at all.",
      wrongNote: "It's the wait-your-turn sign. Point them to it and go back to the card you're already holding.",
    },
    {
      id: "friend-passes-drink",
      kind: "Friend passing a drink at the rail",
      after: "hold-composure", delay: 2, seconds: 12,
      alert: "While you're finishing the refusal, a friend standing next to the refused patron slides their own drink across to them.",
      cue: "Stop the hand-off — that drink does not reach the refused patron.",
      target: "friend-glass",
      why: "A refusal at the point of sale means nothing if a drink already poured to someone else reaches the same person thirty seconds later — the friend passing their glass is the same §25658 problem wearing a different face, and it gets caught the same way the original request did.",
      missNote: "The drink changed hands and the refused patron is now holding alcohol anyway — the refusal at the door just got undone at the rail, in front of everyone who saw you make it.",
      wrongNote: "It's the glass being passed. Stop that hand-off before it reaches them.",
    },
  ],

  build(root) {
    const hits = {};
    const g = group(root);
    stationPad(g, 2.3, IDCHK_ACCENT);

    const DOOR_Z = -2.4;

    // ------------------------------------------------------------- the door stand
    const standCounter = slab(g, 1.6, 0.06, 0.6, -2.8, 0.95, DOOR_Z, 0x3a2f28, { radius: 0.02, rough: 0.5 });
    void standCounter;
    for (const dx of [-0.7, 0.7]) cyl(g, 0.03, 0.03, 0.9, -2.8 + dx, 0.47, DOOR_Z, 0x2b211c, { rough: 0.6, seg: 10 });

    const forms = holoPanel(g, 1.0, 0.7, -2.8, 2.0, DOOR_Z - 0.3, (cx, w, h) => {
      cx.fillStyle = "rgba(14,10,4,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8862b"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#f4e6c8";
      cx.font = `600 ${Math.round(h * 0.09)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "left"; cx.textBaseline = "middle";
      cx.fillText("ABC-ACCEPTABLE FORMS OF ID", w * 0.06, h * 0.14);
      cx.font = `${Math.round(h * 0.075)}px Arial, sans-serif`;
      cx.fillStyle = "#e2d0a0";
      ["Driver's licence", "State ID card", "U.S. or foreign passport", "Passport card", "Military ID"]
        .forEach((l, i) => cx.fillText(l, w * 0.06, h * (0.3 + i * 0.13)));
    }, { ry: 0.3, accent: IDCHK_ACCENT });
    reg(hits, forms, "forms-poster");

    // ---------------------------------------------------------------- the ID card
    const idCard = group(g, -2.4, 0.98, DOOR_Z - 0.05, -0.2);
    box(idCard, 0.14, 0.09, 0.006, 0, 0, 0, 0xdfe4e8, { rough: 0.35, metal: 0.1 });
    decal(idCard, 0.12, 0.07, 0, 0, 0.004,
      signFace("ID", { bg: "#e6ecef", accent: "#3a4148", scale: 0.5 }), { px: 128 });
    reg(hits, idCard, "flag-feel");
    // A separate, non-raycast marker for the "return this card" drag socket —
    // sharing the flag-feel object's own hitId would let this second reg()
    // silently overwrite it, breaking the F.L.A.G. sequence in real play even
    // though the headless checker drives sessions directly and never notices.
    const idCard1Hit = box(g, 0.16, 0.1, 0.05, -2.4, 0.98, DOOR_Z - 0.05, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, idCard1Hit, "id-card-1");
    const idLookHit = box(g, 0.18, 0.12, 0.05, -2.4, 0.98, DOOR_Z - 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, idLookHit, "flag-look");
    const idAskHit = box(g, 0.18, 0.12, 0.05, -2.4, 0.98, DOOR_Z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, idAskHit, "flag-ask");
    const idGlanceHit = box(g, 0.18, 0.12, 0.05, -2.4, 0.98, DOOR_Z + 0.02, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    reg(hits, idGlanceHit, "flag-glance");

    // UV lamp.
    const uvLamp = group(g, -2.0, 0, DOOR_Z);
    box(uvLamp, 0.06, 0.3, 0.06, 0, 0.15, 0, 0x2b3138, { rough: 0.5 });
    const uvBulb = box(uvLamp, 0.12, 0.03, 0.05, 0, 0.32, 0, 0x7a3aff, { emissive: 0x7a3aff, ei: 1.4, rough: 0.4 });
    void uvBulb;
    holoTag(uvLamp, "UV lamp", 0, 0.45, 0, { css: "#a079ff", w: 0.24 });
    reg(hits, uvLamp, "uv-lamp");

    // Return slot for the first, valid ID.
    const returnSlot1 = box(g, 0.2, 0.03, 0.14, -1.6, 0.96, DOOR_Z, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    hits["return-slot-1"] = returnSlot1;

    // The queue: a stack of ID-like cards, two of which are not acceptable forms.
    const queue = group(g, -0.6, 0, DOOR_Z + 0.15);
    const badge = box(queue, 0.1, 0.14, 0.006, -0.3, 0.98, 0, 0xf2c14b, { rough: 0.4 });
    reg(hits, badge, "workplace-badge");
    const studentCard = box(queue, 0.12, 0.08, 0.006, -0.1, 0.98, 0.02, 0xdfe4e8, { rough: 0.4 });
    reg(hits, studentCard, "student-card");
    const goodCard1 = box(queue, 0.12, 0.08, 0.006, 0.1, 0.98, 0, 0xe6ecef, { rough: 0.35 });
    void goodCard1;
    const goodCard2 = box(queue, 0.12, 0.08, 0.006, 0.3, 0.98, 0.02, 0xe6ecef, { rough: 0.35 });
    void goodCard2;

    // The vertical-format under-21 card, a hazard if accepted without noticing.
    const verticalCard = box(g, 0.09, 0.14, 0.006, -0.6, 0.98, DOOR_Z + 0.3, 0xe6ecef, { rough: 0.35 });
    holoTag(g, "printed vertical — under 21?", -0.6, 1.1, DOOR_Z + 0.3, { css: "#f0645b", w: 0.44 });
    reg(hits, verticalCard, "vertical-format-missed");

    // A phone displaying a photo of an ID.
    const phoneId = group(g, -0.9, 0, DOOR_Z + 0.4);
    box(phoneId, 0.07, 0.13, 0.01, 0, 0.98, 0, 0x1a1e22, { rough: 0.3 });
    decal(phoneId, 0.06, 0.11, 0, 0.98, 0.006, signFace("ID", { bg: "#e6ecef", accent: "#3a4148", scale: 0.5 }), { px: 96, glow: true, ei: 0.6 });
    holoTag(phoneId, "a photo of an ID?", 0, 1.12, 0, { css: "#f0645b", w: 0.38 });
    reg(hits, phoneId, "photo-id-on-phone");

    // An expired card.
    const expiredCard = box(g, 0.12, 0.08, 0.006, 0.5, 0.98, DOOR_Z + 0.28, 0xdfd6c4, { rough: 0.5 });
    holoTag(g, "expired — still valid?", 0.5, 1.1, DOOR_Z + 0.28, { css: "#f0645b", w: 0.4 });
    reg(hits, expiredCard, "id-expired-accepted");

    // The mismatched-photo patron's card and the compare flag.
    const mismatchCard = group(g, 0.9, 0, DOOR_Z - 0.1);
    box(mismatchCard, 0.12, 0.08, 0.006, 0, 0.98, 0, 0xe6ecef, { rough: 0.35 });
    const mismatchFlag = decal(mismatchCard, 0.1, 0.06, 0, 1.1, 0.003,
      signFace("PHOTO?", { bg: "#241010", accent: "#f0645b", scale: 0.5 }), { px: 128 });
    reg(hits, mismatchFlag, "photo-mismatch-flag");
    const askSecond = group(g, 1.15, 0, DOOR_Z - 0.1);
    box(askSecond, 0.1, 0.05, 0.02, 0, 0.98, 0, IDCHK_ACCENT, { rough: 0.5 });
    holoTag(askSecond, "ask for a second form", 0, 1.1, 0, { css: "#b8862b", w: 0.42 });
    reg(hits, askSecond, "ask-second-id");
    const secondCard = box(g, 0.1, 0.07, 0.006, 1.35, 0.98, DOOR_Z - 0.15, 0xe6ecef, { rough: 0.35 });
    holoTag(g, "still doesn't match", 1.35, 1.1, DOOR_Z - 0.15, { css: "#f0645b", w: 0.36 });
    reg(hits, secondCard, "second-form-fail");

    // Composure panel and the refuse controls.
    const composurePanel = instrument(g, 0.9, 1.15, DOOR_Z + 0.4, { ry: -0.4, idle: "STAY CALM", color: IDCHK_ACCENT, w: 0.14, d: 0.2 });
    reg(hits, composurePanel, "composure-panel");
    const refuseMismatch = box(g, 0.14, 0.1, 0.06, 1.5, 0.98, DOOR_Z - 0.05, 0xb3261e, { rough: 0.5 });
    holoTag(refuseMismatch, "refuse — photo mismatch", 0, 0.14, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, refuseMismatch, "refuse-mismatch-id");

    // Calendar for the birth-date arithmetic.
    const calendar = holoPanel(g, 0.9, 0.6, 2.0, 1.5, DOOR_Z + 0.5, (cx, w, h) => {
      cx.fillStyle = "rgba(10,14,18,0.92)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#b8862b"; cx.fillRect(0, 0, w, 6);
      cx.fillStyle = "#eaf6fb";
      cx.font = `600 ${Math.round(h * 0.11)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("TODAY: SEP 22", w / 2, h * 0.18);
      cx.font = `${Math.round(h * 0.08)}px Arial, sans-serif`;
      cx.fillStyle = "#bcd6e2";
      cx.fillText("Card DOB reads SEP 23 — 21st birthday", w / 2, h * 0.42);
      cx.fillStyle = "#f2c14b";
      cx.fillText("is one day away, not today", w / 2, h * 0.56);
    }, { ry: -0.4, accent: IDCHK_ACCENT });
    reg(hits, calendar, "calendar-correct-date");
    const decoyDate1 = box(g, 0.08, 0.06, 0.02, 1.7, 1.4, DOOR_Z + 0.42, 0x8f979e, { rough: 0.6 });
    void decoyDate1;
    const refuseUnderage = box(g, 0.14, 0.1, 0.06, 2.3, 0.98, DOOR_Z + 0.35, 0xb3261e, { rough: 0.5 });
    holoTag(refuseUnderage, "refuse — one day short", 0, 0.14, 0, { css: "#f0645b", w: 0.46 });
    reg(hits, refuseUnderage, "refuse-underage-id");

    // Refusal log book.
    const logBook = holoPanel(g, 0.7, 0.5, -0.2, 0.5, DOOR_Z - 0.55, (cx, w, h) => {
      cx.fillStyle = "rgba(14,10,4,0.9)"; cx.fillRect(0, 0, w, h);
      cx.fillStyle = "#f4e6c8";
      cx.font = `600 ${Math.round(h * 0.13)}px 'Barlow Condensed', Arial, sans-serif`;
      cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillText("DOOR REFUSAL LOG", w / 2, h * 0.2);
      cx.font = `${Math.round(h * 0.09)}px Arial, sans-serif`;
      cx.fillText("time · description · reason", w / 2, h * 0.55);
    }, { ry: 0.2, accent: IDCHK_ACCENT });
    reg(hits, logBook, "log-entry-1");
    const logBook2 = box(g, 0.16, 0.02, 0.1, 0.1, 0.45, DOOR_Z - 0.5, 0xdfd2b0, { rough: 0.6 });
    reg(hits, logBook2, "log-entry-2");

    // POS 86-flag.
    const pos = group(g, 2.6, 0, DOOR_Z - 0.6);
    box(pos, 0.34, 0.28, 0.05, 0, 1.1, 0, 0x2b3138, { rough: 0.5 });
    const posScreen = decal(pos, 0.28, 0.2, 0, 1.1, 0.028, signFace("86: NONE", { bg: "#0d1c24", accent: "#4fb8c9", fg: "#bfeaf7", scale: 0.5 }), { glow: true, ei: 0.7 });
    reg(hits, pos, "86-flag");

    // Wait-your-turn sign, only ever an interrupt target.
    const waitSign = box(g, 0.14, 0.1, 0.02, -3.3, 1.1, DOOR_Z + 0.2, IDCHK_ACCENT, { rough: 0.5 });
    holoTag(waitSign, "one at a time", 0, 0.14, 0, { css: "#b8862b", w: 0.32 });
    reg(hits, waitSign, "next-in-line-sign");

    // Confront-alone hazard: a second, empty spot at the door with no backup called.
    const confrontHit = box(g, 0.3, 0.4, 0.3, 1.9, 0.9, DOOR_Z - 0.7, 0x000000, { opacity: 0.001, transparent: true, cast: false });
    holoTag(g, "handle this alone?", 1.9, 1.15, DOOR_Z - 0.7, { css: "#f0645b", w: 0.36 });
    reg(hits, confrontHit, "confront-alone");

    // ---------------------------------------------------------------- people
    const validCust = standingFigure(g, -2.4, DOOR_Z + 0.9, { ry: Math.PI, cloth: 0x2c5a3a });

    const mismatchCust = standingFigure(g, 0.85, DOOR_Z + 1.1, { ry: Math.PI, cloth: 0x5a4a7a });
    const mismatchHead = mismatchCust.userData.head;

    const underageCust = standingFigure(g, 2.15, DOOR_Z + 1.45, { ry: Math.PI, cloth: 0x7a3a2c, atStation: true });
    const underageHead = underageCust.userData.head;
    const underageGlassHome = new THREE.Vector3(2.15, 1.05, DOOR_Z + 1.3);
    const underageGlass = cyl(g, 0.03, 0.035, 0.08, underageGlassHome.x, underageGlassHome.y, underageGlassHome.z, 0xcfe6ea,
      { rough: 0.2, transparent: true, opacity: 0.7, seg: 12 });
    underageGlass.visible = false;

    const friend = standingFigure(g, 2.6, DOOR_Z + 1.6, { ry: Math.PI - 0.3, cloth: 0x9a8a5a, atStation: true });
    const friendGlassHome = new THREE.Vector3(2.6, 1.05, DOOR_Z + 1.55);
    const friendGlass = cyl(g, 0.03, 0.035, 0.08, friendGlassHome.x, friendGlassHome.y, friendGlassHome.z, 0xcfe6ea, { rough: 0.2, transparent: true, opacity: 0.7, seg: 12 });
    reg(hits, friendGlass, "friend-glass");

    const impatient = standingFigure(g, 1.8, DOOR_Z + 1.8, { ry: Math.PI + 0.2, cloth: 0x2f6f8c, atStation: true });
    const impatientCardHome = new THREE.Vector3(1.7, 1.1, DOOR_Z + 1.65);
    const impatientCard = box(g, 0.1, 0.06, 0.006, impatientCardHome.x, impatientCardHome.y, impatientCardHome.z, 0xe6ecef, { rough: 0.35 });

    return {
      hits,
      footprint: 2.3,
      spawnLook: new THREE.Vector3(-1.5, 1.1, DOOR_Z),

      onStepComplete(step) {
        if (step.id === "accept-return") { idCard.visible = false; }
        if (step.id === "queue-scan") { badge.visible = false; studentCard.visible = false; }
        if (step.id === "second-form-compare") { repaint(mismatchFlag, signFace("NO MATCH", { bg: "#241010", accent: "#f0645b", scale: 0.4 })); }
        if (step.id === "refuse-mismatch") { mismatchCard.visible = false; }
        if (step.id === "refuse-underage") { underageCust.position.z += 0.15; }
        if (step.id === "do-not-serve-handoff") { repaint(posScreen, signFace("86: 2", { bg: "#0d1c24", accent: "#f0645b", fg: "#ffd2ce", scale: 0.5 })); }
      },

      onInterrupt(it) {
        if (it.id === "customer-pressure-waving-card") {
          impatient.position.z -= 0.3;
          impatientCard.position.set(impatientCardHome.x - 0.15, impatientCardHome.y, impatientCardHome.z - 0.3);
        }
        if (it.id === "friend-passes-drink") {
          friendGlass.position.set(
            friendGlassHome.x + (underageGlassHome.x - friendGlassHome.x) * 0.6,
            friendGlassHome.y + (underageGlassHome.y - friendGlassHome.y) * 0.6,
            friendGlassHome.z + (underageGlassHome.z - friendGlassHome.z) * 0.6,
          );
          underageGlass.visible = true;
        }
      },
      onInterruptEnd(it) {
        if (it.resolved !== "answered") return;
        if (it.id === "customer-pressure-waving-card") {
          impatient.position.z += 0.3;
          impatientCard.position.copy(impatientCardHome);
        }
        if (it.id === "friend-passes-drink") {
          friendGlass.position.copy(friendGlassHome);
          underageGlass.visible = false;
        }
      },

      animate(t) {
        validCust.userData.head.rotation.y = Math.sin(t * 0.5) * 0.12;
        mismatchHead.rotation.y = -0.1 + Math.sin(t * 0.4) * 0.1;
        underageHead.rotation.y = Math.sin(t * 0.6) * 0.14;
      },
    };
  },
};
