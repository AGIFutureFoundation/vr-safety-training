// Text-to-speech helper shared by every app's voice layer. This is purely
// assistive narration — reading back a hint, a room briefing, or progress —
// never a way to perform a step. The hands-on click/drag/turn stays the only
// way to actually advance a procedure; speaking to the app only ever tells
// you things, it never does things for you.

export const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * Speak a line, cancelling whatever the app was already saying so responses
 * never queue up and talk over the run. Silently does nothing where speech
 * synthesis isn't available (older browsers, headless test runners) so
 * callers never need their own support check.
 */
export function speak(text, { rate = 1, pitch = 1 } = {}) {
  if (!speechSupported || !text) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  synth.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (speechSupported) window.speechSynthesis.cancel();
}
