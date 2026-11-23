// Markdown version of a project for agents: /portfolio/<slug>.md
import type { APIRoute, GetStaticPaths } from "astro";
import { getProjects } from "../../sanity/useSanityHelper";
import { markdownResponse, projectToMarkdown } from "../../lib/markdown";

export const getStaticPaths = (async () => {
  const projects = await getProjects();
  return projects.map((project: any) => ({
    params: { slug: project.slug.current },
    props: { project },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  markdownResponse(projectToMarkdown(props.project));
