// Shared profile helpers used by the hero and the recruiter summary.

export type Highlight = { full: string };

// Focus areas shown beneath the job role, with the same wording at every
// size. Uses `highlights` from the Sanity profile if present, otherwise
// these defaults.
export function getHighlights(profile: { highlights?: string[] }): Highlight[] {
  return profile.highlights?.length
    ? profile.highlights.slice(0, 3).map((h) => ({ full: h }))
    : [
        { full: "Front end specialist" },
        { full: "AI Product Engineer" },
        { full: "Performance & accessibility" },
      ];
}

// A skill is a plain string (before the skills-to-objects migration) or a
// skill object from the Studio. These read either shape.
export type SkillInput = string | { name?: string; [key: string]: any };

export const skillName = (skill: SkillInput): string =>
  (typeof skill === "string" ? skill : (skill?.name ?? "")).trim();

export function skillNames(profile: { skills?: SkillInput[] }): string[] {
  return (profile.skills ?? []).map(skillName).filter(Boolean);
}

// Splits the bio into an emphasised lead sentence and the supporting rest
export function splitBio(bio = ""): { lead: string; rest: string } {
  const match = bio.trim().match(/^(.+?[.!?])\s+([\s\S]+)$/);
  return match ? { lead: match[1], rest: match[2] } : { lead: bio, rest: "" };
}

// Home page meta description: the profile's SEO description if set,
// otherwise the bio's lead sentence
export function getSeoDescription(profile: {
  seoDescription?: string;
  bio?: string;
}): string {
  return profile.seoDescription?.trim() || splitBio(profile.bio).lead;
}

// Shown at the top of the recruiter summary. Set to "" to hide it.
export const AVAILABILITY = "Open to new opportunities";

export const SOCIAL = {
  linkedin:
    "https://www.linkedin.com/in/jonathan-oliver-92056496/?originalSubdomain=uk",
  github: "https://github.com/jonooliver",
};
