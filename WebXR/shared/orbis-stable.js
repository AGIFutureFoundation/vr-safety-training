/**
 * Orbis-Stable client — a pluggable, safety-constrained interface for an
 * external adaptive-content / video-generation model. This module has no
 * real backend behind it: nothing here ever makes a network call. It exists
 * so a real client can be dropped in later (by passing a real `transport`
 * to createOrbisClient) without touching any calling code, and so the
 * safety contract is enforced at the boundary regardless of which transport
 * ends up behind it.
 *
 * Nothing in this file is imported by the running apps (WebXR/smartcity,
 * WebXR/trades) yet — there is no live endpoint or credential to wire it to.
 */

// The non-negotiable safety posture for this integration. A caller that
// wants different behavior needs a different module, not a flag flip here.
export const FLOW_CONFIG = Object.freeze({
  safety: Object.freeze({
    neverUseBiometrics: true,
    neverInferMentalHealth: true,
    neverUseManipulativePrompts: true,
    alwaysOfferOptOut: true,
  }),
});

// Any of these keys appearing anywhere in a request payload means someone is
// trying to feed this a biometric or inferred-mental-state signal. That is
// rejected before the transport is ever called, not logged-and-allowed.
export const FORBIDDEN_SIGNAL_KEYS = Object.freeze([
  "heart_rate",
  "facial_expression",
  "camera_emotion",
  "keystroke_emotion",
  "mental_health_score",
  "attention_score_from_camera",
]);

export class OrbisSafetyError extends Error {
  constructor(message, key) {
    super(message);
    this.name = "OrbisSafetyError";
    this.key = key;
  }
}

/**
 * Throws OrbisSafetyError if `payload` (checked recursively, since a
 * forbidden signal can just as easily be nested under a "context" or
 * "telemetry" object as sit at the top level) contains any forbidden key.
 * Safe to call on anything JSON-shaped; non-plain-object values are ignored.
 */
export function validateInput(payload, path = "") {
  if (payload == null || typeof payload !== "object") return;
  for (const [key, value] of Object.entries(payload)) {
    if (FORBIDDEN_SIGNAL_KEYS.includes(key)) {
      throw new OrbisSafetyError(
        `Refusing to send "${path}${key}" — biometric/inferred-mental-state signals are never sent to this model.`,
        key,
      );
    }
    if (value && typeof value === "object") validateInput(value, `${path}${key}.`);
  }
}

/**
 * The default transport: no network call, ever. It exists so
 * createOrbisClient is usable and testable with nothing behind it, and so
 * the shape a real transport must match is obvious. Swap this for a real
 * one (e.g. `(request) => fetch(endpoint, {...}).then(r => r.json())`) once
 * there is an actual endpoint and working credentials — nothing else in
 * this file needs to change.
 */
async function stubTransport(request) {
  await new Promise((resolve) => setTimeout(resolve, 30));
  return {
    ok: true,
    stub: true,
    note: "orbis-stable stub transport — no request left this machine.",
    echo: { prompt: request.prompt ?? null, hasImage: !!request.image, context: request.context ?? null },
  };
}

/**
 * Create a client. `transport` defaults to the no-network stub above; pass
 * a real one to make this do something. Every `start()` call re-validates
 * the full accumulated payload immediately before handing it to the
 * transport, and refuses outright while opted out — both checks happen
 * client-side, before the transport function is ever invoked.
 */
export function createOrbisClient({ transport = stubTransport } = {}) {
  let prompt = null;
  let image = null;
  let context = null;
  let optedOut = false;

  return {
    setPrompt(text) { prompt = text; return this; },
    setImage(source) { image = source; return this; },
    /** Non-biometric context only (score, elapsed time, step counts, ...) —
     * validateInput() still enforces this at start(), this just narrows the
     * type at the call site for anyone integrating for real later. */
    setContext(nonBiometricContext) { context = nonBiometricContext; return this; },

    optOut() { optedOut = true; },
    optIn() { optedOut = false; },
    isOptedOut() { return optedOut; },

    async start() {
      if (!FLOW_CONFIG.safety.alwaysOfferOptOut) {
        throw new OrbisSafetyError("alwaysOfferOptOut must stay true; refusing to start.");
      }
      if (optedOut) {
        return { ok: false, optedOut: true, note: "Learner has opted out of this feature." };
      }
      const request = { prompt, image, context };
      validateInput(request);
      return transport(request);
    },
  };
}
