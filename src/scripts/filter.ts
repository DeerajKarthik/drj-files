import { onPage, qsa } from './lifecycle';

const VALID = new Set(['all', 'research', 'creative']);

function init(): void {
  const root = document.querySelector<HTMLElement>('[data-filter-root]');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = 'true';

  const controls = qsa<HTMLAnchorElement>('[data-filter]');
  const rows = qsa('[data-section]', root);
  const groups = qsa('[data-year-group]', root);
  const empty = root.querySelector<HTMLElement>('[data-filter-empty]');

  const apply = (value: string, push: boolean): void => {
    const key = VALID.has(value) ? value : 'all';
    for (const row of rows) row.hidden = key !== 'all' && row.dataset.section !== key;
    for (const group of groups) group.hidden = !qsa('[data-section]', group).some((r) => !r.hidden);
    if (empty) empty.hidden = rows.some((r) => !r.hidden);
    for (const control of controls) {
      if (control.dataset.filter === key) control.setAttribute('aria-current', 'true');
      else control.removeAttribute('aria-current');
    }
    if (push) history.replaceState(null, '', key === 'all' ? location.pathname : `#${key}`);
  };

  for (const control of controls) {
    control.addEventListener('click', (event) => {
      event.preventDefault();
      apply(control.dataset.filter ?? 'all', true);
    });
  }
  apply(location.hash.slice(1), false);
}

onPage(init);
