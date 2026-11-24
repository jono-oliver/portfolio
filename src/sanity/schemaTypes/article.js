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
      name: "articleExcerpt",
      title: "Article Excerpt",
      type: "string",
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
      name: "articleImage",
      title: "Article Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "articleCardImage",
      title: "Article Card Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "articleTags",
      title: "Article Tags",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
};
