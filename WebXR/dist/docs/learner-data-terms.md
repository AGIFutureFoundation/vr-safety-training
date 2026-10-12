# Learner-data terms — what this software does with your training data

**Draft for counsel.** These terms are a plain-language description of what the code in this repository does today.
They are not legal advice and have not been reviewed by a lawyer. They say only what the software enforces; where a
sentence says "never", a checker (`tools/check_dataworks.mjs`, `tools/check_roboexport.mjs`) tests it. Anyone who
deploys this software elsewhere is responsible for their own terms and their own law.

Console ROBOEXPORT (`docs/consoles/ROBOEXPORT.md`), on the DATAWORKS data system (`WebXR/shared/dx-data.js`,
`docs/consoles/DATAWORKS.md`). SmartCiti.X Holodeck · Powered by AGI Corp.

## 1. Nothing is recorded unless you opt in

Data sharing for robot training is **off by default**. The software records a training episode only after you press
"Opt in" in the Me tab's data panel, confirm you are 18 or older, and choose a licence. Until then nothing is recorded.

Opting in is refused, and recording never starts, when any of these holds:

- the session is the **demo**;
- you are **signed out**;
- the session is a **K-12**, classroom or kids' session (read from the page's audience, a school session on the
  profile, or an administrator's class-scoped version); an adult who has played a K-12 lesson on this profile is not
  offered collection either;
- you have not confirmed you are an adult;
- the software **cannot tell** any of the above. An unknown counts as "do not collect".

## 2. What is recorded

Only after you opt in, and only these (the panel shows the same list, from `DX_COLLECTS`):

- which station, lesson, drill or robot game you played and in which world;
- each decision you made (the action), what the scene showed at that moment, and the score change;
- timing in seconds, interruptions answered or missed, and safe-practice flags;
- your in-world position and view direction during a station (never a real-world location).

Each recorded episode carries your consent receipt: the consent id, the time, the licence you chose, a hash of the
consent statement and the adult confirmation.

## 3. What is never collected

The schema has no field for these and the validator rejects any record that carries one (`DX_NEVER`): your name, your
crew tag in plain text, your e-mail, free text, voice or audio, camera images, your real-world location, and any
account or wallet id. Sessions are keyed by a salted hash that is made on your device, rotates daily and on revoke,
and is never derived from an id. This is data minimisation, not a proof of anonymity: a small group's timing patterns
could still be distinctive.

## 4. Where it lives: this device

Episodes are stored in **this browser only** (IndexedDB, with localStorage as the fallback), capped in size with the
oldest evicted first. **No data module in this software makes a network call**: there is no upload endpoint, no fetch,
no beacon and no socket, and the checker scans for them. The only way an episode leaves the device is if you press
"Export" on the data page yourself and hand the file to someone; what you do with that file is yours to decide, under
the licence you chose.

## 5. What it trains

Your recorded episodes are read by one thing: the **local provider** on this device (`WebXR/shared/vb-colearn.js`), a
k-nearest-neighbour behaviour-cloning policy that drives **simulated** robots in this software. When you have opted in
and have takes, its card says "your N takes"; otherwise it says "synthetic demonstrations". Training happens in the
browser. Nothing is sent to a server, another learner or any robot outside the simulation. The exported datasets in
`exports/robotics/` are synthetic and contain no learner episode.

## 6. How to stop, and that stopping deletes

One tap, "Stop and delete everything", in the same panel. Revoking deletes, on this device: the consent, the salt,
every stored episode (IndexedDB and localStorage), the older episode log and the sharing consent of this profile. Any
recorder still running is discarded. The local provider drops back to synthetic demonstrations and its card says so.
Where an organisation has registered your consent's metadata in its governance registry (`ent3-governance.js`), the
revoke marks every dataset holding it as needing a rebuild and every policy trained on it as stale.

If you exported a file yourself before revoking, that copy is outside this software's reach; deleting it is up to
whoever holds it.

## 7. Licences you can choose

`CC0-1.0` or `CC-BY-4.0`, chosen at opt-in and written into every episode's receipt. The licence governs any file you
export; it is not a transfer of anything to this project, because the project receives nothing.

## 8. What this project does not promise

- It does not promise anonymity (section 3), only that the listed fields are never collected.
- It does not promise that a file you exported and shared can be recalled.
- It does not promise any outcome from training: the policies are small clones on simulated tasks and are not
  certifications of anyone's practice.
- It does not operate a server, a cloud store or an account system for this data, and makes no statement about any
  deployment that adds one; such a deployment would need its own terms.
- It makes no statement about hardware, partners, customers, payments or tokens; none is involved in this data path.
- It does not replace the law of wherever you are. Counsel should review this document before it is shown to learners
  as terms.

## 9. Where to check

| Claim | Where the code enforces it | Checker |
|---|---|---|
| Off by default; adult, signed-in, not K-12, not demo; unknown refuses | `dxEligibility`, `dxOptIn`, `dxCollecting` in `WebXR/shared/dx-data.js` | `tools/check_dataworks.mjs` section 2–3 |
| Only the listed fields; the never-list is rejected | `DX_COLLECTS`, `DX_NEVER`, `dxValidateEpisode` | `check_dataworks` |
| Local only, no network call | every `dx-*.js` module | `check_dataworks` (scan) |
| Revoke deletes | `dxRevoke` | `check_dataworks` section 4 |
| Trains the local provider only; synthetic otherwise | `vbColearnLocalSource`, `vbColearnDescribe` in `vb-colearn.js` | `tools/check_robotrain.mjs` |
| This document says nothing the code does not enforce | — | `tools/check_roboexport.mjs` (forbidden-promise scan) |
