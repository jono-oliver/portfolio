// Markdown version of the home page for agents: /index.md
import type { APIRoute } from "astro";
import {
  getProfile,
  getProjects,
  getResumeUrl,
  getTestimonials,
} from "../sanity/useSanityHelper";
import { homeToMarkdown, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async () => {
  const [profile, projects, testimonials] = await Promise.all([
    getProfile(),
    getProjects(),
    getTestimonials(),
  ]);
  const cvUrl = await getResumeUrl(profile);
  // Same five projects as FeaturedPortfolio on the home page
  return markdownResponse(
    homeToMarkdown(profile, cvUrl, projects.slice(0, 5), testimonials),
  );
};
