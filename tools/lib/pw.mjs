/**
 * The one place the headless checkers find Playwright and its Chromium
 * (console CI-GREEN, docs/consoles/CI-GREEN.md). Before this file every
 * browser checker imported Playwright from this container's own path, which
 * no other machine has, so every one of them failed on the CI runner.
 *
 * The module, first found wins:
 *   1. PLAYWRIGHT_MODULE          — a path or specifier the caller names;
 *   2. `playwright` from node_modules — what CI installs (pinned, see
 *      .github/workflows/webxr-checks.yml) and what `npm i playwright` gives
 *      a contributor;
 *   3. this container's global install under /opt/node22.
 *
 * The Chromium executable, first found wins:
 *   1. PLAYWRIGHT_CHROMIUM (or the older CHROMIUM_PATH);
 *   2. /opt/pw-browsers/chromium when it exists (this container);
 *   3. Playwright's own download (`npx playwright install chromium`), by
 *      leaving `executablePath` undefined.
 *
 * `PW` and `EXE` are the two choices as text, for the checkers' messages;
 * `pwExecutable()` is the path to launch with (undefined for Playwright's own).
 */
import { existsSync } from "node:fs";

const OPT_MODULE = "/opt/node22/lib/node_modules/playwright/index.mjs";
const OPT_CHROMIUM = "/opt/pw-browsers/chromium";

/** Where the module comes from, as a specifier import() accepts, or null when nothing is found. */
function pwResolve() {
  if (process.env.PLAYWRIGHT_MODULE) return process.env.PLAYWRIGHT_MODULE;
  try { return import.meta.resolve("playwright"); } catch { /* not installed beside the repo */ }
  return existsSync(OPT_MODULE) ? OPT_MODULE : null;
}

/** The Chromium executable to launch, or undefined for Playwright's own. */
export function pwExecutable() {
  const named = process.env.PLAYWRIGHT_CHROMIUM || process.env.CHROMIUM_PATH;
  if (named) return named;
  return existsSync(OPT_CHROMIUM) ? OPT_CHROMIUM : undefined;
}

/** The Playwright module (`{ chromium, ... }`); throws naming what to do when none is found. */
export async function pwModule() {
  const spec = pwResolve();
  if (!spec) throw new Error("Playwright was not found: set PLAYWRIGHT_MODULE, or run `npm i --no-save playwright && npx playwright install --with-deps chromium`");
  return import(spec);
}

/** Launch headless Chromium with the resolved executable; `opts` as for chromium.launch. */
export async function pwLaunch(opts = {}) {
  const { chromium } = await pwModule();
  return chromium.launch({ executablePath: pwExecutable(), ...opts });
}

export const PW = pwResolve() ?? "playwright (not found)";
export const EXE = pwExecutable() ?? "Playwright's own Chromium";
