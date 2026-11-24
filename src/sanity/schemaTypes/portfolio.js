// Fields are in the order they appear on the project page (DetailHeader then
// the body), with the card image, which only shows on list cards, last
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
      name: "projectTechStack",
      title: "Project Tech Stack",
      description: "Shown under “Stack” on the project page and on its card.",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "projectExcerpt",
      title: "Project Excerpt",
      description:
        "Shown under “Overview” on the project page, on its card and as the page's search description.",
      type: "string",
    },
    {
      name: "projectImage",
      title: "Project Image",
      description:
        "The large image under the overview on the project page, and the image used when the page is shared. Also used on cards when no card image is set.",
      type: "image",
      options: {
        hotspot: true,
      },
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
      name: "projectCardImage",
      title: "Project Card Image",
      description:
        "Optional. A version cropped or framed for list cards (home page, Work list). Leave empty to use the project image. Sizing is automatic, so there's no need to upload a smaller copy.",
      type: "image",
      options: {
        hotspot: true,
      },
    },
  ],
};
