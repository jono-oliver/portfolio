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
      description:
        "Shown under “Stack” on the project page and on its card. Pick technologies: each one's icon is set once on the Technology and shown wherever it's used.",
      type: "array",
      of: [{ type: "reference", to: [{ type: "technology" }] }],
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
      name: "projectTldr",
      title: "TL;DR",
      description:
        "Optional. A short version of the case study for readers in a hurry. When filled in, the project page gets a Full read / TL;DR toggle, and the TL;DR is added to the page's markdown version.",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        {
          name: "problem",
          title: "Problem",
          description: "The problem or brief, in a sentence or two.",
          type: "text",
          rows: 2,
        },
        {
          name: "built",
          title: "What I built",
          description: "Three to five short bullets.",
          type: "array",
          of: [{ type: "string" }],
          validation: (Rule) =>
            Rule.max(5).warning("Keep it to five bullets or fewer."),
        },
        {
          name: "outcome",
          title: "Outcome",
          description: "The result or impact.",
          type: "text",
          rows: 2,
        },
      ],
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
