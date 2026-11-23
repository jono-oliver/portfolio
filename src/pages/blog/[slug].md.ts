// Markdown version of a blog post for agents: /blog/<slug>.md
import type { APIRoute, GetStaticPaths } from "astro";
import { getArticles } from "../../sanity/useSanityHelper";
import { articleToMarkdown, markdownResponse } from "../../lib/markdown";

export const getStaticPaths = (async () => {
  const articles = await getArticles();
  return articles.map((article: any) => ({
    params: { slug: article.slug.current },
    props: { article },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
  markdownResponse(articleToMarkdown(props.article));
