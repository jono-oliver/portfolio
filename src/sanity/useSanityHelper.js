import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";
import { skillName } from "../data/profile";

const builder = imageUrlBuilder(sanityClient);

// Tech stack items are references to Technology documents (or plain strings
// before the tech-stack-to-references migration). This resolves the
// references alongside the raw list, item for item.
const PROJECT_FIELDS = `{
  ...,
  "techStackResolved": projectTechStack[]->{ name, icon, customIcon }
}`;

export async function getProjects() {
  const projects = await sanityClient.fetch(
    `*[_type == "portfolio"] | order(_createdAt desc) ${PROJECT_FIELDS}`,
  );
  return Promise.all(projects.map(withTechStack));
}

export async function getProject(slug) {
  const project = await sanityClient.fetch(
    `*[_type == "portfolio" && slug.current == $slug][0] ${PROJECT_FIELDS}`,
    {
      slug,
    },
  );
  return project && withTechStack(project);
}

// Gives a project `projectTechStack` as plain names (for text, JSON-LD and
// markdown) and `techStack` as { name, iconDataUri } (for the pills)
async function withTechStack(project) {
  const { techStackResolved = [], ...rest } = project;
  const items = (project.projectTechStack ?? [])
    .map((item, i) =>
      typeof item === "string" ? { name: item } : techStackResolved?.[i],
    )
    .filter((item) => item?.name?.trim());
  const techStack = await Promise.all(
    items.map(async (item) => ({
      name: item.name.trim(),
      iconDataUri: await iconDataUriFor(item),
    })),
  );
  return {
    ...rest,
    projectTechStack: techStack.map((item) => item.name),
    techStack,
  };
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

// An item's icon (skill or technology) as a data: URI, or null, for
// SkillIcon.astro. An uploaded SVG wins over a picked icon
// (icon.metadata.inlineSvg). A failed fetch means no icon, not a failed build.
export async function iconDataUriFor(item) {
  if (!item || typeof item === "string") return null;
  let svg = null;
  if (item.customIcon?.asset) {
    svg = await fetchSvg(urlFor(item.customIcon).url());
  }
  svg ??= item.icon?.metadata?.inlineSvg ?? null;
  return toDataUri(svg);
}

// Skills with their icon as a data: URI (or null)
export async function getSkillsWithIcons(profile) {
  const skills = profile?.skills ?? [];
  const resolved = await Promise.all(
    skills.map(async (skill) => {
      const name = skillName(skill);
      if (!name) return null;
      return { name, iconDataUri: await iconDataUriFor(skill) };
    }),
  );
  return resolved.filter(Boolean);
}
