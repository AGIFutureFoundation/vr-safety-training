# Omega Hive: the software agents that manage the simulated robots

SmartCiti.X Holodeck · Powered by AGI Corp. "Omega Hive" is the name of the agent collective. It is a feature of the
parishes app, in the drills menu beside the agent-jobs panel. Console notes: `docs/consoles/OMEGA-HIVE.md`.

## What it is

- **Seven software agents**, each labelled "software agent" wherever it appears. They are the dispatcher, the safety
  steward, the maintenance planner, the consent keeper, the trainer, the auditor and logistics (`WebXR/shared/oh-hive-data.js`).
  - Each has an invented first name (no real person), a one-sentence role and a home robot site from `RB_SITES`.
  - Each has an avatar look: an agent badge from `av-sprites.js` (`avAgentLook`) plus an outfit from the agent set (tablet,
    visor, high-visibility vest). On the desktop high tier the figure is AVATARS-HD's high-detail body: a cool porcelain shell,
    with eyes, brows and a mouth drawn on its visor band, kept away from every human skin tone (no realistic skin, no real
    person's likeness). Inside the robotics rooms it is a lighter level of the same body (AVATARS-HD-2), so each room stays
    inside its budget.
  - Each has four personality traits in [0, 1]: warmth, formality, verbosity and caution.
  - Each has a speaking style derived from those traits (`ohStyleFromTraits`):
    - verbosity sets the sentence-length band;
    - formality and warmth choose the openers;
    - warmth and caution choose the closers;
    - caution chooses the hedges;
    - each agent also has a small lexicon of its own.
  - Each has voice parameters: a language, a rate and a pitch from the traits, and a few voice-name hints.
- **The hive** (`oh-hive.js`) runs over VBRIDGE's job stream. It is seeded and deterministic.
  1. The dispatcher announces each job.
  2. The working agents bid. A bid weighs skill for the task against hops to the site and the agent's current load,
     and the best bid wins the job.
  3. The winner's request goes through the safety governor (`vb-governor.js`), unchanged. The governor also monitors
     every step of the run, and the e-stop wins.
  4. The safety steward reviews every job the governor allowed and may veto it. A veto only ever adds a refusal.
  5. A request that names a physical robot is refused by the governor, because that path ships disabled. It then comes
     to the learner as an approval request. Approving re-queues it as a simulated job, which passes the governor again
     like any other job. Declining closes it.
  6. Every award, veto, refusal, approval request, approval, decline, dispatch and completion is written to the hive's
     hash chain and to ENTERPRISE-3's audit log, beside the governor's own lines.
- **Words** (`oh-say.js`). `ohSay(agent, event)` builds each line on the device from two things only: the agent's style
  grammar and the event's own data.
  - Every number, id and site name in a line comes from its event. `ohGrounded` re-checks this, and the checker runs it
    over every line of a seeded day.
  - The wording is calm. The Kids rule's scan runs over every line.
- **Voice** (`oh-voice.js`).
  - Only on-device voices are used: a `speechSynthesis` voice is chosen only when its `localService` is true. A network
    voice is never chosen; when no local voice exists, the agent stays silent and its caption still shows.
  - Voice is off until the learner turns it on. HIVE-3: for a signed-in, non-K-12 profile outside the demo, the choice is
    remembered on this device under that profile's own key, with "supervise every job" and the hive's language. It is never
    uploaded and is cleared on sign-out. Demo, K-12 and signed-out sessions keep nothing.
  - HIVE-3: the panel's own text and the agents' role sentences follow the hive's language (English or Spanish). The Spanish
    is machine-assisted and awaits a native speaker's review.
  - Captions always show, with or without voice.
  - Lines queue, so agents never talk over each other.
  - AVATARS-HD-2: with voice on, an agent's figure (outdoors and in a robotics room) lights its talk light and moves its mouth
    when the voice starts the line, not when the line arrives, and the mouth opens on each word the voice reports (the
    utterance's word boundaries). The caption shows when the line starts, as before. If a voice has not started a line within
    4 s, it is treated as stuck and the figure follows its own timing.
  - Leaving the page stops speech.
  - Nothing listens: there is no microphone, no recognition and no recording.
- **The panel** (`oh-panel.js`) has:
  - roster cards with the portrait, the name, the "software agent" label, the role and personality chips;
  - a live caption feed;
  - the voice toggle;
  - the approval queue;
  - Step and Run controls.

  It is not mounted in K-12, demo or signed-out sessions. The check is DATAWORKS' `dxEligibility` at the offer stage.
  Headless drives reach it through `window.__parishTest.hive`.

## What it is not

- **Not people.** The agents are software, and the page says so on every card and in every caption. Their names are
  invented. Their portraits are drawn from the agent figure (a visor face on a porcelain shell), never from a person.
- **Not a language model.** No model call and no network call exist anywhere in the hive.
  - `ohDialogueAdapter` has the GRIOT and `agent-protocols.js` shape for a deployment that wants a hosted model later.
    Unconfigured, it refuses with "configure per the provider's current documentation" and sends nothing.
  - Even configured, it calls only a transport the deployment hands in. It speaks a reply only when every fact in the
    reply appears in the event.
- **Not a robot controller.** Every robot here is simulated.
  - The physical path is disabled (`VB_PHYSICAL`), and nothing in the hive turns it on.
  - Approving a request lets only the simulated job run.
  - The governor's rules stand: the e-stop comes first, then the allowlist, speed and separation, policy lineage, the
    rate limit and the anomaly check.
- **Not a chain or a market.** There are no keys, no wallets, no chain calls, no tokens and no payments. Virtuals
  Protocol is a planned technology only; see `docs/virtuals-bridge.md`.
- **Not a measure of real operations.** The job stream, its rates and its limits are simulation parameters. A hop
  between robot sites counts maps and regions, not distance. "One step" is one simulated minute.

## How it is checked

`node tools/check_omega_hive.mjs` covers:

- the seven agents, and styles that re-derive from the traits;
- the event contract with AGENT-AVATARS;
- determinism;
- the governor invariants (every dispatched job checked, every run step monitored, vetoes never grant, approvals
  wherever the physical path is named, e-stop first);
- the ENTERPRISE-3 audit lines;
- style adherence, grounding and calm text;
- personality distinctiveness (a naive-Bayes speaker classifier, with a neutral-style control);
- coordination against a single dispatcher;
- voice on the device only;
- no listening and no network;
- the panel's mount gate;
- hygiene.

The figures are in `docs/consoles/OMEGA-HIVE.md`.
