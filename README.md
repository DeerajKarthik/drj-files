# Deeraj's Notebook

An "aged paper" editorial writing site built with Astro 5, MDX, plain CSS, Shiki and KaTeX. Static output, no runtime services.

## Run it

```bash
npm install
npm run dev        # http://localhost:4321 (drafts visible)
npm run build      # static site in dist/
npm run preview
npx astro check    # types
```

Node 20+.

## Configure

Everything site-wide lives in [src/config.ts](src/config.ts): `siteName`, `tagline`, `author`, `defaultTheme` (`'paper' | 'night'`), `followSystemTheme`, `strip`, `nav`, `socials`, `email`, `analytics`.
Body font: change `--font-body` in [src/styles/tokens.css](src/styles/tokens.css) to `var(--font-serif)` (Newsreader; also add `import '@fontsource-variable/newsreader/wght.css'` to base.css).

Deployment URL and sub-path come from the environment (see `.env.example`):

| Variable | Example |
|---|---|
| `PUBLIC_SITE_URL` | `https://you.github.io` |
| `PUBLIC_BASE_PATH` | `/repo-name` (empty at a domain root) |

## Deploy (one command or one push)

- **GitHub Pages:** push to `main`; `.github/workflows/deploy.yml` builds and publishes. Enable Pages → Source: GitHub Actions.
- **Cloudflare Pages / Vercel:** build command `npm run build`, output `dist`, set `PUBLIC_SITE_URL`.

## Add a post

Create `src/content/writing/my-post.mdx` (the filename is the slug):

```mdx
---
title: My post
description: One sentence, 200 characters max.
section: research        # research | creative
tags: [machine unlearning]
pubDate: 2026-10-11
# motif (cubes graph waves tunnel book contour constellation sphere hourglass scissors), updatedDate, featured, draft, math (true loads KaTeX CSS), cover, coverHover, coverAlt, coverCaption, canonicalUrl
---

## A heading
Text with $inline$ math, and components: <Callout>, <Figure>, <PullQuote>, <Aside>, <SectionBreak />, <Demo>, <Verse>.
```

Code fences accept a filename caption: ` ```python title="file.py" `. Without `cover`, an illustration is chosen from the section and slug.
