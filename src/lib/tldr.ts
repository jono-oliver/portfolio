// TL;DR helpers for project and article pages: whether a document has one,
// reading times for the toggle, and plain text for the JSON-LD abstract.

const WORDS_PER_MINUTE = 225;

const clean = (value?: string) => value?.trim() || "";
const cleanList = (items?: string[]) =>
  (items ?? []).map((item) => clean(item)).filter(Boolean);

// Ends a fragment with a full stop unless it already has end punctuation
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`);

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length;

const minutesFor = (words: number) =>
  Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

// Portable Text body -> reading time in minutes (text blocks and code)
export function readingMinutes(blocks: any[] | undefined): number {
  const words = (blocks ?? []).reduce((total, block) => {
    if (block?._type === "block")
      return (
        total +
        countWords(
          (block.children ?? []).map((c: any) => c?.text ?? "").join(" "),
        )
      );
    if (block?._type === "code") return total + countWords(block.code ?? "");
    return total;
  }, 0);
  return minutesFor(words);
}

export function projectTldr(project: any) {
  const tldr = project?.projectTldr ?? {};
  return {
    problem: clean(tldr.problem),
    built: cleanList(tldr.built),
    outcome: clean(tldr.outcome),
  };
}

export function articleTldr(article: any) {
  const tldr = article?.articleTldr ?? {};
  const code = tldr.snippet?.code?.trim();
  return {
    takeaways: cleanList(tldr.takeaways),
    snippet: code ? { ...tldr.snippet, code } : null,
  };
}

export function projectTldrText(project: any): string {
  const { problem, built, outcome } = projectTldr(project);
  return [problem, ...built, outcome].filter(Boolean).map(sentence).join(" ");
}

export function articleTldrText(article: any): string {
  return articleTldr(article).takeaways.map(sentence).join(" ");
}

export const hasProjectTldr = (project: any) =>
  Boolean(projectTldrText(project));

export const hasArticleTldr = (article: any) => {
  const { takeaways, snippet } = articleTldr(article);
  return takeaways.length > 0 || Boolean(snippet);
};

export const projectTldrMinutes = (project: any) =>
  minutesFor(countWords(projectTldrText(project)));

export const articleTldrMinutes = (article: any) => {
  const { snippet } = articleTldr(article);
  return minutesFor(
    countWords(`${articleTldrText(article)} ${snippet?.code ?? ""}`),
  );
};
