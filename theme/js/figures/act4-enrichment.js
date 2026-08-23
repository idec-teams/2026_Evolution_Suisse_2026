/* ═══════════════════════════════════════════════════════════════════════════
   Act 4 — Enrich.

   Because the coupling is continuous, every generation is a selection step.
   Each dot is a variant: x is encapsulation efficiency, y is survival. Rounds
   sweep the distribution rightward and tighten it.

   The population is drawn from a seeded PRNG, so the same variants appear in
   the same places on every load and at every scroll position.
   ═══════════════════════════════════════════════════════════════════════════ */

import { clamp, lerp, norm, smoothstep, alpha, rng, gaussian, viewTransform, TAU } from '../util.js';

const N = 320;
const ROUNDS = 4;

// Plot frame in viewBox units
const L = 18, R = 88, T = 16, B = 78;
const sx = v => lerp(L, R, clamp(v));
const sy = v => lerp(B, T, clamp(v));

export default {
  id: 'act4-enrichment',
  needs: 'canvas',

  mount() {
    const r = rng(2027);
    // Each variant has a latent "quality" that determines where it sits in
    // every round; selection shifts and narrows the distribution, it does not
    // reshuffle who is who.
    this.pop = Array.from({ length: N }, () => ({
      q:  clamp(0.5 + gaussian(r) * 0.16),
      jx: gaussian(r) * 0.035,
      jy: gaussian(r) * 0.075,
      lag: r(),
    }));
  },

  render(t, ctx) {
    const g = ctx.c2d, pal = ctx.palette;
    viewTransform(g, ctx.rect);
    g.clearRect(0, 0, 100, 100);

    const progress = smoothstep(clamp(t)) * ROUNDS;   // 0 → 4 rounds
    const round = Math.min(ROUNDS, Math.floor(progress) + 1);

    /* ── Axes ────────────────────────────────────────────────────────────── */
    g.strokeStyle = pal.rule;
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(L, T); g.lineTo(L, B); g.lineTo(R, B);
    g.stroke();

    // Survival threshold
    g.strokeStyle = alpha(pal.mutate, 0.5);
    g.setLineDash([1.6, 1.6]);
    g.lineWidth = 0.6;
    g.beginPath(); g.moveTo(L, sy(0.42)); g.lineTo(R, sy(0.42)); g.stroke();
    g.setLineDash([]);

    g.fillStyle = pal.inkFaint;
    g.font = '3.2px ui-monospace, monospace';
    g.textAlign = 'center';
    g.fillText('encapsulation efficiency →', (L + R) / 2, B + 7);
    g.save();
    g.translate(L - 7, (T + B) / 2);
    g.rotate(-Math.PI / 2);
    g.fillText('survival →', 0, 0);
    g.restore();

    /* ── Population ──────────────────────────────────────────────────────── */
    for (const v of this.pop) {
      // Selection: the mean walks right and the spread tightens with progress.
      const adv = clamp((progress - v.lag * 0.6) / ROUNDS);
      const eff = clamp(lerp(v.q * 0.45 + 0.06, v.q * 0.34 + 0.60, adv) + v.jx * (1 - adv * 0.6));
      const surv = clamp(eff * 1.35 - 0.18 + v.jy * (1 - adv * 0.5));
      const alive = surv > 0.42;

      g.fillStyle = alive ? alpha(pal.resist, 0.5) : alpha(pal.dead, 0.28);
      g.beginPath();
      g.arc(sx(eff), sy(surv), alive ? 0.85 : 0.6, 0, TAU);
      g.fill();
    }

    /* ── Round counter ───────────────────────────────────────────────────── */
    g.fillStyle = pal.accent;
    g.font = '600 4px ui-monospace, monospace';
    g.textAlign = 'right';
    g.fillText(`ROUND ${round}`, R, T - 3);

    // Mean marker
    const meanEff = clamp(lerp(0.285, 0.77, clamp(progress / ROUNDS)));
    g.strokeStyle = pal.accent;
    g.lineWidth = 0.9;
    g.beginPath();
    g.moveTo(sx(meanEff), B); g.lineTo(sx(meanEff), B + 2.4);
    g.stroke();
  },

  resize() {},
};
