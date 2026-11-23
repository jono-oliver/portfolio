// /llms.txt: a markdown index of the site for LLMs and agents (llmstxt.org).
// Links point at the markdown version of each page.
import type { APIRoute } from "astro";
import {
  getArticles,
  getProfile,
  getProjects,
  getResumeUrl,
} from "../sanity/useSanityHelper";
import { splitBio } from "../data/profile";
import { absoluteUrl } from "../data/site";
import { articleMarkdownUrl, projectMarkdownUrl } from "../lib/markdown";

const entry = (title: string, url: string, excerpt?: string) =>
  `- [${title}](${url})${excerpt?.trim() ? `: ${excerpt.trim()}` : ""}`;

export const GET: APIRoute = async () => {
  const [profile, projects, articles] = await Promise.all([
    getProfile(),
    getProjects(),
    getArticles(),
  ]);
  const cvUrl = await getResumeUrl(profile);
  const { lead, rest } = splitBio(profile.bio);

  const optional = [
    `- [Full site content](${absoluteUrl("/llms-full.txt")}): profile, every project and every article in one file`,
    `- [Profile JSON](${absoluteUrl("/api/profile.json")}): structured CV data (skills, contact, projects, articles)`,
    cvUrl && `- [CV (PDF)](${cvUrl})`,
    `- [Sitemap](${absoluteUrl("/sitemap-index.xml")})`,
  ].filter(Boolean);

  const body = [
    `# ${profile.name}`,
    `> ${profile.jobRole}. ${lead}`,
    rest,
    `Every page on ${absoluteUrl("/")} has a markdown version: add \`.md\` to a project or blog post URL.`,
    `## Portfolio\n\n${projects
      .map((p: any) =>
        entry(
          p.projectTitle,
          projectMarkdownUrl(p.slug.current),
          p.projectExcerpt,
        ),
      )
      .join("\n")}`,
    `## Blog\n\n${articles
      .map((a: any) =>
        entry(
          a.articleTitle,
          articleMarkdownUrl(a.slug.current),
          a.articleExcerpt,
        ),
      )
      .join("\n")}`,
    `## Optional\n\n${optional.join("\n")}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  return new Response(`${body}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
