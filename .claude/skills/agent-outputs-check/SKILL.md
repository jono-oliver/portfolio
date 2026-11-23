---
name: agent-outputs-check
description: Validate the machine-readable side of the built site — llms.txt, llms-full.txt, the .md version of every project and blog post and their rel="alternate" links, /api/profile.json, JSON-LD on every page, the sitemap and robots.txt. Use after changing anything in src/pages, src/lib, src/data, src/sanity or the meta tags in Layout.astro, after Sanity schema or content changes, or when asked whether the site is readable by AI agents, crawlers or SEO tools.
when_to_use: "check llms.txt", "is the JSON-LD valid", "check structured data", "check the markdown pages", before shipping changes to pages or data
context: fork
allowed-tools: Bash(npm run check:agents*) Bash(npm run build) Bash(node .claude/skills/agent-outputs-check/scripts/*) Read
---

# Agent outputs check

The site publishes several outputs for agents and crawlers (see the README section "For agents and crawlers"). All of them are generated at build time from Sanity, so they can break without anything visible changing on the site. This check builds the site and validates them.

## Run it

```bash
npm run check:agents
```

This runs `npm run build` first. If `dist/` is already up to date with the current code, skip the build:

```bash
npm run check:agents -- --no-build
```

Add `--json` for machine-readable output.

## What it checks

| Output                        | Checks                                                                                                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/llms.txt`                   | Shape is H1, then a `>` summary, then `## Portfolio` and `## Blog`. Every site link resolves to a file in `dist/`.                                                                            |
| `/llms-full.txt`              | Exists and is not empty.                                                                                                                                                                      |
| `/{portfolio,blog}/<slug>.md` | Every detail page has one, every `.md` has a page, each starts with an H1, and each HTML page links its `.md` with `rel="alternate" type="text/markdown"`.                                    |
| `/api/profile.json`           | Valid JSON. Required keys are present (see `src/pages/api/profile.json.ts`). Every project and article `url` and `markdown` value resolves.                                                   |
| JSON-LD                       | Present on every page and parses. Required fields are present for Person, WebSite, BlogPosting, CreativeWork and BreadcrumbList. No `null` or `"undefined"` values. Breadcrumb links resolve. |
| Sitemap, robots.txt           | Every HTML page is in the sitemap and every sitemap URL exists. robots.txt has a `Sitemap:` line and doesn't block the site.                                                                  |

External links, such as the CV on the Sanity CDN, are not fetched.

## Report back

- On pass, say so in one line with the page and check counts.
- On failure, group problems by output. Trace each one to its source and name the file:
  - **llms.txt:** `src/pages/llms.txt.ts`
  - **llms-full.txt:** `src/pages/llms-full.txt.ts`
  - **Markdown pages:** `src/lib/markdown.ts`, plus `src/pages/{portfolio,blog}/[slug].md.ts`
  - **JSON-LD:** builders in `src/lib/structuredData.ts`, rendered by `src/layouts/Layout.astro`
  - **profile.json:** `src/pages/api/profile.json.ts`
  - **Content:** fetched by `src/sanity/useSanityHelper.js`

  A `null` usually means a Sanity field is empty. Say whether the fix belongs in code (skip the field when it's empty) or in the Sanity content.

- Don't fix code unless you were asked to.
