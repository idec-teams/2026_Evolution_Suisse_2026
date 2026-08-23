/* ═══════════════════════════════════════════════════════════════════════════
   Act 1 — Diversify.

   MutaT7's deaminase-fused T7 polymerase tracks along the encapsulin cassette
   and mutates it processively; the rest of the plasmid, transcribed by host
   machinery, is untouched.

   Everything is drawn from parametric circle maths — no traced paths, no
   image assets. SVG reference implementation for the figure contract.
   ═══════════════════════════════════════════════════════════════════════════ */

import { el, TAU, clamp, lerp, norm, easeOut, smoothstep, rng } from '../util.js';

const R = 34;            // plasmid radius in viewBox units
const CX = 50, CY = 50;
const CASSETTE = [-0.28, 0.30];   // cassette arc, in turns from 12 o'clock

const pt = (a, r = R) => [CX + Math.cos(a * TAU - Math.PI / 2) * r,
                          CY + Math.sin(a * TAU - Math.PI / 2) * r];

/** Arc path between two turn positions. */
function arc(a0, a1, r = R) {
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  const large = Math.abs(a1 - a0) > 0.5 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

export default {
  id: 'act1-hypermutation',
  needs: 'svg',
  viewBox: '0 0 100 100',

  mount(ctx) {
    const p = ctx.palette;
    const g = el('g');

    // Backbone
    g.appendChild(el('circle', { cx: CX, cy: CY, r: R, fill: 'none',
                                 stroke: p.rule, 'stroke-width': 2.4 }));

    // The T7-driven cassette: the only region that gets mutated.
    this.cassette = el('path', { d: arc(...CASSETTE), fill: 'none',
                                 stroke: p.shell, 'stroke-width': 3.4,
                                 'stroke-linecap': 'round', opacity: 0 });
    g.appendChild(this.cassette);

    // T7 promoter tick
    const [px, py] = pt(CASSETTE[0]);
    this.promoter = el('g', { opacity: 0 });
    this.promoter.appendChild(el('circle', { cx: px, cy: py, r: 2.6, fill: p.paper,
                                             stroke: p.accent, 'stroke-width': 1.6 }));
    g.appendChild(this.promoter);

    // Polymerase
    this.pol = el('g', { opacity: 0 });
    this.pol.appendChild(el('circle', { r: 4.4, fill: p.paper, stroke: p.cas, 'stroke-width': 1.8 }));
    this.pol.appendChild(el('circle', { r: 1.7, fill: p.cas }));
    g.appendChild(this.pol);

    // Mutation marks laid down behind the polymerase.
    this.marks = [];
    const rand = rng(7);
    for (let i = 0; i < 26; i++) {
      const at = lerp(CASSETTE[0], CASSETTE[1], (i + 0.5) / 26);
      const [x, y] = pt(at, R);
      const jitter = (rand() - 0.5) * 1.2;
      const m = el('circle', { cx: x + jitter, cy: y + jitter, r: 0, fill: p.mutate });
      this.marks.push({ node: m, at: (i + 0.5) / 26 });
      g.appendChild(m);
    }

    // Variant cloud: the diversified library blooming outward.
    this.variants = [];
    const vr = rng(31);
    for (let i = 0; i < 44; i++) {
      const a = vr(), dist = 44 + vr() * 26, sz = 1.1 + vr() * 1.8;
      const node = el('circle', { r: sz, fill: p.shell, opacity: 0 });
      this.variants.push({ node, a, dist, delay: vr() * 0.5, sz });
      g.appendChild(node);
    }

    ctx.svg.appendChild(g);
  },

  render(t, ctx) {
    // 0.00–0.18  plasmid + cassette resolve
    // 0.15–0.70  polymerase tracks, laying mutations behind it
    // 0.55–1.00  variant cloud blooms outward
    const reveal = smoothstep(norm(t, 0, 0.18));
    this.cassette.setAttribute('opacity', reveal);
    this.promoter.setAttribute('opacity', reveal);

    const track = norm(t, 0.15, 0.70);
    this.pol.setAttribute('opacity', String(clamp(reveal - norm(t, 0.72, 0.85))));
    const [x, y] = pt(lerp(CASSETTE[0], CASSETTE[1], track));
    this.pol.setAttribute('transform', `translate(${x} ${y})`);

    for (const m of this.marks) {
      // A mark appears once the polymerase has passed its position.
      const on = easeOut(norm(track, m.at - 0.04, m.at + 0.06));
      m.node.setAttribute('r', (0.9 * on).toFixed(3));
      m.node.setAttribute('opacity', (0.85 * on).toFixed(3));
    }

    for (const v of this.variants) {
      const bloom = easeOut(norm(t, 0.55 + v.delay * 0.3, 0.95));
      const a = v.a * TAU;
      const d = lerp(R, v.dist, bloom);
      v.node.setAttribute('cx', (CX + Math.cos(a) * d).toFixed(2));
      v.node.setAttribute('cy', (CY + Math.sin(a) * d).toFixed(2));
      v.node.setAttribute('opacity', (bloom * 0.5 * (1 - bloom * 0.35)).toFixed(3));
    }
  },
};
