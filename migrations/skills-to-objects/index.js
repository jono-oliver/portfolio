// One-off: turns the profile's skills from plain strings into skill objects
// ({ _type: "skill", name }), keeping their order.
//
//   npx sanity migration run skills-to-objects               (dry run)
//   npx sanity migration run skills-to-objects --no-dry-run  (for real)
import { at, defineMigration, set } from "sanity/migrate";

const randomKey = () => Math.random().toString(36).slice(2, 14);

export default defineMigration({
  title: "Turn profile skills into skill objects",
  documentTypes: ["profile"],
  migrate: {
    document(doc) {
      if (!Array.isArray(doc.skills)) return;
      if (!doc.skills.some((skill) => typeof skill === "string")) return;

      return at(
        "skills",
        set(
          doc.skills.map((skill) =>
            typeof skill === "string"
              ? { _type: "skill", _key: randomKey(), name: skill }
              : skill,
          ),
        ),
      );
    },
  },
});
