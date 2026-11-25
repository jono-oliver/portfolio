// Fields are in the order they appear on the article page (DetailHeader then
// the body), with the card image, which only shows on the blog list, last
export default {
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    {
      name: "articleTitle",
      title: "Article Title",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "articleTitle",
        maxLength: 96,
      },
    },
    {
      name: "articleTags",
      title: "Article Tags",
      description:
        "Shown under “Tags” on the article page. For topics that aren't technologies (pick those under Article Tech Stack).",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "articleTechStack",
      title: "Article Tech Stack",
      description:
        "Shown on the blog card and used for the technology filter on the blog list. Pick technologies: each one's icon is set once on the Technology and shown wherever it's used.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "technology" }] }],
    },
    {
      name: "articleExcerpt",
      title: "Article Excerpt",
      description:
        "Shown under “Overview” on the article page, on the blog list and as the page's search description.",
      type: "string",
    },
    {
      name: "articleImage",
      title: "Article Image",
      description:
        "The large image under the overview on the article page, and the image used when the page is shared. Also used on the blog list card when no card image is set.",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "articleDescription",
      type: "array",
      title: "Content",
      of: [
        { type: "block" },
        {
          type: "image",
          options: {
            hotspot: true, // Enables cropping
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Alternative text",
              description: "Important for SEO and accessibility.",
            },
            {
              name: "caption",
              type: "string",
              title: "Caption",
            },
          ],
        },
        {
          type: "code",
          options: {
            language: "javascript",
            languageAlternatives: [
              { title: "JavaScript", value: "javascript" },
              { title: "HTML", value: "html" },
              { title: "CSS", value: "css" },
              { title: "JSON", value: "json" },
            ],
          },
        },
      ],
    },
    {
      name: "articleCardImage",
      title: "Article Card Image",
      description:
        "Optional. A version cropped or framed for the blog list card. Leave empty to use the article image. Sizing is automatic, so there's no need to upload a smaller copy.",
      type: "image",
      options: {
        hotspot: true,
      },
    },
  ],
};
