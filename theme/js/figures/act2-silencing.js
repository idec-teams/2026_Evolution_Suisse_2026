/* ═══════════════════════════════════════════════════════════════════════════
   Act 2 — Silence.

   dCas9, guided by sgRNA to the resistance gene, obstructs elongating RNA
   polymerase at the R-loop. Repression is kinetic, not absolute: output falls
   below the threshold the selective agent demands, and the cell dies.

   Canvas 2D reference implementation for the figure contract. The particle
   field is shared with act 3 (see complexes.js).
   ═══════════════════════════════════════════════════════════════════════════ */

import { clamp, lerp, norm, smoothstep, alpha, viewTransform } from '../util.js';
import { makeComplexes, placeComplex, drawComplex, OPERATOR, CELL } from './complexes.js';

/** Shared across acts 2 and 3 so the same objects persist between them. */
export const field = makeComplexes(11);

/** Draw the cell envelope, resistance locus and output bar. Shared with act 3.
    All dimensions come from CELL so acts 2 and 3 stay registered to each other. */
export function drawCell(g, pal, { viability = 1, output = 1, glow = 0 } = {}) {
  const { x, y, w, h, r } = CELL;

  const envelope = () => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y,     x + w, y + h, r);
    g.arcTo(x + w, y + h, x,     y + h, r);
    g.arcTo(x,     y + h, x,     y,     r);
    g.arcTo(x,     y,     x + w, y,     r);
    g.closePath();
  };

  // Membrane + cytoplasm. Fill tint carries viability, nothing else.
  g.lineWidth = 0.7;
  g.strokeStyle = pal.ruleStrong;
  g.fillStyle = alpha(viability > 0.5 ? pal.resist : pal.dead, 0.07);
  envelope();
  g.fill();
  g.stroke();

  // Resistance locus
  const lx0 = x + 6, lx1 = x + w - 6;
  g.strokeStyle = pal.rule;
  g.lineWidth = 1.1;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(lx0, OPERATOR.y);
  g.lineTo(lx1, OPERATOR.y);
  g.stroke();

  // Operator: the segment dCas9 occludes. Opacity tracks output.
  g.strokeStyle = alpha(pal.resist, lerp(0.22, 1, output));
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(OPERATOR.x - 6, OPERATOR.y);
  g.lineTo(OPERATOR.x + 6, OPERATOR.y);
  g.stroke();

  // Output bar — resistance protein level, with the survival threshold marked.
  const bx = lx0, bw = lx1 - lx0, by = y + h - 6, bh = 1.8;
  g.fillStyle = alpha(pal.inkFaint, 0.16);
  g.fillRect(bx, by, bw, bh);
  g.fillStyle = output > 0.42 ? pal.resist : pal.mutate;
  g.fillRect(bx, by, bw * clamp(output), bh);

  g.strokeStyle = pal.inkMuted;
  g.lineWidth = 0.45;
  g.beginPath();
  g.moveTo(bx + bw * 0.42, by - 1.4);
  g.lineTo(bx + bw * 0.42, by + bh + 1.4);
  g.stroke();

  // Survival halo, act 3 only.
  if (glow > 0) {
    g.strokeStyle = alpha(pal.resist, glow * 0.5);
    g.lineWidth = 0.7 + glow * 1.8;
    envelope();
    g.stroke();
  }
}

export default {
  id: 'act2-silencing',
  needs: 'canvas',

  mount() { /* nothing to build: canvas is redrawn each frame */ },

  render(t, ctx) {
    const g = ctx.c2d, pal = ctx.palette, rect = ctx.rect;
    viewTransform(g, rect);
    g.clearRect(0, 0, 100, 100);

    // 0.00–0.25  complexes diffuse freely, gene fully expressed
    // 0.25–0.70  complexes home in on the operator
    // 0.55–1.00  output collapses below threshold, cell desaturates
    const bind   = norm(t, 0.20, 0.78);
    const output = 1 - 0.92 * smoothstep(norm(t, 0.42, 0.92));
    const viab   = output > 0.42 ? 1 : 0;

    // Diffusion clock advances with scroll, so it is exact under scrubbing.
    const d = t * 9;

    drawCell(g, pal, { viability: viab, output });

    for (const p of field) {
      const pos = placeComplex(p, d, bind, 0);
      drawComplex(g, p, pos, pal, alpha, lerp(0.55, 1, pos.bound));
    }
  },

  resize() { /* viewTransform recomputes from ctx.rect each frame */ },
};
