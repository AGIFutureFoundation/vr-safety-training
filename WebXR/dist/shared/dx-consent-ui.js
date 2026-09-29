// DATAWORKS consent panel (docs/consoles/DATAWORKS.md). Mounted inside INTERFACE's Me tab
// (`#menu-dataworks` in parishes.html) and on the analysis page (WebXR/data/index.html).
//
//   dxMountConsent(el, { btnClass, dataHref, onChange }) -> { render() }
//
// Shows what is collected and what never is, the licence choice, the adult (18+) confirmation, the
// eligibility answer (demo / signed-out / K-12 sessions are told plainly that nothing is collected) and a
// one-tap "Stop and delete everything". Off by default: nothing is recorded until "Opt in" is pressed.
// Text only via textContent (no innerHTML with data). Every top-level name carries the dx prefix.

import { DX_COLLECTS, DX_NEVER, DX_LICENCES, dxConsent, dxEligibility, dxOptIn, dxReadSignals, dxRevoke, dxStore } from "./dx-data.js";

function dxEl(tag, props = {}, kids = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) { if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v); }
  for (const k of kids) e.appendChild(k);
  return e;
}

export function dxMountConsent(el, { btnClass = "btn", dataHref = "../data/index.html", onChange = null } = {}) {
  if (!el) return null;
  async function render() {
    el.textContent = "";
    const consent = dxConsent();
    const offer = dxEligibility(dxReadSignals(), { stage: "offer" });
    const head = dxEl("p", { class: "note", text: consent ? `Data sharing: ON since ${consent.at.slice(0, 10)} · licence ${consent.licence}` : "Data sharing for robot training: OFF (the default). Nothing is recorded unless you opt in." });
    head.setAttribute("data-dx-state", consent ? "on" : "off");
    el.appendChild(head);
    const details = dxEl("details", {}, [dxEl("summary", { text: "What is and is not collected" }),
      dxEl("p", { class: "note", text: "Collected (only after you opt in, kept on this device): " + DX_COLLECTS.join("; ") + "." }),
      dxEl("p", { class: "note", text: "Never collected: " + DX_NEVER.join(", ") + "." }),
      dxEl("p", { class: "note", text: "Nothing is uploaded. You can export your own episodes from the data page. K-12, classroom, signed-out and demo sessions are never collected." })]);
    el.appendChild(details);
    const row = dxEl("div", { class: "row" });
    if (consent) {
      let n = 0; try { n = (await dxStore.list()).length; } catch (_) { n = 0; }
      row.appendChild(dxEl("span", { class: "note", text: `${n} episode${n === 1 ? "" : "s"} stored in this browser.` }));
      const stop = dxEl("button", { class: btnClass, type: "button", id: "dx-revoke", text: "Stop and delete everything" });
      stop.addEventListener("click", async () => { await dxRevoke(); onChange?.("revoked"); render(); });
      row.appendChild(stop);
      if (dataHref) row.appendChild(dxEl("a", { class: btnClass, href: dataHref, text: "Data page" }));
    } else if (!offer.eligible) {
      row.appendChild(dxEl("span", { class: "note", "data-dx-reason": offer.reason, text: offer.text }));
    } else {
      const sel = dxEl("select", { id: "dx-licence", "aria-label": "Licence for anything you later export" }, DX_LICENCES.map((l) => dxEl("option", { value: l, text: l })));
      const adult = dxEl("input", { type: "checkbox", id: "dx-adult" });
      const lab = dxEl("label", { for: "dx-adult", class: "note", text: " I am 18 or older" });
      const go = dxEl("button", { class: btnClass, type: "button", id: "dx-optin", text: "Opt in" });
      const msg = dxEl("span", { class: "note", role: "status" });
      go.addEventListener("click", () => {
        const r = dxOptIn({ licence: sel.value, adult: adult.checked });
        if (!r.ok) { msg.textContent = r.reason; return; }
        onChange?.("opted-in"); render();
      });
      row.append(sel, adult, lab, go, msg);
    }
    el.appendChild(row);
  }
  render();
  return { render };
}
