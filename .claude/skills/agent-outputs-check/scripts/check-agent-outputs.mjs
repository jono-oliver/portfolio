#!/usr/bin/env node
// Validates the machine-readable side of the built site in dist/:
// llms.txt, llms-full.txt, the .md page versions and their rel="alternate"
// links, /api/profile.json, JSON-LD on every page, the sitemap and robots.txt.
//
// Usage: node check-agent-outputs.mjs [--no-build] [--json]
// Run from the repo root. Builds the site first unless --no-build is passed.
import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const args = process.argv.slice(2);

if (!args.includes("--no-build")) {
  console.error("Building site (pass --no-build to skip)…");
  execSync("npm run build", {
    cwd: root,
    stdio: ["ignore", "ignore", "inherit"],
  });
}
if (!existsSync(dist)) {
  console.error("dist/ not found. Run npm run build first.");
  process.exit(2);
}

const site = readFileSync(resolve(root, "astro.config.mjs"), "utf8")
  .match(/site:\s*["']([^"']+)["']/)?.[1]
  ?.replace(/\/$/, "");
if (!site) {
  console.error("Could not read `site` from astro.config.mjs");
  process.exit(2);
}

const failures = [];
const fail = (area, message) => failures.push({ area, message });
let checked = 0;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const files = walk(dist);
const htmlPages = files.filter((f) => f.endsWith(".html"));
const read = (rel) => readFileSync(join(dist, rel), "utf8");

// Map a site URL or root-relative path to a file in dist/. Returns null for
// external URLs, or the dist-relative path (which may not exist).
const toDistPath = (url) => {
  let path;
  if (url.startsWith(site)) path = url.slice(site.length) || "/";
  else if (url.startsWith("/")) path = url;
  else return null;
  path = decodeURI(path.split(/[?#]/)[0]);
  if (path.endsWith("/")) path += "index.html";
  else if (!/\.[a-z0-9]+$/i.test(path)) path += "/index.html";
  return path.replace(/^\//, "");
};
const resolves = (url) => {
  const p = toDistPath(url);
  return p === null ? true : existsSync(join(dist, p));
};
const checkLink = (area, url, context) => {
  checked++;
  if (!resolves(url))
    fail(area, `${context}: ${url} does not resolve to a file in dist/`);
};

// --- llms.txt ----------------------------------------------------------------
if (!existsSync(join(dist, "llms.txt")))
  fail("llms.txt", "dist/llms.txt is missing");
else {
  const txt = read("llms.txt");
  const lines = txt.split("\n");
  if (!/^# \S/.test(lines[0]))
    fail("llms.txt", "first line must be an H1 (`# Name`)");
  if (!lines.some((l) => l.startsWith("> ")))
    fail("llms.txt", "missing the `> summary` blockquote");
  const sections = lines
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3));
  for (const s of ["Portfolio", "Blog"])
    if (!sections.includes(s)) fail("llms.txt", `missing "## ${s}" section`);
  const links = [...txt.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  if (links.length === 0) fail("llms.txt", "contains no links");
  for (const url of links) checkLink("llms.txt", url, "link");
}
if (
  !existsSync(join(dist, "llms-full.txt")) ||
  read("llms-full.txt").trim().length < 200
) {
  fail("llms-full.txt", "dist/llms-full.txt is missing or nearly empty");
}

// --- .md page versions and rel="alternate" -----------------------------------
for (const section of ["portfolio", "blog"]) {
  const dir = join(dist, section);
  if (!existsSync(dir)) {
    fail("markdown", `dist/${section}/ is missing`);
    continue;
  }
  const entries = readdirSync(dir);
  const slugs = entries.filter(
    (n) =>
      statSync(join(dir, n)).isDirectory() &&
      existsSync(join(dir, n, "index.html")) &&
      !/^\d+$/.test(n),
  );
  const mds = entries
    .filter((n) => n.endsWith(".md"))
    .map((n) => n.slice(0, -3));
  for (const slug of slugs) {
    checked++;
    if (!mds.includes(slug))
      fail("markdown", `/${section}/${slug}/ has no /${section}/${slug}.md`);
    else if (read(`${section}/${slug}.md`).trim().length < 50)
      fail("markdown", `/${section}/${slug}.md is nearly empty`);
    else if (!read(`${section}/${slug}.md`).startsWith("# "))
      fail("markdown", `/${section}/${slug}.md does not start with an H1`);
    const html = read(`${section}/${slug}/index.html`);
    const alt = html.match(
      /<link[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*href="([^"]+)"/,
    )?.[1];
    if (!alt)
      fail(
        "markdown",
        `/${section}/${slug}/ has no <link rel="alternate" type="text/markdown">`,
      );
    else if (alt !== `/${section}/${slug}.md`)
      fail("markdown", `/${section}/${slug}/ alternate points at ${alt}`);
  }
  for (const md of mds)
    if (!slugs.includes(md))
      fail("markdown", `/${section}/${md}.md has no matching HTML page`);
}

// --- /api/profile.json ---------------------------------------------------------
if (!existsSync(join(dist, "api/profile.json")))
  fail("profile.json", "dist/api/profile.json is missing");
else {
  let data;
  try {
    data = JSON.parse(read("api/profile.json"));
  } catch (e) {
    fail("profile.json", `invalid JSON: ${e.message}`);
  }
  if (data) {
    const required = [
      "name",
      "jobTitle",
      "summary",
      "skills",
      "contact",
      "projects",
      "articles",
      "generatedAt",
    ];
    for (const k of required)
      if (data[k] === undefined || data[k] === null || data[k] === "")
        fail("profile.json", `missing or empty "${k}"`);
    if (data.contact && !data.contact.website)
      fail("profile.json", `missing contact.website`);
    for (const [kind, items] of [
      ["projects", data.projects],
      ["articles", data.articles],
    ]) {
      if (!Array.isArray(items) || items.length === 0) {
        fail("profile.json", `"${kind}" is empty`);
        continue;
      }
      items.forEach((item, i) => {
        if (!item.title) fail("profile.json", `${kind}[${i}] has no title`);
        for (const key of ["url", "markdown"]) {
          if (!item[key]) fail("profile.json", `${kind}[${i}] has no ${key}`);
          else checkLink("profile.json", item[key], `${kind}[${i}].${key}`);
        }
      });
    }
  }
}

// --- JSON-LD on every page -----------------------------------------------------
const REQUIRED = {
  Person: ["name", "url"],
  WebSite: ["name", "url"],
  BlogPosting: ["headline", "datePublished", "author", "url"],
  CreativeWork: ["name", "url"],
  BreadcrumbList: ["itemListElement"],
};
const findBad = (value, path = "") => {
  if (value === null) return [path || "(root)"];
  if (
    typeof value === "string" &&
    /\bundefined\b|\[object Object\]/.test(value)
  )
    return [path];
  if (Array.isArray(value))
    return value.flatMap((v, i) => findBad(v, `${path}[${i}]`));
  if (typeof value === "object")
    return Object.entries(value).flatMap(([k, v]) =>
      findBad(v, path ? `${path}.${k}` : k),
    );
  return [];
};
for (const file of htmlPages) {
  const page = "/" + relative(dist, file).replace(/index\.html$/, "");
  const html = readFileSync(file, "utf8");
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map((m) => m[1]);
  if (blocks.length === 0) {
    fail("json-ld", `${page} has no JSON-LD`);
    continue;
  }
  for (const block of blocks) {
    let parsed;
    try {
      parsed = JSON.parse(block);
    } catch (e) {
      fail("json-ld", `${page}: invalid JSON (${e.message})`);
      continue;
    }
    const nodes = (Array.isArray(parsed) ? parsed : [parsed]).flatMap(
      (n) => n["@graph"] ?? [n],
    );
    for (const node of nodes) {
      checked++;
      const type = node["@type"];
      if (!type) {
        fail("json-ld", `${page}: node without @type`);
        continue;
      }
      if (!node["@context"] && !parsed["@context"])
        fail("json-ld", `${page}: ${type} has no @context`);
      for (const key of REQUIRED[type] ?? []) {
        const v = node[key];
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0))
          fail("json-ld", `${page}: ${type} is missing "${key}"`);
      }
      for (const bad of findBad(node))
        fail(
          "json-ld",
          `${page}: ${type}.${bad} is null or contains "undefined"`,
        );
      if (type === "BreadcrumbList") {
        for (const item of node.itemListElement ?? [])
          if (item.item)
            checkLink(
              "json-ld",
              item.item,
              `${page} breadcrumb "${item.name}"`,
            );
      }
    }
  }
}

// --- Sitemap and robots.txt ----------------------------------------------------
if (!existsSync(join(dist, "sitemap-index.xml")))
  fail("sitemap", "dist/sitemap-index.xml is missing");
else {
  const sitemaps = [
    ...read("sitemap-index.xml").matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((m) => m[1]);
  const locs = sitemaps.flatMap((url) => {
    const p = toDistPath(url);
    if (!p || !existsSync(join(dist, p))) {
      fail("sitemap", `sitemap index points at missing ${url}`);
      return [];
    }
    return [...read(p).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  });
  for (const loc of locs) checkLink("sitemap", loc, "sitemap entry");
  for (const file of htmlPages) {
    const url = `${site}/${relative(dist, file).replace(/index\.html$/, "")}`;
    checked++;
    if (!locs.includes(url))
      fail("sitemap", `${url} is not listed in the sitemap`);
  }
}
if (!existsSync(join(dist, "robots.txt")))
  fail("robots.txt", "dist/robots.txt is missing");
else {
  const robots = read("robots.txt");
  if (!/^Sitemap:\s*\S+/m.test(robots))
    fail("robots.txt", "has no Sitemap: line");
  if (/^Disallow:\s*\/\s*$/m.test(robots))
    fail("robots.txt", "disallows the whole site");
}

// --- Output ----------------------------------------------------------------------
if (args.includes("--json")) {
  console.log(
    JSON.stringify(
      { ok: failures.length === 0, pages: htmlPages.length, checked, failures },
      null,
      2,
    ),
  );
} else if (failures.length === 0) {
  console.log(
    `✓ Agent outputs OK: ${htmlPages.length} pages, ${checked} checks (llms.txt, .md pages, profile.json, JSON-LD, sitemap, robots.txt)`,
  );
} else {
  console.log(`✗ ${failures.length} problem(s) in agent outputs:\n`);
  for (const f of failures) console.log(`  [${f.area}] ${f.message}`);
}
process.exit(failures.length === 0 ? 0 : 1);
