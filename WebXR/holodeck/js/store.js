/**
 * A minimal reactive store — identical in shape to smartcity's store.js.
 * Duplicated rather than shared because each WebXR app is bundled
 * independently into one self-contained file; this file is small enough
 * that copying it is simpler than adding a cross-app shared module.
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
