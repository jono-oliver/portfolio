// A quote from someone Jono has worked with. Shown in the Testimonials
// slider on the home page (src/components/Testimonials.astro), newest first.
export default {
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    {
      name: "quote",
      title: "Quote",
      description:
        "Without quotation marks, which the site adds. Keep it short so it reads well on a phone.",
      type: "text",
      rows: 4,
      validation: (Rule) => [
        Rule.required(),
        Rule.max(320).warning(
          "Long quotes make the slider tall on phones. Try to keep it under 320 characters.",
        ),
      ],
    },
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "role",
      title: "Role",
      description: "Optional, e.g. “Head of Digital”.",
      type: "string",
    },
    {
      name: "company",
      title: "Company",
      description: "Optional.",
      type: "string",
    },
  ],
  orderings: [
    {
      title: "Newest first",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "name", role: "role", company: "company" },
    prepare: ({ title, role, company }) => ({
      title,
      subtitle: [role, company].filter(Boolean).join(" · "),
    }),
  },
};
