// Content for the Design System panel (src/components/DesignSystemPanel.astro).
// Copy is written to be edited — rewrite any of it in your own voice.
// Colour values are NOT stored here: the panel reads them live from the CSS
// variables in Layout.astro so they always match the current theme.
// Layout values (breakpoints, container padding, display sizes) mirror
// tailwind.config.mjs. Importing that file directly fails at build time (it
// uses require()), so KEEP THESE IN SYNC if you change the config.
const displaySizes = {
  display: "clamp(3.25rem, 13vw, 12rem)",
  "display-sm": "clamp(2.5rem, 7vw, 6rem)",
  "display-md": "clamp(2.25rem, 5vw, 4.5rem)",
};
const screens: Record<string, string> = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
};
const padding: Record<string, string> = {
  DEFAULT: "1rem",
  sm: "2rem",
  md: "2rem",
  lg: "4rem",
  xl: "5rem",
  "2xl": "6rem",
};

export const intro =
  "An editorial, Swiss-inspired system: oversized uppercase type, generous space and hairline rules instead of cards or shadows. Everything is pared back so the work leads, with one small accent square doing the job of a logo.";

export type ColourToken = {
  token: string;
  name: string;
  role: string;
  light: string;
  dark: string;
};

export const colours: ColourToken[] = [
  { token: "paper", name: "Paper", role: "Page background", light: "slate-50", dark: "slate-950" },
  { token: "ink", name: "Ink", role: "Headings, body text, primary buttons", light: "slate-900", dark: "slate-50" },
  { token: "muted", name: "Muted", role: "Supporting copy, labels, metadata", light: "slate-500", dark: "slate-400" },
  { token: "line", name: "Line", role: "Hairline rules and borders", light: "slate-200", dark: "slate-800" },
  { token: "accent", name: "Accent", role: "Hover fills, text selection", light: "slate-800", dark: "teal-800" },
  { token: "accent-text", name: "Accent text", role: "Full stop, markers, focus rings", light: "slate-800", dark: "teal-400" },
];

export const colourRationale = [
  "A near-monochrome slate palette with a single accent. Slate has a faint blue undertone, so it feels cooler and more considered than pure grey.",
  "In dark mode the accent is teal: a cool counterpoint that sits naturally with the blue-grey slate, used sparingly as a signature on the full stop after the name, the square markers and focus rings. The deeper teal-800 handles hover fills so white text on it stays readable. In light mode the accent drops to slate so the page stays quiet.",
  "Every colour is a CSS variable holding raw RGB values, which lets Tailwind apply opacity (bg-ink/80) and lets both themes swap with one class on <html>.",
];

// Pairs checked for WCAG contrast against the page background
export const contrastPairs = [
  { fg: "ink", bg: "paper", label: "Body text" },
  { fg: "muted", bg: "paper", label: "Supporting text" },
  { fg: "accent-text", bg: "paper", label: "Accent" },
];

export const fonts = [
  {
    family: "Archivo",
    css: "font-heading",
    role: "Headings & display",
    weights: [400, 500, 700],
    rationale:
      "A grotesque with sturdy, wide capitals that stay crisp at huge display sizes and with tight letter spacing. It gives headlines an engineered, poster-like presence.",
  },
  {
    family: "Poppins",
    css: "font-body",
    role: "Body, UI & labels",
    weights: [400, 500, 700],
    rationale:
      "Geometric and friendly, with open letter shapes that stay legible at small sizes. It softens the hard-edged headlines so the reading text feels approachable.",
  },
];

export const typeScale = [
  { name: "Display", token: "text-display", value: displaySizes.display, sample: "Jonathan", px: 56, heading: true },
  { name: "Display SM", token: "text-display-sm", value: displaySizes["display-sm"], sample: "Portfolio", px: 40, heading: true },
  { name: "Display MD", token: "text-display-md", value: displaySizes["display-md"], sample: "Next project", px: 32, heading: true },
  { name: "H2", token: "h2", value: "1.875rem → 2.25rem", sample: "Section title", px: 26, heading: true },
  { name: "Body", token: "text-base / lg", value: "1rem → 1.125rem", sample: "Readable body copy at a comfortable measure.", px: 16, heading: false },
  { name: "Eyebrow", token: ".eyebrow", value: "0.75rem · 0.2em tracking", sample: "Introduction", px: 12, heading: false, eyebrow: true },
];

export const typeRationale =
  "Display sizes use clamp(), so headlines scale smoothly with the viewport instead of jumping at breakpoints. Large type is set tight (-0.04em) and uppercase; small labels go the other way, with wide tracking for contrast.";

// Breakpoints and container padding (see the mirrored values above)
export const breakpoints = [
  { name: "base", min: 0, width: "< 640px", padding: padding.DEFAULT },
  ...Object.entries(screens).map(([name, width]) => ({
    name,
    min: parseInt(width),
    width,
    padding: padding[name] ?? padding.DEFAULT,
  })),
];

export const spacing = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128];

export const layoutRationale =
  "Content sits in a 12-column grid inside a container that adds side padding at each breakpoint and stops growing at 1440px, keeping line lengths comfortable on wide screens. Spacing follows Tailwind's 4px scale, with big jumps between sections so each one gets room to breathe.";

export const motion = {
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  bezier: [0.16, 1, 0.3, 1] as const,
  durations: [
    { ms: 300, use: "Colour changes" },
    { ms: 500, use: "Underlines, arrows" },
    { ms: 700, use: "Panels, hover fills" },
    { ms: 1000, use: "Scroll reveals" },
  ],
  rationale:
    "One easing curve everywhere: ease-out-expo starts fast and lands softly, so things feel responsive without being abrupt. Content reveals as it scrolls into view, staggered slightly, and all motion switches off for people who prefer reduced motion.",
};

export const motifs = [
  { name: "Square marker", note: "The full stop after the name, reused as bullets, separators and section labels." },
  { name: "Eyebrow label", note: "Small, wide-tracked uppercase that introduces each section." },
  { name: "Link underline", note: "Draws in from the left on hover, leaves to the right." },
  { name: "Arrow nudge", note: "Arrows shift forward to signal where a link goes." },
  { name: "Film grain", note: "A faint noise overlay gives the flat palette a tactile, print-like feel." },
];
