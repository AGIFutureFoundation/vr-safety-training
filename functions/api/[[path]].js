// Pages Function for every /api/* request (console EDGE): the router lives in workers/edge/router.mjs so the
// same code publishes as a standalone Worker too. WebXR/dist/_routes.json limits Function invocations to
// /api/* and /auth-config.json; everything else is a static asset.
export { onRequest } from "../../workers/edge/router.mjs";
