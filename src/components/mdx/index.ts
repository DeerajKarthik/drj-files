import Callout from './Callout.astro';
import Figure from './Figure.astro';
import PullQuote from './PullQuote.astro';
import CodeBlock from './CodeBlock.astro';
import Aside from './Aside.astro';
import SectionBreak from './SectionBreak.astro';
import Demo from './Demo.astro';
import Verse from './Verse.astro';
import Table from './Table.astro';

/** Registered globally for every post: authors never import these. `pre` routes fenced code through CodeBlock and `table` through a scroll wrapper. */
export const mdxComponents = { Callout, Figure, PullQuote, CodeBlock, Aside, SectionBreak, Demo, Verse, pre: CodeBlock, table: Table };
