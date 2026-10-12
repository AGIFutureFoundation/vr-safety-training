/**
 * Wallet connection for a static page — the browser's own injected wallet
 * only. This module never sees, stores or requests a private key or a seed
 * phrase: everything it does is a request to an already-unlocked extension
 * (EIP-1193's `window.ethereum`, or one announced over EIP-6963), which
 * prompts the person and returns only what they approve. Nothing here
 * reaches a network beyond the wallet's own extension, and nothing in this
 * module posts anything anywhere — that is shared/share-engagement.js's job,
 * and its own rule is that nothing is transmitted before an explicit press
 * of Share.
 *
 * EIP-6963 (multi-provider discovery): a page can no longer assume
 * `window.ethereum` is the only wallet, or even the one the person meant,
 * once more than one extension is installed — the last one to load simply
 * overwrites the global. This module dispatches "eip6963:requestProvider"
 * and collects every "eip6963:announceProvider" reply within a short
 * window, so a person can pick the wallet they actually meant. A browser
 * with only a legacy `window.ethereum` and no EIP-6963 announcements still
 * gets one entry for it, so the no-wallet and one-wallet cases both work
 * without a person needing to know which standard their extension speaks.
 *
 * `shortAddress` and address cleaning are the exact functions shared/auth.js
 * already carries for its own "Sign in with Ethereum" option — reused here
 * rather than re-implemented, so the two never disagree on what a valid
 * address or a HUD-sized label looks like.
 */

import { cleanAddress, shortAddress } from "./auth.js";

export { cleanAddress, shortAddress };

const DISCOVERY_WINDOW_MS = 150;

/**
 * Everything this module touches in the browser, in one injectable object —
 * the same shape auth.js's makeAuthEnv uses — so a checker can drive every
 * path headlessly and a reader can see the whole outside surface at a
 * glance.
 */
export function makeWalletEnv(overrides = {}) {
  const g = globalThis;
  const at = (fn, fallback) => { try { return fn() ?? fallback; } catch (_) { return fallback; } };
  const w = at(() => g.window, g);
  return {
    ethereum: at(() => w?.ethereum ?? g.ethereum, null),
    addEventListener: at(() => w?.addEventListener?.bind(w), null),
    removeEventListener: at(() => w?.removeEventListener?.bind(w), null),
    dispatchEvent: at(() => w?.dispatchEvent?.bind(w), null),
    CustomEvent: at(() => g.CustomEvent, null),
    now: () => new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Collect every EIP-6963 provider announced within `windowMs`, plus the
 * legacy `window.ethereum` as a fallback entry when nothing announces (an
 * older wallet, or a browser that has not adopted EIP-6963 yet). Resolves to
 * `[{ uuid, name, icon, rdns, provider }]`, in announcement order; a browser
 * with no wallet at all and no announcements resolves to `[]`.
 */
export function discoverProviders(env = makeWalletEnv(), { windowMs = DISCOVERY_WINDOW_MS } = {}) {
  return new Promise((resolve) => {
    if (!env.addEventListener || !env.dispatchEvent || !env.CustomEvent) {
      resolve(env.ethereum ? [{ uuid: "legacy", name: "Browser wallet", icon: null, rdns: null, provider: env.ethereum }] : []);
      return;
    }
    const found = new Map();
    const onAnnounce = (e) => {
      const detail = e?.detail;
      if (!detail?.provider || !detail?.info?.uuid) return;
      found.set(detail.info.uuid, { uuid: detail.info.uuid, name: detail.info.name ?? "Wallet", icon: detail.info.icon ?? null, rdns: detail.info.rdns ?? null, provider: detail.provider });
    };
    env.addEventListener("eip6963:announceProvider", onAnnounce);
    try { env.dispatchEvent(new env.CustomEvent("eip6963:requestProvider")); } catch (_) { /* a browser that does not support this still resolves below */ }
    setTimeout(() => {
      env.removeEventListener?.("eip6963:announceProvider", onAnnounce);
      if (!found.size && env.ethereum) found.set("legacy", { uuid: "legacy", name: "Browser wallet", icon: null, rdns: null, provider: env.ethereum });
      resolve([...found.values()]);
    }, windowMs);
  });
}

function walletRefuse(reason) { return { connected: false, reason }; }

/**
 * The one wallet connection this page holds. `connect()` is the only call
 * that ever reaches the extension for accounts, and it is always in
 * response to a person's own click — nothing here auto-connects on load.
 */
export const Wallet = {
  provider: null,
  address: null,
  chainId: null,
  providerName: null,
  providers: [],
  env: null,
  _unsub: null,
  /** Set by a caller that wants a live update on account/chain change. */
  onChange: null,

  get connected() { return !!this.address; },

  /** Find what wallets this browser actually offers. Touches no account. */
  async discover(env = this.env ?? makeWalletEnv()) {
    this.env = env;
    this.providers = await discoverProviders(env);
    return this.providers;
  },

  /**
   * Connect the chosen provider (by its EIP-6963 uuid) or the first one
   * discovered. This is `eth_requestAccounts` — a wallet only answers it
   * after the person approves the connection in their own extension; no
   * private key or seed phrase ever reaches this page.
   */
  async connect({ uuid = null, env = this.env ?? makeWalletEnv() } = {}) {
    this.env = env;
    if (!this.providers.length) await this.discover(env);
    const entry = uuid ? this.providers.find((p) => p.uuid === uuid) : this.providers[0];
    const eth = entry?.provider ?? env.ethereum;
    if (!eth?.request) return walletRefuse("No wallet extension was found in this browser.");
    let accounts;
    try { accounts = await eth.request({ method: "eth_requestAccounts" }); }
    catch (err) { return walletRefuse(err?.code === 4001 ? "The wallet declined the connection." : "The wallet could not be reached."); }
    const address = cleanAddress(Array.isArray(accounts) ? accounts[0] : null);
    if (!address) return walletRefuse("The wallet returned no account.");
    let chainId = null;
    try { chainId = await eth.request({ method: "eth_chainId" }); } catch (_) { /* optional — chain-change handling still works without it */ }
    this.provider = eth; this.address = address; this.chainId = chainId ?? null; this.providerName = entry?.name ?? "Browser wallet";
    this._listen(eth);
    return this.describe();
  },

  /** Chain-change and account-change handling: the HUD stays in sync, and an
   * account switch or a disconnect from the wallet's own UI is reflected
   * here rather than left stale. */
  _listen(eth) {
    this._unsub?.();
    const onAccounts = (accounts) => {
      const a = cleanAddress(Array.isArray(accounts) ? accounts[0] : null);
      this.address = a;
      if (!a) { this.provider = null; this.chainId = null; this.providerName = null; }
      this.onChange?.(this.describe());
    };
    const onChain = (chainId) => { this.chainId = chainId; this.onChange?.(this.describe()); };
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    this._unsub = () => { eth.removeListener?.("accountsChanged", onAccounts); eth.removeListener?.("chainChanged", onChain); };
  },

  /** Forget the connection on this page. This never revokes the extension's
   * own permission — that stays with the wallet, as it should. */
  disconnect() {
    this._unsub?.();
    this._unsub = null; this.provider = null; this.address = null; this.chainId = null; this.providerName = null;
    this.onChange?.(this.describe());
    return true;
  },

  /**
   * Sign a plain-text statement with `personal_sign` (EIP-191). The wallet
   * shows the exact text to the person before it signs; this module never
   * alters, hides or pre-fills it, and never sees or asks for anything
   * beyond the signature the wallet returns. Never throws.
   */
  async signConsent(text) {
    if (!this.provider || !this.address) return { signed: false, reason: "No wallet is connected." };
    if (typeof text !== "string" || !text) return { signed: false, reason: "Nothing to sign." };
    let signature;
    try { signature = await this.provider.request({ method: "personal_sign", params: [text, this.address] }); }
    catch (err) { return { signed: false, reason: err?.code === 4001 ? "The wallet declined to sign." : "The wallet could not sign." }; }
    if (typeof signature !== "string" || !signature) return { signed: false, reason: "The wallet returned no signature." };
    return { signed: true, signature, address: this.address, chainId: this.chainId, message: text };
  },

  /** Plain data for a HUD: null when nothing is connected. */
  describe() {
    if (!this.address) return null;
    return { connected: true, address: this.address, shortAddress: shortAddress(this.address), chainId: this.chainId, providerName: this.providerName };
  },
};
