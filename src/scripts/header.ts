import { onPage, qsa } from './lifecycle';

const MOBILE = '(max-width: 719.98px)';

function setupMenu(header: HTMLElement): void {
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel || toggle.dataset.bound) return;
  toggle.dataset.bound = 'true';

  const setOpen = (open: boolean, restoreFocus = false): void => {
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (!open && restoreFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

  header.addEventListener('keydown', (event) => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    if (!open) return;
    if (event.key === 'Escape') {
      setOpen(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = qsa<HTMLElement>('a[href], button', header).filter((el) => el.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  panel.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });
  window.matchMedia(MOBILE).addEventListener('change', (e) => {
    if (!e.matches) setOpen(false);
  });
}

/** The header is persisted across navigations, so refresh the current-page marker by hand. */
function updateCurrent(header: HTMLElement): void {
  const path = (p: string): string => (p.length > 1 ? p.replace(/\/$/, '') : p);
  const here = path(location.pathname);
  for (const link of qsa<HTMLAnchorElement>('a[href]', header)) {
    if (link.classList.contains('skip-link')) continue;
    const target = path(new URL(link.href, location.href).pathname);
    const isHome = link.classList.contains('brand');
    const active = isHome ? here === target : here === target || here.startsWith(`${target}/`);
    if (active && !link.pathname.endsWith('.xml')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

/** On post pages the header slides away while reading down and returns on scroll up. */
let lastY = 0;
let ticking = false;
function onScroll(): void {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    if (!header || document.body.dataset.page !== 'post') return;
    const y = window.scrollY;
    const delta = y - lastY;
    const menuOpen = header.querySelector('.is-open') !== null;
    if (Math.abs(delta) > 6) {
      const hide = delta > 0 && y > header.offsetHeight * 2 && !menuOpen && !header.contains(document.activeElement);
      header.toggleAttribute('data-hidden', hide);
      lastY = y;
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
document.addEventListener('focusin', (event) => {
  if (event.target instanceof Node) document.querySelector('[data-site-header]')?.removeAttribute('data-hidden');
});

onPage(() => {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;
  setupMenu(header);
  updateCurrent(header);
  header.removeAttribute('data-hidden');
  lastY = window.scrollY;
});
