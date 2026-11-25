// Technology filters for the Work and Blog listings. Items carry `techStack`
// as { name, slug, iconDataUri } (see withTechStack in useSanityHelper.js).

export interface TechItem {
  name: string;
  slug: string;
  iconDataUri: string | null;
}

export interface TechFilterOption extends TechItem {
  count: number;
}

// URL-safe slug for a technology name ("Next.js" -> "next-js"). Same rule as
// the tech-stack-to-references migration.
export const techSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Technologies used by at least one item, most used first, then by name
export function techFilters(
  items: { techStack?: TechItem[] }[],
): TechFilterOption[] {
  const bySlug = new Map<string, TechFilterOption>();
  for (const item of items) {
    // Count each technology once per item
    const seen = new Set<string>();
    for (const tech of item.techStack ?? []) {
      if (!tech.slug || seen.has(tech.slug)) continue;
      seen.add(tech.slug);
      const existing = bySlug.get(tech.slug);
      if (existing) existing.count++;
      else bySlug.set(tech.slug, { ...tech, count: 1 });
    }
  }
  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );
}

// Items whose tech stack includes the technology with this slug
export const withTech = <T extends { techStack?: TechItem[] }>(
  items: T[],
  slug: string,
) => items.filter((item) => item.techStack?.some((t) => t.slug === slug));
