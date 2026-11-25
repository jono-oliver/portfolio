// /api/profile.json: structured CV data for agents and recruiter tools.
// Built at build time from the same Sanity content as the site.
import type { APIRoute } from "astro";
import {
  getArticles,
  getProfile,
  getProjects,
  getResumeUrl,
  getTestimonials,
} from "../../sanity/useSanityHelper";
import {
  AVAILABILITY,
  SOCIAL,
  getHighlights,
  skillNames,
  splitBio,
} from "../../data/profile";
import { SITE_URL } from "../../data/site";
import {
  articleMarkdownUrl,
  articleUrl,
  projectMarkdownUrl,
  projectUrl,
} from "../../lib/markdown";

export const GET: APIRoute = async () => {
  const [profile, projects, articles, testimonials] = await Promise.all([
    getProfile(),
    getProjects(),
    getArticles(),
    getTestimonials(),
  ]);

  const data = {
    name: profile.name,
    jobTitle: profile.jobRole,
    availability: AVAILABILITY || null,
    summary: splitBio(profile.bio).lead,
    bio: profile.bio,
    highlights: getHighlights(profile).map((h) => h.full),
    skills: skillNames(profile),
    contact: {
      email: profile.contactEmail ?? null,
      linkedin: SOCIAL.linkedin,
      github: SOCIAL.github,
      website: SITE_URL,
    },
    cv: await getResumeUrl(profile),
    projects: projects.map((p: any) => ({
      title: p.projectTitle,
      excerpt: p.projectExcerpt?.trim() ?? null,
      stack: p.projectTechStack ?? [],
      url: projectUrl(p.slug.current),
      markdown: projectMarkdownUrl(p.slug.current),
    })),
    articles: articles.map((a: any) => ({
      title: a.articleTitle,
      excerpt: a.articleExcerpt?.trim() ?? null,
      tags: a.articleTags ?? [],
      published: a._createdAt ?? null,
      url: articleUrl(a.slug.current),
      markdown: articleMarkdownUrl(a.slug.current),
    })),
    testimonials: testimonials.map((t: any) => ({
      quote: t.quote.trim(),
      name: t.name.trim(),
      role: t.role?.trim() || null,
      company: t.company?.trim() || null,
    })),
    generatedAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
