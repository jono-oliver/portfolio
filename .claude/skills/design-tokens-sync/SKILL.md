---
name: design-tokens-sync
description: Detect drift between the design system panel's data (src/data/designSystem.ts) and the real tokens in tailwind.config.mjs, the CSS variables and @font-face rules in src/layouts/Layout.astro, and the font files. Covers breakpoints, container padding, display type sizes, easing, light and dark colours, and font weights. Use after editing any of those files, when adding or changing a colour, font, breakpoint or type size, or when asked whether the design system panel is accurate.
when_to_use: "is the design panel up to date", "I changed a colour/breakpoint/font", "check the tokens"
paths: ["tailwind.config.mjs", "src/data/designSystem.ts", "src/layouts/Layout.astro", "src/fonts/**"]
allowed-tools: Bash(npm run check:tokens*) Bash(node .claude/skills/design-tokens-sync/scripts/*) Read Edit
---

# Design tokens sync

The design system panel (`Shift + D` or `#design-system`) promises to show "the real tokens". Colours are read live from CSS variables. Breakpoints, padding, display sizes, colour names and font weights are copied by hand into `src/data/designSystem.ts`, because importing the Tailwind config fails at build time. This check finds places where the copy has drifted.

**The source of truth is `tailwind.config.mjs` and `src/layouts/Layout.astro`.** `designSystem.ts` mirrors them.

## Run it

```bash
npm run check:tokens
```

The check takes about a second and needs no build or server. Add `--json` for machine-readable output.

## What it compares

| Area              | Real token                                                                                 | Panel data                                                              |
| ----------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Breakpoints       | `theme.container.screens`                                                                  | `breakpoints[].width`                                                   |
| Container padding | `theme.container.padding`                                                                  | `breakpoints[].padding`                                                 |
| Display sizes     | `theme.extend.fontSize.display*`                                                           | `typeScale` entries `text-display*`                                     |
| Easing            | `transitionTimingFunction.out-expo` and `--ease-out-expo`                                  | `motion.easing` and `motion.bezier`                                     |
| Colours           | the RGB values of `:root` and `html.dark` `--<token>`, and their `/* slate-50 */` comments | `colours[].light` / `.dark` names, matched against the Tailwind palette |
| Colour tokens     | `theme.extend.colors` keys                                                                 | `colours[].token`                                                       |
| Fonts             | `fontFamily`, `@font-face` weights, files in `src/fonts/`                                  | `fonts[].family` / `.weights`                                           |

## When it finds drift

1. Show the mismatches in a short table: area, real value, panel value.
2. Assume the real token changed on purpose and the panel is stale. Offer to update `src/data/designSystem.ts` to match. That's a safe edit: copy only.
3. If the panel value looks like the intended one, ask before changing a real token. Examples: a colour comment that matches the panel but not the RGB, or a typo in the Tailwind config. Changing a real token changes the whole site.
4. When adding a new token (a colour, size or breakpoint), add it in both places, and write a `role` or rationale line in the existing voice of `designSystem.ts`.
5. Re-run the check after editing to confirm it passes.

The rationale text in `designSystem.ts` (for example "In dark mode the accent is teal…") isn't checked. If a token changes meaning, point out any sentence that no longer holds.
