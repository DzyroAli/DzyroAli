/**
 * Clicks every button on every page and reports the ones where nothing at all
 * happens — no navigation, no network call, no DOM change, no dialog.
 * Also validates that every link points somewhere that resolves.
 */
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(path.join(execSync("npm root -g", { encoding: "utf8" }).trim(), "playwright"));

const BASE = process.env.BASE_URL ?? "http://localhost:3218";
const ROUTES = (process.env.ROUTES ??
  "/,/products,/products/uzgpt,/category/telegram-bots,/makers,/makers/aziz,/leaderboard,/map,/submit,/login,/settings,/bookmarks,/about,/launch-guide"
).split(",");

function describe(info) {
  return `<${info.tag}${info.type ? ` type=${info.type}` : ""}> ${JSON.stringify(info.name)}`;
}

const dead = [];
const badLinks = [];
let clicked = 0;
let linksChecked = 0;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const route of ROUTES) {
  const url = BASE + route;

  // --- links: a link with a resolvable href always "works"; verify the target
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);

  const hrefs = await page.evaluate(() =>
    [...document.querySelectorAll("a")].map((a) => ({
      href: a.getAttribute("href"),
      name: (a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 40),
    }))
  );
  const seen = new Set();
  for (const link of hrefs) {
    if (!link.href || link.href.startsWith("http") || link.href.startsWith("mailto:")) continue;
    if (link.href === "#" || link.href === "") {
      badLinks.push({ route, ...link, why: "empty href" });
      continue;
    }
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    linksChecked++;
    const res = await page.request.get(BASE + link.href, { failOnStatusCode: false });
    if (res.status() >= 400) badLinks.push({ route, ...link, why: `HTTP ${res.status()}` });
  }

  // --- buttons: how many are there, and what does each do
  const count = await page.locator("button").count();
  await page.close();

  for (let i = 0; i < count; i++) {
    const p = await ctx.newPage();
    let posts = 0;
    p.on("request", (r) => {
      if (r.method() === "POST") posts++;
    });
    await p.goto(url, { waitUntil: "domcontentloaded" });
    await p.waitForTimeout(500);

    const btn = p.locator("button").nth(i);
    const info = await btn.evaluate((el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type"),
      name: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
      disabled: el.disabled,
      visible: !!(el.offsetWidth || el.offsetHeight),
    })).catch(() => null);
    if (!info || !info.visible) { await p.close(); continue; }

    // A disabled control is an explicit state, not a dead button — but record
    // it so we can see whether the reason is discoverable.
    if (info.disabled) {
      dead.push({ route, ...info, verdict: "disabled" });
      await p.close();
      continue;
    }

    // Fill any required fields so the browser's own validation doesn't mask
    // what the button actually does.
    await p.evaluate(() => {
      for (const el of document.querySelectorAll("input[required], textarea[required]")) {
        if (el.value) continue;
        el.value = el.type === "email" ? "audit@example.com" : "audit";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      for (const sel of document.querySelectorAll("select[required]")) {
        if (!sel.value && sel.options.length > 1) {
          sel.selectedIndex = 1;
          sel.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
    await p.waitForTimeout(150);

    const before = {
      url: p.url(),
      html: (await p.locator("body").innerHTML()).length,
      dialogs: await p.locator("[role=dialog]").count(),
    };

    try {
      await btn.click({ timeout: 4000 });
    } catch (err) {
      dead.push({ route, ...info, verdict: "click failed: " + String(err).split("\n")[0].slice(0, 80) });
      await p.close();
      continue;
    }
    clicked++;
    await p.waitForTimeout(1400);

    const after = {
      url: p.url(),
      html: (await p.locator("body").innerHTML().catch(() => "")).length,
      dialogs: await p.locator("[role=dialog]").count().catch(() => 0),
    };

    const changed =
      after.url !== before.url ||
      after.dialogs !== before.dialogs ||
      after.html !== before.html ||
      posts > 0;

    if (!changed) dead.push({ route, ...info, verdict: "NOTHING HAPPENED" });
    await p.close();
  }
}

await browser.close();

console.log(`\nclicked ${clicked} buttons, checked ${linksChecked} links\n`);

const nothing = dead.filter((d) => d.verdict === "NOTHING HAPPENED");
const disabled = dead.filter((d) => d.verdict === "disabled");
const failed = dead.filter((d) => d.verdict.startsWith("click failed"));

console.log(`=== buttons where nothing happened (${nothing.length}) ===`);
for (const d of nothing) console.log(`  ${d.route}  ${describe(d)}`);
console.log(`\n=== buttons that could not be clicked (${failed.length}) ===`);
for (const d of failed) console.log(`  ${d.route}  ${describe(d)}\n      ${d.verdict}`);
console.log(`\n=== disabled on load (${disabled.length}) ===`);
for (const d of disabled) console.log(`  ${d.route}  ${describe(d)}`);
console.log(`\n=== links that don't resolve (${badLinks.length}) ===`);
for (const l of badLinks) console.log(`  ${l.route}  ${JSON.stringify(l.name)} -> ${l.href}  ${l.why}`);
