# Decisions

Where the brief was silent, contradictory, or unachievable, this is what was chosen.

- **Versions pinned** (Astro 5.18.2, `@astrojs/mdx` 4.3.14: the 8.x line requires Astro 7). Newsreader was *not* installed contrary to the brief; it is now a dependency but only wired in via `--font-body`.
- **No git repo** existed, so no commits were made.
- **Contrast:** `--ink-muted` / `--ink-faint` are darker than the brief's values (`hsl(30 12% 18%)` / `hsl(30 10% 25%)`) and `--accent` is `hsl(18 66% 31%)`, because the specified values failed WCAG AA on parchment. Night `--ink-faint` lightened for the same reason.
- **Theme on first visit:** `followSystemTheme: true` honours `prefers-color-scheme`, otherwise `defaultTheme` applies. Set it to `false` to always start on `defaultTheme`.
- **Vignette** is a viewport-fixed pseudo-element (so it does not stretch on tall pages); grain/fibre scroll with the sheet.
- **OG images** use `satori` + `sharp` (woff fonts from Fontsource), not astro-og-canvas. `/og/default.png` is the fallback card; `apple-touch-icon.png` and `robots.txt` are generated endpoints so they respect `site`/`base`.
- **KaTeX CSS** is copied from `node_modules` to `public/katex` (woff2 only) by `scripts/copy-katex.mjs` before dev/build, and linked only when a post sets `math: true`.
- **Code titles:** a Shiki transformer reads `title="..."`; `pre` is mapped to `CodeBlock`. Two hand-tuned Shiki themes meet AA.
- **TOC observer:** a zero-height `rootMargin: "-50% 0px"` never fires crossing events, so the root is the viewport's upper half (`0px 0px -50% 0px`) plus a `scrollend` recompute. TOC sticks at `top: 4.5rem` (not 1.5rem) so the returning header never covers it.
- **Hover swap** renders the ink drawing once and fades an annotated overlay group; posts with `cover`/`coverHover` use two stacked images.
- **Section filter** on `/writing` is links to the section pages (works without JS), upgraded to in-page filtering with `#section` hashes.
- **Mobile menu** is a `button` enhanced by JS; without JS the links are always shown.
- **Contact:** real email, GitHub and LinkedIn are set in `src/config.ts`. About bio and portrait remain placeholders. Sample posts are original sample text.
- **Lighthouse (mobile, local preview):** home 100/100/100/100; post 98/100/100/100 (performance/accessibility/best practices/SEO).
- **Sections:** only `research` and `creative`. Essays are creative writing here, so the `essays` section was removed.
