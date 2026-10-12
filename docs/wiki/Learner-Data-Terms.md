# Learner-data terms, in plain language

A plain-language summary of `docs/learner-data-terms.md`, a draft for counsel that says only what the code enforces.

## What a learner's recorded data means, in plain words

Draft for counsel

A plain-language summary of `docs/learner-data-terms.md`. The document describes what the code does today and says only what a checker enforces; it is not legal advice and has not been reviewed by a lawyer. Before it existed, the repository had no learner-data terms, and the questions page said so.

### Opt in: Nothing is recorded unless you opt in

Data sharing is off by default. A learner opts in from the Me tab, confirms they are 18 or older, and chooses a licence. Opting in is refused for the demo, for a signed-out session, for a K-12 or classroom session, and whenever the software cannot tell: an unknown counts as “do not collect”.

Source: `docs/learner-data-terms.md`, `docs/consoles/DATAWORKS.md`

### Recorded: What is recorded, once you have opted in

- which station or game, and in which world;
- each decision, what the scene showed and the score change;
- timing, interruptions answered or missed, safe-practice flags;
- your in-world position and view direction, never a real-world location.

Each episode carries its consent receipt.

Source: `docs/learner-data-terms.md`

### Never: What is never collected

The schema has no field for a name, a crew tag in plain text, an e-mail, free text, voice, camera images, a real-world location or an account or wallet id, and the validator rejects a record that has one. The session key is a salted hash made on the device. This is data minimisation, not a proof of anonymity.

Source: `docs/learner-data-terms.md`

### Where: Where it lives: this device

Episodes are stored in this browser only. No data module makes a network call: there is no upload endpoint, and a checker scans for one. An episode leaves the device only if the learner presses Export and hands the file on.

Source: `docs/learner-data-terms.md`, `tools/check_dataworks.mjs`

### Trains: What it trains

Only the local provider on that device: a k-nearest-neighbour policy that drives simulated robots. Its card reads “your N takes” when the learner has opted in and has takes, and “synthetic demonstrations” otherwise. Nothing is sent anywhere. The exported datasets in the repository are synthetic and hold no learner episode.

Source: `docs/learner-data-terms.md`, `WebXR/shared/vb-colearn.js`

### Stop: How to stop, and that stopping deletes

One tap deletes, on the device, the consent, the salt and every stored episode, and the provider falls back to synthetic demonstrations. A copy the learner exported before revoking is outside the software's reach.

Source: `docs/learner-data-terms.md`, `tools/check_dataworks.mjs`

### Licence: Licences a learner can choose

The licence is chosen at opt-in, written into every receipt, and governs any file the learner exports: CC0-1.0 or CC-BY-4.0. It transfers nothing to the project, because the project receives nothing.

Source: `docs/learner-data-terms.md`

### Not promised: What the project does not promise

- Anonymity: only that the listed fields are never collected.
- That a file a learner exported and shared can be recalled.
- Any outcome from training: the policies are small clones on simulated tasks.
- Anything about a deployment that adds its own server or account system.
- That this replaces the law where a learner lives.

Source: `docs/learner-data-terms.md`

Where the terms say “never”, the document names the checker that tests it. The terms make no statement about hardware, partners, customers, payments or tokens, because none is involved in this data path.


---

_Every figure on this page was checked against the repository file named beside it when the page was built (head `709cd68e`, 2026-10-12). The robots are simulated; no hardware result, partnership, customer, price, valuation or raise is stated anywhere in this wiki. Standards are named, never quoted, and nothing here claims compliance._
