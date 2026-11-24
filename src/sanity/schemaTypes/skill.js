// One skill on the profile: a name plus an optional icon (see iconFields.js)
import { iconFields, iconPreview } from "./iconFields";

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
    ...iconFields,
  ],
  preview: iconPreview,
};
