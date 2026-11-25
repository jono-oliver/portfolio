// JSON-LD builders. Each returns a plain schema.org object that Layout.astro
// renders into <script type="application/ld+json">. Everything points back to
// one Person (PERSON_ID) so agents can tie the pages to their author.

import { SOCIAL, getHighlights, skillNames, splitBio } from "../data/profile";
import { urlFor } from "../sanity/useSanityHelper";
import {
  OG_IMAGE,
  PERSON_ID,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "../data/site";
import { articleTldrText, projectTldrText } from "./tldr";

const CONTEXT = "https://schema.org";
const personRef = { "@id": PERSON_ID };

export function personSchema(profile: any) {
  const highlights = getHighlights(profile).map((h) => h.full);
  return {
    "@context": CONTEXT,
    "@type": "Person",
    "@id": PERSON_ID,
    name: profile.name,
    jobTitle: profile.jobRole,
    description: splitBio(profile.bio).lead || undefined,
    url: SITE_URL,
    email: profile.contactEmail ? `mailto:${profile.contactEmail}` : undefined,
    // The Sanity portrait, falling back to the share image
    image: profile.profilePicture?.asset
      ? urlFor(profile.profilePicture).width(800).auto("format").url()
      : OG_IMAGE,
    sameAs: [SOCIAL.linkedin, SOCIAL.github],
    knowsAbout: [...highlights, ...skillNames(profile)],
  };
}

export function websiteSchema() {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-GB",
    author: personRef,
    publisher: personRef,
  };
}

export function blogPostingSchema(
  article: any,
  url: string,
  imageUrl?: string,
) {
  return {
    "@context": CONTEXT,
    "@type": "BlogPosting",
    headline: article.articleTitle,
    description: article.articleExcerpt,
    abstract: articleTldrText(article) || undefined,
    image: imageUrl,
    datePublished: article._createdAt,
    dateModified: article._updatedAt ?? article._createdAt,
    keywords:
      [
        ...(article.articleTechStack ?? []),
        ...(article.articleTags ?? []),
      ].join(", ") || undefined,
    url,
    mainEntityOfPage: url,
    inLanguage: "en-GB",
    author: personRef,
    publisher: personRef,
  };
}

export function projectSchema(project: any, url: string, imageUrl?: string) {
  return {
    "@context": CONTEXT,
    "@type": "CreativeWork",
    name: project.projectTitle,
    description: project.projectExcerpt,
    abstract: projectTldrText(project) || undefined,
    image: imageUrl,
    dateCreated: project._createdAt,
    dateModified: project._updatedAt ?? project._createdAt,
    keywords: project.projectTechStack?.join(", "),
    url,
    mainEntityOfPage: url,
    inLanguage: "en-GB",
    creator: personRef,
    author: personRef,
  };
}

// items: [{ name, path }] in order, starting after Home
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
