// Markdown version of the home page for agents: /index.md
import type { APIRoute } from "astro";
import {
  getProfile,
  getProjects,
  getResumeUrl,
} from "../sanity/useSanityHelper";
import { homeToMarkdown, markdownResponse } from "../lib/markdown";

export const GET: APIRoute = async () => {
  const [profile, projects] = await Promise.all([getProfile(), getProjects()]);
  const cvUrl = await getResumeUrl(profile);
  // Same five projects as FeaturedPortfolio on the home page
  return markdownResponse(homeToMarkdown(profile, cvUrl, projects.slice(0, 5)));
};
