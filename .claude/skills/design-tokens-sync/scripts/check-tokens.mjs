#!/usr/bin/env node
// Checks that the design system panel data (src/data/designSystem.ts) matches
// the real tokens: tailwind.config.mjs, the CSS variables and @font-face rules
// in src/layouts/Layout.astro, and the font files in src/fonts/.
//
// Source of truth: tailwind.config.mjs + Layout.astro. designSystem.ts mirrors them.
// Usage: node check-tokens.mjs [--json]
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const require = createRequire(resolve(root, "package.json"));
const jiti = require("jiti")(resolve(root, "package.json"), {
  interopDefault: true,
  esmResolve: true,
});

const tw = jiti(resolve(root, "tailwind.config.mjs"));
const ds = jiti(resolve(root, "src/data/designSystem.ts"));
const twColors = require("tailwindcss/colors");
const layoutPath = resolve(root, "src/layouts/Layout.astro");
const layout = readFileSync(layoutPath, "utf8");

const problems = [];
const report = (area, message) => problems.push({ area, message });
const norm = (s) => String(s).replace(/\s+/g, " ").trim();

// --- Breakpoints and container padding -------------------------------------
const screens = tw.theme.container?.screens ?? {};
const padding = tw.theme.container?.padding ?? {};
const dsBreakpoints = Object.fromEntries(
  ds.breakpoints.map((b) => [b.name, b]),
);

for (const [name, width] of Object.entries(screens)) {
  const b = dsBreakpoints[name];
  if (!b)
    report(
      "breakpoints",
      `screen "${name}" (${width}) is missing from designSystem breakpoints`,
    );
  else if (b.width !== width)
    report(
      "breakpoints",
      `screen "${name}": tailwind ${width}, designSystem ${b.width}`,
    );
  const twPad = padding[name] ?? padding.DEFAULT;
  if (b && b.padding !== twPad)
    report(
      "padding",
      `padding at "${name}": tailwind ${twPad}, designSystem ${b.padding}`,
    );
}
for (const name of Object.keys(dsBreakpoints)) {
  if (name !== "base" && !(name in screens))
    report(
      "breakpoints",
      `designSystem has breakpoint "${name}" that tailwind does not`,
    );
}
if (dsBreakpoints.base && dsBreakpoints.base.padding !== padding.DEFAULT) {
  report(
    "padding",
    `base padding: tailwind ${padding.DEFAULT}, designSystem ${dsBreakpoints.base.padding}`,
  );
}

// --- Display type sizes ----------------------------------------------------
const fontSize = tw.theme.extend?.fontSize ?? {};
const dsType = Object.fromEntries(ds.typeScale.map((t) => [t.token, t]));
for (const [name, def] of Object.entries(fontSize)) {
  const value = Array.isArray(def) ? def[0] : def;
  const entry = dsType[`text-${name}`];
  if (!entry)
    report(
      "type",
      `tailwind fontSize "${name}" has no "text-${name}" entry in designSystem typeScale`,
    );
  else if (norm(entry.value) !== norm(value))
    report(
      "type",
      `text-${name}: tailwind ${value}, designSystem ${entry.value}`,
    );
}
for (const token of Object.keys(dsType)) {
  const m = token.match(/^text-(display[\w-]*)$/);
  if (m && !(m[1] in fontSize))
    report(
      "type",
      `designSystem lists ${token} but tailwind has no fontSize "${m[1]}"`,
    );
}

// --- Easing ----------------------------------------------------------------
const twEase = tw.theme.extend?.transitionTimingFunction?.["out-expo"];
const cssEase = layout.match(/--ease-out-expo:\s*([^;]+);/)?.[1];
const bezierStr = `cubic-bezier(${ds.motion.bezier.join(", ")})`;
const eases = {
  "tailwind out-expo": twEase,
  "Layout --ease-out-expo": cssEase,
  "designSystem motion.easing": ds.motion.easing,
  "designSystem motion.bezier": bezierStr,
};
const easeValues = new Set(
  Object.values(eases).map((v) =>
    norm(v ?? "MISSING").replace(/\s*,\s*/g, ", "),
  ),
);
if (easeValues.size > 1) {
  report(
    "motion",
    `easing values differ: ${Object.entries(eases)
      .map(([k, v]) => `${k} = ${v ?? "MISSING"}`)
      .join("; ")}`,
  );
}

// --- Colours ---------------------------------------------------------------
const hexToRgb = (hex) => {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(" ");
};
const twColour = (name) => {
  const [family, shade] = name.split("-");
  const hex = twColors[family]?.[shade];
  return hex ? hexToRgb(hex) : null;
};
const cssVars = (selector) => {
  const block =
    layout.match(
      new RegExp(`${selector.replace(".", "\\.")}\\s*{([^}]*)}`),
    )?.[1] ?? "";
  const vars = {};
  for (const m of block.matchAll(
    /--([\w-]+):\s*([\d\s]+?);\s*(?:\/\*\s*([\w-]+)\s*\*\/)?/g,
  )) {
    vars[m[1]] = { rgb: norm(m[2]), comment: m[3] };
  }
  return vars;
};
const themes = { light: cssVars(":root"), dark: cssVars("html.dark") };
const twColorTokens = Object.keys(tw.theme.extend?.colors ?? {});

for (const c of ds.colours) {
  if (!twColorTokens.includes(c.token))
    report(
      "colours",
      `designSystem colour "${c.token}" is not a tailwind colour token`,
    );
  for (const theme of ["light", "dark"]) {
    const v = themes[theme][c.token];
    const expected = twColour(c[theme]);
    if (!v) {
      report(
        "colours",
        `--${c.token} not defined for ${theme} theme in Layout.astro`,
      );
      continue;
    }
    if (!expected) {
      report(
        "colours",
        `designSystem ${c.token}.${theme} = "${c[theme]}" is not a tailwind palette colour`,
      );
      continue;
    }
    if (v.rgb !== expected)
      report(
        "colours",
        `${c.token} (${theme}): Layout.astro is ${v.rgb}, but designSystem says ${c[theme]} (${expected})`,
      );
    if (v.comment && v.comment !== c[theme])
      report(
        "colours",
        `${c.token} (${theme}): Layout.astro comment says ${v.comment}, designSystem says ${c[theme]}`,
      );
    if (v.comment && twColour(v.comment) && twColour(v.comment) !== v.rgb)
      report(
        "colours",
        `${c.token} (${theme}): Layout.astro value ${v.rgb} does not match its own comment ${v.comment}`,
      );
  }
}
for (const token of twColorTokens) {
  if (!ds.colours.some((c) => c.token === token))
    report(
      "colours",
      `tailwind colour "${token}" is missing from designSystem colours`,
    );
}

// --- Fonts -----------------------------------------------------------------
const faces = [...layout.matchAll(/@font-face\s*{([^}]*)}/g)].map((m) => ({
  family: m[1].match(/font-family:\s*["']?([^"';]+)/)?.[1],
  weight: Number(m[1].match(/font-weight:\s*(\d+)/)?.[1]),
  src: m[1].match(/url\(["']?([^"')]+)/)?.[1],
}));
for (const f of faces) {
  if (f.src && !existsSync(resolve(dirname(layoutPath), f.src)))
    report(
      "fonts",
      `@font-face ${f.family} ${f.weight} points at missing file ${f.src}`,
    );
}
const twFamilies = tw.theme.extend?.fontFamily ?? {};
for (const font of ds.fonts) {
  const key = font.css.replace(/^font-/, "");
  if (twFamilies[key]?.[0] !== font.family)
    report(
      "fonts",
      `${font.css}: tailwind uses ${twFamilies[key]?.[0] ?? "nothing"}, designSystem says ${font.family}`,
    );
  const loaded = faces
    .filter((f) => f.family === font.family)
    .map((f) => f.weight)
    .sort();
  const listed = [...font.weights].sort();
  if (loaded.join() !== listed.join())
    report(
      "fonts",
      `${font.family} weights: Layout.astro loads [${loaded}], designSystem lists [${listed}]`,
    );
}

// --- Output ----------------------------------------------------------------
if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ ok: problems.length === 0, problems }, null, 2));
} else if (problems.length === 0) {
  console.log(
    "✓ Design tokens in sync (breakpoints, padding, type, motion, colours, fonts)",
  );
} else {
  console.log(`✗ ${problems.length} design token mismatch(es):\n`);
  for (const p of problems) console.log(`  [${p.area}] ${p.message}`);
}
process.exit(problems.length === 0 ? 0 : 1);
