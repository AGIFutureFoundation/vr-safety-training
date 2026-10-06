/**
 * Self-test for the Orbis-Stable client stub (WebXR/shared/orbis-stable.js).
 *
 * This is a pure ES module with no THREE/DOM dependency and no network
 * calls, so it runs directly under plain Node — no stubbing needed, unlike
 * check_smartcity.mjs / check_trades.mjs. It asserts the safety contract:
 * forbidden biometric/emotion keys are rejected before the transport ever
 * runs, opting out short-circuits before the transport runs, and a normal
 * request reaches the (stub) transport untouched.
 *
 *     node tools/check_orbis_stable.mjs
 */

import { createOrbisClient, validateInput, OrbisSafetyError, FORBIDDEN_SIGNAL_KEYS, FLOW_CONFIG } from "../WebXR/shared/orbis-stable.js";

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures += 1;
    console.log(`  ✗ ${name}\n      ${err.stack ?? err}`);
  }
}
async function checkAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures += 1;
    console.log(`  ✗ ${name}\n      ${err.stack ?? err}`);
  }
}

console.log("Orbis-Stable client — self-test\n");

check("safety flags are all on and frozen", () => {
  const s = FLOW_CONFIG.safety;
  if (!(s.neverUseBiometrics && s.neverInferMentalHealth && s.neverUseManipulativePrompts && s.alwaysOfferOptOut)) {
    throw new Error("a safety flag is off");
  }
  let mutated = false;
  try { FLOW_CONFIG.safety.neverUseBiometrics = false; } catch (_) { mutated = false; }
  mutated = FLOW_CONFIG.safety.neverUseBiometrics === false;
  if (mutated) throw new Error("FLOW_CONFIG.safety is not actually frozen");
});

check("validateInput rejects every forbidden key at the top level", () => {
  for (const key of FORBIDDEN_SIGNAL_KEYS) {
    let threw = false;
    try { validateInput({ [key]: 1 }); } catch (err) { threw = err instanceof OrbisSafetyError; }
    if (!threw) throw new Error(`"${key}" was not rejected`);
  }
});

check("validateInput rejects a forbidden key nested under context", () => {
  let threw = false;
  try { validateInput({ context: { nested: { facial_expression: "happy" } } }); }
  catch (err) { threw = err instanceof OrbisSafetyError; }
  if (!threw) throw new Error("nested facial_expression was not rejected");
});

check("validateInput accepts ordinary non-biometric telemetry", () => {
  validateInput({ prompt: "hello", context: { score: 2100, elapsedSeconds: 180, errors: 0 } });
});

await checkAsync("start() rejects a forbidden signal before the transport runs", async () => {
  let transportCalled = false;
  const client = createOrbisClient({ transport: async (req) => { transportCalled = true; return req; } });
  client.setContext({ heart_rate: 88 });
  let threw = false;
  try { await client.start(); } catch (err) { threw = err instanceof OrbisSafetyError; }
  if (!threw) throw new Error("start() did not throw");
  if (transportCalled) throw new Error("transport ran despite a forbidden signal");
});

await checkAsync("opting out short-circuits before the transport runs", async () => {
  let transportCalled = false;
  const client = createOrbisClient({ transport: async (req) => { transportCalled = true; return req; } });
  client.optOut();
  const result = await client.start();
  if (transportCalled) throw new Error("transport ran despite opt-out");
  if (!result.optedOut) throw new Error("start() did not report the opt-out");
});

await checkAsync("a clean request reaches the transport untouched", async () => {
  const client = createOrbisClient();
  client.setPrompt("suggest a next station").setContext({ score: 1800, errors: 1 });
  const result = await client.start();
  if (!result.ok || !result.stub) throw new Error("stub transport did not respond as expected");
  if (result.echo.prompt !== "suggest a next station") throw new Error("prompt was not passed through");
});

console.log(failures === 0 ? "\nAll orbis-stable checks pass." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
