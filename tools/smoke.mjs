import { chromium } from "playwright";
import fs from "fs";
const SP = "/tmp/claude-0/-home-user-vr-safety-training/a03145a7-edb6-5a38-ad6a-02d8825a11f7/scratchpad";
const THREE_LOCAL = fs.readFileSync(`${SP}/node_modules/three/build/three.module.min.js`, "utf8");
const REACT = fs.readFileSync(`${SP}/voicecheck/react.production.min.js`, "utf8");
const REACTDOM = fs.readFileSync(`${SP}/voicecheck/react-dom.production.min.js`, "utf8");

const PAGES = [
  ["root", "/index.html"],
  ["portal", "/portal/index.html"],
  ["verify", "/verify/index.html"],
  ["instructor", "/instructor/index.html"],
  ["holodeck", "/holodeck/index.html"],
  ["trades-hub", "/trades/index.html"],
  ["smartcity-hub", "/smartcity/index.html"],
  ["trades-dist", "/trades/dist/trade-skills-simulator.html"],
  ["holodeck-dist", "/holodeck/dist/holodeck.html"],
  ["instructor-dist", "/instructor/dist/instructor-console.html"],
  ["smartcity-dist", "/smartcity/dist/smartcity-x.html"],
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-gl=swiftshader","--enable-unsafe-swiftshader","--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await ctx.route("**cdnjs.cloudflare.com/ajax/libs/three.js/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: THREE_LOCAL }));
await ctx.route("**cdnjs.cloudflare.com/ajax/libs/react/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: REACT }));
await ctx.route("**cdnjs.cloudflare.com/ajax/libs/react-dom/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: REACTDOM }));
await ctx.route("**fonts.googleapis.com/**", (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
await ctx.route("**fonts.gstatic.com/**", (r) => r.fulfill({ status: 200, contentType: "font/woff2", body: "" }));

const report = [];
for (const [name, path] of PAGES) {
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e.message).slice(0, 200)));
  page.on("requestfailed", (r) => {
    const u = r.url();
    if (/fonts\.|cdnjs/.test(u)) return;
    errors.push(`REQFAIL ${u.replace("http://127.0.0.1:8970", "")} ${r.failure()?.errorText ?? ""}`);
  });
  let status = "?";
  try {
    const resp = await page.goto(`http://127.0.0.1:8970${path}`, { waitUntil: "load", timeout: 40000 });
    status = resp?.status();
    await page.waitForTimeout(2600);
  } catch (e) { errors.push("NAV: " + e.message.slice(0, 120)); }
  const title = await page.title().catch(() => "?");
  report.push({ name, status, title: title.slice(0, 40), errors });
  await page.close();
}
for (const r of report) {
  console.log(`${r.errors.length ? "FAIL" : " ok "} ${r.name.padEnd(17)} ${String(r.status).padEnd(4)} ${r.title}`);
  for (const e of r.errors.slice(0, 5)) console.log(`        ${e}`);
}
console.log(`\n${report.filter((r) => r.errors.length).length} of ${report.length} pages have errors.`);
await browser.close();
