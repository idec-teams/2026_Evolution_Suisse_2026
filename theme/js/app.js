/* ═══════════════════════════════════════════════════════════════════════════
   app.js — entry point. Loaded as a module, so it is deferred by default.
   ═══════════════════════════════════════════════════════════════════════════ */

import { initDrawer, initMasthead, initTocSpy } from './nav.js';
import { initSearch } from './search.js';
import { wrapTables, sortableTables } from './tables.js';
import { mountStandalone } from './figure.js';
import { initScrolly } from './scrolly.js';
import './figures/index.js';           // side effect: registers every figure

function boot() {
  initMasthead();
  initDrawer();
  initSearch();
  initTocSpy();

  wrapTables();
  sortableTables();

  // The pinned homepage story, if this page has one.
  initScrolly(document.querySelector('[data-scrolly]'));

  // Every other [data-figure] block, driven by its own visibility.
  mountStandalone();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
