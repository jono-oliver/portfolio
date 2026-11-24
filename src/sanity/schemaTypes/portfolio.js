export default {
  name: "portfolio",
  title: "Portfolio",
  type: "document",
  fields: [
    {
      name: "projectTitle",
      title: "Project Title",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "projectTitle",
        maxLength: 96,
      },
    },
    {
      name: "projectExcerpt",
      title: "Project Excerpt",
      type: "string",
    },
    {
      name: "projectDescription",
      title: "Project Description",
      type: "array",
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
      name: "projectImage",
      title: "Project Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "projectCardImage",
      title: "Project Card Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "projectTechStack",
      title: "Project Tech Stack",
      type: "array",
      of: [{ type: "string" }],
    },
  ],
};
