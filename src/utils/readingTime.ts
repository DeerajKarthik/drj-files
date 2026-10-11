const WORDS_PER_MINUTE = 230;

/** Estimated minutes to read an MDX/Markdown body (imports, tags and fences' fence lines excluded). */
export function readingTime(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' math ')
    .replace(/```[^\n]*\n/g, '\n')
    .replace(/[#>*_`|\\-]+/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
