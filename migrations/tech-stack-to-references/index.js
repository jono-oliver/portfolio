// One-off: turns each project's tech stack from plain strings into references
// to shared Technology documents, keeping the order. Names that differ only in
// capitals share one Technology (spelled as in PREFERRED). Similar names, such
// as "Vue" and "Vue3", stay separate: merge them in /admin if you want.
//
//   npx sanity migration run tech-stack-to-references               (dry run)
//   npx sanity migration run tech-stack-to-references --no-dry-run  (for real)
import { at, createIfNotExists, defineMigration, set } from "sanity/migrate";

const PREFERRED = {
  typescript: "TypeScript",
};

const randomKey = () => Math.random().toString(36).slice(2, 14);

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default defineMigration({
  title: "Turn project tech stacks into Technology references",
  documentTypes: ["portfolio"],
  migrate: {
    document(doc) {
      const stack = doc.projectTechStack;
      if (!Array.isArray(stack)) return;
      if (!stack.some((item) => typeof item === "string")) return;

      const creates = new Map();
      const references = stack.map((item) => {
        if (typeof item !== "string") return item;

        const name = PREFERRED[item.trim().toLowerCase()] ?? item.trim();
        const _id = `technology-${slugify(name)}`;
        if (!creates.has(_id))
          creates.set(
            _id,
            createIfNotExists({ _id, _type: "technology", name }),
          );
        return { _type: "reference", _ref: _id, _key: randomKey() };
      });

      return [...creates.values(), at("projectTechStack", set(references))];
    },
  },
});
