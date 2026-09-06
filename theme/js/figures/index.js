/* ═══════════════════════════════════════════════════════════════════════════
   figures/index.js — the figure registry.

   ADDING A FIGURE: write the module, import it here, add it to the array.
   That is the whole registration step.
   ═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../figure.js';

import heroCapsid from './hero-capsid.js';
import cellScene  from './cell-scene.js';

for (const fig of [heroCapsid, cellScene]) register(fig);

export { heroCapsid, cellScene };
