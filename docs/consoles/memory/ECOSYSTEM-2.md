# ECOSYSTEM-2 memory: what the next console needs to know

## The checker

`check_eco` now has nine legs: 1–6 from round 7, plus 7, 8 and 9 from this round.
- **Legs 7 and 9 open a browser.** They serve `WebXR/` in-process on `ECO_PORT` (9161). They answer three.js and React from `WebXR/vendor/` and abort every other external request. They skip, and say so, only when Playwright is missing.
- **They read the committed dist.** After changing `eco-blocks*.js` or `eco-learn.js`, run `python3 tools/bundle_webxr.py instructor smartcity` before `check_eco`. Without that, legs 7 and 9 fail with the rebuild command, which is the intended guard. Restore the dist afterwards with `git checkout WebXR/*/dist`. The coordinator's regenerate commits fresh dist, and CI checks that it is fresh.
- **Leg 9 is slow and load-sensitive.** It takes about 2 min 46 s for four page loads, so do not run it beside `check_parse`. Its waits are 90 s.

## How a station run starts in the built smartcity page

`?sim=<id>`, then click `#enter-flat` ("Free explore"), then click `#prebrief-start` (a first run shows the pre-brief). Click the pre-brief button through `page.evaluate(() => el.click())`; Playwright's own click waits on a navigation that never comes. Then `window.__smartcityTest.session()` exists.

## Gotchas

- **Never leave `globalThis.window` defined in Node before you drive Playwright.** Leg 8 sets it for `game.js`'s `Sfx`; leg 9 deletes it first. With it set, `waitForFunction` hung.
- **The page lazily loads its bold font face** when the tab first shows bold text. Leg 7 loads `document.fonts` first, so the font fetch is not counted as a request from the tab.
- **The consent key is namespaced by profile** (`dx-consent-v1::id-…`). Build it with the real `dxOptIn` over a storage stand-in, then copy every key into the page with `addInitScript`.

## The rules

- **New rules go at the end of `ECO_RULES`.** The first rule whose station pattern matches decides, so appending never moves an earlier row. Check this with `check_eco` 2 and 2b.
- **The adult packs used so far** are Trade School, Robotics OS, Global Health OS, Corporate OS, Multilateral OS and Non-Profit Practice, all in "11–12 · adult".
- **These groups have no adult block in Cognition.X at 47c1820:** food safety, aviation, habitat restoration and building services. Leave them unmatched rather than force a match.

## The learner path

- **`eco-learn.js`** holds events in page memory only. Consent is re-read at every event and every count, and losing it wipes everything held.
- **The smartcity app** is the only page wired. The trades app (`WebXR/trades/js/app.js`) has its own Session and is not wired.
- **The instructor console** is another page and cannot see the count.
