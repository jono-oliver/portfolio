// Icon fields shared by skills and technologies. Icons are drawn in the text
// colour on the site (see SkillIcon.astro), so colours in the SVG are ignored.
// The data helpers read them with iconDataUriFor() in useSanityHelper.js.
import { mediaPreview } from "sanity-plugin-icon-manager";

export const iconFields = [
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
];

// List preview: the name, with the uploaded SVG or the picked icon
export const iconPreview = {
  select: {
    title: "name",
    icon: "icon",
    customIcon: "customIcon",
  },
  prepare: ({ title, icon, customIcon }) => ({
    title,
    media: customIcon ?? (icon?.icon ? mediaPreview(icon) : undefined),
  }),
};
