# CLAUDE.md

Jonathan Oliver's portfolio, live at https://jonooliver.dev. The README covers what's on the site and where things live; read it first.

## Stack

- Astro 4 (static output, `<ViewTransitions />`), Tailwind 3, and a few React and Vue islands
- Content comes from Sanity's public dataset (`8d98wy85` / `production`) through `src/sanity/useSanityHelper.js`. No keys are needed. Content changes happen in Sanity, not in this repo.
- The Sanity Studio is embedded at `/admin` by `@sanity/astro` (`studioBasePath` in `astro.config.mjs`, hash routing so it stays prerendered). Its config is `sanity.config.js` and the schemas live in `src/sanity/schemaTypes/`. Schema changes do belong in this repo. `/admin` is kept out of the sitemap, robots.txt and `check:agents`.
- Skills (`skill` objects on the profile) and tech stacks (`projectTechStack`, references to shared `technology` documents) can have icons: the shared fields in `src/sanity/schemaTypes/iconFields.js`, resolved by `iconDataUriFor()` in `src/sanity/useSanityHelper.js` and drawn by `SkillIcon.astro` as a `currentColor` CSS mask. Read skill names with `skillNames()` (`src/data/profile.ts`). `getProjects()` and `getProject()` return `projectTechStack` as plain names and `techStack` as `{ name, iconDataUri }` for `Pills`. Both helpers also accept the old plain-string content.
- Node 22, npm

## Commands

| Command                | What it does                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Dev server on :4321                                                                                            |
| `npm run build`        | Static build to `dist/`. This is the baseline check.                                                           |
| `npm run check:mobile` | Playwright pass for overflow, reveals and view transitions, with screenshots (see the `mobile-check` skill)    |
| `npm run check:agents` | Validates llms.txt, the .md pages, profile.json, JSON-LD and the sitemap (see the `agent-outputs-check` skill) |
| `npm run check:tokens` | Design system panel against the real tokens (see the `design-tokens-sync` skill)                               |

**There is no test suite.** Before calling a change done, run the build and the check that fits the change. Visual changes need `check:mobile`. Changes to pages or data need `check:agents`. Token changes need `check:tokens`.

The first time you run `check:mobile` on a machine, install the browsers: `npx playwright install chromium webkit`.

## Conventions

- **Branches:** `portfolio/<kebab-slug>`, with PRs into `master`. Use `/ship` for the whole routine.
- **Commits:** short, plain, sentence-case subjects with no full stop ("Fix side scroll mobile"). Add a bullet body when a change has several parts.
- **Formatting:** Prettier with the Astro and Tailwind plugins. A hook formats files after every edit, so don't hand-format.
- **Copy:** British English, plain and direct.
- **Tokens:** colours are CSS variables (raw RGB) in `src/layouts/Layout.astro`, exposed through `tailwind.config.mjs`. The source of truth is the Tailwind config plus Layout. `src/data/designSystem.ts` mirrors them for the design system panel, so update both together.
- **Reveals:** add `data-reveal="up|mask|image"` and optionally `style="--reveal-delay: …"`. Content starts hidden, so a reveal must never be left stuck. Reveals start only after the view transition finishes (see the script in `Layout.astro`).
- **Component labels:** give new page sections a `data-xray="ComponentName"` so they show up in X-ray mode (`Shift + X`).
- **Mobile:** test in WebKit. Most past bugs (side scroll, reveal jitter) appeared only in iOS Safari. Avoid `translateX` on full-width animated boxes, because the translated box causes sideways scroll.
- **Agent outputs:** anything added to a page's content should also reach its markdown version (`src/lib/markdown.ts`) and its JSON-LD (`src/lib/structuredData.ts`) where that makes sense.
