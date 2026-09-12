/**
 * A minimal reactive store — just enough pub-sub to let app.js (the Three.js
 * engine) hand its UI state to react-ui.js (the 2D chrome) without either
 * side reaching into the other's DOM. Every write replaces the whole state
 * object (or a named slice of it) so React's useSyncExternalStore can tell
 * "changed" from "same" with a plain reference check.
 */
export function createStore(initial) {
  let state = initial;
  const subs = new Set();

  function get() {
    return state;
  }

  function set(patch) {
    state = typeof patch === "function" ? patch(state) : { ...state, ...patch };
    for (const fn of subs) fn(state);
  }

  /** Shallow-merge `partial` (or the object a function of the previous slice
   * returns) into the named top-level slice, e.g. "hud". */
  function patch(key, partial) {
    const prev = state[key];
    const delta = typeof partial === "function" ? partial(prev) : partial;
    set({ [key]: { ...prev, ...delta } });
  }

  function subscribe(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  }

  return { get, set, patch, subscribe };
}
