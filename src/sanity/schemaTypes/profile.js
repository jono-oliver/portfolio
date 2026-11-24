// Fields are in the order they appear in the home page hero (HeroProfile),
// with fields that aren't shown on the page last
export default {
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      description: "The large heading in the hero, and used in page titles.",
      type: "string",
    },
    {
      name: "jobRole",
      title: "Job Role",
      description: "Shown under your name, and used in every page title.",
      type: "string",
    },
    {
      name: "highlights",
      title: "Highlights",
      description:
        "Up to three focus areas under the job role, also used in the recruiter summary. Leave empty to use the defaults in src/data/profile.ts.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.max(3),
    },
    {
      name: "bio",
      title: "Bio",
      description:
        "The first sentence is shown larger, with the rest underneath.",
      type: "text", // Text field for longer descriptions
    },
    {
      name: "resume",
      title: "Resume",
      description: "The PDF behind the “Download CV” button.",
      type: "file",
    },
    {
      name: "contactEmail",
      title: "Contact Email",
      description:
        "Used by the “Get in touch” button, the footer and the recruiter summary.",
      type: "string",
      validation: (Rule) =>
        Rule.email().error("Please enter a valid email address"),
    },
    {
      name: "profilePicture",
      title: "Profile Picture",
      description:
        "The hero portrait, cropped to 4:5. Set a hotspot to choose the focal point.",
      type: "image",
      options: {
        hotspot: true, // Allows for crop and focal point selection in Studio
      },
    },
    {
      name: "skills",
      title: "Skills",
      description: "The scrolling marquee and skills grid below the hero.",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "seoDescription",
      title: "SEO Description",
      description:
        "Shown in search results and link previews for the home page. Aim for 150–160 characters. Leave empty to use the first sentence of the bio.",
      type: "text",
      rows: 3,
      validation: (Rule) =>
        Rule.max(160).warning(
          "Search engines usually cut off after 160 characters",
        ),
    },
    {
      name: "contactPhone",
      title: "Contact Phone",
      description: "Not currently shown on the site.",
      type: "string",
    },
  ],
};
