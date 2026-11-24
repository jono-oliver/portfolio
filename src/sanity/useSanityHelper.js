import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
import { skillName } from "../data/profile";

const builder = imageUrlBuilder(sanityClient);

export async function getProjects() {
  return await sanityClient.fetch(
    `*[_type == "portfolio"] | order(_createdAt desc)`,
  );
}

export async function getProject(slug) {
  return await sanityClient.fetch(
    `*[_type == "portfolio" && slug.current == $slug][0]`,
    {
      slug,
    },
  );
}

export async function getArticles() {
  return await sanityClient.fetch(
    `*[_type == "article"] | order(_createdAt desc)`,
  );
}

export async function getArticle(slug) {
  return await sanityClient.fetch(
    `*[_type == "article" && slug.current == $slug][0]`,
    {
      slug,
    },
  );
}

export async function getProfile() {
  return await sanityClient.fetch(`*[_type == "profile"][0]`);
}

// Public URL of the CV PDF attached to the profile, or null if there isn't one
export async function getResumeUrl(profile) {
  const ref = profile?.resume?.asset?._ref;
  if (!ref) return null;
  const asset = await sanityClient.getDocument(ref);
  return asset?.url ?? null;
}

export function urlFor(source) {
  return builder.image(source);
}

// Uploaded SVGs, fetched once per build
const svgCache = new Map();
async function fetchSvg(url) {
  if (!svgCache.has(url)) {
    svgCache.set(
      url,
      fetch(url)
        .then((res) => (res.ok ? res.text() : null))
        .catch(() => null),
    );
  }
  return svgCache.get(url);
}

const toDataUri = (svg) =>
  svg?.includes("<svg")
    ? `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
    : null;

// Skills with their icon as a data: URI (or null), for SkillIcon.astro.
// An uploaded SVG wins over a picked icon (icon.metadata.inlineSvg). A failed
// fetch leaves that skill without an icon rather than failing the build.
export async function getSkillsWithIcons(profile) {
  const skills = profile?.skills ?? [];
  const resolved = await Promise.all(
    skills.map(async (skill) => {
      const name = skillName(skill);
      if (!name) return null;
      if (typeof skill === "string") return { name, iconDataUri: null };

      let svg = null;
      if (skill.customIcon?.asset) {
        svg = await fetchSvg(urlFor(skill.customIcon).url());
      }
      svg ??= skill.icon?.metadata?.inlineSvg ?? null;
      return { name, iconDataUri: toDataUri(svg) };
    }),
  );
  return resolved.filter(Boolean);
}
