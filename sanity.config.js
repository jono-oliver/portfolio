import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { codeInput } from "@sanity/code-input";
import { IconManager } from "sanity-plugin-icon-manager";
import { schemaTypes } from "./src/sanity/schemaTypes";

// The site reads the first profile it finds (getProfile in src/sanity/useSanityHelper.js),
// so the Studio keeps profile to this one document
const PROFILE_ID = "528e3c7e-069d-43b0-9b29-3f3b5dee14f9";

// Embedded at /admin by @sanity/astro (see studioBasePath in astro.config.mjs)
export default defineConfig({
  name: "default",
  title: "Portfolio",

  projectId: "8d98wy85",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Profile")
              .id("profile")
              .child(S.document().schemaType("profile").documentId(PROFILE_ID)),
            ...S.documentTypeListItems().filter(
              (item) => item.getId() !== "profile",
            ),
          ]),
    }),
    visionTool(),
    codeInput(),
    // Icon picker for skills. A plain search (keepItSimpleFor) because the
    // site ignores colour, size and rotation: icons take the text colour.
    // The SVG is stored on the skill, so the site never calls Iconify.
    IconManager({
      keepItSimpleFor: "all",
      availableCollections: ["simple-icons", "devicon-plain", "lucide", "mdi"],
      defaults: { inlineSvg: true },
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    // No "new profile" in the global create menu
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global"
        ? prev.filter((template) => template.templateId !== "profile")
        : prev,
    // No duplicating, deleting or unpublishing the profile
    actions: (prev, { schemaType }) =>
      schemaType === "profile"
        ? prev.filter(
            ({ action }) =>
              !["duplicate", "delete", "unpublish"].includes(action),
          )
        : prev,
  },
});
