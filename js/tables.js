/* ═══════════════════════════════════════════════════════════════════════════
   tables.js — scroll containment and column sorting.

   Replaces the template's tablesort CDN dependency and its Material-only
   `document$.subscribe(...)` wrapper, which would throw a ReferenceError on
   every page of a bespoke theme.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Wrap wide tables so THEY scroll, not the page. role+tabindex keep the
    scroll region reachable by keyboard, which display:block would not. */
export function wrapTables(scope = document) {
  for (const table of scope.querySelectorAll('.prose > table, .prose table:not(.highlighttable)')) {
    if (table.closest('.table-scroll') || table.closest('.highlighttable')) continue;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll wide';
    wrap.tabIndex = 0;
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-label', 'Scrollable table');
    table.replaceWith(wrap);
    wrap.appendChild(table);
  }
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/** Numeric when every cell parses as a number, otherwise natural-order text. */
function comparatorFor(rows, index) {
  const values = rows.map(r => (r.cells[index]?.textContent || '').trim());
  const numeric = values.every(v => v === '' || !Number.isNaN(Number(v.replace(/[,\s%]/g, ''))));
  if (numeric) {
    const num = v => Number(v.replace(/[,\s%]/g, '')) || 0;
    return (a, b) => num(a.cells[index].textContent.trim()) - num(b.cells[index].textContent.trim());
  }
  return (a, b) => collator.compare(
    a.cells[index]?.textContent.trim() || '',
    b.cells[index]?.textContent.trim() || '');
}

export function sortableTables(scope = document) {
  for (const table of scope.querySelectorAll('.prose table:not(.highlighttable)')) {
    const head = table.tHead;
    const body = table.tBodies[0];
    if (!head || !body || body.rows.length < 2) continue;

    [...head.rows[0].cells].forEach((th, index) => {
      th.dataset.sort = '';
      th.tabIndex = 0;
      th.setAttribute('role', 'button');

      const run = () => {
        const rows = [...body.rows];
        const asc = th.getAttribute('aria-sort') !== 'ascending';
        const cmp = comparatorFor(rows, index);
        rows.sort((a, b) => asc ? cmp(a, b) : cmp(b, a));
        for (const th2 of head.rows[0].cells) th2.removeAttribute('aria-sort');
        th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
        rows.forEach(r => body.appendChild(r));
      };

      th.addEventListener('click', run);
      th.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
      });
    });
  }
}
