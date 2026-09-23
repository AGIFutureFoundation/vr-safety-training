# Signage — union signs, ANSI safety signs and jobsite boards

Every SmartCiti.X station pad carries two signs the stage builds for it
(`WebXR/smartcity/js/stage.js` → `WebXR/shared/signage.js`): the **union
sign** of the programme the station belongs to, and the **safety sign** for
its trade category's dominant hazard. Neither needs a per-station edit; the
gate is `tools/check_signage.mjs`. Screenshots:
[`docs/screenshots/signage/`](screenshots/signage/).

## Trademark policy

**No union logo is reproduced anywhere in this repository.** A union's logo
is its registered trademark, and the platform holds no licence to it. What
the sign shows is a **wordmark** — the union's abbreviation set large, its
full name set small, the local where the repository already names one with
certainty, and a "Training partner" line naming the union's training fund
from the standards registry — typeset at runtime from `tools/unions.json`.
The wordmark uses the platform's own palette; a union's colour scheme is used
only where it is public and certain, and so far no entry sets one.

A licensed deployment that holds a union's written permission to display its
logo can supply the file itself: `WebXR/assets/brand/manifest.json` maps each
union id to a `file` under `assets/brand/`, and when that file exists and
loads the sign shows it in place of the wordmark, keeping the training-partner
line. **The repository ships the manifest with every `file` null**, a licence
note stating that the deployment must hold permission, and nothing under
`assets/brand/` but the manifest and its README. `tools/check_signage.mjs`
fails the build if a `file` is non-null or any other file appears in that
directory.

No local, colour, motto or slogan is invented. `tools/unions.json` sets a
`local` only where the repository names exactly one local for that union
(UNITE HERE Local 2, UA Local 38, LIUNA Local 261); a union the repository
names several locals of (IUOE Local 3 and Local 39; SEIU 87, USWW and 1021)
gets none. Bodies that are not unions — the Red Cross, NATE, the ADHA, ADAA
and DANB, the PMA — are not listed and get no sign.

## Which union a station carries

`unionForStation()` in `signage.js`:

1. the first programme in `curricula.js` that lists the station (a station
   shared by several programmes gets the one the catalog lists first); of the
   unions that programme's `union` string names, the one whose training fund
   covers the station's category in the registry, else the first named;
2. failing a programme, the unions the station's own `certification` names,
   chosen the same way (23 stations are in no programme);
3. failing both, the category's default (`CATEGORY_DEFAULT_UNION`).

`tools/unions.json` is the source of record; `node tools/gen_unions.mjs`
writes `WebXR/shared/unions.js` from it and the registry, and the checker
fails if the two differ.

## The safety sign

`safetySign()` follows ANSI Z535.2: a signal-word header panel in the
standard's colour — **DANGER** white on red, **WARNING** black on orange,
**CAUTION** black on yellow, **NOTICE** white italic on blue, **SAFETY FIRST**
white on green — with the safety alert symbol beside the three hazard words,
a white message panel with generic text, and an optional hazard, prohibition
or mandatory pictogram. The text per category is the small table
`HAZARD_BY_CATEGORY` in `signage.js` (Energy & Power → DANGER high voltage;
Water & Environmental → CAUTION confined space; Construction & Structural
Trades → WARNING fall hazard; and so on). No manufacturer's artwork and no
site's real numbers appear on any sign.

## Budget

Each sign is at most three meshes (post, backing, face). The union sign is
always built. The safety sign is built only if the station's own meshes plus
both signs stay inside the 320-mesh headset budget (`STATION_MESH_BUDGET`,
read by `tools/check_budget.mjs`); a station at the limit keeps its union sign
and the stage skips the safety sign, and both `check_budget.mjs` and
`check_signage.mjs` report how many stations that was. In AR the learner's own
room is the site: the union sign stands just off the pad and no safety sign is
built.

## Jobsite boards

`jobsiteBoard()` builds the boards a site posts — `permit`, `emergency`,
`osha-poster` (a placeholder that says where the current federal and state
posters go), `muster`, `hot-work`, `confined-space` — each three meshes with
generic copy and blanks where a real site fills in its own numbers. They are
available to station and district authors; the stage does not place them.
