// /llms-full.txt: the whole site as one markdown file, for agents that want
// everything in a single fetch.
import type { APIRoute } from "astro";
import {
  getArticles,
  getProfile,
  getProjects,
  getResumeUrl,
} from "../sanity/useSanityHelper";
import {
  articleToMarkdown,
  profileToMarkdown,
  projectToMarkdown,
} from "../lib/markdown";

// Demote headings one level so each section nests under its group heading
const nest = (md: string) => md.replace(/^(#+) /gm, "#$1 ");

export const GET: APIRoute = async () => {
  const [profile, projects, articles] = await Promise.all([
    getProfile(),
    getProjects(),
    getArticles(),
  ]);
  const cvUrl = await getResumeUrl(profile);

  const sections = [
    profileToMarkdown(profile, cvUrl),
    `# Portfolio\n\n${projects.map((p: any) => nest(projectToMarkdown(p))).join("\n---\n\n")}`,
    `# Blog\n\n${articles.map((a: any) => nest(articleToMarkdown(a))).join("\n---\n\n")}`,
  ];

  return new Response(sections.join("\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
