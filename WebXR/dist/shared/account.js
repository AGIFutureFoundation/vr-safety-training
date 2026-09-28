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

import { Auth, makeAuthEnv, cleanConfigUrl, EMPTY_AUTH_CONFIG } from "./auth.js";
import { gtIsDemo, gtEnterDemo, gtLeaveDemo, gtDemoRuns, gtCarryDemo, gtProfile, gtStorage } from "./profiles.js";
import { CT_AVATAR_STYLES, CT_AVATAR_AXES, ctAvatarLoad, ctAvatarSave, ctAvatarOption } from "./crew.js";

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
#gt-account .ct-av{display:inline-block;width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-sizing:content-box;flex:none}
#gt-dialog .ct-av-grid{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;margin:0 0 10px}
#gt-dialog .ct-av-grid label{font-size:14px;color:#d4dee8}
#gt-dialog .ct-av-grid select{min-height:36px;border-radius:8px;border:1px solid #6a8296;background:#081018;color:#fff;font:15px system-ui,sans-serif;padding:0 8px}
#gt-dialog .ct-av-preview{display:flex;gap:10px;align-items:center;margin:0 0 10px;font-size:14px;color:#d4dee8}
#gt-dialog .ct-av-preview .ct-av{display:inline-block;width:28px;height:28px;border-radius:50%;border:5px solid #fff}
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
  if (session) return { text: String(session.name || "Signed in").slice(0, 24), badge: null };
  return { text: "Sign in", badge: demo ? "Demo" : null };
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
  chip.append(ctAvatarSwatch(), text);
  if (badge) chip.append(" ", gtEl("span", { class: "gt-badge", text: badge }));
  chip.setAttribute("aria-label", Auth.session ? `Account: ${text}` : (badge ? "Sign in (demo mode on)" : "Sign in"));
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

function gtSignInView(panel) {
  const cfg = Auth.config ?? {};
  const env = gtState.env ?? {};
  // 1. Google — its own button when configured, a plain disabled line otherwise.
  if (cfg.googleClientId) {
    const mount = gtEl("div", { id: "gt-google" });
    panel.append(gtEl("p", { class: "gt-line", text: "Continue with Google" }), mount);
    if (!gtState.googleStarted) { gtState.googleStarted = true; gtRun("google", { mount }).finally(() => { gtState.googleStarted = false; }); }
  } else {
    panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "google", disabled: true },
      "Continue with Google", gtEl("small", { text: "Google sign-in is available when this deployment is configured" })));
  }
  // 2. MetaMask — Sign-In with Ethereum through window.ethereum.
  if (env.ethereum?.request) {
    panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "wallet", on: { click: () => gtRun("wallet") } },
      "Connect MetaMask", gtEl("small", { text: "Your wallet signs a Sign-In with Ethereum message. It spends nothing; your training host verifies the signature." })));
  } else {
    const line = gtEl("p", { class: "gt-line", "data-provider": "wallet" }, "Connect MetaMask: no Ethereum wallet was found in this browser. ");
    line.append(gtEl("a", { href: GT_WALLET_INSTALL, target: "_blank", rel: "noopener noreferrer", text: "Install MetaMask" }), ".");
    panel.append(line);
  }
  // 3. E-mail link, or the device passkey when no link service is configured.
  const input = gtEl("input", { id: "gt-field", type: cfg.emailEndpoint ? "email" : "text", autocomplete: cfg.emailEndpoint ? "email" : "nickname",
    placeholder: cfg.emailEndpoint ? "Your e-mail address" : "A name for this device's passkey", "aria-label": cfg.emailEndpoint ? "Your e-mail address" : "A name for this device's passkey" });
  const passkeyOk = !!env.hasPasskey && !!env.credentials;
  const mailBtn = gtEl("button", { type: "button", class: "gt-opt", "data-provider": cfg.emailEndpoint ? "email" : "passkey",
    disabled: !cfg.emailEndpoint && !passkeyOk,
    on: { click: () => gtRun(cfg.emailEndpoint ? "email" : "passkey", { email: input.value, name: input.value }) } },
  "E-mail me a link", gtEl("small", { text: cfg.emailEndpoint
    ? "One request to your training provider's link service; it mails a link that opens this page signed in."
    : (passkeyOk ? "No e-mail service is configured here, so this makes a passkey on this device instead. Nothing is sent anywhere."
      : "No e-mail service is configured and this browser has no passkeys.") }));
  panel.append(input, mailBtn);
  // 4. The free demo.
  panel.append(gtEl("button", { type: "button", class: "gt-opt", "data-provider": "demo",
    on: { click: () => { gtEnterDemo(); gtRenderChip(); gtClose(); } } },
  "Try the free demo — no sign-in", gtEl("small", { text: "Every world and station opens. Nothing is kept beyond this tab." })));
}

/** The learner's avatar as a small swatch: skin tone inside, headwear or hard-hat colour as the ring. */
function ctAvatarSwatch(style = ctAvatarLoad(gtStorage())) {
  const hex = (n) => `#${(n >>> 0).toString(16).padStart(6, "0")}`;
  const ppe = ctAvatarOption("ppe", style.ppe);
  const ring = ppe.helmet ? ctAvatarOption("hardHat", style.hardHat).hex : ctAvatarOption("hairColour", style.hairColour).hex;
  const el = gtEl("span", { class: "ct-av", "aria-hidden": "true" });
  el.style.background = hex(ctAvatarOption("skin", style.skin).hex);
  el.style.borderColor = hex(ring);
  return el;
}

const CT_AXIS_LABELS = { body: "Body", skin: "Skin tone", hair: "Hair or head covering", hairColour: "Hair or covering colour", ppe: "Trade PPE", hardHat: "Hard hat colour" };

/** The avatar picker: one select per axis, stored per profile (shared/profiles.js) on Save. */
function ctAvatarView(panel) {
  const style = ctAvatarLoad(gtStorage());
  panel.append(gtEl("p", { text: "Choose how your own figure looks in Bay World and the Deep. Every option works with every trade; it is kept with your profile on this device." }));
  const preview = gtEl("div", { class: "ct-av-preview", id: "ct-av-preview" });
  const draw = () => { preview.textContent = ""; preview.append(ctAvatarSwatch(style), `${ctAvatarOption("body", style.body).label} · ${ctAvatarOption("hair", style.hair).label} · ${ctAvatarOption("ppe", style.ppe).label}`); };
  const grid = gtEl("div", { class: "ct-av-grid" });
  for (const axis of CT_AVATAR_AXES) {
    const id = `ct-av-${axis}`;
    const sel = gtEl("select", { id, "data-axis": axis, on: { change: (e) => { style[axis] = e.target.value; draw(); } } });
    for (const o of CT_AVATAR_STYLES[axis]) sel.append(gtEl("option", { value: o.id, selected: o.id === style[axis], text: o.label }));
    grid.append(gtEl("label", { for: id, text: CT_AXIS_LABELS[axis] ?? axis }), sel);
  }
  draw();
  panel.append(preview, grid);
  panel.append(gtEl("div", { class: "gt-row" },
    gtEl("button", { type: "button", id: "ct-av-save", on: { click: () => { ctAvatarSave(style, gtStorage()); gtRenderChip(); gtMsg("Avatar saved to this profile."); } } }, "Save avatar"),
    gtEl("button", { type: "button", id: "ct-av-back", on: { click: () => gtRender() } }, "Back")));
}

function gtRender(view = null) {
  const panel = document.querySelector("#gt-dialog .gt-panel");
  if (!panel) return;
  panel.textContent = "";
  const v = view ?? (Auth.session ? "account" : "signin");
  panel.append(gtEl("h2", { id: "gt-title", text: v === "avatar" ? "Your avatar" : v === "signin" ? "Sign in" : "Your account" }));
  if (v === "avatar") ctAvatarView(panel);
  else if (v === "signin") {
    panel.append(gtEl("p", { text: gtIsDemo()
      ? "Demo mode is on: your runs live in this tab only. Sign in to keep them."
      : "Signing in keeps your progress private to you on this device. These pages are static files: your training host, not this page, verifies the credential." }));
    gtSignInView(panel);
  } else if (v === "carry") {
    panel.append(gtEl("p", { text: `Signed in as ${Auth.session?.name ?? "you"}. This tab holds ${gtDemoRuns()} demo run(s).` }));
    panel.append(gtEl("div", { class: "gt-row" },
      gtEl("button", { type: "button", id: "gt-carry", on: { click: () => { gtCarryDemo(); gtRender("account"); gtMsg("Your demo runs are now in your account."); } } }, "Keep my demo runs"),
      gtEl("button", { type: "button", id: "gt-nocarry", on: { click: () => { gtLeaveDemo({ discard: true }); gtRender("account"); } } }, "Not now")));
  } else {
    panel.append(gtEl("p", { text: Auth.describe() ?? "" }));
    panel.append(gtEl("p", { text: `Progress shown: ${gtProfile().kind === "account" ? "yours only" : "this device"}. Another person signing in here sees their own.` }));
    panel.append(gtEl("div", { class: "gt-row" },
      gtEl("button", { type: "button", id: "gt-signout", on: { click: () => { Auth.signOut(); gtRenderChip(); gtRender("signin"); gtMsg("Signed out. Your progress is kept, hidden until you sign in again."); } } }, "Sign out"),
      gtEl("button", { type: "button", id: "gt-signout-clear", on: { click: () => {
        if (typeof confirm === "function" && !confirm("Sign out and delete your training records on this device?")) return;
        Auth.signOut({ clearRecords: true }); gtRenderChip(); gtRender("signin"); gtMsg("Signed out and your records on this device were deleted.");
      } } }, "Sign out and clear my records")));
  }
  // The avatar picker sits after the sign-in options, so Google stays the first choice.
  if (v !== "avatar") panel.append(gtEl("button", { type: "button", class: "gt-opt", id: "ct-av-open", on: { click: () => gtRender("avatar") } },
    ctAvatarSwatch(), " Your avatar", gtEl("small", { text: "Body, skin tone, hair or head covering and trade PPE for your own figure in the worlds." })));
  panel.append(gtEl("p", { class: "gt-msg", id: "gt-msg", role: "status" }));
  panel.append(gtEl("div", { class: "gt-row" }, gtEl("button", { type: "button", id: "gt-close", on: { click: () => gtClose() } }, "Close")));
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
    addEventListener("ct:avatar", () => gtRenderChip());
  }
  gtRenderChip();
  return chip;
}
