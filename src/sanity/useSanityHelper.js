import { sanityClient } from "sanity:client";
import imageUrlBuilder from "@sanity/image-url";

const builder = imageUrlBuilder(sanityClient);

export async function getProjects() {
  return await sanityClient.fetch(`*[_type == "portfolio"] | order(_createdAt desc)`);
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
  return await sanityClient.fetch(`*[_type == "article"] | order(_createdAt desc)`);
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

export function urlFor(source) {
  return builder.image(source);
}
