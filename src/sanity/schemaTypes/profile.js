export default {
  name: "profile",
  title: "Profile",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "jobRole",
      title: "Job Role",
      type: "string",
    },
    {
      name: "bio",
      title: "Bio",
      type: "text", // Text field for longer descriptions
    },
    {
      name: "contactEmail",
      title: "Contact Email",
      type: "string",
      validation: (Rule) =>
        Rule.email().error("Please enter a valid email address"),
    },
    {
      name: "contactPhone",
      title: "Contact Phone",
      type: "string",
    },
    {
      name: "profilePicture",
      title: "Profile Picture",
      type: "image",
      options: {
        hotspot: true, // Allows for crop and focal point selection in Studio
      },
    },
    {
      name: "resume",
      title: "Resume",
      type: "file",
    },
    {
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "highlights",
      title: "Highlights",
      description:
        "Up to three focus areas for the hero and recruiter summary. Leave empty to use the defaults in src/data/profile.ts.",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.max(3),
    },
  ],
};
