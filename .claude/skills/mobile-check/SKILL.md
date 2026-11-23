---
name: mobile-check
description: Check the site on phone, tablet and desktop widths. Detects sideways scroll (including inside the design system and recruiter overlays), scroll reveals that never appear, reduced-motion problems, and jitter or layout shift after view transitions, and saves screenshots. Use after changing layout, CSS, Tailwind classes, components, reveals or view transitions, or when asked to check mobile, responsiveness or side scroll.
when_to_use: "check this on mobile", "does it side scroll", "test the transition", "screenshot the pages", before shipping a visual change
context: fork
allowed-tools: Bash(npm run check:mobile*) Bash(node .claude/skills/mobile-check/scripts/*) Read
---

# Mobile check

Runs a Playwright pass over the site and reports layout and motion problems. Phone and tablet widths run in **WebKit** because iOS Safari is where this site's mobile bugs appear: Chromium hides some overflow that Safari allows. Desktop runs in Chromium.

## Run it

```bash
npm run check:mobile
```

If it fails with a missing-browser error, run `npx playwright install chromium webkit` once and retry.

The script reuses a dev server on :4321 if one is running. Otherwise it starts one on :4399 and stops it afterwards. A full run takes about 2 minutes.

Useful flags (put `--` before them when using npm):

| Flag               | Use                                                                |
| ------------------ | ------------------------------------------------------------------ |
| `--pages /,/blog/` | Only these paths. Hash paths open overlays, e.g. `/#design-system` |
| `--widths 375`     | Only these widths                                                  |
| `--url <base>`     | Test another server, e.g. a preview build                          |
| `--no-screenshots` | Faster run                                                         |

Narrow the run to the pages the current diff affects when that's obvious (`git diff --stat`). Run everything when in doubt.

## What it checks

1. **Overflow** at each page and width. The page or a tall scrolling panel can scroll sideways. It reports the outermost elements causing it, labelled with their `data-xray` component name.
2. **Stuck reveals**: `[data-reveal]` elements still hidden after scrolling the whole page (see `src/js/reveal.js`).
3. **Reduced motion**: with `prefers-reduced-motion`, every reveal must be visible without scrolling.
4. **View transitions** from the listing to a detail page, in both engines:
   - the `transition:name` element or `h1` moving more than 2px after the transition finishes
   - CLS above 0.1 (Chromium only)
   - reveals that animate out and back in

## Report back

1. Read the script's summary. Details are in `.checks/mobile/report.json`.
2. Look at the screenshots in `.checks/mobile/` for the pages the change touched, at 375 and 1280 at least, with the Read tool. Check for problems the script can't detect: overlapping text, cramped spacing, clipped headings, broken images.
3. Report:
   - pass or fail
   - each failure with the responsible element and the file that likely contains it (search `data-xray="<Name>"` to find the component)
   - a concrete fix for each failure
   - anything you noticed in the screenshots

Common fixes in this codebase:

- A translated or animated element sticking out: animate `left` or `clip-path` instead of `translateX`, or add `overflow-hidden` to its wrapper.
- A full-width element plus padding: use `max-w-full`, or `w-full` without extra horizontal margin.
- Reveal jitter after a transition: start reveals only after `viewTransition.finished` (see the `Layout.astro` script).

Don't fix code unless you were asked to. This skill reports.
