// One skill on the profile: a name plus an optional icon. Icons are drawn in
// the text colour on the site (see SkillIcon.astro), so colours in the SVG
// are ignored.
import { mediaPreview } from "sanity-plugin-icon-manager";

export default {
  name: "skill",
  title: "Skill",
  type: "object",
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    },
    {
      name: "icon",
      title: "Icon",
      description:
        "Optional. Search the icon libraries (Simple Icons for tech logos, Devicon, Lucide, Material Design Icons).",
      type: "icon.manager",
    },
    {
      name: "customIcon",
      title: "Custom Icon",
      description:
        "Optional. Upload an SVG when the libraries have no suitable icon. This takes priority over the picked icon. Use a simple single-colour shape: it's shown in the text colour, so its own colours are ignored.",
      type: "image",
      options: {
        accept: "image/svg+xml",
      },
    },
  ],
  preview: {
    select: {
      title: "name",
      icon: "icon",
      customIcon: "customIcon",
    },
    prepare: ({ title, icon, customIcon }) => ({
      title,
      media: customIcon ?? (icon?.icon ? mediaPreview(icon) : undefined),
    }),
  },
};
