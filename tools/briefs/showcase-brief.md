# Showcase brief — one programme demo page per partner team

You are a team agent at a named console building ONE partner-facing demo page for the SmartCiti.X ~ Holodeck
prototype (repo /home/user/vr-safety-training, WebXR/three.js). The owner will open this page in a meeting with
the partner's team: it must carry a video demo, a plain overview, the programme details, and the build info.

## Where you work (hard rules)
- Work ONLY under `$SP/showcase/<slug>/` (SP=/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad).
  Do NOT edit, commit, stash, checkout or reset anything in /home/user/vr-safety-training — a gated merge is running
  in that tree. Read-only access to the repo (cat, git log, node -e reading JSON) is fine.
- Never `pkill -f` / `killall`; other teams' browsers and servers share the machine. Kill only PIDs you started.
- Use unique file names (prefix with your slug) anywhere outside your folder.
- Log every step, with UTC time, to `$SP/showcase/<slug>/console.md` (heading `# <CONSOLE> console`).

## Facts rules (non-negotiable)
- Every fact on the page comes from the repo's own data: `WebXR/smartcity/catalog.json` (curricula[].{name,union,
  certification,summary,stations,completionRule,ladder}, stations[]), `docs/programmes/<id>.md`,
  `docs/investor/stations.csv` (evalScore, standardsScore, steps, kinds, hazards, interruptions, citations),
  `docs/investor/platform-summary.json`, the world data modules under `WebXR/`, and `git log`.
- No invented statistics, outcomes, prices, dates, partner claims, testimonials or quotations. No "proven",
  "clinically", "certified by". The platform is a prototype; say so. Where a real body is named, name it only as
  the catalog does. Never state a clause number, dose, pressure, load or limit — the stations say "per the plan/label".
- Counts must be computed by script from the data at build time, not typed from memory.

## Local tooling you may use
- Static servers (already running; restart with `cd <dir> && nohup python3 -m http.server <port> >/dev/null 2>&1 &`
  if curl fails): repo `WebXR/` at http://localhost:8970 ; published build at http://localhost:8971 (scratchpad/site2).
  Station runner: http://localhost:8970/smartcity/dist/smartcity-x.html?station=<id> (check the existing tools for exact
  query params). Home: http://localhost:8970/home.html.
- Playwright: `import { chromium } from "/opt/node22/lib/node_modules/playwright/index.mjs"`, launch with
  `executablePath: "/opt/pw-browsers/chromium", args:["--use-gl=swiftshader","--enable-unsafe-swiftshader"]`.
- Station clips: `node $SP/review/rec_review.mjs <series> <stationId…>` writes review/<series>/raw/<id>/*.webm
  (title card + first steps of a real run). Use series `showcase-<slug>`. Read the script first.
- Page/world clips and stills: `$SP/rec_page.mjs`, `$SP/rec_bayworld.mjs`, `$SP/shot_district.mjs`, `$SP/cap_r1.mjs`
  — read each before use; copy and adapt into your folder rather than editing shared scripts.
- Video assembly: `python3 $SP/review/promo.py <name> "<title>" "<hook>" "<outro>"` with env
  `PROMO_CLIPS='[[src,startSec,"caption","narration line"],…]'` → review/promo/<name>/promo-<name>.mp4 (Kokoro
  voice-over, 1280×720). Captions and lines: NO apostrophes. Use name `showcase-<slug>`. Aim for 60–110 s,
  7–10 clips. Stills can become clips with ffmpeg zoompan → webm first.
- The machine has 4 cores and is shared; recordings are slow. Record only what the video uses, one browser at a time.

## The page (index.html in your folder)
Follow the artifact page contract: no doctype/html/head/body tags; `<title>` (2–4 word name) and `<style>` first;
Google Fonts only; no external images or scripts except cdnjs; theme tokens on `:root` with a dark variant under
`@media (prefers-color-scheme: dark)` guarded `:root:not([data-theme="light"])` and again `:root[data-theme="dark"]`;
body gets an explicit background; works at 400 px with a 16 px gutter; no horizontal page scroll.
Give each page its own identity drawn from its subject (do not reuse the investor-pitch palette verbatim), polished
but not over-designed. Sections, in this order:
1. Header: programme name, one-line purpose, "working prototype" marker, who it is prepared for (as allowed below).
2. Video demo: `<video controls playsinline preload="metadata" poster="{{shot:poster}}" src="{{video}}">`.
3. Overview: what a learner does, how they are graded (completion rule, stars, unsafe actions), the ladder.
4. Details: the full station list (title, what it trains, steps, interaction kinds, hazards, interruptions,
   eval score) as a scannable table/list inside its own overflow-x container; where the programme lives in the
   open worlds (sites, district, quests) from the world data; the Guide; devices (phone, laptop, headset).
5. Screens: 3–6 captioned stills `{{shot:<name>}}`.
6. Build info: commits touching the programme (short sha, date, subject from `git log --format`), the checkers
   that guard it (from tools/check_all.mjs), content-eval mean and min for its stations, standards it cites,
   repo link https://github.com/AGIFutureFoundation/vr-safety-training/tree/claude/vr-ar-safety-training-wkwmve
   plus deep links to its docs/programmes file and relevant source files on that branch.
7. Next steps for a pilot: phrased as offers/questions for the partner's team (review every station, pilot a
   cohort, correct anything that does not match their practice) — no commitments on their behalf.
Placeholders `{{video}}` and `{{shot:<name>}}` are replaced by the coordinator after upload. Put every still as a
PNG/JPG in `<folder>/assets/<name>.png` and the final video at `<folder>/assets/demo.mp4`.

## Hand back
Reply with: the page path, the asset list (placeholder → file), video length and size, the facts sources used, and
anything you could not verify. Keep the reply under 300 words; the console file holds the detail.
