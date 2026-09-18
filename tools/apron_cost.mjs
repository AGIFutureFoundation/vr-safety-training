// What the site apron costs, so the headset-budget claim stays honest.
import { buildSuite } from "./lib/headless.mjs";
const suite = await buildSuite(
  ["shared/kit.js", "smartcity/js/citykit.js", "smartcity/js/apron.js"],
  "export { buildApron, THREE };", "apron");
const root = new suite.THREE.Group();
const a = suite.buildApron(root, { accent: 0x4fd1ff, accentCss: "#4fd1ff" });
let meshes = 0, lights = 0;
root.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine) meshes++; if (o.intensity !== undefined) lights++; });
console.log(JSON.stringify({ meshes, lights, roam: a.roam, spawn: a.spawn }));
