/* ═══════════════════════════════════════════════════════════════════════════
   figures/index.js — the figure registry.

   ADDING A FIGURE: write the module, import it here, add it to the array.
   That is the whole registration step.
   ═══════════════════════════════════════════════════════════════════════════ */

import { register } from '../figure.js';

import heroShell   from './hero-shell.js';
import systemMap   from './system-map.js';
import act1        from './act1-hypermutation.js';
import act2        from './act2-silencing.js';
import act3        from './act3-rescue.js';
import act4        from './act4-enrichment.js';

for (const fig of [heroShell, systemMap, act1, act2, act3, act4]) register(fig);

export { act1, act2, act3, act4, heroShell, systemMap };
