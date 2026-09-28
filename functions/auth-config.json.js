// The same-origin auth-config.json every page reads (WebXR/shared/auth.js, guide.js, mapbox.js) is answered by the
// router, which merges the organisation's enterprise block from KV over the static file (console EDGE).
export { onRequest } from "../workers/edge/router.mjs";
