/* ═══════════════════════════════════════════════════════════════════════════
   hero-shell.js — the slowly rotating encapsulin shell in the hero.

   Same icosahedral subunit generator as act 3, rendered as SVG so it stays
   crisp at any size and costs nothing to keep on screen. Unlike the acts, its
   progress is driven by a clock rather than scroll, so `render(t)` ignores t
   and the animation loop owns the phase.
   ═══════════════════════════════════════════════════════════════════════════ */

import { el, TAU, lerp, reducedMotion } from '../util.js';

const PHI = (1 + Math.sqrt(5)) / 2;

function subunits() {
  const v = [];
  for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    v.push([0, s1, s2 * PHI], [s1, s2 * PHI, 0], [s2 * PHI, 0, s1]);
  }
  const n = Math.hypot(0, 1, PHI);
  const verts = v.map(([x, y, z]) => [x / n, y / n, z / n]);

  const out = [];
  for (const [vx, vy, vz] of verts) {
    const up = Math.abs(vz) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const ax = [up[1] * vz - up[2] * vy, up[2] * vx - up[0] * vz, up[0] * vy - up[1] * vx];
    const al = Math.hypot(...ax);
    const a = ax.map(c => c / al);
    const b = [vy * a[2] - vz * a[1], vz * a[0] - vx * a[2], vx * a[1] - vy * a[0]];
    for (let k = 0; k < 5; k++) {
      const th = (k / 5) * TAU, tilt = 0.36;
      const p = [
        vx + (a[0] * Math.cos(th) + b[0] * Math.sin(th)) * tilt,
        vy + (a[1] * Math.cos(th) + b[1] * Math.sin(th)) * tilt,
        vz + (a[2] * Math.cos(th) + b[2] * Math.sin(th)) * tilt,
      ];
      const n2 = Math.hypot(...p);
      out.push(p.map(c => c / n2));
    }
  }
  return out;
}

const UNITS = subunits();
const CX = 50, CY = 50, RAD = 34;

export default {
  id: 'hero-shell',
  needs: 'svg',
  viewBox: '0 0 100 100',

  mount(ctx) {
    const p = ctx.palette;
    this.g = el('g');

    // A single silhouette ring at the shell's equator reads as a sphere edge;
    // extra concentric circles just look like a target.
    this.g.appendChild(el('circle', {
      cx: CX, cy: CY, r: RAD, fill: 'none',
      stroke: p.rule, 'stroke-width': 0.6,
    }));

    this.nodes = UNITS.map(() => {
      const c = el('circle', { r: 2, fill: p.shell });
      this.g.appendChild(c);
      return c;
    });
    ctx.svg.appendChild(this.g);

    // Clock-driven, not scroll-driven.
    this.phase = 0;
    if (!reducedMotion()) {
      let last = performance.now();
      const loop = now => {
        this.raf = requestAnimationFrame(loop);
        this.phase += (now - last) / 26000 * TAU;
        last = now;
        this.draw();
      };
      this.raf = requestAnimationFrame(loop);
    }
  },

  draw() {
    const cosA = Math.cos(this.phase), sinA = Math.sin(this.phase);
    const proj = UNITS.map((u, i) => {
      const rx = u[0] * cosA + u[2] * sinA;
      const rz = -u[0] * sinA + u[2] * cosA;
      const ry = u[1] * 0.92 - rz * 0.39;
      const rz2 = u[1] * 0.39 + rz * 0.92;
      return { i, x: CX + rx * RAD, y: CY + ry * RAD, z: rz2 };
    }).sort((a, b) => a.z - b.z);

    // Re-append in back-to-front order every frame. appendChild moves an existing
    // node to the end, so this both reorders and paints correctly; comparing
    // against the previous order and appending selectively does NOT work,
    // because each move shifts the indices of everything after it.
    for (const s of proj) {
      const node = this.nodes[s.i];
      const depth = (s.z + 1) / 2;           // 0 = far side, 1 = near side
      node.setAttribute('cx', s.x.toFixed(2));
      node.setAttribute('cy', s.y.toFixed(2));
      node.setAttribute('r', lerp(1.05, 2.9, depth * depth).toFixed(2));
      node.setAttribute('opacity', lerp(0.14, 1, depth * depth).toFixed(3));
      this.g.appendChild(node);
    }
  },

  // Scroll progress is irrelevant here; draw once so the static/reduced-motion
  // case still shows a fully-formed shell rather than nothing.
  render() { if (!this.raf) this.draw(); },

  destroy() { if (this.raf) cancelAnimationFrame(this.raf); },
};
