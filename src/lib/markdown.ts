// Markdown versions of the site's content for agents: used by the per-page
// .md endpoints, /llms.txt and /llms-full.txt.

import { portableTextToMarkdown } from "@portabletext/markdown";
import { urlFor } from "../sanity/useSanityHelper";
import {
  AVAILABILITY,
  SOCIAL,
  getHighlights,
  skillNames,
} from "../data/profile";
import { absoluteUrl } from "../data/site";

// Canonical HTML URLs end in "/" (matching the sitemap); markdown ones in ".md"
export const projectUrl = (slug: string) => absoluteUrl(`/portfolio/${slug}/`);
export const articleUrl = (slug: string) => absoluteUrl(`/blog/${slug}/`);
export const projectMarkdownUrl = (slug: string) =>
  absoluteUrl(`/portfolio/${slug}.md`);
export const articleMarkdownUrl = (slug: string) =>
  absoluteUrl(`/blog/${slug}.md`);
export const homeMarkdownUrl = () => absoluteUrl("/index.md");

// Portable Text body -> markdown. Sanity images become absolute image links;
// code blocks ({ language, code }) are handled by the library's defaults.
export function toMarkdown(blocks: any[] | undefined): string {
  if (!blocks?.length) return "";
  return portableTextToMarkdown(blocks, {
    types: {
      image: ({ value }: { value: any }) => {
        if (!value?.asset) return "";
        const src = urlFor(value).width(1200).auto("format").url();
        return `![${value.alt ?? ""}](${src})`;
      },
    },
  } as any).trim();
}

const metaLine = (parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join("  \n");

const formatDate = (iso?: string) => iso?.slice(0, 10);

export function projectToMarkdown(project: any): string {
  const url = projectUrl(project.slug.current);
  return [
    `# ${project.projectTitle}`,
    project.projectExcerpt?.trim() && `> ${project.projectExcerpt.trim()}`,
    metaLine([
      `URL: ${url}`,
      project.projectTechStack?.length &&
        `Stack: ${project.projectTechStack.join(", ")}`,
      project._createdAt && `Published: ${formatDate(project._createdAt)}`,
    ]),
    toMarkdown(project.projectDescription),
  ]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

export function articleToMarkdown(article: any): string {
  const url = articleUrl(article.slug.current);
  return [
    `# ${article.articleTitle}`,
    article.articleExcerpt?.trim() && `> ${article.articleExcerpt.trim()}`,
    metaLine([
      `URL: ${url}`,
      article.articleTags?.length && `Tags: ${article.articleTags.join(", ")}`,
      article._createdAt && `Published: ${formatDate(article._createdAt)}`,
    ]),
    toMarkdown(article.articleDescription),
  ]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

export function profileToMarkdown(profile: any, cvUrl: string | null): string {
  const highlights = getHighlights(profile).map((h) => `- ${h.full}`);
  const contact = [
    profile.contactEmail && `- Email: ${profile.contactEmail}`,
    `- LinkedIn: ${SOCIAL.linkedin}`,
    `- GitHub: ${SOCIAL.github}`,
    cvUrl && `- CV (PDF): ${cvUrl}`,
  ].filter(Boolean);

  return [
    `# ${profile.name}`,
    `> ${profile.jobRole}`,
    AVAILABILITY && `Availability: ${AVAILABILITY}`,
    profile.bio,
    `## Focus areas\n\n${highlights.join("\n")}`,
    skillNames(profile).length &&
      `## Skills\n\n${skillNames(profile).join(", ")}`,
    `## Contact\n\n${contact.join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

// Home page: the profile plus the recent projects the page features, with
// links to each project's markdown version.
export function homeToMarkdown(
  profile: any,
  cvUrl: string | null,
  projects: any[],
): string {
  const recent = projects.map((p) => {
    const excerpt = p.projectExcerpt?.trim();
    return `- [${p.projectTitle}](${projectMarkdownUrl(p.slug.current)})${excerpt ? `: ${excerpt}` : ""}`;
  });
  return [
    profileToMarkdown(profile, cvUrl).trimEnd(),
    recent.length && `## Recent projects\n\n${recent.join("\n")}`,
    `## More\n\n${[
      `- [All projects](${absoluteUrl("/portfolio/")})`,
      `- [Blog](${absoluteUrl("/blog/")})`,
      `- [Site index for agents](${absoluteUrl("/llms.txt")})`,
    ].join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

export const markdownResponse = (body: string) =>
  new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
