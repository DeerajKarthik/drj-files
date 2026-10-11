/**
 * Run `init` now and after every client-side navigation (Astro's <ClientRouter />).
 * Initialisers must be idempotent: they may run twice on the first page load.
 */
export function onPage(init: () => void): void {
  init();
  document.addEventListener('astro:page-load', init);
}

export const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function qsa<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}
