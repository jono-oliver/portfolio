// One-off: points project and article tech stacks at one Technology for each
// pair of near-duplicates, keeping the order and dropping repeats. The
// duplicates are left unused: delete them in /admin afterwards (the Studio
// confirms nothing references them).
//
//   npx sanity migration run merge-duplicate-technologies               (dry run)
//   npx sanity migration run merge-duplicate-technologies --no-dry-run  (for real)
import { at, defineMigration, set } from "sanity/migrate";

// Duplicate Technology id -> the one to keep
const MERGE = {
  "technology-vue3": "technology-vue", // Vue3 -> Vue
  "technology-shadcn": "technology-shadcn-ui", // ShadCN -> ShadCN UI
  "technology-gemini-api": "technology-gemini-ai", // Gemini API -> Gemini AI
};

const FIELDS = { portfolio: "projectTechStack", article: "articleTechStack" };

export default defineMigration({
  title: "Merge near-duplicate Technologies",
  documentTypes: Object.keys(FIELDS),
  migrate: {
    document(doc) {
      const field = FIELDS[doc._type];
      const stack = doc[field];
      if (!Array.isArray(stack)) return;
      if (!stack.some((item) => MERGE[item?._ref])) return;

      const seen = new Set();
      const merged = stack
        .map((item) =>
          MERGE[item?._ref] ? { ...item, _ref: MERGE[item._ref] } : item,
        )
        .filter((item) => {
          const key = item?._ref ?? item;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      return at(field, set(merged));
    },
  },
});
