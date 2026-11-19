// Shared profile helpers used by the hero and the recruiter summary.

export type Highlight = { full: string; short: string };

// Focus areas shown beneath the job role. `short` is used where space is
// tight. Uses `highlights` from the Sanity profile if present (same text at
// every size), otherwise these defaults.
export function getHighlights(profile: { highlights?: string[] }): Highlight[] {
  return profile.highlights?.length
    ? profile.highlights.slice(0, 3).map((h) => ({ full: h, short: h }))
    : [
        { full: "Front end specialist", short: "Front end" },
        { full: "AI Product Engineer", short: "AI product" },
        { full: "Performance & accessibility", short: "Performance" },
      ];
}

// Splits the bio into an emphasised lead sentence and the supporting rest
export function splitBio(bio = ""): { lead: string; rest: string } {
  const match = bio.trim().match(/^(.+?[.!?])\s+([\s\S]+)$/);
  return match ? { lead: match[1], rest: match[2] } : { lead: bio, rest: "" };
}

// Shown at the top of the recruiter summary. Set to "" to hide it.
export const AVAILABILITY = "Open to new opportunities";

export const SOCIAL = {
  linkedin:
    "https://www.linkedin.com/in/jonathan-oliver-92056496/?originalSubdomain=uk",
  github: "https://github.com/jonooliver",
};
