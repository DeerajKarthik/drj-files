/** Single source of truth for site-wide copy and settings. */
export type ThemeName = 'paper' | 'night';

export interface Link {
  label: string;
  href: string;
}

export const config = {
  siteName: "Deeraj's Notebook",
  tagline: 'Research notes and creative writing.',
  description:
    'Technical research notes and creative writing, from machine unlearning and fairness to essays, poems and design experiments, by S K Deeraj.',
  author: 'S K Deeraj',
  locale: 'en',
  /** 'paper' | 'night'. Used on first visit when the reader has no saved choice and no OS preference. */
  defaultTheme: 'paper' as ThemeName,
  /** Honour the OS colour scheme on first visit. Set to false to always start on `defaultTheme`. */
  followSystemTheme: true,
  strip: {
    label: 'CURRENTLY:',
    text: 'Writing up notes on certified machine unlearning',
    href: '/writing/unlearning-guarantees',
  },
  nav: [
    { label: 'Research', href: '/research' },
    { label: 'Creative', href: '/creative' },
  ] satisfies Link[],
  socials: [
    { label: 'GitHub', href: 'https://github.com/DeerajKarthik' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/s-k-deeraj' },
    { label: 'X', href: 'https://x.com/skdeeraj' },
  ] satisfies Link[],
  email: 'deerajsk2006@gmail.com',
  /** Commented privacy-friendly analytics slot: see BaseHead.astro. */
  analytics: null as null | { src: string; domain: string },
} as const;

/** Browser-chrome colour per theme (<meta name="theme-color">). */
export const themeColors = { paper: '#202527', night: '#0f1112' } as const satisfies Record<ThemeName, string>;

export const sections = {
  research: {
    key: 'research',
    label: 'Research',
    tag: 'RESEARCH',
    href: '/research',
    blurb: 'Paper notes, experiments and write-ups, heavy on math and code.',
  },
  creative: {
    key: 'creative',
    label: 'Creative',
    tag: 'CREATIVE',
    href: '/creative',
    blurb: 'Essays, poems, stories and design experiments.',
  },
} as const;

export type SectionKey = keyof typeof sections;
export const sectionKeys = Object.keys(sections) as SectionKey[];
