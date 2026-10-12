# HIVE-4 (`h4`, port 9122): the hive's voices, memory and console

Loop 10, round 4. Base 048869d5 (fast-forward). SmartCiti.X Holodeck · Powered by AGI Corp. This console builds on OMEGA-HIVE,
VOICES, HIVE-IN-WORLD and HIVE-3.

Agents are software and say so. No LLM or network call: every line, exchange and memory reference is generated on the device
from the persona and the hive's own events and chain, and a grounding check proves every fact. Voice is on-device only
(`localService` true), off until the learner turns it on; captions always show; nothing listens. The governor's rules stand:
the e-stop comes first, the physical path stays disabled, and the learner approves anything that names a robot.

## Declaration (committed before the held-out run)

This section was committed before `tools/check_hive4.mjs` first ran the held-out trait-recovery test. The result is reported
below exactly as measured, whatever it is.

**Trait recovery from text.**
- **Unit:** a persona-day. Personas come from seeds 1–100. Each persona's four traits are drawn uniformly in [0, 1]
  (mulberry32 seeded with `seed * 7919 + 13`, rounded to 3 decimals). Its padding lexicon is that of `OH_AGENTS[seed % 7]`,
  which is unrelated to the drawn traits. Its style is `ohStyleFromTraits(traits, lexicon)`.
- **Lines:** each persona re-says every speak event of the seeded hive day for its own seed (`ohHiveDay(seed, { nJobs: 60,
  ticksPerDay: 160, decide: <the checker's seeded stand-in>, exchanges: true, memory: true, variety: true })`), from the event's
  facts only, through `ohSay(persona, facts, { variety: true, recent: <its last four lines> })`.
- **Fit seeds:** 1–50. **Held-out seeds:** 51–100. Nothing from seeds 51–100 is used to fit or tune.
- **Features** (text only, per line, averaged over the persona's lines), eight:
  1. words per sentence (`ohWords` over `ohSentences`);
  2. sentences per line;
  3. opener share: the line starts with one to four words ending in "," or ":" and its first word is not an agent's name;
  4. warm words per line: `thanks|thank|glad|nice|good|cheers|everyone|team|teamwork|friends|hi|hey|great|pleased|gladly|kindly|patience`;
  5. formal words per line: `note|noted|record|recorded|confirming|kindly|please|verified|logged|clarity|may`;
  6. careful phrases per line: `simulated robot only|e-stop|governor agrees|site's limits|safe|checking`;
  7. brisk phrases per line: `without delay|right away|as quick as the rules allow|moving on|next|done here|onward|that is all`;
  8. commas per sentence.
- **Regressor:** per trait, ridge regression (lambda = 1) on the features z-scored with the fit set's mean and SD, with an
  unpenalised intercept.
- **Reported:** the Spearman rank correlation per trait over the 50 held-out personas. Secondary: the seven real agents
  re-saying the seed-101 day (a rank correlation over 7 points; small n, reported but not the claim).

**Repetition (distinct-2).** Per agent, over its lines in the seed-7 day (the checker's stand-in decisions). Tokens are lowercased
words with facts masked (a job id becomes J, a site name S, an agent name A, a number or clock N). Bigrams are taken within a
line; distinct-2 is unique bigrams over all bigrams. **Before** is the default hive (`check_hive4` shows it is byte-identical to
the base); **after** is the panel's configuration (exchanges, memory, variety). A third column, variety only on the same events
as before, separates the wording from the new lines.
