// A technology used in projects' tech stacks. Shared between projects, so its
// icon is set once and shown wherever it's used (see iconFields.js).
import { iconFields, iconPreview } from "./iconFields";

export default {
  name: "technology",
  title: "Technology",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      description: "As it should appear on the tech stack pills.",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    ...iconFields,
  ],
  orderings: [
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
  preview: iconPreview,
};
