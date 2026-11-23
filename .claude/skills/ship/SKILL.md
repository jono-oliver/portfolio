---
name: ship
description: Branch, format, build, run the relevant checks, commit and push the current changes, then open a pull request into master. Run it yourself with /ship.
argument-hint: "[short description of the change]"
disable-model-invocation: true
allowed-tools: Bash(git status*) Bash(git diff*) Bash(git log*) Bash(git branch*) Bash(git switch*) Bash(git checkout -b*) Bash(git add*) Bash(git commit*) Bash(git push -u origin*) Bash(git rev-parse*) Bash(npm run build) Bash(npm run check:*) Bash(npx prettier*) Bash(gh pr create*) Bash(command -v gh)
---

# Ship

Take the current work from "it's done" to "PR open", the way this repo does it: `portfolio/<slug>` branches, short plain commit messages, PRs into `master`.

Description from the user: $ARGUMENTS

## Current state

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Changes against master: !`git diff --stat master... 2>/dev/null; git diff --stat`
- Recent commit subjects on master, for matching the style: !`git log -12 --no-merges --format='  %s' master`

## Steps

Stop and report at the first step that fails. Never force-push, never merge, and never commit to `master`.

1. **Branch.** If on `master`, create `portfolio/<slug>`. Take the slug from the description or the change itself: kebab-case, 2–4 words, e.g. `portfolio/mobile-jitter`. If already on a `portfolio/*` branch, stay on it.
2. **Format.** Run `npx prettier --write` on the changed source files only (`.astro .ts .js .mjs .vue .tsx .css .json .md`).
3. **Build.** `npm run build` must pass.
4. **Checks.** Run the checks that match what changed, all of them if several apply:
   - `src/pages`, `src/lib`, `src/data`, `src/sanity`, or the meta in `Layout.astro` → `npm run check:agents -- --no-build` (the build just ran)
   - components, layouts, CSS, Tailwind classes, `src/js` → `npm run check:mobile -- --no-screenshots`
   - `tailwind.config.mjs`, `src/data/designSystem.ts`, the CSS variables or fonts in `Layout.astro` → `npm run check:tokens`

   If a check fails, show the failures and ask whether to fix them first or ship anyway. Don't decide alone.

5. **Stage.** Add the files by name. Don't use `git add -A`. Never stage `.env*`, `.checks/`, `dist/` or `.claude/settings.local.json`. Mention any untracked file that looks unrelated, and leave it out.
6. **Commit.** Match the style of the recent subjects above:
   - sentence case, imperative, no full stop, under about 60 characters, e.g. "Fix side scroll mobile" or "Add responsive lazy images and listing pagination"
   - for a change with several parts, a blank line and then a `- ` bullet per part, wrapped at 72
   - end with the Co-Authored-By trailer this session is configured to use

   Use a heredoc so the formatting survives.

7. **Push.** `git push -u origin <branch>`.
8. **Pull request.**
   - If `command -v gh` finds the GitHub CLI, run `gh pr create --base master` with the title and body below.
   - Otherwise print the link `https://github.com/jono-oliver/portfolio/compare/master...<branch>?expand=1`, then the title and body in a code block ready to paste.
   - **Title:** the commit subject, or a summary if there are several commits.
   - **Body:**
     - a "What" section with a short paragraph or bullets
     - a "Checks" section listing what ran and whether it passed
     - a screenshots note if the change is visual: `.checks/mobile/*.png` has them, and the user can drag them in
     - end with the PR attribution line this session is configured to use

Finish with one short line: branch, commit hash, and the PR link.
