// Learner identity for a static app — the launch context an LMS, portal or
// union-hall kiosk hands us, so a training record is attributable to a
// person rather than a self-typed crew tag.
//
// There is no server here, so nothing can be cryptographically verified:
// this is a *launch context*, not authentication, and the docs say so. What
// it does guarantee is provenance — identity only arrives two ways, both
// under the host's control:
//
//   1. Launch URL:  ?learner=<display name>&learner_id=<account id>&learner_home=<https origin>
//      Read once, stored per tab (sessionStorage), then scrubbed from the
//      address bar so bookmarks and screenshots never carry it.
//   2. Embedding page (iframe): window.postMessage({ type: "smartcitix:identity",
//      learner, learner_id, learner_home }) — accepted only when learner_home
//      equals the sender's real origin, so a frame can't claim a home it isn't.
//
// In return the app posts every finished attempt back to that same origin
// (see emit()), so a hosting LMS can capture records live without an LRS.

const IDENTITY_KEY = "vr-training-identity-v1";
const MSG_IDENTITY = "smartcitix:identity";
const MAX_NAME = 60, MAX_ID = 120;
// ASCII control characters (0-31 and 127), built without escape sequences so
// the source stays plain text in every editor and bundler.
const CONTROL_CHARS = new RegExp(`[${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`, "g");

function cleanField(v, max) {
  if (typeof v !== "string") return null;
  const s = v.replace(CONTROL_CHARS, "").trim().slice(0, max);
  return s || null;
}

/** An https (or http on localhost) origin with no path — or null. */
export function cleanOrigin(v) {
  if (typeof v !== "string") return null;
  try {
    const u = new URL(v);
    const local = u.hostname === "localhost" || u.hostname === "127.0.0.1";
    if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return null;
    return u.origin;
  } catch (_) { return null; }
}

export function parseIdentity(raw, senderOrigin = null) {
  const name = cleanField(raw?.learner, MAX_NAME);
  const id = cleanField(raw?.learner_id, MAX_ID);
  const homePage = cleanOrigin(raw?.learner_home);
  if (!name && !id) return null;
  if (senderOrigin != null && homePage !== senderOrigin) return null;
  return { name: name ?? id, id: id ?? name, homePage, source: senderOrigin == null ? "url" : "message" };
}

export const Identity = {
  current: null,

  /** Launch-URL identity first (then scrubbed), else whatever this tab already has. */
  load() {
    let found = null;
    try {
      const params = new URLSearchParams(location.search);
      if (params.has("learner") || params.has("learner_id")) {
        found = parseIdentity({
          learner: params.get("learner"), learner_id: params.get("learner_id"), learner_home: params.get("learner_home"),
        });
        for (const k of ["learner", "learner_id", "learner_home"]) params.delete(k);
        const q = params.toString();
        history.replaceState(null, "", location.pathname + (q ? `?${q}` : "") + location.hash);
      }
    } catch (_) { /* no URL API (headless stub) — fall through */ }
    if (found) this.set(found);
    else {
      try { const saved = JSON.parse(sessionStorage.getItem(IDENTITY_KEY) || "null"); if (saved?.id) this.current = saved; }
      catch (_) { /* ignore */ }
    }
    return this.current;
  },

  set(identity) {
    this.current = identity;
    try { sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity)); } catch (_) { /* ignore */ }
  },

  clear() {
    this.current = null;
    try { sessionStorage.removeItem(IDENTITY_KEY); } catch (_) { /* ignore */ }
  },

  /** Accept identity from an embedding page. Returns the unsubscribe function. */
  listen(onChange) {
    const handler = (e) => {
      if (e.data?.type !== MSG_IDENTITY) return;
      const identity = parseIdentity(e.data, e.origin);
      if (!identity) return;
      this.set(identity);
      onChange?.(identity);
    };
    addEventListener("message", handler);
    return () => removeEventListener("message", handler);
  },

  /** True when running inside another page (an LMS iframe, a portal). */
  get embedded() { try { return window.parent !== window; } catch (_) { return false; } },

  /**
   * Post an event to the host page — only when embedded AND the learner's
   * home origin is known, and only to that origin. Never broadcasts.
   */
  emit(type, payload) {
    const target = this.current?.homePage;
    if (!this.embedded || !target) return false;
    try { window.parent.postMessage({ type, ...payload }, target); return true; }
    catch (_) { return false; }
  },

  /** A short crew-tag-sized label for HUDs and leaderboards. */
  tag() {
    const n = this.current?.name;
    return n ? n.replace(/\s+/g, " ").slice(0, 12).toUpperCase() : null;
  },
};
