#!/usr/bin/env node
/**
 * Browser check for the YaRato UI.
 *
 * Boots the app (demo mode — no Supabase credentials needed), then for every
 * route x locale x viewport: screenshots it, asserts there is no horizontal
 * page scroll, and collects console errors and failed requests.
 *
 * Playwright is intentionally NOT a package.json dependency — adding it would
 * make CI download browsers on every `npm ci`. Run with a globally installed
 * Playwright:
 *
 *   node scripts/ui-check.mjs                 # build + start + check
 *   BASE_URL=http://localhost:3000 node scripts/ui-check.mjs   # check a running server
 *   ROUTES=/,/products node scripts/ui-check.mjs               # subset
 */
import { execSync, spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

/** Resolve playwright from the project or, failing that, from the global root. */
function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    /* fall through to the global install */
  }
  try {
    const globalRoot = execSync("npm root -g", { encoding: "utf8" }).trim();
    return require(path.join(globalRoot, "playwright"));
  } catch {
    console.error(
      "playwright not found. Install it globally: npm i -g playwright"
    );
    process.exit(2);
  }
}
const { chromium } = loadPlaywright();

const OUT_DIR = process.env.OUT_DIR ?? "/tmp/yarato-shots";
const PORT = Number(process.env.PORT ?? 3210);
const EXTERNAL_BASE = process.env.BASE_URL;

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "narrow", width: 320, height: 844 },
];

const DEFAULT_ROUTES = [
  "/",
  "/products",
  "/products?q=bot",
  "/products/uzgpt",
  "/category/telegram-bots",
  "/makers",
  "/makers/aziz",
  "/leaderboard",
  "/map",
  "/submit",
  "/login",
  "/settings",
  "/bookmarks",
  "/about",
  "/launch-guide",
  "/privacy",
  "/terms",
  "/no-such-page",
];

const ROUTES = process.env.ROUTES
  ? process.env.ROUTES.split(",").map((r) => r.trim()).filter(Boolean)
  : DEFAULT_ROUTES;

const LOCALES = (process.env.LOCALES ?? "uz,ru,en").split(",");
const localePrefix = (locale) => (locale === "uz" ? "" : `/${locale}`);

function slug(s) {
  return s.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "home";
}

async function waitForServer(url, timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", ...opts });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with ${code}`))
    );
    child.on("error", reject);
  });
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  let server;
  let baseUrl = EXTERNAL_BASE;

  if (!baseUrl) {
    console.log("› building production bundle");
    await run("npm", ["run", "build"]);
    console.log(`› starting server on :${PORT}`);
    server = spawn("npx", ["next", "start", "-p", String(PORT)], {
      stdio: "ignore",
      detached: true,
    });
    baseUrl = `http://localhost:${PORT}`;
    if (!(await waitForServer(baseUrl))) {
      throw new Error("server did not become ready");
    }
  }

  const browser = await chromium.launch();
  const findings = [];
  let checked = 0;

  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });

      for (const locale of LOCALES) {
        // Only the desktop pass sweeps every locale; the rest use the default.
        if (viewport.name !== "desktop" && locale !== LOCALES[0]) continue;

        for (const route of ROUTES) {
          const [pathname, search] = route.split("?");
          const url = `${baseUrl}${localePrefix(locale)}${pathname}${
            search ? `?${search}` : ""
          }`;

          const page = await context.newPage();
          const consoleErrors = [];
          const failedRequests = [];
          page.on("console", (msg) => {
            if (msg.type() === "error") consoleErrors.push(msg.text());
          });
          page.on("pageerror", (err) => consoleErrors.push(String(err)));
          page.on("requestfailed", (req) => {
            failedRequests.push(`${req.url()} — ${req.failure()?.errorText}`);
          });

          let status = 0;
          try {
            const res = await page.goto(url, {
              waitUntil: "networkidle",
              timeout: 45_000,
            });
            status = res?.status() ?? 0;
          } catch (err) {
            findings.push({
              url,
              viewport: viewport.name,
              kind: "navigation",
              detail: String(err),
            });
            await page.close();
            continue;
          }

          const overflow = await page.evaluate(() => {
            const el = document.documentElement;
            return {
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              // Name the widest offenders so a fix has somewhere to start.
              offenders: Array.from(document.querySelectorAll("body *"))
                .filter((n) => n.getBoundingClientRect().right > el.clientWidth + 1)
                .slice(0, 5)
                .map((n) => {
                  const cls =
                    typeof n.className === "string" ? n.className.slice(0, 80) : "";
                  return `${n.tagName.toLowerCase()}${cls ? `.${cls}` : ""}`;
                }),
            };
          });

          const name = `${viewport.name}__${locale}__${slug(route)}.png`;
          await page.screenshot({
            path: path.join(OUT_DIR, name),
            fullPage: viewport.name === "desktop" && locale === LOCALES[0],
          });

          const expected404 = pathname === "/no-such-page";
          if (!expected404 && status >= 400) {
            findings.push({ url, viewport: viewport.name, kind: "http", detail: status });
          }
          if (overflow.scrollWidth > overflow.clientWidth + 1) {
            findings.push({
              url,
              viewport: viewport.name,
              kind: "h-scroll",
              detail: `${overflow.scrollWidth} > ${overflow.clientWidth} — ${overflow.offenders.join(", ")}`,
            });
          }
          for (const detail of consoleErrors) {
            findings.push({ url, viewport: viewport.name, kind: "console", detail });
          }
          for (const detail of failedRequests) {
            findings.push({ url, viewport: viewport.name, kind: "request", detail });
          }

          checked += 1;
          await page.close();
        }
      }
      await context.close();
    }
  } finally {
    await browser.close();
    if (server?.pid) {
      try {
        process.kill(-server.pid, "SIGTERM");
      } catch {
        /* already gone */
      }
    }
  }

  await writeFile(
    path.join(OUT_DIR, "report.json"),
    JSON.stringify({ checked, findings }, null, 2)
  );

  console.log(`\n${checked} page loads checked — screenshots in ${OUT_DIR}`);
  if (findings.length === 0) {
    console.log("no findings");
    return;
  }
  console.log(`${findings.length} findings:\n`);
  for (const f of findings) {
    console.log(`  [${f.kind}] ${f.viewport} ${f.url}\n      ${f.detail}`);
  }
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
