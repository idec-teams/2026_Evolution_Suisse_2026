/* ═══════════════════════════════════════════════════════════════════════════
   system-map.js — the clickable overview diagram.

   THE REUSABLE HOTSPOT PATTERN. Each subsystem is a real <a> element wrapping
   its SVG region, so it is focusable, announced, right-clickable and
   middle-clickable exactly like any other link — no click handlers, no
   keyboard emulation, no ARIA patching.

   Destinations come from the host element's data-hotspots attribute, so the
   diagram's links are edited in the template, not in this file:

     <div data-figure="system-map" data-hotspots='[
       {"id":"shell","label":"Encapsulin shell","href":"project/design/"}
     ]'></div>

   An `id` with no matching region in the drawing is ignored; a region with no
   matching entry simply renders as inert scenery. The same destinations are
   ALSO listed as plain text links beside the figure in home.html — the graphic
   is a second route to them, never the only one.
   ═══════════════════════════════════════════════════════════════════════════ */

import { el, TAU } from '../util.js';

/* The viewBox is cropped to the drawing's actual extent (labels included).
   A looser box would letterbox the diagram inside its container and open a
   dead band of whitespace above and below it. .systemmap__figure's
   aspect-ratio in home.css must match these numbers. */
const VB = { w: 160, h: 76 };

/* Region geometry, in viewBox units. The 160x90 box renders at ~990 px wide,
   so one unit is ~6 px: keep radii around 10 and strokes under 1, or the
   diagram reads as clip-art. Labels sit below each node and need ~9 units of
   clearance, which sets the vertical spacing. */
const REGIONS = {
  plasmids:  { x: 26,  y: 36, r: 11 },
  mutat7:    { x: 67,  y: 16, r: 10 },
  selection: { x: 67,  y: 55, r: 10 },
  shell:     { x: 124, y: 35, r: 13 },
};

function baseUrlPrefix() {
  // The pages that host this figure live at the site root, so relative hrefs
  // from data-hotspots resolve correctly as-is. Kept explicit for clarity.
  return (typeof base_url !== 'undefined' ? base_url : '.').replace(/\/?$/, '/');
}

export default {
  id: 'system-map',
  needs: 'svg',
  viewBox: `0 0 ${VB.w} ${VB.h}`,

  mount(ctx) {
    const p = ctx.palette;
    let spec = [];
    try { spec = JSON.parse(ctx.root.dataset.hotspots || '[]'); }
    catch { console.warn('[system-map] data-hotspots is not valid JSON'); }

    const root = el('g');

    /* ── Connectors, drawn first so they sit behind the nodes ───────────── */
    const links = [
      ['plasmids', 'mutat7'], ['mutat7', 'shell'],
      ['plasmids', 'selection'], ['selection', 'shell'],
    ];
    for (const [a, b] of links) {
      const A = REGIONS[a], B = REGIONS[b];
      if (!A || !B) continue;
      const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2 - 6;
      root.appendChild(el('path', {
        d: `M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`,
        fill: 'none', stroke: p.rule, 'stroke-width': 0.7,
        'stroke-dasharray': '1.8 2',
      }));
    }

    /* ── Hotspots ───────────────────────────────────────────────────────── */
    const prefix = baseUrlPrefix();
    for (const spot of spec) {
      const R = REGIONS[spot.id];
      if (!R) continue;

      const a = el('a', {
        class: 'hotspot',
        href: prefix + String(spot.href).replace(/^\//, ''),
        'aria-label': spot.label,
      });

      a.appendChild(el('circle', {
        cx: R.x, cy: R.y, r: R.r,
        fill: p.paper, stroke: p.ruleStrong, 'stroke-width': 0.8,
      }));
      a.appendChild(el('circle', {
        class: 'hotspot__hit', cx: R.x, cy: R.y, r: R.r + 2.5,
      }));

      // Glyph — a distinct mark per subsystem, so shape co-encodes with hue.
      a.appendChild(glyph(spot.id, R, p));

      const label = el('text', {
        class: 'hotspot__label',
        x: R.x, y: R.y + R.r + 5.5,
        'text-anchor': 'middle',
        fill: p.inkMuted,
        'font-size': 3.4,
        'font-family': 'var(--font-mono)',
      });
      label.textContent = spot.label;
      a.appendChild(label);

      root.appendChild(a);
    }

    ctx.svg.appendChild(root);
  },

  render() { /* static diagram: no scroll-driven state */ },
};

/** Per-subsystem mark. Shape carries identity alongside hue. */
function glyph(id, R, p) {
  const g = el('g', { fill: 'none', 'stroke-width': 0.9, 'stroke-linejoin': 'round' });
  const s = R.r * 0.45;

  if (id === 'plasmids') {
    g.appendChild(el('circle', { cx: R.x, cy: R.y, r: s, stroke: p.accent }));
    g.appendChild(el('path', {
      d: `M ${R.x - s} ${R.y} a ${s} ${s} 0 0 1 ${s * 1.4} ${-s * 0.72}`,
      stroke: p.mutate, 'stroke-width': 1.5, 'stroke-linecap': 'round',
    }));
  } else if (id === 'mutat7') {
    g.appendChild(el('path', {
      d: `M ${R.x - s} ${R.y + s * 0.6} L ${R.x} ${R.y - s * 0.8} L ${R.x + s} ${R.y + s * 0.6}`,
      stroke: p.cas,
    }));
    g.appendChild(el('circle', { cx: R.x, cy: R.y - s * 0.8, r: 1.1, fill: p.mutate, stroke: 'none' }));
  } else if (id === 'shell') {
    for (let k = 0; k < 6; k++) {
      const th = (k / 6) * TAU;
      g.appendChild(el('circle', {
        cx: R.x + Math.cos(th) * s, cy: R.y + Math.sin(th) * s,
        r: 1.2, fill: p.shell, stroke: 'none',
      }));
    }
    g.appendChild(el('circle', { cx: R.x, cy: R.y, r: s, stroke: p.shell, 'stroke-dasharray': '1 1.2' }));
  } else if (id === 'selection') {
    g.appendChild(el('path', { d: `M ${R.x - s} ${R.y} H ${R.x + s}`, stroke: p.resist, 'stroke-width': 1.5 }));
    g.appendChild(el('circle', { cx: R.x, cy: R.y - s * 0.5, r: 1.7, fill: p.cas, stroke: 'none' }));
  }
  return g;
}
