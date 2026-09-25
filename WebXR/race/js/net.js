// Night Highway Circuit — the two-tab link.
//
// Two tabs of the same browser on the same machine talk over a
// BroadcastChannel. That is the whole of the "network": nothing leaves the
// browser, there is no server, and the UI calls it local multiplayer. The
// host tab runs the simulation (sim.js) with the joining tab's racer driven
// by the inputs it sends; the joining tab only draws the snapshots it gets
// back.

export const RC_CHANNEL = "night-highway-circuit";

export function rcOpenLink(onMessage) {
  if (typeof BroadcastChannel === "undefined") return null;
  const id = Math.random().toString(36).slice(2, 10);
  const ch = new BroadcastChannel(RC_CHANNEL);
  ch.onmessage = (e) => {
    const m = e.data;
    if (!m || typeof m !== "object" || m.from === id) return;
    if (m.to && m.to !== id) return;
    onMessage(m);
  };
  return {
    id,
    send(msg) { try { ch.postMessage({ ...msg, from: id }); } catch (e) { /* closed */ } },
    close() { try { ch.close(); } catch (e) { /* already */ } },
  };
}
