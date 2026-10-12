// ARENA-2 (docs/consoles/ARENA-2.md): a learner's OWN consented takes, exported into the robot-arena set on their device.
// SmartCiti.X Holodeck · Powered by AGI Corp.
//
// What it does, plainly:
//   * It reads the learner's own local takes through COLEARN's colLocalDemos, which returns nothing unless DATAWORKS'
//     dxCollecting() holds right now: an eligible session (signed in, not the demo, not K-12 or a classroom) and the learner's
//     own adult (18+) opt-in. Signed out, demo, K-12 or not opted in: 0 takes, and the export says why.
//   * Every take passes dxValidateEpisode and must carry an adult consent receipt; a take without one is refused and listed.
//   * It writes one JSONL line per step in the arena set's schema (tools/ra_dataset.mjs, `smartcitix.robotics.arena-episode@2`),
//     with the take's own consent provenance on every line (consent receipt id, adult, licence), split "train".
//   * Nothing is sent anywhere: the file is offered as a download the learner saves themselves. Revoking consent (dxRevoke)
//     deletes the stored takes, so the next export has 0.
// Browser-safe (no node: imports). Every top-level name starts with `ra`/`RA_`; imports are plain (no alias).

import { dxValidateEpisode, dxCollecting, dxStore } from "./dx-data.js";
import { colLocalDemos, colF } from "./col-learn.js";
import { RB_SCENARIOS } from "./rb-robotics-data.js";

export const RA_TAKES_SCHEMA = "smartcitix.robotics.arena-episode@2";
/** The arena tasks a take can belong to: the six gym games and the three robot stations (variants share their base). */
export const RA_TAKES_TASKS = RB_SCENARIOS.filter((s) => s.kind === "game" || s.kind === "station").map((s) => s.id);
const raTkR4 = (n) => Math.round(n * 1e4) / 1e4;
const raTkIsStation = (sc) => String(sc).startsWith("rb-station-");

/** The observation as named scene features (AMR: per robot), as tools/ra_dataset.mjs writes it. */
export function raTakesObs(sc, obs) {
  const F = colF(sc);
  if (sc === "rb-amr-fleet-routing") return { robots: F.perRobot(obs).map((r) => (r.delivered ? null : r.f.map(raTkR4))) };
  return { f: F.of(obs).map(raTkR4) };
}

/** One dataset line, byte for byte as tools/ra_dataset.mjs writes it (checked by check_arena). */
export function raTakesLine(ep, s, t, split, sc) {
  return JSON.stringify({
    schema: RA_TAKES_SCHEMA, episode: ep.episodeId, t, split, source: ep.source,
    consent: ep.source === "human" ? { consentId: ep.consent.consentId, adult: true, licence: ep.consent.licence } : null,
    scenario: sc, station: RB_SCENARIOS.find((x) => x.id === sc)?.station ?? null, instruction: sc,
    ...(raTkIsStation(sc) ? { step: s.observation?.stepId ?? null } : {}),
    observation: raTakesObs(sc, s.observation), action: s.action, reward: raTkR4(s.reward ?? 0),
    rules: { unsafe: !!s.info?.unsafe, outcome: s.info?.outcome ?? null }, done: !!s.done,
  });
}

/**
 * Export the learner's own consented takes. Returns { ok, reason, takes, refused, provenance, lines, jsonl }:
 * ok false with a reason (and 0 takes) unless collecting; provenance is one row per take (episode, scenario, steps,
 * consent receipt id, licence, adult). `signals` is for tests (dxReadSignals' shape); the page passes nothing.
 */
export async function raTakesExport({ store = dxStore, signals = null } = {}) {
  const empty = (reason) => ({ ok: false, reason, takes: 0, refused: [], provenance: [], lines: 0, jsonl: "" });
  if (!dxCollecting(signals)) return empty("Not collecting: sign in, outside the demo and any K-12 or classroom session, and opt in as an adult (18+) in the consent panel. Nothing is exported.");
  const seen = new Set(), lines = [], provenance = [], refused = [];
  for (const sc of RA_TAKES_TASKS) {
    for (const ep of await colLocalDemos(sc, { store, signals })) {
      if (!ep || seen.has(ep.episodeId)) continue;
      seen.add(ep.episodeId);
      const v = dxValidateEpisode(ep);
      if (!v.ok) { refused.push({ episode: ep.episodeId ?? "?", why: v.errors[0] }); continue; }
      if (!(ep.consent?.consentId && ep.consent?.adult === true)) { refused.push({ episode: ep.episodeId, why: "no adult consent receipt" }); continue; }
      ep.steps.forEach((s, t) => lines.push(raTakesLine(ep, s, t, "train", sc)));
      provenance.push({ episode: ep.episodeId, scenario: sc, steps: ep.steps.length, consentId: ep.consent.consentId, licence: ep.consent.licence, adult: true, source: "human" });
    }
  }
  return { ok: true, reason: provenance.length ? "ok" : "Collecting, but no robot take is stored yet.", takes: provenance.length, refused, provenance, lines: lines.length, jsonl: lines.length ? `${lines.join("\n")}\n` : "" };
}

/**
 * The page control: a button that exports the learner's own takes, a status line and the per-sample provenance table.
 * The download is a local file the learner saves; nothing is uploaded. Returns the element to place in the page.
 */
export function raTakesMount(doc = globalThis.document, { store = null, signals = null } = {}) {
  const box = doc.createElement("section");
  box.className = "ra-takes"; box.setAttribute("aria-labelledby", "ra-takes-h");
  box.innerHTML = `<h3 id="ra-takes-h">My robot takes in the arena set</h3>
<p>Exports only your own takes, only while you have opted in as an adult. The file is saved on this device; nothing is sent. Revoking consent deletes the takes.</p>
<button type="button" class="ra-takes-go" style="min-height:44px;min-width:44px;padding:8px 14px">Export my takes to the arena set</button>
<p class="ra-takes-status" role="status" aria-live="polite"></p>
<table class="ra-takes-prov" hidden><caption>Provenance per sample</caption><thead><tr><th scope="col">Take</th><th scope="col">Task</th><th scope="col">Steps</th><th scope="col">Consent receipt</th><th scope="col">Licence</th></tr></thead><tbody></tbody></table>`;
  const status = box.querySelector(".ra-takes-status"), table = box.querySelector(".ra-takes-prov"), body = table.querySelector("tbody");
  box.querySelector(".ra-takes-go").addEventListener("click", async () => {
    const r = await raTakesExport({ store: store ?? dxStore, signals });
    body.textContent = "";
    for (const p of r.provenance) {
      const tr = doc.createElement("tr");
      for (const v of [p.episode, p.scenario, p.steps, p.consentId, p.licence]) { const td = doc.createElement("td"); td.textContent = String(v); tr.appendChild(td); }
      body.appendChild(tr);
    }
    table.hidden = !r.provenance.length;
    status.textContent = r.ok ? `${r.takes} take${r.takes === 1 ? "" : "s"}, ${r.lines} lines${r.refused.length ? `, ${r.refused.length} refused` : ""}. ${r.takes ? "Saved as a file on this device." : r.reason}` : r.reason;
    box.dataset.raTakes = String(r.takes);
    if (r.jsonl && typeof Blob !== "undefined" && globalThis.URL?.createObjectURL) {
      const a = doc.createElement("a");
      a.href = URL.createObjectURL(new Blob([r.jsonl], { type: "application/x-ndjson" }));
      a.download = "my-robot-takes.arena-episode.jsonl";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  });
  return box;
}
