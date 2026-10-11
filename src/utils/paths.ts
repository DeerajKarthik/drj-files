/** Base-path aware URL helpers. Every internal href and asset goes through these. */
const rawBase = import.meta.env.BASE_URL;
const base = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

/** Internal page URL. Page routes get a trailing slash (static directory output); files and hashes do not. */
export function href(path: string): string {
  if (/^(?:[a-z]+:|#|mailto:)/i.test(path)) return path;
  const [pathname = '', rest = ''] = path.split(/(?=[?#])/);
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  const withSlash = isFile || clean.endsWith('/') ? clean : `${clean}/`;
  return `${base}${withSlash}${rest}`;
}

/** Absolute URL for canonical tags, RSS, JSON-LD and OG images. */
export function absoluteUrl(path: string): string {
  const site = import.meta.env.SITE ?? 'http://localhost:4321';
  return new URL(href(path), site).href;
}

/** True when `current` (a pathname) is the page `target` or below it. */
export function isActive(current: string, target: string): boolean {
  const normalise = (p: string) => (p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p);
  const a = normalise(current);
  const b = normalise(href(target));
  return a === b || a.startsWith(`${b}/`);
}

/** Canonical absolute URL for a rendered pathname (which already includes the base). */
export function canonicalFor(pathname: string): string {
  const isFile = /\.[a-z0-9]+$/i.test(pathname);
  const withSlash = isFile || pathname.endsWith('/') ? pathname : `${pathname}/`;
  return new URL(withSlash, import.meta.env.SITE ?? 'http://localhost:4321').href;
}
