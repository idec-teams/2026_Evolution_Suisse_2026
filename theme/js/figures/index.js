/* ═══════════════════════════════════════════════════════════════════════════
   figures/index.js — the figure registry.

   ADDING A FIGURE: write the module, import it here, add it to the array.
   That is the whole registration step.
   ═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../figure.js';

import heroCapsid from './hero-capsid.js';
import cellScene  from './cell-scene.js';
import systemMap  from './system-map.js';

for (const fig of [heroCapsid, cellScene, systemMap]) register(fig);

export { heroCapsid, cellScene, systemMap };
