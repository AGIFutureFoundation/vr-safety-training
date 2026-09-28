// The account chip and the one sign-in dialog every page shares (console
// GATE, tools/briefs/signin-brief.md, docs/sign-in.md).
//
// controls.js mounts the chip beside the Home and help chips, so every page
// that carries the shared control grammar — the homepage, every bundle, every
// training-track page — gets the same entry. The dialog lists, in this order:
//
//   Continue with Google     Google's own button, only when `googleClientId`
//                            is configured; otherwise a disabled line saying so.
//   Connect MetaMask         Sign-In with Ethereum through `window.ethereum`;
//                            with no wallet, one plain line and a link to
//                            install one. The name is text only, no logo.
//   E-mail me a link         the configured `emailEndpoint`, else a passkey on
//                            this device (auth.js's own fallback).
//   Try the free demo        no sign-in; progress lives in this tab only
//                            (profiles.js), and the chip wears a Demo badge.
//
// Everything that can reach the network is auth.js's, under its one rule:
// nothing is ever sent to an endpoint that was not configured. This file
// makes no request of its own. Every top-level name starts with `gt`.

import { Auth, makeAuthEnv, cleanConfigUrl, EMPTY_AUTH_CONFIG, enterpriseAllows } from "./auth.js";
import { trT } from "./i18n.js";
import { gtIsDemo, gtEnterDemo, gtLeaveDemo, gtDemoRuns, gtCarryDemo, gtProfile } from "./profiles.js";
// The treasure ledger rides with the chip: the dialog links the Treasure Map and every page arms its finders.
import { tzArmPage, tzMapHref, tzFoundIds } from "./treasures.js";
import { TZ_TREASURES } from "./treasures-data.js";
// The organisation layer (docs/enterprise.md): a learner joins a cohort from here too.
import { enJoin, enMyCohorts } from "./org.js";

const gtHasDom = typeof document !== "undefined";
const GT_WALLET_INSTALL = "https://metamask.io/download/";

const gtCss = `
#gt-account{display:inline-flex;align-items:center;gap:6px;min-height:32px;border-radius:16px;border:1px solid rgba(255,255,255,.35);background:rgba(10,20,30,.78);color:#fff;font:600 14px/1 system-ui,sans-serif;cursor:pointer;padding:0 12px;max-width:44vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#gt-account:hover{background:rgba(79,209,255,.3)}
#gt-account .gt-badge{background:#ffd54a;color:#1a1400;border-radius:8px;padding:2px 6px;font-size:12px;font-weight:700}
#gt-dialog{position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:12px}
#gt-dialog[hidden]{display:none}
#gt-dialog .gt-panel{background:#0e1822;color:#f2f6fa;border:1px solid #40596e;border-radius:12px;max-width:440px;width:100%;max-height:calc(100vh - 24px);overflow:auto;padding:16px 18px;font:15px/1.45 system-ui,sans-serif}
#gt-dialog h2{margin:0 0 6px;font-size:20px}
#gt-dialog p{margin:4px 0 10px;color:#d4dee8}
#gt-dialog .gt-opt{display:block;width:100%;text-align:left;min-height:44px;margin:0 0 10px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 15px system-ui,sans-serif;cursor:pointer;padding:10px 12px}
#gt-dialog .gt-opt[disabled]{opacity:.6;cursor:not-allowed}
#gt-dialog .gt-opt small{display:block;font-weight:400;font-size:13px;color:#bcd0e0;margin-top:3px}
#gt-dialog .gt-line{font-size:14px;color:#d4dee8;margin:0 0 10px}
#gt-dialog .gt-line a{color:#7fd4ff}
#gt-dialog input{width:100%;box-sizing:border-box;min-height:40px;margin:0 0 6px;padding:8px 10px;border-radius:8px;border:1px solid #6a8296;background:#081018;color:#fff;font:16px system-ui,sans-serif}
#gt-dialog .gt-msg{color:#ffcf8a;font-size:14px;min-height:1em}
#gt-dialog .gt-row{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
#gt-dialog .gt-row button{min-height:40px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;padding:0 12px}
#gt-dialog label.gt-check{display:flex;gap:8px;align-items:center;font-size:14px;margin:0 0 10px}
#gt-dialog label.gt-check input{width:auto;min-height:0;margin:0}
#gt-dialog .gt-join{border-top:1px solid #2a3c4e;padding-top:10px;margin-top:6px}
#gt-dialog .gt-join[hidden]{display:none}
#gt-dialog .gt-join button.gt-small{min-height:40px;border-radius:8px;border:1px solid #6a8296;background:#1b2a38;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer;padding:0 12px}
#gt-dialog .gt-cohort{font-size:14px;color:#d4dee8;margin:0 0 6px}
#gt-dialog .gt-cohort b{color:#fff}
`;

const gtState = { mounted: false, env: null, configUrl: null, ready: null, returnTo: null, googleStarted: false };

/**
 * The deployment's auth-config.json sits beside the homepage, so its path is
 * the Home chip's own href with the file name swapped (../index.html →
 * ../auth-config.json). Relative, same-origin, and cleaned by auth.js.
 */
export function gtConfigUrlFrom(homeHref) {
  const h = String(homeHref ?? "").split(/[?#]/)[0];
  if (!h) return "auth-config.json";
  const guess = h.endsWith("/") ? `${h}auth-config.json` : h.replace(/[^/]*$/, "auth-config.json");
  return cleanConfigUrl(guess.replace(/^\.\//, "")) ?? "auth-config.json";
}

/** What the chip says: the signed-in name, or Sign in (with a Demo badge in the demo). */
export function gtChipLabel(session = Auth.session, demo = gtIsDemo()) {
  if (session) return { text: String(session.name || trT("acct.signedIn")).slice(0, 24), badge: null };
  return { text: trT("acct.signin"), badge: demo ? trT("acct.demo") : null };
}

function gtEl(tag, props = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "text") el.textContent = v;
    else if (k === "on") for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
    else if (v === true) el.setAttribute(k, "");
    else if (v != null && v !== false) el.setAttribute(k, String(v));
  }
  for (const kid of kids) if (kid != null) el.append(kid);
  return el;
}

function gtRenderChip() {
  const chip = document.getElementById("gt-account");
  if (!chip) return;
  const { text, badge } = gtChipLabel();
  chip.textContent = "";
  chip.append(text);
  if (badge) chip.append(" ", gtEl("span", { class: "gt-badge", text: badge }));
  chip.setAttribute("aria-label", Auth.session ? trT("acct.chipAria", { name: text }) : (badge ? trT("acct.signinDemoAria") : trT("acct.signin")));
}

function gtMsg(text) {
  const m = document.getElementById("gt-msg");
  if (m) m.textContent = text || "";
}

async function gtRun(providerId, opts = {}) {
  gtMsg("");
  const hadDemo = gtIsDemo() && gtDemoRuns() > 0;
  const res = await Auth.signIn(providerId, { ...opts, env: gtState.env ?? undefined });
  if (res?.kind === "signed-in") {
    if (gtIsDemo()) gtLeaveDemo();
    gtRenderChip();
    gtRender(hadDemo ? "carry" : "account");
    try { globalThis.dispatchEvent?.(new Event("gt:profile")); } catch (_) { /* ignore */ }
    return res;
  }
  gtMsg(res?.reason || res?.note || "");
  return res;
}

/** The privacy page beside the homepage (WebXR/privacy.html): the Home chip's folder, file name swapped. */
export function gtPrivacyHref(homeHref = null) {
  const h = String(homeHref ?? document.querySelector("#ctl-nav .home-chip, .home-chip")?.getAttribute("href") ?? "").split(/[?#]/)[0];
  if (!h || h.startsWith("#")) return "privacy.html";
  return h.endsWith("/") ? `${h}privacy.html` : h.replace(/[^/]*$/, "privacy.html");
}

function gtSignInView(panel) {
  const cfg = Auth.config ?? {};
  const env = gtState.env ?? {};
  // The organisation layer (docs/enterprise.md): a deployment may switch methods off.
  const allow = (m) => enterpriseAllows(cfg, m);
  if (cfg.enterprise?.organisation) panel.append(gtEl("p", { class: "gt-line", id: "gt-org", text: `Training for ${cfg.enterprise.organisation}.` }));
  // 1. Google — its own button when configured, a plain disabled line otherwise.
  if (!allow("google")) { /* switched off by the deployment */ } else if (cfg.googleClientId) {
    const mount = gtEl("div", { id: "gt-google" });
    panel.append(gtEl("p", { class: "gt-line", text: trT("acct.google", null, "Continue with Google") }), mount);
    if (!gtState.googleStarted) { gtState.googleStarted = true; gtRun("google", { mount }).finally(() => { gtState.googleStarted = false; }); }
  } else {
    panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "google", disabled: true },
      trT("acct.google"), gtEl("small", { text: trT("acct.googleOff") })));
  }
  // 2. MetaMask — Sign-In with Ethereum through window.ethereum.
  if (!allow("wallet")) { /* switched off */ } else if (env.ethereum?.request) {
    panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "wallet", on: { click: () => gtRun("wallet") } },
      trT("acct.wallet", null, "Connect MetaMask"), gtEl("small", { text: trT("acct.walletNote") })));
  } else {
    const line = gtEl("p", { class: "gt-line", "data-provider": "wallet" }, `${trT("acct.noWallet")} `);
    line.append(gtEl("a", { href: GT_WALLET_INSTALL, target: "_blank", rel: "noopener noreferrer", text: trT("acct.installWallet") }), ".");
    panel.append(line);
  }
  // 3. E-mail link, or the device passkey when no link service is configured.
  const input = gtEl("input", { id: "gt-field", type: cfg.emailEndpoint ? "email" : "text", autocomplete: cfg.emailEndpoint ? "email" : "nickname",
    placeholder: trT(cfg.emailEndpoint ? "acct.emailPh" : "acct.passkeyPh"), "aria-label": trT(cfg.emailEndpoint ? "acct.emailPh" : "acct.passkeyPh") });
  const passkeyOk = !!env.hasPasskey && !!env.credentials;
  const mailBtn = gtEl("button", { type: "button", class: "gt-opt", "data-provider": cfg.emailEndpoint ? "email" : "passkey",
    disabled: !cfg.emailEndpoint && !passkeyOk,
    on: { click: () => gtRun(cfg.emailEndpoint ? "email" : "passkey", { email: input.value, name: input.value }) } },
  trT("acct.email", null, "E-mail me a link"), gtEl("small", { text: trT(cfg.emailEndpoint ? "acct.emailNote" : (passkeyOk ? "acct.passkeyNote" : "acct.noPasskey")) }));
  if (allow(cfg.emailEndpoint ? "email" : "passkey")) panel.append(input, mailBtn);
  // 4. The free demo.
  if (allow("demo")) panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "demo",
    on: { click: () => { gtEnterDemo(); gtRenderChip(); gtClose(); } } },
  trT("acct.demoBtn", null, "Try the free demo — no sign-in"), gtEl("small", { text: trT("acct.demoNote") })));
}

/**
 * The learner's side of the organisation layer (docs/enterprise.md): the
 * cohorts this device has joined, each with its programme and how many of its
 * stations this device's records pass, and "Join a cohort" — an invite code,
 * a display name and the progress-sharing consent, off until ticked. The join
 * is written to this device's store and audited here; nothing is sent anywhere.
 */
function gtCohortView(panel) {
  let mine = [];
  try { mine = enMyCohorts(); } catch (_) { mine = []; }
  const wrap = gtEl("div", { class: "gt-join", id: "gt-cohorts" });
  for (const c of mine) {
    wrap.append(gtEl("p", { class: "gt-cohort" }, "In cohort ", gtEl("b", { text: c.cohort.name }),
      `${c.org ? ` (${c.org.name})` : ""} as ${c.member.role} · ${c.programme.name}: ${c.passed} of ${c.total} stations passed here · ${c.member.sharing ? "sharing progress with the coordinator" : "progress not shared"}.`));
  }
  const form = gtEl("div", { id: "gt-join-form", hidden: true });
  const code = gtEl("input", { id: "gt-join-code", type: "text", autocomplete: "off", maxlength: "9", placeholder: "Invite code (XXXX-XXXX)", "aria-label": "Invite code" });
  const name = gtEl("input", { id: "gt-join-name", type: "text", autocomplete: "nickname", maxlength: "40", placeholder: "Your display name (initials are fine)", "aria-label": "Your display name" });
  const consent = gtEl("input", { id: "gt-join-consent", type: "checkbox" });
  const check = gtEl("label", { class: "gt-check" }, consent, "Share my progress in this programme with the cohort's coordinator (off until you tick it)");
  const join = gtEl("button", { type: "button", class: "gt-small", id: "gt-join", on: { click: () => {
    const r = enJoin(code.value, { name: name.value, role: "learner", local: true, consent: consent.checked });
    if (!r.ok) { gtMsg(r.reason); return; }
    gtRender(); gtMsg(`${r.member.name} joined ${r.cohort.name}. Your progress stays on this device${r.member.consent.progress ? " and is shared with the coordinator's view here" : ""}.`);
    try { globalThis.dispatchEvent?.(new Event("gt:profile")); } catch (_) { /* ignore */ }
  } } }, "Join");
  form.append(code, name, check, gtEl("div", { class: "gt-row" }, join));
  const open = gtEl("button", { type: "button", class: "gt-small", id: "gt-join-open", "aria-expanded": "false", "aria-controls": "gt-join-form",
    on: { click: () => { form.hidden = !form.hidden; open.setAttribute("aria-expanded", String(!form.hidden)); if (!form.hidden) code.focus(); } } }, mine.length ? "Join another cohort" : "Join a cohort");
  wrap.append(gtEl("p", { class: "gt-line" }, "Training with an organisation? Its coordinator gives you an invite code. ", open), form);
  panel.append(wrap);
}

function gtRender(view = null) {
  const panel = document.querySelector("#gt-dialog .gt-panel");
  if (!panel) return;
  panel.textContent = "";
  const v = view ?? (Auth.session ? "account" : "signin");
  panel.append(gtEl("h2", { id: "gt-title", text: v === "signin" ? trT("acct.signin") : trT("acct.account") }));
  if (v === "signin") {
    panel.append(gtEl("p", { text: gtIsDemo()
      ? trT("acct.introDemo")
      : trT("acct.intro") }));
    gtSignInView(panel);
  } else if (v === "carry") {
    panel.append(gtEl("p", { text: trT("acct.carry", { name: Auth.session?.name ?? "you", n: gtDemoRuns() }) }));
    panel.append(gtEl("div", { class: "gt-row" },
      gtEl("button", { type: "button", id: "gt-carry", on: { click: () => { gtCarryDemo(); gtRender("account"); gtMsg(trT("acct.carried")); } } }, trT("acct.keep")),
      gtEl("button", { type: "button", id: "gt-nocarry", on: { click: () => { gtLeaveDemo({ discard: true }); gtRender("account"); } } }, trT("acct.notNow"))));
  } else {
    panel.append(gtEl("p", { text: Auth.describe() ?? "" }));
    panel.append(gtEl("p", { text: trT("acct.progress", { whose: trT(gtProfile().kind === "account" ? "acct.yours" : "acct.device") }) }));
    panel.append(gtEl("div", { class: "gt-row" },
      gtEl("button", { type: "button", id: "gt-signout", on: { click: () => { Auth.signOut(); gtRenderChip(); gtRender("signin"); gtMsg(trT("acct.signedOut")); } } }, trT("acct.signout")),
      gtEl("button", { type: "button", id: "gt-signout-clear", on: { click: () => {
        if (typeof confirm === "function" && !confirm(trT("acct.confirmClear"))) return;
        Auth.signOut({ clearRecords: true }); gtRenderChip(); gtRender("signin"); gtMsg(trT("acct.cleared"));
      } } }, trT("acct.signoutClear"))));
  }
  // The Treasure Map (docs/treasures.md): counts only, never where an unfound one is.
  panel.append(gtEl("p", { class: "gt-line", id: "gt-treasures" }, `Treasures found: ${tzFoundIds().length} of ${TZ_TREASURES.length}. `,
    gtEl("a", { href: tzMapHref(), id: "gt-treasure-map", text: "Open the Treasure Map" })));
  // Cohorts (docs/enterprise.md): the ones joined on this device, and the join form.
  if (v !== "carry") gtCohortView(panel);
  // What is stored where (WebXR/privacy.html, docs/enterprise.md).
  panel.append(gtEl("p", { class: "gt-line", id: "gt-privacy-line" }, "Nothing about you leaves this device without your say. ",
    gtEl("a", { href: gtPrivacyHref(), id: "gt-privacy", text: "What is stored where" }), "."));
  panel.append(gtEl("p", { class: "gt-msg", id: "gt-msg", role: "status" }));
  panel.append(gtEl("div", { class: "gt-row" }, gtEl("button", { type: "button", id: "gt-close", on: { click: () => gtClose() } }, trT("common.close"))));
}

function gtClose() {
  const d = document.getElementById("gt-dialog");
  if (!d || d.hidden) return;
  d.hidden = true;
  document.getElementById("gt-account")?.setAttribute("aria-expanded", "false");
  const back = gtState.returnTo; gtState.returnTo = null;
  if (back && document.contains(back)) back.focus?.();
}

/** Open the dialog (from the chip, a page's own Sign in button, or a demo notice). */
export async function gtOpenAccount() {
  if (!gtHasDom) return false;
  const d = document.getElementById("gt-dialog");
  if (!d) return false;
  await gtState.ready;
  // Re-read the browser each time: a wallet extension may inject itself late.
  gtState.env = makeAuthEnv({ configUrl: gtState.configUrl });
  gtState.returnTo = document.activeElement && document.activeElement !== document.body ? document.activeElement : document.getElementById("gt-account");
  gtRender();
  d.hidden = false;
  document.getElementById("gt-account")?.setAttribute("aria-expanded", "true");
  d.querySelector("button:not([disabled]),input")?.focus();
  return true;
}

/** Mount the chip into `nav` (controls.js's #ctl-nav) and the dialog into the page. */
export function gtMountAccount(nav, { configUrl = null } = {}) {
  if (!gtHasDom || !nav) return null;
  if (!document.getElementById("gt-style")) {
    const s = document.createElement("style"); s.id = "gt-style"; s.textContent = gtCss; document.head.appendChild(s);
  }
  let chip = document.getElementById("gt-account");
  if (!chip) {
    chip = gtEl("button", { type: "button", id: "gt-account", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "gt-dialog",
      on: { click: () => gtOpenAccount() } });
    nav.appendChild(chip);
  }
  if (!document.getElementById("gt-dialog")) {
    const d = gtEl("div", { id: "gt-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "gt-title", hidden: true,
      on: { pointerdown: (e) => { if (e.target === d) gtClose(); }, keydown: (e) => { if (e.key === "Escape") { e.stopPropagation(); gtClose(); } } } },
    gtEl("div", { class: "gt-panel" }));
    document.body.appendChild(d);
  }
  if (!gtState.mounted) {
    gtState.mounted = true;
    const url = configUrl ?? gtConfigUrlFrom(document.querySelector("#ctl-nav .home-chip, .home-chip")?.getAttribute("href"));
    gtState.configUrl = url;
    gtState.env = makeAuthEnv({ configUrl: url });
    // A page that already read its configuration (SmartCiti.X) is not asked twice.
    gtState.ready = (Auth.config !== EMPTY_AUTH_CONFIG ? Promise.resolve(Auth.config) : Auth.loadConfig(gtState.env))
      .then(() => { if (!Auth.session) Auth.load(); })
      .catch(() => null)
      .finally(() => gtRenderChip());
    addEventListener("gt:profile", () => gtRenderChip());
    addEventListener("tr:change", () => { gtRenderChip(); const d = document.getElementById("gt-dialog"); if (d && !d.hidden) gtRender(); });
  }
  gtRenderChip();
  try { tzArmPage(); } catch (_) { /* a page with no treasures */ }
  return chip;
}
