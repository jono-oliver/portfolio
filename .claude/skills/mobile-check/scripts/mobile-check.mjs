#!/usr/bin/env node
// Responsive + motion smoke test for the portfolio, driven by Playwright.
//
// For each page × width it checks:
//   - horizontal overflow (the page can scroll sideways) and which elements cause it
//   - scroll reveals that never become visible after scrolling the whole page
// Then:
//   - reduced motion: every [data-reveal] must be visible without scrolling
//   - view transitions (listing → detail at 375px): layout movement, layout
//     shift (CLS) and reveals that animate out and back in after the transition
//
// Usage (from the repo root):
//   node mobile-check.mjs [--url http://localhost:4321] [--pages /,/blog]
//                         [--widths 375,768,1280] [--no-screenshots]
// Without --url it reuses a dev server on :4321, or starts one on :4399.
// Writes .checks/mobile/report.json and <page>@<width>.png screenshots.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, webkit } from "@playwright/test";

const root = process.cwd();
const outDir = resolve(root, ".checks/mobile");
const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};
const widths = (arg("widths") ?? "375,768,1280").split(",").map(Number);
const screenshots = !argv.includes("--no-screenshots");
const MOVE_TOLERANCE_PX = 2;
const CLS_FAIL = 0.1;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isUp = async (url) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
};

// --- Server --------------------------------------------------------------------
let server;
let base = arg("url")?.replace(/\/$/, "");
if (!base) {
  if (await isUp("http://localhost:4321/")) base = "http://localhost:4321";
  else {
    base = "http://localhost:4399";
    console.error("Starting dev server on :4399…");
    server = spawn("npx", ["astro", "dev", "--port", "4399"], {
      cwd: root,
      stdio: "ignore",
      detached: true,
    });
    const deadline = Date.now() + 90_000;
    while (!(await isUp(`${base}/`))) {
      if (Date.now() > deadline) {
        console.error("Dev server did not start within 90s");
        process.kill(-server.pid);
        process.exit(2);
      }
      await sleep(500);
    }
  }
}
const stopServer = () => server && process.kill(-server.pid);
process.on("exit", stopServer);
process.on("SIGINT", () => process.exit(130));

// --- Pages: listings plus the first project and post from /llms.txt ------------
let pages = arg("pages")?.split(",");
if (!pages) {
  // Overlays opened by hash: design system panel and recruiter view
  pages = [
    "/",
    "/#design-system",
    "/#at-a-glance",
    "/portfolio/",
    "/portfolio/tech/react/",
    "/blog/",
  ];
  try {
    const llms = await (await fetch(`${base}/llms.txt`)).text();
    for (const section of ["portfolio", "blog"]) {
      const slug = llms.match(
        new RegExp(`/${section}/([^/)\\s]+)\\.md\\)`),
      )?.[1];
      if (slug) pages.push(`/${section}/${slug}/`);
    }
  } catch {
    console.error("Could not read /llms.txt; checking listing pages only");
  }
}

// --- In-page helpers -------------------------------------------------------------
// Runs in the browser: finds elements that stick out past the right edge and
// would actually cause sideways scroll (not clipped, not fixed).
function findOverflow() {
  const vw = document.documentElement.clientWidth;
  window.scrollTo(10_000, window.scrollY);
  const scrollX = window.scrollX;
  window.scrollTo(0, window.scrollY);
  const describe = (el) => {
    const label = el.closest("[data-xray]")?.getAttribute("data-xray");
    const cls = [...el.classList].slice(0, 3).join(".");
    return `${label ? `[${label}] ` : ""}${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${cls ? `.${cls}` : ""}`;
  };
  const clipped = (el) => {
    for (
      let p = el.parentElement;
      p && p !== document.body;
      p = p.parentElement
    ) {
      const s = getComputedStyle(p);
      if (s.position === "fixed") return true;
      if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) return true;
    }
    return getComputedStyle(el).position === "fixed";
  };
  const offenders = [];
  // Tall scrolling panels (overlays, drawers) that also scroll sideways. Short
  // horizontal scrollers like tab rows and code blocks are intentional.
  const panels = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    if (
      /(auto|scroll)/.test(s.overflowX) &&
      s.visibility !== "hidden" &&
      el.clientHeight >= innerHeight * 0.5 &&
      el.scrollWidth > el.clientWidth + 1 &&
      !el.closest("pre") &&
      // Intentional sideways sliders (e.g. Testimonials)
      !el.closest("[data-carousel]")
    ) {
      el.scrollLeft = 10_000;
      if (el.scrollLeft > 0) panels.push(el);
      el.scrollLeft = 0;
    }
    if (r.width <= 1 || r.right <= vw + 1 || clipped(el)) continue;
    const parent = el.parentElement?.getBoundingClientRect();
    if (parent && parent.right > vw + 1 && !clipped(el.parentElement)) continue; // report the outermost
    offenders.push({
      element: describe(el),
      right: Math.round(r.right),
      overBy: Math.round(r.right - vw),
    });
  }
  // Inside each sideways-scrolling panel, report the outermost elements that
  // stick out past its right edge
  const panelReports = panels.map((host) => {
    const edge = host.getBoundingClientRect().right + 1;
    const causes = [];
    for (const el of host.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width <= 1 || r.right <= edge) continue;
      const p = el.parentElement;
      if (p !== host && p.getBoundingClientRect().right > edge) continue;
      causes.push({
        element: describe(el),
        overBy: Math.round(r.right - edge + 1),
      });
      if (causes.length >= 10) break;
    }
    return {
      element: describe(host),
      overBy: host.scrollWidth - host.clientWidth,
      causes,
    };
  });
  return {
    viewport: vw,
    scrollWidth: document.documentElement.scrollWidth,
    canScrollSideways: scrollX > 0,
    offenders: offenders.slice(0, 10),
    panels: panelReports,
  };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await sleep(1800); // longest reveal is 1.6s
}

const hiddenReveals = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]:not(.is-visible)")].map(
      (el) =>
        `${el.closest("[data-xray]")?.getAttribute("data-xray") ?? el.tagName.toLowerCase()} (data-reveal="${el.dataset.reveal}")`,
    ),
  );

const fileName = (path, width) => {
  const [p, hash] = path.split("#");
  const name = p.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home";
  return `${name}${hash ? `--${hash}` : ""}@${width}.png`;
};

// --- Run -------------------------------------------------------------------------
mkdirSync(outDir, { recursive: true });
// Phones and tablets run in WebKit (iOS Safari is where this site's mobile
// bugs show up; Chromium hides some overflow WebKit allows). Desktop runs in
// Chromium, which also provides the layout-shift (CLS) metric.
const browsers = {
  webkit: await webkit.launch(),
  chromium: await chromium.launch(),
};
const engineFor = (width) => (width < 1024 ? "webkit" : "chromium");
const report = {
  base,
  generatedAt: new Date().toISOString(),
  pages: [],
  reducedMotion: [],
  transitions: [],
  failures: [],
};
const fail = (area, message) => report.failures.push({ area, message });

try {
  // 1. Overflow, reveals and screenshots
  for (const width of widths) {
    const context = await browsers[engineFor(width)].newContext({
      viewport: { width, height: width < 768 ? 812 : 900 },
      deviceScaleFactor: 1,
      isMobile: width < 768,
      hasTouch: width < 1024,
    });
    const page = await context.newPage();
    for (const path of pages) {
      const result = { path, width, engine: engineFor(width) };
      try {
        await page.goto(base + path, { waitUntil: "networkidle" });
        await sleep(400);
        const overlay = path.includes("#");
        if (overlay) await sleep(1500); // let the panel open and its demos play
        Object.assign(result, await page.evaluate(findOverflow));
        // Behind an overlay the page can't scroll, so reveals stay hidden by design
        if (!overlay) await scrollThrough(page);
        result.stuckReveals = overlay ? [] : await hiddenReveals(page);
        if (screenshots) {
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(200);
          result.screenshot = `.checks/mobile/${fileName(path, width)}`;
          await page.screenshot({
            path: resolve(root, result.screenshot),
            fullPage: true,
          });
        }
        if (result.canScrollSideways || result.scrollWidth > result.viewport) {
          fail(
            "overflow",
            `${path} @${width}px scrolls sideways (scrollWidth ${result.scrollWidth} > ${result.viewport}). Causes: ${result.offenders.map((o) => `${o.element} +${o.overBy}px`).join(", ") || "unknown"}`,
          );
        }
        for (const p of result.panels) {
          fail(
            "overflow",
            `${path} @${width}px: scrolling panel ${p.element} scrolls sideways by ${p.overBy}px. Causes: ${p.causes.map((c) => `${c.element} +${c.overBy}px`).join(", ") || "unknown"}`,
          );
        }
        if (result.stuckReveals.length)
          fail(
            "reveal",
            `${path} @${width}px: ${result.stuckReveals.length} reveal(s) never became visible: ${result.stuckReveals.slice(0, 5).join(", ")}`,
          );
      } catch (e) {
        fail(
          "load",
          `${path} @${width}px failed to load: ${e.message.split("\n")[0]}`,
        );
      }
      report.pages.push(result);
    }
    await context.close();
  }

  // 2. Reduced motion: everything visible without scrolling
  {
    const context = await browsers.webkit.newContext({
      viewport: { width: 375, height: 812 },
      reducedMotion: "reduce",
      isMobile: true,
    });
    const page = await context.newPage();
    for (const path of pages) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await sleep(400);
      const hidden = await hiddenReveals(page);
      report.reducedMotion.push({ path, hidden });
      if (hidden.length)
        fail(
          "reduced-motion",
          `${path}: ${hidden.length} reveal(s) still hidden with prefers-reduced-motion`,
        );
    }
    await context.close();
  }

  // 3. View transitions: listing → detail
  const flows = [
    ["/portfolio/", "portfolio"],
    ["/blog/", "blog"],
  ].flatMap((f) => ["webkit", "chromium"].map((engine) => [...f, engine]));
  for (const [listing, section, engine] of flows) {
    const context = await browsers[engine].newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const result = { from: listing, engine };
    try {
      await page.goto(base + listing, { waitUntil: "networkidle" });
      await sleep(400);
      const link = page
        .locator(`main a[href^="/${section}/"]:not([href$="/${section}/"])`)
        .filter({ hasNotText: /^\s*\d+\s*$/ })
        .first();
      result.to = await link.getAttribute("href");
      await link.scrollIntoViewIfNeeded();
      await sleep(1500);

      // Instrument the client-side navigation before clicking
      await page.evaluate(
        ({ moveTolerance }) => {
          window.__vtResult = null;
          const layoutTop = (el) => {
            let y = 0;
            for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
            return y;
          };
          let transition;
          const revealFlicker = new Set();
          document.addEventListener(
            "astro:before-swap",
            (e) => (transition = e.viewTransition),
            { once: true },
          );
          document.addEventListener(
            "astro:after-swap",
            () => {
              new MutationObserver((records) => {
                for (const r of records) {
                  const el = r.target;
                  if (
                    el.dataset?.reveal !== undefined &&
                    r.oldValue?.includes("is-visible") &&
                    !el.classList.contains("is-visible")
                  ) {
                    revealFlicker.add(
                      el.closest("[data-xray]")?.getAttribute("data-xray") ??
                        el.tagName.toLowerCase(),
                    );
                  }
                }
              }).observe(document.body, {
                subtree: true,
                attributes: true,
                attributeFilter: ["class"],
                attributeOldValue: true,
              });
            },
            { once: true },
          );
          document.addEventListener(
            "astro:page-load",
            async () => {
              const usedViewTransition = Boolean(transition);
              if (transition) await transition.finished.catch(() => {});
              const targets = [
                ...document.querySelectorAll(
                  "[data-astro-transition-scope], main h1",
                ),
              ];
              const start = targets.map(layoutTop);
              const maxMove = targets.map(() => 0);
              // layout-shift is Chromium-only; WebKit reports cls: null
              let cls = PerformanceObserver.supportedEntryTypes?.includes(
                "layout-shift",
              )
                ? 0
                : null;
              const po = new PerformanceObserver((list) => {
                for (const entry of list.getEntries())
                  if (!entry.hadRecentInput) cls += entry.value;
              });
              if (cls !== null)
                po.observe({ type: "layout-shift", buffered: false });
              const until = performance.now() + 1500;
              await new Promise((done) => {
                const tick = () => {
                  targets.forEach(
                    (el, i) =>
                      (maxMove[i] = Math.max(
                        maxMove[i],
                        Math.abs(layoutTop(el) - start[i]),
                      )),
                  );
                  performance.now() < until
                    ? requestAnimationFrame(tick)
                    : done();
                };
                requestAnimationFrame(tick);
              });
              po.disconnect();
              window.__vtResult = {
                usedViewTransition,
                cls: cls === null ? null : Number(cls.toFixed(4)),
                moved: targets
                  .map((el, i) => ({
                    element: el.matches("h1")
                      ? "main h1"
                      : `transition:name ${el.getAttribute("data-astro-transition-scope")}`,
                    px: Math.round(maxMove[i]),
                  }))
                  .filter((m) => m.px > moveTolerance),
                revealFlicker: [...revealFlicker],
              };
            },
            { once: true },
          );
        },
        { moveTolerance: MOVE_TOLERANCE_PX },
      );

      await link.click();
      await page.waitForFunction(() => window.__vtResult, null, {
        timeout: 15_000,
      });
      Object.assign(result, await page.evaluate(() => window.__vtResult));
      const label = `${listing} → ${result.to} (${engine})`;
      if (!result.usedViewTransition)
        fail(
          "transition",
          `${label}: no view transition ran (full page load?)`,
        );
      if (result.cls > CLS_FAIL)
        fail(
          "transition",
          `${label}: layout shift ${result.cls} after the transition (limit ${CLS_FAIL})`,
        );
      for (const m of result.moved)
        fail(
          "transition",
          `${label}: ${m.element} moved ${m.px}px after the transition finished`,
        );
      if (result.revealFlicker.length)
        fail(
          "transition",
          `${label}: reveals animated out and back in: ${result.revealFlicker.join(", ")}`,
        );
    } catch (e) {
      fail(
        "transition",
        `${listing} (${engine}): could not run transition check: ${e.message.split("\n")[0]}`,
      );
    }
    report.transitions.push(result);
    await context.close();
  }
} finally {
  await Promise.all(Object.values(browsers).map((b) => b.close()));
  writeFileSync(
    resolve(outDir, "report.json"),
    JSON.stringify(report, null, 2),
  );
}

// --- Summary -----------------------------------------------------------------------
const n = report.pages.length;
if (report.failures.length === 0) {
  console.log(
    `✓ Mobile check passed: ${pages.length} pages × ${widths.length} widths (${n} runs), reduced motion, ${report.transitions.length} view transitions`,
  );
} else {
  console.log(`✗ ${report.failures.length} problem(s):\n`);
  for (const f of report.failures) console.log(`  [${f.area}] ${f.message}`);
}
console.log(
  `\nReport: .checks/mobile/report.json${screenshots ? "  Screenshots: .checks/mobile/*.png" : ""}`,
);
process.exit(report.failures.length === 0 ? 0 : 1);
